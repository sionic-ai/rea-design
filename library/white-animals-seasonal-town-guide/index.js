// Home page: loader → Hero staged entrance, photo crossfade, header logo hidden on Hero, number marquee, seasonal photo autoplay, reading card row.
// Original values: loader minimum 3s · photo 2s fade / 4s interval / 6s zoom · title 1.5s · logo 3s · card 3.3s+0.2s · height 4s · season 4s · card row 3.5 cards 1.2s/3s.
(() => {
  const { reduced } = SM;
  const $ = (s, r = document) => r.querySelector(s);
  const fv = $(".fv");
  const head = $(".sm-head");
  const chat = $(".sm-chat");

  // ── Hero photos (original swiper 8.4.7 fade settings as is): 2s crossfade · 4s interval, during the change both incoming and outgoing slides zoom for 6s ──
  const zoom = (sw, both) => sw.slides.forEach((s, o) => s.classList.toggle("is-zooming", o === sw.activeIndex || (both && o === sw.previousIndex)));
  const fvSwiper = new Swiper(".fv__slides", {
    effect: "fade", fadeEffect: { crossFade: true }, speed: 2000, loop: true, allowTouchMove: false,
    autoplay: { delay: 4000, disableOnInteraction: false, waitForTransition: false },
    on: { init(sw) { sw.autoplay.stop(); zoom(sw, false); }, slideChangeTransitionStart(sw) { zoom(sw, true); }, slideChangeTransitionEnd(sw) { zoom(sw, false); } },
  });
  const playSlides = () => { if (!reduced) fvSwiper.autoplay.start(); };
  const stopSlides = () => fvSwiper.autoplay.stop();

  // ── Loader and staggered reveal (3s loader on the first visit of a session only) ──
  const loader = $(".sm-loader");
  const vis = (el) => el && el.classList.add("is-visible");
  const parts = { slides: $(".fv__slides"), lead: $(".fv__lead"), ill: $(".fv__ill"), logo: $(".fv__logo"), nav: $(".sm-head__nav") };
  const cards = [...fv.querySelectorAll(".pk-card")];
  let ready = false;
  const finish = () => { ready = true; playSlides(); };
  if (sessionStorage.getItem("sm-front-loaded") || reduced) {
    Object.values(parts).forEach(vis);
    cards.forEach(vis);
    fv.classList.add("is-loaded");
    finish();
  } else {
    parts.nav.style.opacity = "0";
    parts.nav.style.transition = "opacity 1s ease";
    loader.classList.add("is-active");
    // Original initLoadingAnimation: once the Hero images are all loaded (.5s later if there are none, 5s at the latest) it fills 3s from the open time and then clears
    const t0 = Date.now();
    let done = false;
    const reveal = (fn) => { if (done) return; done = true; setTimeout(fn, Math.max(0, 3000 - (Date.now() - t0))); };
    const imgs = [...fv.querySelectorAll("img")];
    const whenReady = (fn) => {
      if (!imgs.length) { setTimeout(() => reveal(fn), 500); return; }
      let k = 0;
      const one = () => { if (++k >= imgs.length) reveal(fn); };
      imgs.forEach((im) => (im.complete ? one() : (im.addEventListener("load", one), im.addEventListener("error", one))));
      setTimeout(() => reveal(fn), 5000);
    };
    whenReady(() => {
      loader.classList.add("is-hidden");
      vis(parts.slides);
      finish();
      setTimeout(() => { vis(parts.lead); vis(parts.ill); }, 1500);
      setTimeout(() => { vis(parts.logo); parts.nav.style.opacity = ""; }, 3000);
      setTimeout(() => cards.forEach((c, i) => setTimeout(() => vis(c), 200 * i)), 3300);
      setTimeout(() => { fv.classList.add("is-loaded"); sessionStorage.setItem("sm-front-loaded", "1"); }, 4000);
    });
  }

  // ── While the hero is visible, hide the header logo and chat button and rotate the photos ──
  head.classList.add("is-logo-invisible");
  new IntersectionObserver(([en]) => {
    head.classList.toggle("is-logo-invisible", en.isIntersecting);
    chat.classList.toggle("is-visible", !en.isIntersecting);
    if (en.isIntersecting && ready) playSlides(); else stopSlides();
  }).observe(fv);

  // ── Number strip: attach one more copy of the list so it loops seamlessly, pause when off screen ──
  const track = $(".pl__track");
  const list = track.querySelector(".pl__list");
  const clone = list.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.append(clone);
  new IntersectionObserver(([en]) => track.classList.toggle("is-paused", !en.isIntersecting)).observe($(".pl__status"));

  // ── Season photos: every 4s the next one peels away from bottom to top, and the bar fills over 4s ──
  const season = $(".season");
  const items = [...season.querySelectorAll(".season__item")];
  const dots = [...season.querySelectorAll(".season__dot")];
  let si = 0, last = -1, first = true, sTimer = null;
  const reveal = (n) => {
    const prev = last;
    items.forEach((it, k) => {
      const now = k === n, below = k < n, was = k === prev;
      it.classList.toggle("is-active", now);
      if (now) {
        it.style.zIndex = items.length + 2;
        it.style.opacity = 1;
        if (!first) { it.style.transition = "none"; it.style.setProperty("--reveal", 0); it.offsetWidth; it.style.transition = ""; }
        it.style.setProperty("--reveal", 1);
      } else if (below || was) {
        it.style.zIndex = below ? n + 1 : items.length + 1;
        it.style.setProperty("--reveal", 1);
        it.style.opacity = 1;
      } else {
        it.style.zIndex = 0;
        it.style.setProperty("--reveal", 0);
        it.style.opacity = 0;
      }
    });
    first = false;
    last = n;
    dots.forEach((d, k) => { d.classList.remove("is-active"); if (k === n) { d.offsetWidth; d.classList.add("is-active"); } });
  };
  const loop = () => { clearInterval(sTimer); if (!reduced) sTimer = setInterval(() => { si = (si + 1) % items.length; reveal(si); }, 4000); };
  reveal(0);
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting) {
      season.classList.remove("is-paused");
      const a = season.querySelector(".season__dot.is-active");
      if (a) { a.classList.remove("is-active"); a.offsetWidth; a.classList.add("is-active"); }
      loop();
    } else { clearInterval(sTimer); season.classList.add("is-paused"); }
  }, { threshold: 0.25 }).observe(season);
  dots.forEach((d, k) => d.addEventListener("click", () => { si = k; reveal(si); loop(); }));

  // ── Reading card row (original swiper 8.4.7 settings as they are): under 500 width 1.3 slides / under 800 2 slides / above that 3.5 slides, gap 24, offset -200 at the front, autoplay only when visible ──
  const jt = $("[data-journal]");
  const js = new Swiper(jt, {
    slidesPerView: 1.3, spaceBetween: 12, centeredSlides: true, speed: 1200, loop: true,
    autoplay: { delay: 3000, disableOnInteraction: false },
    breakpoints: { 500: { slidesPerView: 2 }, 800: { slidesPerView: 3.5, spaceBetween: 24, slidesOffsetBefore: -200 } },
    on: { init(sw) { sw.autoplay.stop(); } },
  });
  SM.cursorNav(jt, js, { ignore: ".jc, .sm-btn" });
  new IntersectionObserver(([en]) => (en.isIntersecting && !reduced ? js.autoplay.start() : js.autoplay.stop())).observe(jt);
})();
