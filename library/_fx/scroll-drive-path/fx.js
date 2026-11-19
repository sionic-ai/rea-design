// A car runs along the road over a fixed illustrated map (MotionPath autoRotate), and the map follows upward by ”distance the car has descended ÷ total road height × the map’s leftover height”,
// Landmarks along the way pop up one per progress threshold. Car, road and landmarks must be in one SVG so the car’s y and the road height share the same unit.
(() => {
  const list = (s) => String(s || "").split(/[\s,]+/).filter(Boolean).map(Number).filter((n) => !Number.isNaN(n));

  kfFx.register("scroll-drive-path", (el, { options, reduce, scroller }) => {
    const viewport = el.querySelector('[data-fx-part="viewport"]');
    const world = el.querySelector('[data-fx-part="world"]');
    const route = el.querySelector('[data-fx-part="route"]');
    const car = el.querySelector('[data-fx-part="car"]');
    if (!viewport || !world || !route || !car || !window.ScrollTrigger || !window.MotionPathPlugin) return;
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
    const spots = [...el.querySelectorAll('[data-fx-part="spot"]')];
    const at = list(options.at);
    const screens = +(options.screens ?? 6);
    const view = (i) => spots[i] && spots[i].classList.add("is-view");

    if (reduce) {
      spots.forEach((s) => s.classList.add("is-view"));
      return () => spots.forEach((s) => s.classList.remove("is-view"));
    }

    const mm = gsap.matchMedia();
    mm.add(options.media || "all", () => {
      const st = { progress: 0, start: 0, max: 1 };
      const shift = gsap.quickSetter(world, "y", "px");
      const length = route.getTotalLength();
      gsap.to(car, {
        ease: "none",
        motionPath: { path: route, align: route, autoRotate: true, alignOrigin: [0.5, 0.5] },
        scrollTrigger: {
          trigger: el, ...(scroller && { scroller }), pin: viewport, start: "top top", scrub: true,
          end: () => `bottom+=${innerHeight * screens}px bottom`,
          onEnter: () => { st.progress = 0; el.classList.add("is-act"); view(0); car.dataset.direction = 1; },
          onUpdate: (self) => {
            const p = self.progress;
            car.dataset.direction = st.progress - p > 0 ? -1 : 1;
            st.progress = p;
            at.forEach((f, i) => p > f && view(i + 1));
          },
        },
        onStart() {
          st.start = gsap.getProperty(car, "y");
          st.max = route.getPointAtLength(length).y - route.getPointAtLength(0).y || 1;
        },
        onUpdate() {
          const room = Math.max(world.offsetHeight - viewport.offsetHeight, 0);
          shift(((st.start - gsap.getProperty(car, "y")) / st.max) * room);
        },
      });
      return () => { gsap.set(world, { clearProps: "transform" }); el.classList.remove("is-act"); };
    });
    return () => { mm.revert(); spots.forEach((s) => s.classList.remove("is-view")); delete car.dataset.direction; };
  });
})();
