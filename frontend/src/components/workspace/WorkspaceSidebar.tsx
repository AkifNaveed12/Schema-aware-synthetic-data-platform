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
    <aside className={`flex flex-col justify-between w-64 min-w-[256px] h-full bg-brand-sidebar text-slate-300 p-4 border-r border-slate-800 select-none z-30 transition-transform duration-200
      ${isMobileOpen
        ? 'fixed inset-y-0 left-0 translate-x-0 shadow-modal'
        : 'hidden md:flex -translate-x-full md:translate-x-0 md:static'
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-6">
        {/* Workspace Eyebrow */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            WORKSPACE
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-teal-400 bg-teal-950/70 px-1.5 py-0.5 rounded border border-teal-800/50">
            <Sparkles className="w-2.5 h-2.5" /> AI Engine
          </span>
        </div>

        {/* Upload Custom Dataset Action */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 shadow-xs transition-all active:scale-98"
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
                ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white border border-teal-500/40 shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="font-semibold flex items-center gap-1.5">
                <span>NL Generator</span>
                <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1 py-0.2 rounded font-mono">NEW</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Prompt & Voice → Full Spec</span>
            </div>
          </button>

          {/* Tabular Button */}
          <button
            onClick={() => onSelectModality('tabular')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeModality === 'tabular'
                ? 'bg-teal-700/80 text-white border border-teal-500/30 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Table className="w-4 h-4 text-teal-400" />
            <div className="flex flex-col text-left">
              <span className="font-semibold">Tabular</span>
              <span className="text-[10px] text-slate-400 font-mono">Single table · Distributions</span>
            </div>
          </button>

          {/* Relational Button */}
          <button
            onClick={() => onSelectModality('relational')}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeModality === 'relational'
                ? 'bg-teal-700/80 text-white border border-teal-500/30 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Network className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col text-left">
              <span className="font-semibold">Relational</span>
              <span className="text-[10px] text-slate-400 font-mono">Customers → Orders → Items</span>
            </div>
          </button>

          {/* Documents Group */}
          <div className="flex flex-col gap-1 pt-2">
            <button
              onClick={() => onSelectModality('documents')}
              className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeModality === 'documents'
                  ? 'bg-teal-700/80 text-white border border-teal-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <div className="flex flex-col text-left">
                  <span className="font-semibold">Documents</span>
                  <span className="text-[10px] text-slate-400 font-mono">Reconciled business docs</span>
                </div>
              </div>
            </button>

            {/* Nested Document Sub-Items */}
            {activeModality === 'documents' && (
              <div className="flex flex-col gap-1 pl-7 pr-1 py-1 border-l-2 border-slate-700 ml-4 animate-in fade-in duration-200">
                <button
                  onClick={() => onSelectDocSubtype('invoices')}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                    activeDocSubtype === 'invoices'
                      ? 'bg-teal-900/60 text-teal-300 font-medium border border-teal-700/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Invoices (INV-10432)
                </button>
                <button
                  onClick={() => onSelectDocSubtype('bank_statements')}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                    activeDocSubtype === 'bank_statements'
                      ? 'bg-teal-900/60 text-teal-300 font-medium border border-teal-700/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5" />
                  Bank Statements
                </button>
              </div>
            )}
          </div>

          {/* Differentiators & Empirical Tools */}
          <div className="flex flex-col gap-1 pt-3 border-t border-slate-800/80 mt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 pb-1">
              Empirical Tools
            </span>

            <button
              onClick={onOpenBenchmark}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Model Benchmark</span>
            </button>

            <button
              onClick={onOpenTstr}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Target className="w-3.5 h-3.5 text-purple-400" />
              <span>TSTR Utility Test</span>
            </button>

            <button
              onClick={onOpenRegeneration}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Diagnostic Repair</span>
            </button>

            <button
              onClick={onOpenSemantic}
              className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Brain className="w-3.5 h-3.5 text-teal-400" />
              <span>Semantic AI</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800 text-[11px] font-mono">
        <div className="flex items-center justify-between text-slate-400 px-1">
          <span>Active Seed</span>
          <span className="text-teal-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
            #{activeSeed}
          </span>
        </div>

        <button
          onClick={onOpenEvaluation}
          title="Open quality evaluation audit"
          className="flex items-center justify-between text-slate-400 hover:text-white px-1 py-1 rounded hover:bg-slate-800/60 transition-all text-left w-full cursor-pointer"
        >
          <span>Integrity Engine</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Shield className="w-3 h-3" /> 100% Valid
          </span>
        </button>

        <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
          <span className="text-teal-400 font-semibold">HackData V2 Engine</span>
          <p className="mt-0.5">Schema-aware deterministic pipeline with Groq AI semantic layer.</p>
        </div>
      </div>
    </aside>
  );
};
