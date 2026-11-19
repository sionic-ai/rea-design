// First page video (6.6s) — three.js point cloud. During the loader, the points rush toward the screen as a tube (same flow as the loader tunnel), and
// Once handed over, scattered dots (from 1.2s) gather into twelve lines and flow to three source boxes on the left → the center box → three destinations on the right.
// Camera follows the curve path with power2.inOut to face front, then after finishing sways slightly with cursor and scroll.
// Only on the first visit of a session it plays across the full screen (html[data-film]), and afterward starts straight from the final scene.
(() => {
  const LQ = (window.LQ = window.LQ || { pages: {} });
  const END = 6.6, STREAM_IN = 1.6;
  const CAPTIONS = [[0, "01 — Scattered events · everywhere"], [1.6, "02 — Source · Web / App / Server"], [3.2, "03 — Transform · Pick one"], [4.8, "04 — Destination · Storage / Customer management / Activation"]];
  const LABELS = ["SRC.01 Source 1", "SRC.02 Source 2", "SRC.03 Source 3", "CORE · Transform", "DST.01 Destination 1", "DST.02 Destination 2", "DST.03 Destination 3"];
  let mode = null;

  const VERT = `
    uniform float uTime, uGather, uPx, uStream, uTravel, uStretch;
    attribute vec3 aChaos;
    attribute float aLane, aU0, aSpeed, aPhase, aTrail, aSize;
    varying float vAlpha;
    // Position u (0 to 1) of line i — in front of the center box (x<0) surges and tangles, then splits into straight lines once past
    vec3 lane(float i, float u, float t) {
      float x = -4.2 + 8.4 * u;
      float from = (mod(i, 3.0) - 1.0) * 1.1;
      float mid = (i / 11.0 - 0.5) * 0.5;
      float to = (mod(i + 1.0, 3.0) - 1.0) * 1.1 + (i / 11.0 - 0.5) * 0.12;
      if (x < 0.0) {
        float k = smoothstep(-4.2, -0.3, x), wob = (1.0 - k) * 0.55;
        return vec3(x, mix(from, mid, k) + sin(u * 26.0 + i * 1.7 + t * 0.8) * wob, cos(u * 21.0 + i * 2.3 + t * 0.6) * wob);
      }
      return vec3(x, mix(mid, to, smoothstep(0.6, 4.2, x)), 0.0);
    }
    void main() {
      float u = fract(aU0 + uTime * aSpeed - aTrail * 0.0045);
      vec3 l = lane(aLane, u, uTime);
      vec3 drift = vec3(sin(uTime * 0.3 + aPhase) * 0.25, cos(uTime * 0.25 + aPhase) * 0.2, 0.0);
      vec4 mv = modelViewMatrix * vec4(mix(aChaos + drift, l, uGather), 1.0);
      float ring = 0.25 + 1.9 * pow(fract(aU0 * 7.31 + aPhase * 0.37), 0.8);
      float far = mod(fract(aU0 * 53.1) * 40.0 - uTravel + aTrail * uStretch, 40.0) + 0.3;
      mv = mix(mv, vec4(cos(aPhase) * ring, sin(aPhase) * ring * 0.75, -far, 1.0), uStream);
      float dist = -mv.z;
      float tail = aTrail < 0.5 ? 1.0 : (1.0 - aTrail * 0.38) * uGather * step(0.0, l.x) * 0.7;
      float base = 0.25 + 0.35 * uGather + (l.x > 0.0 ? 0.4 * uGather : 0.0);
      float ends = smoothstep(0.0, 0.03, u) * smoothstep(1.0, 0.97, u);
      vAlpha = base * tail * mix(1.0, ends, uGather) * clamp(1.25 - dist / 13.0, 0.3, 1.0);
      gl_Position = projectionMatrix * mv;
      if (uStream > 0.0) {
        float tailIn = aTrail < 0.5 ? 1.0 : (1.0 - aTrail * 0.38) * 0.7 * step(0.02, uStretch);
        float near = smoothstep(0.3, 1.2, far) * clamp(1.3 - far / 34.0, 0.0, 1.0);
        vec2 ndc = gl_Position.xy / gl_Position.w;
        float edge = smoothstep(1.0, 0.8, abs(ndc.x)) * smoothstep(1.0, 0.8, abs(ndc.y));
        vAlpha = mix(vAlpha, (0.75 + 0.25 * aSize) * tailIn * near * edge, uStream);
      }
      gl_PointSize = max(1.3 * uPx, (1.1 + aSize * 1.5) * uPx * (5.5 / max(dist, 0.2)));
    }`;
  const FRAG = `
    uniform vec3 uInk;
    varying float vAlpha;
    void main() {
      float e = smoothstep(0.5, 0.3, length(gl_PointCoord - 0.5));
      if (e <= 0.0) discard;
      gl_FragColor = vec4(uInk, vAlpha * e);
    }`;

  function cloud(n) {
    let seed = 20261030 >>> 0;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const m = n * 3;
    const chaos = new Float32Array(m * 3), laneA = new Float32Array(m), u0 = new Float32Array(m), sp = new Float32Array(m), ph = new Float32Array(m), tr = new Float32Array(m), sz = new Float32Array(m);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2, b = Math.acos(2 * rnd() - 1), r = 2 + rnd() * 4;
      const p = [Math.sin(b) * Math.cos(a) * r, Math.sin(b) * Math.sin(a) * r * 0.6, Math.cos(b) * r];
      const L = i % 12, U = rnd(), S = 0.07 + rnd() * 0.05, P = rnd() * Math.PI * 2, Z = rnd() ** 3;
      for (let k = 0; k < 3; k++) {
        const j = i * 3 + k;
        chaos.set(p, j * 3); laneA[j] = L; u0[j] = U; sp[j] = S; ph[j] = P; tr[j] = k; sz[j] = Z;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(m * 3), 3));
    [["aChaos", chaos, 3], ["aLane", laneA, 1], ["aU0", u0, 1], ["aSpeed", sp, 1], ["aPhase", ph, 1], ["aTrail", tr, 1], ["aSize", sz, 1]].forEach(([k, arr, s]) => g.setAttribute(k, new THREE.BufferAttribute(arr, s)));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return g;
  }

  function modules(ink) {
    const all = [], mats = [];
    // Like the original, screen-pixel-width lines (three addons LineSegments2) — outer box 1.25px, center 1.5px, inner 1px
    const fat = !!THREE.LineSegments2;
    const edges = (w, h, d, op, lw = 1.25) => {
      const box = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
      const m = fat ? new THREE.LineMaterial({ color: ink, linewidth: lw, transparent: true, opacity: 0, depthWrite: false }) : new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0, depthWrite: false });
      mats.push(m);
      const line = fat ? new THREE.LineSegments2(new THREE.LineSegmentsGeometry().fromEdgesGeometry(box), m) : new THREE.LineSegments(box, m);
      return { line, mat: m, op };
    };
    const box = (x, y) => {
      const g = new THREE.Group(), e = edges(0.35, 0.22, 0.22, 0.95);
      g.add(e.line); g.position.set(x, y, 0);
      return { group: g, parts: [e], anchor: new THREE.Vector3(x, y - 0.11 - 0.12, 0) };
    };
    const sources = [1, 0, -1].map((k) => box(-4.3, k * 1.1));
    const dests = [1, 0, -1].map((k) => box(4.3, k * 1.1));
    const coreG = new THREE.Group(), outer = edges(0.7, 1.1, 0.7, 0.95, 1.5), inner = edges(0.38, 0.38, 0.38, 0.55, 1);
    inner.line.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    const faceMat = new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0, depthWrite: false });
    mats.push(faceMat);
    coreG.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.7), faceMat), outer.line, inner.line);
    const core = { group: coreG, parts: [outer, inner], anchor: new THREE.Vector3(0, -0.75, 0), face: faceMat, inner: inner.line };
    const root = new THREE.Group();
    [...sources, core, ...dests].forEach((m) => { root.add(m.group); all.push(m); });
    return { root, sources, dests, core, all, mats };
  }

  function film(main, { first }) {
    const host = main.querySelector(".hero-cinematic-host"), hero = main.querySelector(".hero");
    const root = document.documentElement;
    if (!host || !hero || !window.THREE) { LQ.markHeroReady?.(); return () => {}; }
    const wrap = document.createElement("div");
    wrap.className = "hero-cinematic";
    wrap.innerHTML = `<div class="hero-cinematic-labels" aria-hidden="true">${LABELS.map((t) => { const [c, ...r] = t.split(" "); return `<span class="hero-cinematic-label"><span class="hero-cinematic-code">${c}</span>${r.join(" ")}</span>`; }).join("")}</div>
      <div class="hero-cinematic-hud" aria-hidden="true"><p class="hero-cinematic-caption eyebrow"></p><span class="hero-cinematic-timecode eyebrow">T+00.0</span></div>`;
    host.append(wrap);
    const labels = [...wrap.querySelectorAll(".hero-cinematic-label")];
    const caption = wrap.querySelector(".hero-cinematic-caption"), timecode = wrap.querySelector(".hero-cinematic-timecode");

    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { LQ.markHeroReady?.(); return () => wrap.remove(); }
    const small = innerWidth < 768;
    renderer.setPixelRatio(Math.min(small ? 1.5 : 2, devicePixelRatio || 1));
    wrap.prepend(renderer.domElement);
    const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.set(-3.2, 0.5, 2.4);
    const inkColor = new THREE.Color(getComputedStyle(root).getPropertyValue("--kf-ink").trim());
    const geo = cloud(small ? 3200 : 9000);
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, vertexShader: VERT, fragmentShader: FRAG,
      uniforms: { uTime: { value: 0 }, uGather: { value: 0 }, uPx: { value: 1 }, uStream: { value: 0 }, uTravel: { value: 0 }, uStretch: { value: 0 }, uInk: { value: inkColor.clone() } },
    });
    const mods = modules(inkColor);
    scene.add(new THREE.Points(geo, mat), mods.root);
    // Dark skin (white dots) brightens by adding, light skin lays dark dots, as the original flips the canvas
    const paintInk = () => {
      inkColor.set(getComputedStyle(root).getPropertyValue("--kf-ink").trim());
      mat.uniforms.uInk.value.copy(inkColor);
      mat.blending = inkColor.r + inkColor.g + inkColor.b > 1.5 ? THREE.AdditiveBlending : THREE.NormalBlending;
      mat.needsUpdate = true;
      mods.mats.forEach((m) => m.color.copy(inkColor));
    };
    paintInk();
    addEventListener("theme-change", paintInk);

    const st = { gather: 0, sources: 0, core: 0, coreTurn: 0.8, destinations: 0, labels: 0 };
    const tl = gsap.timeline({ paused: true })
      .to(st, { gather: 1, duration: 2.2, ease: "power2.inOut" }, 1.2)
      .to(st, { sources: 1, duration: 0.8, ease: "expo.out" }, 1.6)
      .to(st, { core: 1, duration: 0.8, ease: "expo.out" }, 2.8)
      .to(st, { coreTurn: 0, duration: 2.2, ease: "power3.out" }, 2.8)
      .to(st, { destinations: 1, duration: 0.8, ease: "expo.out" }, 4.6)
      .to(st, { labels: 1, duration: 0.6, ease: "power2.out" }, 1.9)
      .to(st, { labels: 0, duration: 0.6, ease: "power2.in" }, 5.9);
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-3.2, 0.5, 2.4), new THREE.Vector3(-1.2, 1.6, 4.2), new THREE.Vector3(0.8, 0.9, 6.2), new THREE.Vector3(0, 0, 8.2)], false, "centripetal");
    const look = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.5, 0, 0), new THREE.Vector3(-0.5, 0, 0), new THREE.Vector3(0.5, 0, 0), new THREE.Vector3(0, 0, 0)], false, "centripetal");
    const ease = gsap.parseEase("power2.inOut");
    const P = new THREE.Vector3(), L = new THREE.Vector3(), proj = new THREE.Vector3(), pointer = new THREE.Vector2(), aim = new THREE.Vector2();
    const flow = { speed: 0, travel: 0 };

    if (mode === null) {
      mode = root.hasAttribute("data-cinematic") && !LQ.still() ? "play" : "skip";
      if (mode === "play") try { sessionStorage.setItem("lq-cinematic-seen", "1"); } catch {}
    }
    const clock = { start: -1, jumped: false, compiled: false, released: false };
    const kick = () => { if (clock.compiled && clock.released && clock.start < 0) clock.start = performance.now(); };
    const now = () => (clock.jumped ? END + (performance.now() - clock.start) / 1000 : clock.start < 0 ? 0 : (performance.now() - clock.start) / 1000);
    const started = () => clock.start >= 0;
    const jump = () => { if (!clock.jumped) Object.assign(clock, { start: performance.now(), jumped: true }); };
    const reveal = () => { if (root.hasAttribute("data-cinematic")) { root.removeAttribute("data-cinematic"); dispatchEvent(new Event("cinematic-reveal")); } };
    const unfilm = () => root.removeAttribute("data-film");

    const place = () => {
      root.style.setProperty("--film-top", `${hero.getBoundingClientRect().top + scrollY}px`);
      root.style.setProperty("--hero-h", `${hero.offsetHeight}px`);
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      cam.aspect = host.clientWidth / Math.max(1, host.clientHeight);
      cam.updateProjectionMatrix();
    };
    place();
    addEventListener("resize", place);
    let scroll = 0;
    const onScroll = () => { scroll = Math.min(1.5, Math.max(0, scrollY / (wrap.offsetHeight || innerHeight))); };
    const onMove = (e) => { if (e.pointerType === "mouse") aim.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1)); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("pointermove", onMove, { passive: true });
    onScroll();

    let lastCap = -1, finished = false, raf = 0, last = performance.now(), visible = true;
    const draw = (t, dt) => {
      tl.time(Math.min(t, END));
      const u = mat.uniforms;
      u.uTime.value = t;
      u.uGather.value = st.gather;
      u.uPx.value = renderer.getPixelRatio();
      flow.speed += (LQ.stream.speed - flow.speed) * (1 - Math.exp(-4 * Math.min(dt, 0.05)));
      flow.travel += (0.6 + flow.speed * flow.speed * 30) * Math.min(dt, 0.05);
      u.uTravel.value = flow.travel;
      u.uStretch.value = flow.speed * 0.22;
      u.uStream.value = started() ? 1 - THREE.MathUtils.smootherstep(t, 0, STREAM_IN) : 1;
      const show = (m, v) => m.parts.forEach((p) => (p.mat.opacity = v * p.op));
      mods.sources.forEach((m) => show(m, st.sources));
      mods.dests.forEach((m) => show(m, st.destinations));
      show(mods.core, st.core);
      mods.core.face.opacity = st.core * (0.05 + 0.02 * Math.sin(t * 1.4));
      mods.core.group.rotation.y = st.coreTurn;
      mods.core.inner.rotation.y = Math.PI / 4 + t * 0.25;
      const k = ease(Math.min(1, t / END));
      path.getPointAt(k, P);
      P.multiplyScalar(Math.max(1, 1.5 / cam.aspect));
      look.getPointAt(k, L);
      const idle = THREE.MathUtils.smoothstep(t, END, 8.6);
      pointer.lerp(aim, 1 - Math.exp(-2.5 * Math.min(dt, 0.05)));
      P.x += (Math.sin(t * 0.2) * 0.15 + pointer.x * 0.25) * idle;
      P.y += (Math.cos(t * 0.17) * 0.08 + pointer.y * 0.15) * idle;
      P.z -= scroll * 2.2 * idle;
      cam.position.copy(P);
      cam.lookAt(L);
      const W = host.clientWidth, H = host.clientHeight;
      mods.all.forEach((m, n) => {
        const el = labels[n];
        proj.copy(m.anchor).project(cam);
        el.style.transform = `translate3d(${((proj.x * 0.5 + 0.5) * W).toFixed(1)}px, ${((-proj.y * 0.5 + 0.5) * H).toFixed(1)}px, 0)`;
        el.style.opacity = String(Math.min(n < 3 ? st.sources : n === 3 ? st.core : st.destinations, st.labels));
      });
      let cap = 0;
      CAPTIONS.forEach(([at], i) => { if (t >= at) cap = i; });
      if (started() && cap !== lastCap && caption) {
        lastCap = cap;
        caption.replaceChildren(...Array.from(CAPTIONS[cap][1], (c, i) => { const s = document.createElement("span"); s.textContent = c; s.style.animationDelay = `${i * 14}ms`; return s; }));
      }
      if (started() && timecode && t <= END) timecode.textContent = `T+${t.toFixed(1).padStart(4, "0")}`;
      if (t >= 6) reveal();
      if (t >= END && !finished) {
        finished = true;
        mode = "skip";
        unfilm();
        wrap.setAttribute("data-done", "");
        wrap.querySelector(".hero-cinematic-hud")?.remove();
        dispatchEvent(new Event("cinematic-done"));
      }
      renderer.render(scene, cam);
    };
    const loop = (n) => {
      const dt = Math.max(0.001, (n - last) / 1000);
      last = n;
      draw(now(), dt);
      raf = visible || !started() || now() < END ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    });
    io.observe(wrap);
    const snap = () => draw(now(), 0);
    addEventListener("canvas-snapshot", snap);

    const skip = () => jump();
    const esc = (e) => e.key === "Escape" && skip();
    let offHand = () => {};
    if (mode === "skip" || LQ.still()) {
      unfilm(); reveal(); jump();
    } else {
      offHand = LQ.onHandover(() => {
        const go = () => {
          clock.released = true; kick();
          addEventListener("pointerdown", skip, true);
          addEventListener("wheel", skip, { passive: true });
          addEventListener("touchstart", skip, { passive: true });
          addEventListener("keydown", esc);
        };
        if (document.hidden) document.addEventListener("visibilitychange", go, { once: true }); else go();
      });
    }
    // Pre-bake the shaders and draw once, then tell the loader it’s ready
    renderer.compileAsync(scene, cam).catch(() => {}).then(() => {
      renderer.render(scene, cam);
      clock.compiled = true; kick();
      LQ.markHeroReady?.();
    });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect(); offHand();
      removeEventListener("resize", place); removeEventListener("scroll", onScroll); removeEventListener("pointermove", onMove);
      removeEventListener("canvas-snapshot", snap); removeEventListener("theme-change", paintInk);
      removeEventListener("pointerdown", skip, true); removeEventListener("wheel", skip); removeEventListener("touchstart", skip); removeEventListener("keydown", esc);
      unfilm();
      tl.kill(); geo.dispose(); mat.dispose(); mods.mats.forEach((m) => m.dispose());
      mods.root.traverse((o) => o.geometry?.dispose());
      renderer.dispose(); renderer.forceContextLoss(); wrap.remove();
    };
  }

  LQ.pages.home = (main, opts) => film(main, opts);
})();
