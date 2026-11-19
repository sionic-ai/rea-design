// First page — Hero scroll sequence (bento → two-line text → 83-frame video → mark zoom → white board), the wide-screen card stage (card-wheel-grid part) and
// Sections above that (title · selection · partners · closing form), narrow-screen deck · partners · closing, partner accordion, selection, closing form, card detail panel
(() => {
  const SC = window.SC;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // Skin variables are in oklch(from …) form, which canvas and GSAP can’t read — draw one point and resolve it to rgb
  const probe = document.createElement("i"), pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  probe.style.display = "none";
  document.body.append(probe);
  const css = (name) => {
    probe.style.color = `var(${name})`;
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = getComputedStyle(probe).color;
    pix.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = pix.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  };
  const V = (v, a, b) => Math.max(a, Math.min(b, v));
  const S = (a, b, v) => { const t = V((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  const hero = $(".sc-hero");
  const stage = $(".sc-hero__stage");
  const cells = $$(".sc-hero__cell:not(.sc-hero__film)");
  const film = $(".sc-hero__film");
  const canvas = $(".sc-hero__canvas");
  const fillEl = $(".sc-hero__fill");
  const [tag1, tag2] = $$(".sc-hero__taglines p");
  const lockup = $(".sc-hero__lockup");
  const scrollHint = $(".sc-hero__scroll");
  const bottom = $(".sc-hero__bottom");
  const line = $(".sc-hero__line");
  const markInline = $(".sc-hero__mark-inline");
  const markBig = $(".sc-hero__mark-big");
  const white = $(".sc-hero__white");
  const bgHero = $(".sc-hero__bg");
  const bgWarm = $(".sc-hero__bg-warm");
  const bgLight = $("#sc-bg-light");
  const bgMesh = $(".sc-bg-mesh");
  const logo = $(".sc-logo");
  const morph = $(".sc-morph");
  const integ = $(".sc-integ");
  const closeInner = $(".sc-close__inner");

  // ── 83-frame video slot: a backlit window silhouette is redrawn every frame (the original is a webp bundle) — the camera approaches 12% while the figure slowly turns away ──
  const FRAMES = 83;
  const ctx2d = canvas.getContext("2d");
  let frameNow = -1, pal = null;
  const sizeCanvas = () => {
    pal = { night: css("--site-night-deep"), warm: css("--kf-accent"), soft: css("--kf-accent-soft"), cream: css("--site-mist-cream"), sky: css("--site-mist-sky") };
    const dpr = Math.min(devicePixelRatio || 1, SC.compact() ? 1.25 : 2);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round((hero.clientHeight || innerHeight) * dpr);
    frameNow = -1;
  };
  const drawFrame = (f) => {
    const i = Math.round(V(f, 0, FRAMES - 1));
    if (i === frameNow) return;
    frameNow = i;
    const w = canvas.width, h = canvas.height, t = i / (FRAMES - 1), c = ctx2d;
    const { night, warm, soft, cream, sky } = pal;
    c.save();
    c.clearRect(0, 0, w, h);
    const zoom = 1 + 0.12 * t;
    c.translate(w / 2, h / 2); c.scale(zoom, zoom); c.translate(-w / 2, -h / 2);
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, sky); g.addColorStop(0.45, cream); g.addColorStop(0.75, soft); g.addColorStop(1, warm);
    c.fillStyle = g; c.fillRect(-w, -h, w * 3, h * 3);
    const sun = c.createRadialGradient(w * 0.32, h * 0.66, 0, w * 0.32, h * 0.66, h * 0.55);
    sun.addColorStop(0, cream); sun.addColorStop(0.25, soft); sun.addColorStop(1, "transparent");
    c.fillStyle = sun; c.fillRect(0, 0, w, h);
    c.fillStyle = night;
    c.globalAlpha = 0.55;
    for (let k = 0; k < 14; k++) { const bx = (k / 14) * w * 1.1 - w * 0.05, bh = h * (0.12 + ((k * 37) % 11) / 60); c.fillRect(bx, h * 0.8 - bh, w / 16, bh + h * 0.3); }
    c.globalAlpha = 1;
    const shift = -t * w * 0.04;
    c.fillRect(w * 0.16 + shift, 0, w * 0.018, h);
    c.fillRect(w * 0.5 + shift, 0, w * 0.022, h);
    c.fillRect(0, h * 0.26, w, h * 0.016);
    const px = w * (0.66 - 0.06 * t), turn = 0.12 - 0.24 * t;
    c.save();
    c.translate(px, h * 0.48); c.rotate(turn * 0.15);
    c.beginPath(); c.ellipse(0, -h * 0.1, h * 0.085, h * 0.11, 0, 0, Math.PI * 2); c.fill();
    c.beginPath();
    c.moveTo(-h * 0.06, h * 0.0); c.quadraticCurveTo(-h * 0.36 - turn * h * 0.3, h * 0.08, -h * 0.4, h * 0.7);
    c.lineTo(h * 0.42, h * 0.7); c.quadraticCurveTo(h * 0.36 + turn * h * 0.3, h * 0.08, h * 0.06, h * 0.0); c.closePath(); c.fill();
    c.restore();
    c.restore();
  };

  // ── Hero bento layout: scales a 2240×1048 board to .9704 of screen height or to the width, and gives each cell a center-based position ──
  const FIELD = { w: 2240, h: 1048 }, MAIN = { x: 705, y: 290, w: 830, h: 468 };
  const geo = { cells: [], main: null };
  const measureBento = () => {
    const w = innerWidth, h = hero.clientHeight || innerHeight, k = Math.max((h * 0.9704) / FIELD.h, w / FIELD.w);
    const fw = FIELD.w * k, fh = FIELD.h * k, ox = (w - fw) / 2, oy = (h - fh) / 2;
    const at = (b) => ({ x: ox + b.x * k + (b.w * k) / 2 - w / 2, y: oy + b.y * k + (b.h * k) / 2 - h / 2, w: b.w * k, h: b.h * k });
    geo.cells = cells.map((c) => at({ x: +c.dataset.x, y: +c.dataset.y, w: +c.dataset.w, h: +c.dataset.h }));
    geo.main = at(MAIN);
  };
  const placeBento = () => {
    cells.forEach((c, i) => { const g = geo.cells[i]; gsap.set(c, { x: g.x, y: g.y, width: g.w, height: g.h, xPercent: -50, yPercent: -50 }); });
    const m = geo.main;
    gsap.set(film, { x: m.x, y: m.y, width: m.w, height: m.h, xPercent: -50, yPercent: -50 });
  };
  // Mark zoom: starting from the mark spot inside a one-line phrase, until the gap-free spot in the mark (68×54) (whichever of two candidates needs less scaling) covers the screen at 1.6x
  const ZOOM = [{ x: 10.4, y: 40.45, hw: 4.8, hh: 1.9 }, { x: 3.25, y: 33.5, hw: 2.5, hh: 2.8 }];
  const from = {}, to = {};
  const measureMark = () => {
    const left = Math.max(innerWidth * 0.08, 32), top = innerHeight * 0.5 - line.offsetHeight / 2;
    from.left = left + markInline.offsetLeft; from.top = top + markInline.offsetTop; from.width = markInline.offsetWidth; from.height = markInline.offsetHeight;
    let pick = ZOOM[0], k = Infinity;
    for (const z of ZOOM) { const s = Math.max(innerWidth / 2 / z.hw, innerHeight / 2 / z.hh); if (s < k) { k = s; pick = z; } }
    k *= 1.6;
    to.width = 68 * k; to.height = 54 * k; to.left = innerWidth / 2 - pick.x * k; to.top = innerHeight / 2 - pick.y * k;
    gsap.set(markBig, { ...from });
  };

  // ── Hero timeline (original units 7.25 = Fixed 3800px, narrow screens 3200px + 420px empty tail ──
  const buildHero = (compact) => {
    const ctx = gsap.context(() => {
      sizeCanvas(); measureBento(); placeBento(); measureMark(); drawFrame(0);
      gsap.set(bgWarm, { autoAlpha: 0 });
      gsap.set(cells, { autoAlpha: 0, scale: 0.7 });
      gsap.set(film, { autoAlpha: 0 });
      gsap.set(stage, { scale: 1.06, transformOrigin: `50% ${(hero.clientHeight || innerHeight) / 2}px` });
      gsap.set([lockup, bottom, fillEl, scrollHint], { autoAlpha: 1 });
      gsap.set(scrollHint, { scale: 1 });
      gsap.set([tag1, tag2, line, markBig, white], { autoAlpha: 0 });
      gsap.set(markInline, { autoAlpha: 1 });
      const frame = { i: 0 }, snapAt = { v: 0.9 };
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero, start: "top top", end: () => `+=${compact ? 3200 + 420 : 3800}`,
          pin: true, pinSpacing: false, scrub: compact ? true : 0.6, pinType: compact ? "fixed" : "transform", anticipatePin: 1,
          snap: { snapTo: (v) => (v < snapAt.v ? v : 1), duration: { min: 0.2, max: 0.7 }, delay: 0.03, inertia: !compact, ease: "power2.inOut" },
          invalidateOnRefresh: true, refreshPriority: 3,
          onRefresh: () => { sizeCanvas(); measureBento(); placeBento(); measureMark(); drawFrame(frame.i); },
        },
      });
      tl.to(scrollHint, { autoAlpha: 0, scale: 0.85, duration: 0.35, ease: "power2.in" }, 0);
      tl.to(bgWarm, { autoAlpha: 1, duration: 2 }, 0);
      cells.forEach((c, i) => tl.fromTo(c, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, ease: "power3.out", duration: 0.6 }, 0.35 + i * 0.025));
      tl.fromTo(film, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0.6);
      tl.to(lockup, { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 0.55);
      tl.to(bottom, { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 0.55);
      const ne = 1.7, pe = ne - 0.4;
      tl.to(cells, { autoAlpha: 0.22, duration: 0.6, ease: "power2.out" }, pe);
      tl.fromTo(tag1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power1.inOut" }, pe);
      tl.to(tag1, { autoAlpha: 0, duration: 0.4, ease: "power1.inOut" }, ne + 0.9);
      tl.to(tag2, { autoAlpha: 1, duration: 0.4, ease: "power1.inOut" }, ne + 0.95);
      const re = ne + 1.9;
      tl.to([tag1, tag2], { autoAlpha: 0, duration: 0.4, ease: "power2.in" }, re);
      tl.to(fillEl, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, re);
      const me = re + 0.4, st = 0.9;
      cells.forEach((c, i) => tl.to(c, { x: () => geo.cells[i].x * 2.6, y: () => geo.cells[i].y * 2.6, autoAlpha: 0, ease: "power2.in", duration: 0.9 }, me));
      tl.to(stage, { scale: 1.12, ease: "power2.out", duration: pe - 0.3 }, 0.3);
      tl.to(film, { x: 0, y: 0, width: () => innerWidth, height: () => hero.clientHeight || innerHeight, borderRadius: 0, ease: "power2.inOut", duration: 1.3 }, me);
      tl.to(frame, { i: FRAMES - 1, duration: 1.4 + st, onUpdate: () => drawFrame(frame.i) }, me);
      tl.set(line, { left: () => Math.max(innerWidth * 0.08, 32), top: () => innerHeight * 0.5, xPercent: 0, yPercent: -50, scale: 1 }, me + 0.5);
      tl.to(line, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, me + 0.6);
      tl.call(() => { if (!tl.scrollTrigger || tl.scrollTrigger.direction === 1) measureMark(); }, null, me + 0.85 + st);
      tl.set(markBig, { autoAlpha: 1 }, me + 1 + st);
      tl.set(markInline, { autoAlpha: 0 }, me + 1 + st);
      tl.fromTo(markBig, { top: () => from.top, left: () => from.left, width: () => from.width, height: () => from.height },
        { top: () => to.top, left: () => to.left, width: () => to.width, height: () => to.height, duration: 1.1, ease: "power2.in", immediateRender: false }, me + 1 + st);
      tl.to(markBig, { color: css("--site-mist-b"), ease: "power1.inOut", duration: 0.9 }, me + 1 + st);
      tl.to(film, { scale: 0.8, autoAlpha: 0, ease: "power2.in", duration: 1.1 }, me + 1 + st);
      tl.to(line, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, me + 1.6 + st);
      const qe = me + 1.9 + st, we = qe + 0.25;
      tl.to(white, { autoAlpha: 1, duration: 0.25, ease: "power2.inOut" }, qe);
      tl.to(bgLight, { opacity: 1, duration: 0.25, ease: "power2.inOut" }, qe);
      tl.to(bgHero, { autoAlpha: 0, duration: 0.25 }, qe);
      tl.to(bgWarm, { autoAlpha: 0, duration: 0.25 }, qe);
      tl.to([markBig, white], { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, we);
      if (compact) tl.to({}, { duration: tl.duration() * (420 / 3200) });
      snapAt.v = (me + 1 + st) / tl.duration();
    }, hero);
    return () => ctx.revert();
  };

  // ── Wide screen: sections over the card stage are switched on and off by the part’s progress value ──
  const mTitle = $(".sc-morph__title"), mBg = $(".sc-morph__bg"), mFilter = $(".sc-morph__filter"), mInteg = $(".sc-morph__integ"), mDark = $(".sc-morph__dark"), mForm = $(".sc-morph__form");
  const onWheel = (e) => {
    const d = e.detail, vh = innerHeight;
    gsap.set(mTitle, { autoAlpha: (1 - d.grid) * (1 - d.park), y: -d.title * vh * 0.38 });
    gsap.set(mBg, { autoAlpha: d.title });
    gsap.set(mFilter, { autoAlpha: V((d.grid - 0.55) / 0.45, 0, 1) * (1 - S(0, 0.3, d.park)) });
    gsap.set(mInteg, { autoAlpha: S(0, 0.4, d.park) * (1 - S(0, 0.2, d.scatter)) });
    gsap.set(mDark, { autoAlpha: S(0, 0.3, d.scatter) });
    gsap.set(mForm, { autoAlpha: S(0.25, 0.6, d.scatter) });
    logo.dataset.tone = d.p > 0.79 ? "light" : "dark";
    SC.setMenuHidden(d.p > 0.38 && d.p < 0.64);
  };
  const buildWide = () => {
    $("[data-integ-wide]").append(integ);
    $("[data-close-wide]").append(closeInner);
    morph.addEventListener("fx:wheel", onWheel);
    morph.addEventListener("fx:wheel-card", onWheelCard);
    morph.setAttribute("data-fx", "card-wheel-grid");
    const sts = [
      ScrollTrigger.create({ trigger: morph, start: "top 85%", onEnter: () => gsap.to(logo, { autoAlpha: 1, duration: 0.4 }), onLeaveBack: () => gsap.to(logo, { autoAlpha: 0, duration: 0.3 }) }),
    ];
    return () => {
      sts.forEach((s) => s.kill());
      morph.removeEventListener("fx:wheel", onWheel);
      morph.removeEventListener("fx:wheel-card", onWheelCard);
      morph.removeAttribute("data-fx");
      SC.setMenuHidden(false);
      gsap.set([mTitle, mBg, mFilter, mInteg, mDark, mForm, logo], { clearProps: "all" });
    };
  };
  const onWheelCard = (e) => openDetail(+e.detail.card.dataset.index, e.detail.x, e.detail.y);

  // ── Narrow-screen deck: the front card plus up to four behind are stacked staggered left and right (24px · 6° × slot, 20px upward, 5% smaller each). Drag past 56px or use the arrows to advance ──
  const deck = $(".sc-deck"), deckPin = $(".sc-deck__pin"), slots = $$(".sc-deck__slot"), nowEl = $("[data-deck-now]"), allEl = $("[data-deck-all]");
  const dk = { tag: "all", i: 0, list: slots };
  const deckScale = () => { const w = innerWidth; return w <= 380 ? 0.4 : w <= 430 ? 0.5 : w <= 560 ? 0.7 : 1; };
  const paintDeck = () => {
    const c = deckScale(), n = dk.list.length;
    slots.forEach((s) => { if (!dk.list.includes(s)) s.style.display = "none"; });
    dk.list.forEach((s, v) => {
      const x = ((v - dk.i) % n + n) % n, t = Math.min(x, 4), hide = x > 4, side = x % 2 ? 1 : -1;
      s.style.display = "";
      s.style.transform = `translate(-50%, -50%) translate(${x === 0 ? 0 : side * t * 24 * c}px, ${-t * 20 * c}px) rotate(${x === 0 ? 0 : side * t * 6 * c}deg) scale(${1 - t * 0.05})`;
      s.style.zIndex = String(n - x);
      s.style.opacity = hide ? "0" : String(1 - t * 0.04);
      s.style.visibility = hide ? "hidden" : "visible";
      s.style.pointerEvents = x === 0 ? "auto" : "none";
      s.setAttribute("aria-hidden", String(x !== 0));
      s.tabIndex = x === 0 ? 0 : -1;
    });
    nowEl.textContent = n ? String(dk.i + 1) : "0";
    allEl.textContent = String(n);
  };
  const stepDeck = (d) => { const n = dk.list.length; if (n) { dk.i = ((dk.i + d) % n + n) % n; paintDeck(); } };
  const filterDeck = (tag) => { dk.tag = tag; dk.i = 0; dk.list = slots.filter((s) => tag === "all" || s.dataset.tags.split(" ").includes(tag)); paintDeck(); };
  const drag = { on: false, x0: 0, y0: 0, t0: 0, dx: 0, dy: 0, moved: false, raf: 0, eat: false, el: null };
  const front = () => dk.list.find((s) => s.style.pointerEvents === "auto");
  const dragPaint = () => { drag.raf = 0; const c = drag.el?.querySelector(".sc-card"); if (c) { c.style.transition = "none"; c.style.transform = `translate(${drag.dx}px, ${drag.dy * 0.3}px) rotate(${drag.dx * 0.03}deg)`; } };
  const dragReset = () => { const c = drag.el?.querySelector(".sc-card"); if (c) { c.style.transition = ""; c.style.transform = ""; } };
  const onDown = (e) => { const f = front(); if (!f || !f.contains(e.target)) return; Object.assign(drag, { on: true, eat: false, el: f, x0: e.clientX, y0: e.clientY, t0: e.timeStamp, dx: 0, dy: 0, moved: false }); f.setPointerCapture?.(e.pointerId); };
  const onMove = (e) => { if (!drag.on) return; drag.dx = e.clientX - drag.x0; drag.dy = e.clientY - drag.y0; if (Math.abs(drag.dx) > 8 || Math.abs(drag.dy) > 8) drag.moved = true; if (!drag.raf) drag.raf = requestAnimationFrame(dragPaint); };
  const onUp = (e) => {
    if (!drag.on) return;
    drag.on = false;
    if (drag.raf) cancelAnimationFrame(drag.raf), (drag.raf = 0);
    if (drag.moved || e.timeStamp - drag.t0 >= 350) drag.eat = true;
    dragReset();
    if (Math.abs(drag.dx) > 56) stepDeck(drag.dx < 0 ? 1 : -1);
  };
  const onDeckClick = (e) => { const s = e.currentTarget; if (s !== front()) return; if (drag.eat) { drag.eat = false; return; } const b = s.getBoundingClientRect(); openDetail(+s.dataset.index, b.left + b.width / 2, b.top + b.height / 2); };
  const buildCompact = () => {
    $("[data-integ-compact]").append(integ);
    $("[data-close-compact]").append(closeInner);
    document.documentElement.classList.add("deck-mesh-in");
    filterDeck(dk.tag);
    const stageEl = $(".sc-deck__stage");
    stageEl.addEventListener("pointerdown", onDown);
    stageEl.addEventListener("pointermove", onMove);
    stageEl.addEventListener("pointerup", onUp);
    stageEl.addEventListener("pointercancel", onUp);
    slots.forEach((s) => s.addEventListener("click", onDeckClick));
    const arrows = $$(".sc-deck__arrow").map((a) => { const f = () => stepDeck(+a.dataset.step); a.addEventListener("click", f); return () => a.removeEventListener("click", f); });
    const ctx = gsap.context(() => {
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
        ScrollTrigger.create({ trigger: deckPin, start: "top top", end: () => "+=" + deckPin.clientHeight * 0.45, pin: deckPin, pinSpacing: true, pinType: "fixed", anticipatePin: 1, invalidateOnRefresh: true });
        const dark = $(".sc-closing__dark"), layer = $(".sc-closing__layer");
        gsap.set(dark, { autoAlpha: 0 }); gsap.set(layer, { autoAlpha: 0, y: 24 });
        gsap.timeline({ scrollTrigger: { trigger: ".sc-closing__stage", start: "top 78%", toggleActions: "play none none reverse" } })
          .to(dark, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, 0)
          .to(layer, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.22);
      }
      ScrollTrigger.create({
        trigger: ".sc-closing", start: "top 55%",
        onEnter: () => { gsap.to(logo, { autoAlpha: 1, duration: 0.4 }); logo.dataset.tone = "light"; gsap.to([bgLight, bgMesh], { autoAlpha: 0, duration: 0.4 }); },
        onLeaveBack: () => { gsap.to(logo, { autoAlpha: 0, duration: 0.3 }); logo.dataset.tone = "dark"; gsap.to([bgLight, bgMesh], { autoAlpha: 1, duration: 0.4 }); },
      });
    });
    return () => {
      ctx.revert();
      document.documentElement.classList.remove("deck-mesh-in");
      stageEl.removeEventListener("pointerdown", onDown);
      stageEl.removeEventListener("pointermove", onMove);
      stageEl.removeEventListener("pointerup", onUp);
      stageEl.removeEventListener("pointercancel", onUp);
      slots.forEach((s) => s.removeEventListener("click", onDeckClick));
      arrows.forEach((off) => off());
      gsap.set([logo, bgLight, bgMesh], { clearProps: "all" });
    };
  };

  // ── Two pick buttons (top on wide screens · bottom on narrow) driven by one value ──
  const filters = $$(".sc-filter");
  let tagNow = "all";
  const closeFilters = () => filters.forEach((f) => { $(".sc-filter__menu", f).hidden = true; $(".sc-filter__btn", f).setAttribute("aria-expanded", "false"); });
  const setTag = (tag) => {
    tagNow = tag;
    filters.forEach((f) => $$(".sc-filter__opt", f).forEach((o) => {
      const on = o.dataset.filter === tag;
      o.classList.toggle("is-active", on); o.setAttribute("aria-selected", String(on));
      if (on) $(".sc-filter__value", f).textContent = o.textContent;
    }));
    if (SC.compact()) filterDeck(tag);
    else morph.dispatchEvent(new CustomEvent("fx:wheel-filter", { detail: tag }));
  };
  filters.forEach((f) => {
    const btn = $(".sc-filter__btn", f), menu = $(".sc-filter__menu", f);
    btn.addEventListener("click", (e) => { e.stopPropagation(); const open = menu.hidden; closeFilters(); menu.hidden = !open; btn.setAttribute("aria-expanded", String(open)); });
    $$(".sc-filter__opt", f).forEach((o) => o.addEventListener("click", (e) => { e.stopPropagation(); closeFilters(); setTag(o.dataset.filter); }));
  });
  document.addEventListener("click", closeFilters);

  // ── Partner accordion: only one opens (on wide screens the open strip widens to flex 11 in .6s) ──
  $$(".sc-integ__slide").forEach((li, i, all) => $(".sc-integ__trigger", li).addEventListener("click", () => {
    all.forEach((o, k) => { o.classList.toggle("is-open", k === i); $(".sc-integ__trigger", o).setAttribute("aria-expanded", String(k === i)); });
  }));

  // ── Closing form: doesn’t really send — it only swaps to a thank-you panel ──
  $$(".sc-close__field").forEach((f) => { const inp = $("input, select", f); const up = () => f.classList.toggle("is-filled", !!inp.value); inp.addEventListener("input", up); inp.addEventListener("change", up); });
  $(".sc-close__form").addEventListener("submit", (e) => {
    e.preventDefault();
    const card = $(".sc-close__card");
    card.innerHTML = '<div class="sc-close__sent" role="status"><h3>Thank you — we’ll be in touch soon.</h3><p>One line here for the notice after sending.</p></div>';
  });

  // ── Card detail panel: from the pressed spot .2 → 1 in .55s power3.out, and on close returns to that spot with .36s power2.in ──
  const detail = $(".sc-detail"), dScroll = $(".sc-detail__scroll"), dTag = $("[data-detail-tag]"), dTitle = $("[data-detail-title]"), dNextTitle = $("[data-detail-next-title]");
  const cardsSrc = $$(".sc-morph__card");
  let dIndex = 0, dAt = { x: innerWidth / 2, y: innerHeight / 2 }, embla = null;
  const fillDetail = (i) => {
    dIndex = i;
    const src = cardsSrc[i].querySelector(".sc-card");
    dTitle.textContent = $$(".sc-card__title span", src).map((s) => s.textContent).join(" ") || $(".sc-card__title", src).textContent;
    dTag.textContent = $(".sc-card__sub", src).textContent;
    // The detail background lays that card’s gradient faintly behind the left text panel (the original also has a different background mesh per card)
    detail.style.setProperty("--detail-mesh", `linear-gradient(90deg, transparent, var(--kf-surface) 55%), ${getComputedStyle(src).getPropertyValue("--card-bg")}`);
    const nx = cardsSrc[(i + 1) % cardsSrc.length];
    dNextTitle.textContent = $$(".sc-card__title span", nx).map((s) => s.textContent).join(" ") || $(".sc-card__title", nx).textContent;
  };
  const revealDetail = () => {
    const red = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (red) return;
    gsap.fromTo($$(".sc-detail__panel--hero .sc-detail__reveal"), { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.07, ease: "power3.out", delay: 0.15, overwrite: true });
    gsap.fromTo($(".sc-detail__pop"), { scale: 0.5, rotate: -10, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.7, ease: "back.out(1.6)", delay: 0.45, overwrite: true });
    gsap.fromTo($(".sc-detail__donut-fill"), { strokeDashoffset: 314.16 }, { strokeDashoffset: 94, duration: 1.1, ease: "power2.out", delay: 0.3 });
  };
  const openDetail = (i, x, y) => {
    fillDetail(i);
    dAt = { x: x ?? innerWidth / 2, y: y ?? innerHeight / 2 };
    detail.hidden = false;
    dScroll.scrollTo({ left: 0, top: 0 });
    document.documentElement.classList.add("card-detail-open");
    SC.stop();
    if (!embla && window.EmblaCarousel) {
      embla = EmblaCarousel($(".sc-detail__embla"), { align: "center", containScroll: "trimSnaps", loop: false, skipSnaps: false });
      const dots = $(".sc-detail__dots");
      embla.scrollSnapList().forEach((_, k) => { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", `${k + 1}Step`); b.addEventListener("click", () => embla.scrollTo(k)); dots.append(b); });
      const sel = () => $$("button", dots).forEach((b, k) => b.classList.toggle("is-on", k === embla.selectedScrollSnap()));
      embla.on("select", sel); embla.on("reInit", sel); sel();
    } else embla?.reInit();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.set(detail, { autoAlpha: 1 });
    else gsap.fromTo(detail, { autoAlpha: 0, scale: 0.2, transformOrigin: `${dAt.x}px ${dAt.y}px` }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "power3.out", clearProps: "transform,transformOrigin" });
    revealDetail();
    $(".sc-detail__close").focus({ preventScroll: true });
  };
  const closeDetail = () => {
    if (detail.hidden) return;
    const done = () => { detail.hidden = true; gsap.set(detail, { clearProps: "all" }); document.documentElement.classList.remove("card-detail-open"); SC.start(); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { done(); return; }
    gsap.to(detail, { autoAlpha: 0, scale: 0.2, transformOrigin: `${dAt.x}px ${dAt.y}px`, duration: 0.36, ease: "power2.in", onComplete: done });
  };
  $(".sc-detail__close").addEventListener("click", closeDetail);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeDetail(); });
  $$("[data-detail-step]").forEach((b) => b.addEventListener("click", () => {
    const panels = $$(".sc-detail__panel"), d = +b.dataset.detailStep, x = dScroll.scrollLeft;
    let k = panels.findIndex((p) => p.offsetLeft + p.offsetWidth / 2 > x + 1);
    k = V(k + (d > 0 ? 1 : -1), 0, panels.length - 1);
    if (d < 0 && panels[k + 1] && panels[k + 1].offsetLeft > x + 1) k = V(k, 0, panels.length - 1);
    dScroll.scrollTo({ left: panels[k].offsetLeft, behavior: "smooth" });
  }));
  $("[data-detail-next]").addEventListener("click", () => {
    fillDetail((dIndex + 1) % cardsSrc.length);
    dScroll.scrollTo({ left: 0, top: 0 });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) gsap.fromTo(dScroll, { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.42, ease: "power3.out", overwrite: true });
    revealDetail();
  });

  // ── Menu item → section position (on wide screens it belongs to the card stage panel, on narrow screens the top of the section) ──
  SC.go = (go) => {
    const cat = ["all", "pay", "ai", "firm", "grow"].includes(go) ? go : null;
    if (cat) setTag(cat);
    if (SC.compact()) {
      const el = go === "contact" ? $(".sc-closing") : go === "integ" ? $(".sc-integ") : deckPin;
      const y = el.getBoundingClientRect().top + scrollY;
      SC.lenis.scrollTo(y, { immediate: true });
      ScrollTrigger.update();
      return;
    }
    const frac = go === "contact" ? 0.97 : go === "integ" ? 0.7 : 0.53;
    morph.fxWheel?.scrollToFrac(frac, { immediate: true, force: true });
    ScrollTrigger.update();
  };

  // ── Rebuilds only that panel each time wide/narrow screens switch (the original also redraws everything by swapping the panel name) ──
  const mm = gsap.matchMedia();
  mm.add({ any: "all", compact: SC.COMPACT, reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { compact, reduce } = ctx.conditions;
    const offs = [];
    // Reduced motion: the card stage stands as a grid only, and the partner and closing forms go in the flow below the stage, one after another (the original draws them separately too)
    if (reduce && !compact) {
      document.documentElement.classList.add("sc-reduce");
      offs.push(() => document.documentElement.classList.remove("sc-reduce"));
      offs.push(buildWide());
      $("[data-integ-compact]").append(integ);
      $("[data-close-compact]").append(closeInner);
      sizeCanvas(); drawFrame(FRAMES - 1);
      gsap.set([lockup, bottom], { autoAlpha: 1 });
      gsap.set(bgLight, { opacity: 1 });
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => offs.reverse().forEach((off) => off());
    }
    if (reduce) {
      sizeCanvas(); drawFrame(FRAMES - 1);
      gsap.set([lockup, bottom], { autoAlpha: 1 });
      gsap.set(bgLight, { opacity: 1 });
    } else offs.push(buildHero(compact));
    offs.push(compact ? buildCompact() : buildWide());
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => offs.reverse().forEach((off) => off());
  });
  let rt = 0, lastW = innerWidth;
  addEventListener("resize", () => { if (SC.compact() && innerWidth === lastW) return; lastW = innerWidth; clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 200); });
  addEventListener("sc:ready", () => lockup.classList.add("is-lit"));
})();
