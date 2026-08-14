// Shared browser-safe utilities. Loaded as a classic <script>.
(function () {
  function roundCents(amount) { return Math.round((Number(amount) || 0) * 100) / 100; }
  function formatCurrency(amount, opts) {
    opts = opts || {}; var decimals = typeof opts.decimals === 'number' ? opts.decimals : 2;
    var n = Number(amount); if (!Number.isFinite(n)) n = 0;
    return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(roundCents(n));
  }
  function formatPercent(value, decimals) { decimals = typeof decimals === 'number' ? decimals : 2; var n = Number(value); if (!Number.isFinite(n)) n=0; return Math.max(-100,Math.min(200,n)).toFixed(decimals)+'%'; }
  function allocatePeriods(annual, periods) { annual=Number(annual)||0; periods=Number(periods)||0; if(!Number.isFinite(annual)||periods<=0)return[]; var per=Math.floor(annual*100/periods)/100, a=new Array(periods).fill(per), rem=Math.round((annual-per*periods)*100); for(var i=0;i<rem;i++)a[i%periods]=roundCents(a[i%periods]+0.01); return a; }
  function copyToClipboard(text){ if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(String(text)); var el=document.createElement('textarea'); el.value=String(text); document.body.appendChild(el); el.select(); try{document.execCommand('copy')}finally{document.body.removeChild(el)} return Promise.resolve(); }
  window.formatCurrency=formatCurrency; window.formatPercent=formatPercent; window.roundCents=roundCents; window.allocatePeriods=allocatePeriods; window.copyToClipboard=copyToClipboard;
})();
