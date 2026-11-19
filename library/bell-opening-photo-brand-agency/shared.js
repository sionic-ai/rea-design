// Shared across the whole site — Lenis (1.3.4) · Barba (2.10.3) transition (rainbow band: rainbow-rise-page part) · header hide (headroom offset 120 · up 5px) · phone menu ·
// [data-reveal] reveal, address copy, cookie bar, and per-page motion (RE.pages[name]). Per-section background color, photo warp and the More pill are applied by the part (data-fx)
(() => {
  const RE = (window.RE = window.RE || { pages: {} });
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = matchMedia("(min-width: 768px)");

  // Turns a skin variable (including oklch(from …) and color-mix) into the rgb GSAP reads
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pg = probe.getContext("2d", { willReadFrequently: true });
  RE.color = (name, scope = document.body) => {
    const i = document.createElement("i");
    i.style.cssText = `display:none;color:var(${name})`;
    scope.append(i);
    const c = getComputedStyle(i).color;
    i.remove();
    pg.clearRect(0, 0, 1, 1); pg.fillStyle = "transparent"; pg.fillStyle = c; pg.fillRect(0, 0, 1, 1);
    const d = pg.getImageData(0, 0, 1, 1).data;
    return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
  };

  // ───── Smooth scroll — the original runs lenis.raf first on Tempus at 60fps (priority −1) and GSAP after it
  const lenis = new Lenis({ syncTouch: false, smoothWheel: true, autoRaf: false });
  RE.lenis = window.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  if (reduce) lenis.options.lerp = 1;

  // ───── Header row — hides when scrolled down more than 120px (0px below), shows when scrolled up more than 5px. On the first page it is always hidden (−200%) until the hero has passed
  const header = document.querySelector(".re-header");
  const burger = header.querySelector(".re-burger");
  const nav = header.querySelector(".re-nav");
  let lastY = 0, pinned = true;
  RE.notAtTop = false;
  const headState = () => {
    const y = lenis.scroll, home = document.body.dataset.ns === "home", top = y <= 120;
    if (!top) { if (y - lastY > 0) pinned = false; else if (lastY - y > 5) pinned = true; }
    else pinned = true;
    lastY = y;
    if (header.classList.contains("is-open")) return;
    const hidden = home ? (!RE.notAtTop || top || !pinned) : !top && !pinned;
    gsap.set(header, { yPercent: hidden ? (home ? -200 : -100) : 0 });
  };
  RE.headState = headState;
  lenis.on("scroll", headState);

  // ───── Phone menu
  const setMenu = (open) => {
    header.classList.toggle("is-open", open);
    nav.classList.toggle("is-open", open);
    document.querySelectorAll(".re-burger").forEach((b) => { b.classList.toggle("is-active", open); b.setAttribute("aria-expanded", String(open)); });
    if (open) { gsap.set(header, { yPercent: 0 }); lenis.stop(); } else { lenis.start(); headState(); }
  };
  RE.setMenu = setMenu;
  document.addEventListener("click", (e) => { if (e.target.closest(".re-burger")) setMenu(!header.classList.contains("is-open")); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && header.classList.contains("is-open")) setMenu(false); });

  // ───── Cookie strip
  const cookie = document.querySelector(".re-cookie");
  RE.cookie = cookie;
  cookie?.addEventListener("click", (e) => { if (e.target.closest("[data-cookie-close]")) { cookie.setAttribute("data-closed", ""); gsap.killTweensOf(cookie); cookie.hidden = true; } });

  // ───── Current page marker — so the header pill and footer link follow even when navigating via the page-transition library
  const markCurrent = () => {
    const here = location.pathname.split("/").pop() || "index.html", sec = document.querySelector("[data-barba=container]")?.dataset.section;
    document.querySelectorAll(".re-header .re-nav__link, .re-links a").forEach((a) => {
      const f = (a.getAttribute("href") || "").split("#")[0];
      const on = f === here || (sec && a.dataset.section === sec);
      on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
      // The current-page pill gets a different name on the first two branches (is-current on the second) — same shape as the original c-nav__link is-current
      a.classList.remove("is-current");
      if (on) { const c = [...a.classList]; a.className = [c[0], "is-current", ...c.slice(1)].join(" "); }
    });
  };

  // ───── Reveal — turns on when it enters a plane extended 40px above the screen, off when it leaves
  let revealIO;
  // The body changes on every navigation but the footer stays, so rescan the whole document
  const reveal = () => {
    revealIO?.disconnect();
    revealIO = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-in", e.isIntersecting)), { rootMargin: "40px 0px 0px 0px", threshold: 0 });
    document.querySelectorAll("[data-reveal]").forEach((n) => revealIO.observe(n));
  };

  // ───── Copy URL
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".re-copy");
    if (!b) return;
    const v = b.closest("li")?.querySelector("[data-copy]")?.textContent.trim();
    if (v) navigator.clipboard?.writeText(v).catch(() => {});
    const t = b.textContent;
    b.textContent = "Copied.";
    setTimeout(() => (b.textContent = t), 1500);
  });

  // ───── Per-page motion — cleared and re-attached on every page change
  let cleanup = null;
  const mount = (container) => {
    document.body.dataset.ns = container.dataset.barbaNamespace;
    cleanup?.();
    cleanup = RE.pages[container.dataset.barbaNamespace]?.(container) || null;
    reveal();
    markCurrent();
    headState();
  };

  // ───── Transition — original Barba default-transition: rainbow band covers .5s power2.out and goes to the top (.1s) → new page → after .1s it withdraws .5s power2.in.
  // On back, jump straight to the scroll position from when leaving that page, then proceed
  const saved = {};
  const rainbow = () => document.body.fxRainbowRisePage;
  const pageCss = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const waits = [...doc.querySelectorAll("link[data-page-css]")].map((l) => {
      const href = l.getAttribute("href");
      if (document.querySelector(`link[data-page-css][href="${href}"]`)) return null;
      const n = document.createElement("link");
      n.rel = "stylesheet"; n.href = href; n.setAttribute("data-page-css", "");
      document.head.append(n);
      return new Promise((r) => { n.onload = n.onerror = r; });
    }).filter(Boolean);
    await Promise.all(waits);
  };
  if (window.barba) {
    barba.hooks.leave(({ current }) => { saved[current.url.path] = lenis.scroll; });
    barba.hooks.afterLeave(() => { lenis.scrollTo(0, { immediate: true, force: true }); });
    barba.hooks.beforeEnter(({ next }) => pageCss(next.html));
    barba.hooks.enter(({ next }) => { setMenu(false); RE.notAtTop = false; mount(next.container); });
    barba.hooks.after(() => ScrollTrigger.refresh());
    barba.init({
      preventRunning: true,
      timeout: 5000,
      prevent: ({ el }) => !!el?.classList?.contains("no-barba"),
      transitions: [{
        name: "default-transition",
        sync: false,
        async leave() {
          await (rainbow()?.cover() || Promise.resolve());
          await new Promise((r) => lenis.scrollTo("top", { duration: 0.1, force: true, lock: true, onComplete: r }));
        },
        enter({ trigger, current, next }) {
          const back = saved[next.url.path] || 0;
          if (back && trigger === "back") lenis.scrollTo(back, { immediate: true, force: true, lock: true });
          rainbow()?.reveal();
        },
      }],
    });
  }

  const first = () => mount(document.querySelector("[data-barba=container]"));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", first, { once: true });
  else first();
})();
