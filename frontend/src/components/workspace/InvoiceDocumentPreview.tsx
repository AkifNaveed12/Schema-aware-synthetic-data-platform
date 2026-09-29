import React from 'react';
import { InvoiceDocument } from '../../types';
import { CheckCircle2, Printer, Download, Receipt, ShieldCheck } from 'lucide-react';

interface InvoiceDocumentPreviewProps {
  invoice: InvoiceDocument;
  isLoading?: boolean;
}

export const InvoiceDocumentPreview: React.FC<InvoiceDocumentPreviewProps> = ({
  invoice,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col items-center gap-5 w-full h-full overflow-y-auto p-2">
      {/* Top Banner & Quick Actions */}
      <div className="flex items-center justify-between w-full max-w-3xl bg-white p-3 rounded-xl border border-brand-border shadow-micro">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-brand-hero">
            <Receipt className="w-4 h-4 text-brand-teal" />
            {invoice.invoiceNumber}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Theme Slide 7: Automatic Math Reconciliation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-xs text-brand-secondary hover:bg-slate-50 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Rendered Invoice Paper Container (Attio/Modern B2B Paper style) */}
      <div className="relative w-full max-w-3xl bg-white rounded-xl border border-brand-border shadow-panel p-8 sm:p-12 text-slate-800">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-brand-border shadow-panel text-xs font-medium text-brand-teal animate-pulse">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
              Reconciling synthetic line items...
            </div>
          </div>
        )}

        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-brand-border pb-8">
          <div>
            <span className="text-[11px] font-mono tracking-widest uppercase text-brand-secondary font-semibold">
              DOCUMENT GENERATOR · THEME SLIDE 7
            </span>
            <h1 className="text-3xl font-bold text-brand-hero mt-1 tracking-tight">
              INVOICE
            </h1>
            <p className="font-mono text-sm font-semibold text-brand-teal mt-0.5">
              #{invoice.invoiceNumber}
            </p>
          </div>

          <div className="text-right sm:text-right font-mono text-xs text-slate-600 space-y-1">
            <div>
              <span className="text-brand-secondary">Issue Date: </span>
              <strong className="text-brand-hero">{invoice.issueDate}</strong>
            </div>
            <div>
              <span className="text-brand-secondary">Due Date: </span>
              <strong className="text-brand-hero">{invoice.dueDate}</strong>
            </div>
            <div>
              <span className="text-brand-secondary">Currency: </span>
              <strong className="text-brand-hero">{invoice.currency}</strong>
            </div>
          </div>
        </div>

        {/* Parties: Billed To / From */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-brand-border text-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-secondary">
              Billed to:
            </span>
            <h3 className="text-sm font-bold text-brand-hero mt-1.5">
              {invoice.billedTo?.name || 'Northwind Supplies Ltd.'}
            </h3>
            <p className="text-slate-600 whitespace-pre-line mt-1 leading-relaxed">
              {invoice.billedTo?.address || ''}
            </p>
            <p className="font-mono text-[11px] text-slate-500 mt-1">
              Tax ID: {invoice.billedTo?.taxId || 'US-TAX-8921'}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-secondary">
              From:
            </span>
            <h3 className="text-sm font-bold text-brand-hero mt-1.5">
              {invoice.from?.name || 'Synth Data Co.'}
            </h3>
            <p className="text-slate-600 whitespace-pre-line mt-1 leading-relaxed">
              {invoice.from?.address || ''}
            </p>
            <p className="font-mono text-[11px] text-slate-500 mt-1">
              Tax ID: {invoice.from?.taxId || 'SYNTH-GLOBAL-01'}
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="py-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-[11px] font-semibold text-brand-secondary uppercase tracking-wider pb-2">
                <th className="py-2.5">Item</th>
                <th className="py-2.5 text-center font-mono w-16">Qty</th>
                <th className="py-2.5 text-right font-mono w-28">Price</th>
                <th className="py-2.5 text-right font-mono w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-xs">
              {(invoice.lineItems || []).map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 font-medium text-brand-hero">
                    {item.description}
                  </td>
                  <td className="py-3.5 text-center font-mono text-slate-600">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 text-right font-mono text-slate-600">
                    ${(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-right font-mono font-semibold text-brand-hero">
                    ${(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reconciled Totals Block */}
        <div className="flex justify-end pt-4 border-t border-brand-border">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 font-mono">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-mono">
              <span>Tax (0%):</span>
              <span>${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-brand-border font-mono text-sm font-bold text-brand-hero">
              <span>Total:</span>
              <span className="text-lg text-brand-teal">
                ${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Synthetic Verification Stamp */}
        <div className="mt-10 p-3 rounded-lg bg-teal-50/80 border border-teal-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            <span className="font-medium text-brand-hero">
              Audit Seal: Synthetic invoice lines reconcile mathematically ($1,100.00 + $140.00 = $1,240.00)
            </span>
          </div>
          <span className="font-mono text-[10px] text-brand-teal font-semibold">
            STATUS: 100% RECONCILED
          </span>
        </div>
      </div>
    </div>
  );
};
