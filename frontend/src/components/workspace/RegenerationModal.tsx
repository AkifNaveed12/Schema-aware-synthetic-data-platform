import React, { useState } from 'react';
import { X, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Sliders, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { RegenerationRunResult } from '../../types';
import { triggerRegeneration } from '../../api/client';

interface RegenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId?: string;
  datasetName?: string;
  onRegenerationComplete?: (result: RegenerationRunResult) => void;
}

export const RegenerationModal: React.FC<RegenerationModalProps> = ({
  isOpen,
  onClose,
  datasetId,
  datasetName = 'Active Dataset',
  onRegenerationComplete,
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('rebalance');
  const [modelStrategy, setModelStrategy] = useState<string>('ctgan');
  const [seed, setSeed] = useState<number>(1042);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegenerationRunResult | null>(null);

  if (!isOpen) return null;

  const handleExecute = async () => {
    if (!datasetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await triggerRegeneration(datasetId, selectedStrategy, {
        seed,
        model_strategy: modelStrategy,
      });
      if (res.success && res.data) {
        setResult(res.data);
        onRegenerationComplete?.(res.data);
      } else {
        setError('Controlled regeneration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing regeneration');
    } finally {
      setLoading(false);
    }
  };

  const strategies = [
    {
      id: 'rebalance',
      name: 'Rebalance Categorical Distribution',
      desc: 'Smooths under-represented categories and mitigates extreme skew in categorical dimensions.',
      badge: 'Distribution Fidelity',
    },
    {
      id: 'model',
      name: 'Switch Synthesizer Model',
      desc: 'Re-trains generation using deep generative neural networks (CTGAN / TVAE) to capture complex multi-column covariance.',
      badge: 'Neural Synthesis',
    },
    {
      id: 'seed',
      name: 'Resample with Stochastic Seed Shift',
      desc: 'Applies pseudo-random seed perturbation to avoid local distribution minima while preserving joint marginals.',
      badge: 'Stochastic Perturbation',
    },
    {
      id: 'constraints',
      name: 'Strengthen Relational & Boundary Constraints',
      desc: 'Tightens physical boundary checks, clipping numeric outliers and ensuring 100% domain compliance.',
      badge: 'Boundary Enforcement',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-brand-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-brand-hero tracking-tight">Controlled Diagnostic Regeneration</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Targeted Optimization
                </span>
              </div>
              <p className="text-xs text-brand-secondary">
                Actionable repair and optimization on <span className="text-brand-hero font-mono">{datasetName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-secondary hover:text-brand-hero p-2 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!datasetId ? (
            <div className="text-center py-12 text-slate-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-500" />
              <p className="text-sm font-medium text-brand-hero">No active dataset selected.</p>
              <p className="text-xs text-brand-secondary mt-1">
                Upload a dataset in Workspace to run diagnostic regeneration.
              </p>
            </div>
          ) : (
            <>
              {/* Diagnostic Issue Context */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="text-brand-hero font-semibold">Diagnostic Guidance:</strong> If quality or novelty metrics in the previous run fall below target thresholds, select a targeted repair strategy below. HackData V2 strictly enforces a{' '}
                  <strong className="text-brand-hero">Zero-Regression Guarantee</strong>: if a regenerated outcome achieves lower empirical quality, the previous preferred result is automatically preserved.
                </div>
              </div>

              {/* Strategy Selector Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-brand-hero uppercase tracking-wider">
                  Select Actionable Regeneration Strategy
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {strategies.map((strat) => {
                    const isSelected = selectedStrategy === strat.id;
                    return (
                      <div
                        key={strat.id}
                        onClick={() => setSelectedStrategy(strat.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-50/50 border-amber-400 shadow-xs'
                            : 'bg-slate-50 border-brand-border hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-brand-hero">{strat.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-brand-secondary border border-brand-border shadow-micro">
                            {strat.badge}
                          </span>
                        </div>
                        <p className="text-xs text-brand-secondary leading-relaxed">{strat.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strategy Parameters */}
              <div className="p-4 rounded-xl bg-slate-50 border border-brand-border space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-hero">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>Strategy Configuration Parameters</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStrategy === 'model' && (
                    <div>
                      <label className="block text-xs font-medium text-brand-secondary mb-1">
                        Generative Model Adapter
                      </label>
                      <select
                        value={modelStrategy}
                        onChange={(e) => setModelStrategy(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-brand-border text-xs text-brand-hero focus:outline-none focus:border-brand-teal shadow-micro"
                      >
                        <option value="ctgan">CTGAN (Conditional GAN for tabular data)</option>
                        <option value="tvae">TVAE (Variational Autoencoder)</option>
                        <option value="statistical">Statistical Baseline (Fast copula)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-brand-secondary mb-1">
                      Random Seed Perturbation
                    </label>
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(parseInt(e.target.value) || 42)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-brand-border text-xs text-brand-hero font-mono focus:outline-none focus:border-brand-teal shadow-micro"
                    />
                  </div>
                </div>

                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 text-xs font-semibold text-white transition-all shadow-micro flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Regenerating with Diagnostics...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Execute Controlled Regeneration
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Regeneration Outcome Card */}
              {result && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-brand-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold text-brand-secondary tracking-wider">
                      Regeneration Run Outcome
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
                        result.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {result.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Improved & Activated
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3.5 h-3.5" /> Baseline Retained
                        </>
                      )}
                    </span>
                  </div>

                  {/* Quality Delta Indicators */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-white border border-brand-border shadow-micro">
                      <span className="text-[11px] text-brand-secondary block mb-1">Previous Quality</span>
                      <span className="text-lg font-bold font-mono text-brand-hero">
                        {(result.previous_quality * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-brand-border shadow-micro">
                      <span className="text-[11px] text-brand-secondary block mb-1">New Quality</span>
                      <span className="text-lg font-bold font-mono text-brand-hero">
                        {(result.new_quality * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-brand-border shadow-micro">
                      <span className="text-[11px] text-brand-secondary block mb-1">Empirical Delta</span>
                      <span
                        className={`text-lg font-bold font-mono flex items-center justify-center gap-1 ${
                          result.quality_delta >= 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {result.quality_delta >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        {(result.quality_delta * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-brand-secondary leading-relaxed bg-white p-3 rounded-lg border border-brand-border shadow-micro">
                    {result.reason}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-brand-secondary hover:text-brand-hero hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
