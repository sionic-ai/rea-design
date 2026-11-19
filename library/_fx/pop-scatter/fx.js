// Scatter pop — once the panel head reaches 50% of the screen (70% on phones), the pieces inside pop out once in random order (.01s apart) from 0 → 1 scale over .2s back.out(1.7) — Brand-style exclamation mark
(() => {
  kfFx.register("pop-scatter", (el, { options, reduce, scroller }) => {
    const pops = [...el.querySelectorAll('[data-fx-part="pop"]')];
    if (!pops.length || reduce) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.set(pops, { scale: 0 });
    const narrow = matchMedia("(max-width: 767px)").matches;
    const st = ScrollTrigger.create({
      scroller, trigger: el, once: true, start: options.start || (narrow ? "top 70%" : "top 50%"),
      onEnter: () => gsap.to(pops, { scale: 1, duration: +(options.dur ?? .2), stagger: { each: +(options.each ?? .01), from: options.from || "random" }, ease: kfFx.ease(options.ease || "back.out(1.7)", "back.out(1.7)") }),
    });
    return () => { st.kill(); gsap.killTweensOf(pops); gsap.set(pops, { clearProps: "transform" }); };
  });
})();
