// Home page scenes: hero parallax, unfolding photo window, section where the header turns dark ink, flowing photo strip·popular styles (Swiper 8.4.7), careers strip, photo zoom window
(() => {
  const { ARROW } = window.euParts;
  const arrows = `<span class="eu-btn__arrows">${ARROW.replace("<svg", '<svg class="is-front"')}${ARROW.replace("<svg", '<svg class="is-back"')}</span>`;
  document.querySelectorAll(".hitdesign__arrow, .modal__arrow").forEach((b) => (b.innerHTML = arrows));

  // The original calls autoplay.start on each slider’s scroll event if it is on screen and stop if it is off — same check kept as is
  const playInView = (el, sw, delay) => {
    if (eu.reduce) return sw.autoplay.stop();
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom >= 0) {
        if (delay != null) sw.params.autoplay.delay = delay;
        sw.autoplay.start();
      } else sw.autoplay.stop();
    };
    addEventListener("scroll", check, { passive: true });
  };

  // Popular styles — original Swiper values as is (initial delay 5000, 3000 once on screen)
  const hit = new Swiper(".swiper-hitdesign", {
    loop: true,
    speed: 600,
    mousewheel: false,
    spaceBetween: 10,
    slidesPerView: 2.2,
    autoplay: { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: false },
    breakpoints: { 1366: { spaceBetween: 40, slidesPerView: 3.64, mousewheel: false } },
    navigation: { nextEl: ".hitdesign__arrow.is-next", prevEl: ".hitdesign__arrow.is-prev" },
  });
  playInView(hit.el, hit, 3000);

  // Photo zoom window — pages forward and back through eight concept photos, and the hero’s video button opens a 16:9 video slot
  const modal = document.querySelector(".modal");
  const wrap = modal.querySelector(".modal__wrap");
  const ph = wrap.querySelector(".wf-img");
  const items = [...document.querySelector(".swiper-concept .concept__slide").children];
  const video = wrap.querySelector(".modal__video");
  let at = 0;
  const show = (i) => {
    at = (i + items.length) % items.length;
    const src = items[at];
    const r = src.style.getPropertyValue("--r").trim();
    const [a, b] = r.split("/").map(Number);
    wrap.classList.add("is-swap");
    wrap.classList.toggle("is-wide", a > b);
    ph.style.setProperty("--r", r);
    ph.classList.remove("wf-video");
    ph.dataset.label = src.querySelector(".wf-img").dataset.label;
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.remove("is-swap")));
  };
  const open = (what) => {
    if (what === "movie") {
      modal.classList.add("is-movie");
      wrap.classList.add("is-wide");
      ph.style.setProperty("--r", "16 / 9");
      ph.classList.add("wf-video");
      ph.dataset.label = "About video player · landscape 16:9 · click to play";
      video.hidden = false;
    } else {
      modal.classList.remove("is-movie");
      video.hidden = true;
      show(Number(what));
    }
    document.documentElement.classList.add("is-modal-open");
    modal.setAttribute("aria-hidden", "false");
    eu.lenis?.stop();
  };
  const close = () => {
    video.pause();
    document.documentElement.classList.remove("is-modal-open");
    modal.setAttribute("aria-hidden", "true");
    eu.lenis?.start();
  };
  document.querySelectorAll("[data-modal-open]").forEach((el) => el.addEventListener("click", () => open(el.dataset.modalOpen)));
  document.querySelector('.kv__button a').addEventListener("click", (e) => { e.preventDefault(); open("movie"); });
  modal.querySelector(".modal__close").addEventListener("click", close);
  modal.querySelector(".modal__bg").addEventListener("click", close);
  modal.querySelector(".modal__arrow.is-prev").addEventListener("click", () => show(at - 1));
  modal.querySelector(".modal__arrow.is-next").addEventListener("click", () => show(at + 1));
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  // Flowing photo strip — original Swiper: autoplay with 0 delay advances one slide at a time linearly for an endless flow (PC 110s/slide · phone 8s/slide, second row reversed)
  const strip = (sel, opts) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const sw = new Swiper(el, { loop: true, allowTouchMove: false, mousewheel: false, ...opts, autoplay: { delay: 0, ...opts.autoplay } });
    playInView(el, sw, 0);
    el.querySelectorAll(".swiper-slide-duplicate [data-modal-open]").forEach((d) => d.addEventListener("click", () => open(d.dataset.modalOpen)));
  };
  strip(".swiper-concept", { speed: 110000, slidesPerView: 0.19 });
  strip(".swiper-concept-2", { speed: 8000, slidesPerView: 1.3, autoplay: { reverseDirection: true } });
  strip(".swiper-concept-3", { speed: 8000, slidesPerView: 1.05 });

  eu.scene(({ motion }) => {
    const space = document.querySelector(".intro__space");
    // Header dark sections — original toggleClass ranges as is: until the photo window is half open, lower half of concept, style, pricing, stores. Footer is an addition not in the original
    eu.dark(space, "top bottom", "center bottom");
    eu.dark(".concept", "center bottom", "bottom bottom");
    eu.dark(".hitdesign", "top bottom", "bottom top");
    eu.dark(".menu", "top bottom", "bottom bottom");
    eu.dark(".salon", "top bottom", "bottom top");
    eu.dark(".eu-foot", "top 120px", "bottom top");

    if (!motion) {
      gsap.set(".intro__frame, .recruit__frame", { width: "100%", height: "100%" });
      gsap.set(".intro__item, .recruit__item", { scale: 1 });
      gsap.set(".recruit__cover", { autoAlpha: 1 });
      document.querySelector(".recruit__ttl").classList.add("is-active");
      return;
    }

    // The hero follows the scroll with a lag of 1/4
    const kv = document.querySelector(".kv__inner");
    ScrollTrigger.create({ trigger: ".kv", start: "top top", end: "bottom top", onUpdate: () => gsap.set(kv, { y: scrollY / 4 }) });

    const grow = (frame, item, trigger, cover) => {
      const st = { trigger, start: "top bottom", end: "bottom bottom", invalidateOnRefresh: true, scrub: 1 };
      gsap.to(frame, { width: "100%", height: "100%", ease: "none", scrollTrigger: st });
      gsap.to(item, { scale: 1, ease: "none", scrollTrigger: { ...st } });
      if (cover) gsap.to(cover, { autoAlpha: 1, ease: "none", scrollTrigger: { ...st } });
    };
    grow(".intro__frame", ".intro__item", space);
    grow(".recruit__frame", ".recruit__item", ".recruit__space", ".recruit__cover");
    // When the photo window group exits, it follows 10rem later (original js-slide-up)
    gsap.to(".intro__wrap", { y: "10rem", ease: "none", scrollTrigger: { trigger: ".intro__wrap", start: "bottom-=200 center", end: "bottom top", scrub: 1 } });
    ScrollTrigger.create({ trigger: ".recruit__space", start: "bottom-=300 bottom", toggleClass: { targets: ".recruit__ttl", className: "is-active" } });
  });
})();
