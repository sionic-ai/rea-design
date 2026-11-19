// Shared by the three pages of the Brand site — map pattern baking, loading curtain lift, phone menu band, video window, Rellax (same library and settings as the original).
// Day · night skins are <head> One line of text for the clock (06:00–17:59 day, ?nowstr=Try switching to HHMM) and pick it first
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (k) => getComputedStyle(root).getPropertyValue(k).trim();

  // Original background is a gray aerial map photo — in the same spot lay a street and building pattern curved in the skin color (edges wrapped so there is no seam)
  const paintMap = () => {
    const W = 900, c = document.createElement("canvas");
    c.width = c.height = W;
    const g = c.getContext("2d");
    if (!g) return;
    let seed = 20211;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const wrap = (draw) => { for (const dx of [-W, 0, W]) for (const dy of [-W, 0, W]) { g.save(); g.translate(dx, dy); draw(); g.restore(); } };
    g.fillStyle = css("--kf-surface");
    g.fillRect(0, 0, W, W);
    g.fillStyle = css("--kf-dim");
    const angle = (x, y) => 0.55 * Math.sin((x / W) * Math.PI * 2) + 0.35 * Math.cos((y / W) * Math.PI * 2);
    for (let i = 0; i < 9000; i++) {
      const x = rnd() * W, y = rnd() * W, w = 3 + rnd() * 11, h = 3 + rnd() * 7, a = 0.025 + rnd() * 0.075, t = angle(x, y);
      wrap(() => { g.globalAlpha = a; g.translate(x, y); g.rotate(t); g.fillRect(-w / 2, -h / 2, w, h); });
    }
    g.globalAlpha = 0.7;
    g.strokeStyle = css("--kf-bg");
    g.lineCap = "round";
    for (let i = 0; i < 14; i++) {
      let x = rnd() * W, y = rnd() * W, t = rnd() * Math.PI * 2;
      const pts = [[x, y]], lw = i < 3 ? 5 + rnd() * 3 : 1.2 + rnd() * 1.6;
      for (let k = 0; k < 14; k++) { t += (rnd() - 0.5) * 0.35; x += Math.cos(t) * 70; y += Math.sin(t) * 70; pts.push([x, y]); }
      wrap(() => { g.lineWidth = lw; g.beginPath(); pts.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke(); });
    }
    root.style.setProperty("--site-map-tile", `url(${c.toDataURL("image/jpeg", 0.82)})`);
  };
  paintMap();

  // Loading — once everything has loaded, the white curtain lifts in 1s and the body turns on at that moment
  const main = document.getElementById("mk-main");
  const loading = document.getElementById("mk-loading");
  let shown = false;
  const show = () => {
    if (shown) return;
    shown = true;
    loading?.classList.add("is-hide");
    main?.classList.remove("is-hide");
    document.dispatchEvent(new CustomEvent("mk:show"));
  };
  if (document.readyState === "complete") requestAnimationFrame(show);
  else addEventListener("load", show, { once: true });

  // Rellax — exactly as the original center: true, base widths [576, 768, 1201]. Measured after the font has loaded and the height has settled
  let rellax = null;
  if (!reduce && window.Rellax && document.querySelector(".mk-rellax")) {
    document.addEventListener("mk:show", () => {
      (document.fonts?.ready || Promise.resolve()).then(() => { rellax = new Rellax(".mk-rellax", { center: true, breakpoints: [576, 768, 1201] }); });
    }, { once: true });
    addEventListener("resize", () => rellax?.refresh());
  }

  // Phone menu band — drops from the top in .5s
  const header = document.getElementById("mk-header");
  header?.querySelector(".mk-burger")?.addEventListener("click", () => header.classList.add("is-open"));
  header?.querySelector(".mk-close")?.addEventListener("click", () => header.classList.remove("is-open"));

  // Video window — the scrim turns on in .5s linear, and tapping the scrim or close turns it off
  const float = document.getElementById("mk-float");
  const close = () => { float?.classList.remove("is-open"); float?.setAttribute("aria-hidden", "true"); document.body.classList.remove("is-locked"); };
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-mk-movie]");
    if (!t || !float) return;
    e.preventDefault();
    float.classList.add("is-open");
    float.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
  });
  float?.querySelector(".mk-float__bg")?.addEventListener("click", close);
  float?.querySelector(".mk-float__close")?.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
