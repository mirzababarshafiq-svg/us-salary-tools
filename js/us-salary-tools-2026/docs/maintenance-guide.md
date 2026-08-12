# Maintenance Guide - How to Update for 2027

## When IRS Publishes 2027 Figures (typically Oct 2026)

1. **Federal**: Update data/federal-2026.js -> create data/federal-2027.js
   - Source: IRS Rev Proc for 2027 (e.g., Rev Proc 2026-XX)
   - Brackets: single, MFJ, MFS, HoH
   - Standard deductions: single, MFJ, MFS, HoH
   - Verify with KPMG TaxNewsFlash and Ameriprise table
   - Update lastVerified, sourceUrl, confidence

2. **Limits**: Update data/limits-2026.js -> limits-2027.js
   - SS wage base: SSA fact sheet (Oct 2026)
   - 401k elective, catch-up 50+, enhanced 60-63 (IRS Notice)
   - HSA self/family/catch-up 55+ (Rev Proc)
   - Additional Medicare thresholds unchanged (statutory) but verify
   - Update source, sourceUrl

3. **State**: Update data/states-2026.js -> states-2027.js
   - Primary: Tax Foundation 2027 State Income Tax Rates and Brackets as of Jan 1 2027
   - Check each state DOR for mid-year changes (GA, NC, etc.)
   - Payroll taxes: CA EDD SDI rate, NY DFS PFL rate, NJ DOL TDI/FLI, WA ESD PFML, CO FAMLI, CT PFML, MA PFML, RI TDI, etc. - update wageBase and rate
   - Confidence: verified if official DOR source, else estimate

4. **Engine**: Update js/tax-engine/index.js
   - TAX_YEAR = 2027
   - ENGINE_VERSION = "2027.1.0"
   - No logic change needed unless law changes (e.g., new deduction type)

5. **Tests**: Update tests/run.js golden snapshot
   - Run node tests/run.js > docs/test-results-2027.md
   - Check forbidden values: grep for old 2026 values that are now legacy

6. **SOURCES.md**: Add new sources table for 2027

7. **Methodology**: Update methodology.html with new figures and pipeline if changed

8. **Deploy**: Cloudflare Pages auto-deploys from main branch. Verify https://us-salary-tools.pages.dev/ shows TAX_YEAR 2027

## How to Add New Deduction Type

1. Add to sanitizeInputs in validation.js
2. Add to classifyDeductions in deductions.js with reduces matrix
3. Add to calculateTaxableWages
4. Update deduction treatment matrix in methodology.html
5. Add test scenario

## How to Add Local Tax Modeling

Currently returns $0 + not modeled. To model:
1. Create data/local-2027.js with city/county rates
2. Update calculateLocalTax to accept zip/state/city and compute
3. Update state matrix localTax.exists and modeled flag
4. Update UI to show local tax breakdown
5. Update known limitations

## How to Update Withholding to Full Pub 15-T Table 2

Current simplified 5% uplift for multiple jobs. To implement full:
1. Implement Pub 15-T Worksheet 1 and percentage method tables
2. Add W-4 Step 2 checkbox logic using higher withholding tables
3. Update calculateFederalWithholding with Table 5 etc.
4. Add tests for multiple jobs scenario

## Versioning

- ENGINE_VERSION: semantic "YYYY.MINOR.PATCH" e.g., 2026.1.0
- TAX_YEAR: integer 2026
- Git tags: v2026.1.0

## Checklist for Annual Update

- [ ] IRS Rev Proc published? Update federal
- [ ] SSA wage base? Update limits
- [ ] IRS 401k/HSA? Update limits
- [ ] Tax Foundation 2027 state table? Update states
- [ ] State payroll tax rates? Update states
- [ ] Tests pass? node tests/run.js
- [ ] Grep sweep no legacy values?
- [ ] Methodology updated?
- [ ] SOURCES.md updated?
- [ ] Deploy and smoke test live site
