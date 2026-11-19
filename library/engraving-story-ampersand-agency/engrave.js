/* Engraving renderer — the original draws an engraved figure image (webp) with a WebGL2 shader (erasing horizontal grain · scattering dust · turning away).
   Here, instead of image files, our silhouettes are drawn on canvas (a 17th-century figure in hat, ruffled collar, cloak and boots, a powder flask, a pistol and map, an ampersand)
   Raised the shading as a texture and rebuilt the same shader effect:
     Grain    Tone becomes horizontal engraving line thickness (darker means thicker lines, line spacing period px, the grain waves slightly)
     scan  each line (3px) is dragged sideways at random and fades out (0 = Whole, 1 = Fully erased)
     dust  breaks into pieces at a noise threshold and scatters to the upper right (gunpowder dust)
     turn  rotates the body (horizontal width = |cos|, darker when turned away — the original uses a per-angle image)
   Colors are read from skin variables (--kf-ink · --site-engrave-on-ink). The shader is compiled once at build time. */
(() => {
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function rgb(name) {
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = css(name) || "gray"; c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }

  const VS = `#version 300 es
    in vec2 aPos; uniform vec4 uBox; uniform vec2 uView; uniform float uTurn; out vec2 vUv;
    void main(){
      vUv = aPos;
      float cx = uBox.x + uBox.z * 0.5;
      float x = cx + (aPos.x - 0.5) * uBox.z * uTurn;
      vec2 p = vec2(x, uBox.y + aPos.y * uBox.w);
      gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
    }`;
  const FS = `#version 300 es
    precision highp float;
    in vec2 vUv; out vec4 o;
    uniform sampler2D uTex; uniform vec3 uInk; uniform float uAlpha; uniform float uScan; uniform float uDust; uniform float uPeriod;
    uniform float uT; uniform float uDark; uniform float uFlip; uniform vec4 uBox; uniform float uDpr; uniform float uSolid;
    float h1(float n){ return fract(sin(n * 91.345) * 47453.53); }
    float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
    void main(){
      vec2 uv = vUv;
      if (uFlip > 0.5) uv.x = 1.0 - uv.x;
      float py = gl_FragCoord.y / uDpr;
      float row = floor(py / 3.0);
      float r = h1(row + floor(uT * 2.0) * 0.0);
      float shift = (h1(row * 1.7) - 0.5) * uScan * uScan * 0.9;
      uv.x += shift;
      float n = noise(uv * vec2(70.0, 90.0)) * 0.65 + noise(uv * 12.0) * 0.35;
      vec2 drift = vec2(0.35, -0.6) * uDust * (0.4 + n) * 0.45;
      uv -= drift;
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
      vec4 t = texture(uTex, uv);
      if (t.a < 0.02) discard;
      float lum = clamp(t.r - uDark, 0.0, 1.0);
      float wave = sin(uv.x * 40.0 + uv.y * 6.0) * 0.9 + noise(uv * vec2(8.0, 30.0)) * 1.5;
      float v = fract((py + wave) / uPeriod);
      float w = clamp(1.0 - lum, 0.0, 1.0) * 0.92;
      float edge = fwidth(v) * 1.2;
      float line = 1.0 - smoothstep(w - edge, w + edge, abs(v - 0.5) * 2.0);
      line = mix(line, 1.0 - lum, uSolid);
      float keep = step(uScan * 1.05, r) * step(uDust * 1.1, n * 0.85 + 0.15 * h2(floor(uv * 260.0)));
      float a = line * t.a * uAlpha * keep;
      if (a < 0.01) discard;
      o = vec4(uInk * a, a);
    }`;

  function create(canvas) {
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: true });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(pr, "aPos"); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ["uTex", "uInk", "uAlpha", "uScan", "uDust", "uPeriod", "uT", "uDark", "uFlip", "uBox", "uView", "uTurn", "uDpr", "uSolid"].forEach((k) => { U[k] = gl.getUniformLocation(pr, k); });
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const dpr = Math.min(2, devicePixelRatio || 1);
    let W = 1, H = 1;
    const sprites = [];
    function size() {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }
    size();
    new ResizeObserver(size).observe(canvas);
    function texture(src) {
      const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      return t;
    }
    function add(src, o = {}) {
      const s = Object.assign({ tex: texture(src), aspect: src.width / src.height, x: 0, y: 0, h: 100, alpha: 1, scan: 0, dust: 0, turn: 1, flip: 0, dark: 0, period: 4, solid: 0, ink: "--kf-ink", on: true }, o);
      sprites.push(s);
      return s;
    }
    function render(t) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uView, W, H); gl.uniform1f(U.uT, t); gl.uniform1f(U.uDpr, dpr);
      sprites.forEach((s) => {
        if (!s.on || s.alpha <= 0.001 || s.scan >= 0.999 || s.dust >= 0.999) return;
        const w = s.h * s.aspect;
        gl.bindTexture(gl.TEXTURE_2D, s.tex);
        gl.uniform4f(U.uBox, s.x - w / 2, s.y - s.h, w, s.h);
        gl.uniform1f(U.uTurn, Math.max(0.04, Math.abs(s.turn)));
        gl.uniform1f(U.uFlip, (s.turn < 0) !== !!s.flip ? 1 : 0);
        const ink = s._ink || (s._ink = rgb(s.ink));
        gl.uniform3f(U.uInk, ink[0], ink[1], ink[2]);
        gl.uniform1f(U.uAlpha, s.alpha); gl.uniform1f(U.uScan, s.scan); gl.uniform1f(U.uDust, s.dust);
        gl.uniform1f(U.uPeriod, s.period); gl.uniform1f(U.uDark, s.dark); gl.uniform1f(U.uSolid, s.solid);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      });
    }
    return { add, render, size, get W() { return W; }, get H() { return H; } };
  }

  /* ---- Drawing: shading (white = Paper, Black = ink) is drawn on a 2D canvas ---- */
  function paper(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }
  const gray = (v) => `rgb(${v},${v},${v})`;
  const blank = (a) => `rgba(${255},${255},${255},${a})`;   /* Light and dark paper (no lines) — not a skin color */
  const shade = (x, v) => { x.fillStyle = gray(v); };   /* Tone value (0~255) — not the skin color but the height the shader reads as line thickness */

  /* A 17th-century figure (original conspiracy figure slot) — o: hat height · cloak width · beard · sword */
  function figure(o = {}) {
    const W = 260, H = 720, [c, x] = paper(W, H);
    const hat = o.hat ?? 1, cloak = o.cloak ?? 1, cx = W / 2;
    const vgrad = (y0, y1, a, b) => { const g = x.createLinearGradient(cx - 90, y0, cx + 90, y1); g.addColorStop(0, `rgb(${a},${a},${a})`); g.addColorStop(1, `rgb(${b},${b},${b})`); return g; };
    /* Boots · legs */
    x.fillStyle = vgrad(520, 720, 70, 30);
    x.beginPath(); x.moveTo(cx - 44, 470); x.lineTo(cx - 52, 690); x.lineTo(cx - 70, 712); x.lineTo(cx - 14, 712); x.lineTo(cx - 10, 470); x.fill();
    x.beginPath(); x.moveTo(cx + 10, 470); x.lineTo(cx + 18, 690); x.lineTo(cx + 6, 712); x.lineTo(cx + 64, 712); x.lineTo(cx + 46, 470); x.fill();
    shade(x, 120); x.fillRect(cx - 58, 580, 50, 26); x.fillRect(cx + 10, 580, 50, 26);
    /* Shorts */
    x.fillStyle = vgrad(400, 520, 150, 60);
    x.beginPath(); x.ellipse(cx, 470, 62, 70, 0, 0, Math.PI * 2); x.fill();
    /* Cape */
    x.fillStyle = vgrad(160, 560, 110, 25);
    x.beginPath(); x.moveTo(cx - 40, 165); x.quadraticCurveTo(cx - 110 * cloak, 300, cx - 105 * cloak, 540); x.lineTo(cx - 20, 520); x.lineTo(cx - 6, 190); x.fill();
    x.beginPath(); x.moveTo(cx + 40, 165); x.quadraticCurveTo(cx + 108 * cloak, 300, cx + 98 * cloak, 530); x.lineTo(cx + 22, 510); x.lineTo(cx + 6, 190); x.fill();
    /* Traditional jacket */
    x.fillStyle = vgrad(170, 420, 190, 80);
    x.beginPath(); x.moveTo(cx - 44, 172); x.lineTo(cx - 40, 410); x.lineTo(cx + 40, 410); x.lineTo(cx + 44, 172); x.fill();
    shade(x, 70); for (let i = 0; i < 7; i++) x.fillRect(cx - 2, 190 + i * 30, 4, 10);
    /* Knife */
    if (o.sword !== false) { shade(x, 40); x.save(); x.translate(cx + 30, 380); x.rotate(0.35); x.fillRect(0, 0, 7, 190); x.restore(); }
    /* Pleat Flap */
    shade(x, 245);
    x.beginPath(); x.ellipse(cx, 160, 58, 20, 0, 0, Math.PI * 2); x.fill();
    shade(x, 190); for (let i = 0; i < 12; i++) { x.beginPath(); x.ellipse(cx - 52 + i * 9.5, 162, 3, 14, 0, 0, Math.PI * 2); x.fill(); }
    /* Face · beard */
    x.fillStyle = vgrad(80, 150, 215, 150);
    x.beginPath(); x.ellipse(cx, 112, 30, 40, 0, 0, Math.PI * 2); x.fill();
    if (o.beard !== false) { shade(x, 80); x.beginPath(); x.moveTo(cx - 22, 120); x.quadraticCurveTo(cx, 175, cx + 22, 120); x.lineTo(cx + 16, 136); x.quadraticCurveTo(cx, 150, cx - 16, 136); x.fill(); }
    shade(x, 60); x.fillRect(cx - 14, 104, 8, 3); x.fillRect(cx + 6, 104, 8, 3);
    /* Hat */
    x.fillStyle = vgrad(10, 90, 70, 15);
    x.beginPath(); x.ellipse(cx, 84, 78, 16, -0.05, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.moveTo(cx - 36, 82); x.lineTo(cx - 30, 82 - 70 * hat); x.quadraticCurveTo(cx, 76 - 82 * hat, cx + 32, 82 - 70 * hat); x.lineTo(cx + 38, 82); x.fill();
    shade(x, 150); x.fillRect(cx - 36, 70, 74, 7);
    return c;
  }

  /* Ampersand — one glyph in the wordmark typeface (the original & spot), and if flame, a flame at the end of the lower loop */
  function amp(flame) {
    const S = 900, [c, x] = paper(S, S);
    const font = css("--kf-font-display") || "serif";
    shade(x, 0);
    x.font = `500 ${S * 0.95}px ${font}`;
    x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText("&", S * 0.48, S * 0.56);
    if (flame) {
      x.beginPath(); x.moveTo(S * 0.74, S * 0.86);
      x.bezierCurveTo(S * 0.6, S * 0.74, S * 0.7, S * 0.6, S * 0.76, S * 0.52);
      x.bezierCurveTo(S * 0.78, S * 0.62, S * 0.86, S * 0.64, S * 0.84, S * 0.56);
      x.bezierCurveTo(S * 0.94, S * 0.68, S * 0.9, S * 0.84, S * 0.74, S * 0.86); x.fill();
    }
    return c;
  }

  /* Sky — horizontal-grain band behind the figure (original cf-sky): cloud mass dense in the center, fading toward both ends and top and bottom */
  function sky() {
    const W = 1600, H = 420, [c, x] = paper(W, H);
    shade(x, 255); x.fillRect(0, 0, W, H);
    const blob = (cx, cy, rx, ry, v) => {
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rx);
      g.addColorStop(0, gray(v)); g.addColorStop(1, blank(0));
      x.save(); x.translate(cx, cy); x.scale(1, ry / rx); x.translate(-cx, -cy);
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rx, 0, Math.PI * 2); x.fill(); x.restore();
    };
    let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 26; i++) blob(80 + r() * 1440, 140 + r() * 160, 140 + r() * 260, 30 + r() * 50, 150 + r() * 70);
    const fade = x.createLinearGradient(0, 0, W, 0);
    fade.addColorStop(0, blank(1)); fade.addColorStop(0.12, blank(0)); fade.addColorStop(0.88, blank(0)); fade.addColorStop(1, blank(1));
    x.fillStyle = fade; x.fillRect(0, 0, W, H);
    return c;
  }

  /* Powder keg (original ‹What we offer›·footer area) */
  function barrels() {
    const W = 640, H = 420, [c, x] = paper(W, H);
    const barrel = (bx, by, w, h, rot) => {
      x.save(); x.translate(bx, by); x.rotate(rot);
      const g = x.createLinearGradient(-w / 2, 0, w / 2, 0);
      g.addColorStop(0, gray(40)); g.addColorStop(0.35, gray(210)); g.addColorStop(1, gray(50));
      x.fillStyle = g; x.beginPath(); x.moveTo(-w * 0.42, -h / 2); x.quadraticCurveTo(-w * 0.56, 0, -w * 0.42, h / 2); x.lineTo(w * 0.42, h / 2); x.quadraticCurveTo(w * 0.56, 0, w * 0.42, -h / 2); x.fill();
      shade(x, 30); [-0.38, -0.3, 0.3, 0.38].forEach((k) => x.fillRect(-w * 0.5, h * k, w, 8));
      shade(x, 110); x.beginPath(); x.ellipse(0, -h / 2, w * 0.42, h * 0.08, 0, 0, Math.PI * 2); x.fill();
      shade(x, 200); x.beginPath(); x.ellipse(0, -h / 2, w * 0.36, h * 0.06, 0, 0, Math.PI * 2); x.fill();
      x.restore();
    };
    barrel(220, 230, 220, 300, -0.05);
    barrel(450, 300, 200, 240, 1.4);
    return c;
  }

  /* Pistol and unfolded map (where the original ”We are a brand agency” sits) */
  function pistolMap() {
    const W = 720, H = 360, [c, x] = paper(W, H);
    x.save(); x.translate(360, 190); x.rotate(-0.12);
    shade(x, 225); x.fillRect(-250, -110, 500, 220);
    shade(x, 120); for (let i = -4; i <= 4; i++) { x.fillRect(i * 55, -110, 2, 220); } for (let j = -2; j <= 2; j++) x.fillRect(-250, j * 45, 500, 2);
    shade(x, 90); x.beginPath(); x.ellipse(-250, 0, 24, 112, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(250, 0, 24, 112, 0, 0, Math.PI * 2); x.fill();
    x.restore();
    x.save(); x.translate(330, 130); x.rotate(-0.5);
    const g = x.createLinearGradient(0, -20, 0, 20); g.addColorStop(0, gray(200)); g.addColorStop(1, gray(40));
    x.fillStyle = g; x.fillRect(-240, -12, 300, 24);
    shade(x, 70); x.beginPath(); x.moveTo(60, -16); x.lineTo(130, -26); x.quadraticCurveTo(190, 10, 150, 70); x.lineTo(110, 70); x.quadraticCurveTo(120, 20, 60, 16); x.fill();
    shade(x, 30); x.fillRect(40, -30, 26, 18);
    x.restore();
    return c;
  }

  window.CFEngrave = { create, figure, amp, sky, barrels, pistolMap };
})();
