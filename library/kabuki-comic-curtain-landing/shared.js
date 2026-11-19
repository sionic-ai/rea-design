// Shared by every page: first-load curtain (loader), header MENU drawer, same-page anchor scroll (.6s), adding is-run when an element enters the viewport.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = () => innerWidth <= 768;

  // ── Loader: fills every 150ms, slowing toward 90%, and once everything is loaded (after showing at least .6s) goes to 100% → the curtain lifts .6s later ──
  const opening = document.getElementById("opening");
  const bar = opening?.querySelector(".sm-loader__bar");
  const text = document.getElementById("loaderText");
  const cfg = { stallAt: 90, minVisibleMs: 600, timeoutMs: 10000, tickMs: 150 };
  const startedAt = performance.now();
  let current = 0, finished = false, timer = 0;
  const render = (p) => {
    const v = Math.max(0, Math.min(100, Math.round(p)));
    if (bar) bar.style.width = v + "%";
    if (text) text.textContent = v + "%";
    current = v;
  };
  const open = () => {
    opening?.classList.add("is-loaded");
    setTimeout(() => {
      opening?.classList.add("is-hide");
      document.body.classList.remove("sm-scroll-stop");
      ScrollTrigger.refresh();
    }, 1900);
    setTimeout(() => document.dispatchEvent(new CustomEvent("sm:opened")), 2400);
  };
  const complete = () => {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    const wait = Math.max(0, cfg.minVisibleMs - (performance.now() - startedAt));
    setTimeout(() => { render(100); setTimeout(open, 600); }, wait);
  };
  if (reduce || !opening) {
    opening?.classList.add("is-loaded", "is-hide");
    document.body.classList.remove("sm-scroll-stop");
    addEventListener("DOMContentLoaded", () => document.dispatchEvent(new CustomEvent("sm:opened")));
  } else {
    render(0);
    timer = setInterval(() => {
      if (finished) return;
      const eased = 1 - Math.pow(1 - Math.min(1, current / cfg.stallAt), 2);
      render(Math.min(cfg.stallAt, current + Math.max(0.5, 2 * (1 - Math.min(0.95, eased)))));
    }, cfg.tickMs);
    setTimeout(complete, cfg.timeoutMs);
    if (document.readyState === "complete") complete();
    else addEventListener("load", complete);
  }

  // ── MENU drawer: the header row slides up and the drawer enters in .3s, the bottom icon pops in .3s later ──
  const header = document.querySelector(".sm-header");
  const burger = header?.querySelector(".sm-burger");
  const objs = header?.querySelector(".sm-drawer__objs");
  let busy = false;
  const lock = (ms) => { busy = true; header.classList.add("is-locked"); setTimeout(() => { header.classList.remove("is-locked"); busy = false; }, ms); };
  const openMenu = () => {
    if (busy || !header) return;
    lock(400);
    burger.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    setTimeout(() => header.classList.add("is-open"), 10);
    objs.classList.remove("is-hide");
    setTimeout(() => objs.classList.add("is-show"), 300);
  };
  const closeMenu = () => {
    if (busy || !header?.classList.contains("is-open")) return;
    lock(300);
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    setTimeout(() => header.classList.remove("is-open"), 10);
    objs.classList.remove("is-show");
    objs.classList.add("is-hide");
  };
  burger?.addEventListener("click", openMenu);
  header?.querySelector(".sm-drawer__close")?.addEventListener("click", closeMenu);
  header?.querySelector(".sm-drawer__bg")?.addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  // ── Same-page anchors: subtract the header height and use .6s swing (sine.inOut) ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    const target = href === "#" || href === "#top" ? document.documentElement : document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    if (header?.classList.contains("is-open")) { busy = false; closeMenu(); }
    const h = header ? header.offsetHeight : 0;
    const y = target === document.documentElement ? 0
      : href === "#about" ? innerHeight - h
      : target.getBoundingClientRect().top + scrollY - h;
    gsap.to(window, { scrollTo: { y, autoKill: false }, duration: reduce ? 0 : 0.6, ease: "sine.inOut" });
  });

  // ── is-run on entering the screen: top (.4), middle (.6), default (.75) lines — phone uses .5, .7, .85 ──
  const groups = [["._Anime_top", 0.4, 0.5], ["._Anime_middle", 0.6, 0.7], ["._Anime", 0.75, 0.85]];
  const runCheck = () => {
    const line = scrollY;
    for (const [sel, pc, sp] of groups) {
      document.querySelectorAll(sel + ":not(.is-run)").forEach((el) => {
        const hit = el.getBoundingClientRect().top + scrollY;
        if (reduce || line + innerHeight * (isSp() ? sp : pc) >= hit) el.classList.add("is-run");
      });
    }
  };
  window.smRunCheck = runCheck;
  addEventListener("scroll", runCheck, { passive: true });
  addEventListener("DOMContentLoaded", runCheck);
})();
