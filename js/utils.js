/* =========================================================
   US SALARY TOOLS — SHARED UTILITIES
   Loaded on every page before the page-specific calculator
   script. No dependencies, no globals beyond `UST`.
   ========================================================= */

const UST = (() => {
  "use strict";

  /** Sensible ceiling so a stray extra zero doesn't produce
   *  meaningless or overflow-prone output. $100 million/yr covers
   *  every realistic legitimate input. */
  const MAX_SAFE_AMOUNT = 100_000_000;

  /* ---------- Formatting ---------- */

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const currencyFormatterWhole = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const numberFormatter = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  const percentFormatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  /**
   * Formats a numeric value as USD. Falls back to "—" for
   * non-finite input so a formatting bug never renders "NaN"
   * or "Infinity" to the user.
   */
  function formatCurrency(value, { whole = false } = {}) {
    if (!Number.isFinite(value)) return "—";
    const fmt = whole ? currencyFormatterWhole : currencyFormatter;
    return fmt.format(value);
  }

  function formatNumber(value, decimals = 2) {
    if (!Number.isFinite(value)) return "—";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  function formatPercent(value) {
    // value expected as a fraction, e.g. 0.075 -> "7.5%"
    if (!Number.isFinite(value)) return "—";
    return percentFormatter.format(value);
  }

  /* ---------- Validation ---------- */

  /**
   * Parses a raw string input into a validated number.
   * Returns { valid, value, error }.
   *
   * options:
   *   allowNegative  (default false)
   *   allowZero      (default true)
   *   min, max       explicit bounds (override allowNegative/allowZero if set)
   *   required       (default true)
   *   fieldLabel     used in error messages
   */
  function parseNumericInput(raw, options = {}) {
    const {
      allowNegative = false,
      allowZero = true,
      min,
      max,
      required = true,
      fieldLabel = "This field",
    } = options;

    const trimmed = (raw ?? "").toString().trim();

    if (trimmed === "") {
      return required
        ? { valid: false, value: null, error: `${fieldLabel} is required.` }
        : { valid: true, value: null, error: null };
    }

    // Strip commas and a leading $ so "$65,000" and "65,000" both parse.
    const cleaned = trimmed.replace(/,/g, "").replace(/^\$/, "");

    if (!/^-?\d*\.?\d+$/.test(cleaned)) {
      return { valid: false, value: null, error: `Enter a valid number for ${fieldLabel.toLowerCase()}.` };
    }

    const value = Number(cleaned);

    if (!Number.isFinite(value)) {
      return { valid: false, value: null, error: `${fieldLabel} is too large to calculate.` };
    }

    const lowerBound = min !== undefined ? min : (allowNegative ? -MAX_SAFE_AMOUNT : 0);
    const upperBound = max !== undefined ? max : MAX_SAFE_AMOUNT;

    if (!allowZero && value === 0) {
      return { valid: false, value: null, error: `${fieldLabel} cannot be zero.` };
    }

    if (value < lowerBound) {
      return {
        valid: false,
        value: null,
        error: allowNegative
          ? `${fieldLabel} is too small.`
          : `${fieldLabel} cannot be negative.`,
      };
    }

    if (value > upperBound) {
      return { valid: false, value: null, error: `${fieldLabel} is unrealistically large. Enter a smaller number.` };
    }

    return { valid: true, value, error: null };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /* ---------- Field error UI helpers ---------- */

  function showFieldError(inputEl, message) {
    inputEl.setAttribute("aria-invalid", "true");
    const errorEl = document.getElementById(inputEl.getAttribute("aria-describedby"));
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("is-visible");
    }
  }

  function clearFieldError(inputEl) {
    inputEl.removeAttribute("aria-invalid");
    const errorEl = document.getElementById(inputEl.getAttribute("aria-describedby"));
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("is-visible");
    }
  }

  function clearAllErrors(formEl) {
    formEl.querySelectorAll("[aria-invalid]").forEach((el) => clearFieldError(el));
  }

  /* ---------- Misc ---------- */

  function debounce(fn, wait = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) { /* fall through to legacy path */ }

    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch (_) {
      return false;
    }
  }

  function flashButtonLabel(buttonEl, tempLabel, revertAfter = 1800) {
    const original = buttonEl.dataset.originalLabel || buttonEl.textContent;
    buttonEl.dataset.originalLabel = original;
    buttonEl.textContent = tempLabel;
    buttonEl.disabled = true;
    setTimeout(() => {
      buttonEl.textContent = buttonEl.dataset.originalLabel;
      buttonEl.disabled = false;
    }, revertAfter);
  }

  return {
    MAX_SAFE_AMOUNT,
    formatCurrency,
    formatNumber,
    formatPercent,
    parseNumericInput,
    clamp,
    showFieldError,
    clearFieldError,
    clearAllErrors,
    debounce,
    copyToClipboard,
    flashButtonLabel,
  };
})();
