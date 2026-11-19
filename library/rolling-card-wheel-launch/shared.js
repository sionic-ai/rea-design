// Page-wide parts: smooth scroll (wide screens only, original Lenis duration .6 · cubic ease-out), loader (one 3.2s spin always plays, lifts at .5s),
// Time bar, menu panel (scroll stops when open, items jump to sections). index.js uses these through window.SC
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const COMPACT = "(max-width: 1023.98px), (pointer: coarse)";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const SC = (window.SC = { COMPACT, compact: () => matchMedia(COMPACT).matches, ready: false, lenis: null });

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);
  ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" });

  // Wide screens use Lenis, narrow screens and reduced motion use native finger scroll — only scrollTo is wrapped in the same shape
  let stopReq = 0;
  const mm = gsap.matchMedia();
  mm.add({ any: "all", compact: COMPACT, reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { compact, reduce: r } = ctx.conditions;
    if (compact || r) {
      let tw = null;
      SC.lenis = {
        stop: () => {}, start: () => {},
        scrollTo: (y, o = {}) => {
          tw?.kill(); tw = null;
          if (o.immediate || r) { scrollTo(0, y); o.onComplete?.(); return; }
          const s = { y: scrollY };
          tw = gsap.to(s, { y, duration: o.duration ?? 1, ease: o.easing ?? "power2.out", onUpdate: () => scrollTo(0, s.y), onComplete: () => { tw = null; o.onComplete?.(); } });
        },
      };
      window.lenis = SC.lenis;
      return () => { tw?.kill(); };
    }
    const lenis = new Lenis({ duration: 0.6, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true, syncTouch: false });
    SC.lenis = window.lenis = lenis;
    lenis.scrollTo(0, { immediate: true });
    if (!SC.ready || stopReq) lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  });
  SC.stop = () => { stopReq++; SC.lenis?.stop(); };
  SC.start = () => { stopReq = Math.max(0, stopReq - 1); if (!stopReq && SC.ready) SC.lenis?.start(); };

  // ── Loader: the ring’s one full turn (3.2s) is always shown, and .55s after the walk starts the plate is removed and scrolling is released ──
  const loader = document.getElementById("sc-loader");
  const t0 = performance.now();
  root.classList.add("scroll-lock");
  const lift = () => {
    const wait = Math.max(0, 3200 - (performance.now() - t0));
    setTimeout(() => {
      loader?.classList.add("is-hiding");
      setTimeout(() => {
        loader?.remove();
        root.classList.remove("scroll-lock");
        SC.ready = true;
        if (!stopReq) SC.lenis?.start();
        dispatchEvent(new CustomEvent("sc:ready"));
        ScrollTrigger.refresh();
      }, 550);
    }, wait);
  };
  (document.fonts?.ready ?? Promise.resolve()).then(() => (document.readyState === "complete" ? lift() : addEventListener("load", lift, { once: true })));

  // ── Time bar: scroll ratio of the whole document ──
  const fill = document.querySelector(".sc-timebar__fill");
  let raf = 0, max = 1;
  const measure = () => { max = Math.max(1, root.scrollHeight - innerHeight); paint(); };
  const paint = () => { raf = 0; if (fill) fill.style.width = `${Math.min(1, Math.max(0, scrollY / max)) * 100}%`; };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  addEventListener("resize", measure);
  ScrollTrigger.addEventListener("refresh", measure);
  measure();

  // ── Menu Panel ──
  const wrap = document.querySelector(".sc-menu-wrap");
  const toggle = wrap?.querySelector(".sc-menu__toggle");
  const overlay = wrap?.querySelector(".sc-menu__overlay");
  const fade = wrap?.querySelector(".sc-menu__fade");
  let open = false;
  const setMenu = (v) => {
    if (open === v || !overlay) return;
    open = v;
    overlay.classList.toggle("is-open", v);
    overlay.setAttribute("aria-hidden", String(!v));
    toggle.setAttribute("aria-expanded", String(v));
    root.classList.toggle("menu-open", v);
    v ? SC.stop() : SC.start();
    if (v) overlay.querySelector(".sc-menu__close")?.focus({ preventScroll: true });
  };
  toggle?.addEventListener("click", () => setMenu(true));
  overlay?.querySelector(".sc-menu__close")?.addEventListener("click", () => setMenu(false));
  overlay?.addEventListener("click", (e) => { if (e.target === overlay) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  // Item: while the navy overlay covers the screen in .3s, it jumps straight to that section and uncovers in .5s — the section position is given by index.js as SC.go
  overlay?.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
    const go = b.getAttribute("data-go");
    setMenu(false);
    if (reduce.matches || !fade) { SC.go?.(go); return; }
    gsap.timeline()
      .to(fade, { autoAlpha: 1, duration: 0.3, ease: "power2.in" })
      .call(() => SC.go?.(go))
      .to(fade, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, "+=0.05");
  }));
  SC.setMenuHidden = (v) => wrap?.classList.toggle("is-hidden", v);
})();
