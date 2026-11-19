// Reasons to go — numbers from the original features.js. This page’s default curve is power3.out
(() => {
  gsap.defaults({ ease: "power3.out" });
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const phone = innerWidth < 768;

  // Number shuffle — random 00.0 every 30ms, then the original value after a set time
  const scramble = (nums, after) => {
    const id = setInterval(() => { const v = `${Math.floor(Math.random() * 100).toString().slice(-2)}.${Math.floor(Math.random() * 10)}`; nums.forEach((n) => (n.textContent = v)); }, 30);
    gsap.delayedCall(after, () => { clearInterval(id); nums.forEach((n) => (n.textContent = n.dataset.value)); });
  };

  // Three sliders — all loop · 300ms · width by cell size
  new Swiper(".testimonial-container", {
    loop: true, speed: 300, spaceBetween: 0, slidesPerView: "auto", centeredSlides: true,
    pagination: { el: ".testimonial-pagination", type: "bullets", clickable: true },
    navigation: { prevEl: ".testimonial-navigation .-prev", nextEl: ".testimonial-navigation .-next" },
  });
  const charas = $(".theme-characters");
  const names = $$(".chara", charas).map((c) => c.dataset.name);
  const theme = new Swiper(".theme-container", {
    loop: true, speed: 300, spaceBetween: 0, slidesPerView: "auto",
    navigation: { prevEl: ".theme-navigation .-prev", nextEl: ".theme-navigation .-next" },
    on: { slideChange: (sw) => (charas.dataset.current = names[sw.realIndex]) },
  });
  $$(".chara", charas).forEach((c, i) => c.addEventListener("click", () => theme.slideToLoop(i, 300)));
  new Swiper(".value-container", {
    loop: true, speed: 300, spaceBetween: 0, slidesPerView: "auto", centeredSlides: true,
    navigation: { prevEl: ".value-navigation .-prev", nextEl: ".value-navigation .-next" },
  });

  // Accordion — same height expansion as jQuery slideToggle(300, swing)
  const more = $(".item-more"), detail = $(".item-detail");
  more.addEventListener("click", () => {
    const open = more.classList.toggle("-open");
    if (open) gsap.fromTo(detail, { display: "block", height: 0 }, { height: "auto", duration: J.reduce ? 0 : 0.3, ease: "sine.inOut" });
    else gsap.to(detail, { height: 0, duration: J.reduce ? 0 : 0.3, ease: "sine.inOut", onComplete: () => gsap.set(detail, { display: "none" }) });
  });

  // Day video — push one cell at a time with 0.3s power2.inOut, drag-swipe works too
  const videos = $$(".daylife-videos .video");
  let cur = 0;
  const go = (d) => {
    const prev = cur;
    cur = (cur + d + videos.length) % videos.length;
    gsap.timeline().set(videos[cur], { x: d > 0 ? "100%" : "-100%" })
      .to(videos[prev], { x: d > 0 ? "-100%" : "100%", duration: 0.3, ease: "power2.inOut" })
      .to(videos[cur], { x: 0, duration: 0.3, ease: "power2.inOut" }, "<");
  };
  gsap.set(videos[0], { x: 0 });
  $(".video-navigation .-next").addEventListener("click", () => go(1));
  $(".video-navigation .-prev").addEventListener("click", () => go(-1));
  let sx = null;
  const box = $(".video-container");
  box.addEventListener("pointerdown", (e) => (sx = e.clientX));
  box.addEventListener("pointerup", (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 40) go(e.clientX < sx ? 1 : -1); sx = null; });
  $(".btn-sound").addEventListener("click", (e) => (e.currentTarget.dataset.mute = String(e.currentTarget.dataset.mute !== "true")));

  // The center background pattern clears when the ”Benefits” heading reaches the screen center
  ScrollTrigger.create({ trigger: ".learning-title", start: "top 50%", onEnter: () => $("#Background").classList.add("-transparent"), onEnterBack: () => $("#Background").classList.remove("-transparent") });

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const reduce = ctx.conditions.reduce;
    const mvChars = $$(".l-mv .c-character"), mv = $(".l-mv .mv-content"), mvKids = $$(".l-mv .mv-content > *");
    const learnChars = $$(".l-learning .c-character");
    if (reduce) {
      gsap.set([mv, ...mvKids, ".side-left .content", ".side-right .bg", ".enquete-text", ".enquete-group", ".message-chara .c-character"], { opacity: 1, autoAlpha: 1, y: 0 });
      [...mvChars, ...learnChars].forEach((c) => c.classList.remove("-out"));
      return;
    }

    // First card — board 0.6s (after 0.5s), text lines 0.6s at 0.1s intervals, and the character enters when done. Once scroll passes 10px they leave at 0.07s intervals
    gsap.timeline().set([mv, ...mvKids], { y: 10 })
      .to(mv, { y: 0, opacity: 1, duration: 0.6, delay: 0.5 })
      .to(mvKids, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 }, "-=0.4")
      .call(() => mvChars.forEach((c) => c.classList.remove("-out")));
    ScrollTrigger.create({
      trigger: "#Main", start: "top -10",
      onEnter: () => mvChars.forEach((c, i) => gsap.delayedCall(0.07 * i, () => c.classList.add("-out"))),
      onLeaveBack: () => mvChars.forEach((c) => c.classList.remove("-out")),
    });
    ScrollTrigger.create({
      trigger: ".l-learning", start: "top 30%",
      onEnter: () => learnChars.forEach((c, i) => gsap.delayedCall(0.07 * i, () => c.classList.remove("-out"))),
      onLeaveBack: () => learnChars.forEach((c) => c.classList.add("-out")),
    });

    if (!phone) {
      // Right side — after 1.9s the band runs 0.4s, speech bubbles drop from 60px above with bounce.out 0.5s at 0.1s intervals, number cards, numbers shuffle for 1.5s
      const bg = $(".side-right .bg"), bubbles = $$(".side-right .enquete-text"), group = $(".side-right .enquete-group");
      gsap.set(bubbles, { opacity: 0, y: -60 });
      gsap.set(group, { opacity: 0, y: 10 });
      gsap.delayedCall(1.9, () => {
        gsap.timeline().set(bg, { y: 20 }).to(bg, { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.5 });
        gsap.timeline().to(bubbles, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "bounce.out", delay: 0.8 }).to(group, { opacity: 1, y: 0, duration: 0.4 }, "-=0.4");
        scramble($$(".num", group), 1.5);
      });
      // Left menu panel — 0.4s from 20px below, after 2.2s
      const left = $(".side-left .content");
      gsap.timeline().set(left, { y: 20 }).to(left, { autoAlpha: 1, y: 0, duration: 0.4, delay: 2.2 });
    } else {
      const bubbles = $$(".l-enquete .enquete-text"), group = $(".l-enquete .enquete-group");
      gsap.set(bubbles, { opacity: 0, y: -60 });
      gsap.set(group, { opacity: 0, y: 10 });
      ScrollTrigger.create({
        trigger: ".l-enquete", start: "top 50%", once: true,
        onEnter: () => {
          gsap.timeline().to(bubbles, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "bounce.out" }).to(group, { opacity: 1, y: 0, duration: 0.4 }, "-=0.4");
          scramble($$(".num", group), 1.8);
        },
      });
    }

    // Topic closing-line characters: back.out 0.5s from 20px below · 0.1s interval
    const msg = $$(".message-chara .c-character");
    gsap.set(msg, { opacity: 0, y: 20 });
    ScrollTrigger.create({ trigger: ".theme-message", start: "top 70%", onEnter: () => gsap.to(msg, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out" }) });
  });
})();
