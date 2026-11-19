// Shared by all pages: Lenis scroll, section state (window.ph), entrance door, section-change curtain, table-of-contents drawer, line rise, film grain, sound.
// The section list is read from the contents button’s data-go · data-label · data-title · data-land — even if the page changes its sections, this file stays the same.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  if (touch) root.classList.add("is-touch");
  // For previews and thumbnails: opening with ?enter skips the entry gate
  const skipGate = new URLSearchParams(location.search).has("enter");

  const state = {
    hero: 0, wall: 0, turn: 0, ascent: 0, question: 0, sun: 0,
    wordIndex: 0, wordFade: 0, hold: 0, burst: 0,
    pointer: { x: 0, y: 0 }, pointerPx: { x: innerWidth / 2, y: innerHeight / 2 },
    hovered: null, section: "hero", snap: false, entered: false,
  };
  const listeners = new Set();
  const ph = (window.ph = {
    state, reduce, touch, lenis: null,
    on: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    setSection(id) {
      root.dataset.section = id;
      if (state.section === id) return;
      state.section = id;
      listeners.forEach((fn) => fn(id));
    },
  });

  // Original lerp .075 · wheel .9 · touch 1.4. With reduced motion, lerp is 1 (instant)
  const lenis = (ph.lenis = new Lenis({ lerp: reduce ? 1 : 0.075, smoothWheel: !reduce, wheelMultiplier: 0.9, touchMultiplier: 1.4 }));
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  history.scrollRestoration = "manual";
  scrollTo(0, 0);

  addEventListener("pointermove", (e) => {
    state.pointerPx.x = e.clientX;
    state.pointerPx.y = e.clientY;
    state.pointer.x = (e.clientX / innerWidth) * 2 - 1;
    state.pointer.y = -(e.clientY / innerHeight) * 2 + 1;
  }, { passive: true });

  // Film grain: draw 180×180 random gray dots once and use as background
  const grain = document.querySelector(".ph-grain");
  if (grain) {
    const c = document.createElement("canvas");
    c.width = c.height = 180;
    const g = c.getContext("2d");
    const img = g.createImageData(180, 180);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    grain.style.backgroundImage = `url(${c.toDataURL()})`;
  }

  /* ---------- Sound: the original’s campfire and cave-echo synthesis cut down to four layers (fire hum · crackle pops · bass drone · wind) ---------- */
  const sound = (ph.sound = (() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    let ctx = null, master = null, on = false, layers = null;
    const noise = (sec, kind) => {
      const n = Math.floor(ctx.sampleRate * sec);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = buf.getChannelData(0);
      let b = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "brown") { b = (b + 0.02 * w) / 1.02; d[i] = b * 3.5; } else d[i] = w;
      }
      return buf;
    };
    const crackle = (sec) => {
      const n = Math.floor(ctx.sampleRate * sec);
      const buf = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let a = 0; a < n;) {
        a += Math.floor(ctx.sampleRate * (0.015 + Math.pow(Math.random(), 2.5) * 0.35));
        const len = Math.floor(ctx.sampleRate * (0.002 + Math.random() * 0.012));
        const amp = Math.pow(Math.random(), 2) * 0.9;
        for (let p = 0; p < len && a + p < n; p++) d[a + p] += (Math.random() * 2 - 1) * amp * Math.exp((-p / len) * 5);
      }
      return buf;
    };
    const loop = (buf) => { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
    const filter = (type, f, q = 0.7) => { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
    const gain = (v) => { const g = ctx.createGain(); g.gain.value = v; return g; };
    const build = () => {
      ctx = new AC();
      master = gain(0);
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.ratio.value = 3;
      master.connect(comp).connect(ctx.destination);
      const roar = gain(0.25), snap = gain(0.4), drone = gain(0.5), air = gain(0);
      [roar, snap, drone, air].forEach((g) => g.connect(master));
      loop(noise(4, "brown")).connect(filter("lowpass", 420)).connect(roar);
      loop(crackle(7)).connect(filter("highpass", 900)).connect(snap);
      const lp = filter("lowpass", 220);
      lp.connect(drone);
      [55, 82.41, 110, 164.81].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = i < 2 ? "sawtooth" : "sine";
        o.frequency.value = f;
        o.connect(gain(0.05)).connect(lp);
        o.start();
      });
      loop(noise(5)).connect(filter("bandpass", 1400, 0.5)).connect(air);
      layers = { roar, snap, drone, air };
    };
    const blip = (freq, peak, len, type = "sine") => {
      if (!on) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = gain(0.0001);
      o.type = type;
      o.frequency.value = freq;
      g.gain.exponentialRampToValueAtTime(peak, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + len + 0.05);
    };
    return {
      supported: !!AC,
      get on() { return on; },
      async set(v) {
        if (!AC) return;
        if (v && !ctx) build();
        on = v;
        if (ctx.state === "suspended") await ctx.resume();
        master.gain.setTargetAtTime(v ? 0.8 : 0, ctx.currentTime, 0.6);
      },
      // Deeper in the cave, fire sound — further out, wind
      mix(light) {
        if (!on) return;
        const t = ctx.currentTime;
        layers.roar.gain.setTargetAtTime(0.25 * (1 - light), t, 0.3);
        layers.snap.gain.setTargetAtTime(0.4 * (1 - light), t, 0.3);
        layers.air.gain.setTargetAtTime(0.35 * light, t, 0.3);
      },
      whoosh(out) {
        if (!on) return;
        const t = ctx.currentTime;
        const s = ctx.createBufferSource();
        s.buffer = noise(1.6);
        const bp = filter("bandpass", out ? 2400 : 300, 1.2);
        bp.frequency.exponentialRampToValueAtTime(out ? 300 : 2400, t + 1.2);
        const g = gain(0.0001);
        g.gain.exponentialRampToValueAtTime(0.5, t + 0.5);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
        s.connect(bp).connect(g).connect(master);
        s.start(t);
      },
      tick: () => blip(1046, 0.04, 0.08),
      chime: () => [1, 2.76, 5.4].forEach((m, i) => blip(523.25 * m, 0.11 / (i + 1), 4 / (i * 0.7 + 1))),
    };
  })());

  const soundBtn = document.querySelector("[data-sound]");
  const paintSound = () => {
    if (!soundBtn) return;
    soundBtn.textContent = sound.on ? soundBtn.dataset.on : soundBtn.dataset.off;
    soundBtn.setAttribute("aria-pressed", sound.on);
  };
  if (soundBtn) {
    if (!sound.supported) soundBtn.hidden = true;
    soundBtn.addEventListener("click", () => sound.set(!sound.on).then(paintSound));
  }
  if (!touch) {
    let last = null;
    addEventListener("pointerover", (e) => {
      const hit = e.target.closest?.("button, a, [role=button]") || null;
      if (hit && hit !== last) sound.tick();
      last = hit;
    }, { passive: true });
  }

  /* ---------- Line rise: [data-reveal] paragraphs are split into lines, each rising from 110% below tilted 2 degrees (1.4s expo.out, line gap .09) ---------- */
  ph.reveal = (scope = document, opts = {}) => {
    gsap.utils.toArray("[data-reveal]", scope).forEach((el) => {
      if (reduce) return;
      SplitText.create(el, {
        type: "lines", mask: "lines", linesClass: "ph-line", autoSplit: true,
        onSplit: (s) => gsap.from(s.lines, {
          yPercent: 110, rotate: 2, duration: 1.4, ease: "expo.out", stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 88%", ...(opts.containerAnimation ? { containerAnimation: opts.containerAnimation, start: "left 85%" } : {}) },
        }),
      });
    });
  };

  /* ---------- Section List ---------- */
  const chapters = gsap.utils.toArray("[data-go]").map((b) => ({
    id: b.dataset.go, label: b.dataset.label, title: b.dataset.title, land: Number(b.dataset.land || 0),
  }));
  ph.chapters = chapters;

  const center = document.querySelector(".ph-nav__center");
  const tagline = center ? center.textContent.trim() : "";
  ph.on((id) => {
    if (!center) return;
    const c = chapters.find((x) => x.id === id);
    const text = !c || id === chapters[0]?.id ? tagline : `${c.label}. ${c.title}`;
    const span = document.createElement("span");
    span.textContent = text;
    center.replaceChildren(span);
  });

  /* ---------- Section transition curtain ---------- */
  const veil = document.querySelector(".ph-veil");
  let veiling = false;
  const landY = (id) => {
    const el = document.getElementById(id);
    const box = el.closest(".pin-spacer") || el.querySelector(".pin-spacer") || el;
    const top = box.getBoundingClientRect().top + scrollY;
    const room = Math.max(box.offsetHeight - innerHeight, 0);
    const land = chapters.find((c) => c.id === id)?.land ?? 0;
    return Math.round(top + room * land) + (top > 0 ? 2 : 0);
  };
  const jump = (y) => {
    lenis.scrollTo(y, { immediate: true, force: true });
    ScrollTrigger.update();
    ScrollTrigger.getAll().forEach((st) => {
      const tw = st.getTween?.();
      if (tw && typeof tw.progress === "function") tw.progress(1);
    });
  };
  ph.goTo = (id, { numeral, title, onCovered, onDone } = {}) => {
    if (veiling || !veil) return;
    const c = chapters.find((x) => x.id === id) || {};
    const top = veil.querySelector(".ph-lid--top");
    const bottom = veil.querySelector(".ph-lid--bottom");
    const slit = veil.querySelector(".ph-slit");
    const labels = veil.querySelectorAll(".ph-veil__numeral, .ph-veil__title");
    labels[0].textContent = numeral ?? c.label;
    labels[1].textContent = title ?? c.title;
    veiling = true;
    lenis.stop();
    sound.whoosh();
    const k = reduce ? 0.4 : 1;
    gsap.timeline({ onComplete: () => { veiling = false; lenis.start(); onDone?.(); } })
      .set(veil, { visibility: "visible" })
      .fromTo(top, { yPercent: -100 }, { yPercent: 0, duration: 0.9 * k, ease: "expo.inOut" }, 0)
      .fromTo(bottom, { yPercent: 100 }, { yPercent: 0, duration: 0.9 * k, ease: "expo.inOut" }, 0)
      .fromTo(slit, { scaleX: 0, scaleY: 1, autoAlpha: 1 }, { scaleX: 1, duration: 0.7 * k, ease: "expo.out" }, 0.65 * k)
      .fromTo(labels, { yPercent: 110 }, { yPercent: 0, duration: 0.9 * k, ease: "expo.out", stagger: 0.08 }, 0.6 * k)
      .add(() => { state.snap = true; onCovered?.(); jump(landY(id)); })
      .to({}, { duration: 0.5 * k })
      .add(() => { state.snap = false; sound.whoosh(true); })
      .to(labels, { yPercent: -110, duration: 0.6 * k, ease: "expo.in", stagger: 0.05 })
      .to(slit, { autoAlpha: 0, scaleY: 30, duration: 0.8 * k, ease: "power2.out" }, "-=0.1")
      .to(top, { yPercent: -100, duration: 1.2 * k, ease: "expo.inOut" }, "<")
      .to(bottom, { yPercent: 100, duration: 1.2 * k, ease: "expo.inOut" }, "<")
      .set(veil, { visibility: "hidden" });
  };

  /* ---------- Contents drawer: the panel rises in .5s and the lines light up at .06 intervals. On close it rewinds 1.6x faster ---------- */
  const menu = document.querySelector(".ph-menu");
  const menuBtn = document.querySelector("[aria-controls='menu']");
  if (menu && menuBtn) {
    const tl = gsap.timeline({ paused: true })
      .to(menu, { autoAlpha: 1, duration: 0.5, ease: "power1.out" })
      .fromTo(menu.querySelectorAll(".ph-menu__head, .ph-menu__item"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power1.out", stagger: 0.06 }, "-=0.3");
    let open = false;
    const mark = (v) => {
      open = v;
      menuBtn.setAttribute("aria-expanded", v);
      menuBtn.textContent = v ? menuBtn.dataset.close : menuBtn.dataset.open;
      menu.setAttribute("aria-hidden", !v);
      root.classList.toggle("is-menu", v);
      menu.querySelectorAll("button").forEach((b) => (b.tabIndex = v ? 0 : -1));
    };
    const set = (v) => {
      mark(v);
      if (v) {
        lenis.stop();
        tl.eventCallback("onComplete", () => menu.querySelector("button")?.focus({ preventScroll: true }));
        tl.timeScale(1).play();
      } else {
        lenis.start();
        tl.timeScale(1.6).reverse();
      }
    };
    menuBtn.addEventListener("click", () => set(!open));
    addEventListener("keydown", (e) => open && e.key === "Escape" && (set(false), menuBtn.focus({ preventScroll: true })));
    // Remove the drawer only after the curtain fully covers the screen so the closing isn’t visible
    document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () =>
      ph.goTo(b.dataset.go, { onCovered: () => { mark(false); tl.pause(0); } })));
  }
  document.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () =>
    ph.goTo(b.dataset.goto, { numeral: b.dataset.numeral, title: b.dataset.title })));

  /* ---------- Entrance Gate ---------- */
  const pre = document.querySelector(".ph-preloader");
  const enter = () => {
    state.entered = true;
    scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });
    lenis.start();
    ScrollTrigger.refresh();
    dispatchEvent(new Event("ph:enter"));
  };
  if (!pre || skipGate) {
    pre?.remove();
    addEventListener("load", () => requestAnimationFrame(enter), { once: true });
    if (document.readyState === "complete") requestAnimationFrame(enter);
  } else {
    lenis.stop();
    const slit = pre.querySelector(".ph-slit");
    const choice = pre.querySelector(".ph-preloader__choice");
    const reveals = pre.querySelectorAll(".ph-reveal");
    const load = { v: 0 };
    const paint = () => gsap.set(slit, { scaleX: load.v / 100 });
    gsap.to(load, { v: 12, duration: 3, ease: "power2.out", onUpdate: paint });
    // Original: once the 3D scene is ready the light gap grows fully (.9s), and from then it waits at least 1.4s for the typeface
    const stage = new Promise((r) => (ph.stageReady ? r() : addEventListener("ph:stage", r, { once: true })));
    stage.then(() => {
      gsap.to(load, { v: 100, duration: 0.9, ease: "power2.out", onUpdate: paint, overwrite: true });
      return Promise.all([document.fonts?.ready, new Promise((r) => setTimeout(r, reduce ? 0 : 1400))]);
    }).then(() => {
      gsap.killTweensOf(load);
      gsap.timeline()
        .to(load, { v: 100, duration: 0.6, ease: "power2.out", onUpdate: paint })
        .to([pre.querySelector(".ph-preloader__center"), pre.querySelector(".ph-preloader__note")], { autoAlpha: 0, duration: 0.8, ease: "power1.in", stagger: 0.06 })
        .set(choice, { visibility: "visible" })
        .fromTo(reveals, { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.1 }, "-=0.5")
        .add(() => choice.querySelector("button")?.focus({ preventScroll: true }));
    });
    let gone = false;
    const go = (withSound) => {
      if (gone) return;
      gone = true;
      if (withSound) sound.set(true).then(() => { paintSound(); sound.whoosh(true); });
      gsap.timeline({ onComplete: () => pre.remove() })
        .to(reveals, { yPercent: -110, duration: 0.6, ease: "expo.in", stagger: 0.05 })
        .add(enter)
        .to(pre.querySelector(".ph-lid--top"), { yPercent: -100, duration: 2, ease: "expo.inOut" }, "+=0.05")
        .to(pre.querySelector(".ph-lid--bottom"), { yPercent: 100, duration: 2, ease: "expo.inOut" }, "<")
        .to(slit, { autoAlpha: 0, scaleY: 30, duration: 0.9, ease: "power2.out" }, "<0.15");
    };
    pre.querySelector("[data-enter='sound']")?.addEventListener("click", () => go(true));
    pre.querySelector("[data-enter='silent']")?.addEventListener("click", () => go(false));
    if (!sound.supported) pre.querySelector("[data-enter='silent']")?.closest(".ph-mask")?.remove();
  }
})();
