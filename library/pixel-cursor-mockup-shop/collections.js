// Collection — the list panel, once within 20% of the screen bottom (after the ready gate opens), settles in only once from 20% below, .95 scale (1 below 1023 width) and transparent over .8s expo.out
(() => {
  const { reduce, $$, ready } = window.VS;
  if (reduce) return;
  const small = matchMedia("(max-width: 1023px)").matches;
  $$("[data-coll]").forEach((c) => {
    gsap.set(c, { yPercent: 20, opacity: 0, scale: small ? 1 : 0.95 });
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      ready.then(() => gsap.to(c, { yPercent: 0, opacity: 1, scale: 1, duration: 0.8, ease: "expo.out", onComplete: () => gsap.set(c, { clearProps: "transform,opacity" }) }));
    }, { rootMargin: "0px 0px -20% 0px" });
    io.observe(c);
  });

  // Header (desktop) — while the orbit is lowered (scrub 1), the title group blurs out at −50% (.4 share), and overlapping by .2 share the paragraph rises from 100% below (.4 share, 1 total).
  // When the orbit end touches the bottom of the screen, the panel is cropped to 22px on each side and 48px at the corners
  const track = document.querySelector("[data-coll-track]"), hero = document.querySelector("[data-coll-hero]");
  if (!track || !hero) return;
  gsap.matchMedia().add("(min-width: 1024px)", () => {
    const content = hero.querySelector("[data-coll-content]"), para = hero.querySelector("[data-coll-para]");
    gsap.timeline({ scrollTrigger: { trigger: track, start: "top top", end: "bottom bottom", scrub: 1 } })
      .fromTo(content, { autoAlpha: 1, yPercent: 0 }, { autoAlpha: 0, yPercent: -50, ease: "none", duration: 0.4 })
      .fromTo(para, { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, ease: "none", duration: 0.4 }, "-=0.2")
      .to({}, { duration: 1 }, 0);
    gsap.fromTo(hero, { clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: "inset(0px 22px 0px 22px round 48px)", ease: "none", scrollTrigger: { trigger: track, start: "bottom bottom", end: "bottom top", scrub: 1 } });
  });
})();
