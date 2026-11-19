// N work cards on a single-line orbit (x = sin for card width, cos for depth) and rotates that line on the plate at 15° per second — the farther back, the .2× scale, blur and darkness.
// Tapping a list row turns that card the shortest way to stand in front (.7s), then it widens to fit the panel while the photo, cropped 25% top and bottom, unfolds (.75s),
// The name tag rises letter by letter. The chosen card tilts up to 14° following the cursor — Brand Featured Projects (original orbit-tiles.js)
(() => {
  kfFx.register("orbit-pick-cards", (el, { options, reduce, hover, scroller }) => {
    const ring = el.querySelector('[data-fx-part="ring"]');
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!ring || items.length < 2) return;
    gsap.registerPlugin(ScrollTrigger);
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const picks = [...el.querySelectorAll('[data-fx-part="pick"]')];
    const desc = el.querySelector('[data-fx-part="desc"]');
    const n = items.length;
    const ease = kfFx.ease(options.ease || "0.625,0.05,0,1", "power3.inOut");
    const spin = +(options.spin ?? 15), minScale = +(options.min ?? 0.2), blurMax = +(options.blur ?? 0.04), dim = +(options.dim ?? 0.3);
    const maxTilt = +(options.tilt ?? 14), round = options.radius || "0.65em";
    const hidden = `inset(25% 0% 25% 0% round ${round})`;
    const cardOf = (i) => items[i]?.querySelector('[data-fx-part="card"]');
    const mediaOf = (i) => items[i]?.querySelector('[data-fx-part="media"]');
    const partOf = (i, p) => items[i]?.querySelector(`[data-fx-part="${p}"]`);

    const pos = { value: 0 };
    let turn = 0, live = false, active = null, busy = false, w = 0, seen = false;
    const natural = new Map();
    items.forEach((it, i) => {
      const m = mediaOf(i);
      if (m) gsap.set(m, { clipPath: hidden });
      const labels = [partOf(i, "title"), partOf(i, "cta")].filter(Boolean);
      if (labels.length) gsap.set(labels, { autoAlpha: 0, yPercent: 115 });
    });
    if (desc) gsap.set(desc, { opacity: 0 });
    const measure = () => { w = Math.max(...items.map((it) => it.offsetWidth)); };
    measure();

    function render() {
      const k = ((Math.round(pos.value) % n) + n) % n;
      items.forEach((it, i) => it.setAttribute("data-status", i === k ? "active" : "rest"));
      gsap.set(ring, { rotation: turn });
      items.forEach((it, i) => {
        const p = ((i - pos.value) / n) * Math.PI * 2, m = Math.pow((Math.cos(p) + 1) / 2, 1.3);
        gsap.set(it, {
          x: Math.sin(p) * w, y: 0,
          scale: gsap.utils.interpolate(minScale, 1, m),
          filter: `blur(${gsap.utils.interpolate(w * blurMax, 0, m)}px) brightness(${gsap.utils.interpolate(dim, 1, m)})`,
          zIndex: Math.round(m * 1000), rotation: -turn,
        });
      });
    }
    const tick = (t, dt) => { if (live) { turn = (turn + spin * (dt / 1000)) % 360; render(); } };

    // Width of the chosen card — the smaller of .48 of the panel width (.42 if narrow) and 2/3 of the panel height minus top and bottom margins
    function wide() {
      const r = stage.getBoundingClientRect(), narrow = innerWidth <= 900;
      return Math.min(r.width * (narrow ? 0.42 : 0.48), Math.max(160, ((r.height || innerHeight) - (narrow ? 96 : 192)) * (2 / 3)));
    }
    function reveal(i, v) {
      const card = cardOf(i), m = mediaOf(i);
      if (!card || !m) return;
      const inset = (card.offsetHeight || 0) * 0.25 * (1 - v);
      gsap.set(m, { clipPath: `inset(${inset <= 0.5 ? 0 : inset}px 0px ${inset <= 0.5 ? 0 : inset}px 0px round ${round})` });
    }
    function grow(i, done) {
      const card = cardOf(i);
      if (!card) return done?.();
      if (!natural.has(card)) natural.set(card, card.offsetWidth);
      const to = wide(), st = { v: 0, w: card.offsetWidth }, from = w;
      if (reduce) { gsap.set(card, { width: to }); w = Math.max(from, to); reveal(i, 1); return done?.(); }
      gsap.to(st, { v: 1, w: to, duration: 0.75, ease, onUpdate() { gsap.set(card, { width: st.w }); w = Math.max(from, st.w); reveal(i, st.v); }, onComplete: done });
    }
    function shrink(i) {
      const card = cardOf(i), back = natural.get(card);
      if (!card) return;
      const st = { v: 1, w: card.offsetWidth };
      gsap.to(st, { v: 0, w: back ?? st.w, duration: reduce ? 0 : 0.55, ease, onUpdate() { gsap.set(card, { width: st.w }); reveal(i, st.v); }, onComplete() { gsap.set(card, { clearProps: "width" }); measure(); const m = mediaOf(i); if (m) gsap.set(m, { clipPath: hidden }); } });
    }

    let split = null;
    function labelsIn(i, done) {
      const title = partOf(i, "title"), cta = partOf(i, "cta");
      if (!title) return done?.();
      const text = title.querySelector("span") || title;
      split?.revert();
      split = window.SplitText ? new SplitText(text, { type: "chars", mask: "chars" }) : null;
      const chars = split?.chars.length ? split.chars : [text];
      if (reduce) { gsap.set([title, cta].filter(Boolean), { autoAlpha: 1, yPercent: 0 }); return done?.(); }
      gsap.set(chars, { autoAlpha: 0, yPercent: 120 });
      const tl = gsap.timeline({ defaults: { ease }, onComplete: done })
        .to(title, { autoAlpha: 1, yPercent: 0, duration: 0.72, overwrite: true }, 0)
        .to(chars, { autoAlpha: 1, yPercent: 0, duration: 0.68, stagger: 0.018 }, 0.12);
      if (cta) tl.to(cta, { autoAlpha: 1, yPercent: 0, duration: 0.58, overwrite: true }, 0.7);
    }
    function labelsOut() {
      const all = items.flatMap((_, i) => [partOf(i, "title"), partOf(i, "cta")]).filter(Boolean);
      if (all.length) gsap.to(all, { autoAlpha: 0, yPercent: 115, duration: reduce ? 0 : 0.28, ease: "power2.in", overwrite: true });
    }
    let descSplit = null;
    function descIn(i) {
      if (!desc) return;
      desc.textContent = items[i].dataset.desc || "";
      descSplit?.revert();
      if (reduce || !window.SplitText) { gsap.set(desc, { opacity: 1 }); return; }
      descSplit = new SplitText(desc, { type: "lines", mask: "lines" });
      const lines = descSplit.lines;
      gsap.set(lines, { y: (k) => Math.ceil(lines[k].getBoundingClientRect().height) + 2 });
      gsap.set(desc, { opacity: 1 });
      gsap.to(lines, { y: 0, duration: 0.7, ease, stagger: 0.08 });
    }
    function descOut(then) {
      if (!desc) return then();
      gsap.to(desc, { opacity: 0, duration: reduce ? 0 : 0.2, ease: "power2.in", onComplete: then });
    }

    // Tilt following the cursor — the offset from the chosen card center to the cursor (divided by half card width and height) clamped to −1~1, max 14°
    let tilt = null, mx = innerWidth / 2, my = innerHeight / 2;
    function tiltOn(i) {
      if (!hover || reduce) return;
      const t = partOf(i, "tilt");
      if (!t) return;
      tiltOff(false);
      gsap.set(t, { rotationX: 0, rotationY: 0, transformPerspective: innerWidth * 0.5, transformStyle: "preserve-3d" });
      tilt = { t, rect: t.getBoundingClientRect() };
      aim();
    }
    function tiltOff(soft = true) {
      if (!tilt) return;
      const t = tilt.t;
      tilt = null;
      gsap.to(t, { rotationX: 0, rotationY: 0, duration: soft ? 0.35 : 0, ease: "power3.out", overwrite: true });
    }
    function aim() {
      if (!tilt) return;
      const r = tilt.rect, cx = r.left + r.width / 2, cy = r.top + r.height / 2, c = gsap.utils.clamp(-1, 1);
      gsap.to(tilt.t, { rotationX: -c((my - cy) / (r.height / 2 || 1)) * maxTilt, rotationY: c((mx - cx) / (r.width / 2 || 1)) * maxTilt, duration: 0.65, ease: "power3.out", overwrite: true });
    }
    const onMove = (e) => { mx = e.clientX; my = e.clientY; aim(); };
    const onScroll = () => { if (tilt) { tilt.rect = tilt.t.getBoundingClientRect(); aim(); } };

    // Toward the nearest one — 4 → 0 moves one step forward
    const nearest = (t) => { const d = (((t - pos.value) % n) + n) % n; return d < n / 2 ? pos.value + d : pos.value - (n - d); };
    function select(i) {
      if (busy || active === i) return;
      busy = true;
      tiltOff(); labelsOut();
      const prev = active;
      if (prev !== null) { shrink(prev); descOut(() => descIn(i)); } else descIn(i);
      active = i;
      picks.forEach((p, k) => p.setAttribute("data-active", k === i ? "true" : "false"));
      const after = () => grow(i, () => { if (active !== i) return; tiltOn(i); labelsIn(i, () => { if (active === i) busy = false; }); });
      if (reduce) { pos.value = i; render(); after(); return; }
      gsap.to(pos, { value: nearest(i), duration: 0.7, ease, onUpdate: render, onComplete: after });
    }

    const open = (e) => {
      e.preventDefault();
      const i = active ?? 0, href = items[i]?.dataset.href || cardOf(i)?.getAttribute("href");
      if (!href) return;
      const ev = new CustomEvent("fx:open", { bubbles: true, cancelable: true, detail: { href, index: i } });
      if (el.dispatchEvent(ev)) location.assign(href);
    };
    const pickers = picks.map((p, k) => { const f = (e) => { e.preventDefault(); select(k); }; p.addEventListener("click", f); return [p, f]; });
    stage.addEventListener("click", open);

    // List row hover: the cell slides in from the side the cursor entered (top or bottom) and slides out toward the side it left
    const side = (e, row) => { const r = row.getBoundingClientRect(); return e.clientY - r.top < r.height / 2 ? -1 : 1; };
    const tiles = picks.map((row) => {
      const tile = row.querySelector('[data-fx-part="tile"]');
      if (!tile || !hover) return null;
      const enter = (e) => { tile.style.transition = "none"; tile.style.transform = `translateY(${side(e, row) * 100}%)`; void tile.offsetHeight; tile.style.transition = ""; tile.style.transform = "translateY(0%)"; };
      const leave = (e) => { tile.style.transform = `translateY(${side(e, row) * 110}%)`; };
      row.addEventListener("mouseenter", enter); row.addEventListener("mouseleave", leave);
      return () => { row.removeEventListener("mouseenter", enter); row.removeEventListener("mouseleave", leave); tile.style.transform = ""; };
    });

    if (hover) { document.addEventListener("pointermove", onMove, { passive: true }); addEventListener("scroll", onScroll, { passive: true }); }
    const ro = new ResizeObserver(() => { if (active === null) measure(); render(); if (active !== null && !busy) { const c = cardOf(active); if (c) { gsap.set(c, { width: wide() }); w = Math.max(w, c.offsetWidth); reveal(active, 1); } } });
    ro.observe(el);
    render();
    if (!reduce) gsap.ticker.add(tick);
    const st = ScrollTrigger.create({
      trigger: el, scroller, start: "top bottom", end: "bottom top",
      onToggle: (s) => { live = s.isActive; if (s.isActive && !seen) { seen = true; select(+(options.start ?? 0)); } },
    });

    return () => {
      gsap.ticker.remove(tick); st.kill(); ro.disconnect();
      pickers.forEach(([p, f]) => p.removeEventListener("click", f));
      stage.removeEventListener("click", open);
      tiles.forEach((f) => f?.());
      document.removeEventListener("pointermove", onMove); removeEventListener("scroll", onScroll);
      split?.revert(); descSplit?.revert();
      gsap.killTweensOf([pos, ring, ...items]);
      gsap.set([ring, ...items], { clearProps: "all" });
      items.forEach((_, i) => { const m = mediaOf(i), c = cardOf(i); if (m) gsap.set(m, { clearProps: "clipPath" }); if (c) gsap.set(c, { clearProps: "width" }); });
    };
  });
})();
