// First page — like the original, scroll is measured in screens, and each section uses a 0→1 variable through smoothstep, driving the pinned stage (card spiral·ink·fog) with that variable.
(() => {
  const G = window.G;
  const root = document.documentElement;
  const page = document.querySelector(".g-page");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const set = (k, v) => page.style.setProperty(k, v.toFixed(4));
  const mobile = () => innerWidth <= 768;
  const sm = G.smooth;

  // ── Hero title: each letter is .045s later and rises over .62s, filling the full width (40px on each side)
  const title = $(".g-hero__title");
  const words = title.getAttribute("aria-label").split(" ");
  let li = 0;
  title.innerHTML = words.map((w, wi) => `<span class="g-hero__word" aria-hidden="true">${[...w].map((ch) => `<span class="g-hero__letter" style="animation-delay:${(li++ * 0.045).toFixed(3)}s">${ch}</span>`).join("")}</span>${wi < words.length - 1 ? '<span class="g-hero__space" aria-hidden="true"></span>' : ""}`).join("");
  const fit = () => {
    if (mobile()) { title.style.fontSize = ""; return; }
    title.style.fontSize = "200px";
    const w = title.scrollWidth;
    if (w > 0) title.style.fontSize = `${(200 * (innerWidth - 80)) / w}px`;
  };
  fit(); addEventListener("resize", fit); document.fonts && document.fonts.ready.then(fit);

  // ── Section entry marker (once)
  const once = (el, cls, threshold) => {
    if (!el) return;
    if (G.reduce) { el.classList.add(cls); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add(cls); io.disconnect(); } }, { threshold });
    io.observe(el);
  };
  once($(".g-s2"), "is-in", 0.35);
  once($(".g-s5"), "is-in", 0.15);
  once($(".g-stats"), "is-in", 0.4);
  once($(".g-guilds"), "is-in", 0.12);

  // ── Guild title letter splitting (--i order)
  const head = $(".g-guilds__head");
  let gi = 0;
  head.innerHTML = head.dataset.split.split("|").map((row) => `<span class="g-guilds__row">${row.split(" ").map((w) => `<span class="g-guilds__lw">${[...w].map((ch) => `<span class="g-guilds__letter" style="--i:${gi++}">${ch}</span>`).join("")}</span>`).join(" ")}</span>`).join("");
  const lead = $(".g-guilds__lead");
  let ll = 0;
  lead.innerHTML = lead.dataset.split.split(" ").map((w) => `<span class="g-guilds__lw">${[...w].map((ch) => `<span class="g-guilds__ll" style="--i:${ll++}">${ch}</span>`).join("")}</span>`).join(" ");

  // ── Scroll → variables (original range values as is)
  const s5 = $(".g-s5"), totemWrap = $(".g-totem-wrap"), guildsWrap = $(".g-guilds-wrap"), guilds = $(".g-guilds"), pill = $(".g-pill");
  const rows = $$(".g-s5__row"), gTitle = $(".g-guilds__headwrap");
  const ST = (G.state = { a: 0, collapse: 0, ink: 0, inkfill: 0, forge: 0, accept: false, forgeOn: false, sceneOn: true, hero: 0 });
  const update = () => {
    const e = G.scroll(), i = innerHeight, a = e / i;
    ST.a = a;
    const s5Top = s5.offsetTop, s5H = s5.offsetHeight, totemTop = totemWrap.offsetTop;
    const b = mobile() ? sm(totemTop - i * 0.42, totemTop - i * 0.06, e) : sm(s5Top + s5H + i * 0.25, totemTop - i * 0.1, e);
    const vsheet = sm(0, 0.35, b), vcard = sm(0.46, 0.74, b);
    const collapse = mobile() ? sm(totemTop - i * 0.86, totemTop - i * 0.15, e) : sm(0.52, 0.82, b);
    const forge = mobile() ? sm(totemTop - i * 0.95, totemTop - i * 0.32, e) : collapse;
    ST.collapse = collapse; ST.forge = forge;
    set("--vsheet", vsheet); set("--vcard", vcard); set("--forge", forge);
    set("--treveal", sm(0.8, 1, b)); set("--dreveal", sm(0.9, 1, b));
    const ink = sm(1.9, 2.6, a);
    ST.ink = ink; ST.inkfill = ink * (1 - collapse);
    ST.accept = a > 1.55 && collapse < 0.999;
    ST.sceneOn = vcard < 0.999;
    set("--ink", ink); set("--dgrow", sm(2.1, 2.45, a)); set("--hl", sm(2.3, 2.72, a));
    set("--phone", sm(2.2, 2.65, a) * (1 - vcard));
    for (const r of rows) r.style.setProperty("--rp", G.clamp((i * 0.9 - r.getBoundingClientRect().top) / (i * 0.45)).toFixed(4));
    const n = s5Top - e, ib = s5Top + s5H - e;
    const vreveal = G.clamp((i - ib) / i), s = G.clamp((i - n) / i);
    set("--vreveal", vreveal); set("--afade", G.clamp(n / (i * 0.7)));
    set("--s5off", Math.min(1, 1 - s + vreveal)); set("--s5rot", 1 - s - vreveal);
    if (!mobile()) {
      const lag = sm(totemTop + i * 0.9, totemTop + i * 2.1, e);
      set("--totemscale", 1 - 0.5 * lag); set("--totemlag", lag);
    } else { set("--totemscale", 1); set("--totemlag", 0); }
    const gTop = guildsWrap.offsetTop, gH = guilds.offsetHeight;
    const F = (i - (gTop - e)) / i, f1 = G.clamp(F);
    set("--g8off", 1 - f1); set("--g8rot", 1 - f1);
    const at = gTitle.getBoundingClientRect().top / i;
    set("--g8hl", sm(1.05, 0.6, at)); set("--g8morph", sm(0.52, 0.12, at));
    set("--g8par", G.clamp((e + i - gTop) / (i + gH)));
    ST.forgeOn = forge > 0.004 && F < 1.05;
    // Pill: Skin recolored to match the section color, hidden when the guild sheet rises above 60% of the screen
    const gRect = guilds.getBoundingClientRect(), sRect = s5.getBoundingClientRect(), tRect = totemWrap.getBoundingClientRect();
    pill.classList.toggle("is-on", (mobile() || e > i * 0.15) && !(gRect.bottom < i * 0.6));
    const y = i - 52, over = (r) => r.top < y && r.bottom > y;
    let theme = "dark";
    if (over(sRect) || over(gRect)) theme = "light";
    else if ((ink > 0.55 && sRect.top > y) || (sRect.bottom < y && tRect.top > y && collapse < 0.5)) theme = "pink";
    pill.dataset.theme = theme;
    // Hero title: shrinks to .38x and vanishes over 1/3 screen of scroll
    const L = Math.min(1, e / (i * 0.33));
    ST.hero = L;
    title.style.transform = `translate3d(0, ${(-e * 0.18).toFixed(2)}px, 0) scale(${(1 - 0.62 * L).toFixed(4)})`;
    title.style.opacity = (1 - L).toFixed(4);
  };
  G.onScroll(update);

  // ── Two screen shaders: pink ink bleed (.g-ink) · golden mist with cursor torch (.g-forge). Rewritten fresh by measuring the original so the same motion appears
  const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  const NOISE = `
    float h2(vec2 q){ q = fract(q * vec2(127.13, 311.71)); q += dot(q, q + 19.19); return fract(q.x * q.y); }
    float vn(vec2 q){ vec2 c = floor(q), f = fract(q); vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(h2(c), h2(c + vec2(1.0, 0.0)), u.x), mix(h2(c + vec2(0.0, 1.0)), h2(c + vec2(1.0, 1.0)), u.x), u.y); }
    float fbm(vec2 q, int oct){ float s = 0.0, w = 0.5, n = 0.0; for (int k = 0; k < 5; k++){ if (k >= oct) break; s += vn(q) * w; n += w; q = q * 2.03 + vec2(5.2, 1.3); w *= 0.5; } return s / n; }`;
  const quad = (canvas, frag, names) => {
    const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return null;
    const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, "precision highp float;" + NOISE + frag));
    gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(pr, n)]));
    const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); canvas.width = Math.floor(canvas.clientWidth * d); canvas.height = Math.floor(canvas.clientHeight * d); };
    size(); addEventListener("resize", size);
    const draw = (u) => {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      for (const [k, v] of Object.entries(u)) { if (!U[k]) continue; if (typeof v === "number") gl.uniform1f(U[k], v); else if (v.length === 2) gl.uniform2fv(U[k], v); else gl.uniform3fv(U[k], v); }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    draw({}); // Run once ahead at setup — so the first scroll doesn’t stall while compiling
    return draw;
  };
  // Ink: a blot spreading from the center. Only the edge ripples roughly (settles at progress .4~1) and it ends fully filled with no holes. Distance reference is the farthest corner
  const inkDraw = quad($(".g-ink"), `
    uniform vec2 uRes, uO; uniform float uP, uT, uAmp, uScale; uniform vec3 uHi, uMid, uLo, uBack;
    void main(){
      vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
      float asp = uRes.x / uRes.y;
      vec2 d = (uv - uO) * vec2(asp, 1.0);
      float far = 0.0;
      for (int k = 0; k < 4; k++){ vec2 c = vec2(mod(float(k), 2.0), floor(float(k) / 2.0)); far = max(far, length((c - uO) * vec2(asp, 1.0))); }
      float r = length(d) / max(far, 0.001);
      vec2 w = vec2(fbm(uv * 2.2 + uT * 0.24, 5), fbm(uv * 2.2 + 31.7 - uT * 0.2, 5)) - 0.5;
      vec2 q = uv + w * 0.4;
      float s = uScale * 0.5;
      float n = fbm(q * s + uT * 0.14, 5) * 0.6 + fbm(q * s * 2.3 - uT * 0.09, 5) * 0.4;
      float ridge = 1.0 - abs(n * 2.0 - 1.0);
      float lobe = fbm(q * s * 0.3 + 7.0 + uT * 0.06, 5);
      float field = (n - 0.5) * 1.4 + (ridge - 0.5) * 0.6 + (lobe - 0.5) * 1.9;
      float reach = uP * 1.35 - 0.05;
      float calm = 1.0 - smoothstep(0.4, 1.0, uP);
      float cov = (reach - r) + field * uAmp * max(reach, 0.0) * calm * clamp(r * 1.8, 0.0, 1.0);
      float a = smoothstep(-0.004, 0.004, cov);
      float mott = fbm(uv * 7.0 + 3.0, 5) * 0.08 * step(0.0, cov);
      float g = clamp(length((uv - uO) * uRes) / (max(uRes.x, uRes.y) * 0.6), 0.0, 1.0);
      vec3 col = g < 0.5 ? mix(uHi, uMid, g * 2.0) : mix(uMid, uLo, (g - 0.5) * 2.0);
      gl_FragColor = vec4(mix(uBack, col * (1.0 - mott), a), 1.0);
    }`, ["uRes", "uO", "uP", "uT", "uAmp", "uScale", "uHi", "uMid", "uLo", "uBack"]);
  // Fog: noise from two layers of domain warping is pressed down to near black, with a warm torchlight at the cursor (follows at 3x per second)
  const forgeDraw = quad($(".g-forge"), `
    uniform vec2 uRes, uM; uniform float uT; uniform vec3 uBase, uGold, uCool, uTorch;
    void main(){
      float asp = uRes.x / uRes.y;
      vec2 uv = vec2(gl_FragCoord.x / uRes.x, 1.0 - gl_FragCoord.y / uRes.y);
      vec2 p = vec2(uv.x * asp, uv.y);
      float t = uT * 0.05;
      vec2 q = vec2(fbm(p * 1.7 + vec2(0.0, t), 4), fbm(p * 1.7 + vec2(4.6, -t), 4));
      vec2 r = vec2(fbm(p * 1.7 + 2.2 * q + vec2(1.7, 9.2), 4), fbm(p * 1.7 + 2.2 * q + vec2(8.3, 2.8), 4));
      float n = smoothstep(0.35, 1.0, fbm(p * 1.7 + 2.6 * r, 4));
      vec2 m = vec2(uM.x * asp, uM.y);
      float glow = exp(-dot(p - m, p - m) * 2.4);
      float field = n * (1.0 - 0.45 * length(uv - 0.5));
      vec3 col = uBase + uGold * field + uCool * field * (1.0 - glow) + uTorch * glow * (0.35 + 0.7 * field);
      gl_FragColor = vec4(col, 1.0);
    }`, ["uRes", "uM", "uT", "uBase", "uGold", "uCool", "uTorch"]);
  const scaleRGB = (c, k) => c.map((v) => v * k);
  const C = {
    hi: G.rgb("--site-pink-bright"), mid: G.rgb("--site-pink"), lo: G.rgb("--site-pink-deep"), back: G.rgb("--kf-bg"),
  };
  const gold = G.rgb("--site-gold"), cool = G.rgb("--site-cool");
  C.fBase = C.back.map((v, k) => v * 0.6 + [0.006, 0.006, 0.008][k]);
  C.fGold = scaleRGB(gold, 0.16); C.fCool = scaleRGB(cool, 0.08); C.fTorch = scaleRGB(G.rgb("--site-gold-bright"), 0.3);
  const inkEl = $(".g-ink"), forgeEl = $(".g-forge"), clockEl = $(".g-clock"), sceneEl = $(".g-scene");
  const mouse = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, cx: -1, cy: -1, on: false };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight; mouse.cx = e.clientX; mouse.cy = e.clientY; mouse.on = true; });
  let tInk = 0, tForge = 0, last = performance.now();
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    const inkOn = ST.accept || ST.inkfill > 0.001;
    inkEl.style.visibility = inkOn ? "visible" : "hidden";
    clockEl.style.visibility = ST.accept ? "visible" : "hidden";
    if (inkOn && inkDraw) { tInk += dt; inkDraw({ uO: [0.5, 0.5], uP: ST.inkfill * (mobile() ? 0.82 : 1), uT: tInk, uAmp: mobile() ? 0.45 : 0.82, uScale: 3, uHi: C.hi, uMid: C.mid, uLo: C.lo, uBack: C.back }); }
    forgeEl.style.visibility = ST.forgeOn ? "visible" : "hidden";
    mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 3); mouse.sy += (mouse.y - mouse.sy) * Math.min(1, dt * 3);
    if (ST.forgeOn && forgeDraw) { tForge += dt; forgeDraw({ uM: [mouse.sx, mouse.sy], uT: tForge, uBase: C.fBase, uGold: C.fGold, uCool: C.fCool, uTorch: C.fTorch }); }
  });

  // ── 48-hour clock: drops by 1 every second
  const digits = $$(".g-clock__d");
  let left = 172799;
  const tick = () => {
    const p2 = (v) => String(v).padStart(2, "0");
    const s = p2(Math.floor(left / 3600)) + p2(Math.floor((left % 3600) / 60)) + p2(left % 60);
    digits.forEach((d, k) => { if (d.textContent !== s[k]) d.textContent = s[k]; });
    left = Math.max(0, left - 1);
  };
  tick(); if (!G.reduce) setInterval(tick, 1000);

  // ── Sentence inside section 3 title: next pattern rises from below every 1.4s
  const crests = $$(".g-s5__crest svg");
  crests[0].classList.add("is-on");
  let ci = 0, cTimer = 0;
  const cio = new IntersectionObserver(([e]) => {
    clearInterval(cTimer);
    if (e.isIntersecting && !G.reduce) cTimer = setInterval(() => { crests[ci].classList.remove("is-on"); ci = (ci + 1) % crests.length; crests[ci].classList.add("is-on"); }, 1400);
  }, { threshold: 0.55 });
  cio.observe($(".g-s5__head"));

  // ── Vine waveform on the voice sheet (canvas)
  const garden = $(".g-voice__garden"), gctx = garden.getContext("2d");
  const ink72 = G.css("--site-ink-55"), accent = G.css("--kf-accent");
  let gt = 0;
  gsap.ticker.add(() => {
    const vis = ST.a > 3 && ST.forge < 0.999;
    if (!vis) return;
    const w = (garden.width = garden.clientWidth * 2), h = (garden.height = garden.clientHeight * 2);
    gt += 1 / 60;
    gctx.lineWidth = 2; gctx.lineCap = "round";
    for (let k = 0; k < 6; k++) {
      gctx.strokeStyle = k % 2 ? ink72 : accent; gctx.globalAlpha = 0.35 + (k % 3) * 0.15;
      gctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const u = x / w, env = Math.sin(u * Math.PI) ** 1.5;
        const y = h / 2 + Math.sin(u * (9 + k * 2) + gt * (1.4 + k * 0.3) + k) * h * 0.3 * env * (0.5 + 0.5 * Math.sin(gt * 0.8 + k));
        x ? gctx.lineTo(x, y) : gctx.moveTo(x, y);
      }
      gctx.stroke();
    }
    gctx.globalAlpha = 1;
  });

  if (!window.THREE) return;
  const T = window.THREE;

  // ── Hero card spiral (three): original values angleStep .65 · radius 2.6 · flatten .7 · horizontal offset -.05 · vertical .4 · edge twist -.06 · size .65 · bend .06 ·
  //    Auto-rotation .15 rad/s · mouse tilt .12 · magnet .1. It starts at radius 12 · speed 1 · size .4 and gathers in over 2.2s easeOutCubic.
  // Scroll: .18~.72 a stack on screen, 1.18~1.7 only the front one (×1.35), 1.95~2.55 shrinks to ×.86 while rising .55 (phone screen cell)
  const NE = { angleStep: 0.65, radius: 2.6, squish: 0.7, gapX: -0.05, gapY: 0.4, edgeTwist: -0.06, cardScale: 0.65, bend: 0.06, autoSpeed: 0.15, mouseTilt: 0.12, magnet: 0.1 };
  const cv = $(".g-scene__cv");
  const renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(38, 1, 0.1, 80);
  cam.position.set(0, 0, 6.5);
  const holder = new T.Group(); scene.add(holder);
  const resize = () => { const w = cv.clientWidth, h = cv.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  resize(); addEventListener("resize", resize);

  const col = {
    paper: G.css("--site-paper"), ink: G.css("--site-paper-ink"), dim: G.css("--site-paper-dim"), line: G.css("--site-paper-line"),
    s1: G.css("--site-stat-1"), s2: G.css("--site-stat-2"), s3: G.css("--site-stat-3"), s4: G.css("--site-stat-4"),
    gold: G.css("--site-gold"), pink: G.css("--kf-accent"), bg: G.css("--kf-bg"), sky: G.css("--site-pink-bright"),
  };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
  const patterns = [
    (c, w, h) => { c.fillStyle = col.s1; c.fillRect(0, 0, w, h); c.fillStyle = col.gold; const s = w / 5; for (let y = 0; y < h / s + 1; y++) for (let x = 0; x < 5; x++) if ((x + y) % 2) c.fillRect(x * s, y * s, s, s); },
    (c, w, h) => { c.fillStyle = col.pink; c.fillRect(0, 0, w, h); c.fillStyle = col.gold; c.fillRect(0, h * 0.72, w, h * 0.28); [[0.5, 0.28, 0.17], [0.33, 0.42, 0.15], [0.67, 0.42, 0.15], [0.5, 0.5, 0.14]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x * w, y * h, r * w, 0, 7); c.fill(); }); c.fillRect(w * 0.45, h * 0.5, w * 0.1, h * 0.25); c.fillStyle = col.pink; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(w * (0.2 + k * 0.2), h * 0.86, w * 0.05, 0, 7); c.fill(); } },
    (c, w, h) => { c.fillStyle = col.s1; c.fillRect(0, 0, w, h); c.fillStyle = col.s2; [0.08, 0.43, 0.78].forEach((x) => c.fillRect(x * w, 0, w * 0.14, h)); for (let k = 0; k < 7; k++) c.fillRect((k % 2 ? 0.57 : 0.22) * w, (0.08 + k * 0.13) * h, w * 0.21, h * 0.05); },
    (c, w, h) => { c.fillStyle = col.s2; c.fillRect(0, 0, w, h); c.fillStyle = col.bg; const s = w / 4; for (let y = 0; y < h / s + 1; y++) for (let x = 0; x < 5; x++) { const cx = x * s + ((y % 2) * s) / 2, cy = y * s; c.beginPath(); c.moveTo(cx, cy - s / 2); c.lineTo(cx + s / 2, cy); c.lineTo(cx, cy + s / 2); c.lineTo(cx - s / 2, cy); c.fill(); } },
    (c, w, h) => { c.fillStyle = col.gold; c.fillRect(0, 0, w, h); c.fillStyle = col.s1; const s = w / 4; for (let y = 0; y < h / s + 1; y++) for (let x = 0; x < 5; x++) { c.beginPath(); c.arc(x * s + ((y % 2) * s) / 2, y * s, s / 2, 0, Math.PI); c.fill(); } },
  ];
  const texOf = (cnv) => { const t = new T.CanvasTexture(cnv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; };
  const questTex = (k) => {
    const w = 320, h = 480, cnv = document.createElement("canvas"); cnv.width = w; cnv.height = h;
    const c = cnv.getContext("2d");
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, col.paper); g.addColorStop(1, col.line);
    rr(c, 0, 0, w, h, 26); c.fillStyle = col.paper; c.fill(); c.save(); c.clip(); c.fillStyle = g; c.globalAlpha = 0.6; c.fillRect(0, 0, w, h); c.restore();
    c.save(); rr(c, 22, 22, 50, 52, 12); c.clip(); patterns[k % patterns.length](c, 50, 52); c.restore();
    const f = getComputedStyle(root).getPropertyValue("--kf-font-sans");
    c.fillStyle = col.dim; c.font = `500 13px ${f}`; c.fillText("Group name 00", 24, 98);
    c.fillStyle = col.ink; c.font = `700 30px ${f}`;
    ["Today’s text here", "The task in four lines", "Written in bold", "We put it in."].forEach((l, j) => c.fillText(l, 22, 140 + j * 33));
    c.fillStyle = col.dim; c.font = `400 14px ${f}`;
    ["Your two-line description goes here.", "Written as short, linked lines."].forEach((l, j) => c.fillText(l, 22, 300 + j * 19));
    for (let j = 0; j < 3; j++) {
      rr(c, 22 + j * 76, 392, 68, 28, 14); c.fillStyle = col.line; c.fill();
      c.beginPath(); c.arc(36 + j * 76, 406, 10, 0, 7); c.fillStyle = [col.gold, col.pink, col.s3][j]; c.fill();
      c.fillStyle = col.ink; c.font = `500 11px ${f}`; c.fillText("0:00", 50 + j * 76, 410);
    }
    c.fillStyle = col.dim; c.font = `500 11px ${f}`; c.fillText("+00", 254, 410);
    c.font = `400 10px ${f}`; c.fillText("Your very short closing line here", 22, 452);
    return texOf(cnv);
  };
  const patTex = (k) => {
    const w = 200, h = 284, cnv = document.createElement("canvas"); cnv.width = w; cnv.height = h;
    const c = cnv.getContext("2d"); rr(c, 0, 0, w, h, 14); c.clip(); patterns[k % patterns.length](c, w, h);
    return texOf(cnv);
  };
  // One card = Two faces: front (quest post) and back (text pattern). Turning to the back of the spiral reveals the pattern face, so ”Pattern card” shows up mixed in (original 18 cards, width 2.4, bend .06)
  const geo = (w, h, back) => {
    const g = new T.PlaneGeometry(w, h, 24, 16), p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const u = (p.getX(k) / w) * 2; p.setZ(k, NE.bend * (1 - u * u) * (back ? -1 : 1)); }
    if (back) g.rotateY(Math.PI);
    return g;
  };
  const CW = 1.75, CH = CW * 1.5;
  const gFront = geo(CW, CH, false), gBack = geo(CW, CH, true);
  const N = 18, cards = [];
  for (let k = 0; k < N; k++) {
    const opt = { transparent: true, side: T.FrontSide, depthTest: false, depthWrite: false };
    const front = new T.Mesh(gFront, new T.MeshBasicMaterial({ ...opt, map: questTex(k) }));
    const back = new T.Mesh(gBack, new T.MeshBasicMaterial({ ...opt, map: patTex(k) }));
    const m = new T.Group(); m.add(front, back);
    holder.add(m); cards.push({ m, mats: [front.material, back.material], k });
  }
  renderer.compile(scene, cam);
  const intro = { t: G.reduce ? 1 : 0, started: G.reduce || root.classList.contains("is-loaded") };
  if (intro.started) intro.t = 1;
  G.timeline.spiral = () => { intro.started = true; intro.t0 = performance.now(); };
  let theta = 0, tilt = { x: 0, y: 0 }, lastS = performance.now(), front = 0;
  const K = (a, b, t) => a + (b - a) * t;
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - lastS) / 1000)); lastS = now;
    const on = ST.sceneOn && (ST.a < 1.2 + 6 || ST.forge < 1) && !(ST.forge >= 0.999);
    sceneEl.style.visibility = on ? "visible" : "hidden";
    if (!on) return;
    if (intro.started && intro.t0) intro.t = Math.min(1, (now - intro.t0) / 2200);
    const m = 1 - (1 - intro.t) ** 3;
    const R = 12 + (NE.radius - 12) * m, speed = 1 + (NE.autoSpeed - 1) * m, sc0 = 0.4 + (NE.cardScale - 0.4) * m;
    const a = ST.a, l = sm(0.18, 0.72, a), u = sm(1.18, 1.7, a), f = sm(1.95, 2.55, a);
    // Original: camera sits radius × flatness + 6.5 behind (38° view angle), so the camera also approaches as they gather
    cam.position.z = R * NE.squish + 6.5;
    if (!G.reduce) theta += speed * NE.angleStep * dt * (1 - l);
    // Mouse tilt: with screen coordinates (-1~1), the x axis tilts up/down and the z axis left/right — follows at 4× per second
    const ex = mouse.on ? mouse.x * 2 - 1 : 0, ey = mouse.on ? -(((mouse.cy - cv.getBoundingClientRect().top) / cv.clientHeight) * 2 - 1) : 0;
    tilt.x += (-ey * NE.mouseTilt - tilt.x) * Math.min(1, dt * 4);
    tilt.y += (ex * NE.mouseTilt - tilt.y) * Math.min(1, dt * 4);
    holder.rotation.set(tilt.x * (1 - l), 0, -tilt.y * (1 - l));
    // Cursor world position (z=0 plane): half height = tan(19°) × camera distance
    const hh = Math.tan((38 * Math.PI) / 360) * cam.position.z, mx = ex * hh * cam.aspect, my = ey * hh;
    const span = N * NE.angleStep;
    if (l < 0.01) { let best = 1e9; cards.forEach((cd, k) => { const s = ((k * NE.angleStep + theta) % span + span * 1.5) % span - span / 2; if (Math.abs(s) < best) { best = Math.abs(s); front = k; } }); }
    cards.forEach((cd, k) => {
      const s = ((k * NE.angleStep + theta) % span + span * 1.5) % span - span / 2;
      const n = s / NE.angleStep, cs = Math.cos(s), sn = Math.sin(s);
      let x = R * sn + n * NE.gapX, y = -n * NE.gapY, z = R * NE.squish * cs;
      const dx = mx - x, dy = my - y, pull = mouse.on ? NE.magnet * Math.exp(-(dx * dx + dy * dy) / 9) * (1 - l) : 0;
      x += dx * pull; y += dy * pull;
      const c = ((k - front + N * 1.5) % N) - N / 2;
      const twist = -sn * NE.edgeTwist, light = Math.max(0.32, 0.5 + 0.5 * cs);
      const fade = G.clamp((9 - Math.abs(n)) / 1.2) * (1 - u) + (k === front ? u : 0);
      let px = K(x, c * 0.004, l), py = K(y, c * 0.0035, l), pz = K(z, -Math.abs(c) * 0.012, l);
      let ry = K(s, 0, l), rz = K(twist, 0, l), scl = K(sc0, NE.cardScale * 1.15, l), lit = K(light, 1, l);
      px = K(px, 0, u); py = K(py, 0, u); pz = K(pz, 0, u); ry = K(ry, 0, u); rz = K(rz, 0, u);
      scl = K(scl, k === front ? NE.cardScale * 1.35 : 0, u); lit = K(lit, 1, u);
      scl *= 1 - (1 - 0.86) * f; py += 0.55 * f;
      cd.m.position.set(px, py, pz);
      cd.m.rotation.set(0, ry, rz);
      cd.m.scale.setScalar(Math.max(0.0001, scl));
      cd.m.renderOrder = Math.round(K(pz * 100, (50 - Math.abs(c)) * 2, l));
      cd.m.children.forEach((ch) => (ch.renderOrder = cd.m.renderOrder));
      cd.mats.forEach((mt) => { mt.color.setScalar(lit); mt.opacity = G.clamp(fade); });
      cd.m.visible = fade > 0.01;
    });
    renderer.render(scene, cam);
  });

  // ── Section 5 statue (three): the original is a metal model (glb). Built from our basic shapes with the same size and silhouette ratio, with the same lighting (white 20 · blue 24.5) and swap values
  //    (slides sideways 5.9 · turns .26 · entering ×2.3 to 1 · leaving ×.2 · expo/back curves), and uses idle sway (sin .6·.45·.5) and cursor tilt (±.5·±.4, 4x per second)
  const stage = $(".g-totem__stage");
  const r2 = new T.WebGLRenderer({ canvas: stage, antialias: true, alpha: true });
  r2.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  r2.outputColorSpace = T.SRGBColorSpace; r2.toneMapping = T.ACESFilmicToneMapping; r2.toneMappingExposure = 0.95;
  const s2 = new T.Scene();
  const cam2 = new T.PerspectiveCamera(32, 1, 0.1, 50);
  cam2.position.set(0, 0.15, 5.2); cam2.lookAt(0, 0, 0);
  // Ambient light the metal reflects — a horizontal band painted bright gold at top, dark indigo at bottom
  const env = document.createElement("canvas"); env.width = 256; env.height = 128;
  const ec = env.getContext("2d"), eg = ec.createLinearGradient(0, 0, 0, 128);
  eg.addColorStop(0, col.paper); eg.addColorStop(0.25, G.css("--site-gold-bright")); eg.addColorStop(0.5, G.css("--site-gold")); eg.addColorStop(0.62, col.bg); eg.addColorStop(1, G.css("--site-cool"));
  ec.fillStyle = eg; ec.fillRect(0, 0, 256, 128);
  ec.fillStyle = col.paper; ec.globalAlpha = 0.8; ec.fillRect(40, 18, 40, 22); ec.fillRect(170, 26, 30, 14); ec.globalAlpha = 1;
  const eTex = new T.CanvasTexture(env); eTex.mapping = T.EquirectangularReflectionMapping; eTex.colorSpace = T.SRGBColorSpace;
  const pm = new T.PMREMGenerator(r2); const envMap = pm.fromEquirectangular(eTex).texture; s2.environment = envMap;
  const key = new T.PointLight(new T.Color().setRGB(...G.rgb("--site-paper"), T.SRGBColorSpace), 20); key.position.set(2.29, -0.29, 1.11); s2.add(key);
  const rim = new T.PointLight(new T.Color().setRGB(...G.rgb("--site-stat-4"), T.SRGBColorSpace), 24.5); rim.position.set(-1.8, 0.2, -1.1); s2.add(rim);
  const metal = new T.MeshStandardMaterial({ color: new T.Color().setRGB(...G.rgb("--site-gold-bright"), T.SRGBColorSpace), metalness: 1, roughness: 0.34, envMapIntensity: 1.8 });
  const mk = (g, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => { const m = new T.Mesh(g, metal); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx, ry, rz); return m; };
  const S = (r) => new T.SphereGeometry(r, 32, 24), Cy = (r1, r2_, h) => new T.CylinderGeometry(r1, r2_, h, 32), Co = (r, h) => new T.ConeGeometry(r, h, 24);
  const figure = (kind) => {
    const g = new T.Group();
    g.add(mk(S(0.62), 0, -0.45, 0, 1, 1.12, 0.9));
    g.add(mk(S(0.42), 0, 0.42, 0.05));
    g.add(mk(S(0.16), -0.28, -1.18, 0.12, 1.3, 0.45, 1.6), mk(S(0.16), 0.28, -1.18, 0.12, 1.3, 0.45, 1.6));
    g.add(mk(S(0.2), -0.62, -0.42, 0.05, 0.6, 1.3, 0.8, 0, 0, 0.35), mk(S(0.2), 0.62, -0.42, 0.05, 0.6, 1.3, 0.8, 0, 0, -0.35));
    if (kind === 0) { g.add(mk(Cy(0.44, 0.46, 0.42), 0, 0.62, 0.02)); g.add(mk(Co(0.13, 0.5), 0, 0.3, 0.52, 1.4, 1, 0.5, Math.PI / 2)); g.add(mk(Co(0.06, 0.32), 0, 0.98, 0)); }
    if (kind === 1) { g.add(mk(Co(0.13, 0.32), -0.24, 0.84, 0, 1, 1, 0.5, 0, 0, 0.3), mk(Co(0.13, 0.32), 0.24, 0.84, 0, 1, 1, 0.5, 0, 0, -0.3)); g.add(mk(Cy(0.03, 0.03, 1.5), 0.75, 0.1, -0.2, 1, 1, 1, 0, 0, -0.5)); }
    if (kind === 2) { g.add(mk(S(0.14), -0.3, 0.76, 0), mk(S(0.14), 0.3, 0.76, 0)); g.add(mk(S(0.16), 0, 0.32, 0.4, 1, 0.8, 0.8)); }
    if (kind === 3) { g.add(mk(S(0.2), -0.32, 0.72, 0, 1, 1, 0.3), mk(S(0.2), 0.32, 0.72, 0, 1, 1, 0.3)); g.add(mk(Co(0.14, 0.5), 0, 0.35, 0.5, 1, 1, 1, Math.PI / 2)); }
    if (kind === 4) { g.add(mk(S(0.13), -0.2, 0.78, 0.12), mk(S(0.13), 0.2, 0.78, 0.12)); g.add(mk(Co(0.5, 0.36), 0, 1.05, 0)); }
    if (kind === 5) { g.add(mk(Co(0.11, 0.34), 0, 0.36, 0.5, 1, 1, 1, Math.PI / 2)); g.add(mk(S(0.5), 0, -0.4, 0.18, 0.9, 1, 0.5)); }
    g.scale.setScalar(1.05); g.position.y = -0.05;
    return g;
  };
  const SW = { offset: 5.9, rot: 0.26, enterScale: 2.3, exitScale: 0.2, dur: 1.1 };
  const backOut = (t) => { const s = 1.9; return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2; };
  const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  let items = [{ g: figure(0), mode: "idle", t: 1, dir: 1 }];
  s2.add(items[0].g);
  r2.compile(s2, cam2);
  const size2 = () => { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; r2.setSize(w, h, false); cam2.aspect = w / h; cam2.updateProjectionMatrix(); };
  size2(); addEventListener("resize", size2);
  const totem = $(".g-totem"), pills = $$(".g-totem__pill");
  const BACK = ["Name", "Form", "Kind", "Type", "Sort", "Mode"], FRONT = [["The", "Title"], ["The", "Role"], ["The", "Rank"], ["The", "Post"], ["The", "Part"], ["The", "Seat"]];
  const ONE = ["Add a three-line description of character here.", "Your second description here, in three lines.", "Your third description on two lines.", "Your fourth description here, in three lines.", "Your fifth explanation goes here in three lines.", "Your sixth description here, in two lines."];
  let cur = 0;
  // Swap in a new element so the css animation runs again with its own delays (.14·.23s)
  const restart = (el) => el.replaceWith(el.cloneNode(true));
  const pick = (idx, dir) => {
    if (idx === cur) return;
    cur = idx;
    pills.forEach((p, k) => { p.classList.toggle("is-on", k === idx); p.setAttribute("aria-selected", k === idx); });
    $(".g-totem__back .g-totem__w").textContent = BACK[idx];
    $$(".g-totem__front .g-totem__w").forEach((w, k) => (w.textContent = FRONT[idx][k]));
    $$(".g-totem__back .g-totem__w, .g-totem__front .g-totem__w").forEach(restart);
    const one = $(".g-totem__one"); one.textContent = ONE[idx]; restart(one);
    const dg = $(".g-totem__digit"); dg.textContent = idx + 1; restart(dg);
    items.forEach((it) => { if (it.mode !== "exit") { it.mode = "exit"; it.t = 0; it.dir = dir; } });
    const g = figure(idx); s2.add(g);
    items.push({ g, mode: G.reduce ? "idle" : "enter", t: G.reduce ? 1 : 0, dir });
  };
  pills.forEach((p, k) => p.addEventListener("click", () => pick(k, k > cur ? 1 : -1)));
  // Big arrow cursor — follows the mouse directly and flips when on the left half of the screen. Hidden over the bottom control row (260px)
  const cursor = $(".g-cursor");
  const CTRL = 260;
  let inTotem = false;
  totem.addEventListener("pointerenter", () => (inTotem = true));
  totem.addEventListener("pointerleave", () => { inTotem = false; cursor.classList.remove("is-on"); totem.classList.remove("is-cursor"); });
  if (G.fine) addEventListener("pointermove", (e) => {
    const low = e.clientY > innerHeight - CTRL;
    cursor.style.transform = `translate(${e.clientX - 48}px, ${e.clientY - 48}px)`;
    const side = e.clientX < innerWidth / 2 ? "left" : "right";
    cursor.dataset.side = side;
    const show = inTotem && !low && ST.forge > 0.5;
    cursor.classList.toggle("is-on", show); totem.classList.toggle("is-cursor", show);
  });
  totem.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.clientY > innerHeight - CTRL) return;
    const step = e.clientX < innerWidth / 2 ? -1 : 1;
    pick((cur + step + 6) % 6, step);
  });
  let X = 0, Y = 0, last2 = performance.now(), clock2 = 0;
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - last2) / 1000)); last2 = now;
    const r = totem.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || ST.forge < 0.02) return;
    clock2 += dt;
    const inside = mouse.cy >= r.top && mouse.cy <= r.bottom;
    const tx = inside ? G.clamp(((mouse.cx - r.left) / r.width) * 2 - 1, -0.5, 0.5) : 0;
    const ty = inside ? G.clamp(((mouse.cy - r.top) / r.height) * 2 - 1, -0.4, 0.4) : 0;
    const k = Math.min(1, dt * 4); X += (tx * 0.5 - X) * k; Y += (ty * 0.35 - Y) * k;
    const bob = G.reduce ? 0 : Math.sin(clock2 * 0.6) * 0.07, yaw = G.reduce ? 0 : Math.sin(clock2 * 0.45) * 0.06, roll = G.reduce ? 0 : Math.sin(clock2 * 0.5 + 1.3) * 0.025;
    items = items.filter((it) => {
      let rot = 0;
      if (it.mode === "enter") {
        it.t = Math.min(1, it.t + dt / SW.dur);
        const e = backOut(it.t), n = inOutCubic(it.t);
        it.g.position.x = it.dir * SW.offset * (1 - e);
        it.g.scale.setScalar(1.05 * (SW.enterScale - (SW.enterScale - 1) * n));
        rot = it.dir * SW.rot * (1 - n);
        if (it.t >= 1) it.mode = "idle";
      } else if (it.mode === "exit") {
        it.t = Math.min(1, it.t + dt / SW.dur);
        const e = 1 - (1 - it.t) ** 4, n = inOutCubic(it.t);
        it.g.position.x = -it.dir * SW.offset * e;
        it.g.scale.setScalar(1.05 * (1 - (1 - SW.exitScale) * n));
        rot = -it.dir * SW.rot * n;
        if (it.t >= 1) { s2.remove(it.g); return false; }
      }
      it.g.position.y = -0.05 + bob;
      it.g.rotation.set(Y, X + rot + yaw, roll);
      return true;
    });
    r2.render(s2, cam2);
  });

  // ── Section 6 ball stacking (matter 0.20): gravity 1.4 · position iterations 12 · velocity iterations 8. White balls drop into four cells and on contact bounce up for .42s, turning that cell’s color.
  //    Holding the mouse down spawns a ball on the spot (horizontal speed = Mouse speed ×.8, ±9). Up to 260 balls
  const MJ = window.Matter, scv = $(".g-stats__cv"), stats = $(".g-stats");
  if (MJ) {
    const { Engine, Bodies, Composite, Body, Events } = MJ;
    const eng = Engine.create({ enableSleeping: true });
    eng.gravity.y = 1.4; eng.positionIterations = 12; eng.velocityIterations = 8;
    const ctx = scv.getContext("2d");
    const COLS = ["--site-stat-1", "--site-stat-2", "--site-stat-3", "--site-stat-4"].map((v) => G.css(v));
    const white = G.css("--kf-ink");
    const counts = [0, 0, 0, 0], countEls = $$(".g-stats__label b");
    let W = 0, H = 0, walls = [], balls = [], meta = new WeakMap();
    const build = () => {
      const d = Math.min(devicePixelRatio || 1, 1.5);
      W = scv.clientWidth; H = scv.clientHeight; scv.width = W * d; scv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      walls.forEach((w) => Composite.remove(eng.world, w));
      walls = [Bodies.rectangle(W / 2, H + 30, W * 2, 60, { isStatic: true }), Bodies.rectangle(-30, H / 2, 60, H * 3, { isStatic: true }), Bodies.rectangle(W + 30, H / 2, 60, H * 3, { isStatic: true })];
      for (let k = 1; k < 4; k++) walls.push(Bodies.rectangle((W * k) / 4, H - 70, 2, 140, { isStatic: true }));
      Composite.add(eng.world, walls);
    };
    build(); addEventListener("resize", build);
    const spawn = (x, y, vx = 0) => {
      const r = 18 + Math.random() * 16;
      const b = Bodies.circle(x, y, r, { restitution: 0.2, friction: 0.3, frictionAir: 0.01, density: 0.002 });
      Body.setVelocity(b, { x: G.clamp(vx * 0.8, -9, 9), y: 1 + Math.random() });
      meta.set(b, { landed: false, col: -1, pop: 0, r });
      balls.push(b); Composite.add(eng.world, b);
      if (balls.length > 260) { const old = balls.shift(); Composite.remove(eng.world, old); }
    };
    Events.on(eng, "collisionStart", (ev) => {
      for (const p of ev.pairs) for (const b of [p.bodyA, p.bodyB]) {
        const m = meta.get(b);
        if (!m || m.landed) continue;
        const other = b === p.bodyA ? p.bodyB : p.bodyA;
        const om = meta.get(other);
        if (other.isStatic || (om && om.landed)) {
          m.landed = true; m.col = Math.min(3, Math.max(0, Math.floor((b.position.x / W) * 4))); m.pop = 0;
          counts[m.col]++; countEls[m.col].textContent = counts[m.col];
        }
      }
    });
    let active = false, waves = 0, hold = false, lastSpawn = 0, pvx = 0, plx = 0;
    new IntersectionObserver(([e]) => (active = e.isIntersecting), { threshold: 0.05 }).observe(stats);
    scv.addEventListener("pointerdown", () => (hold = true));
    addEventListener("pointerup", () => (hold = false));
    addEventListener("pointermove", (e) => { pvx = e.clientX - plx; plx = e.clientX; });
    let last3 = performance.now();
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(0.033, Math.max(0.001, (now - last3) / 1000)); last3 = now;
      if (!active || G.reduce) return;
      if (stats.classList.contains("is-in") && waves < 22 && now - lastSpawn > 260) {
        lastSpawn = now; waves++;
        for (let c = 0; c < 4; c++) spawn((W * c) / 4 + 40 + Math.random() * (W / 4 - 80), -40 - Math.random() * 60);
      }
      if (hold && now - lastSpawn > 70) { lastSpawn = now; const r = scv.getBoundingClientRect(); spawn(mouse.cx - r.left, mouse.cy - r.top, pvx); }
      Engine.update(eng, dt * 1000);
      ctx.clearRect(0, 0, W, H);
      for (const b of balls) {
        const m = meta.get(b);
        if (m.landed) m.pop = Math.min(1, m.pop + dt / 0.42);
        const s = m.landed ? 0.82 + 0.18 * backOut(m.pop) : 1;
        ctx.beginPath(); ctx.arc(b.position.x, b.position.y, m.r * s, 0, 7);
        ctx.fillStyle = m.landed ? COLS[m.col] : white; ctx.globalAlpha = m.landed ? 1 : 0.9; ctx.fill();
        if (m.landed) { ctx.beginPath(); ctx.arc(b.position.x - m.r * 0.25, b.position.y - m.r * 0.25, m.r * 0.32 * s, 0, 7); ctx.fillStyle = white; ctx.globalAlpha = 0.18; ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    });
  }

  // ── Section 7 sentence wheel: ten sentences rotate 4° per second, plus scroll speed (×.05, ±110°/s). The sentence near the cursor is pushed outward (Gaussian width 26°) and the name of the top sentence shows up
  const wheel = $(".g-guilds__wheel"), gname = $(".g-guilds__name");
  const SYMS = ["g-cr-diag", "g-cr-ladder", "g-cr-check", "g-cr-tree", "g-cr-ship"];
  const NAMES = ["The Gathering of Names", "The Fellowship of Words", "The Keepers of Name", "The Finders of Lost Way", "The Wave Shifters"];
  const crestEls = [];
  for (let k = 0; k < 10; k++) {
    const sp = document.createElement("div"); sp.className = "g-guilds__spoke"; sp.style.transform = `rotate(${k * 36 + 15}deg)`;
    const cr = document.createElement("span"); cr.className = "g-guilds__crest";
    cr.innerHTML = `<svg viewBox="0 0 100 100"><use href="#${SYMS[k % 5]}"/></svg>`;
    sp.append(cr); wheel.append(sp); crestEls.push(cr);
  }
  const wrap = (d) => ((d % 360) + 540) % 360 - 180;
  let deg = 15, vel = 0, lastY = G.scroll(), last4 = performance.now(), gOn = false;
  const bump = new Array(10).fill(0);
  new IntersectionObserver(([e]) => (gOn = e.isIntersecting), { threshold: 0.12 }).observe(guilds);
  gsap.ticker.add(() => {
    const now = performance.now(), dt = Math.min(0.05, Math.max(0.001, (now - last4) / 1000)); last4 = now;
    const y = G.scroll();
    if (!gOn) { lastY = y; return; }
    const v = (y - lastY) / dt; lastY = y;
    vel += (v - vel) * Math.min(1, dt * 6);
    const add = G.clamp(vel * 0.05, -110, 110);
    if (!G.reduce) deg += (4 + add) * dt;
    wheel.style.transform = `rotate(${deg}deg)`;
    const wr = wheel.getBoundingClientRect(), cx = wr.left + wr.width / 2, cy = wr.top + wr.height / 2, rad = wheel.offsetWidth / 2;
    const dx = mouse.cx - cx, dy = mouse.cy - cy, md = Math.hypot(dx, dy), ma = (Math.atan2(dx, -dy) * 180) / Math.PI;
    let best = 1e9, bi = 0, bang = 0;
    for (let k = 0; k < 10; k++) {
      const ang = wrap(k * 36 + 15 + deg);
      if (Math.abs(ang) < best) { best = Math.abs(ang); bi = k; bang = ang; }
      let want = 0;
      if (mouse.on && G.fine) { const da = wrap(ma - ang), g = Math.exp(-((da / 26) ** 2)), proj = md * Math.cos((da * Math.PI) / 180); want = G.clamp((proj - rad) * 1.8, -0.09 * rad, 0.13 * rad) * g; }
      bump[k] += (want - bump[k]) * Math.min(1, dt * 7);
      crestEls[k].style.transform = `translate(-50%, calc(-50% + ${(-bump[k]).toFixed(1)}px))`;
    }
    const calm = Math.max(0, 1 - Math.abs(4 + add) / 80), near = G.clamp(1 - (best - 6) / 16) * calm;
    const gr = guilds.getBoundingClientRect(), t = (bang * Math.PI) / 180;
    gname.textContent = NAMES[bi % 5];
    gname.style.left = `${cx - gr.left + Math.sin(t) * (rad + bump[bi])}px`;
    gname.style.top = `${cy - gr.top - Math.cos(t) * (rad + bump[bi]) + crestEls[bi].offsetHeight / 2 + 10}px`;
    gname.style.opacity = near.toFixed(3);
  });

  // ── Final section light rays (canvas): soft beams descending from top center sway slowly
  const rays = $(".g-foot__rays"), rctx = rays.getContext("2d"), pinkRay = G.css("--kf-accent");
  let rt = 0;
  gsap.ticker.add(() => {
    const r = rays.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const w = (rays.width = Math.floor(rays.clientWidth * 0.6)), h = (rays.height = Math.floor(rays.clientHeight * 0.6));
    rt += G.reduce ? 0 : 1 / 60;
    rctx.globalCompositeOperation = "lighter";
    for (let k = 0; k < 9; k++) {
      const a = (k - 4) * 0.14 + Math.sin(rt * 0.3 + k * 1.7) * 0.05, len = h * (0.75 + 0.2 * Math.sin(rt * 0.5 + k));
      const g = rctx.createLinearGradient(w / 2, 0, w / 2 + Math.sin(a) * len, Math.cos(a) * len);
      g.addColorStop(0, pinkRay); g.addColorStop(1, "transparent");
      rctx.globalAlpha = 0.05 + 0.03 * Math.sin(rt + k);
      rctx.fillStyle = g; rctx.beginPath(); rctx.moveTo(w / 2 - 6, 0);
      rctx.lineTo(w / 2 + Math.sin(a - 0.07) * len, Math.cos(a - 0.07) * len); rctx.lineTo(w / 2 + Math.sin(a + 0.07) * len, Math.cos(a + 0.07) * len);
      rctx.closePath(); rctx.fill();
    }
    rctx.globalAlpha = 1; rctx.globalCompositeOperation = "source-over";
  });
})();
