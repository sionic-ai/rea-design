(() => {
  kfFx.register("bar-fill-ticker", (el, { options, reduce }) => {
    const vp = el.querySelector(':scope > [data-fx-part="viewport"]');
    const Embla = window.EmblaCarousel, Auto = window.EmblaCarouselAutoplay;
    if (!vp || !Embla || !vp.querySelector('[data-fx-part="track"] > [data-fx-part="slide"]')) return;
    const delay = +(options.delay ?? 4);
    const plugins = !reduce && Auto && delay > 0 ? [Auto({ delay: delay * 1000 })] : [];
    const api = Embla(vp, { container: '[data-fx-part="track"]', slides: '[data-fx-part="slide"]', loop: true, duration: +(options.duration ?? 25) || 25 }, plugins);
    el.style.setProperty("--fx-delay", `${delay}s`);
    const wrap = el.querySelector('[data-fx-part="bars"]');
    let bars = [];
    const build = () => {
      if (!wrap) return;
      wrap.innerHTML = api.scrollSnapList().map(() => '<span data-fx-part="bar"></span>').join("");
      bars = [...wrap.children];
    };
    // To refill the same bar, the animation has to be interrupted once
    const fill = () => {
      const k = api.selectedScrollSnap();
      bars.forEach((b, i) => { b.classList.remove("is-on"); if (i === k) { void b.offsetWidth; b.classList.add("is-on"); } });
    };
    api.on("select", fill).on("reInit", () => { build(); fill(); });
    build();
    fill();
    return () => {
      if (wrap) wrap.innerHTML = "";
      el.style.removeProperty("--fx-delay");
      api.destroy();
    };
  });
})();
