// About — the office photo slider is the same Swiper 11 as the original (cross fade 1.2s · every 3s · no manual swiping), and each photo is offset by the distance between the box center and the screen center × .1
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Swiper) {
    new Swiper(".ft-office", {
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      speed: reduce ? 0 : 1200,
      autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false },
      allowTouchMove: false,
    });
  }
  const box = document.querySelector(".ft-parallax");
  if (box && !reduce) {
    const shots = box.querySelectorAll(".ft-shot");
    const update = () => {
      const r = box.getBoundingClientRect();
      if (r.top >= innerHeight || r.bottom <= 0) return;
      const y = (r.top + r.height / 2 - innerHeight / 2) * 0.1;
      shots.forEach((s) => { s.style.transform = `translate(-50%, -50%) translateY(${y}px)`; });
    };
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }
  // Section name ‹message›: while hovered, it shows letters in another language (original data-text-en)
  if (!matchMedia("(pointer: coarse)").matches) {
    document.querySelectorAll("[data-text-en]").forEach((el) => {
      const ko = el.innerHTML;
      el.addEventListener("mouseenter", () => { el.innerHTML = el.dataset.textEn; });
      el.addEventListener("mouseleave", () => { el.innerHTML = ko; });
    });
  }
})();
