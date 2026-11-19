// Home page: WebGL hero (original shader formula as is, baking a placeholder drawing as the texture instead of photos),
// Loader → wordmark and vertical copy appear, 350vh pinned scroll (blur · gradient · four message lines), About photo parallax, Q&A mask.
(() => {
  const { reduced } = NU;
  const sp = matchMedia("(max-width: 767px)").matches;
  const head = document.querySelector('[data-slot="header"]');
  const loader = document.querySelector(".nu-loader");

  // ── Placeholder photo texture: bright curtained window + figure blob on the right + wire X + a label saying what the photo is ──
  const canvas = document.querySelector("[data-mv-canvas]");
  const paintPlaceholder = (w, h) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    const bg = g.createLinearGradient(0, 0, w, 0);
    bg.addColorStop(0, NU.color("--kf-bg")); bg.addColorStop(0.55, NU.color("--kf-surface")); bg.addColorStop(1, NU.color("--site-photo"));
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w * 0.5; x += w * 0.035) {
      g.fillStyle = NU.color("--site-on-photo", 0.05 + 0.05 * Math.sin(x));
      g.fillRect(x, 0, w * 0.012, h);
    }
    const cx = w * (h > w ? 0.5 : 0.6), cy = h * 0.46;
    const fig = g.createRadialGradient(cx, cy * 0.8, 0, cx, cy, Math.max(w, h) * 0.5);
    fig.addColorStop(0, NU.color("--site-photo-dark", 0.9)); fig.addColorStop(0.45, NU.color("--site-photo-dark", 0.55)); fig.addColorStop(1, NU.color("--site-photo-dark", 0));
    g.fillStyle = fig; g.fillRect(0, 0, w, h);
    g.strokeStyle = NU.color("--kf-ink", 0.13); g.lineWidth = Math.max(1.5, w / 900);
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    const fs = Math.round(Math.min(w, h) * 0.024);
    g.font = `500 ${fs}px ${getComputedStyle(document.documentElement).getPropertyValue("--wf-mono").trim() || "monospace"}`;
    const words = canvas.dataset.label.split(" ");
    const maxW = w * (h > w ? 0.78 : 0.42), lines = [];
    let line = "";
    words.forEach((word) => { const t = line ? line + " " + word : word; if (g.measureText(t).width > maxW && line) { lines.push(line); line = word; } else line = t; });
    lines.push(line);
    const lh = fs * 1.5, bw = Math.max(...lines.map((l) => g.measureText(l).width)) + fs * 1.6, bh = lines.length * lh + fs;
    // To leave room for the vertical text on the right, the label is pushed left on wide screens
    const lx = h > w ? w / 2 : w * 0.4;
    g.fillStyle = NU.color("--site-photo", 0.92);
    g.fillRect(lx - bw / 2, h / 2 - bh / 2, bw, bh);
    g.fillStyle = NU.color("--site-photo-ink"); g.textAlign = "center"; g.textBaseline = "middle";
    lines.forEach((l, i) => g.fillText(l, lx, h / 2 - bh / 2 + fs / 2 + lh * (i + 0.5)));
    return c;
  };
  const texSize = innerWidth < 768 ? [780, 1690] : innerWidth < 1024 ? [1024, 1366] : [1600, 1000];
  const tex = paintPlaceholder(...texSize);

  const VERT = `#version 300 es
  in vec2 a_position; in vec2 a_texCoord; out vec2 v_texCoord;
  void main() { v_texCoord = a_texCoord; gl_Position = vec4(a_position, 0.0, 1.0); }`;
  // Original shader: UV wobbles with larger sine waves toward the bottom, only below the sine boundary is the photo, above it is flat beige
  const FRAG = `#version 300 es
  precision mediump float;
  in vec2 v_texCoord;
  uniform vec3 u_baseColor; uniform float u_mix; uniform sampler2D u_texture;
  uniform float u_time; uniform float u_amp; uniform float u_freq;
  uniform vec2 u_scale; uniform vec2 u_offset; uniform float u_blurAmount;
  out vec4 outColor;
  void main() {
    vec2 baseUV = (v_texCoord - 0.5) * u_scale + 0.5 + u_offset;
    float xFactor = pow(1.0 - baseUV.x, 2.0);
    float yFactor = pow(1.0 - baseUV.y, 2.0);
    float adjustedAmp = u_amp * (xFactor * 1.0 + yFactor * 1.5);
    float wave = sin(baseUV.x * u_freq + u_time) * adjustedAmp;
    vec2 finalUV = vec2(baseUV.x + wave * 3.5, baseUV.y + wave * 1.5);
    vec4 col = vec4(u_baseColor, 1.0);
    vec4 tex = texture(u_texture, finalUV);
    float boundaryWave = sin(baseUV.x * 5.0 + u_time) * u_amp * 2.5;
    float mask = smoothstep(u_mix + boundaryWave - u_blurAmount, u_mix + boundaryWave + u_blurAmount, baseUV.y);
    outColor = mix(tex, col, mask);
  }`;

  const makeGL = () => {
    const gl = canvas.getContext("webgl2");
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_position"), aUV = gl.getAttribLocation(prog, "a_texCoord");
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUV); gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 16, 8);
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const U = (n) => gl.getUniformLocation(prog, n);
    const u = { time: U("u_time"), amp: U("u_amp"), freq: U("u_freq"), blur: U("u_blurAmount"), base: U("u_baseColor"), mix: U("u_mix"), scale: U("u_scale"), offset: U("u_offset"), tex: U("u_texture") };
    gl.uniform1i(u.tex, 0);
    gl.uniform1f(u.amp, 0.005); gl.uniform1f(u.freq, 24); gl.uniform1f(u.blur, 0);
    gl.uniform3f(u.base, 0.7686, 0.702, 0.6588); gl.uniform1f(u.mix, 0);
    const aspect = tex.width / tex.height;
    const draw = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      const ca = w / h;
      let sx = 1, sy = 1;
      if (ca > aspect) sy = ca / aspect; else sx = aspect / ca;
      gl.uniform2f(u.scale, 1 / sx, 1 / sy);
      gl.uniform2f(u.offset, 0, (1 - 1 / sy) * 0.5);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const set = (k, v) => gl.uniform1f(u[k], v);
    addEventListener("resize", draw);
    return { draw, set };
  };
  let G = null;
  try { G = makeGL(); } catch (e) { G = null; }
  if (!G) {
    // Without WebGL2, keep the placeholder image in place
    const g2 = canvas.getContext("2d");
    const fit = () => { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; const s = Math.max(canvas.width / tex.width, canvas.height / tex.height); g2.drawImage(tex, (canvas.width - tex.width * s) / 2, (canvas.height - tex.height * s) / 2, tex.width * s, tex.height * s); };
    fit(); addEventListener("resize", fit);
  } else G.draw();

  const glAppear = () => {
    if (!G) return;
    const p = { time: 0, amp: sp ? 0.014 : 0.012, blur: 0, mix: 0 };
    const tl = gsap.timeline();
    tl.to(p, { time: sp ? 6 : 4, amp: 0, blur: 0.3, duration: 2.8, ease: "power3.out",
      onUpdate: () => { G.set("time", p.time); G.set("amp", p.amp); G.set("blur", p.blur); G.draw(); },
      onComplete: () => {
        const q = { time: 0, amp: 0 };
        gsap.timeline({ scrollTrigger: { trigger: "[data-mv]", start: "top top", end: "bottom top", scrub: true } })
          .to(q, { time: sp ? 16 : 12, amp: sp ? 0.01 : 0.005, ease: "power1.inOut", onUpdate: () => { G.set("time", q.time); G.set("amp", q.amp); G.draw(); } });
      } }, 0);
    tl.to(p, { mix: 1.2, duration: 2.2, ease: "power2.out", onUpdate: () => { G.set("mix", p.mix); G.draw(); } }, 0);
  };

  // ── Loader → wordmark strokes at 0.16s intervals → vertical phrase → one-line intro ──
  const logo = document.querySelector("[data-mv-logo]");
  const letters = NU.splitChars(logo);
  const catchCols = document.querySelectorAll("[data-mv-catch] > span");
  const mvText = document.querySelector("[data-mv-text]");
  const raised = NU.color("--kf-raised"), onPhoto = NU.color("--site-on-photo");

  if (reduced) {
    if (G) { G.set("mix", 1.2); G.set("blur", 0.3); G.set("amp", 0); G.draw(); }
    NU.hideLoader(0);
  } else {
    gsap.set(letters, { opacity: 0, yPercent: 20, filter: `drop-shadow(0px 0px 40px ${raised})`, color: raised });
    gsap.set(mvText, { opacity: 0 });
    gsap.set(catchCols, { opacity: 0, yPercent: 3, xPercent: -50, rotate: -2 });
    const start = () => {
      gsap.timeline()
        .to(loader, { opacity: 0, duration: 0.55, ease: "power4.out", onComplete: () => {
          loader.classList.add("is-done");
          document.dispatchEvent(new CustomEvent("nu:loaded"));
          glAppear();
        } })
        .to(letters, { opacity: 1, duration: 1, ease: "power2.out", color: onPhoto, yPercent: 0, stagger: 0.16, filter: `drop-shadow(0px 0px 0px ${onPhoto})` }, "+=0.2")
        .to(catchCols, { opacity: 1, duration: 1.2, ease: "power2.out", color: onPhoto, yPercent: 0, xPercent: 0, stagger: 0.2, rotate: 0 }, "-=0.5")
        .to(mvText, { opacity: 1, duration: 1.5, ease: "power2.out" }, "<=");
    };
    if (document.readyState === "complete") start(); else addEventListener("load", start);
  }

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", desk: "(min-width: 768px)" }, (ctx) => {
    const { motion, desk } = ctx.conditions;
    if (!motion) return;

    // 350vh fixed: photo blur and gradient
    const wrap = document.querySelector("[data-mv]");
    gsap.timeline({ scrollTrigger: { trigger: wrap, start: "0% top", end: "90% top", scrub: 1.4 } })
      .to("[data-mv-grad]", { opacity: 1 }, 0)
      .fromTo(canvas, { filter: "blur(0px)" }, { filter: `blur(${desk ? 10 : 20}px)` }, 0);

    // Message: hero text fades to beige and the heading comes in, then four lines light up letter by letter in turn
    const main = document.querySelector("[data-mv-main]");
    const heading = document.querySelector("[data-mv-heading]");
    const lines = [...document.querySelectorAll("[data-mv-lines] > p")];
    const chars = lines.map((l) => NU.splitChars(l));
    gsap.set(lines, { opacity: 0 });
    gsap.set(chars.flat(), { opacity: 0, display: "inline-block", textShadow: `0rem 0rem 2rem ${raised}`, color: raised, rotate: "-5deg", y: 13, x: -8 });
    gsap.set(head, { opacity: 0 });
    gsap.set(heading, { opacity: 0 });
    const textTl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "30% bottom", end: "80% top", scrub: 1.4 } });
    const lineTls = chars.map((cs) => gsap.timeline({ paused: true }).to(cs, { opacity: 1, textShadow: `0rem 0rem 0rem ${onPhoto}`, color: onPhoto, stagger: 0.03, duration: 0.8, ease: "power1.out", rotate: "0deg", y: 0, x: 0 }));
    const toggle = (tl) => () => { textTl.scrollTrigger.direction === 1 ? tl.play() : tl.reverse(); };
    textTl.set(main, { opacity: 1 })
      .to(main, { opacity: 0, color: raised, ease: "power4.inOut", duration: 0.5 })
      .to(lines, { opacity: 1 }, "<")
      .to(head, { opacity: 1, ease: "power4.inOut" })
      .to(heading, { opacity: 1, ease: "power4.inOut" }, "-=.5")
      .add(toggle(lineTls[0]), "<")
      .add(toggle(lineTls[1]), "+=" + (lineTls[0].duration() + 0.5))
      .add(toggle(lineTls[2]), "+=" + (lineTls[1].duration() + 0.5))
      .add(toggle(lineTls[3]), "+=" + (lineTls[2].duration() + 0.5))
      .to({}, { duration: 5.5 });

    // About vertical title: per line, blur 5px, 15% from the side, .6s apart
    const title = document.querySelector("[data-concept-title]");
    const cols = title.querySelectorAll(".nu-vert > span");
    gsap.set(cols, { opacity: 0, color: raised, filter: "blur(5px)", yPercent: 5, xPercent: -15 });
    gsap.to(cols, { opacity: 1, color: NU.color("--kf-ink"), filter: "blur(0px)", yPercent: 0, xPercent: 0, ease: "power2.inOut", stagger: 0.6, duration: 1.8,
      scrollTrigger: { trigger: title, start: "-70% 100%" } });

    // Scattered photos and videos: each with different parallax and clip-path (original settings table as is)
    const cfg = [
      ["01", "-20% 100%", "inset(0% 0% 0% 0%)", "inset(-3% 0% 3% 0%)", 0, -10, -13, 5],
      ["02", "-20% 100%", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", 0, -25, -8, 8],
      ["03", "0% 100%", "inset(0% 0% 0% 0%)", "inset(0% 0% -2% 0%)", 0, 5, -5, 5],
      ["04", "0% 100%", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", 24, -24, -10, 10],
      ["sp4", "0% 100%", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", -4, 0, -15, 15],
      ["05", "0% 100%", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", 0, -25, -8, 8],
      ["sp5", "0% 100%", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", 0, -20, 5, 3],
    ];
    cfg.forEach(([id, start, c0, c1, y0, y1, i0, i1]) => {
      const el = document.querySelector(`[data-par="${id}"]`);
      if (!el || !el.offsetParent) return;
      const media = el.firstElementChild;
      gsap.set(el, { clipPath: c0, yPercent: y0 });
      gsap.set(media, { yPercent: i0 });
      gsap.timeline({ scrollTrigger: { trigger: el, start, end: "100% 0%", scrub: 1 } })
        .to(el, { clipPath: c1, yPercent: y1, ease: "linear" })
        .to(media, { yPercent: i1, ease: "linear" }, 0);
    });

    // Q&A: the background unfolds from the left with a mask, and the Q symbol, title and cards appear from blur
    const qa = document.querySelector("[data-qa]");
    const bg = qa.querySelector("[data-qa-bg]");
    const grad = "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0) 100%)"; /* Not skin: mask only looks at alpha */
    gsap.set(bg, { maskImage: grad, webkitMaskImage: grad, maskSize: "210% 100%", webkitMaskSize: "210% 100%", maskPosition: "150% 0%", webkitMaskPosition: "150% 0%" });
    const icon = qa.querySelector("[data-qa-icon]"), tMain = qa.querySelector("[data-qa-main]"), tSub = qa.querySelector("[data-qa-sub]"), cont = qa.querySelector("[data-qa-contents]");
    gsap.set(icon, { xPercent: 20, opacity: 0, filter: "blur(5px)" });
    gsap.set([tMain, tSub, cont], { opacity: 0, filter: "blur(5px)" });
    gsap.timeline({ scrollTrigger: { trigger: qa, start: "top 100%", once: true } })
      .to(bg, { maskPosition: "0% 0%", webkitMaskPosition: "0% 0%", duration: 1, ease: "power1.out" })
      .to(icon, { xPercent: 0, opacity: 0.75, duration: 1.4, filter: "blur(0px)", ease: "power1.out" }, "-=0.8")
      .to(tMain, { opacity: 1, filter: "blur(0px)", duration: 2, ease: "power1.out" }, "-=0.9")
      .to(tSub, { opacity: 1, filter: "blur(0px)", duration: 2, ease: "power1.out" }, "<")
      .to(cont, { opacity: 1, duration: 1.4, filter: "blur(0px)", ease: "power1.out" }, "-=1.5");

  });
})();
