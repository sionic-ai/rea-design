// Careers: first entrance — the title and button of the yellow header panel start at the bottom edge of the screen and rise over 1.2s power3.inOut while the yellow background panel lifts away by the same amount,
// Title words .08 apart .5s, button row .8s power2.out, body 1s. The horizontal photo strip stays pinned at screen center and flows left by the scroll amount (scrub 1)
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const hero = $(".an-careers-hero"), title = $(".an-careers-hero__title"), content = $(".an-careers-hero__content"), bg = $(".an-careers-hero__bg");
  const cta = $(".an-careers-hero__cta"), body = $(".an-careers-content");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hero && title && content) document.fonts.ready.then(() => {
    if (reduce) { gsap.set([title, body], { autoAlpha: 1 }); return; }
    gsap.matchMedia().add({ desk: "(min-width: 992px)", mob: "(max-width: 991.98px)" }, (ctx) => {
      const tl = gsap.timeline({ onComplete: () => document.body.classList.add("intro-done") });
      tl.addLabel("revealTitle", 0);
      window.anMotion.splitWords(title, tl, "revealTitle", false);
      gsap.set(cta, { autoAlpha: 0, yPercent: 100 });
      tl.to(cta, { autoAlpha: 1, duration: 0.8, yPercent: 0, ease: "power2.out", stagger: 0.15 }, "-=0.5");
      if (ctx.conditions.desk) {
        const pad = parseFloat(getComputedStyle($(".an-content")).paddingTop) || 0;
        const room = () => (window.visualViewport?.height ?? innerHeight) - pad;
        const off = () => room() - hero.offsetHeight;
        if (hero.getBoundingClientRect().height < room()) {
          gsap.set(content, { y: off() });
          tl.to(content, { y: 0, autoAlpha: 1, duration: 1.2, ease: "power3.inOut" }, "-=0.6");
          if (bg) tl.to(bg, { y: -off(), duration: 1.2, ease: "power3.inOut", onComplete: () => gsap.set(bg, { clearProps: "transform", top: "auto", bottom: 0 }) }, "<");
        }
      }
      tl.to(body, { autoAlpha: 1, duration: 1 }, "<");
    });
  });

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const strip = $(".an-hscroll__track");
    if (!strip) return;
    const vw = () => document.documentElement.clientWidth;
    const dist = () => -(strip.scrollWidth - vw() + (vw() - strip.offsetWidth));
    const tl = gsap.timeline();
    tl.to(strip, { x: dist, ease: "none" });
    ScrollTrigger.create({ trigger: strip, start: "center center", end: () => "+=" + Math.abs(dist()), pin: true, animation: tl, scrub: 1, invalidateOnRefresh: true });
  });
})();
