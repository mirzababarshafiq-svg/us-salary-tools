import { sanitizeInputs } from "./tax-engine/validation.js";
import { formatCurrency } from "./tax-engine/formatting.js";
function calculateOvertime(){
  const regularRate=parseFloat(document.getElementById("regularRate")?.value||0);
  const otHours=parseFloat(document.getElementById("overtimeHours")?.value||0);
  const rateEl=document.getElementById("overtimeRate");
  const mult=rateEl?parseFloat(rateEl.value)||1.5:1.5;
  const otPay=regularRate*mult*otHours;
  const total=regularRate*40+otPay;
  const resEl=document.getElementById("overtimeResult");
  if (resEl) resEl.textContent=`OT Pay: ${formatCurrency(otPay)} Total Weekly: ${formatCurrency(total)} Annual Est: ${formatCurrency(total*52)}`;
}
document.addEventListener("DOMContentLoaded",()=>{
  ["regularRate","overtimeHours","overtimeRate"].forEach(id=>{
    const el=document.getElementById(id);
    if (el) el.addEventListener("input",calculateOvertime);
  });
  calculateOvertime();
});
