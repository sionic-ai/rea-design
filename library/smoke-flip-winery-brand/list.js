// Wine list: photo hero, smoke boundary, name list (bottle photo follows the mouse), and detail window.
// Original values: bottle photo lerp 1→.1 (.6s power2.out on first movement) · clip .6s · cleanup .6s after leaving
// · window open smoke progress 0→1.2 1.6s power2.out, close →2.1 1.6s power1.inOut · panel opacity 1s (after .6s) · remote 1.4s later
// · vertical swiper 8 (loop · loopedSlides 2 · speed 1000 · parallax · longSwipesRatio .1, vertical at 1024 and above)
// · Year description swiper (speed 600, no drag) · year number swiper (speed 300, 4 slots), year photo opacity 1s.
(() => {
  MW.page.list = (c) => {
    const { reduced, touch, isMobile } = MW;
    const $ = (s, r = c) => r.querySelector(s);
    const $$ = (s, r = c) => [...r.querySelectorAll(s)];

    MW.heroTitle(c);
    // Original c-hero_background -reverse: receives progress from #hero top top (it doesn’t move since the Hero isn’t small)
    MW.progressCss($(".mw-lhero__bg"), { start: "top top" });
    $$(".mw-shader-wrap").forEach(MW.scrollShader);
    $$(".mw-tri .mw-split").forEach((el) => MW.splitOnScroll(el, { repeat: true }));
    $$(".mw-wine .mw-split").forEach((el) => MW.splitOnScroll(el, { start: "top 85%" }));

    // ---------- Bottle photo follows the mouse height ----------
    const list = $(".mw-wines");
    const visual = $(".mw-wines__visual");
    if (!touch && !isMobile) {
      const lerp = { v: 1 };
      let my = 0, ly = 0, moved = false, leaveCall = null, live = false, offCall = null;
      // Original ProductList.trigger: when the list enters view, per-frame calculation turns on (even without mouse movement), and turns off .5s after it leaves
      ScrollTrigger.create({
        trigger: list,
        start: "top bottom",
        end: "bottom top",
        toggleClass: "is-inview",
        onToggle: (st) => {
          offCall && offCall.kill();
          if (st.isActive) live = true;
          else offCall = gsap.delayedCall(0.5, () => (live = false));
        },
      });
      const enter = () => {
        if (!moved) return;
        leaveCall && (leaveCall.kill(), visual.classList.remove("is-leaving"));
        gsap.delayedCall(0.01, () => visual.classList.add("is-active"));
      };
      list.addEventListener("mousemove", (e) => {
        my = e.clientY;
        if (!moved) {
          moved = true;
          enter();
          gsap.to(lerp, { v: 0.1, duration: 0.6, ease: "power2.out" });
        }
      });
      list.addEventListener("mouseenter", enter);
      list.addEventListener("mouseleave", () => {
        if (!moved) return;
        visual.classList.add("is-leaving");
        visual.classList.remove("is-active");
        leaveCall = gsap.delayedCall(0.6, () => visual.classList.remove("is-leaving"));
      });
      // A slot for a different photo per name — change the number on the label to see which bottle it is
      $$(".mw-wine").forEach((w) =>
        w.addEventListener("mouseenter", () => visual.firstElementChild.setAttribute("data-label", `Wine Bottle ${String(+w.dataset.index + 1).padStart(2, "0")} Front view · black background · portrait 4:5`))
      );
      MW.tick(() => {
        if (!live) return;
        ly += (my - ly) * lerp.v;
        const r = list.getBoundingClientRect();
        const top = r.top, h = r.height;
        const vh = visual.offsetHeight;
        // Original ProductList.animate: shifts the list by shrinking its height to (height − photo height) (does not clamp)
        visual.style.setProperty("--mouse-y", gsap.utils.mapRange(0, h, 0, h - vh, ly - top).toFixed(1));
      });
    }

    // ---------- Detail window ----------
    const pop = $(".mw-pop");
    const smoke = new MW.Smoke($(".mw-pop__smoke", pop), { start: "transparent", end: "--site-grey-04", alpha: 1, always: true });
    const slider = new Swiper($(".mw-pop__slider", pop), {
      direction: "horizontal",
      loop: true,
      loopedSlides: 2,
      slidesPerView: 1,
      speed: reduced ? 0 : 1000,
      parallax: !isMobile,
      longSwipesRatio: 0.1,
      shortSwipes: isMobile,
      breakpoints: { 1024: { direction: "vertical" } },
    });
    slider.slideToLoop(0, 0);
    let open = false, leave = null;
    const show = (i) => {
      leave && leave.kill();
      slider.slideToLoop(i, 0);
      open = true;
      pop.classList.add("is-open");
      MW.lenis && MW.lenis.stop();
      gsap.fromTo(smoke.o, { progress: 0 }, { progress: 1.2, duration: reduced ? 0 : 1.6, ease: "power2.out", overwrite: true });
    };
    const hide = () => {
      if (!open) return;
      open = false;
      pop.classList.remove("is-open");
      MW.lenis && MW.lenis.start();
      gsap.to(smoke.o, { progress: 2.1, duration: reduced ? 0 : 1.6, ease: "power1.inOut", overwrite: true });
      leave = gsap.delayedCall(1.6, () => (smoke.o.progress = 0));
    };
    $$(".mw-wine").forEach((w) => {
      w.addEventListener("click", () => show(+w.dataset.index));
      w.addEventListener("keydown", (e) => e.key === "Enter" && show(+w.dataset.index));
    });
    $(".-close", pop).addEventListener("click", hide);
    $(".-up", pop).addEventListener("click", () => slider.slidePrev());
    $(".-down", pop).addEventListener("click", () => slider.slideNext());
    MW.on(document, "keydown", (e) => {
      if (e.key === "Escape") hide();
      if (!open) return;
      if (e.key === "ArrowUp") slider.slidePrev();
      if (e.key === "ArrowDown") slider.slideNext();
    });

    // Year picker: original PopupProductsDescription. The description swipes sideways, the number row follows, and that year’s bottle photo changes.
    // loop clones the slides, so hook up the clones too
    const swipers = [slider];
    $$(".mw-pop__slide", pop).forEach((sl) => {
      const descEl = $(".mw-pop__desc", sl), pagEl = $(".mw-pop__years-row", sl);
      if (!descEl) return;
      const desc = new Swiper(descEl, { loop: false, speed: reduced ? 0 : 600, allowTouchMove: false });
      const pag = new Swiper(pagEl, { loop: false, speed: reduced ? 0 : 300, slidesPerView: 4, slidesPerGroup: 1, shortSwipes: false, allowTouchMove: false });
      swipers.push(desc, pag);
      const bullets = $$(".mw-pop__year", sl), imgs = $$(".mw-pop__image .mw-img", sl);
      const state = () => {
        const i = desc.activeIndex;
        bullets.forEach((b, k) => b.classList.toggle("is-active", k === i));
        imgs.forEach((im, k) => im.classList.toggle("is-active", k === i));
        if (i < pag.slides.length) pag.slideTo(i);
        pagEl.classList.toggle("is-beginning", desc.isBeginning);
        pagEl.classList.toggle("is-end", desc.isEnd);
      };
      desc.on("slideChange", state);
      bullets.forEach((b) => b.addEventListener("click", () => desc.slideTo(+b.dataset.index)));
      $(".swiper-button-prev", pagEl).addEventListener("click", () => desc.isBeginning || desc.slidePrev());
      $(".swiper-button-next", pagEl).addEventListener("click", () => desc.isEnd || desc.slideNext());
      state();
    });

    return () => {
      MW.lenis && MW.lenis.start();
      swipers.forEach((s) => s.destroy(true, true));
    };
  };
})();
