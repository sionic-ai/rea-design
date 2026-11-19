(() => {
  // While passing through a long panel (element), the inner stage (data-fx-part="stage") pins to the screen, and the card (data-fx-part="card") items are driven along a single scroll line.
  //   0 ~ .1            the card is hidden off the bottom left of the screen (wheel −6.5 cells)
  //   .1 ~ .16          the wheel rolls in with power2.out and the first card stands at the top
  //   .16 ~ .78         the wheel turns one notch (13°) at a time, raising the cards to the top in turn
  //   .78 ~ 1           cards settle from the wheel position to the grid position with smoothstep       (up to here is the whole panel’s wheel-end, default .47)
  //   park-start ~ next  turning park on gathers the cards into a pile (.42x) in the bottom-right corner — meanwhile another section (e.g. the integration intro) is staged
  //   scatter-start ~ 1  the pile scatters in turn to fourteen spots at the screen edge (.5x) — the card rain behind the closing form
  // The consumer side uses the fx:wheel event arriving on el (detail: p·wheel·title·grid·park·scatter) to match the opacity of the title, filter and other sections
  const V = (v, a, b) => Math.max(a, Math.min(b, v));
  const L = (a, b, t) => a + (b - a) * t;
  const S = (a, b, v) => { const t = V((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const SPREAD = [[0.28, 0.05], [0.5, 0.02], [0.72, 0.06], [1, 0.26], [1.03, 0.55], [0.98, 0.82], [0.72, 0.97], [0.45, 1], [0.18, 0.98], [0.02, 0.3], [-0.02, 0.6], [0, 0.84], [0.52, 0.42], [0.5, 0.7]];

  kfFx.register("card-wheel-grid", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]');
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!stage || !cards.length || !window.gsap || !window.ScrollTrigger) return;
    const parkEl = el.querySelector('[data-fx-part="park"]');
    const n = cards.length;
    const step = +(options.step ?? 13), radius = +(options.radius ?? 0.9), bow = +(options.bow ?? 0.96), drop = +(options.drop ?? 0.06);
    const from = +(options.from ?? -6.5), edge = +(options.edge ?? 15), edgeScale = +(options["edge-scale"] ?? 0.95);
    const park = options.park === "1" || options.park === "true";
    const wheelEnd = +(options["wheel-end"] ?? (park ? 0.47 : 1));
    const parkStart = +(options["park-start"] ?? 0.59), scatterStart = +(options["scatter-start"] ?? 0.79);
    const parkScale = +(options["park-scale"] ?? 0.42), scatterScale = +(options["scatter-scale"] ?? 0.5);
    const maxW = +(options.max ?? 2560);
    const scrub = +(options.scrub ?? 0.6);
    const zn = 0.1, vr = 0.06, qt = zn + vr, sn = 0.78;
    const easeIn = gsap.parseEase("power2.out");
    const touch = matchMedia("(max-width: 1023.98px), (pointer: coarse)").matches;
    const set = cards.map((c) => gsap.quickSetter(c, "css"));
    const box = { vw: 0, vh: 0, gw: 0, R: 0, slots: [], rank: {} };
    let tag = "all", hovered = null, last = 0, seen = false, auto = false, st = null;
    const fan = { v: 0 };

    const has = (c) => tag === "all" || (c.getAttribute("data-tags") || "").split(/\s+/).includes(tag);
    // Original grid: 1280 and up six columns (seven if over 12 items), 1000 and up five, 720 and up four — card width .16 · height width/.75, gap between cells .016, row gap double that, up to 1.3×
    const cols = (count, w) => {
      const c = w >= 1280 ? 6 : w >= 1000 ? 5 : w >= 720 ? 4 : w >= 500 ? 3 : 2;
      return count > 12 && w >= 1280 ? Math.min(7, Math.ceil(count / 2)) : Math.min(c, Math.max(1, count));
    };
    const layout = (count) => {
      const gw = box.gw, vh = box.vh, cw = gw * 0.16, ch = cw / 0.75, c = cols(count, gw), rows = Math.max(1, Math.ceil(count / c));
      const gap = gw * 0.016, rgap = gap * 2, top = reduce ? vh * 0.14 : 0;
      const sx = (gw * 0.94 - gap * (c - 1)) / c, sy = (vh * 0.82 - top - rgap * (rows - 1)) / rows;
      const k = Math.min(sx / cw, sy / ch, 1.3), w = cw * k, h = ch * k, total = rows * h + rgap * (rows - 1);
      const out = [];
      for (let i = 0; i < count; i++) {
        const r = Math.floor(i / c), inRow = Math.min(c, count - r * c), col = i - r * c, rowW = inRow * w + gap * (inRow - 1);
        out.push({ x: -rowW / 2 + w / 2 + col * (w + gap), y: -total / 2 + h / 2 + r * (h + rgap) + vh * 0.03 + top / 2, scale: k });
      }
      return out;
    };
    const relayoutSlots = () => {
      const keep = cards.map((c, i) => i).filter((i) => has(cards[i]));
      box.rank = {};
      keep.forEach((i, r) => (box.rank[i] = r));
      box.slots = layout(keep.length);
    };
    const measure = () => {
      box.vw = innerWidth; box.vh = innerHeight; box.gw = Math.min(box.vw, maxW); box.R = box.vh * radius;
      relayoutSlots();
    };
    const gridOf = (i) => {
      if (!has(cards[i])) return { x: 0, y: 0, rotation: 0, scale: 0.6, alpha: 0 };
      const s = box.slots[box.rank[i]] || { x: 0, y: 0, scale: 1 };
      return { x: s.x, y: s.y, rotation: 0, scale: s.scale, alpha: 1 };
    };
    // Corner pile: offset from stage center by .45 horizontally and .5 vertically — each sheet shifts .8px and alternates ±3°
    const pileOf = (i) => { const o = i - n / 2; return { x: box.gw * 0.45 + o * 0.8, y: box.vh * 0.5 + o * 0.8, rotation: (i % 2 ? -1 : 1) * 3 }; };

    const update = (p, force = false) => {
      const dirty = force || !seen || p !== last;
      seen = true; last = p;
      const re = V(p / wheelEnd, 0, 1);
      const pk = park ? V((p - parkStart) / (scatterStart - parkStart), 0, 1) : 0;
      const sc = park ? V((p - scatterStart) / (1 - scatterStart), 0, 1) : 0;
      const pile = V(pk / 0.3, 0, 1);
      let idx;
      if (re < zn) idx = from;
      else if (re < qt) idx = L(from, 0, easeIn(V((re - zn) / vr, 0, 1)));
      else idx = V((re - qt) / (sn - qt), 0, 1) * (n - 1);
      const grid = S(sn, 1, re);
      const apex = re >= qt && pk === 0 ? V(Math.round(idx), 0, n - 1) : -1;
      cards.forEach((c, i) => {
        if (dirty) {
          gsap.killTweensOf(c);
          const deg = (idx - i) * step, rad = (deg * Math.PI) / 180, k = 1 - S(0, edge, Math.abs(deg));
          const g = gridOf(i);
          let x = L(Math.sin(rad) * box.R, g.x, grid);
          let y = L((1 - Math.cos(rad)) * box.R * bow + box.vh * drop, g.y, grid);
          let r = L(deg, g.rotation, grid), s = L(L(edgeScale, 1, k), g.scale, grid), a = L(1, g.alpha, grid);
          if (pile > 0) {
            const q = pileOf(i);
            x = L(x, q.x, pile); y = L(y, q.y, pile); r = L(r, q.rotation, pile); s = L(s, parkScale, pile); a = L(a, 1, pile);
            const spread = fan.v * pile * (1 - sc);
            if (spread > 0) { const t = n > 1 ? i / (n - 1) : 0; x -= t * box.vw * 0.22 * spread; r -= t * 24 * spread; }
          }
          if (sc > 0) {
            const lag = n > 1 ? (i / (n - 1)) * 0.2 : 0, t = V((sc - lag) / 0.45, 0, 1), [fx, fy] = SPREAD[i % SPREAD.length];
            x = L(x, (fx - 0.5) * box.vw, t); y = L(y, (fy - 0.5) * box.vh, t); r = L(r, 0, t); s = L(s, scatterScale, t); a = 1;
          }
          set[i]({ x, y, xPercent: -50, yPercent: -50, rotation: r, scale: s, autoAlpha: a, pointerEvents: sc > 0 || auto ? "none" : "auto" });
        }
        const lifted = grid > 0.5 && pile === 0;
        c.style.zIndex = String(lifted && hovered === c ? 60 + n : pile > 0 ? 60 + i : 60 + (n - 1 - i));
        const on = grid < 0.5 && pk === 0 && i === apex;
        c.toggleAttribute("data-apex", on);
        c.toggleAttribute("data-focus", on && !hovered);
      });
      if (parkEl) parkEl.style.pointerEvents = pile > 0 && sc === 0 ? "auto" : "none";
      el.dispatchEvent(new CustomEvent("fx:wheel", { detail: { p, wheel: re, title: S(zn, qt, re), grid, park: pk, scatter: sc } }));
    };

    const scrollToFrac = (f, opts = {}) => {
      if (!st) return;
      const y = st.start + V(f, 0, 1) * (st.end - st.start);
      if (window.lenis?.scrollTo) window.lenis.scrollTo(y, opts);
      else window.scrollTo({ top: y, behavior: opts.immediate ? "auto" : "smooth" });
    };
    const toGrid = () => { tag = "all"; relayoutSlots(); scrollToFrac(wheelEnd); };
    const refilter = (e) => {
      tag = e.detail || "all";
      relayoutSlots();
      if (S(sn, 1, V(last / wheelEnd, 0, 1)) > 0.5) {
        cards.forEach((c, i) => {
          const g = gridOf(i);
          gsap.to(c, { x: g.x, y: g.y, rotation: g.rotation, scale: g.scale, autoAlpha: g.alpha, duration: reduce ? 0 : 0.7, ease: "back.out(2.2)", delay: reduce ? 0 : (box.rank[i] || 0) * 0.03 });
        });
      } else update(last, true);
    };
    const jump = (e) => scrollToFrac(+(e.detail?.frac ?? 0), e.detail || {});
    const onEnter = (e) => { hovered = e.currentTarget; update(last); };
    const onLeave = (e) => { const c = e.currentTarget; setTimeout(() => { if (hovered === c) { hovered = null; update(last); } }, 90); };
    const onClick = (e) => {
      if (park && last >= scatterStart) return;
      if (park && last >= parkStart) { toGrid(); return; }
      el.dispatchEvent(new CustomEvent("fx:wheel-card", { detail: { card: e.currentTarget, x: e.clientX, y: e.clientY } }));
    };
    const fanTo = (v) => gsap.to(fan, { v, duration: 0.4, ease: "power2.out", overwrite: true, onUpdate: () => update(last, true) });
    const parkIn = () => fanTo(1), parkOut = () => fanTo(0);

    cards.forEach((c) => { c.addEventListener("pointerenter", onEnter); c.addEventListener("pointerleave", onLeave); c.addEventListener("click", onClick); });
    parkEl?.addEventListener("pointerenter", parkIn);
    parkEl?.addEventListener("pointerleave", parkOut);
    parkEl?.addEventListener("click", toGrid);
    el.addEventListener("fx:wheel-filter", refilter);
    el.addEventListener("fx:wheel-jump", jump);

    measure();
    let onResize = null;
    if (reduce) {
      update(wheelEnd, true);
      let t = 0;
      onResize = () => { clearTimeout(t); t = setTimeout(() => { measure(); update(wheelEnd, true); }, 150); };
      addEventListener("resize", onResize);
    } else {
      // Scroll position snaps to wheel and grid boundaries — the rolling-in front (.06, .16 × end) and just before the grid (.78, 1 × end), free in between
      const a = qt * wheelEnd, b = sn * wheelEnd, z = vr * wheelEnd;
      st = ScrollTrigger.create({
        trigger: el, scroller, start: "top top", end: "bottom bottom",
        pin: stage, pinType: touch ? "fixed" : "transform", scrub, anticipatePin: 1,
        snap: { snapTo: (v) => (v < a ? (v < (z + a) / 2 ? z : a) : v <= b ? v : v <= wheelEnd ? (v < (b + wheelEnd) / 2 ? b : wheelEnd) : v), duration: { min: 0.15, max: 0.5 }, delay: 0.05, ease: "power1.inOut" },
        invalidateOnRefresh: true,
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => { measure(); update(self.progress, true); },
      });
      update(0, true);
    }
    el.fxWheel = { toGrid, scrollToFrac, setAuto: (v) => { auto = v; update(last, true); } };

    return () => {
      st?.kill(true);
      if (onResize) removeEventListener("resize", onResize);
      gsap.killTweensOf(fan);
      cards.forEach((c) => {
        gsap.killTweensOf(c);
        c.removeEventListener("pointerenter", onEnter); c.removeEventListener("pointerleave", onLeave); c.removeEventListener("click", onClick);
        c.removeAttribute("data-apex"); c.removeAttribute("data-focus");
        gsap.set(c, { clearProps: "transform,opacity,visibility,zIndex,pointerEvents" });
      });
      parkEl?.removeEventListener("pointerenter", parkIn);
      parkEl?.removeEventListener("pointerleave", parkOut);
      parkEl?.removeEventListener("click", toGrid);
      el.removeEventListener("fx:wheel-filter", refilter);
      el.removeEventListener("fx:wheel-jump", jump);
      delete el.fxWheel;
    };
  });
})();
