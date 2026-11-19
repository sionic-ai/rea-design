// First page — hero entrance (photo clip 1.2s · copy 60px→0 .6s · white bands .25s apart), four Swipers (crossfade 2s · 5s auto),
// Three flowing white curves, quick menu open/close, recruit card fan rotation. Values are straight from the original top.js.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const STOP = "Slide stop", START = "Slide start";
  const bullet = (i, cls) => `<div class="${cls} circle-pagination"><div class="circle-pagination__inner"><svg width="26" height="26" viewBox="0 0 26 26"><circle cx="13" cy="13" r="11.5"/></svg><span></span></div></div>`;
  const pg = (el) => ({ el, clickable: true, renderBullet: bullet });
  const auto = reduce ? false : { delay: 5000, disableOnInteraction: false };

  // Pause button: pressing stops auto-advance (the circle around the dot fills) and pressing again resumes
  const stopBtn = (id, sw) => {
    const b = document.getElementById(id);
    if (!b) return;
    b.addEventListener("click", () => {
      const wrap = b.parentNode, stopped = wrap.classList.contains("-stop"), t = b.querySelector(".js-slider-stop-text");
      if (stopped) { sw.autoplay.start(); b.setAttribute("aria-label", STOP); t && (t.textContent = STOP); }
      else { sw.autoplay.stop(); b.setAttribute("aria-label", START); t && (t.textContent = START); }
      wrap.classList.toggle("-stop");
    });
  };

  const kv = new Swiper(".js-top-slider", { loop: true, effect: "fade", speed: 2000, pagination: pg(".p-top-kv__slider-pagination"), autoplay: auto });
  const about = new Swiper(".js-top-about-slider", { loop: true, slidesPerView: 1, spaceBetween: 0, centeredSlides: true, pagination: pg(".js-top-about-slider-pagination"), autoplay: auto });
  const galBreak = { 768: { loop: false, slidesPerView: "auto", spaceBetween: 31, centeredSlides: false } };
  const g1 = new Swiper(".js-gallery-slider01", { loop: true, slidesPerView: 1.59, spaceBetween: 20, centeredSlides: true, pagination: pg(".js-gallery-slider01-pagination"), autoplay: auto, breakpoints: galBreak });
  const g3 = new Swiper(".js-gallery-slider03", { loop: true, slidesPerView: 1.59, spaceBetween: 20, centeredSlides: true, pagination: pg(".js-gallery-slider03-pagination"), autoplay: auto, breakpoints: galBreak });
  const kvStop = document.getElementById("p-top-kv__slider-stop");
  stopBtn("p-top-kv__slider-stop", kv);
  stopBtn("js-top-about-slider-stop", about);
  stopBtn("js-gallery-slider01-stop", g1);
  stopBtn("js-gallery-slider03-stop", g3);

  // ── Hero entrance: when it ends, start the Hero auto-advance ──
  const head = document.querySelector(".yg-h");
  if (reduce) gsap.set([head, ".js-kv-anime-heading", ".js-kv-anime-autoAlpha"], { autoAlpha: 1 });
  else {
    kvStop.parentNode.classList.add("-stop");
    kv.autoplay.stop();
    gsap.set(head, { autoAlpha: 0 });
    gsap.set(".js-kv-anime-heading", { y: 60 });
    gsap.to(".js-kv-anime-heading", { duration: 0.6, ease: "power1.out", autoAlpha: 1, y: 0, delay: 0 });
    gsap.to(head, { duration: 0.6, ease: "power1.out", autoAlpha: 1, delay: 1 });
    gsap.to(".js-kv-anime-text-bg", { duration: 0.8, ease: "power1.out", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", delay: 0.4, stagger: { each: 0.25, from: "start" } });
    gsap.to(".js-kv-anime-text-bg span", { duration: 0.8, ease: "power1.out", clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)", delay: 0.8, stagger: { each: 0.25, from: "start" } });
    gsap.to(".js-kv-anime-slider", { duration: 1.2, ease: "power1.out", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", delay: 0.4 });
    gsap.to(".js-kv-anime-autoAlpha", { duration: 0.6, ease: "power1.out", autoAlpha: 1, delay: 1, onComplete: () => { kv.autoplay.start(); kvStop.parentNode.classList.remove("-stop"); } });
  }

  // ── Flowing white curve: immediate on the hero, on About·Careers when it reaches 80% of the screen ──
  gsap.registerPlugin(ScrollTrigger);
  ygLine(document.querySelector(".js-kv-anime-line-pc"), { len: 2424, draw: 3.6, erase: 1.4, travel: 5, from: -60, to: 60 });
  ygLine(document.querySelector(".js-top-about-line-pc"), { len: 1832, draw: 3, erase: 1, travel: 4, from: -60, to: 60, trigger: true });
  ygLine(document.querySelector(".js-top-recruit-line-pc"), { len: 2417, draw: 3.4, erase: 1.2, travel: 4.6, from: -60, to: 60, trigger: true });

  // ── Quick menu: inside the Hero it expands at the top and collapses after scrolling 200px down (768 and up) ──
  const pc = matchMedia("(min-width: 768px)");
  let t1 = null, t2 = null, armed = false;
  const byWidth = (e) => { clearTimeout(t1); t1 = setTimeout(() => (e.matches ? ygQuick.open() : ygQuick.close()), 200); };
  addEventListener("scroll", () => {
    if (!armed) { armed = true; return; }
    clearTimeout(t2);
    t2 = setTimeout(() => { if (!pc.matches) return; if (scrollY === 0) ygQuick.open(); else if (scrollY > 200) ygQuick.close(); }, 100);
  }, { passive: true });
  byWidth(pc);
  pc.addEventListener("change", byWidth);

  // Hiring card: rotates the front, front-right, front-left and back positions one slot at a time (position change is css .3s)
  let f = 0;
  const spin = (d) => {
    const items = document.querySelectorAll(".js-recruit-slider-item"), n = items.length;
    f = (f + d + n) % n;
    items.forEach((el, i) => {
      el.classList.remove("-front", "-rightfront", "-leftfront", "-back");
      el.classList.add(i === f ? "-front" : i === (f + 1) % n ? "-rightfront" : i === (f - 1 + n) % n ? "-leftfront" : "-back");
    });
  };
  document.getElementById("js-recruit-slider-prev").addEventListener("click", () => spin(-1));
  document.getElementById("js-recruit-slider-next").addEventListener("click", () => spin(1));
})();
