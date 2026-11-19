// Motion across all pages — Lenis smooth scroll · first-page intro · sliding cell of the glass menu · magnetic talk button · cursor (mouse-follower) ·
// Line reveal (title swift 0.8,0,0.1,1 · text ccv 0.9,0.1,0.1,1) · name tag masking · bending divider · work card reveal · photo ripple (one WebGL panel) · squishy ball pile (matter.js) · review panel
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("swift", "M0,0 C0.8,0 0.1,1 1,1");
  CustomEase.create("ccv", "M0,0 C0.9,0.1,0.1,1 1,1");
  CustomEase.create("cubix", "M0,0 C0.3,0.1,0.02,1,1,1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  probe.canvas.width = probe.canvas.height = 1;
  const holder = document.createElement("i"); holder.style.display = "none"; document.documentElement.append(holder);
  const rgb = (v) => { holder.style.color = `var(${v})`; probe.clearRect(0, 0, 1, 1); probe.fillStyle = getComputedStyle(holder).color; probe.fillRect(0, 0, 1, 1); const d = probe.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255]; };

  // ── Lenis ──
  const lenis = reduce ? null : new Lenis({ autoRaf: false });
  if (lenis) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  const onScroll = () => document.body.classList.toggle("is-scrolled", scrollY > 60);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ── Line Splitting ──
  const splitLines = (el) => {
    const s = new SplitText(el, { type: "lines", linesClass: "b-line" });
    s.lines.forEach((l) => { const m = document.createElement("div"); m.className = "b-oh"; l.parentNode.insertBefore(m, l); m.append(l); });
    el.classList.add("is-split");
    return s.lines;
  };
  const intro = [];
  // Split lines after the font arrives — so lines measured with a fallback font don’t rewrap when the web font swaps in
  const splitAll = () => {
  $$("[data-title-split]").forEach((el) => {
    const lines = splitLines(el);
    if (reduce) return;
    if (el.hasAttribute("data-intro")) { gsap.set(lines, { yPercent: 120 }); intro.push(() => gsap.to(lines, { yPercent: 0, duration: 2, ease: "swift", delay: 0.02, stagger: 0.12 })); return; }
    gsap.set(lines, { yPercent: 112 });
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1.5, ease: "swift", stagger: 0.1 }) });
  });
  $$("[data-lines]").forEach((el) => {
    const lines = splitLines(el);
    if (reduce) return;
    gsap.set(lines, { yPercent: 110 });
    if (el.hasAttribute("data-intro")) { intro.push(() => gsap.to(lines, { yPercent: 0, duration: 1.5, ease: "swift", delay: 0.3, stagger: 0.08 })); return; }
    const fast = el.classList.contains("b-xs");
    ScrollTrigger.create({ trigger: el, start: fast ? "top 88%" : "top 89%", once: true,
      onEnter: () => gsap.to(lines, { yPercent: 0, duration: fast ? 1 : 1.7, delay: fast ? 0.04 : 0, ease: "ccv", stagger: fast ? 0.07 : 0.1 }) });
  });
  };
  // Name tag — the cover lifts away with 3s sine.out
  $$("[data-meta]").forEach((el) => {
    if (reduce) { el.style.setProperty("--mask", "0%"); return; }
    gsap.set(el, { "--mask": "100%" });
    ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: () => gsap.to(el, { "--mask": "0%", duration: 3, ease: "sine.out" }) });
  });
  // Divider line — drawn in, bends following the cursor, and when the cursor leaves it returns trembling with 3s elastic.out(1,.035)
  $$("[data-divider]").forEach((d) => {
    const svg = $("svg", d), path = $("path", d);
    const pathAt = (x, y, w) => `M0 50 Q${(x / w) * 1000} ${y} 1000 50`;
    gsap.set(svg, { transformOrigin: "left center", scaleX: reduce ? 1 : 0 });
    if (!reduce) ScrollTrigger.create({ trigger: d, start: "top 80%", once: true, onEnter: () => gsap.to(svg, { scaleX: 1, duration: 1.6, ease: "ccv" }) });
    let off = 0;
    d.addEventListener("pointermove", (e) => { const b = d.getBoundingClientRect(), y = e.clientY - b.top; off = off || (y < 50 ? 50 : -50); gsap.to(path, { attr: { d: pathAt(e.clientX - b.left, 2 * y - 100 + off, b.width) }, duration: 0.3, overwrite: true }); });
    d.addEventListener("pointerleave", () => { off = 0; gsap.to(path, { attr: { d: pathAt(500, 50, 1000) }, duration: 3, overwrite: true, ease: "elastic.out(1, 0.035)" }); });
  });

  // ── Menu — the filled cell stands under the current page link (the original doesn’t follow hover) ──
  const menu = $("[data-nav-menu]"), slider = $("[data-nav-slider]");
  if (menu && slider) {
    const links = $$(".b-nav__link", menu), cur = links.find((a) => a.classList.contains("is-current")) || links[0];
    const go = (a, inst) => {
      const r = a.getBoundingClientRect(), p = menu.getBoundingClientRect();
      links.forEach((l) => l.classList.toggle("is-on", l === a));
      gsap.to(slider, { x: r.left - p.left + 6, width: r.width, duration: inst ? 0 : 0.5, ease: "power3.out", overwrite: true });
    };
    requestAnimationFrame(() => go(cur, true));
    document.fonts?.ready.then(() => go(cur, true));
  }
  const toggle = $("[data-nav-toggle]"), panel = $("[data-nav-panel]");
  toggle?.addEventListener("click", () => { const open = toggle.getAttribute("aria-expanded") !== "true"; toggle.setAttribute("aria-expanded", String(open)); panel.classList.toggle("is-open", open); open ? lenis?.stop() : lenis?.start(); });

  // ── Magnetic Button ──
  if (fine && !reduce) $$("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => { const b = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - b.left - b.width / 2) * 0.3, y: (e.clientY - b.top - b.height / 2) * 0.3, duration: 0.6, ease: "power3.out" }); });
    el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, 0.4)" }));
  });

  // ── Cursor — the same mouse-follower as the original (speed .75 expo.out · tilt 3) ──
  if (fine && window.MouseFollower) new MouseFollower({ container: document.body, className: "mf-cursor", innerClassName: "mf-cursor-inner", textClassName: "mf-cursor-text", mediaClassName: "mf-cursor-media", mediaBoxClassName: "mf-cursor-media-box", iconSvgClassName: "mf-svgsprite", iconSvgNamePrefix: "-", dataAttr: "cursor", hiddenState: "-hidden", textState: "-text", iconState: "-icon", activeState: "-active", mediaState: "-media", stateDetection: { "-pointer": "a,button", "-hidden": "iframe" }, visible: true, visibleOnState: false, speed: reduce ? 0 : 0.75, ease: "expo.out", overwrite: true, skewing: reduce ? 0 : 3, skewingText: 0.75, skewingIcon: 2, skewingMedia: 2, skewingDelta: 0.001, skewingDeltaMax: 0.3, stickDelta: 0.15, showTimeout: 20, hideOnLeave: true, hideTimeout: 300, hideMediaTimeout: 300 });

  // ── Work cards — on the first page the first two cards start once the intro panel begins to lift, then .7s later lift from the bottom while the inside settles down from 1.4x (2.3s cubic · .25s gap).
  //    Work list Hero is 1.65s power4.out (.22s apart, from 1.1x), the rest 2s cubix when visible ──
  const fluidState = new WeakMap();
  const isHome = !!$("[data-loader]");
  const cards = $$("[data-project]");
  const introCards = [];
  cards.forEach((card, i) => {
    const cover = $(".b-cover", card), meta = $(".b-project__meta", card), st = { reveal: reduce ? 1 : 0, scale: 1 };
    fluidState.set(cover, st);
    if (reduce) return;
    const first = i < 2 && card.getBoundingClientRect().top < innerHeight * 1.2;
    const from = isHome && first ? 1.4 : 1.1;
    st.scale = from;
    gsap.set(cover, { clipPath: "inset(100% 0% 0% 0%)", scale: from });
    gsap.set(meta, { autoAlpha: 0, y: 14 });
    const play = (delay, dur, ease) => {
      gsap.to(cover, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: dur, ease, delay });
      gsap.to(st, { reveal: 1, scale: 1, duration: dur, ease, delay });
      gsap.to(meta, { autoAlpha: 1, y: 0, duration: 0.95, ease: "power3.out", delay: delay + 0.18 });
    };
    if (isHome && first) introCards.push((at) => play(at + i * 0.25, 2.3, "cubix"));
    else if (!isHome && card.getBoundingClientRect().top < innerHeight) intro.push(() => play(i * 0.22, 1.65, "power4.out"));
    else ScrollTrigger.create({ trigger: card, start: "top 92%", once: true, onEnter: () => play(0, 2, "cubix") });
  });

  // ── Photo ripple — a single WebGL plate fixed to the screen draws a placeholder picture at each [data-fluid] spot and bends where the cursor passed like a ripple ──
  const FRAG = `
  precision highp float; uniform sampler2D uMap; uniform vec2 uMouse; uniform float uHover, uTime, uReveal, uScale, uSpeed; varying vec2 vUv;
  void main(){
    vec2 uv = (vUv - 0.5) / uScale + 0.5;
    vec2 d = uv - uMouse; float r = length(d);
    float wave = sin(r * 38.0 - uTime * 5.0) * exp(-r * 7.0) * uHover;
    uv += normalize(d + 1e-4) * wave * 0.012 + d * uHover * -0.04 * exp(-r * 4.0);
    float split = uSpeed * 0.006 + uHover * 0.002;
    vec3 c = vec3(texture2D(uMap, uv + vec2(split, 0.0)).r, texture2D(uMap, uv).g, texture2D(uMap, uv - vec2(split, 0.0)).b);
    if (1.0 - vUv.y > uReveal) discard;
    gl_FragColor = vec4(c, 1.0);
  }`;
  function fluidLayer(els) {
    if (!window.THREE || !els.length) return;
    const T = THREE, cv = document.createElement("canvas");
    cv.className = "b-fluid-layer"; cv.setAttribute("aria-hidden", "true");
    Object.assign(cv.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "5", pointerEvents: "none" });
    document.body.append(cv);
    let R;
    try { R = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { cv.remove(); return; }
    R.setPixelRatio(Math.min(devicePixelRatio, 1.75)); R.outputColorSpace = T.LinearSRGBColorSpace;
    const scene = new T.Scene(), cam = new T.OrthographicCamera(0, 1, 0, 1, -1, 1);
    const surf = rgb("--kf-surface"), raised = rgb("--kf-raised"), dim = rgb("--kf-dim");
    const col = (c) => `rgb(${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)})`;
    const items = els.map((el, k) => {
      const c2 = document.createElement("canvas"), g = c2.getContext("2d"); c2.width = 600; c2.height = 760;
      const grd = g.createLinearGradient(0, 0, 600, 760); grd.addColorStop(0, col(surf)); grd.addColorStop(1, col(raised));
      g.fillStyle = grd; g.fillRect(0, 0, 600, 760);
      g.strokeStyle = col(dim); g.globalAlpha = 0.35; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(600, 760); g.moveTo(600, 0); g.lineTo(0, 760); g.stroke();
      g.globalAlpha = 1; g.fillStyle = col(dim); g.font = `500 22px ${css("--kf-font-sans")}`; g.textAlign = "center";
      const words = (el.dataset.label || "").split(" · ");
      words.forEach((w, n) => g.fillText(w, 300, 380 + (n - (words.length - 1) / 2) * 32));
      const tex = new T.CanvasTexture(c2); tex.colorSpace = T.NoColorSpace;
      const u = { uMap: { value: tex }, uMouse: { value: new T.Vector2(0.5, 0.5) }, uHover: { value: 0 }, uTime: { value: 0 }, uReveal: { value: 1 }, uScale: { value: 1 }, uSpeed: { value: 0 } };
      const m = new T.Mesh(new T.PlaneGeometry(1, 1), new T.ShaderMaterial({ uniforms: u, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }", fragmentShader: FRAG, transparent: true }));
      scene.add(m);
      const it = { el, m, u, hover: 0, want: 0 };
      el.addEventListener("pointerenter", () => (it.want = 1));
      el.addEventListener("pointerleave", () => (it.want = 0));
      el.addEventListener("pointermove", (e) => { const b = el.getBoundingClientRect(); u.uMouse.value.set((e.clientX - b.left) / b.width, 1 - (e.clientY - b.top) / b.height); });
      return it;
    });
    let lastY = scrollY, speed = 0;
    const resize = () => { R.setSize(innerWidth, innerHeight, false); cam.right = innerWidth; cam.bottom = innerHeight; cam.updateProjectionMatrix(); };
    resize(); addEventListener("resize", resize);
    gsap.ticker.add((t, dms) => {
      const dt = Math.min(0.1, (dms || 16) / 1000);
      speed += (Math.min(1, Math.abs(scrollY - lastY) / 60) - speed) * 0.1; lastY = scrollY;
      let any = false;
      items.forEach((it) => {
        const b = it.el.getBoundingClientRect(), vis = b.bottom > 0 && b.top < innerHeight && b.width > 0;
        it.m.visible = vis; if (!vis) return; any = true;
        const st = fluidState.get(it.el) || { reveal: 1, scale: 1 };
        it.hover += (it.want - it.hover) * (1 - Math.exp(-dt * 4));
        it.m.position.set(b.left + b.width / 2, b.top + b.height / 2, 0); it.m.scale.set(b.width, -b.height, 1);
        it.u.uHover.value = reduce ? 0 : it.hover; it.u.uTime.value = t; it.u.uReveal.value = st.reveal; it.u.uScale.value = st.scale; it.u.uSpeed.value = reduce ? 0 : speed;
      });
      if (any) R.render(scene, cam);
    });
  }
  fluidLayer($$("[data-fluid]"));

  // Squishy ball pile (matter.js) — smiley-face balls fall and stack, and get pushed as the cursor passes
  $$("[data-matter]").forEach((box) => {
    const cv = $("[data-matter-canvas]", box);
    if (!window.Matter || !cv) return;
    const { Engine, Bodies, Composite, Body } = Matter, g = cv.getContext("2d");
    const eng = Engine.create(); eng.gravity.y = 1;
    let W = 0, H = 0, balls = [], walls = [];
    const ink = rgb("--kf-ink"), soft = rgb("--kf-accent-soft"), col = (c, a = 1) => `rgba(${Math.round(c[0] * 255)}, ${Math.round(c[1] * 255)}, ${Math.round(c[2] * 255)}, ${a})`;
    const build = () => {
      const b = box.getBoundingClientRect(); W = b.width; H = b.height; cv.width = W * 2; cv.height = H * 2;
      Composite.clear(eng.world); const t = 200;
      walls = [Bodies.rectangle(W / 2, H + t / 2, W * 2, t, { isStatic: true }), Bodies.rectangle(-t / 2, H / 2, t, H * 4, { isStatic: true }), Bodies.rectangle(W + t / 2, H / 2, t, H * 4, { isStatic: true })];
      const r = W * 0.052; balls = Array.from({ length: 64 }, (_, i) => Bodies.circle(r + Math.random() * (W - 2 * r), -i * r * 0.9 - Math.random() * H * 0.4, r, { restitution: 0.35, friction: 0.05, angle: Math.random() * 6 }));
      Composite.add(eng.world, [...walls, ...balls]);
    };
    let started = false;
    ScrollTrigger.create({ trigger: box, start: "top 85%", once: true, onEnter: () => { build(); started = true; } });
    box.addEventListener("pointermove", (e) => {
      const b = box.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
      balls.forEach((o) => { const dx = o.position.x - x, dy = o.position.y - y, d = Math.hypot(dx, dy); if (d < o.circleRadius * 2.4) Body.setVelocity(o, { x: o.velocity.x + (dx / d) * 4, y: o.velocity.y + (dy / d) * 4 - 2 }); });
    });
    gsap.ticker.add((t, dms) => {
      if (!started) return;
      const b = box.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight) return;
      Engine.update(eng, Math.min(32, dms || 16));
      g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, W, H);
      balls.forEach((o) => {
        const r = o.circleRadius; g.save(); g.translate(o.position.x, o.position.y); g.rotate(o.angle);
        g.fillStyle = col(ink, 0.82); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
        g.strokeStyle = col(soft); g.lineWidth = r * 0.14; g.lineCap = "round";
        g.beginPath(); g.arc(0, r * 0.08, r * 0.5, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
        g.fillStyle = col(soft); [-1, 1].forEach((s) => { g.beginPath(); g.arc(s * r * 0.3, -r * 0.22, r * 0.1, 0, Math.PI * 2); g.fill(); });
        g.restore();
      });
    });
  });

  // ── Review panel — drag to glide with inertia, Next advances one card at a time. Numbers roll letter by letter (out 300ms · 30ms stagger / in 600ms · 130ms + 100ms stagger) ──
  $$("[data-reviews]").forEach((vp) => {
    const track = $("[data-reviews-track]", vp), cards = [...track.children], sec = vp.closest("section");
    const idxEl = $("[data-reviews-index]", sec), next = $("[data-reviews-next]", sec);
    let x = 0, target = 0, index = 0, drag = null;
    const step = () => cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : vp.clientWidth;
    const max = () => Math.max(0, track.scrollWidth - vp.clientWidth);
    const setIndex = (i) => {
      if (i === index) return;
      const to = String(i + 1).padStart(2, "0"), dir = i > index ? 1 : -1; index = i;
      const old = [...idxEl.children].length ? [...idxEl.children] : null;
      idxEl.innerHTML = `<span class="b-roll__out"></span><span class="b-roll__in"></span>`;
      const [o, n] = idxEl.children;
      Object.assign(idxEl.style, { position: "relative" });
      o.style.cssText = "position:absolute;left:0;top:0;display:inline-flex"; n.style.cssText = "display:inline-flex";
      const prev = (old ? old.at(-1).textContent : "01");
      [...prev].forEach((c) => { const s = document.createElement("span"); s.textContent = c; s.style.display = "inline-block"; o.append(s); });
      [...to].forEach((c) => { const s = document.createElement("span"); s.textContent = c; s.style.display = "inline-block"; n.append(s); });
      if (reduce) { o.remove(); return; }
      [...o.children].forEach((s, k) => s.animate([{ transform: "translateY(0%)" }, { transform: `translateY(${-100 * dir}%)` }], { duration: 300, delay: k * 30, easing: "cubic-bezier(.55,.055,.675,.19)", fill: "both" }));
      [...n.children].forEach((s, k) => s.animate([{ transform: `translateY(${100 * dir}%)` }, { transform: "translateY(0%)" }], { duration: 600, delay: 130 + k * 100, easing: "cubic-bezier(.215,.61,.355,1)", fill: "both" }));
      setTimeout(() => o.remove(), 900);
    };
    // Follows the target every frame like the original: .1 after release, .28 while dragging, and dragged distance times 1.2
    const snap = (i) => { const n = Math.max(0, Math.min(cards.length - 1, i)); target = -Math.min(max(), n * step()); setIndex(n); };
    vp.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, start: target, t: performance.now(), last: e.clientX, v: 0 }; vp.setPointerCapture(e.pointerId); });
    vp.addEventListener("pointermove", (e) => { if (!drag) return; const now = performance.now(); drag.v = (e.clientX - drag.last) / Math.max(1, now - drag.t); drag.last = e.clientX; drag.t = now; target = drag.start + (e.clientX - drag.x) * 1.2; });
    const end = () => { if (!drag) return; const thrown = target + drag.v * 320; drag = null; snap(Math.round(-thrown / step())); };
    vp.addEventListener("pointerup", end); vp.addEventListener("pointercancel", end);
    next?.addEventListener("click", () => snap(index + 1 >= cards.length - 1 ? 0 : index + 1));
    gsap.ticker.add(() => { x += (target - x) * (reduce ? 1 : drag ? 0.28 : 0.1); track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`; });
  });

  // ── Footer Clock ──
  const clock = $("[data-clock]");
  if (clock) { const tick = () => (clock.textContent = new Date().toTimeString().slice(0, 8)); tick(); setInterval(tick, 1000); }

  // ── Intro (first page only) — after .15s, while the bar fills over 2.64s, the wordmark enters at .7s over .35s, stays .35s, leaves over .5s, and the icon stands up at .7s.
  // When loading finishes, after .2s the icon exits in .42s and the bar in .65s, and starting .3s before that the panel lifts up over 2s power4.inOut (inner lines move down) ──
  const loader = $("[data-loader]");
  let ready = false, wantIntro = false, introAt = 0;
  const runIntro = () => { if (!ready) { wantIntro = true; return; } intro.forEach((f) => f()); introCards.forEach((f) => f(introAt)); };
  Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 2500))]).then(() => { splitAll(); ready = true; ScrollTrigger.refresh(); if (wantIntro) runIntro(); });
  if (!loader || reduce) { loader?.remove(); document.documentElement.classList.add("is-loaded"); introAt = 0; runIntro(); }
  else {
    const bar = $("[data-loader-bar]"), row = $("[data-loader-row]"), logo = $("[data-loader-logo]"), icon = $("[data-loader-icon]");
    lenis?.stop();
    const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => { addEventListener("load", r, { once: true }); setTimeout(r, 6500); });
    const exit = gsap.timeline({ paused: true })
      .to(icon, { autoAlpha: 0, duration: 0.42, ease: "power2.inOut" })
      .to(bar, { scaleX: 0, transformOrigin: "right center", duration: 0.65, ease: "power2.inOut" })
      .addLabel("reveal", "-=0.3")
      .to(loader, { yPercent: -101, duration: 2, ease: "power4.inOut" }, "reveal")
      .to(row, { yPercent: 101, duration: 2, ease: "power4.inOut" }, "reveal")
      .call(() => { introAt = 0.6; runIntro(); }, null, "reveal+=0.1")
      .call(() => { document.documentElement.classList.add("is-loaded"); lenis?.start(); }, null, "reveal+=2");
    gsap.timeline({ delay: 0.15, onComplete: () => loaded.then(() => gsap.delayedCall(0.2, () => exit.play(0))) })
      .to(bar, { scaleX: 1, duration: 2.64, ease: "power2.inOut" }, 0)
      .to(logo, { autoAlpha: 1, duration: 0.7, ease: "none" }, 0.35)
      .to(logo, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, 1.4)
      .to(icon, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 1.94);
  }

  window.brand = { lenis, rgb, css, reduce, fine };
})();
