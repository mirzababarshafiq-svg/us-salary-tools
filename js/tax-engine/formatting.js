export const ENGINE_VERSION = "2026.1.0";
export const TAX_YEAR = 2026;
export function formatCurrency(amount, opts={}) {
  const {decimals=2}=opts;
  if (!isFinite(amount) || amount==null) return "$0.00";
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(Math.round(amount*100)/100);
}
export function formatPercent(value,decimals=2){
  if (!isFinite(value) || value==null) return "0%";
  return `${Math.max(-100,Math.min(200,value)).toFixed(decimals)}%`;
}
export function formatCurrencyPlain(amount){return (Math.round(amount*100)/100).toFixed(2);}
export function roundCents(amount){return Math.round(amount*100)/100;}
export function allocatePeriods(annual,periods){
  if (!isFinite(annual) || periods<=0) return [];
  const per=Math.floor((annual*100)/periods)/100;
  const allocations=new Array(periods).fill(per);
  let sum=per*periods;
  let remainderCents=Math.round((annual-sum)*100);
  let i=0;
  while(remainderCents>0){allocations[i%periods]=roundCents(allocations[i%periods]+0.01);remainderCents--;i++;}
  return allocations;
}
