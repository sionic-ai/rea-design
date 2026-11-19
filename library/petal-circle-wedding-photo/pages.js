// One set of page motion — register with LW.page(name, attach) and shared.js attaches and detaches it to that page at first load and on every swup transition.
// Original figures (main.js): parallax is all scrub · linear, circle outline 1.5s cubic-bezier(.165,.84,.44,1), lookbook fade 2s · 5s, case photo 2.5s power4.out.
(() => {
  const em = (n) => `${n}em`;
  const drift = (targets, from, to, trigger, start = "top bottom", end = "bottom top") =>
    gsap.fromTo(targets, { y: from }, { y: to, ease: "none", scrollTrigger: { trigger, start, end, scrub: true } });
  // Turns on when it enters the screen (top half or more within the area minus the bottom 20%), turns off when it leaves downward again — circle border · circle window
  const inview = (el, cls, margin = "0% 0% -20% 0%") => {
    const a = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.boundingClientRect.top > 0 && el.classList.add(cls)), { rootMargin: margin, threshold: [0, 0.5, 1] });
    const b = new IntersectionObserver((es) => es.forEach((e) => !e.isIntersecting && e.boundingClientRect.top > 0 && e.intersectionRatio === 0 && el.classList.remove(cls)), { threshold: 0 });
    a.observe(el); b.observe(el);
    LW.off.push(() => { a.disconnect(); b.disconnect(); });
  };

  LW.page("home", (main) => {
    const sp = LW.sp();
    const h1 = main.querySelector(".lw-about__mark");
    if (h1) drift(h1, "0em", em(-(sp ? 0.5 : 1.5)), h1, "bottom center", "bottom top");
    const kv = main.querySelector(".lw-about__kv");
    if (kv) sp ? drift(kv.firstElementChild, "-3em", "3em", kv, "center bottom") : drift(kv.firstElementChild, "-200px", "200px", kv);
    const img = (k) => main.querySelector(`.lw-about__img.${k}`);
    const a = sp ? 2 : 4, b = 3, c = 3, d = sp ? 3 : 4;
    if (img("i1")) drift([img("i1"), img("i2")], em(a), em(-a), img("i1"));
    if (img("i3")) drift(img("i3"), em(b), em(-b), img("i3"));
    if (img("i4")) drift(img("i4"), em(c), em(-c), img("i4"));
    if (img("i5")) drift([img("i5"), img("i6")], em(d), em(-d), img("i5"));

    // Services: while the circle window is pinned, once progress passes half it shows the second photo and second arrow
    const slide = main.querySelector(".lw-service__slide");
    if (slide) ScrollTrigger.create({ trigger: slide, start: "top top", end: "bottom bottom", onUpdate: (s) => (slide.dataset.thumb = s.progress < 0.5 ? "1" : "2") });

    // Lookbook: fade transition 2s, every 5s (4s on phone), only while on screen — the progress line fills meanwhile, and on advance the previous line clears to the right in 2s
    const target = main.querySelector(".lw-lookbook__slider");
    if (target && window.Splide) {
      const bars = [...target.querySelectorAll(".lw-lookbook__bar i")];
      let prev = bars[0];
      const s = new Splide(target, { type: "fade", autoplay: "pause", pauseOnHover: false, pauseOnFocus: false, resetProgress: false, drag: false, speed: 2000, interval: sp ? 4000 : 5000, rewind: true, arrows: false, pagination: false, intersection: { inView: { autoplay: true }, outView: { autoplay: false } } });
      s.on("autoplay:playing", (r) => { const t = bars[s.index]; if (t) { t.style.transform = `scaleX(${r})`; prev = t; } });
      s.on("move", () => { const t = prev; if (!t) return; t.style.transform = "scaleX(0)"; t.classList.add("is-hide"); setTimeout(() => t.classList.remove("is-hide"), 2000); });
      s.mount(window.splide?.Extensions || {});
      LW.off.push(() => s.destroy(true));
    }

    // Wedding hair and makeup: surrounding photo parallax (10·4·7em, phone 5·2.5em), the circle outline unfolds when lifted
    const t = (k) => main.querySelector(`.lw-catch__img.${k}`);
    if (t("t1")) {
      if (sp) { drift([t("t1"), t("t3"), t("t4")], "5em", "-5em", t("t1")); drift(t("t5"), "2.5em", "-2.5em", t("t5")); }
      else { drift(t("t1"), "10em", "-10em", t("t1")); drift(t("t2"), "4em", "-4em", t("t2")); drift([t("t3"), t("t4"), t("t5")], "7em", "-7em", t("t3")); }
    }
    const circle = main.querySelector(".lw-catch__circle");
    if (circle) inview(circle, "is-in");

    const blog = main.querySelector(".lw-blog__img");
    if (blog) sp ? drift(blog.firstElementChild, "-4em", "2em", blog) : drift(blog.firstElementChild, "-75px", "100px", blog);
  });

  LW.page("lookbook", (main) => {
    const sp = LW.sp();
    const modal = main.querySelector(".lw-modal");
    let open = null;
    const show = (id) => {
      open = main.querySelector(`#${id}`);
      if (!open || !modal) return;
      open.classList.add("is-show");
      modal.classList.add("is-show");
      modal.setAttribute("aria-hidden", "false");
      LW.lenis?.stop();
    };
    const hide = () => {
      if (!modal?.classList.contains("is-show")) return;
      modal.classList.add("is-hide");
      setTimeout(() => { modal.classList.remove("is-show", "is-hide"); open?.classList.remove("is-show"); modal.setAttribute("aria-hidden", "true"); }, sp ? 700 : 500);
      LW.lenis?.start();
    };
    const onClick = (e) => {
      const go = e.target.closest(".lw-case__go");
      if (go) return show(go.dataset.target);
      if (e.target.closest(".lw-modal__close, .lw-modal__bg")) hide();
    };
    main.addEventListener("click", onClick);
    LW.off.push(() => { main.removeEventListener("click", onClick); modal?.classList.remove("is-show", "is-hide"); LW.lenis?.start(); });

    // Per case: while the center panel is stuck, the circle outline is drawn by progress, and once in the lower half of the panel the circle · title grow
    main.querySelectorAll(".lw-case").forEach((c) => {
      const circle = c.querySelector(".lw-case__circle");
      const C = 311.02;
      const width = () => circle.getBoundingClientRect().width || 1;
      circle.style.setProperty("--ring-w", (100 / width()).toFixed(3));
      ScrollTrigger.create({
        trigger: c, start: "top top", end: "bottom bottom", invalidateOnRefresh: true,
        onRefresh: () => circle.style.setProperty("--ring-w", (100 / width()).toFixed(3)),
        onUpdate: (s) => { circle.style.setProperty("--ring-off", (C - C * s.progress + 0.43).toFixed(2)); if (s.progress > 0) circle.classList.add("is-show"); },
      });
      inview(circle, "is-show", "0% 0% -50% 0%");
      // Photo: rises from 15em below in 2.5s power4.out (again each time it is lifted), and the inner image has ±1em (phone .5em) parallax
      c.querySelectorAll(".lw-case__img").forEach((img) => {
        const pic = img.querySelector(".lw-case__pic"), inner = pic.firstElementChild, k = sp ? 0.5 : 1;
        gsap.fromTo(pic, { y: "15em", opacity: 0 }, { y: 0, opacity: 1, duration: 2.5, ease: "power4.out", scrollTrigger: { trigger: img, start: "top bottom", toggleActions: "play pause resume reset" } });
        drift(inner, `${-k}em`, `${k}em`, img);
      });
    });
  });

  // Shared subpage: title photo ±10em (phone 0 → 5em), lower photo −9em (phone −10em) → 0, photos opening from below play once when 30% enters the bottom of the screen
  const common = (main) => {
    const sp = LW.sp();
    main.querySelectorAll(".lw-title-img").forEach((e) => {
      const t = e.querySelector(".lw-title-img__img .lw-ph");
      if (!t) return;
      sp ? gsap.fromTo(t, { y: "0em" }, { y: "5em", ease: "none", scrollTrigger: { trigger: t, start: "top 20%", end: "bottom top", scrub: true } }) : drift(t, "-10em", "10em", e);
    });
    main.querySelectorAll(".lw-bottom-img").forEach((e) => {
      const t = e.querySelector(".lw-bottom-img__in");
      gsap.fromTo(t, { y: `${-(sp ? 10 : 9)}em` }, { y: "0em", ease: "none", scrollTrigger: { trigger: e, start: "top bottom", end: "bottom bottom", scrub: true } });
    });
    main.querySelectorAll("[data-motion-inset-bottom]").forEach((e) => ScrollTrigger.create({ trigger: e, start: "30% bottom", once: true, onEnter: () => e.classList.add("is-active") }));
  };

  LW.page("artist", (main) => common(main));

  LW.page("karuizawa", (main) => {
    common(main);
    const sp = LW.sp();
    // Scene: endlessly flowing slides (free when dragged), flowing only while on screen — a progress line on phone
    main.querySelectorAll("[data-service-slide]").forEach((el) => {
      if (!window.Splide) return;
      const s = new Splide(el, { type: "loop", drag: "free", focus: "center", padding: "1rem", gap: sp ? "16.667vw" : "3.5em", flickPower: 100, arrows: false, pagination: false, autoWidth: true, autoScroll: { speed: sp ? 1 : 1.25 / (devicePixelRatio || 1), rewind: true, pauseOnHover: false, pauseOnFocus: false }, intersection: { inView: { autoScroll: true }, outView: { autoScroll: false } } });
      const bar = el.querySelector(".lw-scene__bar i");
      s.on("mounted active drag dragging dragged", () => { const end = s.Components.Controller.getEnd() + 1; bar && (bar.style.width = `${Math.min((s.index + 1) / end, 1) * 100}%`); });
      s.mount(window.splide?.Extensions || {});
      LW.off.push(() => s.destroy(true));
    });
    // Hero: left small photo 0 → 2em, right big photo 0 → 5em (phone ±3em)
    const L = main.querySelector(".lw-svc-kv__mid .lw-ph"), R = main.querySelector(".lw-svc-kv__r .lw-ph");
    if (L) gsap.fromTo(L, { y: "0em" }, { y: "2em", ease: "none", scrollTrigger: { trigger: L.parentElement, start: sp ? "bottom center" : "center center", end: "bottom top", scrub: true } });
    if (R) sp ? drift(R, "-3em", "3em", R.parentElement) : gsap.fromTo(R, { y: "0em" }, { y: "5em", ease: "none", scrollTrigger: { trigger: R.parentElement, start: "bottom bottom", end: "bottom top", scrub: true } });
  });

  LW.inview = inview;
  LW.drift = drift;
})();
