// Panel where badges around pop out when you hover — badge (data-fx-part="pop") starts at .5x and transparent, on hover over the panel it goes to its own angle ±40° over .7s with back.out(2.6)
// pops out in random order (.07) and wobbles at ±4°, and on release shrinks to .6x in .2s. Each badge is pushed depth px away from the mouse (.9s power3.out)
(() => {
  kfFx.register("hover-sticker-burst", (el, { options, reduce, hover }) => {
    const pops = [...el.querySelectorAll('[data-fx-part="pop"]')];
    if (!pops.length || !window.gsap) return;
    const host = el.querySelector('[data-fx-part="host"]') || el;
    const spin = +(options.spin ?? 40), dur = +(options.dur ?? 0.7), each = +(options.each ?? 0.07), wobble = +(options.wobble ?? 4);
    const rot = (p) => +(p.dataset.r || 0);
    let wiggles = [];
    const ac = new AbortController(), sig = { signal: ac.signal };
    gsap.set(pops, { scale: 0.5, autoAlpha: 0, rotation: (i, p) => rot(p) });
    if (reduce || !hover) {
      gsap.set(pops, { scale: 1, autoAlpha: 1 });
      return () => { gsap.set(pops, { clearProps: "all" }); };
    }
    const show = () => {
      wiggles.forEach((w) => w.kill());
      gsap.fromTo(pops, { scale: 0.5, autoAlpha: 0, rotation: (i, p) => rot(p) + spin * gsap.utils.random([-1, 1]), yPercent: 40 }, {
        scale: 1, autoAlpha: 1, rotation: (i, p) => rot(p), yPercent: 0, duration: dur, ease: "back.out(2.6)", stagger: { each, from: "random" }, overwrite: true,
        onComplete: () => { wiggles = pops.map((p, i) => gsap.to(p, { rotation: `+=${i % 2 ? wobble : -wobble}`, duration: 1.4 + (i % 3) * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1 })); },
      });
    };
    const hide = () => { wiggles.forEach((w) => w.kill()); wiggles = []; gsap.to(pops, { scale: 0.6, autoAlpha: 0, duration: 0.2, ease: "power2.out", stagger: { each: 0.03, from: "random" }, overwrite: true }); };
    host.addEventListener("pointerenter", show, sig);
    host.addEventListener("pointerleave", hide, sig);
    const follow = pops.map((p) => ({ x: gsap.quickTo(p, "x", { duration: 0.9, ease: "power3.out" }), y: gsap.quickTo(p, "y", { duration: 0.9, ease: "power3.out" }), d: +(p.dataset.d || options.depth || 20) }));
    document.addEventListener("pointermove", (e) => { const nx = (e.clientX / innerWidth) * 2 - 1, ny = (e.clientY / innerHeight) * 2 - 1; follow.forEach((f) => { f.x(-nx * f.d); f.y(-ny * f.d); }); }, sig);
    return () => { ac.abort(); wiggles.forEach((w) => w.kill()); gsap.killTweensOf(pops); gsap.set(pops, { clearProps: "all" }); };
  });
})();
