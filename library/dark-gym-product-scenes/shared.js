// Motion spanning several pages — smooth scroll, color-fill text, text scramble, sound button, section clock, door-closing page transition
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* Smooth scroll — original Lenis 1.3.26, lerp .09. Paused while the hero intro plays */
  if (!reduce && window.Lenis && hasGsap) {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
    if (root.classList.contains("is-intro")) {
      lenis.stop();
      new MutationObserver((_, mo) => {
        if (!root.classList.contains("is-intro")) { lenis.start(); mo.disconnect(); }
      }).observe(root, { attributes: true, attributeFilter: ["class"] });
    }
  }

  /* Text scramble — letters settle into place from the front by 1-(1-t)², the remaining cells change symbols at 30fps */
  const CHARS = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]*+=-";
  const cancelScramble = (el) => { if (el.__scr) cancelAnimationFrame(el.__scr); el.__scr = 0; };
  function scramble(el, text, opt = {}) {
    if (!el) return;
    const target = text ?? el.textContent;
    const dur = Math.max(0.05, opt.duration ?? 0.7) * 1000;
    const frame = 1000 / (opt.fps ?? 30);
    cancelScramble(el);
    if (reduce) { el.textContent = target; return; }
    const t0 = performance.now();
    let last = -1, noise = [];
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const fixed = Math.floor((1 - Math.pow(1 - k, 2)) * target.length);
      if (now - last >= frame || !noise.length) {
        last = now;
        noise = Array.from(target, (c) => (/\s/.test(c) ? c : CHARS[(Math.random() * CHARS.length) | 0]));
      }
      let s = "";
      for (let i = 0; i < target.length; i++) s += i < fixed ? target[i] : noise[i];
      el.textContent = s;
      if (k < 1) { el.__scr = requestAnimationFrame(step); return; }
      el.textContent = target;
      el.__scr = 0;
      opt.onComplete?.();
    };
    el.__scr = requestAnimationFrame(step);
  }
  window.siteScramble = { in: scramble, cancel: cancelScramble };

  /* Color fill — runs through the band per .cf-seg (or per line if there is none). Default 1.4s power1.inOut, line gap .12s, once when it reaches 75% of the screen */
  function prepFill(scope = document) {
    scope.querySelectorAll("[data-fill]").forEach((el) => {
      if (el.dataset.cfReady) return;
      el.dataset.cfReady = "1";
      const segs = el.querySelectorAll(".cf-seg");
      if (segs.length) {
        segs.forEach((s) => { s.style.setProperty("--final", getComputedStyle(s).color); s.classList.add("cf-line", "cf-line--seg"); });
      } else {
        const c = getComputedStyle(el).color;
        el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((l) => `<span class="cf-line">${l.trim()}</span>`).join("");
        el.querySelectorAll(".cf-line").forEach((l) => l.style.setProperty("--final", c));
      }
    });
  }
  function playFill(el, instant) {
    if (!el) return;
    const lines = el.querySelectorAll(".cf-line");
    if (!lines.length) return;
    if (reduce || !hasGsap || instant) {
      el.dataset.cfPlayed = "1";
      if (hasGsap) gsap.killTweensOf(lines);
      lines.forEach((l) => l.style.setProperty("--p", 100));
      return;
    }
    if (el.dataset.cfPlayed) return;
    el.dataset.cfPlayed = "1";
    const dur = parseFloat(el.dataset.fillDur), stag = parseFloat(el.dataset.fillStagger);
    gsap.set(lines, { "--p": 0 });
    gsap.to(lines, { "--p": 100, ease: "power1.inOut", duration: Number.isFinite(dur) ? dur : 1.4, stagger: Number.isFinite(stag) ? stag : 0.12 });
  }
  window.sitePlayFill = playFill;
  window.sitePrepFill = prepFill;
  const startFills = () => {
    prepFill();
    const all = [...document.querySelectorAll("[data-fill]")];
    if (reduce || !hasGsap) { document.querySelectorAll(".cf-line").forEach((l) => l.style.setProperty("--p", 100)); return; }
    all.forEach((el) => {
      if ("fillManual" in el.dataset) return;
      ScrollTrigger.create({ trigger: el.dataset.fillTrigger || el, start: el.dataset.fillStart || "top 75%", once: true, onEnter: () => playFill(el) });
    });
  };
  (document.fonts?.ready || Promise.resolve()).then(startFills);

  /* Sound button — the original turns on background music and effects. Here only the on look and its memory (sound files are the original’s so they are not included) */
  const snd = document.querySelector("[data-snd]");
  if (snd) {
    const KEY = "site-sound";
    const set = (on) => {
      snd.classList.toggle("snd--on", on);
      snd.classList.toggle("snd--off", !on);
      snd.setAttribute("aria-pressed", String(on));
      snd.setAttribute("aria-label", on ? "Sound Off" : "Sound On");
      try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
    };
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch {}
    // The original starts turned on unless turned off separately (off under reduced motion)
    set(stored ? stored === "on" : !reduce);
    // The hero Scroll Down cue steps aside to the right of the sound button (button width + 1.17em)
    const cue = document.querySelector("[data-cue]");
    const shift = () => { if (!cue) return; const w = snd.getBoundingClientRect().width; if (w) cue.style.setProperty("--cue-shift", `${w + parseFloat(getComputedStyle(cue).fontSize) * 1.166667}px`); };
    shift();
    addEventListener("resize", shift);
    const atTop = () => snd.classList.toggle("snd--hero", scrollY <= 40);
    atTop();
    addEventListener("scroll", atTop, { passive: true });
    snd.addEventListener("click", () => set(!snd.classList.contains("snd--on")));
  }

  /* Door-closing page transition — original values as is (door leaf .8s expo.in, light beam up to .85, text from .78s at .05 intervals .28s) */
  const door = document.querySelector("[data-pt-door]");
  if (door) {
    const q = (s) => door.querySelector(s);
    const leafA = q('[data-pt-leaf="a"]'), leafB = q('[data-pt-leaf="b"]'), light = q("[data-pt-light]"), flood = q("[data-pt-flood]");
    const rims = door.querySelectorAll("[data-pt-rim]"), label = q("[data-pt-label]"), nameEl = q("[data-pt-name]");
    const E = {
      lin: (t) => t, p1in: (t) => t * t, p2in: (t) => t * t * t, p2out: (t) => 1 - (1 - t) ** 3,
      p2io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
      xin: (t) => (t === 0 ? 0 : 2 ** (10 * t - 10)),
      xio: (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (-20 * t + 10)) / 2),
    };
    const run = (tracks, total) => new Promise((res) => {
      const t0 = performance.now();
      const tick = (now) => {
        const t = (now - t0) / 1000;
        for (const k of tracks) {
          if (t < k.at || k.done) continue;
          const p = Math.min(1, (t - k.at) / k.dur);
          k.set(k.from + (k.to - k.from) * k.ease(p));
          if (p >= 1) k.done = true;
        }
        t < total ? requestAnimationFrame(tick) : res();
      };
      requestAnimationFrame(tick);
    });
    const close = (k) => {
      const w = innerWidth, off = (1 - k) * (w / 2 + 2);
      leafA.style.transform = `translateX(${-off}px)`;
      leafB.style.transform = `translateX(${off}px)`;
      const lw = Math.max(0, w * (1 - k));
      light.style.width = lw + "px";
      light.style.transform = `translateX(${-lw / 2}px)`;
    };
    const op = (el) => (v) => { el.style.opacity = v; };
    const rimOp = (v) => rims.forEach((r) => { r.style.opacity = v; });
    let busy = false;
    function leave(href, name) {
      if (busy) return;
      busy = true;
      const go = () => { try { sessionStorage.setItem("site-pt", String(Date.now())); } catch {} location.href = href; };
      const safety = setTimeout(go, 3000);
      const finish = () => { clearTimeout(safety); requestAnimationFrame(() => requestAnimationFrame(go)); };
      nameEl.textContent = "";
      const chars = [...name].map((c) => { const s = document.createElement("span"); s.className = "pt-door__char"; s.textContent = c === " " ? " " : c; nameEl.appendChild(s); return s; });
      label.style.transform = "";
      door.classList.add("is-active");
      if (reduce) {
        label.style.opacity = 1; close(1); door.style.opacity = 0;
        run([{ at: 0, dur: 0.2, ease: E.lin, from: 0, to: 1, set: op(door) }], 0.67).then(finish);
        return;
      }
      op(light)(0); rimOp(0); op(flood)(0); close(0); label.style.opacity = 1; door.style.opacity = "";
      chars.forEach((c) => { c.style.opacity = 0; c.style.transform = "translateY(0.25em)"; });
      const at0 = 0.78, each = 0.05;
      const tracks = [
        { at: 0, dur: 0.8, ease: E.xin, from: 0, to: 1, set: close },
        { at: 0, dur: 0.8, ease: E.p2in, from: 0, to: 0.85, set: op(light) },
        { at: 0.3, dur: 0.5, ease: E.p2in, from: 0, to: 1, set: rimOp },
        { at: 0.8, dur: 0.09, ease: E.p2out, from: 1, to: 0.994, set: close },
        { at: 0.89, dur: 0.16, ease: E.p2in, from: 0.994, to: 1, set: close },
        { at: 0.86, dur: 0.3, ease: E.p1in, from: 0.85, to: 0, set: op(light) },
        { at: 0.86, dur: 0.3, ease: E.p1in, from: 1, to: 0, set: rimOp },
      ];
      chars.forEach((c, i) => tracks.push({ at: at0 + i * each, dur: 0.28, ease: E.p2out, from: 0, to: 1, set: (v) => { c.style.opacity = v; c.style.transform = `translateY(${(1 - v) * 0.25}em)`; } }));
      const out = Math.max(1.16, at0 + (chars.length - 1) * each + 0.28) + 0.12;
      tracks.push({ at: out, dur: 0.3, ease: E.p2in, from: 1, to: 0, set: (v) => { label.style.opacity = v; label.style.transform = `translate(-50%, calc(-50% - ${(1 - v) * 0.3}em))`; } });
      run(tracks, out + 0.42).then(finish);
    }
    function enter() {
      label.style.opacity = 0; nameEl.textContent = "";
      close(1); op(light)(0); rimOp(0); op(flood)(0);
      door.style.opacity = 1;
      door.classList.add("is-active");
      root.classList.remove("pt-in");
      const done = () => { door.classList.remove("is-active"); busy = false; };
      if (reduce) { run([{ at: 0, dur: 0.2, ease: E.lin, from: 1, to: 0, set: op(door) }], 0.2).then(() => { done(); door.style.opacity = ""; }); return; }
      run([
        { at: 0, dur: 0.2, ease: E.p2out, from: 0, to: 1, set: rimOp },
        { at: 0.1, dur: 0.2, ease: E.lin, from: 0, to: 1, set: op(light) },
        { at: 0.12, dur: 1, ease: E.xio, from: 1, to: 0, set: close },
        { at: 0.45, dur: 0.4, ease: E.lin, from: 1, to: 0, set: rimOp },
        { at: 0.4, dur: 0.45, ease: E.p1in, from: 1, to: 0, set: op(light) },
        { at: 0.22, dur: 0.32, ease: E.p2out, from: 0, to: 0.72, set: op(flood) },
        { at: 0.54, dur: 0.75, ease: E.p2io, from: 0.72, to: 0, set: op(flood) },
      ], 1.3).then(done);
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-pt-link]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      leave(url.href, a.dataset.ptName || "Next page");
    });
    if (root.classList.contains("pt-in")) {
      const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
      Promise.race([loaded, new Promise((r) => setTimeout(r, 3500))]).then(() => requestAnimationFrame(enter));
    }
    addEventListener("pageshow", (e) => { if (e.persisted) { door.classList.remove("is-active"); busy = false; } });
  }

  /* Section clock — shrinks from 24→0 seconds from the court section to just before the footer, and the current section name changes in a shuffle (992 and up) */
  const CHAPTERS = [
    { id: "hero", name: "Tip-off" }, { id: "court", name: "On the court" }, { id: "tech", name: "The tech" },
    { id: "team", name: "Branding" }, { id: "testimonials", name: "Testimonials" }, { id: "finale", name: "Get ready" }, { id: "dusk", name: "Final whistle" },
  ];
  const DIGITS = {
    0: "01110100011000110001100011000101110", 1: "00100011000010000100001000010001110", 2: "01110100010000100010001000100011111",
    3: "11110000010000101110000010000111110", 4: "00010001100101010010111110001000010", 5: "11111100001111000001000011000101110",
    6: "00110010001000011110100011000101110", 7: "11111000010001000100010000100001000", 8: "01110100011000101110100011000101110",
    9: "01110100011000101111000010001001100",
  };
  function shotclock() {
    const footBar = document.querySelector(".foot__bar");
    if (!footBar || !document.getElementById("court") || !matchMedia("(min-width: 992px)").matches) return;
    const last = CHAPTERS.length - 1, pad = (n) => String(n).padStart(2, "0");
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const nav = document.createElement("nav");
    nav.className = "shotclock";
    nav.setAttribute("aria-label", "Section list");
    nav.style.setProperty("--sc-name", Math.max(...CHAPTERS.map((c) => c.name.length)));
    const dots = (n) => "<i></i>".repeat(n);
    nav.innerHTML = `
      <ol class="shotclock__log" id="shotclock-log">${CHAPTERS.map((c, i) => `
        <li class="shotclock__entry" style="--i:${last - i}"><a class="shotclock__row" href="#${c.id}" data-sc-go="${i}" tabindex="-1"><b>${pad(i + 1)}</b>${c.name}</a></li>`).join("")}
      </ol>
      <div class="shotclock__face">
        <span class="shotclock__led" aria-hidden="true"><span class="shotclock__digit">${dots(35)}</span><span class="shotclock__point">${dots(7)}</span><span class="shotclock__digit">${dots(35)}</span></span>
        <span class="shotclock__meta"><span class="shotclock__name" data-sc-name></span><span class="shotclock__count" data-sc-count></span></span>
        <button class="shotclock__toggle" type="button" aria-expanded="false" aria-controls="shotclock-log" aria-label="View all sections" data-sc-toggle><span class="shotclock__arrow" aria-hidden="true"></span></button>
        <span class="shotclock__ticks" aria-hidden="true">${Array.from({ length: 24 }, (_, k) => `<i style="--k:${k}"></i>`).join("")}</span>
      </div>`;
    document.body.appendChild(nav);
    const $ = (s) => nav.querySelector(s);
    const face = $(".shotclock__face"), log = $(".shotclock__log"), toggle = $("[data-sc-toggle]");
    const rows = [...nav.querySelectorAll("[data-sc-go]")];
    const [dA, dB] = nav.querySelectorAll(".shotclock__digit");
    const point = $(".shotclock__point"), ticks = [...nav.querySelectorAll(".shotclock__ticks i")];
    const nameEl = $("[data-sc-name]"), countEl = $("[data-sc-count]");
    const g = { tops: [], start: 1, end: 2, max: 1 };
    let state = "init", cur = -1, shown = "", raf = 0, preview = -1, live = 24, val = 24, anim = 0;
    const measure = () => {
      const y = scrollY;
      g.tops = CHAPTERS.map((c) => { const el = document.getElementById(c.id); return el ? el.getBoundingClientRect().top + y : 0; });
      g.max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      g.start = g.tops[1];
      const fb = footBar.getBoundingClientRect().top + y;
      g.end = Math.max(g.start + innerHeight, Math.min(g.max - 1, fb - innerHeight - innerHeight * 0.1));
    };
    const topOf = (i) => (i === last ? g.max : clamp(g.tops[i], 0, g.max));
    const secAt = (y) => 24 * (1 - clamp((y - g.start) / (g.end - g.start)));
    const paint = (el, ch) => [...el.children].forEach((d, k) => d.classList.toggle("is-on", DIGITS[ch][k] === "1"));
    function show(t) {
      val = t;
      const late = t < 5, s = late ? t.toFixed(1) : pad(Math.ceil(t));
      if (s !== shown) { shown = s; paint(dA, s[0]); paint(dB, late ? s[2] : s[1]); point.classList.toggle("is-on", late); }
      nav.classList.toggle("is-late", late);
      const c = Math.ceil(t);
      ticks.forEach((tk, k) => tk.classList.toggle("is-on", k < c));
    }
    const stop = () => { cancelAnimationFrame(anim); anim = 0; };
    function ease(to) {
      stop();
      if (reduce) return show(to);
      const from = val, t0 = performance.now();
      const step = (now) => { const k = Math.min(1, (now - t0) / 380); show(from + (to - from) * (1 - Math.pow(1 - k, 3))); anim = k < 1 ? requestAnimationFrame(step) : 0; };
      anim = requestAnimationFrame(step);
    }
    function label(i, mix) {
      countEl.textContent = `${pad(i + 1)} / ${pad(CHAPTERS.length)}`;
      if (mix && !reduce) return scramble(nameEl, CHAPTERS[i].name, { duration: 0.6 });
      cancelScramble(nameEl);
      nameEl.textContent = CHAPTERS[i].name;
    }
    function setChapter(i) {
      if (i === cur) return;
      const first = cur < 0;
      cur = i;
      if (preview < 0) label(i, !first && state === "live");
      rows.forEach((r) => (+r.dataset.scGo === i ? r.setAttribute("aria-current", "step") : r.removeAttribute("aria-current")));
    }
    function peek(i) { if (i === preview || state !== "live") return; preview = i; nav.classList.add("is-preview"); label(i, true); ease(secAt(topOf(i))); }
    function unpeek() { if (preview < 0) return; preview = -1; nav.classList.remove("is-preview"); if (state !== "live") return stop(); label(cur, true); ease(live); }
    function setState(s) {
      if (s === state) return;
      const prev = state;
      state = s;
      clearTimeout(nav.__buzz);
      nav.classList.remove("is-boot", "is-buzz");
      if (s === "live") { nav.classList.add("is-on"); nav.removeAttribute("aria-hidden"); nav.inert = false; if (!reduce) { void nav.offsetWidth; nav.classList.add("is-boot"); } return; }
      open(false);
      nav.setAttribute("aria-hidden", "true");
      nav.inert = true;
      if (s === "buzz" && prev === "live" && !reduce) {
        show(0);
        nav.classList.add("is-buzz");
        nav.__buzz = setTimeout(() => nav.classList.remove("is-on", "is-buzz"), 1150);
      } else nav.classList.remove("is-on");
    }
    function update() {
      raf = 0;
      const y = window.lenis ? window.lenis.scroll : scrollY, probe = y + innerHeight * 0.4;
      let i = 0;
      g.tops.forEach((t, k) => { if (probe >= t) i = k; });
      if (y >= g.max - 2) i = last;
      if (y < g.start) return setState("off");
      if (y >= g.end) return setState(state === "live" || state === "buzz" ? "buzz" : "off");
      setState("live");
      setChapter(i);
      live = secAt(y);
      if (preview < 0) { stop(); show(live); }
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    function open(on) {
      nav.classList.toggle("is-open", on);
      toggle.setAttribute("aria-expanded", String(on));
      rows.forEach((r) => r.setAttribute("tabindex", on ? "0" : "-1"));
      if (!on) unpeek();
    }
    face.addEventListener("click", () => open(!nav.classList.contains("is-open")));
    const rowOf = (e) => e.target.closest("[data-sc-go]");
    log.addEventListener("pointerover", (e) => { if (e.pointerType !== "touch" && rowOf(e)) peek(+rowOf(e).dataset.scGo); });
    log.addEventListener("pointerleave", unpeek);
    log.addEventListener("focusin", (e) => { if (rowOf(e)) peek(+rowOf(e).dataset.scGo); });
    log.addEventListener("focusout", (e) => { if (!log.contains(e.relatedTarget)) unpeek(); });
    nav.addEventListener("keydown", (e) => { if (e.key === "Escape") { open(false); toggle.focus(); } });
    document.addEventListener("click", (e) => { if (!nav.contains(e.target)) open(false); });
    nav.addEventListener("click", (e) => {
      const r = rowOf(e);
      if (!r) return;
      e.preventDefault();
      open(false);
      const to = topOf(+r.dataset.scGo);
      if (window.lenis) window.lenis.scrollTo(to, reduce ? { immediate: true, force: true } : { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4), force: true });
      else scrollTo({ top: to, behavior: reduce ? "auto" : "smooth" });
    });
    if (hasGsap) ScrollTrigger.create({ trigger: "#finale", start: "top 8%", endTrigger: "#dusk", end: "top 80%", toggleClass: { targets: nav, className: "shotclock--ink" } });
    measure(); setState("off"); update();
    window.lenis?.on("scroll", queue);
    addEventListener("scroll", queue, { passive: true });
    let rt = 0;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { measure(); update(); }, 150); });
    if (hasGsap) ScrollTrigger.addEventListener("refresh", () => { measure(); update(); });
  }
  const whenLoaded = (fn) => (document.readyState === "complete" ? setTimeout(fn, 0) : addEventListener("load", fn, { once: true }));
  // The original loads the section clock only on first scroll
  whenLoaded(() => {
    const go = () => { removeEventListener("scroll", go); shotclock(); };
    if (scrollY > 0) go(); else addEventListener("scroll", go, { passive: true });
  });
})();

// Cookie consent card — not shown again after a choice (this copy uses no cookies, so only the chosen value is remembered)
(() => {
  const cc = document.querySelector("[data-cc]");
  if (!cc) return;
  let chosen = null;
  try { chosen = localStorage.getItem("site-cc"); } catch {}
  if (chosen) { cc.remove(); return; }
  cc.classList.add("is-before");
  requestAnimationFrame(() => requestAnimationFrame(() => cc.classList.remove("is-before")));
  cc.querySelectorAll("[data-cc-choice]").forEach((b) => b.addEventListener("click", () => {
    try { localStorage.setItem("site-cc", b.dataset.ccChoice); } catch {}
    cc.classList.add("is-gone");
    // As in the original, removed from layout (display none) after fading out going down
    setTimeout(() => { cc.hidden = true; }, 560);
  }));
})();

// Pause motion — stops infinite loops (CSS · web animations) and video, and changes the button label. Press again to resume
(() => {
  const toggles = [...document.querySelectorAll("[data-motion-toggle]")];
  if (!toggles.length) return;
  const held = new Set();
  const loops = () => (document.getAnimations?.() || []).filter((a) => a.effect?.getComputedTiming?.().iterations === Infinity);
  const set = (paused, save) => {
    document.documentElement.classList.toggle("is-motion-paused", paused);
    toggles.forEach((t) => { t.setAttribute("aria-pressed", String(paused)); const l = t.querySelector("[data-motion-label]"); if (l) l.textContent = paused ? "Replay Motion" : "Motion Paused"; });
    if (paused) loops().forEach((a) => { if (a.playState === "running") { a.pause(); held.add(a); } });
    else { held.forEach((a) => { try { a.play(); } catch {} }); held.clear(); }
    if (save) try { localStorage.setItem("site-motion", paused ? "off" : "on"); } catch {}
  };
  toggles.forEach((t) => t.addEventListener("click", () => set(t.getAttribute("aria-pressed") !== "true", true)));
  let stored = null;
  try { stored = localStorage.getItem("site-motion"); } catch {}
  if (stored === "off") set(true, false);
})();
