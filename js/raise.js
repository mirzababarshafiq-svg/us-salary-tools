/* Raise Calculator — browser-safe */
(function () {
  function money(n) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n) || 0); }
  function num(id, fallback) {
    var node = document.getElementById(id);
    var n = parseFloat(String(node ? node.value : '').replace(/[$,%\s,]/g, ''));
    return Number.isFinite(n) ? n : (fallback || 0);
  }
  function calculate() {
    var current = num('raise-current-salary', 0);
    var pct = num('raise-percent', 0);
    var hours = Math.max(0, num('raise-hours', 40));
    var weeks = Math.max(0, Math.min(52, num('raise-weeks', 52)));
    var amount = current * (pct / 100);
    var next = current + amount;
    var hourly = hours * weeks > 0 ? amount / (hours * weeks) : 0;
    var values = {
      current: current,
      amount: amount,
      next: next,
      monthly: amount / 12,
      biweekly: amount / 26,
      hourly: hourly
    };
    ['current','amount','new','monthly','biweekly','hourly'].forEach(function (name) {
      var node = document.getElementById('out-raise-' + name);
      if (!node) return;
      var key = name === 'new' ? 'next' : name;
      node.textContent = money(values[key]);
    });
    var ledger = document.getElementById('raise-ledger');
    if (ledger) ledger.hidden = current <= 0;
    return values;
  }
  function init() {
    var form = document.getElementById('raise-form');
    if (!form) return;
    ['raise-current-salary','raise-percent','raise-hours','raise-weeks'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) { node.addEventListener('input', calculate); node.addEventListener('change', calculate); }
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); calculate(); });
    var reset = document.getElementById('raise-reset-btn');
    if (reset) reset.addEventListener('click', function () {
      document.getElementById('raise-current-salary').value = '';
      document.getElementById('raise-percent').value = '';
      document.getElementById('raise-hours').value = '40';
      document.getElementById('raise-weeks').value = '52';
      var ledger = document.getElementById('raise-ledger');
      if (ledger) ledger.hidden = true;
    });
    var copy = document.getElementById('raise-copy-btn');
    if (copy) copy.addEventListener('click', function () {
      var v = calculate();
      var text = ['Current Salary: ' + money(v.current), 'Raise Amount: ' + money(v.amount), 'New Salary: ' + money(v.next), 'Monthly Increase: ' + money(v.monthly), 'Biweekly Increase: ' + money(v.biweekly), 'Hourly Increase: ' + money(v.hourly)].join('\n');
      if (window.copyToClipboard) window.copyToClipboard(text);
    });
    calculate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
