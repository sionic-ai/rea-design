// OUR IDENTITY motion. Ranges and values are carried over from the original bundle’s ScrollTrigger settings (video pinned center→bottom, character pinned top→bottom-300, entry threshold -15%).
(function () {
  const { $, $$, px, lenis, inview } = ZK;

  ZK.ready(() => {
    // Hovering the small video unfolds the orange circle arrow (original c-gyre__arrow)
    const small = $(".a-msg__small");
    small.addEventListener("mouseenter", () => small.classList.add("is-hover"));
    small.addEventListener("mouseleave", () => small.classList.remove("is-hover"));
    const mm = gsap.matchMedia();
    mm.add({ pc: "(min-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { pc, reduce } = ctx.conditions;
      if (reduce) return;
      ScrollTrigger.create({ trigger: ".a-msg__video", endTrigger: ".a-msg", start: "center center", end: pc ? "bottom bottom" : "bottom center", pin: true, pinSpacing: false, invalidateOnRefresh: true });

      const sec = $(".a-vision"), imgs = $$(".a-vision__chara .in");
      const c1 = $(".a-vision__chara .c1");
      const end = () => (innerHeight > c1.offsetHeight ? `bottom bottom-=${px(300)}` : "bottom bottom");
      $$(".a-vision__chara .c1, .a-vision__chara .c2").forEach((c) => ScrollTrigger.create({ trigger: c, endTrigger: sec, start: "top top", end, pin: true, pinSpacing: false, invalidateOnRefresh: true }));
      gsap.fromTo(imgs, { yPercent: () => (innerHeight > c1.offsetHeight ? 5 : 0) }, { yPercent: -5, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end, scrub: true, invalidateOnRefresh: true } });
    });

    // Shows the white text layer only for the height that overlaps the video panel.
    const video = $(".a-msg__video"), light = $(".a-msg__catch .light");
    const clip = () => {
      const v = video.getBoundingClientRect(), l = light.getBoundingClientRect();
      const top = Math.min(l.height, Math.max(0, v.top - l.top)), bottom = Math.max(0, l.height - (v.bottom - l.top));
      light.style.clipPath = `inset(${top}px 0px ${bottom}px 0px)`;
    };
    lenis.on("scroll", clip);
    gsap.ticker.add(clip);

    const showIO = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && e.boundingClientRect.top > 0) e.target.classList.add("is-show");
      else if (!e.isIntersecting && e.boundingClientRect.top > 0) e.target.classList.remove("is-show");
    }), { rootMargin: "0% 0% -15% 0%" });
    $$(".a-catch .ja").forEach((el) => showIO.observe(el));
    inview(".a-value .inner, .a-info .inner");
  });
})();
