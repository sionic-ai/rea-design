// Work example modal — original dialog component: show lifts the backdrop and pane, and on the next frame open raises the photo pane and sets up two Splide layers (a fade large photo + a small photo strip at 1.6s).
// The original fetches the photo from the server by post number in between — the copy has nothing to fetch, so it opens right away
(() => {
  const modal = document.querySelector(".jd-modal");
  if (!modal) return;
  let main = null, thumbs = null;
  const mount = () => {
    if (main || !window.Splide) return;
    main = new Splide(modal.querySelector(".jd-modal__main"), { type: "fade", pagination: false, drag: true, updateOnMove: true, omitEnd: true, breakpoints: { 960: { drag: false } } });
    thumbs = new Splide(modal.querySelector(".jd-modal__thumbs"), { mediaQuery: "min", speed: 1600, gap: 6, pagination: false, isNavigation: true, arrows: false, updateOnMove: true, fixedWidth: "4.5rem", dragMinThreshold: 10, breakpoints: { 768: { gap: 8, fixedWidth: "6.5rem" } } });
    main.sync(thumbs);
    main.mount();
    thumbs.mount();
  };
  const set = (on) => {
    modal.classList.toggle("is-show", on);
    modal.setAttribute("aria-hidden", String(!on));
    // The original does not stop lenis even when a modal opens — wheel over the panel scrolls only inside the panel via data-lenis-prevent
    if (on) requestAnimationFrame(() => { modal.classList.add("is-open"); mount(); });
    else modal.classList.remove("is-open");
  };
  document.querySelectorAll("[data-dialog]").forEach((b) => b.addEventListener("click", () => set(true)));
  modal.querySelectorAll("[data-dialog-close]").forEach((b) => b.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-show")) set(false); });
})();

// Color list background — turns on when entering at the original x-intersect.threshold.15, turns off at x-intersect:leave (fully out)
(() => {
  const box = document.querySelector(".jd-colors"), bg = box && box.querySelector(".jd-colors__bg");
  if (!bg || !("IntersectionObserver" in window)) return bg && bg.classList.add("is-show");
  new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) bg.classList.add("is-show"); }, { threshold: 0.15 }).observe(box);
  new IntersectionObserver((es) => { if (es.some((e) => !e.isIntersecting)) bg.classList.remove("is-show"); }).observe(box);
})();
