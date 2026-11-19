// Home page — numbers from the original top.js. The default curve for this page is power3.out
(() => {
  gsap.defaults({ ease: "power3.out" });
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Two photo rows — Swiper autoplay delay 0, 6s per slot, second row reversed. Can’t be stopped by hand
  $$(".pic-container").forEach((el, i) => new Swiper(el, {
    loop: true, slidesPerView: "auto", speed: 6000, allowTouchMove: false,
    autoplay: { delay: 0, reverseDirection: !!i, disableOnInteraction: false },
  }));

  // Video slot — in the original it fades in with -show over 1s once the player is ready
  requestAnimationFrame(() => $(".mv-movie .player")?.classList.add("-show"));

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const show = (t) => gsap.set(t, { opacity: 1, y: 0, scale: 1 });
    const mvChars = $$(".mv-open .c-character span");
    const frame = $(".mv-frame"), open = $(".mv-open");
    if (ctx.conditions.reduce) {
      show([frame, open, ".l-ticket", ".l-movie", ".l-access", ...mvChars]);
      show($$(".about-title, .about-text, .about-link, .about-pics .pic, .c-character span, .activity-title, .activity-info, .activity-link, .l-news > *"));
      return;
    }

    // Hero — frame 0.4s, character panel 0.3s (0.5s rest), characters alternate up and down from 30px with back.out 0.6s · 0.1s apart · after 1.3s
    gsap.timeline().set(open, { y: 10, opacity: 0 })
      .to(frame, { opacity: 1, duration: 0.4 })
      .to(open, { y: 0, opacity: 1, duration: 0.3, delay: 0.5 });
    gsap.timeline()
      .set(mvChars.filter((_, i) => i % 2 === 0), { y: -30, opacity: 0 })
      .set(mvChars.filter((_, i) => i % 2 === 1), { y: 30, opacity: 0 })
      .to(mvChars, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 1.3, ease: "back.out" });

    const once = (trigger, onEnter) => ScrollTrigger.batch(trigger, { start: "top 60%", once: true, onEnter });

    const ticket = $(".l-ticket");
    gsap.set(ticket, { opacity: 0, y: 30 });
    once(ticket, () => gsap.to(ticket, { opacity: 1, y: 0, duration: 0.6 }));

    // About — three texts 0.6s with 0.1s stagger, photo back.out 0.3s at 0.8 (after 0.4s), character back.out 0.6s
    const aboutText = $$(".about-title, .about-text, .about-link"), pics = $$(".about-pics .pic"), aboutBg = $(".about-bg");
    const aboutChar = $$(".l-about > .c-character span");
    gsap.set(aboutText, { opacity: 0, y: 30 });
    gsap.set(pics, { opacity: 0, scale: 0.8 });
    gsap.set(aboutBg, { opacity: 0 });
    gsap.set(aboutChar, { y: 30, opacity: 0 });
    once(".about-title", () => {
      gsap.to(aboutText, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 });
      gsap.to(pics, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.1, ease: "back.out", delay: 0.4 });
      gsap.to(aboutBg, { opacity: 1, duration: 0.4, ease: "back.out", delay: 0.8 });
      gsap.to(aboutChar, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out" });
    });

    // Video window — panel 0.6s, character back.out 0.4s after 0.6s
    const movie = $(".l-movie"), movieChars = $$(".l-movie .c-character span");
    gsap.set(movie, { opacity: 0, y: 30 });
    gsap.set(movieChars, { y: 30, opacity: 0 });
    once(movie, () => {
      gsap.to(movie, { opacity: 1, y: 0, duration: 0.6 });
      gsap.to(movieChars, { y: 0, opacity: 1, duration: 0.4, stagger: 0, delay: 0.6, ease: "back.out" });
    });

    // Experience — title, two columns and button 0.6s with 0.1s stagger, each character pops in with back.out 0.4s when visible
    const actParts = $$(".activity-title, .activity-info, .activity-link"), actChars = $$(".l-activity .c-character span");
    gsap.set(actParts, { opacity: 0, y: 30 });
    gsap.set(actChars, { y: 30, opacity: 0 });
    if (actChars[0]) gsap.set(actChars[0], { y: -30 });
    once(".l-activity", () => gsap.to(actParts, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }));
    ScrollTrigger.batch(actChars, { start: "top 60%", once: true, onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 0.4, ease: "back.out" }) });

    const news = $$(".l-news > *:not(.c-character)");
    gsap.set(news, { opacity: 0, y: 30 });
    once(news, () => gsap.to(news, { opacity: 1, y: 0, duration: 0.6 }));

    // Photo row characters: back.out 0.6s · 0.1s interval
    const galChars = $$(".l-gallery .c-character span");
    gsap.set(galChars, { y: 30, opacity: 0 });
    once(".l-gallery", () => gsap.to(galChars, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "back.out" }));

    const access = $(".l-access");
    gsap.set(access, { opacity: 0, y: 30 });
    once(access, () => gsap.to(access, { opacity: 1, y: 0, duration: 0.6 }));
  });
})();
