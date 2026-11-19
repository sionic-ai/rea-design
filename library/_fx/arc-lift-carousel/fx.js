(() => {
  // The original adds position±n classes by distance from the cell chosen on embla select and CSS sets the height — we set --fx-y using the same distance calculation
  kfFx.register("arc-lift-carousel", (el, { options, reduce, scroller }) => {
    const vp = el.querySelector(':scope > [data-fx-part="viewport"]');
    const Embla = window.EmblaCarousel, Auto = window.EmblaCarouselAutoplay;
    if (!vp || !Embla || !vp.querySelector('[data-fx-part="track"] > [data-fx-part="slide"]')) return;
    const lift = String(options.lift ?? "60,150,270").split(",").map((v) => +v || 0);
    const delay = +(options.delay ?? 4), view = +(options.view ?? 0.2);
    const plugins = !reduce && Auto && delay > 0 ? [Auto({ delay: delay * 1000, stopOnInteraction: false, stopOnFocusIn: true, playOnInit: false })] : [];
    const api = Embla(vp, { container: '[data-fx-part="track"]', slides: '[data-fx-part="slide"]', duration: +(options.duration ?? 20) || 20, loop: true, align: "center" }, plugins);
    const place = () => {
      const nodes = api.slideNodes(), n = nodes.length, k = api.selectedScrollSnap();
      nodes.forEach((s, i) => {
        let d = i - k;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        const a = Math.abs(d);
        s.style.setProperty("--fx-y", `${a && a <= lift.length ? -lift[a - 1] : 0}px`);
      });
    };
    api.on("select", place).on("reInit", place);
    place();
    const ap = api.plugins().autoplay;
    const io = ap ? new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? ap.play() : ap.stop())), { threshold: view, root: scroller || null }) : null;
    io?.observe(el);
    const prev = el.querySelector('[data-fx-part="prev"]'), next = el.querySelector('[data-fx-part="next"]');
    const goPrev = () => api.scrollPrev();
    const goNext = () => api.scrollNext();
    prev?.addEventListener("click", goPrev);
    next?.addEventListener("click", goNext);
    return () => {
      io?.disconnect();
      prev?.removeEventListener("click", goPrev);
      next?.removeEventListener("click", goNext);
      api.slideNodes().forEach((s) => s.style.removeProperty("--fx-y"));
      api.destroy();
    };
  });
})();
