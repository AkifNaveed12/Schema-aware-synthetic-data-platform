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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-brand-border rounded-2xl w-full max-w-md p-6 text-brand-hero shadow-modal relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-50 text-brand-teal rounded-xl border border-teal-200">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-hero">Email Synthetic Dataset</h3>
            <p className="text-xs text-brand-secondary">
              Dispatches dataset file as an attachment directly via SMTP.
            </p>
          </div>
        </div>

        {/* Dataset Summary Pill */}
        <div className="bg-slate-50 p-3 rounded-xl border border-brand-border flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-brand-secondary uppercase tracking-wider block font-semibold">Dataset</span>
            <span className="font-bold text-brand-hero">{datasetName}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-brand-secondary uppercase tracking-wider block font-semibold">Rows</span>
            <span className="font-mono text-brand-teal font-bold">{rowCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-rose-700 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-emerald-700 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-secondary block mb-1.5">
              Recipient Destination Email
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. colleague@company.com"
              required
              className="w-full bg-slate-50 border border-brand-border rounded-xl px-3.5 py-2.5 text-xs text-brand-hero placeholder:text-slate-400 focus:outline-hidden focus:border-brand-teal focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-secondary block mb-1.5">
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
                      ? 'bg-brand-teal text-white border-brand-teal shadow-xs'
                      : 'bg-slate-50 text-brand-secondary border-brand-border hover:text-brand-hero hover:bg-slate-100'
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-brand-hero hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !recipientEmail.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-brand-teal hover:bg-brand-teal-hover text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
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
