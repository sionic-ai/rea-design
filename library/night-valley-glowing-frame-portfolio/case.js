// Three things open on press — the ‹View Work› case plate (a WebGL plate where a cell moves into the plate and grows + text in the plate rises in sequence + pull at the end to close),
// The ”Join the Production” window (the line rises late, and the text around the cursor darkens then returns), and ”See More Work” (fills the line, and cells rise from below four at a time).
// Values are transcribed from the original bundle’s open/close table (start, length, curve)
(() => {
  const OR = (window.OR = window.OR || {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const bez = (n, a) => (window.CustomEase ? CustomEase.create(n, `M0,0 C${a[0]},${a[1]} ${a[2]},${a[3]} 1,1`) : "power2.inOut");
  const E = {
    travel: bez("or-travel", [0.35, 0, 0.12, 1]),
    fadePage: bez("or-fade", [0.37, 0, 0.63, 1]),
    tintIn: bez("or-tint-in", [0.61, 1, 0.88, 1]),
    tintOut: bez("or-tint-out", [0.76, 0, 0.24, 1]),
    rise: bez("or-rise", [0.14, 0.61, 0.2, 1]),
    btn: bez("or-btn", [0.14, 0.61, 0, 0.94]),
    grow: bez("or-grow", [0.33, 1, 0.68, 1]),
    away: bez("or-away", [0.32, 0, 0.67, 0]),
    back: bez("or-back", [0.35, 0, 0.15, 1]),
    backX: bez("or-back-x", [0.32, 0, 0.23, 1]),
    backWave: bez("or-back-wave", [0.45, 0, 0.55, 1]),
    ripple: bez("or-ripple", [0.5, 1, 0.89, 1]),
    copy: window.CustomEase ? CustomEase.create("or-copy", "M0,0 C0.11,0.494 0.073,0.674 0.282,0.813 0.468,0.936 0.679,1 1,1") : "power3.out",
  };
  const rgb = (expr) => (window.ORScene?.rgbOf ? window.ORScene.rgbOf(expr) : [0.5, 0.5, 0.5]);

  /* ── Moving plate — a grid plate (32×24) ripples and grows as it moves from the cell to the work plate position ── */
  const MORPH_VS = `#version 300 es
in vec2 aUV;
uniform vec4 uA, uB;     // Cell · panel position (left, top, width, height, screen px)
uniform vec2 uView;
uniform float uTravel, uX, uGrow, uWave, uLag;
uniform vec3 uRipple;    // Fringe (0 top … 1 bottom) · strength · width
out vec2 vUV; out vec2 vSize; out float vShade;
void main(){
  vec2 uv = aUV;
  vec2 ca = uA.xy + uA.zw * .5, cb = uB.xy + uB.zw * .5;
  // Leading edge first, tail later — like cloth being pulled
  float up = cb.y < ca.y ? 1. : 0.;
  float trail = mix(1. - uv.y, uv.y, up);
  float t = clamp(uTravel * (1. + uLag) - uLag * trail, 0., 1.);
  vec2 c = vec2(mix(ca.x, cb.x, uX), mix(ca.y, cb.y, t));
  vec2 sz = mix(uA.zw, uB.zw, uGrow);
  vec2 p = c + (uv - .5) * sz;
  float w = sin(3.14159 * uWave);
  p.x += 24. * w * sin(uv.y * 6.2832 - uWave * 6.2832);
  float rp = uRipple.y * exp(-pow((uv.y - uRipple.x) / max(uRipple.z, .001), 2.));
  p += (uv - .5) * sz * rp;
  vShade = rp * 6. + .08 * w * sin(uv.y * 6.2832 - uWave * 6.2832 + 1.57);
  vUV = uv; vSize = sz;
  gl_Position = vec4(p.x / uView.x * 2. - 1., 1. - p.y / uView.y * 2., 0., 1.);
}`;
  const MORPH_FS = `#version 300 es
precision highp float;
in vec2 vUV; in vec2 vSize; in float vShade;
uniform vec3 uFill, uLine; uniform float uRadius, uAlpha;
out vec4 o;
void main(){
  vec2 q = (vUV - .5) * vSize;
  vec2 b = vSize * .5 - uRadius;
  float d = length(max(abs(q) - b, 0.)) - uRadius;
  float a = clamp(.5 - d, 0., 1.) * uAlpha;
  vec2 px = vUV * vSize;
  float k = vSize.y / max(vSize.x, 1.);
  float l1 = abs(px.y - px.x * k) / sqrt(1. + k * k), l2 = abs(px.y - (vSize.x - px.x) * k) / sqrt(1. + k * k);
  float line = clamp(1. - min(l1, l2), 0., 1.);
  vec3 c = mix(uFill, uLine, line * .6) * (1. + vShade);
  o = vec4(c * a, a);
}`;

  function morphLayer(canvas) {
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, MORPH_VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, MORPH_FS));
    gl.linkProgram(pr);
    const U = {};
    const u = (n) => (U[n] ??= gl.getUniformLocation(pr, n));
    const C = 32, R = 24, uv = [], idx = [];
    for (let j = 0; j <= R; j++) for (let i = 0; i <= C; i++) uv.push(i / C, j / R);
    for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) { const a = j * (C + 1) + i, b = a + 1, c = a + C + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "aUV");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    let colors = null;
    const size = () => {
      const r = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * r);
      canvas.height = Math.round(innerHeight * r);
    };
    return {
      paint() { colors = { fill: rgb("color-mix(in oklab, var(--kf-ink) 10%, var(--kf-bg))"), line: rgb("var(--kf-line)") }; },
      draw(s) {
        if (canvas.width !== Math.round(innerWidth * Math.min(devicePixelRatio || 1, 2))) size();
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (!s) return;
        if (!colors) this.paint();
        gl.useProgram(pr);
        gl.bindVertexArray(vao);
        gl.uniform4f(u("uA"), ...s.a); gl.uniform4f(u("uB"), ...s.b);
        gl.uniform2f(u("uView"), innerWidth, innerHeight);
        gl.uniform1f(u("uTravel"), s.travel); gl.uniform1f(u("uX"), s.x); gl.uniform1f(u("uGrow"), s.grow);
        gl.uniform1f(u("uWave"), s.wave); gl.uniform1f(u("uLag"), 0.15);
        gl.uniform3f(u("uRipple"), s.front, s.strength, 0.22);
        gl.uniform3f(u("uFill"), ...colors.fill); gl.uniform3f(u("uLine"), ...colors.line);
        gl.uniform1f(u("uRadius"), s.radius * s.grow); gl.uniform1f(u("uAlpha"), s.alpha);
        gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      },
    };
  }

  /* ── Work panel ── */
  const inset = (w) => Math.round(Math.min(48, Math.max(12, 0.03 * w)));
  const radius = (w) => (w >= 768 ? 16 : 12);
  // Pull to close — it closes at 600px of extra scrolling past the end (scrolling up halves it), and the indicator chases 1-(1-x)^2.2 by .06 each step. On release it returns over .6s after .3s
  const PULL = { distance: 600, touch: 130, ease: 2.2, follow: 0.06, rest: 0.3, spring: 0.6, travel: 0.12 };

  function bootCase() {
    const ov = document.querySelector("[data-case-ov]");
    if (!ov) return;
    const canvas = ov.querySelector("[data-case-morph]"), panel = ov.querySelector("[data-case-panel]"), inner = ov.querySelector("[data-case-inner]");
    const closeBtn = ov.querySelector("[data-case-close]"), pullBtn = ov.querySelector("[data-case-pull]"), arc = ov.querySelector("[data-case-arc]");
    const head = ov.querySelector(".or-case__head"), [eyebrow, title, desc] = head ? [...head.children] : [];
    let gl = null;
    try { gl = morphLayer(canvas); } catch (e) { gl = null; }
    // Draw once when setting up the shader — compiling on first press would freeze the screen
    gl?.draw(null);
    const sheet = { a: [0, 0, 1, 1], b: [0, 0, 1, 1], travel: 0, x: 0, grow: 0, wave: 0, front: 0, strength: 0, radius: 16, alpha: 1 };
    let phase = "closed", src = null, tl = null, caseLenis = null, raf = 0, split = [];
    const loop = () => { gl?.draw(sheet); raf = requestAnimationFrame(loop); };
    const startDraw = () => { cancelAnimationFrame(raf); canvas.style.visibility = "visible"; loop(); };
    const stopDraw = () => { cancelAnimationFrame(raf); gl?.draw(null); canvas.style.visibility = "hidden"; };
    // Like the original, sections outside the Work section, the Work header, other cells, ”See more,” and the footer clear away in .35s. The description of the cell moving over goes too
    const pageEls = () => [...document.querySelectorAll("main > section:not(.or-cases), .or-cases .or-case__head, .or-cases .or-frame, .or-more, .or-ground, .or-floor"), src?.closest(".or-frame")?.querySelector(".or-caption")]
      .filter((el) => el && (!src || !el.contains(src)));
    const rectOf = (el) => { const r = el.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; };
    const panelRect = () => { const w = document.documentElement.clientWidth, i = inset(w); return [i, i, w - 2 * i, innerHeight - 2 * i]; };
    const setGeom = () => {
      const w = document.documentElement.clientWidth;
      ov.style.setProperty("--inset", `${inset(w)}px`);
      ov.style.setProperty("--radius", `${radius(w)}px`);
      sheet.radius = radius(w);
    };

    // In-panel scroll — separate smooth scroll per panel as in the original (lerp .12 · wheel .9)
    const pull = { u: 0, shown: 0, last: 0 };
    // The panel end is measured by the panel’s own height — Lenis set up on a hidden panel held the end (limit) as 0 on first open and closed it immediately
    const atEnd = () => panel.scrollHeight - panel.clientHeight - (caseLenis ? caseLenis.targetScroll : panel.scrollTop) < 2;
    const pullTick = () => {
      if (phase !== "open") return;
      if (pull.u > 0 && performance.now() - pull.last > PULL.rest * 1000 && !gsap.isTweening(pull)) gsap.to(pull, { u: 0, duration: PULL.spring, ease: "power2.out" });
      const target = 1 - (1 - Math.min(1, pull.u / PULL.distance)) ** PULL.ease;
      pull.shown += (target - pull.shown) * (reduce ? 1 : Math.min(1, PULL.follow * gsap.ticker.deltaRatio()));
      arc?.style.setProperty("stroke-dashoffset", (1 - pull.shown).toFixed(4));
      pullBtn?.style.setProperty("--pull", pull.shown.toFixed(3));
      inner.style.translate = pull.shown > 0.001 ? `0 ${(-pull.shown * PULL.travel * panel.clientHeight).toFixed(2)}px` : "";
      if (pull.u >= PULL.distance) close();
    };
    const feed = (dy) => {
      if (phase !== "open") return;
      if (dy < 0) { if (pull.u > 0) { gsap.killTweensOf(pull); pull.u = Math.max(0, pull.u + 2 * dy); pull.last = performance.now(); } return; }
      if (!atEnd()) return;
      gsap.killTweensOf(pull);
      pull.u = Math.min(PULL.distance, pull.u + dy);
      pull.last = performance.now();
    };
    panel.addEventListener("wheel", (e) => feed(e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? panel.clientHeight : 1)), { passive: true });
    // The finger closes when dragged 130px from the end
    let ty = null;
    panel.addEventListener("touchstart", (e) => (ty = e.touches[0]?.clientY ?? null), { passive: true });
    panel.addEventListener("touchmove", (e) => { const y = e.touches[0]?.clientY; if (ty == null || y == null) return; feed(((ty - y) * PULL.distance) / PULL.touch); ty = y; }, { passive: true });

    const reveal = () => {
      const t = gsap.timeline();
      const at = (s) => Math.max(0, s - 0.47);
      const block = (els, from, start, dur, each = 0) => {
        if (!els.length) return;
        t.fromTo(els, { y: from }, { y: 0, duration: dur, ease: E.rise, stagger: each }, at(start));
        t.fromTo(els, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: E.rise, stagger: each }, at(start));
      };
      const lines = (el) => {
        if (!el || !window.SplitText) return el ? [el] : [];
        const s = new SplitText(el, { type: "lines", linesClass: "or-ov-line" });
        split.push(s);
        return s.lines;
      };
      block([eyebrow].filter(Boolean), 60, 0.47, 0.7255);
      const tl1 = lines(title);
      t.fromTo(tl1, { y: 120 }, { y: 0, duration: 0.6733, ease: E.rise, stagger: 0.05 }, at(0.5122));
      t.fromTo(tl1, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6733, ease: E.rise, stagger: 0.05 }, at(0.5));
      const dl = lines(desc);
      block(dl, 60, 0.64, 0.8377, 0.0305);
      // Only the text and cells hanging in the first screen rise, those below stand from the start
      const vis = (el) => el.getBoundingClientRect().top < innerHeight;
      const texts = [...inner.querySelectorAll("[data-case-text]")], frames = [...inner.querySelectorAll(".or-frame")];
      gsap.set([...texts, ...frames].filter((el) => !vis(el)), { autoAlpha: 1, y: 0 });
      block(texts.filter(vis), 60, 0.62, 1.1, 0.04);
      block(frames.filter(vis), 48, 0.62, 0.6, 0.07);
      t.fromTo(closeBtn, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: E.btn }, at(0.5));
      t.eventCallback("onComplete", () => { split.forEach((s) => s.revert()); split = []; });
      return t;
    };

    function open(box) {
      if (phase !== "closed" || !box) return;
      phase = "opening";
      src = box;
      setGeom();
      OR.lenis?.stop();
      document.documentElement.dataset.caseOpen = "";
      ov.hidden = false;
      ov.setAttribute("aria-hidden", "false");
      ov.removeAttribute("data-covered");
      gsap.set(inner, { autoAlpha: 1, y: 0 });
      gsap.set([head, ...inner.querySelectorAll(".or-frame, [data-case-text], .or-case-ov__end")], { autoAlpha: 0 });
      gsap.set(closeBtn, { autoAlpha: 0 });
      panel.scrollTop = 0;
      caseLenis?.scrollTo(0, { immediate: true, force: true });
      gl?.paint();
      Object.assign(sheet, { a: rectOf(box), b: panelRect(), travel: 0, x: 0, grow: 0, wave: 0, front: 0, strength: 0, alpha: 1 });
      startDraw();
      gsap.set(box, { autoAlpha: 0 });
      tl?.kill();
      tl = gsap.timeline({ defaults: { overwrite: "auto" } });
      if (reduce) {
        Object.assign(sheet, { travel: 1, x: 1, grow: 1 });
        gsap.set(pageEls(), { opacity: 0 });
        gsap.set([head, ...inner.querySelectorAll(".or-frame, [data-case-text], .or-case-ov__end"), closeBtn], { autoAlpha: 1 });
        arrive();
        return;
      }
      tl.to(sheet, { travel: 1, duration: 0.85, ease: E.travel }, 0)
        .to(sheet, { x: 1, duration: 0.85, ease: E.travel }, 0)
        .to(sheet, { wave: 1, duration: 0.85, ease: "none" }, 0)
        .to(sheet, { grow: 1, duration: 0.425, ease: E.grow }, 0.425)
        .to(pageEls(), { opacity: 0, duration: 0.35, ease: E.fadePage }, 0)
        .fromTo(".or-scene", { "--tint": 0 }, { "--tint": 0.15, duration: 0.22, ease: E.tintIn }, 0.47)
        .set([head, ...inner.querySelectorAll(".or-case-ov__end")], { autoAlpha: 1 }, 0.47)
        .add(reveal(), 0.47)
        .call(arrive, [], 0.85);
    }
    function arrive() {
      phase = "open";
      ov.setAttribute("data-covered", "");
      stopDraw();
      caseLenis?.resize();
      caseLenis?.start();
      closeBtn.focus({ preventScroll: true });
    }
    function close() {
      if (phase !== "open") return;
      phase = "closing";
      pull.u = 0;
      caseLenis?.stop();
      split.forEach((s) => s.revert()); split = [];
      Object.assign(sheet, { a: rectOf(src), b: panelRect(), travel: 1, x: 1, grow: 1, wave: 0, front: 0, strength: 0, alpha: 1 });
      ov.removeAttribute("data-covered");
      startDraw();
      tl?.kill();
      const done = () => {
        stopDraw();
        ov.hidden = true;
        ov.setAttribute("aria-hidden", "true");
        inner.style.translate = "";
        arc?.style.setProperty("stroke-dashoffset", "1");
        pullBtn?.style.setProperty("--pull", "0");
        pull.shown = 0;
        gsap.set(src, { autoAlpha: 1 });
        gsap.set(".or-scene", { "--tint": 0 });
        delete document.documentElement.dataset.caseOpen;
        OR.lenis?.start();
        src.closest(".or-frame")?.querySelector(".or-frame__act button")?.focus({ preventScroll: true });
        phase = "closed";
      };
      if (reduce) { gsap.set(pageEls(), { opacity: 1 }); done(); return; }
      tl = gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: done });
      tl.to([head, inner.querySelector(".or-case-ov__end")], { autoAlpha: 0, y: -12, duration: 0.25, ease: E.away }, 0)
        .to(inner.querySelectorAll(".or-frame, [data-case-text]"), { autoAlpha: 0, duration: 0.25, ease: E.away }, 0)
        .to(closeBtn, { autoAlpha: 0, y: -12, duration: 0.25, ease: E.away }, 0)
        .to(sheet, { travel: 0, duration: 0.88, ease: E.back }, 0.25)
        .to(sheet, { x: 0, duration: 0.74, ease: E.backX }, 0.25)
        .to(sheet, { wave: 1, duration: 0.88, ease: E.backWave }, 0.25)
        .to(sheet, { grow: 0, duration: 0.44, ease: E.grow }, 0.25)
        .fromTo(sheet, { front: 0, strength: 0.025 }, { front: 1, strength: 0, duration: 1.2, ease: E.ripple }, 0.59)
        .to(".or-scene", { "--tint": 0, duration: 0.22, ease: E.tintOut }, 0.32)
        .to(pageEls(), { opacity: 1, duration: 0.5, ease: E.fadePage }, 0.71)
        .set(src, { autoAlpha: 1 }, 1.13)
        .to(sheet, { alpha: 0, duration: 0.3, ease: E.fadePage }, 1.13);
    }

    if (window.Lenis && !reduce) {
      caseLenis = new Lenis({ wrapper: panel, content: inner, lerp: 0.12, smoothWheel: true, wheelMultiplier: 0.9 });
      caseLenis.stop();
      gsap.ticker.add((t) => caseLenis.raf(t * 1000));
    }
    gsap.ticker.add(pullTick);
    document.addEventListener("click", (e) => {
      const b = e.target.closest?.(".or-cases .or-frame__act button");
      if (b) open(b.closest(".or-frame__box"));
    });
    closeBtn.addEventListener("click", close);
    pullBtn?.addEventListener("click", close);
    ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    addEventListener("resize", () => { if (phase === "open") setGeom(); });
  }

  /* ── Credits Window ── */
  function bootCredits() {
    const modal = document.querySelector("[data-credits]"), btn = document.querySelector(".or-credits");
    if (!modal || !btn) return;
    const content = modal.querySelector("[data-credits-content]"), closeBtn = modal.querySelector("[data-credits-close]");
    const play = document.querySelector(".or-play");
    let open = false, openedAt = 0, split = null, tl = null;
    const show = () => {
      if (open) return;
      open = true;
      openedAt = performance.now();
      OR.lenis?.stop();
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");
      gsap.to(btn, { autoAlpha: 0, duration: 0.6, delay: 0.5, ease: OR.out, overwrite: true });
      if (play) gsap.to(play, { autoAlpha: 0, duration: 0.2, ease: "power2.out", overwrite: true });
      if (OR.scene) gsap.to(OR.scene, { spin: 1, duration: reduce ? 0 : 1.6, ease: "power3.inOut", overwrite: true });
      tl?.kill();
      split?.revert();
      split = window.SplitText && !reduce ? new SplitText(content.children, { type: "lines, chars", linesClass: "or-split-line", charsClass: "or-cr-char" }) : null;
      tl = gsap.timeline();
      tl.set(modal, { autoAlpha: 1 });
      if (reduce) { tl.set(content, { "--halo": 1 }).set(closeBtn, { autoAlpha: 1, y: 0 }); return; }
      if (split) tl.fromTo(split.lines, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.04, ease: E.copy }, 1);
      tl.fromTo(content, { "--halo": 0 }, { "--halo": 1, duration: 1, ease: "power2.out" }, 1);
      tl.fromTo(closeBtn, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: E.copy }, 0.2);
    };
    const hide = () => {
      if (!open) return;
      open = false;
      btn.setAttribute("aria-expanded", "false");
      tl?.kill();
      const lines = split ? split.lines : [];
      tl = gsap.timeline({ onComplete: () => { split?.revert(); split = null; modal.hidden = true; modal.setAttribute("aria-hidden", "true"); OR.lenis?.start(); btn.focus({ preventScroll: true }); } });
      if (reduce) { tl.set(modal, { autoAlpha: 0 }); } else {
        tl.to(content, { "--halo": 0, duration: 0.45, ease: "power2.in" }, 0);
        if (lines.length) tl.to(lines, { autoAlpha: 0, y: -24, duration: 0.4, ease: "power2.in", stagger: 0.06 }, 0);
        tl.to(closeBtn, { autoAlpha: 0, y: 20, duration: 0.35, ease: "power2.in" }, 0);
        tl.to(modal, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, lines.length ? "-=0.15" : 0);
      }
      gsap.fromTo(btn, { y: 15, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: reduce ? 0 : 1.1, ease: E.copy, delay: reduce ? 0 : 1, overwrite: true });
      if (play) gsap.to(play, { autoAlpha: 1, duration: 0.3, delay: 0.3, ease: "power2.out", overwrite: true });
      if (OR.scene) gsap.to(OR.scene, { spin: 2, duration: reduce ? 0 : 0.8, ease: "power2.inOut", overwrite: true, onComplete: () => (OR.scene.spin = 0) });
    };
    btn.setAttribute("aria-haspopup", "dialog");
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", show);
    closeBtn.addEventListener("click", hide);
    // Once .3s has passed after the window opens, clicking anywhere outside the text closes it
    modal.addEventListener("click", (e) => { if (performance.now() - openedAt > 300 && !e.target.closest("[data-credits-content], [data-credits-close]")) hide(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
    // Characters within 100px of the cursor darken by distance (about half at the center), then return to the text color in 1.2s after .3s.
    if (fine && !reduce) {
      const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round((v + (b[i] - v) * k) * 255)).join(",")})`;
      const live = new Map();
      content.addEventListener("mousemove", (e) => {
        const ink = rgb("var(--kf-ink)"), bg = rgb("var(--kf-bg)");
        content.querySelectorAll(".or-cr-char").forEach((c) => {
          const r = c.getBoundingClientRect(), d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          if (d > 100) return;
          live.get(c)?.kill();
          gsap.set(c, { color: mix(ink, bg, 0.5 * (1 - d / 100)) });
          live.set(c, gsap.to(c, { color: mix(ink, bg, 0), duration: 1.2, delay: 0.3, ease: OR.out, onComplete: () => { live.delete(c); c.style.color = ""; } }));
        });
      });
    }
  }

  /* ── Load more work — fills the row to join four cells, new cells rise in turn (.1s) from .45 of the screen below over 1.6s ── */
  function bootMore() {
    const more = document.querySelector(".or-more"), btn = more?.querySelector("button"), grid = document.querySelector(".or-cases .or-grid");
    const batches = [...document.querySelectorAll("template[data-more-batch]")];
    if (!more || !btn || !grid) return;
    const arm = () => {
      if (!batches.length) { more.hidden = true; return; }
      if (reduce) { gsap.set(btn, { autoAlpha: 1, y: 0 }); return; }
      gsap.set(btn, { autoAlpha: 0, y: 60 });
      ScrollTrigger.create({ trigger: more, start: "top bottom", once: true, onEnter: () => gsap.to(btn, { autoAlpha: 1, y: 0, duration: 1.1, ease: E.copy, overwrite: true }) });
    };
    btn.addEventListener("click", () => {
      const tpl = batches.shift();
      if (!tpl) return;
      gsap.to(btn, { autoAlpha: 0, y: -12, duration: reduce ? 0 : 0.2, ease: "power2.in", overwrite: true, onComplete: () => {
        const figs = [...tpl.content.children].map((n) => n.cloneNode(true));
        figs.forEach((f) => grid.append(f));
        if (!reduce) gsap.set(figs, { autoAlpha: 0, y: innerHeight * 0.45 });
        requestAnimationFrame(() => {
          figs.forEach((f) => OR.frameMotion?.(f));
          ScrollTrigger.refresh();
          figs.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top).forEach((f, i) => {
            if (reduce) return;
            gsap.to(f, { y: 0, duration: 1.6, delay: 0.1 * i, ease: "power4.out" });
            gsap.to(f, { autoAlpha: 1, duration: 0.35, delay: 0.1 * i, ease: "power2.out" });
          });
          arm();
        });
      } });
    });
    if (!reduce) arm();
  }

  OR.bootCase = bootCase;
  OR.bootCredits = bootCredits;
  OR.bootMore = bootMore;
})();
