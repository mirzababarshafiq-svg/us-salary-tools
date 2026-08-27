import { STATES_2026 } from "../../data/states-2026.js";

export function sanitizeInputs(raw={}){
  const cleanNumber=(v)=>{
    if (v==null || v==="") return 0;
    if (typeof v==="number") return v;
    let s=String(v).trim();
    if (/e/i.test(s)) return NaN;
    s=s.replace(/[$,%\s]/g,"");
    if (s.includes(".") && s.includes(",") && s.lastIndexOf(",")>s.lastIndexOf(".")) s=s.replace(/\./g,"").replace(/,/g,".");
    else s=s.replace(/,/g,"");
    const n=parseFloat(s);
    return isNaN(n)?NaN:n;
  };
  const out={};
  out.grossAnnual=cleanNumber(raw.grossAnnual ?? raw.annualSalary ?? raw.salary ?? 0);
  out.payFrequency=raw.payFrequency||"annual";
  out.hoursPerWeek=cleanNumber(raw.hoursPerWeek ?? 40);
  out.weeksPerYear=cleanNumber(raw.weeksPerYear ?? 52);
  out.daysPerYear=cleanNumber(raw.daysPerYear ?? 260);
  out.hourlyRate=cleanNumber(raw.hourlyRate ?? 0);
  out.filingStatus=raw.filingStatus||"single";
  out.state=(raw.state||"").toUpperCase();
  out.age=cleanNumber(raw.age ?? 0);
  out.isBlind=!!raw.isBlind;
  out.age65=!!raw.age65;
  out.deductions={
    traditional401k:cleanNumber(raw.deductions?.traditional401k ?? raw.traditional401k ?? 0),
    roth401k:cleanNumber(raw.deductions?.roth401k ?? 0),
    hsa:cleanNumber(raw.deductions?.hsa ?? raw.hsa ?? 0),
    hsaCoverage:raw.deductions?.hsaCoverage||raw.hsaCoverage||"self",
    healthPremiums:cleanNumber(raw.deductions?.healthPremiums ?? 0),
    fsa:cleanNumber(raw.deductions?.fsa ?? 0),
    otherPretax:cleanNumber(raw.deductions?.otherPretax ?? 0),
    postTax:cleanNumber(raw.deductions?.postTax ?? 0),
    traditional401kPercent:cleanNumber(raw.deductions?.traditional401kPercent ?? raw.traditional401kPercent ?? 0),
  };
  out.federalDeductions={
    qualifiedTips:cleanNumber(raw.federalDeductions?.qualifiedTips ?? raw.qualifiedTips ?? 0),
    qualifiedOvertime:cleanNumber(raw.federalDeductions?.qualifiedOvertime ?? raw.qualifiedOvertime ?? 0),
    qualifiedCarLoanInterest:cleanNumber(raw.federalDeductions?.qualifiedCarLoanInterest ?? raw.qualifiedCarLoanInterest ?? 0),
    seniorDeductionEligible:raw.federalDeductions?.seniorDeductionEligible ?? raw.seniorDeductionEligible ?? null,
  };
  const rw=raw.w4||{};
  out.w4={
    multipleJobs:!!(rw.step2Checkbox ?? rw.multipleJobs),
    step2Checkbox:!!(rw.step2Checkbox ?? rw.multipleJobs),
    dependentAmount:cleanNumber(rw.dependentAmount ?? rw.step3Amount ?? 0),
    step3Amount:cleanNumber(rw.step3Amount ?? rw.dependentAmount ?? 0),
    otherIncome:cleanNumber(rw.otherIncome ?? rw.step4aOtherIncome ?? 0),
    step4aOtherIncome:cleanNumber(rw.step4aOtherIncome ?? rw.otherIncome ?? 0),
    deductions:cleanNumber(rw.deductions ?? rw.step4bDeductions ?? 0),
    step4bDeductions:cleanNumber(rw.step4bDeductions ?? rw.deductions ?? 0),
    extraWithholding:cleanNumber(rw.extraWithholding ?? rw.step4cExtraWithholding ?? 0),
    step4cExtraWithholding:cleanNumber(rw.step4cExtraWithholding ?? rw.extraWithholding ?? 0),
    exempt:!!rw.exempt,
  };
  out.selectedPayPeriod=raw.selectedPayPeriod||raw.payFrequency||"biweekly";
  return out;
}

export function validateInputs(sanitized){
  const errors=[];const warnings=[];
  const {grossAnnual,hoursPerWeek,weeksPerYear,filingStatus,state}=sanitized;
  if (!isFinite(grossAnnual) || isNaN(grossAnnual)) errors.push({field:"grossAnnual",message:"Salary must be valid number"});
  else if (grossAnnual<0) errors.push({field:"grossAnnual",message:"Salary cannot be negative"});
  else if (grossAnnual>1e12) errors.push({field:"grossAnnual",message:"Salary exceeds max $1T"});
  if (!["single","marriedJointly","marriedSeparately","headOfHousehold"].includes(filingStatus)) errors.push({field:"filingStatus",message:"Invalid filing status"});
  if (!state) errors.push({field:"state",message:"Select a state before calculating state/local taxes"});
  else if (!STATES_2026[state]) errors.push({field:"state",message:`Unknown state code ${state}`});
  if (hoursPerWeek<0 || hoursPerWeek>168) errors.push({field:"hoursPerWeek",message:"Hours per week 0-168"});
  if (weeksPerYear<0 || weeksPerYear>52) errors.push({field:"weeksPerYear",message:"Weeks per year 0-52"});
  const d=sanitized.deductions;
  const totalPretax=(d.traditional401k||0)+(d.hsa||0)+(d.healthPremiums||0)+(d.fsa||0)+(d.otherPretax||0);
  if (totalPretax>sanitized.grossAnnual && sanitized.grossAnnual>0) warnings.push({field:"deductions",message:"Pre-tax deductions exceed gross and will be clamped"});
  if (d.traditional401kPercent<0 || d.traditional401kPercent>100) errors.push({field:"traditional401kPercent",message:"401k percent 0-100"});
  if (!['self','family'].includes(d.hsaCoverage)) errors.push({field:"hsaCoverage",message:"HSA coverage must be self or family"});
  for (const [k,v] of Object.entries(d)) { if (typeof v==="number" && !isFinite(v)) errors.push({field:k,message:`Invalid deduction ${k}`}); if (typeof v==="number" && v<0) errors.push({field:k,message:`Deduction ${k} cannot be negative`}); }
  for (const [k,v] of Object.entries(sanitized.federalDeductions)) if (typeof v==="number" && (!isFinite(v)||v<0)) errors.push({field:k,message:`Invalid federal deduction ${k}`});
  const w=sanitized.w4;
  for (const [k,v] of Object.entries({step3Amount:w.step3Amount,step4aOtherIncome:w.step4aOtherIncome,step4bDeductions:w.step4bDeductions,step4cExtraWithholding:w.step4cExtraWithholding})) if (!isFinite(v)||v<0) errors.push({field:k,message:`${k} must be zero or greater`});
  if (sanitized.federalDeductions.seniorDeductionEligible===true && sanitized.age<65) warnings.push({field:"seniorDeductionEligible",message:"Senior deduction eligibility was requested but age is under 65"});
  return {valid:errors.length===0,errors,warnings};
}

export function normalizeIncome(sanitized){
  let grossAnnual=sanitized.grossAnnual;
  const freq=sanitized.payFrequency;
  if (freq==="hourly") grossAnnual=sanitized.hourlyRate*sanitized.hoursPerWeek*sanitized.weeksPerYear;
  else if (freq==="weekly") grossAnnual=sanitized.grossAnnual*52;
  else if (freq==="biweekly") grossAnnual=sanitized.grossAnnual*26;
  else if (freq==="semimonthly") grossAnnual=sanitized.grossAnnual*24;
  else if (freq==="monthly") grossAnnual=sanitized.grossAnnual*12;
  else if (freq==="daily") grossAnnual=sanitized.grossAnnual*(sanitized.daysPerYear||260);
  if (!isFinite(grossAnnual) || grossAnnual<0) grossAnnual=0;
  return {grossAnnual:Math.round(grossAnnual*100)/100,payFrequency:freq};
}
export function calculatePayPeriods(){ return {annual:1,monthly:12,semimonthly:24,biweekly:26,weekly:52,daily:260,hourly:2080}; }
