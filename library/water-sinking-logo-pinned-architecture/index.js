// Home — moves the 27 logo letters between three positions: grid (initial) → scattered (to the four screen corners during the work photos) → gathered (small cluster at top left in the About section).
// Slot values are measured from the original layout: wide screens use 1728 width, phones use 390 width px. w is the original glyph artwork width (sets the center of that cell).
(() => {
  const logo = document.querySelector(".pl-logo");
  const glyphs = logo ? [...logo.querySelectorAll('[data-fx-part="glyph"]')] : [];
  if (!glyphs.length || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // [rows, image width, wide x · scatter x · gather x · gather y, phone x · scatter x · gather x · gather y]
  const TABLE = [
    [0, 144, 346, 80, 50, 50, 36, 23, 23, 28], [0, 116, 525, 347, 105, 50, 91, 83, 40, 28], [0, 138, 695, 606, 151, 50, 145, 140, 53, 28],
    [0, 116, 872, 873, 204, 50, 199, 198, 69, 28], [0, 20, 1042, 1132, 249, 50, 250, 255, 83, 28], [0, 108, 1179, 1358, 262, 50, 292, 301, 87, 28],
    [0, 103, 1347, 1614, 306, 50, 345, 357, 100, 28],
    [1, 92, 346, 80, 50, 130, 36, 23, 23, 52], [1, 126, 532, 373, 87, 130, 93, 85, 34, 52], [1, 138, 730, 677, 137, 130, 154, 152, 49, 52],
    [1, 142, 934, 987, 191, 130, 217, 220, 65, 52], [1, 142, 1138, 1298, 245, 130, 280, 288, 81, 52], [1, 117, 1342, 1609, 300, 130, 343, 355, 98, 52],
    [2, 138, 346, 80, 50, 209, 36, 23, 23, 76], [2, 116, 524, 347, 104, 209, 91, 83, 39, 76], [2, 20, 695, 606, 151, 209, 145, 140, 54, 76],
    [2, 104, 834, 835, 166, 209, 186, 187, 58, 76], [2, 102, 1002, 1092, 208, 209, 238, 242, 70, 76], [2, 138, 1167, 1346, 250, 209, 290, 298, 83, 76],
    [2, 104, 1346, 1612, 305, 209, 343, 357, 99, 76],
    [3, 118, 346, 80, 50, 289, 36, 23, 23, 99], [3, 130, 517, 339, 96, 289, 89, 80, 37, 99], [3, 103, 692, 603, 147, 289, 142, 138, 52, 99],
    [3, 109, 857, 858, 189, 289, 193, 194, 64, 99], [3, 116, 1025, 1114, 232, 289, 244, 249, 78, 99], [3, 20, 1195, 1373, 278, 289, 297, 306, 92, 99],
    [3, 142, 1332, 1600, 292, 289, 340, 353, 96, 99],
  ];
  const H_IMG = (row) => (row === 3 ? 152 : 150);
  const lerp = (a, b, t) => a + (b - a) * t;
  const wide = matchMedia("(min-width: 769px)");
  // Each segment keeps only its own values and they are combined in place — if one object is shared by three scroll tweens, on refresh the last tween’s start value (the fully gathered state) covers the first screen
  const spread = { diffusion: 0, thin: 0 }, gather = { convergence: 0 }, back = { p: 0 }, shadeOf = { wave: 0 };
  const state = { diffusion: 0, convergence: 0, thin: 0, wave: 0 };
  const merge = () => {
    const keep = 1 - back.p;
    state.diffusion = spread.diffusion * keep;
    state.thin = spread.thin * keep;
    state.convergence = gather.convergence * keep;
    state.wave = shadeOf.wave;
  };

  const place = () => {
    merge();
    const W = innerWidth, H = innerHeight, big = wide.matches;
    const e = big ? W / 1728 : W / 390, k = big ? 0.338 : 0.105, o = big ? 0.141 : 0.21, c = (big ? 80 : 55) * e;
    glyphs.forEach((g, i) => {
      const t = TABLE[i];
      if (!t) return;
      const [row, w] = t;
      const [x, lx, sx, sy] = big ? t.slice(2, 6) : t.slice(6, 10);
      const bw = Math.round(w * k) * e, bh = Math.round(H_IMG(row) * k) * e;
      const gy = (H / 3) * row - bh * (row / 3) + (1.5 - row) * H * o;
      const ly = (H / 3) * row - bh * (row / 3) + c * ((1.5 - row) / 1.5);
      const left = lerp(lerp(x * e, lx * e, state.diffusion), sx * e, state.convergence);
      const top = lerp(lerp(gy, ly, state.diffusion), sy * e, state.convergence);
      // Center the text in the image slot — set the slot width to the original image width so the center matches the original
      g.style.width = `${bw}px`;
      g.style.height = `${bh}px`;
      g.style.transform = `translate(${left}px, ${top}px)`;
    });
    logo.style.setProperty("--fx-tide-thin", state.thin);
    logo.style.setProperty("--fx-tide-wave", state.wave);
  };
  addEventListener("resize", place);
  wide.addEventListener("change", place);
  place();

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { still } = ctx.conditions;
    // With reduced motion, attach directly to scroll (without the 1s trailing delay)
    const sc = still ? true : 1;
    // While the work photo section rises from below: the scattering, departing letters are locked
    gsap.fromTo(spread, { diffusion: 0, thin: 0 }, {
      diffusion: 1, thin: 1, onUpdate: place,
      scrollTrigger: { trigger: ".pl-works", start: "top bottom", end: "top top", scrub: sc },
    });
    // When moving to the info section, a wave shade spreads in .5s
    const shade = gsap.fromTo(shadeOf, { wave: 0 }, { wave: 0.8, paused: true, duration: still ? 0 : 0.5, onUpdate: place });
    gsap.fromTo(gather, { convergence: 0 }, {
      convergence: 1, onUpdate: place,
      scrollTrigger: {
        trigger: ".pl-mid", start: "bottom bottom", end: "bottom top", scrub: sc,
        onLeave: () => { plChrome.show(); shade.play(); },
        onEnterBack: () => { plChrome.hide(); shade.reverse(); },
      },
    });
    // Last empty span: returns to the first grid and the thin text floats up again
    gsap.fromTo(back, { p: 0 }, {
      p: 1, onUpdate: place,
      scrollTrigger: {
        trigger: ".pl-last", start: "top top", end: "bottom bottom", scrub: sc,
        onEnter: () => { plChrome.hide(); shade.reverse(); },
        onLeaveBack: () => { plChrome.show(); shade.play(); },
      },
    });
    place();
  });
})();
