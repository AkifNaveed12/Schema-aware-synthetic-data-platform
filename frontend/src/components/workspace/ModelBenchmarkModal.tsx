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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-brand-border rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-brand-teal">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-brand-hero tracking-tight">Empirical Model Benchmark</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-brand-teal border border-teal-200">
                  Empirical Synthesizer Evaluation
                </span>
              </div>
              <p className="text-xs text-brand-secondary">
                Cross-validated Statistical vs CTGAN vs TVAE evaluation on <span className="text-brand-hero font-mono">{datasetName}</span>
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
                Upload a dataset in Workspace to run empirical benchmarking across model adapters.
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-16 space-y-4">
              <RefreshCw className="w-8 h-8 text-brand-teal animate-spin mx-auto" />
              <p className="text-sm text-brand-hero font-medium">
                Running empirical benchmarking across model adapters...
              </p>
              <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                Fitting StatisticalBaseline, CTGAN, and TVAE adapters. Measuring fidelity, privacy, and training latency.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadBenchmark}
                className="px-3 py-1 bg-rose-100 hover:bg-rose-200 rounded text-xs font-medium text-rose-800 border border-rose-300 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : benchmarkData ? (
            <>
              {/* Selected Recommendation Banner */}
              <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-teal-100 text-brand-teal mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-brand-teal">
                      Recommended Synthesizer
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-brand-teal text-white">
                      {benchmarkData.selected_model}
                    </span>
                  </div>
                  <p className="text-xs text-brand-hero mt-1 leading-relaxed">
                    {benchmarkData.selection_rationale}
                  </p>
                </div>
                <button
                  onClick={loadBenchmark}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs font-medium text-brand-hero border border-brand-border transition-colors shadow-micro cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-brand-teal" />
                  Re-benchmark
                </button>
              </div>

              {/* Table */}
              <div className="border border-brand-border rounded-xl overflow-hidden bg-white shadow-micro">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-brand-secondary uppercase tracking-wider text-[11px] font-semibold border-b border-brand-border">
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
                  <tbody className="divide-y divide-brand-border font-mono">
                    {benchmarkData.candidates.map((c) => {
                      const isSelected = selectedCandidate === c.name;
                      const isRecommended = benchmarkData.selected_model === c.name;
                      return (
                        <tr
                          key={c.name}
                          className={`transition-colors ${
                            isSelected ? 'bg-teal-50/50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-sans font-medium text-brand-hero flex items-center gap-2">
                            <span>{c.name}</span>
                            {isRecommended && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold bg-teal-50 text-brand-teal border border-teal-200">
                                Recommended
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            {c.status === 'trained' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-sans font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Trained
                              </span>
                            ) : c.status === 'available' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 font-sans font-medium">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-brand-secondary font-sans">
                                {c.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-brand-hero">
                            {c.validity > 0 ? `${(c.validity * 100).toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`font-semibold ${
                                c.quality_score >= 0.85
                                  ? 'text-emerald-600'
                                  : c.quality_score >= 0.70
                                  ? 'text-sky-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {c.quality_score > 0 ? `${(c.quality_score * 100).toFixed(1)}%` : '—'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-brand-hero">
                            {c.relationship_score > 0 ? `${(c.relationship_score * 100).toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-brand-hero">
                            {c.novelty_rate > 0 ? `${(c.novelty_rate * 100).toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-brand-teal font-semibold">
                            {c.privacy_score > 0 ? `${(c.privacy_score * 100).toFixed(1)}%` : '—'}
                          </td>
                          <td className="py-3.5 px-3 text-brand-secondary">
                            {c.train_time_ms > 0 ? `${c.train_time_ms} ms` : '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-sans">
                            <button
                              onClick={() => {
                                setSelectedCandidate(c.name);
                                onSelectModel?.(c.name);
                              }}
                              disabled={c.status === 'unavailable' || c.status === 'failed'}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-brand-teal text-white shadow-xs'
                                  : 'bg-white hover:bg-slate-100 text-brand-hero border border-brand-border disabled:opacity-40 disabled:cursor-not-allowed'
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
              <div className="p-3.5 rounded-xl bg-slate-50 border border-brand-border text-[11px] text-brand-secondary flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                <p>
                  <strong className="text-brand-hero font-medium">Empirical Cross-Validation:</strong> Metrics evaluate distribution divergence, boundary conformance, and identity differential privacy. Real records are never leaked or reproduced.
                </p>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-brand-secondary font-mono">
            {benchmarkData?.executed_at ? `Evaluated: ${new Date(benchmarkData.executed_at).toLocaleTimeString()}` : ''}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-brand-secondary hover:text-brand-hero hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Close
            </button>
            {selectedCandidate && (
              <button
                onClick={() => {
                  onSelectModel?.(selectedCandidate);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal-hover shadow-micro transition-all flex items-center gap-1.5 cursor-pointer"
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
