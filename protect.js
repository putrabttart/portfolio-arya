/**
 * Source Protection
 * Disables: right-click, text selection, drag, keyboard shortcuts for devtools/view-source.
 * NOTE: This is a deterrent, not absolute protection. Determined users can still bypass.
 */
(function () {
  'use strict';

  // === Disable right-click context menu ===
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  // === Disable text selection ===
  document.addEventListener('selectstart', function (e) {
    e.preventDefault();
    return false;
  });

  // === Disable drag ===
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
    return false;
  });

  // === Disable copy/cut/paste ===
  document.addEventListener('copy', function (e) { e.preventDefault(); });
  document.addEventListener('cut', function (e) { e.preventDefault(); });

  // === Disable keyboard shortcuts ===
  document.addEventListener('keydown', function (e) {
    // F12
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C (Element picker)
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
      e.preventDefault();
      return false;
    }
    // Ctrl+U (View source)
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
      e.preventDefault();
      return false;
    }
    // Ctrl+S (Save page)
    if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
      e.preventDefault();
      return false;
    }
    // Ctrl+A (Select all)
    if (e.ctrlKey && (e.key === 'A' || e.key === 'a' || e.keyCode === 65)) {
      e.preventDefault();
      return false;
    }
    // Ctrl+C (Copy)
    if (e.ctrlKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67) && !e.shiftKey) {
      e.preventDefault();
      return false;
    }
    // Ctrl+P (Print)
    if (e.ctrlKey && (e.key === 'P' || e.key === 'p' || e.keyCode === 80)) {
      e.preventDefault();
      return false;
    }
  });

  // === Detect DevTools open (debugger trick) ===
  (function detectDevTools() {
    var threshold = 160;
    var check = function () {
      var widthDiff = window.outerWidth - window.innerWidth > threshold;
      var heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#0a0a0f;color:#fff;text-align:center;padding:2rem;"><div><h1 style="font-size:2rem;margin-bottom:1rem;">⚠️ Akses Ditolak</h1><p style="color:#94a3b8;">Developer tools tidak diizinkan di halaman ini.</p></div></div>';
      }
    };
    setInterval(check, 1000);
  })();

  // === Disable console methods ===
  (function () {
    var noop = function () {};
    try {
      Object.defineProperty(window, 'console', {
        get: function () {
          return { log: noop, warn: noop, error: noop, info: noop, debug: noop, table: noop, clear: noop, dir: noop, trace: noop };
        },
        set: noop
      });
    } catch (e) {}
  })();

})();
