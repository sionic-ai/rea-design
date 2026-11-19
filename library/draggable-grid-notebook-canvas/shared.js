// Doodle loader → first section TOC attaches → (first time only) how-to-browse modal → board unfolds, drawer and mini map come in.
// Note ↔ Story use the same swup 4.8.2 + js plugin as the original: the panel returns to the first position in .6s, the header fades in .4s, then the story slides in from the left half width in .55s
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const phone = matchMedia("(max-width: 767px)");
  const SEEN = "ho-loader-seen", MODAL = "ho-modal-seen";
  const store = {
    get: (k) => { try { return sessionStorage.getItem(k) === "1"; } catch { return false; } },
    set: (k) => { try { sessionStorage.setItem(k, "1"); } catch {} },
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const tween = (target, vars) => new Promise((r) => (reduce.matches ? (gsap.set(target, vars), r()) : gsap.to(target, { ...vars, onComplete: r })));

  // ── Loader: 3.5s or more on first visit, afterwards it lifts right away
  const loaderDone = () => { delete root.dataset.loading; dispatchEvent(new Event("page-loader:done")); };
  // As in the original, 3.5s only when the first page is opened for the first time. Entering straight into a story clears it right away
  const runLoader = () => {
    const home = document.querySelector("#swup")?.dataset.page === "home";
    if (!home || store.get(SEEN) || reduce.matches) return loaderDone();
    store.set(SEEN);
    const t0 = performance.now();
    const finish = () => setTimeout(loaderDone, Math.max(0, 3500 - (performance.now() - t0)));
    document.readyState === "complete" ? finish() : addEventListener("load", finish, { once: true });
  };

  // ── Note board
  const home = () => {
    const wrap = document.querySelector(".ho-home-wrap");
    if (!wrap) return () => {};
    const modal = wrap.querySelector(".ho-modal");
    const drawer = wrap.querySelector(".ho-drawer");
    const btn = wrap.querySelector(".ho-drawer__btn");
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const show = (el) => el.classList.add("is-visible");

    const ready = () => {
      root.classList.add("is-world-ready");
      // Rest .8s after closing a modal so wheel inertia doesn’t make the board jump
      root.classList.add("is-scroll-cooldown");
      later(() => { root.classList.remove("is-scroll-cooldown"); wrap.classList.remove("is-locked"); }, 800);
      root.classList.add("is-minimap-ready");
    };
    const openModal = () => {
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add("is-open"));
      root.classList.add("is-modal-open");
      modal.querySelector(".ho-modal__start")?.focus();
    };
    const closeModal = () => {
      if (!modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open");
      root.classList.remove("is-modal-open");
      store.set(MODAL);
      ready();
    };
    modal?.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });

    const introDone = () => (store.get(MODAL) || !modal ? ready() : openModal());
    // Original intervals: logo .16s · photo .14s · tape .13s · arrow .13s each, .13s between groups, finally the rest of the sections → ends .4s later
    const intro = () => {
      const sec = wrap.querySelector(".ho-mv");
      const pick = (k) => [...sec.querySelectorAll(`[data-mv="${k}"]`)];
      const groups = [[pick("title"), 160], [pick("photo"), 140], [pick("tape"), 130], [pick("other"), 130]];
      const after = [...wrap.querySelectorAll('[data-intro="after-mv"]')];
      const all = [...groups.flatMap(([g]) => g), ...after];
      if (store.get(MODAL) || reduce.matches) { all.forEach(show); return introDone(); }
      let t = 700;
      groups.forEach(([g, step], i) => { if (i) t += 130; g.forEach((el) => { later(() => show(el), t); t += step; }); });
      t += 130;
      later(() => after.forEach(show), t);
      later(introDone, t + 400);
    };
    root.dataset.loading === "true" ? addEventListener("page-loader:done", intro, { once: true }) : intro();

    const setOpen = (open) => {
      drawer.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    };
    const onBtn = () => setOpen(!drawer.classList.contains("is-open"));
    const onPeek = (e) => drawer.classList.toggle("is-peek", e.type === "mouseenter" || e.type === "focus");
    const onMenu = (e) => { if (e.target.closest(".ho-drawer__menu a")) setOpen(false); };
    const onKey = (e) => { if (e.key !== "Escape") return; setOpen(false); closeModal(); };
    btn.addEventListener("click", onBtn);
    ["mouseenter", "mouseleave", "focus", "blur"].forEach((t) => btn.addEventListener(t, onPeek));
    drawer.addEventListener("click", onMenu);
    addEventListener("keydown", onKey);
    return () => { timers.forEach(clearTimeout); removeEventListener("keydown", onKey); root.classList.remove("is-world-ready", "is-minimap-ready", "is-modal-open"); };
  };

  // ── Story: on desktop a thin 6px bar on the right shows scroll progress
  const story = () => {
    const bar = document.getElementById("story-scrollbar");
    const thumb = document.getElementById("story-scrollbar-thumb");
    if (!bar || !thumb || phone.matches) return () => {};
    root.classList.add("is-story-bar");
    let drag = false;
    const paint = () => {
      const max = root.scrollHeight - innerHeight;
      bar.style.display = max > 0 ? "" : "none";
      if (max <= 0) return;
      const h = Math.max((innerHeight / root.scrollHeight) * bar.clientHeight, 24);
      thumb.style.height = `${h}px`;
      thumb.style.top = `${(scrollY / max) * (bar.clientHeight - h)}px`;
    };
    const go = (e) => { const r = bar.getBoundingClientRect(); scrollTo({ top: (Math.min(Math.max(e.clientY - r.top, 0), r.height) / r.height) * (root.scrollHeight - innerHeight) }); };
    const onDown = (e) => { e.preventDefault(); drag = true; thumb.setPointerCapture(e.pointerId); };
    const onMove = (e) => drag && go(e);
    const onUp = () => { drag = false; };
    const onBar = (e) => { if (e.target === bar) go(e); };
    addEventListener("scroll", paint, { passive: true });
    addEventListener("resize", paint);
    thumb.addEventListener("pointerdown", onDown);
    thumb.addEventListener("pointermove", onMove);
    thumb.addEventListener("pointerup", onUp);
    bar.addEventListener("click", onBar);
    paint();
    return () => { root.classList.remove("is-story-bar"); removeEventListener("scroll", paint); removeEventListener("resize", paint); };
  };

  let teardown = () => {};
  const boot = () => {
    teardown();
    const page = document.querySelector("#swup")?.dataset.page;
    root.classList.toggle("ho-home", page === "home");
    root.classList.toggle("ho-story-page", page === "story");
    teardown = page === "home" ? home() : story();
  };

  // ── Flip
  const isStory = (url) => /article\.html/.test(url || "");
  const boardHome = (board) => {
    const s = phone.matches ? 0.8 : 1, vw = innerWidth, vh = innerHeight, W = board.offsetWidth, H = board.offsetHeight;
    gsap.killTweensOf(board);
    return tween(board, { x: vw / 2 - 1649 * s - ((1 - s) * W) / 2, y: vh / 2 - 1215 * s - ((1 - s) * H) / 2, scale: s, duration: 0.6, ease: "power2.out" });
  };
  const out = async (v) => {
    const from = v.from?.url, to = v.to?.url;
    const swup = document.getElementById("swup");
    if (!isStory(from) && isStory(to)) {
      const board = document.querySelector(".ho-board");
      if (board) await boardHome(board);
      const fade = [document.querySelector(".ho-header"), document.querySelector(".ho-minimap"), document.querySelector(".ho-modal")].filter(Boolean);
      return tween(fade.length ? fade : swup, { autoAlpha: 0, duration: 0.4, ease: "power1.out" });
    }
    const content = document.getElementById("story-content");
    if (isStory(from) && content) {
      await tween(document.getElementById("story-scrollbar"), { autoAlpha: 0, duration: 0.1, ease: "power1.out" });
      return tween(content, { xPercent: -50, autoAlpha: 0, duration: 0.55, ease: "power2.inOut" });
    }
    return tween(swup, { autoAlpha: 0, duration: 0.25, ease: "power1.out" });
  };
  const inn = async (v) => {
    const swup = document.getElementById("swup");
    gsap.set(swup, { autoAlpha: 1, clearProps: "opacity,visibility" });
    const content = document.getElementById("story-content");
    if (isStory(v.to?.url) && content) {
      const bar = document.getElementById("story-scrollbar");
      gsap.set(content, { xPercent: -50, autoAlpha: 0 });
      if (bar) gsap.set(bar, { autoAlpha: 0 });
      await tween(content, { xPercent: 0, autoAlpha: 1, duration: 0.55, ease: "power2.inOut", clearProps: "transform,opacity,visibility" });
      if (bar) await tween(bar, { autoAlpha: 1, duration: 0.1, ease: "power1.out", clearProps: "opacity,visibility" });
    }
  };
  const bootSwup = () => {
    if (!/^https?:$/.test(location.protocol) || !window.Swup || !window.SwupJsPlugin) return;
    const plugins = [new SwupJsPlugin({ animations: [{ from: "(.*)", to: "(.*)", out: (done, v) => out(v).then(done), in: (done, v) => inn(v).then(done) }] })];
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ persistAssets: false, awaitAssets: true }));
    const swup = new Swup({ containers: ["#swup"], plugins });
    swup.hooks.on("page:view", boot);
    swup.hooks.on("animation:in:end", () => window.ScrollTrigger?.refresh());
  };

  runLoader();
  boot();
  bootSwup();
})();
