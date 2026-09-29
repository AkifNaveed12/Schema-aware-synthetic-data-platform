import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  generateTabularData,
  generateRelationalData,
  generateInvoiceDocument,
  generateBankStatementDocument,
} from './generators.ts';

const baseConfig = {
  rowCount: 50,
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
};

describe('Synthetic Data Integrity Tests', () => {
  test('Invoice lines strictly equal subtotal and total', () => {
    const inv = generateInvoiceDocument(baseConfig);
    const calculatedSum = inv.lineItems.reduce((acc, it) => acc + it.amount, 0);
    assert.strictEqual(Math.round(calculatedSum * 100) / 100, inv.subtotal);
    assert.strictEqual(inv.total, Math.round((inv.subtotal + inv.taxAmount) * 100) / 100);
    assert.strictEqual(inv.isReconciled, true);
  });

  test('Bank ledger running balance strictly reconciles on every transaction', () => {
    const stmt = generateBankStatementDocument(baseConfig);
    let expected = stmt.startingBalance;
    for (const txn of stmt.transactions) {
      if (txn.debit !== null) expected = Math.round((expected - txn.debit) * 100) / 100;
      if (txn.credit !== null) expected = Math.round((expected + txn.credit) * 100) / 100;
      assert.strictEqual(txn.balance, expected);
    }
    assert.strictEqual(stmt.endingBalance, expected);
    assert.strictEqual(stmt.isReconciled, true);
  });

  test('Relational dataset guarantees 100% referential integrity and order sums match items', () => {
    const rel = generateRelationalData(baseConfig);
    const customerIdSet = new Set(rel.customers.map(c => c.customer_id));
    const orderIdMap = new Map();

    for (const ord of rel.orders) {
      assert.ok(customerIdSet.has(ord.customer_id));
      orderIdMap.set(ord.order_id, { expectedTotal: ord.total_amount, calculatedTotal: 0 });
    }

    for (const item of rel.order_items) {
      assert.ok(orderIdMap.has(item.order_id));
      const entry = orderIdMap.get(item.order_id);
      entry.calculatedTotal += item.amount;
    }

    for (const [, entry] of orderIdMap.entries()) {
      assert.strictEqual(
        Math.round(entry.calculatedTotal * 100) / 100,
        entry.expectedTotal
      );
    }
  });

  test('Determinism: same seed gives identical output; different seed gives different output', () => {
    const seed1 = generateTabularData(baseConfig);
    const seed1Again = generateTabularData(baseConfig);
    const seed2 = generateTabularData({ ...baseConfig, randomSeed: 9999 });

    assert.deepStrictEqual(seed1, seed1Again);
    assert.notDeepStrictEqual(seed1[0].name, seed2[0].name);
  });
});
