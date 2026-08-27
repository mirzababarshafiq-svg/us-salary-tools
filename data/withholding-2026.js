// 2026 IRS Publication 15-T Percentage Method tables for automated payroll systems.
// Source: IRS Publication 15-T (2026), Section 1, Annual Percentage Method tables.
// The annual schedules are applied to the annualized wage amount and divided by
// the IRS payroll-period count in Worksheet 1A. Step 2 checkbox uses the
// separate Form W-4 Step 2 schedule.

const row = (a, b, c, rate) => ({ min: a, max: b, baseTax: c, rate });

export const WITHHOLDING_2026 = {
  source: "IRS Publication 15-T (2026), Section 1, Worksheet 1A",
  sourceUrl: "https://www.irs.gov/publications/p15t",
  periods: { semiannually: 2, quarterly: 4, monthly: 12, semimonthly: 24, biweekly: 26, weekly: 52, daily: 260 },
  standardAdjustment: { marriedJointly: 12900, other: 8600 },
  schedules: {
    marriedJointly: {
      standard: [
        row(0, 19300, 0, 0), row(19300, 44100, 0, 0.10), row(44100, 120100, 2480, 0.12),
        row(120100, 230700, 11600, 0.22), row(230700, 422850, 35932, 0.24),
        row(422850, 531750, 82048, 0.32), row(531750, 788000, 116896, 0.35), row(788000, Infinity, 206583.50, 0.37)
      ],
      step2: [
        row(0, 16100, 0, 0), row(16100, 28500, 0, 0.10), row(28500, 66500, 1240, 0.12),
        row(66500, 121800, 5800, 0.22), row(121800, 217875, 17966, 0.24),
        row(217875, 272325, 41024, 0.32), row(272325, 400450, 58448, 0.35), row(400450, Infinity, 103291.75, 0.37)
      ]
    },
    single: {
      standard: [
        row(0, 7500, 0, 0), row(7500, 19900, 0, 0.10), row(19900, 57900, 1240, 0.12),
        row(57900, 113200, 5800, 0.22), row(113200, 209275, 17966, 0.24),
        row(209275, 263725, 41024, 0.32), row(263725, 648100, 58448, 0.35), row(648100, Infinity, 192979.25, 0.37)
      ],
      step2: [
        row(0, 8050, 0, 0), row(8050, 14250, 0, 0.10), row(14250, 33250, 620, 0.12),
        row(33250, 60900, 2900, 0.22), row(60900, 108938, 8983, 0.24),
        row(108938, 136163, 20512, 0.32), row(136163, 328350, 29224, 0.35), row(328350, Infinity, 96489.63, 0.37)
      ]
    },
    marriedSeparately: {
      standard: [
        row(0, 7500, 0, 0), row(7500, 19900, 0, 0.10), row(19900, 57900, 1240, 0.12),
        row(57900, 113200, 5800, 0.22), row(113200, 209275, 17966, 0.24),
        row(209275, 263725, 41024, 0.32), row(263725, 648100, 58448, 0.35), row(648100, Infinity, 192979.25, 0.37)
      ],
      step2: [
        row(0, 8050, 0, 0), row(8050, 14250, 0, 0.10), row(14250, 33250, 620, 0.12),
        row(33250, 60900, 2900, 0.22), row(60900, 108938, 8983, 0.24),
        row(108938, 136163, 20512, 0.32), row(136163, 328350, 29224, 0.35), row(328350, Infinity, 96489.63, 0.37)
      ]
    },
    headOfHousehold: {
      standard: [
        row(0, 15550, 0, 0), row(15550, 33250, 0, 0.10), row(33250, 83000, 1770, 0.12),
        row(83000, 121250, 7740, 0.22), row(121250, 217300, 16155, 0.24),
        row(217300, 271750, 39207, 0.32), row(271750, 656150, 56631, 0.35), row(656150, Infinity, 191171, 0.37)
      ],
      step2: [
        row(0, 12075, 0, 0), row(12075, 20925, 0, 0.10), row(20925, 45800, 885, 0.12),
        row(45800, 64925, 3870, 0.22), row(64925, 112950, 8077.50, 0.24),
        row(112950, 140175, 19603.50, 0.32), row(140175, 332375, 28315.50, 0.35), row(332375, Infinity, 95585.50, 0.37)
      ]
    }
  }
};

export default WITHHOLDING_2026;
