// About: hero title · four branches (on the pinned panel the branch changes every 1/4 of scroll — text changes with a .5s deal, and the object changes while spinning on the ring) · dice roll
(() => {
  // The 3D horse starts with the hero sequence — delayed by the loader or transition cover if present (options are fixed before the parts attach)
  const stage = document.querySelector(".tt-ahero__stage");
  let fromDeal = false;
  try { fromDeal = sessionStorage.getItem("kf-card-deal") === "1"; } catch {}
  if (stage) stage.setAttribute("data-fx-float-pieces-3d", `look: board; delay: ${document.documentElement.classList.contains("tt-loading") ? 2.6 : fromDeal ? 0.32 : 0}`);
  TT.reveal();
  const reduced = TT.reduced;
  heroBoard(stage?.querySelector(".tt-ahero__board"));
  const title = document.querySelector("[data-ahero-title]");
  if (title && !reduced) {
    const sp = SplitText.create(title, { type: "chars", mask: "chars" });
    gsap.set(sp.chars, { yPercent: 100 });
    TT.onReveal(() => gsap.to(sp.chars, { yPercent: 0, duration: 1.1, stagger: 0.04, ease: "power4.out" }));
  }
  const crafts = document.querySelector("[data-crafts]");
  if (crafts) {
    const panels = [...crafts.querySelectorAll("[data-craft-panel]")], objs = [...crafts.querySelectorAll("[data-craft-obj]")], ticks = [...crafts.querySelectorAll("[data-craft-tick]")];
    let cur = -1;
    const show = (i) => {
      if (i === cur) return;
      const prev = cur; cur = i;
      ticks.forEach((t, k) => t.classList.toggle("is-on", k === i));
      const d = reduced ? 0 : 1;
      if (prev >= 0) {
        gsap.to(panels[prev], { autoAlpha: 0, y: -20, duration: 0.4 * d, ease: "sweep", overwrite: true });
        gsap.to(objs[prev], { autoAlpha: 0, rotationY: -90, y: -30, duration: 0.5 * d, ease: "sweep", overwrite: true });
      }
      gsap.fromTo(panels[i], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5 * d, delay: 0.15 * d, ease: "deal", overwrite: true });
      gsap.fromTo(objs[i], { autoAlpha: 0, rotationY: 90, y: 30 }, { autoAlpha: 1, rotationY: 0, y: 0, duration: 0.9 * d, delay: 0.15 * d, ease: "deal", overwrite: true });
    };
    show(0);
    ScrollTrigger.create({ trigger: crafts, start: "top top", end: "bottom bottom", onUpdate: (s) => show(Math.min(panels.length - 1, Math.floor(s.progress * panels.length))) });
    if (!reduced) objs.forEach((o) => gsap.to(o.firstElementChild, { y: -10, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 }));
  }
  // Dice (three.js canvas): on press it picks the number to land and throws it in from the upper side (a bit over 2.2s), and that face stands up and forward. The button rests while it rolls
  const holder = document.querySelector("[data-die]"), btn = document.querySelector("[data-dice-roll]");
  if (holder && btn && window.THREE) {
    const T = THREE, css = getComputedStyle(document.documentElement);
    const ivory = css.getPropertyValue("--kf-surface").trim(), gold = css.getPropertyValue("--kf-accent").trim(), ochre = css.getPropertyValue("--kf-accent-soft").trim();
    const PIPS = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]] };
    const face = (n) => {
      const c = document.createElement("canvas"); c.width = c.height = 256;
      const x = c.getContext("2d");
      x.fillStyle = ivory; x.fillRect(0, 0, 256, 256);
      x.strokeStyle = ochre; x.lineWidth = 10; x.strokeRect(5, 5, 246, 246);
      x.fillStyle = gold;
      for (const [i, k] of PIPS[n]) { x.beginPath(); x.arc(64 + i * 64, 64 + k * 64, 22, 0, Math.PI * 2); x.fill(); }
      const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
    };
    // BoxGeometry face order +x −x +y −y +z −z maps to 2·5·3·4·1·6
    const order = [2, 5, 3, 4, 1, 6];
    const die = new T.Mesh(new T.BoxGeometry(1, 1, 1), order.map((n) => new T.MeshToonMaterial({ map: face(n) })));
    const renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
    holder.append(renderer.domElement);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 50);
    cam.position.set(0, 2.2, 6); cam.lookAt(0, 0, 0);
    scene.add(new T.HemisphereLight(new T.Color(ivory), new T.Color(css.getPropertyValue("--kf-bg").trim()), 1.6));
    const sun = new T.DirectionalLight(new T.Color(ivory), 1.8); sun.position.set(-3, 5, 4); scene.add(sun);
    scene.add(die);
    // Pose that makes the face stand toward the camera (slightly above +z)
    const FACE = { 1: [0, 0], 6: [0, Math.PI], 2: [0, -Math.PI / 2], 5: [0, Math.PI / 2], 3: [Math.PI / 2, 0], 4: [-Math.PI / 2, 0] };
    const st = { x: -0.42, y: 0.55, hop: 0 };
    const draw = () => { die.rotation.set(st.x, st.y, 0); die.position.y = st.hop; renderer.render(scene, cam); };
    const size = () => { const w = holder.clientWidth || 1, h = holder.clientHeight || 1; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); draw(); };
    size(); new ResizeObserver(size).observe(holder);
    const nums = document.querySelectorAll("[data-face]"), out = document.querySelector("[data-dice-result]"), num = document.querySelector("[data-dice-num]");
    const label = btn.querySelector("[data-dice-label]"), sec = btn.closest("[data-dice]"), readout = sec.querySelectorAll("[data-readout]");
    const LINES = ["Your line for 1 here — a quiet night, just the two of us.", "Your sentence for 2 here — the winner picks the next game.", "Your sentence 3 here — unfolding a new kind of play.", "Your sentence for 4 here — four sit down.", "Your sentence for 5 here — until the sun rises.", "Your sentence for 6 here — everyone, one more round."];
    // World per eye: 1 night · 2 teal · 3 navy · 4 gold · 5 paper · 6 ochre (exactly per the original table)
    const WORLD = { 1: "night", 2: "teal", 3: "", 4: "gold", 5: "paper", 6: "ochre" };
    let last = 0, busy = false, worldCall = null;
    gsap.set(readout, { yPercent: 110 });
    const roll = () => {
      if (busy) return;
      let n = last;
      while (n === last) n = 1 + Math.floor(Math.random() * 6);
      last = n; busy = true; btn.disabled = true;
      const [fx, fy] = FACE[n], turn = Math.PI * 2;
      // Roll start: the previous result text slides up and out with .45s power3.in
      if (!reduced) gsap.to(readout, { yPercent: -110, duration: 0.45, ease: "power3.in", stagger: 0.04, overwrite: true });
      // Exactly the original throw: flies in from the upper side (position is a quadratic Bezier · 1−(1−e)³), bounces with height |cos(2.5πe)|·(1−e)^2.2 as it lands,
      // What spun at 2π(2.5+.14r+random) unwinds via 1−(1−e)^2.4 — duration 1.7+.045r seconds (r = Throw distance, up to 16). Slot is scaled .2x to fit this board size
      const ax = 8 + 2 * Math.random(), ay = 4.2 + Math.random(), az = -4 - 2 * Math.random();
      const r = Math.min(Math.hypot(ax, az) * 1.1, 16), spin = turn * (2.5 + 0.14 * r + Math.random());
      const x0 = fx - 0.42, y0 = fy + 0.55, p = { e: 0 };
      const settle = () => {
        st.x %= turn; st.y %= turn; busy = false; btn.disabled = false; label.textContent = "Roll again";
        nums.forEach((li) => li.classList.toggle("is-on", +li.dataset.face === n));
        num.textContent = String(n); out.textContent = LINES[n - 1];
        // The world color stops and changes after .75s (as in the original) — rolling again in between discards the earlier change
        worldCall?.kill();
        worldCall = gsap.delayedCall(reduced ? 0 : 0.75, () => { if (WORLD[n]) sec.dataset.world = WORLD[n]; else delete sec.dataset.world; });
        // When it stops, new result text rises from 110% below with 1.1s power4.out (.35s later · .08 stagger)
        if (!reduced) gsap.fromTo(readout, { yPercent: 110 }, { yPercent: 0, duration: 1.1, delay: 0.35, ease: "power4.out", stagger: 0.08, overwrite: true }); else gsap.set(readout, { yPercent: 0 });
      };
      if (reduced) { st.x = x0; st.y = y0; st.hop = 0; draw(); settle(); return; }
      gsap.to(p, { e: 1, duration: (1700 + 45 * r) / 1000, ease: "none", onComplete: settle, onUpdate: () => {
        const e = p.e, m = 1 - Math.pow(1 - e, 3), u = 1 - (1 - m) * (1 - m) - 0.758 * 2 * (1 - m) * m, k = 1 - Math.pow(1 - e, 2.4);
        die.position.x = 0.2 * ax * (1 - u); die.position.z = 0.2 * az * (1 - u);
        st.hop = 0.2 * ay * Math.pow(1 - e, 2.2) * Math.abs(Math.cos(2.5 * Math.PI * e));
        st.x = x0 + 0.8 * spin * (1 - k); st.y = y0 + 0.6 * spin * (1 - k);
        draw();
      } });
    };
    btn.addEventListener("click", roll);
    // When the dice board is 60% visible it rolls once by itself — the button rests meanwhile (as in the original)
    const seen = new IntersectionObserver(([e]) => { if (e.isIntersecting) { seen.disconnect(); roll(); } }, { threshold: 0.6 });
    seen.observe(holder);
  }

  // Hero floor chessboard — the original is a 3D scene including the board, so the camera moves with the cursor and the whole board tilts. Rebuilt with our shader grid, camera values read from the original:
  // FOV 30° · camera looks from (0, 2.15, 8.6) at (0, 1.3, 0). Follows the cursor (screen −1~1) with exponential damping 2.6, moving the camera 1.1 horizontally · −.45 vertically,
  // Shifts the look point .3 horizontally · −.12 vertically. Slow drift (horizontal .35·sin .13t, vertical .06·sin .09t), and approaches (0, 1.45, 5.6) by the scrolled amount.
  // Cell 1.8 · gold line .5 · white cell .07 · blurs at distance 10~40 · fog 16~52
  function heroBoard(box) {
    const T = window.THREE;
    if (!box || !T) return;
    const css = getComputedStyle(document.documentElement), col = (k) => new T.Color(css.getPropertyValue(k).trim());
    const bg = col("--kf-bg");
    const canvas = document.createElement("canvas");
    const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0, 0);
    box.classList.add("is-gl"); box.append(canvas);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, 0.1, 200);
    const plane = () => new T.PlaneGeometry(240, 240).rotateX(-Math.PI / 2);
    const shade = new T.Mesh(plane(), new T.MeshBasicMaterial({ color: bg.clone().multiplyScalar(0.62), transparent: true, opacity: 0.55, depthWrite: false, fog: true }));
    scene.fog = new T.Fog(bg, 16, 52);
    const grid = new T.Mesh(plane(), new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uLine: { value: col("--kf-accent") }, uTile: { value: col("--kf-ink") }, uSize: { value: 1.8 }, uLineA: { value: 0.5 }, uTileA: { value: 0.07 }, uFade: { value: new T.Vector2(10, 40) }, uFog: { value: new T.Vector2(16, 52) } },
      vertexShader: `varying vec3 vW;
        void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform vec3 uLine, uTile; uniform float uSize, uLineA, uTileA; uniform vec2 uFade, uFog; varying vec3 vW;
        void main() {
          vec2 g = vW.xz / uSize + 0.5;
          vec2 edge = 0.5 - abs(fract(g) - 0.5), px = fwidth(g) * 1.2;
          float ln = 1.0 - min(smoothstep(0.0, px.x, edge.x), smoothstep(0.0, px.y, edge.y));
          float dark = mod(floor(g.x) + floor(g.y), 2.0);
          float d = distance(cameraPosition, vW);
          float keep = (1.0 - smoothstep(uFade.x, uFade.y, d)) * (1.0 - clamp((d - uFog.x) / (uFog.y - uFog.x), 0.0, 1.0));
          gl_FragColor = vec4(mix(uTile, uLine, ln), max(ln * uLineA, dark * uTileA) * keep);
        }`,
    }));
    grid.position.y = 0.002; grid.renderOrder = 1;
    scene.add(shade, grid);
    const base = new T.Vector3(0, 2.15, 8.6), deep = new T.Vector3(0, 1.45, 5.6), aim = new T.Vector3();
    const want = new T.Vector2(), cur = new T.Vector2(), fxCur = new T.Vector2();
    let drift = 0, scroll = 0, last = 0, seen = true, w = 1, h = 1;
    // The phrase is drawn by the shared part (float-pieces-3d) with its own camera (z 20 · horizontal 1.4 · vertical −.8 · damping 2.8), so it sways only about a third as much as the original.
    // Moves carried by the plate camera like the original, one representative slot per layer (front layer = Large phone at plate center, layered behind = From the point where the panel interior (12) shifts over to the panel camera
    // Motion part: subtract what the camera has already moved, then push the layer
    const layers = [...box.parentElement.querySelectorAll(".tt-hero__pieces")].map((el) => {
      const front = el.classList.contains("is-front");
      return { el, board: new T.Vector3(0, front ? 0.8 : 0.7, front ? 0 : -12), depth: front ? 3 : -3 };
    });
    const still = camera.clone(), fxCam = new T.PerspectiveCamera(30, 1, 0.1, 100), fxStill = fxCam.clone(), p = new T.Vector3(), q = new T.Vector3(), fxAt = new T.Vector3();
    const place = (cam, c, scr) => {
      cam.position.copy(base).lerp(deep, scr);
      if (camera.aspect < 0.8) { cam.position.z *= 1.45; cam.position.y *= 1.08; }
      cam.position.x += 0.35 * Math.sin(0.13 * drift) + 1.1 * c.x;
      cam.position.y += 0.06 * Math.sin(0.09 * drift) - 0.45 * c.y;
      cam.lookAt(aim.set(0.3 * c.x, 1.3 + 0.15 * scr - 0.12 * c.y, 0));
      cam.updateMatrixWorld();
    };
    const moved = (a, b, at) => { p.copy(at).project(a); q.copy(at).project(b); return [((p.x - q.x) * w) / 2, ((q.y - p.y) * h) / 2]; };
    const fit = () => {
      const r = box.getBoundingClientRect();
      if (!r.width || !r.height) return;
      w = r.width; h = r.height;
      renderer.setSize(w, h, false);
      for (const c of [camera, still, fxCam, fxStill]) { c.aspect = w / h; c.updateProjectionMatrix(); }
    };
    const zero = new T.Vector2();
    const frame = () => {
      const now = performance.now() / 1000, dt = last ? Math.min(0.1, now - last) : 0;
      last = now;
      if (!seen) return;
      if (!reduced) drift += dt;
      cur.lerp(want, 1 - Math.exp(-2.6 * dt));
      fxCur.lerp(want, 1 - Math.exp(-2.8 * dt));
      place(camera, cur, scroll);
      renderer.render(scene, camera);
      if (reduced) return;
      place(still, zero, scroll);
      fxCam.position.set(1.4 * fxCur.x, -0.8 * fxCur.y, 20); fxCam.lookAt(0, 0, 0); fxCam.updateMatrixWorld();
      fxStill.position.set(0, 0, 20); fxStill.lookAt(0, 0, 0); fxStill.updateMatrixWorld();
      for (const l of layers) {
        const [bx, by] = moved(camera, still, l.board), [fx, fy] = moved(fxCam, fxStill, fxAt.set(0, 0, l.depth));
        l.el.style.translate = `${(bx - fx).toFixed(1)}px ${(by - fy).toFixed(1)}px`;
      }
    };
    fit(); new ResizeObserver(fit).observe(box);
    // Link the shader when building the world — so the screen does not freeze from linking it for the first time on the first cursor move
    renderer.compile(scene, camera); frame();
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(box);
    gsap.ticker.add(frame);
    if (reduced) return;
    ScrollTrigger.create({ trigger: box.parentElement, start: "top top", end: "bottom top", onUpdate: (s) => { scroll = s.progress; } });
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) addEventListener("pointermove", (e) => want.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1), { passive: true });
  }
})();
