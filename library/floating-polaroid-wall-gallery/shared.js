// Decorative motion: footprint loader → lens-hole entrance, title letters lighting up at random, age and date number strips, spinning glass star and badge icon (three), badge text ring, scroll bar, zoom screen.
// Exchanges data with the scene (index.js) via window.sr — the scene reads sr.intro.zoom (0→1) · sr.intro.enter (hole progress) every frame,
// The scene calls sr.bar (progress, moving, zooming) and sr.focus (open, date), and receives sr.onBar (position) when the bar is dragged.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sr = (window.sr = { intro: { zoom: reduced ? 1 : 0, enter: reduced ? 1 : 0 }, entered: reduced });

  // WebGL cannot read var() — paint the skin variable onto a hidden element to receive the computed color, and decode it to rgb with a 1px canvas (oklch relative colors resolve too)
  const probe = document.createElement("i");
  probe.hidden = true;
  document.documentElement.append(probe);
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  sr.css = (v) => {
    probe.style.color = `var(${v})`;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(probe).color;
    px.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = px.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  };
  sr.rgb = (v) => sr.css(v).match(/[\d.]+/g).slice(0, 3).map((n) => n / 255);
  sr.font = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  // Glass material (our shader): toward the edges it gets whiter and more opaque (rim strength), a thin-film rainbow wheels across the slanted surfaces, and a single sparkle sits on top.
  // Values are the original settings — icon (rim 2.5 · sparkle 50 · opacity .6→.5 · sparkle strength 1.45 · rainbow .4), bubble (3.3 · 60 · 0→.55 · 1 · .85)
  sr.GLASS = { icon: { rim: 2.5, spec: 50, minA: 0.6, maxA: 0.5, specI: 1.45, iri: 0.4 }, bubble: { rim: 3.3, spec: 60, minA: 0, maxA: 0.55, specI: 1, iri: 0.85 } };
  sr.glass = (T, look, tintVar) => new T.ShaderMaterial({
    transparent: true, depthWrite: false, side: T.DoubleSide,
    uniforms: { uTint: { value: new T.Color(...sr.rgb(tintVar)) }, uRim: { value: look.rim }, uSpec: { value: look.spec }, uMinA: { value: look.minA }, uMaxA: { value: look.maxA }, uSpecI: { value: look.specI }, uIri: { value: look.iri } },
    vertexShader: `varying vec3 vN; varying vec3 vW;
      void main(){
        #ifdef USE_INSTANCING
          vec4 w = modelMatrix * instanceMatrix * vec4(position, 1.); vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        #else
          vec4 w = modelMatrix * vec4(position, 1.); vN = normalize(mat3(modelMatrix) * normal);
        #endif
        vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 uTint; uniform float uRim, uSpec, uMinA, uMaxA, uSpecI, uIri; varying vec3 vN; varying vec3 vW;
      vec3 film(float t){ return .5 + .5 * cos(6.28318 * (t + vec3(0., .33, .67))); }
      void main(){
        vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
        vec3 v = normalize(cameraPosition - vW);
        float edge = 1. - max(dot(n, v), 0.);
        float rim = pow(edge, uRim);
        vec3 col = mix(uTint, vec3(1.), rim * .85);
        // Curtain rainbow mixed half with white to stay faint — shows only at the rim
        col = mix(col, mix(vec3(1.), film(edge * .9 + .15), .7), uIri * smoothstep(.25, 1., edge));
        // Sparkles also take on the curtain rainbow tint (original bubble’s pink and green dots)
        vec3 l = normalize(vec3(.45, .8, .55));
        float sp = pow(max(dot(reflect(-l, n), v), 0.), uSpec) * uSpecI;
        col += sp * mix(vec3(1.), film(edge + .4), uIri * .6);
        gl_FragColor = vec4(col, clamp(mix(uMinA, uMaxA, rim) + sp, 0., 1.)); }`,
  });

  // Number strip: stack 0–9 cells per digit and roll to that cell when the value changes
  const odo = (el, text) => {
    if (el.dataset.built !== text.length + "") {
      el.innerHTML = [...text].map((c) => /\d/.test(c)
        ? `<span class="sr-digit"><span>${Array.from({ length: 10 }, (_, i) => `<b>${i}</b>`).join("")}</span></span>`
        : `<span class="sr-dot">${c}</span>`).join("");
      el.dataset.built = text.length + "";
    }
    const strips = $$(".sr-digit > span", el);
    let k = 0;
    [...text].forEach((c) => { if (/\d/.test(c)) strips[k++].style.transform = `translateY(${-Number(c) * 10}%)`; });
  };
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  const today = new Date();
  const dateText = `${today.getFullYear()}.${pad(today.getMonth() + 1)}.${pad(today.getDate())}`;
  $("[data-year]").textContent = today.getFullYear();

  // Age as of today: months and days
  const ageEl = $("[data-age]");
  const born = new Date(ageEl.dataset.age);
  let months = (today.getFullYear() - born.getFullYear()) * 12 + today.getMonth() - born.getMonth();
  let anchor = new Date(born.getFullYear(), born.getMonth() + months, born.getDate());
  if (anchor > today) { months -= 1; anchor = new Date(born.getFullYear(), born.getMonth() + months, born.getDate()); }
  const days = Math.floor((today - anchor) / 864e5);
  const odoM = $('[data-odo="m"]'), odoD = $('[data-odo="d"]');
  odoM.classList.add("sr-odo"); odoD.classList.add("sr-odo");
  odo(odoM, "0".repeat(String(months).length)); odo(odoD, "00");

  // Split title letters
  $$("[data-chars]").forEach((w) => { w.innerHTML = [...w.dataset.chars].map((c) => `<span>${c}</span>`).join(""); });

  // Loader cards: original hash positions (horizontal (h(i+31)−.5)×58, vertical (h(i+57)−.5)×46, tilt (h(i+83)−.5)×17°), dropping at .24s intervals
  const hash = (t) => { const e = 43758.5453 * Math.sin(12.9898 * t); return e - Math.floor(e); };
  $$("[data-card]").forEach((c, i) => {
    c.style.setProperty("--card-x", `${(hash(i + 31) - 0.5) * 58}px`);
    c.style.setProperty("--card-y", `${(hash(i + 57) - 0.5) * 46}px`);
    c.style.setProperty("--card-rotate", `${(hash(i + 83) - 0.5) * 17}deg`);
    c.style.animationDelay = `${0.24 * i}s`;
  });

  // Footprints (original formula): a random quadratic curve across the screen is measured in 400 segments and a step is placed every 58px, skipping the card group and date spots (±16px).
  // Wide screens go from off the left (-80) to off the right (+232), phones (under 820) from off the bottom (+80) to off the top (-232). Staggered 11px left and right, standing along the travel direction
  const PAW = '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="15.5" rx="5.6" ry="4.8" fill="currentColor"/><ellipse cx="5.2" cy="9.6" rx="2.2" ry="2.8" fill="currentColor"/><ellipse cx="9.4" cy="5.6" rx="2.2" ry="2.9" fill="currentColor"/><ellipse cx="14.6" cy="5.6" rx="2.2" ry="2.9" fill="currentColor"/><ellipse cx="18.8" cy="9.6" rx="2.2" ry="2.8" fill="currentColor"/></svg>';
  const paws = $("[data-paws]");
  const placePaws = () => {
    const w = innerWidth, h = innerHeight, phone = w < 820, R = Math.random;
    const a = R() < 0.5 ? 0.1 + 0.18 * R() : 0.72 + 0.18 * R(), l = 0.42 + 0.16 * R(), o = 0.36 + 0.28 * R(), k = 0.38 + 0.24 * R();
    const p0 = phone ? [w * a, h + 80] : [-80, h * a], p1 = phone ? [w * l, h * k] : [w * k, h * l], p2 = phone ? [w * o, -232] : [w + 232, h * o];
    const keep = [];
    const cardRects = $$("[data-card]").map((c) => c.getBoundingClientRect());
    if (cardRects.length) keep.push(cardRects.reduce((m, r) => ({ left: Math.min(m.left, r.left), top: Math.min(m.top, r.top), right: Math.max(m.right, r.right), bottom: Math.max(m.bottom, r.bottom) })));
    keep.push(dateEl.getBoundingClientRect());
    const inside = (x, y) => keep.some((r) => x > r.left - 16 && x < r.right + 16 && y > r.top - 16 && y < r.bottom + 16);
    const pts = Array.from({ length: 401 }, (_, i) => { const t = i / 400, u = 1 - t; return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]; });
    const out = [];
    let run = 0, side = 1;
    for (let i = 1; i < pts.length; i++) {
      run += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (run < 58) continue;
      run = 0;
      if (inside(pts[i][0], pts[i][1])) continue;
      const A = pts[Math.max(0, i - 4)], B = pts[Math.min(400, i + 4)], dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
      side *= -1;
      out.push(`<span class="sr-paw" style="left:${pts[i][0] - (dy / len) * 11 * side}px;top:${pts[i][1] + (dx / len) * 11 * side}px;transform:translate(-50%,-50%) rotate(${(Math.atan2(dy, dx) * 180) / Math.PI + 90}deg)">${PAW}</span>`);
    }
    paws.innerHTML = out.join("");
  };
  const loader = $("[data-loader]");
  const ui = $(".sr-ui");
  const loaderIn = $("[data-loader-in]");
  const dateEl = $("[data-loader-date]");
  // Loader date: counts up from the birthday to today over 2.3s with 1−(1−s)³ (original) — each digit’s 0–9 strip rolls to follow
  const fmt = (ms) => { const d = new Date(ms); return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`; };
  const bornMs = born.getTime();
  odo(dateEl, fmt(bornMs));
  placePaws();

  const titleIntro = () => {
    const parts = [...$$(".sr-title__w > span"), $("[data-star]")];
    const order = parts.map((_, i) => i).sort(() => Math.random() - 0.5);
    const tl = gsap.timeline();
    parts.forEach((el, i) => tl.fromTo(el, { opacity: 0, filter: "blur(20px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }, 0.1 * order[i]));
    tl.fromTo($$("[data-sub]"), { opacity: 0, filter: "blur(12px)", y: 4 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.6, ease: "power2.out", stagger: 0.2 }, "-=0.2");
    tl.fromTo($$("[data-side]"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.08 }, "<+=0.1");
    tl.add(() => { odo(odoM, String(months)); odo(odoD, pad(days)); }, "<");
  };

  if (reduced) {
    loader.classList.add("is-gone");
    odo(odoM, String(months)); odo(odoD, pad(days));
  } else {
    gsap.set([...$$(".sr-title__w > span"), $("[data-star]"), ...$$("[data-sub]"), ...$$("[data-side]")], { opacity: 0 });
    document.body.style.cursor = "wait";
    $$(".sr-paw", paws).forEach((p, i) => gsap.to(p, {
      keyframes: { "0%": { opacity: 0 }, "14%": { opacity: 0.85 }, "48%": { opacity: 0.85 }, "100%": { opacity: 0 } },
      duration: 2.4, delay: i * 0.12, ease: "power1.out",
    }));
    const d0 = performance.now(), nowMs = Date.now();
    const count = (now) => {
      const p = Math.min(1, (now - d0) / 2300);
      odo(dateEl, fmt(bornMs + (nowMs - bornMs) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(count); else odo(dateEl, dateText);
    };
    requestAnimationFrame(count);
    // After 2.9s the loader content vanishes in .45s, and on the white panel a hole (8% edge blur) opens from the center 0→120%
    setTimeout(() => {
      document.body.style.cursor = "";
      loader.classList.add("is-open");
      gsap.to(loaderIn, { opacity: 0, scale: 0.96, duration: 0.45, ease: "power2.out" });
      const m = { r: 0 };
      gsap.to(m, {
        r: 120, duration: 1.2, delay: 0.3, ease: "power2.out",
        onUpdate: () => {
          const g = `radial-gradient(circle at 50% 50%, transparent ${m.r}%, black ${m.r + 8}%)`;
          loader.style.maskImage = g; loader.style.webkitMaskImage = g;
          sr.intro.enter = m.r / 120;
        },
        onComplete: () => { loader.classList.add("is-gone"); sr.entered = true; titleIntro(); },
      });
      gsap.to(sr.intro, { zoom: 1, duration: 1.8, delay: 0.3, ease: "power1.inOut" });
    }, 2900);
  }

  // Small glass shape canvases — the star (center of the title) and the badge icon. The original also draws them on two separate small canvases
  const T = window.THREE;
  const mini = (canvas, build) => {
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 20);
    cam.position.z = 4.6;
    const group = new T.Group();
    scene.add(group);
    const step = build(group);
    const fit = () => { const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    new ResizeObserver(fit).observe(canvas);
    fit();
    return (t, dt) => { step(t, dt, group); r.render(scene, cam); };
  };
  // Star: our own shape, a four-point star pushed out plump and carved. Original formulas as is: x .12·sin(.7t), y .8t (+4π 1.1s power3.out on press), z .05·sin(.5t), height .03·sin(1.1t)
  const spin = { v: 0 };
  $("[data-star]").addEventListener("click", () => gsap.to(spin, { v: spin.v + 4 * Math.PI, duration: 1.1, ease: "power3.out", overwrite: "auto" }));
  const starStep = mini($("[data-star-canvas]"), (g) => {
    const sh = new T.Shape();
    const p = (x, y) => [(x - 20) / 18, (20 - y) / 18];
    sh.moveTo(...p(20, 2));
    sh.bezierCurveTo(...p(21.6, 13.6), ...p(26.4, 18.4), ...p(38, 20));
    sh.bezierCurveTo(...p(26.4, 21.6), ...p(21.6, 26.4), ...p(20, 38));
    sh.bezierCurveTo(...p(18.4, 26.4), ...p(13.6, 21.6), ...p(2, 20));
    sh.bezierCurveTo(...p(13.6, 18.4), ...p(18.4, 13.6), ...p(20, 2));
    const geo = new T.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.07, bevelSegments: 8, curveSegments: 28 });
    geo.center();
    g.add(new T.Mesh(geo, sr.glass(T, sr.GLASS.icon, "--site-glass")));
    return (t) => { g.rotation.set(0.12 * Math.sin(0.7 * t), 0.8 * t + spin.v, 0.05 * Math.sin(0.5 * t)); g.position.y = 0.03 * Math.sin(1.1 * t); };
  });
  // Badge icon: a rounded-square glass plate (background color) with camera-shaped lines in front (accent color — rounded-square rim, circle, dot). Like the original it spins on y, then speeds up to 2.2rad/s on hover (.5 normally, following with 1−.01^dt)
  const badge = $(".sr-badge");
  let badgeHot = false, iconSpeed = 0.5, iconYaw = 0;
  badge.addEventListener("pointerenter", () => { badgeHot = true; });
  badge.addEventListener("pointerleave", () => { badgeHot = false; });
  const iconStep = mini($("[data-icon-canvas]"), (g) => {
    const rounded = (w, h, r) => {
      const s = new T.Shape(), x = -w / 2, y = -h / 2;
      s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
      s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
      s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
      return s;
    };
    const ext = (shape, depth) => { const geo = new T.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 5, curveSegments: 24 }); geo.center(); return geo; };
    const base = new T.Mesh(ext(rounded(1.7, 1.7, 0.52), 0.28), sr.glass(T, sr.GLASS.icon, "--site-glass"));
    const lineMat = sr.glass(T, sr.GLASS.icon, "--site-glass-line");
    const frame = rounded(1.18, 1.18, 0.34);
    frame.holes.push(rounded(0.92, 0.92, 0.22));
    const lines = new T.Group();
    lines.add(new T.Mesh(ext(frame, 0.08), lineMat));
    lines.add(new T.Mesh(new T.TorusGeometry(0.25, 0.065, 16, 48), lineMat));
    const dot = new T.Mesh(new T.SphereGeometry(0.075, 16, 12), lineMat);
    dot.position.set(0.33, 0.33, 0);
    lines.add(dot);
    lines.position.z = 0.24;
    const back = lines.clone();
    back.position.z = -0.24;
    back.scale.x = -1;
    g.add(base, lines, back);
    g.scale.setScalar(1.05);
    return (t, dt) => {
      iconSpeed += ((badgeHot ? 2.2 : 0.5) - iconSpeed) * (1 - Math.pow(0.01, dt));
      iconYaw += dt * iconSpeed;
      g.rotation.set(0.12 * Math.sin(0.7 * t), iconYaw, 0.05 * Math.sin(0.5 * t));
      g.position.y = 0.03 * Math.sin(1.1 * t);
    };
  });
  // Badge text ring: 20° per second normally, 60° on hover — speed follows by 1−e^(−3.5·dt) (original value). Stops in the zoomed view.
  const ring = $("[data-badge-ring]");
  let ringAngle = 0, ringSpeed = 20;
  // Scrollbar (original rule): visible while zooming, while dragging the bar, or within 800ms of motion stopping (.5s transition).
  // The scene calls sr.bar (progress 0..1, moving, zooming) every frame, and pressing and dragging the bar moves the scene through sr.onBar (position 0..1)
  const bar = $("[data-bar]"), thumb = $("[data-bar-thumb]");
  let barLast = 0, barDrag = false;
  sr.onBar = null;
  const barAt = (y) => {
    const r = bar.getBoundingClientRect(), room = r.height - thumb.clientHeight;
    if (room <= 0) return;
    barLast = performance.now();
    sr.onBar?.(Math.min(Math.max(y - r.top - thumb.clientHeight / 2, 0), room) / room);
  };
  bar.addEventListener("pointerdown", (e) => { e.preventDefault(); e.stopPropagation(); barDrag = true; bar.setPointerCapture(e.pointerId); barAt(e.clientY); });
  bar.addEventListener("pointermove", (e) => { if (barDrag) { e.preventDefault(); barAt(e.clientY); } });
  const barEnd = (e) => { if (!barDrag) return; barDrag = false; barLast = performance.now(); try { bar.releasePointerCapture(e.pointerId); } catch {} sr.onBarEnd?.(); };
  bar.addEventListener("pointerup", barEnd);
  bar.addEventListener("pointercancel", barEnd);
  sr.bar = (p, moving, focused) => {
    thumb.style.transform = `translateY(${p * (bar.clientHeight - thumb.clientHeight)}px)`;
    if (moving) barLast = performance.now();
    bar.classList.toggle("is-on", focused || barDrag || performance.now() - barLast < 800);
  };
  const t0 = performance.now();
  let last = t0;
  const tick = (now) => {
    const t = reduced ? 0 : (now - t0) / 1000, dt = Math.min(Math.max(0, now - last) / 1000, 0.1);
    last = now;
    if (!reduced && !ui.classList.contains("is-dim")) {
      ringSpeed += ((badgeHot ? 60 : 20) - ringSpeed) * (1 - Math.exp(-3.5 * dt));
      ringAngle = (ringAngle + ringSpeed * dt) % 360;
      ring.style.transform = `rotate(${ringAngle}deg)`;
    }
    starStep(t, reduced ? 0 : dt);
    iconStep(t, reduced ? 0 : dt);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame((now) => { last = now; tick(now); });

  // Zoomed view
  const modal = $("[data-modal]");
  sr.focus = (open, date) => {
    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", String(!open));
    ui.classList.toggle("is-dim", open);
    if (date) $("[data-modal-date]").textContent = date;
  };
  $("[data-back]").addEventListener("click", () => dispatchEvent(new CustomEvent("sr:back")));
  addEventListener("resize", placePaws);
})();
