(() => {
  // Original Brand: draws the large logo mark above the hero in WebGL, pushing in that direction as the mouse passes and leaving wave rings · swirls
  // Adds chromatic aberration on the edges. The mouse-following point uses 1 − .04^dt, and the energy that builds with movement decays with a .75s half-life.
  // Values: strength .35 · radius .85 · ripple .2 · margin .25 (the mark is drawn with a wider surround so pushed edges are not clipped)
  const VS = `attribute vec2 aPos; attribute vec2 aUv; varying vec2 vUv;
    void main() { vUv = aUv; gl_Position = vec4(aPos, 0.0, 1.0); }`;
  const FS = `precision highp float;
    uniform sampler2D uTex; uniform vec2 uRes, uMouse, uPrev;
    uniform float uTime, uStrength, uRadius, uWave, uEnergy, uSpeed;
    varying vec2 vUv;
    float rnd(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(rnd(i), rnd(i + vec2(1.0, 0.0)), f.x), mix(rnd(i + vec2(0.0, 1.0)), rnd(i + vec2(1.0, 1.0)), f.x), f.y); }
    void main() {
      float aspect = uRes.x / uRes.y;
      vec2 p = vec2(vUv.x * aspect, vUv.y), m = vec2(uMouse.x * aspect, uMouse.y);
      float d = distance(p, m);
      float reach = pow(1.0 - smoothstep(0.0, uRadius, d), 1.8);
      vec2 move = vec2((uMouse.x - uPrev.x) * aspect, uMouse.y - uPrev.y);
      vec2 along = length(move) > 0.0001 ? normalize(move) : vec2(0.0);
      vec2 outward = length(p - m) > 0.0001 ? normalize(p - m) : vec2(0.0);
      vec2 around = vec2(-outward.y, outward.x);
      vec2 push = along * reach * uStrength * uSpeed * 0.012;
      vec2 ripple = outward * sin(d * uWave * 28.0 - uTime * 7.0) * exp(-d * 6.0) * uEnergy * reach * uStrength * 0.07;
      vec2 swirl = around * sin(d * 12.0 - uTime * 3.0) * exp(-d * 5.0) * uEnergy * 0.6 * reach * uStrength * 0.04;
      vec2 q = vUv * 3.5 + vec2(uTime * 0.25, uTime * 0.18);
      vec2 drift = vec2(noise(q), noise(q * 1.8 + 4.7)) * 2.0 - 1.0;
      vec2 uv = vUv + push + ripple + swirl + drift * uStrength * 0.006;
      vec4 col = texture2D(uTex, uv);
      col.rgb += reach * uEnergy * 0.02;
      float split = reach * uStrength * uEnergy * 0.001;
      col.r = texture2D(uTex, uv + along * split).r;
      col.b = texture2D(uTex, uv - along * split).b;
      gl_FragColor = col;
    }`;

  // Mark (<img> Me Inline <svg>) as an image — for svg, the computed text color is baked into the root so currentColor survives
  const rasterize = (mark) => new Promise((resolve) => {
    if (mark instanceof HTMLImageElement) {
      if (mark.complete && mark.naturalWidth) return resolve(mark);
      mark.addEventListener("load", () => resolve(mark), { once: true });
      mark.addEventListener("error", () => resolve(null), { once: true });
      return;
    }
    if (!(mark instanceof SVGSVGElement)) return resolve(null);
    const r = mark.getBoundingClientRect();
    const clone = mark.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", Math.max(1, Math.round(r.width * 2)));
    clone.setAttribute("height", Math.max(1, Math.round(r.height * 2)));
    clone.style.color = getComputedStyle(mark).color;
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  });

  kfFx.register("mark-ripple-cursor", (el, { options, reduce, hover }) => {
    const mark = el.querySelector('[data-fx-part="mark"]');
    if (!mark || reduce) return;
    const strength = +(options.strength ?? 0.35);
    const radius = +(options.radius ?? 0.85);
    const wave = +(options.wave ?? 0.2);
    const half = Math.max(0.01, +(options.decay ?? 0.75));
    const pad = +(options.pad ?? 0.25);
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "ripple");
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: true, alpha: true });
    if (!gl) return;
    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const attr = (data, name) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };
    attr([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1], "aPos");
    attr([0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0], "aUv");
    const u = {};
    ["uRes", "uMouse", "uPrev", "uTime", "uStrength", "uRadius", "uWave", "uEnergy", "uSpeed"].forEach((k) => (u[k] = gl.getUniformLocation(prog, k)));
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
    gl.uniform1i(gl.getUniformLocation(prog, "uTex"), 0);
    el.append(canvas);

    // The canvas is widened by the margin at the mark spot, and the mark is drawn at its original size in the center
    let picture = null, box = { width: 1, height: 1 }, alive = true;
    const place = () => {
      const er = el.getBoundingClientRect(), mr = mark.getBoundingClientRect();
      const w = mr.width * (1 + pad), h = mr.height * (1 + pad);
      Object.assign(canvas.style, { left: `${mr.left - er.left - (w - mr.width) / 2}px`, top: `${mr.top - er.top - (h - mr.height) / 2}px`, width: `${w}px`, height: `${h}px` });
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      box = { width: w, height: h };
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (!picture) return;
      const c = document.createElement("canvas");
      c.width = canvas.width; c.height = canvas.height;
      const mw = c.width / (1 + pad), mh = c.height / (1 + pad);
      c.getContext("2d").drawImage(picture, (c.width - mw) / 2, (c.height - mh) / 2, mw, mh);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    };
    const ro = new ResizeObserver(place);
    ro.observe(el);
    ro.observe(mark);
    rasterize(mark).then((img) => {
      if (!alive || !img) return;
      picture = img;
      place();
      el.setAttribute("data-gl", "");
    });

    let tx = 0.5, ty = 0.5, mx = 0.5, my = 0.5, px = 0.5, py = 0.5, energy = 0, speed = 0;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      energy = Math.min(energy + 0.6 * Math.min(Math.hypot((nx - tx) * r.width, (ny - ty) * r.height) / 30, 1), 1);
      tx = nx; ty = ny;
    };
    if (hover) el.addEventListener("pointermove", onMove, { passive: true });
    let seen = true;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    io.observe(el);
    const t0 = performance.now();
    let last = t0, raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const dt = Math.min(Math.max(1, now - last) / 800, 0.5);
      last = now;
      if (!seen || !picture) return;
      px = mx; py = my;
      const f = 1 - Math.pow(0.04, dt);
      mx += (tx - mx) * f; my += (ty - my) * f;
      speed = Math.min(Math.hypot((mx - px) * box.width, (my - py) * box.height) / 15, 1);
      energy *= Math.pow(0.5, dt / half);
      if (energy < 0.001) energy = 0;
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform2f(u.uMouse, mx, my);
      gl.uniform2f(u.uPrev, px, py);
      gl.uniform1f(u.uTime, (now - t0) / 1000);
      gl.uniform1f(u.uStrength, strength);
      gl.uniform1f(u.uRadius, radius);
      gl.uniform1f(u.uWave, wave);
      gl.uniform1f(u.uEnergy, energy);
      gl.uniform1f(u.uSpeed, speed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
      el.removeAttribute("data-gl");
    };
  });
})();
