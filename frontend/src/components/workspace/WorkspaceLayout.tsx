import React, { useState, useEffect, useCallback } from 'react';
import {
  ModalityType,
  DocumentSubtype,
  GenerationConfig,
  TabularRow,
  RelationalDataset,
  InvoiceDocument,
  BankStatementDocument,
  EvaluationData,
  SyntheticColumnSpec,
} from '../../types';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { LivePreviewCanvas } from './LivePreviewCanvas';
import { ConfigurationPanel } from './ConfigurationPanel';
import { ExportModal } from './ExportModal';
import { ValidationDashboardModal } from './ValidationDashboardModal';
import { DatasetUploadModal } from './DatasetUploadModal';
import { ModelBenchmarkModal } from './ModelBenchmarkModal';
import { TstrEvaluationModal } from './TstrEvaluationModal';
import { RegenerationModal } from './RegenerationModal';
import { SemanticUnderstandingModal } from './SemanticUnderstandingModal';
import { SynthiaAssistant } from './SynthiaAssistant';
import {
  fetchTabularPreview,
  fetchRelationalPreview,
  fetchInvoicePreview,
  fetchBankStatementPreview,
  fetchDatasetEvaluation,
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
  const [isEvalOpen, setIsEvalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isTstrOpen, setIsTstrOpen] = useState(false);
  const [isRegenOpen, setIsRegenOpen] = useState(false);
  const [isSemanticOpen, setIsSemanticOpen] = useState(false);
  const [activeDatasetId, setActiveDatasetId] = useState<string | undefined>(undefined);
  const [activeDatasetName, setActiveDatasetName] = useState<string>('employee_salary.csv');
  const [activeDatasetColumns, setActiveDatasetColumns] = useState<string[]>([]);
  const [isCustomDatasetActive, setIsCustomDatasetActive] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [isEvalLoading, setIsEvalLoading] = useState(false);

  // Sub-second reactive preview recomputation
  const recomputePreview = useCallback(async (currentConfig: GenerationConfig) => {
    if (isCustomDatasetActive) return; // Retain custom synthesized rows until cleared
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
  }, [activeModality, activeDocSubtype, isCustomDatasetActive]);

  // Initial and reactive trigger on settings change
  useEffect(() => {
    let isCancelled = false;

    const run = async () => {
      if (isCustomDatasetActive) return; // Don't overwrite uploaded data on config changes
      setIsLoading(true);
      if (activeModality === 'tabular') {
        if (isCustomDatasetActive) {
          const res = await fetchTabularPreview(config);
          if (!isCancelled) setTabularRows(res.data);
        } else {
          // Intentional clean empty state before dataset upload
          if (!isCancelled) setTabularRows([]);
        }
      } else if (activeModality === 'relational') {
        const res = await fetchRelationalPreview(config);
        if (!isCancelled) setRelationalDataset(res.data);
      } else if (activeModality === 'documents') {
        if (activeDocSubtype === 'invoices') {
          const res = await fetchInvoicePreview(config);
          if (!isCancelled) setInvoice(res.data);
        } else {
          const res = await fetchBankStatementPreview(config);
          if (!isCancelled) setBankStatement(res.data);
        }
      }
      if (!isCancelled) setIsLoading(false);
    };

    run();

    return () => {
      isCancelled = true;
    };
  }, [config, activeModality, activeDocSubtype, isCustomDatasetActive]);

  const handleConfigChange = (updated: Partial<GenerationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleApplyBankQuery = (query: string) => {
    handleConfigChange({ naturalLanguageQuery: query });
  };

  const handleApplyUploadedData = (
    rows: TabularRow[],
    datasetName: string,
    datasetId?: string,
    columns?: string[]
  ) => {
    setIsCustomDatasetActive(true);
    setActiveModality('tabular');
    setTabularRows(rows);
    if (datasetId) setActiveDatasetId(datasetId);
    if (datasetName) setActiveDatasetName(datasetName);
    if (columns && columns.length > 0) {
      setActiveDatasetColumns(columns);
    } else if (rows.length > 0) {
      setActiveDatasetColumns(Object.keys(rows[0]));
    }
    setConfig((prev) => ({ ...prev, rowCount: rows.length }));
  };

  const handleApplySyntheticColumns = (cols: SyntheticColumnSpec[]) => {
    // When Synthia or Semantic adds synthetic columns
    console.log('Synthetic columns applied to dataset:', cols);
  };

  const runEvaluation = useCallback(async () => {
    setIsEvalLoading(true);
    let datasetPayload: any;
    if (activeModality === 'tabular') {
      datasetPayload = { rows: tabularRows };
    } else if (activeModality === 'relational') {
      datasetPayload = { tables: { customers: relationalDataset.customers, orders: relationalDataset.orders, order_items: relationalDataset.order_items } };
    } else if (activeModality === 'documents') {
      datasetPayload = activeDocSubtype === 'invoices' ? { invoices: [invoice] } : { statement: bankStatement };
    }

    const evalRes = await fetchDatasetEvaluation(activeModality, datasetPayload);
    setEvaluationData(evalRes.data);
    setIsEvalLoading(false);
  }, [activeModality, activeDocSubtype, tabularRows, relationalDataset, invoice, bankStatement]);

  const handleOpenEvaluation = () => {
    setIsEvalOpen(true);
    runEvaluation();
  };

  return (
    <div className="relative flex w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-brand-canvas">
      {/* 1. Left Sidebar (Workspace Navigation, #0F172A) */}
      <WorkspaceSidebar
        activeModality={activeModality}
        activeDocSubtype={activeDocSubtype}
        onSelectModality={(mod) => {
          setIsCustomDatasetActive(false);
          setActiveModality(mod);
        }}
        onSelectDocSubtype={setActiveDocSubtype}
        activeSeed={config.randomSeed}
        onOpenEvaluation={handleOpenEvaluation}
        onOpenUploadModal={() => setIsUploadOpen(true)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onOpenTstr={() => setIsTstrOpen(true)}
        onOpenRegeneration={() => setIsRegenOpen(true)}
        onOpenSemantic={() => setIsSemanticOpen(true)}
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
        onRefresh={() => {
          setIsCustomDatasetActive(false);
          recomputePreview(config);
        }}

        onApplyBankQuery={handleApplyBankQuery}
        onOpenEvaluation={handleOpenEvaluation}
        onOpenUploadModal={() => setIsUploadOpen(true)}
      />

      {/* 3. Right Drawer (Configuration Panel, #FFFFFF) */}
      <ConfigurationPanel
        config={config}
        onChange={handleConfigChange}
        onExportClick={() => setIsExportOpen(true)}
        isGenerating={isLoading}
      />

      {/* Dataset Upload & Profiling Modal (Part II Workflow) */}
      <DatasetUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onApplyGeneratedData={handleApplyUploadedData}
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

      {/* Validation & Evaluation Dashboard Modal */}
      <ValidationDashboardModal
        isOpen={isEvalOpen}
        onClose={() => setIsEvalOpen(false)}
        modality={activeModality}
        evaluation={evaluationData}
        isLoading={isEvalLoading}
        onReevaluate={runEvaluation}
      />

      {/* Differentiator 1: Empirical Model Benchmark Modal */}
      <ModelBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        datasetId={activeDatasetId}
        datasetName={activeDatasetName}
      />

      {/* Differentiator 2: TSTR Predictive Utility Evaluation Modal */}
      <TstrEvaluationModal
        isOpen={isTstrOpen}
        onClose={() => setIsTstrOpen(false)}
        datasetId={activeDatasetId}
        datasetName={activeDatasetName}
        columns={activeDatasetColumns}
      />

      {/* Differentiator 3: Controlled Diagnostic Regeneration Modal */}
      <RegenerationModal
        isOpen={isRegenOpen}
        onClose={() => setIsRegenOpen(false)}
        datasetId={activeDatasetId}
        datasetName={activeDatasetName}
      />

      {/* Differentiator 4: Semantic Dataset Understanding Modal */}
      <SemanticUnderstandingModal
        isOpen={isSemanticOpen}
        onClose={() => setIsSemanticOpen(false)}
        datasetId={activeDatasetId}
        datasetName={activeDatasetName}
        onApplySyntheticColumn={(col) => handleApplySyntheticColumns([col])}
      />

      {/* Differentiator 5: Synthia Voice & Text Floating AI Guide */}
      <SynthiaAssistant
        datasetId={activeDatasetId}
        datasetName={activeDatasetName}
        onApplySyntheticColumns={handleApplySyntheticColumns}
      />
    </div>
  );
};

