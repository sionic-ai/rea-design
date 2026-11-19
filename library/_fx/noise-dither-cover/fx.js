// When leaving for another page, the screen gets covered in 3px cell dots — each cell turns on late by its flowing noise value, starting from cells that pass an 8×8 Bayer threshold, so
// Fills in as dots spread along a cloud pattern (.8s power3.in). On the arriving page it clears with the same pattern (1s power2.out).
// nav: when off, links aren’t intercepted, and the consuming side fires fx:cover / fx:uncover events (detail.done) on the element to move only the veil — to be used with a page-transition tool like Taxi.
// look: soft — from where a single-layer value noise (screen ×4, no dots) passes a soft threshold with boundary .38, a faint veil spreads and covers (1.5s cover · 1.8s lift, power1.out).
(() => {
  const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uCell, uProgress, uTime, uSoft, uScale, uEdge;
uniform vec3 uColor;
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float bayer8(vec2 c) {
  c = mod(floor(c), 8.0);
  float v = 0.0;
  for (int b = 0; b < 3; b++) {
    float k = pow(2.0, float(b));
    float xb = mod(floor(c.x / k), 2.0), yb = mod(floor(c.y / k), 2.0);
    v += (2.0 * mod(xb + yb, 2.0) + yb) * pow(4.0, 2.0 - float(b));
  }
  return (v + 0.5) / 64.0;
}
void main() {
  if (uSoft > 0.5) {
    // Progress 0→1 maps to threshold 1.3→−1 — at 0 it touches no noise and is empty, at 1 it is fully covered
    float mid = 1.0 - (1.3 - 2.3 * uProgress);
    float n = noise(gl_FragCoord.xy / uRes * uScale);
    gl_FragColor = vec4(uColor, 1.0 - smoothstep(mid - uEdge, mid + uEdge, n));
    return;
  }
  vec2 cell = floor(gl_FragCoord.xy / uCell);
  vec2 p = cell * uCell / uRes.y;
  float t = uTime * 0.15;
  float n = noise(p * 2.2 + vec2(t, -t * 0.6)) * 0.65 + noise(p * 5.0 - vec2(t * 0.4, t)) * 0.35;
  float a = clamp(uProgress * 1.6 - n * 0.6, 0.0, 1.0);
  if (uProgress < 1.0 && a <= bayer8(cell)) discard;
  gl_FragColor = vec4(uColor, 1.0);
}`;

  kfFx.register("noise-dither-cover", (el, { options, reduce }) => {
    const KEY = "kf-fx-noise-dither-cover";
    const soft = options.look === "soft";
    const coverDur = +(options.cover ?? (soft ? 1.5 : 0.8)), dur = +(options.dur ?? (soft ? 1.8 : 1)), cell = +options.cell || 3, nav = options.nav !== "off";
    const coverEase = options["cover-ease"] || (soft ? "power1.out" : "power3.in"), ease = options.ease || (soft ? "power1.out" : "power2.out");
    const scale = +options.scale || 4, edge = +(options.edge ?? 0.38);
    // Center text on the curtain (”Loading”) — when covering it turns on 1s after .3s, and when lifting it turns off in 1s
    const text = el.querySelector('[data-fx-part="text"]');
    const ac = new AbortController(), signal = ac.signal;
    const veil = document.createElement("div");
    veil.className = "fx-noise-cover";
    veil.setAttribute("aria-hidden", "true");
    veil.innerHTML = "<canvas></canvas>";
    document.body.append(veil);
    const cv = veil.firstChild;
    const gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
    const st = { progress: 0, time: 0 };
    let u = null, tl = null, dpr = 1, rgb = [0, 0, 0];

    if (soft) veil.classList.add("is-soft");
    // The curtain color is fx.css’s --fx-cover-fill — a skin color given with color-mix computes to a color(srgb …) type, so paint one dot and read it
    const px = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
    const color = () => {
      const i = document.createElement("i");
      i.style.cssText = "display:none;color:var(--fx-cover-fill)";
      veil.append(i);
      const c = getComputedStyle(i).color;
      i.remove();
      if (!px) return (c.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map((n) => +n / 255);
      px.clearRect(0, 0, 1, 1);
      px.fillStyle = c;
      px.fillRect(0, 0, 1, 1);
      return [...px.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((n) => n / 255);
    };
    if (gl) {
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(pr);
      if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
        gl.useProgram(pr);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(pr, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        u = Object.fromEntries(["uRes", "uCell", "uProgress", "uTime", "uColor", "uSoft", "uScale", "uEdge"].map((n) => [n, gl.getUniformLocation(pr, n)]));
      }
    }
    if (!u) veil.classList.add("is-flat");

    const render = () => {
      if (!u) { veil.style.opacity = st.progress; return; }
      gl.viewport(0, 0, cv.width, cv.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (st.progress <= 0) return;
      gl.uniform2f(u.uRes, cv.width, cv.height);
      gl.uniform1f(u.uCell, cell * dpr);
      gl.uniform1f(u.uProgress, st.progress);
      gl.uniform1f(u.uTime, st.time);
      gl.uniform3fv(u.uColor, rgb);
      gl.uniform1f(u.uSoft, soft ? 1 : 0);
      gl.uniform1f(u.uScale, scale);
      gl.uniform1f(u.uEdge, edge);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(innerWidth * dpr);
      cv.height = Math.round(innerHeight * dpr);
      render();
    };
    size();
    const tick = (time, dt) => { st.time += dt / 1000; render(); };
    const tween = (to, sec, ease) => new Promise((done) => {
      tl?.kill();
      rgb = color();
      veil.classList.toggle("is-on", to > 0 || st.progress > 0);
      if (reduce || !sec) { st.progress = to; render(); veil.classList.toggle("is-on", to > 0); return done(); }
      gsap.ticker.add(tick);
      tl = gsap.to(st, { progress: to, duration: sec, ease, onComplete: () => { gsap.ticker.remove(tick); render(); veil.classList.toggle("is-on", to > 0); done(); } });
    });
    const words = (on) => {
      if (!text) return;
      if (reduce) return void gsap.set(text, { opacity: on ? 1 : 0 });
      gsap.to(text, on ? { opacity: 1, duration: 1, delay: 0.3, overwrite: true } : { opacity: 0, duration: 1, overwrite: true });
    };
    const cover = () => { words(true); return tween(1, coverDur, coverEase); };
    const uncover = () => { words(false); return tween(0, dur, ease); };

    // If detail.instant, it stays fully covered — used when a new page arrived by normal navigation starts covered
    el.addEventListener("fx:cover", (e) => (e.detail?.instant ? tween(1, 0) : cover()).then(() => e.detail?.done?.()), { signal });
    el.addEventListener("fx:uncover", (e) => uncover().then(() => e.detail?.done?.()), { signal });

    if (nav) {
      if (sessionStorage.getItem(KEY) === "1") {
        sessionStorage.removeItem(KEY);
        st.progress = 1;
        rgb = color();
        veil.classList.add("is-on");
        render();
        requestAnimationFrame(() => uncover());
      }
      el.addEventListener("click", (e) => {
        const a = e.target.closest("a[href]");
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute("download")) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || url.href.split("#")[0] === location.href.split("#")[0]) return;
        e.preventDefault();
        if (reduce || !coverDur) { location.href = url.href; return; }
        cover().then(() => { sessionStorage.setItem(KEY, "1"); location.href = url.href; });
      }, { signal });
      addEventListener("pageshow", (e) => { if (e.persisted) { tl?.kill(); st.progress = 0; render(); veil.classList.remove("is-on"); } }, { signal });
    }
    addEventListener("resize", size, { signal });
    return () => { ac.abort(); tl?.kill(); gsap.ticker.remove(tick); veil.remove(); gl?.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
