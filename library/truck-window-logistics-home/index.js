// Home: city strip·van art insert, truck window Splide (fade · 3s every 3.5s), gallery horizontal pin (overflow width × 2 scroll), business card stacking (150% per card)
// Pinned sections must be computed in document order for the spacing to line up — create them after the intro pin (pin-step-fade motion part) attaches on DOMContentLoaded
(() => {
  document.querySelectorAll("[data-city]").forEach((el) => el.insertAdjacentHTML("afterbegin", KM.svg.cityStrip));
  document.querySelectorAll("[data-van]").forEach((el) => (el.innerHTML = KM.svg.van));

  const slider = document.querySelector(".km-kv__slider");
  if (slider) new Splide(slider, { arrows: false, pagination: false, type: "fade", rewind: true, autoplay: true, interval: 3500, speed: 3000, drag: false, pauseOnFocus: false, pauseOnHover: false, reduceMotion: false }).mount();

  const head = () => document.querySelector(".km-head")?.offsetHeight || 0;
  // As in the original, the fixed start matches the header band height. Options are written before the part is attached
  const about = document.querySelector(".km-about");
  if (about) about.dataset.fxPinStepFade = `start: top ${head()}px; priority: 3`;
  addEventListener("DOMContentLoaded", () => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const gallery = document.querySelector(".km-gallery"), track = gallery?.querySelector("[data-gallery-track]");
      if (track) {
        const over = () => Math.max(0, track.scrollWidth - innerWidth);
        gsap.to(track, { x: () => -over(), ease: "none", scrollTrigger: { trigger: gallery, start: () => `top ${head()}px`, end: () => `+=${over() * 2}`, pin: true, scrub: true, invalidateOnRefresh: true, refreshPriority: 2 } });
      }
      const service = document.querySelector(".km-service"), cards = service ? service.querySelectorAll("[data-service-card]") : [];
      if (cards.length > 1) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: service, start: () => `top ${head()}px`, end: `+=${cards.length * 150}%`, pin: true, scrub: true, invalidateOnRefresh: true, refreshPriority: 1 } });
        cards.forEach((c) => tl.fromTo(c, { yPercent: 120 }, { yPercent: 0, ease: "none" }));
      }
    });
    ScrollTrigger.refresh();
  });
})();
