// Mouse depth layers: layers follow by the distance from screen center to cursor × each layer’s strength (quickTo 1.2s power3) — the stronger the strength, the closer the layer (Brand roots .09 · .06 · .035)
(() => {
  kfFx.register("depth-follow", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    if (!layers.length) return;
    const dur = +(options.dur ?? 1.2), ease = kfFx.ease(options.ease || "power3", "power3");
    // With lerp, instead of a tween, each frame the layer is placed directly at the cursor x·y eased by that fraction (Brand .06) — axis limits it to one axis, and the layer’s data-clamp caps it at ±px
    const lerp = options.lerp != null ? +options.lerp : 0, axis = options.axis || "xy";
    if (lerp > 0) {
      const ls = layers.map((l) => ({ l, k: +(l.dataset.depth ?? options.depth ?? 0.05), c: l.dataset.clamp != null ? +l.dataset.clamp : Infinity }));
      // rest-x·rest-y: the position (px) where the cursor is assumed to be before it first moves — the reference site uses 0 (top left), so the layers are already pushed +25px on open
      let mx = options["rest-x"] != null ? +options["rest-x"] : innerWidth / 2, my = options["rest-y"] != null ? +options["rest-y"] : innerHeight / 2, cx = mx, cy = my, seen2 = false;
      const io2 = new IntersectionObserver(([en]) => (seen2 = en.isIntersecting));
      io2.observe(el);
      const mv = (e) => { mx = e.clientX; my = e.clientY; };
      const tick = () => {
        cx += (mx - cx) * lerp; cy += (my - cy) * lerp;
        if (!seen2) return;
        const dx = cx - innerWidth / 2, dy = cy - innerHeight / 2;
        for (const { l, k, c } of ls) gsap.set(l, { ...(axis !== "y" && { x: gsap.utils.clamp(-c, c, dx * k) }), ...(axis !== "x" && { y: gsap.utils.clamp(-c, c, dy * k) }) });
      };
      addEventListener("pointermove", mv);
      gsap.ticker.add(tick);
      return () => { io2.disconnect(); removeEventListener("pointermove", mv); gsap.ticker.remove(tick); gsap.set(layers, { clearProps: "x,y" }); };
    }
    const movers = layers.map((l) => ({
      k: +(l.dataset.depth ?? options.depth ?? 0.05),
      x: gsap.quickTo(l, "x", { duration: dur, ease }),
      y: gsap.quickTo(l, "y", { duration: dur, ease }),
    }));
    // Doesn’t follow while off-screen — so unseen layers aren’t redrawn as they move
    let seen = false;
    const io = new IntersectionObserver(([en]) => (seen = en.isIntersecting));
    io.observe(el);
    const move = (e) => {
      if (!seen) return;
      const dx = e.clientX - innerWidth / 2, dy = e.clientY - innerHeight / 2;
      for (const m of movers) { m.x(dx * m.k); m.y(dy * m.k); }
    };
    addEventListener("pointermove", move);
    return () => { io.disconnect(); removeEventListener("pointermove", move); gsap.killTweensOf(layers); gsap.set(layers, { clearProps: "x,y" }); };
  });
})();
