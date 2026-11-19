// First page scene — original values as is:
// On About entry (Feature 1 center goes from screen bottom to center): image swap, grass blur and big English text flow 30s,
// Feature 3 holds 3 screens with map -58%, product pins for 5 screens (phone 4) with circle 1 → 2.9 and three layers of photos,
// Guide and usage 3-screen pin: the circle opens and the card row moves -475px, then Q&A rises and the circle closes.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  // The original px is based on 1440 (phone 390), so scale it to the current width
  const r = (pc, sp) => (innerWidth > 768 ? (pc / 1440) * innerWidth : (sp / 390) * innerWidth);
  const blurIn = { filter: "blur(0px)", opacity: 1 };
  const blurOut = { filter: "blur(12px)", opacity: 0 };

  // ── Q&A accordion: up to height auto in .4s ──
  $$(".p-qa-q").forEach((q) => {
    const a = q.nextElementSibling;
    q.addEventListener("click", () => {
      const open = !q.classList.contains("-opened");
      q.classList.toggle("-opened", open);
      q.setAttribute("aria-expanded", open);
      gsap.to(a, { height: open ? "auto" : 0, duration: 0.4 });
    });
  });

  // ── Blocks that come into focus when visible ──
  $$(".s-inview").forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      refreshPriority: -1,
      onEnter: () => el.classList.add("-inview"),
      onLeaveBack: () => el.classList.remove("-inview"),
    });
  });

  const wrap = $("#s-top-wrap");
  const grassTop = $("#s-grass-top");
  const copy = $("#s-about-copy");
  const aboutCircle = $("#s-about-circle");
  const features = $$(".p-about-feature__item");
  const grassLoop = sMotion.grassLoop;

  const midCircle = $("#s-mid-circle");
  const midGrass = $("#s-mid-grass");
  const product = $("#product");
  const images = $$(".p-product__image");
  const pHeading = $("#s-product-heading");
  const figure = $("#s-product-figure");
  const model = $("#s-product-model");
  const contents = $("#s-product-contents");
  const shop = $("#shop");

  const guide = $("#guide");
  const gHeading = $("#s-guide-heading");
  const gCircle = $("#s-guide-circle");
  const gContents = $("#s-guide-contents");

  const use = $("#use");
  const uHeading = $("#s-use-heading");
  const uCircle = $("#s-use-circle");
  const uContents = $("#s-use-contents");
  const qa = $("#qa");

  const inview = (el) => () => el.classList.add("-inview");
  const outview = (el) => () => el.classList.remove("-inview");

  const mm = gsap.matchMedia();
  mm.add({ pc: "(min-width: 769px)", sp: "(max-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { pc, reduce } = ctx.conditions;
    gsap.set(copy, { yPercent: -50 });
    gsap.set(figure, { xPercent: -50, yPercent: -50, scale: reduce ? 1 : 0 });
    gsap.set(midCircle, { xPercent: -50, yPercent: -50, scale: 0 });
    gsap.set(midGrass, { xPercent: -5, yPercent: pc ? -50 : 0 });
    if (reduce) {
      gsap.set([shop, model], { autoAlpha: 1, filter: "none" });
      gsap.set(contents, { autoAlpha: 0 });
      [pHeading, gHeading, uHeading].forEach((h) => h.classList.add("-inview"));
      return;
    }

    const winH = innerHeight;
    const figs = $$(pc ? ".s-fig-pc" : ".s-fig-sp");
    const marquee = gsap.to(copy, { xPercent: -50, duration: 30, repeat: -1, ease: "none", paused: true });

    // ── About: package → patch artwork, hero grass blurs out and big English text appears ──
    gsap.timeline({
      scrollTrigger: {
        trigger: features[0],
        start: pc ? "center bottom" : "top bottom",
        end: pc ? "center center" : `top bottom-=${winH / 4}px`,
        scrub: true,
        onEnter: () => { wrap.classList.add("-background"); marquee.play(); grassLoop().pause(); },
        onLeaveBack: () => { wrap.classList.remove("-background"); marquee.pause(); grassLoop().play(); },
      },
    })
      .to(figs[0], blurOut)
      .to(figs[1], blurIn, "<")
      .to(grassTop, blurOut, "<")
      .to(copy, { opacity: 1 }, "<");

    // ── Grab feature 3 and drag the map, then the circle, text and large English text fade out together ──
    const mapTl = gsap.timeline({
      scrollTrigger: {
        trigger: features[2],
        start: "center center",
        end: `center+=${winH * 3} center`,
        scrub: true,
        pin: true,
        onEnter: () => wrap.classList.remove("-background"),
        onLeave: () => marquee.pause(),
        onEnterBack: () => marquee.play(),
        onLeaveBack: () => wrap.classList.add("-background"),
      },
    });
    if (pc) mapTl.to(figs[1], blurOut).to(figs[2], blurIn, "<");
    mapTl.to(figs[2], { xPercent: -58 })
      .to(aboutCircle, blurOut)
      .to(features[2], blurOut, "<")
      .to(copy, blurOut, "<");

    // ── Product: as the circle grows, three photo layers form at .15 intervals, and once the circle covers the screen, product intro → retailers ──
    gsap.set(shop, { autoAlpha: 0 });
    const productTl = gsap.timeline({
      scrollTrigger: {
        trigger: product,
        start: "top top",
        end: `top+=${winH * (pc ? 5 : 4)} top`,
        scrub: true,
        pin: true,
        onLeaveBack: outview(pHeading),
      },
    });
    productTl.to(figure, { filter: "blur(0px)", scale: 0.85 })
      .to(midCircle, { filter: "blur(0px)", scale: 1 }, "<")
      .to(images[0], blurIn, "<")
      .to(images[1], blurIn, "<0.15")
      .to(images[2], blurIn, "<0.15")
      .to(midCircle, { scale: pc ? 2.9 : 2.05 })
      .to(images, { filter: "blur(12px)", autoAlpha: 0 }, "<")
      .to(figure, { scale: 1 }, "<")
      .to(figure, { x: `-=${pc ? r(133.78, 133.78) : r(0, 16)}` })
      .to(pHeading, { ...blurIn, onStart: inview(pHeading) })
      .to(contents, blurIn, "<")
      .addLabel("jumpFlg")
      .to(model, blurIn, "<")
      .to(midGrass, blurIn, pc ? "<0.7" : "<")
      .to(shop, { filter: "blur(0px)", autoAlpha: 1 }, "<");
    if (pc) productTl.to(contents, { filter: "blur(12px)", autoAlpha: 0 }, "<");
    productTl.addLabel("jumpShop");
    sMotion.jumps.product = () => sMotion.toLabel(productTl, "jumpFlg");
    sMotion.jumps.shop = () => sMotion.toLabel(productTl, "jumpShop");

    // ── Guide: the product circle fades to 0 while entering ──
    gsap.timeline({ scrollTrigger: { trigger: guide, start: "top bottom", end: "top top", scrub: true } })
      .to(midCircle, { filter: "blur(12px)", scale: 0 });

    const tabletY = matchMedia("(min-width: 550px) and (max-width: 768px)").matches;
    const guideTl = gsap.timeline({
      scrollTrigger: {
        trigger: guide,
        start: "top top",
        end: `top+=${winH * (pc ? 3 : 6)} top`,
        scrub: pc ? 1 : true,
        pin: true,
        onLeaveBack: outview(gHeading),
      },
    });
    guideTl.to(gHeading, { ...blurIn, onStart: inview(gHeading) })
      .to(gCircle, { clipPath: "circle(50% at 50% 50%)", filter: "blur(0px)" }, "<")
      .addLabel("jumpFlg")
      .to(gContents, pc ? { x: -r(475, 0) } : { yPercent: tabletY ? -75 : -70 })
      .to(gHeading, { filter: "blur(12px)", autoAlpha: 0 })
      .to(gCircle, { clipPath: "circle(0% at 50% 50%)" }, "<");
    sMotion.jumps.guide = () => sMotion.toLabel(guideTl, "jumpFlg");

    // ── How to use: circles stay open, and the Q&A rises and closes ──
    const useTl = gsap.timeline({
      scrollTrigger: {
        trigger: use,
        start: "top top",
        end: `top+=${winH * (pc ? 3 : 4)} top`,
        scrub: pc ? 1 : true,
        pin: true,
        onLeaveBack: outview(uHeading),
      },
    });
    useTl.to(uHeading, { ...blurIn, onStart: inview(uHeading) })
      .to(uCircle, { clipPath: "circle(50% at 50% 50%)", filter: "blur(0px)" }, "<")
      .addLabel("jumpFlg")
      .to(uContents, pc ? { x: -r(475, 475) } : { yPercent: tabletY ? -72 : -70 });
    sMotion.jumps.use = () => sMotion.toLabel(useTl, "jumpFlg");

    gsap.timeline({ scrollTrigger: { trigger: qa, start: "top bottom", end: "top top", scrub: true } })
      .to(uCircle, { clipPath: "circle(0% at 50% 50%)" })
      .to(midGrass, { filter: "blur(12px)", autoAlpha: 0 }, "<");

    return () => {
      ["product", "shop", "guide", "use"].forEach((k) => delete sMotion.jumps[k]);
    };
  });
})();
