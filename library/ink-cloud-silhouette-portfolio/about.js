/* About: line-by-line text reveal, stacked service cards (the front card darkens), scroll-driven tech wheel, work preview waves (WebGL) */
(() => {
  /* Ripple — original values: each time the pointer moves over 15px, one brush mark is stamped (at most 100). Marks grow from a diameter of 150px × 1.5 to × 7.5 
     Spreads with 1 − e^(−1.09·dt), density drops to 1/500 over 3 seconds and is erased below .06. The mark pattern is a bell dense at the center (e^(−5r²)) with 4 rings.
     Tilt the displacement map (box size × .4) summed from the strokes by (displacement × 2π) and shift the image by × .2 to look through it.
     The copy image is a plain placeholder with no pattern, so the same image is drawn on a canvas and warped, and light and shade are layered on the slopes so the warped grain shows (in the original the photo grain does this job) */
  const RP = { spacing: 15, brush: 150, start: 1.5, spread: 5, grow: 1.09, fade: 3, gone: 0.06, rings: 4, strength: 0.2, swirl: 1, quality: 0.4, pool: 100, shade: 0.25 };
  const VS = "attribute vec2 p; uniform vec2 uAt, uHalf; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(uAt + p * uHalf, 0.0, 1.0); }";
  const BRUSH = `
    precision highp float; varying vec2 vUv; uniform float uRings, uOp;
    void main(){
      vec2 q = vUv * 2.0 - 1.0; float r = dot(q, q);
      if (r > 1.0) discard;
      float bell = (exp(-r * 5.0) - exp(-5.0)) / (1.0 - exp(-5.0));
      bell *= 0.55 + 0.45 * cos(sqrt(r) * 6.2831853 * uRings);
      gl_FragColor = vec4(vec3(bell * uOp * uOp), 1.0);
    }`;
  const SHOW = `
    precision highp float; varying vec2 vUv;
    uniform sampler2D uD, uImg; uniform vec2 uTexel; uniform float uStrength, uSwirl, uShade;
    float d(vec2 o){ return texture2D(uD, vUv + o).r; }
    void main(){
      float amt = d(vec2(0.0));
      vec2 g = vec2(d(vec2(uTexel.x, 0.0)) - d(vec2(-uTexel.x, 0.0)), d(vec2(0.0, uTexel.y)) - d(vec2(0.0, -uTexel.y)));
      float th = amt * uSwirl * 6.2831853, c = cos(th), s = sin(th);
      vec2 push = vec2(c * g.x - s * g.y, s * g.x + c * g.y) * uStrength;
      vec4 col = texture2D(uImg, vUv + push);
      vec3 n = normalize(vec3(-g * 26.0, 1.0)), l = normalize(vec3(-0.35, 0.55, 1.0));
      col.rgb += (dot(n, l) - l.z) * uShade;
      gl_FragColor = vec4(clamp(col.rgb, 0.0, 1.0), smoothstep(0.0, 0.03, amt + length(g) * 4.0));
    }`;
  // Draws the placeholder image (background, two diagonals, border, center label) at its box size
  const paintPlaceholder = (img, w, h, k) => {
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h }), g = c.getContext("2d");
    const cs = getComputedStyle(img), lab = getComputedStyle(img, "::after");
    g.fillStyle = cs.backgroundColor; g.fillRect(0, 0, w, h);
    g.strokeStyle = cs.borderTopColor; g.lineWidth = k;
    g.beginPath(); g.moveTo(0, h); g.lineTo(w, 0); g.moveTo(0, 0); g.lineTo(w, h); g.stroke();
    g.strokeRect(k / 2, k / 2, w - k, h - k);
    const text = img.dataset.label || "";
    if (text && lab.content !== "none") {
      const fs = parseFloat(lab.fontSize) * k;
      g.font = `${lab.fontWeight} ${fs}px ${lab.fontFamily}`;
      const tw = Math.min(g.measureText(text).width, w * 0.9), px = fs * 0.7, py = fs * 0.35;
      g.fillStyle = lab.backgroundColor; g.fillRect((w - tw) / 2 - px, h / 2 - fs / 2 - py, tw + px * 2, fs + py * 2);
      g.fillStyle = lab.color; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, w / 2, h / 2, w * 0.9);
    }
    return c;
  };
  const ripple = (box) => {
    const cv = box.querySelector("canvas"), gl = cv.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl || DG.reduce || !matchMedia("(hover: hover)").matches) return () => {};
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const program = (vs, fs, names) => {
      const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, "p"); gl.linkProgram(p);
      return { p, u: Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)])) };
    };
    const brush = program(VS, BRUSH, ["uAt", "uHalf", "uRings", "uOp"]), show = program(VS, SHOW, ["uAt", "uHalf", "uD", "uImg", "uTexel", "uStrength", "uSwirl", "uShade"]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const tex = (unit) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      return t;
    };
    const dTex = tex(0), iTex = tex(1), fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dTex, 0);
    gl.useProgram(brush.p); gl.uniform1f(brush.u.uRings, RP.rings);
    gl.useProgram(show.p); gl.uniform1i(show.u.uD, 0); gl.uniform1i(show.u.uImg, 1); gl.uniform2f(show.u.uAt, 0, 0); gl.uniform2f(show.u.uHalf, 1, 1);
    gl.uniform1f(show.u.uStrength, RP.strength); gl.uniform1f(show.u.uSwirl, RP.swirl); gl.uniform1f(show.u.uShade, RP.shade);
    const waves = Array.from({ length: RP.pool }, () => ({ x: 0, y: 0, scale: 0, target: 0, op: 0 }));
    let w = 1, h = 1, dw = 2, dh = 2, next = 0, raf = 0, prevT = 0, prev = null;
    const img = box.querySelector(".wf-img");
    const size = () => {
      w = Math.max(1, box.clientWidth); h = Math.max(1, box.clientHeight);
      const k = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.ceil(w * k); cv.height = Math.ceil(h * k);
      dw = Math.max(2, Math.round(w * RP.quality)); dh = Math.max(2, Math.round(h * RP.quality));
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, dTex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, dw, dh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, iTex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      if (img) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, paintPlaceholder(img, cv.width, cv.height, k));
      gl.useProgram(show.p); gl.uniform2f(show.u.uTexel, 1 / dw, 1 / dh);
      render();
    };
    const render = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.viewport(0, 0, dw, dh); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(brush.p); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      let live = 0;
      for (const v of waves) {
        if (v.op <= 0) continue;
        live++;
        const half = (v.scale * RP.brush) / 2;
        gl.uniform2f(brush.u.uAt, (v.x / w) * 2 - 1, (v.y / h) * 2 - 1); gl.uniform2f(brush.u.uHalf, (half / w) * 2, (half / h) * 2); gl.uniform1f(brush.u.uOp, v.op);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      gl.disable(gl.BLEND);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(show.p); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return live;
    };
    const loop = (t) => {
      raf = 0;
      const dt = prevT ? Math.min(0.05, (t - prevT) / 1000) : 0; prevT = t;
      const grow = 1 - Math.exp(-dt * RP.grow), keep = Math.exp((-dt * Math.log(500)) / RP.fade);
      for (const v of waves) {
        if (v.op <= 0) continue;
        v.op *= keep; v.scale += (v.target - v.scale) * grow;
        if (v.op < RP.gone) v.op = 0;
      }
      if (render() > 0) raf = requestAnimationFrame(loop); else prevT = 0;
    };
    const move = (e) => {
      const r = box.getBoundingClientRect(), x = e.clientX - r.left, y = r.bottom - e.clientY;
      if (prev && Math.abs(x - prev.x) <= RP.spacing && Math.abs(y - prev.y) <= RP.spacing) return;
      prev = { x, y };
      Object.assign(waves[next], { x, y, scale: RP.start, target: RP.start * RP.spread, op: 1 });
      next = (next + 1) % RP.pool;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    size(); const ro = new ResizeObserver(size); ro.observe(box);
    document.fonts?.ready.then(size);
    box.addEventListener("pointermove", move);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); box.removeEventListener("pointermove", move); };
  };

  DG.page("about", {
    mount(root) {
      const offs = [];
      // Text lines rise in on entry
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        const lines = e.target.querySelectorAll("[data-rv-up]");
        DG.reduce ? gsap.set(lines, { yPercent: 0 }) : gsap.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: DG.E("easeOutSmooth", "power3.out"), stagger: 0.08 });
      }), { threshold: 0.2 });
      root.querySelectorAll(".off, .pv").forEach((s) => { if (!DG.reduce) gsap.set(s.querySelectorAll("[data-rv-up]"), { yPercent: 110 }); io.observe(s); });
      offs.push(() => io.disconnect());
      root.querySelectorAll("[data-ripple]").forEach((b) => offs.push(ripple(b)));
      DG.footer?.(root);

      const stack = root.querySelector("#srv-stack"), shade = root.querySelector(".srv__sh"), dev = root.querySelector(".srv--dev");
      const track = root.querySelector("#cir-track"), items = [...root.querySelectorAll(".cir__ls li")];
      let raf = 0, lastY = NaN, lastW = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        const y = DG.y(), vh = innerHeight;
        // When scrolling is still, nothing is rewritten — writing styles every time while idle makes press response slow
        if (y === lastY && innerWidth === lastW) return;
        lastY = y; lastW = innerWidth;
        // Service: while the second card rises to cover, the first card gets an ink shade deepening to .5
        if (stack && shade && dev) { const p = Math.min(1, Math.max(0, (y - DG.top(stack)) / vh)); shade.style.opacity = (p * 0.5).toFixed(3); }
        // Skill wheel: words stand around a large circle centered off the left of the screen and rotate with scroll — the word at the 3 o’clock position (horizontal) is boldest
        if (track && items.length && innerWidth > 1024) {
          const p = Math.min(1, Math.max(0, (y - DG.top(track)) / Math.max(1, track.offsetHeight - vh)));
          const R = vh * 0.62, step = 11, rot = -p * step * (items.length - 1);
          track.style.setProperty("--wheel-x", `${innerWidth * 0.14 - R}px`);
          items.forEach((li, i) => {
            const a = i * step + rot, d = Math.abs(((a % 360) + 540) % 360 - 180);
            li.style.transform = `rotate(${a}deg) translateX(${R}px)`;
            li.style.opacity = (0.15 + 0.85 * Math.max(0, 1 - d / 60)).toFixed(3);
          });
        }
      };
      raf = requestAnimationFrame(tick);
      if (!DG.reduce) DG.reveal(root);
      return () => { cancelAnimationFrame(raf); offs.forEach((f) => f()); };
    },
  });
})();
