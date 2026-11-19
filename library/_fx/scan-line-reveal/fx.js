(() => {
  // With the screen pinned, flow the photo strip left, and peel the cover layer rightward by the amount past the vertical line (default center) to reveal the layer beneath.
  // The cover moves right as much as it lifts while the picture inside moves left by the same amount, so the picture stays in place and only the boundary seems to pass
  kfFx.register("scan-line-reveal", (el, { options, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const frames = track ? [...track.querySelectorAll('[data-fx-part="frame"]')] : [];
    const covers = frames.map((f) => f.querySelector('[data-fx-part="cover"]'));
    if (!frames.length || covers.some((c) => !c)) return;
    gsap.registerPlugin(ScrollTrigger);
    const line = +(options.line ?? 0.5);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const setCover = covers.map((c) => gsap.quickSetter(c, "x", "px"));
      const setInner = covers.map((c) => (c.firstElementChild ? gsap.quickSetter(c.firstElementChild, "x", "px") : () => {}));
      let boxes = [], travel = 0, base = 0;
      const measure = () => {
        const x = +gsap.getProperty(track, "x") || 0, t = track.getBoundingClientRect();
        travel = Math.max(0, track.scrollWidth - el.clientWidth);
        base = t.left - x - el.getBoundingClientRect().left;
        boxes = frames.map((f) => ({ left: f.getBoundingClientRect().left - t.left, width: f.offsetWidth }));
      };
      const paint = (progress) => {
        const scan = el.clientWidth * line, shift = base - progress * travel;
        boxes.forEach((box, i) => {
          const crossed = gsap.utils.clamp(0, 1, (scan - (box.left + shift)) / (box.width || 1)) * box.width;
          setCover[i](crossed);
          setInner[i](-crossed);
        });
      };
      measure();
      gsap.timeline({
        scrollTrigger: {
          trigger: el, ...(scroller && { scroller }), start: "top top", end: () => "+=" + travel, pin: true, scrub: true, invalidateOnRefresh: true,
          onRefreshInit: measure, onRefresh: (self) => paint(self.progress), onUpdate: (self) => paint(self.progress),
        },
      }).fromTo(track, { x: 0 }, { x: () => -travel, ease: "none", duration: 1 });
      paint(0);
    });
    return () => { if (!el.isConnected) ScrollTrigger.getAll().forEach((t) => t.pin === el && t.spacer?.remove()); mm.revert(); };
  });
})();
