// Home page — hero entrance, photo breathing, following the mouse in reverse, intro entrance, floor map pins and facility carousel, content carousel
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const md = matchMedia("(min-width: 768px)");
  gsap.registerPlugin(ScrollTrigger);

  // ───────── Hero ─────────
  const hero = document.querySelector(".eno-hero");
  hero.classList.add("is-in");

  // Each photo starts at 10~30s long with 1~5s delay, after one loop it rests .5s, then swaps to another photo and restarts at 20~40s
  const rand = (a, b) => Math.random() * (b - a) + a;
  if (!reduce) {
    hero.querySelectorAll("[data-eno-cycle]").forEach((pic) => {
      pic.style.setProperty("--dur", `${rand(10, 30)}s`);
      pic.style.setProperty("--delay", `${rand(1, 5)}s`);
      pic.classList.add("is-cycle");
      pic.addEventListener("animationend", () => {
        pic.classList.remove("is-cycle");
        setTimeout(() => {
          pic.querySelectorAll(".wf-img").forEach((img) => img.classList.toggle("is-on"));
          pic.style.setProperty("--dur", `${rand(20, 40)}s`);
          pic.style.setProperty("--delay", "0s");
          void pic.offsetWidth;
          pic.classList.add("is-cycle");
        }, 500);
      });
    });
  }

  // Two layers move opposite the mouse — distance from screen center × .005, .1 of the remaining distance per frame
  const follow = [...hero.querySelectorAll("[data-eno-follow]")].map((el) => ({ el, dir: Number(el.dataset.enoFollow) }));
  if (!reduce && follow.length) {
    const SENS = 5 / 1000, EASE = 0.1;
    let tx = 0, ty = 0, x = 0, y = 0;
    addEventListener("mousemove", (e) => {
      tx = (e.clientX - innerWidth / 2) * SENS;
      ty = (e.clientY - innerHeight / 2) * SENS;
    });
    const tick = () => {
      x += (tx - x) * EASE;
      y += (ty - y) * EASE;
      follow.forEach(({ el, dir }) => { el.style.transform = `translate(${x * dir}px, ${y * dir}px)`; });
      requestAnimationFrame(tick);
    };
    if (document.readyState === "complete") tick();
    else addEventListener("load", tick, { once: true });
  }

  // ───────── About: at 768 and up the whole section, on phones cell by cell — once when the top edge reaches screen center ─────────
  const about = document.querySelector(".eno-about");
  const mm = gsap.matchMedia();
  mm.add({ wide: "(min-width: 768px)", narrow: "(max-width: 767px)" }, (ctx) => {
    if (reduce) { about.classList.add("is-shown"); about.querySelectorAll("[data-eno-reveal]").forEach((el) => el.classList.add("is-shown")); return; }
    const targets = ctx.conditions.wide ? [about] : [...about.querySelectorAll("[data-eno-reveal]")];
    targets.forEach((el) => ScrollTrigger.create({ trigger: el, start: "top center", once: true, onEnter: () => el.classList.add("is-shown") }));
  });

  // ───────── Stacking carousel (the original is a paid effect — rebuilt with the same numbers) ─────────
  // The number of neighboring sheets sets the overlap ratio and push (%), and each sheet shrinks by scaleStep
  const SPREAD = { 1: 2, 2: 1, 3: 0.2, 4: 0.2 }, SHIFT = { 1: 84, 2: 58, 3: 10, 4: 0 };
  const stackEffect = (pick) => function EnoStack({ swiper, on }) {
    on("beforeInit", () => {
      Object.assign(swiper.params, { watchSlidesProgress: true, centeredSlides: true });
      Object.assign(swiper.originalParams, { watchSlidesProgress: true, centeredSlides: true });
    });
    on("progress", () => {
      const { scaleStep, sideSlides } = pick();
      const side = Math.max(Math.min(sideSlides, 4), 1), n = swiper.slides.length;
      for (let i = 0; i < n; i += 1) {
        const s = swiper.slides[i], p = s.progress, a = Math.abs(p);
        const mult = a > 1 ? 0.3 * (a - 1) * SPREAD[side] + 1 : 1;
        s.style.transform = `translateX(${p * mult * SHIFT[side]}%) scale(${1 - a * scaleStep})`;
        s.style.zIndex = n - Math.abs(Math.round(p));
        s.style.opacity = a > side + 1 ? 0 : 1;
      }
    });
    on("setTransition", (_s, d) => { swiper.slides.forEach((s) => { s.style.transitionDuration = `${d}ms`; }); });
  };

  // Facility carousel — phone .161x with one beside, 768 and up .16x with two beside
  const point = document.querySelector(".eno-point");
  point.querySelectorAll(".eno-point__item").forEach((item) => {
    new Swiper(item.querySelector(".eno-point__swiper"), {
      modules: [stackEffect(() => (md.matches ? { scaleStep: 0.16, sideSlides: 2 } : { scaleStep: 0.16104868913, sideSlides: 1 }))],
      grabCursor: true,
      loop: true,
      speed: 500,
      slidesPerView: "auto",
      navigation: { nextEl: item.querySelector(".eno-point__next"), prevEl: item.querySelector(".eno-point__prev") },
    });
  });
  const items = [...point.querySelectorAll(".eno-point__item")];
  const pins = [...point.querySelectorAll(".eno-pin__inner")];
  const lockPage = (on) => { document.documentElement.style.overflow = on ? "hidden" : ""; };
  pins.forEach((pin, i) => pin.addEventListener("click", () => {
    items.forEach((it, k) => it.classList.toggle("is-active", k === i));
    pins.forEach((p, k) => p.classList.toggle("is-active", k === i));
    if (!md.matches) { point.classList.add("is-modal"); lockPage(true); }
  }));
  point.querySelector(".eno-point__close").addEventListener("click", () => { point.classList.remove("is-modal"); lockPage(false); });

  // Content carousel — phone .054x, three on each side, at 768 and up it doesn’t shrink, four on each side, 10px gap
  const contents = document.querySelector(".eno-contents__swiper");
  new Swiper(contents, {
    modules: [stackEffect(() => (md.matches ? { scaleStep: 0, sideSlides: 4 } : { scaleStep: 0.054496788008, sideSlides: 3 }))],
    loop: true,
    speed: 500,
    slidesPerView: "auto",
    spaceBetween: 0,
    pagination: { el: contents.querySelector(".eno-contents__pagination"), clickable: true },
    navigation: { nextEl: contents.querySelector(".eno-contents__next"), prevEl: contents.querySelector(".eno-contents__prev") },
    breakpoints: { 768: { spaceBetween: 10 } },
  });

  // Hashtag grid tabs — only the pressed tab is filled, like the original widget
  const tabs = [...document.querySelectorAll(".eno-insta__tab")];
  tabs.forEach((t) => t.addEventListener("click", (e) => {
    e.preventDefault();
    tabs.forEach((o) => { o.classList.toggle("is-on", o === t); o.setAttribute("aria-selected", String(o === t)); });
  }));
})();
