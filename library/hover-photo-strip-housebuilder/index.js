// Home page — fills the four photo strips, showroom slider, event cards and news rows, and hooks up the slider
(() => {
  const { strip, roll } = window.nj;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const houses = [
    { name: "A home that brings the garden into daily life", isNew: true, area: "Area Name", shots: [["v", "Pendant light over dining table · gray plaster wall · portrait"], ["s", "Living room sofa corner · narrow portrait"], ["v", "Wooden door and round dining table · portrait"], ["v", "Kitchen cabinet and dining table · Portrait"], ["h", "Spacious dining room · gray floor · one window · landscape"], ["v", "Entrance sliding door · portrait"], ["s", "Window chair · Narrow portrait"]] },
    { name: "Your second house name here", area: "Area Name", shots: [["s", "Gravel yard · Narrow vertical"], ["h", "Veranda and wooden deck · Landscape"], ["v", "Kitchen window · vertical"], ["v", "Exterior seen from the alley · vertical"], ["h", "Tiled-roof house and garden · Landscape"], ["v", "White kitchen and dining table · vertical"], ["s", "Gas range and hood · narrow portrait"], ["v", "Restaurant pendant light · portrait"]] },
    { name: "Your third house name here", area: "Area Name", shots: [["h", "Alley-side exterior and fence · landscape"], ["v", "Kitchen · Vertical"], ["s", "Kitchen shelf · narrow portrait"], ["v", "Dining table and chairs · portrait"], ["h", "Garden-side window · landscape"], ["v", "Stairs · Vertical"], ["v", "Bedroom window · vertical"], ["s", "Washbasin · Narrow vertical"]] },
    { name: "Your fourth house name here", type: "Single-story house", area: "Area Name", shots: [["s", "Bookshelf · narrow portrait"], ["v", "Entrance Garden · Portrait"], ["v", "Concrete wall and tree · Portrait"], ["h", "Leather armchair and living room · landscape"], ["v", "Veranda · Portrait"], ["h", "Tatami Room · Landscape"], ["v", "Window plant pot · portrait"], ["s", "Bathhouse · Narrow vertical"]] },
  ];
  const strips = document.querySelector('[data-strips="home"]');
  strips.innerHTML = houses.map((h) => `<div class="gallery__section">${strip(h)}</div>`).join("");

  const areas = ["Region name 1", "Region name 2", "Region name 3", "Region name 4", "Region name 5", "Region name 6", "Region name 7", "Region name 8"];
  const scenes = ["Sunlit restaurant · wooden tables and chairs", "Gray-floored living room · large window", "Veranda overlooking the garden", "Tatami room and low table", "Kitchen closet and dining table", "Entrance and earthen wall", "2nd-floor study window seat", "Deck under the eaves"];
  document.querySelector("[data-mh-list]").innerHTML = areas.map((a, i) => `
    <li class="mh__slide splide__slide"><a class="mh__card nj-zoom" href="#">
      <div class="mh__image"><div class="wf-img" data-label="${scenes[i]} · Landscape 3:2"></div></div>
      <div class="mh__content"><div class="mh__area">${a}</div><div class="mh__data"><p class="mh__address">One line here for the model home address (housing exhibition hall name)</p><p class="mh__tel nj-num"><span>TEL</span>000-000-0000</p></div></div>
    </a></li>`).join("");

  const edge = '<svg viewBox="0 0 31 40" aria-hidden="true"><path d="M31 .5H13.5C5.6.5.5 6.4.5 20s5.1 19.5 13 19.5H31"/></svg>';
  const btn = (t, cls) => `<a class="nj-btn ${cls}" href="#"><span class="nj-btn__bg">${edge}${edge}</span>${roll(t)}</a>`;
  const events = [["Consultation session", "", "Sat · Sun · Mon · Holidays"], ["Consultation session", "Local Exclusive", "00/00 (Sat) ~ 00/00 (Mon)"], ["Consultation session", "Local Exclusive", "Reservation only"], ["Consultation session", "", "00/00 (Sat) ~ 00/00 (Mon)"], ["Consultation session", "Local Exclusive", "00/00 (Sat) ~ 00/00 (Sun)"], ["Consultation session", "Local Exclusive", "Reservation only"]];
  const evScenes = ["Bright living room dining table and chairs · daylight from many windows", "Courtyard garden and large windows", "Veranda chair and garden", "Wood-ceiling restaurant · round lamps", "Green garden beyond the courtyard", "Deck with leather chairs"];
  document.querySelector("[data-ev-list]").innerHTML = events.map(([cat, tag, date], i) => `
    <li class="ev__slide splide__slide"><div class="ev__card nj-zoom">
      <div class="ev__data"><p class="ev__cat">${cat}</p>${tag ? `<p class="ev__tag">${tag}</p>` : ""}</div>
      <a class="ev__image" href="#"><div class="wf-img" data-label="${evScenes[i]} · Landscape 4:3"></div></a>
      <div class="ev__schedules"><p class="ev__schedule nj-num">${date}</p></div>
      <h3 class="ev__title">Your consultation event name here</h3>
      <div class="ev__links"><div class="ev__link">${btn("View details", "is-light")}</div><div class="ev__link">${btn("Book now", "is-dark")}</div></div>
    </div></li>`).join("");

  const news = [[true, "Event", "New tour event info has been posted"], [true, "Column", "”Your column title here” is now out"], [false, "Event", "New tour event info has been posted"], [false, "Installation Cases", "Unveiled ”House name goes here”"], [false, "News", "Your website news in one line here"]];
  document.querySelector("[data-news]").innerHTML = news.map(([isNew, cat, title]) => `
    <li><a class="news__row" href="news.html"><div class="news__data">${isNew ? '<span class="news__new nj-num">NEW</span>' : ""}<time class="news__date nj-num">2026.00.00</time><p class="news__cat">${cat}</p></div><p class="news__title">${title}</p></a></li>`).join("");

  // Model house: centered loop, one step per 1s every 5 seconds
  const mh = document.querySelector("[data-mh]");
  const mhSplide = new Splide(mh, { type: "loop", speed: reduce ? 0 : 1000, autoplay: !reduce, interval: 5000, autoWidth: true, focus: "center", isNavigation: false, pagination: false });
  mhSplide.on("moved", (i) => { mh.querySelector("[data-mh-count]").textContent = i + 1; });
  mhSplide.mount();
  if (!reduce) mhSplide.Components.Autoplay.play();
  mh.querySelector("[data-mh-total]").textContent = mhSplide.length;

  // Event cards — loop slider on phones only, three-column grid (destroy) at 768px and up
  new Splide(document.querySelector("[data-ev]"), { type: "loop", autoWidth: true, isNavigation: false, pagination: false, mediaQuery: "min", arrows: false, breakpoints: { 768: { destroy: true } } }).mount();
})();
