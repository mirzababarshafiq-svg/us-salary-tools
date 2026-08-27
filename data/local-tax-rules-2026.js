/**
 * Verified 2026 local individual income tax rules.
 * Rates are intentionally limited to jurisdictions with clearly published rules.
 * Unknown/local jurisdictions remain explicitly unmodeled rather than guessed.
 */
export const LOCAL_TAX_RULES_2026 = {
  NYC: {
    name: "New York City",
    state: "NY",
    type: "progressive",
    residentOnly: true,
    standardDeduction: { single: 8000, marriedJointly: 16050, headOfHousehold: 11200 },
    brackets: {
      single: [
        { min: 0, max: 12000, rate: 0.03078 },
        { min: 12000, max: 25000, rate: 0.03762 },
        { min: 25000, max: 50000, rate: 0.03819 },
        { min: 50000, max: Infinity, rate: 0.03876 },
      ],
      marriedJointly: [
        { min: 0, max: 21600, rate: 0.03078 },
        { min: 21600, max: 45000, rate: 0.03762 },
        { min: 45000, max: 90000, rate: 0.03819 },
        { min: 90000, max: Infinity, rate: 0.03876 },
      ],
      headOfHousehold: [
        { min: 0, max: 14400, rate: 0.03078 },
        { min: 14400, max: 30000, rate: 0.03762 },
        { min: 30000, max: 60000, rate: 0.03819 },
        { min: 60000, max: Infinity, rate: 0.03876 },
      ],
    },
    source: "NYC / NYS published NYC PIT schedule",
    sourceUrl: "https://www.tax.ny.gov/forms/current-forms/it/it201i.htm",
    confidence: "verified",
  },
  PHILADELPHIA: {
    name: "Philadelphia",
    state: "PA",
    type: "flat",
    residentRate: 0.03735,
    nonResidentRate: 0.03425,
    source: "City of Philadelphia 2026 Wage/Earnings Tax rates",
    sourceUrl: "https://www.phila.gov/services/business-self-employment/business-taxes/wage-tax-employers/",
    confidence: "verified",
  },
  DETROIT: {
    name: "Detroit",
    state: "MI",
    type: "flat",
    residentRate: 0.024,
    nonResidentRate: 0.012,
    source: "City of Detroit Income Tax rates",
    sourceUrl: "https://detroitmi.gov/departments/office-chief-financial-officer/ocfo-divisions/office-treasury/income-tax/income-tax-information",
    confidence: "verified",
  },
};
