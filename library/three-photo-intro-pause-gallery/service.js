// Menu: photo slides use Splide fade (every 3s for 2s, number beside dots, drag), video slides don’t auto-advance and move to the next when finished (original data-menu-video-slide),
// Plan collapse — height .3s (original data-accordion duration)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-menu-slides]").forEach((el) => {
    const movie = el.hasAttribute("data-movie");
    new Splide(el, { arrows: false, pagination: true, type: "fade", rewind: true, autoplay: !movie && !reduce, interval: 3000, speed: reduce ? 0 : 2000, drag: true, pauseOnHover: false, pauseOnFocus: false }).mount();
  });
  document.querySelectorAll("[data-acc]").forEach((d) => {
    const sum = d.querySelector("summary"), body = d.querySelector(".kn-acc__body");
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        d.classList.remove("is-active");
        gsap.to(body, { height: 0, duration: reduce ? 0 : 0.3, onComplete: () => { d.open = false; gsap.set(body, { clearProps: "height" }); } });
      } else {
        d.open = true;
        d.classList.add("is-active");
        gsap.fromTo(body, { height: 0 }, { height: "auto", duration: reduce ? 0 : 0.3, clearProps: "height" });
      }
    });
  });
})();
