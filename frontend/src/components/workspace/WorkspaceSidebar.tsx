import React from 'react';
import { Table, Network, FileText, Receipt, Landmark, Shield, Sparkles } from 'lucide-react';
import { ModalityType, DocumentSubtype } from '../../types';

interface WorkspaceSidebarProps {
  activeModality: ModalityType;
  activeDocSubtype: DocumentSubtype;
  onSelectModality: (modality: ModalityType) => void;
  onSelectDocSubtype: (subtype: DocumentSubtype) => void;
  activeSeed: number;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  activeModality,
  activeDocSubtype,
  onSelectModality,
  onSelectDocSubtype,
  activeSeed,
}) => {
  return (
    <aside className="hidden md:flex flex-col justify-between w-64 min-w-[256px] h-full bg-brand-sidebar text-slate-300 p-4 border-r border-slate-800 select-none">
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

        {/* Primary Modality Navigation */}
        <nav className="flex flex-col gap-1.5">
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

        <div className="flex items-center justify-between text-slate-400 px-1">
          <span>Integrity Engine</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Shield className="w-3 h-3" /> 100% Valid
          </span>
        </div>

        <div className="rounded-lg bg-slate-900/80 p-2.5 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
          <span className="text-teal-400 font-semibold">HackData V2 Engine</span>
          <p className="mt-0.5">Schema-aware deterministic pipeline with Groq AI semantic layer.</p>
        </div>
      </div>
    </aside>
  );
};
