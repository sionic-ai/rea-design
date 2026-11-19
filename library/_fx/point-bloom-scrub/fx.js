(() => {
  // While the long section is pinned to the screen, dots light up layer by layer from the inside in step with scroll progress to form a cloud (each dot has its own share to light), and the cloud diameter grows .68 → .88,
  // Color warms from dull gray to an accent hue. After progress .78 the dots vanish starting from the right. Progress follows slowly with a per-second exponential (.0008^dt).
  // Exports progress as --fx-progress and the fx:progress event so other text in the section (section number, sentence swap) is bound to the same value.
  const VERT = `
attribute vec2 pos; attribute float reveal, size, phase;
uniform float prog, time, dpr, scale, aspect, offset, spin;
varying float vA, vHeat, vMask, vEarly;
void main() {
  float appear = smoothstep(reveal - .035, reveal + .075, prog);
  float fin = smoothstep(.78, 1., prog);
  vec2 p = pos * (.68 + smoothstep(.035, .665, prog) * .2) * .9 * scale;
  float br = sin(time * .92 + phase) * .011 + cos(time * .61 + phase * 1.7) * .007;
  vec2 rd = normalize(p + .001), tg = vec2(-rd.y, rd.x);
  p += rd * br * (.28 + prog) + tg * sin(time * .74 + phase * 2.3) * .0065;
  float c = cos(spin), s = sin(spin);
  p = mat2(c, s, -s, c) * p;
  vMask = 1. - fin * smoothstep(.08, .72, p.x);
  p.x += offset;
  gl_Position = vec4(p.x / aspect, p.y, 0., 1.);
  gl_PointSize = size * dpr * (.72 + appear * .46);
  vA = appear; vHeat = smoothstep(.08, .52, prog); vEarly = 1. - step(-.05, reveal);
}`;
  const FRAG = `
precision mediump float;
uniform vec3 cold, hot;
varying float vA, vHeat, vMask, vEarly;
void main() {
  float d = length(gl_PointCoord - .5);
  float core = 1. - smoothstep(.44, .5, d);
  float glow = (1. - smoothstep(.18, .5, d)) * .18 * (1. - vEarly);
  gl_FragColor = vec4(mix(cold, hot, vHeat), (core + glow) * vA * vMask);
}`;
  const rgbOf = (() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const g = cv.getContext("2d", { willReadFrequently: true });
    return (v) => { g.clearRect(0, 0, 1, 1); g.fillStyle = v; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };
  })();

  kfFx.register("point-bloom-scrub", (el, { options, reduce, scroller }) => {
    const canvas = el.querySelector("[data-fx-part=canvas]");
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false, alpha: true });
    if (!gl) return;
    const narrow = () => innerWidth < 700;
    const count = Math.max(30, +(narrow() ? options["count-phone"] || 900 : options.count || 1650));
    const offsetOpt = +(options.x ?? -0.31);
    let seed = +(options.seed ?? 87123) | 0;
    const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
    const data = new Float32Array(count * 5);
    for (let i = 0; i < count; i++) {
      const early = i < 26, f = i / count, a = rnd() * Math.PI * 2;
      const r = early ? 0.035 + Math.sqrt(rnd()) * 0.12 : 0.06 + Math.pow(rnd(), 0.58) * (0.34 + f * 0.5);
      const sq = 0.94 + rnd() * 0.12;
      data.set([Math.cos(a) * r, Math.sin(a) * r * sq, early ? -0.14 : 0.035 + Math.pow(f, 0.72) * 0.56 + (rnd() - 0.5) * 0.025, early ? 3 + rnd() : 2.5 + rnd() * 4.9, rnd() * Math.PI * 2], i * 5);
    }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    [["pos", 2, 0], ["reveal", 1, 2], ["size", 1, 3], ["phase", 1, 4]].forEach(([n, k, o]) => {
      const l = gl.getAttribLocation(prog, n);
      gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, k, gl.FLOAT, false, 20, o * 4);
    });
    const U = {};
    ["prog", "time", "dpr", "scale", "aspect", "offset", "spin", "cold", "hot"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    const colors = () => {
      const cs = getComputedStyle(el);
      gl.uniform3fv(U.cold, rgbOf(cs.getPropertyValue("--fx-point-cold").trim() || "gray"));
      gl.uniform3fv(U.hot, rgbOf(cs.getPropertyValue("--fx-point-hot").trim() || "white"));
    };
    colors();
    const dpr = Math.min(devicePixelRatio, 2);
    const size = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    const target = () => {
      const span = el.offsetHeight - (scroller ? scroller.clientHeight : innerHeight);
      const top = el.getBoundingClientRect().top - (scroller ? scroller.getBoundingClientRect().top : 0);
      return span > 0 ? Math.max(0, Math.min(1, -top / span)) : 0;
    };
    let shown = target(), last = performance.now(), raf = 0, alive = true, sent = -1;
    const frame = (now) => {
      const dt = Math.min(Math.max(0, now - last) / 1000, 0.05);
      last = now;
      const want = target();
      shown = reduce ? want : shown + (want - shown) * (1 - Math.pow(8e-4, dt));
      const r = canvas.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const wide = innerWidth > 1023;
        const aspect = canvas.width / Math.max(1, canvas.height);
        const fin = shown < 0.78 ? 0 : Math.min(1, (shown - 0.78) / 0.22), sm = fin * fin * (3 - 2 * fin);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(U.prog, shown);
        gl.uniform1f(U.time, reduce ? 0 : now / 1000);
        gl.uniform1f(U.dpr, dpr);
        gl.uniform1f(U.scale, wide ? 1 : 1 / 1.5);
        gl.uniform1f(U.aspect, aspect);
        gl.uniform1f(U.offset, (wide ? offsetOpt * aspect : 0) - aspect * sm * 0.05 + (reduce ? 0 : Math.sin(now * 1.3e-4) * 0.012));
        gl.uniform1f(U.spin, reduce ? 0 : Math.sin(now * 7.5e-5) * 0.035);
        gl.drawArrays(gl.POINTS, 0, count);
      }
      const rounded = Math.round(shown * 1e4) / 1e4;
      if (rounded !== sent) {
        sent = rounded;
        el.style.setProperty("--fx-progress", rounded.toFixed(4));
        el.dispatchEvent(new CustomEvent("fx:progress", { detail: { progress: rounded } }));
      }
      if (alive) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); el.style.removeProperty("--fx-progress"); };
  });
})();
