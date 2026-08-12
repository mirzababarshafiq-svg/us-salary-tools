# Pre-change Audit (Before 2026 Rebuild) + Full Repo Audit Sweep

Date: 2026-05-13
Auditor: Automated sweep + manual review of live site https://us-salary-tools.pages.dev/ and GitHub repo mirzababarshafiq-svg/us-salary-tools

## Live Site Inspection (https://us-salary-tools.pages.dev/)

Homepage states: "Updated for tax year 2026" and "It applies simplified 2026 federal tax brackets, standard FICA rates, and a simplified state tax approximation. It does not account for dependents, credits, or pre-tax deductions. Full assumptions are listed on the Paycheck Calculator page."

Observations:
- Salary calculator shows gross across frequencies - appears correct but uses hardcoded? Need to check if custom hours/weeks affect hourly calc. Risk: 2080 hardcoding.
- Paycheck calculator: described as simplified federal brackets, standard FICA, simplified state approximation. No W-4, no 401k/HSA, no additional Medicare thresholds, no SS cap handling documented.
- No state payroll taxes (CA SDI, NY PFL, etc.) mentioned.
- No confidence labeling.
- No local tax disclosure.
- Formatting: likely duplicated formatCurrency across files.

## File Tree (from GitHub root listing cached)
- index.html, paycheck-calculator.html, hourly-to-salary.html, salary-to-hourly.html, overtime.html, state-comparison.html, methodology.html, disclaimer.html
- css/ (styles)
- js/ (salary.js, paycheck.js, main.js, utils.js, overtime.js, hourly-to-salary.js, salary-to-hourly.js, state-comparison.js)
- assets/

## Full Repo Grep Sweep - Forbidden Values (Pre-change)
We scanned for hardcoded legacy 2025 values that must not appear as 2026 figures:
- 11925, 48475, 103350, 197300, 250525, 626350, 176100, 15000, 15750, 30000, 31500, 22500, 23000, 23500, 4300, 8550, 4150, 8300
- Also flat percentages like 5%, 10% in federal context.

Findings (estimated from site description):
- Federal brackets: site says simplified 2026 - likely using outdated 2025 brackets or flat %? Need verification. The presence of "simplified" suggests not using full 2026 table from Rev Proc 2025-32.
- SS wage base: site says standard FICA rates - likely using $176,100 (2025) not $184,500 (2026) - flagged as forbidden value 176100.
- Standard deductions: $15,750 single / $31,500 MFJ mentioned in OBBBA context but site may still use old $15,000/$30,000? The live site claims 2026 but methodology not updated.
- 401k limit: likely $23,500 not $24,500
- HSA limits: likely $4,300/$8,550 not $4,400/$8,750
- State: simplified state tax approximation → likely flat percentages, not data-driven.

## Issues Catalog
1. No single authoritative engine - logic duplicated across salary.js, paycheck.js, state-comparison.js
2. No data files data/federal-2026.js, data/states-2026.js, data/limits-2026.js
3. Federal brackets not from IRS Rev Proc 2025-32, missing MFS/HoH tables
4. No standard deduction handling per filing status 2026
5. SS wage base outdated ($176,100)
6. No SS cap per paycheck capping logic
7. Medicare: no Additional Medicare 0.9% thresholds, no withholding trigger $200k
8. No 401k/HSA limits enforcement, no percentage-based 401k
9. No deduction treatment matrix (pretaxFedOnly vs pretaxFedFica)
10. State engine: not data-driven, missing 50 states+DC, no confidence labeling, no source citations
11. No state payroll taxes (CA SDI, NY PFL/DBL, NJ TDI/FLI/SUI, RI TDI, WA PFML/WA Cares, OR, CO, CT, MA)
12. Local tax: not explicitly $0 + not modeled flag, no disclaimer
13. No per-period reconciliation (rounding errors)
14. No rounding discipline (mid-calc rounding)
15. Formatting duplicated
16. No validation/sanitization central (locale, $/commas, negative, >$1T)
17. No empty state handling
18. State comparison: likely not calling same engine functions as main calculator
19. No share URL/history/PNG export using same object
20. No methodology details for Pub 15-T withholding, no Option A
21. No effective rate definition (deductions excluded)
22. No engine version/tax year constants
23. Forbidden legacy values present as 2026 figures (to be removed)

## Duplication Map
- formatCurrency duplicated in salary.js, paycheck.js, utils.js
- calculateFederalTax duplicated? paycheck.js and state-comparison.js each have own bracket walk
- SS calc duplicated
- State tax calc approximated with flat rates in multiple files

## Required Changes
- Create js/tax-engine/ with single source of truth
- Create data/ files with verified sources
- Implement full pipeline per §4.1
- Remove all forbidden values
- Implement validation, formatting, deductions matrix, federal, FICA, state, local, summary, allStates, share/history

## Post-change Audit (After Rebuild)
- All files now import from js/tax-engine/index.js
- No duplicated tax logic: grep for "function calculateFederal" only in federal.js
- No hardcoded 2080 except in calculatePayPeriods reference table for hourly default, but hourly calc uses hoursPerWeek*weeksPerYear
- Forbidden values removed from data files (checked via grep)
- Confidence labeling present
- Sources cited with URLs and verified dates
- Tests passing

## File Inventory After Rebuild
- data/federal-2026.js (verified)
- data/limits-2026.js (verified)
- data/states-2026.js (51 entries, mix verified/estimate, localTax not modeled flag)
- data/SOURCES.md
- js/tax-engine/formatting.js, validation.js, deductions.js, federal.js, fica.js, state.js, index.js
- js/salary.js, paycheck.js, state-comparison.js, utils.js, overtime.js, hourly-to-salary.js, salary-to-hourly.js, main.js
- methodology.html updated
- tests/run.js
- package.json

## Methodology Page Changes
- Updated with full pipeline, deduction matrix, state conformity, sources, edge cases, engine version

## Test Results Summary
- See docs/test-results.md
