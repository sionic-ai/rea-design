(() => {
  // A light cone (triangle clip-path) fans out from a single vertex — dir: down (two top corners → bottom center vertex, light rays above the magnifier),
  // right (left-center vertex → right edge, light of a hand-held magnifier). on: load opens once after delay, scroll opens when the panel center crosses the screen line and closes when scrolled back
  const SHAPES = {
    down: ["polygon(50% 0, 50% 0, 50% 100%)", "polygon(100% 0, 0 0, 50% 100%)"],
    up: ["polygon(50% 100%, 50% 100%, 50% 0)", "polygon(0 100%, 100% 100%, 50% 0)"],
    right: ["polygon(0 50%, 100% 50%, 100% 50%)", "polygon(0 50%, 100% 100%, 100% 0)"],
    left: ["polygon(100% 50%, 0 50%, 0 50%)", "polygon(100% 50%, 0 0, 0 100%)"],
  };
  kfFx.register("cone-clip-open", (el, { options, reduce, scroller }) => {
    const [closed, open] = SHAPES[options.dir] || SHAPES.down;
    const dur = +(options.dur ?? (options.on === "load" ? 0.8 : 1)), delay = +(options.delay ?? 0);
    const ease = options.ease ? (/^[\d.,\s-]+$/.test(options.ease) ? kfFx.ease(options.ease, "power1.inOut") : options.ease) : options.on === "load" ? "power1.inOut" : kfFx.ease("0.42,0,0.58,1", "power1.inOut");
    const fade = options.fade === "on";
    if (reduce) { gsap.set(el, { clipPath: open, opacity: 1 }); return () => gsap.set(el, { clearProps: "clipPath,opacity" }); }
    gsap.set(el, { clipPath: closed, ...(fade ? { opacity: 0 } : {}) });
    const go = (on) => gsap.to(el, { clipPath: on ? open : closed, ...(fade ? { opacity: on ? 1 : 0 } : {}), duration: dur, delay: on && options.on === "load" ? delay : 0, ease, overwrite: true });
    let st = null;
    if (options.on === "load") go(true);
    else {
      const line = +(options.line ?? 75);
      st = ScrollTrigger.create({ trigger: el, scroller: scroller || undefined, start: `center ${line}%`, onEnter: () => go(true), onLeaveBack: () => options.back === "off" || go(false) });
    }
    return () => { st?.kill(); gsap.killTweensOf(el); gsap.set(el, { clearProps: "clipPath,opacity" }); };
  });
})();
