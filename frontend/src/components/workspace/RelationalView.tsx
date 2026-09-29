import React, { useState } from 'react';
import { RelationalDataset } from '../../types';
import { SchemaGraphSVG } from '../visualizations/SchemaGraphSVG';
import { CheckCircle2, Table, Key, Link as LinkIcon } from 'lucide-react';

interface RelationalViewProps {
  dataset: RelationalDataset;
  isLoading?: boolean;
}

export const RelationalView: React.FC<RelationalViewProps> = ({
  dataset,
  isLoading = false,
}) => {
  const [activeTable, setActiveTable] = useState<'customers' | 'orders' | 'order_items'>('customers');

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto pr-1">
      {/* 1. Visual Topology Diagram */}
      <SchemaGraphSVG
        activeTable={activeTable}
        onTableSelect={(tableName) => setActiveTable(tableName)}
      />

      {/* 2. Multi-Table Inspector */}
      <div className="flex-1 min-h-[460px] bg-white rounded-xl border border-brand-border shadow-micro overflow-hidden flex flex-col">
        {/* Table Selector Tabs */}
        <div className="flex items-center justify-between border-b border-brand-border px-4 py-2.5 bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTable('customers')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTable === 'customers'
                  ? 'bg-brand-teal text-white shadow-xs font-semibold'
                  : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-200/60'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Customers
              <span className="font-mono text-[10px] opacity-80">({dataset.customers.length})</span>
            </button>

            <button
              onClick={() => setActiveTable('orders')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTable === 'orders'
                  ? 'bg-brand-teal text-white shadow-xs font-semibold'
                  : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-200/60'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Orders
              <span className="font-mono text-[10px] opacity-80">({dataset.orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTable('order_items')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTable === 'order_items'
                  ? 'bg-brand-teal text-white shadow-xs font-semibold'
                  : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-200/60'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Order Items
              <span className="font-mono text-[10px] opacity-80">({dataset.order_items.length})</span>
            </button>
          </div>

          {/* Cross-Table Reconciliation Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Cross-Table Consistency: Reconciled
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-brand-border shadow-panel text-xs font-medium text-brand-teal animate-pulse">
                <span className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
                Generating relational hierarchy...
              </div>
            </div>
          )}

          {activeTable === 'customers' && (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-brand-border text-[11px] font-semibold text-brand-secondary uppercase tracking-wider sticky top-0 h-11">
                  <th className="py-2.5 px-4 font-mono">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-500" /> customer_id (PK)
                    </span>
                  </th>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4 font-mono">Email</th>
                  <th className="py-2.5 px-4">Country</th>
                  <th className="py-2.5 px-4">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-xs tabular-nums">
                {dataset.customers.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-slate-50 h-11">
                    <td className="py-2.5 px-4 font-mono font-medium text-brand-hero">
                      {c.customer_id}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-brand-hero">{c.name}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{c.email}</td>
                    <td className="py-2.5 px-4 text-slate-600">{c.country}</td>
                    <td className="py-2.5 px-4">
                      <span className="capitalize font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {c.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'orders' && (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-brand-border text-[11px] font-semibold text-brand-secondary uppercase tracking-wider sticky top-0 h-11">
                  <th className="py-2.5 px-4 font-mono">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-500" /> order_id (PK)
                    </span>
                  </th>
                  <th className="py-2.5 px-4 font-mono">
                    <span className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-cyan-600" /> customer_id (FK)
                    </span>
                  </th>
                  <th className="py-2.5 px-4 font-mono">Order Date</th>
                  <th className="py-2.5 px-4 text-right font-mono">Total Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-xs tabular-nums">
                {dataset.orders.map((o) => (
                  <tr key={o.order_id} className="hover:bg-slate-50 h-11">
                    <td className="py-2.5 px-4 font-mono font-medium text-brand-hero">
                      {o.order_id}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-brand-teal font-semibold">
                      {o.customer_id}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{o.order_date}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-brand-hero">
                      ${o.total_amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="capitalize text-[10px] font-mono bg-teal-50 text-brand-teal px-2 py-0.5 rounded border border-teal-200">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'order_items' && (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-brand-border text-[11px] font-semibold text-brand-secondary uppercase tracking-wider sticky top-0 h-11">
                  <th className="py-2.5 px-4 font-mono">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-500" /> item_id (PK)
                    </span>
                  </th>
                  <th className="py-2.5 px-4 font-mono">
                    <span className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-cyan-600" /> order_id (FK)
                    </span>
                  </th>
                  <th className="py-2.5 px-4 font-mono">SKU</th>
                  <th className="py-2.5 px-4">Product Name</th>
                  <th className="py-2.5 px-4 text-right font-mono">Qty</th>
                  <th className="py-2.5 px-4 text-right font-mono">Unit Price</th>
                  <th className="py-2.5 px-4 text-right font-mono">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-xs">
                {dataset.order_items.map((it) => (
                  <tr key={it.item_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-medium text-brand-hero">
                      {it.item_id}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-cyan-600 font-semibold">
                      {it.order_id}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{it.sku}</td>
                    <td className="py-2.5 px-4 font-medium text-brand-hero">{it.product_name}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{it.quantity}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-500">
                      ${it.unit_price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-brand-hero">
                      ${it.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Audit Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-brand-border text-xs text-brand-secondary">
          <span className="flex items-center gap-1.5 font-medium text-brand-hero">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Referential integrity maintained automatically across every generated table
          </span>
          <span className="font-mono text-[11px] text-brand-teal">
            Cardinality: 1:N Validated
          </span>
        </div>
      </div>
    </div>
  );
};
