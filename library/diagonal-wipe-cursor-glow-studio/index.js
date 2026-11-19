// Home, original Home: hero pin (title gathers to center, star scroll playback), experience section pin (showreel box shrinks while descending, title resolves, emphasized words bounce photos),
// Featured work (focus-columns + a cursor-following ”View work”), the Who we are pin (three photos), the What we do overlapping row hover, reviews and FAQ.
(() => {
  const ES = window.ES;
  const { q, qa, rem } = ES;

  // Emphasized word photo bounce — each time the cursor moves 60px, the next photo, trailing late from a point, grows 0→1 from there to the cursor in .4s, disappears after .4s and glides for 1.5s
  const ripple = (wrap, target) => {
    const imgs = qa(".es-exp-img", wrap);
    if (!imgs.length || !target) return () => {};
    const mouse = { x: innerWidth / 2, y: innerHeight / 2 }, last = { x: 0, y: 0 }, cache = { x: innerWidth / 2, y: innerHeight / 2 };
    let hovered = false, pos = 0, z = 1;
    const move = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const over = () => { hovered = true; };
    const leave = () => { hovered = false; cache.x = mouse.x; cache.y = mouse.y; };
    addEventListener("mousemove", move, { passive: true });
    target.addEventListener("mouseover", over);
    target.addEventListener("mouseleave", leave);
    const loop = () => {
      if (!hovered) return;
      if (Math.hypot(mouse.x - last.x, mouse.y - last.y) > 60) {
        const b = wrap.getBoundingClientRect();
        const img = imgs[(pos = (pos + 1) % imgs.length)];
        const ib = { w: img.offsetWidth, h: img.offsetHeight };
        gsap.killTweensOf(img);
        let dx = mouse.x - cache.x, dy = mouse.y - cache.y;
        const d = Math.hypot(dx, dy);
        if (d) { dx /= d; dy /= d; }
        dx *= d / 100; dy *= d / 100;
        gsap.timeline()
          .fromTo(img, { opacity: 1, scale: 0, zIndex: ++z, x: cache.x - ib.w / 2 - b.left, y: cache.y - ib.h / 2 - b.top }, { duration: 0.4, ease: "power1", scale: 1, x: mouse.x - ib.w / 2 - b.left, y: mouse.y - ib.h / 2 - b.top }, 0)
          .fromTo(q(".es-media-inner", img), { scale: 2 }, { duration: 0.4, ease: "power1", scale: 1 }, 0)
          .to(img, { duration: 0.4, opacity: 0 }, 0.4)
          .to(img, { duration: 1.5, ease: "power4", x: `+=${dx * 110}`, y: `+=${dy * 110}` }, 0.05);
        last.x = mouse.x; last.y = mouse.y;
      }
      cache.x += (mouse.x - cache.x) * 0.1;
      cache.y += (mouse.y - cache.y) * 0.1;
    };
    gsap.ticker.add(loop);
    return () => { gsap.ticker.remove(loop); removeEventListener("mousemove", move); };
  };

  // Over a featured work cell, the ‹View work› button follows the cursor at .5s (hidden over the first cell and the all-work box)
  ES.workView = (sec) => {
    if (!sec || ES.mobile) return;
    const btn = q(".es-btn-view", sec);
    qa(".es-work-feat-text", sec).forEach((t) => ES.splitLines(t));
    if (!btn) return;
    const xTo = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });
    sec.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".es-work-col.is-project .es-work-card");
      sec.classList.toggle("is-active", !!card);
      const b = sec.getBoundingClientRect(), bb = btn.getBoundingClientRect();
      xTo(e.clientX - b.left - b.width * 0.5 - bb.width * 0.5);
      yTo(e.clientY - b.top - b.height * 0.5 - bb.height * 0.5);
    });
    sec.addEventListener("mouseleave", () => sec.classList.remove("is-active"));
  };

  ES.pages.home = (root, api) => {
    const offs = [];
    const H = () => innerHeight, W = () => innerWidth;

    // Hero
    const hero = q(".es-hero", root);
    const left = q(".es-hero-left", hero), right = q(".es-hero-right", hero);
    const lines = qa(".es-hl", hero);
    const iconEl = q(".es-hero-icon", hero);
    const icon = ES.icon(iconEl);
    offs.push(() => icon.lottie.destroy());
    const bg = q(".es-hero-bg", hero);
    if (!ES.reduce) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero, pin: true, start: "top top", end: () => `+=${H()}`, pinSpacing: false, scrub: true, invalidateOnRefresh: true,
          onUpdate: (st) => icon.go(st.progress * 0.5 * (icon.total - 1)),
        },
      });
      if (!ES.mobile) {
        tl.to(left, { x: () => W() * 0.45 - left.offsetWidth, duration: 0.7 }, 0)
          .to(right, { x: () => -(W() * 0.45 - right.offsetWidth), duration: 0.7 }, 0)
          .fromTo(q(".es-hero-scroll", hero), { autoAlpha: 1 }, { autoAlpha: 0, duration: 1, overwrite: "auto" }, 0);
      }
      api.intro
        .fromTo(iconEl, { scale: 1.8 }, { scale: 1, duration: 2, ease: "expo.out" }, 0)
        .fromTo(bg, { filter: "blur(2rem)", autoAlpha: 0 }, { filter: "blur(0rem)", autoAlpha: 1, duration: 2, ease: "power3.out" }, 0.2)
        .moveBlur(lines, { stagger: 0.08 }, 0.1);
      if (!ES.mobile) api.intro.moveBlur(q(".es-hero-scroll", hero), { duration: 1 }, 0.2);
    }

    // Experience section
    const exp = q(".es-exp", root);
    const titleEl = q(".es-exp-title", exp);
    const split = ES.splitWords(titleEl);
    const target = split.words[split.words.length - 1];
    target.classList.add("es-exp-hover");
    const blockEl = q(".es-exp-block", exp);
    if (ES.mobile || ES.reduce) {
      if (!ES.reduce) gsap.timeline({ scrollTrigger: { trigger: titleEl, start: "top+=30% bottom" } }).moveBlur(split.words);
    } else {
      ES.block(blockEl, false);
      offs.push(ripple(q(".es-exp-images", exp), target));
      gsap.set(exp, { paddingBottom: () => H() * 3.3 });
      gsap.timeline({ scrollTrigger: { trigger: q(".es-exp-btn-wrap", exp), start: "top bottom", end: () => `+=${H() * 3.2}`, scrub: true, invalidateOnRefresh: true } })
        .fromTo(blockEl, { y: () => H() * 0.05 }, { y: 0, ease: "power1.in", duration: 0.3 }, 0)
        .fromTo(blockEl, { y: 0 }, { y: () => H(), duration: 0.7, ease: "power1.in" }, 0.3)
        .to(blockEl, { width: () => blockEl.offsetWidth * 0.5, height: () => blockEl.offsetHeight * 0.5, duration: 1 }, 0);
      const content = q(".es-exp-content", exp);
      gsap.timeline({ scrollTrigger: { trigger: content, start: "center center", end: () => `+=${H() * 4}`, scrub: true, pin: true, pinSpacing: false, invalidateOnRefresh: true } })
        .to(content, { duration: 10 }, 0)
        .fromTo(titleEl, { yPercent: () => H() * 0.2, scale: 0.9 }, { scale: 1, yPercent: 0, ease: "power2.out", duration: 4.8 }, 0)
        .fromTo(split.lines, { yPercent: 110, autoAlpha: 0, filter: "blur(2rem)" }, { yPercent: 0, autoAlpha: 1, filter: "blur(0rem)", duration: 4, ease: "power3.out", stagger: 0.4 }, 0.3)
        .fromTo(target, { "--es-hover-mix": 0 }, { "--es-hover-mix": 1, duration: 2.5, ease: "power3.out" }, 1.5)
        .fromTo(q(".es-exp-subtitle", exp), { y: () => H() * 0.8 }, { y: () => -H(), duration: 10 }, 2)
        .fromTo(q(".es-exp-text-wrap", exp), { y: () => H() * 1.2 }, { y: () => -H(), duration: 7 }, 2.5)
        .fromTo(titleEl, { yPercent: 0 }, { yPercent: () => H() * -0.3, ease: "power1.in", duration: 5 }, 4.85);
    }

    // Featured work
    ES.workView(q(".es-work", root));

    // Who we are
    const about = q(".es-about", root);
    const aTitle = q(".es-about-title", about);
    const aLines = new SplitText(aTitle, { type: "lines", linesClass: "es-split-line" }).lines;
    const wraps = qa(".es-about-images .es-media", about);
    if (!ES.reduce) {
      if (ES.mobile) {
        gsap.timeline({ scrollTrigger: { trigger: aTitle, start: "top+=30% bottom" } }).moveBlur(aLines);
        gsap.timeline({ scrollTrigger: { trigger: q(".es-about-images", about), start: "top bottom", end: "top top", scrub: true } })
          .fromTo(wraps[0], { scale: 1.4 }, { scale: 1, duration: 1 }, 0)
          .fromTo(wraps[1], { scale: 1.4, clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1 }, 1)
          .fromTo(wraps[2], { scale: 1.4, clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1 }, 2);
      } else {
        gsap.set(about, { paddingBottom: () => H() * 2.5 });
        gsap.timeline({ scrollTrigger: { trigger: q(".es-about-inner", about), start: "center center", end: () => `+=${H() * 9}`, pin: true, pinSpacing: false, scrub: true, invalidateOnRefresh: true } })
          .fromTo(q(".es-about-content", about), { y: () => H() * 1.5 }, { y: () => H() * -3, duration: 12 }, 0)
          .fromTo(aTitle, { transformOrigin: "left", scale: 0.95, yPercent: () => H() * 0.15 }, { scale: 1, yPercent: 0, ease: "power1.out", duration: 1.5 }, 0)
          .fromTo(aLines, { yPercent: 110, autoAlpha: 0, filter: "blur(2rem)" }, { yPercent: 0, autoAlpha: 1, filter: "blur(0rem)", duration: 2, ease: "power3.out", stagger: 0.2 }, 0.1)
          .fromTo(wraps, { scale: 1.2 }, { scale: 1, duration: 2.6 }, 0.8)
          .fromTo(wraps[1], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 }, 1.4)
          .fromTo(wraps[2], { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 }, 1.9)
          .to(aTitle, { yPercent: () => H() * -1, ease: "power1.in", duration: 6 }, 1.8);
      }
    }

    // What we do — original HomeServices: default 10.7rem, 24.7rem below the row being hovered
    const svc = q(".es-services", root);
    ES.title(q(".es-services-title", svc));
    const items = qa(".es-service", svc);
    if (!ES.mobile) {
      items.forEach((it) => { const t = q(".es-service-text", it); if (t) ES.splitLines(t); });
      const base = () => rem(10.7), act = () => rem(24.7);
      const place = (active, instant) => {
        items.forEach((it, k) => {
          it.classList.toggle("is-active", k === active);
          if (k === 0) return;
          let y;
          if (active === 0) y = k === 1 ? act() : (k - 1) * base() + act();
          else if (active === k || active > k) y = k * base();
          else y = (k - 1) * base() + act();
          gsap.to(it, { y, ease: "power3.out", duration: instant || ES.reduce ? 0 : 0.8, overwrite: "auto" });
        });
      };
      place(0, true);
      items.forEach((it, k) => it.addEventListener("mouseenter", () => place(k === items.length - 1 ? 0 : k)));
      q(".es-services-inner", svc).addEventListener("mouseleave", () => place(0));
      const onResize = () => place(0, true);
      addEventListener("resize", onResize);
      offs.push(() => removeEventListener("resize", onResize));
    }

    // Reviews and FAQ
    offs.push(ES.testimonials(q(".es-testimonials", root)) || (() => {}));
    ES.faqs(q(".es-faqs", root));

    return { destroy: () => offs.forEach((f) => f && f()) };
  };
})();
