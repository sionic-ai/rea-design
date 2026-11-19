// Motion shared by the whole site — original main.js Scroller·Menu·AnimHover·Footer·PageCover·PrlxImg·CardBlock rewritten with the same values.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The original sets 1rem to body width/144 (phone /37.5), and converts JS values at the same ratio (rpx)
  const setVw = () => root.style.setProperty("--tn-vw", body.clientWidth + "px");
  setVw();
  addEventListener("resize", setVw);
  const isSp = () => body.clientWidth <= 767;
  const rpx = (v) => (v * body.clientWidth) / (isSp() ? 375 : 1440);
  if ("ontouchstart" in document) body.classList.add("is-touch");

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Original Lenis settings as is (with lerp 1, each frame covers 63% of the remaining distance — follows almost instantly without stuttering)
  const lenis = new Lenis({ autoRaf: true, lerp: 1, duration: 1.5 });
  lenis.on("scroll", ScrollTrigger.update);
  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) lenis.scrollTo(target, { force: true, immediate: true });
  }
  document.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      lenis.scrollTo(href.length === 1 ? 0 : href, { offset: 1 });
      e.preventDefault();
    });
  });

  // Curtain lift — once the font (3s limit), hero video (preloaded up to the first frames and rewound to 0s) and the minimum 1s are all done, it disappears on the spot
  const waits = { font: false, video: false, min: false };
  const ready = () => {
    if (body.classList.contains("is-ready") || !Object.values(waits).every(Boolean)) return;
    body.classList.add("is-ready");
    ScrollTrigger.refresh();
    dispatchEvent(new Event("tn:ready"));
  };
  const done = (key) => { waits[key] = true; ready(); };
  document.fonts.ready.then(() => done("font"));
  setTimeout(() => done("font"), 3000);
  setTimeout(() => done("min"), reduce ? 0 : 1000);
  const pre = document.querySelector("video[data-preload]");
  if (pre) {
    let settled = false;
    const finish = () => { if (!settled) { settled = true; done("video"); } };
    const prime = () => {
      pre.play().then(() => {
        const wait = () => {
          if (pre.currentTime === 0) return requestAnimationFrame(wait);
          pre.pause();
          pre.currentTime = 0;
          finish();
        };
        wait();
      }).catch(finish);
    };
    if (pre.readyState >= 4) prime();
    else pre.addEventListener("canplaythrough", prime, { once: true });
    setTimeout(finish, 4000);
  } else done("video");

  const menu = document.querySelector(".tn-menu");
  menu?.querySelector(".tn-menu__toggle").addEventListener("click", () => menu.classList.toggle("is-open"));

  // Like the original it’s a div button, so pass Enter and Space as click so the keyboard works too
  document.querySelectorAll('[role="button"]').forEach((el) => el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
  }));

  // On hover, is-anim for 0.5s — hovering again during that time doesn’t restart from the beginning (original animhover)
  const animHover = (el) => {
    let timer = null;
    el.addEventListener("mouseenter", () => {
      if (el.classList.contains("is-anim")) return;
      clearTimeout(timer);
      timer = setTimeout(() => { el.classList.remove("is-anim"); timer = null; }, 500);
      el.classList.add("is-anim");
    });
  };
  document.querySelectorAll(".tn-link, .tn-backtop, [data-anim-hover]").forEach(animHover);
  window.tnAnimHover = animHover;

  // Height 0 ↔ content height in .5s expo — ScrollTrigger is re-measured every frame while moving
  const accordion = (block, box, contents, { delay = false } = {}) => {
    let moving = false;
    const loop = () => { ScrollTrigger.refresh(); if (moving) requestAnimationFrame(loop); };
    box.addEventListener("transitionend", (e) => {
      if (e.target !== box) return;
      box.style.height = "";
      box.classList.remove("is-moving", "is-delay");
      ScrollTrigger.refresh();
      moving = false;
    });
    const set = (open, late) => {
      box.classList.remove("is-moving", "is-delay");
      box.style.height = open ? "0px" : contents.offsetHeight + "px";
      block.classList.toggle("is-open", open);
      moving = true;
      loop();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        box.classList.add("is-moving");
        if (late) box.classList.add("is-delay");
        box.style.height = open ? contents.offsetHeight + "px" : "0px";
      }));
    };
    return { open: (late) => set(true, late), close: () => set(false), toggle: () => set(!block.classList.contains("is-open")), reset: () => { block.classList.remove("is-open"); box.classList.remove("is-moving", "is-delay"); box.style.height = ""; } };
  };
  window.tnAccordion = accordion;

  const resets = [];
  let context = isSp() ? "sp" : "pc";
  addEventListener("resize", () => {
    const now = isSp() ? "sp" : "pc";
    if (now === context) return;
    context = now;
    resets.forEach((fn) => fn());
  });
  window.tnContext = () => context;
  window.tnOnContext = (fn) => resets.push(fn);

  document.querySelectorAll(".tn-card").forEach((card) => {
    const acc = accordion(card, card.querySelector(".tn-card__container"), card.querySelector(".tn-card__contents"));
    card.querySelector(".tn-card__label").addEventListener("click", () => { if (context === "sp") acc.toggle(); });
    resets.push(acc.reset);
  });

  const mm = gsap.matchMedia();
  const active = (el) => ({
    onEnter: () => el.classList.add("is-active"),
    onEnterBack: () => el.classList.add("is-active"),
    onLeave: () => el.classList.remove("is-active"),
  });

  mm.add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions: c }) => {
    if (!c.motion) {
      document.querySelectorAll(".tn-cover, .tn-prlx").forEach((el) => el.classList.add("is-active"));
      return;
    }
    const undo = [];

    // Footer: sticks when the wordmark touches 84rpx from the top of the screen, and the left video goes -28.57% → 0 while the footer enters
    const footer = document.querySelector(".tn-footer");
    if (footer && c.pc) {
      ScrollTrigger.create({ trigger: footer.querySelector(".tn-footer__heading"), start: () => "top top+=" + rpx(84), pin: true, pinSpacing: false, invalidateOnRefresh: true });
      gsap.fromTo(footer.querySelector(".tn-footer__visual > *"), { yPercent: ((1.4 - 1) / 1.4) * -100 }, {
        yPercent: 0,
        ease: "none",
        scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
      });
    }

    // Subpage cover: section name · title stick 30rpx above the screen bottom until the cover ends, photo ±22.2% (phone: 108% height, 0 → 28.57%)
    document.querySelectorAll(".tn-cover").forEach((cover) => {
      const main = cover.querySelector(".tn-cover__main");
      const viewport = cover.querySelector(".tn-cover__viewport");
      const img = viewport.firstElementChild;
      ScrollTrigger.create({ trigger: main, start: () => "bottom bottom-=" + rpx(30), endTrigger: cover, end: "bottom bottom", pin: true, pinSpacing: false, invalidateOnRefresh: true });
      if (c.pc) {
        gsap.fromTo(img, { yPercent: -22.222222222222225 }, {
          yPercent: 22.222222222222225,
          ease: "none",
          scrollTrigger: { trigger: viewport, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true, ...active(cover) },
        });
      } else {
        img.style.height = "108%";
        gsap.fromTo(img, { yPercent: 0 }, {
          yPercent: ((1.4 - 1) / 1.4) * 100,
          ease: "none",
          scrollTrigger: { start: "top-=1 top", endTrigger: viewport, end: "bottom top", scrub: true, invalidateOnRefresh: true, ...active(cover) },
        });
        undo.push(() => { img.style.height = ""; });
      }
    });

    // Parallax photo: cover type moves ±(mag-1)/mag/2 at the same height, otherwise from 0 to (mag-1)/mag at mag times the height
    document.querySelectorAll(".tn-prlx").forEach((el) => {
      const target = el.querySelector(".tn-prlx__target");
      if (!target) return;
      const mag = Number(el.dataset.prlxMag || 1.2);
      const cover = el.dataset.prlxType === "cover";
      const span = ((mag - 1) / mag) * 100;
      target.style.height = cover ? "100%" : mag * 100 + "%";
      const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true, ...active(el), onLeaveBack: () => el.classList.remove("is-active") };
      gsap.fromTo(target, { yPercent: cover ? span * -0.5 : 0 }, { yPercent: cover ? span * 0.5 : span, ease: "none", scrollTrigger: st });
      undo.push(() => { target.style.height = ""; });
    });
    return () => undo.forEach((fn) => fn());
  });

  window.tnLenis = lenis;
  window.tnRpx = rpx;
})();
