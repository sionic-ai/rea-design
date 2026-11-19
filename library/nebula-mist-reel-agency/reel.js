// Showreel — rebuilds the original’s four video devices with the same values (the video is our placeholder clip at the same ratio).
// · Preview (original ShowreelHoverPreview, Hero on desktop and tablet): our shader blends a colorful video A with a showreel video B — it melts along a noise edge as if burning away,
//    (edge .18 · blend .7), flow warp · pull toward cursor exp(−4d)×.12 · color split · hue rotation are strongest mid-blend (still .22 left at blend 1).
//    Hovering the play button morphs the mix to .92 with power2.out (power2.in on release), following .18 per frame. Pressing triggers an explosion — rise power3.out · fall power3.in,
//    intensity ×amp · horizontal scanline tearing. When scrolling enlarges the video, the main feature is revealed through the same noise boundary (the 4.5s~63s range, silent).
//  · Menu panel preview (original VideoPreview): a dot-pattern-covered video and a play button.
//  · Showreel window (original VideoPlayerModal): the wrapper fills the screen with Flip (1s power3.inOut) and plays the main feature with video.js — time digits roll · progress bar · end screen.
//  · Phone hero (original HeroMobile): the full-bleed main film loops silently, and on tap it turns the sound on from the start — the pill below shrinks into a 42px close circle.
(() => {
  const PS = window.PS;
  if (!PS || !window.gsap) return;
  const { split, reduce, isPhone, SCR_UP, PLAY, loader } = PS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const VJS = "../_vendor/video.js@8.23.4/";
  const REEL = "reel.mp4";
  const TIME_CH = "0123456789!@#$%^&*()-_=+[]{};:<>/?,.";
  const END_CH = "!<>-_\\/[]{}=+*^?#01";
  const CLOSE_CH = "!@#$%^&*()-_=+[]{};:<>/?";
  const TITLE = "Have a project in mind?";
  const PAUSE = `<svg class="icon-pause" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true"><path d="M1 0h3v14H1zM8 0h3v14H8z"/></svg>`;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  // An empty group becomes an empty object so gsap doesn’t warn about no targets (the Hero preview has no crosses)
  const ghost = document.createElement("i");
  const some = (a) => (a.length ? a : ghost);
  if (window.Flip) gsap.registerPlugin(window.Flip);

  // video.js — as in the original, load and attach on first click or key press (or when the window opens)
  let vjsP = null;
  function videojsReady() {
    if (vjsP) return vjsP;
    window.VIDEOJS_NO_DYNAMIC_STYLE = true;
    vjsP = new Promise((res) => {
      if (window.videojs) return res(window.videojs);
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = VJS + "video-js.min.css";
      document.head.prepend(l);
      const s = document.createElement("script");
      s.src = VJS + "video.min.js";
      s.onload = () => res(window.videojs);
      s.onerror = () => res(null);
      document.head.append(s);
    });
    return vjsP;
  }

  // ───────── Showreel window ─────────
  const modal = document.createElement("div");
  modal.id = "video-player-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Showreel");
  modal.innerHTML = `
    <div class="modal__player">
      <video class="video-js player__main_video" preload="auto" playsinline data-label="Reel main cut · 1 min 7 sec · 16:9 · with sound"></video>
      <div class="player__end" inert>
        <p class="player__end_title ps-h2" data-label="One English question for the end screen here">${TITLE}</p>
        <div class="player__end_actions">
          <span class="player__end_btn"><a class="ps-btn ps-btn--solid ps-btn--lg" href="#" data-end="start">Start a project</a></span>
          <span class="player__end_btn"><button class="ps-btn ps-btn--outline" type="button" data-end="again">Watch again</button></span>
        </div>
      </div>
      <div class="player__controls">
        <button class="control-button paused" type="button" aria-label="Play Reel">${PLAY.replace("<svg", '<svg class="icon-play"')}${PAUSE}</button>
        <button class="ps-reel-sound" type="button" aria-label="Sound Off">${"<span></span>".repeat(6)}</button>
        <div class="play-time-text ps-sub-sm" aria-hidden="true">${["0", "0", ":", "0", "0"].map((c) => `<div class="char-center">${c}</div>`).join("")}</div>
        <div class="progress-bar" role="slider" tabindex="0" aria-label="Playback Slot" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-hover-line"></div><div class="progress-line"><div class="progress-fill"></div></div></div>
      </div>
    </div>`;
  document.body.append(modal);
  const player = $(".modal__player", modal), vidEl = $("video", modal), endEl = $(".player__end", modal), endTitle = $(".player__end_title", modal);
  const controls = $(".player__controls", modal), ctrlBtn = $(".control-button", modal), soundBtn = $(".ps-reel-sound", modal);
  const timeEl = $(".play-time-text", modal), timeChars = $$(".char-center", timeEl), bar = $(".progress-bar", modal), fill = $(".progress-fill", modal), hoverLine = $(".progress-hover-line", modal);
  const ctrlBtns = [ctrlBtn, soundBtn];
  const soundSet = PS.soundLines(soundBtn);
  let vjs = null, isOpen = false, playing = false, ended = false, muted = false, cur = null, endTl = null;

  function ensurePlayer() {
    return videojsReady().then((v) => {
      if (vjs) return;
      if (!v) { if (!vidEl.getAttribute("src")) vidEl.src = REEL; return; }
      vjs = v(vidEl, { controls: false, preload: "auto" });
      vjs.ready(() => vjs.volume(0.4));
      vjs.src({ src: REEL, type: "video/mp4" });
    });
  }
  ["pointerdown", "keydown"].forEach((t) => addEventListener(t, () => ensurePlayer(), { once: true, passive: true }));
  const media = () => vidEl;
  const play = () => { const p = media().play(); p && p.catch && p.catch(() => { media().muted = true; media().play().catch(() => {}); }); };
  function setPlaying(v) {
    playing = v;
    ctrlBtn.classList.toggle("played", v);
    ctrlBtn.classList.toggle("paused", !v);
    ctrlBtn.setAttribute("aria-label", v ? "Pause Reel" : "Play Reel");
    v ? play() : media().pause();
  }
  function sync() {
    const m = media(), t = m.currentTime || 0, d = m.duration || 0, p = d > 0 ? (t / d) * 100 : 0;
    fill.style.width = `${p}%`;
    bar.setAttribute("aria-valuenow", String(Math.round(p)));
    if (gsap.isTweening(timeChars[0])) return;
    const mm = String(Math.floor(t / 60)).padStart(2, "0"), ss = String(Math.floor(t % 60)).padStart(2, "0");
    [mm[0], mm[1], ":", ss[0], ss[1]].forEach((c, i) => { if (timeChars[i].textContent !== c) timeChars[i].textContent = c; });
  }
  ["timeupdate", "loadedmetadata", "durationchange"].forEach((t) => vidEl.addEventListener(t, sync));
  vidEl.addEventListener("ended", () => { ended = true; playing = false; ctrlBtn.classList.replace("played", "paused"); endScreen(true); });
  vidEl.addEventListener("play", () => { if (ended) { ended = false; endScreen(false); } });
  vidEl.addEventListener("click", () => setPlaying(!playing));
  ctrlBtn.addEventListener("click", () => setPlaying(!playing));
  soundBtn.addEventListener("click", () => { muted = !muted; media().muted = muted; soundBtn.setAttribute("aria-label", muted ? "Sound On" : "Sound Off"); soundSet(muted); });
  bar.addEventListener("mousemove", (e) => { const r = bar.getBoundingClientRect(); hoverLine.style.width = `calc(${((e.clientX - r.left) / r.width) * 100}% - 3px)`; });
  bar.addEventListener("click", (e) => { const r = bar.getBoundingClientRect(), m = media(); if (m.duration) m.currentTime = m.duration * clamp01((e.clientX - r.left) / r.width); });

  // End screen — control buttons scale to 0 in .35s power3.in (gap .06), the progress line retracts to the right in .7s power3.inOut, the title rolls out over 1.1s and two buttons come in with .6s back.out(1.6) (gap .1)
  function endReset() {
    gsap.set(endEl, { autoAlpha: 0 });
    endTitle.textContent = TITLE;
    gsap.set([...ctrlBtns, timeEl, ...$$(".player__end_btn", endEl)], { clearProps: "transform,scale,opacity,visibility" });
    gsap.set(bar, { "--tl-start": "0%", "--tl-dot": 1 });
    controls.classList.remove("is-ended");
    controls.removeAttribute("inert");
    endEl.setAttribute("inert", "");
  }
  function endScreen(on) {
    endTl?.kill();
    const btns = $$(".player__end_btn", endEl);
    endTl = gsap.timeline();
    if (on) {
      controls.classList.add("is-ended");
      controls.setAttribute("inert", "");
      endEl.removeAttribute("inert");
      endTl.to(ctrlBtns, { scale: 0, duration: 0.35, ease: "power3.in", stagger: 0.06 }, 0)
        .to(timeEl, { autoAlpha: 0, duration: 0.25, ease: "none" }, 0.05)
        .fromTo(bar, { "--tl-start": "0%" }, { "--tl-start": "100%", duration: 0.7, ease: "power3.inOut" }, 0.05)
        .to(bar, { "--tl-dot": 0, duration: 0.3, ease: "power3.in" }, 0.75)
        .set(endEl, { autoAlpha: 1 }, 0.3)
        .fromTo(endTitle, { scrambleText: { text: "" } }, { duration: 1.1, ease: "none", scrambleText: { text: TITLE, chars: END_CH, revealDelay: 0.35, speed: 0.8, tweenLength: true } }, 0.35)
        .fromTo(btns, { scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.1 }, 0.75);
    } else {
      endEl.setAttribute("inert", "");
      endTl.to(btns, { scale: 0, duration: 0.3, ease: "power3.in", stagger: 0.05 }, 0)
        .to(endTitle, { duration: 0.4, ease: "none", scrambleText: { text: "", chars: END_CH, tweenLength: true } }, 0)
        .set(endEl, { autoAlpha: 0 }, 0.45)
        .fromTo(bar, { "--tl-start": "100%", "--tl-dot": 0 }, { "--tl-dot": 1, duration: 0.3, ease: "back.out(1.7)" }, 0.2)
        .to(bar, { "--tl-start": "0%", duration: 0.7, ease: "power3.inOut" }, 0.45)
        .fromTo(ctrlBtns, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(1.6)", stagger: 0.06 }, 0.3)
        .to(timeEl, { autoAlpha: 1, duration: 0.3, ease: "none" }, 0.4)
        .add(endReset);
    }
  }
  $('[data-end="again"]', modal).addEventListener("click", () => { media().currentTime = 0; ended = false; endScreen(false); setPlaying(true); });
  $('[data-end="start"]', modal).addEventListener("click", (e) => { e.preventDefault(); dismiss(0.7); });

  // The menu button becomes the window’s close button — Close rolls out for .8s after .9s (appear delay .25) and the two lines cross at 1.4x (original HeaderNavigationButton)
  const menuBtn = $(".ps-menu-btn"), label = menuBtn && $(".ps-close-label", menuBtn);
  function closeLabel(on) {
    if (!menuBtn) return;
    const lines = $$(".line", menuBtn), dots = $$(".dot", menuBtn);
    gsap.killTweensOf(label);
    if (on) {
      gsap.set(menuBtn, { mixBlendMode: "normal", zIndex: 111 });
      menuBtn.setAttribute("aria-label", "Close Reel");
      label.textContent = "";
      gsap.set(label, { autoAlpha: 1 });
      gsap.to(label, { duration: 0.8, delay: 0.9, ease: "none", scrambleText: { text: "Close", chars: CLOSE_CH, tweenLength: true, revealDelay: 0.25 } });
      gsap.to(lines, { scaleX: 1.4, duration: 0.3, ease: "power2.inOut" });
    } else {
      menuBtn.setAttribute("aria-label", PS.menuOpen?.() ? "Close Menu" : "Open Menu");
      gsap.to(label, { duration: 0.45, ease: "none", scrambleText: { text: "", chars: CLOSE_CH, tweenLength: true }, onComplete: () => gsap.set(label, { autoAlpha: 0 }) });
      if (!PS.menuOpen?.()) gsap.timeline().to(dots, { x: 0, y: 0, duration: 0.3, ease: "power2.inOut" }, 0).to(lines, { scaleX: 0, duration: 0.3, ease: "power2.inOut" }, 0);
    }
  }
  const stopScroll = () => window.psLenis?.stop();
  const startScroll = () => { if (!PS.menuOpen?.()) window.psLenis?.start(); };
  const busyNow = () => ["open-video-modal-timeline", "close-video-modal-timeline"].some((id) => gsap.getById(id)?.isActive());

  // Open (original onPlayerOpen) — button scales to 0 in .5s power3.inOut, cross erased in .5s (+.2), letters switch off at random, preview expands to full shape in 1s, wrapper Flip 1s,
  // Preview video wiped in .6s (+.3), window turns on in .4s and plays the main video from the start, control buttons .5s power3.out (+.35), time digits roll for 1.5s
  function open(d) {
    if (isOpen || busyNow()) return;
    cur = d;
    ensurePlayer();
    d.gl?.press();
    const tl = gsap.timeline({ id: "open-video-modal-timeline" })
      .add(() => d.video?.pause())
      .to(d.btn, { scale: 0, duration: 0.5, ease: "power3.inOut" })
      .to(some(d.plus), { autoAlpha: 0, duration: 0.5, ease: "power3.inOut" }, "<+=0.2")
      .to(d.chars, { opacity: 0, duration: 0.01, stagger: { amount: 0.25, from: "random" }, ease: "power3.inOut" }, "<")
      .set(d.preview, d.home ? {} : { clipPath: "none", borderRadius: "20px" }, "<+=0.1")
      .to(d.preview, d.home ? { scale: 1, x: 0, y: 0, clipPath: "inset(0% 0% round 20px)", duration: 1, ease: "power3.inOut" } : { scale: 1, borderRadius: 0, duration: 1, ease: "power3.inOut" }, "<")
      .add(() => {
        const st = window.Flip ? Flip.getState(d.wrapper) : null;
        modal.append(d.wrapper);
        if (st) Flip.from(st, { duration: 1, ease: "power3.inOut", absolute: true });
        isOpen = true;
        closeLabel(true);
      }, "<")
      .to(d.video, { opacity: 0, duration: 0.6, ease: "power3.inOut" }, "<+=0.3")
      .set(player, { display: "block" }, "-=0.2")
      .fromTo(player, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power3.inOut" }, "<")
      .add(() => { ended = false; endReset(); media().currentTime = 0; setPlaying(true); }, "<")
      .fromTo(ctrlBtns, { scale: 0 }, { scale: 1, duration: 0.5, ease: "power3.out" }, "<+=0.35")
      .to(timeChars, { duration: 1.5, scrambleText: { text: "{original}", chars: TIME_CH, tweenLength: false } }, "<")
      .fromTo(timeChars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { amount: 0.5, from: "random" } }, "<");
    return tl;
  }
  // Close (original onPlayerClose) — controls to 0x in .5s, window removed in .5s, preview video on in .6s (+.2), wrapper returns in place with Flip in .7s power3.out (+.1),
  // Cross .5s (+.2), text 2.3s roll, button .5s power3.inOut (+.25)
  function close() {
    if (!isOpen || busyNow()) return;
    const d = cur;
    media().pause();
    playing = false;
    isOpen = false;
    closeLabel(false);
    d.gl?.closed();
    const st = window.Flip ? Flip.getState(d.container) : null;
    gsap.timeline({ id: "close-video-modal-timeline" })
      .set(d.video, { opacity: 1 })
      .to(ctrlBtns, { scale: 0, duration: 0.5, ease: "power3.in" }, "close")
      .to(timeChars, { opacity: 0, duration: 0.01, stagger: { amount: 0.5, from: "random" } }, "close")
      .to(player, { opacity: 0, duration: 0.5 }, "close")
      .to(d.video, { opacity: 1, duration: 0.6, ease: "power3.inOut" }, "close+=0.2")
      .add(() => {
        const home = () => { d.container.append(d.wrapper); gsap.set(d.wrapper, { clearProps: "all" }); d.gl?.done(); d.onClosed?.(); };
        if (st) Flip.to(st, { targets: d.wrapper, duration: 0.7, ease: "power3.out", absolute: true, onComplete: home }); else home();
        d.video?.play().catch(() => {});
      }, "close+=0.1")
      .to(d.preview, d.home ? { duration: 0.7 } : { borderRadius: "20px", duration: 0.7, ease: "power3.out" }, "close+=0.1")
      .to(some(d.plus), { autoAlpha: 1, duration: 0.5, ease: "power3.inOut" }, "<+=0.2")
      .to(d.chars, { duration: 2.3, scrambleText: { text: "{original}", chars: SCR_UP, tweenLength: false } }, "<")
      .to(d.chars, { opacity: 1, duration: 0.01, stagger: { amount: 0.9, from: "random" } }, "<")
      .to(d.btn, { scale: 1, duration: 0.5, ease: "power3.inOut" }, "<+=0.25")
      .set(player, { display: "none" }, "<")
      .add(startScroll, "<");
  }
  // Dismiss (original onPlayerDismiss) — end screen ”Get started”: the window vanishes in .7s power2.inOut and the wrapper stays in place right away
  function dismiss(dur = 0.6) {
    if (!isOpen) return;
    const d = cur;
    media().pause();
    playing = false;
    isOpen = false;
    gsap.timeline({ id: "dismiss-video-modal-timeline" }).to(player, { autoAlpha: 0, duration: dur, ease: "power2.inOut" }).add(() => {
      gsap.set(player, { display: "none", clearProps: "opacity,visibility" });
      d.container.append(d.wrapper);
      gsap.set(d.wrapper, { clearProps: "all" });
      gsap.set([d.btn, ...d.plus, ...d.chars, d.video], { clearProps: "opacity,visibility,transform,scale" });
      if (!d.home) gsap.set(d.preview, { borderRadius: "20px" });
      d.gl?.closed(); d.gl?.done(); d.onClosed?.();
      closeLabel(false);
      startScroll();
    });
  }
  addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen && !gsap.getById("open-video-modal-timeline")?.isActive()) close(); });

  // Preview bundle — container, wrapper, preview, video, button, cross, text
  function describe(container, extra = {}) {
    const wrapper = $(".player__wrapper", container);
    const ctl = $(".ps-nav__vctl, .player__ctl", wrapper);
    return {
      container, wrapper,
      preview: $(".player__preview", wrapper),
      video: $(".player__preview_video", wrapper),
      btn: $(".play-btn", wrapper),
      plus: $$(".plus", ctl),
      chars: $$(".ps-scr, .player__txt", ctl).flatMap((el) => split(el)),
      ...extra,
    };
  }

  // ───────── Shader preview (original ShowreelHoverPreview) ─────────
  const VERT = `
    uniform vec2 uBox; uniform vec2 uResA; uniform vec2 uResC;
    varying vec2 vA; varying vec2 vC;
    // Crop the video to fill the box (object-fit: cover)
    vec2 cover(vec2 p, vec2 tex){ float rb = uBox.x / uBox.y, rt = tex.x / tex.y; vec2 s = rb > rt ? vec2(1.0, rt / rb) : vec2(rb / rt, 1.0); return (p - 0.5) * s + 0.5; }
    void main(){ vA = cover(uv, uResA); vC = cover(uv, uResC); gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const FRAG = `
    precision highp float;
    uniform sampler2D uA; uniform sampler2D uB; uniform sampler2D uC;
    uniform float uTime; uniform float uMix; uniform vec2 uMouse; uniform float uNoise; uniform float uDisp; uniform float uAber; uniform float uHue;
    uniform float uPulse; uniform float uAmp; uniform float uScan; uniform float uReveal; uniform vec3 uRim;
    varying vec2 vA; varying vec2 vC;
    float rnd(vec2 p){ return fract(sin(dot(p, vec2(41.37, 289.11))) * 45758.5453); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
      return mix(mix(rnd(i), rnd(i + vec2(1.0, 0.0)), u.x), mix(rnd(i + vec2(0.0, 1.0)), rnd(i + vec2(1.0, 1.0)), u.x), u.y); }
    float fb(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * vn(p); p = p * 2.0 + vec2(3.1, 1.7); a *= 0.5; } return s; }
    // Hue rotation — only the angle rotates in the YIQ plane
    vec3 spin(vec3 c, float a){
      vec3 y = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312) * c;
      float h = atan(y.z, y.y) + a, k = length(y.yz);
      return mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703) * vec3(y.x, k * cos(h), k * sin(h));
    }
    vec3 split3(sampler2D t, vec2 p, vec2 o){ return vec3(texture2D(t, p + o).r, texture2D(t, p).g, texture2D(t, p - o).b); }
    void main(){
      float m = clamp(uMix, 0.0, 1.0);
      float swell = sin(m * 3.14159265);
      float fx = max(swell, m * 0.22) + uPulse * uAmp;
      float t = uTime;
      vec2 p = vA * uNoise;
      vec2 w1 = vec2(fb(p + vec2(0.15, 0.10) * t), fb(p + vec2(-0.12, 0.18) * t + 5.0));
      vec2 w2 = vec2(fb(p + 4.0 * w1 + vec2(0.2 * t, 0.0)), fb(p + 4.0 * w1 + vec2(0.0, 0.25 * t) + 8.0));
      vec2 flow = (w2 - 0.5) * uDisp * fx;
      vec2 d = vA - uMouse; float dl = length(d);
      vec2 pull = d / max(dl, 1e-4) * exp(-4.0 * dl) * fx * 0.12;
      vec2 tear = vec2(sin(vA.y * 90.0 + t * 18.0) * uPulse * uScan, 0.0);
      vec2 ab = (vA - 0.5) * uAber * fx;
      vec3 a = spin(split3(uA, vA + flow + pull + tear, ab), fx * uHue);
      vec3 b = spin(split3(uB, vA + flow * 0.6 - pull * 0.3 + tear * 0.6, ab * 0.7), -fx * uHue * 0.6);
      // Uses the noise value as a threshold so the blend burns away in one pass (edge .18), mixing in .3 of a full crossfade
      float lo = max(w2.x - 0.18, 0.0), hi = min(w2.x + 0.18, 1.0);
      float burn = smoothstep(lo, hi, m);
      vec3 col = mix(a, b, mix(m, burn, 0.7));
      col += swell * 0.18 * uRim * smoothstep(0.4, 0.5, burn) * (1.0 - smoothstep(0.5, 0.6, burn));
      if (uReveal > 0.001) col = mix(col, texture2D(uC, vC).rgb, mix(uReveal, smoothstep(lo, hi, uReveal), 0.7));
      gl_FragColor = vec4(col, 1.0);
    }`;
  function glPreview(d, o) {
    const THREE = window.THREE;
    const box = d.preview, vA = d.video, vB = $(".player__preview_video--hidden", box), cv = $(".player__preview_canvas", box);
    if (!THREE || !vA || !vB || !cv) return null;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, premultipliedAlpha: false }); } catch (e) { return null; }
    const tex = (v) => { const t = new THREE.VideoTexture(v); t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace; return t; };
    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
    blank.needsUpdate = true;
    const U = {
      uA: { value: tex(vA) }, uB: { value: tex(vB) }, uC: { value: blank },
      uBox: { value: new THREE.Vector2(16, 9) }, uResA: { value: new THREE.Vector2(16, 9) }, uResC: { value: new THREE.Vector2(16, 9) },
      uTime: { value: 0 }, uMix: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uNoise: { value: o.noise }, uDisp: { value: o.disp }, uAber: { value: o.aber }, uHue: { value: o.hue },
      uPulse: { value: 0 }, uAmp: { value: o.amp }, uScan: { value: o.scan }, uReveal: { value: 0 }, uRim: { value: new THREE.Vector3(...PS.cssColor("--kf-accent-soft")) },
    };
    const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, depthTest: false })));
    renderer.compile(scene, cam);
    const S = { mix: { v: 0 }, cur: 0, m: [0.5, 0.5], to: [0.5, 0.5], pulse: { v: 0 }, gate: { v: 1 }, reveal: 0, rv: 0, hover: false, opening: false, closing: false, seen: true };
    // Pixel count cap 1920×1080 — even on large screens the pixel ratio never exceeds 2x
    const size = () => {
      const w = box.clientWidth, h = box.clientHeight;
      if (!w || !h || S.opening) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2, Math.sqrt(2073600 / (w * h))));
      renderer.setSize(w, h, false);
      U.uBox.value.set(w, h);
    };
    size();
    new ResizeObserver(size).observe(box);
    new IntersectionObserver(([e]) => { S.seen = e.isIntersecting; }, { rootMargin: "300px 0px" }).observe(box);
    // Main reveal (original reveal) — plays first or receives the main piece after 4s and runs silently only in the 4.5s~63s range
    let vC = null;
    const arm = () => {
      if (vC) return;
      vC = document.createElement("video");
      Object.assign(vC, { muted: true, loop: true, playsInline: true, preload: "auto", src: REEL });
      vC.className = "player__preview_video player__preview_video--hidden";
      vC.dataset.label = "Showreel main cut revealed by scroll · 4.5s–63s segment · no sound";
      box.append(vC);
      vC.addEventListener("timeupdate", () => { if (vC.currentTime < 4.2 || vC.currentTime >= 63) vC.currentTime = 4.5; });
      U.uC.value = tex(vC);
    };
    addEventListener("scroll", arm, { once: true, passive: true });
    setTimeout(arm, 4000);
    const live = () => S.hover || S.opening || S.closing || isOpen && cur === d || S.cur > 0.002;
    const tick = () => {
      if (!S.seen && !S.opening && !(isOpen && cur === d)) return;
      if (vA.videoWidth) U.uResA.value.set(vA.videoWidth, vA.videoHeight);
      // Showreel B only runs while blending
      if (live()) { if (vB.paused) vB.play().catch(() => {}); } else if (!vB.paused && vB.readyState >= 2) vB.pause();
      let want = 0;
      if (vC) {
        const on = S.reveal > 0.01 && (!S.opening || S.closing) && (S.seen || isOpen);
        if (on && vC.paused) vC.play().catch(() => {}); else if (!on && !vC.paused) vC.pause();
        if (vC.videoWidth) U.uResC.value.set(vC.videoWidth, vC.videoHeight);
        if (vC.readyState >= 2 && vC.currentTime >= 4.5 - 0.35 && !S.opening) want = clamp01(S.reveal) * S.gate.v;
      }
      S.rv += (want - S.rv) * 0.18;
      S.cur += (S.mix.v - S.cur) * 0.18;
      S.m[0] += (S.to[0] - S.m[0]) * 0.12;
      S.m[1] += (S.to[1] - S.m[1]) * 0.12;
      U.uMix.value = S.cur;
      U.uReveal.value = S.rv;
      U.uMouse.value.set(S.m[0], S.m[1]);
      U.uTime.value += 0.012;
      U.uPulse.value = S.pulse.v;
      renderer.render(scene, cam);
    };
    gsap.ticker.add(tick);
    const scaleTo = (on) => { if (o.hoverScale !== 1 && !S.opening) gsap.to(d.container, { scale: on ? o.hoverScale : 1, duration: on ? 0.6 : 0.5, ease: "power3.out", overwrite: "auto" }); };
    return {
      hoverStart() { S.hover = true; scaleTo(true); gsap.to(S.mix, { v: 0.92, duration: o.morph, ease: "power2.out", overwrite: true }); },
      hoverEnd() { S.hover = false; if (S.opening) return; scaleTo(false); gsap.to(S.mix, { v: 0, duration: o.morph, ease: "power2.in", overwrite: true }); },
      move(e) { const r = box.getBoundingClientRect(); S.to = [clamp01((e.clientX - r.left) / r.width), clamp01(1 - (e.clientY - r.top) / r.height)]; },
      // Press — stops the blend at .92 and bursts, and reel B takes over the screen
      press() {
        S.opening = true;
        gsap.killTweensOf(S.mix);
        S.mix.v = 0.92;
        gsap.killTweensOf(S.pulse);
        S.pulse.v = 0;
        gsap.timeline().to(S.pulse, { v: 1, duration: o.rise, ease: "power3.out" }).to(S.pulse, { v: 0, duration: o.fall, ease: "power3.in" });
        gsap.set(d.container, { scale: 1 });
        vB.classList.add("player__preview_video--takeover");
        vA.style.opacity = "0";
      },
      closed() { vB.classList.remove("player__preview_video--takeover"); vA.style.opacity = ""; S.closing = true; gsap.killTweensOf(S.gate); S.gate.v = 0; gsap.to(S.mix, { v: 0, duration: 0.7, ease: "power3.out", overwrite: true }); },
      done() { S.opening = false; S.closing = false; size(); gsap.to(S.gate, { v: 1, duration: 5, delay: 0.6, ease: "sine.inOut", overwrite: true }); },
      reveal(v) { S.reveal = v; },
      pulse() { gsap.killTweensOf(S.pulse); gsap.timeline().to(S.pulse, { v: 1, duration: o.rise, ease: "power3.out" }).to(S.pulse, { v: 0, duration: o.fall, ease: "power3.in" }); },
    };
  }

  // ───────── Phone hero (original HeroMobile) ─────────
  // Play: the pill below changes — logo · name erased in .5s (gap .1), button width 42 · radius 21 in .8s power4.inOut, icon 45°, play button scales to 0 in .5s, text off (+.1), dot pattern erased in 1s (+.2).
  // Close (rolling down over 20% of the screen or pressing the video again): reverse — button width 100% · radius 16, logo·name .5s (+.5, from the end), dot pattern 1s (+.2), play button .5s (+.7), text rolls 2.3s (+.4)
  function mobileHero(d, handler) {
    const vid = $(".hero-mobile__video", d.preview), overlay = $(".player__preview_overlay", d.preview);
    const mnav = $(".ps-mnav");
    const pill = document.createElement("div");
    pill.className = "ps-mreel";
    pill.innerHTML = `<span class="ps-mreel__logo">${$(".ps-mnav__logo")?.innerHTML || ""}</span><span class="ps-mreel__text">Studio®</span><button class="ps-mreel__btn" type="button" aria-label="Close Reel"><svg class="ps-mreel__icon" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M7 1v12M1 7h12"/></svg></button>`;
    document.body.append(pill);
    const btn = $(".ps-mreel__btn", pill), icon = $(".ps-mreel__icon", pill), fade = [$(".ps-mreel__logo", pill), $(".ps-mreel__text", pill)];
    let api = null, on = false, tl = null;
    vid.src = REEL;
    if (!reduce) vid.play().catch(() => {});
    videojsReady().then((v) => { if (!v) return; api = v(vid, { controls: false, autoplay: reduce ? false : "muted", muted: true, loop: true }); });
    const busy = () => tl?.isActive();
    const start = () => {
      if (on || busy()) return;
      on = true;
      vid.paused || (vid.currentTime = 0);
      vid.muted = false;
      vid.volume = 0.4;
      vid.play().catch(() => { vid.muted = true; vid.play().catch(() => {}); });
      tl = gsap.timeline().set(mnav, { display: "none" }).set(pill, { display: "flex" })
        .to(fade, { opacity: 0, duration: 0.5, stagger: 0.1 })
        .to(btn, { width: 42, borderRadius: 21, duration: 0.8, ease: "power4.inOut" }, "<")
        .to(icon, { rotate: 45, duration: 0.8, ease: "power4.inOut" }, "<")
        .to(d.btn, { scale: 0, duration: 0.5, ease: "power4.inOut" }, "<")
        .to(d.chars, { opacity: 0, duration: 0.01, stagger: { amount: 0.25, from: "random" }, ease: "power3.inOut" }, "<+=0.1")
        .to(overlay, { opacity: 0, duration: 1, ease: "power3.inOut" }, "<+=0.2")
        .add(() => gsap.set(d.btn.parentElement, { pointerEvents: "none" }), "<+=0.5");
    };
    const stop = () => {
      if (!on || busy()) return;
      on = false;
      tl = gsap.timeline().to(btn, { width: "100%", borderRadius: 16, duration: 0.8, ease: "power4.inOut" }, "start")
        .to(icon, { rotate: 0, duration: 0.8, ease: "power4.inOut" }, "start")
        .to(fade, { opacity: 1, duration: 0.5, stagger: { each: 0.1, from: "end" } }, "start+=0.5")
        .set(mnav, { clearProps: "display" }).set(pill, { display: "none" })
        .add(() => { vid.pause(); vid.muted = true; }, "start")
        .to(overlay, { opacity: 1, duration: 1, ease: "power3.inOut" }, "start+=0.2")
        .to(d.btn, { scale: 1, duration: 0.5 }, "start+=0.7")
        .to(d.chars, { duration: 2.3, scrambleText: { text: "{original}", chars: SCR_UP, tweenLength: false } }, "start+=0.4")
        .fromTo(d.chars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: { amount: 0.9, from: "random" } }, "start+=0.4")
        .add(() => gsap.set(d.btn.parentElement, { clearProps: "pointerEvents" }));
    };
    handler.addEventListener("click", () => (on ? stop() : start()));
    btn.addEventListener("click", stop);
    addEventListener("scroll", () => { if (on && scrollY > innerHeight * 0.2) stop(); }, { passive: true });
    // Rests when off screen, then resumes silently when it returns
    new IntersectionObserver(([e]) => { if (on) return; e.isIntersecting ? vid.play().catch(() => {}) : vid.pause(); }).observe(d.preview);
    return { api: () => api };
  }

  // ───────── Menu panel preview ─────────
  const menuBox = $(".ps-nav__video .player__container");
  if (menuBox) {
    const d = describe(menuBox);
    d.btn.addEventListener("click", () => open(d));
  }

  PS.reel = {
    isOpen: () => isOpen,
    isBusy: busyNow,
    open, close, dismiss, describe, glPreview, mobileHero, ensurePlayer,
    // The loader waits until the hero preview video is downloaded (original registerWithLoader, max 4s)
    waitFor: (v) => loader.waitFor(new Promise((r) => (v.readyState >= 2 ? r() : v.addEventListener("loadeddata", r, { once: true })))),
  };
})();
