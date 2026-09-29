import React, { useState } from 'react';
import { X, Plus, AlertCircle, Sparkles, Check, Hash, Calendar, Type, Tag } from 'lucide-react';
import { SyntheticColumnSpec, SyntheticDataType } from '../../types';

interface AddSyntheticColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingColumnNames: string[];
  existingSyntheticColumns: SyntheticColumnSpec[];
  onAddColumn: (col: SyntheticColumnSpec) => void;
}

export const AddSyntheticColumnModal: React.FC<AddSyntheticColumnModalProps> = ({
  isOpen,
  onClose,
  existingColumnNames,
  existingSyntheticColumns,
  onAddColumn,
}) => {
  const [name, setName] = useState('');
  const [dataType, setDataType] = useState<SyntheticDataType>('categorical');
  const [semanticType, setSemanticType] = useState('salary_band');
  const [description, setDescription] = useState('');

  // Numeric Config
  const [rangeMin, setRangeMin] = useState<number>(0);
  const [rangeMax, setRangeMax] = useState<number>(100);
  const [numDistribution, setNumDistribution] = useState<'uniform' | 'normal' | 'log_normal'>('uniform');
  const [numMean, setNumMean] = useState<number>(50);
  const [numStdDev, setNumStdDev] = useState<number>(15);

  // Categorical Config
  const [catValues, setCatValues] = useState('Entry, Mid, Senior, Executive');
  const [useProbabilities, setUseProbabilities] = useState(false);
  const [catProbs, setCatProbs] = useState('0.3, 0.4, 0.2, 0.1');

  // Date Config
  const [dateStart, setDateStart] = useState('2024-01-01');
  const [dateEnd, setDateEnd] = useState('2026-12-31');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  // String Config
  const [stringRole, setStringRole] = useState('customer_segment');
  const [stringPattern, setPattern] = useState('SEG-{{random_int}}');
  const [stringLocale, setStringLocale] = useState('en_US');

  // Validation state
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Column name cannot be empty.');
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedName)) {
      setError('Column name must start with a letter/underscore and contain only letters, numbers, or underscores.');
      return;
    }

    const lowerName = trimmedName.toLowerCase();

    // Check collision with source columns
    if (existingColumnNames.some((c) => c.toLowerCase() === lowerName)) {
      setError(`Source-column collision: "${trimmedName}" already exists in the ingested dataset.`);
      return;
    }

    // Check duplicate with already added synthetic columns
    if (existingSyntheticColumns.some((c) => c.name.toLowerCase() === lowerName)) {
      setError(`Duplicate name: Synthetic column "${trimmedName}" has already been configured.`);
      return;
    }

    const newCol: SyntheticColumnSpec = {
      name: trimmedName,
      data_type: dataType,
      semantic_type: semanticType.trim() || undefined,
      description: description.trim() || undefined,
    };

    if (dataType === 'integer' || dataType === 'float') {
      if (rangeMin >= rangeMax) {
        setError('Minimum value must be strictly less than maximum value.');
        return;
      }
      newCol.range_min = rangeMin;
      newCol.range_max = rangeMax;
      newCol.distribution = {
        type: numDistribution,
        mean: numMean,
        std_dev: numStdDev,
      };
    } else if (dataType === 'categorical') {
      const items = catValues
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (items.length < 2) {
        setError('Categorical columns must have at least 2 distinct values (comma-separated).');
        return;
      }
      newCol.categorical_values = items;
      if (useProbabilities) {
        const probs = catProbs
          .split(',')
          .map((s) => parseFloat(s.trim()))
          .filter((n) => !isNaN(n));
        if (probs.length !== items.length) {
          setError(`Probabilities count (${probs.length}) must match values count (${items.length}).`);
          return;
        }
        newCol.categorical_probabilities = probs;
      }
    } else if (dataType === 'date') {
      if (dateStart >= dateEnd) {
        setError('Start date must be before end date.');
        return;
      }
      newCol.date_start = dateStart;
      newCol.date_end = dateEnd;
      newCol.date_format = dateFormat;
    } else if (dataType === 'string') {
      newCol.string_role = stringRole;
      newCol.string_pattern = stringPattern;
      newCol.string_locale = stringLocale;
    }

    onAddColumn(newCol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="flex flex-col w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Synthetic Column</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Define custom calculated or distribution-driven schema extensions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleValidateAndSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Column Name & Data Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Column Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. salary_band"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value as SyntheticDataType)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white font-medium text-slate-700"
              >
                <option value="categorical">Categorical (Discrete Classes)</option>
                <option value="integer">Integer (Whole Numbers)</option>
                <option value="float">Float (Continuous Numeric)</option>
                <option value="date">Date (Timestamp / ISO)</option>
                <option value="string">String (Pattern / Semantic Text)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Semantic Type & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Semantic Type
              </label>
              <input
                type="text"
                placeholder="e.g. salary_band, loyalty_tier"
                value={semanticType}
                onChange={(e) => setSemanticType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-teal-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Employee pay bracket for compensation testing"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Type-Specific Generation Settings */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              {dataType === 'integer' || dataType === 'float' ? (
                <>
                  <Hash className="w-3.5 h-3.5 text-teal-600" /> Numeric Generation Parameters
                </>
              ) : dataType === 'categorical' ? (
                <>
                  <Tag className="w-3.5 h-3.5 text-teal-600" /> Categorical Classes & Frequencies
                </>
              ) : dataType === 'date' ? (
                <>
                  <Calendar className="w-3.5 h-3.5 text-teal-600" /> Date Range & Formatting
                </>
              ) : (
                <>
                  <Type className="w-3.5 h-3.5 text-teal-600" /> String Pattern & Locale Settings
                </>
              )}
            </h4>

            {/* NUMERIC CONTROLS */}
            {(dataType === 'integer' || dataType === 'float') && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Min Value</label>
                    <input
                      type="number"
                      step={dataType === 'float' ? '0.01' : '1'}
                      value={rangeMin}
                      onChange={(e) => setRangeMin(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Max Value</label>
                    <input
                      type="number"
                      step={dataType === 'float' ? '0.01' : '1'}
                      value={rangeMax}
                      onChange={(e) => setRangeMax(parseFloat(e.target.value) || 100)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Distribution</label>
                    <select
                      value={numDistribution}
                      onChange={(e) => setNumDistribution(e.target.value as any)}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                    >
                      <option value="uniform">Uniform</option>
                      <option value="normal">Gaussian (Normal)</option>
                      <option value="log_normal">Log-Normal</option>
                    </select>
                  </div>
                  {numDistribution !== 'uniform' && (
                    <>
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">Mean (μ)</label>
                        <input
                          type="number"
                          value={numMean}
                          onChange={(e) => setNumMean(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-600 mb-1">Std Dev (σ)</label>
                        <input
                          type="number"
                          value={numStdDev}
                          onChange={(e) => setNumStdDev(parseFloat(e.target.value) || 1)}
                          className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* CATEGORICAL CONTROLS */}
            {dataType === 'categorical' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Allowed Values (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={catValues}
                    onChange={(e) => setCatValues(e.target.value)}
                    placeholder="Entry, Mid, Senior, Executive"
                    className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Each synthesized row will sample from these classes.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="use-prob"
                    checked={useProbabilities}
                    onChange={(e) => setUseProbabilities(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="use-prob" className="text-xs text-slate-700 font-medium">
                    Configure custom frequency distribution weights
                  </label>
                </div>

                {useProbabilities && (
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      Weights / Probabilities (Must match count of values)
                    </label>
                    <input
                      type="text"
                      value={catProbs}
                      onChange={(e) => setCatProbs(e.target.value)}
                      placeholder="0.3, 0.4, 0.2, 0.1"
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            {/* DATE CONTROLS */}
            {dataType === 'date' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Date Format</label>
                  <input
                    type="text"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            )}

            {/* STRING CONTROLS */}
            {dataType === 'string' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Semantic Role</label>
                    <input
                      type="text"
                      value={stringRole}
                      onChange={(e) => setStringRole(e.target.value)}
                      placeholder="e.g. department_code, tier_tag"
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Locale</label>
                    <input
                      type="text"
                      value={stringLocale}
                      onChange={(e) => setStringLocale(e.target.value)}
                      placeholder="en_US"
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Pattern Template</label>
                  <input
                    type="text"
                    value={stringPattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="PREFIX-{{random_int}}"
                    className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary Schema Footprint */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-teal-50/70 border border-teal-200 text-xs font-mono text-teal-900">
            <span>Source Columns: <strong>{existingColumnNames.length}</strong></span>
            <span>Synthetic Columns: <strong>{existingSyntheticColumns.length + 1}</strong></span>
            <span>Final Schema: <strong>{existingColumnNames.length + existingSyntheticColumns.length + 1}</strong> cols</span>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-all active:scale-98 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Add to Schema
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
