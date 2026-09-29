HackDataV2 · Submission
Synthetic data
platform
Realistic, privacy-safe tabular, relational and document data —
generated on demand.
Tabular Data Relational Structures Document Generator

The problem
Real data is scarce, sensitive, and slow to get
Privacy & compliance Limited, messy datasets Slow procurement cycles
Teams can’t freely share production Real datasets are small, skewed, or Getting a sanctioned data extract for a
data across environments, partners, or missing the edge cases engineers need to demo or a test suite can take weeks of
the cloud. test against. sign-off.
HackDataV2 · Synthetic Data Platform

Our approach
Schema-aware, not random
Ingest schema Model relationships Generate with AI Validate & export
Infer tables, columns, types Learn distributions, An AI layer fills in realistic Check referential integrity
and keys from a sample or a correlations and foreign-key names, text, and edge and statistical fidelity,
schema file. cardinalities across tables. cases the schema alone then export to your format
can’t describe. of choice.
HackDataV2 · Synthetic Data Platform

System design
From schema to shippable data
Generation engine
| Inputs | | Outputs |
| ------ | --- | ------- |
Tabular engine
| Schema definition | | CSV / JSON tables |
| ----------------- | ----------------- | ------------------- |
| Sample dataset | Relational engine | Relational DB dump |
| Business rules | | PDF-style documents |
Document engine
AI layer runs across all three
HackDataV2 · Synthetic Data Platform

Feature
Tabular data generation
Sample synthetic output
| | ID | Name | Email | Signu | Bala |
| ---------------------------------------------------- | --- | ---- | ----- | ----- | ---- |
| Statistically faithful distributions for numeric and | | | | p | nce |
categorical columns
| | 10231 | Maria Chen | m.chen@example. | 2025- | $482 |
| --- | ----- | ---------- | --------------- | ----- | ---- |
Configurable row count, random seed, and null / outlier rates com 02-11 .10
Column-level privacy controls: masking, hashing, and
| | 10232 | Ahmed Raza | a.raza@example.c | 2025- | $129 |
| --- | ----- | ---------- | ---------------- | ----- | ---- |
| | | | om | 03-04 | .55 |
differential noise
| | 10233 | Sofia Ivanova | s.ivanova@exampl | 2025- | $918 |
| --- | ----- | ------------- | ---------------- | ----- | ---- |
| | | | e.com | 01-27 | .42 |
HackDataV2 · Synthetic Data Platform

Feature
Relational data structures
| Customers | Orders | Order items |
| ---------------- | ---------------- | ------------- |
| customer_id (PK) | order_id (PK) | item_id (PK) |
| name | customer_id (FK) | order_id (FK) |
| email | order_date | sku, qty |
Referential integrity maintained automatically across every generated table
Cardinalities are configurable — 1:1, 1:N, and N:N
Cross-table consistency: order totals reconcile with their line items
HackDataV2 · Synthetic Data Platform

Feature · Document generator
Invoices
INVOICE
#INV-10432
| | Billed to | | From | |
| --- | ----------------------- | --- | -------------- | --- |
| | Northwind Supplies Ltd. | | Synth Data Co. | |
Realistic line items, tax rules, and totals that
reconcile automatically
| | Item | Qty | Price | Amount |
| --- | ---- | --- | ----- | ------ |
Templated layouts per region — date formats, currency,
| | API access — Pro tier | 1 $1,100.0 | | $1,100.0 |
| ---------- | --------------------- | ---------- | --- | -------- |
| tax labels | | | 0 | 0 |
Bulk generation for testing invoicing and reconciliation
| | Onboarding support | 1 | $140.00 | $140.00 |
| --- | ------------------ | --- | ------- | ------- |
pipelines
Total: $1,240.00
HackDataV2 · Synthetic Data Platform

Feature · Document generator
Bank statements & queries
Sample statement excerpt
| Date | Description | Debit | Credit | Balanc |
| ---- | ----------- | ----- | ------ | ------ |
e
| 08-14 | Greenleaf Market | $42.10 | | $1,204. |
| ----- | ---------------- | ------ | --- | ------- |
Transaction histories with realistic merchants, amounts,
30
and running balances
| 08-15 | Payroll deposit | | $2,150.0 | $3,354. |
| ----- | --------------- | --- | -------- | ------- |
Structured exports (JSON / CSV) or formatted
| | | | 0 | 30 |
| --- | --- | --- | --- | --- |
statement documents
| 08-17 | Riverside Utilities | $96.40 | | $3,257. |
| ----- | ------------------- | ------ | --- | ------- |
Query-style generation, e.g. “last 90 days, balance 90
over $500”
HackDataV2 · Synthetic Data Platform

AI layer
Where AI does the work
Schema understanding Realistic content synthesis Edge-case injection
Infers column types, formats and Names, addresses and free-text fields Proposes nulls, outliers, and rare patterns
relationships directly from a small read naturally instead of looking so test suites cover more than the
sample, no manual mapping. machine-generated. happy path.
HackDataV2 · Synthetic Data Platform

Experience
One workspace, three data types
Workspace Configuration
Row count
Tabular
Live
Random seed
preview
Relational
canvas Locale & currency
Documents
See Privacy rules
generated
rows Export
update
instantly
as
settings
change
on the
right.
HackDataV2 · Synthetic Data Platform

Why it wins
Built against the judging criteria
Criterion How we deliver
System design Modular engine — tabular, relational and document generators share one schema-aware pipeline
Features Tabular, relational, and document generation (invoices, bank statements) in a single platform
UI One workspace to configure, preview, and export — no code required
AI AI infers schemas, synthesizes realistic content, and injects meaningful edge cases
Problem approach Solves data scarcity and privacy constraints without ever touching real records
HackDataV2 · Synthetic Data Platform

HackDataV2
Thank you
Synthetic Data Platform — questions, and a live demo.
| Tabular | Relational | Documents |
| ------- | ---------- | --------- |
