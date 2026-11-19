// Interview detail: application card hover bar (same bar and same sticky filter as the page transition) · other interviews Swiper · phone career path simplebar.
(function () {
  const { $, $$, r, shuffle, reduced, isSP, px } = ZK;

  ZK.ready(() => {
    // Original values: on enter, 8 bars (mix of 10% and 20% widths) go 103% → 0, .2~.45s · delay 0~.2s · power4/power2.out half and half. On exit they leave upward (-103%) with inOut.
    if (!isSP()) $$(".d-entry__item a").forEach((a) => {
      const rects = $$(".bg rect", a);
      a.addEventListener("mouseenter", () => {
        const mul = shuffle([1, 1, 1, 1, 2, 2, 1, 1]);
        let x = 0;
        rects.forEach((rc, i) => { gsap.killTweensOf(rc); const w = mul[i] * 10; rc.setAttribute("width", w + 0.05); rc.setAttribute("x", x); x += w; });
        rects.forEach((rc) => gsap.fromTo(rc, { attr: { y: 103 } }, { attr: { y: 0 }, duration: reduced ? 0 : r(0.2, 0.45), delay: reduced ? 0 : r(0, 0.2), ease: r(0, 1) > 0.5 ? "power4.out" : "power2.out" }));
      });
      a.addEventListener("mouseleave", () => rects.forEach((rc) => {
        gsap.killTweensOf(rc);
        gsap.to(rc, { attr: { y: -103 }, duration: reduced ? 0 : r(0.2, 0.45), ease: r(0, 1) > 0.5 ? "power4.inOut" : "power2.inOut" });
      }));
    });

    // Original Swiper settings as is — centered, infinite loop, .3s, drag threshold 10px, 38px gap on phones (390 base)
    const list = $(".d-other__list"), arrowL = $(".arrow-l", list), arrowR = $(".arrow-r", list);
    new Swiper($(".swiper", list), {
      slidesPerView: "auto", loop: true, centeredSlides: true, speed: reduced ? 0 : 300, threshold: 10,
      spaceBetween: px(38), touchEventsTarget: "container",
      navigation: { nextEl: arrowR, prevEl: arrowL },
      breakpoints: { 768: { spaceBetween: 0 } },
    });
    // Hovering the arrow brings the chevron in flattened (scaleY .1) from outside left (-120%) and unfolds it — .4s power4.out
    [arrowL, arrowR].forEach((b) => {
      const i = $("i", b);
      b.addEventListener("mouseenter", () => { if (reduced) return; gsap.killTweensOf(i); gsap.fromTo(i, { x: "-120%", scaleY: 0.1 }, { x: "0%", scaleY: 1, duration: 0.4, ease: "power4.out" }); });
    });

    // Only on phone, the career path becomes a horizontal simplebar (no auto-hide)
    if (isSP()) new SimpleBar($(".d-path__scroll"), { autoHide: false });
  });
})();
