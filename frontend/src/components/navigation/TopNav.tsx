import React from 'react';
import { Database, LayoutGrid, Terminal, ShieldCheck, Cpu } from 'lucide-react';

interface TopNavProps {
  currentView: 'workspace' | 'landing';
  onViewChange: (view: 'workspace' | 'landing') => void;
  isBackendOnline: boolean;
  latencyMs: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onViewChange,
  isBackendOnline,
  latencyMs,
}) => {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-brand-border bg-white px-5 shadow-micro">
      {/* Brand & Logo */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onViewChange('landing')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-brand-teal shadow-xs">
            <Cpu className="h-4 w-4 text-brand-teal" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-semibold text-sm leading-tight tracking-tight text-brand-hero">
              HackData <span className="text-brand-teal font-bold">V2</span>
            </span>
            <span className="font-mono text-[10px] text-brand-secondary tracking-normal">
              SYNTHETIC DATA PLATFORM
            </span>
          </div>
        </button>

        {/* View Switcher Tabs */}
        <nav className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
          <button
            onClick={() => onViewChange('landing')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              currentView === 'landing'
                ? 'bg-white text-brand-hero shadow-xs font-semibold'
                : 'text-brand-secondary hover:text-brand-hero'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Home
          </button>
          <button
            onClick={() => onViewChange('workspace')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
              currentView === 'workspace'
                ? 'bg-white text-brand-hero shadow-xs font-semibold'
                : 'text-brand-secondary hover:text-brand-hero'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Workspace
          </button>
        </nav>
      </div>

      {/* Right System Telemetry & Quick CTA */}
      <div className="flex items-center gap-4">
        {/* Backend Connectivity Status */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-mono">
          <span
            className={`h-2 w-2 rounded-full ${
              isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-teal-600'
            }`}
          />
          <span className="text-brand-secondary">
            {isBackendOnline ? `FastAPI: Online (${latencyMs}ms)` : 'Engine: Client Deterministic (100% Ready)'}
          </span>
        </div>

        {/* Zero-Knowledge Privacy Seal */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-brand-secondary">
          <ShieldCheck className="h-4 w-4 text-brand-teal" />
          <span className="font-medium text-[11px]">Differential Privacy ε=0.8</span>
        </div>

        {/* Quick Action Button */}
        {currentView === 'landing' ? (
          <button
            onClick={() => onViewChange('workspace')}
            className="flex items-center gap-1.5 rounded-lg bg-brand-teal px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand-teal-hover shadow-xs active:scale-98"
          >
            <Database className="h-3.5 w-3.5" />
            Open Workspace
          </button>
        ) : (
          <button
            onClick={() => onViewChange('landing')}
            className="rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-brand-hero transition-all hover:bg-slate-50 shadow-micro"
          >
            Overview
          </button>
        )}
      </div>
    </header>
  );
};
