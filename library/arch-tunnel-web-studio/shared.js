// Shared mechanisms for the whole site — Lenis (lerp .1, native scroll on phones) · swup transition (dark curtain + accent curtain wave) · per-section background changing · menu ·
// Horizontal flow section · drag-to-page row · opening questions. As in the original, one bundle runs on every page and re-hooks onto the new body on each transition
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = innerWidth < 768 || matchMedia("(pointer: coarse)").matches;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x) => Math.min(1, Math.max(0, x));
  // Follow-through share matched to frame length — like original g(k), k at 60fps
  let dt = 1 / 60;
  const follow = (k) => 1 - Math.pow(1 - k, dt * 60);

  let lenis = null;
  if (!reduce && !touch && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
  }
  let lastT = performance.now();
  gsap.ticker.add((t) => {
    const now = t * 1000;
    dt = Math.min(0.1, Math.max(0.001, (now - lastT) / 1000));
    lastT = now;
    lenis && lenis.raf(now);
    ticks.forEach((f) => f());
  });
  gsap.ticker.lagSmoothing(0);
  const ticks = new Set();
  const offs = [];
  window.mk = { lenis, ticks, offs, follow, clamp, reduce, touch };

  // ── Per-section background: while the section center passes the screen center, that section’s tone
  function tones() {
    $$("[data-tone]", $("#swup")).forEach((s) => ScrollTrigger.create({
      trigger: s, start: "top 50%", end: "bottom 50%",
      onToggle: (st) => st.isActive && (root.dataset.tone = s.dataset.tone),
    }));
    const first = $("#swup [data-tone]");
    if (first) root.dataset.tone = first.dataset.tone;
  }

  // ── Menu: the panel opens from top to bottom and the big links rise in turn
  const menu = $(".mk-menu"), menuBtn = $(".mk-menu-btn");
  let open = false;
  const setMenu = (on) => {
    if (on === open || !menu) return;
    open = on;
    root.classList.toggle("mk-open", on);
    menuBtn.setAttribute("aria-expanded", String(on));
    on ? lenis?.stop() : lenis?.start();
    // Original stack type — button text pieces vanish over .27s staggered .12s (the original vanish stagger of 450ms is counted from the 45ms cursor-text fold, so the last piece is about .5s), the hamburger lines shrink to width 0 (.38s) and the bundle rotates 180° (.48s).
    // Three left panel layers and the link panel slide in from −100% in sequence at .083s steps over .72s expo.inOut (after .24s)
    const layers = $$(".mk-menu__lay, .mk-menu__in", menu), d = (s) => (reduce ? 0 : s);
    const chars = $$(".mk-menu-btn__t > span", menuBtn), lines = $$(".mk-hb b", menuBtn), hb = $(".mk-hb", menuBtn);
    gsap.killTweensOf([...layers, ...chars, ...lines, hb]);
    if (on) {
      gsap.set(menu, { visibility: "visible" });
      gsap.to(chars, { opacity: 0, duration: d(0.27), ease: "power1.out", stagger: d(0.12), delay: d(0.03) });
      // Wind the slow head of expo forward so it starts at the original’s start time
      gsap.to(lines, { width: 0, duration: d(0.76), ease: "expo.inOut" }).seek(d(0.11));
      gsap.to(hb, { rotate: 180, duration: d(0.95), ease: "expo.inOut" }).seek(d(0.15));
      gsap.to(layers, { xPercent: 100, duration: d(1.4), ease: "expo.inOut", stagger: d(0.055) }).seek(d(0.21));
    } else {
      gsap.to(layers.slice().reverse(), { xPercent: 0, duration: d(0.6), ease: "expo.inOut", stagger: d(0.05), onComplete: () => gsap.set(menu, { visibility: "hidden" }) });
      gsap.to(chars, { opacity: 1, duration: d(0.27), stagger: d(0.05), delay: d(0.3) });
      gsap.to(lines, { width: "20rem", duration: d(0.38), ease: "power2.inOut", delay: d(0.2) });
      gsap.to(hb, { rotate: 0, duration: d(0.48), ease: "power2.inOut", delay: d(0.1) });
    }
  };
  menuBtn?.addEventListener("click", () => setMenu(!open));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  // ── Horizontal flow section: fixed height = Screen + horizontal overflow, tracks progress × overflow at .14
  function hscroll(sec) {
    const pin = $(".mk-hs__pin", sec), track = $(".mk-hs__track", sec), bar = $(".mk-hs__bar i", sec);
    if (!pin || !track || touch) return;
    let max = 0, cur = 0;
    const size = () => { max = Math.max(0, track.scrollWidth - track.clientWidth + 50 * parseFloat(getComputedStyle(root).fontSize)); sec.style.height = `${innerHeight + max}px`; };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(track);
    const tick = () => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
      cur += (p * max - cur) * (reduce ? 1 : follow(0.14));
      track.style.transform = `translate3d(${-cur.toFixed(1)}px,0,0)`;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    ticks.add(tick);
    offs.push(() => { ticks.delete(tick); ro.disconnect(); sec.style.height = ""; });
  }

  // ── Drag-to-flip row: follows while dragged, and on release glides by its speed then stops
  function drag(box) {
    const row = $(".mk-drag__row", box);
    if (!row) return;
    let x = 0, to = 0, down = false, sx = 0, sTo = 0, v = 0, lx = 0;
    const lim = () => Math.min(0, box.clientWidth - row.scrollWidth);
    const onDown = (e) => { down = true; sx = e.clientX; sTo = to; lx = e.clientX; v = 0; box.setPointerCapture?.(e.pointerId); };
    const onMove = (e) => { if (!down) return; to = sTo + (e.clientX - sx); v = e.clientX - lx; lx = e.clientX; };
    const onUp = () => { if (!down) return; down = false; to += v * 12; };
    box.addEventListener("pointerdown", onDown);
    box.addEventListener("pointermove", onMove);
    addEventListener("pointerup", onUp);
    const tick = () => {
      to = Math.min(0, Math.max(lim(), to));
      x += (to - x) * (reduce ? 1 : follow(0.12));
      row.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    };
    ticks.add(tick);
    offs.push(() => { ticks.delete(tick); removeEventListener("pointerup", onUp); });
  }

  // ── Questions: only one open at a time (.4321s ease-out — CSS)
  function faq(list) {
    const items = $$(".mk-faq__item", list);
    items.forEach((it) => $(".mk-faq__q", it).addEventListener("click", () => {
      const on = !it.classList.contains("is-open");
      items.forEach((o) => { o.classList.remove("is-open"); $(".mk-faq__q", o).setAttribute("aria-expanded", "false"); });
      if (on) { it.classList.add("is-open"); $(".mk-faq__q", it).setAttribute("aria-expanded", "true"); }
    }));
  }

  // ── Giant footer logo: once it enters the screen bottom, each stroke pops up from below
  function footMark(svg) {
    const parts = $$("path", svg);
    if (reduce || !parts.length) return;
    gsap.fromTo(parts, { yPercent: 110, scaleY: 0.6 }, { yPercent: 0, scaleY: 1, duration: 1.1, ease: "back.out(1.4)", stagger: 0.08, scrollTrigger: { trigger: svg, start: "top 95%", toggleActions: "play none none reverse" } });
  }

  // Hooked per page — index.js, list.js, service.js and about.js put them into window.mkPage[name]
  // Size (%) the cursor circle expands to — the original cursor module’s groups: buttons 2 · logo and links 7 · question and logo shapes 12 · draggable panels 32 (‹Drag›) · photo links 50
  const CURSOR = [[".mk-btn, .mk-menu-btn", "2"], [".mk-head > a, .mk-foot__low a, .mk-menu__nav a, .mk-sg__row a", "7"], [".mk-faq__q, .mk-partners__logo", "12", " "], [".mk-drag", "32", "Drag"], [".mk-proj__card, .mk-plist__item, .mk-hero__card", ""]];
  const cursorTargets = () => CURSOR.forEach(([sel, size, text]) => $$(sel).forEach((el) => { if (el.dataset.cursor == null) { el.dataset.cursor = size; if (text) el.dataset.cursorText = text; } }));

  window.mkPage = window.mkPage || {};
  function init() {
    const main = $("#swup");
    cursorTargets();
    tones();
    $$(".mk-hs", main).forEach(hscroll);
    $$(".mk-drag", main).forEach(drag);
    $$(".mk-faq__list", main).forEach(faq);
    $$(".mk-foot__mark").forEach(footMark);
    const page = main?.dataset.page;
    const f = window.mkPage[page];
    if (f) { const off = f(); if (typeof off === "function") offs.push(off); }
    ScrollTrigger.refresh();
  }
  function teardown() {
    offs.splice(0).forEach((f) => f());
    ScrollTrigger.getAll().forEach((t) => t.kill());
    $$(".mk-foot__mark path").forEach((p) => gsap.set(p, { clearProps: "all" }));
  }

  // ── Transition: original Brand liquid — a dark sheet (.66s) and an accent sheet (.72s, .09s later) rise from below along with a 46vh wavy edge, and the next section name rises (.7s, .4s later).
  // In a new section the name slides up and out in .42s, and the accent curtain (.065s) and dark curtain (.16s) lift upward in .68s. The body is revealed at 45% of the lift.
  const pt = $(".mk-pt");
  const EASE = "cubic-bezier(.76,0,.24,1)";
  const anim = (el, kf, o) => el.animate(kf, { fill: "both", ...o }).finished.catch(() => {});
  const ptOut = (name) => {
    if (!pt || reduce) return Promise.resolve();
    pt.classList.add("is-on");
    $(".mk-pt__t span", pt).textContent = name || "";
    $(".mk-pt__tag", pt).textContent = `(${String(name || "").toUpperCase()})`;
    const from = "translateY(calc(100% + 46vh))";
    anim($(".is-dk", pt), [{ transform: from }, { transform: "none" }], { duration: 660, easing: EASE });
    anim($(".is-ac", pt), [{ transform: from }, { transform: "none" }], { duration: 720, delay: 90, easing: EASE });
    anim($(".mk-pt__t span", pt), [{ transform: "translateY(110%)" }, { transform: "none" }], { duration: 700, delay: 400, easing: "cubic-bezier(.16,1,.3,1)" });
    anim($(".mk-pt__tag", pt), [{ opacity: 0 }, { opacity: 1 }], { duration: 340, delay: 440 });
    return new Promise((res) => setTimeout(res, 1000));
  };
  const ptIn = () => {
    if (!pt || reduce || !pt.classList.contains("is-on")) return Promise.resolve();
    const to = "translateY(calc(-100% - 46vh))";
    anim($(".mk-pt__t span", pt), [{ transform: "none" }, { transform: "translateY(-40%)", opacity: 0 }], { duration: 420, easing: "cubic-bezier(.7,0,.84,0)" });
    anim($(".is-ac", pt), [{ transform: "none" }, { transform: to }], { duration: 680, delay: 65, easing: EASE });
    const last = anim($(".is-dk", pt), [{ transform: "none" }, { transform: to }], { duration: 680, delay: 160, easing: EASE });
    last.then(() => { pt.classList.remove("is-on"); pt.getAnimations({ subtree: true }).forEach((a) => a.cancel()); });
    return new Promise((res) => setTimeout(res, Math.round(0.45 * 680)));
  };

  let swup = null;
  if (window.Swup && location.protocol !== "file:") {
    const plugins = window.SwupHeadPlugin ? [new SwupHeadPlugin({ awaitAssets: true })] : [];
    swup = new Swup({ containers: ["#swup"], animationSelector: false, plugins, linkSelector: 'a[href]:not([href^="#"]):not([target])' });
    let label = "";
    document.addEventListener("click", (e) => { const a = e.target.closest("a[href]"); if (a) label = a.dataset.pt || a.textContent.trim(); }, true);
    swup.hooks.replace("animation:out:await", () => { setMenu(false); return ptOut(label); });
    swup.hooks.replace("animation:in:await", () => ptIn());
    swup.hooks.before("content:replace", teardown);
    swup.hooks.on("content:replace", () => { lenis?.scrollTo(0, { immediate: true }); init(); markNav(); });
  }
  const markNav = () => $$(".mk-menu__nav a").forEach((a) => (a.pathname === location.pathname ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  window.mkSwup = swup;
  // Only on the first open does the header-row button come down late (3.9s) and settle — absent in the original 3s capture, present in the 5s capture
  if (!reduce) $(".mk-head__right")?.animate([{ transform: "translateY(-120%)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 700, delay: 3900, easing: "cubic-bezier(.34,1.45,.6,1)", fill: "backwards" });
  init();
  markNav();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
