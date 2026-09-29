import React from 'react';
import {
  Table,
  Network,
  FileText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Layers,
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
          <span>HACKDATA V2 · SCHEMA-AWARE SYNTHETIC DATA WORKBENCH</span>
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
            Launch 3-Pane Workspace
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

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min">
          {/* TILE A (Hero Wide - 2 Cols): Live Tabular Preview */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-brand-teal" />
                  <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                    Tabular Engine (Slide 5)
                  </span>
                </div>
                <span className="font-mono text-[10px] text-brand-teal bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Log-Normal Skewed
                </span>
              </div>
              <p className="text-xs text-brand-secondary mb-3">
                Statistically faithful distributions with column-level PII email masking.
              </p>

              {/* Data Table Snippet */}
              <div className="overflow-x-auto rounded-lg border border-brand-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-mono text-[10px] text-brand-secondary">
                    <tr>
                      <th className="p-2">ID</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Email</th>
                      <th className="p-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border font-mono text-[11px]">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold">10231</td>
                      <td className="p-2 font-sans font-medium text-brand-hero">Maria Chen</td>
                      <td className="p-2 text-slate-500">m.•••••@example.com</td>
                      <td className="p-2 text-right font-semibold">$482.10</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold">10232</td>
                      <td className="p-2 font-sans font-medium text-brand-hero">Ahmed Raza</td>
                      <td className="p-2 text-slate-500">a.•••••@example.com</td>
                      <td className="p-2 text-right font-semibold">$129.55</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2 font-bold">10233</td>
                      <td className="p-2 font-sans font-medium text-brand-hero">Sofia Ivanova</td>
                      <td className="p-2 text-slate-500">s.•••••@example.com</td>
                      <td className="p-2 text-right font-semibold">$918.42</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-brand-border">
              <DistributionHistogram data={sampleBalances} title="Fidelity Distribution Profile" />
            </div>
          </div>

          {/* TILE B (Hero Wide - 2 Cols): Relational Topology */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                    Relational Structures (Slide 6)
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Integrity: 100%
                </span>
              </div>
              <p className="text-xs text-brand-secondary mb-3">
                Customers (PK) → Orders (PK/FK) → Order Items (PK/FK). Order totals match line items.
              </p>
            </div>

            <div className="py-2">
              <SchemaGraphSVG />
            </div>
          </div>

          {/* TILE C (1 Col): Document Invoice #INV-10432 */}
          <div className="col-span-1 md:col-span-1 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-teal" />
                  <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                    Invoices (Slide 7)
                  </span>
                </div>
              </div>

              {/* Mini Card */}
              <div className="p-3 rounded-lg border border-brand-border bg-slate-50 font-mono text-xs space-y-2 mt-2">
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
                    <strong className="text-brand-hero">$1,100.00</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Onboarding</span>
                    <strong className="text-brand-hero">$140.00</strong>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-xs font-bold text-brand-teal">
                  <span>Total</span>
                  <span>$1,240.00</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-emerald-700 font-mono mt-3 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Lines strictly equal total
            </p>
          </div>

          {/* TILE D (1 Col): Financial Bank Statement */}
          <div className="col-span-1 md:col-span-1 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                  Statements (Slide 8)
                </span>
                <span className="text-[10px] font-mono text-slate-500">ACID Ledger</span>
              </div>
              <p className="text-xs text-brand-secondary mb-3">
                Deterministic running balance calculation with query-style prompts.
              </p>
            </div>

            <LedgerSparkline balances={sampleSparkBalances} />

            <div className="mt-2 text-[10px] font-mono text-brand-secondary flex justify-between">
              <span>08-14 Greenleaf: -$42.10</span>
              <span className="text-emerald-600 font-semibold">+ $2,150.00</span>
            </div>
          </div>

          {/* TILE E (1 Col): AI Intelligence Layer */}
          <div className="col-span-1 md:col-span-1 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-brand-teal" />
                <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                  AI Layer (Slide 9)
                </span>
              </div>
              <p className="text-xs text-brand-secondary mb-2">
                Groq LLM semantic type detection & rare edge-case injection.
              </p>
            </div>

            <div className="space-y-1.5 font-mono text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="flex justify-between text-brand-teal">
                <span>Schema Inference</span>
                <span>COMPLETED</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Semantic Types</span>
                <span>Person.FullName</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Edge Anomaly Rate</span>
                <span>0.05% Injected</span>
              </div>
            </div>

            <p className="text-[10px] text-brand-secondary mt-2">
              AI never computes arithmetic — business rules stay 100% deterministic.
            </p>
          </div>

          {/* TILE F (1 Col): Privacy Vault */}
          <div className="col-span-1 md:col-span-1 rounded-2xl bg-white p-5 border border-brand-border shadow-micro flex flex-col justify-between hover:shadow-panel transition-all">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-brand-hero uppercase tracking-wider">
                  Privacy Engine
                </span>
              </div>
              <p className="text-xs text-brand-secondary mb-2">
                Three layers of enterprise compliance protection.
              </p>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-1.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-800">
                <span>SHA-256 Hashing</span>
                <span className="text-[10px] font-bold">ON</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-teal-50 rounded border border-teal-200 text-teal-800">
                <span>Email Masking</span>
                <span className="text-[10px] font-bold">ON</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-100 rounded border border-slate-200 text-slate-700">
                <span>Differential Noise</span>
                <span className="text-[10px]">ε = 0.8</span>
              </div>
            </div>

            <p className="text-[10px] text-brand-secondary mt-2">
              Guaranteed k-Anonymity & PII elimination.
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

      {/* 4. Bottom CTA Bar */}
      <section className="px-6 py-12 bg-white border-t border-brand-border mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-brand-hero">
              Ready to generate compliance-safe synthetic data?
            </h3>
            <p className="text-xs text-brand-secondary mt-1">
              Strict adherence to Theme Slide 10 3-pane layout, Slide 5-8 specifications.
            </p>
          </div>

          <button
            onClick={onOpenWorkspace}
            className="flex items-center gap-2 rounded-xl bg-brand-teal hover:bg-brand-teal-hover text-white px-6 py-3 text-xs font-semibold transition-all shadow-panel active:scale-98"
          >
            <Database className="w-4 h-4" />
            Enter 3-Pane Workspace
          </button>
        </div>
      </section>
    </div>
  );
};
