// Home page stage — the original lays out one plane row keyed from a green-screen model video (VideoTexture) with a chroma-key shader, using an orthographic camera (screen height = 1) Place it in front.
// The copy moves a figure silhouette (our shape) drawn with a shader instead of video on the same board with the same formula:
//   Single line   x = (i/(n-1) − .5)·.75·W, size = .75/n·W·16/9            (W = Screen width/height)
//   Ring (phone) angle = i/n·2π + π/2, radius .4·W, .8x vertical, size .1
//   Carousel r = (i − focus)/(4−1 · phone 3−1), size = cubicIn(1−|r|) from .2→1 (phone .7), x = r·(.8 + .55·size)·W,
//            Opaque = expoIn(1−|r|; −.2→1), blur = expoIn(1−|r|; .5→1 to 1→0)
//   Spread 0→1 in .8s quintInOut, each person again quintInOut over [0, 1 − (.2/R)·(R − focus distance)] — the closer to the focus, the earlier it arrives
// The shader adds grain (±.05) as in the original, a .05s horizontal jitter every 2s and a horizontal smear at the left edge, and fades in over .25s sineOut when loaded.
(() => {
  const host = document.querySelector(".bc-stage");
  if (!host || !window.THREE) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const N = 11, RATIO = 9 / 16;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 0.5, -0.5, -10, 10);

  // Make figure colors from skin colors — this skin has no accent color, so mix text·secondary·surface colors to pick the clothes·pants·hair tones
  const css = getComputedStyle(document.documentElement);
  const C = (name) => { const v = css.getPropertyValue(name).trim(); return v ? new THREE.Color(v) : new THREE.Color(0.5, 0.5, 0.5); };
  const ink = C("--kf-ink"), soft = C("--kf-ink-soft"), dim = C("--kf-dim"), raised = C("--kf-raised");
  const mix = (a, b, t) => a.clone().lerp(b, t);

  const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  const frag = `
    precision highp float;
    varying vec2 vUv;
    uniform float uGlitch, uTime, uSeed, uOpacity, uRoll, uLoading, uBlur, uRatio, uCoat, uStance, uArm, uLean;
    uniform vec3 uTop, uBot, uHead;
    float rnd(vec2 s){ return fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453); }
    float sdCap(vec2 p, vec2 a, vec2 b, float r){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h) - r; }
    float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.)) + min(max(q.x, q.y), 0.) - r; }
    void main(){
      vec2 uv = vUv;
      // Every 2s a horizontal jitter per cell for .05s (original mod(uTime, 2.) > 1.95)
      if (uGlitch > .5 && mod(uTime, 2.0) > 1.95) uv.x += (rnd(floor(uv * vec2(102., 32.)) + uSeed) * 2. - 1.) / 256.;
      // The closer to the left edge, the more each line smears sideways
      uv.x *= 1. + (rnd(vec2(floor(uv.y * 180.), floor(uTime * 12.))) - .5) * .01 / max(uv.x, .05) * .15;
      vec2 p = vec2((uv.x - .5) * uRatio, uv.y);
      p.x -= uLean * (p.y - .05);
      float hip = .5;
      float head = length(p - vec2(0., .865)) - .043;
      float neck = sdCap(p, vec2(0., .80), vec2(0., .83), .016);
      float torso = sdBox(p - vec2(0., .655 - uCoat * .09), vec2(.074 + uCoat * .01, .13 + uCoat * .09), .03);
      float legL = sdCap(p, vec2(-.03, hip), vec2(-.03 - uStance, .06), .028);
      float legR = sdCap(p, vec2(.03, hip), vec2(.03 + uStance * .6, .06), .028);
      float footL = sdBox(p - vec2(-.03 - uStance - .012, .045), vec2(.03, .012), .008);
      float footR = sdBox(p - vec2(.03 + uStance * .6 + .012, .045), vec2(.03, .012), .008);
      vec2 elbow = vec2(.11 + uArm * .05, .66);
      float armL = min(sdCap(p, vec2(-.07, .76), vec2(-elbow.x, elbow.y), .02), sdCap(p, vec2(-elbow.x, elbow.y), vec2(-.06, .55 + uArm * .02), .018));
      float armR = sdCap(p, vec2(.07, .76), vec2(.09, .5), .02);
      float top = min(torso, min(armL, armR));
      float bot = min(min(legL, legR), min(footL, footR));
      float hd = min(head, neck);
      float d = min(min(top, bot), hd);
      float soft = .0025 + uBlur * .03;
      float a = 1. - smoothstep(-soft, soft, d);
      vec3 col = top < min(bot, hd) ? uTop : (bot < hd ? uBot : uHead);
      // Vertical shading like clothing folds
      col *= .9 + .1 * smoothstep(-.08, .08, p.x + .02);
      // Grain — ±.05 per pixel like the original
      // Grain — the original lays a fresh grain over the video every frame, but changing grain every frame on a still silhouette makes the whole screen seethe, so each character gets a fixed pattern
      col += (rnd(gl_FragCoord.xy + uSeed * 37.) - .5) * .1;
      gl_FragColor = vec4(col, a * uOpacity * uRoll * uLoading);
    }`;

  const geo = new THREE.PlaneGeometry(RATIO, 1);
  const items = Array.from({ length: N }, (_, i) => {
    const s = (i * 0.618 + 0.13) % 1;
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false,
      uniforms: {
        uGlitch: { value: 0 }, uTime: { value: Math.random() * 2 }, uSeed: { value: s }, uOpacity: { value: 1 }, uRoll: { value: 1 }, uLoading: { value: 0 }, uBlur: { value: 0 },
        uRatio: { value: RATIO }, uCoat: { value: i % 4 === 2 ? 1 : i % 5 === 0 ? 0.5 : 0 }, uStance: { value: 0.01 + s * 0.035 }, uArm: { value: (i % 3) / 2 }, uLean: { value: (s - 0.5) * 0.04 },
        uTop: { value: mix(ink, dim, (i * 0.37) % 0.8) }, uBot: { value: mix(soft, raised, (i * 0.53) % 0.7) }, uHead: { value: mix(ink, soft, s * 0.6) },
      },
    });
    const m = new THREE.Mesh(geo, mat);
    m.userData.i = i;
    scene.add(m);
    return m;
  });

  const st = { zoomed: 0, focus: (N - 1) / 2, hot: -1, current: Math.floor(N / 2) };
  let W = 1, phone = false, spin = 0;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const ease = { quintInOut: gsap.parseEase("power4.inOut"), cubicIn: gsap.parseEase("power2.in"), expoIn: gsap.parseEase("expo.in") };
  const map = (v, [a, b], [c, d], e) => { const t = clamp((v - a) / (b - a), 0, 1); return c + (d - c) * (e ? e(t) : t); };
  const line = (i) => ({ x: (i / (N - 1) - 0.5) * 0.75 * W, y: 0, s: (0.75 / N) * W * (16 / 9), o: 1, b: 0 });
  const ring = (i) => { const a = (i / N) * Math.PI * 2 + Math.PI / 2 + spin, r = 0.4 * W; return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8, s: 0.1, o: 1, b: 0 }; };
  const carousel = (i, f) => {
    const r = (i - f) / ((phone ? 3 : 4) - 1), k = 1 - Math.abs(r);
    const s = map(k, [0, 1], [0.2, phone ? 0.7 : 1], ease.cubicIn);
    return { x: r * (0.8 + 0.55 * s) * W, y: 0, s, o: map(k, [-0.2, 1], [0, 1], ease.expoIn), b: map(k, [0.5, 1], [1, 0], ease.expoIn) };
  };
  const layout = () => {
    const R = Math.max(Math.abs(N - 1 - st.focus), Math.abs(st.focus)) || 1;
    const d = 0.2 / R;
    items.forEach((m, i) => {
      const c = Math.abs(i - st.focus);
      const from = phone ? ring(i) : line(i), to = carousel(i, st.focus);
      const k = map(st.zoomed, [0, 1 - d * (R - c)], [0, 1], ease.quintInOut);
      const L = (a, b) => a + (b - a) * k;
      m.position.set(L(from.x, to.x), L(from.y, to.y), 0);
      m.scale.setScalar(L(from.s, to.s));
      m.renderOrder = Math.round(L(from.s, to.s) * 100);
      const u = m.material.uniforms;
      u.uOpacity.value = L(from.o, to.o);
      u.uBlur.value = L(from.b, to.b);
    });
  };
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    W = w / h; phone = w <= 740;
    cam.left = -W / 2; cam.right = W / 2; cam.top = 0.5; cam.bottom = -0.5; cam.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    layout();
  };

  // Emphasis. If nobody is selected all are 1. When the pointer is over one, only that person is 1 and the rest drop to .4 immediately. While expanded, all are 1. Newly emphasized takes .1s, returning from expansion takes .8s (no curve).
  const roll = (slow) => items.forEach((m, i) => {
    const on = st.zoomed > 0 || st.hot < 0 || i === st.hot;
    const u = m.material.uniforms.uRoll;
    gsap.killTweensOf(u);
    if (on) gsap.to(u, { value: 1, duration: reduce ? 0 : slow ? 0.8 : 0.1, ease: "none" });
    else u.value = 0.4;
  });

  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const pick = (e) => {
    const r = host.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, cam);
    const hits = ray.intersectObjects(items.filter((m) => m.material.uniforms.uOpacity.value > 0.05));
    hits.sort((a, b) => b.object.renderOrder - a.object.renderOrder);
    return hits.length ? hits[0].object.userData.i : -1;
  };
  addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch" || e.target.closest(".bc-head, .bc-bar, .bc-info a, .bc-foot")) return;
    const i = pick(e);
    host.classList.toggle("is-hot", i >= 0);
    if (i !== st.hot) { st.hot = i; if (i >= 0) st.current = i; roll(false); }
  });

  const zoom = (on, at) => {
    if (on) { st.focus = at; st.current = at; }
    gsap.to(st, { zoomed: on ? 1 : 0, duration: reduce ? 0 : 0.8, ease: "power4.inOut", onUpdate: layout, onComplete: () => roll(!on) });
    if (on) roll(false);
  };
  const toFocus = (f) => gsap.to(st, { focus: f, duration: reduce ? 0 : 0.8, ease: "power4.out", overwrite: "auto", onUpdate: layout });
  host.addEventListener("click", (e) => {
    const i = pick(e);
    if (st.zoomed < 0.5) { if (i >= 0) zoom(true, i); return; }
    if (i < 0) zoom(false);
    else if (i === Math.round(st.focus)) document.querySelector("[data-open]").click();
    else { st.current = i; toFocus(i); }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && st.zoomed > 0) zoom(false); });

  // While expanded, scrolling at the top moves the focus at .0015/px, and after a 150ms pause it snaps to the nearest person.
  let snapT = 0;
  addEventListener("wheel", (e) => {
    if (st.zoomed < 0.99 || scrollY > 0) return;
    e.preventDefault();
    gsap.killTweensOf(st, "focus");
    st.focus = clamp(st.focus + 0.0015 * (e.deltaY + e.deltaX), 0, N - 1);
    layout();
    clearTimeout(snapT);
    snapT = setTimeout(() => { st.current = Math.round(st.focus); toFocus(st.current); }, 150);
  }, { passive: false });

  addEventListener("resize", resize);
  resize();
  roll(false);
  // Shake every 2s starts after the video is fully downloaded (3s) — the original sits on the first frame while downloading the video, so the shake starts late
  setTimeout(() => items.forEach((m) => (m.material.uniforms.uGlitch.value = reduce ? 0 : 1)), 3000);
  // On load the figures all appear at once with .25s sineOut (measured on the original: first image 98% within 150ms)
  items.forEach((m) => gsap.to(m.material.uniforms.uLoading, { value: 1, duration: reduce ? 0 : 0.15, ease: "sine.out" }));

  let raf = 0, last = performance.now();
  const frame = (now) => {
    const dt = Math.max(1, now - last) / 1000; last = now;
    if (!reduce) items.forEach((m) => (m.material.uniforms.uTime.value += dt));
    // The phone ring turns slowly (in the original the ring position keeps changing — set to 60s per turn)
    if (phone && !reduce && st.zoomed < 1) { spin += dt * (Math.PI * 2 / 60); layout(); }
    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  };
  const run = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  document.addEventListener("visibilitychange", run);
  run();
})();
