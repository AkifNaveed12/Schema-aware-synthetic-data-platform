"""
backend/app/engine/relational_engine.py

Relational synthetic-data generator.

Two modes:
1. GENERIC (DataProfile-driven): reads table schemas and FK relationships
   from a supplied DataProfile. Generates any arbitrary multi-table schema.
   No hardcoded table/column names.

2. PRESET fallback (legacy demo): the original customers→orders→order_items
   ecommerce schema, used when schema_preset == 'ecommerce_default' and
   no profile is supplied. Kept intact as a demo fixture.
"""
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

import numpy as np
from faker import Faker

from backend.app.models.data_profile import (
    ColumnProfile,
    DataProfile,
    DistributionConfig,
    RelationshipProfile,
    TableProfile,
)
from backend.app.models.schemas import RelationalGenerateRequest, RelationalGenerateData


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_all_relationships(
    tables: List[TableProfile],
    relationships: Optional[List[RelationshipProfile]],
) -> List[RelationshipProfile]:
    rels = list(relationships or [])
    for tp in tables:
        if tp.foreign_keys:
            for child_key, target in tp.foreign_keys.items():
                if "." in target:
                    parent_tbl, parent_key = target.split(".", 1)
                    if not any(r.child_table == tp.name and r.child_key == child_key for r in rels):
                        rels.append(RelationshipProfile(
                            parent_table=parent_tbl,
                            parent_key=parent_key,
                            child_table=tp.name,
                            child_key=child_key,
                            min_children=1,
                            max_children=2,
                        ))
    return rels


def _topological_order(
    tables: List[TableProfile],
    relationships: List[RelationshipProfile],
) -> List[str]:
    """
    Kahn's algorithm: returns table names ordered so parents come before children.
    Falls back to original order if no relationships are supplied.
    """
    effective_rels = _extract_all_relationships(tables, relationships)
    if not effective_rels:
        return [t.name for t in tables]

    children: Dict[str, Set[str]] = {t.name: set() for t in tables}
    parents: Dict[str, Set[str]] = {t.name: set() for t in tables}
    for rel in effective_rels:
        if rel.parent_table in children and rel.child_table in parents:
            children[rel.parent_table].add(rel.child_table)
            parents[rel.child_table].add(rel.parent_table)

    order: List[str] = []
    no_parent = [t.name for t in tables if not parents[t.name]]
    queue = no_parent[:]
    while queue:
        node = queue.pop(0)
        order.append(node)
        for child in children[node]:
            parents[child].discard(node)
            if not parents[child]:
                queue.append(child)

    # Append any remaining (handles cycles gracefully)
    for t in tables:
        if t.name not in order:
            order.append(t.name)
    return order


def _generate_value(
    col: ColumnProfile,
    rng: np.random.RandomState,
    fake: Faker,
) -> Any:
    """Generate a single synthetic value for a column."""
    dtype = col.data_type.lower()
    semantic = (col.semantic_type or "").lower()
    dist = col.distribution

    if semantic == "email":
        return fake.email()
    if semantic in ("full_name", "name", "first_name", "last_name"):
        return fake.name()
    if semantic == "company":
        return fake.company()
    if semantic == "city":
        return fake.city()
    if semantic == "country":
        return fake.country()
    if semantic == "address":
        return fake.street_address()
    if semantic == "phone":
        return fake.phone_number()
    if semantic == "url":
        return fake.url()
    if semantic == "postal_code":
        return fake.postcode()

    if dtype in ("integer", "float", "currency"):
        if dist and dist.type == "normal":
            mean = dist.mean or 100.0
            std = dist.std_dev or 20.0
            val = float(rng.normal(mean, max(std, 0.001)))
        elif dist and dist.type == "log_normal":
            mean = dist.mean or 500.0
            std = dist.std_dev or 100.0
            sigma = float(np.sqrt(np.log(1 + (std / max(mean, 1)) ** 2)))
            mu = float(np.log(max(mean, 1)) - 0.5 * sigma ** 2)
            val = float(rng.lognormal(mu, sigma))
        elif dist and dist.type == "uniform":
            low = dist.min_value if dist.min_value is not None else 1.0
            high = dist.max_value if dist.max_value is not None else 1000.0
            val = float(rng.uniform(low, high))
        else:
            mn = dist.min_value if dist and dist.min_value is not None else 1.0
            mx = dist.max_value if dist and dist.max_value is not None else 1000.0
            val = float(rng.uniform(mn, mx))
        if dist and dist.min_value is not None:
            val = max(val, dist.min_value)
        if dist and dist.max_value is not None:
            val = min(val, dist.max_value)
        if dtype == "integer":
            return int(round(val))
        return round(val, 2)

    if dtype == "date":
        start_ts = 1704067200   # 2024-01-01
        end_ts = 1772496000     # 2026-03-01
        ts = rng.randint(start_ts, end_ts)
        return datetime.fromtimestamp(int(ts)).strftime("%Y-%m-%d")

    if dtype == "boolean":
        return bool(rng.randint(0, 2))

    if dist and dist.type == "categorical" and dist.categories:
        cats = dist.categories
        weights = dist.weights
        if weights and len(weights) == len(cats):
            total = sum(weights)
            p = [w / total for w in weights]
            p[-1] = 1.0 - sum(p[:-1])
            return str(rng.choice(cats, p=p))
        return str(rng.choice(cats))

    # Default: generic word/string
    return fake.word().capitalize()


# ── Generic DataProfile-driven generation ─────────────────────────────────────

def _generate_from_profile(
    request: RelationalGenerateRequest,
    profile: DataProfile,
    rng: np.random.RandomState,
    fake: Faker,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Generate all tables defined in the DataProfile in topological order
    (parents first, then children with valid FK references).
    """
    tables_by_name: Dict[str, TableProfile] = {t.name: t for t in profile.tables}
    relationships = _extract_all_relationships(profile.tables, profile.relationships)

    order = _topological_order(profile.tables, relationships)

    # Override row counts from request if supplied
    row_counts = request.table_row_counts or {}

    # Build FK lookup: child_table → [(parent_table, parent_key, child_key, rel)]
    fk_map: Dict[str, List[RelationshipProfile]] = {t.name: [] for t in profile.tables}
    for rel in relationships:
        if rel.child_table in fk_map:
            fk_map[rel.child_table].append(rel)

    result: Dict[str, List[Dict[str, Any]]] = {}
    pk_pools: Dict[str, List[Any]] = {}  # table_name → list of generated PK values

    for t_name in order:
        tp = tables_by_name.get(t_name)
        if tp is None:
            continue

        t_row_count = row_counts.get(t_name, tp.row_count)

        # Determine if this table's rows are driven by FK cardinality
        parent_rels = fk_map.get(t_name, [])
        rows: List[Dict[str, Any]] = []

        if parent_rels:
            # Generate child rows: for each parent row, emit N children
            first_rel = parent_rels[0]
            parent_pks = pk_pools.get(first_rel.parent_table, [])
            for parent_pk in parent_pks:
                num_children = int(rng.randint(first_rel.min_children, first_rel.max_children + 1))
                for _ in range(num_children):
                    row: Dict[str, Any] = {}
                    for col in tp.columns:
                        if col.is_primary_key or col.name == tp.primary_key:
                            row[col.name] = len(rows) + 1
                        elif col.name == first_rel.child_key:
                            row[col.name] = parent_pk
                        elif any(r.child_key == col.name for r in parent_rels):
                            r_match = next(r for r in parent_rels if r.child_key == col.name)
                            other_pks = pk_pools.get(r_match.parent_table, [])
                            row[col.name] = rng.choice(other_pks) if other_pks else 1
                        else:
                            row[col.name] = _generate_value(col, rng, fake)
                    rows.append(row)
                    if len(rows) >= t_row_count * 10:  # safety cap
                        break
                if len(rows) >= t_row_count * 10:
                    break
        else:
            # Root / standalone table
            for i in range(t_row_count):
                row = {}
                pk_counter = i + 1
                for col in tp.columns:
                    if col.is_primary_key or (col.data_type == "integer" and col.name == tp.primary_key):
                        row[col.name] = pk_counter
                    else:
                        row[col.name] = _generate_value(col, rng, fake)
                rows.append(row)

        result[t_name] = rows
        # Collect PK values for FK references
        pk_col = tp.primary_key
        pk_pools[t_name] = [r.get(pk_col, i + 1) for i, r in enumerate(rows)]

    return result


def _validate_fk_integrity(
    result: Dict[str, List[Dict[str, Any]]],
    relationships: List[RelationshipProfile],
) -> Dict[str, Any]:
    """Verify all FK references exist in the parent table."""
    orphaned = 0
    for rel in relationships:
        parent_rows = result.get(rel.parent_table, [])
        child_rows = result.get(rel.child_table, [])
        parent_pks = {r.get(rel.parent_key) for r in parent_rows}
        for row in child_rows:
            fk_val = row.get(rel.child_key)
            if fk_val not in parent_pks:
                orphaned += 1
    total_fk_rows = sum(
        len(result.get(rel.child_table, []))
        for rel in relationships
    )
    return {
        "status": "passed" if orphaned == 0 else "failed",
        "valid": orphaned == 0,
        "orphaned_foreign_keys": orphaned,
        "total_fk_rows_checked": total_fk_rows,
        "integrity_percentage": round(100.0 * (1 - orphaned / max(total_fk_rows, 1)), 2),
    }


# ── Legacy ecommerce preset (kept intact as demo fixture) ──────────────────────

def _generate_ecommerce_preset(
    request: RelationalGenerateRequest,
    rng: np.random.RandomState,
    fake: Faker,
) -> tuple[Dict[str, List[Dict[str, Any]]], Dict[str, Any], Dict[str, Any]]:
    """Original hardcoded e-commerce demo. Unchanged functionality."""
    row_counts = request.table_row_counts or {}
    num_customers = row_counts.get("customers", 15)

    customers: List[Dict[str, Any]] = []
    for i in range(num_customers):
        c_id = 1000 + i + 1
        customers.append({
            "customer_id": c_id,
            "name": fake.name(),
            "email": fake.email(),
        })

    orders: List[Dict[str, Any]] = []
    order_counter = 5001
    start_ts = 1704067200
    end_ts = 1772496000

    for cust in customers:
        num_orders = rng.randint(1, 5)
        for _ in range(num_orders):
            rand_ts = rng.randint(start_ts, end_ts)
            orders.append({
                "order_id": order_counter,
                "customer_id": cust["customer_id"],
                "order_date": datetime.fromtimestamp(int(rand_ts)).strftime("%Y-%m-%d"),
                "total_amount": 0.0,
            })
            order_counter += 1

    order_items: List[Dict[str, Any]] = []
    item_counter = 90001
    sku_prefixes = ["SKU-PRO", "SKU-SFT", "SKU-HW", "SKU-SRV", "SKU-ENT"]
    prices = [29.99, 49.00, 75.50, 110.00, 140.00, 250.00, 1100.00]
    order_totals: Dict[int, float] = {o["order_id"]: 0.0 for o in orders}

    for order in orders:
        num_items = rng.randint(1, 5)
        for _ in range(num_items):
            qty = int(rng.randint(1, 5))
            unit_price = float(rng.choice(prices))
            amount = round(qty * unit_price, 2)
            order_items.append({
                "item_id": item_counter,
                "order_id": order["order_id"],
                "sku": f"{rng.choice(sku_prefixes)}-{rng.randint(100, 999)}",
                "qty": qty,
                "unit_price": unit_price,
                "amount": amount,
            })
            order_totals[order["order_id"]] += amount
            item_counter += 1

    if request.reconcile_totals:
        for order in orders:
            order["total_amount"] = round(order_totals[order["order_id"]], 2)

    cust_ids = {c["customer_id"] for c in customers}
    order_ids = {o["order_id"] for o in orders}
    orphaned_orders = [o["order_id"] for o in orders if o["customer_id"] not in cust_ids]
    orphaned_items = [it["item_id"] for it in order_items if it["order_id"] not in order_ids]

    discrepancies = sum(
        1 for order in orders
        if abs(round(sum(it["amount"] for it in order_items if it["order_id"] == order["order_id"]), 2) - order["total_amount"]) > 0.001
    )

    integrity = {
        "status": "passed" if not orphaned_orders and not orphaned_items else "failed",
        "valid": not orphaned_orders and not orphaned_items,
        "orphaned_foreign_keys": len(orphaned_orders) + len(orphaned_items),
        "parent_tables_verified": ["customers", "orders"],
        "integrity_percentage": 100.0 if not orphaned_orders and not orphaned_items else 0.0,
    }
    reconciliation = {
        "status": "passed" if discrepancies == 0 else "failed",
        "discrepancies_count": discrepancies,
        "rule": "Order.total_amount == SUM(OrderItem.qty * OrderItem.unit_price)",
        "reconciliation_percentage": 100.0 if discrepancies == 0 else 0.0,
    }
    tables = {
        "customers": customers,
        "orders": orders,
        "order_items": order_items,
    }
    return tables, integrity, reconciliation


# ── Main engine class ─────────────────────────────────────────────────────────

class RelationalEngine:
    def __init__(self) -> None:
        pass

    def generate(self, request: RelationalGenerateRequest) -> RelationalGenerateData:
        start_time = time.perf_counter()
        seed = request.random_seed if request.random_seed is not None else 42
        rng = np.random.RandomState(seed)
        fake = Faker(request.locale)
        fake.seed_instance(seed)

        # ── Route: Generic DataProfile-driven ─────────────────────────────
        profile = request.profile
        if profile and profile.tables and (
            request.schema_preset != "ecommerce_default"
            or len(profile.tables) > 0
        ):
            tables = _generate_from_profile(request, profile, rng, fake)
            integrity = _validate_fk_integrity(tables, profile.relationships)
            reconciliation = {
                "status": "not_applicable",
                "note": "Custom schema — no built-in arithmetic reconciliation rules. Extend via DataProfile.business_rules."
            }

        # ── Route: Legacy preset ───────────────────────────────────────────
        else:
            tables, integrity, reconciliation = _generate_ecommerce_preset(request, rng, fake)

        exec_time = round((time.perf_counter() - start_time) * 1000, 2)
        return RelationalGenerateData(
            tables=tables,
            table_counts={k: len(v) for k, v in tables.items()},
            seed_applied=seed,
            execution_time_ms=exec_time,
            referential_integrity=integrity,
            reconciliation_audit=reconciliation,
        )


relational_engine = RelationalEngine()
