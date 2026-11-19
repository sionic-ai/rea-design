// Winter edition — pinned three stage (a set of art panels per section), Renaissance-style construction lines, frame → left table of contents, torn paper curtain.
// The original runs a Theatre.js sequence in units of section progress × (section height + screen) / screen, and the position follows .5 of the remaining distance each frame. Values were read from the original state file.
(() => {
  const html = document.documentElement;
  const { reduce, color } = window.ED;
  const T = window.THREE;
  const vh = () => innerHeight;

  // ───────── Frame → left table of contents ─────────
  const side = document.querySelector(".w-side");
  document.querySelectorAll(".w-toc").forEach((ol) => ol.querySelectorAll("li").forEach((li, n) => li.style.setProperty("--n", n)));
  let sideTimer = 0;
  const setScrolled = () => {
    const on = scrollY > 10;
    if (on === html.classList.contains("is-scrolled")) return;
    html.classList.toggle("is-scrolled", on);
    html.classList.toggle("is-sidebar", on);
    clearTimeout(sideTimer);
    side.classList.remove("is-done");
    if (on) sideTimer = setTimeout(() => side.classList.add("is-done"), 2000);
  };
  addEventListener("scroll", setScrolled, { passive: true });
  setScrolled();
  document.querySelectorAll(".w-toc a, .w-side__title").forEach((a) => a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    window.ED.scrollTo(t === document.querySelector("#hero") ? 0 : t.offsetTop + vh() * .2);
  }));

  // Opening — the original burns open the black stage as soon as stage assets load and starts the camera intro (5s easeOutCubic) at the same time.
  // The opening time is 1.25~2s per panel depending on data load time, so we set it to the middle (1.5s). In About and Contents, the title rises and appears 1.1s after opening
  const OPEN_AT = 1500, OPEN_DUR = 1100, CAM_DUR = 5000;
  const intro = { at: performance.now() + OPEN_AT, skip: reduce || (location.hash && location.hash !== "#hero") || scrollY > 100 };
  // is-intro is on html from the first paint — so the end layout (intro · contents) doesn’t flash before JS runs
  if (intro.skip) html.classList.remove("is-intro");
  else {
    setTimeout(() => html.classList.add("is-intro-word"), 950);
    setTimeout(() => html.classList.remove("is-intro", "is-intro-word"), OPEN_AT + 1100);
  }

  // Construction-line frame, the border is drawn like a loader and closes once fully loaded
  // Original draws the frame border over 1s after the stage assets have fully loaded (about 1s) — the screen is almost unchanged on open
  setTimeout(() => html.classList.add("is-loaded-lines"), 1050);
  const lines = document.querySelector(".w-lines svg");
  const setLines = (k) => {
    if (lines.dataset.active === String(k)) return;
    lines.dataset.active = k;
    lines.querySelectorAll("[data-group]").forEach((el) => el.toggleAttribute("data-on", el.dataset.group.split(" ").includes(String(k))));
  };

  // ───────── Section list ─────────
  const scenes = [...document.querySelectorAll("[data-scene]")];
  const flow = [...document.querySelectorAll(".w-main > section")];
  const papers = [...document.querySelectorAll(".w-paper")];
  const tocItems = [...side.querySelectorAll(".w-toc li")];
  const rects = () => flow.map((el) => ({ el, r: el.getBoundingClientRect() }));

  // ───────── three stage ─────────
  const canvas = document.querySelector(".w-stage__gl");
  let renderer = null;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false }); } catch (e) { renderer = null; }
  if (!renderer) {
    html.classList.add("no-gl");
    const loop = () => {
      const rs = rects();
      let best = 0, area = 0;
      rs.forEach(({ el, r }) => { if (!el.dataset.scene) return; const a = Math.max(0, Math.min(vh(), r.bottom) - Math.max(0, r.top)); if (a > area) { area = a; best = +el.dataset.scene; } });
      setLines(best);
    };
    addEventListener("scroll", loop, { passive: true });
    loop();
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;

  const C = {};
  const readColors = () => {
    for (const k of ["stage", "sky", "sky-low", "cloud", "leaf", "leaf-2", "robe", "robe-2", "skin", "hair", "stone", "gold", "night", "violet", "wine", "paper-dark"]) C[k] = color(`--site-${k}`);
    C.bg = color("--kf-bg"); C.surface = color("--kf-surface"); C.ink = color("--kf-ink"); C.accent = color("--kf-accent"); C.light = color("--kf-contrast-ink"); C.dark = color("--kf-contrast-bg");
  };
  readColors();
  const col = (c) => new T.Color().setRGB(c[0], c[1], c[2], T.SRGBColorSpace);
  const css = (c, a = 1) => `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`;
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

  // Grainy brushstroke — the same seed gives the same picture
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const tex = (w, h, paint) => {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const g = c.getContext("2d");
    paint(g, w, h);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  };
  const blob = (g, x, y, rx, ry, col, a = 1, soft = .6) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
    gr.addColorStop(0, css(col, a)); gr.addColorStop(1 - soft * .5, css(col, a * .85)); gr.addColorStop(1, css(col, 0));
    g.save(); g.translate(x, y); g.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry)); g.translate(-x, -y);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, Math.max(rx, ry), 0, Math.PI * 2); g.fill(); g.restore();
  };
  const grain = (g, w, h, a = .06) => {
    for (let i = 0; i < w * h / 60; i++) { g.fillStyle = rnd() > .5 ? css(C.light, a) : css(C.dark, a); g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
  };
  const sky = (top, low) => tex(1024, 640, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, css(top)); gr.addColorStop(1, css(low)); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) blob(g, rnd() * w, h * (.25 + rnd() * .55), 60 + rnd() * 140, 30 + rnd() * 60, C.cloud, .55 + rnd() * .35);
    // Distant umbrella-pine band — on open the camera (z −18.57) starts in front of this band so the treetops and sky show first like the original. On the final screen it shows through the foreground forest.
    for (let i = 0; i < 26; i++) {
      const x = rnd() * w, y = h * (.56 + rnd() * .2), tw = 40 + rnd() * 70, c = mix(C.leaf, C["leaf-2"], rnd() * .5);
      g.strokeStyle = css(mix(c, C.hair, .5)); g.lineWidth = 2; g.beginPath(); g.moveTo(x, h); g.lineTo(x + (rnd() - .5) * 12, y); g.stroke();
      for (let k = 0; k < 7; k++) blob(g, x + (rnd() - .5) * tw, y - rnd() * tw * .18, tw * .42, tw * .16, mix(c, C.stage, rnd() * .25), .92, .5);
    }
    g.fillStyle = css(mix(C.leaf, C.stage, .35)); g.fillRect(0, h * .8, w, h * .2);
    grain(g, w, h);
  });
  const trees = (col, n, hgt) => tex(1024, 512, (g, w, h) => {
    for (let i = 0; i < n; i++) {
      const x = rnd() * w, th = h * (hgt + rnd() * .35), c = mix(col, C.stage, rnd() * .35);
      if (rnd() < .45) {
        // Cypress — narrow, tall flame shape
        const tw = 18 + rnd() * 22;
        for (let k = 0; k < 14; k++) blob(g, x + (rnd() - .5) * tw * .6, h - th * (k / 14), tw * (1 - k / 18) * .7, th / 10, mix(c, C["leaf-2"], rnd() * .25), .9, .5);
      } else {
        // Umbrella pine — broad mass on a thin trunk
        const tw = 60 + rnd() * 90;
        g.strokeStyle = css(mix(c, C.hair, .5)); g.lineWidth = 4; g.beginPath(); g.moveTo(x, h); g.quadraticCurveTo(x + (rnd() - .5) * 40, h - th * .5, x, h - th * .8); g.stroke();
        for (let k = 0; k < 9; k++) blob(g, x + (rnd() - .5) * tw, h - th * (.8 + rnd() * .2), tw * .45, tw * .18, mix(c, C["leaf-2"], rnd() * .3), .9, .5);
      }
    }
    grain(g, w, h, .05);
  });
  // Figure slot — silhouette of a figure in the oil painting (cloth mass, head, arms). A painted plate of the same position and size stands in for the photo
  const figure = (robe, cloth2, flip = false) => tex(512, 640, (g, w, h) => {
    g.save(); if (flip) { g.translate(w, 0); g.scale(-1, 1); }
    // Diagonal flying body — overlap robe ellipses diagonally and lay wrinkle strokes on top
    const fold = (x, y, rx, ry, rot, col, a = 1) => { g.save(); g.translate(x, y); g.rotate(rot); blob(g, 0, 0, rx, ry, col, a, .35); g.restore(); };
    fold(w * .5, h * .55, w * .2, h * .22, -.5, mix(robe, C.stage, .08));
    fold(w * .62, h * .72, w * .24, h * .1, .35, robe);
    fold(w * .3, h * .78, w * .2, h * .09, -.25, robe);
    fold(w * .74, h * .86, w * .12, h * .05, .2, mix(robe, C.surface, .4));
    fold(w * .42, h * .44, w * .16, h * .07, -.9, cloth2, .9);
    g.strokeStyle = css(mix(robe, C.stage, .35), .45); g.lineWidth = 3;
    for (let k = 0; k < 9; k++) { g.beginPath(); const x = w * (.3 + rnd() * .45), y = h * (.48 + rnd() * .35); g.moveTo(x, y); g.quadraticCurveTo(x + 30, y + 10 + rnd() * 20, x + 50 + rnd() * 30, y + rnd() * 30); g.stroke(); }
    g.strokeStyle = css(C.skin); g.lineWidth = 13; g.lineCap = "round";
    g.beginPath(); g.moveTo(w * .56, h * .4); g.quadraticCurveTo(w * .76, h * .34, w * .96, h * .33); g.stroke();
    blob(g, w * .52, h * .27, w * .07, h * .062, C.skin, 1, .1);
    blob(g, w * .49, h * .22, w * .11, h * .065, C.hair, 1, .4);
    blob(g, w * .2, h * .52, w * .045, h * .065, C.accent, .95, .1);
    g.restore();
  });
  const board = () => tex(512, 160, (g, w, h) => {
    g.fillStyle = css(C.robe); g.beginPath(); g.roundRect(20, 40, w - 40, 70, 35); g.fill();
    g.strokeStyle = css(C.accent); g.lineWidth = 7;
    for (let i = 0; i < 9; i++) { g.beginPath(); const x = 60 + i * 45; g.moveTo(x, 60); g.bezierCurveTo(x + 20, 40 + rnd() * 30, x + 10, 100, x + 30, 92); g.stroke(); }
    [110, w - 110].forEach((x) => { blob(g, x - 22, 130, 18, 18, C.accent, 1, .1); blob(g, x + 22, 130, 18, 18, C.accent, 1, .1); });
  });
  const stars = () => tex(1024, 640, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, css(C.night)); gr.addColorStop(1, css(mix(C.night, C.violet, .25))); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = css(C.light, rnd() * .9); const s = rnd() < .04 ? 2.4 : 1.1; g.fillRect(rnd() * w, rnd() * h, s, s); }
  });
  const bust = (robe, accent) => tex(512, 640, (g, w, h) => {
    blob(g, w * .5, h * .9, w * .48, h * .3, robe, 1, .2);
    blob(g, w * .5, h * .72, w * .3, h * .16, mix(robe, accent, .35), 1, .3);
    blob(g, w * .5, h * .44, w * .14, h * .15, C.skin, 1, .15);
    blob(g, w * .5, h * .33, w * .18, h * .1, C.hair, 1, .3);
    g.fillStyle = css(accent); g.beginPath(); g.ellipse(w * .5, h * .42, w * .13, h * .035, 0, 0, Math.PI * 2); g.fill();
  });
  const room = (wall, shelf) => tex(1024, 640, (g, w, h) => {
    g.fillStyle = css(wall); g.fillRect(0, 0, w, h);
    for (let y = 40; y < h; y += 90) for (let x = 0; x < w; x += 8 + rnd() * 10) { g.fillStyle = css(mix(shelf, C.gold, rnd() * .4), .8); g.fillRect(x, y, 6 + rnd() * 6, 60 + rnd() * 20); }
    blob(g, w * .75, h * .3, w * .2, h * .3, C.gold, .25, .9);
    grain(g, w, h);
  });
  const curtain = () => tex(1024, 640, (g, w, h) => {
    g.fillStyle = css(C.wine); g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 40) { const gr = g.createLinearGradient(x, 0, x + 40, 0); gr.addColorStop(0, css(C.wine)); gr.addColorStop(.5, css(mix(C.wine, C.accent, .45))); gr.addColorStop(1, css(C.wine)); g.fillStyle = gr; g.fillRect(x, 0, 40, h); }
    blob(g, w * .3, h * .8, w * .35, h * .25, C.stage, .7, .8);
  });
  const arches = () => tex(1024, 640, (g, w, h) => {
    g.fillStyle = css(mix(C.stone, C.gold, .25)); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) {
      const x = 80 + i * 240;
      const gr = g.createLinearGradient(0, 150, 0, 520); gr.addColorStop(0, css(C["sky-low"])); gr.addColorStop(1, css(mix(C["leaf-2"], C["sky-low"], .4)));
      g.fillStyle = gr; g.beginPath(); g.moveTo(x, 520); g.lineTo(x, 260); g.arc(x + 80, 260, 80, Math.PI, 0); g.lineTo(x + 160, 520); g.fill();
      g.fillStyle = css(mix(C.stone, C.light, .2)); g.fillRect(x - 24, 120, 18, 420);
    }
    g.fillStyle = css(mix(C.stone, C.stage, .4)); g.fillRect(0, 520, w, h - 520);
    grain(g, w, h);
  });
  const landscape = () => tex(1024, 640, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h * .6); gr.addColorStop(0, css(C.sky)); gr.addColorStop(1, css(C["sky-low"])); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) blob(g, rnd() * w, h * (.15 + rnd() * .2), 80 + rnd() * 120, 20 + rnd() * 30, C.cloud, .6);
    g.fillStyle = css(mix(C["sky-low"], C.leaf, .45));
    g.beginPath(); g.moveTo(0, h * .55); for (let x = 0; x <= w; x += 32) g.lineTo(x, h * (.42 + Math.sin(x * .012) * .05 + rnd() * .02)); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = css(C["leaf-2"]); g.beginPath(); g.moveTo(0, h * .7); for (let x = 0; x <= w; x += 24) g.lineTo(x, h * (.64 + Math.sin(x * .02 + 1) * .03)); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    grain(g, w, h);
  });
  const billboard = () => tex(512, 280, (g, w, h) => {
    g.fillStyle = css(C.surface); g.fillRect(0, 0, w, h - 40);
    g.fillStyle = css(C["sky-low"]); g.fillRect(10, 10, w - 20, h - 60);
    g.fillStyle = css(C.gold); g.font = `italic 900 54px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-serif")}`; g.fillText("Aa", 40, 110);
    g.fillStyle = css(C.stone); g.fillRect(w / 2 - 6, h - 40, 12, 40);
  });
  const crowd = () => tex(1024, 640, (g, w, h) => {
    g.fillStyle = css(mix(C.stage, C.wine, .2)); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { const x = 110 + i * 160, y = 260 + (i % 2) * 30; blob(g, x, y + 220, 110, 160, mix(C.stage, [C.robe, C["robe-2"], C.leaf][i % 3], .5), 1, .2); blob(g, x, y, 46, 54, C.skin, 1, .1); blob(g, x, y - 40, 60, 26, C.hair, 1, .3); }
    grain(g, w, h);
  });
  const sketch = () => tex(1024, 640, (g, w, h) => {
    g.fillStyle = css(C.bg); g.fillRect(0, 0, w, h);
    g.strokeStyle = css(C.ink, .35); g.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) { g.beginPath(); const x = w * .25 + rnd() * w * .5, y = h * .2 + rnd() * h * .5; g.moveTo(x, y); g.bezierCurveTo(x + rnd() * 120 - 60, y + rnd() * 120 - 60, x + rnd() * 160 - 80, y + rnd() * 80, x + rnd() * 200 - 100, y + rnd() * 100 - 50); g.stroke(); }
    g.beginPath(); g.arc(w * .68, h * .44, 120, 0, Math.PI * 2); g.stroke();
    grain(g, w, h, .03);
  });

  // Scene set: board (picture), z position and size. The original moves glb·ktx2 image layers per section with Theatre.
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(25, innerWidth / innerHeight, .05, 200);
  const plane = (texture, w, h, x, y, z, opts = {}) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 1, ...opts }));
    m.position.set(x, y, z);
    return m;
  };
  const sets = [];
  const mk = (build) => { const g = new T.Group(); build(g); g.visible = false; scene.add(g); sets.push(g); return g; };

  // 0 Hero — sky, clouds, forest layers, two figures, board (original camera z −18.57 → 6.45 pulls out)
  mk((g) => {
    g.add(plane(sky(C.sky, C["sky-low"]), 34, 21, 0, 2, -26));
    // The distant forest sits beyond the camera start point (z −18.57) — so the treetops and sky show when it opens. Scaled by the distance ratio (30.45/24.45) so it looks the same size at the end position (z 6.45)
    g.add(plane(trees(C.leaf, 16, .45), 37.4, 13.7, 0, -3.74, -24));
    g.add(plane(trees(mix(C.leaf, C.stage, .2), 10, .6), 20, 8, 0, -2.6, -10));
    g.add(plane(figure(C.robe, C["robe-2"]), 2.3, 2.9, -1.05, .2, -.6));
    g.add(plane(figure(C.robe, C["robe-2"], true), 2.4, 3, 1.1, -.15, .2));
    g.add(plane(board(), 1.3, .42, -.55, -1.25, 1.2));
    const dark = plane(null, 60, 40, 0, 0, -30, { color: col(C.stage), map: null });
    dark.renderOrder = -1; g.add(dark);
  });
  // 1 Assistant — starry night + half-length figure in a mask
  mk((g) => { g.add(plane(stars(), 34, 21, 0, 0, -20)); g.add(plane(bust(C.violet, C.violet), 2.6, 3.2, .9, -.1, -1)); });
  // 2 Delegate — study + portrait
  mk((g) => { g.add(plane(room(mix(C.stage, C.wine, .3), C.wine), 30, 19, 0, 0, -18)); g.add(plane(bust(mix(C.wine, C.stage, .3), C.gold), 2.6, 3.2, -1.2, -.2, -1.5)); });
  // 3 Online — red drapes + figure in front of an easel
  mk((g) => { g.add(plane(curtain(), 30, 19, 0, 0, -18)); g.add(plane(figure(C.robe, C.wine), 2.6, 3.2, .2, -.4, -1.2)); });
  // 4 Store — corridor + 3D device
  mk((g) => {
    g.add(plane(arches(), 32, 20, 0, 0, -18));
    const hub = new T.Mesh(new T.BoxGeometry(1.1, .42, 1.1, 1, 1, 1), new T.MeshStandardMaterial({ color: col(mix(C.stone, C.stage, .45)), roughness: .45, metalness: .35 }));
    const ports = new T.Mesh(new T.BoxGeometry(.8, .08, .02), new T.MeshStandardMaterial({ color: col(C.stage), roughness: .8 }));
    ports.position.set(0, -.04, .56); hub.add(ports);
    hub.scale.setScalar(.62); hub.position.set(.8, -.3, 0); hub.name = "hub"; g.add(hub);
    g.add(new T.AmbientLight(0xffffff, .6));
    const l1 = new T.PointLight(col(C.accent), 6, 8); l1.position.set(-.5, 0, .5); g.add(l1);
    const l2 = new T.PointLight(col(C.sky), 6, 8); l2.position.set(.5, 0, .5); g.add(l2);
    const key = new T.DirectionalLight(0xffffff, 1.2); key.position.set(1, 2, 3); g.add(key);
  });
  // 5 Marketing — landscape + billboard
  mk((g) => { g.add(plane(landscape(), 34, 21, 0, 0, -20)); g.add(plane(billboard(), 2.2, 1.2, 1.4, .7, -2.5)); });
  // 6 Operations — group portrait + glowing orb
  mk((g) => {
    g.add(plane(crowd(), 30, 19, 0, 0, -16));
    const globe = new T.Mesh(new T.SphereGeometry(.42, 48, 32), new T.MeshStandardMaterial({ color: col(C.gold), emissive: col(C.gold), emissiveIntensity: .35, roughness: .3 }));
    globe.position.set(.9, -.5, 0); globe.name = "globe"; g.add(globe);
    g.add(new T.AmbientLight(0xffffff, .7));
  });
  // 7 Developer — pencil sketch on paper
  mk((g) => { g.add(plane(sketch(), 30, 19, 0, 0, -16)); g.add(plane(bust(C.stone, C.stone), 2.6, 3.2, .9, -.3, -1)); });

  // 500 gold dust particles — original particles (count 500 · size .25 · opacity .59 · speed .5 · twinkle 2.2/s)
  const dust = (() => {
    const n = 500, pos = new Float32Array(n * 3), ph = new Float32Array(n);
    for (let i = 0; i < n; i++) { pos[i * 3] = (rnd() - .5) * 15; pos[i * 3 + 1] = (rnd() - .5) * 15; pos[i * 3 + 2] = -rnd() * 15 + 2; ph[i] = rnd() * 6.28; }
    const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("phase", new T.BufferAttribute(ph, 1));
    const mat = new T.ShaderMaterial({
      transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uColor: { value: new T.Color(...C.gold) }, uOpacity: { value: .59 }, uPx: { value: renderer.getPixelRatio() } },
      vertexShader: `attribute float phase; uniform float uTime; uniform float uPx; varying float vA;
        void main(){ vec3 p = position; p.y += mod(uTime * .5 * .2 + phase, 15.) - 7.5 - position.y * 0.; p.x += sin(uTime * .5 + phase) * .3;
          vA = .19 + .81 * (.5 + .5 * sin(uTime * 2.2 + phase * 3.));
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = .25 * 60. * uPx / -mv.z; }`,
      fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying float vA;
        void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(uColor, uOpacity * vA * smoothstep(.5, 0., d)); }`,
    });
    const p = new T.Points(geo, mat); p.frustumCulled = false; scene.add(p); return p;
  })();

  // ───────── Torn paper curtain — covers the content panel spot in beige and tears the top and bottom edges ─────────
  const veilScene = new T.Scene();
  const veilCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const MAXP = 8;
  const veil = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
    transparent: true, depthTest: false,
    uniforms: { uRes: { value: new T.Vector2() }, uBands: { value: Array.from({ length: MAXP }, () => new T.Vector2(-9999, -9999)) }, uPaper: { value: new T.Color(...C.bg) }, uRim: { value: new T.Color(...C.surface) }, uDark: { value: new T.Color(...C.stage) }, uTime: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
    fragmentShader: `precision highp float; varying vec2 vUv; uniform vec2 uRes; uniform vec2 uBands[${MAXP}]; uniform vec3 uPaper; uniform vec3 uRim; uniform vec3 uDark; uniform float uTime;
      float h(float n){ return fract(sin(n) * 43758.5453); }
      float n1(float x){ float i = floor(x), f = fract(x); return mix(h(i), h(i + 1.), f * f * (3. - 2. * f)); }
      float fbm(float x){ float a = .5, s = 0.; for (int i = 0; i < 5; i++){ s += a * n1(x); x *= 2.13; a *= .5; } return s; }
      float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        vec2 px = vec2(vUv.x * uRes.x, (1. - vUv.y) * uRes.y);
        float cover = 0., rim = 0., shade = 0.;
        for (int i = 0; i < ${MAXP}; i++){
          vec2 b = uBands[i];
          float e1 = b.x + (fbm(px.x * .012 + float(i) * 7.) - .5) * 70. + (h2(floor(px / 3.)) - .5) * 5.;
          float e2 = b.y + (fbm(px.x * .011 + float(i) * 3. + 40.) - .5) * 70. + (h2(floor(px / 3.) + 9.) - .5) * 5.;
          float inB = step(e1, px.y) * step(px.y, e2);
          cover = max(cover, inB);
          rim = max(rim, (smoothstep(e1 - 9., e1 - 1., px.y) - step(e1, px.y)) * step(px.y, e1) + (smoothstep(e2 + 9., e2 + 1., px.y) - step(px.y, e2)) * step(e2, px.y));
          shade = max(shade, smoothstep(e1 - 60., e1 - 10., px.y) * step(px.y, e1 - 9.) + smoothstep(e2 + 60., e2 + 10., px.y) * step(e2 + 9., px.y));
        }
        float fiber = h2(floor(px * vec2(.5, 2.))) * .06;
        vec3 paper = uPaper * (1. - fiber) + fiber * .5;
        vec3 col = mix(uDark, paper, cover);
        float a = max(cover, max(rim * .95, shade * .35));
        col = mix(col, uRim, rim * (1. - cover));
        gl_FragColor = vec4(col, a);
      }`,
  }));
  veilScene.add(veil);

  // ───────── Opening cover — from above the stage center a noisy edge spreads, burning open the black cover ─────────
  // Measured shape: at first only the scene outline burns white, then color fills in from the inside, the edge glow starts very strong (about ×40) and soon weakens (×8). While opening, the scene is pulled in 10% and then released
  const rt = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType });
  const openScene = new T.Scene();
  const openMat = new T.ShaderMaterial({
    depthTest: false,
    uniforms: { tScene: { value: rt.texture }, uOpen: { value: intro.skip ? 1 : 0 }, uTime: { value: 0 }, uAspect: { value: 1 }, uTexel: { value: new T.Vector2() }, uFrom: { value: new T.Vector2(.5, .65) }, uDark: { value: col(C.stage) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
    fragmentShader: `precision highp float; varying vec2 vUv;
      uniform sampler2D tScene; uniform float uOpen; uniform float uTime; uniform float uAspect; uniform vec2 uTexel; uniform vec2 uFrom; uniform vec3 uDark;
      float rand(vec2 q){ return fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453); }
      float smoothNoise(vec2 q){ vec2 c = floor(q), f = fract(q); vec2 w = f * f * (3. - 2. * f);
        float a = rand(c), b = rand(c + vec2(1., 0.)), d = rand(c + vec2(0., 1.)), e = rand(c + vec2(1., 1.));
        return a + (b - a) * w.x + (d - a) * w.y + (a - b - d + e) * w.x * w.y; }
      float cloud(vec2 q){ float v = 0., amp = .55; for (int k = 0; k < 5; k++){ v += amp * smoothNoise(q); q = q * 1.97 + vec2(3.7, 1.3); amp *= .5; } return v; }
      float lum(vec3 c){ return dot(c, vec3(.2126, .7152, .0722)); }
      void main(){
        float t = clamp(uOpen, 0., 1.);
        vec2 at = (vUv - uFrom) / (1. + (1. - smoothstep(0., .8, t)) * .1) + uFrom;
        vec3 pic = texture2D(tScene, at).rgb;
        float l = lum(pic);
        float slope = abs(lum(texture2D(tScene, at + vec2(uTexel.x, 0.)).rgb) - l) + abs(lum(texture2D(tScene, at + vec2(0., uTexel.y)).rgb) - l);
        vec2 sq = vec2((vUv.x - uFrom.x) * uAspect, vUv.y - uFrom.y);
        float wob = cloud(vec2(vUv.x * uAspect, vUv.y) * 2.6 + vec2(uTime * .03, -uTime * .05)) - .5;
        float grain = cloud(vUv * 22. + 9.) - .5;
        float front = mix(-.12, 1.35, t) + wob * .42 + grain * .08 - length(sq) * .82;
        float inside = smoothstep(-.004, .004, front);
        vec3 lines = vec3(slope * mix(10., 5., t));
        vec3 shown = mix(lines, pic, smoothstep(.04, .3, front) * smoothstep(.1, .55, t) + smoothstep(.75, 1., t));
        float hot = mix(40., 8., smoothstep(.05, .25, t));
        float band = 1. - smoothstep(0., hot * .0011, front);
        float flick = .6 + .4 * sin(uTime * 1.3 + vUv.x * 9. + wob * 6.);
        shown = shown * (1. + band * hot * flick) + band * flick * hot * .03;
        gl_FragColor = vec4(mix(uDark, shown, inside), 1.);
        #include <colorspace_fragment>
      }`,
  });
  openScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), openMat));

  // ───────── Theatre keyframes — the segment curve is a cubic-bezier made from the previous key’s right handle and the next key’s left handle ─────────
  const bez = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    return (x) => { let t = x; for (let i = 0; i < 6; i++) { const f = ((ax * t + bx) * t + cx) * t - x, d = (3 * ax * t + 2 * bx) * t + cx; if (Math.abs(d) < 1e-6) break; t -= f / d; } t = Math.min(1, Math.max(0, t)); return ((ay * t + by) * t + cy) * t; };
  };
  const track = (keys) => (p) => {
    if (p <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [p0, v0, h0 = [.5, 1, .5, 0]] = keys[i], [p1, v1, h1 = [.5, 1, .5, 0]] = keys[i + 1];
      if (p <= p1) return v0 + (v1 - v0) * bez(h0[2], h0[3], h1[0], h1[1])((p - p0) / (p1 - p0));
    }
    return keys[keys.length - 1][1];
  };
  // Hero camera — values from the original HeroScene state file
  const hero = {
    y: track([[0, 0, [.5, 1, .748, .021]], [1, 0, [.5, .876, .5, 0]], [1.8, .74], [2.67, -.21]]),
    z: track([[0, -18.57, [.5, 1, .748, .021]], [1, 6.45, [.5, .876, .5, 0]], [1.8, 10.34], [2.67, -2.29]]),
    rz: track([[0, .27, [.5, 1, .82, .01]], [1, 0], [1.8, -.025], [3.03, .28]]),
    ty: track([[.27, 0], [1, 0], [1.8, .54], [2.67, 0]]),
    tz: track([[.27, -21.8], [1, 1], [1.8, 1], [2.67, -7.06]]),
    fov: track([[1, 25], [2.6, 22]]),
    dust: track([[0, 0], [.4, .59], [1, .84], [1.13, .64]]),
  };
  // Remaining sections — the original scrollDrift (up .09 · back .1) plus a share that comes forward as the section enters
  const drift = { z: track([[0, 7.6], [1, 6.2], [2, 6.4]]), y: track([[0, 0], [2, .09]]) };

  // First-section intro — the original offset −1 → 0 (5s easeOutCubic) is added to the sequence position. Opened at the top (position 1), the camera pulls back from z −18.57 to 6.45 while the character layers come in from both sides

  // Mouse — the original camera shifts sideways and up by ±.05 toward the cursor while turning back by ±.05rad the opposite way (range ±.1 × gaze .5), following .1 of the remaining distance each frame
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => { if (reduce || e.pointerType !== "mouse") return; ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  const size = () => {
    renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); veil.material.uniforms.uRes.value.set(innerWidth, innerHeight);
    const pr = renderer.getPixelRatio();
    rt.setSize(innerWidth * pr, innerHeight * pr); openMat.uniforms.uTexel.value.set(1 / (innerWidth * pr), 1 / (innerHeight * pr)); openMat.uniforms.uAspect.value = innerWidth / innerHeight;
  };
  addEventListener("resize", size);
  size();

  let shown = -1, seqSmooth = null;
  const objCopy = [...document.querySelectorAll("[data-obj-copy] > div")];
  const label = document.querySelector("[data-stage-label]");
  const labels = ["Oil-painting-style sky, forest and two figures · the camera passes through layered painting panels", "Starry night sky + masked half-length portrait", "Dark study + portrait · hand holding a phone", "Red curtain + person painting", "Corridor + 3D store device (rotates as it approaches)", "Mountain · lake view + billboard", "Group portrait + glowing orb", "Pencil sketch on paper + half-length portrait wearing headphones"];
  const clock = new T.Clock();
  const frame = () => {
    const t = clock.getElapsedTime();
    const H = vh(), rs = rects();
    // The stage section with the largest visible area — if the paper panel covers the whole screen, keep it as is
    let best = shown < 0 ? 0 : shown, area = 0, bestR = null;
    rs.forEach(({ el, r }) => { if (el.dataset.scene === undefined) return; const a = Math.max(0, Math.min(H, r.bottom) - Math.max(0, r.top)); if (a > area) { area = a; best = +el.dataset.scene; bestR = r; } });
    if (best !== shown) { sets.forEach((s, i) => (s.visible = i === best)); shown = best; seqSmooth = null; label.textContent = `Image slot: ${labels[best]}`; }
    setLines(best);
    // Sequence position — section progress × (height + screen)/screen + intro share. Each frame takes .5 of the remaining distance
    const r = bestR || scenes[best].getBoundingClientRect();
    const raw = Math.max(0, (H - r.top) / H);
    seqSmooth = seqSmooth == null || reduce ? raw : seqSmooth + (raw - seqSmooth) * .5;
    const now = performance.now();
    const off = intro.skip ? 0 : -1 + (1 - (1 - Math.min(1, Math.max(0, (now - intro.at) / CAM_DUR))) ** 3);
    const s = best === 0 ? Math.max(0, seqSmooth + off) : seqSmooth;
    const op = intro.skip ? 1 : Math.min(1, Math.max(0, (now - intro.at) / OPEN_DUR));
    openMat.uniforms.uOpen.value = 1 - (1 - op) ** 2;
    openMat.uniforms.uTime.value = t;
    openMat.uniforms.uFrom.value.set(.5 + ptr.sx * .05, .65 - ptr.sy * .05);
    ptr.sx += (ptr.x - ptr.sx) * .1; ptr.sy += (ptr.y - ptr.sy) * .1;
    if (best === 0) {
      // When the camera passes through the image layer and pulls back, the panel right in front is blurred — it fades within 3 units
      sets[0].children.forEach((m) => { if (m.material.map) m.material.opacity = Math.min(1, Math.max(0, (hero.z(s) - m.position.z - .3) / 2.7)); });
      camera.position.set(0, hero.y(s), hero.z(s));
      camera.lookAt(0, hero.ty(s), hero.tz(s));
      camera.rotateZ(hero.rz(s));
      camera.fov = hero.fov(s);
      dust.material.uniforms.uOpacity.value = hero.dust(s);
    } else {
      camera.position.set(0, drift.y(s), drift.z(s));
      camera.lookAt(0, drift.y(s) * .5, -10);
      camera.fov = 25;
      dust.material.uniforms.uOpacity.value = .4;
    }
    camera.translateX(ptr.sx * .05); camera.translateY(-ptr.sy * .05);
    camera.rotateY(ptr.sx * .05); camera.rotateX(ptr.sy * .05);
    camera.updateProjectionMatrix();
    const hub = sets[4].getObjectByName("hub");
    if (best === 4 && hub) {
      const p = Math.min(1, Math.max(0, -r.top / (r.height - H)));
      hub.rotation.set(.35 + p * .4, -.8 + p * 2.6, .08 * Math.sin(t * .6));
      hub.position.set(.8 - p * .4, -.35 + Math.sin(t) * .03, p * 1.2);
      const k = Math.min(objCopy.length - 1, Math.floor(p * objCopy.length));
      objCopy.forEach((d, i) => d.classList.toggle("is-on", i === k));
    }
    const globe = sets[6].getObjectByName("globe");
    if (globe) globe.rotation.y = t * .3;
    dust.material.uniforms.uTime.value = t;
    // Paper curtain band — the screen area taken up by the paper section (top and bottom)
    const bands = veil.material.uniforms.uBands.value;
    papers.forEach((p, i) => { if (i >= MAXP) return; const pr = p.getBoundingClientRect(); bands[i].set(pr.top + H * .12, i === papers.length - 1 ? 1e6 : pr.bottom - H * .1); });
    renderer.autoClear = true;
    if (op < 1) {
      renderer.setRenderTarget(rt); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.render(openScene, veilCam);
    } else renderer.render(scene, camera);
    renderer.autoClear = false;
    renderer.render(veilScene, veilCam);
    // TOC current section
    const mid = H * .5;
    let cur = -1;
    rs.forEach(({ el, r: rr }) => { if (rr.top <= mid && rr.bottom > mid) { const id = el.id || (el.previousElementSibling && el.previousElementSibling.id) || ""; const m = /sec-(\d)/.exec(id); cur = m ? +m[1] - 1 : -1; } });
    tocItems.forEach((li, i) => li.classList.toggle("is-active", i === cur));
  };
  if (reduce) { frame(); addEventListener("scroll", frame, { passive: true }); addEventListener("resize", frame); }
  else renderer.setAnimationLoop(frame);

  // ───────── Flow panel — when visible, step cards float up at .3s intervals ─────────
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-flow]").forEach((b) => {
        gsap.to(b.querySelectorAll(".w-flow__step"), { opacity: 1, y: 0, translate: "0 0", duration: .6, ease: "power3.out", stagger: .3, scrollTrigger: { trigger: b, start: "top 75%" } });
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => { gsap.set(".w-flow__step", { opacity: 1, translate: "0 0" }); });
  }

  // Video slot — like the original, it plays automatically when visible, and the button pauses or plays
  document.querySelectorAll(".w-scene__video").forEach((f) => {
    const v = f.querySelector("video"), b = f.querySelector(".w-play");
    b.addEventListener("click", () => { setTimeout(() => f.classList.toggle("is-playing"), 45); if (v.src) (v.paused ? v.play() : v.pause()).catch?.(() => {}); });
  });
})();
