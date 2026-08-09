/* =========================================================
   US SALARY TOOLS — RAISE CALCULATOR
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("raise-calculator");
  if (!root) return;

  const inputCurrent = root.querySelector("#raise-current-salary");
  const inputPercent = root.querySelector("#raise-percent");
  const inputHours = root.querySelector("#raise-hours");
  const inputWeeks = root.querySelector("#raise-weeks");
  const form = root.querySelector("#raise-form");
  const resetBtn = root.querySelector("#raise-reset-btn");
  const copyBtn = root.querySelector("#raise-copy-btn");
  const ledger = root.querySelector("#raise-ledger");

  const outputs = {
    current: root.querySelector("#out-raise-current"),
    amount: root.querySelector("#out-raise-amount"),
    newSalary: root.querySelector("#out-raise-new"),
    monthly: root.querySelector("#out-raise-monthly"),
    biweekly: root.querySelector("#out-raise-biweekly"),
    hourly: root.querySelector("#out-raise-hourly"),
  };

  let lastResult = null;

  function calculate() {
    UST.clearAllErrors(form);

    const currentResult = UST.parseNumericInput(inputCurrent.value, { fieldLabel: "Current salary", allowZero: false });
    const percentResult = UST.parseNumericInput(inputPercent.value, { fieldLabel: "Raise percentage", allowNegative: true, min: -100, max: 1000 });
    const hoursResult = UST.parseNumericInput(inputHours.value, { fieldLabel: "Hours per week", allowZero: false, max: 168 });
    const weeksResult = UST.parseNumericInput(inputWeeks.value, { fieldLabel: "Weeks per year", allowZero: false, max: 52 });

    let hasError = false;
    if (!currentResult.valid) { UST.showFieldError(inputCurrent, currentResult.error); hasError = true; }
    if (!percentResult.valid) { UST.showFieldError(inputPercent, percentResult.error); hasError = true; }
    if (!hoursResult.valid) { UST.showFieldError(inputHours, hoursResult.error); hasError = true; }
    if (!weeksResult.valid) { UST.showFieldError(inputWeeks, weeksResult.error); hasError = true; }

    if (hasError) {
      ledger.hidden = true;
      lastResult = null;
      return;
    }

    const current = currentResult.value;
    const percent = percentResult.value;
    const hours = hoursResult.value;
    const weeks = weeksResult.value;

    const raiseAmount = current * (percent / 100);
    const newSalary = current + raiseAmount;
    const monthlyIncrease = raiseAmount / 12;
    const biweeklyIncrease = raiseAmount / 26;
    const hourlyIncrease = raiseAmount / (hours * weeks);

    outputs.current.textContent = UST.formatCurrency(current, { whole: true });
    outputs.amount.textContent = UST.formatCurrency(raiseAmount, { whole: true });
    outputs.newSalary.textContent = UST.formatCurrency(newSalary, { whole: true });
    outputs.monthly.textContent = UST.formatCurrency(monthlyIncrease);
    outputs.biweekly.textContent = UST.formatCurrency(biweeklyIncrease);
    outputs.hourly.textContent = UST.formatCurrency(hourlyIncrease);

    ledger.hidden = false;

    lastResult = {
      current: UST.formatCurrency(current, { whole: true }),
      amount: UST.formatCurrency(raiseAmount, { whole: true }),
      newSalary: UST.formatCurrency(newSalary, { whole: true }),
      monthly: UST.formatCurrency(monthlyIncrease),
      biweekly: UST.formatCurrency(biweeklyIncrease),
      hourly: UST.formatCurrency(hourlyIncrease),
    };
  }

  const debouncedCalc = UST.debounce(calculate, 400);
  [inputCurrent, inputPercent, inputHours, inputWeeks].forEach((el) => el.addEventListener("input", debouncedCalc));

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
      `US Salary Tools — Raise Estimate\n` +
      `Current Salary: ${lastResult.current}\nRaise Amount: ${lastResult.amount}\nNew Salary: ${lastResult.newSalary}\n` +
      `Monthly Increase: ${lastResult.monthly}\nBiweekly Increase: ${lastResult.biweekly}\nHourly Increase: ${lastResult.hourly}`;
    const ok = await UST.copyToClipboard(text);
    UST.flashButtonLabel(copyBtn, ok ? "Copied!" : "Couldn't copy");
  });

  ledger.hidden = true;
});
