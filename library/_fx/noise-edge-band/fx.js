(() => {
  // Paint one section background panel and shake its top and bottom edges with 3D gradient noise — the amplitude is a ratio to the panel width, so the texture stays the same at any width
  const FRAG = `precision highp float;
    uniform vec2 uRes; uniform vec3 uColor; uniform float uTime, uFreq, uAmp, uFlow, uSpeed, uSeed, uType;
    vec3 h3(vec3 p) { p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6))); return -1.0 + 2.0 * fract(sin(p) * 43758.5453); }
    float gn(vec3 p) {
      vec3 i = floor(p), f = fract(p), u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
      float a = dot(h3(i), f), b = dot(h3(i + vec3(1, 0, 0)), f - vec3(1, 0, 0)), c = dot(h3(i + vec3(0, 1, 0)), f - vec3(0, 1, 0)), d = dot(h3(i + vec3(1, 1, 0)), f - vec3(1, 1, 0));
      float e = dot(h3(i + vec3(0, 0, 1)), f - vec3(0, 0, 1)), g = dot(h3(i + vec3(1, 0, 1)), f - vec3(1, 0, 1)), k = dot(h3(i + vec3(0, 1, 1)), f - vec3(0, 1, 1)), l = dot(h3(i + vec3(1, 1, 1)), f - vec3(1, 1, 1));
      return clamp(mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y), mix(mix(e, g, u.x), mix(k, l, u.x), u.y), u.z) * 1.6, -1.0, 1.0);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / uRes;
      float py = (uv.y - 0.5) * uRes.y, half_ = uRes.y * 0.5, a = uAmp * uRes.x, x = uv.x * uFreq + uTime * uFlow;
      float top = half_ - a + gn(vec3(x, uTime * uSpeed, uSeed)) * a;
      float bot = -half_ + a - gn(vec3(x, uTime * uSpeed, uSeed + 123.4)) * a;
      float mt = 1.0 - smoothstep(top - 0.5, top + 0.5, py), mb = smoothstep(bot - 0.5, bot + 0.5, py);
      float m = uType < 0.5 ? mt : (uType < 1.5 ? mb : mt * mb);
      gl_FragColor = vec4(uColor * m, m);
    }`;
  kfFx.register("noise-edge-band", (el, { options, reduce }) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    el.prepend(canvas);
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (!gl) { canvas.remove(); el.classList.add("is-fx-flat"); return () => el.classList.remove("is-fx-flat"); }
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
    el.append(probe);
    const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    px.canvas.width = px.canvas.height = 1;
    const rgb = () => { probe.style.color = "var(--fx-band, var(--kf-accent))"; px.clearRect(0, 0, 1, 1); px.fillStyle = getComputedStyle(probe).color; px.fillRect(0, 0, 1, 1); return [...px.getImageData(0, 0, 1, 1).data].slice(0, 3).map((n) => n / 255); };
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prg = gl.createProgram();
    gl.attachShader(prg, sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }"));
    gl.attachShader(prg, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prg);
    gl.useProgram(prg);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prg, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prg, n);
    const narrow = matchMedia("(max-width: 767px)");
    // Original values: PC frequency 3 · amplitude 1% of width · horizontal flow -.4/s · time .2 — phone 3.8 · 5% · -.8 · .6
    const tune = () => {
      const sp = narrow.matches;
      gl.uniform1f(u("uFreq"), +(options[sp ? "sp-freq" : "freq"] ?? (sp ? 3.8 : 3)));
      gl.uniform1f(u("uAmp"), +(options[sp ? "sp-amp" : "amp"] ?? (sp ? 0.05 : 0.01)));
      gl.uniform1f(u("uFlow"), +(options.flow ?? (sp ? -0.8 : -0.4)));
      gl.uniform1f(u("uSpeed"), +(options.speed ?? (sp ? 0.6 : 0.2)));
    };
    tune();
    gl.uniform1f(u("uSeed"), Math.random() * 999);
    gl.uniform1f(u("uType"), { top: 0, bottom: 1, both: 2 }[options.edge || "both"] ?? 2);
    const setColor = () => gl.uniform3fv(u("uColor"), rgb());
    setColor();
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const uRes = u("uRes"), uTime = u("uTime");
    const size = () => {
      const r = el.getBoundingClientRect(), d = Math.min(devicePixelRatio, 2);
      canvas.width = Math.max(1, Math.round(r.width * d));
      canvas.height = Math.max(1, Math.round(r.height * d));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      draw(reduce ? 0 : performance.now() / 1000);
    };
    const draw = (t) => {
      gl.uniform1f(uTime, t);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const ro = new ResizeObserver(size);
    ro.observe(el);
    let shown = false;
    const io = new IntersectionObserver(([e]) => { shown = e.isIntersecting; }, { rootMargin: "80px" });
    io.observe(el);
    const tick = () => { if (shown && !reduce) draw(performance.now() / 1000); };
    gsap.ticker.add(tick);
    narrow.addEventListener("change", tune);
    const mo = new MutationObserver(setColor);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] });
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect(); io.disconnect(); mo.disconnect();
      narrow.removeEventListener("change", tune);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove(); probe.remove();
    };
  });
})();
