// Device shared by all pages. The original (a single-page Nuxt app) keeps the menu, logo, sound and showreel alive across page changes,
// Here the same mechanism is set up again on each page and only the entered and sound-on flags are passed along via sessionStorage.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const store = {
    get entered() { return sessionStorage.getItem("pp-entered") === "1"; },
    set entered(v) { sessionStorage.setItem("pp-entered", v ? "1" : "0"); },
    get sound() { return sessionStorage.getItem("pp-sound") !== "off"; },
    set sound(v) { sessionStorage.setItem("pp-sound", v ? "on" : "off"); },
  };

  // Skin variables as [r,g,b] 0..1 used by Lottie·WebGL — when the skin is swapped the graphic changes too
  const ctx2d = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d", { willReadFrequently: true });
  const probe = document.createElement("i");
  function rgbOf(name) {
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    ctx2d.clearRect(0, 0, 1, 1);
    ctx2d.fillStyle = resolved;
    ctx2d.fillRect(0, 0, 1, 1);
    const d = ctx2d.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  }

  // ── Sound: the original uses howler.js with 13 effects + background music. Original sound files can’t be used, so short sounds with the same names and volumes are baked on the fly ──
  function wavUrl(dur, fn) {
    const sr = 22050, n = Math.floor(sr * dur), buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const put = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    put(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); put(8, "WAVE"); put(12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true);
    v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); put(36, "data"); v.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, fn(t, t / dur))) * 32767, true);
    }
    return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
  }
  const tau = Math.PI * 2;
  const blip = (f, d, decay = 6, f2 = f) => wavUrl(d, (t, p) => Math.sin(tau * (f + (f2 - f) * p) * t) * Math.exp(-p * decay) * 0.6);
  const SOUNDS = {
    ambient: { make: () => wavUrl(4, (t) => (Math.sin(tau * 110 * t) + Math.sin(tau * 165 * t) * 0.6 + Math.sin(tau * 220 * t) * 0.3) * (0.5 + 0.5 * Math.sin(tau * 0.25 * t)) * 0.18), volume: 0.3, loop: true },
    hover: { make: () => blip(1320, 0.06, 8), volume: 1 },
    click: { make: () => blip(660, 0.09, 7), volume: 0.5 },
    spiral: { make: () => blip(330, 0.35, 4, 660), volume: 0.4 },
    list: { make: () => blip(660, 0.35, 4, 330), volume: 0.4 },
    tick: { make: () => blip(2200, 0.03, 9), volume: 0.2 },
    longclick: { make: () => blip(440, 0.4, 3, 880), volume: 0.5 },
    switch: { make: () => blip(880, 0.08, 6), volume: 0.5 },
    close: { make: () => blip(740, 0.18, 5, 370), volume: 0.7 },
    menuhome: { make: () => blip(523, 0.25, 4), volume: 0.5 },
    menuabout: { make: () => blip(587, 0.25, 4), volume: 0.5 },
    smiley: { make: () => blip(784, 0.22, 3, 1046), volume: 0.5 },
  };
  const howls = {};
  // In environments where sound is blocked (headless, no audio device) howler throws and halts the whole page, so quietly disable only the sound part
  const canAudio = (() => {
    try { const C = window.AudioContext || window.webkitAudioContext; return !!(window.Howl && C && typeof C.prototype.createGain === "function"); } catch (e) { return false; }
  })();
  const guard = (fn) => { if (!canAudio) return; try { fn(); } catch (e) { /* Drop Sound Only */ } };
  const audio = {
    play(name) {
      guard(() => {
        if (!SOUNDS[name]) return;
        if (!howls[name]) {
          const s = SOUNDS[name];
          howls[name] = new Howl({ src: [s.make()], format: ["wav"], volume: s.volume, loop: !!s.loop, html5: true });
        }
        if (name === "ambient" && howls[name].playing()) return;
        howls[name].play();
      });
    },
    mute(on) { guard(() => Howler.mute(on)); },
    volume(v) { guard(() => Howler.volume(v)); },
  };

  // ── Lottie faces: the original logo is 75×75, 25fps, five faces of 44~48 frames. We build our shapes at the same size and length ──
  const K = (k) => ({ a: 0, k });
  const A = (keys) => ({
    a: 1,
    k: keys.map(([t, s], i) => (i < keys.length - 1 ? { t, s: [].concat(s), i: { x: 0.33, y: 1 }, o: { x: 0.67, y: 0 } } : { t, s: [].concat(s) })),
  });
  const tr = (o = {}) => ({ ty: "tr", p: o.p || K([0, 0]), a: K([0, 0]), s: o.s || K([100, 100]), r: o.r || K(0), o: o.o || K(100), sk: K(0), sa: K(0) });
  const group = (items, t) => ({ ty: "gr", it: [...items, tr(t)] });
  const ellipse = (x, y, w, h) => ({ ty: "el", d: 1, p: K([x, y]), s: K([w, h]) });
  const fill = (c, o = 100) => ({ ty: "fl", c: K([...c, 1]), o: K(o), r: 1 });
  const stroke = (c, w) => ({ ty: "st", c: K([...c, 1]), o: K(100), w: K(w), lc: 2, lj: 2, ml: 4 });
  const path = (v, i, o, c = false) => ({ ty: "sh", ks: K({ v, i, o, c }) });
  const layer = (shapes, extra = {}, op = 48, ind = 1) => ({
    ddd: 0, ind, ty: 4, nm: `l${ind}`, sr: 1, ao: 0, bm: 0, ip: 0, op, st: 0,
    ks: { o: extra.o || K(100), r: extra.r || K(0), p: extra.p || K([37.5, 37.5, 0]), a: K([0, 0, 0]), s: extra.s || K([100, 100, 100]) },
    shapes,
  });

  // Face shape group: shared by the logo (75 panel) and the loader (300 panel)
  function faceShapes(variant, op) {
    const accent = rgbOf("--kf-accent"), ink = rgbOf("--kf-ink"), bg = rgbOf("--kf-bg"), soft = rgbOf("--kf-accent-soft");
    const blink = (a, b, c) => A([[0, [100, 100]], [a, [100, 100]], [b, [100, 12]], [c, [100, 100]], [op, [100, 100]]]);
    const wide = A([[0, [100, 100]], [12, [135, 135]], [op, [100, 100]]]);
    const eyeL = group([ellipse(0, 0, 6, 8), fill(ink)], { p: K([-8, -6]), s: variant === 2 ? blink(14, 20, 26) : variant === 1 ? blink(18, 22, 26) : variant === 4 ? wide : K([100, 100]) });
    const eyeR = group([ellipse(0, 0, 6, 8), fill(ink)], { p: K([8, -6]), s: variant === 1 ? blink(18, 22, 26) : variant === 4 ? wide : K([100, 100]) });
    const smile = group([path([[-10, 3], [10, 3]], [[0, 0], [-3.5, 8]], [[3.5, 8], [0, 0]]), stroke(ink, 3.5)], {
      s: variant === 4 ? A([[0, [100, 100]], [12, [55, 150]], [32, [55, 150]], [op, [100, 100]]]) : variant === 1 ? A([[0, [100, 100]], [24, [118, 112]], [op, [100, 100]]]) : K([100, 100]),
    });
    const features = group([eyeL, eyeR, smile], {
      p: variant === 3 ? A([[0, [0, 0]], [8, [-7, 1]], [28, [7, 1]], [op, [0, 0]]]) : variant === 5 ? A([[0, [0, 0]], [10, [0, 4]], [22, [0, -3]], [op, [0, 0]]]) : K([0, 2]),
    });
    const sphere = group([
      ellipse(0, 0, 58, 58),
      { ty: "gf", o: K(100), r: 1, t: 2, h: K(0), a: K(0), s: K([12, -16]), e: K([-30, 34]), g: { p: 3, k: K([0, ...soft, 0.45, ...accent, 1, ...bg]) } },
    ]);
    const ring = group([ellipse(0, 0, 58, 58), stroke(accent, 0.8)], { o: K(40) });
    return [features, ring, sphere];
  }

  function faceData(variant) {
    const op = variant === 1 ? 48 : 44;
    return {
      v: "5.12.1", fr: 25, ip: 0, op, w: 75, h: 75, nm: `FACE-${variant}`, ddd: 0, assets: [],
      layers: [layer(faceShapes(variant, op), {
        r: variant === 2 ? A([[0, [0]], [14, [-12]], [op, [0]]]) : K(0),
        s: variant === 5 ? A([[0, [100, 100, 100]], [8, [86, 86, 100]], [20, [108, 108, 100]], [op, [100, 100, 100]]]) : K([100, 100, 100]),
      }, op)],
    };
  }

  function mountFace(el, variant = 1, { autoplay = true } = {}) {
    if (!window.lottie || !el) return null;
    let anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: autoplay && !reduce, animationData: faceData(variant) });
    if (reduce) anim.goToAndStop(0, true);
    return {
      set(v) {
        anim.destroy();
        anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: !reduce, animationData: faceData(v) });
      },
    };
  }

  // ── Fixed-fixture markup — attached from a single place for every page ──
  const ICON = {
    cross: '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    on: '<svg class="on" viewBox="0 0 14 12" fill="none"><path d="M1 4h2.5L7 1v10L3.5 8H1z" fill="currentColor"/><path d="M9.5 3.5a3.5 3.5 0 010 5M11.5 1.5a6.4 6.4 0 010 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    off: '<svg class="off" viewBox="0 0 14 12" fill="none"><path d="M1 4h2.5L7 1v10L3.5 8H1z" fill="currentColor"/><path d="M9.5 4l3.5 4M13 4l-3.5 4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    play: '<svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 1.5v11l9-5.5z" fill="currentColor"/></svg>',
    social: (n) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="13" height="13" rx="${n % 2 ? 6.5 : 3.5}" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="${2 + n * 0.4}" fill="currentColor"/></svg>`,
  };
  const page = document.body.dataset.page;
  const chrome = document.createElement("div");
  chrome.className = "pp-chrome";
  chrome.innerHTML = `
    <div class="pp-logo" data-slot="logo" role="button" tabindex="0" aria-label="Logo — click to change the face">
      <div class="pp-face"></div>
      <div class="pp-logo-tag" aria-hidden="true">
        <svg class="star" viewBox="0 0 74 71"><defs><linearGradient id="pp-star" x1="7" x2="66" y1="65" y2="6" gradientUnits="userSpaceOnUse"><stop offset=".1" style="stop-color: var(--site-star-a)"/><stop offset="1" style="stop-color: var(--site-star-b)"/></linearGradient></defs><path d="M37 0l8.6 24.3L71 23.5 50.8 39.4 59 64 37 49.3 15 64l8.2-24.6L3 23.5l25.4.8z" fill="url(#pp-star)"/></svg>
        <svg class="tag" viewBox="0 0 157 60"><rect x="1" y="6" width="155" height="48" rx="24" style="fill: var(--kf-contrast-bg)"/><text x="78.5" y="38" text-anchor="middle" style="fill: var(--kf-contrast-ink); font: 600 22px var(--kf-font-sans)">Add name</text></svg>
      </div>
    </div>
    <nav class="pp-nav" data-slot="menu">
      <div class="pp-nav-btnwrap">
        <button class="pp-menu-btn" aria-expanded="false"><span class="text">${[..."menu"].map((c) => `<span class="letter">${c}</span>`).join("")}</span></button>
        <button class="pp-close-btn" aria-label="Close">${ICON.cross}<span class="text">Close</span></button>
      </div>
      <div class="pp-menu-plate"></div>
      <div class="pp-menu-panel"><div class="pp-menu-inner">
        <div class="pp-menu-links">
          <div class="pp-menu-link"><a href="index.html" data-sound="menuhome"${page === "index" ? ' class="is-current" aria-current="page"' : ""}>Work</a></div>
          <div class="pp-menu-link"><a href="about.html" data-sound="menuabout"${page === "about" ? ' class="is-current" aria-current="page"' : ""}>About</a></div>
          <div class="pp-menu-link"><a href="mailto:hello@example.com">Contact</a></div>
        </div>
        <div class="pp-menu-foot">
          <a class="pp-menu-mail" href="mailto:hello@example.com">hello@example.com</a>
          <div class="pp-menu-socials">${[0, 1, 2, 3].map((n) => `<a class="social-link" href="#social-${n + 1}" aria-label="Social ${n + 1}"><span class="social-link-inner">${ICON.social(n)}</span></a>`).join("")}</div>
        </div>
      </div></div>
    </nav>
    <div class="pp-overlay"></div>
    <div class="pp-reel" data-slot="showreel">
      <div class="pp-reel-card">
        <div class="wf-img" role="button" tabindex="0" aria-label="Open Reel" data-label="Showreel first scene · primary-color 3D graphics · 16:9"></div>
        <div class="pp-reel-marquee" aria-hidden="true">${[..."Showreel • 2025 • Showreel • 2025 • Showreel • 2025 • Showreel • 2025 • Showreel • 2025 • Showreel • 2025 • Showreel • 2025 • Showreel • 2025 • "].map((c, i) => `<span style="animation-delay:${(i * 0.12).toFixed(2)}s">${c === " " ? "&nbsp;" : c}</span>`).join("")}</div>
      </div>
    </div>
    <button class="pp-sound" data-slot="sound" aria-label="Toggle sound off and on"><span class="bg"></span>${ICON.on}${ICON.off}</button>`;
  // As in the original, fixed elements come before the body — so keyboard order and press order match the original
  (document.querySelector(".pp-page") ? document.querySelector(".pp-page").before(chrome) : document.body.append(chrome));

  const player = document.createElement("div");
  player.className = "pp-player";
  player.dataset.slot = "showreel-player";
  player.innerHTML = `
    <div class="pp-player-video wf-img wf-video" data-label="Showreel video · work montage · 16:9 · about 1 minute"></div>
    <div class="pp-controls"><div class="pp-controls-inner">
      <button class="pp-ctrl" data-ctrl="play" aria-label="Play"><span class="bg"></span>${ICON.play}</button>
      <button class="pp-ctrl" data-ctrl="mute" aria-label="Sound"><span class="bg"></span>${ICON.on.replace('class="on"', 'width="16" height="16"')}</button>
      <div class="pp-progress">${[1, 2, 3, 4].map((n) => `<div class="wf-img" data-label="Scene ${n}"></div>`).join("")}<span class="pp-progress-veil"></span></div>
    </div></div>
    <button class="pp-player-close" aria-label="Close">${ICON.cross}</button>`;
  document.body.append(player);
  const cursorTag = document.createElement("div");
  cursorTag.className = "pp-cursor-tag";
  cursorTag.textContent = "Close";
  document.body.append(cursorTag);

  // ── Logo ──
  // The original replays four faces (1·3·4·5) each time they are pressed
  const FACES = [1, 3, 4, 5];
  const face = mountFace(chrome.querySelector(".pp-face"), FACES[0]);
  let faceI = 0;
  chrome.querySelector(".pp-logo").addEventListener("click", () => {
    faceI = (faceI + 1) % FACES.length;
    face?.set(FACES[faceI]);
    audio.play("smiley");
  });

  // ── menu ──
  const nav = chrome.querySelector(".pp-nav");
  const menuBtn = nav.querySelector(".pp-menu-btn");
  const letters = [...menuBtn.querySelectorAll(".letter")];
  const links = [...nav.querySelectorAll(".pp-menu-link")];
  const overlay = chrome.querySelector(".pp-overlay");
  if (window.gsap && !reduce) {
    const tl = gsap.timeline({ paused: true });
    tl.to(letters, { rotation: () => gsap.utils.random(-15, 15), scale: () => gsap.utils.random(1.15, 1.4), fontWeight: 600, duration: 0.25, ease: "power2.out", stagger: 0.05 })
      .to(letters, { rotation: 0, scale: 1, fontWeight: 500, duration: 0.25, ease: "elastic.out(1, 0.8)", stagger: 0.05 });
    menuBtn.addEventListener("mouseenter", () => tl.restart());
  }
  if (window.gsap) gsap.set(links, { y: -20, x: 20, opacity: 0 });
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    overlay.classList.toggle("is-on", open);
    document.dispatchEvent(new CustomEvent("pp:menu", { detail: open }));
    if (!window.gsap) return;
    gsap.killTweensOf(links);
    if (reduce) return gsap.set(links, { y: 0, x: 0, opacity: open ? 1 : 0 });
    if (open) gsap.to(links, { y: 0, x: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: "power2.out", stagger: 0.1 });
    else gsap.to(links, { y: -20, x: 20, opacity: 0, duration: 0.2, ease: "power4.out", stagger: -0.05 });
  };
  menuBtn.addEventListener("click", () => { if (!nav.classList.contains("is-open")) { setMenu(true); audio.play("click"); } });
  nav.querySelector(".pp-close-btn").addEventListener("click", () => { setMenu(false); audio.play("close"); });
  overlay.addEventListener("click", () => setMenu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setMenu(false); closePlayer(); } });

  // ── Sound Button ──
  const soundBtn = chrome.querySelector(".pp-sound");
  const syncSound = () => { soundBtn.classList.toggle("is-muted", !store.sound); audio.mute(!store.sound); };
  syncSound();
  soundBtn.addEventListener("click", () => {
    store.sound = !store.sound;
    syncSound();
    if (store.sound) { audio.play("ambient"); audio.play("switch"); }
  });
  // When arriving via page navigation, background music replays after the first gesture (autoplay is blocked)
  if (store.entered && store.sound) addEventListener("pointerdown", () => audio.play("ambient"), { once: true });

  // ── Showreel playback veil + close tag ──
  const openPlayer = () => {
    player.classList.add("is-open");
    if (store.sound) audio.volume(0);
    window.ppLenis?.stop();
  };
  function closePlayer() {
    if (!player.classList.contains("is-open")) return;
    player.classList.remove("is-open");
    cursorTag.classList.remove("is-on");
    setTimeout(() => audio.volume(1), 500);
    window.ppLenis?.start();
  }
  const reelCard = chrome.querySelector(".pp-reel-card .wf-img");
  reelCard.addEventListener("click", openPlayer);
  reelCard.addEventListener("keydown", (e) => { if (e.key === "Enter") openPlayer(); });
  player.addEventListener("click", (e) => { if (!e.target.closest(".pp-controls")) closePlayer(); });
  player.addEventListener("mousemove", (e) => {
    const onCtrl = !!e.target.closest(".pp-controls");
    cursorTag.classList.toggle("is-on", !onCtrl);
    cursorTag.style.left = `${e.clientX}px`;
    cursorTag.style.top = `${e.clientY}px`;
  });
  player.addEventListener("mouseleave", () => cursorTag.classList.remove("is-on"));
  player.querySelector('[data-ctrl="play"]').addEventListener("click", (e) => e.currentTarget.classList.toggle("is-on"));

  // ── Page transition: original Vue ”fade” out-in .35s — fades out when leaving, then the next page appears ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a) return;
    if (a.dataset.sound) audio.play(a.dataset.sound);
    const href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href) || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (href === `${page}.html`) { setMenu(false); return; }
    setMenu(false);
    sessionStorage.setItem("pp-nav", "1");
    root.classList.add("pp-leaving");
    window.ppLenis?.stop();
    setTimeout(() => { location.href = href; }, reduce ? 0 : 350);
  });
  if (root.classList.contains("pp-entering")) {
    sessionStorage.removeItem("pp-nav");
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("pp-entering")));
  }
  addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("pp-leaving"); });

  // ── Smooth scroll: original Lenis 1.3.15 — duration 1.2 · wheelMultiplier .8 · expo curve ──
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), wheelMultiplier: 0.8, gestureOrientation: "vertical", autoRaf: false });
    window.ppLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function colorOf(name) {
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  }

  window.pp = { audio, store, rgbOf, colorOf, mountFace, setMenu, chrome, finePointer, reduce, lot: { K, A, tr, group, ellipse, fill, stroke, path, layer, faceShapes } };
})();
