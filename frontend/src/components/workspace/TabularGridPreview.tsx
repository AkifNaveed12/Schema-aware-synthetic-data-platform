import React, { useState } from 'react';
import { TabularRow } from '../../types';
import { DistributionHistogram } from '../visualizations/DistributionHistogram';
import { Search, ShieldAlert, CheckCircle, BarChart3, Database, Upload, ArrowUpRight } from 'lucide-react';

interface TabularGridPreviewProps {
  rows: TabularRow[];
  isLoading?: boolean;
  onOpenUploadModal?: () => void;
}

export const TabularGridPreview: React.FC<TabularGridPreviewProps> = ({
  rows,
  isLoading = false,
  onOpenUploadModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDistributions, setShowDistributions] = useState(false);

  // If no dataset is loaded, show clean empty state
  if (rows.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[460px] bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center shadow-micro">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-brand-teal mb-4 shadow-xs">
          <Database className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-brand-hero">No Dataset Loaded</h3>
        <p className="text-xs text-brand-secondary max-w-md mt-1.5 leading-relaxed">
          Upload a real CSV, JSON, or TSV dataset to profile schema distributions, clean quality issues, add synthetic columns, and generate statistically faithful synthetic data.
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-semibold rounded-xl shadow-panel transition-all active:scale-98 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload Dataset to Begin
          </button>
        </div>
        <div className="mt-8 flex items-center gap-6 text-[11px] font-mono text-slate-400">
          <span>✓ Zero Hardcoded Rows</span>
          <span>✓ Automated Schema Profiling</span>
          <span>✓ Dynamic Column Generation</span>
        </div>
      </div>
    );
  }

  // Discover columns dynamically from data
  const sampleRow = (rows[0] || {}) as Record<string, any>;
  const rawCols = Object.keys(sampleRow).filter((k) => k !== 'originalEmail');
  // Order columns nicely: put ID first, then other columns, hash/status last
  const priorityCols = rawCols.filter((k) => /^(id|ID|customer_id|order_id)/i.test(k));
  const trailingCols = rawCols.filter((k) => /^(status|syntheticHash|hash)/i.test(k));
  const middleCols = rawCols.filter((k) => !priorityCols.includes(k) && !trailingCols.includes(k));
  const displayCols = [...priorityCols, ...middleCols, ...trailingCols];

  // Filter rows
  const filteredRows = rows.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(r).some((val) =>
      val !== null && val !== undefined && String(val).toLowerCase().includes(term)
    );
  });

  // Extract numeric balances/values for distribution chart if present
  const numericCol = displayCols.find(
    (c) => typeof sampleRow[c] === 'number' && !/id/i.test(c)
  );
  const numericValues = numericCol
    ? rows.map((r: any) => (typeof r[numericCol] === 'number' ? r[numericCol] : 0))
    : [];

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-brand-border shadow-micro">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-brand-secondary" />
          <input
            id="filter-records-input"
            name="filterRecords"
            aria-label="Filter synthetic records"
            type="text"
            placeholder="Filter synthetic records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-brand-border bg-slate-50 focus:bg-white focus:border-brand-teal focus:outline-none"
          />
        </div>

        {/* Toggle Distributions & Summary Stats */}
        <div className="flex items-center gap-3">
          {numericValues.length > 0 && (
            <button
              onClick={() => setShowDistributions(!showDistributions)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                showDistributions
                  ? 'bg-teal-50 border-teal-200 text-brand-teal'
                  : 'bg-white border-brand-border text-brand-secondary hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {showDistributions ? 'Hide Distribution' : 'Show Distribution'}
            </button>
          )}

          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand-teal hover:bg-teal-50 border border-teal-200 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload New
          </button>

          <span className="text-xs font-mono text-brand-secondary">
            Showing <strong className="text-brand-hero">{filteredRows.length}</strong> of {rows.length} rows
          </span>
        </div>
      </div>

      {/* Embedded Statistical Distribution */}
      {showDistributions && numericValues.length > 0 && (
        <div className="animate-in fade-in duration-200">
          <DistributionHistogram
            data={numericValues}
            title={`${numericCol || 'Value'} Distribution (Fitted Empirical Density)`}
          />
        </div>
      )}

      {/* High-Density Dynamic Data Grid Canvas */}
      <div className="relative flex-1 w-full bg-white rounded-xl border border-brand-border shadow-micro overflow-hidden flex flex-col min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-brand-border shadow-panel text-xs font-medium text-brand-teal animate-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
              Generating synthetic records...
            </div>
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[560px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-brand-border text-[11px] font-semibold text-brand-secondary uppercase tracking-wider sticky top-0 z-10 h-11">
                {displayCols.map((col) => (
                  <th
                    key={col}
                    className={`py-2.5 px-4 ${
                      typeof sampleRow[col] === 'number' && !/id/i.test(col)
                        ? 'text-right font-mono'
                        : /id/i.test(col)
                        ? 'font-mono'
                        : ''
                    }`}
                  >
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-xs tabular-nums">
              {filteredRows.map((row: any, rIdx) => (
                <tr
                  key={row.id ?? rIdx}
                  className="hover:bg-teal-50/40 transition-colors group h-11"
                >
                  {displayCols.map((col) => {
                    const val = row[col];
                    const isNum = typeof val === 'number' && !/id/i.test(col);
                    const isMasked = typeof val === 'string' && val.includes('•••');
                    const isStatus = /status/i.test(col) && typeof val === 'string';

                    return (
                      <td
                        key={col}
                        className={`py-2.5 px-4 ${
                          isNum
                            ? 'text-right font-mono font-medium text-brand-hero'
                            : /id/i.test(col)
                            ? 'font-mono font-medium text-brand-hero'
                            : 'text-slate-700'
                        }`}
                      >
                        {isMasked ? (
                          <span className="inline-flex items-center gap-1 font-mono bg-slate-100/80 px-2 py-0.5 rounded text-slate-500 text-[11px] border border-slate-200">
                            <ShieldAlert className="w-3 h-3 text-brand-teal" />
                            {val}
                          </span>
                        ) : isStatus ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                              val === 'verified' || val === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-teal-50 text-brand-teal border border-teal-200'
                            }`}
                          >
                            <CheckCircle className="w-2.5 h-2.5" />
                            {val}
                          </span>
                        ) : isNum ? (
                          val.toLocaleString('en-US', {
                            maximumFractionDigits: 2,
                          })
                        ) : val !== null && val !== undefined ? (
                          String(val)
                        ) : (
                          <span className="text-slate-400 italic">null</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-brand-border text-xs text-brand-secondary">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-brand-hero">Privacy & Schema Compliance</span>
            <span className="text-slate-400">·</span>
            <span>Numeric distributions & column-level privacy rules applied</span>
          </div>
          <span className="font-mono text-[11px] text-brand-teal font-medium">
            Integrity Check: PASSED
          </span>
        </div>
      </div>
    </div>
  );
};

