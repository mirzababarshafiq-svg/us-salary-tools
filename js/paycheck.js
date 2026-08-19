/* Paycheck Calculator — browser-safe 2026 engine bridge */
(function () {
  var initialized = false;

  function money(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0);
  }

  function percent(n) {
    return (Number(n) || 0).toFixed(1) + '%';
  }

  function el(id) { return document.getElementById(id); }

  function setText(id, value) {
    var node = el(id);
    if (node) node.textContent = value;
  }

  function numberValue(id, fallback) {
    var node = el(id);
    if (!node) return fallback || 0;
    var n = parseFloat(String(node.value || '').replace(/[$,\s]/g, ''));
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function ensureStates(STATES_2026) {
    var select = el('pc-state');
    if (!select || select.options.length) return;
    Object.keys(STATES_2026).sort(function (a, b) {
      return String(STATES_2026[a].name || a).localeCompare(String(STATES_2026[b].name || b));
    }).forEach(function (abbr) {
      var option = document.createElement('option');
      option.value = abbr;
      option.textContent = STATES_2026[abbr].name || abbr;
      select.appendChild(option);
    });
    select.value = 'TX';
  }

  function render(result) {
    var ledger = el('pc-ledger');
    if (!ledger) return;
    if (result.error) {
      ledger.hidden = false;
      setText('out-pc-net', 'Check inputs');
      var note = el('pc-state-note');
      if (note) note.textContent = (result.errors || []).map(function (e) { return e.message; }).join(' · ');
      return;
    }

    var t = result.totals;
    var period = el('pc-frequency') ? el('pc-frequency').value : 'biweekly';
    var grossPeriod = {
      weekly: t.grossAnnual / 52,
      biweekly: t.grossAnnual / 26,
      semimonthly: t.grossAnnual / 24,
      monthly: t.grossAnnual / 12
    }[period] || t.grossAnnual / 26;
    var netPeriod = {
      weekly: t.netWeekly,
      biweekly: t.netBiweekly,
      semimonthly: t.netSemimonthly,
      monthly: t.netMonthly
    }[period] || t.netBiweekly;

    setText('out-pc-gross', money(grossPeriod));
    setText('out-pc-federal', money(result.federal.federalIncomeTax / (t.periodsPerYear || 26)));
    setText('out-pc-state', money((result.state.stateIncomeTax + result.state.payroll.totalStatePayrollTax) / (t.periodsPerYear || 26)));
    setText('out-pc-fica', money(result.fica.totalForNetPay / (t.periodsPerYear || 26)));
    setText('out-pc-net', money(netPeriod));
    setText('out-pc-annual-gross', money(result.grossAnnual));
    setText('out-pc-deductions', money(t.totalDeductions));
    setText('out-pc-annual-net', money(t.netAnnual));
    setText('out-pc-effective-rate', percent(t.effectiveTaxRate));

    var note = el('pc-state-note');
    if (note) {
      note.textContent = '2026 estimate · ' + (result.stateName || result.stateAbbr) + ' · Engine v' + result.ENGINE_VERSION + '. Local/city taxes may not be included.';
    }
    ledger.hidden = false;
    window.__lastPaycheckResult = result;
  }

  var requestToken = 0;

  async function calculate() {
    var myToken = ++requestToken;
    try {
      var engine = await import('./tax-engine/index.js');
      var statesModule = await import('../data/states-2026.js');
      if (myToken !== requestToken) return; // a newer call started; drop this stale one
      ensureStates(statesModule.STATES_2026);

      var raw = {
        grossAnnual: numberValue('pc-salary', 0),
        state: (el('pc-state') && el('pc-state').value) || 'TX',
        filingStatus: (el('pc-filing-status') && el('pc-filing-status').value) || 'single',
        payFrequency: 'annual',
        selectedPayPeriod: (el('pc-frequency') && el('pc-frequency').value) || 'biweekly',
        age: 0,
        deductions: {
          traditional401kPercent: numberValue('pc-401k', 0),
          hsa: numberValue('pc-hsa', 0),
          hsaCoverage: (el('pc-hsa-coverage') && el('pc-hsa-coverage').value) || 'self',
          healthPremiums: numberValue('pc-health-premiums', 0)
        },
        w4: {}
      };

      if (raw.grossAnnual <= 0) {
        var ledger = el('pc-ledger');
        if (ledger) ledger.hidden = true;
        return;
      }

      var sanitized = engine.sanitizeInputs(raw);
      var result = engine.calculateAll(sanitized);
      if (myToken !== requestToken) return; // a newer call finished first
      render(result);
    } catch (err) {
      if (myToken !== requestToken) return;
      var fallback = el('pc-ledger');
      if (fallback) fallback.hidden = false;
      var out = el('out-pc-net');
      if (out) out.textContent = 'Unable to calculate';
      var note = el('pc-state-note');
      if (note) note.textContent = 'Calculator error: ' + (err && err.message ? err.message : 'unknown error');
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    var form = el('pc-form');
    if (!form) return;

    ['pc-salary', 'pc-frequency', 'pc-state', 'pc-filing-status', 'pc-401k', 'pc-hsa', 'pc-hsa-coverage', 'pc-health-premiums'].forEach(function (id) {
      var node = el(id);
      if (!node) return;
      node.addEventListener('input', calculate);
      node.addEventListener('change', calculate);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      calculate();
    });

    var reset = el('pc-reset-btn');
    if (reset) reset.addEventListener('click', function () {
      if (el('pc-salary')) el('pc-salary').value = '';
      if (el('pc-frequency')) el('pc-frequency').value = 'biweekly';
      if (el('pc-filing-status')) el('pc-filing-status').value = 'single';
      if (el('pc-state')) el('pc-state').value = 'TX';
      if (el('pc-401k')) el('pc-401k').value = '';
      if (el('pc-hsa')) el('pc-hsa').value = '';
      if (el('pc-hsa-coverage')) el('pc-hsa-coverage').value = 'self';
      if (el('pc-health-premiums')) el('pc-health-premiums').value = '';
      var ledger = el('pc-ledger');
      if (ledger) ledger.hidden = true;
    });

    var copy = el('pc-copy-btn');
    if (copy) copy.addEventListener('click', function () {
      var r = window.__lastPaycheckResult;
      if (!r || !window.copyToClipboard) return;
      var t = r.totals;
      var text = [
        'US Salary Tools — 2026 Paycheck Estimate',
        'Annual Gross: ' + money(r.grossAnnual),
        'Pre-tax Deductions: ' + money(t.totalDeductions),
        'Annual Net: ' + money(t.netAnnual),
        'Monthly Net: ' + money(t.netMonthly),
        'Biweekly Net: ' + money(t.netBiweekly),
        'Effective Tax Rate: ' + percent(t.effectiveTaxRate)
      ].join('\n');
      window.copyToClipboard(text);
    });

    calculate();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
