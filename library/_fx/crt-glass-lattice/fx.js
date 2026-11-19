(() => {
  // Glass panel grid: bakes card images onto one atlas and tiles them endlessly (or only a set number of cells) with a single full-screen shader.
  // The whole plate bulges in the middle like CRT glass, and each card’s edge lens pulls the image in (three colors slightly offset → rainbow rim),
  // Light comes from the side of the hand. A hovered plate grows 4% and becomes an on plate with raised scanlines and contrast. Monochrome (mono) cards are empty noisy channels.
  const VERT = `#version 300 es
in vec2 aPos; out vec2 vUv;
void main(){ vUv = vec2(aPos.x, -aPos.y) * .5 + .5; gl_Position = vec4(aPos, 0., 1.); }`;
  const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 outColor;
uniform vec2 uRes, uPan, uCard, uGap, uCells, uAtlasGrid, uHover, uPointer, uFocus;
uniform float uRadius, uBezel, uRefract, uScreen, uBowY, uCurve, uEdge, uEdgeY, uBgAlpha, uShadow, uCount, uHoverAmt, uTime, uPointAmt, uIntro, uFocusAmt;
uniform vec3 uBg; uniform vec3 uGrow[4]; uniform float uMono[32];
uniform sampler2D uAtlas, uPlain;
float gType = 0.;
const float GROW = .04, FROM = .6, DUR = .72, SPREAD = 1.15, JIT = .24, POP = 1.25, END = 2.2;
const float SNOW = .2, SCAN = .1, ROLL = .07, ROLL_V = .11, FLICK = .08, LINE = .13, LINE_W = .008, GHOST = .24, TUNE = .7, JITTER = .003;
float box(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return min(max(q.x, q.y), 0.) + length(max(q, 0.)) - r; }
float h3(vec3 p){ p = fract(p * vec3(.1031, .103, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.x + p.y) * p.z); }
float arrive(vec2 id, vec2 pitch){
  if (uIntro >= END) return 1.;
  vec2 cc = (id + .5) * pitch - uPan - uRes * .5;
  float reach = clamp(length(cc) / max(length(uRes) * .5, 1.), 0., 1.2);
  float j = fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
  return clamp((uIntro - reach * SPREAD - j * JIT) / DUR, 0., 1.);
}
float pop(float t){ float u = t - 1.; return 1. + (POP + 1.) * u * u * u + POP * u * u; }
float growOf(vec2 c){ float g = 0.; for (int i = 0; i < 4; i++) g += uGrow[i].z * step(abs(c.x - uGrow[i].x) + abs(c.y - uGrow[i].y), .5); return min(g, 1.); }
vec3 art(float i, vec2 uv){
  vec2 cell = vec2(mod(i, uAtlasGrid.x), floor(i / uAtlasGrid.x));
  vec2 at = (cell + clamp(uv, vec2(.002), vec2(.998))) / uAtlasGrid;
  return mix(texture(uAtlas, at).rgb, texture(uPlain, at).rgb, gType);
}
void main(){
  vec2 w = vUv * 2. - 1.;
  vec2 bow = w * vec2(1., uBowY);
  w *= 1. + uScreen * dot(bow, bow);
  vec2 pix = (w * .5 + .5) * uRes;
  vec2 pitch = uCard + uGap;
  vec2 at = pix + uPan;
  vec2 id = floor(at / pitch);
  vec2 p = at - id * pitch - pitch * .5;
  float slot;
  if (uCells.x > .5) {
    slot = id.x + id.y * uCells.x;
    if (id.x < 0. || id.y < 0. || id.x >= uCells.x || id.y >= uCells.y || slot > uCount - .5) { outColor = vec4(uBg * uBgAlpha, uBgAlpha); return; }
  } else slot = mod(mod(id.x * 3. + id.y * 7. + floor(id.y * .5), uCount) + uCount, uCount);
  int idx = int(slot + .5);
  float hot = uHoverAmt * step(abs(id.x - uHover.x) + abs(id.y - uHover.y), .5);
  float isF = step(abs(id.x - uFocus.x) + abs(id.y - uFocus.y), .5);
  float fA = uFocusAmt * isF, away = uFocusAmt * (1. - isF);
  // Original: the flying panel’s title text is erased up to progress .55, leaving only the image
  gType = smoothstep(0., .55, fA);
  float it = arrive(id, pitch);
  p /= min((1. + GROW * growOf(id) * (1. - fA)) * mix(FROM, 1., pop(it)), 1. + GROW * 1.25);
  float rad = mix(uRadius, uCard.x * .035, fA), bez = mix(uBezel, uCard.x * .01, fA), refr = mix(uRefract, uCard.x * .005, fA);
  vec2 hb = vec2(uCard.x, mix(uCard.y, uCard.x * .5625, fA)) * .5;
  float d = box(p, hb, rad);
  vec2 e = vec2(1., 0.);
  vec2 n = normalize(vec2(box(p + e.xy, hb, rad) - box(p - e.xy, hb, rad), box(p + e.yx, hb, rad) - box(p - e.yx, hb, rad)) + 1e-6);
  float lens = pow(1. - clamp(-d / bez, 0., 1.), 2.2);
  vec2 c = p / uCard * 2.;
  float curve = uCurve * (1. - fA);
  c *= 1. + curve * dot(c, c);
  vec2 uv = c * .5 + .5 + (vUv - uPointer) * .016 * hot;
  vec2 pull = -n * lens * (refr / uCard) * (1.55 - hot * .55);
  float mono = uMono[clamp(idx, 0, 31)];
  float tune = mono * (1. - TUNE * hot) * (1. - .5 * fA);
  float fr = floor(uTime * 24.);
  if (tune > 0.) {
    float tear = step(.985, h3(vec3(floor(uv.y * 9.), floor(uTime * 3.), 7.)));
    uv.x += tune * (JITTER * (h3(vec3(floor(uv.y * 140.), fr, 3.)) - .5) + tear * JITTER * 2.5);
  }
  vec3 col = vec3(art(slot, uv + pull * .93).r, art(slot, uv + pull).g, art(slot, uv + pull * 1.08).b);
  col = mix(col, vec3(dot(col, vec3(.2126, .7152, .0722))), mono);
  if (tune > 0.) {
    float snow = h3(vec3(floor(gl_FragCoord.xy / (uCard / vec2(190., 170.))), fr));
    col = mix(col, vec3(snow) * vec3(.93, .96, 1.), SNOW * tune);
    float scan = .5 + .5 * sin(gl_FragCoord.y / uCard.y * 120. * 6.28318);
    float rb = fract(uv.y - uTime * ROLL_V);
    col *= 1. - SCAN * tune * scan;
    col += ROLL * tune * exp(-pow((rb - .5) / .09, 2.));
    col *= 1. + FLICK * tune * (h3(vec3(fr, 1., 2.)) - .5);
    float ln = 0.;
    for (int k = 0; k < 2; k++) { float y0 = 1. - fract(uTime * (k == 0 ? .19 : .31) + slot * .37 + float(k) * .5); float dy = (uv.y - y0) / LINE_W; ln += exp(-dy * dy); }
    col += LINE * tune * ln;
  }
  vec3 surf = normalize(vec3(n * lens * 2.1, .5));
  vec2 rest = vec2(.5 + .07 * sin(uTime * .32), .44 + .05 * cos(uTime * .24));
  vec2 lightUv = mix(rest, uPointer, uPointAmt);
  vec2 aim = (lightUv - .5) * 2.;
  vec3 key = normalize(vec3(-.45 + aim.x * .85, .72 - aim.y * .7, .42));
  col += pow(max(dot(surf, key), 0.), 11.) * .46 + pow(max(dot(surf, normalize(vec3(.55, -.62, .56))), 0.), 9.) * .2 + pow(max(dot(surf, normalize(vec3(.15, .2, .97))), 0.), 22.) * .14;
  vec2 tl = lightUv - vUv;
  float onGlass = 1. - smoothstep(0., 2., d);
  col += exp(-dot(tl, tl) * 14.) * (.035 + hot * .06) * onGlass;
  float band = (vUv.y - lightUv.y) * 1.6 + (vUv.x - lightUv.x) * .25;
  col += exp(-band * band * 22.) * hot * .05;
  col *= 1. + lens * .07;
  col += smoothstep(2.5, 0., abs(d)) * .32;
  col -= smoothstep(bez * .34, 0., abs(d + bez)) * .1;
  col *= 1. - .32 * curve * dot(c, c);
  col *= 1. + hot * .12;
  col += hot * smoothstep(uBezel * 1.6, 0., abs(d)) * .16;
  col *= 1. - hot * .08 * (.5 + .5 * cos(uv.y * uCard.y * 2.2));
  col = (col - .5) * (1. + hot * .16) + .5;
  float aa = clamp(fwidth(d), .75, 2.5);
  float inside = (1. - smoothstep(-aa, aa, d)) * smoothstep(0., .4, it);
  float shade = (1. - smoothstep(0., uRadius * 1.15, box(p + aim * rad * .22, hb, rad))) * (1. - inside) * (1. - fA) * smoothstep(0., .4, it);
  vec3 bg = uBg * (1. - shade * uShadow);
  float bgA = max(uBgAlpha, shade * uShadow);
  float body = inside * (1. - GHOST * mono * (1. - .7 * hot) * (1. - fA));
  vec3 o = mix(bg, col, body);
  float a = mix(bgA, 1., body);
  vec2 ph = (at - (uHover + .5) * pitch) / (1. + GROW * growOf(uHover));
  float dh = box(ph, vec2(uCard.x, uCard.y) * .5, uRadius);
  o += (exp(-abs(dh) / max(uBezel * .16, 1.)) * .18 + exp(-abs(dh) / max(uBezel * 1.1, 1.)) * .06) * uHoverAmt * vec3(.85, .8, 1.);
  float fade = smoothstep(0., uEdge, 1. - abs(vUv.x * 2. - 1.)) * smoothstep(0., uEdgeY, 1. - abs(vUv.y * 2. - 1.));
  o = mix(uBg * uBgAlpha, o, mix(1., fade, 1. - uFocusAmt));
  // Original: the remaining panels all sink into the background by progress .85 — by the time it settles, the film uses the screen alone
  float sink = smoothstep(0., .85, away);
  o = mix(o, uBg * uBgAlpha, sink);
  a = mix(a, uBgAlpha, sink);
  outColor = vec4(o, a);
}`;

  const css = (el, v) => getComputedStyle(el).getPropertyValue(v).trim();
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pctx = probe.getContext("2d", { willReadFrequently: true });
  const rgb = (c) => { pctx.clearRect(0, 0, 1, 1); pctx.fillStyle = c || "transparent"; pctx.fillRect(0, 0, 1, 1); const d = pctx.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };

  // Rotate the skin accent (computed rgb) on the color wheel and set the brightness in hsl — placeholder image color
  const shift = (c, deg, light) => {
    const m = /(\d+(?:\.\d+)?)[ ,]+(\d+(?:\.\d+)?)[ ,]+(\d+(?:\.\d+)?)/.exec(rgbText(c));
    if (!m) return c;
    const [r, gg, b] = [m[1], m[2], m[3]].map((v) => v / 255);
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), d = mx - mn;
    let hh = 0;
    if (d) hh = mx === r ? ((gg - b) / d) % 6 : mx === gg ? (b - r) / d + 2 : (r - gg) / d + 4;
    const sat = d ? d / (1 - Math.abs(mx + mn - 1)) : 0;
    return `hsl(${((hh * 60 + deg) % 360 + 360) % 360} ${Math.round(Math.min(1, sat) * 100)}% ${Math.round(light * 100)}%)`;
  };
  const rgbText = (c) => { pctx.clearRect(0, 0, 1, 1); pctx.fillStyle = c; pctx.fillRect(0, 0, 1, 1); const d = pctx.getImageData(0, 0, 1, 1).data; return `${d[0]} ${d[1]} ${d[2]}`; };

  // One card in one slot of the board: with a photo, cover-fit it, without one, a light-bleed placeholder in the skin color plus a label of what to place, with the name · one line over it.
  function paintCard(g, x, y, w, h, card, el, i, type = true) {
    const bg = css(el, "--kf-raised"), accent = css(el, "--kf-accent"), ink = css(el, "--kf-ink"), dim = css(el, "--kf-dim");
    const sans = css(el, "--kf-font-sans") || "sans-serif", mono = css(el, "--kf-font-mono") || "monospace";
    g.save();
    g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = bg; g.fillRect(x, y, w, h);
    if (card.img && card.img.naturalWidth) {
      const r = Math.max(w / card.img.naturalWidth, h / card.img.naturalHeight);
      g.drawImage(card.img, x + (w - card.img.naturalWidth * r) / 2, y + (h - card.img.naturalHeight * r) / 2, card.img.naturalWidth * r, card.img.naturalHeight * r);
    } else {
      // With no photo, paint the accent color as a two-color glow rotated per card so each panel looks like a different picture.
      const ang = (i * 2.399) % (Math.PI * 2);
      const gx = x + w * (0.5 + 0.32 * Math.cos(ang)), gy = y + h * (0.45 + 0.3 * Math.sin(ang));
      const base = g.createLinearGradient(x, y, x + w, y + h);
      base.addColorStop(0, shift(accent, i * 47, 0.32)); base.addColorStop(1, shift(accent, i * 47 + 70, 0.2));
      g.fillStyle = base; g.fillRect(x, y, w, h);
      const glow = g.createRadialGradient(gx, gy, 0, gx, gy, w * 0.75);
      glow.addColorStop(0, shift(accent, i * 47 + 30, 0.62)); glow.addColorStop(1, "transparent");
      g.globalAlpha = 0.85; g.fillStyle = glow; g.fillRect(x, y, w, h); g.globalAlpha = 1;
      g.strokeStyle = dim; g.globalAlpha = 0.35; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke(); g.globalAlpha = 1;
      if (card.label) { g.fillStyle = dim; g.font = `500 ${Math.round(h * 0.045)}px ${mono}`; g.textAlign = "center"; g.fillText(card.label, x + w / 2, y + h * 0.42, w * 0.9); g.textAlign = "left"; }
    }
    if (!type) { g.restore(); return; }
    const shade = g.createLinearGradient(0, y + h * 0.45, 0, y + h);
    shade.addColorStop(0, "transparent"); shade.addColorStop(1, css(el, "--kf-bg"));
    g.globalAlpha = 0.75; g.fillStyle = shade; g.fillRect(x, y, w, h); g.globalAlpha = 1;
    g.fillStyle = ink;
    g.font = `700 ${Math.round(h * 0.105)}px ${sans}`;
    g.fillText(card.title || "", x + w * 0.14, y + h * 0.7, w * 0.74);
    g.fillStyle = dim;
    g.font = `500 ${Math.round(h * 0.048)}px ${sans}`;
    g.fillText(card.sub || "", x + w * 0.14, y + h * 0.79, w * 0.74);
    g.restore();
  }

  // Original focus curve cubic-bezier(.5, 0, .12, 1) — GSAP’s default named curves have none the same, so solve it directly
  const bezier = (x1, y1, x2, y2) => {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    return (t) => {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      let s = t;
      for (let i = 0; i < 6; i++) { const d = (3 * ax * s + 2 * bx) * s + cx; if (Math.abs(d) < 1e-6) break; s -= (((ax * s + bx) * s + cx) * s - t) / d; }
      s = Math.min(1, Math.max(0, s));
      return ((ay * s + by) * s + cy) * s;
    };
  };
  const FOCUS_EASE = bezier(0.5, 0, 0.12, 1);

  kfFx.register("crt-glass-lattice", (el, { options, reduce, hover }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')].map((a) => ({ a, title: a.dataset.title || a.textContent.trim(), sub: a.dataset.sub || "", label: a.dataset.label || "", mono: a.hasAttribute("data-mono"), img: a.querySelector("img") }));
    if (!cards.length) return;
    const canvas = el.querySelector('[data-fx-part="canvas"]') || el.appendChild(Object.assign(document.createElement("canvas"), { className: "fx-lattice-canvas" }));
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false, antialias: false, alpha: true });
    if (!gl) { el.setAttribute("data-lattice-fallback", ""); return () => el.removeAttribute("data-lattice-fallback"); }
    const o = {
      card: +(options.card ?? 520), ratio: +(options.ratio ?? 0.63), gap: +(options.gap ?? 26), screen: +(options.screen ?? 0.22), curve: +(options.curve ?? 0.04),
      edge: +(options.edge ?? 0.15), edgeY: +(options["edge-y"] ?? 0.18), cols: +(options.cols ?? 0), shadow: +(options.shadow ?? 0.6), friction: +(options.friction ?? 0.94),
      wheel: options.wheel ?? "window", intro: +(options.intro ?? 0), drag: options.drag !== "off", zoom: +(options.zoom ?? 0.72),
    };
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { el.setAttribute("data-lattice-fallback", ""); return () => el.removeAttribute("data-lattice-fallback"); }
    gl.useProgram(prog);
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ["uRes", "uPan", "uCard", "uGap", "uCells", "uAtlasGrid", "uHover", "uPointer", "uFocus", "uRadius", "uBezel", "uRefract", "uScreen", "uBowY", "uCurve", "uEdge", "uEdgeY", "uBgAlpha", "uShadow", "uCount", "uHoverAmt", "uTime", "uPointAmt", "uIntro", "uFocusAmt", "uBg", "uGrow", "uMono", "uAtlas", "uPlain"].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

    // Two boards: the 520×328 card area split into 4 columns — one board with the name letters drawn and one with only the picture (blended when the open board erases the letters)
    const tex = [gl.createTexture(), gl.createTexture()];
    const cols = Math.min(4, cards.length), rows = Math.ceil(cards.length / cols), cw = 520, ch = Math.round(520 * o.ratio);
    const bake = () => {
      [true, false].forEach((type, unit) => {
        const a = document.createElement("canvas");
        a.width = cw * cols; a.height = ch * rows;
        const g = a.getContext("2d");
        cards.forEach((c, i) => paintCard(g, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch, c, el, i, type));
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex[unit]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      });
    };
    bake();
    document.fonts?.ready.then(bake);
    cards.forEach((c) => c.img && !c.img.complete && c.img.addEventListener("load", bake, { once: true }));
    gl.uniform1i(U.uAtlas, 0);
    gl.uniform1i(U.uPlain, 1);
    gl.uniform2f(U.uAtlasGrid, cols, rows);
    gl.uniform1f(U.uCount, cards.length);
    gl.uniform1fv(U.uMono, Float32Array.from({ length: 32 }, (_, i) => (cards[i]?.mono ? 1 : 0)));

    const st = { pan: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, hold: 0, dragging: false, moved: 0, last: null, hover: { x: 1e4, y: 1e4, wx: 1e4, wy: 1e4, amt: 0, on: false }, grow: [], pointer: { x: 0.5, y: 0.5, amt: 0, on: false }, focus: { x: 1e4, y: 1e4, amt: 0, p: 0 }, fly: null, zoom: 1, introAt: 0, k: 1, dpr: 1, W: 0, H: 0, first: true };
    // Endless boards follow screen width (below 640 width×.86 per card, above that width/1850 clamped to .52~.96 then ×1.5 at zoom .72), fixed-cell boards fit the width exactly to the number of columns
    const scaleOf = (w) => (options.scale ? +options.scale : o.cols ? w / (o.cols * (o.card + o.gap)) : (w < 640 ? (w * 0.86) / o.card : Math.min(Math.max(w / 1850, 0.52), 0.96) * 1.5) * o.zoom);
    const size = () => {
      const r = el.getBoundingClientRect();
      st.dpr = Math.min(devicePixelRatio || 1, 1.5);
      const k = scaleOf(r.width);
      if (o.cols) st.first = true;
      if (!st.first && st.k) { const f = k / st.k; st.pan.x = (st.pan.x + st.W / 2) * f - st.W / 2; st.pan.y = (st.pan.y + st.H / 2) * f - st.H / 2; }
      st.k = k;
      // Plate background: if the element background is empty, use the skin background (--kf-bg)
      const own = getComputedStyle(el).backgroundColor;
      st.bg = rgb(/^transparent$|,\s*0\)$/.test(own) ? css(el, "--kf-bg") : own);
      st.W = Math.round(r.width * st.dpr); st.H = Math.round(r.height * st.dpr);
      canvas.width = st.W; canvas.height = st.H;
      const pitch = [(o.card + o.gap) * k * st.dpr, (o.card * o.ratio + o.gap) * k * st.dpr];
      if (st.first) {
        st.first = false;
        if (o.cols) { st.pan.x = (o.cols * pitch[0] - st.W) / 2; st.pan.y = 0; }
        else { st.pan.x = -st.W / 2 + pitch[0] / 2; st.pan.y = -st.H / 2 + pitch[1] / 2; }
      }
    };
    if (o.cols) {
      // A fixed-cell board sets its height to match the cell count
      const fit = () => { const k = scaleOf(el.clientWidth); el.style.height = `${Math.ceil(cards.length / o.cols) * (o.card * o.ratio + o.gap) * k}px`; };
      fit();
      new ResizeObserver(fit).observe(el);
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    // Push the pointer position forward by the same formula as the plate bulge to find the cell — the visible card is the one pressed
    const cellAt = (cx, cy) => {
      const r = el.getBoundingClientRect();
      const u = (cx - r.left) / r.width, v = (cy - r.top) / r.height;
      let wx = u * 2 - 1, wy = v * 2 - 1;
      const by = bowY(), m = 1 + o.screen * (wx * wx + wy * by * wy * by);
      wx *= m; wy *= m;
      const px = (wx * 0.5 + 0.5) * st.W + st.pan.x, py = (wy * 0.5 + 0.5) * st.H + st.pan.y;
      const pw = (o.card + o.gap) * st.k * st.dpr, ph = (o.card * o.ratio + o.gap) * st.k * st.dpr;
      const ix = Math.floor(px / pw), iy = Math.floor(py / ph);
      const lx = px - ix * pw - pw / 2, ly = py - iy * ph - ph / 2;
      const inCard = Math.abs(lx) < (o.card * st.k * st.dpr) / 2 && Math.abs(ly) < (o.card * o.ratio * st.k * st.dpr) / 2;
      let slot = -1;
      if (o.cols) { if (ix >= 0 && iy >= 0 && ix < o.cols && ix + iy * o.cols < cards.length) slot = ix + iy * o.cols; }
      else slot = (((ix * 3 + iy * 7 + Math.floor(iy * 0.5)) % cards.length) + cards.length) % cards.length;
      return { ix, iy, inCard: inCard && slot >= 0, slot, u, v };
    };
    const bowY = () => (st.H > st.W ? Math.min(st.H / st.W, 1.6) : 1);

    const onMove = (e) => {
      if (!hover && e.pointerType === "mouse") return;
      const c = cellAt(e.clientX, e.clientY);
      st.pointer.x = c.u; st.pointer.y = c.v; st.pointer.on = c.u >= 0 && c.u <= 1 && c.v >= 0 && c.v <= 1;
      if (st.dragging && st.last) {
        const dx = e.clientX - st.last.x, dy = e.clientY - st.last.y;
        st.moved += Math.hypot(dx, dy);
        st.pan.x -= dx * st.dpr; st.pan.y -= dy * st.dpr;
        st.vel = { x: -dx * st.dpr, y: -dy * st.dpr };
        st.last = { x: e.clientX, y: e.clientY };
      }
      st.hover.on = c.inCard && !st.dragging;
      if (c.inCard) { st.hover.wx = c.ix; st.hover.wy = c.iy; }
      el.classList.toggle("is-over-card", c.inCard);
    };
    // A plane with dragging turned off still takes presses — releasing within 6px of the press point opens the card
    const onDown = (e) => {
      if (e.button !== 0 || st.focus.amt > 0) return;
      st.down = { x: e.clientX, y: e.clientY };
      if (!o.drag) return;
      st.dragging = true; st.moved = 0; st.last = { x: e.clientX, y: e.clientY }; st.vel = { x: 0, y: 0 };
      if (e.pointerType === "mouse") el.setPointerCapture?.(e.pointerId);
    };
    const onUp = (e) => {
      const was = st.down && st.moved < 6 && Math.hypot(e.clientX - st.down.x, e.clientY - st.down.y) < 6;
      st.dragging = false; st.last = null; st.down = null; st.moved = 0;
      if (was) {
        const c = cellAt(e.clientX, e.clientY);
        if (c.inCard) open(c);
      }
    };
    const onLeave = () => { st.pointer.on = false; st.hover.on = false; el.classList.remove("is-over-card"); };
    const onWheel = (e) => {
      if (st.focus.amt > 0) return;
      let dx = e.deltaX, dy = e.deltaY;
      if (e.deltaMode === 1) { dx *= 16; dy *= 16; } else if (e.deltaMode === 2) { dx *= el.clientWidth; dy *= el.clientHeight; }
      if (e.shiftKey && !dx) { dx = dy; dy = 0; }
      e.preventDefault();
      st.pan.x += dx * st.dpr; st.pan.y += dy * st.dpr;
      st.vel = { x: dx * st.dpr * 0.22, y: dy * st.dpr * 0.22 };
      st.hold = performance.now() + 90;
    };
    // On press, that card grows the whole board scale logarithmically while flying to the box (detail.box of fx:open, otherwise a 16:9 with .15 top·.1 sides), becoming a flat 16:9 board, and the rest sink into darkness
    // Original raises progress linearly over 1.15s (.95s on close) and bends it with cubic-bezier(.5,0,.12,1) — when done it fires fx:opened, and navigates if there is a link
    const place = () => {
      const f = st.fly, a = (st.focus.amt = FOCUS_EASE(st.focus.p));
      if (!f) return;
      st.zoom = Math.exp(Math.log(f.z) * a);
      const pw = (o.card + o.gap) * st.k * st.zoom * st.dpr, ph = (o.card * o.ratio + o.gap) * st.k * st.zoom * st.dpr;
      st.pan.x = (f.ix + 0.5) * pw - (f.m[0] + (f.g[0] - f.m[0]) * a);
      st.pan.y = (f.iy + 0.5) * ph - (f.m[1] + (f.g[1] - f.m[1]) * a);
    };
    let flight = null;
    const open = (c) => {
      const card = cards[c.slot];
      const r = el.getBoundingClientRect();
      const detail = { index: c.slot, href: card.a.getAttribute("href"), box: null };
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true, detail }));
      if (reduce || options.focus === "off") { if (card.a.href && options.follow !== "off") location.href = card.a.href; return; }
      const box = detail.box || { x: r.left + r.width * 0.1, y: r.top + r.height * 0.15, w: r.width * 0.8, h: r.width * 0.8 * 0.5625 };
      const pw = (o.card + o.gap) * st.k * st.dpr, ph = (o.card * o.ratio + o.gap) * st.k * st.dpr;
      st.fly = { ix: c.ix, iy: c.iy, z: box.w / (o.card * st.k), m: [(c.ix + 0.5) * pw - st.pan.x, (c.iy + 0.5) * ph - st.pan.y], g: [(box.x + box.w / 2 - r.left) * st.dpr, (box.y + box.h / 2 - r.top) * st.dpr] };
      st.focus.x = c.ix; st.focus.y = c.iy;
      st.vel = { x: 0, y: 0 };
      st.hover.on = false;
      flight?.kill();
      flight = gsap.to(st.focus, { p: 1, duration: 1.15 * (1 - st.focus.p), ease: "none", onUpdate: place, onComplete: () => { el.dispatchEvent(new CustomEvent("fx:opened", { bubbles: true, detail: { index: c.slot, href: detail.href } })); if (card.a.href && options.follow !== "off") location.href = card.a.href; } });
    };
    const onClose = () => {
      if (!st.fly) return;
      flight?.kill();
      flight = gsap.to(st.focus, { p: 0, duration: 0.95 * st.focus.p, ease: "none", onUpdate: place, onComplete: () => { place(); st.fly = null; st.zoom = 1; st.focus.x = st.focus.y = 1e4; el.dispatchEvent(new CustomEvent("fx:closed", { bubbles: true })); } });
    };
    el.addEventListener("fx:close", onClose);
    const target = o.wheel === "window" ? window : el;
    canvas.addEventListener("pointerdown", onDown);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onLeave);
    if (o.wheel !== "none") target.addEventListener("wheel", onWheel, { passive: false });
    // Reaching a card link on a keyboard-selected slot board turns that board on
    const onFocus = (i) => () => { if (o.cols) { st.hover.wx = i % o.cols; st.hover.wy = Math.floor(i / o.cols); st.hover.on = true; } };
    const focusers = cards.map((c, i) => { const f = onFocus(i); c.a.addEventListener("focus", f); return f; });

    const t0 = performance.now();
    st.introAt = performance.now() + (reduce ? -1e5 : o.intro * 1000);
    const grow = [];
    let last = performance.now(), raf = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!st.dragging && now > st.hold && st.focus.amt === 0) {
        st.pan.x += st.vel.x; st.pan.y += st.vel.y;
        st.vel.x *= o.friction; st.vel.y *= o.friction;
        if (Math.abs(st.vel.x) < 0.02) st.vel.x = 0;
        if (Math.abs(st.vel.y) < 0.02) st.vel.y = 0;
      }
      // On: follows in .65s on entering, .18s on moving, .3s on leaving
      const h = st.hover, moving = h.wx !== h.x || h.wy !== h.y, want = h.on && !moving ? 1 : 0;
      const T = want ? 0.65 : moving ? 0.18 : 0.3;
      h.amt += (want - h.amt) * (1 - Math.exp(-dt / (T / 3)));
      if (moving && h.amt < 0.06) { h.x = h.wx; h.y = h.wy; }
      if (h.on && !grow.some((g) => g.x === h.wx && g.y === h.wy)) grow.push({ x: h.wx, y: h.wy, v: 0, s: 0 });
      grow.forEach((g) => { const tgt = h.on && g.x === h.wx && g.y === h.wy ? 1 : 0; g.s += ((tgt - g.v) * 170 - g.s * 2 * Math.sqrt(170) * 0.9) * dt; g.v += g.s * dt; });
      for (let i = grow.length - 1; i >= 0; i--) if (grow[i].v < 0.001 && !(h.on && grow[i].x === h.wx && grow[i].y === h.wy) && Math.abs(grow[i].s) < 0.01) grow.splice(i, 1);
      while (grow.length > 4) grow.shift();
      st.pointer.amt += ((st.pointer.on ? 1 : 0) - st.pointer.amt) * (1 - Math.exp(-dt / 0.15));
      gl.viewport(0, 0, st.W, st.H);
      gl.uniform2f(U.uRes, st.W, st.H);
      gl.uniform2f(U.uPan, st.pan.x, st.pan.y);
      const cwp = o.card * st.k * st.zoom * st.dpr;
      gl.uniform2f(U.uCard, cwp, cwp * o.ratio);
      gl.uniform2f(U.uGap, o.gap * st.k * st.zoom * st.dpr, o.gap * st.k * st.zoom * st.dpr);
      gl.uniform1f(U.uRadius, cwp * 0.15);
      gl.uniform1f(U.uBezel, cwp * 0.135);
      gl.uniform1f(U.uRefract, cwp * 0.13);
      gl.uniform1f(U.uScreen, o.screen * (1 - st.focus.amt));
      gl.uniform1f(U.uBowY, bowY());
      gl.uniform1f(U.uCurve, o.curve);
      gl.uniform1f(U.uEdge, o.edge * (1 - st.focus.amt));
      gl.uniform1f(U.uEdgeY, o.edgeY * (1 - st.focus.amt));
      gl.uniform2f(U.uCells, o.cols, o.cols ? Math.ceil(cards.length / o.cols) : 0);
      gl.uniform3fv(U.uBg, st.bg);
      gl.uniform1f(U.uBgAlpha, 1);
      gl.uniform1f(U.uShadow, o.shadow);
      gl.uniform2f(U.uHover, h.x, h.y);
      gl.uniform1f(U.uHoverAmt, h.amt);
      const g4 = new Float32Array(12);
      grow.slice(-4).forEach((g, i) => { g4[i * 3] = g.x; g4[i * 3 + 1] = g.y; g4[i * 3 + 2] = Math.max(0, g.v); });
      gl.uniform3fv(U.uGrow, g4);
      gl.uniform1f(U.uTime, reduce ? 0 : (now - t0) / 1000);
      gl.uniform2f(U.uPointer, st.pointer.x, st.pointer.y);
      gl.uniform1f(U.uPointAmt, st.pointer.amt);
      gl.uniform1f(U.uIntro, (now - st.introAt) / 1000);
      gl.uniform2f(U.uFocus, st.focus.x, st.focus.y);
      gl.uniform1f(U.uFocusAmt, st.focus.amt);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);
    const onStart = () => (st.introAt = performance.now());
    el.addEventListener("fx:start", onStart);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); cards.forEach((c, i) => c.a.removeEventListener("focus", focusers[i]));
      canvas.removeEventListener("pointerdown", onDown); removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onLeave); target.removeEventListener("wheel", onWheel); el.removeEventListener("fx:start", onStart); el.removeEventListener("fx:close", onClose); flight?.kill();
      if (!el.querySelector('[data-fx-part="canvas"]')) canvas.remove();
    };
  });
})();
