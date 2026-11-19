// Motion spanning several pages — smooth scroll, header state, menu panel, line rising, magnet button, ”View” cursor, flowing logo band, footer parallax, flying chrome W
{
// Gradient stroke — shows the s..e segment with six stops and softens the end feathers (ls·le) (calculation from original line 9169). Highlighter and page turn use it together
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const paintStops = (stops, s, e, ls, le) => {
  const span = Math.max(0, e - s), u = ls + le > 0.9 * span && ls + le > 0 ? (0.9 * span) / (ls + le) : 1;
  const c = clamp01(s), l = clamp01(s + ls * u), r = clamp01(e), d = span > 5e-4 ? 1 : 0;
  [[0, 0], [c, 0], [l, d], [Math.max(l, clamp01(e - le * u)), d], [r, 0], [1, 0]].forEach(([o, op], j) => { stops[j].setAttribute("offset", String(o)); stops[j].setAttribute("stop-opacity", String(op)); });
};
let gradSeq = 0;
const gradStroke = (svg, defs, [x0, y0], [x1, y1], width) => {
  const NS = "http://www.w3.org/2000/svg", grad = document.createElementNS(NS, "linearGradient"), path = document.createElementNS(NS, "path");
  grad.id = `site-stroke-${gradSeq++}`; grad.setAttribute("gradientUnits", "userSpaceOnUse");
  Object.entries({ x1: x0, y1: y0, x2: x1, y2: y1 }).forEach(([n, v]) => grad.setAttribute(n, String(v)));
  const stops = Array.from({ length: 6 }, () => { const s = document.createElementNS(NS, "stop"); s.setAttribute("stop-color", "currentColor"); grad.append(s); return s; });
  defs.append(grad);
  path.setAttribute("d", `M${x0} ${y0} L${x1} ${y1}`); path.setAttribute("fill", "none"); path.setAttribute("stroke-linecap", "butt"); path.setAttribute("stroke", `url(#${grad.id})`); path.style.strokeWidth = `${width}px`;
  svg.append(path);
  return { path, grad, stops };
};
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (reduce) root.classList.add("no-motion");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger, ...(window.SplitText ? [SplitText] : []), ...(window.Flip ? [Flip] : []));

  /* Smooth scroll — original Lenis 1.3.26 */
  if (!reduce && window.Lenis && hasGsap) {
    const lenis = new Lenis({ autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  /* Header bar — is-scrolled after scrolling 40px, is-past-hero after passing .9 of the hero */
  const header = document.querySelector("[data-header]");
  if (header && hasGsap) ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { header.classList.toggle("is-scrolled", s.scroll() > 40); header.classList.toggle("is-past-hero", s.scroll() > 0.9 * innerHeight); } });

  /* Menu panel — four chalk-colored highlighter strokes cover the screen (.42s power4.out, .07 apart), and the menu lines enter from 32% right of the screen at 1.7x horizontal stretch and 12px blur
     .55s expo.out (.05 stagger, from .3s) they stand. On close they slide out to the left 25% in .18s power2.in (.02 stagger) and the strokes retract */
  const menu = document.querySelector("[data-menu]"), menuBtn = document.querySelector("[data-menu-button]");
  if (menu && menuBtn) {
    const bands = [...menu.querySelectorAll(".menu__band")], items = [...menu.querySelectorAll(".menu__item")], foot = menu.querySelector(".menu__foot");
    const IN = { x: 0, scaleX: 1 }, OUT = { scaleX: 1.7, filter: "blur(12px) brightness(1.25)" };
    let open = false, tl = null;
    if (hasGsap) gsap.set(items, { transformOrigin: (i, el) => `${parseFloat(getComputedStyle(el).paddingLeft) || 0}px 60%` });
    const toggle = (want) => {
      if (want === open) return;
      open = want;
      menuBtn.setAttribute("aria-expanded", String(open));
      tl?.kill();
      if (open) { root.classList.add("is-menu"); window.lenis?.stop(); }
      if (reduce || !hasGsap) { if (open) bands.forEach((bd) => { bd.style.clipPath = "inset(0 0 0 0)"; }); else { root.classList.remove("is-menu"); window.lenis?.start(); } return; }
      tl = gsap.timeline();
      // The original clears the button’s highlighter .34s after the menu opens or closes (3D logo disappearance is CSS)
      gsap.delayedCall(0.34, () => mark(menuBtn, false));
      if (open) {
        tl.set(items, { ...OUT, x: () => 0.32 * innerWidth })
          .fromTo(bands, { clipPath: (i) => (i % 2 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)") }, { clipPath: "inset(0 0% 0 0%)", duration: 0.42, ease: "power4.out", stagger: 0.07 }, 0)
          .to(items, { ...IN, duration: 0.55, ease: "expo.out", stagger: 0.05 }, 0.3)
          // Length of the blur clearing — in the original’s measurements the first page took 417ms and subpages 300ms, so they differ
          .to(items, { filter: "blur(0px) brightness(1)", duration: document.querySelector("[data-hero]") ? 0.74 : 0.55, ease: "expo.out", stagger: 0.05, clearProps: "filter" }, 0.3)
          .fromTo(foot, { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" }, 0.45);
      } else {
        tl.to(items, { ...OUT, x: () => -0.25 * innerWidth, duration: 0.18, ease: "power2.in", stagger: 0.02 }, 0)
          .to(foot, { x: 40, autoAlpha: 0, duration: 0.18, ease: "power2.in" }, 0)
          .to(bands, { clipPath: (i) => (i % 2 ? "inset(0 100% 0 0%)" : "inset(0 0% 0 100%)"), duration: 0.32, ease: "power4.out", stagger: 0.05 }, 0.12)
          .call(() => { root.classList.remove("is-menu"); window.lenis?.start(); });
      }
    };
    menuBtn.addEventListener("click", () => toggle(!open));
    addEventListener("keydown", (e) => { if (e.key === "Escape") toggle(false); });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggle(false)));
  }

  /* Line rise — section titles rise line by line inside a mask from 105% below at 1s expo.out with .08 stagger (at 85% of the screen), body text rises from 14px below in .7s */
  const reveal = () => {
    document.querySelectorAll('[data-reveal="lines"]').forEach((el) => {
      if (reduce || !hasGsap || !window.SplitText) { el.classList.add("is-split"); return; }
      const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "split-line", aria: "none" });
      el.classList.add("is-split");
      gsap.from(split.lines, { yPercent: 105, duration: 1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    if (!hasGsap || reduce) return;
    document.querySelectorAll('[data-reveal="fade"]').forEach((el) => gsap.from(el, { opacity: 0, y: 14, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } }));
    document.querySelectorAll('[data-reveal="stagger"]').forEach((el) => gsap.from(el.children, { opacity: 0, scale: 0.6, y: 18, duration: 0.7, ease: "back.out(1.7)", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 88%", once: true } }));
  };
  (document.fonts?.ready || Promise.resolve()).then(reveal);

  /* Button pull · press — pulled toward the hand by distance × strength (default .2) with .6s elastic, pressed to .95 on press and bounces back on release */
  if (fine && hasGsap && !reduce) {
    const PULL = "[data-magnetic], .button, .header__menu, .header__cta", pulls = new WeakMap();
    const pullOf = (el) => {
      let p = pulls.get(el);
      if (!p) {
        const k = parseFloat(el.dataset.magnetic);
        p = { x: gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" }), y: gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" }), k: Number.isNaN(k) ? 0.2 : k };
        pulls.set(el, p);
      }
      return p;
    };
    document.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const el = e.target.closest?.(PULL);
      if (!el) return;
      const p = pullOf(el), r = el.getBoundingClientRect();
      p.x((e.clientX - (r.left + r.width / 2 - gsap.getProperty(el, "x"))) * p.k);
      p.y((e.clientY - (r.top + r.height / 2 - gsap.getProperty(el, "y"))) * p.k);
    }, { passive: true });
    document.addEventListener("pointerout", (e) => { const el = e.target.closest?.(PULL); if (el && !el.contains(e.relatedTarget)) { const p = pulls.get(el); p?.x(0); p?.y(0); } });
    let pressed = null;
    const release = () => { if (pressed) { gsap.to(pressed, { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.5)", overwrite: "auto" }); pressed = null; } };
    document.addEventListener("pointerdown", (e) => { if (e.button !== 0) return; const el = e.target.closest?.(PULL); if (el) { pressed = el; gsap.to(el, { scale: 0.95, duration: 0.12, ease: "power2.out", overwrite: "auto" }); } });
    document.addEventListener("pointerup", release);
    document.addEventListener("pointercancel", release);
    document.addEventListener("pointerout", (e) => { if (pressed && pressed.contains(e.target) && !pressed.contains(e.relatedTarget)) release(); });
  }

  /* Marker — hovering a button or link draws two strokes (.16s power4.out, the second .3× later) and the text there flips. On release it clears from the start point in .136s */
  const MK = ".button, .header__menu, .header__cta, .textlink, .footer__link, .footer__legal a, .consent__more, .menu__foot a, .row__go, .post-hero__back";
  const marks = new WeakMap();
  const mkBuild = (el) => {
    let m = marks.get(el);
    if (!m) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"), label = document.createElement("span");
      svg.setAttribute("class", "mk__strokes"); svg.setAttribute("aria-hidden", "true");
      label.className = "mk__label"; label.setAttribute("aria-hidden", "true");
      el.classList.add("mk-host");
      el.prepend(svg); el.append(label);
      m = { el, svg, label, st: { s1: 0, e1: 0, s2: 0, e2: 0 }, was: { s1: 0, e1: 0, s2: 0, e2: 0 }, tl: null, on: false, key: "", lines: [] };
      marks.set(el, m);
    }
    m.label.replaceChildren(...[...el.childNodes].filter((n) => n !== m.svg && n !== m.label).map((n) => n.cloneNode(true)));
    const w = el.offsetWidth, h = el.offsetHeight, key = `${w}x${h}`;
    if (m.key === key) return m;
    m.key = key; m.u = w;
    const half = h / 2, tilt = Math.min(0.05 * h, 3), k = Math.min(1, Math.max(0.45, h / 48));
    m.ends = [[7 * k, 11 * k], [12 * k, 5 * k]];
    m.svg.setAttribute("viewBox", `-18 -18 ${w + 36} ${h + 36}`);
    m.svg.replaceChildren();
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    m.svg.append(defs);
    // The top stroke goes left→right, the bottom stroke right→left — they extend outside the element by (7,11)·(12,5)×k
    m.lines = m.ends.map(([out, over], i) => {
      const y = half * (i + 0.5), a = [-out, y + tilt], b = [w + over, y - tilt];
      return gradStroke(m.svg, defs, i % 2 ? [w + over, y - tilt] : a, i % 2 ? [-out, y + tilt] : b, 1.42 * half);
    });
    return m;
  };
  const mkPaint = (m, still) => {
    const { st, was, u } = m;
    const f = {}; for (const key in st) f[key] = still ? 0 : Math.min(0.3, Math.abs(st[key] - was[key]) * 2.2);
    Object.assign(was, st);
    if (m.lines.length === 2) { paintStops(m.lines[0].stops, st.s1, st.e1, f.s1, f.e1); paintStops(m.lines[1].stops, st.s2, st.e2, f.s2, f.e2); }
    const [[l1, r1], [l2, r2]] = m.ends, W = Math.max(1, u), pc = (x) => (Math.min(W, Math.max(0, x)) / W * 100).toFixed(2) + "%";
    const E = (v) => pc(v * (W + l1 + r1) - l1), A = (v) => pc(W + r2 - v * (W + r2 + l2));
    const S = E(st.s1 + f.s1 / 2), K = E(st.e1 - f.e1 / 2), Q = A(st.e2 - f.e2 / 2), R = A(st.s2 + f.s2 / 2);
    m.label.style.clipPath = `polygon(${S} -40%, ${K} -40%, ${K} 55%, ${R} 55%, ${R} 140%, ${Q} 140%, ${Q} 55%, ${S} 55%)`;
  };
  const mark = (el, on) => {
    if (!hasGsap) return;
    if (on && marks.get(el)?.on) return;
    const m = on ? mkBuild(el) : marks.get(el);
    if (!m) return;
    const d = reduce ? 0 : 0.16;
    m.tl?.kill();
    m.on = on;
    if (on) {
      Object.assign(m.st, { s1: 0, e1: 0, s2: 0, e2: 0 });
      Object.assign(m.was, m.st);
      mkPaint(m, true);
      // Start half a frame early — the original is already out by .21~.26 on the first frame (7~10ms)
      m.tl = gsap.timeline({ onUpdate: () => mkPaint(m), onComplete: () => mkPaint(m, true) }).to(m.st, { e1: 1, duration: d, ease: "power4.out" }, 0).to(m.st, { e2: 1, duration: d, ease: "power4.out" }, 0.3 * d);
      if (d) m.tl.startTime(m.tl.startTime() - 1 / 120);
    } else {
      const k = 0.85 * d;
      m.tl = gsap.timeline({ onUpdate: () => mkPaint(m), onComplete: () => mkPaint(m, true) }).to(m.st, { s1: 1, e1: 1, duration: k, ease: "power4.out" }, 0).to(m.st, { s2: 1, e2: 1, duration: k, ease: "power4.out" }, 0.4 * k);
      if (k) m.tl.startTime(m.tl.startTime() - 1 / 120);
    }
  };
  // Where the whole panel takes the interaction (data-marker-trigger — featured post card), the marker is attached to the link inside it
  const hostOf = (t) => { const h = t?.closest?.("[data-marker-trigger]") || t?.closest?.(MK); return h ? { h, list: h.matches(MK) ? [h] : [...h.querySelectorAll(MK)] } : null; };
  if (fine) {
    document.addEventListener("pointerover", (e) => { if (e.pointerType === "touch") return; const o = hostOf(e.target); if (o && !o.h.contains(e.relatedTarget)) o.list.forEach((el) => mark(el, true)); });
    document.addEventListener("pointerout", (e) => { if (e.pointerType === "touch") return; const o = hostOf(e.target); if (o && !o.h.contains(e.relatedTarget) && o.h.isConnected && o.h.offsetParent !== null) o.list.forEach((el) => mark(el, false)); });
    // Don’t redraw on focus caused by a press — keyboard focus only
    document.addEventListener("focusin", (e) => { const o = hostOf(e.target); if (o && e.target.matches(":focus-visible")) o.list.forEach((el) => mark(el, true)); });
    document.addEventListener("focusout", (e) => { const o = hostOf(e.target); if (o && o.h.offsetParent !== null) o.list.forEach((el) => mark(el, false)); });
  }

  /* Cursor label — each frame it follows the pointer by 28% of the remaining distance, and over data-cursor the label turns on as a marker */
  const cursorTargets = document.querySelectorAll("[data-cursor]");
  if (fine && hasGsap && !reduce) {
    const c = document.createElement("div");
    c.className = "cursor";
    c.setAttribute("aria-hidden", "true");
    c.innerHTML = '<div class="cursor__label"><span></span></div>';
    document.body.appendChild(c);
    const lab = c.firstChild, txt = lab.firstChild;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, seen = false;
    const step = () => { x += 0.28 * (tx - x); y += 0.28 * (ty - y); c.style.transform = `translate3d(${x}px, ${y}px, 0)`; raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.1 ? requestAnimationFrame(step) : 0; };
    const move = (e) => { if (e.pointerType !== "mouse") return; tx = e.clientX; ty = e.clientY; if (!seen) { seen = true; x = tx; y = ty; } if (!raf) raf = requestAnimationFrame(step); };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { c.classList.remove("is-on"); seen = false; });
    cursorTargets.forEach((t) => {
      t.addEventListener("pointerenter", () => { txt.textContent = t.dataset.cursor; c.classList.add("is-on"); mark(lab, true); });
      t.addEventListener("pointerleave", () => { c.classList.remove("is-on"); mark(lab, false); });
    });
  }

  /* Footer region — panel height goes from 0 to the list height in .45s power3.inOut, and when closing it starts after .1s and takes .36s. Only one opens at a time. The open state of details is used as is, so keyboard and reading behavior stay default */
  if (hasGsap && !reduce) {
    let closeOpen = null;
    document.querySelectorAll(".footer__state").forEach((d) => {
      const sum = d.querySelector("summary"), panel = d.querySelector(".footer__state-panel"), list = panel?.firstElementChild, plus = sum.querySelector("i");
      if (!panel || !list) return;
      plus?.classList.toggle("is-open", d.open);
      let busy = false;
      const close = () => {
        if (closeOpen === close) closeOpen = null;
        plus?.classList.remove("is-open");
        busy = true;
        gsap.fromTo(panel, { height: panel.offsetHeight, overflow: "hidden" }, { height: 0, duration: 0.45 * 0.8, delay: 0.1, ease: "power3.inOut", overwrite: true, onComplete: () => { d.open = false; gsap.set(panel, { clearProps: "height,overflow" }); busy = false; } });
      };
      sum.addEventListener("click", (e) => {
        e.preventDefault();
        if (busy) return;
        if (d.open) return close();
        if (closeOpen && closeOpen !== close) closeOpen();
        closeOpen = close;
        d.open = true;
        plus?.classList.add("is-open");
        busy = true;
        gsap.fromTo(panel, { height: 0, overflow: "hidden" }, { height: () => list.offsetHeight, duration: 0.45, ease: "power3.inOut", overwrite: true, onComplete: () => { gsap.set(panel, { clearProps: "height,overflow" }); busy = false; } });
      });
    });
  }

  /* Flowing logo strip — one loop per data-marquee seconds, faster by |speed|/300 (max 5) when scrolling fast */
  if (hasGsap && !reduce) document.querySelectorAll("[data-marquee]").forEach((track) => {
    const secs = parseFloat(track.dataset.marquee) || 40;
    const tw = gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: secs, ease: "none", repeat: -1 });
    ScrollTrigger.create({ trigger: track, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? tw.play() : tw.pause()), onUpdate: (s) => { const v = Math.min(Math.abs(s.getVelocity()) / 300, 5); gsap.to(tw, { timeScale: 1 + v, duration: 0.2, overwrite: true }); gsap.to(tw, { timeScale: 1, duration: 0.8, delay: 0.2 }); } });
  });

  /* Photo break (original imageBreak) — the photo stays fixed to the screen and only the window passes by, the window is shaped from four overlapping brush strokes. 
     Height a=H/1.069, center of stroke i at (.17+.243i)a · thickness .34a · slant .05a, overshoot at both ends [s,d]. At width 768+, odd strokes stop s/2·d/2 inside from both ends so the edges look jagged.
     The original uses an SVG mask (Safari uses the same four rectangles via clip-path). The strokes are fully drawn and stay still, so one clip-path produces the same shape */
  const IB_ENDS = [[0.05, 0.09], [0.08, 0.04], [0.04, 0.07], [0.07, 0.05]];
  const shutterPath = (W, H) => {
    const a = H / 1.069, half = 0.17 * a, k = 0.05 * a, f = (v) => v.toFixed(1);
    return IB_ENDS.map(([s, d], i) => {
      const y = (0.17 + 0.243 * i) * a, full = i % 2 === 0 || W < 768;
      const p = full ? -W * s : W * s * 0.5, v = full ? W * (1 + d) : W * (1 - 0.5 * d);
      const [x0, x1] = i % 2 === 0 ? [v, p] : [p, v], y0 = y - k / 2, y1 = y + k / 2;
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = (-dy / len) * half, ny = (dx / len) * half;
      return `M${f(x0 + nx)} ${f(y0 + ny)}L${f(x1 + nx)} ${f(y1 + ny)}L${f(x1 - nx)} ${f(y1 - ny)}L${f(x0 - nx)} ${f(y0 - ny)}Z`;
    }).join("");
  };
  document.querySelectorAll("[data-ib-shutter]").forEach((el) => {
    const media = el.querySelector("[data-ib-media]");
    if (!media) return;
    const focus = el.dataset.ibFocus || "50% 50%", [fx, fy = fx] = focus.split(/\s+/);
    el.style.setProperty("--ib-focus", focus); el.style.setProperty("--ib-x", fx); el.style.setProperty("--ib-y", fy);
    const fit = () => { media.style.clipPath = `path('${shutterPath(el.clientWidth, el.clientHeight)}')`; };
    fit();
    new ResizeObserver(fit).observe(el);
  });

  /* Footer — the inner part is revealed coming down from 25% above (tied to scroll) */
  const fWrap = document.querySelector("[data-footer-parallax]");
  if (fWrap && hasGsap && !reduce) gsap.from(fWrap.querySelector("[data-footer-parallax-inner]"), { yPercent: -25, ease: "none", scrollTrigger: { trigger: fWrap, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true } });

  /* Flying chrome W — flies to the slot marker (data-logo-anchor) placed in each section and settles at that box’s size */
  const anchors = [...document.querySelectorAll("[data-logo-anchor]")], dock = document.querySelector(".header__brand svg");
  const T = window.THREE;
  if ((anchors.length || dock) && T && !reduce) {
    const canvas = document.createElement("canvas");
    root.classList.add("is-logo-on");
    canvas.className = "logo3d";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { renderer = null; }
    if (renderer) {
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.toneMapping = T.ACESFilmicToneMapping;
      const scene = new T.Scene();
      const cam = new T.OrthographicCamera(-1, 1, 1, -1, -2000, 2000);
      // The room the chrome reflects — bakes three light panels and one green panel with PMREM (instead of a photo environment map)
      const probe = document.createElement("i");
      document.body.appendChild(probe);
      // Even if the computed color arrives in oklch or color() form, paint it onto one canvas pixel and read it back as sRGB
      const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const colorOf = (v) => { probe.style.color = `var(${v})`; px.clearRect(0, 0, 1, 1); px.fillStyle = getComputedStyle(probe).color; px.fillRect(0, 0, 1, 1); const d = px.getImageData(0, 0, 1, 1).data; return new T.Color().setRGB(d[0] / 255, d[1] / 255, d[2] / 255, T.SRGBColorSpace); };
      const room = new T.Scene();
      room.background = colorOf("--site-night");
      const panel = (w, h, col, x, y, z, ry) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: col, side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; room.add(m); };
      panel(6, 3, colorOf("--site-white"), 0, 3, -4, 0);
      panel(4, 6, colorOf("--site-chalk"), -5, 0, 0, Math.PI / 2);
      panel(3, 3, colorOf("--site-green-bright"), 5, -1, 1, -Math.PI / 2);
      panel(8, 1, colorOf("--site-white"), 0, -4, 2, 0);
      probe.remove();
      const pmrem = new T.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(room, 0.04).texture;
      const chrome = new T.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.18 }); // Not skin: Chrome default reflection (color comes from the environment)
      // W lightning shape — inside a circle of diameter 1. A ring plus a forward-leaning W, carved out with rounded corners
      const logo = new T.Group();
      const ring = new T.Mesh(new T.TorusGeometry(0.46, 0.035, 24, 96), chrome);
      const w = new T.Shape();
      [[-0.36, 0.3], [-0.24, 0.3], [-0.15, -0.06], [-0.04, 0.22], [0.05, 0.22], [0.13, -0.05], [0.3, 0.42], [0.42, 0.42], [0.16, -0.34], [0.07, -0.34], [0.0, -0.1], [-0.08, -0.34], [-0.17, -0.34]].forEach(([x, y], i) => (i ? w.lineTo(x, y) : w.moveTo(x, y)));
      w.closePath();
      const wMesh = new T.Mesh(new T.ExtrudeGeometry(w, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 4 }), chrome);
      wMesh.position.z = -0.04;
      logo.add(ring, wMesh);
      scene.add(logo);
      renderer.compile(scene, cam);
      const size = () => { const W = innerWidth, H = innerHeight; renderer.setSize(W, H, false); cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2; cam.updateProjectionMatrix(); };
      size();
      addEventListener("resize", size);
      const cur = { x: innerWidth * 0.2, y: 0, s: 0, ry: 0, rz: 0 }, mouse = { x: 0, y: 0 };
      addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });
      let t0 = performance.now(), prev = t0;
      const frame = (now) => {
        const dt = Math.min(64, Math.max(1, now - prev)) / 16.67;
        prev = now;
        const H = innerHeight, mid = H / 2;
        let best = null, bestD = Infinity;
        anchors.forEach((a) => {
          const r = a.getBoundingClientRect();
          if (!r.width || r.bottom < -H * 0.25 || r.top > H * 1.25) return;
          const d = Math.abs(r.top + r.height / 2 - mid);
          if (d < bestD) { bestD = d; best = { a, r }; }
        });
        const k = 1 - Math.pow(1 - 0.09, dt);
        // If no nearby section marker exists, it sits in the header row marker spot (original logo3d.is-docked)
        if (!best && dock) { const r = dock.getBoundingClientRect(); if (r.width) best = { a: dock, r }; }
        const docked = !!best && best.a === dock;
        if (docked !== root.classList.contains("is-logo-docked")) root.classList.toggle("is-logo-docked", docked);
        if (best) {
          const { a, r } = best, scale = r.width * (parseFloat(a.dataset?.logoScale) || 1);
          cur.x += (r.left + r.width / 2 - innerWidth / 2 - cur.x) * k;
          cur.y += (mid - (r.top + r.height / 2) - cur.y) * k;
          cur.s += (scale - cur.s) * k;
          cur.ry += ((parseFloat(a.dataset?.logoRy) || 0) - cur.ry) * k;
        } else cur.s += (0 - cur.s) * k;
        const t = (now - t0) / 1000;
        logo.position.set(cur.x, cur.y, 0);
        logo.scale.setScalar(Math.max(0.0001, cur.s));
        logo.rotation.set(-mouse.y * 0.5 + Math.sin(t * 0.6) * 0.06, cur.ry + mouse.x * 0.7 + Math.sin(t * 0.4) * 0.18, Math.sin(t * 0.5) * 0.03);
        canvas.style.visibility = cur.s > 2 ? "visible" : "hidden";
        if (cur.s > 2) renderer.render(scene, cam);
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
  }
})();

// Cookie card — not shown again once chosen (this copy doesn’t use cookies, so it only remembers the chosen value)
(() => {
  const c = document.querySelector("[data-consent]");
  if (!c) return;
  let chosen = null;
  try { chosen = localStorage.getItem("site-consent"); } catch {}
  if (chosen) { c.remove(); return; }
  // Initial kickoff — checked every .25s starting 1.5s after the script starts. Pages with a Hero wait until the entrance finishes (or 7s)
  const t0 = performance.now(), hasHero = !!document.querySelector("[data-hero]");
  let introDone = false;
  document.addEventListener("hero:intro-done", () => (introDone = true), { once: true });
  const show = () => {
    c.hidden = false;
    if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.fromTo(c, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", overwrite: true, clearProps: "transform,opacity" });
  };
  const check = () => { const now = performance.now(); if (now - t0 > 1500 && (!hasHero || introDone || now - t0 > 7000)) show(); else setTimeout(check, 250); };
  setTimeout(check, 1500);
  // 「Settings」 takes down the first panel and raises the settings panel (original consent_view swap)
  c.querySelector("[data-consent-more]")?.addEventListener("click", () => {
    c.querySelectorAll("[data-consent-view]").forEach((v) => { const on = v.dataset.consentView === "settings"; v.hidden = !on; v.classList.toggle("is-active", on); });
    c.querySelector('[data-consent-view="settings"] button')?.focus({ preventScroll: true });
  });
  c.querySelectorAll(".consent__switch").forEach((s) => s.addEventListener("click", () => s.setAttribute("aria-checked", String(s.getAttribute("aria-checked") !== "true"))));
  c.querySelectorAll("[data-consent-choice]").forEach((b) => b.addEventListener("click", () => {
    try { localStorage.setItem("site-consent", b.dataset.consentChoice); } catch {}
    c.classList.add("is-gone");
    // Original starts dropping at the click with .3s power2.in and hides 283ms after the click (92.6%, measured 13.4~15.8px)
    if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches) { gsap.to(c, { y: 16, opacity: 0, duration: 0.3, ease: "power2.in", overwrite: true }); setTimeout(() => { c.hidden = true; }, 283); }
    else c.hidden = true;
  }));
})();

// Page transition and hero entrance signal — the original Engine’s cover (stroke ends 0→1 expo.inOut, staggered per stroke, the table .24s after) and
// Ported the clear-out (the mark vanishes at 1.04x in .22s, stroke start 0→1 .4s expo.inOut, .07 per stroke). Stroke shape (position·weight·tail) is the original formula as is
(() => {
  const root = document.documentElement, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!window.gsap, NS = "http://www.w3.org/2000/svg";
  const covered = root.classList.contains("is-pt-cover");
  // Hero entrance starts .32s later if arriving from another page, otherwise .15s later (original setLoadDelay).
  window.siteIntro = Promise.resolve(covered ? 0.32 : 0.15);
  if (!hasGsap || reduce) { root.classList.remove("is-pt-cover"); return; }
  const mark = document.querySelector(".header__brand svg");
  const el = document.createElement("div");
  el.className = "pt"; el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<svg class="pt__scribble"></svg><svg class="pt__logo" viewBox="${mark?.getAttribute("viewBox") || "0 0 100 100"}">${mark?.innerHTML || ""}</svg>`;
  document.body.prepend(el);
  const svg = el.firstElementChild, logo = el.lastElementChild, defs = document.createElementNS(NS, "defs");
  svg.append(defs);
  const ENDS = [[0.05, 0.09], [0.08, 0.04], [0.04, 0.07], [0.07, 0.05]];
  let strokes = [];
  const layout = () => {
    const W = innerWidth, H = innerHeight, a = 0.05 * H, keep = strokes.map(({ s, e }) => ({ s, e }));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("preserveAspectRatio", "none");
    svg.querySelectorAll("path").forEach((p) => p.remove()); defs.replaceChildren();
    strokes = ENDS.map(([c, s], i) => {
      const y = H * (0.135 + 0.243 * i), [x0, x1] = i % 2 === 0 ? [W * (1 + s), -W * c] : [-W * c, W * (1 + s)];
      return Object.assign(gradStroke(svg, defs, [x0, y - a / 2], [x1, y + a / 2], 0.34 * H), { s: keep[i]?.s || 0, e: keep[i]?.e || 0, ls: 0, le: 0 });
    });
    strokes.forEach(paint);
  };
  const paint = (k) => paintStops(k.stops, k.s, k.e, k.ls, k.le);
  const setAll = (s, e) => strokes.forEach((k) => { Object.assign(k, { s, e, ls: 0, le: 0 }); paint(k); });
  const run = (k, key, dur, ease) => {
    const from = k[key], p = { u: 0 }, step = 1 / 60 / dur, f = gsap.parseEase(ease), E = (x) => f(clamp01(x));
    return gsap.to(p, { u: 1, duration: dur, ease: "none", onUpdate: () => {
      const v = E(p.u), feather = p.u >= 1 ? 0 : Math.min(0.3, Math.abs(v - E(p.u - step)) * (1 - from) * 2.2);
      k[key] = from + (1 - from) * v;
      if (key === "e") k.le = feather; else k.ls = feather;
      paint(k);
    } });
  };
  layout();
  addEventListener("resize", layout);
  const cover = () => new Promise((done) => {
    gsap.killTweensOf([el, logo]);
    setAll(0, 0);
    const tl = gsap.timeline({ onComplete: done }).set(el, { autoAlpha: 1 }).set(logo, { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" });
    // The original code values are stroke .44s · .09 gap · mark .6s, but with them the covered length comes out longer (500ms) than the original measurement (367~450ms), so it was cut to .36s · .074 gap · mark .5s
    strokes.forEach((k, i) => tl.add(run(k, "e", 0.36, "expo.inOut"), 0.074 * i));
    tl.to(logo, { opacity: 1, scale: 1, duration: 0.24, ease: "power2.out" }, 0.5);
  });
  const uncover = () => {
    const tl = gsap.timeline({ onComplete: () => { gsap.set(el, { autoAlpha: 0 }); el.classList.remove("is-menu-ink"); } }).to(logo, { opacity: 0, scale: 1.04, duration: 0.22, ease: "power2.out" }, 0);
    // The original moves on right at the spot where the content was swapped — the copy has reopened the page and raised the cover, so the first gap (.1s) is cut to .02s
    strokes.forEach((k, i) => tl.add(run(k, "s", 0.4, "expo.inOut"), 0.02 + 0.07 * i));
  };
  if (covered) {
    setAll(0, 1);
    gsap.set(el, { autoAlpha: 1 }); gsap.set(logo, { opacity: 1, scale: 1, transformOrigin: "50% 50%" });
    root.classList.remove("is-pt-cover");
    uncover();
  }
  let leaving = false;
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || leaving || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    leaving = true;
    // A link pressed in the menu is covered with the menu board color (ink·chalk)
    el.classList.toggle("is-menu-ink", root.classList.contains("is-menu"));
    cover().then(() => { try { sessionStorage.setItem("site-pt", String(Date.now())); } catch {} location.href = url.href; });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { leaving = false; uncover(); } });
})();

// Speed text — when the hand first moves, move the letters onto a canvas and make the DOM letters transparent (from then on always canvas).
// Pixels near the Interaction trail (last 23 points, radius text size ×.6) are dragged by its speed and smeared by stacking 32 times, brightening up to 14% the faster it moves. The trail fades ×.88 per frame
(() => {
  if (!window.gsap || matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const N = 24, TAPS = 32;
  const FRAG = `precision highp float;
uniform sampler2D uTex; uniform vec2 uRes; uniform vec4 uP[${N}]; uniform float uA[${N}]; uniform float uR; varying vec2 vUv;
void main() {
  vec2 px = vUv * uRes; vec2 vel = vec2(0.0); float infl = 0.0;
  for (int i = 0; i < ${N}; i++) { vec2 d = px - uP[i].xy; float f = exp(-dot(d, d) / (uR * uR)) * uA[i]; vel += uP[i].zw * f; infl += f; }
  if (infl < 0.002) { gl_FragColor = texture2D(uTex, px / uRes); return; }
  vec2 off = vel * 0.35; vec4 c = vec4(0.0);
  for (int j = 0; j < ${TAPS}; j++) { float t = float(j) / float(${TAPS - 1}); c += texture2D(uTex, (px - off + vel * t * 1.5) / uRes); }
  c /= float(${TAPS});
  float speed = clamp(length(vel) / 70.0, 0.0, 1.0);
  c.rgb += c.a * speed * 0.14;
  gl_FragColor = c;
}`;
  const VERT = "attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5); gl_Position = vec4(aPos, 0.0, 1.0); }";
  document.querySelectorAll("[data-speed-type]").forEach((t) => {
    const host = t.parentElement;
    if (!host) return;
    let gl = null, canvas = null, tex = null, U = {}, ready = false, raf = 0, inside = false, last = null, color = "";
    const trail = [], box = { w: 0, h: 0, dpr: 1, fs: 16 };
    const busy = () => gsap.isTweening(t) || gsap.isTweening(host) || gsap.getTweensOf(t.querySelectorAll("*")).some((tw) => tw.isActive());
    const draw = () => {
      const cs = getComputedStyle(t), r = t.getBoundingClientRect(), hr = host.getBoundingClientRect(), fs = parseFloat(cs.fontSize);
      const padX = 0.7 * fs, padY = 0.45 * fs, w = r.width + 2 * padX, h = r.height + 2 * padY, dpr = Math.min(devicePixelRatio || 1, 2, 4096 / w, 4096 / h);
      Object.assign(box, { w, h, dpr, fs });
      Object.assign(canvas.style, { left: `${r.left - padX - hr.left}px`, top: `${r.top - padY - hr.top}px`, width: `${w}px`, height: `${h}px` });
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      const src = document.createElement("canvas");
      src.width = canvas.width; src.height = canvas.height;
      const x = src.getContext("2d");
      x.scale(dpr, dpr);
      x.font = `${cs.fontStyle} ${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
      if ("letterSpacing" in x) x.letterSpacing = cs.letterSpacing;
      color ||= cs.color;
      x.fillStyle = color; x.textBaseline = "alphabetic";
      const asc = x.measureText("Hg").fontBoundingBoxAscent, tt = cs.textTransform;
      const cased = (s) => (tt === "uppercase" ? s.toLocaleUpperCase() : tt === "lowercase" ? s.toLocaleLowerCase() : s);
      const range = document.createRange(), walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        for (const m of (n.textContent || "").matchAll(/\S+/g)) {
          range.setStart(n, m.index); range.setEnd(n, m.index + m[0].length);
          const q = range.getBoundingClientRect();
          if (q.width) x.fillText(cased(m[0]), q.left - r.left + padX, q.top - r.top + padY + asc);
        }
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const render = () => {
      if (!gl) return;
      const P = new Float32Array(N * 4), A = new Float32Array(N);
      trail.slice(-(N - 1)).forEach((p, i) => { P.set([p.x, p.y, p.vx, p.vy], i * 4); A[i] = p.a; });
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1i(U.uTex, 0); gl.uniform2f(U.uRes, box.w, box.h); gl.uniform4fv(U.uP, P); gl.uniform1fv(U.uA, A); gl.uniform1f(U.uR, 0.6 * box.fs);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const build = () => {
      canvas = document.createElement("canvas");
      canvas.className = "speed-type__canvas"; canvas.setAttribute("aria-hidden", "true");
      gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
      if (!gl) return false;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      [[gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE], [gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
      ["uTex", "uRes", "uP", "uA", "uR"].forEach((k) => (U[k] = gl.getUniformLocation(prog, k)));
      host.append(canvas);
      draw();
      return true;
    };
    const tick = () => {
      trail.forEach((p) => (p.a *= 0.88));
      while (trail.length && trail[0].a < 0.004) trail.shift();
      render();
      raf = trail.length ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    new ResizeObserver(() => { if (ready && !busy()) { draw(); render(); } }).observe(t);
    host.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      if (!ready) {
        if (busy() || !build()) return;
        ready = true;
        t.classList.add("is-speed-type");
      }
      const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, edge = 0.3 * box.fs;
      inside = mx > -edge && my > -edge && mx < box.w + edge && my < box.h + edge;
      if (last) {
        const vx = Math.max(-90, Math.min(90, 1.8 * (mx - last.x))), vy = Math.max(-90, Math.min(90, 1.8 * (my - last.y)));
        if (Math.abs(vx) + Math.abs(vy) > 0.5) trail.push({ x: mx, y: my, vx, vy, a: inside ? 1 : 0.5 });
        if (trail.length > N - 1) trail.shift();
      }
      last = { x: mx, y: my };
      kick();
    });
    host.addEventListener("pointerleave", () => { inside = false; kick(); });
  });
})();
}
