// 96 scattered colored ink puddles ride on the head of a single-stroke symbol, flowing together and blending, and set into a dark ink symbol starting from where they’ve passed (WebGL2).
// Puddles are summed as a metaball field and cut at a threshold (overlapping colors multiply and darken), and strokes are received by a mask drawn up to the leading edge.
// For the first 0.34 it gathers while twisting (0.65), and from its 0.72 point the leading head passes along the stroke from -0.08 → 1.7 (first 12% accelerates · last 20% decelerates, the last 0.065 is a tail growing out).
// A puddle past its spot starts blending and melting to ink-black after 0.22 of the solidify length (0.15), and 36 droplets splash at each spot it passes. Once fully solid it wobbles once with a 0.42s spring.
// Pointing within radius 155 swells the ink by 22. Pressing, Enter, or sending fx:play redraws it with a different palette.
(() => {
  const VERT = `#version 300 es
    in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
  const FRAG = `#version 300 es
    precision highp float;
    uniform sampler2D uMask, uPools;
    uniform int uCount;
    uniform vec2 uRes, uView;
    uniform vec4 uBox, uMaskBox;
    uniform float uWave, uTime;
    uniform vec3 uPointer, uInk;
    out vec4 o;
    float mask(vec2 p){
      vec2 uv = (p - uMaskBox.xy) / uMaskBox.zw;
      return all(greaterThanEqual(uv, vec2(0.))) && all(lessThanEqual(uv, vec2(1.))) ? texture(uMask, uv).r : 0.;
    }
    void main(){
      vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
      vec2 p = (frag - uBox.xy) / uBox.zw * uView;
      float near = exp(-pow(length(p - uPointer.xy) / 155., 2.)) * uPointer.z;
      vec2 q = p + vec2(sin(p.y / 260. * 6.2831 - uTime * 6.2831 * 1.1), cos(p.x / 260. * 6.2831 - uTime * 6.2831 * 1.1)) * uWave;
      float m = mask(q);
      if (near > .01) {
        float r = 22. * near;
        for (int k = 0; k < 8; k++) { float a = float(k) * .7854; m = max(m, mask(q + vec2(cos(a), sin(a)) * r)); }
      }
      float sa = clamp((m - .5) / max(fwidth(m), 1e-3) + .5, 0., 1.);
      float field = 0., lit = 0.; vec3 logc = vec3(0.); float mixAcc = 0.;
      for (int i = 0; i < 160; i++) {
        if (i >= uCount) break;
        vec4 a = texelFetch(uPools, ivec2(i, 0), 0);
        vec4 b = texelFetch(uPools, ivec2(i, 1), 0);
        vec2 d = (p - a.xy) / (a.z * (1. + .35 * near));
        float dd = dot(d, d);
        if (dd >= 1.) continue;
        float w = (1. - dd); w = w * w * w * a.w;
        field += w;
        float cov = smoothstep(.15, .55, w);
        logc += cov * log(max(b.rgb, vec3(.03)));
        lit += cov; mixAcc += w * b.a;
      }
      float fa = clamp((field - .32) / max(fwidth(field), 1e-4) + .5, 0., 1.);
      vec3 pc = exp(logc / max(1., lit * .55));
      pc = mix(pc, uInk, clamp(mixAcc / max(field, 1e-4), 0., 1.));
      float alpha = max(fa, sa);
      vec3 c = mix(uInk, pc, fa * (1. - sa * .35));
      o = vec4(c * alpha, alpha);
    }`;

  // The original first palette (CMY / RGB twelve colors) comes from --fx-ink-1…12 in fx.css, and on redraw it picks one different from last time from the branches below
  const HUE_THEMES = [
    { id: "warm", hues: [350, 356, 2, 10, 18, 26, 34, 42, 50, 56, 175, 200] },
    { id: "ocean", hues: [180, 185, 190, 195, 200, 210, 215, 220, 225, 235, 30, 345] },
    { id: "berry", hues: [270, 275, 280, 285, 290, 300, 305, 310, 315, 325, 50, 170] },
    { id: "lime", hues: [90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 280, 35], sat: [0.46, 0.78] },
  ];
  const LIST_THEMES = [
    { id: "ultraviolet", colors: ["#36116b", "#50248f", "#6b34b0", "#8648cb", "#a264de", "#be8bec", "#f2c930", "#f7d447", "#fbde64", "#ffe681", "#ffed9f", "#fff3bd"] }, // Not skin: swatch palette drawn on redraw — the color itself is the content
    { id: "lagoon", colors: ["#063f48", "#075b62", "#087c7d", "#159d98", "#3dbab0", "#76d4c4", "#f76b64", "#fa8375", "#fd9c8c", "#ffb3a2", "#ffcbbb", "#ffe0d2"] }, // Not a skin: palette swatch picked when redrawing
    { id: "camo", colors: ["#40543a", "#58653d", "#71804c", "#8b955d", "#a9ac76", "#c3bd8b", "#dfd1a6", "#b4a17a", "#928263", "#71614d", "#536b53", "#91a68a"] }, // Not a skin: palette swatch picked when redrawing
  ];
  const P = {
    pools: 96, colorStagger: 2.5, kernel: 32, drift: 16, bodyMotion: 0.35, gatherRx: 560, gatherRy: 640, twist: 0.65, gather: 0.34, handoff: 0.72, lead: 0.12,
    travelFrom: -0.08, travelTo: 1.7, accel: 0.12, decel: 0.2, growth: 0.065, mixDelay: 0.22, mixLength: 0.4,
    settle: 0.15, splash: 36, splashDistance: 350, splashDur: 0.5, splashDrag: 1.6, splashRadius: 0.4, elastic: 0.28, elasticDur: 0.42,
    elasticCycles: 1.5, elasticDecay: 3.2, elasticPush: 64, wave: 0.008,
  };

  // Variable values sometimes come as relative color expressions (oklch(from …)), so it is painted onto an element, the computed color is read back as one canvas pixel and converted to rgb
  const rgbOf = (() => {
    let ctx;
    return (host, css) => {
      ctx ||= Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
      const probe = document.createElement("i");
      probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
      probe.style.color = css;
      host.append(probe);
      const computed = getComputedStyle(probe).color;
      probe.remove();
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000"; // Not Skin: leftover initial value when unreadable — not painted on screen
      ctx.fillStyle = computed;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
  })();
  const hsv = (h, s, v) => {
    const f = (n) => { const k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
    return [f(5), f(3), f(1)];
  };
  const hueOf = ([r, g, b]) => {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (!d) return 0;
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  };
  // Trapezoid velocity that accelerates for the first a and decelerates for the last b — area normalized to 1
  const travel = (u, a, b) => {
    u = Math.max(0, Math.min(1, u));
    const v = 1 / (1 - a / 2 - b / 2);
    if (u < a) return (v * u * u) / (2 * a);
    if (u > 1 - b) { const r = 1 - u; return 1 - (v * r * r) / (2 * b); }
    return v * (u - a / 2);
  };
  const smooth = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };

  // Stroke as 240 points — where the puddle gathers, the direction droplets spray (normal), a stroke mask drawn only up to the leading edge
  function sample(path) {
    const len = path.getTotalLength(), n = 240, pts = [];
    for (let i = 0; i <= n; i++) { const q = path.getPointAtLength((len * i) / n); pts.push(q.x, q.y); }
    return { pts, n };
  }

  kfFx.register("ink-gather", (el, { options, reduce }) => {
    const svg = el.querySelector('[data-fx-part="mark"]');
    const path = svg?.querySelector("path");
    if (!svg || !path || !svg.viewBox?.baseVal?.width) return;
    const canvas = document.createElement("canvas");
    canvas.className = "fx-ink-gather";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false, alpha: true });
    const fail = () => { el.classList.add("fx-ink-gather-failed"); return () => el.classList.remove("fx-ink-gather-failed"); };
    if (!gl) return fail();
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return fail();
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return fail();
    el.append(canvas);

    const vb = svg.viewBox.baseVal, view = [vb.width, vb.height];
    const half = +(options.width ?? (parseFloat(getComputedStyle(path).strokeWidth) || 140)) / 2;
    const dur = +(options.dur ?? 2.587), hold = +(options.hold ?? 0.12), count = Math.min(160 - P.splash, +options.pools || P.pools);
    const sdf = sample(path), pad = 64, mScale = 0.5;
    const maskCanvas = Object.assign(document.createElement("canvas"), { width: Math.ceil((view[0] + pad * 2) * mScale), height: Math.ceil((view[1] + pad * 2) * mScale) });
    const mctx = maskCanvas.getContext("2d");

    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["uMask", "uPools", "uCount", "uRes", "uView", "uBox", "uMaskBox", "uWave", "uTime", "uPointer", "uInk"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
    const tex = (unit, filter) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); return t; };
    const maskTex = tex(0, gl.LINEAR);
    const poolTex = tex(1, gl.NEAREST);
    const poolData = new Float32Array(160 * 2 * 4);
    gl.uniform1i(U.uMask, 0); gl.uniform1i(U.uPools, 1);
    gl.uniform2f(U.uView, view[0], view[1]);
    gl.uniform4f(U.uMaskBox, -pad, -pad, maskCanvas.width / mScale, maskCanvas.height / mScale);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Dot on stroke — where puddles gather and the direction drops splash (stroke normal)
    const at = (s) => {
      const f = Math.max(0, Math.min(1, s)) * sdf.n, i = Math.min(sdf.n - 1, Math.floor(f)), t = f - i, q = sdf.pts;
      const x = q[i * 2] + (q[i * 2 + 2] - q[i * 2]) * t, y = q[i * 2 + 1] + (q[i * 2 + 3] - q[i * 2 + 1]) * t;
      const dx = q[i * 2 + 2] - q[i * 2], dy = q[i * 2 + 3] - q[i * 2 + 1], l = Math.hypot(dx, dy) || 1;
      return { x, y, nx: -dy / l, ny: dx / l };
    };

    let palette = [], ink = [0, 0, 0], lastTheme = "process", pools = [], drops = [];
    const firstPalette = () => Array.from({ length: 12 }, (_, i) => rgbOf(el, `var(--fx-ink-${i + 1})`));
    const pickPalette = () => {
      const all = [...HUE_THEMES, ...LIST_THEMES, { id: "mono" }].filter((t) => t.id !== lastTheme);
      const th = all[Math.floor(Math.random() * all.length)];
      lastTheme = th.id;
      if (th.colors) return th.colors.map((c) => rgbOf(el, c));
      if (th.id === "mono") return Array.from({ length: 12 }, (_, i) => { const k = 0.2 + (i / 11) * 0.75; return ink.map((c, j) => c + (paper[j] - c) * k); });
      const shift = hueOf(rgbOf(el, "var(--fx-ink-2)")) - 324.4;
      const [s0, s1] = th.sat || [0.58, 1];
      return th.hues.map((h) => hsv((h + shift + (Math.random() * 2 - 1) * 2 + 360) % 360, s0 + Math.random() * (s1 - s0), 0.92 + Math.random() * 0.08));
    };
    let paper = [1, 1, 1];
    const setup = (recolor) => {
      ink = rgbOf(el, "var(--fx-ink)");
      paper = rgbOf(el, "var(--kf-bg)");
      palette = recolor ? pickPalette() : ((lastTheme = "process"), firstPalette());
      const cx = view[0] / 2, cy = view[1] / 2;
      pools = Array.from({ length: count }, (_, i) => {
        const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
        return {
          s: (i + Math.random()) / count, lead: Math.random() * P.lead, side: (Math.random() * 2 - 1) * 0.6, delay: Math.random() * 0.1,
          x0: cx + Math.cos(a) * r * P.gatherRx, y0: cy + Math.sin(a) * r * P.gatherRy,
          r: P.kernel * (0.75 + Math.random() * 0.6), c: palette[i % palette.length],
          ph: Math.random() * Math.PI * 2, spin: Math.random() < 0.5 ? -1 : 1,
        };
      });
      drops = Array.from({ length: P.splash }, (_, i) => {
        const side = Math.random() < 0.5 ? -1 : 1;
        return { s: (i + Math.random()) / P.splash, side, spread: (Math.random() * 2 - 1) * 0.85, dist: P.splashDistance * (0.35 + Math.random() * 0.65), r: P.kernel * P.splashRadius * (0.6 + Math.random() * 0.8), c: palette[(i * 5) % palette.length] };
      });
    };

    let box = [0, 0, 1, 1], scale = 1;
    const fit = () => {
      const r = el.getBoundingClientRect(), m = svg.getBoundingClientRect();
      scale = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(r.width * scale));
      canvas.height = Math.max(1, Math.round(r.height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      box = [(m.left - r.left) * scale, (m.top - r.top) * scale, m.width * scale, m.height * scale];
      draw(time);
    };

    const pointer = { x: -1e4, y: -1e4, on: 0, target: 0 };
    let start = 0, time = 0, raf = 0;
    // Draw the stroke up to the leading F — the last 0.065 is a tail where the thickness grows from 0
    let drawnFront = -1;
    const drawMask = (front, width) => {
      const key = Math.min(front, 1 + P.growth) + width * 1e-4;
      if (key === drawnFront) return;
      drawnFront = key;
      const q = sdf.pts, n = sdf.n;
      mctx.setTransform(mScale, 0, 0, mScale, pad * mScale, pad * mScale);
      mctx.clearRect(-pad, -pad, view[0] + pad * 2, view[1] + pad * 2);
      mctx.strokeStyle = "#fff"; mctx.lineCap = "round"; mctx.lineJoin = "round"; // Not skin: stroke mask the shader reads from the red channel only
      const end = Math.min(n, Math.floor(Math.max(0, front) * n));
      let solid = Math.min(end, Math.floor(Math.max(0, front - P.growth) * n));
      if (solid > 0) {
        mctx.lineWidth = width; mctx.beginPath(); mctx.moveTo(q[0], q[1]);
        for (let i = 1; i <= solid; i++) mctx.lineTo(q[i * 2], q[i * 2 + 1]);
        mctx.stroke();
      }
      for (let i = Math.max(0, solid); i < end; i++) {
        const k = smooth((front - (i + 0.5) / n) / P.growth);
        mctx.lineWidth = width * k; mctx.beginPath(); mctx.moveTo(q[i * 2], q[i * 2 + 1]); mctx.lineTo(q[i * 2 + 2], q[i * 2 + 3]); mctx.stroke();
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, gl.RED, gl.UNSIGNED_BYTE, maskCanvas);
    };
    const startAt = P.gather * P.handoff;
    const frontAt = (u) => P.travelFrom + (P.travelTo - P.travelFrom) * travel((u - startAt) / (1 - startAt), P.accel, P.decel);
    const draw = (t) => {
      const u = (t - hold) / dur, front = frontAt(u);
      const endAt = hold + dur * (startAt + (1 - startAt) * ((1 + P.growth - P.travelFrom) / (P.travelTo - P.travelFrom)));
      const done = front >= 1 + P.growth;
      let n = 0;
      const put = (x, y, r, a, c, mix) => {
        const k = n * 4, j = (160 + n) * 4;
        poolData[k] = x; poolData[k + 1] = y; poolData[k + 2] = r; poolData[k + 3] = a;
        poolData[j] = c[0]; poolData[j + 1] = c[1]; poolData[j + 2] = c[2]; poolData[j + 3] = mix;
        n++;
      };
      for (const p of pools) {
        // Until the leading edge reaches its own spot (s), it rides right in front of the leading edge and flows along, and once past it blends into ink color and melts into the stroke
        const since = front - p.s;
        if (since > P.settle * 1.5) continue;
        const g = smooth((u - p.delay) / P.gather);
        const q = at(Math.min(p.s, Math.max(0, front) + p.lead)), tw = P.twist * (1 - g) * p.spin, k = (1 - g) * (1 - g);
        const tx = q.x + q.nx * p.side * half, ty = q.y + q.ny * p.side * half;
        const ox = (p.x0 - tx) * k, oy = (p.y0 - ty) * k;
        const wob = P.drift * (1 - g * (1 - P.bodyMotion));
        const x = tx + ox * Math.cos(tw) - oy * Math.sin(tw) + Math.cos(t * 1.3 + p.ph) * wob, y = ty + ox * Math.sin(tw) + oy * Math.cos(tw) + Math.sin(t * 1.1 + p.ph) * wob;
        const appear = smooth((u - p.delay * P.colorStagger) / 0.06);
        const mix = smooth((since - P.settle * P.mixDelay) / (P.settle * P.mixLength * 2));
        const fade = 1 - smooth((since - P.settle) / (P.settle * 0.4));
        put(x, y, p.r, appear * fade, p.c, mix);
      }
      for (const d of drops) {
        const life = (t - (hold + dur * (startAt + (1 - startAt) * Math.max(0, (d.s - P.travelFrom) / (P.travelTo - P.travelFrom))))) / P.splashDur;
        if (life <= 0 || life >= 1) continue;
        const q = at(d.s), ang = Math.atan2(q.ny * d.side, q.nx * d.side) + d.spread;
        const go = (1 - Math.exp(-P.splashDrag * 3 * life)) / (1 - Math.exp(-P.splashDrag * 3));
        put(q.x + q.nx * d.side * half + Math.cos(ang) * d.dist * go, q.y + q.ny * d.side * half + Math.sin(ang) * d.dist * go, d.r * (1 - smooth((life - 0.6) / 0.4)), 1, d.c, 0);
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 160, 2, 0, gl.RGBA, gl.FLOAT, poolData);
      const et = (t - endAt) / P.elasticDur;
      const wob = et > 0 && et < 1 ? P.elasticPush * P.elastic * Math.sin(et * Math.PI * 2 * P.elasticCycles) * Math.exp(-P.elasticDecay * et) * (1 - et) : 0;
      drawMask(front, (half + wob) * 2);
      pointer.on += (pointer.target - pointer.on) * 0.12;
      gl.uniform1i(U.uCount, n);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform4f(U.uBox, box[0], box[1], box[2], box[3]);
      gl.uniform1f(U.uWave, done ? 0 : P.wave * view[0] * (1 - smooth(front - 0.9)));
      gl.uniform1f(U.uTime, t);
      gl.uniform3f(U.uPointer, pointer.x, pointer.y, pointer.on);
      gl.uniform3f(U.uInk, ink[0], ink[1], ink[2]);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      return done && n === 0 && et >= 1 && Math.abs(pointer.target - pointer.on) < 0.01;
    };
    const tick = (now) => {
      raf = 0;
      time = (now - start) / 1000;
      const still = draw(time);
      if (!still || pointer.target) raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const play = (recolor) => {
      setup(recolor);
      drawnFront = -1;
      if (reduce) { time = 99; draw(time); return; }
      start = performance.now();
      time = 0;
      wake();
    };

    const onMove = (e) => {
      const m = svg.getBoundingClientRect();
      pointer.x = ((e.clientX - m.left) / m.width) * view[0];
      pointer.y = ((e.clientY - m.top) / m.height) * view[1];
      pointer.target = 1;
      wake();
    };
    const onLeave = () => { pointer.target = 0; wake(); };
    const onClick = () => play(true);
    const onKey = (e) => { if (e.key === "Enter") play(true); };
    const onPlay = (e) => play(!!e.detail?.recolor);
    const interactive = options.interactive !== "false";
    if (interactive) {
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      el.addEventListener("click", onClick);
      el.addEventListener("keydown", onKey);
    }
    el.addEventListener("fx:play", onPlay);
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    setup(false);
    fit();
    if (options.autoplay !== "false") play(false);
    else { time = 99; draw(time); }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("fx:play", onPlay);
      gl.deleteTexture(maskTex); gl.deleteTexture(poolTex); gl.deleteBuffer(buf); gl.deleteProgram(prog);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  });
})();
