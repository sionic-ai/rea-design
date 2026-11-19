/* Services — header entrance (body panel .5s → title letters at .1s intervals → intro → three stones settle in steps(3) → cost button steps(2)),
   Embla 8.6.0 cards (loop off · start align · duration 30), stone title, item title stone icon, lights up in order from the left */
(() => {
  if (!window.gsap) return;
  const reduce = Tanu.reduce;

  const slider = (root) => {
    const vp = root.querySelector(".js-slide-viewport");
    if (!vp || !window.EmblaCarousel) return;
    const prev = root.querySelector(".embla__button--prev"), next = root.querySelector(".embla__button--next"), snap = root.querySelector(".embla__selected-snap-display");
    const api = EmblaCarousel(vp, { loop: false, align: "start", duration: 30, containScroll: false });
    snap.innerHTML = '<span class="sv-slider__cur">1</span><span class="sv-slider__div" aria-hidden="true"></span><span class="sv-slider__total">0</span>';
    const cur = snap.querySelector(".sv-slider__cur"), total = snap.querySelector(".sv-slider__total"), slides = api.slideNodes();
    const sync = () => {
      const i = api.selectedScrollSnap();
      slides.forEach((s, k) => s.classList.toggle("current", k === i));
      prev.disabled = !api.canScrollPrev();
      next.disabled = !api.canScrollNext();
      cur.textContent = String(i + 1);
      total.textContent = String(slides.length);
    };
    prev.addEventListener("click", () => api.scrollPrev());
    next.addEventListener("click", () => api.scrollNext());
    api.on("init", sync).on("select", sync).on("reInit", sync);
    sync();
  };

  const entrance = () => {
    const sub = document.querySelector(".js-fv-subtitle"), intro = document.querySelector(".js-fv-split-text");
    if (reduce) { gsap.set([".js-page", ".js-fv-item", sub, intro, ".js-fv-stone", ".js-simulation-link"], { opacity: 1 }); return; }
    gsap.set(intro, { opacity: 0 });
    gsap.set(".js-fv-stone", { xPercent: () => gsap.utils.random(-10, 10), yPercent: () => gsap.utils.random(30, 80), rotation: () => gsap.utils.random(-60, 60), opacity: 0 });
    gsap.set(".js-simulation-link", { xPercent: 100, yPercent: -20, rotation: -15, opacity: 0 });
    const parts = [];
    sub.querySelectorAll(".js-fv-subtitle-item").forEach((e) => parts.push(...new SplitText(e, { type: "chars", charsClass: "cOpacity" }).chars));
    gsap.set(parts, { opacity: 0 });
    Tanu.fonts().then(() => {
      const tl = gsap.timeline();
      tl.to(".js-page", { opacity: 1, duration: 0.5, ease: "sine.out" })
        .to(".js-fv-item", { opacity: 1, duration: 0.3, ease: "sine.out" })
        .to(sub, { opacity: 1, duration: 0.1, ease: "power4.out" }, "<")
        .to(parts, { opacity: 1, duration: 0.35, stagger: 0.1, ease: "power4.out" }, "<")
        .to(intro, { opacity: 1, duration: 0.6, ease: "sine.out" }, "-=0.3")
        .to(".js-fv-stone", { opacity: 1, duration: 0.6, ease: "sine.out" }, "-=0.6")
        .to(".js-fv-stone", { xPercent: 0, yPercent: 0, rotation: 0, duration: 0.35, ease: "steps(3)" }, "<")
        .to(".js-simulation-link", { opacity: 1, duration: 0.1 })
        .to(".js-simulation-link", { xPercent: 0, yPercent: 0, rotation: 0, duration: 0.45, ease: "steps(2)", onComplete: () => {
          gsap.to(".js-simulation-link", { xPercent: 100, yPercent: -50, rotation: -15, opacity: 0, duration: 0.35, ease: "steps(3)", scrollTrigger: { trigger: ".js-bottom", start: "top bottom", toggleActions: "play none none reverse" } });
        } });
      Tanu.registerEntrance?.(tl);
    });
  };

  /* Group title stone — appears in .6s at 75% of the screen from an offset position and tilt, then settles in place with .35s steps(3) */
  const groupTitles = () => document.querySelectorAll(".js-service-title").forEach((t) => {
    const st = t.querySelectorAll(".js-service-title-stone");
    if (reduce) { gsap.set(st, { opacity: 1, "--sx": "0px", "--sy": "0px", "--sr": "0deg" }); return; }
    gsap.timeline({ scrollTrigger: { trigger: t, start: "top 75%", once: true } })
      .to(st, { opacity: 1, duration: 0.6, ease: "sine.out" })
      .to(st, { "--sx": "0px", "--sy": "0px", "--sr": "0deg", duration: 0.35, ease: "steps(3)" }, "<");
  });
  /* Item title — icon stones stand with steps(3) where they scattered, and title lines at .1s intervals */
  const itemTitles = () => document.querySelectorAll(".js-service-item-title").forEach((t) => {
    const icon = t.querySelector(".js-service-item-stone"), s = new SplitText(t.querySelector(".js-service-item-line"), { type: "lines", linesClass: "cLine" });
    if (reduce) { gsap.set(s.lines, { opacity: 1 }); return; }
    gsap.set(icon, { xPercent: () => gsap.utils.random(-30, 30), yPercent: () => gsap.utils.random(-40, 40), rotation: () => gsap.utils.random(-25, 25), opacity: 0 });
    gsap.set(s.lines, { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: t, start: "top 80%", once: true } })
      .to(icon, { opacity: 1, duration: 0.35, ease: "steps(3)" })
      .to(icon, { xPercent: 0, yPercent: 0, rotation: 0, duration: 0.35, ease: "steps(3)" }, "<")
      .to(s.lines, { opacity: 1, duration: 0.35, stagger: 0.1, ease: "sine.out" }, "-=0.2");
  });
  /* Left table of contents — when an item enters the top 30% of the screen, turn on that item and its group */
  const navTrack = () => {
    const items = document.querySelectorAll(".js-service-item"), subs = document.querySelectorAll(".sv-nav__sub-link"), tops = document.querySelectorAll(".sv-nav__link");
    if (!items.length || !subs.length) return;
    const clear = () => document.querySelectorAll(".sv-nav .is-current").forEach((e) => e.classList.remove("is-current"));
    const on = (id) => {
      const a = document.querySelector(`.sv-nav__sub-link[href="#${id}"]`);
      if (!a) return;
      clear();
      a.classList.add("is-current");
      a.closest(".sv-nav__item")?.querySelector(":scope > .sv-nav__link")?.classList.add("is-current");
    };
    tops.forEach((a) => a.addEventListener("click", () => { clear(); a.classList.add("is-current"); }));
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && on(e.target.id)), { rootMargin: "0px 0px -70% 0px", threshold: 0 });
    items.forEach((i) => io.observe(i));
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".js-service-embla").forEach(slider);
    entrance();
    Tanu.split();
    groupTitles();
    itemTitles();
    Tanu.tegaki();
    navTrack();
  });
})();
