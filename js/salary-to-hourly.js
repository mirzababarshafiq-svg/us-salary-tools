/* Salary to Hourly — browser-safe */
(function () {
  function money(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0); }
  function el(id) { return document.getElementById(id); }
  function num(id, fallback) {
    var node = el(id);
    if (!node) return fallback || 0;
    var n = parseFloat(String(node.value || '').replace(/[$,\s]/g, ''));
    return Number.isFinite(n) ? n : (fallback || 0);
  }
  function clearErrors() {
    ['err-stoh-salary', 'err-stoh-hours', 'err-stoh-weeks'].forEach(function (id) {
      var node = el(id);
      if (node) node.textContent = '';
    });
  }
  function calc() {
    clearErrors();
    var salary = num('stoh-salary', 0);
    var hours = num('stoh-hours', 40);
    var weeks = num('stoh-weeks', 52);
    var ledger = el('stoh-ledger');

    var hasError = false;
    if (!(hours >= 0 && hours <= 168)) { var eh = el('err-stoh-hours'); if (eh) eh.textContent = 'Hours per week 0-168'; hasError = true; }
    if (!(weeks >= 0 && weeks <= 52)) { var ew = el('err-stoh-weeks'); if (ew) ew.textContent = 'Weeks per year 0-52'; hasError = true; }

    if (hasError || !(salary > 0)) {
      var es = el('err-stoh-salary');
      if (es && !(salary > 0)) es.textContent = 'Please enter a salary greater than $0.';
      if (ledger) ledger.hidden = true;
      return;
    }

    var totalHours = hours * weeks;
    var hourly = totalHours > 0 ? salary / totalHours : 0;
    var weekly = salary / 52;
    var biweekly = salary / 26;
    var monthly = salary / 12;
    var daily = hours > 0 ? (hours / 5) * hourly : 0;

    if (el('out-s-hourly')) el('out-s-hourly').textContent = money(hourly);
    if (el('out-s-weekly')) el('out-s-weekly').textContent = money(weekly);
    if (el('out-s-biweekly')) el('out-s-biweekly').textContent = money(biweekly);
    if (el('out-s-monthly')) el('out-s-monthly').textContent = money(monthly);
    if (el('out-s-daily')) el('out-s-daily').textContent = money(daily);
    if (ledger) ledger.hidden = false;
    window.__lastStohResult = { hourly: hourly, weekly: weekly, biweekly: biweekly, monthly: monthly, daily: daily };
  }
  document.addEventListener('DOMContentLoaded', function () {
    var form = el('stoh-form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    var reset = el('stoh-reset-btn');
    if (reset) reset.addEventListener('click', function () {
      if (form) form.reset();
      var ledger = el('stoh-ledger');
      if (ledger) ledger.hidden = true;
      clearErrors();
      window.__lastStohResult = null;
    });
    var copy = el('stoh-copy-btn');
    if (copy) copy.addEventListener('click', function () {
      var r = window.__lastStohResult;
      if (!r) return;
      var text = 'Hourly: ' + money(r.hourly) + '\nWeekly: ' + money(r.weekly) + '\nBiweekly: ' + money(r.biweekly) + '\nMonthly: ' + money(r.monthly) + '\nDaily: ' + money(r.daily);
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    });
  });
})();
