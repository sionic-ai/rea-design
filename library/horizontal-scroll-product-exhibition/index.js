// Product line intro — hero order (logo·slogan → menu at 2.4s → bottom photo at 2.8s), per-section bottom photo, pinned title, menu color, Lottie playback, page dots, phone menu
// The original starts all of these on window.onload — the hero timers (2.4·2.8s) and the written slogan are also based on load
const paStart = () => {
  document.body.classList.add("is-loaded");
  const wide = matchMedia("(min-width: 1025px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const nav = $(".pa-nav");
  setTimeout(() => nav?.classList.remove("is-hidden"), reduce ? 0 : 2400);
  setTimeout(() => $(".pa-concept__bg")?.classList.add("is-active"), reduce ? 0 : 2800);

  // Floor photo: on while that section is at all on screen
  const bgIO = new IntersectionObserver((es) => es.forEach((e) => $(`.pa-bg[data-bg="${e.target.dataset.section}"]`)?.classList.toggle("is-active", e.isIntersecting)), { threshold: 0 });
  $$(".pa-sec[data-section]").forEach((s) => bgIO.observe(s));

  // Pinned title — turns on when 10% of the section is visible and writes itself out once (the original Lottie never replays after drawing to the end)
  const titleIO = new IntersectionObserver((es) => es.forEach((e) => {
    const t = $(`.pa-title[data-title="${e.target.dataset.titleSection}"]`);
    if (!t) return;
    if (e.isIntersecting) { t.classList.remove("is-deactive"); t.classList.add("is-written"); } else t.classList.add("is-deactive");
  }), { threshold: 0.1 });
  if (wide.matches) $$("[data-title-section]").forEach((s) => titleIO.observe(s));

  // When 10% of the forest section is visible, menu text turns white
  const forest = $(".pa-sec--detail02");
  if (forest && nav) new IntersectionObserver(([e]) => nav.classList.toggle("is-white", e.isIntersecting), { threshold: 0.1 }).observe(forest);

  // Lottie — original position, size and length, artwork is our own JSON. On horizontal strips the light plays within 1000px of the screen’s right edge, the circle as soon as it touches the screen, on phone once when fully visible
  const lotData = (el) => {
    const key = el.dataset.lottie.replace(/^.*\//, "").replace(/\.json$/, "");
    return window.PA_LOTTIE?.[key] ? { animationData: JSON.parse(JSON.stringify(window.PA_LOTTIE[key])) } : { path: el.dataset.lottie };
  };
  const lots = $$("[data-lottie]").map((el) => ({ el, anim: window.lottie?.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, ...lotData(el) }), done: false }));
  const playIn = () => {
    const W = innerWidth, H = innerHeight;
    for (const l of lots) {
      if (l.done || !l.anim) continue;
      const r = l.el.getBoundingClientRect();
      const go = wide.matches
        ? (l.el.dataset.lottieAt === "circle" ? r.left <= W && r.right >= 0 : r.left <= W - 1000 && r.right >= 0)
        : r.top >= 0 && r.bottom <= H;
      if (go) { l.done = true; reduce ? l.anim.goToAndStop(l.anim.totalFrames - 1, true) : l.anim.play(); }
    }
  };

  // Page-number dots — light the current section’s dot, from the fifth (forest) use white dots and white menu
  const points = $$(".pa-indicator__point");
  const marks = points.map((p) => $(`[data-indicator="${p.dataset.target}"]`));
  // Original hits each section’s left edge earlier by screen width ÷ this value
  const early = { wrap02: 2.75, detail03: 3.75, detail04: 3.75, detail05: 5.75, detail06: 3.75, detail07: 5.75, detail08: 5.75 };
  const pager = () => {
    let at = 0;
    marks.forEach((m, i) => {
      if (!m) return;
      const r = m.getBoundingClientRect();
      const l = Math.floor(r.left - (early[points[i].dataset.target] ? innerWidth / early[points[i].dataset.target] : 0));
      if (l <= 0 && Math.floor(r.right) >= 0) at = i;
    });
    points.forEach((p, i) => p.classList.toggle("is-active", i === at));
    const white = at > 3;
    $(".pa-indicator")?.classList.toggle("is-white", white);
  };

  // Clicking a dot goes to that section’s top in .8s (2.4s to the very first) with easeInOutQuad — the original hand calculation as is
  const glide = (to, dur) => {
    const from = scrollY, dist = to - from;
    let t0 = null;
    const ease = (t, b, c, d) => { t /= d / 2; if (t < 1) return (c / 2) * t * t + b; t--; return (-c / 2) * (t * (t - 2) - 1) + b; };
    const step = (now) => {
      if (t0 === null) t0 = now;
      const t = Math.floor(now - t0);
      scrollTo(0, ease(Math.min(t, dur), from, dist, dur));
      if (t < dur) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const leftOf = (el) => {
    // Position inside horizontal band = Left on screen + current scroll — like the original, getBoundingClientRect().left + pageYOffset
    return Math.floor(el.getBoundingClientRect().left + scrollY);
  };
  $$(".pa-indicator__point, .pa-top").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const target = a.dataset.target;
    if (target === "pagetop") return glide(0, reduce ? 0 : 2400);
    const el = $(`[data-indicator="${target}"]`);
    if (!el) return;
    points.forEach((p) => p.classList.remove("is-active"));
    a.classList.add("is-active");
    glide(wide.matches ? leftOf(el) : el.getBoundingClientRect().top + scrollY, reduce ? 0 : 800);
  }));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; playIn(); if (wide.matches) pager(); });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // Phone menu
  const spbtn = $(".pa-spbtn"), spmenu = $(".pa-spmenu");
  spbtn?.addEventListener("click", () => { spbtn.classList.toggle("is-active"); spmenu?.classList.toggle("is-active"); });

  // Wide screens use Lenis (.35s easeOutCubic) — original setting as is
  if (wide.matches && window.Lenis && !reduce) {
    const lenis = new Lenis({ duration: 0.35, easing: (x) => 1 - Math.pow(1 - x, 3), smoothTouch: true });
    lenis.on("scroll", () => window.ScrollTrigger?.update());
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
};
if (document.readyState === "complete") paStart(); else addEventListener("load", paStart, { once: true });
