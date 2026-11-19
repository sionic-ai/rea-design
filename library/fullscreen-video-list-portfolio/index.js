/* Home: list ↔ background video switch · 20s auto advance · press and hold → tile row (WebGL).
   Original values: enter 2000ms expo.out (4° · 1.3x · from grayscale + blur 10px) / exit clip 1000ms · video -125px 1100ms expo.inOut / auto 20000ms / phone swipe 48px·700ms. */
(() => {
  const { playVideo, reduce } = window.AL;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;
  const bg = $(".hm__bg"), lines = $$("[data-line]"), items = $$("[data-item]");
  const EXPO_OUT = "cubic-bezier(0.16, 1, 0.3, 1)", EXPO_IN_OUT = "cubic-bezier(0.87, 0, 0.13, 1)";
  const AUTOPLAY = 20000, ENTER = 2000, LEAVE = 1100, LEAVE_CLIP = 1000;
  const FROM_T = "rotate(4deg) scale(1.3)", FROM_F = "grayscale(100%) blur(10px)";
  let current = 0, anims = [], timer = 0, doneTimer = 0, leaving = null;

  // Per row, a bar and two layers of text (a light layer · a dark layer visible only over the bar)
  lines.forEach((line) => {
    const row = $(".hm-line__row", line), kids = [...row.children];
    const bar = document.createElement("div");
    bar.className = "hm-line__bar";
    line.prepend(bar);
    const a = document.createElement("div"), b = document.createElement("div");
    a.className = "hm-line__layer is-ink"; b.className = "hm-line__layer is-bg"; b.setAttribute("aria-hidden", "true");
    kids.forEach((k) => { a.append(k); b.append(k.cloneNode(true)); });
    row.append(a, b);
    line.style.setProperty("--al-autoplay", AUTOPLAY / 1000 + "s");
  });
  const video = (item) => $("video", item);

  function runLine(i) {
    lines.forEach((l) => l.classList.remove("is-current", "is-running"));
    const l = lines[i];
    l.classList.add("is-current");
    void l.offsetWidth;
    l.classList.add("is-running");
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => goTo((current + 1) % items.length), AUTOPLAY);
  }
  function settle() {
    anims.forEach((a) => a.cancel());
    anims = [];
    clearTimeout(doneTimer);
    if (leaving) { leaving.classList.remove("is-leaving"); leaving.style.clipPath = ""; video(leaving).style.transform = ""; video(leaving).pause(); leaving = null; }
    items.forEach((it) => { it.classList.remove("is-entering"); it.style.transform = ""; video(it).style.filter = ""; });
    bg.classList.remove("is-switching");
  }
  function goTo(i) {
    if (i === current) { runLine(i); schedule(); return; }
    settle();
    const prev = items[current], next = items[i];
    current = i;
    runLine(i);
    schedule();
    playVideo(video(next));
    prev.classList.remove("is-active");
    next.classList.add("is-active");
    if (reduce) { video(prev).pause(); return; }
    bg.classList.add("is-switching");
    prev.classList.add("is-leaving");
    next.classList.add("is-entering");
    leaving = prev;
    const pv = video(prev), nv = video(next);
    pv.pause();
    anims = [
      prev.animate([{ clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)" }], { duration: LEAVE_CLIP, easing: EXPO_IN_OUT, fill: "forwards" }),
      pv.animate([{ transform: "translate3d(0, 0, 0)" }, { transform: "translate3d(0, -125px, 0)" }], { duration: LEAVE, easing: EXPO_IN_OUT, fill: "forwards" }),
      next.animate([{ transform: FROM_T }, { transform: "rotate(0deg) scale(1)" }], { duration: ENTER, easing: EXPO_OUT, fill: "forwards" }),
      nv.animate([{ filter: FROM_F }, { filter: "grayscale(0%) blur(0px)" }], { duration: ENTER, easing: EXPO_OUT, fill: "forwards" }),
    ];
    doneTimer = setTimeout(settle, ENTER);
  }
  lines.forEach((line, i) => {
    line.addEventListener("click", () => goTo(i));
    line.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(i); } });
  });
  items[0].classList.add("is-active");
  playVideo(video(items[0]));
  runLine(0);
  schedule();
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearTimeout(timer); else { runLine(current); schedule(); playVideo(video(items[current])); } });

  // Phone: a horizontal swipe over 48px within 700ms goes to the previous or next project
  const mobile = matchMedia("(max-width: 991px)");
  let sx = 0, st = 0;
  const main = $(".hm");
  main.addEventListener("touchstart", (e) => { sx = e.changedTouches[0].clientX; st = Date.now(); }, { passive: true });
  main.addEventListener("touchend", (e) => {
    if (!mobile.matches) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) < 48 || Date.now() - st > 700) return;
    goTo((current + (dx < 0 ? 1 : -1) + items.length) % items.length);
  }, { passive: true });

  /* ───────── Press and hold → tile row ─────────
     Original values: press 650ms (cancels if moved over 14px) · tile height 2.25 (16:9) gap .1 · camera fov 50 z 8 · drag .012/px · follow lerp .1
     · Speed lerp .16 → bending = sign·|v·12|^1.85·.46 (lerp .07, .11 while dragging) · only the center in color (grayscale lerp .12) · enter and exit 2s cubic-bezier(.22,1,.36,1). */
  const hold = $(".hm-hold"), root = $(".hm-imm"), feat = $(".hm__feat"), cap = $(".hm-imm__cap");
  const wide = matchMedia("(min-width: 992px)");
  if (!hold || !window.THREE || !window.gsap) return;
  const TILE_H = 2.25, TILE_W = TILE_H * (16 / 9), UNIT = TILE_W + 0.1, CAM_Z = 8, FOV = 50, INTRO = 2;
  const loco = (() => { // Solves cubic-bezier(.22,1,.36,1) from time → progress
    const bez = (t, a, b) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
    return (x) => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (bez(m, 0.22, 0.36) < x) lo = m; else hi = m; } return bez((lo + hi) / 2, 1, 1); };
  })();
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const S = { mode: "full", busy: false, scroll: 0, target: 0, last: 0, vel: 0, warp: 0, drag: false, intro: null, sel: 0, raf: 0, gl: null };

  // Tile vertices: the nearer to the screen center, the more they curl forward (gaussian exp(-6x²)), and the edges lie back. Slightly stretched vertically, with the center bulging sideways
  const VERT = `
    uniform float uWarp; uniform float uViewW; uniform float uHalfH;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      float sx = clamp((modelMatrix * vec4(position, 1.0)).x / (uViewW * 0.5), -1.0, 1.0);
      float roll = exp(-6.0 * sx * sx);
      float yn = position.y / max(uHalfH, 0.001);
      vec3 p = position;
      p.y *= 1.0 + 0.15 * roll * uWarp;
      p.x += 0.15 * (1.0 - yn * yn) * roll * uWarp;
      p.z += (0.8 * roll - 0.4 * sx * sx) * uWarp;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`;
  // Tile piece: cover-fit video, grayscale mix, brightness and opacity
  const FRAG = `
    uniform sampler2D uMap; uniform vec2 uCover; uniform float uGray; uniform float uOpacity; uniform float uBright;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(uMap, (vUv - 0.5) * uCover + 0.5);
      c.rgb = mix(c.rgb, vec3(dot(c.rgb, vec3(0.299, 0.587, 0.114))), clamp(uGray, 0.0, 1.0)) * uBright;
      gl_FragColor = vec4(c.rgb, c.a * clamp(uOpacity, 0.0, 1.0));
      #include <colorspace_fragment>
    }`;
  const css = (n) => getComputedStyle(html).getPropertyValue(n).trim();
  function placeholderTexture(i) { // When opened via file:// the video is cross-origin so WebGL cannot read it — substitute a picture of the same tone
    const c = document.createElement("canvas");
    c.width = 640; c.height = 360;
    const x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 640, 360);
    g.addColorStop(0, css("--kf-raised")); g.addColorStop(0.5 + (i % 3) * 0.15, css("--kf-dim")); g.addColorStop(1, css("--kf-bg"));
    x.fillStyle = g; x.fillRect(0, 0, 640, 360);
    x.fillStyle = css("--kf-ink"); x.font = `28px ${css("--kf-font-mono")}`; x.fillText(String(i + 1).padStart(2, "0"), 28, 52);
    return new THREE.CanvasTexture(c);
  }
  function build() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(FOV, innerWidth / innerHeight, 0.1, 120);
    camera.position.z = CAM_Z;
    const track = new THREE.Group();
    scene.add(track);
    const useVideo = location.protocol !== "file:";
    const n = items.length, tiles = [];
    for (let rep = -1; rep <= 1; rep++) items.forEach((it, i) => {
      const v = video(it);
      if (useVideo && !v.src) { v.src = v.dataset.src; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto"; }
      const map = useVideo ? new THREE.VideoTexture(v) : placeholderTexture(i);
      map.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true,
        uniforms: { uMap: { value: map }, uCover: { value: new THREE.Vector2(1, 1) }, uGray: { value: 1 }, uOpacity: { value: 1 }, uBright: { value: 0.78 }, uWarp: { value: 0 }, uViewW: { value: 1 }, uHalfH: { value: TILE_H / 2 } } });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(TILE_W, TILE_H, 8, 8), mat);
      mesh.position.x = (rep * n + i - (n - 1) / 2) * UNIT;
      track.add(mesh);
      tiles.push({ mesh, mat, i, rep, home: mesh.position.x });
    });
    root.prepend(renderer.domElement);
    renderer.compile(scene, camera); // Compiling the shader on the first drag freezes the screen
    const gl = { renderer, scene, camera, track, tiles, viewW: 1, viewH: 1 };
    const fit = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
      gl.viewH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360); gl.viewW = gl.viewH * camera.aspect;
    };
    fit();
    addEventListener("resize", fit);
    return gl;
  }
  const indexAt = (s) => { const n = items.length; return (((Math.round(-s / UNIT + (n - 1) / 2)) % n) + n) % n; };
  const scrollFor = (i) => -(i - (items.length - 1) / 2) * UNIT;
  const bound = (v) => clamp(v, scrollFor(items.length - 1) - items.length * UNIT, scrollFor(0) + items.length * UNIT);
  function caption(i) {
    const row = lines[i];
    $(".hm-imm__name").textContent = $(".hm-line__name", row).textContent;
    $(".hm-imm__sub").textContent = $(".hm-line__ind", row).textContent;
    $(".hm-imm__year").textContent = $(".hm-line__year", row).textContent;
  }
  function frame() {
    const gl = S.gl;
    if (!gl) return;
    S.raf = requestAnimationFrame(frame);
    let morph = 1, sides = 1;
    if (S.intro) {
      const t = clamp((performance.now() - S.intro.t0) / (INTRO * 1000), 0, 1), p = S.intro.out ? 1 - t : t;
      // On entry: the center tile goes from full screen to tile size (progress 0 → .78), and the side tiles appear between .12 → .62
      morph = loco(clamp(p / 0.78, 0, 1));
      sides = loco(clamp((p - 0.12) / 0.5, 0, 1));
      root.classList.toggle("is-solid", p > 0.02);
      if (t >= 1) { const done = S.intro.done; S.intro = null; done(); }
    } else {
      if (!S.drag) S.scroll = lerp(S.scroll, S.target, 0.1);
      S.scroll = bound(S.scroll);
      const d = S.scroll - S.last;
      S.last = S.scroll;
      S.vel = lerp(S.vel, d, 0.16);
      const ai = clamp(S.vel * 12, -1.5, 1.5);
      const want = Math.abs(ai) > 0.001 ? Math.sign(ai) * Math.pow(Math.abs(ai), 1.85) * 0.46 : 0;
      S.warp = lerp(S.warp, want, S.drag ? 0.11 : 0.07);
      const sel = indexAt(S.scroll);
      if (sel !== S.sel) { S.sel = sel; caption(sel); gsap.fromTo(cap, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", overwrite: true }); }
    }
    gl.track.position.x = S.scroll;
    const coverS = Math.max(gl.viewW / TILE_W, gl.viewH / TILE_H);
    gl.tiles.forEach((t) => {
      const wx = t.home + S.scroll, center = Math.abs(wx) < UNIT * 0.35, u = t.mat.uniforms;
      u.uWarp.value = S.intro ? 0 : S.warp;
      u.uViewW.value = gl.viewW;
      u.uGray.value = S.intro ? (center ? 0 : 1) : lerp(u.uGray.value, center ? 0 : 1, 0.12);
      u.uOpacity.value = center ? 1 : sides;
      t.mesh.scale.setScalar(center ? lerp(coverS, 1, morph) : 1);
      t.mesh.position.x = center ? t.home : t.home + Math.sign(wx) * (1 - sides) * UNIT * 0.6;
      t.mesh.renderOrder = center ? 2 : 1;
      // From the crop ratio (cover) of the video at full screen to the tile ratio
      const a = lerp(gl.viewW / gl.viewH, 16 / 9, morph) / (16 / 9);
      u.uCover.value.set(center && a < 1 ? a : 1, center && a > 1 ? 1 / a : 1);
    });
    // Caption line sits at the left, below the center tile
    const px = innerHeight / gl.viewH;
    cap.style.width = TILE_W * px + "px";
    cap.style.transform = `translate3d(${innerWidth / 2 - (TILE_W * px) / 2}px, ${innerHeight / 2 + (TILE_H * px) / 2 + 12}px, 0)`;
    gl.renderer.render(gl.scene, gl.camera);
  }
  function enter() {
    S.busy = true; hold.classList.add("is-busy");
    if (!S.gl) S.gl = build();
    clearTimeout(timer);
    settle();
    S.sel = current; S.scroll = S.target = S.last = scrollFor(current); S.vel = S.warp = 0;
    caption(current);
    if (location.protocol !== "file:") items.forEach((it) => playVideo(video(it)));
    root.classList.add("is-active"); root.setAttribute("aria-hidden", "false");
    html.classList.add("is-carousel");
    gsap.to(feat, { opacity: 0, duration: INTRO * 0.5, ease: "power2.out" });
    gsap.to(cap, { opacity: 1, duration: 0.6, delay: INTRO * 0.86, ease: "power2.out" });
    S.intro = { t0: performance.now(), out: false, done: () => { S.busy = false; hold.classList.remove("is-busy"); bg.style.visibility = "hidden"; } };
    cancelAnimationFrame(S.raf);
    frame();
  }
  function exit() {
    S.busy = true; hold.classList.add("is-busy");
    const sel = S.sel;
    S.scroll = S.target = S.last = scrollFor(sel); S.vel = S.warp = 0;
    if (sel !== current) { items[current].classList.remove("is-active"); items[sel].classList.add("is-active"); current = sel; }
    bg.style.visibility = "";
    gsap.to(cap, { opacity: 0, duration: 0.3, overwrite: true });
    S.intro = { t0: performance.now(), out: true, done: () => {
      cancelAnimationFrame(S.raf);
      root.classList.remove("is-active", "is-solid"); root.setAttribute("aria-hidden", "true");
      html.classList.remove("is-carousel");
      items.forEach((it, i) => { if (i !== current) video(it).pause(); });
      playVideo(video(items[current]));
      gsap.to(feat, { opacity: 1, duration: INTRO * 0.52, ease: "power2.out" });
      runLine(current); schedule();
      S.busy = false; hold.classList.remove("is-busy");
    } };
  }
  // Press: the border fills over 650ms, rewinds if released early
  let holdRaf = 0, holdT0 = 0, hx = 0, hy = 0;
  const prog = $(".hm-hold__prog");
  const setHold = (p) => { hold.style.setProperty("--al-hold", p); prog.style.strokeDashoffset = 175.929 * (1 - p); hold.style.setProperty("--al-morph", S.mode === "carousel" ? 1 - p : p); };
  function release() {
    if (!holdRaf) return;
    cancelAnimationFrame(holdRaf); holdRaf = 0;
    hold.classList.remove("is-holding");
    setHold(0); // The original clears it as soon as it is detached
  }
  function holdTick() {
    const p = Math.max(0, Math.min(1, (performance.now() - holdT0) / 650)); // 650ms without a curve
    setHold(p);
    if (p < 1) { holdRaf = requestAnimationFrame(holdTick); return; }
    holdRaf = 0;
    hold.classList.remove("is-holding");
    S.mode = S.mode === "full" ? "carousel" : "full";
    setHold(0);
    if (S.mode === "carousel") enter(); else exit();
  }
  hold.addEventListener("pointerdown", (e) => {
    if (S.busy || !wide.matches || reduce && S.mode === "full") return;
    hx = e.clientX; hy = e.clientY;
    hold.classList.add("is-holding");
    holdT0 = performance.now() + 5; // The original has one beat (6–14ms measured) after the press before it starts filling
    cancelAnimationFrame(holdRaf);
    holdTick();
  });
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);
  addEventListener("pointermove", (e) => { if (holdRaf && Math.hypot(e.clientX - hx, e.clientY - hy) > 14) release(); });
  hold.addEventListener("contextmenu", (e) => e.preventDefault());

  // Tile row controls: drag (1px = .012) · wheel · left and right keys · on release it settles on the nearest tile
  let px0 = 0, s0 = 0, moved = 0;
  root.addEventListener("pointerdown", (e) => { if (S.intro) return; S.drag = true; px0 = e.clientX; s0 = S.scroll; moved = 0; root.setPointerCapture(e.pointerId); });
  root.addEventListener("pointermove", (e) => { if (!S.drag) return; const dx = e.clientX - px0; moved = Math.max(moved, Math.abs(dx)); S.scroll = bound(s0 + dx * 0.012); S.target = S.scroll; });
  const drop = (e) => {
    if (!S.drag) return;
    S.drag = false;
    if (moved < 4 && S.gl) { // Center the tile that was pressed without dragging
      const wx = ((e.clientX - innerWidth / 2) / innerHeight) * S.gl.viewH;
      S.target = bound(S.scroll - Math.round(wx / UNIT) * UNIT);
    }
    S.target = bound(Math.round((S.target - scrollFor(0)) / UNIT) * UNIT + scrollFor(0));
  };
  root.addEventListener("pointerup", drop);
  root.addEventListener("pointercancel", drop);
  root.addEventListener("wheel", (e) => {
    if (S.intro) return;
    e.preventDefault();
    S.target = bound(S.target - (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 0.012);
    clearTimeout(root._snap);
    root._snap = setTimeout(() => { S.target = bound(Math.round((S.target - scrollFor(0)) / UNIT) * UNIT + scrollFor(0)); }, 140);
  }, { passive: false });
  addEventListener("keydown", (e) => {
    if (S.mode !== "carousel" || S.intro) return;
    if (e.key === "ArrowRight") S.target = bound(S.target - UNIT);
    if (e.key === "ArrowLeft") S.target = bound(S.target + UNIT);
  });
})();
