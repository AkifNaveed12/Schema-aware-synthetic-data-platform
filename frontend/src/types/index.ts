export type ModalityType = 'tabular' | 'relational' | 'documents';
export type DocumentSubtype = 'invoices' | 'bank_statements';

export interface GenerationConfig {
  rowCount: number;
  randomSeed: number;
  isSeedLocked: boolean;
  locale: string;
  currency: string;
  privacy: {
    masking: boolean;
    hashing: boolean;
    differentialNoise: boolean;
    epsilon: number;
  };
  nullRate: number;
  outlierRate: number;
  naturalLanguageQuery?: string;
}

export interface TabularRow {
  id: number;
  name: string;
  email: string;
  originalEmail?: string;
  signupDate: string;
  balance: number;
  status: 'active' | 'pending' | 'verified';
  syntheticHash: string;
}

export interface CustomerRecord {
  customer_id: number;
  name: string;
  email: string;
  country: string;
  tier: 'free' | 'pro' | 'enterprise';
}

export interface OrderRecord {
  order_id: string;
  customer_id: number;
  order_date: string;
  status: 'completed' | 'processing' | 'shipped';
  total_amount: number;
}

export interface OrderItemRecord {
  item_id: string;
  order_id: string;
  sku: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface RelationalDataset {
  customers: CustomerRecord[];
  orders: OrderRecord[];
  order_items: OrderItemRecord[];
  referentialIntegrity: {
    valid: boolean;
    brokenFkCount: number;
    reconciliationMismatches: number;
    score: number;
  };
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceDocument {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  billedTo: {
    name: string;
    address: string;
    taxId: string;
  };
  from: {
    name: string;
    address: string;
    taxId: string;
  };
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  isReconciled: boolean;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  debit: number | null;
  credit: number | null;
  balance: number;
}

export interface BankStatementDocument {
  accountHolder: string;
  accountNumber: string;
  statementPeriod: string;
  startingBalance: number;
  endingBalance: number;
  currency: string;
  transactions: BankTransaction[];
  totalDebits: number;
  totalCredits: number;
  isReconciled: boolean;
  appliedQuery?: string;
}

export interface ValidationCheck {
  name: string;
  status: 'passed' | 'warning' | 'failed';
  severity: 'critical' | 'informational';
  description: string;
  errors: number;
}

export interface QualityMetrics {
  statisticalFidelity: number;
  structuralIntegrity: number;
  privacyScore: number;
  businessRuleCompliance: number;
}

export interface EvaluationDimension {
  status: 'passed' | 'warning' | 'failed' | 'not_run';
  score: number;
  summary: string;
  metrics: Record<string, any>;
}

export interface EvaluationData {
  overall_status: 'passed' | 'warning' | 'failed';
  overall_score: number;
  statistical_fidelity: EvaluationDimension;
  structural_fidelity: EvaluationDimension;
  privacy_compliance: EvaluationDimension;
  business_rules: EvaluationDimension;
}

export interface ExportData {
  filename: string;
  format: string;
  content_type: string;
  download_url?: string;
  raw_content?: string;
  size_bytes: number;
}

// --- Real Pipeline & Ingestion Types (Part I & II) ---

export interface QualityFinding {
  column?: string;
  issue_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  rate: number;
  description: string;
  examples?: any[];
}

export interface CleaningAction {
  action_type: string;
  column?: string;
  rows_affected: number;
  before_value?: any;
  after_value?: any;
  description: string;
}

export interface InferredColumnProfile {
  name: string;
  original_name?: string;
  data_type: string;
  semantic_type?: string;
  is_primary_key: boolean;
  is_foreign_key?: boolean;
  null_rate: number;
  unique_count?: number;
  total_count?: number;
  min_value?: any;
  max_value?: any;
  mean_value?: number;
  sample_values?: any[];
  outlier_rate?: number;
  ai_confidence?: number;
}

export interface SourceFingerprint {
  source_fingerprint: string;
  input_filename?: string;
  input_modality: string;
  row_count: number;
  column_count: number;
  schema_hash?: string;
}

export interface DatasetProfile {
  profile_id: string;
  dataset_id?: string;
  name: string;
  modality: 'tabular' | 'relational' | 'document';
  tables: Array<{
    name: string;
    row_count: number;
    primary_key: string;
    columns: InferredColumnProfile[];
  }>;
  source_fingerprint?: SourceFingerprint;
  quality_findings: QualityFinding[];
  cleaning_actions: CleaningAction[];
  generation_defaults?: {
    row_count: number;
    seed: number;
    model_strategy: string;
  };
}

export interface IngestedDatasetResponse {
  dataset_id: string;
  filename: string;
  modality: string;
  source_fingerprint: string;
  row_count: number;
  column_count: number;
  columns: string[];
  quality_findings: number;
  profile: DatasetProfile;
}

export interface GenerationJobStatus {
  job_id: string;
  dataset_id: string;
  state: 'queued' | 'preprocessing' | 'training' | 'generating' | 'validating' | 'evaluating' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  message: string;
  error?: string;
  logs: string[];
  created_at: number;
  completed_at?: number;
  has_result: boolean;
  result?: {
    job_id: string;
    dataset_id: string;
    selected_model: string;
    rows_generated: number;
    columns: string[];
    rows: Record<string, any>[];
    total_rows: number;
    seed: number;
    validation: any;
    evaluation: {
      selected_model: string;
      overall_score: number;
      candidates: Array<{
        name: string;
        overall_score: number;
        distribution_fidelity: number;
        schema_fidelity: number;
        novelty_rate: number;
        privacy_score: number;
        fit_time_ms: number;
        sample_time_ms: number;
        selection_reason: string;
      }>;
    };
  };
}


