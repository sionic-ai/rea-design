// Common to all pages: Lenis (original settings as is) · difference-blend cursor · Directors panel · phone menu · video autoplay
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  let lenis = null;
  if (!reduce && window.Lenis && matchMedia("(min-width: 1024px)").matches) {
    lenis = new Lenis({ anchors: true, gestureOrientation: "vertical", lerp: 0.045, overscroll: false, smoothWheel: true, syncTouch: true, syncTouchLerp: 0.055, touchMultiplier: 0.95, wheelMultiplier: 0.8 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.DH = { lenis, reduce };

  // Panel open and close — Directors (desktop) and Menu (phone) both use the same black panel, and scroll stops while it is open
  const panels = [...document.querySelectorAll("[data-panel]")];
  const head = document.querySelector("[data-head]");
  const open = (name) => {
    panels.forEach((p) => {
      const on = p.dataset.panel === name;
      p.classList.toggle("is-open", on);
      p.inert = !on;
    });
    // When the panel opens, the header logo drops in over .4s and the open menu gets an underline
    head?.classList.toggle("is-panel", !!name);
    document.querySelectorAll("[data-open-panel]").forEach((b) => b.classList.toggle("is-current", b.dataset.openPanel === name));
  };
  const anyOpen = () => panels.some((p) => p.classList.contains("is-open"));
  panels.forEach((p) => { p.inert = true; });
  document.querySelectorAll("[data-open-panel]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    if (b.classList.contains("is-current")) { open(""); lenis ? lenis.start() : document.documentElement.classList.remove("dh-lock"); return; }
    open(b.dataset.openPanel);
    lenis ? lenis.stop() : document.documentElement.classList.add("dh-lock");
  }));
  document.querySelectorAll("[data-close-panel]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const back = b.dataset.closePanel;
    open(back || "");
    if (!back) lenis ? lenis.start() : document.documentElement.classList.remove("dh-lock");
  }));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && anyOpen()) { open(""); lenis && lenis.start(); } });

  // Hovering a name in the Directors panel plays that director’s video laid over the right side
  document.querySelectorAll("[data-dir]").forEach((li) => {
    const v = li.querySelector("video");
    if (!v) return;
    li.addEventListener("pointerenter", () => { v.currentTime = 0; v.play().catch(() => {}); });
    li.addEventListener("pointerleave", () => v.pause());
  });

  // The video floats up with a 1s ease-out once it can play (original lazy-load board)
  document.querySelectorAll("video.dh-video").forEach((v) => {
    const on = () => v.classList.add("is-loaded");
    if (v.readyState >= 2) on(); else v.addEventListener("loadeddata", on, { once: true });
  });
  // Play only visible videos
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting && !reduce) v.play().catch(() => {}); else v.pause();
  }), { rootMargin: "200px 0px" });
  document.querySelectorAll("video[data-auto]").forEach((v) => io.observe(v));

  // Header intro text: appears after .4s with .6s power2.out (exactly as the original)
  const intro = document.querySelector("[data-head-intro]");
  if (intro) setTimeout(() => gsap.fromTo(intro, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.6, ease: "power2.out", delay: reduce ? 0 : 0.6 }), 400);
})();
