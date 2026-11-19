(() => {
  // Each time the cell spins once (360°) around the Y axis in .6s, the scene inside changes. The previous scene’s props vanish 10px upward in .4s, and the next scene’s props come in from .5 opacity and 10px below
  // Stands up in .4s in a .2s sequence. Scene time (at) and cycle length (period) are original values, and each cell has a different first start (offset) so the groups run staggered
  kfFx.register("spin-scene-tile", (el, { options, reduce }) => {
    const inner = el.querySelector('[data-fx-part="inner"]');
    const scenes = [...el.querySelectorAll('[data-fx-part="scene"]')];
    if (!inner || !scenes.length) return;
    const items = (s) => [...s.children];
    if (reduce) {
      gsap.set(items(scenes[0]), { autoAlpha: 1 });
      return () => gsap.set(scenes.flatMap(items), { clearProps: "all" });
    }
    const at = String(options.at ?? "0 4 16 20").split(/\s+/).map(Number);
    const period = +(options.period || 32), spin = +(options.spin ?? 0.6), offset = +(options.offset ?? 8), enter = +(options.enter ?? 0);
    gsap.set(scenes.flatMap(items), { autoAlpha: 0 });
    const tl = gsap.timeline({ paused: true });
    at.forEach((t, n) => {
      const s = scenes[n % scenes.length], prev = n ? scenes[(n - 1) % scenes.length] : null;
      tl.add(() => el.classList.toggle("is-fx-back", s.dataset.key === "back"), t);
      tl.to(inner, { rotateY: "+=360", duration: spin }, t);
      if (prev && prev !== s) tl.to(items(prev), { autoAlpha: 0, y: -10, duration: 0.4 }, t + 0.1);
      items(s).forEach((it, k) => tl.fromTo(it, { autoAlpha: 0.5, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, immediateRender: false }, t + (n ? 0.6 : 0.7) + k * 0.2));
    });
    const loop = gsap.timeline({ repeat: -1, paused: true });
    loop.add(() => tl.play(0), offset % period);
    loop.add(() => {}, period);
    // First appearance — the cell spins once and comes out of transparent in .6s, then the ring starts just before that cell’s first start.
    const intro = gsap.timeline({ delay: enter });
    intro.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0 });
    intro.from(inner, { rotateY: "+=360", duration: spin }, ">");
    intro.fromTo(inner, { autoAlpha: 0 }, { autoAlpha: 1, duration: spin }, "<");
    intro.add(() => loop.play(Math.max(0, (offset % period) - 0.1)), ">");
    return () => {
      intro.kill(); loop.kill(); tl.kill();
      gsap.set([el, inner, ...scenes.flatMap(items)], { clearProps: "all" });
      el.classList.remove("is-fx-back");
    };
  });
})();
