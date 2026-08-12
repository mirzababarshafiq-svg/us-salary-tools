# Known Limitations - 2026 Engine v2026.1.0

## Explicitly Not Modeled (per requirements and disclosed)

- **Local/city/county income taxes**: $0 + not modeled flag. Excluded: New York City, Yonkers, Pennsylvania EIT/LST (0.5-3%), Ohio municipal (0-3%), Maryland county (2.25-3.2%), Missouri Kansas City/St. Louis, Indiana county (0.5-3%), Michigan cities, Kentucky/Alabama occupational, New York MCTMT. Reason: local rates vary by jurisdiction and require address-level data.

- **Itemized deductions**: Only standard deduction modeled. Itemized (state/local tax cap, mortgage interest, charitable) not included.

- **Tax credits**: Only W-4 dependentAmount (Step 3) modeled as annual credit subtracted from withholding. EITC, child tax credit beyond W-4, education credits, etc. not modeled.

- **Capital gains, dividends, self-employment, rental, etc.**: Only wage income. Washington capital gains tax (7% on gains) excluded - noted as "Capital gains income only" in Tax Foundation table.

- **State-specific credits/exemptions beyond standard deduction/personal exemption**: e.g., CT property tax credit, etc. Not modeled - simplified.

- **Recapture / phase-outs**: CT and NY tax benefit recapture for high income, MD county phase-outs, etc. Simplified brackets.

- **Multiple jobs**: Pub 15-T Table 2 not fully implemented - simplified 5% uplift with warning. User should use IRS withholding estimator for exact.

- **Pre-tax deduction ordering**: Assumes all pretax reduces state where conforming, but PA special case handled. Complex interactions (e.g., 401k + HSA exceeding compensation limit) clamped.

- **State payroll tax employee vs employer split**: Some states split (WA PFML 1.13% total, employee ~0.71% used). For small employers (<10), CO FAMLI employer share not required but we use employee 0.44%. Disclosed as estimate where applicable.

- **Future legislative changes**: GA HB 463 retroactive to Jan 1 2026 included (4.99%), but other states may pass mid-year 2026 changes not yet published as of Feb 11 2026 Tax Foundation baseline. Confidence flagged estimate.

- **Non-resident, part-year, remote work**: Only single state calculation, no apportionment.

- **Year-to-date, per-paycheck cap progression**: Annual liability model, not per-paycheck YTD cap tracking. SS cap modeled as annual min(wages, $184,500) not per paycheck YTD. Per-paycheck capping logic noted as future enhancement.

## Warnings Displayed

- Capped 401k/HSA
- Deductions exceed gross
- Multiple jobs simplified
- Estimate confidence for states without official 2026 tables
- Local taxes not included
- Effective rate definition

## Compliance Notes

- This is a 2026 take-home pay estimate, not exact withholding. Estimate only - not tax advice.
- Withholding realism Option A implemented per Pub 15-T Automated Payroll Systems, not exact IRS tables.
- All sources cited with URLs and verified dates in data/SOURCES.md
