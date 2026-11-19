// First page scene: glitch symbol cleanup (scrub), tape·sticker parallax. Values convert the original scroll() progress to a 1440 document (scroll 6239px)·
// Converted to px of the 390 document (4943px) — so the same thing happens at the same scroll distance even if our document length differs.
sl.onPage("home", () => {
  // Horizontal scale of the original ten layers from the outer band (all 1 at 5% scroll)
  const SCALES = [1.4, 1.35, 1.3, 1.25, 1.2, 1.15, 1.05, 0.95, 0.8, 0.45];
  const slices = document.querySelector("[data-hero-slices]");
  slices.innerHTML = SCALES.map((s, i) =>
    `<div class="hero__slice" style="--w:${100 - i * 10}%;--z:${i + 1}" data-scale="${s}">${sl.mark()}</div>`).join("");
  const marks = [...slices.querySelectorAll(".sl-mark")];
  marks.forEach((m, i) => gsap.set(m, { scaleX: SCALES[i] }));

  sl.scene((mm) => {
    const stage = document.querySelector("[data-hero-stage]");
    const clean = document.querySelector("[data-hero-clean]");
    const tapeEl = document.querySelector("[data-hero-tape] .sl-tape__cross");

    mm.add("(min-width: 541px)", () => {
      marks.forEach((m, i) => sl.scrub(m, [[0, { scaleX: SCALES[i] }], [312, { scaleX: 1 }]]));
      sl.scrub(clean, [[0, { opacity: 0 }], [437, { opacity: 0 }], [561, { opacity: 1 }]]);
      sl.scrub(stage, [[0, { y: 0 }], [1123, { y: 160 }]]);
      sl.scrub(tapeEl, [[0, { y: 0 }], [561, { y: 46 }], [936, { y: -80 }]]);
      sl.scrub("[data-about-asset]", [[0, { y: 0 }], [62, { y: -100 }], [1560, { y: 80 }]]);
      sl.scrub("[data-about-globe]", [[1435, { y: 0 }], [2184, { y: 72 }]]);
      sl.scrub("[data-news-tag]", [[1622, { y: 0 }], [2371, { y: 80 }]]);
    });
    mm.add("(max-width: 540px)", () => {
      marks.forEach((m, i) => sl.scrub(m, [[0, { scaleX: SCALES[i] }], [247, { scaleX: 1 }]]));
      sl.scrub(clean, [[0, { opacity: 0 }], [346, { opacity: 0 }], [445, { opacity: 1 }]]);
      sl.scrub(stage, [[0, { y: 0 }], [890, { y: 80 }]]);
      sl.scrub(tapeEl, [[0, { y: 0 }], [445, { y: 0 }], [741, { y: -80 }]]);
    });
  });
});
