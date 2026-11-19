/* Shared across several pages — entrance order, word bloom, window (modal), and one 3D canvas:
   Bottom-right pill (spins with scroll speed and changes color every 4 seconds), a stage that flips into black 3D space on long press, first-load tile intro.
   Original values: open .7s easeInOutCubic · close .6s easeOutQuad, browse follow 1/6, mouse .15, field of view 50→75, 20 layers spacing 150, cell 149,
   Pill radius .54 length 1.35, bump .15+speed×.004, color .04 over 4s, 4x within 100px near the floor over .7s power3.out, hover 1.1 .3s, press half turn .6s */
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const root = document.querySelector(".sd-root");
  const page = document.getElementById("sd-page");
  const sd = (window.sd = window.sd || { layers: [] });

  // ── Entrance order: once the font loads, remove is-loading and fire sd-ready (same spot as the original site-ready)
  let ready = false;
  const goReady = () => {
    if (ready) return;
    ready = true;
    root?.classList.remove("is-loading");
    sd.readyAt = performance.now();
    window.dispatchEvent(new Event("sd-ready"));
  };
  sd.onReady = (fn) => (ready ? fn() : window.addEventListener("sd-ready", fn, { once: true }));
  (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(goReady));
  setTimeout(goReady, 1500);

  // ── Word bloom — word numbers continue across sections: odd/even go left/right, every third is a box, .12s gap, triggers when 15% of the section is visible
  const STEP = 0.12;
  function wordBloom() {
    const groups = new Map();
    for (const el of document.querySelectorAll('[data-reveal="headline"]')) {
      const sec = el.closest("section, .sd-section") || el.parentElement;
      if (!groups.has(sec)) groups.set(sec, []);
      groups.get(sec).push(el);
    }
    for (const [sec, els] of groups) {
      let a = 0, last = 0;
      for (const el of els) {
        const words = (el.textContent || "").trim().split(/\s+/);
        el.innerHTML = words.map((w) => {
          const side = a % 2 === 0 ? "left" : "right", shape = a % 3 === 0 ? "square" : "circle", d = a++ * STEP;
          last = Math.max(last, d);
          return `<span class="wr" data-side="${side}" data-shape="${shape}" style="--wr-delay:${d.toFixed(2)}s;--wr-drift-dir:${side === "left" ? -1 : 1}"><span class="wr-text">${w}</span></span>`;
        }).join(" ");
      }
      const go = () => {
        els.forEach((el) => el.querySelectorAll(".wr").forEach((w) => w.classList.add("revealed")));
        sec.querySelectorAll('[data-reveal="headline-artifact"]').forEach((l, i) => {
          l.style.animationDelay = `${last + 0.3 + i * 0.1 + parseFloat(l.dataset.revealDelay || 0)}s`;
          l.classList.add("label-in");
        });
      };
      if (reduce) { go(); continue; }
      const hold = +(sec.dataset.revealHold || 0);
      const io = new IntersectionObserver((ents) => {
        if (!ents.some((e) => e.isIntersecting)) return;
        io.disconnect();
        setTimeout(() => requestAnimationFrame(go), hold);
      }, { threshold: 0.15, rootMargin: sec.dataset.revealMargin || "0px" });
      io.observe(sec);
    }
  }
  sd.onReady(wordBloom);

  // ── Modal: the page blurs and shrinks to .96 (0.72s power3.out), a center plate settles 1.05→1, the close cursor follows the mouse
  const modal = document.querySelector(".sd-modal");
  if (modal) {
    const inner = modal.querySelector(".sd-modal__inner");
    const card = modal.querySelector(".sd-modal__card");
    const media = modal.querySelector(".sd-modal__media");
    const title = modal.querySelector(".sd-modal__title");
    const aHead = modal.querySelector(".sd-modal__a-head"), aMedia = modal.querySelector(".sd-modal__a-media");
    const manifesto = modal.querySelector(".sd-modal__manifesto"), sceneEl = document.querySelector(".sd-scene");
    let open = false, over = false, tl = null, io = null;
    // The declaration window (over) presses down the 3D canvas, not the page, to 10px blur and .3 brightness, and enlarges the canvas 30px on all sides so the blur edge isn’t visible
    const pageFx = (on) => {
      tl?.kill();
      if (!page || reduce) return;
      page.style.transformOrigin = `50% ${scrollY + innerHeight / 2}px`;
      if (over && sceneEl) Object.assign(sceneEl.style, on ? { inset: "auto", left: "-30px", top: "-30px", width: "calc(100% + 60px)", height: "calc(100% + 60px)", background: "var(--kf-contrast-bg)" } : {});
      const s = { t: on ? 0 : 1 };
      const from = on ? 0 : 1, to = on ? 1 : 0;
      s.t = from;
      tl = gsap.to(s, { t: to, duration: on ? 0.72 : 0.48, ease: on ? "power3.out" : "power2.out", onUpdate: () => {
        const k = gsap.utils.clamp(0, 1, (s.t - 0.1) / 0.8);
        if (over) { if (sceneEl) sceneEl.style.filter = k > 0.001 ? `blur(${10 * k}px) brightness(${1 - 0.7 * k})` : ""; return; }
        page.style.filter = k > 0.001 ? `blur(${15 * k}px)` : "";
        page.style.transform = k > 0.001 ? `scale(${1 - 0.04 * k})` : "";
      }, onComplete: () => { if (!on && sceneEl) ["inset", "left", "top", "width", "height", "background", "filter"].forEach((k) => sceneEl.style.removeProperty(k)); } });
    };
    // Declaration paragraphs rise when visible (15%) — only the group visible on first load is staggered by 80ms each
    const revealManifesto = () => {
      io?.disconnect();
      const els = [...manifesto.querySelectorAll("[data-mreveal]")];
      els.forEach((el) => { el.classList.remove("is-in"); el.style.removeProperty("--reveal-delay"); });
      let n = 0, first = true;
      io = new IntersectionObserver((ents) => {
        for (const en of ents) {
          if (!en.isIntersecting) continue;
          io.unobserve(en.target);
          if (first) en.target.style.setProperty("--reveal-delay", `${n++ * 80}ms`);
          en.target.classList.add("is-in");
        }
        first = false;
      }, { threshold: 0.15 });
      els.forEach((el) => io.observe(el));
    };
    const show = (btn) => {
      title.textContent = btn.dataset.modal || "";
      media.dataset.label = btn.dataset.modalLabel || "";
      media.style.setProperty("--ratio", btn.dataset.modalRatio || "1.6");
      const article = btn.dataset.modalKind === "article";
      over = btn.dataset.modalKind === "manifesto";
      modal.classList.toggle("sd-modal--article", article);
      modal.classList.toggle("sd-modal--manifesto", over);
      if (over) { inner.scrollTop = 0; requestAnimationFrame(revealManifesto); }
      if (article) {
        aHead.textContent = btn.dataset.modal || "";
        aMedia.dataset.label = btn.dataset.modalLabel || "";
        card.style.setProperty("--a-color", getComputedStyle(btn).getPropertyValue("--card-bg").trim());
        inner.scrollTop = 0;
      }
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      html.classList.add("sd-modal-open");
      open = true;
      pageFx(true);
    };
    const hide = () => {
      if (!open) return;
      open = false;
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      html.classList.remove("sd-modal-open");
      inner.dataset.cursor = "off";
      pageFx(false);
      io?.disconnect();
      if (over && sd.isLocked?.()) sd.toggleLock();
    };
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-modal]");
      if (btn && !open && !sd.dragged) { e.preventDefault(); show(btn); }
      // Original ”Design Philosophy” button: locks 3D open, then 420ms later opens the declaration window over it
      const mf = e.target.closest("[data-manifesto]");
      if (mf && !open) {
        e.preventDefault();
        const go = () => show({ dataset: { modalKind: "manifesto" } });
        if (reduce || !sd.toggleLock || sd.isLocked?.()) go(); else { sd.toggleLock(); setTimeout(go, 420); }
      }
    });
    inner.addEventListener("click", (e) => { if (!card.contains(e.target) || e.target.closest(".sd-modal__close")) hide(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
    inner.addEventListener("pointermove", (e) => {
      inner.style.setProperty("--mc-x", `${e.clientX}px`);
      inner.style.setProperty("--mc-y", `${e.clientY}px`);
      inner.dataset.cursor = open && !card.contains(e.target) ? "on" : "off";
      inner.style.cursor = inner.dataset.cursor === "on" ? "none" : "";
    });
    inner.addEventListener("pointerdown", () => (inner.dataset.pressed = "on"));
    inner.addEventListener("pointerup", () => (inner.dataset.pressed = "off"));
    inner.addEventListener("pointerleave", () => { inner.dataset.cursor = "off"; inner.dataset.pressed = "off"; });
  }

  // ── 3D canvas
  const canvas = document.querySelector(".sd-scene");
  if (!canvas || !window.THREE) return;
  const T = THREE;
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" }); }
  catch (err) { canvas.remove(); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.autoClear = false;
  sd.renderer = renderer;

  // Get skin colors as real rgb — a 2D canvas also resolves relative colors like oklch(from …)
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const swatch = document.createElement("i");
  swatch.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.appendChild(swatch);
  sd.color = (v) => {
    swatch.style.color = `var(${v})`;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(swatch).color;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return new T.Color().setRGB(r / 255, g / 255, b / 255, T.SRGBColorSpace);
  };

  let W = innerWidth, H = innerHeight;
  const resize = () => { W = innerWidth; H = innerHeight; renderer.setSize(W, H, false); rt.setSize(W * renderer.getPixelRatio(), H * renderer.getPixelRatio()); };
  const rt = new T.WebGLRenderTarget(4, 4, { samples: 4 });

  // Screen 1px = The z that becomes World 1=0 plane — camera sits 800 away, field of view fitted to the screen height
  const CAM_Z = 800;
  const pixelFov = () => 2 * Math.atan(H / 2 / CAM_Z) * 180 / Math.PI;

  // ── Press-and-hold stage
  const dive = { scene: new T.Scene(), cam: new T.PerspectiveCamera(pixelFov(), W / H, 1, 8000), group: new T.Group(), grid: new T.Group(), built: false, scroll0: 0 };
  dive.scene.add(dive.group, dive.grid);
  const st = { spread: 0, from: 0, target: 0, t0: 0, reveal: 0, mx: 0, my: 0, smx: 0, smy: 0, pan: 0, pitch: 0, pressed: false, locked: false, px: 0.5, py: 0.5, tile: 0, tileOn: false };
  const ease = {
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outQuad: (t) => 1 - (1 - t) * (1 - t),
  };

  let ink, bg;
  function buildGrid() {
    dive.grid.clear();
    ink = sd.color("--kf-contrast-ink"); bg = sd.color("--kf-contrast-bg");
    const cell = 149, layers = 20, gap = 150;
    const hw = Math.ceil(W * 0.8 / cell) * cell, hh = Math.ceil(H * 0.8 / cell) * cell, zFar = -layers * gap;
    const pts = [], dots = [];
    for (let x = -hw; x <= hw; x += cell) { pts.push(x, -hh, 400, x, -hh, zFar, x, hh, 400, x, hh, zFar); }
    for (let y = -hh; y <= hh; y += cell) { pts.push(-hw, y, 400, -hw, y, zFar, hw, y, 400, hw, y, zFar); }
    for (let i = 0; i <= layers; i++) {
      const z = 400 - i * gap * 1.4;
      pts.push(-hw, -hh, z, hw, -hh, z, hw, -hh, z, hw, hh, z, hw, hh, z, -hw, hh, z, -hw, hh, z, -hw, -hh, z);
      for (let x = -hw; x <= hw; x += cell) dots.push(x, -hh, z, x, hh, z);
      for (let y = -hh; y <= hh; y += cell) dots.push(-hw, y, z, hw, y, z);
    }
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
    dive.lineMat = new T.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.22, depthWrite: false });
    dive.grid.add(new T.LineSegments(g, dive.lineMat));
    const dg = new T.BufferGeometry(); dg.setAttribute("position", new T.Float32BufferAttribute(dots, 3));
    dive.dotMat = new T.PointsMaterial({ color: ink, size: 8, sizeAttenuation: true, transparent: true, opacity: 0.6, depthWrite: false });
    dive.grid.add(new T.Points(dg, dive.dotMat));
    // Light at the end of the tunnel — a white glow spreading below center on first load and reveal in the original
    const glow = document.createElement("canvas"); glow.width = glow.height = 128;
    const gx = glow.getContext("2d"), grd = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, `rgba(${(ink.r * 255) | 0},${(ink.g * 255) | 0},${(ink.b * 255) | 0},1)`);
    grd.addColorStop(1, `rgba(${(ink.r * 255) | 0},${(ink.g * 255) | 0},${(ink.b * 255) | 0},0)`);
    gx.fillStyle = grd; gx.fillRect(0, 0, 128, 128);
    dive.glow = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(glow), transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
    dive.glow.scale.set(420, 420, 1);
    dive.grid.add(dive.glow);
  }

  // Lift the [data-depth] elements visible on screen into letter plates (front face background color · white outline) and stack them in layers — the spot for the original’s extruded letters
  const glyphCache = new Map();
  function glyphTex(ch, font, size) {
    const key = ch + "|" + font + "|" + size;
    if (glyphCache.has(key)) return glyphCache.get(key);
    const c = document.createElement("canvas"), x = c.getContext("2d");
    x.font = `${font}`;
    const w = Math.ceil(x.measureText(ch).width + size * 0.3), h = Math.ceil(size * 1.3);
    c.width = w * 2; c.height = h * 2; x.scale(2, 2);
    x.font = font; x.textBaseline = "middle"; x.textAlign = "center";
    x.lineJoin = "round"; x.lineWidth = Math.max(1, size * 0.012);
    x.fillStyle = `rgb(${(bg.r * 255) | 0},${(bg.g * 255) | 0},${(bg.b * 255) | 0})`;
    x.strokeStyle = `rgb(${(ink.r * 255) | 0},${(ink.g * 255) | 0},${(ink.b * 255) | 0})`;
    x.fillText(ch, w / 2, h / 2); x.strokeText(ch, w / 2, h / 2);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    const out = { tex, w, h }; glyphCache.set(key, out); return out;
  }
  let seed = 31996;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  function buildWorld() {
    dive.group.clear();
    ink = sd.color("--kf-contrast-ink"); bg = sd.color("--kf-contrast-bg");
    seed = 31996;
    dive.scroll0 = scrollY;
    const slices = [];
    const visible = (r) => r.bottom > -H * 0.3 && r.top < H * 1.3 && r.width > 0;
    const words = document.querySelectorAll(".wr-text");
    const textEls = [...document.querySelectorAll("[data-depth]")].filter((el) => !el.querySelector(".wr-text") && !el.matches(".sd-carousel"));
    const addGlyphs = (el, depth, scatter) => {
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      if (!visible(r)) return;
      const size = parseFloat(cs.fontSize), font = `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      const range = document.createRange(), node = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild : null;
      const text = el.textContent;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]; if (!ch.trim()) continue;
        let gr = r;
        if (node && i < node.length) { range.setStart(node, i); range.setEnd(node, i + 1); gr = range.getBoundingClientRect(); }
        const gt = glyphTex(ch, font, size);
        const n = size > 60 ? 12 : 3;
        const z0 = depth + (scatter ? (rnd() - 0.5) * size * 2.2 : 0);
        for (let k = 0; k < n; k++) {
          const m = new T.Mesh(new T.PlaneGeometry(gt.w, gt.h), new T.MeshBasicMaterial({ map: gt.tex, transparent: true, depthWrite: true, alphaTest: 0.08 }));
          m.userData = { x: gr.left + gr.width / 2 - W / 2, y: H / 2 - (gr.top + gr.height / 2), z: z0, k, n, thick: size * 0.32 };
          slices.push(m);
        }
      }
    };
    words.forEach((w) => addGlyphs(w, +(w.closest("[data-depth]")?.dataset.depth || -200), true));
    textEls.forEach((el) => {
      if (el.children.length && !el.matches("h2, p")) return;
      addGlyphs(el, +el.dataset.depth, false);
    });
    // Cards are white-outline panels
    document.querySelectorAll(".sd-gcard, .sd-ccard__shell, .sd-pill").forEach((el, i) => {
      const r = el.getBoundingClientRect(); if (!visible(r)) return;
      const geo = new T.EdgesGeometry(new T.PlaneGeometry(r.width, r.height));
      const line = new T.LineSegments(geo, new T.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.5 }));
      line.userData = { x: r.left + r.width / 2 - W / 2, y: H / 2 - (r.top + r.height / 2), z: -300 - (i % 5) * 60, k: 0, n: 1, thick: 0 };
      slices.push(line);
    });
    slices.forEach((m) => dive.group.add(m));
    dive.built = true;
  }

  // Composite: reveal mask (circle spreading from the pressed spot) + tile intro + edge electric band + color bleed·barrel distortion·vignette.
  const post = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { u_tex: { value: rt.texture }, u_reveal: { value: 0 }, u_spread: { value: 0 }, u_aspect: { value: 1 }, u_origin: { value: new T.Vector2(0.5, 0.5) },
      u_tile: { value: 0 }, u_tileOn: { value: 0 }, u_cells: { value: new T.Vector2(20, 12) }, u_time: { value: 0 }, u_band: { value: 0.18 },
      u_chrom: { value: 0.024 }, u_warp: { value: 0.3 }, u_ink: { value: new T.Color(1, 1, 1) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
    fragmentShader: `
      uniform sampler2D u_tex; uniform float u_reveal, u_spread, u_aspect, u_tile, u_tileOn, u_time, u_band, u_chrom, u_warp;
      uniform vec2 u_origin, u_cells; uniform vec3 u_ink; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){
        vec2 c = vUv - .5; float r2 = dot(c, c);
        vec2 uv = .5 + c * (1. - u_warp * .35 * u_spread * r2);
        float ca = u_chrom * u_spread * (r2 * 2.2 + .15);
        vec4 col = texture2D(u_tex, uv);
        col.r = texture2D(u_tex, uv + c * ca).r; col.b = texture2D(u_tex, uv - c * ca).b;
        float vig = smoothstep(.7, 1.25, length(c) * 2.);
        col.rgb *= 1. - vig * .55 * u_spread;
        vec2 d = (vUv - u_origin) * vec2(u_aspect, 1.);
        float rad = length(d) / length(vec2(u_aspect, 1.));
        float n = hash(floor(vUv * u_cells * 2.)) * .08;
        float edge = u_reveal * 1.25 - rad - n;
        float mask = smoothstep(0., .02, edge);
        float band = (1. - smoothstep(0., u_band * .5, abs(edge))) * step(.001, u_reveal) * (1. - step(.999, u_reveal));
        col.rgb += u_ink * band * .9; col.r += band * .35; col.b += band * .6;
        if (u_tileOn > .5) {
          // Original intro rules (only the numbers carried over, rewritten): 20 columns across, each column is one of three: a 3-column (15%), 2-column (45%) or 1-column chunk,
          // Sprouts by distance from center (.55) + random (.3) + big chunks late (.15), fills to density .9 in the first half of progress and randomly drops out in the second half
          vec2 cell = floor(vUv * u_cells), id = cell; float size = 1.;
          vec2 c3 = floor(cell / 3.) * 3., c2 = floor(cell / 2.) * 2.;
          if (hash(c3 + 329.31) >= .85) { id = c3; size = 3.; } else if (hash(c2 + 329.31) >= .55) { id = c2; size = 2.; }
          vec2 dc = ((id + size * .5) / u_cells - .5) * vec2(u_aspect, 1.);
          float born = length(dc) / (.5 * length(vec2(u_aspect, 1.))) * .55 + hash(id + 322.) * .3 + (size - 1.) * .15;
          float grow = clamp(u_tile * 2., 0., 1.) * .9, gone = clamp((u_tile - .5) * 2., 0., 1.);
          float on = step(born, grow) * step(gone, hash(id + 421.7));
          // Inside the panel is a dark 3D space — white light spreads blue from the end of the center tunnel
          vec2 q = (vUv - .5) * vec2(u_aspect, 1.); float rr = length(q), ang = atan(q.y, q.x);
          float rays = pow(abs(sin(ang * 23. + hash(vec2(floor(ang * 7.), 1.)) * 6.)), 6.) * exp(-rr * 3.5);
          vec3 burst = vec3(.6, .8, 1.) * (exp(-rr * 3.2) * 1.3 + rays * 1.2) + vec3(1.) * exp(-rr * rr * 26.) * 2.2;
          col.rgb += burst * smoothstep(0., .25, u_spread);
          mask = max(mask, on);
        }
        gl_FragColor = vec4(col.rgb, col.a * mask);
      }` }));
  const postScene = new T.Scene(), postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  post.frustumCulled = false; postScene.add(post);

  function setPress(on, x, y) {
    if (reduce) return;
    if (on && !st.pressed) {
      st.px = x / W; st.py = 1 - y / H;
      buildWorld();
      html.classList.add("sd-diving");
    }
    st.pressed = on;
    st.from = st.spread; st.target = on ? 1 : 0; st.t0 = performance.now();
    if (!on) html.classList.remove("sd-diving");
  }
  sd.toggleLock = () => { st.locked = !st.locked; st.lockedAt = performance.now(); setPress(st.locked, W / 2, H / 2); };
  sd.isLocked = () => st.locked;
  addEventListener("keydown", (e) => { if (e.key === "Escape" && st.locked) sd.toggleLock(); });
  // The original Show Studio isn’t a DOM window but locks and opens the 3D space — pressing again or pressing the pill closes it
  document.addEventListener("click", (e) => { if (e.target.closest("[data-dive-lock]")) sd.toggleLock(); });

  // Press and hold: pressing somewhere that isn’t a link, button, carousel or window for over 180ms while staying within 10px expands it
  let holdT = 0, downX = 0, downY = 0;
  const blocked = (t) => t.closest("a, button, input, select, label, .sd-carousel, .sd-modal, .sd-studio");
  addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || st.locked || blocked(e.target) || capHit(e.clientX, e.clientY)) return;
    downX = e.clientX; downY = e.clientY;
    clearTimeout(holdT);
    holdT = setTimeout(() => setPress(true, downX, downY), touch ? 320 : 180);
  });
  addEventListener("pointermove", (e) => {
    st.mx = (e.clientX / W) * 2 - 1; st.my = (e.clientY / H) * 2 - 1;
    if (holdT && !st.pressed && Math.hypot(e.clientX - downX, e.clientY - downY) > 10) { clearTimeout(holdT); holdT = 0; }
    const hit = capHit(e.clientX, e.clientY);
    if (hit !== cap.hover) { cap.hover = hit; document.body.style.cursor = hit ? "pointer" : ""; gsap.to(cap, { hoverScale: hit ? 1.1 : 1, duration: 0.3, ease: "power2.out", overwrite: "auto" }); }
  }, { passive: true });
  const release = () => { clearTimeout(holdT); holdT = 0; if (st.pressed && !st.locked) setPress(false); };
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);
  addEventListener("blur", release);
  addEventListener("click", (e) => {
    if (e.target.closest?.(".sd-modal")) return;
    if (!capHit(e.clientX, e.clientY)) {
      if (st.locked && performance.now() - st.lockedAt > 300) sd.toggleLock();
      return;
    }
    gsap.to(cap, { spin: cap.spin + Math.PI, duration: 0.6, ease: "power2.out" });
    sd.toggleLock();
  });

  // First loading tile intro — 1.1s after ready, for 2s, the stage unfolds only .6
  sd.onReady(() => {
    if (reduce || !document.querySelector(".sd-hero")) return;
    setTimeout(() => { buildWorld(); st.tileOn = true; st.tileT0 = performance.now(); }, 1100);
  });

  // ── Pill
  const cap = { scene: new T.Scene(), hover: false, hoverScale: 1, spin: 0, rot: 0, vel: 0, bottomT: 0, atBottom: false, born: performance.now(), pair: 0, timer: 0 };
  const capCam = new T.PerspectiveCamera(50, W / H, 1, 500);
  const CAP_Z = 40, CAP_PAD = touch ? 40 : 65;
  const capFov = () => 2 * Math.atan((2 * 32 * Math.tan(25 * Math.PI / 180) / 900) * H / (2 * CAP_Z)) * 180 / Math.PI;
  capCam.position.set(0, 0, CAP_Z);
  (() => {
    const envScene = new T.Scene();
    const sky = new T.Mesh(new T.SphereGeometry(50, 32, 16), new T.ShaderMaterial({ side: T.BackSide,
      uniforms: { u_top: { value: new T.Color(0.6, 0.7, 0.9) }, u_bottom: { value: new T.Color(0.08, 0.08, 0.12) } },
      vertexShader: "varying vec3 vP; void main(){ vP = (modelMatrix * vec4(position,1.)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }",
      fragmentShader: "uniform vec3 u_top, u_bottom; varying vec3 vP; void main(){ float t = normalize(vP).y * .5 + .5; gl_FragColor = vec4(mix(u_bottom, u_top, t), 1.); }" }));
    envScene.add(sky);
    const panel = new T.Mesh(new T.PlaneGeometry(12, 30), new T.MeshBasicMaterial({ color: new T.Color(1, 1, 1), side: T.DoubleSide }));
    panel.position.set(18, 10, 15); panel.lookAt(0, 0, 0); envScene.add(panel);
    const fill = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshBasicMaterial({ color: new T.Color(0.3, 0.35, 0.5), side: T.DoubleSide }));
    fill.position.set(-20, 5, 10); fill.lookAt(0, 0, 0); envScene.add(fill);
    const pm = new T.PMREMGenerator(renderer);
    cap.env = pm.fromScene(envScene, 0, 0.1, 100).texture;
    pm.dispose();
  })();
  cap.colorB = { value: new T.Color() };
  cap.mat = new T.MeshStandardMaterial({ roughness: 0.35, metalness: 0.55, envMap: cap.env, envMapIntensity: 1 });
  cap.mat.onBeforeCompile = (s) => {
    s.uniforms.u_colorB = cap.colorB;
    s.vertexShader = "varying float vLocalY;\n" + s.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocalY = position.y;");
    s.fragmentShader = "uniform vec3 u_colorB;\nvarying float vLocalY;\n" + s.fragmentShader.replace("#include <color_fragment>", "#include <color_fragment>\nfloat splitMask = smoothstep(-0.04, 0.04, vLocalY);\ndiffuseColor.rgb = mix(u_colorB, diffuseColor.rgb, splitMask);");
  };
  cap.mesh = new T.Mesh(new T.CapsuleGeometry(0.54, 1.35, 32, 48), cap.mat);
  cap.seamMat = new T.MeshStandardMaterial({ roughness: 0.2, metalness: 0.85, envMap: cap.env, envMapIntensity: 2.8, transparent: true, opacity: 0.3 });
  const seam = new T.Mesh(new T.TorusGeometry(0.541, 0.0025, 8, 64), cap.seamMat);
  seam.rotation.x = Math.PI / 2; cap.mesh.add(seam);
  cap.mesh.frustumCulled = false;
  cap.scene.add(cap.mesh);
  // The original cycles each carousel card’s own background · text color pairs — our pairs come from the card colors in shared.css
  const PAIRS = [["--site-blue", "--site-rose"], ["--site-pine", "--site-lime"], ["--kf-accent", "--site-plum"], ["--site-ink", "--site-sand"], ["--kf-accent-text", "--site-blue"]];
  let pairs = PAIRS.map(([a, b]) => [sd.color(a), sd.color(b)]);
  cap.curA = pairs[0][0].clone(); cap.curB = pairs[0][1].clone();
  const capPos = () => {
    const mobile = W <= 768;
    const restX = mobile ? CAP_PAD : W - CAP_PAD, restY = H - CAP_PAD;
    const sideX = Math.max(24, (W - 1440) / 2 + 24);
    const endX = mobile ? W / 2 : W - sideX - 100, endY = mobile ? H - 180 : H - 240;
    return [restX + (endX - restX) * cap.bottomT, restY + (endY - restY) * cap.bottomT];
  };
  function capHit(x, y) {
    const [cx, cy] = capPos();
    return Math.hypot(x - cx, y - cy) < 28 * cap.mesh.scale.x;
  }

  // ── Drawing
  let last = performance.now(), lastY = scrollY;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    // Expand progress
    if (st.t0) {
      const inward = st.target === 1, dur = inward ? 700 : 600;
      const k = Math.min((now - st.t0) / dur, 1);
      st.spread = st.from + (st.target - st.from) * (inward ? ease.inOutCubic(k) : ease.outQuad(k));
      const lead = inward ? 225 / 700 : 0;
      const kr = Math.min(k / Math.max(0.15, 1 - lead), 1);
      st.reveal = st.from + (st.target - st.from) * (inward ? ease.inOutCubic(kr) : ease.outQuad(k));
      if (k >= 1) st.t0 = 0;
    }
    let spread = st.spread;
    if (st.tileOn) {
      const k = Math.min((now - st.tileT0) / 2000, 1);
      st.tile = 1 - Math.pow(1 - k, 3);
      spread = Math.max(spread, 0.6 * k);
      if (k >= 1) st.tileOn = false;
    }
    renderer.clear();
    const diving = spread > 0.001 || st.tileOn;
    if (diving) {
      if (!dive.grid.children.length) buildGrid();
      st.smx += (st.mx - st.smx) * 0.15; st.smy += (st.my - st.smy) * 0.15;
      const look = st.pressed || st.locked ? 1 : 0;
      st.pan += (st.smx * 500 * spread * look - st.pan) / 6;
      st.pitch += (st.smy * (Math.PI / 3) * spread * look - st.pitch) / 6;
      const cam = dive.cam;
      cam.fov = pixelFov() + (75 - pixelFov()) * spread; cam.aspect = W / H;
      cam.position.set(st.pan * 0.5, 0, CAM_Z - spread * 120);
      cam.rotation.set(-st.pitch * 0.45, -st.pan / 1400, 0);
      cam.updateProjectionMatrix();
      dive.group.position.y = scrollY - dive.scroll0;
      for (const m of dive.group.children) {
        const u = m.userData;
        m.position.set(u.x, u.y, u.z * spread - (u.n > 1 ? (u.k / (u.n - 1)) * u.thick * spread : 0));
        m.visible = u.k === 0 || spread > 0.02;
      }
      dive.lineMat.opacity = 0.22 * spread; dive.dotMat.opacity = 0.6 * spread;
      dive.glow.position.set(0, -H * 0.28, -900);
      dive.glow.material.opacity = st.tileOn ? 1 : 0.85 * spread;
      dive.scene.background = bg;
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(dive.scene, cam); renderer.setRenderTarget(null);
      const u = post.material.uniforms;
      u.u_reveal.value = st.tileOn && st.spread < 0.001 ? 0 : st.reveal;
      u.u_spread.value = spread; u.u_aspect.value = W / H; u.u_origin.value.set(st.px, st.py);
      u.u_tileOn.value = st.tileOn ? 1 : 0; u.u_tile.value = st.tile; u.u_cells.value.set(20, (20 * H) / W); u.u_time.value = now * 0.001;
      u.u_ink.value.copy(ink);
      renderer.render(postScene, postCam);
    }
    for (const layer of sd.layers) layer(renderer, now, dt, spread);
    // Pill
    const y = scrollY, vel = ((y - lastY) / Math.max(dt, 1e-3)) * 0.83; lastY = y;
    cap.vel += (vel - cap.vel) * Math.min(dt * 8, 1);
    cap.rot += (cap.vel * 0.004 + 0.15) * dt;
    const s = now * 0.001;
    cap.mesh.rotation.set(Math.PI * 0.18 + Math.sin(s * 0.4) * 0.21, s * 0.15, cap.rot + cap.spin);
    const a = Math.min(Math.max(((now - cap.born) / 1000 - 3) / 0.9, 0), 1);
    const born = reduce ? 1 : a === 0 ? 0 : a === 1 ? 1 : Math.pow(2, -10 * a) * Math.sin((a * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
    const atBottom = !(st.pressed || st.locked) && document.documentElement.scrollHeight - H - y < 100;
    if (atBottom !== cap.atBottom) { cap.atBottom = atBottom; gsap.to(cap, { bottomT: atBottom ? 1 : 0, duration: 0.7, ease: "power3.out", overwrite: "auto" }); }
    cap.mesh.scale.setScalar(born * cap.hoverScale * (1 + 3 * cap.bottomT));
    cap.timer += dt;
    if (cap.timer > 4) { cap.timer = 0; cap.pair = (cap.pair + 1) % pairs.length; }
    cap.curA.lerp(pairs[cap.pair][0], 0.04); cap.curB.lerp(pairs[cap.pair][1], 0.04);
    cap.mat.color.copy(cap.curA); cap.colorB.value.copy(cap.curB);
    cap.seamMat.color.copy(cap.curA).lerp(cap.curB, 0.5).multiplyScalar(1.4);
    const [cx, cy] = capPos();
    capCam.fov = capFov(); capCam.aspect = W / H;
    capCam.setViewOffset(W, H, W / 2 - cx, H / 2 - cy, W, H);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.clearDepth(); renderer.render(cap.scene, capCam);
    renderer.toneMapping = T.NoToneMapping;
    requestAnimationFrame(frame);
  }
  addEventListener("resize", () => { resize(); dive.grid.clear(); if (st.pressed || st.locked) buildWorld(); });
  resize();
  sd.onReady(() => { pairs = PAIRS.map(([a, b]) => [sd.color(a), sd.color(b)]); });
  requestAnimationFrame(frame);
})();
