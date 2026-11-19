// First page: Hero door (Lottie loader) → once inside, 18 artwork boards circle along a cylindrical spiral (three.js).
// Spiral values were measured from the original and carried over: plate 1.7×1 (8×8 cells) · vertical gap .5 · angle gap .85rad · radius 2 · camera z 8 / FOV 35° (45° below 900)
// 1.5e-4 per 1px of wheel (cap ±2) · follow .1 · .9 damping every frame · minimum speed .002 so it always turns slowly.
(() => {
  const { audio, store, reduce, lot } = window.pp;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const PROJECTS = [
    { title: "Your work title here", label: "Piece 01 · primary-color 3D character · bright studio light · 16:9", ratio: 16 / 9 },
    { title: "Your even longer work title here", label: "Piece 02 · hand-drawn illustration · cream background · 16:9", ratio: 16 / 9 },
    { title: "Work title, third", label: "Piece 03 · pattern graphic · primary blue · 16:9", ratio: 16 / 9 },
    { title: "Work Four", label: "Work 04 · space planet 3D · dark background · 16:9", ratio: 16 / 9 },
    { title: "Work Five", label: "Piece 05 · abstract shape animation · neon green · 16:9", ratio: 1396 / 770 },
    { title: "Work number six", label: "Work 06 · travel illustration · sky blue · 16:9", ratio: 16 / 9 },
    { title: "Work Title Seven", label: "Piece 07 · figure silhouette · orange backlight · 16:9", ratio: 16 / 9 },
    { title: "Brand work eight", label: "Piece 08 · car ad 3D · matte gray · 4:3", ratio: 1258 / 984 },
    { title: "Work title, ninth", label: "Work 09 · blurry dreamlike scene · purple mist · 16:9", ratio: 16 / 9 },
  ];

  // ── Hero Door ──
  const loader = $(".pp-loader");
  const enterBtn = $(".pp-enter");
  const noSound = $(".pp-nosound");
  const loaderText = $(".pp-loader-text");
  let world = null;

  // Split button text within word chunks — spaces are left as is
  const label = $(".animated-label", enterBtn);
  label.innerHTML = label.textContent.split(" ").map((w) => `<span class="word">${[...w].map((c) => `<span class="letter">${c}</span>`).join("")}</span>`).join(" ");
  if (!reduce) {
    const letters = $$(".letter", enterBtn);
    const tl = gsap.timeline({ paused: true });
    tl.to(letters, { rotation: () => gsap.utils.random(-15, 15), scale: () => gsap.utils.random(1.15, 1.4), fontWeight: 600, duration: 0.25, ease: "power2.out", stagger: { amount: 0.25 } })
      .to(letters, { rotation: 0, scale: 1, fontWeight: 500, duration: 0.25, ease: "elastic.out(1, 0.8)", stagger: { amount: 0.25 } });
    enterBtn.addEventListener("mouseenter", () => tl.restart());
  }

  // Loader Lottie — like the original, 300×300 canvas at 25fps. Blue dot (greeting) → three shapes (name) → gather into a face. Text is shown in HTML matched to the frames
  function loaderData() {
    const { K, A, group, ellipse, fill, layer, faceShapes } = lot;
    const blue = pp.rgbOf("--site-pop-blue"), orange = pp.rgbOf("--site-pop-orange"), navy = pp.rgbOf("--site-pop-navy"), accent = pp.rgbOf("--kf-accent");
    // 0~100: greeting → name → face. 100~200: as in the original, while the door is open the face slowly looks left and right (only this range repeats)
    const OP = 200, READY = 100, C = [150, 150, 0];
    const rect = (w, h, r) => ({ ty: "rc", d: 1, p: K([0, 0]), s: K([w, h]), r: K(r) });
    const dot = layer([group([ellipse(0, 0, 22, 22), fill(blue)])], {
      p: A([[0, [150, 30, 0]], [46, [150, 30, 0]], [52, [150, 150, 0]]]),
      s: A([[0, [0, 0, 100]], [4, [125, 125, 100]], [8, [100, 100, 100]], [50, [100, 100, 100]], [54, [0, 0, 100]]]),
    }, OP, 1);
    const shape = (items, x, t0) => group(items, {
      p: A([[0, [x, 0]], [70, [x, 0]], [76, [0, 0]]]),
      s: A([[0, [0, 0]], [t0, [0, 0]], [t0 + 5, [110, 110]], [t0 + 8, [100, 100]], [70, [100, 100]], [76, [0, 0]]]),
    });
    const trio = layer([
      shape([rect(34, 34, 8), fill(navy)], -42, 52),
      shape([ellipse(0, 0, 34, 34), fill(accent)], 0, 54),
      shape([rect(40, 30, 6), fill(orange)], 42, 56),
    ], { p: K(C) }, OP, 2);
    const faceParts = faceShapes(1, READY);
    const look = faceParts[0].it[faceParts[0].it.length - 1];
    look.p = A([[0, [0, 2]], [READY, [0, 2]], [125, [-8, 3]], [150, [0, 2]], [175, [8, 3]], [OP, [0, 2]]]);
    const face = layer(faceParts, {
      p: K(C),
      s: A([[0, [0, 0, 100]], [74, [0, 0, 100]], [82, [155, 155, 100]], [88, [138, 138, 100]]]),
    }, OP, 3);
    return { v: "5.12.1", fr: 25, ip: 0, op: OP, w: 300, h: 300, nm: "loader", ddd: 0, assets: [], layers: [dot, trio, face] };
  }

  function enterSite(withSound) {
    store.entered = true;
    store.sound = withSound;
    audio.mute(!withSound);
    $(".pp-sound")?.classList.toggle("is-muted", !withSound);
    audio.play("ambient");
    if (withSound) audio.play("click");
    loader.classList.add("is-leaving");
    setTimeout(() => loader.classList.add("is-gone"), reduce ? 0 : 500);
    setTimeout(() => world?.reveal(), 200);
  }

  if (store.entered) {
    loader.classList.add("is-gone");
  } else {
    const split = new SplitText(loaderText, { type: "lines", linesClass: "line", tag: "span" });
    gsap.set(split.lines, { yPercent: -100, opacity: 0 });
    const caps = $$(".pp-loader-cap");
    // The original shows the intro text (loader end) and the enter button (spiral image ready) separately — the ready value approaches the share of downloaded images as its target by .02 per frame and must reach 100
    let progress = 0, textShown = false, readyShown = false;
    const showButtons = () => {
      if (!textShown || !readyShown) return;
      enterBtn.classList.add("is-show");
      noSound.classList.add("is-show");
    };
    const ease = () => {
      progress += (100 - progress) * 0.02;
      if (Math.abs(progress - 100) < 0.5) { readyShown = true; showButtons(); return; }
      requestAnimationFrame(ease);
    };
    if (reduce) readyShown = true; else requestAnimationFrame(ease);
    const done = () => {
      gsap.to(split.lines, { yPercent: 0, opacity: 1, stagger: { each: 0.1 }, ease: "power1.out", duration: reduce ? 0 : 0.6 });
      textShown = true;
      showButtons();
    };
    const anim = lottie.loadAnimation({ container: $(".pp-loader-anim"), renderer: "svg", loop: false, autoplay: !reduce, animationData: loaderData() });
    anim.addEventListener("DOMLoaded", () => loaderText.classList.add("is-ready"));
    let ready = false;
    anim.addEventListener("enterFrame", (e) => {
      // In the repeating range (100~200) enterFrame gives the index within the range, so letter pop-up happens only on the first loop
      if (!ready) caps.forEach((c) => c.classList.toggle("is-on", e.currentTime >= +c.dataset.from && e.currentTime < +c.dataset.to));
      else caps.forEach((c) => c.classList.remove("is-on"));
      // In the original, the intro text comes down while the face is still settling (about 3.5s)
      if (!ready && e.currentTime >= 82) { ready = true; done(); }
    });
    anim.addEventListener("complete", () => { if (!loader.classList.contains("is-gone")) anim.playSegments([100, 200], true); });
    if (reduce) { anim.goToAndStop(100, true); loaderText.classList.add("is-ready"); ready = true; done(); }
    enterBtn.addEventListener("click", () => enterSite(true));
    noSound.addEventListener("click", () => enterSite(false));
  }

  // ── WebGL spiral ──
  const canvas = $(".pp-webgl");
  const fontSans = getComputedStyle(document.documentElement).getPropertyValue("--kf-font-sans").trim();

  // Work thumbnail placeholder — gray plate + diagonal X + a label saying what the photo is
  function thumb(p, i) {
    const w = 512, h = Math.round(512 / p.ratio);
    const c = Object.assign(document.createElement("canvas"), { width: w, height: h });
    const g = c.getContext("2d");
    g.fillStyle = pp.colorOf("--site-ph");
    g.fillRect(0, 0, w, h);
    g.strokeStyle = pp.colorOf("--site-ph-line");
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke();
    g.fillStyle = pp.colorOf("--site-ph-ink");
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `600 64px ${fontSans}`;
    g.fillText(String(i + 1).padStart(2, "0"), w / 2, h / 2 - 34);
    const parts = p.label.split(" · ");
    g.font = `500 22px ${fontSans}`;
    g.fillText(parts.slice(1, 3).join(" · "), w / 2, h / 2 + 20);
    g.font = `400 18px ${fontSans}`;
    g.fillText(parts.slice(3).join(" · "), w / 2, h / 2 + 50);
    const tex = new THREE.CanvasTexture(c);
    tex.userData = { w, h };
    return tex;
  }

  const VERT = /* glsl */ `
    uniform float uSpeed;
    varying vec2 vUv;
    const float PI = 3.141592653589793;
    void main() {
      vUv = uv;
      vec3 world = (modelMatrix * vec4(position, 1.0)).xyz;
      vec3 bent = vec3(position.xy, sin(uv.x * PI) * 0.2);
      vec4 view = viewMatrix * modelMatrix * vec4(bent, 1.0);
      view.x += world.y * world.y * 0.1;
      view.x += sin(uv.y * PI) * uSpeed * 2.0;
      gl_Position = projectionMatrix * view;
    }`;
  const FRAG = /* glsl */ `
    uniform sampler2D uMap;
    uniform vec2 uPlane;
    uniform vec2 uImage;
    uniform vec2 uView;
    uniform vec3 uShade;
    uniform vec3 uFade;
    uniform float uDark;
    uniform float uZoom;
    uniform float uReveal;
    varying vec2 vUv;
    float roundBox(vec2 p, vec2 size, float r) {
      vec2 q = abs(p - 0.5) - size * 0.5 + r;
      return length(max(q, 0.0)) - r;
    }
    void main() {
      vec2 fit = vec2(
        min((uPlane.x / uPlane.y) / (uImage.x / uImage.y), 1.0),
        min((uPlane.y / uPlane.x) / (uImage.y / uImage.x), 1.0));
      vec2 uv = vUv * fit + (1.0 - fit) * 0.5;
      vec3 col;
      if (gl_FrontFacing) {
        col = mix(texture2D(uMap, (uv - 0.5) / uZoom + 0.5).rgb, uShade, uDark);
      } else {
        float o = 40.0 / 1024.0;
        vec3 acc = vec3(0.0);
        for (int x = -1; x <= 1; x++) {
          for (int y = -1; y <= 1; y++) {
            float w = (x == 0 ? 2.0 : 1.0) * (y == 0 ? 2.0 : 1.0);
            acc += texture2D(uMap, uv + vec2(float(x), float(y)) * o).rgb * w;
          }
        }
        col = acc / 16.0;
      }
      float r = clamp(uReveal, 0.0, 1.0);
      float alpha = (1.0 - smoothstep(0.0, 0.002, roundBox(vUv, vec2(r), 0.05 * r))) * smoothstep(0.1, 1.0, uReveal);
      float sy = gl_FragCoord.y / uView.y;
      float edge = clamp(clamp((0.2 - sy) / 0.2, 0.0, 1.0) + clamp((sy - 0.8) / 0.2, 0.0, 1.0), 0.0, 1.0);
      gl_FragColor = vec4(mix(col, uFade, edge), alpha);
    }`;

  function makeWorld() {
    if (!window.THREE) return null;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance", stencil: false });
    } catch (e) {
      return null;
    }
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(innerWidth < 900 ? 45 : 35, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);
    const view = renderer.getDrawingBufferSize(new THREE.Vector2());
    const shade = new THREE.Color(...pp.rgbOf("--kf-bg"));
    const fade = new THREE.Color(...pp.rgbOf("--site-fade"));

    const ctl = { target: 0, delta: 0, scroll: 0, dir: 1, mouse: new THREE.Vector2(-9, -9), paused: false };
    const geo = new THREE.PlaneGeometry(1, 1, 8, 8);
    const list = [...PROJECTS, ...PROJECTS];
    const COUNT = list.length, CENTER = Math.floor(COUNT / 2);
    const textures = PROJECTS.map(thumb);
    const planes = list.map((p, index) => {
      const tex = textures[index % PROJECTS.length];
      const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          uMap: { value: tex }, uPlane: { value: new THREE.Vector2(1.7, 1) }, uImage: { value: new THREE.Vector2(tex.userData.w, tex.userData.h) },
          uView: { value: view }, uShade: { value: shade }, uFade: { value: fade },
          uDark: { value: 0 }, uZoom: { value: 1 }, uReveal: { value: 0 }, uSpeed: { value: 0 },
        },
      }));
      mesh.scale.set(1.7, 1, 1);
      scene.add(mesh);
      return { mesh, p, index, isHidden: true, hidden: 1, hiddenT: 1, hovered: false, hover: 0, hoverT: 0 };
    });

    const step = (pl, dt) => {
      const hb = pl.hovered ? 0.09 : 0.07;
      pl.hover += (pl.hoverT - pl.hover) * (1 - Math.pow(1 - hb, dt * 0.2));
      pl.hidden += (pl.hiddenT - pl.hidden) * (1 - Math.pow(1 - 0.05, dt * 0.15));
      const g = pl.isHidden ? 1.5 : -1.5;
      let n = pl.index - ctl.scroll;
      n = ((n % COUNT) + COUNT) % COUNT;
      const b = n - CENTER, a = b * 0.85, r = 2 * (1 - pl.hidden / 2);
      pl.mesh.position.set(Math.cos(a) * r, b * 0.5 - 0.8 - pl.hidden * g, Math.sin(a) * r);
      pl.mesh.rotation.y = -a + Math.PI / 2;
      const u = pl.mesh.material.uniforms;
      u.uDark.value = 0.55 * pl.hover;
      u.uZoom.value = 1 + 0.05 * pl.hover;
      u.uReveal.value = (1 - pl.hover * 0.05) * (1 - pl.hidden);
      u.uSpeed.value = ctl.delta;
    };

    // Slab picking — only when the front face looks at me, only fully revealed slabs
    const ray = new THREE.Raycaster();
    const hoverEl = $(".pp-hover");
    let hovered = null, menuOpen = false;
    const pick = () => {
      ray.setFromCamera(ctl.mouse, camera);
      const hit = ray.intersectObjects(planes.map((p) => p.mesh))[0];
      if (!hit) return null;
      const pl = planes.find((p) => p.mesh === hit.object);
      const facing = hit.face.normal.clone().transformDirection(pl.mesh.matrixWorld).dot(ray.ray.direction) < 0;
      return facing && pl.hidden < 0.01 ? pl : null;
    };
    const setHover = (pl) => {
      if (pl === hovered) return;
      if (hovered) { hovered.hovered = false; hovered.hoverT = 0; }
      hovered = pl;
      canvas.style.cursor = pl ? "pointer" : "default";
      if (pl) {
        pl.hovered = true;
        pl.hoverT = 1;
        audio.play("hover");
        $("h4", hoverEl).textContent = pl.p.title;
        $(".wf-img", hoverEl).dataset.label = pl.p.label;
        hoverEl.classList.remove("is-off");
        hoverEl.classList.add("is-on");
      } else {
        hoverEl.classList.replace("is-on", "is-off");
      }
    };
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const api = {
      reveal() { ctl.paused = false; planes.forEach((pl, i) => setTimeout(() => { pl.isHidden = false; pl.hiddenT = 0; }, reduce ? 0 : (i % 4) * 50)); },
      hide() { planes.forEach((pl, i) => setTimeout(() => { pl.isHidden = true; pl.hiddenT = 1; }, reduce ? 0 : (i % 4) * 30)); setHover(null); },
    };

    addEventListener("wheel", (e) => {
      if (ctl.paused || menuOpen || document.body.dataset.mode === "list") return;
      ctl.target = Math.max(-2, Math.min(2, ctl.target + e.deltaY * 15e-5));
      ctl.dir = e.deltaY > 0 ? 1 : -1;
    }, { passive: true });
    addEventListener("mousemove", (e) => {
      ctl.mouse.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    });
    canvas.addEventListener("click", () => {
      if (!hovered || hovered.hidden >= 0.01) return;
      // The original hides the board when moving to a work detail, and since detail pages are not recorded, it hides it and then unfolds it again
      audio.play("longclick");
      api.hide();
      setTimeout(api.reveal, 900);
    });
    let tx = 0, lastX = 0, vx = 0, dragging = false;
    canvas.addEventListener("touchstart", (e) => { tx = lastX = e.touches[0].clientX; vx = 0; dragging = false; }, { passive: true });
    canvas.addEventListener("touchmove", (e) => {
      const x = e.touches[0].clientX;
      if (!dragging && Math.abs(x - tx) > 8) dragging = true;
      if (dragging) {
        e.preventDefault();
        const m = -(x - lastX) * 0.5;
        ctl.target = Math.max(-2, Math.min(2, ctl.target - m * 0.003));
        ctl.dir = m < 0 ? 1 : -1;
        vx = m;
      }
      lastX = x;
    }, { passive: false });
    canvas.addEventListener("touchend", () => {
      if (dragging) ctl.target = Math.max(-2, Math.min(2, ctl.target - vx * 0.002));
      dragging = false;
    });
    document.addEventListener("pp:menu", (e) => { menuOpen = e.detail; if (menuOpen) setHover(null); });
    addEventListener("resize", () => {
      camera.aspect = innerWidth / innerHeight;
      camera.fov = innerWidth < 900 ? 45 : 35;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      renderer.getDrawingBufferSize(view);
    });

    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(Math.max(1, now - last), 50);
      last = now;
      if (!reduce) {
        ctl.delta += (ctl.target - ctl.delta) * 0.1;
        ctl.scroll += ctl.delta;
        if (Math.abs(ctl.target) < 0.002) ctl.target = ctl.dir * 0.002;
        ctl.target *= 0.9;
      }
      if (!touch && !menuOpen) setHover(pick());
      planes.forEach((pl) => step(pl, reduce ? 1e4 : dt));
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return api;
  }
  world = makeWorld();
  if (store.entered) setTimeout(() => world?.reveal(), reduce ? 0 : 300);

  // ── Spiral • list toggle ──
  const listEl = $(".pp-list");
  const rows = $$(".pp-list-row", listEl);
  document.body.dataset.mode = "spiral";
  const showList = () => {
    listEl.hidden = false;
    window.ppLenis?.resize();
    if (reduce) return;
    gsap.fromTo(rows, { y: -30, opacity: 0, scaleY: 0.5 }, { y: 0, opacity: 1, scaleY: 1, duration: 0.5, ease: "power3.out", stagger: 0.05, delay: 0.2, onComplete: () => window.ppLenis?.resize() });
  };
  const hideList = () => {
    if (reduce) { listEl.hidden = true; return; }
    gsap.fromTo(rows, { y: 0, opacity: 1 }, { y: 50, opacity: 0, scaleY: 0.5, duration: 0.3, ease: "power3.out", stagger: 0.05, onComplete: () => { listEl.hidden = true; } });
  };
  $$(".pp-switch button").forEach((btn) => btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    if (document.body.dataset.mode === mode) return;
    document.body.dataset.mode = mode;
    $$(".pp-switch-btn").forEach((b) => b.classList.toggle("is-active", b.contains(btn)));
    if (mode === "spiral") { audio.play("spiral"); world?.reveal(); hideList(); setCursor(null); }
    else { audio.play("list"); world?.hide(); showList(); }
  }));

  // List cursor thumbnail — original CursorImage: position lerp .1, size lerp .07 (1 if there is a work, .5 if not), translate(-25%, -75%)
  const cur = $(".pp-cursor-image");
  const pos = { x: 0, y: 0 }, aim = { x: 0, y: 0 };
  let scale = 0, project = null;
  function setCursor(i) {
    project = i;
    cur.classList.toggle("is-hidden", i === null);
    if (i === null) return;
    const last = cur.lastElementChild;
    if (last && last.dataset.i === String(i)) return;
    const img = document.createElement("div");
    img.className = "wf-img";
    img.dataset.i = i;
    img.dataset.label = PROJECTS[i].label;
    cur.append(img);
    while (cur.children.length > 5) cur.firstElementChild.remove();
  }
  addEventListener("mousemove", (e) => {
    const b = document.body.getBoundingClientRect();
    aim.x = e.clientX - b.left;
    aim.y = e.clientY - b.top;
  }, { passive: true });
  if (pp.finePointer) {
    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => { audio.play("hover"); setCursor(+row.dataset.i); });
      row.addEventListener("mouseleave", () => setCursor(null));
    });
    gsap.ticker.add(() => {
      pos.x += (aim.x - pos.x) * 0.1;
      pos.y += (aim.y - pos.y) * 0.1;
      scale += ((project !== null ? 1 : 0.5) - scale) * 0.07;
      if (scale <= 0.01 && project === null && cur.children.length) cur.replaceChildren();
      cur.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-25%, -75%) scale(${scale})`;
    });
  }
  $$(".pp-list a").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); audio.play("longclick"); }));
})();
