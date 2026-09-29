import time
from typing import Any, Dict, List, Optional, Set
import numpy as np
from faker import Faker

from backend.app.models.schemas import RelationalGenerateRequest, RelationalGenerateData

class RelationalEngine:
    def __init__(self):
        pass

    def generate(self, request: RelationalGenerateRequest) -> RelationalGenerateData:
        start_time = time.perf_counter()
        seed = request.random_seed if request.random_seed is not None else 42
        rng = np.random.RandomState(seed)
        fake = Faker(request.locale)
        fake.seed_instance(seed)

        row_counts = request.table_row_counts or {}
        num_customers = row_counts.get("customers", 15)
        min_orders_per_cust = 1
        max_orders_per_cust = 4
        min_items_per_order = 1
        max_items_per_order = 4

        # 1. Generate Customers (Root Parent)
        customers: List[Dict[str, Any]] = []
        for i in range(num_customers):
            c_id = 1000 + i + 1
            customers.append({
                "customer_id": c_id,
                "name": fake.name(),
                "email": fake.email()
            })

        # 2. Generate Orders (Child of Customers)
        orders: List[Dict[str, Any]] = []
        order_counter = 5001
        start_ts = 1704067200  # 2024-01-01
        end_ts = 1772496000    # 2026-03-01
        from datetime import datetime

        for cust in customers:
            num_orders = rng.randint(min_orders_per_cust, max_orders_per_cust + 1)
            for _ in range(num_orders):
                o_id = order_counter
                order_counter += 1
                rand_ts = rng.randint(start_ts, end_ts)
                orders.append({
                    "order_id": o_id,
                    "customer_id": cust["customer_id"],
                    "order_date": datetime.fromtimestamp(rand_ts).strftime("%Y-%m-%d"),
                    "total_amount": 0.0  # will reconcile after items
                })

        # 3. Generate Order Items (Child of Orders)
        order_items: List[Dict[str, Any]] = []
        item_counter = 90001
        sku_prefixes = ["SKU-PRO", "SKU-SFT", "SKU-HW", "SKU-SRV", "SKU-ENT"]
        prices = [29.99, 49.00, 75.50, 110.00, 140.00, 250.00, 1100.00]

        order_totals: Dict[int, float] = {o["order_id"]: 0.0 for o in orders}

        for order in orders:
            num_items = rng.randint(min_items_per_order, max_items_per_order + 1)
            for _ in range(num_items):
                i_id = item_counter
                item_counter += 1
                qty = int(rng.randint(1, 5))
                unit_price = float(rng.choice(prices))
                amount = round(qty * unit_price, 2)
                order_items.append({
                    "item_id": i_id,
                    "order_id": order["order_id"],
                    "sku": f"{rng.choice(sku_prefixes)}-{rng.randint(100, 999)}",
                    "qty": qty,
                    "unit_price": unit_price,
                    "amount": amount
                })
                order_totals[order["order_id"]] += amount

        # 4. Cross-table Arithmetic Reconciliation: update Order totals
        if request.reconcile_totals:
            for order in orders:
                order["total_amount"] = round(order_totals[order["order_id"]], 2)

        # 5. Referential Integrity Check
        cust_ids = set(c["customer_id"] for c in customers)
        order_ids = set(o["order_id"] for o in orders)

        orphaned_orders = [o["order_id"] for o in orders if o["customer_id"] not in cust_ids]
        orphaned_items = [it["item_id"] for it in order_items if it["order_id"] not in order_ids]

        # 6. Audit cross-table consistency
        discrepancies = 0
        for order in orders:
            expected = round(sum(it["amount"] for it in order_items if it["order_id"] == order["order_id"]), 2)
            if abs(expected - order["total_amount"]) > 0.001:
                discrepancies += 1

        exec_time = round((time.perf_counter() - start_time) * 1000, 2)
        tables = {
            "customers": customers,
            "orders": orders,
            "order_items": order_items
        }

        return RelationalGenerateData(
            tables=tables,
            table_counts={k: len(v) for k, v in tables.items()},
            seed_applied=seed,
            execution_time_ms=exec_time,
            referential_integrity={
                "status": "passed" if not orphaned_orders and not orphaned_items else "failed",
                "orphaned_foreign_keys": len(orphaned_orders) + len(orphaned_items),
                "parent_tables_verified": ["customers", "orders"],
                "integrity_percentage": 100.0 if not orphaned_orders and not orphaned_items else 0.0
            },
            reconciliation_audit={
                "status": "passed" if discrepancies == 0 else "failed",
                "discrepancies_count": discrepancies,
                "rule": "Order.total_amount == SUM(OrderItem.qty * OrderItem.unit_price)",
                "reconciliation_percentage": 100.0 if discrepancies == 0 else 0.0
            }
        )

relational_engine = RelationalEngine()
