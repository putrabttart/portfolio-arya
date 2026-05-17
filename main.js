/**
 * Main Application Script
 * Handles: AOS init, theme toggle, mobile menu, back-to-top,
 * typing effect, Instagram tabs, active nav scroll.
 */
(function () {
  'use strict';

  // === AOS Init ===
  AOS.init({ once: true, offset: 50, duration: 800 });

  // === Theme Toggle ===
  var themeToggleBtns = [
    document.getElementById('theme-toggle'),
    document.getElementById('theme-toggle-mobile')
  ].filter(Boolean);

  function applyTheme(t) {
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try { localStorage.setItem('theme', t); } catch (e) {}
  }

  function toggleTheme() {
    applyTheme(document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  }

  themeToggleBtns.forEach(function (b) { b.addEventListener('click', toggleTheme); });

  var mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (mql.addEventListener) {
    mql.addEventListener('change', function (e) {
      if (!localStorage.getItem('theme')) applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  // === Mobile Menu ===
  var menuBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  var mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () { mobileMenu.classList.toggle('hidden'); });
    mobileLinks.forEach(function (l) {
      l.addEventListener('click', function () { mobileMenu.classList.add('hidden'); });
    });
  }

  // === Back to Top ===
  var backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        backToTopBtn.classList.remove('opacity-0', 'invisible');
        backToTopBtn.classList.add('opacity-100', 'visible');
      } else {
        backToTopBtn.classList.add('opacity-0', 'invisible');
        backToTopBtn.classList.remove('opacity-100', 'visible');
      }
    });
  }

  // === Typing Effect ===
  (function () {
    var el = document.getElementById('typed-role');
    if (!el) return;
    var roles = ['Web Developer', 'PHP & MySQL Specialist', 'UI/UX Enthusiast', 'Software Engineer', 'Digital Creator'];
    var ri = 0, ci = 0, del = false;
    function tick() {
      var cur = roles[ri];
      if (!del) {
        el.textContent = cur.slice(0, ++ci);
        if (ci === cur.length) { del = true; return setTimeout(tick, 1400); }
      } else {
        el.textContent = cur.slice(0, --ci);
        if (ci === 0) { del = false; ri = (ri + 1) % roles.length; return setTimeout(tick, 350); }
      }
      setTimeout(tick, del ? 45 : 90);
    }
    tick();
  })();

  // === Instagram Tabs ===
  var igTabs = document.querySelectorAll('.ig-tab');
  var igPanels = document.querySelectorAll('.ig-panel');
  igTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      igTabs.forEach(function (t) { t.classList.remove('active'); });
      igPanels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var target = document.getElementById('ig-' + tab.dataset.tab);
      if (target) {
        target.classList.add('active');
        if (window.instgrm) window.instgrm.Embeds.process();
      }
    });
  });

  // === Active Nav on Scroll ===
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');
  window.addEventListener('scroll', function () {
    var current = '';
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - 100) current = s.getAttribute('id');
    });
    navLinks.forEach(function (link) {
      link.classList.remove('theme-text');
      link.classList.add('theme-text-muted');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('theme-text');
        link.classList.remove('theme-text-muted');
      }
    });
  });

})();
