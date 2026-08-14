/* Shared navigation for all classic calculator pages. */
(function () {
  function initNav() {
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
