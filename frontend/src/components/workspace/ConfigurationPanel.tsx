import React from 'react';
import { Lock, Unlock, RotateCw, Download, Sliders, ShieldCheck } from 'lucide-react';
import { GenerationConfig } from '../../types';

interface ConfigurationPanelProps {
  config: GenerationConfig;
  onChange: (updated: Partial<GenerationConfig>) => void;
  onExportClick: () => void;
  isGenerating?: boolean;
}

const QUICK_ROW_CHIPS = [10, 50, 100, 1000, 10000];

const LOCALES = [
  { code: 'en_US', currency: 'USD', label: 'en-US ($ USD)' },
  { code: 'en_GB', currency: 'GBP', label: 'en-GB (£ GBP)' },
  { code: 'de_DE', currency: 'EUR', label: 'de-DE (€ EUR)' },
  { code: 'ja_JP', currency: 'JPY', label: 'ja-JP (¥ JPY)' },
];

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  config,
  onChange,
  onExportClick,
  isGenerating = false,
}) => {
  const handleRandomizeSeed = () => {
    if (config.isSeedLocked) return;
    const newSeed = Math.floor(Math.random() * 90000) + 1000;
    onChange({ randomSeed: newSeed });
  };

  const handleToggleSeedLock = () => {
    onChange({ isSeedLocked: !config.isSeedLocked });
  };

  return (
    <aside className="flex flex-col justify-between w-80 h-full bg-white border-l border-brand-border p-5 select-none overflow-y-auto">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-teal" />
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-teal">
              CONFIGURATION
            </span>
          </div>
          <span className="text-[11px] font-mono text-brand-secondary">Slide 10 Specs</span>
        </div>

        {/* 1. Row Count */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="row-count-slider" className="text-xs font-medium text-brand-hero">Row count</label>
            <span className="font-mono text-xs font-semibold text-brand-hero bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {config.rowCount.toLocaleString()}
            </span>
          </div>

          {/* Quick chips */}
          <div className="flex items-center gap-1.5 pt-1">
            {QUICK_ROW_CHIPS.map((chipVal) => (
              <button
                key={chipVal}
                onClick={() => onChange({ rowCount: chipVal })}
                className={`flex-1 py-1 text-[11px] font-mono rounded border transition-all ${
                  config.rowCount === chipVal
                    ? 'bg-brand-teal text-white border-brand-teal font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {chipVal >= 1000 ? `${chipVal / 1000}k` : chipVal}
              </button>
            ))}
          </div>

          {/* Slider */}
          <input
            id="row-count-slider"
            name="rowCountSlider"
            aria-label="Row count slider"
            type="range"
            min={10}
            max={1000}
            step={10}
            value={Math.min(config.rowCount, 1000)}
            onChange={(e) => onChange({ rowCount: parseInt(e.target.value, 10) })}
            className="w-full accent-brand-teal cursor-pointer h-1.5 bg-slate-200 rounded-lg mt-1"
          />
        </div>

        {/* 2. Random Seed */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="random-seed-input" className="text-xs font-medium text-brand-hero">Random seed</label>
            <span className="text-[10px] text-brand-secondary font-mono">
              {config.isSeedLocked ? 'Deterministic Lock Active' : 'Dynamic Repeatable'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="random-seed-input"
                name="randomSeed"
                type="number"
                value={config.randomSeed}
                onChange={(e) => onChange({ randomSeed: parseInt(e.target.value, 10) || 1 })}
                className="w-full rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs font-mono text-brand-hero focus:border-brand-teal focus:outline-none"
              />
            </div>
            {/* Lock Button */}
            <button
              onClick={handleToggleSeedLock}
              title={config.isSeedLocked ? 'Unlock seed' : 'Lock seed for deterministic reproducibility'}
              className={`p-2 rounded-lg border transition-all ${
                config.isSeedLocked
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {config.isSeedLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            {/* Randomize Button */}
            <button
              onClick={handleRandomizeSeed}
              disabled={config.isSeedLocked}
              title="Regenerate random seed"
              className={`p-2 rounded-lg border transition-all ${
                config.isSeedLocked
                  ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-brand-teal hover:bg-teal-50 hover:border-teal-200'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Locale & Currency */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="locale-currency-select" className="text-xs font-medium text-brand-hero">Locale & currency</label>
          <select
            id="locale-currency-select"
            name="localeCurrency"
            value={`${config.locale}-${config.currency}`}
            onChange={(e) => {
              const selected = LOCALES.find((l) => `${l.code}-${l.currency}` === e.target.value);
              if (selected) {
                onChange({ locale: selected.code, currency: selected.currency });
              }
            }}
            className="w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-xs font-medium text-brand-hero focus:border-brand-teal focus:outline-none shadow-xs"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={`${l.code}-${l.currency}`}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Privacy Rules */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-brand-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-hero flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-teal" /> Privacy rules
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>

          {/* Toggle: Masking */}
          <label htmlFor="privacy-masking" className="flex items-center justify-between cursor-pointer p-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-brand-hero">Masking</span>
              <span className="text-[10px] text-brand-secondary">Obfuscate PII emails/names</span>
            </div>
            <input
              id="privacy-masking"
              name="privacyMasking"
              type="checkbox"
              checked={config.privacy.masking}
              onChange={(e) =>
                onChange({
                  privacy: { ...config.privacy, masking: e.target.checked },
                })
              }
              className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
            />
          </label>

          {/* Toggle: Hashing */}
          <label htmlFor="privacy-hashing" className="flex items-center justify-between cursor-pointer p-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-brand-hero">Hashing (SHA-256)</span>
              <span className="text-[10px] text-brand-secondary">One-way cryptographic tokens</span>
            </div>
            <input
              id="privacy-hashing"
              name="privacyHashing"
              type="checkbox"
              checked={config.privacy.hashing}
              onChange={(e) =>
                onChange({
                  privacy: { ...config.privacy, hashing: e.target.checked },
                })
              }
              className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
            />
          </label>

          {/* Toggle: Differential Noise */}
          <label htmlFor="privacy-noise" className="flex items-center justify-between cursor-pointer p-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-brand-hero">Differential noise</span>
              <span className="text-[10px] text-brand-secondary">Laplace perturbation (ε = 0.8)</span>
            </div>
            <input
              id="privacy-noise"
              name="privacyNoise"
              type="checkbox"
              checked={config.privacy.differentialNoise}
              onChange={(e) =>
                onChange({
                  privacy: { ...config.privacy, differentialNoise: e.target.checked },
                })
              }
              className="w-4 h-4 rounded text-brand-teal accent-brand-teal cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Primary Export Action */}
      <div className="pt-4 border-t border-brand-border">
        <button
          onClick={onExportClick}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-panel active:scale-98 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          EXPORT DATASET
        </button>
        <p className="text-[10px] text-center text-brand-secondary mt-2">
          Instant multi-format export: CSV · JSON · SQL · PDF
        </p>
      </div>
    </aside>
  );
};
