(() => {
  const VERT = "attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }";
  const FRAG = [
    "precision mediump float;",
    "uniform float uShrink, uMelt, uCols, uRows, uAspect, uDelay, uCloud; uniform vec3 uPanel, uGround; varying vec2 vUv;",
    "float ch(vec2 p){ return fract(sin(dot(p, vec2(41.7, 289.3))) * 15731.743); }",
    "float cn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(ch(i), ch(i + vec2(1.0, 0.0)), f.x), mix(ch(i + vec2(0.0, 1.0)), ch(i + vec2(1.0, 1.0)), f.x), f.y); }",
    "float cloud(vec2 p){ float s = 0.0, a = 0.55; for (int k = 0; k < 5; k++) { s += a * cn(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }",
    "float rbox(vec2 p, vec2 b, float r){ vec2 d = abs(p) - b + r; return length(max(d, 0.0)) - r; }",
    "void main(){",
    "  vec2 cell = vUv * vec2(uCols, uRows);",
    "  float row = floor(cell.y) / max(uRows - 1.0, 1.0);",
    "  float k = clamp((uShrink - row * uDelay) / (1.0 - uDelay), 0.0, 1.0);",
    "  float ph = smoothstep(0.0, 1.0, k);",
    "  float sc = 1.0 - ph;",
    "  if (rbox(fract(cell) - 0.5, vec2(0.5 * sc), 0.6 * ph * sc) <= 0.0) { gl_FragColor = vec4(mix(uPanel, uGround, ph), 1.0); return; }",
    "  float mono = smoothstep(0.15, 0.95, cloud(vec2(vUv.x * uAspect, vUv.y) * uCloud));",
    "  gl_FragColor = vec4(uGround, 1.0 - clamp(mono + uMelt * 2.0 - 1.0, 0.0, 1.0));",
    "}",
  ].join("\n");

  // Skin variables can come as oklch or color-mix, so paint once and take the result as rgb
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (el, name, fallback) => {
    const cs = getComputedStyle(el);
    const v = cs.getPropertyValue(name).trim() || cs.getPropertyValue(fallback).trim();
    probe.clearRect(0, 0, 1, 1);
    if (!v) return [1, 1, 1];
    probe.fillStyle = v;
    probe.fillRect(0, 0, 1, 1);
    const d = probe.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("tile-melt-stage", (el, { options, reduce, scroller }) => {
    if (reduce) { el.classList.add("is-fx-melted"); return () => el.classList.remove("is-fx-melted"); }
    const wrap = document.createElement("div");
    wrap.setAttribute("data-fx-part", "melt-canvas");
    wrap.setAttribute("aria-hidden", "true");
    const cv = document.createElement("canvas");
    wrap.append(cv);
    el.append(wrap);
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) { wrap.remove(); el.classList.add("is-fx-melted"); return () => el.classList.remove("is-fx-melted"); }

    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["uShrink", "uMelt", "uCols", "uRows", "uAspect", "uDelay", "uCloud", "uPanel", "uGround"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

    const state = { shrink: 0, melt: 0 };
    const cols = () => (innerWidth < 1024 ? +(options["cols-sp"] || 10) : +(options.cols || 15) * (innerWidth >= 1920 ? 1.6 : 1));
    const delay = Math.min(0.95, +(options.delay ?? 0.5));
    const draw = () => {
      const w = cv.width, h = cv.height;
      if (!w || !h) return;
      const c = cols();
      gl.viewport(0, 0, w, h);
      gl.uniform1f(U.uShrink, state.shrink);
      gl.uniform1f(U.uMelt, state.melt);
      gl.uniform1f(U.uCols, c);
      gl.uniform1f(U.uRows, Math.ceil(h / (w / c)));
      gl.uniform1f(U.uAspect, w / h);
      gl.uniform1f(U.uDelay, delay);
      gl.uniform1f(U.uCloud, +(options.cloud || 2.2));
      gl.uniform3fv(U.uPanel, rgb(el, "--fx-panel", "--kf-surface"));
      gl.uniform3fv(U.uGround, rgb(el, "--fx-ground", "--kf-bg"));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const fit = () => {
      const r = Math.min(1.5, devicePixelRatio || 1);
      cv.width = Math.round(wrap.clientWidth * r);
      cv.height = Math.round(wrap.clientHeight * r);
      draw();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const shrinkEl = el.querySelector('[data-fx-part="shrink"]');
      const meltEl = el.querySelector('[data-fx-part="melt"]');
      const one = (key, trigger, start, end) => ScrollTrigger.create({
        trigger, scroller: scroller || window, start, end, scrub: true,
        onUpdate: (st) => { state[key] = st.progress; draw(); },
        onRefresh: (st) => { state[key] = st.progress; draw(); },
      });
      const a = one("shrink", shrinkEl || el, options["shrink-start"] || (shrinkEl ? "top 50%" : "top top"), options["shrink-end"] || (shrinkEl ? "bottom 50%" : "+=100%"));
      const b = one("melt", meltEl || el, options["melt-start"] || (meltEl ? "top center" : "top -100%"), options["melt-end"] || (meltEl ? "bottom center" : "+=100%"));
      return () => { a.kill(); b.kill(); };
    });
    return () => {
      mm.revert();
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      wrap.remove();
    };
  });
})();
