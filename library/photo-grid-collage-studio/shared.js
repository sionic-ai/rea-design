/* One set of interaction feel for the whole site — values read from the original scripts.min.js (site module).
   The original bundles @barba/core but never calls init, so pages navigate normally, and only About opens as an overlay panel (pushState) on desktop. */
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const body = document.body, menu = document.querySelector(".menu"), glass = document.querySelector(".overlay-background");
  const about = document.querySelector(".about-overlay"), main = document.querySelector("main");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => innerWidth <= 720;
  window.uu = { reduce, mobile };

  // Don’t open the menu for the first .5s (original c — so the glass layer doesn’t drop right away even if the cursor is on top when the page opens)
  let settling = true, aboutOpen = false;
  setTimeout(() => { settling = false; }, 500);

  /* ── Hidden menu: hovering the top row reveals the menu and the back blurs into a glass layer (blur 30px) in .2s ── */
  const nav = document.querySelector(".menu-nav");
  nav?.addEventListener("mouseenter", () => {
    if (settling || mobile()) return;
    menu.classList.add("menu-shown");
    glass.classList.remove("hidden");
    if (aboutOpen) about?.classList.add("temp-hidden");
  });
  nav?.addEventListener("mouseleave", () => {
    menu.classList.remove("menu-shown");
    if (!settling && !aboutOpen) glass.classList.add("hidden");
    if (aboutOpen) about?.classList.remove("temp-hidden");
  });

  /* ── Photo/video slots: once loaded they fade in over .2s, video plays when it enters the viewport (original top bottom- =200 ~ bottom top+=200) ── */
  const loaded = (root) => requestAnimationFrame(() => requestAnimationFrame(() => root.querySelectorAll(".lazy").forEach((p) => p.classList.add("lazyloaded"))));
  loaded(document);
  document.querySelectorAll(".layout .uu-vid").forEach((v) => {
    const ph = v.querySelector(".uu-video");
    const play = (on) => ph?.classList.toggle("is-playing", on);
    ScrollTrigger.create({ trigger: v, start: "top bottom-=200", end: "bottom top+=200", onEnter: () => play(true), onEnterBack: () => play(true), onLeave: () => play(false), onLeaveBack: () => play(false) });
  });

  /* ── End list: hovering a row fades the other rows to gray, and that work’s cover pops into the fixed slot on the right at .2s ── */
  const items = [...document.querySelectorAll(".index-item")];
  const pid = document.querySelector(".project")?.dataset.id;
  if (pid) items.filter((i) => i.dataset.id === pid).forEach((i) => i.classList.add("visited"));
  items.forEach((it) => {
    it.addEventListener("mouseenter", () => {
      const cover = it.closest(".index")?.querySelector(`.index-cover[data-id="${it.dataset.id}"]`);
      if (!cover) return;
      it.classList.remove("faded");
      items.filter((o) => o !== it && !o.classList.contains("faded")).forEach((o) => o.classList.add("faded"));
      document.querySelectorAll(".index-cover:not(.hidden)").forEach((c) => c.classList.add("hidden"));
      cover.classList.remove("hidden");
      cover.querySelector(".uu-video")?.classList.add("is-playing");
    });
    it.addEventListener("mouseleave", () => {
      items.forEach((o) => o.classList.remove("faded"));
      document.querySelectorAll(".index-cover:not(.hidden)").forEach((c) => { c.classList.add("hidden"); c.querySelector(".uu-video")?.classList.remove("is-playing"); });
    });
  });

  /* ── End-of-About wordmark: on desktop, sticky top is set to window height − wordmark height so it sticks to the bottom of the screen (original m) ── */
  const pinFooter = () => document.querySelectorAll(".about-footer").forEach((f) => {
    const c = f.querySelector(".common-footer");
    mobile() || !c ? f.removeAttribute("style") : (f.style.top = `${innerHeight - c.offsetHeight}px`);
  });
  pinFooter();
  addEventListener("resize", pinFooter);

  /* ── About overlay (desktop): pins the current page in place and opens a difference text overlay on top. Pressing again or going back closes it ── */
  const toAbout = document.querySelector(".to-about");
  let savedY = 0, pushed = false, aboutST = null;
  const setState = (s) => document.querySelectorAll(".about-title-placeholder, .to-about").forEach((e) => e.setAttribute("data-state", s));
  const openAbout = () => {
    savedY = scrollY;
    main.classList.add("fixed");
    main.style.top = `${-savedY}px`;
    about.classList.remove("hide", "temp-hidden");
    menu.classList.remove("menu-shown");
    glass.classList.remove("hidden");
    settling = true; aboutOpen = true;
    scrollTo(0, 0);
    setTimeout(pinFooter);
    try { history.pushState({ template: "about" }, "", toAbout.getAttribute("href")); pushed = true; } catch { pushed = false; }
    // When the about text reaches the top (immediately), the About slot becomes Close — the original is ScrollTrigger once after 100ms
    setTimeout(() => { aboutST = ScrollTrigger.create({ trigger: about.querySelector(".about-layout"), start: "top top", once: true, onEnter: () => setState("close") }); }, 100);
    setTimeout(() => { settling = false; }, 500);
  };
  const closeAbout = () => {
    main.removeAttribute("style");
    main.classList.remove("fixed");
    about.classList.add("hide");
    aboutOpen = false;
    glass.classList.add("hidden");
    menu.classList.remove("menu-shown");
    settling = true;
    aboutST?.kill();
    setState("title");
    setTimeout(() => { settling = false; }, 500);
    setTimeout(() => { scrollTo(0, savedY); ScrollTrigger.refresh(); });
  };
  toAbout?.addEventListener("click", (e) => {
    if (mobile() || !about || document.querySelector('[data-barba-namespace="about"]')) return;
    e.preventDefault();
    if (!aboutOpen) openAbout();
    else if (pushed) history.back();
    else closeAbout();
  });
  addEventListener("popstate", () => { if (aboutOpen) { pushed = false; closeAbout(); } });
  document.querySelectorAll('.menu-nav a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  // Returning via the home·language link skips the loader for this session (original cookie showIntro=false is read by the server, which renders without the cover)
  document.querySelectorAll(".to-home, .lang-switch").forEach((a) => a.addEventListener("click", () => {
    try { sessionStorage.setItem("uu-intro", "off"); } catch {}
  }));

  /* ── Screensaver (desktop): covers the page in .4s after 120 seconds idle, and half-screen pairs of two cells swap every 2 seconds. It lifts at once on movement ── */
  const ss = document.querySelector(".screensaver");
  if (ss) {
    const every = +ss.dataset.delay, idle = +ss.dataset.ssdelay;
    const layouts = [...ss.querySelectorAll(".screensaver-layout")];
    let wait = 0, cycle = 0, on = false;
    const size = () => { ss.querySelector(".width").textContent = innerWidth; ss.querySelector(".height").textContent = innerHeight; };
    const arm = () => {
      clearTimeout(wait);
      wait = setTimeout(() => {
        if (mobile()) return;
        ss.classList.add("temp-shown");
        on = true;
        cycle = setInterval(() => {
          const cur = layouts.findIndex((l) => !l.classList.contains("hide"));
          layouts[cur].classList.add("hide");
          layouts[(cur + 1) % layouts.length].classList.remove("hide");
        }, every);
      }, idle);
    };
    size();
    addEventListener("resize", size);
    arm();
    ["mousemove", "click", "scroll", "touchstart"].forEach((t) => addEventListener(t, () => {
      if (on) { ss.classList.remove("temp-shown"); clearInterval(cycle); on = false; }
      arm();
    }, { passive: true }));
  }
})();
