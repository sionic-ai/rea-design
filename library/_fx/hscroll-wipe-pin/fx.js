(() => {
  // Horizontal panel + back photo peel — pins the attached section, and the panel rows (data-fx-part="track") the panels inside scroll left without a curve while scrolling the row width.
  // Divides the same range by the number of panels, and on each turn adds is-active to that panel and wipes away the back photo (bg, first is the first panel) with clip-path inset(0 100% 0 0) to reveal the next photo (the last photo stays).
  // On narrow screens (narrow and below) panels stack vertically and only the back photo panel is pinned and wiped upward (inset(0 0 100% 0)).
  kfFx.register("hscroll-wipe-pin", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    // Overlapping photos: the one later in the DOM shows on top, so count from the back as the first panel’s photo
    const bgs = [...el.querySelectorAll('[data-fx-part="bg"]')].reverse();
    const back = el.querySelector('[data-fx-part="back"]');
    if (!panels.length) return;
    const narrow = +options.narrow || 767;
    if (reduce || !window.ScrollTrigger) { panels.forEach((p) => p.classList.add("is-active")); return () => panels.forEach((p) => p.classList.remove("is-active")); }
    gsap.registerPlugin(ScrollTrigger);
    const trig = (o) => ({ trigger: el, ...(scroller && { scroller }), invalidateOnRefresh: true, ...o });
    const wipes = (hide, end) => {
      const tl = gsap.timeline({ scrollTrigger: trig({ start: "top top", end, scrub: true }) });
      panels.forEach((p, i) => {
        tl.add(() => p.classList.add("is-active"));
        const bg = bgs[i];
        if (bg) tl.to(bg, { ease: "none", clipPath: i === bgs.length - 1 ? "inset(0% 0% 0% 0%)" : hide });
        else tl.to({}, { duration: 1 });
      });
      return tl;
    };
    const mm = gsap.matchMedia();
    mm.add(`(min-width: ${narrow + 1}px) and (prefers-reduced-motion: no-preference)`, () => {
      const end = () => "+=" + track.scrollWidth;
      gsap.to(panels, { xPercent: -100 * panels.length, ease: "none", scrollTrigger: trig({ start: "top top", end, pin: true, scrub: true }) });
      wipes("inset(0% 100% 0% 0%)", end);
    });
    mm.add(`(max-width: ${narrow}px) and (prefers-reduced-motion: no-preference)`, () => {
      const end = () => "+=" + el.offsetHeight;
      if (back) ScrollTrigger.create(trig({ start: "top top", end, pin: back, pinSpacing: false }));
      wipes("inset(0% 0% 100% 0%)", end);
    });
    return () => { mm.revert(); panels.forEach((p) => p.classList.remove("is-active")); };
  });
})();
