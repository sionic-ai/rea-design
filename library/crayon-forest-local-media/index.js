// First page — loader (logo outline drawn in 1.4s), town photo strip (Splide auto flow .7)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const html = document.documentElement;

  // Loader: after .4s the one-line phrase goes to .85x and 10px down with back.inOut(4) over 1s (.2s apart), while the border is drawn .3s later over 1.4s, and
  // After .2s the small and big text appear in .8s, the center line .3s, rests .6s, and the curtain lifts in .6s
  const loader = document.querySelector(".ym-loader");
  if (loader) {
    if (reduce) loader.classList.add("is-hide");
    else {
      html.classList.add("is-loaderactive");
      window.ymLenis?.stop();
      const outer = loader.querySelector(".ym-loader__outer"), line = loader.querySelector(".ym-loader__line");
      const lo = outer.getTotalLength(), ll = line.getTotalLength();
      gsap.set(outer, { strokeDasharray: lo, strokeDashoffset: lo });
      gsap.set(line, { strokeDasharray: ll, strokeDashoffset: ll });
      gsap.timeline({ delay: 0.4, defaults: { ease: "linear" }, onComplete: () => { loader.classList.add("is-hide"); html.classList.remove("is-loaderactive"); window.ymLenis?.start(); } })
        .fromTo(".js-catch", { scale: 0.85, y: 10 }, { ease: "back.inOut(4)", duration: 1, scale: 1, y: 0, opacity: 1, stagger: 0.2 }, "<")
        .set(outer, { opacity: 1 }, "<+.3")
        .to(outer, { strokeDashoffset: 0, duration: 1.4 }, "<")
        .to(".ym-loader__kana", { duration: 0.8, ease: "sine.out", opacity: 1 }, "+=.2")
        .to(".ym-loader__kanji", { duration: 0.8, ease: "sine.out", opacity: 1 }, "<")
        .set(line, { opacity: 1 }, "<")
        .to(line, { strokeDashoffset: 0, duration: 0.3 }, "<")
        .to(loader, { ease: "sine.out", duration: 0.6, autoAlpha: 0 }, "+=.6");
    }
  }

  // Town photo strip — draggable, and when released it flows left at .7 speed (one at a time on phones)
  const slider = document.querySelector(".ym-about__slider");
  if (slider && window.Splide) {
    new Splide(slider, {
      type: "loop", drag: "free", arrows: false, pagination: false, perPage: 3, mediaQuery: "max",
      breakpoints: { 750: { perPage: 1 } },
      autoScroll: reduce ? false : { speed: 0.7, pauseOnHover: false, pauseOnFocus: false },
    }).mount(window.splide?.Extensions || {});
  }
})();
