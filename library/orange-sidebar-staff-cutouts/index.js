// Home — one of three hero photos picked at random, channel banner hover preview, photo column beside About flows (28px/s), magazine slider.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const items = document.querySelectorAll(".t-kv__item");
  if (items.length) {
    const pick = Math.floor(Math.random() * items.length);
    items.forEach((it, i) => {
      it.style.visibility = i === pick ? "visible" : "hidden";
      it.style.opacity = i === pick ? "1" : "0";
      it.style.zIndex = i === pick ? "1" : "0";
    });
    // Turn on after loading so the ripple reveal and speech bubble run at the same time as the panel entrance
    const on = () => items[pick].classList.add("is-active");
    document.readyState === "complete" ? on() : addEventListener("load", on, { once: true });
  }

  const hoverOk = matchMedia("(min-width: 769px) and (any-hover: hover) and (pointer: fine)");
  document.querySelectorAll(".t-insta").forEach((a) => {
    const pv = a.querySelector(".t-insta__pv");
    if (!pv) return;
    a.addEventListener("mouseenter", () => hoverOk.matches && pv.classList.add("is-active"));
    a.addEventListener("mouseleave", () => pv.classList.remove("is-active"));
  });

  // Photo pillar beside About — duplicates one set and joins them, flowing endlessly in half-length ÷ 28 seconds (horizontal on phone, opposite direction)
  const slider = document.querySelector(".t-about__slider"), wrapEl = slider && slider.querySelector(".t-about__wrap");
  if (window.gsap && wrapEl && wrapEl.children.length > 1) {
    [...wrapEl.children].forEach((c) => { const k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); wrapEl.append(k); });
    let tween = null, raf = 0;
    const build = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (tween) tween.kill();
        gsap.set(wrapEl, { x: 0, y: 0 });
        if (reduce) return;
        const mobile = innerWidth <= 768;
        const d = mobile ? wrapEl.scrollWidth / 2 : wrapEl.scrollHeight / 2;
        if (!d) return;
        if (mobile) { gsap.set(wrapEl, { x: -d }); tween = gsap.to(wrapEl, { x: 0, duration: d / 28, ease: "none", repeat: -1 }); }
        else tween = gsap.to(wrapEl, { y: -d, duration: d / 28, ease: "none", repeat: -1 });
      });
    };
    new ResizeObserver(build).observe(slider);
    build();
  }

  if (window.Swiper) {
    document.querySelectorAll(".t-swiper-mag").forEach((el) => {
      const scope = el.closest(".t-mag");
      new Swiper(el, {
        slidesPerView: 2, spaceBetween: 15, threshold: 10, loop: true, loopAdditionalSlides: 4, mousewheel: { forceToAxis: true }, speed: 1000,
        navigation: { nextEl: scope.querySelector(".button-next"), prevEl: scope.querySelector(".button-prev") },
        breakpoints: { 980: { slidesPerView: 3, spaceBetween: 27 } },
      });
    });
  }
})();
