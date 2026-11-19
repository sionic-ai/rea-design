(() => {
  const VERT = "attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }";
  // Warp value-noise fbm twice (domain warp) to get three value maps, then cover five color layers at each threshold.
  // Stretch one axis so it flows as stripes, and push the threshold so it opens from a solid color (open) or gathers into a solid color (calm).
  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uPointer; uniform float uOpen; uniform float uCalm; uniform float uSeed;
uniform vec3 uC0; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4; uniform vec3 uLine; uniform vec3 uTop;
uniform float uSpeed; uniform float uScale; uniform float uWarp; uniform float uStreak; uniform float uContrast; uniform float uPush;
uniform float uGrain; uniform float uSoft; uniform float uCover; uniform float uTopRange; uniform vec2 uAxis; uniform int uOct;

float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), w = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), w.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), w.x), w.y);
}
float field(vec2 p) {
  float v = 0.0, amp = 0.5, tot = 0.0;
  for (int i = 0; i < 4; i++) {
    if (i >= uOct) break;
    v += amp * vnoise(p); tot += amp;
    p = p * 2.03 + vec2(17.0, 9.0); amp *= 0.5;
  }
  return v / tot;
}
float band(float v, float at, float w) { return smoothstep(at - w, at + w, v); }
float edge(float v, float at) { return 1.0 - smoothstep(0.0, 0.03, abs(v - at)); }

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  vec2 away = (uv - 0.5) * asp - (uPointer - 0.5) * asp;
  float near = exp(-dot(away, away) / 0.045);
  vec2 p = uv * asp + away * near * uPush;
  p = mat2(uAxis.x, uAxis.y, -uAxis.y, uAxis.x) * p;
  p.y /= 1.0 + uStreak;
  p = p * uScale + uSeed;

  float t = uTime * uSpeed;
  vec2 q = vec2(field(p + t * 0.10), field(p + vec2(5.2, 1.3) - t * 0.07));
  vec2 r = vec2(field(p + uWarp * q + vec2(1.7, 9.2) + t * 0.15), field(p + uWarp * q + vec2(8.3, 2.8) - t * 0.12));
  float f = field(p + uWarp * r);

  float tick = floor(uTime * 12.0);
  vec2 ep = mat2(uAxis.x, uAxis.y, -uAxis.y, uAxis.x) * gl_FragCoord.xy;
  ep.y /= 3.0;
  ep = floor(ep);
  float jag = (mix(h21(ep + fract(tick * 0.1031) * vec2(19.3, 7.7)), h21(ep * 0.37 + 13.7), 0.5) - 0.5) * 0.01;

  float s = max(uCalm, 1.0 - uOpen);
  float a1 = 0.40 - 1.2 * s, a2 = 0.60 + 1.5 * s, a3 = 0.70 + 1.5 * s, a4 = 0.775 + 1.6 * s;
  float v4 = q.y * f * 1.6;
  vec3 col = mix(uC0, uC1, band(f + jag, a1, uSoft));
  col = mix(col, uC2, band(q.x + jag, a2, uSoft) * 0.85);
  col = mix(col, uC3, band(r.y + jag, a3, uSoft) * 0.75);
  col = mix(col, uC4, band(v4 + jag, a4, uSoft * 0.9) * 0.6);
  col = (col - 0.5) * mix(uContrast, 1.0, s) + 0.5;

  float rim = max(max(edge(f + jag, a1), edge(q.x + jag, a2)), max(edge(r.y + jag, a3), edge(v4 + jag, a4)));
  rim *= 1.0 - smoothstep(uCover - 0.08, uCover + 0.08, vnoise(p * 1.5 + vec2(31.7, 7.9)));
  col = mix(col, uLine, rim * 0.5);

  if (uTopRange > 0.0) {
    float reach = uTopRange * (1.0 - uCalm);
    col = mix(col, uTop, smoothstep(1.0 - max(reach, 0.001), 1.0, uv.y) * (1.0 - uCalm));
  }

  col += (h21(floor(gl_FragCoord.xy) + fract(tick * 0.1031) * vec2(37.7, 17.3)) - 0.5) * uGrain;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

  const KEYS = ["c0", "c1", "c2", "c3", "c4", "line", "top"];

  kfFx.register("color-field-gl", (el, { options, reduce, scroller }) => {
    const num = (k, d) => +(options[k] ?? d);
    const opt = {
      speed: num("speed", 0.15), scale: num("scale", 3.5), warp: num("warp", 1.2), streak: num("streak", 3.5),
      contrast: num("contrast", 1.15), push: num("push", 0.1), grain: num("grain", 0.06), soft: num("soft", 0.025),
      cover: num("cover", 0.3), top: num("top", 0.9), angle: num("angle", 0), oct: Math.max(1, Math.min(4, Math.round(+options.octaves || 2))),
      settle: num("settle", 0.5), open: num("open", 1.15), from: num("from", 0.64), res: +options.res || 0.7,
    };
    const canvas = document.createElement("canvas");
    canvas.dataset.fxPart = "canvas";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false }) || canvas.getContext("experimental-webgl");
    if (!gl) return;
    el.prepend(canvas);

    const make = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, make(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const u = Object.fromEntries(["uRes", "uTime", "uPointer", "uOpen", "uCalm", "uSeed", "uC0", "uC1", "uC2", "uC3", "uC4", "uLine", "uTop"].map((n) => [n, U(n)]));
    gl.uniform1f(U("uSpeed"), opt.speed); gl.uniform1f(U("uScale"), opt.scale); gl.uniform1f(U("uWarp"), opt.warp);
    gl.uniform1f(U("uStreak"), opt.streak); gl.uniform1f(U("uContrast"), opt.contrast); gl.uniform1f(U("uPush"), opt.push);
    gl.uniform1f(U("uGrain"), opt.grain); gl.uniform1f(U("uSoft"), opt.soft); gl.uniform1f(U("uCover"), opt.cover);
    gl.uniform1f(U("uTopRange"), opt.top); gl.uniform1i(U("uOct"), opt.oct);
    const rad = (opt.angle * Math.PI) / 180;
    gl.uniform2f(U("uAxis"), Math.cos(rad), Math.sin(rad));
    gl.uniform1f(u.uSeed, Math.random() * 100);

    // Colors are --fx-c0~c4·--fx-line·--fx-top (if missing, fx.css derives them from --kf-*) — painted on a 1×1 canvas and read back so color-mix·oklch are also accepted
    const probe = document.createElement("span"), pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    probe.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    const recolor = () => {
      el.append(probe);
      KEYS.forEach((k) => {
        probe.style.color = `var(--fx-${k})`;
        pix.clearRect(0, 0, 1, 1); pix.fillStyle = getComputedStyle(probe).color; pix.fillRect(0, 0, 1, 1);
        const [r, g, b] = pix.getImageData(0, 0, 1, 1).data;
        gl.uniform3f(u[`u${k === "line" ? "Line" : k === "top" ? "Top" : k.toUpperCase()}`], r / 255, g / 255, b / 255);
      });
      probe.remove();
    };
    recolor();

    const size = () => {
      const k = Math.min(devicePixelRatio || 1, 2) * opt.res;
      canvas.width = Math.max(1, Math.round(el.clientWidth * k));
      canvas.height = Math.max(1, Math.round(el.clientHeight * k));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
    };
    size();

    const aim = [0.5, 0.5], at = [0.5, 0.5];
    const move = (e) => {
      const b = el.getBoundingClientRect();
      aim[0] = (e.clientX - b.left) / Math.max(1, b.width);
      aim[1] = 1 - (e.clientY - b.top) / Math.max(1, b.height);
    };
    const box = scroller || document.scrollingElement || document.documentElement;
    const calm = () => {
      if (!(opt.settle > 0)) return 0;
      const room = box.scrollHeight - box.clientHeight, p = room > 0 ? box.scrollTop / room : 0;
      return Math.min(p / opt.settle, 1) ** 2;
    };
    const draw = (time, open) => {
      gl.uniform1f(u.uTime, time); gl.uniform1f(u.uOpen, open); gl.uniform1f(u.uCalm, calm());
      gl.uniform2f(u.uPointer, at[0], at[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const ro = new ResizeObserver(() => { size(); if (reduce) draw(0, 1); });
    ro.observe(el);
    const theme = new MutationObserver(() => { recolor(); if (reduce) draw(0, 1); });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });

    if (reduce) {
      const still = () => draw(0, 1);
      still();
      addEventListener("scroll", still, { passive: true });
      return () => { ro.disconnect(); theme.disconnect(); removeEventListener("scroll", still); gl.getExtension("WEBGL_lose_context")?.loseContext(); canvas.remove(); };
    }

    // Entrance: after opening, for open seconds goes from → 1 by (1 − (1 − t)^2.2) — color fields spread out from a solid color
    let raf = 0, t0 = 0, last = 0, seen = true;
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(tick); });
    io.observe(el);
    function tick(now) {
      raf = 0;
      if (!t0) t0 = last = now;
      const dt = Math.max(1, now - last); last = now;
      const k = 1 - Math.pow(1 - 0.04, dt / (1000 / 60));
      at[0] += (aim[0] - at[0]) * k; at[1] += (aim[1] - at[1]) * k;
      const sec = (now - t0) / 1000, g = opt.open > 0 ? Math.min(Math.max(sec / opt.open, 0), 1) : 1;
      draw(sec, 1 - (1 - opt.from) * (1 - (1 - Math.pow(1 - g, 2.2))));
      if (seen) raf = requestAnimationFrame(tick);
    }
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); theme.disconnect();
      removeEventListener("pointermove", move);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
