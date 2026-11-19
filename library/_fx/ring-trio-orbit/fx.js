(() => {
  // Three overlapping rings at the section center (two thin rings plus a center circle) — tied to scroll, the two rings spread up and down to 1.12x, the center circle to .8x,
  // The whole bundle rotates without a curve, and on wide screens (desktop) it flows up and down ±100% of the bundle height around progress 0.5 at the center
  kfFx.register("ring-trio-orbit", (el, { options, reduce, scroller }) => {
    const rings = [...el.querySelectorAll('[data-fx-part="ring"]')];
    if (rings.length < 3) return;
    gsap.registerPlugin(ScrollTrigger);
    const up = Math.max(1, Math.round(+(options.up ?? 2)));
    let host = el;
    for (let i = 0; i < up && host.parentElement; i++) host = host.parentElement;
    const look = options.look || "gather";
    const gap = +(options.gather ?? 160), spread = +(options.spread ?? 40), grow = +(options.grow ?? 1.12), shrink = +(options.shrink ?? 0.8);
    const [a, b, core] = rings;
    gsap.set(el, { xPercent: -50 });
    gsap.set(rings, { xPercent: -50, yPercent: -50 });
    if (reduce) {
      gsap.set(a, { y: -spread, scale: grow });
      gsap.set(b, { y: spread, scale: grow });
      gsap.set(core, { scale: shrink });
      return () => gsap.set([el, ...rings], { clearProps: "transform" });
    }
    const st = (start, end, extra) => ({ trigger: host, ...(scroller && { scroller }), start, end, scrub: 1, ...extra });
    const wide = +(options.drift ?? 992);
    const desk = !/Mobi|Android|iPad|Tablet|PlayBook/i.test(navigator.userAgent);
    const tweens = [];
    const add = (t) => (tweens.push(t), t);
    if (look === "gather") {
      // Original thought — two rings descend from 160 · 320px above and gather (section top+200 below the screen → section center at screen center), then spread apart
      gsap.set(a, { y: -gap });
      gsap.set(b, { y: -gap * 2 });
      add(gsap.fromTo(a, { y: -gap }, { y: 0, scrollTrigger: st("top+=200 bottom", "center center") }));
      add(gsap.fromTo(b, { y: -gap * 2 }, { y: 0, scrollTrigger: st("top+=200 bottom", "center center") }));
      const s2 = () => st("center center", "bottom+=50% center");
      add(gsap.fromTo(a, { y: 0, scale: 1 }, { y: -spread, scale: grow, immediateRender: false, scrollTrigger: s2() }));
      add(gsap.fromTo(b, { y: 0, scale: 1 }, { y: spread, scale: grow, immediateRender: false, scrollTrigger: s2() }));
      add(gsap.to(core, { scale: shrink, scrollTrigger: s2() }));
      gsap.set(el, { rotation: 180 });
      add(gsap.to(el, { rotation: 360, ease: "none", scrollTrigger: s2() }));
    } else if (look === "spread") {
      // Original service — section top −50% is the center → spreads out from the section center, and the center circle rewinds from 90° to −360°
      const s1 = () => st("top-=50% center", "center center");
      add(gsap.to(a, { y: -spread, scale: grow, scrollTrigger: s1() }));
      add(gsap.to(b, { y: spread, scale: grow, scrollTrigger: s1() }));
      add(gsap.to(core, { scale: shrink, scrollTrigger: s1() }));
      gsap.set(core, { rotation: 90 });
      add(gsap.to(core, { rotation: -360, scrollTrigger: st("top-=50% center", "bottom+=50% center") }));
      add(gsap.to(el, { rotation: 360, ease: "none", scrollTrigger: st("top-=50% center", "bottom+=50% center") }));
    } else {
      // Original recruit(hold) — stays spread apart, only the center circle (photo window) turns −360° with no curve, and fades out with 100px blur on reaching the section end
      gsap.set(a, { y: -spread, scale: grow });
      gsap.set(b, { y: spread, scale: grow });
      gsap.set(core, { scale: shrink, rotation: 0 });
      add(gsap.to(core, { rotation: -360, ease: "none", scrollTrigger: st("top-=50% center", "bottom+=50% center") }));
      add(gsap.to(el, { rotation: 360, ease: "none", scrollTrigger: st("top-=50% center", "bottom+=50% center") }));
      if (options.fade !== "off") add(gsap.to(el, { opacity: 0, filter: "blur(100px)", ease: "none", scrollTrigger: st("bottom bottom", "bottom bottom") }));
    }
    const drift = ScrollTrigger.create({
      ...st(look === "gather" ? "top-=50% center" : "top-=50% center", "bottom+=50% center"),
      onUpdate: (s) => { if (innerWidth >= wide && desk) gsap.set(el, { yPercent: (s.progress - 0.5) * 200 }); },
    });
    return () => {
      drift.kill();
      tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
      gsap.set([el, ...rings], { clearProps: "transform,opacity,filter" });
    };
  });
})();
