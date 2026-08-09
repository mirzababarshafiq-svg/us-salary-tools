/* =========================================================
   US SALARY TOOLS — HOURLY TO SALARY CALCULATOR
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("hourly-calculator");
  if (!root) return;

  const inputWage = root.querySelector("#hourly-wage");
  const inputHours = root.querySelector("#hourly-hours");
  const inputWeeks = root.querySelector("#hourly-weeks");
  const form = root.querySelector("#hourly-form");
  const resetBtn = root.querySelector("#hourly-reset-btn");
  const copyBtn = root.querySelector("#hourly-copy-btn");
  const ledger = root.querySelector("#hourly-ledger");

  const outputs = {
    annual: root.querySelector("#out-h-annual"),
    monthly: root.querySelector("#out-h-monthly"),
    biweekly: root.querySelector("#out-h-biweekly"),
    weekly: root.querySelector("#out-h-weekly"),
    daily: root.querySelector("#out-h-daily"),
  };

  let lastResult = null;

  function calculate() {
    UST.clearAllErrors(form);

    const wageResult = UST.parseNumericInput(inputWage.value, { fieldLabel: "Hourly wage", allowZero: false, max: 10000 });
    const hoursResult = UST.parseNumericInput(inputHours.value, { fieldLabel: "Hours per week", allowZero: false, max: 168 });
    const weeksResult = UST.parseNumericInput(inputWeeks.value, { fieldLabel: "Weeks per year", allowZero: false, max: 52 });

    let hasError = false;
    if (!wageResult.valid) { UST.showFieldError(inputWage, wageResult.error); hasError = true; }
    if (!hoursResult.valid) { UST.showFieldError(inputHours, hoursResult.error); hasError = true; }
    if (!weeksResult.valid) { UST.showFieldError(inputWeeks, weeksResult.error); hasError = true; }

    if (hasError) {
      ledger.hidden = true;
      lastResult = null;
      return;
    }

    const wage = wageResult.value;
    const hours = hoursResult.value;
    const weeks = weeksResult.value;

    const annual = wage * hours * weeks;
    const monthly = annual / 12;
    const biweekly = annual / 26;
    const weekly = annual / 52;
    const daily = weekly / 5;

    outputs.annual.textContent = UST.formatCurrency(annual, { whole: true });
    outputs.monthly.textContent = UST.formatCurrency(monthly);
    outputs.biweekly.textContent = UST.formatCurrency(biweekly);
    outputs.weekly.textContent = UST.formatCurrency(weekly);
    outputs.daily.textContent = UST.formatCurrency(daily);

    ledger.hidden = false;

    lastResult = {
      annual: UST.formatCurrency(annual, { whole: true }),
      monthly: UST.formatCurrency(monthly),
      biweekly: UST.formatCurrency(biweekly),
      weekly: UST.formatCurrency(weekly),
      daily: UST.formatCurrency(daily),
    };
  }

  const debouncedCalc = UST.debounce(calculate, 400);
  [inputWage, inputHours, inputWeeks].forEach((el) => el.addEventListener("input", debouncedCalc));

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
      `US Salary Tools — Hourly to Salary Estimate\n` +
      `Annual: ${lastResult.annual}\nMonthly: ${lastResult.monthly}\nBiweekly: ${lastResult.biweekly}\n` +
      `Weekly: ${lastResult.weekly}\nDaily: ${lastResult.daily}`;
    const ok = await UST.copyToClipboard(text);
    UST.flashButtonLabel(copyBtn, ok ? "Copied!" : "Couldn't copy");
  });

  ledger.hidden = true;
});
