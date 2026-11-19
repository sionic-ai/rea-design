// Home page — build the map slot and card mask from the drawing definition, and after the loader lifts, open the hero slider and copy.
(() => {
  const spotsBox = document.querySelector("[data-ll-spots]");
  const cardsBox = document.querySelector("[data-ll-cards]");
  const base = document.querySelector(".ll-course__base");
  if (base && window.LLParkBase) base.innerHTML = LLParkBase();
  const DESC = {
    bbq: "Your two-line barbecue yard description goes here. State the number of zones and people per zone.",
    pluminn: "Your two-line description here of lodging with a tent room.",
    dome: "Your two-line description of the snow hill playground goes here.",
    slide: "Your long slide description here, two lines.",
    athletic: "Your two-line description of the wooden tower playground goes here.",
    bonfire: "Two lines describing the campfire lounge.",
    picnic: "Your two-line description of borrowing a picnic mat.",
    workshop: "Your workshop description goes here in two lines.",
    dogrun: "Two lines describing the dog yard.",
    irisinn: "Your two lines describing the lodging with a cafe.",
  };
  (window.LLSpots || []).forEach((s) => {
    spotsBox?.insertAdjacentHTML("beforeend", `<button type="button" class="ll-spot is-${s.key}" data-fx-part="spot" aria-label="${s.name} View details" style="${s.pos};--fx-frames:${s.n};--fx-dur:${s.dur}s;${s.badge}"><span data-fx-part="strip">${s.strip()}</span></button>`);
    const shots = s.n > 3 ? 3 : s.n > 1 ? 2 : 1;
    cardsBox?.insertAdjacentHTML("beforeend", `
      <article class="ll-cc">
        <h4 class="ll-cc__head"><a href="${s.key === "workshop" ? "service.html" : "about.html"}">${s.name}<span class="ll-cc__more">View details</span></a></h4>
        <div class="ll-cc__thumbs swiper"><div class="swiper-wrapper">${Array.from({ length: shots }, (_, i) => `<div class="swiper-slide"><div class="ll-photo wf-img" data-label="${s.name} Photo ${i + 1} · Facility exterior · daytime · landscape 3:2"></div></div>`).join("")}</div><div class="swiper-pagination"></div></div>
        <p class="ll-cc__text">${DESC[s.key]}</p>
      </article>`);
  });
  window.LLFill?.();

  // Photo slider inside the map panel — original thumbnailSlider (speed 400, 3s autoplay, dot buttons)
  addEventListener("DOMContentLoaded", () => requestAnimationFrame(() => {
    if (!window.Swiper) return;
    document.querySelectorAll(".ll-cc__thumbs").forEach((el) => {
      const n = el.querySelectorAll(".swiper-slide").length;
      new Swiper(el, { slidesPerView: 1, speed: 400, spaceBetween: 0, loop: n > 1, pagination: { el: el.querySelector(".swiper-pagination"), clickable: true }, autoplay: n > 1 ? { delay: 3000, disableOnInteraction: false } : false });
    });
  }));

  window.LLSwipers?.();

  // News — ties the photo row (gap 30, .6s) with the text cards (crossfade .6s, auto 5s)
  const thumbsEl = document.querySelector("[data-ll-news-thumbs]");
  const newsEl = document.querySelector("[data-ll-news]");
  if (window.Swiper && thumbsEl && newsEl) {
    const n = thumbsEl.querySelectorAll(".swiper-slide").length;
    const thumbs = new Swiper(thumbsEl, { spaceBetween: 30, slidesPerView: 1, speed: 600, loop: true, loopedSlides: n });
    const news = new Swiper(newsEl, {
      slidesPerView: 1, speed: 600, loop: true, loopedSlides: n, effect: "fade", fadeEffect: { crossFade: true },
      autoplay: { delay: 5000, disableOnInteraction: false },
      navigation: { nextEl: newsEl.querySelector(".ll-nav__next"), prevEl: newsEl.querySelector(".ll-nav__prev") },
    });
    news.on("slideChange", () => thumbs.slideToLoop(news.realIndex));
  }

  // Once the loader lifts (is-opened on body), the hero photos start advancing — waits for body._loaded via the original MutationObserver
  const startMv = () => {
    document.body.classList.add("is-opened");
    const mv = document.querySelector("[data-ll-mv]");
    if (window.Swiper && mv && !mv.swiper) new Swiper(mv, { slidesPerView: 1, speed: 1000, spaceBetween: 0, loop: true, autoplay: { delay: 4000, disableOnInteraction: false } });
  };
  const loader = document.querySelector("[data-fx~='pop-swap-loader']");
  if (loader) loader.addEventListener("fx:done", startMv, { once: true });
  else startMv();
})();
