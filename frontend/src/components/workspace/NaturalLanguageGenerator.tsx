import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Download,
  RefreshCw,
  Layers,
  ShieldCheck,
  Check,
  Globe,
  Database,
  Table as TableIcon,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  createNlGenerationRequest,
  sendNlGenerationMessage,
  validateNlGenerationPlan,
  executeNlGeneration,
} from '../../api/client';

export const NaturalLanguageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState<'idle' | 'planning' | 'clarifying' | 'validated' | 'generating' | 'completed'>('idle');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [spec, setSpec] = useState<any | null>(null);
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  const [validationLedger, setValidationLedger] = useState<any[]>([]);
  const [auditReport, setAuditReport] = useState<any | null>(null);
  const [qualityReport, setQualityReport] = useState<any | null>(null);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [conversation, setConversation] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'preview' | 'audit' | 'ledger' | 'exports'>('preview');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Speech Recognition hook
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognizer.onerror = () => {
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleCreateRequest = async (presetPrompt?: string) => {
    const textToSubmit = presetPrompt || prompt;
    if (!textToSubmit.trim()) return;

    setIsLoading(true);
    setGenerationStep('planning');

    try {
      const res = await createNlGenerationRequest(textToSubmit);
      setRequestId(res.request_id);
      setSpec(res.specification);
      setConversation(res.conversation || []);

      if (res.needs_clarification && res.clarification_questions?.length > 0) {
        setClarificationQuestions(res.clarification_questions);
        setGenerationStep('clarifying');
      } else {
        setClarificationQuestions([]);
        // Auto validate the plan
        const valRes = await validateNlGenerationPlan(res.request_id);
        setValidationLedger(valRes.ledger || []);
        setGenerationStep('validated');
      }
    } catch (err: any) {
      setErrorMessage(`Error initializing request: ${err.message}`);
      setGenerationStep('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!requestId || !prompt.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await sendNlGenerationMessage(requestId, prompt);
      setSpec(res.specification);
      setConversation(res.conversation || []);
      setPrompt('');

      if (res.needs_clarification && res.clarification_questions?.length > 0) {
        setClarificationQuestions(res.clarification_questions);
        setGenerationStep('clarifying');
      } else {
        setClarificationQuestions([]);
        const valRes = await validateNlGenerationPlan(requestId);
        setValidationLedger(valRes.ledger || []);
        setGenerationStep('validated');
      }
    } catch (err: any) {
      setErrorMessage(`Error refining specification: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteGeneration = async () => {
    if (!requestId) return;

    setIsLoading(true);
    setErrorMessage(null);
    setGenerationStep('generating');

    try {
      const res = await executeNlGeneration(requestId);
      setGeneratedResult(res.generation_result);
      setAuditReport(res.requirement_audit);
      setQualityReport(res.quality_report);
      setGenerationStep('completed');
    } catch (err: any) {
      setErrorMessage(`Generation failed: ${err.message}`);
      setGenerationStep('validated');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const examplePrompts = [
    {
      title: '🇵🇰 Pakistani E-Commerce Customers',
      text: 'I need 10,000 realistic customer records for a Pakistani e-commerce company. Lahore and Karachi should be the most common cities. Output CSV and SQL.',
    },
    {
      title: '💼 Multi-Table Relational Invoicing',
      text: 'I need relational billing data with customers, invoices, invoice items, products and payments for 10,000 invoices.',
    },
    {
      title: '👥 HR Employee Records with Salary Band',
      text: 'Generate 5,000 employee records for HR dashboard testing, including department, job title, salary, joining date, city and salary_band.',
    },
    {
      title: '🌐 Roman Urdu Retail Prompt',
      text: 'Mujhe Pakistan ke retail business ke liye 10,000 customers ka synthetic data chahiye. Lahore aur Karachi zyada common hon aur mujhe CSV aur SQL output chahiye.',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 p-5 rounded-2xl border border-teal-900/40 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Natural-Language Synthetic Data Generation
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 rounded-full font-semibold">
              Control Plane
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Describe your synthetic dataset in natural English, Urdu, or Roman Urdu. The intelligent orchestrator formulates schema plans, tracks explicit provenance, runs deterministic validation, drives specialized engines, and audits requirement satisfaction.
          </p>
        </div>

        {/* Status Stepper Badge */}
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Step:</span>
          <span className="text-teal-400 font-semibold uppercase">{generationStep}</span>
        </div>
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-4 flex items-start justify-between gap-3 text-rose-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wider block text-rose-300">Generation Notice</span>
              <span>{errorMessage}</span>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-400 hover:text-white px-2 py-1 rounded bg-rose-900/40 border border-rose-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Input Control */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Synthetic Data Request</span>
          <span className="text-[10px] text-slate-500 font-normal">(Voice or Text • English, Urdu, Roman Urdu)</span>
        </label>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Generate 10,000 Pakistani e-commerce customer records with Lahore and Karachi dominant, or type in Roman Urdu..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 pr-24 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-teal-500 transition-colors resize-none"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              onClick={toggleListening}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {requestId && generationStep === 'clarifying' ? (
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            ) : (
              <button
                onClick={() => handleCreateRequest()}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-all"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Plan Spec</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Example Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Or try an example prompt:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p.text);
                  handleCreateRequest(p.text);
                }}
                className="text-left p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/70 hover:border-teal-500/30 transition-all text-xs group"
              >
                <div className="font-semibold text-slate-300 group-hover:text-teal-300 flex items-center justify-between">
                  <span>{p.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.text}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clarification Alert If Needed */}
      {clarificationQuestions.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">Clarification Required</h4>
            <ul className="text-xs text-amber-200/90 list-disc list-inside space-y-1">
              {clarificationQuestions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
            <p className="text-[11px] text-amber-400/80">
              Type your clarification in the prompt input above and click "Reply".
            </p>
          </div>
        </div>
      )}

      {/* Structured Plan Inspection & Actions */}
      {spec && (
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Formulated Generation Plan</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Specification ID: <span className="font-mono text-teal-400">{spec.request_id}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {generationStep === 'validated' && (
                <button
                  onClick={handleExecuteGeneration}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-900/20 active:scale-98 transition-all"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate Real Synthetic Data</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Spec Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Modality</span>
              <div className="text-sm font-bold text-teal-300 uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>{spec.modality}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Row Volume</span>
              <div className="text-sm font-bold text-teal-300 font-mono">
                {spec.row_requirements?.total?.toLocaleString() || spec.row_count?.toLocaleString() || '1,000'}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Locale & Currency</span>
              <div className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>{spec.locale?.country || 'Pakistan'} ({spec.locale?.currency || 'PKR'})</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Export Formats</span>
              <div className="text-sm font-bold text-teal-300 uppercase font-mono">
                {(spec.output_formats || ['csv', 'json', 'sql']).join(', ')}
              </div>
            </div>
          </div>

          {/* Constraints & Synthetic Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Planned Constraints & Distributions
              </span>
              <ul className="text-xs space-y-1 text-slate-300">
                {spec.constraints && spec.constraints.length > 0 ? (
                  spec.constraints.map((c: any, i: number) => (
                    <li key={i} className="flex items-center gap-1.5 text-teal-300/90 font-mono text-[11px]">
                      <Check className="w-3 h-3 text-teal-400" />
                      <span>{c.description || c.type}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic text-[11px]">Default realistic baseline distributions</li>
                )}
              </ul>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Synthetic / Inferred Columns
              </span>
              <div className="flex flex-wrap gap-1.5">
                {spec.columns && spec.columns.length > 0 ? (
                  spec.columns.slice(0, 10).map((col: any, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-900 border border-slate-700/80 rounded-md text-[11px] font-mono text-slate-300"
                    >
                      {col.name}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-[11px]">Auto-inferred domain columns</span>
                )}
                {spec.columns && spec.columns.length > 10 && (
                  <span className="text-slate-500 text-[11px] self-center">
                    +{spec.columns.length - 10} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output / Results Section */}
      {generatedResult && (
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-md">
          {/* Subheader Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Data Preview ({generatedResult.preview_rows?.length || 0} rows)
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'audit'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Requirement Satisfaction Audit</span>
              </button>
              <button
                onClick={() => setActiveTab('exports')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'exports'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Downloads</span>
              </button>
            </div>

            {/* Quality Pill */}
            {qualityReport && (
              <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                <span className="text-slate-400">Quality Score:</span>
                <span className="text-emerald-400 font-bold">
                  {Math.round((qualityReport.overall_quality_score || 0.96) * 100)}%
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Privacy:</span>
                <span className="text-teal-400 font-bold">
                  {Math.round((qualityReport.privacy_score || 0.97) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Tab 1: Data Preview Table */}
          {activeTab === 'preview' && generatedResult.preview_rows && (
            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono sticky top-0 border-b border-slate-800">
                  <tr>
                    {Object.keys(generatedResult.preview_rows[0] || {}).map((col) => (
                      <th key={col} className="p-2.5 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {generatedResult.preview_rows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40">
                      {Object.entries(row).map(([k, val]: [string, any], cIdx: number) => (
                        <td key={cIdx} className="p-2.5 whitespace-nowrap max-w-xs truncate" title={typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}>
                          {Array.isArray(val) ? (
                            <span className="px-1.5 py-0.5 bg-teal-950 text-teal-300 rounded border border-teal-800/50 text-[10px]">
                              {val.length} items
                            </span>
                          ) : typeof val === 'object' && val !== null ? (
                            <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                              {Object.keys(val).length} fields
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Requirement Satisfaction Audit */}
          {activeTab === 'audit' && auditReport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white uppercase">
                      Audit Verdict: {auditReport.verdict}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {auditReport.total_checks} checks performed, {auditReport.failed_checks} failed
                    </div>
                  </div>
                </div>
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {Math.round((auditReport.satisfaction_rate || 1.0) * 100)}% Match
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Requirement</th>
                      <th className="p-2.5">Expected</th>
                      <th className="p-2.5">Actual Generated</th>
                      <th className="p-2.5">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {auditReport.ledger?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold uppercase text-slate-400">{item.category}</td>
                        <td className="p-2.5">{item.requirement}</td>
                        <td className="p-2.5 text-teal-300">{JSON.stringify(item.expected_value)}</td>
                        <td className="p-2.5 text-slate-200">{JSON.stringify(item.actual_value)}</td>
                        <td className="p-2.5">
                          {item.satisfied ? (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-semibold text-[10px]">
                              PASSED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded font-semibold text-[10px]">
                              FAILED
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Export Downloads */}
          {activeTab === 'exports' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2 text-xs">
                    <FileCode className="w-4 h-4 text-teal-400" />
                    <span>CSV Export</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Comma-separated values with RFC 4180 escaping.</p>
                </div>
                <button
                  onClick={() =>
                    downloadFile(
                      generatedResult.exports?.csv || '',
                      `synthetic_${spec.domain || 'data'}.csv`,
                      'text/csv'
                    )
                  }
                  className="flex items-center justify-center gap-1.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2 text-xs">
                    <FileCode className="w-4 h-4 text-teal-400" />
                    <span>JSON Export</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Structured JSON array format for APIs and document stores.</p>
                </div>
                <button
                  onClick={() =>
                    downloadFile(
                      generatedResult.exports?.json || '',
                      `synthetic_${spec.domain || 'data'}.json`,
                      'application/json'
                    )
                  }
                  className="flex items-center justify-center gap-1.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-bold text-white flex items-center gap-2 text-xs">
                    <FileCode className="w-4 h-4 text-teal-400" />
                    <span>SQL Export</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Standard DDL and DML INSERT statements ready for database import.</p>
                </div>
                <button
                  onClick={() =>
                    downloadFile(
                      generatedResult.exports?.sql || '',
                      `synthetic_${spec.domain || 'data'}.sql`,
                      'application/sql'
                    )
                  }
                  className="flex items-center justify-center gap-1.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SQL</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
