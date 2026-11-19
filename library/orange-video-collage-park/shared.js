// Motion shared by all sections: Lenis smooth scroll, menu drawer and sound button, page transition fade (.3s), two-layer parallax (outer px · inner ratio),
// Text rise, accordion (.4s power3.out), map section background change, move within the same section (1s power2.inOut), left TOC arrow flip, video sequential loading.
// Section scripts use the ones on window.nk.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => matchMedia("(min-width: 768px)").matches;
  const root = document.documentElement;
  const nk = (window.nk = { reduce, isPc, lenis: null });
  if (!reduce) document.body.classList.add("is-entering");

  const setViewport = () => {
    const bar = innerWidth - root.clientWidth;
    root.style.setProperty("--viewport-width", `${innerWidth - bar}px`);
    root.style.setProperty("--scrollbar-width", `${bar}px`);
    const notice = document.getElementById("nk-notice");
    root.style.setProperty("--site-notice-h", notice ? `${notice.offsetHeight}px` : "0px");
  };
  setViewport();
  addEventListener("resize", setViewport, { passive: true });

  // Only today’s date is filled in for real — the original also inserts the opening day’s date, and temperature/weather come from a weather API so they stay placeholders
  const WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const today = new Date();
  document.querySelectorAll(".nk-weather .date").forEach((el) => {
    el.querySelector(".day").textContent = `${today.getMonth() + 1}.${today.getDate()}`;
    el.querySelector(".weekday").textContent = WEEK[today.getDay()];
  });

  if (!reduce) {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1,
      easing: (t) => 1 - Math.pow(2, -10 * t),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1,
    });
    nk.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Menu drawer
  const header = document.querySelector(".nk-header");
  const menuBtn = header?.querySelector(".nk-header__menu");
  const setOpen = (open) => {
    header.classList.toggle("open", open);
    menuBtn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  };
  menuBtn?.addEventListener("click", () => setOpen(!header.classList.contains("open")));
  header?.querySelector(".nk-header__logo a")?.addEventListener("click", () => setOpen(false));
  addEventListener("close-menu", () => header && setOpen(false));
  addEventListener("keydown", (e) => e.key === "Escape" && header?.classList.contains("open") && setOpen(false));

  // Background sound — on, it fades 0→1 in .6s, off, it fades out in .6s then stops. Across sections it keeps the on state and position
  const FADE = 600, KEY = "nk-bgm";
  const sound = document.querySelector(".nk-header__sound");
  if (sound && window.Howl && !reduce) {
    let pos = 0, playing = false;
    // html5 sound — the original loads via Web Audio, but here it plays through an audio element so it sounds even when opened by file:// (fade in/out length is the same)
    const bgm = new Howl({ src: ["media/bgm-placeholder.mp3"], loop: true, volume: 0, preload: true, html5: true });
    const show = (on) => { sound.classList.toggle("on", on); sound.classList.toggle("off", !on); };
    const start = (at, ms) => { bgm.seek(at); bgm.fade(0, 1, ms); bgm.play(); playing = true; show(true); };
    sound.addEventListener("click", () => {
      if (sound.classList.contains("off")) return start(pos, FADE);
      show(false);
      bgm.fade(1, 0, FADE);
      playing = false;
      setTimeout(() => { if (!playing) { pos = bgm.seek(); bgm.stop(); } }, FADE);
    });
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch {}
    if (saved.playing) {
      pos = Number(saved.position) || 0;
      const go = () => start(pos, 200);
      bgm.state() === "loaded" ? go() : bgm.once("load", go);
    } else show(false);
    addEventListener("pagehide", () => {
      try { sessionStorage.setItem(KEY, JSON.stringify({ playing, position: playing ? bgm.seek() : pos })); } catch {}
    });
    addEventListener("pageshow", (e) => { if (e.persisted && playing && !bgm.playing()) bgm.play(); });
  }

  // Move within the same section — stop Lenis and glide over 1s power2.inOut
  const scrollToEl = (el, offset, done) => {
    nk.lenis?.stop();
    gsap.to(window, {
      scrollTo: { y: el, offsetY: offset },
      duration: reduce ? 0 : 1,
      ease: "power2.inOut",
      onComplete: () => { nk.lenis?.start(); done?.(); },
    });
  };
  nk.scrollToEl = scrollToEl;
  const clean = (p) => p.replace(/\/+$/, "") || "/";
  const here = location.origin + clean(location.pathname);

  // Page transition — going to another section of the same site, the body fades over .3s and then navigates (the arriving page brightens again over .3s)
  if (!reduce) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (clean(url.pathname) === clean(location.pathname) && (url.hash || url.searchParams.has("secid"))) return;
      e.preventDefault();
      document.body.classList.add("is-page-leaving");
      setTimeout(() => { location.href = a.href; }, 300);
    });
    addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("is-page-leaving"); });
  }

  // ?secid= A menu link pointing to a spot in the same section — if the section is the same, it does not transition but closes the drawer and glides to that spot
  document.querySelectorAll("a[href]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const url = new URL(a.href, location.href);
      if (url.origin + clean(url.pathname) !== here) return;
      const id = url.searchParams.get("secid");
      if (!id && url.search !== location.search) return;
      e.preventDefault();
      e.stopPropagation();
      dispatchEvent(new CustomEvent("close-menu"));
      const el = id && document.getElementById(id);
      if (el) scrollToEl(el, isPc() ? 120 : 80, () => history.replaceState(null, "", here));
    });
  });
  document.querySelectorAll(".smooth_scroll").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const href = a.getAttribute("href");
      const el = document.querySelector(href === "#" || !href ? "html" : href);
      if (!el) return;
      let off = isPc() ? 100 : 80;
      if (el.classList.contains("layout")) off -= parseFloat(getComputedStyle(el).paddingTop) || 0;
      scrollToEl(el, off);
    });
  });
  const secid = new URLSearchParams(location.search).get("secid");
  if (secid && document.getElementById(secid)) {
    addEventListener("load", () => scrollToEl(document.getElementById(secid), isPc() ? 120 : 80, () => history.replaceState(null, "", location.pathname)));
  }

  // Two-column contents — on phones the two-line cells fill vertically first (top to bottom, not 1,3,5… left / 2,4,6… right)
  const orderLists = () => {
    document.querySelectorAll(".layout_n").forEach((ul) => {
      const items = ul.querySelectorAll(":scope > li"), n = items.length;
      items.forEach((li, i) => {
        li.style.order = isPc() ? String(i + 1) : String(i % 2 === 0 ? Math.floor(i / 2) + 1 : Math.ceil(n / 2) + Math.floor(i / 2) + 1);
      });
    });
  };
  orderLists();
  addEventListener("resize", () => setTimeout(orderLists, 100));

  // Left table of contents — when that cell’s title passes under the header (173px), the arrow flips up
  if (!reduce) {
    document.querySelectorAll(".nk-lnav a[href^='#']").forEach((a) => {
      const sec = document.getElementById(a.getAttribute("href").slice(1));
      const h2 = sec?.querySelector("h2");
      if (!h2) return;
      ScrollTrigger.create({
        trigger: h2,
        start: "top top+=173",
        onEnter: () => { a.querySelector("svg").style.transform = "rotate(-180deg)"; a.classList.add("passed"); },
        onLeaveBack: () => { a.querySelector("svg").style.transform = "rotate(0deg)"; },
      });
    });
  }

  // Repeating videos are loaded and played one by one starting 1 second later — when the previous video’s first frame arrives, the next is called
  const lazy = [...document.querySelectorAll(".lazy-video")];
  let next = 0;
  const loadNext = () => {
    const v = lazy[next++];
    if (!v) return;
    const src = v.dataset.src;
    if (!src) return loadNext();
    v.addEventListener("loadeddata", () => { v.play().catch(() => {}); loadNext(); }, { once: true });
    v.addEventListener("error", loadNext, { once: true });
    v.src = src;
    v.removeAttribute("data-src");
  };
  if (lazy.length) setTimeout(loadNext, 1000);

  // Two-layer parallax — original formula as is. Inner: (screen center − element center)/(screen height/2) × height × ratio. Outer: ratio of passing through the screen × px
  const sy = () => window.pageYOffset || root.scrollTop;
  nk.startParallax = () => {
    if (reduce) return;
    const inners = document.querySelectorAll("[data-parallax-inner]");
    const wrappers = document.querySelectorAll("[data-parallax-wrapper]");
    let vh = innerHeight;
    const geo = new Map(), shown = new Set(), ready = new Set();
    const measure = () => {
      inners.forEach((el) => {
        const r = el.getBoundingClientRect(), top = r.top + sy(), h = r.height;
        let ratio = parseFloat(el.dataset.parallaxInner) || 0.15;
        if (!isPc()) ratio /= 2;
        geo.set(el, { center: top + h / 2, h, ratio });
      });
      wrappers.forEach((el) => {
        const r = el.getBoundingClientRect(), top = r.top + sy(), h = r.height;
        geo.set(el, { top, bottom: top + h, move: parseFloat(el.dataset.parallaxWrapper) || 0 });
      });
    };
    const applyInner = (el) => {
      const g = geo.get(el);
      if (!g || !ready.has(el)) return;
      const y = ((sy() + vh / 2 - g.center) / (vh / 2)) * (g.h * g.ratio);
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    const applyWrap = (el) => {
      const g = geo.get(el);
      if (!g) return;
      const from = g.top - vh, span = g.bottom - from;
      const p = Math.max(0, Math.min(1, (sy() - from) / span));
      el.style.transform = `translate3d(0, ${p * g.move * (isPc() ? 1 : 0.5)}px, 0)`;
    };
    const apply = (el) => (el.hasAttribute("data-parallax-inner") ? applyInner(el) : applyWrap(el));
    const ioInner = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return shown.delete(e.target);
      shown.add(e.target);
      const v = e.target;
      if (v.tagName !== "VIDEO" || v.readyState >= 1) ready.add(v);
      else v.addEventListener("loadedmetadata", () => { ready.add(v); measure(); if (shown.has(v)) applyInner(v); }, { once: true });
      applyInner(v);
    }), { rootMargin: "50% 0px", threshold: 0 });
    const ioWrap = new IntersectionObserver((es) => es.forEach((e) => {
      e.isIntersecting ? (shown.add(e.target), applyWrap(e.target)) : shown.delete(e.target);
    }), { rootMargin: "100% 0px", threshold: 0 });
    inners.forEach((el) => { el.style.willChange = "transform"; el.style.backfaceVisibility = "hidden"; ioInner.observe(el); });
    wrappers.forEach((el) => { el.style.willChange = "transform"; el.style.backfaceVisibility = "hidden"; ioWrap.observe(el); });
    addEventListener("scroll", () => shown.forEach(apply), { passive: true });
    addEventListener("resize", () => { vh = innerHeight; measure(); shown.forEach(apply); }, { passive: true });
    new ResizeObserver(() => { measure(); shown.forEach(apply); }).observe(document.body);
    measure();
  };

  // Text rise — once within 200px above or below the screen, it rises from 15px below in 1s power2.out
  const copies = document.querySelectorAll(".copy");
  if (copies.length && !reduce) {
    gsap.set(copies, { opacity: 0, y: 15 });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      gsap.to(e.target, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
      io.unobserve(e.target);
    }), { rootMargin: "-200px 0px -200px 0px", threshold: 0.1 });
    copies.forEach((c) => io.observe(c));
  }

  // Open and close windows (map pin · info window) — opacity .2s power2.out
  const modal = (name, open) => {
    const m = document.querySelector(`[data-modal_main="${name}"]`);
    if (m) toggleModal(m, open);
  };
  const toggleModal = (m, open) => {
    if (open) {
      m.classList.add("active");
      m.setAttribute("aria-hidden", "false");
      gsap.fromTo(m, { opacity: 0, display: "block" }, { opacity: 1, ease: "power2.out", duration: 0.2 });
    } else {
      m.setAttribute("aria-hidden", "true");
      gsap.to(m, { opacity: 0, ease: "power2.out", duration: 0.2, onComplete: () => { m.classList.remove("active"); m.style.display = "none"; } });
    }
  };
  nk.toggleModal = toggleModal;
  document.querySelectorAll("[data-modal_open]").forEach((b) => b.addEventListener("click", () => modal(b.dataset.modal_open, true)));
  document.querySelectorAll("[data-modal_close]").forEach((b) => b.addEventListener("click", () => {
    const pin = b.closest("[data-pin-id]");
    pin ? toggleModal(pin, false) : modal(b.dataset.modal_close, false);
  }));
  document.querySelectorAll("[data-modal_main]").forEach((m) => m.querySelector(".bg")?.addEventListener("click", () => toggleModal(m, false)));

  // Accordion — height 0↔auto in .4s power3.out
  document.querySelectorAll("details.nk-details").forEach((d) => {
    const sum = d.querySelector("summary"), body = d.querySelector("summary + *");
    if (!sum || !body) return;
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.classList.contains("opened")) {
        d.classList.remove("opened");
        gsap.to(body, { height: 0, duration: reduce ? 0 : 0.4, ease: "power3.out", overwrite: true, onComplete: () => d.removeAttribute("open") });
      } else {
        d.classList.add("opened");
        d.setAttribute("open", "");
        gsap.fromTo(body, { height: 0 }, { height: "auto", duration: reduce ? 0 : 0.4, ease: "power3.out", overwrite: true });
      }
    });
  });

  // Entering the map section changes the background to apricot over .5s
  document.querySelectorAll(".bg_change").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top center", end: "bottom center", onToggle: (st) => document.body.classList.toggle("bg_change_active", st.isActive) });
  });
})();
