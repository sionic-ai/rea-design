// A page arrived at reads the sessionStorage flag, starts from the covered veil (progress 1) and clears it — a first-opened page shows as is with no veil
(() => {
  const KEY = "fx-wipe";
  const FRAG = `precision highp float;
uniform vec2 uRes; uniform float uP; uniform vec3 uColor; uniform float uNoise; uniform float uRough; uniform float uEdge; uniform float uShade;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; uv.y = 1. - uv.y;
  float s = uRes.x / uRes.y; vec2 u = (uv - .5) * vec2(s, 1.);
  float m = clamp((u.x + s * .5 + u.y + .5) / (s + 1.), 0., 1.);
  vec2 d = u * uNoise - vec2(uP * .4 * .70710678);
  float f = (noise(d) * .5 + noise(d * 2.03 + vec2(17.3, 9.1)) * .25 + noise(d * 4.11 + vec2(31.7, 27.9)) * .125) / .875;
  float p = clamp(mix(m, f, uRough), 0., 1.) * (1. - uEdge);
  float h = clamp((uP - p) / uEdge, 0., 1.), g = clamp((uP - 1. - p) / uEdge, 0., 1.);
  float v = smoothstep(0., 1., h) * (1. - smoothstep(0., 1., g));
  float on = step(1e-4, uP);
  float x = smoothstep(.12, .7, v) * on, y = smoothstep(0., .45, v) * uShade * on;
  gl_FragColor = vec4(uColor * (1. + (1. - v) * .35) * x, x + (1. - x) * y);
}`;
  kfFx.register("noise-wipe-page", (root, { options, reduce }) => {
    const cycle = +(options.dur ?? 2.45);
    const ac = new AbortController(), on = { signal: ac.signal };
    const cv = document.createElement("canvas");
    cv.className = "fx-wipe";
    cv.setAttribute("aria-hidden", "true");
    root.append(cv);
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    const st = { p: 0 };
    let draw = () => {};
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
      gl.uniform1f(U("uNoise"), +(options.noise ?? 7.3));
      gl.uniform1f(U("uRough"), +(options.rough ?? 0.21));
      gl.uniform1f(U("uEdge"), Math.max(0.001, +(options.edge ?? 0.13)));
      gl.uniform1f(U("uShade"), +(options.shade ?? 0.09));
      // Film color comes from the skin variable — color-mix is also resolved and read as one canvas point
      const g2 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
      g2.fillStyle = getComputedStyle(cv).color;
      g2.fillRect(0, 0, 1, 1);
      const [r, g, b] = g2.getImageData(0, 0, 1, 1).data;
      gl.uniform3f(U("uColor"), r / 255, g / 255, b / 255);
      const uRes = U("uRes"), uP = U("uP");
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
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (st.p > 0 && st.p < 2) gl.drawArrays(gl.TRIANGLES, 0, 3);
        document.documentElement.classList.toggle("fx-wiping", st.p > 0 && st.p < 1.6);
        cv.classList.toggle("is-on", st.p > 0 && st.p < 1);
      };
    }
    const live = gl && !reduce && cycle > 0;
    if (sessionStorage.getItem(KEY)) {
      sessionStorage.removeItem(KEY);
      if (live) gsap.fromTo(st, { p: 1 }, { p: 2, duration: 0.55 * cycle, ease: "sine.inOut", onUpdate: draw, onComplete: () => ((st.p = 0), draw()) });
      draw();
    }
    addEventListener("pageshow", (e) => e.persisted && (gsap.killTweensOf(st), (st.p = 0), draw()), on);
    root.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || a.origin !== location.origin || a.href === location.href) return;
      e.preventDefault();
      sessionStorage.setItem(KEY, "1");
      if (!live) return void (location.href = a.href);
      gsap.killTweensOf(st);
      gsap.fromTo(st, { p: 0 }, { p: 1, duration: 0.45 * cycle, ease: "sine.out", onUpdate: draw, onComplete: () => (location.href = a.href) });
    }, on);
    return () => {
      ac.abort();
      gsap.killTweensOf(st);
      document.documentElement.classList.remove("fx-wiping");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      cv.remove();
    };
  });
})();
