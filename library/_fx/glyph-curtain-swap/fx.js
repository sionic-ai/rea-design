(() => {
  // Divide the screen into 5×8px cells, each with a blinking monospace character (01<>[]{}…) blot patterns spread in turn to cover the panel (cover), then clear in a different blot order (reveal).
  // One cell is on for 12% of the total length, and a cell on for over 35% also lays a background-color plate to hide the screen behind. While covered, characters change every 70~190ms per cell
  const GLYPHS = "01<>[]{}()/\\|=+*#%&$@!?;:.~01ABCDEF0123456789";
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  // Smoothly stretches 6×4 value noise to give each cell a 0~.88 delay — the curtain doesn’t sweep one way but spreads in blotches
  function delayField(cols, rows) {
    const seed = new Float32Array(35).map(() => Math.random());
    const f = new Float32Array(cols * rows);
    let lo = Infinity, hi = -Infinity;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const gx = (x / cols) * 6, gy = (y / rows) * 4, ix = Math.floor(gx), iy = Math.floor(gy);
      const sx = (gx - ix) ** 2 * (3 - 2 * (gx - ix)), sy = (gy - iy) ** 2 * (3 - 2 * (gy - iy));
      const k = 7 * iy + ix;
      const a = seed[k] + (seed[k + 1] - seed[k]) * sx;
      const b = seed[k + 7] + (seed[k + 8] - seed[k + 7]) * sx;
      const v = a + (b - a) * sy + (Math.random() - 0.5) * 0.08;
      f[y * cols + x] = v; lo = Math.min(lo, v); hi = Math.max(hi, v);
    }
    const d = hi - lo || 1;
    return f.map((v) => ((v - lo) / d) * 0.88);
  }

  const rgbOf = (css) => {
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    c.fillStyle = css; c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };

  kfFx.register("glyph-curtain-swap", (el, { options, reduce }) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.append(canvas);
    const ctx = canvas.getContext("2d");
    const dur = (reduce ? +(options["reduced-dur"] ?? 180) : +(options.dur ?? 720));
    const cellW = +(options.cell ?? 5), cellH = +(options["cell-h"] ?? 8);
    let grid = null, phase = "idle", startedAt = 0, done = null, raf = 0, dirty = true;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2), w = innerWidth, h = innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(1, Math.round(w / cellW)), rows = Math.max(1, Math.round(h / cellH));
      const cw = w / cols, ch = h / rows, n = cols * rows;
      const cs = getComputedStyle(el);
      const bg = rgbOf(cs.getPropertyValue("--fx-curtain-bg").trim() || cs.backgroundColor);
      const ink = cs.color;
      // Letter strip: one cell per letter, drawn once, then cut and pasted per cell
      const atlas = document.createElement("canvas");
      const aw = Math.ceil(cw * dpr), ah = Math.ceil(ch * dpr);
      atlas.width = aw * GLYPHS.length; atlas.height = ah;
      const ac = atlas.getContext("2d");
      ac.font = `${Math.round(ch * 0.86 * dpr)}px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-mono").trim() || "monospace"}`;
      ac.textAlign = "center"; ac.textBaseline = "middle"; ac.fillStyle = ink;
      for (let i = 0; i < GLYPHS.length; i++) ac.fillText(GLYPHS[i], i * aw + aw / 2, ah / 2);
      const mk = (cw2, ch2) => { const c = document.createElement("canvas"); c.width = cw2; c.height = ch2; return [c, c.getContext("2d")]; };
      const [glyphs, gctx] = mk(Math.round(w * dpr), Math.round(h * dpr));
      const [scratch, sctx] = mk(Math.round(w * dpr), Math.round(h * dpr));
      const [mask, mctx] = mk(cols, rows);
      const [solid, octx] = mk(cols, rows);
      grid = {
        cols, rows, cw, ch, n, w, h, dpr, bg, atlas, aw, ah, glyphs, gctx, scratch, sctx, mask, mctx, solid, octx,
        maskImg: mctx.createImageData(cols, rows), solidImg: octx.createImageData(cols, rows),
        seeds: new Uint16Array(n).map(() => Math.floor(Math.random() * 65536)),
        periods: new Float32Array(n).map(() => 70 + 120 * Math.random()),
        cover: delayField(cols, rows), reveal: delayField(cols, rows), cursor: 0,
      };
      for (let i = 0; i < n; i++) glyph(i, 0);
      dirty = false;
    }

    function glyph(i, now) {
      const g = grid, x = (i % g.cols) * g.cw * g.dpr, y = Math.floor(i / g.cols) * g.ch * g.dpr;
      const k = (g.seeds[i] + Math.floor((now + g.seeds[i]) / g.periods[i])) % GLYPHS.length;
      g.gctx.clearRect(x, y, g.aw, g.ah);
      g.gctx.drawImage(g.atlas, k * g.aw, 0, g.aw, g.ah, x, y, g.aw, g.ah);
    }

    function frame(p, now) {
      const g = grid, delays = phase === "cover" ? g.cover : g.reveal;
      if (reduce) {
        ctx.clearRect(0, 0, g.w, g.h);
        ctx.globalAlpha = phase === "cover" ? p : 1 - p;
        ctx.fillStyle = `rgb(${g.bg.join(",")})`; ctx.fillRect(0, 0, g.w, g.h); ctx.globalAlpha = 1;
        return;
      }
      const sd = g.solidImg.data, md = g.maskImg.data;
      for (let i = 0; i < g.n; i++) {
        const t = clamp((p - delays[i]) * (1 / 0.12)), s = phase === "cover" ? t : 1 - t, j = 4 * i;
        sd[j] = g.bg[0]; sd[j + 1] = g.bg[1]; sd[j + 2] = g.bg[2]; sd[j + 3] = s >= 0.35 ? 255 : 0;
        if (s <= 0.02) { md[j + 3] = 0; continue; }
        const flick = (g.seeds[i] + Math.floor((now + g.seeds[i]) / g.periods[i])) % 19 === 0;
        const idle = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(0.004 * now + g.seeds[i]));
        const a = (t > 0 && t < 1) || flick ? 1 : idle;
        md[j] = md[j + 1] = md[j + 2] = 255; md[j + 3] = Math.round(clamp(a) * clamp(1.3 * s) * 255);
      }
      g.octx.putImageData(g.solidImg, 0, 0); g.mctx.putImageData(g.maskImg, 0, 0);
      const step = Math.min(2048, Math.ceil(g.n / 48));
      for (let k = 0; k < step; k++) { glyph(g.cursor, now); g.cursor = (g.cursor + 7919) % g.n; }
      const W = g.w * g.dpr, H = g.h * g.dpr;
      g.sctx.globalCompositeOperation = "copy"; g.sctx.drawImage(g.glyphs, 0, 0);
      g.sctx.globalCompositeOperation = "destination-in"; g.sctx.imageSmoothingEnabled = false; g.sctx.drawImage(g.mask, 0, 0, W, H);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H); ctx.drawImage(g.solid, 0, 0, W, H); ctx.drawImage(g.scratch, 0, 0); ctx.restore();
    }

    // The end is timed by a clock — when many cells make one cycle long, the side that watches the end via rAF would switch sections one cycle late
    let endTimer = 0, skip = false;
    function finish() {
      clearTimeout(endTimer);
      if (phase !== "cover" && phase !== "reveal") return;
      cancelAnimationFrame(raf); raf = 0;
      const was = phase, cb = done;
      done = null;
      if (was === "reveal") { phase = "idle"; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); el.removeAttribute("data-curtain"); }
      else { frame(1, performance.now()); phase = "held"; el.setAttribute("data-curtain", "held"); }
      el.dispatchEvent(new CustomEvent(was === "cover" ? "fx:covered" : "fx:revealed"));
      cb && cb();
    }

    function tick(now) {
      raf = 0;
      if (phase !== "cover" && phase !== "reveal") return;
      const p = Math.min((now - startedAt) / dur, 1);
      if (p >= 1) return finish();
      // Cell compositing is heavy, so draw once every two frames — so one long frame does not delay the end (section change)
      if ((skip = !skip)) frame(p, now);
      raf = requestAnimationFrame(tick);
    }

    function run(next, cb) {
      if (dirty || !grid) build();
      phase = next; done = cb || null; startedAt = performance.now();
      el.setAttribute("data-curtain", next);
      cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
      clearTimeout(endTimer); endTimer = setTimeout(finish, dur);
    }
    const onCover = (e) => run("cover", e.detail?.done);
    const onReveal = (e) => run("reveal", e.detail?.done);
    // When the window resizes, rebuild during idle time — building on the next cover would delay the cover by that much
    let rebuildTimer = 0;
    const onResize = () => { dirty = true; clearTimeout(rebuildTimer); rebuildTimer = setTimeout(() => { if (phase === "idle") build(); }, 250); };
    el.addEventListener("fx:cover", onCover);
    el.addEventListener("fx:reveal", onReveal);
    addEventListener("resize", onResize);

    // links: on — clicking a same-site link covers the page and then navigates, and the next document opens covered and then lifts
    const KEY = "fx-glyph-curtain";
    const onClick = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      run("cover", () => { try { sessionStorage.setItem(KEY, "1"); } catch {} location.href = url.href; });
    };
    if (options.links === "on") {
      document.addEventListener("click", onClick);
      let arrived = false;
      try { arrived = sessionStorage.getItem(KEY) === "1"; sessionStorage.removeItem(KEY); } catch {}
      if (arrived) { build(); phase = "cover"; frame(1, performance.now()); phase = "held"; requestAnimationFrame(() => run("reveal")); }
    }
    // 30k cells and the text board would delay the first cover if built then — they are prebuilt when idle .3s after attaching (the original also builds in chunks after 300ms)
    const prebuild = setTimeout(() => { if (!grid || dirty) build(); }, 300);
    return () => {
      clearTimeout(prebuild); clearTimeout(endTimer); clearTimeout(rebuildTimer);
      cancelAnimationFrame(raf);
      el.removeEventListener("fx:cover", onCover); el.removeEventListener("fx:reveal", onReveal);
      removeEventListener("resize", onResize); document.removeEventListener("click", onClick);
      canvas.remove(); el.removeAttribute("data-curtain");
    };
  });
})();
