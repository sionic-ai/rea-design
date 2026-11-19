// Home page — number loader (to 92% over 2.6s with cubic ease-out, then +4 per frame to 100 once the cloud panel stops, minimum 1.7s), first word scramble (.9s),
// Price input typewriter (typing 65ms · deleting 32ms · pause 2.2s · next phrase .35s), auction slider (swiper 11 — 1 → 1.4 → 2.8 slides, gap 24 → 96, rewind, auto-advance every 4 seconds when visible).
(() => {
  const docEl = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);

  const pre = document.querySelector(".e-pre"), count = document.querySelector("[data-preloader-count]");
  const word = document.querySelector(".e-hero__word");
  if (pre) {
    const t0 = performance.now();
    let shown = 0, ready = false, done = false;
    const step = () => {
      if (done && shown >= 100) return;
      const k = Math.min(1, (performance.now() - t0) / 2600), e = 1 - Math.pow(1 - k, 3);
      const v = ready ? 100 : Math.min(92, Math.round(92 * e));
      if (v > shown) { shown = ready ? Math.min(100, shown + 4) : v; count.textContent = String(shown); }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    const finish = (instant) => {
      if (done) return;
      const left = performance.now() - t0;
      if (!instant && left < 1700) { setTimeout(() => finish(false), 1700 - left); return; }
      done = true; ready = true; shown = 100; count.textContent = "100";
      docEl.classList.remove("e-loading");
      if (word) {
        const to = word.dataset.final;
        if (instant || reduce || !window.ScrambleTextPlugin) word.textContent = to;
        else gsap.to(word, { duration: 0.9, scrambleText: { text: to, chars: "upperCase", speed: 0.4 } });
      }
      if (instant) pre.remove(); else { pre.classList.add("is-lifting"); setTimeout(() => pre.remove(), 1000); }
      ScrollTrigger.refresh();
    };
    if (scrollY > innerHeight / 2) finish(true);
    document.addEventListener("e:hero-ready", () => { ready = true; setTimeout(() => finish(false), 450); }, { once: true });
    setTimeout(() => finish(false), 7000);
  }

  // Typewriter
  document.querySelectorAll("[data-typewriter]").forEach((el) => {
    const words = el.dataset.typewriter.split("|");
    if (reduce) { el.textContent = words[0]; return; }
    let w = 0, timer = 0;
    const later = (fn, ms) => (timer = setTimeout(fn, ms));
    const run = (text, n, dir) => {
      el.textContent = text.slice(0, n);
      if (dir > 0 && n >= text.length) return later(() => run(text, n, -1), 2200);
      if (dir < 0 && n <= 0) { w = (w + 1) % words.length; return later(() => run(words[w], 0, 1), 350); }
      later(() => run(text, n + dir, dir), dir > 0 ? 65 : 32);
    };
    el.textContent = words[0];
    new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); later(() => run(words[0], words[0].length, -1), 2600); } }, { rootMargin: "150px" }).observe(el);
  });

  // Auction slider
  const slider = document.querySelector("[data-trend-slider]");
  if (slider && window.Swiper) {
    const off = () => Math.max(0, (innerWidth - Math.min(0.89 * innerWidth, 1710)) / 2);
    new Swiper(slider, {
      slidesPerView: 1, spaceBetween: 24, watchOverflow: true, grabCursor: true, rewind: true,
      slidesOffsetBefore: off(), slidesOffsetAfter: off(),
      keyboard: { enabled: true },
      autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true, enabled: false },
      navigation: { prevEl: slider.querySelector("[data-trend-prev]"), nextEl: slider.querySelector("[data-trend-next]") },
      breakpoints: { 768: { slidesPerView: 1.4, spaceBetween: 96 }, 1200: { slidesPerView: 2.8, spaceBetween: 96 } },
      on: {
        resize(s) { s.params.slidesOffsetBefore = off(); s.params.slidesOffsetAfter = off(); s.update(); },
        afterInit(s) { new IntersectionObserver(([e]) => (e.isIntersecting && !reduce ? s.autoplay.start() : s.autoplay.stop()), { threshold: 0.35 }).observe(s.el); },
      },
    });
  }
})();
