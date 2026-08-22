/* State Tax Comparison Calculator — browser-safe (matches site's dynamic-import pattern) */
(function () {
  function el(id) { return document.getElementById(id); }

  function money(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0);
  }
  function percent(n) {
    return (Number(n) || 0).toFixed(1) + '%';
  }
  function numberValue(id, fallback) {
    var node = el(id);
    if (!node) return fallback || 0;
    var n = parseFloat(String(node.value || '').replace(/[$,\s]/g, ''));
    return Number.isFinite(n) ? n : (fallback || 0);
  }
  function setText(id, value) {
    var node = el(id);
    if (node) node.textContent = value;
  }

  var initialized = false;
  var requestToken = 0;

  function populateStates(select, STATES_2026, preferred) {
    if (!select || select.options.length) return;
    var codes = Object.keys(STATES_2026).sort(function (a, b) {
      return String(STATES_2026[a].name || a).localeCompare(String(STATES_2026[b].name || b));
    });
    codes.forEach(function (abbr) {
      var opt = document.createElement('option');
      opt.value = abbr;
      opt.textContent = STATES_2026[abbr].name || abbr;
      if (abbr === preferred) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function clearErrors() {
    var e = el('err-sc-salary');
    if (e) e.textContent = '';
  }

  async function calculate() {
    var myToken = ++requestToken;
    clearErrors();
    try {
      var engine = await import('./tax-engine/index.js');
      var statesModule = await import('../data/states-2026.js');
      if (myToken !== requestToken) return;

      populateStates(el('sc-state-a'), statesModule.STATES_2026, 'TX');
      populateStates(el('sc-state-b'), statesModule.STATES_2026, 'CA');

      var salary = numberValue('sc-salary', 0);
      if (salary <= 0) {
        var ledgerEl = el('sc-ledger');
        if (ledgerEl) ledgerEl.hidden = true;
        return;
      }
      var filingStatus = el('sc-filing-status') ? el('sc-filing-status').value : 'single';
      var stateA = el('sc-state-a') ? el('sc-state-a').value : 'TX';
      var stateB = el('sc-state-b') ? el('sc-state-b').value : 'CA';

      var base = {
        grossAnnual: salary,
        filingStatus: filingStatus,
        payFrequency: 'annual',
        selectedPayPeriod: 'monthly',
        deductions: {},
        w4: {}
      };
      var sanitizedA = engine.sanitizeInputs(Object.assign({}, base, { state: stateA }));
      var sanitizedB = engine.sanitizeInputs(Object.assign({}, base, { state: stateB }));
      var resultA = engine.calculateAll(sanitizedA);
      var resultB = engine.calculateAll(sanitizedB);
      if (myToken !== requestToken) return;

      if (resultA.error || resultB.error) {
        var errNote = el('err-sc-salary');
        if (errNote) {
          var msgs = (resultA.errors || resultB.errors || []).map(function (e) { return e.message; }).join(' · ');
          errNote.textContent = msgs || 'Please check your inputs.';
        }
        var ledgerErr = el('sc-ledger');
        if (ledgerErr) ledgerErr.hidden = true;
        return;
      }

      render(resultA, resultB, statesModule.STATES_2026);
    } catch (err) {
      if (myToken !== requestToken) return;
      if (window.console && console.error) console.error('state comparison failed:', err);
      var errNote2 = el('err-sc-salary');
      if (errNote2) errNote2.textContent = 'Calculator error: ' + (err && err.message ? err.message : 'unknown error');
    }
  }

  function render(a, b, STATES_2026) {
    var ledger = el('sc-ledger');
    if (!ledger) return;
    try {
      var nameA = (STATES_2026[a.stateAbbr] && STATES_2026[a.stateAbbr].name) || a.stateAbbr;
      var nameB = (STATES_2026[b.stateAbbr] && STATES_2026[b.stateAbbr].name) || b.stateAbbr;

      setText('sc-head-a', nameA);
      setText('sc-head-b', nameB);

      setText('sc-a-gross', money(a.grossAnnual));
      setText('sc-b-gross', money(b.grossAnnual));
      setText('sc-a-federal', money(a.federal.federalIncomeTax));
      setText('sc-b-federal', money(b.federal.federalIncomeTax));
      setText('sc-a-state', money(a.state.stateIncomeTax));
      setText('sc-b-state', money(b.state.stateIncomeTax));
      setText('sc-a-fica', money(a.fica.totalForNetPay));
      setText('sc-b-fica', money(b.fica.totalForNetPay));
      setText('sc-a-net', money(a.totals.netAnnual));
      setText('sc-b-net', money(b.totals.netAnnual));
      setText('sc-a-net-monthly', money(a.totals.netMonthly));
      setText('sc-b-net-monthly', money(b.totals.netMonthly));
      setText('sc-a-rate', percent(a.totals.effectiveTaxRate));
      setText('sc-b-rate', percent(b.totals.effectiveTaxRate));

      var diff = a.totals.netAnnual - b.totals.netAnnual;
      var summary = el('sc-summary');
      if (summary) {
        if (Math.abs(diff) < 1) {
          summary.innerHTML = '<span class="ledger__label">Result</span><span class="ledger__value" style="font-size:1.3rem;">' + nameA + ' and ' + nameB + ' net about the same take-home pay.</span>';
        } else {
          var winner = diff > 0 ? nameA : nameB;
          summary.innerHTML = '<span class="ledger__label">You would take home more in</span><span class="ledger__value" style="font-size:2rem;">' + winner + '</span><span class="ledger__label" style="margin-top:4px;">' + money(Math.abs(diff)) + ' more per year</span>';
        }
      }

      ledger.hidden = false;
      window.__lastComparisonResult = { a: a, b: b, nameA: nameA, nameB: nameB };
    } catch (renderErr) {
      if (window.console && console.error) console.error('render() failed:', renderErr);
    }
  }

  function resetForm() {
    var form = el('sc-form');
    if (form) form.reset();
    var ledger = el('sc-ledger');
    if (ledger) ledger.hidden = true;
    clearErrors();
    window.__lastComparisonResult = null;
  }

  function init() {
    if (initialized) return;
    initialized = true;
    var form = el('sc-form');
    if (!form) return;

    ['sc-salary', 'sc-filing-status', 'sc-state-a', 'sc-state-b'].forEach(function (id) {
      var node = el(id);
      if (node) {
        node.addEventListener('input', calculate);
        node.addEventListener('change', calculate);
      }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      calculate();
    });

    var resetBtn = el('sc-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetForm);

    var copyBtn = el('sc-copy-btn');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var r = window.__lastComparisonResult;
      if (!r) return;
      var text = [
        r.nameA + ' vs ' + r.nameB,
        r.nameA + ' Net Annual: ' + money(r.a.totals.netAnnual),
        r.nameB + ' Net Annual: ' + money(r.b.totals.netAnnual),
        'Difference: ' + money(Math.abs(r.a.totals.netAnnual - r.b.totals.netAnnual))
      ].join('\n');
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    });

    var printBtn = el('sc-print-btn');
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

    // Pre-populate the state dropdowns immediately so they're not empty before first calc
    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
