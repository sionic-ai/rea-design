// First page motion — values as in the original (opening 2s, 0.2s delay, group chat +=12000 scrub 1, point clip-path 1.2s, parallax scale 1.3)
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("srEase", "0.42,0,0.58,1");
  const isSp = () => matchMedia("(max-width: 1023px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finals = gsap.utils.toArray(".js-final");

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const lenis = new Lenis();
  window.srLenis = lenis;
  window.scrollTo(0, 0);
  lenis.scrollTo(0, { immediate: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Opening pieces: the original start and end positions (differ per width). Once all pieces are pushed away, the header and copy rise over 1.2s
  const PC = {
    p1: ["-5.77vw", "-26.91vh", "-12.77vw", "-39.91vh"], p2: ["15.34vw", "0vh", "15.34vw", "-7vh"],
    p3: ["59.44vw", "-8.12vh", "68.44vw", "-28.12vh"], p4: ["-7.81vw", "18.62vh", "-23.81vw", "18.62vh"],
    p5: ["71.52vw", "15vh", "84.52vw", "17vh"], p6: ["0vw", "-22.62vh", "-28vw", "-69.62vh"],
    p7: ["-25.97vw", "22.12vh", "-71.97vw", "62.12vh"], p8: ["47.63vw", "-23.87vh", "100.63vw", "-23.87vh"],
    p9: ["0vw", "0vh", "-9vw", "13.37vh"], p10: ["67.14vw", "0vh", "79.14vw", "10.25vh"], p11: ["0vw", "0vh", "0vw", "30vh"],
  };
  const SP = {
    p1: ["-31.94vw", "-0.25vh", "-29.94vw", "-13.25vh"], p2: ["-3.66vw", "-0.25vh", "-3.66vw", "-3vh"],
    p3: ["52.23vw", "0vh", "60.23vw", "-12vh"], p4: ["-101.34vw", "-0.38vh", "-118.34vw", "-26.38vh"],
    p5: ["60.33vw", "-1.5vh", "81.33vw", "-10.5vh"], p6: ["-135.92vw", "2.62vh", "-151.92vw", "0.63vh"],
    p7: ["63vw", "19.62vh", "83vw", "5.62vh"], p8: ["-52.33vw", "-0.75vh", "-52.33vw", "-43.75vh"],
    p9: ["-35.33vw", "0vh", "-69.33vw", "70.75vh"], p10: ["18.67vw", "13.25vh", "98.67vw", "6.25vh"],
    p11: ["-38.33vw", "0.25vh", "-38.33vw", "16.25vh"], p12: ["-0.33vw", "0vh", "-44.33vw", "23vh"], p13: ["54.33vw", "0vh", "72.67vw", "17vh"],
  };
  const ILL = isSp() ? ["0", "15.52vh", "0", "0"] : ["16.63vw", "30vh", "16.63vw", "0vh"];

  const showFinal = () => gsap.to(finals, { opacity: 1, y: 0, duration: 1.2, ease: "srEase", onComplete: () => { lenis.start(); document.body.classList.remove("is-loading"); } });
  const opening = () => {
    if (reduce) {
      gsap.set("[data-op]", { opacity: 0 });
      gsap.set(".fv__part", { opacity: 0 });
      gsap.set(finals, { opacity: 1 });
      lenis.start();
      return;
    }
    gsap.set(".fv__ill", { x: ILL[0], y: ILL[1] });
    gsap.to('[data-op="loader"]', { opacity: 0, duration: 0.8, onComplete: () => {
      const cfg = isSp() ? SP : PC;
      gsap.to(['[data-op="logo"]', '[data-op="dim"]'], { opacity: 0, duration: 1.0, ease: "srEase" });
      gsap.to('[data-op="deep"]', { opacity: 0, duration: 0.5, ease: "srEase" });
      const tweens = Object.entries(cfg).map(([k, [sx, sy, ex, ey]]) =>
        gsap.fromTo(`.fv__part.${k}`, { x: sx, y: sy }, { x: ex, y: ey, duration: 2.0, delay: 0.2, ease: "srEase", force3D: true }));
      tweens.push(gsap.fromTo(".fv__ill", { x: ILL[0], y: ILL[1] }, { x: ILL[2], y: ILL[3], duration: 1.2, delay: 0.8, ease: "srEase" }));
      Promise.all(tweens.map((t) => t.then())).then(showFinal);
    } });
  };
  lenis.stop();
  gsap.set(finals, { y: 0 });

  // The original also opens the opening once video and images arrive or 3 seconds pass
  const video = document.querySelector(".fv video");
  let started = false;
  const start = () => { if (started) return; started = true; clearTimeout(force); opening(); };
  const force = setTimeout(start, 3000);
  if (!video || video.readyState >= 3) start();
  else video.addEventListener("canplay", start, { once: true });

  addEventListener("load", () => {
    const mm = gsap.matchMedia();

    // Group chat: circle → speech bubbles → photo pile → circle covers the screen and photos scatter → contact
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const viewport = document.querySelector(".chat-viewport");
      const layer = document.querySelector(".chat-scroll-layer");
      const ills = [".line__anim .ill01", ".line__anim .ill02"];
      const balloons = gsap.utils.toArray(".balloon");
      const photos = gsap.utils.toArray(".photo-item");
      const cv = document.querySelector(".cv-area");
      if (isSp()) photos.forEach((p) => { p.dataset.x = p.dataset.spX; p.dataset.y = p.dataset.spY; p.dataset.r = p.dataset.spR; });
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".line__anim", start: "top top", end: "+=12000", pin: true, scrub: 1, anticipatePin: 1, pinSpacing: true, invalidateOnRefresh: true } });
      const centerOf = (b) => viewport.offsetHeight / 2 - (b.offsetTop + b.offsetHeight / 2);
      gsap.set(viewport, { xPercent: -50, yPercent: -50, scale: 0 });
      gsap.set(ills, { opacity: 0 });
      gsap.set(photos, { xPercent: -50, yPercent: -50, x: 0, y: 0, opacity: 0, scale: 0.8, rotation: 0 });
      gsap.set(cv, { opacity: 0, y: 0 });
      gsap.set(balloons, { opacity: 0, y: 0 });
      gsap.set(layer, { y: centerOf(balloons[0]) });
      tl.to(viewport, { scale: 1, duration: 2 }).to(ills, { opacity: 1, duration: 1 }, "<1.5");
      balloons.forEach((b, i) => {
        tl.to(b, { opacity: 1, duration: 0.8, ease: "power2.out" });
        if (i > 0) tl.to(layer, { y: centerOf(b), duration: 1, ease: "power2.inOut" }, "<");
        tl.to({}, { duration: 0.4 });
      });
      tl.to([layer, ...ills], { opacity: 0, duration: 1 })
        .to(photos, { opacity: 1, scale: 1, duration: 2, ease: "power2.out" })
        .to(photos, { rotation: (i, el) => el.dataset.r, duration: 1.5, stagger: 0.1, ease: "power2.out" }, "<")
        .to(viewport, { scale: 6, borderRadius: "0%", duration: 3, ease: "expo.inOut" }, ">")
        .to(photos, { x: (i, el) => el.dataset.x, y: (i, el) => el.dataset.y, duration: 4, stagger: 0.08, ease: "expo.out", pointerEvents: "auto" }, "<0.5")
        .to(cv, { opacity: 1, y: 0, duration: 2, ease: "power3.out", pointerEvents: "auto" }, ">");

      // Photo parallax: scale the picture to 1.3 and move yPercent 0→-15 while passing through the section
      gsap.utils.toArray("[data-parallax]").forEach((item) => {
        gsap.fromTo(item.firstElementChild, { yPercent: 0, scale: 1.3 }, { yPercent: -15, ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: 0, invalidateOnRefresh: true } });
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".chat-viewport", { xPercent: -50, yPercent: -50, scale: 6, borderRadius: "0%" });
      gsap.set(".cv-area", { opacity: 1, pointerEvents: "auto" });
      gsap.set(".balloon", { opacity: 1 });
    });

    // Point switching: each time four empty 120lvh blocks pass the screen center, data-active changes and the number counts
    const points = document.querySelector(".points");
    const clones = points.querySelector(".points__clones");
    const current = points.querySelector(".points__num .current");
    const items = points.querySelectorAll(".points__item");
    let now = 1, timer = null;
    const count = (to) => {
      clearInterval(timer);
      timer = setInterval(() => {
        const diff = to - now;
        if (Math.abs(diff) < 0.1) { now = to; current.textContent = String(to).padStart(2, "0"); clearInterval(timer); return; }
        now += diff * 0.1;
        current.textContent = String(Math.round(now)).padStart(2, "0");
      }, 20);
    };
    items.forEach((it, i) => {
      const c = document.createElement("div");
      c.className = "clone";
      clones.append(c);
      new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        points.dataset.active = i + 1;
        count(parseInt(it.dataset.to, 10));
      }), { rootMargin: "-50% 0% -50% 0%" }).observe(c);
    });

    // Slider — same Swiper 11 as the original, same settings
    new Swiper(".location__slide", { slidesPerView: "auto", spaceBetween: 0, speed: 800, loop: true, centeredSlides: true, loopedSlides: 6, autoplay: { delay: 5000 }, navigation: { nextEl: ".location__slide .swiper-button-next", prevEl: ".location__slide .swiper-button-prev" } });
    new Swiper(".idea__slide", { slidesPerView: "auto", spaceBetween: 0, speed: 600, loop: true, centeredSlides: true, watchSlidesProgress: true, loopedSlides: 6, navigation: { nextEl: ".idea__slide .swiper-button-next", prevEl: ".idea__slide .swiper-button-prev" } });

    ScrollTrigger.refresh();
  });

  // Map bubble → scrolls over the map for 1.2s (expo type) + right plate. Closes with Esc·outside press·close, and on phones pages back and forth
  const modals = [...document.querySelectorAll("[data-modal]")];
  const closeAll = () => { modals.forEach((m) => m.classList.remove("is-active")); document.body.style.overflow = ""; };
  const open = (m) => { closeAll(); m.classList.add("is-active"); document.body.style.overflow = "hidden"; };
  const close = (m) => { m.classList.remove("is-active"); if (!modals.some((x) => x.classList.contains("is-active"))) document.body.style.overflow = ""; };
  document.querySelectorAll(".map_item").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const m = document.querySelector(b.dataset.modalTarget);
    if (m) open(m);
    lenis.scrollTo(".location__map .map", { offset: 0, duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  }));
  modals.forEach((m, i) => {
    m.querySelector("[data-modal-close]").addEventListener("click", () => close(m));
    m.addEventListener("click", (e) => { if (e.target === m) close(m); });
    m.querySelector("[data-modal-prev]").addEventListener("click", () => open(modals[(i - 1 + modals.length) % modals.length]));
    m.querySelector("[data-modal-next]").addEventListener("click", () => open(modals[(i + 1) % modals.length]));
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { const act = modals.filter((m) => m.classList.contains("is-active")); if (act.length) close(act[act.length - 1]); } });
})();
