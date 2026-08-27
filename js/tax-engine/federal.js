import { FEDERAL_2026 } from "../../data/federal-2026.js";
import { WITHHOLDING_2026 } from "../../data/withholding-2026.js";

function phaseout(deduction, magi, threshold){
  if (deduction<=0 || magi<=threshold) return Math.max(0,deduction);
  return Math.max(0,deduction-(Math.floor((magi-threshold)/1000)*100));
}

export function calculateFederalSpecialDeductions(federalTaxableWages,filingStatus,inputs={}){
  const d=inputs.federalDeductions||{};
  const magi=Math.max(0,federalTaxableWages+(inputs.w4?.otherIncome||0));
  const joint=filingStatus==="marriedJointly";
  const seniorEligible=(d.seniorDeductionEligible===true || (d.seniorDeductionEligible==null && (inputs.age||0)>=65)) && (inputs.age||0)>=65;
  const overtimeCap=joint?25000:12500;
  const overtime=phaseout(Math.min(d.qualifiedOvertime||0,overtimeCap),magi,joint?300000:150000);
  const tips=phaseout(Math.min(d.qualifiedTips||0,25000),magi,joint?300000:150000);
  const senior=seniorEligible?phaseout(6000,magi,joint?150000:75000):0;
  const carLoan=phaseout(Math.min(d.qualifiedCarLoanInterest||0,10000),magi,joint?200000:100000);
  const warnings=[];
  if (d.qualifiedCarLoanInterest>0) warnings.push("Qualified car-loan-interest eligibility is assumed for the supplied amount; vehicle/use requirements are not independently verified.");
  return {
    magi,
    qualifiedOvertimeRequested:d.qualifiedOvertime||0,
    qualifiedOvertimeDeduction:overtime,
    qualifiedTipsRequested:d.qualifiedTips||0,
    qualifiedTipsDeduction:tips,
    seniorDeduction:senior,
    qualifiedCarLoanInterestRequested:d.qualifiedCarLoanInterest||0,
    qualifiedCarLoanInterestDeduction:carLoan,
    totalAdditionalDeduction:overtime+tips+senior+carLoan,
    notes:[
      "Qualified overtime, tips, senior and qualified car-loan-interest deductions are federal income-tax deductions and do not reduce Social Security or Medicare wages.",
      "The senior deduction models one taxpayer; spouse-level senior eligibility requires a separate spouse-age input."
    ],
    warnings
  };
}

export function calculateFederalTaxableIncome(federalTaxableWages,filingStatus,extraStandard=0,additionalDeductions=0){
  const stdDed=FEDERAL_2026.standardDeduction[filingStatus]||FEDERAL_2026.standardDeduction.single;
  const totalDed=stdDed+(extraStandard||0)+(additionalDeductions||0);
  return {federalTaxableWages,standardDeduction:stdDed,extraStandard,additionalDeductions:additionalDeductions||0,totalDeduction:totalDed,federalTaxableIncome:Math.max(0,federalTaxableWages-totalDed)};
}

function bracketWalk(taxableIncome,brackets){
  if (taxableIncome<=0) return 0;
  let tax=0;
  for(const b of brackets){
    if(taxableIncome<=b.min) continue;
    const upper=b.max===Infinity||b.max===null?taxableIncome:Math.min(taxableIncome,b.max);
    if(upper>b.min) tax+=(upper-b.min)*b.rate;
    if(taxableIncome<=b.max) break;
  }
  return tax;
}

export function calculateFederalTax(federalTaxableIncome,filingStatus){
  const brackets=FEDERAL_2026.brackets[filingStatus]||FEDERAL_2026.brackets.single;
  return {federalTaxableIncome,filingStatus,federalIncomeTax:Math.round(bracketWalk(federalTaxableIncome,brackets)*100)/100,bracketsApplied:brackets};
}

function scheduleAmount(adjustedAnnualWages,schedule){
  const wage=Math.max(0,adjustedAnnualWages);
  let current=schedule[schedule.length-1];
  for(const row of schedule){
    if(wage>=row.min && wage<row.max){ current=row; break; }
  }
  return Math.max(0,current.baseTax+(wage-current.min)*current.rate);
}

export function calculateFederalWithholding(federalTaxableWages,filingStatus,w4={},payPeriodsPerYear=26,specialDeductions=0){
  const periods=WITHHOLDING_2026.periods;
  const normalizedPeriods=payPeriodsPerYear>0?payPeriodsPerYear:26;
  const periodName=Object.keys(periods).find(k=>periods[k]===normalizedPeriods);
  const hasValidIrspayPeriod=!!periodName;
  const multipleJobs=!!(w4.step2Checkbox ?? w4.multipleJobs);
  const step3Amount=Math.max(0,w4.step3Amount ?? w4.dependentAmount ?? 0);
  const step4a=Math.max(0,w4.step4aOtherIncome ?? w4.otherIncome ?? 0);
  const step4b=Math.max(0,w4.step4bDeductions ?? w4.deductions ?? 0);
  const step4cPerPeriod=Math.max(0,w4.step4cExtraWithholding ?? w4.extraWithholding ?? 0);
  const exempt=!!w4.exempt;

  if(exempt){
    return {method:"IRS Pub. 15-T (2026) Worksheet 1A",exempt:true,federalWithholdingAnnual:0,federalWithholdingPerPeriod:0,adjustedAnnualWageAmount:0,tentativeWithholdingAnnual:0,step3AnnualCredit:step3Amount,step4cPerPeriod:step4cPerPeriod,warnings:["Federal income-tax withholding is $0 because the W-4 exemption election is selected."]};
  }

  if(!hasValidIrspayPeriod){
    const adjustedWages=Math.max(0,federalTaxableWages+step4a-specialDeductions-step4b);
    const annualTax=calculateFederalTax(calculateFederalTaxableIncome(adjustedWages,filingStatus).federalTaxableIncome,filingStatus).federalIncomeTax;
    const annual=Math.max(0,annualTax-step3Amount)+(step4cPerPeriod*normalizedPeriods);
    return {method:"IRS-style annualized fallback (no Pub. 15-T annual payroll period)",adjustedAnnualWageAmount:adjustedWages,tentativeWithholdingAnnual:Math.max(0,annualTax-step3Amount),federalWithholdingAnnual:Math.round(annual*100)/100,federalWithholdingPerPeriod:Math.round(annual/normalizedPeriods*100)/100,step3AnnualCredit:step3Amount,step4cPerPeriod:step4cPerPeriod,warnings:["The selected payroll period is not one of the 2026 IRS Pub. 15-T Worksheet 1A periods; annualized fallback used."]};
  }

  const standardAdj=filingStatus==="marriedJointly"?WITHHOLDING_2026.standardAdjustment.marriedJointly:WITHHOLDING_2026.standardAdjustment.other;
  const adjustedAnnual=Math.max(0,(Math.max(0,federalTaxableWages)*normalizedPeriods)+step4a-specialDeductions-step4b-standardAdj*(multipleJobs?0:1));
  const scheduleSet=WITHHOLDING_2026.schedules[filingStatus]||WITHHOLDING_2026.schedules.single;
  const schedule=multipleJobs?scheduleSet.step2:scheduleSet.standard;
  const annualTableTax=scheduleAmount(adjustedAnnual,schedule);
  const tentativePerPeriod=annualTableTax/normalizedPeriods;
  const creditPerPeriod=step3Amount/normalizedPeriods;
  const finalPerPeriod=Math.max(0,tentativePerPeriod-creditPerPeriod)+step4cPerPeriod;
  const finalAnnual=finalPerPeriod*normalizedPeriods;

  return {method:"IRS Pub. 15-T (2026) Worksheet 1A — Percentage Method",payrollPeriod:periodName,payPeriodsPerYear:normalizedPeriods,step2Checkbox:multipleJobs,step4aOtherIncome:step4a,step4bDeductions:step4b,federalSpecialDeductionsUsed:specialDeductions,standardAdjustmentApplied:standardAdj*(multipleJobs?0:1),adjustedAnnualWageAmount:Math.round(adjustedAnnual*100)/100,tentativeWithholdingAnnual:Math.round(annualTableTax*100)/100,tentativeWithholdingPerPeriod:Math.round(tentativePerPeriod*100)/100,step3AnnualCredit:step3Amount,step3CreditPerPeriod:Math.round(creditPerPeriod*100)/100,step4cPerPeriod:step4cPerPeriod,federalWithholdingAnnual:Math.round(finalAnnual*100)/100,federalWithholdingPerPeriod:Math.round(finalPerPeriod*100)/100,warnings:[]};
}
