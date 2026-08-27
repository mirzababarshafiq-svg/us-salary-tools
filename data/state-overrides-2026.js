// Targeted 2026 overrides for rules that must not inherit duplicate/placeholder data.
// CA uses the latest published FTB schedule available to this static engine (2025 schedule for 2026 estimates).
// Unverified filing statuses elsewhere are intentionally omitted and are refused by the engine.
export const STATE_OVERRIDES_2026 = {
  CA: {
    brackets: {
      marriedJointly: [
        { min: 0, max: 22158, rate: 0.01 }, { min: 22158, max: 52528, rate: 0.02 },
        { min: 52528, max: 82904, rate: 0.04 }, { min: 82904, max: 115084, rate: 0.06 },
        { min: 115084, max: 145448, rate: 0.08 }, { min: 145448, max: 742958, rate: 0.093 },
        { min: 742958, max: 891542, rate: 0.103 }, { min: 891542, max: 1485906, rate: 0.113 },
        { min: 1485906, max: 2000000, rate: 0.123 }, { min: 2000000, max: Infinity, rate: 0.133 }
      ],
      marriedSeparately: [
        { min: 0, max: 11079, rate: 0.01 }, { min: 11079, max: 26264, rate: 0.02 },
        { min: 26264, max: 41452, rate: 0.04 }, { min: 41452, max: 57542, rate: 0.06 },
        { min: 57542, max: 72724, rate: 0.08 }, { min: 72724, max: 371479, rate: 0.093 },
        { min: 371479, max: 445771, rate: 0.103 }, { min: 445771, max: 742953, rate: 0.113 },
        { min: 742953, max: 1000000, rate: 0.123 }, { min: 1000000, max: Infinity, rate: 0.133 }
      ],
      headOfHousehold: [
        { min: 0, max: 22173, rate: 0.01 }, { min: 22173, max: 52530, rate: 0.02 },
        { min: 52530, max: 67716, rate: 0.04 }, { min: 67716, max: 83805, rate: 0.06 },
        { min: 83805, max: 98990, rate: 0.08 }, { min: 98990, max: 505208, rate: 0.093 },
        { min: 505208, max: 606251, rate: 0.103 }, { min: 606251, max: 1010417, rate: 0.113 },
        { min: 1010417, max: Infinity, rate: 0.123 }
      ]
    },
    standardDeduction: { single: 5706, marriedJointly: 11412, marriedSeparately: 5706, headOfHousehold: 11412 },
    addOnTaxes: [{ threshold: 1000000, rate: 0.01, name: "CA Behavioral Health Services Tax" }]
  },
  WA: {
    employeePayrollTaxes: [
      { name: "WA PFML", rate: 0.008072, wageBase: 184500, appliesTo: "grossWages", source: "WA Paid Leave 2026: 1.13% total × 71.43% employee share", confidence: "verified" },
      { name: "WA Cares", rate: 0.0058, wageBase: null, appliesTo: "grossWages", source: "WA Cares 2026 employee premium", confidence: "verified" }
    ]
  }
};
export default STATE_OVERRIDES_2026;
