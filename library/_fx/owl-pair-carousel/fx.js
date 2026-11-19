(() => {
  // owl.carousel 2.3.4 auto-advances two cards at a time — 5s dwell · .9s slide · pauses on hover · number dots
  kfFx.register("owl-pair-carousel", (el, { options, reduce }) => {
    const $ = window.jQuery;
    if (!$ || !$.fn.owlCarousel) return;
    const items = el.querySelectorAll('[data-fx-part="item"]');
    if (!(items.length ? items.length : el.children.length)) return;
    const every = +(options.every ?? 5), speed = +(options.speed ?? 0.9), by = Math.max(1, Math.round(+options.by || 2)), gap = +(options.gap ?? 40);
    const numbers = options.numbers !== "off";
    const $el = $(el).addClass("owl-carousel");
    $el.owlCarousel({
      margin: gap, dots: true, loop: true, nav: true, autoplayHoverPause: true, autoplay: !reduce, autoplayTimeout: every * 1000, autoplaySpeed: speed * 1000,
      autoWidth: true, center: false, slideBy: by, navText: ["‹", "›"],
      responsive: { 0: { items: 1, margin: Math.min(gap, 20), autoWidth: true, center: true, slideBy: 1 }, 950: { items: 2 } },
    });
    const label = () => {
      const plain = !numbers || innerWidth < 750;
      el.classList.toggle("is-fx-plain", plain);
      if (!plain) $el.find(".owl-dots button span").each((i, s) => { s.textContent = String(i + 1); });
    };
    label();
    $el.on("refreshed.owl.carousel", label);
    return () => {
      $el.off("refreshed.owl.carousel", label);
      $el.trigger("destroy.owl.carousel");
      el.classList.remove("owl-carousel", "owl-loaded", "is-fx-plain");
    };
  });
})();
