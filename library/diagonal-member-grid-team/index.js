/* Home — on phone (768px and below) scroll replaces interaction: when the card bottom rises above 65% of the screen it gets is-active (diagonal rotation · cover lifts) */
(() => {
  const DZ = window.DZ;
  if (!DZ) return;
  // Original kv is <video autoplay muted loop> Because it is a showreel, cuts change and spin as soon as the screen opens — with a still image the hero and the screen after the transition look stalled.
  // Placeholders also run with the same playback behavior (auto, loop, pause off-screen), and colors are read from skin variables so they change along when the skin changes
  const reel = (box) => {
    const cv = document.createElement("canvas"), ctx = cv.getContext("2d");
    cv.className = "dz-kv__reel";
    cv.setAttribute("aria-hidden", "true");
    box.prepend(cv);
    const cs = getComputedStyle(document.documentElement), v = (n) => cs.getPropertyValue(n).trim();
    const fields = ["--kf-accent-soft", "--kf-contrast-bg", "--kf-raised", "--kf-dim", "--kf-line"].map(v);
    const inks = ["--kf-contrast-bg", "--kf-contrast-ink", "--kf-dim", "--kf-bg", "--kf-contrast-ink"].map(v);
    const CUT = 1200;
    let raf = 0, t0 = performance.now();
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); cv.width = Math.round(box.clientWidth * d); cv.height = Math.round(box.clientHeight * d); };
    const draw = (now) => {
      const t = now - t0, k = Math.floor(t / CUT) % fields.length, p = (t % CUT) / CUT, w = cv.width, h = cv.height, m = Math.min(w, h);
      ctx.fillStyle = fields[k];
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = inks[k];
      for (let i = 0; i < 6; i++) {
        const s = ((k * 7 + i * 5) % 11) / 11;
        const x = w * ((s + i * 0.19 + 0.06 * p * (i % 2 ? 1 : -1) + 1) % 1), y = h * (0.2 + 0.6 * ((s * 3 + i * 0.37) % 1)), r = m * (0.05 + 0.1 * ((s * 5 + i * 0.3) % 1));
        ctx.beginPath();
        if ((k + i) % 3) ctx.arc(x, y, r * (1 + 0.04 * p), 0, Math.PI * 2);
        else ctx.rect(x - r * 0.6, y - r * 1.4, r * 1.2, r * 2.8);
        ctx.fill();
      }
    };
    const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
    const ro = new ResizeObserver(() => { size(); draw(performance.now()); });
    ro.observe(box);
    if (DZ.reduce) return () => { ro.disconnect(); cv.remove(); };
    const io = new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) raf = requestAnimationFrame(loop); }, { threshold: 0 });
    io.observe(box);
    return () => { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); cv.remove(); };
  };
  DZ.pages.home = ({ scope }) => {
    const box = scope.querySelector("[data-reel]"), stopReel = box ? reel(box) : null;
    const btn = document.querySelector(".dz-open"), kv = scope.querySelector(".dz-kv");
    const io = kv && btn ? new IntersectionObserver(([e]) => btn.classList.toggle("is-scrolled", !e.isIntersecting), { threshold: 0 }) : null;
    if (io) io.observe(kv);
    const mm = gsap.matchMedia();
    mm.add("not all and (min-width: 769px)", () => {
      const cards = [...scope.querySelectorAll(".dz-mem__link")];
      const update = () => { const line = innerHeight * 0.65; cards.forEach((c) => c.classList.toggle("is-active", c.getBoundingClientRect().bottom <= line)); };
      DZ.lenis.on("scroll", update);
      update();
      return () => { DZ.lenis.off("scroll", update); cards.forEach((c) => c.classList.remove("is-active")); };
    });
    return () => { stopReel?.(); io?.disconnect(); mm.revert(); btn?.classList.remove("is-scrolled"); };
  };
})();
