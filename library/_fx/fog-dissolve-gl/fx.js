(() => {
  // White fog over the panel — fbm cloud masses drift slowly to the right (.018 per second, twist .24), and during 72~88% of the attached section’s progress the threshold drops and covers, and
  // (always darker at the bottom), fully covers the screen at 92%, then clears at 94~100%. Half-screen resolution, 30 frames per second
  const VERT = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }";
  const FRAG = `precision mediump float;
varying vec2 vUv; uniform float uTime, uDis; uniform vec3 uInk;
float h(vec2 p){ p = fract(p * vec2(127.1, 311.7)); p += dot(p, p + 19.19); return fract(p.x * p.y); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f); return mix(mix(h(i), h(i + vec2(1., 0.)), u.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * n(p); p *= 2.; a *= .5; } return s; }
void main(){
  float dis = clamp(uDis, 0., 1.);
  if (dis >= .92) { gl_FragColor = vec4(uInk, 1. - smoothstep(.92, 1., dis)); return; }
  vec2 dir = normalize(vec2(1., .22)), w = vUv * 1.2 + dir * uTime * .008;
  vec2 warp = vec2(fbm(w * 4.), fbm(w * 4. + vec2(3.7, 1.9))) - .5;
  vec2 f = vUv * 2.1 + dir * uTime * .018 + warp * .24;
  float fogN = (fbm(f * 4.) * .6 + fbm((f * 2.3 + 11.) * 4.) * .4) * 1.1 - .02;
  float edge = mix(.72, 0., dis) - smoothstep(.55, 0., vUv.y) * .46;
  float cloud = clamp(smoothstep(edge, edge + .28, fogN) + smoothstep(.78, .92, dis), 0., 1.);
  gl_FragColor = vec4(uInk, cloud * (1. - smoothstep(.92, 1., dis)) * mix(.85, 1., smoothstep(.15, .7, dis)));
}`;
  kfFx.register("fog-dissolve-gl", (el, { options, reduce, scroller }) => {
    const canvas = document.createElement("canvas");
    canvas.className = "fx-fog-dissolve-gl__canvas";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    if (!gl) return;
    el.prepend(canvas);
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(pr);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (k) => gl.getUniformLocation(pr, k);
    const num = (k, d) => +(options[k] ?? d);
    const start = num("start", 0.72), cover = num("cover", 0.88), clear = num("clear", 0.94);
    const probe = document.createElement("i");
    const ink = () => { probe.hidden = true; el.append(probe); probe.style.color = "var(--fx-fog)"; const s = getComputedStyle(probe).color; probe.remove(); const c = document.createElement("canvas").getContext("2d"); c.fillStyle = s; c.fillRect(0, 0, 1, 1); const d = c.getImageData(0, 0, 1, 1).data; gl.uniform3f(U("uInk"), d[0] / 255, d[1] / 255, d[2] / 255); };
    ink();
    const size = () => { const r = Math.min(1, +(options.res ?? 0.5)); canvas.width = Math.max(1, Math.round(el.clientWidth * r)); canvas.height = Math.max(1, Math.round(el.clientHeight * r)); gl.viewport(0, 0, canvas.width, canvas.height); };
    size();
    const ro = new ResizeObserver(size); ro.observe(el);
    const track = el.closest('[data-fx-part="track"]') || el.parentElement || el;
    let dis = 0;
    const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const st = window.ScrollTrigger ? ScrollTrigger.create({ trigger: track, scroller, start: "top top", end: "bottom bottom", onUpdate: (s) => { const t = s.progress; dis = t < cover ? clamp((t - start) / (cover - start)) * 0.92 : 0.92 + clamp((t - clear) / (1 - clear)) * 0.08; } }) : null;
    const t0 = performance.now();
    let raf = 0, last = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return;
      last = now;
      gl.uniform1f(U("uTime"), reduce ? 0 : (now - t0) / 1000);
      gl.uniform1f(U("uDis"), dis);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); st?.kill(); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
