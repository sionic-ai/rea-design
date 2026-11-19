(() => {
  kfFx.register("widen-strip-slider", (el, { options, reduce, hover }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || !window.Swiper || !track.querySelector(".swiper-slide")) return;
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const bar = part("bar"), num = part("num"), title = part("title"), more = part("more");
    const slides = [...track.querySelectorAll(".swiper-slide")].map((s) => ({ title: s.dataset.title || "", link: s.dataset.link || "" }));
    const count = +options.count || slides.length;
    const delay = +options.delay || 5000;
    const sp = matchMedia("(max-width: 767px)").matches;
    const text = [title, more].filter(Boolean);
    const fill = (on) => { if (!bar) return; bar.style.transitionDuration = on && !reduce ? delay + "ms" : "0s"; bar.style.transform = `scaleX(${on ? 1 : 0})`; };
    const show = (sw) => {
      const s = slides[sw.realIndex] || slides[0];
      if (title) title.innerHTML = s.title;
      if (more && s.link) more.href = s.link;
      if (num) num.textContent = String((sw.realIndex % count) + 1).padStart(2, "0");
    };
    const swiper = new Swiper(track, {
      spaceBetween: +(options.gap ?? (sp ? 4 : 8)),
      slidesPerView: +options.per || (sp ? 6 : 12),
      centeredSlides: true,
      loop: slides.length > (+options.per || 12),
      allowTouchMove: sp || !hover,
      autoplay: reduce ? false : { delay, disableOnInteraction: false },
      navigation: part("next") && part("prev") ? { nextEl: part("next"), prevEl: part("prev") } : false,
      on: {
        init(sw) { show(sw); fill(true); },
        slideChangeTransitionStart() {
          fill(false);
          if (!text.length) return;
          gsap.killTweensOf(text);
          gsap.to(text, { opacity: 0, x: -10, ease: "power2.out", duration: reduce ? 0 : 0.22 });
        },
        slideChangeTransitionEnd(sw) {
          fill(true);
          show(sw);
          if (title) { gsap.killTweensOf(title); gsap.fromTo(title, { opacity: 0, x: 7, scaleX: 1.04 }, { opacity: 1, x: 0, scaleX: 1, ease: "circ.out", duration: reduce ? 0 : 1.22, delay: reduce ? 0 : 0.3 }); }
          if (more) { gsap.killTweensOf(more); gsap.fromTo(more, { opacity: 0, x: 7 }, { opacity: 1, x: 0, ease: "circ.out", duration: reduce ? 0 : 1.22, delay: reduce ? 0 : 0.5 }); }
        },
      },
    });
    return () => { if (text.length) { gsap.killTweensOf(text); gsap.set(text, { clearProps: "all" }); } swiper.destroy(true, true); };
  });
})();
