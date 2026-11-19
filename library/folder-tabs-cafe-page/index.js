// First page motion. Values as in the original: hero power2.out 0.75~0.95s, story line blur clearing 1.5s at 0.1 intervals,
// Photo, strip and text turn on when they enter at 0.75s power2.inOut and rewind when they leave (play reverse play reverse).
(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const TOGGLE = "play reverse play reverse";
  const mm = gsap.matchMedia();
  const motion = "(prefers-reduced-motion: no-preference)";

  // Background video: like the original, load only the version that fits the width and keep it paused (641 and up 16:9, below that 1:1) ----------------
  let video = null;
  gsap.matchMedia().add({ wide: "(min-width: 641px)", narrow: "(max-width: 640px)" }, (ctx) => {
    video = $(ctx.conditions.wide ? "#y-video-pc" : "#y-video-sp");
    if (!video.src) video.src = video.dataset.src;
    video.load();
    video.pause();
  });
  // After the hero opens, it runs only from the top to the story end, while the last line is visible
  const videoMov = () => {
    const play = () => video && video.play().catch(() => {});
    const pause = () => video && video.pause();
    const on = { onEnter: play, onEnterBack: play, onLeave: pause, onLeaveBack: pause };
    ScrollTrigger.create({ trigger: document.body, endTrigger: "#y-story", start: "-1px top", end: "bottom bottom", ...on });
    ScrollTrigger.create({ trigger: "#y-end", start: "top bottom", end: "bottom top", ...on });
  };

  // Hero: once the loader starts lifting, header → left panel → bottom strip → background video → tabs, in that order -------------
  // A one-time entrance, so don’t rewind it with matchMedia (so the header doesn’t vanish and return when the width changes).
  document.addEventListener("y:intro-done", () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (video) video.muted = true;
    const wide = innerWidth > 1080;
    const headDur = innerHeight * 0.5 < scrollY ? 0 : 0.75;
    const tl = gsap.timeline()
      .to("#y-head-inner", { duration: headDur, y: 0, autoAlpha: 1, ease: "power2.out" }, 1.2)
      .to("#y-kv-concept", { duration: wide ? 0.95 : 0.75, x: 0, y: 0, autoAlpha: 1, ease: "power2.out" }, wide ? "-=.5" : "-=.4")
      .to("#y-kv-access", { duration: 0.75, y: 0, autoAlpha: 1, ease: "power2.out" }, "-=.5")
      .to("#y-burger", { duration: wide ? 0 : 0.75, autoAlpha: 1, ease: "power2.out" }, "<")
      .to(".y-video", { duration: 0.8, autoAlpha: 1, ease: "power2.out", onStart: () => { video?.play().catch(() => {}); videoMov(); } }, "-=.25")
      .to(".y-tab", { duration: 0.05, autoAlpha: 1 });
  }, { once: true });

  // Story ------------------------------------------------------------
  const items = $$(".y-story__item");
  mm.add({ motion, reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const quick = ctx.conditions.reduce;
    $$(".y-story__txt").forEach((txt, i) => {
      if (quick) return;
      gsap.to(txt.children, {
        duration: 1.5, autoAlpha: 1, filter: "blur(0px)", stagger: 0.1, ease: "power2.inOut",
        scrollTrigger: { trigger: items[i], start: "top 70%", end: "bottom 50%", toggleActions: TOGGLE },
      });
    });
    // On entry a 40% black curtain over the video, and at the third paragraph a gray board covers it and the text turns dark gray
    gsap.to(".y-story__dim", {
      duration: quick ? 0 : 0.5, autoAlpha: 1,
      scrollTrigger: { trigger: items[0], endTrigger: ".y-story__inner", start: "top 65%", end: "bottom top", toggleActions: TOGGLE },
    });
    gsap.timeline({ scrollTrigger: { trigger: "#y-story-3", start: "top 65%", end: "bottom top", toggleActions: TOGGLE } })
      .to(".y-story__gray", { duration: quick ? 0 : 0.5, autoAlpha: 1 })
      .to(".y-story__txt", { duration: quick ? 0 : 0.5, color: getComputedStyle(root).getPropertyValue("--kf-ink-soft").trim() }, "<");
  });
  mm.add(`${motion} and (min-width: 641px)`, () => {
    $$(".y-collage .wf-img").forEach((img) => {
      gsap.to(img, {
        duration: 0.75, autoAlpha: 1, y: 0, ease: "power2.inOut",
        scrollTrigger: { trigger: img, endTrigger: items[2], start: "top 80%", end: "bottom top", toggleActions: TOGGLE },
      });
    });
  });
  mm.add(`${motion} and (max-width: 640px)`, () => {
    gsap.to(".y-collage .wf-img", {
      duration: 0.75, autoAlpha: 1, y: 0, stagger: 0.25, ease: "power2.inOut",
      scrollTrigger: { trigger: ".y-collage", endTrigger: items[2], start: "top 80%", end: "bottom top", toggleActions: TOGGLE },
    });
  });

  // Menu: as in the original, each item has two Swipers (photo slide and description card crossFade) tied to each other with controller -----------------
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$(".y-menu__item").forEach((item) => {
    const speed = reduceMotion ? 0 : 300;
    const shots = new Swiper($(".y-shots__view", item), { observer: true, observeParents: true, speed });
    const card = new Swiper($(".y-card__in", item), {
      observer: true, observeParents: true, speed,
      effect: "fade", fadeEffect: { crossFade: true },
      pagination: { el: $(".y-card__count", item), type: "fraction", formatFractionCurrent: pad, formatFractionTotal: pad },
      navigation: { prevEl: $(".is-prev", item), nextEl: $(".is-next", item) },
    });
    shots.controller.control = [card];
    card.controller.control = [shots];
  });

  // Wide screen with a mouse: a navy VIEW circle follows over titles, and photos (cards too when pressed) float on screen and get pushed along with the mouse
  mm.add("(pointer: fine) and (min-width: 801px)", () => {
    root.classList.add("y-float");
    const menu = $("#y-menu");
    const cursor = $("#y-cursor");
    const shots = $$(".y-shots");
    const cards = $$(".y-card");
    const all = [...shots, ...cards];
    const se = document.scrollingElement;
    let st = se.scrollTop;
    const pos = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };
    const speed = 0.5;
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(all, { autoAlpha: 0 });
    const setX = gsap.quickSetter(cursor, "x", "px");
    const setY = gsap.quickSetter(cursor, "y", "px");
    const followX = gsap.quickTo(menu, "--fx", { duration: 0.6, ease: "power1" });
    const followY = gsap.quickTo(menu, "--fy", { duration: 0.6, ease: "power1" });
    // If the section straddles the top or bottom of the screen, nudge vertically so floating photos don’t leave the section
    // The original also measures bottom slack as 90% of the screen only the first time (75% after scrolling)
    const offsetY = (below = 0.75) => {
      const r = menu.getBoundingClientRect();
      return r.y > 0 ? Math.max(r.y - innerHeight * 0.75, 0) : Math.min(r.y + r.height - innerHeight * below, 0);
    };
    let offY = offsetY(0.9);
    const follow = () => {
      followX(((mouse.x - innerWidth * 0.5) / (innerWidth * 0.5)) * 50);
      followY(((mouse.y - st - innerHeight * 0.5) / (innerHeight * 0.5)) * 50 + offY);
    };
    const onMove = (e) => { mouse.x = e.pageX; mouse.y = e.pageY; follow(); };
    const onScroll = () => {
      const dt = se.scrollTop - st;
      mouse.y += dt;
      st = se.scrollTop;
      offY = offsetY();
      follow();
    };
    const tick = () => {
      const k = 1 - Math.pow(1 - speed, gsap.ticker.deltaRatio());
      pos.x += (mouse.x - pos.x) * k;
      pos.y += (mouse.y - pos.y) * k;
      setX(pos.x);
      setY(pos.y);
    };
    document.addEventListener("mousemove", onMove);
    addEventListener("scroll", onScroll, { passive: true });
    gsap.ticker.add(tick);

    const offs = [];
    const listen = (el, type, fn) => { el.addEventListener(type, fn); offs.push(() => el.removeEventListener(type, fn)); };
    $$(".y-menu__ttl").forEach((t) => {
      listen(t, "mouseenter", () => cursor.classList.add("is-active"));
      listen(t, "mouseleave", () => cursor.classList.remove("is-active"));
    });
    cards.forEach((c) => {
      listen(c, "mouseenter", () => cursor.classList.add("is-active-min"));
      listen(c, "mouseleave", () => cursor.classList.remove("is-active-min"));
    });
    let locked = false;
    const hideAll = () => gsap.to(all, { autoAlpha: 0 });
    $$(".y-menu__item").forEach((item) => {
      const shot = $(".y-shots", item);
      const card = $(".y-card", item);
      listen($(".y-card__close", item), "click", (e) => { e.stopPropagation(); hideAll(); locked = false; });
      listen(item, "mouseover", () => { if (!locked) gsap.to(shot, { autoAlpha: 1 }); });
      listen(item, "mouseleave", () => { if (!locked) hideAll(); });
      listen(item, "click", () => {
        hideAll();
        gsap.to([shot, card], { autoAlpha: 1, overwrite: "auto" });
        locked = true;
      });
    });
    [$("#y-story"), $("#y-find")].forEach((sec) => listen(sec, "mouseover", hideAll));

    return () => {
      root.classList.remove("y-float");
      document.removeEventListener("mousemove", onMove);
      removeEventListener("scroll", onScroll);
      gsap.ticker.remove(tick);
      offs.forEach((f) => f());
      gsap.set(all, { clearProps: "opacity,visibility" });
      cursor.classList.remove("is-active", "is-active-min");
    };
  });

  // Right pill link: slides out when the menu section reaches 70% of the screen (phone: 100px from top) and stays until the footer end
  mm.add({ wide: "(min-width: 641px)", narrow: "(max-width: 640px)" }, (ctx) => {
    gsap.fromTo("#y-pill", { xPercent: 100 }, {
      duration: 0.25, xPercent: 0, x: 0, autoAlpha: 1,
      scrollTrigger: {
        trigger: "#y-menu", endTrigger: ".y-foot",
        start: ctx.conditions.wide ? "top 70%" : "top 100px", end: "bottom bottom", toggleActions: TOGGLE,
      },
    });
  });

  // Two places: the navy band and uppercase phrase are drawn from the left (0.15 interval), then title, text and link appear in turn
  mm.add(motion, () => {
    $$(".y-find__item").forEach((item) => {
      gsap.to($$("[data-line]", item), {
        duration: 0.75, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", ease: "power2.inOut", stagger: 0.15,
        scrollTrigger: { trigger: item, start: "top 70%", end: "bottom top", toggleActions: TOGGLE },
      });
      gsap.to($$("[data-fade]", item), {
        duration: 0.75, autoAlpha: 1, ease: "power2.inOut", stagger: 0.1,
        scrollTrigger: { trigger: $(".y-find__box", item), start: "top 85%", end: "bottom top", toggleActions: TOGGLE },
      });
    });
    gsap.to("#y-map-wrap", {
      duration: 0.75, autoAlpha: 1, ease: "power2.inOut",
      scrollTrigger: { trigger: "#y-map-wrap", start: "top 70%", end: "bottom top", toggleActions: TOGGLE },
    });
    gsap.to($$("#y-end [data-line]"), {
      duration: 0.75, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)", ease: "power2.inOut", stagger: 0.25,
      scrollTrigger: { trigger: "#y-end", start: "top 90%", end: "bottom top", toggleActions: TOGGLE },
    });
    // Store spot on the map: radius 5→18, stroke 1.95→3, alternating every 1s
    gsap.fromTo("#y-marker", { attr: { r: 5, "stroke-width": 1.95 } }, {
      attr: { r: 18, "stroke-width": 3 }, duration: 1, ease: "power1.inOut", repeat: -1, yoyo: true,
    });
  });

  addEventListener("load", () => setTimeout(() => ScrollTrigger.refresh(), 50));
})();
