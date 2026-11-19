// First page — photo slider (slick fade, autoplay off) + latest topic ring (next section after counting a full 4 seconds), typing the caption on change (char-fade-in fx:show)
// On phone (768px or less), as in the original, the topic row becomes a center-aligned slick (centerPadding 80px) tied to the photo slider
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.slick) return;
  const main = $('[data-slider="main"]');
  const thumbs = $(".yk-thumbs");
  const ring = document.querySelector(".yk-count");
  const base = { slidesToShow: 1, slidesToScroll: 1, arrows: false, fade: true, autoplay: false, pauseOnHover: false, pauseOnFocus: false };
  const sp = () => innerWidth <= 768;
  let paired = false;

  const mark = (i) => {
    if (paired) return;
    thumbs.find(".yk-thumb").removeClass("is-active").filter(`[data-slide="${i}"]`).addClass("is-active");
  };
  const type = (i) => {
    document.querySelectorAll(`[data-live="${i}"] [data-fx]`).forEach((d) => d.dispatchEvent(new CustomEvent("fx:show")));
  };
  const layout = () => {
    if (sp()) {
      if (paired) return;
      main.slick("unslick");
      thumbs.slick({ slidesToShow: 1, slidesToScroll: 1, asNavFor: '[data-slider="main"]', dots: false, centerMode: true, focusOnSelect: true, centerPadding: "80px", arrows: false });
      main.slick({ ...base, asNavFor: ".yk-thumbs" });
      paired = true;
    } else if (paired) {
      thumbs.slick("unslick");
      main.slick("unslick");
      main.slick(base);
      paired = false;
    }
    mark(main.slick("slickCurrentSlide"));
  };

  main.on("beforeChange", (e, s, cur, next) => type(next));
  main.on("afterChange", (e, s, i) => { mark(i); ring?.dispatchEvent(new CustomEvent("fx:reset")); });
  ring?.addEventListener("fx:done", () => main.slick("slickNext"));
  $(document).on("click", ".yk-thumb", function () {
    if (paired) return;
    const i = +this.dataset.slide;
    main.slick("slickGoTo", i);
    mark(i);
  });
  $(document).on("keydown", ".yk-thumb", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $(this).trigger("click"); } });
  let t = 0;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { layout(); ring?.dispatchEvent(new CustomEvent("fx:reset")); }, 250); });

  main.slick(base);
  layout();
  // The first section’s description also runs once at the start — after the parts attach
  requestAnimationFrame(() => setTimeout(() => type(0), 0));
})();
