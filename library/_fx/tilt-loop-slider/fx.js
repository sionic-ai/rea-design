(() => {
  kfFx.register("tilt-loop-slider", (el, { options, reduce }) => {
    const track = el.querySelector(":scope > .splide__track");
    if (!track || !window.Splide || !track.querySelector(".splide__slide")) return;
    const skew = document.createElement("div");
    skew.className = "fx-tl-skew";
    track.before(skew);
    skew.append(track);
    const gap = options.gap ? (/^\d+(\.\d+)?$/.test(options.gap) ? `${options.gap}px` : options.gap) : "5em";
    const sp = new Splide(el, {
      type: "loop", perPage: 1, focus: "center", gap, updateOnMove: true, arrows: false, pagination: false,
      autoplay: !reduce, interval: +(options.interval ?? 4000), speed: reduce ? 0 : +(options.speed ?? 2000),
    }).mount();
    return () => { sp.destroy(true); skew.before(track); skew.remove(); };
  });
})();
