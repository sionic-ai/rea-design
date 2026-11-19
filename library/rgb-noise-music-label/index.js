// Hero photo slot — the original photo isn’t used, so draw a plate that shows ‹what the photo is› with skin colors and pass it to rgb-noise-settle.
// When the parts start gathering from noise (fx:ready), lift the loader, lower the header line and type the tagline one character per 50ms (ityped)
(() => {
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  const paint = (cv) => {
    const c = cv.getContext("2d"), w = cv.width, h = cv.height;
    c.fillStyle = v("--kf-raised");
    c.fillRect(0, 0, w, h);
    // Light beams falling from above — where the red and blue streaks in the original photo are
    const beam = c.createLinearGradient(0, 0, 0, h * 0.85);
    beam.addColorStop(0, v("--kf-accent"));
    beam.addColorStop(1, v("--kf-raised"));
    c.globalAlpha = 0.9;
    c.fillStyle = beam;
    c.beginPath();
    c.moveTo(w * 0.42, 0); c.lineTo(w * 0.58, 0); c.lineTo(w * 0.78, h); c.lineTo(w * 0.22, h);
    c.fill();
    // Spot for a floating jellyfish — faint dots
    c.fillStyle = v("--kf-ink");
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      c.globalAlpha = 0.15 + rnd() * 0.35;
      c.beginPath();
      c.arc(w * (0.15 + rnd() * 0.7), h * (0.08 + rnd() * 0.72), (2 + rnd() * 9) * (w / 1920), 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
    // Placeholder X and label
    c.strokeStyle = v("--kf-line");
    c.lineWidth = Math.max(1, w / 1920);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h); c.moveTo(w, 0); c.lineTo(0, h); c.stroke();
    const px = Math.round(Math.max(12, w / 80)), fam = v("--kf-font-mono") || "monospace";
    c.font = `500 ${px}px ${fam}`;
    c.textAlign = "center";
    c.fillStyle = v("--kf-dim");
    c.fillText(cv.dataset.label || "", w / 2, h * 0.86);
  };
  document.querySelectorAll(".al-mv__ph").forEach(paint);

  const mv = document.querySelector(".al-mv");
  let done = false;
  const ready = () => {
    if (done) return;
    done = true;
    document.body.dataset.loaded = "1";
    const el = document.querySelector(".al-mv__state");
    const text = el?.dataset.type;
    if (!el || !text) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !window.ityped) { el.textContent = text; return; }
    ityped.init(el, { strings: [text], typeSpeed: 50, startDelay: 500, showCursor: false, disableBackTyping: true, loop: false });
  };
  mv?.addEventListener("fx:ready", ready);
  // So the loader clears even on devices where WebGL can’t run
  setTimeout(ready, 4000);
})();
