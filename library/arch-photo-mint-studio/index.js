// Home page — timing exactly as in the original inline script: on first visit, .6s · .8s after the loader curtain starts lifting (document 4.8s · 5.0s), vertical text lines,
// Returning visitors get 2.8s·3.0s. The hero photo Swiper crossfades for 3s every 5s only when there are two or more slides.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mae = document.querySelector(".mm-fv__mae");
  const ato = document.querySelector(".mm-fv__ato");
  const fade = (sel) => {
    if (document.querySelectorAll(`${sel} .swiper-slide`).length < 2) return;
    new Swiper(sel, { loop: true, effect: "fade", fadeEffect: { crossFade: true }, autoplay: { delay: 5000, disableOnInteraction: false }, speed: 3000 });
  };
  const t0 = performance.now();
  const at = (ms, fn) => setTimeout(fn, Math.max(0, ms - (performance.now() - t0)));
  document.addEventListener("fx:open", (e) => {
    if (reduce) { mae.style.opacity = ato.style.opacity = 1; return; }
    if (e.detail?.again) {
      at(2800, () => mae.classList.add("st"));
      at(3000, () => ato.classList.add("st"));
      at(500, () => { fade(".mm-fv__sl"); fade(".mm-fv__sr"); });
    } else {
      setTimeout(() => mae.classList.add("st"), 600);
      setTimeout(() => ato.classList.add("st"), 800);
      setTimeout(() => { fade(".mm-fv__sl"); fade(".mm-fv__sr"); }, 800);
    }
  }, { once: true });

  // Photo strip — Swiper 6 with the original settings as is (24s per slide, delay 0 autoplay = Seamless straight flow)
  new Swiper(".mm-hslide__sw", { loop: true, loopedSlides: 2, slidesPerView: "auto", speed: 24000, autoplay: { delay: 0, disableOnInteraction: false }, allowTouchMove: false, centeredSlides: true });

  // Partner experts — loop, arrows at 1s. The original uses loopedSlides 1 on the phone board
  new Swiper(".mm-member", { loop: true, loopedSlides: matchMedia("(max-width: 768px)").matches ? 1 : 4, slidesPerView: "auto", effect: "slide", speed: 1000, navigation: { nextEl: ".mm-next", prevEl: ".mm-prev" } });

  // About decoration — turns on in turn at 0, .5, .7, 1s when 150px before the top edge of the About section (original op1, .5s)
  const about = document.querySelector(".mm-about");
  const decos = [...document.querySelectorAll(".mm-about .mm-deco")];
  const lag = [0, 500, 700, 1000];
  let shown = false;
  const check = () => {
    if (shown || scrollY < about.getBoundingClientRect().top + scrollY - 150) return;
    shown = true;
    decos.forEach((d, i) => setTimeout(() => d.classList.add("is-on"), reduce ? 0 : lag[i]));
    removeEventListener("scroll", check);
  };
  addEventListener("scroll", check, { passive: true });
})();
