(() => {
  const hover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = matchMedia("(max-width: 767px)").matches;
  const smooth = (e) => e * e * (3 - 2 * e);
  if (window.CustomEase) {
    gsap.registerPlugin(CustomEase);
    CustomEase.create("ui.out", "M0,0 C0.23,1 0.32,1 1,1");
    CustomEase.create("ui.inOut", "M0,0 C0.77,0 0.175,1 1,1");
  }

  // Rising dust — grains proportional to panel area rise from bottom to top (.4~1.4% of panel height per second), sway 6px side to side and twinkle.
  // shade(x, y, grain) gives the brightness at that spot as 0~1. The default fades at the top 1/6 and bottom 1/3 of the panel
  window.fDust = (canvas, { count, rise = 1, shade, fps = 30, size = 1, maxDpr = 2 } = {}) => {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, raf = 0, last = 0, on = false, dirty = false;
    const dots = [];
    const shadeOf = shade || ((x, y, d) => Math.min(1, (1 - d.y) * 6, d.y * 3));
    const seed = (fill) => ({ x: Math.random(), y: fill ? Math.random() : 1 + Math.random() * 0.05, r: (0.5 + Math.random() * 1.1) * size, vy: (0.004 + Math.random() * 0.01) * (typeof rise === "function" ? rise(w, h) : rise), sway: Math.random() * 6.283, glint: Math.random() * 6.283, a: 0.2 + Math.random() * 0.4 });
    const draw = (now = performance.now()) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const x = d.x * w + Math.sin(now * 4e-4 + d.sway) * 6, y = d.y * h;
        const a = d.a * (0.55 + 0.45 * Math.sin(now * 0.0012 + d.glint)) * shadeOf(x, y, d);
        if (a <= 0.004) continue;
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(x, y, d.r, 0, 6.283); ctx.fill();
      }
    };
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const f = typeof fps === "function" ? fps() : fps;
      if (now - last < 1000 / f) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      for (let i = 0; i < dots.length; i++) { dots[i].y -= dots[i].vy * dt; if (dots[i].y < -0.02) dots[i] = seed(false); }
      draw(now);
    };
    const resize = () => {
      const r = Math.min(devicePixelRatio || 1, maxDpr);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * r); canvas.height = Math.round(h * r);
      ctx.setTransform(r, 0, 0, r, 0, 0);
      ctx.fillStyle = getComputedStyle(canvas).color;
      const n = Math.round(typeof count === "function" ? count(w, h) : count);
      dots.length = Math.min(dots.length, n);
      while (dots.length < n) dots.push(seed(true));
      draw();
    };
    const wake = () => { if (!reduce && on && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
    const sleep = () => { cancelAnimationFrame(raf); raf = 0; };
    new ResizeObserver(() => (on ? resize() : (dirty = true))).observe(canvas);
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && dirty) { dirty = false; resize(); } on ? wake() : sleep(); }).observe(canvas);
    resize();
    return { draw, wake, sleep };
  };
  window.fDust.density = (k) => (140 / 1296000) * k;

  // Header bar: past the hero the island drops down (phone uses is-past-hero), and a warm glow gathers at the cursor spot inside the island
  const header = document.querySelector(".f-header");
  const hl = document.querySelector(".f-hlight");
  if (header && hl) {
    const st = { p: null, k: 0 };
    let pointer = null, ticking = false, bottom = 0;
    const set = (r) => {
      const s = hl.style;
      if (st.p) { s.setProperty("--px", `${st.p.x}px`); s.setProperty("--py", `${st.p.y}px`); }
      s.setProperty("--k", st.k.toFixed(3));
      s.setProperty("--size", `${r.width}px`);
    };
    const tick = () => {
      const e = gsap.ticker.deltaRatio(60), r = hl.getBoundingClientRect();
      const inside = pointer && r.width > 0 && pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
      if (!inside && st.k === 0) return stop();
      let still = true;
      if (inside) {
        const n = { x: pointer.x - r.left, y: pointer.y - r.top };
        if (!st.p || st.k === 0) st.p = n;
        else { const t = 1 - 0.75 ** e; st.p = { x: st.p.x + (n.x - st.p.x) * t, y: st.p.y + (n.y - st.p.y) * t }; still = Math.hypot(n.x - st.p.x, n.y - st.p.y) < 0.3; }
      }
      const want = inside ? 1 : 0;
      st.k += (want - st.k) * (1 - (inside ? 0.8 : 0.9) ** e);
      if (Math.abs(want - st.k) < 0.003) st.k = want; else still = false;
      hl.classList.toggle("is-lit", st.k > 0);
      set(r);
      if (still) stop();
    };
    const start = () => { if (!ticking) { ticking = true; gsap.ticker.add(tick); } };
    const stop = () => { ticking = false; gsap.ticker.remove(tick); };
    if (hover && !reduce && window.gsap) {
      new ResizeObserver(() => { bottom = hl.offsetHeight ? hl.offsetTop + hl.offsetHeight : 0; }).observe(hl);
      addEventListener("pointermove", (e) => { pointer = { x: e.clientX, y: e.clientY }; if (!(st.k === 0 && pointer.y > bottom + 20)) start(); }, { passive: true });
      document.addEventListener("pointerout", (e) => { if (!e.relatedTarget) { pointer = null; start(); } }, { passive: true });
      const dust = hl.querySelector(".f-hlight__dust");
      if (dust) {
        let pad = 0, box = { w: 0, h: 0 };
        new ResizeObserver(() => { box = { w: hl.clientWidth, h: hl.clientHeight }; pad = (dust.clientWidth - box.w) / 2; }).observe(dust);
        fDust(dust, {
          count: (w, h) => w * h * fDust.density(8),
          rise: (w, h) => (h ? innerHeight / h : 1),
          shade: (x, y) => {
            if (!st.p || !st.k) return 0;
            const sx = x - pad, sy = y - pad;
            if (sx > 0 && sx < box.w && sy > 0 && sy < box.h) return 0;
            const ox = Math.max(-sx, 0, sx - box.w), oy = Math.max(-sy, 0, sy - box.h);
            const d = Math.min(Math.hypot(sx - st.p.x, sy - st.p.y) / (box.w * 0.35), 1);
            return Math.min(1, 1.4 * st.k * (1 - smooth(d)) * (1 - Math.min(Math.hypot(ox, oy) / pad, 1)));
          },
        });
      }
    }
  }

  // ── Phone menu ──
  const burger = document.querySelector(".f-burger"), menu = document.querySelector(".f-menu");
  if (burger && menu) {
    const main = document.querySelector(".f-main");
    const set = (open) => {
      burger.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (main) main.inert = open;
    };
    burger.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) set(false); });
  }

  // ── Footer: two layers of dust, a fog shader, and a grid that moves opposite the cursor by 5 and 3px (1.2s ui.out) ──
  const footer = document.querySelector(".f-footer");
  if (footer) {
    footer.querySelectorAll(".f-fscene__dust").forEach((c) => {
      const near = c.classList.contains("--near");
      const patch = near ? 9400 : 2000;
      fDust(c, {
        count: (w, h) => (w * h / patch) * (phone ? 3 : 1),
        shade: (x, y, d) => Math.max(0, Math.min(1, (d.y - 0.15) * 4, (0.97 - d.y) * 6, d.x * 25, (1 - d.x) * 25)),
        size: (near ? 1.15 : 1) * (phone ? 0.6 : 1),
        maxDpr: phone ? 2 : 1,
      });
    });
    const grid = footer.querySelector(".f-fscene__grid");
    if (grid && hover && !reduce && window.gsap) {
      const at = { x: 0, y: 0 };
      const put = () => { grid.style.translate = `${at.x}px ${at.y}px`; };
      const qx = gsap.quickTo(at, "x", { duration: 1.2, ease: "ui.out", onUpdate: put });
      const qy = gsap.quickTo(at, "y", { duration: 1.2, ease: "ui.out", onUpdate: put });
      let seen = false;
      new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(grid);
      addEventListener("pointermove", (e) => { if (!seen) return; qx((e.clientX / innerWidth * 2 - 1) * -5); qy((e.clientY / innerHeight * 2 - 1) * -3); }, { passive: true });
    }
    const fog = footer.querySelector(".f-fscene__fog");
    if (fog) fogShader(fog);
  }

  // Fog — bake 4 layers of fbm flowing over time, then keep only the .42 to .8 range for sparse wisps of mist, denser above the bottom 35%, shifting from a cool color to amber from the right 45%
  function fogShader(canvas) {
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    if (!gl) return;
    const tone = (v) => {
      const p = document.createElement("i"); p.style.color = `var(${v})`; document.body.append(p);
      const c = document.createElement("canvas"); c.width = c.height = 1;
      const x = c.getContext("2d"); x.fillStyle = getComputedStyle(p).color; x.fillRect(0, 0, 1, 1); p.remove();
      const d = x.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
    };
    const cold = tone("--site-cold-hot"), warm = tone("--site-warm-mid");
    const vs = "attribute vec2 p; varying vec2 uv; void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
    const fs = `precision mediump float; varying vec2 uv; uniform float time, aspect, strength; uniform vec3 cold, warm;
      float h(vec2 q){ return fract(sin(dot(q, vec2(91.7, 233.3))) * 51217.13); }
      float n(vec2 q){ vec2 i = floor(q), f = fract(q); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(h(i), h(i + vec2(1.0, 0.0)), u.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), u.x), u.y); }
      float fbm(vec2 q){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * n(q); q = q * 2.03 + vec2(3.1, 7.7); a *= 0.5; } return v; }
      void main(){
        vec2 q = vec2(uv.x * aspect, uv.y) * 2.2;
        vec2 drift = vec2(time * 0.032, time * 0.007);
        vec2 warp = vec2(fbm(q + drift), fbm(q + vec2(4.6, 2.1) - drift * 0.6));
        float mist = smoothstep(0.42, 0.8, fbm(q * 0.9 + warp * 1.6 + vec2(time * 0.02, 0.0)));
        float low = smoothstep(1.0, 0.35, uv.y) * smoothstep(0.0, 0.12, uv.y);
        float a = mist * low * strength;
        vec3 c = mix(cold, warm, smoothstep(0.55, 1.0, uv.x));
        a = clamp(a + (h(gl_FragCoord.xy + time) - 0.5) / 255.0, 0.0, 1.0);
        gl_FragColor = vec4(c * a, a);
      }`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {}; ["time", "aspect", "strength", "cold", "warm"].forEach((k) => (u[k] = gl.getUniformLocation(prog, k)));
    gl.uniform1f(u.strength, 0.5); gl.uniform3fv(u.cold, cold); gl.uniform3fv(u.warm, warm);
    const t0 = performance.now();
    let raf = 0, last = 0, on = false;
    const frame = (now = performance.now()) => { gl.uniform1f(u.time, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const loop = (now) => { raf = requestAnimationFrame(loop); if (now - last < 1000 / 30) return; last = now; frame(now); };
    const size = () => {
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * 0.25));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * 0.25));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(u.aspect, canvas.clientWidth / Math.max(1, canvas.clientHeight));
      frame();
    };
    new ResizeObserver(size).observe(canvas);
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && !reduce && !raf) raf = requestAnimationFrame(loop); if (!on) { cancelAnimationFrame(raf); raf = 0; } }).observe(canvas);
    size();
  }
})();
