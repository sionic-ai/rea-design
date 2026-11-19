// First page — pinned shape (hero mesh gradient → line drawing of the ‹Thinking› section diagram, scrub), strategy model scene transitions, table of contents, swiper, photo parallax.
(() => {
  const mm = gsap.matchMedia();
  const obj = document.querySelector(".gp-obj");
  const stage = obj.querySelector(".gp-obj__stage");
  const [top, mid, bot] = ["is-top", "is-mid", "is-bot"].map((c) => stage.querySelector(`.gp-shape.${c}`));
  const fills = stage.querySelectorAll(".gp-shape__fill");
  const lines = stage.querySelectorAll(".gp-shape__line");
  const kvText = stage.querySelector(".gp-obj__kvtext");
  const stanceDeco = obj.querySelector(".gp-obj__stance");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Once the loader clears, the shape shows after 1s and the mesh gradient turns on in .8s (part delay 1). Text over the shape comes in after 2s over .6s
  gsap.set(kvText, { opacity: 0 });
  addEventListener("gp:loaded", () => {
    fills.forEach((f) => { f.setAttribute("data-fx-stripe-mesh-gradient", f.dataset.mesh); f.setAttribute("data-fx", "stripe-mesh-gradient"); });
    if (reduce) { obj.classList.add("is-on"); gsap.set(kvText, { opacity: 1 }); return; }
    setTimeout(() => obj.classList.add("is-on"), 1000);
    gsap.to(kvText, { opacity: 1, duration: 0.6, delay: 2, ease: "power2.out" });
  }, { once: true });

  mm.add("(min-width: 1024px)", () => {
    gsap.set([top, bot], { rotation: 90 });
    gsap.set(top, { x: 53, y: -242 });
    gsap.set(bot, { x: -195, y: 180 });
    gsap.set(mid, { rotation: 30 });
    gsap.set(lines, { opacity: 0 });
    gsap.set(stanceDeco, { opacity: 0 });
    // ”Thinking” section: while its top edge moves from below the screen to center, shapes shrink to .4x and settle into the diagram spot, gradient → line art, hero text → diagram label
    const tl = gsap.timeline({ scrollTrigger: { trigger: "#stance", start: "top bottom", end: "top center", scrub: 0.5 } });
    tl.to(stage, { scale: 0.4, x: -123, y: -23, ease: "none", duration: 0.3 }, 0)
      .to(top, { rotation: 60, x: 0, y: -276, scale: 0.9, ease: "none", duration: 0.3 }, 0)
      .to(bot, { rotation: 60, x: 0, y: 276, scale: 0.9, ease: "none", duration: 0.3 }, 0)
      .to(mid, { rotation: 0, ease: "none", duration: 0.3 }, 0)
      .to(kvText, { opacity: 0, ease: "none", duration: 0.2 }, 0)
      .to(stanceDeco, { opacity: 1, ease: "none", duration: 0.3 }, 0)
      .to(fills, { opacity: 0, ease: "none", duration: 0.2 }, 0.1)
      .to(lines, { opacity: 1, ease: "none", duration: 0.2 }, 0.1);
    // When the top edge of the strategy model reaches 70% of the screen, the pinned shapes clear away in .3s
    const hide = ScrollTrigger.create({
      trigger: ".smodel", start: "top 70%",
      onEnter: () => gsap.to(obj, { opacity: 0, duration: 0.3, onComplete: () => (obj.style.visibility = "hidden") }),
      onLeaveBack: () => { obj.style.visibility = ""; gsap.to(obj, { opacity: 1, duration: 0.3 }); },
    });
    return () => { hide.kill(); gsap.set([top, bot, mid, stage, kvText, stanceDeco, fills, lines, obj], { clearProps: "all" }); };
  });

  // Strategy model — each scene moves the shapes in 1s power2.inOut, that scene’s picture turns on .8s late over .8s, and other pictures turn off in .4s
  const fig = document.querySelector(".smodel__stage");
  const parts = { 2: ".sf-origin", 3: ".sf-philo", 4: ".sf-strat", 5: ".sf-logic", 6: ".sf-output" };
  const POSE = { 2: { x: 0, y: 0, scale: 1 }, 3: { x: 5, y: -21, scale: 1.217 }, 4: { x: 27, y: -216, scale: 1.49 }, 5: { x: 39, y: -673, scale: 1.767 }, 6: { x: 1, y: -474, scale: 1 } };
  let live = [];
  const apply = (n, instant) => {
    live.forEach((t) => t.kill());
    live = [];
    const d = instant ? 0 : 1;
    live.push(gsap.to(fig, { ...POSE[n], duration: d, ease: "power2.inOut" }));
    Object.entries(parts).forEach(([k, sel]) => {
      const el = fig.querySelector(sel);
      if (+k === n) live.push(gsap.to(el, { opacity: 1, duration: instant ? 0 : 0.8, delay: instant ? 0 : n === 6 ? 0.3 : 0.8 }));
      else live.push(gsap.to(el, { opacity: 0, duration: instant ? 0 : 0.4 }));
    });
  };
  const scenes = [...document.querySelectorAll(".smodel__scene")];
  const sceneNow = () => {
    let n = 2;
    scenes.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight / 2) n = +s.dataset.scene; });
    return n;
  };
  mm.add("(min-width: 1024px)", () => {
    const sts = [
      ScrollTrigger.create({ trigger: ".smodel", start: "top center", end: "bottom center",
        onEnter: () => { gsap.to(fig, { opacity: 1, duration: 0.6 }); apply(2, reduce); },
        onEnterBack: () => { gsap.set(fig, { opacity: 1 }); apply(Math.min(6, Math.max(2, sceneNow())), reduce); },
        onLeaveBack: () => gsap.to(fig, { opacity: 0, duration: 0.4, ease: "power2.out" }) }),
      ScrollTrigger.create({ trigger: "#philosophy", start: "top center", end: "bottom center", onEnter: () => apply(3), onLeave: () => apply(4), onEnterBack: () => apply(3), onLeaveBack: () => apply(2) }),
      ScrollTrigger.create({ trigger: "#strategy", start: "top center", end: "bottom 20%", onEnter: () => apply(4), onLeave: () => apply(5), onEnterBack: () => apply(4), onLeaveBack: () => apply(3) }),
      ScrollTrigger.create({ trigger: "#logic", start: "top 20%", end: "bottom center", onEnter: () => apply(5), onLeave: () => apply(6), onEnterBack: () => apply(5), onLeaveBack: () => apply(4) }),
      ScrollTrigger.create({ trigger: "#output", start: "top 70%", end: "bottom 70%", onEnter: () => apply(6), onEnterBack: () => apply(6), onLeaveBack: () => apply(5) }),
    ];
    return () => { sts.forEach((s) => s.kill()); live.forEach((t) => t.kill()); };
  });

  // Table of contents — red marker on the current scene, click moves 80px above that scene, every 4.6s English ↔ Korean is pushed up and swapped in .4s
  const items = [...document.querySelectorAll(".smodel__nav-item")];
  const setActive = (i) => items.forEach((it, k) => it.classList.toggle("is-active", k === i));
  scenes.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top center", end: "bottom center", onEnter: () => setActive(i), onEnterBack: () => setActive(i) }));
  items.forEach((it, i) => it.addEventListener("click", () => {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    scrollTo({ top: scenes[i].getBoundingClientRect().top + scrollY - pad - 80, behavior: "smooth" });
  }));
  if (!reduce) items.forEach((it) => {
    const en = it.querySelector(".en"), kr = it.querySelector(".kr");
    gsap.set(kr, { yPercent: 200 });
    gsap.timeline({ repeat: -1 })
      .to({}, { duration: 4.6 })
      .to(en, { yPercent: -100, duration: 0.4, ease: "power2.inOut" })
      .to(kr, { yPercent: -100, duration: 0.4, ease: "power2.inOut" }, "<")
      .to({}, { duration: 4.6 })
      .set(en, { yPercent: 100 })
      .to(kr, { yPercent: -200, duration: 0.4, ease: "power2.inOut" })
      .to(en, { yPercent: 0, duration: 0.4, ease: "power2.inOut" }, "<")
      .set(kr, { yPercent: 200 });
  });

  // Media and columns — same Swiper as the original (auto width, 19px gap, no loop)
  addEventListener("load", () => {
    document.querySelectorAll(".slider").forEach((s) => {
      const el = s.querySelector(".swiper");
      if (el.classList.contains("js-media") && innerWidth < 768) return;
      new Swiper(el, { slidesPerView: "auto", spaceBetween: 19, loop: false, navigation: { nextEl: s.querySelector(".is-next"), prevEl: s.querySelector(".is-prev") } });
    });
  });

  // Service entrance photo and News photo — while the cell passes through the screen, the photo slides from -10% to 10%
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    [[".svc-cta__card", ".wf-img"], [".news__img", ".wf-img"]].forEach(([t, i]) => document.querySelectorAll(t).forEach((card) => {
      gsap.fromTo(card.querySelector(i), { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
    }));
  });
})();
