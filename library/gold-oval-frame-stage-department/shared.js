/* Shared — original order kept: Lenis (duration 2, autoRaf) wired to ScrollTrigger, when the loading bar fills the curtain lifts after 1s (.5s), and the Hero is set up .8s later.
   The two petal layers follow the mouse at .03x (the back layer at half), and while the top of a dark section touches the top of the screen, the header text flips to white. */
(() => {
  const mqSp = matchMedia("(max-width: 767px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const lenis = window.Lenis && !reduce ? new Lenis({ autoRaf: true, duration: 2 }) : null;
  if (lenis) lenis.on("scroll", ScrollTrigger.update);
  window.bkLenis = lenis;

  // Petals — the original is two images of scattered petals. Scatter them in the same places at a similar size (fixed seed, so the layout is always the same)
  let seed = 9;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  document.querySelectorAll("[data-petals]").forEach((box) => {
    seed = box.classList.contains("bk-petals--2") ? 31 : 9;
    const n = +box.dataset.petals;
    let html = "";
    for (let i = 0; i < n; i++) {
      const edge = rnd() < 0.7;
      const x = edge ? (rnd() < 0.5 ? rnd() * 22 : 78 + rnd() * 22) : 20 + rnd() * 60;
      html += `<i style="--x:${x.toFixed(1)}%;--y:${(rnd() * 96).toFixed(1)}%;--w:${(0.9 + rnd() * 1.9).toFixed(2)}vw;--r:${Math.round(rnd() * 360)}deg;animation-delay:${(-rnd() * 7).toFixed(2)}s"></i>`;
    }
    box.innerHTML = html;
  });

  // Headline flip
  const header = document.querySelector(".bk-header");
  const invert = (on) => header && header.classList.toggle("is-invert", on);
  window.bkInvert = invert;

  // Modal — opening stops Lenis, closing starts it again
  const openModal = (name) => {
    const m = document.querySelector(`.bk-modal[data-modal="${name}"]`);
    if (!m) return null;
    m.classList.add("is-active");
    lenis && lenis.stop();
    return m;
  };
  window.bkOpenModal = openModal;
  document.querySelectorAll(".bk-modal").forEach((m) => {
    const close = () => {
      m.classList.remove("is-active");
      lenis && lenis.start();
      const v = m.querySelector("video");
      if (v) setTimeout(() => { v.pause(); v.currentTime = 0; }, 500);
    };
    m.querySelector(".bk-modal__close").addEventListener("click", close);
    m.addEventListener("click", (e) => { if (e.target === m) close(); });
  });

  // Phone menu
  const menuBtn = document.querySelector(".bk-menu-btn");
  menuBtn && menuBtn.addEventListener("click", () => document.body.classList.toggle("is-menu-open"));
  // Anchor jump — original: the screen sinks to black in .4s, moves over 1.5s easeOutQuart, and lights back up once it arrives (html.is-blackout)
  const quart = (t) => 1 - Math.pow(1 - t, 4);
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      e.preventDefault();
      document.body.classList.remove("is-menu-open");
      const el = id === "#top" ? null : document.querySelector(id);
      const target = el ? el.getBoundingClientRect().top + scrollY : 0;
      if (reduce) { window.scrollTo(0, target); return; }
      document.documentElement.classList.add("is-blackout");
      setTimeout(() => {
        if (lenis) lenis.scrollTo(target, { duration: 1.5, easing: quart, force: true });
        else window.scrollTo(0, target);
        setTimeout(() => document.documentElement.classList.remove("is-blackout"), 1500);
      }, 400);
    }),
  );

  // Loading
  const loading = document.querySelector(".bk-loading");
  const bar = loading && loading.querySelector("i");
  const ready = () => {
    if (bar) bar.style.transform = "translate3d(0%, 0, 0)";
    setTimeout(() => {
      loading && loading.classList.add("is-loaded");
      setTimeout(() => document.dispatchEvent(new CustomEvent("bk:loaded")), 800);
    }, 1000);
  };
  if (bar) bar.style.transform = "translate3d(-40%, 0, 0)";
  // The original starts once the first-screen images are all received — we have no images, so start once the fonts are ready
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(ready);

  // Mouse parallax — petals (background and two hero layers) and the hero frame
  const decoA = document.querySelectorAll(".bk-petals--1");
  const decoB = document.querySelectorAll(".bk-petals--2");
  const frames = [[".bk-mv__mask-img", 2], [".bk-frame--1 > .bk-frame__in", 2], [".bk-frame--2 > .bk-frame__in", 3], [".bk-frame--3 > .bk-frame__in", 4]].map(([s, d]) => [document.querySelector(s), d]);
  window.bkNearTop = true;
  if (!mqSp.matches && !reduce) {
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX - innerWidth / 2) * 0.03, y = (e.clientY - innerHeight / 2) * 0.03;
      decoA.forEach((el) => (el.style.transform = `translate3d(${x}px, ${y}px, 0)`));
      decoB.forEach((el) => (el.style.transform = `translate3d(${x / 2}px, ${y / 2}px, 0)`));
      if (window.bkNearTop) frames.forEach(([el, d]) => el && (el.style.transform = `translate3d(${x / d}px, 0, 0)`));
    });
  }
  window.bkResetFrames = () => frames.forEach(([el]) => el && (el.style.transform = "translate3d(0px, 0, 0)"));

  // Puts a 1px sticky marker at the top of dark sections (performance record panel · learning · message · footer), and flips while that marker covers the top line of the screen
  const sensors = [];
  [".bk-record__wrapper", ".bk-learning", ".bk-model__message", ".bk-footer"].forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const box = document.createElement("div");
    box.setAttribute("style", "position:absolute;inset:0;pointer-events:none;");
    const pin = document.createElement("div");
    pin.setAttribute("style", "position:sticky;top:0;left:0;width:100%;height:1px;pointer-events:none;");
    box.appendChild(pin);
    el.appendChild(box);
    sensors.push(pin);
  });
  const io = new IntersectionObserver((entries) => entries.forEach((en) => (en.isIntersecting ? setTimeout(() => invert(true), 1) : invert(false))), { threshold: 0, rootMargin: "0px 0px -100% 0px" });
  sensors.forEach((s) => io.observe(s));
  addEventListener("resize", () => ScrollTrigger.refresh());
})();
