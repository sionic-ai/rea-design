/* Shared by all pages — header line · sound button · loading gauge · cursor text · footer · white liquid next page · Lenis · page turn. 
   Page JS hooks what to do after loading finishes with MR.ready(fn). */
(() => {
  const body = document.body;
  const page = body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const MR = (window.MR = Object.assign(window.MR || {}, { reduce, css, readies: [] }));
  MR.ready = (fn) => (MR.loaded ? fn() : MR.readies.push(fn));
  const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M8 2v11M3.5 8.5 8 13l4.5-4.5"/></svg>';
  const GO = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  MR.ARROW = ARROW;
  MR.GO = GO;
  const cur = (k) => (k === page ? ' aria-current="page"' : "");

  // ── Header line ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.outerHTML = `
<header class="mr-header" data-slot="header">
  <div class="mr-header__tint"></div>
  <a class="mr-logo" href="index.html" aria-label="Back to start" data-load-nav>Logo</a>
  <nav class="mr-nav" data-load-nav>
    <button class="mr-sound" type="button" aria-label="Toggle sound off and on" aria-pressed="false"><svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M 0 15 H 30"/></svg></button>
    <a href="list.html"${cur("list")}>Work</a>
    <a href="about.html"${cur("about")}>About</a>
    <a class="mr-cta" href="#contact"><span class="mr-cta__label">Contact Us</span><span class="mr-cta__bg"></span></a>
  </nav>
</header>`;
  }

  // ── Loading and cursor ──
  body.insertAdjacentHTML("afterbegin", `<section class="mr-loading" data-slot="loader" aria-hidden="true"><div class="mr-loading__in"><svg class="mr-loading__mark" viewBox="0 0 46 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M2 11c3-5 8-5 11 0M18 3v8h6M30 11c0-5 2-8 5-8s5 3 5 8"/><circle cx="43" cy="7" r="2.5"/></svg><div class="mr-gauge"><div class="mr-gauge__tick"></div></div><p class="mr-loading__logo">Logo</p></div></section>`);
  body.insertAdjacentHTML("beforeend", `<div class="mr-cursor is-hidden" aria-hidden="true"><span>Press to turn sound on</span></div>`);

  // ── Footer · next page ──
  const NEXT = { home: ["about.html", "Your next page name here"], list: ["about.html", "Your next page name here"], about: ["list.html", "Your next page name here"], detail: ["about.html", "Your next page name here"] };
  const foot = document.querySelector('footer[data-slot="footer"]');
  if (foot && !foot.children.length) {
    const talk = '<span>Let’s talk</span><b>LET\'S TALK</b>'.repeat(10);
    const [nh, nt] = NEXT[page] || NEXT.home;
    foot.className = "mr-footer";
    foot.id = "contact";
    foot.innerHTML = `
<div class="mr-footer__mark" data-slot="footer-mark" aria-hidden="true">
  <svg viewBox="0 0 1340 300" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M60 230c40-90 120-120 200-60 50 38 110 30 150-40" stroke-width="58"/>
    <circle cx="170" cy="70" r="26" fill="currentColor" stroke="none"/>
    <path d="M520 60v170h170" stroke-width="58"/>
    <path d="M800 230c0-90 40-160 120-160s120 70 120 160" stroke-width="58"/>
    <circle cx="920" cy="270" r="22" fill="currentColor" stroke="none"/>
    <path d="M1120 150c0-60 40-95 95-95s95 35 95 95-40 95-95 95-95-35-95-95Z" stroke-width="58"/>
  </svg>
</div>
<div class="mr-talk" aria-hidden="true"><div class="mr-talk__row">${talk}</div><div class="mr-talk__row is-back">${talk}</div></div>
<div class="mr-footer__grid">
  <div class="mr-footer__loc"><ul><li><h3>City One</h3><span>Your nation here</span></li><li><h3>City Two</h3><span>Your nation here</span></li></ul></div>
  <div class="mr-footer__contact"><h3>One line inviting you to join us here?</h3><div class="mr-footer__cta"><a class="mr-btn" href="#contact"><span>Get Materials</span><i class="mr-arrow is-down">${ARROW}</i></a><a class="mr-btn" href="#contact"><span>Send email</span><i class="mr-arrow">${GO}</i></a><a class="mr-cta" href="#contact"><span class="mr-cta__label">Schedule a consultation</span><span class="mr-cta__bg"></span></a></div></div>
  <div class="mr-footer__social"><details class="mr-acc"><summary>Channel one<i></i></summary><p>Your channel intro line here</p></details><details class="mr-acc"><summary>Channel two<i></i></summary><p>Your channel intro line here</p></details></div>
</div>
<div class="mr-footer__credits"><span>© 2026 Your company name here</span><span><a href="#">Legal notice</a><a href="#">Your email address here</a></span><span><a href="#top" data-top>Back to top ↑</a></span></div>`;
    foot.insertAdjacentHTML("afterend", `
<a class="mr-next" href="${nh}" data-slot="next-page">
  <svg class="mr-next__wave" viewBox="0 0 1440 160" preserveAspectRatio="none" aria-hidden="true"><path d="M0 160V110Q360 110 720 110T1440 110V160Z"/></svg>
  <span class="mr-next__zone"><span class="mr-next__text"><span class="mr-next__label">Next page</span><h3>${nt}</h3></span><span class="mr-next__cta"><em>Press to jump right ahead</em><span class="mr-eye" aria-hidden="true"><span class="mr-eye__white"></span><span class="mr-eye__track"><span class="mr-eye__iris"></span></span></span></span><span class="mr-next__border"></span></span>
</a>`);
  }

  // ── Lenis ──
  if (window.Lenis && !reduce && !body.hasAttribute("data-no-scroll")) {
    const lenis = new Lenis({ lerp: 0.1 });
    MR.lenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelector("[data-top]")?.addEventListener("click", (e) => { e.preventDefault(); MR.lenis ? MR.lenis.scrollTo(0) : scrollTo(0, 0); });

  // ── Mouse position: cursor text, pupils and next-page text all look together. Follow speed is in ms, regardless of screen speed ──
  // The original closes in by .15 per frame, but being a heavy 3D board it actually follows at about .0096 per ms (a bit over .4s from far away)
  const FOLLOW = 0.0096;
  MR.follow = (dt) => (reduce ? 1 : 1 - Math.exp(-FOLLOW * Math.min(dt, 64)));
  const mouse = (MR.mouse = { x: 0, y: 0, on: false });
  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; }, { passive: true });
  const loop = (fn) => { let last = 0; const step = (now) => { if (fn(now - (last || now)) !== false) requestAnimationFrame(step); last = now; }; requestAnimationFrame(step); };
  const clamp = (v, a) => Math.max(-a, Math.min(a, v));
  // Stops exactly when nearly there. The cursor text trails a long tail 1px below like the original, and the next page’s text sticks into place within .7s once the pointer leaves
  const near = (v, to, k, snap) => (Math.abs(to - v) < snap ? to : v + (to - v) * k);
  const painted = new WeakMap();
  const paint = (el, css) => { if (painted.get(el) !== css) { painted.set(el, css); el.style.transform = css; } };

  // ── Cursor light over grid·list: the original approaches the cursor spot in a cell by .05 per frame, sticks to 8px cells, and at first flies in from -400px top left.
  //    If rows is given, the mask spots are measured so light falls only on the 1px top line of each row (plus the bottom line of the last row), like the original ──
  MR.glow = (host, glow, rows) => {
    if (!host || !glow || !matchMedia("(hover: hover)").matches) return;
    const k = reduce ? 1 : 0.05;
    let ax = -9999, ay = -9999, x = -400, y = -400, sx = NaN, sy = NaN, running = false;
    const tick = () => {
      const r = glow.getBoundingClientRect(), tx = ax - r.left, ty = ay - r.top;
      x += (tx - x) * k; y += (ty - y) * k;
      const gx = Math.round(x / 8) * 8, gy = Math.round(y / 8) * 8;
      if (gx !== sx || gy !== sy) { host.style.setProperty("--mx", `${gx}px`); host.style.setProperty("--my", `${gy}px`); sx = gx; sy = gy; }
      return Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5;
    };
    const step = () => { running = tick(); if (running) requestAnimationFrame(step); };
    host.addEventListener("pointermove", (e) => { ax = e.clientX; ay = e.clientY; if (!running) { running = true; requestAnimationFrame(step); } }, { passive: true });
    host.addEventListener("pointerenter", () => host.style.setProperty("--glow-on", "1"));
    host.addEventListener("pointerleave", () => host.style.setProperty("--glow-on", "0"));
    if (!rows) return;
    const lines = () => {
      const items = [...host.querySelectorAll(rows)].filter((el) => el.offsetParent);
      if (!items.length) return;
      const top = glow.getBoundingClientRect().top, ys = items.map((el) => el.getBoundingClientRect().top - top);
      const end = items[items.length - 1].getBoundingClientRect();
      ys.push(end.bottom - top - 1);
      host.style.setProperty("--rows-mask", ys.map(() => "linear-gradient(var(--kf-ink),var(--kf-ink))").join(","));
      host.style.setProperty("--rows-pos", ys.map((v) => `0 ${Math.round(v)}px`).join(","));
    };
    new ResizeObserver(lines).observe(host);
    new MutationObserver(lines).observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
    requestAnimationFrame(lines);
  };

  // ── Cursor text: a hint that exists only until sound is turned on. It stands at the first move position right away, then follows lazily, and hides over links ──
  const cursor = document.querySelector(".mr-cursor");
  const quiet = () => {
    if (!cursor || cursor.classList.contains("is-off")) return;
    cursor.classList.add("is-off");
    setTimeout(() => cursor.remove(), 450);
  };
  if (cursor && matchMedia("(hover: hover)").matches) {
    let cx = 0, cy = 0, shown = false, overLink = false;
    const place = () => paint(cursor, `translate3d(${cx}px, ${cy}px, 0)`);
    const sync = () => cursor.classList.toggle("is-hidden", !shown || overLink);
    document.addEventListener("pointerover", (e) => { const a = e.target.closest?.("a"); overLink = !!a && !a.classList.contains("cursor-target"); sync(); });
    addEventListener("mousemove", (e) => { if (shown) return; shown = true; cx = e.clientX; cy = e.clientY; place(); sync(); });
    loop((dt) => {
      if (!cursor.isConnected) return false;
      if (shown) { const k = MR.follow(dt); cx = near(cx, mouse.x, k, 0.02); cy = near(cy, mouse.y, k, 0.02); place(); }
    });
  }

  // ── Sound button: when on, the line waves (amplitude 20, .6s), when off, a straight line. First press anywhere on the page turns it on ──
  const sound = document.querySelector(".mr-sound");
  if (sound) {
    const path = sound.querySelector("path");
    const amp = { v: 0 };
    let t0 = 0, on = false;
    const draw = (now) => {
      t0 = now || 0;
      if (amp.v < 0.01) path.setAttribute("d", "M 0 15 H 30");
      else {
        let d = "M 0 15";
        for (let x = 0; x <= 30; x += 1.5) d += ` L ${x} ${15 + Math.sin(x * 0.42 + t0 * 0.008) * amp.v * 0.35 * Math.sin((x / 30) * Math.PI)}`;
        path.setAttribute("d", d);
      }
      requestAnimationFrame(draw);
    };
    if (!reduce) requestAnimationFrame(draw);
    const set = (v) => {
      on = v;
      sound.setAttribute("aria-pressed", v ? "true" : "false");
      if (window.gsap) gsap.to(amp, { v: v ? 20 : 0, duration: 0.6, ease: "power2.out" });
      if (v) quiet();
    };
    sound.addEventListener("click", () => set(!on));
    document.addEventListener("click", () => { if (!on) set(true); }, { once: true });
  } else document.addEventListener("click", quiet, { once: true });

  // ── Blinking eyes: pupils tilt toward the mouse (±10 horizontal · ±1px vertical), and close and reopen in .09s every 2~6s ──
  document.querySelectorAll(".mr-eye").forEach((eye) => {
    const track = eye.querySelector(".mr-eye__track"), iris = eye.querySelector(".mr-eye__iris"), white = eye.querySelector(".mr-eye__white");
    let box = track.getBoundingClientRect(), seen = false, ix = 0, iy = 0;
    const measure = () => (box = track.getBoundingClientRect());
    new IntersectionObserver(([e]) => (seen = e.isIntersecting)).observe(track);
    addEventListener("resize", measure, { passive: true });
    addEventListener("scroll", () => seen && measure(), { passive: true });
    loop((dt) => {
      const tx = clamp(mouse.x - box.left - box.width / 2, box.width / 2 - 4), ty = clamp(mouse.y - box.top - box.height / 2, box.height / 2 - 4);
      const k = MR.follow(dt);
      ix = near(ix, tx, k, 0.05); iy = near(iy, ty, k, 0.05);
      paint(iris, `translate(calc(-50% + ${ix}px), calc(-50% + ${iy}px))`);
    });
    if (reduce || !window.gsap) return;
    const wait = () => setTimeout(blink, 2000 + Math.random() * 4000);
    const blink = () => gsap.timeline({ onComplete: wait }).to(white, { scaleY: 0.05, duration: 0.09, ease: "power1.in" }).to(white, { scaleY: 1, duration: 0.09, ease: "power1.out" });
    wait();
  });

  // ── Next-page text: follows the mouse while the hand is over the panel, returns to its place when it leaves ──
  const nextZone = document.querySelector(".mr-next");
  const nextText = nextZone?.querySelector(".mr-next__cta em");
  if (nextText && matchMedia("(hover: hover)").matches) {
    let inside = false, hx = 0, hy = 0, jx = 0, jy = 0;
    const measure = () => { const r = nextText.getBoundingClientRect(); hx = r.left + r.width / 2 - jx; hy = r.top + r.height / 2 - jy; };
    nextZone.addEventListener("mouseenter", () => { inside = true; measure(); });
    nextZone.addEventListener("mouseleave", () => { inside = false; });
    addEventListener("scroll", () => inside && measure(), { passive: true });
    loop((dt) => {
      const gx = inside ? mouse.x - hx : 0, gy = inside ? mouse.y - hy : 0, k = MR.follow(dt);
      jx = near(jx, gx, k, 3); jy = near(jy, gy, k, 3);
      paint(nextText, `translate(${jx}px, ${jy}px)`);
    });
  }

  // ── White liquid: top edge ripples with time and scroll speed ──
  const wave = document.querySelector(".mr-next__wave path");
  if (wave && !reduce) {
    let vel = 0, last = scrollY;
    const tick = (t) => {
      const d = scrollY - last;
      last = scrollY;
      vel += (Math.min(Math.abs(d), 60) - vel) * 0.08;
      const a = 9 + vel * 0.6, s = t * 0.0012;
      let p = "M0 160V110";
      for (let x = 0; x <= 1440; x += 60) p += ` L${x} ${110 + Math.sin(x * 0.006 + s) * a * 0.6 + Math.sin(x * 0.013 - s * 1.7) * a * 0.4}`;
      wave.setAttribute("d", p + " V160Z");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ── Transition: pressing an inner link blurs the body over .3s then navigates, and the new page rises from 20px below over .3s ──
  const main = document.querySelector(".mr-page");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) return;
    e.preventDefault();
    if (reduce || !main) { location.href = href; return; }
    main.classList.add("is-leaving");
    try { sessionStorage.setItem("mrInnerNav", "1"); } catch (err) { /* Even if storage is blocked, paging still runs */ }
    // The 3D stage also clears in the same .3s (in the original the stage ripples with .3s sine.out and switches to the next scene)
    const stage = document.querySelector(".mr-stage");
    if (stage && window.gsap) gsap.to(stage, { opacity: 0, duration: 0.3, ease: "sine.out" });
    document.dispatchEvent(new CustomEvent("mr:leave"));
    setTimeout(() => (location.href = href), 300);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  // ── Loading gauge: fills to .15 in 1.5s, once everything is received it fills to the end in .55s and the panel vanishes in .3s ──
  const done = () => {
    if (MR.loaded) return;
    MR.loaded = true;
    document.querySelector(".mr-loading")?.classList.add("is-ended");
    if (main && !reduce && window.gsap) gsap.fromTo(main, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: "power1.out", clearProps: "transform" });
    MR.readies.forEach((fn) => fn());
  };
  // The original is a single-page app, so moving through an inner link doesn’t replay the loading panel or first entrance — if arrived via an inner transition, skip the loading panel
  let inner = false;
  try { inner = sessionStorage.getItem("mrInnerNav") === "1"; sessionStorage.removeItem("mrInnerNav"); } catch (err) { inner = false; }
  MR.inner = inner;
  if (inner) document.querySelector(".mr-loading")?.classList.add("is-ended", "is-skip");
  const tick = document.querySelector(".mr-gauge__tick");
  MR.progress = (p) => {
    if (!tick || !window.gsap || reduce || MR.inner) { if (p >= 1) done(); return; }
    const now = gsap.getProperty(tick, "scaleX") || 0, v = Math.min(p, 1);
    if (v <= now) return;
    gsap.to(tick, { scaleX: v, transformOrigin: "left", duration: 0.55, ease: "power2.out", overwrite: true, onComplete: () => { if (v >= 1) done(); } });
  };
  document.addEventListener("DOMContentLoaded", () => {
    if (window.gsap) gsap.registerPlugin(...[window.ScrollTrigger].filter(Boolean));
    if (tick && window.gsap && !reduce) gsap.fromTo(tick, { scaleX: 0, transformOrigin: "left" }, { scaleX: 0.15, duration: 1.5, ease: "power1.out" });
    if (main) main.style.opacity = reduce ? "" : "0";
  });
  addEventListener("load", () => { if (!body.hasAttribute("data-gl-loader")) MR.progress(1); });
})();
