import React, { useState, useEffect, useCallback } from 'react';
import {
  ModalityType,
  DocumentSubtype,
  GenerationConfig,
  TabularRow,
  RelationalDataset,
  InvoiceDocument,
  BankStatementDocument,
} from '../../types';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { LivePreviewCanvas } from './LivePreviewCanvas';
import { ConfigurationPanel } from './ConfigurationPanel';
import { ExportModal } from './ExportModal';
import {
  fetchTabularPreview,
  fetchRelationalPreview,
  fetchInvoicePreview,
  fetchBankStatementPreview,
} from '../../api/client';

export const WorkspaceLayout: React.FC = () => {
  // Navigation State
  const [activeModality, setActiveModality] = useState<ModalityType>('tabular');
  const [activeDocSubtype, setActiveDocSubtype] = useState<DocumentSubtype>('invoices');

  // Configuration State
  const [config, setConfig] = useState<GenerationConfig>({
    rowCount: 100,
    randomSeed: 42,
    isSeedLocked: true,
    locale: 'en_US',
    currency: 'USD',
    privacy: {
      masking: true,
      hashing: true,
      differentialNoise: false,
      epsilon: 0.8,
    },
    nullRate: 0.02,
    outlierRate: 0.01,
    naturalLanguageQuery: 'last 90 days, balance over $500',
  });

  // Data Preview States
  const [tabularRows, setTabularRows] = useState<TabularRow[]>([]);
  const [relationalDataset, setRelationalDataset] = useState<RelationalDataset>({
    customers: [],
    orders: [],
    order_items: [],
    referentialIntegrity: { valid: true, brokenFkCount: 0, reconciliationMismatches: 0, score: 1 },
  });
  const [invoice, setInvoice] = useState<InvoiceDocument>({
    invoiceNumber: 'INV-10432',
    issueDate: '2026-09-15',
    dueDate: '2026-10-15',
    billedTo: { name: 'Northwind Supplies Ltd.', address: '', taxId: '' },
    from: { name: 'Synth Data Co.', address: '', taxId: '' },
    lineItems: [],
    subtotal: 1240,
    taxRate: 0,
    taxAmount: 0,
    total: 1240,
    currency: 'USD',
    isReconciled: true,
  });
  const [bankStatement, setBankStatement] = useState<BankStatementDocument>({
    accountHolder: 'Synthetic Account Holder',
    accountNumber: '****-****-8819',
    statementPeriod: 'Aug 01, 2026 — Sep 15, 2026',
    startingBalance: 1246.4,
    endingBalance: 3257.9,
    currency: 'USD',
    transactions: [],
    totalDebits: 138.5,
    totalCredits: 2150.0,
    isReconciled: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Sub-second reactive preview recomputation
  const recomputePreview = useCallback(async (currentConfig: GenerationConfig) => {
    setIsLoading(true);

    if (activeModality === 'tabular') {
      const res = await fetchTabularPreview(currentConfig);
      setTabularRows(res.data);
    } else if (activeModality === 'relational') {
      const res = await fetchRelationalPreview(currentConfig);
      setRelationalDataset(res.data);
    } else if (activeModality === 'documents') {
      if (activeDocSubtype === 'invoices') {
        const res = await fetchInvoicePreview(currentConfig);
        setInvoice(res.data);
      } else {
        const res = await fetchBankStatementPreview(currentConfig);
        setBankStatement(res.data);
      }
    }

    setIsLoading(false);
  }, [activeModality, activeDocSubtype]);

  // Initial and reactive trigger on settings change
  useEffect(() => {
    recomputePreview(config);
  }, [config, activeModality, activeDocSubtype, recomputePreview]);

  const handleConfigChange = (updated: Partial<GenerationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleApplyBankQuery = (query: string) => {
    handleConfigChange({ naturalLanguageQuery: query });
  };

  return (
    <div className="flex w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-brand-canvas">
      {/* 1. Left Sidebar (Workspace Navigation, #0F172A) */}
      <WorkspaceSidebar
        activeModality={activeModality}
        activeDocSubtype={activeDocSubtype}
        onSelectModality={setActiveModality}
        onSelectDocSubtype={setActiveDocSubtype}
        activeSeed={config.randomSeed}
      />

      {/* 2. Center Stage (Live Preview Canvas, #F8F7F4 / #FFFFFF) */}
      <LivePreviewCanvas
        modality={activeModality}
        docSubtype={activeDocSubtype}
        config={config}
        tabularRows={tabularRows}
        relationalDataset={relationalDataset}
        invoice={invoice}
        bankStatement={bankStatement}
        isLoading={isLoading}
        onRefresh={() => recomputePreview(config)}
        onApplyBankQuery={handleApplyBankQuery}
      />

      {/* 3. Right Drawer (Configuration Panel, #FFFFFF) */}
      <ConfigurationPanel
        config={config}
        onChange={handleConfigChange}
        onExportClick={() => setIsExportOpen(true)}
        isGenerating={isLoading}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        modality={activeModality}
        docSubtype={activeDocSubtype}
        tabularRows={tabularRows}
        relationalDataset={relationalDataset}
        invoice={invoice}
        bankStatement={bankStatement}
      />
    </div>
  );
};
