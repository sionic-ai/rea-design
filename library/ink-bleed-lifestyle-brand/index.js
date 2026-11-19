// Home page: Hero fade transition (Splide — crossfades over 3s every 5s), service section (title panel pinned for one screen → horizontal strip pinned with scrub 1 → at the end an ink-bleed background opens and closes),
// Hovering over the company list swaps the small photo on the left in .3s.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const kv = document.querySelector("[data-kv-slider]");
  if (kv && window.Splide) {
    new Splide(kv, { autoplay: !reduce, type: "fade", rewind: true, pauseOnHover: false, pauseOnFocus: false, interval: 5000, speed: 3000, pagination: false, drag: false, arrows: false }).mount();
  }

  const sec = document.querySelector(".ab-service");
  if (sec && !reduce) {
    const intro = sec.querySelector(".ab-service__intro");
    const title = sec.querySelector(".ab-service__title");
    gsap.set(title, { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: intro, start: "top top", end: "+=100%", scrub: true, pin: true, anticipatePin: 1 } })
      .fromTo(title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 })
      .to(title, { opacity: 0, duration: 0.3 }, "+=0.4");

    const slider = sec.querySelector(".ab-service__slider");
    const slides = [...sec.querySelectorAll(".ab-service__slide")];
    const c = slides.length + 1;
    gsap.set(slider, { opacity: 0, scale: 0.95, width: `${c * 100}%` });
    gsap.set(slides, { width: `${100 / c}%` });
    const tl = gsap.timeline({ scrollTrigger: { trigger: slider, start: "top top", end: () => `+=${slider.offsetWidth - innerWidth + innerHeight * 2}`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.to(slider, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" });
    const F = 3;
    tl.to(slides, { xPercent: -100 * (c - 1), ease: "none", duration: F }, ">");
    // Each section shrinks to .8x and disappears on its own turn (.6, power1.inOut)
    slides.forEach((s, i) => {
      const at = 0.5 + (F / (c - 1)) * i;
      tl.to(s, { opacity: 0, scale: 0.8, ease: "power1.inOut", duration: 0.6 }, at);
      const fig = s.querySelector(".ab-service__fig");
      if (fig) tl.to(fig, { opacity: 0, ease: "power1.inOut", duration: 0.6 }, at);
    });
    // When the last section exits the background turns on and the ink cover spreads from top (200%) to bottom (500%), and rewinds over the same length after the band ends
    const bg = sec.querySelector(".ab-service__bg");
    const img = bg.querySelector(".ab-service__bg-img");
    const p = 0.5 + F * ((c - 2) / (c - 1)), v = 0.5 + F, b = v - p;
    tl.fromTo(bg, { opacity: 0 }, { opacity: 1, ease: "none", duration: b }, p)
      .fromTo(img, { "--mask-y": 0, "--mask-size": 200 }, { "--mask-y": 100, "--mask-size": 500, ease: "none", duration: b }, p);
    const m = slider.offsetWidth - innerWidth;
    const S = v * (innerHeight / Math.max(1, m));
    tl.fromTo(bg, { opacity: 1 }, { opacity: 0, ease: "none", duration: S }, v + S)
      .fromTo(img, { "--mask-y": 100, "--mask-size": 500 }, { "--mask-y": 0, "--mask-size": 200, ease: "none", duration: S }, v + S);
  }

  // Company list: only the hovered row’s photo turns on in .3s (cubic-bezier(.165,.84,.44,1)) and turns off on leave — empty by default like the original
  document.querySelectorAll(".ab-company__list a[data-img]").forEach((a) => {
    const fig = document.querySelector(`.ab-company__fig-left[data-img-for="${a.dataset.img}"]`);
    if (!fig) return;
    a.addEventListener("mouseenter", () => fig.classList.add("is-active"));
    a.addEventListener("mouseleave", () => fig.classList.remove("is-active"));
  });
})();
