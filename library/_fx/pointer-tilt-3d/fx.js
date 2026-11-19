// Perspective tilt: wherever on screen, the cursor’s offset from the element center (divided by half width·half height, −1~1) tilts it on the X·Y axes up to a max angle (.5s power3.out). brand (3D Perspective Hover)
(() => {
  kfFx.register("pointer-tilt-3d", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const max = +(options.max ?? 20), dur = +(options.dur ?? 0.5), ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const rx = gsap.quickSetter(el, "rotationX", "deg"), ry = gsap.quickSetter(el, "rotationY", "deg");
    const p = { rx: 0, ry: 0 };
    let rect = el.getBoundingClientRect(), mx = innerWidth / 2, my = innerHeight / 2, queued = false;
    const measure = () => (rect = el.getBoundingClientRect());
    const update = () => {
      queued = false;
      const nx = Math.max(-1, Math.min(1, (mx - (rect.left + rect.width / 2)) / (rect.width / 2 || 1)));
      const ny = Math.max(-1, Math.min(1, (my - (rect.top + rect.height / 2)) / (rect.height / 2 || 1)));
      gsap.to(p, { rx: -ny * max, ry: nx * max, duration: dur, ease, overwrite: true, onUpdate: () => { rx(p.rx); ry(p.ry); } });
    };
    const move = (e) => { mx = e.clientX; my = e.clientY; if (!queued) { queued = true; requestAnimationFrame(update); } };
    const re = () => requestAnimationFrame(measure);
    document.addEventListener("pointermove", move, { passive: true });
    addEventListener("resize", re, { passive: true });
    addEventListener("scroll", re, { passive: true });
    return () => { document.removeEventListener("pointermove", move); removeEventListener("resize", re); removeEventListener("scroll", re); gsap.killTweensOf(p); gsap.set(el, { clearProps: "transform" }); };
  });
})();
