// Two sub-page sliders — same Swiper 12 settings as the original: club photos (one at a time · infinite · 400ms), daily schedule cards (width auto · stop at end · 40px gap · 400ms)
(() => {
  document.querySelectorAll("[data-cl-prev], [data-cl-next], [data-sch-prev], [data-sch-next]").forEach((b) => { b.innerHTML = ec.ARROW + ec.ARROW; });
  // Interview Hero INTERVIEW band — 50px per second like the original (100000px in 2000s)
  document.querySelectorAll(".dt-fv__loop").forEach((t) => requestAnimationFrame(() => t.style.setProperty("--dur", `${(t.scrollWidth / 2 / 50).toFixed(1)}s`)));
  // Pressing the dinosaur shows a speech bubble for 2s, then it tucks away
  document.querySelectorAll("[data-dino]").forEach((b) => b.addEventListener("click", () => { b.classList.add("is-active"); setTimeout(() => b.classList.remove("is-active"), 2000); }));
  if (!window.Swiper) return;
  const club = document.querySelector("[data-cl-slider]");
  if (club) new Swiper(club, { slidesPerView: 1, loop: true, speed: 400, navigation: { prevEl: "[data-cl-prev]", nextEl: "[data-cl-next]" } });
  const sch = document.querySelector("[data-sch-swiper]");
  if (sch) new Swiper(sch, { slidesPerView: "auto", loop: false, speed: 400, allowTouchMove: true, spaceBetween: 40, navigation: { prevEl: "[data-sch-prev]", nextEl: "[data-sch-next]" } });
})();
