(() => {
  // Redraws the text and SVG inside the panel onto a canvas and floats it with WebGL — because CSS can’t bend the whole panel like a lens or make cells jump.
  // DOM text only handles position and accessibility (transparent) and what you see is this single canvas. So the hover band and dot are drawn as graphics, not read from DOM values.
  const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

  // Cursor trail — cool the previous board (keep) and stamp tail → head segments with a Gaussian brush. r=Century, g·b=Direction the lens pulls focus
  const TRAIL = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uPrev;
uniform vec4 uSeg;
uniform vec4 uBrush;
void main() {
  vec4 prev = texture(uPrev, vUv);
  float keep = uBrush.z;
  float was = keep > 0.0 ? prev.r * keep : 0.0;
  vec2 dir = keep > 0.0 ? prev.gb : vec2(0.5);
  vec2 asp = vec2(max(uBrush.w, 0.001), 1.0);
  vec2 head = uSeg.xy * asp;
  vec2 tail = uSeg.zw * asp;
  vec2 p = vUv * asp;
  vec2 span = head - tail;
  float len2 = dot(span, span);
  vec2 near = len2 > 1e-8 ? tail + span * clamp(dot(p - tail, span) / len2, 0.0, 1.0) : tail;
  float d = length(p - near) / max(uBrush.x, 1e-4);
  float add = exp(-d * d) * uBrush.y;
  vec2 pull = clamp((uSeg.xy + uSeg.zw) * 0.5 - vUv, -0.25, 0.25) * 2.0 + 0.5;
  float sum = was + add;
  if (sum < 1e-4) { o = vec4(0.0, 0.5, 0.5, 1.0); return; }
  float lit = 1.0 - (1.0 - clamp(was, 0.0, 1.0)) * (1.0 - clamp(add, 0.0, 1.0));
  o = vec4(lit, (dir * was + pull * add) / sum, 1.0);
}`;

  // Display — at the spots bent by the lens, and while stepping cells, each cell borrows a different cell to draw
  // Fixed cells (chrome) only jostle in some cells on page turn, while the body scatters whole cells and returns them to place
  const SHOW = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uFrame;
uniform sampler2D uTop;
uniform sampler2D uTrail;
uniform vec2 uRes;
uniform vec4 uLens;
uniform vec4 uHop;
uniform vec4 uBox[6];
uniform int uBoxes;
uniform vec4 uCrumb;
uniform float uCrumbP;
bool inBox(vec2 u, vec4 b) { return u.x >= b.x && u.x <= b.z && u.y >= b.y && u.y <= b.w; }
float hash(vec2 c) { return fract(sin(dot(c, vec2(127.1, 311.7))) * 43758.5453); }
bool chrome(vec2 u) {
  for (int i = 0; i < 6; i++) {
    if (i >= uBoxes) break;
    vec4 b = uBox[i];
    if (u.x >= b.x && u.x <= b.z && u.y >= b.y && u.y <= b.w) return true;
  }
  return false;
}
vec2 cells() { return max(floor(uRes / uLens.z), vec2(4.0)); }
vec2 hop(vec2 uv, float p) {
  vec2 n = cells();
  vec2 c = floor(uv * n);
  vec2 f = fract(uv * n);
  float k = clamp((p - hash(c) * uLens.w) / (1.0 - uLens.w), 0.0, 1.0);
  k = 1.0 - pow(1.0 - k, 3.0);
  vec2 jump = floor(vec2(hash(c + 1.7) * 13.0, hash(c + 8.3) * 9.0)) - vec2(6.0, 4.0);
  vec2 at = c + jump * (1.0 - k);
  at = mix(at, floor(at + 0.5), 1.0 - smoothstep(0.55, 1.0, k));
  return (at + f) / n;
}
vec2 lens(vec2 uv) {
  if (uLens.y < 0.001) return uv;
  vec3 t = texture(uTrail, uv).rgb;
  if (t.r < 0.02) return uv;
  vec2 asp = vec2(uRes.x / max(uRes.y, 1.0), 1.0);
  vec2 pull = (t.gb - 0.5) * 0.5 * asp;
  float cap = uLens.x * 1.25;
  float reach = length(pull);
  if (reach > cap) pull *= cap / max(reach, 1e-4);
  return mix(uv, uv + pull / asp, t.r * uLens.y);
}
void main() {
  vec2 z = lens(vUv);
  float p = clamp(uHop.x, 0.0, 1.0);
  bool keep = chrome(vUv);
  vec2 src = z;
  if (uCrumbP < 0.999 && inBox(vUv, uCrumb)) {
    vec2 s = hop(z, clamp(uCrumbP, 0.0, 1.0));
    if (inBox(s, uCrumb)) src = s;
  } else if (p < 0.999) {
    if (uHop.y > 0.5) {
      src = hop(z, p);
    } else if (keep) {
      if (p > 0.001 && hash(floor(z * cells()) + 4.2) < uHop.w) {
        vec2 s = hop(z, p);
        if (chrome(s) && !inBox(s, uCrumb)) src = s;
      }
    } else {
      vec2 s = hop(z, p);
      if (!chrome(s)) src = s;
    }
  }
  src = clamp(src, 0.0, 1.0);
  vec4 base = texture(uFrame, src) * (keep ? 1.0 : uHop.z);
  vec4 top = texture(uTop, src);
  o = top + base * (1.0 - top.a);
}`;

  const quartOut = (t) => 1 - Math.pow(1 - t, 4);
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const seeded = (n) => () => { n = (n * 16807) % 2147483647; return (n - 1) / 2147483646; };

  kfFx.register("lens-trail-page", (el, { options, reduce }) => {
    if (reduce) return;
    const cv = document.createElement("canvas");
    const gl = cv.getContext("webgl2", { premultipliedAlpha: true, antialias: false });
    if (!gl) return;

    const R = +(options.radius ?? 48);
    const STRENGTH = +(options.strength ?? 0.3);
    const FADE = +(options.fade ?? 1.640625);
    const CELL = +(options.cell || 32);
    const STAGGER = +(options.stagger ?? 0.58);
    const INTRO = +(options.intro ?? 0.7) * 1000;
    const SWAP = +(options.swap ?? 0.35) * 1000;
    const HOLD = +(options.hold ?? 280);
    const WIPE = +(options.wipe ?? 0.4) * 1000;
    const DOT_T = +(options["dot-time"] ?? 0.22) * 1000;
    const DOT = +(options.dot ?? 0.8);
    const GROW = +(options.grow ?? 0.55);
    const TWITCH = +(options.twitch ?? 0.15);
    const CRUMB = +(options.crumbs ?? 0.3) * 1000;
    const grid = String(options.grid || "").split(/\s+/).map(Number).filter((v) => v > 1);

    cv.className = "fx-lens-trail-canvas";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    const frame = document.createElement("canvas");
    const top = document.createElement("canvas");
    const fctx = frame.getContext("2d");
    const tctx = top.getContext("2d");

    const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const program = (fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, shader(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, "aPos");
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, ""); u[name] = gl.getUniformLocation(p, name); }
      return { p, u };
    };
    const trailProg = program(TRAIL);
    const showProg = program(SHOW);
    if (!trailProg || !showProg) { cv.remove(); return; }

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const half = !!gl.getExtension("EXT_color_buffer_float");
    const tex = () => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const frameTex = tex();
    const topTex = tex();
    let trail = [];
    let trailW = 0, trailH = 0, trailFresh = true;
    const makeTrail = (w, h) => {
      trail.forEach((t) => { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); });
      trail = [0, 1].map(() => {
        const t = tex();
        if (half) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
        else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        gl.clearColor(0, 0.5, 0.5, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return { tex: t, fb };
      });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      trailW = w; trailH = h; trailFresh = true;
    };

    // Screen size — the canvas is fixed to the window and nothing outside the panel is drawn
    let W = 0, H = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      for (const c of [cv, frame, top]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
      makeTrail(Math.max(64, Math.round(cv.width * 0.5)), Math.max(64, Math.round(cv.height * 0.5)));
      dirty = true;
      wake();
    };

    // Redraw: DOM text, SVG and hover marks onto two 2D canvases (body and top layer)
    const svgCache = new WeakMap();
    const svgImage = (svg, w, h, color) => {
      const key = `${Math.round(w * dpr)}x${Math.round(h * dpr)}|${color}`;
      let c = svgCache.get(svg);
      if (c && c.key === key) return c.ready ? c.img : null;
      const clone = svg.cloneNode(true);
      clone.setAttribute("width", Math.round(w * dpr));
      clone.setAttribute("height", Math.round(h * dpr));
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.style.color = color;
      clone.style.opacity = "1";
      const img = new Image();
      c = { key, img, ready: false };
      svgCache.set(svg, c);
      img.onload = () => { c.ready = true; dirty = true; wake(); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
      return null;
    };

    const range = document.createRange();
    const caseOf = (s, t) => (t === "uppercase" ? s.toUpperCase() : t === "lowercase" ? s.toLowerCase() : s);
    const fontOf = (cs) => `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const seen = (cs) => cs.visibility !== "hidden" && cs.display !== "none";
    const alphaOf = (node) => {
      let a = 1;
      for (let n = node; n && n !== el.parentElement; n = n.parentElement) a *= +getComputedStyle(n).opacity;
      return a;
    };

    // Place a piece of text at the range rectangle — when lines wrap, measure per word
    const drawText = (ctx, node, color, alpha) => {
      const parent = node.parentElement;
      const cs = getComputedStyle(parent);
      if (!seen(cs)) return;
      const raw = node.nodeValue;
      ctx.font = fontOf(cs);
      ctx.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
      ctx.fillStyle = color || cs.color;
      ctx.globalAlpha = alpha;
      const put = (from, to) => {
        range.setStart(node, from);
        range.setEnd(node, to);
        const r = range.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > H) return;
        const s = caseOf(raw.slice(from, to), cs.textTransform);
        const m = ctx.measureText(s);
        const asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
        const mid = r.top + r.height / 2;
        if (stretch === 1) return ctx.fillText(s, r.left, mid + (asc - desc) / 2);
        ctx.save();
        ctx.translate(r.left, mid);
        ctx.scale(1, stretch);
        ctx.fillText(s, 0, (asc - desc) / 2);
        ctx.restore();
      };
      // The original MSDF text is drawn to the line box height so it looks vertically stretched — --fx-stretch stretches only vertically, around the text center
      const stretch = parseFloat(cs.getPropertyValue("--fx-stretch")) || 1;
      const first = raw.search(/\S/);
      if (first < 0) return;
      const end = raw.replace(/\s+$/, "").length;
      range.setStart(node, first);
      range.setEnd(node, end);
      if (range.getClientRects().length <= 1) return put(first, end);
      for (const m of raw.matchAll(/\S+/g)) put(m.index, m.index + m[0].length);
    };
    const textNodes = (root) => {
      const out = [];
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => {
          const p = n.parentElement;
          if (!p || !n.nodeValue.trim() || p.closest("script,style,noscript,svg,[data-fx-part=skip]")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      });
      while (w.nextNode()) out.push(w.currentNode);
      return out;
    };

    const css = (name) => getComputedStyle(el).getPropertyValue(name).trim();
    // The current page·press state may be attached to the band letters or to the link·button wrapping them
    const stateOf = (part, name) => part.getAttribute(name) ?? (part.closest("a,button") || part).getAttribute(name);
    const marks = new Map();
    const dots = new Map();
    const markOf = (part) => {
      let m = marks.get(part);
      if (!m) {
        let h = 7;
        for (const ch of part.textContent) h = (h * 31 + ch.charCodeAt(0)) % 2147483646;
        m = { v: 0, from: 0, to: 0, t0: 0, seed: h || 1 };
        marks.set(part, m);
      }
      return m;
    };
    const dotOf = (part) => {
      let d = dots.get(part);
      if (!d) {
        const side = () => (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.1);
        d = { ox: side(), oy: side(), m: 0.85 + Math.random() * 0.3, v: 0, from: 0, to: 0, t0: 0 };
        dots.set(part, d);
      }
      return d;
    };

    // Current page marker — an uneven band that looks drawn by a marker. Height .62em, extends .12em left and .2em right
    const strike = (ctx, box, em, m) => {
      const rnd = seeded(m.seed);
      const x0 = box.left - 0.12 * em, x1 = box.right + 0.2 * em, cy = box.top + box.height * 0.52, hh = 0.31 * em;
      const n = Math.max(4, Math.round((x1 - x0) / 6));
      ctx.beginPath();
      for (let i = 0; i <= n; i++) ctx.lineTo(x0 + ((x1 - x0) * i) / n, cy - hh + (rnd() - 0.5) * 0.12 * em);
      for (let i = n; i >= 0; i--) ctx.lineTo(x0 + ((x1 - x0) * i) / n, cy + hh + (rnd() - 0.5) * 0.12 * em);
      ctx.closePath();
    };

    let dirty = true;
    const raster = () => {
      const bg = css("--kf-bg");
      for (const ctx of [fctx, tctx]) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      if (grid.length === 2 && W > 768) {
        tctx.fillStyle = css("--fx-grid-dot") || css("--kf-surface");
        const [cols, rows] = grid;
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          tctx.beginPath();
          tctx.arc(W * (0.05 + (0.9 * x) / (cols - 1)), H * (0.05 + (0.9 * y) / (rows - 1)), 1, 0, Math.PI * 2);
          tctx.fill();
        }
      }
      for (const svg of el.querySelectorAll("svg")) {
        if (svg.closest("[data-fx-part=skip]")) continue;
        const r = svg.getBoundingClientRect();
        if (!r.width || !r.height || r.bottom < 0 || r.top > H) continue;
        const cs = getComputedStyle(svg);
        if (!seen(cs)) continue;
        const img = svgImage(svg, r.width, r.height, cs.color);
        if (!img) continue;
        fctx.globalAlpha = alphaOf(svg.parentElement);
        fctx.drawImage(img, r.left, r.top, r.width, r.height);
      }
      const alphas = new Map();
      const alphaFor = (p) => { if (!alphas.has(p)) alphas.set(p, alphaOf(p)); return alphas.get(p); };
      for (const node of textNodes(el)) {
        const a = alphaFor(node.parentElement);
        if (a > 0.001) drawText(fctx, node, null, a);
      }
      // Hover band and current-page band — painted in the text color, with the text inside knocked out in the background color
      for (const part of el.querySelectorAll("[data-fx-part=wipe]")) {
        const m = markOf(part);
        const pressed = stateOf(part, "aria-pressed") === "true";
        const current = stateOf(part, "aria-current") === "page";
        const v = pressed ? 1 : m.v;
        if (v < 0.001 && !current) continue;
        const box = part.getBoundingClientRect();
        if (!box.width) continue;
        const cs = getComputedStyle(part);
        if (!seen(cs)) continue;
        const em = parseFloat(cs.fontSize);
        const a = alphaFor(part);
        fctx.save();
        fctx.globalAlpha = a;
        fctx.fillStyle = cs.color;
        if (current && v < 0.001) strike(fctx, box, em, m);
        else {
          const x0 = box.left - 0.16 * em, x1 = box.right + 0.28 * em, hh = 0.575 * em, cy = box.top + box.height / 2;
          fctx.beginPath();
          fctx.rect(x0, cy - hh, (x1 - x0) * v, hh * 2);
        }
        fctx.fill();
        fctx.clip();
        for (const node of textNodes(part)) drawText(fctx, node, bg, a);
        fctx.restore();
      }
      for (const part of el.querySelectorAll("[data-fx-part=dot]")) {
        const d = dotOf(part);
        const box = part.getBoundingClientRect();
        if (!box.width) continue;
        const cs = getComputedStyle(part);
        if (!seen(cs)) continue;
        const s = Math.max(box.width, box.height);
        const r = (s * DOT * d.m * (1 + d.v * GROW)) / 2;
        const cx = box.left + box.width / 2 + d.ox * s, cy = box.top + box.height / 2 + d.oy * s;
        tctx.save();
        tctx.fillStyle = cs.color;
        tctx.beginPath();
        tctx.arc(cx, cy, r, 0, Math.PI * 2);
        tctx.fill();
        tctx.clip();
        for (const node of textNodes(part)) drawText(tctx, node, bg, 1);
        tctx.restore();
      }
      for (const [c, t] of [[frame, frameTex], [top, topTex]]) {
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      dirty = false;
    };

    // ───── Fixed cells — a spot where only some jiggle when flipping, instead of the whole cell scattering ─────
    let boxes = new Float32Array(24), boxCount = 0;
    const measureBoxes = () => {
      boxCount = 0;
      boxes.fill(0);
      for (const part of el.querySelectorAll("[data-fx-part=chrome]")) {
        if (boxCount >= 6) break;
        const r = part.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        boxes.set([r.left / W, 1 - r.bottom / H, r.right / W, 1 - r.top / H], boxCount * 4);
        boxCount++;
      }
      const c = el.querySelector("[data-fx-part=crumbs]")?.getBoundingClientRect();
      // A line smaller than the cell (32px) leaves no room for the cell to jump — so a band of 8px above and below, and to the panel’s left edge, is taken
      crumbBox = c && c.width ? [0, 1 - (c.bottom + 8) / H, (c.right + 8) / W, 1 - (c.top - 8) / H] : [-1, -1, -1, -1];
    };
    let crumbBox = [-1, -1, -1, -1];

    // Cursor — position follows with exp(-9t), brush size with exp(-6t), and it grows with speed and longer presses
    const ptr = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, on: 0, son: 0, speed: 0, r: R, held: false, timer: 0, lastX: 0, lastY: 0, lastT: 0, had: false };
    const seg = { has: false, px: 0, py: 0, tail: 0, head: 0, stamp: 0, lastStamp: -1, lastR: -1, still: 0 };
    const onMove = (e) => {
      ptr.x = e.clientX / W;
      ptr.y = 1 - e.clientY / H;
      ptr.on = 1;
      if (ptr.had) {
        const dt = Math.max(e.timeStamp - ptr.lastT, 1);
        ptr.speed = Math.max(ptr.speed, Math.min(Math.hypot(e.clientX - ptr.lastX, e.clientY - ptr.lastY) / dt, 3));
      }
      ptr.had = true;
      ptr.lastX = e.clientX; ptr.lastY = e.clientY; ptr.lastT = e.timeStamp;
      wake();
    };
    const onLeave = () => { ptr.on = 0; wake(); };
    const clearHold = () => { if (ptr.timer) clearTimeout(ptr.timer); ptr.timer = 0; };
    const onDown = (e) => {
      if (e.button !== 0) return;
      clearHold();
      if (e.pointerType === "touch") return;
      ptr.timer = setTimeout(() => { ptr.timer = 0; ptr.held = true; wake(); }, HOLD);
    };
    const onUp = (e) => {
      if (e.type !== "pointercancel" && e.button !== 0) return;
      clearHold();
      if (ptr.held) { ptr.held = false; wake(); }
    };

    // ───── Cell hopping — at first the whole plate during INTRO, on transitions SWAP each on exit and on entry (progress is a straight line, each cell eased down by a cube) ─────
    const hopState = { p: 0, from: 0, to: 0, t0: 0, dur: 0, whole: true, run: false, done: null };
    // Breadcrumb — once entry passes 80%, only that cell scatters for CRUMB and gathers again for CRUMB (where the page name changes)
    const crumb = { p: 1, from: 1, to: 1, t0: 0, run: false, queue: [], armed: false };
    const hopTo = (to, dur, whole) => new Promise((done) => {
      if (hopState.done) hopState.done();
      crumb.armed = to === 1 && !whole;
      Object.assign(hopState, { from: hopState.p, to, t0: performance.now(), dur: Math.max(1, dur), whole, run: true, done });
      wake();
    });
    const mainAlpha = () => {
      const p = hopState.p;
      if (p >= 0.999) return 1;
      if (hopState.whole) return Math.max(0, (p - 0.15) / 0.85);
      return (0.35 + 0.65 * p) * smooth(0.03, 0.16, p);
    };

    // ───── Hover — the menu band wipes in from the left over WIPE, and the dot grows by GROW over DOT_T (both 1−(1−t)⁴) ─────
    const tween = (s, to) => { s.from = s.v; s.to = to; s.t0 = performance.now(); wake(); };
    const handlers = [];
    const on = (node, type, fn, opt) => { node.addEventListener(type, fn, opt); handlers.push([node, type, fn, opt]); };
    const bound = new WeakSet();
    const bindParts = () => {
      for (const part of el.querySelectorAll("[data-fx-part=wipe]")) {
        if (bound.has(part)) continue;
        bound.add(part);
        const m = markOf(part);
        const host = part.closest("a,button") || part;
        on(host, "pointerenter", () => { if (stateOf(part, "aria-current") !== "page") tween(m, 1); });
        on(host, "pointerleave", () => tween(m, 0));
        on(host, "focusin", () => { if (stateOf(part, "aria-current") !== "page") tween(m, 1); });
        on(host, "focusout", () => tween(m, 0));
      }
      for (const part of el.querySelectorAll("[data-fx-part=dot]")) {
        if (bound.has(part)) continue;
        bound.add(part);
        const d = dotOf(part);
        const host = part.closest("a,button") || part;
        on(host, "pointerenter", () => tween(d, 1));
        on(host, "pointerleave", () => tween(d, 0));
        on(host, "focusin", () => tween(d, 1));
        on(host, "focusout", () => tween(d, 0));
      }
    };
    const stepTweens = (now) => {
      let moving = false;
      for (const [map, dur] of [[marks, WIPE], [dots, DOT_T]]) {
        for (const s of map.values()) {
          if (s.v === s.to) continue;
          const t = Math.min(1, (now - s.t0) / dur);
          s.v = s.from + (s.to - s.from) * quartOut(t);
          if (t >= 1) s.v = s.to;
          moving = true;
        }
      }
      return moving;
    };

    // ───── One frame ─────
    let raf = 0, last = 0, alive = true, ready = false;
    const wake = () => { if (alive && ready && !raf) { last = 0; raf = requestAnimationFrame(tick); } };
    const tick = (now) => {
      raf = 0;
      const dt = last ? Math.min(Math.max(now - last, 0) / 1000, 0.1) : 1 / 60;
      last = now;
      let busy = false;

      if (stepTweens(now)) { dirty = true; busy = true; }
      if (hopState.run) {
        const t = Math.min(1, (now - hopState.t0) / hopState.dur);
        hopState.p = hopState.from + (hopState.to - hopState.from) * t;
        busy = true;
        if (crumb.armed && t >= 0.8) { crumb.armed = false; crumb.queue.push(0, 1); }
        if (t >= 1) { hopState.run = false; const d = hopState.done; hopState.done = null; d?.(); }
      }
      if (!crumb.run && crumb.queue.length) Object.assign(crumb, { from: crumb.p, to: crumb.queue.shift(), t0: now, run: true });
      if (crumb.run) {
        const t = Math.min(1, (now - crumb.t0) / Math.max(1, CRUMB));
        crumb.p = crumb.from + (crumb.to - crumb.from) * t;
        if (t >= 1) crumb.run = false;
        busy = true;
      }
      if (dirty) { measureBoxes(); raster(); busy = true; }

      // Cursor chase
      const k = 1 - Math.exp(-9 * dt);
      const settled = ptr.sx === ptr.x && ptr.sy === ptr.y && ptr.son === ptr.on;
      if (!settled) {
        ptr.sx += (ptr.x - ptr.sx) * k; ptr.sy += (ptr.y - ptr.sy) * k; ptr.son += (ptr.on - ptr.son) * k;
        if (Math.abs(ptr.x - ptr.sx) < 5e-4) ptr.sx = ptr.x;
        if (Math.abs(ptr.y - ptr.sy) < 5e-4) ptr.sy = ptr.y;
        if (Math.abs(ptr.on - ptr.son) < 5e-4) ptr.son = ptr.on;
      }
      ptr.speed *= Math.exp(-4 * dt);
      if (ptr.speed < 0.001) ptr.speed = 0;
      const want = ptr.held ? R * 2.5 * 1.6 : R * (1 + Math.min(ptr.speed * 0.5, 1.5));
      ptr.r += (want - ptr.r) * (1 - Math.exp(-6 * dt));
      if (Math.abs(want - ptr.r) < 0.1) ptr.r = want;
      const calm = ptr.speed === 0 && ptr.r === want;

      // Trail board: if a node jumps farther than .2, do not connect the line. A stopped cursor rests after two frames and the old trail cools.
      const keep = Math.exp(-FADE * dt);
      const dist = seg.has ? Math.hypot(ptr.sx - seg.px, ptr.sy - seg.py) : 0;
      const jump = !seg.has || dist > 0.2;
      const fromX = jump ? ptr.sx : seg.px, fromY = jump ? ptr.sy : seg.py;
      const moving = seg.has && dist > 8e-4 && dist <= 0.2;
      const stamp = Math.min(Math.max(ptr.son, 0), 1);
      const changed = moving || Math.abs(stamp - seg.lastStamp) > 0.01 || Math.abs(ptr.r - seg.lastR) > 0.05;
      seg.still = changed ? 0 : seg.still + 1;
      seg.px = ptr.sx; seg.py = ptr.sy; seg.has = true; seg.lastStamp = stamp; seg.lastR = ptr.r;
      seg.tail *= keep;
      if (moving) seg.tail = 1;
      seg.head = stamp < 0.01 ? seg.head * keep : 1;
      if (seg.tail < 0.02) seg.tail = 0;
      if (seg.head < 0.02) seg.head = 0;
      const hot = stamp < 0.01 ? seg.tail > 0 || seg.head > 0 : seg.tail > 0 || seg.still < 2;

      if (hot) {
        const [read, write] = trail;
        gl.bindFramebuffer(gl.FRAMEBUFFER, write.fb);
        gl.viewport(0, 0, trailW, trailH);
        gl.useProgram(trailProg.p);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, read.tex);
        gl.uniform1i(trailProg.u.uPrev, 0);
        gl.uniform4f(trailProg.u.uSeg, ptr.sx, ptr.sy, fromX, fromY);
        gl.uniform4f(trailProg.u.uBrush, ptr.r / H, stamp, trailFresh ? 0 : keep, W / Math.max(H, 1));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        trail = [write, read];
        trailFresh = false;
        busy = true;
      }

      if (busy || !settled || !calm) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, cv.width, cv.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(showProg.p);
        [[frameTex, "uFrame"], [topTex, "uTop"], [trail[0].tex, "uTrail"]].forEach(([t, name], i) => {
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.bindTexture(gl.TEXTURE_2D, t);
          gl.uniform1i(showProg.u[name], i);
        });
        gl.uniform2f(showProg.u.uRes, W, H);
        gl.uniform4f(showProg.u.uLens, ptr.r / H, STRENGTH, CELL, STAGGER);
        gl.uniform4f(showProg.u.uHop, hopState.p, hopState.whole ? 1 : 0, mainAlpha(), TWITCH);
        gl.uniform4fv(showProg.u.uBox, boxes);
        gl.uniform1i(showProg.u.uBoxes, boxCount);
        gl.uniform4fv(showProg.u.uCrumb, crumbBox);
        gl.uniform1f(showProg.u.uCrumbP, crumb.p);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      if (busy || !settled || !calm || hot) raf = requestAnimationFrame(tick);
    };

    // ───── Change listeners ─────
    const mark = () => { dirty = true; bindParts(); wake(); };
    const mo = new MutationObserver(mark);
    mo.observe(el, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-current", "aria-pressed", "data-open", "class", "hidden", "style"] });
    const ro = new ResizeObserver(mark);
    ro.observe(el);
    on(window, "resize", size);
    on(window, "scroll", mark, { capture: true, passive: true });
    on(window, "pointermove", onMove, { passive: true });
    on(window, "pointerdown", onDown);
    on(window, "pointerup", onUp);
    on(window, "pointercancel", onUp);
    on(document, "pointerleave", onLeave);
    on(document.fonts, "loadingdone", mark);
    on(el, "fx:leave", () => hopTo(0, SWAP, false).then(() => el.dispatchEvent(new CustomEvent("fx:left", { bubbles: true }))));

    el.classList.add("is-fx-gl");
    bindParts();
    size();
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
    fonts.then(() => {
      if (!alive) return;
      ready = true;
      dirty = true;
      const swap = options.enter === "swap";
      hopState.p = 0;
      hopTo(1, swap ? SWAP : INTRO, !swap);
    });

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      clearHold();
      mo.disconnect();
      ro.disconnect();
      handlers.forEach(([n, t, f, o]) => n.removeEventListener(t, f, o));
      trail.forEach((t) => { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); });
      [frameTex, topTex].forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(quad);
      gl.deleteProgram(trailProg.p);
      gl.deleteProgram(showProg.p);
      cv.remove();
      el.classList.remove("is-fx-gl");
    };
  });
})();
