// Error: one table sheet (1024×512 tile) is drawn once with canvas 2D and put up as a repeat pattern, the shader reads it shifted by the camera position and then lays a CRT lens over it.
// Lens values as in the original — barrel distortion pow(l,2)·.3, color fringe .05·l + fixed .0015, scanline .05, edge 1.8 − l², line slip changing 43 times per second (.1·.2·.3).
// The camera shifts 300px horizontally and 201px vertically when the mouse reaches the screen edge and follows with .92s of weight.
(() => {
  const FRAG = `precision highp float;
uniform sampler2D uTex; uniform vec2 uRes, uCam, uTile; uniform float uT;
uniform vec3 uPaper, uBlob;
float h1(float n){ return fract(sin(n) * 43758.5453); }
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * vnoise(p); p *= 2.03; a *= .5; } return v / .97; }
vec3 field(vec2 uv){
  vec2 px = uv * uRes + uCam;
  vec4 t = texture2D(uTex, px / uTile);
  vec2 cell = floor(px / 4.);
  float b = fbm(cell * 4. / 300. + vec2(uT * .015, 3.));
  float dotm = step(.5, fract(px.x / 4.)) * step(.5, fract(px.y / 4.));
  vec3 base = mix(uPaper, uBlob, step(.58, b) * (.35 + .4 * dotm));
  return mix(base, t.rgb, t.a);
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; uv.y = 1. - uv.y;
  vec2 c = uv - .5; float l = length(c);
  vec2 w = .5 + c * (1. + pow(l, 2.) * .3) + c * pow(l * .7, 3.) * .3;
  float tt = floor(uT * 43.);
  float burst = step(.78, h1(floor(uT * 1.6) * 3.7));
  float row = floor(w.y * 30.);
  float r1 = h1(row * 13.1 + tt), r2 = h1(row * 7.7 + tt * 3.1);
  w.x += burst * step(.72, r1) * (r2 - .5) * (r1 > .93 ? .6 : r1 > .85 ? .4 : .2);
  vec2 d = c * .05 * l + vec2(.0015, 0.);
  vec3 col = vec3(field(w + d).r, field(w).g, field(w - d).b);
  col *= 1. - .05 * 4. * (.5 + .5 * sin(gl_FragCoord.y * 3.14159 / 1.5));
  float l2 = length(c * 2.);
  col *= clamp(1.8 - l2 * l2, 0., 1.);
  if (w.x < 0. || w.x > 1. || w.y < 0. || w.y > 1.) col = vec3(0.);
  gl_FragColor = vec4(col, 1.);
}`;
  // One ticket: two large corner-bracket marks · barcode · small text lines · dotted line. Art color is an ink tone read from the Skin variable
  const drawTicket = (cv, ink, font) => {
    const g = cv.getContext("2d");
    g.clearRect(0, 0, cv.width, cv.height);
    g.fillStyle = ink; g.strokeStyle = ink;
    const mark = (x, y, s) => {
      g.save(); g.translate(x, y); g.scale(s / 100, s / 100);
      g.fill(new Path2D("M46 0H58V34Q58 42 66 42H100V54H66Q46 54 46 34Z")); g.fill(new Path2D("M54 100H42V66Q42 58 34 58H0V46H34Q54 46 54 66Z"));
      g.restore();
    };
    const R = ((s) => () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646)(11);
    const ticket = (x, y) => {
      mark(x, y, 200);
      let bx = x + 230;
      for (let i = 0; i < 44; i++) { const w = 1 + Math.floor(R() * 3); g.fillRect(bx, y + 40, w, 16); bx += w + 1 + Math.floor(R() * 2); }
      g.font = `10px ${font}`;
      const lines = [["Short text", 230, 20], ["0000", 380, 20], ["Label · Label", 470, 20], ["000", 600, 26], ["A table line", 230, 80], ["00:00", 400, 95], ["//", 470, 95],
        ["Label", 600, 95], ["Two lines of", 230, 168], ["text go here", 230, 180], ["0039", 400, 168], ["N/A", 470, 180], ["//", 600, 168]];
      for (const [t, dx, dy] of lines) g.fillText(t, x + dx, y + dy);
      g.setLineDash([2, 3]); g.beginPath(); g.moveTo(x + 230, y + 130); g.lineTo(x + 640, y + 130); g.stroke(); g.setLineDash([]);
      g.fillRect(x + 640, y + 10, 4, 4);
    };
    ticket(70, 40);
    ticket(70 + 512, 40 + 256);
    ticket(70 - 512, 40 + 256);
  };
  UC.page("error", (main) => {
    const cv = main.querySelector(".err__gl");
    const gl = cv?.getContext("webgl", { antialias: false });
    if (!gl) return;
    const reduce = UC.reduce;
    const ac = new AbortController(), on = { signal: ac.signal };
    const probe = document.createElement("i"); probe.style.display = "none"; main.append(probe);
    const g2 = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const col = (v) => { probe.style.color = `var(${v})`; const c = getComputedStyle(probe).color; g2.clearRect(0, 0, 1, 1); g2.fillStyle = c; g2.fillRect(0, 0, 1, 1); const d = g2.getImageData(0, 0, 1, 1).data; return { css: c, v: [d[0] / 255, d[1] / 255, d[2] / 255] }; };
    const tile = document.createElement("canvas");
    tile.width = 1024; tile.height = 512;
    drawTicket(tile, col("--kf-bg").css, getComputedStyle(main).getPropertyValue("--kf-font-mono") || "monospace");
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(gl.getAttribLocation(prog, "a"), 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tile);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const U = (n) => gl.getUniformLocation(prog, n);
    gl.uniform3f(U("uPaper"), ...col("--err-paper").v);
    gl.uniform3f(U("uBlob"), ...col("--err-blob").v);
    gl.uniform2f(U("uTile"), 1024, 512);
    const uRes = U("uRes"), uCam = U("uCam"), uT = U("uT");
    const size = () => { cv.width = innerWidth; cv.height = innerHeight; gl.viewport(0, 0, cv.width, cv.height); };
    size();
    addEventListener("resize", size, on);
    let mx = 0, my = 0, cx = 0, cy = 0, t = 0, last = 0, raf = 0, alive = true;
    addEventListener("pointermove", (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; }, on);
    const frame = (now) => {
      if (!alive) return;
      const dt = last ? Math.max(1, now - last) / 1000 : 1 / 60;
      last = now;
      t += reduce ? 0 : dt;
      const k = reduce ? 1 : 1 - Math.exp(-dt / 0.92);
      cx += (mx * 300 - cx) * k; cy += (my * 201 - cy) * k;
      gl.uniform2f(uRes, cv.width, cv.height);
      gl.uniform2f(uCam, cx + 180, cy + 120);
      gl.uniform1f(uT, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { alive = false; cancelAnimationFrame(raf); ac.abort(); probe.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  });
})();
