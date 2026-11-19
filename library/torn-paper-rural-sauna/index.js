// Motion unique to the first page: a loader where two ink dots stamp in steps → the logo settles into place, an intro where one line of brush calligraphy thuds in like a seal stamp,
// A gallery where the photo strip flows 0.5px per frame (phone .4px) (Splide AutoScroll — like the original it doesn’t stop on hover, and when dragged it glides by inertia).
// Reattached each time swup swaps the body, and detached with the returned function.
brand.page("index", (main, { reduce, first }) => {
  const root = document.documentElement;
  const ctx = gsap.context(() => {});
  const loader = document.querySelector(".loader");
  const finish = () => {
    if (loader) loader.style.display = "none";
    root.removeAttribute("data-loading");
    root.removeAttribute("data-loadinganim");
  };

  // The loader runs only on first open — arriving from another page shows just the outer Frame (the original also skips the loader when coming via swup)
  if (!first || !loader || reduce) {
    finish();
    brand.show();
  } else {
    brand.show();
    const logo = document.querySelector(".h-logo");
    const body = document.querySelector(".h-logo__body");
    const [s, a] = loader.querySelectorAll(".loader__shape > div");
    const bg = loader.querySelector(".loader__bg");
    const sp = matchMedia("(max-width: 750px)").matches;
    gsap.set(body, { top: "50%", left: "calc(50% + 0.625em)", xPercent: -50, yPercent: -50, scale: sp ? 1.6 : 1.75 });
    gsap.timeline({ onComplete: finish })
      .fromTo(s, { yPercent: 20, autoAlpha: 0 }, { duration: 1.5, ease: "steps(3)", yPercent: 0, autoAlpha: 1 })
      .fromTo(s, { xPercent: 20 }, { duration: 1.5, ease: "steps(3)", xPercent: 0 }, "<+.15")
      .fromTo(a, { yPercent: 20, autoAlpha: 0 }, { duration: 1, ease: "steps(2)", yPercent: 0, autoAlpha: 1 }, "<+.15")
      .fromTo(a, { xPercent: -20 }, { duration: 1, ease: "steps(2)", xPercent: 0 }, "<+.15")
      .to(logo, { delay: 0.05, duration: 0.6, ease: "sine.out", opacity: 1 }, "<")
      .to(s, { duration: 1.1, ease: "circ.out", autoAlpha: 0, scale: 1.05 }, "+=.1")
      .to(s, { duration: 1.3, ease: "sine.out", yPercent: -10 }, "<")
      .to(s, { duration: 1.3, ease: "circ.out", xPercent: -5 }, "<")
      .to(a, { duration: 1.1, ease: "circ.out", autoAlpha: 0, scale: 1.05 }, "<+.1")
      .to(a, { duration: 1.3, ease: "sine.out", yPercent: -10 }, "<")
      .to(a, { duration: 1.3, ease: "circ.out", xPercent: 5, onComplete: () => root.removeAttribute("data-loadinganim") }, "<")
      .to(body, { duration: 1.4, ease: "sine.inOut", top: 0, left: 0, xPercent: 0, scale: 1 }, "+=.2")
      .to(body, { duration: 0.6, ease: "sine.inOut", yPercent: 40 }, "<")
      .to(body, { duration: 0.8, ease: "sine.inOut", yPercent: 0 }, "<+.6")
      .to(bg, { duration: 0.6, ease: "sine.out", autoAlpha: 0 }, "-=.8")
      .set([body, logo], { clearProps: "all" });
  }

  // Gallery: same Splide 4 + AutoScroll settings as the original
  let slider = null;
  const gallery = main.querySelector(".js-galleryslider");
  if (gallery && window.Splide) {
    slider = new Splide(gallery, {
      type: "loop", drag: "free", arrows: false, pagination: false, gap: "2em", autoWidth: true,
      autoScroll: { pauseOnHover: false, pauseOnFocus: false, speed: 0.5, autoStart: !reduce },
      breakpoints: { 750: { gap: 0.625 / 0.263 + "em", autoScroll: { speed: 0.4 } } },
    });
    slider.mount(window.splide?.Extensions || {});
  }

  return () => { ctx.revert(); slider?.destroy(); };
});
