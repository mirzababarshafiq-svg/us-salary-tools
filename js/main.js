/* Shared navigation for all classic calculator pages. */
(function () {
  var CONSENT_KEY = 'cookieConsent';
  var BEACON_TOKEN = '3359fed1fd644e00a185d00270fbf781';
  var THEME_KEY = 'theme';

  function getPreferredTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Apply as early as possible (script runs at end of body, after DOM parse)
  // to minimize the flash of the wrong theme.
  applyTheme(getPreferredTheme());

  function initThemeToggle() {
    var headerInner = document.querySelector('.site-header__inner');
    var navToggle = document.querySelector('.nav-toggle');
    if (!headerInner || document.querySelector('.theme-toggle')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.innerHTML =
      '<svg class="theme-toggle__sun" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.7"/><path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8l1.8-1.8M18 6l1.8-1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
      '<svg class="theme-toggle__moon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';

    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });

    if (navToggle) headerInner.insertBefore(btn, navToggle);
    else headerInner.appendChild(btn);
  }

  function loadAnalytics() {
    if (document.querySelector('script[data-cf-beacon]')) return;
    var script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: BEACON_TOKEN }));
    document.body.appendChild(script);
  }

  function initCookieBanner() {
    var banner = document.querySelector('.cookie-banner');
    if (!banner) return;

    var saved = null;
    try { saved = localStorage.getItem(CONSENT_KEY); } catch (e) {}

    if (saved === 'accepted') {
      loadAnalytics();
    } else if (saved !== 'declined') {
      banner.setAttribute('data-visible', 'true');
    }

    banner.querySelectorAll('[data-consent]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var choice = btn.getAttribute('data-consent');
        try { localStorage.setItem(CONSENT_KEY, choice); } catch (e) {}
        banner.setAttribute('data-visible', 'false');
        if (choice === 'accepted') loadAnalytics();
      });
    });
  }

  function initNav() {
    initCookieBanner();
    initThemeToggle();
    var dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(function (dropdown) {
      var trigger = dropdown.querySelector('.nav-dropdown__trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = dropdown.getAttribute('data-open') === 'true';
        dropdowns.forEach(function (d) {
          d.setAttribute('data-open', 'false');
          var t = d.querySelector('.nav-dropdown__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          dropdown.setAttribute('data-open', 'true');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', function () {
      dropdowns.forEach(function (d) {
        d.setAttribute('data-open', 'false');
        var t = d.querySelector('.nav-dropdown__trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    });

    var mobileButton = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.nav-mobile');
    if (mobileButton && mobileNav) {
      mobileButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var isOpen = mobileNav.getAttribute('data-open') === 'true';
        mobileNav.setAttribute('data-open', isOpen ? 'false' : 'true');
        mobileButton.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        mobileButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
      });
      mobileNav.addEventListener('click', function (event) { event.stopPropagation(); });
    }

    var year = document.querySelectorAll('.current-year');
    year.forEach(function (node) { node.textContent = String(new Date().getFullYear()); });

    document.querySelectorAll('.faq-item__q').forEach(function (question) {
      question.addEventListener('click', function () {
        var item = question.closest('.faq-item');
        if (!item) return;
        var open = item.getAttribute('data-open') === 'true';
        item.setAttribute('data-open', open ? 'false' : 'true');
        question.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initNav);
  else initNav();
})();
