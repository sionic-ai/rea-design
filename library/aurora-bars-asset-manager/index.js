// Home page — raising the hero bars (43 on wide screens, 30 on phones, original bar size kept), wavy line drawing in the About section, pinned photo cell height on phones and the About panel blur clearing.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Bars — rem height on wide screens, on phones a % of the container (262%) height ----------
  const WIDE_H = [21.3125, 18.25, 22.375, 21.3125, 23.3125, 22.375, 26.1875, 28.5, 32.5625, 36.6875, 32.5625, 34.5625, 34.5625, 31.5625, 26.75, 33.625, 37.625, 33.75, 38.8125, 35.625, 38.8125, 44.125, 39.8125, 36, 39.8125, 41.25, 46.0625, 41.25, 48.0625, 58.5, 54.3125, 58.5, 70.3125, 78.4375, 86.0625, 89.1875, 80.625, 83.375, 88, 80.0625, 82.75, 93.1875, 88];
  const PHONE_H = [38.365, 32.695, 30.928, 32.253, 28.277, 37.187, 31.517, 39.617, 44.33, 39.764, 45.729, 41.973, 45.729, 51.988, 46.907, 42.415, 46.907, 48.601, 54.271, 48.601, 56.627, 68.925, 63.991, 68.925, 82.842, 92.415, 101.399, 105.081, 94.993, 98.969];
  const box = document.querySelector(".tb-hero__bars");
  const wide = () => innerWidth >= 768;
  let made = null;
  const build = (shown) => {
    const w = wide();
    if (!box || made === w) return;
    made = w;
    const hs = w ? WIDE_H : PHONE_H;
    box.replaceChildren(...hs.map((h, i) => {
      const b = document.createElement("i");
      b.style.setProperty("--fx-w", w ? (i === 0 || i === hs.length - 1 ? "16px" : "32px") : (i === 4 ? "13px" : "12px"));
      b.style.setProperty("--fx-h", w ? `${h}rem` : `${h}%`);
      b.style.setProperty("--fx-i", i);
      if (shown) b.style.opacity = "1";
      return b;
    }));
  };
  build(false);
  addEventListener("resize", () => build(true));

  // ---------- VISION wave lines — 44 strands that curve from lower left to upper right as the bundle fans out ----------
  const waves = document.querySelector(".tb-waves");
  if (waves) {
    const N = 44, lerp = (a, b, t) => a + (b - a) * t;
    const A = [[0, 1440], [520, 1300], [380, 760], [680, 0]];
    const B = [[0, 1566], [700, 1500], [1180, 900], [900, 0]];
    const paths = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const p = A.map((pt, k) => [lerp(pt[0], B[k][0], t), lerp(pt[1], B[k][1], t)]);
      paths.push(`<path d="M${p[0]} C${p[1]} ${p[2]} ${p[3]}" style="opacity:${(0.35 + 0.65 * Math.sin(Math.PI * t)).toFixed(3)}"/>`);
    }
    waves.innerHTML = paths.join("");
  }

  // ---------- Phone — the fixed photo slot height is the tallest box + 12px, and the about panel’s blur clears in .6s together with the Hero ----------
  const content = document.querySelector(".tb-about__content");
  const boxes = [...document.querySelectorAll(".tb-about__box")];
  const fit = () => {
    if (!content) return;
    if (innerWidth <= 767) content.style.height = Math.max(...boxes.map((b) => b.offsetHeight)) + 12 + "px";
    else content.style.height = "";
  };
  fit();
  addEventListener("resize", fit);
  addEventListener("load", fit);
  const about = document.querySelector(".tb-about");
  if (about && innerWidth <= 767 && !reduce) {
    gsap.fromTo(about, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out", clearProps: "filter" });
  }
})();
