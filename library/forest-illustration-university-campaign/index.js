// First section — an opening where a forest is raised in turn, logo breathing, picker slider·data slider·shorts (Swiper 12), message window
mj.page("home", () => {
  const { reduce, wait, loopClass, EASE } = mj;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const kill = [];
  const hero = $("[data-hero]");
  const letters = $$("[data-logo-text] span"), nums = $$("[data-logo-num]");

  /* ── Opening (original HomeHero timeline): 1s clouds → 1.47s hills · people → 2.27s logo letters → +1.43s numbers → +1.97s picker → birds · deer ── */
  const NUM_IN = [{ x: 130, y: -20, r: 14, x2: -10, y2: 5, r2: -5 }, { x: 50, y: -10, r: 4, x2: -6, y2: 3, r2: -3 }, { x: -50, y: -10, r: -4, x2: 6, y2: 3, r2: 3 }, { x: -130, y: -20, r: -14, x2: 10, y2: 5, r2: 5 }];
  const pop = (els, at, tl) => tl.fromTo(els, { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.47, ease: "back.out(2)", stagger: 0.13 }, at);
  if (!reduce && !window.mjHeroSkip) {
    const tl = gsap.timeline();
    gsap.set(letters, { scale: 0 });
    nums.forEach((n, i) => gsap.set(n, { x: NUM_IN[i].x, y: NUM_IN[i].y, rotation: NUM_IN[i].r, autoAlpha: 0 }));
    pop($$('[data-hero-part="cloud"]', hero), 1, tl);
    tl.fromTo($$('[data-hero-part="hill"]', hero), { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.33, ease: "power1.out", stagger: 0.17 }, 1.47);
    tl.fromTo($$(".hero__tree", hero), { scaleY: 0, autoAlpha: 0 }, { scaleY: 1, autoAlpha: 1, duration: 0.47, ease: "back.out(2.4)", stagger: 0.04 }, 1.64);
    pop($$('[data-hero-part="char"]', hero), 1.8, tl);
    tl.to(letters, { keyframes: [{ scale: 1.2, duration: 0.37, ease: "power1.inOut" }, { scale: 1, duration: 0.3, ease: "power1.inOut" }], stagger: 0.11 }, 2.27);
    nums.forEach((n, i) => tl.to(n, { keyframes: [{ x: NUM_IN[i].x2, y: NUM_IN[i].y2, rotation: NUM_IN[i].r2, scale: 1.05, autoAlpha: 1, duration: 0.33, ease: "circ.out" }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.27, ease: "circ.out" }] }, 2.27 + 1.43));
    tl.fromTo(".hero__pick", { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.47, ease: "circ.out" }, 2.27 + 1.97);
    pop($$('[data-hero-part="bird"]', hero), 2.27 + 2.34, tl);
    tl.fromTo([".hero__lead", ".hero__sub"], { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.47, ease: "circ.out" }, 2.27 + 2.5);
    tl.call(startLogoLoop, null, 2.27 + 2.6);
    kill.push(() => tl.kill());
  } else startLogoLoop();
  window.mjHeroSkip = false;

  // Logo breathing: every 2.6s the letters scale 1.15→.97→1, the digits sway ±5° and 1.05 then settle
  function startLogoLoop() {
    if (reduce) return;
    const NUM_LOOP = [[-10, 5, -5, 2, -1, 2], [-6, 3, -3, 1, -1, 1], [6, 3, 3, -1, -1, -1], [10, 5, 5, -2, -1, -2]];
    const t1 = gsap.timeline({ repeat: -1, repeatDelay: 2.6 - 1.07 }).to(letters, { keyframes: [{ scale: 1.15, duration: 0.4, ease: "power1.inOut" }, { scale: 0.97, duration: 0.4, ease: "power1.inOut" }, { scale: 1, duration: 0.27, ease: "none" }] });
    const t2 = gsap.timeline({ repeat: -1, repeatDelay: 2.6 - 1.2 });
    nums.forEach((n, i) => { const [x, y, r, x2, y2, r2] = NUM_LOOP[i]; t2.to(n, { keyframes: [{ x, y, rotation: r, scale: 1.05, duration: 0.4, ease: "power1.inOut" }, { x: x2, y: y2, rotation: r2, scale: 0.98, duration: 0.4, ease: "power1.inOut" }, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.4, ease: "power1.inOut" }] }, 0); });
    kill.push(() => { t1.kill(); t2.kill(); });
    // Signboard .7s shake every 3.5s (original signboard)
    $$("[data-sign]").forEach((s) => loopClass(s, { duration: 700, interval: 3500 }));
  }

  /* ── Slider (Swiper 12.0.2, same build as the original) ── */
  // Pick slider (original PickupSlider): advances every 3s, and the cell interior is pushed 15px further toward the direction of travel (.5s) then back into place (.33s)
  let pickPrev = 0;
  const pick = new Swiper("[data-pick]", { slidesPerView: "auto", centeredSlides: true, spaceBetween: 10, loop: true, speed: 500, autoplay: reduce ? false : { delay: 3000, waitForTransition: true, disableOnInteraction: false },
    on: {
      slideChangeTransitionStart(s) { const d = s.realIndex > pickPrev ? -1 : 1; pickPrev = s.realIndex; s.el.querySelectorAll(".pick__in").forEach((r) => { r.classList.remove("is-return"); r.classList.add("is-overshoot"); r.style.transform = `translate3d(${15 * d}px,0,0)`; }); },
      slideChangeTransitionEnd(s) { s.el.querySelectorAll(".pick__in").forEach((r) => { r.classList.remove("is-overshoot"); r.classList.add("is-return"); r.style.transform = "translate3d(0,0,0)"; }); },
    } });
  const dots = $("[data-data-dots]");
  const data = new Swiper("[data-data-slider]", {
    slidesPerView: "auto", centeredSlides: true, loop: true, speed: 500, spaceBetween: mj.mobile() ? -40 : -60,
    autoplay: reduce ? false : { delay: 3500, disableOnInteraction: false },
    navigation: { prevEl: "[data-prev]", nextEl: "[data-next]" },
    on: {
      // The center cell number pops and grows with back.out(4) (original BrandData slider)
      slideChangeTransitionStart(s) {
        const num = s.slides[s.activeIndex]?.querySelector(".data-slide__num .mj-en");
        if (num && !reduce) gsap.fromTo(num, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "back.out(4)" });
        dots?.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-current", String(i === s.realIndex)));
      },
    },
  });
  if (dots) { dots.innerHTML = $$(".data-slide").map((_, i) => `<button type="button" aria-label="${i + 1}Turn" aria-current="${i === 0}"></button>`).join(""); dots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) data.slideToLoop([...dots.children].indexOf(b)); }); }
  // Arrow: on hover the yellow circle pops to 1.2x with elastic.out(1.1,.3) over 1.2s (original BrandData mouseAction)
  $$(".data__nav").forEach((b) => { const c = b.querySelector("circle"); const f = (e) => { if (!reduce) gsap.to(c, { scale: e.type === "mouseenter" ? 1.2 : 1, duration: 1.2, ease: "elastic.out(1.1, 0.3)" }); }; b.addEventListener("mouseenter", f); b.addEventListener("mouseleave", f); });
  $$(".data__tabs button").forEach((b) => b.addEventListener("click", () => $$(".data__tabs button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)))));
  const shorts = new Swiper("[data-shorts]", { slidesPerView: "auto", spaceBetween: mj.mobile() ? 12 : 24, speed: 600, grabCursor: true });

  /* ── Message card hover (original MessagesItem): the default photo shrinks to .5x and vanishes in .33s, another pose photo goes .5→1.1→1 (.33s each), and it reverses on release ── */
  if (!reduce && matchMedia("(hover: hover)").matches) $$(".msg-card").forEach((card) => {
    const off = card.querySelector("[data-msg-off]"), on = card.querySelector("[data-msg-on]");
    let tl = null;
    const enter = () => { card.classList.add("is-on"); tl?.kill(); tl = gsap.timeline().to(off, { scale: 0.5, opacity: 0, duration: 0.33, ease: "power2.out" }, 0).fromTo(on, { opacity: 1, scale: 0.5 }, { keyframes: [{ scale: 1.1, duration: 0.33, ease: EASE.msgHover }, { scale: 1, duration: 0.33, ease: EASE.msgHover }] }, 0.02); };
    const leave = () => { card.classList.remove("is-on"); tl?.kill(); tl = gsap.timeline().to(on, { opacity: 0, scale: 0.5, duration: 0.33, ease: "power2.out" }, 0).fromTo(off, { scale: 0.8, opacity: 1 }, { scale: 1, duration: 0.5, ease: EASE.msgHover }, 0.03); };
    card.addEventListener("mouseenter", enter);
    card.addEventListener("mouseleave", leave);
    kill.push(() => { card.removeEventListener("mouseenter", enter); card.removeEventListener("mouseleave", leave); tl?.kill(); });
  });

  /* ── Message bubbles (original messages balloon): cards are grouped in fours, and each group goes one cell at a time in a different order — lights up in .25s (.1s stagger),
     2.5% up and down, shakes seven times at .35s each and turns off at .25s, rests 1s, then the next cell ── */
  const balloons = $$(".msg-card__balloon");
  if (balloons.length && !reduce) {
    const ORDER = [[1, 3, 0, 2], [3, 0, 2, 1], [0, 2, 1, 3], [2, 1, 3, 0]];
    const cols = [];
    for (let i = 0; i < balloons.length; i += 4) cols.push(ORDER[cols.length % 4].map((k) => balloons[i + k]).filter(Boolean));
    gsap.set(balloons, { autoAlpha: 0 });
    let count = 0, next = 0;
    const play = () => {
      const col = cols.map((g) => g[count]).filter(Boolean);
      gsap.fromTo(col, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power1.out", stagger: 0.1 });
      gsap.fromTo(col, { yPercent: 2.5 }, { yPercent: -2.5, ease: "sine.inOut", duration: 0.35, repeat: 6, yoyo: true, overwrite: false, onComplete: () => {
        gsap.killTweensOf(col);
        gsap.to(col, { autoAlpha: 0, ease: "power1.out", duration: 0.25, onComplete: () => { gsap.set(col, { clearProps: "transform" }); count = (count + 1) % 4; next = setTimeout(play, 1000); } });
      } });
    };
    play();
    kill.push(() => { clearTimeout(next); gsap.killTweensOf(balloons); });
  }

  /* ── Message window: pressing a card opens it from that student’s cell, and the slide bounces with elastic.out(1.1,.3) 1.2s ── */
  const modal = $("[data-modal]");
  const mslider = new Swiper("[data-modal-slider]", { slidesPerView: 1, speed: 500, spaceBetween: 20, on: { slideChangeTransitionStart(s) { if (!reduce) gsap.fromTo(s.slides[s.activeIndex], { scale: 0.92 }, { scale: 1, duration: 1.2, ease: "elastic.out(1.1, 0.3)" }); } } });
  const open = (i) => { mslider.slideTo(i, 0); modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); if (!reduce) gsap.fromTo(mslider.slides[i], { scale: 0.8, y: 30 }, { scale: 1, y: 0, duration: 1.2, ease: "elastic.out(1.1, 0.3)" }); };
  const close = () => { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); };
  const onClick = (e) => { const b = e.target.closest("[data-modal-open]"); if (b) open(+b.dataset.modalOpen); if (e.target.closest("[data-modal-close]")) close(); };
  document.addEventListener("click", onClick);
  kill.push(() => { document.removeEventListener("click", onClick); pick.destroy(); data.destroy(); shorts.destroy(); mslider.destroy(); });
  return () => kill.forEach((f) => f());
});
