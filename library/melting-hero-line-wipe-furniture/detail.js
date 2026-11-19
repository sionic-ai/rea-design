/* Product detail — on wide screens, clicking a photo opens a zoom view from below (vertical slider, free scroll, wheel) with clip-path .6s circ.inOut,
   On phones the photo row uses Swiper’s creative effect (slides back 100 while turning 10°, .7s), and the small photo row below works as thumbnails (original swipeSlider·zoom) */
(() => {
  const { $, $$, pc } = EDI;
  EDI.view("item", (c) => {
    const html = document.documentElement;
    const head = $(".e-phead", c);
    // The original head photo turns on 1s after loading and then the panel lifts — the copy has no photo to load, so it turns on after .7s and lifts as the turn-on ends
    const lit = () => setTimeout(() => head?.classList.add("is-in"), 700);
    if (document.readyState === "complete") lit(); else addEventListener("load", lit, { once: true });
    const made = [];
    if (!pc.matches) {
      const thumb = new Swiper($(".e-pdata__thumb", c), { spaceBetween: 6, slidesPerView: 8, freeMode: true, watchSlidesProgress: true });
      const gallery = new Swiper($(".e-pdata__sw", c), {
        spaceBetween: 10, speed: 700, effect: "creative",
        creativeEffect: { prev: { shadow: false, translate: [0, 0, -100], rotate: [0, 10, 0] }, next: { shadow: false, translate: [0, 0, -100], rotate: [0, -10, 0] } },
        thumbs: { swiper: thumb, autoScrollOffset: 1 },
      });
      made.push(thumb, gallery);
      return () => made.forEach((s) => s.destroy(true, true));
    }

    const box = $(".e-zoom", c);
    const items = $$(".e-pdata__item", c);
    let sw = null, open = false;
    gsap.set(box, { clipPath: "inset(100% 0% 0% 0%)" });
    const enter = () => open || html.classList.add("is-zoom-hover");
    const leave = () => open || html.classList.remove("is-zoom-hover");
    const show = (i) => {
      if (open) return;
      open = true;
      html.classList.add("is-zoom-open");
      EDI.lenis?.stop();
      gsap.set(box, { clipPath: "inset(100% 0% 0% 0%)", display: "block" });
      sw ||= new Swiper($(".e-zoom__swiper", c), { spaceBetween: 10, slidesPerView: "auto", freeMode: true, centeredSlides: true, direction: "vertical", mousewheel: true, centerInsufficientSlides: true });
      sw.enable();
      sw.update();
      sw.slideTo(i, 0);
      gsap.to(box, { duration: 0.6, ease: "circ.inOut", clipPath: "inset(0% 0% 0% 0%)" });
    };
    const hide = () => {
      if (!open) return;
      EDI.lenis?.start();
      gsap.to(box, {
        duration: 0.6, ease: "circ.inOut", clipPath: "inset(0% 0% 100% 0%)",
        onComplete: () => {
          open = false;
          html.classList.remove("is-zoom-open", "is-zoom-hover");
          gsap.set(box, { display: "none" });
          sw?.slideTo(0, 0);
          sw?.disable();
        },
      });
    };
    const clicks = items.map((it, i) => () => show(i));
    items.forEach((it, i) => { it.addEventListener("mouseenter", enter); it.addEventListener("mouseleave", leave); it.addEventListener("click", clicks[i]); });
    box.addEventListener("click", hide);
    const esc = (e) => e.key === "Escape" && hide();
    addEventListener("keyup", esc);
    return () => {
      items.forEach((it, i) => { it.removeEventListener("mouseenter", enter); it.removeEventListener("mouseleave", leave); it.removeEventListener("click", clicks[i]); });
      box.removeEventListener("click", hide);
      removeEventListener("keyup", esc);
      html.classList.remove("is-zoom-open", "is-zoom-hover");
      sw?.destroy(true, true);
    };
  });
})();
