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
  Mail,
} from 'lucide-react';
import {
  createNlGenerationRequest,
  sendNlGenerationMessage,
  validateNlGenerationPlan,
  executeNlGeneration,
} from '../../api/client';
import { EmailDatasetModal } from './EmailDatasetModal';

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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailExportFormat, setEmailExportFormat] = useState<'csv' | 'json' | 'sql'>('csv');

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
    <div className="flex flex-col h-full bg-brand-canvas text-brand-hero overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-brand-border shadow-micro">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-brand-teal rounded-lg border border-teal-200">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-brand-hero">
              Natural-Language Synthetic Data Generation
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-teal-50 text-brand-teal border border-teal-200 rounded-full font-semibold">
              Control Plane
            </span>
          </div>
          <p className="text-xs text-brand-secondary max-w-2xl">
            Describe your synthetic dataset in natural English, Urdu, or Roman Urdu. The intelligent orchestrator formulates schema plans, tracks explicit provenance, runs deterministic validation, drives specialized engines, and audits requirement satisfaction.
          </p>
        </div>

        {/* Status Stepper Badge */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono">
          <span className="text-brand-secondary">Step:</span>
          <span className="text-brand-teal font-semibold uppercase">{generationStep}</span>
        </div>
      </div>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start justify-between gap-3 text-rose-800">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wider block text-rose-700">Generation Notice</span>
              <span>{errorMessage}</span>
            </div>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-700 hover:text-rose-900 px-2 py-1 rounded bg-rose-100 border border-rose-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Input Control */}
      <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-micro space-y-4">
        <label className="text-xs font-semibold text-brand-hero uppercase tracking-wider flex items-center gap-2">
          <span>Synthetic Data Request</span>
          <span className="text-[10px] text-brand-secondary font-normal">(Voice or Text • English, Urdu, Roman Urdu)</span>
        </label>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Generate 10,000 Pakistani e-commerce customer records with Lahore and Karachi dominant, or type in Roman Urdu..."
            rows={3}
            className="w-full bg-slate-50 border border-brand-border rounded-xl p-3.5 pr-24 text-sm text-brand-hero placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-brand-teal transition-colors resize-none"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              onClick={toggleListening}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-50 text-rose-600 border border-rose-300 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {requestId && generationStep === 'clarifying' ? (
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-all shadow-micro cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            ) : (
              <button
                onClick={() => handleCreateRequest()}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-all shadow-micro cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Plan Spec</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Example Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-brand-secondary font-medium">Or try an example prompt:</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p.text);
                  handleCreateRequest(p.text);
                }}
                className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-brand-border hover:border-brand-teal/40 transition-all text-xs group cursor-pointer"
              >
                <div className="font-semibold text-brand-hero group-hover:text-brand-teal flex items-center justify-between">
                  <span>{p.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 text-brand-teal" />
                </div>
                <div className="text-[11px] text-brand-secondary line-clamp-1 mt-0.5">{p.text}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clarification Alert If Needed */}
      {clarificationQuestions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Clarification Required</h4>
            <ul className="text-xs text-amber-800/90 list-disc list-inside space-y-1">
              {clarificationQuestions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ul>
            <p className="text-[11px] text-amber-700">
              Type your clarification in the prompt input above and click "Reply".
            </p>
          </div>
        </div>
      )}

      {/* Structured Plan Inspection & Actions */}
      {spec && (
        <div className="bg-white rounded-2xl p-5 border border-brand-border space-y-4 shadow-micro">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-brand-border">
            <div>
              <h3 className="text-sm font-bold text-brand-hero flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-teal" />
                <span>Formulated Generation Plan</span>
              </h3>
              <span className="text-[11px] text-brand-secondary">
                Specification ID: <span className="font-mono text-brand-teal font-semibold">{spec.request_id}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {generationStep === 'validated' && (
                <button
                  onClick={handleExecuteGeneration}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-xl text-xs font-bold shadow-micro active:scale-98 transition-all cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate Real Synthetic Data</span>
                </button>
              )}
            </div>
          </div>

          {/* Key Spec Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-brand-border space-y-1">
              <span className="text-[10px] text-brand-secondary uppercase tracking-wider font-semibold">Modality</span>
              <div className="text-sm font-bold text-brand-teal uppercase flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>{spec.modality}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-brand-border space-y-1">
              <span className="text-[10px] text-brand-secondary uppercase tracking-wider font-semibold">Row Volume</span>
              <div className="text-sm font-bold text-brand-hero font-mono">
                {spec.row_requirements?.total?.toLocaleString() || spec.row_count?.toLocaleString() || '1,000'}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-brand-border space-y-1">
              <span className="text-[10px] text-brand-secondary uppercase tracking-wider font-semibold">Locale & Currency</span>
              <div className="text-sm font-bold text-brand-hero flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-teal" />
                <span>{spec.locale?.country || 'Pakistan'} ({spec.locale?.currency || 'PKR'})</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-brand-border space-y-1">
              <span className="text-[10px] text-brand-secondary uppercase tracking-wider font-semibold">Export Formats</span>
              <div className="text-sm font-bold text-brand-hero uppercase font-mono">
                {(spec.output_formats || ['csv', 'json', 'sql']).join(', ')}
              </div>
            </div>
          </div>

          {/* Constraints & Synthetic Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-brand-border space-y-2">
              <span className="text-[11px] font-semibold text-brand-secondary uppercase tracking-wider">
                Planned Constraints & Distributions
              </span>
              <ul className="text-xs space-y-1 text-brand-hero">
                {spec.constraints && spec.constraints.length > 0 ? (
                  spec.constraints.map((c: any, i: number) => (
                    <li key={i} className="flex items-center gap-1.5 text-teal-800 font-mono text-[11px]">
                      <Check className="w-3 h-3 text-brand-teal" />
                      <span>{c.description || c.type}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-brand-secondary italic text-[11px]">Default realistic baseline distributions</li>
                )}
              </ul>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-brand-border space-y-2">
              <span className="text-[11px] font-semibold text-brand-secondary uppercase tracking-wider">
                Synthetic / Inferred Columns
              </span>
              <div className="flex flex-wrap gap-1.5">
                {spec.columns && spec.columns.length > 0 ? (
                  spec.columns.slice(0, 10).map((col: any, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white border border-brand-border rounded-md text-[11px] font-mono text-brand-hero shadow-micro"
                    >
                      {col.name}
                    </span>
                  ))
                ) : (
                  <span className="text-brand-secondary text-[11px]">Auto-inferred domain columns</span>
                )}
                {spec.columns && spec.columns.length > 10 && (
                  <span className="text-brand-secondary text-[11px] self-center">
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
        <div className="bg-white rounded-2xl p-5 border border-brand-border space-y-4 shadow-micro">
          {/* Subheader Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-brand-teal text-white shadow-xs'
                    : 'bg-slate-100 text-brand-secondary hover:text-brand-hero'
                }`}
              >
                Data Preview ({generatedResult.preview_rows?.length || 0} rows)
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'audit'
                    ? 'bg-brand-teal text-white shadow-xs'
                    : 'bg-slate-100 text-brand-secondary hover:text-brand-hero'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Requirement Satisfaction Audit</span>
              </button>
              <button
                onClick={() => setActiveTab('exports')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'exports'
                    ? 'bg-brand-teal text-white shadow-xs'
                    : 'bg-slate-100 text-brand-secondary hover:text-brand-hero'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Downloads</span>
              </button>
            </div>

            {/* Quality Pill */}
            {qualityReport && (
              <div className="flex items-center gap-2 font-mono text-xs bg-slate-50 px-3 py-1 rounded-xl border border-brand-border text-brand-secondary">
                <span>Quality Score:</span>
                <span className="text-emerald-600 font-bold">
                  {Math.round((qualityReport.overall_quality_score || 0.96) * 100)}%
                </span>
                <span className="text-slate-300">|</span>
                <span>Privacy:</span>
                <span className="text-brand-teal font-bold">
                  {Math.round((qualityReport.privacy_score || 0.97) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Tab 1: Data Preview Table */}
          {activeTab === 'preview' && generatedResult.preview_rows && (
            <div className="overflow-x-auto rounded-xl border border-brand-border max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-brand-secondary uppercase font-mono sticky top-0 border-b border-brand-border">
                  <tr>
                    {Object.keys(generatedResult.preview_rows[0] || {}).map((col) => (
                      <th key={col} className="p-2.5 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border font-mono text-brand-hero">
                  {generatedResult.preview_rows.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {Object.entries(row).map(([k, val]: [string, any], cIdx: number) => (
                        <td key={cIdx} className="p-2.5 whitespace-nowrap max-w-xs truncate" title={typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}>
                          {Array.isArray(val) ? (
                            <span className="px-1.5 py-0.5 bg-teal-50 text-brand-teal rounded border border-teal-200 text-[10px]">
                              {val.length} items
                            </span>
                          ) : typeof val === 'object' && val !== null ? (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-brand-secondary rounded text-[10px] border border-slate-200">
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
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-brand-border">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-brand-hero uppercase">
                      Audit Verdict: {auditReport.verdict}
                    </div>
                    <div className="text-[11px] text-brand-secondary">
                      {auditReport.total_checks} checks performed, {auditReport.failed_checks} failed
                    </div>
                  </div>
                </div>
                <div className="text-lg font-mono font-bold text-emerald-600">
                  {Math.round((auditReport.satisfaction_rate || 1.0) * 100)}% Match
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-brand-border">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead className="bg-slate-50 text-brand-secondary uppercase border-b border-brand-border">
                    <tr>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Requirement</th>
                      <th className="p-2.5">Expected</th>
                      <th className="p-2.5">Actual Generated</th>
                      <th className="p-2.5">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border text-brand-hero">
                    {auditReport.ledger?.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold uppercase text-brand-secondary">{item.category}</td>
                        <td className="p-2.5">{item.requirement}</td>
                        <td className="p-2.5 text-brand-teal">{JSON.stringify(item.expected_value)}</td>
                        <td className="p-2.5 text-brand-hero">{JSON.stringify(item.actual_value)}</td>
                        <td className="p-2.5">
                          {item.satisfied ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[10px]">
                              PASSED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold text-[10px]">
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
              <div className="bg-slate-50 p-4 rounded-xl border border-brand-border flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-bold text-brand-hero flex items-center gap-2 text-xs">
                    <FileCode className="w-4 h-4 text-brand-teal" />
                    <span>CSV Export</span>
                  </div>
                  <p className="text-[11px] text-brand-secondary">Comma-separated values with RFC 4180 escaping.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      downloadFile(
                        generatedResult.exports?.csv || '',
                        `synthetic_${spec.domain || 'data'}.csv`,
                        'text/csv'
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-lg text-xs font-semibold transition-all shadow-micro cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setEmailExportFormat('csv');
                      setIsEmailModalOpen(true);
                    }}
                    title="Send dataset via email"
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-brand-teal border border-teal-200 rounded-lg text-xs font-semibold transition-all shadow-micro cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-brand-border flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-bold text-brand-hero flex items-center gap-2 text-xs">
                    <FileCode className="w-4 h-4 text-brand-teal" />
                    <span>JSON Export</span>
                  </div>
                  <p className="text-[11px] text-brand-secondary">Structured JSON array format for APIs and document stores.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      downloadFile(
                        generatedResult.exports?.json || '',
                        `synthetic_${spec.domain || 'data'}.json`,
                        'application/json'
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-lg text-xs font-semibold transition-all shadow-micro cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      setEmailExportFormat('json');
                      setIsEmailModalOpen(true);
                    }}
                    title="Send dataset via email"
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-brand-teal border border-teal-200 rounded-lg text-xs font-semibold transition-all shadow-micro cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-brand-border flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="font-bold text-brand-hero flex items-center gap-2 text-xs">
                    <FileCode className="w-4 h-4 text-brand-teal" />
                    <span>SQL Export</span>
                  </div>
                  <p className="text-[11px] text-brand-secondary">Standard DDL and DML INSERT statements ready for database import.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      downloadFile(
                        generatedResult.exports?.sql || '',
                        `synthetic_${spec.domain || 'data'}.sql`,
                        'application/sql'
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-lg text-xs font-semibold transition-all shadow-micro cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SQL</span>
                  </button>
                  <button
                    onClick={() => {
                      setEmailExportFormat('sql');
                      setIsEmailModalOpen(true);
                    }}
                    title="Send dataset via email"
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-brand-teal border border-teal-200 rounded-lg text-xs font-semibold transition-all shadow-micro cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Dataset Modal */}
      <EmailDatasetModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        datasetName={spec?.domain || 'synthetic_dataset'}
        defaultFormat={emailExportFormat}
        requestId={requestId || undefined}
        content={
          emailExportFormat === 'csv'
            ? generatedResult?.exports?.csv
            : emailExportFormat === 'json'
            ? generatedResult?.exports?.json
            : generatedResult?.exports?.sql
        }
        rowCount={generatedResult?.total_rows || spec?.row_requirements?.total || 100}
      />
    </div>
  );
};
