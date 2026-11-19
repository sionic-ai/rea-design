// Shared across pages — lenis smooth scroll, once when visible (inView), button arrow in and out (enterleave), menu panel · hamburger,
// Home small logo, floating round button, wipe photo slider, clock section at the very end
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.snSite = { reduce };

  // Attach lenis 1.0.42 defaults (lerp .1) to the GSAP tick
  if (!reduce && window.Lenis) {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.snSite.lenis = lenis;
  }

  // Once when visible — enters within 40% top and bottom of the screen (10% for short ones), is-in
  const once = (e) => { if (e.isIntersecting) e.target.classList.add("is-in"); };
  const ioLong = new IntersectionObserver((es) => es.forEach(once), { rootMargin: "40% 0px -40% 0px" });
  const ioShort = new IntersectionObserver((es) => es.forEach(once), { rootMargin: "10% 0px -10% 0px" });
  document.querySelectorAll(".js-in").forEach((el) => (reduce ? el.classList.add("is-in") : (el.classList.contains("js-in-short") ? ioShort : ioLong).observe(el)));

  // Hover adds is-hover, leaving adds is-leave — both are removed when the arrow animation ends
  document.querySelectorAll(".js-enterleave").forEach((el) => {
    const last = el.dataset.enterleave;
    el.addEventListener("mouseenter", () => el.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => el.classList.add("is-leave"));
    el.querySelectorAll(".arrow").forEach((a) => a.addEventListener("animationend", (e) => { if (!last || e.animationName === last) el.classList.remove("is-hover", "is-leave"); }));
  });

  // Menu board: opening stops scrolling, and on close the board is removed after the hamburger lines rewind (barBack)
  const nav = document.querySelector(".sn-nav"), burger = document.querySelector(".sn-burger");
  if (nav && burger) {
    const bar = burger.querySelector(".bar");
    const lock = (on) => { document.body.style.overflow = on ? "hidden" : ""; const l = window.snSite.lenis; if (l) on ? l.stop() : l.start(); };
    const clear = () => { [nav, burger].forEach((n) => n.classList.remove("is-active", "is-closing")); lock(false); };
    burger.addEventListener("click", () => {
      if (nav.classList.contains("is-active")) { nav.classList.add("is-closing"); burger.classList.add("is-closing"); lock(false); }
      else { nav.classList.add("is-active"); burger.classList.add("is-active"); lock(true); }
    });
    bar.addEventListener("animationend", (e) => { if (e.animationName === "sn-bar-back") clear(); });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", clear));
    addEventListener("resize", clear);
  }

  // Home: after the first section, a small top-left logo opens from the top
  const homeLogo = document.querySelector(".sn-header__logo.is-home"), trigger = document.querySelector(".js-logo-trigger");
  if (homeLogo && trigger) new IntersectionObserver((es) => es.forEach((e) => homeLogo.classList.toggle("is-active", e.boundingClientRect.top < 0)), { rootMargin: "0px 0px -100% 0px", threshold: 0 }).observe(trigger);

  // Floating circle: floats from the start, hides when the footer enters above 80% of the screen
  const float = document.querySelector(".sn-float");
  if (float) {
    const foot = document.querySelector(".sn-footer");
    if (foot) new IntersectionObserver((es) => es.forEach((e) => float.classList.toggle("is-hidden", e.isIntersecting)), { rootMargin: "0px 0px -20% 0px" }).observe(foot);
  }

  // Wiping photo: Splide fade (2.4s, 5s interval) — while the new slide opens from the right edge, the previous one stays underneath with is-close
  window.snSite.wipe = (el, opts = {}) => {
    if (!el || !window.Splide) return null;
    const s = new Splide(el, { type: "fade", rewind: true, speed: 2400, easing: "cubic-bezier(0.25, 1, 0.5, 1)", pagination: false, arrows: false, autoplay: !reduce, interval: 5000, drag: false, pauseOnHover: false, ...opts });
    let first = true;
    s.on("move", (next, prev) => {
      const slides = s.Components.Elements.slides;
      if (first) { first = false; slides[0].classList.remove("is-first-load"); }
      const closing = [...slides].find((n) => n.classList.contains("is-close"));
      if (closing) closing.classList.remove("is-close");
      slides[next].classList.add("is-close");
      const done = function () { slides[next].classList.remove("is-close"); this.removeEventListener("transitionend", done); };
      slides[prev].addEventListener("transitionend", done);
    });
    s.mount();
    return s;
  };

  // Last clock section: shows the current time every 1 second, photo changes every 6 seconds with a 3-second straight crossfade
  const clock = document.querySelector(".sn-clock");
  if (clock) {
    const two = (n) => String(n).padStart(2, "0");
    const tick = () => { const d = new Date(); clock.textContent = `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`; };
    tick(); setInterval(tick, 1000);
  }
  const clockSlide = document.querySelector(".sn-block .splide");
  if (clockSlide && window.Splide) new Splide(clockSlide, { type: "fade", rewind: true, autoplay: !reduce, pauseOnHover: false, easing: "linear", speed: 3000, interval: 6000, arrows: false, pagination: false, drag: false }).mount();

  // Map: four buttons light up in turn every 3 seconds and the big map slides to that region in 1s. Pressing one recounts from that spot
  const big = document.querySelector(".sn-map__big"), btns = [...document.querySelectorAll(".sn-map__btn")];
  if (big && btns.length) {
    let i = 0, timer = 0;
    const pick = (k) => { i = k; btns.forEach((b, n) => b.classList.toggle("is-active", n === k)); big.dataset.state = k + 1; };
    const run = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => pick((i + 1) % btns.length), 3000); };
    btns.forEach((b, n) => b.addEventListener("click", () => { pick(n); run(); }));
    pick(0); run();
  }
  addEventListener("load", () => ScrollTrigger.refresh());
})();
