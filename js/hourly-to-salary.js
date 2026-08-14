/* Hourly to Salary — browser-safe */
(function () {
  function money(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0); }
  function calc() {
    var hourly = parseFloat((document.getElementById('hourlyRate') || {}).value || 0) || 0;
    var hours = parseFloat((document.getElementById('hoursPerWeek') || {}).value || 40) || 40;
    var weeks = parseFloat((document.getElementById('weeksPerYear') || {}).value || 52) || 52;
    var annual = hourly * hours * weeks;
    var el = document.getElementById('salaryResult');
    if (el) el.textContent = 'Annual: ' + money(annual) + ' Monthly: ' + money(annual / 12) + ' Biweekly: ' + money(annual / 26);
  }
  document.addEventListener('DOMContentLoaded', function () {
    ['hourlyRate', 'hoursPerWeek', 'weeksPerYear'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener('input', calc); el.addEventListener('change', calc); }
    });
    calc();
  });
})();
