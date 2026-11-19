// Motion shared by all pages — logo window loader, header bar hide, menu, search, cursor tag, cookie strip, video window, page transition, footer, text line entrance
// Scrolling is Locomotive Scroll 5 (Lenis inside) like the original, with lerp .125 · wheel .75, progress (--progress) and is-inview are also attached by Locomotive.
(() => {
  const D = document, H = D.documentElement;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  const E = {
    fe: CustomEase.create("p-fe", "0.19,1,0.22,1"),
    z: CustomEase.create("p-z", "0.14,1,0.34,1"),
    yk: CustomEase.create("p-yk", "0.4,0,0,1"),
    vt: CustomEase.create("p-vt", "0.39,0.575,0.565,1"),
    am: CustomEase.create("p-am", "0.7,0,0.3,1"),
  };
  gsap.defaults({ ease: "none" });
  gsap.ticker.lagSmoothing(0);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => innerWidth <= 768;
  const hover = matchMedia("(hover: hover)").matches;
  const wait = (s) => new Promise((r) => gsap.delayedCall(s, r));
  const page = D.body.dataset.page || "index";
  const TONES = { index: "dark", works: "dark", cases: "dark", news: "light", article: "light" };

  const bus = {};
  const on = (n, f) => (bus[n] = bus[n] || []).push(f);
  const emit = (n, ...a) => (bus[n] || []).forEach((f) => f(...a));
  const site = (window.pSite = { E, reduce, isMobile, on, emit, wait, loco: null });

  // ───── Scroll ─────
  const loco = (site.loco = new LocomotiveScroll({
    autoStart: false,
    lenisOptions: { lerp: 0.125, wheelMultiplier: 0.75, touchMultiplier: 0.75 },
    initCustomTicker: (f) => gsap.ticker.add(f),
    destroyCustomTicker: (f) => gsap.ticker.remove(f),
  }));
  const lenis = () => loco.lenisInstance;
  lenis()?.on("scroll", ScrollTrigger.update);
  history.scrollRestoration = "manual";
  scrollTo(0, 0);

  // ───── Line entrance (original TextReveal) — split into lines after the fonts have fully loaded ─────
  const splitLines = (el) =>
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "p-line",
      autoSplit: true,
      onSplit(self) {
        self.lines.forEach((l, i) => l.style.setProperty("--index", i));
      },
    });
  // Per-letter fading hover (original HoverText): 0.4 ↔ 1, expo.out 1.2s, spread across .25s from the front
  const charHover = (el, target = el) => {
    const s = SplitText.create(target, { type: "chars", charsClass: "p-char" });
    const go = (o) => gsap.to(s.chars, { opacity: o, ease: "expo.out", duration: 1.2, stagger: { from: "start", amount: 0.25 }, overwrite: true });
    el.addEventListener("mouseenter", () => go(0.4));
    el.addEventListener("mouseleave", () => go(1));
  };
  site.charHover = charHover;

  // ───── Headline row ─────
  const nav = D.querySelector(".p-nav");
  const navLogo = nav?.querySelector(".p-nav__logo .p-mask__in");
  const navBtns = nav ? [...nav.querySelectorAll("button .p-mask__in")] : [];
  const navIn = () => {
    gsap.set(nav, { yPercent: 0 });
    gsap.fromTo(navLogo, { yPercent: 150 }, { yPercent: 0, duration: 1.5, ease: E.fe, overwrite: true });
    gsap.fromTo(navBtns, { yPercent: 150 }, { yPercent: 0, duration: 1.5, delay: 0.1, stagger: 0.1, ease: E.fe, overwrite: true });
  };
  const navOut = () => {
    gsap.to(navLogo, { yPercent: -150, duration: 1, ease: E.fe });
    gsap.to(navBtns, { yPercent: -150, duration: 1, ease: E.fe });
  };
  let navHidden = false, navBg = false, atFooter = false, leaving = false;
  const navHide = () => gsap.to(nav, { yPercent: -100, duration: 0.7, ease: E.fe });
  const navShow = () => gsap.to(nav, { yPercent: 0, duration: 0.7, ease: E.fe });
  const setBg = (b) => { navBg = b; nav?.classList.toggle("has-bg", b); };
  lenis()?.on("scroll", (e) => {
    if (leaving || !nav) return;
    if (e.direction === 1 && e.scroll > 50 && !navHidden && !atFooter) { navHide(); navHidden = true; }
    else if (e.direction === -1 && navHidden) { navShow(); navHidden = false; }
    if (e.scroll <= 0) { setBg(false); if (navHidden) { navShow(); navHidden = false; } }
    else if (e.direction === -1 && e.scroll > 0 && !navBg) setBg(true);
  });
  // Over the black first section (video) of a light page, make header line text light
  const darkHeads = [...D.querySelectorAll("[data-nav-dark]")];
  if (nav && darkHeads.length) {
    darkHeads.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom top", onToggle: (st) => nav.classList.toggle("on-dark", st.isActive) }));
  }
  let lastP = -1;
  addEventListener("footerProgress", (ev) => {
    const p = Math.round(ev.detail.progress * 10) / 10;
    if (p >= 0.5 && lastP < 0.5) { atFooter = true; if (navHidden) { navShow(); setBg(true); navHidden = false; } }
    else if (p < 0.5 && lastP >= 0.5) atFooter = false;
    lastP = p;
  });

  // ───── Menu panel ─────
  const menu = D.querySelector(".p-menu");
  let menuTl;
  const mq = (s) => (menu ? [...menu.querySelectorAll(s)] : []);
  const menuParts = () => ({
    inner: menu.querySelector(".p-menu__inner"),
    veil: menu.querySelector(".p-menu__veil"),
    heads: mq(".p-menu__head .p-mask__in"),
    rules: mq(".p-menu__rule"),
    pages: mq(".p-menu__left li .p-mask__in"),
    explore: mq("[data-menu-group=explore] li .p-mask__in"),
    socials: mq("[data-menu-group=socials] li .p-mask__in"),
  });
  const openMenu = () => {
    if (!menu) return;
    const m = menuParts();
    menuTl?.kill();
    menu.querySelector("[data-menu-open]")?.setAttribute("aria-expanded", "true");
    nav.querySelector(".p-nav__menu")?.setAttribute("aria-expanded", "true");
    // Scroll lock (html overflow change) happens on the frame after the panel starts moving — so the pressed frame is not made heavy
    requestAnimationFrame(() => lenis()?.stop());
    menuTl = gsap.timeline({ defaults: { duration: 1.5, ease: E.fe } })
      .set(menu, { display: "block", pointerEvents: "all" })
      .fromTo(m.inner, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.75, ease: E.z }, 0)
      .fromTo(m.veil, { opacity: 0 }, { opacity: 1 }, 0)
      .fromTo(m.heads[0], { yPercent: 150 }, { yPercent: 0 }, 0)
      .fromTo(m.rules[0], { scaleX: 0 }, { scaleX: 1, ease: E.vt, duration: 1 }, 0)
      .fromTo(m.pages, { yPercent: 150 }, { yPercent: 0, stagger: 0.05 }, 0.2)
      .fromTo(m.heads[1], { yPercent: 150 }, { yPercent: 0 }, 0)
      .fromTo(m.rules[1], { scaleX: 0 }, { scaleX: 1, ease: E.vt, duration: 1 }, 0)
      .fromTo(m.explore, { yPercent: 150 }, { yPercent: 0, stagger: 0.05 }, 0.2)
      .fromTo(m.heads[2], { yPercent: 150 }, { yPercent: 0 }, 0.4)
      .fromTo(m.rules[2], { scaleX: 0 }, { scaleX: 1, ease: E.vt, duration: 1 }, 0.4)
      .fromTo(m.socials, { yPercent: 150 }, { yPercent: 0, stagger: 0.05 }, 0.6);
  };
  const closeMenu = (then) => {
    if (!menu || getComputedStyle(menu).display === "none") return then?.();
    const m = menuParts();
    menuTl?.kill();
    nav.querySelector(".p-nav__menu")?.setAttribute("aria-expanded", "false");
    lenis()?.start();
    menuTl = gsap.timeline({ defaults: { duration: 1.25, ease: E.fe }, onComplete: () => { gsap.set(menu, { display: "none" }); then?.(); } })
      .set(menu, { pointerEvents: "none" })
      .fromTo(m.inner, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 101% 0%)", ease: E.z }, 0)
      .to(m.veil, { opacity: 0, duration: 0.75 }, 0)
      .to([...m.heads, ...m.pages, ...m.explore, ...m.socials], { yPercent: -100 }, 0)
      .to(m.rules, { scaleX: 0 }, 0);
  };
  if (menu) {
    nav?.querySelector(".p-nav__menu")?.addEventListener("click", openMenu);
    menu.querySelector(".p-menu__veil").addEventListener("click", () => closeMenu());
    menu.querySelector("[data-menu-close]").addEventListener("click", () => closeMenu());
    menu.querySelector("[data-menu-search]")?.addEventListener("click", () => closeMenu(openSearch));
    // Hovering a menu link dims the rest to .4 (.7s expoOut)
    [mq(".p-menu__left a"), mq("[data-menu-group=explore] a"), mq("[data-menu-group=socials] a")].forEach((group) => {
      group.forEach((a, i) => {
        a.addEventListener("mouseenter", () => gsap.to(group.filter((_, j) => j !== i), { opacity: 0.4, duration: 0.7, ease: E.fe, overwrite: true }));
        a.addEventListener("mouseleave", () => gsap.to(group, { opacity: 1, duration: 0.7, ease: E.fe, overwrite: true }));
      });
    });
  }

  // ───── Search panel ─────
  const search = D.querySelector(".p-search");
  let searchTl, searchFull = false;
  const strip = "inset(0% 0% calc(100% - 12.4rem) 0%)";
  function openSearch() {
    if (!search) return;
    const wrap = search.querySelector(".p-search__wrap"), veil = search.querySelector(".p-search__veil");
    const m = isMobile();
    searchTl?.kill();
    lenis()?.stop();
    searchTl = gsap.timeline({ onComplete: () => search.querySelector("input")?.focus() })
      .set(search, { display: "block", pointerEvents: "all" })
      .fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.75, ease: E.z })
      .fromTo(wrap, { clipPath: m ? "inset(0% 0% 100% 0%)" : "inset(0% 0% 100% 0%)" }, { clipPath: m ? "inset(0% 0% 0% 0%)" : strip, ease: E.z, duration: m ? 1.25 : 0.75 }, 0);
  }
  const closeSearch = () => {
    if (!search) return;
    const wrap = search.querySelector(".p-search__wrap"), veil = search.querySelector(".p-search__veil");
    searchTl?.kill();
    lenis()?.start();
    searchTl = gsap.timeline({ defaults: { duration: 0.75, ease: E.z }, onComplete: () => { gsap.set(search, { display: "none" }); input.value = ""; searchFull = false; } })
      .set(search, { pointerEvents: "none" })
      .to(wrap, { clipPath: "inset(0% 0% 101% 0%)" })
      .to(veil, { opacity: 0 }, 0);
  };
  const input = search?.querySelector("input");
  if (search) {
    nav?.querySelector(".p-nav__search")?.addEventListener("click", openSearch);
    search.querySelector("[data-search-close]").addEventListener("click", closeSearch);
    search.querySelector(".p-search__veil").addEventListener("click", closeSearch);
    const wrap = search.querySelector(".p-search__wrap");
    const items = [...search.querySelectorAll(".p-search__list li")];
    input.addEventListener("input", () => {
      const full = input.value.trim() !== "";
      if (isMobile() || full === searchFull) return;
      searchFull = full;
      gsap.to(wrap, { clipPath: full ? "inset(0% 0% calc(0% - 0rem) 0%)" : strip, duration: 1, ease: E.z });
      if (full) gsap.fromTo(items, { opacity: 0, yPercent: 40 }, { opacity: 1, yPercent: 0, duration: 0.7, stagger: 0.05, delay: 0.5, ease: E.vt, overwrite: true });
    });
    search.querySelectorAll(".p-search__head ul button").forEach((b, _, all) =>
      b.addEventListener("click", () => all.forEach((x) => x.classList.toggle("is-active", x === b))));
  }
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMenu(); closeSearch(); closeVideo(); } });

  // ───── Cursor tag — follows the mouse with .6s expoOut ─────
  const cursor = D.querySelector(".p-cursor");
  if (cursor && hover) {
    const dot = cursor.querySelector(".p-cursor__dot"), label = cursor.querySelector(".p-cursor__inner");
    const qx = gsap.quickTo(dot, "x", { duration: 0.6, ease: E.fe }), qy = gsap.quickTo(dot, "y", { duration: 0.6, ease: E.fe });
    addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); });
    D.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => { label.textContent = el.dataset.cursor; cursor.classList.add("is-on"); });
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    });
  }

  // ───── Cookie strip ─────
  const cookie = D.querySelector(".p-cookie");
  if (cookie) {
    if (sessionStorage.getItem("p-cookie")) cookie.remove();
    else {
      const content = cookie.querySelector(".p-cookie__content");
      let open = false;
      const toggle = (o) => { open = o; gsap.to(content, { height: o ? "auto" : 0, duration: 1, ease: E.fe }); };
      cookie.querySelectorAll("[data-cookie-manage]").forEach((b) => b.addEventListener("click", () => toggle(!open)));
      cookie.querySelectorAll(".p-cookie__toggle").forEach((t) => t.addEventListener("click", () => t.setAttribute("aria-pressed", String(t.getAttribute("aria-pressed") !== "true"))));
      const done = async () => {
        sessionStorage.setItem("p-cookie", "1");
        if (open) { toggle(false); await wait(0.25); }
        gsap.to(cookie, { height: 0, duration: 1, ease: E.fe, onComplete: () => cookie.remove() });
      };
      cookie.querySelectorAll("[data-cookie-accept], [data-cookie-accept-some], [data-cookie-reject]").forEach((b) => b.addEventListener("click", done));
    }
  }

  // ───── Video window — opens in .6s when a work item is clicked ─────
  const vid = D.querySelector(".p-video");
  let vidTl;
  function openVideo(el) {
    if (!vid) return;
    vid.querySelector("[data-video-brand]").textContent = el.dataset.brand || "Brand Name";
    vid.querySelector("[data-video-title]").textContent = el.dataset.title || "Your work title here";
    vidTl?.kill();
    lenis()?.stop();
    const v = vid.querySelector("video");
    v.currentTime = 0;
    v.play().catch(() => {});
    vidTl = gsap.timeline().set(vid, { display: "block" }).fromTo(vid, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: E.vt });
  }
  function closeVideo() {
    if (!vid || getComputedStyle(vid).display === "none") return;
    const v = vid.querySelector("video");
    v.pause();
    v.muted = true;
    vidTl?.kill();
    lenis()?.start();
    vidTl = gsap.timeline({ defaults: { duration: 0.6, ease: E.vt }, onComplete: () => gsap.set(vid, { display: "none" }) }).to(vid, { opacity: 0 });
  }
  if (vid) {
    const v = vid.querySelector("video"), bar = vid.querySelector(".p-video__progress"), time = vid.querySelector(".p-video__time");
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
    vid.querySelector("[data-video-close]").addEventListener("click", closeVideo);
    const play = vid.querySelector("[data-video-play]"), mute = vid.querySelector("[data-video-mute]");
    play.addEventListener("click", () => (v.paused ? v.play() : v.pause()));
    v.addEventListener("play", () => (play.textContent = "Pause"));
    v.addEventListener("pause", () => (play.textContent = "Play"));
    mute.addEventListener("click", () => { v.muted = !v.muted; mute.textContent = v.muted ? "Sound On" : "Sound Off"; });
    v.addEventListener("timeupdate", () => {
      if (!v.duration) return;
      gsap.set(bar, { scaleX: v.currentTime / v.duration });
      time.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
    });
    vid.querySelector(".p-video__track").addEventListener("click", (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      if (v.duration) v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
    });
    D.querySelectorAll("[data-video]").forEach((el) => {
      el.addEventListener("click", (e) => { e.preventDefault(); openVideo(el); });
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openVideo(el); } });
    });
  }

  // ───── Work video shelf: like the original, only videos near the screen play (playing all at once delays press response by a frame or two) ─────
  const vio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { rootMargin: "25% 0px" });
  D.querySelectorAll("video[data-inview-play]").forEach((v) => vio.observe(v));

  // ───── Work card: hover turns the video on, and hovering ”See more” scales the four small photos on both sides .8→1 ─────
  D.querySelectorAll(".p-card").forEach((card) => {
    const v = card.querySelector("video");
    if (!v || !hover) return;
    card.addEventListener("mouseenter", () => { v.play().catch(() => {}); gsap.set(v, { opacity: 1, overwrite: true }); });
    card.addEventListener("mouseleave", () => { v.pause(); gsap.set(v, { opacity: 0, overwrite: true }); });
  });
  D.querySelectorAll(".p-cards__sub").forEach((sub) => {
    const figs = [...sub.querySelectorAll("figure")].sort((a, b) => +a.dataset.delay - +b.dataset.delay);
    const link = sub.querySelector(".p-cards__center a");
    if (!link) return;
    if (!hover || reduce) { gsap.set(figs, { opacity: 1, scale: 1 }); return; }
    link.addEventListener("mouseenter", () => gsap.fromTo(figs, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: E.fe, stagger: (i, el) => +el.dataset.delay }));
    link.addEventListener("mouseleave", () => gsap.to(figs, { scale: 0.8, opacity: 0, duration: 0.7, ease: E.fe, stagger: (i, el) => +el.dataset.delay, overwrite: true }));
  });

  // ───── Footer: copy email ─────
  D.querySelectorAll("[data-copy]").forEach((b) =>
    b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); } catch (e) { /* Display only when no permission */ }
      const s = b.querySelector(".p-footer__copied");
      s.textContent = "Copied";
      setTimeout(() => (s.textContent = ""), 2000);
    }));

  // ───── Page transition — the next page’s color panel covers from below (1.25s mattEasing) and the current page rises 25vh ─────
  const slide = D.querySelector(".p-slide"), shade = D.querySelector(".p-shade");
  const leave = (href) => {
    const name = href.replace(/\.html.*$/, "") || "index";
    const tone = TONES[name] || "dark";
    leaving = true;
    H.classList.add("transitioning");
    H.classList.remove("visible");
    navOut();
    slide.classList.toggle("is-light", tone === "light");
    sessionStorage.setItem("p-arrive", "1");
    if (reduce) return void (location.href = href);
    gsap.timeline({ defaults: { ease: E.yk, duration: 1.25 } })
      .set(slide, { yPercent: 100, display: "block", willChange: "transform" })
      .to([".p-page", ".p-menu", ".p-search"], { y: -0.25 * innerHeight })
      .to(shade, { opacity: 1 }, 0)
      .to(slide, { yPercent: 0 }, 0)
      .call(() => (location.href = href), null, "<75%");
  };
  D.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#[\w-]+)?$/.test(href)) return;
    e.preventDefault();
    if (getComputedStyle(menu || D.body).display !== "none" && menu) closeMenu();
    leave(href);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  // ───── Page show ─────
  const showPage = async (first) => {
    H.classList.add("loaded", "visible");
    dispatchEvent(new Event("resize"));
    loco.start();
    const target = location.hash && D.querySelector(location.hash);
    if (target) loco.scrollTo(target, { immediate: true, force: true });
    await wait(0.25);
    emit("showPage", first);
    if (!(first && page === "index")) navIn();
    ScrollTrigger.refresh();
  };

  // Logo window loader — once the font arrives, Loading and 000% rise, hits 100% at 1s, rests 2s, then the curtain’s logo window grows to screen width/10 (phone /6) times
  const runLoader = async () => {
    const L = D.querySelector(".p-loader");
    const lines = [...L.querySelectorAll(".p-mask__in")], num = L.querySelector("[data-loader-num]"), mask = L.querySelector(".p-loader__mask");
    gsap.set(L, { opacity: 1 });
    gsap.set(lines, { y: 0, yPercent: 125 });
    await wait(0.25);
    gsap.to(lines, { yPercent: 0, duration: 1.25, ease: E.fe });
    const n = { v: 0 };
    await new Promise((res) => gsap.to(n, { v: 100, duration: 1, ease: "linear", delay: 0.5, onUpdate: () => (num.textContent = String(Math.round(n.v)).padStart(3, "0") + "%"), onComplete: res }));
    // If the Korean font is late, don’t wait (original timing as is) — if the hero title line doesn’t exist yet, it stands without the line rise
    await Promise.race([fontsP, wait(0.3)]);
    // Like the original, keep the page on from 2s before the curtain lifts — it shows through the logo window (the first page also turns on its text line entrance now)
    H.classList.add("loaded");
    if (page === "index") H.classList.add("visible");
    const depth = isMobile() ? 6 : 10;
    const r = mask.getBoundingClientRect();
    gsap.set(mask, { force3D: false, transformOrigin: `${r.width / 2 + 0.2 * parseFloat(getComputedStyle(H).fontSize)}px ${r.height / 2 - 0.7 * parseFloat(getComputedStyle(H).fontSize)}px` });
    const tl = gsap.timeline({ delay: 2, onComplete: () => gsap.set(L, { display: "none" }) });
    tl.to(lines, { yPercent: -125, duration: 1.25, ease: E.fe }, 0).to(mask, { scale: () => innerWidth / depth, duration: 2, ease: E.yk }, 0.25);
    if (page === "index") {
      const fig = D.querySelector(".p-hero__figure"), title = D.querySelector(".p-hero__title"), tLines = title ? [...title.querySelectorAll(".p-line")] : [], scroll = D.querySelector(".p-hero__scroll");
      tl.fromTo(fig, { scale: 1.3 }, { scale: 1, duration: 1.5, ease: E.yk }, 0.4)
        .fromTo(navLogo, { yPercent: 150 }, { yPercent: 0, duration: 1.5, ease: E.fe }, 0.7)
        .fromTo(navBtns, { yPercent: 150 }, { yPercent: 0, duration: 1.5, delay: 0.1, stagger: 0.1, ease: E.fe }, 0.7)
        .fromTo(tLines, { yPercent: 150 }, { yPercent: 0, duration: 1.5, delay: 0.1, stagger: 0.1, ease: E.fe }, 0.8)
        .to(mask, { opacity: 0, duration: 0.4, ease: E.yk }, 1.8)
        .fromTo(title, { bottom: "6rem" }, { bottom: "50%", duration: 1.25, ease: E.yk }, 2.2)
        .fromTo(nav, { top: () => innerHeight / 2, yPercent: -50 }, { top: 0, yPercent: 0, duration: 1.25, ease: E.yk }, 2.2)
        .fromTo(scroll, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "sine.out" }, 3)
        .call(() => showPage(true), null, 3.2);
    } else tl.call(() => showPage(true), null, 0.6);
  };

  const arrive = H.classList.contains("p-arrive");
  sessionStorage.removeItem("p-arrive");
  // Hero positions — before the loader ends the header bar is centered and hidden, and the first page title sits 6rem below
  if (nav) {
    gsap.set([navLogo, ...navBtns], { yPercent: 150 });
    // GSAP cannot convert svh units, so it jumps at the end — use screen height in px
    if (!arrive && !reduce && page === "index") gsap.set(nav, { top: innerHeight / 2, yPercent: -50 });
  }
  // Start after DOMContentLoaded so page scripts (index.js etc.) listen to split and showPage first
  // Korean fonts load per character chunk, so widths change even after fonts.ready — download all of this page’s glyphs first, then break lines
  const fontsIn = () => {
    const chars = [...new Set(D.body.textContent.replace(/\s/g, ""))].join("");
    const fams = getComputedStyle(D.body).fontFamily.split(",").slice(0, 2).map((f) => f.trim());
    return Promise.all(fams.flatMap((f) => [400, 500, 600, 700].map((w) => D.fonts.load(`${w} 16px ${f}`, chars).catch(() => {})))).then(() => D.fonts.ready);
  };
  // Line splitting waits for all Korean fonts (fontsP), while the loader doesn’t wait and counts as soon as the default font arrives, like the original
  let fontsP;
  const start = () => {
    fontsP = fontsIn().then(() => {
      D.querySelectorAll('[data-anim="text"]').forEach(splitLines);
      D.querySelectorAll("[data-hover=chars]").forEach((el) => charHover(el, el.querySelector(".p-mask__in") || el));
      emit("split");
    });
    D.fonts.ready.then(() => {
      gsap.set(nav, { opacity: 1 });
      if (reduce) {
        D.querySelector(".p-loader")?.remove();
        gsap.set([navLogo, ...navBtns], { yPercent: 0 });
        fontsP.then(() => { H.classList.add("loaded", "visible"); loco.start(); emit("showPage", true); });
        return;
      }
      if (arrive) {
        D.querySelector(".p-loader")?.remove();
        fontsP.then(() => requestAnimationFrame(() => {
          H.classList.remove("transitioning");
          gsap.set(slide, { yPercent: 100, display: "none" });
          showPage(false);
        }));
      } else runLoader();
    });
  };
  D.readyState === "loading" ? D.addEventListener("DOMContentLoaded", start) : start();
})();
