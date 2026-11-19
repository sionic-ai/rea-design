// Layered photo slider: one progress value (section index) crossfades the backgrounds by distance, and the titles are spaced around the center at a gap of “the larger of half the screen width or the longest title + 40px”,
// lines up beside and slides together (only the center is strong, sides .4), and the image in the center window shifts sideways by the window width each time. When the 5s progress line fills, next slide (1s) — layered image slider
(() => {
  kfFx.register("layered-title-slider", (root, { options, reduce }) => {
    const all = (p) => [...root.querySelectorAll(`[data-fx-part="${p}"]`)];
    const one = (p) => root.querySelector(`[data-fx-part="${p}"]`);
    const titles = all("title");
    if (!titles.length) return;
    const bgs = all("bg"), masks = all("mask-item"), frame = one("mask"), fill = one("fill");
    const cur = one("current"), total = one("total"), prev = one("prev"), next = one("next");
    const n = titles.length, auto = +(options.auto ?? 5), dur = reduce ? 0 : +(options.dur ?? 1);
    const ease = kfFx.ease(options.ease || "0.625,0.05,0,1", "power3.inOut");
    const gap = +(options.gap ?? 0.5), space = +(options.space ?? 40);
    const wrap = (d) => d - n * Math.round(d / n);
    const clamp = gsap.utils.clamp(0, 1);
    if (total) total.textContent = String(n).padStart(2, "0");
    let step = 0, mstep = 0, active = -1, at = 0, hovering = 0;
    const measure = () => {
      step = Math.max(root.clientWidth * gap, Math.max(...titles.map((t) => t.offsetWidth)) + space);
      mstep = frame ? frame.clientWidth : root.clientWidth;
    };
    const state = { p: 0 };
    const render = (p) => {
      const c = ((Math.round(p) % n) + n) % n;
      for (let i = 0; i < n; i++) {
        const off = wrap(i - p), d = Math.abs(off);
        if (bgs[i]) gsap.set(bgs[i], { opacity: clamp(1 - d), zIndex: Math.round(clamp(1 - d) * 100) });
        gsap.set(titles[i], { x: off * step, opacity: i === c ? 1 : 0.4 });
        if (masks[i]) gsap.set(masks[i], { x: off * mstep });
      }
      if (c !== active) {
        [bgs, titles, masks].forEach((l) => { l[active]?.removeAttribute("data-active"); l[c]?.setAttribute("data-active", ""); });
        active = c;
        if (cur) cur.textContent = String(c + 1).padStart(2, "0");
      }
    };
    let slide = null;
    const autoTw = auto > 0 && !reduce && fill
      ? gsap.fromTo(fill, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: auto, ease: "none", paused: true, onComplete: () => go(1) })
      : null;
    const restart = () => { if (!autoTw) return; autoTw.restart(); if (hovering) autoTw.pause(); };
    function go(d) {
      at += d;
      slide?.kill();
      slide = gsap.to(state, { p: at, duration: dur, ease, onUpdate: () => render(state.p) });
      restart();
    }
    const goIndex = (i) => { const d = wrap(i - at); if (d) go(d); };
    const ac = new AbortController(), on = { signal: ac.signal };
    prev?.addEventListener("click", () => go(-1), on);
    next?.addEventListener("click", () => go(1), on);
    titles.forEach((t, i) => t.addEventListener("click", (e) => { if (i === active) return; e.preventDefault(); goIndex(i); }, on));
    // Auto-advance pauses only while the pointer is over it (title, buttons, links)
    new Set([...titles, ...root.querySelectorAll("a, button")]).forEach((el) => {
      el.addEventListener("pointerenter", () => { hovering++; autoTw?.pause(); }, on);
      el.addEventListener("pointerleave", () => { hovering = Math.max(0, hovering - 1); if (!hovering) autoTw?.resume(); }, on);
    });
    // Swiping over 25px horizontally turns one page — vertical swipes are left to the page scroll
    let sx = null, sy = 0, used = false;
    root.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; used = false; }, on);
    root.addEventListener("pointermove", (e) => {
      if (sx == null || used) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 25 && Math.abs(dx) > Math.abs(dy)) { used = true; go(dx < 0 ? 1 : -1); }
    }, on);
    addEventListener("pointerup", () => (sx = null), on);
    const ro = new ResizeObserver(() => { measure(); render(state.p); });
    ro.observe(root);
    document.fonts?.ready.then(() => { measure(); render(state.p); });
    measure(); render(0); restart();
    return () => { ac.abort(); ro.disconnect(); slide?.kill(); autoTw?.kill(); gsap.set([...titles, ...bgs, ...masks], { clearProps: "transform,opacity,zIndex" }); };
  });
})();
