(() => {
  kfFx.register("ribbon-spin-title", (el, { options, reduce, scroller }) => {
    const badge = el.querySelector('[data-fx-part="badge"]');
    const spin = el.querySelector('[data-fx-part="spin"]') || badge;
    const band = el.querySelector('[data-fx-part="band"]');
    const inner = el.querySelector('[data-fx-part="band-inner"]');
    const extra = [...el.querySelectorAll('[data-fx-part="extra"]')];
    if (!band || !inner) return;
    if (reduce) return;
    const shift = +(options.shift ?? 150), turn = +(options.turn ?? 810), from = +(options.scale ?? 2);
    const lag = +(options.lag ?? 0.4), delay = +(options.delay ?? 0);
    const on = String(options.on || "scroll");
    const expo = kfFx.ease("0.19,1,0.22,1", "expo.out");
    let tl = null, st = null;
    const build = () => {
      const W = inner.offsetWidth;
      const t = gsap.timeline({ paused: true });
      if (spin) {
        gsap.set(spin, { rotationY: turn, scale: from, transformPerspective: 800 });
        t.to(spin, { rotationY: 0, scale: 1, duration: 0.8, ease: expo }, 0);
      }
      if (badge) {
        gsap.set(badge, { x: shift });
        t.to(badge, { x: 0, duration: 0.8, ease: expo }, lag);
      }
      gsap.set(band, { x: shift });
      gsap.set(inner, { x: -W });
      t.to(band, { x: 0, duration: 1, ease: expo }, lag);
      t.to(inner, { x: 0, duration: 1, ease: expo }, lag);
      // In the original Product title, the neighboring character enters at .5s from 400px to the right while transparent, .4s later than the title
      extra.forEach((x) => {
        gsap.set(x, { x: +(options["extra-x"] ?? 400), opacity: 0 });
        t.to(x, { x: 0, opacity: 1, duration: 0.5, ease: expo }, lag + 0.4);
      });
      return t;
    };
    const show = () => { if (tl && tl.progress() === 0 && !tl.isActive()) gsap.delayedCall(delay, () => tl.play()); };
    tl = build();
    if (on === "load") show();
    else if (on === "scroll") st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 85%", once: true, onEnter: show });
    el.addEventListener("fx:show", show);
    return () => {
      st?.kill(); tl?.kill();
      el.removeEventListener("fx:show", show);
      gsap.set([spin, badge, band, inner, ...extra].filter(Boolean), { clearProps: "transform,opacity" });
    };
  });
})();
