(() => {
  // Draw aurora curtains on a fixed canvas behind the screen — two layers of noise shake the curtain bottom height, brighter toward the top,
  // Colors are picked from a horizontally flowing color strip (the skin’s four accent colors). Drawn at half screen resolution like the original, with a 40% background-color veil on top.
  const VERT = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FRAG = `
precision mediump float;
varying vec2 uv;
uniform sampler2D ramp;
uniform float t, aspect, amp, mid, blend, flow;
vec2 g2(vec2 c) { float a = 6.2831853 * fract(sin(dot(c, vec2(41.37, 289.11))) * 15731.743); return vec2(cos(a), sin(a)); }
float gnoise(vec2 x) {
  vec2 c = floor(x), f = x - c, s = f * f * f * (f * (f * 6. - 15.) + 10.);
  float n00 = dot(g2(c), f), n10 = dot(g2(c + vec2(1., 0.)), f - vec2(1., 0.));
  float n01 = dot(g2(c + vec2(0., 1.)), f - vec2(0., 1.)), n11 = dot(g2(c + 1.), f - 1.);
  return .5 + .7 * mix(mix(n00, n10, s.x), mix(n01, n11, s.x), s.y);
}
float layers(vec2 x) {
  float sum = 0., w = .5;
  for (int k = 0; k < 4; k++) { sum += w * gnoise(x); x = mat2(1.6, 1.2, -1.2, 1.6) * x + 3.7; w *= .5; }
  return sum;
}
void main() {
  float x = uv.x * aspect;
  float h = layers(vec2(x * 1.6 + t * .06, t * .14)) + .5 * layers(vec2(x * 3.1 + t * .11, 11.3 - t * .05));
  float edge = exp((h / 1.5 - .5) * amp);
  float glow = .6 * (uv.y * 2. - edge + .2);
  float a = smoothstep(mid - blend * .5, mid + blend * .5, glow);
  vec3 c = glow * texture2D(ramp, vec2((uv.x + t * flow) * .5, .5)).rgb * a;
  c += (fract(sin(dot(gl_FragCoord.xy + fract(t), vec2(12.9898, 78.233))) * 43758.5453) - .5) / 255.;
  gl_FragColor = vec4(c, a);
}`;
  // Bakes a color band from skin variables — the first color is placed again at the end so the band loops endlessly
  const bakeRamp = (el, stops) => {
    const cv = document.createElement("canvas");
    cv.width = 512; cv.height = 1;
    const g = cv.getContext("2d");
    const probe = document.createElement("i");
    el.append(probe);
    const col = (v) => { probe.style.color = v; return getComputedStyle(probe).color; };
    const grad = g.createLinearGradient(0, 0, 512, 0);
    stops.forEach(([c, at]) => grad.addColorStop(at * 0.5, col(c)));
    grad.addColorStop(1, col(stops[0][0]));
    probe.remove();
    g.fillStyle = grad; g.fillRect(0, 0, 512, 1);
    return cv;
  };

  kfFx.register("aurora-veil", (el, { options, reduce }) => {
    const cs = getComputedStyle(el);
    const v = (n, d) => cs.getPropertyValue(n).trim() || d;
    const stops = [[v("--fx-aurora-1", "var(--kf-accent-soft)"), 0], [v("--fx-aurora-2", "var(--kf-accent-soft)"), 0.336], [v("--fx-aurora-3", "var(--kf-accent)"), 0.5], [v("--fx-aurora-4", "var(--kf-accent)"), 1]];
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.setAttribute("aria-hidden", "true");
    const scrim = document.createElement("div");
    scrim.setAttribute("data-fx-part", "scrim");
    el.prepend(canvas, scrim);
    const gl = canvas.getContext("webgl", { antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) { canvas.remove(); scrim.remove(); return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); scrim.remove(); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    gl.uniform1f(U("amp"), +(options.amp ?? 1));
    gl.uniform1f(U("mid"), +(options.mid ?? 0.2));
    gl.uniform1f(U("blend"), +(options.blend ?? 0.5));
    gl.uniform1f(U("flow"), +(options.flow ?? 0.04));
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bakeRamp(el, stops));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const uT = U("t"), uA = U("aspect");
    const res = +(options.res ?? 0.5);
    const fit = () => {
      const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
      const k = Math.min(devicePixelRatio || 1, 1) * res;
      const W = Math.max(1, Math.round(w * k)), H = Math.max(1, Math.round(h * k));
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H); }
      gl.uniform1f(uA, w / h);
    };
    let time = 0, last = 0, raf = 0;
    const draw = () => { gl.uniform1f(uT, time); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    const tick = (now) => { time += Math.max(0, now - last) / 1000; last = now; draw(); raf = requestAnimationFrame(tick); };
    const run = () => {
      cancelAnimationFrame(raf); raf = 0;
      if (reduce || document.hidden) { draw(); return; }
      last = performance.now(); raf = requestAnimationFrame(tick);
    };
    const ro = new ResizeObserver(() => { fit(); if (!raf) draw(); });
    ro.observe(canvas);
    document.addEventListener("visibilitychange", run);
    fit(); run();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); document.removeEventListener("visibilitychange", run); canvas.remove(); scrim.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
