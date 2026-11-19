// Home page: three illustration layers scattered around the wreath circle, circular photo Swiper fade and Ken Burns, parallax, staff photo sinking, FAQ accordion.
// Original values: Swiper fade 2000ms · autoplay 5000 · loop / photo scale 1.2→1 over 7s, next slide set to 1.2 and reset after 3s
// Parallax y (vw) scrub 1 — Hero 1.5·-3·-1.5 (phone 2·-5·-2), About -2·2 (desktop only), clinic blob 20 (phone 100), staff blob 10 (phone 70), notice photo -80px (phone: height difference of the photo strip)
(() => {
  const { use } = window.MM;
  const sp = () => innerWidth <= 768;

  // Leave the wreath circle (center 30~70%) empty and place items around it — [image, left%, top%, width% (of layer width), height ratio]
  const layers = {
    pc: {
      ".kv__ill-4": [["bush", 2, 0, 7, 0.5], ["flower", 12, 10, 1.6, 1], ["bush", 22, 0, 6, 0.5], ["flower", 74, 18, 1.6, 1], ["bush", 80, 0, 8, 0.5], ["flower", 93, 14, 1.4, 1]],
      ".kv__ill-2": [["tree-round", 0, 18, 9, 1.25], ["tree-cone", 9, 4, 5.5, 1.66], ["tree-tall", 17, 30, 3, 2.5], ["tree-cone", 23, 60, 4.5, 1.66], ["tree-round", 78, 6, 8, 1.25], ["tree-cone", 88, 28, 6, 1.66], ["tree-tall", 96, 4, 3, 2.5], ["tree-round", 70, 66, 6, 1.25], ["tree-cone", 4, 70, 5, 1.66]],
      ".kv__ill-1": [["cat", 10, 54, 4, 1.28], ["rabbit", 22, 30, 3.2, 1.5], ["dog", 30, 74, 4.8, 1.12], ["squirrel", 74, 36, 3.6, 1.28], ["hedgehog", 82, 76, 5, 0.66], ["dog", 90, 50, 4.4, 1.12], ["house", 4, 30, 6, 0.78]],
      ".kv__ill-3": [["bird", 18, 12, 3, 0.83], ["bird", 82, 20, 2.6, 0.83], ["flower", 27, 46, 1.6, 1], ["flower", 71, 54, 1.8, 1], ["leaf", 14, 84, 1.2, 2], ["leaf", 88, 86, 1.2, 2], ["paw", 66, 88, 1.6, 1], ["paw", 33, 90, 1.4, 1], ["bush", 0, 90, 8, 0.5], ["bush", 92, 90, 8, 0.5]],
    },
    sp: {
      ".kv__ill-4": [["bush", 0, 0, 22, 0.5], ["flower", 30, 30, 5, 1], ["bush", 70, 0, 26, 0.5]],
      ".kv__ill-2": [["tree-cone", 0, 2, 12, 1.66], ["tree-round", 84, 0, 16, 1.25], ["tree-tall", 4, 66, 7, 2.5], ["tree-cone", 88, 70, 10, 1.66]],
      ".kv__ill-1": [["cat", 2, 52, 11, 1.28], ["rabbit", 88, 44, 9, 1.5], ["dog", 6, 84, 12, 1.12], ["hedgehog", 80, 86, 14, 0.66]],
      ".kv__ill-3": [["bird", 12, 18, 9, 0.83], ["bird", 78, 14, 8, 0.83], ["flower", 18, 74, 5, 1], ["flower", 82, 70, 5, 1], ["paw", 50, 96, 4, 1]],
    },
  };
  const aboutPc = {
    ".about__ill-1": [["tree-cone", 1, 8, 4, 1.66], ["tree-round", 5, 30, 5.5, 1.25], ["tree-tall", 91, 6, 2.4, 2.5], ["tree-round", 94, 34, 5, 1.25], ["bush", 0, 82, 9, 0.5], ["bush", 89, 84, 10, 0.5]],
    ".about__ill-2": [["cat", 4, 40, 4.5, 1.28], ["bird", 12, 4, 3.4, 0.83], ["rabbit", 92, 30, 3.8, 1.5], ["flower", 86, 70, 2, 1], ["flower", 16, 76, 2, 1]],
  };
  const aboutSp = { ".about__ill-1": [["tree-cone", 0, 10, 10, 1.66], ["cat", 12, 40, 10, 1.28], ["dog", 76, 36, 12, 1.12], ["tree-round", 88, 0, 12, 1.25]] };
  const place = (map) => {
    for (const [sel, items] of Object.entries(map)) {
      const box = document.querySelector(sel);
      if (!box) continue;
      const ratio = box.offsetWidth / Math.max(1, box.offsetHeight);
      box.innerHTML = items
        .map(([id, x, y, w, hr]) => `<span style="left:${x}%;top:${y}%;width:${w}%;height:${(w * hr * ratio).toFixed(2)}%">${use(id)}</span>`)
        .join("");
    }
  };
  const fill = () => {
    place(sp() ? layers.sp : layers.pc);
    place(sp() ? aboutSp : aboutPc);
  };
  fill();

  // FAQ — 300ms height accordion
  document.querySelectorAll(".faq__item").forEach((el) => MM.accordion(el, { head: ".faq__q", body: ".faq__a", btn: ".faq__btn" }));

  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const photos = (cls) => cls.map((c) => `.kv__carousel .${c} > .kv__photo`).join(",");
  gsap.set(".kv__carousel .swiper-slide > .kv__photo", { scale: 1.2 });

  document.addEventListener("mm:ready", () => {
    new Swiper(".kv__carousel", {
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      loopAdditionalSlides: 1,
      speed: reduce ? 0 : 2000,
      autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false, waitForTransition: false },
      followFinger: false,
      on: {
        transitionStart: () => {
          gsap.to(photos(["swiper-slide-active", "swiper-slide-duplicate-active"]), { scale: 1, duration: 7 });
          gsap.to(photos(["swiper-slide-next", "swiper-slide-duplicate-next"]), { scale: 1.2, delay: 3 });
        },
      },
    });

    const vw = (el, trigger, n) => el && gsap.to(el, { y: `${n}vw`, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 1 } });
    const px = (el, trigger, n) => el && gsap.to(el, { y: `-${n}px`, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 1 } });
    const $ = (s) => document.querySelector(s);
    mm.add({ pc: "(min-width: 769px) and (prefers-reduced-motion: no-preference)", phone: "(max-width: 768px) and (prefers-reduced-motion: no-preference)" }, (ctx) => {
      const { pc } = ctx.conditions;
      const hero = $(".kv__hero");
      vw($(".kv__ill-1"), hero, pc ? 1.5 : 2);
      vw($(".kv__ill-2"), hero, pc ? -3 : -5);
      vw($(".kv__ill-3"), hero, pc ? -1.5 : -2);
      if (pc) {
        vw($(".about__ill-1"), $(".about"), -2);
        vw($(".about__ill-2"), $(".about"), 2);
      }
      vw($(".treat__bg"), $(".treat__content"), pc ? 20 : 100);
      vw($(".staff__bg"), $(".staff__content"), pc ? 10 : 70);
      const photo = $(".news__photo"), band = $(".news__par");
      px(photo, band, pc ? 80 : photo.offsetHeight - band.offsetHeight);
      const img = $(".staff__photo > .wf-img");
      gsap.set(img, { scale: 1.15 });
      gsap.to(img, { scale: 1, duration: 1.5, ease: "power2.out", scrollTrigger: { trigger: ".staff__photo", start: "top 90%", end: "bottom top" } });
    });
  });

  let w = innerWidth, rz;
  addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      if ((w <= 768) !== sp()) fill();
      w = innerWidth;
    }, 100);
  });
})();
