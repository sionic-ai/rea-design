// The intro flow: loader → warning sign → character holding a sign → welcome text → sound prompt (iris), and
// Handles the band transition covering scenes, the board color that changes every 20 seconds, and the modal. The game (index.js) picks up via window.AR.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = matchMedia("(max-width: 767px)").matches || "ontouchstart" in window;
  const AR = (window.AR = { reduce, isTouch, onSoundConfirmed: null, lines: null });

  const show = (el) => { el.hidden = false; };
  const hide = (el) => { el.hidden = true; };

  // Original order: first-time visitors watch all three intros, returning visitors go straight to the sound prompt
  const SEEN = "ar-intro-seen";

  // ── Stripe transition: 200 tilted-slab color stripes sweep across between scenes (_fx/stripe-sweep). The scene swaps at midway, once fully covered ──
  const view = $(".ar-view");
  const rand = (a, b) => Math.random() * (b - a) + a;
  AR.lines = (midway) => view.dispatchEvent(new CustomEvent("fx:sweep", { detail: { midway } }));

  // ── Plate colors: three plates per original stage (stageIndex). A first-time visitor is stage0 and moves to the next plate every 20 seconds — first plate fixed, the rest shuffled.
  // Panel color values are held by body[data-theme] in shared.css ──
  const STAGES = [["green", "crimson", "blue"], ["purple", "pink", "emerald"], ["amber", "teal", "red"], ["gold", "azure", "magenta"], ["tangerine", "coral", "saffron"]];
  const stage = STAGES[AR.stage ?? 0];
  const order = [stage[0], ...stage.slice(1).sort(() => Math.random() - .5)];
  let themeIdx = 0;
  AR.setTheme = (name) => {
    document.body.dataset.theme = name;
    dispatchEvent(new CustomEvent("ar:theme", { detail: name }));
  };
  AR.startThemeCycle = () => {
    if (AR.themeTimer) return;
    AR.themeTimer = setInterval(() => {
      themeIdx = (themeIdx + 1) % order.length;
      AR.setTheme(order[themeIdx]);
    }, 20000);
  };

  // ── Text flicker: a few letters in warning copy and sign titles briefly turn into symbols and back ──
  const GLYPHS = "!?#%&*:;/<>";
  const flicker = (el) => {
    const text = el.textContent;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const chars = [...text];
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const k = Math.floor(Math.random() * chars.length);
        if (chars[k].trim()) chars[k] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = chars.join("");
      setTimeout(() => { el.textContent = text; }, 70);
      setTimeout(tick, rand(300, 900));
    };
    setTimeout(tick, rand(200, 600));
    return () => { alive = false; el.textContent = text; };
  };

  // ── Loader ─────────────────────────────
  const pre = $(".ar-pre");
  const grid = $(".ar-pre__grid");
  const content = $(".ar-pre__content");
  const title = $(".ar-pre__title");
  const cells = [];
  {
    const area = isTouch ? 100 : 200;
    const w = innerWidth, h = innerHeight;
    const size = Math.round(Math.sqrt((w * h) / area));
    const cols = Math.ceil(w / size), rows = Math.ceil(h / size);
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
    let max = 0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const el = document.createElement("div");
      el.className = "ar-pre__cell";
      grid.append(el);
      const dx = (c - cx) / (cols / 2), dy = (r - cy) / (rows / 2);
      const d = Math.sqrt(dx * dx + dy * dy);
      max = Math.max(max, d);
      cells.push({ el, d });
    }
    // Farther from center means later, cubed, so the edges bunch up and go out at once
    cells.forEach((c) => { c.norm = Math.pow(c.d / max, 3); });
  }
  let shown = 0;
  const reveal = ({ percent, delay, final = false }) => {
    const from = shown / 100, to = percent / 100;
    const tl = gsap.timeline({ onComplete: () => final && closeLoader() });
    cells.forEach((c) => {
      if (final || (c.norm >= from && c.norm <= to)) tl.to(c.el, { opacity: 0, duration: .3, ease: "expo.out", delay: c.norm * delay, overwrite: true }, 0);
    });
    shown = percent;
  };
  const closeLoader = () => {
    // The cells rise again from below to cover the screen in black, then the whole loader lifts away
    const tl = gsap.timeline({ onComplete: () => {
      gsap.to(pre, { opacity: 0, duration: .45, delay: .1, ease: "power1.inOut", onComplete: () => { hide(pre); startIntro(); } });
    } });
    cells.forEach((c) => {
      tl.set(c.el, { scaleY: 0, scaleX: 1.1, y: 1, opacity: 1 }, 0);
      tl.to(c.el, { scaleY: 1.1, duration: .5, ease: "power3.out", delay: .4 * Math.random() }, 0);
    });
  };
  const loading = (p) => {
    gsap.to(title, { backgroundPositionX: 100 - p + "%", duration: 1.5, ease: "power1.out", overwrite: true });
    if (p >= 100) reveal({ percent: 100, delay: 1.5, final: true });
  };
  // It is a placeholder with no actual file to download, so raise the progress imitating the original download speed (about 6 seconds)
  const fakeLoad = () => {
    let p = 0;
    const step = () => {
      p = Math.min(100, p + rand(8, 22));
      loading(p);
      if (p < 100) setTimeout(step, rand(380, 800));
    };
    setTimeout(step, 400);
  };

  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]) : Promise.resolve();

  // ── Three intros ─────────────────────────
  const intro = $(".ar-intro");
  const warn = $(".ar-warn");
  const made = $(".ar-made");
  const welcome = $(".ar-welcome");
  const sound = $(".ar-sound");

  const onceAdvance = (el, ms, next) => {
    let done = false, timer;
    const go = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      removeEventListener("keydown", key);
      el.removeEventListener("click", go);
      next();
    };
    const key = (e) => { if (e.code === "Enter" || e.code === "Escape") go(); };
    timer = setTimeout(go, ms);
    addEventListener("keydown", key);
    el.addEventListener("click", go);
  };

  const fadeOut = (el, cb) => gsap.to(el, { opacity: 0, duration: .5, ease: "power1.inOut", onComplete: () => { hide(el); gsap.set(el, { opacity: 1 }); cb?.(); } });

  function startIntro() {
    if (reduce || location.hash) { finishIntro(true); return; }
    if (localStorage.getItem(SEEN)) { show(intro); hide(warn); showSound(); return; }
    localStorage.setItem(SEEN, "1");
    show(intro);
    gsap.fromTo(warn, { scale: 1 }, { scale: innerWidth > 992 ? 1.1 : 1.25, duration: 10, ease: "power1.out" });
    const stops = $$("[data-flicker]", warn).map(flicker);
    onceAdvance(warn, 6000, () => {
      stops.forEach((s) => s());
      show(made);
      fadeOut(warn, showMade);
    });
  }
  function showMade() {
    gsap.fromTo(made, { scale: 1 }, { scale: innerWidth > 992 ? 1.1 : 1.25, duration: 10, ease: "power1.out" });
    const stop = flicker($(".ar-made__title"));
    onceAdvance(made, 6000, () => { stop(); showWelcome(); });
  }
  function showWelcome() {
    show(welcome);
    gsap.fromTo(welcome, { opacity: 0 }, { opacity: 1, duration: .25 });
    hide(made);
    $$(".ar-welcome__line", welcome).forEach((line) => {
      line.innerHTML = "";
      [...line.dataset.word].forEach((ch) => {
        const s = document.createElement("span");
        s.className = "ar-welcome__letter";
        s.textContent = ch === " " ? " " : ch;
        s.style.animationDelay = (.2 + 1.1 * Math.random()).toFixed(2) + "s";
        line.append(s);
      });
    });
    const title = $(".ar-welcome__title");
    gsap.fromTo(title, { scale: 1 }, { scale: innerWidth > 992 ? 1.18 : 1.4, duration: 10, ease: "power1.out" });
    onceAdvance(welcome, 3000, () => {
      welcome.classList.add("is-exiting");
      setTimeout(showSound, 650);
    });
  }

  // ── Mute sound ─────────────────────────
  const rollTitle = (el, text, startIndex) => {
    el.innerHTML = "";
    const row = document.createElement("span");
    row.className = "ar-roll";
    const chars = [...text].map((ch) => {
      const c = document.createElement("span");
      c.className = "ar-roll__char";
      const g = ch === " " ? "\u00a0" : ch;
      c.innerHTML = `<span class="is-1">${g}</span><span class="is-2">${g}</span><span class="is-3">${g}</span>`;
      row.append(c);
      return c;
    });
    el.append(row);
    // One letter at a time (startIndex first, random after) the filled letter rises at a slant and the outline letter comes in, then after 2 seconds back to the filled letter
    let pool = [];
    const pick = () => {
      if (!pool.length) pool = chars.map((_, i) => i);
      const k = pool.length === chars.length && Number.isFinite(startIndex) ? pool.indexOf(startIndex) : Math.floor(Math.random() * pool.length);
      return pool.splice(k, 1)[0];
    };
    let alive = true;
    const D = 15, dur = .8, ease = "expo.out";
    const step = (first) => {
      if (!alive) return;
      const [a, b, c] = chars[pick()].children;
      const tl = gsap.timeline();
      if (first) {
        tl.set(a, { xPercent: D, yPercent: -100 }).set(b, { xPercent: 0, yPercent: -100, onComplete: () => step(false) });
      } else {
        tl.to(a, { xPercent: D, yPercent: -100, duration: dur, ease, delay: 2 }, "first")
          .to(b, { xPercent: 0, yPercent: -100, duration: dur, ease, delay: 2, onComplete: () => step(false) }, "first");
      }
      tl.to(b, { xPercent: D, yPercent: -200, duration: dur, ease, delay: 2 }, "second")
        .to(c, { xPercent: 0, yPercent: -200, duration: dur, ease, delay: 2 }, "second")
        .set(a, { xPercent: 0, yPercent: 0 })
        .set([b, c], { xPercent: -15, yPercent: 0 });
    };
    chars.forEach((c) => gsap.set([c.children[1], c.children[2]], { xPercent: -15 }));
    return { start: () => step(true), stop: () => { alive = false; } };
  };

  function showSound() {
    show(sound);
    const title = $(".ar-sound__title");
    const roll = rollTitle(title, "Audio?", 5);
    const buttons = $$(".ar-sound__button", sound);
    const face = $(".ar-sound__face");
    const pupils = $(".ar-sound__pupils");
    const brows = $$(".ar-sound__brow", sound);
    // The face approaches from 1.05 → 1.2 over 10 seconds, and the eyebrows·pupils look up then come down to the center in 1 second
    const zoom = gsap.fromTo(face, { scale: 1.05 }, { scale: innerWidth > 992 ? 1.2 : 1.3, duration: 10, ease: "power1.out" });
    const browAngle = (t) => 10 * ((t / (innerHeight / 2) + 1) / 2);
    gsap.set(brows, { transformOrigin: "50% 100%" });
    gsap.fromTo(pupils, { y: -innerHeight / 2 / 35 }, { y: 0, duration: 1, ease: "power2.out" });
    gsap.fromTo(brows[0], { rotation: browAngle(-innerHeight / 2) }, { rotation: browAngle(innerHeight / 2), duration: 1, ease: "power2.out" });
    gsap.fromTo(brows[1], { rotation: -browAngle(-innerHeight / 2) }, { rotation: -browAngle(innerHeight / 2), duration: 1, ease: "power2.out" });

    let opened = false;
    // The circle sloshes then stops at 25%, opens to full screen right there, and the button and title float up
    const open = (then) => {
      if (opened) return;
      opened = true;
      const from = getComputedStyle(sound).clipPath;
      sound.classList.remove("is-reveal");
      gsap.timeline()
        .fromTo(sound, { clipPath: from }, { clipPath: "circle(100% at 50% 40%)", duration: .5, ease: "expo.in", onComplete: () => { hide(intro); hide(welcome); then ? then() : roll.start(); } }, 0)
        .fromTo([...buttons, title], { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .3, ease: "power1.out", clearProps: "transform" }, .3);
    };
    if (isTouch) {
      gsap.set(sound, { clipPath: "circle(100%)" });
      gsap.set([...buttons, title], { opacity: 1 });
      gsap.fromTo(sound, { opacity: 0 }, { opacity: 1, duration: .4, ease: "power1.inOut", onComplete: () => { opened = true; hide(intro); hide(welcome); roll.start(); } });
    } else {
      sound.classList.add("is-reveal");
      sound.addEventListener("animationend", () => open(), { once: true });
    }

    // Pupils follow the mouse (distance/35px), eyebrows tilt (0~10 degrees), and the face turns ±1.5 degrees
    const move = (e) => {
      if (!opened) return;
      const sx = innerWidth / 2 - e.clientX, sy = innerHeight / 2 - e.clientY;
      gsap.to(pupils, { x: -sx / 35, y: -sy / 35, duration: .5, ease: "power2.out", overwrite: true });
      const r = browAngle(sy), dx = sy / 70 - sx / 70;
      gsap.to(brows[0], { rotation: r, x: dx, duration: .5, ease: "power2.out", overwrite: true });
      gsap.to(brows[1], { rotation: -r, x: -sy / 70 - sx / 70, duration: .5, ease: "power2.out", overwrite: true });
      gsap.to(face, { rotationX: (2 * (e.clientY / innerHeight) - 1) * 1.5, rotationY: (2 * (e.clientX / innerWidth) - 1) * 1.5, duration: .5, ease: "power2.out", overwrite: "auto" });
    };
    if (!reduce) sound.addEventListener("mousemove", move);

    // Hovering the off button makes it shake left and right five times (meaning no)
    const off = $(".ar-sound__button--off");
    let shaking = false;
    off.addEventListener("mouseenter", () => {
      if (shaking || isTouch) return;
      shaking = true;
      gsap.timeline({ onComplete: () => { shaking = false; } })
        .to(off, { x: -10, duration: .05, ease: "power1.inOut", repeat: 9, yoyo: true })
        .to(off, { x: 0, duration: .05 });
    });

    let confirmed = false;
    const confirm = (on) => {
      if (confirmed) return;
      confirmed = true;
      const done = () => {
        removeEventListener("keydown", key);
        sound.removeEventListener("mousemove", move);
        roll.stop();
        zoom.kill();
        AR.soundOn = on;
        $(".ar-sound-toggle").classList.toggle("is-off", !on);
        gsap.to(sound, { opacity: 0, duration: .5, delay: .3, ease: "power1.inOut", onComplete: () => hide(sound) });
        AR.onSoundConfirmed?.(on);
      };
      // If the circle isn’t fully open yet, open it first then move on
      opened ? done() : open(done);
    };
    const key = (e) => { if (e.code === "Enter") confirm(true); if (e.code === "Escape") confirm(false); };
    addEventListener("keydown", key);
    off.addEventListener("click", (e) => { e.stopPropagation(); confirm(false); });
    $(".ar-sound__button--on").addEventListener("click", (e) => { e.stopPropagation(); confirm(true); });
    sound.addEventListener("click", () => isTouch || confirm(true));
  }

  function finishIntro() {
    hide(intro);
    hide(sound);
    AR.onSoundConfirmed?.(false);
  }

  // Rotate the phone to landscape for fullscreen, back to portrait to exit (same as original). Browsers that refuse without a gesture are quietly skipped
  if (isTouch && screen.orientation) screen.orientation.addEventListener("change", () => {
    const land = screen.orientation.type.startsWith("landscape");
    if (land && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else if (!land && document.fullscreenElement && !document.hidden) document.exitFullscreen().catch(() => {});
  });

  // ── Modal ─────────────────────────────
  const modal = $(".ar-modal");
  const modalTitle = $(".ar-modal__title");
  const openModal = (btn) => {
    modalTitle.textContent = (btn.dataset.title || btn.textContent || "Title Here").trim();
    show(modal);
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: .3, ease: "power1.out" });
    gsap.fromTo(".ar-modal__panel", { y: 40, scale: .96 }, { y: 0, scale: 1, duration: .45, ease: "expo.out" });
  };
  const closeModal = () => gsap.to(modal, { opacity: 0, duration: .25, ease: "power1.in", onComplete: () => hide(modal) });
  AR.modalOpen = () => !modal.hidden;
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-modal]");
    if (b) { e.preventDefault(); openModal(b); }
  });
  $(".ar-modal__close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  addEventListener("keydown", (e) => { if (e.code === "Escape" && !modal.hidden) { e.stopImmediatePropagation(); closeModal(); } }, true);
  $$("a[href='#']").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  // ── Start ─────────────────────────────
  if (reduce || location.hash) {
    gsap.set(content, { opacity: 1 });
    gsap.set(title, { backgroundPositionX: "0%" });
    hide(pre);
    addEventListener("DOMContentLoaded", startIntro);
  } else {
    fontsReady.then(() => {
      gsap.to(content, { opacity: 1, duration: .2, ease: "power1.out", overwrite: true });
      reveal({ percent: 100, delay: 8 });
      fakeLoad();
    });
  }
})();
