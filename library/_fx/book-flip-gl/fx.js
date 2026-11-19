// One 3D picture book on a table (Hero of a reference site) — the half-open book slams its pages shut over 4 seconds and settles down at a slant,
// Pressing returns it to the front and spreads it open, and with drag (inertia), arrows and keyboard it turns one page at a time around the spine. The book art is pushed toward the mouse at a different scale per layer.
// Paging is a single timeline like the original — cover 0~1, page n at n+1~n+2, at the end the back cover closes over and the book steps aside to the left, [data-fx-part=end] comes in.
// Drag area (one screen width = one sheet) is bound directly to timeline progress, so a page can stop half-turned, following your hand.
(() => {
  const PI = Math.PI;
  const W = 1.05, H = 1.2;
  // Default drift multipliers of the page art — applied in order when a layer has no data-depth (original moveFactorDefaults)
  const DEPTHS = [[0.25, 0.25], [0.5, 0.5], [2, 1], [1, 1], [1.5, 0.1], [3, 0.1]];

  const probeColor = (host, value) => {
    const p = document.createElement("i");
    p.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
    p.style.color = value;
    host.appendChild(p);
    const c = getComputedStyle(p).color;
    p.remove();
    return c;
  };
  const cssVar = (el, n, fb = "") => getComputedStyle(el).getPropertyValue(n).trim() || fb;
  // three’s Color can’t read oklab() or color-mix() — paint one dot on a canvas and read it back as rgb
  const rgbOf = (host, value) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const g = cv.getContext("2d", { willReadFrequently: true });
    g.fillStyle = probeColor(host, value);
    g.fillRect(0, 0, 1, 1);
    const [r, gr, b] = g.getImageData(0, 0, 1, 1).data;
    return { css: `rgb(${r}, ${gr}, ${b})`, lum: (0.2126 * r + 0.7152 * gr + 0.0722 * b) / 255 };
  };

  // When an image slot is empty — diagonal lines and a label on the background surface
  function placeholder(host, label, w, h) {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const g = cv.getContext("2d");
    g.fillStyle = probeColor(host, "var(--kf-raised)");
    g.fillRect(0, 0, w, h);
    g.strokeStyle = probeColor(host, "var(--kf-line)");
    g.globalAlpha = 0.35;
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    g.globalAlpha = 1;
    g.fillStyle = probeColor(host, "var(--kf-ink)");
    g.font = `500 ${Math.round(h / 22)}px ${cssVar(host, "--kf-font-sans", "sans-serif")}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    (label || "").split(" · ").forEach((line, i, all) => g.fillText(line, w / 2, h / 2 + (i - (all.length - 1) / 2) * h / 16, w * 0.8));
    return cv;
  }

  function textureOf(T, src) {
    const tex = src instanceof HTMLCanvasElement ? new T.CanvasTexture(src) : new T.Texture(src);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    if (src instanceof HTMLImageElement) {
      const done = () => { tex.needsUpdate = true; };
      if (src.complete && src.naturalWidth) done(); else src.addEventListener("load", done, { once: true });
    }
    return tex;
  }

  // One side — back (x=0) to W, height H. Looks up (+y) or down (−y). uv is the position on the unfolded two-page image, bulge is a morph that bulges a little over 1mm like the original
  function sheet(T, facing, uvOf, nx = 24) {
    const pos = [], nor = [], uv = [], idx = [], bulge = [];
    for (let i = 0; i <= nx; i++) {
      const a = i / nx, x = a * W;
      for (const z of [-H / 2, H / 2]) {
        pos.push(x, 0, z);
        nor.push(0, facing, 0);
        uv.push(...uvOf(a, z));
        bulge.push(0, facing * (0.0013 * Math.sin(PI * a) - 0.0006 * a), 0);
      }
    }
    for (let i = 0; i < nx; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
      if (facing > 0) idx.push(a, b, c, c, b, d); else idx.push(a, c, b, c, d, b);
    }
    const g = new T.BufferGeometry();
    g.setIndex(idx);
    g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    g.morphAttributes.position = [new T.Float32BufferAttribute(bulge, 3)];
    g.morphTargetsRelative = true;
    return g;
  }
  const vOf = (z) => (H / 2 - z) / H;
  const rightHalf = (a, z) => [0.5 + a * 0.5, vOf(z)];
  const leftHalf = (a, z) => [0.5 - a * 0.5, vOf(z)];
  const whole = (a, z) => [a, vOf(z)];
  const wholeBack = (a, z) => [1 - a, vOf(z)];

  // Overlay the page image layers in one material — over the base (map), each layer at its own position (rect) and its own offset scale. Offset = Mouse + breathing + flip angle
  function pageMaterial(T, base, layers) {
    const m = new T.MeshStandardMaterial({ map: base, metalness: 0.07, roughness: 0.45 });
    const offset = new T.Vector2();
    m.userData.offset = offset;
    const n = layers.length;
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uOffset = { value: offset };
      let decl = "uniform vec2 uOffset;\n", mix = "";
      layers.forEach((l, k) => {
        sh.uniforms[`uL${k}`] = { value: l.tex };
        sh.uniforms[`uR${k}`] = { value: new T.Vector4(...l.rect) };
        sh.uniforms[`uM${k}`] = { value: new T.Vector2(...l.depth) };
        decl += `uniform sampler2D uL${k};\nuniform vec4 uR${k};\nuniform vec2 uM${k};\n`;
        mix += `{ vec2 q = (vMapUv + uOffset * uM${k} - uR${k}.xy) / uR${k}.zw;
          vec4 t = texture2D(uL${k}, q);
          float inside = step(0.0, q.x) * step(q.x, 1.0) * step(0.0, q.y) * step(q.y, 1.0);
          c.rgb = mix(c.rgb, t.rgb, t.a * inside); }\n`;
      });
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <map_pars_fragment>", `#include <map_pars_fragment>\n${decl}`)
        .replace("#include <map_fragment>", `#ifdef USE_MAP\n vec4 c = texture2D(map, vMapUv);\n${mix} diffuseColor.rgb *= c.rgb;\n#endif`);
    };
    m.customProgramCacheKey = () => `book-flip-gl-${n}`;
    return m;
  }

  // Three preview masks — rounded borders that look hand-cut. Swapping them makes the border jitter
  function roughMask(seed) {
    const s = 128, cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const g = cv.getContext("2d");
    g.fillStyle = "black"; /* Not skin: mask alpha value */
    g.fillRect(0, 0, s, s);
    g.fillStyle = "white"; /* Not skin: mask alpha value */
    g.beginPath();
    let r = seed * 97.13;
    for (let i = 0; i <= 64; i++) {
      r = (r * 9301 + 49297) % 233280;
      const a = (i / 64) * PI * 2, rad = s * (0.42 + (r / 233280 - 0.5) * 0.05);
      const x = s / 2 + Math.cos(a) * rad, y = s / 2 + Math.sin(a) * rad;
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.fill();
    return cv;
  }

  // Floor: scratched metal table. Faint grain drawn from the skin base toward the text color
  function groundCanvas(host) {
    const s = 256, cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const g = cv.getContext("2d");
    g.fillStyle = probeColor(host, "color-mix(in oklab, var(--kf-bg) 88%, var(--kf-ink))");
    g.fillRect(0, 0, s, s);
    let r = 7;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    g.strokeStyle = probeColor(host, "color-mix(in oklab, var(--kf-bg) 68%, var(--kf-ink))");
    for (let i = 0; i < 90; i++) {
      g.globalAlpha = 0.05 + rnd() * 0.18;
      g.lineWidth = 0.5 + rnd() * 1.5;
      const x = rnd() * s, y = rnd() * s, len = 20 + rnd() * 90, a = -0.5 + rnd() * 0.25;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
    g.fillStyle = probeColor(host, "var(--kf-bg)");
    for (let i = 0; i < 1400; i++) { g.globalAlpha = rnd() * 0.25; g.fillRect(rnd() * s, rnd() * s, 1, 1); }
    g.globalAlpha = 1;
    return cv;
  }

  // One image across the open two-page spread = [data-fx-part=spread]. The img·canvas inside are the layers (first is the background), placeholder if none
  function readSpread(T, host, fig) {
    const kids = [...fig.querySelectorAll("img, canvas")];
    if (!kids.length) {
      const cv = placeholder(host, fig.getAttribute("data-label"), 1050, 600);
      return { base: textureOf(T, cv), layers: [], thumb: cv };
    }
    const [first, ...rest] = kids;
    let d = 0;
    const layers = rest.map((el) => {
      const [x, y, w, h] = (el.getAttribute("data-rect") || "0 0 1 1").split(/\s+/).map(Number);
      const text = el.hasAttribute("data-text");
      const depth = el.hasAttribute("data-depth") ? el.getAttribute("data-depth").split(/\s+/).map(Number) : text ? [0, 0] : DEPTHS[++d % DEPTHS.length];
      return { tex: textureOf(T, el), rect: [x, 1 - y - h, w, h], depth, el, box: [x, y, w, h] };
    });
    return { base: textureOf(T, first), layers, thumb: null, first };
  }

  // One preview cell: crops the center of the page image to a square and stacks the layers too
  function thumbOf(spread) {
    const s = 104, cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const g = cv.getContext("2d");
    const draw = (el, box) => {
      const w = el.naturalWidth || el.width, h = el.naturalHeight || el.height;
      if (!w) return;
      const [x, y, bw, bh] = box;
      // Center square of the unfolded image (1.75 wide) = Horizontal .214~.786
      const sx = (x - 0.214) / 0.572, sw = bw / 0.572;
      g.drawImage(el, 0, 0, w, h, sx * s, y * s, sw * s, bh * s);
    };
    if (spread.first) {
      draw(spread.first, [0, 0, 1, 1]);
      spread.layers.forEach((l) => draw(l.el, l.box));
    } else draw(spread.thumb, [0, 0, 1, 1]);
    return cv;
  }
  // Cover and back-cover preview — centered square
  function square(src) {
    const c = document.createElement("canvas");
    c.width = c.height = 104;
    const w = src.naturalWidth || src.width, h = src.naturalHeight || src.height;
    if (w) { const m = Math.min(w, h); c.getContext("2d").drawImage(src, (w - m) / 2, (h - m) / 2, m, m, 0, 0, 104, 104); }
    return c;
  }

  function labelCanvas(host, text) {
    const s = 168, cv = document.createElement("canvas");
    cv.width = cv.height = s;
    const g = cv.getContext("2d");
    g.fillStyle = probeColor(host, "var(--kf-ink)");
    g.font = `400 22px ${cssVar(host, "--kf-font-hand", cssVar(host, "--kf-font-display", "serif"))}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    (text || "").split(" · ").forEach((line, i, all) => g.fillText(line, s / 2, s * 0.86 + (i - (all.length - 1)) * 24, s * 0.95));
    return cv;
  }

  kfFx.register("book-flip-gl", (el, { options, reduce, hover }) => {
    const T = window.THREE;
    if (!T || !window.gsap) return;
    if (window.Draggable && window.InertiaPlugin) gsap.registerPlugin(Draggable, InertiaPlugin);
    const spreadEls = [...el.querySelectorAll('[data-fx-part="spread"]')];
    if (!spreadEls.length) return;
    const N = spreadEls.length;
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const enterBtn = part("enter"), prevBtn = part("prev"), nextBtn = part("next"), endPanel = part("end"), loading = part("loading");
    const captions = [...el.querySelectorAll('[data-fx-part="caption"]')];
    const introDelay = +(options.delay ?? 0.75);
    const flipDur = +(options.flip ?? 1.5);
    const withMenu = options.menu !== "0";
    const fire = (state, extra = {}) => el.dispatchEvent(new CustomEvent("fx:book-flip-gl", { bubbles: true, detail: { state, index: page, ...extra } }));
    const slow = window.SlowMo ? "slow(0.7,0.7,false)" : "power1.inOut";

    const renderer = new T.WebGLRenderer({ antialias: true, stencil: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.setClearColor(rgbOf(el, "var(--kf-bg)").css);
    const canvas = renderer.domElement;
    canvas.setAttribute("data-fx-part", "canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;outline:none";
    el.prepend(canvas);

    const scene = new T.Scene();
    const cameraWrapper = new T.Object3D();
    const camera = new T.PerspectiveCamera(36, 1, 0.01, 15);
    camera.position.z = 2.54;
    cameraWrapper.add(camera);
    scene.add(cameraWrapper);
    // Match the original’s (three r122) old light units, since the current board receives light intensity divided by π
    const ambLight = new T.AmbientLight(0xffffff, 0.72 * PI); /* Not skin: white light */
    const dirLight = new T.DirectionalLight(0xffffff, 0.28 * PI); /* Not skin: white light */
    dirLight.position.set(0, 5, 0.56);
    const spotLight = new T.SpotLight(0xffffff, 0.12 * PI); /* Not skin: white light */
    spotLight.position.set(0, 0, 25);
    spotLight.decay = 0;
    scene.add(ambLight, dirLight, spotLight);

    const dark = rgbOf(el, "var(--kf-bg)").lum < 0.5;
    const groundTex = textureOf(T, groundCanvas(el));
    groundTex.wrapS = groundTex.wrapT = T.RepeatWrapping;
    groundTex.repeat.set(30, 30);
    const ground = new T.Mesh(new T.PlaneGeometry(60, 60), new T.MeshStandardMaterial({ map: groundTex, roughness: 0.7, metalness: dark ? 1 : 0.15 }));
    ground.position.y = 16;
    scene.add(ground);
    const lookAt = new T.Object3D();
    scene.add(lookAt);

    // Materials — one per page (two-page spread graphic), plus front and back covers
    const spreads = spreadEls.map((f) => readSpread(T, el, f));
    const pageMats = spreads.map((s) => pageMaterial(T, s.base, s.layers));
    const coverEl = part("cover"), backEl = part("back");
    const faceOf = (fig, label) => {
      const src = fig?.querySelector("img, canvas");
      return src || placeholder(el, fig?.getAttribute("data-label") || label, 525, 600);
    };
    const coverSrc = faceOf(coverEl, "Cover"), backSrc = faceOf(backEl, "Back cover");
    const faceMat = (src) => new T.MeshStandardMaterial({ map: textureOf(T, src), metalness: 0.07, roughness: 0.45 });
    const coverMat = faceMat(coverSrc), backMat = faceMat(backSrc);
    const boardMat = new T.MeshStandardMaterial({ color: rgbOf(el, "var(--kf-surface)").css, metalness: 0.07, roughness: 0.45 });
    const edgeMat = new T.MeshStandardMaterial({ color: rgbOf(el, "var(--kf-accent)").css, metalness: 0.07, roughness: 0.6 });

    const bookWrapper = new T.Object3D();
    bookWrapper.position.y = -2.88;
    bookWrapper.rotation.z = 0.38;
    lookAt.position.y = -2.88;
    scene.add(bookWrapper);

    // Cover — a panel that turns on the spine as its axis. The inner face is page one (left of the first picture)
    const coverWrapper = new T.Group();
    coverWrapper.rotation.x = PI / 2;
    coverWrapper.position.z = 0.02;
    const cover = new T.Group();
    // Make the cover panel’s underside (.057) sit above the top bookshelf (.055) — the original model’s .0573 doesn’t overlap because its panel is thinner
    cover.position.y = 0.0601;
    const board = new T.Mesh(new T.BoxGeometry(W + 0.004, 0.0058, H), boardMat);
    board.position.x = W / 2;
    const outer = new T.Mesh(sheet(T, 1, whole), coverMat);
    outer.position.y = 0.0031;
    const firstPage = new T.Mesh(sheet(T, -1, leftHalf), pageMats[0]);
    firstPage.position.y = -0.0031;
    cover.add(board, outer, firstPage);
    // Page block of a closed book — the side is the accent-color page edge. When opened, real pages take its place
    const block = new T.Mesh(new T.BoxGeometry(W + 0.004, 0.0464, H + 0.002), [edgeMat, edgeMat, boardMat, boardMat, edgeMat, edgeMat]);
    block.position.set(W / 2 - 0.001, 0.0332, 0);
    coverWrapper.add(cover, block);
    bookWrapper.add(coverWrapper);

    // Book pages — leaf i’s front is the right side of picture i, the back is the left side of picture i+1. A back cover follows the last leaf
    const pagesWrapper = new T.Group();
    pagesWrapper.rotation.x = PI / 2;
    const leaves = [], backs = [firstPage];
    for (let i = 0; i < N; i++) {
      const leaf = new T.Group();
      leaf.position.y = 0.075 - 0.005 * i;
      const front = new T.Mesh(sheet(T, 1, rightHalf, 2), pageMats[i]);
      leaf.add(front);
      if (i < N - 1) {
        // The back face sits 6mm below the front — once flipped it becomes 6mm above, overlapping the inner cover face (.063) that flipped first so it doesn’t flicker
        const back = new T.Mesh(sheet(T, -1, leftHalf), pageMats[i + 1]);
        back.position.y = -0.006;
        leaf.add(back);
        backs.push(back);
      } else {
        const bb = new T.Mesh(new T.BoxGeometry(W + 0.004, 0.0058, H), boardMat);
        bb.position.set(W / 2, -0.0065, 0);
        const bf = new T.Mesh(sheet(T, -1, wholeBack, 2), backMat);
        bf.position.y = -0.0096;
        leaf.add(bb, bf);
      }
      pagesWrapper.add(leaf);
      leaves.push(leaf);
    }
    bookWrapper.add(pagesWrapper);
    backs.forEach((m) => { m.morphTargetInfluences = [1]; });

    // Page-turn timeline — progress = Section number / (N + 1)
    const flip = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    // Measure separately and add the book coming from x −.5 → 0 as the cover opens and its stepping aside to the left at the end — the original also has two tweens taking turns on the same x.
    const st = { baseX: -0.5, endP: 0, factor: 8, xMove: 0, viewY: 0 };
    flip.to(cover.rotation, { duration: 1, z: PI }, 0);
    flip.fromTo(st, { baseX: -0.5 }, { duration: 1, baseX: 0 }, 0);
    flip.fromTo(firstPage.morphTargetInfluences, { 0: 1 }, { duration: 0.5, 0: 0 }, 0.5);
    flip.to(firstPage.morphTargetInfluences, { duration: 0.5, 0: 1 }, 1);
    let vw = 1, vh = 1;
    const endShift = () => (vw < 600 ? (300 / vw) * -1.15 : -0.18);
    leaves.forEach((leaf, i) => {
      if (i > 0) {
        flip.fromTo(backs[i].morphTargetInfluences, { 0: 1 }, { duration: 0.5, 0: 0 }, i + 0.5);
        flip.to(backs[i].morphTargetInfluences, { duration: 0.5, 0: 1 }, i + 1);
      }
      flip.to(leaf.rotation, { duration: 1, z: PI }, i + 1);
      for (let t = i; t < N; t++) flip.to(leaves[t].position, { duration: 1, y: "+=0.01" }, i);
      flip.to(pagesWrapper.position, { duration: 1, z: -0.005 - 0.005 * i }, i);
      flip.to(coverWrapper.position, { duration: 1, z: 0.02 - 0.005 * i }, i);
      if (i === N - 1) {
        flip.fromTo(st, { endP: 0 }, { duration: 1, endP: 1 }, i + 1);
        flip.to(bookWrapper.rotation, { duration: 1, y: 0.14 }, i + 1);
        flip.to(spotLight.position, { duration: 1, x: 3 }, i + 1);
        if (endPanel) {
          gsap.set(endPanel, { visibility: "visible", pointerEvents: "none" });
          flip.set(endPanel, { pointerEvents: "all" }, i + 1.5);
          const head = endPanel.firstElementChild;
          if (head) flip.from(head, { duration: 0.5, x: 40, opacity: 0 }, i + 1.5);
          endPanel.querySelectorAll("li").forEach((li, k) => {
            const s = 0.075 * (k + 1);
            flip.from(li, { duration: 0.5 - s, x: 40 }, i + 1.5 + s);
            flip.from(li, { duration: 0.4 - s, opacity: 0 }, i + 1.5 + s);
          });
        }
      }
    });

    // Phone captions — one per page, visible only while that page is open
    const capTl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    captions.forEach((c, t) => {
      capTl.fromTo(c, { opacity: 0 }, { opacity: 1, duration: 0.5 }, t + 0.5);
      capTl.to(c, { opacity: 0, duration: 0.25 }, t + 1.25);
    });
    capTl.set({}, {}, N + 1);
    let capOn = false;
    const setCaptions = (on) => {
      if (on === capOn || !captions.length) return;
      capOn = on;
      if (on) { capTl.paused(false); capTl.progress(flip.progress()); flip.add(capTl, 0); } else { capTl.paused(true); flip.remove(capTl); }
    };

    // Preview row — page picker. Only the raised cell grows, the label turns in from −1rad and the mask shimmers
    const menu = new T.Group();
    const buttons = [], hits = [], hitsNested = [];
    const masks = [1, 2, 3].map((k) => { const t = new T.CanvasTexture(roughMask(k)); return t; });
    let small = false, activeScale = 2, activeScaleTo = 1, cur = 1, hoverIndex = -1, maskTl = null, menuOn = false;
    if (withMenu) {
      const plane = new T.PlaneGeometry(0.1, 0.1);
      const hitMat = new T.MeshBasicMaterial({ visible: false });
      const sources = [coverSrc, ...spreads, backSrc];
      const titles = [coverEl?.getAttribute("data-title") || "", ...spreadEls.map((f) => f.getAttribute("data-title") || ""), backEl?.getAttribute("data-title") || ""];
      sources.forEach((s, e) => {
        const g = new T.Group();
        const hit = new T.Mesh(plane, hitMat);
        hit.scale.set(0.4, 1, 0.4);
        hit.position.x = e * 0.02 + 0.02 * e;
        hit.userData.index = e;
        hits.push(hit);
        menu.add(hit);
        const src = s instanceof HTMLElement ? square(s) : thumbOf(s);
        const thumb = new T.Mesh(plane, new T.MeshStandardMaterial({ map: textureOf(T, src), alphaMap: masks[0], metalness: 0.07, roughness: 0.45, opacity: 0.6, depthWrite: false, transparent: true }));
        const label = new T.Mesh(plane, new T.MeshBasicMaterial({ map: textureOf(T, labelCanvas(el, titles[e])), depthWrite: false, transparent: true, opacity: 0 }));
        label.scale.set(1.5, 1.5, 1.5);
        label.rotation.z = -1;
        g.add(thumb, label);
        const nested = new T.Mesh(plane, hitMat);
        nested.scale.set(e === cur ? 1.5 : 2, e === cur ? 1.5 : 2, 1);
        nested.userData.index = e;
        g.add(nested);
        hitsNested.push(nested);
        g.scale.set(0.2, 0.2, 0.2);
        g.position.x = e * 0.02 + 0.02 * e;
        menu.add(g);
        buttons.push(g);
      });
      menu.userData.width = 0.02 * (sources.length - 1) + 0.02 * (sources.length - 2);
      menu.position.set(-0.5 * menu.userData.width, -0.72, 0.04);
      menu.visible = false;
      scene.add(menu);
    }
    const setHover = (t, now = false) => {
      if (!menuOn && !now) return;
      const d = now ? 0 : 0.3;
      if (t === hoverIndex) return;
      if (hoverIndex !== -1) {
        maskTl?.kill();
        const b = buttons[hoverIndex];
        gsap.to(b.scale, { duration: d, x: 0.2, y: 0.2, z: 0.2 });
        gsap.to(b.children[1].material, { opacity: 0, duration: d });
        gsap.to(b.children[1].rotation, { z: -1, duration: d });
        gsap.to(b.children[0].rotation, { x: 0, duration: d });
        if (cur === hoverIndex) {
          gsap.to(b.children[0].material, { opacity: 1, duration: d });
          gsap.to(b.children[0].scale, { duration: d, x: activeScale, y: activeScale, z: activeScale });
        } else gsap.to(b.children[0].material, { opacity: 0.6, duration: d });
      }
      hoverIndex = t;
      if (t !== -1) {
        const b = buttons[t];
        maskTl?.kill();
        b.children[0].material.alphaMap = masks[0];
        if (cur === t) gsap.to(b.children[0].scale, { duration: d, x: 1, y: 1, z: 1 });
        else {
          maskTl = gsap.timeline({ repeat: -1 });
          maskTl.set(b.children[0].material, { alphaMap: masks[1] }, 0.12);
          maskTl.set(b.children[0].material, { alphaMap: masks[2] }, 0.28);
          maskTl.set(b.children[0].material, { alphaMap: masks[0] }, 0.45);
        }
        gsap.to(b.children[1].material, { opacity: 1, duration: d });
        gsap.to(b.children[0].material, { opacity: 1, duration: d });
        gsap.fromTo(b.children[1].rotation, { z: -1 }, { z: 0, duration: d });
        gsap.to(b.children[0].rotation, { x: -0.1, duration: d });
        gsap.to(b.scale, { duration: d, x: activeScaleTo, y: activeScaleTo, z: activeScaleTo });
      }
      buttons.forEach((b, k) => {
        const push = k === hoverIndex || hoverIndex === -1 ? 0 : k < hoverIndex ? -0.05 * activeScaleTo : 0.05 * activeScaleTo;
        gsap.to(b.position, { duration: d, x: k * 0.02 + 0.02 * k + push });
      });
    };
    const setActive = (t, now = false) => {
      if (!buttons.length) return;
      if (small) setHover(t, now);
      if (cur === t) return;
      const d = now ? 0 : 0.3;
      gsap.to(buttons[cur].children[0].material, { opacity: 0.6, duration: d });
      gsap.to(buttons[cur].children[0].scale, { x: 1, y: 1, z: 1, duration: d });
      gsap.to(hitsNested[cur].scale, { x: 2, y: 2, z: 1, duration: d });
      cur = t;
      if (cur !== hoverIndex) {
        gsap.to(buttons[t].children[0].material, { opacity: 1, duration: d });
        gsap.to(buttons[t].children[0].scale, { x: activeScale, y: activeScale, z: activeScale, duration: d });
      } else {
        gsap.to(hitsNested[t].scale, { x: 1.5, y: 1.5, z: 1, duration: d });
        gsap.killTweensOf(buttons[t].children[1].rotation);
        gsap.to(buttons[t].children[1].rotation, { z: 0.33, duration: d });
        maskTl?.kill();
      }
    };
    const showMenu = () => {
      if (!buttons.length) return;
      menu.visible = true;
      buttons.forEach((b, t) => {
        gsap.from(b.children[0].material, { opacity: 0, duration: 0.5, delay: 0.1 * t });
        gsap.from(b.position, { x: "-=0.1", duration: 0.5, delay: 0.08 * t, ease: "back.out" });
        gsap.from(b.scale, { x: 0, y: 0, z: 0, ease: "back.out", duration: 0.5, delay: 0.08 * t, onComplete: t === buttons.length - 1 ? () => { menuOn = true; } : undefined });
      });
    };

    // Mouse follow — maps the area 10% inside the screen edge to −1~1, following 1% per frame (original MouseMoveTracker)
    const mouse = { x: 0, y: 0, ex: 0, ey: 0, cx: 0, cy: 0 };
    const eased = { x: 0, y: 0 };
    const ambient = { x: 0, y: 0 };
        const edge = () => 0.1 * Math.min(vw, vh);
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse.cx = e.clientX - r.left; mouse.cy = e.clientY - r.top;
      const clamp = gsap.utils.clamp(-1, 1);
      mouse.ex = clamp(gsap.utils.mapRange(-vw / 2 + edge(), vw / 2 - edge(), -1, 1, mouse.cx - vw / 2));
      mouse.ey = clamp(gsap.utils.mapRange(-vh / 2 + edge(), vh / 2 - edge(), -1, 1, mouse.cy - vh / 2));
    };
    if (hover && !reduce) window.addEventListener("mousemove", onMove);
    const breathe = reduce ? [] : [
      gsap.fromTo(ambient, { y: -0.03 }, { y: 0.03, ease: "sine.inOut", duration: 60, repeat: -1, yoyo: true }),
      gsap.fromTo(ambient, { x: 0.04 }, { x: -0.04, ease: "sine.inOut", duration: 30, repeat: -1, yoyo: true }),
    ];

    // Drag board — one screen width per section. The board’s left is driven by progress
    const track = document.createElement("div");
    track.setAttribute("data-fx-part", "track");
    track.style.cssText = `position:absolute;top:0;left:0;height:100%;width:${(N + 2) * 100}%`;
    canvas.after(track);
    let page = 0, entered = false, entering = false, landing = false;
    const raycaster = new T.Raycaster(), ndc = new T.Vector2();
    const pick = (x, y, list) => {
      ndc.set((x / vw) * 2 - 1, -(y / vh) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObjects(list, false)[0];
    };
    const arrows = [prevBtn, nextBtn];
    let allow = [true, true];
    const checkArrows = () => {
      [page !== 0, page !== N + 1].forEach((ok, k) => {
        if (!arrows[k] || ok === allow[k]) return;
        allow[k] = ok;
        gsap.to(arrows[k], { opacity: ok ? 1 : 0.2, pointerEvents: ok ? "auto" : "none", duration: 0.5 });
      });
      setActive(page);
      fire("page");
    };
    let drag = null;
    const killFlip = () => { gsap.killTweensOf(track); gsap.killTweensOf(flip); drag?.tween?.kill(); };
    const go = (t) => {
      if (t < 0) t = 0;
      else if (t > N + 1) { t = N + 1; killFlip(); gsap.to(flip, { progress: 1, duration: 0.5 }); }
      if (t !== page) {
        page = t;
        killFlip();
        gsap.to(track, { left: t * -vw, duration: reduce ? 0 : 1 });
        gsap.to(flip, { progress: page / (N + 1), duration: reduce ? 0 : flipDur, ease: "power3.inOut" });
      }
      checkArrows();
    };
    const dragUpdate = () => {
      const x = (drag.x / vw) * -1;
      page = gsap.utils.clamp(0, N + 1, Math.round(x));
      checkArrows();
      flip.progress(x / (N + 1));
    };
    if (window.Draggable) {
      drag = Draggable.create(track, {
        type: "left",
        bounds: el,
        inertia: !!window.InertiaPlugin,
        allowNativeTouchScrolling: true,
        onDragStart: () => gsap.killTweensOf(flip),
        onClick: (e) => { if (e.target.closest("a, button")) return; menuClick(e); },
        onDrag: dragUpdate,
        onThrowUpdate: dragUpdate,
        snap: (v) => gsap.utils.clamp(-N - 1, 0, Math.round(v / vw)) * vw,
      })[0];
      drag.disable();
    }
    const menuClick = (e) => {
      if (!menuOn) return;
      const r = el.getBoundingClientRect();
      const hit = pick(e.clientX - r.left, e.clientY - r.top, small ? hitsNested : hits);
      if (hit) go(hit.object.userData.index);
    };

    // Hovering the cover lifts it, and from 2 seconds later it bobs once every 4 seconds
    let hovering = false, hoverByMouse = false, hoverTw = null, idleTl = null;
    const hoverBook = (e) => {
      if (hovering) return;
      hovering = true; hoverByMouse = !!e;
      idleTl?.kill(); hoverTw?.kill();
      hoverTw = gsap.to(cover.rotation, { duration: 0.75, z: PI / 32, ease: "power4.out" });
      idleTl = gsap.timeline({ repeat: -1, repeatDelay: 4, delay: 2 });
      idleTl.to(cover.rotation, { duration: 0.25, z: PI / 32 + 0.075, yoyo: true, repeat: 2, yoyoEase: "power2.out", ease: "power2.inOut" });
      idleTl.to(cover.rotation, { duration: 0.25, z: PI / 32, ease: "sine.out" });
    };
    const leaveBook = () => {
      if (!hovering) return;
      hovering = false; hoverByMouse = false;
      idleTl?.kill(); hoverTw?.kill();
      hoverTw = gsap.to(cover.rotation, { duration: 0.5, z: 0, ease: "sine.out" });
    };
    const btnEnter = (e) => hoverBook(e), btnLeave = () => leaveBook();
    enterBtn?.addEventListener("mouseenter", btnEnter);
    enterBtn?.addEventListener("mouseleave", btnLeave);

    // Screen fit: the camera is pulled back so the open book (2.2 × 1.25) fits (the original fitCameraToSelection as is, down to the atan)
    const resize = () => {
      vw = el.clientWidth || 1; vh = el.clientHeight || 1;
      renderer.setPixelRatio(gsap.utils.clamp(1, 2, window.devicePixelRatio));
      renderer.setSize(vw, vh, false);
      camera.zoom = 1;
      camera.aspect = vw / vh;
      const keepZ = camera.position.z;
      camera.position.y = 0;
      const fit = camera.aspect < 1.25 ? 1 : 0.82;
      const hD = 2.2 / (2 * Math.atan((PI * camera.fov) / 360));
      const dist = fit * Math.max(hD, hD / camera.aspect);
      camera.near = dist / 10; camera.far = dist * 10;
      camera.position.z = dist;
      camera.userData.z = dist;
      camera.updateProjectionMatrix();
      const visH = 2 * Math.tan(T.MathUtils.degToRad(camera.fov) / 2) * dist;
      const bookPx = (2.22 / (visH * camera.aspect)) * vw;
      el.style.setProperty("--fx-book-px", `${bookPx}px`);
      if (!entered && !entering) camera.position.y = -6;
      const r = 1500 / bookPx;
      menu.scale.set(r, r, r);
      small = vw <= 600;
      activeScale = small ? 1 : 2; activeScaleTo = small ? 0.75 : 1;
      if (small) {
        menu.position.y = -visH / 2 - 40 * (visH / vh);
        if (entered) { st.viewY = 100; camera.setViewOffset(vw, vh, 0, st.viewY, vw, vh); }
      } else { st.viewY = 0; camera.clearViewOffset(); menu.position.y = -0.625 - 0.08 * r; }
      setCaptions(small);
      if (menu.userData.width) menu.position.x = menu.userData.width * r * -0.5;
      if (entered) {
        killFlip();
        gsap.set(track, { left: page * -vw });
        flip.progress(page / (N + 1));
        drag?.update(true);
      }
      if (!entered) {
        camera.position.z = keepZ;
        const halfPx = (2.22 / (2 * Math.tan(T.MathUtils.degToRad(camera.fov) / 2) * keepZ * camera.aspect)) * vw * 0.5;
        if (halfPx / vw > 1.27) { camera.zoom = (1 / gsap.utils.clamp(0, 2.35, halfPx / vw)) * 1.2; camera.updateProjectionMatrix(); }
      }
    };

    let tick = null;
    const render = () => {
      eased.x += (mouse.ex - eased.x) * 0.01;
      eased.y += (mouse.ey - eased.y) * 0.01;
      if (entering) pageMats.forEach((m, t) => {
        let off = leaves[t].rotation.z;
        off -= t > 0 ? PI - leaves[t - 1].rotation.z : 0.5 * (PI - cover.rotation.z);
        m.userData.offset.set(-0.02 * eased.x + ambient.x + 0.1 * off, -0.02 * eased.y + ambient.y);
      });
      const landscape = vw > vh && vh <= 540 && vw <= 960;
      if (!landscape) {
        cameraWrapper.position.y = -0.2 * eased.y + ambient.y * st.factor;
        cameraWrapper.position.x = eased.x * -st.xMove + ambient.x * st.factor;
      }
      dirLight.position.x = -0.2 * eased.x + ambient.x * st.factor;
      bookWrapper.position.x = st.baseX + st.endP * endShift();
      if (landing && hover) {
        if (pick(mouse.cx, mouse.cy, [block, ...cover.children])) hoverBook(null);
        else if (!hoverByMouse) leaveBook();
      } else if (entered && !small && menuOn) {
        const hit = pick(mouse.cx, mouse.cy, hits);
        setHover(hit ? hit.object.userData.index : -1);
      }
      camera.lookAt(lookAt.position);
      renderer.render(scene, camera);
    };

    let intro = [];
    const start = () => {
      resize();
      tick = render;
      gsap.ticker.add(tick);
      el.classList.add("is-ready");
      fire("ready");
      if (loading) gsap.to(loading, { opacity: 0, duration: 0.5 });
      const done = () => {
        landing = true;
        el.addEventListener("click", enter);
        if (enterBtn) gsap.to(enterBtn, { opacity: 1, duration: 1, pointerEvents: "auto" });
        fire("landing");
      };
      if (reduce) {
        flip.progress(0);
        cameraWrapper.position.z = 0;
        dirLight.position.z = 2.68;
        done();
        return;
      }
      const d = 0.4 + introDelay;
      flip.progress(0.45);
      intro = [
        gsap.from([dirLight, ambLight, spotLight], { delay: d, intensity: 0, duration: 4, ease: "sine.inOut" }),
        gsap.to(dirLight.position, { z: 2.68, delay: 2 + introDelay, duration: 4, ease: "sine.inOut" }),
        gsap.from(lookAt.position, { y: 0.75, delay: d, duration: 4, ease: "power1.inOut" }),
        gsap.from(bookWrapper.position, { y: 0, delay: d, duration: 6, ease: "power1.inOut" }),
        gsap.fromTo(cameraWrapper.position, { z: 10 }, { z: 0, delay: d, duration: 5.5, ease: "power1.inOut" }),
        gsap.to(flip, { progress: 0, delay: d, duration: 4, ease: slow }),
        gsap.from(bookWrapper.rotation, { z: 0, delay: d, duration: 6, ease: "power1.inOut", onComplete: done }),
      ];
    };

    // Press to enter — the cover opens and the camera goes front-on, the book settles with back.out, first page from 3.15 seconds
    const enter = (e) => {
      e?.preventDefault?.();
      if (!landing) return;
      landing = false;
      el.removeEventListener("click", enter);
      enterBtn?.removeEventListener("mouseenter", btnEnter);
      enterBtn?.removeEventListener("mouseleave", btnLeave);
      idleTl?.kill(); hoverTw?.kill();
      const tl = gsap.timeline({
        onComplete: () => {
          entered = true;
          page = 1;
          gsap.set(track, { left: -vw });
          arrows.forEach((a) => a && gsap.to(a, { opacity: 1, duration: 1, pointerEvents: "auto" }));
          if (captions.length) gsap.to(captions[0].parentElement, { autoAlpha: 1, duration: 1 });
          drag?.enable();
          showMenu();
          block.visible = false;
          camera.zoom = 1;
          camera.updateProjectionMatrix();
          checkArrows();
          fire("entered");
        },
      });
      if (small) tl.fromTo(st, { viewY: 0 }, { duration: 1.5, viewY: 100, onUpdate: () => camera.setViewOffset(vw, vh, 0, st.viewY, vw, vh) }, 1.5);
      tl.to(camera, { zoom: 1, duration: 1.5, onUpdate: () => camera.updateProjectionMatrix() }, 1.5);
      tl.to(st, { factor: 2, duration: 1.5 }, 0);
      tl.to(cover.rotation, { duration: 0.75, z: 0 }, 0);
      tl.to(dirLight, { intensity: 0.9 * PI, duration: 2, ease: "sine.out" }, 1.5);
      tl.to(dirLight, { intensity: 2 * PI, duration: 2, ease: "sine.out" }, 2);
      tl.to(dirLight.position, { z: 0, duration: 2, ease: "sine.out" }, 0);
      tl.to(camera.position, { y: 0, duration: 3, ease: "power3.inOut" }, 0);
      tl.to(cameraWrapper.position, { z: 0.5, duration: 1.5, ease: "sine.in" }, 0);
      tl.to(cameraWrapper.position, { z: 0, duration: 1.5, ease: "back.out" }, 1.5);
      tl.to(flip, { progress: 1 / (N + 1), duration: 4, ease: "sine.inOut" }, 3.15);
      tl.to(camera.position, { z: camera.position.z + 0.33 * (camera.userData.z - camera.position.z), duration: 2, ease: "sine.out" }, 0);
      tl.to(camera.position, { z: camera.userData.z, duration: 3, ease: "power3.inOut" }, 3);
      tl.to(lookAt.position, { y: 0, duration: 2.55, ease: "power3.inOut" }, 0);
      tl.to(bookWrapper.position, { y: 0, duration: 3.1, ease: "back.out(1.4)" }, 0);
      tl.to(bookWrapper.rotation, { z: 0, duration: 3.1, ease: "back.out" }, 0);
      tl.to(st, { xMove: 0.2, duration: 3 }, 0);
      tl.to(ground.material, { roughness: 0.34, metalness: dark ? 0.7 : 0.1, duration: 2, ease: "sine.out" }, 0);
      entering = true;
      if (reduce) tl.progress(1);
      fire("enter");
      return false;
    };
    const onEnterBtn = (e) => { e.preventDefault(); e.stopPropagation(); enter(e); };
    enterBtn?.addEventListener("click", onEnterBtn);
    const onPrev = () => go(page - 1), onNext = () => go(page + 1);
    prevBtn?.addEventListener("click", onPrev);
    nextBtn?.addEventListener("click", onNext);
    const onKey = (e) => {
      if (!entered) return;
      if (e.key === "ArrowRight") go(page + 1);
      else if (e.key === "ArrowLeft") go(page - 1);
    };
    document.addEventListener("keydown", onKey);
    const ro = new ResizeObserver(() => tick && resize());
    ro.observe(el);
    // When focus lands on an end-section link pushed outside the panel, the browser scrolls the panel (overflow hidden) sideways and the book gets pushed — always keep it at 0
    const pinScroll = () => { if (el.scrollLeft || el.scrollTop) { el.scrollLeft = 0; el.scrollTop = 0; } };
    el.addEventListener("scroll", pinScroll);

    // Starts once all images are in, waits if the img layer arrives late (the original also starts after receiving the model and images)
    const imgs = el.querySelectorAll('[data-fx-part="spread"] img, [data-fx-part="cover"] img, [data-fx-part="back"] img');
    let wait = [...imgs].filter((i) => !(i.complete && i.naturalWidth)).length;
    let started = false;
    const go1 = () => { if (!started) { started = true; start(); } };
    if (!wait) queueMicrotask(go1);
    else imgs.forEach((i) => { if (!(i.complete && i.naturalWidth)) { const f = () => { if (--wait <= 0) go1(); }; i.addEventListener("load", f, { once: true }); i.addEventListener("error", f, { once: true }); } });

    return () => {
      started = true;
      if (tick) gsap.ticker.remove(tick);
      ro.disconnect();
      el.removeEventListener("scroll", pinScroll);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("keydown", onKey);
      el.removeEventListener("click", enter);
      enterBtn?.removeEventListener("click", onEnterBtn);
      enterBtn?.removeEventListener("mouseenter", btnEnter);
      enterBtn?.removeEventListener("mouseleave", btnLeave);
      prevBtn?.removeEventListener("click", onPrev);
      nextBtn?.removeEventListener("click", onNext);
      intro.forEach((t) => t.kill());
      breathe.forEach((t) => t.kill());
      idleTl?.kill(); hoverTw?.kill(); maskTl?.kill();
      flip.kill(); capTl.kill();
      drag?.kill();
      track.remove();
      masks.forEach((t) => t.dispose());
      spreads.forEach((sp) => sp.layers.forEach((l) => l.tex.dispose()));
      groundTex.dispose();
      scene.traverse((o) => { o.geometry?.dispose(); [].concat(o.material || []).forEach((m) => { m.map?.dispose(); m.dispose(); }); });
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      el.classList.remove("is-ready");
      el.style.removeProperty("--fx-book-px");
    };
  });
})();
