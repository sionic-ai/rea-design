/* About: pattern band between lines. As in the original, a single WebGL canvas (.gradient, opacity .5) covering the whole about cell draws it, and only the band box (.about__contents__canvas) is left visible by a mask.
   The shader is our own — a field where three colors swirl and flow is sampled once per cell (10px device pixels), picks one of 12 glyph levels by brightness, and paints only the glyph pixels.
   Flow values match the original control panel defaults (speed .5, 8 wraps, three color multipliers 1.2/1.2/.8, wobble .15). Band placement (paragraph number, front and back, left and right, cell count) follows the original layout table exactly. */
window.sh.page("about", ({ on, tick }) => {
  const { reduce } = window.sh;
  const box = document.querySelector(".about__contents__description");
  const layer = document.querySelector(".gradient");
  if (!box || !layer) return;
  const lines = (box.dataset.message || "").split("\n").filter((l) => l.trim());
  const PLAN = [
    { index: 0, when: "before", side: "left", size: 1 },
    { index: 0, when: "after", side: "right", size: 1 },
    { index: 2, when: "before", side: "left", size: 3 },
    { index: 2, when: "after", side: "right", size: 5 },
    { index: 3, when: "after", side: "left", size: 2 },
    { index: 4, when: "after", side: "right", size: 3 },
  ];
  const kv = (side, size) => {
    const s = document.createElement("span");
    s.className = `about__contents__kv about__contents__kv--${side}`;
    s.style.setProperty("--width-size", String(size));
    s.innerHTML = '<span class="about__contents__canvas"></span>';
    return s;
  };
  box.replaceChildren();
  lines.forEach((l, i) => {
    PLAN.filter((p) => p.index === i && p.when === "before").forEach((p) => box.appendChild(kv(p.side, p.size)));
    box.appendChild(document.createTextNode(l));
    PLAN.filter((p) => p.index === i && p.when === "after").forEach((p) => box.appendChild(kv(p.side, p.size)));
    if (i < lines.length - 1) box.appendChild(document.createElement("br"));
  });

  const cv = document.createElement("canvas");
  cv.style.cssText = "display:block;width:100%;height:100%";
  layer.replaceChildren(cv);
  const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: false });
  if (!gl) return;

  // 12-step glyphs (blank → solid #) — 5×7 cells, a bitmap we drew ourselves. Uploaded as a one-row glyph texture
  const GLYPHS = [
    [".....", ".....", ".....", ".....", ".....", ".....", "....."],
    [".....", ".....", ".....", ".....", ".....", "..#..", "....."],
    [".....", ".....", "..#..", ".....", ".....", "..#..", "....."],
    [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
    [".....", ".....", ".###.", ".....", ".###.", ".....", "....."],
    [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
    [".....", ".....", ".###.", "#...#", "#...#", ".###.", "....."],
    [".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "....."],
    ["##..#", "##.#.", "..#..", ".#...", "#..##", "...##", "....."],
    [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
    [".###.", "#...#", "#.###", "#.#.#", "#.###", "#....", ".####"],
    [".#.#.", ".#.#.", "#####", ".#.#.", "#####", ".#.#.", ".#.#."],
  ];
  const atlas = new Uint8Array(GLYPHS.length * 5 * 7);
  GLYPHS.forEach((g, k) => g.forEach((row, y) => [...row].forEach((c, x) => { atlas[y * GLYPHS.length * 5 + k * 5 + x] = c === "#" ? 255 : 0; })));

  const VERT = "attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }";
  const FRAG = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uTime, uCell;
    uniform vec3 uInk0, uInk1, uInk2;
    uniform vec4 uBox[10];
    uniform int uBoxes;
    uniform sampler2D uGlyphs;
    const float SPEED = 0.5;
    const vec3 GAIN = vec3(1.2, 1.2, 0.8);
    const float WOBBLE_RATE = 0.5, WOBBLE = 0.15, STEPS = 12.0;

    bool covered(vec2 px) {
      for (int i = 0; i < 10; i++) {
        if (i >= uBoxes) break;
        vec4 b = uBox[i];
        if (px.x >= b.x && px.x <= b.x + b.z && px.y >= b.y && px.y <= b.y + b.w) return true;
      }
      return false;
    }

    // On coordinates with the shorter side set to -1~1, two values (winding and phase) are fed into each other eight times so they swirl
    vec3 flow(vec2 uv) {
      vec2 q = (uv * 2.0 - 1.0) * uRes / min(uRes.x, uRes.y);
      float turn = 0.0, phase = -uTime * SPEED;
      for (int k = 0; k < 8; k++) {
        float fk = float(k);
        turn += cos(fk - phase - turn * q.x);
        phase += sin(q.y * fk + turn);
      }
      phase += uTime * SPEED;
      vec3 mixw = 0.5 + 0.5 * cos(vec3(phase, turn, turn + phase) * GAIN);
      mixw /= mixw.x + mixw.y + mixw.z;
      vec3 col = uInk0 * mixw.x + uInk1 * mixw.y + uInk2 * mixw.z;
      return col * (1.0 + sin(phase * WOBBLE_RATE) * sin(turn * WOBBLE_RATE) * WOBBLE);
    }

    void main() {
      vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
      if (!covered(px)) { gl_FragColor = vec4(0.0); return; }
      vec2 cell = floor(gl_FragCoord.xy / uCell);
      vec2 inCell = fract(gl_FragCoord.xy / uCell);
      vec3 col = flow((cell * uCell + uCell * 0.5) / uRes);
      float k = clamp(floor(dot(col, vec3(0.299, 0.587, 0.114)) * STEPS), 0.0, STEPS - 1.0);
      // Position within a cell as 5×7 font-grid pixels — texture rows start at 0 on top, so flip vertically
      vec2 g = floor(vec2(inCell.x * 5.0, (1.0 - inCell.y) * 7.0));
      float on = texture2D(uGlyphs, vec2((k * 5.0 + g.x + 0.5) / (STEPS * 5.0), (g.y + 0.5) / 7.0)).r;
      gl_FragColor = on > 0.5 ? vec4(col, 1.0) : vec4(0.0);
    }`;
  const shader = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(ap);
  gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, GLYPHS.length * 5, 7, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, atlas);
  [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach((f) => gl.texParameteri(gl.TEXTURE_2D, f, gl.NEAREST));
  [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach((w) => gl.texParameteri(gl.TEXTURE_2D, w, gl.CLAMP_TO_EDGE));
  const U = (n) => gl.getUniformLocation(prog, n);
  // The three colors come from skin variables — with the original skin, red #BE3F39 · navy #37447B · beige #F4E0C2
  ["--site-pattern-red", "--site-pattern-blue", "--site-pattern-beige"].forEach((v, i) => {
    const [r, g, b] = window.sh.rgb(v).match(/\d+/g).map(Number);
    gl.uniform3f(U(`uInk${i}`), r / 255, g / 255, b / 255);
  });
  gl.uniform1i(U("uGlyphs"), 0);

  const masks = () => [...document.querySelectorAll(".about__contents__canvas")].slice(0, 10);
  const size = () => {
    const dpr = devicePixelRatio || 1, r = layer.getBoundingClientRect();
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    gl.viewport(0, 0, cv.width, cv.height);
    gl.uniform2f(U("uRes"), cv.width, cv.height);
    // Glyph cell is 10px device pixel — on high-res screens the text is finer, like the original
    gl.uniform1f(U("uCell"), 10);
    const m = masks();
    m.forEach((el, i) => { const b = el.getBoundingClientRect(); gl.uniform4f(U(`uBox[${i}]`), (b.left - r.left) * dpr, (b.top - r.top) * dpr, b.width * dpr, b.height * dpr); });
    gl.uniform1i(U("uBoxes"), m.length);
  };
  const t0 = performance.now();
  const draw = () => {
    gl.uniform1f(U("uTime"), reduce ? 0 : (performance.now() - t0) / 1000);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  size();
  draw();
  const ro = new ResizeObserver(() => { size(); draw(); });
  ro.observe(layer);
  ro.observe(box);
  on(window, "resize", () => { size(); draw(); });
  if (!reduce) tick(draw);
  return () => { ro.disconnect(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
});
