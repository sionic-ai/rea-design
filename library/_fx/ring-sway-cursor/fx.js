// Several big circle outlines behind the panel get pushed by the cursor (each differs in push and direction so they stagger), rotate and stretch horizontally and vertically —
// Push and stretch follow at 1.1s, rotation at 1.4s power3, and everything returns to place when leaving the panel. On touch devices they drift slowly at 60% and 45% of that range over 7s and 9s (1.5s more per circle)
(() => {
  const DEF = [{ amp: 44, rot: 6, dir: 1, stretch: 0.05 }, { amp: 26, rot: -4, dir: -1, stretch: 0.035 }];
  kfFx.register("ring-sway-cursor", (el, { options, reduce, hover }) => {
    const rings = [...el.querySelectorAll('[data-fx-part="ring"]')];
    if (!rings.length || reduce) return;
    const scale = +(options.amp ?? 1), dur = +(options.dur ?? 1.1), rdur = +(options["rot-dur"] ?? 1.4);
    const cfg = (i, r) => {
      const d = DEF[i] || DEF[DEF.length - 1];
      const n = (k, v) => (r.dataset[k] != null ? +r.dataset[k] : v);
      return { amp: n("amp", d.amp) * scale, rot: n("rot", d.rot), dir: n("dir", d.dir), stretch: n("stretch", d.stretch) };
    };
    const tweens = [];
    if (hover) {
      const S = rings.map((r, i) => ({
        c: cfg(i, r),
        x: gsap.quickTo(r, "x", { duration: dur, ease: "power3" }), y: gsap.quickTo(r, "y", { duration: dur, ease: "power3" }),
        r: gsap.quickTo(r, "rotation", { duration: rdur, ease: "power3" }),
        sx: gsap.quickTo(r, "scaleX", { duration: dur, ease: "power3" }), sy: gsap.quickTo(r, "scaleY", { duration: dur, ease: "power3" }),
      }));
      const move = (e) => {
        const b = el.getBoundingClientRect(), nx = ((e.clientX - b.left) / b.width - 0.5) * 2, ny = ((e.clientY - b.top) / b.height - 0.5) * 2;
        S.forEach((s) => { s.x(nx * s.c.amp * s.c.dir); s.y(ny * s.c.amp * s.c.dir); s.r(nx * s.c.rot); s.sx(1 + Math.abs(nx) * s.c.stretch); s.sy(1 + Math.abs(ny) * s.c.stretch); });
      };
      const leave = () => S.forEach((s) => { s.x(0); s.y(0); s.r(0); s.sx(1); s.sy(1); });
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); gsap.killTweensOf(rings); gsap.set(rings, { clearProps: "transform" }); };
    }
    rings.forEach((r, i) => {
      const c = cfg(i, r), ax = c.amp * 0.6 * c.dir, ay = c.amp * 0.45 * c.dir, O = { ease: "sine.inOut", repeat: -1, yoyo: true };
      tweens.push(gsap.fromTo(r, { x: -ax }, { x: ax, duration: 7 + i * 1.5, ...O }), gsap.fromTo(r, { y: -ay }, { y: ay, duration: 9 + i * 1.5, ...O }));
    });
    return () => { tweens.forEach((t) => t.kill()); gsap.set(rings, { clearProps: "transform" }); };
  });
})();
