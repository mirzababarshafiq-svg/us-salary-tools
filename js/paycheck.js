/* =========================================================
   US SALARY TOOLS — PAYCHECK ESTIMATOR
   IMPORTANT: This is a simplified ESTIMATE. It is not tax
   advice and does not replicate exact payroll withholding.
   See the assumptions box on the Paycheck Calculator page
   and the Methodology page for full detail.
   ========================================================= */

/* ---------- Tax year 2025 reference data ---------- */

// Source: IRS Revenue Procedure 2024-40, adjusted per the One Big
// Beautiful Bill Act (OBBBA), as reported by the Tax Foundation.
const FEDERAL_BRACKETS_2025 = {
  single: [
    [0, 11925, 0.10], [11925, 48475, 0.12], [48475, 103350, 0.22],
    [103350, 197300, 0.24], [197300, 250525, 0.32], [250525, 626350, 0.35],
    [626350, Infinity, 0.37],
  ],
  marriedJointly: [
    [0, 23850, 0.10], [23850, 96950, 0.12], [96950, 206700, 0.22],
    [206700, 394600, 0.24], [394600, 501050, 0.32], [501050, 751600, 0.35],
    [751600, Infinity, 0.37],
  ],
  headOfHousehold: [
    [0, 17000, 0.10], [17000, 64850, 0.12], [64850, 103350, 0.22],
    [103350, 197300, 0.24], [197300, 250500, 0.32], [250500, 626350, 0.35],
    [626350, Infinity, 0.37],
  ],
};

const STANDARD_DEDUCTION_2025 = {
  single: 15750,
  marriedJointly: 31500,
  headOfHousehold: 23625,
};

const SS_WAGE_BASE_2025 = 176100;
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLD = {
  single: 200000,
  marriedJointly: 250000,
  headOfHousehold: 200000,
};

// Simplified flat-rate approximation of each state's typical effective
// income tax burden. NOT each state's actual bracket structure, standard
// deduction, or local/city taxes. The 9 states with 0% levy no wage income tax.
const STATE_TAX_DATA = {
  AL: { name: "Alabama", rate: 0.05 }, AK: { name: "Alaska", rate: 0 },
  AZ: { name: "Arizona", rate: 0.025 }, AR: { name: "Arkansas", rate: 0.039 },
  CA: { name: "California", rate: 0.06 }, CO: { name: "Colorado", rate: 0.044 },
  CT: { name: "Connecticut", rate: 0.055 }, DE: { name: "Delaware", rate: 0.048 },
  DC: { name: "District of Columbia", rate: 0.065 }, FL: { name: "Florida", rate: 0 },
  GA: { name: "Georgia", rate: 0.0519 }, HI: { name: "Hawaii", rate: 0.065 },
  ID: { name: "Idaho", rate: 0.053 }, IL: { name: "Illinois", rate: 0.0495 },
  IN: { name: "Indiana", rate: 0.03 }, IA: { name: "Iowa", rate: 0.038 },
  KS: { name: "Kansas", rate: 0.052 }, KY: { name: "Kentucky", rate: 0.04 },
  LA: { name: "Louisiana", rate: 0.03 }, ME: { name: "Maine", rate: 0.06 },
  MD: { name: "Maryland", rate: 0.0475 }, MA: { name: "Massachusetts", rate: 0.05 },
  MI: { name: "Michigan", rate: 0.0425 }, MN: { name: "Minnesota", rate: 0.06 },
  MS: { name: "Mississippi", rate: 0.044 }, MO: { name: "Missouri", rate: 0.04 },
  MT: { name: "Montana", rate: 0.05 }, NE: { name: "Nebraska", rate: 0.045 },
  NV: { name: "Nevada", rate: 0 }, NH: { name: "New Hampshire", rate: 0 },
  NJ: { name: "New Jersey", rate: 0.045 }, NM: { name: "New Mexico", rate: 0.035 },
  NY: { name: "New York", rate: 0.055 }, NC: { name: "North Carolina", rate: 0.0425 },
  ND: { name: "North Dakota", rate: 0.011 }, OH: { name: "Ohio", rate: 0.028 },
  OK: { name: "Oklahoma", rate: 0.0425 }, OR: { name: "Oregon", rate: 0.07 },
  PA: { name: "Pennsylvania", rate: 0.0307 }, RI: { name: "Rhode Island", rate: 0.0475 },
  SC: { name: "South Carolina", rate: 0.05 }, SD: { name: "South Dakota", rate: 0 },
  TN: { name: "Tennessee", rate: 0 }, TX: { name: "Texas", rate: 0 },
  UT: { name: "Utah", rate: 0.0455 }, VT: { name: "Vermont", rate: 0.06 },
  VA: { name: "Virginia", rate: 0.05 }, WA: { name: "Washington", rate: 0 },
  WV: { name: "West Virginia", rate: 0.04 }, WI: { name: "Wisconsin", rate: 0.05 },
  WY: { name: "Wyoming", rate: 0 },
};

const NO_TAX_STATES = new Set(["AK", "FL", "NV", "NH", "SD", "TN", "TX", "WA", "WY"]);

const PERIODS_PER_YEAR = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };

function calcProgressiveTax(taxableIncome, brackets) {
  let tax = 0;
  for (const [lower, upper, rate] of brackets) {
    if (taxableIncome > lower) {
      tax += (Math.min(taxableIncome, upper) - lower) * rate;
    } else {
      break;
    }
  }
  return tax;
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("paycheck-calculator");
  if (!root) return;

  const inputSalary = root.querySelector("#pc-salary");
  const selectFrequency = root.querySelector("#pc-frequency");
  const selectState = root.querySelector("#pc-state");
  const selectFilingStatus = root.querySelector("#pc-filing-status");
  const form = root.querySelector("#pc-form");
  const resetBtn = root.querySelector("#pc-reset-btn");
  const copyBtn = root.querySelector("#pc-copy-btn");
  const ledger = root.querySelector("#pc-ledger");
  const stateNoteEl = root.querySelector("#pc-state-note");

  const outputs = {
    gross: root.querySelector("#out-pc-gross"),
    federal: root.querySelector("#out-pc-federal"),
    state: root.querySelector("#out-pc-state"),
    fica: root.querySelector("#out-pc-fica"),
    net: root.querySelector("#out-pc-net"),
    annualGross: root.querySelector("#out-pc-annual-gross"),
    annualNet: root.querySelector("#out-pc-annual-net"),
    effectiveRate: root.querySelector("#out-pc-effective-rate"),
  };

  // Populate state dropdown once
  if (selectState && selectState.options.length === 0) {
    Object.keys(STATE_TAX_DATA).sort((a, b) => STATE_TAX_DATA[a].name.localeCompare(STATE_TAX_DATA[b].name))
      .forEach((code) => {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = STATE_TAX_DATA[code].name + (NO_TAX_STATES.has(code) ? " (no income tax)" : "");
        selectState.appendChild(opt);
      });
    selectState.value = "TX";
  }

  let lastResult = null;

  function calculate() {
    UST.clearAllErrors(form);

    const salaryResult = UST.parseNumericInput(inputSalary.value, { fieldLabel: "Annual salary", allowZero: false });
    let hasError = false;
    if (!salaryResult.valid) { UST.showFieldError(inputSalary, salaryResult.error); hasError = true; }

    if (hasError) {
      ledger.hidden = true;
      lastResult = null;
      return;
    }

    const annual = salaryResult.value;
    const filingStatus = selectFilingStatus.value;
    const stateCode = selectState.value;
    const frequency = selectFrequency.value;
    const periods = PERIODS_PER_YEAR[frequency];

    const standardDeduction = STANDARD_DEDUCTION_2025[filingStatus];
    const taxableIncome = Math.max(0, annual - standardDeduction);
    const federalTax = calcProgressiveTax(taxableIncome, FEDERAL_BRACKETS_2025[filingStatus]);

    const ssWages = Math.min(annual, SS_WAGE_BASE_2025);
    const socialSecurityTax = ssWages * SS_RATE;
    const additionalMedicareThreshold = ADDITIONAL_MEDICARE_THRESHOLD[filingStatus];
    const medicareTax = annual * MEDICARE_RATE + Math.max(0, annual - additionalMedicareThreshold) * ADDITIONAL_MEDICARE_RATE;
    const ficaTax = socialSecurityTax + medicareTax;

    const stateInfo = STATE_TAX_DATA[stateCode];
    const stateTax = annual * stateInfo.rate;

    const totalTax = federalTax + ficaTax + stateTax;
    const annualNet = annual - totalTax;
    const effectiveRate = totalTax / annual;

    outputs.gross.textContent = UST.formatCurrency(annual / periods);
    outputs.federal.textContent = UST.formatCurrency(federalTax / periods);
    outputs.state.textContent = UST.formatCurrency(stateTax / periods);
    outputs.fica.textContent = UST.formatCurrency(ficaTax / periods);
    outputs.net.textContent = UST.formatCurrency(annualNet / periods);
    outputs.annualGross.textContent = UST.formatCurrency(annual, { whole: true });
    outputs.annualNet.textContent = UST.formatCurrency(annualNet, { whole: true });
    outputs.effectiveRate.textContent = UST.formatPercent(effectiveRate);

    if (stateNoteEl) {
      stateNoteEl.textContent = NO_TAX_STATES.has(stateCode)
        ? `${stateInfo.name} does not levy a state income tax on wages.`
        : `Estimated using a simplified flat ${(stateInfo.rate * 100).toFixed(2)}% approximation for ${stateInfo.name} — not your exact bracket or deduction.`;
    }

    ledger.hidden = false;

    lastResult = {
      gross: outputs.gross.textContent,
      federal: outputs.federal.textContent,
      state: outputs.state.textContent,
      fica: outputs.fica.textContent,
      net: outputs.net.textContent,
      annualGross: outputs.annualGross.textContent,
      annualNet: outputs.annualNet.textContent,
      effectiveRate: outputs.effectiveRate.textContent,
      frequency,
    };
  }

  const debouncedCalc = UST.debounce(calculate, 400);
  [inputSalary].forEach((el) => el.addEventListener("input", debouncedCalc));
  [selectFrequency, selectState, selectFilingStatus].forEach((el) => el.addEventListener("change", debouncedCalc));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculate();
    if (lastResult) ledger.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    selectFrequency.value = "biweekly";
    selectState.value = "TX";
    selectFilingStatus.value = "single";
    UST.clearAllErrors(form);
    ledger.hidden = true;
    lastResult = null;
  });

  copyBtn.addEventListener("click", async () => {
    if (!lastResult) return;
    const text =
      `US Salary Tools — Paycheck Estimate (${lastResult.frequency})\n` +
      `Gross Pay: ${lastResult.gross}\nFederal Tax (est.): ${lastResult.federal}\nState Tax (est.): ${lastResult.state}\n` +
      `FICA: ${lastResult.fica}\nNet Pay (est.): ${lastResult.net}\n` +
      `Annual Gross: ${lastResult.annualGross}\nAnnual Net (est.): ${lastResult.annualNet}\n` +
      `Effective Tax Rate: ${lastResult.effectiveRate}\n` +
      `This is an estimate only — not tax advice.`;
    const ok = await UST.copyToClipboard(text);
    UST.flashButtonLabel(copyBtn, ok ? "Copied!" : "Couldn't copy");
  });

  ledger.hidden = true;
});
