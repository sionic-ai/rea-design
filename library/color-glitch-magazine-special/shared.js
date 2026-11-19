// Shared by pages — 60fps frame clock, reading skin variables, scroll arrow press, bottom panel of About and article pages (white backdrop + X logo at 1.35x)
(() => {
  const kk = (window.kk = window.kk || {});
  kk.cl = (t, a, b, lo, hi) => (t <= lo ? a : t >= hi ? b : a + ((t - lo) * (b - a)) / (hi - lo));
  kk.mix = (a, b, t) => a * (1 - t) + b * t;
  kk.rad = (d) => (d * Math.PI) / 180;
  kk.rnd = (a, b) => a + Math.random() * (b - a);
  kk.range = (n) => kk.rnd(-n, n);
  kk.hit = (n) => Math.random() * Math.max(2, n) < 1;
  kk.any = (arr) => arr[(Math.random() * arr.length) | 0];
  kk.css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  kk.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  kk.narrow = matchMedia("(max-width: 950px)");
  kk.val = (xs, lg) => (kk.narrow.matches ? xs : lg);
  // The About page scrolls by moving a fixed panel with lerp, so use that position, other pages use window scroll
  kk.y = () => (kk.smoothY ?? scrollY);

  // The original counts in 60fps frames regardless of display refresh rate — counts frames from time to get the same speed
  kk.loop = (fn) => {
    let last = -1;
    const tick = (time) => {
      const f = Math.floor(time * 60);
      if (f === last) return;
      const steps = last < 0 ? 1 : Math.min(f - last, 4);
      last = f;
      for (let i = 0; i < steps; i++) fn();
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  };

  document.querySelectorAll(".kk-scroll").forEach((b) => b.addEventListener("click", () => {
    if (kk.scrollTo) kk.scrollTo(innerHeight);
    else scrollTo({ top: innerHeight, behavior: kk.reduce ? "auto" : "smooth" });
  }));

  const fb = document.querySelector(".kk-footbg"), area = document.querySelector(".kk-foot");
  if (fb && area) {
    const logo = fb.querySelector(".kk-footbg__logo");
    let big = false, areaY = 0, c = 0;
    kk.loop(() => {
      if (c++ % 10 === 0) areaY = area.getBoundingClientRect().top + kk.y();
      const n = kk.cl(Math.max(0, areaY - kk.y()), 0, 1, 0, innerHeight);
      fb.style.clipPath = `inset(${(n * 100).toFixed(3)}% 0 0 0)`;
      if (kk.reduce) return;
      if (n < 0.15 && !big) { big = true; gsap.to(logo, { scale: 1.35, duration: 0.75, ease: "power3.inOut" }); }
      else if (n >= 0.15 && big) { big = false; gsap.to(logo, { scale: 1, duration: 0.75, ease: "power3.out" }); }
    });
  }
})();
