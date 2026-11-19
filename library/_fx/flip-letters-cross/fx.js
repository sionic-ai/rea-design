(() => {
  kfFx.register("flip-letters-cross", (el, { options, reduce, scroller }) => {
    const letters = [...el.querySelectorAll('[data-fx-part="letter"]')], slots = [...el.querySelectorAll('[data-fx-part="slot"]')];
    if (reduce || !letters.length || slots.length < letters.length || !window.Flip) return;
    const section = el.parentElement;
    const scrub = +(options.scrub ?? 3), each = +(options.each ?? 0.2), dur = +(options.dur ?? 1.4), shrink = +(options.shrink ?? 0.2), min = +options.min || 992;
    const home = letters.map((l) => ({ l, parent: l.parentElement, next: l.nextSibling }));
    let st = null, tl = null, t = 0;
    const undo = () => { st?.kill(); tl?.kill(); st = tl = null; home.forEach(({ l, parent, next }) => { gsap.set(l, { clearProps: "all" }); if (next && next.parentNode === parent) parent.insertBefore(l, next); else parent.append(l); }); };
    const build = () => {
      undo();
      if (innerWidth < min) return;
      const state = Flip.getState(letters);
      letters.forEach((l, i) => slots[i].append(l));
      tl = Flip.from(state, { ease: "power4.inOut", duration: dur, stagger: { each, from: "end" }, repeat: 1, yoyo: true, paused: true });
      letters.forEach((l, i) => {
        const o = (letters.length - 1 - i) * (each / 2);
        tl.to(l, { scale: shrink, duration: dur * 4 / 7, ease: "power4.inOut" }, o);
        tl.to(l, { scale: 1, duration: dur * 4 / 7, ease: "power4.inOut" }, o + dur * 4 / 7);
      });
      st = ScrollTrigger.create({ trigger: section, scroller, start: "top top", end: "bottom bottom", scrub, animation: tl });
    };
    const onR = () => { clearTimeout(t); t = setTimeout(build, 200); };
    build();
    addEventListener("resize", onR);
    return () => { removeEventListener("resize", onR); clearTimeout(t); undo(); };
  });
})();
