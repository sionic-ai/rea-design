// Business scene — original ProgramsHero · ProgramsIntro · ProgramsProgram (expanding items)
A.scene(({ reduce, observe, fx, show }) => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Hero: droplet 1s from .1s blur, header .1s, title .2s, body .3s blurred words, category 1.1s at .7s, scroll-down .7s
  show($(".s-hero__wrap"));
  if (!reduce) {
    gsap.timeline()
      .fromTo($(".s-hero__drop"), { autoAlpha: 0, filter: "blur(10px)" }, { autoAlpha: 1, duration: 1, filter: "blur(0px)" }, 0.1)
      .call(() => { show($(".s-hero__sub")); fx.title($(".s-hero__subtext")); }, [], 0.1)
      .call(() => fx.title($(".s-hero__name")), [], 0.2)
      .call(() => fx.title($(".s-hero__copy"), 0.5), [], 0.3)
      .call(() => fx.scroll($(".s-hero__scroll")), [], 0.7)
      .fromTo($(".s-hero__cats"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1 }, 0.7);
  }

  // About: .5s after becoming visible — label and big text with blurred words, pill from 30px below over 1s (power2.out) at .3s, addendum lines rising at .5s (up to .6)
  const intro = $(".s-intro__grid");
  observe(intro, (on) => {
    if (!on) return;
    show(intro);
    if (reduce) return;
    gsap.timeline({ delay: 0.5 })
      .call(() => fx.title($(".s-intro__title")), [], 0)
      .call(() => fx.title($(".s-intro__copy")), [], 0)
      .fromTo($(".s-intro__chips"), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, duration: 1, ease: "power2.out", y: 0 }, 0.3)
      .call(() => fx.copy($(".s-intro__sub"), 0.6), [], 0.5);
  });

  $$(".s-prog__name").forEach((el) => observe(el, (on) => on && !reduce && gsap.delayedCall(0.05, () => fx.title(el))));

  // Expanding item: an open one gets max-height equal to its content height (.3s ease-in-out) — several can stay open together
  $$(".s-acc").forEach((acc) => {
    const body = $(".s-acc__content", acc);
    const head = $(".s-acc__head", acc);
    if (acc.classList.contains("is-open")) body.style.maxHeight = `${body.scrollHeight}px`;
    head.addEventListener("click", () => {
      const open = !acc.classList.contains("is-open");
      body.style.maxHeight = open ? `${body.scrollHeight}px` : "";
      acc.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
    });
  });
});
