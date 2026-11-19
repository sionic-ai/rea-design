(() => {
  const rw = window.rw;
  const { clamp, mix, sstep, damp, reduce, coarse } = rw;
  const smoother = (e) => e * e * e * (e * (6 * e - 15) + 10);

  // ── Text scramble: per word, swap a few letters for italic substitute letters using a seeded random (the original’s salt substitute-letter slot) ──
  const WEIGHT = { a: 3, e: 3, r: 3, h: 3, n: 2, m: 2, k: 2, d: 2, o: 2, c: 2, s: 2, u: 1, v: 1, w: 1, b: 1, p: 1, q: 1, x: 1, z: 1 };
  const hash = (s, seed) => { let h = (0x811c9dc5 ^ seed) >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x1000193) >>> 0; } return h; };
  const rand = (seed) => { let t = seed >>> 0; return () => { t = (t + 0x6d2b79f5) >>> 0; let e = Math.imul(t ^ (t >>> 15), 1 | t); e ^= e + Math.imul(e ^ (e >>> 7), 61 | e); return ((e ^ (e >>> 14)) >>> 0) / 4294967296; }; };
  const letters = (w) => w.replace(/[^A-Za-z]/g, "").length;
  const mixable = (w, min = 4) => letters(w) >= min && !/[A-Z]{2}|\w\.\w|\d/.test(w);
  function pickMix(word, seed, rate, min) {
    if (!mixable(word, min)) return [];
    const r = rand(hash(word, seed));
    let pool = [...word].map((ch, i) => ({ i, w: i > 0 ? WEIGHT[ch] || 0 : 0 })).filter((p) => p.w > 0);
    let n = Math.max(1, Math.round(letters(word) / rate + (r() - 0.5) * 0.8));
    const out = [];
    while (n-- > 0 && pool.length) {
      let k = r() * pool.reduce((a, p) => a + p.w, 0), pick = pool[pool.length - 1];
      for (const p of pool) if ((k -= p.w) <= 0) { pick = p; break; }
      out.push(pick.i);
      pool = pool.filter((p) => Math.abs(p.i - pick.i) > 2);
    }
    return out;
  }
  function inkWord(word, seed, rate = 5, min = 4) {
    const at = new Set(pickMix(word, seed, rate, min));
    const frag = document.createDocumentFragment();
    let run = "";
    [...word].forEach((ch, i) => {
      if (!at.has(i)) { run += ch; return; }
      if (run) { frag.append(run); run = ""; }
      const s = document.createElement("span");
      s.className = "rw-mix";
      s.textContent = ch;
      frag.append(s);
    });
    if (run) frag.append(run);
    return frag;
  }

  // ── first section title: each line rises from 108% below inside a hidden slot (1.05s ooze, .11s stagger). Size is set so the longest line is 86% of the screen width ──
  const title = document.querySelector(".rw-title");
  const inks = [...document.querySelectorAll(".rw-rail")].map((rail, li) => {
    const text = rail.textContent.trim();
    rail.removeAttribute("data-glass");
    rail.textContent = "";
    const sr = document.createElement("span");
    sr.className = "rw-sr";
    sr.textContent = text + " ";
    const ink = document.createElement("span");
    ink.className = "rw-rail__ink";
    ink.setAttribute("aria-hidden", "true");
    ink.setAttribute("data-glass", "");
    text.split(/(\s+)/).forEach((part, wi) => ink.append(/^\s+$/.test(part) ? part : inkWord(part, 17 * li + wi, 5, 3)));
    rail.append(sr, ink);
    return ink;
  });
  const fit = () => {
    title.style.fontSize = "";
    for (let k = 0; k < 2; k++) {
      const fs = parseFloat(getComputedStyle(title).fontSize) || 16;
      let widest = 0;
      const range = document.createRange();
      inks.forEach((ink) => { range.selectNodeContents(ink); widest = Math.max(widest, range.getBoundingClientRect().width); });
      if (widest > 0) title.style.fontSize = ((fs * 0.86 * innerWidth) / widest).toFixed(2) + "px";
    }
  };
  fit();
  document.fonts?.ready.then(() => { fit(); ScrollTrigger.refresh(); });
  addEventListener("resize", fit);

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.still) { gsap.set(inks, { yPercent: 0 }); return; }
    gsap.set(inks, { yPercent: 108 });
    ScrollTrigger.create({ trigger: title, start: "top 82%", once: true, onEnter: () => gsap.to(inks, { yPercent: 0, duration: 1.05, ease: "ooze", stagger: 0.11 }) });
    // Title panel exits to -120% during the first 16% of the first section, and the dim overlay and guide line clear within 12%
    const scrub = (target, vars, end) => gsap.to(target, { ...vars, ease: "none", scrollTrigger: { trigger: "#window", start: "top top", end, scrub: true } });
    scrub(".rw-window__copy", { yPercent: -120 }, "16% top");
    scrub(".rw-window__shade", { opacity: 0 }, "12% top");
    scrub(".rw-window__hint", { yPercent: 160 }, "12% top");
  });

  // ── Scene progress values: first section 0~50% video scrubbing, 16~30% panel shrinks into a window (rack), 43.5%~end bee flight. Closing section 0~1 ──
  const FILM = { duration: 5.68, aspect: 1600 / 750, syncAt: 5.04, slowFrom: 4.3, fastShare: 0.72, parkAt: 0.36, anchorX: 0.3, edgeMargin: 0.04, bee: { x: 0.1237, y: 0.9023, len: 0.086, vx: -0.13, vy: 0.95 } };
  const CARD = { start: 0.16, end: 0.3, width: 0.62, widthNarrow: 0.92, y: 0.42, cropY: 0.94 };
  const RETURN_AT = 0.5 * (FILM.fastShare + ((FILM.syncAt - FILM.slowFrom) / (FILM.duration - FILM.slowFrom)) * (1 - FILM.fastShare));
  const st = (rw.scene = { filmT: 0, cardS: 0, flight: 0, epi: 0, land: 0, handOver: 0, spin: 0, relight: 0, membraneOut: 0, glassIn: 1, focusX: 0.75, focusY: 0.6 });
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.still) { st.filmT = 0; st.cardS = 0; st.flight = 1; st.epi = 1; return; }
    gsap.timeline({ scrollTrigger: { trigger: "#window", start: "top top", end: "bottom bottom", scrub: true }, defaults: { ease: "none" } })
      .fromTo(st, { filmT: 0 }, { filmT: 1, duration: 0.5 }, 0)
      .fromTo(st, { cardS: 0 }, { cardS: 1, duration: CARD.end - CARD.start, ease: "rack" }, CARD.start)
      .fromTo(st, { flight: 0 }, { flight: 1, duration: 1 - RETURN_AT }, RETURN_AT);
    gsap.fromTo(st, { epi: 0 }, { epi: 1, ease: "none", scrollTrigger: { trigger: "#epilogue", start: "top top", end: "bottom bottom", scrub: true } });
  });

  // ── Seven closing text blocks ──
  const EPI = { lead: 1, revealFrom: 0.12, wordStep: 0.04, revealSpan: 0.4, ramp: 0.032, exitFrom: 0.78, exitTo: 0.88, exitLineLag: 0.014 };
  const blocksEl = [...document.querySelectorAll(".rw-epi__block")];
  const SLOTS = blocksEl.length + EPI.lead;
  const blockT = (e) => clamp(e) * SLOTS - EPI.lead;
  const blocks = blocksEl.map((el, bi) => {
    const align = el.dataset.align || "left";
    el.style.top = +el.dataset.y * 100 + "%";
    el.style[align === "left" ? "left" : "right"] = +el.dataset.x * 100 + "%";
    el.style.maxWidth = +el.dataset.w * 100 + "vw";
    el.style.textAlign = align;
    const indents = (el.dataset.indent || "").split(/\s+/).map(Number);
    const plain = [];
    const words = [];
    [...el.querySelectorAll("p")].forEach((p, li) => {
      const src = p.textContent.trim();
      plain.push(src.replace(/[[\]]/g, ""));
      const toks = [];
      const re = /\[([^\]]+)\]([^\s[]*)|(\S+)/g;
      let m;
      while ((m = re.exec(src))) toks.push(m[1] !== undefined ? { text: m[1] + (m[2] || ""), stutter: true } : { text: m[3], stutter: false });
      const cand = toks.map((t, i) => (!t.stutter && mixable(t.text) ? i : -1)).filter((i) => i >= 0);
      const mixAt = cand.length ? cand[Math.floor(rand(hash(toks.map((t) => (t.stutter ? "" : t.text)).join(" "), 7 * bi + li))() * cand.length)] : -1;
      p.textContent = "";
      p.setAttribute("aria-hidden", "true");
      p.setAttribute("data-glass", "");
      p.style[align === "left" ? "marginLeft" : "marginRight"] = (indents[li] || 0) + "em";
      toks.forEach((t, ti) => {
        const w = document.createElement("span");
        w.className = "rw-epi__word" + (t.stutter ? " rw-mix" : "");
        if (ti === mixAt) w.append(inkWord(t.text, 97 * bi + 13 * li + ti, 8));
        else w.textContent = t.text;
        p.append(w, " ");
        const n = words.length, a = 43758.5453 * Math.sin(12.9898 * (131 * bi + 7.3 * n)), b = 12345.6789 * Math.sin(78.233 * (131 * bi + 7.3 * n));
        words.push({ el: w, i: n, line: li, stutter: t.stutter, dx: (2 * (a - Math.floor(a)) - 1) * 7, dy: (2 * (b - Math.floor(b)) - 1) * 7 });
      });
    });
    const sr = document.createElement("p");
    sr.className = "rw-sr";
    sr.textContent = plain.join(" ");
    el.prepend(sr);
    const step = words.length > 1 ? Math.min(EPI.wordStep, EPI.revealSpan / (words.length - 1)) : EPI.wordStep;
    return { el, words, step, shown: true, face: +el.dataset.face || 0, readEnd: EPI.revealFrom + (words.length - 1) * step + EPI.ramp };
  });
  const readAt = (EPI.lead + blocks[0].readEnd + 0.04) / SLOTS;
  document.querySelector(".rw-epi")?.style.setProperty("--read-at", readAt.toFixed(4));

  if (!reduce) {
    const blurOn = !coarse;
    let lastEpi = -1;
    const paintEpi = () => {
      if (st.epi === lastEpi) return;
      lastEpi = st.epi;
      const t = blockT(st.epi);
      blocks.forEach((b, bi) => {
        const u = t - bi;
        if (!(u > EPI.revealFrom - 0.05 && u < EPI.exitTo + 0.08)) {
          if (b.shown) { b.el.style.visibility = "hidden"; b.shown = false; }
          return;
        }
        if (!b.shown) { b.el.style.visibility = "visible"; b.shown = true; }
        for (const w of b.words) {
          const s = clamp((u - (EPI.revealFrom + w.i * b.step)) / EPI.ramp);
          const arrive = s * s * (3 - 2 * s);
          let alpha = arrive;
          // The [ ] word lights up to .28, drops to .05, then fills back up
          if (w.stutter && s < 1) alpha = s < 0.3 ? (s / 0.3) * 0.28 : s < 0.44 ? mix(0.28, 0.05, (s - 0.3) / 0.14) : sstep(0.44, 1, s);
          const exit = sstep(EPI.exitFrom + w.line * EPI.exitLineLag, EPI.exitTo + w.line * EPI.exitLineLag, u);
          const left = 1 - arrive;
          w.el.style.opacity = (alpha * (1 - exit)).toFixed(3);
          w.el.style.transform = left > 0.001 ? `translate3d(${(w.dx * left).toFixed(2)}px, ${(w.dy * left).toFixed(2)}px, 0)` : "none";
          if (blurOn) { const bl = 5 * left + 9 * exit; w.el.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : "none"; }
        }
      });
    };
    paintEpi();
    rw.each(paintEpi);
  }

  // Bee placement — per block, the spot walking on a flower and the facing direction, in the 4th and 5th blocks it floats and hovers
  const CUE = { airFrom: 4, airTo: 5, hover: { 4: { x: -0.22, y: -0.12 }, 5: { x: 0.1, y: 0.24 } }, walk: [0, 0.38, -0.22, 0.46, 0, 0, 0.3], turn: 0.55 };
  const gapSpan = 1 - EPI.exitTo + EPI.revealFrom;
  function cue(e) {
    const n = blocks.length, t = blockT(e);
    const r = Math.max(0, Math.min(n - 1, Math.floor(t))), o = t - r;
    let f = -1, from = r, to = r;
    if (o >= EPI.exitTo) { f = (o - EPI.exitTo) / gapSpan; to = Math.min(n - 1, r + 1); }
    else if (o < EPI.revealFrom) { f = clamp((1 - EPI.exitTo + o) / gapSpan); from = Math.max(0, r - 1); }
    if (r === n - 1 && o >= EPI.exitTo) f = -1;
    const x = f >= 0 ? sstep(0, 1, f) : 0;
    const air = (k) => +(k >= CUE.airFrom && k <= CUE.airTo);
    const hov = (k) => CUE.hover[k] || { x: 0, y: 0 };
    return {
      reading: o >= EPI.revealFrom - 0.02 && o < blocks[r].readEnd,
      face: blocks[f >= 0 ? to : r].face,
      walk: f >= 0 ? mix(CUE.walk[from], CUE.walk[to], x) : CUE.walk[r],
      air: f >= 0 ? mix(air(from), air(to), x) : air(r),
      hx: f >= 0 ? mix(hov(from).x, hov(to).x, x) : hov(r).x,
      hy: f >= 0 ? mix(hov(from).y, hov(to).y, x) : hov(r).y,
    };
  }

  // ── 3D stage ──
  const THREE = window.THREE;
  const canvas = document.querySelector(".rw-stage__gl");
  const video = document.querySelector(".rw-film");
  if (!THREE || !canvas) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); }
  catch (err) { rw.sceneWarm = true; rw.filmReady = true; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(0, 0, 5);
  const viewAt = (z) => { const h = 2 * Math.tan(THREE.MathUtils.degToRad(20)) * (camera.position.z - z); return { width: h * camera.aspect, height: h }; };
  const col = (name) => new THREE.Color().setRGB(...rw.color(name), THREE.SRGBColorSpace);
  const C = {
    sky: col("--site-sky"), warm: col("--site-warm"), ink: col("--kf-ink"), accent: col("--kf-accent"), raised: col("--kf-raised"),
    glass: col("--site-glass"), glassDeep: col("--site-glass-deep"), petal: col("--site-petal"), heart: col("--site-petal-heart"),
    stamen: col("--site-stamen"), stem: col("--site-stem"), bee: col("--site-bee"), band: col("--site-bee-band"), wing: col("--site-wing"), bubble: col("--site-bubble"),
  };

  // Ambient glow baked from four light panels (sky-light top panel, warm circle, side vertical strip, bottom pollen panel)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const former = (form, color, intensity, pos, rot, scale) => {
    const g = form === "circle" ? new THREE.CircleGeometry(0.5, 32) : new THREE.PlaneGeometry(1, 1);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(intensity), side: THREE.DoubleSide, toneMapped: false }));
    m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scale);
    envScene.add(m);
  };
  former("rect", C.sky, 1.1, [0, 6, -4], [Math.PI / 2, 0, 0], [14, 10, 1]);
  former("circle", C.warm, 0.5, [5, 3, 4], [0, 0, 0], [3.5, 3.5, 1]);
  former("rect", C.warm, 1.6, [-4.5, 1.5, 2.5], [0, Math.PI / 2.6, 0], [0.5, 7, 1]);
  former("rect", C.accent, 0.5, [0, -5, 0], [-Math.PI / 2, 0, 0], [14, 14, 1]);
  former("circle", C.warm, 0.4, [0, 0, 8], [0, 0, 0], [6, 6, 1]);
  scene.environment = pmrem.fromScene(envScene, 0.02, 0.1, 100).texture;
  scene.environmentIntensity = 0.3;

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(2, 4, 4);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4); rim.position.set(-3, -1, -4);
  const under = new THREE.DirectionalLight(C.accent, 0.5); under.position.set(0, -4, 1.5);
  const spot = new THREE.SpotLight(C.warm, 0, 12, 0.5, 1, 0);
  scene.add(ambient, key, rim, under, spot, spot.target);

  // Video panel — covers 1.16 times larger than the screen, then shrinks to a window of 62% width (92% on narrow screens), positioned at 42% from the top
  // It must be a VideoTexture so three doesn’t allocate the fixed-size storage (texStorage) at the video element width (0) — updates are triggered manually only when rewinding
  const filmTex = new THREE.VideoTexture(video);
  filmTex.update = () => {};
  filmTex.colorSpace = THREE.SRGBColorSpace;
  filmTex.minFilter = filmTex.magFilter = THREE.LinearFilter;
  filmTex.generateMipmaps = false;
  const cardMat = new THREE.MeshBasicMaterial({ map: filmTex, transparent: true, toneMapped: false });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), cardMat);
  card.renderOrder = -1;
  const cardG = new THREE.Group();
  cardG.add(card);
  scene.add(cardG);
  const P = { gx: 0, gy: 0, sc: 1, w: 1, h: 1, hc: 1, vw: 1, vh: 1,
    sx(e) { return 0.5 + (this.gx + (e - 0.5) * this.w * this.sc) / this.vw; },
    sy(e) { return 0.5 - (this.gy + (this.hc / 2 - e * this.h) * this.sc) / this.vh; },
    get kx() { return (this.w * this.sc) / this.vw; }, get ky() { return (this.h * this.sc) / this.vh; } };
  let cardFit = null;
  const layoutCard = () => {
    const v = viewAt(-1);
    const w = 1.16 * Math.max(v.width, v.height * (FILM.aspect / CARD.cropY)), h = w / FILM.aspect, hc = h * CARD.cropY;
    const spare = Math.max(0, w - v.width);
    const narrow = clamp((1.2 - v.width / v.height) / 0.6);
    cardFit = { w, h, hc, x: Math.max(0, spare / 2 - spare * FILM.anchorX - v.width * FILM.edgeMargin), vw: v.width, vh: v.height,
      scale: (mix(CARD.width, CARD.widthNarrow, narrow) * v.width) / w, y: (0.5 - CARD.y) * v.height };
    const g = new THREE.PlaneGeometry(w, hc), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setY(i, 1 - CARD.cropY + uv.getY(i) * CARD.cropY);
    card.geometry.dispose();
    card.geometry = g;
  };

  // Where video can’t be used (when opened as a file and the texture is blocked), draw the same scene on a canvas and hang it instead.
  const paintFilm = (() => {
    const cv = document.createElement("canvas");
    cv.width = 480; cv.height = 225;
    const g = cv.getContext("2d");
    const css = (c) => `rgb(${(c.r * 255) | 0} ${(c.g * 255) | 0} ${(c.b * 255) | 0})`;
    const sky = C.sky.clone().convertLinearToSRGB(), petal = C.petal.clone().convertLinearToSRGB(), heart = C.stamen.clone().convertLinearToSRGB(), bee = C.bee.clone().convertLinearToSRGB(), band = C.band.clone().convertLinearToSRGB();
    const at = (t) => {
      if (t < 1.4) return [0.5 + 0.01 * Math.sin(7 * t), 0.36];
      if (t < 4.3) { const u = (t - 1.4) / 2.9; return [(1 - u) ** 2 * 0.5 + 2 * u * (1 - u) * 0.3 + u * u * 0.14, (1 - u) ** 2 * 0.36 + 2 * u * (1 - u) * 0.02 + u * u * 0.42]; }
      const u = (t - 4.3) / 0.74; return [mix(0.14, 0.1237, u), mix(0.42, 0.9023, u)];
    };
    return (t) => {
      const W = cv.width, H = cv.height;
      const grd = g.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, css(sky.clone().multiplyScalar(0.55))); grd.addColorStop(1, css(sky.clone().multiplyScalar(0.78)));
      g.fillStyle = grd; g.fillRect(0, 0, W, H);
      const z = 1 + 0.06 * (t / FILM.duration), cx = (0.47 + 0.03 * (t / FILM.duration)) * W, cy = 0.56 * H;
      g.save(); g.filter = "blur(5px)"; g.fillStyle = css(petal); g.beginPath();
      for (let a = 0; a <= 64; a++) { const th = (a / 64) * Math.PI * 2, r = (0.5 + 0.12 * Math.cos(5 * th + 0.4)) * H * z; g.lineTo(cx + Math.cos(th) * r, cy + Math.sin(th) * r); }
      g.fill(); g.fillStyle = css(heart); g.beginPath(); g.arc(cx, cy, 0.1 * H * z, 0, Math.PI * 2); g.fill(); g.restore();
      const [bx, by] = at(t);
      g.fillStyle = css(bee); g.beginPath(); g.ellipse(bx * W, by * H, 0.043 * W, 0.024 * W, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = css(band); for (const k of [-0.4, 0.15]) g.fillRect(bx * W + k * 0.043 * W, by * H - 0.02 * W, 0.012 * W, 0.04 * W);
      return cv;
    };
  })();
  let filmMode = "video", filmTime = 0;
  const useCanvasFilm = () => { if (filmMode === "canvas") return; filmMode = "canvas"; filmTex.image = paintFilm(filmTime); filmTex.needsUpdate = true; rw.filmReady = true; rw.filmPct = 1; };
  const tainted = () => { try { const c = document.createElement("canvas").getContext("2d"); c.drawImage(video, 0, 0, 1, 1); c.getImageData(0, 0, 1, 1); return false; } catch (e) { return true; } };

  // The video is downloaded whole (so rewind is instant) — the downloaded share is 45% of the loader %
  let seeking = false, seekAt = 0, frameSerial = 0;
  // Uploading first with a zero-size video makes texture storage allocate at size 0, so every later upload fails — upload only when it has a size
  const push = () => { if (video.videoWidth > 0) { frameSerial++; filmTex.needsUpdate = true; } };
  video.addEventListener("loadeddata", () => { if (tainted()) useCanvasFilm(); else push(); });
  video.addEventListener("seeked", () => { seeking = false; if (filmMode === "video") push(); });
  video.addEventListener("error", useCanvasFilm);
  video.addEventListener("progress", () => { if (video.buffered.length && video.duration) rw.filmPct = Math.max(rw.filmPct, Math.min(0.99, video.buffered.end(video.buffered.length - 1) / video.duration)); });
  video.addEventListener("canplaythrough", () => { rw.filmReady = true; rw.filmPct = 1; });
  const src = video.dataset.src;
  if (/^https?:/.test(location.protocol)) {
    fetch(src).then(async (res) => {
      if (!res.ok || !res.body) throw new Error(res.status);
      const total = +res.headers.get("content-length") || 0, reader = res.body.getReader(), parts = [];
      let got = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; parts.push(value); got += value.length; if (total) rw.filmPct = Math.min(0.99, got / total); }
      video.src = URL.createObjectURL(new Blob(parts, { type: "video/mp4" }));
      video.load();
    }).catch(() => { video.src = src; video.load(); });
  } else {
    video.src = src;
    video.load();
  }
  setTimeout(() => { if (!rw.filmReady) useCanvasFilm(); }, 6000);

  // Video average color → light color and intensity, brightest cell → daylight direction
  const sampler = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  sampler.canvas.width = 16; sampler.canvas.height = 9;
  const lightGoal = { r: 0.55, g: 0.72, b: 0.8, level: 0.5, kx: -0.2, ky: 0.1 };
  const light = { ...lightGoal };
  let sampled = -1;
  const sampleFilm = () => {
    if (sampled === frameSerial + (filmMode === "canvas" ? 1e6 + Math.round(filmTime * 25) : 0)) return;
    sampled = frameSerial + (filmMode === "canvas" ? 1e6 + Math.round(filmTime * 25) : 0);
    try { sampler.drawImage(filmMode === "canvas" ? filmTex.image : video, 0, 0, 16, 9); } catch (e) { return; }
    let d; try { d = sampler.getImageData(0, 0, 16, 9).data; } catch (e) { return; }
    let r = 0, g = 0, b = 0, best = -1, bx = 0, by = 0;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 16; x++) {
      const i = (y * 16 + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2];
      const l = 0.21 * d[i] + 0.72 * d[i + 1] + 0.07 * d[i + 2];
      if (l > best) { best = l; bx = x; by = y; }
    }
    lightGoal.r = r / 144 / 255; lightGoal.g = g / 144 / 255; lightGoal.b = b / 144 / 255;
    lightGoal.level = clamp(0.21 * lightGoal.r + 0.72 * lightGoal.g + 0.07 * lightGoal.b);
    lightGoal.kx = (bx / 15) * 2 - 1; lightGoal.ky = -((by / 8) * 2 - 1);
  };

  // ── Flower branch: seven blooms on one stem (five petals · stamens), swaying in the wind and pushed when a bee lands ──
  const windU = { uTime: { value: 0 }, uWind: { value: 0.6 }, uImpact: { value: 0 }, uLand: { value: new THREE.Vector3(0, 0.2, 0.3) } };
  const windMat = (opts) => {
    const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0, envMapIntensity: 0.7, ...opts });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, windU);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", `#include <common>
        attribute vec3 aWind;
        uniform float uTime; uniform float uWind; uniform float uImpact; uniform vec3 uLand;
        vec3 sway(vec3 p, float flex, float phase, float thin) {
          float ph = phase * 6.2831;
          float gust = sin(uTime * 0.41 + ph * 0.35) * 0.62 + sin(uTime * 0.17 + ph * 0.11) * 0.38;
          vec3 lean = vec3(gust, 0.0, gust * 0.42) * flex * flex * 0.075 * uWind;
          float bob = sin(uTime * 1.15 + ph) * 0.5 + sin(uTime * 1.9 + ph * 2.3) * 0.5;
          vec3 breathe = vec3(sin(uTime * 0.83 + ph * 1.7), bob, cos(uTime * 0.71 + ph * 1.3)) * flex * 0.012 * uWind;
          float sh = sin(uTime * 5.6 + ph * 9.1) * 0.6 + sin(uTime * 8.3 + ph * 4.7) * 0.4;
          vec3 shiver = vec3(sh, sh * 0.7, -sh * 0.8) * thin * flex * 0.02;
          float near = 1.0 - smoothstep(0.0, 0.62, distance(p, uLand));
          vec3 hit = normalize(p - uLand + vec3(0.001)) * near * uImpact * 0.09;
          return lean + breathe + shiver + hit;
        }`).replace("#include <begin_vertex>", `#include <begin_vertex>
        transformed += sway(transformed, aWind.x, aWind.y, aWind.z);`);
    };
    return m;
  };
  const withWind = (geo, flex, phase, thin) => {
    const n = geo.attributes.position.count, a = new Float32Array(n * 3), pos = geo.attributes.position;
    for (let i = 0; i < n; i++) { a[i * 3] = typeof flex === "function" ? flex(pos.getY(i)) : flex; a[i * 3 + 1] = phase; a[i * 3 + 2] = thin; }
    geo.setAttribute("aWind", new THREE.BufferAttribute(a, 3));
    return geo;
  };
  const petalGeo = () => {
    const g = new THREE.PlaneGeometry(1, 1, 6, 10), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const a = p.getX(i) + 0.5, s = p.getY(i) + 0.5;
      const half = Math.pow(Math.sin(Math.PI * Math.min(1, s * 0.9 + 0.1)), 0.65) * (0.45 + 0.55 * s) * 0.5;
      const wav = 0.03 * Math.sin(a * 9 + s * 5) * s;
      p.setXYZ(i, (a - 0.5) * 2 * half * 0.7, s, (a - 0.5) ** 2 * 0.55 + s * s * 0.3 + wav);
    }
    g.computeVertexNormals();
    return g;
  };
  const petalMat = windMat({ color: C.petal, side: THREE.DoubleSide, emissive: C.petal, emissiveIntensity: 0 });
  const heartMat = windMat({ color: C.heart, emissive: C.heart, emissiveIntensity: 0 });
  const stemMat = windMat({ color: C.stem, emissive: C.stem, emissiveIntensity: 0 });
  const stamenMat = windMat({ color: C.stamen, emissive: C.stamen, emissiveIntensity: 0 });
  const relightMats = [petalMat, heartMat, stemMat, stamenMat];
  const flexAt = (y) => clamp((y + 1.05) / 2.1);
  const blossomModel = new THREE.Group();
  // Flower clusters: the first is where the bee lands (front, upper left), the rest are scattered as a mass covering 3/4 of the height
  const HEADS = [[-0.22, 0.41, 0.26, 1.3, 0.12]];
  for (let i = 0; i < 15; i++) {
    const k = (i + 0.5) / 15, y = mix(-0.35, 1.0, k) + 0.05 * Math.sin(i * 7.1);
    const spread = 0.52 * (1 - Math.abs(y - 0.35) * 0.5);
    HEADS.push([Math.sin(i * 2.39996) * spread, y, Math.cos(i * 2.39996) * 0.2 - 0.02, 1.45 + 0.4 * ((i * 37) % 10) / 10, (i * 0.618) % 1]);
  }
  const trunk = new THREE.CatmullRomCurve3([new THREE.Vector3(0.02, -1.05, -0.02), new THREE.Vector3(-0.02, -0.6, 0), new THREE.Vector3(0.02, 0, -0.06), new THREE.Vector3(0, 0.75, -0.1)]);
  // Merge into one mesh per material, cutting draw calls to four
  const buckets = new Map();
  const addMesh = (geo, mat, flex, phase, thin) => { const g = withWind(geo, flex, phase, thin); if (!buckets.has(mat)) buckets.set(mat, []); buckets.get(mat).push(g); };
  const merge = (list) => {
    const names = ["position", "normal", "aWind"];
    let verts = 0, idx = 0;
    for (const g of list) { verts += g.attributes.position.count; idx += g.index ? g.index.count : g.attributes.position.count; }
    const out = new THREE.BufferGeometry(), index = new Uint32Array(idx);
    for (const n of names) {
      const size = list[0].attributes[n].itemSize, arr = new Float32Array(verts * size);
      let o = 0;
      for (const g of list) { const a = g.attributes[n]; for (let i = 0; i < a.count; i++) for (let c = 0; c < size; c++) arr[o++] = a.array[i * size + c]; }
      out.setAttribute(n, new THREE.BufferAttribute(arr, size));
    }
    let base = 0, o = 0;
    for (const g of list) { const n = g.attributes.position.count; if (g.index) for (let i = 0; i < g.index.count; i++) index[o++] = g.index.array[i] + base; else for (let i = 0; i < n; i++) index[o++] = i + base; base += n; g.dispose(); }
    out.setIndex(new THREE.BufferAttribute(index, 1));
    return out;
  };
  addMesh(new THREE.TubeGeometry(trunk, 32, 0.028, 8), stemMat, flexAt, 0, 0);
  const basePetal = petalGeo();
  HEADS.forEach(([x, y, z, s, ph], hi) => {
    const head = new THREE.Vector3(x, y, z);
    const from = trunk.getPoint(clamp((y + 0.75) / 1.8, 0.15, 1));
    const twig = new THREE.CatmullRomCurve3([from, from.clone().lerp(head, 0.5).add(new THREE.Vector3(0, 0.04, -0.03)), head]);
    addMesh(new THREE.TubeGeometry(twig, 10, 0.012, 6), stemMat, flexAt(y), ph, 0);
    const look = new THREE.Vector3(x * 1.6, (y - 0.4) * 0.6, 1).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), look);
    for (let k = 0; k < 5; k++) {
      const g = basePetal.clone();
      g.scale(0.2 * s, 0.24 * s, 0.2 * s);
      g.rotateX(-0.35);
      g.rotateZ((k / 5) * Math.PI * 2 + hi * 0.7);
      g.applyQuaternion(q);
      g.translate(x, y, z);
      addMesh(g, petalMat, flexAt(y), ph, 0);
    }
    const centre = new THREE.SphereGeometry(0.035 * s, 10, 8);
    centre.applyQuaternion(q); centre.translate(x + look.x * 0.02, y + look.y * 0.02, z + look.z * 0.02);
    addMesh(centre, heartMat, flexAt(y), ph, 0);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2, len = 0.07 * s;
      const fil = new THREE.CylinderGeometry(0.0035, 0.0035, len, 4);
      fil.translate(0, len / 2, 0);
      const tip = new THREE.SphereGeometry(0.008, 6, 5);
      tip.translate(0, len, 0);
      for (const g of [fil, tip]) {
        g.rotateX(Math.PI / 2 - 0.45); g.rotateZ(a); g.applyQuaternion(q); g.translate(x + look.x * 0.02, y + look.y * 0.02, z + look.z * 0.02);
      }
      addMesh(fil, stamenMat, flexAt(y), ph + k * 0.07, 1);
      addMesh(tip, stamenMat, flexAt(y), ph + k * 0.07, 1);
    }
  });
  for (const [mat, list] of buckets) { const m = new THREE.Mesh(merge(list), mat); m.frustumCulled = false; blossomModel.add(m); }
  const bbox = new THREE.Box3().setFromObject(blossomModel), bsize = bbox.getSize(new THREE.Vector3()), bcentre = bbox.getCenter(new THREE.Vector3());
  blossomModel.position.sub(bcentre);
  const bNative = Math.max(bsize.x, bsize.y) || 1, bFront = bbox.max.z - bcentre.z;
  const SPIN = { turns: 1, axisX: -0.07, axisZ: 0.01 };
  const PERCH = { x: -0.25, y: 0.14, z: 0.98, rel: 0.19, normal: [-0.2, 0.3, 0.93], heading: [0.6, 0.7, -0.2], lift: 0.16 };
  const perch = new THREE.Object3D();
  perch.position.set(PERCH.x * bsize.x, PERCH.y * bsize.y, PERCH.z * bFront);
  const bPivot = new THREE.Group(); bPivot.position.set(-SPIN.axisX * bsize.x, 0, -SPIN.axisZ * bsize.z); bPivot.add(blossomModel, perch);
  const bSpin = new THREE.Group(); bSpin.position.set(SPIN.axisX * bsize.x, 0, SPIN.axisZ * bsize.z); bSpin.add(bPivot);
  const bSway = new THREE.Group(); bSway.add(bSpin);
  const blossom = new THREE.Group(); blossom.add(bSway); blossom.visible = false;
  scene.add(blossom);
  const BLOSSOM = { sx: [[0, 0.72], [0.5, 0.68], [1, 0.66]], sy: [[0, 1.7], [0.45, 1.1], [0.78, 0.66], [1, 0.6]], w: [[0, 0.4], [0.6, 0.52], [1, 0.62]] };
  const curve = (pts, t) => {
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return mix(va, vb, sstep(a, b, t)); }
    return pts[pts.length - 1][1];
  };

  // ── Bee: abdomen (striped) · thorax · head · antennae · legs · four wings. Wing beat 7.5Hz ──
  const bee = new THREE.Group(); bee.visible = false;
  const beeQ = new THREE.Group(); bee.add(beeQ);
  const beeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55, metalness: 0, envMapIntensity: 0.8 });
  const abdomen = new THREE.SphereGeometry(1, 28, 18); abdomen.scale(0.2, 0.19, 0.32); abdomen.translate(0, 0, -0.27);
  const paint = (geo, fn) => { const p = geo.attributes.position, c = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const k = fn(p.getX(i), p.getY(i), p.getZ(i)); c[i * 3] = k.r; c[i * 3 + 1] = k.g; c[i * 3 + 2] = k.b; } geo.setAttribute("color", new THREE.BufferAttribute(c, 3)); return geo; };
  paint(abdomen, (x, y, z) => (Math.sin((z + 0.27) * 30) > 0.15 && z < -0.1 ? C.band : C.bee));
  const thorax = paint(new THREE.SphereGeometry(0.16, 20, 14).translate(0, 0.02, 0.06), () => C.band.clone().lerp(C.bee, 0.35));
  const headG = paint(new THREE.SphereGeometry(0.11, 18, 12).scale(1, 0.95, 0.9).translate(0, 0, 0.26), () => C.bee);
  for (const g of [abdomen, thorax, headG]) beeQ.add(new THREE.Mesh(g, beeMat));
  const beeHead = new THREE.Object3D(); beeHead.position.set(0, 0.04, 0.3); beeQ.add(beeHead);
  const limbMat = new THREE.MeshStandardMaterial({ color: C.bee, roughness: 0.7 });
  for (const s of [-1, 1]) {
    const ant = new THREE.CylinderGeometry(0.006, 0.006, 0.16, 4); ant.translate(0, 0.08, 0); ant.rotateX(0.9); ant.rotateZ(s * 0.35); ant.translate(s * 0.04, 0.07, 0.32);
    beeQ.add(new THREE.Mesh(ant, limbMat));
    for (let k = 0; k < 3; k++) {
      const leg = new THREE.CylinderGeometry(0.008, 0.006, 0.2, 4); leg.translate(0, -0.1, 0); leg.rotateZ(s * 0.55); leg.rotateX(-0.3 + k * 0.3); leg.translate(s * 0.08, -0.08, 0.12 - k * 0.08);
      beeQ.add(new THREE.Mesh(leg, limbMat));
    }
  }
  const wingMat = new THREE.MeshPhysicalMaterial({ color: C.wing, transparent: true, opacity: 0.36, roughness: 0.2, metalness: 0, side: THREE.DoubleSide, depthWrite: false, iridescence: 0.6, iridescenceIOR: 1.3 });
  const wings = [];
  for (const side of [1, -1]) for (const [len, wid, z, lagK] of [[0.42, 0.15, 0.08, 0], [0.3, 0.11, 0.0, 1]]) {
    const g = new THREE.CircleGeometry(1, 24); g.scale(len, wid, 1); g.translate(len, 0, 0); g.rotateX(-Math.PI / 2); if (side < 0) g.rotateY(Math.PI);
    const pivot = new THREE.Group(); pivot.position.set(side * 0.07, 0.14, z); pivot.rotation.order = "YZX";
    pivot.add(new THREE.Mesh(g, wingMat)); beeQ.add(pivot);
    wings.push({ pivot, side, lag: lagK ? 0.17 : 0, gain: lagK ? 0.8 : 1 });
  }
  const beeBox = new THREE.Box3().setFromObject(beeQ).getSize(new THREE.Vector3());
  const beeNative = Math.max(beeBox.x, beeBox.y, beeBox.z) || 1;
  scene.add(bee);
  const PATH = {
    sx: [[0, 0.24], [0.14, 0.23], [0.3, 0.3], [0.46, 0.4], [0.6, 0.47], [0.72, 0.52], [0.84, 0.56], [1, 0.58]],
    sy: [[0, 0.97], [0.14, 0.98], [0.3, 0.84], [0.46, 0.64], [0.6, 0.5], [0.72, 0.45], [0.84, 0.44], [1, 0.47]],
    w: [[0, 0.1], [0.14, 0.1], [0.3, 0.13], [0.46, 0.22], [0.6, 0.38], [0.72, 0.46], [0.84, 0.28], [1, 0.11]],
    z: [[0, -1.5], [0.14, -1.5], [0.3, -1], [0.46, -0.3], [0.6, 0.3], [0.72, 0.5], [0.84, 0.1], [1, -0.2]],
    yaw: [[0, 1.62], [0.22, 1.35], [0.46, 0.72], [0.66, 0.22], [0.8, 0.05], [0.92, -0.5], [1, -0.95]],
    pitch: [[0, -0.34], [0.2, -0.12], [0.5, 0.06], [0.72, 0.02], [0.86, 0.3], [1, 0.52]],
    roll: [[0, 0.18], [0.18, 0.24], [0.4, -0.2], [0.6, 0.14], [0.78, -0.08], [1, 0.03]],
  };
  const lin = (pts, t) => {
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i]; return mix(va, vb, sstep(a, b, t)); }
    return pts[pts.length - 1][1];
  };
  const LEAVE = { span: 0.1, match: 0.25, cover: 1.15, z: -1.5, centreX: 0.03, centreY: 0.24 };
  const SPEED = (FILM.duration - FILM.slowFrom) / ((1 - FILM.fastShare) * 0.5);
  const carry = (e) => { const t = LEAVE.match, r = SPEED * t * LEAVE.span * (1 - RETURN_AT), n = clamp(e); if (n <= t) return (n / t) * r; const a = (n - t) / (1 - t); return r * (1 + ((1 - t) / (2 * t)) * (1 - (1 - a) * (1 - a))); };
  const WING = { hz: 7.5, amplitude: 1.18, twist: 0.62, restStroke: -0.3, restSweep: 0.95, opacityFlight: 0.22, opacityRest: 0.36 };
  const WIGGLE = { deg: 8, hz: 3.4, decay: 6.5 };

  // ── Glass film: a 44×44 cell panel is pressed down behind the cursor at three points (following by .5 · .18 · .1) and springs back (.055 · damping .9). It refracts the scene behind it ──
  const GLASS = { seg: 44, z: 1.2, radius: 0.62, depth: 0.5, pressGain: 1.45, spring: 0.055, damping: 0.9, trail: [0.5, 0.18, 0.1], weight: [1, 0.5, 0.24],
    thicknessRest: 0.34, thicknessPressed: 0.18, roughnessRest: 0.07, roughnessPressed: 0.02, chroma: 0.04, aniso: 0.1, ior: 1.34,
    clear: { thickness: 0.06, roughness: 0.012, chroma: 0.025, aniso: 0.02 } };
  const useGlass = !coarse && !reduce;
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: true });
  const glassU = {
    uScene: { value: rt.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 },
    uThick: { value: GLASS.thicknessRest }, uRough: { value: GLASS.roughnessRest }, uChroma: { value: GLASS.chroma }, uAniso: { value: GLASS.aniso },
    uTint: { value: C.glass }, uDeep: { value: C.glassDeep }, uIor: { value: GLASS.ior },
  };
  const glassMat = new THREE.ShaderMaterial({
    uniforms: glassU, transparent: false, depthWrite: false,
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D uScene; uniform vec2 uRes; uniform float uTime, uThick, uRough, uChroma, uAniso, uIor; uniform vec3 uTint, uDeep;
      varying vec3 vN;
      vec3 grab(vec2 uv, float r) {
        vec3 c = texture2D(uScene, uv).rgb * 0.2;
        for (int i = 0; i < 8; i++) { float a = float(i) * 0.7854 + 0.39; vec2 o = vec2(cos(a), sin(a)) * r / uRes; c += texture2D(uScene, uv + o).rgb * 0.06 + texture2D(uScene, uv + o * 0.45).rgb * 0.04; }
        return c;
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / uRes;
        vec3 n = normalize(vN);
        float bend = (1.0 - 1.0 / uIor) * uThick * 0.55;
        vec2 off = n.xy * bend;
        off += (vec2(sin(uv.y * 31.0 + uTime * 0.45), cos(uv.x * 27.0 - uTime * 0.38)) * 0.5) * 0.012 * uThick;
        float blur = (uRough * 60.0 + uAniso * 60.0) * (uThick / 0.34) * (uRes.y / 900.0);
        vec3 col;
        col.r = grab(uv + off * (1.0 + uChroma * 8.0), blur).r;
        col.g = grab(uv + off, blur).g;
        col.b = grab(uv + off * (1.0 - uChroma * 8.0), blur).b;
        col *= mix(vec3(1.0), uTint, 0.6) * pow(uDeep, vec3(uThick / 3.2));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const membrane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, 1), glassMat);
  membrane.position.z = GLASS.z; membrane.renderOrder = 2; membrane.visible = false;
  scene.add(membrane);
  let mem = null;
  const trail = GLASS.weight.map((w) => ({ x: 0, y: 0, w }));
  const layoutMembrane = () => {
    const v = viewAt(GLASS.z), w = 1.25 * v.width, h = 1.25 * v.height;
    membrane.geometry.dispose();
    membrane.geometry = new THREE.PlaneGeometry(w, h, GLASS.seg, GLASS.seg);
    const n = (GLASS.seg + 1) ** 2;
    mem = { half: { w: v.width / 2, h: v.height / 2 }, z: new Float32Array(n), v: new Float32Array(n), rest: new Float32Array(membrane.geometry.attributes.position.array) };
  };

  // ── Soap bubble: swells and pops over .9s at the pressed spot while three small bubbles spread (only when a glass film is present) ──
  const BUB = { life: 900, max: 6, puffs: 3, z: 1.85 };
  const bubbles = new THREE.Group(); scene.add(bubbles);
  const bubMat = () => new THREE.MeshPhysicalMaterial({ color: C.bubble, transparent: true, opacity: 0, depthWrite: false, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, iridescence: 1, iridescenceIOR: 1.32, iridescenceThicknessRange: [120, 560] });
  const bodies = [], puffs = [];
  const bodyGeo = new THREE.IcosahedronGeometry(1, 3), puffGeo = new THREE.IcosahedronGeometry(1, 2);
  for (let i = 0; i < BUB.max; i++) { const m = new THREE.Mesh(bodyGeo, bubMat()); m.visible = false; bodies.push(m); bubbles.add(m); }
  for (let i = 0; i < BUB.max * BUB.puffs; i++) { const m = new THREE.Mesh(puffGeo, bubMat()); m.visible = false; puffs.push({ m, angle: ((i % BUB.puffs) / BUB.puffs) * Math.PI * 2 + 0.31 * i, spread: 0.5 + ((37 * i) % 10) / 22 }); bubbles.add(m); }

  // ── Size ──
  const size = { w: 1, h: 1 };
  const resize = () => {
    size.w = innerWidth; size.h = innerHeight;
    renderer.setSize(size.w, size.h, false);
    camera.aspect = size.w / size.h; camera.updateProjectionMatrix();
    const pr = renderer.getPixelRatio();
    rt.setSize(Math.round(size.w * pr * 0.75), Math.round(size.h * pr * 0.75));
    glassU.uRes.value.set(size.w * pr, size.h * pr);
    layoutCard(); layoutMembrane();
  };
  resize();
  addEventListener("resize", resize);

  // Precompile shaders when building the world — so it doesn’t freeze for 0.5 seconds on the first move
  [blossom, bee, membrane, ...bodies, ...puffs.map((p) => p.m)].forEach((o) => (o.visible = true));
  renderer.compile(scene, camera);
  [blossom, bee, membrane, ...bodies, ...puffs.map((p) => p.m)].forEach((o) => (o.visible = false));

  // ── Each frame ──
  const tmp = { v: new THREE.Vector3(), v2: new THREE.Vector3(), v3: new THREE.Vector3(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), e: new THREE.Euler(), m: new THREE.Matrix4(), s: new THREE.Vector3() };
  const UP = new THREE.Vector3(0, 1, 0), FWD = new THREE.Vector3(0, 0, 1), ROLL = new THREE.Vector3(0, 0, 1);
  const beeState = { face: 0, walk: 0, air: 0, hx: 0, hy: 0, hover: false, wiggle: 9, serial: 0, flutterNext: 2, flutterS: 9 };
  const dim = document.querySelector(".rw-dim");
  let dimBg = "", frames = 0;

  const pb = { up: new THREE.Vector3(), fwd: new THREE.Vector3(), left: new THREE.Vector3(), q: new THREE.Quaternion() };
  const perchBasis = () => {
    pb.up.set(...PERCH.normal).normalize();
    pb.fwd.set(...PERCH.heading);
    pb.fwd.addScaledVector(pb.up, -pb.fwd.dot(pb.up)).normalize();
    pb.left.crossVectors(pb.up, pb.fwd).normalize();
    tmp.m.makeBasis(pb.left, pb.up, pb.fwd);
    return pb.q.setFromRotationMatrix(tmp.m);
  };
  const beePos = new THREE.Vector3();

  const tick = () => {
    const dt = rw.dt, t = rw.t;
    // Derived from progress value
    st.land = sstep(0.76, 0.985, st.flight);
    st.handOver = damp(st.handOver, smoother(clamp((blockT(st.epi) + EPI.lead) / (EPI.lead - 0.04))), 3.2, dt);
    st.spin = reduce ? 0 : damp(st.spin, smoother(clamp((blockT(st.epi) + 0.94) / 0.82)), 3.2, dt);
    const relightGoal = smoother(clamp((blockT(st.epi) + 0.3) / 0.8));
    st.relight = reduce ? relightGoal : damp(st.relight, relightGoal, 3.2, dt);
    st.membraneOut = sstep(0.56, 0.88, st.flight) * (1 - 0.45 * st.handOver);
    st.glassIn = 1 - st.membraneOut;

    // Video time: progress 0–72% maps to 0–4.3s, the rest to 4.3–5.68s (slower)
    const ft = clamp(st.filmT), sec = reduce ? FILM.parkAt : ft < FILM.fastShare ? (ft / FILM.fastShare) * FILM.slowFrom : FILM.slowFrom + ((ft - FILM.fastShare) / (1 - FILM.fastShare)) * (FILM.duration - FILM.slowFrom);
    filmTime = clamp(sec, 0.02, FILM.duration - 0.05);
    if (filmMode === "video" && video.readyState >= 1) {
      if (!video.paused) video.pause();
      if (Math.abs(filmTime - video.currentTime) >= 0.021 && (!seeking || performance.now() - seekAt > 320)) {
        seeking = true; seekAt = performance.now();
        try { video.currentTime = filmTime; } catch (e) { seeking = false; }
      }
    } else if (filmMode === "canvas" && Math.abs((filmTex.userData.t ?? -1) - filmTime) > 0.01) {
      paintFilm(filmTime); filmTex.userData.t = filmTime; filmTex.needsUpdate = true;
    }
    sampleFilm();
    for (const k of ["r", "g", "b", "level"]) light[k] = damp(light[k], lightGoal[k], 7, dt);
    light.kx = damp(light.kx, lightGoal.kx, 4, dt); light.ky = damp(light.ky, lightGoal.ky, 4, dt);

    // Light
    scene.environmentIntensity = mix(0.3, 0.6, st.relight);
    key.color.setRGB(mix(1, light.r, 0.72), mix(1, light.g, 0.72), mix(1, light.b, 0.72));
    key.intensity = mix(0.8, 2.6, light.level);
    key.position.set(5 * light.kx + 1.5, 3 * light.ky + 3.4, 4.2);
    rim.color.setRGB(mix(1.1 * light.r, 1, 0.6 * st.relight), mix(1.08 * light.g, 0.86, 0.6 * st.relight), mix(Math.min(1, 1.2 * light.b), 0.66, 0.6 * st.relight));
    rim.intensity = mix(0.3, 2.6, light.level) + 1.1 * st.relight;
    rim.position.set(-(4 * light.kx) - 2, 2 * light.ky - 1.2, -3.6);
    ambient.color.setRGB(0.7 * light.r + 0.06, 0.66 * light.g + 0.05, 0.6 * light.b + 0.04);
    ambient.intensity = mix(0.35, 1.15, light.level);

    // Video panel
    const cs = st.cardS, ho = st.handOver, cf = cardFit;
    const sc = mix(1, cf.scale, cs);
    cardG.scale.setScalar(sc);
    cardG.position.set(mix(cf.x, 0, cs), mix(0, cf.y, cs) + 0.6 * ho, -1 - 2.4 * ho);
    cardMat.opacity = 1 - sstep(0.1, 0.9, ho);
    card.visible = ho < 0.9;
    Object.assign(P, { gx: cardG.position.x, gy: cardG.position.y, sc, w: cf.w, h: cf.h, hc: cf.hc, vw: cf.vw, vh: cf.vh });

    // Flower
    const fl = clamp(st.flight), v0 = viewAt(0);
    const bsx = curve(BLOSSOM.sx, fl), bsy = curve(BLOSSOM.sy, fl);
    const narrow = clamp((1.2 - v0.width / v0.height) / 0.6);
    const bw = curve(BLOSSOM.w, fl) * mix(1, 1.75, narrow);
    blossom.visible = bsy < 1.85;
    blossom.position.set((bsx - 0.5) * v0.width + ho * v0.width * 0.2, (0.5 - bsy) * v0.height - ho * v0.height * 0.06, -0.35 - 0.9 * ho);
    blossom.scale.setScalar((bw * v0.width * (1 - 0.22 * ho)) / bNative);
    windU.uTime.value = t;
    windU.uWind.value = reduce ? 0 : mix(0.55, 1.45, Math.sin(clamp(fl) * Math.PI));
    const impact = st.land > 0.5 ? Math.exp(-(9 * (st.land - 0.5))) : 0;
    windU.uImpact.value = mix(windU.uImpact.value, impact, 0.12);
    windU.uLand.value.copy(perch.position).add(bcentre);
    if (!reduce) { bSway.rotation.set(0.1 + 0.025 * Math.sin(0.24 * t), 0.09 * Math.sin(0.19 * t) + 0.05 * rw.px, 0.045 * Math.sin(0.37 * t)); }
    bSpin.rotation.y = st.spin * SPIN.turns * Math.PI * 2;
    for (const m of relightMats) m.emissiveIntensity = 0.14 * st.relight;
    blossom.updateMatrixWorld(true);
    perch.getWorldPosition(tmp.v).project(camera);
    st.focusX = (tmp.v.x + 1) / 2; st.focusY = (1 - tmp.v.y) / 2;
    spot.intensity = 3.2 * st.relight;
    if (st.relight > 0.001) { perch.getWorldPosition(spot.target.position); spot.position.copy(spot.target.position).add(tmp.v.set(-1.8, 2.3, 2.8)); }

    // Bee
    const r = fl;
    bee.visible = r > 0.004;
    if (bee.visible) {
      const land = st.land, settled = land > 0.99, c = cue(st.epi);
      // While sitting, it occasionally flaps its wings
      let flutter = 0;
      if (settled && !reduce) {
        beeState.flutterNext -= dt;
        if (beeState.flutterNext <= 0) { beeState.flutterNext = mix(2.4, 5.5, Math.random()); beeState.flutterS = 0; }
        if (beeState.flutterS < 0.5) { beeState.flutterS += dt; const k = clamp(beeState.flutterS / 0.5); flutter = 0.5 * Math.sin(k * Math.PI) * (1 - 0.5 * k); }
      }
      beeState.air = damp(beeState.air, reduce ? 0 : c.air, 1.8, dt);
      beeState.hx = damp(beeState.hx, c.hx, 1.8, dt); beeState.hy = damp(beeState.hy, c.hy, 1.8, dt);
      const air = beeState.air * land, still = land * (1 - air);
      beeState.face = damp(beeState.face, c.face * CUE.turn, 1.6, dt);
      beeState.walk = damp(beeState.walk, c.walk, 2, dt);
      const flying = reduce ? 0 : Math.max(1 - sstep(0.8, 0.96, r), air);
      const buzz = Math.max(flying, flutter);
      const narrowB = clamp((1.2 - v0.width / v0.height) / 0.6);
      const ep = clamp(r / LEAVE.span), ef = carry(ep);
      const ew = P.sx(FILM.bee.x) + FILM.bee.vx * P.kx * ef, eg = P.sy(FILM.bee.y) + FILM.bee.vy * P.ky * ef;
      const ex = FILM.bee.len * P.kx * LEAVE.cover * (1 + 0.1 * ep);
      const blend = sstep(0.8 * LEAVE.span, 1.6 * LEAVE.span, r);
      const fx = mix(ew + LEAVE.centreX * ex, lin(PATH.sx, r), blend);
      const fy = mix(eg - LEAVE.centreY * ex * (v0.width / v0.height), lin(PATH.sy, r), blend);
      const fw = mix(ex, lin(PATH.w, r) * mix(1, 1.6, narrowB), blend);
      const fz = mix(LEAVE.z, lin(PATH.z, r), blend);
      const vz = viewAt(fz);
      const pos = beePos.set((fx - 0.5) * vz.width, (0.5 - fy) * vz.height, fz);
      const bob = (5 * Math.sin(1.15 * t) + 1.8 * Math.sin(8.7 * t) + 0.9 * Math.sin(t * WING.hz * Math.PI * 2)) * (v0.height / size.h) * buzz * 120;
      pos.y += 0.012 * bob * blend;
      let scale = (fw * vz.width) / beeNative;
      const wob = 1 - land;
      const q = tmp.q.setFromEuler(tmp.e.set(lin(PATH.pitch, r) + 0.1 * Math.sin(9 * r) * wob * buzz, lin(PATH.yaw, r), lin(PATH.roll, r) + 0.12 * Math.cos(7 * r) * wob * buzz));
      if (land > 0) {
        const pw = perch.getWorldPosition(new THREE.Vector3());
        const pq = perch.getWorldQuaternion(new THREE.Quaternion()).multiply(perchBasis());
        const ps = perch.getWorldScale(tmp.s).x * PERCH.rel, unit = beeNative * ps;
        const upW = UP.clone().applyQuaternion(pq), fwdW = FWD.clone().applyQuaternion(pq);
        pw.addScaledVector(upW, (PERCH.lift - 0.09 * flutter) * unit).addScaledVector(fwdW, beeState.walk * unit);
        pq.premultiply(new THREE.Quaternion().setFromAxisAngle(upW, beeState.face));
        if (air > 0) {
          const vh = viewAt(pw.z);
          const hov = pw.clone();
          hov.x += beeState.hx * air * vh.width;
          hov.y += beeState.hy * air * vh.height + (0.02 * Math.sin(1.3 * t) + 0.006 * Math.sin(7.9 * t)) * vh.height;
          hov.z += 0.3 * air;
          pw.lerp(hov, air);
          pq.slerp(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.35, beeState.face + 0.12 * Math.PI, 0.1 * Math.sin(1.1 * t))), air);
        }
        pos.lerp(pw, land); q.slerp(pq, land); scale = mix(scale, ps, land);
      }
      // Hovering or pressing on the seated bee makes it shake (8°, 3.4Hz, damping 6.5) and floats a heart above its head
      const ndc = tmp.v2.copy(pos).project(camera), vb = viewAt(pos.z), rad = scale * beeNative * 0.55;
      const dx = (rw.rawX - ndc.x) / ((2 * rad) / vb.width), dy = (rw.rawY - ndc.y) / ((2 * rad) / vb.height);
      const inside = land > 0.5 && dx * dx + dy * dy < 1, hovering = inside && !coarse, tapped = inside && rw.tapSerial !== beeState.serial;
      beeState.serial = rw.tapSerial;
      if ((hovering && !beeState.hover) || tapped) {
        beeState.wiggle = 0;
        beeHead.getWorldPosition(tmp.v3).project(camera);
        rw.drop(((tmp.v3.x + 1) / 2) * size.w, ((1 - tmp.v3.y) / 2) * size.h - 18);
      }
      beeState.hover = hovering; rw.beeHover = hovering;
      beeState.wiggle += dt;
      const wig = beeState.wiggle > 1.2 ? 0 : THREE.MathUtils.degToRad(WIGGLE.deg) * Math.sin(beeState.wiggle * WIGGLE.hz * Math.PI * 2) * Math.exp(-WIGGLE.decay * beeState.wiggle);
      if (wig) q.multiply(new THREE.Quaternion().setFromAxisAngle(ROLL, wig));
      bee.position.copy(pos); bee.scale.setScalar(scale); beeQ.quaternion.copy(q);
      // Wings — flap at 7.5Hz by ±1.18 in flight, fold back at rest (.95)
      const ph = t * WING.hz * Math.PI * 2, open = mix(1, 0.35, still * (1 - flutter));
      wingMat.opacity = mix(WING.opacityRest, WING.opacityFlight, buzz);
      for (const w of wings) {
        const beat = Math.sin(ph - w.lag * Math.PI * 2) * WING.amplitude * w.gain;
        w.pivot.rotation.z = w.side * mix(WING.restStroke, beat, buzz) * open;
        w.pivot.rotation.y = w.side * mix(WING.restSweep, 0.15 + 0.25 * Math.cos(ph), buzz);
        w.pivot.rotation.x = WING.twist * 0.3 * Math.cos(ph) * buzz;
      }
    } else rw.beeHover = false;

    // Glass layer
    const glassOn = useGlass && !!mem;
    membrane.visible = false;
    if (glassOn) {
      const half = mem.half;
      const tx = rw.px * half.w, ty = rw.py * half.h;
      trail[0].x += (tx - trail[0].x) * GLASS.trail[0]; trail[0].y += (ty - trail[0].y) * GLASS.trail[0];
      for (let i = 1; i < 3; i++) { trail[i].x += (trail[i - 1].x - trail[i].x) * GLASS.trail[i]; trail[i].y += (trail[i - 1].y - trail[i].y) * GLASS.trail[i]; }
      const out = st.membraneOut;
      const depth = rw.poked ? GLASS.depth * (rw.pressed ? GLASS.pressGain : 1) * (1 - 0.55 * out) : 0;
      const avoid = [1, 1, 1];
      if (st.land > 0.5) {
        perch.getWorldPosition(tmp.v).project(camera);
        const px = tmp.v.x * half.w, py = tmp.v.y * half.h;
        for (let i = 0; i < 3; i++) avoid[i] = sstep(0.55, 1.2, Math.hypot(trail[i].x - px, trail[i].y - py)) * st.land + (1 - st.land);
      }
      const w2 = GLASS.radius * GLASS.radius, far = 20 * w2;
      const pos = membrane.geometry.attributes.position, arr = pos.array, { z, v, rest } = mem;
      const idle = 0.004 * (1 - out) * (1 - clamp(0.8 * rw.pSpeed));
      for (let i = 0, j = 0; i < z.length; i++, j += 3) {
        const x = rest[j], y = rest[j + 1];
        let goal = idle * (Math.sin(0.7 * x + 0.42 * t) * Math.cos(0.55 * y - 0.31 * t) + 0.6 * Math.sin(0.31 * x - 0.44 * y + 0.23 * t));
        for (let k = 0; k < 3; k++) {
          const ddx = x - trail[k].x, ddy = y - trail[k].y, d2 = ddx * ddx + ddy * ddy;
          if (d2 > far) continue;
          goal -= depth * trail[k].w * avoid[k] * (Math.exp(-d2 / w2) - 0.34 * Math.exp(-d2 / (3.2 * w2)));
        }
        v[i] += (goal - z[i]) * GLASS.spring; v[i] *= GLASS.damping; z[i] += v[i]; arr[j + 2] = z[i];
      }
      pos.needsUpdate = true;
      membrane.geometry.computeVertexNormals();
      const press = clamp(0.4 * rw.pSpeed + 0.5 * (rw.pressed ? 1 : 0));
      glassU.uRough.value = mix(mix(GLASS.roughnessRest, GLASS.roughnessPressed, press), GLASS.clear.roughness, out);
      glassU.uThick.value = mix(mix(GLASS.thicknessRest, GLASS.thicknessPressed, press), GLASS.clear.thickness, out);
      glassU.uChroma.value = mix(GLASS.chroma, GLASS.clear.chroma, out);
      glassU.uAniso.value = mix(GLASS.aniso, GLASS.clear.aniso, out);
      glassU.uTime.value = t;
    }

    // Soap bubbles
    const now = performance.now();
    while (rw.taps.length && now - rw.taps[0].born > BUB.life) rw.taps.shift();
    bubbles.visible = !reduce && st.glassIn > 0.02 && useGlass;
    const vb = viewAt(BUB.z), hw = vb.width / 2, hh = vb.height / 2;
    for (let i = 0; i < BUB.max; i++) {
      const b = bodies[i], tap = rw.taps[i];
      if (!tap || !bubbles.visible) { b.visible = false; for (let k = 0; k < BUB.puffs; k++) puffs[i * BUB.puffs + k].m.visible = false; continue; }
      const age = clamp((now - tap.born) / BUB.life), x = tap.x * hw, y = tap.y * hh;
      const grow = clamp(age / 0.47), swell = 1.08 * Math.sin(grow * Math.PI * 0.5) - 0.08 * grow, pop = clamp((age - 0.72) / 0.28);
      const s = Math.max(1e-4, (swell - 0.34 * pop) * 0.085), fade = (1 - pop) * clamp(1.6 * grow);
      b.visible = fade > 0.01; b.position.set(x, y, BUB.z);
      const squash = (1 - grow) * 0.3 + 0.4 * pop;
      b.scale.set(s * (1 + 0.5 * squash), s * (1 - 0.34 * squash), s);
      b.rotation.set(1.6 * age, 2.3 * age, 0.9 * age);
      b.material.opacity = 0.72 * fade;
      for (let k = 0; k < BUB.puffs; k++) {
        const p = puffs[i * BUB.puffs + k], spread = clamp((age - 0.24) / 0.6), o = fade * (1 - spread) * 0.55;
        p.m.visible = o > 0.01;
        p.m.position.set(x + Math.cos(p.angle) * spread * p.spread * 0.38, y + Math.sin(p.angle) * spread * p.spread * 0.26 + 0.05 * spread, BUB.z + 0.02);
        p.m.scale.setScalar(Math.max(1e-4, s * (0.24 + 0.5 * spread)));
        p.m.material.opacity = o;
      }
    }

    // Dim curtain — on moving to the closing section it covers up to .4 then lights only a round spot where the bee sits
    if (dim) {
      dim.style.opacity = (st.handOver * (0.4 - 0.1 * st.relight)).toFixed(3);
      let bg = "";
      if (st.relight > 0.01) bg = `radial-gradient(ellipse 38vmax 44vmax at ${Math.round(100 * st.focusX)}% ${Math.round(100 * st.focusY)}%, color-mix(in srgb, var(--kf-bg) ${Math.round(100 - 62 * st.relight)}%, transparent) 0%, var(--kf-bg) 100%)`;
      if (bg !== dimBg) { dimBg = bg; dim.style.backgroundImage = bg; dim.style.backgroundColor = bg ? "transparent" : ""; }
    }

    // Drawing — if there is a glass layer, the scene behind is drawn separately first so the layer refracts it
    if (glassOn) {
      bubbles.visible = false;
      renderer.setRenderTarget(rt);
      renderer.setClearColor(C.raised, 1);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.setClearColor(0x000000, 0);
      const keep = [cardG.visible, blossom.visible, bee.visible];
      cardG.visible = blossom.visible = bee.visible = false;
      membrane.visible = true;
      bubbles.visible = !reduce && st.glassIn > 0.02;
      renderer.clear();
      renderer.render(scene, camera);
      [cardG.visible, blossom.visible, bee.visible] = keep;
    } else {
      renderer.setClearColor(0x000000, 0);
      renderer.render(scene, camera);
    }
    if (!rw.sceneWarm && ++frames >= 10) rw.sceneWarm = true;
  };
  gsap.ticker.add(tick);
})();
