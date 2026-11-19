(() => {
  // A slick carousel (centerMode·variableWidth·infinite) where one center cell stands in the middle of the panel and cells on both sides are cut off at the panel edge.
  // Arrows sit on both corners of the center cell’s photo, not at the plate ends — the cell is narrower than the plate, so at the plate ends they would float over a clipped neighboring cell.
  kfFx.register("center-peek-slider", (el, { options, reduce }) => {
    const $ = window.jQuery;
    if (!$ || !$.fn || !$.fn.slick) return;
    const slides = [...el.children].filter((c) => c.matches('[data-fx-part="slide"]'));
    if (!slides.length) return;
    const delay = +(options.delay ?? 5000), speed = +(options.speed ?? 500), edge = +(options.edge ?? -22);
    const narrow = +(options.narrow || 769), swipe = +(options.swipe || 10);
    const auto = options.auto !== "off" && delay > 0 && !reduce;
    const $el = $(el);
    const chev = (dir) => `<button type="button" class="slick-${dir}" aria-label="${dir === "prev" ? "Previous" : "Next"}"></button>`;

    const place = () => {
      const prev = el.querySelector(".slick-prev"), next = el.querySelector(".slick-next");
      const cur = el.querySelector(".slick-current") || el.querySelector(".slick-slide");
      if (!prev || !next || !cur) return;
      const photo = cur.querySelector('[data-fx-part="photo"]') || cur;
      const w = el.clientWidth, sw = cur.offsetWidth;
      const top = photo.offsetTop + photo.offsetHeight / 2;
      const wide = innerWidth >= narrow;
      const pad = wide ? (w - sw) / 2 + edge : null;
      prev.style.top = next.style.top = top + "px";
      prev.style.left = wide ? pad + "px" : "";
      next.style.right = wide ? pad + "px" : "";
      el.classList.add("is-placed");
    };

    $el.on("init.fxcps setPosition.fxcps", place);
    $el.slick({
      autoplay: auto,
      autoplaySpeed: delay,
      speed: reduce ? 0 : speed,
      centerMode: true,
      dots: true,
      arrows: true,
      infinite: options.loop !== "0",
      swipe: true,
      variableWidth: true,
      swipeToSlide: true,
      touchThreshold: swipe,
      prevArrow: chev("prev"),
      nextArrow: chev("next"),
      responsive: [{ breakpoint: narrow, settings: { centerPadding: "0px", variableWidth: false } }],
    });
    // If a photo loads late and the cell height changes, re-fit the arrow height
    const ro = new ResizeObserver(place);
    ro.observe(el);
    const next = () => $el.slick("slickNext"), prev = () => $el.slick("slickPrev");
    el.addEventListener("fx:next", next);
    el.addEventListener("fx:prev", prev);
    return () => {
      ro.disconnect();
      el.removeEventListener("fx:next", next);
      el.removeEventListener("fx:prev", prev);
      $el.off(".fxcps");
      if ($el.hasClass("slick-initialized")) $el.slick("unslick");
      el.classList.remove("is-placed");
    };
  });
})();
