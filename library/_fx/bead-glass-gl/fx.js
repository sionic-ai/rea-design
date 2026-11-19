(() => {
  // The picture behind the panel (photo·canvas, or a skin-color gradient if none) as if beyond shower booth glass — two layers of round droplets formed per cell and
  // Raindrops fall in each vertical strip leaving tail droplets, refracting the image, with a top-left highlight sparkle on each drop and a blue rim at the edge.
  // The picture isn’t blurred (water drops over a clear photo). Pauses when off screen
  const VERT = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }";
  const FRAG = `precision highp float;
varying vec2 vUv; uniform sampler2D uTex; uniform float uTime, uAspect, uRefract; uniform vec2 uScale, uOffset; uniform vec4 uBig, uSmall, uRain;
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(41.3, 289.1)), dot(p, vec2(173.9, 61.7))); return fract(sin(p) * 24634.6345); }
float smaxk(float a, float b, float k){ float h = clamp(.5 + .5 * (b - a) / k, 0., 1.); return mix(a, b, h) + k * h * (1. - h); }
void add(inout float H, inout vec3 N, float h, vec3 n){ if (h <= 0.) return; N += n * exp(h / .006); H = smaxk(H, h, .008); }
float dome(vec2 p, vec2 c, float r, out vec3 n){ n = vec3(0., 0., 1.); if (r <= 0.) return 0.; vec2 d = (p - c) / r; float q = dot(d, d); if (q >= 1.) return 0.; float z = sqrt(1. - q); n = vec3(d, z); return z * r; }
float beads(vec2 p, vec4 k, vec2 seed, out vec3 n){
  vec2 sp = p * k.x + seed, ip = floor(sp), fp = fract(sp); float best = 9., br = 0.; vec2 bo = vec2(0.);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 o = vec2(float(x), float(y)), id = ip + o;
    float live = step(1. - k.y, h2(id + seed + 3.).x), r = mix(k.z, k.w, h2(id + seed + 7.).y) * live;
    if (r <= 0.) continue; vec2 to = o + h2(id + seed) - fp; float d = length(to) / r;
    if (d < best) { best = d; bo = to; br = r; }
  }
  n = vec3(0., 0., 1.); if (br <= 0.) return 0.;
  vec2 d = -bo / br; float q = dot(d, d); if (q >= 1.) return 0.;
  float z = sqrt(1. - q); n = vec3(d, z); return z * br / k.x;
}
void rain(vec2 p, inout float H, inout vec3 N){
  float lane = floor(p.x / uRain.x); vec2 ls = h2(vec2(lane, 4.));
  float t = uTime * mix(uRain.y, uRain.z, ls.x) + ls.y * 20., pass = floor(t), f = fract(t);
  vec2 ps = h2(vec2(lane, pass)); float live = step(uRain.w, h2(vec2(lane + 91.7, pass)).x);
  float r = mix(.008, .02, ps.x * ps.x) * live; if (r <= 0.) return;
  float cx = (lane + .5) * uRain.x + (ps.y - .5) * (uRain.x - 2. * r), hy = (1. + r) - f * f * (1. + 2. * r);
  vec3 n; add(H, N, dome(p, vec2(cx, hy), r, n), n);
  float gap = r * 2.6, slot = floor(p.y / gap + .5);
  for (int i = -1; i <= 1; i++) {
    float id = slot + float(i); vec2 bs = h2(vec2(lane * 7.31 + id, pass));
    float by = (id + (bs.x - .5) * .5) * gap, age = by - hy; if (age <= 0.) continue;
    float life = 1. - smoothstep(.12, .55, age);
    add(H, N, dome(p, vec2(cx + (bs.y - .5) * r * .6, by), r * mix(.18, .42, bs.y) * life, n), n);
  }
}
void main(){
  vec2 uv = vUv * uScale + uOffset; vec3 base = texture2D(uTex, uv).rgb; vec2 sq = vec2(vUv.x * uAspect, vUv.y);
  float H = 0.; vec3 N = vec3(0., 0., .35), n1, n2;
  add(H, N, beads(sq, uBig, vec2(0.), n1), n1); add(H, N, beads(sq, uSmall, vec2(31.7, 5.2), n2), n2); rain(sq, H, N);
  vec3 n = normalize(N); float m = smoothstep(0., .0012, H);
  vec3 refr = texture2D(uTex, uv - vec2(n.x / uAspect, n.y) * min(uRefract * H, .02) * uScale).rgb;
  float lam = max(dot(n, normalize(vec3(-.35, .55, .75))), 0.);
  vec3 water = refr * (.92 + .14 * n.z) + pow(lam, 40.) * .4 + pow(lam, 6.) * .05 + vec3(.5, .68, .82) * pow(1. - n.z, 4.) * .16;
  water += vec3(.16, .22, .27) * smoothstep(.004, .05, H) * .06; water -= smoothstep(.6, .95, length(n.xy)) * m * .025;
  gl_FragColor = vec4(mix(base, water, m), 1.);
}`;
  kfFx.register("bead-glass-gl", (el, { options, reduce }) => {
    const canvas = document.createElement("canvas");
    canvas.className = "fx-bead-glass-gl__canvas";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
    if (!gl) return;
    el.prepend(canvas);
    const src = el.querySelector('[data-fx-part="source"]');
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const num = (k, d) => +(options[k] ?? d);
    gl.uniform4f(U("uBig"), num("big", 30), num("big-amount", 0.22), 0.16, 0.32);
    gl.uniform4f(U("uSmall"), num("small", 70), num("small-amount", 0.55), 0.18, 0.36);
    gl.uniform4f(U("uRain"), num("lane", 0.075), num("speed-min", 0.1), num("speed-max", 0.22), num("rain-gap", 0.42));
    gl.uniform1f(U("uRefract"), num("refract", 0.8));
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // With no image, paints bathroom light seen through glass in the Skin color (top --fx-top · bottom --fx-bottom · center glow --fx-glow)
    const paint = document.createElement("canvas");
    let srcW = 1, srcH = 1;
    const upload = () => {
      let img = src;
      if (!img || (img.tagName === "IMG" && !img.complete) || (img.tagName === "VIDEO" && img.readyState < 2)) {
        // Variables contain var() and color-mix that the canvas can’t read, so paint them on an element and resolve to the computed color
        const probe = document.createElement("i");
        probe.hidden = true;
        el.append(probe);
        const col = (v) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };
        const top = col("--fx-top"), bottom = col("--fx-bottom"), glow = col("--fx-glow");
        probe.remove();
        const w = 512, h = 512, c = paint.getContext("2d");
        paint.width = w; paint.height = h;
        const g = c.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, top);
        g.addColorStop(1, bottom);
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        const r = c.createRadialGradient(w * 0.3, h * 0.25, 0, w * 0.3, h * 0.25, w * 0.6);
        r.addColorStop(0, glow); r.addColorStop(1, "transparent"); /* Not skin: transparent endpoint */
        c.fillStyle = r; c.fillRect(0, 0, w, h);
        img = paint;
      }
      srcW = img.naturalWidth || img.videoWidth || img.width; srcH = img.naturalHeight || img.videoHeight || img.height;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    };
    upload();
    if (src?.tagName === "IMG" && !src.complete) src.addEventListener("load", upload, { once: true });
    let w = 1, h = 1;
    const size = () => {
      const dpr = Math.min(devicePixelRatio, +(options.dpr ?? 1.5));
      w = el.clientWidth; h = el.clientHeight;
      canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const a = w / Math.max(1, h), ia = srcW / Math.max(1, srcH);
      let sx = 1, sy = 1;
      if (a > ia) sy = ia / a; else sx = a / ia;
      gl.uniform2f(U("uScale"), sx, sy); gl.uniform2f(U("uOffset"), (1 - sx) / 2, (1 - sy) / 2);
      gl.uniform1f(U("uAspect"), a);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);
    let raf = 0, seen = false, t0 = performance.now();
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(draw); });
    io.observe(el);
    const draw = (now) => {
      raf = 0;
      gl.uniform1f(U("uTime"), reduce ? 0 : (now - t0) / 1000);
      if (src?.tagName === "VIDEO" || src?.tagName === "CANVAS") upload();
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (seen && !reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const mo = new MutationObserver(() => { if (!src) upload(); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mo.disconnect(); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
