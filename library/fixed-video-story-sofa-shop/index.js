// Home page: loader · three Splide branches (hero products · photo bubbles · color swatches) · pinned photo swap · cover A/B transition
(() => {
  const KEY = "yr-visited";
  const loader = document.getElementById("top-loading");
  if (document.documentElement.classList.contains("yr-skip-loader")) {
    loader?.remove();
    document.body.classList.add("is-loadingSkip", "is-loadingLoad");
  } else {
    // Like the original, start the loader clock 20ms after window load and lock scrolling for 4.5s
    const start = () => {
      document.body.classList.add("is-loadingReady");
      document.body.style.overflow = "hidden";
      setTimeout(() => { scrollTo(0, 0); document.body.classList.add("is-loadingLoad"); }, 20);
      setTimeout(() => { document.body.style.overflow = ""; }, 4500);
    };
    if (document.readyState === "complete") start(); else addEventListener("load", start, { once: true });
    setTimeout(() => localStorage.setItem(KEY, "true"), 3000);
  }

  // Original Splide options as is (data-splide) — loop · 1.75s · cubic-bezier(.83,0,.17,1) · centered
  const EASE = "cubic-bezier(0.83, 0, 0.17, 1)";
  const base = { type: "loop", easing: EASE, speed: 1750, arrows: false, focus: "center", updateOnMove: true, flickPower: 200 };
  // The center slide and both of its neighbors, clones included, get the same state (original is-active-logical · is-prev-logical · is-next-logical)
  const logical = (splide) => {
    const mark = (index) => {
      const n = splide.length;
      const i = ((index % n) + n) % n, prev = (i - 1 + n) % n, next = (i + 1) % n;
      splide.Components.Slides.forEach((s) => {
        const k = s.isClone ? s.slideIndex : s.index;
        s.slide.classList.toggle("is-active-logical", k === i);
        s.slide.classList.toggle("is-prev-logical", k === prev);
        s.slide.classList.toggle("is-next-logical", k === next);
      });
    };
    splide.on("mounted", () => mark(splide.index));
    splide.on("move", (i) => mark(i));
    splide.on("moved", (i) => mark(i));
  };
  const hasAutoplay = (opts) => {
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) return opts;
    return { ...opts, autoplay: false, speed: 0 };
  };

  const product = document.querySelector(".mv__product");
  if (product) {
    const s = new Splide(product, hasAutoplay({ ...base, perPage: 3, gap: "10vw", padding: "14vw", pagination: false, autoplay: true, interval: 4000, breakpoints: { 680: { perPage: 1, gap: "15vw", padding: "25%" } } }));
    logical(s);
    s.mount();
  }
  const bubbles = document.querySelector(".mv__bubbles");
  if (bubbles) {
    const s = new Splide(bubbles, hasAutoplay({ ...base, perPage: 3, gap: "8vw", padding: "15vw", pagination: false, autoplay: true, interval: 4000, breakpoints: { 680: { perPage: 1, gap: "15vw", padding: "33.33%" } } }));
    logical(s);
    s.mount();
  }

  // Builds the color swatch slides and the back background — Cover A five colors, Cover B six colors
  const COLORS = {
    a: [["c1", "Ivory", "Ivory"], ["c2", "Cool Gray", "Cool Gray"], ["c3", "Terracotta", "Terracotta"], ["c4", "Moss Green", "Moss green"], ["c5", "Sand Beige", "Sand beige"]],
    b: [["c6", "Honey", "Honey"], ["c7", "Navy", "Navy"], ["c8", "Deep Green", "Deep Green"], ["c9", "Brown", "Brown"], ["c10", "Rose", "Rose"], ["c11", "Greige", "Greige"]],
  };
  const chev = window.yrChevron || "";
  const sliders = {};
  Object.entries(COLORS).forEach(([g, list]) => {
    const root = document.querySelector(`.color-slider[data-cover-group="${g}"]`);
    const bg = document.querySelector(`.color-bg[data-cover-group="${g}"] ul`);
    if (!root || !bg) return;
    root.querySelector(".splide__list").innerHTML = list.map(([c, en, ko]) => `
      <li class="splide__slide yr-${c}"><div class="color-card">
        <div class="color-card__center">
          <p class="color-card__label">Color</p>
          <p class="color-card__title">${en}</p>
          <p class="color-card__title-ko">${ko}</p>
          <div class="color-card__img wf-img" data-label="Cushion sofa cutout · ${ko} · Front view 1:1"></div>
          <a class="yr-btn is-small is-reverse${c === "c1" ? "" : " is-white"}" href="product.html">${chev}<span>View product</span></a>
        </div>
        <div class="color-card__right">
          <p class="color-card__right-title">${ko}</p>
          <p class="color-card__right-text">Your three lines on the impression of this color here.<br>One line on how it looks from inside the room.<br>One line on a fitting space.</p>
          <p class="color-card__right-en">A short English caption about this color,<br>set across two quiet lines.</p>
        </div>
      </div></li>`).join("");
    bg.innerHTML = list.map(([c, en, ko], i) => `
      <li class="yr-${c}${i === 0 ? " is-active" : ""}">
        <div class="color-bg__img js-sa__image"><div class="wf-img" data-label="${ko} Living room with cushions · warm window light · full-bleed landscape background"></div></div>
        <div class="color-bg__text"><div class="yr-stream"><div class="yr-stream__wrap"><span class="yr-stream__text">Cushion</span><span class="yr-stream__text">Cushion</span></div></div></div>
      </li>`).join("");
    const s = new Splide(root, hasAutoplay({ ...base, perPage: 1, gap: "0vw", padding: "25%", pagination: true, autoplay: false, breakpoints: { 680: { perPage: 1, gap: "10vw", padding: "15%" } } }));
    let painted = false;
    s.on("pagination:mounted", (data) => {
      // The original creates the dots only on first attach, then puts in the color variable one frame later so the fill changes from ink to its own color in .2s (redraws change instantly)
      const paint = () => data.items.forEach((item) => item.button.classList.add(`yr-${list[item.page][0]}`));
      if (painted) paint(); else requestAnimationFrame(paint);
      painted = true;
    });
    const sync = (i) => bg.querySelectorAll("li").forEach((li, k) => li.classList.toggle("is-active", k === ((i % list.length) + list.length) % list.length));
    // Original leaves the background alone when advancing by clicking a dot (measured: no opacity change in the background cell for 3s) — it syncs only when dragging
    let dragged = false;
    s.on("drag", () => { dragged = true; });
    s.on("moved", (i) => { if (dragged) sync(i); dragged = false; });
    if (g === "a") s.mount();
    sliders[g] = s;
  });
  document.querySelectorAll(".cover-toggle__btn").forEach((btn) => btn.addEventListener("click", () => {
    const g = btn.dataset.coverValue;
    document.querySelectorAll(".cover-toggle__btn").forEach((b) => b.classList.toggle("is-active", b === btn));
    document.querySelectorAll(".color-slider, .color-bg").forEach((el) => { el.hidden = el.dataset.coverGroup !== g; });
    const sl = sliders[g];
    if (sl?.state.is(Splide.STATES.CREATED)) sl.mount(); else sl?.refresh();
    // Hidden tracks get is-sa from the original scroll engine on the next observation frame (about .1s later) and turn on in .6s
    setTimeout(() => window.yrMeasure?.(), 90);
  }));

  // Advantages section: turn on the photo of the last section that passed the screen center on the fixed panel
  const body = document.querySelector(".product__body");
  if (body) {
    const points = [...body.querySelectorAll(".point")];
    const fix = [...body.querySelectorAll(".product__fix li")];
    let active = "1";
    const update = () => {
      let next = points[0]?.dataset.sectionIndex;
      for (const p of points) if (p.getBoundingClientRect().top <= innerHeight * 0.5) next = p.dataset.sectionIndex;
      if (next === active) return;
      active = next;
      body.dataset.activeSection = next;
      fix.forEach((li) => li.classList.toggle("is-active", li.dataset.sectionIndex === next));
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }
  window.yrMeasure?.();
})();
