// Cursor-pushed elastic band: a card band overflowing horizontally is pushed to match the cursor’s horizontal position, relative to where it entered (.4s power3) — the remaining distance is divided across the remaining screen so the end-to-end cards reach each side.
// Cards split into three groups, lag behind by the pushed distance, then follow with elastic at 1·1.3·1.6s, and also tilt by pushed distance ÷ 10, settling at 2·1.7·1.4s — a template row from a template site
(() => {
  const clamp = (a, b, v) => Math.min(Math.max(v, a), b);
  kfFx.register("pan-elastic-strip", (el, { options, reduce, hover }) => {
    const row = el.querySelector('[data-fx-part="row"]');
    const cards = row ? [...row.querySelectorAll('[data-fx-part="card"]')] : [];
    if (!row || !cards.length || reduce || !hover) return;
    el.classList.add("is-fx-pan");
    const lags = [1, 1.3, 1.6], turns = [2, 1.7, 1.4];
    const byLag = [[], [], []], byTurn = [[], [], []];
    cards.forEach((c, i) => { byLag[i % 3].push(c); byTurn[Math.floor(Math.random() * 3)].push(c); });
    let w = 0, over = 0, at = 0, anchor = null, raf = 0, nx = null, settle = 0, inside = false, moved = false;
    const go = gsap.quickTo(row, "x", { duration: +(options.dur ?? 0.4), ease: kfFx.ease(options.ease || "power3", "power3") });
    const lag = byLag.map((g, n) => (g.length ? gsap.quickTo(g, "x", { duration: lags[n], ease: "elastic" }) : () => {}));
    const turn = byTurn.map((g, n) => (g.length ? gsap.quickTo(g, "rotation", { duration: turns[n], ease: "elastic" }) : () => {}));
    const measure = () => { w = el.clientWidth; over = Math.max(0, row.scrollWidth - w); };
    const centre = () => { at = over > 0 ? -over / 2 : 0; gsap.set(row, { x: at }); };
    const aim = (x) => {
      if (w <= 0 || over <= 0) return 0;
      const i = clamp(0, w, x), o = clamp(0, w, anchor.x), a = clamp(-over, 0, anchor.at), s = over / w;
      let c;
      if (i >= o) { const e = w - o, r = over + a; c = a - (i - o) * (e > 0 ? Math.max(s, r / e) : s); }
      else { const e = -a, t = o > 0 ? Math.max(s, e / o) : s; c = a + (o - i) * t; }
      return clamp(-over, 0, c);
    };
    const step = () => {
      raf = 0;
      if (nx === null) return;
      const x = nx - el.getBoundingClientRect().left; nx = null;
      if (!anchor) anchor = { x, at };
      const t = aim(x);
      if (t === at) return;
      moved = true;
      const d = at - t;
      go(t); lag.forEach((f) => f(d)); turn.forEach((f) => f(d / 10));
      at = t;
      clearTimeout(settle);
      settle = setTimeout(() => { if (!inside) return; turn.forEach((f) => f(0)); lag.forEach((f) => f(0)); }, 120);
    };
    const move = (e) => { nx = e.clientX; if (!raf) raf = requestAnimationFrame(step); };
    const enter = (e) => { inside = true; clearTimeout(settle); anchor = { x: e.clientX - el.getBoundingClientRect().left, at }; };
    const leave = () => { inside = false; anchor = null; turn.forEach((f) => f(0)); lag.forEach((f) => f(0)); };
    const fit = () => { measure(); if (!moved) centre(); else go(at = clamp(-over, 0, at)); anchor = null; };
    const ro = new ResizeObserver(fit);
    ro.observe(row); ro.observe(el);
    measure(); centre();
    el.addEventListener("mousemove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      clearTimeout(settle); cancelAnimationFrame(raf); ro.disconnect();
      el.removeEventListener("mousemove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.classList.remove("is-fx-pan");
      gsap.killTweensOf([row, ...cards]);
      gsap.set([row, ...cards], { clearProps: "transform" });
    };
  });
})();
