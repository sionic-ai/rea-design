// Home page — Hero copy sequence (original gsapStyle timeline: English .8s · wavy line 1.0s · two-line serif 2.0s), News and course Swiper (original settings as is)
(() => {
  const main = document.querySelector(".js-main");
  // Each letter as its own cell — words are grouped as chunks and spaces between are left as is. As in the original, .03s delay per letter (spaces not counted)
  if (main) {
    let k = 0;
    main.innerHTML = main.textContent.trim().split(" ").map((w) => `<span class="w">${[...w].map((ch) => `<span class="c" style="transition-delay:${(k++ * 0.03).toFixed(2)}s">${ch}</span>`).join("")}</span>`).join(" ");
  }
  const marks = [[".js-main", 0.8], [".js-anime-object", 1.0], [".js-sub-top", 2.0], [".js-sub-bottom", 2.0]];
  if (window.gsap) {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline();
      marks.forEach(([sel, at]) => tl.call(() => document.querySelector(sel)?.classList.add("is-show"), null, at));
    });
    mm.add("(prefers-reduced-motion: reduce)", () => { marks.forEach(([sel]) => document.querySelector(sel)?.classList.add("is-show")); });
  }

  if (window.Swiper) {
    new Swiper(".sk-swiper-info", { slidesPerView: "auto", spaceBetween: 16, grabCursor: true, breakpoints: { 767: { slidesPerView: "auto" }, 768: { enabled: false } } });
    new Swiper(".sk-swiper-course", {
      slidesPerView: "auto", grabCursor: true, spaceBetween: 16,
      navigation: { nextEl: ".sk-course-next", prevEl: ".sk-course-prev" },
      breakpoints: { 768: { spaceBetween: 24 } },
    });
  }
})();
