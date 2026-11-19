// Home page: Hero photo mist cross-fade, Hero wiped away by a wave, the ”Know” scene entering and leaving by a wave, ”Experience” blur curtain progress
(() => {
  const { mm } = window.ky;
  const $ = (s) => document.querySelector(s);

  // GSAP doesn’t handle prefixed properties for the mask position, so we animate two numbers and write it directly
  const fog = (el, from, to, st) => {
    const o = { x: from[0], y: from[1] };
    const put = () => { const v = `${o.x}% ${o.y}%`; el.style.maskPosition = v; el.style.webkitMaskPosition = v; };
    put();
    return gsap.to(o, { x: to[0], y: to[1], ease: "none", scrollTrigger: st, onUpdate: put });
  };

  // Hero photo: after holding 3s, the front photo clears in 3s with a fog mask while the next settles 1.05 → 1, then after 2s counts 3s again (original counter: intervalTime 3000 · setTime 2000)
  const slides = [...document.querySelectorAll(".ky-hero__slide")];
  let cur = 0, timer, running = false;
  const next = () => {
    const prev = slides[cur];
    cur = (cur + 1) % slides.length;
    slides.forEach((s) => s.classList.remove("isActive", "isPrev"));
    prev.classList.add("isPrev");
    slides[cur].classList.add("isActive");
    setTimeout(() => prev.classList.remove("isPrev"), 2000);
  };
  const loop = () => { timer = setTimeout(() => { next(); timer = setTimeout(() => running && loop(), 2000); }, 3000); };
  const start = () => { if (running) return; running = true; loop(); };
  const stop = () => { running = false; clearTimeout(timer); };

  mm.add({
    pc: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    sp: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
    reduce: "(prefers-reduced-motion: reduce)",
  }, (ctx) => {
    const { pc, reduce } = ctx.conditions;
    if (reduce) {
      $(".ky-exp").style.setProperty("--experience-progress", 1);
      $(".ky-stage__el").style.cssText = "-webkit-mask:none;mask:none;opacity:1";
      return;
    }
    // Pauses while scrolling down if more than half of the blank space below the hero is visible, and counts again once scrolling up removes the blank
    let lastTop = 0;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const top = e.boundingClientRect.top;
      if (e.isIntersecting) { if (lastTop > top || lastTop === 0) stop(); }
      else if (lastTop < top) start();
      lastTop = top;
    }), { threshold: 0.5 });
    const arm = () => io.observe($("[data-counter-flag]"));
    document.addEventListener("ky:ready", arm, { once: true });
    if ($(".ky-splash.isTransitionOut")) arm();

    // Hero clouds drift sideways (original data-parallax-item-to: -50% 75% 20% 45%)
    document.querySelectorAll("[data-plx-x]").forEach((c) => {
      gsap.to(c, { x: c.dataset.plxX, ease: "none", scrollTrigger: { trigger: ".ky-hero", start: "top top", end: "bottom top", scrub: 0, invalidateOnRefresh: true } });
    });

    // Hero mask reveal (original updateMask: blank 20% bottom → bottom bottom, scrub 1)
    fog($(".ky-maskarea__el"), pc ? [0, 0] : [100, 0], pc ? [130, 70] : [50, 100], {
      trigger: ".ky-maskarea__space", start: "20% bottom", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true,
    });

    // 「Know」 scene: after the photo collection, for one empty screen it comes in as a wave (-30% 0% → 100% 30%), and once fully in it hides the Hero board. On phone, opacity
    const stageEl = $(".ky-stage__el"), about = $(".ky-about"), area = $(".ky-maskarea");
    const inST = {
      trigger: '[data-trigger="gallery"]', start: "top bottom", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true,
      onLeave: () => area.classList.add("isComplete"), onEnterBack: () => area.classList.remove("isComplete"),
    };
    // Wave on exit (0% → 130% 0%) — for one screen during the first blank of Experience
    const outST = { trigger: '[data-trigger="about"]', start: "top bottom", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true };
    if (pc) {
      fog(stageEl, [-30, 0], [100, 30], inST);
      fog(about, [0, 0], [130, 0], outST);
    } else {
      gsap.to(stageEl, { opacity: 1, ease: "none", scrollTrigger: inST });
      gsap.to(about, { opacity: 0, ease: "none", scrollTrigger: outST });
    }

    // ”Experience” blur curtain and cloud gathering progress (original --experience-progress, top center → center top, scrub 1)
    const exp = $(".ky-exp");
    gsap.fromTo(exp, { "--experience-progress": 0 }, {
      "--experience-progress": 1, ease: "none",
      scrollTrigger: {
        trigger: '[data-trigger="experience"]', start: "top center", end: "center top", scrub: 1, invalidateOnRefresh: true,
        onEnter: () => exp.classList.add("isEnter"), onLeaveBack: () => exp.classList.remove("isEnter"),
      },
    });

    return () => { stop(); io.disconnect(); };
  });
})();
