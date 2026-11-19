// On a tall section, intercepts the wheel and pushes the progress value directly — the target is drawn to pause stops, and the progress follows the target each frame (original STICKY_CONFIG values)
(() => {
  const list = (s, d) => String(s ?? d).split(",").map(Number).filter((n) => !Number.isNaN(n));
  kfFx.register("wheel-stage-scroll", (el, { options, reduce, hover }) => {
    const L = +(options.length ?? 2640);
    if (!(L > 0)) return;
    const stops = [0, ...list(options.stops, "0.076,0.167,0.242,0.545,0.621,0.697,0.773").map((f) => f * L), L].sort((a, b) => a - b);
    const pauses = list(options.pauses, "0.167,0.242").map((f) => ({ p: f * L, s: "idle" }));
    const hold = +(options.pause ?? 500), commit = Math.min(Math.max(+(options.commit ?? 0.3), 0.01), 0.49);
    const sens = +(options.sens ?? 0.4), clamp = +(options.clamp ?? 100), lc = +(options.follow ?? 0.04), lt = +(options.pull ?? 0.035), vmax = +(options.max ?? 12);
    const top = () => el.getBoundingClientRect().top + scrollY, end = () => top() + el.offsetHeight - innerHeight;
    const v = { on: false, p: 0, t: 0, dir: 0, intent: 0, locked: false, lastY: scrollY, block: 0, started: options.wait !== "true" };
    const emit = (p) => { const f = p / L; el.style.setProperty("--fx-progress", f.toFixed(4)); el.dispatchEvent(new CustomEvent("fx:progress", { detail: { p: f } })); };
    const sync = (p) => { const y = top() + (end() - top()) * Math.min(Math.max(p / L, 0), 1); if (Math.abs(scrollY - y) > 0.5) scrollTo(0, y); v.lastY = y; };
    // Where there is no hand dragging (touch, reduced motion), its share goes to the default scroll position
    const native = () => emit(Math.min(Math.max((scrollY - top()) / Math.max(1, end() - top()), 0), 1) * L);
    if (reduce || !hover) { addEventListener("scroll", native, { passive: true }); native(); return () => removeEventListener("scroll", native); }
    const snapOf = (x) => {
      if (x <= 0 || x >= L) return Math.min(Math.max(x, 0), L);
      const i = stops.findIndex((s, k) => x >= s && x <= stops[k + 1]);
      const a = stops[i], b = stops[i + 1], k = (x - a) / Math.max(1e-6, b - a);
      return v.dir > 0 ? (k >= commit ? b : a) : v.dir < 0 ? (k <= 1 - commit ? a : b) : k < 0.5 ? a : b;
    };
    const lock = (on) => { v.on = on; };
    const release = () => { v.p = v.t = L; v.intent = 0; emit(L); sync(L); lock(false); v.block = performance.now() + 220; };
    const grab = (atEnd) => { lock(true); v.p = v.t = atEnd ? L : 0; v.dir = 0; v.intent = 0; sync(v.p); emit(v.p); };
    const wheel = (e) => {
      if (!v.on) return;
      e.preventDefault();
      if (v.locked) return;
      const d = Math.min(Math.max(e.deltaY, -clamp), clamp) * sens;
      if (!d) return;
      if (d > 0 && v.p >= L - 1.5) return release();
      let next = v.t + d;
      if (d > 0) { const z = pauses.find((z) => z.p > v.p + 1 && z.s === "idle"); if (z && next > z.p) next = z.p; }
      v.intent = next >= L && d > 0 ? 1 : 0;
      v.t = Math.min(Math.max(next, 0), L);
      v.dir = d > 0 ? 1 : -1;
    };
    const tick = () => {
      if (!v.on) return;
      let t = v.t + (snapOf(v.t) - v.t) * lt;
      let vel = Math.min(Math.max((t - v.p) * lc, -vmax), vmax);
      let p = v.p + vel;
      if (Math.abs(t - p) < 0.05 && Math.abs(vel) < 0.05) { p = t; vel = 0; }
      for (const z of pauses) {
        if (Math.abs(p - z.p) < 1 && z.s === "idle" && v.dir === 1) {
          z.s = "locked"; v.locked = true; t = p = z.p;
          setTimeout(() => { v.locked = false; z.s = "cleared"; }, hold);
          break;
        }
        if (z.s === "cleared" && !v.locked && Math.abs(p - z.p) > 5) z.s = "idle";
      }
      v.t = t;
      if (v.intent && !v.locked && t >= L - 0.01 && p >= L - 0.05 && Math.abs(vel) < 0.08) return release();
      v.p = Math.min(Math.max(p, 0), L);
      emit(v.p); sync(v.p);
    };
    const scroll = () => {
      const y = scrollY, dy = y - v.lastY;
      // Coming from above and touching the section head, grab at the start — coming from below and entering the section, grab at the end
      if (!v.on && v.started && performance.now() > v.block) {
        if (dy > 1.5 && y >= top() - 1 && y < top() + innerHeight * 0.5) grab(false);
        else if (dy < -1.5 && y > top() + 1.5 && y < end() + 1) grab(true);
      }
      if (!v.on) { v.lastY = y; native(); }
    };
    const go = () => { v.started = true; if (Math.abs(scrollY - top()) <= 1) grab(false); };
    gsap.ticker.add(tick);
    addEventListener("wheel", wheel, { passive: false });
    addEventListener("scroll", scroll, { passive: true });
    el.addEventListener("fx:go", go);
    if (v.started) go(); else native();
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("wheel", wheel);
      removeEventListener("scroll", scroll);
      el.removeEventListener("fx:go", go);
      el.style.removeProperty("--fx-progress");
    };
  });
})();
