// About: the hero dragon circles along the rail, and the circular band follows a MotionPath arc.
// Original values — 8 visible (gap 1/8), turns on and off at the last 10%, shelf top bottom → bottom top scrub .6,
// The item nearest to arc progress .5 becomes the center (194rem), and the group description is on from shelf cell top center → bottom center
OU.page("about", (root, OU) => {
  const { $, $$, reduce, makeDragon } = OU;
  // The dragon opens and starts around the rail 100ms later, like the original
  const dragon = makeDragon($(".ou-about-first__dragon .ou-dragon", root));
  const wait = setTimeout(() => dragon?.play(), 100);

  const items = $$(".ou-show__item", root);
  const path = $(".ou-show__rail path", root);
  const shelf = $(".ou-show__shelf", root);
  if (!items.length || !path || !shelf) return () => { clearTimeout(wait); dragon?.cleanup(); };
  const N = items.length, SPACING = 1 / Math.min(N, 8), FADE = 0.1, RANGE = 1 + (N - 1) * SPACING;
  const tl = gsap.timeline();
  items.forEach((item, i) => {
    const at = i * SPACING;
    tl.to(item, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, ease: "none", duration: 1 }, at);
    tl.fromTo(item, { opacity: 0 }, { opacity: 1, duration: FADE, ease: "none" }, at);
    tl.to(item, { opacity: 0, duration: FADE, ease: "none" }, at + 1 - FADE);
  });
  let center = null;
  ScrollTrigger.create({
    trigger: shelf, start: "top bottom", end: "bottom top", animation: tl, scrub: reduce ? true : 0.6,
    onUpdate: (self) => {
      const phase = self.progress * RANGE;
      let best = null, dist = Infinity;
      items.forEach((item, i) => {
        const p = phase - i * SPACING;
        if (p >= 0 && p <= 1 && Math.abs(p - 0.5) < dist) { dist = Math.abs(p - 0.5); best = item; }
      });
      if (best !== center) { center?.removeAttribute("data-center"); best?.setAttribute("data-center", ""); center = best; }
      items.forEach((item, i) => {
        const p = phase - i * SPACING;
        if (item === center || p < 0 || p > 1) return item.removeAttribute("data-pos");
        item.setAttribute("data-pos", p > 0.5 ? "left" : "right");
      });
    },
  });
  $$(".ou-show__box", root).forEach((box) => ScrollTrigger.create({
    trigger: box, start: "top center", end: "bottom center",
    onToggle: ({ isActive }) => $(`.ou-show__contents[data-group="${box.dataset.group}"]`, root)?.toggleAttribute("data-active", isActive),
  }));
  return () => { clearTimeout(wait); dragon?.cleanup(); };
});
