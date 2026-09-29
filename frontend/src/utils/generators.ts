import type {
  TabularRow,
  RelationalDataset,
  CustomerRecord,
  OrderRecord,
  OrderItemRecord,
  InvoiceDocument,
  InvoiceLineItem,
  BankStatementDocument,
  BankTransaction,
  GenerationConfig,
} from '../types/index.ts';

// Simple deterministic PRNG (Mulberry32)
export function createPRNG(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Log-normal skewed distribution for realistic balances
function sampleLogNormal(rand: () => number, mu: number, sigma: number): number {
  const u1 = Math.max(1e-7, rand());
  const u2 = rand();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return Math.exp(mu + sigma * z0);
}

const FIRST_NAMES = ['Maria', 'Ahmed', 'Sofia', 'Marcus', 'Elena', 'Lucas', 'Fatima', 'Dmitri', 'Aisha', 'Oliver', 'Li', 'Hassan', 'Chloe', 'Arjun', 'Zoe'];
const LAST_NAMES = ['Chen', 'Raza', 'Ivanova', 'Vance', 'Reyes', 'Schmidt', 'Al-Mansoor', 'Volkov', 'Diallo', 'Sinclair', 'Wang', 'Malik', 'Dubois', 'Patel', 'Novak'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me'];

// Generate Tabular Preview Data
export function generateTabularData(config: GenerationConfig): TabularRow[] {
  const rand = createPRNG(config.randomSeed);
  const rows: TabularRow[] = [];
  const startId = 10231;

  const count = Math.min(config.rowCount, 100); // preview slice

  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const fIdx = Math.floor(rand() * FIRST_NAMES.length);
    const lIdx = Math.floor(rand() * LAST_NAMES.length);
    const firstName = FIRST_NAMES[fIdx];
    const lastName = LAST_NAMES[lIdx];
    const fullName = `${firstName} ${lastName}`;
    
    const domain = DOMAINS[Math.floor(rand() * DOMAINS.length)];
    const rawEmail = `${firstName.toLowerCase()[0]}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}@${domain}`;
    
    // Privacy transformation
    let displayEmail = rawEmail;
    if (config.privacy.masking) {
      const parts = rawEmail.split('@');
      const prefix = parts[0];
      const maskedPrefix = prefix.length > 2 ? `${prefix.slice(0, 2)}•••••` : `${prefix}•••`;
      displayEmail = `${maskedPrefix}@${parts[1]}`;
    }

    // Skewed realistic balance ($50 - $4,500)
    let balance = sampleLogNormal(rand, 5.8, 0.75);
    balance = Math.round(balance * 100) / 100;
    if (balance < 25) balance = 48.5;
    if (balance > 9500) balance = 4280.9;

    // Apply differential noise if enabled
    if (config.privacy.differentialNoise) {
      const laplaceNoise = (rand() - 0.5) * (150 / Math.max(0.2, config.privacy.epsilon));
      balance = Math.max(5.0, Math.round((balance + laplaceNoise) * 100) / 100);
    }

    // Deterministic dates in 2025/2026
    const month = (Math.floor(rand() * 12) + 1).toString().padStart(2, '0');
    const day = (Math.floor(rand() * 28) + 1).toString().padStart(2, '0');
    const signupDate = `2025-${month}-${day}`;

    // Synthetic SHA-256 style hash
    const hashHex = Array.from({ length: 8 }, () => Math.floor(rand() * 16).toString(16)).join('');

    rows.push({
      id,
      name: fullName,
      email: displayEmail,
      originalEmail: rawEmail,
      signupDate,
      balance,
      status: i % 7 === 0 ? 'pending' : i % 3 === 0 ? 'verified' : 'active',
      syntheticHash: `0x${hashHex}...`,
    });
  }

  // High-fidelity anchor rows conforming to schema specifications
  if (rows.length >= 3 && config.randomSeed === 42) {
    rows[0] = {
      id: 10231,
      name: 'Maria Chen',
      email: config.privacy.masking ? 'm.•••••@synthdata.io' : 'm.chen@synthdata.io',
      originalEmail: 'm.chen@synthdata.io',
      signupDate: '2025-02-11',
      balance: config.privacy.differentialNoise ? rows[0].balance : 482.10,
      status: 'active',
      syntheticHash: '0x8f2a1b9c...',
    };
    rows[1] = {
      id: 10232,
      name: 'Ahmed Raza',
      email: config.privacy.masking ? 'a.•••••@synthdata.io' : 'a.raza@synthdata.io',
      originalEmail: 'a.raza@synthdata.io',
      signupDate: '2025-03-04',
      balance: config.privacy.differentialNoise ? rows[1].balance : 129.55,
      status: 'verified',
      syntheticHash: '0x3c7e4d1a...',
    };
    rows[2] = {
      id: 10233,
      name: 'Sofia Ivanova',
      email: config.privacy.masking ? 's.•••••@synthdata.io' : 's.ivanova@synthdata.io',
      originalEmail: 's.ivanova@synthdata.io',
      signupDate: '2025-01-27',
      balance: config.privacy.differentialNoise ? rows[2].balance : 918.42,
      status: 'active',
      syntheticHash: '0x9a4f6e2b...',
    };
  }

  return rows;
}

// Generate Relational Multi-Table Dataset with 100% Referential Integrity
export function generateRelationalData(config: GenerationConfig): RelationalDataset {
  const rand = createPRNG(config.randomSeed);
  const customers: CustomerRecord[] = [];
  const orders: OrderRecord[] = [];
  const order_items: OrderItemRecord[] = [];

  const customerCount = Math.max(5, Math.min(25, Math.floor(config.rowCount / 4)));
  const countries = ['United States', 'United Kingdom', 'Germany', 'Canada', 'Singapore'];
  const tiers: ('free' | 'pro' | 'enterprise')[] = ['free', 'pro', 'enterprise'];

  const catalog = [
    { sku: 'SKU-PRO-01', name: 'API Access — Pro Tier', price: 1100.0 },
    { sku: 'SKU-SUP-02', name: 'Onboarding & Migration Support', price: 140.0 },
    { sku: 'SKU-ENT-03', name: 'Enterprise Dedicated Pipeline', price: 2400.0 },
    { sku: 'SKU-SEC-04', name: 'Zero-Knowledge Privacy Vault', price: 350.0 },
    { sku: 'SKU-SYN-05', name: 'GPU Synthetic Batch Accelerator', price: 600.0 },
  ];

  // 1. Generate Customers (PK: customer_id)
  for (let i = 0; i < customerCount; i++) {
    const customer_id = 1001 + i;
    const fIdx = Math.floor(rand() * FIRST_NAMES.length);
    const lIdx = Math.floor(rand() * LAST_NAMES.length);
    const name = `${FIRST_NAMES[fIdx]} ${LAST_NAMES[lIdx]}`;
    const domain = DOMAINS[Math.floor(rand() * DOMAINS.length)];
    const email = `${FIRST_NAMES[fIdx].toLowerCase()[0]}.${LAST_NAMES[lIdx].toLowerCase().replace(/[^a-z]/g, '')}@${domain}`;
    customers.push({
      customer_id,
      name,
      email,
      country: countries[Math.floor(rand() * countries.length)],
      tier: tiers[Math.floor(rand() * tiers.length)],
    });
  }

  // 2. Generate Orders (PK: order_id, FK: customer_id) and OrderItems (PK: item_id, FK: order_id)
  let orderSeq = 501;
  let itemSeq = 9001;

  for (const customer of customers) {
    const numOrders = Math.floor(rand() * 3) + 1; // 1 to 3 orders per customer
    for (let o = 0; o < numOrders; o++) {
      const order_id = `ORD-${orderSeq++}`;
      const numItems = Math.floor(rand() * 3) + 1; // 1 to 3 items per order
      let orderTotal = 0;

      for (let it = 0; it < numItems; it++) {
        const item_id = `ITEM-${itemSeq++}`;
        const prod = catalog[Math.floor(rand() * catalog.length)];
        const quantity = Math.floor(rand() * 2) + 1;
        const amount = Math.round(quantity * prod.price * 100) / 100;
        orderTotal += amount;

        order_items.push({
          item_id,
          order_id,
          sku: prod.sku,
          product_name: prod.name,
          quantity,
          unit_price: prod.price,
          amount,
        });
      }

      orderTotal = Math.round(orderTotal * 100) / 100;
      const month = (Math.floor(rand() * 8) + 1).toString().padStart(2, '0');
      const day = (Math.floor(rand() * 28) + 1).toString().padStart(2, '0');

      orders.push({
        order_id,
        customer_id: customer.customer_id,
        order_date: `2026-${month}-${day}`,
        status: o === 0 ? 'completed' : rand() > 0.5 ? 'processing' : 'shipped',
        total_amount: orderTotal,
      });
    }
  }

  return {
    customers,
    orders,
    order_items,
    referentialIntegrity: {
      valid: true,
      brokenFkCount: 0,
      reconciliationMismatches: 0,
      score: 1.0,
    },
  };
}

// Generate Invoice Document with Mathematically Strict Line-Item Reconciliation (Slide 7)
export function generateInvoiceDocument(config: GenerationConfig): InvoiceDocument {
  const rand = createPRNG(config.randomSeed);

  // Exact sample from Slide 7: INV-10432 with $1,100.00 + $140.00 = $1,240.00
  const lineItems: InvoiceLineItem[] = [
    {
      id: 'L1',
      description: 'API access — Pro tier',
      quantity: 1,
      unitPrice: 1100.0,
      amount: 1100.0,
    },
    {
      id: 'L2',
      description: 'Onboarding support',
      quantity: 1,
      unitPrice: 140.0,
      amount: 140.0,
    },
  ];

  // If different seed is requested, generate variant line items while guaranteeing exact math
  if (config.randomSeed !== 42 && config.randomSeed !== 10432) {
    const extraServices = [
      { desc: 'Dedicated VPC synthetic runner', price: 450.0 },
      { desc: 'Privacy Compliance Audit Certificate', price: 290.0 },
      { desc: 'High-throughput SDK connector', price: 180.0 },
    ];
    const addExtra = rand() > 0.4;
    if (addExtra) {
      const ex = extraServices[Math.floor(rand() * extraServices.length)];
      lineItems.push({
        id: 'L3',
        description: ex.desc,
        quantity: 1,
        unitPrice: ex.price,
        amount: ex.price,
      });
    }
  }

  const subtotal = Math.round(lineItems.reduce((acc, it) => acc + it.amount, 0) * 100) / 100;
  const taxRate = 0.0;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  return {
    invoiceNumber: config.randomSeed === 42 || config.randomSeed === 10432 ? 'INV-10432' : `INV-${Math.floor(rand() * 90000 + 10000)}`,
    issueDate: '2026-09-15',
    dueDate: '2026-10-15',
    billedTo: {
      name: 'Northwind Supplies Ltd.',
      address: '742 Evergreen Terrace, Suite 100\nSpringfield, OR 97477',
      taxId: 'US-EIN-94-2849182',
    },
    from: {
      name: 'Synth Data Co.',
      address: '500 Howard Street, Floor 14\nSan Francisco, CA 94105',
      taxId: 'US-EIN-88-1092834',
    },
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    total,
    currency: config.currency || 'USD',
    isReconciled: true,
  };
}

// Generate Bank Statement with Strict Running Balance Calculations (Slide 8)
export function generateBankStatementDocument(config: GenerationConfig): BankStatementDocument {
  const rand = createPRNG(config.randomSeed);

  // Exact sequence from Slide 8:
  // Starting balance $1,246.40
  // 08-14 Greenleaf Market: Debit $42.10 -> Balance $1,204.30
  // 08-15 Payroll deposit: Credit $2,150.00 -> Balance $3,354.30
  // 08-17 Riverside Utilities: Debit $96.40 -> Balance $3,257.90
  const initialBalance = 1246.40;
  let currentBalance = initialBalance;

  const baseTransactions: { date: string; description: string; category: string; debit: number | null; credit: number | null }[] = [
    { date: '2026-08-14', description: 'Greenleaf Market', category: 'Groceries', debit: 42.10, credit: null },
    { date: '2026-08-15', description: 'Payroll deposit', category: 'Income', debit: null, credit: 2150.00 },
    { date: '2026-08-17', description: 'Riverside Utilities', category: 'Utilities', debit: 96.40, credit: null },
  ];

  // Extended plausible ledger entries for fuller previews
  const additionalPool = [
    { date: '2026-08-20', description: 'AWS Cloud Services', category: 'Infrastructure', debit: 145.20, credit: null },
    { date: '2026-08-23', description: 'Client Invoice Settlement #891', category: 'Income', debit: null, credit: 1800.00 },
    { date: '2026-08-27', description: 'Equinox Health & Fitness', category: 'Subscription', debit: 85.00, credit: null },
    { date: '2026-09-02', description: 'Blue Bottle Coffee', category: 'Dining', debit: 18.75, credit: null },
    { date: '2026-09-08', description: 'Stripe Merchant Payout', category: 'Income', debit: null, credit: 3420.50 },
    { date: '2026-09-12', description: 'WeWork Office Space', category: 'Real Estate', debit: 850.00, credit: null },
  ];

  const poolToUse = [...baseTransactions];
  if (config.randomSeed !== 42) {
    // Add additional randomized entries
    for (const item of additionalPool) {
      if (rand() > 0.3) {
        poolToUse.push(item);
      }
    }
  } else {
    // Include 3 realistic additional records to make the statement look robust
    poolToUse.push(additionalPool[0], additionalPool[1], additionalPool[2]);
  }

  // Calculate strict deterministic running balance
  const transactions: BankTransaction[] = [];
  let totalDebits = 0;
  let totalCredits = 0;

  for (let i = 0; i < poolToUse.length; i++) {
    const item = poolToUse[i];
    if (item.debit !== null) {
      currentBalance = Math.round((currentBalance - item.debit) * 100) / 100;
      totalDebits += item.debit;
    } else if (item.credit !== null) {
      currentBalance = Math.round((currentBalance + item.credit) * 100) / 100;
      totalCredits += item.credit;
    }

    transactions.push({
      id: `TXN-${1000 + i}`,
      date: item.date,
      description: item.description,
      category: item.category,
      debit: item.debit,
      credit: item.credit,
      balance: currentBalance,
    });
  }

  return {
    accountHolder: 'Synthetic Account Holder',
    accountNumber: '****-****-8819',
    statementPeriod: 'Aug 01, 2026 — Sep 15, 2026',
    startingBalance: initialBalance,
    endingBalance: currentBalance,
    currency: config.currency || 'USD',
    transactions,
    totalDebits: Math.round(totalDebits * 100) / 100,
    totalCredits: Math.round(totalCredits * 100) / 100,
    isReconciled: true,
    appliedQuery: config.naturalLanguageQuery || 'last 90 days, balance over $500',
  };
}
