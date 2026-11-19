(() => {
  /* Image ([data-fx-part =image] — img·canvas is redrawn as horizontal engraving lines, and each line (3px) is dragged sideways at random and resolves from an erased state (WebGL2).
     Brightness becomes line thickness (darker means thicker, spacing period px, the grain slightly wavy). With on: scroll it scrubs from 94% → 66% of the screen (scrub .4), with load it runs for dur seconds.
     Line color is ink (Skin variable name, default --kf-ink). The drawing must come from the same origin (always fine if drawn on canvas). */
  const VS = `#version 300 es
    in vec2 aPos; out vec2 vUv;
    void main(){ vUv = vec2(aPos.x, 1.0 - aPos.y); gl_Position = vec4(aPos * 2.0 - 1.0, 0.0, 1.0); }`;
  const FS = `#version 300 es
    precision highp float;
    in vec2 vUv; out vec4 o;
    uniform sampler2D uTex; uniform vec3 uInk; uniform float uScan; uniform float uPeriod; uniform float uDpr; uniform float uDust;
    float h1(float n){ return fract(sin(n * 91.345) * 47453.53); }
    float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
    void main(){
      vec2 uv = vUv;
      float py = gl_FragCoord.y / uDpr;
      float row = floor(py / 3.0);
      uv.x += (h1(row * 1.7) - 0.5) * uScan * uScan * 0.9;
      float n = noise(uv * vec2(70.0, 90.0)) * 0.65 + noise(uv * 12.0) * 0.35;
      uv -= vec2(0.35, -0.6) * uDust * (0.4 + n) * 0.45;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
      vec4 t = texture(uTex, uv);
      if (t.a < 0.02) discard;
      float lum = dot(t.rgb, vec3(0.3, 0.59, 0.11));
      float v = fract((py + sin(uv.x * 40.0 + uv.y * 6.0) * 0.9 + noise(uv * vec2(8.0, 30.0)) * 1.5) / uPeriod);
      float w = clamp(1.0 - lum, 0.0, 1.0) * 0.92;
      float e = fwidth(v) * 1.2;
      float line = 1.0 - smoothstep(w - e, w + e, abs(v - 0.5) * 2.0);
      float keep = step(uScan * 1.05, h1(row)) * step(uDust * 1.1, n * 0.85 + 0.15 * h2(floor(uv * 260.0)));
      float a = line * t.a * keep;
      if (a < 0.01) discard;
      o = vec4(uInk * a, a);
    }`;

  function inkOf(name) {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "currentColor";
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }

  kfFx.register("engrave-scan-gl", (el, { options, reduce }) => {
    const src = el.querySelector('[data-fx-part="image"]');
    if (!src) return;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "fx-engrave-canvas";
    el.appendChild(canvas);
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) { canvas.remove(); return; }
    el.classList.add("is-engraved");
    const sh = (type, s) => { const x = gl.createShader(type); gl.shaderSource(x, s); gl.compileShader(x); return x; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "aPos"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ["uTex", "uInk", "uScan", "uPeriod", "uDpr", "uDust"].forEach((k) => { U[k] = gl.getUniformLocation(pr, k); });
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const tex = gl.createTexture();
    let ready = false;
    const upload = () => {
      if (src.tagName === "IMG" && !(src.complete && src.naturalWidth)) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); ready = true; } catch (e) { ready = false; }
      draw();
    };
    const dpr = Math.min(2, devicePixelRatio || 1);
    const period = +(options.period ?? 3), dust = +(options.dust ?? 0), ink = inkOf(options.ink || "--kf-ink");
    const S = { scan: reduce ? 0 : 1 };
    function draw() {
      const r = el.getBoundingClientRect();
      const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      if (!ready || S.scan >= 0.999) return;
      gl.uniform3f(U.uInk, ink[0], ink[1], ink[2]); gl.uniform1f(U.uScan, S.scan); gl.uniform1f(U.uPeriod, period); gl.uniform1f(U.uDpr, dpr); gl.uniform1f(U.uDust, dust);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    if (src.tagName === "IMG") src.addEventListener("load", upload);
    upload();
    const ro = new ResizeObserver(draw); ro.observe(el);
    let tw = null;
    if (!reduce) {
      if (options.on === "load") tw = gsap.to(S, { scan: 0, duration: +(options.dur ?? 1.2), delay: +(options.delay ?? 0), ease: options.ease || "sine.out", onUpdate: draw });
      else tw = gsap.to(S, { scan: 0, ease: "none", onUpdate: draw, scrollTrigger: { trigger: el, start: options.start || "top 94%", end: options.end || "top 66%", scrub: +(options.scrub ?? 0.4) } });
    }
    draw();
    return () => {
      if (tw) { if (tw.scrollTrigger) tw.scrollTrigger.kill(); tw.kill(); }
      ro.disconnect(); if (src.tagName === "IMG") src.removeEventListener("load", upload);
      el.classList.remove("is-engraved"); canvas.remove();
      const lose = gl.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext();
    };
  });
})();
