import React from 'react';
import { Table, Network, FileText, Receipt, Landmark, Shield, Sparkles, Upload, Cpu, Target, RefreshCw, Brain } from 'lucide-react';
import { ModalityType, DocumentSubtype } from '../../types';

interface WorkspaceSidebarProps {
  activeModality: ModalityType;
  activeDocSubtype: DocumentSubtype;
  onSelectModality: (modality: ModalityType) => void;
  onSelectDocSubtype: (subtype: DocumentSubtype) => void;
  activeSeed: number;
  onOpenEvaluation?: () => void;
  onOpenUploadModal?: () => void;
  onOpenBenchmark?: () => void;
  onOpenTstr?: () => void;
  onOpenRegeneration?: () => void;
  onOpenSemantic?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  activeModality,
  activeDocSubtype,
  onSelectModality,
  onSelectDocSubtype,
  activeSeed,
  onOpenEvaluation,
  onOpenUploadModal,
  onOpenBenchmark,
  onOpenTstr,
  onOpenRegeneration,
  onOpenSemantic,
  isMobileOpen = false,
}) => {
  return (
    <aside className={`flex flex-col justify-between w-64 min-w-[256px] h-full bg-white text-brand-hero p-4 border-r border-brand-border select-none z-30 transition-transform duration-200
      ${isMobileOpen
        ? 'fixed inset-y-0 left-0 translate-x-0 shadow-modal'
        : 'hidden md:flex -translate-x-full md:translate-x-0 md:static'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-6">
        {/* Workspace Eyebrow */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-secondary">
            WORKSPACE
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-brand-teal bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
            <Sparkles className="w-2.5 h-2.5" /> AI Engine
          </span>
        </div>

        {/* Upload Custom Dataset Action */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold text-white bg-brand-teal hover:bg-brand-teal-hover shadow-micro transition-all active:scale-98 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Dataset</span>
        </button>

        {/* Primary Modality Navigation */}
        <nav className="flex flex-col gap-1.5">

          {/* Natural Language Generation Button */}
          <button
            onClick={() => onSelectModality('natural_language')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeModality === 'natural_language'
                ? 'bg-brand-teal text-white shadow-xs font-semibold'
                : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-100'
            }`}
          >
            <Sparkles className={`w-4 h-4 shrink-0 ${activeModality === 'natural_language' ? 'text-white' : 'text-brand-teal'}`} />
            <div className="flex flex-col text-left">
              <span className="font-semibold flex items-center gap-1.5">
                <span>NL Generator</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  activeModality === 'natural_language'
                    ? 'bg-white/20 text-white'
                    : 'bg-teal-50 text-brand-teal border border-teal-200'
                }`}>NEW</span>
              </span>
              <span className={`text-[10px] font-mono ${activeModality === 'natural_language' ? 'text-teal-100' : 'text-slate-400'}`}>
                Prompt & Voice → Full Spec
              </span>
            </div>
          </button>

          {/* Tabular Button */}
          <button
            onClick={() => onSelectModality('tabular')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeModality === 'tabular'
                ? 'bg-brand-teal text-white shadow-xs font-semibold'
                : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-100'
            }`}
          >
            <Table className={`w-4 h-4 ${activeModality === 'tabular' ? 'text-white' : 'text-brand-teal'}`} />
            <div className="flex flex-col text-left">
              <span className="font-semibold">Tabular</span>
              <span className={`text-[10px] font-mono ${activeModality === 'tabular' ? 'text-teal-100' : 'text-slate-400'}`}>
                Single table · Distributions
              </span>
            </div>
          </button>

          {/* Relational Button */}
          <button
            onClick={() => onSelectModality('relational')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeModality === 'relational'
                ? 'bg-brand-teal text-white shadow-xs font-semibold'
                : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-100'
            }`}
          >
            <Network className={`w-4 h-4 ${activeModality === 'relational' ? 'text-white' : 'text-cyan-600'}`} />
            <div className="flex flex-col text-left">
              <span className="font-semibold">Relational</span>
              <span className={`text-[10px] font-mono ${activeModality === 'relational' ? 'text-teal-100' : 'text-slate-400'}`}>
                Customers → Orders → Items
              </span>
            </div>
          </button>

          {/* Documents Group */}
          <div className="flex flex-col gap-1 pt-2">
            <button
              onClick={() => onSelectModality('documents')}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeModality === 'documents'
                  ? 'bg-brand-teal text-white shadow-xs font-semibold'
                  : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-4 h-4 ${activeModality === 'documents' ? 'text-white' : 'text-emerald-600'}`} />
                <div className="flex flex-col text-left">
                  <span className="font-semibold">Documents</span>
                  <span className={`text-[10px] font-mono ${activeModality === 'documents' ? 'text-teal-100' : 'text-slate-400'}`}>
                    Reconciled business docs
                  </span>
                </div>
              </div>
            </button>

            {/* Nested Document Sub-Items */}
            {activeModality === 'documents' && (
              <div className="flex flex-col gap-1 pl-7 pr-1 py-1 border-l-2 border-slate-200 ml-4 animate-in fade-in duration-200">
                <button
                  onClick={() => onSelectDocSubtype('invoices')}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                    activeDocSubtype === 'invoices'
                      ? 'bg-teal-50 text-brand-teal font-semibold border border-teal-200'
                      : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-100'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Invoices (INV-10432)
                </button>
                <button
                  onClick={() => onSelectDocSubtype('bank_statements')}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                    activeDocSubtype === 'bank_statements'
                      ? 'bg-teal-50 text-brand-teal font-semibold border border-teal-200'
                      : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-100'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  Bank Statements
                </button>
              </div>
            )}
          </div>

          {/* Differentiators & Empirical Tools */}
          <div className="flex flex-col gap-1 pt-3 border-t border-brand-border mt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-secondary px-2 pb-1">
              Empirical Tools
            </span>

            <button
              onClick={onOpenBenchmark}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand-secondary hover:text-brand-hero hover:bg-slate-100 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Model Benchmark</span>
            </button>

            <button
              onClick={onOpenTstr}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand-secondary hover:text-brand-hero hover:bg-slate-100 transition-colors"
            >
              <Target className="w-3.5 h-3.5 text-purple-600" />
              <span>TSTR Utility Test</span>
            </button>

            <button
              onClick={onOpenRegeneration}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand-secondary hover:text-brand-hero hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>Diagnostic Repair</span>
            </button>

            <button
              onClick={onOpenSemantic}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand-secondary hover:text-brand-hero hover:bg-slate-100 transition-colors"
            >
              <Brain className="w-3.5 h-3.5 text-brand-teal" />
              <span>Semantic AI</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="flex flex-col gap-3 pt-4 border-t border-brand-border text-[11px] font-mono">
        <div className="flex items-center justify-between text-brand-secondary px-1">
          <span>Active Seed</span>
          <span className="text-brand-hero font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            #{activeSeed}
          </span>
        </div>

        <button
          onClick={onOpenEvaluation}
          title="Open quality evaluation audit"
          className="flex items-center justify-between text-brand-secondary hover:text-brand-hero px-1 py-1 rounded hover:bg-slate-100 transition-all text-left w-full cursor-pointer"
        >
          <span>Integrity Engine</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Shield className="w-3 h-3" /> 100% Valid
          </span>
        </button>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-brand-border text-[10px] text-brand-secondary leading-relaxed">
          <span className="text-brand-teal font-semibold">HackData V2 Engine</span>
          <p className="mt-0.5">Schema-aware deterministic pipeline with Groq AI semantic layer.</p>
        </div>
      </div>
    </aside>
  );
};
