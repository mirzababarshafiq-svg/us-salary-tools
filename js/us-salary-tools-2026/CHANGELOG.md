# Changelog - 2026 Rebuild

## v2026.1.0 - 2026-05-13 - Complete 2026 Engine Rebuild

### Added
- data/federal-2026.js - 2026 brackets from IRS Rev Proc 2025-32, standard deductions $16,100/$32,200/$24,150 verified
- data/limits-2026.js - SS wage base $184,500 max $11,439, Medicare 1.45%, Additional Medicare 0.9% thresholds $200k/$250k/$125k, 401k $24,500 + $8k + $11,250, HSA $4,400/$8,750/$1k
- data/states-2026.js - 51 jurisdictions data-driven, Tax Foundation 2026 baseline, payroll taxes CA SDI 1.3% no cap, NY PFL 0.432%, NJ TDI 0.19% FLI 0.23%, WA PFML 1.13% total, CO FAMLI 0.88% total 0.44% employee, CT PFML 0.5%, MA PFML 0.46%, RI TDI 1.1%, etc., localTax not modeled flag, confidence labeling
- data/SOURCES.md - primary sources with URLs, verified dates
- js/tax-engine/ - single authoritative engine: formatting.js (ENGINE_VERSION, TAX_YEAR, formatCurrency, formatPercent, roundCents, allocatePeriods), validation.js (sanitizeInputs, validateInputs, normalizeIncome, calculatePayPeriods), deductions.js (classifyDeductions, calculateTaxableWages, matrix PA/NJ/CA), federal.js (calculateFederalTaxableIncome, calculateFederalTax, calculateFederalWithholding Pub 15-T), fica.js (calculateSocialSecurity, calculateMedicare, calculateAdditionalMedicare, calculateFICA), state.js (calculateStateTaxableIncome, calculateStateTax, calculateStatePayrollTaxes, calculateLocalTax), index.js (calculateAll pipeline, calculateSummary, calculateAllStates, formatResultForShare)
- js/salary.js, paycheck.js, state-comparison.js refactored to use engine, preserve DOM ids/classes
- js/utils.js, overtime.js, hourly-to-salary.js, salary-to-hourly.js refactored
- methodology.html updated with full pipeline, deduction matrix, state conformity, edge cases, sources
- tests/run.js, tests/detailed.js - 34 scenarios including 51x4x3, parity, share round-trip, golden snapshot
- docs/ - audit.md, test-results.md, tax-rule-changes.md, state-matrix.md, grep-sweep.md, regression-checklist.md, known-limitations.md, maintenance-guide.md

### Changed
- Salary calculator: now uses hoursPerWeek * weeksPerYear for hourly, no hardcoded 2080 on custom paths
- Paycheck calculator: annual liability + Pub 15-T withholding Option A, deduction treatment matrix, 401k/HSA limits enforced, percentage-based 401k, SS cap capping, Additional Medicare thresholds, state payroll taxes, local $0 not modeled, per-period reconciliation, rounding discipline, empty state handling, aria-live warnings, confidence badge
- State comparison: calls same engine functions as main, sort numeric correct stable, parity field-for-field, confidence labeling
- Formatting: single source formatCurrency, formatPercent
- Validation: centralized sanitizeInputs (locale, $/,, %, European 1.234,56, scientific notation rejection, max $1T, negative handling), validateInputs
- Net pay: gross - taxes - deductions, clamped 0..gross, per-period allocations sum == annual

### Removed
- Duplicated tax logic across files
- Hardcoded 2080 except in calculatePayPeriods reference table
- Forbidden legacy 2025 values as 2026 figures: 11925, 48475, 103350, 197300, 250525, 626350, 176100, 15000, 15750, 30000, 31500, 22500, 23000, 23500, 4300, 8550, 4150, 8300
- Flat percentage federal tax
- Simplified state approximation without data

### Fixed
- All 20+ audit issues from pre-change audit
- SS wage base updated to $184,500
- Federal brackets updated to 2026
- Standard deductions updated
- 401k/HSA limits updated
- Additional Medicare thresholds implemented

### Security
- Input sanitization prevents injection via $/commas
- No eval, no innerHTML with user input except via textContent/formatCurrency

### Compliance
- Methodology page discloses annual liability vs exact withholding, estimate only not tax advice, methods, limits, sources
- Confidence labeling verified/estimate
- SOURCES.md with URLs and verified dates

## Previous Versions
- v2025.x - simplified 2026 brackets, standard FICA, simplified state approximation (deprecated)
