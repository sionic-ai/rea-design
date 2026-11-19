// Shared by all pages: Lenis, loader, menu collapse, phone menu, scroll bar, footer reveal, striped geometric glyphs (UX.Glyphs)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = matchMedia("(min-width: 769px)");
  const UX = (window.UX = Object.assign(window.UX || {}, { reduced, desk, lenis: null, ready: null }));

  // Canvas and WebGL can’t read CSS variables — apply the variable to a hidden element, paint the color the browser resolved (including color-mix·oklch) onto a 1px canvas and read it back as rgb
  const tint = document.createElement("i");
  const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  tint.hidden = true;
  UX.rgb = (name) => {
    if (!tint.isConnected) document.body.append(tint);
    tint.style.color = `var(${name})`;
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = getComputedStyle(tint).color;
    pix.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = pix.getImageData(0, 0, 1, 1).data;
    return { r, g, b, a: a / 255, css: `rgb(${r} ${g} ${b} / ${(a / 255).toFixed(3)})` };
  };
  UX.ink = (name) => UX.rgb(name).css;

  /* ── Striped Geometric Type ──
     Letters are built from circle, semicircle, triangle and square pieces, with fine horizontal lines filling each piece. Line thickness varies from top to bottom of the piece to create shading.
     Coordinates are in cell units where one line height is 10. r rectangle · e ellipse · rl/rr/rt/rb semicircle (rounded side left/right/top/bottom) · tu/td triangle (apex up/down).
     Sixth value 1 means ”overdraw in another ink” (a piece that only reads when laid on top, like the horizontal stroke of A). */
  const GLYPHS = {
    S: [8, [["rl", 0, 0, 4.6, 5.3], ["r", 4.6, 0, 3.4, 2.5], ["rr", 3.4, 4.7, 4.6, 5.3], ["r", 0, 7.5, 3.4, 2.5]]],
    A: [8.6, [["tu", 0, 0, 8.6, 10], ["r", 2.7, 6.3, 3.2, 1.7, 1]]],
    M: [10, [["r", 0, 0, 2.6, 10], ["td", 2.6, 0, 4.8, 6.6], ["r", 7.4, 0, 2.6, 10]]],
    P: [7.4, [["r", 0, 0, 2.6, 10], ["rr", 2.6, 0, 4.8, 6.2]]],
    L: [7, [["r", 0, 0, 2.6, 10], ["r", 2.6, 7.2, 4.4, 2.8]]],
    E: [6.8, [["r", 0, 0, 2.6, 10], ["r", 2.6, 0, 4.2, 2.6], ["r", 2.6, 3.9, 3.4, 2.3], ["r", 2.6, 7.4, 4.2, 2.6]]],
    T: [8, [["r", 0, 0, 8, 2.8], ["r", 2.7, 2.8, 2.6, 7.2]]],
    I: [3, [["e", 0, 0, 3, 2.6], ["r", 0, 3.4, 3, 6.6]]],
    O: [8.6, [["e", 0, 0, 8.6, 10]]],
    0: [6.6, [["e", 0, 0, 6.6, 10]]],
    " ": [3.2, []],
  };
  const SWAPS = ["r", "e", "rl", "rr", "rt", "rb", "tu", "td"];

  function shapePath(ctx, t, x, y, w, h) {
    ctx.beginPath();
    if (t === "r") ctx.rect(x, y, w, h);
    else if (t === "e") ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else if (t === "rl") ctx.ellipse(x + w, y + h / 2, w, h / 2, 0, Math.PI / 2, Math.PI * 1.5);
    else if (t === "rr") ctx.ellipse(x, y + h / 2, w, h / 2, 0, -Math.PI / 2, Math.PI / 2);
    else if (t === "rt") ctx.ellipse(x + w / 2, y + h, w / 2, h, 0, Math.PI, Math.PI * 2);
    else if (t === "rb") ctx.ellipse(x + w / 2, y, w / 2, h, 0, 0, Math.PI);
    else if (t === "tu") { ctx.moveTo(x, y + h); ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w, y + h); }
    else if (t === "td") { ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w / 2, y + h); }
    ctx.closePath();
  }

  // Seed random — so the same shading direction appears even after a refresh
  const seeded = (s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

  class Glyphs {
    constructor(canvas, { rows, inks, field = 0, rowGap = 0.035, gap = 0.5, lines = 40, fill = 1, seed = 7, hidden = false }) {
      Object.assign(this, { canvas, rows, inks, field, rowGap, gap, lines, fill });
      this.ctx = canvas.getContext("2d");
      const rnd = seeded(seed);
      this.pieces = [];
      rows.forEach((text, ri) => {
        let ux = 0;
        [...text].forEach((ch, ci) => {
          const [w, parts] = GLYPHS[ch] || GLYPHS[" "];
          parts.forEach(([t, x, y, pw, ph, over], pi) => {
            const ink = over ? 1 - ((ci + pi) % 2) : (ci + pi) % 2;
            this.pieces.push({ ri, t, base: t, x: ux + x, y, w: pw, h: ph, ink, baseInk: ink, over: !!over, dir: rnd() > 0.45, next: null, p: 0, vis: hidden && !reduced ? 0 : 1 });
          });
          ux += w + this.gap;
        });
        this.pieces.filter((p) => p.ri === ri).forEach((p) => (p.rowW = ux - this.gap));
      });
      this.pieces.sort((a, b) => a.over - b.over);
      new ResizeObserver(() => this.resize()).observe(canvas);
      this.resize();
    }
    resize() {
      const r = this.canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.W = r.width; this.H = r.height;
      this.canvas.width = Math.round(r.width * dpr);
      this.canvas.height = Math.round(r.height * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    }
    draw() {
      const { ctx, W, H, rows } = this;
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      const n = rows.length, gapPx = H * this.rowGap;
      const rowH = (H - gapPx * (n - 1)) / n;
      const P = rowH / this.lines;
      if (this.field) {
        ctx.fillStyle = this.inks[0];
        ctx.globalAlpha = this.field;
        for (let ri = 0; ri < n; ri++) for (let k = 0; k <= this.lines; k += 2) ctx.fillRect(0, ri * (rowH + gapPx) + k * P, W, 1);
        ctx.globalAlpha = 1;
      }
      for (const pc of this.pieces) {
        const sx = W / pc.rowW, sy = rowH / 10, top = pc.ri * (rowH + gapPx);
        const box = [pc.x * sx, top + pc.y * sy, pc.w * sx, pc.h * sy];
        if (pc.next && pc.p > 0) {
          this.stripes(pc.next.t, pc.next.ink, pc.dir, box, top, P, 0, pc.p, pc.vis);
          this.stripes(pc.t, pc.ink, pc.dir, box, top, P, pc.p, 1, pc.vis);
        } else if (pc.vis > 0.01) this.stripes(pc.t, pc.ink, pc.dir, box, top, P, 0, 1, pc.vis);
      }
    }
    // Lines are drawn to a full-row grid so the row height stays continuous even across different pieces. from~to is the vertical ratio within a piece (when swapped, it changes from the top)
    stripes(t, ink, dir, [x, y, w, h], top, P, from, to, vis = 1) {
      const { ctx } = this;
      ctx.save();
      shapePath(ctx, t, x, y, w, h);
      ctx.clip();
      ctx.fillStyle = this.inks[ink];
      const k0 = Math.floor((y - top) / P), k1 = Math.ceil((y + h - top) / P);
      for (let k = k0; k <= k1; k++) {
        const ly = top + k * P;
        const rel = (ly + P / 2 - y) / h;
        if (rel < from || rel >= to) continue;
        const g = Math.min(1, Math.max(0, dir ? rel : 1 - rel));
        const th = (P * (0.24 + 0.68 * g) * (0.2 + 0.8 * this.fill) + 0.35) * vis;
        ctx.fillRect(x - 1, ly + (P - th) / 2, w + 2, th);
      }
      ctx.restore();
    }
    // Hero — the original plays a pre-baked 8s video once when the loader lifts, then at the end rewinds to 3s and loops 3→8s. Order measured at 0.25s intervals:
    // First 3s (once). Shuffled pieces on a blank line plate come in thickening from thin lines, the top row from .25s and the bottom row from .9s (.6s), then switch to their real letters from 2s and 2.4s (.5s).
    // Repeats every 5s — after a 1s hold, lines thin out and vanish at .5s stagger per line (.4s power2.in), then thicken into shuffled pieces (.4s power2.out) and
    // .2s later it returns to its own letters from the top (.5s power2.out) and stays until the next rewind
    play() {
      if (reduced || this.playing) return;
      this.playing = true;
      const rows = [...new Set(this.pieces.map((p) => p.ri))].map((ri) => this.pieces.filter((p) => p.ri === ri).sort((a, b) => a.x - b.x));
      const pick = (pc) => {
        if (pc.over) return { t: pc.base, ink: pc.baseInk };
        const opts = SWAPS.filter((x) => x !== pc.base);
        return { t: opts[Math.floor(Math.random() * opts.length)], ink: Math.random() < 0.5 ? 1 - pc.baseInk : pc.baseInk };
      };
      const lag = 0.02;
      const home = (tl, ps, at) => ps.forEach((pc, i) => {
        if (pc.over) return;
        const t0 = at + i * 0.025;
        tl.call(() => { pc.next = { t: pc.base, ink: pc.baseInk }; pc.p = 0; }, null, t0)
          .to(pc, { p: 1, duration: 0.5, ease: "power2.out" }, t0)
          .call(() => Object.assign(pc, { t: pc.base, ink: pc.baseInk, next: null, p: 0 }), null, t0 + 0.5);
      });
      const mark = () => (this.dirty = true);
      const loop = gsap.timeline({ paused: true, repeat: -1, onUpdate: mark });
      rows.forEach((ps, k) => {
        const t0 = 1 + k * 0.5, t1 = t0 + 0.4;
        loop.to(ps, { vis: 0, duration: 0.4, ease: "power2.in", stagger: lag }, t0);
        ps.forEach((pc, i) => loop.call(() => Object.assign(pc, pick(pc)), null, t1 + i * lag));
        loop.to(ps, { vis: 1, duration: 0.4, ease: "power2.out", stagger: lag }, t1 + lag * ps.length);
        home(loop, ps, t1 + lag * ps.length + 0.6);
      });
      loop.set({}, {}, 5);
      const intro = gsap.timeline({ onUpdate: mark, onComplete: () => loop.play(0) });
      rows.forEach((ps, k) => {
        intro.call(() => ps.forEach((pc) => Object.assign(pc, pick(pc))), null, 0);
        intro.to(ps, { vis: 1, duration: 0.6, ease: "power2.out", stagger: lag }, 0.25 + k * 0.65);
        home(intro, ps, 2 + k * 0.4);
      });
      intro.set({}, {}, 3);
      gsap.ticker.add(() => { if (this.dirty) { this.dirty = false; this.draw(); } });
    }
    setFill(v) {
      if (Math.abs(v - this.fill) < 0.002) return;
      this.fill = v;
      this.draw();
    }
  }
  UX.Glyphs = Glyphs;

  /* ── Lenis: original setting duration 1.2 (default easing), shortcut jumps use 1.5s exponential ease-out ── */
  if (!reduced && window.Lenis) {
    // On touch devices fingers are smooth too (syncTouch) at double sensitivity — original Lenis 1.3.17 settings as-is
    const coarse = matchMedia("(pointer: coarse)").matches;
    UX.lenis = new Lenis({ duration: 1.2, orientation: "vertical", gestureOrientation: "vertical", smoothWheel: true, syncTouch: coarse, ...(coarse && { touchMultiplier: 2 }) });
    UX.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => UX.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  UX.scrollTo = (target) => {
    const el = target === "top" ? 0 : document.getElementById(target);
    if (el == null) return;
    if (UX.lenis) UX.lenis.scrollTo(el, { duration: 1.5, easing: (e) => Math.min(1, 1.001 - 2 ** (-10 * e)) });
    else scrollTo({ top: el === 0 ? 0 : el.getBoundingClientRect().top + scrollY });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-scroll-to]");
    if (!a) return;
    e.preventDefault();
    closeDrawer();
    UX.scrollTo(a.dataset.scrollTo);
  });

  /* ── Loader ── */
  function loader() {
    const el = document.querySelector(".ux-loading");
    if (!el) return Promise.resolve();
    const fillTrack = (track, html, n) => {
      const group = `<div class="ux-loading__group" style="display:flex">${html.repeat(n)}</div>`;
      track.innerHTML = group + group;
    };
    el.querySelectorAll("[data-marquee-title]").forEach((t) => fillTrack(t, `<span class="ux-loading__item">${t.dataset.marqueeTitle}</span>`, 8));
    el.querySelectorAll("[data-marquee-percent]").forEach((t) => fillTrack(t, `<span class="ux-loading__item" data-percent>00%</span>`, 19));
    el.querySelectorAll(".ux-loading__lines").forEach((block, bi) => {
      // 31 rows — full at the top, getting rounder and shorter toward the bottom (the right group is reversed). Laid in the same place as the hero text lines just before the reveal
      let html = "";
      for (let i = 0; i < 31; i++) {
        const t = bi ? (30 - i) / 30 : i / 30;
        const w = t < 0.55 ? 100 : 100 * Math.sqrt(1 - ((t - 0.55) / 0.45) ** 2 * 0.72);
        html += `<i class="ux-loading__line" style="width:${w.toFixed(1)}%"></i>`;
      }
      block.innerHTML = html;
    });
    const texts = el.querySelectorAll("[data-percent]");
    const prog = { v: 0 };
    const paint = () => texts.forEach((t) => (t.textContent = `${String(Math.floor(prog.v)).padStart(2, "0")}%`));
    if (reduced) {
      el.remove();
      return Promise.resolve();
    }
    document.body.classList.add("is-loading");
    UX.lenis?.stop();
    // Original: while downloading heavy assets like video and models, it only rises to half of what’s been received (.2s each), and once everything is received it goes to 100% in three 1s runs (.3s pause)
    const heavy = [...document.querySelectorAll("video")];
    // Cut off at 6s so the loader doesn’t hang in browsers that skip preloading (data saver)
    const ready = (v) => new Promise((ok) => {
      if (v.readyState >= 2) return ok();
      v.addEventListener("loadeddata", ok, { once: true });
      v.addEventListener("error", ok, { once: true });
      setTimeout(ok, 6000);
    });
    let got = 0;
    const total = heavy.length + 2;
    // If you return a tween, the Promise waits for its end, but a tween killed by being overwritten by the next share never finishes — so do not return it
    const tick = () => { gsap.to(prog, { v: (++got / total) * 50, duration: 0.2, overwrite: true, onUpdate: paint }); };
    const waits = [...heavy.map(ready), document.fonts?.ready ?? Promise.resolve(), document.readyState === "complete" ? Promise.resolve() : new Promise((ok) => addEventListener("load", ok, { once: true }))];
    return Promise.all(waits.map((w) => w.then(tick))).then(() => new Promise((done) => {
      gsap.killTweensOf(prog);
      const a = 62 + Math.random() * 12, b = Math.max(a + 8, 80 + Math.random() * 10);
      const step = (v) => ({ v, duration: 1, delay: 0.3, ease: "power2.inOut", onUpdate: paint });
      gsap.timeline({ onComplete: hide }).to(prog, step(a)).to(prog, step(b)).to(prog, step(100));
      function hide() {
        el.classList.add("is-hiding");
        const tl = gsap.timeline();
        if (desk.matches) {
          const [left, right] = el.querySelectorAll(".ux-loading__lines");
          tl.to(left.children, { scaleX: 1, duration: 0.4, ease: "circ.out", stagger: 0.02 }, 0);
          tl.to([...right.children].reverse(), { scaleX: 1, duration: 0.4, ease: "circ.out", stagger: 0.02 }, 0);
        } else tl.to(el.querySelectorAll(".ux-loading__block"), { width: "100%", duration: 0.8, ease: "power4.inOut" }, 0);
        tl.to(el, {
          autoAlpha: 0, duration: 0.8, ease: "power4.inOut",
          onComplete: () => {
            el.style.display = "none";
            document.body.classList.remove("is-loading");
            UX.lenis?.start();
            done();
          },
        }, ">+0.2");
      }
    }));
  }

  /* ── Fixed menu: on scroll down only the top row (HOME) remains and the rows below fold up (.32s circ.in, .05 gap), and on scroll up they unfold again ── */
  const nav = document.querySelector(".ux-nav");
  const items = nav ? [...nav.querySelectorAll(".ux-navitem")] : [];
  let shown = items.length, target = items.length, navTl = null;
  const itemH = () => items[0].getBoundingClientRect().height || parseFloat(getComputedStyle(items[0]).fontSize) * 0.8;
  function setCount(n, instant) {
    if (!items.length || n === target) return;
    target = n;
    navTl?.kill();
    const h = parseFloat(getComputedStyle(items[0]).fontSize) * 0.8;
    nav.classList.toggle("is-minimal", n === 1);
    if (instant || reduced) {
      items.forEach((it, i) => {
        const on = i < n;
        it.classList.toggle("is-stacked", !on);
        gsap.set(it, { height: on ? h : 0, minHeight: on ? h : 0, clipPath: on ? "inset(0px 0px 0px 0px)" : `inset(0px 0px ${h}px 0px)` });
      });
      shown = n;
      return;
    }
    navTl = gsap.timeline({ onComplete: () => (shown = n) });
    const lag = desk.matches ? 0.05 : 0;
    if (n < shown) {
      for (let k = shown - 1, i = 0; k >= n; k--, i++) {
        items[k].classList.add("is-stacked");
        navTl.to(items[k], { height: 0, minHeight: 0, clipPath: `inset(0px 0px ${h}px 0px)`, duration: 0.32, ease: "circ.in" }, i * lag);
      }
    } else {
      for (let k = shown, i = 0; k < n; k++, i++) {
        items[k].classList.remove("is-stacked");
        navTl.fromTo(items[k], { height: 0, minHeight: 0, clipPath: `inset(0px 0px ${h}px 0px)` }, { height: h, minHeight: h, clipPath: "inset(0px 0px 0px 0px)", duration: 0.32, ease: "circ.in" }, i * lag);
      }
    }
  }
  let last = 0;
  function onScroll() {
    if (!desk.matches || !items.length) return;
    const y = scrollY, d = y - last;
    last = y;
    if (y <= 10) return setCount(items.length);
    if (Math.abs(d) < 2) return;
    setCount(d > 0 ? 1 : items.length);
  }
  addEventListener("scroll", onScroll, { passive: true });

  // Invert the menu of the section in view (navy background) — HOME when collapsed
  const sections = items.map((it) => it.querySelector("[data-scroll-to]")?.dataset.scrollTo).filter((id) => id && id !== "top");
  function markCurrent() {
    let cur = "top";
    for (const id of sections) {
      const s = document.getElementById(id);
      if (s && s.getBoundingClientRect().top < innerHeight * 0.5) cur = id;
    }
    document.querySelectorAll(".ux-navlink[data-scroll-to]").forEach((a) => a.classList.toggle("is-current", a.dataset.scrollTo === (target === 1 && desk.matches ? "top" : cur)));
  }
  addEventListener("scroll", markCurrent, { passive: true });

  /* ── Phone: the [MENU] at bottom right opens all four menu rows at once ── */
  const btn = document.querySelector(".ux-menu-btn");
  function closeDrawer() {
    if (!btn || !nav.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.querySelector(".ux-menu-btn__text").textContent = "MENU";
  }
  btn?.addEventListener("click", () => {
    if (nav.classList.contains("is-open")) return closeDrawer();
    nav.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    btn.querySelector(".ux-menu-btn__text").textContent = "CLOSE";
    target = 1; shown = 1;
    setCount(items.length);
  });
  document.addEventListener("click", (e) => {
    if (nav?.classList.contains("is-open") && !e.target.closest(".ux-nav, .ux-menu-btn")) closeDrawer();
  });
  const syncMode = () => {
    if (desk.matches) { closeDrawer(); setCount(scrollY > 10 ? 1 : items.length, true); }
    else setCount(items.length, true);
  };
  desk.addEventListener("change", syncMode);

  /* ── Scroll Bar ── */
  const thumb = document.querySelector(".ux-scrollbar__thumb");
  function paintBar() {
    if (!thumb) return;
    const docH = document.documentElement.scrollHeight, vh = innerHeight;
    const th = Math.max(50, (vh / docH) * vh);
    thumb.style.height = `${th}px`;
    thumb.style.transform = `translateY(${(scrollY / Math.max(1, docH - vh)) * (vh - th)}px)`;
  }
  addEventListener("scroll", paintBar, { passive: true });
  addEventListener("resize", paintBar);
  thumb?.addEventListener("pointerdown", (e) => {
    const y0 = e.clientY, s0 = scrollY;
    thumb.setPointerCapture(e.pointerId);
    const move = (ev) => {
      const docH = document.documentElement.scrollHeight, vh = innerHeight;
      const th = thumb.offsetHeight;
      const y = s0 + ((ev.clientY - y0) / (vh - th)) * (docH - vh);
      UX.lenis ? UX.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
    };
    const up = () => { thumb.removeEventListener("pointermove", move); thumb.removeEventListener("pointerup", up); };
    thumb.addEventListener("pointermove", move);
    thumb.addEventListener("pointerup", up);
  });

  /* ── Footer: fixed behind the body, dark overlay 1→0 while passing the blank space equal to the footer height ── */
  const footer = document.querySelector(".ux-footer");
  if (footer) {
    const sync = () => {
      document.documentElement.style.setProperty("--footer-height", `${footer.offsetHeight}px`);
      ScrollTrigger.refresh();
    };
    new ResizeObserver(sync).observe(footer);
    const dim = footer.querySelector(".ux-footer__dim");
    gsap.fromTo(dim, { opacity: 1 }, {
      opacity: 0, ease: "none",
      scrollTrigger: { trigger: ".ux-footer-spacer", start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
    });
  }

  UX.ready = loader();
  addEventListener("load", () => { syncMode(); paintBar(); markCurrent(); ScrollTrigger.refresh(); });
})();
