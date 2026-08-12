# Regression Checklist

Date: 2026-05-13
Engine v2026.1.0

## Must Pass

- [x] Formatting single source: formatCurrency, formatPercent only in formatting.js, imported elsewhere
- [x] Rounding: cents rounded only at display/breakdown, not mid-calc (checked: roundCents only in final totals, allocations)
- [x] Effective rate = totalTaxes / gross *100, deductions excluded
- [x] Take-home % = netAnnual / gross *100
- [x] Per-period reconciliation: allocatePeriods distributes remainder cents, sum == annual (tested with 26 periods $100k)
- [x] Empty input -> "Enter your salary..." message, net 0
- [x] Negative input -> validation error, no calc
- [x] $0 income -> net 0
- [x] Deductions exceeding gross -> clamped, warning, net floored at 0
- [x] Hourly non-default: hourlyRate * hoursPerWeek * weeksPerYear, no hardcoded 2080
- [x] Monthly: grossAnnual = monthly*12, semimonthly*24, biweekly*26, weekly*52, daily*260
- [x] Biweekly output: perPeriodGross = grossAnnual / 26, perPeriodNet = netAnnual / 26, reconciled via allocatePeriods
- [x] 401k: percentage based (traditional401kPercent), enforced limit $24,500 + catch-up $8,000 / $11,250, capped warning, pretaxFedOnly (does not reduce FICA)
- [x] HSA: self $4,400 family $8,750 catch-up $1,000, via payroll reduces FICA, capped warning
- [x] Roth vs traditional: Roth no reduction, traditional reduces federal + state (except PA)
- [x] SS wage base $184,500 capped, max $11,439, capped notice displayed
- [x] Medicare 1.45% no cap
- [x] Additional Medicare 0.9%: liability thresholds Single/HoH $200k MFJ $250k MFS $125k, withholding trigger $200k regardless status, separate fields
- [x] Federal brackets: all 4 filing statuses from IRS Rev Proc 2025-32 verified
- [x] Standard deductions 2026: Single $16,100 MFJ $32,200 MFS $16,100 HoH $24,150
- [x] State engine: data-driven 50+DC, system types, brackets, std ded, conformity, localTax not modeled flag, confidence labeling
- [x] PA 401k taxable: stateAllows401k false for PA, tested $80k + $10k 401k -> state taxable wages gross still includes 401k
- [x] NJ/CA/AL HSA non-conforming: stateAllowsHSA false, HSA does not reduce state taxable
- [x] State payroll taxes: CA SDI 1.3% no cap, NY PFL 0.432%, NJ TDI 0.19% FLI 0.23%, WA PFML 0.71% + Cares 0.58%, CO FAMLI 0.44%, CT PFML 0.5%, MA PFML 0.46%, RI TDI 1.1%
- [x] Local tax: $0 + not modeled flag, note lists excluded cities (NYC, Yonkers, PA EIT/LST, Ohio municipal, MD county, MO KC/StL, IN county, MI cities, KY/AL occupational, NY MCTMT)
- [x] State comparison: calls exact same engine functions as main calculator (calculateAllStates uses calculateAll)
- [x] Comparison sort: numeric correct, stable for ties (secondary sort by name), deterministic
- [x] Comparison row parity: comparisonRow(state) === mainCalculator(state) field-for-field (tested)
- [x] Share/history/PNG export: same result object used, no recomputation
- [x] Warnings: capped 401k, capped HSA, deductions exceed gross, multiple jobs uplift, etc. with aria-live polite
- [x] Confidence badge: verified/estimate based on source
- [x] Methodology page: updated with pipeline, matrix, sources, edge cases
- [x] SOURCES.md: primary sources with URLs, verified dates
- [x] No forbidden legacy values
- [x] No duplicated tax logic
- [x] No scientific notation, no parseFloat without validation
- [x] No negative values in deductions
- [x] Max salary $1T validation
- [x] Locale handling: $ , % removed, European 1.234,56 handled
- [x] Engine version and tax year constants

## Manual Visual Checks Required
- [ ] Homepage loads, salary converter works
- [ ] Paycheck calculator shows all fields: gross, fed, state, SS, Medicare, addl Medicare, state payroll, local $0, total, net annual/monthly/biweekly, effective rate, take-home %, per-period, warnings, confidence, method
- [ ] State comparison table sorted descending net annual
- [ ] Methodology page renders pipeline and matrix
- [ ] Mobile responsive

## Test Results
See docs/test-results.md - 30 detailed scenarios + 84 combo checks + parity + share round-trip - all PASS
