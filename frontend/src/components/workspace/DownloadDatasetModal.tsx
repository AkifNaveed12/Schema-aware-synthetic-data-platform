import React from 'react';
import { X, Download, Network, Table, FileDown } from 'lucide-react';

interface DownloadDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DatasetEntry {
  name: string;
  description: string;
  file: string;
  rows: number;
  columns: string;
  category: 'relational' | 'tabular';
}

const DATASETS: DatasetEntry[] = [
  // ── Relational ──────────────────────────────────────────────────────────────
  {
    name: 'Customers',
    description: 'E-commerce customer records with city, state, and ZIP code.',
    file: '/samples/customers_sample.csv',
    rows: 500,
    columns: 'customer_id, city, customer_state …',
    category: 'relational',
  },
  {
    name: 'Orders',
    description: 'Order lifecycle data — purchase, approval, delivery timestamps.',
    file: '/samples/orders_sample.csv',
    rows: 500,
    columns: 'order_id, customer_id, order_status, timestamps …',
    category: 'relational',
  },
  {
    name: 'Customer Signups',
    description: 'Customer registration data keyed by customer_id and signup date.',
    file: '/samples/customer_orders_sample.csv',
    rows: 500,
    columns: 'customer_id, city, signup_date',
    category: 'relational',
  },
  // ── Tabular ─────────────────────────────────────────────────────────────────
  {
    name: 'Employee Salary',
    description: 'HR dataset — job titles, education, experience, and salary in USD.',
    file: '/samples/employee_salary_sample.csv',
    rows: 200,
    columns: 'Job Title, Education Level, Experience, Salary (USD) …',
    category: 'tabular',
  },
  {
    name: 'Customer Churn',
    description: 'Banking churn model dataset — credit score, balance, churn label.',
    file: '/samples/customer_churn_sample.csv',
    rows: 500,
    columns: 'CreditScore, Geography, Age, Balance, Exited …',
    category: 'tabular',
  },
];

export const DownloadDatasetModal: React.FC<DownloadDatasetModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleDownload = (entry: DatasetEntry) => {
    const a = document.createElement('a');
    a.href = entry.file;
    a.download = entry.file.split('/').pop() ?? 'dataset.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const relational = DATASETS.filter((d) => d.category === 'relational');
  const tabular = DATASETS.filter((d) => d.category === 'tabular');

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal Panel */}
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white border border-brand-border shadow-modal overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 border border-teal-200">
              <FileDown className="h-3.5 w-3.5 text-brand-teal" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-hero leading-tight">Download Sample Dataset</h2>
              <p className="text-[11px] text-brand-secondary font-mono">Ready-to-use datasets for testing DataVault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-brand-secondary hover:text-brand-hero hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Relational Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Network className="h-3.5 w-3.5 text-cyan-600" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-secondary">Relational</span>
            </div>
            <div className="space-y-2.5">
              {relational.map((d) => (
                <DatasetCard key={d.file} entry={d} onDownload={handleDownload} />
              ))}
            </div>
          </div>

          {/* Tabular Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Table className="h-3.5 w-3.5 text-brand-teal" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-secondary">Tabular</span>
            </div>
            <div className="space-y-2.5">
              {tabular.map((d) => (
                <DatasetCard key={d.file} entry={d} onDownload={handleDownload} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-brand-border bg-slate-50 shrink-0">
          <p className="text-[11px] text-brand-secondary font-mono text-center">
            Download → Upload into DataVault → Analyze → Generate → Export
          </p>
        </div>
      </div>
    </div>
  );
};

/* ── Dataset Card ─────────────────────────────────────────────────────────── */
const DatasetCard: React.FC<{
  entry: DatasetEntry;
  onDownload: (e: DatasetEntry) => void;
}> = ({ entry, onDownload }) => (
  <div className="flex items-start justify-between gap-3 rounded-xl border border-brand-border bg-white p-3.5 hover:border-teal-300 hover:shadow-micro transition-all group">
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold text-brand-hero truncate">{entry.name}</p>
      <p className="text-[11px] text-brand-secondary mt-0.5 leading-relaxed">{entry.description}</p>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-brand-teal bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
          CSV
        </span>
        <span className="font-mono text-[10px] text-brand-secondary bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
          {entry.rows.toLocaleString()} rows
        </span>
      </div>
    </div>
    <button
      onClick={() => onDownload(entry)}
      className="shrink-0 flex items-center gap-1.5 rounded-lg bg-brand-teal hover:bg-brand-teal-hover text-white px-3 py-1.5 text-[11px] font-semibold transition-all shadow-xs active:scale-95 whitespace-nowrap"
    >
      <Download className="h-3.5 w-3.5" />
      Download
    </button>
  </div>
);
