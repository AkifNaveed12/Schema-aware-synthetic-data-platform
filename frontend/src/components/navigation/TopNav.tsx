import React, { useState } from 'react';
import { Database, LayoutGrid, Terminal, ShieldCheck, Cpu, Download, Menu, X } from 'lucide-react';

interface TopNavProps {
  currentView: 'workspace' | 'landing';
  onViewChange: (view: 'workspace' | 'landing') => void;
  isBackendOnline: boolean;
  latencyMs: number;
  onOpenDownload: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentView,
  onViewChange,
  isBackendOnline,
  latencyMs,
  onOpenDownload,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-white shadow-micro">
      {/* Main row */}
      <div className="flex h-14 items-center justify-between px-4 sm:px-5">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <button
            onClick={() => { onViewChange('landing'); closeMobile(); }}
            className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90 shrink-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-brand-teal shadow-xs">
              <Cpu className="h-4 w-4 text-brand-teal" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm leading-tight tracking-tight text-brand-hero">
                HackData <span className="text-brand-teal font-bold">V2</span>
              </span>
              <span className="hidden sm:block font-mono text-[10px] text-brand-secondary tracking-normal">
                SYNTHETIC DATA PLATFORM
              </span>
            </div>
          </button>

          {/* View Switcher Tabs — hidden on mobile (shown in hamburger) */}
          <nav className="hidden sm:flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200">
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

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Backend status — desktop only */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-mono">
            <span
              className={`h-2 w-2 rounded-full ${
                isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-teal-600'
              }`}
            />
            <span className="text-brand-secondary">
              {isBackendOnline ? `FastAPI: Online (${latencyMs}ms)` : 'Engine: Ready'}
            </span>
          </div>

          {/* Privacy seal — lg+ only */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-brand-secondary">
            <ShieldCheck className="h-4 w-4 text-brand-teal" />
            <span className="font-medium text-[11px]">Differential Privacy ε=0.8</span>
          </div>

          {/* Download Dataset — desktop */}
          <button
            onClick={onOpenDownload}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-brand-hero transition-all hover:bg-slate-50 hover:border-teal-300 shadow-micro"
          >
            <Download className="h-3.5 w-3.5 text-brand-teal" />
            Download Dataset
          </button>

          {/* Open/Close Workspace CTA — desktop */}
          {currentView === 'landing' ? (
            <button
              onClick={() => onViewChange('workspace')}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-brand-teal px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-brand-teal-hover shadow-xs active:scale-98"
            >
              <Database className="h-3.5 w-3.5" />
              Open Workspace
            </button>
          ) : (
            <button
              onClick={() => onViewChange('landing')}
              className="hidden sm:flex rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-medium text-brand-hero transition-all hover:bg-slate-50 shadow-micro"
            >
              Overview
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand-secondary hover:text-brand-hero transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-brand-border bg-white px-4 py-3 flex flex-col gap-2 shadow-panel">
          <button
            onClick={() => { onViewChange('landing'); closeMobile(); }}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === 'landing'
                ? 'bg-teal-50 text-brand-teal font-semibold border border-teal-200'
                : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Home
          </button>
          <button
            onClick={() => { onViewChange('workspace'); closeMobile(); }}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              currentView === 'workspace'
                ? 'bg-teal-50 text-brand-teal font-semibold border border-teal-200'
                : 'text-brand-secondary hover:text-brand-hero hover:bg-slate-50'
            }`}
          >
            <Terminal className="h-4 w-4" />
            Workspace
          </button>
          <button
            onClick={() => { onOpenDownload(); closeMobile(); }}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-brand-secondary hover:text-brand-hero hover:bg-slate-50 transition-all"
          >
            <Download className="h-4 w-4 text-brand-teal" />
            Download Dataset
          </button>
          {/* Status row */}
          <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono text-brand-secondary border-t border-brand-border mt-1 pt-2">
            <span className={`h-2 w-2 rounded-full ${isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-teal-600'}`} />
            {isBackendOnline ? `FastAPI: Online (${latencyMs}ms)` : 'Engine: Ready'}
          </div>
        </div>
      )}
    </header>
  );
};
