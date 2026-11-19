// Home page — while the loader shows its text, scroll and video are paused. When it ends they resume, and the hero logo appears 1.5s later over 1s.
// In the About section, the photo opens top to bottom in 1.5s once it reaches the screen center. Press releases use Swiper (3.7 slides · 1s), in the footer a white veil (.94) covers the page with scroll scrub 2.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const video = document.querySelector(".mw-fv__video");
  const logo = document.querySelector("[data-mv-logo]");
  const loader = document.querySelector(".mw-loader");
  gsap.registerPlugin(ScrollTrigger);

  loader?.addEventListener("fx:start", () => {
    window.mwLenis?.stop();
    video?.pause();
    if (logo) gsap.set(logo, { opacity: 0, y: "1rem" });
  });
  loader?.addEventListener("fx:done", () => {
    window.mwLenis?.start();
    video?.play().catch(() => {});
    if (logo && !reduce) gsap.to(logo, { opacity: 1, y: 0, duration: 1, delay: 1.5 });
  });

  const about = document.querySelector("[data-about]");
  const img = document.querySelector("[data-about-img]");
  if (about && img) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ paused: true }).to(img, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5 });
      ScrollTrigger.create({ trigger: about, start: "top center", onEnter: () => tl.play(), onEnterBack: () => tl.play() });
    });
    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => { gsap.set(img, { clipPath: "inset(0% 0% 0% 0%)" }); });
  }

  if (window.Swiper) {
    const wide = matchMedia("(min-width: 768px)").matches;
    new Swiper(".mw-press__swiper", { slidesPerView: wide ? 3.7 : 1.1, speed: 1000 });
  }

  const foot = document.querySelector(".mw-foot");
  if (foot && !reduce) {
    gsap.fromTo(foot, { "--site-foot-veil": 0 }, { "--site-foot-veil": 0.94, ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: 2 } });
  } else foot?.style.setProperty("--site-foot-veil", "0.94");
})();
