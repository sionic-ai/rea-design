/* Hand trail — the path the cursor travels is painted like a brush stroke onto a flow map (a small render target), and the light is dragged and brightened while that trail smears out and settles.
   In the original, the background shader reads the flow field directly, but the copy’s light is a glow-field part. So an additive canvas is laid at the same spot and draws only the extra brightness gained from being dragged.
   Numbers are values read from the original: panel size .34 of the screen, updated at 40Hz, brush radius .099 (ratio to height), ink decay 1.5/s · flow decay 2/s · spread 6.5/s, cursor smoothing 1-exp(-9·dt). */
(() => {
  const T = window.THREE, B = window.TB3D;
  if (!T || !B) return;
  // The original also leaves no marks on touch devices
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const STEP = 0.025, FIELD = 0.34, LINGER = Math.ceil((5 / 1.5) * 60);
  const QUAD = "varying vec2 vUv; void main(){ vUv = position.xy * .5 + .5; gl_Position = vec4(position.xy, 0., 1.); }";

  const PAINT = `precision highp float;
varying vec2 vUv;
uniform sampler2D uPrev; uniform vec2 uPx; uniform float uAsp; uniform float uDt; uniform float uT; uniform float uPaint;
uniform vec2 uFrom; uniform vec2 uTo;
const float INK_FADE = 1.5, FLOW_FADE = 2., BLEED = 6.5, BRUSH = .099;
vec4 tap(vec2 o){ return texture2D(uPrev, vUv + o); }
void main(){
  vec4 here = texture2D(uPrev, vUv);
  // The mark folds, carried along in its own flow
  vec4 moved = texture2D(uPrev, vUv - here.rg * uDt * .3);
  vec2 flow = moved.rg; float ink = moved.b;

  // The fainter it gets, the wider it spreads — the average and the darkest value of the eight surrounding cells
  vec2 o = uPx * 1.6 * (1. + 6. * (1. - smoothstep(0., .6, ink)));
  vec4 n0 = tap(vec2(o.x, 0.)), n1 = tap(vec2(-o.x, 0.)), n2 = tap(vec2(0., o.y)), n3 = tap(vec2(0., -o.y));
  vec4 n4 = tap(o), n5 = tap(-o), n6 = tap(vec2(o.x, -o.y)), n7 = tap(vec2(-o.x, o.y));
  vec4 avg = (here + n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7) / 9.;
  float peak = max(max(max(n0.b, n1.b), max(n2.b, n3.b)), max(max(n4.b, n5.b), max(n6.b, n7.b))) * .985;
  float thin = smoothstep(0., 1., 1. - smoothstep(0., .7, ink));
  ink = mix(ink, max(avg.b, peak), 1. - exp(-BLEED * (.5 + 2.5 * thin) * uDt));
  flow = mix(flow, avg.rg, 1. - exp(-BLEED * uDt));

  // Brush — rounded around the segment drawn from the last position to the current one
  vec2 k = vec2(uAsp, 1.), a = uFrom * k, b = uTo * k, p = vUv * k, ab = b - a;
  float along = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-7), 0., 1.);
  float d = length(p - a - ab * along);
  float stamp = exp(-1.6 * d * d / (BRUSH * BRUSH)) * uPaint;
  float len = length(ab);
  if (stamp > .001 && len > 1e-5) {
    vec2 dir = ab / len; float go = min(len, .06);
    float sway = sin((vUv.x + vUv.y) * 30. + uT * 1.6) * .5;
    flow += (dir + vec2(-dir.y, dir.x) * sway) * stamp * go * 40.;
    ink = min(ink + stamp * go * 22., 1.);
  }

  flow *= exp(-FLOW_FADE * uDt); ink *= exp(-INK_FADE * uDt);
  float m = length(flow); if (m > 1e-5) flow *= 1. / (1. + m);
  gl_FragColor = vec4(flow, ink, 1.);
}`;

  // Layer — output with premultiplied alpha. Colors with alpha 0 are added as light onto the image below, and alpha covers the spots where the band is missing with the background color
  const LIGHT = `precision highp float;
varying vec2 vUv;
uniform sampler2D uTrail; uniform vec2 uRes; uniform float uT;
uniform float uReveal; uniform float uExit; uniform float uMain; uniform float uTop; uniform float uBand;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uBase;
uniform sampler2D uWord; uniform vec4 uWordBox; uniform float uWordOn;
float hs(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(hs(i), hs(i + vec2(1., 0.)), u.x), mix(hs(i + vec2(0., 1.)), hs(i + vec2(1.)), u.x), u.y); }
float fb(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 7.1; a *= .5; } return s; }
float th(float x){ float e = exp(2. * clamp(x, -10., 10.)); return (e - 1.) / (e + 1.); }
// Same ellipse as the glow-field part (minus the noise wobble) — to get the brightness difference between the dragged position and the rest position
float bloom(vec2 uv){
  float asp = uRes.x / uRes.y; vec2 p = (uv - vec2(.5, 0.)) * vec2(asp, 1.);
  float ex = clamp(uExit * 1.12, 0., 1.); ex = ex * (.5 + .5 * ex);
  float rv = clamp(uReveal, 0., 1.);
  vec2 c = mix(vec2(0., -.45 + .37 * rv), vec2(0., .5), ex);
  vec2 r = mix(vec2(.5 * asp, .42) * (.05 + 1.6 * rv), vec2(2.4 * asp, 2.6), ex);
  vec2 q = (p - c) / r; float d = (dot(q, q) - 1.) * min(r.x, r.y) * .5;
  return .5 - .5 * th(.85 * d / (.16 + .22 * rv + .3 * ex));
}
// Top band — a wide ellipse covering the top 45% of the screen (horizontal radius .55, widened on narrow screens)
float cap(vec2 uv, float band){
  float widen = clamp(1.6 / max(uRes.x / uRes.y, .05), 1., 2.6);
  vec2 d = vec2((uv.x - .5) / (.55 * widen), ((1. - uv.y) + .18) / band);
  return pow(1. - smoothstep(0., 1.05, length(d)), 1.25);
}
void main(){
  vec4 t = texture2D(uTrail, vUv);
  vec2 flow = t.rg; float ink = t.b;
  float w = smoothstep(.02, .55, ink);
  vec3 add = vec3(0.);
  // Where a strip has shifted out, that amount is covered with the background color to darken it — where there are almost no strips the ratio spikes, so it is not covered
  float dim = 0.;

  if (uMain > 0.) {
    // Main light: a mark drags the light along with its brush strokes (noise strands) — drag length in px at 1728×900
    float rv = clamp(uReveal, 0., 1.), ease = rv * rv * (3. - 2. * rv);
    vec2 px = vUv * uRes;
    vec2 fiber = (vec2(fb(px * .006 + vec2(uT * .2, -uT * .15)), fb(px * .009 - vec2(uT * .13, uT * .18) + 19.)) - .5) * 130. * w;
    vec2 pull = (flow * (520. * w + 120. * smoothstep(0., .15, ink)) + fiber) / vec2(1728., 900.) * uMain;
    float lift = max(bloom(vUv + pull) - bloom(vUv), 0.);
    add += mix(uA, uB, clamp(vUv.y * .9 + .3, 0., 1.)) * lift;
    add += uB * vec3(.08, .26, .25) * w * uMain * ease;
  }
  if (uTop > 0.) {
    vec2 push = vec2(flow.x, flow.y) * (.12 * w) * uTop;
    // Brush grain — only inside the stroke, scatter the displacement with noise strands so it reads as a swept grain rather than a smooth band
    vec2 px = vUv * uRes;
    float strand = fb(px * .006 + vec2(uT * .2, -uT * .15));
    push += (vec2(strand, fb(px * .009 + 19.)) - .5) * .09 * w * uTop;
    float a = cap(vUv, .45), moved = cap(vUv + push, .45);
    vec3 glow = uB * .62;
    // The original band is brighter than the copy’s CSS light and longer downward, so it lights the spot a mark touched with a wider band (.62) — value matched by recording
    add += glow * max(moved - a, 0.) * 1.35 + glow * cap(vUv + push, .62) * w * uTop * (.9 + 1.4 * strand);
    dim = max(dim, clamp((a - moved) / max(a, 1e-3), 0., 1.) * smoothstep(.02, .15, a));
  }
  if (uBand > 0.) {
    // Footer band: pushed only slightly (.02), and a bright ridge rises along the trail
    float a = bloom(vUv), moved = bloom(vUv + flow * (.02 * w) * uBand);
    add += uB * (max(moved - a, 0.) + a * w * uBand * 1.6 * (1. - .6 * a));
    dim = max(dim, clamp((a - moved) / max(a, 1e-3), 0., 1.) * smoothstep(.02, .15, a));
  }
  if (uWordOn > 0.) {
    // Wordmark: only the letters touched by the trace — soft inside, crisp on the outline. Torn away with a noise cloud instead of a round spotlight
    vec2 q = (vUv - uWordBox.xy) / uWordBox.zw;
    if (q.x > 0. && q.x < 1. && q.y > 0. && q.y < 1.) {
      vec2 g = texture2D(uWord, q).rg;
      float asp = uRes.x / uRes.y;
      vec2 nb = vec2(vUv.x * asp, vUv.y) * 5. + flow;
      vec2 wp = vec2(fb(nb + uT * .1), fb(nb + vec2(5.2, 1.3) - uT * .08));
      float cloud = fb(nb + wp * .3 + uT * .06);
      float show = smoothstep(.4, .8, ink) * smoothstep(.35, .85, cloud) * uWordOn;
      add += uB * (smoothstep(0., .6, g.r) * show * .85 + smoothstep(0., .7, g.g) * show * 3.8);
    }
  }
  gl_FragColor = vec4(add + uBase * dim, dim);
}`;

  // The shader outputs directly without color conversion, so pass skin colors as raw sRGB values
  const rgb = (el, prop) => new T.Color(getComputedStyle(el).getPropertyValue(prop).trim() || "gray").convertLinearToSRGB();
  const num = (el, name, d) => { const v = el.style.getPropertyValue(name); return v === "" ? d : +v; };

  // host: the box receiving the marks · before: where to insert the layer · glow: the glow-field element that writes --fx-reveal · word: the wordmark whose letters light up · S: body scope (once per document if none)
  function attach({ host, before, glow, word, main = 0, top = 0, band = 0, reveal = 0.45, follow = 0.08, start = 0, S }) {
    const cv = document.createElement("canvas");
    cv.className = "tb-trail"; cv.setAttribute("aria-hidden", "true");
    host.insertBefore(cv, before);
    const r = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "high-performance" });
    r.setPixelRatio(Math.min(devicePixelRatio, 1.5)); r.setClearColor(0x000000, 0); r.autoClear = true;
    S?.add(() => { now.dispose(); next.dispose(); r.dispose(); r.forceContextLoss(); cv.remove(); });
    const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1), quad = new T.PlaneGeometry(2, 2);
    const target = () => new T.WebGLRenderTarget(2, 2, { type: T.HalfFloatType, format: T.RGBAFormat, minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: false, stencilBuffer: false });
    let now = target(), next = target();

    const pu = { uPrev: { value: now.texture }, uPx: { value: new T.Vector2() }, uAsp: { value: 1 }, uDt: { value: STEP }, uT: { value: 0 }, uPaint: { value: 0 }, uFrom: { value: new T.Vector2(0.5, 0.5) }, uTo: { value: new T.Vector2(0.5, 0.5) } };
    const paintScene = new T.Scene(); paintScene.add(new T.Mesh(quad, new T.ShaderMaterial({ uniforms: pu, vertexShader: QUAD, fragmentShader: PAINT, depthTest: false, depthWrite: false })));
    const blank = new T.DataTexture(new Uint8Array(4), 1, 1); blank.needsUpdate = true;
    const lu = {
      uTrail: { value: now.texture }, uRes: { value: new T.Vector2(2, 2) }, uT: { value: 0 }, uReveal: { value: reveal }, uExit: { value: 0 },
      uMain: { value: 0 }, uTop: { value: 0 }, uBand: { value: 0 }, uA: { value: rgb(host, "--kf-accent-soft") }, uB: { value: rgb(host, "--kf-accent") }, uBase: { value: rgb(host, "--kf-bg") },
      uWord: { value: blank }, uWordBox: { value: new T.Vector4(0, 0, 1, 1) }, uWordOn: { value: 0 },
    };
    const lightScene = new T.Scene(); lightScene.add(new T.Mesh(quad, new T.ShaderMaterial({ uniforms: lu, vertexShader: QUAD, fragmentShader: LIGHT, depthTest: false, depthWrite: false, blending: T.NoBlending, transparent: true })));

    // Draw the wordmark as an inside-the-letters (red) panel and an outline (green) panel — same typeface and position as the document text
    const wordCv = word ? document.createElement("canvas") : null, wordTex = wordCv ? new T.CanvasTexture(wordCv) : null;
    if (wordTex) { wordTex.flipY = true; wordTex.minFilter = T.LinearFilter; wordTex.generateMipmaps = false; lu.uWord.value = wordTex; }
    let wordOk = false;
    const drawWord = () => {
      if (!wordCv) return;
      const hr = host.getBoundingClientRect(), wr = word.getBoundingClientRect(), cs = getComputedStyle(word), x = wordCv.getContext("2d");
      if (!wr.width || !wr.height || !("letterSpacing" in x)) { wordOk = false; return; }
      const k = Math.min(devicePixelRatio, 1.5);
      wordCv.width = Math.max(2, Math.round(wr.width * k)); wordCv.height = Math.max(2, Math.round(wr.height * k));
      x.setTransform(k, 0, 0, k, 0, 0); x.clearRect(0, 0, wr.width, wr.height);
      x.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; x.letterSpacing = cs.letterSpacing; x.textBaseline = "alphabetic";
      const text = cs.textTransform === "uppercase" ? word.textContent.toUpperCase() : word.textContent, m = x.measureText(text);
      const range = document.createRange(); range.selectNodeContents(word); const tr = range.getBoundingClientRect();
      const y = (wr.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent, left = tr.left - wr.left;
      // Not a color but a divider — text interior in the red channel, border in the green channel
      x.fillStyle = "red"; x.fillText(text, left, y);
      x.globalCompositeOperation = "lighter"; x.strokeStyle = "lime"; x.lineWidth = 2; x.lineJoin = "round"; x.strokeText(text, left, y);
      x.globalCompositeOperation = "source-over";
      wordTex.needsUpdate = true; wordOk = true;
      lu.uWordBox.value.set((wr.left - hr.left) / hr.width, 1 - (wr.bottom - hr.top) / hr.height, wr.width / hr.width, wr.height / hr.height);
    };

    const size = () => {
      const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
      r.setSize(w, h, false); r.getDrawingBufferSize(lu.uRes.value);
      const fw = Math.max(2, Math.floor(w * FIELD)), fh = Math.max(2, Math.floor(h * FIELD));
      now.setSize(fw, fh); next.setSize(fw, fh); pu.uPx.value.set(1 / fw, 1 / fh); pu.uAsp.value = fw / fh;
      drawWord();
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(host); S?.add(() => ro.disconnect());
    document.fonts?.ready.then(drawWord);

    // Preload the shader and spin the board once so the screen does not freeze on the first brushstroke
    r.compile(paintScene, cam); r.compile(lightScene, cam);
    [next, now].forEach((rt) => { r.setRenderTarget(rt); r.clear(); });
    r.setRenderTarget(next); r.render(paintScene, cam); r.setRenderTarget(null); r.render(lightScene, cam);

    const m = { x: innerWidth / 2, y: innerHeight / 2, sx: innerWidth / 2, sy: innerHeight / 2, inside: start, here: start, seen: false };
    const move = (e) => {
      const b = host.getBoundingClientRect();
      m.x = e.clientX; m.y = e.clientY;
      m.inside = +(e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom);
      if (!m.seen) { m.seen = true; m.sx = m.x; m.sy = m.y; }
    };
    if (S) S.on(window, "mousemove", move, { passive: true }); else addEventListener("mousemove", move, { passive: true });

    let quiet = LINGER, acc = 0, clock = 0, shown = false;
    B.loop(cv, (dt) => {
      clock += dt;
      const k = 1 - Math.exp(-9 * dt);
      m.sx += (m.x - m.sx) * k; m.sy += (m.y - m.sy) * k; m.here += (m.inside - m.here) * follow;
      const rv = glow ? num(glow, "--fx-reveal", reveal) : reveal, topFade = num(host, "--tb-top-glow", 1);
      const sMain = main * m.here * rv, sTop = top * m.here * topFade, sBand = band * m.here, strength = Math.max(sMain, sTop, sBand);
      if (strength > 0.001) quiet = 0; else quiet++;
      acc += dt;
      if (quiet < LINGER && acc >= STEP) {
        const b = host.getBoundingClientRect();
        pu.uFrom.value.copy(pu.uTo.value); pu.uTo.value.set((m.sx - b.left) / b.width, 1 - (m.sy - b.top) / b.height);
        pu.uPaint.value = strength; pu.uDt.value = Math.min(acc, 0.05); pu.uT.value = clock; pu.uPrev.value = now.texture; acc = 0;
        r.setRenderTarget(next); r.render(paintScene, cam); r.setRenderTarget(null);
        [now, next] = [next, now]; lu.uTrail.value = now.texture;
      }
      // Once the marks have fully settled, the empty layer is not redrawn
      if (quiet >= LINGER) { if (shown) { r.clear(); shown = false; } return; }
      lu.uT.value = clock; lu.uReveal.value = rv; lu.uExit.value = glow ? num(glow, "--fx-exit", 0) : 0;
      lu.uMain.value = sMain; lu.uTop.value = sTop; lu.uBand.value = sBand; lu.uWordOn.value = wordOk ? sBand : 0;
      r.render(lightScene, cam); shown = true;
    });
  }

  const optReveal = (el) => { const m = /reveal:\s*([\d.]+)/.exec(el?.getAttribute("data-fx-glow-field") || ""); return m ? +m[1] : 0.45; };
  const hook = (host, S) => {
    const kind = host.dataset.tbTrail, glow = host.matches("[data-fx~='glow-field']") ? host : host.querySelector("[data-fx~='glow-field']");
    const before = host.querySelector("[data-tb-trail-under]") || null;
    if (kind === "foot") attach({ host, before, glow, word: host.querySelector(".tb-foot__word"), band: 1, reveal: optReveal(glow), S });
    // Header stage is on from the start like the original, and turns off when the cursor leaves the stage
    else attach({ host, before, glow, main: 1, top: kind === "hero" ? 1 : 0, reveal: optReveal(glow), follow: 0.05, start: 1, S });
  };
  // Footer is outside the body, so once per document, hero stage each time the body enters
  document.querySelectorAll("[data-tb-trail]").forEach((host) => !host.closest('[data-barba="container"]') && hook(host));
  if (window.TB) TB.trail = (root, S) => root.querySelectorAll("[data-tb-trail]").forEach((host) => hook(host, S));
})();
