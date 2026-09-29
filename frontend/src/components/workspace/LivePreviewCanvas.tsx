import React from 'react';
import {
  ModalityType,
  DocumentSubtype,
  TabularRow,
  RelationalDataset,
  InvoiceDocument,
  BankStatementDocument,
  GenerationConfig,
} from '../../types';
import { TabularGridPreview } from './TabularGridPreview';
import { RelationalView } from './RelationalView';
import { InvoiceDocumentPreview } from './InvoiceDocumentPreview';
import { BankStatementPreview } from './BankStatementPreview';
import { Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';

interface LivePreviewCanvasProps {
  modality: ModalityType;
  docSubtype: DocumentSubtype;
  config: GenerationConfig;
  tabularRows: TabularRow[];
  relationalDataset: RelationalDataset;
  invoice: InvoiceDocument;
  bankStatement: BankStatementDocument;
  isLoading: boolean;
  onRefresh: () => void;
  onApplyBankQuery: (query: string) => void;
  onOpenEvaluation?: () => void;
  onOpenUploadModal?: () => void;
}

export const LivePreviewCanvas: React.FC<LivePreviewCanvasProps> = ({
  modality,
  docSubtype,
  config,
  tabularRows,
  relationalDataset,
  invoice,
  bankStatement,
  isLoading,
  onRefresh,
  onApplyBankQuery,
  onOpenEvaluation,
  onOpenUploadModal,
}) => {
  return (
    <main className="flex-1 min-w-[480px] lg:min-w-[600px] flex flex-col h-full bg-brand-stage overflow-hidden p-6 select-text">
      {/* Top Canvas Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-teal">
              LIVE PREVIEW CANVAS · THEME SLIDE 10
            </span>
            <button
              onClick={onOpenEvaluation}
              title="Click to view full quality & evaluation report"
              className="flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-all cursor-pointer shadow-micro"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Referential Integrity: 100% Valid · Audit Report
            </button>
          </div>

          <h1 className="text-xl font-bold text-brand-hero tracking-tight mt-0.5">
            {modality === 'tabular' && 'Tabular Synthetic Records'}
            {modality === 'relational' && 'Relational Multi-Table Schema & Data'}
            {modality === 'documents' && docSubtype === 'invoices' && 'Synthesized Invoices (#INV-10432)'}
            {modality === 'documents' && docSubtype === 'bank_statements' && 'Financial Bank Statement Ledger'}
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            See generated rows update instantly as settings change on the right.
          </p>
        </div>

        {/* Action Controls & Shimmer Indicator */}
        <div className="flex items-center gap-3">
          {onOpenUploadModal && modality === 'tabular' && (
            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 shadow-micro transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Upload Dataset
            </button>
          )}

          {isLoading && (
            <div className="flex items-center gap-1.5 font-mono text-xs text-brand-teal bg-teal-50 px-3 py-1 rounded-lg border border-teal-200 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Generating...
            </div>
          )}

          <div className="flex items-center gap-2 font-mono text-xs text-brand-secondary bg-white px-3 py-1.5 rounded-lg border border-brand-border shadow-micro">
            <span>Seed:</span>
            <strong className="text-brand-hero">#{config.randomSeed}</strong>
          </div>

          <button
            onClick={onRefresh}
            title="Force refresh current preview"
            className="flex items-center gap-1.5 p-2 rounded-lg border border-brand-border bg-white text-brand-secondary hover:text-brand-hero hover:bg-slate-50 transition-all shadow-micro active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-brand-teal" />
          </button>
        </div>
      </div>


      {/* Main Canvas Body */}
      <div className="flex-1 overflow-hidden pt-4">
        {modality === 'tabular' && (
          <TabularGridPreview rows={tabularRows} isLoading={isLoading} />
        )}

        {modality === 'relational' && (
          <RelationalView dataset={relationalDataset} isLoading={isLoading} />
        )}

        {modality === 'documents' && docSubtype === 'invoices' && (
          <InvoiceDocumentPreview invoice={invoice} isLoading={isLoading} />
        )}

        {modality === 'documents' && docSubtype === 'bank_statements' && (
          <BankStatementPreview
            statement={bankStatement}
            onApplyQuery={onApplyBankQuery}
            isLoading={isLoading}
          />
        )}
      </div>
    </main>
  );
};
