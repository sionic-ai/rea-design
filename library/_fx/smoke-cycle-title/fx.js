// Rotates through multi-line headings — one line comes into focus from blur and holds, then its letters puff smoke and scatter upward in random order, and the next line forms
(() => {
  const VERT = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }";
  const FRAG = `precision highp float;
uniform float uT; uniform float uSeed; uniform vec2 uAt; uniform float uAlpha; uniform float uRad; uniform vec3 uDark; uniform vec3 uLight;
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(41.3, 289.1)), dot(p, vec2(173.7, 97.9))); return fract(sin(p) * 24634.6345) * 2. - 1.; }
float gn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(dot(h2(i), f), dot(h2(i + vec2(1., 0.)), f - vec2(1., 0.)), u.x), mix(dot(h2(i + vec2(0., 1.)), f - vec2(0., 1.)), dot(h2(i + vec2(1.)), f - vec2(1.)), u.x), u.y); }
float fb(vec2 p){ float s = 0., a = .5; mat2 r = mat2(1.7, 1.1, -1.1, 1.7); for (int i = 0; i < 5; i++) { s += a * gn(p); p = r * p; a *= .5; } return s; }
void main(){
  vec2 uv = (gl_FragCoord.xy - uAt) / uRad; float d = length(uv);
  if (d > 1. || uAlpha < .002) { gl_FragColor = vec4(0.); return; }
  vec2 q = uv * 1.5 + vec2(sin(uT * .5 + uSeed) * .2, -uT * .4) + vec2(uSeed, uSeed * .5);
  float n = fb(q), k = smoothstep(.1, 1., n + .5 - d * d * 1.2);
  if (k < .01) { gl_FragColor = vec4(0.); return; }
  float e = .05; vec3 nr = normalize(vec3(-(fb(q + vec2(e, 0.)) - n), -(fb(q + vec2(0., e)) - n), e * .5));
  float lit = max(dot(nr, normalize(vec3(-1., 1., .5))), 0.);
  float al = clamp(k * uAlpha * smoothstep(1., .3, d) * .8, 0., 1.);
  gl_FragColor = vec4(mix(uDark, uLight, lit * .7 + .2) * al, al);
}`;
  const rgb = (probe, prop) => {
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    c.fillStyle = getComputedStyle(probe)[prop]; c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  function smoke(z) {
    const cv = document.createElement("canvas");
    cv.className = "fx-smoke-canvas"; cv.setAttribute("aria-hidden", "true"); cv.style.zIndex = z;
    document.body.append(cv);
    const gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) { cv.remove(); return null; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    gl.uniform3f(U("uDark"), ...rgb(cv, "borderTopColor")); gl.uniform3f(U("uLight"), ...rgb(cv, "color"));
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const puffs = []; const t0 = performance.now();
    const size = () => { cv.width = Math.max(1, Math.round(innerWidth * 0.5)); cv.height = Math.max(1, Math.round(innerHeight * 0.5)); gl.viewport(0, 0, cv.width, cv.height); };
    size(); addEventListener("resize", size);
    let raf = 0, last = 0;
    const frame = (now) => {
      const dt = last ? Math.max(1, now - last) / 1000 : 0.016; last = now;
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U("uT"), (now - t0) / 1000);
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i], k = (now - p.born) / p.life;
        if (k >= 1) { puffs.splice(i, 1); continue; }
        const a = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
        p.x += 0.3 * Math.sin(p.seed) * dt * 60; p.y += (1 + 0.2 * Math.cos(p.seed)) * dt * 60;
        gl.uniform1f(U("uSeed"), p.seed); gl.uniform2f(U("uAt"), p.x * 0.5, p.y * 0.5);
        gl.uniform1f(U("uAlpha"), 0.7 * a); gl.uniform1f(U("uRad"), p.r * (1 + 1.5 * k) * 0.5);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      raf = puffs.length ? requestAnimationFrame(frame) : 0; if (!raf) { last = 0; gl.clear(gl.COLOR_BUFFER_BIT); }
    };
    return {
      puff(x, y) {
        if (puffs.length >= 36) puffs.shift();
        puffs.push({ x, y: innerHeight - y, born: performance.now(), life: 2000 + 800 * Math.random(), seed: 100 * Math.random(), r: 70 + 25 * Math.random() });
        if (!raf) raf = requestAnimationFrame(frame);
      },
      destroy() { cancelAnimationFrame(raf); removeEventListener("resize", size); gl.getExtension("WEBGL_lose_context")?.loseContext(); cv.remove(); },
    };
  }

  kfFx.register("smoke-cycle-title", (el, { options, reduce }) => {
    const lines = [...el.querySelectorAll('[data-fx-part="line"]')].map((n) => n.textContent.trim()).filter(Boolean);
    if (!lines.length || !window.gsap) return;
    const keep = el.innerHTML;
    const hold = +(options.hold ?? 2.5), gap = +(options.gap ?? 1.5), inDur = +(options.in ?? 1), outDur = +(options.out ?? 1.1);
    const each = +(options.each ?? 0.035), stagger = +(options.stagger ?? 0.03), count = Math.max(0, Math.round(+(options.puffs ?? 3)));
    const box = document.createElement("span"); box.className = "fx-smoke-line";
    el.innerHTML = ""; el.append(box); el.setAttribute("aria-label", lines.join(" / "));
    const write = (s) => {
      box.innerHTML = "";
      s.split(" ").forEach((w, i) => {
        if (i) box.append(" ");
        const word = document.createElement("span"); word.className = "fx-smoke-word"; word.setAttribute("aria-hidden", "true");
        [...w].forEach((ch) => { const c = document.createElement("span"); c.className = "fx-smoke-char"; c.textContent = ch; word.append(c); });
        box.append(word);
      });
      return [...box.querySelectorAll(".fx-smoke-char")];
    };
    if (reduce) { write(lines[0]); return () => { el.innerHTML = keep; el.removeAttribute("aria-label"); }; }
    const fog = smoke(options.z ?? 2);
    const timers = new Set(); let alive = true, idx = 0;
    const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); alive && fn(); }, ms); timers.add(t); };
    const show = () => {
      const chars = write(lines[idx]);
      gsap.fromTo(chars, { opacity: 0, filter: "blur(10px)", y: 16, scale: 0.85 }, { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, duration: inDur, stagger, ease: "power2.out" });
      later(vanish, hold * 1000);
    };
    const vanish = () => {
      const order = [...box.querySelectorAll(".fx-smoke-char")].map((c) => ({ c, r: Math.random() })).sort((a, b) => a.r - b.r).map((o) => o.c);
      order.forEach((c, i) => later(() => {
        const r = c.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (fog && y > -100 && y < innerHeight + 100 && x > -100 && x < innerWidth + 100) for (let k = 0; k < count; k++) fog.puff(x + (Math.random() - 0.5) * 24, y + (Math.random() - 0.5) * 24);
        gsap.to(c, { opacity: 0, filter: "blur(12px)", y: -30 - 16 * Math.random(), x: (Math.random() - 0.5) * 16, scale: 1.15 + 0.4 * Math.random(), duration: outDur, ease: "power2.in" });
        if (i === order.length - 1) later(() => { idx = (idx + 1) % lines.length; later(show, gap * 1000); }, 700);
      }, i * each * 1000));
    };
    show();
    return () => {
      alive = false; timers.forEach(clearTimeout); timers.clear();
      gsap.killTweensOf(box.querySelectorAll(".fx-smoke-char"));
      fog?.destroy(); el.innerHTML = keep; el.removeAttribute("aria-label");
    };
  });
})();
