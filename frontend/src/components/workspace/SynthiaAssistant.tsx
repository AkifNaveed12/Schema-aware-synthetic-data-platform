import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles, Check, CheckCircle2, Move, Globe } from 'lucide-react';
import { SynthiaMessage, SynthiaProposal, SyntheticColumnSpec } from '../../types';
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
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<'en' | 'ur' | 'ur-Latn'>('en');
  const [messages, setMessages] = useState<SynthiaMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [applyingProposalId, setApplyingProposalId] = useState<string | null>(null);
  const [appliedProposalIds, setAppliedProposalIds] = useState<Set<string>>(new Set());

  // Draggable position state
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Session once
  useEffect(() => {
    initSession();
  }, [datasetId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const initSession = async () => {
    try {
      const res = await synthiaCreateSession(datasetId, 'en');
      if (res.success && res.data) {
        setSessionId(res.data.session_id);
        if (res.data.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        }
      }
    } catch (err) {
      console.error('Failed to init Synthia session', err);
    }
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header handle
    if ((e.target as HTMLElement).closest('button, input, select')) return;
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
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  };

  // Helper to detect language locally
  const detectLanguageLocally = (text: string): 'en' | 'ur' | 'ur-Latn' => {
    const hasUrduChar = anyInRange(text, 0x0600, 0x06FF);
    if (hasUrduChar) return 'ur';

    const romanUrduKeywords = [
      'kya', 'kaise', 'chahiye', 'batao', 'btao', 'karo', 'mujhe', 'madad', 'mera', 'meri',
      'hain', 'hai', 'theek', 'acha', 'shukriya', 'yeh', 'woh', 'bana', 'dijiye'
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
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type in English, Urdu, or Roman Urdu below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      // Dual-friendly language setting
      recognition.lang = detectedLang === 'ur' ? 'ur-PK' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
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

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    const lang = detectLanguageLocally(textToSend);
    setDetectedLang(lang);

    const userMsg: SynthiaMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await synthiaSendMessage(sessionId || 'temp_session', textToSend, lang, {
        dataset_id: datasetId,
        dataset_name: datasetName,
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        const responseLang = (res.data as any).language || lang;
        setDetectedLang(responseLang);
        speakText(res.data.content, responseLang);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your request. Please try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyProposal = async (proposal: SynthiaProposal) => {
    setApplyingProposalId(proposal.id);
    try {
      const res = await synthiaExecuteAction(sessionId, proposal.type, {
        dataset_id: datasetId,
        columns: proposal.columns,
        parameters: proposal.parameters,
      });

      if (res.success) {
        setAppliedProposalIds((prev) => new Set(prev).add(proposal.id));
        if (proposal.columns && proposal.columns.length > 0) {
          onApplySyntheticColumns?.(proposal.columns);
        }

        const confirmMsg: SynthiaMessage = {
          id: `ack_${Date.now()}`,
          role: 'assistant',
          content:
            detectedLang === 'ur'
              ? 'تجاویز لاگو کر دی گئی ہیں اور ڈیٹاسیٹ پروفائل کو اپ ڈیٹ کر دیا گیا ہے۔'
              : detectedLang === 'ur-Latn'
              ? 'Proposal successfully apply ho gaya hai aur dataset profile update ho chuki hai.'
              : 'Proposal applied successfully. Dataset profile has been updated.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, confirmMsg]);
        speakText(confirmMsg.content, detectedLang);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to apply proposal');
    } finally {
      setApplyingProposalId(null);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            // Auto start speech listening when opened
            setTimeout(() => toggleSpeechRecognition(), 400);
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-2xl hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-900 animate-pulse" />
          </div>
          <div className="text-left font-sans">
            <span className="block text-xs font-bold leading-tight flex items-center gap-1">
              Synthia Voice AI
              <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Live</span>
            </span>
            <span className="block text-[10px] text-indigo-200 leading-tight">Auto-detect: EN · اردو · Roman</span>
          </div>
        </button>
      )}

      {/* Floating Draggable Popup */}
      {isOpen && (
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
          className="fixed bottom-6 right-6 z-50 w-96 md:w-[400px] max-h-[580px] h-[540px] bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn font-sans"
        >
          {/* Header - Drag Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="px-4 py-3 border-b border-[#1E293B] bg-[#111C35]/80 flex items-center justify-between cursor-move select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Bot className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Synthia
                  <span className="text-[9px] font-normal px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Globe className="w-2.5 h-2.5" />
                    Auto-Adapt
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">
                  {datasetName ? `Context: ${datasetName}` : 'Voice & Text Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono">
                {detectedLang === 'ur' ? 'اردو' : detectedLang === 'ur-Latn' ? 'Roman' : 'English'}
              </span>

              {/* TTS Toggle */}
              <button
                onClick={() => {
                  if (ttsEnabled) window.speechSynthesis?.cancel();
                  setTtsEnabled(!ttsEnabled);
                }}
                title={ttsEnabled ? 'Mute Speech' : 'Enable Speech'}
                className={`p-1.5 rounded-lg border transition-colors ${
                  ttsEnabled
                    ? 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30'
                    : 'text-slate-500 bg-slate-900 border-[#1E293B]'
                }`}
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  if (recognitionRef.current) recognitionRef.current.stop();
                  setIsListening(false);
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-950/40">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-900 text-slate-200 border border-[#1E293B] rounded-tl-sm'
                        : 'bg-indigo-600 text-white rounded-tr-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Structured Proposal Card */}
                    {msg.proposal && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Structured Proposal: {msg.proposal.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{msg.proposal.description}</p>

                        <div className="pt-2 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">Confirmation Required</span>
                          <button
                            onClick={() => handleApplyProposal(msg.proposal!)}
                            disabled={
                              appliedProposalIds.has(msg.proposal.id) ||
                              applyingProposalId === msg.proposal.id
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                              appliedProposalIds.has(msg.proposal.id)
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-50'
                            }`}
                          >
                            {appliedProposalIds.has(msg.proposal.id) ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Applied
                              </>
                            ) : applyingProposalId === msg.proposal.id ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Applying...
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Apply Proposal
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 px-1 mt-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice Listening Pulse Banner */}
          {isListening && (
            <div className="px-4 py-2 bg-red-950/40 border-t border-red-900/50 flex items-center justify-between text-xs text-red-300 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                <span>Actively listening... speak in English, Urdu, or Roman Urdu</span>
              </div>
              <button
                onClick={toggleSpeechRecognition}
                className="text-red-400 hover:text-white font-medium"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input Box & Mic */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-[#1E293B] bg-[#111C35]/50 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? 'Stop listening' : 'Start speaking'}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-[#1E293B]'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Speak or type in English, Urdu, or Roman Urdu..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

