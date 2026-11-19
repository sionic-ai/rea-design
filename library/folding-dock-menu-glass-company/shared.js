/* folding-dock-menu-glass-company shared motion — intro · glass dock · menu panel · glass cursor · button · section transition · end-of-scroll menu.
   The original is Nuxt (Vue transitions) + Lenis 1.3.26 + GSAP. Page transitions are a framework feature, so they were rebuilt with the same order and values (receive the new page and lift it over the old one). */
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = !matchMedia("(pointer: fine)").matches;
  const mobile = () => innerWidth <= 600;
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
  if (touch) html.classList.add("is-touch");

  /* ── Lenis 1.3.26: driven by the gsap clock with lagSmoothing 0. The original scrolls an inner panel, but the copy scrolls the window (gaps) ── */
  const LenisC = window.Lenis;
  const lenis = !reduce && LenisC ? new LenisC({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true }) : null;
  window.fgLenis = lenis;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTop = (immediate) => (lenis ? lenis.scrollTo(0, { immediate: !!immediate, force: true }) : scrollTo(0, 0));

  /* ── Glass cursor: each frame moves .1 of the remaining distance ── */
  const cursor = document.querySelector(".fg-cursor");
  const cursorLabel = cursor?.querySelector(".label");
  let cur = [0, 0], target = [0, 0];
  const setCursor = (visible, label) => {
    if (!cursor || touch) return;
    if (label) cursorLabel.textContent = label;
    cursor.classList.toggle("is-visible", !!visible);
  };
  window.fgSetCursor = setCursor;
  if (cursor && !touch) {
    addEventListener("mousemove", (e) => { target = [e.clientX, e.clientY]; }, { passive: true });
    const raf = () => {
      cur = [cur[0] + (target[0] - cur[0]) * 0.1, cur[1] + (target[1] - cur[1]) * 0.1];
      cursor.style.transform = `translate3d(${cur[0]}px, ${cur[1]}px, 0)`;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest?.("[data-cursor]");
      if (t) setCursor(1, t.dataset.cursor);
    });
    document.addEventListener("mouseout", (e) => {
      const t = e.target.closest?.("[data-cursor]");
      if (t && !t.contains(e.relatedTarget)) setCursor(0);
    });
  }

  /* ── Button: two-line text 1s power3.out, arrow box 0–50% → 50–150%, bent line −100% → 0% ── */
  function bindButtons(root = document) {
    root.querySelectorAll(".fg-btn:not(.is-bound)").forEach((b) => {
      b.classList.add("is-bound");
      const lines = b.querySelectorAll(".label .line");
      const rect = b.querySelector(".arrow rect"), path = b.querySelector(".arrow path");
      b.addEventListener("mouseenter", () => {
        if (touch) return;
        gsap.to(lines, { yPercent: -100, duration: 1, ease: "power3.out" });
        if (rect) gsap.fromTo(rect, { drawSVG: "0% 50%" }, { drawSVG: "50% 150%", duration: 1, overwrite: true, ease: "power3.out" });
        if (path) gsap.fromTo(path, { drawSVG: "-100%" }, { drawSVG: "0%", duration: 1, overwrite: true, ease: "power3.out" });
      });
      b.addEventListener("mouseleave", () => {
        if (touch) return;
        gsap.to(lines, { yPercent: 0, duration: 1, ease: "power3.out" });
        if (rect) gsap.fromTo(rect, { drawSVG: "50% 150%" }, { drawSVG: "0% 50%", duration: 1, overwrite: true, ease: "power3.out" });
        if (path) gsap.fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1, overwrite: true, ease: "power3.out" });
      });
    });
  }

  /* ── Dock and Menu ── */
  const dock = document.querySelector(".fg-dock");
  const dBg = dock.querySelector(".bg"), dMark = dock.querySelector(".mark"), dTitle = dock.querySelector(".title"),
    dInner = dock.querySelector(".title-inner"), dBurger = dock.querySelector(".burger"), dClose = dock.querySelector(".close"), dArrow = dock.querySelector(".arrow-up");
  const menu = document.querySelector(".fg-menu");
  const mHead = menu.querySelector(".head"), mBtn = menu.querySelector(".fg-btn"), mBg = menu.querySelector(".bg");
  let menuOpen = false, titleLoop = null;
  const D = { duration: 0.6, ease: "power3.inOut" };
  function dockOpen(arrow) {
    gsap.timeline({ defaults: D }).to(dBg, { width: "5rem", autoRound: false }, 0).to(dTitle, { yPercent: -100 }, 0)
      .to(dMark, { autoAlpha: 0, duration: 0.3 }, 0).to(dMark, { x: "10rem" }, 0)
      .to(dBurger, { autoAlpha: 0, duration: 0.3 }, 0).to(dBurger, { x: "-10rem" }, 0);
    gsap.timeline({ defaults: D }).fromTo(arrow ? dArrow : dClose, { autoAlpha: 1, yPercent: 100 }, { yPercent: 0 });
  }
  function dockClose() {
    gsap.timeline({ defaults: D }).to(dBg, { width: "27.6rem", autoRound: false }, 0).to(dTitle, { yPercent: 0 }, 0)
      .to(dMark, { x: 0, autoAlpha: 1 }, 0).to([dArrow, dClose], { yPercent: 100 }, 0).to(dBurger, { x: 0, autoAlpha: 1 }, 0);
  }
  function menuEnter() {
    const links = menu.querySelectorAll(".link");
    gsap.set(menu, { autoAlpha: 1 });
    gsap.fromTo(mHead, { autoAlpha: 0 }, { delay: 0.3, autoAlpha: 1, ease: "power3.inOut" });
    gsap.fromTo(links, { yPercent: 150 }, { yPercent: 0, stagger: 0.02, duration: 0.8, ease: "power3.inOut" });
    gsap.fromTo(mBtn, { autoAlpha: 0 }, { delay: 0.3, autoAlpha: 1, ease: "power3.inOut" });
    gsap.fromTo(mBg, { scale: 0 }, { scale: 1, ease: "power3.inOut" });
  }
  function menuLeave() {
    const lines = menu.querySelectorAll(".line"), links = menu.querySelectorAll(".link");
    gsap.set(lines, { yPercent: 0, overwrite: true });
    gsap.to(links, { yPercent: 150, overwrite: true, ease: "power3.out" });
    gsap.to([mHead, mBtn], { autoAlpha: 0, overwrite: true, ease: "power3.out" });
    gsap.to(mBg, { scale: 0, overwrite: true, ease: "power3.inOut", onComplete: () => { if (!menuOpen) gsap.set(menu, { autoAlpha: 0 }); } });
  }
  function setMenu(open, arrow) {
    if (open === menuOpen) return;
    menuOpen = open;
    html.classList.toggle("menu-open", open);
    if (open) { dockOpen(arrow); menuEnter(); titleLoop?.pause(); } else { dockClose(); menuLeave(); titleLoop?.resume(); }
  }
  window.fgSetMenu = setMenu;
  dTitle.addEventListener("click", () => setMenu(true));
  dBurger.addEventListener("click", () => setMenu(true));
  dClose.addEventListener("click", () => setMenu(false));
  dArrow.addEventListener("click", () => (lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: "smooth" })));
  document.addEventListener("click", (e) => { if (menuOpen && !e.target.closest(".fg-menu, .fg-dock")) setMenu(false); });
  // Big link: two lines move up by one slot
  menu.querySelectorAll(".main .link").forEach((a) => {
    a.addEventListener("mouseenter", () => { if (!touch) gsap.to(a.children, { yPercent: -100, ease: "power3.out" }); });
    a.addEventListener("mouseleave", () => { if (!touch) gsap.to(a.children, { yPercent: 0, ease: "power3.out" }); });
  });
  gsap.set([dArrow, dClose], { yPercent: 100 });
  gsap.set(menu, { autoAlpha: 0 });

  // Dock title: when it changes, the old one exits upward (.6 power3.in) and the new one rises from below (.6 power3.out). If it overflows, it shuttles back and forth at px/15 seconds
  function fitTitle() {
    titleLoop?.kill(); titleLoop = null;
    gsap.set(dInner, { x: 0 });
    const over = dInner.scrollWidth - dTitle.clientWidth;
    if (over > 0) titleLoop = gsap.to(dInner, { x: -over, duration: over / 15, ease: "linear", yoyo: true, repeat: -1 });
  }
  function setTitle(t, instant) {
    if (instant) { dInner.textContent = t; fitTitle(); return; }
    gsap.timeline().to(dTitle, { yPercent: -100, duration: 0.6, ease: "power3.in", onComplete: () => { dInner.textContent = t; fitTitle(); } })
      .set(dTitle, { yPercent: 100 }).to(dTitle, { yPercent: 0, duration: 0.6, ease: "power3.out" });
  }

  // On reaching the scroll end the menu board opens by itself, shows an up arrow instead of close, and closes when scrolling back up
  let atEnd = false;
  if (lenis) lenis.on("scroll", ({ progress, limit }) => {
    if (!(limit > 0)) return;
    const p = Math.round(progress * 1000) / 1000;
    if (!atEnd && p === 1) { atEnd = true; setMenu(true, true); }
    else if (atEnd && p < 1) { atEnd = false; setMenu(false); }
  });

  /* ── Per-section motion is hooked by the section file via window.fgPage(root). It is cleared on navigation and hooked anew ── */
  let ctx = null;
  function pageInit(root) {
    ctx?.revert();
    ctx = gsap.context(() => {
      bindButtons(root);
      window.fgPage?.(root, { reduce, touch, mobile: mobile(), lenis, setCursor });
    }, root);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  /* ── Intro (first open only): cube 1.5s → symbol · text → first section rises from below ── */
  const intro = document.querySelector(".fg-intro");
  const page0 = document.querySelector("#swup .fg-page");
  function dockEnter(delay) {
    const paths = dBurger.querySelectorAll("path");
    gsap.timeline({ defaults: { delay, duration: 1, ease: "power3.inOut" } })
      .fromTo(dock, { yPercent: 200 }, { yPercent: 0 }, 0)
      .fromTo(dBg, { width: "5rem" }, { width: "27.6rem", autoRound: false }, 0.3)
      .fromTo(dMark, { x: "11.3rem" }, { x: 0 }, 1)
      .fromTo(dTitle, { yPercent: 100 }, { yPercent: 0 }, 1)
      .fromTo(paths, { drawSVG: "0%" }, { drawSVG: "100%", stagger: 0.05 }, 1);
  }
  setTitle(page0.dataset.title || "", true);
  if (intro && !reduce) {
    const logo = intro.querySelector(".logo"), cube = intro.querySelector(".cube"), word = intro.querySelectorAll(".word span"), overlay = intro.querySelector(".overlay");
    const isM = mobile();
    html.classList.add("fg-intro-run");
    lenis?.stop();
    gsap.set(logo, { visibility: "visible" });
    const tl = gsap.timeline({ onComplete: () => { html.classList.remove("fg-intro-run"); html.classList.add("fg-intro-done"); lenis?.start(); ScrollTrigger.refresh(); } });
    tl.set(word, { yPercent: 150 }).set(logo, { xPercent: 41, autoAlpha: 1 }).add(() => cube.classList.add("rotate"), 0);
    tl.fromTo(cube, { yPercent: 100, scale: 0 }, { yPercent: 0, scale: 0.95, duration: 1.5, ease: "power3.inOut" }).add(() => logo.classList.add("mask"), 1.5);
    tl.to(logo, { xPercent: 0, duration: 1, ease: "power3.inOut" }, 1.3).to(cube, { xPercent: 100, yPercent: 50, duration: 1, ease: "power3.inOut" }, "<").to(word, { yPercent: 0, stagger: 0.05, duration: 1, ease: "power3.out" }, "<");
    tl.set(intro, { zIndex: 0 }, 2.2).to(overlay, { opacity: 0.5, duration: 1.2, ease: "power3.inOut" }, 2.2)
      .fromTo(page0, { yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: "power3.inOut" }, 2.2);
    tl.to(logo, { y: -innerHeight / 3, autoAlpha: 0, duration: 1.2, ease: "power3.inOut" }, 2.3);
    tl.fromTo(page0.querySelector("section") || page0, { scale: 1.1 }, { scale: 1, duration: 1.2, ease: "power3.inOut", willChange: "transform" }, 2.6)
      .fromTo(page0, { scale: isM ? 0.9 : 0.8, rotate: 0.01 }, { scale: 1, duration: 1.2, ease: "power3.inOut", willChange: "transform", clearProps: "all" }, "<");
    page0.style.position = "relative"; page0.style.zIndex = "100";
    tl.add(() => { page0.style.zIndex = ""; }, ">");
    dockEnter(3);
  } else {
    html.classList.add("fg-intro-done");
    if (!reduce) dockEnter(0.2);
  }

  /* ── Section swap: the new section is fetched and stacked over the old one — new section yPercent 100→0 (1s) + .8→1 (1s, starting .3s later), old section to .5 over 1.3s ── */
  let busy = false;
  async function go(url, push = true) {
    if (busy) return;
    busy = true;
    setMenu(false);
    setCursor(0);
    let doc;
    try { doc = new DOMParser().parseFromString(await (await fetch(url)).text(), "text/html"); } catch { location.href = url; return; }
    const next = doc.querySelector("#swup .fg-page");
    if (!next) { location.href = url; return; }
    const host = document.querySelector("#swup");
    const old = host.querySelector(".fg-page");
    const y = scrollY;
    old.classList.add("page-leave");
    Object.assign(old.style, { position: "fixed", left: 0, right: 0, top: -y + "px" });
    const fresh = document.importNode(next, true);
    Object.assign(fresh.style, { position: "fixed", inset: 0, zIndex: 3, overflow: "hidden" });
    host.append(fresh);
    document.title = doc.title;
    if (push) history.pushState({ fg: 1 }, "", url);
    setTitle(fresh.dataset.title || "");
    // The original (Vue) is already attached when a new section starts entering and runs its own motion (line letters 1.5s etc.) — we trigger at the same time
    pageInit(fresh);
    const here = new URL(url, location.href).pathname.split("/").pop();
    menu.querySelectorAll(".main .item").forEach((it) => it.classList.toggle("is-active", it.querySelector("a").getAttribute("href") === here));
    const done = () => {
      old.remove();
      fresh.removeAttribute("style");
      scrollTop(true);
      ScrollTrigger.refresh();
      busy = false;
    };
    if (reduce) { gsap.set(old, { autoAlpha: 0.5 }); return done(); }
    gsap.to(old, { duration: 1.3, autoAlpha: 0.5 });
    gsap.fromTo(fresh, { yPercent: 100 }, { yPercent: 0, duration: 1, ease: "power3.inOut" });
    gsap.fromTo(fresh, { scale: mobile() ? 0.9 : 0.8, rotate: 0.01 }, { scale: 1, delay: 0.3, duration: 1, ease: "power3.inOut", willChange: "transform", clearProps: "transform,willChange", onComplete: done });
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || a.hasAttribute("data-no-swup") || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!/\.html(\?|#|$)/.test(href)) return;
    e.preventDefault();
    if (new URL(a.href).pathname === location.pathname) { setMenu(false); return lenis ? lenis.scrollTo(0) : scrollTo(0, 0); }
    go(a.href);
  });
  addEventListener("popstate", () => go(location.href, false));

  // Video window: clicking the backdrop opens it in .5s and plays, closing it stops playback
  const player = document.querySelector(".fg-player");
  if (player) {
    const pv = player.querySelector("video");
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-player]")) return;
      setCursor(0);
      lenis?.stop();
      gsap.fromTo(player, { autoAlpha: 0 }, { autoAlpha: 1 });
      pv.play().catch(() => {});
    });
    player.querySelector(".close").addEventListener("click", () => gsap.to(player, { autoAlpha: 0, onComplete: () => { pv.pause(); lenis?.start(); } }));
  }

  // Cookie window
  const cookies = document.querySelector(".fg-cookies");
  if (cookies) {
    gsap.to(cookies, { autoAlpha: 1, delay: reduce ? 0 : 5 });
    cookies.querySelectorAll(".fg-btn").forEach((b) => b.addEventListener("click", () => gsap.to(cookies, { autoAlpha: 0, overwrite: true })));
  }

  bindButtons(document);
  pageInit(page0);
})();
