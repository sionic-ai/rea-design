(() => {
  kfFx.register("zoom-push-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !window.gsap) return;
    const media = el.querySelector('[data-fx-part="media"]') || el.firstElementChild;
    if (!media) return;
    const scale = +(options.scale ?? 1.1);
    // The original, when given a scale, sets the shift share proportional to the scale (× .01818) — photos that grow less shift less
    const base = options.move != null ? +options.move : options.scale != null ? 0.01818181818181818 * scale : 0.02;
    const mx = +(options["move-x"] ?? base), my = +(options["move-y"] ?? base);
    const din = +(options.in ?? 0.75), dfollow = +(options.follow ?? 0.5), dout = +(options.out ?? 1);
    const ease = kfFx.ease(options.ease || "power2.out", "power2.out");
    let inside = false;
    const enter = () => { inside = true; gsap.to(media, { scale, duration: din, ease, overwrite: "auto" }); };
    const move = (e) => {
      if (!inside) return;
      const r = el.getBoundingClientRect();
      gsap.to(media, { x: (r.width / 2 - (e.clientX - r.left)) * mx, y: (r.height / 2 - (e.clientY - r.top)) * my, duration: dfollow, ease, overwrite: "auto" });
    };
    const leave = () => { inside = false; gsap.to(media, { scale: 1, x: 0, y: 0, duration: dout, ease, overwrite: "auto" }); };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(media);
      gsap.set(media, { clearProps: "transform" });
    };
  });
})();
