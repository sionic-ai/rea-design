// Frame shared by all pages — fixed header bar, vertical lines on both sides, menu drawer, transport section, sea booking strip and footer are filled into [data-yu] slots.
// Motion is handled by the motion parts (fade-slide-drawer, marquee, step-loop-carousel, studio-appear), and this file only sets up the frame.
// Must load before fx-core.js, which scans parts, so filled-in frames get parts attached too.
(() => {
  const I = {
    arrow: '<svg viewBox="0 0 12 12"><path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5"/></svg>',
    wave: '<svg viewBox="0 0 21 4"><path d="M1 2.6C3.5.4 5.5.4 8 2.1s4.5 1.7 7 0 4-1.6 5 .2"/></svg>',
    cal: '<svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="13" rx="2.5"/><path d="M3 8h14M7 2.5v3M13 2.5v3"/></svg>',
    pin: '<svg viewBox="0 0 16 16"><path d="M8 14.5s4.6-4.3 4.6-8a4.6 4.6 0 1 0-9.2 0c0 3.7 4.6 8 4.6 8Z"/><circle cx="8" cy="6.4" r="1.7"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.3-3.6a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M3 3h5.3l4.3 6 5-6h2.2l-6.2 7.4L21 21h-5.3l-4.6-6.5L5.6 21H3.4l6.7-8L3 3Zm3 1.6 10.6 14.8h1.8L7.8 4.6H6Z"/></svg>',
    yt: '<svg viewBox="0 0 24 24"><path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.6 2.6 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>',
    home: '<svg viewBox="0 0 16 16"><path d="M2.5 7.2 8 2.5l5.5 4.7V13.5h-3.7V9.6H6.2v3.9H2.5Z"/></svg>',
    train: '<svg viewBox="0 0 25 25"><rect x="6" y="3" width="13" height="15" rx="3"/><path d="M6 11h13M9.5 21.5 8 18.5M15.5 21.5l1.5-3M10 3v8M15 3v8"/><circle cx="9.5" cy="14.5" r=".8"/><circle cx="15.5" cy="14.5" r=".8"/></svg>',
    car: '<svg viewBox="0 0 25 25"><path d="M3 15.5v-3l2.5-4.5h11l4 4.5 2 .8v2.2H21M8.5 15.5h8"/><circle cx="6.5" cy="15.8" r="1.9"/><circle cx="18.6" cy="15.8" r="1.9"/><path d="M7 8.5 6.3 12h13"/></svg>',
    tel: '<svg viewBox="0 0 25 25"><rect x="8" y="3" width="9" height="19" rx="2"/><path d="M11 19h3"/></svg>',
    ext: '<svg viewBox="0 0 16 16"><path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M11.5 9.5v4H2.5v-9h4"/></svg>',
    dir: '<svg viewBox="0 0 16 16"><path d="M8 1.5 14.5 8 8 14.5 1.5 8Z"/><path d="M6 9.5V7.5h4M8.5 5.8 10.2 7.5 8.5 9.2"/></svg>',
    full: '<svg viewBox="0 0 18 18"><path d="M2.5 6.5v-4h4M11.5 2.5h4v4M15.5 11.5v4h-4M6.5 15.5h-4v-4"/></svg>',
  };
  const arrow = `<span class="yu-arrow">${I.arrow}</span>`;
  // Handwritten logo — stands in for the original artwork. Letters are English placeholders, the tail loop winds under the word and curls at the end
  const mark = (word = "Bay Inn") => `<span class="yu-mark" data-label="Brand English name handwritten logo"><span class="yu-mark__word">${word}</span><svg class="yu-mark__swash" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M1 28C22 44 64 44 84 26c10-9 6-21-3-17-8 4-4 19 12 15"/></svg></span>`;
  const lockup = '<span class="yu-lockup" data-label="Horizontal logo joining place name, Korean name and brand"><b>PLACE</b><em>Name</em><b>BRAND</b></span>';
  const page = document.body.dataset.page;
  const here = (p) => (p === page ? ' aria-current="page"' : "");

  const T = {
    nav: () => `
<div class="yu-nav" data-fx="fade-slide-drawer" data-slot="header">
  <div class="yu-top">
    <div class="yu-top__side">
      <button class="yu-menu" type="button" data-fx-part="toggle" aria-label="Open Menu">
        <span class="yu-menu__waves">${I.wave}${I.wave}</span>MENU</button>
    </div>
    <a class="yu-top__logo" href="index.html" aria-label="Back to start">${mark()}</a>
    <div class="yu-top__side is-end">
      <a class="yu-reserve" href="#reserve">${I.cal}<span class="is-long">Book here</span><span class="is-short">Reservation</span></a>
    </div>
  </div>
  <div class="yu-rail is-left" data-slot="side-rail">
    <p class="yu-rail__name" data-label="Two-character Korean shop name, vertical"><span>Name</span></p>
    <nav class="yu-rail__sns" aria-label="SNS"><a href="#" aria-label="Instagram">${I.ig}</a><a href="#" aria-label="X">${I.x}</a><a href="#" aria-label="YouTube">${I.yt}</a></nav>
  </div>
  <div class="yu-rail is-right">
    <p class="yu-rail__mark"><span>BRAND</span><i></i><span>PLACE</span></p>
    <a class="yu-access-link" href="index.html#access">${I.pin}ACCESS</a>
  </div>
  <div data-fx-part="layer" data-slot="menu-drawer">
    <button data-fx-part="lay" type="button" aria-label="Close Menu" tabindex="-1"></button>
    <nav class="yu-drawer" data-fx-part="panel" aria-label="Full menu" tabindex="-1">
      <a class="yu-drawer__home" href="index.html">${I.home}HOME</a>
      <button class="yu-drawer__close" type="button" data-fx-part="close"><i class="yu-drawer__x"></i>CLOSE</button>
      <div class="yu-drawer__brand">${mark()}${lockup}</div>
      <div class="yu-drawer__nav">
        <a href="about.html"${here("about")}><b>STAY</b><span>Facilities / Stay overview</span></a>
        <a href="about.html#floor-1"><b>PRICE</b><span>Usage fee</span></a>
        <a href="news.html"${here("news")}><b>INFORMATION</b><span>News</span></a>
        <a href="index.html#access"><b>AROUND</b><span>Nearby Facilities</span></a>
      </div>
    </nav>
  </div>
</div>`,
    access: () => `
<section class="yu-access" id="access" data-slot="access">
  <div class="yu-map" data-label="Neighborhood map · lodging pins · river and sea · portrait 3:4">
    <svg viewBox="0 0 690 880" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path class="m-park" d="M300 640c120-40 260-20 390 30v210H250c20-90 10-200 50-240Z"/>
      <path class="m-water" d="M380 880c40-60 120-110 210-120 40-4 70 6 100 20v100Z"/>
      <path class="m-river" stroke-width="22" d="M150 0c-30 120 20 230 80 300s200 120 300 170c90 45 140 120 160 200"/>
      <g class="m-block-set">${Array.from({ length: 64 }, (_, i) => { const c = i % 8, r = (i / 8) | 0, w = 36 + ((i * 37) % 30), h = 26 + ((i * 53) % 24); return `<rect class="m-block" x="${20 + c * 86 + ((r * 17) % 30)}" y="${30 + r * 78 + ((c * 13) % 20)}" width="${w}" height="${h}" rx="3"/>`; }).join("")}</g>
      <path class="m-main" stroke-width="16" d="M-20 520 L700 140"/>
      <path class="m-road" stroke-width="9" d="M-20 300 L700 520M240 -20 L380 880M520 -20 L470 620M-20 700 L500 380M60 -20 L130 880"/>
      <path class="m-road" stroke-width="5" d="M-20 160 H700M-20 420 L700 260M300 0 L620 380M180 600 L690 700M0 620 L320 520"/>
      <path class="m-rail" d="M-20 400 L260 -20"/>
      <circle class="m-poi" cx="420" cy="130" r="9"/><circle class="m-poi is-food" cx="560" cy="220" r="9"/><circle class="m-poi is-food" cx="380" cy="350" r="9"/>
      <circle class="m-poi is-food" cx="470" cy="460" r="9"/><circle class="m-poi is-park" cx="450" cy="640" r="9"/><circle class="m-poi" cx="610" cy="590" r="9"/>
      <circle class="m-poi" cx="180" cy="760" r="9"/><circle class="m-poi is-food" cx="270" cy="590" r="9"/>
      <text class="m-label" x="330" y="610">River name</text>
      <path class="m-pin" d="M345 455c-14 0-24 10-24 24 0 18 24 40 24 40s24-22 24-40c0-14-10-24-24-24Z"/><circle cx="345" cy="479" r="8"/>
    </svg>
    <div class="yu-map__card"><b>Your one-line address here</b>Postal code 000-0000 Your address goes here on two lines
      <div class="yu-map__acts"><a class="yu-map__open" href="#">${I.ext}Open in map</a><span class="yu-map__dir">${I.dir}</span></div></div>
    <span class="yu-map__thumb wf-img" data-label="Aerial photo thumbnail"></span>
    <span class="yu-map__full">${I.full}</span>
  </div>
  <div class="yu-access__info">
    <p class="yu-eyebrow"><span>BRAND</span><span>ACCESS</span></p>
    <p class="yu-access__lockup">${lockup}</p>
    <div class="yu-access__list">
      <div><p class="yu-access__head">${I.pin}Location</p><div class="yu-access__body"><p>Postal code 000-0000 Your address goes here on one line</p><a class="yu-access__gmap" href="#">Google Map ${arrow}</a></div></div>
      <div><p class="yu-access__head">${I.train}By Train</p><div class="yu-access__body"><p>Add about two lines here on how to get from the station: the line name, the 00 minutes by express, and the station to get off at.<br>About 0 minutes on foot from the station.</p></div></div>
      <div><p class="yu-access__head">${I.car}When coming by car</p><div class="yu-access__body">
        <p>Your first route guide (about 0 hr 00 min from downtown)</p>
        <div class="yu-route"><span>Road name 1</span>${I.arrow}<span>Road name 2</span>${I.arrow}<span>Toll Road Name 3</span>${I.arrow}<span>National Route 000</span>${I.arrow}<span>Place name</span></div>
        <p>Your second route guide here</p>
        <div class="yu-route"><span>Road name 4</span>${I.arrow}<span>Road name 5</span>${I.arrow}<span>National Route 000</span>${I.arrow}<span>National Route 000</span>${I.arrow}<span>Place name</span></div>
      </div></div>
      <p class="yu-access__tel">${I.tel}000-0000-0000</p>
    </div>
  </div>
</section>`,
    cta: () => `
<section class="yu-cta" id="reserve" data-slot="reserve-band">
  <div class="yu-cta__photo wf-img" data-label="Colorful place-name lettering sculpture on a sandy beach · clear daytime sky and sea · front-facing wide landscape"></div>
  <p class="yu-cta__mark">${mark()}</p>
  <a class="yu-cta__btn" href="#">${I.cal}Book here</a>
</section>`,
    footer: () => `
<footer class="yu-foot" data-slot="footer">
  <div class="yu-foot__in">
    <div class="yu-foot__id">
      <a class="yu-foot__brand" href="index.html">${mark()}${lockup}</a>
      <div class="yu-foot__info"><p class="yu-foot__tel">${I.tel}000-0000-0000</p><p class="yu-foot__addr">Postal code 000-0000 Your address goes here on one line</p></div>
    </div>
    <div class="yu-foot__side">
      <ul class="yu-foot__links"><li><a href="about.html">Facility Guide</a></li><i></i><li><a href="news.html">News</a></li><i></i><li><a href="about.html#floor-1">Usage fee</a></li><i></i><li><a href="index.html#access">Area Map</a></li><i></i><li><a href="#reserve">Booking info</a></li></ul>
      <p class="yu-foot__copy">© 2025 Company Name, Inc.</p>
    </div>
  </div>
</footer>`,
  };
  document.querySelectorAll("[data-yu]").forEach((slot) => {
    const make = T[slot.dataset.yu];
    if (make) slot.outerHTML = make();
  });
  // Logo spots inside the page (the big logo straddling the about photo, the small logo above the layer label) use the same frame too
  document.querySelectorAll("[data-yu-mark]").forEach((slot) => (slot.outerHTML = mark()));
  document.querySelectorAll("[data-yu-arrow]").forEach((slot) => (slot.outerHTML = arrow));
})();
