// Work list — cards float up in sequence, and the dot grid of the Contact card lights up only around the cursor (original dot panel 18px spacing).
(() => {
  const { reduce } = window.PS;
  document.addEventListener("ps:ready", () => {
    const cards = [...document.querySelectorAll(".works__grid > *")];
    if (!reduce) cards.forEach((c) => gsap.from(c, { opacity: 0, y: 60, duration: 1, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 95%" } }));
    const cv = document.querySelector(".talk__dots");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const ink = window.PS.cssColor("--kf-ink").map((v) => Math.round(v * 255));
    let mx = -999, my = -999, W = 0, H = 0, raf = 0;
    const size = () => { const r = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * r; cv.height = H * r; ctx.setTransform(r, 0, 0, r, 0, 0); draw(); };
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let y = 9; y < H; y += 18) for (let x = 9; x < W; x += 18) {
        const d = Math.hypot(x - mx, y - my), a = 0.18 + 0.7 * Math.max(0, 1 - d / 140);
        ctx.fillStyle = `rgba(${ink},${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, 1.1 + Math.max(0, 1 - d / 140), 0, 6.283); ctx.fill();
      }
      raf = 0;
    }
    size();
    addEventListener("resize", size);
    if (reduce) return;
    cv.parentElement.addEventListener("pointermove", (e) => { const b = cv.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; if (!raf) raf = requestAnimationFrame(draw); });
    cv.parentElement.addEventListener("pointerleave", () => { mx = my = -999; if (!raf) raf = requestAnimationFrame(draw); });
  });
})();
