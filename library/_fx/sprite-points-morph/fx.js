(() => {
  // A dot grid that grows to the letter shape (picture panel) — each dot picks one pattern piece (circle · donut · diamond · grid · check · arrow…) and draws it,
  // Morph into a sphere, divergence outward, tempo-synced size ripple and cursor wobble are all done in a shader (WebGL).
  const VERT = `
attribute vec3 aTarget;
attribute float aRand;
attribute float aSprite;
uniform sampler2D uShape;
uniform float uMorph, uDiv, uSize, uResY, uBeat, uAmp, uMin, uMax, uFreq;
uniform vec3 uDivPoint;
varying float vSprite;
varying float vShape;
vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);}
float noise3(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g,l.zxy);vec3 i2=max(g,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-.5;i=m289(i);
  vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  vec4 j=p-49.*floor(p*(1./49.));vec4 x_=floor(j*(1./7.));vec4 y_=floor(j-7.*x_);
  vec4 x=(x_*2.+.5)/7.-1.;vec4 y=(y_*2.+.5)/7.-1.;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 g0=vec3(a0.xy,h.x);vec3 g1=vec3(a0.zw,h.y);vec3 g2=vec3(a1.xy,h.z);vec3 g3=vec3(a1.zw,h.w);
  vec4 n=1.79284291400159-.85373472095314*vec4(dot(g0,g0),dot(g1,g1),dot(g2,g2),dot(g3,g3));g0*=n.x;g1*=n.y;g2*=n.z;g3*=n.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(g0,x0),dot(g1,x1),dot(g2,x2),dot(g3,x3)));
}
void main(){
  vec3 p = mix(position, aTarget, uMorph);
  vec3 d = p - uDivPoint;
  if (abs(uDiv) > 0.0001) p += normalize(d) * uDiv;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float shape = texture2D(uShape, uv).g;
  float n = noise3(vec3(position.xy * .35 + aRand * 7.0, uBeat * uFreq)) * .5 + .5;
  float s = uAmp > 0. ? mix(uMin, uMax, n) * uAmp : 1.;
  // Dots outside the picture panel get drawn at 1px even at size 0, so remove them entirely
  vShape = shape;
  gl_PointSize = shape < .02 ? 0. : uSize * shape * uResY * s / -mv.z;
  if (shape < .02) gl_Position = vec4(2., 2., 2., 1.);
  vSprite = aSprite;
}`;
  const FRAG = `
precision highp float;
uniform sampler2D uAtlas;
uniform float uCount, uAlpha;
varying float vSprite;
varying float vShape;
void main(){
  if (vShape < .02) discard;
  vec2 uv = gl_PointCoord; uv.y = 1.0 - uv.y;
  vec4 c = texture2D(uAtlas, vec2((vSprite + uv.x) / uCount, uv.y));
  if (c.a < .02) discard;
  // Piece panels are drawn with premultiplied alpha, then reverted so edges don’t bleed black
  gl_FragColor = vec4(c.rgb / max(c.a, .001), c.a * uAlpha);
}`;

  // Pattern pieces — six colors made by rotating the color wheel from the accent color (they change along with the skin), and the gray layer follows the line color
  const css = (name, el) => getComputedStyle(el).getPropertyValue(name).trim();
  const toRgb = (c) => { const d = document.createElement("canvas").getContext("2d"); d.fillStyle = c; const h = d.fillStyle; if (h[0] === "#") return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); return h.match(/[\d.]+/g).slice(0, 3).map(Number); };
  const hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const dd = mx - mn; s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn); h = mx === r ? (g - b) / dd + (g < b ? 6 : 0) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; } return [h, s * 100, l * 100]; };
  const palette = (el) => {
    const [h, s] = hsl(toRgb(css("--kf-accent", el) || "currentColor"));
    // Generate the original six colors (red, yellow, sky, teal, pink, orange) by rotating from the accent hue — saturation and brightness fixed toward the bright pattern as in the original
    return [[0, s, 47], [50, 85, 60], [197, 68, 62], [168, 52, 50], [352, 80, 72], [25, 90, 58]].map(([dh, ss, ll]) => `hsl(${(h + dh + 360) % 360} ${Math.min(95, ss)}% ${ll}%)`);
  };
  const DRAW = {
    circle: (c, k) => { c.beginPath(); c.arc(64, 64, 50, 0, 7); c.fill(); },
    donut: (c, k) => { c.lineWidth = 24; c.beginPath(); c.arc(64, 64, 40, 0, 7); c.stroke(); },
    circles: (c) => { for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) { c.beginPath(); c.arc(24 + x * 40, 24 + y * 40, 15, 0, 7); c.fill(); } },
    rhombus: (c) => { c.beginPath(); c.moveTo(64, 8); c.lineTo(120, 64); c.lineTo(64, 120); c.lineTo(8, 64); c.fill(); },
    grid: (c) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) c.fillRect(10 + x * 28, 10 + y * 28, 20, 20); },
    cell: (c) => { for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) if ((x + y) % 2 === 0) c.fillRect(8 + x * 19, 8 + y * 19, 19, 19); c.lineWidth = 4; c.strokeRect(8, 8, 112, 112); },
    antenna: (c) => { c.lineWidth = 10; for (let r = 18; r <= 54; r += 18) { c.beginPath(); c.arc(30, 98, r, -1.45, -0.1); c.stroke(); } c.beginPath(); c.arc(30, 98, 10, 0, 7); c.fill(); },
    square: (c) => c.fillRect(14, 14, 100, 100),
    arrows: (c) => { c.lineWidth = 14; c.lineJoin = "miter"; for (const x of [22, 58]) { c.beginPath(); c.moveTo(x, 24); c.lineTo(x + 36, 64); c.lineTo(x, 104); c.stroke(); } },
    star: (c) => { c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 22 : 56, a = -Math.PI / 2 + (i * Math.PI) / 5; c.lineTo(64 + r * Math.cos(a), 64 + r * Math.sin(a)); } c.fill(); },
  };
  const COLOR_SET = [["donut", 1], ["circle", 0], ["circles", 2], ["rhombus", 2], ["grid", 0], ["cell", 4], ["cell", 3], ["antenna", 1], ["cell", 0], ["cell", 2], ["grid", 3], ["square", 5], ["grid", 4], ["arrows", 5], ["donut", 2]];
  const GREY_SET = ["circle", "star", "square"];
  const atlas = (cells) => {
    const cv = document.createElement("canvas");
    cv.width = 128 * cells.length; cv.height = 128;
    const c = cv.getContext("2d");
    cells.forEach(([kind, color], i) => { c.save(); c.translate(i * 128, 0); c.fillStyle = c.strokeStyle = color; DRAW[kind](c); c.restore(); });
    return cv;
  };
  // Picture plate: a black-and-white plate with the text (default ”50”) drawn on it — dots grow only where this plate is bright
  const shapeCanvas = (text, font) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 512;
    const c = cv.getContext("2d");
    c.fillStyle = "#000"; /* Not skin: black-and-white mask panel read by the shader */
    c.fillRect(0, 0, 512, 512);
    c.fillStyle = "#fff"; /* Not skin: black-and-white mask panel read by the shader */
    c.textAlign = "center"; c.textBaseline = "middle";
    let size = 420;
    c.font = `500 ${size}px ${font}`;
    const w = c.measureText(text).width;
    if (w > 470) { size *= 470 / w; c.font = `500 ${size}px ${font}`; }
    c.fillText(text, 256, 270);
    return cv;
  };

  kfFx.register("sprite-points-morph", (el, { options, reduce }) => {
    if (!window.THREE || !THREE.WebGLRenderer) return;
    const o = (k, d) => (options[k] ?? d);
    const params = {
      morph: +o("morph", 0.7), divergence: 0, yOffset: +o("y", 0), cameraZ: 0, opacity: 1,
      pointer: o("pointer", "on") !== "off",
    };
    const canvas = document.createElement("canvas");
    canvas.setAttribute("data-fx-part", "gl");
    canvas.setAttribute("aria-hidden", "true");
    el.prepend(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false }); } catch (e) { canvas.remove(); return; }
    renderer.setPixelRatio(1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 0, 5);
    const font = css("--kf-font-display", el) || "serif";
    const tex = (cv) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.premultiplyAlpha = true; return t; };
    const pal = palette(el), grey = css("--kf-line", el) || "gray";
    const text = o("text", "50");
    const shapeTex = new THREE.CanvasTexture(shapeCanvas(text, font));
    // If drawn before the typeface is ready, it sets with a fallback font (Georgia has old-style numerals so it sags to 31~90% of the panel) and the tops of the letters don’t line up in the Hero — redrawn after the typeface is ready
    let alive = true;
    document.fonts?.load(`500 420px ${font}`, text).then(() => {
      if (!alive) return;
      shapeTex.image = shapeCanvas(text, font); shapeTex.needsUpdate = true;
    }, () => {});
    const mk = (cells, size, amp, min, max) => {
      const geo = new THREE.PlaneGeometry(10, 10, 40, 40);
      const n = geo.attributes.position.count;
      const tgt = new Float32Array(n * 3), rnd = new Float32Array(n), spr = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        // Chosen spot on the sphere (radius 3) — the original gathers to icosahedron vertices
        const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = 3 * Math.sqrt(1 - u * u);
        tgt.set([r * Math.cos(a), r * Math.sin(a), 3 * u], i * 3);
        rnd[i] = Math.random(); spr[i] = Math.floor(Math.random() * cells.length);
      }
      geo.setAttribute("aTarget", new THREE.BufferAttribute(tgt, 3));
      geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
      geo.setAttribute("aSprite", new THREE.BufferAttribute(spr, 1));
      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: true,
        uniforms: {
          uShape: { value: shapeTex }, uAtlas: { value: tex(atlas(cells)) }, uCount: { value: cells.length }, uAlpha: { value: 1 },
          uMorph: { value: params.morph }, uDiv: { value: 0 }, uDivPoint: { value: new THREE.Vector3() }, uSize: { value: size }, uResY: { value: 1 },
          uBeat: { value: 0 }, uAmp: { value: amp }, uMin: { value: min }, uMax: { value: max }, uFreq: { value: 0.3 },
        },
      });
      const pts = new THREE.Points(geo, mat);
      scene.add(pts);
      return pts;
    };
    // Original values: pattern dot size .12 · shimmer 1.5(.5~1.5) · gray dot .13 · 1(.5~1.5), the gray layer sits behind, offset by (.4, -.3, -.1)
    const bg = mk(GREY_SET.map((k) => [k, grey]), 0.13, 1, 0.5, 1.5);
    const fg = mk(COLOR_SET.map(([k, ci]) => [k, pal[ci]]), 0.12, 1.5, 0.5, 1.5);
    bg.position.set(0.4, -0.3, -0.1);

    let w = 0, h = 0;
    const size = () => {
      w = el.clientWidth; h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      fg.material.uniforms.uResY.value = bg.material.uniforms.uResY.value = h;
    };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    // When the board first shows (after the loader), compiling the shader for the first time freezes the screen — so precompile when setting up
    renderer.compile(scene, camera);

    // Cursor (original values): a dot (cur) that follows the cursor position by .4 per frame grows toward it by .08 while it’s still changing, and once caught up returns to center by .08.
    // This is why the original watches ”while changing” all the way to the end — even after the cursor stops, the follow-through lasts about 1 second, so the scatter grows that much more before settling (original shader values: peak 1.1s after stopping → 0 at 2.5s).
    // Points scatter outward from their place by that size × 1.2, and the camera tilts toward cur × .3. The original (R3F) also takes finger press·drag at the same spot
    const zero = new THREE.Vector2(), camTo = new THREE.Vector3(), dp = new THREE.Vector3();
    const ptr = new THREE.Vector2(), last = new THREE.Vector2(), smooth = new THREE.Vector2(), cur = new THREE.Vector2();
    let started = false;
    const onMove = (e) => ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    const PTR_EVENTS = ["pointermove", "pointerdown"];
    if (params.pointer && !reduce) for (const t of PTR_EVENTS) addEventListener(t, onMove, { passive: true });

    const beatLen = 60 / +(o("bpm", 80));
    const sine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
    const start = performance.now();
    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (!visible || !w) return;
      const t = (now - start) / 1000, b = t / beatLen;
      const beat = reduce ? 0 : Math.floor(b) + sine(b - Math.floor(b));
      // The first movement doesn’t follow but jumps to the spot (same as the original)
      if (started) cur.lerp(ptr, 0.4); else cur.copy(ptr);
      const active = !cur.equals(last);
      if (active) started = true;
      last.copy(cur);
      smooth.lerp(active ? cur : zero, 0.08);
      if (smooth.length() < 0.001) smooth.set(0, 0);
      const div = smooth.length() * 1.2 + params.divergence;
      dp.set(smooth.x * 1.2, smooth.y * 1.2, smooth.length());
      for (const p of [fg, bg]) {
        const u = p.material.uniforms;
        u.uMorph.value = params.morph; u.uDiv.value = div; u.uDivPoint.value.copy(dp); u.uBeat.value = beat; u.uAlpha.value = 1;
      }
      fg.position.y = params.yOffset; bg.position.y = params.yOffset - 0.3;
      const camZ = Math.max(Math.min(-(0.0048 * w) + 11.86, 10), 5);
      camera.position.lerp(camTo.set(cur.y * 0.3, cur.x * 0.3, camZ + params.cameraZ), 0.08);
      camera.lookAt(0, 0, params.cameraZ);
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);
    // Handles the consumer (scroll scene) feeds values into — morph·divergence·yOffset·cameraZ
    el.fxPoints = { params, width: () => w };
    // Entry: from the scattered spot (morph .7) to the letter board in 1.6s power2.out — with intro: off, the writing side decides
    if (o("intro", "on") !== "off") {
      if (reduce || !window.gsap) params.morph = 0;
      else gsap.to(params, { morph: 0, duration: +(o("dur", 1.6)), delay: +(o("delay", 0)), ease: "power2.out" });
    }
    return () => {
      alive = false;
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      for (const t of PTR_EVENTS) removeEventListener(t, onMove);
      window.gsap?.killTweensOf(params);
      for (const p of [fg, bg]) { p.geometry.dispose(); p.material.uniforms.uAtlas.value.dispose(); p.material.dispose(); }
      shapeTex.dispose(); renderer.dispose(); canvas.remove(); delete el.fxPoints;
    };
  });
})();
