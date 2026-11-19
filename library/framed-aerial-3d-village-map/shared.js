// Things layered on the board — gate (original loader timeline values), guide board, cursor, menu pill, mode button, sound.
// Exchanges with the 3D panel (index.js) happen only through window.CZ events: cz:discover-tick (panel on) · cz:ui (show outer buttons) · cz:mode · cz:series · cz:compass
(() => {
  gsap.config({ nullTargetWarn: false });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = () => innerWidth <= 767;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CZ = (window.CZ = new EventTarget());
  const emit = (type, detail) => CZ.dispatchEvent(new CustomEvent(type, { detail }));

  // ── Pixel-stair wordmark (original logo spot) — draws a 5×7 glyph grid as stair-shaped cells, one path per letter
  const GLYPH = { M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"], A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"], U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"], L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"] };
  const logo = $(".cz-logo");
  if (logo) {
    const word = "BRAND", cw = 1182 / word.length, px = Math.min(cw / 6.2, 165 / 7);
    logo.innerHTML = [...word].map((ch, k) => {
      const g = GLYPH[ch]; let d = "";
      g.forEach((row, y) => [...row].forEach((on, x) => { if (on === "1") d += `M${(k * cw + x * px).toFixed(1)} ${(y * px).toFixed(1)}h${px.toFixed(1)}v${px.toFixed(1)}h${(-px).toFixed(1)}z`; }));
      return `<path d="${d}"/>`;
    }).join("");
  }

  // ── Cursor: a dot in a circle + four direction marks follow the hand at .2 each. Only over plates, and while dragging the marks move outward
  const cur = $(".cz-cursor");
  if (cur && matchMedia("(pointer: fine)").matches) {
    const p = { x: innerWidth / 2, y: innerHeight / 2 }, q = { ...p };
    addEventListener("pointermove", (e) => {
      p.x = e.clientX; p.y = e.clientY;
      const overMap = e.target.closest?.(".cz-webgl");
      cur.classList.toggle("is-on", !!overMap && !document.body.classList.contains("is-loading"));
      cur.classList.toggle("is-off", !overMap);
    }, { passive: true });
    addEventListener("pointerdown", (e) => e.target.closest?.(".cz-webgl") && cur.classList.add("is-drag"));
    addEventListener("pointerup", () => cur.classList.remove("is-drag"));
    gsap.ticker.add(() => {
      if (document.body.classList.contains("is-loading")) return;
      q.x += (p.x - q.x) * .2; q.y += (p.y - q.y) * .2; cur.style.transform = `translate3d(${q.x}px, ${q.y}px, 0)`;
    });
  }

  // ── Sound: replaces the original background audio — when on, we synthesize a very low wind sound (pink noise + low-pass filter) and play it
  let audio = null;
  const sound = (on) => {
    if (!on) { audio?.g.gain.setTargetAtTime(0, audio.ctx.currentTime, .4); return; }
    if (!audio) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; b0 = .997 * b0 + w * .029591; b1 = .985 * b1 + w * .032534; b2 = .95 * b2 + w * .048056; d[i] = (b0 + b1 + b2 + w * .1848) * .3; }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 600;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(f).connect(g).connect(ctx.destination); src.start();
      audio = { ctx, g };
    }
    audio.ctx.resume();
    audio.g.gain.setTargetAtTime(.05, audio.ctx.currentTime, .6);
  };
  let soundOn = true;

  // ── Up · down buttons attach after the gate as in the original (the app draws then) — handles are hooked after attaching
  let past = false, night = false;
  const bindUI = () => {
    const soundBtn = $(".cz-nav__sound");
    soundBtn?.setAttribute("aria-pressed", String(soundOn));
    soundBtn?.addEventListener("click", () => { soundOn = !soundOn; soundBtn.setAttribute("aria-pressed", String(soundOn)); sound(soundOn); });
    // ── Menu pills: watch video (open/close video panel) · path (expand list) · compass (back to start)
    const nav = $(".cz-nav");
    const seriesBtn = $(".cz-nav__series");
    seriesBtn?.addEventListener("click", () => { const open = !nav.classList.contains("is-series"); nav.classList.toggle("is-series", open); seriesBtn.setAttribute("aria-expanded", String(open)); seriesBtn.classList.toggle("is-selected", open); emit("cz:series", open); });
    const routes = $(".cz-nav__routes-list"), routesBtn = $(".cz-nav__routes-btn");
    const routesOpen = (on) => {
      routesBtn.setAttribute("aria-expanded", String(on));
      if (on) { routes.hidden = false; gsap.fromTo(routes.children, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: .5, ease: "power3.out", stagger: .06 }); gsap.to(routesBtn, { autoAlpha: 0, duration: .25 }); }
      else gsap.to(routes.children, { autoAlpha: 0, duration: .25, onComplete: () => { routes.hidden = true; gsap.to(routesBtn, { autoAlpha: 1, duration: .25 }); } });
    };
    routesBtn?.addEventListener("click", () => routesOpen(true));
    $(".cz-nav__back")?.addEventListener("click", () => routesOpen(false));
    $$(".cz-nav__routes-list li button").forEach((b) => b.addEventListener("click", () => { $$(".cz-nav__routes-list li button").forEach((o) => o.classList.toggle("is-selected", o === b)); emit("cz:route", +b.dataset.route); }));
    $(".cz-nav__compass")?.addEventListener("click", () => emit("cz:compass"));

    // ── Modes: past·present (arrow sides spread 4px apart), day·night (sun rays fade and a half moon turns)
    const ba = $(".cz-ba"), dn = $(".cz-dn");
    ba?.addEventListener("click", () => { past = !past; $$(".cz-ba__word", ba).forEach((w) => w.classList.toggle("is-on", (w.dataset.mode === "past") === past)); emit("cz:mode", { past, night }); });
    dn?.addEventListener("click", () => { night = !night; dn.setAttribute("aria-pressed", String(night)); cur?.classList.toggle("is-night", night); emit("cz:mode", { past, night }); });

  };
  CZ.addEventListener("cz:ui", () => {
    const tpl = $(".cz-ui-tpl");
    if (!tpl) return;
    const frag = tpl.content.cloneNode(true);
    tpl.replaceWith(frag);
    bindUI();
  });

  // ── Gate: original loader timeline (default curve power3.inOut · 1.5s)
  const loader = $(".cz-loader"), bg = $(".cz-loader__bg"), photo = $(".cz-loader__photo");
  const fly = $(".cz-intro__fly"), place = $(".cz-intro__place"), powered = $(".cz-intro__powered"), desc = $(".cz-intro__desc"), btn = $(".cz-discover"), intro = $(".cz-intro");
  const tutorial = $(".cz-tutorial"), tutBottom = $(".cz-tutorial__bottom"), logoW = $(".cz-loader__logo");
  document.body.classList.add("is-loading");
  const enter = gsap.timeline({ defaults: { ease: "power3.inOut", duration: 1.5 } });
  if (reduce) { enter.set(photo, { opacity: 1 }).set(logoW, { opacity: 0 }).call(() => bg.dispatchEvent(new Event("fx:play"))); }
  else {
    enter.fromTo(photo, { opacity: 0 }, { opacity: 1, duration: 1.5 }, 0)
      .fromTo(photo, { scale: 1.1 }, { scale: 1, duration: 2 }, 0)
      .fromTo(phone() ? [logoW] : $$(".cz-logo path"), phone() ? { yPercent: 110 } : { y: 300 }, phone() ? { yPercent: 0, duration: 1.3 } : { y: 0, stagger: { from: "start", each: .055 }, duration: 1, ease: "power3.out" }, .6)
      .to(logoW, { opacity: 0, duration: 1 }, 2)
      .fromTo(fly, { opacity: 0 }, { opacity: 1, ease: "linear", duration: 1 }, 2.7)
      .fromTo(fly, { x: -400 }, { x: 0, duration: 1.7 }, 2.2)
      .fromTo(place, { opacity: 0 }, { opacity: 1, ease: "linear", duration: 1 }, 2.7)
      .fromTo(powered, { opacity: 0 }, { opacity: 1, ease: "linear", duration: 1 }, 3)
      .fromTo(place, { x: 400 }, { x: 0, duration: 1.7 }, 2.2)
      .fromTo(btn, { opacity: 0, pointerEvents: "none" }, { opacity: 1, ease: "linear", duration: 1.2, pointerEvents: "auto" }, 3)
      .fromTo(desc, { opacity: 0 }, { opacity: 1, ease: "linear", duration: 1.2 }, 3.1);
  }
  let went = false;
  btn?.addEventListener("click", () => {
    if (went) return;
    went = true;
    // Opening the audio device can stall the frame (hundreds of ms in headless), so turn it on after the gates have all cleared
    const w = innerWidth, C = 1.5;
    const tl = gsap.timeline();
    tl.to(place, { x: phone() ? 0 : -w * .2, y: phone() ? -80 : 0, duration: 1.4, ease: "power3.inOut" }, 0)
      .to(fly, { x: phone() ? 0 : w * .2, y: phone() ? 80 : 0, duration: 1.4, ease: "power3.inOut" }, 0)
      .to(bg, { opacity: 0, duration: .6 }, 0)
      .to([intro, bg], { opacity: 0, ease: "linear", duration: .6 }, .5)
      // Original recording: at 1.6s the gate backdrop clears and the top and bottom buttons form over 1s linear (the notice panel doesn’t appear in the recording — it seems first-time only, so it is kept)
      .set(loader, { backgroundColor: "transparent" }, 1.6)
      .add(() => emit("cz:ui"), 1.6)
      // Original record: the signboard only unfolds at 1.7s (width 0 → screen) and its opacity stays the same
      .fromTo(tutorial, { display: "none", opacity: 1 }, { display: "flex", opacity: 1, ease: "linear", duration: 1 }, 1.6)
      .fromTo(tutBottom, { opacity: 1 }, { opacity: 1, ease: "linear", duration: 1 }, 2)
      .add(() => emit("cz:tick"), 2.3)
      .to(loader, { opacity: 0, ease: "linear", duration: 1.2 }, 3.25 + C)
      .add(() => { loader.remove(); document.body.classList.remove("is-loading"); emit("cz:ready"); if (soundOn) sound(true); });
    if (reduce) tl.progress(1);
  });
  // When skipping the gate (#direct) — so the panel shows first from inspect tools · coming back
  if (location.hash === "#skip") { btn?.click(); }
})();
