(() => {
  gsap.registerPlugin(ScrollTrigger);

  // Environment section photo column — six cells per column
  const ENV = ["Office lounge sofa and plants · daylight", "Hands and laptop in a meeting · Top view", "Two staff standing and talking · by the window", "Desk with color swatches spread out · close-up", "Café-like lounge area · warm lighting", "Meeting in front of presentation screen · dark room"];
  document.querySelectorAll(".sr-env__col").forEach((col, c) => {
    col.innerHTML = ENV.map((_, i) => `<div class="sr-env__image"><div class="wf-img sr-ph" data-label="${ENV[(i + c * 2) % ENV.length]} · Portrait 21:22"></div></div>`).join("");
  });

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero → lead: blur veil 0→8px, opacity 0→1, and the cutout photo follows down to below the lead text (original values as is)
    const mv = document.querySelector(".sr-mv");
    const lead = document.querySelector(".sr-lead");
    const mvBg = document.querySelector(".sr-mvbg");
    gsap.to(".js-bgBlur", {
      opacity: 1, "--blur": "8px", ease: "none",
      scrollTrigger: { trigger: mv, start: "top top", endTrigger: lead, end: "bottom top", scrub: true },
    });
    gsap.to(mvBg, {
      y: () => lead.offsetTop + lead.offsetHeight / 1.5 - mv.offsetTop - mvBg.offsetHeight / 1.5,
      ease: "none",
      scrollTrigger: { trigger: mv, start: "top top", end: () => `${lead.offsetTop + lead.offsetHeight / 2} top`, scrub: true, invalidateOnRefresh: true },
    });

    // Four stair bars before the dark section — 0→1 in order from the bottom bar (original layerAnime)
    const layers = gsap.utils.toArray(".sr-stair__layer");
    const total = layers.length;
    gsap.set(layers, { scaleY: 0, transformOrigin: "top center" });
    ScrollTrigger.create({
      trigger: ".sr-stair", start: "top 75%", end: "bottom 75%", scrub: true,
      onUpdate: (self) => layers.forEach((el, i) => {
        const o = ((total - 1 - i) / total) * 0.5;
        gsap.set(el, { scaleY: gsap.utils.clamp(0, 1, (self.progress - o) / (1 - o)) });
      }),
    });

    // Group photo .8→1 scale
    gsap.fromTo(".sr-bganim .wf-img", { scale: 0.8 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".sr-bganim", start: "top bottom", end: "center center", scrub: true } });
  });

  // Case panel: each panel sticks for one screen (no spacing) and the next panel rises to cover it
  const items = gsap.utils.toArray(".sr-plist__item");
  mm.add({ sp: "(max-width: 500px)", pc: "(min-width: 501px)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (!ctx.conditions.motion) return;
    items.forEach((el, i) => {
      const start = ctx.conditions.sp ? (i === 0 ? "top-=49 top" : "top-=50 top") : (i === 0 ? "top+=1 top" : "top top");
      ScrollTrigger.create({ trigger: el, start, end: "+=100%", pin: true, pinSpacing: false });
    });
  });

  // Four-cell hover — that cell’s photo spreads across all four cells and the other cells’ names disappear (off at 650px and below)
  const wrap = document.querySelector(".sr-cols");
  if (wrap) {
    const links = wrap.querySelectorAll(".sr-cols__link");
    const bgs = wrap.querySelectorAll(".sr-cols__bgimg");
    links.forEach((link, i) => {
      link.addEventListener("mouseenter", () => {
        if (innerWidth <= 650) return;
        bgs.forEach((b) => (b.style.opacity = "0"));
        links.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
        if (bgs[i]) bgs[i].style.opacity = "1";
        links.forEach((l) => { l.querySelector(".sr-cols__info").style.opacity = l.classList.contains("is-active") ? "1" : "0"; });
      });
      link.addEventListener("mouseleave", () => {
        if (innerWidth <= 650) return;
        bgs.forEach((b) => (b.style.opacity = "0"));
        links.forEach((l) => { l.classList.remove("is-active"); l.querySelector(".sr-cols__info").style.opacity = "1"; });
      });
    });
  }

  // People card slider — same Splide 4.1.2 and same options as the original
  const splideEl = document.querySelector(".sr-people__splide");
  if (splideEl && window.Splide) {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    new Splide(splideEl, {
      type: "loop", focus: "center", perPage: 2, perMove: 1, autoplay: !reduce, gap: 120, arrows: false, interval: 3000,
      breakpoints: { 500: { perPage: 1, gap: 20 }, 650: { perPage: 2, gap: 30 }, 810: { perPage: 2, gap: 50 }, 1080: { perPage: 2, gap: 120 } },
    }).mount();
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
