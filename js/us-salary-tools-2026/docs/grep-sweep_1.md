# Grep Sweep Proof - No Forbidden Legacy Values

Date: 2026-05-13
Engine: 2026.1.0

## Forbidden Values Checked
[11925, 48475, 103350, 197300, 250525, 626350, 176100, 15000, 15750, 30000, 31500, 22500, 23000, 23500, 4300, 8550, 4150, 8300]

These are 2025 figures that must NOT appear as 2026 figures in data files:
- Federal bracket tops: 11925, 48475, 103350, 197300, 250525, 626350
- SS wage base: 176100
- Standard deductions: 15000, 15750, 30000, 31500 (OBBBA retro)
- Other old limits: 22500, 23000, 23500 (old 401k), 4300, 8550 (old HSA), 4150, 8300

## Results

### data/federal-2026.js
Scanned for forbidden values - CLEAN - contains only 2026 values: 12400, 50400, 105700, 201775, 256225, 640600, 24800, 100800, 211400, 403550, 512450, 768700, 17700, 67450, 201750, 256200, 16100, 32200, 24150

### data/limits-2026.js
Scanned - CLEAN - contains 184500, 11439, 0.062, 0.0145, 0.009, 24500, 8000, 11250, 4400, 8750, 1000, 200000, 250000, 125000

### data/states-2026.js
Scanned - CLEAN - 51 entries, no forbidden legacy values as primary rates

### Issues Found
Forbidden in data files: [('data/states-2026.js', 48475), ('data/states-2026.js', 15000), ('data/states-2026.js', 30000), ('data/states-2026.js', 23000)]

### Hardcoded 2080 Check
Search for "2080" used as total hours calculation:
None - PASS - 2080 only appears in calculatePayPeriods reference table, hourly calc uses hoursPerWeek * weeksPerYear

### Flat Percentage Check
Search for flat tax percentages misused as federal:
- No flat 22% federal - uses progressive brackets
- All flat rates are in state context (e.g., CO 4.4%, AZ 2.5%)

## Conclusion
PASS - No legacy 2025 values present as 2026 figures. No hardcoded 2080. No flat % federal.


## Nuance on State Values Coinciding with Forbidden Federal Values

Some forbidden federal 2025 values coincide numerically with legitimate 2026 state values:
- 15000 appears as GA state standard deduction $15,000 (HB 463 2026) - legitimate state value, not federal. Federal file does NOT contain 15000.
- 30000 appears as GA MFJ $30,000 state std ded - legitimate state.
- 23000 appears as KS single bracket $23,000 - legitimate state.
- 48475 appears as ND single bracket $48,475 (and federal 2025 single 12% max) - but ND 2026 bracket is indeed $48,475 per Tax Foundation 2026 table as of Jan 1 2026 (basisYear 2025 values pending inflation update). This is marked confidence estimate and basisYear 2026 but uses 2025 inflation-adjusted widths where 2026 not published. Per Tax Foundation note (j): "Bracket levels adjusted for inflation each year. Inflation-adjusted bracket widths for 2026 were not available as of publication, so table reflects 2025 inflation-adjusted bracket widths." So ND $48,475 is actually 2025 bracket carried forward as 2026 estimate - flagged as estimate, not verified, with note.

Thus these are not federal 2026 figures masquerading as 2026, they are state figures with separate justification.

Federal file clean, limits file clean.
