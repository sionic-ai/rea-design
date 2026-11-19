// Cards and tables fly in from random positions (sideways ±x, vertical ±y) and angles (±rot) in 1s circ.out and stack in place, fading in during the first .2s of arrival — .1s later for each one
(() => {
  kfFx.register("scatter-fly-in", (el, { options, reduce, scroller }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const after = [...el.querySelectorAll('[data-fx-part="after"]')];
    if (reduce) return;
    const rx = +(options.x ?? 300), ry = +(options.y ?? 50), rr = +(options.rot ?? 20);
    const dur = +(options.dur ?? 1), each = +(options.each ?? 0.1), fade = +(options.fade ?? 0.2), delay = +(options.delay ?? 0);
    const ease = kfFx.ease(options.ease || "circ.out", "circ.out");
    const rand = (a) => Math.floor(Math.random() * (2 * a + 1) - a);
    gsap.set([...items, ...after], { opacity: 0 });
    let st;
    const run = () => {
      items.forEach((it, i) => {
        const d = delay + each * (i + 1);
        gsap.fromTo(it, { opacity: 0 }, { opacity: 1, delay: d, duration: fade, ease: "power2.out" });
        gsap.fromTo(it, { x: rand(rx), y: rand(ry), rotate: rand(rr) }, { x: 0, y: 0, rotate: 0, delay: d, duration: dur, ease });
      });
      // Accessory props float up from 100px below at 1 + .2n seconds after all have flown in
      after.forEach((it, i) => gsap.fromTo(it, { opacity: 0, y: 100 }, { opacity: 1, y: 0, delay: delay + 1 + 0.2 * (i + 1), duration: 1, ease: "circ.out" }));
    };
    if (options.on === "load") run();
    else {
      gsap.registerPlugin(ScrollTrigger);
      st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: options.start || "top 70%", once: true, onEnter: run });
    }
    return () => { st?.kill(); gsap.killTweensOf([...items, ...after]); gsap.set([...items, ...after], { clearProps: "opacity,transform" }); };
  });
})();
