// Product detail — original app.js with the same settings: photo is Swiper fade (crossFade) + thumbnail row (slidesPerView auto · freeMode · jump to the clicked cell), the current thumbnail gets is-thumb-active.
// The table of contents sets is-section-currented on the link of the section inside the central 20% band of the screen (rootMargin −40% 0 −40%). TOC links scroll up by header height + 20px in .7s power2.out.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Swiper) {
    const thumbs = new Swiper(".pdd-thumbs", { slidesPerView: "auto", spaceBetween: 10, freeMode: true, watchSlidesProgress: true, slideToClickedSlide: true });
    new Swiper(".pdd-slider", { effect: "fade", fadeEffect: { crossFade: true }, slidesPerView: 1, watchSlidesProgress: true, speed: reduce ? 0 : 550, thumbs: { swiper: thumbs, multipleActiveThumbs: true, slideThumbActiveClass: "is-thumb-active" } });
    // The pressed thumbnail becomes the current slot and its pointer-events are turned off — in the original the cursor dot shrinks at that moment (re-watched). Signals the same departure
    thumbs.on("click", (sw, e) => { const s = e.target.closest?.(".swiper-slide"); if (s) requestAnimationFrame(() => s.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: document.body }))); });
  }

  const nav = document.querySelector(".pdd-nav");
  const sections = document.querySelectorAll("[data-section-current]");
  if (!nav || !sections.length) return;
  const link = (sec) => nav.querySelector(`a[href="#${sec.id}"]`);
  const io = new IntersectionObserver((es) => es.forEach((e) => link(e.target)?.classList.toggle("is-section-currented", e.isIntersecting)), { rootMargin: "-40% 0px -40% 0px", threshold: 0 });
  sections.forEach((s) => io.observe(s));
  const head = document.getElementById("header");
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + scrollY - (head?.clientHeight || 0) - 20;
    if (reduce) return scrollTo(0, y);
    const s = { y: scrollY };
    gsap.to(s, { y, duration: 0.7, ease: "power2.out", onUpdate: () => scrollTo(0, s.y) });
  }));
})();
