// About page — journey (pinned 2.5 screens, scrub 1.2), timeline horizontal band (scrub 1), glass square row. The timeline band is also used by the Careers page.
(() => {
  const { PB } = window;

  // Timeline — pin the section to the screen and flow the strip left by (strip width − screen width). Items go from y 20 to 0 on reaching 75% of the screen
  PB.trackBand = (c) => {
    c.querySelectorAll("[data-track]").forEach((sec) => {
      const band = sec.querySelector("[data-track-band]");
      const dist = () => Math.max(0, band.scrollWidth - innerWidth);
      const size = () => (sec.style.height = `${innerHeight + dist()}px`);
      size();
      const ro = new ResizeObserver(() => { size(); ScrollTrigger.refresh(); });
      ro.observe(band);
      PB.onLeave(() => ro.disconnect());
      if (PB.reduce) return;
      gsap.to(band, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${dist()}`, scrub: 1, invalidateOnRefresh: true } });
      sec.querySelectorAll("[data-track-item]").forEach((it) => {
        gsap.fromTo(it, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: it, start: "top 75%", once: true } });
      });
    });
  };

  function journey(c) {
    const sec = c.querySelector("[data-journey]");
    if (!sec) return;
    const states = [...sec.querySelectorAll("[data-jr-state]")].map((el) => ({ el, lines: [...el.children].flatMap((t) => PB.lines(t).lines) }));
    const dia = sec.querySelector("[data-jr-diamond]");
    const imgs = sec.querySelectorAll("[data-jr-img]");
    const band = sec.querySelector("[data-jr-band]");
    if (PB.reduce) { gsap.set(states[1].el, { autoAlpha: 0 }); return; }
    states.forEach((s) => gsap.set(s.lines, { yPercent: 110 }));
    gsap.set(dia, { xPercent: -50, yPercent: -50, autoAlpha: 0, scale: 0.7, rotation: -180 });
    gsap.set(imgs, { scale: 0.9, opacity: 0 });
    let cur = 0;
    const show = (s) => gsap.to(s.lines, { yPercent: 0, duration: 0.8, stagger: 0.1, ease: "expo.out", delay: 0.15, overwrite: true });
    const hide = (s) => gsap.to(s.lines, { yPercent: 110, duration: 0.4, stagger: 0, ease: "power2.inOut", overwrite: true });
    const setState = (n) => {
      if (n === cur) return;
      const prev = cur; cur = n;
      if (prev) hide(states[prev - 1]);
      if (n) show(states[n - 1]);
      if (n && !prev) gsap.to(dia, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1, ease: "expo.out", overwrite: true });
      else if (!n) gsap.to(dia, { autoAlpha: 0, scale: 0.7, rotation: -180, duration: 0.4, ease: "power2.inOut", overwrite: true });
      else gsap.to(dia, { rotation: n === 2 ? 90 : 0, duration: 0.5, ease: "back.out(1.7)", overwrite: true });
    };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: "top top", end: "bottom bottom", scrub: 1.2,
        onUpdate: (self) => setState(self.progress < 0.04 ? 0 : self.progress < 0.55 ? 1 : 2),
      },
    });
    tl.fromTo(band, { width: "100vw", x: "0vw" }, { width: "38vw", x: "31vw", ease: "none", duration: 0.6 }, 0);
    imgs.forEach((im, i) => tl.to(im, { scale: 1, opacity: 1, duration: 0.18, ease: "none" }, 0.08 + i * 0.12));
    tl.to(band, { y: () => innerHeight * 0.4, ease: "none", duration: 0.3 }, 0.7);
  }

  PB.page("about", {
    init(c) {
      const stop = PB.heroGL(c.querySelector("[data-sub-gl]"));
      const umask = c.querySelector("[data-sub-umask]");
      const reveal = () => (PB.reduce ? gsap.set(umask, { scaleY: 0 }) : gsap.to(umask, { delay: 0.5, scaleY: 0, transformOrigin: "center bottom", duration: 5, ease: "expo.out" }));
      if (document.readyState === "complete") reveal(); else addEventListener("load", reveal, { once: true });
      journey(c);
      PB.trackBand(c);
      return stop;
    },
  });
})();
