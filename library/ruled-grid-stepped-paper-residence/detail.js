// Product detail — same library and values as the original:
//  Hero swiper 9 (fade crossFade · speed 1000 · autoplay 6000, stops on the last slide),
//  Sales Point·floor plan use jQuery slick 1.8.1 (2 slides · speed 1000 · dots · below 767px one centered slide + 30px on both sides),
//  Below 767px the featured content panel overlaps the next panel by -60px and sinks to brightness .5 (original top.js).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Notice bar — as in the original, appears 500ms after load over .4s, and closing or pressing the backdrop makes it vanish in .4s
  const notice = document.querySelector(".d-notice");
  if (notice) {
    addEventListener("load", () => setTimeout(() => { notice.classList.add("is-show"); window.lenis?.stop(); }, 500));
    const close = () => { notice.classList.remove("is-show"); window.lenis?.start(); };
    notice.querySelector(".d-notice__close").addEventListener("click", close);
    notice.querySelector(".d-notice__bg").addEventListener("click", close);
  }

  addEventListener("load", () => {
    if (window.Swiper) {
      new Swiper(".d-mv__slide", {
        loop: false, speed: 1000, effect: "fade", fadeEffect: { crossFade: true },
        autoplay: reduce ? false : { delay: 6000, disableOnInteraction: false },
        on: { reachEnd() { this.autoplay?.stop(); } },
      });
    }
    if (window.jQuery && jQuery.fn.slick) {
      const $ = jQuery;
      const slick = (sel, now, all, dots) => {
        $(sel)
          .on("init", (e, s) => { $(now).text(s.currentSlide + 1); $(all).text(s.slideCount); })
          .on("beforeChange", (e, s, cur, next) => $(now).text(next + 1))
          .slick({
            autoplay: false, speed: reduce ? 0 : 1000, swipe: true, arrows: false, slidesToShow: 2,
            dots: true, dotsClass: "dots-class", appendDots: $(dots), pauseOnFocus: false, pauseOnHover: false,
            responsive: [{ breakpoint: 768, settings: { centerPadding: "30px", centerMode: true, slidesToShow: 1 } }],
          });
      };
      slick(".d-charm__slider", ".d-count__now:not(.d-count__now--plan)", ".d-count__all:not(.d-count__all--plan)", ".d-dots--charm");
      slick(".d-plan__slider", ".d-count__now--plan", ".d-count__all--plan", ".d-dots--plan");
    }
    ScrollTrigger.refresh();
  });

  gsap.matchMedia().add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const items = gsap.utils.toArray(".d-con");
    items.forEach((item, i) => {
      const next = items[i + 1];
      if (next) gsap.timeline({ scrollTrigger: { trigger: item, start: "top top", end: "bottom top", scrub: true } }).to(next, { marginTop: "-60px" });
      if (i < items.length - 1) gsap.timeline({ scrollTrigger: { trigger: item, start: "30% top", end: "bottom top", scrub: true } }).to(item, { filter: "brightness(.5)" });
    });
  });
})();
