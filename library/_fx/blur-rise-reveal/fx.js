// Rising reveal that comes into focus from a blur — look: heading from 40px below · blur 20px · transparent in 1.6s expo.out, hand from blur 5px · transparent in 1.4s expo.out,
// fade: from 40px below and transparent in 2s expo.out (items entering at the same time staggered .15s). If inside the first screen ”top bottom”, if below ”top 80%” (fade uses ”top bottom-=Fires once at 150px”).
(() => {
  const LOOK = {
    heading: { from: { autoAlpha: 0, y: 40, filter: "blur(20px)" }, dur: 1.6 },
    hand: { from: { autoAlpha: 0, filter: "blur(5px)" }, dur: 1.4 },
    fade: { from: { autoAlpha: 0, y: 40 }, dur: 2 },
  };
  let batch = [], flush = 0;
  kfFx.register("blur-rise-reveal", (el, { options, reduce, scroller }) => {
    if (!window.ScrollTrigger) return;
    const look = LOOK[options.look] ? options.look : "heading", L = LOOK[look];
    const dur = +(options.dur ?? L.dur), y = options.y != null ? +options.y : L.from.y;
    const ease = options.ease ? kfFx.ease(options.ease, "expo.out") : "expo.out";
    const delay = +(options.delay ?? 0);
    const from = { ...L.from };
    if (y != null) from.y = y;
    if (options.blur != null && from.filter) from.filter = `blur(${+options.blur}px)`;
    if (reduce) { gsap.set(el, { autoAlpha: 1 }); return; }
    gsap.set(el, from);
    const below = el.getBoundingClientRect().top + scrollY > innerHeight;
    const start = options.start || (below ? (look === "fade" ? "top bottom-=150px" : "top 80%") : "top bottom");
    let tw;
    const play = () => {
      if (look !== "fade") { tw = gsap.to(el, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: dur, delay, ease }); return; }
      // Fades entering the same frame go in turns of .15s (original ScrollTrigger.batch)
      batch.push(el);
      cancelAnimationFrame(flush);
      flush = requestAnimationFrame(() => { const b = batch; batch = []; gsap.to(b, { autoAlpha: 1, y: 0, duration: dur, delay, ease, stagger: +(options.stagger ?? 0.15) }); });
    };
    const st = ScrollTrigger.create({ trigger: el, scroller, start, once: true, onEnter: play });
    return () => { st.kill(); tw?.kill(); gsap.killTweensOf(el); gsap.set(el, { clearProps: "opacity,visibility,transform,filter" }); };
  });
})();
