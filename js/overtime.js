/* =========================================================
   US SALARY TOOLS — OVERTIME CALCULATOR
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("overtime-calculator");
  if (!root) return;

  const inputRate = root.querySelector("#ot-rate");
  const inputRegularHours = root.querySelector("#ot-regular-hours");
  const inputOvertimeHours = root.querySelector("#ot-overtime-hours");
  const inputMultiplier = root.querySelector("#ot-multiplier");
  const form = root.querySelector("#ot-form");
  const resetBtn = root.querySelector("#ot-reset-btn");
  const copyBtn = root.querySelector("#ot-copy-btn");
  const ledger = root.querySelector("#ot-ledger");

  const outputs = {
    regularPay: root.querySelector("#out-ot-regular-pay"),
    overtimePay: root.querySelector("#out-ot-overtime-pay"),
    totalPay: root.querySelector("#out-ot-total-pay"),
    overtimeRate: root.querySelector("#out-ot-rate"),
  };

  let lastResult = null;

  function calculate() {
    UST.clearAllErrors(form);

    const rateResult = UST.parseNumericInput(inputRate.value, { fieldLabel: "Regular hourly rate", allowZero: false, max: 10000 });
    const regularHoursResult = UST.parseNumericInput(inputRegularHours.value, { fieldLabel: "Regular hours", allowZero: false, max: 168 });
    const overtimeHoursResult = UST.parseNumericInput(inputOvertimeHours.value, { fieldLabel: "Overtime hours", required: true, max: 168 });
    const multiplierResult = UST.parseNumericInput(inputMultiplier.value, { fieldLabel: "Overtime multiplier", allowZero: false, max: 10 });

    let hasError = false;
    if (!rateResult.valid) { UST.showFieldError(inputRate, rateResult.error); hasError = true; }
    if (!regularHoursResult.valid) { UST.showFieldError(inputRegularHours, regularHoursResult.error); hasError = true; }
    if (!overtimeHoursResult.valid) { UST.showFieldError(inputOvertimeHours, overtimeHoursResult.error); hasError = true; }
    if (!multiplierResult.valid) { UST.showFieldError(inputMultiplier, multiplierResult.error); hasError = true; }

    if (hasError) {
      ledger.hidden = true;
      lastResult = null;
      return;
    }

    const rate = rateResult.value;
    const regularHours = regularHoursResult.value;
    const overtimeHours = overtimeHoursResult.value ?? 0;
    const multiplier = multiplierResult.value;

    const overtimeRate = rate * multiplier;
    const regularPay = rate * regularHours;
    const overtimePay = overtimeRate * overtimeHours;
    const totalPay = regularPay + overtimePay;

    outputs.regularPay.textContent = UST.formatCurrency(regularPay);
    outputs.overtimePay.textContent = UST.formatCurrency(overtimePay);
    outputs.totalPay.textContent = UST.formatCurrency(totalPay);
    outputs.overtimeRate.textContent = UST.formatCurrency(overtimeRate);

    ledger.hidden = false;

    lastResult = {
      regularPay: UST.formatCurrency(regularPay),
      overtimePay: UST.formatCurrency(overtimePay),
      totalPay: UST.formatCurrency(totalPay),
      overtimeRate: UST.formatCurrency(overtimeRate),
    };
  }

  const debouncedCalc = UST.debounce(calculate, 400);
  [inputRate, inputRegularHours, inputOvertimeHours, inputMultiplier].forEach((el) => el.addEventListener("input", debouncedCalc));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculate();
    if (lastResult) ledger.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    inputRegularHours.value = "40";
    inputOvertimeHours.value = "5";
    inputMultiplier.value = "1.5";
    UST.clearAllErrors(form);
    ledger.hidden = true;
    lastResult = null;
  });

  copyBtn.addEventListener("click", async () => {
    if (!lastResult) return;
    const text =
      `US Salary Tools — Overtime Pay Estimate\n` +
      `Regular Pay: ${lastResult.regularPay}\nOvertime Pay: ${lastResult.overtimePay}\n` +
      `Total Pay: ${lastResult.totalPay}\nOvertime Rate: ${lastResult.overtimeRate}/hr`;
    const ok = await UST.copyToClipboard(text);
    UST.flashButtonLabel(copyBtn, ok ? "Copied!" : "Couldn't copy");
  });

  ledger.hidden = true;
});
