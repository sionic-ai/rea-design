// First page: draw the illustrations (cars, buildings, people), then attach the drive map (fixed, the car runs along the road, spots pop out), the spot modal and the fare calculation
(() => {
  const { car, ICON } = window.sk;
  const $ = (s, r = document) => r.querySelector(s);
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  // The original speaks through pictures, so these are newly drawn shape graphics of the same size and feel
  const S = 'stroke="var(--kf-ink)" stroke-width="2" stroke-linejoin="round"';
  const ILL = {
    temple: `<svg viewBox="0 0 120 100"><path fill="var(--site-road)" ${S} d="M6 40 60 14l54 26z"/><rect x="22" y="40" width="76" height="44" fill="var(--kf-bg)" ${S}/><rect x="50" y="56" width="20" height="28" fill="var(--site-pink)" ${S}/><path fill="var(--kf-ink-soft)" d="M4 84h112v8H4z"/></svg>`,
    tower: `<svg viewBox="0 0 120 120"><path fill="none" ${S} d="M60 6v20M40 110 60 26l20 84M46 80h28M50 60h20"/><rect x="38" y="20" width="44" height="14" rx="4" fill="var(--site-blue)" ${S}/><path fill="var(--site-pink)" ${S} d="M24 110c0-16 16-24 36-24s36 8 36 24z"/></svg>`,
    night: `<svg viewBox="0 0 120 100"><rect x="4" y="8" width="112" height="84" rx="14" fill="var(--kf-contrast-bg)"/><circle cx="92" cy="28" r="10" fill="var(--site-yellow)"/><path fill="var(--kf-bg)" d="M14 70h26v-16h10v16h20V44h14v26h22v14H14z"/></svg>`,
    parking: `<svg viewBox="0 0 120 100"><rect x="6" y="40" width="108" height="50" rx="6" fill="var(--site-road)" ${S}/><path stroke="var(--kf-bg)" stroke-width="3" d="M30 46v38M60 46v38M90 46v38"/><rect x="48" y="6" width="24" height="24" rx="4" fill="var(--site-blue)"/><path fill="none" stroke="var(--kf-bg)" stroke-width="3" d="M56 26V12h6a4 4 0 0 1 0 8h-6"/></svg>`,
    park: `<svg viewBox="0 0 120 100"><rect x="6" y="20" width="108" height="70" rx="6" fill="var(--site-grass-deep)" ${S}/><path fill="none" stroke="var(--kf-bg)" stroke-width="2.5" d="M60 20v70M6 55h108"/><circle cx="60" cy="55" r="12" fill="none" stroke="var(--kf-bg)" stroke-width="2.5"/></svg>`,
    gate: `<svg viewBox="0 0 120 100"><rect x="10" y="30" width="100" height="60" rx="30" fill="var(--kf-bg)" ${S}/><path fill="none" ${S} d="M40 90V50M80 90V50M30 50h60"/><path fill="var(--site-sky)" d="M44 54h32v32H44z"/></svg>`,
    tree: `<svg viewBox="0 0 40 60"><path fill="var(--site-grass-deep)" d="M20 2 36 42H4z"/><path fill="var(--kf-ink-soft)" d="M18 42h4v14h-4z"/></svg>`,
    person: `<svg viewBox="0 0 40 70"><circle cx="20" cy="10" r="7" fill="var(--site-yellow)" ${S}/><path fill="var(--site-blue)" ${S} d="M10 22h20l4 24H6z"/><path fill="none" ${S} d="M14 46l-2 20M26 46l2 20"/></svg>`,
  };
  const carTop = '<svg viewBox="0 0 60 34" aria-hidden="true"><rect x="2" y="3" width="56" height="28" rx="9" fill="var(--site-yellow)" stroke="var(--kf-ink)" stroke-width="2"/><rect x="30" y="7" width="12" height="20" rx="3" fill="var(--site-sky)" stroke="var(--kf-ink)" stroke-width="1.5"/><rect x="10" y="8" width="14" height="18" rx="3" fill="var(--kf-bg)" opacity=".6"/></svg>';

  document.querySelectorAll("[data-car]").forEach((el) => (el.innerHTML = car()));
  const hero = $(".sk-hero");
  hero.querySelector(".is-1").innerHTML = ILL.temple;
  hero.querySelector(".is-2").innerHTML = ILL.night;
  hero.insertAdjacentHTML("beforeend", `<div class="sk-hero__ill is-3">${ILL.tree}</div>`);
  $(".sk-news__car").innerHTML = car();
  $(".sk-hero__sns").innerHTML = `<a href="#" aria-label="X">${ICON.x}</a><a href="#" aria-label="Social Media">${ICON.ig}</a>`;
  $(".sk-notice button").addEventListener("click", (e) => e.currentTarget.parentElement.classList.add("is-closed"));

  // Fare map — a schematic in the same spot instead of the original hand-drawn map (grass, river, road, entrance)
  $(".sk-calc__map").innerHTML = `<svg viewBox="0 0 600 520" role="img" aria-label="Area map diagram">
    <rect width="600" height="520" fill="var(--site-grass)"/><path d="M0 120c120-40 160 60 260 40s140-120 340-80V0H0z" fill="var(--site-sky)"/>
    <path d="M420 0c-40 120 60 200 0 300s40 160 0 220" fill="none" stroke="var(--site-blue)" stroke-width="14" opacity=".55"/>
    <path d="M80 480C140 380 120 300 220 260s140-60 200-160" fill="none" stroke="var(--site-road)" stroke-width="16" stroke-linecap="round"/>
    ${[[96, 452, "Entrance 1"], [214, 268, "Landmark 1"], [330, 190, "Landmark 2"], [418, 104, "Entrance 2"], [160, 360, "Landmark 3"]].map(([x, y, t]) => `<g><circle cx="${x}" cy="${y}" r="9" fill="var(--site-blue)" stroke="var(--kf-bg)" stroke-width="3"/><rect x="${x + 14}" y="${y - 12}" width="64" height="22" rx="11" fill="var(--kf-bg)"/><text x="${x + 46}" y="${y + 3}" text-anchor="middle" font-size="11" fill="var(--kf-ink)">${t}</text></g>`).join("")}
  </svg>`;

  // Price calculation (placeholder math) — the value changes with each selection
  const form = $(".sk-calc__form");
  const calc = () => {
    const d = new FormData(form);
    const base = 300 + 200 * Math.abs(d.get("in") - d.get("out")) + 100 * d.getAll("via").length;
    form.querySelector("output").textContent = (Math.round((base * d.get("car")) / 10) * 10).toLocaleString();
  };
  const bar = (seg) => { const on = seg.querySelector("input:checked")?.parentElement; if (on) { seg.style.setProperty("--bar-x", `${on.offsetLeft}px`); seg.style.setProperty("--bar-w", `${on.offsetWidth}px`); } };
  const segs = [...form.querySelectorAll(".sk-seg")];
  segs.forEach(bar);
  addEventListener("resize", () => segs.forEach(bar));
  document.fonts?.ready.then(() => segs.forEach(bar));
  form.addEventListener("change", (e) => { const seg = e.target.closest(".sk-seg"); if (seg) bar(seg); calc(); });
  calc();

  // Landmark modal
  const modal = $(".sk-modal");
  const close = () => (modal.hidden = true);
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest(".sk-modal__close")) close(); });
  addEventListener("keydown", (e) => e.key === "Escape" && close());

  // ── Drive map: landscape 1440×1870 · portrait 430×1980 map. Roads are newly drawn winding paths, landmark positions and sizes follow the cell ratios of the original map ──
  // Motion (pinning, car running, rising along the map, landmark threshold) is handled by _fx/scroll-drive-path
  const MAP = {
    h: {
      w: 1440, h: 1870, cap: [257, 40, 20], icon: 50,
      d: "M0 200H820C1010 200 1010 610 820 610H480C340 610 340 905 480 905H1020C1200 905 1200 1310 1020 1310H475C340 1310 340 1605 475 1605H1440",
      spots: [[325, 28, 235, 163, 308, 20], [1092, 200, 230, 205, 1077, 172], [558, 283, 236, 254, 547, 284], [1079, 636, 244, 205, 1092, 609], [707, 1028, 252, 206, 730, 999], [0, 0, 0, 0, 390, 1070, 489, 1122, 60], [48, 1204, 258, 195, 76, 1184], [96, 1646, 242, 219, 96, 1613], [587, 1352, 266, 231, 594, 1322], [0, 0, 0, 0, 890, 1725, 989, 1777, 60]],
      deco: [["tree", 172, 79, 67], ["tree", 746, 66, 67], ["tree", 810, 349, 67], ["tree", 512, 745, 67], ["tree", 1300, 878, 67], ["tree", 277, 992, 67], ["tree", 452, 1733, 67], ["tree", 500, 1456, 67], ["tree", 1196, 1310, 67], ["tree", 740, 1789, 67], ["tree", 1320, 1720, 67], ["person", 640, 470, 46], ["person", 1250, 1020, 46], ["person", 300, 1500, 46]],
    },
    v: {
      w: 430, h: 1980, cap: [150, 24, 12], icon: 26,
      d: "M0 140H90C200 140 272 220 272 380S190 640 190 830 270 1080 268 1300 180 1560 184 1700 250 1890 430 1890",
      spots: [[54, 37, 121, 84, 30, 14], [257, 129, 123, 105, 229, 106], [52, 356, 119, 129, 29, 347], [266, 377, 118, 99, 252, 358], [238, 777, 119, 97, 221, 752], [0, 0, 0, 0, 30, 965, 94, 1036, 46], [53, 1239, 118, 89, 30, 1219], [255, 1372, 131, 113, 233, 1355], [48, 1525, 117, 105, 23, 1503], [0, 0, 0, 0, 218, 1686, 284, 1736, 46]],
      deco: [["tree", 20, 250, 30], ["tree", 360, 300, 30], ["tree", 30, 640, 30], ["tree", 350, 980, 30], ["tree", 40, 1420, 30], ["tree", 360, 1640, 30], ["person", 330, 560, 22], ["person", 70, 1100, 22]],
    },
  };
  const KINDS = ["park", "tower", "temple", "night", "parking", "night", "gate", "temple", "parking", "night"];
  // Put the picture svg inside the map svg — if the height is not given by the viewBox ratio, it ends up in the center of the full map height. If h is given, it aligns to the bottom of that cell
  const nest = (svg, x, y, w, h) => {
    const [, , vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    return svg.replace("<svg ", `<svg x="${x}" y="${y}" width="${w}" height="${h || (w * vh) / vw}" preserveAspectRatio="xMidYMax meet" `);
  };

  document.querySelectorAll(".sk-drive__map").forEach((map) => {
    const M = MAP[map.classList.contains("is-v") ? "v" : "h"];
    const [cw, ch, cr] = M.cap;
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const tufts = Array.from({ length: M.w > 1000 ? 60 : 26 }, () => { const x = rnd() * M.w, y = rnd() * M.h; return `M${x} ${y}l4-10l4 10l4-8`; }).join("");
    const deco = M.deco.map(([k, x, y, w]) => `<g class="sk-drive__deco">${nest(ILL[k], x, y, w)}</g>`).join("");
    const spots = M.spots.map(([x, y, w, h, cx, cy, nx, ny, nw], i) => {
      const cap = `<g class="sk-spot__cap"><rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="${cr}"/><text x="${cx + cw / 2}" y="${cy + ch / 2}" text-anchor="middle" dominant-baseline="central">Your spot $ here{i + 1}</text></g>`;
      if (!w) return `<g class="sk-spot" data-fx-part="spot" aria-label="Your spot $ here{i + 1}"><g class="sk-spot__img">${nest(ILL.night, nx, ny, nw)}</g>${cap}</g>`;
      const s = M.icon, ix = x + w - s * 0.64, iy = y + h - s;
      return `<a class="sk-spot" href="#spot-${i + 1}" data-fx-part="spot" aria-label="Your spot $ here{i + 1}"><g class="sk-spot__img">${nest(ILL[KINDS[i]], x, y, w, h)}</g>${cap}<g class="sk-spot__icon" data-fx-part="icon"><rect x="${ix}" y="${iy}" width="${s}" height="${s}" rx="${s * 0.3}"/><path d="M${ix + s * 0.474} ${iy + s * 0.526}H${ix + s * 0.32}V${iy + s * 0.474}H${ix + s * 0.474}V${iy + s * 0.32}H${ix + s * 0.526}V${iy + s * 0.474}H${ix + s * 0.68}V${iy + s * 0.526}H${ix + s * 0.526}V${iy + s * 0.68}H${ix + s * 0.474}Z"/></g></a>`;
    }).join("");
    const car = M.w > 1000 ? [90, 50] : [44, 24];
    map.querySelector(".sk-drive__wrapper").innerHTML = `<svg viewBox="0 0 ${M.w} ${M.h}" aria-hidden="false">
      <path class="grass" d="${tufts}"/><path class="road" d="${M.d}"/><path class="lane" d="${M.d}"/>${deco}
      <path class="route" data-fx-part="route" d="${M.d}"/>
      <g class="sk-drive__car" data-fx-part="car">${nest(carTop, 0, 0, car[0], car[1])}</g>
      ${spots}</svg>`;
  });
  document.querySelectorAll(".sk-spot[href]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    modal.hidden = false;
    modal.querySelector("h3").textContent = a.getAttribute("aria-label");
  }));
})();
