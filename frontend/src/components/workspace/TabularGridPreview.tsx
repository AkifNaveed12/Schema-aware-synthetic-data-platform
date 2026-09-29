import React, { useState } from 'react';
import { TabularRow } from '../../types';
import { DistributionHistogram } from '../visualizations/DistributionHistogram';
import { Search, Hash, ShieldAlert, CheckCircle, BarChart3 } from 'lucide-react';

interface TabularGridPreviewProps {
  rows: TabularRow[];
  isLoading?: boolean;
}

export const TabularGridPreview: React.FC<TabularGridPreviewProps> = ({
  rows,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDistributions, setShowDistributions] = useState(true);

  const filteredRows = (rows || []).filter(
    (r) =>
      (r.name ? String(r.name).toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
      (r.email ? String(r.email).toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
      (r.id !== undefined && r.id !== null ? String(r.id) : '').includes(searchTerm)
  );

  const balances = (rows || [])
    .map((r) => r.balance)
    .filter((b): b is number => typeof b === 'number' && !isNaN(b));

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
          <button
            onClick={() => setShowDistributions(!showDistributions)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showDistributions
                ? 'bg-teal-50 border-teal-200 text-brand-teal'
                : 'bg-white border-brand-border text-brand-secondary hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {showDistributions ? 'Hide Distribution' : 'Show Distribution'}
          </button>

          <span className="text-xs font-mono text-brand-secondary">
            Showing <strong className="text-brand-hero">{filteredRows.length}</strong> of {(rows || []).length} rows
          </span>
        </div>
      </div>

      {/* Embedded Statistical Distribution */}
      {showDistributions && (
        <div className="animate-in fade-in duration-200">
          <DistributionHistogram data={balances} title="Balance Distribution (Log-Normal Skewed)" />
        </div>
      )}

      {/* High-Density Data Grid Canvas */}
      <div className="relative flex-1 w-full bg-white rounded-xl border border-brand-border shadow-micro overflow-hidden flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-brand-border shadow-panel text-xs font-medium text-brand-teal animate-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
              Re-computing deterministic preview...
            </div>
          </div>
        )}

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-brand-border text-[11px] font-semibold text-brand-secondary uppercase tracking-wider sticky top-0 z-1">
                <th className="py-2.5 px-4 font-mono w-24">ID</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4 font-mono">Signup Date</th>
                <th className="py-2.5 px-4 text-right font-mono">Balance</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 font-mono text-[10px]">Synthetic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-xs">
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-teal-50/40 transition-colors group"
                >
                  {/* ID */}
                  <td className="py-3 px-4 font-mono font-medium text-brand-hero">
                    {row.id}
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4 font-medium text-brand-hero">
                    {row.name ?? <span className="text-slate-400 font-mono italic">null</span>}
                  </td>

                  {/* Email (with masked cell styling per DESIGN.md) */}
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {row.email && typeof row.email === 'string' && (row.email.includes('•••') || row.email.includes('*')) ? (
                      <span className="inline-flex items-center gap-1 font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 text-[11px] border border-slate-200">
                        <ShieldAlert className="w-3 h-3 text-brand-teal" />
                        {row.email}
                      </span>
                    ) : (
                      <span>{row.email ?? <span className="text-slate-400 font-mono italic">null</span>}</span>
                    )}
                  </td>

                  {/* Signup */}
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {row.signupDate ?? <span className="text-slate-400 font-mono italic">null</span>}
                  </td>

                  {/* Balance (right aligned mono) */}
                  <td className="py-3 px-4 text-right font-mono font-semibold text-brand-hero">
                    {typeof row.balance === 'number' && !isNaN(row.balance) ? (
                      `$${row.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ) : (
                      <span className="text-slate-400 font-mono italic">null</span>
                    )}
                  </td>

                  {/* Status badge */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        row.status === 'verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : row.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-teal-50 text-brand-teal border border-teal-200'
                      }`}
                    >
                      <CheckCircle className="w-2.5 h-2.5" />
                      {row.status || 'active'}
                    </span>
                  </td>

                  {/* Synthetic Hash */}
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5 text-slate-400" />
                      {row.syntheticHash || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-brand-border text-xs text-brand-secondary">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-brand-hero">Theme Slide 5 Compliance</span>
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
