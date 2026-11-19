// Home — pickup card slick (fade · .4s) with 01/06 numbering, card height fitted to the current slide (as in the original)
(() => {
  // The original sets up slick only after all images have loaded (load)
  const init = () => {
  const $ = window.jQuery;
  const el = $ && $("#js-pickup");
  if (!el || !el.length || !$.fn.slick) return;
  const pad = (n) => String(n).padStart(2, "0");
  const fit = () => {
    el.find(".slick-track, .slick-list").css("height", "auto");
    setTimeout(() => { el.slick("setPosition"); }, 10);
  };
  el.on("init", (e, s) => {
    $("#js-pickup-current").text(pad(s.currentSlide + 1));
    $("#js-pickup-total").text(pad(s.slideCount));
    setTimeout(fit, 100);
  }).slick({ fade: true, speed: 400, prevArrow: "#js-pickup-prev", nextArrow: "#js-pickup-next" })
    .on("beforeChange", (e, s, cur, next) => $("#js-pickup-current").text(pad(next + 1)));
  let t;
  $(window).on("resize", () => { clearTimeout(t); t = setTimeout(() => { el.slick("setPosition"); setTimeout(fit, 50); }, 150); });
  };
  if (document.readyState === "complete") init();
  else addEventListener("load", init, { once: true });
})();
