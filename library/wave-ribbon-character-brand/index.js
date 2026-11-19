// First page motion — values are the original bundle’s as they are (curve names, durations, start lines).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = window.dpLenis;
  const mm = gsap.matchMedia();

  // The character row is appended one more time so it flows seamlessly (the original also writes innerHTML twice)
  document.querySelectorAll("[data-group]").forEach((g) => { g.innerHTML += g.innerHTML; });

  // Reveal flag — the original re-measures positions on every scroll and toggles it: default is when the top edge is above 150px from the screen bottom · view is within the top 33% of the screen · top is within the screen
  const ins = [...document.querySelectorAll("[data-in]")];
  const mark = () => {
    const h = innerHeight;
    ins.forEach((el) => {
      const top = el.getBoundingClientRect().top, k = el.dataset.in;
      el.classList.toggle("is-in", k === "view" ? top < h * 0.33 : k === "top" ? top < h : top < h - 150);
    });
  };
  if (reduce) ins.forEach((el) => el.classList.add("is-in"));
  else { lenis ? lenis.on("scroll", mark) : addEventListener("scroll", mark, { passive: true }); mark(); }

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero slogan: after fonts finish loading, waits 2 seconds then rises from 30px below over 1.5 seconds (the original also waits for document.fonts.ready before running it)
    gsap.set("[data-mv-title]", { opacity: 0, y: 30 });
    document.fonts.ready.catch(() => {}).then(() => gsap.to("[data-mv-title]", { opacity: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 2 }));

    // Floating plate: stands up from 100px below at -8° in 1.5s, then sways endlessly 30px up and down (2.5s) and tilts 2° (3.5s)
    const show = document.querySelector("[data-showcase]");
    if (show) gsap.fromTo(show, { y: 100, opacity: 0, rotate: -8, transformOrigin: "50% 50%" }, {
      y: 0, opacity: 1, rotate: 0, duration: 1.5, ease: "power3.out",
      onComplete: () => {
        gsap.to(show, { y: "-=30", duration: 2.5, ease: "sine.inOut", repeat: -1, yoyo: true });
        gsap.to(show, { rotate: 2, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true });
      },
    });

    // Quick-word speech bubble: pops out like rubber when the center of the controls reaches the screen center
    const bubble = document.querySelector("[data-bubble]");
    if (bubble) {
      gsap.set(bubble, { autoAlpha: 0, scale: 0.35, rotate: -4 });
      gsap.to(bubble, { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.2, ease: "elastic.out(1.4, 0.35)", scrollTrigger: { trigger: "[data-intro-control]", start: "center center" } });
    }

    // Slogan under the product name: opens from the left (scrub 2)
    document.querySelectorAll("[data-phrase]").forEach((p) => {
      gsap.fromTo(p, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "bottom bottom", scrub: 2 } });
    });

    // Character outline thick line: when it enters the bottom 5% of the screen it draws in over 3 seconds (not tied to scroll)
    document.querySelectorAll("[data-draw]").forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(p, { strokeDashoffset: 0, duration: 3, ease: "power3.inOut", scrollTrigger: { trigger: p.closest("svg"), start: "top 95%", invalidateOnRefresh: true } });
    });
  });

  // Three boxes: each starts at 0.95x from 350 below (phone 250) and offset to the side, then settles into its own tilt (scrub .8). Wide screens measure the whole section, phones measure per box
  mm.add({ desktop: "(min-width: 769px)", mobile: "(max-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions: c }) => {
    if (!c.motion) return;
    const d = c.desktop;
    const at = [{ x: d ? -80 : -20, r: d ? -5 : -3, y: 0 }, { x: 0, r: d ? 8 : 2, y: -10 }, { x: d ? 80 : 5, r: d ? 5 : 2, y: 0 }];
    const host = document.querySelector("[data-fly-host]");
    document.querySelectorAll("[data-fly]").forEach((el, i) => {
      if (i > 2) return;
      gsap.set(el, { y: d ? 350 : 250, x: at[i].x, scale: 0.95, rotation: 0, force3D: true, transformOrigin: "center center" });
      gsap.to(el, { x: 0, y: at[i].y, rotation: at[i].r, scale: 1, ease: "none", scrollTrigger: { trigger: d ? host : el, start: "top 95%", end: "bottom 90%", scrub: 0.8, invalidateOnRefresh: true } });
    });
  });

  // Lineup three-color lines: they open from top to bottom — on wide screens from when the section top edge reaches 20% of the screen, on phones 60% (scrub 1.2)
  mm.add({ sp: "(max-width: 767px)", pc: "(min-width: 768px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions: c }) => {
    if (!c.motion) return;
    document.querySelectorAll("[data-lineup-block]").forEach((block) => {
      block.querySelectorAll("[data-lineup-line]").forEach((line) => {
        gsap.fromTo(line, { clipPath: "inset(0% 0% 100% 0%)" }, {
          clipPath: "inset(0% 0% 0% 0%)", ease: "none",
          scrollTrigger: { trigger: block, start: c.sp ? "top 60%" : "top 20%", end: "bottom 120%", scrub: 1.2, invalidateOnRefresh: true, fastScrollEnd: true },
        });
      });
    });
  });

  // Speech bubble — when a character cell enters the central 70% of the screen, its bubble pops out. Up to two at a time (a third one folds the earliest), and neighboring cells never show together. Once per cell.
  document.querySelectorAll("[data-tips]").forEach((crowd) => {
    const items = [...crowd.querySelectorAll(".dp-pchar")];
    const tips = crowd.querySelectorAll("[data-tip]");
    gsap.set(tips, { autoAlpha: 0, scale: 0, y: 10, xPercent: -50 });
    if (reduce) { gsap.set(tips, { autoAlpha: 1, scale: 1, y: 0 }); return; }
    let shown = [];
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const tip = en.target.querySelector("[data-tip]");
      const i = items.indexOf(en.target);
      if (!tip || shown.some((s) => s.el === tip || Math.abs(s.i - i) === 1)) return;
      if (shown.length >= 2) {
        const old = shown.shift();
        gsap.to(old.el, { autoAlpha: 0, scale: 0, y: 10, duration: 0.25, overwrite: "auto" });
      }
      shown.push({ el: tip, i });
      gsap.fromTo(tip, { autoAlpha: 0, scale: 0, y: 10, xPercent: -50 }, { autoAlpha: 1, scale: 1, y: 0, xPercent: -50, duration: 0.4, ease: "back.out(1.7)", overwrite: "auto", onComplete: () => io.unobserve(en.target) });
    }), { rootMargin: "0px -15% 0px -15%", threshold: 0 });
    items.forEach((li) => io.observe(li));
  });

  // Character carousel — two Swiper 4.5.1 instances like the original (text board autoplays every 4 seconds, image row drags at .2×) are linked together. While transitioning the image row can’t be pressed
  const topEl = document.querySelector("[data-chara-top]");
  const thumbsEl = document.querySelector("[data-chara-thumbs]");
  if (topEl && thumbsEl && window.Swiper) {
    const top = new Swiper(topEl, {
      spaceBetween: 16, loop: true, slidesPerView: 1, loopedSlides: 4, loopAdditionalSlides: 4, observer: true, observeParents: true, allowSlidePrev: false,
      autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false, reverseDirection: false },
    });
    const thumbs = new Swiper(thumbsEl, {
      spaceBetween: 16, slidesPerView: "auto", touchRatio: 0.2, slideToClickedSlide: false, loop: true, loopedSlides: 4, loopAdditionalSlides: 4, observer: true, observeParents: true, allowSlidePrev: false,
      on: { transitionEnd() { this.update(); } },
    });
    top.controller.control = thumbs;
    thumbs.controller.control = top;
    const lock = (v) => { thumbsEl.style.pointerEvents = v ? "none" : top.animating ? "none" : "auto"; };
    top.on("slideChangeTransitionStart", () => lock(true));
    top.on("slideChangeTransitionEnd", () => { lock(true); setTimeout(() => lock(false), 100); });
    const resume = () => { if (!reduce) top.autoplay.start(); };
    thumbs.on("tap", () => { lock(true); if (!top.animating) { top.slideNext(); resume(); } });
    top.on("touchStart", () => top.autoplay && top.autoplay.stop());
    top.on("touchEnd", resume);
    thumbs.on("touchStart", () => top.autoplay && top.autoplay.stop());
    thumbs.on("touchEnd", resume);
    addEventListener("resize", () => { top.update(); thumbs.update(); });
  }

  // Black-and-white video strip: loops silently once more than half is visible (same behavior as the original video background)
  const movie = document.querySelector("[data-movie] video");
  if (movie && !reduce) new IntersectionObserver(([en]) => { if (en.isIntersecting) movie.play().catch(() => {}); }, { threshold: 0.5 }).observe(movie.parentElement);

  // Product story modal: scrolling stops while it is open, close with the close button or the backdrop
  const toggle = (m, on) => {
    m.classList.toggle("is-active", on);
    m.setAttribute("aria-hidden", String(!on));
    const open = document.querySelector(".dp-modal.is-active");
    document.body.classList.toggle("has-modal", !!open);
    open ? lenis?.stop() : lenis?.start();
  };
  document.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", () => {
    const m = document.getElementById(b.dataset.modalOpen);
    if (m) toggle(m, true);
  }));
  document.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", () => toggle(b.closest(".dp-modal"), false)));
  document.querySelector("[data-overlay]")?.addEventListener("click", () => {
    const m = document.querySelector(".dp-modal.is-active");
    if (m) toggle(m, false);
  });
  addEventListener("keydown", (e) => {
    const m = document.querySelector(".dp-modal.is-active");
    if (e.key === "Escape" && m) toggle(m, false);
  });
})();
