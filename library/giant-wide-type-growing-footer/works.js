/* Work list motion — original values: swiper 8 · slidesPerView auto · centered · loop · 2s autoplay (pauses on hover) · .6s · drag threshold 8px ·
   Cropped = |progress| × 20% (max 60%) · grid/list switch: the outgoing side fades to transparent over .4s → hidden, the incoming cards (grid all at once, list rows at .1s intervals) fade in from 2rem below over .5s, backdrop panel power4.inOut */
(() => {
  const el = document.querySelector("[data-swiper]");
  const applyClip = (sw) => {
    for (const slide of sw.slides) {
      const p = typeof slide.progress === "number" ? slide.progress : 0;
      const inset = Math.min(60, Math.abs(p) * 20);
      const t = slide.querySelector("[data-thumb]");
      if (t) t.style.clipPath = `inset(0 0 ${inset.toFixed(2)}% 0)`;
    }
  };
  if (el && window.Swiper) {
    new Swiper(el, {
      slidesPerView: "auto", watchSlidesProgress: true, followFinger: false, loop: true, loopAdditionalSlides: 10, centeredSlides: true, threshold: 8,
      autoplay: matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true },
      speed: 600, mousewheel: { enabled: true, forceToAxis: true }, keyboard: { enabled: true, onlyInViewport: true },
      slideActiveClass: "is-active", slideDuplicateActiveClass: "is-active",
      on: {
        init: applyClip, setTranslate: applyClip,
        transitionStart(sw) { const tick = () => { applyClip(sw); if (sw.animating) requestAnimationFrame(tick); }; requestAnimationFrame(tick); },
        resize(sw) { sw.update(); applyClip(sw); },
      },
    });
  }

  const grid = document.querySelector('[data-display="grid"]');
  const list = document.querySelector('[data-display="list"]');
  const bg = document.querySelector("[data-ctrl-bg]");
  const btns = document.querySelectorAll("[data-view]");
  const show = (view, fast) => {
    btns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
    const [out, inn] = view === "grid" ? [list, grid] : [grid, list];
    const sp = fast ? 3 : 1;
    const tl = gsap.timeline();
    tl.to(out, { opacity: 0, duration: 0.4 })
      .set(out, { display: "none" }, 0.4)
      .set(inn, { display: "block", opacity: 1 }, 0.4)
      .fromTo(inn.querySelectorAll(view === "grid" ? ".lr-card" : ".lr-row"), { opacity: 0, y: "2rem" }, { opacity: 1, y: 0, duration: 0.5, ease: "power1.out", stagger: view === "grid" ? 0 : 0.1 }, 0.4)
      .to(bg, { x: view === "grid" ? 0 : "100%", duration: 0.5, ease: "power4.inOut" }, 0);
    tl.timeScale(sp);
  };
  btns.forEach((b) => b.addEventListener("click", () => { if (b.getAttribute("aria-pressed") !== "true") show(b.dataset.view, false); }));
})();
