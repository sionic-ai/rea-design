(() => {
  // The original (Webflow) separately hooks fixed-button behavior at the moment the closing section enters and leaves the screen — bundled into one observer watching one section
  kfFx.register("float-away-section", (el, { options, reduce, scroller }) => {
    if (typeof gsap === "undefined") return;
    const sel = options.while;
    const target = sel ? document.querySelector(sel) : null;
    const y = +(options.y ?? 10), dur = reduce ? 0 : +(options.dur ?? 0.5);
    // Webflow outCirc is the standard easing curve as is, so it matches GSAP circ.out
    const ease = options.ease ? (/^[\d.,\s-]+$/.test(options.ease) ? kfFx.ease(options.ease, "circ.out") : options.ease) : "circ.out";
    // pop — because of the original Webflow bundle order, it stays hidden (display:none) while opacity fills up, then appears all at once
    const pop = options.look === "pop";
    let timer = 0;
    const show = () => {
      gsap.killTweensOf(el);
      clearTimeout(timer);
      if (pop) {
        gsap.set(el, { display: "none", y, opacity: 0 });
        timer = setTimeout(() => gsap.set(el, { display: "block", y: 0, opacity: 1 }), dur * 1000);
        return;
      }
      gsap.set(el, { display: "block" });
      gsap.fromTo(el, { y, opacity: 0 }, { y: 0, opacity: 1, duration: dur, ease, overwrite: true });
    };
    const hide = () => {
      gsap.killTweensOf(el);
      clearTimeout(timer);
      gsap.to(el, { y, opacity: 0, duration: dur, ease, overwrite: true, onComplete: () => gsap.set(el, { display: "none" }) });
    };
    const off = () => { clearTimeout(timer); gsap.killTweensOf(el); gsap.set(el, { clearProps: "display,opacity,transform" }); };
    if (!target) { show(); return off; }
    // first: hidden — starts hidden, and appears only after the section has entered and left the screen once (Webflow ‹scrolled out of view› only runs if it has entered before — Brand)
    const waitFirst = options.first === "hidden";
    let first = true, inView = null;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting === inView) return;
      const was = inView;
      inView = e.isIntersecting;
      // If the section is already on screen at first measurement, leave it hidden (the original also runs only the enter motion)
      if (inView) first ? gsap.set(el, { display: "none", opacity: 0, y }) : hide();
      else if (first && waitFirst) gsap.set(el, { display: "none", opacity: 0, y });
      else if (!waitFirst || was === true) show();
      first = false;
    }, { root: scroller && scroller !== window ? scroller : null });
    io.observe(target);
    return () => { io.disconnect(); off(); };
  });
})();
