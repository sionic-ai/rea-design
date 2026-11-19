// Work detail — photo row (portrait: center 8 cells, landscape: 12 cells, ‹+› to enlarge), related strip, tour slider, model house card
(() => {
  const { strip, arrowBtn } = window.nj;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const photos = {
    a: [["h", "Round restaurant table and pendant lights · earthen wall · garden beyond the window · landscape 3:2"], ["v", "Sliding wooden door and dining table · Portrait 2:3"], ["h", "Dining room and living room seen from the kitchen · landscape 3:2"], ["v", "Recessed ceiling lights and wall storage · Portrait 2:3"]],
    b: [["v", "High window and storage door on white wall · portrait 2:3"], ["v", "Dirt-floor entry beyond the sliding front door · portrait 2:3"], ["h", "Dining table and square window under pendant lights · landscape 3:2"]],
  };
  const all = [...photos.a, ...photos.b];
  let n = 0;
  for (const [key, list] of Object.entries(photos)) {
    document.querySelector(`[data-gallery="${key}"]`).outerHTML = list.map(([k, label]) => `
      <div class="sg__imageSection nj-grid"><div class="sg__image is-${k}"><div class="sg__imageInner"><div class="wf-img" data-label="${label}"></div><button class="sg__open" type="button" aria-label="View Large" data-index="${n++}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="11.5" fill="var(--kf-bg)" stroke="none"/><path d="M12 7v10M7 12h10"/></svg></button></div></div></div>`).join("");
  }

  document.querySelector("[data-strip-one]").innerHTML = strip({ name: "Your neighboring house name here", area: "Area Name", shots: [["v", "Veranda and garden · portrait"], ["h", "Living room and large window · Landscape"], ["v", "Kitchen · Vertical"], ["s", "Stairs · narrow portrait"], ["v", "Bedroom · Portrait"], ["h", "Exterior and trees · landscape"], ["v", "Entrance · Vertical"]] });

  const oh = document.querySelector("[data-oh]");
  const areas = ["a", "b", "a", "c", "b", "a"];
  const ohScenes = ["Finished house exterior · eaves and garden", "Bright living room · wood floor", "Veranda and courtyard", "Tatami Room and Paper Window", "Kitchen and dining", "Entryway earthen floor"];
  const ohAll = areas.map((a, i) => `<li class="oh-slider__slide splide__slide" data-area="${a}"><a class="oh-card nj-zoom" href="#"><div class="oh-card__image"><div class="wf-img" data-label="${ohScenes[i]} · Landscape 4:3"></div></div><p class="oh-card__cat">Living tour event</p><p class="oh-card__title">Your tour event name here, one line</p><p class="oh-card__date nj-num">00/00 (Sat) ~ 00/00 (Sun)</p></a></li>`);
  oh.querySelector(".splide__arrows").innerHTML = arrowBtn("prev") + arrowBtn("next");
  const list = oh.querySelector("[data-oh-list]");
  let slider = null;
  const mount = (area) => {
    slider?.destroy(true);
    list.innerHTML = ohAll.filter((_, i) => area === "all" || areas[i] === area).join("");
    const count = list.children.length;
    oh.querySelector("[data-oh-total]").textContent = count;
    oh.querySelector("[data-oh-count]").textContent = count ? 1 : 0;
    const wide = matchMedia("(min-width: 768px)").matches;
    oh.querySelector(".oh-slider__nav").classList.toggle("is-hidden", wide ? count <= 3 : count <= 1);
    if (wide ? count <= 3 : count <= 1) { slider = null; return; }
    slider = new Splide(oh.querySelector(".splide"), { type: "loop", autoWidth: true, pagination: false, perPage: 1, mediaQuery: "min", speed: reduce ? 0 : 400, breakpoints: { 768: { perPage: 1 } } });
    slider.on("move", (i) => { oh.querySelector("[data-oh-count]").textContent = i + 1; });
    slider.mount();
  };
  oh.querySelectorAll("[data-area]").forEach((b) => b.addEventListener("click", () => {
    oh.querySelectorAll(".oh-slider__tag").forEach((t) => t.classList.toggle("is-current", t === b));
    mount(b.dataset.area);
  }));
  mount("all");

  const mhScenes = ["Glass-roof restaurant and greenery", "Leather chair in living room", "Bright kitchen and table", "Window sofa and deck", "Restaurant overlooking the courtyard", "Living room with wooden ceiling", "Kitchen counter", "Study beside the stairs"];
  document.querySelector("[data-mh-cards]").innerHTML = mhScenes.map((s, i) => `<li><a class="mh-card nj-zoom" href="#"><div class="mh-card__image"><div class="wf-img" data-label="${s} · 4:5"></div></div><div class="mh-card__content"><div class="mh-card__data"><p class="mh-card__area">Region ${i + 1}</p><p class="mh-card__title">Model house name</p></div><p class="mh-card__address">Your model house address in one line here</p></div></a></li>`).join("");

  // Photo enlarge — jumps straight (speed 0) to the pressed photo, then back to 1s
  const modal = document.querySelector("[data-modal]");
  modal.querySelector("[data-modal-list]").innerHTML = all.map(([k, label]) => `<li class="splide__slide sg-modal__slide is-${k}"><div class="wf-img" data-label="${label}"></div></li>`).join("");
  const ms = new Splide(modal.querySelector(".splide"), { type: "loop", speed: reduce ? 0 : 1000, perPage: 1, isNavigation: false, pagination: false, autoWidth: true });
  ms.mount();
  document.querySelectorAll(".sg__open").forEach((b) => b.addEventListener("click", () => {
    ms.options = { speed: 0 };
    ms.go(+b.dataset.index);
    ms.options = { speed: reduce ? 0 : 1000 };
    modal.classList.add("is-open");
  }));
  modal.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", () => modal.classList.remove("is-open")));
})();
