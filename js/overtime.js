/* Overtime Calculator — browser-safe */
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
    ['err-ot-rate', 'err-ot-regular-hours', 'err-ot-overtime-hours', 'err-ot-multiplier'].forEach(function (id) {
      var node = el(id);
      if (node) node.textContent = '';
    });
  }
  function calc() {
    clearErrors();
    var rate = num('ot-rate', 0);
    var regularHours = num('ot-regular-hours', 40);
    var overtimeHours = num('ot-overtime-hours', 0);
    var multiplier = num('ot-multiplier', 1.5);
    var ledger = el('ot-ledger');

    var hasError = false;
    if (!(rate >= 0)) { var er = el('err-ot-rate'); if (er) er.textContent = 'Enter a valid hourly rate'; hasError = true; }
    if (!(regularHours >= 0 && regularHours <= 168)) { var erh = el('err-ot-regular-hours'); if (erh) erh.textContent = 'Regular hours 0-168'; hasError = true; }
    if (!(overtimeHours >= 0 && overtimeHours <= 168)) { var eoh = el('err-ot-overtime-hours'); if (eoh) eoh.textContent = 'Overtime hours 0-168'; hasError = true; }
    if (!(multiplier >= 1)) { var em = el('err-ot-multiplier'); if (em) em.textContent = 'Multiplier must be at least 1'; hasError = true; }

    if (hasError || !rate) {
      if (ledger) ledger.hidden = true;
      return;
    }

    var overtimeRate = rate * multiplier;
    var regularPay = rate * regularHours;
    var overtimePay = overtimeRate * overtimeHours;
    var totalPay = regularPay + overtimePay;

    if (el('out-ot-regular-pay')) el('out-ot-regular-pay').textContent = money(regularPay);
    if (el('out-ot-rate')) el('out-ot-rate').textContent = money(overtimeRate);
    if (el('out-ot-overtime-pay')) el('out-ot-overtime-pay').textContent = money(overtimePay);
    if (el('out-ot-total-pay')) el('out-ot-total-pay').textContent = money(totalPay);
    if (ledger) ledger.hidden = false;
    window.__lastOvertimeResult = { regularPay: regularPay, overtimeRate: overtimeRate, overtimePay: overtimePay, totalPay: totalPay };
  }
  document.addEventListener('DOMContentLoaded', function () {
    var form = el('ot-form');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    var reset = el('ot-reset-btn');
    if (reset) reset.addEventListener('click', function () {
      if (form) form.reset();
      var ledger = el('ot-ledger');
      if (ledger) ledger.hidden = true;
      clearErrors();
      window.__lastOvertimeResult = null;
    });
    var copy = el('ot-copy-btn');
    if (copy) copy.addEventListener('click', function () {
      var r = window.__lastOvertimeResult;
      if (!r) return;
      var text = 'Regular Pay: ' + money(r.regularPay) + '\nOvertime Rate: ' + money(r.overtimeRate) + '\nOvertime Pay: ' + money(r.overtimePay) + '\nTotal Pay: ' + money(r.totalPay);
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
    });
  });
})();
