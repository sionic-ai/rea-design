(() => {
  const kw = (window.kw = window.kw || {});
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  kw.reduce = reduce;
  kw.fine = fine;

  // Resolves skin variables (including color-mix · oklch(from …)) into actual colors and hands them to canvas · WebGL — read by painting on a 1px canvas
  const probe = document.createElement("i");
  probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  const pix = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  kw.color = (name) => {
    if (!probe.isConnected) document.body.appendChild(probe);
    probe.style.color = `var(${name})`;
    pix.clearRect(0, 0, 1, 1);
    pix.fillStyle = getComputedStyle(probe).color;
    pix.fillRect(0, 0, 1, 1);
    const d = pix.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  };
  kw.css = (name) => getComputedStyle(probe.isConnected ? probe : document.body).getPropertyValue(name);

  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

  // Smooth scrolling: smooth-scrollbar 8.8.4 as in the original, damping .1. ScrollTrigger uses this panel as its scroller.
  const scrollEl = document.querySelector("[data-scrollbar]");
  const bar = Scrollbar.init(scrollEl, { damping: 0.1, renderByPixels: true, alwaysShowTracks: false, continuousScrolling: true, delegateTo: document });
  kw.bar = bar;
  ScrollTrigger.scrollerProxy(scrollEl, {
    scrollTop(v) { if (arguments.length) bar.scrollTop = v; return bar.scrollTop; },
    getBoundingClientRect() { return { top: 0, left: 0, width: innerWidth, height: innerHeight }; },
  });
  ScrollTrigger.defaults({ scroller: scrollEl, pinType: "transform" });
  bar.addListener(ScrollTrigger.update);
  // After the pinned section extends the pin-spacer, re-measure the panel size so it scrolls all the way down
  ScrollTrigger.addEventListener("refresh", () => bar.update());
  kw.scrollTo = (y, ms = 1200) => bar.scrollTo(0, y, ms);
  window.__kwScrollbar = bar;

  // Blocks wheel and touch while the loader or age gate is up (the original also captures wheel outside the gate in the capture phase)
  let locked = true;
  // While the door floats, the body behind it can’t be touched or focused (original inert)
  const behind = [".kw-header", ".kw-mobile-menu", ".kw-picker", ".kw-scroll"].map((s) => document.querySelector(s)).filter(Boolean);
  behind.forEach((el) => (el.inert = true));
  const block = (e) => { if (!locked) return; if (e.target instanceof Element && e.target.closest(".kw-gate")) return; e.preventDefault(); e.stopPropagation(); };
  addEventListener("click", (e) => { if (locked && !(e.target instanceof Element && e.target.closest(".kw-gate"))) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  addEventListener("wheel", block, { capture: true, passive: false });
  addEventListener("touchmove", block, { capture: true, passive: false });

  // Loader: walks to 10% in 2 seconds, if confirmation is needed, the center cup vanishes in 1 second, then .5 seconds later the door rises in 1 second.
  // On confirm the door closes in 1s and the cup returns, 85→100% over 2s (power1.out), then the whole panel lifts up over 2.1s (power4.inOut)
  const loader = document.querySelector(".kw-loader");
  const center = loader.querySelector("[data-loader-center]");
  const percent = loader.querySelector("[data-loader-percent]");
  const gate = loader.querySelector(".kw-gate");
  const KEY = "kw:age-ok";
  const verified = () => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } };
  const paint = (v) => { percent.textContent = `${Math.round(v)}%`; loader.style.setProperty("--loader-progress", `${v}%`); };
  const ease = "power2.inOut";
  const done = () => {
    paint(100);
    locked = false;
    behind.forEach((el) => (el.inert = false));
    root.dataset.kwLoaded = "true";
    gsap.to(loader, { yPercent: -100, duration: reduce ? 0 : 2.1, ease: "power4.inOut", onComplete: () => { loader.style.display = "none"; } });
    window.dispatchEvent(new Event("kw:ready"));
  };
  // The number goes straight up to 10% in the first 2s, then heads toward 100% along a cosine (original: as much as images load in the background). Even while the door is up it climbs hidden to 85%.
  const p = { v: 0 };
  const fill = gsap.timeline({ paused: true, onUpdate: () => paint(p.v) })
    .to(p, { v: 10, duration: 2, ease: "none" })
    .to(p, { v: 100, duration: 3, ease: "sine.inOut" });
  const finish = () => { fill.kill(); gsap.to(p, { v: 100, duration: reduce ? 0 : 2, ease: "power1.out", onUpdate: () => paint(p.v), onComplete: done }); };
  if (reduce) { paint(100); done(); }
  else if (verified()) { fill.eventCallback("onComplete", done).play(); }
  else {
    // At 2s (10%) the cup disappears and the door appears, and the number rises hidden until 85% (the .732 point of the cosine range) and stops
    fill.call(() => {
      gsap.to(center, { autoAlpha: 0, duration: 1, ease, onComplete: () => {
        gate.hidden = false;
        gsap.delayedCall(0.5, () => { gsap.to(gate, { opacity: 1, duration: 1, ease }); gate.focus({ preventScroll: true }); });
      } });
    }, null, 2);
    fill.addPause(2 + 3 * 0.732);
    fill.play();
  }
  gate.querySelector("[data-gate-yes]").addEventListener("click", () => {
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    gate.style.pointerEvents = "none";
    gsap.to(gate, { opacity: 0, duration: 1, ease, onComplete: () => {
      gsap.delayedCall(0.5, () => {
        gate.hidden = true;
        if (p.v < 85) { fill.kill(); p.v = 85; paint(85); }
        gsap.to(center, { autoAlpha: 1, duration: 1, ease });
        finish();
      });
    } });
  });
  // ”No”: the description changes to a decline notice and only a single ”Go back” button remains
  const desc = gate.querySelector(".kw-gate__desc"), saidDesc = desc.innerHTML;
  const no = gate.querySelector("[data-gate-no]"), yesBtn = gate.querySelector("[data-gate-yes]"), back = gate.querySelector("[data-gate-back]");
  const reject = (on) => {
    desc.innerHTML = on ? "Your one-line notice that entry is not allowed goes here." : saidDesc;
    yesBtn.hidden = no.hidden = on;
    back.hidden = !on;
    gate.focus({ preventScroll: true });
  };
  no.addEventListener("click", () => reject(true));
  back.addEventListener("click", () => reject(false));

  // Pill button: on hover, two sets of text roll up and swap over .55s (cubic-bezier(.22,1,.36,1)), and the arrow breathes sideways in .275s steps, folding into a chevron in .32s
  CustomEase.create("kwRoll", "M0,0 C0.22,1 0.36,1 1,1");
  CustomEase.create("kwArrow", "M0,0 C0.58,0 0.88,0.72 1,1");
  const ARROW = "M1 11 L1 5 L11 5 M7 1 L11 5 L7 9", CHEVRON = "M5 6 L5 6 L5 6 M5 3 L8 6 L5 9";
  const nums = (d) => d.match(/-?\d*\.?\d+/g).map(Number);
  const A0 = nums(ARROW), A1 = nums(CHEVRON);
  const morph = (t) => { let i = 0; return ARROW.replace(/-?\d*\.?\d+/g, () => { const v = A0[i] + (A1[i] - A0[i]) * t; i++; return String(+v.toFixed(3)); }); };
  document.querySelectorAll("[data-roll-btn]").forEach((b) => {
    const cur = b.querySelector('[data-roll="current"]'), nxt = b.querySelector('[data-roll="next"]');
    if (!cur || !nxt) return;
    gsap.set(nxt, { yPercent: 100 });
    const arrow = b.querySelector("[data-roll-arrow]"), path = arrow?.querySelector("path");
    path?.setAttribute("d", ARROW);
    const k = { t: 0 };
    const tl = gsap.timeline({ paused: true, defaults: { duration: 0.55, ease: "kwRoll" } })
      .to(cur, { yPercent: -100 }, 0)
      .to(nxt, { yPercent: 0 }, 0);
    if (path) tl.to(k, { t: 1, duration: 0.32, ease: "kwArrow", onUpdate: () => path.setAttribute("d", morph(k.t)) }, 0)
      .to(arrow, { scaleX: 0.85, duration: 0.275 }, 0)
      .to(arrow, { scaleX: 1, duration: 0.275 }, 0.275);
    const on = () => tl.play(), off = () => tl.reverse();
    b.addEventListener("pointerenter", on); b.addEventListener("pointerleave", off);
    b.addEventListener("focusin", on); b.addEventListener("focusout", off);
  });

  // Header line: scrolling down even slightly clears the left menu and center sentence. Over light sections the text goes dark (index.js sets data-tone)
  const header = document.querySelector(".kw-header");
  bar.addListener(({ offset }) => { header.toggleAttribute("data-scrolled", offset.y > 40); });

  // Phone menu: panel clip-path .72s power4.inOut → close button .36s → links .48s stagger .065 → bottom .42s
  const menu = document.querySelector(".kw-mobile-menu");
  const dots = document.querySelector(".kw-dots");
  if (menu && dots) {
    const q = gsap.utils.selector(menu);
    gsap.set(q("[data-mobile-menu-close]"), { autoAlpha: 0, rotate: -45, scale: 0.88 });
    gsap.set(q("[data-mobile-menu-link]"), { autoAlpha: 0, yPercent: 42 });
    gsap.set(q("[data-mobile-menu-footer]"), { autoAlpha: 0, y: 24 });
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" }, onReverseComplete: () => gsap.set(menu, { pointerEvents: "none" }) })
      .set(menu, { autoAlpha: 1, pointerEvents: "auto" })
      .to(menu, { clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 0.72, ease: "power4.inOut" })
      .to(q("[data-mobile-menu-close]"), { autoAlpha: 1, rotate: 0, scale: 1, duration: 0.36 }, "-=0.36")
      .to(q("[data-mobile-menu-link]"), { autoAlpha: 1, yPercent: 0, duration: 0.48, stagger: 0.065, ease: "power4.out" }, "-=0.24")
      .to(q("[data-mobile-menu-footer]"), { autoAlpha: 1, y: 0, duration: 0.42 }, "-=0.3");
    const set = (open) => {
      dots.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      open ? tl.timeScale(1).play() : tl.timeScale(1.15).reverse();
    };
    dots.addEventListener("click", () => set(true));
    q("[data-mobile-menu-close]")[0].addEventListener("click", () => set(false));
    q("a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  // Language switch: the original moves to another language version of the same shape without a screen transition — here we only change which side is marked on (other language addresses are in href)
  document.querySelectorAll("[data-lang-toggle]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    root.toggleAttribute("data-lang-alt");
  }));

  // Same-page anchors are moved to the smooth-scroll board
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    const t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    const y = kw.anchorY ? kw.anchorY(id, t) : bar.scrollTop + t.getBoundingClientRect().top;
    if (y != null) kw.scrollTo(y, 1600);
  });

  // Bottom center pill: open and close, rolling the current wine name (the original letter roll of .42s power3.in exit → .58s power4.out entry, done on a single name line)
  const picker = document.querySelector(".kw-picker");
  if (picker) {
    const btn = picker.querySelector(".kw-picker__btn");
    const now = picker.querySelector(".kw-picker__now");
    const next = picker.querySelector(".kw-picker__next");
    const one = picker.querySelector(".kw-picker__thumb--one");
    const names = [...picker.querySelectorAll("[data-go-wine] span[lang]")].map((s) => s.textContent);
    const all = now.textContent;
    let cur = -1;
    const open = (v) => { picker.toggleAttribute("data-open", v); btn.setAttribute("aria-expanded", String(v)); };
    btn.addEventListener("click", () => open(!picker.hasAttribute("data-open")));
    document.addEventListener("click", (e) => { if (!picker.contains(e.target)) open(false); });
    picker.querySelectorAll("[data-go-wine]").forEach((b) => b.addEventListener("click", () => { open(false); kw.goWine?.(+b.dataset.goWine); }));
    kw.setPickerWine = (i) => {
      if (i === cur) return;
      cur = i;
      next.textContent = i < 0 ? all : names[i];
      if (i >= 0) one.dataset.wine = String(i);
      picker.toggleAttribute("data-current", i >= 0);
      gsap.killTweensOf([now, next]);
      gsap.fromTo(now, { yPercent: 0 }, { yPercent: -100, duration: 0.42, ease: "power3.in" });
      gsap.fromTo(next, { yPercent: 100 }, { yPercent: 0, duration: 0.58, ease: "power4.out", delay: 0.18, onComplete: () => {
        now.textContent = next.textContent; gsap.set(now, { yPercent: 0 }); gsap.set(next, { yPercent: 100 });
      } });
    };
  }

  // Fluid light background — a stable fluid written with our own shader (velocity 128 cells · dye 512 cells, vorticity 10, pressure 20 iterations, velocity dissipation 2, dye dissipation 3.5, brush radius .005).
  // Sand-colored light spreads where the mouse passed and settles in a little over 1 second. Not drawn on touch devices or with reduced motion
  kw.fluid = (canvas, target) => {
    if (!canvas || reduce || !fine) return null;
    const gl = canvas.getContext("webgl2", { alpha: true, depth: false, stencil: false, antialias: false, premultipliedAlpha: true });
    if (!gl) return null;
    gl.getExtension("EXT_color_buffer_float");
    const linear = !!gl.getExtension("OES_texture_float_linear");
    const HF = gl.HALF_FLOAT;
    const VS = `#version 300 es
in vec2 p; out vec2 uv, l, r, t, b; uniform vec2 px;
void main(){ uv = p * .5 + .5; l = uv - vec2(px.x, 0.); r = uv + vec2(px.x, 0.); t = uv + vec2(0., px.y); b = uv - vec2(0., px.y); gl_Position = vec4(p, 0., 1.); }`;
    const head = "#version 300 es\nprecision highp float; precision highp sampler2D; in vec2 uv, l, r, t, b; out vec4 o; uniform vec2 px;\n";
    const FS = {
      copy: "uniform sampler2D a; uniform float k; void main(){ o = k * texture(a, uv); }",
      splat: "uniform sampler2D a; uniform float aspect, rad; uniform vec2 at; uniform vec3 c; void main(){ vec2 d = uv - at; d.x *= aspect; o = vec4(texture(a, uv).xyz + exp(-dot(d, d) / rad) * c, 1.); }",
      advect: "uniform sampler2D v, s; uniform float dt, diss; void main(){ vec2 q = uv - dt * texture(v, uv).xy * px; o = texture(s, q) / (1. + diss * dt); o.a = 1.; }",
      div: "uniform sampler2D v; void main(){ float L = texture(v, l).x, R = texture(v, r).x, T = texture(v, t).y, B = texture(v, b).y; vec2 c = texture(v, uv).xy; if (l.x < 0.) L = -c.x; if (r.x > 1.) R = -c.x; if (t.y > 1.) T = -c.y; if (b.y < 0.) B = -c.y; o = vec4(.5 * (R - L + T - B), 0., 0., 1.); }",
      curl: "uniform sampler2D v; void main(){ o = vec4(.5 * (texture(v, r).y - texture(v, l).y - texture(v, t).x + texture(v, b).x), 0., 0., 1.); }",
      vort: "uniform sampler2D v, w; uniform float k, dt; void main(){ float L = texture(w, l).x, R = texture(w, r).x, T = texture(w, t).x, B = texture(w, b).x, C = texture(w, uv).x; vec2 f = .5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); f /= length(f) + .0001; f *= k * C; f.y *= -1.; vec2 vel = texture(v, uv).xy + f * dt; o = vec4(clamp(vel, -1000., 1000.), 0., 1.); }",
      press: "uniform sampler2D p, d; void main(){ o = vec4((texture(p, l).x + texture(p, r).x + texture(p, b).x + texture(p, t).x - texture(d, uv).x) * .25, 0., 0., 1.); }",
      grad: "uniform sampler2D p, v; void main(){ vec2 vel = texture(v, uv).xy - vec2(texture(p, r).x - texture(p, l).x, texture(p, t).x - texture(p, b).x); o = vec4(vel, 0., 1.); }",
      show: "uniform sampler2D a; uniform vec3 tint; void main(){ vec3 c = texture(a, uv).rgb; float dx = length(texture(a, r).rgb) - length(texture(a, l).rgb), dy = length(texture(a, t).rgb) - length(texture(a, b).rgb); vec3 n = normalize(vec3(dx, dy, length(px))); c *= clamp(n.z + .7, .7, 1.); float flow = smoothstep(.015, .42, max(c.r, max(c.g, c.b))); float al = flow * .85; o = vec4(tint * al, al); }",
    };
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const vs = sh(gl.VERTEX_SHADER, VS);
    const P = {};
    for (const [k, src] of Object.entries(FS)) {
      const pr = gl.createProgram();
      gl.attachShader(pr, vs); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, head + src));
      gl.bindAttribLocation(pr, 0, "p"); gl.linkProgram(pr);
      const u = {};
      for (let i = 0, n = gl.getProgramParameter(pr, gl.ACTIVE_UNIFORMS); i < n; i++) { const a = gl.getActiveUniform(pr, i); u[a.name] = gl.getUniformLocation(pr, a.name); }
      P[k] = { pr, u };
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    const fbo = (w, h, ifmt, fmt, filter) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      for (const [p, v] of [[gl.TEXTURE_MIN_FILTER, filter], [gl.TEXTURE_MAG_FILTER, filter], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, p, v);
      gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, HF, null);
      const f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, f, w, h, at(u) { gl.activeTexture(gl.TEXTURE0 + u); gl.bindTexture(gl.TEXTURE_2D, tex); return u; } };
    };
    const dbl = (...a) => { let A = fbo(...a), B = fbo(...a); return { get r() { return A; }, get w() { return B; }, swap() { [A, B] = [B, A]; } }; };
    const res = (n) => { let a = gl.drawingBufferWidth / gl.drawingBufferHeight; if (a < 1) a = 1 / a; const lo = Math.round(n), hi = Math.round(n * a); return gl.drawingBufferWidth > gl.drawingBufferHeight ? [hi, lo] : [lo, hi]; };
    const blit = (t) => { if (t) { gl.viewport(0, 0, t.w, t.h); gl.bindFramebuffer(gl.FRAMEBUFFER, t.f); } else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); } gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); };
    let vel, dye, divg, curlT, pres, tint;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const w = Math.floor(canvas.clientWidth * dpr), h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width === w && canvas.height === h && vel) return;
      canvas.width = w; canvas.height = h;
      const filt = linear ? gl.LINEAR : gl.NEAREST;
      const [sw, sh2] = res(128), [dw, dh] = res(linear ? 512 : 256);
      vel = dbl(sw, sh2, gl.RG16F, gl.RG, filt);
      dye = dbl(dw, dh, gl.RGBA16F, gl.RGBA, filt);
      divg = fbo(sw, sh2, gl.R16F, gl.RED, gl.NEAREST);
      curlT = fbo(sw, sh2, gl.R16F, gl.RED, gl.NEAREST);
      pres = dbl(sw, sh2, gl.R16F, gl.RED, gl.NEAREST);
    };
    const lum = () => { const c = kw.color("--kf-raised"); tint = c; return 0.5 * (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]); };
    let base = lum();
    const pick = () => { const e = Math.min(Math.max(base * (1 + (Math.random() - 0.5) * 0.14), 0), 1); return [e, e, e]; };
    const splat = (x, y, dx, dy, c) => {
      const aspect = canvas.width / canvas.height;
      gl.useProgram(P.splat.pr);
      gl.uniform1i(P.splat.u.a, vel.r.at(0)); gl.uniform1f(P.splat.u.aspect, aspect); gl.uniform2f(P.splat.u.at, x, y);
      gl.uniform3f(P.splat.u.c, dx, dy, 0); gl.uniform1f(P.splat.u.rad, aspect > 1 ? 0.005 * aspect : 0.005);
      blit(vel.w); vel.swap();
      gl.uniform1i(P.splat.u.a, dye.r.at(0)); gl.uniform3f(P.splat.u.c, c[0], c[1], c[2]);
      blit(dye.w); dye.swap();
    };
    const m = { x: 0, y: 0, px: 0, py: 0, dx: 0, dy: 0, moved: false, c: pick() };
    const move = (cx, cy) => {
      const rc = canvas.getBoundingClientRect();
      m.px = m.x; m.py = m.y;
      m.x = (cx - rc.left) / rc.width; m.y = 1 - (cy - rc.top) / rc.height;
      const a = canvas.width / canvas.height;
      m.dx = a < 1 ? (m.x - m.px) * a : m.x - m.px;
      m.dy = a > 1 ? (m.y - m.py) / a : m.y - m.py;
      m.moved = m.x >= 0 && m.x <= 1 && m.y >= 0 && m.y <= 1;
    };
    const onMove = (e) => move(e.clientX, e.clientY);
    const onDown = (e) => { move(e.clientX, e.clientY); splat(m.x, m.y, 10 * (Math.random() - 0.5), 30 * (Math.random() - 0.5), pick()); };
    let seen = true, last = performance.now(), tick = 0, raf = 0, dead = false;
    const io = new IntersectionObserver(([e]) => { seen = !!e?.isIntersecting; last = performance.now(); });
    const step = () => {
      if (dead) return;
      raf = requestAnimationFrame(step);
      if (!seen) return;
      const now = performance.now(), dt = Math.min(Math.max(0, (now - last) / 1000), 1 / 60);
      last = now;
      size();
      if ((tick += 10 * dt) >= 1) { tick = 0; m.c = pick(); }
      if (m.moved) { m.moved = false; splat(m.x, m.y, 6000 * m.dx, 6000 * m.dy, m.c); }
      gl.disable(gl.BLEND);
      const px = (t) => [1 / t.w, 1 / t.h];
      const use = (k, t) => { gl.useProgram(P[k].pr); gl.uniform2f(P[k].u.px, ...px(t)); return P[k].u; };
      let u = use("curl", vel.r); gl.uniform1i(u.v, vel.r.at(0)); blit(curlT);
      u = use("vort", vel.r); gl.uniform1i(u.v, vel.r.at(0)); gl.uniform1i(u.w, curlT.at(1)); gl.uniform1f(u.k, 10); gl.uniform1f(u.dt, dt); blit(vel.w); vel.swap();
      u = use("div", vel.r); gl.uniform1i(u.v, vel.r.at(0)); blit(divg);
      u = use("copy", pres.r); gl.uniform1i(u.a, pres.r.at(0)); gl.uniform1f(u.k, 0.1); blit(pres.w); pres.swap();
      u = use("press", pres.r); gl.uniform1i(u.d, divg.at(0));
      for (let i = 0; i < 20; i++) { gl.uniform1i(u.p, pres.r.at(1)); blit(pres.w); pres.swap(); }
      u = use("grad", vel.r); gl.uniform1i(u.p, pres.r.at(0)); gl.uniform1i(u.v, vel.r.at(1)); blit(vel.w); vel.swap();
      u = use("advect", vel.r); gl.uniform1i(u.v, vel.r.at(0)); gl.uniform1i(u.s, vel.r.at(0)); gl.uniform1f(u.dt, dt); gl.uniform1f(u.diss, 2); blit(vel.w); vel.swap();
      gl.uniform1i(u.v, vel.r.at(0)); gl.uniform1i(u.s, dye.r.at(1)); gl.uniform1f(u.diss, 3.5); blit(dye.w); dye.swap();
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.BLEND);
      u = use("show", { w: gl.drawingBufferWidth, h: gl.drawingBufferHeight });
      gl.uniform1i(u.a, dye.r.at(0)); gl.uniform3f(u.tint, tint[0], tint[1], tint[2]);
      blit(null);
    };
    size();
    for (let i = 0; i < 6; i++) splat(Math.random(), Math.random(), 900 * (Math.random() - 0.5), 900 * (Math.random() - 0.5), pick());
    io.observe(canvas);
    const tgt = target || window;
    tgt.addEventListener("mousemove", onMove, { passive: true });
    tgt.addEventListener("mousedown", onDown, { passive: true });
    raf = requestAnimationFrame(step);
    return () => { dead = true; cancelAnimationFrame(raf); io.disconnect(); tgt.removeEventListener("mousemove", onMove); tgt.removeEventListener("mousedown", onDown); };
  };
})();
