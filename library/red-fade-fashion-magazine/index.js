// First page — hero slick fade (every 2.5s · transition 1.6s · doesn’t pause on hover), tarot card·inspiration photo strip fill (flow is the motion part crawl-snap-flow),
// Series tabs (on PC the tilt-pair-tabs motion part, on phone a slideToggle 400ms accordion)
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Tarot card row — alternates backs (navy border pattern) and fronts (oval picture), redrawing same-size pictures like the original ----------
  const back = () => `<svg viewBox="0 0 203 234" aria-hidden="true"><rect x="22" y="4" width="159" height="226" rx="10" class="gh-card-back"/>
    <rect x="32" y="14" width="139" height="206" rx="6" class="gh-card-line"/><path class="gh-card-line" d="M101 40c-24 30-24 124 0 154 24-30 24-124 0-154zM60 117c30-22 52-22 82 0-30 22-52 22-82 0z"/>
    <circle cx="101" cy="117" r="9" class="gh-card-dot"/><circle cx="58" cy="44" r="3" class="gh-card-dot"/><circle cx="144" cy="44" r="3" class="gh-card-dot"/><circle cx="58" cy="190" r="3" class="gh-card-dot"/><circle cx="144" cy="190" r="3" class="gh-card-dot"/></svg>`;
  const face = (sky, name) => `<svg viewBox="0 0 203 234" aria-hidden="true"><ellipse cx="101" cy="117" rx="80" ry="108" class="gh-card-face"/>
    <clipPath id="tc-${name}"><ellipse cx="101" cy="117" rx="72" ry="100"/></clipPath>
    <g clip-path="url(#tc-${name})"><rect x="20" y="10" width="170" height="220" class="gh-card-sky ${sky}"/><path class="gh-card-ground" d="M20 170c40-20 120-26 170-6v70H20z"/>
    <circle cx="101" cy="78" r="16" class="gh-card-dot"/><path class="gh-card-line" d="M86 98c-6 24-4 50 4 70h22c8-20 10-46 4-70z"/></g>
    <text x="101" y="214" text-anchor="middle" class="gh-card-name">${name}</text></svg>`;
  const CARDS = [back(), face("", "THE STAR"), face("is-red", "THE EMPEROR"), back(), back(), face("is-gold", "THE MAGICIAN"), face("is-gold", "THE SUN"), back(), face("", "THE MOON"), face("is-red", "STRENGTH"), back(), face("is-gold", "THE WORLD")];
  const tarot = document.querySelector("[data-gh-tarot]");
  if (tarot) tarot.innerHTML = CARDS.map((c, i) => `<div class="swiper-slide" data-label="Tarot card illustration ${i + 1} · Navy pattern on the back or oval illustration on the front">${c}</div>`).join("");

  // ---------- Inspiration photo strip ----------
  const INSP = [
    ["Full-body person in a hat · floral dress · white wall", "230 / 318"], ["Hand tying a hair tie · red ring · dark background", "230 / 300"], ["Face of person in pink sunglasses · strong daylight", "230 / 330"],
    ["Full-length person in a cream dress · blue tassel detail · white wall", "230 / 318"], ["Person in a floral dress · cherry earrings · white wall", "230 / 304"], ["Legs in sandals and blue feather skirt · from above", "230 / 318"],
    ["Hair of a person lying on the floor · overcast light", "230 / 300"], ["Person in a red knit from behind · by the window", "230 / 318"], ["Profile of person with glasses · yellow background", "230 / 312"],
  ];
  const insp = document.querySelector("[data-gh-insp]");
  if (insp) insp.innerHTML = INSP.map(([l, r]) => `<div class="swiper-slide"><span class="gh-ph" style="--r: ${r}"><span class="wf-img" data-label="${l} · Portrait 3:4"></span></span></div>`).join("");

  // ---------- Series — hovering a name row on the right swaps the two polaroids on the left ----------
  const REG = [
    { ja: "Snaps of stylish friends", en: "FASHION LOVER SNAP", sub: "Snaps of stylish friends", pic: "ID portrait against a white wall · white collar · frontal flash" },
    { ja: "Hidden niche address with a local feel", en: "LOCALIST ADDRESS", sub: "Neighborhood shops picked by locals", pic: "Neighborhood shop exterior · daytime sunlight · front view" },
    { en: "GIRLS' ASIA JOURNEY", latin: true, sub: "Asia travel diary", pic: "Alley market stall · Travel snapshot · Warm light" },
    { en: "Make-up is FASHION!", latin: true, sub: "Makeup series", pic: "Color makeup close-up · White background · Front view" },
    { ja: "A quirky mambo of the actor’s name!", en: "ACTOR'S MAMBO", sub: "Actor series", pic: "Actor upper body · flower prop · window light" },
    { en: "GIRLS' CINEMA CLUB", latin: true, sub: "Film talk club", pic: "Film still · night · film strip" },
    { en: "girl magazine sports club", latin: true, sub: "Sports Club", pic: "Three figures in sportswear · Playground · Daytime" },
    { en: "NAME by editors", latin: true, sub: "Editorial team diary", pic: "Still life on an editorial desk · From above" },
  ];
  const sticker = `<span class="gh-sticker" aria-hidden="true">＿人人人人人人人人人人人＿
› Series name snap ‹
￣Y^Y^Y^Y^Y^Y^Y^Y^Y^Y^￣<small>&lt;SERIES NAME&gt;</small></span>`;
  const photos = (r) => `<div class="gh-regular__photos">
      <span class="gh-pol" data-fx-part="photo"><span class="gh-ph"><span class="wf-img" data-label="${r.pic} · Instant-film photo · square"></span></span><span class="gh-pol__foot"></span>${sticker}</span>
      <span class="gh-pol" data-fx-part="photo"><span class="gh-ph"><span class="wf-img" data-label="${r.pic} Second shot · Polaroid · square"></span></span><span class="gh-pol__foot"></span></span>
    </div>`;
  const text = (r) => `<div class="gh-regular__text"><p class="gh-regular__en">${r.en}</p><p class="gh-regular__ja">${r.sub}</p></div>`;
  const panels = document.querySelector("[data-gh-regular-panels]");
  const nav = document.querySelector("[data-gh-regular-nav]");
  if (panels && nav) {
    panels.innerHTML = REG.map((r) => `<div data-fx-part="panel"><a class="gh-regular__link" href="list.html">${photos(r)}${text(r)}</a></div>`).join("");
    nav.innerHTML = REG.map((r, i) => `<a href="list.html" data-fx-part="tab"${r.latin ? ' class="is-en" lang="en" data-label="Series name (English)"' : ""}${i ? "" : ' aria-selected="true"'}>${r.latin ? r.en : r.ja}</a>`).join("");
    nav.firstElementChild.classList.add("is-active");
  }
  const acc = document.querySelector("[data-gh-regular-acc]");
  if (acc) {
    acc.className += " gh-acc";
    acc.innerHTML = REG.map((r, i) => `<button class="gh-acc__head${r.latin ? " is-en" : ""}${i ? "" : " is-open"}" type="button"><span>${r.latin ? r.en : r.ja}</span><i aria-hidden="true"></i></button>
      <div class="gh-acc__body"${i ? "" : ' style="display:block"'}>${text(r)}<div class="gh-acc__photos">${photos(r).replace(/ data-fx-part="photo"/g, "")}<a class="gh-all gh-acc__all" href="list.html">( view all <svg viewBox="0 0 13 13" aria-hidden="true"><path d="M2 11 11 2M4 2h7v7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>)</a></div></div>`).join("");
    const heads = [...acc.querySelectorAll(".gh-acc__head")];
    heads.forEach((h) => h.addEventListener("click", () => {
      const open = !h.classList.contains("is-open");
      heads.forEach((o) => { if (o !== h && o.classList.contains("is-open")) { o.classList.remove("is-open"); $(o.nextElementSibling).stop().slideUp(reduce ? 0 : 400); } });
      h.classList.toggle("is-open", open);
      $(h.nextElementSibling).stop()[open ? "slideDown" : "slideUp"](reduce ? 0 : 400);
    }));
  }

  // ---------- Hero slick ----------
  const $hero = $(".gh-hero__slider");
  const now = document.querySelector(".gh-hero [data-now]");
  const all = document.querySelector(".gh-hero [data-all]");
  const pad = (n) => String(n).padStart(2, "0");
  $hero.on("init", (e, slick) => { now.textContent = pad(slick.currentSlide + 1); all.textContent = pad(slick.slideCount); });
  $hero.on("beforeChange", (e, slick, cur, next) => { now.textContent = pad(next + 1); });
  $hero.slick({
    autoplay: !reduce,
    autoplaySpeed: 2500,
    speed: reduce ? 0 : 1600,
    fade: true,
    arrows: true,
    infinite: true,
    pauseOnHover: false,
    prevArrow: $(".gh-hero__arrow--prev"),
    nextArrow: $(".gh-hero__arrow--next"),
  });
})();
