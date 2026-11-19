(() => {
  // Original shop winter edition — covers the content panel area with a beige paper sheet and tears it open top and bottom (post-processing overlay overlayColor).
  // Tear = Five-layer noise (texture .012/px, ±depth) + 3px grain (±grain), outer rim px inner edge ring, and 60px shade outside it.
  const VS = "attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }";
  const FS = `precision highp float; varying vec2 v; uniform vec2 uRes; uniform vec2 uBand; uniform vec3 uPaper, uRim, uDark;
    uniform float uDepth, uGrain, uRimW, uShade, uSeed, uTop, uBot;
    float h(float n){ return fract(sin(n) * 43758.5453); }
    float n1(float x){ float i = floor(x), f = fract(x); return mix(h(i), h(i + 1.), f * f * (3. - 2. * f)); }
    float fbm(float x){ float a = .5, s = 0.; for (int i = 0; i < 5; i++){ s += a * n1(x); x *= 2.13; a *= .5; } return s; }
    float h2(vec2 q){ return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
    void main(){
      vec2 px = vec2(v.x * uRes.x, (1. - v.y) * uRes.y);
      float e1 = uTop > .5 ? uBand.x + (fbm(px.x * .012 + uSeed * 7.) - .5) * uDepth * 2. + (h2(floor(px / 3.)) - .5) * uGrain * 2. : -1e5;
      float e2 = uBot > .5 ? uBand.y + (fbm(px.x * .011 + uSeed * 3. + 40.) - .5) * uDepth * 2. + (h2(floor(px / 3.) + 9.) - .5) * uGrain * 2. : 1e5;
      float cover = step(e1, px.y) * step(px.y, e2);
      float rim = (step(e1 - uRimW, px.y) * step(px.y, e1) + step(e2, px.y) * step(px.y, e2 + uRimW)) * (1. - cover);
      float shade = (smoothstep(e1 - 60., e1 - uRimW, px.y) * step(px.y, e1 - uRimW) + smoothstep(e2 + 60., e2 + uRimW, px.y) * step(e2 + uRimW, px.y)) * uShade;
      float fiber = h2(floor(px * vec2(.5, 2.))) * .06;
      vec3 col = mix(uDark, uPaper * (1. - fiber) + fiber * .5, cover);
      col = mix(col, uRim, rim);
      float a = max(cover, max(rim * .95, shade));
      gl_FragColor = vec4(col * a, a);
    }`;
  const cv = document.createElement("canvas"); cv.width = cv.height = 1;
  const cx = cv.getContext("2d", { willReadFrequently: true });
  // The canvas resolves skin variables to rgb (including color-mix·oklch). If a variable is empty it is transparent → 0
  const rgb = (el, name) => {
    const v = getComputedStyle(el).getPropertyValue(name).trim();
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = "transparent"; if (v) cx.fillStyle = v; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
  };
  kfFx.register("torn-paper-band", (el, { options }) => {
    const o = {
      depth: +(options.depth ?? 35), grain: +(options.grain ?? 2.5), rim: +(options.rim ?? 9), shade: +(options.shade ?? .35),
      full: (options.full || "on") !== "off", edges: options.edges || "both", seed: +(options.seed ?? 0),
    };
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "paper");
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (!gl) { el.classList.add("fx-torn-flat"); return () => el.classList.remove("fx-torn-flat"); }
    el.prepend(canvas);
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const pad = o.depth * 2 + o.rim + 60;
    const draw = () => {
      const r = el.getBoundingClientRect();
      const left = o.full ? -r.left : 0, width = o.full ? document.documentElement.clientWidth : r.width;
      const top = o.edges === "bottom" ? 0 : -pad, h = r.height + (o.edges === "bottom" ? 0 : pad) + (o.edges === "top" ? 0 : pad);
      Object.assign(canvas.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${h}px` });
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U("uRes"), width, h);
      gl.uniform2f(U("uBand"), -top + o.depth, -top + r.height - o.depth);
      gl.uniform3fv(U("uPaper"), rgb(el, "--kf-bg"));
      gl.uniform3fv(U("uRim"), rgb(el, "--kf-surface"));
      gl.uniform3fv(U("uDark"), rgb(el, "--kf-contrast-bg"));
      gl.uniform1f(U("uDepth"), o.depth); gl.uniform1f(U("uGrain"), o.grain); gl.uniform1f(U("uRimW"), o.rim); gl.uniform1f(U("uShade"), o.shade); gl.uniform1f(U("uSeed"), o.seed);
      gl.uniform1f(U("uTop"), o.edges !== "bottom" ? 1 : 0); gl.uniform1f(U("uBot"), o.edges !== "top" ? 1 : 0);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    draw();
    const ro = new ResizeObserver(draw); ro.observe(el);
    addEventListener("resize", draw);
    return () => { ro.disconnect(); removeEventListener("resize", draw); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
