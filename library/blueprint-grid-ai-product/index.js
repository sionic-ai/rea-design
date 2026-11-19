HR.page("home", (box) => {
  const offs = [];
  const mm = gsap.matchMedia();
  const rem = HR.rem();
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  // Hero entrance — .3s after the loader lifts: the line is drawn and the title words rise (first open), and when entering via barba, immediately
  const heroIn = () => box.querySelectorAll('[data-hr-in="load"]').forEach((b) => gsap.delayedCall(0.3, () => HR.revealNow(b)));
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const pre = [...box.querySelectorAll('[data-hr-in="load"]')].map((b) => HR.prep(b));
    const go = () => gsap.delayedCall(0.3, () => pre.forEach((f) => f()));
    if (document.querySelector(".hr-loader.is-done") && HR.booted) go();
    else HR.loaderDone.then(go);
  });
  HR.booted = true;

  // Hero crosshair — follows .3 of the remaining distance each frame (measured value), and the faster it moves, the slightly larger the + gets and the fainter the lines become.
  const stage = box.querySelector(".hi-hero__img");
  const ui = box.querySelector(".hi-hero__interact");
  if (stage && ui && matchMedia("(hover: hover) and (min-width: 768px)").matches && !HR.reduce) {
    const cv = ui.querySelector(".hi-hero__cv"), ch = ui.querySelector(".hi-hero__ch"), cp = ui.querySelector(".hi-hero__cp");
    const co = ui.querySelector(".hi-hero__coord"), tip = ui.querySelector(".hi-hero__tip"), cb = co.querySelectorAll("b");
    let r = stage.getBoundingClientRect();
    const p = { x: 0, y: 0 }, q = { x: 0, y: 0 };
    let inside = false, seen = false, tipped = false;
    const move = (e) => {
      r = stage.getBoundingClientRect();
      q.x = e.clientX - r.left - r.width / 2; q.y = e.clientY - r.top - r.height / 2;
      if (!seen) { p.x = q.x; p.y = q.y; seen = true; }
    };
    const enter = (e) => { inside = true; move(e); gsap.to(ui, { autoAlpha: 1, duration: 0.25, ease: "power2.out", overwrite: "auto" }); };
    const leave = () => { inside = false; seen = false; gsap.to(ui, { autoAlpha: 0, duration: 0.25, ease: "power2.out", overwrite: "auto" }); };
    const down = () => { if (!tipped) { tipped = true; gsap.to(tip, { autoAlpha: 0, duration: 0.25 }); } };
    stage.addEventListener("pointerenter", enter);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);
    stage.addEventListener("pointerdown", down);
    const tick = () => {
      if (!inside) return;
      const dx = (q.x - p.x) * 0.3, dy = (q.y - p.y) * 0.3;
      p.x += dx; p.y += dy;
      const sp = Math.min(1, Math.hypot(dx, dy) / 300);
      gsap.set(cv, { x: p.x, autoAlpha: 0.16 + 0.02 * sp });
      gsap.set(ch, { y: p.y, autoAlpha: 0.16 + 0.02 * sp });
      gsap.set(cp, { x: p.x, y: p.y, scale: 1 + 0.02 * sp });
      gsap.set(co, { x: p.x + 23.3, y: p.y - 14.2 });
      tipped || gsap.set(tip, { x: p.x + 68.3, y: p.y + 20.8 });
      cb[0].textContent = Math.round(p.x + r.width / 2);
      cb[1].textContent = Math.round(p.y + r.height / 2);
    };
    gsap.ticker.add(tick);
    offs.push(() => { gsap.ticker.remove(tick); stage.removeEventListener("pointerenter", enter); stage.removeEventListener("pointermove", move); stage.removeEventListener("pointerleave", leave); stage.removeEventListener("pointerdown", down); });
  }
  box.querySelectorAll(".hi-mark").forEach((m) => {
    m.addEventListener("pointerenter", () => m.classList.add("is-active"));
    m.addEventListener("pointerleave", () => m.classList.remove("is-active"));
    m.addEventListener("click", () => m.classList.toggle("is-active"));
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // About big text — each character goes from gray (--kf-line) to ink while its center passes from screen bottom +10% → top +40% (scrub)
    const big = box.querySelector(".hi-intro__big");
    if (big) {
      const s = new SplitText(big, { type: "chars,words,lines" });
      gsap.fromTo(s.chars, { color: css("--kf-line") }, { color: css("--kf-ink"), stagger: 0.03, ease: "none",
        scrollTrigger: { trigger: big, start: "center bottom+=10%", end: "center top+=40%", scrub: true } });
    }
    // About sun circle — the circle opens like spreading ink
    const sun = box.querySelector(".hi-intro__sun");
    sun && gsap.to(sun, { clipPath: "circle(75% at 30% 70%)", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: sun, start: "top+=45% bottom", once: true } });

    // Problem card drawing — measures line length ahead of time, a css keyframe draws it on hover
    box.querySelectorAll(".hi-prob__img").forEach((wrap) => wrap.querySelectorAll("[data-draw]").forEach((p, i) => {
      const n = p.getTotalLength ? Math.ceil(p.getTotalLength()) : 200;
      p.style.setProperty("--len", n); p.style.setProperty("--i", i % 8); p.style.strokeDasharray = n;
    }));

    // Map — the stage floats beneath the previous section (during top bottom → top top, −100vh → 0) then is fixed, two phrases → walls gather → darker · furniture → dimensions → violations → right panel
    const map = box.querySelector(".hi-map");
    if (map && matchMedia("(min-width: 768px)").matches) {
      const stick = map.querySelector(".hi-map__stick");
      gsap.fromTo(stick, { y: () => -innerHeight }, { y: 0, ease: "none", scrollTrigger: { trigger: map, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
      const says = map.querySelectorAll(".hi-map__say");
      const walls = map.querySelectorAll(".hi-plan__walls rect");
      const wg = map.querySelector(".hi-plan__walls");
      const txt = map.querySelectorAll(".hi-map__boxtxt"), hint = map.querySelector(".hi-map__hint");
      gsap.set(says[1], { autoAlpha: 0 });
      gsap.set(walls, { opacity: 0, scale: 1.1, x: () => gsap.utils.random(-40, 40), y: () => gsap.utils.random(-40, 40) });
      gsap.set(map.querySelector(".hi-map__box"), { autoAlpha: 0 });
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: map, start: "top 50%", end: "bottom-=270 bottom", scrub: true,
        onUpdate: (st) => {
          map.classList.toggle("is-expanded", st.progress > 0.86);
          const late = st.progress > 0.42;
          txt[0].style.display = late ? "none" : ""; txt[1].style.display = late ? "block" : "none";
          hint.textContent = st.progress > 0.7 ? "[Click a violation to view]" : "[Scroll to continue]";
        } } });
      tl.fromTo(says[0], { autoAlpha: 1, y: 0.3 * rem, scale: 1 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1 })
        .to(says[0], { autoAlpha: 0, y: -0.3 * rem, scale: 0.96, duration: 1 })
        .fromTo(says[1], { autoAlpha: 0, y: 0.3 * rem, scale: 1.04 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1 }, "<")
        .to(says[1], { autoAlpha: 0, y: -0.3 * rem, scale: 0.96, duration: 1 }, "+=0.6")
        .to(map.querySelector(".hi-map__box"), { autoAlpha: 1, duration: 0.4 }, "<")
        .to(walls, { scale: 1, opacity: 1, x: 0, y: 0, duration: 1.4, stagger: { amount: 0.02 * 50, from: "random" } })
        .add(() => {}, "+=0.3")
        .to(map.querySelectorAll(".hi-plan__walls rect"), { fill: css("--kf-ink"), stroke: css("--kf-ink"), duration: 1 })
        .to(map.querySelector(".hi-plan__furn"), { opacity: 1, duration: 1 }, "<")
        .to(map.querySelector(".hi-plan__dims"), { opacity: 1, duration: 1 })
        .to(map.querySelectorAll(".hi-plan__marks g"), { opacity: 1, duration: 0.4, stagger: 0.3 })
        .to({}, { duration: 2 });
      // When the panel opens, the list icons come in at 1.25x
      const icons = map.querySelectorAll(".hi-map__ic");
      gsap.set(icons, { scale: 1.25, autoAlpha: 0 });
      const ob = new MutationObserver(() => { if (map.classList.contains("is-expanded")) { gsap.to(icons, { scale: 1, autoAlpha: 1, duration: 1.6, ease: "expo.out", stagger: 0.1 }); ob.disconnect(); } });
      ob.observe(map, { attributes: true, attributeFilter: ["class"] });
      offs.push(() => ob.disconnect());
      map.querySelectorAll(".hi-plan__marks g").forEach((g) => g.addEventListener("click", () => g.classList.toggle("is-on")));
    }

    // Two products — while the panel is fixed, 01 → 02 at half of the scroll share
    const plat = box.querySelector(".hi-plat");
    if (plat && matchMedia("(min-width: 768px)").matches) {
      const items = plat.querySelectorAll(".hi-plat__item");
      ScrollTrigger.create({ trigger: plat, start: "top bottom", end: "bottom top", scrub: true,
        onUpdate: (st) => { const k = st.progress < 0.5 ? 0 : 1; items.forEach((it, i) => it.classList.toggle("is-active", i === k)); } });
    }

    // Why — while the image cell passes the screen center, that row’s band darkens
    box.querySelectorAll(".hi-why__item").forEach((it) => ScrollTrigger.create({ trigger: it, start: "top 50%", end: "bottom 50%", toggleClass: { targets: it, className: "is-active" } }));
  });

  // Client logos — original swiper: auto width, 3 at a time, .6s, 3s autoplay, loop
  const sw = box.querySelector(".hi-intro__logos");
  if (sw && window.Swiper) {
    const s = new Swiper(sw, { slidesPerView: "auto", spaceBetween: 0, speed: 600, loop: true, slidesPerGroup: 3,
      autoplay: HR.reduce ? false : { delay: 3000, disableOnInteraction: false },
      navigation: { nextEl: box.querySelector(".hr-ctl.is-next"), prevEl: box.querySelector(".hr-ctl.is-prev") } });
    offs.push(() => s.destroy(true, true));
  }

  // Uses — pressing opens that row and the left image changes
  const items = box.querySelectorAll(".hi-use__item"), pics = box.querySelectorAll(".hi-use__pic");
  items.forEach((it, i) => it.querySelector(".hi-use__q").addEventListener("click", () => {
    const on = !it.classList.contains("is-active");
    items.forEach((x) => x.classList.remove("is-active"));
    it.classList.toggle("is-active", on);
    pics.forEach((p, k) => p.classList.toggle("is-active", k === (on ? i : 0)));
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }));

  return () => { offs.forEach((f) => f()); mm.revert(); };
});
