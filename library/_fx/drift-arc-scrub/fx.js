// Wave-passing cards: pins the section to the screen with the center sentence held, and pushes the card row left by the horizontal overflow (scroll is half the overflow).
// While each card passes from 90% on the screen right to 10% on the left, it alternately bends up and down by up to 48% of screen height and returns (power1.inOut), and swells to 1.4x and back (back.inOut(3)) — original site
(() => {
  kfFx.register("drift-arc-scrub", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!track || !cards.length || !window.ScrollTrigger) return;
    if (reduce) {
      el.classList.add("is-fx-still");
      return () => el.classList.remove("is-fx-still");
    }
    gsap.registerPlugin(ScrollTrigger);
    const rise = +(options.rise ?? 0.48), riseTall = +(options.tall ?? 0.38), grow = +(options.grow ?? 1.4), tilt = +(options.tilt ?? 3);
    const pace = +(options.pace ?? 0.5) || 0.5;
    const over = () => Math.max(0, track.scrollWidth - innerWidth);
    const runway = () => Math.max(1, Math.round(pace * over()));
    const setRunway = () => el.style.setProperty("--fx-runway", `${runway()}px`);
    setRunway();
    const ctx = gsap.context(() => {
      const move = gsap.to(track, {
        x: () => -over(), ease: "none",
        scrollTrigger: { trigger: el, scroller, scrub: true, start: "top top", end: () => `+=${runway()}`, invalidateOnRefresh: true, fastScrollEnd: true },
      });
      cards.forEach((c, i) => {
        const n = i % 2 === 0 ? 1 : -1, r = (Math.random() - 0.5) * 2 * tilt;
        const st = { trigger: c, containerAnimation: move, start: "left 90%", end: "right 10%", scrub: true, invalidateOnRefresh: true };
        gsap.fromTo(c, { rotation: r }, {
          rotation: -r, y: () => -(n * (innerWidth < innerHeight ? riseTall : rise)) * innerHeight, yPercent: () => 50 * n,
          yoyo: true, repeat: 1, ease: "power1.inOut", scrollTrigger: st,
        });
        gsap.to(c, { scale: grow, yoyo: true, repeat: 1, ease: "back.inOut(3)", scrollTrigger: { ...st } });
      });
    }, el);
    const ro = new ResizeObserver(() => { setRunway(); ScrollTrigger.refresh(); });
    ro.observe(track);
    return () => { ro.disconnect(); ctx.revert(); el.style.removeProperty("--fx-runway"); };
  });
})();
