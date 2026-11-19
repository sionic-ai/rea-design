(() => {
  kfFx.register("circle-swap-hover", (el, { options, reduce, hover }) => {
    const made = [];
    const part = (name) => {
      let p = el.querySelector(`:scope > [data-fx-part="${name}"]`);
      if (!p) { p = document.createElement("span"); p.dataset.fxPart = name; p.setAttribute("aria-hidden", "true"); el.prepend(p); made.push(p); }
      return p;
    };
    const base = part("base"), fill = part("fill");
    el.prepend(fill, base);
    if (reduce || !hover) return () => made.forEach((p) => p.remove());
    const dur = +(options.dur ?? 0.3), ease = kfFx.ease(options.ease || "0.61,1,0.88,1", "sine.out");
    const to = (t, scale, z, d) => gsap.to(t, { scale, zIndex: z, duration: d, ease: d ? ease : "none", overwrite: "auto" });
    const on = () => { to(fill, 0, 0, 0); to(base, 1, 0, 0); to(fill, 1, 1, dur); };
    const off = () => { to(base, 0, 0, 0); to(fill, 1, 0, 0); to(base, 1, 1, dur); };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("focusin", on);
      el.removeEventListener("focusout", off);
      gsap.killTweensOf([fill, base]);
      gsap.set([fill, base], { clearProps: "scale,zIndex" });
      made.forEach((p) => p.remove());
    };
  });
})();
