// Fog where three light blobs drift over a flowing noise grain — a single-sheet shader, so the drawn amount is the same regardless of panel size. Color is obtained by painting skin variables on a 1px panel and passing them as rgb.
(() => {
  const FS = `precision highp float;
    uniform vec2 uRes; uniform float uTime, uSquash, uSpread; uniform vec3 uBase, uDeep, uLight;
    vec2 grad(vec2 p){ return fract(sin(vec2(dot(p, vec2(2127.1, 81.17)), dot(p, vec2(1269.5, 283.37)))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p), w = f * f * (3. - 2. * f);
      float a = dot(grad(i) * 2. - 1., f), b = dot(grad(i + vec2(1., 0.)) * 2. - 1., f - vec2(1., 0.));
      float c = dot(grad(i + vec2(0., 1.)) * 2. - 1., f - vec2(0., 1.)), d = dot(grad(i + vec2(1., 1.)) * 2. - 1., f - vec2(1., 1.));
      return .5 + .5 * mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
    }
    float speck(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
    float glow(vec2 p, vec2 c, vec2 r, float a){
      vec2 d = mat2(cos(a), -sin(a), sin(a), cos(a)) * (p - c) / r;
      d.x += sin(d.y * 2.2 + a * 1.7) * .14;
      d.y += sin(d.x * 1.8 - a * 1.3) * .1;
      return exp(-1.9 * dot(d, d));
    }
    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      float t = uTime * .308, wide = step(1.75, uSpread);
      float n = noise(uv * 1.65 + vec2(t * .08, -t * .06));
      vec2 q = uv + vec2(sin(uv.y * 4.4 + t * .72) * .025, cos(uv.x * 4. - t * .55) * .022) + (n - .5) * vec2(.1, .07);
      vec2 a = vec2(.28 + sin(t * .56) * .25 + sin(t * .19 + 1.4) * .08, .34 + cos(t * .43) * .22 + sin(t * .24) * .07);
      vec2 b = vec2(.69 + cos(t * .48 + .8) * .24 + sin(t * .17) * .07, .57 + sin(t * .39 + 1.1) * .23 + cos(t * .21) * .07);
      float k = mix(1., 1.4, wide);
      a = .5 + (a - .5) * k; b = .5 + (b - .5) * k;
      a.x -= .12 * wide; b.x += .12 * wide; b.y += mix(.24, .34, wide);
      float merge = smoothstep(.72, .96, .5 + .5 * cos(t * .62));
      float sx = sin(t * .34 + 2.2), cy = cos(t * .29 + .5);
      vec2 c = mix(mix(vec2(.48 + sx * .18, .43 + cy * .17), vec2(.5 + sx * .34, .5 + cy * .5), wide), b + vec2(-.12, -.07), merge);
      vec2 ra = vec2(.27 + sin(t * .21) * .018, (.4 + cos(t * .18) * .025) * uSquash) * uSpread;
      vec2 rb = vec2(.31 + cos(t * .17) * .022, (.4 + sin(t * .2) * .03) * uSquash) * uSpread;
      vec2 rc = vec2(.18 + sin(t * .24) * .018, (.27 + cos(t * .22) * .025) * uSquash) * uSpread;
      float L = glow(q, a, ra, -.38 + sin(t * .16) * .3) * .84 + glow(q, b, rb, .48 + cos(t * .15) * .32)
              + glow(q, c, rc, -.72 + sin(t * .2) * .42) * mix(.88, .64, merge);
      L = 1. - exp(-L);
      vec3 col = mix(uBase, uDeep, smoothstep(.055, .5, L) * .7);
      col = mix(col, uLight, smoothstep(.22, .78, L) * .74);
      col += (speck(floor(gl_FragCoord.xy / 1.35)) - .5) * .02 * smoothstep(.03, .35, L);
      gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
    }`;

  kfFx.register("haze-lights-bg", (el, { options, reduce }) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    const prog = gl && gl.createProgram();
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = gl && sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"), f = gl && sh(gl.FRAGMENT_SHADER, FS);
    if (!gl || !v || !f) { canvas.remove(); el.classList.add("is-fx-fallback"); return () => el.classList.remove("is-fx-fallback"); }
    gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(["uRes", "uTime", "uSquash", "uSpread", "uBase", "uDeep", "uLight"].map((n) => [n, gl.getUniformLocation(prog, n)]));
    // Shaders can’t read variables, so put the variable on the canvas text color and paint the color the browser resolved onto a 1px panel to read it back
    const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const rgb = (expr) => {
      canvas.style.color = expr;
      pix.clearRect(0, 0, 1, 1);
      pix.fillStyle = getComputedStyle(canvas).color;
      pix.fillRect(0, 0, 1, 1);
      const d = pix.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
    const paint = () => {
      gl.uniform3fv(U.uBase, rgb("var(--fx-haze-base, var(--kf-bg))"));
      gl.uniform3fv(U.uDeep, rgb("var(--fx-haze-deep, color-mix(in oklab, var(--fx-haze, var(--kf-accent)) 26%, var(--kf-bg)))"));
      gl.uniform3fv(U.uLight, rgb("var(--fx-haze, var(--kf-accent))"));
    };
    const phone = matchMedia("(max-width: 768px)");
    const fps = +options.fps || 30;
    let raf = 0, last = 0, onScreen = true;
    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(el.clientWidth * dpr)), h = Math.max(1, Math.round(el.clientHeight * dpr));
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.uRes, w, h);
      gl.uniform1f(U.uSquash, phone.matches ? +(options.squash ?? 0.68) : 1);
      gl.uniform1f(U.uSpread, phone.matches ? +(options["spread-phone"] ?? 2) : +(options.spread ?? 1.5));
      paint();
    };
    const frame = (now) => {
      gl.uniform1f(U.uTime, reduce ? +(options.still ?? 12) : now * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const loop = (now) => {
      raf = 0;
      if (!onScreen || document.hidden) return;
      if (now - last >= 1000 / fps) { frame(now); last = now; }
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (reduce) return frame(0); if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };
    const ro = new ResizeObserver(() => { fit(); frame(performance.now()); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) start(); });
    io.observe(el);
    const vis = () => !document.hidden && start();
    document.addEventListener("visibilitychange", vis);
    phone.addEventListener("change", fit);
    fit();
    start();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", vis); phone.removeEventListener("change", fit);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
