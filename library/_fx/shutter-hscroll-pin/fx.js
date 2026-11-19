(() => {
  // Original SliderSticky — sets the section height to (c + overflow width + c)×2 (c = band top and bottom padding), ties one timeline to scroll with a .25s delay.
  // Pinning is done by css sticky, so there is no pin-spacer — it does not break inside an inner scroll pane either.
  kfFx.register("shutter-hscroll-pin", (el, { options, reduce, scroller }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const sticky = part("sticky"), rail = part("rail"), track = part("track");
    if (reduce || !sticky || !rail || !track) return;
    gsap.registerPlugin(ScrollTrigger);
    const covers = [...el.querySelectorAll('[data-fx-part="cover"]')];
    const lead = +(options.lead ?? 250);
    const open = +(options.open ?? 2), run = +(options.run ?? 6), out = +(options.out ?? 2);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 800px)", () => {
      const e = { tx: 0, c: 0, total: 0 };
      const view = () => (scroller ? scroller.clientHeight : innerHeight);
      const measure = () => {
        e.tx = -(track.scrollWidth - el.clientWidth);
        e.c = (view() - rail.offsetHeight) / 2;
        e.total = (e.c + Math.abs(e.tx) + e.c) * 2;
      };
      measure();
      if (e.tx >= 0) return;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el, ...(scroller && { scroller }),
          start: `top-=${lead}px center`,
          end: () => `+=${e.total + lead}px`,
          scrub: +(options.scrub ?? 0.25),
          invalidateOnRefresh: true,
          onRefreshInit: () => { measure(); el.style.height = `${e.total}px`; },
        },
      });
      if (covers.length) tl.to(covers, { scaleY: 0, duration: open }, 0);
      tl.fromTo(rail, { y: () => -e.c / 2 }, { y: () => e.c, duration: open }, open * 0.1)
        .to(track, { x: () => e.tx, duration: run }, open)
        .to(rail, { y: () => e.c * 2, duration: out }, open + run - out * 0.1);
      el.style.height = `${e.total}px`;
      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      ro.observe(track);
      return () => {
        ro.disconnect();
        el.style.height = "";
        gsap.set([rail, track, ...covers], { clearProps: "transform" });
      };
    });
    return () => mm.revert();
  });
})();
