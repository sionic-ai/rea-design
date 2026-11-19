/* Shared by two sections (curved carousel · case gallery): work list, loader (number · arc), bottom bar, About panel, page-turn indicator, placeholder video drawing. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none) and (pointer: coarse)").matches;
  const EXPO = "expo.out";
  const LERP = 0.085;
  if (window.SplitText) gsap.registerPlugin(SplitText);

  // Original has six works (short Latin names), and each case has four or five gallery photos or videos
  const PROJECTS = [
    { slug: "one", title: "Project One", heading: "Category Name", desc: "Role Description", agency: "Studio Name", count: 5 },
    { slug: "two", title: "Project Two", heading: "Category Name", desc: "Role Description", agency: "Studio Name", count: 4 },
    { slug: "three", title: "Project Three", heading: "Experiment Name", desc: "Creative Development", agency: "Personal", count: 6 },
    { slug: "four", title: "Project Four", heading: "Category Name", desc: "Role Description", agency: "Personal", count: 4 },
    { slug: "five", title: "Project Five", heading: "Category Name", desc: "Role Description Long", agency: "Studio Name", count: 4 },
    { slug: "six", title: "Project Six", heading: "Category Name", desc: "Role Description", agency: "Studio Name", count: 5 },
  ];

  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const wrap = (v, n) => ((v % n) + n) % n;
  const nearest = (to, from, n) => { let d = to - from; d = wrap(d + n / 2, n) - n / 2; return from + d; };

  // Skin variables to RGB for canvas and shaders — skins written with oklch or color-mix are also painted onto a 1-cell canvas and read
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pctx = probe.getContext("2d", { willReadFrequently: true });
  function rgb(name) {
    const el = document.createElement("i");
    el.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = c;
    pctx.fillRect(0, 0, 1, 1);
    const d = pctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const toCss = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;

  /* Placeholder video — the original slot is a looping recording of the site’s first screen (big white title + white button).
     In the same composition, draw a panel where two blobs of light flow slowly, and write what video goes in this spot. */
  function paint(ctx, w, h, t, seed, title, label, pal) {
    const k = (seed * 0.137) % 1;
    const base = mix(pal.surface, pal.dim, 0.12 + k * 0.35);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, toCss(mix(base, pal.ink, 0.06)));
    g.addColorStop(1, toCss(mix(base, pal.bg, 0.55)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const blob = (x, y, r, c, a) => {
      const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, toCss(c, a));
      rg.addColorStop(1, toCss(c, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
    };
    blob(w * (0.62 + 0.18 * Math.sin(t * 0.31 + seed)), h * (0.42 + 0.2 * Math.cos(t * 0.27 + seed * 2)), w * 0.42, pal.ink, 0.22);
    blob(w * (0.3 + 0.16 * Math.cos(t * 0.23 + seed * 3)), h * (0.7 + 0.12 * Math.sin(t * 0.37 + seed)), w * 0.36, pal.dim, 0.45);
    const s = Math.min(w, h * 1.78);
    const x = w * 0.075;
    ctx.fillStyle = toCss(pal.ink, 0.96);
    ctx.textBaseline = "alphabetic";
    ctx.font = `600 ${Math.round(s * 0.062)}px ${pal.font}`;
    ctx.fillText(title, x, h * 0.36);
    ctx.font = `500 ${Math.round(s * 0.028)}px ${pal.font}`;
    ctx.fillStyle = toCss(pal.ink, 0.78);
    label.forEach((line, i) => ctx.fillText(line, x, h * 0.36 + s * (0.06 + i * 0.04)));
    const bw = s * 0.15, bh = s * 0.04, by = h * 0.36 + s * (0.1 + label.length * 0.04);
    ctx.fillStyle = toCss(pal.ink, 0.96);
    ctx.beginPath();
    ctx.roundRect(x, by, bw, bh, bh / 2);
    ctx.fill();
  }
  function palette() {
    return { bg: rgb("--kf-bg"), surface: rgb("--kf-surface"), dim: rgb("--kf-dim"), ink: rgb("--kf-ink"), font: css("--kf-font-sans") || "sans-serif" };
  }

  // ---- Setup ----
  let isReady = false;
  const readyFns = [];
  function setReady() {
    if (isReady) return;
    isReady = true;
    root.classList.add("is-ready");
    readyFns.splice(0).forEach((f) => f());
  }
  const onReady = (f) => (isReady ? f() : readyFns.push(f));

  // ---- Loader: three numbers roll up cell by cell at 0.35 second intervals, the arc unfolds from center to both sides, then bends for 1.75 seconds once finished ----
  const ARC_W = 100, ARC_PAD = 4, HALF = (30 * Math.PI) / 180;
  const ARC_R = ARC_W / (2 * Math.sin(HALF));
  const ARC_F = ARC_R * (1 - Math.cos(HALF));
  function Loader() {
    const veil = document.querySelector(".ma-loader-veil");
    const count = document.querySelector(".ma-count");
    const arc = document.querySelector(".ma-arc");
    const base = arc && arc.querySelector("[data-arc-base]");
    const prog = arc && arc.querySelector("[data-arc-progress]");
    const st = { mode: "loading", p: 0, bend: 0, loop: 0, shown: true };
    if (arc) {
      const svg = arc.querySelector("svg");
      const W = ARC_W + ARC_PAD * 2, H = ARC_F + ARC_PAD * 2;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.setAttribute("width", W);
      svg.setAttribute("height", H);
    }
    const cols = count ? [...count.querySelectorAll("[data-count-col]")].map((el) => ({ el, cur: el.querySelector("span"), digit: "0" })) : [];
    let lastRoll = -Infinity, timer = 0;
    const rollCol = (c, d) => {
      const old = c.cur;
      gsap.killTweensOf(old);
      gsap.to(old, { yPercent: -100, duration: 0.35, ease: EXPO, onComplete: () => old.remove() });
      const s = document.createElement("span");
      s.textContent = d;
      c.el.append(s);
      gsap.fromTo(s, { yPercent: 100 }, { yPercent: 0, duration: 0.35, ease: EXPO });
      c.cur = s;
      c.digit = d;
    };
    const flush = () => {
      timer = 0;
      lastRoll = performance.now();
      String(Math.round(st.p * 100)).padStart(3, "0").split("").forEach((d, i) => cols[i] && cols[i].digit !== d && rollCol(cols[i], d));
    };
    const draw = () => {
      if (!arc) return;
      const g = ARC_PAD + ARC_W / 2, y = ARC_PAD + ARC_F, ry = ARC_R * st.bend;
      const k = (ARC_W / 2) * (st.mode === "loading" ? st.p : 1);
      base.setAttribute("d", k > 0 ? `M ${g - k} ${y} A ${ARC_R} ${ry} 0 0 1 ${g + k} ${y}` : "");
      const on = st.mode !== "loading" && st.loop > 0.001;
      if (!on) { prog.setAttribute("d", ""); } else {
        const cy = y + ry * Math.cos(HALF), end = HALF - st.loop * 2 * HALF;
        let d = "";
        for (let i = 0; i <= 48; i++) {
          const a = HALF + ((end - HALF) * i) / 48;
          d += `${i ? " L" : "M"} ${(g - ARC_R * Math.sin(a)).toFixed(2)} ${(cy - ry * Math.cos(a)).toFixed(2)}`;
        }
        prog.setAttribute("d", d);
      }
      arc.style.visibility = st.shown ? "" : "hidden";
    };
    draw();
    return {
      progress(p) {
        st.p = Math.max(0, Math.min(1, p));
        draw();
        const v = String(Math.round(st.p * 100)).padStart(3, "0");
        if (v === "100") { clearTimeout(timer); flush(); return; }
        if (timer) return;
        const wait = 350 - (performance.now() - lastRoll);
        wait <= 0 ? flush() : (timer = setTimeout(flush, wait));
      },
      done() {
        st.mode = "bar";
        veil && veil.remove();
        if (reduce) { st.bend = 1; draw(); count && count.remove(); return; }
        gsap.to(st, { bend: 1, duration: 1.75, ease: EXPO, onUpdate: draw });
        count && gsap.to(count.querySelector(".ma-count__row"), { yPercent: -100, opacity: 0, duration: 0.75, ease: EXPO, delay: 0.15, onComplete: () => count.remove() });
      },
      skip() { st.mode = "bar"; st.bend = 1; veil && veil.remove(); count && count.remove(); draw(); },
      loop(v) { st.loop = v; draw(); },
      show(on) { if (st.shown !== on) { st.shown = on; draw(); } },
    };
  }

  // ---- Bottom bar: the title rolls up and down to change, and when the case opens the arrows and side cells unfold from the gap ----
  function Controls() {
    const el = document.querySelector(".ma-controls");
    if (!el) return null;
    const titles = PROJECTS.map((p) => p.title);
    const box = el.querySelector(".ma-pill__title");
    const [a, b] = box.querySelectorAll("span");
    const sizer = box.querySelector("i");
    const pill = el.querySelector(".ma-pill");
    const prev = el.querySelector(".ma-pill__btn--prev"), next = el.querySelector(".ma-pill__btn--next");
    const squares = [...el.querySelectorAll(".ma-square")];
    const st = { T: 0, float: 0, active: 0, mode: "home", rise: 0, h: 21, bw: 47 };
    const measure = () => {
      let w = 0;
      titles.forEach((t) => { sizer.textContent = t; w = Math.max(w, sizer.getBoundingClientRect().width); });
      box.style.width = Math.ceil(w) + 1 + "px";
      st.h = sizer.offsetHeight || st.h;
      st.bw = prev.getBoundingClientRect().width || st.bw;
      if (st.mode === "home") pill.style.clipPath = `inset(0px ${st.bw}px 0px ${st.bw}px round 0.375rem)`;
    };
    const render = () => {
      const Q = Math.floor(st.T), z = st.T - Q, lift = st.h * (1 - st.rise);
      a.textContent = titles[wrap(Q, titles.length)];
      b.textContent = titles[wrap(Q + 1, titles.length)];
      a.style.transform = `translate(-50%, ${(-st.h * z + lift).toFixed(2)}px)`;
      a.style.opacity = 1 - z;
      b.style.transform = `translate(-50%, ${(st.h * (1 - z) + lift).toFixed(2)}px)`;
      b.style.opacity = z;
    };
    const tick = () => {
      if (st.mode === "case") {
        const to = nearest(st.active, st.T, titles.length), d = to - st.T;
        st.T = Math.abs(d) < 0.001 ? Math.round(to) : st.T + d * LERP;
      } else st.T = st.float;
      render();
    };
    gsap.ticker.add(tick);
    const icoA = (btn) => btn.querySelector(".ma-pill__ico--a");
    gsap.set([icoA(prev), icoA(next)], { opacity: 0 });
    gsap.set(icoA(prev), { x: () => st.bw / 2 });
    gsap.set(icoA(next), { x: () => -st.bw / 2 });
    measure();
    document.fonts && document.fonts.ready.then(measure);
    addEventListener("resize", measure);
    onReady(() => {
      if (reduce) { st.rise = 1; return; }
      gsap.to(st, { rise: 1, duration: 0.75, ease: EXPO, delay: 0.225 });
    });
    // Arrow hover: a black cell fills horizontally and the arrow slides out while the same arrow enters from the opposite side 0.1125s later
    const hover = (btn, dir, on) => {
      if (touch || st.mode !== "case") return;
      const [ia, ib, fill] = [btn.querySelector(".ma-pill__ico--a"), btn.querySelector(".ma-pill__ico--b"), btn.querySelector(".ma-pill__fill")];
      const t = (target, v) => gsap.to(target, { duration: 0.45, ease: EXPO, overwrite: true, ...v });
      t(fill, { scaleX: on ? 1 : 0 });
      t(on ? ia : ib, { xPercent: on ? dir : 0, opacity: 0 });
      t(on ? ib : ia, { xPercent: on ? dir : 0, opacity: 1, delay: 0.1125 });
    };
    prev.addEventListener("pointerenter", () => hover(prev, -100, true));
    prev.addEventListener("pointerleave", () => hover(prev, -100, false));
    next.addEventListener("pointerenter", () => hover(next, 100, true));
    next.addEventListener("pointerleave", () => hover(next, 100, false));
    const drawSquares = (o) => {
      pill.style.clipPath = `inset(0px ${o.inset}px 0px ${o.inset}px round 0.375rem)`;
      gsap.set(icoA(prev), { opacity: o.opacity, x: o.offset });
      gsap.set(icoA(next), { opacity: o.opacity, x: -o.offset });
      squares.forEach((s) => { s.style.clipPath = `inset(${o.side}% round 0.375rem)`; s.style.opacity = o.opacity; });
    };
    return {
      setFloat(f) { st.float = f; },
      setActive(i) { st.active = i; },
      // Case opening: waits 0.375s, then the gap opens with a 0.75s expo (original Controls sp)
      openCase(instant) {
        st.mode = "case";
        st.T = st.active;
        const o = { inset: st.bw, opacity: 0, offset: st.bw / 2, side: 25 };
        el.classList.add("is-case");
        if (instant || reduce) return drawSquares({ inset: 0, opacity: 1, offset: 0, side: 0 });
        drawSquares(o);
        gsap.to(o, { inset: 0, opacity: 1, offset: 0, side: 0, duration: 0.75, delay: 0.375, ease: EXPO, onUpdate: () => drawSquares(o) });
        el.dispatchEvent(new CustomEvent("ma:case-open"));
      },
      closeCase(cb) {
        const o = { inset: 0, opacity: 1, offset: 0, side: 0 };
        el.classList.remove("is-case");
        gsap.to(o, { inset: st.bw, opacity: 0, offset: st.bw / 2, side: 50, duration: reduce ? 0 : 0.6, ease: EXPO, onUpdate: () => drawSquares(o), onComplete: cb });
      },
      el,
    };
  }

  // ---- About panel: the right half panel opens from the right edge to the left (clip 0.75s), and lines rise with 0.025s offsets ----
  function About() {
    const btn = document.querySelector("[data-about-btn]");
    const panel = document.querySelector(".ma-about");
    if (!btn || !panel) return;
    const veil = document.querySelector(".ma-about-veil");
    const label = document.querySelector(".ma-about-close");
    const st = { v: 0 };
    let open = false, split = null;
    const draw = () => { panel.style.clipPath = `inset(0px 0px 0px ${(1 - st.v) * 100}% round 0.375rem)`; };
    draw();
    // Original: About slides left by its own width while Close enters from the right, and the button width shrinks to Close’s width
    // Over a light panel, the text color flips to the background color
    const [la, lb] = btn.querySelectorAll(".ma-roll__a, .ma-roll__b");
    gsap.set(lb, { x: () => la.offsetWidth + 2 });
    // Set button width to whole pixels from the start — so the 0.1px change from auto width (fractional) to integer on press isn’t caught as movement start
    const fixWidth = () => { if (!open) gsap.set(btn, { width: la.offsetWidth }); };
    fixWidth();
    document.fonts && document.fonts.ready.then(fixWidth);
    const roll = (on) => {
      const wa = la.offsetWidth, wb = lb.offsetWidth;
      gsap.to(la, { x: on ? -wa : 0, duration: reduce ? 0 : 0.75, ease: EXPO });
      gsap.to(lb, { x: on ? 0 : wa + 2, duration: reduce ? 0 : 0.75, ease: EXPO });
      // The original width shrinks in whole-pixel steps (40→39→38) — cut to integers with the same expo .75
      gsap.to(btn, { width: on ? wb : wa, duration: reduce ? 0 : 0.75, ease: EXPO, snap: "width", delay: 0.035 });
      gsap.to(btn, { color: on ? MA.css("--kf-bg") : MA.css("--kf-ink"), duration: reduce ? 0 : 0.75, ease: EXPO });
    };
    const toggle = (on) => {
      if (on === open) return;
      open = on;
      btn.setAttribute("aria-expanded", String(on));
      panel.inert = !on;
      roll(on);
      const d = reduce ? 0 : 0.75;
      if (on) {
        panel.classList.add("is-open");
        panel.style.pointerEvents = veil.style.pointerEvents = "auto";
        gsap.to(veil, { opacity: 1, duration: d, ease: EXPO });
        gsap.to(st, { v: 1, duration: d, ease: EXPO, onUpdate: draw });
        if (!split && window.SplitText) split = [...panel.querySelectorAll("[data-split]")].map((el) => SplitText.create(el, { type: "lines", mask: "lines" }));
        if (!reduce) {
          // Original: count the blocks inside the panel (title, paragraph, list rows) as a single line from the top, each entering k × .025 later (the capability list k=10, awards list is k=Starts at 21 —
          // number of chunks at the front of the board). Lines within a chunk differ by .025, and list lines include circle drawing, dot, number and underline together
          let k = 0;
          const seq = new Map(split ? split.map((sp, i) => [panel.querySelectorAll("[data-split]")[i], sp]) : []);
          panel.querySelectorAll("[data-split]:not([data-list-item] [data-split]), [data-list-item]").forEach((el) => {
            const ul = el.closest("[data-seq]");
            if (ul && el === ul.querySelector("[data-list-item]")) k = Math.max(k, +ul.dataset.seq);
            const sp = seq.get(el) || seq.get(el.querySelector && el.querySelector("[data-split]"));
            sp && gsap.fromTo(sp.lines, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.025, ease: EXPO, delay: k * 0.025 });
            k++;
          });
          panel.querySelectorAll("[data-seq]").forEach((ul) => ul.querySelectorAll("[data-list-item]").forEach((li, i) => {
            const dl = (+ul.dataset.seq + i) * 0.025, q = (s) => li.querySelector(s);
            q("[data-list-ring]") && gsap.fromTo(q("[data-list-ring]"), { strokeDashoffset: 62.83 }, { strokeDashoffset: 0, duration: 0.75, ease: EXPO, delay: dl });
            q("[data-list-dot]") && gsap.fromTo(q("[data-list-dot]"), { attr: { r: 0 } }, { attr: { r: 2 }, duration: 0.75, ease: "back.out(1.7)", delay: dl });
            q("[data-list-count]") && gsap.fromTo(q("[data-list-count]"), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.75, ease: EXPO, delay: dl });
            q("[data-list-line]") && gsap.fromTo(q("[data-list-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.75, ease: EXPO, delay: dl });
          }));
          const photo = panel.querySelector(".ma-about__photo");
          photo && gsap.fromTo(photo, { clipPath: "inset(25% round 0.375rem)" }, { clipPath: "inset(0% round 0.375rem)", duration: 0.75, ease: EXPO });
        }
        panel.focus({ preventScroll: true });
      } else {
        gsap.to(veil, { opacity: 0, duration: reduce ? 0 : 0.5, ease: EXPO });
        gsap.to(st, { v: 0, duration: d, ease: EXPO, onUpdate: draw, onComplete: () => { if (!open) { panel.style.pointerEvents = veil.style.pointerEvents = "none"; panel.classList.remove("is-open"); } } });
        label && gsap.to(label, { opacity: 0, duration: 0.3 });
        btn.focus({ preventScroll: true });
      }
    };
    btn.addEventListener("click", () => toggle(!open));
    veil.addEventListener("click", () => toggle(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) toggle(false); });
    // Over the cover, a small uppercase Close label follows the cursor
    if (label && !touch) {
      const xTo = gsap.quickTo(label, "x", { duration: 0.45, ease: EXPO });
      const yTo = gsap.quickTo(label, "y", { duration: 0.45, ease: EXPO });
      veil.addEventListener("pointermove", (e) => { xTo(e.clientX + 12); yTo(e.clientY + 12); if (open) gsap.to(label, { opacity: 1, duration: 0.3, overwrite: "auto" }); });
      veil.addEventListener("pointerleave", () => gsap.to(label, { opacity: 0, duration: 0.3, overwrite: "auto" }));
    }
  }

  // ---- Page transition: the original covers and opens within one page, but here there are two pages, so the state just before turning is written down and the next page starts from that state ----
  function go(url, state) {
    try { sessionStorage.setItem("ma-nav", JSON.stringify(state)); } catch (e) { /* If storage is blocked, loader first */ }
    location.href = url;
  }
  function arrival() {
    try {
      const v = sessionStorage.getItem("ma-nav");
      sessionStorage.removeItem("ma-nav");
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  }

  window.MA = { PROJECTS, reduce, touch, EXPO, LERP, css, rgb, wrap, nearest, paint, palette, onReady, setReady, Loader, Controls, go, arrival };
  addEventListener("DOMContentLoaded", About);
})();
