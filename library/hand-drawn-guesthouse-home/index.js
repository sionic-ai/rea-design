// First page only — three rooms (photo ring + small photo row), two hero photo boards, public transit route illustration.
// Load before shared.js so scroll-reveal and same-page links also attach to newly built room blocks.
(() => {
  const rooms = [
    { no: "stay 01", name: "Tinted Mountain", yomi: "Autumn Mountain", text: "A room charming for its calm private space that keeps the clay walls and old doors, and for a single mattress that is comfortable to sleep on. Good for two to stay quietly.", num: "2", pay: "00,000", unit: "KRW (tax incl.) ~", att: "※ Listed prices are per night for 2 guests.<br>Single-person use has a different rate.", shots: ["Two single beds in a clay-walled room · low lamp · 3:2 landscape", "One side of a room with lattice window · Daytime · Landscape 3:2", "Tatami and low table · morning · landscape 3:2", "Sliding door at room entrance · shade · landscape 3:2", "Bedside lamp · night · landscape 3:2", "Courtyard tree outside window · Daytime · Landscape 3:2"] },
    { no: "stay 02", name: "Sleeping mountain", yomi: "Winter mountain", text: "A round ceiling like a cave lets you enjoy the coziness. It’s a shared room, so women only. Each bed has a curtain.", num: "4", pay: "0,000", unit: "Won (tax included) / 1 bed", att: "※ Listed rates are per night for one bed.", shots: ["Bunk bed under a vaulted ceiling · warm light · landscape 3:2", "Bed curtain and ladder · daytime · 3:2 landscape", "Shared shelf and mirror · daytime · landscape 3:2", "Bunk bed by the window · morning · landscape 3:2", "Domed ceiling clay wall · shade · landscape 3:2", "Small lamp by the bed · night · landscape 3:2"] },
    { no: "stay 03", name: "Green mountain", yomi: "Summer mountain", text: "A room where you feel the charm of old houses, like an alcove and a carved transom. Suited to families or groups.", num: "5", pay: "00,000", unit: "KRW (tax incl.) ~", att: "※ Listed rates are the lowest rate per room per night<br>Fees change depending on the number of people.", shots: ["Spacious tatami room with sliding doors · daytime · landscape 3:2", "Display alcove and flowers · shade · landscape 3:2", "Room opening onto the veranda · afternoon · landscape 3:2", "Bedding under a lattice transom · evening · landscape 3:2", "Hallway beyond a sliding paper door · daytime · landscape 3:2", "Old wardrobe and lamp · evening · landscape 3:2"] },
  ];
  const ico = '<svg class="nt-ico" viewBox="0 0 40 32" width="40" height="32" aria-hidden="true"><rect x="2" y="5" width="28" height="24" rx="2"/><path d="M2 11h28M9 2v6M23 2v6M7 16h3M14 16h3M21 16h3M7 22h3M14 22h3"/><circle cx="31" cy="24" r="7" fill="var(--kf-accent-soft)"/><path d="M31 20.5V24l2.5 1.8"/></svg>';
  const box = document.querySelector(".nt-units");
  if (box) box.innerHTML = rooms.map((r, i) => `<div class="nt-unit n${i + 1}">
      <div class="nt-unit__text">
        <div class="nt-unit__no nt-e">${r.no}</div>
        <h3 class="nt-unit__h">${r.name}<span>${r.yomi}</span></h3>
        <p>${r.text}</p>
        <div class="nt-np nt-flex"><div class="nt-np__num">Garden<span class="nt-e">${r.num}</span>Name</div><div class="nt-np__pay">Fee<span class="nt-e">${r.pay}</span>${r.unit}</div></div>
        <div class="nt-unit__att">${r.att}</div>
        <a class="nt-unit__rsv nt-e" href="#">${ico}reservation</a>
      </div>
      <div class="nt-unit__slide">
        <div class="swiper-container nt-ss nt-ss${i + 1}"><div class="swiper-wrapper">${r.shots.map((s) => `<div class="swiper-slide"><span class="wf-img" data-label="${s}"></span></div>`).join("")}</div></div>
        <div class="nt-thumb"><div class="swiper-container nt-thumb${i + 1}"><div class="swiper-wrapper">${r.shots.map((s) => `<div class="swiper-slide"><span class="wf-img" data-label="${s.split(" · ")[0]}"></span></div>`).join("")}</div></div></div>
      </div>
    </div>`).join("");

  // Public transit route art — start station cell on the left, horizontal line (express portion), two transfer station pillars, and the lodging pillar at the end
  const route = document.querySelector(".nt-route");
  if (route) {
    const from = [["Subway line", "Departure Station 1", 46, "a"], ["Four-season line", "Departure Station 2", 63, "b"], ["Four-season line", "Departure Station 3", 20, "b"], ["Four-season line", "Departure Station 4", 17, "c"], ["Four-season line", "Departure Station 5", 42, "c"], ["Four-season line", "Departure Station 6", 18, "c"], ["Airport", "Airport", 60, "d"]];
    const H = 86, top = 20;
    let s = '<svg viewBox="0 0 960 643" role="img" aria-label="Route diagram showing minutes from the departure station via the transfer station to the lodging">';
    from.forEach(([line, st, min, k], i) => {
      const y = top + i * H;
      s += `<rect class="nt-route__st is-${k}" x="0" y="${y}" width="96" height="38" rx="3"/><text class="nt-route__sm" x="48" y="${y + 15}">${line}</text><text class="nt-route__nm" x="48" y="${y + 30}">${st}</text>`;
      const x2 = i === 6 ? 470 : i === 5 ? 590 : 300;
      s += `<path class="nt-route__ln" d="M96 ${y + 19}H${x2}"/><text class="nt-route__min" x="${(96 + x2) / 2}" y="${y + 13}">${i === 6 ? "Express bus " : i < 5 ? "Express " : ""}${min}Minute</text>`;
    });
    s += `<rect class="nt-route__bar" x="300" y="${top}" width="60" height="${H * 5 - 8}" rx="3"/><text class="nt-route__v" x="330" y="${top + 70}">Transfer station</text>`;
    s += `<path class="nt-route__ln" d="M360 ${top + 110}H470"/><text class="nt-route__min" x="415" y="${top + 104}">6 min</text>`;
    s += `<rect class="nt-route__bar" x="470" y="${top}" width="60" height="${H * 6 - 8}" rx="3"/><text class="nt-route__v" x="500" y="${top + 70}">Nearest station</text>`;
    s += `<rect class="nt-route__bus" x="470" y="${top + H * 6}" width="60" height="38" rx="3"/><text class="nt-route__nm" x="500" y="${top + H * 6 + 24}">Bus stop</text>`;
    s += `<path class="nt-route__ln is-walk" d="M530 ${top + 60}H880M530 ${top + H * 6 + 19}H880"/><text class="nt-route__min" x="700" y="${top + 54}">3 min on foot</text><text class="nt-route__min" x="700" y="${top + H * 6 + 13}">15 min on foot</text>`;
    s += `<rect class="nt-route__end" x="880" y="${top}" width="64" height="${H * 7 - 8}" rx="3"/><text class="nt-route__v is-end" x="912" y="${top + 60}">Lodging inn name</text></svg>`;
    route.innerHTML = s;
  }

  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Two photo boards in the hero — 3s fade every 4 seconds, starting 1.5s after load
  const fade = (sel) => {
    if (document.querySelectorAll(`${sel} .swiper-slide`).length < 2) return;
    const sw = new Swiper(sel, { loop: true, effect: "fade", autoplay: { delay: 4000, disableOnInteraction: false }, speed: 3000 });
    sw.autoplay.stop();
    if (!reduce) addEventListener("load", () => setTimeout(() => sw.autoplay.start(), 1500));
  };
  fade(".nt-fv__main");
  fade(".nt-fv__subs");
  // Room photos — a small photo row (4 cells · 10px) and a linked fade loop. It runs when the room block comes within 100px of the screen bottom and stops when it leaves
  rooms.forEach((_, i) => {
    const thumb = new Swiper(`.nt-thumb${i + 1}`, { slidesPerView: 4, spaceBetween: 10, freeMode: true, watchSlidesProgress: true });
    const ss = new Swiper(`.nt-ss${i + 1}`, { loop: true, effect: "fade", autoplay: { delay: 4000, disableOnInteraction: false }, thumbs: { swiper: thumb }, speed: 3000 });
    ss.autoplay.stop();
    const unit = document.querySelector(`.nt-unit.n${i + 1}`);
    if (reduce) return;
    $(window).on("scroll", () => {
      const pos = $(unit).offset().top - $(window).innerHeight() + 100;
      if ($(window).scrollTop() > pos) ss.autoplay.start(); else ss.autoplay.stop();
    });
  });
})();
