// Cut out and spin the three figures in the panel with a shader. Each figure spins slightly ahead of or behind the panel center, and limbs bend more around the figure’s own center axis.
// Scroll angle (.22° per px) is the rhythm, and scroll speed becomes the ripple (mv) and twist (tw). The figure is drawn by us on a canvas (it reads the skin color)
window.dhGym = (host) => {
  const cv = document.createElement("canvas");
  const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return null;
  const VERT = "attribute vec2 corner; varying vec2 vUv; void main(){ vUv = corner * .5 + .5; gl_Position = vec4(corner, 0., 1.); }";
  const FRAG = `precision highp float;
uniform sampler2D uA, uB, uC; uniform vec2 uSize; uniform float uMove, uTwist, uBeat; varying vec2 vUv;
vec2 rot(vec2 p, float a) { float c = cos(a), s = sin(a); return vec2(c * p.x - s * p.y, s * p.x + c * p.y); }
vec4 look(sampler2D t, vec2 uv) { if (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) return vec4(0.); return texture2D(t, vec2(uv.x, 1. - uv.y)); }
vec2 pose(vec2 q, float lead, vec2 home, float swing, float wob) {
  vec2 seat = .5 + (home - .5) * 1.12;
  vec2 d = (rot(q, -lead) + .5 - seat) / .9;
  d = rot(d, -swing * (.35 + .65 * smoothstep(0., .24, length(d))));
  d += wob * vec2(sin(d.y * 12. + uBeat * 3.), sin(d.x * 11. - uBeat * 2.6));
  return home + d;
}
void main() {
  float asp = uSize.x / uSize.y;
  vec2 q = (vUv - .5) * vec2(max(asp, 1.), max(1. / asp, 1.)) * 1.16;
  q *= 1. - .08 * (1. - min(dot(q, q) * 4., 1.));
  float la = .08 * sin(uBeat * .9 + .4) - uTwist * .5, lb = .08 * sin(uBeat * 1.2 + 2.3) + uTwist * .4, lc = .07 * sin(uBeat * .7 + 4.4) - uTwist * .3;
  float sa = .5 * sin(uBeat * 2.1 + .3) + uTwist * 1.4, sb = .5 * sin(uBeat * 1.7 + 2.1) - uTwist * 1.3, sc = .46 * sin(uBeat * 2.5 + 4.) + uTwist * 1.2;
  float wob = .006 + .014 * uMove;
  vec4 a = look(uA, pose(q, la, vec2(.632, .655), sa, wob));
  vec4 b = look(uB, pose(q, lb, vec2(.370, .651), sb, wob));
  vec4 c = look(uC, pose(q, lc, vec2(.514, .288), sc, wob));
  vec4 o = a;
  o = b + (1. - b.a) * o;
  o = c + (1. - c.a) * o;
  gl_FragColor = o;
}`;
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null; };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(prog, "corner");
  gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // One person: torso (accent-color skin) · head (text color) · limbs (surface color) — drawn at the spot (home) where the person stood in the original panel
  const css = getComputedStyle(document.documentElement), col = (n) => css.getPropertyValue(n).trim();
  const people = [
    { home: [.632, .655], ang: -0.5, arms: [2.4, 2.0], legs: [-0.2, 0.3] },
    { home: [.370, .651], ang: 0.9, arms: [-2.2, -1.6], legs: [0.4, -0.1] },
    { home: [.514, .288], ang: 2.6, arms: [1.6, 2.6], legs: [-0.4, 0.2] },
  ];
  const S = 256;
  people.forEach((p, i) => {
    const c = document.createElement("canvas"); c.width = c.height = S;
    const g = c.getContext("2d");
    g.translate(p.home[0] * S, p.home[1] * S); g.rotate(p.ang); g.scale(1.45, 1.45); g.lineCap = "round";
    const limb = (a, len, w) => { g.strokeStyle = col("--kf-raised"); g.lineWidth = w; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * len, Math.sin(a) * len); g.stroke(); g.strokeStyle = col("--kf-line"); g.lineWidth = 1; g.stroke(); };
    g.save(); g.translate(0, -10); p.arms.forEach((a) => limb(a, 22, 4.2)); g.restore();
    g.save(); g.translate(0, 10); p.legs.forEach((a) => limb(Math.PI / 2 + a, 30, 5)); g.restore();
    g.fillStyle = col("--kf-accent"); g.beginPath(); g.ellipse(0, 0, 6, 13, 0, 0, 7); g.fill();
    g.fillStyle = col("--kf-raised"); g.beginPath(); g.arc(0, -19, 5, 0, 7); g.fill();
    g.fillStyle = col("--kf-ink"); g.beginPath(); g.arc(0, -21, 5, Math.PI, 0); g.fill();
    gl.activeTexture(gl.TEXTURE0 + i);
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]].forEach(([k, v]) => gl.texParameteri(gl.TEXTURE_2D, k, v));
    gl.uniform1i(U(["uA", "uB", "uC"][i]), i);
  });
  host.appendChild(cv);

  let beat = 0, prev = null, move = 0, twist = 0;
  return {
    // Takes the scroll angle in degrees and draws it — changes in the angle become ripple and twist, then slowly settle
    draw(angle) {
      const d = prev == null ? 0 : angle - prev;
      prev = angle;
      move += .08 * (Math.min(1, Math.abs(d) / 2.5) - move);
      twist += .1 * (Math.max(-.3, Math.min(.3, .05 * d)) - twist);
      beat = angle * Math.PI / 180;
      const dpr = Math.min(2, devicePixelRatio || 1), w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
      if (!w || !h) return;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U("uSize"), w, h); gl.uniform1f(U("uMove"), move); gl.uniform1f(U("uTwist"), twist); gl.uniform1f(U("uBeat"), beat);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
  };
};
