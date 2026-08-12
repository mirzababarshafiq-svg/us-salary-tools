import { calculateAllStates } from "./tax-engine/index.js";
import { sanitizeInputs } from "./tax-engine/validation.js";
import { formatCurrency, formatPercent } from "./tax-engine/formatting.js";
function getInputs(){
  return {
    grossAnnual: document.getElementById("salary")?document.getElementById("salary").value:100000,
    filingStatus: document.getElementById("filingStatus")?document.getElementById("filingStatus").value:"single",
    state: document.getElementById("selectedState")?document.getElementById("selectedState").value:"CA",
    payFrequency:"annual",
    selectedPayPeriod: document.getElementById("payFrequency")?document.getElementById("payFrequency").value:"biweekly",
    deductions:{},
    age:35
  };
}
function renderComparison(){
  const raw=getInputs();
  const sanitized=sanitizeInputs(raw);
  const all=calculateAllStates(sanitized);
  const selectedResult=all[sanitized.state];
  const tableBody=document.getElementById("comparisonTableBody")||document.getElementById("stateComparisonTable");
  if (!tableBody) return;
  const rows=Object.entries(all).map(([abbr,result])=>{
    const diff=result.totals.netAnnual-selectedResult.totals.netAnnual;
    const diffPercent=selectedResult.totals.netAnnual?(diff/selectedResult.totals.netAnnual)*100:0;
    return {abbr,name:result.stateName,gross:result.grossAnnual,federalTax:result.federal.federalIncomeTax,stateTax:result.state.stateIncomeTax,ss:result.fica.socialSecurity.socialSecurityTax,medicare:result.fica.medicare.medicareTax,addlMed:result.fica.additionalMedicare.additionalMedicareWithholding,statePayroll:result.state.payroll.totalStatePayrollTax,totalTax:result.totals.totalTaxes,netAnnual:result.totals.netAnnual,netMonthly:result.totals.netMonthly,netPerPeriod:result.totals.netPerSelectedPeriod,effectiveRate:result.totals.effectiveTaxRate,takeHome:result.totals.takeHomePercent,diff,diffPercent,confidence:result.confidence.overall};
  });
  rows.sort((a,b)=>{if (b.netAnnual!==a.netAnnual) return b.netAnnual-a.netAnnual; return a.name.localeCompare(b.name);});
  const html=rows.map(r=>`<tr class="confidence-${r.confidence}"><td>${r.name} (${r.abbr}) <span class="badge">${r.confidence}</span></td><td>${formatCurrency(r.gross)}</td><td>${formatCurrency(r.federalTax)}</td><td>${formatCurrency(r.stateTax)}</td><td>${formatCurrency(r.ss)}</td><td>${formatCurrency(r.medicare)}</td><td>${formatCurrency(r.addlMed)}</td><td>${formatCurrency(r.statePayroll)}</td><td>${formatCurrency(r.totalTax)}</td><td>${formatCurrency(r.netAnnual)}</td><td>${formatCurrency(r.netMonthly)}</td><td>${formatCurrency(r.netPerPeriod)}</td><td>${formatPercent(r.effectiveRate)}</td><td>${formatPercent(r.takeHome)}</td><td>${formatCurrency(r.diff)} (${formatPercent(r.diffPercent)})</td></tr>`).join("");
  tableBody.innerHTML=html;
  window.__comparisonResults=rows;
}
document.addEventListener("DOMContentLoaded",()=>{
  const inputs=["salary","filingStatus","selectedState","payFrequency"].map(id=>document.getElementById(id)).filter(Boolean);
  inputs.forEach(el=>{el.addEventListener("input",renderComparison);el.addEventListener("change",renderComparison);});
  renderComparison();
});
export {renderComparison};
