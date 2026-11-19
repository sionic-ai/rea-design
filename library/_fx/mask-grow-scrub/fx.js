(() => {
  // Rounded frame that grows on scroll — while passing the attached element (a stretched track), the frame (data-fx-part="mask")’s mask size grows from from% → to% and
  // Photo inside a frame (data-fx-part="media") scales down to 1 and the photo covers the screen
  kfFx.register("mask-grow-scrub", (el, { options, reduce, scroller }) => {
    const mask = el.querySelector('[data-fx-part="mask"]');
    if (!mask) return;
    const media = [...el.querySelectorAll('[data-fx-part="media"]')];
    const from = +(options.from ?? 91.59), to = +(options.to ?? 200), scale = +(options.scale ?? 1.2);
    const set = (p) => {
      const size = `${from + (to - from) * p}%`;
      mask.style.webkitMaskSize = size;
      mask.style.maskSize = size;
      media.forEach((m) => { m.style.scale = String(scale + (1 - scale) * p); });
    };
    if (reduce) { set(0); return () => { mask.style.maskSize = mask.style.webkitMaskSize = ""; media.forEach((m) => { m.style.scale = ""; }); }; }
    gsap.registerPlugin(ScrollTrigger);
    // lag: follow the scroll this many seconds late (scrub value). 0 means immediately
    const lag = +(options.lag ?? 0);
    const trig = { trigger: el, ...(scroller && { scroller }), start: options.start || "top top", end: options.end || "bottom bottom" };
    const prog = { p: 0 };
    const tw = lag > 0 ? gsap.to(prog, { p: 1, ease: "none", onUpdate: () => set(prog.p), scrollTrigger: { ...trig, scrub: lag } }) : null;
    const st = tw ? tw.scrollTrigger : ScrollTrigger.create({ ...trig, onUpdate: (self) => set(self.progress), onRefresh: (self) => set(self.progress) });
    if (tw) set(0);
    return () => {
      tw?.kill();
      st.kill();
      mask.style.maskSize = mask.style.webkitMaskSize = "";
      media.forEach((m) => { m.style.scale = ""; });
    };
  });
})();
