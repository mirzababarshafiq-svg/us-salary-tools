export function sanitizeInputs(raw){
  const cleanNumber=(v)=>{
    if (v==null || v==="") return 0;
    if (typeof v==="number") return v;
    let s=String(v).trim();
    if (/e/i.test(s)) return NaN;
    s=s.replace(/[$,%\s]/g,"");
    if (s.includes(".") && s.includes(",") && s.lastIndexOf(",")>s.lastIndexOf(".")){
      s=s.replace(/\./g,"").replace(/,/g,".");
    } else { s=s.replace(/,/g,""); }
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
  out.state=(raw.state||"CA").toUpperCase();
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
  out.w4={
    multipleJobs:!!raw.w4?.multipleJobs,
    dependentAmount:cleanNumber(raw.w4?.dependentAmount ?? 0),
    otherIncome:cleanNumber(raw.w4?.otherIncome ?? 0),
    deductions:cleanNumber(raw.w4?.deductions ?? 0),
    extraWithholding:cleanNumber(raw.w4?.extraWithholding ?? 0),
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
  if (!/^[A-Z]{2}$/.test(state) && state!=="DC") warnings.push({field:"state",message:`Unknown state code ${state}, defaulting to CA`});
  if (hoursPerWeek<0 || hoursPerWeek>168) errors.push({field:"hoursPerWeek",message:"Hours per week 0-168"});
  if (weeksPerYear<0 || weeksPerYear>52) errors.push({field:"weeksPerYear",message:"Weeks per year 0-52"});
  const totalPretax=(sanitized.deductions.traditional401k||0)+(sanitized.deductions.hsa||0)+(sanitized.deductions.healthPremiums||0)+(sanitized.deductions.fsa||0)+(sanitized.deductions.otherPretax||0);
  if (totalPretax>sanitized.grossAnnual && sanitized.grossAnnual>0) warnings.push({field:"deductions",message:"Pre-tax deductions exceed gross and will be clamped"});
  if (sanitized.deductions.traditional401kPercent<0 || sanitized.deductions.traditional401kPercent>100) errors.push({field:"traditional401kPercent",message:"401k percent 0-100"});
  for (const [k,v] of Object.entries(sanitized.deductions)){ if (typeof v==="number" && !isFinite(v)) errors.push({field:k,message:`Invalid deduction ${k}`}); if (typeof v==="number" && v<0) errors.push({field:k,message:`Deduction ${k} cannot be negative`}); }
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
export function calculatePayPeriods(){
  return {annual:1,monthly:12,semimonthly:24,biweekly:26,weekly:52,daily:260,hourly:2080};
}
