/* =========================================================
   US SALARY TOOLS — SALARY CALCULATOR
   Powers the "Salary Calculator" widget: converts between
   annual salary and hourly rate, and shows every common pay
   period. Safe to include on any page — no-ops if the
   #salary-calculator markup isn't present.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("salary-calculator");
  if (!root) return;

  const modeAnnualBtn = root.querySelector("#mode-annual-btn");
  const modeHourlyBtn = root.querySelector("#mode-hourly-btn");
  const fieldAnnual = root.querySelector("#field-annual");
  const fieldHourly = root.querySelector("#field-hourly");
  const inputAnnual = root.querySelector("#salary-annual");
  const inputHourly = root.querySelector("#salary-hourly");
  const inputHours = root.querySelector("#salary-hours");
  const inputWeeks = root.querySelector("#salary-weeks");
  const selectFrequency = root.querySelector("#salary-frequency");
  const form = root.querySelector("#salary-form");
  const resetBtn = root.querySelector("#salary-reset-btn");
  const copyBtn = root.querySelector("#salary-copy-btn");
  const ledger = root.querySelector("#salary-ledger");

  const outputs = {
    annually: root.querySelector("#out-annual"),
    monthly: root.querySelector("#out-monthly"),
    biweekly: root.querySelector("#out-biweekly"),
    weekly: root.querySelector("#out-weekly"),
    daily: root.querySelector("#out-daily"),
    hourly: root.querySelector("#out-hourly"),
  };

  let mode = "annual"; // "annual" | "hourly"
  let lastResult = null;

  function setMode(next) {
    mode = next;
    const isAnnual = mode === "annual";
    fieldAnnual.classList.toggle("hidden", !isAnnual);
    fieldHourly.classList.toggle("hidden", isAnnual);
    modeAnnualBtn.setAttribute("aria-pressed", String(isAnnual));
    modeHourlyBtn.setAttribute("aria-pressed", String(!isAnnual));
    UST.clearFieldError(isAnnual ? inputHourly : inputAnnual);
    calculate();
  }

  modeAnnualBtn.addEventListener("click", () => setMode("annual"));
  modeHourlyBtn.addEventListener("click", () => setMode("hourly"));

  function highlightRow(frequency) {
    root.querySelectorAll(".ledger__row").forEach((row) => {
      row.classList.toggle("ledger__row--primary", row.dataset.row === frequency);
    });
  }

  function calculate() {
    UST.clearAllErrors(form);

    const hoursResult = UST.parseNumericInput(inputHours.value, {
      fieldLabel: "Hours per week",
      allowZero: false,
      max: 168,
    });
    const weeksResult = UST.parseNumericInput(inputWeeks.value, {
      fieldLabel: "Weeks per year",
      allowZero: false,
      max: 52,
    });

    let primaryResult;
    if (mode === "annual") {
      primaryResult = UST.parseNumericInput(inputAnnual.value, {
        fieldLabel: "Annual salary",
        allowZero: false,
      });
    } else {
      primaryResult = UST.parseNumericInput(inputHourly.value, {
        fieldLabel: "Hourly rate",
        allowZero: false,
        max: 10000,
      });
    }

    let hasError = false;
    if (!hoursResult.valid) { UST.showFieldError(inputHours, hoursResult.error); hasError = true; }
    if (!weeksResult.valid) { UST.showFieldError(inputWeeks, weeksResult.error); hasError = true; }
    if (!primaryResult.valid) {
      UST.showFieldError(mode === "annual" ? inputAnnual : inputHourly, primaryResult.error);
      hasError = true;
    }

    if (hasError) {
      ledger.hidden = true;
      lastResult = null;
      return;
    }

    const hours = hoursResult.value;
    const weeks = weeksResult.value;

    const annual = mode === "annual"
      ? primaryResult.value
      : primaryResult.value * hours * weeks;

    const hourlyEquivalent = annual / (hours * weeks);
    const monthly = annual / 12;
    const biweekly = annual / 26;
    const weekly = annual / 52;
    const daily = weekly / 5;

    outputs.annually.textContent = UST.formatCurrency(annual, { whole: true });
    outputs.monthly.textContent = UST.formatCurrency(monthly);
    outputs.biweekly.textContent = UST.formatCurrency(biweekly);
    outputs.weekly.textContent = UST.formatCurrency(weekly);
    outputs.daily.textContent = UST.formatCurrency(daily);
    outputs.hourly.textContent = UST.formatCurrency(hourlyEquivalent);

    highlightRow(selectFrequency.value);
    ledger.hidden = false;

    lastResult = {
      annual: UST.formatCurrency(annual, { whole: true }),
      monthly: UST.formatCurrency(monthly),
      biweekly: UST.formatCurrency(biweekly),
      weekly: UST.formatCurrency(weekly),
      daily: UST.formatCurrency(daily),
      hourly: UST.formatCurrency(hourlyEquivalent),
    };
  }

  const debouncedCalc = UST.debounce(calculate, 400);
  [inputAnnual, inputHourly, inputHours, inputWeeks].forEach((el) => {
    el.addEventListener("input", debouncedCalc);
  });
  selectFrequency.addEventListener("change", () => {
    if (lastResult) highlightRow(selectFrequency.value);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculate();
    if (lastResult) ledger.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    inputHours.value = "40";
    inputWeeks.value = "52";
    selectFrequency.value = "biweekly";
    setMode("annual");
    UST.clearAllErrors(form);
    ledger.hidden = true;
    lastResult = null;
  });

  copyBtn.addEventListener("click", async () => {
    if (!lastResult) return;
    const text =
      `US Salary Tools — Salary Estimate\n` +
      `Annual: ${lastResult.annual}\n` +
      `Monthly: ${lastResult.monthly}\n` +
      `Biweekly: ${lastResult.biweekly}\n` +
      `Weekly: ${lastResult.weekly}\n` +
      `Daily: ${lastResult.daily}\n` +
      `Hourly Equivalent: ${lastResult.hourly}`;
    const ok = await UST.copyToClipboard(text);
    UST.flashButtonLabel(copyBtn, ok ? "Copied!" : "Couldn't copy");
  });

  // Initial state
  ledger.hidden = true;
});
