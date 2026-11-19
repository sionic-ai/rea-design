(() => {
  // Original (a wedding site hero): while the trigger travels one screen, from the bottom of the screen (top 100%) to the top (top 0%)
  // The top-left photo is revealed with inset(0 0 100% 0) (upward), the right one with inset(100% 0 0 0) (downward). Trigger spacing 110dvh. The third step is a half panel, the title ±100vh
  kfFx.register("half-split-wipe", (el, { options, reduce, scroller }) => {
    const left = el.querySelector('[data-fx-part="left"]');
    const right = el.querySelector('[data-fx-part="right"]');
    if (!left || !right || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const layersOf = (side) => [...side.querySelectorAll('[data-fx-part="layer"]')];
    const L = layersOf(left), R = layersOf(right);
    const steps = Math.max(L.length, R.length, 1);
    const step = +(options.step ?? 1.1);
    const scrub = options.scrub === undefined || options.scrub === "true" ? true : +options.scrub;
    const copyVh = +(options.copy ?? 100);
    const copies = [...el.querySelectorAll('[data-fx-part="copy"]')];
    el.style.setProperty("--fx-screens", String(steps * step + 1));
    L.forEach((n, i) => (n.style.zIndex = String(L.length - i)));
    R.forEach((n, i) => (n.style.zIndex = String(R.length - i)));
    if (reduce) return () => el.style.removeProperty("--fx-screens");

    const H = () => (scroller ? scroller.clientHeight : innerHeight);
    const at = (k) => k * step * H();
    const tweens = [];
    const wipe = (target, to, k) => {
      if (!target) return;
      tweens.push(gsap.fromTo(target, { clipPath: "inset(0% 0% 0% 0%)" }, {
        clipPath: to, ease: "none",
        scrollTrigger: { trigger: el, scroller, start: () => `top+=${at(k)} top`, end: () => `top+=${at(k) + H()} top`, scrub, invalidateOnRefresh: true },
      }));
    };
    for (let k = 0; k < steps; k++) {
      const last = k === steps - 1;
      wipe(last ? left : L[k], "inset(0% 0% 100% 0%)", k);
      wipe(last ? right : R[k], "inset(100% 0% 0% 0%)", k);
    }
    if (copyVh) copies.forEach((c, i) => {
      tweens.push(gsap.to(c, {
        y: () => (i % 2 ? 1 : -1) * (copyVh / 100) * H(), ease: "none",
        scrollTrigger: { trigger: el, scroller, start: () => `top+=${at(steps - 1)} top`, end: () => `top+=${at(steps - 1) + H() * 1.1} top`, scrub, invalidateOnRefresh: true },
      }));
    });
    return () => {
      tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      gsap.set([left, right, ...L, ...R, ...copies], { clearProps: "clipPath,transform,zIndex" });
      el.style.removeProperty("--fx-screens");
    };
  });
})();
