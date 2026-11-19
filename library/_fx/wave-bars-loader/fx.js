(() => {
  // Hero curtain: vertical bars inside the center logo box ([data-fx-part=bar], data-h·data-b = Height·bottom px) drops in from above the screen and settles into place —
  // For each bar, draws a random length 0~drop seconds and delay 0~wait seconds: the floor uses circ.out, the key 1.5× the length with circ.inOut (0.2× late).
  // At tint seconds is-tint (bar color change), at hold seconds the curtain lifts over fade seconds with circ.out and fires fx:done
  kfFx.register("wave-bars-loader", (el, { options, reduce }) => {
    if (!window.gsap) return;
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    if (!bars.length) return;
    const drop = +(options.drop ?? 0.8), wait = +(options.wait ?? 1.2);
    const tint = +(options.tint ?? 2.7), hold = +(options.hold ?? 4.7), fade = +(options.fade ?? 1.2);
    const narrow = matchMedia(`(max-width: ${+(options.bp || 768)}px)`).matches;
    const timers = [];
    const done = () => { el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    if (reduce) { gsap.set(el, { autoAlpha: 0 }); done(); return () => gsap.set(el, { clearProps: "opacity,visibility" }); }
    bars.forEach((b) => {
      const e = drop * Math.random(), n = wait * Math.random();
      const h = +(narrow ? b.dataset.hsp ?? b.dataset.h : b.dataset.h) || 0, bt = +(narrow ? b.dataset.bsp ?? b.dataset.b : b.dataset.b) || 0;
      gsap.to(b, { bottom: bt, duration: e, delay: n, ease: "circ.out" });
      gsap.to(b, { height: h, duration: 1.5 * e, delay: n + 0.2 * e, ease: "circ.inOut" });
    });
    timers.push(setTimeout(() => el.classList.add("is-tint"), tint * 1000));
    timers.push(setTimeout(() => gsap.to(el, { autoAlpha: 0, duration: fade, ease: "circ.out", onComplete: done }), hold * 1000));
    return () => { timers.forEach(clearTimeout); gsap.killTweensOf([el, ...bars]); if (el.isConnected) gsap.set([el, ...bars], { clearProps: "all" }); el.classList.remove("is-tint"); };
  });
})();
