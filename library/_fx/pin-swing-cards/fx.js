// Pin the section to the screen and push the card row left by its own width as you scroll (scrub .5). Each card is randomly tilted (±10~20°, horizontal ±30~50%, vertical ±20~30%)
// Enters from 110% on the right and passes by tilted backward until it leaves at −20% (scrub .4). The start title turns off when the first card reaches screen center, and the end title turns on when the last card reaches 80%
// — Brand ”From concept … to craft” (original CardScroller)
(() => {
  kfFx.register("pin-swing-cards", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!track || !cards.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const first = el.querySelector('[data-fx-part="start"]'), last = el.querySelector('[data-fx-part="end"]');
    const rnd = (a, b) => (Math.random() * a + b) * (Math.random() < 0.5 ? 1 : -1);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (reduce) return;
      const move = gsap.to(track, {
        x: () => -track.clientWidth, ease: "none",
        scrollTrigger: { trigger: el, scroller, pin: true, scrub: +(options.scrub ?? 0.5), start: "top top", end: () => "+=" + track.clientWidth, invalidateOnRefresh: true },
      });
      if (first) gsap.to(first, { autoAlpha: 0, ease: "none", scrollTrigger: { trigger: cards[0], scroller, containerAnimation: move, start: "left 50%", end: "-=50px", scrub: true, invalidateOnRefresh: true } });
      if (last) gsap.to(last, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: cards[cards.length - 1], scroller, containerAnimation: move, start: "right 80%", end: "-=100px", scrub: true, invalidateOnRefresh: true } });
      const tilt = +(options.tilt ?? 10), dx = +(options.dx ?? 30), dy = +(options.dy ?? 20);
      cards.forEach((card) => {
        const r = { x: rnd(20, dx), y: rnd(10, dy), rotation: rnd(10, tilt) };
        gsap.fromTo(card, { rotation: r.rotation, xPercent: r.x, yPercent: r.y }, {
          rotation: -r.rotation, xPercent: -r.x, yPercent: -r.y, ease: "none",
          scrollTrigger: { trigger: card, scroller, containerAnimation: move, start: "left 110%", end: "right -20%", scrub: +(options.swing ?? 0.4), invalidateOnRefresh: true },
        });
      });
      // If the card row width changes late because of images or fonts, re-measure the fixed length
      const ro = new ResizeObserver(() => ScrollTrigger.refresh());
      ro.observe(track);
      return () => ro.disconnect();
    });
    return () => mm.revert();
  });
})();
