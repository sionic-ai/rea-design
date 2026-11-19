// The three-line header button opens and closes the drawer, is--scrolled is set after scrolling past 10px, and the photo strip flows endlessly using slick 1.8.1 like the original
(() => {
  const body = document.body;
  const toggle = document.querySelector(".mf-header__toggle");
  const drawer = document.getElementById("mf-drawer");
  const setOpen = (open) => {
    body.classList.toggle("nav--shown", open);
    toggle?.setAttribute("aria-expanded", String(open));
    toggle?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    drawer?.setAttribute("aria-hidden", String(!open));
  };
  toggle?.addEventListener("click", () => setOpen(!body.classList.contains("nav--shown")));
  drawer?.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && body.classList.contains("nav--shown")) setOpen(false); });
  addEventListener("resize", () => { if (innerWidth > 1024 && body.classList.contains("nav--shown")) setOpen(false); });

  const onScroll = () => body.classList.toggle("is--scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Original setting — a one-slide advance of 10s joined end to end linearly without pause (autoplaySpeed 0) so the strip flows at a constant speed
  const MARQUEE = {
    autoplay: true, autoplaySpeed: 0, speed: 10000, cssEase: "linear",
    arrows: false, dots: false, pauseOnFocus: false, pauseOnHover: false, pauseOnDotsHover: false,
    waitForAnimate: false, swipe: false, draggable: false, variableWidth: true, accessibility: false,
  };
  const lists = document.querySelectorAll(".mf-photo-slider__list, .mf-gallery__list");
  if (!lists.length || !window.jQuery?.fn?.slick) return;
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const opts = ctx.conditions.reduce ? { ...MARQUEE, autoplay: false } : MARQUEE;
    lists.forEach((el) => jQuery(el).slick(opts));
    return () => lists.forEach((el) => jQuery(el).hasClass("slick-initialized") && jQuery(el).slick("unslick"));
  });
})();
