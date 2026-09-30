import React, { useState, useEffect } from 'react';
import { X, Brain, Sparkles, CheckCircle2, AlertTriangle, Plus, Tag, HelpCircle, ShieldCheck } from 'lucide-react';
import { SemanticUnderstandingReport, SyntheticColumnSpec } from '../../types';
import { fetchSemanticUnderstanding, addSyntheticColumnToDataset } from '../../api/client';

interface SemanticUnderstandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId?: string;
  datasetName?: string;
  onApplySyntheticColumn?: (col: SyntheticColumnSpec) => void;
}

export const SemanticUnderstandingModal: React.FC<SemanticUnderstandingModalProps> = ({
  isOpen,
  onClose,
  datasetId,
  datasetName = 'Active Dataset',
  onApplySyntheticColumn,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SemanticUnderstandingReport | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && datasetId) {
      loadReport();
    }
  }, [isOpen, datasetId]);

  const loadReport = async () => {
    if (!datasetId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSemanticUnderstanding(datasetId);
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        setError('Failed to load semantic understanding report.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching semantic analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = async (suggestion: any) => {
    if (!datasetId || !suggestion.suggested_column) return;
    setApplyingId(suggestion.id);
    try {
      const res = await addSyntheticColumnToDataset(datasetId, suggestion.suggested_column);
      if (res.success) {
        setAppliedIds((prev) => new Set(prev).add(suggestion.id));
        onApplySyntheticColumn?.(suggestion.suggested_column);
      } else {
        alert('Failed to add synthetic column to dataset.');
      }
    } catch (err: any) {
      alert(err.message || 'Error adding synthetic column');
    } finally {
      setApplyingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-brand-border rounded-2xl w-full max-w-4xl shadow-modal overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-brand-teal">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-brand-hero tracking-tight">Semantic Dataset Understanding</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                  AI Contextual Reasoning
                </span>
              </div>
              <p className="text-xs text-brand-secondary">
                Inferred domain semantics & synthetic enhancements for <span className="text-brand-hero font-mono font-semibold">{datasetName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!datasetId ? (
            <div className="text-center py-12 text-brand-secondary">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-500" />
              <p className="text-sm font-medium text-brand-hero">No active dataset selected.</p>
              <p className="text-xs text-brand-secondary mt-1">
                Upload a dataset in Workspace to view semantic interpretations.
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-16 space-y-4">
              <Sparkles className="w-8 h-8 text-brand-teal animate-spin mx-auto" />
              <p className="text-sm text-brand-hero font-medium">
                Analyzing schema ontology and semantic meanings...
              </p>
              <p className="text-xs text-brand-secondary max-w-sm mx-auto">
                Inferring domain types, entity roles, and non-destructive synthetic column enhancements.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadReport}
                className="px-3 py-1 bg-rose-100 hover:bg-rose-200 rounded text-xs font-medium text-rose-800 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : report ? (
            <>
              {/* Inferred Domain Banner */}
              <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-teal-100 text-brand-teal mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-teal-800">
                    Inferred Enterprise Domain
                  </span>
                  <h4 className="text-sm font-bold text-brand-hero mt-0.5">{report.inferred_domain}</h4>
                  <p className="text-xs text-brand-secondary mt-1 leading-relaxed">
                    AI inferred the functional schema purpose based on observed column names, distribution patterns, and variance profiles.
                  </p>
                </div>
              </div>

              {/* Semantic Column Interpretations */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
                  Inferred Column Semantics
                </h4>
                <div className="border border-brand-border rounded-xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-brand-secondary uppercase tracking-wider text-[11px] font-semibold border-b border-brand-border">
                        <th className="py-3 px-4">Column</th>
                        <th className="py-3 px-3">Physical Type</th>
                        <th className="py-3 px-4">Semantic Meaning & Inferred Purpose</th>
                        <th className="py-3 px-3 text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {report.meanings.map((m) => (
                        <tr key={m.column_name} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-brand-hero">{m.column_name}</td>
                          <td className="py-3 px-3 font-mono text-brand-secondary">{m.detected_type}</td>
                          <td className="py-3 px-4 text-brand-hero leading-relaxed">{m.semantic_meaning}</td>
                          <td className="py-3 px-3 text-right">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                              {(m.confidence * 100).toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Column Enhancement Suggestions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">
                    Recommended Synthetic Column Enhancements
                  </h4>
                  <span className="text-[11px] text-brand-secondary">
                    Non-destructive suggestions ready to apply
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.ai_suggestions.map((sug) => {
                    const isApplied = appliedIds.has(sug.id);
                    const isApplying = applyingId === sug.id;
                    return (
                      <div
                        key={sug.id}
                        className="p-4 rounded-xl bg-slate-50/80 border border-brand-border flex flex-col justify-between space-y-3 hover:border-teal-300 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-brand-hero flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-brand-teal" />
                              {sug.title}
                            </span>
                          </div>
                          <p className="text-xs text-brand-secondary leading-relaxed mb-2">{sug.description}</p>
                          <div className="p-2 rounded bg-white border border-brand-border text-[11px] text-brand-secondary">
                            <strong className="text-brand-hero">Downstream Impact:</strong> {sug.impact}
                          </div>
                        </div>

                        {sug.suggested_column && (
                          <div className="pt-2 border-t border-brand-border flex items-center justify-between">
                            <span className="text-[11px] font-mono text-brand-teal font-medium">
                              +{sug.suggested_column.name} ({sug.suggested_column.data_type})
                            </span>
                            <button
                              onClick={() => handleApplySuggestion(sug)}
                              disabled={isApplied || isApplying}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                isApplied
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-brand-teal hover:bg-brand-teal-hover text-white shadow-sm disabled:opacity-50'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Column Added
                                </>
                              ) : isApplying ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Applying...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Synthetic Column
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-brand-secondary">
            <ShieldCheck className="w-4 h-4 text-brand-teal" />
            <span>Semantic understanding guides generation without leaking raw values</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
