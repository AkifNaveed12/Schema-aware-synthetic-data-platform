import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles, Check, CheckCircle2, Globe, Radio } from 'lucide-react';
import { SynthiaProposal, SyntheticColumnSpec } from '../../types';
import { synthiaCreateSession, synthiaSendMessage, synthiaExecuteAction } from '../../api/client';

interface SynthiaAssistantProps {
  datasetId?: string;
  datasetName?: string;
  onApplySyntheticColumns?: (cols: SyntheticColumnSpec[]) => void;
}

export const SynthiaAssistant: React.FC<SynthiaAssistantProps> = ({
  datasetId,
  datasetName,
  onApplySyntheticColumns,
}) => {
  const [isActivated, setIsActivated] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<'en' | 'ur' | 'ur-Latn'>('en');
  const [currentQuery, setCurrentQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [latestResponse, setLatestResponse] = useState<string>('');
  const [activeProposal, setActiveProposal] = useState<SynthiaProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [applyingProposal, setApplyingProposal] = useState(false);
  const [proposalApplied, setProposalApplied] = useState(false);

  // Draggable position state
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const recognitionRef = useRef<any>(null);

  // Initialize Session once
  useEffect(() => {
    initSession();
  }, [datasetId]);

  const initSession = async () => {
    try {
      const res = await synthiaCreateSession(datasetId, 'en');
      if (res.success && res.data) {
        setSessionId(res.data.session_id);
      }
    } catch (err) {
      console.error('Failed to init Synthia session', err);
    }
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      setPosition({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Text to Speech
  const speakText = (text: string, lang: 'en' | 'ur' | 'ur-Latn') => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
      setIsSpeaking(false);
    }
  };

  // Language auto-detection
  const detectLanguage = (text: string): 'en' | 'ur' | 'ur-Latn' => {
    const hasUrduChar = anyInRange(text, 0x0600, 0x06FF);
    if (hasUrduChar) return 'ur';

    const romanUrduKeywords = [
      'kya', 'kaise', 'chahiye', 'batao', 'btao', 'karo', 'mujhe', 'madad', 'mera', 'meri',
      'hain', 'hai', 'theek', 'acha', 'shukriya', 'yeh', 'woh', 'bana', 'dijiye', 'hoga'
    ];
    const lower = text.toLowerCase();
    const count = romanUrduKeywords.filter((w) => new RegExp(`\\b${w}\\b`).test(lower)).length;
    if (count >= 1) return 'ur-Latn';

    return 'en';
  };

  function anyInRange(str: string, min: number, max: number) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code >= min && code <= max) return true;
    }
    return false;
  }

  // Web Speech Recognition
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = detectedLang === 'ur' ? 'ur-PK' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        processUserQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Toggle Activation
  const handleToggleActivate = () => {
    if (!isActivated) {
      setIsActivated(true);
      setLatestResponse('');
      setActiveProposal(null);
      setProposalApplied(false);
      setCurrentQuery('');
      startListening();
    } else {
      stopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setIsActivated(false);
    }
  };

  const processUserQuery = async (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery || loading) return;

    const lang = detectLanguage(cleanQuery);
    setDetectedLang(lang);
    setCurrentQuery(cleanQuery);
    setInputText('');
    setLoading(true);
    setActiveProposal(null);
    setProposalApplied(false);

    try {
      const res = await synthiaSendMessage(sessionId || 'temp_session', cleanQuery, lang, {
        dataset_id: datasetId,
        dataset_name: datasetName,
      });

      if (res.success && res.data) {
        const reply = res.data.content;
        setLatestResponse(reply);
        if (res.data.proposal) {
          setActiveProposal(res.data.proposal);
        }
        const respLang = (res.data as any).language || lang;
        setDetectedLang(respLang);
        speakText(reply, respLang);
      }
    } catch (err: any) {
      setLatestResponse('Sorry, I encountered an issue processing your query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyProposal = async () => {
    if (!activeProposal) return;
    setApplyingProposal(true);
    try {
      const res = await synthiaExecuteAction(sessionId, activeProposal.type, {
        dataset_id: datasetId,
        columns: activeProposal.columns,
        parameters: activeProposal.parameters,
      });

      if (res.success) {
        setProposalApplied(true);
        if (activeProposal.columns && activeProposal.columns.length > 0) {
          onApplySyntheticColumns?.(activeProposal.columns);
        }
        const confirmMsg =
          detectedLang === 'ur'
            ? 'تجاویز لاگو کر دی گئی ہیں۔'
            : detectedLang === 'ur-Latn'
            ? 'Proposal successfully apply ho gaya hai.'
            : 'Proposal successfully applied to dataset.';
        setLatestResponse(confirmMsg);
        speakText(confirmMsg, detectedLang);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to apply proposal');
    } finally {
      setApplyingProposal(false);
    }
  };

  return (
    <div
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none font-sans"
    >
      {/* Activated Voice Capsule (Appears only when activated, NOT a chatbot) */}
      {isActivated && (
        <div
          onMouseDown={handleMouseDown}
          className="mb-3 w-80 md:w-96 bg-white/95 backdrop-blur-md border border-brand-border rounded-2xl shadow-modal p-4 text-brand-hero animate-fadeIn cursor-move overflow-hidden transition-all duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-brand-border text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-brand-hero">Synthia Voice</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-mono font-medium">
                {detectedLang === 'ur' ? 'اردو' : detectedLang === 'ur-Latn' ? 'Roman Urdu' : 'English'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  setTtsEnabled(!ttsEnabled);
                }}
                className={`p-1 rounded transition-colors ${
                  ttsEnabled ? 'text-brand-teal hover:text-brand-teal-hover' : 'text-slate-400'
                }`}
                title={ttsEnabled ? 'Mute Speech' : 'Unmute Speech'}
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleToggleActivate()}
                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                title="Deactivate Synthia"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Status & Sound Wave Animation */}
          <div className="py-3">
            {isListening && (
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="flex items-center gap-1.5 h-6">
                  <span className="w-1 bg-teal-500 rounded-full animate-bounce h-4" />
                  <span className="w-1 bg-teal-600 rounded-full animate-bounce h-6 delay-75" />
                  <span className="w-1 bg-emerald-500 rounded-full animate-bounce h-5 delay-150" />
                  <span className="w-1 bg-teal-400 rounded-full animate-bounce h-3 delay-100" />
                </div>
                <p className="text-xs text-brand-teal font-medium animate-pulse">
                  Listening... speak in English, Urdu, or Roman Urdu
                </p>
              </div>
            )}

            {loading && !isListening && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-brand-secondary">
                <span className="w-3 h-3 border-2 border-brand-teal border-t-transparent rounded-full animate-spin" />
                <span>Analyzing dataset context...</span>
              </div>
            )}

            {/* Direct Spoken Response (No chat history, single current voice response) */}
            {!isListening && !loading && latestResponse && (
              <div className="space-y-2">
                {currentQuery && (
                  <p className="text-[11px] text-brand-secondary italic line-clamp-1">
                    "{currentQuery}"
                  </p>
                )}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-brand-border text-xs text-brand-hero leading-relaxed">
                  <div className="flex items-start gap-2">
                    {isSpeaking && (
                      <span className="flex gap-0.5 items-end h-4 mt-0.5">
                        <span className="w-0.5 bg-emerald-500 h-2 animate-pulse" />
                        <span className="w-0.5 bg-emerald-500 h-4 animate-pulse delay-75" />
                        <span className="w-0.5 bg-emerald-500 h-2.5 animate-pulse delay-150" />
                      </span>
                    )}
                    <p className="flex-1">{latestResponse}</p>
                  </div>
                </div>

                {/* Structured 1-click Proposal Action (if available) */}
                {activeProposal && (
                  <div className="p-2 rounded-lg bg-teal-50/70 border border-teal-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-teal-900 font-medium">
                      <Sparkles className="w-3 h-3 text-brand-teal" />
                      <span>{activeProposal.title}</span>
                    </div>
                    <button
                      onClick={handleApplyProposal}
                      disabled={proposalApplied || applyingProposal}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                        proposalApplied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-brand-teal hover:bg-brand-teal-hover text-white shadow-sm'
                      }`}
                    >
                      {proposalApplied ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Applied
                        </>
                      ) : applyingProposal ? (
                        'Applying...'
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          Apply
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isListening && !loading && !latestResponse && (
              <p className="text-center py-2 text-xs text-brand-secondary">
                Click the mic below or speak to ask Synthia.
              </p>
            )}
          </div>

          {/* Quick Voice / Text Input Pill */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) {
                processUserQuery(inputText);
              }
            }}
            className="flex items-center gap-1.5 pt-2 border-t border-brand-border"
          >
            <button
              type="button"
              onClick={() => {
                if (isListening) stopListening();
                else startListening();
              }}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 text-brand-teal hover:bg-slate-200'
              }`}
              title={isListening ? 'Stop Listening' : 'Speak'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or type query..."
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-brand-border rounded-xl text-brand-hero placeholder-slate-400 focus:outline-none focus:border-brand-teal focus:bg-white"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2 bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-40 text-white rounded-xl transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Icon Orb (Small icon that can be dragged and clicked to activate) */}
      <div
        onMouseDown={handleMouseDown}
        className="relative group cursor-move"
      >
        <button
          onClick={handleToggleActivate}
          className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-2xl ${
            isActivated
              ? 'bg-gradient-to-r from-teal-600 to-emerald-600 ring-4 ring-teal-400/40 scale-105'
              : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:scale-110 active:scale-95 shadow-lg shadow-teal-700/25'
          } text-white border border-white/20`}
          title={isActivated ? 'Deactivate Synthia' : 'Activate Synthia Voice Assistant'}
        >
          {/* Pulsing Aura */}
          <span
            className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
              isActivated
                ? 'animate-ping bg-teal-500 opacity-25'
                : 'opacity-0 group-hover:opacity-20 bg-teal-400'
            }`}
          />

          {isActivated ? (
            isListening ? (
              <Mic className="w-6 h-6 animate-pulse text-white" />
            ) : (
              <Radio className="w-6 h-6 text-white animate-spin" />
            )
          ) : (
            <Bot className="w-6 h-6" />
          )}

          {/* Active Status Dot */}
          <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
        </button>

        {/* Small Hover Badge when Idle */}
        {!isActivated && (
          <span className="absolute bottom-16 right-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-brand-hero text-white text-[10px] font-medium px-2 py-1 rounded-md border border-slate-700 whitespace-nowrap shadow-lg">
            Synthia Voice AI
          </span>
        )}
      </div>
    </div>
  );
};

