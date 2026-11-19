(() => {
  // A hole opens in the background-color curtain like spreading ink — swirl (domain-warp) noise scatters the edge, and only the edge band gets an ink tone (lighter inside, gray outside).
  // The radius grows along the curve from -margin → to screen edge + margin, and once fully open the canvas is removed.
  const VERT = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
  const FRAG = `
precision highp float;
varying vec2 uv;
uniform vec2 res, origin;
uniform float t, radius, scale, turb, soft, mixAmt;
uniform vec3 base, inkIn, inkOut;
float rnd(vec2 c) { return fract(sin(dot(c, vec2(269.5, 183.3))) * 24634.6345); }
float smoothNoise(vec2 x) {
  vec2 c = floor(x), f = fract(x), w = f * f * (3. - 2. * f);
  return mix(mix(rnd(c), rnd(c + vec2(1, 0)), w.x), mix(rnd(c + vec2(0, 1)), rnd(c + 1.), w.x), w.y);
}
float octaves(vec2 x) {
  float s = 0., a = .5;
  for (int k = 0; k < 4; k++) { s += a * smoothNoise(x); x = x * 2.01 + vec2(5.1, 1.7); a *= .5; }
  return s;
}
void main() {
  vec2 asp = vec2(res.x / res.y, 1.);
  float d = length((uv - origin) * asp);
  vec2 q = uv * asp * scale;
  vec2 warp = vec2(octaves(q + vec2(0., t)), octaves(q + vec2(3.3, 8.2) - vec2(t * .7, 0.)));
  float n = octaves(q + 2.2 * warp);
  float e = (d - radius) + (n - .5) * turb;
  float inside = 1. - smoothstep(-soft, soft, e);
  float band = clamp(4. * inside * (1. - inside), 0., 1.);
  vec3 ink = mix(inkOut, inkIn, pow(inside, .45));
  float cover = 1. - inside;
  gl_FragColor = vec4(base * cover + ink * band * mixAmt * (.5 + .8 * n), cover);
}`;
  const rgb = (el, v) => {
    const probe = document.createElement("i");
    probe.style.color = v; el.append(probe);
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = getComputedStyle(probe).color; probe.remove();
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("ink-bloom-reveal", (el, { options, reduce }) => {
    const done = () => el.dispatchEvent(new CustomEvent("fx:revealed", { bubbles: true }));
    if (reduce) { done(); return; }
    const cs = getComputedStyle(el);
    const cv = document.createElement("canvas");
    cv.setAttribute("data-fx-part", "canvas");
    cv.setAttribute("aria-hidden", "true");
    // Hidden during the delay — it does not cover the loader in front, and picks up with the same background color on the frame the loader clears
    if (+(options.delay ?? 0) > 0) cv.style.visibility = "hidden";
    el.append(cv);
    const gl = cv.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
    const off = () => { cancelAnimationFrame(raf); cv.remove(); };
    let raf = 0;
    if (!gl) { off(); done(); return; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { off(); done(); return; }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const ox = +(options.x ?? 0.5), oy = +(options.y ?? 0.5);
    const turb = +(options.turb ?? 0.78), soft = +(options.soft ?? 0.18);
    gl.uniform2f(U("origin"), ox, oy);
    gl.uniform1f(U("scale"), +(options.scale ?? 4));
    gl.uniform1f(U("turb"), turb);
    gl.uniform1f(U("soft"), soft);
    gl.uniform1f(U("mixAmt"), +(options.ink ?? 0.3));
    gl.uniform3fv(U("base"), rgb(el, cs.getPropertyValue("--fx-cover").trim() || "var(--kf-bg)"));
    gl.uniform3fv(U("inkIn"), rgb(el, cs.getPropertyValue("--fx-ink-in").trim() || "var(--kf-ink)"));
    gl.uniform3fv(U("inkOut"), rgb(el, cs.getPropertyValue("--fx-ink-out").trim() || "var(--kf-dim)"));
    const uR = U("radius"), uT = U("t"), uRes = U("res");
    const fit = () => {
      const k = Math.min(devicePixelRatio || 1, 1.5);
      cv.width = Math.max(1, Math.round(innerWidth * k)); cv.height = Math.max(1, Math.round(innerHeight * k));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uRes, cv.width, cv.height);
    };
    fit();
    addEventListener("resize", fit);
    // Radius end is the farthest of the four screen corners plus a margin — so noise and blur fully clear
    const far = () => { const a = innerWidth / innerHeight; let m = 0; for (const [cx, cy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) m = Math.max(m, Math.hypot((cx - ox) * a, cy - oy)); return m; };
    const pad = turb * 0.5 + soft + 0.15;
    const dur = +(options.dur ?? 3.5625), speed = +(options.noise ?? 1.2);
    const ease = kfFx.ease(options.ease || "0.65,0,0.35,1", "power2.inOut");
    const state = { p: 0 };
    let t = 0, last = performance.now();
    const draw = () => { gl.uniform1f(uR, -pad + state.p * (far() + 2 * pad)); gl.uniform1f(uT, t); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const loop = (now) => { t += Math.min(0.1, Math.max(0, now - last) / 1000) * speed; last = now; draw(); raf = requestAnimationFrame(loop); };
    draw();
    const tw = gsap.to(state, { p: 1, duration: dur, delay: +(options.delay ?? 0), ease, onStart: () => { cv.style.visibility = ""; }, onComplete: () => { off(); done(); } });
    raf = requestAnimationFrame(loop);
    return () => { tw.kill(); off(); removeEventListener("resize", fit); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
