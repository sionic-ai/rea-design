// First page — hooks scroll lock and the first video to the loader event, and gives each photo scroll parallax with the original values
(() => {
  const body = document.body;
  const PC = "(min-width: 769px) and (prefers-reduced-motion: no-preference)";
  const SP = "(max-width: 768px) and (prefers-reduced-motion: no-preference)";

  // Plays when visible, pauses and returns to the start when off screen — original mvVideo·concept
  const playInView = (trigger, v) => ScrollTrigger.create({
    trigger,
    onEnter: () => v.play().catch(() => {}),
    onEnterBack: () => v.play().catch(() => {}),
    onLeave: () => { v.pause(); v.currentTime = 0; },
    onLeaveBack: () => { v.pause(); v.currentTime = 0; },
  });

  // ── Loader (wordmark-curtain-loader) — when it starts rising, hook up the first video, when fully lifted, release scroll ──
  const loader = document.querySelector('[data-slot="loader"]');
  const mv = document.querySelector("[data-za-mv]");
  let mvOn = false;
  loader.addEventListener("fx:start", () => window.zaScroll.stop());
  loader.addEventListener("fx:lift", () => { if (!mvOn && mv) { mvOn = true; playInView(mv, mv.querySelector("video")); } });
  loader.addEventListener("fx:done", () => { window.zaScroll.start(); body.classList.add("is-loaded"); });

  const mm = gsap.matchMedia();
  const wrap = document.querySelector("[data-za-hero-wrap]");
  const [heroPc, heroSp] = document.querySelectorAll("[data-za-par]");
  const featPics = [...document.querySelectorAll("[data-za-feat-pic]")];
  const footPhoto = document.querySelector("[data-za-foot-photo]");
  const [footPc, footSp] = footPhoto.querySelectorAll(".wf-img");

  mm.add(PC, () => {
    gsap.timeline().fromTo(heroPc, { y: "-17rem", scale: 1.37 }, { y: "0rem", scale: 1, ease: "power1.inOut", scrollTrigger: { trigger: wrap, scrub: true, end: "bottom top" } });
    featPics.forEach((p) => gsap.fromTo(p, { y: "-30rem" }, { y: "6rem", ease: "linear", scrollTrigger: { trigger: p.closest("[data-za-feat]"), scrub: true } }));
    const cv = document.querySelector("[data-za-concept-video]");
    if (cv) playInView(cv, cv);
    gsap.fromTo("[data-za-concept] .wf-img", { y: "-20rem" }, { y: "0rem", ease: "linear", scrollTrigger: { trigger: "[data-za-concept]", scrub: true } });
    gsap.fromTo(footPc, { y: "-20rem", scale: 1.37 }, { y: "0rem", scale: 1, ease: "linear", scrollTrigger: { trigger: footPhoto, scrub: true } });
  });
  mm.add(SP, () => {
    gsap.timeline().fromTo(heroSp, { y: "-7rem", scale: 1.37 }, { y: "0rem", scale: 1, ease: "power1.inOut", scrollTrigger: { trigger: wrap, scrub: true, end: "bottom top" } });
    featPics.forEach((p) => gsap.fromTo(p, { y: "-15rem" }, { y: "2rem", ease: "linear", scrollTrigger: { trigger: p.closest("[data-za-feat]"), scrub: true } }));
    gsap.fromTo("[data-za-concept-sp] .wf-img", { y: "-8rem" }, { y: "4rem", ease: "linear", scrollTrigger: { trigger: "[data-za-concept-sp]", scrub: true } });
    gsap.fromTo(footSp, { y: "-8rem", scale: 1.15 }, { y: "6rem", scale: 1.1, ease: "linear", scrollTrigger: { trigger: footPhoto, scrub: true } });
  });
})();
