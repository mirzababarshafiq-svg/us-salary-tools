# US Salary Tools - 2026 Rebuild Complete

## Engine
- Single authoritative module: js/tax-engine/index.js
- Data: data/federal-2026.js, data/limits-2026.js, data/states-2026.js, data/SOURCES.md
- Version: 2026.1.0 Tax Year: 2026 Verified: 2026-05-13

## Verified Core
- Federal brackets IRS Rev Proc 2025-32: 10% to $12,400 single / $24,800 MFJ, 12% to $50,400 / $100,800, 22% to $105,700 / $211,400, 24% to $201,775 / $403,550, 32% to $256,225 / $512,450, 35% to $640,600 / $768,700, 37% above. HoH and MFS included.
- Standard deductions: $16,100 single, $32,200 MFJ, $16,100 MFS, $24,150 HoH
- SS wage base $184,500 max $11,439, Medicare 1.45%, Additional Medicare 0.9% thresholds Single/HoH $200k MFJ $250k MFS $125k, withholding trigger $200k
- 401k $24,500 + $8,000 50+ + $11,250 60-63 SECURE 2.0, HSA $4,400 self $8,750 family $1,000 catch-up
- State: 51 jurisdictions data-driven from Tax Foundation 2026 as of Jan 1 2026 + official DOR payroll taxes
- State payroll: CA SDI 1.3% no cap, NY PFL 0.432%, NJ TDI 0.19% FLI 0.23%, WA PFML 1.13% total, CO FAMLI 0.88% total 0.44% employee, CT PFML 0.5%, MA PFML 0.46%, RI TDI 1.1%, etc.

## Pipeline
normalize -> sanitize -> classify deductions (pretaxFedOnly vs pretaxFedFica, PA/NJ/CA conformity) -> taxable wages -> federal taxable income -> federal tax -> Pub 15-T withholding Option A -> FICA -> state taxable -> state tax -> state payroll -> local $0 not modeled -> net annual -> per-period reconciliation

## Tests
- node tests/run.js - 10 basic + 84 combos + parity - PASS
- node tests/detailed.js - 30 scenarios matrix - PASS
- 51x4x3 = 612 combos monotonic - PASS
- Parity main vs comparison - PASS
- Share URL round-trip - PASS

## Docs
- docs/audit.md - pre/post audit, file inventory
- docs/test-results.md - 30 scenarios table
- docs/tax-rule-changes.md - 2025->2026 changes
- docs/state-matrix.md - 51 states system, rates, conformity, payroll, confidence
- docs/grep-sweep.md - no legacy values proof
- docs/regression-checklist.md - must pass checklist
- docs/known-limitations.md - local taxes, itemized, credits, etc.
- docs/maintenance-guide.md - how to update for 2027
- CHANGELOG.md
- methodology.html - full methodology

## How to Run
npm test or node tests/run.js
Open index.html in browser (needs local server for ES modules: npx serve .)

## Deliverables
All files in /mnt/data/us-salary-tools - ready to deploy to Cloudflare Pages https://us-salary-tools.pages.dev/
No duplicated logic, no forbidden legacy values in federal/limits, single formatting source, rounding discipline, empty state handling, confidence labeling, sources cited.

## Live Verification
- Site: https://us-salary-tools.pages.dev/ - "Updated for tax year 2026"
- GitHub: https://github.com/mirzababarshafiq-svg/us-salary-tools
