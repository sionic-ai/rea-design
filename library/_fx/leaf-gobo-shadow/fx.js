(() => {
  const VERT = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }";
  const FRAG = `precision mediump float;
uniform sampler2D uMap; uniform sampler2D uSoft;
uniform vec2 uRes; uniform vec2 uShift; uniform vec3 uShade; uniform vec2 uOpacity;
uniform vec4 uWind; uniform vec4 uWind2; uniform vec4 uP1; uniform vec4 uP2;
varying vec2 vUv;
vec2 proj(vec2 p, vec4 P){ vec2 r = p - P.xy; float c = cos(P.w), s = sin(P.w); return vec2(c * r.x + s * r.y, -s * r.x + c * r.y) / P.z + .5; }
float leaves(sampler2D m, vec2 uv, vec4 w){
  float branch = sin(uv.y * 22. + uv.x * 11.);
  float leaf = sin(uv.y * 83. - uv.x * 57.);
  return texture2D(m, uv + vec2(branch * w.x + leaf * w.z, branch * w.y + leaf * w.w)).g;
}
float fade(vec2 uv){ return smoothstep(0., .06, uv.x) * (1. - smoothstep(.94, 1., uv.x)) * smoothstep(0., .06, uv.y) * (1. - smoothstep(.94, 1., uv.y)); }
void main(){
  vec2 p = vec2(vUv.x, 1. - vUv.y) * uRes + uShift;
  vec2 a = proj(p, uP1), b = proj(p, uP2);
  float v = max(leaves(uMap, a, uWind) * fade(a) * uOpacity.x, leaves(uSoft, b, uWind2) * fade(b) * uOpacity.y);
  gl_FragColor = vec4(mix(vec3(1.), uShade, clamp(v, 0., 1.)), 1.);
}`;

  // Leaf clump artwork by our own hand — oval leaves attached alternately along a branch stem, leaving gaps between clumps where light leaks through
  const drawFoliage = (size, blur, seed, from = 0) => {
    let s = seed >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const c = document.createElement("canvas"); c.width = c.height = size;
    const g = c.getContext("2d");
    g.fillStyle = "rgb(0,0,0)"; /* Not skin: shadow occluder value (0=Light, 1=Leaf) */
    g.fillRect(0, 0, size, size);
    const leafCanvas = document.createElement("canvas"); leafCanvas.width = leafCanvas.height = size;
    const l = leafCanvas.getContext("2d");
    l.fillStyle = l.strokeStyle = "rgb(255,255,255)"; /* Not skin: shadow mask value */
    const k = size / 1024;
    for (let b = 0; b < 18; b++) {
      const x0 = (from + rnd() * (1 - from)) * size, y0 = rnd() * size, ang = rnd() * Math.PI * 2, len = (180 + rnd() * 300) * k, bend = (rnd() - 0.5) * 1.4;
      l.lineWidth = (1.5 + rnd() * 2) * k; l.lineCap = "round";
      l.beginPath(); l.moveTo(x0, y0);
      const pts = [];
      for (let i = 1; i <= 24; i++) {
        const t = i / 24, a = ang + bend * t;
        const x = x0 + Math.cos(a) * len * t, y = y0 + Math.sin(a) * len * t;
        l.lineTo(x, y); pts.push([x, y, a]);
      }
      l.stroke();
      pts.forEach(([x, y, a], i) => {
        const n = 2 + Math.floor(rnd() * 3);
        for (let j = 0; j < n; j++) {
          const side = (i + j) % 2 ? 1 : -1, la = a + side * (0.4 + rnd() * 0.9), r = (11 + rnd() * 14) * k;
          const cx = x + Math.cos(la) * r * (0.7 + rnd() * 0.8), cy = y + Math.sin(la) * r * (0.7 + rnd() * 0.8);
          l.beginPath(); l.ellipse(cx, cy, r, r * (0.42 + rnd() * 0.3), la, 0, Math.PI * 2); l.fill();
        }
      });
    }
    g.filter = `blur(${blur * k}px)`;
    g.drawImage(leafCanvas, 0, 0);
    return c;
  };

  const clampFrom = (v) => Math.min(0.9, Math.max(0, v || 0));
  const readColor = (el, name, fallback) => {
    const probe = document.createElement("span"); probe.style.color = `var(${name}, ${fallback})`; probe.style.display = "none";
    el.appendChild(probe);
    const css = getComputedStyle(probe).color; probe.remove();
    const c = document.createElement("canvas"); c.width = c.height = 1;
    const g = c.getContext("2d"); g.fillStyle = css; g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  kfFx.register("leaf-gobo-shadow", (el, { options, reduce, hover }) => {
    const opacity = +(options.opacity ?? 0.75), opacity2 = +(options.soft ?? 0.51);
    const sway = +(options.sway ?? 0.43), speed = +(options.speed ?? 0.14), shift = +(options.shift ?? 0);
    const scale = +(options.scale ?? 1) || 1, res = Math.min(1, Math.max(0.25, +(options.res ?? 0.5) || 0.5));
    const p1 = { x: +(options.x ?? 0.8), y: +(options.y ?? 0.32), size: +(options.size ?? 1.3) * scale, angle: +(options.angle ?? -0.341) };
    const p2 = { x: +(options.x2 ?? 0.28), y: +(options.y2 ?? -0.12), size: +(options.size2 ?? 1.15) * scale, angle: +(options.angle2 ?? -0.03) };
    const canvas = document.createElement("canvas");
    canvas.className = "fx-gobo-canvas"; canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    el.appendChild(canvas);
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(prog, n);
    const tex = (unit, img) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const seed = +(options.seed ?? 11) || 11;
    const from = clampFrom(+(options.from ?? 0));
    const t1 = tex(0, drawFoliage(1024, 2.4, seed, from)), t2 = tex(1, drawFoliage(512, 7, seed + 5, from * 0.5));
    gl.uniform1i(u("uMap"), 0); gl.uniform1i(u("uSoft"), 1);
    gl.uniform2f(u("uOpacity"), opacity, opacity2);
    const shade = () => gl.uniform3fv(u("uShade"), readColor(el, "--fx-shade", "color-mix(in oklab, var(--kf-ink) 72%, var(--kf-bg))"));
    shade();

    let W = 1, H = 1;
    const size = () => {
      const r = el.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * res); canvas.height = Math.round(H * res);
      gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(u("uRes"), W, H);
    };
    const ro = new ResizeObserver(size); ro.observe(el); size();

    const breeze = (out, t, amt) => {
      const gust = 0.72 + Math.sin(t * 0.37) * 0.18 + Math.sin(t * 0.61) * 0.1;
      out[0] = Math.sin(t * 1.13) * amt * gust * 0.006; out[1] = Math.sin(t * 0.87 + 0.8) * amt * gust * 0.0035;
      out[2] = Math.sin(t * 3.7 + 1.4) * amt * gust * 0.0015; out[3] = Math.sin(t * 2.9 + 0.4) * amt * gust * 0.001;
      return out;
    };
    const w1 = [0, 0, 0, 0], w2 = [0, 0, 0, 0], par = { x: 0, y: 0 };
    let time = 0, last = 0, raf = 0;
    const draw = () => {
      const span = Math.max(W, H), narrow = W < 768;
      const p1x = narrow ? +(options.mx ?? p1.x) : p1.x, p1y = narrow ? +(options.my ?? p1.y) : p1.y;
      const dx = Math.sin(time * 0.7) * sway * 0.0256 * span, dy = Math.sin(time * 0.43) * sway * 0.016 * span, rot = Math.sin(time * 0.31) * sway * 0.01;
      gl.uniform4f(u("uP1"), p1x * W + dx, p1y * H + dy, p1.size * span, p1.angle + rot);
      gl.uniform4f(u("uP2"), p2.x * W + dx * 0.7, p2.y * H + dy * 0.7, p2.size * span, p2.angle + rot * 0.7);
      gl.uniform4fv(u("uWind"), breeze(w1, time, sway)); gl.uniform4fv(u("uWind2"), breeze(w2, time * 0.83 + 2.4, sway * 0.7));
      gl.uniform2f(u("uShift"), par.x, par.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = now;
      const dt = Math.max(0.001, (now - last) / 1000); last = now;
      time += Math.min(dt, 0.05) * speed * 2.4;
      draw();
    };
    if (reduce) draw(); else raf = requestAnimationFrame(tick);

    const ease = kfFx.ease("power3.out", "power3.out");
    const onMove = (e) => {
      const nx = (e.clientX / innerWidth) * 2 - 1, ny = (e.clientY / innerHeight) * 2 - 1;
      if (window.gsap) gsap.to(par, { x: nx * shift, y: ny * shift * 0.6, duration: 0.85, ease, overwrite: true, onUpdate: reduce ? draw : undefined });
    };
    const moving = shift && hover && !reduce;
    if (moving) addEventListener("pointermove", onMove);
    const onTheme = () => { shade(); if (reduce) draw(); };
    el.addEventListener("fx:theme", onTheme);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      if (moving) removeEventListener("pointermove", onMove);
      el.removeEventListener("fx:theme", onTheme);
      if (window.gsap) gsap.killTweensOf(par);
      gl.deleteTexture(t1); gl.deleteTexture(t2); gl.deleteBuffer(buf); gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
