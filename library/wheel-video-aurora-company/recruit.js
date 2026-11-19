// Careers: five-photo parallax (on wide screens from the message section to the top edge of the code section, on phones only the photo cell · scrub .8 · power1.out),
// Materials · staff · office-scene sliders (same Swiper 5.4.5 as the original · .5s/.7s/.5s loop), FAQ open/close (jQuery animate 400ms swing).
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const imgs = (n) => q(`.image--${n}`);
  ZB.mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: ".rm__message", start: "top bottom", endTrigger: ".rm__values", end: "top top", scrub: 0.8 } })
      .fromTo(imgs("01"), { y: "5%" }, { y: "-3%", ease: "power1.out" }, 0)
      .fromTo(imgs("02"), { y: "-15%" }, { y: "-5%", ease: "power1.out" }, 0)
      .fromTo(imgs("03"), { y: "20%" }, { y: "-10%", ease: "power1.out" }, 0)
      .fromTo(imgs("04"), { y: "-15%" }, { y: "5%", ease: "power1.out" }, 0)
      .fromTo(imgs("05"), { y: "10%" }, { y: "-20%", ease: "power1.out" }, 0);
  });
  ZB.mm.add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ scrollTrigger: { trigger: ".rm__images", start: "top bottom", end: "bottom top", scrub: 0.8 } })
      .fromTo(imgs("01"), { y: "5%" }, { y: "-5%", ease: "power1.out" })
      .fromTo(imgs("02"), { y: "10%" }, { y: "-20%", ease: "power1.out" });
  });

  if (window.Swiper) {
    const deck = q(".rd__inner");
    new Swiper(q(".swiper-container", deck), {
      speed: 500, grabCursor: true, initialSlide: 0, slidesPerView: "auto", touchRatio: 1, mousewheel: { forceToAxis: true },
      navigation: { nextEl: q(".is-next", deck), prevEl: q(".is-prev", deck) },
    });

    const st = q(".rs__slider"), slides = st.querySelectorAll(".swiper-slide"), wrap = q(".swiper-wrapper", st);
    const prog = q(".fraction-progress", st);
    const vis = (i) => slides.forEach((s, k) => { const on = k >= i && k <= i + 2; s.style.opacity = on ? "1" : "0"; s.style.visibility = on ? "visible" : "hidden"; });
    const page = (sw) => { q(".fraction-progress__current", prog).textContent = sw.realIndex + 1; q(".fraction-progress__total", prog).textContent = sw.slides.length; prog.style.setProperty("--progress", (sw.realIndex + 1) / sw.slides.length); };
    new Swiper(q(".swiper-container", st), {
      speed: 700, grabCursor: true, initialSlide: 0, slidesPerView: 1, touchRatio: 1.3, mousewheel: { forceToAxis: true },
      navigation: { nextEl: q(".is-next", st), prevEl: q(".is-prev", st) },
      on: {
        init() { vis(this.realIndex); page(this); },
        // Like the original, the width of one cell is fixed at 74rem (100% on phone) when shifting — the next two cells show through on the right
        transitionStart() { wrap.style.transform = `translateX(calc(${ZB.isSp() ? "100%" : "74rem"} * ${this.realIndex} * -1))`; },
        slideChange() { vis(this.realIndex); page(this); },
      },
    });

    const g = q(".rg__slider");
    new Swiper(q(".swiper-container", g), { speed: 500, loop: true, slidesPerView: "auto", navigation: { nextEl: q(".is-next", g), prevEl: q(".is-prev", g) } });
  }

  // FAQ: height 0 → full height over 400ms swing, closing to 0 over 400ms
  const swing = "sine.inOut";
  document.querySelectorAll(".rf__item").forEach((it) => {
    const a = q(".rf__a", it);
    q(".rf__q", it).addEventListener("click", () => {
      const open = !it.classList.contains("is-open");
      it.classList.toggle("is-open", open);
      gsap.killTweensOf(a);
      if (open) gsap.fromTo(a, { height: 0 }, { height: a.scrollHeight, duration: ZB.reduce ? 0 : 0.4, ease: swing, onComplete: () => (a.style.height = "auto") });
      else gsap.fromTo(a, { height: a.offsetHeight }, { height: 0, duration: ZB.reduce ? 0 : 0.4, ease: swing, onComplete: () => (a.style.height = "") });
    });
  });
})();
