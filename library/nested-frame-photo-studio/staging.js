// Service 3: header (title line rises + before/after photos open .18s apart) → charcoal before/after comparison (label pinned, after photo wipes over by scrub).
FW.page("staging", (box, { k, internal }) => {
  if (FW.reduced) return {};
  const $ = (s, r = box) => r.querySelector(s);

  const lines = gsap.to(".sh__tline > span", { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out", paused: internal });
  // The original plays the before/after photo opening right as it’s attached (after 0.16s), and raises only the title line at start
  const tl = gsap.timeline({ delay: 0.16 });
  [$(".sh__after"), $(".sh__before")].forEach((el, i) => {
    const img = $(".wf-img", el);
    gsap.set(img, { scale: 1.12, transformOrigin: "center center" });
    tl.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.45, ease: "power4.inOut" }, i * 0.18);
    tl.to(img, { scale: 1, duration: 1.65, ease: "power3.out" }, i * 0.18 + 0.04);
  });
  gsap.to(".sh__after .wf-img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".sh", start: "top top", end: "bottom top", scrub: 1.2 } });
  gsap.to(".sh__before", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".sh", start: "top bottom", end: "bottom top", scrub: 1 } });

  k.mm.add("(min-width: 1025px)", () => {
    ScrollTrigger.create({ trigger: ".vs__split", start: "top 30%", end: "bottom 60%", pin: ".vs__labels", pinSpacing: false });
  });
  gsap.set([".vs__label.is-after", ".vs__sub.is-after"], { y: 0, yPercent: 100 });
  gsap.timeline({ scrollTrigger: { trigger: ".vs__frame", start: "center 65%", end: "center 45%", scrub: true } })
    .fromTo(".vs__img.is-after", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "none" }, 0)
    .to([".vs__label.is-before", ".vs__sub.is-before"], { yPercent: -100, duration: 0.3, ease: "none" }, 0.35)
    .to([".vs__label.is-after", ".vs__sub.is-after"], { yPercent: 0, duration: 0.3, ease: "none" }, 0.35);

  FW.cta($(".fw-cta"));
  return { start: () => lines.play() };
});
