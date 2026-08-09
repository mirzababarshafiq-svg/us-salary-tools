/* =========================================================
   US SALARY TOOLS — SITEWIDE BEHAVIOR
   Mobile nav, calculators dropdown, FAQ accordion,
   cookie consent banner, footer year. Runs on every page.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initDropdown();
  initFaqAccordions();
  initCookieBanner();
  initFooterYear();
});

/* ---------- Mobile nav ---------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-mobile");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.getAttribute("data-open") === "true";
    menu.setAttribute("data-open", String(!isOpen));
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.getAttribute("data-open") === "true") {
      menu.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
}

/* ---------- Desktop "Calculators" dropdown ---------- */
function initDropdown() {
  const dropdown = document.querySelector(".nav-dropdown");
  if (!dropdown) return;
  const trigger = dropdown.querySelector(".nav-dropdown__trigger");
  if (!trigger) return;

  function close() {
    dropdown.setAttribute("data-open", "false");
    trigger.setAttribute("aria-expanded", "false");
  }
  function open() {
    dropdown.setAttribute("data-open", "true");
    trigger.setAttribute("aria-expanded", "true");
  }

  trigger.addEventListener("click", () => {
    const isOpen = dropdown.getAttribute("data-open") === "true";
    isOpen ? close() : open();
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && dropdown.getAttribute("data-open") === "true") {
      close();
      trigger.focus();
    }
  });
}

/* ---------- FAQ accordion ---------- */
function initFaqAccordions() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-item__q");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", String(!isOpen));
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });
}

/* ---------- Cookie consent banner ---------- */
const COOKIE_CONSENT_KEY = "ust_cookie_consent";

function initCookieBanner() {
  const banner = document.querySelector(".cookie-banner");
  if (!banner) return;

  let stored = null;
  try {
    stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch (_) {
    // localStorage unavailable (private mode, etc.) — skip banner rather than error
    return;
  }

  if (!stored) {
    banner.setAttribute("data-visible", "true");
  }

  banner.querySelectorAll("[data-consent]").forEach((btn) => {
    btn.addEventListener("click", () => {
      try {
        localStorage.setItem(COOKIE_CONSENT_KEY, btn.dataset.consent);
      } catch (_) { /* ignore storage failure, still hide banner */ }
      banner.setAttribute("data-visible", "false");
    });
  });
}

/* ---------- Footer year ---------- */
function initFooterYear() {
  document.querySelectorAll(".current-year").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}
