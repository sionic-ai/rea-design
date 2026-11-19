/* Home — values from the original init.js pageTop, pageTopLoad, loadingBird, pageDoctorLoad */
(() => {
  const SK = window.SK;
  SK.pages.index = (root) => {
    const { q, reduce } = SK;
    const $ = window.jQuery;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    let onFirst = null;

    // Arch window photos — slick fade 1.2s, every 4s, starts rotating .4s after load
    const $top = $(q(".sk-top__slide", root));
    $top.slick({ fade: true, speed: 1200, autoplay: false, autoplaySpeed: 4000, pauseOnHover: false, pauseOnFocus: false, infinite: true, arrows: false, dots: false, draggable: false, accessibility: false, swipe: false, touchMove: false });
    if (!reduce) later(() => $top.slick("slickPlay"), 400);

    // Bird perching on a branch — part perch-land-bird. On first open it is attached when the loader lifts, when entering via transition it is attached and launched .4s later. On phones, as in the original, no bird, just a one-line notice
    const perch = q(".sk-top__perch", root);
    const fly = () => {
      if (SK.sp()) { gsap.set(q(".sk-top__bird", root), { opacity: 1 }); gsap.set(q(".sk-top__news", root), { opacity: 1 }); return; }
      perch.setAttribute("data-fx", "perch-land-bird");
    };
    if (SK.firstDone) later(fly, 400);
    else { onFirst = () => fly(); document.addEventListener("sk:first-done", onFirst, { once: true }); }

    // Four season images — motion part shadow-hop-in. Triggers when the section’s top edge rises 400px (phone 200px) from the screen bottom
    const lead = q(".sk-lead", root);
    lead.setAttribute("data-fx-shadow-hop-in", `start: top bottom-=${SK.sp() ? 200 : 400}`);
    lead.setAttribute("data-fx", "shadow-hop-in");

    // Director photo — slick fade 1.8s. When the photo top reaches (screen height − 700px) (phone − 400px) below the top of the screen, it goes to the second image after .2s
    const $doc = $(q(".sk-doc__slider", root));
    $doc.slick({ fade: true, speed: 1800, autoplay: false, pauseOnHover: false, pauseOnFocus: false, infinite: true, arrows: false, dots: false, accessibility: false, swipe: false, touchMove: false });
    const st = ScrollTrigger.create({
      trigger: $doc[0],
      start: () => `top ${innerHeight - (SK.sp() ? 400 : 700)}px`,
      once: true,
      onEnter: () => later(() => $doc.slick("slickGoTo", 1), 200),
    });

    return {
      destroy() {
        timers.forEach(clearTimeout);
        if (onFirst) document.removeEventListener("sk:first-done", onFirst);
        perch.removeAttribute("data-fx");
        lead.removeAttribute("data-fx");
        st.kill();
        try { $top.slick("unslick"); $doc.slick("unslick"); } catch (e) {}
      },
    };
  };
})();
