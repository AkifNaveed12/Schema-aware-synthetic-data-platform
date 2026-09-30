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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-brand-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-brand-hero tracking-tight">TSTR Utility Evaluation</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  Train on Synthetic · Test on Real
                </span>
              </div>
              <p className="text-xs text-brand-secondary">
                Rigorous downstream machine-learning validation on <span className="text-brand-hero font-mono">{datasetName}</span>
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
                Upload a dataset in Workspace to run TSTR predictive utility evaluation.
              </p>
            </div>
          ) : (
            <>
              {/* TSTR Concept Explainer Banner */}
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs text-purple-900 leading-relaxed flex items-start gap-3">
                <Database className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-brand-hero font-semibold">How TSTR Guarantees Synthetic Quality:</strong>{' '}
                  The real dataset is split into a 70% training pool and a 30% strictly held-out test partition.
                  The synthetic model trains an ML estimator purely on generated data, which is then scored against the real held-out test set.
                  Comparing this against the Real&rarr;Real baseline quantifies exact downstream ML utility retention.
                </div>
              </div>

              {/* Configuration Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-brand-border">
                <div>
                  <label className="block text-xs font-semibold text-brand-hero mb-1.5">
                    Target Column (Y)
                  </label>
                  <select
                    value={selectedColumn}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-brand-border text-xs text-brand-hero focus:outline-none focus:border-brand-teal font-mono shadow-micro"
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
                  <label className="block text-xs font-semibold text-brand-hero mb-1.5">
                    Task Formulation
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-brand-border text-xs text-brand-hero focus:outline-none focus:border-brand-teal shadow-micro"
                  >
                    <option value="regression">Regression (Continuous Numeric)</option>
                    <option value="classification">Classification (Categorical / Discrete)</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleRunEvaluation}
                    disabled={loading}
                    className="w-full px-4 py-2 rounded-lg bg-brand-teal hover:bg-brand-teal-hover disabled:opacity-50 text-xs font-semibold text-white transition-all shadow-micro flex items-center justify-center gap-2 cursor-pointer"
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
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Results Section */}
              {result && (
                <div className="space-y-4">
                  {/* Retention Hero Metric Card */}
                  <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-semibold text-brand-teal tracking-wider">
                          Downstream Utility Retention
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-100 text-brand-teal border border-teal-300 font-bold">
                          {result.task_type.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-brand-hero">
                        Target: <span className="font-mono text-brand-teal">{result.target_column}</span>
                      </h4>
                      <p className="text-xs text-brand-secondary max-w-xl leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-3xl font-extrabold font-mono text-emerald-600">
                        {result.overall_utility_retention}%
                      </div>
                      <span className="text-[11px] text-brand-secondary font-medium">
                        Real Utility Preserved
                      </span>
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="border border-brand-border rounded-xl overflow-hidden bg-white shadow-micro">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-brand-secondary uppercase tracking-wider text-[11px] font-semibold border-b border-brand-border">
                          <th className="py-3 px-4">Evaluation Metric</th>
                          <th className="py-3 px-4 font-mono">Real &rarr; Real Baseline</th>
                          <th className="py-3 px-4 font-mono">Synthetic &rarr; Real (TSTR)</th>
                          <th className="py-3 px-4 font-mono text-right">Utility Retention</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border font-mono">
                        {result.metrics.map((m) => (
                          <tr key={m.metric_name} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4 font-sans font-medium text-brand-hero flex items-center gap-2">
                              <BarChart3 className="w-3.5 h-3.5 text-brand-teal" />
                              {m.metric_name}
                            </td>
                            <td className="py-3.5 px-4 text-brand-hero">
                              {typeof m.real_to_real_baseline === 'number'
                                ? m.real_to_real_baseline.toFixed(3)
                                : m.real_to_real_baseline}
                            </td>
                            <td className="py-3.5 px-4 text-brand-teal font-semibold">
                              {typeof m.synthetic_to_real === 'number'
                                ? m.synthetic_to_real.toFixed(3)
                                : m.synthetic_to_real}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  m.retention_pct >= 85
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : m.retention_pct >= 70
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-brand-border text-[11px] text-brand-secondary flex items-center justify-between font-mono">
                    <span>Held-Out Real Test Partition: {result.held_out_test_rows} records</span>
                    <span>Synthetic Training Partition: {result.synthetic_train_rows} records</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-brand-secondary">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Held-out evaluation guarantees zero test contamination</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-brand-secondary hover:text-brand-hero hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
