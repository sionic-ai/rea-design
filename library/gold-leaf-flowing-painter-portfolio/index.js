// First page — loader (8.5s) · pinned fade slider (swiper fade 2s · 7s) · ScrollTrigger class toggles that change the background and header color per section (original start · end positions as they are)
(() => {
  const { lenis, reduce } = window.nSite;
  const $ = (s) => document.querySelector(s);
  const body = document.body, header = $(".n-header"), hero = $(".n-hero"), slider = $(".n-hero__slider"), leadBg = $(".n-lead-bg");
  const wide = innerWidth > 1024;
  const tog = (target, cls, trigger, start, end) => ScrollTrigger.create({ trigger, start, end, toggleClass: { targets: target, className: cls } });

  $(".n-loading__logo")?.classList.add("is-active");
  $(".n-loading__bg-img")?.classList.add("is-active");
  const start = () => {
    $(".n-loading__bg")?.classList.add("is-passive");
    $(".n-loading__shadow")?.classList.add("is-active");
    $(".n-loading")?.classList.add("is-passive");
    header.classList.add("is-active");
    hero.classList.add("is-active");
    slider.classList.add("is-active");
    lenis.stop();
    setTimeout(() => { body.classList.remove("is-fixed"); lenis.start(); ScrollTrigger.refresh(); }, reduce ? 0 : 9000);
    setTimeout(() => new Swiper(slider, { loop: true, effect: "fade", speed: 2000, autoplay: { delay: 7000, disableOnInteraction: false } }), reduce ? 0 : 6500);
  };
  if (document.readyState === "complete") start(); else addEventListener("load", start);

  // About section — header and background brighten (wide screens to the section end, narrow ones to half the screen), the hero hides, and the pinned video comes in then fades
  tog(header, "is-light", "#lead-section", "top bottom", wide ? "bottom bottom" : "bottom 50%");
  tog(hero, "is-hidden", ".n-light", "top 75%", "+=100000");
  tog(leadBg, "is-active", ".n-light", "top 75%", "bottom 75%");
  tog(leadBg, "is-passive", "#lead-section", "top bottom", "+=100000");
  tog(body, "is-light", "#lead-section", "top bottom", wide ? "bottom bottom" : "bottom 50%");
  // Profile — goes dark, then brightens again when the News section reaches half the screen
  tog(".n-exh__inner", "is-dark", ".n-bio", wide ? "top bottom" : "top 50%", "bottom 50%");
  tog(header, "is-dark", ".n-bio", wide ? "top bottom" : "top 25%", "bottom 50%");
  tog(body, "is-dark", ".n-bio", wide ? "top bottom" : "top 50%", "bottom 50%");
  if (wide || innerWidth <= 640) ScrollTrigger.create({ trigger: ".n-bio__body-inner", start: "top 90%", once: true, onEnter: () => $(".n-bio__body-inner").classList.add("is-active") });
  tog(".n-bio__inner", "is-light", ".n-news", "top 50%", "+=100000");
  tog(header, "is-light", ".n-news", "top 50%", wide ? "bottom 25%" : "bottom 5%");
  tog(".n-news", "is-light", ".n-news", "top 50%", "+=100000");
  tog(body, "is-light", ".n-news", "top 50%", "+=100000");
  ScrollTrigger.create({ trigger: ".n-news", start: "top 75%", once: true, onEnter: () => $(".n-news").classList.add("is-active") });
})();
