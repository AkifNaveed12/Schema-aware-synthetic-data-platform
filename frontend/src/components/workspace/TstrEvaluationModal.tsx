import React, { useState } from 'react';
import { X, Target, Play, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, BarChart3, Database } from 'lucide-react';
import { TstrEvaluationResult } from '../../types';
import { runTstrEvaluation } from '../../api/client';

interface TstrEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId?: string;
  datasetName?: string;
  columns?: string[];
}

export const TstrEvaluationModal: React.FC<TstrEvaluationModalProps> = ({
  isOpen,
  onClose,
  datasetId,
  datasetName = 'Active Dataset',
  columns = [],
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [taskType, setTaskType] = useState<'classification' | 'regression'>('regression');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TstrEvaluationResult | null>(null);

  if (!isOpen) return null;

  const handleRunEvaluation = async () => {
    if (!datasetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await runTstrEvaluation(datasetId, selectedColumn || undefined, taskType);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError('TSTR evaluation failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing TSTR evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#111C35]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white tracking-tight">TSTR Utility Evaluation</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Train on Synthetic · Test on Real
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rigorous downstream machine-learning validation on <span className="text-slate-200 font-mono">{datasetName}</span>
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
                Upload a dataset in Workspace to run TSTR predictive utility evaluation.
              </p>
            </div>
          ) : (
            <>
              {/* TSTR Concept Explainer Banner */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200/90 leading-relaxed flex items-start gap-3">
                <Database className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white font-medium">How TSTR Guarantees Synthetic Quality:</strong>{' '}
                  The real dataset is split into a 70% training pool and a 30% strictly held-out test partition.
                  The synthetic model trains an ML estimator purely on generated data, which is then scored against the real held-out test set.
                  Comparing this against the Real&rarr;Real baseline quantifies exact downstream ML utility retention.
                </div>
              </div>

              {/* Configuration Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/50 border border-[#1E293B]">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Column (Y)
                  </label>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="">Auto-Detect Prediction Target</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Task Formulation
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-[#1E293B] text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="regression">Regression (Continuous Numeric)</option>
                    <option value="classification">Classification (Categorical / Discrete)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleRunEvaluation}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-semibold text-white transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Evaluating Split...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Run TSTR Benchmark
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Results Section */}
              {result && (
                <div className="space-y-4">
                  {/* Retention Hero Metric Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900/80 to-slate-950 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-semibold text-purple-400 tracking-wider">
                          Downstream Utility Retention
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {result.task_type.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">
                        Target: <span className="font-mono text-purple-300">{result.target_column}</span>
                      </h4>
                      <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-3xl font-extrabold font-mono text-emerald-400">
                        {result.overall_utility_retention}%
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Real Utility Preserved
                      </span>
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-slate-950/50">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#111C35]/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-[#1E293B]">
                          <th className="py-3 px-4">Evaluation Metric</th>
                          <th className="py-3 px-4 font-mono">Real &rarr; Real Baseline</th>
                          <th className="py-3 px-4 font-mono">Synthetic &rarr; Real (TSTR)</th>
                          <th className="py-3 px-4 font-mono text-right">Utility Retention</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E293B] font-mono">
                        {result.metrics.map((m) => (
                          <tr key={m.metric_name} className="hover:bg-slate-900/30 transition-colors">
                            <td className="py-3.5 px-4 font-sans font-medium text-white flex items-center gap-2">
                              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                              {m.metric_name}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              {typeof m.real_to_real_baseline === 'number'
                                ? m.real_to_real_baseline.toFixed(3)
                                : m.real_to_real_baseline}
                            </td>
                            <td className="py-3.5 px-4 text-purple-300 font-semibold">
                              {typeof m.synthetic_to_real === 'number'
                                ? m.synthetic_to_real.toFixed(3)
                                : m.synthetic_to_real}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  m.retention_pct >= 85
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : m.retention_pct >= 70
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {m.retention_pct.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Partition Footer */}
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-[#1E293B] text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>Held-Out Real Test Partition: {result.held_out_test_rows} records</span>
                    <span>Synthetic Training Partition: {result.synthetic_train_rows} records</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1E293B] bg-[#111C35]/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Held-out evaluation guarantees zero test contamination</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
