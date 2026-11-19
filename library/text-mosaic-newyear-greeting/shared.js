// Shared by Japanese and English versions — Lenis 1.3.14 (paused until the first scene ends), per-line letter rise, white curtain fills while the header line turns black, phone menu, back-to-top, video plays only when visible.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  // Original settings as is — Lenis runs on its own rAF (autoRaf), wheel at .6x, and same-page # links make Lenis scroll down stopping 40px above
  const lenis = new Lenis({ autoRaf: true, wheelMultiplier: 0.6, anchors: { offset: -40 } });
  window.lenis = lenis;
  // Lock scrolling until the first scene (index.js) fires q:ready when it ends — pages with no first scene unlock at once
  if (document.querySelector("[data-intro]") && !reduce) {
    lenis.scrollTo(0, { duration: 0.1, onComplete: () => lenis.stop() });
    document.addEventListener("q:ready", () => lenis.start(), { once: true });
  }

  mm.add(
    { motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
    (ctx) => {
      const still = ctx.conditions.still;
      // Line-by-line rise: when the group reaches 90% of the screen, 1s power4.out, stagger .05 (.023 for long text)
      document.querySelectorAll("[data-split-group]").forEach((g) => {
        const lines = g.querySelectorAll("[data-split]");
        if (still) return gsap.set(lines, { y: "0%" });
        gsap.to(lines, { y: "0%", duration: 1, ease: "power4.out", stagger: { each: g.dataset.splitGroup === "fine" ? 0.023 : 0.05 }, scrollTrigger: { trigger: g, start: "top 90%" } });
      });

      // White curtain: while the Service section top edge passes 80%→20%, it fills from bottom to top, and the moment it passes 80% the header line turns black in 1s
      const light = document.querySelector("[data-light-from]");
      const whiteout = document.querySelector(".q-whiteout");
      if (light && whiteout) {
        if (still) gsap.set(whiteout, { clipPath: "inset(0% 0% 0% 0%)" });
        else gsap.to(whiteout, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: light, start: "top 80%", end: "top 20%", scrub: true } });
        ScrollTrigger.create({
          trigger: light,
          start: "top 80%",
          onEnter: () => root.classList.add("is-light"),
          onLeaveBack: () => root.classList.remove("is-light"),
        });
      }
    },
  );

  // Phone menu: the curtain opens from top to bottom (clip-path 1.4s power4.out)
  const btn = document.querySelector(".q-menu-btn");
  const menu = document.querySelector(".q-menu");
  if (btn && menu) {
    let open = false;
    const set = (v) => {
      open = v;
      btn.classList.toggle("is-open", v);
      btn.setAttribute("aria-expanded", String(v));
      gsap.to(menu, { clipPath: v ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", duration: reduce ? 0 : 1.4, ease: "power4.out", overwrite: "auto" });
      v ? lenis.stop() : lenis.start();
    };
    btn.addEventListener("click", () => set(!open));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  }

  // Video — plays if even 1% is visible, as in the original, and pauses when out of view or when the tab is hidden
  const videos = document.querySelectorAll("video");
  if (videos.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) e.target.play()?.catch?.(() => {});
      else e.target.pause();
    }), { threshold: 0.01 });
    videos.forEach((v) => io.observe(v));
    document.addEventListener("visibilitychange", () => document.hidden && videos.forEach((v) => v.pause()));
  }

  document.querySelectorAll("[data-back-top]").forEach((b) => b.addEventListener("click", () => lenis.scrollTo(0, { duration: 1 })));
})();
