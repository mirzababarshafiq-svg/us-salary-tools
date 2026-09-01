/* Paycheck Calculator — browser-safe 2026 engine bridge */
(function () {
  var initialized = false, requestToken = 0;
  var LOCAL_OPTIONS = { NY: ['NYC'], PA: ['PHILADELPHIA'], MI: ['DETROIT'] };
  var LOCAL_LABELS = { NYC: 'New York City', PHILADELPHIA: 'Philadelphia', DETROIT: 'Detroit' };

  function money(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0); }
  function percent(n) { return (Number(n) || 0).toFixed(1) + '%'; }
  function el(id) { return document.getElementById(id); }
  function setText(id, value) { var node = el(id); if (node) node.textContent = value; }
  function numberValue(id, fallback) { var node = el(id); if (!node) return fallback || 0; var n = parseFloat(String(node.value || '').replace(/[$,\s]/g, '')); return Number.isFinite(n) ? n : (fallback || 0); }

  function ensureStates(STATES_2026) {
    var select = el('pc-state'); if (!select) return;
    if (!select.options.length) {
      Object.keys(STATES_2026).sort(function (a, b) { return String(STATES_2026[a].name || a).localeCompare(String(STATES_2026[b].name || b)); }).forEach(function (abbr) {
        var option = document.createElement('option'); option.value = abbr; option.textContent = STATES_2026[abbr].name || abbr; select.appendChild(option);
      });
      select.value = 'TX';
    }
  }

  function ensureLocalControls() {
    var state = el('pc-state');
    if (!state || el('pc-local')) return;
    var wrapper = state.closest('.input-group'); if (!wrapper) return;
    var group = document.createElement('div'); group.className = 'input-group';
    group.innerHTML = '<label for="pc-local">Local Tax Location</label><select id="pc-local"><option value="">No supported local tax</option></select><p class="helper-text">Choose a supported city/local income tax when applicable.</p>';
    var residency = document.createElement('div'); residency.className = 'input-group';
    residency.innerHTML = '<label for="pc-local-residency">Local Residency</label><select id="pc-local-residency"><option value="resident">Resident</option><option value="nonresident">Nonresident</option></select>';
    wrapper.parentNode.insertBefore(group, wrapper.nextSibling); wrapper.parentNode.insertBefore(residency, group.nextSibling);
    el('pc-local').addEventListener('change', calculate); el('pc-local-residency').addEventListener('change', calculate);
    refreshLocalOptions();
  }

  function refreshLocalOptions() {
    var state = el('pc-state'), select = el('pc-local'); if (!state || !select) return;
    var previous = select.value; select.innerHTML = '<option value="">No supported local tax</option>';
    (LOCAL_OPTIONS[state.value] || []).forEach(function (code) { var option = document.createElement('option'); option.value = code; option.textContent = LOCAL_LABELS[code] || code; select.appendChild(option); });
    select.value = (LOCAL_OPTIONS[state.value] || []).indexOf(previous) !== -1 ? previous : '';
    var residency = el('pc-local-residency'); if (residency) residency.disabled = !select.value;
  }

  function ensureResultRows() {
    var body = document.querySelector('#pc-ledger .ledger__body');
    if (!body || el('out-pc-state-payroll')) return;
    var stateRow = el('out-pc-state') && el('out-pc-state').closest('.ledger__row'); if (!stateRow) return;
    var payroll = document.createElement('div'); payroll.className = 'ledger__row'; payroll.innerHTML = '<span class="ledger__label">State Payroll Taxes (est.)</span><span class="ledger__value" id="out-pc-state-payroll">—</span>';
    var local = document.createElement('div'); local.className = 'ledger__row'; local.innerHTML = '<span class="ledger__label">Local Income Tax (est.)</span><span class="ledger__value" id="out-pc-local-tax">—</span>';
    stateRow.parentNode.insertBefore(payroll, stateRow.nextSibling); payroll.parentNode.insertBefore(local, payroll.nextSibling);
  }

  function render(result) {
    var ledger = el('pc-ledger'); if (!ledger) return;
    ensureResultRows();
    if (result.error) { ledger.hidden = false; setText('out-pc-net', 'Check inputs'); setText('pc-state-note', (result.errors || []).map(function (e) { return e.message; }).join(' · ')); return; }
    try {
      var t = result.totals, periods = t.periodsPerYear || 26, period = el('pc-frequency') ? el('pc-frequency').value : 'biweekly';
      var grossPeriod = { weekly: t.grossAnnual / 52, biweekly: t.grossAnnual / 26, semimonthly: t.grossAnnual / 24, monthly: t.grossAnnual / 12 }[period] || t.grossAnnual / 26;
      var netPeriod = { weekly: t.netWeekly, biweekly: t.netBiweekly, semimonthly: t.netSemimonthly, monthly: t.netMonthly }[period] || t.netBiweekly;
      var federal = Number(result.federal && result.federal.withholding && result.federal.withholding.federalWithholdingPerPeriod) || (Number(t.totalFederalWithholding) || 0) / periods;
      var stateIncome = (Number(result.state && result.state.stateIncomeTax) || 0) / periods;
      var statePayroll = (Number(result.state && result.state.payroll && result.state.payroll.totalStatePayrollTax) || 0) / periods;
      var localTax = (Number(result.local && result.local.localIncomeTax) || 0) / periods;
      var fica = (Number(result.fica && result.fica.totalForNetPay) || 0) / periods;
      setText('out-pc-gross', money(grossPeriod)); setText('out-pc-federal', money(federal)); setText('out-pc-state', money(stateIncome)); setText('out-pc-state-payroll', money(statePayroll)); setText('out-pc-local-tax', money(localTax)); setText('out-pc-fica', money(fica)); setText('out-pc-net', money(netPeriod));
      setText('out-pc-annual-gross', money(result.grossAnnual)); setText('out-pc-deductions', money(t.totalDeductions)); setText('out-pc-annual-net', money(t.netAnnual)); setText('out-pc-effective-rate', percent(t.effectiveTaxRate));
      var note = el('pc-state-note'); if (note) { var parts = ['2026 estimate', result.stateName || result.stateAbbr, 'Engine v' + result.ENGINE_VERSION]; if (result.local && result.local.modeled) parts.push((result.local.note || 'Local tax modeled')); else if (result.state && result.state.localTax && result.state.localTax.exists) parts.push('Some local taxes are not modeled'); if (result.warnings && result.warnings.length) parts = parts.concat(result.warnings); note.textContent = parts.join(' · '); }
      ledger.hidden = false; window.__lastPaycheckResult = result;
    } catch (err) { if (window.console && console.error) console.error('render() failed:', err); setText('pc-state-note', 'Display error: ' + (err && err.message ? err.message : 'unknown')); }
  }

  async function calculate() {
    var token = ++requestToken;
    try {
      var loaded = await Promise.all([import('./tax-engine/index.js'), import('../data/states-2026.js')]);
      if (token !== requestToken) return;
      var engine = loaded[0], statesModule = loaded[1]; ensureStates(statesModule.STATES_2026); ensureLocalControls(); refreshLocalOptions();
      var raw = { grossAnnual: numberValue('pc-salary', 0), state: (el('pc-state') && el('pc-state').value) || 'TX', filingStatus: (el('pc-filing-status') && el('pc-filing-status').value) || 'single', payFrequency: 'annual', selectedPayPeriod: (el('pc-frequency') && el('pc-frequency').value) || 'biweekly', age: 0, localJurisdiction: (el('pc-local') && el('pc-local').value) || '', localResidency: (el('pc-local-residency') && el('pc-local-residency').value) || 'resident', deductions: { traditional401kPercent: numberValue('pc-401k', 0), hsa: numberValue('pc-hsa', 0), hsaCoverage: (el('pc-hsa-coverage') && el('pc-hsa-coverage').value) || 'self', healthPremiums: numberValue('pc-health-premiums', 0) }, w4: {} };
      if (raw.grossAnnual <= 0) { var ledger = el('pc-ledger'); if (ledger) ledger.hidden = true; var err = el('err-pc-salary'); if (err) err.textContent = 'Please enter a salary greater than $0.'; return; }
      var errOk = el('err-pc-salary'); if (errOk) errOk.textContent = '';
      render(engine.calculateAll(engine.sanitizeInputs(raw)));
    } catch (err) { if (token !== requestToken) return; if (window.console && console.error) console.error('calculate() failed:', err); var ledger2 = el('pc-ledger'); if (ledger2) ledger2.hidden = false; setText('out-pc-net', 'Unable to calculate'); setText('pc-state-note', "Couldn't calculate paycheck, please try again."); }
  }

  function init() {
    if (initialized) return; initialized = true; var form = el('pc-form'); if (!form) return;
    ['pc-salary','pc-frequency','pc-state','pc-filing-status','pc-401k','pc-hsa','pc-hsa-coverage','pc-health-premiums'].forEach(function(id){var node=el(id);if(node){node.addEventListener('input',calculate);node.addEventListener('change',function(){if(id==='pc-state')refreshLocalOptions();calculate();});}});
    form.addEventListener('submit',function(event){event.preventDefault();calculate();});
    var reset=el('pc-reset-btn');if(reset)reset.addEventListener('click',function(){['pc-salary','pc-401k','pc-hsa','pc-health-premiums'].forEach(function(id){if(el(id))el(id).value='';});if(el('pc-frequency'))el('pc-frequency').value='biweekly';if(el('pc-filing-status'))el('pc-filing-status').value='single';if(el('pc-state'))el('pc-state').value='TX';if(el('pc-hsa-coverage'))el('pc-hsa-coverage').value='self';if(el('pc-local'))el('pc-local').value='';if(el('pc-local-residency'))el('pc-local-residency').value='resident';refreshLocalOptions();var ledger=el('pc-ledger');if(ledger)ledger.hidden=true;window.__lastPaycheckResult=null;});
    var copy=el('pc-copy-btn');if(copy)copy.addEventListener('click',function(){var r=window.__lastPaycheckResult;if(!r||!window.copyToClipboard)return;var t=r.totals;window.copyToClipboard(['US Salary Tools — 2026 Paycheck Estimate','Annual Gross: '+money(r.grossAnnual),'Pre-tax Deductions: '+money(t.pretaxDeductions),'State Income Tax: '+money(t.totalStateTax),'State Payroll Taxes: '+money(t.totalStatePayroll),'Local Income Tax: '+money(t.totalLocal),'Annual Net: '+money(t.netAnnual),'Effective Tax Rate: '+percent(t.effectiveTaxRate)].join('\n'));});
    var print=el('pc-print-btn');if(print)print.addEventListener('click',function(){window.print();});
    calculate();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
