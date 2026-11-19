// News scene — the original UpdatesHero, News (NewsItem expand), UpdatesJobPositions, UpdatesAbout
A.scene(({ reduce, observe, fx, show }) => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Hero: header, title and extras appear straight as blurred words and lines, scroll-down after .5s
  if (!reduce) {
    fx.title($(".n-hero__copy"));
    fx.title($(".n-hero__title"));
    fx.copy($(".n-hero__sub"), 0.5);
    setTimeout(() => fx.scroll($(".n-hero__scroll")), 500);
  }
  observe($(".n-news__title"), (on) => on && !reduce && fx.title($(".n-news__title")));

  // Text lines: line at .2s for 1.5s, category·title at .3s for 1s, open post body lines rise at .2s
  $$(".n-item").forEach((it) => {
    const body = $(".n-item__content", it);
    const head = $(".n-item__head", it);
    if (it.classList.contains("is-open")) body.style.maxHeight = `${body.scrollHeight}px`;
    head.addEventListener("click", () => {
      const open = !it.classList.contains("is-open");
      body.style.maxHeight = open ? `${body.scrollHeight}px` : "0";
      it.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
    });
    observe(it, (on) => {
      if (!on) return;
      show(it);
      if (reduce) return;
      const tl = gsap.timeline();
      tl.fromTo($(".n-item__line", it), { scaleX: 0 }, { duration: 1.5, ease: "power3.out", scaleX: 1 }, 0.2)
        .fromTo($(".n-item__icon", it), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.3)
        .fromTo($(".n-item__cats", it), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 0.3)
        .call(() => fx.title($(".n-item__title", it)), [], 0.4);
      if (it.classList.contains("is-open")) fx.lines(tl, $(".n-item__body", it), 0.2);
    });
  });

  observe($(".n-team__title"), (on) => on && !reduce && fx.title($(".n-team__title")));
  $$(".n-team__item, .n-about__item").forEach((el) => observe(el, (on) => {
    if (!on) return;
    show(el);
    if (reduce) return;
    gsap.fromTo(el.children, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, duration: 1, ease: "power3.out", stagger: 0.1, y: 0 });
  }));
});
