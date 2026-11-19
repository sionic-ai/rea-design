// Shared by all pages — loader (drawing the mark) · Lenis · per-section skin switching · menu drawer · skin picker button · scroll reveal · Splide
// The original moves with class toggles + CSS transitions, not GSAP. Here too the values live in CSS and JS only changes state.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEY = "ff-colortype";
  const isHome = !!document.querySelector("[data-page='home']");

  // The skin choice persists when reopened (original uses a 7-day cookie)
  root.setAttribute("data-colortype", localStorage.getItem(KEY) || "default");
  root.setAttribute("data-coloroverwrite", "");

  let lenis = null;
  const tickers = new Set();
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((t) => {
    const now = t * 1000;
    if (lenis) lenis.raf(now);
    tickers.forEach((fn) => fn(now));
  });
  const scrollTop = () => (lenis ? lenis.scroll : window.scrollY);

  function startLenis() {
    if (reduce || lenis || typeof Lenis === "undefined") return;
    lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      autoRaf: false,
      prevent: (el) => !!(el.closest && (el.closest(".ff-hbg") || el.closest("[data-lenis-prevent]"))),
    });
  }

  // ---------- Loader ----------
  // Draws the mark in 32 frames (45fps, nearly straight curve .25,.25,.75,.75) and shows the word table at frame 30.
  // First page only rests 600ms, wags the tail eight times at 10fps, then clears. Rests 1s before starting.
  function runLoader(done) {
    const box = document.querySelector(".ff-loading");
    const path = box && box.querySelector(".ff-loading__mark path.is-draw");
    if (!box || !path || reduce) { done(); return; }
    const FPS = 45, FRAMES = 32, DELAY = 1000, WAVE_DELAY = 600, WAVE_FPS = 10, DRAW_END = 30;
    const wave = [34, 33, 35, 33, 34, 33, 35, 33];
    const bez = (x1, y1, x2, y2) => (x) => {
      const bx = (s) => 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s;
      const by = (s) => 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s;
      let s = x, lo = 0, hi = 1;
      for (let i = 0; i < 12; i++) { const d = bx(s) - x; if (Math.abs(d) < 1e-7) break; d > 0 ? (hi = s) : (lo = s); s = (lo + hi) / 2; }
      return by(s);
    };
    const ease = bez(0.25, 0.25, 0.75, 0.75);
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    const tail = box.querySelector(".ff-loading__mark .ff-mark");
    let last = -1;
    const show = (f) => {
      if (f === last) return;
      last = f;
      if (f < FRAMES) path.style.strokeDashoffset = String(len * (1 - (f + 1) / FRAMES));
      else {
        // Three tail-wag poses (original frames 34·33·35) — each turns slightly around the end of the mark as its axis
        path.style.strokeDashoffset = "0";
        tail.style.transform = f === 33 ? "rotate(-4deg)" : f === 34 ? "rotate(3deg)" : "rotate(0deg)";
      }
    };
    path.style.strokeDashoffset = String(len);
    const total = (FRAMES / FPS) * 1000;
    let t0 = null, drawEnd = false;
    const step = (now) => {
      if (t0 === null) t0 = now;
      const t = now - t0 - DELAY;
      if (t < 0) { requestAnimationFrame(step); return; }
      const p = Math.min(t / total, 1);
      const f = Math.min(Math.floor(ease(p) * FRAMES), FRAMES - 1);
      show(f);
      if (!drawEnd && f + 1 >= DRAW_END) { drawEnd = true; box.classList.add("is-drawEnd"); }
      if (p < 1) { requestAnimationFrame(step); return; }
      if (!isHome) { show(FRAMES - 1); done(); return; }
      setTimeout(() => {
        let i = 0;
        const next = () => {
          if (i >= wave.length) { show(FRAMES); done(); return; }
          show(wave[i++] - 1);
          setTimeout(next, 1000 / WAVE_FPS);
        };
        next();
      }, WAVE_DELAY);
    };
    requestAnimationFrame(step);
  }

  function boot() {
    const hasLoader = !!document.querySelector(".ff-loading");
    const finish = () => {
      startLenis();
      body.classList.add("is-load");
      root.classList.add("is-load");
    };
    if (!hasLoader) { finish(); return; }
    let drawn = false, loaded = document.readyState === "complete";
    const end = () => {
      if (!drawn || !loaded) return;
      body.classList.add("is-loadingEnd");
      body.style.overflow = "";
      finish();
    };
    body.style.overflow = "hidden";
    setTimeout(() => body.classList.add("is-loadingStart"), 20);
    if (!loaded) addEventListener("load", () => { loaded = true; end(); }, { once: true });
    runLoader(() => { drawn = true; end(); });
  }

  // ---------- Scroll reveal ----------
  // Add is-sa when it overlaps the band excluding 10% at the top and bottom of the screen, remove it when it leaves (is-once stays once added)
  const saEls = [...document.querySelectorAll('[class*="js-sa"]')].filter((el) => !el.classList.contains("js-sa__image"));
  if (reduce) saEls.forEach((el) => el.classList.add("is-sa"));
  else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        e.target.classList.toggle("is-sa", e.isIntersecting);
        e.target.classList.toggle("is-active", e.isIntersecting);
        if (e.isIntersecting && e.target.classList.contains("is-once")) io.unobserve(e.target);
      });
    }, { rootMargin: "-10% 0px -10% 0px", threshold: 0 });
    saEls.forEach((el) => io.observe(el));
  }

  // Progress value — 0 when the element top touches the screen bottom, 1 when the element bottom passes the screen top. CSS sets size·position by this value
  const progEls = [...document.querySelectorAll(".is-progress, .js-sa__image")];
  const measure = new Map();
  const remeasure = () => progEls.forEach((el) => {
    const r = el.getBoundingClientRect();
    const top = r.top + window.scrollY;
    measure.set(el, { top, h: Math.max(1, r.height) });
    el.style.setProperty("--thisHeight", `${r.height}px`);
  });
  if (progEls.length) {
    remeasure();
    const ro = new ResizeObserver(remeasure);
    progEls.forEach((el) => ro.observe(el));
    addEventListener("resize", remeasure);
    tickers.add(() => {
      const st = scrollTop(), vh = innerHeight;
      progEls.forEach((el) => {
        const m = measure.get(el);
        const top = m.top - st;
        const pb = reduce ? 1 : Math.min(1, Math.max(0, (vh - top) / (vh + m.h)));
        const pt = Math.min(1, Math.max(0, -top / m.h));
        const v = Math.round(pb * 1e5) / 1e5;
        if (el._pb !== v) { el._pb = v; el.style.setProperty("--thisProgressBottom", String(v)); }
        const w = Math.round(pt * 1e5) / 1e5;
        if (el._pt !== w) { el._pt = w; el.style.setProperty("--thisProgressTop", String(w)); }
      });
    });
  }

  // ---------- Current section → skin override ----------
  // Of the visible sections, the one whose center is closest to the screen center. Within the top 50px it is the first section, within the bottom 50px it is End. When the footer passes half the screen, the override is released
  const sections = [...document.querySelectorAll("main section[id], .ff-insta[id]")];
  const footer = document.querySelector(".ff-footer");
  let lastId = null, lastColor = null;
  tickers.add(() => {
    const st = scrollTop(), vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    let cur = null, best = Infinity;
    if (st >= max - 50) cur = "End";
    else {
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= vh) continue;
        if (st <= 50) { if (!cur || r.top < best) { best = r.top; cur = s; } continue; }
        const d = Math.abs((r.top + r.bottom) / 2 - vh / 2);
        if (d < best) { best = d; cur = s; }
      }
    }
    const id = cur === "End" ? "End" : cur ? cur.id : "";
    const footerHalf = footer && footer.getBoundingClientRect().top <= vh * 0.5;
    const color = footerHalf || cur === "End" || !cur ? "" : cur.getAttribute("data-color") || "";
    if (id !== lastId) {
      lastId = id;
      if (id) root.setAttribute("data-currentsection", id); else root.removeAttribute("data-currentsection");
      sections.forEach((s) => s.classList.toggle("is-current", s === cur));
    }
    if (color !== lastColor) { lastColor = color; root.setAttribute("data-coloroverwrite", color); }
  });

  // ---------- Menu drawer ----------
  const hbgBtn = document.querySelector(".js-hbg-button");
  const hbg = document.querySelector(".ff-hbg");
  const setMenu = (open) => {
    body.classList.toggle("is-hbgOpen", open);
    if (hbgBtn) hbgBtn.setAttribute("aria-expanded", String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  if (hbgBtn && hbg) {
    hbgBtn.addEventListener("click", (e) => { e.preventDefault(); setMenu(!body.classList.contains("is-hbgOpen")); });
    hbg.addEventListener("click", (e) => { if (!e.target.closest("a, button, input")) setMenu(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  // ---------- Skin picker button ----------
  // Pressing unfolds five chips (.8s), picking a chip changes the whole site skin. Folds back 2 seconds after release
  const picker = document.querySelector(".ff-color");
  if (picker) {
    const list = picker.querySelector(".ff-color__list");
    let timer = 0, hovering = false;
    const touch = matchMedia("(hover: none)").matches;
    const close = () => { picker.classList.remove("is-active"); clearTimeout(timer); };
    const later = () => { clearTimeout(timer); timer = setTimeout(close, 2000); };
    picker.querySelector(".ff-color__wrap").addEventListener("click", (e) => {
      if (e.target.closest(".ff-color__chip")) return;
      e.preventDefault();
      if (picker.classList.contains("is-active")) { close(); return; }
      picker.classList.add("is-active");
      if (touch || !hovering) later();
    });
    if (!touch) {
      list.addEventListener("mouseenter", () => { hovering = true; clearTimeout(timer); });
      list.addEventListener("mouseleave", () => { hovering = false; if (picker.classList.contains("is-active")) later(); });
    }
    picker.querySelectorAll(".ff-color__chip").forEach((chip) => chip.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const c = chip.getAttribute("data-color");
      root.setAttribute("data-colortype", c);
      localStorage.setItem(KEY, c);
      if (touch || !hovering) later();
    }));
    document.addEventListener("click", (e) => { if (picker.classList.contains("is-active") && !picker.contains(e.target)) close(); });
  }

  // ---------- Self-switching hero (original SlideShow — changes every 6s with a 1.8s overlap) ----------
  document.querySelectorAll(".js-slide").forEach((box) => {
    const items = [...box.querySelectorAll(".js-slide__li")];
    if (items.length < 2 || reduce) return;
    const interval = parseInt(box.getAttribute("data-interval"), 10) || 4000;
    let i = 0, timer = 0, visible = false;
    const go = () => {
      items[i].classList.remove("is-active");
      i = (i + 1) % items.length;
      items[i].classList.add("is-active");
      timer = setTimeout(go, interval);
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      clearTimeout(timer);
      if (visible) timer = setTimeout(go, interval);
    }).observe(box);
  });

  // ---------- Splide ----------
  // Same Splide 4.1.4 · AutoScroll 0.5.3 as the original — data-splide options as they are. Pauses when off screen
  const splides = [];
  document.querySelectorAll(".js-splide").forEach((el) => {
    if (typeof Splide === "undefined") return;
    let opt = {};
    try { opt = JSON.parse(el.getAttribute("data-splide") || "{}"); } catch { opt = {}; }
    el.removeAttribute("data-splide");
    if (reduce) opt.autoplay = false;
    // AutoScroll turns on by itself on load — turning it on to flow only while on screen like the original is left to the observer below
    if (opt.autoScroll) opt.autoScroll = { ...opt.autoScroll, autoStart: false };
    const s = new Splide(el, opt);
    const ext = opt.autoScroll && window.splide && window.splide.Extensions ? { AutoScroll: window.splide.Extensions.AutoScroll } : {};
    s.mount(ext);
    splides.push(s);
    // Splide turns auto-advance back on when the mouse leaves the panel (pauseOnHover) — off screen, it stops again as in the original
    let inView = false;
    const auto = () => s.Components.AutoScroll || (opt.autoplay ? s.Components.Autoplay : null);
    s.on("autoplay:play", () => { if (!inView && auto()) auto().pause(); });
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (!auto() || reduce) return;
      inView ? auto().play() : auto().pause();
    }).observe(el);
  });

  // In-page # link — Lenis scrolls .9s (easeInOutQuad) and stops above the target by the header height
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const head = document.querySelector(".ff-header");
      const y = Math.max(0, Math.min(scrollTop() + target.getBoundingClientRect().top - (head ? head.offsetHeight : 0), document.documentElement.scrollHeight - innerHeight));
      if (lenis) lenis.scrollTo(y, { duration: 0.9, easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) });
      else window.scrollTo(0, y);
    });
  });

  window.ffSite = { get lenis() { return lenis; }, tickers };

  gsap.matchMedia().add({ reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) root.classList.add("is-reduce");
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
