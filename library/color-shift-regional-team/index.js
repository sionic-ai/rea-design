// First page — Hero slider whose theme color changes, project modal paging, neighborhood drawing lighting up, solutions table Lottie, News filtering
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero — a .6s fade every 5 seconds. When a transition starts, the back mass folds to 0, then after 200ms regrows in the new theme color over .74s
  let fv = null;
  const theme = (sw) => {
    const s = sw.slides[sw.activeIndex];
    if (!s) return;
    body.dataset.theme = s.dataset.theme;
    body.dataset.bg = s.dataset.bg;
    body.dataset.num = s.dataset.num;
  };
  if (window.Swiper && $("#fv-slider .swiper")) {
    fv = new Swiper("#fv-slider .swiper", {
      loop: true, effect: "fade", fadeEffect: { crossFade: false }, speed: 600,
      autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
      navigation: { nextEl: "#fv-slider .is-next", prevEl: "#fv-slider .is-prev" },
      on: {
        init(sw) { theme(sw); setTimeout(() => body.classList.add("is-slider-ready"), 200); },
        slideChangeTransitionStart(sw) {
          body.classList.add("is-slide-change");
          body.classList.remove("is-slide-change-end");
          setTimeout(() => { body.classList.remove("is-slide-change"); body.classList.add("is-slide-change-end"); }, 200);
          theme(sw);
        },
      },
    });
  }

  // Project modal — the center slide switches immediately, side slides drop 12px and tilt ∓5° as they transition over .6s
  const tilt = (sw) => {
    sw.slides.forEach((el) => { el.style.transition = "transform 0.6s"; el.style.transform = ""; });
    const n = sw.slides.length;
    const at = (i) => sw.slides[(i + n) % n];
    at(sw.activeIndex - 1).style.transform = "translateY(12px) rotate(-5deg)";
    at(sw.activeIndex + 1).style.transform = "translateY(12px) rotate(5deg)";
    at(sw.activeIndex).style.transform = "translateY(0) rotate(0deg)";
  };
  const modals = $$(".fv-modal__swiper").map((el) => window.Swiper && new Swiper(el, {
    loop: true, speed: 600, slidesPerView: "auto", centeredSlides: true, spaceBetween: 10,
    breakpoints: { 768: { spaceBetween: 35 } },
    autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
    on: { init: tilt, slideChangeTransitionStart: tilt },
  }));
  $$(".js-modal-open").forEach((b) => b.addEventListener("click", () => {
    $$(".fv-modal__box").forEach((m) => m.classList.toggle("is-active", m.dataset.num === b.dataset.num));
    body.classList.add("is-modal-open");
    fv?.autoplay.stop();
    modals.forEach((m) => m?.update());
    $(".fv-modal__box.is-active .js-modal-close")?.focus();
  }));
  const close = () => { body.classList.remove("is-modal-open"); if (!reduce) fv?.autoplay.start(); };
  $$(".js-modal-close").forEach((b) => b.addEventListener("click", close));
  addEventListener("keydown", (e) => e.key === "Escape" && body.classList.contains("is-modal-open") && close());

  // Neighborhood drawing — switches on (once) when the section’s top edge reaches 65% of the screen. On phones the drawing is tied to scroll and shifts 200px left
  const wwd = $("#what-we-do");
  window.siteMM.add("(prefers-reduced-motion: no-preference)", () => {
    if (wwd) ScrollTrigger.create({ trigger: wwd, start: "top center+=15%", once: true, onEnter: () => wwd.classList.add("is-display-image") });
  });
  window.siteMM.add("(prefers-reduced-motion: reduce)", () => wwd?.classList.add("is-display-image"));
  window.siteMM.add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: ".wwd__img", start: "top center", end: "bottom top", scrub: true } }).to(".wwd__img", { x: -200, ease: "power2.out" });
  });

  // Solution table — our shapes that run on their own with the same lengths as the original Lottie (60×60, 30fps) (148, 288, 288, 216 frames)
  // Skin variables can be hex or oklch, anything — so paint one point and read it as pixels
  const toRgb = (() => {
    const c = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    return (v) => { c.clearRect(0, 0, 1, 1); c.fillStyle = v.trim(); c.fillRect(0, 0, 1, 1); return [...c.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((n) => n / 255); };
  })();
  const probe = document.createElement("i");
  document.body.append(probe);
  const col = (v) => { probe.style.color = `var(${v})`; return [...toRgb(getComputedStyle(probe).color), 1]; };
  const C = { ink: col("--kf-ink"), a: col("--kf-accent"), sky: col("--site-sky"), mint: col("--site-mint"), peach: col("--site-peach"), hot: col("--kf-accent-text"), theme: col("--site-theme-1") };
  probe.remove();
  const still = (k) => ({ a: 0, k });
  const anim = (frames) => ({ a: 1, k: frames.map(([t, s], i) => (i < frames.length - 1 ? { t, s, i: { x: [0.42], y: [1] }, o: { x: [0.58], y: [0] } } : { t, s })) });
  const tr = (extra = {}) => ({ ty: "tr", p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100), sk: still(0), sa: still(0), ...extra });
  const layer = (shapes, ks, op) => ({ ddd: 0, ind: 1, ty: 4, nm: "mark", sr: 1, ao: 0, ip: 0, op, st: 0, bm: 0, ks: { o: still(100), r: still(0), p: still([30, 30, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]), ...ks }, shapes });
  const el = (size, fill, line, extra) => ({ ty: "gr", it: [{ ty: "el", d: 1, s: still(size), p: still([0, 0]) }, { ty: "fl", c: still(fill), o: still(100), r: 1 }, ...(line ? [{ ty: "st", c: still(line), o: still(100), w: still(1.5), lc: 2, lj: 2 }] : []), tr(extra)] });
  const poly = (pts, fill, extra) => ({ ty: "gr", it: [{ ty: "sh", ks: still({ c: true, v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) }) }, { ty: "fl", c: still(fill), o: still(100), r: 1 }, { ty: "st", c: still(C.ink), o: still(100), w: still(1.5), lc: 2, lj: 2 }, tr(extra)] });
  const MARKS = {
    1: [148, [el([44, 44], C.theme, C.ink, { s: anim([[0, [100, 100]], [74, [86, 86]], [148, [100, 100]]]) }), el([20, 20], C.a, C.ink)]],
    2: [288, [poly([[-18, 14], [0, -18], [18, 14]], C.mint, { r: anim([[0, 0], [288, 360]]) }), poly([[-10, -8], [10, -8], [0, 12]], C.peach, { r: anim([[0, 0], [288, -360]]) })]],
    3: [288, [el([46, 46], C.hot, C.ink, { s: anim([[0, [100, 100]], [72, [70, 70]], [144, [100, 100]], [216, [70, 70]], [288, [100, 100]]]) })]],
    4: [216, [0, 1, 2, 3].map((k) => poly([[-6, -6], [6, -6], [6, 6], [-6, 6]], [C.hot, C.sky, C.a, C.mint][k], { p: anim([0, 54, 108, 162, 216].map((t, j) => [t, [[-9, -9], [9, -9], [9, 9], [-9, 9]][(k + j) % 4]])) }))],
  };
  if (window.lottie) {
    $$(".sol__mark").forEach((box) => {
      const [op, shapes] = MARKS[box.dataset.mark] || MARKS[1];
      const a = lottie.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: !reduce, animationData: { v: "5.12.2", fr: 30, ip: 0, op, w: 60, h: 60, nm: "mark", ddd: 0, assets: [], layers: [layer(shapes, {}, op)] } });
      // Passing data directly may not trigger autoplay on some builds — play it directly
      if (!reduce) { if (a.isLoaded) a.play(); else a.addEventListener("DOMLoaded", () => a.play()); }
    });
  }

  // News filter — only the list of the pressed branch is shown
  $$(".news-filter__btn").forEach((b) => b.addEventListener("click", () => {
    $$(".news-filter__btn").forEach((x) => x.classList.toggle("is-active", x === b));
    $$(".news-list__items").forEach((u) => u.classList.toggle("is-active", u.dataset.category === b.dataset.category));
  }));
})();
