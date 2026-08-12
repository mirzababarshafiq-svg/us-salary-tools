import { LIMITS_2026 } from "../../data/limits-2026.js";
export function calculateSocialSecurity(socialSecurityWages){
  const {rate,wageBase,maxTax}=LIMITS_2026.socialSecurity;
  const taxable=Math.min(socialSecurityWages,wageBase);
  const tax=Math.min(taxable*rate,maxTax);
  return {socialSecurityWages,taxableWages:taxable,rate,wageBase,maxTax,socialSecurityTax:Math.round(tax*100)/100,capped:socialSecurityWages>wageBase};
}
export function calculateMedicare(medicareWages){
  const {rate}=LIMITS_2026.medicare;
  const tax=medicareWages*rate;
  return {medicareWages,rate,medicareTax:Math.round(tax*100)/100};
}
export function calculateAdditionalMedicare(medicareWages,filingStatus){
  const {additionalRate,thresholds,withholdingTrigger}=LIMITS_2026.medicare;
  const threshold=thresholds[filingStatus]||thresholds.single;
  const excess=Math.max(0,medicareWages-threshold);
  const taxLiability=excess*additionalRate;
  const withholdingExcess=Math.max(0,medicareWages-withholdingTrigger);
  const withholdingAmount=withholdingExcess*additionalRate;
  return {
    medicareWages,filingStatus,threshold,withholdingTrigger,excessOverThreshold:excess,
    additionalMedicareTaxLiability:Math.round(taxLiability*100)/100,
    withholdingExcess,
    additionalMedicareWithholding:Math.round(withholdingAmount*100)/100,
    rate:additionalRate,
    note:"Liability uses filing-status threshold; withholding uses $200k trigger"
  };
}
export function calculateFICA(socialSecurityWages,medicareWages,filingStatus){
  const ss=calculateSocialSecurity(socialSecurityWages);
  const med=calculateMedicare(medicareWages);
  const addMed=calculateAdditionalMedicare(medicareWages,filingStatus);
  const totalFICA=ss.socialSecurityTax+med.medicareTax+addMed.additionalMedicareTaxLiability;
  const totalWithholding=ss.socialSecurityTax+med.medicareTax+addMed.additionalMedicareWithholding;
  return {
    socialSecurity:ss,medicare:med,additionalMedicare:addMed,
    totalFICALiability:Math.round(totalFICA*100)/100,
    totalFICAWithholding:Math.round(totalWithholding*100)/100,
    totalForNetPay:Math.round(totalWithholding*100)/100
  };
}
