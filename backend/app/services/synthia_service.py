"""
backend/app/services/synthia_service.py

Synthia (Synthetic Intelligence Assistant) backend service.
Key requirements:
1. Powered by GROQ_ASSISTANT_API_KEY (strictly backend-only, dedicated assistant key).
2. Guided synthetic data AI guide: explains data, recommends synthetic columns, explains models, validation, and regeneration.
3. Multilingual assistance: English, Urdu, and Roman Urdu.
4. Structured configuration proposals: Proposes actions (e.g. add_synthetic_columns, configure_model), requires user confirmation, never silently mutates dataset.
5. Persists session and message history to Supabase when configured, with seamless in-memory fallback.
6. Zero secret leakage.
"""
from __future__ import annotations

import json
import logging
import time
import uuid
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.app.core.config import settings
from backend.app.ai.cache import ai_cache
from backend.app.services.supabase_service import supabase_service

logger = logging.getLogger("hackdata.synthia")

SYNTHIA_SYSTEM_PROMPT = """
You are Synthia (Synthetic Intelligence Assistant), an expert conversational guide embedded in the HackData V2 platform.
Your opening greeting is:
"Hi, I'm Synthia. How can I help you with your synthetic-data workflow?"

Your responsibilities:
1. Explain dataset profiles, distributions, data types, and quality findings.
2. Recommend high-value synthetic columns (e.g. salary_band, credit_score_category, tenure_months, churn_risk).
3. Guide users on model selection (Statistical Baseline vs CTGAN vs TVAE vs Deterministic).
4. Explain validation integrity checks and TSTR utility retention scores.
5. Explain diagnostic regeneration findings and suggested recovery strategies.
6. Support English, Urdu (اردو), and Roman Urdu seamlessly according to the user's input language.

CRITICAL ARCHITECTURAL CONSTRAINTS:
- You must NEVER directly modify datasets, execute arbitrary code, or run SQL.
- When suggesting schema or generation modifications, provide a structured action proposal so the UI can prompt the user for confirmation.
- Keep responses concise, friendly, and structured.

Always respond in valid JSON with two fields:
{
  "reply": "Your conversational explanation or guidance text here.",
  "language": "en" | "ur" | "roman_ur",
  "proposal": null | {
      "type": "configuration_proposal",
      "action": "add_synthetic_columns" | "select_model" | "apply_regeneration_strategy",
      "requires_confirmation": true,
      "columns": [
          {
              "name": "col_name",
              "data_type": "string" | "integer" | "float" | "categorical" | "date",
              "semantic_type": "semantic_label",
              "suggested_values": ["val1", "val2"]
          }
      ],
      "model_strategy": "ctgan" | "tvae" | "statistical",
      "parameters": {}
  }
}
"""


class SynthiaSession(BaseModel):
    session_id: str
    dataset_id: Optional[str] = None
    language: str = "en"
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)


class SynthiaMessage(BaseModel):
    message_id: str = Field(default_factory=lambda: f"msg_{uuid.uuid4().hex[:10]}")
    session_id: str
    role: str  # user, assistant, system
    content: str
    structured_action: Optional[Dict[str, Any]] = None
    created_at: float = Field(default_factory=time.time)


class SynthiaService:
    def __init__(self) -> None:
        self.api_key = settings.GROQ_ASSISTANT_API_KEY or settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self._groq_client = None
        self._sessions: Dict[str, SynthiaSession] = {}
        self._messages: Dict[str, List[SynthiaMessage]] = {}

        if self.api_key and self.api_key.strip():
            try:
                import groq
                self._groq_client = groq.Groq(api_key=self.api_key.strip(), timeout=20.0)
                logger.info("Synthia Groq client initialized successfully with dedicated assistant key.")
            except Exception as exc:
                logger.warning(f"Could not initialize Synthia Groq client: {exc}")

    def create_session(self, dataset_id: Optional[str] = None, language: str = "en") -> SynthiaSession:
        sid = f"syn_sess_{uuid.uuid4().hex[:10]}"
        session = SynthiaSession(session_id=sid, dataset_id=dataset_id, language=language)
        self._sessions[sid] = session
        self._messages[sid] = []

        # Persist to Supabase if available
        supabase_service.persist_assistant_session(session_id=sid, dataset_id=dataset_id, language=language)
        return session

    def get_session(self, session_id: str) -> Optional[SynthiaSession]:
        return self._sessions.get(session_id)

    def get_messages(self, session_id: str) -> List[SynthiaMessage]:
        return self._messages.get(session_id, [])

    def process_message(
        self,
        session_id: str,
        content: str,
        context: Optional[Dict[str, Any]] = None,
        language_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Process user query/transcript, evaluate context, and generate guided response.
        """
        session = self._sessions.get(session_id)
        if not session:
            session = self.create_session(language=language_override or "en")

        lang = language_override or session.language

        # Store user message
        user_msg = SynthiaMessage(session_id=session_id, role="user", content=content)
        self._messages.setdefault(session_id, []).append(user_msg)
        supabase_service.persist_assistant_message(
            message_id=user_msg.message_id,
            session_id=session_id,
            role="user",
            content=content,
        )

        # Build prompt with bounded context (no raw PII)
        bounded_context = self._format_context(context)

        system_instruction = SYNTHIA_SYSTEM_PROMPT
        user_prompt = f"User Message / Transcript: {content}\nDataset Context:\n{json.dumps(bounded_context, indent=2)}\nPreferred Language: {lang}"

        reply_text = ""
        action_proposal = None
        detected_lang = lang

        if self._groq_client:
            try:
                res = self._groq_client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.3,
                    max_tokens=1024,
                )
                raw_json = json.loads(res.choices[0].message.content or "{}")
                reply_text = raw_json.get("reply", "")
                detected_lang = raw_json.get("language", lang)
                action_proposal = raw_json.get("proposal")
            except Exception as exc:
                logger.warning(f"Synthia Groq invocation failed ({exc}), falling back to local reasoning.")

        if not reply_text:
            reply_text, action_proposal, detected_lang = self._local_heuristic_assistant(content, bounded_context, lang)

        assistant_msg = SynthiaMessage(
            session_id=session_id,
            role="assistant",
            content=reply_text,
            structured_action=action_proposal,
        )
        self._messages.setdefault(session_id, []).append(assistant_msg)
        session.updated_at = time.time()

        # Persist to Supabase
        supabase_service.persist_assistant_message(
            message_id=assistant_msg.message_id,
            session_id=session_id,
            role="assistant",
            content=reply_text,
            structured_action_json=action_proposal,
        )

        return {
            "session_id": session_id,
            "message_id": assistant_msg.message_id,
            "reply": reply_text,
            "language": detected_lang,
            "proposal": action_proposal,
        }

    def _format_context(self, context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Strip raw data arrays, keep only structural summaries for privacy & token limits."""
        if not context:
            return {"status": "ready"}
        safe_ctx = {}
        for key in ["dataset_id", "modality", "row_count", "column_count", "columns", "current_model", "validation_status", "evaluation_summary"]:
            if key in context:
                safe_ctx[key] = context[key]
        return safe_ctx

    def _local_heuristic_assistant(
        self,
        query: str,
        context: Dict[str, Any],
        lang: str,
    ) -> Tuple[str, Optional[Dict[str, Any]], str]:
        """High-quality offline multilingual fallback for Synthia."""
        q = query.lower()

        # Detect Urdu / Roman Urdu
        is_roman_urdu = any(w in q for w in ["kya", "kaise", "batao", "madad", "chahiye", "data", "hai", "karo", "acha", "theek"])
        is_urdu_script = any("\u0600" <= char <= "\u06FF" for char in query)

        current_lang = "ur" if is_urdu_script else ("roman_ur" if is_roman_urdu else "en")

        proposal = None

        if "column" in q or "field" in q or "add" in q or "naya" in q or "kalam" in q:
            proposal = {
                "type": "configuration_proposal",
                "action": "add_synthetic_columns",
                "requires_confirmation": True,
                "columns": [
                    {
                        "name": "salary_band",
                        "data_type": "categorical",
                        "semantic_type": "salary_band",
                        "suggested_values": ["Entry", "Mid", "Senior", "Executive"]
                    }
                ]
            }
            if current_lang == "ur":
                reply = "میں نے آپ کے ڈیٹا سیٹ کے لئے 'salary_band' کے نام سے مصنوعی کالم تجویز کیا ہے۔ برائے مہربانی اس کی تصدیق کریں۔"
            elif current_lang == "roman_ur":
                reply = "Maine aapke dataset ke liye 'salary_band' synthetic column suggest kiya hai. Aap review karke confirm kar sakte hain."
            else:
                reply = "I recommend adding a 'salary_band' synthetic categorical column based on your dataset profile. Please confirm to apply."

        elif "model" in q or "ctgan" in q or "tvae" in q or "benchmark" in q:
            proposal = {
                "type": "configuration_proposal",
                "action": "select_model",
                "requires_confirmation": True,
                "model_strategy": "ctgan",
            }
            if current_lang == "ur":
                reply = "CTGAN ماڈل پیچیدہ کالم تعلقات کے لیے بہترین ہے۔ کیا آپ اسے منتخب کرنا چاہتے ہیں؟"
            elif current_lang == "roman_ur":
                reply = "CTGAN model relational correlation ke liye behtareen hai. Kya aap isko generation ke liye select karna chahte hain?"
            else:
                reply = "CTGAN is recommended when preserving multi-column correlations and non-linear relationships. Would you like to select CTGAN?"

        else:
            if current_lang == "ur":
                reply = "ہیلو! میں سنتھیا ہوں۔ آپ مصنوعی کالمز، ماڈل کے انتخاب یا کوالٹی ایویلیو ایشن کے بارے میں پوچھ سکتے ہیں۔"
            elif current_lang == "roman_ur":
                reply = "Hi! Main Synthia hoon. Aap mujhse synthetic columns add karne, model benchmark dekhne, ya quality report samajhne me madad le sakte hain."
            else:
                reply = "Hi, I'm Synthia. How can I help you with your synthetic-data workflow? You can ask me to suggest synthetic columns, evaluate model benchmarks, or diagnose quality issues."

        return reply, proposal, current_lang


synthia_service = SynthiaService()
