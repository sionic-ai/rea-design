// About the company — blurred title sharpens with scroll, the group photo flows late, and the hero sound button toggles it
(() => {
  if (!window.gsap) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sound = document.querySelector(".q-sound");
  sound?.addEventListener("click", () => {
    const on = sound.getAttribute("aria-pressed") !== "true";
    sound.setAttribute("aria-pressed", String(on));
    sound.firstChild.nodeValue = on ? "Sound Off" : "Sound On";
  });
  // Photo gallery — original Gallery: a big photo swiper (loop·centered·gap 10, one slide from 992, linked with the thumbnails) and a thumbnail row (loop·width auto·gap 15·by the pressed one).
  // On desktop the left half and right half are the paging zones, and over them the Previous/Next text follows the mouse position (relative to the gallery) every frame
  const gal = document.querySelector("[data-a-gallery]");
  if (gal && window.Swiper) {
    const thumbs = new Swiper(gal.querySelector(".a-gallery__thumbs"), { loop: true, watchSlidesProgress: true, slideToClickedSlide: true, spaceBetween: 15, slidesPerView: "auto" });
    const main = new Swiper(gal.querySelector(".a-gallery__main"), { loop: true, grabCursor: true, centeredSlides: true, spaceBetween: 10, breakpoints: { 0: { slidesPerView: "auto" }, 992: { slidesPerView: 1 } }, thumbs: { swiper: thumbs, slideThumbActiveClass: "is-on" } });
    gal.querySelectorAll("[data-type]").forEach((z) => z.addEventListener("click", () => (z.dataset.type === "prev" ? main.slidePrev() : main.slideNext())));
    const cur = gal.querySelector(".a-gallery__cursor");
    const arrow = (r) => `<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" style="transform:rotate(${r}deg)"><path d="M9 2v14M3 10l6 6 6-6"/></svg>`;
    gsap.matchMedia().add("(min-width: 992px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      let x = 0, y = 0, busy = false;
      // Original measures gallery positions on scroll, but smooth scrolling (smooth 2) keeps moving for nearly 2s after the last scroll event so that value drifts — measure on the drawing frame
      const move = (e) => {
        x = e.clientX; y = e.clientY;
        if (busy) return;
        busy = true;
        requestAnimationFrame(() => { const box = gal.getBoundingClientRect(); cur.style.left = `${x - box.left}px`; cur.style.top = `${y - box.top}px`; busy = false; });
      };
      const enter = (e) => { cur.innerHTML = e.currentTarget.dataset.type === "prev" ? `${arrow(90)}<span>Previous</span>` : `<span>Next</span>${arrow(-90)}`; cur.classList.add("is-on"); };
      const leave = () => { cur.classList.remove("is-on"); cur.innerHTML = ""; };
      const zones = gal.querySelectorAll("[data-type]");
      addEventListener("mousemove", move);
      zones.forEach((z) => { z.addEventListener("mouseenter", enter); z.addEventListener("mouseleave", leave); });
      return () => { removeEventListener("mousemove", move); zones.forEach((z) => { z.removeEventListener("mouseenter", enter); z.removeEventListener("mouseleave", leave); }); leave(); };
    });
  }
  if (reduce) { gsap.set("[data-a-blur]", { filter: "blur(0px)" }); return; }
  gsap.fromTo("[data-a-blur]", { filter: "blur(14px)", opacity: 0.6 }, { filter: "blur(0px)", opacity: 1, ease: "none", scrollTrigger: { trigger: ".a-blur", start: "top bottom", end: "center center", scrub: true } });
  gsap.fromTo("[data-q-parallax]", { yPercent: 0 }, { yPercent: -15, ease: "none", scrollTrigger: { trigger: ".a-photo", start: "top bottom", end: "bottom top", scrub: true } });
})();
