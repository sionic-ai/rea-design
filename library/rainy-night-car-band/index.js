// Text on the stage — the frame-bound hero logo, three About text blocks, the current section name roll, the phone text panel
(() => {
  const AV = window.AV;
  const mobile = AV.mobile;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const quart = (n) => 1 - Math.pow(1 - n, 4);

  // ── Hero logo: rises from below at frame 88, sits in the center at frame 0, exits upward around frame 12 (49px per frame at screen height 900) ──
  const hero = document.querySelector(".av-hero-logo");
  const PER = (49 / 900) * AV.VH;
  AV.onFrame((f) => {
    if (mobile) return;
    const fw = (f - 88 + 96) % 96;
    const on = fw < 24;
    hero.style.visibility = on ? "visible" : "hidden";
    if (on) hero.style.transform = `translate(-50%, calc(-50% + ${((8 - fw) * PER).toFixed(1)}px))`;
  });

  // ── About text: blocks a and b come in over 1.2 seconds once past 9 frames (0.7 seconds on exit) and fade in reverse from frame 22→29.
  //    Chunk c is 37 frames / 51→54. During 12→26 and 40→51 for b and c, the gap among the three lines below widens up to 1.1em ──
  const blocks = Object.fromEntries([...document.querySelectorAll(".av-reveal__block")].map((b) => [b.dataset.block, b]));
  const lines = Object.fromEntries(Object.entries(blocks).map(([k, b]) => [k, [...b.querySelectorAll(".av-reveal__line")]]));
  const span = (N, W, V) => { const B = V > 1 ? 0.55 / (V - 1) : 0; return clamp((N - W * B) / 0.45); };
  const lineStyle = (el, inP, outP, i, n) => {
    const pe = Math.max(1 - span(inP, i, n), span(outP, n - 1 - i, n));
    el.style.opacity = String(1 - pe);
    el.style.filter = pe > 0.001 ? `blur(${(pe * 14).toFixed(2)}px)` : "none";
  };
  const gap = (N, i, n) => { const hi = n - 2, lo = hi - 2; return i < lo || i > hi ? 0.18 : 0.18 + N * 1.1; };
  const shift = (N) => (3 * N * 1.1) / 2;
  let a = 0, c = 0, lastF = null, lastT = 0;
  const toward = (N, on, dt, jump) => (jump ? (on ? 1 : 0) : on ? Math.min(1, N + dt / 1.2) : Math.max(0, N - dt / 0.7));
  AV.onFrame((K) => {
    if (mobile) return;
    const now = performance.now(), dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0.016; lastT = now;
    const jump = reduce || lastF === null || Math.abs(K - lastF) > 96 * 0.25; lastF = K;
    a = toward(a, K >= 9, dt, jump); c = toward(c, K >= 37, dt, jump);
    const A = quart(a), O = quart(c);
    const d = clamp((K - 12) / 14), p = clamp((K - 40) / 11), g = clamp((K - 22) / 7), m = clamp((K - 51) / 3);
    lines.a.forEach((el, i) => lineStyle(el, A, g, i, lines.a.length));
    blocks.b.style.transform = `translateY(calc(-50% + ${shift(d)}em))`;
    lines.b.forEach((el, i) => { el.style.marginBottom = `${gap(d, i, lines.b.length)}em`; lineStyle(el, A, g, i, lines.b.length); });
    blocks.c.style.transform = `translateY(calc(-50% + ${shift(p)}em))`;
    lines.c.forEach((el, i) => { el.style.marginBottom = `${gap(p, i, lines.c.length)}em`; lineStyle(el, O, m, i, lines.c.length); });
  });

  // ── Current section name: on desktop it changes at frames 27·37·53·78, on phone 0.95 screen before the section head. On first appearance it doesn’t roll, it just sits in place ──
  const name = document.querySelector(".av-name");
  const roll = name.querySelector(".av-name__roll");
  const AT = [27, 37, 53, 78];
  const ids = ["music", "bio", "videos", "contact"].map((id) => AV.PAGES.findIndex((p) => p.id === id));
  const mStarts = ids.map((i) => AV.starts[i] - AV.VH * (1 - 0.05));
  let shown = -1;
  AV.onFrame((f) => {
    let idx = -1;
    if (mobile) {
      const y = ((AV.scroll % AV.total) + AV.total) % AV.total;
      for (let i = 0; i < mStarts.length && y >= mStarts[i]; i++) idx = i;
      if (idx === 3) idx = -1;
    } else for (let i = 0; i < AT.length && f >= AT[i]; i++) idx = i;
    if (idx === shown) return;
    const prev = shown; shown = idx;
    name.classList.toggle("is-visible", idx >= 0);
    if (idx < 0) return;
    if (prev < 0) {
      name.classList.add("no-roll");
      roll.style.transform = `translateY(calc(var(--slot-h) * ${-idx}))`;
      requestAnimationFrame(() => requestAnimationFrame(() => name.classList.remove("no-roll")));
    } else roll.style.transform = `translateY(calc(var(--slot-h) * ${-idx}))`;
  });

  if (!mobile) return;

  // ── Phone: the first section logo stays attached below the header, then rises together after one screen ──
  const pages = [...document.querySelectorAll(".av-page")];
  const pins = pages.map((p) => p.querySelector(".av-mp__logo-pin")).filter(Boolean);
  // Second About section: the first group appears with a squared ease up to 0.25, rises one screen from halfway while vanishing, and the second group flows with the section
  const reveals = pages.map((p) => p.querySelector(".av-mp--landing-text")).filter(Boolean);
  const contacts = pages.map((p) => p.querySelector(".av-mp--contact")).filter(Boolean);
  AV.onFrame(() => {
    const vh = innerHeight;
    pins.forEach((pin) => {
      const logo = pin.querySelector(".av-mp__logo");
      const top = parseFloat(getComputedStyle(logo).top) || 0;
      const h = `${Math.round(vh + top + logo.offsetHeight)}px`;
      if (pin.style.height !== h) pin.style.height = h;
    });
    reveals.forEach((page) => {
      const r = page.getBoundingClientRect();
      const pinTop = page.querySelector(".av-mp__reveal-pin").getBoundingClientRect().top;
      const I = vh + r.height, R = I > 0 ? clamp((vh - r.top) / I) : 0, O = R * 2, N = I / 2;
      page.querySelectorAll(".av-mp__line").forEach((el) => {
        const g = +el.dataset.g, j = +el.dataset.j, size = 4;
        let ne = (j - (size - 1) / 2) * el.offsetHeight * 1.15, J = 0;
        if (g === 1) { ne += r.top + 0.8 * vh - (pinTop + vh / 2); J = 1; }
        else {
          ne -= pinTop;
          const re = O - g;
          if (re > 0) {
            if (re < 1) J = Math.pow(Math.min(1, re * 2), 2);
            else { const k = Math.min(1, re - 1); ne -= k * N; J = 1 - k; }
          }
        }
        el.style.opacity = String(J);
        el.style.transform = `translate(-50%, calc(-50% + ${ne.toFixed(1)}px))`;
      });
    });
    // Contact panel background: darkens over 0.35 on entering and lightens over 0.175 on leaving (max 0.92)
    contacts.forEach((el) => {
      const r = el.getBoundingClientRect(), y = vh + r.height, t = y > 0 ? clamp((vh - r.top) / y) : 0;
      el.style.setProperty("--contact-bg", String(0.92 * Math.max(0, Math.min(1, t / 0.35, (1 - t) / 0.175))));
    });
  });
})();
