import React, { useState, useEffect } from 'react';
import { X, Cpu, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { ModelBenchmarkResult } from '../../types';
import { fetchModelBenchmark } from '../../api/client';

interface ModelBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId?: string;
  datasetName?: string;
  onSelectModel?: (model: string) => void;
}

export const ModelBenchmarkModal: React.FC<ModelBenchmarkModalProps> = ({
  isOpen,
  onClose,
  datasetId,
  datasetName = 'Active Dataset',
  onSelectModel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [benchmarkData, setBenchmarkData] = useState<ModelBenchmarkResult | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');

  useEffect(() => {
    if (isOpen && datasetId) {
      loadBenchmark();
    }
  }, [isOpen, datasetId]);

  const loadBenchmark = async () => {
    if (!datasetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchModelBenchmark(datasetId);
      if (res.success && res.data) {
        setBenchmarkData(res.data);
        setSelectedCandidate(res.data.selected_model);
      } else {
        setError('Failed to compute model benchmark.');
      }
    } catch (err: any) {
      setError(err.message || 'Error running model benchmark');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E293B] flex items-center justify-between bg-[#111C35]/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white tracking-tight">Empirical Model Benchmark</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Empirical Synthesizer Evaluation
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cross-validated Statistical vs CTGAN vs TVAE evaluation on <span className="text-slate-200 font-mono">{datasetName}</span>
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
                Upload a dataset in Workspace to run empirical benchmarking across model adapters.
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-16 space-y-4">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-300 font-medium">
                Running empirical benchmarking across model adapters...
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Fitting StatisticalBaseline, CTGAN, and TVAE adapters. Measuring fidelity, privacy, and training latency.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadBenchmark}
                className="px-3 py-1 bg-red-900/40 hover:bg-red-900/60 rounded text-xs font-medium text-red-200"
              >
                Retry
              </button>
            </div>
          ) : benchmarkData ? (
            <>
              {/* Selected Recommendation Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-blue-950/30 to-slate-900/50 border border-indigo-500/30 flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
                      Recommended Synthesizer
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/30 text-white">
                      {benchmarkData.selected_model}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {benchmarkData.selection_rationale}
                  </p>
                </div>
                <button
                  onClick={loadBenchmark}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Re-benchmark
                </button>
              </div>

              {/* Table */}
              <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-slate-950/40">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#111C35]/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-[#1E293B]">
                      <th className="py-3 px-4">Model Candidate</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Validity</th>
                      <th className="py-3 px-3">Quality Score</th>
                      <th className="py-3 px-3">Distribution</th>
                      <th className="py-3 px-3">Novelty</th>
                      <th className="py-3 px-3">Privacy</th>
                      <th className="py-3 px-3">Train Latency</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] font-mono">
                    {benchmarkData.candidates.map((c) => {
                      const isSelected = selectedCandidate === c.name;
                      const isRecommended = benchmarkData.selected_model === c.name;
                      return (
                        <tr
                          key={c.name}
                          className={`transition-colors ${
                            isSelected ? 'bg-indigo-950/20' : 'hover:bg-slate-900/40'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-sans font-medium text-white flex items-center gap-2">
                            <span>{c.name}</span>
                            {isRecommended && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                Recommended
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            {c.status === 'trained' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Trained
                              </span>
                            ) : c.status === 'available' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 font-sans">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-sans">
                                {c.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-slate-300">
                            {c.validity > 0 ? `${(c.validity * 100).toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`font-semibold ${
                                c.quality_score >= 0.85
                                  ? 'text-emerald-400'
                                  : c.quality_score >= 0.70
                                  ? 'text-sky-300'
                                  : 'text-amber-400'
                              }`}
                            >
                              {c.quality_score > 0 ? `${(c.quality_score * 100).toFixed(1)}%` : '—'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-300">
                            {c.relationship_score > 0 ? `${(c.relationship_score * 100).toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-slate-300">
                            {c.novelty_rate > 0 ? `${(c.novelty_rate * 100).toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-emerald-400">
                            {c.privacy_score > 0 ? `${(c.privacy_score * 100).toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-slate-400">
                            {c.train_time_ms > 0 ? `${c.train_time_ms} ms` : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-sans">
                            <button
                              onClick={() => {
                                setSelectedCandidate(c.name);
                                onSelectModel?.(c.name);
                              }}
                              disabled={c.status === 'unavailable' || c.status === 'failed'}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
                              }`}
                            >
                              {isSelected ? 'Active' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Zero Hallucination Note */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-[#1E293B] text-[11px] text-slate-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-200 font-medium">Empirical Cross-Validation:</strong> Metrics evaluate distribution divergence, boundary conformance, and identity differential privacy. Real records are never leaked or reproduced.
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1E293B] bg-[#111C35]/30 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {benchmarkData?.executed_at ? `Evaluated: ${new Date(benchmarkData.executed_at).toLocaleTimeString()}` : ''}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            {selectedCandidate && (
              <button
                onClick={() => {
                  onSelectModel?.(selectedCandidate);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
              >
                <span>Use {selectedCandidate}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
