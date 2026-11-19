(() => {
  const site = window.site;
  const reduce = site.reduce, fine = site.fine;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();

  // ── Shape table (100×100 cells) — squares are most frequent (8), circles (2), the rest 1
  const SHAPES = {
    square: "M0,0 H100 V100 H0 Z",
    circle: "M50,0 C77.6,0 100,22.4 100,50 C100,77.6 77.6,100 50,100 C22.4,100 0,77.6 0,50 C0,22.4 22.4,0 50,0 Z",
    diamond: "M50,0 L100,50 L50,100 L0,50 Z",
    triTl: "M0,0 H100 L0,100 Z", triTr: "M0,0 H100 V100 Z", triBr: "M100,0 V100 H0 Z", triBl: "M0,0 V100 H100 Z",
    arch: "M0,100 V50 C0,22.4 22.4,0 50,0 C77.6,0 100,22.4 100,50 V100 Z",
    leaf: "M100,0 C44.8,0 0,44.8 0,100 C55.2,100 100,55.2 100,0 Z",
    quarter: "M0,0 H100 V45 C100,75 75,100 45,100 H0 Z",
    scoopBr: "M0,0 H100 V50 C72.4,50 50,72.4 50,100 H0 Z", scoopBl: "M0,0 H100 V100 H50 C50,72.4 27.6,50 0,50 Z",
    scoopTr: "M0,0 H50 C50,27.6 72.4,50 100,50 V100 H0 Z", scoopTl: "M50,0 H100 V100 H0 V50 C27.6,50 50,27.6 50,0 Z",
  };
  const WEIGHT = { square: 8, circle: 2 };
  const pickShape = (cur) => {
    const keys = Object.keys(SHAPES).filter((k) => k !== cur);
    let r = Math.random() * keys.reduce((a, k) => a + (WEIGHT[k] || 1), 0);
    for (const k of keys) { r -= WEIGHT[k] || 1; if (r < 0) return k; }
    return keys[keys.length - 1];
  };
  // Cell layout: [column, row, shape, color] — columns 6~16 are the eleven visible columns, outer columns are filler cells
  const C = { s: "--site-sky", g: "--site-sage", c: "--site-coral", m: "--site-lime", a: "--site-apricot", l: "--site-lime-light", t: "--site-steel" };
  const CELLS = [
    [6,1,"square","s"],[7,1,"square","g"],[8,1,"triBr","c"],[10,1,"square","m"],[11,1,"square","g"],[12,1,"square","m"],[13,1,"diamond","c"],[14,1,"square","a"],
    [7,2,"circle","m"],[8,2,"square","a"],[9,2,"triTl","c"],[10,2,"square","s"],[12,2,"square","s"],[13,2,"quarter","g"],[14,2,"quarter","g"],[15,2,"square","m"],
    [6,3,"square","g"],[7,3,"square","l"],[9,3,"square","g"],[10,3,"square","c"],[11,3,"arch","g"],[12,3,"square","l"],[13,3,"square","s"],[14,3,"square","m"],[16,3,"square","l"],
    [1,1,"square","a"],[1,2,"square","l"],[2,1,"square","s"],[2,2,"triTl","c"],[3,1,"arch","a"],[3,2,"square","s"],[3,3,"circle","l"],[4,1,"square","l"],[4,2,"square","a"],[4,3,"square","m"],
    [5,1,"square","s"],[5,2,"scoopBl","m"],[5,3,"scoopBl","g"],[17,1,"scoopBr","a"],[17,3,"leaf","c"],[18,1,"square","g"],[18,3,"leaf","c"],[19,2,"scoopTl","m"],[20,1,"scoopTl","g"],[21,2,"square","t"],[21,3,"scoopBl","m"],
  ];
  const LOOP = [11, 2];

  // ── Hero tiles: a puzzle where neighboring tiles slide into the empty cell — one step .5s power2.inOut, rest .2s, after three steps it returns and rests .8s.
  //    Each step, two shapes change into different forms, and every three steps the title word changes. Tiles within 100px of the cursor shrink down to .72 (.4s power3.out)
  const heroBottom = $(".hero_bottom"), tilesEl = $("[data-tiles]");
  const tiles = [];
  const ns = "http://www.w3.org/2000/svg";
  CELLS.forEach(([col, row, shape, c]) => {
    const el = document.createElement("div");
    el.className = "hero_tile";
    el.style.setProperty("--col", col); el.style.setProperty("--row", row);
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none");
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", SHAPES[shape]); p.style.fill = `var(${C[c]})`;
    svg.append(p); el.append(svg); tilesEl.append(el);
    tiles.push({ el, svg, path: p, col0: col, row0: row, col, row, shape });
  });
  const setCell = () => heroBottom.style.setProperty("--cellpx", (heroBottom.getBoundingClientRect().width + 2) / 11 + "px");
  setCell();
  new ResizeObserver(setCell).observe(heroBottom);

  const words = $$(".hero_word");
  const wordSplits = words.map((w) => new SplitText(w, { type: "chars", charsClass: "hero_char" }));
  let wordIndex = 0;
  const wordColors = ["--site-lime", "--site-coral", "--site-steel", "--site-sage"];
  function nextWord() {
    const cur = wordSplits[wordIndex], nx = wordSplits[(wordIndex + 1) % wordSplits.length];
    words[wordIndex].style.visibility = "visible";
    words[(wordIndex + 1) % words.length].style.visibility = "visible";
    gsap.set(cur.chars, { "--enter": 0 });
    gsap.fromTo(cur.chars, { "--leave": 0 }, { "--leave": 1, autoAlpha: 0, stagger: 0.02, duration: 0.4, overwrite: "auto" });
    nx.chars.forEach((c) => c.style.setProperty("--deg", gsap.utils.random(-8, 8, 2) + "deg"));
    const col = getComputedStyle(document.documentElement).getPropertyValue(gsap.utils.random(wordColors)).trim();
    gsap.set(nx.chars, { "--leave": 0, color: col });
    const tl = gsap.timeline({ defaults: { stagger: 0.02, overwrite: "auto", duration: 0.6 } });
    tl.fromTo(nx.chars, { autoAlpha: 0, "--enter": 1 }, { autoAlpha: 1, "--enter": 0, delay: 0.2 });
    tl.to(nx.chars, { color: getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim(), duration: 0.48 }, "<0.05");
    wordIndex = (wordIndex + 1) % wordSplits.length;
  }
  wordSplits.forEach((s, i) => i && gsap.set(s.chars, { autoAlpha: 0 }));

  const key = (c, r) => c + ":" + r;
  function shuffleSteps() {
    tiles.forEach((t) => { t.col = t.col0; t.row = t.row0; });
    const occ = new Map(tiles.map((t, i) => [key(t.col, t.row), i]));
    const blocked = new Set([key(LOOP[0], LOOP[1])]);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const steps = [];
    for (let s = 0; s < 3; s++) {
      const moves = [], used = new Set();
      const empties = [];
      for (let r = 1; r <= 3; r++) for (let c = 1; c <= 21; c++) if (!occ.has(key(c, r)) && !blocked.has(key(c, r))) empties.push([c, r]);
      gsap.utils.shuffle(empties).forEach(([c, r]) => {
        const opts = dirs.filter(([dx, dy]) => occ.has(key(c + dx, r + dy)) && !used.has(key(c + dx, r + dy)));
        if (!opts.length) return;
        let tot = opts.reduce((a, [, dy]) => a + (dy === 0 ? 1 : 5), 0), pick = Math.random() * tot, d = opts[0];
        for (const o of opts) { pick -= o[1] === 0 ? 1 : 5; if (pick < 0) { d = o; break; } }
        const run = d[1] === 0 ? 1 : 2;
        let x = c + d[0], y = r + d[1], g = 0, tc = c, tr = r;
        while (g < run && occ.has(key(x, y)) && !used.has(key(x, y)) && x >= 1 && x <= 21 && y >= 1 && y <= 3) {
          const idx = occ.get(key(x, y));
          moves.push({ idx, col: tc, row: tr });
          used.add(key(x, y)); used.add(key(tc, tr));
          tc = x; tr = y; x += d[0]; y += d[1]; g++;
        }
      });
      moves.forEach((m) => { const t = tiles[m.idx]; occ.delete(key(t.col, t.row)); });
      moves.forEach((m) => { const t = tiles[m.idx]; t.col = m.col; t.row = m.row; occ.set(key(t.col, t.row), m.idx); });
      steps.push(tiles.map((t) => [t.col, t.row]));
    }
    return steps;
  }
  let puzzle = null, stepCount = 0;
  function buildPuzzle() {
    puzzle?.kill();
    const steps = shuffleSteps();
    const seq = [...steps, steps[1], steps[0], tiles.map((t) => [t.col0, t.row0])];
    puzzle = gsap.timeline({ repeat: -1, paused: true, defaults: { duration: 0.5, ease: "power2.inOut" } });
    let at = 0;
    seq.forEach((pos, si) => {
      tiles.forEach((t, i) => puzzle.to(t.el, { "--col": pos[i][0], "--row": pos[i][1] }, at));
      puzzle.call(morphStep, null, at);
      puzzle.call(() => { if (++stepCount % 3 === 0) nextWord(); }, null, at);
      at += 0.5 + (si === seq.length - 1 ? 0.8 : 0.2);
    });
    puzzle.set({}, {}, at);
  }
  function morphStep() {
    const pool = tiles.filter((t) => t.col >= 6 && t.col <= 16);
    for (let k = 0; k < 2 && pool.length; k++) {
      const t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      t.shape = pickShape(t.shape);
      gsap.to(t.path, { morphSVG: SHAPES[t.shape], duration: 0.5, ease: "power2.inOut", overwrite: "auto" });
    }
  }
  function spotlight() {
    const setters = tiles.map((t) => ({ t, sx: gsap.quickTo(t.svg, "scaleX", { duration: 0.4, ease: "power3.out" }), sy: gsap.quickTo(t.svg, "scaleY", { duration: 0.4, ease: "power3.out" }) }));
    let mx = -9999, my = -9999, active = false;
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
    gsap.ticker.add(() => {
      const b = heroBottom.getBoundingClientRect(), R = 100;
      if (!(mx >= b.left - R && mx <= b.right + R && my >= b.top - R && my <= b.bottom + R)) {
        if (active) { setters.forEach((s) => { s.sx(1); s.sy(1); }); active = false; }
        return;
      }
      active = true;
      for (const s of setters) {
        const r = s.t.svg.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - mx, r.top + r.height / 2 - my);
        const v = gsap.utils.clamp(0.72, 1, gsap.utils.mapRange(0, R, 0.72, 1, d));
        s.sx(v); s.sy(v);
      }
    });
  }
  const heroIO = new IntersectionObserver(([e]) => { if (!puzzle) return; e.isIntersecting && heroStarted ? puzzle.play() : puzzle.pause(); });
  let heroStarted = false;
  heroIO.observe(heroBottom);

  // While the loader clears, tiles pop out from the center with back(1.2) and the title lines rise with power4
  const heroLines = $$(".hero_title .hero_line-in, .hero_lead .hero_line-in");
  site.revealHero = (tl) => {
    if (reduce) return;
    const b = heroBottom.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, R = Math.hypot(b.width / 2, b.height / 2);
    const dist = tiles.map((t) => { const r = t.el.getBoundingClientRect(); return Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy); });
    tl.fromTo(tiles.map((t) => t.el), { "--s": 0 }, { "--s": 1, duration: 0.7, ease: "back(1.2)", stagger: (i) => Math.min(1, dist[i] / R) * 0.45 }, 0.85);
    tl.fromTo(heroLines, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: "power4", stagger: 0.04 }, 0.9);
    tl.fromTo(".hero_top-line", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, 0.3);
    tl.fromTo(".hero_label-text", { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.05 }, 1.7);
  };

  // ── Grid (WebGL): 34px cell lines, lines thicken and darken (.15→.4) by the flow trail left where the cursor passed, then settle within 1 second ──
  function makeTrail(w, h) {
    // Small flow board: stamps round marks by cursor speed and erases 8% each frame — the shader reads this board as heat trails
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d");
    let last = null;
    return {
      canvas: c,
      splat(u, v, speed) {
        const px = u * w, py = v * h;
        const r = Math.min(w, h) * (0.08 + Math.min(speed, 1) * 0.1);
        const g = x.createRadialGradient(px, py, 0, px, py, r);
        g.addColorStop(0, `rgba(255,255,255,${Math.min(1, 0.25 + speed)})`); /* Not skin: flow strength the shader reads (black-and-white mask) */
        g.addColorStop(1, "rgba(255,255,255,0)"); /* Not skin: flow mask edge */
        x.fillStyle = g;
        if (last) { const n = Math.ceil(Math.hypot(px - last[0], py - last[1]) / (r * 0.4)); for (let i = 1; i <= n; i++) { x.save(); x.translate((last[0] - px) * (1 - i / n), (last[1] - py) * (1 - i / n)); x.fillRect(px - r, py - r, r * 2, r * 2); x.restore(); } }
        else x.fillRect(px - r, py - r, r * 2, r * 2);
        last = [px, py];
      },
      lift() { last = null; },
      fade() { x.globalCompositeOperation = "destination-out"; x.fillStyle = "rgba(0,0,0,.08)"; /* Not skin: clear the flow mask */ x.fillRect(0, 0, w, h); x.globalCompositeOperation = "source-over"; },
    };
  }
  function gridGL() {
    const canvas = $("[data-gl-grid]");
    if (!canvas || !window.OGL) return;
    const { Renderer, Program, Mesh, Triangle, Texture } = OGL;
    const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true, premultipliedAlpha: true });
    const gl = renderer.gl;
    const trail = makeTrail(128, 40);
    const tex = new Texture(gl, { image: trail.canvas, generateMipmaps: false });
    const program = new Program(gl, {
      transparent: true,
      vertex: `attribute vec2 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0., 1.); }`,
      fragment: `precision highp float;
        uniform vec2 uRes; uniform float uCell; uniform float uOff; uniform float uDpr; uniform vec3 uColor; uniform sampler2D tTrail;
        varying vec2 vUv;
        void main(){
          vec2 px = vec2(vUv.x, 1. - vUv.y) * uRes / uDpr + vec2(0., uOff);
          float heat = texture2D(tTrail, vec2(vUv.x, 1. - vUv.y)).a;
          float th = (1. + .5 * heat * 2.);
          vec2 g = mod(px, uCell);
          float lx = 1. - step(th, g.x);
          float ly = 1. - step(th, g.y);
          float line = max(lx, ly);
          float a = line * mix(.15, .4, clamp(heat * 1.4, 0., 1.));
          gl_FragColor = vec4(uColor * a, a);
        }`,
      uniforms: { uRes: { value: [1, 1] }, uCell: { value: 34 }, uOff: { value: 17 }, uDpr: { value: 1 }, uColor: { value: site.rgb("--site-coral") }, tTrail: { value: tex } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const size = () => {
      const r = canvas.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
      program.uniforms.uDpr.value = renderer.dpr;
      program.uniforms.uOff.value = 34 - ((r.top + scrollY - 17) % 34);
    };
    size();
    new ResizeObserver(size).observe(canvas);
    let lx = null, ly = null, vis = true;
    new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(canvas);
    window.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
      if (u < -0.1 || u > 1.1 || v < -0.1 || v > 1.1) { trail.lift(); lx = null; return; }
      const sp = lx == null ? 0 : Math.hypot(e.clientX - lx, e.clientY - ly) / 40;
      lx = e.clientX; ly = e.clientY;
      trail.splat(u, v, sp);
    });
    // Draw once when setting up the shader to precompile it — so the first cursor move doesn’t stall
    renderer.render({ scene: mesh });
    gsap.ticker.add(() => {
      if (!vis) return;
      trail.fade();
      tex.needsUpdate = true;
      renderer.render({ scene: mesh });
    });
  }

  // ── Intro: the ring circle descends from the hero’s center cell to the intro’s center while growing, and eight shapes pop out with back(1.7) and orbit on a 40s path
  function intro() {
    const logo = $(".intro_logo"), items = $$(".orbit_item");
    const orbitTl = gsap.timeline({ paused: true });
    items.forEach((el, i) => orbitTl.to(el, {
      duration: 40, ease: "none", repeat: -1,
      motionPath: { path: "#orbit-path", align: "#orbit-path", alignOrigin: [0.5, 0.5], start: i / items.length, end: i / items.length + 1 },
    }, 0));
    orbitTl.progress(0.001);
    mm.add({ desk: "(min-width: 1024px)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      const { desk, ok } = ctx.conditions;
      if (!ok) { orbitTl.progress(0); return; }
      const titleSplit = new SplitText(".intro_title", { type: "lines", linesClass: "split-line", mask: "lines" });
      const noteSplit = new SplitText(".intro_note", { type: "lines", mask: "lines" });
      gsap.set([titleSplit.lines, noteSplit.lines], { yPercent: 110 });
      gsap.set(items, { scale: 0 });
      const t1 = gsap.timeline({ paused: true, defaults: { ease: "power4", duration: 1 } }).to(titleSplit.lines, { yPercent: 0, stagger: 0.04 });
      ScrollTrigger.create({ trigger: ".intro_title", start: "top 85%", onEnter: () => t1.timeScale(1).play(), onLeaveBack: () => t1.timeScale(2).reverse() });
      const t2 = gsap.timeline({ paused: true, defaults: { ease: "back(1.7)", duration: 1 }, onStart: () => orbitTl.play(), onReverseComplete: () => orbitTl.pause() });
      t2.to(items, { scale: 1, stagger: 0.05 }).to(noteSplit.lines, { yPercent: 0, ease: "power4", stagger: 0.04 }, 0);
      ScrollTrigger.create({ trigger: desk ? ".intro" : ".intro_logo-parent", start: desk ? `bottom bottom+=${innerHeight * 1.5 - logo.offsetHeight * 0.2}px` : "top 85%", onEnter: () => t2.timeScale(1).play(), onLeaveBack: () => t2.timeScale(2).reverse() });
      if (desk) {
        // Circle’s starting position = Hero ring cell (center column·second row). From 50px of scroll it descends into place until the intro attaches.
        const place = () => {
          gsap.set(logo, { clearProps: "transform" });
          const lr = logo.getBoundingClientRect(), cell = parseFloat(heroBottom.style.getPropertyValue("--cellpx")) || 100;
          const hb = heroBottom.getBoundingClientRect();
          const cy = hb.top + cell * 1.5, cx = hb.left + (LOOP[0] - 6 + 0.5) * cell;
          return { x: cx - (lr.left + lr.width / 2), y: cy - (lr.top + lr.height / 2), scale: cell / lr.width };
        };
        const from = place();
        const tw = gsap.fromTo(logo, { x: () => place().x, y: () => from.y, scale: () => from.scale }, { x: 0, y: 0, scale: 1, ease: "none", immediateRender: true });
        ScrollTrigger.create({ trigger: "main", start: "top top-=50", endTrigger: ".intro", end: "bottom bottom+=150%", scrub: true, animation: tw, invalidateOnRefresh: true });
        gsap.fromTo(".hero", { "--hero-mask": 0 }, { "--hero-mask": 1, ease: "none", scrollTrigger: { trigger: "main", start: "top top-=50", end: `+=${innerHeight * 0.8}`, scrub: true } });
      }
      return () => { titleSplit.revert(); noteSplit.revert(); };
    });
  }

  // ── Distraction: over 3 pinned screens the frame opens up, the brackets are pushed to both ends of the speech bubble, and the bubble pops out from ”Just one” with back(1.2) .4s at .02 steps
  function distraction() {
    const sec = $(".distraction"), frame = $(".distraction_frame"), tags = $$(".tag"), parens = $$(".paren"), wrap = $(".distraction_tags");
    const pivot = tags.findIndex((t) => t.hasAttribute("data-pivot"));
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "none" } });
      const fw = frame.offsetWidth, fh = frame.offsetHeight;
      tl.fromTo(frame, { width: fw, height: fh }, { width: () => innerWidth - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--u")) * 120, height: () => Math.max(fh, innerHeight - 2 * (56 + 40)), duration: 1, ease: "power4" }, 0);
      tl.fromTo(parens[0], { x: 0 }, { x: () => -(wrap.offsetWidth / 2) - 10, duration: 1, ease: "power4" }, 0);
      tl.fromTo(parens[1], { x: 0 }, { x: () => wrap.offsetWidth / 2 + 10, duration: 1, ease: "power4" }, 0);
      tl.fromTo(tags, { opacity: 0, scale: 0.01 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back(1.2)", stagger: { each: 0.02, from: pivot >= 0 ? pivot : "center" } }, 0.3);
      ScrollTrigger.create({ trigger: sec, start: "top top", end: "bottom bottom+=50%", scrub: true, animation: tl, invalidateOnRefresh: true });
      gsap.fromTo(".distraction_wrap", { "--fade": 0 }, { "--fade": 1, ease: "none", scrollTrigger: { trigger: ".app-demo", start: "top 90%", end: "top 30%", scrub: true } });
    });
  }

  // ── Lime cell wipe (WebGL): 160px cells take their order along the diagonal (-1,1) direction + .4 random, spreading with a .5 edge to cover the screen in lime
  function revealGL() {
    const canvas = $("[data-gl-reveal]");
    if (!canvas || !window.OGL) return;
    const { Renderer, Program, Mesh, Triangle } = OGL;
    const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true, premultipliedAlpha: true });
    const gl = renderer.gl;
    const program = new Program(gl, {
      transparent: true,
      vertex: `attribute vec2 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 0., 1.); }`,
      fragment: `precision highp float;
        uniform vec2 uRes; uniform float uCell; uniform float uProgress; uniform float uEdge; uniform float uJitter; uniform vec2 uDir; uniform vec3 uColor; uniform vec3 uColor2;
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.743); }
        void main(){
          vec2 px = vec2(vUv.x, 1. - vUv.y) * uRes;
          vec2 cell = floor(px / uCell);
          vec2 count = max(ceil(uRes / uCell), vec2(1.));
          vec2 cp = (cell + .5) / count;
          vec2 d = normalize(uDir);
          float lo = min(d.x, 0.) + min(d.y, 0.), hi = max(d.x, 0.) + max(d.y, 0.);
          float grad = (dot(cp, d) - lo) / max(hi - lo, 1e-4);
          float th = mix(grad, hash(cell), uJitter);
          float p = uProgress * (1. + 2. * uEdge) - uEdge;
          float vis = smoothstep(th - uEdge, th + uEdge, p);
          float tone = step(.7, hash(cell + 7.)) * (1. - vis) * vis * 4.;
          vec3 col = mix(uColor, uColor2, clamp(tone, 0., 1.));
          gl_FragColor = vec4(col * vis, vis);
        }`,
      uniforms: { uRes: { value: [1, 1] }, uCell: { value: 160 }, uProgress: { value: 0 }, uEdge: { value: 0.5 }, uJitter: { value: 0.4 }, uDir: { value: [-1, 1] }, uColor: { value: site.rgb("--site-lime") }, uColor2: { value: site.rgb("--site-lime-light") } },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const size = () => {
      renderer.setSize(innerWidth, innerHeight);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
      program.uniforms.uCell.value = 160 * renderer.dpr * Math.min(1, innerWidth / 1440);
    };
    size();
    addEventListener("resize", size);
    const st = { p: reduce ? 1 : 0 };
    const head = $(".app-demo_title");
    const draw = () => {
      program.uniforms.uProgress.value = st.p;
      head.style.setProperty("--show", gsap.utils.clamp(0, 1, (st.p - 0.55) / 0.3));
      renderer.render({ scene: mesh });
    };
    draw();
    if (reduce) return;
    gsap.to(st, { p: 1, ease: "none", onUpdate: draw, scrollTrigger: { trigger: ".app-demo", start: "top 80%", end: "top -40%", scrub: true } });
    // Title: from big text sized to the screen width (weight 600), it shrinks to the section title size (500) while the app screen rises.
    const title = $(".app-demo_title");
    const fit = () => {
      title.style.setProperty("--p", 0);
      const w = title.getBoundingClientRect().width || 1;
      const base = parseFloat(getComputedStyle(title).fontSize);
      title.style.setProperty("--fit", Math.min(base * (innerWidth * 0.9 / w), 260) + "px");
    };
    fit(); addEventListener("resize", fit);
    gsap.fromTo(title, { "--p": 1 }, { "--p": 0, ease: "none", scrollTrigger: { trigger: ".app-demo_stage", start: "top bottom", end: "top 25%", scrub: true } });
    gsap.from(".adm", { yPercent: 12, scale: 0.92, ease: "none", scrollTrigger: { trigger: ".app-demo_stage", start: "top bottom", end: "center center", scrub: true } });
  }

  // ── Copy-paste values: cards pop out from .55→1 with back.out(1.6), the total counts up, then they gather into a single circle
  function stack() {
    const apps = $$(".stack_app"), total = $("[data-total]"), logins = $("[data-logins]");
    const sum = apps.reduce((a, el) => a + Number(el.dataset.price || 0), 0);
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(apps, { scale: 0.55, autoAlpha: 0, rotate: (i) => (i % 2 ? 6 : -6) }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.7, ease: "back.out(1.6)", stagger: 0.08 })
        .fromTo($$(".stack_stat, .stack_sync"), { autoAlpha: 0, yPercent: 25 }, { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0.3)
        .fromTo({ v: 0 }, { v: 0 }, { v: sum, duration: 1.2, ease: "power2.out", onUpdate() { total.textContent = Math.round(this.targets()[0].v); } }, 0.4)
        .fromTo({ v: 0 }, { v: 0 }, { v: apps.length, duration: 1.2, ease: "power2.out", onUpdate() { logins.textContent = Math.round(this.targets()[0].v); } }, 0.4);
      ScrollTrigger.create({ trigger: ".stack_grid", start: "top 75%", onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() });
      const hub = gsap.timeline({ scrollTrigger: { trigger: ".stack_hub", start: "top 85%", end: "top 25%", scrub: true } });
      hub.fromTo(".stack_ring", { scale: 0.4, rotate: -120, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, ease: "power2.inOut" }, 0)
        .fromTo(".stack_stem", { scaleY: 0, transformOrigin: "50% 0" }, { scaleY: 1, ease: "power2.inOut" }, 0.2)
        .fromTo(".stack_mark", { scale: 0 }, { scale: 1, ease: "back.out(2)" }, 0.4)
        .fromTo(".stack_one", { yPercent: 25, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: "power2.out" }, 0.5)
        .fromTo(".stack_side", { autoAlpha: 0, yPercent: 25 }, { autoAlpha: 1, yPercent: 0, ease: "power2.out" }, 0.5);
    });
    if (reduce) { total.textContent = sum; logins.textContent = apps.length; }
  }

  // ── Five-card stack: when the next card rises, the previous card shrinks to .82+n*.04 and tilts back -8° (screen 15+n*3% → next card 6%)
  function highlights() {
    const cards = $$(".hl_card");
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
      cards.forEach((c, n) => {
        if (n === cards.length - 1) return;
        gsap.to(c, { scale: 0.82 + n * 0.04, rotateX: "-8deg", ease: "none", immediateRender: true, scrollTrigger: { trigger: c, start: `top ${15 + n * 3}%`, endTrigger: cards[cards.length - 1], end: "top 6%", scrub: true } });
      });
    });
    // Small screen inside: the gauge needle fills, numbers count up, and schedule bars grow
    const gauge = $(".gauge_val");
    if (gauge) gsap.fromTo(gauge, { strokeDashoffset: 1 }, { strokeDashoffset: 0.8, duration: 1.2, ease: "power3.inOut", scrollTrigger: { trigger: gauge, start: "top 85%", toggleActions: "play none none reverse" } });
    $$("[data-count]").forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 1.2, ease: "power3.inOut", onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString("en-US")), scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" } });
    });
    gsap.from(".tl_bar", { scaleX: 0, duration: 0.8, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: ".tl", start: "top 80%", toggleActions: "play none none reverse" } });
  }

  // ── Folders: tabbed folders slide up 2~3 cells at a time in 1.1s power3.inOut (.025 stagger), and every third one slides around 4 cells in 1.5s. The folder under the cursor sinks 70 cells (.6s power3.out)
  function folders() {
    const tile = $("[data-folders]"), stackEl = tile?.querySelector(".folders_stack");
    if (!stackEl) return;
    const colors = ["--site-lime", "--site-apricot", "--site-steel", "--site-sage", "--site-lime-light", "--site-coral", "--site-sky"];
    const X = [80, 20, 50, 70, 30, 60, 40];
    const TOP0 = -8, GAP = 10.9, N = 14;
    const items = [];
    for (let i = 0; i < N; i++) {
      const el = document.createElement("div");
      el.className = "folder";
      el.innerHTML = `<svg viewBox="0 0 910 340" preserveAspectRatio="none"><path d="M0 40 Q0 0 40 0 H${260 + (i % 4) * 120} Q${290 + (i % 4) * 120} 0 ${305 + (i % 4) * 120} 30 L${320 + (i % 4) * 120} 48 H870 Q910 48 910 88 V340 H0 Z"/></svg><span class="folder_label" lang="en">Project</span>`;
      stackEl.append(el);
      items.push({ el, slot: i });
    }
    const dress = (it, k) => {
      it.el.querySelector("path").style.fill = `var(${colors[k % colors.length]})`;
      it.el.querySelector(".folder_label").style.setProperty("--x", X[k % X.length]);
    };
    let dressN = 0;
    items.forEach((it) => { dress(it, dressN++); it.el.style.setProperty("--top", TOP0 + GAP * it.slot); it.el.style.zIndex = it.slot; });
    if (reduce) return;
    let count = 0, active = null;
    const step = () => { count++; count % 3 === 0 ? slide(4, 1.5, 0.02) : slide(gsap.utils.random([2, 3]), 1.1, 0.025); };
    const slide = (n, dur, each) => {
      active = gsap.timeline({ onComplete: () => { recycle(n); step(); } });
      [...items].reverse().forEach((it, a) => active.to(it.el, { "--top": TOP0 + GAP * (it.slot - n), duration: dur, ease: "power3.inOut" }, a * each));
      active.to({}, { duration: 0.6 });
    };
    const recycle = (n) => {
      items.forEach((it) => (it.slot -= n));
      const gone = items.filter((it) => it.slot < 0).sort((a, b) => a.slot - b.slot);
      gone.forEach((it, k) => { it.slot = N - n + k; dress(it, dressN++); it.el.style.setProperty("--top", TOP0 + GAP * it.slot); });
      items.forEach((it) => (it.el.style.zIndex = it.slot));
    };
    new IntersectionObserver(([e]) => { if (e.isIntersecting) active ? active.resume() : step(); else active?.pause(); }, { rootMargin: "10%" }).observe(tile);
    if (fine) {
      const setters = new Map(items.map((it) => [it.el, gsap.quickTo(it.el, "y", { duration: 0.6, ease: "power3.out" })]));
      tile.addEventListener("mousemove", (e) => {
        const r = tile.getBoundingClientRect(), k = r.width / 910, y = e.clientY - r.top;
        let hit = -1;
        items.forEach((it) => { if (it.el.offsetTop <= y) hit = Math.max(hit, it.slot); });
        items.forEach((it) => setters.get(it.el)(it.slot > hit ? 70 * k : 0));
      });
      tile.addEventListener("mouseleave", () => items.forEach((it) => setters.get(it.el)(0)));
    }
  }

  // ── Feature icons: each black shape keeps looping with a different motion (spinning, breathing, pushing, filling)
  const ICONS = {
    dots: `<g>${[0, 1, 2, 3].map((i) => `<ellipse cx="${18 + i * 26}" cy="50" rx="${16 - i * 2}" ry="22"/>`).join("")}</g>`,
    star: `<path d="M50 5 58 38 92 30 64 52 84 82 50 64 16 82 36 52 8 30 42 38Z"/>`,
    arch: `<path d="M5 95 V60 A45 45 0 0 1 95 60 V95 H70 V62 A20 20 0 0 0 30 62 V95Z"/>`,
    pills: `<g><rect x="0" y="25" width="50" height="50" rx="25"/><rect x="30" y="25" width="50" height="50" rx="25"/><rect x="60" y="25" width="40" height="50" rx="20" fill="none" stroke="currentColor" stroke-width="8"/></g>`,
    bars: `<g><rect x="0" y="10" width="100" height="18" rx="9"/><rect x="0" y="41" width="70" height="18" rx="9"/><rect x="0" y="72" width="100" height="18" rx="9"/></g>`,
    toggle: `<g><rect x="0" y="20" width="100" height="60" rx="30"/><circle cx="30" cy="50" r="16" fill="var(--c)"/><circle cx="70" cy="50" r="16" fill="var(--c)"/></g>`,
    spin: `<path d="M50 50 C50 10 80 5 95 20 C70 20 60 35 50 50 C90 50 95 80 80 95 C80 70 65 60 50 50 C50 90 20 95 5 80 C30 80 40 65 50 50 C10 50 5 20 20 5 C20 30 35 40 50 50Z"/>`,
    loop: `<path d="M50 10 A40 40 0 1 1 15 70 L30 62 A23 23 0 1 0 50 27Z"/>`,
    comb: `<g>${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 11.5}" y="20" width="6" height="70"/>`).join("")}</g>`,
    wave: `<path d="M0 90 C20 40 50 30 100 20 V90Z"/>`,
    quarter: `<path d="M0 100 A100 100 0 0 1 100 0 V100Z"/>`,
    pinwheel: `<path d="M50 50 L50 0 C75 10 80 35 50 50 L100 50 C90 75 65 80 50 50 L50 100 C25 90 20 65 50 50 L0 50 C10 25 35 20 50 50Z"/>`,
    eight: `<path d="M30 25 A25 25 0 1 0 30 75 L70 75 A25 25 0 1 0 70 25Z M30 40 A10 10 0 1 1 30 60 A10 10 0 1 1 30 40Z M70 40 A10 10 0 1 1 70 60 A10 10 0 1 1 70 40Z" fill-rule="evenodd"/>`,
    burst: `<path d="M50 0 56 36 90 14 64 44 100 50 64 56 90 86 56 64 50 100 44 64 10 86 36 56 0 50 36 44 10 14 44 36Z"/>`,
    arrows: `<g><path d="M0 20 30 50 0 80 15 80 45 50 15 20Z"/><path d="M50 20 80 50 50 80 65 80 95 50 65 20Z"/></g>`,
    hbar: `<g><rect x="0" y="10" width="20" height="80"/><rect x="80" y="10" width="20" height="80"/><rect x="0" y="40" width="100" height="20"/></g>`,
    steps: `<path d="M0 95 V55 H18 V75 H38 V35 H58 V75 H78 V55 H100 V95Z"/>`,
  };
  // Phone·tablet: step groups fold into a + accordion — only one open at a time, .5s power3.inOut
  function featureAccordion() {
    const groups = $$(".features_group");
    groups.forEach((g) => g.querySelector(".features_aside").addEventListener("click", () => {
      if (innerWidth >= 1024) return;
      const open = g.classList.contains("is-open");
      groups.forEach((o) => {
        const want = o === g ? !open : false;
        if (o.classList.contains("is-open") === want) return;
        const grid = o.querySelector(".features_grid"), h = grid.scrollHeight;
        o.classList.toggle("is-open", want);
        gsap.fromTo(grid, { height: want ? 0 : h }, { height: want ? h : 0, duration: reduce ? 0 : 0.5, ease: "power3.inOut", onComplete: () => gsap.set(grid, { clearProps: "height" }) });
      });
      ScrollTrigger.refresh();
    }));
  }

  function featureIcons() {
    $$(".fico").forEach((el, i) => {
      el.innerHTML = `<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">${ICONS[el.dataset.icon] || ICONS.star}</svg>`;
      if (reduce) return;
      const g = el.querySelector("svg > *");
      const k = el.dataset.icon;
      // The original set lengths by 30fps frame counts per icon (spin 360/69s, push 18 frames, etc.)
      if (["star", "spin", "pinwheel", "burst"].includes(k)) gsap.to(g, { rotate: "+=360", svgOrigin: "50 50", duration: 360 / 69, ease: "none", repeat: -1 });
      else if (["dots", "bars", "comb"].includes(k)) gsap.to(g.children, { scaleX: 0.6, transformOrigin: "0 50%", duration: 18 / 30, ease: "power2.inOut", yoyo: true, repeat: -1, stagger: 0.08, repeatDelay: 23 / 30 });
      else if (k === "toggle") gsap.to(g.children[1], { attr: { cx: 70 }, duration: 18 / 30, ease: "power3.inOut", yoyo: true, repeat: -1, repeatDelay: 1 });
      else if (k === "loop") gsap.to(g, { rotate: "+=90", svgOrigin: "50 50", duration: 18 / 30, ease: "power3.inOut", repeat: -1, repeatDelay: 0.6 });
      else gsap.to(g, { scale: 0.86, svgOrigin: "50 100", duration: 26.9 / 30, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });
  }

  // Reviews: step one card at a time with arrows, endless loop — lay out five sets of cards and start on the middle set, and the row slides one slot at a time over 1.3s ease-out.
  //    the leaving photo grows 1.01→1.3, the new text panel clears from the left in .35s
  function quotes() {
    const track = $("[data-quotes]"), real = $$(".quote", track), num = $("[data-qi]"), n = real.length;
    for (let k = 0; k < 2; k++) {
      track.prepend(...real.map((c) => Object.assign(c.cloneNode(true), { ariaHidden: "true" })));
      track.append(...real.map((c) => Object.assign(c.cloneNode(true), { ariaHidden: "true" })));
    }
    const slots = $$(".quote", track);
    let p = 2 * n;
    const paint = () => {
      track.style.setProperty("--qi", p);
      slots.forEach((c, k) => c.classList.toggle("is-active", k === p));
      num.textContent = String((p % n) + 1).padStart(2, "0");
    };
    const recenter = () => {
      track.classList.add("is-jump");
      p = 2 * n + (p % n);
      paint();
      track.offsetWidth;
      track.classList.remove("is-jump");
    };
    const go = (dir) => {
      if (p + dir < n || p + dir >= 4 * n) recenter();
      const prev = slots[p];
      p += dir;
      paint();
      if (reduce) return;
      gsap.fromTo(prev.querySelector(".quote_photo"), { scale: 1.01 }, { scale: 1.3, duration: 1.18, ease: "power2.out", onComplete() { gsap.set(this.targets(), { clearProps: "transform" }); } });
      // The new photo turns on .14s after the transition starts (it snaps in, no fade)
      const ph = slots[p].querySelector(".quote_photo");
      gsap.set(ph, { opacity: 0 });
      gsap.set(ph, { opacity: 1, delay: 0.14 });
      const bq = slots[p].querySelector("blockquote");
      const u = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--u")) || innerWidth / 1920;
      gsap.fromTo(bq, { clipPath: `inset(0px 0px 0px ${Math.min(bq.offsetWidth, u * 577)}px)` }, { clipPath: "inset(0px 0px 0px 0px)", duration: 0.35, ease: "sine.out", clearProps: "clipPath" });
    };
    $$(".quotes_btn").forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.dir))));
    track.classList.add("is-jump");
    paint();
    track.offsetWidth;
    track.classList.remove("is-jump");
  }

  // ── Pricing paper (WebGL): pressing the toggle rolls the current-color paper up like wrapping around a cylinder from the top-left corner, turning over in 1.25s and revealing the new color below
  function paperGL() {
    const sec = $(".pricing"), canvas = $("[data-gl-paper]"), sheet = $("[data-sheet]");
    let flip = () => {}, peek = () => {};
    if (canvas && window.OGL) {
      const { Renderer, Program, Mesh, Plane, Camera, Transform } = OGL;
      const renderer = new Renderer({ canvas, dpr: Math.min(devicePixelRatio, 2), alpha: true, premultipliedAlpha: true });
      const gl = renderer.gl;
      const camera = new Camera(gl, { fov: 35 });
      const scene = new Transform();
      const program = new Program(gl, {
        transparent: true, cullFace: false,
        vertex: `attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix;
          uniform float uProg; uniform float uR; uniform vec2 uSize; varying vec2 vUv; varying float vShade; varying float vBack;
          const float PI = 3.14159265;
          void main(){
            vUv = uv;
            vec2 p = uv * uSize;
            vec2 d = normalize(vec2(1., 1.));
            float diag = dot(uSize, d);
            float L = uProg * (diag + PI * uR * 1.2);
            float s = dot(p, d);
            vec3 pos = vec3(p, 0.);
            vBack = 0.; vShade = 1.;
            if (s < L) {
              float arc = L - s;
              float th = arc / uR;
              float ns; float z;
              if (th < PI) { ns = L - uR * sin(th); z = uR * (1. - cos(th)); vShade = .7 + .3 * cos(th * .5); vBack = step(PI * .5, th); }
              else { ns = L + (arc - PI * uR); z = 2. * uR; vBack = 1.; vShade = .92; }
              pos.xy += d * (ns - s);
              pos.z = z;
            }
            vec3 w = vec3(pos.x - uSize.x * .5, pos.y - uSize.y * .5, pos.z);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(w, 1.);
          }`,
        fragment: `precision highp float; uniform vec3 uFront; uniform vec3 uBackC; uniform float uAlpha; uniform vec2 uSize; uniform float uRad;
          varying vec2 vUv; varying float vShade; varying float vBack;
          void main(){
            vec2 p = vUv * uSize; vec2 q = min(p, uSize - p);
            if (q.x < uRad && q.y < uRad && distance(q, vec2(uRad)) > uRad) discard;
            vec3 c = mix(uFront, uBackC, vBack) * vShade;
            gl_FragColor = vec4(c * uAlpha, uAlpha);
          }`,
        uniforms: { uProg: { value: 0 }, uR: { value: 60 }, uSize: { value: [400, 400] }, uFront: { value: [1, 1, 1] }, uBackC: { value: [1, 1, 1] }, uAlpha: { value: 1 }, uRad: { value: 15 } },
      });
      const mesh = new Mesh(gl, { geometry: new Plane(gl, { width: 1, height: 1, widthSegments: 64, heightSegments: 64 }), program });
      mesh.setParent(scene);
      const size = () => {
        const r = canvas.getBoundingClientRect(), s = sheet.getBoundingClientRect();
        renderer.setSize(r.width, r.height);
        camera.perspective({ aspect: r.width / r.height });
        camera.position.z = r.height / 2 / Math.tan((35 * Math.PI) / 360);
        program.uniforms.uSize.value = [s.width, s.height];
        program.uniforms.uR.value = s.width * 0.16;
        program.uniforms.uRad.value = parseFloat(getComputedStyle(sheet).borderTopLeftRadius) || 15;
        mesh.geometry = new Plane(gl, { width: s.width, height: s.height, widthSegments: 64, heightSegments: 64 });
      };
      // The paper position is re-placed by the shader in uv (bottom left 0,0), not in Plane coordinates — it curls from the bottom left corner
      size();
      new ResizeObserver(size).observe(sheet);
      canvas.style.visibility = "hidden";
      renderer.render({ scene, camera });
      let tw = null, flipping = false;
      const st = { p: 0 };
      const render = () => { program.uniforms.uProg.value = st.p; renderer.render({ scene, camera }); };
      const dress = (fromVar) => {
        const c = site.rgb(fromVar);
        program.uniforms.uFront.value = c;
        program.uniforms.uBackC.value = c.map((v) => v * 0.85 + 0.15);
        program.uniforms.uAlpha.value = 1;
        canvas.style.visibility = "visible";
      };
      // Hovering the toggle lifts only the corner slightly over .52s, hinting at the next color
      peek = (on, curVar, nextVar) => {
        if (reduce || flipping) return;
        tw?.kill();
        if (on) { dress(curVar); sheet.style.setProperty("--sheet", `var(${nextVar})`); }
        tw = gsap.to(st, { p: on ? 0.1 : 0, duration: 0.52, ease: "power2.out", onUpdate: render, onComplete: () => { if (!on) { canvas.style.visibility = "hidden"; sheet.style.removeProperty("--sheet"); } } });
      };
      flip = (fromVar) => {
        dress(fromVar);
        sheet.style.removeProperty("--sheet");
        tw?.kill();
        flipping = true;
        tw = gsap.timeline({ onComplete: () => { canvas.style.visibility = "hidden"; st.p = 0; flipping = false; } })
          .to(st, { p: 1, duration: reduce ? 0 : 1.25, ease: "power2.inOut", onUpdate: render })
          .to(program.uniforms.uAlpha, { value: 0, duration: 0.2, onUpdate: render }, ">-0.2");
      };
    }
    let plan = "monthly";
    const set = (next) => {
      if (next === plan) return;
      const was = plan === "yearly" ? "--site-sky" : "--site-lime";
      plan = next;
      const yearly = plan === "yearly";
      sec.classList.toggle("is-yearly", yearly);
      $(".pricing_switch").setAttribute("aria-checked", String(yearly));
      $$(".pricing_opt").forEach((o) => o.classList.toggle("is-active", o.dataset.plan === plan));
      $$(".pricing_plan").forEach((p) => p.classList.toggle("is-active", p.dataset.planPrice === plan));
      flip(was);
    };
    $(".pricing_switch").addEventListener("click", () => set(plan === "yearly" ? "monthly" : "yearly"));
    $$(".pricing_opt").forEach((o) => o.addEventListener("click", () => set(o.dataset.plan)));
    const tg = $(".pricing_toggle");
    const vars = () => (plan === "yearly" ? ["--site-sky", "--site-lime"] : ["--site-lime", "--site-sky"]);
    if (fine) {
      tg.addEventListener("mouseenter", () => peek(true, ...vars()));
      tg.addEventListener("mouseleave", () => peek(false, ...vars()));
    }
  }

  // ── Roadmap wheel: while pinned the wheel turns 0 → -45°×3, and on release it snaps to the nearest card
  function roadmap() {
    const wheel = $(".roadmap_wheel"), n = $$(".rm_card").length;
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(wheel, { "--wheel": 0 }, { "--wheel": -45 * (n - 1), ease: "none", scrollTrigger: { trigger: ".roadmap_pin", start: "top top", endTrigger: ".roadmap", end: "bottom bottom", scrub: true, snap: { snapTo: 1 / (n - 1), duration: { min: 0.3, max: 0.8 }, delay: 0.1, ease: "power2.inOut" } } });
    });
  }

  // ── Waitlist: numbers count up, color pieces stack inside the clock and the hands turn
  function waitlist() {
    const num = $("[data-counter]"), clock = $("[data-clock]");
    const target = +num.dataset.counter;
    const o = { v: 0 };
    gsap.to(o, { v: target, duration: reduce ? 0 : 1.6, ease: "power3.out", onUpdate: () => (num.textContent = String(Math.round(o.v)).padStart(2, "0")), scrollTrigger: { trigger: num, start: "top 85%" } });
    const ticks = clock.querySelector(".clock_ticks");
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2, r1 = i % 5 ? 186 : 176;
      ticks.insertAdjacentHTML("beforeend", `<line x1="${200 + Math.sin(a) * r1}" y1="${200 - Math.cos(a) * r1}" x2="${200 + Math.sin(a) * 194}" y2="${200 - Math.cos(a) * 194}"/>`);
    }
    if (!reduce) {
      gsap.to(".clock_hand--m", { rotate: 360, svgOrigin: "200 200", duration: 12, ease: "none", repeat: -1 });
      gsap.to(".clock_hand--h", { rotate: 360, svgOrigin: "200 200", duration: 144, ease: "none", repeat: -1 });
    }
    // Piece: colored paper stacking up from the bottom — one per person
    const cv = clock.querySelector(".clock_bits"), cx = cv.getContext("2d");
    const cols = ["--site-lime", "--site-coral", "--site-apricot", "--site-sage", "--site-sky", "--site-steel"];
    const bits = [];
    const fit = () => { const r = cv.getBoundingClientRect(); cv.width = r.width * devicePixelRatio; cv.height = r.height * devicePixelRatio; };
    fit(); addEventListener("resize", fit);
    let started = false;
    ScrollTrigger.create({ trigger: clock, start: "top 90%", once: true, onEnter: () => (started = true) });
    const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    gsap.ticker.add(() => {
      if (!started && !reduce) return;
      const W = cv.width, H = cv.height, R = W / 2;
      if (bits.length < target && (reduce || Math.random() < 0.5)) {
        bits.push({ x: R + (Math.random() - 0.5) * R * 0.8, y: reduce ? H : R * 0.3, vy: 0, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.2, c: css(cols[bits.length % cols.length]), s: R * (0.05 + Math.random() * 0.03), rest: false });
      }
      cx.clearRect(0, 0, W, H);
      const floor = (x) => R + Math.sqrt(Math.max(0, R * R * 0.9 - (x - R) ** 2));
      bits.forEach((b, i) => {
        if (!b.rest) {
          b.vy += 0.4 * devicePixelRatio; b.y += b.vy; b.a += b.va;
          const stackH = bits.slice(0, i).filter((o) => o.rest && Math.abs(o.x - b.x) < b.s * 1.2).length * b.s * 0.55;
          const fl = floor(b.x) - stackH;
          if (b.y >= fl || reduce) { b.y = Math.min(b.y, fl); b.rest = true; }
        }
        cx.save(); cx.translate(b.x, b.y); cx.rotate(b.a); cx.fillStyle = b.c; cx.fillRect(-b.s / 2, -b.s / 3, b.s, b.s * 0.66); cx.restore();
      });
    });
  }

  // ── FAQ: only one open at a time, .5s power3.inOut
  function faq() {
    const items = $$(".faq_item");
    items.forEach((it) => it.querySelector(".faq_q").addEventListener("click", () => {
      const open = it.classList.contains("is-open");
      items.forEach((o) => {
        const want = o === it ? !open : false;
        if (o.classList.contains("is-open") === want) return;
        const body = o.querySelector(".faq_body");
        const h = body.scrollHeight;
        o.classList.toggle("is-open", want);
        gsap.fromTo(body, { height: want ? 0 : h }, { height: want ? h : 0, duration: reduce ? 0 : 0.5, ease: "power3.inOut", onComplete: () => gsap.set(body, { clearProps: "height" }) });
      });
    }));
  }

  // ── Closing: words settle from a wave (-2 · -4 · -2em) into a single line
  function outro() {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(".outro_line", { "--wave": 1 }, { "--wave": 0, ease: "none", scrollTrigger: { trigger: ".outro_line", start: "top bottom", endTrigger: ".outro_line", end: "top top", scrub: true } });
    });
  }

  site.ready.then(() => {
    gridGL();
    buildPuzzle();
    if (fine && !reduce) spotlight();
    intro();
    distraction();
    revealGL();
    stack();
    highlights();
    folders();
    featureIcons();
    featureAccordion();
    quotes();
    paperGL();
    roadmap();
    waitlist();
    faq();
    outro();
    ScrollTrigger.refresh();
  });
  site.loaded.then(() => {
    heroStarted = true;
    if (!reduce) puzzle?.play();
    ScrollTrigger.refresh();
  });
})();
