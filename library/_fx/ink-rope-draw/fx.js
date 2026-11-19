// Brush ink — lay strokes in document coordinates on a single fixed WebGL panel (pixi rope mesh), revealing the ink pattern lengthwise as if wringing it out
// Keep only one plate per page and let each brush-stroke bundle (element) borrow it — if each bundle set up its own canvas, overlapping strokes would hide each other.
(() => {
  const NAME = "ink-rope-draw";
  const EASE = "M0,0 C0.016,0.308 0.039,0.556 0.059,0.78 0.073,0.943 0.364,1 1,1";
  // Ink color slots — if the user does not provide --fx-ink-1~6, they are made by rotating the accent color’s hue (pink, blue, green, gray-blue, purple, orange)
  const INK_TURN = [95, 0, -125, null, 45, 160];

  let stage = null;

  const vert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTextureMatrix;
varying vec2 vRope;
void main() {
  vRope = (uTextureMatrix * vec3(aTextureCoord, 1.0)).xy;
  gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
}`;
  // Packs a whole plate of ink into the revealed length — the end is always a brush-tip pattern, so it looks like the brush is squeezed as it strokes
  const frag = `
varying vec2 vRope;
uniform sampler2D uSampler;
uniform float uProgress;
uniform float uFeather;
void main() {
  float shown = max(uProgress, 0.00001);
  if (vRope.x > shown) discard;
  vec4 ink = texture2D(uSampler, vec2(vRope.x / shown, vRope.y));
  float soft = min(uFeather, shown * 0.5);
  float keep = soft > 0.0 ? 1.0 - smoothstep(shown - soft, shown, vRope.x) : 1.0;
  gl_FragColor = ink * keep;
}`;

  const rgbOf = (css, host) => {
    const probe = document.createElement("i");
    probe.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
    probe.style.color = css;
    host.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    c.fillStyle = resolved;
    c.fillRect(0, 0, 1, 1);
    const [r, g, b] = c.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };

  const inkColors = (host) => {
    const cs = getComputedStyle(host);
    return INK_TURN.map((turn, i) => {
      const own = cs.getPropertyValue(`--fx-ink-${i + 1}`).trim();
      if (own) return rgbOf(own, host);
      if (turn === null) return rgbOf("color-mix(in oklab, var(--kf-accent) 30%, var(--kf-dim))", host);
      return rgbOf(`oklch(from var(--kf-accent) l c calc(h + ${turn}))`, host);
    });
  };

  // Brushstroke pattern: several bands of varying thickness across the width undulate along the length, and the edges are ragged like bristle tips
  function inkCanvas(rgb, seed) {
    const W = 512, H = 96;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    let s = (seed * 7919 + 17) % 2147483647;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const mix = (k, to) => rgb.map((v, i) => Math.round(v + (to[i] - v) * k));
    const light = [255, 255, 255], dark = [0, 0, 0];
    const tones = [mix(0.62, light), mix(0.34, light), rgb, rgb, mix(0.22, dark), mix(0.42, dark), mix(0.85, light)];
    const bands = [];
    for (let v = 0; v < 1;) {
      const w = 0.035 + rnd() * 0.15;
      bands.push({ v0: v, v1: Math.min(1, v + w), tone: tones[Math.floor(rnd() * tones.length)], ph: rnd() * 6.283, amp: 0.01 + rnd() * 0.035, f: 1 + rnd() * 3 });
      v += w;
    }
    for (let x = 0; x < W; x += 2) {
      const u = x / W;
      for (const b of bands) {
        const wob = Math.sin(b.f * u * 6.283 + b.ph) * b.amp;
        const y0 = (b.v0 + wob) * H, y1 = (b.v1 + wob) * H + 1;
        g.fillStyle = `rgb(${b.tone.join(",")})`;
        g.fillRect(x, y0, 2, y1 - y0);
      }
    }
    for (let i = 0; i < 9; i++) {
      const y = rnd() * H, len = W * (0.2 + rnd() * 0.6), x0 = rnd() * (W - len);
      g.fillStyle = `rgba(${(i % 3 ? light : dark).join(",")},${0.35 + rnd() * 0.4})`;
      g.fillRect(x0, y, len, 0.6 + rnd() * 1.4);
    }
    g.globalCompositeOperation = "destination-in";
    g.fillStyle = `rgb(${rgb.join(",")})`;
    // Both ends where the brush touches and lifts are thin — one pattern always fits within the revealed length, so the leading end keeps a brush-tip shape throughout the stroke
    const tip = (u) => 0.42 * (1 - Math.min(1, u / 0.1)) ** 2 + 0.42 * Math.max(0, (u - 0.86) / 0.14) ** 2;
    // destination-in applies to the whole canvas on every paint — painting pillars one by one erases the earlier ones, so gather them into one path and paint once
    let e0 = 0.04, e1 = 0.04;
    g.beginPath();
    for (let x = 0; x < W; x += 2) {
      e0 = Math.min(0.12, Math.max(0, e0 + (rnd() - 0.5) * 0.03));
      e1 = Math.min(0.12, Math.max(0, e1 + (rnd() - 0.5) * 0.03));
      const t = tip(x / W);
      g.rect(x, (e0 + t) * H, 2, Math.max(0, (1 - e0 - e1 - 2 * t) * H));
    }
    g.fill();
    g.globalCompositeOperation = "source-over";
    return cv;
  }

  function getStage() {
    if (stage) return stage;
    if (!window.PIXI) return null;
    const host = document.createElement("div");
    host.className = "fx-ink-stage";
    host.setAttribute("aria-hidden", "true");
    document.body.prepend(host);
    const app = new PIXI.Application({
      width: innerWidth, height: innerHeight, backgroundAlpha: 0, antialias: true,
      resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true,
    });
    host.append(app.view);
    const layer = app.stage.addChild(new PIXI.Container());
    layer.sortableChildren = true;
    const preview = app.stage.addChild(new PIXI.Graphics());
    const program = PIXI.Program.from(vert, frag);
    const sync = () => { layer.y = -scrollY; preview.y = -scrollY; };
    const fit = () => { app.renderer.resize(innerWidth, innerHeight); sync(); };
    addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", fit);
    const colors = inkColors(document.documentElement);
    const inks = colors.map((rgb, i) => {
      const canvas = inkCanvas(rgb, i + 1);
      return { canvas, texture: PIXI.Texture.from(canvas) };
    });
    stage = { app, host, layer, preview, program, inks, sync, ink: 0, size: 100, users: 0 };
    sync();
    // Draw the shader once now so the first brush stroke doesn’t stall while compiling
    const warm = makeStroke([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }], 0, 1);
    layer.addChild(warm.mesh);
    app.renderer.render(app.stage);
    layer.removeChild(warm.mesh);
    warm.mesh.destroy();
    return stage;
  }

  // Fill between points with a Catmull-Rom curve to even half-unit spacing — the rope mesh spreads its pattern in point order, so uneven spacing makes the pattern bunch up
  function smooth(pts, step = 0.5) {
    if (pts.length < 2) return pts;
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const n = Math.max(2, Math.floor(Math.hypot(p2.x - p1.x, p2.y - p1.y) / step));
      for (let k = 0; k < n; k++) {
        const t = k / n, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * (2 * p1.x + (p2.x - p0.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * (2 * p1.y + (p2.y - p0.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * t3),
        });
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  function makeStroke(pts, inkIndex, width) {
    const st = stage;
    const ink = st.inks[inkIndex % st.inks.length];
    const rope = smooth(pts).map((p) => new PIXI.Point(p.x, p.y));
    const geometry = new PIXI.RopeGeometry(width, rope, 0);
    const material = new PIXI.MeshMaterial(ink.texture, { program: st.program, uniforms: { uProgress: 0, uFeather: 0 } });
    const mesh = new PIXI.Mesh(geometry, material);
    return { mesh, material, progress: { value: 0 } };
  }

  // Reads the svg path at 4-unit intervals with the box center as 0 — brush stroke positions are set relative to the center
  const svgNS = "http://www.w3.org/2000/svg";
  function readPath(d) {
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);
    svg.append(path);
    document.body.append(svg);
    const len = path.getTotalLength();
    const n = Math.max(2, Math.floor(len / 4));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const p = path.getPointAtLength((len * i) / n);
      pts.push({ x: p.x, y: p.y });
    }
    svg.remove();
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    return { pts: pts.map((p) => ({ x: p.x - cx, y: p.y - cy })), width: Math.max(...xs) - Math.min(...xs) };
  }

  const nums = (s) => String(s || "").trim().split(/[\s,]+/).map(Number);

  kfFx.register(NAME, (el, { options, reduce }) => {
    if (!window.PIXI || !window.gsap) return;
    const st = getStage();
    if (!st) return;
    st.users++;
    const ease = kfFx.ease(options.ease || EASE, "expo.out");
    const dur = +(options.dur ?? 3);
    const each = +(options.each ?? 0.25);
    const delay = +(options.delay ?? 0);
    const offs = [];
    const done = () => {
      st.users--;
      offs.forEach((f) => f());
    };

    if (options.mode === "pad") return padMode(el, st, { ease, reduce, offs, done });

    const specs = [...el.querySelectorAll('[data-fx-part="stroke"]')].map((s) => ({
      el: s, path: readPath(s.dataset.d || "M0,0 L1,0"), at: nums(s.dataset.at), sp: s.dataset.sp ? nums(s.dataset.sp) : null,
      ink: +(s.dataset.ink ?? 1) - 1, only: s.dataset.only || "",
    }));
    if (!specs.length) return done;
    const narrow = matchMedia("(max-width: 768px)");
    let made = [], tl = null, played = false;

    function build() {
      made.forEach((m) => { st.layer.removeChild(m.mesh); m.mesh.destroy(); });
      made = [];
      const r = el.getBoundingClientRect();
      const vw = innerWidth, vh = innerHeight, c = Math.min(vw, vh);
      const ax = options.x === "box" ? r.left + scrollX : 0;
      const ay = (options.anchor === "top" ? r.top : r.bottom) + scrollY;
      for (const sp of specs) {
        if (sp.only === "sp" && !narrow.matches) continue;
        if (sp.only === "pc" && narrow.matches) continue;
        const [px = 0, py = 0, scale = 1, weight = 80] = narrow.matches && sp.sp ? sp.sp : sp.at;
        const k = sp.path.width > 0 ? (c * scale) / sp.path.width : 1;
        const s = makeStroke(sp.path.pts, sp.ink, weight);
        s.mesh.position.set(ax + (px / 100) * vw, ay + (py / 100) * vh);
        s.mesh.scale.set(k);
        s.mesh.zIndex = 10;
        st.layer.addChild(s.mesh);
        made.push(s);
      }
    }

    const setAll = (v) => made.forEach((m) => { m.progress.value = v; m.material.uniforms.uProgress = v; });

    function play() {
      if (played) return;
      played = true;
      if (reduce) { setAll(1); el.dispatchEvent(new CustomEvent("fx:done")); return; }
      tl = gsap.timeline({ delay, onComplete: () => el.dispatchEvent(new CustomEvent("fx:done")) });
      made.forEach((m, i) => {
        tl.to(m.progress, { value: 1, duration: dur, ease, onUpdate: () => { m.material.uniforms.uProgress = m.progress.value; } }, i * each);
      });
      tl.call(() => el.dispatchEvent(new CustomEvent("fx:near")), [], tl.duration() * 0.8);
    }

    build();
    const refit = () => {
      const t = tl;
      build();
      if (played) setAll(t && t.isActive() ? 0 : 1);
      if (t && t.isActive()) { played = false; t.kill(); play(); }
    };
    let rz = 0;
    const onResize = () => { clearTimeout(rz); rz = setTimeout(refit, 80); };
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    offs.push(() => { removeEventListener("resize", onResize); ro.disconnect(); clearTimeout(rz); });

    const mode = options.play || "enter";
    if (mode === "load") play();
    else if (mode === "manual") {
      el.addEventListener("fx:play", play);
      offs.push(() => el.removeEventListener("fx:play", play));
    } else if (window.ScrollTrigger) {
      const trig = ScrollTrigger.create({ trigger: el, start: options.start || "top top", once: true, onEnter: play });
      offs.push(() => trig.kill());
    } else play();

    offs.push(() => {
      tl?.kill();
      made.forEach((m) => { st.layer.removeChild(m.mesh); m.mesh.destroy(); });
      made = [];
    });
    return done;
  });

  // Drawing board: draw toggles drawing on and off, ink opens the ink picker, clear erases my brush strokes
  function padMode(el, st, { ease, reduce, offs, done }) {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const drawBtn = part("draw"), inkBtn = part("ink"), clearBtn = part("clear"), shelf = part("inks");
    const mine = [];
    const view = st.host;
    const root = document.documentElement;
    let mode = "select";
    const setMode = (m) => {
      mode = m;
      el.dataset.mode = m;
      root.dataset.fxInk = m;
      view.style.pointerEvents = m === "draw" ? "auto" : "none";
      view.style.cursor = m === "draw" ? "crosshair" : "";
      drawBtn?.setAttribute("aria-pressed", String(m === "draw"));
    };
    setMode("select");

    if (shelf) {
      shelf.replaceChildren();
      st.inks.forEach((ink, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "fx-ink-swatch";
        b.setAttribute("aria-label", `Ink ${i + 1}`);
        b.setAttribute("aria-pressed", String(i === st.ink));
        const cv = document.createElement("canvas");
        cv.width = 80; cv.height = 80;
        cv.getContext("2d").drawImage(ink.canvas, 0, 0, 512, 96, -40, 0, 160, 80);
        b.append(cv);
        b.addEventListener("click", () => {
          st.ink = i;
          shelf.querySelectorAll(".fx-ink-swatch").forEach((x, j) => x.setAttribute("aria-pressed", String(j === i)));
        });
        shelf.append(b);
      });
    }

    const onDraw = () => setMode(mode === "draw" ? "select" : "draw");
    const onInk = () => {
      const open = el.dataset.shelf !== "open";
      el.dataset.shelf = open ? "open" : "";
      inkBtn?.setAttribute("aria-expanded", String(open));
      setMode("draw");
    };
    const onClear = () => {
      mine.splice(0).forEach((m) => { st.layer.removeChild(m.mesh); m.mesh.destroy(); });
    };
    drawBtn?.addEventListener("click", onDraw);
    inkBtn?.addEventListener("click", onInk);
    clearBtn?.addEventListener("click", onClear);

    // Starts drawing only after dragging over 50px — a plain press is not turned into a brush stroke. Dot spacing is 4% of brush thickness
    let start = null, path = null, drawing = false;
    const at = (e) => ({ x: e.clientX + scrollX, y: e.clientY + scrollY });
    const down = (e) => { if (mode !== "draw") return; start = at(e); path = [start]; drawing = false; view.setPointerCapture?.(e.pointerId); };
    const move = (e) => {
      if (!start) return;
      const p = at(e);
      if (!drawing && Math.hypot(p.x - start.x, p.y - start.y) > 50) drawing = true;
      if (!drawing) return;
      const last = path[path.length - 1], gap = Math.max(1.5, Math.floor(0.04 * st.size));
      if ((p.x - last.x) ** 2 + (p.y - last.y) ** 2 >= gap * gap) path.push(p);
      const g = st.preview;
      g.clear().lineStyle(2, 0x000000, 0.5).moveTo(path[0].x, path[0].y);
      path.forEach((q) => g.lineTo(q.x, q.y));
    };
    const up = () => {
      if (drawing && path.length > 1) {
        const s = makeStroke(path, st.ink, st.size);
        s.mesh.zIndex = 20 + mine.length;
        st.layer.addChild(s.mesh);
        mine.push(s);
        if (reduce) s.material.uniforms.uProgress = 1;
        else gsap.to(s.progress, { value: 1, duration: 1, ease, onUpdate: () => { s.material.uniforms.uProgress = s.progress.value; } });
      }
      st.preview.clear();
      start = null; path = null; drawing = false;
    };
    view.addEventListener("pointerdown", down);
    view.addEventListener("pointermove", move);
    view.addEventListener("pointerup", up);
    view.addEventListener("pointerleave", up);
    const esc = (e) => { if (e.key === "Escape" && mode === "draw") setMode("select"); };
    addEventListener("keydown", esc);

    offs.push(() => {
      drawBtn?.removeEventListener("click", onDraw);
      inkBtn?.removeEventListener("click", onInk);
      clearBtn?.removeEventListener("click", onClear);
      view.removeEventListener("pointerdown", down);
      view.removeEventListener("pointermove", move);
      view.removeEventListener("pointerup", up);
      view.removeEventListener("pointerleave", up);
      removeEventListener("keydown", esc);
      onClear();
      setMode("select");
      delete root.dataset.fxInk;
      shelf?.replaceChildren();
    });
    return done;
  }
})();
