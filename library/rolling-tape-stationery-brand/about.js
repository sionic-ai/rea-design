(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Pill strip: each row flows the opposite way
    $$(".sa-pack__row").forEach((row) => {
      const dir = +row.dataset.dir;
      gsap.fromTo(row, { xPercent: dir > 0 ? -18 : 0 }, { xPercent: dir > 0 ? 0 : -18, ease: "none", scrollTrigger: { trigger: ".sa-pack", start: "top bottom", end: "bottom top", scrub: true } });
    });
    // Torn paper rises at a tilt and the roll rolls
    gsap.from(".sa-note__paper", { yPercent: 30, rotation: 4, ease: "none", scrollTrigger: { trigger: ".sa-note", start: "top bottom", end: "center center", scrub: true } });
    gsap.to(".sa-note__roll", { rotation: 360, y: "-6vw", ease: "none", scrollTrigger: { trigger: ".sa-note", start: "top bottom", end: "bottom top", scrub: true } });
    // A curved text band flows and badges pop out
    const tp = $(".sa-loud textPath");
    const o = { v: 0 };
    gsap.to(o, { v: -60, ease: "none", onUpdate: () => tp.setAttribute("startOffset", `${o.v}%`), scrollTrigger: { trigger: ".sa-loud", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".sa-badge", { scale: 0.2, rotation: -25, opacity: 0, duration: 0.7, ease: "back.out(2.2)", stagger: 0.12, scrollTrigger: { trigger: ".sa-loud", start: "top 60%" } });
    // Newspaper scraps, photos, and boxes at different speeds
    [[".sa-clip", -10], [".sa-hero__photo", -20], [".sa-box", 6]].forEach(([s, v]) => gsap.to(s, { y: `${v}vw`, ease: "none", scrollTrigger: { trigger: ".sa-hero", start: "top top", end: "bottom top", scrub: true } }));
  });
})();
