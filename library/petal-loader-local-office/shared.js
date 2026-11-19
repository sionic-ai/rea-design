// Common to all pages — smooth scroll, section entrance, header bar, first-visit loader skip, phone menu
window.YG = (() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const isHome = document.body.classList.contains("yg-home");

  // ───── Lenis 1.3.14 — original { lerp: .1, smoothWheel }
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ───── Arriving at the first page from another page skips the loader and replays only the hero entrance after .6s (original skipTopIntro · playShowAnim)
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (!a || isHome) return;
    const href = a.getAttribute("href") || "";
    if (/^(\.\/)?index\.html(#.*)?$/.test(href)) { sessionStorage.setItem("yg-skip-intro", "1"); sessionStorage.setItem("yg-play-show", "1"); }
  }, true);
  const nav = performance.getEntriesByType?.("navigation")[0];
  if (isHome && nav?.type === "reload") { sessionStorage.removeItem("yg-skip-intro"); sessionStorage.removeItem("yg-play-show"); }
  if (isHome && nav?.type === "back_forward") sessionStorage.setItem("yg-skip-intro", "1");

  // Section entrance — fades in over 1.6s when it enters the screen (delayed .2s), a few from 40px to the side
  const appear = () => {
    const els = document.querySelectorAll(".yg-appear");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
    // A group already on screen at first paint blooms immediately with no delay (the original appears the moment it attaches) — only those entering via scroll afterwards get a .2s delay
    let first = true;
    const io = new IntersectionObserver((list) => {
      list.forEach((en) => {
        if (!en.isIntersecting) return;
        if (first) en.target.style.transitionDelay = "0s";
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
      first = false;
    }, { threshold: 0.01 });
    const start = () => els.forEach((el) => io.observe(el));
    // While the first-visit loader is covering, wait, attach once the curtain starts lifting
    const loader = document.querySelector('[data-fx~="petal-morph-loader"]');
    if (loader && !reduce && sessionStorage.getItem("yg-skip-intro") !== "1") loader.addEventListener("fx:done", start, { once: true });
    else start();
  };

  // ───── Phone menu — the navy panel switches on in .3s
  const menuBtn = document.querySelector(".yg-menu-btn");
  const menu = document.querySelector(".yg-drawer");
  const setMenu = (open) => {
    if (!menu || !menuBtn) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    root.classList.toggle("yg-menu-open", open);
    open ? lenis?.stop() : lenis?.start();
  };
  menuBtn?.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  menu?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // ───── In-page links (#) scroll smoothly
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView({ behavior: "smooth" });
  });

  appear();
  addEventListener("load", () => ScrollTrigger.refresh());
  return { reduce, lenis, isHome };
})();
