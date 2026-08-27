import { FEDERAL_2026 } from "../../data/federal-2026.js";
function phaseout(deduction,magi,threshold){ if (deduction<=0 || magi<=threshold) return Math.max(0,deduction); return Math.max(0,deduction-(Math.floor((magi-threshold)/1000)*100)); }
export function calculateFederalSpecialDeductions(federalTaxableWages,filingStatus,inputs={}){
  const d=inputs.federalDeductions||{};const magi=Math.max(0,federalTaxableWages+(inputs.w4?.otherIncome||0));const joint=filingStatus==="marriedJointly";
  const seniorEligible=(d.seniorDeductionEligible===true || (d.seniorDeductionEligible==null && (inputs.age||0)>=65)) && filingStatus!=="marriedSeparately";
  const overtime=phaseout(Math.min(d.qualifiedOvertime||0,joint?25000:12500),magi,joint?300000:150000);
  const tips=phaseout(Math.min(d.qualifiedTips||0,25000),magi,joint?300000:150000);
  const senior=seniorEligible?phaseout(6000,magi,joint?150000:75000):0;
  return {magi,qualifiedOvertimeRequested:d.qualifiedOvertime||0,qualifiedOvertimeDeduction:overtime,qualifiedTipsRequested:d.qualifiedTips||0,qualifiedTipsDeduction:tips,seniorDeduction:senior,totalAdditionalDeduction:overtime+tips+senior,notes:["Qualified overtime and tips deductions are federal income-tax deductions and do not reduce Social Security or Medicare wages.","The senior deduction models one taxpayer; spouse-level senior eligibility requires a separate spouse-age input."]};
}
export function calculateFederalTaxableIncome(federalTaxableWages,filingStatus,extraStandard=0,additionalDeductions=0){ const stdDed=FEDERAL_2026.standardDeduction[filingStatus]||FEDERAL_2026.standardDeduction.single;const totalDed=stdDed+(extraStandard||0)+(additionalDeductions||0);return {federalTaxableWages,standardDeduction:stdDed,extraStandard,additionalDeductions:additionalDeductions||0,totalDeduction:totalDed,federalTaxableIncome:Math.max(0,federalTaxableWages-totalDed)}; }
function bracketWalk(taxableIncome,brackets){ if (taxableIncome<=0) return 0;let tax=0;for(const b of brackets){if(taxableIncome<=b.min) continue;const upper=b.max===Infinity||b.max===null?taxableIncome:Math.min(taxableIncome,b.max);if(upper>b.min) tax+=(upper-b.min)*b.rate;if(taxableIncome<=b.max) break;}return tax; }
export function calculateFederalTax(federalTaxableIncome,filingStatus){ const brackets=FEDERAL_2026.brackets[filingStatus]||FEDERAL_2026.brackets.single;return {federalTaxableIncome,filingStatus,federalIncomeTax:Math.round(bracketWalk(federalTaxableIncome,brackets)*100)/100,bracketsApplied:brackets}; }
export function calculateFederalWithholding(federalTaxableWages,filingStatus,w4={},payPeriodsPerYear=26){
  const otherIncome=w4.otherIncome||0,deductions=w4.deductions||0,dependentAmount=w4.dependentAmount||0,extraWithholdingAnnual=(w4.extraWithholding||0)*payPeriodsPerYear;
  const adjustedWages=Math.max(0,federalTaxableWages+otherIncome-deductions);
  const stdInfo=calculateFederalTaxableIncome(adjustedWages,filingStatus),taxInfo=calculateFederalTax(stdInfo.federalTaxableIncome,filingStatus);
  const withholdingAnnual=Math.max(0,taxInfo.federalIncomeTax-dependentAmount)+extraWithholdingAnnual;
  return {method:"Annualized estimate based on 2026 federal rates; full IRS Pub. 15-T worksheet tables are not embedded yet",federalTaxableWages,adjustedWages,federalTaxableIncome:stdInfo.federalTaxableIncome,federalIncomeTaxAnnual:taxInfo.federalIncomeTax,dependentCredit:dependentAmount,extraWithholdingAnnual,federalWithholdingAnnual:Math.round(withholdingAnnual*100)/100,federalWithholdingPerPeriod:Math.round(withholdingAnnual/payPeriodsPerYear*100)/100,warnings:["Federal withholding is an estimate. For exact payroll withholding, use the 2026 IRS Pub. 15-T Percentage Method tables.",...(w4.multipleJobs?["Multiple-jobs W-4 Step 2 is not fully modeled; no arbitrary percentage uplift is applied."]:[])]};
}
