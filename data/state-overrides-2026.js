// Targeted 2026 overrides for rules that must not inherit duplicate/placeholder data.
// Keep this file small and sourced; unverified filing statuses are intentionally omitted.
export const STATE_OVERRIDES_2026 = {
  CA: {
    brackets: {
      marriedJointly: [
        { min: 0, max: 22158, rate: 0.01 },
        { min: 22158, max: 52528, rate: 0.02 },
        { min: 52528, max: 82904, rate: 0.04 },
        { min: 82904, max: 115084, rate: 0.06 },
        { min: 115084, max: 145448, rate: 0.08 },
        { min: 145448, max: 742958, rate: 0.093 },
        { min: 742958, max: 891542, rate: 0.103 },
        { min: 891542, max: 1485906, rate: 0.113 },
        { min: 1485906, max: 2000000, rate: 0.123 },
        { min: 2000000, max: Infinity, rate: 0.133 },
      ]
    },
    standardDeduction: { marriedJointly: 11080 },
    addOnTaxes: [
      { threshold: 1000000, rate: 0.01, name: "CA Behavioral Health Services Tax" }
    ]
  },
  WA: {
    employeePayrollTaxes: [
      { name: "WA PFML", rate: 0.008072, wageBase: 184500, appliesTo: "grossWages", source: "WA Paid Leave 2026: 1.13% total × 71.43% employee share", confidence: "verified" },
      { name: "WA Cares", rate: 0.0058, wageBase: null, appliesTo: "grossWages", source: "WA Cares 2026 employee premium", confidence: "verified" }
    ]
  }
};
export default STATE_OVERRIDES_2026;
