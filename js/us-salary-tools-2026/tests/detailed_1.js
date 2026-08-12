
import { calculateAll, calculateAllStates } from "../js/tax-engine/index.js";
import { sanitizeInputs } from "./js/tax-engine/validation.js";

const scenarios = [
  {id:1,desc:"$40k Single TX",input:{grossAnnual:40000,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:30}},
  {id:2,desc:"$50k Single CA",input:{grossAnnual:50000,filingStatus:"single",state:"CA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:30}},
  {id:3,desc:"$75k Single TX",input:{grossAnnual:75000,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:30}},
  {id:4,desc:"$75k Single CA",input:{grossAnnual:75000,filingStatus:"single",state:"CA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:30}},
  {id:5,desc:"$100k MFJ",input:{grossAnnual:100000,filingStatus:"marriedJointly",state:"CA",payFrequency:"annual",selectedPayPeriod:"monthly",deductions:{},age:30}},
  {id:6,desc:"$150k HoH",input:{grossAnnual:150000,filingStatus:"headOfHousehold",state:"NY",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:35}},
  {id:7,desc:"$250k Single",input:{grossAnnual:250000,filingStatus:"single",state:"NJ",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:40}},
  {id:8,desc:"$500k MFJ",input:{grossAnnual:500000,filingStatus:"marriedJointly",state:"CA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:45}},
  {id:9,desc:"$1M Single",input:{grossAnnual:1000000,filingStatus:"single",state:"CA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:50}},
  {id:10,desc:"$0 income",input:{grossAnnual:0,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:30}},
  {id:11,desc:"Empty input",input:{grossAnnual:0,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{}}},
  {id:12,desc:"Hourly non-default 30h x 48w @ $35",input:{grossAnnual:0,hourlyRate:35,hoursPerWeek:30,weeksPerYear:48,payFrequency:"hourly",filingStatus:"single",state:"TX",selectedPayPeriod:"weekly",deductions:{},age:28}},
  {id:13,desc:"Monthly input $6k/mo",input:{grossAnnual:6000,payFrequency:"monthly",filingStatus:"single",state:"TX",selectedPayPeriod:"monthly",deductions:{},age:30}},
  {id:14,desc:"Biweekly output",input:{grossAnnual:75000,payFrequency:"annual",filingStatus:"single",state:"TX",selectedPayPeriod:"biweekly",deductions:{},age:30}},
  {id:15,desc:"401k low income $20k 100% 401k",input:{grossAnnual:20000,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{traditional401k:20000},age:25}},
  {id:16,desc:"401k exceeding limit $300k 25%",input:{grossAnnual:300000,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{traditional401kPercent:25},age:35}},
  {id:17,desc:"HSA self-only",input:{grossAnnual:60000,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{hsa:4400,hsaCoverage:"self"},age:30}},
  {id:18,desc:"HSA family",input:{grossAnnual:80000,filingStatus:"marriedJointly",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{hsa:8750,hsaCoverage:"family"},age:32}},
  {id:19,desc:"Above SS wage base $200k",input:{grossAnnual:200000,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:40}},
  {id:20,desc:"Above Addl Medicare single $200k",input:{grossAnnual:250000,filingStatus:"single",state:"CA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:40}},
  {id:21,desc:"MFS Addl Medicare $125k threshold",input:{grossAnnual:150000,filingStatus:"marriedSeparately",state:"CA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:40}},
  {id:22,desc:"PA vs conforming 401k $80k + $10k 401k",input:{grossAnnual:80000,filingStatus:"single",state:"PA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{traditional401k:10000},age:35}},
  {id:23,desc:"NJ HSA non-conforming",input:{grossAnnual:80000,filingStatus:"single",state:"NJ",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{hsa:4400,hsaCoverage:"self"},age:35}},
  {id:24,desc:"CA $1,000,001 MHS surcharge",input:{grossAnnual:1000001,filingStatus:"single",state:"CA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:45}},
  {id:25,desc:"NY high + PFL/DBL",input:{grossAnnual:300000,filingStatus:"single",state:"NY",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:40}},
  {id:26,desc:"WA no income tax but PFML+WA Cares",input:{grossAnnual:100000,filingStatus:"single",state:"WA",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:35}},
  {id:27,desc:"No income tax TX",input:{grossAnnual:100000,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:35}},
  {id:28,desc:"Boundary $12,400",input:{grossAnnual:12400,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{},age:30}},
  {id:29,desc:"Roth vs traditional",input:{grossAnnual:80000,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{traditional401k:5000},age:35}},
  {id:30,desc:"Deductions exceeding gross $30k",input:{grossAnnual:30000,filingStatus:"single",state:"TX",payFrequency:"annual",selectedPayPeriod:"biweekly",deductions:{traditional401k:20000,hsa:10000},age:30}},
];

for (const scen of scenarios) {
  const sanitized = sanitizeInputs(scen.input);
  const res = (await import("../js/tax-engine/index.js")).calculateAll(sanitized);
  const row = {
    id: scen.id,
    desc: scen.desc,
    gross: res.grossAnnual,
    pretax401k: res.deductions.limits["401k"].applied,
    pretaxHSA: res.deductions.limits.hsa.applied,
    federalTaxable: res.federal.federalTaxableIncome,
    federalTax: res.federal.federalIncomeTax,
    stateTax: res.state.stateIncomeTax,
    local: res.local.localIncomeTax,
    ss: res.fica.socialSecurity.socialSecurityTax,
    medicare: res.fica.medicare.medicareTax,
    addlMed: res.fica.additionalMedicare.additionalMedicareWithholding,
    statePayroll: res.state.payroll.totalStatePayrollTax,
    totalTax: res.totals.totalTaxes,
    netAnnual: res.totals.netAnnual,
    netMonthly: res.totals.netMonthly,
    netPerPeriod: res.totals.netPerSelectedPeriod,
    effectiveRate: res.totals.effectiveTaxRate,
    takeHome: res.totals.takeHomePercent,
    confidence: res.confidence.overall,
    warnings: res.warnings.join("; ")
  };
  console.log(JSON.stringify(row));
}
