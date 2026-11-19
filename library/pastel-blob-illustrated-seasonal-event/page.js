// Subpage sections — text flowing along a curve (bound to scroll), name list with hover photo swap, video press, number underline, photo strip (swiper 11 · slidesPerView auto · original default speed 300ms).
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Curved text — while the section passes the screen, the first line flows right from −60% to 10% and the second flows the opposite way
    document.querySelectorAll(".w-curve [data-curve]").forEach((tp) => {
      const first = tp.dataset.curve === "1";
      gsap.fromTo(tp, { attr: { startOffset: first ? "-60%" : "40%" } }, { attr: { startOffset: first ? "10%" : "-30%" }, ease: "none",
        scrollTrigger: { trigger: tp.closest(".w-curve"), start: "top bottom", end: "bottom top", scrub: true } });
    });
    // Number underline — when visible, it is drawn from the left in 1.1s
    gsap.utils.toArray(".a-stat__line").forEach((l, i) => gsap.fromTo(l, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power3.out", delay: (i % 3) * 0.1, scrollTrigger: { trigger: l, start: "top 90%" } }));
  });

  // Name list — hovering a name changes the photo inside the blob
  document.querySelectorAll(".w-list").forEach((list) => {
    const imgs = list.querySelectorAll(".w-list__img");
    list.querySelectorAll("[data-preview]").forEach((a) => a.addEventListener("pointerenter", () => {
      imgs.forEach((im, i) => im.classList.toggle("is-on", i === +a.dataset.preview));
    }));
  });

  // Video — pressing removes the play button (placeholder video)
  document.querySelectorAll(".a-campaign__play").forEach((b) => b.addEventListener("click", () => b.closest(".a-campaign__video").classList.add("is-play")));

  // Photo strip
  const sw = document.querySelector(".d-share__swiper");
  if (sw && window.Swiper) {
    new Swiper(sw, { slidesPerView: "auto", navigation: { prevEl: "[data-share-prev]", nextEl: "[data-share-next]" } });
  }
})();
