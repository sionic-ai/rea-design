// Work page — header (attached video 100vh→50vh · shape polygon reveal · width 70%) · overlapping cards (previous card .9x · blurred) · glass-crack contact.
(() => {
  const { PB } = window;

  function hero(c) {
    const sec = c.querySelector("[data-wwd-hero]");
    if (!sec || PB.reduce) return;
    const shape = sec.querySelector("[data-wwd-shape]");
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "+=50%", scrub: true } })
      .to(sec.querySelector("[data-wwd-wrap]"), { opacity: 0, ease: "none" }, 0);
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 25%", end: "bottom bottom", scrub: true } })
      .fromTo(sec.querySelector("[data-wwd-video]"), { height: "100vh" }, { height: "50vh", ease: "none" }, 0)
      .fromTo(shape, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" }, { clipPath: "polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)", ease: "none" }, 0)
      .to(sec.querySelector("[data-wwd-shape-img]"), { width: "70%", ease: "none" }, 0);
  }

  // While the next card enters from the bottom of the screen and reaches the top, the previous card shrinks to .9x and fades to .4
  function cards(c) {
    const list = [...c.querySelectorAll("[data-wwd-card]")];
    if (PB.reduce || innerWidth < 768) return;
    list.slice(0, -1).forEach((card, i) => {
      const next = list[i + 1];
      gsap.fromTo(card, { opacity: 1, scale: 1 }, { opacity: 0.4, scale: 0.9, ease: "none", scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true } });
    });
  }

  function glassCta(c) {
    const sec = c.querySelector(".sv-partner[data-glass-split]");
    if (!sec) return;
    const ci = sec.querySelector(".hm-concept__ci"), sq = sec.querySelector(".hm-concept__sq");
    const gap = () => 2.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (PB.reduce) { gsap.set(ci, { x: -(sq.offsetWidth + gap()) / 2 }); gsap.set(sq, { x: (ci.offsetWidth + gap()) / 2 }); return; }
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "clamp(bottom bottom)", toggleActions: "play none none reverse", invalidateOnRefresh: true } })
      .to(ci, { x: () => -(sq.offsetWidth + gap()) / 2, duration: 1.5, ease: "expo.out" }, 0)
      .to(sq, { x: () => (ci.offsetWidth + gap()) / 2, duration: 1.5, ease: "expo.out" }, 0);
  }

  PB.page("service", {
    init(c) {
      hero(c);
      cards(c);
      glassCta(c);
    },
  });
})();
