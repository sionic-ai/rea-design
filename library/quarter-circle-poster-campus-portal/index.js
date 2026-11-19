// First page motion — slider settings are the Swiper·Splide values from the original script.js.
(() => {
  const { swiper, round, decorate, initAccordions, $, $$ } = window.KWU;

  // Feature grid: cells 1·6 are the large cells, overlay color·opacity are the original nth-child values
  const F = [
    ["var(--kf-accent)", 0.5, "Campus Video", "City spread between sea and mountains", "Side view of a student walking along a riverside path · clear daytime, sea-blue tones · landscape 4:3", true],
    ["var(--site-tile-violet)", 0.72, "First campus", "Campus About", "Cafeteria round tables and windows · bright interior · landscape 4:3"],
    ["var(--site-tile-rose)", 0.72, "Second Campus", "Campus About", "Rest area with pink chairs · indoors · landscape 4:3"],
    ["var(--site-tile-green)", 0.72, "Clubs and societies", "A friend who leads to ”liking”", "Club group photo on a lawn · clear day · landscape 4:3"],
    ["var(--site-tile-orange)", 0.72, "Restaurant · Café", "A place that supports students’ everyday life", "Cafeteria serving counter and trays · warm lighting · landscape 4:3"],
    ["var(--kf-accent)", 0.5, "Your special feature name here", "Themed intro bundle", "Library reading desk by a large window · morning light · landscape 4:3", true],
    ["var(--site-tile-violet)", 0.72, "International exchange", "Learning that meets the world", "Students talking with a foreign professor · classroom · landscape 4:3"],
    ["var(--site-tile-pink)", 0.72, "Student Support", "Learning support program", "Student talking at a counseling desk · indoors · landscape 4:3"],
    ["var(--site-green)", 0.72, "Regional Partnership", "Activities with the town", "Smiling students at a market event · outdoors daytime · landscape 4:3"],
    ["var(--site-tile-orange)", 0.72, "Earning Qualifications", "Qualifications for your dream", "Close-up of student hands in a practice room · white light · landscape 4:3"],
  ];
  const grid = () => `<div class="fgrid">${F.map(([c, o, t, s, l, big], i) => `<a href="#" draggable="false" class="${big ? "is-big" : ""}" style="grid-area:i${i + 1};--c:${c};--o:${o}"><div class="wf-img" data-label="${l}"></div><b>${t}</b><small>${s}</small></a>`).join("")}</div>`;
  // Original Splide frame: .splide > .splide__track > .splide__list > Two cells (one grid each)
  $(".tfeat__sl").innerHTML = `<div class="splide__track"><div class="splide__list"><div class="splide__slide">${grid()}</div><div class="splide__slide">${grid()}</div></div></div>`;

  // Department list, three columns
  const D = [
    [["Literature Dept.", ["First Department", "Second Department", "Third Department", "Fourth department"]], ["Education Faculty", ["Education Department"]]],
    [["Home Economics Faculty", ["Home Economics Dept", "Registered dietitian training program"]], ["Dept. of Health and Welfare", ["Social Welfare Department", "Department of Health Sports Nutrition"], true]],
    [["Nursing Faculty", ["Nursing Department"]], ["Psychology Faculty", ["Psychology Department"]]],
  ];
  $(".dlinks").innerHTML = D.map((col) => `<div>${col.map(([h, items, note]) => `<h3>${h}</h3><ul>${items.map((t) => `<li><a href="#"><span>${t}</span>${round("is-s")}</a></li>`).join("")}</ul>${note ? '<p class="note"><a href="#">New department planned to open 0/0000</a><br>※ Add two lines of department restructuring notice here</p>' : ""}`).join("")}</div>`).join("");

  // News tab: twenty department names
  const tabs = ["Entire", "First Department", "Second Department", "Third Department", "Fourth department", "Education Department", "Home Economics Dept", "Dietitian program", "Social Welfare Department", "Department of Health Sports Nutrition", "Nursing Department", "Psychology Department", "Dept. of Home Economics", "Health Nutrition Research Dept", "Literature Studies Dept.", "Psychology research dept", "Dept. of Nursing", "Career support center", "Teaching career support center", "Student support center", "Library"];
  const head = $(".dnews__head");
  head.innerHTML = tabs.map((t, i) => `<button class="tabs__btn" aria-selected="${i === 0}">${t}</button>`).join("");
  const box = $("[data-dnews]");
  const rows = [["News", "0000.10.27", "The 4th Teaching Practice Research Exchange (Dept. No. 00)"], ["News", "0000.10.26", "Career guidance event held (Dept. issue No. 00)"], ["Event", "0000.10.26", "【Library】【Halloween Week Special】 Your two-line event title here"], ["News", "0000.10.26", "Year 1 roundtable (Part 1)"], ["News", "0000.10.26", "A graduate visited the school to teach daily living support skills"]];
  const paint = (k) => {
    box.innerHTML = `<ul class="news-list">${rows.map((r, i) => rows[(i + k) % rows.length]).map(([t, d, s]) => `<li><a href="news.html"><p class="news-list__head"><span class="tag">${t}</span><span class="date">${d}</span></p><p class="news-list__title">${s}</p></a></li>`).join("")}</ul>`;
  };
  paint(0);
  $$(".tabs__btn", head).forEach((b, i) => b.addEventListener("click", () => {
    $$(".tabs__btn", head).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    box.style.animation = "none";
    void box.offsetWidth;
    box.style.animation = "";
    paint(i);
  }));

  decorate();
  initAccordions();

  // Slider — Swiper 12.0.3 settings from the original script.js exactly as they are
  swiper($('[data-slider="hero"]'), { loop: true, mousewheel: true, speed: 600, pagination: { el: $("#hero-dots"), clickable: true }, autoplay: { delay: 3000, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: "auto", spaceBetween: 20 }, 768: { direction: "vertical", slidesPerView: 1, spaceBetween: 0 } } });
  swiper($('[data-slider="pickup"]'), { speed: 600, autoplay: { delay: 3000, disableOnInteraction: false }, breakpoints: { 0: { slidesPerView: "auto", spaceBetween: 10 }, 768: { loop: true, slidesPerView: "auto", spaceBetween: 20 } } });
  swiper($('[data-slider="event"]'), { slidesPerView: "auto", speed: 600, pagination: { el: $("#event-dots"), clickable: true }, breakpoints: { 0: { spaceBetween: 10 }, 768: { spaceBetween: 20 } } });
  swiper($('[data-slider="mag"]'), { slidesPerView: "auto", spaceBetween: 20, loop: true, speed: 600 });
  swiper($('[data-slider="dept"]'), { slidesPerView: "auto", loop: true, speed: 10000, autoplay: { delay: 0, disableOnInteraction: false } });
  // Feature: original Splide 4.1.4 + auto-scroll 0.5.3
  const feat = $('[data-slider="featured"]');
  if (feat && typeof Splide !== "undefined") {
    feat.classList.add("splide");
    new Splide(feat, { type: "loop", drag: "free", arrows: false, pagination: false, autoWidth: true, autoScroll: { speed: 1.5, pauseOnHover: false, pauseOnFocus: false } }).mount(window.splide.Extensions);
  }
})();
