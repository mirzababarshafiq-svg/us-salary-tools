// 2026 Federal Income Tax data — IRS Revenue Procedure 2025-32 (published Oct 9, 2025).
// Applies to income earned Jan 1 - Dec 31, 2026, filed in early 2027.
// Rates (10/12/22/24/32/35/37%) unchanged from 2025; thresholds indexed for inflation
// under the One Big Beautiful Bill Act (OBBBA, P.L. 119-21).
export const FEDERAL_2026 = {
  standardDeduction: {
    single: 16100,
    marriedJointly: 32200,
    marriedSeparately: 16100,
    headOfHousehold: 24150
  },
  brackets: {
    single: [
      { min: 0,       max: 12400,    rate: 0.10 },
      { min: 12400,   max: 50400,    rate: 0.12 },
      { min: 50400,   max: 105700,   rate: 0.22 },
      { min: 105700,  max: 201775,   rate: 0.24 },
      { min: 201775,  max: 256225,   rate: 0.32 },
      { min: 256225,  max: 640600,   rate: 0.35 },
      { min: 640600,  max: Infinity, rate: 0.37 }
    ],
    marriedJointly: [
      { min: 0,       max: 24800,    rate: 0.10 },
      { min: 24800,   max: 100800,   rate: 0.12 },
      { min: 100800,  max: 211400,   rate: 0.22 },
      { min: 211400,  max: 403550,   rate: 0.24 },
      { min: 403550,  max: 512450,   rate: 0.32 },
      { min: 512450,  max: 768700,   rate: 0.35 },
      { min: 768700,  max: Infinity, rate: 0.37 }
    ],
    marriedSeparately: [
      { min: 0,       max: 12400,    rate: 0.10 },
      { min: 12400,   max: 50400,    rate: 0.12 },
      { min: 50400,   max: 105700,   rate: 0.22 },
      { min: 105700,  max: 201775,   rate: 0.24 },
      { min: 201775,  max: 256225,   rate: 0.32 },
      { min: 256225,  max: 384350,   rate: 0.35 },
      { min: 384350,  max: Infinity, rate: 0.37 }
    ],
    headOfHousehold: [
      { min: 0,       max: 17700,    rate: 0.10 },
      { min: 17700,   max: 67450,    rate: 0.12 },
      { min: 67450,   max: 105700,   rate: 0.22 },
      { min: 105700,  max: 201750,   rate: 0.24 },
      { min: 201750,  max: 256200,   rate: 0.32 },
      { min: 256200,  max: 640600,   rate: 0.35 },
      { min: 640600,  max: Infinity, rate: 0.37 }
    ]
  }
};
export default FEDERAL_2026;
