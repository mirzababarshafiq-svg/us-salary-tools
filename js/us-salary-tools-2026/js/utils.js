import { formatCurrency, formatPercent, roundCents, allocatePeriods } from "./tax-engine/formatting.js";
export { formatCurrency, formatPercent, roundCents, allocatePeriods };
export function copyToClipboard(text){
  if (navigator.clipboard) return navigator.clipboard.writeText(text);
  const el=document.createElement("textarea");
  el.value=text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  return Promise.resolve();
}
