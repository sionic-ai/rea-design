// Inside a long section (default 150vh) pin a screen-height panel, three overlapping circles in the middle grow with scroll until they cover the screen —
// Hangs a keyframe set on progress from when the section head touches the screen top (0) to when the section end passes the screen top (100) (the original hook is under the section head by 100vh):
// Center board (core) .4→1.3 (0~15), title turns on at 4→5, dark circle (c1) 4vh→10vw (0~10)→70vw (10~35),
// Pale circle (c2) 4vh→15vw (0–15) then →200vw (15–57), outer blurred circle (c3) 65vh→200vh (0–57). Follows the scroll .5s late.
// Values of the original brand home ”Make the community stronger” section (site builder IX scroll progress) rebuilt with GSAP.
(() => {
  kfFx.register("circle-trio-scrub", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const core = part("core"), title = part("title"), c1 = part("c1"), c2 = part("c2"), c3 = part("c3");
    if (!c1 && !c2 && !c3) return;
    const grow = options.grow || "70vw", wide = options.wide || "200vw", outer = options.outer || "200vh";
    if (reduce) {
      if (core) gsap.set(core, { scale: 1.3 });
      if (title) gsap.set(title, { opacity: 1 });
      if (c1) gsap.set(c1, { width: grow, height: grow });
      if (c2) gsap.set(c2, { width: wide, height: wide });
      if (c3) gsap.set(c3, { width: outer, height: outer });
      return () => gsap.set([core, title, c1, c2, c3].filter(Boolean), { clearProps: "all" });
    }
    const at = (p) => p / 100;
    const scrub = options.scrub === undefined ? 0.5 : +options.scrub;
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: el, scroller, start: options.start || "top top", end: options.end || "bottom top", scrub: scrub || true } });
    if (core) tl.fromTo(core, { scale: +(options.from ?? 0.4) }, { scale: +(options.to ?? 1.3), duration: at(15) }, 0);
    if (title) tl.fromTo(title, { opacity: 0 }, { opacity: 1, duration: at(1) }, at(4));
    if (c1) tl.fromTo(c1, { width: "4vh", height: "4vh" }, { width: "10vw", height: "10vw", duration: at(10) }, 0).to(c1, { width: grow, height: grow, duration: at(25) }, at(10));
    if (c2) tl.fromTo(c2, { width: "4vh", height: "4vh" }, { width: "15vw", height: "15vw", duration: at(15) }, 0).to(c2, { width: wide, height: wide, duration: at(42) }, at(15));
    if (c3) tl.fromTo(c3, { width: options.outerFrom || "65vh", height: options.outerFrom || "65vh" }, { width: outer, height: outer, duration: at(57) }, 0);
    tl.to({}, { duration: at(43) }, at(57));
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set([core, title, c1, c2, c3].filter(Boolean), { clearProps: "all" }); };
  });
})();
