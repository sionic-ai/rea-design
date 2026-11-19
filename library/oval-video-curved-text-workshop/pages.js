// Per-section staging — each time the main body switches, shared.js calls this section’s function again and cleans up with the returned release function
(() => {
  const swiperIn = (wrap, opts) => {
    const el = wrap?.querySelector("[data-slider]"), dots = wrap?.querySelector(".dots");
    if (!el || !window.Swiper) return () => {};
    const sw = new Swiper(el, {
      speed: 800, loop: true, initialSlide: 0, slidesPerGroup: 1, slidesPerView: 1, centeredSlides: true, grabCursor: true,
      autoplay: { delay: 3000, disableOnInteraction: false },
      pagination: { el: dots, clickable: true },
      on: { init: () => { el.classList.add("is-on"); wrap.classList.add("_on"); } },
      ...opts,
    });
    return () => sw.destroy(true, true);
  };
  window.shPages = {
    index(root, { reduce }) {
      const offs = [];
      // Dashed lines, once visible, are drawn in order with a 1.2s delay each (original data-anim="line")
      const lines = [...root.querySelectorAll(".sh-kv__line p")];
      if (reduce) lines.forEach((l) => l.classList.add("_view"));
      else {
        const t = [];
        const io = new IntersectionObserver((es) => {
          if (!es.some((e) => e.isIntersecting)) return;
          io.disconnect();
          lines.forEach((l, k) => t.push(setTimeout(() => l.classList.add("_view"), k * 1200)));
        }, { rootMargin: "0px 0px -15% 0px" });
        io.observe(root.querySelector(".sh-kv__line"));
        offs.push(() => { io.disconnect(); t.forEach(clearTimeout); });
      }
      offs.push(swiperIn(root.querySelector("#topics [data-slider-wrap]")));
      // Measures height so the experience description panel sits centered on screen
      const inner = root.querySelector(".sh-work__sticky [data-inner]");
      if (inner) {
        const ro = new ResizeObserver(() => inner.style.setProperty("--sh-sticky-h", Math.ceil(inner.getBoundingClientRect().height) + "px"));
        ro.observe(inner);
        offs.push(() => ro.disconnect());
      }
      return () => offs.forEach((f) => f());
    },
    about(root, { reduce }) {
      // As the first photo passes the screen center and moves up, it approaches its resting position and 1x scale from its initial position and scale (css)
      const sec = root.querySelector('[data-article="about"] [data-section="1"]');
      const img = sec?.querySelector("[data-img-inner]"), pin = sec?.querySelector("._pin");
      if (!sec || !img || !pin || reduce) return () => {};
      img.style.removeProperty("transform");
      const m = new DOMMatrixReadOnly(getComputedStyle(img).transform === "none" ? undefined : getComputedStyle(img).transform);
      const s0 = m.a, x0 = m.m41, y0 = m.m42;
      let raf = 0;
      const draw = () => {
        raf = 0;
        const y = scrollY, h = innerHeight, p = pin.getBoundingClientRect(), r = sec.getBoundingClientRect();
        const a = y + p.top + p.height * 0.5 - h * 0.5, b = y + r.top - h * 0.25;
        const k = Math.min(1, Math.max(0, (y - a) / (b - a)));
        img.style.transform = `translateX(${x0}px) translateY(${y0 * (1 - k)}px) scale(${s0 + (1 - s0) * k})`;
      };
      const on = () => raf || (raf = requestAnimationFrame(draw));
      addEventListener("scroll", on, { passive: true });
      addEventListener("resize", on);
      draw();
      return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); };
    },
    workshop(root) {
      return swiperIn(root.querySelector("[data-slider-wrap]"), { effect: "fade", fadeEffect: { crossFade: true } });
    },
    access() {},
  };
})();
