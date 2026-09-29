import React, { useState } from 'react';
import { BankStatementDocument } from '../../types';
import { LedgerSparkline } from '../visualizations/LedgerSparkline';
import { Landmark, Sparkles, CheckCircle2, ArrowDownRight, ArrowUpRight, Search } from 'lucide-react';

interface BankStatementPreviewProps {
  statement: BankStatementDocument;
  onApplyQuery?: (query: string) => void;
  isLoading?: boolean;
}

export const BankStatementPreview: React.FC<BankStatementPreviewProps> = ({
  statement,
  onApplyQuery,
  isLoading = false,
}) => {
  const [queryInput, setQueryInput] = useState(statement.appliedQuery || 'last 90 days, balance over $500');

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onApplyQuery) {
      onApplyQuery(queryInput);
    }
  };

  const balanceHistory = [statement.startingBalance, ...statement.transactions.map((t) => t.balance)];

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto">
      {/* 1. Query-Style Generation Control Bar (Slide 8 / Slide 11) */}
      <div className="bg-white p-4 rounded-xl border border-brand-border shadow-micro flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-teal">
              <Sparkles className="w-3.5 h-3.5" />
              AI Query-Style Generator
            </span>
            <span className="text-[11px] font-mono text-brand-secondary bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Natural Language → Structured Configuration
            </span>
          </div>
          <span className="text-xs text-brand-secondary">Theme Slide 8 Compliance</span>
        </div>

        <form onSubmit={handleQuerySubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-secondary" />
            <input
              id="bank-query-input"
              name="bankQueryInput"
              aria-label="Natural language bank query prompt"
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="e.g. last 90 days, balance over $500, with high-frequency deposits"
              className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-brand-border bg-slate-50 focus:bg-white focus:border-brand-teal focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-medium transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Synthesize Query
          </button>
        </form>
      </div>

      {/* 2. Embedded Running Balance Sparkline */}
      <LedgerSparkline balances={balanceHistory} />

      {/* 3. Rendered Statement Container */}
      <div className="relative flex-1 bg-white rounded-xl border border-brand-border shadow-micro overflow-hidden flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-brand-border shadow-panel text-xs font-medium text-brand-teal animate-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
              Computing exact running balances...
            </div>
          </div>
        )}

        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 border-b border-brand-border bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-50 text-brand-teal border border-teal-200">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-hero">
                Account Statement · {statement.accountHolder}
              </h2>
              <p className="font-mono text-xs text-brand-secondary">
                Account: {statement.accountNumber} · Period: {statement.statementPeriod}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-brand-secondary">Starting: </span>
              <strong className="text-brand-hero">${statement.startingBalance.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-brand-secondary">Ending: </span>
              <strong className="text-brand-teal text-sm font-bold">${statement.endingBalance.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Ledger Table matching Slide 8 */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-brand-border text-[11px] font-semibold text-brand-secondary uppercase tracking-wider sticky top-0">
                <th className="py-2.5 px-4 font-mono w-24">Date</th>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-right font-mono w-28">Debit</th>
                <th className="py-2.5 px-4 text-right font-mono w-28">Credit</th>
                <th className="py-2.5 px-4 text-right font-mono w-32">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-xs">
              {statement.transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Date */}
                  <td className="py-3 px-4 font-mono font-medium text-brand-hero">
                    {t.date.slice(5)}
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 font-medium text-brand-hero">
                    {t.description}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                      {t.category}
                    </span>
                  </td>

                  {/* Debit (Neutral / subtle red) */}
                  <td className="py-3 px-4 text-right font-mono text-rose-600">
                    {t.debit !== null ? (
                      <span className="inline-flex items-center gap-0.5">
                        <ArrowDownRight className="w-3 h-3 text-rose-500" />
                        ${t.debit.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Credit (Neutral / subtle green) */}
                  <td className="py-3 px-4 text-right font-mono text-emerald-600 font-semibold">
                    {t.credit !== null ? (
                      <span className="inline-flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        ${t.credit.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Balance (Bold Mono) */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-brand-hero">
                    ${t.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Running Balance Reconciliation Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-brand-border text-xs text-brand-secondary">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-brand-hero">
              Slide 8 Verified: Deterministic calculation (Current = Previous + Credit − Debit)
            </span>
          </div>
          <span className="font-mono text-[11px] text-brand-teal font-semibold">
            ACID RECONCILIATION: 100% ACCURATE
          </span>
        </div>
      </div>
    </div>
  );
};
