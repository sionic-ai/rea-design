// Covers the screen with three layers of big pixels (32·16·8 cells on a 256-high panel) — each cell turns on at a different time (per layer only .4·.5·1 of the cells, start 0~.48 + .16×layer)
// As panel progress e passes its start (over .2), cells turn on ever more densely by crossing 4×4 Bayer thresholds in order. The whole veil is easeInOutQuad 1.1s.
// Because it must go to the next page while covered, a mark saying it left covered is kept in sessionStorage, and the next page sees it and walks the same cells backward.
(() => {
  const LAYERS = [{ size: 32, share: 0.4 }, { size: 16, share: 0.5 }, { size: 8, share: 1 }];
  const hash = (n) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); };
  const bayer = (a, b) => (2 * a + 3 * b) % 4;
  const quad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  kfFx.register("dither-cover", (el, { options, reduce }) => {
    const KEY = "kf-fx-dither-cover";
    const dur = +(options.dur ?? 1.1), coverDur = +(options.cover ?? dur), hold = +(options.hold ?? 0.22);
    const ac = new AbortController(), signal = ac.signal;
    const veil = document.createElement("div");
    veil.className = "fx-dither-cover";
    veil.setAttribute("aria-hidden", "true");
    veil.innerHTML = "<canvas></canvas>";
    document.body.append(veil);
    const cv = veil.firstChild, cx = cv.getContext("2d");
    // The color to paint comes from the skin — canvas can’t read variables, so paint one dot and sample it
    const tint = () => {
      const probe = document.createElement("i");
      probe.style.cssText = `display:none;color:${getComputedStyle(veil).getPropertyValue("--fx-cover").trim() || "var(--kf-accent)"}`;
      veil.append(probe);
      const css = getComputedStyle(probe).color;
      probe.remove();
      const p = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
      p.fillStyle = css; p.fillRect(0, 0, 1, 1);
      return p.getImageData(0, 0, 1, 1).data;
    };
    let img, starts, dither, level = 0, raf = 0, seed = 0;
    const build = () => {
      cv.height = 256;
      cv.width = Math.max(1, Math.ceil((256 * innerWidth) / innerHeight));
      const n = cv.width * cv.height, [r, g, b] = tint();
      img = cx.createImageData(cv.width, cv.height);
      starts = new Float32Array(n * 3);
      dither = new Float32Array(n);
      for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
        const i = y * cv.width + x;
        dither[i] = (4 * bayer(x % 2, y % 2) + bayer((x >> 1) % 2, (y >> 1) % 2) + 0.5) / 16;
        LAYERS.forEach(({ size, share }, k) => {
          const s = Math.floor(x / size) + 997 * Math.floor(y / size) + 7919 * k + seed;
          starts[i * 3 + k] = hash(s) <= share ? 0.48 * hash(s + 50021) + 0.16 * k : 2;
        });
        img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b;
      }
    };
    const draw = (e) => {
      for (let i = 0; i < dither.length; i++) {
        let a = 0;
        for (let k = 0; k < 3; k++) a = Math.max(a, Math.min(1, Math.max(0, (e - starts[i * 3 + k]) / 0.2)));
        img.data[i * 4 + 3] = e === 1 || (e > 0 && a >= dither[i]) ? 255 : 0;
      }
      cx.putImageData(img, 0, 0);
    };
    const tween = (to, sec) => new Promise((done) => {
      cancelAnimationFrame(raf);
      const from = level, t0 = performance.now();
      if (reduce || !sec) { level = to; draw(to); return done(); }
      const step = (now) => {
        const t = Math.min(1, Math.max(0, (now - t0) / (sec * 1000)));
        level = from + (to - from) * quad(t);
        draw(level);
        if (t < 1) raf = requestAnimationFrame(step); else done();
      };
      raf = requestAnimationFrame(step);
    });

    // Arrival: if the page was reached after covering and leaving, start covered and walk in a different cell order (seed 104729)
    if (sessionStorage.getItem(KEY) === "1") {
      sessionStorage.removeItem(KEY);
      seed = 104729;
      build();
      level = 1;
      draw(1);
      veil.classList.add("is-on");
      tween(0, dur).then(() => veil.classList.remove("is-on"));
    } else build();
    el.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.href.split("#")[0] === location.href.split("#")[0]) return;
      e.preventDefault();
      if (reduce || !coverDur) { location.href = url.href; return; }
      seed = 0;
      build();
      level = 0;
      veil.classList.add("is-on");
      tween(1, coverDur).then(() => {
        sessionStorage.setItem(KEY, "1");
        setTimeout(() => (location.href = url.href), hold * 1000);
      });
    }, { signal });
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); draw(level); }, 120); }, { signal });
    addEventListener("pageshow", (e) => { if (e.persisted) { level = 0; draw(0); veil.classList.remove("is-on"); } }, { signal });
    return () => { ac.abort(); clearTimeout(rt); cancelAnimationFrame(raf); veil.remove(); };
  });
})();
