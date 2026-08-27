/* State Tax Comparison Calculator — browser-safe and accessible */
(function () {
  function el(id) { return document.getElementById(id); }
  function money(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0); }
  function percent(n) { return (Number(n) || 0).toFixed(1) + '%'; }
  function numberValue(id) { var node = el(id); if (!node) return 0; var n = parseFloat(String(node.value || '').replace(/[$,\s]/g, '')); return Number.isFinite(n) ? n : 0; }
  function setText(id, value) { var node = el(id); if (node) node.textContent = value; }
  function getPeriods(frequency) { return { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 }[frequency] || 26; }
  function statePayrollPerPeriod(result, periods) { return (Number(result.state && result.state.payroll && result.state.payroll.totalStatePayrollTax) || 0) / periods; }
  function stateIncomePerPeriod(result, periods) { return (Number(result.state && result.state.stateIncomeTax) || 0) / periods; }
  var initialized = false, requestToken = 0, debounceTimer = null, modulesPromise = null;
  function setBusy(busy) { var form = el('sc-form'), ledger = el('sc-ledger'), button = el('sc-calculate-btn'); if (form) form.setAttribute('aria-busy', busy ? 'true' : 'false'); if (ledger) ledger.setAttribute('aria-busy', busy ? 'true' : 'false'); if (button) { button.disabled = busy; button.textContent = busy ? 'Comparing…' : 'Compare States'; } setText('sc-status', busy ? 'Comparing both states…' : ''); }
  function setError(message) { setText('err-sc-salary', message || ''); if (message) setText('sc-status', message); }
  function clearErrors() { setText('err-sc-salary', ''); setText('sc-status', ''); }
  function populateStates(select, states, preferred) { if (!select || select.options.length) return; Object.keys(states).sort(function (a,b) { return String(states[a].name || a).localeCompare(String(states[b].name || b)); }).forEach(function (abbr) { var option = document.createElement('option'); option.value = abbr; option.textContent = states[abbr].name || abbr; select.appendChild(option); }); if (preferred && states[preferred]) select.value = preferred; }
  function loadModules() { if (!modulesPromise) modulesPromise = Promise.all([import('./tax-engine/index.js'), import('../data/states-2026.js')]); return modulesPromise; }
  async function calculate() {
    var token = ++requestToken; clearErrors(); var salary = numberValue('sc-salary');
    if (salary <= 0) { var emptyLedger = el('sc-ledger'); if (emptyLedger) emptyLedger.hidden = true; setError('Please enter a salary greater than $0.'); return; }
    setBusy(true);
    try {
      var loaded = await loadModules(), engine = loaded[0], statesModule = loaded[1]; if (token !== requestToken) return;
      populateStates(el('sc-state-a'), statesModule.STATES_2026, 'TX'); populateStates(el('sc-state-b'), statesModule.STATES_2026, 'CA');
      var filingStatus = el('sc-filing-status') ? el('sc-filing-status').value : 'single';
      var frequency = el('sc-frequency') ? el('sc-frequency').value : 'biweekly';
      var stateA = el('sc-state-a') ? el('sc-state-a').value : 'TX'; var stateB = el('sc-state-b') ? el('sc-state-b').value : 'CA';
      var base = { grossAnnual: salary, filingStatus: filingStatus, payFrequency: 'annual', selectedPayPeriod: frequency, deductions: {}, w4: {} };
      var resultA = engine.calculateAll(engine.sanitizeInputs(Object.assign({}, base, { state: stateA }))), resultB = engine.calculateAll(engine.sanitizeInputs(Object.assign({}, base, { state: stateB })));
      if (token !== requestToken) return;
      if (resultA.error || resultB.error) { setError('Please check your inputs and try again.'); var failedLedger = el('sc-ledger'); if (failedLedger) failedLedger.hidden = true; return; }
      render(resultA, resultB, statesModule.STATES_2026, frequency);
    } catch (err) { if (token !== requestToken) return; if (window.console && console.error) console.error('state comparison failed:', err); var failed = el('sc-ledger'); if (failed) failed.hidden = true; setError("Couldn't load comparison, please try again."); }
    finally { if (token === requestToken) setBusy(false); }
  }
  function render(a, b, states, frequency) {
    var ledger = el('sc-ledger'); if (!ledger) return; var periods = getPeriods(frequency);
    var nameA = (states[a.stateAbbr] && states[a.stateAbbr].name) || a.stateAbbr, nameB = (states[b.stateAbbr] && states[b.stateAbbr].name) || b.stateAbbr;
    var aFederal = Number(a.federal && a.federal.withholding && a.federal.withholding.federalWithholdingPerPeriod) || (Number(a.federal && a.federal.federalIncomeTax) || 0) / periods;
    var bFederal = Number(b.federal && b.federal.withholding && b.federal.withholding.federalWithholdingPerPeriod) || (Number(b.federal && b.federal.federalIncomeTax) || 0) / periods;
    var aState = stateIncomePerPeriod(a, periods), bState = stateIncomePerPeriod(b, periods), aPayroll = statePayrollPerPeriod(a, periods), bPayroll = statePayrollPerPeriod(b, periods);
    var aFica = (Number(a.fica && a.fica.totalForNetPay) || 0) / periods, bFica = (Number(b.fica && b.fica.totalForNetPay) || 0) / periods;
    setText('sc-head-a', nameA); setText('sc-head-b', nameB); setText('sc-a-gross', money(a.totals.grossPerSelectedPeriod)); setText('sc-b-gross', money(b.totals.grossPerSelectedPeriod));
    setText('sc-a-federal', money(aFederal)); setText('sc-b-federal', money(bFederal)); setText('sc-a-state', money(aState)); setText('sc-b-state', money(bState)); setText('sc-a-state-payroll', money(aPayroll)); setText('sc-b-state-payroll', money(bPayroll));
    setText('sc-a-fica', money(aFica)); setText('sc-b-fica', money(bFica)); setText('sc-a-net', money(a.totals.netPerSelectedPeriod)); setText('sc-b-net', money(b.totals.netPerSelectedPeriod));
    setText('sc-a-annual-gross', money(a.totals.grossAnnual)); setText('sc-b-annual-gross', money(b.totals.grossAnnual)); setText('sc-a-annual-net', money(a.totals.netAnnual)); setText('sc-b-annual-net', money(b.totals.netAnnual)); setText('sc-a-rate', percent(a.totals.effectiveTaxRate)); setText('sc-b-rate', percent(b.totals.effectiveTaxRate));
    var diff = (Number(a.totals.netAnnual) || 0) - (Number(b.totals.netAnnual) || 0), summary = el('sc-summary');
    if (summary) summary.textContent = Math.abs(diff) < 1 ? 'You would take home about the same amount in ' + nameA + ' and ' + nameB + '.' : 'You would take home ' + money(Math.abs(diff)) + ' more per year in ' + (diff > 0 ? nameA : nameB) + ' than in ' + (diff > 0 ? nameB : nameA) + '.';
    var note = []; if ((a.local && a.local.modeled === false) || (b.local && b.local.modeled === false)) note.push('Some city/county/local income taxes are not modeled, so actual take-home pay may differ.'); if ((a.state && a.state.confidence) !== 'verified' || (b.state && b.state.confidence) !== 'verified') note.push('One or both state estimates use modeled/estimated state rules.'); setText('sc-note', note.join(' '));
    ledger.hidden = false; window.__lastComparisonResult = { a:a, b:b, nameA:nameA, nameB:nameB, frequency:frequency };
  }
  function scheduleCalculate() { window.clearTimeout(debounceTimer); debounceTimer = window.setTimeout(calculate, 180); }
  function swapStates() { var a = el('sc-state-a'), b = el('sc-state-b'); if (!a || !b) return; var value = a.value; a.value = b.value; b.value = value; scheduleCalculate(); }
  function resetForm() { var form = el('sc-form'); if (form) form.reset(); var a = el('sc-state-a'), b = el('sc-state-b'), frequency = el('sc-frequency'), ledger = el('sc-ledger'); if (a) a.value = 'TX'; if (b) b.value = 'CA'; if (frequency) frequency.value = 'biweekly'; if (ledger) ledger.hidden = true; clearErrors(); window.__lastComparisonResult = null; setBusy(false); }
  function init() {
    if (initialized) return; var form = el('sc-form'); if (!form) return; initialized = true;
    loadModules().then(function (loaded) { var states = loaded[1].STATES_2026; populateStates(el('sc-state-a'), states, 'TX'); populateStates(el('sc-state-b'), states, 'CA'); }).catch(function () { setError("Couldn't load comparison, please try again."); });
    var salary = el('sc-salary'); if (salary) salary.addEventListener('input', scheduleCalculate);
    ['sc-frequency','sc-filing-status','sc-state-a','sc-state-b'].forEach(function (id) { var node = el(id); if (node) node.addEventListener('change', scheduleCalculate); });
    form.addEventListener('submit', function (e) { e.preventDefault(); calculate(); });
    var swap = el('sc-swap-btn'); if (swap) swap.addEventListener('click', swapStates);
    var reset = el('sc-reset-btn'); if (reset) reset.addEventListener('click', resetForm);
    var copy = el('sc-copy-btn'); if (copy) copy.addEventListener('click', function () { var r = window.__lastComparisonResult; if (!r) return; var text = [r.nameA + ' vs ' + r.nameB, 'Pay frequency: ' + r.frequency, r.nameA + ' Net Pay: ' + money(r.a.totals.netPerSelectedPeriod) + ' per period', r.nameB + ' Net Pay: ' + money(r.b.totals.netPerSelectedPeriod) + ' per period', 'Difference: ' + money(Math.abs((r.a.totals.netAnnual || 0) - (r.b.totals.netAnnual || 0))) + ' per year'].join('\n'); if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {}); });
    var print = el('sc-print-btn'); if (print) print.addEventListener('click', function () { window.print(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
