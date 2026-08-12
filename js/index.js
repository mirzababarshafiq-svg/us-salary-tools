import { FEDERAL_2026 } from "../../data/federal-2026.js";
import { LIMITS_2026 } from "../../data/limits-2026.js";
import { STATES_2026 } from "../../data/states-2026.js";
import { ENGINE_VERSION, TAX_YEAR, roundCents, allocatePeriods } from "./formatting.js";
import { sanitizeInputs, validateInputs, normalizeIncome, calculatePayPeriods } from "./validation.js";
import { classifyDeductions, calculateTaxableWages } from "./deductions.js";
import { calculateFederalTaxableIncome, calculateFederalTax, calculateFederalWithholding } from "./federal.js";
import { calculateFICA } from "./fica.js";
import { calculateStateTaxableIncome, calculateStateTax, calculateStatePayrollTaxes, calculateLocalTax } from "./state.js";
export { ENGINE_VERSION, TAX_YEAR };
export function calculateAll(sanitizedInput){
  const validation=validateInputs(sanitizedInput);
  if (!validation.valid){
    return {error:true,errors:validation.errors,warnings:validation.warnings,inputs:sanitizedInput,grossAnnual:0,netAnnual:0,ENGINE_VERSION,TAX_YEAR};
  }
  const {grossAnnual}=normalizeIncome(sanitizedInput);
  const stateAbbr=(sanitizedInput.state||"CA").toUpperCase();
  const filingStatus=sanitizedInput.filingStatus||"single";
  const deductionClassification=classifyDeductions({...sanitizedInput,grossAnnual},stateAbbr);
  const taxableWages=calculateTaxableWages(grossAnnual,deductionClassification);
  const federalTaxableInfo=calculateFederalTaxableIncome(taxableWages.federalTaxableWages,filingStatus,sanitizedInput.age65||sanitizedInput.isBlind?2000:0);
  const federalTaxInfo=calculateFederalTax(federalTaxableInfo.federalTaxableIncome,filingStatus);
  const payPeriods=calculatePayPeriods();
  const selectedFreq=sanitizedInput.selectedPayPeriod||"biweekly";
  const periodsPerYear=payPeriods[selectedFreq]||26;
  const withholdingInfo=calculateFederalWithholding(taxableWages.federalTaxableWages,filingStatus,sanitizedInput.w4||{},periodsPerYear);
  const ficaInfo=calculateFICA(taxableWages.socialSecurityWages,taxableWages.medicareWages,filingStatus);
  const stateTaxableInfo=calculateStateTaxableIncome(taxableWages.stateTaxableWagesGross,stateAbbr,filingStatus);
  const stateTaxInfo=calculateStateTax(stateTaxableInfo.stateTaxableIncome,stateAbbr,filingStatus);
  const statePayrollInfo=calculateStatePayrollTaxes(grossAnnual,taxableWages.medicareWages,stateAbbr);
  const localTaxInfo=calculateLocalTax();
  const totalTaxes=federalTaxInfo.federalIncomeTax+ficaInfo.totalForNetPay+stateTaxInfo.stateIncomeTax+statePayrollInfo.totalStatePayrollTax+localTaxInfo.localIncomeTax;
  const totalDeductions=deductionClassification.totals.totalPretax;
  let netAnnual=grossAnnual-totalTaxes-totalDeductions;
  if (netAnnual<0) netAnnual=0;
  if (netAnnual>grossAnnual) netAnnual=grossAnnual;
  netAnnual=roundCents(netAnnual);
  const perPeriodGross=roundCents(grossAnnual/periodsPerYear);
  const perPeriodNet=roundCents(netAnnual/periodsPerYear);
  const allocations=allocatePeriods(netAnnual,periodsPerYear);
  const effectiveTaxRate=grossAnnual>0?(totalTaxes/grossAnnual)*100:0;
  const takeHomePercent=grossAnnual>0?(netAnnual/grossAnnual)*100:0;
  const allWarnings=[...(validation.warnings||[]).map(w=>w.message),...(deductionClassification.warnings||[]),...(withholdingInfo.warnings||[])];
  const stateConfidence=stateTaxInfo.confidence||"estimate";
  const federalConfidence=FEDERAL_2026.confidence;
  const result={
    ENGINE_VERSION,TAX_YEAR,inputs:sanitizedInput,grossAnnual,payFrequency:sanitizedInput.payFrequency,filingStatus,stateAbbr,stateName:stateTaxInfo.stateName,
    wages:taxableWages,
    deductions:deductionClassification,
    federal:{...federalTaxableInfo,...federalTaxInfo,withholding:withholdingInfo,confidence:federalConfidence,source:FEDERAL_2026.source,sourceUrl:FEDERAL_2026.sourceUrl},
    fica:ficaInfo,
    state:{...stateTaxableInfo,...stateTaxInfo,payroll:statePayrollInfo},
    local:localTaxInfo,
    totals:{
      totalFederalTax:federalTaxInfo.federalIncomeTax,
      totalSocialSecurity:ficaInfo.socialSecurity.socialSecurityTax,
      totalMedicare:ficaInfo.medicare.medicareTax,
      totalAdditionalMedicare:ficaInfo.additionalMedicare.additionalMedicareWithholding,
      totalStateTax:stateTaxInfo.stateIncomeTax,
      totalStatePayroll:statePayrollInfo.totalStatePayrollTax,
      totalLocal:localTaxInfo.localIncomeTax,
      totalTaxes:roundCents(totalTaxes),
      totalDeductions:roundCents(totalDeductions),
      netAnnual,
      netMonthly:roundCents(netAnnual/12),
      netBiweekly:roundCents(netAnnual/26),
      netWeekly:roundCents(netAnnual/52),
      netSemimonthly:roundCents(netAnnual/24),
      netPerSelectedPeriod:perPeriodNet,
      grossPerSelectedPeriod:perPeriodGross,
      allocations,
      periodsPerYear,
      effectiveTaxRate:roundCents(effectiveTaxRate),
      takeHomePercent:roundCents(takeHomePercent)
    },
    warnings:allWarnings,
    confidence:{federal:federalConfidence,state:stateConfidence,overall:stateConfidence==="verified"&&federalConfidence==="verified"?"verified":"estimate"},
    meta:{calculatedAt:new Date().toISOString(),engineVersion:ENGINE_VERSION,taxYear:TAX_YEAR}
  };
  return result;
}
export function calculateSummary(result){
  if (!result || result.error) return null;
  return {grossAnnual:result.grossAnnual,netAnnual:result.totals.netAnnual,netMonthly:result.totals.netMonthly,totalTaxes:result.totals.totalTaxes,effectiveRate:result.totals.effectiveTaxRate,takeHomePercent:result.totals.takeHomePercent,warnings:result.warnings,confidence:result.confidence};
}
export function calculateAllStates(sanitizedInput){
  const base={...sanitizedInput};
  const results={};
  for (const abbr of Object.keys(STATES_2026)){
    const inputForState={...base,state:abbr};
    const res=calculateAll(inputForState);
    results[abbr]=res;
  }
  return results;
}
export function formatResultForShare(result){
  return {grossAnnual:result.grossAnnual,netAnnual:result.totals.netAnnual,state:result.stateAbbr,filingStatus:result.filingStatus,effectiveRate:result.totals.effectiveTaxRate,engineVersion:result.ENGINE_VERSION,taxYear:result.TAX_YEAR};
}
export * from "./formatting.js";
export * from "./validation.js";
