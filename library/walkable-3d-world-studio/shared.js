/* Shared by the whole site — Lenis 1.3.25 (lerp .08) · entrance door · header band · settings drawer · phone pill menu · helper · glass button light · 
   Story screen (in each scene the text lines rise from below as you go) · next-page strip (scroll to the end to go to the next section) · sound (our synthesized tones). */
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE_UI = CustomEase.create("em-ui", "0.16,1,0.3,1");
  const Em = (window.Em = { reduce, ease: EASE_UI, onEnter: [] });

  // ── Smooth scroll ──
  const lenis = new Lenis({ lerp: 0.08, syncTouch: true, autoRaf: false });
  Em.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Theme uses sessionStorage instead of a cookie — persists across page turns in the same window
  const saved = sessionStorage.getItem("em-theme");
  if (saved) root.setAttribute("data-theme", saved);

  // ── 3D world ──
  const worldHost = document.querySelector(".em-world");
  if (worldHost && window.EmWorld) EmWorld.init(worldHost, { quality: sessionStorage.getItem("em-quality") || undefined, room: "room" in worldHost.dataset, chairs: "chairs" in worldHost.dataset });

  // ── Sound: the original is a background audio file. Here a low chord + wind sound are synthesized on the spot ──
  let actx = null, master = null;
  // Prepare the sound panel in advance (paused) — building it at the press blocks the main thread and delays the entry sequence
  function buildAudio() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain();
      master.gain.value = 0;
      master.connect(actx.destination);
      [110, 164.8, 220, 277.2].forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = "sine"; o.frequency.value = f; o.detune.value = i * 3;
        g.gain.value = 0.05 / (i + 1);
        o.connect(g).connect(master); o.start();
      });
      const len = actx.sampleRate * 2, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3; }
      const src = actx.createBufferSource(), lp = actx.createBiquadFilter(), g = actx.createGain();
      src.buffer = buf; src.loop = true; lp.type = "lowpass"; lp.frequency.value = 500; g.gain.value = 0.12;
      src.connect(lp).connect(g).connect(master); src.start();
    }
  }
  setTimeout(() => { try { buildAudio(); } catch {} }, 300);
  function soundOn(on) {
    if (on) buildAudio();
    if (!actx) return;
    if (on) actx.resume();
    master.gain.cancelScheduledValues(actx.currentTime);
    master.gain.setTargetAtTime(on ? 0.6 : 0, actx.currentTime, 0.4);
    document.querySelectorAll("[data-sound]").forEach((b) => b.setAttribute(b.getAttribute("role") === "switch" ? "aria-checked" : "aria-pressed", String(on)));
    sessionStorage.setItem("em-sound", on ? "1" : "0");
  }
  Em.sound = soundOn;
  document.querySelectorAll("[data-sound]").forEach((b) =>
    b.addEventListener("click", () => soundOn(b.getAttribute(b.getAttribute("role") === "switch" ? "aria-checked" : "aria-pressed") !== "true")),
  );

  // ── Entry door: when the progress bar fills, two buttons. If already entered in the same window, the bar fills briefly and opens right away ──
  const loader = document.querySelector(".em-loader");
  const ui = document.querySelectorAll("[data-ui]");
  function enter(withSound) {
    if (!root.classList.contains("is-gated")) return;
    sessionStorage.setItem("em-entered", "1");
    root.classList.remove("is-gated");
    lenis.start();
    const at = Object.assign({ main: 1.5, ui: 1.59, uiDur: 1.28, uiEase: "power2.out", uiStagger: 0, mainDur: 0.6, bar: 0 }, Em.enterAt || {});
    (Em.onEnterNow || []).forEach((f) => f());
    // The scrollbar appears first (right after the press). The sound context (AudioContext) is blocked at creation, so it is deferred to the next tick
    const barOn = () => { bar.classList.add("is-on"); requestAnimationFrame(moveThumb); };
    if (reduce || !at.bar) barOn(); else gsap.delayedCall(at.bar, barOn);
    if (withSound) soundOn(true);
    // Like the original, loader content is removed at once (from the DOM), and a round hole spreads from the center of the panel to open the world
    const tl = gsap.timeline();
    if (loader) {
      const box = loader.querySelector(".em-loader__container");
      const fade = (Em.enterAt || {}).gateFade || 0;
      if (fade && !reduce) gsap.to(box, { opacity: 0, duration: fade, ease: "power1.out", onComplete: () => box.remove() });
      else box?.remove();
      loader.classList.add("is-opening");
      const iris = { r: -96, g: 0 }, far = Math.hypot(innerWidth, innerHeight) / 2 + 120;
      const paint = () => { loader.style.setProperty("--iris", `${iris.r}px`); loader.style.setProperty("--glow", String(iris.g)); };
      tl.to(iris, { r: far, duration: reduce ? 0 : 1.3, delay: reduce ? 0 : 0.1, ease: "power2.in", onUpdate: paint, onComplete: () => loader.remove() }, 0);
      tl.to(iris, { g: 1, duration: reduce ? 0 : 0.4, ease: "power1.out", onUpdate: paint }, 0.1);
    }
    if (window.EmWorld?.ready && !reduce) {
      const s = { v: 0.03 };
      tl.to(s, { v: 0, duration: 1.6, ease: "power2.out", onUpdate: () => EmWorld.split(s.v) }, 0);
    }
    // Body text enters when the hole is half open, the header band and helper enter after the world is fully open
    const main = [...ui].filter((el) => el.tagName === "MAIN"), late = [...ui].filter((el) => el.tagName !== "MAIN");
    // A page can set its own entrance order (Em.enterAt) — the default is the original Hero: text at 1.5 seconds, header band and helper at 1.59 seconds for 1.28 seconds
    [...main, ...late].forEach((el) => el.classList.add("is-hidden"));
    // Like Contact, some pages have the main body appear in sequence together with the header band (mainWithUi)
    const group = at.mainWithUi ? [...main, ...late] : late;
    if (!at.mainWithUi) tl.to(main, { opacity: 1, duration: reduce ? 0 : at.mainDur, ease: "power2.out", onStart: () => main.forEach((el) => el.classList.remove("is-hidden")) }, reduce ? 0 : at.main);
    tl.to(group, { opacity: 1, duration: reduce ? 0 : at.uiDur, ease: at.uiEase, stagger: reduce ? 0 : at.uiStagger, onStart: () => group.forEach((el) => el.classList.remove("is-hidden")) }, reduce ? 0 : at.ui);
    if (at.barSettle && !reduce) gsap.delayedCall(at.barSettle, () => { bar.style.height = `${innerHeight}px`; });
    gsap.delayedCall(reduce ? 0 : at.main, () => Em.onEnter.forEach((f) => f()));
    Em.entered = true;
    // Helper bubble appears after the world is fully open (about 6s in the original too)
    assistTalk(6);
  }
  Em.enter = enter;
  if (loader) {
    root.classList.add("is-gated");
    lenis.stop();
    gsap.set(ui, { opacity: 0 });
    const fill = loader.querySelector(".em-loader__fill"), pct = loader.querySelector("[data-percent]"), actions = loader.querySelector(".em-loader__actions");
    const progress = loader.querySelector(".em-loader__progress");
    const again = sessionStorage.getItem("em-entered") === "1";
    // Original order: logo and text are there from the start, and when the world is ready (around 2.6s) the progress line drops out and two buttons rise in .4s.
    // The progress bar shows only if loading takes longer than that — our world stands up instantly, so leave it filled
    fill.style.transform = "scaleX(1)";
    pct.textContent = "100%";
    // 2.6 seconds from page open — after the button stands in .4s, the entrance door stops (the original door motion ends at 2.9~3.25s). Pages with late script parsing follow the same timing
    // The original entry gate freezes the screen after the button stands — at first paint (FCP), once the original loader length (Em.gateDur, ms) has passed, everything is standing (.4s fade)
    const firstPaint = () => (performance.getEntriesByName("first-contentful-paint")[0] || performance.getEntriesByName("first-paint")[0])?.startTime;
    requestAnimationFrame(() => gsap.delayedCall(reduce ? 0 : again ? 0.5 : Math.max(0.2, ((firstPaint() ?? performance.now()) + (Em.gateDur ?? 2900) - 400 - performance.now()) / 1000), () => {
      if (again) return enter(sessionStorage.getItem("em-sound") === "1");
      progress.hidden = true;
      actions.hidden = false;
      requestAnimationFrame(() => actions.querySelectorAll(".em-loader__enter-in").forEach((el) => el.classList.add("is-in")));
    }));
    loader.querySelector("[data-enter=sound]")?.addEventListener("click", () => enter(true));
    loader.querySelector("[data-enter=quiet]")?.addEventListener("click", () => enter(false));
  } else {
    Em.entered = true;
    requestAnimationFrame(() => Em.onEnter.forEach((f) => f()));
  }

  // ── Handmade scrollbar ──
  const bar = document.createElement("div");
  bar.className = "em-scrollbar";
  document.body.appendChild(bar);
  const sizeThumb = () => {
    const h = innerHeight, d = Math.max(document.documentElement.scrollHeight, document.body.getBoundingClientRect().height), lim = d - h;
    // Like the original, even pages that don’t scroll after entering (Work) get the handle standing at 100
    const th = root.classList.contains("is-gated") ? h : 100;
    bar.style.height = `${th}px`;
    return { h, th, lim };
  };
  const moveThumb = () => { if (!bar.classList.contains("is-on")) return; const { h, th, lim } = sizeThumb(); bar.style.transform = `translateY(${lim > 0 ? (lenis.scroll / lim) * (h - th) : 0}px)`; };
  lenis.on("scroll", moveThumb);
  addEventListener("resize", moveThumb);
  if (!loader) { bar.classList.add("is-on"); moveThumb(); }
  // In the original Work page, the handle sits at the bottom during the entrance door and moves to the very top once inside
  requestAnimationFrame(() => { if (loader && Em.enterAt?.thumbFrom === "bottom") bar.style.transform = `translateY(${innerHeight - 4}px)`; });

  // ── Header band: hides on scroll down and shows on scroll up. Over light sections, lays down a background and darkens the text ──
  const header = document.querySelector(".em-header");
  const mnav = document.querySelector(".em-mnav");
  let lastY = 0;
  lenis.on("scroll", ({ scroll }) => {
    const down = scroll > lastY + 2, up = scroll < lastY - 2;
    if (header) {
      if (down && scroll > 120) header.classList.add("em-header--hidden");
      else if (up || scroll < 120) header.classList.remove("em-header--hidden");
    }
    if (mnav && !mnav.classList.contains("is-open")) {
      if (down && scroll > 120) mnav.classList.add("em-mnav--hidden");
      else if (up) mnav.classList.remove("em-mnav--hidden");
    }
    lastY = scroll;
  });
  document.querySelectorAll("[data-header=light]").forEach((sec) =>
    ScrollTrigger.create({
      trigger: sec, start: "top top+=60", end: "bottom top+=60",
      onToggle: (st) => { header?.classList.toggle("em-header--active", st.isActive); mnav?.classList.toggle("em-mnav--ink", st.isActive); },
    }),
  );

  // ── Settings Drawer ──
  document.querySelectorAll(".em-settings").forEach((box) => {
    const trig = box.querySelector(".em-settings__trigger"), panel = box.querySelector(".em-settings__panel");
    const surf = panel.querySelector(".em-settings__surface"), items = panel.querySelector(".em-settings__items");
    let tl = null;
    const set = (open) => {
      box.classList.toggle("is-open", open);
      trig.setAttribute("aria-expanded", String(open));
      tl?.kill();
      if (open) panel.hidden = false;
      if (reduce) return gsap.set(panel, { autoAlpha: open ? 1 : 0 });
      tl = open
        ? gsap.timeline()
            .set(panel, { autoAlpha: 1 })
            .fromTo(surf, { scaleX: 0.6, scaleY: 0.3, borderRadius: "2rem", filter: "blur(6px)", transformOrigin: "0 0" }, { scaleX: 1, scaleY: 1, borderRadius: "1.5rem", filter: "blur(0px)", duration: 0.52, ease: CustomEase.create("em-blob", "0.34,1.56,0.64,1") }, 0)
            .fromTo(items, { clipPath: "inset(0 0 100% 0)", filter: "blur(4px)" }, { clipPath: "inset(0 0 0% 0)", filter: "blur(0px)", duration: 0.36, ease: "power1.out" }, 0)
        : gsap.timeline()
            .to(items, { filter: "blur(4px)", clipPath: "inset(0 0 100% 0)", duration: 0.2, ease: "power1.in" }, 0)
            .to(panel, { scale: 0.9, autoAlpha: 0, duration: 0.32, ease: CustomEase.create("em-back-in", "0.36,0,0.66,-0.56"), transformOrigin: "0 0" }, 0)
            .set(panel, { scale: 1 })
            .add(() => { panel.hidden = true; });
    };
    gsap.set(panel, { autoAlpha: 0 });
    panel.hidden = true;
    trig.addEventListener("click", () => set(!box.classList.contains("is-open")));
    document.addEventListener("pointerdown", (e) => { if (box.classList.contains("is-open") && !box.contains(e.target)) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && box.classList.contains("is-open")) { set(false); trig.focus(); } });
  });
  document.querySelectorAll("[data-dark]").forEach((b) => {
    b.setAttribute("aria-checked", String(root.getAttribute("data-theme") === "dark"));
    b.addEventListener("click", () => {
      const dark = root.getAttribute("data-theme") !== "dark";
      root.setAttribute("data-theme", dark ? "dark" : "light");
      sessionStorage.setItem("em-theme", dark ? "dark" : "light");
      document.querySelectorAll("[data-dark]").forEach((x) => x.setAttribute("aria-checked", String(dark)));
      window.EmWorld?.recolor?.();
    });
  });
  document.querySelectorAll("[data-quality]").forEach((b) => {
    const cur = sessionStorage.getItem("em-quality") || (innerWidth <= 1024 ? "medium" : "high");
    b.setAttribute("aria-pressed", String(b.dataset.quality === cur));
    b.addEventListener("click", () => {
      sessionStorage.setItem("em-quality", b.dataset.quality);
      document.querySelectorAll("[data-quality]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      window.EmWorld?.quality?.(b.dataset.quality);
    });
  });

  // ── Phone pill menu ──
  if (mnav) {
    const burger = mnav.querySelector(".em-mnav__burger"), over = document.querySelector(".em-mnav__overlay");
    const set = (open) => {
      mnav.classList.toggle("is-open", open);
      over?.classList.toggle("is-on", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.querySelector("[data-burger-text]").textContent = open ? burger.dataset.close : burger.dataset.open;
      open ? lenis.stop() : lenis.start();
    };
    burger.addEventListener("click", () => set(!mnav.classList.contains("is-open")));
    over?.addEventListener("click", () => set(false));
  }

  // ── Helper speech bubble ──
  const assist = document.querySelector(".em-assist");
  let assistTimer = 0;
  function assistTalk(delay = 0) {
    if (!assist) return;
    clearTimeout(assistTimer);
    assistTimer = setTimeout(() => { assist.classList.add("is-talking"); assistTimer = setTimeout(() => assist.classList.remove("is-talking"), 6000); }, delay * 1000);
  }
  document.querySelectorAll(".em-assist__orb").forEach((orb) => orb.addEventListener("click", () => {
    if (assist.classList.contains("is-talking")) assist.classList.remove("is-talking");
    else assistTalk(0);
  }));

  // ── Purple blob inside the glass button: three round lights slowly orbit on a small canvas ──
  const glows = [...document.querySelectorAll(".em-btn__glow, .em-assist__glow")].map((host) => {
    const c = document.createElement("canvas");
    c.width = 120; c.height = 40;
    host.appendChild(c);
    return { c, x: c.getContext("2d"), seed: Math.random() * 10, speed: host.closest(".em-loader") ? 0 : 0.6 };
  });
  let glowCol = null;
  const readGlow = () => {
    const s = getComputedStyle(root);
    glowCol = [s.getPropertyValue("--kf-accent").trim(), s.getPropertyValue("--kf-accent-soft").trim(), s.getPropertyValue("--kf-surface").trim()];
  };
  readGlow();
  new MutationObserver(readGlow).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  if (glows.length) {
    gsap.ticker.add((time) => {
      for (const g of glows) {
        if (!g.c.isConnected || !g.c.offsetParent) continue;
        // The entrance door button glow is drawn once and stops (in the original the screen doesn’t change after the button appears)
        if (!g.speed && g.drawn) continue;
        g.drawn = true;
        const { x } = g;
        x.clearRect(0, 0, 120, 40);
        x.globalAlpha = 0.55;
        for (let i = 0; i < 3; i++) {
          const t = time * g.speed + g.seed + i * 2.1;
          const px = 60 + Math.cos(t) * 40, py = 20 + Math.sin(t * 1.3) * 10;
          const gr = x.createRadialGradient(px, py, 0, px, py, 34);
          gr.addColorStop(0, glowCol[i]);
          gr.addColorStop(1, "transparent");
          x.fillStyle = gr;
          x.fillRect(0, 0, 120, 40);
        }
      }
    });
  }

  // ── Text line mask split: words stay intact, one mask per line ──
  Em.lines = (el) => {
    if (el._lines) return el._lines;
    const s = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "em-line" });
    el._lines = s.lines;
    return s.lines;
  };

  // ── Story screen: text enters per scene (line yPercent 100→0), and when the next scene arrives it blurs and leaves ──
  Em.story = (section, screens, keys) => {
    const els = screens.map((s) => section.querySelector(s.sel));
    let active = -1;
    const show = (i) => {
      if (i === active) return;
      els.forEach((el, k) => {
        if (!el) return;
        const lines = el.querySelectorAll("[data-split]");
        if (k === i) {
          gsap.killTweensOf(el);
          gsap.set(el, { autoAlpha: 1, pointerEvents: "auto" });
          lines.forEach((ln) => {
            const L = Em.lines(ln);
            gsap.fromTo(L, { yPercent: 105 }, { yPercent: 0, duration: reduce ? 0 : 1.1, ease: "expo.out", stagger: 0.08, overwrite: true });
          });
          const pill = el.querySelector(".em-pill");
          if (pill) gsap.fromTo(pill, { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: "back.out(1.7)", transformOrigin: "left center" });
          const arrow = el.querySelectorAll(".em-arrow");
          if (arrow.length) gsap.fromTo(arrow, { x: -40 }, { x: 0, duration: reduce ? 0 : 1.2, ease: "expoScale(8,2,power1.inOut)" });
          const small = el.querySelectorAll("[data-fade]");
          if (small.length) gsap.fromTo(small, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.8, delay: 0.25, ease: "power2.out" });
        } else if (k === active) {
          gsap.to(el, { autoAlpha: 0, duration: reduce ? 0 : 0.45, ease: "power2.in", pointerEvents: "none" });
        } else gsap.set(el, { autoAlpha: 0, pointerEvents: "none" });
      });
      active = i;
    };
    if (window.EmWorld?.ready && keys) EmWorld.path(keys);
    const pick = (p) => screens.findIndex((s) => p >= s.from && p < s.to);
    ScrollTrigger.create({
      trigger: section, start: "top top", end: "bottom bottom",
      onUpdate: (st) => {
        window.EmWorld?.progress(st.progress);
        if (Em.entered) { const i = pick(st.progress); show(i < 0 ? screens.length - 1 : i); }
      },
    });
    gsap.set(els.slice(1), { autoAlpha: 0 });
    Em.onEnter.push(() => show(Math.max(0, pick(0))));
  };

  // ── World cover: entering a light section covers the world in the background color ──
  Em.veil = (trigger, start, end, from, to) => {
    if (!window.EmWorld?.ready) return;
    const o = { v: from };
    ScrollTrigger.create({ trigger, start, end, scrub: true, onUpdate: (st) => { o.v = from + (to - from) * st.progress; EmWorld.veil(o.v); } });
  };

  // ── Next page strip: a panel opens from below (clip-path), the ring fills, and on reaching the end it moves to the next page ──
  const next = document.querySelector(".em-next");
  if (next) {
    const pin = next.querySelector(".em-next__pin"), bar = next.querySelector(".em-next__bar");
    let gone = false;
    gsap.set(pin, { clipPath: "inset(100% 0px 0px 0px)" });
    ScrollTrigger.create({
      trigger: next, start: "top bottom", end: "bottom bottom", scrub: true,
      onUpdate: (st) => {
        const h = pin.offsetHeight, g = st.progress;
        gsap.set(pin, { clipPath: `inset(${h * (1 - g)}px 0px 0px 0px)` });
        bar.style.strokeDashoffset = String(100 - g * 100);
        if ("world" in next.dataset) window.EmWorld?.veil(1 - g);
        if (g >= 0.999 && !gone && Em.entered && !Em.probe) {
          gone = true;
          Em.go(next.dataset.href);
        }
      },
    });
  }

  // ── Page transition: a curtain covers with the background color, then moves on ──
  const veilEl = document.querySelector(".em-veil");
  Em.go = (href) => {
    if (!href) return;
    if (reduce || !veilEl) return (location.href = href);
    sessionStorage.setItem("em-veil", "1");
    gsap.to(veilEl, { opacity: 1, duration: 0.6, ease: "power2.inOut", onComplete: () => (location.href = href) });
  };
  // The curtain lifts only when arriving from our own pages — on a fresh open the page stands without a curtain
  if (veilEl && sessionStorage.getItem("em-veil") === "1") {
    sessionStorage.removeItem("em-veil");
    gsap.fromTo(veilEl, { opacity: 1 }, { opacity: 0, duration: reduce ? 0 : 0.6, ease: "power2.out" });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || e.metaKey || e.ctrlKey || a.getAttribute("href").startsWith("#") || /^https?:|^mailto:/.test(a.getAttribute("href"))) return;
    e.preventDefault();
    Em.go(a.getAttribute("href"));
  });
  // So an automated measuring tool scrolling to the end doesn’t advance to the next section (human hands unaffected)
  Em.probe = navigator.webdriver === true;

  // ── Footer email copy ──
  document.querySelectorAll(".em-email").forEach((box) => {
    box.querySelector(".em-email__copy")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(box.querySelector(".em-email__link").textContent.trim()).catch(() => {});
      box.classList.add("is-copied");
      setTimeout(() => box.classList.remove("is-copied"), 1600);
    });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
