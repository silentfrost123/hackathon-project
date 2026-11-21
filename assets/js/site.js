/* JISR shared behaviour: language (EN/AR + RTL), mobile nav, scroll reveal, toast.
   Static text carries its English in the markup; Arabic lives in window.JISR_AR
   keyed by data-i18n. English originals are cached on first switch. */
(function () {
  var LANG_KEY = 'jisr.lang';

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  function currentLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'ar' || q === 'en') return q;
    return store(LANG_KEY) === 'ar' ? 'ar' : 'en';
  }

  var original = new Map();

  function applyStatic(lang) {
    var dict = window.JISR_AR || {};
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!original.has(el)) original.set(el, el.innerHTML);
      if (lang === 'ar' && dict[key] != null) el.innerHTML = dict[key];
      else el.innerHTML = original.get(el);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      // format: "attr:key;attr2:key2"
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); var attr = p[0], key = p[1];
        var store = 'data-en-' + attr;
        if (!el.hasAttribute(store)) el.setAttribute(store, el.getAttribute(attr) || '');
        el.setAttribute(attr, lang === 'ar' && dict[key] != null ? dict[key] : el.getAttribute(store));
      });
    });
    var title = document.querySelector('title');
    if (title && title.dataset.ar) {
      if (!title.dataset.en) title.dataset.en = title.textContent;
      title.textContent = lang === 'ar' ? title.dataset.ar : title.dataset.en;
    }
  }

  function setLang(lang, silent) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    store(LANG_KEY, lang);
    applyStatic(lang);
    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
      var l = b.querySelector('.lang-label');
      if (l) { l.textContent = lang === 'ar' ? 'English' : 'العربية'; l.className = 'lang-label' + (lang === 'ar' ? '' : ' lang-label-ar'); }
    });
    // keep internal links carrying the language
    document.querySelectorAll('a[data-keep-lang]').forEach(function (a) {
      var url = new URL(a.getAttribute('href'), location.href);
      if (lang === 'ar') url.searchParams.set('lang', 'ar'); else url.searchParams.delete('lang');
      a.setAttribute('href', url.pathname.split('/').pop() + url.search + url.hash);
    });
    if (!silent) document.dispatchEvent(new CustomEvent('jisr:lang', { detail: lang }));
  }

  window.JISR = window.JISR || {};
  window.JISR.lang = function () { return document.documentElement.lang === 'ar' ? 'ar' : 'en'; };
  window.JISR.setLang = setLang;
  window.JISR.store = store;

  /* Toast */
  window.JISR.toast = function (msg, type) {
    var region = document.getElementById('toasts');
    if (!region) return;
    var t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' error' : '');
    t.setAttribute('role', type === 'error' ? 'alert' : 'status');
    t.innerHTML = window.icon(type === 'error' ? 'alert' : 'check-circle') + '<span></span>';
    t.querySelector('span').textContent = msg;
    while (region.children.length >= 2) region.firstChild.remove();
    region.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 220); }, 3600);
  };

  document.addEventListener('DOMContentLoaded', function () {
    setLang(currentLang(), true);

    document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
      b.addEventListener('click', function () { setLang(window.JISR.lang() === 'ar' ? 'en' : 'ar'); });
    });

    /* Mobile nav */
    var btn = document.querySelector('[data-menu-btn]');
    var nav = document.getElementById('mobile-nav');
    if (btn && nav) {
      var close = function () {
        nav.classList.remove('open'); document.body.classList.remove('nav-open');
        btn.setAttribute('aria-expanded', 'false'); nav.setAttribute('aria-hidden', 'true');
        nav.inert = true;
        btn.querySelector('use').setAttribute('href', '#i-menu');
      };
      var open = function () {
        nav.classList.add('open'); document.body.classList.add('nav-open');
        btn.setAttribute('aria-expanded', 'true'); nav.setAttribute('aria-hidden', 'false');
        nav.inert = false;
        btn.querySelector('use').setAttribute('href', '#i-x');
        var first = nav.querySelector('a,button'); if (first) first.focus();
      };
      nav.inert = true;
      btn.addEventListener('click', function () { nav.classList.contains('open') ? close() : open(); });
      nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { close(); btn.focus(); } });
      window.matchMedia('(min-width: 1100px)').addEventListener('change', function (m) { if (m.matches) close(); });
    }

    /* Scroll reveal (subtle; skipped for reduced motion) */
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (el) { io.observe(el); });
    }

    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  });
})();
