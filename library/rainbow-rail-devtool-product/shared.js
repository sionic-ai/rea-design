// Shared across the site — page reveal, Lenis, header dropdown and phone drawer, review slider, closing card interaction
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original Lenis 1.3.17 — lerp 1 and smoothWheel off so the wheel is native as is, and it stops when a drawer opens
  let lenis = null;
  const bootLenis = () => {
    if (lenis || !window.Lenis) return;
    lenis = new Lenis({ autoRaf: true, smoothWheel: false, syncTouch: false, lerp: 1 });
    window.lenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  };
  if (document.readyState === "complete") bootLenis();
  else addEventListener("load", () => ("requestIdleCallback" in window ? requestIdleCallback(bootLenis) : bootLenis()), { once: true });

  // Header bar: is-scrolled after scrolling down 80px
  const top = document.querySelector(".gb-top");
  const onScroll = () => top?.classList.toggle("is-scrolled", scrollY > 80);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Dropdown: original Webflow dropdown (data-hover=false): opens on press, closes by pressing outside or Esc
  const dds = [...document.querySelectorAll(".gb-dd")];
  const closeAll = (except) => dds.forEach((d) => {
    if (d === except) return;
    d.classList.remove("is-open");
    d.querySelector(".gb-dd__toggle")?.setAttribute("aria-expanded", "false");
  });
  dds.forEach((d) => {
    const t = d.querySelector(".gb-dd__toggle");
    t?.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !d.classList.contains("is-open");
      closeAll(d);
      d.classList.toggle("is-open", open);
      t.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".gb-dd")) closeAll(); });

  // Phone drawer — opens and closes data-nav-status (the hamburger’s three lines become an ×)
  const wrap = document.querySelector("[data-nav-status]");
  const setNav = (open) => {
    if (!wrap) return;
    wrap.setAttribute("data-nav-status", open ? "open" : "closed");
    wrap.querySelector(".gb-burger")?.setAttribute("aria-expanded", String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  document.querySelectorAll('[data-nav-button="toggle"]').forEach((b) => b.addEventListener("click", () => setNav(wrap?.getAttribute("data-nav-status") !== "open")));
  document.querySelectorAll('[data-nav-button="close"]').forEach((b) => b.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setNav(false); closeAll(); } });

  // Testimonial slider — original swiper 12: 2.5 slides, 80px, 5s autoplay (only when 20% visible), all slides except the current one at .5
  document.querySelectorAll(".gb-voices .swiper").forEach((el) => {
    if (!window.Swiper) return;
    const shade = (s) => s.slides.forEach((sl, i) => { sl.style.transition = "opacity 0.3s ease"; sl.style.opacity = i === s.activeIndex ? "1" : "0.5"; });
    const box = el.closest(".gb-voices");
    const sw = new Swiper(el, {
      loop: true, slidesPerView: 2.5, spaceBetween: 80,
      autoplay: reduce ? false : { delay: 5000, disableOnInteraction: false },
      navigation: { nextEl: box.querySelector(".gb-arrowbtn--next"), prevEl: box.querySelector(".gb-arrowbtn--prev") },
      breakpoints: { 320: { slidesPerView: 1, spaceBetween: 16 }, 480: { slidesPerView: 2.5, spaceBetween: 40 }, 640: { slidesPerView: 2.5, spaceBetween: 80 } },
      on: { init: shade, slideChange: shade, resize: shade },
    });
    if (!sw.autoplay || reduce) return;
    sw.autoplay.stop();
    shade(sw);
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? sw.autoplay.start() : sw.autoplay.stop())), { threshold: 0.2 }).observe(el);
  });

  // Closing card — on wide screens, hovering the button group changes the arrow image to a check image with a teal glow over .75s, and rewinds on release (original IX3 t-4fed5b6d)
  if (window.gsap) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll(".gb-cta").forEach((cta) => {
        const btns = cta.querySelector(".gb-cta__content .gb-btns");
        const show = cta.querySelectorAll(".gb-cta__check, .gb-cta__glow");
        const hide = cta.querySelector(".gb-cta__arrow");
        if (!btns || !show.length || !hide) return;
        const tl = gsap.timeline({ paused: true })
          .fromTo(show, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.75, ease: "power3.in" }, 0)
          .fromTo(hide, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.75, ease: "power2.in" }, 0);
        // The original IX3 rewinds one beat (about 45ms) after release — measured: original 64ms · immediate rewind 21ms
        let back = null;
        btns.addEventListener("mouseenter", () => { back?.kill(); tl.play(); });
        btns.addEventListener("mouseleave", () => { back = gsap.delayedCall(0.045, () => tl.reverse()); });
      });
    });
  }
})();
