// Bottle art: the original wraps a label image around a WebGL cylinder over a cut-out bottle photo, spins it, and copies it onto a 2D canvas (HomeHero).
// Same structure here — the bottle body is SVG (photo slot), and our label art is wrapped and spun on a three r160 cylinder (same size, tilt, lighting and gap as the original).
// For non-spinning spots (lists, boxes), use one SVG drawn by jarSVG(p), including the front label.
(() => {
  const AG = window.AG;
  AG.PRODUCTS = [
    { name: "Product 01", sub: "Your one-line flavor note here", label: "#f28a1d", label2: "#f9b24a", fill: "#f39a1e", ink: "#fff4e6", fruit: 0, bg: "#f6b25c" }, // Not skin: packaging · jam color differs per product
    { name: "Product 02", sub: "Your one-line flavor note here", label: "#d690cf", label2: "#4b2064", fill: "#b8461f", ink: "#fff4f8", fruit: 2, bg: "#c89ad8" }, // Not skin: packaging · jam color differs per product
    { name: "Product 03", sub: "Your one-line flavor note here", label: "#efe1cc", label2: "#d8381f", fill: "#c7351e", ink: "#d8381f", fruit: 4, bg: "#f0a08c" }, // Not skin: packaging · jam color differs per product
    { name: "Product 04", sub: "Your one-line flavor note here", label: "#4f7a3a", label2: "#b5cf86", fill: "#6f7c2c", ink: "#fbf6df", fruit: 5, bg: "#b9d39a" }, // Not skin: packaging · jam color differs per product
    { name: "Product 05", sub: "Your one-line flavor note here", label: "#f1c2b8", label2: "#e7a091", fill: "#d8c4a2", ink: "#7a2f2f", fruit: 9, bg: "#f3c9bd" }, // Not skin: packaging · jam color differs per product
    { name: "Product 06", sub: "Your one-line flavor note here", label: "#2a3270", label2: "#5d68b8", fill: "#3a1830", ink: "#f1ecff", fruit: 7, bg: "#9fa6dc" }, // Not skin: packaging · jam color differs per product
    { name: "Product 07", sub: "Your one-line flavor note here", label: "#a3263b", label2: "#e0606a", fill: "#8e1b2a", ink: "#fff1ee", fruit: 3, bg: "#ee8f95" }, // Not skin: packaging · jam color differs per product
    { name: "Product 08", sub: "Your one-line flavor note here", label: "#9aa83a", label2: "#d7d77a", fill: "#c58a2a", ink: "#2f3a12", fruit: 6, bg: "#d9d98f" }, // Not skin: packaging · jam color differs per product
  ];

  // Label art — a band unrolled from the circumference (91% after subtracting the 9% gap). Cylinder circumference : height = π·.885·(630/1013)·.91 : .6 ≈ 2.62 so 2048×784
  const band = (p) => `
    <rect x="0" y="410" width="1020" height="470" fill="${p.label}"/>
    <circle cx="140" cy="560" r="190" fill="${p.label2}" opacity=".85"/>
    <path d="M0 780 C180 700 330 860 520 780 S860 700 1020 780 V880 H0Z" fill="${p.label2}" opacity=".6"/>
    <circle cx="800" cy="520" r="70" fill="${p.ink}" opacity=".18"/>
    <text x="315" y="640" text-anchor="middle" fill="${p.ink}" style="font-family:var(--kf-font-display);font-size:96px">${p.name}</text>
    <text x="315" y="712" text-anchor="middle" fill="${p.ink}" opacity=".85" style="font-family:var(--kf-font-sans);font-size:38px;font-weight:600">${p.sub}</text>
    <circle cx="475" cy="800" r="34" fill="none" stroke="${p.ink}" stroke-width="5" opacity=".8"/>`;
  const labelArt = (p) => {
    const c = document.createElement("canvas");
    c.width = 2048; c.height = 784;
    const g = c.getContext("2d"), sx = c.width / 1020, sy = c.height / 470, y = (v) => (v - 410) * sy;
    const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const dot = (cx, cy, r, fill, a) => { g.globalAlpha = a; g.fillStyle = fill; g.beginPath(); g.arc(cx * sx, y(cy), r * sy, 0, Math.PI * 2); g.fill(); };
    g.fillStyle = p.label; g.fillRect(0, 0, c.width, c.height);
    dot(140, 560, 190, p.label2, 0.85);
    g.globalAlpha = 0.6; g.fillStyle = p.label2;
    g.beginPath(); g.moveTo(0, y(780)); g.bezierCurveTo(180 * sx, y(700), 330 * sx, y(860), 520 * sx, y(780)); g.bezierCurveTo(710 * sx, y(700), 860 * sx, y(700), 1020 * sx, y(780)); g.lineTo(c.width, c.height); g.lineTo(0, c.height); g.fill();
    dot(800, 520, 70, p.ink, 0.18);
    g.globalAlpha = 1; g.fillStyle = p.ink; g.textAlign = "center";
    g.font = `${96 * sy}px ${css("--kf-font-display")}`;
    g.fillText(p.name, 315 * sx, y(640));
    g.globalAlpha = 0.85; g.font = `600 ${38 * sy}px ${css("--kf-font-sans")}`;
    g.fillText(p.sub, 315 * sx, y(712));
    g.globalAlpha = 0.8; g.strokeStyle = p.ink; g.lineWidth = 5 * sy;
    g.beginPath(); g.arc(475 * sx, y(800), 34 * sy, 0, Math.PI * 2); g.stroke();
    return c;
  };

  let uid = 0;
  // Bottle body (cap·glass·jam). With withLabel the front label is also drawn in SVG — for spots that don’t rotate
  AG.jarSVG = (p, withLabel = true) => {
    const id = `jar${++uid}`;
    return `<svg class="jar-svg" viewBox="0 0 630 1013" aria-hidden="true">
      <defs>
        <linearGradient id="${id}l" x1="0" x2="1"><stop offset="0" stop-color="#6f7277"/><stop offset=".12" stop-color="#c9cbce"/><stop offset=".3" stop-color="#f6f6f6"/><stop offset=".46" stop-color="#a6a8ac"/><stop offset=".63" stop-color="#ececed"/><stop offset=".82" stop-color="#8a8d92"/><stop offset="1" stop-color="#5b5e63"/></linearGradient><!-- Not Skin: metal lid material -->
        <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#1e0a0a" stop-opacity=".5"/><stop offset=".16" stop-color="#000" stop-opacity=".06"/><stop offset=".3" stop-color="#fff" stop-opacity=".3"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#1e0a0a" stop-opacity=".55"/></linearGradient><!-- Not Skin: glass shadow and light -->
        <pattern id="${id}r" width="12" height="10" patternUnits="userSpaceOnUse"><rect width="2" height="10" fill="#000" opacity=".12"/></pattern><!-- Not Skin: lid groove shadow -->
        <clipPath id="${id}c"><rect x="40" y="246" width="550" height="747" rx="74"/></clipPath>
      </defs>
      <rect x="112" y="196" width="406" height="80" rx="16" fill="${p.fill}" opacity=".82"/>
      <g clip-path="url(#${id}c)">
        <rect x="40" y="246" width="550" height="747" fill="${p.fill}"/>
        <g fill="#000" opacity=".12"><circle cx="160" cy="330" r="36"/><circle cx="420" cy="300" r="28"/><circle cx="300" cy="930" r="44"/><circle cx="500" cy="900" r="30"/></g><!-- Not a Skin: fruit pulp shade inside jam -->
        ${withLabel ? band(p) : ""}
        <rect x="40" y="246" width="550" height="747" fill="url(#${id}s)"/>
        <rect x="150" y="260" width="22" height="720" rx="11" fill="#fff" opacity=".28"/><!-- Not skin: glass reflection -->
      </g>
      <rect x="90" y="24" width="450" height="190" rx="24" fill="url(#${id}l)"/>
      <rect x="90" y="24" width="450" height="190" rx="24" fill="url(#${id}r)"/>
      <rect x="96" y="194" width="438" height="24" rx="10" fill="#6f7277" opacity=".55"/><!-- Not skin: cap rim -->
    </svg>`;
  };
  // Spinning spot: label-less bottle body + a label canvas on top (original .jar-slider__label)
  AG.jarLiveHTML = (p) => `${AG.jarSVG(p, false)}<canvas class="jar-label" aria-hidden="true"></canvas>`;

  // ── Label cylinder: values straight from the original HomeHero (CYL_TOP .27 · CYL_BOT .87 · width .885 · 3° · gap .09 · front 182° · ambient light .89 · spot .58×5 x −1) ──
  const C = { TOP: 0.27, BOT: 0.87, WIDTH: 0.885, CURV: 3, GAP: 0.09, FRONT: 182, LIGHT_INT: 0.58, LIGHT_AMB: 0.89, LIGHT_X: -1, OVER: 1.35 };
  AG.JAR_FRONT = C.FRONT / 360;
  let gl = null;
  const live = [];
  const makeGL = () => {
    const T = window.THREE, b = 630 / 1013;
    const r = new T.WebGLRenderer({ alpha: true, antialias: true });
    r.outputColorSpace = T.SRGBColorSpace;
    const aniso = r.capabilities.getMaxAnisotropy();
    const scene = new T.Scene();
    const cam = new T.OrthographicCamera(-b / 2, b / 2, 0.5, -0.5, 0.01, 10);
    cam.position.z = 5;
    scene.add(new T.AmbientLight(0xffffff, C.LIGHT_AMB));
    const spot = new T.SpotLight(0xffffff, C.LIGHT_INT * 5);
    Object.assign(spot, { distance: 6, angle: Math.PI / 4, penumbra: 0.7, decay: 1.2 });
    spot.position.set(C.LIGHT_X, 0.5, 0.6);
    spot.target.position.x = 0;
    spot.target.updateMatrixWorld();
    scene.add(spot, spot.target);
    const G = C.BOT - C.TOP, rad = (C.WIDTH * b) / 2, pts = [];
    for (let i = 0; i <= 16; i++) pts.push(new T.Vector2(rad, (i / 16 - 0.5) * G));
    const mesh = new T.Mesh(new T.LatheGeometry(pts, 128));
    mesh.position.y = 0.5 - (C.TOP + C.BOT) / 2;
    mesh.rotation.x = (C.CURV * Math.PI) / 180;
    scene.add(mesh);
    const material = (p) => {
      const tex = new T.CanvasTexture(labelArt(p));
      Object.assign(tex, { wrapS: T.RepeatWrapping, wrapT: T.ClampToEdgeWrapping, colorSpace: T.SRGBColorSpace, generateMipmaps: true, minFilter: T.LinearMipmapLinearFilter, magFilter: T.LinearFilter, anisotropy: aniso });
      const uGap = { value: C.GAP }, uOffset = { value: AG.JAR_FRONT };
      const m = new T.MeshStandardMaterial({ map: tex, side: T.FrontSide, roughness: 0.72, metalness: 0 });
      // Discard the gap around the edge (9%) and spread one label across the remaining 91%
      m.onBeforeCompile = (sh) => {
        sh.uniforms.uGap = uGap; sh.uniforms.uOffset = uOffset;
        sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform float uGap;\nuniform float uOffset;")
          .replace("#include <map_fragment>", `
            #ifdef USE_MAP
              float _u = fract(vMapUv.x + uOffset);
              if (_u >= 1.0 - uGap) discard;
              float _r = _u / max(1.0 - uGap, 0.001);
              diffuseColor *= texture2D(map, vec2(_r, vMapUv.y));
            #endif`);
      };
      return { m, tex, uOffset };
    };
    let w = 0, h = 0;
    return {
      material,
      render(e, offset) {
        // If the canvas size differs (flying bottle · detail header), make the renderer that size — with room for the largest scale it grows to (1.35), as in the original
        const cw = e.canvas.offsetWidth, ch = e.canvas.offsetHeight;
        if (!cw || !ch) return false;
        const pr = Math.max(1, Math.min(Math.min(devicePixelRatio || 1, 3), Math.sqrt(12e6 / (cw * C.OVER * ch * C.OVER * Math.max(1, live.length)))));
        const W = Math.round(cw * C.OVER * pr), H = Math.round(ch * C.OVER * pr);
        if (W !== w || H !== h) { r.setPixelRatio(1); r.setSize(W, H, false); w = W; h = H; }
        if (e.canvas.width !== W || e.canvas.height !== H) { e.canvas.width = W; e.canvas.height = H; }
        e.mat.uOffset.value = offset;
        mesh.material = e.mat.m;
        r.render(scene, cam);
        e.ctx.clearRect(0, 0, W, H);
        e.ctx.drawImage(r.domElement, 0, 0);
        return true;
      },
      dispose(e) { e.mat.m.dispose(); e.mat.tex.dispose(); },
    };
  };
  // Attach to that bottle’s label canvas — once fonts arrive bake the label art, and draw how many turns it has made with render(offset)
  AG.jarLabel = (box, p) => {
    const canvas = box.querySelector(".jar-label");
    const e = { canvas, ctx: canvas?.getContext("2d"), mat: null, shown: NaN, want: AG.JAR_FRONT };
    if (!canvas || !window.THREE) return { render() {}, dispose() {} };
    live.push(e);
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      gl ??= makeGL();
      e.mat = gl.material(p);
      e.shown = NaN;
      api.render(e.want);
    });
    const api = {
      render(offset) {
        e.want = offset;
        if (!e.mat || offset === e.shown) return;
        if (gl.render(e, offset)) e.shown = offset;
      },
      dispose() { const i = live.indexOf(e); if (i >= 0) live.splice(i, 1); if (e.mat) gl.dispose(e); },
    };
    return api;
  };
})();
