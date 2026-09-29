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
      return {
        success: true,
        data: json.data?.rows || json.data || [],
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
      return {
        success: true,
        data: json.data,
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
      return {
        success: true,
        data: json.data?.invoices?.[0] || json.data,
        source: 'live_backend',
        executionTimeMs: Math.round(performance.now() - start),
      };
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
      return {
        success: true,
        data: json.data,
        source: 'live_backend',
        executionTimeMs: Math.round(performance.now() - start),
      };
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
