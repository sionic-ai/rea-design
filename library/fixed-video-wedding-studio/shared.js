// Shared — runs Lenis (lerp .1 · duration 1.2) on the gsap ticker like the original, and # links glide to 30px above the target in 1s.
// The three-line button toggles html.is-drawer. A [data-inview] group gets is-inview at 5% visible, and the .mw-each rows inside follow on at .2s intervals.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, duration: 1.2 });
    window.mwLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1, offset: -30 });
      else target.scrollIntoView();
    });
  });

  document.querySelectorAll("[data-drawer-toggle]").forEach((b) => {
    b.addEventListener("click", () => {
      const open = document.documentElement.classList.toggle("is-drawer");
      b.setAttribute("aria-expanded", String(open));
      document.getElementById("mw-drawer")?.toggleAttribute("inert", !open);
    });
  });

  const show = (el) => {
    el.classList.add("is-inview");
    el.querySelectorAll(".mw-each").forEach((item, i) => {
      if (reduce) item.classList.add("is-inview");
      else gsap.delayedCall(0.2 * i, () => item.classList.add("is-inview"));
    });
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.intersectionRatio >= 0.05) {
        show(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: [0, 0.05, 0.1, 1] });
  document.querySelectorAll("[data-inview-group], .mw-in:not(.mw-each)").forEach((el) => io.observe(el));
})();
