/* About motion — the photo grid recedes from 3.2x to 1x as the cover lifts and the title disappears (original IX scroll-progress keyframe), map drawing, number counting */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  const sec = document.querySelector(".ab-grid");
  const grid = sec.querySelector("[data-grid]"), shade = sec.querySelector("[data-shade]"), title = sec.querySelector("[data-title]");

  mm.add({ desk: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { desk, reduce } = ctx.conditions;
    if (reduce) { gsap.set(grid, { scale: 1 }); gsap.set(shade, { opacity: 0 }); return; }
    const at = (p) => p / 100;
    gsap.set(grid, { scale: desk ? 3.2 : 3.4 });
    const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom bottom", scrub: 0.5 } });
    tl.to(grid, { scale: 1, duration: at(60) }, 0)
      .to(shade, { opacity: 0, duration: at(50) }, 0)
      .to(title, { opacity: 0, duration: desk ? at(13) : at(24) }, desk ? at(14) : 0)
      .to({}, { duration: at(40) }, at(60));
  });

  // Staff map — faint concentric contours around one point at the bottom left, with colored dots (placeholders) on top
  const NS = "http://www.w3.org/2000/svg";
  const rings = document.querySelector("[data-rings]");
  const dots = document.querySelector("[data-dots]");
  if (rings) for (let r = 30; r < 900; r += 18) {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", 330); c.setAttribute("cy", 430); c.setAttribute("r", r);
    rings.append(c);
  }
  const tones = ["var(--kf-accent)", "var(--site-plum)", "var(--site-olive)", "var(--site-peri)", "var(--site-yellow-600)", "var(--site-teal)"];
  const spots = [[120, 120], [190, 90], [260, 80], [520, 270], [880, 230], [330, 420], [345, 430], [325, 440], [340, 410], [610, 320], [700, 300], [760, 360], [450, 460], [600, 440], [820, 120], [160, 330]];
  spots.forEach(([x, y], i) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 9);
    c.setAttribute("fill", tones[i % tones.length]);
    dots?.append(c);
  });
  // Business map — paint cells into map-shaped spots (the user side supplies the actual map)
  const tiles = document.querySelector("[data-tiles]");
  if (tiles) {
    const shape = ["....XXXX..XX......", "..XXXXXXXXXXX...X.", ".XXXXXXXXXXXXXXXX.", ".XXXXXXXXXXXXXXXX.", "XXXXXXXXXXXXXXXXX.", ".XXXXXXXXXXXXXXX..", "..XXXXXXXXXXXXXX..", "....XXXXXX.XXXX...", ".......XX.....X...", "......X........X.."];
    shape.forEach((row, ry) => [...row].forEach((ch, rx) => {
      if (ch !== "X") return;
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", rx * 54 + 20); r.setAttribute("y", ry * 54 + 10); r.setAttribute("width", 50); r.setAttribute("height", 50);
      r.setAttribute("fill", (rx * 7 + ry * 3) % 5 ? "var(--kf-accent)" : "var(--kf-surface)");
      r.setAttribute("stroke", "var(--kf-bg)");
      tiles.append(r);
    }));
  }
  // Numbers — when visible, count up from 0 (1.2s)
  document.querySelectorAll("[data-count]").forEach((el) => {
    const to = +el.dataset.count, plus = el.hasAttribute("data-plus") ? "+" : "";
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = to + plus; return; }
    const o = { v: 0 };
    el.textContent = "0";
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: to, duration: 1.2, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(o.v) + plus; } }) });
  });
})();
