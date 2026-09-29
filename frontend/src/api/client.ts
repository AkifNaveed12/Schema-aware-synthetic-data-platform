import {
  GenerationConfig,
  TabularRow,
  RelationalDataset,
  InvoiceDocument,
  BankStatementDocument,
} from '../types';
import {
  generateTabularData,
  generateRelationalData,
  generateInvoiceDocument,
  generateBankStatementDocument,
} from '../utils/generators';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  source: 'live_backend' | 'client_deterministic_engine';
  executionTimeMs: number;
  metadata?: Record<string, unknown>;
}

// Check Backend Health
export async function checkBackendHealth(): Promise<{ online: boolean; latencyMs: number }> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1500),
    });
    const latencyMs = Math.round(performance.now() - start);
    return { online: res.ok, latencyMs };
  } catch {
    return { online: false, latencyMs: 0 };
  }
}

// 1. Fetch Tabular Preview
export async function fetchTabularPreview(config: GenerationConfig): Promise<ApiResponse<TabularRow[]>> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/generate/tabular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generation: {
          row_count: config.rowCount,
          random_seed: config.randomSeed,
          locale: config.locale,
          null_rate: config.nullRate,
          outlier_rate: config.outlierRate,
        },
        privacy: {
          enabled: config.privacy.masking || config.privacy.hashing || config.privacy.differentialNoise,
          masking: config.privacy.masking,
          hashing: config.privacy.hashing,
          differential_noise: config.privacy.differentialNoise,
          epsilon: config.privacy.epsilon,
        },
        preview: true,
      }),
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const json = await res.json();
      const rawRows = json.data?.rows || json.data || [];
      const normalizedRows: TabularRow[] = rawRows.map((r: any, idx: number) => ({
        id: r.id ?? r.ID ?? (10231 + idx),
        name: r.name ?? r.Name ?? '',
        email: r.email ?? r.Email ?? '',
        originalEmail: r.originalEmail ?? r.email ?? r.Email,
        signupDate: r.signupDate ?? r.signup_date ?? r.Signup ?? '2025-01-01',
        balance: typeof r.balance === 'number' ? r.balance : (typeof r.Balance === 'number' ? r.Balance : 0),
        status: r.status ?? r.Status ?? 'verified',
        syntheticHash: r.syntheticHash ?? r.synthetic_hash ?? '0x' + (10231 + idx).toString(16),
      }));
      return {
        success: true,
        data: normalizedRows,
        source: 'live_backend',
        executionTimeMs: Math.round(performance.now() - start),
      };
    }
  } catch {
    // Fall back smoothly to client generator
  }

  // Deterministic local simulation (< 15ms)
  const rows = generateTabularData(config);
  return {
    success: true,
    data: rows,
    source: 'client_deterministic_engine',
    executionTimeMs: Math.round(performance.now() - start),
  };
}

// 2. Fetch Relational Preview
export async function fetchRelationalPreview(config: GenerationConfig): Promise<ApiResponse<RelationalDataset>> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/generate/relational`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generation: {
          random_seed: config.randomSeed,
          locale: config.locale,
          preview: true,
          tables: {
            customers: { row_count: Math.min(25, config.rowCount) },
            orders: { cardinality: { min: 1, max: 3 } },
            order_items: { cardinality: { min: 1, max: 4 } },
          },
        },
        validation: {
          referential_integrity: true,
          business_rules: true,
        },
      }),
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const json = await res.json();
      const rawData = json.data;
      const customers = rawData?.tables?.customers || rawData?.customers || [];
      const orders = rawData?.tables?.orders || rawData?.orders || [];
      const orderItems = rawData?.tables?.order_items || rawData?.order_items || [];
      const refIntegrity = rawData?.referential_integrity || rawData?.referentialIntegrity || {};
      const relDataset: RelationalDataset = {
        customers,
        orders,
        order_items: orderItems,
        referentialIntegrity: {
          valid: refIntegrity.valid ?? true,
          brokenFkCount: refIntegrity.orphaned_foreign_keys ?? 0,
          reconciliationMismatches: rawData?.reconciliation_audit?.discrepancy_count ?? 0,
          score: 1.0,
        },
      };
      return {
        success: true,
        data: relDataset,
        source: 'live_backend',
        executionTimeMs: Math.round(performance.now() - start),
      };
    }
  } catch {
    // Fall back to client generator
  }

  const relData = generateRelationalData(config);
  return {
    success: true,
    data: relData,
    source: 'client_deterministic_engine',
    executionTimeMs: Math.round(performance.now() - start),
  };
}

// 3. Fetch Invoice Preview
export async function fetchInvoicePreview(config: GenerationConfig): Promise<ApiResponse<InvoiceDocument>> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/generate/documents/invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: 1,
        locale: config.locale,
        currency: config.currency,
        random_seed: config.randomSeed,
        business_type: 'saas',
      }),
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const json = await res.json();
      const rawInv = json.data?.invoices?.[0] || json.data;
      if (rawInv) {
        const invoiceDoc: InvoiceDocument = {
          invoiceNumber: rawInv.invoice_number || rawInv.invoiceNumber || 'INV-10432',
          issueDate: rawInv.date || rawInv.issueDate || '2026-09-15',
          dueDate: rawInv.due_date || rawInv.dueDate || '2026-10-15',
          billedTo: typeof rawInv.billed_to === 'object' && rawInv.billed_to !== null
            ? rawInv.billed_to
            : { name: rawInv.billed_to || 'Northwind Supplies Ltd.', address: rawInv.billed_to_address || '452 Elm Street', taxId: 'US-TAX-8921' },
          from: typeof rawInv.billed_from === 'object' && rawInv.billed_from !== null
            ? rawInv.billed_from
            : { name: rawInv.billed_from || 'Synth Data Co.', address: rawInv.billed_from_address || '100 Synthetic Way, Suite 400', taxId: 'SYNTH-GLOBAL-01' },
          lineItems: (rawInv.line_items || rawInv.lineItems || []).map((it: any, idx: number) => ({
            id: it.id || `item_${idx + 1}`,
            description: it.item || it.description || 'Service License',
            quantity: it.qty ?? it.quantity ?? 1,
            unitPrice: it.price ?? it.unitPrice ?? 0,
            amount: it.amount ?? ((it.qty || 1) * (it.price || 0)),
          })),
          subtotal: rawInv.subtotal || 0,
          taxRate: rawInv.tax_rate ?? rawInv.taxRate ?? 0,
          taxAmount: rawInv.tax ?? rawInv.taxAmount ?? 0,
          total: rawInv.total || 0,
          currency: rawInv.currency || config.currency || 'USD',
          isReconciled: true,
        };
        return {
          success: true,
          data: invoiceDoc,
          source: 'live_backend',
          executionTimeMs: Math.round(performance.now() - start),
        };
      }
    }
  } catch {
    // Fall back
  }

  const invoice = generateInvoiceDocument(config);
  return {
    success: true,
    data: invoice,
    source: 'client_deterministic_engine',
    executionTimeMs: Math.round(performance.now() - start),
  };
}

// 4. Fetch Bank Statement Preview
export async function fetchBankStatementPreview(config: GenerationConfig): Promise<ApiResponse<BankStatementDocument>> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/generate/documents/bank-statement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale: config.locale,
        currency: config.currency,
        random_seed: config.randomSeed,
        query: config.naturalLanguageQuery ? { natural_language: config.naturalLanguageQuery } : undefined,
      }),
      signal: AbortSignal.timeout(2500),
    });

    if (res.ok) {
      const json = await res.json();
      const rawStmt = json.data?.statement || json.data;
      if (rawStmt) {
        const stmtDoc: BankStatementDocument = {
          accountHolder: rawStmt.account_holder || rawStmt.accountHolder || 'Synthetic Account Holder',
          accountNumber: rawStmt.account_number || rawStmt.accountNumber || '****-****-8819',
          statementPeriod: rawStmt.statement_period || rawStmt.statementPeriod || 'Aug 01, 2026 — Sep 15, 2026',
          startingBalance: rawStmt.starting_balance ?? rawStmt.startingBalance ?? 1204.30,
          endingBalance: rawStmt.ending_balance ?? rawStmt.endingBalance ?? 3257.90,
          currency: rawStmt.currency || config.currency || 'USD',
          transactions: (rawStmt.transactions || []).map((tx: any, idx: number) => ({
            id: tx.id || `tx_${idx + 1}`,
            date: tx.date || '',
            description: tx.description || '',
            debit: tx.debit ?? null,
            credit: tx.credit ?? null,
            balance: tx.balance ?? 0,
          })),
          totalDebits: rawStmt.balance_audit?.total_debits ?? rawStmt.totalDebits ?? 0,
          totalCredits: rawStmt.balance_audit?.total_credits ?? rawStmt.totalCredits ?? 0,
          isReconciled: rawStmt.reconciliation_verified ?? rawStmt.isReconciled ?? true,
        };
        return {
          success: true,
          data: stmtDoc,
          source: 'live_backend',
          executionTimeMs: Math.round(performance.now() - start),
        };
      }
    }
  } catch {
    // Fall back
  }

  const statement = generateBankStatementDocument(config);
  return {
    success: true,
    data: statement,
    source: 'client_deterministic_engine',
    executionTimeMs: Math.round(performance.now() - start),
  };
}
