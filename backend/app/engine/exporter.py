import csv
import io
import json
from typing import Any, Dict, List, Optional
from backend.app.models.schemas import ExportRequest, ExportData

class Exporter:
    def export(self, request: ExportRequest) -> ExportData:
        fmt = request.format.lower()
        dataset = request.dataset
        modality = request.modality.lower()
        filename_base = request.filename or "synthetic_export"

        if fmt == "csv":
            content, ctype, ext = self._to_csv(dataset, modality)
        elif fmt == "sql":
            content, ctype, ext = self._to_sql(dataset, modality)
        elif fmt == "pdf":
            content, ctype, ext = self._to_html_doc(dataset, modality)
        else:
            # Default to JSON
            content = json.dumps(dataset, indent=2)
            ctype = "application/json"
            ext = "json"

        full_filename = f"{filename_base}.{ext}"
        size_bytes = len(content.encode("utf-8"))

        return ExportData(
            filename=full_filename,
            format=fmt,
            content_type=ctype,
            raw_content=content,
            size_bytes=size_bytes
        )

    def _to_csv(self, dataset: Dict[str, Any], modality: str) -> tuple[str, str, str]:
        output = io.StringIO()
        if "rows" in dataset and isinstance(dataset["rows"], list) and dataset["rows"]:
            rows = dataset["rows"]
            writer = csv.DictWriter(output, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
        elif "tables" in dataset and isinstance(dataset["tables"], dict):
            # Write multi-table CSV with table separators
            for tbl_name, rows in dataset["tables"].items():
                output.write(f"# TABLE: {tbl_name}\n")
                if rows:
                    writer = csv.DictWriter(output, fieldnames=list(rows[0].keys()))
                    writer.writeheader()
                    writer.writerows(rows)
                output.write("\n")
        elif "invoices" in dataset and isinstance(dataset["invoices"], list):
            # Invoices line items CSV
            flat_rows = []
            for inv in dataset["invoices"]:
                for it in inv.get("line_items", []):
                    flat_rows.append({
                        "invoice_number": inv.get("invoice_number"),
                        "date": inv.get("date"),
                        "billed_to": inv.get("billed_to"),
                        "item": it.get("item"),
                        "qty": it.get("qty"),
                        "price": it.get("price"),
                        "amount": it.get("amount"),
                        "total": inv.get("total")
                    })
            if flat_rows:
                writer = csv.DictWriter(output, fieldnames=list(flat_rows[0].keys()))
                writer.writeheader()
                writer.writerows(flat_rows)
        elif "statement" in dataset and "transactions" in dataset["statement"]:
            stmt = dataset["statement"]
            writer = csv.DictWriter(output, fieldnames=["date", "description", "debit", "credit", "balance"])
            writer.writeheader()
            writer.writerows(stmt.get("transactions", []))
        else:
            output.write(json.dumps(dataset))

        return output.getvalue(), "text/csv", "csv"

    def _to_sql(self, dataset: Dict[str, Any], modality: str) -> tuple[str, str, str]:
        lines = [
            "-- ====================================================",
            "-- HackData V2 Synthetic Data PostgreSQL / ANSI SQL Dump",
            "-- ====================================================\\n"
        ]

        def _safe_ident(name: str) -> str:
            return f'"{name}"' if not str(name).isidentifier() else str(name)

        if "tables" in dataset and isinstance(dataset["tables"], dict):
            for tbl_name, rows in dataset["tables"].items():
                if not rows:
                    continue
                cols = list(rows[0].keys())
                safe_tbl = _safe_ident(tbl_name)
                col_defs = []
                for c in cols:
                    safe_col = _safe_ident(c)
                    sample = rows[0][c]
                    if isinstance(sample, int):
                        col_defs.append(f"  {safe_col} INTEGER")
                    elif isinstance(sample, float):
                        col_defs.append(f"  {safe_col} NUMERIC(12,2)")
                    else:
                        col_defs.append(f"  {safe_col} VARCHAR(255)")

                lines.append(f"CREATE TABLE IF NOT EXISTS {safe_tbl} (")
                lines.append(",\n".join(col_defs))
                lines.append(");\n")

                safe_cols_str = ", ".join(_safe_ident(c) for c in cols)
                for r in rows:
                    vals = []
                    for c in cols:
                        v = r[c]
                        if v is None:
                            vals.append("NULL")
                        elif isinstance(v, (int, float)):
                            vals.append(str(v))
                        else:
                            clean_str = str(v).replace("'", "''")
                            vals.append(f"'{clean_str}'")
                    lines.append(f"INSERT INTO {safe_tbl} ({safe_cols_str}) VALUES ({', '.join(vals)});")
                lines.append("\n")

        elif "rows" in dataset and isinstance(dataset["rows"], list) and dataset["rows"]:
            safe_tbl = "synthetic_tabular"
            rows = dataset["rows"]
            cols = list(rows[0].keys())
            col_defs = []
            for c in cols:
                safe_col = _safe_ident(c)
                sample = rows[0][c]
                if isinstance(sample, int):
                    col_defs.append(f"  {safe_col} INTEGER")
                elif isinstance(sample, float):
                    col_defs.append(f"  {safe_col} NUMERIC(12,2)")
                else:
                    col_defs.append(f"  {safe_col} VARCHAR(255)")
            lines.append(f"CREATE TABLE IF NOT EXISTS {safe_tbl} (")
            lines.append(",\n".join(col_defs))
            lines.append(");\n")
            safe_cols_str = ", ".join(_safe_ident(c) for c in cols)
            for r in rows:
                vals = []
                for c in cols:
                    v = r[c]
                    if v is None:
                        vals.append("NULL")
                    elif isinstance(v, (int, float)):
                        vals.append(str(v))
                    else:
                        clean_str = str(v).replace("'", "''")
                        vals.append(f"'{clean_str}'")
                lines.append(f"INSERT INTO {safe_tbl} ({safe_cols_str}) VALUES ({', '.join(vals)});")
        else:
            lines.append("-- No relational tables to export as SQL.")

        return "\n".join(lines), "application/sql", "sql"

    def _to_html_doc(self, dataset: Dict[str, Any], modality: str) -> tuple[str, str, str]:
        html = [
            "<!DOCTYPE html>",
            "<html>",
            "<head><meta charset='utf-8'><title>HackData V2 Document Export</title>",
            "<style>",
            "body { font-family: -apple-system, sans-serif; padding: 40px; color: #0F172A; background: #F8F7F4; }",
            ".card { background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #E2E8F0; max-width: 800px; margin: 0 auto; }",
            "table { width: 100%; border-collapse: collapse; margin-top: 20px; }",
            "th, td { text-align: left; padding: 10px; border-bottom: 1px solid #E2E8F0; }",
            "th { background: #F1F5F9; font-size: 12px; text-transform: uppercase; color: #475569; }",
            ".total { font-size: 18px; font-weight: bold; color: #0D9488; text-align: right; margin-top: 20px; }",
            "</style>",
            "</head>",
            "<body>",
            "<div class='card'>"
        ]

        if "invoices" in dataset and isinstance(dataset["invoices"], list) and dataset["invoices"]:
            inv = dataset["invoices"][0]
            html.append(f"<h1>INVOICE {inv.get('invoice_number')}</h1>")
            html.append(f"<p><strong>Billed To:</strong> {inv.get('billed_to')}<br><strong>From:</strong> {inv.get('billed_from')}</p>")
            html.append(f"<p><strong>Date:</strong> {inv.get('date')} | <strong>Due:</strong> {inv.get('due_date')}</p>")
            html.append("<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>")
            for it in inv.get("line_items", []):
                html.append(f"<tr><td>{it.get('item')}</td><td>{it.get('qty')}</td><td>${it.get('price'):.2f}</td><td>${it.get('amount'):.2f}</td></tr>")
            html.append(f"</tbody></table><div class='total'>Total: ${inv.get('total'):.2f}</div>")
        elif "statement" in dataset:
            stmt = dataset["statement"]
            html.append(f"<h1>BANK STATEMENT</h1>")
            html.append(f"<p><strong>Account Holder:</strong> {stmt.get('account_holder')}<br><strong>Period:</strong> {stmt.get('statement_period')}</p>")
            html.append("<table><thead><tr><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead><tbody>")
            for t in stmt.get("transactions", []):
                deb = f"${t.get('debit'):.2f}" if t.get('debit') else ""
                cred = f"${t.get('credit'):.2f}" if t.get('credit') else ""
                html.append(f"<tr><td>{t.get('date')}</td><td>{t.get('description')}</td><td>{deb}</td><td>{cred}</td><td><strong>${t.get('balance'):.2f}</strong></td></tr>")
            html.append("</tbody></table>")
        else:
            html.append("<pre>" + json.dumps(dataset, indent=2) + "</pre>")

        html.append("</div></body></html>")
        return "\n".join(html), "text/html", "html"

exporter = Exporter()
