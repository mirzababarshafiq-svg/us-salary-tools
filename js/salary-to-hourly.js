/* =========================================================
   US SALARY TOOLS — SALARY TO HOURLY CALCULATOR
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("stoh-calculator");
  if (!root) return;

  const inputSalary = root.querySelector("#stoh-salary");
  const inputHours = root.querySelector("#stoh-hours");
  const inputWeeks = root.querySelector("#stoh-weeks");
  const form = root.querySelector("#stoh-form");
  const resetBtn = root.querySelector("#stoh-reset-btn");
  const copyBtn = root.querySelector("#stoh-copy-btn");
  const ledger = root.querySelector("#stoh-ledger");

  const outputs = {
    hourly: root.querySelector("#out-s-hourly"),
    weekly: root.querySelector("#out-s-weekly"),
    biweekly: root.querySelector("#out-s-biweekly"),
    monthly: root.querySelector("#out-s-monthly"),
    daily: root.querySelector("#out-s-daily"),
  };

  let lastResult = null;

  function calculate() {
    UST.clearAllErrors(form);

    const salaryResult = UST.parseNumericInput(inputSalary.value, { fieldLabel: "Annual salary", allowZero: false });
    const hoursResult = UST.parseNumericInput(inputHours.value, { fieldLabel: "Hours per week", allowZero: false, max: 168 });
    const weeksResult = UST.parseNumericInput(inputWeeks.value, { fieldLabel: "Weeks per year", allowZero: false, max: 52 });

    let hasError = false;
    if (!salaryResult.valid) { UST.showFieldError(inputSalary, salaryResult.error); hasError = true; }
    if (!hoursResult.valid) { UST.showFieldError(inputHours, hoursResult.error); hasError = true; }
    if (!weeksResult.valid) { UST.showFieldError(inputWeeks, weeksResult.error); hasError = true; }

    if (hasError) {
      ledger.hidden = true;
      lastResult = null;
      return;
    }

    const annual = salaryResult.value;
    const hours = hoursResult.value;
    const weeks = weeksResult.value;

    const hourly = annual / (hours * weeks);
    const weekly = annual / 52;
    const biweekly = annual / 26;
    const monthly = annual / 12;
    const daily = weekly / 5;

    outputs.hourly.textContent = UST.formatCurrency(hourly);
    outputs.weekly.textContent = UST.formatCurrency(weekly);
    outputs.biweekly.textContent = UST.formatCurrency(biweekly);
    outputs.monthly.textContent = UST.formatCurrency(monthly);
    outputs.daily.textContent = UST.formatCurrency(daily);

    ledger.hidden = false;

    lastResult = {
      hourly: UST.formatCurrency(hourly),
      weekly: UST.formatCurrency(weekly),
      biweekly: UST.formatCurrency(biweekly),
      monthly: UST.formatCurrency(monthly),
      daily: UST.formatCurrency(daily),
    };
  }

  const debouncedCalc = UST.debounce(calculate, 400);
  [inputSalary, inputHours, inputWeeks].forEach((el) => el.addEventListener("input", debouncedCalc));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculate();
    if (lastResult) ledger.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    inputHours.value = "40";
    inputWeeks.value = "52";
    UST.clearAllErrors(form);
    ledger.hidden = true;
    lastResult = null;
  });

  copyBtn.addEventListener("click", async () => {
    if (!lastResult) return;
    const text =
      `US Salary Tools — Salary to Hourly Estimate\n` +
      `Hourly: ${lastResult.hourly}\nWeekly: ${lastResult.weekly}\nBiweekly: ${lastResult.biweekly}\n` +
      `Monthly: ${lastResult.monthly}\nDaily: ${lastResult.daily}`;
    const ok = await UST.copyToClipboard(text);
    UST.flashButtonLabel(copyBtn, ok ? "Copied!" : "Couldn't copy");
  });

  ledger.hidden = true;
});
