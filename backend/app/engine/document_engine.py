import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
import numpy as np
from faker import Faker

from backend.app.models.schemas import (
    InvoiceDocument,
    LineItem,
    InvoiceGenerateRequest,
    InvoiceGenerateData,
    BankStatementDocument,
    StatementTransaction,
    BankStatementGenerateRequest,
    BankStatementGenerateData,
)

INVOICE_CATALOG = [
    ("API access — Pro tier", 1100.00),
    ("Onboarding support", 140.00),
    ("Dedicated cloud instance", 450.00),
    ("Priority SLA support", 250.00),
    ("Security audit token pack", 320.00),
    ("Data transformation add-on", 180.00),
    ("Custom synthetic model training", 750.00),
    ("Enterprise seats (x5)", 500.00)
]

MERCHANTS = [
    ("Greenleaf Market", 42.10, "debit"),
    ("Payroll deposit", 2150.00, "credit"),
    ("Riverside Utilities", 96.40, "debit"),
    ("Metro Transit Pass", 55.00, "debit"),
    ("Apex Cloud Services", 125.00, "debit"),
    ("Highland Coffee Roasters", 8.75, "debit"),
    ("Dividend payout", 145.20, "credit"),
    ("Apex Fitness Club", 60.00, "debit"),
    ("Bookstore & Co.", 34.50, "debit"),
    ("Consulting invoice payment", 850.00, "credit"),
    ("Downtown Pharmacy", 24.15, "debit"),
    ("Cornerstone Grocers", 88.30, "debit"),
    ("Mobile telecom provider", 75.00, "debit"),
    ("Refund from Online Store", 39.99, "credit"),
    ("City Parking Garage", 18.00, "debit")
]

class DocumentEngine:
    def __init__(self):
        pass

    def generate_invoices(self, request: InvoiceGenerateRequest) -> InvoiceGenerateData:
        seed = request.random_seed if request.random_seed is not None else 10432
        rng = np.random.RandomState(seed)
        fake = Faker(request.locale)
        fake.seed_instance(seed)

        invoices: List[InvoiceDocument] = []
        inv_base = seed

        for i in range(request.count):
            inv_num = f"INV-{inv_base + i}"
            base_date = datetime(2025, 9, 15) + timedelta(days=int(rng.randint(0, 60)))
            due_date = base_date + timedelta(days=30)

            # Choose line items
            num_items = rng.randint(request.min_items, max(request.min_items + 1, request.max_items + 1))
            chosen_indices = rng.choice(len(INVOICE_CATALOG), size=num_items, replace=False)
            
            line_items: List[LineItem] = []
            subtotal = 0.0

            for idx in chosen_indices:
                item_name, item_price = INVOICE_CATALOG[idx]
                qty = int(rng.randint(1, 3))
                amount = round(qty * item_price, 2)
                line_items.append(LineItem(
                    item=item_name,
                    qty=qty,
                    price=item_price,
                    amount=amount
                ))
                subtotal += amount

            subtotal = round(subtotal, 2)
            tax = round(subtotal * request.tax_rate, 2)
            total = round(subtotal + tax, 2)

            invoices.append(InvoiceDocument(
                invoice_number=inv_num,
                date=base_date.strftime("%Y-%m-%d"),
                due_date=due_date.strftime("%Y-%m-%d"),
                billed_to=fake.company(),
                billed_to_address=fake.address().replace("\n", ", "),
                billed_from="Synth Data Co.",
                billed_from_address="100 Synthetic Way, Suite 400",
                line_items=line_items,
                subtotal=subtotal,
                tax_rate=request.tax_rate,
                tax=tax,
                total=total,
                currency=request.currency
            ))

        # Audit reconciliation across all generated invoices
        discrepancies = 0
        for inv in invoices:
            computed_sub = round(sum(it.amount for it in inv.line_items), 2)
            if abs(computed_sub - inv.subtotal) > 0.001 or abs((inv.subtotal + inv.tax) - inv.total) > 0.001:
                discrepancies += 1

        return InvoiceGenerateData(
            invoices=invoices,
            total_generated=len(invoices),
            seed_applied=seed,
            reconciliation_audit={
                "status": "passed" if discrepancies == 0 else "failed",
                "discrepancies": discrepancies,
                "rule": "invoice.total == sum(item.amount) + tax",
                "reconciliation_percentage": 100.0 if discrepancies == 0 else 0.0
            }
        )

    def generate_bank_statement(self, request: BankStatementGenerateRequest) -> BankStatementGenerateData:
        seed = request.random_seed if request.random_seed is not None else 777
        rng = np.random.RandomState(seed)
        fake = Faker(request.locale)
        fake.seed_instance(seed)

        start_bal = request.starting_balance
        curr_bal = start_bal
        num_txns = request.transaction_count

        base_date = datetime(2025, 8, 1)
        transactions: List[StatementTransaction] = []

        # Check for query filters
        min_balance_threshold = None
        if request.query_filter and "balance over" in request.query_filter.lower():
            # parse threshold if specified
            import re
            m = re.search(r"balance over \$?(\d+)", request.query_filter.lower())
            if m:
                min_balance_threshold = float(m.group(1))

        current_date = base_date
        for i in range(num_txns):
            current_date += timedelta(days=int(rng.randint(1, 3)))
            merchant, typical_amount, txn_type = MERCHANTS[rng.randint(0, len(MERCHANTS))]

            # Add variance to amount
            jitter = float(rng.uniform(0.9, 1.25))
            amount = round(typical_amount * jitter, 2)

            debit = None
            credit = None

            if txn_type == "credit":
                credit = amount
                curr_bal = round(curr_bal + credit, 2)
            else:
                # If balance is dropping below threshold or zero, prefer deposit
                if (min_balance_threshold and (curr_bal - amount) < min_balance_threshold) or (curr_bal - amount) < 100:
                    credit = round(float(rng.uniform(1500, 2500)), 2)
                    merchant = "Payroll deposit"
                    curr_bal = round(curr_bal + credit, 2)
                else:
                    debit = amount
                    curr_bal = round(curr_bal - debit, 2)

            transactions.append(StatementTransaction(
                date=current_date.strftime("%m-%d"),
                description=merchant,
                debit=debit,
                credit=credit,
                balance=curr_bal
            ))

        # Ledger Balance Audit
        discrepancies = 0
        audit_balance = start_bal
        for t in transactions:
            c = t.credit or 0.0
            d = t.debit or 0.0
            audit_balance = round(audit_balance + c - d, 2)
            if abs(audit_balance - t.balance) > 0.001:
                discrepancies += 1

        doc = BankStatementDocument(
            account_holder=request.account_holder or "Sofia Ivanova",
            account_number=f"****-****-{rng.randint(1000, 9999)}",
            starting_balance=start_bal,
            ending_balance=curr_bal,
            currency=request.currency,
            statement_period=f"{base_date.strftime('%b %d, %Y')} - {current_date.strftime('%b %d, %Y')}",
            transactions=transactions,
            reconciliation_verified=(discrepancies == 0)
        )

        return BankStatementGenerateData(
            statement=doc,
            balance_audit={
                "status": "passed" if discrepancies == 0 else "failed",
                "discrepancies": discrepancies,
                "rule": "balance[t] == balance[t-1] + credit[t] - debit[t]",
                "starting_balance": start_bal,
                "ending_balance": curr_bal,
                "reconciliation_percentage": 100.0 if discrepancies == 0 else 0.0
            },
            seed_applied=seed
        )

document_engine = DocumentEngine()
