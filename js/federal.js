import { FEDERAL_2026 } from "../../data/federal-2026.js";
export function calculateFederalTaxableIncome(federalTaxableWages,filingStatus,extraStandard=0){
  const stdDed=FEDERAL_2026.standardDeduction[filingStatus]||FEDERAL_2026.standardDeduction.single;
  const totalDed=stdDed+(extraStandard||0);
  const taxable=Math.max(0,federalTaxableWages-totalDed);
  return {federalTaxableWages,standardDeduction:stdDed,extraStandard,totalDeduction:totalDed,federalTaxableIncome:taxable};
}
function bracketWalk(taxableIncome,brackets){
  if (taxableIncome<=0) return 0;
  let tax=0;
  for (const b of brackets){
    if (taxableIncome<=b.min) continue;
    const upper=b.max===Infinity||b.max===null?taxableIncome:Math.min(taxableIncome,b.max);
    const lower=b.min;
    if (upper>lower) tax+=(upper-lower)*b.rate;
    if (taxableIncome<=b.max) break;
  }
  return tax;
}
export function calculateFederalTax(federalTaxableIncome,filingStatus){
  const brackets=FEDERAL_2026.brackets[filingStatus]||FEDERAL_2026.brackets.single;
  const tax=bracketWalk(federalTaxableIncome,brackets);
  return {federalTaxableIncome,filingStatus,federalIncomeTax:Math.round(tax*100)/100,bracketsApplied:brackets};
}
export function calculateFederalWithholding(federalTaxableWages,filingStatus,w4,payPeriodsPerYear=26){
  const otherIncome=w4.otherIncome||0;
  const deductions=w4.deductions||0;
  const dependentAmount=w4.dependentAmount||0;
  const extraWithholdingAnnual=(w4.extraWithholding||0)*payPeriodsPerYear;
  let adjustedWages=federalTaxableWages+otherIncome-deductions;
  adjustedWages=Math.max(0,adjustedWages);
  const stdInfo=calculateFederalTaxableIncome(adjustedWages,filingStatus);
  const taxInfo=calculateFederalTax(stdInfo.federalTaxableIncome,filingStatus);
  let withholdingAnnual=Math.max(0,taxInfo.federalIncomeTax-dependentAmount)+extraWithholdingAnnual;
  if (w4.multipleJobs) withholdingAnnual*=1.05;
  return {
    method:"Pub 15-T Automated Payroll Systems (simplified)",
    federalTaxableWages,
    adjustedWages,
    federalTaxableIncome:stdInfo.federalTaxableIncome,
    federalIncomeTaxAnnual:taxInfo.federalIncomeTax,
    dependentCredit:dependentAmount,
    extraWithholdingAnnual,
    federalWithholdingAnnual:Math.round(withholdingAnnual*100)/100,
    federalWithholdingPerPeriod:Math.round((withholdingAnnual/payPeriodsPerYear)*100)/100,
    warnings:w4.multipleJobs?["Multiple jobs checkbox uses simplified 5% uplift - not full Pub 15-T Table 2"]:[]
  };
}
