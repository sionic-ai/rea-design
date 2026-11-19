LP.page("home", (main) => {
  const mm = gsap.matchMedia();
  const offs = [];
  // Hero: while pinned (width × 3, scrub .5) the card row shifts −100×(card count − .8)% and the photo plate darkens.
  // Each card’s upper and lower cells unfold from 50:50 and the photo goes 1.3 → 1x, and once past share .2 the title, number, and description come in in turn
  mm.add("(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
    const hero = main.querySelector(".lp-hero"), cats = gsap.utils.toArray(hero.querySelectorAll(".lp-hero__cats > .lp-card")), over = hero.querySelector(".lp-hero__overlay");
    const row = hero.querySelector(".lp-hero__cats");
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: () => "+=" + hero.offsetWidth * 3, pin: true, scrub: 0.5, invalidateOnRefresh: true } });
    tl.to(cats, { xPercent: -100 * (cats.length - 0.8), ease: "none", duration: 2 })
      .to(over, { opacity: 1, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--site-shade-deep"), ease: "none", duration: 2 }, "<");
    cats.filter((c) => !c.classList.contains("is-last")).forEach((card, i) => {
      const img = card.querySelector(".lp-card__img .lp-img");
      const bits = { title: card.querySelector(".lp-card__title"), count: card.querySelector(".lp-card__count"), sub: card.querySelector(".lp-card__sub"), btn: card.querySelector(".lp-card__plus") };
      const c = gsap.timeline({ paused: true })
        .from(bits.title, { filter: "blur(10px)", opacity: 0, y: 10, duration: 0.5 })
        .from(bits.count, { opacity: 0, y: 10, duration: 0.5 })
        .from(bits.sub, { opacity: 0, y: 10, duration: 0.5 }, "-=0.5")
        .to(bits.btn, { opacity: 1, duration: 0.5 });
      let on = false;
      const s = gsap.timeline({ scrollTrigger: { trigger: card, containerAnimation: tl, start: "10% 90%", end: "250% right", scrub: 1,
        onUpdate: (st) => { const p = st.progress > 0.2; if (p !== on) { p ? c.timeScale(1).play() : c.timeScale(2).reverse(); on = p; } } } });
      i === 0 && s.from(card, { filter: "brightness(0.5)", duration: 0.6, ease: "power2.out" }, "<");
      s.from(card, { gridTemplateRows: "50% 50%", duration: 1 }, "<").from(img, { scale: 1.3, duration: 2 }, "-=1");
    });
    // First-screen text after the loader — 20px from below at 1s power4.out (.2 stagger), the card row from 20rem right at 1.2s
    const ds = hero.querySelectorAll(".lp-hero__d"), title = hero.querySelector(".lp-hero__title");
    gsap.set(ds, { y: 20, opacity: 0 }); gsap.set(title, { y: 20, opacity: 0, filter: "blur(10px)" }); gsap.set(row, { x: "20rem" });
    LP.loaderDone.then(() => gsap.timeline()
      .to(ds, { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power4.out" })
      .to(title, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "power4.out" }, "-=0.8")
      .to(row, { x: 0, duration: 1.2, ease: "power4.out" }, "-=1.2"));
  });

  // News — photo preview over the row (shared LP.follow)
  offs.push(LP.follow(main.querySelector(".lp-news__list"), main.querySelector(".lp-news__follow"), main.querySelector(".lp-news"),
    ["News photo · venue · landscape", "News photo · awards ceremony · landscape", "News photo · conference booth · landscape", "News photo · site visit · landscape", "News photo · residential complex · landscape", "News photo · new website · landscape"]));
  return () => { offs.forEach((f) => f()); mm.revert(); };
});
