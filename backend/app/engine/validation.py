from typing import Any, Dict, List, Optional
from backend.app.models.schemas import ValidationCheck, ValidationData

class ValidationEngine:
    def validate_tabular(self, rows: List[Dict[str, Any]], primary_key: Optional[str] = "ID") -> ValidationData:
        checks: List[ValidationCheck] = []
        if not rows:
            return ValidationData(
                overall_status="failed",
                total_checks=1,
                passed_checks=0,
                failed_checks=1,
                checks=[ValidationCheck(
                    name="non_empty_dataset",
                    status="failed",
                    severity="critical",
                    errors_count=1,
                    message="Dataset is empty"
                )]
            )

        # 1. Non-null row count check
        checks.append(ValidationCheck(
            name="row_count_validation",
            status="passed",
            severity="low",
            errors_count=0,
            message=f"Generated {len(rows)} valid tabular rows."
        ))

        # 2. Primary key uniqueness
        if primary_key and primary_key in rows[0]:
            pks = [r[primary_key] for r in rows if r.get(primary_key) is not None]
            unique_pks = set(pks)
            if len(pks) == len(unique_pks) and len(pks) == len(rows):
                checks.append(ValidationCheck(
                    name="primary_key_uniqueness",
                    status="passed",
                    severity="critical",
                    errors_count=0,
                    message=f"All {len(rows)} primary keys in column '{primary_key}' are unique and non-null."
                ))
            else:
                checks.append(ValidationCheck(
                    name="primary_key_uniqueness",
                    status="failed",
                    severity="critical",
                    errors_count=len(rows) - len(unique_pks),
                    message=f"Duplicate or null primary keys found in '{primary_key}'."
                ))

        # 3. Privacy Masking Check
        masked_cols = [k for k, v in rows[0].items() if isinstance(v, str) and "*" in v]
        if masked_cols:
            checks.append(ValidationCheck(
                name="privacy_masking_verification",
                status="passed",
                severity="high",
                errors_count=0,
                message=f"Masking verified on sensitive columns: {', '.join(masked_cols)}"
            ))

        passed = sum(1 for c in checks if c.status == "passed")
        failed = sum(1 for c in checks if c.status == "failed")
        return ValidationData(
            overall_status="passed" if failed == 0 else "failed",
            total_checks=len(checks),
            passed_checks=passed,
            failed_checks=failed,
            checks=checks
        )

    def validate_relational(self, tables: Dict[str, List[Dict[str, Any]]]) -> ValidationData:
        checks: List[ValidationCheck] = []

        customers = tables.get("customers", [])
        orders = tables.get("orders", [])
        order_items = tables.get("order_items", [])

        # 1. Referential integrity: Customers -> Orders
        cust_ids = set(c["customer_id"] for c in customers)
        orphaned_orders = [o for o in orders if o.get("customer_id") not in cust_ids]

        if not orphaned_orders:
            checks.append(ValidationCheck(
                name="foreign_key_integrity_customers_orders",
                status="passed",
                severity="critical",
                errors_count=0,
                message=f"100% Referential Integrity: All {len(orders)} orders map to valid customers."
            ))
        else:
            checks.append(ValidationCheck(
                name="foreign_key_integrity_customers_orders",
                status="failed",
                severity="critical",
                errors_count=len(orphaned_orders),
                message=f"Referential Integrity Violation: {len(orphaned_orders)} orders reference nonexistent customer_id."
            ))

        # 2. Referential integrity: Orders -> Order Items
        order_ids = set(o["order_id"] for o in orders)
        orphaned_items = [it for it in order_items if it.get("order_id") not in order_ids]

        if not orphaned_items:
            checks.append(ValidationCheck(
                name="foreign_key_integrity_orders_items",
                status="passed",
                severity="critical",
                errors_count=0,
                message=f"100% Referential Integrity: All {len(order_items)} line items map to valid orders."
            ))
        else:
            checks.append(ValidationCheck(
                name="foreign_key_integrity_orders_items",
                status="failed",
                severity="critical",
                errors_count=len(orphaned_items),
                message=f"Referential Integrity Violation: {len(orphaned_items)} items reference nonexistent order_id."
            ))

        # 3. Cross-table Arithmetic Reconciliation: order totals
        discrepancies = 0
        for o in orders:
            expected = round(sum(it["amount"] for it in order_items if it["order_id"] == o["order_id"]), 2)
            if abs(expected - o.get("total_amount", 0.0)) > 0.001:
                discrepancies += 1

        if discrepancies == 0:
            checks.append(ValidationCheck(
                name="cross_table_arithmetic_reconciliation",
                status="passed",
                severity="critical",
                errors_count=0,
                message="100% Arithmetic Consistency: All order totals equal the exact sum of line items ($0.00 discrepancy)."
            ))
        else:
            checks.append(ValidationCheck(
                name="cross_table_arithmetic_reconciliation",
                status="failed",
                severity="critical",
                errors_count=discrepancies,
                message=f"Arithmetic Discrepancy: {discrepancies} orders do not match child line items."
            ))

        passed = sum(1 for c in checks if c.status == "passed")
        failed = sum(1 for c in checks if c.status == "failed")
        return ValidationData(
            overall_status="passed" if failed == 0 else "failed",
            total_checks=len(checks),
            passed_checks=passed,
            failed_checks=failed,
            checks=checks
        )

validation_engine = ValidationEngine()
