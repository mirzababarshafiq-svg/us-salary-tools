// Salary calculator page logic. Loaded as a classic <script>.
(function () {
  function el(id) { return document.getElementById(id); }
  function money(n) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(Number(n)||0); }
  function num(id,fallback){var v=el(id)?el(id).value:'';var n=parseFloat(String(v).replace(/[$,\s]/g,''));return Number.isFinite(n)?n:fallback;}
  function hourlyMode(){var g=el('field-hourly');return !!(g&&!g.classList.contains('hidden'));}
  function calculate(){
    var annual=Math.max(0,num('salary-annual',0));
    var hourly=Math.max(0,num('salary-hourly',0));
    var hours=Math.max(0,num('salary-hours',40));
    var weeks=Math.max(0,Math.min(52,num('salary-weeks',52)));
    if(hourlyMode()) annual=hourly*hours*weeks;
    var totalHours=hours*weeks;
    var v={annually:annual,monthly:annual/12,biweekly:annual/26,weekly:annual/52,daily:weeks>0?annual/(weeks*5):0,hourly:totalHours>0?annual/totalHours:0};
    if(el('out-annual'))el('out-annual').textContent=money(v.annually);
    if(el('out-monthly'))el('out-monthly').textContent=money(v.monthly);
    if(el('out-biweekly'))el('out-biweekly').textContent=money(v.biweekly);
    if(el('out-weekly'))el('out-weekly').textContent=money(v.weekly);
    if(el('out-daily'))el('out-daily').textContent=money(v.daily);
    if(el('out-hourly'))el('out-hourly').textContent=money(v.hourly);
    if(el('salary-ledger'))el('salary-ledger').hidden=annual<=0;
    return v;
  }
  function setMode(mode){var h=mode==='hourly';if(el('field-annual'))el('field-annual').classList.toggle('hidden',h);if(el('field-hourly'))el('field-hourly').classList.toggle('hidden',!h);if(el('mode-annual-btn'))el('mode-annual-btn').setAttribute('aria-pressed',h?'false':'true');if(el('mode-hourly-btn'))el('mode-hourly-btn').setAttribute('aria-pressed',h?'true':'false');calculate();}
  function init(){
    var form=el('salary-form');if(!form)return;
    if(el('mode-annual-btn'))el('mode-annual-btn').addEventListener('click',function(){setMode('annual')});
    if(el('mode-hourly-btn'))el('mode-hourly-btn').addEventListener('click',function(){setMode('hourly')});
    ['salary-annual','salary-hourly','salary-hours','salary-weeks','salary-frequency'].forEach(function(id){if(el(id)){el(id).addEventListener('input',calculate);el(id).addEventListener('change',calculate)}});
    form.addEventListener('submit',function(e){e.preventDefault();calculate()});
    if(el('salary-reset-btn'))el('salary-reset-btn').addEventListener('click',function(){if(el('salary-annual'))el('salary-annual').value='';if(el('salary-hourly'))el('salary-hourly').value='';if(el('salary-hours'))el('salary-hours').value='40';if(el('salary-weeks'))el('salary-weeks').value='52';setMode('annual')});
    if(el('salary-copy-btn'))el('salary-copy-btn').addEventListener('click',function(){var v=calculate();var text=['Annual: '+money(v.annually),'Monthly: '+money(v.monthly),'Biweekly: '+money(v.biweekly),'Weekly: '+money(v.weekly),'Daily: '+money(v.daily),'Hourly: '+money(v.hourly)].join('\n');if(window.copyToClipboard)window.copyToClipboard(text)});
    document.querySelectorAll('.faq-item__q').forEach(function(q){q.addEventListener('click',function(){var item=q.closest('.faq-item'),open=item&&item.getAttribute('data-open')==='true';if(item)item.setAttribute('data-open',open?'false':'true');q.setAttribute('aria-expanded',open?'false':'true')})});
    calculate();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
