(() => {
  // The element is hidden with a horizontal mask (black 0~46% · edge density 52% · transparent 58%~, width 300%), and then,
  // When it enters the screen (or receives fx:sweep), after delay it pushes the mask from 100% → 0%, revealing with an edge smeared from the left.
  // Edge strength settles separately from 1 to edge — sharp at first, then the passed area blurs faintly
  kfFx.register("feather-mask-sweep", (el, { options, reduce, scroller }) => {
    const dur = +(options.dur ?? 2.4), delay = +(options.delay ?? 0), edge = +(options.edge ?? 0.22);
    const edgeDur = +(options["edge-dur"] ?? 1.4);
    const ease = kfFx.ease(options.ease || "0.76,0,0.24,1", "power4.inOut");
    const start = options.start || "top 80%";
    const hidden = { "--fx-edge": 1, webkitMaskPosition: "100% 0%", maskPosition: "100% 0%" };
    const shown = { "--fx-edge": edge, webkitMaskPosition: "0% 0%", maskPosition: "0% 0%" };
    if (reduce) { gsap.set(el, shown); return () => gsap.set(el, { clearProps: "--fx-edge,webkitMaskPosition,maskPosition" }); }
    gsap.set(el, hidden);
    const play = () => {
      gsap.killTweensOf(el);
      gsap.set(el, hidden);
      gsap.to(el, { "--fx-edge": edge, duration: edgeDur, delay, ease: "power2.out" });
      gsap.to(el, { webkitMaskPosition: "0% 0%", maskPosition: "0% 0%", duration: dur, delay, ease });
    };
    const onEvt = () => play();
    el.addEventListener("fx:sweep", onEvt);
    let st = null;
    if (options.start !== "manual" && window.ScrollTrigger) {
      st = ScrollTrigger.create({ trigger: el, start, scroller, once: true, onEnter: play });
    } else if (options.start !== "manual") {
      play();
    }
    return () => {
      el.removeEventListener("fx:sweep", onEvt);
      st?.kill();
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "--fx-edge,webkitMaskPosition,maskPosition" });
    };
  });
})();
