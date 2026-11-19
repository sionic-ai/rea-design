// One shader that ‹eats into› the boundary between sections — the original transition · intro · preload exit · spiral sections all take this form.
// Spanning the canvas above and below the seam, the previous section’s color (old) trails toward the next (new) with a cell-shaped bubble edge, then
// Eaten away as scrolling goes up. Edges boil at 24 steps per second (boil). The shader is precompiled when set up.
(() => {
  const VERT = `attribute vec2 position; varying vec2 vUv; void main(){ vUv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }`;
  const FRAG = `precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uVh; uniform float uSeam; uniform float uLift; uniform float uBulge;
uniform vec3 uNew; uniform vec3 uOld; uniform vec2 uBleed; uniform float uBoil; uniform float uSeed;
uniform float uEdge; uniform float uCells; uniform float uGrain; uniform float uDots; uniform float uPeaks; uniform float uMound;
uniform float uMode; uniform vec2 uCentre; uniform float uTip; uniform float uWidth; uniform float uSpacing;
uniform sampler2D uPhoto; uniform float uPhotoMix;
float h1(float n){ return fract(sin(n * 127.1 + uSeed * 311.7) * 43758.5453); }
vec2 h2(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p + uSeed) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  float a = h2(i).x, b = h2(i + vec2(1., 0.)).x, c = h2(i + vec2(0., 1.)).x, d = h2(i + vec2(1.)).x;
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
float worley(vec2 p){ vec2 i = floor(p), f = fract(p); float m = 1.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(float(x), float(y)); vec2 o = h2(i + g); m = min(m, length(g + o - f)); }
  return m; }
float peaks(float x){ float v = 0.;
  for (int o = 0; o < 2; o++) { float size = o == 0 ? 2.6 : 1.0, amp = o == 0 ? .65 : .35, off = float(o) * 50.;
    float f = x / (.18 * size), i = floor(f), t = fract(f); t = t * t * (3. - 2. * t);
    v += amp * (mix(h1(i + off), h1(i + off + 1.), t) * 2. - 1.); }
  return v; }
float dome(vec2 d){ float t = clamp((.68 - length(d)) / .498, 0., 1.); t = t * t * (3. - 2. * t); return t * t * t; }
// Boundary shape: if h is below 0 it is the eaten side. Edge band + center mound + two layers of cells + grains, with bubble holes sparse at the front
float eatenSeam(vec2 px){
  vec2 p = vec2(px.x - .5 * uRes.x, px.y - uSeam) / uVh;
  float across = px.x / uRes.x - .5, lead = across / .22;
  float h = p.y + uLift - uPeaks * peaks(p.x + uBoil * .013) - uBulge * exp(-lead * lead);
  if (h < -.16) return 1.;
  vec2 drift = vec2(uBoil * .021, -uBoil * .017);
  float cells = worley(p * 5.2 + drift) * worley(p * 9.4 - drift * 1.3);
  float grain = vnoise(p * 46. + uBoil * 3.1) - .5;
  float band = 1. - smoothstep(-uEdge, uEdge, h);
  float mound = dome(vec2(p.x, h));
  float ahead = smoothstep(0., .28, h);
  float fill = band + uMound * mound * (1. - ahead) + uCells * (1. - cells * 2.2) * (1. - ahead) - uGrain * grain * .35 - uDots * ahead;
  return step(.5, fill);
}
// Spiral type: a brushstroke circling from the center outward grows and thickens up to the end (uTip)
float eatenSpiral(vec2 px){
  vec2 q = (px - uCentre) / uVh;
  vec2 bend = vec2(vnoise(q * 1.6 + 3.1) + .5 * vnoise(q * 3.3 + 1.7), vnoise(q * 1.6 + 9.7) + .5 * vnoise(q * 3.3 + 5.2)) / 1.5 - .5;
  vec2 w = q + .155 * bend;
  float r = length(w);
  float a = atan(w.y, w.x) / 6.28318530718 + uBoil * .0008;
  float turns = r / uSpacing - a, n = floor(turns + .5), along = n + a;
  if (along < 0.) { n += 1.; along += 1.; }
  float d = min(abs(turns - n), r / uSpacing);
  float body = .8 + .4 * vnoise(vec2(along * 2.3, 4.));
  float hw = clamp(min((uTip - along) * .14, along * .55) * body * uWidth, 0., .5 + uEdge / uSpacing);
  if (hw <= 0.) return 0.;
  float hh = (d - hw) * uSpacing;
  float cells = worley(q * 6.1 + uBoil * .02);
  float grain = vnoise(q * 40. + uBoil * 2.3) - .5;
  float band = 1. - smoothstep(-uEdge, uEdge, hh);
  float hug = 1. - smoothstep(uEdge, 4. * uEdge, hh);
  float tip = smoothstep(0., .7, uTip - along);
  return hh < -4. * uEdge ? 1. : step(.5, (band + (uCells * (1. - cells * 1.6) - uGrain * grain) * hug) * tip);
}
void main(){
  vec2 px = vUv * uRes;
  float gone = uMode > .5 ? eatenSpiral(px) : eatenSeam(px);
  float d = px.y - uSeam;
  if (gone > .5) gl_FragColor = vec4(uNew, 1.) * step(-uBleed.x, d);
  else if (d > uBleed.y) gl_FragColor = vec4(0.);
  else gl_FragColor = uPhotoMix > 0. ? vec4(mix(uOld, texture2D(uPhoto, vec2(vUv.x, 1. - vUv.y)).rgb, uPhotoMix), 1.) : vec4(uOld, 1.);
}`;

  // Skin variable colors as rgb 0~1 — even oklch and color-mix computed values are painted on a 1px canvas and read back
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pctx = probe.getContext("2d", { willReadFrequently: true });
  function rgbOf(cssColor) {
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = cssColor;
    pctx.fillRect(0, 0, 1, 1);
    const d = pctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }
  // Like a pin-spacer, if the background is empty, descend to the first child to find it
  const clear = (c) => c === "transparent" || /rgba\([^)]*,\s*0\)$/.test(c);
  const bgOf = (el) => {
    for (let e = el; e; e = e.firstElementChild) { const c = getComputedStyle(e).backgroundColor; if (!clear(c)) return rgbOf(c); }
    return rgbOf(getComputedStyle(document.body).backgroundColor);
  };

  const LOOKS = {
    jagged: { edge: 0.048, cells: 0.36, grain: 0.31, dots: 0.42, peaks: 0.1, mound: 0.226 },
    dissolve: { edge: 0.079, cells: 0.62, grain: 0.34, dots: 0.3, peaks: 0, mound: 0.513 },
  };

  function makeGL(canvas) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {};
    for (const n of ["uRes", "uVh", "uSeam", "uLift", "uBulge", "uNew", "uOld", "uBleed", "uBoil", "uSeed", "uEdge", "uCells", "uGrain", "uDots", "uPeaks", "uMound", "uMode", "uCentre", "uTip", "uWidth", "uSpacing", "uPhoto", "uPhotoMix"]) u[n] = gl.getUniformLocation(prog, n);
    gl.uniform1f(u.uPhotoMix, 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return { gl, u, canvas };
  }

  function draw(ctx, o) {
    const { gl, u, canvas } = ctx;
    const dpr = o.dpr;
    const W = Math.max(1, Math.round(o.w * dpr)), H = Math.max(1, Math.round(o.h * dpr));
    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;
    gl.viewport(0, 0, W, H);
    const look = LOOKS[o.look] || LOOKS.jagged;
    gl.uniform2f(u.uRes, W, H);
    gl.uniform1f(u.uVh, o.vh * dpr);
    gl.uniform1f(u.uSeam, (o.seam ?? 0) * dpr);
    gl.uniform1f(u.uLift, o.lift ?? 0);
    gl.uniform1f(u.uBulge, o.bulge ?? 0);
    gl.uniform3fv(u.uNew, o.colorNew);
    gl.uniform3fv(u.uOld, o.colorOld);
    gl.uniform2f(u.uBleed, (o.bleed?.[0] ?? 2) * dpr, (o.bleed?.[1] ?? 2) * dpr);
    gl.uniform1f(u.uBoil, o.boil ?? 0);
    gl.uniform1f(u.uSeed, o.seed ?? 0);
    gl.uniform1f(u.uEdge, look.edge);
    gl.uniform1f(u.uCells, look.cells);
    gl.uniform1f(u.uGrain, look.grain);
    gl.uniform1f(u.uDots, look.dots);
    gl.uniform1f(u.uPeaks, look.peaks);
    gl.uniform1f(u.uMound, look.mound);
    gl.uniform1f(u.uMode, o.mode === "spiral" ? 1 : 0);
    gl.uniform2f(u.uCentre, (o.centre?.[0] ?? 0) * dpr, (o.centre?.[1] ?? 0) * dpr);
    gl.uniform1f(u.uTip, o.tip ?? 0);
    gl.uniform1f(u.uWidth, o.width ?? 1);
    gl.uniform1f(u.uSpacing, o.spacing ?? 0.3);
    gl.uniform1f(u.uPhotoMix, o.photoMix ?? 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function setPhoto(ctx, source) {
    const { gl, u } = ctx;
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(u.uPhoto, 0);
    return tex;
  }

  window.dySeam = { makeGL, draw, setPhoto, rgbOf, bgOf, LOOKS };
})();
