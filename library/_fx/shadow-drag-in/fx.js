(() => {
  // Original script.js: opacity 0 · x -50 · y 50 · textShadow 100px -100px 0 → in place · shadow 0, .6s power2.inOut (start 0% 80%)
  kfFx.register("shadow-drag-in", (el, { options, reduce, scroller }) => {
    const color = () => getComputedStyle(el).getPropertyValue("--fx-shadow").trim() || getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim() || "currentColor";
    const x = +(options.x ?? -50), y = +(options.y ?? 50), sx = +(options.sx ?? 100), sy = +(options.sy ?? -100);
    const dur = +(options.dur ?? 0.6), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const done = () => el.classList.add("fx-sdi-done");
    let st = null, tw = null;
    const off = () => { st?.kill(); tw?.kill(); gsap.set(el, { clearProps: "opacity,transform,textShadow" }); el.classList.remove("fx-sdi-done"); };
    if (reduce) { done(); return off; }
    const play = () => {
      done();
      const c = color();
      tw = gsap.fromTo(el, { opacity: 0, x, y, textShadow: `${sx}px ${sy}px 0 ${c}` }, { opacity: 1, x: 0, y: 0, textShadow: `0px 0px 0 ${c}`, duration: dur, delay, ease, onComplete: () => gsap.set(el, { clearProps: "textShadow" }) });
    };
    gsap.set(el, { x, y });
    if (options.on === "load") play();
    else st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "0% 80%", once: true, onEnter: play });
    return off;
  });
})();
