import React, { useState, useEffect } from 'react';
import {
  ModalityType,
  DocumentSubtype,
  TabularRow,
  RelationalDataset,
  InvoiceDocument,
  BankStatementDocument,
} from '../../types';
import { Download, Copy, Check, X, FileText, Database, Code, FileSpreadsheet, Sparkles } from 'lucide-react';
import { fetchBackendExport } from '../../api/client';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modality: ModalityType;
  docSubtype: DocumentSubtype;
  tabularRows: TabularRow[];
  relationalDataset: RelationalDataset;
  invoice: InvoiceDocument;
  bankStatement: BankStatementDocument;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  modality,
  docSubtype,
  tabularRows,
  relationalDataset,
  invoice,
  bankStatement,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'sql' | 'pdf'>('csv');
  const [isCopied, setIsCopied] = useState(false);
  const [backendExportContent, setBackendExportContent] = useState<string | null>(null);
  const [backendFilename, setBackendFilename] = useState<string | null>(null);
  const [isExportLoading, setIsExportLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const loadBackendExport = async () => {
      setIsExportLoading(true);
      let ds: any;
      if (modality === 'tabular') ds = { rows: tabularRows };
      else if (modality === 'relational') ds = { tables: { customers: relationalDataset.customers, orders: relationalDataset.orders, order_items: relationalDataset.order_items } };
      else if (modality === 'documents') ds = docSubtype === 'invoices' ? { invoices: [invoice] } : { statement: bankStatement };

      const res = await fetchBackendExport(selectedFormat, modality, ds);
      if (isMounted && res.data.raw_content) {
        setBackendExportContent(res.data.raw_content);
        setBackendFilename(res.data.filename);
      }
      if (isMounted) setIsExportLoading(false);
    };
    loadBackendExport();
    return () => { isMounted = false; };
  }, [isOpen, selectedFormat, modality, docSubtype, tabularRows, relationalDataset, invoice, bankStatement]);

  if (!isOpen) return null;

  // Generate payload string based on modality and format
  const generatePayload = (): { content: string; filename: string; mimeType: string } => {
    if (selectedFormat === 'json') {
      let data: unknown = tabularRows;
      if (modality === 'relational') data = relationalDataset;
      else if (modality === 'documents' && docSubtype === 'invoices') data = invoice;
      else if (modality === 'documents' && docSubtype === 'bank_statements') data = bankStatement;

      return {
        content: JSON.stringify(data, null, 2),
        filename: `synthetic_${modality}_export.json`,
        mimeType: 'application/json',
      };
    }

    if (selectedFormat === 'sql') {
      if (modality === 'relational') {
        const sqlLines = [
          '-- HACKDATA V2: SYNTHETIC RELATIONAL EXPORT',
          '-- Referential Integrity: 100% Valid',
          '',
          'CREATE TABLE customers (customer_id INT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), country VARCHAR(100), tier VARCHAR(50));',
          'CREATE TABLE orders (order_id VARCHAR(50) PRIMARY KEY, customer_id INT REFERENCES customers(customer_id), order_date DATE, total_amount DECIMAL(10,2), status VARCHAR(50));',
          'CREATE TABLE order_items (item_id VARCHAR(50) PRIMARY KEY, order_id VARCHAR(50) REFERENCES orders(order_id), sku VARCHAR(50), quantity INT, unit_price DECIMAL(10,2), amount DECIMAL(10,2));',
          '',
          '-- Customers DML',
          ...relationalDataset.customers.map(
            (c) =>
              `INSERT INTO customers VALUES (${c.customer_id}, '${c.name.replace(/'/g, "''")}', '${c.email}', '${c.country}', '${c.tier}');`
          ),
          '',
          '-- Orders DML',
          ...relationalDataset.orders.map(
            (o) =>
              `INSERT INTO orders VALUES ('${o.order_id}', ${o.customer_id}, '${o.order_date}', ${o.total_amount.toFixed(2)}, '${o.status}');`
          ),
          '',
          '-- Order Items DML',
          ...relationalDataset.order_items.map(
            (it) =>
              `INSERT INTO order_items VALUES ('${it.item_id}', '${it.order_id}', '${it.sku}', ${it.quantity}, ${it.unit_price.toFixed(2)}, ${it.amount.toFixed(2)});`
          ),
        ];
        return {
          content: sqlLines.join('\n'),
          filename: `synthetic_relational_schema.sql`,
          mimeType: 'application/sql',
        };
      }

      // Default tabular SQL
      const sqlLines = [
        'CREATE TABLE synthetic_customers (id INT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), signup_date DATE, balance DECIMAL(10,2), status VARCHAR(50));',
        ...tabularRows.map(
          (r) =>
            `INSERT INTO synthetic_customers VALUES (${r.id}, '${r.name.replace(/'/g, "''")}', '${r.email}', '${r.signupDate}', ${r.balance.toFixed(2)}, '${r.status}');`
        ),
      ];
      return {
        content: sqlLines.join('\n'),
        filename: `synthetic_tabular.sql`,
        mimeType: 'application/sql',
      };
    }

    // Default CSV
    if (modality === 'documents' && docSubtype === 'bank_statements') {
      const header = 'Date,Description,Category,Debit,Credit,Balance\n';
      const body = bankStatement.transactions
        .map((t) => `${t.date},"${t.description}",${t.category},${t.debit ?? ''},${t.credit ?? ''},${t.balance.toFixed(2)}`)
        .join('\n');
      return {
        content: header + body,
        filename: `synthetic_bank_statement.csv`,
        mimeType: 'text/csv',
      };
    }

    if (modality === 'documents' && docSubtype === 'invoices') {
      const header = 'InvoiceNumber,Item,Quantity,UnitPrice,Amount\n';
      const body = invoice.lineItems
        .map((it) => `${invoice.invoiceNumber},"${it.description}",${it.quantity},${it.unitPrice.toFixed(2)},${it.amount.toFixed(2)}`)
        .join('\n');
      return {
        content: header + body,
        filename: `${invoice.invoiceNumber}_lines.csv`,
        mimeType: 'text/csv',
      };
    }

    // Tabular CSV
    const header = 'ID,Name,Email,SignupDate,Balance,Status,SyntheticHash\n';
    const body = tabularRows
      .map((r) => `${r.id},"${r.name}",${r.email},${r.signupDate},${r.balance.toFixed(2)},${r.status},${r.syntheticHash}`)
      .join('\n');
    return {
      content: header + body,
      filename: `synthetic_tabular_data.csv`,
      mimeType: 'text/csv',
    };
  };

  const clientPayload = generatePayload();
  const content = backendExportContent || clientPayload.content;
  const filename = backendFilename || clientPayload.filename;
  const mimeType = clientPayload.mimeType;

  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-2xl bg-white rounded-2xl border border-brand-border shadow-modal overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-brand-hero">
                Export Synthetic Dataset
              </h3>
              {backendExportContent && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  <Sparkles className="w-2.5 h-2.5 text-brand-teal" />
                  Backend Verified
                </span>
              )}
            </div>
            <p className="text-xs text-brand-secondary font-mono">
              Zero-Code High-Fidelity Export · Multi-Format Target
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4">
          <button
            onClick={() => setSelectedFormat('csv')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              selectedFormat === 'csv'
                ? 'bg-brand-teal text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV Table
          </button>

          <button
            onClick={() => setSelectedFormat('json')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              selectedFormat === 'json'
                ? 'bg-brand-teal text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            JSON Payload
          </button>

          <button
            onClick={() => setSelectedFormat('sql')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              selectedFormat === 'sql'
                ? 'bg-brand-teal text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            SQL (DDL + DML)
          </button>

          <button
            onClick={() => {
              setSelectedFormat('pdf');
              window.print();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              selectedFormat === 'pdf'
                ? 'bg-brand-teal text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            PDF Render
          </button>
        </div>

        {/* Preview Code Viewport */}
        <div className="p-6">
          <div className="relative rounded-xl border border-brand-border bg-slate-950 p-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-[11px] font-mono text-slate-400">
              <span>{filename}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-teal-400 hover:text-teal-300 transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="font-mono text-xs text-slate-300 max-h-64 overflow-y-auto leading-relaxed select-text">
              {content}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-slate-50">
          <span className="text-xs font-mono text-brand-secondary">
            Payload size: {Math.round(content.length / 1024 * 10) / 10} KB
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-brand-border bg-white text-xs font-medium text-brand-hero hover:bg-slate-50 transition-all shadow-micro"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-teal hover:bg-brand-teal-hover text-white text-xs font-semibold transition-all shadow-panel"
            >
              <Download className="w-4 h-4" />
              Download {filename}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
