// The picture at the center of the hero spreads to fill the screen in a single scroll (1.1s expo.inOut) and the big letters on both sides fly outward — not tied to scroll amount,
// With the panel fixed, it rolls to the next spot by itself like Next Cell. Scrolling up folds it back along the same path (.9s)
(() => {
  kfFx.register("pin-media-expand", (el, { options, reduce, scroller }) => {
    const media = el.querySelector('[data-fx-part="media"]');
    if (!media || !window.gsap) return;
    const left = el.querySelector('[data-fx-part="left"]'), right = el.querySelector('[data-fx-part="right"]');
    const words = [left, right].filter(Boolean);
    const fades = [...el.querySelectorAll('[data-fx-part="fade"]')];
    const open = +(options.open ?? 1.1), shut = +(options.close ?? 0.9), push = +(options.push ?? 60);
    const ease = kfFx.ease(options.ease || "expo.inOut", "expo.inOut");
    const tws = [];
    if (!reduce && options.intro !== "off") {
      if (words.length) tws.push(gsap.from(words, { xPercent: (i) => (i === 0 ? -40 : 40), opacity: 0, duration: 1.6, ease: "expo.out", delay: 0.15 }));
      if (fades.length) tws.push(gsap.from(fades, { opacity: 0, y: 20, duration: 1.2, ease: "expo.out", stagger: 0.08, delay: 0.5 }));
    }
    if (reduce || !window.ScrollTrigger) return () => tws.forEach((t) => t.revert());
    const scrollTo = (y, dur) => {
      const l = window.lenis || window.__lenis;
      if (l?.scrollTo) l.scrollTo(y, { duration: dur, lock: true, force: true });
      else (scroller || window).scrollTo({ top: y, behavior: "smooth" });
    };
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${+options.min || 901}px)`, () => {
      const box = { width: media.offsetWidth, height: media.offsetHeight };
      const grow = () => {
        gsap.to(media, { width: "100vw", height: "100vh", duration: open, ease, overwrite: "auto" });
        if (left) gsap.to(left, { xPercent: -push, opacity: 0, duration: open, ease, overwrite: "auto" });
        if (right) gsap.to(right, { xPercent: push, opacity: 0, duration: open, ease, overwrite: "auto" });
        if (fades.length) gsap.to(fades, { opacity: 0, y: 0, duration: 0.4, overwrite: "auto" });
      };
      const back = () => {
        gsap.to(media, { ...box, duration: shut, ease, overwrite: "auto", onComplete: () => gsap.set(media, { clearProps: "width,height" }) });
        if (words.length) gsap.to(words, { xPercent: 0, opacity: 1, duration: shut, ease, overwrite: "auto" });
        if (fades.length) gsap.to(fades, { opacity: 1, y: 0, duration: 0.6, delay: 0.3, overwrite: "auto" });
      };
      let wide = false;
      const st = ScrollTrigger.create({
        trigger: el, scroller, start: "top top", end: `+=${options.hold || "60%"}`, pin: true,
        onUpdate: (s) => {
          if (!wide && s.direction === 1 && s.progress > 0.01) { wide = true; grow(); scrollTo(s.end + 1, open); }
          else if (wide && s.direction === -1 && s.progress < 0.99) { wide = false; back(); scrollTo(s.start, shut + 0.1); }
        },
        onEnterBack: () => { if (wide) { wide = false; back(); scrollTo(st.start, shut + 0.1); } },
      });
      const onScroll = () => { if (wide && (scroller ? scroller.scrollTop : scrollY) <= st.start + 2) { wide = false; back(); } };
      (scroller || window).addEventListener("scroll", onScroll, { passive: true });
      return () => { st.kill(); (scroller || window).removeEventListener("scroll", onScroll); gsap.set([media, ...words, ...fades], { clearProps: "width,height,transform,opacity" }); };
    });
    return () => { mm.revert(); tws.forEach((t) => t.revert()); };
  });
})();
