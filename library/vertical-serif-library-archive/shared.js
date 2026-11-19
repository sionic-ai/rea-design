// Shared by three pages: filling repeating slots (book spread · snack card · photo strip), menu panel, same-page links, float-up when visible,
// Photo panel (magnific-popup) and Swipers. Values are the original libs.js and home.js settings as they are.
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── Repeating slots ─────────────────────────────────────────────
  const BOOKS = [
    { id: "book1", kana: "West", name: "【Cool Peaks Journey】", pages: ["Yellow cover spread · Green mountain illustration"] },
    { id: "book2", kana: "Second", name: "【Chocolate Classics Journey】", pages: ["Chestnut-brown cover spread · gold foil pattern"] },
    { id: "book3", kana: "Fortune", name: "[Peach Castella Tour]", pages: ["Pink cover spread · peach illustration"] },
    { id: "book4", kana: "Star", name: "【Starry Matcha Journey】", pages: ["Navy cover spread · tea leaf illustration"] },
  ];
  // The original puts the cover on the last page and starts at the end, a right-opening book flipped toward ‹Previous›
  const bookSlides = (b) =>
    [3, 2, 1].map((n) => `<div class="swiper-slide"><div class="inner"><span class="wf-img sk-page sk-page--spread" data-label="Body ${n * 2}~${n * 2 + 1}Page spread · illustration and vertical text · straight-on scan · landscape 3:2"></span></div></div>`).join("") +
    `<div class="swiper-slide"><div class="inner"><span class="wf-img sk-page sk-page--cover" data-label="${b.pages[0]} · Front scan · Portrait 3:4"></span></div></div>`;
  const bookHTML = (b, sp) => `
    <div class="sk-book-detail sk-rise" id="${b.id}">
      <div class="sk-book-detail-head"><p class="sk-book-detail-head__kana">${b.kana}</p><p class="sk-book-detail-head__name">${b.name}</p></div>
      <div class="sk-book-detail__${sp ? "sp" : "pc"}">
        <div class="swiper sk-book-detail__slider">
          <div class="swiper-wrapper">${bookSlides(b)}</div>
          <button class="sk-pager sk-pager--prev swiper-button-prev" type="button" aria-label="Previous page"></button>
          <button class="sk-pager sk-pager--next swiper-button-next" type="button" aria-label="Next page"></button>
        </div>
      </div>
    </div>`;
  const SWEETS = [
    { pre: "Spring", ttl: "Jade bead", txt: "Three vertical lines introducing the sweet go here. A spring sweet made with tea leaves.", img: "A single green Japanese sweet · deep navy bowl · side light · landscape 3:2", buy: true },
    { pre: "Autumn", ttl: "Night matcha<br>Sponge cake", txt: "Three vertical lines introducing the sweet go here. Made with astringent-skin chestnuts.", img: "Matcha castella cross-section · chestnut pieces · from above · landscape 3:2", buy: true },
    { pre: "Summer", ttl: "Cool Peak<span>(Summer snack)</span>", txt: "Your snack introduction goes here in three vertical lines.", img: "Lemon cookies · yellow lemon garnish · light background · horizontal 3:2", buy: true },
    { pre: "All seasons", ttl: "Chocolate<br>Classic", txt: "Your snack introduction goes here in two vertical lines.", img: "Chocolate castella box · black background · front view · landscape 3:2", note: "This season’s sales have ended" },
    { pre: "Winter", ttl: "Peach<br>Sponge cake", txt: "Your snack introduction goes here in three vertical lines.", img: "Peach-shaped castella cake · pink · from above · landscape 3:2", buy: true },
    { pre: "Tea house", ttl: "Tea house name", txt: "Your tea house introduction in three vertical lines here.", img: "Old tea house interior · red chairs · warm lighting · landscape 3:2", note: "Your tea house address here" },
    { pre: "Tea house", ttl: "Tea house menu", txt: "Your menu introduction in two vertical lines here.", img: "Coffee cup and cake · wooden table · window light · landscape 3:2", note: "Your business hours here<br>Your day off here" },
  ];
  // Only on the phone snack page, one shop card is added after the seven snacks (original shop275)
  const SHOP = { id: "sweets8", pre: "Shop", ttl: "Online shop", txt: "Your two vertical lines introducing the online shop here.", img: "A few gift boxes · white background · from above · landscape 3:2", note: "Your shipping info here" };
  const CAFE = { id: "shop1", pre: "Tea house", ttl: "Tea house name", txt: "Tea room intro in three vertical lines here. A place to rest while reading from the library.", img: "Old tea house interior · red chairs · warm lighting · landscape 3:2", note: "Your tea house address here" };
  const cardHTML = (c, i) => `
    <li class="sk-list__item sk-rise" id="${c.id || `sweets${i + 1}`}">
      <div class="sk-list__img"><span class="wf-img" data-label="${c.img}"></span></div>
      <div class="sk-list__inner">
        <p class="sk-list__pre">${c.pre}</p><h3 class="sk-list__ttl">${c.ttl}</h3><p class="sk-list__txt">${c.txt}</p>
        ${c.note ? `<ul class="sk-list-notes"><li class="sk-list-notes__item">${c.note}</li></ul>` : ""}
      </div>
      <div class="sk-list-btns"><div class="sk-list-btns__item${c.buy ? " is-buy" : ""}"><a href="#footer"><span>${c.buy ? "Go shopping (online store)" : "View website"}</span></a></div></div>
    </li>`;
  const GALLERY = [
    ["Star", "Tea leaf village · Tea field garden", "Person among tea fields · overcast day · landscape 2:1"],
    ["Star", "Jade beads · matcha castella", "A dish of matcha powder · black background · from above · landscape 2:1"],
    ["West", "Lemon field", "Lemon tree fruit · green · backlit · landscape 2:1"],
    ["West", "Cool Peak", "Sponge cake cross-section · yellow interior · from the side · landscape 2:1"],
    ["Second", "Old memorial hall · hill path", "Memorial hall on a hill · blue sky · landscape 2:1"],
    ["Second", "Chocolate Classic", "Chocolate snack cross-section · dark background · landscape 2:1"],
    ["Fortune", "Old Temple · Roof", "Tile roofs and village · clear daytime · landscape 2:1"],
    ["Fortune", "Peach castella", "Gloved hand trimming a snack · workshop · landscape 2:1"],
  ];
  const galleryHTML = () => GALLERY.map(([mds, name, img], i) => `
    <div class="sk-gallery__item sk-rise">
      <a class="sk-gallery-link" href="#gallery-${i + 1}">
        <div class="sk-gallery-head"><p class="sk-gallery-head__mds">${mds}</p><p class="sk-gallery-head__name">${name}</p></div>
        <span class="sk-gallery__img"><span class="wf-img" data-label="${img}"></span></span>
      </a>
      <div class="sk-gallery__popup mfp-hide" id="gallery-${i + 1}">
        <div class="swiper sk-gallery-slider">
          <div class="swiper-wrapper">${[1, 2, 3].map((n) => `
            <div class="swiper-slide"><div class="sk-gallery-slider__inner"><div class="sk-gallery-slider__wrap">
              <div class="sk-gallery-slider__img"><span class="wf-img" data-label="${name} Photo ${n} · ${img.split(" · ").slice(0, 2).join(" · ")} · Landscape 3:2"></span></div>
              <div class="sk-gallery-slider__notes"><p class="sk-gallery-slider__txt">Your one-line photo caption $ here{n}</p></div>
            </div></div></div>`).join("")}
          </div>
          <button class="sk-pager sk-pager--prev swiper-button-prev" type="button" aria-label="Previous photo"></button>
          <button class="sk-pager sk-pager--next swiper-button-next" type="button" aria-label="Next photo"></button>
          <div class="swiper-pagination"></div>
        </div>
      </div>
    </div>`).join("");

  const sp = document.body.dataset.page === "sp";
  $$("[data-books]").forEach((el) => (el.innerHTML = BOOKS.map((b) => bookHTML(b, sp)).join("")));
  $$("[data-sweets]").forEach((el) => (el.innerHTML = SWEETS.map(cardHTML).join("") + (el.dataset.sweets === "with-shop" ? cardHTML(SHOP, 7) : "")));
  $$("[data-cafe]").forEach((el) => (el.innerHTML = cardHTML(CAFE, 0)));
  $$("[data-gallery]").forEach((el) => (el.innerHTML = galleryHTML()));

  // ── When the loader ends (the original’s window load) release the transition ─────────
  addEventListener("load", () => document.body.classList.remove("sk-preload"));

  // ── Menu panel: the three-line button and the links in the panel both open and close it (links toggle too, as in the original) ──
  const nav = document.querySelector(".sk-nav");
  const toggle = () => {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("is-fixed", open);
  };
  nav?.querySelector(".sk-nav__toggle")?.addEventListener("click", toggle);
  $$(".sk-nav-list__item a").forEach((a) => a.addEventListener("click", toggle));

  // ── Same-page links — the original scrolls down with jQuery animate 500ms (swing) and does not block the default jump ──
  if (window.jQuery) {
    jQuery(document).on("click", 'a[href^="#"]:not(.sk-gallery-link)', function () {
      const t = jQuery(this.getAttribute("href"));
      if (!t.length) return;
      jQuery("body,html").stop().animate({ scrollTop: t.offset().top }, 500);
    });
  }

  // ── Float up when visible — attach when the element’s top edge touches the bottom of the screen, remove when it moves above ──
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fade = () => {
    const y = scrollY, h = innerHeight;
    $$(".sk-rise").forEach((el) => {
      const top = el.getBoundingClientRect().top + y;
      el.classList.toggle("is-risen", reduce || y >= top - h);
    });
  };
  addEventListener("scroll", fade, { passive: true });
  addEventListener("load", fade);

  // ── Phone header logo — turns red-bean color after passing the Hero ──
  const logo = document.querySelector(".sk-nav__logo");
  const mv = document.querySelector(".sk-mv");
  const onScroll = () => {
    if (!logo || !mv) return;
    logo.classList.toggle("is-scroll", scrollY > mv.offsetHeight - logo.offsetHeight);
  };
  addEventListener("scroll", onScroll, { passive: true });

  // Phone picker list
  $$(".sk-select__ttl").forEach((t) => t.addEventListener("click", () => {
    const open = !t.classList.contains("is-open");
    t.classList.toggle("is-open", open);
    t.nextElementSibling?.classList.toggle("is-open", open);
  }));
  $$(".sk-select-list__item a").forEach((a) => a.addEventListener("click", () => {
    const list = a.closest(".sk-select-list");
    list?.classList.remove("is-open");
    list?.previousElementSibling?.classList.remove("is-open");
  }));

  // ── Photo panel — original magnific-popup inline (overlay and panel open and close instantly) ──
  if (window.jQuery?.fn.magnificPopup) {
    jQuery(".sk-gallery-link").magnificPopup({ type: "inline", preloader: false, tClose: "Close (Esc)" });
  }

  // ── Swiper — original home.js settings ────────────────────────────────
  if (window.Swiper) {
    if (document.querySelector(".sk-mv__slider")) {
      new Swiper(".sk-mv__slider", {
        loop: true, speed: 2000, effect: "fade", allowTouchMove: false,
        autoplay: reduce ? false : { delay: 4000, disableOnInteraction: false },
        pagination: { el: ".swiper-pagination", clickable: true },
      });
    }
    if (document.querySelector(".sk-gallery-slider")) {
      new Swiper(".sk-gallery-slider", {
        loop: false, speed: 1000, autoHeight: true, effect: "fade",
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        pagination: { el: ".swiper-pagination", clickable: true },
      });
    }
    // The original gives the total slide count on the page − 1 as the first section — it overflows per volume and ends up starting at the last section (cover)
    if (document.querySelector(".sk-book-detail__slider")) {
      new Swiper(".sk-book-detail__slider", {
        loop: false, speed: 1000, effect: "fade",
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        initialSlide: document.querySelectorAll(".swiper-slide").length - 1,
      });
    }
  }
})();
