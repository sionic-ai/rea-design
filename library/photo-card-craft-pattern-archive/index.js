// Home page — the original uses framer-motion. Curves are converted to GSAP curves of the same formula (easeOut = power1.out, easeInOut = power1.inOut, backOut = back.out(1.525))
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];

  // Slider — same Swiper as the original (one slide at a time, gap 0, grab cursor, drag 1.5x, .6s), and the side menu buttons move it to that slide
  const btns = qa(".am-side__nav button");
  const swiper = window.Swiper && new window.Swiper(".am-hero .swiper", { spaceBetween: 0, slidesPerView: 1, grabCursor: true, touchRatio: 1.5, speed: 600 });
  if (swiper) {
    const mark = () => btns.forEach((b) => b.classList.toggle("is-active", +b.dataset.slide === swiper.activeIndex));
    swiper.on("slideChange", mark);
    btns.forEach((b) => b.addEventListener("click", () => swiper.slideTo(+b.dataset.slide)));
  }

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)", pc: "(min-width: 769px)" }, (ctx) => {
    const { reduce, pc } = ctx.conditions;

    // Hero. The Lottie artwork plays .5s after it has fully loaded. When it ends, the logo drops from above (−110px), the side menu comes from the left (−110%), and the plate margin goes from 174→234px in .5s
    const box = q(".am-s0__lottie");
    const enter = () => {
      if (!pc) return;
      gsap.to(".am-hlogo", { y: 0, duration: reduce ? 0 : 0.5, ease: "power1.inOut" });
      gsap.to(".am-side", { x: 0, duration: reduce ? 0 : 0.5, ease: "power1.inOut" });
      gsap.to(".am-hero__main", { paddingLeft: 234, duration: reduce ? 0 : 0.5, ease: "power1.inOut" });
    };
    if (pc) {
      gsap.set(".am-hlogo", { y: -110 });
      gsap.set(".am-side", { x: "-110%" });
      gsap.set(".am-hero__main", { paddingLeft: 174 });
    }
    let anim, t;
    if (box && window.lottie && window.amHeroLottie) {
      anim = window.lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: false, animationData: window.amHeroLottie });
      if (reduce) { anim.goToAndStop(anim.totalFrames - 1, true); enter(); }
      else {
        anim.addEventListener("complete", enter);
        const go = () => { t = setTimeout(() => anim.play(), 500); };
        if (anim.isLoaded) go(); else anim.addEventListener("loaded_images", go);
      }
    } else enter();

    // Vertical section titles, shop titles, news titles — at 30% visible, rise 3rem from below in .7s
    qa(".am-vhead, .am-shopcard__h, .am-news__h").forEach((h) => {
      gsap.fromTo(h, { opacity: 0, y: reduce ? 0 : "3rem" }, { opacity: 1, y: 0, duration: reduce ? 0 : 0.7, ease: "power1.out", scrollTrigger: { trigger: h.closest(".am-shopcard") || h, start: "30% bottom", once: true } });
    });

    // Card — the photo opens with the clip-wipe-in part (.8s), and at the same spot the name tag pops out after 1s over .7s and the hand-drawn art pops out after 1.2s from .6x
    qa(".am-sec .am-card").forEach((card) => {
      const wrap = q(".am-label-wrap", card), ill = q(".am-illust", card);
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "30% bottom", once: true } });
      if (wrap) tl.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.7, ease: "power1.out", delay: reduce ? 0 : 1 }, 0);
      if (ill) tl.fromTo(ill, { opacity: 0, scale: reduce ? 1 : 0.6 }, { opacity: 1, scale: 1, duration: reduce ? 0 : 0.7, ease: "back.out(1.525)", delay: reduce ? 0 : 1.2 }, 0);
    });

    // “Other” cell — the gray panel opens from the left in .8s and the text follows 1s later
    const others = q(".am-others");
    if (others) {
      gsap.timeline({ scrollTrigger: { trigger: others, start: "30% bottom", once: true } })
        .fromTo(".am-others__bg", { clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" }, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: reduce ? 0 : 0.8, ease: "power1.inOut" }, 0)
        .fromTo(".am-others__t", { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.7, ease: "power1.out", delay: reduce ? 0 : 1 }, 0);
    }
    return () => { clearTimeout(t); if (anim) anim.destroy(); };
  });
})();
