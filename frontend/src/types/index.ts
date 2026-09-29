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
