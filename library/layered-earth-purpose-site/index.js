// First page: original TopPage order. When the loader lifts, copy letters fly in spinning and land (.68s, .04s per letter), and .9s later the globe art layers follow in turn (CSS delay),
// After the globe background has fully grown, the two-hands Lottie plays at 1.6s. The sections below: scroll-linked parallax, elastic pop-up, seamless Swiper flow.
(() => {
  const { lenis, reduce, isSP, lottieAt } = window.mk;
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;

  // ---------- Loader → first scene ----------
  const loader = q(".mk-loader");
  qa(".mk-loader__copy span").forEach((s, i, all) => { s.style.animationDelay = `${-1.44 + 0.06 * i * (24 / Math.max(all.length, 1))}s`; });
  qa(".mk-cp__t").forEach((t, i) => { t.style.transitionDelay = `${0.04 * i}s`; });
  const intro = () => {
    html.classList.add("is-kv-show");
    setTimeout(() => {
      html.classList.add("is-earth-show", "is-year-show");
      // Original: 1.6 seconds after the globe background’s transitionend, create the hand Lottie
      setTimeout(() => qa(".mk-hand").forEach((h) => {
        const anim = lottieAt(h);
        h.classList.add("is-show");
        ScrollTrigger.create({ trigger: h, start: "top bottom", end: "bottom top", onToggle: (s) => h.classList.toggle("is-play", s.isActive && !reduce) });
        anim?.play();
      }), reduce ? 0 : 1800 + 1600);
      qa(".mk-earth .mk-lot").forEach((el) => lottieAt(el, { delay: 2.7 }));
    }, reduce ? 0 : 900);
  };
  const start = () => {
    if (!loader || reduce) { loader?.remove(); intro(); return; }
    loader.classList.add("is-out");
    setTimeout(() => loader.remove(), 1600);
    setTimeout(intro, 800);
  };
  // Original: as soon as loading finishes the loader is lifted (fades over .4s after .8s) while the copy flies in — measured, the screen changes a lot around 0.9s
  if (document.readyState === "complete") setTimeout(start, 100);
  else addEventListener("load", () => setTimeout(start, 100));
  lenis.scrollTo(0, { immediate: true, force: true });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // ---------- Brand pass — a dark green band and half globe spring up elastically (2s elastic), bubbles are tied to scroll and scatter ----------
    const mask = q(".mk-purpose__mask"), half = q(".mk-half");
    const lift = isSP() ? 50 : 150, rise = isSP() ? 150 : 300, off = isSP() ? "400px" : "450px";
    ScrollTrigger.create({
      trigger: half, start: `bottom bottom+=${off}`, end: `bottom top-=${off}`,
      onEnter: () => {
        q(".mk-purpose").classList.add("is-popup");
        gsap.fromTo(mask, { y: lift, scaleY: 0.1 }, { y: 0, scaleY: 1, duration: 2, overwrite: true, ease: "elastic.out(0.9,0.4)" });
        gsap.fromTo(half, { y: rise, scaleY: 1.5, scaleX: 0.8 }, { y: 0, scaleY: 1, scaleX: 1, delay: 0.2, duration: 2, overwrite: true, ease: "elastic.out(1,0.6)" });
      },
      onLeaveBack: () => {
        q(".mk-purpose").classList.remove("is-popup");
        gsap.to(mask, { y: lift, scaleY: 0.1, duration: 0.3, overwrite: true, ease: "none" });
        gsap.to(half, { y: rise, duration: 0.3, overwrite: true, ease: "none" });
      },
    });
    const blobs = q(".mk-blobs");
    const from = [[100, 350, 0.16], [-150, 250, 0.24], [100, 300, 0.24], [-150, 400, 0.08], [-100, 300, 0.4], [100, 250, 0.3]];
    const tl = gsap.timeline({ scrollTrigger: { trigger: blobs, start: "top+=250px bottom", end: "bottom 40%", scrub: 1 }, defaults: { ease: "none" } });
    qa(".mk-blob", blobs).forEach((b, i) => {
      const [x, y, d] = from[i % from.length];
      tl.fromTo(b, isSP() ? { scale: 0.5, x: x * 0.3, y: y * 0.3 } : { scale: 0, x, y }, { x: 0, y: 0, scale: 1, delay: d }, "s1");
    });

    // ---------- Sustainability — plate, picture and clouds at different speeds (scrub .8) ----------
    const sus = q(".mk-sus");
    const st = gsap.timeline({ scrollTrigger: { trigger: sus, start: "top bottom", end: "bottom top", scrub: 0.8 }, defaults: { ease: "none" } });
    st.fromTo(q(".mk-sus .mk-sec__in"), { y: -50 }, { y: 100 }, "s1")
      .fromTo(q(".mk-sus__illust"), { y: 0 }, { y: -50 }, "s1")
      .fromTo(q(".mk-sus__clouds .-c1"), { y: 0 }, { y: 150 }, "s1")
      .fromTo(q(".mk-sus__clouds .-c2"), { y: 0 }, { y: 180 }, "s1");

    // ---------- Immersion — balloons and butterflies stick to scroll and come down, flowers sway every 4s, birds rest 4s then hop ----------
    const emb = q(".mk-emb");
    const et = gsap.timeline({ scrollTrigger: { trigger: emb, start: "top 105%", end: "bottom 100%", scrub: 0 } });
    et.fromTo(q(".mk-emb__deco .-balloon"), { y: -50, x: -20 }, { y: 50, x: 0 }, "<")
      .fromTo(qa(".mk-emb__deco .-fly1, .mk-emb__deco .-fly2"), { y: -20, x: 30 }, { y: 20, x: 0 }, "<");
    const playOnView = { trigger: emb, start: "top bottom", end: "bottom top", toggleActions: "play pause pause pause" };
    gsap.fromTo(q(".mk-emb__deco .-flower"), { skewY: -10, rotate: -4, transformOrigin: "center bottom" }, { skewY: 10, rotate: 4, duration: 4, ease: "power1.inOut", yoyo: true, repeat: -1, scrollTrigger: playOnView });
    qa(".mk-emb__deco .-bird1, .mk-emb__deco .-bird2").forEach((b, i) => {
      gsap.timeline({ repeat: -1, repeatDelay: 4, delay: 0.2 * i, scrollTrigger: playOnView })
        .fromTo(b, { rotate: 0, transformOrigin: "45% 90%" }, { rotate: 6, duration: 0.1, ease: "power1.in" })
        .to(b, { rotate: 0, duration: 0.1, ease: "power1.in" })
        .to(b, { rotate: 6, duration: 0.1, ease: "power1.in" })
        .to(b, { rotate: 0, duration: 0.1, ease: "power1.in" });
    });

    // ---------- My Purpose — street illustration and photo row grow from below and settle (scrub 1) ----------
    const my = q(".mk-my");
    const r = { trigger: my, start: "top 110%", end: "top 45%", scrub: 1 };
    gsap.fromTo(q(".mk-my__town"), { y: 120, scale: 1.3 }, { y: 0, scale: 1, scrollTrigger: r });
    gsap.fromTo(q(".mk-my__swiper"), { y: 180, scale: 1.2 }, { y: 0, scale: 1, scrollTrigger: r });
  });

  // Original createSwiper: loop · 5 seconds (1.2 seconds on phones) · centered · autoplay delay 0 — a band that flows without breaks
  const sw = q(".mk-my__swiper");
  if (sw && window.Swiper) setTimeout(() => {
    const sp = isSP();
    new Swiper(sw, {
      loop: true, speed: sp ? 1200 : 5000, initialSlide: 1, slidesPerView: sp ? 1.4 : "auto", spaceBetween: sp ? 40 : 20, centeredSlides: true, grabCursor: !sp,
      autoplay: reduce ? false : { disableOnInteraction: false, delay: sp ? 1500 : 0, pauseOnMouseEnter: false },
      on: { sliderFirstMove: () => sw.classList.add("is-drag"), slideChangeTransitionEnd: () => sw.classList.remove("is-drag") },
    });
  }, 1200);
})();
