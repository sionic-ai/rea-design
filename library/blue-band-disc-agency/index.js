// Home motion — values read from the original bundle (HomeServices·HomeStrategic·HomeGrow·HomePromotion·HomeAbout)
(() => {
  const { reduce, desktop } = G;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const vh = () => innerHeight;

  // Question expand (an interaction, so it applies regardless of reduced motion)
  $$(".h-faq__item").forEach((it) => $(".h-faq__q", it).addEventListener("click", () => {
    const open = !it.classList.contains("is-open");
    $$(".h-faq__item").forEach((o) => { o.classList.remove("is-open"); $(".h-faq__q", o).setAttribute("aria-expanded", "false"); });
    it.classList.toggle("is-open", open); $(".h-faq__q", it).setAttribute("aria-expanded", String(open));
    setTimeout(() => ScrollTrigger.refresh(), 650);
  }));

  const start = () => {
    // Hero text stands up from blur once the loader clears (.8 power2.out, buttons from above at 1.2 power3.out with .07 spacing)
    const heroIn = () => { G.blurIn($(".h-top h1")); G.blurIn($$(".h-top__btns > *"), { blur: 0, y: 40, duration: 1.2, ease: "power3.out", stagger: 0.07, delay: 0.2 }); };
    $$(".h-top [data-reveal]").forEach((el) => el.removeAttribute("data-reveal"));
    G.ready ? heroIn() : document.addEventListener("g:ready", heroIn, { once: true });

    // Selected service: turns on when the row’s top edge reaches the lower 30% of the screen and off when scrolled back up
    $$("[data-svc]").forEach((it, i) => ScrollTrigger.create({ trigger: it, start: "top bottom-=30%", end: "bottom center", onEnter: () => it.classList.add("is-on"), onLeaveBack: () => i && it.classList.remove("is-on") }));
    if (reduce) { $$("[data-svc]").forEach((it) => it.classList.add("is-on")); return; }

    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      // Blue About: the dot on the ring follows a circle path (radius = ring radius) it goes around once throughout the scroll (original motionPath 50-point circle, ease none)
      $$("[data-orbit]").forEach((node) => {
        const dot = $(".h-about__dot", node);
        const st = { a: 0 };
        gsap.to(st, { a: 1, ease: "none", scrollTrigger: { trigger: ".h-about", start: "top bottom", end: "bottom top", scrub: 1 }, onUpdate: () => { const r = node.offsetWidth / 2, t = st.a * 2 * Math.PI - Math.PI / 2; gsap.set(dot, { x: r * Math.cos(t), y: r * Math.sin(t) }); } });
      });

      // Services large text: from 30% width in the center to the top at full width (scrub true), plates stick together with no gap and the list covers them from above
      if (desktop()) {
        const intro = $(".h-services__intro"), svg = $(".h-services__svg"), main = $(".h-services__main");
        const fin = () => { const w = main.getBoundingClientRect().width, vb = svg.viewBox.baseVal; return { w, dist: Math.max(intro.getBoundingClientRect().height - w * (vb.height / vb.width) + 120, 1) }; };
        gsap.set(svg, { top: "50%", left: "50%", width: "30%", xPercent: -50, yPercent: -50, translate: "none" });
        gsap.to(svg, { top: 0, width: () => fin().w, yPercent: 0, ease: "none", scrollTrigger: { trigger: intro, start: "top top", end: () => `+=${fin().dist}`, scrub: true, pin: intro, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 20 } });
      }

      // Industry strip: two copies of the list chained, rising straight up by one copy’s height in 24s (repeats)
      const list = $(".h-promo__list");
      list.innerHTML += list.innerHTML;
      gsap.fromTo(list, { y: 0 }, { y: () => -list.offsetHeight / 2, duration: 24, ease: "none", repeat: -1 });

      // Strategy steps: the canvas is stacked at max(2 screens, 1600px) and the steps advance with progress. On each change the new title stands up out of a blur and the circle row slides sideways
      const slides = $$(".h-strat__slide"), track = $(".h-strat__track"), count = $(".h-strat__count b");
      let cur = 0;
      const go = (i) => { if (i === cur) return; slides[cur].classList.remove("is-on"); slides[i].classList.add("is-on"); G.blurIn(slides[i].children, { blur: 15 }); cur = i; count.textContent = String(i + 1).padStart(2, "0"); track.style.transform = `translateX(${-i * 14}%)`; };
      ScrollTrigger.create({ trigger: ".h-strat__pin", start: "top top", end: () => `+=${Math.max(vh() * 2, 1600)}`, pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (s) => go(Math.min(slides.length - 1, Math.floor(s.progress * slides.length))) });

      // Circle window growth: while the panel is attached, progress drives the timeline — circle window circle(7.3%) → circle(100%), words on both sides move to the center (x 0), video plays in proportion to progress
      const pinEl = $(".h-grow__pin"), media = $(".h-grow__media"), video = $("video", media), wl = $(".h-grow__w--l"), wr = $(".h-grow__w--r");
      const tl = gsap.timeline({ paused: true })
        .fromTo(media, { clipPath: "circle(7.3% at 50% 50%)" }, { clipPath: "circle(100% at 50% 50%)", ease: "none", duration: 1 }, 0)
        .fromTo(wl, { x: () => -innerWidth * 0.14 * (desktop() ? 1 : 0), color: G.color("--kf-accent") }, { x: () => innerWidth * 0.06 * (desktop() ? 1 : 0), color: G.color("--kf-contrast-ink"), ease: "none", duration: 1 }, 0)
        .fromTo(wr, { x: () => innerWidth * 0.14 * (desktop() ? 1 : 0), color: G.color("--kf-accent") }, { x: () => -innerWidth * 0.06 * (desktop() ? 1 : 0), color: G.color("--kf-contrast-ink"), ease: "none", duration: 1 }, 0);
      ScrollTrigger.create({ trigger: ".h-grow", start: "top top", end: "bottom bottom", pin: pinEl, pinSpacing: false, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: (s) => { tl.progress(s.progress); if (video.duration) video.currentTime = video.duration * s.progress * 0.999; } });
    });
  };

  G.boot(start);
})();
