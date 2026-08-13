import { calculateAll } from "./tax-engine/index.js";
import { sanitizeInputs, validateInputs } from "./tax-engine/validation.js";
import { formatCurrency, formatPercent } from "./tax-engine/formatting.js";

function getElements(){
  return {
    salaryInput: document.getElementById("salary") || document.getElementById("annualSalary"),
    stateSelect: document.getElementById("state") || document.getElementById("stateSelect"),
    filingStatus: document.getElementById("filingStatus"),
    payFrequency: document.getElementById("payFrequency"),
    traditional401k: document.getElementById("traditional401k") || document.getElementById("401k"),
    roth401k: document.getElementById("roth401k"),
    hsa: document.getElementById("hsa"),
    hsaCoverage: document.getElementById("hsaCoverage"),
    healthPremiums: document.getElementById("healthPremiums"),
    age: document.getElementById("age"),
    resultCard: document.getElementById("resultCard") || document.getElementById("paycheckResult"),
    warningContainer: document.getElementById("warnings") || document.getElementById("validationMessages"),
    confidenceBadge: document.getElementById("confidenceBadge")
  };
}

function collectInputs(){
  const els=getElements();
  return {
    grossAnnual: els.salaryInput ? els.salaryInput.value : 0,
    state: els.stateSelect ? els.stateSelect.value : "CA",
    filingStatus: els.filingStatus ? els.filingStatus.value : "single",
    payFrequency: "annual",
    selectedPayPeriod: els.payFrequency ? els.payFrequency.value : "biweekly",
    age: els.age ? parseInt(els.age.value, 10) || 0 : 0,
    deductions: {
      traditional401k: els.traditional401k ? parseFloat(els.traditional401k.value) || 0 : 0,
      roth401k: els.roth401k ? parseFloat(els.roth401k.value) || 0 : 0,
      hsa: els.hsa ? parseFloat(els.hsa.value) || 0 : 0,
      hsaCoverage: els.hsaCoverage ? els.hsaCoverage.value : "self",
      healthPremiums: els.healthPremiums ? parseFloat(els.healthPremiums.value) || 0 : 0
    },
    w4: {multipleJobs:false, dependentAmount:0, otherIncome:0, deductions:0, extraWithholding:0}
  };
}

function renderResult(result){
  const els=getElements();
  if (!els.resultCard) return;
  if (result.error){
    els.resultCard.innerHTML=`<div role="alert" aria-live="polite">Please check inputs: ${result.errors.map(e=>e.message).join(", ")}</div>`;
    return;
  }
  if (result.grossAnnual===0){
    els.resultCard.innerHTML=`<div aria-live="polite">Enter your salary to estimate your take-home pay.</div>`;
    return;
  }
  const t=result.totals;
  els.resultCard.innerHTML=`
    <div class="result-grid">
      <div>Gross Annual: <span id="resultGross">${formatCurrency(result.grossAnnual)}</span></div>
      <div>Federal Tax: <span id="resultFederalTax">${formatCurrency(result.federal.federalIncomeTax)}</span> <small>(${result.federal.confidence})</small></div>
      <div>State Tax (${result.stateAbbr}): <span id="resultStateTax">${formatCurrency(result.state.stateIncomeTax)}</span> <small>${result.confidence.state}</small></div>
      <div>Social Security: <span id="resultSocialSecurity">${formatCurrency(result.fica.socialSecurity.socialSecurityTax)}</span> ${result.fica.socialSecurity.capped?'<small>Capped at $184,500</small>':''}</div>
      <div>Medicare: <span id="resultMedicare">${formatCurrency(result.fica.medicare.medicareTax)}</span></div>
      <div>Additional Medicare: <span id="resultAdditionalMedicare">${formatCurrency(result.fica.additionalMedicare.additionalMedicareWithholding)}</span> <small>Threshold $${result.fica.additionalMedicare.threshold} | Withholding $200k</small></div>
      <div>State Payroll (SDI/PFL): <span id="resultStatePayroll">${formatCurrency(result.state.payroll.totalStatePayrollTax)}</span></div>
      <div>Local Tax: $0 <small>${result.local.note}</small></div>
      <div>Total Taxes: <span id="resultTotalTax">${formatCurrency(t.totalTaxes)}</span></div>
      <div>Net Annual: <span id="resultNetAnnual">${formatCurrency(t.netAnnual)}</span></div>
      <div>Net Monthly: <span id="resultNetMonthly">${formatCurrency(t.netMonthly)}</span></div>
      <div>Net Biweekly: <span id="resultNetBiweekly">${formatCurrency(t.netBiweekly)}</span></div>
      <div>Effective Rate: <span id="resultEffectiveRate">${formatPercent(t.effectiveTaxRate)}</span></div>
      <div>Take-home %: <span id="resultTakeHome">${formatPercent(t.takeHomePercent)}</span></div>
      <div>Pay Period (${t.periodsPerYear}/yr): Gross ${formatCurrency(t.grossPerSelectedPeriod)} Net ${formatCurrency(t.netPerSelectedPeriod)}</div>
      ${result.deductions.limits["401k"].capped?`<div role="alert" aria-live="polite" class="notice">401(k) capped to $${result.deductions.limits["401k"].limit}</div>`:""}
      ${result.deductions.limits.hsa.capped?`<div role="alert" aria-live="polite" class="notice">HSA capped to $${result.deductions.limits.hsa.limit} (${result.deductions.limits.hsa.coverage})</div>`:""}
      <div>Confidence: <span id="confidenceBadge" class="confidence-${result.confidence.overall}">${result.confidence.overall}</span></div>
      <div>Method: ${result.federal.withholding.method} - 2026 take-home pay estimate. Estimate only - not tax advice.</div>
      <div>Engine v${result.ENGINE_VERSION} · Tax Year ${result.TAX_YEAR}</div>
    </div>`;
  if (els.warningContainer){
    els.warningContainer.innerHTML = result.warnings && result.warnings.length
      ? result.warnings.map(w=>`<div aria-live="polite">${w}</div>`).join("")
      : "";
  }
  window.__lastResult=result;
}

function calculate(){
  const raw=collectInputs();
  const sanitized=sanitizeInputs(raw);
  const result=calculateAll(sanitized);
  renderResult(result);
  // Intentionally do not mutate window.history or the address bar.
  // Calculator state is local to the page and may be persisted in localStorage by the UI.
}

document.addEventListener("DOMContentLoaded",()=>{
  const els=getElements();
  const inputs=[els.salaryInput,els.stateSelect,els.filingStatus,els.payFrequency,els.traditional401k,els.roth401k,els.hsa,els.hsaCoverage,els.healthPremiums,els.age].filter(Boolean);
  inputs.forEach(el=>{el.addEventListener("input",calculate);el.addEventListener("change",calculate);});
  calculate();
});

export {calculate};
