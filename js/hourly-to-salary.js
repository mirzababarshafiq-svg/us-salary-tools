import { sanitizeInputs } from "./tax-engine/validation.js";
import { formatCurrency } from "./tax-engine/formatting.js";
function calc(){
  const hourly=parseFloat(document.getElementById("hourlyRate")?.value||0);
  const hours=parseFloat(document.getElementById("hoursPerWeek")?.value||40);
  const weeks=parseFloat(document.getElementById("weeksPerYear")?.value||52);
  const annual=hourly*hours*weeks;
  const el=document.getElementById("salaryResult");
  if (el) el.textContent=`Annual: ${formatCurrency(annual)} Monthly: ${formatCurrency(annual/12)} Biweekly: ${formatCurrency(annual/26)}`;
}
document.addEventListener("DOMContentLoaded",()=>{
  ["hourlyRate","hoursPerWeek","weeksPerYear"].forEach(id=>{
    const el=document.getElementById(id);
    if (el) el.addEventListener("input",calc);
  });
  calc();
});
