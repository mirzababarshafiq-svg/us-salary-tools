/* Overtime Calculator — browser-safe */
(function () {
  function money(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0); }
  function calculateOvertime() {
    var regularRate = parseFloat((document.getElementById('regularRate') || {}).value || 0) || 0;
    var otHours = parseFloat((document.getElementById('overtimeHours') || {}).value || 0) || 0;
    var rateEl = document.getElementById('overtimeRate');
    var mult = rateEl ? parseFloat(rateEl.value) || 1.5 : 1.5;
    var otPay = regularRate * mult * otHours;
    var total = regularRate * 40 + otPay;
    var resEl = document.getElementById('overtimeResult');
    if (resEl) resEl.textContent = 'OT Pay: ' + money(otPay) + ' Total Weekly: ' + money(total) + ' Annual Est: ' + money(total * 52);
  }
  document.addEventListener('DOMContentLoaded', function () {
    ['regularRate', 'overtimeHours', 'overtimeRate'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener('input', calculateOvertime); el.addEventListener('change', calculateOvertime); }
    });
    calculateOvertime();
  });
})();
