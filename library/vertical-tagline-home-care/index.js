// Home page (original pageTopLoad): tagline .8s (delay .3) → turns on (1.6s) together with slide start·photo brightness 1.6 to 1 → header 1s (delay .2).
// Slides use the same slick as the original (fade, 1s ease-out, every 4s), and when the 2nd–4th slide is current the tagline turns white (css :has).
// Over 0–400px of scroll the photo shrinks inward by 40rem (phone 20rem).
(() => {
  const { EC } = window;
  EC.page("home", {
    ready(box) {
      const { reduced, isSP, ease } = EC;
      const hero = box.querySelector(".hm-hero");
      const imgs = hero.querySelector(".hm-hero__img");
      const $slide = jQuery(imgs.querySelector(".hm-hero__slide"));
      const copy = hero.querySelector(".hm-hero__copy");
      const copySP = box.querySelector(".hm-hero__sp");
      const contents = [box, document.querySelector(".ec-foot")];

      $slide.slick({
        fade: true,
        speed: 1000,
        easing: "ease-out",
        autoplay: false,
        autoplaySpeed: 4000,
        pauseOnHover: false,
        pauseOnFocus: false,
        infinite: true,
        arrows: false,
        dots: false,
        slidesToShow: 1,
        centerMode: true,
        centerPadding: "0px",
        variableWidth: false,
        draggable: false,
        accessibility: false,
        swipe: false,
        swipeToSlide: false,
        touchMove: false,
      });
      $slide.slick("slickGoTo", 0);

      const go = () => {
        $slide.slick("slickPlay");
        imgs.classList.add("is-active");
        EC.revealHead(isSP() ? { duration: 0.6, delay: 0.8, ease: ease.inOutQuad } : { duration: 1, delay: 0.2, ease: ease.inOutQuad });
        EC.lenis && EC.lenis.start();
      };
      const intro = [];
      if (reduced) {
        gsap.set([...contents, copy, copySP], { opacity: 1 });
        imgs.classList.add("is-active");
        EC.revealHead({ duration: 0 });
      } else {
        intro.push(gsap.set(contents, { opacity: 1, delay: 0.3 }));
        EC.lenis && EC.lenis.stop();
        intro.push(
          isSP()
            ? gsap.fromTo(copySP, { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.4, ease: ease.outCubic, onComplete: go })
            : gsap.to(copy, { opacity: 1, duration: 0.8, delay: 0.3, ease: ease.outQuad, onComplete: go })
        );
      }

      // With scroll, the photo inner padding changes (original --image-padding). When the end of the English paragraph rises 80px (phone -60) above the screen bottom the sky photo turns on
      const lead = box.querySelector(".hm-lead");
      const en = lead.querySelector(".en");
      let ticking = false;
      const update = () => {
        ticking = false;
        const p = Math.min(Math.max(scrollY / 400, 0), 1);
        hero.style.setProperty("--pad", `${(isSP() ? 20 : 40) * p}rem`);
        const r = en.getBoundingClientRect();
        lead.classList.toggle("is-active", r.bottom + (isSP() ? -60 : 80) <= innerHeight);
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };
      addEventListener("scroll", onScroll, { passive: true });
      addEventListener("resize", update);
      update();

      return () => {
        intro.forEach((t) => t.kill());
        removeEventListener("scroll", onScroll);
        removeEventListener("resize", update);
        $slide.slick("unslick");
        EC.lenis && EC.lenis.start();
      };
    },
  });
})();
