import json
import logging
import re
import time
from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field

from backend.app.core.config import settings
from backend.app.ai.cache import ai_cache
from backend.app.ai.rate_limiter import ai_rate_limiter

logger = logging.getLogger("hackdata.ai")

class AIColumnInference(BaseModel):
    name: str
    data_type: str
    semantic_type: Optional[str] = None
    is_primary_key: bool = False
    is_foreign_key: bool = False
    distribution: Optional[str] = "uniform"
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)
    sample_values: Optional[List[Any]] = Field(default_factory=list)

class AISchemaInferenceResult(BaseModel):
    domain: str
    table_name: str
    row_count_suggested: int = 50
    confidence: float = 0.95
    columns: List[AIColumnInference]
    primary_key: str
    ai_used: bool = False
    cache_hit: bool = False

class AIQueryInterpretation(BaseModel):
    modality: str = "tabular"
    document_type: Optional[str] = None
    row_count: int = 50
    locale: str = "en_US"
    currency: str = "USD"
    domain: str = "general"
    filters: Dict[str, Any] = Field(default_factory=dict)
    distributions: Dict[str, Any] = Field(default_factory=dict)
    edge_cases: List[str] = Field(default_factory=list)
    explanation: str = ""
    ai_used: bool = False
    cache_hit: bool = False

class AIService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self._groq_client = None
        self.total_tokens_used = 0
        self.total_api_calls = 0
        self.total_latency_ms = 0.0

        if self.api_key and self.api_key.strip():
            try:
                import groq
                self._groq_client = groq.Groq(api_key=self.api_key.strip(), timeout=15.0)
                logger.info(f"Groq client initialized with model: {self.model}")
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}. Falling back to heuristic AI.")
                self._groq_client = None

    def is_live_groq_available(self) -> bool:
        return self._groq_client is not None

    def _call_groq(self, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> Optional[Dict[str, Any]]:
        if not self._groq_client:
            return None

        allowed, wait_sec = ai_rate_limiter.acquire()
        if not allowed:
            logger.warning("AI rate limit reached. Throttling Groq request, will use heuristic fallback.")
            return None

        start_time = time.time()
        try:
            response = self._groq_client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=temperature,
                max_tokens=2048
            )
            elapsed_ms = (time.time() - start_time) * 1000
            self.total_api_calls += 1
            self.total_latency_ms += elapsed_ms

            if response.usage:
                self.total_tokens_used += response.usage.total_tokens

            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            logger.warning(f"Groq call failed ({e}). Gracefully falling back to heuristic engine.")
            return None

    def infer_schema(self, raw_content: str, format_type: str = "csv", table_name: str = "dataset") -> AISchemaInferenceResult:
        cache_key = f"schema_infer:{table_name}:{hash(raw_content)}"
        cached = ai_cache.get(cache_key)
        if cached:
            result = AISchemaInferenceResult(**cached)
            result.cache_hit = True
            return result

        if self._groq_client:
            system_prompt = (
                "You are an expert data architect. Analyze the provided schema/sample data and return JSON with keys: "
                "\"domain\" (e.g. ecommerce, finance, saas, healthcare), \"table_name\", \"row_count_suggested\", "
                "\"primary_key\", \"columns\" (list of objects with \"name\", \"data_type\", \"semantic_type\", "
                "\"is_primary_key\", \"distribution\", \"parameters\"). Return valid JSON only."
            )
            sample_snippet = raw_content[:1500]
            user_prompt = f"Table name: {table_name}\nFormat: {format_type}\nData sample:\n{sample_snippet}"
            groq_response = self._call_groq(system_prompt, user_prompt)
            if groq_response and "columns" in groq_response:
                try:
                    cols = [
                        AIColumnInference(
                            name=c.get("name", "col"),
                            data_type=c.get("data_type", "string"),
                            semantic_type=c.get("semantic_type"),
                            is_primary_key=bool(c.get("is_primary_key", False)),
                            is_foreign_key=bool(c.get("is_foreign_key", False)),
                            distribution=c.get("distribution", "uniform"),
                            parameters=c.get("parameters", {})
                        ) for c in groq_response["columns"]
                    ]
                    pk = groq_response.get("primary_key") or (cols[0].name if cols else "id")
                    result = AISchemaInferenceResult(
                        domain=groq_response.get("domain", "general"),
                        table_name=table_name,
                        row_count_suggested=groq_response.get("row_count_suggested", 50),
                        confidence=0.98,
                        columns=cols,
                        primary_key=pk,
                        ai_used=True,
                        cache_hit=False
                    )
                    ai_cache.set(cache_key, result.model_dump())
                    return result
                except Exception as e:
                    logger.warning(f"Error parsing Groq schema response: {e}")

        result = self._heuristic_schema_inference(raw_content, format_type, table_name)
        ai_cache.set(cache_key, result.model_dump())
        return result

    def _heuristic_schema_inference(self, raw_content: str, format_type: str, table_name: str) -> AISchemaInferenceResult:
        lines = [l.strip() for l in raw_content.strip().splitlines() if l.strip()]
        header = []

        if lines:
            if "," in lines[0]:
                header = [c.strip().strip('"').strip("'") for c in lines[0].split(",")]
            elif "\t" in lines[0]:
                header = [c.strip() for c in lines[0].split("\t")]
            else:
                header = ["ID", "Name", "Email", "Signup", "Balance"]
        else:
            header = ["ID", "Name", "Email", "Signup", "Balance"]

        header_str = " ".join(header).lower()
        domain = "saas" if any(k in header_str for k in ["sub", "plan", "tier"]) else                  "finance" if any(k in header_str for k in ["balance", "account", "credit", "debit"]) else                  "ecommerce" if any(k in header_str for k in ["order", "item", "product", "price"]) else "general"

        columns = []
        for i, col_name in enumerate(header):
            col_lower = col_name.lower()
            dtype = "string"
            semantic = None
            dist = "uniform"
            params = {}
            is_pk = (i == 0 and ("id" in col_lower or "key" in col_lower)) or col_lower == "id"

            if is_pk:
                dtype = "integer"
                semantic = "id_sequence"
                dist = "sequence"
                params = {"start": 1000, "step": 1}
            elif any(k in col_lower for k in ["email", "mail"]):
                dtype = "string"
                semantic = "email"
            elif any(k in col_lower for k in ["name", "user", "customer", "person"]):
                dtype = "string"
                semantic = "full_name"
            elif any(k in col_lower for k in ["date", "signup", "created", "time", "timestamp"]):
                dtype = "date"
                semantic = "date"
                params = {"start_date": "2025-01-01", "end_date": "2026-09-01"}
            elif any(k in col_lower for k in ["balance", "amount", "price", "total", "cost", "fee"]):
                dtype = "currency"
                semantic = "currency"
                dist = "normal"
                params = {"mean": 500.0, "std": 150.0, "min": 10.0, "max": 5000.0}
            elif any(k in col_lower for k in ["status", "type", "category", "role"]):
                dtype = "category"
                semantic = "status"
                dist = "categorical"
                params = {"categories": ["active", "pending", "inactive"], "weights": [0.7, 0.2, 0.1]}
            elif any(k in col_lower for k in ["age", "count", "quantity", "qty", "num"]):
                dtype = "integer"
                semantic = "count"
                dist = "normal"
                params = {"mean": 30, "std": 10, "min": 1, "max": 100}

            columns.append(AIColumnInference(
                name=col_name,
                data_type=dtype,
                semantic_type=semantic,
                is_primary_key=is_pk,
                distribution=dist,
                parameters=params
            ))

        pk = columns[0].name if columns else "id"
        return AISchemaInferenceResult(
            domain=domain,
            table_name=table_name,
            row_count_suggested=max(len(lines) - 1, 50) if lines else 50,
            confidence=0.92,
            columns=columns,
            primary_key=pk,
            ai_used=False,
            cache_hit=False
        )

    def interpret_query(self, query: str, modality: str = "tabular") -> AIQueryInterpretation:
        cache_key = f"query_interpret:{modality}:{hash(query.strip().lower())}"
        cached = ai_cache.get(cache_key)
        if cached:
            res = AIQueryInterpretation(**cached)
            res.cache_hit = True
            return res

        if self._groq_client:
            system_prompt = (
                "You are an AI synthetic data planner. Parse user natural-language queries into structured configuration "
                "for synthetic data generation. Return a JSON object with: "
                "\"modality\" (\"tabular\"|\"relational\"|\"document\"), "
                "\"document_type\" (\"invoice\"|\"bank_statement\"|null), "
                "\"row_count\" (integer), \"locale\" (e.g. \"en_US\"), \"currency\" (e.g. \"USD\", \"EUR\"), "
                "\"domain\" (e.g. \"ecommerce\", \"finance\", \"saas\"), "
                "\"filters\" (dict of numeric or status constraints), "
                "\"distributions\" (dict), \"edge_cases\" (list of strings, e.g. [\"negative_balances\"]), "
                "\"explanation\" (brief explanation)."
            )
            groq_response = self._call_groq(system_prompt, query)
            if groq_response and "row_count" in groq_response:
                try:
                    result = AIQueryInterpretation(
                        modality=groq_response.get("modality", modality),
                        document_type=groq_response.get("document_type"),
                        row_count=int(groq_response.get("row_count", 50)),
                        locale=groq_response.get("locale", "en_US"),
                        currency=groq_response.get("currency", "USD"),
                        domain=groq_response.get("domain", "general"),
                        filters=groq_response.get("filters", {}),
                        distributions=groq_response.get("distributions", {}),
                        edge_cases=groq_response.get("edge_cases", []),
                        explanation=groq_response.get("explanation", f"Parsed query: {query}"),
                        ai_used=True,
                        cache_hit=False
                    )
                    ai_cache.set(cache_key, result.model_dump())
                    return result
                except Exception as e:
                    logger.warning(f"Error parsing Groq query interpretation: {e}")

        result = self._heuristic_query_interpretation(query, modality)
        ai_cache.set(cache_key, result.model_dump())
        return result

    def _heuristic_query_interpretation(self, query: str, modality: str) -> AIQueryInterpretation:
        q = query.lower()
        doc_type = None
        target_modality = modality

        if any(w in q for w in ["invoice", "bill", "receipt"]):
            target_modality = "document"
            doc_type = "invoice"
        elif any(w in q for w in ["statement", "bank", "ledger", "balance over", "credits", "debits"]):
            target_modality = "document"
            doc_type = "bank_statement"
        elif any(w in q for w in ["relation", "orders and customers", "multi-table", "join"]):
            target_modality = "relational"

        count = 50
        count_match = re.search(r"(?:generate|create|produce|make|synthesize)?\s*(\d+)\s*(?:[a-zA-Z_\-]+\s+){0,3}(?:rows|records|transactions|items|invoices|customers|statements|accounts)", q)
        if not count_match:
            count_match = re.search(r"(?:generate|create|produce|make)\s+(\d+)", q)
        if count_match:
            count = int(count_match.group(1))
        elif "hundred" in q:
            count = 100
        elif "thousand" in q:
            count = 1000

        currency = "USD"
        if any(w in q for w in ["eur", "euro", "€"]):
            currency = "EUR"
        elif any(w in q for w in ["gbp", "pound", "£"]):
            currency = "GBP"
        elif "cad" in q:
            currency = "CAD"
        elif any(w in q for w in ["jpy", "yen"]):
            currency = "JPY"

        locale = "en_US"
        if currency == "EUR":
            locale = "de_DE"
        elif currency == "GBP":
            locale = "en_GB"

        filters = {}
        if "days" in q:
            days_match = re.search(r"(\d+)\s*days", q)
            if days_match:
                filters["days"] = int(days_match.group(1))
        if "balance over" in q:
            bal_match = re.search(r"balance\s*over\s*\$?([\d,]+)", q)
            if bal_match:
                filters["min_balance"] = float(bal_match.group(1).replace(",", ""))

        edge_cases = []
        if any(w in q for w in ["edge", "outlier", "high-value", "extreme"]):
            edge_cases.append("high_value_spikes")
        if any(w in q for w in ["negative", "overdraft"]):
            edge_cases.append("negative_balances")
        if any(w in q for w in ["null", "missing"]):
            edge_cases.append("null_bursts")

        domain = "saas" if any(w in q for w in ["saas", "software", "subscription"]) else                  "finance" if any(w in q for w in ["finance", "bank", "wealth", "crypto"]) else                  "ecommerce" if any(w in q for w in ["ecommerce", "shop", "order", "retail"]) else "general"

        explanation = f"Configured {target_modality} generation ({count} items in {currency}, locale {locale})"
        if filters:
            explanation += f" with constraints: {filters}"

        return AIQueryInterpretation(
            modality=target_modality,
            document_type=doc_type,
            row_count=min(max(count, 1), 10000),
            locale=locale,
            currency=currency,
            domain=domain,
            filters=filters,
            distributions={},
            edge_cases=edge_cases,
            explanation=explanation,
            ai_used=False,
            cache_hit=False
        )

    def generate_semantic_pool(self, category: str, count: int = 20, domain: str = "ecommerce") -> List[str]:
        cache_key = f"semantic_pool:{domain}:{category}:{count}"
        cached = ai_cache.get(cache_key)
        if cached:
            return cached

        if self._groq_client:
            system_prompt = (
                f"Generate a JSON object with a key 'items' containing a list of {count} realistic, distinct, "
                f"high-quality synthetic data strings for category '{category}' in domain '{domain}'. Valid JSON only."
            )
            groq_response = self._call_groq(system_prompt, f"Generate {count} {category} items for {domain}.")
            if groq_response and "items" in groq_response and isinstance(groq_response["items"], list):
                items = [str(it).strip() for it in groq_response["items"] if it]
                if items:
                    ai_cache.set(cache_key, items)
                    return items

        pools = {
            "ecommerce_products": [
                "Ergonomic Mechanical Keyboard", "Wireless Noise-Canceling Headphones", "Ultra-Wide 4K Gaming Monitor",
                "USB-C Multiport Hub 8-in-1", "Standing Desk Converter 36-inch", "Hydro Flask Insulated Bottle 32oz",
                "Aeropress Coffee Maker Kit", "Smart LED Desk Lamp with Dimmer", "Braided Nylon Thunderbolt 4 Cable",
                "Vegan Leather Laptop Sleeve 15-inch", "Ceramic Pour-Over Dripper", "Portable SSD 2TB Rugged",
                "Anodized Aluminum Tablet Stand", "Organic Cotton Casual Hoodie", "Compact Air Purifier with HEPA Filter"
            ],
            "saas_products": [
                "CloudScale Enterprise Tier", "AI Agent Workforce Add-on", "Audit Log Compliance Suite",
                "Dedicated VPC Ingress Gateway", "Multi-Region High Availability", "SOC2 Continuous Monitoring",
                "Advanced Differential Privacy Pack", "Single Sign-On SAML Integration", "Custom Vector Search Cluster"
            ],
            "financial_merchants": [
                "Equinox Fitness Club", "Blue Bottle Coffee", "AWS Cloud Infrastructure", "WeWork Office Leasing",
                "Whole Foods Market", "Uber Technologies Corp", "Delta Air Lines Reservation", "Starbucks Coffee",
                "Stripe Merchant Settlement", "Target Superstore", "Google Cloud Platform", "Trader Joe's Groceries"
            ],
            "companies": [
                "Apex Data Systems LLC", "Nexus Cloud Solutions Inc.", "Vanguard Cybernetics Corp",
                "BluePeak Analytics Ltd", "Aegis Sentinel Security", "Horizon Software Labs",
                "Synthetica Machine Intelligence", "Strata Financial Logistics"
            ]
        }

        key = f"{domain}_{category}"
        selected = pools.get(key) or pools.get(f"ecommerce_{category}") or pools.get("saas_products") or [f"{domain.capitalize()} Item {i+1}" for i in range(count)]
        items = (selected * ((count // len(selected)) + 1))[:count]
        ai_cache.set(cache_key, items)
        return items

    def metrics(self) -> Dict[str, Any]:
        cache_stats = ai_cache.stats()
        rate_stats = ai_rate_limiter.stats()
        avg_latency = (self.total_latency_ms / self.total_api_calls) if self.total_api_calls > 0 else 0.0

        return {
            "provider": "groq" if self.is_live_groq_available() else "heuristic_offline_fallback",
            "model": self.model,
            "is_live": self.is_live_groq_available(),
            "total_api_calls": self.total_api_calls,
            "total_tokens_used": self.total_tokens_used,
            "avg_latency_ms": round(avg_latency, 2),
            "cache": cache_stats,
            "rate_limiter": rate_stats
        }

ai_service = AIService()
