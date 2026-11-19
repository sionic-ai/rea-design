// Service 1: header timeline (line lift + two photos opening from top left) → scattered frame parallax → big sentence → full-bleed photo → contact section.
// When arriving from another page, keeps the header timeline paused and plays it with start .12s after the curtain begins to lift (original autoplay:false)
FW.page("service", (box, { internal }) => {
  if (FW.reduced) return {};
  const $ = (s, r = box) => r.querySelector(s);
  const $$ = (s, r = box) => [...r.querySelectorAll(s)];

  const head = gsap.timeline({ paused: internal })
    .to($$(".ph__title .fw-line"), { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0.1)
    .to($$(".ph__copy .fw-line"), { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out" }, 0.25)
    .to(".ph__main", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.35, ease: "power3.inOut" }, 0.15)
    .to(".ph__small", { clipPath: "inset(0% 0% 0% 0%)", duration: 1.35, ease: "power3.inOut" }, 0.35);
  gsap.fromTo(".ph__main .ph__inner", { yPercent: 5, scale: 1.08 }, { yPercent: -5, ease: "none", scrollTrigger: { trigger: ".ph__main", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".ph__small .ph__inner", { yPercent: 2, scale: 1.04 }, { yPercent: -2, ease: "none", scrollTrigger: { trigger: ".ph__small", start: "top bottom", end: "bottom top", scrub: true } });

  $$(".pe__text").forEach((t) =>
    FW.line($$(".fw-line", t), { scrollTrigger: { trigger: t, start: "top 85%", toggleActions: "play none none none" } }));
  $$(".pe__media").forEach((m, i) => {
    const d = i % 2 === 0 ? 60 : 40;
    gsap.fromTo(m, { y: d }, { y: -d, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: 1.2 } });
    gsap.fromTo($(".pe__img", m), { yPercent: 6, scale: 1.1 }, { yPercent: -6, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
  });

  FW.line($$(".pst__text .fw-line"), { scrollTrigger: { trigger: ".pst__text", start: "top 85%", toggleActions: "play none none none" } });
  gsap.fromTo(".pfb__img", { yPercent: -12, scale: 1.3 }, { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".pfb__wrap", start: "top bottom", end: "bottom top", scrub: true } });
  FW.cta($(".fw-cta"));
  return { start: () => head.play() };
});
