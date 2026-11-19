// Careers page — glass capsule parallax (scroll × data-speed), intro text rising along, curtain cover, apply steps pinned (scrub 1, vial in the circle rotates 32°).
(() => {
  const { PB } = window;

  function capsules(c) {
    const caps = [...c.querySelectorAll("[data-capsules] [data-speed]")];
    if (!caps.length || PB.reduce) return;
    const setters = caps.map((el) => ({ sp: +(el.dataset.speed ?? 0), set: gsap.quickSetter(el, "y", "px") }));
    const fn = () => { const y = scrollY; setters.forEach((s) => s.set(-y * s.sp)); };
    gsap.ticker.add(fn);
    PB.onLeave(() => gsap.ticker.remove(fn));
  }

  function intro(c) {
    const sec = c.querySelector("[data-careers-intro]");
    if (!sec) return;
    const wrap = sec.querySelector("[data-ci-wrap]");
    const s = PB.lines(sec.querySelector("[data-ci-text]"));
    const dia = sec.querySelector("[data-ci-diamond]");
    if (PB.reduce) return;
    gsap.set(wrap, { yPercent: 50 });
    gsap.to(wrap, { yPercent: 0, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: true } });
    gsap.set(s.lines, { yPercent: 110 });
    gsap.set(dia, { autoAlpha: 0, scale: 0.7, rotation: -180 });
    ScrollTrigger.create({
      trigger: sec, start: "top 60%", once: true,
      onEnter: () => {
        gsap.to(s.lines, { yPercent: 0, duration: 0.8, stagger: 0.1, ease: "expo.out", delay: 0.15, overwrite: true });
        gsap.to(dia, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1, ease: "expo.out", delay: 0.3 });
      },
    });
  }

  function overlay(c) {
    c.querySelectorAll("[data-overlay-sec]").forEach((sec) => {
      const ov = sec.querySelector("[data-overlay]");
      if (PB.reduce) return;
      gsap.set(ov, { opacity: 0 });
      gsap.to(ov, { opacity: 1, ease: "power2.out", scrollTrigger: { trigger: sec, start: "top bottom", end: "top top", scrub: true } });
    });
  }

  function process(c) {
    const sec = c.querySelector("[data-careers-proc]");
    if (!sec) return;
    const scrub = sec.querySelector("[data-cp-scrub]");
    const steps = [...sec.querySelectorAll("[data-cp-step]")].map((el) => {
      const lines = [...el.querySelectorAll(".rc-step__t, .rc-step__p")].flatMap((t) => PB.lines(t).lines);
      const slide = [...el.querySelectorAll(".btn, .rc-step__ic")];
      return { el, lines, slide };
    });
    const rows = [...sec.querySelectorAll("[data-cp-row]")];
    const total = steps.length;
    scrub.style.height = total * 100 + 100 + "vh";
    let active = -1;
    const show = (s) => {
      gsap.set(s.el, { autoAlpha: 1 });
      gsap.to(s.slide, { autoAlpha: 1, y: "0rem", duration: 0.8, stagger: 0.1, ease: "expo.out", delay: 0.15, overwrite: true });
      gsap.to(s.lines, { yPercent: 0, duration: 0.8, stagger: 0.1, ease: "expo.out", delay: 0.15, overwrite: true });
    };
    const hide = (s) => {
      gsap.to(s.slide, { autoAlpha: 0, y: "-1rem", duration: 0.4, ease: "power2.inOut", overwrite: true });
      gsap.to(s.lines, { yPercent: 110, duration: 0.4, stagger: 0, ease: "power2.inOut", overwrite: true });
    };
    const setActive = (i) => {
      if (i === active) return;
      if (active > -1) { hide(steps[active]); gsap.to(rows[active], { opacity: 0.35, duration: 0.4, ease: "power2.out", overwrite: true }); }
      active = i;
      show(steps[i]);
      gsap.to(rows[i], { opacity: 1, duration: 0.4, ease: "power2.out", overwrite: true });
    };
    if (PB.reduce) { steps.slice(1).forEach((s) => gsap.set(s.el, { autoAlpha: 0 })); gsap.set(rows[0], { opacity: 1 }); return; }
    steps.forEach((s) => { gsap.set(s.slide, { autoAlpha: 0, y: "1rem" }); gsap.set(s.lines, { yPercent: 110 }); });
    setActive(0);
    ScrollTrigger.create({ trigger: scrub, start: "top top", end: "bottom bottom", scrub: 1, onUpdate: (self) => setActive(Math.min(total - 1, Math.floor(self.progress * total))) });
    gsap.fromTo(sec.querySelector("[data-cp-rotate]"), { rotate: 0 }, { rotate: 32, ease: "none", scrollTrigger: { trigger: scrub, start: "top top", end: "bottom bottom", scrub: 1 } });
  }

  PB.page("recruit", {
    init(c) {
      capsules(c);
      intro(c);
      PB.trackBand(c);
      overlay(c);
      process(c);
    },
  });
})();
