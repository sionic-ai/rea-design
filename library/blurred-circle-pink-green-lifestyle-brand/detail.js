// Detail motion: two story pins (pm.story from shared), three fixed photos crossfading (the next one appears as the pink mist border clears),
// Current-section marker of the product thumbnail list, three sliders, and hiding the sales box when the footer shows.
(() => {
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const st = (trigger, start, end) => ({ trigger, start, end, invalidateOnRefresh: true, scrub: 1 });

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, ({ conditions }) => {
    const { pc, reduce } = conditions;
    const items = qa(".pm-commit__item");
    if (reduce) {
      gsap.set(".pm-story__frame-img", { width: "101%", height: "100%" });
      gsap.set(".pm-story__img", { scale: 1 });
      gsap.set(".pm-story__item--1 .pm-story__copy, .pm-story__item--1 .pm-story__jp, .pm-story__item--1 .pm-story__eng", { autoAlpha: 1 });
      qa(".pm-story__item--1 .pm-story__jp p").forEach((p) => p.classList.add("is-active"));
      return;
    }

    pm.story(q(".pm-story"), pc);
    gsap.to(".pm-concept__frame", { opacity: 0, duration: 3, scrollTrigger: st(".pm-commit", "top bottom", "top bottom") });

    // Three pinned photos: in each cell the pink haze of the current photo clears (border 100px→0) as it fades out, and the next photo goes 0→1
    const spaces = qa(pc ? ".pm-commit__spaces .pm-commit__sp" : ".pm-commit__spaces-sp .pm-commit__sp");
    gsap.set(items, { opacity: (i) => (i === 0 ? 1 : 0) });
    for (let i = 0; i < items.length - 1; i++) {
      const bg = q(".pm-commit__bg", items[i]);
      if (pc) {
        gsap.to(bg, { borderWidth: 0, opacity: 1, duration: 1, scrollTrigger: st(spaces[i], "top center", "bottom bottom") });
        gsap.to(q(".wf-img", items[i]), { opacity: 0, duration: 1, scrollTrigger: st(spaces[i], "top 70%", "bottom bottom") });
        gsap.to(items[i + 1], { opacity: 1, duration: 1, scrollTrigger: st(spaces[i], "top 30%", "bottom bottom") });
      } else {
        gsap.timeline({ scrollTrigger: st(spaces[i], "top 70%", "bottom bottom") })
          .to(items[i], { autoAlpha: 0, duration: 1, ease: "none" }, 0)
          .to(items[i + 1], { autoAlpha: 1, duration: 1, ease: "none" }, 0)
          .to(bg, { borderWidth: 0, opacity: 1, duration: 1, ease: "none" }, 0);
      }
    }
  });

  // Product thumbnail list: the last photo past the screen center line is the current section
  const thumbs = qa(".pm-product__thumb-img");
  const shots = qa(".pm-product__item");
  const mark = () => {
    let at = 0;
    shots.forEach((el, i) => { if (el.getBoundingClientRect().top <= innerHeight * 0.5) at = i; });
    thumbs.forEach((t, i) => t.classList.toggle("is-active", i === at));
  };
  addEventListener("scroll", mark, { passive: true });
  mark();

  // Sale box: hides when the top edge of the footer reaches the bottom of the screen
  const online = q(".pm-online");
  ScrollTrigger.create({ trigger: ".pm-footer", start: "top bottom", onEnter: () => online.classList.add("is-hidden"), onLeaveBack: () => online.classList.remove("is-hidden") });

  // Original Swiper values as they are: story photos 3.7 (phone 2.24) · other work 3.215 (phone 1.38), 0.8 seconds, endless
  pm.slider(q(".pm-pstory__viewport"), { slidesPerView: 2.24, spaceBetween: 10, speed: 800, loop: true, breakpoints: { 768: { slidesPerView: 3.7, spaceBetween: 10 } } });
  pm.slider(q(".pm-other__slide"), { slidesPerView: 1.38, spaceBetween: 24, speed: 800, loop: true, breakpoints: { 768: { slidesPerView: 3.215, spaceBetween: 80 } } });

  // Phone product: drag 1.1 slides at a time, and three thumbs at the bottom left follow the current slide (tap to go to that slide). Removed when the screen gets wider.
  let product = null, thumbsSw = null;
  const productSp = () => {
    const isSp = matchMedia("(max-width: 767px)").matches;
    if (isSp && !product) {
      thumbsSw = new Swiper(".pm-product__slide-thumb", { slidesPerView: 3, spaceBetween: 10, watchSlidesProgress: true });
      product = new Swiper(".pm-product__viewport", { slidesPerView: 1.1, spaceBetween: 0, centeredSlides: false, slidesOffsetAfter: innerWidth * 0.1, loop: false, speed: 800, grabCursor: true, thumbs: { swiper: thumbsSw } });
    }
    if (!isSp && product) { product.destroy(true, true); thumbsSw.destroy(true, true); product = thumbsSw = null; }
  };
  productSp();
  addEventListener("resize", productSp);
})();
