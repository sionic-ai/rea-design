// First page — values from the original inline script, unchanged.
// Loader (once per session): handwriting vivus oneByOne 150f, on PC 5s veil lifts · subtitle, 6.8s headline, 7.2s side lines · scroll, 7.6s confetti (phone 2·2·3.8·4.2·4.6s)
// Spot: pinned + panel xPercent −100×count scrub (+panel width), back photo clip-path in turn, header hidden while pinned, and when the panel enters the road vivus syncs at 50f
// Photo swiper loop · 2s · 5s, culture slick fade 3s/1s, model course slick centerMode 5s/1s + text fade, season slick dot tabs 5s/1s, event row 100s
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pc = innerWidth > 767;

  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body, head = $(".ac-head"), loading = $(".loading"), hero = $(".hero");
    hero.classList.add("loaded");
    let seen = false; try { seen = sessionStorage.getItem("ac-access") === "true"; sessionStorage.setItem("ac-access", "true"); } catch {}
    if (seen || reduce) {
      document.documentElement.classList.add("is-seen");
      body.classList.remove("is-loading");
    } else {
      if (pc) window.acVivus(loading.querySelector("[data-hand]"), "autostart");
      const t = pc ? [5000, 5000, 6800, 7200, 7600] : [2000, 2000, 3800, 4200, 4600];
      setTimeout(() => loading.classList.add("active"), t[0]);
      setTimeout(() => $(".hero_ttl .sub").classList.add("active"), t[1]);
      setTimeout(() => head.classList.add("active"), t[2]);
      setTimeout(() => $$(".hero_info, .hero_scroll").forEach((e) => e.classList.add("active")), t[3]);
      setTimeout(() => $$(".hero--deco").forEach((e) => e.classList.add("active")), t[4]);
    }

    // News row — chain three more copies of the card like the original and let it flow for 100s
    $$(".ev-track").forEach((tr) => { const h = tr.innerHTML; tr.innerHTML = h + h + h + h; });

    if (window.Swiper) new Swiper(".hf-swiper", { loop: true, loopAdditionalSlides: 1, speed: 2000, autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false, waitForTransition: false }, followFinger: false, observeParents: true });

    if (window.jQuery && jQuery.fn.slick) {
      const J = jQuery;
      const still = { pauseOnFocus: false, pauseOnHover: false, autoplay: !reduce };
      J(".culture_content .img_wrap").slick({ ...still, fade: true, autoplaySpeed: 3000, adaptiveHeight: true, speed: 1000, arrows: false, dots: false });
      const img = J(".home_modelcourse--post .img_slider"), txt = J(".home_modelcourse--post .txt_slider");
      img.slick({ ...still, autoplaySpeed: 5000, adaptiveHeight: true, speed: 1000, arrows: true, dots: true, centerMode: true, variableWidth: true,
        prevArrow: '<span class="prev circle"><span class="arrow"></span></span>', nextArrow: '<span class="next circle"><span class="arrow"></span></span>', asNavFor: txt });
      txt.slick({ ...still, fade: true, autoplaySpeed: 5000, adaptiveHeight: true, speed: 1000, arrows: false, dots: false, asNavFor: img });
      const season = ["Spring event", "Summer event", "Autumn event", "Winter event"];
      J(".home_season--slider").slick({ ...still, autoplaySpeed: 5000, adaptiveHeight: true, speed: 1000, arrows: false, dots: true,
        customPaging: (s, i) => J("<span>").text(season[i]), appendDots: J(".home_season--navi") });
    }

    // Path drawing — when a spot panel becomes active, draw that panel’s path
    const roots = $$(".spot_map").map((svg) => (reduce || !window.Vivus ? null : new Vivus(svg, { type: "sync", duration: 50, animTimingFunction: Vivus.EASE_OUT, start: "manual" })));
    $$(".spot").forEach((sp, i) => new MutationObserver(() => sp.classList.contains("active") && roots[i]?.play()).observe(sp, { attributes: true, attributeFilter: ["class"] }));
  });

  (window.acReady || Promise.resolve()).then(() => {
    if (!window.gsap || !window.ScrollTrigger || reduce) { $$(".spot").forEach((s) => s.classList.add("active")); return; }
    const container = $(".home_spot"), track = $(".spot_track"), spots = $$(".spot"), head = $(".ac-head");
    const wipe = (dir) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: container, start: "top top", end: () => "+=" + (pc ? track.scrollWidth : container.offsetHeight), scrub: true, invalidateOnRefresh: true } });
      const hide = pc ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 100% 0%)";
      ["bg01", "bg02", "bg03", "bg04"].forEach((b, i) => {
        tl.add(() => spots[i].classList.add("active"));
        tl.to(`.spot_bg .${b}`, { ease: "linear", clipPath: i === 3 ? "inset(0% 0% 0% 0%)" : hide });
      });
    };
    if (pc) {
      gsap.to(spots, { xPercent: -100 * spots.length, ease: "linear", scrollTrigger: { trigger: container, pin: true, scrub: true, start: "top top", end: () => "+=" + track.scrollWidth, invalidateOnRefresh: true, toggleClass: { targets: head, className: "is-hide" } } });
    } else {
      gsap.to(spots, { ease: "linear", scrollTrigger: { trigger: ".spot_bg", pin: true, pinSpacing: false, scrub: true, start: "top top", end: () => "+=" + container.offsetHeight, invalidateOnRefresh: true } });
    }
    wipe();
    ScrollTrigger.refresh();
  });
})();
