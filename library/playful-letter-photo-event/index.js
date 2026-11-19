// Home page — opening · patterned text · pinned photo-row scene · topic hover · guest slider · app text.
(() => {
  const { lenis, isLarge, reduce, mm } = window.dSite;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const L = isLarge();

  // Opening — original values as is. If you return within three days (cookie), skip the curtain and show only the first screen
  const opening = $(".h-opening");
  const seen = document.cookie.includes("d-opening=true") && !new URLSearchParams(location.search).has("opening");
  // During the opening, body is pinned shut like the original — lenis.stop clips html with overflow: clip so off-screen elements can’t be reached at all.
  const freeze = (on) => gsap.set(document.body, on ? { position: "fixed", width: "100%" } : { clearProps: "position,width" });
  const startPage = () => { freeze(false); initScroll(); lenis.start(); };
  if (reduce || !opening) {
    opening?.classList.add("is-done");
    startPage();
  } else {
    lenis.scrollTo(0, { immediate: true, force: true });
    freeze(true);
    gsap.set(".d-header__inner", { yPercent: -120 });
    // The original button waits during the opening at a spot (y -48) where its bottom 10px hangs onto the screen — put it at the same spot
    gsap.set(".d-menu-btn", { yPercent: L ? -133 : -150 });
    gsap.set(".h-mv", { opacity: 0 });
    gsap.set(".d-ticket-home > .d-ticket", { yPercent: 150 });
    gsap.set(".h-char", { scale: 0 });
    gsap.set([".h-opening__symbol", ".h-opening__typo"], { opacity: 0, rotate: -12 });
    gsap.set(".h-opening__logo", { opacity: 1, yPercent: -100 });
    gsap.set(".h-opening__item", { opacity: 0, scale: 1.6 });
    gsap.set(".h-opening__item-image", { clipPath: "polygon(-50% 50%, 50% 150%, 50% 150%, -50% 50%)" });
    gsap.set(".h-opening__mask", { opacity: 1 });
    const tl = gsap.timeline();
    const finish = () => {
      tl.to(".h-mv", { opacity: 1, duration: 0.4, ease: "doubleSineOut", onComplete: startPage }, seen ? 0 : "<");
      tl.to([".d-header__inner", ".d-menu-btn"], { yPercent: 0, duration: 0.4, ease: "elastic.out(1, 0.6)" }, "<");
      tl.to(".d-ticket-home > .d-ticket", { yPercent: 0, duration: 0.4, ease: "back.out(1.6)" }, "<");
      tl.to(".h-char", { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)", stagger: { each: 0.08, from: "random" }, onComplete: () => { document.cookie = "d-opening=true; max-age=259200; path=/"; } });
    };
    if (seen) {
      opening.classList.add("is-done");
      finish();
    } else {
      tl.to([".h-opening__symbol", ".h-opening__typo"], { opacity: 1, duration: 0.6, ease: "doubleSineOut" });
      tl.to(".h-opening__logo", { yPercent: 0, duration: 0.6, ease: "expo.in" }, "<");
      tl.to(".h-opening__typo", { rotate: 0, duration: 0.4, ease: "elastic.out(1, 0.6)" });
      tl.to(".h-opening__symbol", { rotate: 0, duration: 0.6, ease: "elastic.out(1, 0.6)" }, "-=0.34");
      tl.to(".h-opening__logo", { scale: 0, duration: 0.3, ease: "back.in(1.7)" });
      tl.to(".h-opening__item", { keyframes: [{ opacity: 1, duration: 0.4, ease: "doubleSineOut" }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)", delay: -0.4 }], stagger: 0.36 });
      tl.to(".h-opening__item-logo", { opacity: 0, duration: 0.4, ease: "doubleSineIn" }, "+=0.2");
      tl.to(".h-opening__item-image", { clipPath: "polygon(-50% 50%, 50% 150%, 150% 50%, 50% -150%)", duration: 0.4, ease: "doubleSineOut", stagger: 0.04 }, "<");
      tl.to(".h-opening__mask", { rotate: L ? -3 : 25, scale: L ? 1.222 : 1.58, y: L ? "10.8vw" : "-5.8vw", x: L ? "-0.2vw" : "4.4vw", duration: 0.4, ease: "back.out(1.6)" }, "+=0.2");
      tl.to(".h-opening", { opacity: 0, duration: 0.4, ease: "doubleSineOut", onComplete: () => opening.classList.add("is-done") }, "+=0.4");
      finish();
    }
  }

  function initScroll() {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      chars();
      list();
      app();
    });
    topics();
    guest();
    ScrollTrigger.refresh();
  }

  // Pattern letters — while passing the Hero each flies off in a different direction (M when passing the About section)
  function chars() {
    const trig = $(".h-trigger__char"), st = { trigger: trig, start: "top top", end: "bottom bottom", scrub: true };
    const c = (k) => $(`.h-char[data-char="${k}"]`);
    let t = gsap.timeline({ scrollTrigger: st });
    t.to(c("d"), { x: L ? "80vw" : "50vw", ease: "none" }, 0).to(c("d"), { y: L ? "-50vw" : "20vw", ease: "doubleSineOut" }, 0);
    t = gsap.timeline({ scrollTrigger: { ...st } });
    t.to(c("o1"), { x: "30vw", ease: "none" }, 0).to(c("o1"), { y: "30vh", ease: "none" }, 0);
    t = gsap.timeline({ scrollTrigger: { ...st } });
    t.to(c("k"), { x: L ? "-75vw" : "-30vw", ease: "none" }, 0).to(c("k"), { y: L ? "-100vw" : "30vw", ease: "none" }, 0);
    t = gsap.timeline({ scrollTrigger: { ...st } });
    t.to(c("o2"), { x: "60vw", ease: "none" }, 0).to(c("o2"), { y: L ? "-60vw" : "-20vw", ease: "doubleSineOut" }, 0);
    t = gsap.timeline({ scrollTrigger: { trigger: ".h-about", start: "center bottom", end: "bottom top", scrub: true } });
    t.to(c("m"), { x: "-150vw", ease: "none" }, 0).to(c("m"), { y: L ? "50vh" : "-50vh", ease: "doubleSineIn" }, 0);
  }

  // Photo row — the original’s three ScrollTrigger stages (300vh·200vh·100vh) as is
  function list() {
    const root = $(".h-list"), t1 = $('.h-list__trig[data-id="1"]'), t2 = $('.h-list__trig[data-id="2"]'), t3 = $('.h-list__trig[data-id="3"]');
    const tweens = [];
    const logo = $(".h-list__logo");
    let t = gsap.timeline({ scrollTrigger: { trigger: t1, start: "top 80%", end: "bottom bottom", scrub: true }, defaults: { ease: "none" } });
    t.to(logo, { x: "-150vw" }).to(logo, { y: "60vh", ease: "doubleSineOut" }, "<").to(logo, { x: L ? "0vw" : "150vw", rotate: 360 }).to(logo, { y: "90vh", ease: "doubleSineOut" }, "<");
    tweens.push(t);
    const fly = (id, k) => {
      const el = $(`.h-list__item[data-move="${id}"]`);
      tweens.push(gsap.to(el, { keyframes: k, ease: "none", scrollTrigger: { trigger: t1, start: "+=30% center", end: "bottom bottom", scrub: true } }));
    };
    fly(1, { 0: { x: L ? "100vw" : "250vw", y: "-60vw", scale: 0.2 }, 60: { scale: 0.4 }, 100: { x: "0", y: "0", scale: 1 } });
    fly(2, { 0: { x: L ? "100vw" : "250vw", y: "-150vw", scale: 0.2 }, 60: { scale: 0.4 }, 80: { x: "1vw" }, 100: { x: "0", y: "0", scale: 1 } });
    fly(4, { 0: { x: L ? "-100vw" : "-250vw", y: "-100vw", scale: 0.2 }, 60: { scale: 0.4 }, 80: { x: "1vw" }, 100: { x: "0", y: "0", scale: 1 } });
    fly(5, { 0: { x: L ? "-100vw" : "-250vw", y: "-80vw", scale: 0.2 }, 60: { scale: 0.4 }, 80: { x: "4vw" }, 100: { x: "0", y: "0", scale: 1 } });
    // Center photo — enters cut out in an ”i” shape, then the pink cover lifts and it turns into a pill shape
    const mid = $('.h-list__item[data-move="3"]'), ov = $(".h-list__overlay", mid), path = $(".h-mask-i-path");
    gsap.set(mid, { x: "100vw", y: L ? "-20vw" : "-100vw" });
    t = gsap.timeline({ scrollTrigger: { trigger: t1, start: "top center", end: "bottom bottom", scrub: true }, defaults: { ease: "none" } });
    t.to(mid, { x: "0vw", ease: "doubleSineOut" }, 0).to(mid, { y: "0vw" }, 0).to(ov, { opacity: 0 }, "-=0.3").to(path, { morphSVG: path.dataset.to, ease: "none" }, "<");
    tweens.push(t);
    tweens.push(gsap.to(".h-list__flex", { x: L ? "-69.15vw" : "-205.5vw", ease: "none", scrollTrigger: { trigger: t2, start: "top bottom", end: "bottom bottom", scrub: true } }));
    // Pink panel — spreads 35vw to each side from the center photo size, and when it finishes four guide cards pop out with a bounce
    const nav = $(".h-nav"), bg = $(".h-nav__bg"), bgo = $(".h-nav__bg-overlay");
    let prevProg = 0, curProg = 0;
    t = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: t3, start: "top bottom", end: "90% bottom", scrub: true, onEnter: () => gsap.set(bg, { opacity: 1 }), onLeaveBack: () => gsap.set(bg, { opacity: 0 }), onUpdate: (st) => { prevProg = curProg; curProg = st.progress; } },
      onComplete: showNav,
    });
    t.fromTo(bg, { clipPath: L ? "inset(0% 0% round 2.7vw)" : "inset(0% round 10vw)" }, { clipPath: L ? "inset(0% -35vw round 2.7vw)" : "inset(-30% round 10vw)" }, 0);
    t.to(bgo, { opacity: 0.9 }, 0).to('.h-list__item[data-nav="pre"]', { x: "-50vw" }, 0).to('.h-list__item[data-nav="next"]', { x: "50vw" }, 0);
    tweens.push(t);
    let shown = false;
    function showNav() {
      if (shown) return;
      shown = true;
      // Like the original, detach all scroll bindings of the photo row but leave it in its end state — if you only detach, it reverts to the initial values
      tweens.forEach((x) => { x.scrollTrigger?.kill(false, true); x.progress(1); });
      nav.classList.add("is-complete");
      // If the expand range was not scrolled through but jumped over in one go (anchor or move to the section just below — previous progress under .75), don’t pull it up, only stand the card — collapsing would push the whole section below.
      const before = curProg >= 0.999 ? prevProg : curProg;
      if (before < 0.75) {
        gsap.set(".h-nav__item", { opacity: 1, scale: 1, rotate: 0 });
        return;
      }
      lenis.scrollTo(".h-list__target", { immediate: true, lock: true, force: true });
      lenis.stop();
      setTimeout(() => {
        root.classList.add("is-end");
        ScrollTrigger.refresh();
        lenis.scrollTo(root, { immediate: true, lock: true, force: true });
      }, 300);
      gsap.to(".h-nav__item", {
        keyframes: { 0: { opacity: 0, scale: 0.8, rotate: (i) => (i % 2 === 0 ? -5 : 5) }, 20: { opacity: 1 }, 100: { scale: 1, rotate: 0 } },
        ease: "bounce.out", duration: 0.6, stagger: 0.08,
        onComplete: () => setTimeout(() => { lenis.start(); ScrollTrigger.refresh(); }, 300),
      });
    }
  }

  // Topics — the hovered row becomes the current row and its body height is measured to open it. The right photo leaves the previous section as is-prev and the new section opens as a circle
  function topics() {
    const items = $$(".h-topic");
    const measure = () => $$(".h-topic__body").forEach((b) => b.style.setProperty("--_body-height", b.firstElementChild.offsetHeight + 1 + "px"));
    measure();
    new ResizeObserver(() => measure()).observe(document.body);
    if (!matchMedia("(any-hover: hover)").matches) return;
    items.forEach((it) => it.addEventListener("mouseenter", () => {
      if (it.classList.contains("is-current")) return;
      measure();
      const id = it.dataset.id;
      $(".h-topics__slide.is-prev")?.classList.remove("is-prev");
      $(".h-topic.is-current")?.classList.remove("is-current");
      const cur = $(".h-topics__slide.is-current");
      cur?.classList.remove("is-current"); cur?.classList.add("is-prev");
      it.classList.add("is-current");
      $(`.h-topics__slide[data-id="${id}"]`)?.classList.add("is-current");
    }));
  }

  // Guests — embla (align start, 6s autoplay starts when it enters the section), photos and names enter one by one. Band color rotates one step every 4s
  function guest() {
    const vp = $(".h-guest .embla__viewport");
    if (vp && window.EmblaCarousel) {
      const embla = EmblaCarousel(vp, { align: "start" }, window.EmblaCarouselAutoplay ? [EmblaCarouselAutoplay({ delay: 6000, stopOnInteraction: false, playOnInit: false })] : []);
      const slides = $$(".h-guest__slide");
      const parts = slides.map((s) => [$(".h-guest__slide-img", s), $(".h-guest__slide-title", s), $(".h-guest__slide-type", s)]);
      if (!reduce) gsap.set(parts.flat(), { opacity: 0 });
      ScrollTrigger.create({
        trigger: ".h-guest__list", start: "top 70%", once: true,
        onEnter: () => {
          embla.plugins().autoplay?.play();
          if (reduce) return;
          parts.forEach(([img, title, type], i) => {
            gsap.fromTo(img, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.6)", delay: i * 0.08 });
            gsap.to([title, type], { opacity: 1, duration: 0.4, ease: "doubleSineOut", delay: 0.2 + i * 0.08 });
          });
        },
      });
    }
    const order = { "is-top": ["blue", "blue-pink", "pink", "pink-blue"], "is-bottom": ["skyblue", "skyblue-green", "green", "green-skyblue"] };
    let step = 0;
    if (!reduce) setInterval(() => {
      step++;
      Object.entries(order).forEach(([cls, cols]) => $$(`.h-grad__list.${cls} .h-grad__item`).forEach((it, i) => (it.dataset.color = cols[(i + step) % cols.length])));
    }, 4000);
  }

  // App — six patterned letters spin off-screen, roll in and settle around the band (from when the section touches the screen bottom until 80%)
  function app() {
    const st = { trigger: ".h-app", start: "top bottom", end: "bottom 80%", scrub: true };
    const c = (k) => $(`.h-app__char[data-char="${k}"]`);
    gsap.fromTo(c("d"), { x: "-30vw", yPercent: -100, rotate: -270 }, { x: 0, yPercent: 0, rotate: 0, ease: "none", scrollTrigger: { ...st } });
    gsap.fromTo(c("o1"), { x: "-50vw", yPercent: -100, rotate: 360 }, { x: "0vw", yPercent: 0, rotate: 0, ease: "none", scrollTrigger: { ...st } });
    gsap.fromTo(c("k"), { x: "-80vw", y: "50vw", rotate: 180 }, { x: "0vw", y: "0vw", rotate: 0, ease: "none", scrollTrigger: { ...st } });
    gsap.fromTo(c("o2"), { x: "50vw", y: "100vw", rotate: -360 }, { x: "0vw", y: "0vw", rotate: 0, ease: "none", scrollTrigger: { ...st } });
    gsap.fromTo(c("m"), { x: "60vw", yPercent: -100, rotate: 270 }, { x: "0vw", yPercent: 0, rotate: 0, ease: "none", scrollTrigger: { ...st } });
    gsap.fromTo(c("i"), { x: "80vw", y: "30vw", rotate: -180 }, { x: "0vw", y: "0vw", rotate: 0, ease: "none", scrollTrigger: { ...st } });
  }
})();
