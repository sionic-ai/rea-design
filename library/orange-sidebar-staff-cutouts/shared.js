// All pages — Lenis (.5s cubic out), turn the stage on after load, is-active when visible (minus the bottom 20%), phone menu, channel and logo sliders (Swiper 8)
(() => {
  const wrap = document.getElementById("t-wrap");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;

  if (window.Lenis && window.gsap && !touch && !reduce) {
    const lenis = new Lenis({ duration: 0.5, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
    window.tLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
  }

  const loaded = () => wrap && wrap.classList.add("is-loaded");
  if (document.readyState === "complete") loaded();
  else addEventListener("load", loaded, { once: true });

  const once = document.querySelectorAll(".js-inview, .js-inview-fade");
  if (reduce || !("IntersectionObserver" in window)) once.forEach((el) => el.classList.add("is-active"));
  else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-active"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -20% 0px" });
    once.forEach((el) => io.observe(el));
  }

  // Phone menu — the button expands the menu (fast), and the business About is collapsible
  const burger = document.querySelector(".t-burger"), menu = document.querySelector(".t-menu");
  const desk = matchMedia("(min-width: 769px)");
  if (burger && menu) burger.addEventListener("click", () => {
    const open = !burger.classList.contains("is-active");
    burger.classList.toggle("is-active", open);
    burger.setAttribute("aria-expanded", String(open));
    if (window.tLenis) open ? window.tLenis.stop() : window.tLenis.start();
    if (window.gsap && !reduce) {
      gsap.killTweensOf(menu);
      if (open) { menu.style.display = "block"; gsap.fromTo(menu, { height: 0, overflow: "hidden" }, { height: "auto", duration: 0.2, ease: "power1.inOut", clearProps: "height,overflow" }); }
      else gsap.to(menu, { height: 0, overflow: "hidden", duration: 0.2, ease: "power1.inOut", onComplete: () => { menu.style.display = ""; gsap.set(menu, { clearProps: "height,overflow" }); } });
    } else menu.style.display = open ? "block" : "";
  });
  document.querySelectorAll(".t-nav .has-child").forEach((li) => {
    li.addEventListener("mouseenter", () => desk.matches && wrap.classList.add("is-menuover"));
    li.addEventListener("mouseleave", () => wrap.classList.remove("is-menuover"));
  });
  document.querySelectorAll(".t-nav .has-child > button").forEach((b) => b.addEventListener("click", () => {
    if (desk.matches) return;
    const li = b.parentElement, open = li.classList.toggle("is-open");
    b.setAttribute("aria-expanded", String(open));
  }));

  if (window.Swiper) {
    const nav = (scope) => {
      const next = scope && scope.querySelector(".button-next"), prev = scope && scope.querySelector(".button-prev");
      return next && prev ? { navigation: { nextEl: next, prevEl: prev } } : {};
    };
    const base = { spaceBetween: 15, threshold: 10, loop: true, loopAdditionalSlides: 4, mousewheel: { forceToAxis: true }, speed: 1000 };
    document.querySelectorAll(".t-swiper-channel").forEach((el) => new Swiper(el, {
      ...base, slidesPerView: 1, ...nav(el.closest(".t-channel")),
      breakpoints: { 769: { slidesPerView: 3, spaceBetween: 10 }, 980: { slidesPerView: 4, spaceBetween: 10 } },
    }));
    document.querySelectorAll(".t-swiper-logos").forEach((el) => new Swiper(el, {
      ...base, slidesPerView: 1,
      autoplay: reduce ? false : { delay: 6000, disableOnInteraction: false, waitForTransition: false },
      breakpoints: { 769: { slidesPerView: 3 }, 980: { slidesPerView: 4 } },
    }));
  }
})();
