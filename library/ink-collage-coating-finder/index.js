(() => {
  const { reduce } = window.arSite;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const kv = $(".js-kv");
  const kvTtl = $(".js-kv_ttl");
  const spans = ".js-kv_ttl span";

  // The title is pinned to the screen center (half of the hero height)
  const place = () => { kvTtl.style.top = `${kv.offsetHeight / 2}px`; };
  place();
  addEventListener("resize", place);

  // Loading only the first time in the same window — the logo fades out after .9s over 1s, the panel after .4s over 1s (power2.in), then title lines rise from 3rem below with a .2s offset over .75s
  const loader = $(".js-loading");
  const logo = $(".js-loading_logo_wrapper");
  const first = !sessionStorage.getItem("ar-loaded");
  if (first && !reduce) {
    sessionStorage.setItem("ar-loaded", "1");
    loader.classList.add("is-active");
    document.body.classList.add("is-active");
    gsap.set(spans, { opacity: 0, y: "3rem" });
    const run = () => {
      if (run.done) return;
      run.done = true;
      gsap.timeline()
        .to(logo, { duration: 1, filter: "blur(6px)", ease: "power2.out" }, "<0.9")
        .to(logo, { duration: 1, autoAlpha: 0, ease: "power2.out" }, "<")
        .to(loader, { duration: 1, autoAlpha: 0, ease: "power2.in" }, "<0.4")
        .to(spans, { opacity: 1, y: 0, stagger: 0.2, duration: 0.75, ease: "power2.out", onComplete: () => window.arHeader(0) }, ">");
    };
    const v = $(".js-video");
    if (v && v.readyState < 3) v.addEventListener("canplay", run, { once: true });
    else run();
    setTimeout(run, 7000);
  } else {
    document.body.classList.add("is-active");
    window.arHeader();
    gsap.set(spans, { opacity: 0 });
    setTimeout(() => {
      const above = kv.getBoundingClientRect().bottom <= 0;
      kvTtl.style.position = above ? "absolute" : "fixed";
      if (!above) gsap.set(spans, { opacity: 1 });
    }, 300);
  }

  // When the video’s bottom edge goes above the top of the screen, the title blurs and disappears over .85s (reverses on return)
  gsap.matchMedia().add({ ok: "(prefers-reduced-motion: no-preference)", rm: "(prefers-reduced-motion: reduce)" }, (c) => {
    gsap.to(kvTtl, {
      autoAlpha: 0, duration: c.conditions.rm ? 0 : 0.85, filter: "blur(6px)", ease: "power2.out",
      scrollTrigger: {
        trigger: kv, start: "bottom top", toggleActions: "play none none reverse",
        onEnterBack: () => { kvTtl.style.position = "fixed"; gsap.to(spans, { opacity: 1 }); },
      },
    });
  });

  // ‹Brand lineup 01› — past 85% of the screen it twists and settles down (.75s)
  window.arInview("js-blur_txt");

  // Brand photos: 1s cross fade every 2s, can’t be swiped by hand
  $$(".js-brand_swiper").forEach((el) => new Swiper(el, {
    loop: true, effect: "fade", speed: reduce ? 0 : 1000, fadeEffect: { crossFade: true },
    autoplay: reduce ? false : { delay: 2000, disableOnInteraction: false },
    simulateTouch: false, allowTouchMove: false,
  }));

  // Video plays only when visible
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0 });
  $$(".js-video").forEach((v) => io.observe(v));
})();
