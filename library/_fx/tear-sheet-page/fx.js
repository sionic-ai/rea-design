// Torn-panel page transition: adds several layers of noise on the horizontal boundary before the threshold, so the boundary doesn’t slide smoothly but is torn off in pieces as it covers the screen.
// Covering and uncovering go the same way (up by default) — playing uncover as a rewind of cover looks like correcting a mistake, so uncover flips only the opaque side.
// An arriving page reads the sessionStorage flag, starts covered and then uncovers. With nav: off it doesn’t intercept links and only listens for fx:tear events (barba etc.).
(() => {
  const KEY = "fx-tear";
  const FRAG = `precision highp float;
uniform vec2 uRes; uniform float uP, uOut, uAmp, uReach, uScale, uSoft, uDir, uOct;
uniform vec3 uTop, uFoot;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5, n = 0.;
  for (int i = 0; i < 6; i++){ if (float(i) >= uOct) break; v += a * vnoise(p); n += a; p *= 2.03; a *= .5; }
  return v / max(n, 1e-3); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float y = uDir > .5 ? 1. - uv.y : uv.y;
  float amp = uAmp * uReach;
  float n = fbm(vec2(uv.x * uRes.x / uRes.y, y) * uScale);
  float s = y + (n - .5) * 2. * amp;
  float e = mix(-amp * .5 - uSoft - .01, 1. + amp * .5 + uSoft + .01, uP);
  float a = 1. - smoothstep(e - uSoft, e + uSoft, s);
  if (uOut > .5) a = 1. - a;
  vec3 c = mix(uFoot, uTop, uv.y);
  gl_FragColor = vec4(c * a, a);
}`;
  // Original curve 'mask': follows progress with a first-order filter of time constant tau — divided so the end becomes 1 for length D
  const maskEase = (D, tau) => { const k = Math.max(1e-3, D / tau); return (t) => (t >= 1 ? 1 : (1 - Math.exp(-k * t)) / (1 - Math.exp(-k))); };

  kfFx.register("tear-sheet-page", (root, { options, reduce }) => {
    const cover = +(options.cover ?? 0.52), clear = +(options.clear ?? 1.4), skip = +(options.skip ?? 0.36), tau = +(options.tau ?? 0.5);
    const nav = options.nav !== "off";
    const ac = new AbortController(), on = { signal: ac.signal };
    const cv = document.createElement("canvas");
    cv.className = "fx-tear";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    const st = { p: 0, out: 0 };
    let draw = () => {}, paint = () => {};
    if (gl) {
      const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const U = (n) => gl.getUniformLocation(prog, n);
      gl.uniform1f(U("uAmp"), +(options.amp ?? 0.175));
      gl.uniform1f(U("uReach"), +(options.reach ?? 2.7));
      gl.uniform1f(U("uScale"), +(options.scale ?? 3));
      gl.uniform1f(U("uOct"), Math.max(1, Math.min(6, +(options.detail ?? 5))));
      gl.uniform1f(U("uSoft"), Math.max(0.0005, +(options.soft ?? 0.001)));
      gl.uniform1f(U("uDir"), options.dir === "down" ? 1 : 0);
      // Panel color comes from the skin variables — re-read on every turn, so panels with colors briefly swapped in, like the loader, follow too
      const g2 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      const rgb = (css) => { g2.clearRect(0, 0, 1, 1); g2.fillStyle = css; g2.fillRect(0, 0, 1, 1); const d = g2.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };
      paint = () => {
        const cs = getComputedStyle(cv);
        gl.uniform3f(U("uTop"), ...rgb(cs.color));
        gl.uniform3f(U("uFoot"), ...rgb(cs.columnRuleColor));
      };
      paint();
      const uRes = U("uRes"), uP = U("uP"), uOut = U("uOut");
      const size = () => {
        const k = Math.min(devicePixelRatio, 1.5);
        cv.width = Math.round(innerWidth * k);
        cv.height = Math.round(innerHeight * k);
        gl.viewport(0, 0, cv.width, cv.height);
      };
      size();
      addEventListener("resize", () => (size(), draw()), on);
      draw = () => {
        gl.uniform2f(uRes, cv.width, cv.height);
        gl.uniform1f(uP, st.p);
        gl.uniform1f(uOut, st.out);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        const shown = st.out ? st.p < 1 : st.p > 0;
        if (shown) gl.drawArrays(gl.TRIANGLES, 0, 3);
        cv.classList.toggle("is-on", shown);
        document.documentElement.classList.toggle("fx-tearing", shown);
      };
    }
    const live = !!gl && !reduce;
    const run = (phase, done) => {
      gsap.killTweensOf(st);
      if (!live) { st.p = phase === "cover" ? 1 : 0; st.out = 0; draw(); done?.(); return; }
      paint();
      const d = phase === "cover" ? cover : clear * (1 - skip);
      st.out = phase === "cover" ? 0 : 1;
      gsap.fromTo(st, { p: phase === "cover" ? 0 : skip }, {
        p: 1, duration: d, ease: maskEase(phase === "cover" ? cover : clear, tau), onUpdate: draw,
        onComplete: () => { if (phase === "clear") { st.p = 0; st.out = 0; } draw(); done?.(); },
      });
    };
    root.addEventListener("fx:tear", (e) => run(e.detail?.phase === "clear" ? "clear" : "cover", e.detail?.done), on);
    if (sessionStorage.getItem(KEY)) {
      sessionStorage.removeItem(KEY);
      st.p = 1; st.out = 0; draw();
      requestAnimationFrame(() => run("clear"));
    }
    addEventListener("pageshow", (e) => e.persisted && (gsap.killTweensOf(st), (st.p = 0), (st.out = 0), draw()), on);
    if (nav) root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href === location.href) return;
      e.preventDefault();
      sessionStorage.setItem(KEY, "1");
      if (!live) return void (location.href = a.href);
      run("cover", () => (location.href = a.href));
    }, on);
    return () => {
      ac.abort();
      gsap.killTweensOf(st);
      document.documentElement.classList.remove("fx-tearing");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      cv.remove();
    };
  });
})();
