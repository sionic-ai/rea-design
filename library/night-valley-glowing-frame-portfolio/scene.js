// Scene — redrawn with our own shaders in place of the original’s hand-built WebGL (SDF logo frame·sparks over a night valley photo, rainbow floor below the work section).
// Doesn’t use the original shader or artwork, only the measured positions, sizes and tones of the screen are carried over. Colours are read from Skin variables.
(() => {
  const VERT = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

  const COMMON = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uTime;
out vec4 o;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= .5; } return v; }
float sdRound(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
`;

  // Maps the on-ground screen position to world position — camera height 2 · focal 1.37 (relative to screen height 1), horizon GROUND_HZ. The sides are valley walls so even the same height feels closer (wall rise .2, same Type as the ridge).
  // The original lamp is set in world units (radius 2, height .5, 4~14 from far), so drawing light only by screen position under-lights the near ground (bottom of the screen)
  const GROUND_HZ = 0.34, CAM_HF = 2.74, CAM_F = 1.37;
  const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

  // Hero — sky (background color toward the top) · moon · stars · two ridges (the distant ridge is mist, the near valley has rock grain) · logo frame (two overlapping rounded squares with a window cut out) · cursor lamp · light cast on the ground by sparks ·
  // In-window refraction (pulls and bends the scene behind it). Sparks are drawn separately by POINTS
  const SCENE = COMMON + `
uniform vec2 uMouse, uHover; uniform float uScroll, uIntro, uSpin;
uniform vec3 uBg, uSky, uRock, uGlow, uSparkA, uSparkB, uInk;
uniform vec3 uLamp;      // Screen position x·y, strength (on × motion × far-blur × 2.8)
uniform vec3 uLampCol;
uniform sampler2D uPLight; // Light map cast on the ground by sparks (screen coordinates) — only sparks that come close to the ground light the surrounding rocks
uniform float uPLightMax, uPLightScale;
vec3 groundAt(vec2 q, float hz){ float z = ${CAM_HF} / max(hz + .2 * smoothstep(.05, .95, abs(q.x)) - q.y, .03); return vec3(q.x * z / ${CAM_F}, 0., z); }
// Same form as the original lamp: inverse-square-like falloff with radius 2, plus Lambert, plus a sparkle reduced by roughness (.45)
vec3 lampLight(vec2 q, float hz, vec3 n, vec3 albedo){
  if (uLamp.z < .001) return vec3(0.);
  vec3 L = groundAt(uLamp.xy, hz) + vec3(0., .5, 0.) - groundAt(q, hz);
  float dist = length(L);
  vec3 l = L / max(dist, 1e-4);
  float att = uLamp.z / pow(1. + dist * dist / 4., 2.);
  float diff = max(dot(n, l), 0.);
  float spec = pow(max(dot(n, normalize(l + vec3(0., .6, -.8))), 0.), 14.) * .3 * .45;
  return (albedo * diff + spec) * uLampCol * uLampCol * att;
}
float ridge(float x, float base, float rise, float f, float amp){ return base + rise * smoothstep(.05, .95, abs(x)) + amp * (fbm(vec2(x * f, 3.1)) - .5); }
float logoSd(vec2 q){
  float a = sdRound(q - vec2(-.022, .016), vec2(.165, .112), .055);
  float b = sdRound(q - vec2(.022, -.016), vec2(.165, .112), .055);
  float hole = sdRound(q, vec2(.104, .05), .028);
  return max(min(a, b), -hole);
}
float holeSd(vec2 q){ return sdRound(q, vec2(.104, .05), .028); }
// Showreel slot in the window — the original always projects a showreel video at 5% on the window surface and brightens it to 60% when a hand is on the logo. Instead of video, our own artwork: light rays fanning out from top center and a slowly drifting warm band
vec3 reel(vec2 q, float t){
  vec2 c = q - vec2(0., .06);
  float a = atan(c.x, -c.y);
  float rays = pow(.5 + .5 * sin(a * 26. + sin(a * 7. + t * .4) * 2.), 6.) * exp(-length(c) * 9.);
  float band = .5 + .5 * sin(q.y * 40. - t * 1.3 + fbm(q * 12. + t * .1) * 3.);
  return mix(uBg, uGlow, .18 + .25 * band) + uInk * rays * .6;
}
// Like the original, if the light sum is below half the max it stays nearly as is, and only the part over is softly pressed so hot spots on the stone don’t burn white
vec3 sparkLight(vec2 uv){
  vec3 l = textureLod(uPLight, uv, 0.).rgb * uPLightScale;
  float pk = max(l.r, max(l.g, l.b));
  return l / pow(1. + pow(pk / uPLightMax, 3.), 1. / 3.);
}
// Sky·moon·stars·three ridges — refraction inside the window also reads the bent spot with the same function
vec3 backdrop(vec2 p, float cam, vec2 m, out float onRock, out float bump, out float far){
  float asp = uRes.x / uRes.y;
  vec2 fc = p * uRes.y + .5 * uRes;
  // Sky
  float hy = p.y + .5 + cam * .55;
  vec3 col = mix(uSky * 1.25, uBg, smoothstep(.45, 1.15, hy));
  col = mix(col, uSky * 1.6, smoothstep(.62, .42, hy) * .55);
  vec2 sc = floor(fc / 2.2);
  float star = step(.9965, hash(sc)) * (.55 + .45 * sin(uTime * 1.7 + hash(sc + 3.) * 40.));
  col += uInk * star * .7 * smoothstep(.45, .95, hy);
  // Moon
  vec2 mc = vec2(-.24 * asp, .31 + cam * .55) + m * .006;
  float md = length(p - mc);
  col = mix(col, uInk * .96, smoothstep(.031, .027, md));
  col += uSky * 1.8 * exp(-md * 9.) * .35 + uInk * exp(-md * 26.) * .18;
  // Distant ridge (misty mountains
  float sx = p.x + m.x * .012;
  float yFar = ridge(sx, .08, .16, 2.2, .1) - cam * .9;
  far = smoothstep(yFar + .004, yFar - .004, p.y);
  vec3 farCol = mix(uRock * .55, uSky * 1.25, .55) * (.75 + .35 * fbm(p * vec2(9., 14.)));
  col = mix(col, farCol, far);
  // Near valley — rocky slope low in the middle and rising on both sides
  float nx = p.x + m.x * .022;
  float yNear = ridge(nx, -.02, .2, 3.4, .07) - cam * 1.05;
  float near = smoothstep(yNear + .003, yNear - .003, p.y);
  float rock = fbm(vec2(nx * 9., p.y * 16. + 4.)) * .7 + fbm(vec2(nx * 34., p.y * 50.)) * .3;
  float lit = .45 + 1.1 * rock * (.6 + .4 * smoothstep(-.4, .1, p.y + cam));
  vec3 nearCol = uRock * lit;
  nearCol = mix(nearCol, uSky * 1.3, smoothstep(yNear - .25, yNear, p.y) * .35);
  nearCol *= .6 + .4 * smoothstep(-.6, .0, p.y + cam);
  col = mix(col, nearCol, near);
  // Front rock — big mass at the bottom
  float yFront = -.36 + .06 * (fbm(vec2(nx * 2.4 + 7., 1.)) - .5) - cam * 1.25;
  float front = smoothstep(yFront + .004, yFront - .004, p.y);
  float frontRock = fbm(vec2(nx * 6., p.y * 7.));
  col = mix(col, uRock * (.25 + .45 * frontRock), front);
  onRock = max(near, front);
  bump = mix(rock, frontRock, front);
  return col;
}
void main(){
  vec2 fc = gl_FragCoord.xy, uv = fc / uRes;
  vec2 p = (fc - .5 * uRes) / uRes.y;
  vec2 m = uMouse;
  float cam = uScroll;
  float onRock, bump, far;
  vec3 col = backdrop(p, cam, m, onRock, bump, far);
  // Cursor lamp — a warm point light .5 above the ground beneath the cursor. In the original it is all rock to the horizon, so distant ridges light up too
  float hz = ${GROUND_HZ} - cam * 1.05;
  vec3 n = normalize(vec3(-dFdx(bump) * 9., 1., dFdy(bump) * 9.));
  vec3 albedo = uRock * (.5 + bump);
  col += lampLight(p, hz, n, albedo) * max(onRock, far);
  // Ember light — the original adds light multiplied by the rock color
  col += sparkLight(uv) * albedo * onRock;
  // Logo frame — grows and turns on on load, and shrinks while moving up with scroll. Opening ”Credits” spins it on the vertical axis (uSpin 1 = One lap)
  float s = mix(.6, 1., uIntro) * (1. - .25 * clamp(cam, 0., 1.));
  vec2 lc = vec2(0., .042 + cam * 1.15) + m * .01;
  float turn = max(abs(cos(uSpin * 6.2832)), .06);
  // Hand over: the logo scales to 1.1x, fast horizontally (10/s) and slow vertically (6/s)
  vec2 hs = 1. + .1 * uHover;
  vec2 lq = (p - lc) / s / hs;
  lq.x /= turn;
  float d = logoSd(lq) * s * turn * hs.y;
  float inside = smoothstep(.0015, -.0015, d);
  float holeD = holeSd(lq) * s;
  float inHole = smoothstep(.002, -.002, holeD) * uIntro;
  // Window — like thick glass, magnifies the scene behind 1.3x and bends it downward (rock floor). Bends more at rounded edges, and the scene inside the window shifts beyond the frame following the mouse
  if (inHole > .001) {
    vec2 e = vec2(.002, 0.);
    vec2 g = vec2(holeSd(lq + e.xy) - holeSd(lq - e.xy), holeSd(lq + e.yx) - holeSd(lq - e.yx));
    g /= max(length(g), 1e-4);
    float bevel = smoothstep(-.035, 0., holeD / s);
    vec2 rp = lc + (p - lc) * .76 + vec2(0., -.11) - m * .03 - g * bevel * bevel * .045;
    float r1, r2, r3;
    vec3 seen = backdrop(rp, cam, m, r1, r2, r3);
    vec3 ra = uRock * (.5 + r2);
    seen += lampLight(rp, hz, vec3(0., 1., 0.), ra) * max(r1, r3);
    seen += sparkLight(clamp(vec2(rp.x * uRes.y / uRes.x, rp.y) + .5, 0., 1.)) * ra * r1;
    vec3 win = seen * mix(vec3(.5), uGlow * .8, .6) + uGlow * .03;
    win += uGlow * exp(holeD * 60.) * .35;
    win += uInk * pow(bevel, 6.) * .1;
    win = mix(win, reel(lq, uTime), .05 + .55 * uHover.x);
    col = mix(col, win, inHole);
  }
  vec3 body = mix(uGlow, uInk, .35 + .35 * smoothstep(-.06, .0, d)) * (.65 + .35 * turn);
  col = mix(col, body, inside * uIntro);
  float glow = (exp(-max(d, 0.) * 22.) * .55 + exp(-max(d, 0.) * 5.) * .18) * (1. - inside);
  col += uGlow * glow * uIntro;
  // Darken edges
  col *= 1. - .35 * pow(length(uv - .5) * 1.25, 2.);
  o = vec4(col, 1.);
}`;

  // Rainbow floor — oil-film-like bands flow over a slanted panel at the bottom of the screen (only while passing the Work section)
  const GROUND = COMMON + `
uniform float uShow, uShift; uniform vec3 uInk;
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float hz = .2;
  if (uv.y > hz) { o = vec4(0.); return; }
  float z = 1. / max(hz - uv.y, .001);
  vec2 w = vec2((uv.x - .5) * z * .3, z * .07 + uShift * 1.2 - uTime * .04);
  float n = fbm(w * 1.4 + fbm(w * 2.7 + uTime * .03) * 1.2);
  vec3 film = .5 + .5 * cos(6.2831 * (n * 1.3 + vec3(0., .33, .67) + uTime * .02));
  vec3 col = mix(film, uInk, .62);
  float a = smoothstep(hz, hz - .05, uv.y) * .85 * uShow;
  o = vec4(col * a, a);
}`;

  // Workshop floor — a dark rock floor revealed only under the cursor lamp (same form as the original workshop floor lamp: inverse-square-like falloff + Lambert + shine .45)
  const FLOOR = COMMON + `
uniform vec3 uLight;  // Canvas pixel x, y (0 at bottom), intensity
uniform vec3 uLightCol, uRock;
uniform float uR;     // Lamp radius (pixels) — height is .7 of the radius
void main(){
  vec2 d = gl_FragCoord.xy - uLight.xy;
  if (uLight.z < .001 || dot(d, d) > 9. * uR * uR) { o = vec4(0.); return; }
  vec2 w = gl_FragCoord.xy / uRes.y * 9.;
  float h = fbm(w), hx = fbm(w + vec2(.02, 0.)), hy = fbm(w + vec2(0., .02));
  vec3 n = normalize(vec3((h - hx) * 12., (h - hy) * 12., 1.));
  vec3 L = vec3(-d, uR * .7);
  float dist = length(L);
  vec3 l = L / dist;
  float att = uLight.z / pow(1. + dist * dist / (uR * uR), 2.);
  float diff = max(dot(n, l), 0.);
  float spec = pow(max(dot(n, normalize(l + vec3(0., 0., 1.))), 0.), 24.) * .44 * .45;
  vec3 c = min((uRock * (.35 + .9 * h) * diff + spec) * uLightCol * uLightCol * att, vec3(1.));
  o = vec4(c, max(c.r, max(c.g, c.b)));
}`;

  // Embers — each dot is drawn by moving it individually (the original also fakes particles with math). Positions are in scene space (screen height 1, z at logo depth=0), lifted together with the logo via uShift.
  // Lit with perspective — points close to the camera are big and cross the screen fast, and when the cursor moves they sweep up to the sky above the logo and below the screen (same spot as the original)
  // Afterimage. As in the original, one point is stamped at nine spots (0, .25 … 2) between its screen positions in this frame, one frame ago and two frames ago. Fast sparks drag into streaks, stopped sparks overlap on a single point.
  const EMBER_VERT = `#version 300 es
in vec4 a0;  // This Frame’s screen-slot x·y (scene space), size (css px, 0 means not drawn), brightness
in vec2 a1;  // Position one frame ago
in vec2 a2;  // Position two frames back
in float aR; // Random
uniform vec2 uRes; uniform float uPx;
uniform vec3 uGlow, uSparkA, uSparkB;
out vec3 vCol;
void main(){
  float k = float(gl_InstanceID) * .25;
  vec2 p = k <= 1. ? mix(a0.xy, a1, k) : mix(a1, a2, k - 1.);
  float asp = uRes.x / uRes.y;
  gl_Position = a0.z <= 0. ? vec4(2., 2., 2., 1.) : vec4(p.x * 2. / asp, p.y * 2., 0., 1.);
  float r = aR;
  vec2 uv = vec2(p.x / asp, p.y) + .5;
  float vig = 1. - .35 * pow(length(uv - .5) * 1.25, 2.);
  vCol = (r > .87 ? uSparkA : (r > .7 ? uSparkB : mix(uGlow, uSparkB, .6))) * a0.w * vig * 2. / 9.;
  gl_PointSize = a0.z * uPx;
}`;
  const EMBER_FRAG = `#version 300 es
precision highp float;
in vec3 vCol; out vec4 o;
void main(){ float e = smoothstep(1., .15, length(gl_PointCoord - .5) * 2.); o = vec4(vCol * e, 0.); }`;
  // Spark light map — each spark close to the ground stamps a round light on the ground right below it (original: radius .04 × random · strength 2 · falloff 4th power · ground normal and Lambert). The ground looks tilted, so it is a vertically squashed ellipse
  const LIGHT_VERT = `#version 300 es
in vec4 aG;  // Ground dot screen position x·y, radius (screen height 1), vertical/horizontal
in vec4 aL;  // Light rgb, height/radius
uniform vec2 uRes; uniform float uGain;
out vec3 vCol; out float vAsp, vH;
void main(){
  float asp = uRes.x / uRes.y;
  gl_Position = aG.z <= 0. ? vec4(2., 2., 2., 1.) : vec4(aG.x * 2. / asp, aG.y * 2., 0., 1.);
  gl_PointSize = aG.z * 2. * uRes.y;
  vCol = aL.rgb * uGain; vAsp = aG.w; vH = aL.w;
}`;
  const LIGHT_FRAG = `#version 300 es
precision highp float;
in vec3 vCol; in float vAsp, vH; out vec4 o;
void main(){
  vec2 c = gl_PointCoord * 2. - 1.;
  c.y /= max(vAsp, .05);
  float r = length(c);
  if (r > 1.) discard;
  float dist = sqrt(r * r + vH * vH);
  float b = pow(max(0., 1. - dist), 4.);
  // Rough rock also catches sparks on slanted faces — using only flat-ground Lambert (height/distance) means a spark sitting on the ground can’t light its surroundings
  float lam = mix(.35, 1., vH / max(dist, 1e-3));
  o = vec4(vCol * b * lam, 1.);
}`;

  // Values from the original particle math — drag 1.04 × (.5~1.5) · inertia .95/frame (60fps) · curl amplitude .5, frequency .2 · age .3/s · anything inside logo radius 1.5 is pushed out at .1/frame.
  // World 1 unit = Scene space .12 (converted to the logo frame width), camera 1.3 from the logo (focus 1.37 so the logo width is .38 of the screen height). Radius of the born ball = Camera distance (original _Spread).
  // Only the curl is 2.7x — the original simplex curl has a magnitude above 1, so with the same value the cloud around the cursor clumped to half the original (radius .15)
  // 32×32 like the original = 1024 pieces. When they hit the ground (.3 below the logo · .25 up the valley walls at both sides), they rest .004 above the ground as in the original.
  // Scatter (_Rush) — when moving on to the About section, it releases the pull and pushes with strength (1.3 × random + .25) × 30/frame in a direction mixing the camera-facing axis (.8~2.2) + outward .6 + random .9
  // Sends it past the lens behind the camera (age stops, spread × held to 4 shells), and on return the drag pulls it back through the lens
  const EMBER = { n: 1024, attract: 1.04, inertia: 0.95, curl: 0.5 * 0.12 * 2.7, curlFreq: 0.2 / 0.12, aging: 0.3, logoR: 0.14, push: 0.1 * 0.12 * 60, cam: 1.3, spread: 1.3, logoY: 0.042, rush: 30 * 60 * 0.12 };
  // Ground light — the original radius .04 is in terrain-size units, so the copy has no scene-space value. To approach the original sweep (y35 response 30.8%: the ground at the bottom of the screen turns spark light), radius .14 · intensity 3 was chosen. The max 2.5 is the original value
  const SOIL = { y: EMBER.logoY - 0.3, wall: 0.25, rest: 0.004, R: 0.14, bright: 3, max: 2.5 };

  // Original cursor lamp — color #ffe3d6 · intensity 2.8 · follow .14s · turn-on .35s · motion rise .15s/fall .9s (0 when stopped) · fully lit at .6/s of screen width · far (4→14) .45x
  const LAMP = { color: [1, 0.89, 0.84], intensity: 2.8, follow: 0.14, on: 0.35, rise: 0.15, fall: 0.9, speedFull: 0.6, farDim: 0.45 };
  // Work section floor lamp — color #ffcbc7 · intensity 3.2 · still .6 → 1.35 when moving · follow .14s · rise .15s/fall .9s · .6 of screen width per second.
  // Radius is in original tile units (.2/1.2), so in pixels it was moved to the ramp position measured in the sweep (reaction strip height about 5 cells → radius about 135px@900)
  const FLOOR_LAMP = { color: [1, 0.8, 0.78], intensity: 3.2, rest: 0.6, boost: 1.35, follow: 0.14, on: 0.35, rise: 0.15, fall: 0.9, speedFull: 0.6, radius: 0.15 };

  const rgbOf = (() => {
    const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    return (expr) => {
      const p = document.createElement("i");
      p.style.cssText = `position:absolute;visibility:hidden;color:${expr}`;
      document.body.append(p);
      const c = getComputedStyle(p).color;
      p.remove();
      cv.clearRect(0, 0, 1, 1);
      cv.fillStyle = c;
      cv.fillRect(0, 0, 1, 1);
      return [...cv.getImageData(0, 0, 1, 1).data].slice(0, 3).map((v) => v / 255);
    };
  })();

  function program(gl, vert, frag) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vert));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(pr);
    const u = {};
    return { pr, u: (n) => (u[n] ??= gl.getUniformLocation(pr, n)) };
  }

  function layer(canvas, frag, { dpr = 1, alpha = false } = {}) {
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: true, alpha });
    if (!gl) return null;
    const pg = program(gl, VERT, frag);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pg.pr, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    if (alpha) { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); }
    const size = () => {
      const r = Math.min(devicePixelRatio || 1, dpr);
      canvas.width = Math.round(canvas.clientWidth * r);
      canvas.height = Math.round(canvas.clientHeight * r);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    size();
    new ResizeObserver(size).observe(canvas);
    return {
      gl,
      draw(set) {
        gl.useProgram(pg.pr);
        gl.bindVertexArray(vao);
        gl.uniform2f(pg.u("uRes"), canvas.width, canvas.height);
        set((n, ...v) => gl[`uniform${v.length}f`](pg.u(n), ...v));
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
    };
  }

  // Spark particle calc — as in the original, they are pulled toward the cursor (screen center if it has not moved) and pushed off the sphere shell around the logo.
  // Depth (z) is counted too — pushing only in the plane makes the shell a thin ring hugging the logo, whereas the original is a cloud spread out by the ball shell projected on screen
  function embers(gl, canvas) {
    const pg = program(gl, EMBER_VERT, EMBER_FRAG), lg = program(gl, LIGHT_VERT, LIGHT_FRAG);
    const N = EMBER.n;
    const pos = new Float32Array(N * 3), rnd = new Float32Array(N), bright = new Float32Array(N);
    const vx = new Float32Array(N), vy = new Float32Array(N), vz = new Float32Array(N), age = new Float32Array(N), h1 = new Float32Array(N), h2 = new Float32Array(N);
    const rushDir = new Float32Array(N * 3), rushK = new Float32Array(N);
    // Values to draw — dots: screen positions of this frame, one frame ago, two frames ago (9 cells) + random · light: ground points (4) + lights (4)
    const DS = 9, draw = new Float32Array(N * DS), LS = 8, light = new Float32Array(N * LS);
    const attr = (p, name, size, stride, off) => { const l = gl.getAttribLocation(p.pr, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, stride * 4, off * 4); };
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, draw.byteLength, gl.DYNAMIC_DRAW);
    attr(pg, "a0", 4, DS, 0); attr(pg, "a1", 2, DS, 4); attr(pg, "a2", 2, DS, 6); attr(pg, "aR", 1, DS, 8);
    const lvao = gl.createVertexArray();
    gl.bindVertexArray(lvao);
    const lbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lbuf);
    gl.bufferData(gl.ARRAY_BUFFER, light.byteLength, gl.DYNAMIC_DRAW);
    attr(lg, "aG", 4, LS, 0); attr(lg, "aL", 4, LS, 4);
    gl.bindVertexArray(null);
    // Light map — 1/4 the resolution of the scene canvas. The sum exceeds 1, so use a half-precision float texture (if unavailable, store it at 1/4 in 8 bits and read it ×4).
    const float = !!gl.getExtension("EXT_color_buffer_float");
    const tex = gl.createTexture(), fb = gl.createFramebuffer();
    let lw = 0, lh = 0;
    const fit = () => {
      const w = Math.max(1, Math.round(canvas.width / 4)), h = Math.max(1, Math.round(canvas.height / 4));
      if (w === lw && h === lh) return;
      lw = w; lh = h;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, float ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
    };
    const soilY = (x) => SOIL.y + SOIL.wall * smooth(0.3, 1.2, Math.abs(x));
    const spawn = (i) => {
      const y = Math.random() * 2 - 1, r = EMBER.spread * Math.sqrt(Math.random()), phi = Math.random() * Math.PI * 2, ring = Math.sqrt(1 - y * y), o = i * 3;
      pos[o] = ring * Math.sin(phi) * r;
      pos[o + 1] = Math.max(EMBER.logoY + ring * Math.cos(phi) * r, soilY(pos[o]) + SOIL.rest);
      pos[o + 2] = y * r;
      vx[i] = vy[i] = vz[i] = 0;
      age[i] = 0;
      fresh[i] = 1;
    };
    const fresh = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      spawn(i); age[i] = Math.random(); rnd[i] = Math.random(); h1[i] = Math.random(); h2[i] = Math.random();
      // Scatter direction — camera-side axis .8~2.2 + outward .6 + random .9 (normalization is done in the calculation together with the outward direction).
      const a = Math.random() * 2 - 1, b = Math.random() * 2 - 1, c = Math.random() * 2 - 1, l = Math.hypot(a, b, c) || 1;
      rushDir[i * 3] = a / l; rushDir[i * 3 + 1] = b / l; rushDir[i * 3 + 2] = c / l;
      rushK[i] = Math.random() * 1.3 + 0.25;
    }
    // Curl: differentiates two layers of sine flow functions to make a divergence-free flow (the original uses 3D simplex curl)
    const f = EMBER.curlFreq;
    const curl = (x, y, t) => {
      const a = f * x + 0.9 + t * 0.2, b = f * 1.13 * y - t * 0.15, c = f * 1.8 * x - f * 1.35 * y + t * 0.25;
      const dpdx = f * Math.cos(a) * Math.cos(b) + 0.5 * f * 1.8 * Math.cos(c);
      const dpdy = -f * 1.13 * Math.sin(a) * Math.sin(b) - 0.5 * f * 1.35 * Math.cos(c);
      return [dpdy / f, -dpdx / f, Math.sin(a * 0.7 - b * 1.3 + 2.1)];
    };
    let lightOn = false;
    return {
      tex,
      // ax·ay: the cursor’s scene position, uy: screen vertical (-1 bottom ~ 1 top). As in the original the attractor sits on the cursor ray, and the lower it is the nearer the camera (depth = distance × smoothstep(-2, 0, uy))
      step(dt, t, ax, ay, uy, logoS, rush = 0) {
        const k = Math.pow(EMBER.inertia, dt * 60), R = EMBER.logoR * logoS, D = EMBER.cam;
        const az = D * (1 - smooth(-2, 0, uy)), q = (D - az) / D;
        ax *= q; ay = EMBER.logoY + (ay - EMBER.logoY) * q;
        const hold = 1 - rush, shell = EMBER.spread * 4;
        for (let i = 0; i < N; i++) {
          age[i] += EMBER.aging * dt * hold;
          if (age[i] > 1) spawn(i);
          const o = i * 3, x = pos[o], y = pos[o + 1], z = pos[o + 2];
          const pull = EMBER.attract * (h1[i] + 0.5) * hold, c = curl(x, y, t), cw = EMBER.curl * (h2[i] + 0.5);
          vx[i] = vx[i] * k + ((ax - x) * pull + c[0] * cw) * (1 - k);
          vy[i] = vy[i] * k + ((ay - y) * pull + c[1] * cw) * (1 - k);
          vz[i] = vz[i] * k + ((az - z) * pull + c[2] * cw) * (1 - k);
          const lx = x * 0.7, ly = y - EMBER.logoY, ld = Math.hypot(lx, ly, z);
          if (ld < R * 2) {
            const s = Math.min(1, (R * 2 - ld) / R), w = s * s * (3 - 2 * s) * EMBER.push * dt * 60 / Math.max(ld, 1e-4);
            vx[i] += lx * w; vy[i] += ly * w; vz[i] += z * w;
          }
          if (rush > 0.001) {
            const cl = Math.hypot(x, ly, z) || 1, ax3 = 0.8 + h2[i] * 1.4;
            let rx = (x / cl) * 0.6 + rushDir[o] * 0.9, ry = (ly / cl) * 0.6 + rushDir[o + 1] * 0.9, rz = ax3 + (z / cl) * 0.6 + rushDir[o + 2] * 0.9;
            const rl = Math.hypot(rx, ry, rz) || 1, a = rush * rushK[i] * dt * EMBER.rush / rl;
            vx[i] += rx * a; vy[i] += ry * a; vz[i] += rz * a;
          }
          let nx = x + vx[i] * dt, ny = y + vy[i] * dt, nz = z + vz[i] * dt;
          if (rush > 0.5) {
            const dx = nx, dy = ny - EMBER.logoY, dd = Math.hypot(dx, dy, nz);
            if (dd > shell) { const s = shell / dd; nx = dx * s; ny = EMBER.logoY + dy * s; nz *= s; }
          }
          const floor = soilY(nx) + SOIL.rest;
          if (ny < floor) { ny = floor; if (vy[i] < 0) vy[i] = 0; }
          pos[o] = nx; pos[o + 1] = ny; pos[o + 2] = nz;
          const a = age[i], r = rnd[i], tw = 0.5 + 0.5 * Math.sin(t * (2 + r * 3) + r * 60);
          bright[i] = Math.min(1, a / 0.1) * Math.min(1, (1 - a) / 0.25) * tw;
        }
      },
      // Move to screen space and push the afterimage cells (two frames ago ← one frame ago ← this one), and fill the light dots of sparks near the ground
      // Trail length is set to a two-frame distance at 60fps — so on slow-frame devices (headless etc.) the streak doesn’t turn into rain lines crossing the screen
      project(shift, glow, lightAmt, cA, cB, still, dt = 1 / 60) {
        const cam = EMBER.cam, ly0 = EMBER.logoY, camH = ly0 - SOIL.y, kt = Math.min(1, 1 / 60 / Math.max(dt, 1e-3));
        lightOn = lightAmt > 0.001;
        for (let i = 0; i < N; i++) {
          const o = i * 3, x = pos[o], y = pos[o + 1], z = pos[o + 2], r = rnd[i], d = i * DS, l = i * LS;
          const depth = cam - z, persp = cam / Math.max(depth, 0.05);
          const sx = x * persp + shift[0], sy = (y - ly0) * persp + ly0 + shift[1];
          if (still || fresh[i]) { draw[d + 4] = draw[d + 6] = sx; draw[d + 5] = draw[d + 7] = sy; fresh[i] = 0; }
          else {
            const r1x = draw[d], r1y = draw[d + 1], o1x = draw[d + 4] - r1x, o1y = draw[d + 5] - r1y;
            draw[d + 4] = sx + (r1x - sx) * kt; draw[d + 5] = sy + (r1y - sy) * kt;
            draw[d + 6] = draw[d + 4] + o1x; draw[d + 7] = draw[d + 5] + o1y;
          }
          draw[d] = sx; draw[d + 1] = sy;
          // Just-born and fully-lived (age window 0) are not drawn — so no line is drawn from a dead spot to a new spot
          const win = smooth(0.5, 0.4, Math.abs(age[i] - 0.5));
          const size = depth < 0.25 || win <= 0 ? 0 : Math.min((2.5 + 5 * ((r * 13.7) % 1)) * persp, 14);
          draw[d + 2] = size;
          // In the original, points near the camera are drawn large (tens of px) in proportion to screen height, so nine points overlap into a blur. The copy fixes points at 14px, so
          // Bind the afterimage to twice the dot diameter so it doesn’t turn into dotted rain streaks
          const tx = draw[d + 6] - sx, tyy = draw[d + 7] - sy, tl = Math.hypot(tx, tyy), cap = (size * 2) / Math.max(1, canvas.clientHeight);
          if (tl > cap) { const k = cap / tl; draw[d + 4] = sx + (draw[d + 4] - sx) * k; draw[d + 5] = sy + (draw[d + 5] - sy) * k; draw[d + 6] = sx + tx * k; draw[d + 7] = sy + tyy * k; }
          draw[d + 3] = bright[i] * glow;
          draw[d + 8] = r;
          // Light — radius .1 × random (.25~1) × age window. If it is higher above the ground than its radius, it does not illuminate
          const R = SOIL.R * (0.25 + 0.75 * h1[i]) * win, h = y - soilY(x);
          if (!lightOn || depth < 0.25 || R <= 0 || h > R) { light[l + 2] = 0; continue; }
          const gy = (soilY(x) - ly0) * persp + ly0 + shift[1];
          light[l] = sx; light[l + 1] = gy; light[l + 2] = R * persp; light[l + 3] = Math.min(1, camH / depth);
          const m = r * r, kq = SOIL.bright * lightAmt;
          for (let c = 0; c < 3; c++) light[l + 4 + c] = (cB[c] * cB[c] + (cA[c] * cA[c] - cB[c] * cB[c]) * m) * kq;
          light[l + 7] = Math.max(0, h) / R;
        }
      },
      light() {
        fit();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport(0, 0, lw, lh);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (lightOn) {
          gl.useProgram(lg.pr);
          gl.bindVertexArray(lvao);
          gl.bindBuffer(gl.ARRAY_BUFFER, lbuf);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, light);
          gl.uniform2f(lg.u("uRes"), lw, lh);
          gl.uniform1f(lg.u("uGain"), float ? 1 : 0.25);
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.ONE, gl.ONE);
          gl.drawArrays(gl.POINTS, 0, N);
          gl.disable(gl.BLEND);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        return float ? 1 : 4;
      },
      draw(set) {
        gl.useProgram(pg.pr);
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, draw);
        gl.uniform2f(pg.u("uRes"), canvas.width, canvas.height);
        gl.uniform1f(pg.u("uPx"), canvas.width / Math.max(1, canvas.clientWidth));
        set((n, ...v) => gl[`uniform${v.length}f`](pg.u(n), ...v));
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.drawArraysInstanced(gl.POINTS, 0, N, 9);
        gl.disable(gl.BLEND);
      },
    };
  }

  window.ORScene = {
    rgbOf,
    start(sceneCanvas, groundCanvas, state, floorCanvas) {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let colors;
      const paint = () => {
        colors = {
          uBg: rgbOf("var(--kf-bg)"), uSky: rgbOf("var(--site-sky)"), uRock: rgbOf("var(--site-rock)"),
          uGlow: rgbOf("var(--kf-accent)"), uSparkA: rgbOf("var(--kf-accent-soft)"), uSparkB: rgbOf("var(--kf-accent-text)"), uInk: rgbOf("var(--kf-ink)"),
        };
      };
      paint();
      new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class", "style"] });
      const scene = layer(sceneCanvas, SCENE, { dpr: 1.5 });
      const ground = groundCanvas ? layer(groundCanvas, GROUND, { dpr: 1, alpha: true }) : null;
      const floor = floorCanvas ? layer(floorCanvas, FLOOR, { dpr: 1, alpha: true }) : null;
      if (!scene) { document.documentElement.classList.add("no-webgl"); return; }
      const sparks = embers(scene.gl, sceneCanvas);
      const t0 = performance.now();
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      // ptr: where the sparks are pulled (screen-height 1 space, starts at screen center like the original, touch follows too) · lamp: mouse only
      const ptr = { x: 0, y: 0, nx: 0.5, ny: 0.5 };
      const inside = { v: false };
      // Two ramps share the same calculation — they follow the cursor in .14s, turn on in .35s, and the motion level chases cursor speed (screen width/s ÷ speedFull) with rise and fall times
      const follower = (cfg) => ({
        x: 0, y: 0, on: 0, motion: 0, seen: false, lx: NaN, ly: NaN,
        step(dt, hit, tx, ty) {
          if (hit) {
            if (!this.seen || this.on < 0.01) { this.x = tx; this.y = ty; this.seen = true; }
            else { const e = 1 - Math.exp(-dt / cfg.follow); this.x += (tx - this.x) * e; this.y += (ty - this.y) * e; }
          }
          this.on += ((hit ? 1 : 0) - this.on) * (1 - Math.exp(-dt / cfg.on));
          const v = Number.isNaN(this.lx) || this.on < 0.01 ? 0 : Math.hypot(ptr.nx - this.lx, ptr.ny - this.ly);
          this.lx = ptr.nx; this.ly = ptr.ny;
          const y = dt > 0 ? Math.min(1, v / dt / cfg.speedFull) : 0;
          this.motion += (y - this.motion) * (1 - Math.exp(-dt / (y > this.motion ? cfg.rise : cfg.fall)));
        },
      });
      const lamp = follower(LAMP), flamp = follower(FLOOR_LAMP);
      const fine = matchMedia("(pointer: fine)").matches;
      const aim = (cx, cy) => { ptr.nx = cx / innerWidth; ptr.ny = cy / innerHeight; ptr.x = (cx - innerWidth / 2) / innerHeight; ptr.y = -(cy - innerHeight / 2) / innerHeight; };
      if (!reduce) {
        addEventListener("pointermove", (e) => {
          aim(e.clientX, e.clientY);
          if (e.pointerType !== "mouse") return;
          inside.v = true;
          mouse.tx = (e.clientX / innerWidth) * 2 - 1; mouse.ty = -((e.clientY / innerHeight) * 2 - 1);
        }, { passive: true });
        addEventListener("touchmove", (e) => e.touches[0] && aim(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        document.documentElement.addEventListener("mouseleave", () => (inside.v = false));
        addEventListener("blur", () => (inside.v = false));
      }
      const lampStep = (dt, cam) => {
        // When the cursor is in the sky the lamp turns off (the original casts rays at a height map and lights only when they hit the ground) — estimated by the top line of the far ridge
        lamp.step(dt, fine && inside.v && ptr.y < 0.11 + 0.16 * smooth(0.05, 0.95, Math.abs(ptr.x)) - cam * 0.9, ptr.x, ptr.y);
        const z = CAM_HF / Math.max(GROUND_HZ - cam * 1.05 + 0.2 * smooth(0.05, 0.95, Math.abs(lamp.x)) - lamp.y, 0.03), dist = Math.hypot((lamp.x * z) / CAM_F, z, 1.5);
        return LAMP.intensity * (1 + (LAMP.farDim - 1) * smooth(4, 14, dist)) * lamp.motion * lamp.on;
      };
      // Reduced motion: set up the ring pulled to center once, without cursor response, then stop
      if (reduce) for (let i = 0; i < 240; i++) sparks.step(1 / 60, i / 60, 0, 0, 0, 1);
      // Scatter — once the turn amount exceeds .35 it enters the scattered state (it releases only when it falls back below .35). It fills over .9s and drains over .35s. Strength is its square
      const rush = { on: false, phase: 0 };
      // Logo hover — the original is a cursor ray around a ball at the logo (radius 2 = Turns on when the scene touches .24), rests while spinning for ”Credits” and after the flip
      const hover = { x: 0, y: 0 };
      const hoverStep = (dt, cam) => {
        const s = (0.6 + 0.4 * state.intro) * (1 - 0.25 * Math.min(1, cam));
        const lx = mouse.x * 0.01, ly = EMBER.logoY + cam * 1.15 + mouse.y * 0.01;
        const on = fine && inside.v && !reduce && state.intro > 0.99 && !state.spin && cam < 0.3 && Math.hypot(ptr.x - lx, ptr.y - ly) < 0.24 * s;
        hover.x += ((on ? 1 : 0) - hover.x) * Math.min(1, 10 * dt);
        hover.y += ((on ? 1 : 0) - hover.y) * Math.min(1, 6 * dt);
        document.documentElement.classList.toggle("is-logo-hover", on);
      };
      let last = performance.now(), still = reduce;
      const frame = (now) => {
        const t = reduce ? 0 : (now - t0) / 1000;
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        const cam = state.scroll;
        const shift = [mouse.x * 0.01, cam * 1.15 + mouse.y * 0.01];
        const lampAmt = reduce ? 0 : lampStep(dt, cam);
        const fade = smooth(0.3, 0.9, cam);
        rush.on = rush.on ? fade >= 0.35 : fade > 0.35;
        rush.phase = rush.on ? Math.min(1, rush.phase + dt / 0.9) : Math.max(0, rush.phase - dt / 0.35);
        const rushAmt = reduce ? 0 : rush.phase * rush.phase;
        hoverStep(dt, cam);
        if (!reduce && state.sceneOn) sparks.step(dt, t, ptr.x - shift[0], ptr.y - shift[1], 1 - 2 * ptr.ny, 1 - 0.25 * Math.min(1, cam), rushAmt);
        if (state.sceneOn) {
          // While scattering, dim the spark brightness to (1 − strength) as in the original. Reduced motion has no scatter, so turn it off except for the swipe
          const glow = state.intro * (reduce ? 1 - fade : 1 - rushAmt);
          sparks.project(shift, glow, state.intro * (1 - fade), colors.uSparkA, colors.uSparkB, still, dt);
          still = false;
          const gain = sparks.light();
          scene.draw((u) => {
            u("uTime", t); u("uMouse", mouse.x, mouse.y); u("uScroll", cam); u("uIntro", state.intro); u("uSpin", state.spin || 0); u("uHover", hover.x, hover.y);
            u("uLamp", lamp.x, lamp.y, lampAmt); u("uLampCol", ...LAMP.color);
            u("uPLightMax", SOIL.max); u("uPLightScale", gain);
            for (const [k, v] of Object.entries(colors)) u(k, ...v);
          });
          sparks.draw((u) => {
            for (const k of ["uGlow", "uSparkA", "uSparkB"]) u(k, ...colors[k]);
          });
        }
        if (ground && state.groundOn) ground.draw((u) => { u("uTime", t); u("uShow", state.ground); u("uShift", state.groundShift); u("uInk", ...colors.uInk); });
        // Work section floor lamp — only while the section is on screen. It keeps drawing while fading out so no last light remains
        if (floor && !reduce) {
          const fw = floorCanvas.width, fh = floorCanvas.height;
          flamp.step(dt, fine && inside.v && state.floorOn, ptr.nx * fw, (1 - ptr.ny) * fh);
          if (state.floorOn || flamp.on > 0.001) floor.draw((u) => {
            u("uLight", flamp.x, flamp.y, FLOOR_LAMP.intensity * (FLOOR_LAMP.rest + (FLOOR_LAMP.boost - FLOOR_LAMP.rest) * flamp.motion) * flamp.on);
            u("uLightCol", ...FLOOR_LAMP.color); u("uRock", ...colors.uRock); u("uR", FLOOR_LAMP.radius * fh);
          });
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    },
  };
})();
