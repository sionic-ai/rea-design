(() => {
  // Hero pieces are tied to scroll and each drops out toward its own side — per piece data-x · data-y (% of its own size), timeline position data-at (seconds).
  // On narrow screens (below narrow px) use data-x-sp·data-y-sp if a different distance is needed. The end is reached when scrolled down by window width × span (original 1.2 — first page, 1 — work list).
  // The original gives the timeline no curve, so each piece’s tween default (.5s · power1.out) applies to scroll as is.
  kfFx.register("scrub-split-out", (el, { options, scroller }) => {
    const parts = [...el.querySelectorAll('[data-fx-part="part"]')];
    if (!parts.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const span = +(options.span ?? 1.2), narrow = +(options.narrow ?? 640), dur = +(options.dur ?? 0.5);
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const num = (p, k) => {
      const sp = innerWidth < narrow ? p.dataset[k + "Sp"] : undefined;
      const v = sp ?? p.dataset[k];
      return v == null || v === "" ? null : +v;
    };
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          scroller, trigger: el, start: options.start || "top top", end: () => "+=" + innerWidth * span,
          scrub: options.scrub != null ? +options.scrub : 1, invalidateOnRefresh: true,
        },
      });
      parts.forEach((p) => {
        const vars = { ease, duration: dur };
        if (num(p, "x") != null) vars.xPercent = () => num(p, "x");
        if (num(p, "y") != null) vars.yPercent = () => num(p, "y");
        tl.to(p, vars, p.dataset.at != null ? +p.dataset.at : 0);
      });
    });
    return () => mm.revert();
  });
})();
