(() => {
  // Intensity is written to the html style as --fx-chaos — so the glitch part and site code on the same screen read it directly without querying computed style
  kfFx.register("scroll-chaos-mode", (el, { options, reduce }) => {
    const root = document.documentElement;
    const cls = options.class || "is-chaos";
    if (reduce) {
      root.style.setProperty("--fx-chaos", "0");
      el.hidden = true;
      return () => { root.style.removeProperty("--fx-chaos"); el.hidden = false; };
    }
    const from = +(options.from ?? 1500), to = Math.max(from + 1, +(options.to ?? 4500));
    const on = +(options.on ?? 0.9), dur = +(options.dur ?? 1);
    const narrow = matchMedia("(max-width: 950px)");
    const sizeOf = () => +(options.size ?? (narrow.matches ? 70 : 80));
    const speedOf = () => +(options.speed ?? (narrow.matches ? 1 : 2));

    const state = { v: 0 };
    let acc = 0, lastY = scrollY, locked = false, playing = false, hovered = false, leg = 0, x = 0, y = 0, last = -1;

    const enter = () => { hovered = true; };
    const leave = () => { hovered = false; };
    const click = () => {
      if (!locked) return;
      locked = false;
      playing = true;
      gsap.to(state, { v: 0, duration: dur, ease: "power2.inOut", onComplete: () => { playing = false; acc = 0; } });
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("click", click);
    gsap.set(el, { position: "fixed", top: 0, left: 0, display: "none" });

    const frame = () => {
      const W = root.clientWidth, H = innerHeight, s = sizeOf(), a = hovered ? 0 : speedOf();
      if (!locked && !playing) {
        acc += Math.abs(scrollY - lastY);
        state.v = Math.min(1, Math.max(0, (acc - from) / (to - from)));
        if (state.v >= 1) locked = true;
      }
      lastY = scrollY;
      if (leg === 0) { x += a; y = 0; if (x >= W - s) leg = 1; }
      else if (leg === 1) { x = W - s; y += a; if (y >= H - s) leg = 2; }
      else if (leg === 2) { x -= a; y = H - s; if (x <= 0) leg = 3; }
      else { x = 0; y -= a; if (y <= 0) leg = 0; }
      gsap.set(el, { width: s, height: s, x, y, display: state.v >= 1 && scrollY > H * 0.5 ? "block" : "none" });
    };
    const tick = (time) => {
      const f = Math.floor(time * 60);
      if (f === last) return;
      const steps = last < 0 ? 1 : Math.min(f - last, 10);
      last = f;
      for (let i = 0; i < steps; i++) frame();
      root.style.setProperty("--fx-chaos", state.v.toFixed(4));
      document.body.classList.toggle(cls, state.v >= on);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(state);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("click", click);
      root.style.removeProperty("--fx-chaos");
      document.body.classList.remove(cls);
      gsap.set(el, { clearProps: "all" });
    };
  });
})();
