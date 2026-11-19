// Home page: park drawings (hero · boundary · park guide), the shop floor map and the neighborhood map are redrawn as SVG pieces, and
// Each piece pops out using the original entrance values (shared.js NW.pop).
(() => {
  const { scene, pop, popOnEnter, person, tree, bush, cloud, car, tent, bike, wing, tower, castle, wrap, rr, reduce } = NW;
  const C = window.NNColors;
  const $ = (s, r = document) => r.querySelector(s);
  const poly = (pts, fill, extra = "") => `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" fill="${fill}" ${extra}/>`;
  const RED = C.red7, BLUE = C.blue31, PALE = C.blue42, GRASS = C.green4, GRASS2 = C.green3;

  // Square pond on a tree + wooden deck (the original’s excavation platform exhibit)
  const pool = (cx, cy, w, h) =>
    poly([[cx - w / 2 + 18, cy - h / 2], [cx + w / 2 - 18, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], C.blue14) +
    poly([[cx - w / 2 + 24, cy - h / 2 + 6], [cx + w / 2 - 24, cy - h / 2 + 6], [cx + w / 2 - 8, cy + h / 2 - 6], [cx - w / 2 + 8, cy + h / 2 - 6]], C.blue46);
  const deck = (cx, cy, w) =>
    wrap(cx, cy, 1, `<path d="M${-w / 2} 0L${-w / 2 + 14} -26H${w / 2 - 14}L${w / 2} 0Z" fill="${C.sand6}"/><rect x="${-w / 2}" y="0" width="${w}" height="10" fill="${C.sand3}"/>` +
      Array.from({ length: Math.floor(w / 14) }, (_, i) => `<rect x="${-w / 2 + 4 + i * 14}" y="-34" width="2" height="12" fill="${C.brown4}"/>`).join("") + `<rect x="${-w / 2 + 12}" y="-36" width="${w - 24}" height="2" fill="${C.brown4}"/>`);

  // ── Hero: sky · distant city · castle, a red/blue road converging in perspective, a shopping block and parking lot on the left, a glass building on the right ──
  function heroScene() {
    const el = $('[data-scene="hero"]');
    return scene(el, 1440, 2053, () => {
      let g = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.blue39}"/><stop offset="1" stop-color="${C.blue43}"/></linearGradient></defs>
        <rect width="1440" height="620" fill="url(#sky)"/>`;
      let far = "";
      for (let x = 140; x < 1300; x += 26) far += `<rect x="${x}" y="${590 - rr(6, 26)}" width="${rr(14, 24)}" height="40" fill="${NW.pick([C.blue24, C.blue33, C.sand7, C.blue28, C.blue38])}"/>`;
      g += far + `<g fill="${C.teal4}"><ellipse cx="300" cy="604" rx="90" ry="16"/><ellipse cx="930" cy="604" rx="120" ry="18"/><ellipse cx="1150" cy="606" rx="70" ry="12"/></g>`;
      g += `<rect y="600" width="1440" height="1453" fill="${GRASS}"/><rect y="600" width="1440" height="24" fill="${PALE}"/>`;
      // Perspective path
      g += poly([[600, 624], [650, 624], [420, 905], [330, 905]], PALE);
      g += poly([[690, 624], [712, 624], [560, 905], [520, 905]], RED) + poly([[520, 905], [560, 905], [420, 1240], [360, 1240]], RED);
      g += poly([[762, 624], [784, 624], [1120, 905], [1078, 905]], RED);
      g += poly([[722, 624], [740, 624], [790, 905], [740, 905]], BLUE);
      g += poly([[700, 690], [1010, 690], [1024, 704], [690, 704]], RED) + poly([[655, 760], [1080, 760], [1098, 778], [640, 778]], RED);
      g += poly([[860, 624], [880, 624], [1240, 905], [1200, 905]], BLUE);
      g += poly([[140, 640], [430, 628], [300, 905], [0, 905], [0, 700]], C.blue35);
      g += pool(885, 830, 300, 100) + `<rect x="828" y="632" width="56" height="20" fill="${C.blue12}"/><rect x="960" y="650" width="70" height="24" fill="${C.orange4}"/>`;
      // Bicycle road below (car road + blue bike lane)
      g += `<rect y="985" width="1440" height="44" fill="${C.blue26}"/><rect y="1029" width="1440" height="14" fill="${C.blue22}"/>`;
      for (let x = 0; x < 1440; x += 60) g += `<rect x="${x}" y="1005" width="30" height="3" fill="${C.white6}"/>`;
      g += poly([[0, 905], [1440, 905], [1440, 985], [0, 985]], GRASS2);
      g += pool(630, 1150, 280, 90) + pool(1160, 1150, 240, 80);
      g += `<rect y="1290" width="1440" height="763" fill="${GRASS}"/>`;

      let p = "";
      p += cloud(210, 288, 1) + cloud(1150, 236, 1.25) + cloud(390, 462, 1.15);
      p += castle(1045, 604, 1.05);
      p += wrap(0, 905, 1, `<path d="M0 -480Q80 -500 148 -470V0H0Z" fill="${C.yellow6}"/><path d="M0 -480Q80 -500 148 -470L148 -455Q80 -486 0 -466Z" fill="${C.blue16}"/>` +
        Array.from({ length: 9 }, (_, i) => `<path d="M0 ${-430 + i * 48}L130 ${-418 + i * 48}" stroke="${C.blue5}" stroke-width="7"/>`).join(""));
      p += wing(430, 700, { L: 150, D: 60, H: 32 });
      p += wing(300, 842, { L: 330, D: 72, H: 40 });
      p += wing(40, 918, { L: 250, D: 70, H: 38 });
      [[250, 664, C.white6], [340, 652, C.blue4], [300, 690, C.teal7], [205, 700, C.blue12], [200, 770, C.red6], [100, 960, C.white6]].forEach(([x, y, c]) => (p += car(x, y, 1.3, c)));
      p += tower(1195, 800, 215, 412);
      p += wrap(1180, 790, 1, `<rect x="0" y="-60" width="250" height="60" fill="${C.yellow4}"/><rect x="0" y="-66" width="250" height="8" fill="${C.sand1}"/><rect x="10" y="-44" width="230" height="10" fill="${C.blue23}"/>`);
      p += deck(885, 840, 180) + deck(630, 1162, 170) + deck(1160, 1160, 140);
      p += tent(300, 1210, 1.4) + tent(1010, 1250, 1.2);
      [[180, 640], [290, 600], [350, 610], [465, 590], [205, 640], [110, 745], [35, 765], [165, 690], [100, 690], [1120, 640], [1430, 650], [1410, 870], [1100, 905], [410, 895], [680, 905], [380, 1110], [880, 1115], [1300, 1110], [70, 1120], [520, 1270], [1380, 1290], [130, 1300], [960, 1380], [1340, 1390]].forEach(([x, y], i) => (p += tree(x, y, 1.45 + (i % 3) * 0.12)));
      [[1060, 1380, 1.4], [1250, 1390, 1.6], [220, 1395, 1.3]].forEach(([x, y, k]) => (p += bush(x, y, k)));
      for (let i = 0; i < 46; i++) p += person(rr(590, 1170), rr(650, 900), 1.35);
      for (let i = 0; i < 30; i++) p += person(rr(60, 1400), rr(1060, 1290), 1.4);
      p += bike(900, 1032, 1.4) + bike(260, 1032, 1.4);
      p += car(560, 1010, 1.4, C.red6) + car(1240, 1012, 1.4, C.blue4);
      return g + p;
    }, { seed: 5, pixi: true });
  }

  // People sitting and standing on the title letters, and the tree at the end of the letters
  function sitters() {
    const el = $("[data-sitters]");
    return scene(el, 520, 280, () =>
      person(70, 52, 1.5, { roam: false }) + person(100, 52, 1.2, { roam: false }) + person(124, 52, 1.2, { roam: false }) + person(148, 52, 1.2, { roam: false }) + person(186, 50, 1.5, { roam: false }) +
      person(462, 58, 1.4, { roam: false }) + person(478, 54, 1.3, { roam: false }) + tree(498, 110, 1.3) + person(240, 156, 1.4, { roam: false }) + person(262, 156, 1.4, { roam: false }) + person(286, 154, 1.5, { roam: false }) + tree(20, 210, 1.3) + person(500, 232, 1.5, { roam: false }),
      { fit: "xMidYMid meet", seed: 9, pixi: true });
  }

  // Boundary: along the top edge of a white panel, hills, trees and bicycles run (original js-bikeLane)
  function edgeScene() {
    return scene($('[data-scene="edge"]'), 1440, 120, () => {
      let s = "";
      [[160, 1.6], [420, 1.3], [700, 1.8], [1000, 1.4], [1280, 1.7]].forEach(([x, k]) => (s += bush(x, 120, k)));
      [[260, 118], [560, 118], [880, 120], [1180, 118], [1380, 120]].forEach(([x, y]) => (s += tree(x, y, 1.5)));
      s += bike(330, 118, 1.5) + person(620, 118, 1.4) + person(980, 118, 1.4) + person(1060, 118, 1.3);
      return s;
    }, { fit: "xMidYMax slice", seed: 12, pixi: true });
  }

  function shopScene() {
    return scene($('[data-scene="shop"]'), 800, 520, () => {
      let s = wing(220, 330, { L: 380, D: 80, H: 44 }) + wing(30, 440, { L: 220, D: 70, H: 40 }) + wing(560, 250, { L: 150, D: 70, H: 38 });
      [[380, 160, C.white6], [420, 180, C.blue13], [450, 140, C.blue4], [500, 175, C.red6]].forEach(([x, y, c]) => (s += car(x, y, 1.3, c)));
      for (let i = 0; i < 14; i++) s += person(rr(40, 780), rr(260, 510), 1.25);
      s += tree(700, 330, 1.4) + tree(150, 380, 1.3) + tree(560, 470, 1.3);
      return s;
    }, { fit: "xMaxYMin meet", seed: 14, pixi: true });
  }

  // Park guide strip: road and cars above, two ponds, a coffee tent, people playing
  function otherScene() {
    return scene($('[data-scene="other"]'), 1440, 1391, () => {
      let g = `<rect width="1440" height="1391" fill="${GRASS}"/>`;
      g += poly([[0, 0], [1440, 0], [1440, 180], [0, 230]], GRASS2);
      g += poly([[260, 0], [330, 0], [180, 230], [100, 230]], RED) + poly([[860, 0], [910, 0], [1010, 230], [950, 230]], RED) + poly([[540, 0], [600, 0], [560, 230], [490, 230]], BLUE);
      g += poly([[0, 230], [1440, 180], [1440, 226], [0, 276]], C.blue26) + poly([[0, 276], [1440, 226], [1440, 240], [0, 290]], C.blue22);
      g += pool(700, 120, 300, 110) + pool(720, 470, 360, 140) + pool(250, 560, 260, 90);
      let p = deck(700, 135, 200) + deck(720, 500, 240) + deck(250, 575, 160);
      p += car(900, 236, 1.4, C.blue4) + car(1200, 205, 1.4, C.red6) + car(300, 262, 1.4, C.white6) + bike(600, 252, 1.4);
      p += tent(110, 420, 1.6) + tent(1350, 470, 1.4);
      [[80, 120], [420, 150], [1040, 150], [1300, 110], [80, 330], [1180, 330], [400, 360], [1300, 380], [940, 380], [60, 600], [1400, 620], [520, 640], [980, 640]].forEach(([x, y], i) => (p += tree(x, y, 1.5 + (i % 2) * 0.15)));
      p += bush(1240, 330, 1.6) + bush(360, 330, 1.4);
      for (let i = 0; i < 42; i++) p += person(rr(40, 1400), rr(300, 660), 1.45);
      for (let i = 0; i < 16; i++) p += person(rr(40, 1400), rr(40, 200), 1.35);
      for (let i = 0; i < 18; i++) p += person(rr(20, 1420), rr(1120, 1380), 1.45);
      p += tree(160, 1200, 1.6) + tree(1300, 1220, 1.6) + bush(700, 1380, 1.6);
      return g + p;
    }, { seed: 17, pixi: true });
  }

  // Neighborhood map: slanted street grid, park, moat and castle, vertical subway line with station names, numbered pins
  const INTERVIEWS = 8;
  function mapScene() {
    const H = 5200;
    return scene($('[data-scene="map"]'), 1360, H, () => {
      let g = `<rect width="1360" height="${H}" fill="${C.light3}"/>`;
      for (let y = 0; y < H; y += 260) for (let x = -40; x < 1400; x += 220) {
        const ox = (y / 260) % 2 ? 30 : 0;
        g += `<rect x="${x + ox + 14}" y="${y + 14}" width="190" height="230" fill="${NW.pick([C.blue47, C.light1, C.blue44])}"/>`;
      }
      for (let i = 0; i < 26; i++) {
        const x = rr(0, 1300), y = rr(0, H - 200);
        g += `<rect x="${x}" y="${y}" width="${rr(60, 180)}" height="${rr(60, 200)}" fill="${C.green1}"/>`;
      }
      for (let y = 0; y < H; y += 260) g += `<rect x="0" y="${y}" width="1360" height="14" fill="${C.white6}"/>`;
      for (let x = 0; x < 1400; x += 220) g += `<rect x="${x}" y="0" width="14" height="${H}" fill="${C.white6}"/>`;
      g += `<path d="M1360 120C1200 160 1120 60 980 120S860 360 900 520 1060 760 1360 720" stroke="${C.blue18}" stroke-width="34" fill="none"/><path d="M940 300H1300V640H940Z" fill="${C.green2}"/>`;
      g += `<rect x="636" y="0" width="16" height="${H}" fill="${C.ink1}"/>`;
      for (let y = 10; y < H; y += 36) g += `<rect x="640" y="${y}" width="8" height="18" fill="${C.white6}"/>`;
      for (let y = 900; y < H; y += 1100) g += `<text x="664" y="${y}" style="font-family:var(--kf-font-sans)" font-weight="700" font-size="22" fill="${C.blue7}">Your station name here</text><text x="664" y="${y + 26}" style="font-family:var(--kf-font-sans)" font-weight="700" font-size="22" fill="${C.blue7}">00 stations</text>`;
      let p = castle(1120, 560, 1.4);
      for (let i = 0; i < 48; i++) p += tree(rr(30, 1330), rr(120, H - 100), 1.5);
      for (let i = 0; i < 60; i++) p += person(rr(30, 1330), rr(120, H - 100), 1.7);
      for (let i = 0; i < 14; i++) p += wrap(rr(40, 1300), rr(300, H - 200), 1, `<rect x="-24" y="-40" width="48" height="40" fill="${NW.pick([C.paleYellow4, C.blue12, C.white6, C.yellow6])}"/><path d="M-28 -40L0 -58L28 -40Z" fill="${NW.pick([C.blue12, C.blue4, C.blue26])}"/><rect x="-16" y="-30" width="10" height="10" fill="${C.blue4}"/><rect x="6" y="-30" width="10" height="10" fill="${C.blue4}"/>`);
      // A number pin on each card — the map moves to that pin’s spot (original positionMap)
      for (let i = 0; i < INTERVIEWS; i++) {
        const y = 420 + i * 640, x = i % 2 ? 1060 : 560 + (i % 3) * 60;
        p += wrap(x, y, 1, `<path d="M0 0C-6 -12 -22 -24 -22 -40A22 22 0 1 1 22 -40C22 -24 6 -12 0 0Z" fill="${C.red5}"/><circle cy="-40" r="14" fill="${C.white6}"/><text y="-34" text-anchor="middle" style="font-family:var(--kf-font-display)" font-weight="700" font-size="16" fill="${C.red5}">${i + 1}</text>`, "is-pin");
      }
      return g + p;
    }, { seed: 23, pixi: true });
  }

  function mini(el, draw, seed) { return scene(el, 260, 50, draw, { fit: "xMinYMax meet", seed }); }

  // ── News slider: original swiper 11.2 — slidesPerView auto, 1 slide on phones and 2 at a time from 768 up, 300ms transition (default·ease), clicking a dot jumps to that spot ──
  function newsSlider() {
    new Swiper(".news__viewport", {
      slidesPerView: "auto", slidesPerGroup: 1, speed: reduce ? 0 : 300,
      breakpoints: { 768: { slidesPerGroup: 2 } },
      navigation: { nextEl: "[data-news-next]", prevEl: "[data-news-prev]" },
      pagination: { el: "[data-news-dots]", clickable: true },
    });
  }

  // ── Store: floor map (wings A~D) and cards — hovering a card or passing screen center turns the map cell green ──
  const SHOPS = [
    ["A-1", "Your shop name here", "Coffee · Dessert", "Coffee cup and pudding plate · white table in natural light · landscape 20:13"],
    ["A-2", "Your two-line bakery name here", "Bakery Cafe", "Fried bread on a paper bag · on a tray · landscape 20:13"],
    ["B-1", "Your shop name here", "Your cuisine type here", "Food picked up with chopsticks · solid pink background · landscape 20:13"],
    ["B-2", "Your shop name here", "Wine restaurant", "Wine glass and meat dish · dark wooden table · landscape 20:13"],
    ["B-3", "Your shop name here, two lines", "Foods from many countries", "Plates in a glass display case · indoor lighting · landscape 20:13"],
    ["B-4", "Pub name in two lines here", "Craft Beer", "Three beers of different colors · white background · landscape 20:13"],
  ];
  function shopList() {
    const grid = $("[data-shop-grid]");
    grid.innerHTML = SHOPS.map(([id, name, cat, label]) => `
      <a class="scard" href="product.html" data-shop="${id}">
        <span class="scard__thumb"><span class="wf-img" data-label="${label}"></span></span>
        <span class="scard__head"><span class="badge">${id}</span><span class="scard__name">${name}</span></span>
        <span class="scard__body"><span class="scard__cat" style="display:block">${cat}</span>
          <dl class="hours"><dt>OPEN</dt><dd>0:00~00:00 (Weekdays)<br>0:00~00:00 (Weekends)</dd><dt>CLOSE</dt><dd>Your closure notice here</dd></dl></span>
      </a>`).join("");
    const floor = NW.floorMap($("[data-floor]"));
    grid.querySelectorAll(".scard").forEach((c) => {
      const on = (v) => { document.querySelectorAll(`.floor [data-blk="${c.dataset.shop}"]`).forEach((b) => b.classList.toggle("is-on", v)); NW.floorPerson(floor, c.dataset.shop, v); };
      c.addEventListener("mouseenter", () => on(true));
      c.addEventListener("mouseleave", () => on(false));
    });
  }

  function interviews() {
    const ol = $("[data-interviews]");
    const who = ["Person upper body · In front of a wooden door in a museum gallery · Portrait 4:3", "Clothing shop owner · in front of racks in the store · landscape 4:3", "Merchant couple · side by side in front of a white shop · landscape 4:3", "Print shop owner · among paper stacks · landscape 4:3", "Wine shop owner · in front of a bottle display · landscape 4:3", "Box workshop couple · in front of the workbench · landscape 4:3", "Fabric shop owner · in front of fabric shelves · landscape 4:3", "Performing artist · in front of a stage pine painting · landscape 4:3"];
    ol.innerHTML = who.map((lb, i) => `
      <li class="icard"><a href="#">
        <span class="wf-img" data-label="${lb}"></span>
        <span class="icard__row"><span class="icard__no">${i + 1}</span><span><span class="icard__org" style="display:block">Your affiliation name here<br>Your job title here</span><span class="icard__name" style="display:block">Your name here</span></span></span>
        <span class="icard__lead" style="display:block">Your person’s story here<br>Summarized in three lines<br>One sentence!</span>
        <span class="icard__more">MORE</span></a></li>`).join("");
  }

  // ── Neighborhood map: in the original a pixi map pinned to the screen moves to the passing card (screen 65%→35%) · the pin position of the hovered card over .95s sine.inOut, and,
  // That pin drops from 80 above in .4s back.out while the previous pin leaves 80 upward in .25s power2.in. Scrolling back above the map returns to the starting position.
  // On phone the card row is a swiper (slidesPerView auto · centered), so the same thing happens on every slide
  function discovery(svg) {
    const pins = [...svg.querySelectorAll(".pc.is-pin")];
    const rest = [...svg.querySelectorAll(".pc:not(.is-pin)")];
    const cards = [...document.querySelectorAll("[data-interviews] .icard")];
    const box = svg.parentElement, body = box.parentElement;
    NW.hideNow(pins);
    if (reduce) pop(rest);
    else {
      NW.hideNow(rest);
      ScrollTrigger.create({ trigger: body, start: "top 85%", once: true, onEnter: () => pop(rest) });
    }
    let cur = -1;
    const at = (p) => { const m = p.transform.baseVal.consolidate().matrix; return { x: m.e, y: m.f }; };
    const pan = (i) => {
      const vb = svg.viewBox.baseVal, W = box.clientWidth, H = box.clientHeight, s = Math.max(W / vb.width, H / vb.height);
      const y = i < 0 ? 0 : Math.min(0, Math.max(H - vb.height * s, H / 2 - at(pins[i]).y * s));
      gsap.to(svg._cam, { y, duration: reduce ? 0 : 0.95, ease: "sine.inOut", overwrite: true, onUpdate: () => svg._refit() });
    };
    const update = (i) => {
      if (i === cur) return;
      cards.forEach((c, k) => c.classList.toggle("is-active", k === i));
      if (cur >= 0) gsap.to(NW.target(pins[cur]), { y: -80, opacity: 0, duration: reduce ? 0 : 0.25, ease: "power2.in", overwrite: true });
      cur = i;
      if (i >= 0) gsap.fromTo(NW.target(pins[i]), { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: reduce ? 0 : 0.4, ease: "back.out", overwrite: true });
      pan(i);
    };
    gsap.matchMedia().add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)" }, (ctx) => {
      if (ctx.conditions.sp) {
        body.classList.add("swiper");
        cards[0].parentElement.classList.add("swiper-wrapper");
        cards.forEach((c) => c.classList.add("swiper-slide"));
        const sw = new Swiper(body, { slidesPerView: "auto", centeredSlides: true, speed: reduce ? 0 : 300 });
        sw.on("slideChange", () => update(sw.activeIndex));
        return () => {
          sw.destroy(true, true);
          body.classList.remove("swiper");
          cards[0].parentElement.classList.remove("swiper-wrapper");
          cards.forEach((c) => c.classList.remove("swiper-slide"));
        };
      }
      const off = cards.map((c, i) => {
        const on = () => update(i);
        c.addEventListener("mouseenter", on);
        ScrollTrigger.create({ trigger: c, start: "center 65%", end: "center 35%", onEnter: on, onEnterBack: on });
        return () => c.removeEventListener("mouseenter", on);
      });
      ScrollTrigger.create({ trigger: box, start: "top top", onLeaveBack: () => update(-1) });
      return () => off.forEach((f) => f());
    });
  }

  // ── Assembly ──
  const hero = heroScene();
  const sit = sitters();
  pop(hero.querySelectorAll(".pc"), 0.1);
  pop(sit.querySelectorAll(".pc"), 0.9);
  if (!reduce) gsap.from("[data-kv-title] span", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1, delay: 0.2 });

  popOnEnter(edgeScene());
  popOnEnter(shopScene(), "top 90%");
  popOnEnter(otherScene(), "top 80%");
  popOnEnter(mini($('[data-scene="ocard1"]'), () => person(20, 48, 1.4, { roam: false }) + person(48, 48, 1.1, { roam: false }) + person(66, 48, 1.1, { roam: false }) + person(110, 48, 1.4, { roam: false }), 41));
  popOnEnter(mini($('[data-scene="ocard2"]'), () => person(40, 48, 1.5) + person(62, 48, 1.4, { roam: false }), 43));
  popOnEnter(scene($("[data-cars]"), 140, 40, () => car(30, 38, 1.4, C.teal7) + car(100, 38, 1.4, C.red6), { fit: "xMinYMax meet", seed: 51 }));

  interviews();
  discovery(mapScene());
  newsSlider();
  shopList();
  NW.history($("[data-history]"));

  const inv = $("[data-invite]");
  ScrollTrigger.create({ trigger: ".mv", start: "bottom top", onEnter: () => inv.classList.add("is-hidden"), onLeaveBack: () => inv.classList.remove("is-hidden") });
})();
