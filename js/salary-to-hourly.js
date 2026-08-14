/* Salary to Hourly — browser-safe */
(function () {
  function money(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0); }
  function calc() {
    var annual = parseFloat((document.getElementById('annualSalary') || {}).value || 0) || 0;
    var hours = parseFloat((document.getElementById('hoursPerWeek') || {}).value || 40) || 40;
    var weeks = parseFloat((document.getElementById('weeksPerYear') || {}).value || 52) || 52;
    var totalHours = hours * weeks;
    var hourly = totalHours > 0 ? annual / totalHours : 0;
    var el = document.getElementById('hourlyResult');
    if (el) el.textContent = 'Hourly: ' + money(hourly) + ' Weekly: ' + money(annual / 52);
  }
  document.addEventListener('DOMContentLoaded', function () {
    ['annualSalary', 'hoursPerWeek', 'weeksPerYear'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener('input', calc); el.addEventListener('change', calc); }
    });
    calc();
  });
})();
