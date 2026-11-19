/* First section — hero entrance and photo parallax, about, treatment card unfold, Why Us card stacking, medical staff slider */
(() => {
  const { reduce, mm, fontsReady, splitLines, slider, $, $$ } = ND;

  // Hero: photo 1.12→1 (1.8s), title lines .4s later, text and buttons 1.1s later. The photo moves down 15% while passing through the section
  function hero() {
    const sec = $("[data-hero]");
    if (!sec) return;
    const bg = $('[data-hero="bg"]', sec), title = $('[data-hero="title"]', sec), text = $('[data-hero="cta-text"]', sec), btn = $('[data-hero="cta-btn"]', sec);
    if (reduce) { gsap.set([bg, text, btn], { y: 0, scale: 1, opacity: 1 }); gsap.set(title, { opacity: 1 }); return; }
    gsap.to(bg, { yPercent: 15, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true } });
    fontsReady.then(() => {
      gsap.to(bg, { scale: 1, duration: 1.8, ease: "power2.out" });
      splitLines(title, { delay: 0.4 });
      const tl = gsap.timeline({ delay: 1.1, defaults: { ease: "power3.out", duration: 0.9 } });
      tl.to(text, { y: 0, opacity: 1 }, 0);
      tl.to(btn, { y: 0, opacity: 1 }, 0.1);
      tl.from(btn.querySelectorAll(":scope > span"), { yPercent: 60, opacity: 0, duration: 0.5, stagger: 0.05 }, 0.2);
    });
  }

  function about() {
    const sec = $("[data-about]");
    if (!sec) return;
    const cap = $('[data-about="caption"]', sec), title = $('[data-about="title"]', sec), img = $('[data-about="img"]', sec), ic = $('[data-about="circle-icn"]', sec), text = $('[data-about="text"]', sec);
    if (reduce) { gsap.set([cap, img, ic, text], { opacity: 1, y: 0, scale: 1 }); gsap.set(title, { opacity: 1 }); return; }
    gsap.to(cap, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: cap, start: "top 85%" } });
    gsap.to(img, { scale: 1, duration: 1.4, ease: "power2.out", scrollTrigger: { trigger: img, start: "top 95%" } });
    const tl = gsap.timeline({ scrollTrigger: { trigger: text, start: "top 88%" }, defaults: { ease: "power3.out", duration: 0.8 } });
    tl.to(ic, { opacity: 1, scale: 1 }, 0).to(text, { opacity: 1, y: 0 }, 0.1);
    splitLines(title, { scrollTrigger: { trigger: title, start: "top 80%" } });
  }

  // Treatment card: with a mouse it opens on hover (description drops 350ms) and closes 150ms after leaving (300ms). With a finger it toggles on press
  function services() {
    mm.add("(min-width: 480px)", () => {
      const cards = $$(".nd-scard[data-dropdown]");
      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
      const list = (c) => $("[data-dropdown-list]", c);
      const close = (c) => { if (!c.classList.contains("active")) return; c.classList.remove("active"); gsap.to(list(c), { height: 0, duration: 0.41, ease: "sine.inOut", onComplete: () => gsap.set(list(c), { display: "none", height: "auto" }) }); };
      const open = (c) => {
        if (c.classList.contains("active")) return;
        cards.forEach((o) => o !== c && close(o));
        c.classList.add("active");
        gsap.set(list(c), { display: "block", height: "auto" });
        gsap.from(list(c), { height: 0, duration: 0.35, ease: "sine.inOut" });
      };
      let t = 0;
      const offs = cards.map((c) => {
        const enter = () => { clearTimeout(t); open(c); };
        const leave = () => { t = setTimeout(() => close(c), 150); };
        const tap = (e) => { if (e.target.closest("[data-book-trigger]")) return; e.preventDefault(); c.classList.contains("active") ? close(c) : open(c); };
        if (fine) { c.addEventListener("mouseenter", enter); c.addEventListener("mouseleave", leave); }
        else $(".nd-scard__link", c).addEventListener("click", tap);
        return () => { c.removeEventListener("mouseenter", enter); c.removeEventListener("mouseleave", leave); $(".nd-scard__link", c).removeEventListener("click", tap); };
      });
      return () => { offs.forEach((f) => f()); cards.forEach((c) => c.classList.remove("active")); };
    });
  }

  // Why us: for each card, scrub 1 over the range of section height / card count — new card 100vh→0 (z 50→0), background text 150→0, photo .8→1, previous card z 0→−100, the one before it −100→−200
  function why() {
    const sec = $("[data-why-us]");
    if (!sec) return;
    const cards = $$(".nd-why__card-wrap", sec), bgText = $$(".nd-wcard__bg", sec), imgs = $$(".nd-wcard__img-box", sec);
    const n = cards.length;
    const stack = (zIn, zBack, at, dur) => () => {
      cards.forEach((c, i) => gsap.set(c, i ? { y: "100vh", z: 0 } : { x: 0, y: 0, z: 0, scale: 1 }));
      cards.forEach((card, i) => {
        if (!i) return;
        const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: () => `top+=${(i - 1) * (sec.offsetHeight / n)} top`, end: () => `top+=${i * (sec.offsetHeight / n)} top`, scrub: 1 } });
        tl.fromTo(card, { y: "100vh", z: zIn }, { y: 0, z: 0, duration: 1, ease: "power1.out", immediateRender: false }, 0);
        tl.fromTo(imgs[i], { scale: 0.8 }, { scale: 1, duration: 1, ease: "power1.out", immediateRender: false }, 0);
        tl.fromTo(bgText[i], { y: 150, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power1.out", immediateRender: false }, 0);
        tl.fromTo(cards[i - 1], { z: 0 }, { z: zBack, duration: dur, ease: "power1.out", immediateRender: false }, at);
        if (i >= 2) tl.fromTo(cards[i - 2], { z: zBack }, { z: zBack * 2, duration: dur, ease: "power1.out", immediateRender: false }, at);
      });
      return () => gsap.set(cards, { clearProps: "transform" });
    };
    if (reduce) return;
    mm.add("(max-width: 479px)", stack(15, -20, 0.5, 0.5));
    mm.add("(min-width: 480px) and (orientation: landscape)", stack(50, -100, 0.35, 0.65));
    mm.add("(min-width: 480px) and (orientation: portrait)", () => {
      cards.forEach((card, i) => {
        gsap.fromTo(card, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%" } });
        gsap.fromTo(bgText[i], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 85%" } });
        gsap.fromTo(imgs[i], { scale: 0.85 }, { scale: 1, duration: 1, ease: "power2.out", scrollTrigger: { trigger: card, start: "top 85%" } });
      });
    });
  }

  function team() {
    const sec = $("[data-team]");
    if (!sec) return;
    const sp = $(".nd-team__splide", sec);
    slider(sp, { type: "fade" });
    if (reduce) return gsap.set(sp, { opacity: 1, y: 0 });
    gsap.to(sp, { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.15, scrollTrigger: { trigger: sp, start: "top 88%" } });
  }

  addEventListener("DOMContentLoaded", () => { hero(); about(); services(); why(); team(); });
})();
