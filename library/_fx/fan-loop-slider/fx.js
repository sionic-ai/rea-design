// Marks stand like a fan spread along a far lower axis and turn one cell at each interval — a Splide loop (center aligned) moves the cells, and
// Tilt and downward sag are applied by the number of cells away from the center (±1 · ±2 · ±3). From the fourth cell on, no tilt (same as the original)
(() => {
  const SAG = [[0, 0], [0, 12], [15, 45], [50, 100]];
  kfFx.register("fan-loop-slider", (el, { options, reduce }) => {
    const track = el.querySelector(":scope > .splide__track");
    if (!track || !window.Splide || !track.querySelector(".splide__slide")) return;
    const step = +(options.step ?? 14);
    el.classList.add("splide", "fx-fan-still");
    const sp = new Splide(el, {
      type: "loop", focus: "center", perPage: 1, clones: 3, arrows: false, pagination: false, pauseOnHover: false, pauseOnFocus: false,
      gap: options.gap || "6.25em", autoplay: !reduce, interval: +(options.interval ?? 4) * 1000, speed: reduce ? 0 : +(options.speed ?? 0.5) * 1000,
      drag: options.drag !== "off",
    });
    const spread = (at = sp.index) => {
      const n = sp.length;
      sp.Components.Slides.get().forEach((s) => {
        const card = s.slide.querySelector('[data-fx-part="card"]');
        if (!card) return;
        let d = (((s.index - at) % n) + n) % n;
        if (d > n / 2) d -= n;
        const far = Math.abs(d) > 3, [sx, sy] = far ? [0, 0] : SAG[Math.abs(d)];
        card.style.setProperty("--fx-fan-r", `${far ? 0 : d * step}deg`);
        card.style.setProperty("--fx-fan-x", `${Math.sign(d) * sx}%`);
        card.style.setProperty("--fx-fan-y", `${sy}%`);
        card.classList.toggle("is-center", d === 0);
      });
    };
    sp.on("mounted", () => spread());
    sp.on("move", (i) => spread(i));
    sp.on("moved", (i) => spread(i));
    sp.mount();
    requestAnimationFrame(() => el.classList.remove("fx-fan-still"));
    return () => {
      sp.destroy(true);
      el.classList.remove("fx-fan-still");
      el.querySelectorAll('[data-fx-part="card"]').forEach((c) => { ["--fx-fan-r", "--fx-fan-x", "--fx-fan-y"].forEach((k) => c.style.removeProperty(k)); c.classList.remove("is-center"); });
    };
  });
})();
