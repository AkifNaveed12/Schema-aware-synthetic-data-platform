import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Send, RefreshCw, X } from 'lucide-react';
import { emailGeneratedDataset } from '../../api/client';

interface EmailDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetName?: string;
  defaultFormat?: 'csv' | 'json' | 'sql';
  datasetId?: string;
  requestId?: string;
  content?: string;
  rowCount?: number;
}

export const EmailDatasetModal: React.FC<EmailDatasetModalProps> = ({
  isOpen,
  onClose,
  datasetName = 'synthetic_dataset',
  defaultFormat = 'csv',
  datasetId,
  requestId,
  content,
  rowCount = 100,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [format, setFormat] = useState<'csv' | 'json' | 'sql'>(defaultFormat);
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      setErrorMsg('Please enter a valid recipient email address.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await emailGeneratedDataset({
        recipient_email: recipientEmail.trim(),
        dataset_name: datasetName,
        export_format: format,
        dataset_id: datasetId,
        request_id: requestId,
        content: content,
        row_count: rowCount,
      });

      setSuccessMsg(res?.message || `Dataset successfully emailed to ${recipientEmail}!`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        setRecipientEmail('');
      }, 2200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to email dataset via SMTP.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Email Synthetic Dataset</h3>
            <p className="text-xs text-slate-400">
              Dispatches dataset file as an attachment directly via SMTP.
            </p>
          </div>
        </div>

        {/* Dataset Summary Pill */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Dataset</span>
            <span className="font-bold text-slate-200">{datasetName}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Rows</span>
            <span className="font-mono text-teal-400 font-bold">{rowCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3 flex items-start gap-2 text-rose-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl p-3 flex items-start gap-2 text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Recipient Destination Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. colleague@company.com"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Attachment Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['csv', 'json', 'sql'] as const).map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                    format === fmt
                      ? 'bg-teal-600 text-white border-teal-500 shadow-xs'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  .{fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !recipientEmail.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-900/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending via SMTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Dataset Email</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
