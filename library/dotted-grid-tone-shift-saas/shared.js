// Shared by the whole site — like the original Base bundle, finds and attaches the on-screen devices, and detaches and re-attaches them on every Taxi screen change.
// Section skin changes, dithered photos, transition covers and section title characters are handled by Motion parts (section-theme-switch · dither-duotone-reveal · noise-dither-cover · blur-chars-random).
(() => {
  const NC = (window.NC = {});
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const desk = () => innerWidth >= 750;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const range = (t, a, b) => clamp01((t - a) / (b - a));
  const cssVar = (n, el = document.documentElement) => getComputedStyle(el).getPropertyValue(n).trim();
  const rgb01 = (v) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:${v}`;
    document.body.append(i);
    const m = getComputedStyle(i).color.match(/[\d.]+/g) || [0, 0, 0];
    i.remove();
    return m.slice(0, 3).map((n) => +n / 255);
  };

  /* ───── Smooth scroll — Lenis 1.3.23 (original build), default lerp .1 ───── */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  NC.lenis = lenis;
  const scrollY = () => (lenis ? lenis.scroll : window.scrollY);

  /* ───── Text splitting — words are inline-block chunks, spaces between them kept as is (Korean line breaking) ───── */
  function split(el) {
    const chars = [];
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 1) { if (!n.matches("br, svg")) walk(n); return; }
      if (n.nodeType !== 3 || !n.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) return frag.append(document.createTextNode(w));
        const wd = document.createElement("span");
        wd.className = "wd";
        [...w].forEach((c) => { const ch = document.createElement("span"); ch.className = "ch"; ch.textContent = c; wd.append(ch); chars.push(ch); });
        frag.append(wd);
      });
      n.replaceWith(frag);
    });
    walk(el);
    return chars;
  }

  /* ───── Cell corner crosses: the original has four 9px crosses per cell (#cross). data-x="tl br" like only a part ───── */
  function crosses(root) {
    $$(".box", root).forEach((b) => {
      if (b.querySelector(":scope > .nc-x")) return;
      (b.dataset.x || "tl tr bl br").split(" ").forEach((k) => { const i = document.createElement("i"); i.className = `nc-x ${k}`; i.setAttribute("aria-hidden", "true"); b.append(i); });
    });
  }

  /* ───── Picture slot — draws a gray brightness picture on canvas to feed the dither panel instead of a photo (brightness gets dotted, so it is not a skin) ───── */
  const shade = (v, a = 1) => `rgb(${v} ${v} ${v} / ${a})`; // Not a skin: brightness values fed to the dither shader
  const ART = {
    // Two spheres + a tilted plate (Intelligence section)
    spheres(x, w, h) {
      x.fillStyle = shade(200); x.fillRect(0, 0, w, h);
      const ball = (cx, cy, r, hi) => {
        const g = x.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.05, cx, cy, r);
        g.addColorStop(0, shade(hi)); g.addColorStop(0.65, shade(90)); g.addColorStop(1, shade(15));
        x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill();
      };
      const g = x.createLinearGradient(w * 0.4, h, w, h * 0.3);
      g.addColorStop(0, shade(70)); g.addColorStop(1, shade(170));
      x.fillStyle = g; x.beginPath(); x.moveTo(w * 0.42, h); x.lineTo(w * 0.95, h * 0.18); x.lineTo(w, h * 0.25); x.lineTo(w, h); x.fill();
      ball(w * 0.24, h * 0.3, h * 0.36, 210); ball(w * 0.2, h * 0.86, h * 0.2, 160); ball(w * 0.68, h * 0.16, h * 0.08, 250);
    },
    // Faint star flower (automation section)
    star(x, w, h) {
      const g = x.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, shade(230)); g.addColorStop(1, shade(150));
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.save(); x.translate(w * 0.5, h * 0.62); x.filter = "blur(6px)";
      x.fillStyle = shade(70); x.beginPath();
      for (let i = 0; i <= 16; i++) { const a = (i / 16) * Math.PI * 2, r = (i % 2 ? 0.28 : 0.4) * h; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      x.fill(); x.restore();
    },
    // Overlapping rings (Savings Section)
    rings(x, w, h) {
      x.fillStyle = shade(190); x.fillRect(0, 0, w, h);
      for (let i = 0; i < 5; i++) {
        x.strokeStyle = shade(40 + i * 30); x.lineWidth = h * 0.08;
        x.beginPath(); x.ellipse(w * (0.3 + i * 0.1), h * 0.55, h * 0.32, h * 0.32, 0, 0, Math.PI * 2); x.stroke();
      }
    },
    // Spot with three people standing in a photo (careers section)
    people(x, w, h, seed = 1) {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, shade(120 + seed * 10)); g.addColorStop(1, shade(40));
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 3 + (seed % 3); i++) {
        const cx = w * (0.2 + ((i * 0.27 + seed * 0.13) % 0.7)), s = h * (0.22 + ((seed + i) % 3) * 0.04);
        const gg = x.createRadialGradient(cx - s * 0.2, h * 0.38 - s * 0.2, 2, cx, h * 0.38, s * 0.6);
        gg.addColorStop(0, shade(235)); gg.addColorStop(1, shade(110));
        x.fillStyle = gg; x.beginPath(); x.arc(cx, h * 0.38, s * 0.45, 0, Math.PI * 2); x.fill();
        x.fillStyle = shade(170 - i * 25); x.beginPath(); x.ellipse(cx, h * 0.86, s * 0.95, s * 0.75, 0, Math.PI, 0); x.fill();
      }
    },
    // Round mesh ball (the loud-talking section)
    globe(x, w, h) {
      x.fillStyle = shade(255, 0); x.fillRect(0, 0, w, h);
      x.strokeStyle = shade(20); x.lineWidth = 2;
      const r = Math.min(w, h) * 0.42;
      for (let i = 0; i < 12; i++) { x.beginPath(); x.ellipse(w / 2, h / 2, r * Math.abs(Math.cos((i / 12) * Math.PI)), r, 0.4, 0, Math.PI * 2); x.stroke(); }
      for (let i = 1; i < 8; i++) { x.beginPath(); x.ellipse(w / 2, h / 2, r, r * (i / 8), 0.4, 0, Math.PI * 2); x.stroke(); }
    },
  };
  function art(img) {
    const [kind, seed] = (img.dataset.art || "spheres").split(":");
    const w = +img.dataset.w || 640, h = +img.dataset.h || 300;
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    (ART[kind] || ART.spheres)(c.getContext("2d"), w, h, +seed || 1);
    img.src = c.toDataURL();
  }

  /* ───── Dot pattern — scattered dots on the review section background (static image) ───── */
  function dotField(cv) {
    const r = cv.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h) return;
    cv.width = w; cv.height = h;
    const x = cv.getContext("2d");
    x.fillStyle = cssVar("--site-fg") || cssVar("--kf-ink");
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let y = 0; y < h; y += 6) for (let i = 0; i < w; i += 6) {
      const n = Math.sin(i * 0.013 + Math.sin(y * 0.02) * 2) * Math.cos(y * 0.017 - i * 0.004);
      if (rnd() < 0.18 + n * 0.22) { x.globalAlpha = 0.35 + rnd() * 0.5; x.fillRect(i, y, 2, 2); }
    }
  }

  /* ───── Torus — the original striped ring 3D model (HDRI rotates on the z axis at 40° per second) with our own shape and shader ───── */
  const TORUS_V = `varying vec3 vN; varying vec3 vP; varying vec2 vUv; varying float vD;
void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vP = mv.xyz; vN = normalize(normalMatrix * normal); vD = -mv.z; gl_Position = projectionMatrix * mv; }`;
  const TORUS_F = `precision highp float;
varying vec3 vN; varying vec3 vP; varying vec2 vUv; varying float vD;
uniform float uTime, uReveal, uResolve, uRings, uIri, uNear, uFar, uDpr;
uniform vec3 uBg, uInk, uMist;
uniform vec2 uRes;
float bayer8(vec2 c){ c = mod(floor(c), 8.0); float v = 0.0; for (int b = 0; b < 3; b++){ float k = pow(2.0, float(b)); float xb = mod(floor(c.x / k), 2.0), yb = mod(floor(c.y / k), 2.0); v += (2.0 * mod(xb + yb, 2.0) + yb) * pow(4.0, 2.0 - float(b)); } return (v + 0.5) / 64.0; }
void main(){
  vec3 n = normalize(vN), v = normalize(-vP);
  float a = radians(40.0) * uTime;
  vec3 L1 = normalize(vec3(cos(a) * 0.9, sin(a) * 0.9, 0.6)), L2 = normalize(vec3(-sin(a * 0.7), cos(a * 0.7), 0.3));
  float ring = 0.5 + 0.5 * cos(vUv.x * 6.2831853 * uRings);
  float groove = pow(ring, 6.0);
  float spec = pow(max(dot(reflect(-L1, n), v), 0.0), 24.0) + 0.6 * pow(max(dot(reflect(-L2, n), v), 0.0), 40.0);
  float diff = max(dot(n, L1), 0.0) * 0.25;
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec3 col = uBg + uInk * (diff + spec * (0.35 + groove * 1.4)) * (0.55 + 0.45 * groove);
  // Thin-film interference rainbow — it’s the material’s light, not a Skin
  vec3 iri = 0.5 + 0.5 * cos(6.2831853 * (fres * 1.6 + vUv.x * 0.6 + vec3(0.0, 0.33, 0.67)));
  col += iri * fres * uIri * (0.4 + groove);
  float fog = smoothstep(uNear, uFar, vD);
  col = mix(col, uBg, fog);
  if (uResolve < 1.0) {
    vec2 cell = floor(gl_FragCoord.xy / (6.0 * uDpr));
    float front = dot((cell * 6.0 * uDpr) / uRes - 0.5, vec2(-1.0, 0.0)) + 0.5;
    float amt = clamp(uReveal * 2.0 - front, 0.0, 1.0);
    float steps = exp2(mix(1.0, 8.0, uResolve)) - 1.0;
    float l = dot(col, vec3(0.299, 0.587, 0.114));
    float tone = floor(l * amt * steps + bayer8(cell)) / steps;
    col = mix(uMist * tone, col * amt, uResolve);
  }
  gl_FragColor = vec4(col, 1.0);
}`;
  const VIEWS = {
    hero: { cam: [0.2, -0.35, 1.25], look: [0.35, 0.15, 0], rot: [1.1, 0.2, 0.3], rings: 260, iri: 0.35, near: 0.6, far: 2.6 },
    side: { cam: [0.9, 0.2, 2.3], look: [0.1, 0, 0], rot: [1.25, -0.35, 0.2], rings: 220, iri: 0.25, near: 1.2, far: 3.6 },
    front: { cam: [0, -0.2, 2.6], look: [0, 0.25, 0], rot: [1.45, 0, 0], rings: 240, iri: 0.25, near: 1.4, far: 3.9 },
    rainbow: { cam: [0.15, 0.6, 1.9], look: [0.3, 0.1, 0], rot: [0.9, 0.5, -0.2], rings: 300, iri: 1.1, near: 1.2, far: 3.4 },
  };
  function torus(host, { view = "side", reveal = false } = {}) {
    const T = window.THREE;
    if (!T) return null;
    const V = VIEWS[view] || VIEWS.side;
    const canvas = document.createElement("canvas");
    canvas.className = "nc-torus";
    host.append(canvas);
    let r;
    try { r = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" }); } catch (e) { return null; }
    const dpr = Math.min(devicePixelRatio || 1, 2);
    r.setPixelRatio(dpr);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, 0.05, 20);
    cam.position.set(...V.cam); cam.lookAt(...V.look);
    const u = {
      uTime: { value: 0 }, uReveal: { value: reveal ? 0 : 1 }, uResolve: { value: reveal ? 0 : 1 }, uRings: { value: V.rings }, uIri: { value: V.iri },
      uNear: { value: V.near }, uFar: { value: V.far }, uDpr: { value: dpr }, uRes: { value: new T.Vector2(1, 1) },
      uBg: { value: new T.Vector3(...rgb01("var(--kf-bg)")) }, uInk: { value: new T.Vector3(...rgb01("var(--kf-ink)")) }, uMist: { value: new T.Vector3(...rgb01("var(--kf-dim)")) },
    };
    const mesh = new T.Mesh(new T.TorusGeometry(1, 0.42, 220, 720), new T.ShaderMaterial({ uniforms: u, vertexShader: TORUS_V, fragmentShader: TORUS_F }));
    mesh.rotation.set(...V.rot);
    scene.add(mesh);
    let seen = true;
    const size = () => {
      const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
      r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); u.uRes.value.set(w * dpr, h * dpr);
    };
    const ro = new ResizeObserver(size); ro.observe(host); size();
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting)); io.observe(host);
    const tick = (t, dt) => { if (!seen) return; if (!reduce) u.uTime.value += dt / 1000; r.render(scene, cam); };
    gsap.ticker.add(tick);
    gsap.set(canvas, { autoAlpha: 0 });
    return {
      canvas, u,
      reveal(instant) { gsap.to(canvas, { autoAlpha: 1, duration: instant || reduce ? 0 : 1.2, ease: "power2.out" }); },
      // Original first reveal of the video panel — a 6px cell dither goes from right to left over 1.5s sine.inOut, then steps go from 2 to 256 over 1.5s
      dither() {
        gsap.set(canvas, { autoAlpha: 1 });
        if (reduce) { u.uReveal.value = u.uResolve.value = 1; return; }
        gsap.timeline({ delay: 0.2 }).to(u.uReveal, { value: 1, duration: 1.5, ease: "sine.inOut" }).to(u.uResolve, { value: 1, duration: 1.5, ease: "sine.inOut" });
      },
      destroy() { gsap.ticker.remove(tick); ro.disconnect(); io.disconnect(); r.dispose(); r.forceContextLoss(); canvas.remove(); },
    };
  }

  /* ───── Lottie — our own artwork at the same size and tempo as the original bars.json (600×160 · 30fps · 120 frames) and waves.json (16 frames), via lottie-web ───── */
  const lv = (k) => ({ a: 0, k });
  const tr = () => ({ ty: "tr", p: lv([0, 0]), a: lv([0, 0]), s: lv([100, 100]), r: lv(0), o: lv(100) });
  const fill = () => ({ ty: "fl", c: lv([0, 0, 0, 1]), o: lv(100), r: 1 });
  const strokeOf = (w) => ({ ty: "st", c: lv([0, 0, 0, 1]), o: lv(100), w: lv(w), lc: 1, lj: 1 });
  function barsData() {
    let s = 11;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const layers = [];
    for (let i = 0; i < 120; i++) {
      const keys = [0, 20, 40, 60, 80, 100, 120].map((t, j, a) => {
        const v = j === a.length - 1 ? null : 15 + Math.pow(rnd(), 1.6) * 85;
        return { t, s: [100, v ?? 0, 100], i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } };
      });
      keys[keys.length - 1].s = keys[0].s;
      layers.push({
        ty: 4, ind: i + 1, ip: 0, op: 120, st: 0, sr: 1, bm: 0,
        ks: { o: lv(100), r: lv(0), p: lv([30 + i * 4.5, 80, 0]), a: lv([0, 0, 0]), s: { a: 1, k: keys } },
        shapes: [{ ty: "gr", it: [{ ty: "rc", d: 1, s: lv([1.6, 100]), p: lv([0, 0]), r: lv(0) }, fill(), tr()] }],
      });
    }
    const brk = (x, dir) => ({ ty: "gr", it: [{ ty: "sh", ks: lv({ c: false, v: [[x + dir * 8, 18], [x, 18], [x, 142], [x + dir * 8, 142]], i: [[0, 0], [0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0], [0, 0]] }) }, strokeOf(1.5), tr()] });
    layers.unshift({ ty: 4, ind: 200, ip: 0, op: 120, st: 0, sr: 1, bm: 0, ks: { o: lv(100), r: lv(0), p: lv([0, 0, 0]), a: lv([0, 0, 0]), s: lv([100, 100, 100]) }, shapes: [brk(14, 1), brk(586, -1)] });
    return { v: "5.7.0", fr: 30, ip: 0, op: 120, w: 600, h: 160, nm: "bars", ddd: 0, assets: [], layers };
  }
  function wavesData() {
    const P = 66, pts = (ph) => { const v = []; for (let x = -P; x <= 600 + P; x += 3) v.push([x, 70 + Math.sin(((x / P) * 2 + ph) * Math.PI) * 34]); return v; };
    // lottie converts the tangent arrays to absolute coordinates in place — if i·o are given the same array, it is added twice and the lines burst into a fan
    const path = (ph) => { const v = pts(ph); return { ty: "sh", ks: lv({ c: false, v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]) }) }; };
    const move = { a: 1, k: [{ t: 0, s: [0, 0, 0], i: { x: [1], y: [1] }, o: { x: [0], y: [0] } }, { t: 16, s: [P, 0, 0] }] };
    const ticks = { ty: "gr", it: [...Array(100)].map((_, i) => ({ ty: "sh", ks: lv({ c: false, v: [[i * 6, 150], [i * 6, i % 5 ? 146 : 142]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }) })).concat([{ ty: "sh", ks: lv({ c: false, v: [[0, 150], [600, 150]], i: [[0, 0], [0, 0]], o: [[0, 0], [0, 0]] }) }, strokeOf(1), tr()]) };
    const lay = (ind, shapes, ks) => ({ ty: 4, ind, ip: 0, op: 16, st: 0, sr: 1, bm: 0, ks: { o: lv(100), r: lv(0), a: lv([0, 0, 0]), s: lv([100, 100, 100]), p: lv([0, 0, 0]), ...ks }, shapes });
    return {
      v: "5.7.0", fr: 30, ip: 0, op: 16, w: 600, h: 160, nm: "waves", ddd: 0, assets: [],
      layers: [lay(1, [{ ty: "gr", it: [path(0), strokeOf(1.5), tr()] }], { p: move }), lay(2, [{ ty: "gr", it: [path(1), strokeOf(1.5), tr()] }], { p: move }), lay(3, [ticks])],
    };
  }
  const LOTTIE = { bars: barsData, waves: wavesData };

  /* ───── Motion parts — a mount/unmount pair attached per screen ───── */
  const C = {};

  // Logo strip — 60px per second, one set cloned to screen width + 2 (original marquee speed 60, gap 0)
  C.marquee = (el) => {
    const track = $(".mq-track", el), first = track?.firstElementChild;
    if (!first) return;
    let tw;
    const setup = () => {
      tw?.kill();
      [...track.children].slice(1).forEach((c) => c.remove());
      const w = first.getBoundingClientRect().width;
      if (!w) return;
      const n = Math.ceil(innerWidth / w) + 2;
      for (let i = 1; i < n * 2; i++) { const c = first.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.append(c); }
      const dist = n * w, wrap = gsap.utils.wrap(-dist, 0);
      gsap.set(track, { x: 0 });
      if (!reduce) tw = gsap.to(track, { x: `-=${dist}`, duration: dist / 60, ease: "none", repeat: -1, modifiers: { x: (v) => `${wrap(parseFloat(v))}px` } });
    };
    setup();
    addEventListener("resize", setup);
    return () => { tw?.kill(); removeEventListener("resize", setup); };
  };

  // Layer art Lottie — plays only while the board is within 200px above or below the screen (original start top bottom+=200)
  C.lottie = (el) => {
    if (!window.lottie) return;
    const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: false, animationData: (LOTTIE[el.dataset.lottie] || barsData)() });
    if (reduce) { anim.goToAndStop(0, true); return () => anim.destroy(); }
    const st = ScrollTrigger.create({ trigger: el, start: "top bottom+=200", end: "bottom top-=200", onToggle: (s) => (s.isActive ? anim.play() : anim.pause()) });
    return () => { st.kill(); anim.destroy(); };
  };

  // Platform section — wide screens: the panel is pinned to the bottom and the current item opens while scrolling items × screen height. Clicking a name scrolls there in 1s.
  // Narrow screen: tap the name to open (content row height .4s ease)
  C.platform = (el) => {
    const track = $(".pf-track", el), pin = $(".pf-pin", el), items = $$(".pf-item", el), plates = $$(".pf-plate", el).sort((a, b) => a.dataset.i - b.dataset.i);
    if (!track || items.length < 2) return;
    let cur = -1, st = null;
    const setActive = (i) => {
      if (i === cur) return;
      cur = i;
      items.forEach((it, k) => it.classList.toggle("is-active", k === i));
      plates.forEach((p, k) => p.classList.toggle("is-on", k === i));
    };
    const offsets = () => parseFloat(getComputedStyle(el).paddingBottom) || 0;
    const onTitle = (e) => {
      const i = items.indexOf(e.currentTarget.closest(".pf-item"));
      if (!st || i < 0 || i === cur) return;
      const y = st.start + ((i + 0.5) / items.length) * (st.end - st.start);
      lenis ? lenis.scrollTo(y, { duration: 1 }) : scrollTo({ top: y, behavior: "smooth" });
    };
    const onToggle = (e) => setActive(items.indexOf(e.currentTarget.closest(".pf-item")));
    const titles = $$(".pf-title", el), toggles = $$(".pf-toggle", el);
    const build = () => {
      st?.kill(); st = null;
      pin.style.height = ""; track.style.height = ""; pin.style.top = "";
      titles.forEach((t) => t.removeEventListener("click", onTitle));
      toggles.forEach((t) => t.removeEventListener("click", onToggle));
      if (!desk()) { setActive(cur < 0 ? 0 : cur); toggles.forEach((t) => t.addEventListener("click", onToggle)); return; }
      cur = -1; setActive(0);
      const ph = pin.offsetHeight, off = offsets();
      pin.style.height = `${ph}px`;
      track.style.height = `${ph + items.length * innerHeight}px`;
      pin.style.top = `${-(ph - innerHeight + off)}px`;
      st = ScrollTrigger.create({ trigger: track, start: () => `top bottom-=${off + ph}`, end: () => `+=${track.offsetHeight - ph}`, onUpdate: (s) => setActive(Math.min(items.length - 1, Math.floor(s.progress * items.length))) });
      titles.forEach((t) => t.addEventListener("click", onTitle));
    };
    build();
    let was = desk();
    const rs = () => { if (desk() !== was) { was = desk(); build(); ScrollTrigger.refresh(); } };
    addEventListener("resize", rs);
    return () => { st?.kill(); removeEventListener("resize", rs); titles.forEach((t) => t.removeEventListener("click", onTitle)); toggles.forEach((t) => t.removeEventListener("click", onToggle)); };
  };

  // Before/after comparison — pressing Before turns the section skin dark ink (parts follow the data-bg change), and the picker pill moves over with .4s ease-in-out
  C.compare = (el) => {
    const before = $("[data-cmp=before]", el), after = $("[data-cmp=after]", el);
    const set = (k) => { el.classList.toggle("is-before", k === "before"); el.dataset.bg = k === "before" ? "black" : "neue"; };
    const b = () => set("before"), a = () => set("after");
    before?.addEventListener("click", b); after?.addEventListener("click", a);
    return () => { before?.removeEventListener("click", b); after?.removeEventListener("click", a); };
  };

  // Accordion — FAQ and footer menus. Height .5s expo.inOut, plus/minus .3s, opening one closes the others in the same group (FAQ)
  C.fold = (el) => {
    const items = $$("[data-fold-item]", el), only = el.hasAttribute("data-fold-one");
    const open = (it, on) => {
      it.classList.toggle("is-open", on);
      $("[data-fold-trigger]", it)?.setAttribute("aria-expanded", on);
      gsap.to($("[data-fold-panel]", it), { height: on ? "auto" : 0, duration: reduce ? 0 : 0.5, ease: "expo.inOut", onComplete: () => { lenis?.resize(); ScrollTrigger.refresh(); } });
      gsap.to($(".cross", it), { autoAlpha: on ? 0 : 1, duration: 0.3 });
      gsap.to($(".line", it), { autoAlpha: on ? 1 : 0, duration: 0.3 });
    };
    const handlers = items.map((it) => {
      const h = () => { const on = !it.classList.contains("is-open"); if (on && only) items.forEach((o) => o !== it && o.classList.contains("is-open") && open(o, false)); open(it, on); };
      $("[data-fold-trigger]", it)?.addEventListener("click", h);
      return [it, h];
    });
    return () => handlers.forEach(([it, h]) => $("[data-fold-trigger]", it)?.removeEventListener("click", h));
  };

  // List filtering — filter panel height .5s expo.inOut
  C.filters = (el) => {
    const btn = $("[data-filter-toggle]", el), wrap = $("[data-filter-wrap]", el);
    if (!btn || !wrap) return;
    const h = () => {
      const on = !wrap.classList.contains("is-open");
      wrap.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", on);
      gsap.to(wrap, { height: on ? "auto" : 0, duration: reduce ? 0 : 0.5, ease: "expo.inOut", onComplete: () => ScrollTrigger.refresh() });
    };
    btn.addEventListener("click", h);
    const chips = $$(".chip", wrap), pick = (e) => chips.forEach((c) => c.classList.toggle("is-active", c === e.currentTarget));
    chips.forEach((c) => c.addEventListener("click", pick));
    return () => { btn.removeEventListener("click", h); chips.forEach((c) => c.removeEventListener("click", pick)); };
  };

  // Drag slider — the original hand-built slider (drag · snaps to the nearest slot on release · follow .1). Arrows move one slot at a time
  C.slider = (el) => {
    const vp = $(".sl-viewport", el), track = $(".sl-track", el);
    if (!vp || !track) return;
    const slides = [...track.children];
    let x = 0, target = 0, down = null, moved = false, max = 0, idx = 0;
    const measure = () => { max = Math.max(0, track.scrollWidth - vp.clientWidth); target = Math.min(target, max); };
    const snapTo = (i) => { idx = Math.max(0, Math.min(slides.length - 1, i)); target = Math.min(max, slides[idx].offsetLeft - slides[0].offsetLeft); center(); };
    const nearest = () => { let b = 0, d = Infinity; slides.forEach((s, i) => { const dd = Math.abs(s.offsetLeft - slides[0].offsetLeft - target); if (dd < d) { d = dd; b = i; } }); return b; };
    const center = () => {
      if (!el.hasAttribute("data-center")) return;
      const mid = target + vp.clientWidth / 2;
      let b = 0, d = Infinity;
      slides.forEach((s, i) => { const c = s.offsetLeft - slides[0].offsetLeft + s.offsetWidth / 2, dd = Math.abs(c - mid); if (dd < d) { d = dd; b = i; } });
      slides.forEach((s, i) => s.classList.toggle("is-center", i === b));
      const bar = $(".sl-progress i", el);
      if (bar) bar.style.transform = `scaleX(${(b + 1) / slides.length})`;
    };
    const tick = () => { x += (target - x) * (reduce ? 1 : 0.1); if (Math.abs(target - x) < 0.05) x = target; track.style.transform = `translate3d(${-x}px,0,0)`; };
    const pd = (e) => { down = { x: e.clientX, t: target }; moved = false; vp.setPointerCapture?.(e.pointerId); };
    const pm = (e) => { if (!down) return; const dx = e.clientX - down.x; if (Math.abs(dx) > 6) moved = true; target = Math.max(0, Math.min(max, down.t - dx)); };
    const pu = () => { if (!down) return; down = null; if (moved) snapTo(nearest()); };
    const click = (e) => {
      if (moved) { e.preventDefault(); return; }
      if (el.hasAttribute("data-halves")) snapTo(idx + (e.clientX > innerWidth / 2 ? 1 : -1));
    };
    const prev = $("[data-sl-prev]", el), next = $("[data-sl-next]", el);
    const goP = () => snapTo(idx - 1), goN = () => snapTo(idx + 1);
    vp.addEventListener("pointerdown", pd); addEventListener("pointermove", pm); addEventListener("pointerup", pu);
    vp.addEventListener("click", click, true);
    prev?.addEventListener("click", goP); next?.addEventListener("click", goN);
    measure(); center();
    const ro = new ResizeObserver(() => { measure(); center(); }); ro.observe(vp);
    gsap.ticker.add(tick);
    // Cursor over the photo frame — left half of the screen shows Prev, right half shows Next, following by .15 of the remaining distance each frame
    const cur = $(".sl-cursor", el);
    let cx = 0, cy = 0, tx = 0, ty = 0, inside = false;
    const cm = (e) => {
      const r = vp.getBoundingClientRect();
      inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      el.classList.toggle("is-cursor", inside);
      if (!inside) return;
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!cur.dataset.placed) { cx = tx; cy = ty; cur.dataset.placed = 1; }
      cur.classList.toggle("is-next", e.clientX > innerWidth / 2);
    };
    const ct = () => { if (!inside) return; cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15; cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; };
    if (cur && fine) { addEventListener("pointermove", cm); gsap.ticker.add(ct); }
    return () => {
      gsap.ticker.remove(tick); gsap.ticker.remove(ct); ro.disconnect();
      vp.removeEventListener("pointerdown", pd); removeEventListener("pointermove", pm); removeEventListener("pointerup", pu); removeEventListener("pointermove", cm);
      vp.removeEventListener("click", click, true); prev?.removeEventListener("click", goP); next?.removeEventListener("click", goN);
    };
  };

  // 3D ring panel (Careers and Features hero, getting-started graphic)
  C.torus = (el) => {
    const t = torus(el, { view: el.dataset.torus, reveal: el.hasAttribute("data-torus-dither") });
    if (!t) return;
    el._torus = t;
    if (!el.closest("[data-hero]")) t.reveal(true);
    return () => t.destroy();
  };

  C.dots = (el) => {
    const cv = document.createElement("canvas");
    cv.className = "nc-dots";
    el.append(cv);
    const draw = () => dotField(cv);
    draw();
    const ro = new ResizeObserver(draw); ro.observe(el);
    return () => { ro.disconnect(); cv.remove(); };
  };

  /* ───── Hero — original heroHome: holds 300vh while the video background shrinks 3 → .2x, the dotted frame expands to the screen edges, and the background blends from ink to light lavender ───── */
  C.heroHome = (el) => {
    const q = (s) => $(s, el), qa = (s) => $$(s, el);
    const bg = q(".hh-bg"), overlay = q(".hh-overlay"), overlayBg = q(".hh-overlay-bg"), borders = q(".hh-borders"), top = q(".hh-top");
    const title = q(".hh-title"), subs = qa(".hh-sub"), big = q(".hh-big");
    const lines = qa(".hh-title .ln").map((e) => ({ e, top: e.getBoundingClientRect().top, v: -1 })).sort((a, b) => b.top - a.top);
    const reveal = (els) => els.flatMap((e) => ((e.style.opacity = 1), split(e))).map((c) => (gsap.set(c, { opacity: 0 }), { c, s: Math.random() * 0.6, v: 0 }));
    const subChars = reveal(subs), bigChars = reveal([big]);
    const show = (arr, t) => arr.forEach((o) => { const v = range(t, o.s, o.s + 0.4); if (v !== o.v) { o.v = v; o.c.style.opacity = v; } });
    const hide = (t) => {
      const n = lines.length, span = 1 - 0.15 * (n - 1);
      lines.forEach((l, i) => { const a = range(t, i * 0.15, i * 0.15 + span); if (a !== l.v) { l.v = a; l.e.style.transform = `translateY(${-101 * a * a}%)`; l.e.style.opacity = 1 - a; } });
    };
    const scroll = (t) => {
      const c = range(t, 0.1, 0.4), u = range(t, 0.4, 0.6), f = range(t, 0.6, 1), d = range(t, 0.4, 0.5), g = range(t, 0.6, 0.8), p = range(t, 0.8, 0.9);
      const m = desk(), base = m ? 8 : 4;
      bg.style.transform = `translate(-50%,-50%) scale(${3 - c * 2.8})`;
      bg.style.opacity = 1 - u;
      overlay.style.transform = `translate(-50%,-50%) scale(${0.3 + f})`;
      overlay.style.opacity = u * 0.5;
      const w = base * (1 + c * (m ? 3 : 4)), h = base * (1 + c * (m ? 1.4 : 4));
      borders.style.width = `calc(${w}rem + (100% - ${base}rem - ${w}rem) * ${f})`;
      borders.style.height = `calc(${h}rem + (100% - ${base}rem - ${h}rem) * ${f})`;
      borders.style.transform = `translate(-50%,0%) translateY(-${c * 50}%)`;
      el.style.setProperty("--hh-mix", `${g * 100}%`);
      hide(range(t, 0, 0.18));
      top.style.opacity = 1 - d;
      top.style.pointerEvents = d >= 1 ? "none" : "";
      overlayBg.style.opacity = g;
      const want = g >= 0.5 ? "nebula-light" : "black";
      if (el.dataset.bg !== want) el.dataset.bg = want;
      show(subChars, d); show(bigChars, p);
    };
    const tl = q(".hh-timeline");
    const st = ScrollTrigger.create({ trigger: tl, start: "top top", end: "bottom bottom", onUpdate: (s) => scroll(s.progress) });
    scroll(0);
    el._intro = () => {
      const intro = q(".hh-intro");
      gsap.set(intro, { width: 0, height: 0, transformOrigin: "0px 1px" });
      const tlI = gsap.timeline({ delay: 0.2, defaults: { ease: "power2.out" } });
      tlI.to(intro, { rotation: 180, duration: 0.6, ease: "power2.inOut" })
        .to(intro, { rotation: 360, duration: 0.6, ease: "power2.inOut" }, "+=0.5")
        .to(intro, { width: "100%", height: "100%", duration: 1.2 }, "+=0.5");
      heroIntro(el, tlI, "-=1.2");
      tlI.timeScale(reduce ? 100 : 44 / 23);
      bg._torus?.dither();
      return tlI;
    };
    return () => { st.kill(); };
  };

  // Hero text resolve: header line drops in .8s, title letters blur 8px → 1.2s (spread .8 random), description letters .8s (spread .8, +.2), pill 0→1 .8s, button +.4, button text .6s (spread .4, +1.2)
  function heroIntro(el, tl, at = 0) {
    const title = $$("[data-intro=title]", el).flatMap(split), desc = $$("[data-intro=desc]", el).flatMap(split);
    const pill = $$("[data-intro=pill]", el), btns = $$("[data-intro=btn]", el), btnText = btns.flatMap((b) => split($(".bt", b) || b));
    gsap.set(title, { opacity: 0, filter: "blur(8px)" });
    gsap.set(desc, { opacity: 0 });
    gsap.set([...pill, ...btns], { scale: 0 });
    gsap.set(btnText, { opacity: 0 });
    tl.add("heroIntro", at);
    tl.add(header.reveal(), "heroIntro");
    tl.to(title, { opacity: 1, filter: "blur(0px)", clearProps: "filter", duration: 1.2, ease: "power2.out", stagger: { amount: 0.8, from: "random" } }, "heroIntro");
    tl.to(desc, { opacity: 1, duration: 0.8, ease: "power2.out", stagger: { amount: 0.8, from: "random" } }, "heroIntro+=0.2");
    if (pill.length) tl.to(pill, { scale: 1, duration: 0.8, ease: "power2.out" }, "heroIntro");
    if (btns.length) tl.to(btns, { scale: 1, duration: 0.8, ease: "power2.out" }, "heroIntro+=0.4");
    if (btnText.length) tl.to(btnText, { opacity: 1, duration: 0.6, ease: "power2.out", stagger: { amount: 0.4, from: "random" } }, "heroIntro+=1.2");
    return tl;
  }

  // 3D model Hero (careers·features) — when the model stands it appears over 1.2s and the text comes into focus .3s later (time scale 1.2)
  C.heroModel = (el) => {
    el._intro = () => {
      const tl = gsap.timeline({ paused: true });
      heroIntro(el, tl);
      tl.timeScale(1.2);
      const t = $("[data-torus]", el)?._torus;
      t?.reveal();
      gsap.delayedCall(reduce ? 0 : 0.3, () => tl.play());
      return tl;
    };
  };

  /* ───── Header line ───── */
  const header = (() => {
    const el = $(".nc-head"), bar = $(".nc-head__bar"), burger = $(".nc-burger"), menu = $(".nc-mmenu");
    let last = 0, dir = "up", hidden = false, solid = false, open = false, busy = false, theme = "black";
    const fillOf = (on) => (on ? (theme === "black" ? cssVar("--kf-bg") : cssVar("--kf-accent")) : "transparent");
    const setHidden = (h) => { if (h === hidden) return; hidden = h; el.classList.toggle("is-hidden", h); gsap.to(bar, { yPercent: h ? -100 : 0, duration: 0.4, ease: "power2.out", overwrite: "auto" }); };
    const setSolid = (s, h) => { if (s === solid) return; solid = s; if (!open) gsap.to(bar, { backgroundColor: fillOf(s), duration: h ? 0 : 0.3, delay: h ? 0.4 : 0, ease: "power2.out", overwrite: "auto" }); };
    const onScroll = () => {
      const y = scrollY(), d = y - last;
      if (Math.abs(d) > 1) dir = d > 0 ? "down" : "up";
      last = y;
      const h = y > 150 && dir === "down" && !open;
      let s = solid;
      if (h) s = true;
      if (y < 500) s = false;
      setHidden(h); setSolid(s, h);
    };
    gsap.ticker.add(onScroll);
    const toggleMenu = () => {
      if (busy) return;
      open = !open; busy = true;
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open);
      el.classList.toggle("is-menu-open", open);
      gsap.to(bar, { backgroundColor: fillOf(open ? false : solid), duration: 0.3 });
      gsap.to(menu, { autoAlpha: open ? 1 : 0, duration: 0.5, onComplete: () => (busy = false) });
      if (open) lenis?.stop(); else { lenis?.start(); $$(".m-item.is-open", menu).forEach((m) => sub(m, false)); }
    };
    const sub = (m, on) => { m.classList.toggle("is-open", on); $(".m-trigger", m).setAttribute("aria-expanded", on); gsap.to($(".m-panel", m), { height: on ? "auto" : 0, duration: 0.4, ease: "power2.inOut" }); };
    burger.addEventListener("click", toggleMenu);
    $$(".m-item", menu).forEach((m) => $(".m-trigger", m)?.addEventListener("click", (e) => { e.preventDefault(); sub(m, !m.classList.contains("is-open")); }));
    return {
      el,
      close() { if (open) toggleMenu(); },
      // When the screen changes — set text color by the Hero skin, and hide upward on pages where the Hero text resolves in
      enter(view) {
        theme = view.dataset.headTheme || "black";
        el.classList.toggle("is-light", theme !== "black");
        last = 0; dir = "up"; hidden = false; solid = false;
        el.classList.remove("is-hidden");
        gsap.killTweensOf(bar);
        gsap.set(bar, { yPercent: view.querySelector("[data-header-intro]") ? -100 : 0, backgroundColor: fillOf(false) });
        gsap.to(el, { autoAlpha: 1, duration: 0.5 });
        $$("a", el).concat($$("a", menu)).forEach((a) => a.classList.toggle("active", a.getAttribute("href") === view.dataset.file));
      },
      reveal: () => gsap.to(bar, { yPercent: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" }),
    };
  })();

  /* ───── Screen stitching ───── */
  let offs = [];
  function mount(view) {
    crosses(view);
    $$("img[data-art]", view).forEach(art);
    const pairs = [
      ["[data-marquee]", C.marquee], ["[data-lottie]", C.lottie], ["[data-platform]", C.platform], ["[data-compare]", C.compare],
      ["[data-fold]", C.fold], ["[data-filter]", C.filters], ["[data-slider]", C.slider], ["[data-torus]", C.torus], ["[data-dots]", C.dots],
      ["[data-hero=home]", C.heroHome], ["[data-hero=model]", C.heroModel],
    ];
    pairs.forEach(([sel, fn]) => $$(sel, view).forEach((el) => { const off = fn(el); if (off) offs.push(off); }));
    header.enter(view);
    ScrollTrigger.refresh();
  }
  function unmount() { offs.forEach((f) => f()); offs = []; }
  function animateIn(view) {
    gsap.set(view, { autoAlpha: 1 });
    const hero = $("[data-hero]", view);
    if (hero?._intro) hero._intro();
  }
  NC.mount = mount;

  /* ───── Transition — Taxi 1.9.1. On leaving, a noise dither curtain .8s power3.in, when the new screen is up it lifts in 1s power2.out, and the text settles at its halfway point ───── */
  const body = document.body;
  const cover = () => new Promise((done) => body.dispatchEvent(new CustomEvent("fx:cover", { detail: { done } })));
  const uncover = () => new Promise((done) => body.dispatchEvent(new CustomEvent("fx:uncover", { detail: { done } })));
  function bindTaxi() {
    const T = window.taxi;
    if (!T || !/^https?:$/.test(location.protocol)) return false;
    class Cover extends T.Transition {
      onLeave({ done }) { header.close(); cover().then(() => { unmount(); done(); }); }
      onEnter({ done }) { done(); }
    }
    const core = new T.Core({ links: 'a[href$=".html"]:not([target]):not([href*="/"]):not([data-taxi-ignore])', removeOldContent: true, allowInterruption: false, transitions: { default: Cover } });
    core.on("NAVIGATE_OUT", () => lenis?.stop());
    core.on("NAVIGATE_IN", ({ to }) => {
      lenis?.scrollTo(0, { immediate: true, force: true });
      scrollTo(0, 0);
      const view = to.renderer.content;
      document.title = to.page?.title || document.title;
      mount(view);
      lenis?.start();
      gsap.delayedCall(0.5, () => animateIn(view));
      uncover();
    });
    return true;
  }
  function bindFileNav() {
    const KEY = "nc-nav";
    if (sessionStorage.getItem(KEY) === "1") { sessionStorage.removeItem(KEY); NC.arrivedCovered = true; }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || a.hasAttribute("data-taxi-ignore") || e.metaKey || e.ctrlKey || e.button) return;
      if (!/^[\w-]+\.html$/.test(a.getAttribute("href"))) return;
      e.preventDefault();
      header.close();
      cover().then(() => { sessionStorage.setItem(KEY, "1"); location.href = a.getAttribute("href"); });
    });
  }

  let taxiOn = false;
  try { taxiOn = bindTaxi(); } catch (err) { console.warn("Can’t hail a Taxi, so it falls back to regular travel", err); }
  if (!taxiOn) bindFileNav();

  // First open — cover (background color) lifts in 1s, the screen is fixed, then text forms. When arriving via file://, it starts with the dither curtain covering and lifts
  NC.start = () => {
    const view = $("[data-taxi-view]");
    const load = $(".nc-load");
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    (() => {
      mount(view);
      if (NC.arrivedCovered) {
        gsap.set(load, { autoAlpha: 0 });
        body.dispatchEvent(new CustomEvent("fx:cover", { detail: { instant: true } }));
        gsap.delayedCall(0.1, () => { uncover(); gsap.delayedCall(0.5, () => animateIn(view)); });
        return;
      }
      gsap.to(load, { opacity: 0, duration: reduce ? 0 : 1, onComplete: () => { load.style.visibility = "hidden"; animateIn(view); } });
    })();
    addEventListener("load", () => ScrollTrigger.refresh());
  };
})();
