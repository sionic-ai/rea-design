// Shared by all pages: Lenis (original 1.3.25, lerp .1, anchors off), menu drawer, cookie band, right scrollbar that changes color per section.
// Add a page scene with npSite.scene(fn) and they are set up in turn after the fonts have all loaded — because the fitted text size depends on the font width.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lenis = reduce ? null : new Lenis({ lerp: 0.1, anchors: false });
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Menu drawer
  const drawer = document.querySelector(".np-drawer");
  const scrim = document.querySelector(".np-scrim");
  const openers = document.querySelectorAll("[data-drawer-open]");
  const setDrawer = (open) => {
    if (!drawer) return;
    drawer.classList.toggle("is-open", open);
    scrim?.classList.toggle("is-open", open);
    openers.forEach((b) => b.setAttribute("aria-expanded", String(open)));
    document.documentElement.classList.toggle("is-nav-open", open);
    if (open) { lenis?.stop(); drawer.querySelector("a")?.focus({ preventScroll: true }); }
    else lenis?.start();
  };
  openers.forEach((b) => b.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open"))));
  drawer?.querySelector("[data-drawer-close]")?.addEventListener("click", () => { setDrawer(false); openers[0]?.focus(); });
  scrim?.addEventListener("click", () => setDrawer(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer?.classList.contains("is-open")) setDrawer(false); });

  // Phone drawer group fold
  document.querySelectorAll(".np-drawer__groups h3 button").forEach((b) => b.addEventListener("click", () => {
    if (!matchMedia("(max-width: 62em)").matches) return;
    b.setAttribute("aria-expanded", String(b.getAttribute("aria-expanded") !== "true"));
  }));

  // Search overlay
  const search = document.querySelector(".np-search");
  const setSearch = (open) => {
    if (!search) return;
    search.classList.toggle("is-open", open);
    search.setAttribute("aria-hidden", String(!open));
    if (open) { lenis?.stop(); search.querySelector("input")?.focus({ preventScroll: true }); } else lenis?.start();
  };
  document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", () => setSearch(true)));
  search?.querySelector(".np-search__close")?.addEventListener("click", () => setSearch(false));
  search?.addEventListener("click", (e) => { if (e.target === search) setSearch(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && search?.classList.contains("is-open")) setSearch(false); });

  // Cookie strip
  // Cookie bar: when closed, it slides down by its own height and disappears
  document.querySelector(".np-consent button")?.addEventListener("click", (e) => {
    const bar = e.currentTarget.closest(".np-consent");
    if (reduce) { bar.remove(); return; }
    bar.classList.add("is-closing");
    setTimeout(() => bar.remove(), 520);
  });

  // Right scroll bar — takes on the data-thumb color of the section currently at the center of the screen
  const thumb = document.querySelector(".np-thumb");
  const bar = thumb?.querySelector("i");
  const zones = [...document.querySelectorAll("[data-thumb]")];
  const paint = () => {
    if (!bar) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    const h = Math.max(48, innerHeight * (innerHeight / document.documentElement.scrollHeight));
    const y = max > 0 ? (scrollY / max) * (innerHeight - h) : 0;
    thumb.style.setProperty("--thumb-h", `${h}px`);
    thumb.style.setProperty("--thumb-y", `${y}px`);
    const mid = innerHeight / 2;
    const hit = zones.find((z) => { const r = z.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    thumb.style.setProperty("--thumb", hit ? `var(--site-${hit.dataset.thumb})` : "var(--kf-accent)");
  };
  addEventListener("scroll", paint, { passive: true });
  addEventListener("resize", paint);

  const scenes = [];
  window.npSite = { lenis, reduce, scene: (fn) => scenes.push(fn) };
  document.fonts.ready.then(() => {
    scenes.forEach((fn) => fn());
    ScrollTrigger.refresh();
    paint();
  });
})();
