// About: two tagline photos swap every 5 seconds — like the original, Splide 4.1.4 (loop·rtl·5s) handles the slide timing and dots,
// The current section is clipped away to the right and the next unfolds from the left (.7s power3.in, original about.js).
// The location banner redraws, as a canvas, the spot where the original had a dotted world map.
(() => {
  const $ = (s, r = document) => r.querySelector(s);

  const sloganEl = $(".a-slogan__sp");
  const pics = [...sloganEl.querySelectorAll(".splide__slide .a-slogan__pic")];
  const IN = { x: "-25%", clipPath: "inset(0% 75% 0% 0%)" };
  const ON = { x: "0%", clipPath: "inset(0% 0% 0% 0%)" };
  const OUT = { x: "25%", clipPath: "inset(0% 0% 0% 75%)" };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let from = 0;
  const slogan = new Splide(sloganEl, {
    type: "loop", direction: "rtl", start: 0, rewind: true, clones: 0, autoplay: !reduce, interval: 5000, speed: 700, pauseOnHover: false,
    easing: "cubic-bezier(0.58, -0.05, 0.78, 0.17)", arrows: false, isNavigation: false, pagination: true, drag: false, wheel: false,
    keyboard: false, paginationKeyboard: false, resetProgress: true,
  });
  slogan.on("move", (to) => {
    gsap.timeline({ defaults: { duration: 0.7, ease: "power3.in" }, onComplete: () => (from = to) })
      .fromTo(pics[from], ON, OUT, "")
      .fromTo(pics[to], IN, ON, "");
  });
  slogan.mount();

  // Dot map: approximates continents with a few ellipses and draws grid dots only inside them
  const cv = $(".a-map");
  const LAND = [[0.2, 0.36, 0.13, 0.15], [0.28, 0.66, 0.06, 0.16], [0.5, 0.33, 0.06, 0.08], [0.52, 0.58, 0.08, 0.16], [0.68, 0.34, 0.16, 0.13], [0.74, 0.52, 0.05, 0.07], [0.84, 0.72, 0.06, 0.06], [0.86, 0.4, 0.02, 0.06]];
  const PINS = [[0.85, 0.38], [0.86, 0.41], [0.71, 0.48], [0.22, 0.4], [0.5, 0.31], [0.84, 0.72]];
  const draw = () => {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio, 2);
    cv.width = r.width * dpr;
    cv.height = r.height * dpr;
    const c = cv.getContext("2d");
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--kf-contrast-ink").trim();
    c.scale(dpr, dpr);
    const step = Math.max(6, r.width / 120);
    c.fillStyle = ink;
    for (let y = step; y < r.height; y += step) {
      for (let x = step; x < r.width; x += step) {
        const u = x / r.width, v = y / r.height;
        const land = LAND.some(([cx, cy, rx, ry]) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 < 1);
        c.globalAlpha = land ? 0.5 : 0.08;
        c.fillRect(x, y, 1.2, 1.2);
      }
    }
    c.globalAlpha = 0.9;
    PINS.forEach(([u, v]) => { c.beginPath(); c.arc(u * r.width, v * r.height, 2, 0, Math.PI * 2); c.fill(); });
  };
  draw();
  addEventListener("resize", draw);
})();
