(() => {
  // Unfolds from half width to full width as it enters the screen — the underline (line) is drawn from 0, the arrow comes in from off-screen left
  kfFx.register("width-grow-reveal", (el, { options, reduce, scroller }) => {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    if (innerWidth < +(options.min ?? 768)) return;
    gsap.registerPlugin(ScrollTrigger);
    const line = el.querySelector('[data-fx-part="line"]');
    const arrow = el.querySelector('[data-fx-part="arrow"]');
    const ease = kfFx.ease(options.ease || "0.075,0.82,0.165,1", "circ.out");
    const dur = +(options.dur ?? 1), from = +(options.from ?? 50);
    const fade = options.fade !== "off";
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(el, { width: from + "%" }, { width: "100%", duration: dur, ease, clearProps: "width" }, 0);
    if (fade) tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: dur, ease: options.fade === "linear" ? "none" : ease }, 0);
    if (line) tl.fromTo(line, { width: "0%" }, { width: "100%", duration: dur, ease }, 0);
    if (arrow) tl.fromTo(arrow, { opacity: 0, xPercent: -200 }, { opacity: 1, xPercent: 0, duration: dur, ease }, 0);
    const st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top bottom", once: true, onEnter: () => tl.play() });
    return () => { st.kill(); tl.progress(1).kill(); gsap.set([el, line, arrow].filter(Boolean), { clearProps: "width,opacity,transform" }); };
  });
})();
