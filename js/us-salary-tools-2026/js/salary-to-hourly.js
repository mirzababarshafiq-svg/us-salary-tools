import { formatCurrency } from "./tax-engine/formatting.js";
function calc(){
  const annual=parseFloat(document.getElementById("annualSalary")?.value||0);
  const hours=parseFloat(document.getElementById("hoursPerWeek")?.value||40);
  const weeks=parseFloat(document.getElementById("weeksPerYear")?.value||52);
  const totalHours=hours*weeks;
  const hourly=totalHours>0?annual/totalHours:0;
  const el=document.getElementById("hourlyResult");
  if (el) el.textContent=`Hourly: ${formatCurrency(hourly)} Weekly: ${formatCurrency(annual/52)}`;
}
document.addEventListener("DOMContentLoaded",()=>{
  ["annualSalary","hoursPerWeek","weeksPerYear"].forEach(id=>{
    const el=document.getElementById(id);
    if (el) el.addEventListener("input",calc);
  });
  calc();
});
