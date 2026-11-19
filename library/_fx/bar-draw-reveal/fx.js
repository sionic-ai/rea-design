// ”Redacted document lines” — for each line an ink-colored bar is drawn from the left (scaleX 0→1), and once drawn a cover of the same color peels off to the right, revealing white text on the bar
(() => {
  kfFx.register("bar-draw-reveal", (el, { options, reduce, scroller }) => {
    const bars = [...el.querySelectorAll('[data-fx-part="bar"]')];
    if (!bars.length) return;
    const heads = [...el.querySelectorAll('[data-fx-part="head"]')];
    const covers = bars.map((b) => {
      const c = document.createElement("span");
      c.className = "fx-bar-cover";
      c.setAttribute("aria-hidden", "true");
      b.append(c);
      return c;
    });
    if (reduce) { covers.forEach((c) => c.remove()); return; }
    const dur = +(options.dur ?? 0.6), delay = +(options.delay ?? 0), gap = +(options.gap ?? 0.6);
    const ease = kfFx.ease(options.ease || "circ.inOut", "circ.inOut");
    gsap.set(bars, { scaleX: 0 });
    if (heads.length) gsap.set(heads, { opacity: 0 });
    let st, tl;
    const run = () => {
      tl = gsap.timeline({ delay });
      if (heads.length) tl.fromTo(heads, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 0.6, ease: "circ.out" }, 0);
      tl.fromTo(bars, { scaleX: 0 }, { scaleX: 1, duration: dur, ease }, heads.length ? gap : 0)
        .fromTo(covers, { scaleX: 1 }, { scaleX: 0, duration: dur, ease });
    };
    if (options.on === "load") run();
    else {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 70%", once: true, onEnter: run });
    }
    return () => { st?.kill(); tl?.kill(); covers.forEach((c) => c.remove()); gsap.set([...bars, ...heads], { clearProps: "transform,opacity" }); };
  });
})();
