(() => {
  // A sheet of wet glass over the panel — a 44×44 cell panel is pressed concave by three points trailing the cursor (following at .5 · .18 · .1, weights 1 · .5 · .24), and
  // Wobbles back with a spring (pull .055 · damping .9). While pressed it is pushed 1.45x deeper and the film becomes thin and clear (thickness .34→.18, roughness .07→.02).
  // The curtain refracts the picture, video or canvas inside the plate (or a skin color gradient if none) with a refractive index of 1.34, splitting red and blue (.04) so a rainbow forms at the edges
  const VERT = `attribute vec2 aP; attribute vec3 aN; varying vec3 vN; varying vec2 vUv;
void main(){ vUv = aP; vN = aN; gl_Position = vec4(aP * 2.0 - 1.0, 0.0, 1.0); }`;
  const FRAG = `precision highp float;
varying vec3 vN; varying vec2 vUv;
uniform sampler2D uTex; uniform vec2 uScale, uOffset, uRes; uniform float uTime, uThick, uRough, uChroma, uAniso, uIor; uniform vec3 uTint;
vec3 grab(vec2 uv, float r){
  vec2 s = uv * uScale + uOffset;
  vec3 c = texture2D(uTex, s).rgb * 0.2;
  for (int i = 0; i < 8; i++) { float a = float(i) * 0.7854 + 0.39; vec2 o = vec2(cos(a), sin(a)) * r / uRes * uScale;
    c += texture2D(uTex, s + o).rgb * 0.06 + texture2D(uTex, s + o * 0.45).rgb * 0.04; }
  return c;
}
void main(){
  vec3 n = normalize(vN);
  vec2 off = n.xy * (1.0 - 1.0 / uIor) * uThick * 0.55;
  off += vec2(sin(vUv.y * 31.0 + uTime * 0.45), cos(vUv.x * 27.0 - uTime * 0.38)) * 0.006 * uThick;
  float blur = (uRough + uAniso) * 60.0 * (uThick / 0.34) * (uRes.y / 900.0);
  vec3 col = vec3(grab(vUv + off * (1.0 + uChroma * 8.0), blur).r, grab(vUv + off, blur).g, grab(vUv + off * (1.0 - uChroma * 8.0), blur).b);
  gl_FragColor = vec4(col * mix(vec3(1.0), uTint, 0.35), 1.0);
}`;
  const H = 2.766; // The original curtain is 2.766 units of screen height — write radius and depth in that unit
  kfFx.register("glass-press-membrane", (el, { options, reduce, hover }) => {
    const num = (k, d) => +(options[k] ?? d);
    const SEG = Math.max(8, Math.round(+options.seg || 44));
    const radius = num("radius", 0.62), depth = num("depth", 0.5), pressGain = num("press", 1.45);
    const spring = num("spring", 0.055), damping = num("damping", 0.9);
    const trailK = [num("trail", 0.5), 0.18, 0.1], weight = [1, 0.5, 0.24];
    const thick = [num("thick", 0.34), num("thick-pressed", 0.18)], rough = [num("rough", 0.07), num("rough-pressed", 0.02)];
    const canvas = document.createElement("canvas");
    canvas.className = "fx-glass-press-membrane__canvas";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: true });
    if (!gl) return;
    el.prepend(canvas);
    const src = el.querySelector('[data-fx-part="source"]');
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(pr);
    const U = (n) => gl.getUniformLocation(pr, n);
    const N = SEG + 1, count = N * N;
    const grid = new Float32Array(count * 2), normals = new Float32Array(count * 3);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; grid[i * 2] = x / SEG; grid[i * 2 + 1] = y / SEG; normals[i * 3 + 2] = 1; }
    const idx = new Uint16Array(SEG * SEG * 6);
    for (let y = 0, k = 0; y < SEG; y++) for (let x = 0; x < SEG; x++) { const a = y * N + x, b = a + 1, c = a + N, d = c + 1; idx.set([a, b, c, b, d, c], k); k += 6; }
    const bind = (data, name, size, usage) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage); const l = gl.getAttribLocation(pr, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0); return b; };
    bind(grid, "aP", 2, gl.STATIC_DRAW);
    const nBuf = bind(normals, "aN", 3, gl.DYNAMIC_DRAW);
    const iBuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.uniform1f(U("uIor"), num("ior", 1.34));
    gl.uniform1f(U("uChroma"), num("chroma", 0.04));
    gl.uniform1f(U("uAniso"), num("blur", 0.1));
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const probe = document.createElement("i");
    const col = (v) => { probe.hidden = true; el.append(probe); probe.style.color = `var(${v})`; const c = getComputedStyle(probe).color; probe.remove(); return c; };
    const tint = () => { const c = document.createElement("canvas").getContext("2d"); c.fillStyle = col("--fx-tint"); c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; gl.uniform3f(U("uTint"), d[0] / 255, d[1] / 255, d[2] / 255); };
    const paint = document.createElement("canvas");
    let srcW = 1, srcH = 1, blocked = false;
    const upload = () => {
      let img = src;
      if (blocked || !img || (img.tagName === "IMG" && !img.complete) || (img.tagName === "VIDEO" && img.readyState < 2)) {
        // With no image, the skin color paints the sky and white flower clusters beyond the glass (above --fx-top · below --fx-bottom · center light --fx-glow)
        const w = 512, h = 512, c = paint.getContext("2d");
        paint.width = w; paint.height = h;
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, col("--fx-top")); g.addColorStop(1, col("--fx-bottom"));
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.fillStyle = col("--fx-glow");
        for (const [x, y, r] of [[0.48, 0.52, 0.3], [0.2, 0.3, 0.12], [0.8, 0.72, 0.16]]) { c.beginPath(); c.arc(x * w, y * h, r * w, 0, Math.PI * 2); c.fill(); }
        img = paint;
      }
      srcW = img.naturalWidth || img.videoWidth || img.width; srcH = img.naturalHeight || img.videoHeight || img.height;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); } catch (e) { blocked = true; upload(); }
    };
    tint(); upload();
    if (src?.tagName === "IMG" && !src.complete) src.addEventListener("load", () => { upload(); size(); }, { once: true });
    if (src?.tagName === "VIDEO") src.addEventListener("loadeddata", () => { upload(); size(); }, { once: true });

    let w = 1, h = 1, unit = 1;
    const size = () => {
      const dpr = Math.min(devicePixelRatio, +(options.dpr ?? 1.5));
      w = el.clientWidth; h = el.clientHeight; unit = H / Math.max(1, h);
      canvas.width = Math.max(1, Math.round(w * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U("uRes"), canvas.width, canvas.height);
      const a = w / Math.max(1, h), ia = srcW / Math.max(1, srcH);
      let sx = 1, sy = 1;
      if (a > ia) sy = ia / a; else sx = a / ia;
      gl.uniform2f(U("uScale"), sx, sy); gl.uniform2f(U("uOffset"), (1 - sx) / 2, (1 - sy) / 2);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(el);

    // Curtain height and speed, cursor position (curtain units, panel center 0), press
    const z = new Float32Array(count), v = new Float32Array(count);
    const trail = weight.map((wt) => ({ x: 0, y: 0, w: wt }));
    let tx = 0, ty = 0, poked = false, pressed = false, speed = 0, lastX = 0, lastY = 0, last = performance.now(), t0 = last;
    const move = (e) => { const r = el.getBoundingClientRect(); tx = (e.clientX - r.left - r.width / 2) * unit; ty = -(e.clientY - r.top - r.height / 2) * unit; poked = true; };
    const down = (e) => { move(e); pressed = true; };
    const up = () => { pressed = false; };
    if (hover && !reduce) { el.addEventListener("pointermove", move, { passive: true }); el.addEventListener("pointerdown", down, { passive: true }); addEventListener("pointerup", up, { passive: true }); el.addEventListener("pointerleave", up, { passive: true }); }

    let raf = 0, seen = false;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(draw); });
    io.observe(el);
    const r2 = radius * radius, far = 20 * r2;
    const draw = (now) => {
      raf = 0;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
      const t = (now - t0) / 1000;
      if (!reduce && hover) {
        trail[0].x += (tx - trail[0].x) * trailK[0]; trail[0].y += (ty - trail[0].y) * trailK[0];
        for (let i = 1; i < 3; i++) { trail[i].x += (trail[i - 1].x - trail[i].x) * trailK[i]; trail[i].y += (trail[i - 1].y - trail[i].y) * trailK[i]; }
        const sp = Math.hypot(trail[0].x - lastX, trail[0].y - lastY) / dt / H * 2; lastX = trail[0].x; lastY = trail[0].y;
        speed += (Math.min(1.6, 0.42 * sp) - speed) * (1 - Math.exp(-9 * dt));
        const d = poked ? depth * (pressed ? pressGain : 1) : 0;
        const idle = 0.004 * (1 - Math.min(1, 0.8 * speed));
        const half = (w * unit) / 2;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const i = y * N + x, px = (x / SEG - 0.5) * 2 * half, py = (y / SEG - 0.5) * H;
          let goal = idle * (Math.sin(0.7 * px + 0.42 * t) * Math.cos(0.55 * py - 0.31 * t) + 0.6 * Math.sin(0.31 * px - 0.44 * py + 0.23 * t));
          for (let k = 0; k < 3; k++) { const dx = px - trail[k].x, dy = py - trail[k].y, q = dx * dx + dy * dy; if (q > far) continue; goal -= d * trail[k].w * (Math.exp(-q / r2) - 0.34 * Math.exp(-q / (3.2 * r2))); }
          v[i] += (goal - z[i]) * spring; v[i] *= damping; z[i] += v[i];
        }
        const sx = (2 * half) / SEG, sy = H / SEG;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const i = y * N + x;
          const dzx = (z[y * N + Math.min(SEG, x + 1)] - z[y * N + Math.max(0, x - 1)]) / (sx * (x > 0 && x < SEG ? 2 : 1));
          const dzy = (z[Math.min(SEG, y + 1) * N + x] - z[Math.max(0, y - 1) * N + x]) / (sy * (y > 0 && y < SEG ? 2 : 1));
          const l = Math.hypot(dzx, dzy, 1);
          normals[i * 3] = -dzx / l; normals[i * 3 + 1] = -dzy / l; normals[i * 3 + 2] = 1 / l;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, normals);
      }
      const press = Math.min(1, 0.4 * speed + (pressed ? 0.5 : 0));
      gl.uniform1f(U("uThick"), thick[0] + (thick[1] - thick[0]) * press);
      gl.uniform1f(U("uRough"), rough[0] + (rough[1] - rough[0]) * press);
      gl.uniform1f(U("uTime"), reduce ? 0 : t);
      if (src?.tagName === "VIDEO" || src?.tagName === "CANVAS") upload();
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      if (seen && !reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const mo = new MutationObserver(() => { tint(); if (!src || blocked) upload(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect();
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerdown", down); el.removeEventListener("pointerleave", up); removeEventListener("pointerup", up);
      canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });
})();
