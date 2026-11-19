(() => {
  const VERT = "attribute vec2 corner; varying vec2 vUv; void main(){ vUv = corner * .5 + .5; gl_Position = vec4(corner, 0., 1.); }";
  // An image of a convex panel (center pushed forward by dome) rotated and lit in perspective — for each screen point, refine a few times to find the point on the panel reflected there
  const FRAG = `precision highp float;
uniform sampler2D uTex; uniform vec2 uSize; uniform vec2 uTurn; uniform float uDome, uEye, uTexAsp; varying vec2 vUv;
vec3 spin(vec3 p, vec2 a) {
  float cx = cos(a.x), sx = sin(a.x), cy = cos(a.y), sy = sin(a.y);
  p = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
  return vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
}
float bulge(vec2 n) { return uDome * (1. - dot(n, n)); }
void main() {
  float asp = uSize.x / uSize.y;
  vec2 want = (vUv * 2. - 1.) * vec2(asp, 1.);
  vec2 sheet = want;
  for (int k = 0; k < 7; k++) {
    vec2 n = sheet / vec2(asp, 1.);
    vec3 p = spin(vec3(sheet, bulge(n)), uTurn);
    sheet += want - p.xy * uEye / (uEye - p.z);
  }
  vec2 n = sheet / vec2(asp, 1.);
  vec3 normal = normalize(spin(normalize(vec3(2. * uDome * n.x / asp, 2. * uDome * n.y, 1.)), uTurn));
  vec3 light = normalize(vec3(-.35, .55, .75));
  float shade = .78 + .26 * max(dot(normal, light), 0.);
  float glaze = pow(max(dot(normal, normalize(light + vec3(0., 0., 1.))), 0.), 36.) * .2;
  vec2 fit = asp > uTexAsp ? vec2(1., uTexAsp / asp) : vec2(asp / uTexAsp, 1.);
  vec2 uv = n * .42 * fit + .5;
  gl_FragColor = vec4(texture2D(uTex, vec2(uv.x, 1. - uv.y)).rgb * shade + glaze, 1.);
}`;

  kfFx.register("dome-tilt-gl", (el, { options, reduce }) => {
    const tilt = +(options.tilt ?? 0.42), turn = +(options.turn ?? 0.5), dome = +(options.dome ?? 0.176), flip = +(options.flip ?? 0) ? -1 : 1;
    const cv = document.createElement("canvas");
    cv.className = "fx-dome-canvas";
    cv.setAttribute("aria-hidden", "true");
    const gl = cv.getContext("webgl", { antialias: true, premultipliedAlpha: false });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const at = gl.getAttribLocation(prog, "corner");
    gl.enableVertexAttribArray(at);
    gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
    el.appendChild(cv);
    el.classList.add("fx-dome-on");

    let ready = false, raf = 0, seen = false, last = -9;
    const img = el.querySelector("img[data-fx-part='img']");
    const upload = (src, asp) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.uniform1f(U("uTexAsp"), asp);
      ready = true; last = -9; draw();
    };
    // With no image, draw a placeholder in the skin color so the panel’s curvature shows
    function placeholder() {
      const r = el.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d"), cs = getComputedStyle(el), get = (n, f) => cs.getPropertyValue(n).trim() || f;
      g.fillStyle = get("--kf-surface", "currentColor"); g.fillRect(0, 0, w, h);
      g.strokeStyle = get("--kf-line", "currentColor"); g.lineWidth = dpr;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
      for (let y = h / 8; y < h; y += h / 8) { g.globalAlpha = .35; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.globalAlpha = 1;
      const label = el.getAttribute("data-label");
      if (label) {
        g.font = `${12 * dpr}px ${get("--kf-font-mono", "monospace")}`;
        const tw = g.measureText(label).width + 16 * dpr;
        g.fillStyle = get("--kf-surface", "currentColor"); g.fillRect((w - tw) / 2, h / 2 - 12 * dpr, tw, 24 * dpr);
        g.fillStyle = get("--kf-dim", "currentColor"); g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(label, w / 2, h / 2);
      }
      upload(c, w / h);
    }
    if (img) { const go = () => upload(img, img.naturalWidth / img.naturalHeight || 1); img.complete && img.naturalWidth ? go() : img.addEventListener("load", go, { once: true }); }
    else placeholder();

    function draw() {
      raf = 0;
      if (!ready) return;
      const r = el.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); last = -9; }
      // Goes from −1 to 1 as it moves one screen up or down from the screen center — straight at the center, tilting back as it enters from below
      const s = reduce ? 0 : Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
      if (Math.abs(s - last) < 1e-4) return;
      last = s;
      gl.uniform2f(U("uSize"), w, h);
      gl.uniform2f(U("uTurn"), tilt * -s, turn * s * flip);
      gl.uniform1f(U("uDome"), dome);
      gl.uniform1f(U("uEye"), 2.6);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    const kick = () => { if (seen && !raf) raf = requestAnimationFrame(draw); };
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; kick(); }, { rootMargin: "20% 0px" });
    io.observe(el);
    const ro = new ResizeObserver(() => { last = -9; if (!img) placeholder(); kick(); });
    ro.observe(el);
    addEventListener("scroll", kick, { passive: true });
    const tick = () => kick();
    if (window.gsap) gsap.ticker.add(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      removeEventListener("scroll", kick);
      if (window.gsap) gsap.ticker.remove(tick);
      el.classList.remove("fx-dome-on");
      cv.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  });
})();
