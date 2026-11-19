// First page only: category filtering, dragging the schedule along, picking·dragging·zooming map places, campaign slider.
(() => {
  // Category filter: the list sinks and vanishes in .15s, then rises already filtered with a .4s bounce
  const program = document.querySelector(".p-program");
  const items = [...document.querySelectorAll(".p-program__item")];
  const intervals = [...document.querySelectorAll(".c-interval")];
  let busy = null;
  addEventListener("program:filter", ({ detail: cat }) => {
    clearTimeout(busy);
    program.classList.add("is-filtering");
    busy = setTimeout(() => {
      items.forEach((li) => { li.hidden = cat !== "all" && li.dataset.category !== cat; });
      intervals.forEach((el) => { el.hidden = cat !== "all"; });
      document.querySelector(".c-heading__count").textContent = items.filter((li) => !li.hidden).length;
      program.classList.remove("is-filtering");
    }, 150);
  });

  // Schedule: as in the original, mouse devices use swiper free mode (momentum .5, no bounce at the ends, wheel horizontal only at 1.2x), touch devices just scroll horizontally
  const coarse = matchMedia("(pointer: coarse)").matches;
  const chart = document.querySelector(".p-schedule__chart");
  if (chart && window.Swiper && !coarse) {
    new Swiper(chart, { slidesPerView: "auto", spaceBetween: 0, freeMode: { enabled: true, momentumVelocityRatio: .5, momentumBounce: false }, mousewheel: { forceToAxis: true, sensitivity: 1.2 } });
  } else if (chart) chart.style.overflow = "scroll";
  // Today’s cell pink band — only when the head’s year and the current year match (the original doesn’t apply it unless it is the event year)
  const year = +document.querySelector(".p-schedule .c-heading__year")?.textContent;
  const now = new Date();
  if (year === now.getFullYear()) document.querySelector(`.p-schedule__chart-day[data-day="${now.getMonth() + 1}-${now.getDate()}"]`)?.classList.add("is-current");

  // Map: pressing a chip·pin pops that place’s pin and changes the right panel’s header·list
  const setPlace = (k) => {
    document.querySelectorAll(".p-map__places-item").forEach((li, i) => li.classList.toggle("is-active", i === k));
    document.querySelectorAll(".p-map__layer .c-map-pin").forEach((p) => p.classList.toggle("is-active", +p.dataset.mapPlace === k));
    document.querySelectorAll("[data-map-head]").forEach((h) => h.classList.toggle("is-active", +h.dataset.mapHead === k));
    document.querySelectorAll("[data-map-list]").forEach((l) => l.classList.toggle("is-active", +l.dataset.mapList === k));
  };
  document.querySelectorAll("[data-map-place]").forEach((el) => el.addEventListener("click", () => {
    if (layer.dataset.moved === "1") return;
    setPlace(+el.dataset.mapPlace);
  }));

  // Map drag and zoom (the original drags a map preview image and zooms with + − buttons)
  const layer = document.querySelector(".p-map__layer");
  let px = 0, py = 0, scale = 1;
  const apply = () => { layer.style.transform = `translate(${px}px, ${py}px) scale(${scale})`; };
  let drag = null;
  layer.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    drag = { x: e.clientX - px, y: e.clientY - py, sx: e.clientX, sy: e.clientY };
    layer.dataset.moved = "0";
    layer.classList.add("is-dragging");
  });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const box = layer.parentElement.getBoundingClientRect();
    const lim = (v, s) => Math.max(-s * .1 * scale, Math.min(s * .1 * scale, v));
    px = lim(e.clientX - drag.x, box.width); py = lim(e.clientY - drag.y, box.height);
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4) layer.dataset.moved = "1";
    apply();
  });
  addEventListener("pointerup", () => { if (!drag) return; drag = null; layer.classList.remove("is-dragging"); setTimeout(() => { layer.dataset.moved = "0"; }); });
  document.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => {
    scale = Math.max(1, Math.min(2, scale + +b.dataset.zoom * .25));
    layer.style.transition = "transform .3s cubic-bezier(.215,.61,.355,1)";
    apply();
    setTimeout(() => { layer.style.transition = ""; }, 300);
  }));

  // Campaign: the original swiper loop — center aligned, .45s, thumbnails go to that slide, clicking a side slide moves one step. Arrows flinch to .7x when pressed
  const list = document.querySelector(".p-campaign__list");
  const thumbs = [...document.querySelectorAll("[data-camp]")];
  const camp = list && window.Swiper && new Swiper(list, {
    speed: 450, slidesPerView: "auto", centeredSlides: true, loop: true,
    navigation: { prevEl: ".p-campaign__nav--prev", nextEl: ".p-campaign__nav--next" },
  });
  const mark = () => thumbs.forEach((t, i) => t.classList.toggle("is-current", i === camp.realIndex));
  if (camp) {
    camp.on("slideChange", mark);
    mark();
    thumbs.forEach((t, i) => t.addEventListener("click", () => camp.slideToLoop(i)));
    list.addEventListener("click", (e) => {
      const s = e.target.closest(".swiper-slide");
      if (s?.classList.contains("swiper-slide-prev")) { e.preventDefault(); camp.slidePrev(); }
      else if (s?.classList.contains("swiper-slide-next")) { e.preventDefault(); camp.slideNext(); }
    });
  }
  document.querySelectorAll(".p-campaign__nav").forEach((b) => b.addEventListener("click", () => {
    b.classList.remove("is-click");
    requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add("is-click")));
  }));
})();
