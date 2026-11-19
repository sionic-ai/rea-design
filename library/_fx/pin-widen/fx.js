// Pin the section at screen center for a long time (default 2000vh), while the narrow tall photo in the center slowly widens to fill the screen (scrub .8).
// Given progress steps (steps), each crossing adds fx-pw-step-N to the section so the text can be swapped.
(() => {
  kfFx.register("pin-widen", (el, { options, reduce, scroller }) => {
    const photo = el.querySelector('[data-fx-part="photo"]');
    if (!photo) return;
    const steps = options.steps ? String(options.steps).split(",").map(Number).filter((n) => !Number.isNaN(n)) : [];
    const setStep = (p) => steps.forEach((t, i) => el.classList.toggle(`fx-pw-step-${i + 1}`, p >= t));
    const narrow = matchMedia("(max-width: 767px)").matches;
    const pick = (k, wide, sp) => options[k] ?? (narrow ? sp : wide);
    const from = { width: pick("from", "36.7vw", "63.08vw"), height: pick("from-h", "91.36svh", "45.2svh") };
    const to = { width: pick("to", "100vw", "100vw"), height: pick("to-h", "100svh", "100svh") };
    if (reduce) { gsap.set(photo, to); setStep(1); return () => { gsap.set(photo, { clearProps: "width,height" }); steps.forEach((_, i) => el.classList.remove(`fx-pw-step-${i + 1}`)); }; }
    // scrub: true binds directly to scroll position with no lag (drawn straight from scroll position, as in the phone version)
    const len = pick("length", "2000vh", "800vh"), grow = pick("grow", "1900vh", "500vh"), scrub = String(options.scrub) === "true" ? true : +(options.scrub ?? 0.8);
    // Pin start position and whether to pin — pin from the top like the hero photo frame (start: top 20px), or on phones don’t pin and only shrink (pin: false)
    const start = pick("start", "center center", "center center"), pinned = pick("pin", "true", "true") !== "false";
    const ctx = gsap.context(() => {
      if (pinned) ScrollTrigger.create({ trigger: el, scroller, start, end: `+=${len}`, pin: true, scrub });
      gsap.fromTo(photo, from, { ...to, ease: "none", scrollTrigger: { trigger: el, scroller, start, end: `+=${grow}`, scrub, onUpdate: (s) => setStep(s.progress), onToggle: (s) => el.classList.toggle("fx-pw-on", s.isActive) } });
    }, el);
    setStep(0);
    return () => { ctx.revert(); steps.forEach((_, i) => el.classList.remove(`fx-pw-step-${i + 1}`)); el.classList.remove("fx-pw-on"); };
  });
})();
