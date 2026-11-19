(() => {
  kfFx.register("fly-to-cart", (el, { options, reduce }) => {
    const arrive = () => el.dispatchEvent(new CustomEvent("fx:arrive", { bubbles: true }));
    const dur = +(options.dur ?? 1.1), sway = +(options.sway ?? 30), size = +(options.size ?? 26);
    const ease = kfFx.ease(options.ease || "power2.in", "power2.in");
    const sel = options.to || '[data-fx-part="cart"]';
    if (window.gsap && window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
    const live = new Set();
    const fly = () => {
      const target = document.querySelector(sel);
      const b = target?.getBoundingClientRect();
      if (reduce || !window.gsap || !window.MotionPathPlugin || !b || !b.width) return arrive();
      const a = el.getBoundingClientRect();
      const from = { x: a.left + a.width / 2, y: a.top + a.height / 2 };
      const to = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
      // The original shakes the center point by 30 − 30·rand·2 — each press makes the arc slightly different
      const off = sway - sway * Math.random() * 2;
      const dot = document.createElement("span");
      dot.className = "fx-fly-dot";
      dot.style.setProperty("--fx-size", `${size}px`);
      document.body.append(dot);
      live.add(dot);
      const p = { x: from.x, y: from.y };
      gsap.set(dot, { x: from.x, y: from.y });
      const done = () => { live.delete(dot); dot.remove(); arrive(); };
      gsap.to(p, {
        duration: dur, ease,
        motionPath: { path: [{ x: from.x, y: from.y }, { x: from.x + (to.x - from.x) / 2, y: from.y + off }, { x: to.x, y: to.y }], curviness: 1 },
        onUpdate: () => gsap.set(dot, { x: p.x, y: p.y }),
      });
      // Removed one frame before the last frame (1.09s) so no dot is left visible over the cart button
      gsap.to(dot, { opacity: 0, duration: 0.01, delay: Math.max(dur - 0.01, 0), ease: "none", onComplete: done });
    };
    el.addEventListener("click", fly);
    return () => {
      el.removeEventListener("click", fly);
      live.forEach((d) => { gsap.killTweensOf(d); d.remove(); });
      live.clear();
    };
  });
})();
