// One news item — pressing the photo bundle opens a colorbox window (original base.js settings: fade · overlay 98.5% · no close button · fixed position).
// When the window opens the photo grows from .9x over .3s easeOutCubic, and for a group the prev/next buttons enter after .4s from beside the outside (−120) over .15s easeOutQuart.
// Paging back and forth, the photo shifts ±100px and vanishes in .15s easeInOutCubic, then the next photo grows back. The close button turns on for .2s after .4s.
(() => {
  if (!window.jQuery || !jQuery.colorbox) return;
  const $ = jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const d = (s) => (reduce ? 0 : s);
  const close = document.querySelector(".ar-modal-close"), prev = document.querySelector(".ar-modal-prev"), next = document.querySelector(".ar-modal-next");

  // Since these are photo placeholders, colorbox gets a same-ratio (4:3) placeholder panel instead of an image — window stays within 90% of the screen, 120 margin top and bottom
  const size = () => {
    const w = Math.min(innerWidth * 0.9 - (innerWidth > 785 ? 240 : 40), ((innerHeight - 240) * 4) / 3, 1000);
    return { w: Math.round(w), h: Math.round((w * 3) / 4) };
  };
  $(".ar-zoom").each(function () {
    const label = this.dataset.label;
    $(this).colorbox({
      rel: "ar-gal", transition: "fade", closeButton: false, current: false, fixed: true, returnFocus: false, opacity: 0.985, className: "modalImg",
      speed: reduce ? 0 : 300, fadeOut: reduce ? 0 : 300,
      html: () => `<span class="ar-zoom-view wf-img" data-label="${label}"></span>`,
      innerWidth: () => size().w, innerHeight: () => size().h,
    });
  });
  $("#cboxContent").append('<div class="ar-side is-left"></div><div class="ar-side is-right"></div>');
  const sides = document.querySelectorAll("#cboxContent .ar-side");
  let busy = false, scrollY0 = 0;

  $(".ar-zoom").on("click", () => {
    gsap.to(prev, { left: 0, duration: d(0.15), delay: d(0.4), ease: "power3.out" });
    gsap.to(next, { right: 0, duration: d(0.15), delay: d(0.4), ease: "power3.out" });
    sides.forEach((s) => (s.style.display = "block"));
  });
  $(document).on("cbox_open", () => {
    scrollY0 = scrollY;
    document.body.classList.add("is-locked");
    gsap.fromTo(close, { display: "block", opacity: 0 }, { opacity: 1, duration: d(0.2), delay: d(0.4), ease: "power3.out" });
  });
  $(document).on("cbox_cleanup", () => {
    gsap.to(prev, { left: -120, duration: d(0.2), ease: "power3.inOut" });
    gsap.to(next, { right: -120, duration: d(0.2), ease: "power3.inOut" });
    sides.forEach((s) => (s.style.display = "none"));
    gsap.killTweensOf(close);
    gsap.set(close, { display: "none", opacity: 0 });
  });
  $(document).on("cbox_closed", () => { document.body.classList.remove("is-locked"); scrollTo(0, scrollY0); });
  $(document).on("cbox_complete", () => {
    gsap.fromTo("#cboxLoadedContent", { scale: 0.9 }, { scale: 1, x: 0, opacity: 1, duration: d(0.3), ease: "power2.out" });
    busy = false;
  });
  const step = (dir) => {
    if (busy) return;
    busy = true;
    gsap.to("#cboxLoadedContent", { opacity: 0, x: dir < 0 ? 100 : -100, duration: d(0.15), ease: "power2.inOut", onComplete: () => (dir < 0 ? $.colorbox.prev() : $.colorbox.next()) });
  };
  close.addEventListener("click", (e) => { e.preventDefault(); $.colorbox.close(); });
  prev.addEventListener("click", (e) => { e.preventDefault(); step(-1); });
  next.addEventListener("click", (e) => { e.preventDefault(); step(1); });
  sides[0]?.addEventListener("click", () => step(-1));
  sides[1]?.addEventListener("click", () => step(1));
})();
