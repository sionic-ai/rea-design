// Hero ”Stretch-out” line — like the original Studio Lottie (plays on appear, .8s late), run our line shapes with lottie-web, and
// The trailing letters (the suffix and Enjoy Music) follow the line end by the same frame number. Line end: frame 0 110 → frame 30 620 → frame 48 260 (curve o(.33,1) i(.68,1), 60fps)
(() => {
  const box = document.querySelector(".tp-zudon__line");
  const tail = document.querySelector(".tp-zudon__b");
  if (!box || !window.lottie || !window.tpZudonLine) return;
  const data = JSON.parse(JSON.stringify(window.tpZudonLine));
  // Line color is the Skin’s text color — converts the computed color to 0–1 and feeds it into the Lottie fill
  const rgb = getComputedStyle(document.body).color.match(/[\d.]+/g).slice(0, 3).map((v) => +v / 255);
  data.layers.forEach((l) => l.shapes.forEach((g) => g.it.forEach((it) => { if (it.ty === "fl") it.c.k = [...rgb, 1]; })));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const anim = lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: false, animationData: data });
  // Same curve as the original Lottie — cubic-bezier(.33,1,.68,1) applied to progress between sections
  const bez = (x1, y1, x2, y2) => (t) => {
    let u = t;
    for (let i = 0; i < 8; i++) {
      const x = 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u * u * (1 - u) + u ** 3 - t;
      const dx = 3 * x1 * (1 - u) ** 2 + 6 * (x2 - x1) * u * (1 - u) + 3 * (1 - x2) * u * u;
      if (Math.abs(dx) < 1e-6) break;
      u = Math.min(1, Math.max(0, u - x / dx));
    }
    return 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u * u * (1 - u) + u ** 3;
  };
  const ease = bez(0.33, 1, 0.68, 1);
  const KEYS = [[0, 110], [30, 620], [48, 260]];
  const edge = (f) => {
    if (f <= KEYS[0][0]) return KEYS[0][1];
    for (let i = 1; i < KEYS.length; i++) {
      const [f0, v0] = KEYS[i - 1], [f1, v1] = KEYS[i];
      if (f <= f1) return v0 + (v1 - v0) * ease((f - f0) / (f1 - f0));
    }
    return KEYS[KEYS.length - 1][1];
  };
  const follow = (f) => { tail.style.translate = `${(edge(f) - 260).toFixed(1)}px 0`; };
  anim.addEventListener("DOMLoaded", () => {
    if (reduce) { anim.goToAndStop(84, true); follow(84); return; }
    anim.goToAndStop(0, true);
    follow(0);
    setTimeout(() => anim.play(), 800);
  });
  anim.addEventListener("enterFrame", (e) => follow(e.currentTime));
})();
