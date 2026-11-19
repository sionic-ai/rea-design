// Home: draws five strengths, five courses and open campus cards in one form, and hooks up KV start marks, parallax, four Swipers (original initSlider), strength number nav and category filtering.
// Original values: KV gets is-kv-start .5s after the page opens · photo panel y 20% scrub (top top → bottom top) · strength numbers at the 50% screen line ·
// Swiper threshold 20 · category filtering is .1s fade out → rebuild → .3s fade in after a .05s delay.
(() => {
  const html = document.documentElement;
  const { reduced } = window.NC;

  const POINTS = [
    { en: "INDUSTRY", sub: ["Building ready-to-work strength ", "Industry-academia education"], p: "Explain in two or three lines the course built together with industry. Add one more line saying it tackles real assignments.", stats: [["Number of partner companies", 100, "… places or more"], ["Share of first-timers at enrollment", 76, "%"]], photo: "Corporate instructor and students · Lab room meeting · Landscape" },
    { en: "EQUIPMENT", sub: ["Latest ", "Facilities & Equipment"], p: "Your explanation here, about three lines, that you can freely use industry-standard equipment. Add one line on a setting where you can learn with peace of mind.", stats: [["Number of Computers", 479, "Large"], ["Gaming PC", 82, "Large"]], photo: "Gaming PC lab · Purple lighting · Wide landscape" },
    { en: "COURSE", sub: ["Building expertise ", "Diverse majors"], p: "Add a two-line description here: find your own dream in a broad major.", stats: [["Fields you can learn", 5, "Field"], ["Major", 21, "Major"]], photo: "Student’s hand drawing on a pen tablet · landscape" },
    { en: "CAMPUS LIFE", sub: ["Immersed in the work and enjoying it together ", "School life"], p: "One line here saying we hold many events through the year. One line here saying school festivals make for a fulfilling life.", stats: [["The year of learning through campus life", "3-4", "Year"]], photo: "Two students holding a menu board at a school festival · bright indoors · landscape" },
    { en: "SUPPORT", sub: ["Since enrollment ", "Career & debut support"], p: "Your two-line note here saying the school supports every job seeker to the very end, since its founding.", stats: [["Employment rate", 100, "%"], ["Debut Record", 8579, "Item"]], photo: "Students and staff in a career counseling session · office · landscape" },
  ];
  const body = document.querySelector(".nc-point__body");
  if (body) body.innerHTML = POINTS.map((pt, i) => `
    <article class="nc-point__row js-point-contents" id="point-${i + 1}">
      <div class="nc-point__media"><div class="swiper js-slider"><div class="swiper-wrapper">
        <a class="swiper-slide" href="#" data-fx="inset-clip-hover"><div class="wf-img" data-fx-part="media" data-label="${pt.photo}"></div></a>
        <a class="swiper-slide" href="#" data-fx="inset-clip-hover"><div class="wf-img" data-fx-part="media" data-label="${pt.en} Second photo · same place, different angle"></div></a>
      </div></div>
      <div class="nc-pager"><button class="nc-pager__btn js-slider-prev" type="button" aria-label="Previous"></button><div class="nc-pager__dots js-slide-pagination"></div><button class="nc-pager__btn -next js-slider-next" type="button" aria-label="Next"></button></div></div>
      <div class="nc-point__text">
        <h4 class="nc-point__no nc-en"><span>0${i + 1}.</span><b>${pt.en}</b></h4>
        <p class="nc-point__sub">${pt.sub[0]}<em>${pt.sub[1]}</em></p>
        <p class="nc-point__p">${pt.p.replace("\n", "<br>")}</p>
        <dl class="nc-stats">${pt.stats.map(([k, v, u]) => `<div class="nc-stats__row"><dt>${k}</dt><dd>${typeof v === "number" ? `<span class="js-count" data-to="${v}" data-duration="1000">0</span>` : v}<small>${u}</small></dd></div>`).join("")}</dl>
        <a class="nc-btn" href="#">See more</a>
      </div>
    </article>`).join("");

  const COURSES = [
    { k: "game", en: "GAME WORLD", jp: "Game world", copy: ["Your game-making workflow here", "Wording about learning from the beginning"], majors: 6, photo: "Game development class · pink and purple neon · wide landscape" },
    { k: "illust", en: "ILLUST·DESIGN·ANIME WORLD", jp: "Illustration, design and animation world", copy: ["Drawing a one-of-a-kind world", "Become a highly skilled creator!"], majors: 6, photo: "Character illustration original art and student drawing · orange light · wide landscape" },
    { k: "cg", en: "CG·MOVIE WORLD", jp: "CG·Video World", copy: ["Learn 3DCG and video editing", "Master professional skills"], majors: 4, photo: "Dinosaur CG and a student wearing a headset composite · purple · wide landscape" },
    { k: "e-sports", en: "E-SPORTS WORLD", jp: "eSports World", copy: ["Aiming to Go Pro", "Learn esports comprehensively"], majors: 2, photo: "Player wearing a headset · green stadium lighting · wide horizontal" },
    { k: "ai", en: "AI·IT TECHNOLOGY WORLD", jp: "AI·IT Tech World", copy: ["Learn from the basics to system development", "As an expert of the next generation"], majors: 4, photo: "Security icon screen and robot · blue glow · wide landscape" },
  ];
  const cbody = document.querySelector(".nc-course__body");
  if (cbody) cbody.innerHTML = COURSES.map((c) => `
    <article class="nc-cw" data-course="${c.k}" data-fx-part="item" data-key="${c.k}" style="--fx-color: var(--nc-course)">
      <div class="nc-cw__inner">
        <header class="nc-cw__head"><h4 class="nc-cw__en nc-en">${c.en}</h4><p class="nc-cw__jp">${c.jp}</p></header>
        <div class="nc-cw__visual js-onscreen"><div class="wf-img" data-label="${c.photo}"></div><p class="nc-cw__copy"><span>${c.copy[0]}</span><span>${c.copy[1]}</span></p></div>
        <div class="nc-cw__panel"><ul class="nc-cw__list">${Array.from({ length: c.majors }, (_, j) => `<li><a class="nc-cw__item" href="#"><span class="nc-tag${j % 3 === 2 ? " -green" : ""}">${j % 3 === 2 ? "3-year program" : "4-year program"}</span><span class="nc-tag -line">${j % 3 === 2 ? "Specialist firm" : "Advanced specialist firm"}</span><span class="nc-ul">Your major name $ here{j + 1}</span><span class="nc-circle" data-color="white"></span></a></li>`).join("")}</ul></div>
        <a class="nc-btn" href="#">See more</a>
      </div>
    </article>`).join("");
  // Back marquee rows: the same English text six times per row (same count as the original)
  document.querySelectorAll(".nc-course__rows").forEach((set) => {
    set.innerHTML = COURSES.map((c) => `<div class="nc-course__row" data-fx-part="row">${`<span>${c.en}</span>`.repeat(6)}</div>`).join("");
  });

  const OC = [
    ["all", "Your welcome trial class title for first-time visitors goes here", "Your experience details here in one or two lines."],
    ["game", "Game character designer experience", "Your description of the experience of drawing the character here."],
    ["game", "Game programmer experience", "Your description here of a hands-on experience making a simple game."],
    ["illust", "Illustrator experience", "Description of an experience of drawing original artwork here."],
    ["cg", "3DCG designer experience", "Your description of the experience of making 3D models here."],
    ["e-sports", "Esports event operations experience", "Your description here of the hands-on experience of running a contest."],
    ["ai", "White hat hacker experience", "Describe the hands-on security experience."],
    ["guidance", "Admissions counseling fair · School info session", "Your one-line consultation session notice here."],
  ];
  const wrap = document.querySelector(".js-carousel .swiper-wrapper");
  if (wrap) wrap.innerHTML = OC.map(([k, t, p], i) => `
    <div class="swiper-slide nc-oc__slide js-oc-slide" data-course="${k}">
      <div class="nc-oc__card" data-course="${k}"><div class="nc-fadeup js-onscreen">
        <div class="wf-img" data-label="Trial class poster ${i + 1} · Field-color background with a student · landscape"></div>
        <div class="nc-oc__body"><h4>${t}</h4><p>${p}</p><p class="nc-oc__dates">00/00 (Sat) · 00/00 (Sun)</p></div>
        <a class="nc-btn" href="#">View details</a>
      </div></div>
    </div>`).join("");

  // Swiper — the four kinds of the original initSlider
  const common = { threshold: 20 };
  const sliders = () => {
    document.querySelectorAll(".js-slider").forEach((el) => {
      const box = el.parentElement;
      new Swiper(el, { ...common, slidesPerView: 1, spaceBetween: 0, navigation: { nextEl: box.querySelector(".js-slider-next"), prevEl: box.querySelector(".js-slider-prev") }, pagination: { el: box.querySelector(".js-slide-pagination"), clickable: true, type: "bullets" } });
    });
    const thumbs = new Swiper(".js-slider-thumbs", {
      ...common, loop: false, slidesPerView: 4, spaceBetween: 10, watchSlidesProgress: true,
      on: { click(s) {
        const k = s.clickedIndex, vis = s.params.slidesPerView, a = s.activeIndex;
        if (k === undefined) return;
        if (k >= a + vis - 1) s.slideTo(k - vis + 2);
        else if (k === a) s.slideTo(k - 1);
      } },
    });
    new Swiper(".js-slider-thumbs-main", { ...common, slidesPerView: 1, thumbs: { swiper: thumbs }, navigation: { nextEl: ".js-thumbs-next", prevEl: ".js-thumbs-prev" }, pagination: { el: ".js-thumbs-pagination", clickable: true } });
    new Swiper(".js-slider-banner", { ...common, slidesPerView: 1, spaceBetween: 40, navigation: { nextEl: ".js-slider-banner-next", prevEl: ".js-slider-banner-prev" }, breakpoints: { 600: { slidesPerView: 1 }, 1180: { slidesPerView: 2 } } });
  };
  const carousel = () => new Swiper(".js-carousel", { ...common, loop: false, slidesPerView: 1, navigation: { nextEl: ".js-carousel-next", prevEl: ".js-carousel-prev" }, breakpoints: { 600: { slidesPerView: 2 }, 1180: { slidesPerView: 3 } } });

  // Category filter — original initCategoryFilter
  const filter = () => {
    const cats = document.querySelectorAll(".js-oc-category-item"), box = document.querySelector(".js-oc-slider"), slides = document.querySelectorAll(".js-oc-slide"), car = document.querySelector(".js-carousel");
    cats.forEach((item) => item.addEventListener("click", (e) => {
      e.preventDefault();
      cats.forEach((c) => c.classList.remove("is-active"));
      item.classList.add("is-active");
      const sel = item.dataset.course;
      gsap.to(box, { autoAlpha: 0, duration: reduced ? 0 : 0.1, onComplete() {
        slides.forEach((s) => {
          const on = sel === "all" || s.dataset.course === sel;
          s.classList.toggle("is-inactive", !on);
          s.classList.toggle("swiper-slide", on);
        });
        car.swiper?.destroy(true, true);
        carousel();
        gsap.to(box, { autoAlpha: 1, duration: reduced ? 0 : 0.3, delay: 0.05 });
      } });
    }));
  };

  // Strength number — lights the number of the strength crossing the 50% line of the screen
  const pointNav = () => {
    const secs = document.querySelectorAll(".js-point-contents"), items = document.querySelectorAll(".js-point-nav-item");
    const on = () => {
      let k = -1;
      secs.forEach((s, i) => { const r = s.getBoundingClientRect(); if (r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5) k = i; });
      items.forEach((it, i) => it.classList.toggle("is-current", i === k));
    };
    addEventListener("scroll", on, { passive: true });
    on();
  };

  NC.onReady(() => {
    // Creating the six flip boards in the very frame the opening board clears delays the clearing — wait one Tempo
    setTimeout(() => { sliders(); carousel(); }, 0);
    filter();
    pointNav();
    NC.watch(document.querySelector("main"));
    // The original Kv is built when the page opens (behind the opening screen) — parts are attached then. is-kv-start after .5s, first slide after 1s (start 1000)
    document.querySelector(".nc-kvt")?.setAttribute("data-fx", "scatter-orbit-zoom");
    setTimeout(() => html.classList.add("is-kv-start"), reduced ? 0 : 500);
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(".nc-kvt__slider", { y: "20%", ease: "none", scrollTrigger: { trigger: ".nc-kvt", start: "top top", end: "bottom top", scrub: true } });
    });
  });
})();
