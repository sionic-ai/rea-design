(() => {
  // One screen-fixed WebGL2 canvas draws all the photo frames (creating a context per frame gets blocked by the browser at sixteen).
  // Tiles far from screen center print as a 4×4 Bayer dither in two paper tones, and nearer the center the gradation steps grow 1→7, passing through gray and developing into the original color.
  // Inside the magnifier circle that follows the cursor develops immediately (hairline border), and when the mouse stops for 220ms every box slowly develops.
  // Inside the cell <img>·<video>(data-fx-part="media") If missing, a placeholder graphic is drawn from data-label — if a photo is provided, it is used as is
  const VS = `#version 300 es
in vec2 aPos;
uniform vec4 uRect; uniform vec2 uView, uPivot; uniform float uAngle, uScale;
out vec2 vUv;
void main(){
  vec2 p = uRect.xy + aPos * uRect.zw - uPivot;
  float c = cos(uAngle), s = sin(uAngle);
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) * uScale + uPivot;
  vUv = aPos;
  gl_Position = vec4(p.x / uView.x * 2. - 1., 1. - p.y / uView.y * 2., 0., 1.);
}`;
  const FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 outColor;
uniform sampler2D uTex; uniform vec2 uBox, uMouse, uWin, uShift; uniform float uP, uLens, uCell; uniform vec3 uDark, uLight;
const float B[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
float luma(vec3 c){ return dot(c, vec3(.2126, .7152, .0722)); }
void main(){
  vec2 px = vUv * uBox;
  vec2 cell = floor(px / uCell);
  vec2 mid = (cell + .5) * uCell / uBox;
  vec3 full = texture(uTex, vUv * uWin + uShift, -.5).rgb;
  vec3 cellRgb = texture(uTex, mid * uWin + uShift).rgb;
  float dist = length(px - uMouse);
  float inLens = 1. - smoothstep(uLens - 1.5, uLens, dist);
  float p = clamp(max(uP, inLens), 0., 1.);
  float steps = mix(1., 7., smoothstep(0., .55, p));
  float th = (B[int(mod(cell.x, 4.)) + int(mod(cell.y, 4.)) * 4] + .5) / 16. - .5;
  float q = clamp(floor(luma(cellRgb) * steps + .5 + th) / steps, 0., 1.);
  vec3 printed = mix(uDark, uLight, q);
  vec3 developed = mix(vec3(luma(full)), full, smoothstep(.55, 1., p));
  vec3 col = mix(printed, developed, smoothstep(.35, .8, p));
  float rim = (1. - smoothstep(.6, 1.8, abs(dist - uLens - 1.))) * (1. - smoothstep(.9, 1., uP)) * smoothstep(6., 24., uLens);
  col = mix(col, uDark, rim * .95);
  float edge = min(min(px.x, px.y), min(uBox.x - px.x, uBox.y - px.y));
  float a = clamp(edge + .5, 0., 1.);
  outColor = vec4(col * a, a);
}`;

  let R = null;
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  // Placeholder art — each slot type only sketches the look of a screen capture (ui), phone screen (phone) or photo (photo). Colors come from the hue of the label (to show color appearing as it develops)
  const paint = (cv, kind, seed, t) => {
    const c = cv.getContext("2d"), w = cv.width, h = cv.height, hue = seed % 360, alt = (hue + 140) % 360;
    const hsl = (hh, s, l) => `hsl(${hh} ${s}% ${l}%)`; // Not skin: placeholder photo colors — each label needs a different hue so the developing is visible
    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, hsl(hue, 45, kind === "photo" ? 62 : 14)); g.addColorStop(1, hsl(alt, 50, kind === "photo" ? 30 : 22));
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const shift = t ? (t * 40) % h : 0;
    if (kind === "photo") {
      c.fillStyle = hsl(alt, 35, 18); c.beginPath(); c.ellipse(w * (0.35 + ((seed >> 4) % 30) / 100), h * 0.62, w * 0.18, h * 0.42, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = hsl(hue, 70, 82); c.beginPath(); c.arc(w * 0.72, h * 0.28 + Math.sin(t || 0) * h * 0.03, h * 0.12, 0, Math.PI * 2); c.fill();
      c.fillStyle = hsl(alt, 25, 10); c.fillRect(0, h * 0.82, w, h * 0.18);
    } else {
      const bar = kind === "phone" ? h * 0.06 : h * 0.09;
      c.fillStyle = hsl(hue, 30, 8); c.fillRect(0, 0, w, bar);
      c.fillStyle = hsl(hue, 80, 70); c.fillRect(w * 0.06, bar * 0.35, w * 0.12, bar * 0.3);
      c.font = `700 ${Math.round(h * (kind === "phone" ? 0.07 : 0.11))}px sans-serif`; c.fillStyle = hsl(hue, 20, 92);
      c.fillText("Headline", w * 0.06, bar + h * 0.16 - shift * 0.2);
      for (let i = 0; i < 9; i++) {
        const y = bar + h * 0.24 + i * h * 0.1 - shift;
        c.fillStyle = hsl(i % 3 ? hue : alt, 40, i % 3 ? 70 : 55);
        c.fillRect(w * 0.06, y, w * (0.3 + ((seed >> i) % 50) / 100), h * 0.035);
      }
      c.fillStyle = hsl(alt, 75, 60); c.fillRect(w * 0.06, h * 0.86 - (kind === "phone" ? 0 : shift * 0.1), w * 0.24, h * 0.07);
    }
  };

  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "print-develop-canvas");
    canvas.setAttribute("aria-hidden", "true");
    // Behind the panels — the panel background is left transparent and the borders and text are drawn by the DOM above it. Stacking order is --fx-develop-z in the using side’s :root
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:var(--fx-develop-z, 0)";
    document.body.prepend(canvas);
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) { canvas.remove(); return null; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return null; }
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {};
    ["uRect", "uView", "uPivot", "uAngle", "uScale", "uTex", "uBox", "uMouse", "uWin", "uShift", "uP", "uLens", "uCell", "uDark", "uLight"].forEach((n) => (u[n] = gl.getUniformLocation(prog, n)));
    const r = {
      canvas, gl, u, items: new Set(), mouse: { x: -1e5, y: -1e5 }, lens: { x: -1e5, y: -1e5, r: 0 }, dwell: 0, moved: 0, strength: 1,
      dpr: 1, W: 0, H: 0, raf: 0, last: 0, tones: null, sampleHex: "",
    };
    const toRgb = (name) => {
      const probe = document.createElement("i"); probe.style.color = `var(${name})`; probe.style.display = "none"; document.body.append(probe);
      const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      pix.fillStyle = getComputedStyle(probe).color; pix.fillRect(0, 0, 1, 1); probe.remove();
      const d = pix.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
    r.resize = () => {
      r.dpr = Math.min(devicePixelRatio || 1, 2); r.W = innerWidth; r.H = innerHeight;
      canvas.width = Math.round(r.W * r.dpr); canvas.height = Math.round(r.H * r.dpr);
      r.tones = { dark: toRgb("--kf-ink"), light: toRgb("--kf-bg") };
    };
    r.onMove = (e) => { if (e.pointerType === "mouse") { r.mouse.x = e.clientX; r.mouse.y = e.clientY; } };
    r.onStrength = (e) => { r.strength = Math.max(0, Math.min(1, +e.detail)); };
    addEventListener("resize", r.resize);
    addEventListener("pointermove", r.onMove, { passive: true });
    document.addEventListener("fx:develop-strength", r.onStrength);
    r.resize();
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    r.frame = (now) => {
      r.raf = requestAnimationFrame(r.frame);
      const ratio = Math.min(4, Math.max(0.25, (now - (r.last || now)) / (1000 / 60) || 1)); r.last = now;
      const k = (base) => 1 - (1 - base) ** ratio;
      const { W, H, dpr } = r;
      gl.viewport(0, 0, canvas.width, canvas.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.uView, W, H);
      gl.uniform3f(u.uDark, ...r.tones.dark); gl.uniform3f(u.uLight, ...r.tones.light);
      gl.uniform1f(u.uCell, Math.max(2, Math.round(2 * dpr)));
      let hover = null, shift = 0;
      const list = [];
      for (const it of r.items) {
        const b = it.el.getBoundingClientRect();
        if (it.at) shift = Math.max(shift, Math.abs(b.left - it.at[0]), Math.abs(b.top - it.at[1]));
        it.at = [b.left, b.top];
        if (b.right < -W * 0.1 || b.left > W * 1.1 || b.bottom < -H * 0.1 || b.top > H * 1.1 || b.width < 2) { it.pause?.(); continue; }
        it.play?.();
        list.push([it, b]);
        if (r.mouse.x >= b.left && r.mouse.x <= b.right && r.mouse.y >= b.top && r.mouse.y <= b.bottom) hover = it;
      }
      // ‹Develop on stop› triggers 220ms after scrolling stops — if cells move more than .3px per frame it is treated as still flowing (not the mouse stopping)
      if (shift > 0.3) r.moved = now;
      const still = now - r.moved > 220;
      r.dwell += ((still ? 1 : 0) - r.dwell) * k(still ? 0.07 : 0.2);
      const target = hover ? Math.min(W, H) * 0.15 : 0;
      if (r.lens.x < -1e4) { r.lens.x = r.mouse.x; r.lens.y = r.mouse.y; }
      r.lens.x += (r.mouse.x - r.lens.x) * k(0.22); r.lens.y += (r.mouse.y - r.lens.y) * k(0.22);
      r.lens.r += (target - r.lens.r) * k(hover ? 0.12 : 0.18);
      gl.uniform1f(u.uLens, Math.max(0.001, r.lens.r * dpr));
      for (const [it, b] of list) {
        if (!it.ready()) continue;
        it.refresh?.(now);
        const vertical = !it.horizontal();
        const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        const a = vertical ? (cy - H / 2) / (H * 0.55) : (cx - W / 2) / (W * 0.62);
        let p = 1 - Math.min(1, Math.max(0, (Math.abs(a) - 0.12) / 0.88));
        p = Math.max(p * p * (3 - 2 * p), r.dwell);
        if (it.bleed) p = Math.max(p, Math.min(1, Math.max(0, ((Math.max(0, Math.min(b.right, W) - Math.max(b.left, 0)) * Math.max(0, Math.min(b.bottom, H) - Math.max(b.top, 0))) / (W * H) - 0.25) / 0.35)));
        p *= r.strength;
        // Scale is derived from the width of the on-screen rectangle (outer box of the rotated rectangle) — so it catches not only the shake layer but also the case where the plate wrapping a cell grows as a whole (blur plate).
        const pose = it.pose(), ow = it.el.offsetWidth, oh = it.el.offsetHeight;
        const sc = b.width / Math.max(1, ow * Math.abs(Math.cos(pose.r)) + oh * Math.abs(Math.sin(pose.r)));
        const w = ow * sc, h = oh * sc;
        gl.uniform4f(u.uRect, cx - it.el.offsetWidth / 2 - 0.75, cy - it.el.offsetHeight / 2 - 0.75, it.el.offsetWidth + 1.5, it.el.offsetHeight + 1.5);
        gl.uniform2f(u.uPivot, cx, cy); gl.uniform1f(u.uAngle, pose.r); gl.uniform1f(u.uScale, sc);
        gl.uniform2f(u.uBox, w * dpr, h * dpr);
        const c = Math.cos(-pose.r), s = Math.sin(-pose.r), mx = r.lens.x - cx, my = r.lens.y - cy;
        gl.uniform2f(u.uMouse, ((c * mx - s * my) + w / 2) * dpr, ((s * mx + c * my) + h / 2) * dpr);
        const tw = it.tw || 1, th = it.th || 1, ta = tw / th, ba = w / h;
        if (it.page) {
          const win = Math.min(1, (h / w) / (th / tw)), pos = vertical ? cy / H : cx / W;
          let q = Math.min(1, Math.max(0, (0.56 - pos) / 0.62)); q = q * q * (3 - 2 * q);
          gl.uniform2f(u.uWin, 1, win); gl.uniform2f(u.uShift, 0, q * (1 - win));
        } else {
          const sx = ta > ba ? ba / ta : 1, sy = ta > ba ? 1 : ta / ba;
          gl.uniform2f(u.uWin, sx, sy); gl.uniform2f(u.uShift, (1 - sx) / 2, (1 - sy) / 2);
        }
        gl.uniform1f(u.uP, p);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, it.tex); gl.uniform1i(u.uTex, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if (hover && r.mouse.x > -1e4) {
        const px = new Uint8Array(4);
        gl.readPixels(Math.round(r.mouse.x * dpr), Math.round(canvas.height - r.mouse.y * dpr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        const hex = "#" + [px[0], px[1], px[2]].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
        if (hex !== r.sampleHex) { r.sampleHex = hex; document.dispatchEvent(new CustomEvent("fx:develop-sample", { detail: { hex, el: hover.el } })); }
      } else if (r.sampleHex) { r.sampleHex = ""; document.dispatchEvent(new CustomEvent("fx:develop-sample", { detail: { hex: "", el: null } })); }
    };
    r.raf = requestAnimationFrame(r.frame);
    r.destroy = () => {
      cancelAnimationFrame(r.raf);
      removeEventListener("resize", r.resize); removeEventListener("pointermove", r.onMove);
      document.removeEventListener("fx:develop-strength", r.onStrength);
      canvas.remove(); R = null;
    };
    return r;
  };

  kfFx.register("print-develop-gl", (el, { options, reduce, scroller }) => {
    if (reduce) return;
    if (!R) R = make();
    if (!R) return;
    const { gl } = R;
    const media = el.querySelector('[data-fx-part="media"]') || el.querySelector("img, video");
    const kind = options.kind || "photo";
    const seed = hash(el.getAttribute("data-label") || kind);
    const animated = options.video === "1" || options.video === "true";
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    let ok = false, lastPaint = 0, playing = false;
    const upload = (src) => { gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); ok = true; };
    const ph = media ? null : document.createElement("canvas");
    const it = {
      el, tex, page: options.page === "1" || options.page === "true", bleed: options.bleed === "1" || options.bleed === "true",
      horizontal: () => (options.axis ? options.axis === "x" : !!scroller && scroller.scrollWidth > scroller.clientWidth + 1),
      ready: () => ok,
      // Reads the tilt of a swaying ancestor (a layer like deal-spring-in carrying an inline transform) and rotates the rectangle along with it
      pose: () => {
        const sw = el.closest('[data-fx-part="swing"]');
        if (!sw || !sw.style.transform) return { r: 0 };
        const m = new DOMMatrix(getComputedStyle(sw).transform);
        return { r: Math.atan2(m.b, m.a) };
      },
      play: () => { if (!playing) { playing = true; if (media instanceof HTMLVideoElement) media.play().catch(() => {}); } },
      pause: () => { if (playing) { playing = false; if (media instanceof HTMLVideoElement) media.pause(); } },
      refresh: (now) => {
        if (media instanceof HTMLVideoElement) { if (media.readyState >= 2) upload(media); return; }
        if (ph && animated && now - lastPaint > 90) { lastPaint = now; paint(ph, kind, seed, now / 1000); upload(ph); }
      },
    };
    if (media instanceof HTMLImageElement) {
      const go = () => { it.tw = media.naturalWidth; it.th = media.naturalHeight; upload(media); };
      media.complete && media.naturalWidth ? go() : media.addEventListener("load", go, { once: true });
    } else if (media instanceof HTMLVideoElement) {
      media.muted = true; media.loop = true; media.playsInline = true;
      media.addEventListener("loadeddata", () => { it.tw = media.videoWidth; it.th = media.videoHeight; }, { once: true });
    } else {
      const tall = it.page ? 2.4 : 1;
      const w = Math.max(64, Math.round(Math.min(1024, el.offsetWidth * Math.min(devicePixelRatio || 1, 2)))) || 512;
      const h = Math.max(64, Math.round((el.offsetHeight / Math.max(1, el.offsetWidth)) * w * tall)) || 288;
      ph.width = w; ph.height = h; it.tw = w; it.th = h;
      paint(ph, kind, seed, 0); upload(ph);
    }
    el.classList.add("is-gl");
    R.items.add(it);
    return () => {
      R?.items.delete(it);
      el.classList.remove("is-gl");
      gl.deleteTexture(tex);
      if (R && !R.items.size) R.destroy();
    };
  });
})();
