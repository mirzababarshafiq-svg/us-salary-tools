import { formatCurrency } from "./tax-engine/formatting.js";
import { sanitizeInputs, validateInputs } from "./tax-engine/validation.js";
function getElements(){
  return {
    annualInput: document.getElementById("annualSalary") || document.querySelector("[data-annual-salary]"),
    hourlyInput: document.getElementById("hourlyRate"),
    hoursPerWeek: document.getElementById("hoursPerWeek"),
    weeksPerYear: document.getElementById("weeksPerYear"),
    payFrequency: document.getElementById("payFrequency"),
    resultAnnual: document.getElementById("resultAnnual"),
    resultMonthly: document.getElementById("resultMonthly"),
    resultBiweekly: document.getElementById("resultBiweekly"),
    resultWeekly: document.getElementById("resultWeekly"),
    resultDaily: document.getElementById("resultDaily"),
    resultHourly: document.getElementById("resultHourly"),
  };
}
function calculate(){
  const els=getElements();
  if (!els.annualInput && !els.hourlyInput) return;
  const raw={
    grossAnnual: els.annualInput?els.annualInput.value:0,
    hourlyRate: els.hourlyInput?els.hourlyInput.value:0,
    hoursPerWeek: els.hoursPerWeek?els.hoursPerWeek.value:40,
    weeksPerYear: els.weeksPerYear?els.weeksPerYear.value:52,
    payFrequency: els.payFrequency?els.payFrequency.value:"annual"
  };
  const sanitized=sanitizeInputs(raw);
  const validation=validateInputs(sanitized);
  if (!validation.valid){
    if (els.resultAnnual) els.resultAnnual.textContent="Enter your salary to estimate your take-home pay.";
    return;
  }
  let grossAnnual=sanitized.grossAnnual;
  if (raw.payFrequency==="hourly" || (els.hourlyInput && els.hourlyInput.value && !els.annualInput.value)){
    grossAnnual=sanitized.hourlyRate*sanitized.hoursPerWeek*sanitized.weeksPerYear;
  } else if (raw.payFrequency==="monthly") grossAnnual=sanitized.grossAnnual*12;
  else if (raw.payFrequency==="semimonthly") grossAnnual=sanitized.grossAnnual*24;
  else if (raw.payFrequency==="biweekly") grossAnnual=sanitized.grossAnnual*26;
  else if (raw.payFrequency==="weekly") grossAnnual=sanitized.grossAnnual*52;
  else if (raw.payFrequency==="daily") grossAnnual=sanitized.grossAnnual*(sanitized.daysPerYear||260);
  if (grossAnnual===0){
    if (els.resultAnnual) els.resultAnnual.textContent="Enter your salary to estimate your take-home pay.";
    return;
  }
  const hoursPerWeek=sanitized.hoursPerWeek||40;
  const weeksPerYear=sanitized.weeksPerYear||52;
  const totalHours=hoursPerWeek*weeksPerYear;
  const monthly=grossAnnual/12;
  const semimonthly=grossAnnual/24;
  const biweekly=grossAnnual/26;
  const weekly=grossAnnual/52;
  const daily=grossAnnual/(weeksPerYear*5);
  const hourly=totalHours>0?grossAnnual/totalHours:0;
  if (els.resultAnnual) els.resultAnnual.textContent=formatCurrency(grossAnnual);
  if (els.resultMonthly) els.resultMonthly.textContent=formatCurrency(monthly);
  if (els.resultBiweekly) els.resultBiweekly.textContent=formatCurrency(biweekly);
  if (els.resultWeekly) els.resultWeekly.textContent=formatCurrency(weekly);
  if (els.resultDaily) els.resultDaily.textContent=formatCurrency(daily);
  if (els.resultHourly) els.resultHourly.textContent=formatCurrency(hourly);
}
document.addEventListener("DOMContentLoaded",()=>{
  const els=getElements();
  const inputs=[els.annualInput,els.hourlyInput,els.hoursPerWeek,els.weeksPerYear,els.payFrequency].filter(Boolean);
  inputs.forEach(el=>{el.addEventListener("input",calculate);el.addEventListener("change",calculate);});
  calculate();
});
export {calculate};
