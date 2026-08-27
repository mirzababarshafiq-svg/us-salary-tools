import { FEDERAL_2026 } from "../../data/federal-2026.js";

function phaseout(deduction,magi,threshold,joint=false){
  if (deduction<=0 || magi<=threshold) return Math.max(0,deduction);
  const excess=magi-threshold;
  return Math.max(0,deduction-(Math.floor(excess/1000)*100));
}

export function calculateFederalSpecialDeductions(federalTaxableWages,filingStatus,inputs={}){
  const d=inputs.federalDeductions||{};
  const magi=Math.max(0,federalTaxableWages+(inputs.w4?.otherIncome||0));
  const joint=filingStatus==="marriedJointly";
  const overtimeCap=joint?25000:12500;
  const overtimeEligible=filingStatus!=="marriedSeparately";
  const tipsEligible=filingStatus!=="marriedSeparately";
  const seniorEligible=d.seniorDeductionEligible===true || (d.seniorDeductionEligible==null && (inputs.age||0)>=65);
  const seniorEligibleByStatus=seniorEligible && (filingStatus!=="marriedSeparately");
  const seniorCap=seniorEligibleByStatus?6000:0;
  const overtime=phaseout(Math.min(d.qualifiedOvertime||0,overtimeCap),magi,joint?300000:150000,joint);
  const tips=phaseout(Math.min(d.qualifiedTips||0,25000),magi,joint?300000:150000,joint);
  const senior=phaseout(seniorCap,magi,joint?150000:75000,joint);
  return {
    magi,
    qualifiedOvertimeRequested:d.qualifiedOvertime||0,
    qualifiedOvertimeDeduction:overtime,
    qualifiedTipsRequested:d.qualifiedTips||0,
    qualifiedTipsDeduction:tips,
    seniorDeduction:senior,
    totalAdditionalDeduction:overtime+tips+senior,
    notes:[
      "Qualified overtime and tips deductions are federal income-tax deductions and generally do not reduce Social Security or Medicare wages.",
      "Senior enhanced deduction is modeled for the taxpayer only; spouse-level senior eligibility requires a separate input in a future version."
    ]
  };
}

export function calculateFederalTaxableIncome(federalTaxableWages,filingStatus,extraStandard=0,additionalDeductions=0){
  const stdDed=FEDERAL_2026.standardDeduction[filingStatus]||FEDERAL_2026.standardDeduction.single;
  const totalDed=stdDed+(extraStandard||0)+(additionalDeductions||0);
  const taxable=Math.max(0,federalTaxableWages-totalDed);
  return {federalTaxableWages,standardDeduction:stdDed,extraStandard,additionalDeductions:additionalDeductions||0,totalDeduction:totalDed,federalTaxableIncome:taxable};
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
export function calculateFederalWithholding(federalTaxableWages,filingStatus,w4={},payPeriodsPerYear=26){
  const otherIncome=w4.otherIncome||0;
  const deductions=w4.deductions||0;
  const dependentAmount=w4.dependentAmount||0;
  const extraWithholdingAnnual=(w4.extraWithholding||0)*payPeriodsPerYear;
  let adjustedWages=Math.max(0,federalTaxableWages+otherIncome-deductions);
  const stdInfo=calculateFederalTaxableIncome(adjustedWages,filingStatus);
  const taxInfo=calculateFederalTax(stdInfo.federalTaxableIncome,filingStatus);
  let withholdingAnnual=Math.max(0,taxInfo.federalIncomeTax-dependentAmount)+extraWithholdingAnnual;
  if (w4.multipleJobs) withholdingAnnual*=2;
  return {
    method:"Annualized estimate based on 2026 federal rates; full IRS Pub. 15-T worksheet tables are not embedded yet",
    federalTaxableWages,adjustedWages,federalTaxableIncome:stdInfo.federalTaxableIncome,
    federalIncomeTaxAnnual:taxInfo.federalIncomeTax,dependentCredit:dependentAmount,extraWithholdingAnnual,
    federalWithholdingAnnual:Math.round(withholdingAnnual*100)/100,
    federalWithholdingPerPeriod:Math.round((withholdingAnnual/payPeriodsPerYear)*100)/100,
    warnings:["Federal withholding is an estimate. For exact payroll withholding, the full 2026 Pub. 15-T Percentage Method tables should be used.",...(w4.multipleJobs?["Multiple-jobs W-4 Step 2 is modeled conservatively at 2x; this is not a substitute for the IRS worksheet."]:[])]
  };
}
