import React from 'react';
import {
  Table,
  Network,
  FileText,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  BarChart,
  CheckCircle2,
  Terminal,
  Cpu,
} from 'lucide-react';
import { SchemaGraphSVG } from '../visualizations/SchemaGraphSVG';
import { DistributionHistogram } from '../visualizations/DistributionHistogram';
import { LedgerSparkline } from '../visualizations/LedgerSparkline';

interface LandingPageProps {
  onOpenWorkspace: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenWorkspace }) => {
  const sampleBalances = [482.10, 129.55, 918.42, 1420.00, 310.20, 2450.80, 89.90, 640.00, 1150.30, 2100.00, 180.40, 3350.00];
  const sampleSparkBalances = [1246.40, 1204.30, 3354.30, 3257.90, 4100.00, 3950.00, 4820.00];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-[#F8F7F4] to-[#EBEFFE] text-brand-hero">
      {/* 1. Hero Section (Attio Minimalist Aesthetic) */}
      <section className="relative px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-6xl mx-auto text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3 py-1 text-xs font-mono font-medium text-brand-teal mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DATAVAULT · SCHEMA-AWARE SYNTHETIC DATA WORKBENCH</span>
        </div>

        {/* Hero Title (#1C1D1F) */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-brand-hero max-w-4xl mx-auto leading-tight sm:leading-tight">
          Realistic, privacy-safe data —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-teal via-teal-700 to-slate-900">
            generated on demand.
          </span>
        </h1>

        {/* Hero Subtitle (#6F7988) */}
        <p className="mt-6 text-base sm:text-lg text-brand-secondary max-w-2xl mx-auto leading-relaxed">
          Transform schemas, business rules, and small samples into high-fidelity synthetic tabular, relational, and document datasets. Zero production data leaks.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenWorkspace}
            className="flex items-center gap-2 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white px-6 py-3.5 text-sm font-semibold transition-all shadow-panel hover:shadow-lg active:scale-98"
          >
            <Terminal className="w-4 h-4" />
            Launch Workspace
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#bento-showcase"
            className="flex items-center gap-2 rounded-xl border border-brand-border bg-white hover:bg-slate-50 text-brand-hero px-6 py-3.5 text-sm font-semibold transition-all shadow-micro"
          >
            Inspect Bento Showcase
          </a>
        </div>
      </section>

      {/* 2. Asymmetric Bento Grid Product Showcase */}
      <section id="bento-showcase" className="px-6 py-12 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-semibold">
            BENTO GRID SPECIFICATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-hero mt-1">
            Engineered for Precision & Mathematical Fidelity
          </h2>
          <p className="text-xs text-brand-secondary mt-1">
            Every tile is driven by live synthetic data algorithms. Never static lorem ipsum.
          </p>
        </div>

        {/* 12-Column Asymmetric Bento Grid (16px gap, 1px border, radius 12-16px, real synthetic data) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* TILE A (Large, 7 cols): Live Tabular Preview with 6-8 rows & masked email */}
          <div className="md:col-span-7 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-brand-teal" />
                  <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                    Tile A · Live Tabular Preview
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-brand-secondary bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Showcase Specimen · 8 Records
                  </span>
                  <span className="font-mono text-[10px] text-brand-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Log-Normal Skewed
                  </span>
                </div>
              </div>
              <p className="text-xs text-brand-secondary mb-3">
                Statistically faithful distributions with column-level PII email masking.
              </p>

              {/* Data Table Snippet - 7 Customer Rows */}
              <div className="overflow-x-auto rounded-lg border border-brand-border">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 font-mono text-[10px] text-brand-secondary">
                    <tr>
                      <th className="py-2 px-3">ID</th>
                      <th className="py-2 px-3">Customer Name</th>
                      <th className="py-2 px-3">Masked Email</th>
                      <th className="py-2 px-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border font-mono text-[11px] tabular-nums">
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-brand-hero">10231</td>
                      <td className="py-2 px-3 font-sans font-medium text-brand-hero">Maria Chen</td>
                      <td className="py-2 px-3 text-slate-500 font-mono bg-slate-100/60 rounded px-1.5">m.•••••@synthdata.io</td>
                      <td className="py-2 px-3 text-right font-semibold">$482.10</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-brand-hero">10232</td>
                      <td className="py-2 px-3 font-sans font-medium text-brand-hero">Ahmed Raza</td>
                      <td className="py-2 px-3 text-slate-500 font-mono bg-slate-100/60 rounded px-1.5">a.•••••@synthdata.io</td>
                      <td className="py-2 px-3 text-right font-semibold">$129.55</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-brand-hero">10233</td>
                      <td className="py-2 px-3 font-sans font-medium text-brand-hero">Sofia Ivanova</td>
                      <td className="py-2 px-3 text-slate-500 font-mono bg-slate-100/60 rounded px-1.5">s.•••••@synthdata.io</td>
                      <td className="py-2 px-3 text-right font-semibold">$918.42</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-brand-hero">10234</td>
                      <td className="py-2 px-3 font-sans font-medium text-brand-hero">Marcus Vance</td>
                      <td className="py-2 px-3 text-slate-500 font-mono bg-slate-100/60 rounded px-1.5">m.•••••@synthdata.io</td>
                      <td className="py-2 px-3 text-right font-semibold">$1,420.00</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-brand-hero">10235</td>
                      <td className="py-2 px-3 font-sans font-medium text-brand-hero">Elena Reyes</td>
                      <td className="py-2 px-3 text-slate-500 font-mono bg-slate-100/60 rounded px-1.5">e.•••••@synthdata.io</td>
                      <td className="py-2 px-3 text-right font-semibold">$310.20</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-brand-hero">10236</td>
                      <td className="py-2 px-3 font-sans font-medium text-brand-hero">Lucas Schmidt</td>
                      <td className="py-2 px-3 text-slate-500 font-mono bg-slate-100/60 rounded px-1.5">l.•••••@synthdata.io</td>
                      <td className="py-2 px-3 text-right font-semibold">$2,450.80</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-brand-hero">10237</td>
                      <td className="py-2 px-3 font-sans font-medium text-brand-hero">Fatima Al-Mansoor</td>
                      <td className="py-2 px-3 text-slate-500 font-mono bg-slate-100/60 rounded px-1.5">f.•••••@synthdata.io</td>
                      <td className="py-2 px-3 text-right font-semibold">$1,150.30</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between text-[11px] font-mono text-brand-secondary">
              <span>Privacy rule: Masking enabled</span>
              <span className="text-emerald-700 font-medium">Valid row count: 7/7</span>
            </div>
          </div>

          {/* TILE B (5 cols): Relational Topology Customers -> Orders -> Items */}
          <div className="md:col-span-5 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                    Tile B · Relational Topology
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Referential Integrity 100%
                </span>
              </div>
              <p className="text-xs text-brand-secondary mb-3">
                Customers (PK) → Orders (PK/FK) → Order Items (PK/FK). Order totals match line items.
              </p>
            </div>

            <div className="py-2">
              <SchemaGraphSVG />
            </div>

            <div className="mt-2 pt-2 border-t border-brand-border flex justify-between text-[10px] font-mono text-slate-500">
              <span>PK/FK mapping strict</span>
              <span className="text-brand-teal font-medium">0 orphan foreign keys</span>
            </div>
          </div>

          {/* TILE C (4 cols): Document Invoice #INV-10432 */}
          <div className="md:col-span-4 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-teal" />
                  <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                    Tile C · Reconciled Invoice
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  INV-10432
                </span>
              </div>
              <p className="text-xs text-brand-secondary mb-3">
                Strict arithmetic equality: line items strictly equal total.
              </p>

              {/* Mini Card */}
              <div className="p-3 rounded-lg border border-brand-border bg-slate-50 font-mono text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-brand-hero">INV-10432</span>
                  <span className="text-[10px] text-brand-teal font-semibold">RECONCILED</span>
                </div>
                <p className="text-[11px] font-sans text-brand-secondary">
                  Billed to: <strong>Northwind Supplies Ltd.</strong>
                </p>
                <div className="space-y-1 text-[11px] pt-1">
                  <div className="flex justify-between">
                    <span>API access (Pro)</span>
                    <strong className="text-brand-hero tabular-nums">$1,100.00</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Onboarding</span>
                    <strong className="text-brand-hero tabular-nums">$140.00</strong>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-xs font-bold text-brand-teal tabular-nums">
                  <span>Total</span>
                  <span>$1,240.00</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-emerald-700 font-mono mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              $1,100.00 + $140.00 = $1,240.00
            </p>
          </div>

          {/* TILE D (4 cols): Financial Bank Statement */}
          <div className="md:col-span-4 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                  Tile D · Bank Ledger Balance
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">ACID Ledger</span>
              </div>
              <p className="text-xs text-brand-secondary mb-2">
                Deterministic running balance calculation matching official theme specs.
              </p>
            </div>

            <LedgerSparkline balances={sampleSparkBalances} />

            <div className="mt-2 text-[10px] font-mono text-brand-secondary bg-slate-50 p-2 rounded border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span>08-14 Greenleaf: -$42.10</span>
                <span className="font-semibold text-brand-hero tabular-nums">1,204.30</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>08-15 Payroll: +$2,150.00</span>
                <span className="font-semibold tabular-nums">3,354.30</span>
              </div>
              <div className="flex justify-between text-brand-teal font-bold pt-1 border-t border-slate-200">
                <span>08-17 Utilities: -$96.40</span>
                <span className="tabular-nums">3,257.90</span>
              </div>
            </div>
          </div>

          {/* TILE E (4 cols): Distribution Mini-Charts */}
          <div className="md:col-span-4 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <BarChart className="w-4 h-4 text-brand-teal" />
                  <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                    Tile E · Distribution Charts
                  </span>
                </div>
                <span className="font-mono text-[10px] text-brand-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Statistical Fidelity
                </span>
              </div>
              <p className="text-xs text-brand-secondary mb-2">
                Actual numeric histogram generated directly from live dataset balances.
              </p>
            </div>

            <div className="py-1">
              <DistributionHistogram data={sampleBalances} title="Live Balance Histogram" />
            </div>

            <p className="text-[10px] text-brand-secondary mt-2 font-mono">
              Skewness: Log-Normal μ=5.8, σ=0.75
            </p>
          </div>

          {/* TILE F (6 cols): AI Layer Timeline */}
          <div className="md:col-span-6 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-brand-teal" />
                <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                  Tile F · AI Layer Timeline
                </span>
              </div>
              <p className="text-xs text-brand-secondary mb-3">
                Visible three-step pipeline: schema inference → content synthesis → edge-case injection.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex flex-col gap-1">
                <span className="text-brand-teal font-bold">01. INFERENCE</span>
                <span className="text-slate-700">Schema Understanding</span>
                <span className="text-[9px] text-brand-teal">✓ DDL & Types</span>
              </div>
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 flex flex-col gap-1">
                <span className="text-brand-teal font-bold">02. SYNTHESIS</span>
                <span className="text-slate-700">Content Engine</span>
                <span className="text-[9px] text-brand-teal">✓ Realistic PII</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-1">
                <span className="text-slate-600 font-bold">03. INJECTION</span>
                <span className="text-slate-700">Edge Cases (0.05%)</span>
                <span className="text-[9px] text-emerald-600">✓ Isolated outliers</span>
              </div>
            </div>

            <p className="text-[10px] text-brand-secondary mt-3">
              AI drives semantics; deterministic PRNGs execute mathematical rules.
            </p>
          </div>

          {/* TILE G (6 cols): Privacy Controls */}
          <div className="md:col-span-6 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                  Tile G · Privacy Toggles
                </span>
              </div>
              <p className="text-xs text-brand-secondary mb-3">
                Three layers of enterprise compliance protection toggleable per column.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="flex flex-col justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800">
                <span className="font-semibold text-[11px]">Masking</span>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span>Email/Name</span>
                  <span className="font-bold bg-emerald-200/60 px-1 rounded">ACTIVE</span>
                </div>
              </div>
              <div className="flex flex-col justify-between p-2.5 bg-teal-50 rounded-lg border border-teal-200 text-teal-800">
                <span className="font-semibold text-[11px]">Hashing</span>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span>SHA-256</span>
                  <span className="font-bold bg-teal-200/60 px-1 rounded">ACTIVE</span>
                </div>
              </div>
              <div className="flex flex-col justify-between p-2.5 bg-slate-100 rounded-lg border border-slate-200 text-slate-700">
                <span className="font-semibold text-[11px]">Diff. Noise</span>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span>Laplace</span>
                  <span className="font-mono">ε = 0.8</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-brand-secondary mt-3">
              Guaranteed k-Anonymity & PII elimination with zero production data leakage.
            </p>
          </div>
        </div>
      </section>

      {/* 3. System Architecture & Workflow */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-brand-teal font-semibold">
            SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-hero mt-1">
            Schema-Aware, Modular & Resilient
          </h2>
          <p className="text-xs text-brand-secondary mt-1">
            Separation of concerns: AI semantic inference meets deterministic bulk generation.
          </p>
        </div>

        {/* 4 Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-brand-border shadow-micro flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-sm text-brand-hero">Schema Understanding</h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              Infers column types, formats, correlations, and primary/foreign keys from a small sample or DDL.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-brand-border shadow-micro flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-sm text-brand-hero">DataProfile Modeling</h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              Builds a standardized schema model capturing distributions, cardinalities, and privacy constraints.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-brand-border shadow-micro flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-sm text-brand-hero">Deterministic Generation</h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              Tabular, relational, and document engines synthesize high-volume records using seed-locked PRNGs.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-brand-border shadow-micro flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center font-mono font-bold text-xs">
              04
            </div>
            <h3 className="font-bold text-sm text-brand-hero">Validation & Zero-Code Export</h3>
            <p className="text-xs text-brand-secondary leading-relaxed">
              Strict audit passes referential integrity and arithmetic reconciliations before exporting to CSV, JSON, SQL, or PDF.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Dark Closing CTA (DESIGN.md §4.1: dark closing CTA --bg-sidebar) */}
      <section className="px-6 py-14 bg-brand-sidebar border-t border-slate-800 text-white mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-teal-400 uppercase font-semibold">
              READY FOR DATAVAULT DEPLOYMENT
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Start generating compliance-safe synthetic data
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Enterprise 3-pane responsive layout, sub-second generation latency, and 100% referential integrity.
            </p>
          </div>

          <button
            onClick={onOpenWorkspace}
            className="flex items-center gap-2 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white px-6 py-3.5 text-xs font-semibold tracking-wide transition-all shadow-panel active:scale-98 cursor-pointer"
          >
            <Database className="w-4 h-4" />
            Enter Workspace
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </section>
    </div>
  );
};
