// Explore page — WOW entrance (same 1.1.2 as the original), the Back to top character, and 500ms swing scrolling for the hero GO and back-to-top anchors.
// The island stage is handled by scroll-cue-stage, the two bands by marquee, and the bobbing by the float-bob part.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.WOW && !reduce) new WOW().init();

  // jQuery swing = 0.5 − cos(πp)/2
  const swing = (p) => 0.5 - Math.cos(p * Math.PI) / 2;
  const glide = (y, ms) => {
    if (reduce || ms <= 0) return scrollTo(0, y);
    const from = scrollY, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      scrollTo(0, from + (y - from) * swing(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  document.querySelectorAll('a[href="#title"], a[href="#prologue"]').forEach((a) => a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    glide(target.getBoundingClientRect().top + scrollY, 500);
  }));

  // Past 2400px (phone 2200), the bottom goes -100 → 20 (phone -58 → 10) over 200ms swing
  const top = document.getElementById("pagetop");
  if (top) {
    const narrow = matchMedia("(max-width: 751px)");
    let shown = null, raf = 0;
    const move = (to) => {
      cancelAnimationFrame(raf);
      const from = parseFloat(getComputedStyle(top).bottom) || 0, t0 = performance.now();
      const step = (now) => {
        const p = reduce ? 1 : Math.min(1, (now - t0) / 200);
        top.style.bottom = `${from + (to - from) * swing(p)}px`;
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const check = () => {
      const sp = narrow.matches;
      const want = scrollY > (sp ? 2200 : 2400);
      if (want === shown) return;
      shown = want;
      move(want ? (sp ? 10 : 20) : sp ? -58 : -100);
    };
    addEventListener("scroll", check, { passive: true });
    narrow.addEventListener("change", () => { shown = null; top.style.bottom = ""; check(); });
    check();
  }
})();
