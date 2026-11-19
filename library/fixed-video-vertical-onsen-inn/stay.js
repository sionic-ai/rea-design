// Rooms page — fills the room blocks (two kings, one twin), the connecting-room list and the loop map from the same data.
// Load before shared.js so the accordion button (.kz-acc) and the ‹1-second roll for same-page links› also apply to newly created elements.
(() => {
  const rooms = [
    { id: "anc_room1", name: "Star", en: "Hoshi", type: "king", spec: "Japanese-Western king bed / 00㎡ (indoor 00㎡ + open-air bath deck 00㎡)", catch: "The highest-situated room. The view from any window tints the time you two share.", shots: ["Wooden deck overlooking a tall forest · daytime · landscape 16:10", "Octagonal open-air bath and deck · daytime · landscape 16:10", "King bed by the window · evening · landscape 16:10"] },
    { id: "anc_room2", name: "Moon", en: "Tsuki", type: "king", spec: "Japanese-Western king bed / 00㎡ (indoor 00㎡ + open-air bath deck 00㎡)", catch: "Open-air bath opening onto the bedroom’s big window. A lounge chair by the entrance.", shots: ["Forest lodge exterior and eaves · overcast day · landscape 16:10", "Stone-wall bathroom and open-air bath · landscape 16:10", "Low bed and indirect lighting · night · landscape 16:10"] },
    { id: "anc_room3", name: "Forest", en: "Brand", type: "twin", spec: "Japanese-Western twin bed / 00㎡ (indoor 00㎡ + open-air bath deck 00㎡)", catch: "A fresh deck surrounded by forest. A guest room with two beds side by side.", shots: ["Twin beds and forest window · morning · landscape 16:10", "Deck surrounded by forest · daytime · landscape 16:10", "Sink and mirror · landscape 16:10"] },
  ];
  const dot = (t) => `<span class="kz-dots__d${t ? " is-" + t : ""}"></span>`;
  const block = (r) => `<section id="${r.id}" class="kz-room">
      <div class="kz-room__wrp">
        <h3 class="kz-vt kz-vt--24"><span class="kz-vt__jp">${r.name}</span><span class="kz-vt__en">${r.en}</span></h3>
        <p class="kz-dots kz-room__spec">${dot(r.type)}${r.spec}</p>
        <div class="splide kz-room-slider" aria-label="Room ‹${r.name}」 photo">
          <div class="splide__track"><ul class="splide__list">${r.shots.map((s) => `<li class="splide__slide"><span class="wf-img" data-label="${s}"></span></li>`).join("")}</ul></div>
          <div class="splide__arrows"><button class="splide__arrow splide__arrow--prev kz-room-slider__btn" type="button"></button><button class="splide__arrow splide__arrow--next kz-room-slider__btn" type="button"></button></div>
        </div>
        <div class="kz-room__flex">
          <div class="kz-room__txtbox">
            <p class="kz-room__catch">${r.catch}</p>
            <p class="kz-txt kz-room__txt">All the rooms are scattered across the mountainside. This one is among them. Write about four lines on the room’s features here. Describe in turn the view from the window, the shape of the open-air bath, the bed and furniture, and the pleasures of staying. Add one more line of body text here.</p>
            <p class="kz-room__btn"><a class="kz-btn" href="#">View this room’s rate plans</a></p>
          </div>
          <div class="kz-room__layout"><a class="kz-plan-open" href="media/plan.svg">
            <p class="kz-dots kz-room__lay">${dot("plan")}layout</p>
            <img src="media/plan.svg" alt="Room floor plan placeholder" width="400" height="320">
          </a></div>
        </div>
        <div class="kz-room__acc"><dl>
          <dt class="kz-acc kz-room__accbtn"><p class="kz-dots">${dot("")}Facilities · Amenities</p></dt>
          <dd class="kz-room__nakami"><div class="kz-room__inner">
            <p class="kz-dots">${dot(r.type)}Free Wi-Fi / Steps indoors, non-smoking throughout including the deck</p>
            <div class="kz-room__list">
              <ul><li>Custom wide bed</li><li>Hair dryer</li><li>Electric kettle</li><li>Refrigerator</li></ul>
              <ul><li>Bath towel · towel</li><li>Loungewear</li><li>Toothbrush Set</li><li>Shampoo · Conditioner</li></ul>
              <ul><li>Bluetooth speaker</li><li>Coffee machine</li><li>Air purifier</li><li>Safe</li></ul>
            </div>
            <div class="kz-room__rental"><p class="kz-dots">${dot(r.type)}Items we lend</p><p class="kz-txt">Your rental item here in one line.</p></div>
          </div></dd>
        </dl></div>
      </div>
    </section>`;
  const p1 = document.getElementById("panel01"), p2 = document.getElementById("panel02");
  if (p1) p1.innerHTML = rooms.filter((r) => r.type === "king").map(block).join("");
  if (p2) p2.innerHTML = rooms.filter((r) => r.type === "twin").map(block).join("");

  // Attached room list — rooms (King·Twin by dot color), hot spring·detail
  const anc = document.querySelector(".kz-anc ul");
  if (anc) {
    anc.innerHTML = rooms.map((r) => `<li><a href="#${r.id}" data-panel="${r.type === "twin" ? "#panel02" : "#panel01"}">${dot(r.type)}${r.name}</a></li>`).join("")
      + `<li><a href="#onsen">${dot("amenity")}Hot spring</a></li><li><a href="#detail">${dot("amenity")}Details</a></li>`;
  }

  // Ring map — a wooden band curving around the empty center and room name chips (original chip positions as % of map size)
  const ring = document.querySelector(".kz-ring");
  if (ring) {
    const g = ring.querySelector(".kz-ring__trees");
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 150; i++) {
      const a = rnd() * Math.PI * 2, rr = 110 + rnd() * 70;
      const x = 245 + Math.cos(a) * rr, y = 150 + Math.sin(a) * rr * 0.72;
      g.insertAdjacentHTML("beforeend", `<circle class="t${i % 3}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(7 + rnd() * 10).toFixed(1)}"/>`);
    }
    const chips = [[93, 62, "Star", "#anc_room1"], [152, 47, "Forest", "#anc_room3"], [196, 56, "Sunlight"], [236, 75, "Moon", "#anc_room2"], [270, 93, "Light"], [323, 109, "Pine"], [347, 136, "Grass"], [318, 161, "Water"], [304, 198, "Hill"], [270, 217, "Grain"], [245, 180, "Always"],
      [187, 130, "Lounge"], [157, 204, "Sauna"], [290, 446, "Main building"], [319, 514, "Parking Lot"]];
    ring.insertAdjacentHTML("beforeend", chips.map(([x, y, t, h]) => `<p class="kz-ring__chip${t.length > 1 ? " is-wide" : ""}" style="left:${(x / 491 * 100).toFixed(2)}%;top:${(y / 618 * 100).toFixed(2)}%"><a href="${h || "#rooms"}">${t}</a></p>`).join(""));
  }

  const $ = window.jQuery;
  $(() => {
    // Room photos — original Splide loop, every 7 seconds over 3 seconds, the next slide peeks in on the right (600·400·200·80px by width)
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll(".kz-room-slider").forEach((el) => {
      new Splide(el, {
        type: "loop", pagination: false, autoplay: !reduce, interval: 7000, pauseOnHover: false, pauseOnFocus: false, speed: 3000,
        rewind: true, gap: 10, padding: { left: 0, right: 600 }, perPage: 1,
        breakpoints: { 1450: { padding: { left: 0, right: 400 } }, 1025: { padding: { left: 0, right: 200 } }, 767: { gap: 10, padding: { left: 0, right: 80 } } },
      }).mount();
    });

    // Tab — 200ms after pressing, the chosen panel fades in over 100ms, the rest are hidden
    const $li = $(".kz-tabs__bar li");
    $li.on("click", function () {
      const target = $(this).attr("data-target");
      setTimeout(() => {
        $(target).fadeIn(reduce ? 0 : 100).siblings(".kz-panel").hide();
        $li.removeClass("is-active");
        $(this).addClass("is-active");
      }, 200);
    });
    $("#panel02").hide();
    // Clicking a room that belongs to another board in the list switches the board first
    $(".kz-anc a[data-panel]").on("mousedown touchstart", function () {
      const p = $(this).attr("data-panel");
      if ($(p).is(":hidden")) { $li.filter(`[data-target="${p}"]`).addClass("is-active").siblings().removeClass("is-active"); $(p).show().siblings(".kz-panel").hide(); }
    });
  });
  $(window).on("load", () => { $(".kz-plan-open").magnificPopup({ mainClass: "mfp-fade", type: "image" }); });
})();
