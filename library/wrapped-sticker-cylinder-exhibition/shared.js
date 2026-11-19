/* Motion shared by the whole site — three things drawn on a single WebGL panel.
   1) Sticker: wraps the image around a bumpy vertical cylinder and rotates it while raising it bottom → top as the sticker area passes through the screen. The mouse tilts the camera ±0.2rad (follows 10% per frame).
   2) Pill outline: for each word in the big title a band is drawn with a capsule distance field — the band fills from inside (1s expo.inOut) and thins to a 2px line (.5s expo.out), then the word scales .85→1 (.75s expo.out).
   3) Curtain: a rounded-box hole grows from the center to reveal the page (.5s expo.in), on exit it closes with one palette color 1→.475 (.65s expo.inOut) → 0 (.4s expo.in).
   The original is a single-page app that swaps pages with fetch, so the curtain stays closed while the next page opens — here, so it also works from file://, it really navigates, passing the closing color via sessionStorage so the next page opens from a curtain of the same color. */
(() => {
  const root = document.documentElement;
  const body = document.body;
  const FADE_KEY = "zk-fade";
  const PAL = 8;
  // Text color over the palette color — original pairs (black on yellow, lilac, pink and lime, white on blue, navy, orange and purple)
  const PAIR = ["dark", "light", "dark", "dark", "dark", "light", "light", "light"];

  const probeCanvas = document.createElement("canvas");
  probeCanvas.width = probeCanvas.height = 1;
  const probeCtx = probeCanvas.getContext("2d", { willReadFrequently: true });
  function cssRGB(expr) {
    const s = document.createElement("i");
    s.style.cssText = `display:none;color:${expr}`;
    body.append(s);
    const c = getComputedStyle(s).color;
    s.remove();
    probeCtx.clearRect(0, 0, 1, 1);
    probeCtx.fillStyle = c;
    probeCtx.fillRect(0, 0, 1, 1);
    const d = probeCtx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  }
  const rgbStr = (a) => `rgb(${a[0]} ${a[1]} ${a[2]})`;
  const pal = (i) => `var(--site-pal-${i})`;
  const pairOf = (i) => (PAIR[i - 1] === "dark" ? "var(--kf-ink)" : "var(--kf-bg)");

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- Sticker art: redrawn on canvas instead of the original SVG and photos ---------- */
  function blobPath(ctx, cx, cy, rx, ry, rand) {
    const n = 9;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const k = 0.78 + rand() * 0.34;
      pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * (0.7 + rand() * 0.45)]);
    }
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (i === 0) ctx.moveTo(p1[0], p1[1]);
      ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    ctx.closePath();
  }

  function drawWords(art, fam) {
    const S = 1024;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d");
    const rows = art.rows || [];
    const rand = rng(art.seed || 7);
    const band = S / Math.max(rows.length, 1);
    rows.forEach((row, i) => {
      const cy = band * (i + 0.5);
      ctx.fillStyle = rgbStr(cssRGB(pal(row.bg)));
      blobPath(ctx, S / 2 + (rand() - 0.5) * 60, cy, S * 0.47, band * 0.66, rand);
      ctx.fill();
      ctx.fillStyle = rgbStr(cssRGB(row.ink ? pal(row.ink) : pairOf(row.bg)));
      let px = band * 0.9;
      ctx.font = `400 ${px}px ${fam}`;
      const w = ctx.measureText(row.text).width;
      if (w > S * 0.82) px *= (S * 0.82) / w;
      ctx.font = `400 ${px}px ${fam}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(row.text, S / 2, cy + px * 0.04);
    });
    return { canvas: c, aspect: 1 };
  }

  function drawPhoto(art, fam) {
    const W = 512;
    const aspect = art.aspect || 1.333;
    const H = Math.round(W * aspect);
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    const fill = cssRGB("var(--kf-raised)");
    const line = cssRGB("var(--kf-dim)");
    ctx.fillStyle = rgbStr(fill);
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgbStr(line);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(W, H); ctx.moveTo(W, 0); ctx.lineTo(0, H);
    ctx.stroke();
    ctx.strokeRect(1, 1, W - 2, H - 2);
    const label = art.label || "Photo";
    ctx.font = `500 22px ${fam}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const words = label.split(" ");
    const lines = [];
    let cur = "";
    words.forEach((wd) => {
      const t = cur ? `${cur} ${wd}` : wd;
      if (ctx.measureText(t).width > W * 0.8 && cur) { lines.push(cur); cur = wd; } else cur = t;
    });
    if (cur) lines.push(cur);
    const bw = W * 0.86, bh = lines.length * 30 + 24;
    ctx.fillStyle = rgbStr(fill);
    ctx.fillRect((W - bw) / 2, H / 2 - bh / 2, bw, bh);
    ctx.fillStyle = rgbStr(line);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, H / 2 - ((lines.length - 1) * 30) / 2 + i * 30));
    return { canvas: c, aspect };
  }

  /* ---------- Shader ---------- */
  const STICKER_VS = `
    uniform vec2 uAspect;
    uniform vec2 uScale;
    uniform vec2 uShift;
    uniform float uTurn;
    uniform float uGap;
    varying vec2 vUv;
    varying vec3 vNormalView;
    const float TAU = 6.28318530718;
    // Height variation that shakes the cylinder radius — horizontally an integer frequency that fits one turn, vertically changes only within the band height (±1.8)
    float bump(vec2 q) {
      float a = q.x * TAU;
      float y = clamp(q.y, 0.0, 1.0);
      float n = 0.46 * sin(a + 2.9 * y + 0.6) * cos(5.3 * y - 0.4)
              + 0.28 * sin(2.0 * a - 4.1 * y + 1.7)
              + 0.16 * cos(3.0 * a + 6.7 * y + 0.3)
              + 0.10 * sin(5.0 * a - 9.2 * y + 2.2);
      // At the band’s top and bottom ends (outside height ±1.8) the radius shrinks close to the axis (0.15) — so the back of a fully passed sticker doesn’t hang over the screen
      float edge = clamp(smoothstep(0.86, 0.98, y) + 1.0 - smoothstep(0.02, 0.14, y), 0.0, 1.0);
      return mix(n, -1.0, edge);
    }
    vec3 wrapOnDrum(vec2 p) {
      vec2 o = p / uAspect;
      float c = cos(uTurn), s = sin(uTurn);
      vec2 r = vec2(c * o.x + s * o.y, -s * o.x + c * o.y);
      vec2 q = r * uScale + uShift;
      float radius = 1.4 + 1.25 * bump(vec2(q.x + 0.5, (q.y + 1.8) / 3.6)) + uGap;
      float ang = q.x * TAU;
      return vec3(sin(ang) * radius, q.y, cos(ang) * radius);
    }
    void main() {
      vUv = uv;
      vec3 p = wrapOnDrum(position.xy);
      vec3 px = wrapOnDrum(position.xy + vec2(0.01, 0.0));
      vec3 py = wrapOnDrum(position.xy + vec2(0.0, 0.01));
      vNormalView = normalize(mat3(viewMatrix) * normalize(cross(px - p, py - p)));
      gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
    }`;
  const STICKER_FS = `
    uniform sampler2D uMap;
    uniform vec3 uLightView;
    varying vec2 vUv;
    varying vec3 vNormalView;
    void main() {
      vec4 t = texture2D(uMap, vUv);
      if (t.a < 0.5) discard;
      vec3 n = normalize(vNormalView);
      if (!gl_FrontFacing) n = -n;
      // Like the original grain, pulls the bump normals 70% toward the screen front so surfaces look almost flat
      n = normalize(mix(vec3(0.0, 0.0, 1.0), n, 0.3));
      float lit = 0.75 + 0.75 * max(dot(n, uLightView), 0.0);
      gl_FragColor = vec4(min(t.rgb * lit, vec3(1.0)), 1.0);
    }`;

  const PILL_VS = `
    uniform vec2 uQuadScale;
    uniform vec2 uQuadShift;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy * uQuadScale + uQuadShift, 1.0, 1.0);
    }`;
  const pillFS = (n) => `
    #define WORDS ${n}
    uniform vec2 uSize;
    uniform float uReach;
    uniform float uBand;
    uniform vec3 uColor;
    uniform vec2 uA[WORDS];
    uniform vec2 uB[WORDS];
    uniform float uR[WORDS];
    varying vec2 vUv;
    float capsule(vec2 p, vec2 a, vec2 b, float r) {
      vec2 ab = b - a;
      float k = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-6), 0.0, 1.0);
      return length(p - a - ab * k) - r;
    }
    void main() {
      vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;
      float d = 1e5;
      for (int i = 0; i < WORDS; i++) d = min(d, capsule(p, uA[i], uB[i], uR[i]));
      d /= uSize.x;
      float w = fwidth(d) * 0.7071;
      float inner = smoothstep(uReach - w, uReach + w, d);
      float outer = smoothstep(uReach + uBand - w, uReach + uBand + w, d);
      float a = inner - outer;
      if (a < 0.0001) discard;
      gl_FragColor = vec4(uColor, a);
    }`;

  const FADE_VS = `void main() { gl_Position = vec4(position.xy, 1.0, 1.0); }`;
  const FADE_FS = `
    uniform float uOpen;
    uniform vec3 uColor;
    uniform vec2 uRes;
    float roundBox(vec2 p, vec2 h, float r) {
      vec2 q = abs(p) - h + r;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }
    void main() {
      float k = uRes.y / uRes.x;
      vec2 st = gl_FragCoord.xy / uRes.x - vec2(0.5, 0.5 * k);
      float d = roundBox(st, vec2(uOpen, uOpen * k), uOpen * (k < 1.0 ? 0.5 : 1.0));
      float w = fwidth(d) * 0.7071;
      gl_FragColor = vec4(uColor, smoothstep(-w, w, d));
    }`;

  /* ---------- Panel ---------- */
  class Stage {
    constructor(T, reduce) {
      this.T = T;
      this.reduce = reduce;
      this.box = document.querySelector(".zk-gl");
      this.fixed = body.classList.contains("is-fixed");
      this.desk = matchMedia("(min-width:768px)");
      this.dpr = Math.min(devicePixelRatio, 1.5);
      this.renderer = new T.WebGLRenderer({ antialias: devicePixelRatio < 2, alpha: true });
      this.renderer.setPixelRatio(this.dpr);
      this.box.append(this.renderer.domElement);
      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(35, 1, 0.001, 100);
      this.dolly = new T.Object3D();
      this.dolly.add(this.camera);
      this.scene.add(this.dolly);
      this.pointer = new T.Vector2();
      this.follow = new T.Vector2();
      this.light = new T.Vector3(2, 4, 1).normalize();
      this.lightView = new T.Vector3();
      this.stickers = [];
      this.pills = [];
      this.dirty = true;
      this.scrolled = true;
      this.size();
      new ResizeObserver(() => this.size()).observe(this.box);
      addEventListener("scroll", () => { this.scrolled = true; this.dirty = true; }, { passive: true });
      if (!reduce) {
        body.addEventListener("pointermove", (e) => {
          this.pointer.set((e.clientX / this.w) * 2 - 1, -(e.clientY / this.h) * 2 + 1);
          this.dirty = true;
        });
      }
      this.tick = this.tick.bind(this);
      requestAnimationFrame(this.tick);
    }
    size() {
      const r = this.box.getBoundingClientRect();
      this.w = Math.max(1, Math.round(r.width));
      this.h = Math.max(1, Math.round(r.height));
      this.renderer.setSize(this.w, this.h, false);
      this.camera.aspect = this.w / this.h;
      this.camera.position.z = this.desk.matches ? 3.5 : 5;
      this.camera.updateProjectionMatrix();
      if (this.fixed || this.desk.matches) { this.box.style.position = "fixed"; this.box.style.transform = "none"; }
      else { this.box.style.position = "absolute"; this.box.style.transform = `translateY(${scrollY}px)`; }
      this.fade?.resize();
      this.scrolled = true;
      this.dirty = true;
    }
    tick() {
      requestAnimationFrame(this.tick);
      if (this.scrolled) {
        this.scrolled = false;
        if (!this.fixed && !this.desk.matches) this.box.style.transform = `translateY(${scrollY}px)`;
        if (!this.fixed) this.pills.forEach((p) => p.place());
        this.stickers.forEach((s) => s.update());
      }
      if (this.follow.distanceTo(this.pointer) > 0.01) {
        this.follow.lerp(this.pointer, 0.1);
        this.dolly.rotation.set(this.follow.y * 0.2, this.follow.x * -0.2, 0);
        this.dirty = true;
      }
      if (!this.dirty) return;
      this.dirty = false;
      this.dolly.updateMatrixWorld(true);
      this.lightView.copy(this.light).transformDirection(this.camera.matrixWorldInverse);
      this.renderer.render(this.scene, this.camera);
    }
  }

  class StickerBand {
    constructor(stage, node, fam) {
      this.stage = stage;
      this.node = node;
      this.fixed = node.dataset.fixed === "true";
      const T = stage.T;
      const list = JSON.parse(node.dataset.config || "[]");
      this.items = list.map((cfg) => {
        const art = cfg.art === "photo" ? drawPhoto(cfg, fam) : drawWords(cfg, fam);
        const tex = new T.CanvasTexture(art.canvas);
        tex.minFilter = T.LinearFilter;
        tex.generateMipmaps = false;
        const mat = new T.ShaderMaterial({
          vertexShader: STICKER_VS,
          fragmentShader: STICKER_FS,
          transparent: true,
          side: T.DoubleSide,
          uniforms: {
            uMap: { value: tex },
            uAspect: { value: new T.Vector2(art.aspect * 2, 2) },
            uScale: { value: new T.Vector2(cfg.scale ?? 0.5, (cfg.scale ?? 0.5) * 6) },
            uShift: { value: new T.Vector2(0, -3) },
            uTurn: { value: ((cfg.rotation ?? 0) * Math.PI) / 180 },
            uGap: { value: cfg.distance ?? 0 },
            uLightView: { value: stage.lightView },
          },
        });
        const mesh = new T.Mesh(new T.PlaneGeometry(2, 2, 100, 100), mat);
        mesh.frustumCulled = false;
        mesh.visible = false;
        stage.scene.add(mesh);
        return { cfg, mesh, mat };
      });
    }
    update() {
      const H = this.stage.h;
      let e;
      if (this.fixed) e = scrollY / (H * 5);
      else {
        const r = this.node.getBoundingClientRect();
        e = -(r.top - H) / (r.height + H);
      }
      this.items.forEach(({ cfg, mesh, mat }) => {
        const t = e * (cfg.speed ?? 1) - (cfg.offset ?? 0);
        mesh.visible = t >= 0 && t <= 1;
        if (!mesh.visible) return;
        const turns = cfg.turns ?? 0, off = cfg.turn_offset ?? 0;
        mat.uniforms.uShift.value.set(-turns * 0.5 + off + turns * t, -2.7 + 5.4 * t);
      });
    }
  }

  class Pill {
    constructor(stage, node, words, lineWidth, color, logo) {
      const T = stage.T;
      this.stage = stage;
      this.node = node;
      this.words = words;
      this.logo = logo;
      this.lineWidth = lineWidth;
      const n = Math.max(words.length, 1);
      this.mat = new T.ShaderMaterial({
        vertexShader: PILL_VS,
        fragmentShader: pillFS(n),
        transparent: true,
        depthTest: false,
        depthWrite: false,
        extensions: { derivatives: true },
        uniforms: {
          uQuadScale: { value: new T.Vector2(1, 1) },
          uQuadShift: { value: new T.Vector2() },
          uSize: { value: new T.Vector2(1, 1) },
          uReach: { value: -0.75 },
          uBand: { value: 0.25 },
          uColor: { value: new T.Color().setRGB(...color.map((v) => v / 255)) },
          uA: { value: Array.from({ length: n }, () => new T.Vector2()) },
          uB: { value: Array.from({ length: n }, () => new T.Vector2()) },
          uR: { value: new Array(n).fill(0) },
        },
      });
      this.mesh = new T.Mesh(new T.PlaneGeometry(2, 2), this.mat);
      this.mesh.frustumCulled = false;
      this.mesh.visible = false;
      this.mesh.renderOrder = 10;
      stage.scene.add(this.mesh);
      this.shown = false;
    }
    measure() {
      const r = this.node.getBoundingClientRect();
      const u = this.mat.uniforms;
      u.uSize.value.set(r.width, r.height);
      if (this.shown) u.uBand.value = this.lineWidth / r.width;
      if (this.logo) {
        const b = this.logo.getBoundingClientRect();
        const x = b.left - r.left, y = b.top - r.top;
        if (r.height / r.width < 1) {
          const rad = b.height / 2;
          u.uA.value[0].set(x + rad, y + rad);
          u.uB.value[0].set(x + b.width - rad, y + rad);
          u.uR.value[0] = rad;
        } else {
          const rad = b.width / 2;
          u.uA.value[0].set(x + rad, y + rad);
          u.uB.value[0].set(x + rad, y + b.height - rad);
          u.uR.value[0] = rad;
        }
      } else {
        this.words.forEach((wd, i) => {
          const w = wd.el.getBoundingClientRect();
          const a = w.height;
          const padX = a * 0.3, padY = a * (wd.desc ? 0.105 : 0.095);
          const x = w.left - r.left - padX + a * 0.025;
          const y = w.top - r.top - padY + a * (wd.desc ? 0.1 : 0.01);
          const width = w.width + padX * 2, height = a + padY * 2;
          const rad = height / 2;
          u.uA.value[i].set(x + rad, y + rad);
          u.uB.value[i].set(x + Math.max(width - rad, rad), y + rad);
          u.uR.value[i] = rad;
        });
      }
      this.place();
    }
    place() {
      const r = this.node.getBoundingClientRect();
      const { w: W, h: H } = this.stage;
      const off = r.bottom < 0 || r.top > H;
      this.mesh.visible = this.started && !off;
      const u = this.mat.uniforms;
      u.uQuadScale.value.set(r.width / W, r.height / H);
      u.uQuadShift.value.set((r.left + r.width / 2 - W / 2) / (W / 2), -((r.top + r.height / 2 - H / 2) / (H / 2)));
    }
    show(reduce) {
      const u = this.mat.uniforms;
      const W = u.uSize.value.x || 1;
      this.started = true;
      this.place();
      this.stage.dirty = true;
      if (reduce) {
        this.shown = true;
        u.uReach.value = 0;
        u.uBand.value = this.lineWidth / W;
        return Promise.resolve();
      }
      const s = { reach: -0.75, band: 0.25 };
      const draw = () => { u.uReach.value = s.reach; u.uBand.value = s.band; this.stage.dirty = true; };
      gsap.to(s, { reach: -0.25, duration: 1, ease: "expo.inOut", onUpdate: draw });
      return new Promise((done) => setTimeout(() => {
        this.shown = true;
        gsap.to(s, { reach: 0, band: this.lineWidth / (u.uSize.value.x || 1), duration: 0.5, ease: "expo.out", onUpdate: draw });
        done();
      }, 1000));
    }
  }

  class Fade {
    constructor(stage, rgb) {
      const T = stage.T;
      this.stage = stage;
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
      this.mat = new T.ShaderMaterial({
        vertexShader: FADE_VS,
        fragmentShader: FADE_FS,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        extensions: { derivatives: true },
        uniforms: { uOpen: { value: 0 }, uColor: { value: new T.Color().setRGB(...rgb.map((v) => v / 255)) }, uRes: { value: new T.Vector2(1, 1) } },
      });
      this.mesh = new T.Mesh(g, this.mat);
      this.mesh.frustumCulled = false;
      this.mesh.renderOrder = 1000;
      stage.scene.add(this.mesh);
      this.resize();
    }
    resize() {
      const s = this.stage;
      this.mat.uniforms.uRes.value.set(Math.round(s.w * s.dpr), Math.round(s.h * s.dpr));
    }
    set(v) { this.mat.uniforms.uOpen.value = v; this.stage.dirty = true; }
    open(dur = 0.5) {
      const s = { v: 0 };
      this.mesh.visible = true;
      return new Promise((done) => gsap.to(s, { v: 1, duration: dur, ease: "expo.in", onUpdate: () => this.set(s.v), onComplete: () => { this.mesh.visible = false; this.stage.dirty = true; done(); } }));
    }
    close(rgb) {
      this.mat.uniforms.uColor.value.setRGB(...rgb.map((v) => v / 255));
      this.mesh.visible = true;
      const s = { v: 1 };
      gsap.to(s, { v: 0.475, duration: 0.65, ease: "expo.inOut", onUpdate: () => this.set(s.v) });
      return new Promise((done) => setTimeout(() => {
        gsap.to(s, { v: 0, duration: 0.4, ease: "expo.in", onUpdate: () => this.set(s.v) });
        setTimeout(done, 650);
      }, 650));
    }
  }

  /* ---------- Header row · accordion ---------- */
  function header(reduce) {
    const head = document.querySelector(".zk-head");
    if (!head) return null;
    const here = location.pathname.split("/").pop() || "index.html";
    head.querySelectorAll(".zk-head__item").forEach((it) => {
      const a = it.querySelector("a");
      it.classList.toggle("is-active", !!a && a.getAttribute("href") === here);
    });
    const btn = head.querySelector(".zk-head__burger");
    let open = false;
    btn?.addEventListener("click", () => {
      open = !open;
      btn.setAttribute("aria-expanded", String(open));
      if (open) {
        head.classList.remove("is-visible");
        head.classList.add("is-open");
        setTimeout(() => head.classList.add("is-visible"), reduce ? 0 : 250);
      } else {
        head.classList.remove("is-open");
        head.classList.add("is-visible");
      }
    });
    return {
      show: () => head.classList.add("is-visible"),
      hide: () => { open = false; head.classList.remove("is-visible", "is-open"); },
    };
  }

  function accordions() {
    document.querySelectorAll(".zk-acc__item").forEach((it) => {
      const b = it.querySelector(".zk-acc__btn");
      b?.addEventListener("click", () => {
        const on = it.classList.toggle("is-open");
        b.setAttribute("aria-expanded", String(on));
      });
    });
  }

  /* ---------- Start ---------- */
  function wordsOf(title) {
    const out = [];
    title.querySelectorAll(".zk-title__line").forEach((line) => {
      const ws = [...line.querySelectorAll(".zk-title__word")];
      const desc = /[qpgjy]/.test(ws.map((w) => w.textContent).join(""));
      ws.forEach((el) => out.push({ el, desc }));
    });
    return out;
  }

  function popWords(els, reduce) {
    els.forEach((el) => {
      if (reduce) { el.style.opacity = "1"; return; }
      gsap.fromTo(el, { scale: 0.85 }, { scale: 1, duration: 0.75, ease: "expo.out", onStart: () => { el.style.opacity = "1"; } });
    });
  }

  async function start(reduce) {
    const head = header(reduce);
    accordions();
    const fam = getComputedStyle(root).getPropertyValue("--kf-font-display").trim() || "sans-serif";

    const dark = body.classList.contains("is-dark");
    const ink = cssRGB(dark ? "var(--kf-contrast-ink)" : "var(--kf-ink)");
    const reveal = [...document.querySelectorAll(".zk-copy, .zk-aside, .zk-cols, .zk-acc, .zk-links, .zk-list")];
    const titles = [...document.querySelectorAll(".zk-title")];
    const logos = [...document.querySelectorAll(".zk-logo")];

    const sel = 1 + Math.floor(Math.random() * PAL);
    root.style.setProperty("--site-sel-bg", pal(sel));
    root.style.setProperty("--site-sel-fg", pairOf(sel));

    let stage = null;
    try { stage = window.THREE ? new Stage(window.THREE, reduce) : null; } catch (e) { stage = null; }

    const fallback = () => {
      body.classList.add("is-ready");
      head?.show();
      reveal.forEach((el) => el.classList.add("is-shown"));
      titles.forEach((t) => popWords(t.querySelectorAll(".zk-title__word"), true));
      logos.forEach((l) => { l.style.opacity = "1"; });
      root.style.removeProperty("background");
    };
    if (!stage) { fallback(); return; }

    // Draw the curtain first and keep the page covered — so the curtain shows right away as in the original, even while the (remote) font loads
    let incoming = null;
    try { incoming = JSON.parse(sessionStorage.getItem(FADE_KEY) || "null"); sessionStorage.removeItem(FADE_KEY); } catch (e) { incoming = null; }
    const fadeRGB = incoming ? cssRGB(pal(incoming)) : cssRGB(dark ? "var(--kf-contrast-ink)" : "var(--kf-ink)");
    stage.fade = new Fade(stage, fadeRGB);
    stage.fade.set(reduce ? 1 : 0);
    stage.fade.mesh.visible = !reduce;
    const drawNow = () => {
      stage.dolly.updateMatrixWorld(true);
      stage.lightView.copy(stage.light).transformDirection(stage.camera.matrixWorldInverse);
      stage.renderer.render(stage.scene, stage.camera);
    };
    drawNow();
    body.classList.add("is-ready");
    // The html background (head script) painted with the curtain color during arrival — the curtain was drawn in that color, so it is lifted
    root.style.removeProperty("background");

    await document.fonts.ready;
    try { await document.fonts.load(`400 100px ${fam}`); } catch (e) { /* If the font fails to load, draw with a fallback font */ }

    const bands =[...document.querySelectorAll(".zk-stickers")].map((n) => new StickerBand(stage, n, fam));
    stage.stickers = bands;
    const pills = [];
    const titlePills = titles.map((t) => { const p = new Pill(stage, t, wordsOf(t), 2, ink); pills.push(p); return p; });
    const logoPills = logos.map((l) => { const p = new Pill(stage, l.querySelector(".zk-logo__inner"), [{}], 4, ink, l.querySelector(".zk-logo__border")); pills.push(p); return p; });
    stage.pills = pills;
    const measure = () => { pills.forEach((p) => p.measure()); stage.dirty = true; };
    measure();
    new ResizeObserver(measure).observe(document.querySelector(".zk-content"));
    bands.forEach((b) => b.update());

    stage.renderer.compile(stage.scene, stage.camera);
    drawNow();
    if (!reduce) await stage.fade.open();

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        if (en.target.classList.contains("zk-title")) {
          const p = titlePills[titles.indexOf(en.target)];
          p.show(reduce).then(() => popWords(en.target.querySelectorAll(".zk-title__word"), reduce));
        } else en.target.classList.add("is-shown");
      });
    });
    reveal.forEach((el) => io.observe(el));
    titles.forEach((t) => io.observe(t));
    logos.forEach((l, i) => logoPills[i].show(reduce).then(() => {
      if (reduce) { l.style.opacity = "1"; return; }
      gsap.fromTo(l, { scale: 0.85 }, { scale: 1, duration: 0.75, ease: "expo.out", onStart: () => { l.style.opacity = "1"; } });
    }));
    head?.show();

    if (body.classList.contains("is-fixed") && !reduce) {
      const s = { y: 0 };
      gsap.to(s, { y: stage.h * 2.5, duration: 2, delay: 0.5, ease: "sine.inOut", onUpdate: () => scrollTo(0, s.y) });
    }

    // Links within the same site close the curtain and move on — hashes (sections on the same page) just scroll down smoothly
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#")) {
        const to = href.length > 1 && document.getElementById(href.slice(1));
        if (to) { e.preventDefault(); to.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }
        return;
      }
      if (/^(https?:|mailto:|tel:)/.test(href)) return;
      e.preventDefault();
      head?.hide();
      if (reduce) { location.href = href; return; }
      const pick = 1 + Math.floor(Math.random() * PAL);
      try { sessionStorage.setItem(FADE_KEY, String(pick)); } catch (err) { /* If it cannot be saved, the next page opens on a text-color curtain */ }
      stage.fade.close(cssRGB(pal(pick))).then(() => { location.href = href; });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { stage.fade.set(1); stage.fade.mesh.visible = false; head?.show(); } });
  }

  const mm = gsap.matchMedia();
  let begun = false;
  mm.add({ calm: "(prefers-reduced-motion: reduce)", move: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (begun) return;
    begun = true;
    start(!!ctx.conditions.calm);
  });
})();
