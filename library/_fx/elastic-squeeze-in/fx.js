(() => {
  // Original script.js js-squeeze: opacity 0 · scale 1.4 → 1, elastic.out(1.5, 3) .8s, start 0% 80%
  kfFx.register("elastic-squeeze-in", (el, { options, reduce, scroller }) => {
    const scale = +(options.scale ?? 1.4), dur = +(options.dur ?? 0.8), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "elastic.out(1.5, 3)", "elastic.out(1.5, 3)");
    let st = null, tw = null;
    const off = () => { st?.kill(); tw?.kill(); gsap.set(el, { clearProps: "opacity,scale,rotate,transform" }); el.classList.remove("fx-esi-done"); };
    if (reduce) { el.classList.add("fx-esi-done"); return off; }
    const play = () => {
      el.classList.add("fx-esi-done");
      // rotate — initial tilt (deg). If not 0 it returns to 0° in place along with the rest (Brand speech bubble -4°)
      const rot = +(options.rotate ?? 0);
      tw = gsap.fromTo(el, { opacity: 0, scale, ...(rot && { rotate: rot }) }, { opacity: 1, scale: 1, ...(rot && { rotate: 0 }), duration: dur, delay, ease });
    };
    st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "0% 80%", once: true, onEnter: play });
    return off;
  });
})();
