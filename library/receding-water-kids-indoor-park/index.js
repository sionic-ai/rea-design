// First page: three cloud layers with mouse and scroll parallax, the mascot falls from the sky and lands on a cloud, meadow parallax, price table and event cards rising
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;

  // Clouds: --px and --py (−1 to 1) follow the mouse at .055 per step, plus scroll --sy. CSS shifts each cloud by its depth (--depth)
  const clouds = document.querySelector(".hl-clouds");
  if (clouds && !reduce) {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const paint = () => { clouds.style.setProperty("--px", x.toFixed(4)); clouds.style.setProperty("--py", y.toFixed(4)); clouds.style.setProperty("--sy", `${scrollY}px`); };
    const step = () => { x += (tx - x) * 0.055; y += (ty - y) * 0.055; paint(); raf = Math.abs(tx - x) > 5e-4 || Math.abs(ty - y) > 5e-4 ? requestAnimationFrame(step) : 0; };
    const kick = () => { if (!raf) raf = requestAnimationFrame(step); };
    if (fine) {
      addEventListener("pointermove", (e) => { tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; kick(); }, { passive: true });
      document.addEventListener("pointerleave", () => { tx = ty = 0; kick(); });
    }
    addEventListener("scroll", kick, { passive: true });
    paint();
  }

  // Mascot: stuck to the screen center, then past the line under the cloud it falls with scroll squared, lands on the support cloud, and rises together with it afterward
  const harby = document.querySelector(".hl-harby"), band = document.querySelector(".hl-clouds"), landing = document.querySelector(".hl-landing");
  if (harby && band && landing) {
    const startVh = 0.34, tuckVw = 0.03, sink = 0.72;
    let cloudBottom = 0, landTop = 0, landH = 0, half = 0;
    const place = () => {
      const W = innerWidth, H = innerHeight;
      const from = cloudBottom - startVh * H, to = landTop + landH / 2 - H / 2;
      const y0 = startVh * H - tuckVw * W - half - H / 2, y1 = landTop + sink * landH - to - half - H / 2;
      const s = reduce ? to : Math.min(scrollY, to), k = Math.max(0, Math.min(1, (s - from) / Math.max(1, to - from)));
      harby.style.setProperty("--drop-y", `${(y0 + (y1 - y0) * k * k - (scrollY - s)).toFixed(2)}px`);
    };
    const measure = () => {
      cloudBottom = band.getBoundingClientRect().bottom + scrollY;
      landTop = landing.getBoundingClientRect().top + scrollY;
      landH = landing.offsetHeight; half = harby.offsetHeight / 2;
      place();
    };
    measure();
    addEventListener("scroll", place, { passive: true });
    addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
  }

  // Grass front layer: rises and falls up to 3% of screen width in proportion to the distance between the section’s top edge and the screen center
  const zones = document.querySelector(".hl-zones-grass");
  if (zones && !reduce) {
    let top = 0;
    const paint = () => { const half = innerHeight / 2, d = Math.max(-1.5 * half, Math.min(1.5 * half, top - scrollY - half)); zones.style.setProperty("--grass-par", `${((d / half) * 0.03 * innerWidth).toFixed(2)}px`); };
    const measure = () => { top = zones.getBoundingClientRect().top + scrollY; paint(); };
    measure();
    addEventListener("scroll", paint, { passive: true });
    addEventListener("resize", measure);
  }

  if (reduce) return;
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // Price table: cells rise from 46px below (.7s power3.out, .12 stagger) and the white cells hide under the title, then are pushed up in 1.15s expo.out
    const grid = document.querySelector(".hl-pass-grid");
    if (grid) {
      const passes = gsap.utils.toArray(grid.querySelectorAll(".hl-pass"));
      const cells = passes.map((p) => gsap.utils.toArray(p.querySelectorAll(":scope > :not(.hl-pass-title)")));
      const depth = passes.map((p) => p.offsetHeight - (p.querySelector(".hl-pass-title")?.offsetHeight ?? 0));
      gsap.set(passes, { y: 46, autoAlpha: 0 });
      cells.forEach((c, i) => gsap.set(c, { y: depth[i] }));
      const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: "top 82%", once: true } }).to(passes, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.12 });
      cells.forEach((c, i) => tl.to(c, { y: 0, duration: 1.15, ease: "expo.out" }, 0.28 + 0.12 * i));
    }
  });
})();
