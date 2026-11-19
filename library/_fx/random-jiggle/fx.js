// Picks one prop in the panel at a random interval within every and shakes its ±angle in 8 steps (right · 0 · left · 0, twice) on a straight curve — each step is (random within dur) ÷ 8, direction random each time
// Props under the cursor also sway in place. Picked only while the panel is on screen (Brand treehouse props: each 5~10°·7~12°, length .5~1.2s, interval .5~2s)
(() => {
  const range = (v, a, b) => { const m = String(v ?? "").split("-").map(Number); return m.length === 2 && m.every(Number.isFinite) ? m : [a, b]; };
  kfFx.register("random-jiggle", (el, { options, reduce, hover }) => {
    if (reduce) return;
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const [a0, a1] = range(options.angle, 5, 10), [d0, d1] = range(options.dur, 0.5, 1.2), [e0, e1] = range(options.every, 0.5, 2);
    const r = gsap.utils.random;
    gsap.set(items, { transformOrigin: options.origin || "50% 100%" });
    const jiggle = (it) => {
      gsap.killTweensOf(it);
      const step = r(d0, d1) / 8, dir = Math.random() > 0.5 ? 1 : -1, tl = gsap.timeline();
      for (let k = 0; k < 4; k++) tl.to(it, { rotation: r(a0, a1) * (k % 2 ? -dir : dir), duration: step, ease: "none" }).to(it, { rotation: 0, duration: step, ease: "none" });
    };
    const offs = [];
    if (hover && options.hover !== "false") items.forEach((it) => { const f = () => jiggle(it); it.addEventListener("pointerenter", f); offs.push(() => it.removeEventListener("pointerenter", f)); });
    let call = null;
    const next = () => { jiggle(items[(Math.random() * items.length) | 0]); call = gsap.delayedCall(r(e0, e1), next); };
    const io = new IntersectionObserver(([en]) => { call?.kill(); call = null; if (en.isIntersecting) next(); });
    io.observe(el);
    return () => { io.disconnect(); call?.kill(); offs.forEach((f) => f()); gsap.killTweensOf(items); gsap.set(items, { clearProps: "transform" }); };
  });
})();
