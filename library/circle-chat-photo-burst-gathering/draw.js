// Redraw at the same position and size the places where the original speaks in hand drawings (friends holding phones, small props, villa map, face circles).
// Fills are set by class only, and index.css makes the colors from --kf-*.
(() => {
  const sp = matchMedia("(max-width: 1023px)").matches;

  const person = (x, y, s, shirt, o = {}) => {
    const flip = o.flip ? `translate(${100} 0) scale(-1 1)` : "";
    const phone = o.phone === false ? "" : `<rect class="pp-phone" x="62" y="88" width="15" height="26" rx="3"/><rect class="pp-screen" x="64.5" y="91" width="10" height="19" rx="1.5"/><circle class="pp-skin" cx="70" cy="116" r="6"/>`;
    const glass = o.glass ? `<path class="pp-glass" d="M64 84h14l-2 14a5 5 0 0 1-10 0Z"/><path class="pp-line" d="M71 103v12M66 115h10"/><circle class="pp-skin" cx="71" cy="118" r="6"/>` : "";
    const flowers = o.flowers ? `<circle class="pp-f1" cx="56" cy="110" r="9"/><circle class="pp-f2" cx="68" cy="104" r="8"/><circle class="pp-f3" cx="46" cy="104" r="7"/><circle class="pp-f2" cx="60" cy="96" r="6"/><path class="pp-stem" d="M50 116l6 22 6-22Z"/>` : "";
    const bun = o.bun ? `<circle class="pp-hair" cx="50" cy="14" r="10"/>` : "";
    const long = o.long ? `<path class="pp-hair" d="M30 36C26 60 28 78 34 86L40 60ZM70 36C74 60 72 78 66 86L60 60Z"/>` : "";
    const tie = o.tie ? `<path class="pp-tie" d="M48 72h4l2 30-4 6-4-6Z"/>` : "";
    return `<g transform="translate(${x} ${y}) scale(${s})"><g transform="${flip}">
      ${bun}<ellipse class="pp-hair" cx="50" cy="38" rx="22" ry="24"/>${long}
      <ellipse class="pp-skin" cx="50" cy="44" rx="17" ry="20"/>
      <path class="pp-hair" d="M30 40C28 16 72 12 72 38 62 28 44 26 30 40Z"/>
      <rect class="pp-skin" x="44" y="60" width="12" height="12"/>
      <circle class="pp-ink" cx="43" cy="46" r="1.8"/><circle class="pp-ink" cx="57" cy="46" r="1.8"/><path class="pp-line" d="M45 54q5 4 10 0" style="stroke-width:1.6"/>
      <path class="${shirt}" d="M16 222C14 124 24 76 50 70 76 76 86 124 84 222Z"/><path class="${shirt} pp-arm" d="M76 88C90 100 88 116 76 122L66 114C74 106 74 98 68 92Z"/>${tie}
      ${o.glass ? glass : o.flowers ? flowers : phone}
    </g></g>`;
  };

  const PEOPLE = {
    "6": () => [
      person(70, 40, 1.5, "pp-s1", { glass: true, phone: false }),
      person(300, 70, 1.4, "pp-s2", { long: true, phone: false }),
      person(500, 30, 1.55, "pp-s3", { tie: true, glass: true }),
      person(720, 50, 1.5, "pp-s4", { bun: true, flowers: true }),
      person(950, 60, 1.45, "pp-s5", { long: true, glass: true }),
      person(1180, 40, 1.5, "pp-s6", { tie: true, glass: true, flip: true }),
    ].join(""),
    left: () => sp
      ? [person(20, 10, 1.1, "pp-s2", { bun: true }), person(820, 10, 1.1, "pp-s4", { long: true, flip: true })].join("")
      : [person(160, 20, 2, "pp-s2", { bun: true }), person(30, 330, 2, "pp-s1"), person(150, 620, 1.6, "pp-s5")].join(""),
    right: () => sp
      ? [0, 1, 2, 3, 4].map((i) => person(20 + i * 196, 40, 1.05, `pp-s${(i % 6) + 1}`, { flip: i % 2 === 1, bun: i === 3, long: i === 1 })).join("")
      : [person(60, 20, 2, "pp-s6", { long: true, flip: true }), person(150, 320, 2, "pp-s3", { flip: true }), person(50, 640, 1.6, "pp-s4", { flip: true })].join(""),
  };
  document.querySelectorAll("svg[data-people]").forEach((svg) => {
    const k = svg.dataset.people;
    if (sp && (k === "left" || k === "right")) svg.setAttribute("viewBox", k === "left" ? "0 0 1000 300" : "0 0 1000 320");
    svg.innerHTML = PEOPLE[k]();
  });

  const THINGS = {
    gift: `<path class="pp-paper" d="M40 120h160l-14 200H54Z"/><path class="pp-line" d="M84 120c0-60 72-60 72 0"/><path class="pp-stem" d="M120 300l40-170 10 4-36 170Z"/>
      <circle class="pp-f1" cx="220" cy="160" r="40"/><circle class="pp-f3" cx="280" cy="210" r="34"/><circle class="pp-f2" cx="200" cy="230" r="30"/><circle class="pp-f1" cx="300" cy="140" r="26"/><circle class="pp-leaf" cx="250" cy="270" r="26"/><circle class="pp-leaf" cx="320" cy="270" r="18"/>`,
    glass: `<path class="pp-glass" d="M120 150h110l-10 110a45 45 0 0 1-90 0Z" transform="rotate(-18 175 200)"/><path class="pp-wine" d="M128 210h96l-6 50a42 42 0 0 1-84 0Z" transform="rotate(-18 175 200)"/><path class="pp-line" d="M170 300l-30 110M110 420h70"/>
      <path class="pp-glass" d="M260 150h110l-10 110a45 45 0 0 1-90 0Z" transform="rotate(18 315 200)"/><path class="pp-wine" d="M268 210h96l-6 50a42 42 0 0 1-84 0Z" transform="rotate(18 315 200)"/><path class="pp-line" d="M320 300l30 110M310 420h70"/><path class="pp-line" d="M230 60v40M200 70l12 30M262 70l-12 30"/>`,
    cards: `<rect class="pp-paper" x="10" y="40" width="60" height="86" rx="6" transform="rotate(-14 40 83)"/><rect class="pp-paper" x="40" y="26" width="60" height="86" rx="6" transform="rotate(-4 70 69)"/><rect class="pp-paper" x="72" y="20" width="60" height="86" rx="6" transform="rotate(10 102 63)"/><rect class="pp-ink" x="160" y="30" width="80" height="100" rx="6" transform="rotate(12 200 80)"/>`,
    letter: `<path class="pp-cup" d="M10 10h50v50a12 12 0 0 1-12 12H22a12 12 0 0 1-12-12Z"/><rect class="pp-paper" x="80" y="20" width="150" height="150" rx="6" transform="rotate(-4 155 95)"/><path class="pp-ink" d="M150 160l90-60 6 6-90 60Z"/>`,
  };
  document.querySelectorAll("svg[data-thing]").forEach((svg) => { svg.innerHTML = THINGS[svg.dataset.thing] || ""; });

  // Map of the villa from above: three buildings and a terrace among forest circles
  const map = document.querySelector("svg[data-map]");
  if (map) {
    let trees = "";
    const rnd = (i) => (Math.sin(i * 12.9898) * 43758.5453) % 1;
    for (let i = 0; i < 70; i++) {
      const a = Math.abs(rnd(i)), b = Math.abs(rnd(i + 99)), c = Math.abs(rnd(i + 7));
      const edge = i % 2 ? a * 2000 : (a < 0.5 ? a * 500 : 1500 + a * 500);
      trees += `<circle class="${["pp-leaf", "pp-tree2", "pp-tree3"][i % 3]}" cx="${edge.toFixed(0)}" cy="${(b * 1380).toFixed(0)}" r="${(50 + c * 70).toFixed(0)}"/>`;
    }
    map.innerHTML = `<rect class="pp-ground" width="2000" height="1380"/>${trees}
      <path class="pp-roof" d="M520 300l320-120 300 120-320 130Z"/><path class="pp-wall" d="M520 300v160l300 130V430Z"/><path class="pp-paper" d="M820 430l320-130v170L820 590Z"/>
      <path class="pp-roof" d="M1180 240l260-90 240 110-260 100Z"/><path class="pp-wall" d="M1180 240v140l240 110V360Z"/>
      <path class="pp-roof" d="M300 640l220-80 220 100-220 90Z"/><path class="pp-wall" d="M300 640v120l220 90V750Z"/>
      <path class="pp-deck" d="M700 760l360-140 300 160-360 160Z"/>
      <circle class="pp-ink" cx="900" cy="760" r="14"/><circle class="pp-ink" cx="1000" cy="720" r="14"/><circle class="pp-ink" cx="1100" cy="780" r="14"/><circle class="pp-ink" cx="1000" cy="830" r="14"/>
      <rect class="pp-paper" x="860" y="380" width="160" height="70" rx="10" transform="rotate(-20 940 415)"/>`;
  }

  const faces = document.querySelectorAll("svg[data-face]");
  faces.forEach((svg, i) => {
    svg.innerHTML = `<circle class="pp-face-bg" cx="90" cy="90" r="88"/><g transform="translate(40 30) scale(1)">${person(0, 0, 1, `pp-s${(i % 6) + 1}`, { phone: false, bun: i % 2 === 0, long: i % 2 === 1 })}</g>`;
    svg.innerHTML = `<defs><clipPath id="sr-face-${i}"><circle cx="90" cy="90" r="88"/></clipPath></defs><g clip-path="url(#sr-face-${i})">${svg.innerHTML}</g>`;
  });
})();
