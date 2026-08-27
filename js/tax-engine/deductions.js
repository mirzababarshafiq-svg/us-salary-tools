import { LIMITS_2026 } from "../../data/limits-2026.js";
import { STATES_2026 } from "../../data/states-2026.js";
export function classifyDeductions(sanitized,stateAbbr){
  const stateData=STATES_2026[stateAbbr];
  const conformity=stateData?.conformity||{};
  let trad401k=sanitized.deductions.traditional401k||0;
  const trad401kPercent=sanitized.deductions.traditional401kPercent||0;
  const roth401k=sanitized.deductions.roth401k||0;
  const hsa=sanitized.deductions.hsa||0;
  const healthPremiums=sanitized.deductions.healthPremiums||0;
  const fsa=sanitized.deductions.fsa||0;
  const otherPretax=sanitized.deductions.otherPretax||0;
  const postTax=sanitized.deductions.postTax||0;
  const gross=sanitized.grossAnnual||0;
  if (trad401kPercent>0 && gross>0) trad401k=(trad401k||0)>0?Math.min(trad401k,(trad401kPercent/100)*gross):(trad401kPercent/100)*gross;
  const limits=LIMITS_2026;
  const age=sanitized.age||0;
  let applicable401kLimit=limits["401k"].electiveDeferralLimit;
  if (age>=60 && age<=63) applicable401kLimit+=limits["401k"].enhancedCatchUp60_63;
  else if (age>=50) applicable401kLimit+=limits["401k"].catchUp50;
  let hsaLimit=sanitized.deductions.hsaCoverage==="family"?limits.hsa.family:limits.hsa.selfOnly;
  if (age>=55) hsaLimit+=limits.hsa.catchUp55;
  const requested401k=trad401k, requestedHSA=hsa;
  const applied401k=Math.min(trad401k,applicable401kLimit,gross);
  const appliedHSA=Math.min(hsa,hsaLimit,gross);
  const capped401k=requested401k>applicable401kLimit, cappedHSA=requestedHSA>hsaLimit;
  const hsaViaPayroll=sanitized.deductions.hsa>0;
  const stateAllows401k=conformity.pretax401k!==false;
  const stateAllowsHSA=conformity.pretaxHSA!==false;
  const stateAllowsCafeteria=conformity.pretaxCafeteria!==false;
  const breakdown={
    traditional401k:{requested:requested401k,applied:applied401k,capped:capped401k,limit:applicable401kLimit,reduces:{federal:true,socialSecurity:false,medicare:false,state:stateAllows401k}},
    roth401k:{requested:roth401k,applied:roth401k,capped:false,reduces:{federal:false,socialSecurity:false,medicare:false,state:false}},
    hsa:{requested:requestedHSA,applied:appliedHSA,capped:cappedHSA,limit:hsaLimit,coverage:sanitized.deductions.hsaCoverage,viaPayroll:hsaViaPayroll,reduces:{federal:true,socialSecurity:hsaViaPayroll,medicare:hsaViaPayroll,state:stateAllowsHSA}},
    healthPremiums:{applied:healthPremiums,reduces:{federal:true,socialSecurity:true,medicare:true,state:stateAllowsCafeteria}},
    fsa:{applied:fsa,reduces:{federal:true,socialSecurity:true,medicare:true,state:stateAllowsCafeteria}},
    otherPretax:{applied:otherPretax,reduces:{federal:true,socialSecurity:false,medicare:false,state:true}},
    postTax:{applied:postTax,reduces:{federal:false,socialSecurity:false,medicare:false,state:false}}
  };
  const totals={pretaxFedOnly:0,pretaxFedFica:0,pretaxState:0,totalPretax:0,postTax:postTax};
  if (breakdown.traditional401k.reduces.federal) totals.pretaxFedOnly+=breakdown.traditional401k.applied;
  if (breakdown.traditional401k.reduces.state) totals.pretaxState+=breakdown.traditional401k.applied;
  if (hsaViaPayroll) totals.pretaxFedFica+=breakdown.hsa.applied; else totals.pretaxFedOnly+=breakdown.hsa.applied;
  if (breakdown.hsa.reduces.state) totals.pretaxState+=breakdown.hsa.applied;
  totals.pretaxFedFica+=breakdown.healthPremiums.applied+breakdown.fsa.applied;
  if (stateAllowsCafeteria) totals.pretaxState+=breakdown.healthPremiums.applied+breakdown.fsa.applied;
  totals.pretaxFedOnly+=breakdown.otherPretax.applied;
  totals.pretaxState+=breakdown.otherPretax.applied;
  totals.totalPretax=breakdown.traditional401k.applied+breakdown.hsa.applied+breakdown.healthPremiums.applied+breakdown.fsa.applied+breakdown.otherPretax.applied;
  return {breakdown,totals,limits:{"401k":{requested:requested401k,applied:applied401k,capped:capped401k,limit:applicable401kLimit},hsa:{requested:requestedHSA,applied:appliedHSA,capped:cappedHSA,limit:hsaLimit,coverage:sanitized.deductions.hsaCoverage}},warnings:[...(capped401k?[`401(k) contribution capped to $${applicable401kLimit} legal limit`]:[]),...(cappedHSA?[`HSA contribution capped to $${hsaLimit} (${sanitized.deductions.hsaCoverage} coverage)`]:[])]};
}
export function calculateTaxableWages(grossAnnual,deductionClassification){
  const {totals}=deductionClassification;
  const ficaReducing=totals.pretaxFedFica;
  const fedReducing=totals.pretaxFedOnly+totals.pretaxFedFica;
  const socialSecurityWages=Math.max(0,grossAnnual-ficaReducing);
  const medicareWages=Math.max(0,grossAnnual-ficaReducing);
  const federalTaxableWages=Math.max(0,grossAnnual-fedReducing);
  const stateTaxableWagesGross=Math.max(0,grossAnnual-totals.pretaxState);
  return {socialSecurityWages,medicareWages,federalTaxableWages,stateTaxableWagesGross,ficaReducing,fedReducing,stateReducing:totals.pretaxState};
}
