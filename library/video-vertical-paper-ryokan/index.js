// Home scene: the wordmark fades out upward by 150% over one screen, and a cut-out paper card rises and widens while
// Vertical text fades in from blur, and a light panel unfolds over the video with inset and 200px below (scrub 2).
(() => {
  gora.page("home", (root) => {
    const mm = gsap.matchMedia();
    const $ = (s) => root.querySelector(s);
    const card = $(".h-card");
    const contents = $(".h-contents");
    const logoTop = document.querySelector(".g-logo-top");
    const roomsMask = $(".h-rooms__mask");
    const spbar = $(".h-spbar");
    const rail = document.querySelector(".g-rail");

    // When the board unfolds 30% (phone) or 40%, the room photo is revealed, and past 70% the small logo above appears
    const sp = innerWidth <= 1023;
    const reveal = (p) => {
      roomsMask.classList.toggle("is-show", p > (sp ? 0.3 : 0.4));
      logoTop.classList.toggle("is-hide", p <= 0.7);
    };

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const vh = innerHeight;
      gsap.timeline({ scrollTrigger: { trigger: root, start: "top top", end: `top+=${vh} top`, scrub: true } })
        .to($(".h-kv__logo"), { yPercent: -150, autoAlpha: 0, filter: "blur(16px)", ease: "none" });

      gsap.from($(".h-card__bg"), { clipPath: "inset(0 20%)", ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom bottom", scrub: 2 } });
      gsap.from($(".h-card__pic"), { clipPath: "inset(0 10%)", ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom bottom", scrub: 2 } });
      gsap.fromTo($(".h-card__pic .g-photo"), { yPercent: -40, scale: 1.8 }, { yPercent: 40, scale: 1.8, ease: "none", scrollTrigger: { trigger: $(".h-card__pic"), start: "top bottom", end: "bottom top", scrub: true } });

      const split = (el) => {
        if (!el.querySelector(".ch")) el.innerHTML = [...el.textContent.trim()].map((c) => `<span class="ch">${c}</span>`).join("");
        return el.querySelectorAll(".ch");
      };
      const ttl = split(card.querySelector(".h-card__ttl"));
      const kana = split(card.querySelector(".h-card__kana"));
      const lines = card.querySelectorAll(".h-card__lines > span");
      const tl = gsap.timeline({ paused: true })
        .to(ttl, { duration: 1.6, opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.15, ease: "power2.out" })
        .to(kana, { duration: 1.6, opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.15, ease: "power2.out" }, 0.3)
        .to(lines, { duration: 1.8, opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.1, ease: "power2.out" }, 0.25);
      ScrollTrigger.create({ trigger: $(".h-card__copy"), start: "top 90%", once: true, onEnter: () => tl.restart() });

      const inset = contents.offsetWidth / 10;
      gsap.timeline({
        scrollTrigger: { trigger: contents, start: "top bottom", end: "top top", scrub: 2, onUpdate: (self) => reveal(self.progress) },
      }).from(contents, { clipPath: `inset(${inset}px 60px 0 60px)`, y: 200, ease: "none" });
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(root.querySelectorAll(".h-card__lines > span"), { opacity: 1, filter: "none", y: 0 });
      gsap.set([$(".h-card__ttl"), $(".h-card__kana")], { opacity: 1 });
      roomsMask.classList.add("is-show");
      ScrollTrigger.create({ trigger: contents, start: "top bottom", end: "top top", onUpdate: (self) => reveal(self.progress) });
    });

    // Phone: below the hero, the language and find-a-room bar hides when the light panel reaches the screen center
    let barST;
    if (spbar) {
      rail?.classList.add("is-fv");
      barST = ScrollTrigger.create({
        trigger: contents, start: "top center", endTrigger: root, end: "bottom bottom",
        onToggle: (self) => { spbar.classList.toggle("is-hide", self.isActive); rail?.classList.toggle("is-fv", !self.isActive); },
      });
    }
    return () => { barST?.kill(); mm.revert(); rail?.classList.remove("is-fv"); };
  });
})();
