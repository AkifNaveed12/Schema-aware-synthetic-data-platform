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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#111C35]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white tracking-tight">Controlled Diagnostic Regeneration</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Targeted Optimization
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Actionable repair and optimization on <span className="text-slate-200 font-mono">{datasetName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!datasetId ? (
            <div className="text-center py-12 text-slate-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-400/80" />
              <p className="text-sm font-medium text-slate-200">No active dataset selected.</p>
              <p className="text-xs text-slate-400 mt-1">
                Upload a dataset in Workspace to run diagnostic regeneration.
              </p>
            </div>
          ) : (
            <>
              {/* Diagnostic Issue Context */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-white font-medium">Diagnostic Guidance:</strong> If quality or novelty metrics in the previous run fall below target thresholds, select a targeted repair strategy below. HackData V2 strictly enforces a{' '}
                  <strong className="text-white">Zero-Regression Guarantee</strong>: if a regenerated outcome achieves lower empirical quality, the previous preferred result is automatically preserved.
                </div>
              </div>

              {/* Strategy Selector Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
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
                            ? 'bg-amber-950/20 border-amber-500/60 shadow-sm'
                            : 'bg-slate-900/40 border-[#1E293B] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-white">{strat.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {strat.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{strat.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strategy Parameters */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-[#1E293B] space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Strategy Configuration Parameters</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStrategy === 'model' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Generative Model Adapter
                      </label>
                      <select
                        value={modelStrategy}
                        onChange={(e) => setModelStrategy(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="ctgan">CTGAN (Conditional GAN for tabular data)</option>
                        <option value="tvae">TVAE (Variational Autoencoder)</option>
                        <option value="statistical">Statistical Baseline (Fast copula)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Random Seed Perturbation
                    </label>
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(parseInt(e.target.value) || 42)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-[#1E293B] text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-xs font-semibold text-white transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
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
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Regeneration Outcome Card */}
              {result && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-[#1E293B] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                      Regeneration Run Outcome
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
                        result.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
                    <div className="p-3 rounded-xl bg-slate-950 border border-[#1E293B]">
                      <span className="text-[11px] text-slate-400 block mb-1">Previous Quality</span>
                      <span className="text-lg font-bold font-mono text-slate-300">
                        {(result.previous_quality * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-[#1E293B]">
                      <span className="text-[11px] text-slate-400 block mb-1">New Quality</span>
                      <span className="text-lg font-bold font-mono text-white">
                        {(result.new_quality * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-[#1E293B]">
                      <span className="text-[11px] text-slate-400 block mb-1">Empirical Delta</span>
                      <span
                        className={`text-lg font-bold font-mono flex items-center justify-center gap-1 ${
                          result.quality_delta >= 0 ? 'text-emerald-400' : 'text-amber-400'
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

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-[#1E293B]">
                    {result.reason}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1E293B] bg-[#111C35]/30 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
