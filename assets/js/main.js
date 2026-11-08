/* Aerovise — site behaviour
 * Engines: GSAP + ScrollTrigger (scroll, marquee, hero), Lenis (smooth scroll),
 * Motion (Framer Motion's vanilla engine: counters, dialog, menu), hls.js (loaded on demand).
 * Every library is optional: if one fails to load, the page still renders fully.
 */
(() => {
  'use strict';

  /* ============ CONFIG — edit here ============ */
  const CONFIG = {
    email: 'aerovise9@gmail.com',
    whatsapp: '8801978897347', // digits only with country code, e.g. '8801XXXXXXXXX'. Empty = hidden.
    timezone: 'Asia/Dhaka',
    heroStatus: 'Now booking new projects',
    heroVideo: 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8',
    roles: ['cinematic', 'futuristic', 'editorial', 'conversion-driven'],
    // Add real client quotes here to show the "Kind words" section. Leave empty to keep it hidden.
    // { quote: '…', name: 'Jane Cooper', role: 'Founder', company: 'Brand', url: 'https://…' }
    reviews: [],
  };

  /* ============ helpers ============ */
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  const M = window.Motion;
  const hasGsap = !!G;
  if (hasGsap && ST) G.registerPlugin(ST);
  if (ST) ST.config({ ignoreMobileResize: true });
  const safe = (fn) => { try { return fn(); } catch (e) { return undefined; } };
  const raf = (fn) => requestAnimationFrame(fn);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // No GSAP at all → show everything, keep the rest of the page working.
  if (!hasGsap || reduce) root.classList.add('show-all');

  /* ============ text/config bindings ============ */
  $$('[data-year]').forEach((n) => (n.textContent = String(new Date().getFullYear())));
  $$('[data-email]').forEach((a) => (a.href = 'mailto:' + CONFIG.email));
  $$('[data-email-text]').forEach((n) => (n.textContent = CONFIG.email));
  const heroAvail = $('#hero-avail');
  if (heroAvail && CONFIG.heroStatus) heroAvail.textContent = CONFIG.heroStatus;

  const waDigits = String(CONFIG.whatsapp || '').replace(/\D/g, '');
  if (waDigits.length >= 8) {
    const href = 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent('Hi Aerovise — I would like to discuss a project.');
    const row = $('#wa-row'), link = $('#wa-link');
    if (row && link) { link.href = href; row.hidden = false; }
    const fab = document.createElement('a');
    fab.className = 'wa-fab';
    fab.href = href; fab.target = '_blank'; fab.rel = 'noopener';
    fab.setAttribute('aria-label', 'Chat with Aerovise on WhatsApp');
    fab.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.1.89.9-3.02-.2-.31a8.2 8.2 0 1 1 6.9 3.77Zm4.5-6.1c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.55.12-.17.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.33.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7 1.56.67 2.17.73 2.95.61.47-.07 1.46-.6 1.66-1.18.2-.58.2-1.07.14-1.18-.06-.1-.23-.16-.48-.28Z"/></svg>';
    document.body.appendChild(fab);
  }

  // Reviews (hidden until CONFIG.reviews has entries)
  if (Array.isArray(CONFIG.reviews) && CONFIG.reviews.length) {
    const sec = $('#reviews'), list = $('#reviews-list');
    if (sec && list) {
      CONFIG.reviews.forEach((r) => {
        const fig = document.createElement('figure');
        fig.className = 'card p-7 md:p-9 flex flex-col gap-6';
        fig.setAttribute('data-reveal', '');
        const q = document.createElement('blockquote');
        q.className = 'font-display italic text-2xl md:text-3xl leading-snug';
        q.textContent = '“' + r.quote + '”';
        const cap = document.createElement('figcaption');
        cap.className = 'text-sm text-muted';
        const who = document.createElement('span');
        who.className = 'text-text-primary';
        who.textContent = r.name || '';
        cap.appendChild(who);
        const meta = [r.role, r.company].filter(Boolean).join(' · ');
        if (meta) cap.appendChild(document.createTextNode(' — ' + meta));
        fig.append(q, cap);
        list.appendChild(fig);
      });
      sec.hidden = false;
    }
  }

  // Studio clock
  const clockEl = $('#local-time');
  function tickClock() {
    if (!clockEl) return;
    const t = safe(() => new Intl.DateTimeFormat('en-US', { timeZone: CONFIG.timezone, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()));
    clockEl.textContent = t ? t + ' · GMT+6' : '—';
  }
  tickClock();
  setInterval(tickClock, 30000);

  /* ============ image fallbacks for work screenshots ============ */
  function wireShot(img) {
    const shot = img.closest('.shot');
    const fail = () => {
      const fb = img.getAttribute('data-fallback');
      if (fb && !img.dataset.triedFb) { img.dataset.triedFb = '1'; img.removeAttribute('data-fallback'); img.src = fb; return; }
      if (shot) shot.classList.add('is-broken');
    };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
  }
  $$('.shot img').forEach(wireShot);

  /* ============ smooth scroll (Lenis) ============ */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.95 });
    root.classList.add('has-lenis');
    if (ST) lenis.on('scroll', ST.update);
    G.ticker.add((time) => lenis.raf(time * 1000));
    G.ticker.lagSmoothing(0);
  }
  const lockScroll = () => { root.classList.add('is-locked'); if (lenis) lenis.stop(); };
  const unlockScroll = () => { root.classList.remove('is-locked'); if (lenis) lenis.start(); };
  const scrollToY = (y, immediate) => {
    if (lenis) lenis.scrollTo(y, { duration: immediate ? 0 : 1.4, immediate: !!immediate });
    else window.scrollTo({ top: y, behavior: immediate || reduce ? 'auto' : 'smooth' });
  };

  // Anchor links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.getElementById(id.slice(1));
    if (!target) return;
    e.preventDefault();
    closeMenu(); // restarts Lenis first, otherwise a stopped Lenis ignores scrollTo
    const y = id === '#home' ? 0 : target.getBoundingClientRect().top + window.scrollY;
    scrollToY(y);
    safe(() => history.replaceState(null, '', id));
  });

  /* ============ progress, nav pill ============ */
  const progress = $('#progress');
  const pill = $('#nav-pill');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    raf(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
      if (pill) pill.classList.toggle('shadow-2xl', y > 60);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active nav link (IntersectionObserver)
  const navLinks = $$('.nav-link');
  const navMap = new Map(navLinks.map((l) => [l.getAttribute('href').slice(1), l]));
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((l) => l.classList.remove('is-active'));
      const l = navMap.get(en.target.id);
      if (l) l.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['work', 'services', 'studio', 'process', 'faq', 'contact'].forEach((id) => { const s = document.getElementById(id); if (s) navIO.observe(s); });
  const heroSec = $('#home');
  if (heroSec) new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) navLinks.forEach((l) => l.classList.remove('is-active')); }), { threshold: 0.5 }).observe(heroSec);

  /* ============ mobile menu ============ */
  const menu = $('#menu');
  const menuBtn = $('#menu-btn');
  const bars = $$('[data-bar]');
  let menuOpen = false;
  function openMenu() {
    if (!menu || menuOpen) return;
    menuOpen = true;
    menu.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    if (bars[0]) bars[0].style.transform = 'translateY(3px) rotate(45deg)';
    if (bars[1]) bars[1].style.transform = 'translateY(-3px) rotate(-45deg)';
    lockScroll();
    const links = $$('.menu-link', menu);
    if (!reduce && M && M.animate && M.stagger) {
      safe(() => M.animate(links, { opacity: [0, 1], transform: ['translateY(36px)', 'translateY(0px)'] }, { duration: 0.7, delay: M.stagger(0.06), ease: [0.22, 1, 0.36, 1] }));
    } else if (!reduce && hasGsap) {
      G.fromTo(links, { opacity: 0, y: 36 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.7, ease: 'expo.out' });
    }
  }
  function closeMenu() {
    if (!menu || !menuOpen) return;
    menuOpen = false;
    menu.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    bars.forEach((b) => (b.style.transform = ''));
    unlockScroll();
  }
  if (menuBtn) menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });

  /* ============ videos (HLS, lazy, pause off-screen) ============ */
  const loaded = {};
  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.async = true; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    return loaded[src];
  }
  function attachVideo(video) {
    if (!video || video.dataset.ready || reduce || saveData) return;
    video.dataset.ready = '1';
    const src = CONFIG.heroVideo;
    const play = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    if (video.canPlayType('application/vnd.apple.mpegurl')) { video.src = src; play(); return; }
    loadScript('assets/js/vendor/hls.min.js').then(() => {
      if (!window.Hls || !window.Hls.isSupported()) return;
      const hls = new window.Hls({ capLevelToPlayerSize: true, maxBufferLength: 10, enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, play);
      hls.on(window.Hls.Events.ERROR, (_, d) => { if (d && d.fatal) safe(() => hls.destroy()); });
    }).catch(() => {});
  }
  function pauseWhenHidden(video) {
    if (!video) return;
    new IntersectionObserver((es) => es.forEach((en) => {
      if (!video.dataset.ready) return;
      if (en.isIntersecting) { const p = video.play(); if (p && p.catch) p.catch(() => {}); } else video.pause();
    }), { threshold: 0 }).observe(video);
  }
  const heroVideo = $('#hero-video');
  const footerVideo = $('#footer-video');
  pauseWhenHidden(heroVideo);
  pauseWhenHidden(footerVideo);
  if (footerVideo) new IntersectionObserver((es, io) => { if (es.some((e) => e.isIntersecting)) { attachVideo(footerVideo); io.disconnect(); } }, { rootMargin: '600px 0px' }).observe(footerVideo);

  /* ============ reveals ============ */
  function reveal(el) {
    if (el.classList.contains('is-in')) return;
    if (!hasGsap || reduce) { el.classList.add('is-in'); return; }
    const prev = el.style.transition;
    el.style.transition = 'none';
    el.classList.add('is-in');
    G.fromTo(el, { opacity: 0, y: 34 }, {
      opacity: 1, y: 0, duration: 1.05, delay: parseFloat(el.dataset.rd || '0'), ease: 'expo.out',
      clearProps: 'opacity,transform',
      onComplete: () => { el.style.transition = prev || ''; },
    });
  }
  function initReveals() {
    const items = $$('[data-reveal]');
    items.forEach((el) => {
      const p = el.parentElement;
      if (p && p.hasAttribute('data-stagger')) el.dataset.rd = String(Math.min(Array.prototype.indexOf.call(p.children, el), 9) * 0.07);
    });
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); reveal(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  /* ============ hero ============ */
  let heroStarted = false;
  function startHero() {
    if (heroStarted) return;
    heroStarted = true;
    const words = $$('.hero-word');
    const els = $$('[data-hero]');
    if (!hasGsap || reduce) { els.forEach((e) => e.classList.add('is-in')); words.forEach((w) => (w.style.transform = 'none')); attachVideo(heroVideo); return; }
    els.forEach((e) => e.classList.add('is-in'));
    const tl = G.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(words, { yPercent: 105, y: 0 }, { yPercent: 0, y: 0, duration: 1.35, stagger: 0.07, delay: 0.05 }, 0)
      .fromTo(els, { opacity: 0, y: 26, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.05, stagger: 0.09, clearProps: 'filter,opacity' }, 0.25);
    attachVideo(heroVideo);
    startRoleCycle();
  }

  function startRoleCycle() {
    const el = $('#role-word');
    if (!el || reduce || !hasGsap || CONFIG.roles.length < 2) return;
    let i = 0;
    const next = () => {
      if (document.hidden) return;
      i = (i + 1) % CONFIG.roles.length;
      G.to(el, { yPercent: -110, duration: 0.45, ease: 'power3.in', onComplete: () => {
        el.textContent = CONFIG.roles[i];
        G.fromTo(el, { yPercent: 110 }, { yPercent: 0, duration: 0.65, ease: 'power3.out' });
      } });
    };
    setInterval(next, 2600);
  }

  // hero spotlight follows the pointer
  if (heroSec && finePointer && !reduce) {
    let tx = 50, ty = 40, cx = 50, cy = 40, run = false;
    const loop = () => {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      heroSec.style.setProperty('--hx', cx.toFixed(2) + '%');
      heroSec.style.setProperty('--hy', cy.toFixed(2) + '%');
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf(loop); else run = false;
    };
    heroSec.addEventListener('pointermove', (e) => {
      const r = heroSec.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100; ty = ((e.clientY - r.top) / r.height) * 100;
      if (!run) { run = true; raf(loop); }
    });
  }

  /* ============ loader ============ */
  const loader = $('#loader');
  function finishLoader() {
    safe(() => sessionStorage.setItem('av-loaded', '1'));
    root.classList.remove('is-loading');
    if (!loader) { startHero(); return; }
    if (!hasGsap || reduce) { loader.style.display = 'none'; startHero(); return; }
    G.to(loader, { yPercent: -100, duration: 0.95, ease: 'power4.inOut', onStart: () => G.delayedCall(0.45, startHero), onComplete: () => { loader.style.display = 'none'; } });
  }
  function runLoader() {
    const skip = root.classList.contains('skip-loader') || reduce || !loader;
    if (skip) { if (loader) loader.style.display = 'none'; const ready = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve(); ready.then(startHero); return; }
    root.classList.add('is-loading');
    const count = $('#loader-count'), bar = $('#loader-bar'), word = $('#loader-word');
    const words = ['Crafting', 'Designing', 'Animating', 'Launching'];
    let wi = 0;
    const wInt = setInterval(() => {
      wi = (wi + 1) % words.length;
      G.to(word, { yPercent: -60, opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => { word.textContent = words[wi]; G.fromTo(word, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }); } });
    }, 650);
    const D = 2300, t0 = performance.now();
    const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]) : Promise.resolve();
    let done = false;
    const step = (now) => {
      const p = clamp((now - t0) / D, 0, 1);
      const e = 1 - Math.pow(1 - p, 2.2);
      count.textContent = String(Math.round(e * 100)).padStart(3, '0');
      bar.style.transform = 'scaleX(' + e + ')';
      if (p < 1) raf(step);
      else if (!done) { done = true; clearInterval(wInt); fontsReady.then(() => setTimeout(finishLoader, 250)); }
    };
    raf(step);
  }

  /* ============ marquees ============ */
  function initMarquees() {
    $$('[data-marquee]').forEach((track, idx) => {
      if (!hasGsap || reduce) return;
      const originals = Array.from(track.childNodes);
      const wrap = document.createDocumentFragment();
      const buildSet = () => originals.map((n) => n.cloneNode(true));
      track.innerHTML = '';
      let set = buildSet();
      set.forEach((n) => track.appendChild(n));
      let guard = 0;
      while (track.scrollWidth < window.innerWidth * 1.15 && guard++ < 6) { buildSet().forEach((n) => track.appendChild(n)); }
      const setWidth = track.scrollWidth;
      Array.from(track.childNodes).forEach((n) => wrap.appendChild(n.cloneNode(true)));
      track.appendChild(wrap);
      const speed = idx === 0 ? 55 : 45; // px per second
      const tween = G.to(track, { x: -setWidth, duration: setWidth / speed, ease: 'none', repeat: -1 });
      if (lenis) {
        let boost = 0;
        lenis.on('scroll', ({ velocity }) => { boost = clamp(Math.abs(velocity) * 0.12, 0, 4); G.to(tween, { timeScale: 1 + boost, duration: 0.3, overwrite: true }); });
        G.ticker.add(() => { if (tween.timeScale() > 1.01) tween.timeScale(1 + (tween.timeScale() - 1) * 0.94); });
      }
    });
  }

  /* ============ counters ============ */
  function initCounters() {
    $$('[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count), suffix = el.dataset.suffix || '';
      const io = new IntersectionObserver((es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (reduce) { el.textContent = target + suffix; return; }
        const write = (v) => (el.textContent = Math.round(v) + suffix);
        if (M && M.animate) safe(() => M.animate(0, target, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: write })) ;
        else { const o = { v: 0 }; G.to(o, { v: target, duration: 2, ease: 'expo.out', onUpdate: () => write(o.v) }); }
        // guarantee the final value even if the engine skips the last frame
        setTimeout(() => (el.textContent = target + suffix), 2400);
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ============ process line ============ */
  function initProcess() {
    const track = $('#process-track'), fill = $('#process-fill');
    const steps = $$('.p-step');
    if (!track || !steps.length) return;
    if (reduce || !hasGsap || !ST) { steps.forEach((s) => s.classList.add('is-lit')); return; }
    if (window.matchMedia('(min-width: 768px)').matches && fill) {
      G.to(fill, { scaleX: 1, ease: 'none', scrollTrigger: {
        trigger: track, start: 'top 70%', end: 'bottom 55%', scrub: 0.4,
        onUpdate: (self) => steps.forEach((s, i) => s.classList.toggle('is-lit', self.progress >= i / steps.length + 0.02)),
      } });
    } else {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-lit'); io.unobserve(en.target); } }), { threshold: 0.6 });
      steps.forEach((s) => io.observe(s));
    }
  }

  /* ============ hover physics ============ */
  function initPointerFx() {
    if (!finePointer || reduce) return;
    // spotlight / sheen coordinates
    $$('.spotlight, [data-shot]').forEach((el) => {
      let pend = false, ex = 0, ey = 0;
      el.addEventListener('pointermove', (e) => {
        ex = e.clientX; ey = e.clientY;
        if (pend) return; pend = true;
        raf(() => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (ex - r.left) + 'px'); el.style.setProperty('--my', (ey - r.top) + 'px'); pend = false; });
      });
    });
    if (!hasGsap) return;
    // magnetic buttons
    $$('[data-magnet]').forEach((el) => {
      const qx = G.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      const qy = G.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); qx((e.clientX - (r.left + r.width / 2)) * 0.22); qy((e.clientY - (r.top + r.height / 2)) * 0.28); });
      el.addEventListener('pointerleave', () => { G.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.4)', overwrite: 'auto' }); });
    });
    // 3D tilt
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        G.to(el, { rotateX: -py * 5, rotateY: px * 5, transformPerspective: 1000, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      });
      el.addEventListener('pointerleave', () => G.to(el, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1,0.45)', overwrite: 'auto' }));
    });
  }

  /* ============ custom cursor ============ */
  function initCursor() {
    const c = $('#cursor');
    if (!c || !finePointer || reduce) return;
    const ring = $('.cursor-ring', c), dot = $('.cursor-dot', c), label = $('#cursor-label');
    let x = -100, y = -100, rx = -100, ry = -100, on = false;
    document.addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      if (!on) { on = true; c.classList.add('is-on'); rx = x; ry = y; }
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { on = false; c.classList.remove('is-on'); });
    const loop = () => {
      rx += (x - rx) * 0.2; ry += (y - ry) * 0.2;
      dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      raf(loop);
    };
    raf(loop);
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const lab = t.closest('[data-cursor]');
      const link = t.closest('a,button,summary,input,select,textarea,label,[data-magnet]');
      c.classList.toggle('is-label', !!lab);
      c.classList.toggle('is-link', !!link && !lab);
      if (label) label.textContent = lab ? lab.getAttribute('data-cursor') : '';
    });
  }

  /* ============ FAQ accordion ============ */
  function initFaq() {
    const items = $$('details.faq');
    const closeOne = (d) => {
      const body = $('.faq-body', d);
      if (reduce || !hasGsap) { d.open = false; return; }
      G.to(body, { height: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => { d.open = false; body.style.height = ''; } });
    };
    const openOne = (d) => {
      const body = $('.faq-body', d);
      d.open = true;
      if (reduce || !hasGsap) return;
      const h = body.scrollHeight;
      G.fromTo(body, { height: 0 }, { height: h, duration: 0.55, ease: 'power3.out', onComplete: () => { body.style.height = 'auto'; } });
    };
    items.forEach((d) => {
      $('summary', d).addEventListener('click', (e) => {
        e.preventDefault();
        if (d.open) closeOne(d);
        else { items.forEach((o) => { if (o !== d && o.open) closeOne(o); }); openOne(d); }
      });
    });
  }

  /* ============ live preview dialog ============ */
  function initPreview() {
    const dlg = $('#preview');
    if (!dlg || typeof dlg.showModal !== 'function') {
      // No <dialog> support: buttons simply open the site in a new tab.
      $$('[data-preview]').forEach((b) => b.addEventListener('click', () => window.open(b.dataset.preview, '_blank', 'noopener')));
      return;
    }
    const frame = $('#preview-frame'), urlEl = $('#preview-url'), openEl = $('#preview-open'), loadEl = $('#preview-loading');
    let lastBtn = null, failTimer = null;
    const prettyUrl = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
    $$('[data-preview]').forEach((b) => b.addEventListener('click', () => {
      lastBtn = b;
      const url = b.dataset.preview;
      urlEl.textContent = prettyUrl(url);
      openEl.href = url;
      loadEl.classList.remove('is-done');
      loadEl.textContent = 'Loading preview…';
      frame.src = url;
      dlg.showModal();
      lockScroll();
      const c = $('#cursor'); if (c) c.classList.remove('is-on');
      clearTimeout(failTimer);
      failTimer = setTimeout(() => { loadEl.textContent = 'Still loading… if blank, use “Open live site”.'; }, 7000);
      if (!reduce) {
        if (M && M.animate) safe(() => M.animate(dlg, { opacity: [0, 1], transform: ['translateY(18px) scale(.97)', 'translateY(0px) scale(1)'] }, { duration: 0.45, ease: [0.22, 1, 0.36, 1] }));
        else if (hasGsap) G.fromTo(dlg, { opacity: 0, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'expo.out', clearProps: 'all' });
      }
    }));
    frame.addEventListener('load', () => { if (frame.src && frame.src !== 'about:blank') { clearTimeout(failTimer); loadEl.classList.add('is-done'); } });
    const close = () => { if (dlg.open) dlg.close(); };
    $('#preview-close').addEventListener('click', close);
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    dlg.addEventListener('close', () => { frame.src = 'about:blank'; clearTimeout(failTimer); unlockScroll(); if (lastBtn) lastBtn.focus({ preventScroll: true }); });
  }

  /* ============ project brief → mailto ============ */
  function initForm() {
    const form = $('#brief');
    if (!form) return;
    const status = $('#brief-status');
    const say = (t, bad) => { status.textContent = t; status.style.color = bad ? '#f87171' : ''; };
    const val = (n) => String(new FormData(form).get(n) || '').trim();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      $$('.input', form).forEach((i) => i.removeAttribute('aria-invalid'));
      const name = val('name'), email = val('email'), message = val('message');
      const bad = [];
      if (name.length < 2) bad.push('f-name');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) bad.push('f-email');
      if (message.length < 10) bad.push('f-msg');
      if (bad.length) {
        bad.forEach((id) => $('#' + id).setAttribute('aria-invalid', 'true'));
        $('#' + bad[0]).focus();
        say('Please complete name, a valid email and a short project description.', true);
        return;
      }
      const subject = 'Project brief — ' + val('type') + ' (' + name + ')';
      const body = 'Name: ' + name + '\nEmail: ' + email + '\nNeed: ' + val('type') + '\nBudget: ' + val('budget') + '\n\nAbout the project:\n' + message + '\n';
      say('Opening your email app… If nothing opens, email ' + CONFIG.email + ' directly.');
      window.location.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ============ misc ============ */
  const toTop = $('#to-top');
  if (toTop) toTop.addEventListener('click', () => scrollToY(0));
  if (hasGsap && ST && !reduce && heroSec) {
    G.to('#hero-bg', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: heroSec, start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* ============ boot ============ */
  initReveals();
  initMarquees();
  initCounters();
  initProcess();
  initPointerFx();
  initCursor();
  initFaq();
  initPreview();
  initForm();
  runLoader();

  // Safety net: never leave the visitor stuck behind the loader or with hidden content.
  setTimeout(() => {
    if (loader && loader.style.display !== 'none' && !heroStarted) { loader.style.display = 'none'; root.classList.remove('is-loading'); startHero(); }
  }, 9000);
  window.addEventListener('load', () => { if (ST) ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (ST) ST.refresh(); });
})();
