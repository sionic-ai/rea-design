(() => {
  // Stand N ticks vertically, and the ticks around the position the read ratio points to grow longer. Scrolling fast widens the radius, and stopping narrows it —
  // Progress, speed and width all follow by a lerp share of the remaining difference each frame, so numbers don’t jump. Once everything has settled, frames rest
  kfFx.register("tick-swell-meter", (el, { options, reduce, scroller }) => {
    const count = Math.max(2, +options.count || 35), every = Math.max(1, +options.every || 5), gap = +(options.gap ?? 8);
    const minW = +(options.min ?? 24), maxW = +(options.max ?? 48), majorMin = +(options["major-min"] ?? 40), majorMax = +(options["major-max"] ?? 48);
    const base = +(options.radius ?? 2), cap = +(options["max-radius"] ?? 8), lerpK = +(options.lerp ?? 0.12), decay = +(options.decay ?? 0.92), gain = +(options.gain ?? 0.3);
    const ticks = [];
    for (let i = 0; i < count; i++) {
      const t = document.createElement("i");
      const major = i % every === 0;
      t.className = major ? "fx-tsm-tick is-major" : "fx-tsm-tick";
      el.append(t);
      ticks.push({ t, major, lo: major ? majorMin : minW, hi: major ? majorMax : maxW, w: major ? majorMin : minW });
    }
    el.style.height = `${(count - 1) * gap}px`;
    const src = scroller || null;
    const readY = () => (src ? src.scrollTop : scrollY);
    const progress = () => {
      const max = src ? src.scrollHeight - src.clientHeight : document.documentElement.scrollHeight - innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, readY() / max)) : 0;
    };
    let lastY = readY(), last = 0, vel = 0, prog = progress(), rad = base, on = false;
    const paint = () => ticks.forEach((o) => { o.t.style.width = `${o.w.toFixed(1)}px`; });
    const frame = (time) => {
      const now = time * 1000, dt = last ? Math.max(1, now - last) : 16;
      last = now;
      const y = readY();
      vel = vel * decay + (Math.abs(y - lastY) / dt) * (1 - decay);
      lastY = y;
      const target = progress();
      prog += (target - prog) * lerpK;
      rad += (Math.min(cap, Math.max(base, base + vel * gain * 100 * 0.08)) - rad) * lerpK;
      const at = prog * (count - 1);
      let busy = Math.abs(target - prog) > 0.0005 || vel > 0.001;
      ticks.forEach((o, i) => {
        const d = Math.abs(i - at);
        let k = 0;
        if (d <= rad) { k = 1 - d / rad; k = k * k * (3 - 2 * k); }
        const goal = o.lo + (o.hi - o.lo) * k;
        o.w += (goal - o.w) * lerpK;
        if (Math.abs(goal - o.w) > 0.05) busy = true;
        o.t.classList.toggle("is-on", k > 0.05);
      });
      paint();
      if (!busy) { gsap.ticker.remove(frame); on = false; last = 0; }
    };
    const wake = () => { if (on || reduce) return; on = true; gsap.ticker.add(frame); };
    const target = src || window;
    target.addEventListener("scroll", wake, { passive: true });
    addEventListener("resize", wake, { passive: true });
    if (reduce) {
      const still = () => {
        const at = progress() * (count - 1);
        ticks.forEach((o, i) => { const k = Math.max(0, 1 - Math.abs(i - at) / base); o.w = o.lo + (o.hi - o.lo) * k; o.t.classList.toggle("is-on", k > 0.05); });
        paint();
      };
      target.addEventListener("scroll", still, { passive: true });
      still();
      return () => { target.removeEventListener("scroll", still); target.removeEventListener("scroll", wake); removeEventListener("resize", wake); ticks.forEach((o) => o.t.remove()); el.style.height = ""; };
    }
    paint();
    wake();
    return () => {
      gsap.ticker.remove(frame);
      target.removeEventListener("scroll", wake);
      removeEventListener("resize", wake);
      ticks.forEach((o) => o.t.remove());
      el.style.height = "";
    };
  });
})();
