(() => {
  // Photo brightness mapped to glyph weight order — every cell is filled with a glyph, no blanks
  const RAMP = ".`'\",:;!~+=*coeaQO0O8#%@".split("");
  const colorOf = (host, css) => {
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    probe.style.color = css;
    host.append(probe);
    const got = getComputedStyle(probe).color;
    probe.remove();
    return got;
  };
  // With no photo (placeholder), a brightness map is drawn from the label text and a few round glows to give the lettering its texture
  let seedN = 0;
  const lightMap = (cols, rows, label, seed, face) => {
    const c = document.createElement("canvas");
    c.width = cols; c.height = rows;
    const g = c.getContext("2d");
    g.fillStyle = "rgb(30,30,30)"; /* Not skin: brightness plate not drawn on screen — a dark base */
    g.fillRect(0, 0, cols, rows);
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 7; i++) {
      const x = rnd() * cols, y = rnd() * rows, r = (0.15 + rnd() * 0.4) * cols;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, `rgba(255,255,255,${0.35 + rnd() * 0.55})`); /* Not skin: light intensity of the brightness map */
      grd.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: light end of the brightness plate */
      g.fillStyle = grd;
      g.fillRect(0, 0, cols, rows);
    }
    g.fillStyle = "rgb(255,255,255)"; /* Not skin: label text brightness on the brightness plate */
    g.font = `700 ${Math.round(cols / 7)}px ${face}`;
    g.textAlign = "center";
    (label || "").split(/\s*·\s*/).slice(0, 2).forEach((w, i) => g.fillText(w.slice(0, 8), cols / 2, rows * (0.45 + i * 0.12)));
    return g.getImageData(0, 0, cols, rows).data;
  };

  kfFx.register("ascii-photo-card", (el, { options, reduce, hover }) => {
    const photo = el.querySelector('[data-fx-part="photo"]');
    const cols = +options.cols || 92;
    const fps = +options.fps || 14;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    el.prepend(canvas);
    const ctx = canvas.getContext("2d");
    const seed = ++seedN;
    let grid = null;
    const bg = colorOf(el, "var(--fx-ascii-bg)"), ink = colorOf(el, "var(--fx-ascii-ink)");
    const mono = getComputedStyle(el).getPropertyValue("--kf-font-mono").trim() || "monospace";

    const read = () => {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      const cw = W / cols, ch = cw * 1.3, rows = Math.ceil(H / ch) + 1;
      const img = photo && photo.querySelector("img");
      let d = null;
      if (img && img.naturalWidth) {
        try {
          const off = document.createElement("canvas");
          off.width = cols; off.height = rows;
          const oc = off.getContext("2d");
          const ar = img.naturalWidth / img.naturalHeight, tar = cols / rows;
          let sw, sh, sx, sy;
          if (ar > tar) { sh = img.naturalHeight; sw = sh * tar; sx = (img.naturalWidth - sw) / 2; sy = 0; }
          else { sw = img.naturalWidth; sh = sw / tar; sx = 0; sy = (img.naturalHeight - sh) / 2; }
          oc.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
          d = oc.getImageData(0, 0, cols, rows).data;
        } catch (e) { d = null; }
      }
      if (!d) d = lightMap(cols, rows, (photo && photo.querySelector("[data-label]")?.getAttribute("data-label")) || el.getAttribute("data-label"), seed, mono);
      const n = cols * rows, lum = new Float32Array(n), ph = new Float32Array(n);
      for (let i = 0; i < n; i++) { const j = i * 4; lum[i] = (0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2]) / 255; ph[i] = Math.random() * 6.2832; }
      grid = { cols, rows, cw, ch, W, H, dpr, lum, ph };
      draw(0);
    };
    // Each cell wobbles with its own phase in letter order (±2.6) and brightness (±.06), so the letter picture always shimmers
    const draw = (t) => {
      const a = grid;
      if (!a) return;
      ctx.setTransform(a.dpr, 0, 0, a.dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, a.W, a.H);
      ctx.font = `700 ${(a.cw * 1.32).toFixed(1)}px ${mono}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = ink;
      const top = RAMP.length - 1;
      for (let y = 0; y < a.rows; y++) for (let x = 0; x < a.cols; x++) {
        const i = y * a.cols + x, l = a.lum[i];
        const k = Math.max(0, Math.min(top, Math.round(l * top + Math.sin(a.ph[i] + t * 2.6) * 1.7 + Math.sin(a.ph[i] * 1.7 - t * 1.1) * 0.9)));
        const al = 0.1 + l * 0.9 + Math.sin(a.ph[i] * 0.7 + t * 3.1) * 0.06;
        ctx.globalAlpha = al < 0.06 ? 0.06 : al > 1 ? 1 : al;
        ctx.fillText(RAMP[k], x * a.cw, y * a.ch);
      }
      ctx.globalAlpha = 1;
    };

    // Walk with photos — by hover or fx:focus (detail.on). A photo cropped from bottom to top unfolds
    let over = false, focus = false;
    const show = () => el.classList.toggle("is-photo", over || focus);
    const enter = () => { over = true; show(); };
    const leave = () => { over = false; show(); };
    const onFocus = (e) => { focus = !!(e.detail && e.detail.on); show(); };
    el.addEventListener("fx:focus", onFocus);
    if (hover) { el.addEventListener("pointerenter", enter); el.addEventListener("pointerleave", leave); }

    let seen = false, raf = 0, last = 0;
    const io = new IntersectionObserver(([en]) => { seen = en.isIntersecting; }, { rootMargin: "80px 120px" });
    io.observe(el);
    const ro = new ResizeObserver(read);
    ro.observe(el);
    const img = photo && photo.querySelector("img");
    if (img && !img.complete) img.addEventListener("load", read, { once: true });
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (!seen || now - last < 1000 / fps) return;
      last = now;
      draw(now / 1000);
    };
    if (!reduce) raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      el.removeEventListener("fx:focus", onFocus);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.classList.remove("is-photo");
      canvas.remove();
    };
  });
})();
