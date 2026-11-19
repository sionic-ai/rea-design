// Home page: #1 badge pops out, logo strip, two slicks (tab slider · reviews). The big title blur and corner photos are attached by motion parts (scroll-blur-recede · corner-gather-hide).
(() => {
  const reduce = window.SE?.reduce;

  // Original hero-home-bis: when scroll passes half the Hero height, is-bouncing (bounceIn 1s) is added, and removed when scrolling back up
  const stage = document.querySelector(".se-stage");
  const pop = document.querySelector(".se-rise__pop");
  if (stage && pop) {
    const tick = () => pop.classList.toggle("is-bouncing", reduce || scrollY > stage.offsetHeight / 2);
    addEventListener("scroll", tick, { passive: true });
    tick();
  }

  // Two sets of 18 logos — widths vary, just like the original logos
  const rail = document.querySelector(".se-clients__rail");
  if (rail) {
    const widths = [78, 96, 64, 88, 72, 100, 58, 90, 70, 84, 62, 98, 76, 66, 92, 80, 60, 86];
    rail.innerHTML = [...widths, ...widths].map((w, i) => `<figure><span class="wf-logo" style="width:${w}px">LOGO ${String((i % 18) + 1).padStart(2, "0")}</span></figure>`).join("");
    // Original template_logo: active only while section top + 25% of its height is past the screen bottom (54s flow), on leaving, it returns to the start position
    const box = document.querySelector(".se-clients");
    if (!reduce) window.SE.watchCount(box, () => rail.classList.add("is-active"), () => rail.classList.remove("is-active"));
  }

  if (!window.jQuery || !jQuery.fn.slick) return;
  const $ = jQuery;
  const sp = reduce ? 0 : 300;

  // Original template_image-text-slider: text (arrows) ↔ phone screen (fade) ↔ tab titles (variableWidth, press to pick)
  $(".se-engage__txt").slick({ dots: false, arrows: true, infinite: true, slidesToShow: 1, slidesToScroll: 1, speed: sp, prevArrow: SE.prev, nextArrow: SE.next, asNavFor: ".se-engage__imgs, .se-engage__tabs" });
  $(".se-engage__imgs").slick({ dots: false, arrows: false, infinite: true, slidesToShow: 1, slidesToScroll: 1, fade: true, speed: sp, asNavFor: ".se-engage__txt, .se-engage__tabs" });
  $(".se-engage__tabs").slick({ dots: false, arrows: false, infinite: true, focusOnSelect: true, slidesToShow: 2, slidesToScroll: 1, variableWidth: true, speed: sp, asNavFor: ".se-engage__txt, .se-engage__imgs",
    responsive: [{ breakpoint: 991, settings: { slidesToShow: 1, centerMode: true, centerPadding: "30px" } }] });

  // Original template_testimonials: 4 cards, centered, 50px gap, starting from the third, click goes to that card
  $(".se-voices__slider").slick({ dots: false, arrows: true, infinite: true, slidesToShow: 4, slidesToScroll: 1, centerMode: true, initialSlide: 2, centerPadding: "50px", focusOnSelect: true, speed: sp,
    prevArrow: SE.prev, nextArrow: SE.next,
    responsive: [{ breakpoint: 991, settings: { slidesToShow: 1, centerMode: false, centerPadding: "0px", adaptiveHeight: true } }] });
})();
