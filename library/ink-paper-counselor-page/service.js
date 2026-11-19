// Consultation — the center frame sticks to the screen, and as the next section’s top edge passes the frame the next picture rises from below and swaps in.
// Paper bends (flexes) with scroll direction and speed = direction × sin(progress·π)^.68, damping 13) light and shade fall on the edge. The image is a watercolor flower painted on canvas.
(() => {
  const EG = window.EG;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const head = EG.charReveal($(".eg-pagehead__title"));
  EG.onIntro(() => (reduce ? head.progress(1) : head.play()));

  // Free consultation: collapses on phone only
  const consult = $(".eg-consult");
  if (consult) {
    if (innerWidth > 767) consult.classList.add("is-open");
    consult.querySelector(".eg-consult__title").addEventListener("click", () => { if (innerWidth > 767) return; const on = consult.classList.toggle("is-open"); consult.querySelector(".eg-consult__title").setAttribute("aria-expanded", String(on)); setTimeout(() => ScrollTrigger.refresh(), 1000); });
  }

  // ── Four watercolor flowers (artwork slots) — dark bleed background, torn paper edges, one flower stem
  const ART = {
    navy: { wash: ["#0d1a4d", "#1b2a78"], petals: ["#f2d4c4", "#e9b9a3"], leaf: "#c8a07a" }, /* Not skin: illustration color */
    green: { wash: ["#0b2a1a", "#1d4a2c"], petals: ["#f3e6d0", "#e8a24a"], leaf: "#c9c08a" }, /* Not skin: illustration color */
    wine: { wash: ["#3a0610", "#7a1222"], petals: ["#b8c08a", "#d8d2a0"], leaf: "#e0d090" }, /* Not skin: illustration color */
    red: { wash: ["#7a1206", "#d2380e"], petals: ["#f4ece4", "#2a3c6a"], leaf: "#22305a" }, /* Not skin: illustration color */
  };
  const paper = getComputedStyle(document.documentElement).getPropertyValue("--kf-surface").trim();
  const paint = (kind, seed) => {
    const cv = document.createElement("canvas"); cv.width = 528; cv.height = 770;
    const c = cv.getContext("2d"), A = ART[kind], W = cv.width, H = cv.height;
    let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    c.fillStyle = paper; c.fillRect(0, 0, W, H);
    const inset = 0.06;
    c.save();
    c.beginPath();
    const x0 = W * inset, y0 = H * inset, x1 = W * (1 - inset), y1 = H * (1 - inset);
    const jag = (ax, ay, bx, by, n) => { for (let i = 0; i <= n; i++) { const k = i / n; c.lineTo(ax + (bx - ax) * k + (rnd() - 0.5) * 10, ay + (by - ay) * k + (rnd() - 0.5) * 10); } };
    c.moveTo(x0, y0); jag(x0, y0, x1, y0, 40); jag(x1, y0, x1, y1, 60); jag(x1, y1, x0, y1, 40); jag(x0, y1, x0, y0, 60);
    c.closePath(); c.clip();
    const g = c.createRadialGradient(W * 0.5, H * 0.45, W * 0.1, W * 0.5, H * 0.5, H * 0.7);
    g.addColorStop(0, A.wash[1]); g.addColorStop(1, A.wash[0]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.globalAlpha = 0.18;
    for (let i = 0; i < 60; i++) { c.fillStyle = rnd() > 0.5 ? A.wash[0] : A.wash[1]; c.beginPath(); c.arc(rnd() * W, rnd() * H, 20 + rnd() * 60, 0, 7); c.fill(); }
    c.globalAlpha = 1;
    c.strokeStyle = A.leaf; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(W * 0.5, H * 0.88); c.bezierCurveTo(W * 0.46, H * 0.65, W * 0.55, H * 0.45, W * 0.5, H * 0.25); c.stroke();
    for (let i = 0; i < 6; i++) {
      const y = H * (0.28 + i * 0.1), x = W * (0.5 + (i % 2 ? 0.08 : -0.07));
      c.fillStyle = A.petals[i % 2];
      for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x + Math.cos(k * 1.26) * 16, y + Math.sin(k * 1.26) * 16, 18 - i, 10, k * 1.26, 0, 7); c.fill(); }
    }
    c.restore();
    return cv;
  };

  const blocks = $$(".eg-pblock"), win = $(".eg-psy__window"), glCv = $(".eg-psy__gl");
  if (!glCv) return;
  const gl = glCv.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) return;
  const VERT = "attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}";
  const FRAG = `
precision highp float;
varying vec2 v;
uniform sampler2D ta, tb;
uniform float edge, bend, wave, feather;
void main() {
  float y = 1. - v.y;
  float d = y - wave;
  float env = exp(-.5 * (d / .24) * (d / .24));
  vec2 q = vec2(v.x - (v.x - .5) * bend * env * .01, y - bend * d * env * .2);
  q = clamp(q, .001, .999);
  float line = edge + sin(v.x * 3.14159) * bend * .012;
  float below = smoothstep(line - feather, line + feather, q.y);
  vec4 c = mix(texture2D(ta, q), texture2D(tb, q), below);
  float move = smoothstep(.04, .72, abs(bend));
  float under = step(0., (q.y - line) * sign(bend + 1e-4));
  c.rgb *= 1. - exp(-max((q.y - line) * sign(bend + 1e-4), 0.) / max(feather * 2.8, .004)) * under * move * .075;
  c.rgb += exp(-.5 * pow((q.y - line) / max(feather * .7, .002), 2.)) * move * .05;
  float slope = d / .25 * exp(-.5 * (d / .25) * (d / .25));
  c.rgb *= 1. + max(bend * slope, 0.) * .24 - max(-bend * slope, 0.) * .17;
  gl_FragColor = c;
}`;
  const sh = (t, src) => { const o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  gl.uniform1i(U("ta"), 0); gl.uniform1i(U("tb"), 1);
  const texs = blocks.map((b, i) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paint(b.dataset.art, 97 + i * 31));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  });
  const fit = () => { const k = Math.min(devicePixelRatio || 1, 2); glCv.width = Math.round(glCv.clientWidth * k); glCv.height = Math.round(glCv.clientHeight * k); gl.viewport(0, 0, glCv.width, glCv.height); gl.uniform1f(U("feather"), 17 / Math.max(glCv.clientHeight, 1)); };
  fit(); new ResizeObserver(fit).observe(glCv);
  const st = { bend: 0, edge: -1, wave: -0.3, key: "", dir: 1, lastY: scrollY };
  const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
  let last = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(1 / 30, Math.max(0.001, (now - last) / 1000)); last = now;
    const r = win.getBoundingClientRect();
    if (r.bottom < -50 || r.top > innerHeight + 50) return;
    const top = r.top, bot = r.bottom, span = bot - top, m = span * 0.16, mid = top + span / 2;
    let a = 0, b = 0, edge = -1, found = false;
    for (let i = 1; i < blocks.length; i++) {
      const k = blocks[i].getBoundingClientRect().top;
      if (k >= top - m && k <= bot + m) { a = i - 1; b = i; edge = 1 - (k - top) / span; found = true; break; }
    }
    if (!found) blocks.forEach((bl, i) => { if (bl.getBoundingClientRect().top <= mid) { a = i; b = i; } });
    const dy = scrollY - st.lastY; if (Math.abs(dy) > 0.1) st.dir = Math.sign(dy); st.lastY = scrollY;
    const push = found && edge > 0 && edge < 1 ? Math.pow(Math.sin(edge * Math.PI), 0.68) : 0;
    st.bend = damp(st.bend, reduce ? 0 : st.dir * push, 13, dt);
    const key = `${a}-${b}`;
    // Boundary is relative to the frame (top 0 to bottom 1) — when the next sheet’s top edge enters from the frame’s bottom, the next picture starts from the bottom
    const line = found ? 1 - Math.max(0, Math.min(1, edge)) : -1;
    if (found && st.key === key) { st.edge = damp(st.edge, line, 8.5, dt); st.wave = damp(st.wave, line, 8.5, dt); }
    else { st.edge = line; st.wave = line; st.key = found ? key : ""; }
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texs[a]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texs[b]);
    gl.uniform1f(U("edge"), st.edge); gl.uniform1f(U("wave"), st.wave); gl.uniform1f(U("bend"), st.bend);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const ab = Math.abs(st.bend);
    win.style.setProperty("--sh-y", `calc(${(3 + 5 * st.bend).toFixed(2)} * var(--site-u))`);
    win.style.setProperty("--sh-b", `calc(${(8 + 5 * ab).toFixed(2)} * var(--site-u))`);
    win.style.setProperty("--sh-a", `${((0.06 + 0.035 * ab) * 100).toFixed(1)}%`);
  });
})();
