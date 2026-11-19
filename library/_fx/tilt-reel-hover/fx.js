// Hovering a list row slides a row of rounded photo panels slanted behind it (8°) into that row’s slot in 1s power2.out, and
// Only that panel stands up at −7° · 1.3× (.8s, CSS) while other lines fade to .3. On release the panel lies back in place and the lines darken again — the panel line’s position is left as is
(() => {
  kfFx.register("tilt-reel-hover", (el, { options, reduce, hover }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    const reel = el.querySelector('[data-fx-part="reel"]');
    const tiles = reel ? [...reel.querySelectorAll('[data-fx-part="tile"]')] : [];
    if (!items.length || !reel || !hover || innerWidth < +(options.min ?? 993)) return;
    const nums = (s, d) => (s ? String(s).trim().split(/[\s,]+/).map(Number) : d);
    const xs = nums(options.x, [0, -28, -56, -84]), ys = nums(options.y, [0, -40, -80, -120]);
    const dur = reduce ? 0 : +(options.dur ?? 1), ease = kfFx.ease(options.ease || "power2.out", "power2.out"), dim = +(options.dim ?? 0.3);
    const offs = items.map((item, i) => {
      const on = () => {
        tiles[i]?.classList.add("is-active");
        gsap.to(reel, { xPercent: xs[i] ?? xs[xs.length - 1], y: ys[i] ?? ys[ys.length - 1], duration: dur, ease });
        items.forEach((o) => { if (o !== item) o.style.opacity = dim; });
      };
      const off = () => {
        tiles.forEach((t) => t.classList.remove("is-active"));
        items.forEach((o) => (o.style.opacity = ""));
      };
      item.addEventListener("mouseenter", on);
      item.addEventListener("mouseleave", off);
      return () => { item.removeEventListener("mouseenter", on); item.removeEventListener("mouseleave", off); };
    });
    return () => { offs.forEach((f) => f()); gsap.killTweensOf(reel); gsap.set(reel, { clearProps: "transform" }); tiles.forEach((t) => t.classList.remove("is-active")); items.forEach((o) => (o.style.opacity = "")); };
  });
})();
