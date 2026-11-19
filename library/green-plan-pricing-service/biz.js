/* Corporate landing — original cr-assets/common.js slick settings as is: banner (centerMode · variableWidth · 1s · 5s autoplay, one slide below 1180), four thumbnails (asNavFor), case studies (centered · finite · bar dots) */
(() => {
  if (!window.jQuery || !jQuery.fn.slick) return;
  const $ = jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const speed = reduce ? 0 : 1000;
  $(".bz-hero__main").slick({
    slidesToShow: 1, arrows: true, centerMode: true, variableWidth: true,
    prevArrow: '<p class="slider__main__wrap_prev"></p>', nextArrow: '<p class="slider__main__wrap_next"></p>',
    autoplay: !reduce, speed, autoplaySpeed: 5000, asNavFor: ".bz-hero__tmb",
    responsive: [{ breakpoint: 1180, settings: { centerMode: false, variableWidth: false, arrows: false } }],
  });
  $(".bz-hero__tmb").slick({
    slidesToShow: 4, arrows: true, infinite: true, focusOnSelect: true,
    prevArrow: '<p class="slider__tmb__wrap_prev"></p>', nextArrow: '<p class="slider__tmb__wrap_next"></p>',
    appendArrows: $(".bz-hero__tmb-wrap"), speed, autoplaySpeed: 5000, asNavFor: ".bz-hero__main",
    responsive: [{ breakpoint: 767, settings: { slidesToShow: 3 } }, { breakpoint: 600, settings: { slidesToShow: 2 } }],
  });
  $(".bz-case").slick({
    slidesToShow: 1, initialSlide: 1, arrows: true, infinite: false, centerMode: true, variableWidth: true,
    dots: true, dotsClass: "slider__case__dots",
    prevArrow: '<p class="slider__case__prev"></p>', nextArrow: '<p class="slider__case__next"></p>',
    autoplay: false, speed, responsive: [{ breakpoint: 767, settings: { initialSlide: 0 } }],
  });
  // Header nav — in-page moves in the original are 400ms swing (jQuery default)
  const go = (t) => {
    const y = document.querySelector(t.dataset.href).getBoundingClientRect().top + scrollY - document.querySelector(".bz-head").offsetHeight;
    $("html, body").animate({ scrollTop: y }, reduce ? 0 : 400, "swing");
  };
  // Tapping a header nav label opens the dropdown in .2s (original body>div.active) the character cell turns light green (.3s). Clicking the same character or outside closes it
  const drop = document.querySelector(".bz-drop"), head = document.querySelector(".bz-head");
  // Same formula as the CSS transition default curve, ease
  const ease = window.CustomEase ? (CustomEase.get("bz-ease") || CustomEase.create("bz-ease", "0.25,0.1,0.25,1")) : "power1.inOut";
  let on = null;
  const close = () => { on?.classList.remove("is-on"); on = null; gsap.to(drop, { autoAlpha: 0, duration: reduce ? 0 : 0.2, ease: ease }); };
  const open = (t) => {
    on?.classList.remove("is-on"); on = t; t.classList.add("is-on");
    gsap.set(drop, { top: head.getBoundingClientRect().bottom });
    gsap.fromTo(drop, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.2, ease: ease });
  };
  document.querySelectorAll(".bz-nav__t").forEach((t) => {
    t.addEventListener("click", (e) => { e.stopPropagation(); on === t ? close() : open(t); });
    t.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); on === t ? close() : open(t); } });
  });
  drop?.addEventListener("click", (e) => { e.stopPropagation(); const a = e.target.closest("[data-bz-go]"); if (a && on) { e.preventDefault(); const t = on; close(); go(t); } });
  document.addEventListener("click", () => { if (on) close(); });
})();
