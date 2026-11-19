// Writes where the cursor passed into a 40×40 flow grid by speed (decays by .08 each frame), pushes the image by that flow and splits RGB,
// Areas with strong flow break into 5px chunks — once the mouse stops, it settles back to the original image within 1 second
(() => {
  const VERT = `
    attribute vec2 uv; attribute vec2 position; varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;
  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uImage; uniform sampler2D uGrid;
    uniform vec2 uImageSize; uniform vec2 uPlaneSize;
    uniform float uDisplace; uniform float uRGB; uniform float uBlock; uniform float uPixelAmt;
    vec2 cover(vec2 uv) {
      float rs = uPlaneSize.x / uPlaneSize.y, ri = uImageSize.x / uImageSize.y;
      vec2 size = rs < ri ? vec2(uImageSize.x * uPlaneSize.y / uImageSize.y, uPlaneSize.y) : vec2(uPlaneSize.x, uImageSize.y * uPlaneSize.x / uImageSize.x);
      vec2 off = (rs < ri ? vec2((size.x - uPlaneSize.x) * 0.5, 0.0) : vec2(0.0, (size.y - uPlaneSize.y) * 0.5)) / size;
      return uv * uPlaneSize / size + off;
    }
    void main() {
      vec2 f0 = (texture2D(uGrid, vUv).rg - 0.5) * 2.0;
      float amt = clamp(length(f0) * uPixelAmt, 0.0, 1.0);
      vec2 cells = uPlaneSize / uBlock;
      vec2 su = mix(vUv, (floor(vUv * cells) + 0.5) / cells, amt);
      vec2 d = (texture2D(uGrid, su).rg - 0.5) * 2.0 * uDisplace;
      vec2 iuv = cover(su);
      vec4 g = texture2D(uImage, iuv + d);
      float r = texture2D(uImage, iuv + d * (1.0 + uRGB)).r;
      float b = texture2D(uImage, iuv + d * (1.0 - uRGB)).b;
      gl_FragColor = vec4(r, g.g, b, g.a);
    }`;

  // If a photo slot is empty (wire placeholder), draws that slot’s look — background, diagonals, label — so the flow stays visible.
  function paintPlaceholder(el, w, h) {
    const c = document.createElement("canvas"), dpr = Math.min(devicePixelRatio || 1, 2);
    c.width = Math.max(2, Math.round(w * dpr)); c.height = Math.max(2, Math.round(h * dpr));
    const x = c.getContext("2d"), cs = getComputedStyle(el);
    x.scale(dpr, dpr);
    const clear = /^rgba\(.*,\s*0\)$/.test(cs.backgroundColor) || cs.backgroundColor === "transparent";
    x.fillStyle = clear ? cs.getPropertyValue("--kf-raised") || cs.color : cs.backgroundColor;
    x.fillRect(0, 0, w, h);
    // A plain panel looks no different when pushed, so lay down a 20px grid (ink 22%) and a faint glow so that flow and splitting are visible even on placeholders.
    x.fillStyle = cs.getPropertyValue("--kf-ink") || cs.color;
    x.globalAlpha = 0.07;
    const glow = x.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.3, h * 0.3, Math.max(w, h));
    glow.addColorStop(0, "transparent"); glow.addColorStop(1, x.fillStyle);
    x.fillStyle = glow; x.fillRect(0, 0, w, h);
    x.globalAlpha = 1;
    x.strokeStyle = cs.getPropertyValue("--kf-ink") || cs.color;
    x.globalAlpha = 0.22;
    x.lineWidth = 2;
    x.beginPath();
    for (let gx = 1; gx < w; gx += 20) { x.moveTo(gx, 0); x.lineTo(gx, h); }
    for (let gy = 1; gy < h; gy += 20) { x.moveTo(0, gy); x.lineTo(w, gy); }
    x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h);
    x.stroke();
    x.globalAlpha = 1;
    x.fillStyle = clear ? cs.getPropertyValue("--kf-raised") || cs.color : cs.backgroundColor;
    const label = el.getAttribute("data-label");
    if (label) {
      x.font = `500 12px ${cs.getPropertyValue("--kf-font-mono") || "monospace"}`;
      x.textAlign = "center"; x.textBaseline = "middle";
      const tw = x.measureText(label).width + 16;
      x.fillRect(w / 2 - tw / 2, h / 2 - 11, tw, 22);
      x.fillStyle = cs.getPropertyValue("--kf-dim") || cs.color;
      x.fillText(label, w / 2, h / 2);
    }
    return c;
  }
  function svgImage(svg, color, w, h) {
    return new Promise((done) => {
      const copy = svg.cloneNode(true);
      copy.setAttribute("width", w); copy.setAttribute("height", h);
      copy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const src = new XMLSerializer().serializeToString(copy).replace(/currentColor/g, color);
      const img = new Image();
      img.onload = () => done(img);
      img.onerror = () => done(null);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src);
    });
  }

  kfFx.register("flow-pixel-distort", (el, { options, reduce, hover }) => {
    if (reduce || !hover || !window.OGL) return;
    const { Renderer, Program, Mesh, Triangle, Texture } = OGL;
    const decay = +(options.decay ?? 0.08), reach = +(options.radius ?? 3), gain = +(options.gain ?? 2600);
    // Cell count and cell texture: with look: cells, flow cells aren’t blended (nearest cell) and each cell is shifted as a whole, so the photo looks mosaic-like and misaligned
    const N = Math.max(4, Math.round(+options.grid || 40)), cells = String(options.look || "") === "cells";
    const src = el.querySelector('[data-fx-part="image"]');
    // settle: when first shown, each cell is off by about ±9px, then from the bottom center cell they loosen in turn over this many seconds and settle with decay
    const settle = reduce ? 0 : +(options.settle ?? 0);

    const renderer = new Renderer({ dpr: Math.min(devicePixelRatio || 1, 2), alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.className = "fx-flow-pixel-distort__gl";
    el.append(canvas);

    const px = new Uint8Array(N * N * 4), vel = new Float32Array(N * N * 2).fill(128);
    for (let i = 0; i < N * N; i++) { px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = 128; px[i * 4 + 3] = 255; }
    const filter = cells ? gl.NEAREST : gl.LINEAR;
    const grid = new Texture(gl, { image: px, width: N, height: N, generateMipmaps: false, minFilter: filter, magFilter: filter, flipY: false });
    const image = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
    const program = new Program(gl, {
      vertex: VERT, fragment: FRAG, transparent: true,
      uniforms: {
        uImage: { value: image }, uGrid: { value: grid }, uImageSize: { value: [1, 1] }, uPlaneSize: { value: [1, 1] },
        uDisplace: { value: +(options.displace ?? 0.09) }, uRGB: { value: +(options.rgb ?? 0.18) },
        uBlock: { value: +options.block || 5 }, uPixelAmt: { value: +(options.pixel ?? 15) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    let ready = false, alive = true, settleAt = settle > 0 ? -1 : 0;
    const release = new Float32Array(N * N);
    const seed = () => {
      const far = Math.hypot(N / 2, N);
      for (let i = 0; i < N * N; i++) {
        const gx = i % N, gy = Math.floor(i / N);
        vel[i * 2] = 128 + (Math.random() * 2 - 1) * 13; vel[i * 2 + 1] = 128 + (Math.random() * 2 - 1) * 13;
        px[i * 4] = Math.round(vel[i * 2]); px[i * 4 + 1] = Math.round(vel[i * 2 + 1]);
        release[i] = (settle * Math.hypot(gx + 0.5 - N / 2, gy + 0.5)) / far;
      }
      grid.needsUpdate = true;
      settleAt = performance.now();
    };
    const use = (source, w, h) => {
      if (!alive || !source) return;
      image.image = source;
      image.needsUpdate = true;
      program.uniforms.uImageSize.value = [w || 1, h || 1];
      ready = true;
      renderer.render({ scene: mesh });
      if (src) src.style.visibility = "hidden";
    };
    const load = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (src && src.tagName === "IMG") {
        const go = () => use(src, src.naturalWidth, src.naturalHeight);
        if (src.complete && src.naturalWidth) go(); else src.addEventListener("load", go, { once: true });
      } else if (src && src.tagName === "CANVAS") {
        use(src, src.width, src.height);
      } else if (src && src.tagName.toLowerCase() === "svg") {
        const r = src.getBoundingClientRect();
        svgImage(src, getComputedStyle(src).color, Math.round(r.width * 2), Math.round(r.height * 2)).then((img) => img && use(img, img.width, img.height));
      } else {
        const c = paintPlaceholder(src || el, w, h);
        use(c, c.width, c.height);
      }
    };

    const mouse = [0.5, 0.5], prev = [0.5, 0.5];
    let moved = false;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse[0] = (e.clientX - r.left) / r.width;
      mouse[1] = 1 - (e.clientY - r.top) / r.height;
      moved = true;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
    const step = () => {
      const held = settleAt > 0 ? (performance.now() - settleAt) / 1000 : Infinity;
      for (let i = 0; i < N * N; i++) {
        if (held < release[i]) continue;
        vel[i * 2] += (128 - vel[i * 2]) * decay;
        vel[i * 2 + 1] += (128 - vel[i * 2 + 1]) * decay;
        px[i * 4] = Math.round(vel[i * 2]); px[i * 4 + 1] = Math.round(vel[i * 2 + 1]);
      }
      if (moved) {
        const dx = mouse[0] - prev[0], dy = mouse[1] - prev[1];
        prev[0] = mouse[0]; prev[1] = mouse[1]; moved = false;
        const cx = Math.floor(N * mouse[0]), cy = Math.floor(N * mouse[1]), vx = clamp(128 + gain * dx), vy = clamp(128 + gain * dy), R = Math.ceil(reach);
        for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
          const gx = cx + x, gy = cy + y, d = Math.hypot(x, y);
          if (gx < 0 || gx >= N || gy < 0 || gy >= N || d > reach) continue;
          const k = 1 - d / reach, i = gy * N + gx;
          vel[i * 2] += (vx - vel[i * 2]) * k; vel[i * 2 + 1] += (vy - vel[i * 2 + 1]) * k;
          px[i * 4] = Math.round(vel[i * 2]); px[i * 4 + 1] = Math.round(vel[i * 2 + 1]);
        }
      }
      grid.needsUpdate = true;
    };

    let raf = 0, visible = false, lw = -1, lh = -1;
    const tick = () => {
      raf = visible ? requestAnimationFrame(tick) : 0;
      if (!ready) return;
      if (settleAt < 0) seed();
      step();
      renderer.render({ scene: mesh });
    };
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (w < 1 || h < 1 || (w === lw && h === lh)) return;
      const first = lw < 0;
      lw = w; lh = h;
      renderer.setSize(w, h);
      program.uniforms.uPlaneSize.value = [w, h];
      if (first || !(src && src.tagName === "IMG")) load(); else if (ready) renderer.render({ scene: mesh });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
      if (visible && !raf) raf = requestAnimationFrame(tick);
    }, { rootMargin: "300px 0px" });
    io.observe(el);
    const mo = new MutationObserver(() => { if (!(src && src.tagName === "IMG")) load(); });
    // When the canvas is redrawn, the user sends fx:refresh — for repainting the wordmark when the font arrives late
    const refresh = () => load();
    el.addEventListener("fx:refresh", refresh);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect(); mo.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("fx:refresh", refresh);
      if (src) src.style.visibility = "";
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });
})();
