// Hourly to Salary calculator — matches hourly-to-salary.html IDs.
(function(){
  function el(id){return document.getElementById(id);}
  function num(id,fallback){var v=(el(id)&&el(id).value||'').replace(/[$,\s]/g,'');var n=parseFloat(v);return Number.isFinite(n)?n:fallback;}
  function money(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(n)||0);}
  function calculate(){
    var wage=Math.max(0,num('hourly-wage',0));
    var hours=Math.max(0,num('hourly-hours',40));
    var weeks=Math.max(0,Math.min(52,num('hourly-weeks',52)));
    var annual=wage*hours*weeks;
    var monthly=annual/12,biweekly=annual/26,weekly=annual/52,daily=weeks>0?annual/(weeks*5):0;
    if(el('out-h-annual'))el('out-h-annual').textContent=money(annual);
    if(el('out-h-monthly'))el('out-h-monthly').textContent=money(monthly);
    if(el('out-h-biweekly'))el('out-h-biweekly').textContent=money(biweekly);
    if(el('out-h-weekly'))el('out-h-weekly').textContent=money(weekly);
    if(el('out-h-daily'))el('out-h-daily').textContent=money(daily);
    var ledger=el('hourly-ledger');if(ledger)ledger.hidden=annual<=0;
    return {annual:annual,monthly:monthly,biweekly:biweekly,weekly:weekly,daily:daily};
  }
  function init(){
    var form=el('hourly-form');if(!form)return;
    ['hourly-wage','hourly-hours','hourly-weeks'].forEach(function(id){var x=el(id);if(x){x.addEventListener('input',calculate);x.addEventListener('change',calculate);}});
    form.addEventListener('submit',function(e){e.preventDefault();calculate();});
    if(el('hourly-reset-btn'))el('hourly-reset-btn').addEventListener('click',function(){el('hourly-wage').value='';el('hourly-hours').value='40';el('hourly-weeks').value='52';calculate();});
    if(el('hourly-copy-btn'))el('hourly-copy-btn').addEventListener('click',function(){var v=calculate();var text=['Annual: '+money(v.annual),'Monthly: '+money(v.monthly),'Biweekly: '+money(v.biweekly),'Weekly: '+money(v.weekly),'Daily: '+money(v.daily)].join('\n');if(window.copyToClipboard)window.copyToClipboard(text);});
    calculate();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
