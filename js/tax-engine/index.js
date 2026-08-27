import { FEDERAL_2026 } from "../../data/federal-2026.js";
import { STATES_2026 } from "../../data/states-2026.js";
import { ENGINE_VERSION, TAX_YEAR, roundCents, allocatePeriods } from "./formatting.js";
import { sanitizeInputs, validateInputs, normalizeIncome, calculatePayPeriods } from "./validation.js";
import { classifyDeductions, calculateTaxableWages } from "./deductions.js";
import { calculateFederalSpecialDeductions, calculateFederalTaxableIncome, calculateFederalTax, calculateFederalWithholding } from "./federal.js";
import { calculateFICA } from "./fica.js";
import { calculateStateTaxableIncome, calculateStateTax, calculateStatePayrollTaxes, calculateLocalTax } from "./state.js";
export { ENGINE_VERSION, TAX_YEAR };
export function calculateAll(sanitizedInput){
  const validation=validateInputs(sanitizedInput);
  if (!validation.valid) return {error:true,errors:validation.errors,warnings:validation.warnings,inputs:sanitizedInput,grossAnnual:0,netAnnual:0,ENGINE_VERSION,TAX_YEAR};
  const {grossAnnual}=normalizeIncome(sanitizedInput);
  const stateAbbr=sanitizedInput.state.toUpperCase();
  const filingStatus=sanitizedInput.filingStatus||"single";
  const deductionClassification=classifyDeductions({...sanitizedInput,grossAnnual},stateAbbr);
  const taxableWages=calculateTaxableWages(grossAnnual,deductionClassification);
  const federalSpecial=calculateFederalSpecialDeductions(taxableWages.federalTaxableWages,filingStatus,sanitizedInput);
  const federalTaxableInfo=calculateFederalTaxableIncome(taxableWages.federalTaxableWages,filingStatus,0,federalSpecial.totalAdditionalDeduction);
  const federalTaxInfo=calculateFederalTax(federalTaxableInfo.federalTaxableIncome,filingStatus);
  const payPeriods=calculatePayPeriods();
  const selectedFreq=sanitizedInput.selectedPayPeriod||"biweekly";
  const periodsPerYear=payPeriods[selectedFreq]||26;
  const withholdingInfo=calculateFederalWithholding(taxableWages.federalTaxableWages,filingStatus,sanitizedInput.w4||{},periodsPerYear,federalSpecial.totalAdditionalDeduction);
  const ficaInfo=calculateFICA(taxableWages.socialSecurityWages,taxableWages.medicareWages,filingStatus);
  const stateTaxableInfo=calculateStateTaxableIncome(taxableWages.stateTaxableWagesGross,stateAbbr,filingStatus);
  const stateTaxInfo=calculateStateTax(stateTaxableInfo.stateTaxableIncome,stateAbbr,filingStatus);
  const statePayrollInfo=calculateStatePayrollTaxes(grossAnnual,taxableWages.medicareWages,stateAbbr);
  const localTaxInfo=calculateLocalTax(stateAbbr,{jurisdiction:sanitizedInput.localJurisdiction||sanitizedInput.localTaxJurisdiction,residency:sanitizedInput.localResidency||"resident",filingStatus,stateTaxableIncome:stateTaxableInfo.stateTaxableIncome});
  const federalForNetPay=withholdingInfo.federalWithholdingAnnual;
  const ficaForNetPay=ficaInfo.totalForNetPay;
  const totalTaxesForNetPay=federalForNetPay+ficaForNetPay+stateTaxInfo.stateIncomeTax+statePayrollInfo.totalStatePayrollTax+localTaxInfo.localIncomeTax;
  const totalTaxLiability=federalTaxInfo.federalIncomeTax+ficaInfo.totalFICALiability+stateTaxInfo.stateIncomeTax+statePayrollInfo.totalStatePayrollTax+localTaxInfo.localIncomeTax;
  const pretaxDeductions=deductionClassification.totals.totalPretax;
  const postTaxDeductions=deductionClassification.totals.postTax||0;
  let netAnnual=grossAnnual-totalTaxesForNetPay-pretaxDeductions-postTaxDeductions;
  netAnnual=Math.max(0,Math.min(grossAnnual,roundCents(netAnnual)));
  const perPeriodGross=roundCents(grossAnnual/periodsPerYear),perPeriodNet=roundCents(netAnnual/periodsPerYear),allocations=allocatePeriods(netAnnual,periodsPerYear);
  const effectiveTaxRate=grossAnnual>0?(totalTaxesForNetPay/grossAnnual)*100:0,takeHomePercent=grossAnnual>0?(netAnnual/grossAnnual)*100:0;
  const allWarnings=[...(validation.warnings||[]).map(w=>w.message),...(deductionClassification.warnings||[]),...(federalSpecial.warnings||[]),...(withholdingInfo.warnings||[])];
  if (localTaxInfo.exists && localTaxInfo.modeled===false) allWarnings.push("Local/city/county income taxes are not modeled; choose a supported local jurisdiction when available.");
  const stateConfidence=stateTaxInfo.confidence||"estimate",federalConfidence=FEDERAL_2026.confidence||"verified";
  return {ENGINE_VERSION,TAX_YEAR,inputs:sanitizedInput,grossAnnual,payFrequency:sanitizedInput.payFrequency,filingStatus,stateAbbr,stateName:stateTaxInfo.stateName,wages:taxableWages,deductions:deductionClassification,federal:{...federalTaxableInfo,...federalTaxInfo,specialDeductions:federalSpecial,withholding:withholdingInfo,confidence:federalConfidence,source:FEDERAL_2026.source,sourceUrl:FEDERAL_2026.sourceUrl},fica:ficaInfo,state:{...stateTaxableInfo,...stateTaxInfo,payroll:statePayrollInfo},local:localTaxInfo,totals:{totalFederalTax:federalTaxInfo.federalIncomeTax,totalFederalWithholding:federalForNetPay,totalSocialSecurity:ficaInfo.socialSecurity.socialSecurityTax,totalMedicare:ficaInfo.medicare.medicareTax,totalAdditionalMedicare:ficaInfo.additionalMedicare.additionalMedicareWithholding,totalStateTax:stateTaxInfo.stateIncomeTax,totalStatePayroll:statePayrollInfo.totalStatePayrollTax,totalLocal:localTaxInfo.localIncomeTax,totalTaxLiability:roundCents(totalTaxLiability),totalTaxes:roundCents(totalTaxesForNetPay),pretaxDeductions:roundCents(pretaxDeductions),postTaxDeductions:roundCents(postTaxDeductions),totalDeductions:roundCents(pretaxDeductions+postTaxDeductions),grossAnnual,netAnnual,netMonthly:roundCents(netAnnual/12),netBiweekly:roundCents(netAnnual/26),netWeekly:roundCents(netAnnual/52),netSemimonthly:roundCents(netAnnual/24),netPerSelectedPeriod:perPeriodNet,grossPerSelectedPeriod:perPeriodGross,allocations,periodsPerYear,effectiveTaxRate:roundCents(effectiveTaxRate),takeHomePercent:roundCents(takeHomePercent)},warnings:allWarnings,confidence:{federal:federalConfidence,state:stateConfidence,overall:stateConfidence==="verified"&&federalConfidence==="verified"&&localTaxInfo.modeled!==false?"verified":"estimate"},meta:{calculatedAt:new Date().toISOString(),engineVersion:ENGINE_VERSION,taxYear:TAX_YEAR}};
}
export function calculateSummary(result){ if (!result||result.error) return null; return {grossAnnual:result.grossAnnual,netAnnual:result.totals.netAnnual,netMonthly:result.totals.netMonthly,totalTaxes:result.totals.totalTaxes,effectiveRate:result.totals.effectiveTaxRate,takeHomePercent:result.totals.takeHomePercent,warnings:result.warnings,confidence:result.confidence}; }
export function calculateAllStates(sanitizedInput){ const base={...sanitizedInput},results={}; for (const abbr of Object.keys(STATES_2026)) results[abbr]=calculateAll({...base,state:abbr}); return results; }
export function formatResultForShare(result){ return {grossAnnual:result.grossAnnual,netAnnual:result.totals.netAnnual,state:result.stateAbbr,filingStatus:result.filingStatus,effectiveRate:result.totals.effectiveTaxRate,engineVersion:result.ENGINE_VERSION,taxYear:result.TAX_YEAR}; }
export * from "./formatting.js";
export * from "./validation.js";
