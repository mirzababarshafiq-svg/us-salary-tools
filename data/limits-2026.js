export const LIMITS_2026 = {
  taxYear: 2026,
  basisYear: 2026,
  lastVerified: "2026-05-13",
  socialSecurity: {
    rate: 0.062,
    wageBase: 184500,
    maxTax: 11439.00,
    source: "SSA 2026 Fact Sheet, EY Tax Alert 2025-2158",
    sourceUrl: "https://taxnews.ey.com/news/2025-2158-social-security-wage-base-to-increase-in-2026",
    confidence: "verified"
  },
  medicare: {
    rate: 0.0145,
    additionalRate: 0.009,
    thresholds: {
      single: 200000,
      headOfHousehold: 200000,
      marriedJointly: 250000,
      marriedSeparately: 125000
    },
    withholdingTrigger: 200000,
    source: "IRS Pub 15, IRS Pub 15-T, EY Tax Alert",
    sourceUrl: "https://www.irs.gov/publications/p15",
    confidence: "verified"
  },
  "401k": {
    electiveDeferralLimit: 24500,
    catchUp50: 8000,
    enhancedCatchUp60_63: 11250,
    overallLimit: 72000,
    overallWithCatchUp50: 80000,
    overallWithCatchUp60_63: 83250,
    compensationLimit: 360000,
    source: "IRS Notice 2025-66, IRS retirement topics 401k limits",
    sourceUrl: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits",
    lastVerified: "2026-05-13",
    confidence: "verified"
  },
  hsa: {
    selfOnly: 4400,
    family: 8750,
    catchUp55: 1000,
    source: "IRS Rev Proc 2025-19",
    sourceUrl: "https://www.irs.gov/pub/irs-drop/rp-25-19.pdf",
    lastVerified: "2026-05-13",
    confidence: "verified"
  },
  supplementalWage: {
    flatRate: 0.22,
    mandatoryHighRate: 0.37,
    threshold: 1000000,
    source: "IRS Pub 15, Pub 15-T",
    confidence: "verified"
  }
};
export default LIMITS_2026;
