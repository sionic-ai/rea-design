// First page staging — the original values were carried over from the same-named original functions (preloader·initVideoScrub·initWeKnow*·initKpVideoScrub·initGlassSplit·initFooterBottleReveal).
(() => {
  const { PB } = window;
  const clamp = gsap.utils.clamp;

  // ---------- Hero glass bubble shader ----------
  // The original is a scene-editor graphic, so we redraw it with our own shader: thin glowing outlines and spectral dispersion on two large blobs over a teal band.
  // Measured, the original scene does not move with time or cursor (cursor-sweep response 0%), so it is redrawn only when the panel size changes
  const HERO_FS = `precision highp float;
uniform vec2 u_res, u_c1, u_c2, u_r; uniform vec3 u_deep, u_deeper, u_mint, u_hi;
float rim(float d, float w){ return exp(-abs(d) * w); }
void main(){
  vec2 p = (gl_FragCoord.xy - .5 * u_res) / u_res.y;
  vec2 c1 = u_c1, c2 = u_c2;
  float r1 = u_r.x, r2 = u_r.y;
  float y = gl_FragCoord.y / u_res.y;
  vec3 col = mix(u_mint, u_deep, smoothstep(.0, .62, y));
  col = mix(col, u_deeper, smoothstep(.55, 1., y) * .85);
  vec3 dc = vec3(.0, .0035, .007);
  vec3 d1 = vec3(length(p - c1 - dc.x), length(p - c1 - dc.y), length(p - c1 - dc.z)) - r1;
  vec3 d2 = vec3(length(p - c2 - dc.x), length(p - c2 - dc.y), length(p - c2 - dc.z)) - r2;
  float in1 = step(d1.y, 0.), in2 = step(d2.y, 0.);
  col = mix(col, u_hi, in1 * .05 + in2 * .08 + in1 * in2 * .06);
  col += u_hi * (smoothstep(-.12, 0., d1.y) * in1 * .10 + smoothstep(-.10, 0., d2.y) * in2 * .14);
  vec3 r = vec3(rim(d1.x, 260.), rim(d1.y, 260.), rim(d1.z, 260.)) * .55 + vec3(rim(d2.x, 220.), rim(d2.y, 220.), rim(d2.z, 220.)) * .7;
  r += (rim(d1.y, 38.) * .08 + rim(d2.y, 30.) * .12);
  col += u_hi * r;
  col += u_hi * smoothstep(.05, 0., length(p - (c2 + vec2(-.28, .38)))) * .25;
  float g = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - .5) * .018;
  gl_FragColor = vec4(col, 1.);
}`;
  // Centers of the two blobs (screen-height units, center 0) · radii — defaults are the intro band and contact window, the first page hero uses HERO_GEO
  const SUB_GEO = { c1: [0, 0.62], c2: [0.07, -0.8], r: [0.8, 0.56] };
  // Original first page head (1440×900, 13s settled screen): top blob’s bottom edge at 78% and bottom blob’s top edge at 64% overlap to form a lens
  const HERO_GEO = { c1: [0, 0.4], c2: [0.044, -0.79], r: [0.68, 0.65] };
  function heroGL(canvas, geo = SUB_GEO) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return () => {};
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, HERO_FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(prog, n);
    const set3 = (n, v) => gl.uniform3f(U(n), v[0], v[1], v[2]);
    gl.uniform2f(U("u_c1"), ...geo.c1); gl.uniform2f(U("u_c2"), ...geo.c2); gl.uniform2f(U("u_r"), ...geo.r);
    set3("u_deep", PB.rgb("--site-deep")); set3("u_deeper", PB.rgb("--site-deeper")); set3("u_mint", PB.rgb("--site-mint")); set3("u_hi", PB.rgb("--kf-bg"));
    const draw = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U("u_res"), canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    draw();
    return () => { ro.disconnect(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }

  // ---------- Hero entrance (after loader) ----------
  function heroIntro(c, first) {
    const bg = c.querySelector("[data-hero-bg]");
    const title = c.querySelector("[data-hero-title]"), sub = c.querySelector("[data-hero-sub]");
    const st = PB.lines(title), ss = PB.lines(sub);
    if (PB.reduce) { gsap.set(bg, { scale: 1 }); return; }
    gsap.set([st.lines, ss.lines], { yPercent: 110 });
    // On arrived pages the original scene appears ~.3s after the title starts rising (About → first page film: title 1.25s, scene 1.61s)
    if (!first) {
      gsap.set(bg, { scale: 1 });
      gsap.fromTo(c.querySelector("[data-hero-gl]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, delay: 0.25, ease: "none" });
    }
    const run = () => {
      if (first) gsap.to(bg, { scale: 1, duration: 2.5, ease: "power3.out" });
      gsap.delayedCall(first ? 0.2 : 0, () => {
        gsap.fromTo(st.lines, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.1, ease: "expo.out" });
        gsap.fromTo(ss.lines, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.1, ease: "expo.out", delay: 0.35 });
      });
    };
    first ? PB.afterLoader(run) : run();
    gsap.to(c.querySelector(".hm-hero__overlay"), { opacity: 1, ease: "power2.out", scrollTrigger: { trigger: c.querySelector(".hm-hero"), start: "bottom 80%", scrub: true } });
  }

  // ---------- Diamond window ----------
  // Rounded rhombus (851×810) — a path with rounded vertices as a data URI mask
  function diamondMask(w, h, k) {
    const P = [[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]];
    const at = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const len = Math.hypot(w / 2, h / 2), t = k / len;
    let d = "";
    P.forEach((c, i) => {
      const prev = P[(i + 3) % 4], next = P[(i + 1) % 4];
      const a = at(c, prev, t), b = at(c, next, t);
      d += `${i ? "L" : "M"}${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${c[0]} ${c[1]} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
    });
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><path d='${d}Z' fill='currentColor'/></svg>`)}")`;
  }
  function hiw(c) {
    const track = c.querySelector("[data-hiw]");
    if (!track) return;
    const mobile = innerWidth <= 767;
    const mask = track.querySelector("[data-hiw-mask]");
    const video = track.querySelector("[data-hiw-video]");
    const head = track.querySelector("[data-hiw-head]");
    const badge = track.querySelector("[data-hiw-badge]");
    const MASK_AR = 810 / 851;
    mask.style.maskImage = mask.style.webkitMaskImage = diamondMask(851, 810, 70);
    mask.style.maskRepeat = mask.style.webkitMaskRepeat = "no-repeat";
    const startPx = () => Math.min(Math.max(innerWidth * 0.35, 400), innerHeight * 0.55);
    const endPx = () => (innerWidth + innerHeight) * 2.4;
    const peekPx = () => innerHeight * 0.35;
    const mo = { progress: 0 };
    const upd = () => {
      const size = startPx() + (endPx() - startPx()) * mo.progress;
      const off = peekPx() * (1 - mo.progress);
      mask.style.maskSize = mask.style.webkitMaskSize = `${size}px ${size * MASK_AR}px`;
      mask.style.maskPosition = mask.style.webkitMaskPosition = `center calc(70% + ${off}px)`;
    };
    upd();
    const linesOf = (sel) => [...track.querySelectorAll(sel)].flatMap((el) => PB.lines(el).lines);
    const wwd = linesOf("[data-hiw-wwd] [data-hiw-split]");
    const set1 = track.querySelector('[data-hiw-set="1"]'), set2 = track.querySelector('[data-hiw-set="2"]');
    const s1 = [...set1.querySelectorAll("[data-hiw-split]")].flatMap((el) => PB.lines(el).lines);
    const s2 = [...set2.querySelectorAll("[data-hiw-split]")].flatMap((el) => PB.lines(el).lines);
    const sep1 = set1.querySelectorAll(".hm-stat__line"), sep2 = set2.querySelectorAll(".hm-stat__line");
    const VIDEO_DURATION = 15, V0 = 0.04, V1 = 0.65;
    video.pause();
    const prime = () => { video.play().then(() => video.pause()).catch(() => {}); };
    addEventListener("pointerdown", prime, { once: true });
    PB.onLeave(() => removeEventListener("pointerdown", prime));
    if (PB.reduce) { mo.progress = 1; upd(); return; }
    gsap.set(wwd, { yPercent: 110 });
    gsap.set(badge, { autoAlpha: 0 });
    gsap.set([...s1, ...s2], { yPercent: 110 });
    gsap.set(set2, { autoAlpha: 0 });
    gsap.set([...sep1, ...sep2], { scaleX: 0, transformOrigin: "left center" });
    gsap.fromTo(mask, { yPercent: 50 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: track, start: "top bottom", end: () => "top top-=" + innerHeight * 0.25, scrub: true } });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track, start: () => "top top-=" + innerHeight * 0.25, end: "bottom top", scrub: true, onRefresh: upd,
        onUpdate(self) {
          let vp = self.progress > V0 ? clamp(0, 1, (self.progress - V0) / (V1 - V0)) : 0;
          const d = video.duration || VIDEO_DURATION;
          if (video.readyState >= 1) video.currentTime = vp >= 1 ? d - 0.01 : Math.min(vp * d, d - 0.01);
        },
      },
    });
    tl.to(mo, { progress: 1, duration: 12, ease: mobile ? "power1.out" : "none", onUpdate: upd }, 0);
    if (!mobile) tl.to(head, { opacity: 0, duration: 8, ease: "none" }, 0);
    else tl.to(head, { opacity: 0, duration: 1.5, ease: "power1.out" }, 0);
    tl.to(badge, { autoAlpha: 1, duration: 5, ease: "power1.inOut" }, 6);
    tl.to(wwd, { yPercent: 0, duration: 6, stagger: 0.6, ease: "expo.out" }, 18)
      .to(sep1, { scaleX: 1, duration: 6, stagger: 0.6, ease: "power2.out" }, 20)
      .to(s1, { yPercent: 0, duration: 6, stagger: 0.6, ease: "expo.out" }, 22)
      .to(set1, { autoAlpha: 0, duration: 3 }, 34)
      .to(set2, { autoAlpha: 1, duration: 3 }, 34)
      .fromTo(sep2, { scaleX: 0 }, { scaleX: 1, duration: 6, stagger: 0.6, ease: "power2.out" }, 36)
      .fromTo(s2, { yPercent: 110 }, { yPercent: 0, duration: 6, stagger: 0.6, ease: "expo.out" }, 38)
      .to(set2, { autoAlpha: 0, duration: 4 }, 68)
      .to(wwd, { yPercent: -110, duration: 4 }, 68)
      .to(badge, { autoAlpha: 0, duration: 4, ease: "power1.inOut" }, 68);
  }

  // ---------- The shape at the end of the diamond window flies to the We know stage shape and settles ----------
  function handoff(c) {
    const vec = c.querySelector("[data-hiw-vector]");
    const lead = c.querySelector("[data-wk-lead]");
    const track = c.querySelector("[data-wk]");
    const back = c.querySelector("[data-wk-back]");
    if (!vec || !lead || innerWidth < 992) { gsap.set(back, { autoAlpha: 1 }); return; }
    gsap.set(back, { autoAlpha: 0 });
    gsap.set(vec, { visibility: "visible" });
    const clip = () => {
      const cut = Math.max(0, lead.getBoundingClientRect().top - vec.getBoundingClientRect().top);
      vec.style.clipPath = `inset(${cut}px 0px 0px 0px)`;
    };
    const F = 0.336, OX = 4e-3, OY = 6e-3;
    const apply = (p) => {
      const vw = innerWidth, vh = innerHeight, cover = Math.max(vw, 1.7778 * vh);
      const vecW = F * cover;
      const sr = track.querySelector(".hm-wk__pin").getBoundingClientRect(), tr = back.getBoundingClientRect();
      const txEnd = OX * cover + (tr.left - sr.left) + tr.width / 2 - vw / 2;
      const tyEnd = OY * cover + (tr.top - sr.top) + tr.height / 2 - vh / 2;
      const tx = OX * cover + p * (txEnd - OX * cover), ty = OY * cover + p * (tyEnd - OY * cover);
      const sc = 1 + p * (tr.width / vecW - 1);
      vec.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${sc})`;
      const landed = p >= 0.999;
      gsap.set(vec, { autoAlpha: landed || p <= 0 && lead.getBoundingClientRect().top > innerHeight ? 0 : 1 });
      gsap.set(back, { autoAlpha: landed ? 1 : 0 });
    };
    apply(0);
    ScrollTrigger.create({ trigger: lead, start: "top bottom", end: "bottom top", onUpdate: clip, onRefresh: clip, onLeaveBack: () => gsap.set(vec, { autoAlpha: 0 }), onEnter: () => gsap.set(vec, { autoAlpha: 1 }) });
    ScrollTrigger.create({ trigger: lead, start: "top top", endTrigger: track, end: "top top", scrub: true, onUpdate: (s) => apply(s.progress), onRefresh: (s) => apply(s.progress) });
    clip();
  }

  // ---------- We know ----------
  function weKnow(c) {
    const track = c.querySelector("[data-wk]");
    if (!track) return;
    const mobile = innerWidth < 992;
    const apla = track.querySelector("[data-wk-apla]");
    const [A0, A1] = mobile ? [0.4, 0.75] : [0.5, 0.75];
    const setClip = (top) => (apla.style.clipPath = `inset(${top}% 0% 0% 0%)`);
    setClip(PB.reduce ? 0 : 100);
    const big = track.querySelector("[data-wk-flip]"), target = track.querySelector("[data-wk-flip-to]");
    const F0 = 0.1, F1 = 0.35, IN = 0.02, SWAP = 0.55, HL0 = mobile ? 0 : 0.15, HL1 = mobile ? 0.4 : 0.375;
    const W0 = mobile ? 0 : F0, W1 = mobile ? 0.2 : F1;
    const muted = PB.rgb("--site-muted-word"), active = PB.rgb("--kf-ink");
    const css = (v) => `rgb(${Math.round(v[0] * 255)}, ${Math.round(v[1] * 255)}, ${Math.round(v[2] * 255)})`;
    const MUTED = css(muted), ACTIVE = css(active);
    const diamond1 = track.querySelector('[data-wk-diamond="1"]');
    const sh = PB.lines(big);
    const prep = (el) => {
      const targets = [...el.children].filter((t) => !t.matches(".diamond-ic"));
      const lines = targets.flatMap((t) => PB.lines(t).lines);
      return { el, lines, shown: false };
    };
    const goal = prep({ children: [track.querySelector('[data-wk-tx="goal"]')] });
    goal.el = track.querySelector('[data-wk-tx="goal"]');
    const w2 = prep(track.querySelector('[data-wk-tx="w2"]'));
    const w1El = track.querySelector('[data-wk-tx="w1"]');
    let w1Words = [], w1Lines = [];
    [...w1El.children].forEach((t) => {
      if (t.matches(".diamond-ic")) return;
      const s = SplitText.create(t, { type: "lines, words", mask: "lines", linesClass: "split-line" });
      PB.splits.push(s);
      w1Lines = w1Lines.concat(s.lines);
      if (t.matches(".hm-wk__note")) gsap.set(s.words, { color: ACTIVE });
      else { gsap.set(s.words, { color: MUTED }); w1Words = w1Words.concat(s.words); }
    });
    if (PB.reduce) {
      gsap.set(w1Words, { color: ACTIVE });
      gsap.set([goal.el, w2.el], { autoAlpha: 0 });
      gsap.set(big, { autoAlpha: 0 });
      target.style.visibility = "visible";
      return;
    }
    gsap.set(big, { autoAlpha: 0 }); gsap.set(sh.lines, { yPercent: 115 });
    [goal, w2].forEach((o) => { gsap.set(o.el, { autoAlpha: 0 }); gsap.set(o.lines, { yPercent: 115 }); });
    gsap.set(w1El, { yPercent: mobile ? 25 : 125 });
    let head = -1;
    const setHead = (s) => {
      if (s === head) return;
      head = s;
      gsap.killTweensOf(sh.lines);
      if (s === 0) { gsap.set(big, { autoAlpha: 0 }); gsap.set(sh.lines, { yPercent: 115 }); }
      else if (s === 1) { gsap.set(big, { autoAlpha: 1 }); gsap.to(sh.lines, { yPercent: 0, duration: 0.8, stagger: 0.1, ease: "expo.out", overwrite: "auto" }); }
      else gsap.to(sh.lines, { yPercent: 115, duration: 0.4, stagger: 0, ease: "power2.inOut", overwrite: "auto", onComplete: () => head === 2 && gsap.set(big, { autoAlpha: 0 }) });
    };
    const show = (o) => { if (o.shown) return; o.shown = true; gsap.set(o.el, { autoAlpha: 1 }); gsap.to(o.lines, { yPercent: 0, duration: 1, stagger: 0.1, ease: "expo.out", delay: 0.15, overwrite: true }); };
    const hide = (o) => { if (!o.shown) return; o.shown = false; gsap.to(o.lines, { yPercent: 115, duration: 0.35, stagger: 0, ease: "power2.out", overwrite: true, onComplete: () => !o.shown && gsap.set(o.el, { autoAlpha: 0 }) }); };
    let exited = false, next = false;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track, start: mobile ? "top bottom" : "top top", end: "bottom bottom", scrub: true,
        onUpdate(self) {
          const p = self.progress;
          setClip((1 - clamp(0, 1, (p - A0) / (A1 - A0))) * 100);
          setHead(p < IN ? 0 : p < SWAP ? 1 : 2);
          const hh = clamp(0, 1, (p - HL0) / (HL1 - HL0)) * w1Words.length;
          w1Words.forEach((w, i) => gsap.set(w, { color: gsap.utils.interpolate(MUTED, ACTIVE, clamp(0, 1, hh - i)) }));
          if (p >= SWAP && !exited) {
            exited = true;
            gsap.to(w1Lines, { yPercent: 115, duration: 0.4, stagger: 0.05, ease: "power2.inOut", overwrite: true });
            gsap.to(diamond1, { rotate: 90, duration: 0.5, ease: "back.out(1.7)", overwrite: "auto" });
          } else if (p < SWAP && exited) {
            exited = false;
            gsap.to(w1Lines, { yPercent: 0, duration: 0.4, stagger: 0, ease: "power2.out", delay: 0.15, overwrite: true });
            gsap.to(diamond1, { rotate: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
          }
          const sn = p >= SWAP;
          if (sn !== next) { next = sn; sn ? (show(goal), show(w2)) : (hide(goal), hide(w2)); }
        },
      },
    });
    tl.to({}, { duration: 1 }, 0);
    tl.add(Flip.fit(big, target, { duration: F1 - F0, ease: "none", scale: true }), F0);
    tl.to(w1El, { yPercent: 0, duration: W1 - W0, ease: "none" }, W0);
    // Vial — for the first .22 it fades in while standing upright (original values), then the blur clears up to .55 (the original blur pass is a video composite, so the value is measured on screen)
    const rot = track.querySelector("[data-wk-rotate]");
    const items = [...track.querySelector("[data-wk-spread]").children];
    const POS = mobile
      ? items.map((_, i) => { const d = Math.abs(i - 1.5); return { x: (i - 1.5) * 48, y: -d * 14, scale: 1 - d * 0.15 }; })
      : [{ x: -120, y: 0, scale: 1.4 }, { x: -55, y: 0, scale: 1.15 }, { x: 10, y: 0, scale: 0.9 }, { x: 70, y: 0, scale: 0.7 }];
    items.forEach((it, j) => gsap.set(it, { zIndex: Math.round(POS[j].scale * 1000), transformOrigin: mobile ? "center bottom" : "center center" }));
    tl.fromTo(rot, { autoAlpha: 0, filter: "blur(24px)" }, { autoAlpha: 1, rotation: 0, duration: 0.22, ease: "none" }, 0);
    tl.to(rot, { filter: "blur(0px)", duration: 0.33, ease: "none" }, 0.22);
    items.forEach((it, i) => tl.to(it, { xPercent: POS[i].x, yPercent: POS[i].y, scale: POS[i].scale, duration: 0.3, ease: "power2.out" }, 0.55));
    tl.to(track.querySelector("[data-wk-overlay]"), { opacity: 1, duration: 0.1, ease: "power2.out" }, 0.9);
  }

  // ---------- Core pillars ----------
  function keyPillars(c) {
    const track = c.querySelector("[data-kp]");
    if (!track) return;
    const mask = track.querySelector("[data-kp-mask]");
    const DIAMOND = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 593 593'><rect x='86.8' y='86.8' width='419.4' height='419.4' rx='64' transform='rotate(45 296.5 296.5)' fill='currentColor'/></svg>")}")`;
    Object.assign(mask.style, { maskImage: DIAMOND, webkitMaskImage: DIAMOND, maskRepeat: "no-repeat", webkitMaskRepeat: "no-repeat", maskPosition: "center", webkitMaskPosition: "center", maskSize: "contain", webkitMaskSize: "contain" });
    const video = track.querySelector("[data-kp-video]");
    const ring = track.querySelector("[data-kp-ring]");
    const items = [...track.querySelectorAll("[data-copy]")];
    const lines = items.map((it) => [...it.children].flatMap((el) => PB.lines(el).lines));
    const steps = track.querySelectorAll(".hm-kp__step"), dots = track.querySelectorAll(".hm-kp__dots i");
    let cur = -1, active = -1;
    const setCopy = (i) => {
      if (i === cur) return;
      cur = i;
      items.forEach((it, n) => gsap.set(it, { zIndex: n === i ? 2 : 1, autoAlpha: n === i ? 1 : 0 }));
      if (PB.reduce) return;
      gsap.set(lines[i], { yPercent: 110 });
      gsap.to(lines[i], { yPercent: 0, duration: 0.8, stagger: 0.1, ease: "expo.out", overwrite: true });
    };
    const setActive = (i) => {
      if (i === active) return;
      active = i; setCopy(i);
      steps.forEach((el, n) => el.classList.toggle("is-active", n === i));
      dots.forEach((el, n) => el.classList.toggle("is-active", n === i));
    };
    const N = dots.length || 4;
    let st;
    steps.forEach((el, n) => el.addEventListener("click", (e) => {
      e.preventDefault();
      if (st) PB.scrollTo(st.start + (st.end - st.start) * ((n + 0.5) / N));
    }));
    video.pause();
    if (PB.reduce) { setActive(0); ring.style.strokeDashoffset = 0; return; }
    const intro = gsap.timeline({ scrollTrigger: { trigger: track, start: "top 85%", once: true }, defaults: { ease: "power2.out" } });
    intro.from(track.querySelector("[data-kp-eyebrow]"), { autoAlpha: 0, y: 20, duration: 0.6 }, 0)
      .fromTo(track.querySelector("[data-kp-stage]"), { rotation: -45, scale: 0.8, autoAlpha: 0 }, { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.9 }, 0.35)
      .fromTo(track.querySelector("[data-kp-pager]"), { rotation: -45, scale: 0.8, autoAlpha: 0 }, { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.9 }, 0.6)
      .call(() => setActive(0), null, 0.4)
      .from(track.querySelector("[data-kp-cta]"), { autoAlpha: 0, y: 20, duration: 0.6 }, 1.1);
    st = ScrollTrigger.create({
      trigger: track, start: "top top", end: "bottom bottom", scrub: true,
      onUpdate(self) {
        const p = self.progress;
        if (video.duration) video.currentTime = Math.min(p * video.duration, video.duration - 0.04);
        ring.style.strokeDashoffset = 1 - p;
        setActive(Math.min(Math.floor(p * N), N - 1));
      },
    });
  }

  // ---------- Glass crack ----------
  function glassSplit(c) {
    const sec = c.querySelector("[data-glass-split]");
    if (!sec) return;
    const ci = sec.querySelector(".hm-concept__ci"), sq = sec.querySelector(".hm-concept__sq");
    const gap = () => 2.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const mm = gsap.matchMedia();
    mm.add({ d: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", m: "(max-width: 767px) and (prefers-reduced-motion: no-preference)", r: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { d, r } = ctx.conditions;
      if (r) { gsap.set(ci, { x: -(sq.offsetWidth + gap()) / 2 }); gsap.set(sq, { x: (ci.offsetWidth + gap()) / 2 }); return; }
      const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: () => (sec.offsetHeight <= innerHeight ? "clamp(bottom bottom)" : "clamp(top top)"), toggleActions: "play none none reverse", invalidateOnRefresh: true } });
      if (d) tl.to(ci, { x: () => -(sq.offsetWidth + gap()) / 2, duration: 1.5, ease: "expo.out" }, 0).to(sq, { x: () => (ci.offsetWidth + gap()) / 2, duration: 1.5, ease: "expo.out" }, 0);
      else tl.to(ci, { y: "12.9375rem", duration: 1.5, ease: "expo.out" }, 0);
    });
    PB.onLeave(() => mm.revert());
  }

  // ---------- Team swiper (only below 992) ----------
  function team(c) {
    const el = c.querySelector("[data-team-swiper]");
    if (!el || !window.Swiper) return;
    let sw = null;
    const mq = matchMedia("(max-width: 991px)");
    const sync = () => {
      if (mq.matches && !sw) {
        sw = new Swiper(el, {
          slidesPerView: 1.25, centeredSlides: true, spaceBetween: 16, speed: 1800, loop: true, grabCursor: true, keyboard: { enabled: true },
          autoplay: PB.reduce ? false : { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: false },
          pagination: { el: el.querySelector(".swiper-pagination"), clickable: true },
          breakpoints: { 480: { slidesPerView: 2.25 } },
        });
      } else if (!mq.matches && sw) { sw.destroy(true, true); sw = null; }
    };
    sync();
    mq.addEventListener("change", sync);
    PB.onLeave(() => { mq.removeEventListener("change", sync); sw?.destroy(true, true); });
  }

  // ---------- Bottle reveal ----------
  // The original scrolls through 16 cap renders (24fps) — we draw our vial image as 16 frames and flip through them at the same tempo
  function bottle(c) {
    const sec = c.querySelector("[data-bottle]");
    if (!sec) return;
    const cv = sec.querySelector("[data-bottle-frames]"), ctx = cv.getContext("2d");
    const video = sec.querySelector("[data-bottle-video]"), clip = sec.querySelector("[data-bottle-clip]");
    const N = 16, FPS = 24, FALLBACK = 1.9167;
    const col = (n) => { const v = PB.rgb(n); return `rgba(${v[0] * 255},${v[1] * 255},${v[2] * 255},${v[3]})`; };
    const C = { glass: col("--site-mint"), cap: col("--site-vibrant"), ring: col("--site-mist"), label: col("--kf-bg"), line: col("--site-deep") };
    const draw = (i) => {
      const k = i / (N - 1), W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2, H * 0.08 + k * H * 0.12);
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = C.glass; ctx.strokeStyle = C.line; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(-70, 120, 140, 260, 22); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(-38, 80, 76, 50, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.label; ctx.fillRect(-70, 200, 140, 90);
      ctx.translate(0, -60 * (1 - k));
      ctx.rotate((1 - k) * -0.5);
      ctx.fillStyle = C.ring; ctx.beginPath(); ctx.roundRect(-44, 64, 88, 18, 4); ctx.fill();
      ctx.fillStyle = C.cap; ctx.beginPath(); ctx.roundRect(-48, 18, 96, 50, 10); ctx.fill();
      ctx.restore();
    };
    let curF = -1;
    const apply = (p) => {
      p = clamp(0, 1, p);
      const d = video.duration || FALLBACK;
      const f = clamp(0, N - 1, Math.floor(p * d * FPS));
      if (f !== curF) { draw(f); curF = f; }
      if (video.duration) video.currentTime = Math.min(p * video.duration, video.duration - 0.01);
    };
    video.pause();
    apply(PB.reduce ? 1 : 0);
    if (PB.reduce) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 480px)", () => { ScrollTrigger.create({ trigger: cv, start: "bottom 85%", endTrigger: clip, end: "bottom 50%", scrub: 1, onUpdate: (s) => apply(s.progress), onRefresh: (s) => apply(s.progress) }); });
    mm.add("(max-width: 479px)", () => { ScrollTrigger.create({ trigger: cv, start: "top 30%", end: "+=700", scrub: 1, onUpdate: (s) => apply(s.progress), onRefresh: (s) => apply(s.progress) }); });
    video.addEventListener("loadedmetadata", () => { video.pause(); ScrollTrigger.refresh(); }, { once: true });
    PB.onLeave(() => mm.revert());
  }

  PB.heroGL = heroGL;
  PB.diamondMask = diamondMask;
  PB.page("home", {
    init(c, { first } = {}) {
      const stopGL = heroGL(c.querySelector("[data-hero-gl]"), HERO_GEO);
      heroIntro(c, first);
      hiw(c);
      handoff(c);
      weKnow(c);
      keyPillars(c);
      glassSplit(c);
      team(c);
      bottle(c);
      return () => { stopGL(); };
    },
  });
})();
