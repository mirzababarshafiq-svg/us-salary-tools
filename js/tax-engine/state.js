import { STATES_2026 } from "../../data/states-2026.js";
import { LOCAL_TAX_RULES_2026 } from "../../data/local-tax-rules-2026.js";
function getState(stateAbbr){
const s = STATES_2026[stateAbbr];
if (!s) return s;
if (stateAbbr === "OH") return Object.assign({}, s, { system: "progressive" });
if (stateAbbr === "MS") return Object.assign({}, s, {
system: "progressive",
personalExemption: { type: "exemption", single: 6000, marriedJointly: 12000, headOfHousehold: 9500 }
});
return s;
}
function bracketWalk(taxableIncome,brackets){
  if (taxableIncome<=0) return 0;
  let tax=0;
  for (const b of brackets){
    if (taxableIncome<=b.min) continue;
    const max=b.max===null||b.max===Infinity?taxableIncome:b.max;
    const upper=Math.min(taxableIncome,max);
    const lower=b.min;
    if (upper>lower) tax+=(upper-lower)*b.rate;
    if (taxableIncome<=max) break;
  }
  return tax;
}
export function calculateStateTaxableIncome(stateTaxableWagesGross,stateAbbr,filingStatus){
  const stateData=getState(stateAbbr);
  if (!stateData) throw new Error(`Unknown state ${stateAbbr}`);
  const stdDed=stateData.standardDeduction||{};
  let deduction=0;
  if (typeof stdDed==="object") deduction=stdDed[filingStatus]??stdDed.single??0;
  else if (typeof stdDed==="number") deduction=stdDed;
  const pe=stateData.personalExemption||{};
  let exemption=0;
  if (pe.type==="deduction"||pe.type==="exemption") exemption=pe[filingStatus]??pe.single??pe.perFiler??0;
  const taxable=Math.max(0,stateTaxableWagesGross-deduction-exemption);
  return {stateAbbr,stateName:stateData.name,stateTaxableWagesGross,standardDeduction:deduction,personalExemption:exemption,stateTaxableIncome:taxable,incomeBase:stateData.incomeBase,system:stateData.system};
}
export function calculateStateTax(stateTaxableIncome,stateAbbr,filingStatus){
  const stateData=getState(stateAbbr);
  if (!stateData) throw new Error(`Unknown state ${stateAbbr}`);
  if (stateData.system==="none") return {stateAbbr,stateName:stateData.name,system:"none",stateTaxableIncome,stateIncomeTax:0,flatRate:null,confidence:stateData.confidence,source:stateData.source,sourceUrl:stateData.sourceUrl,notes:stateData.notes,localTax:stateData.localTax};
  let tax=0;let bracketsUsed=null;let statusWarning=null;
  if (stateData.system==="flat"){
    const rate=stateData.flatRate||0;tax=stateTaxableIncome*rate;bracketsUsed=[{min:0,max:Infinity,rate}];
  } else {
    const singleBrackets=stateData.brackets?.single||[];
    const ownBrackets=stateData.brackets?.[filingStatus];
    let brackets=ownBrackets?.length?ownBrackets:singleBrackets;
    if (!ownBrackets && (filingStatus==="headOfHousehold"||filingStatus==="marriedSeparately")) statusWarning=`State income tax for ${filingStatus} is not separately modeled; Single brackets were used.`;
    if (filingStatus==="marriedJointly" && ownBrackets?.length && JSON.stringify(ownBrackets)===JSON.stringify(singleBrackets)) {
      const mfjDeduction=stateData.standardDeduction?.marriedJointly;
      if (!mfjDeduction) statusWarning="State income tax for marriedJointly is not separately modeled; Single brackets were used.";
    }
    if (!brackets.length) return {stateAbbr,stateName:stateData.name,system:stateData.system,stateTaxableIncome,stateIncomeTax:0,confidence:"estimate",source:stateData.source,sourceUrl:stateData.sourceUrl,notes:stateData.notes,statusWarning:`State income tax for ${filingStatus} could not be modeled.`};
    bracketsUsed=brackets;tax=bracketWalk(stateTaxableIncome,brackets);
    if (stateData.addOnTaxes?.length) for (const addOn of stateData.addOnTaxes) if (addOn.threshold && stateTaxableIncome>addOn.threshold) tax+=(stateTaxableIncome-addOn.threshold)*addOn.rate;
  }
  tax=Math.max(0,tax);
  return {stateAbbr,stateName:stateData.name,system:stateData.system,stateTaxableIncome,stateIncomeTax:Math.round(tax*100)/100,brackets:bracketsUsed,flatRate:stateData.flatRate,confidence:stateData.confidence,source:stateData.source,sourceUrl:stateData.sourceUrl,notes:stateData.notes,localTax:stateData.localTax,statusWarning};
}
export function calculateStatePayrollTaxes(grossWages,ficaWages,stateAbbr){
  const stateData=getState(stateAbbr);if (!stateData) throw new Error(`Unknown state ${stateAbbr}`);
  const payrollTaxes=stateData.employeePayrollTaxes||[];let total=0;const details=[];
  for (const pt of payrollTaxes){const base=pt.appliesTo==="grossWages"?grossWages:ficaWages;const wageBase=pt.wageBase;const taxable=wageBase?Math.min(base,wageBase):base;const tax=taxable*pt.rate;total+=tax;details.push({name:pt.name,rate:pt.rate,wageBase:wageBase,taxableWages:taxable,tax:Math.round(tax*100)/100,source:pt.source,confidence:pt.confidence});}
  return {stateAbbr,totalStatePayrollTax:Math.round(total*100)/100,details};
}
export function calculateLocalTax(stateAbbr, options={}){
  const stateData=getState(stateAbbr);const jurisdiction=String(options.jurisdiction||"").toUpperCase();
  const rule=LOCAL_TAX_RULES_2026[jurisdiction];
  if (rule && rule.state===stateAbbr) {
    const filingStatus=options.filingStatus||"single";
    const taxableWages=Number(options.stateTaxableIncome)||0;
    const residency=String(options.residency||"resident").toLowerCase();
    if (rule.residentOnly && residency==="nonresident") return {exists:true,modeled:true,jurisdiction,localIncomeTax:0,taxableIncome:taxableWages,residency,details:{type:rule.type,filingStatus},note:`${rule.name} PIT is resident-only.`,source:rule.source,sourceUrl:rule.sourceUrl,confidence:rule.confidence};
    if (rule.type==="progressive") {
      const taxable=Math.max(0,taxableWages);
      const brackets=rule.brackets[filingStatus]||rule.brackets.single||[];
      const tax=Math.round(bracketWalk(taxable,brackets)*100)/100;
      return {exists:true,modeled:true,jurisdiction,localIncomeTax:tax,taxableIncome:taxable,details:{type:rule.type,filingStatus},note:`${rule.name} personal income tax modeled.`,source:rule.source,sourceUrl:rule.sourceUrl,confidence:rule.confidence};
    }
    const rate=residency==="nonresident"?(rule.nonResidentRate??rule.residentRate):rule.residentRate;
    const tax=Math.round(Math.max(0,taxableWages*rate)*100)/100;
    return {exists:true,modeled:true,jurisdiction,localIncomeTax:tax,taxableIncome:taxableWages,residency,rate,details:{type:rule.type},note:`${rule.name} local income tax modeled.`,source:rule.source,sourceUrl:rule.sourceUrl,confidence:rule.confidence};
  }
  if (!stateData?.localTax || stateData.localTax.exists===false) return {exists:false,modeled:true,localIncomeTax:0,note:"No modeled local individual income tax for this state."};
  return {exists:true,modeled:false,localIncomeTax:0,note:stateData.localTax.note||"Local/city/county income taxes are not included."};
}
