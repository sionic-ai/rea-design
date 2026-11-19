// One facility — the photo strip shifts left by scroll progress × overflow width × 2 (1.4 on phones), with a keen-slider and arrow state for each activity block
(() => {
  const BREAKPOINT = 814;
  const onLoad = () => {
    const strip = document.querySelector(".tn-fstrip");
    const wrap = strip?.querySelector(".tn-fstrip__wrap");
    if (strip && wrap && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ScrollTrigger.create({
        trigger: strip,
        onUpdate: (self) => {
          const w = strip.clientWidth, over = wrap.scrollWidth - w, k = w < BREAKPOINT ? -1.4 : -2;
          gsap.set(wrap, { x: over * self.progress * k });
        },
      });
    }
    if (!window.KeenSlider) return;
    document.querySelectorAll(".tn-fslide").forEach((box) => {
      const track = box.querySelector(".keen-slider");
      const prev = box.querySelector(".tn-prev"), next = box.querySelector(".tn-next");
      box.classList.remove("slider-disabled");
      const slider = new KeenSlider(track, { loop: false, mode: "snap", rtl: false, slides: { perView: "auto" } });
      prev.addEventListener("click", () => slider.prev());
      next.addEventListener("click", () => slider.next());
      slider.on("detailsChanged", (s) => {
        const p = s.track.details.progress;
        prev.disabled = p === 0;
        next.disabled = p > 0.99;
      });
    });
  };
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad);
})();
