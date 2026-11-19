// Tools and props hung on the workshop wall — the original is a flat illustration with a print texture, so it was redrawn at the same spot, size and grain.
// Every page uses the same drawing several times, so plant a single copy at the very start of the document <svg><use href="#aa-s-…"></svg> is called.
// Fill takes --site-* from shared.css via style (variables also pass down into the use shadow tree), so changing the skin changes it too.
(() => {
  const K = "fill:var(--site-khaki)", G = "fill:var(--site-steel)", D = "fill:var(--site-iron)", W = "fill:var(--site-paper)",
    R = "fill:var(--site-rust)", T = "fill:var(--site-tea)", V = "fill:var(--site-wood)", N = "fill:none";
  const sym = (id, vb, body) => `<symbol id="aa-s-${id}" viewBox="${vb}">${body}</symbol>`;
  const p = (d, s) => `<path d="${d}" style="${s}"/>`;
  const line = (d, s, w = 3) => `<path d="${d}" style="${N};stroke:var(${s});stroke-width:${w};stroke-linecap:round;stroke-linejoin:round"/>`;
  const SYMBOLS = [
    sym("scroll", "0 0 44 190", p("M9 42C1 22 13 3 27 4c14 1 19 22 8 33-6 6-14 3-13-5 1-6 8-6 9-1v28c6 8 6 18 0 26v32c9 9 9 27 0 37l2 36H5l2-38c-6-9-6-21 1-31V60z", K) + line("M27 14c-8 0-11 10-5 15 5 4 11-1 9-6", "--site-paper", 2.5)),
    sym("halfbody", "0 0 82 270", p("M0 0h44c4 16 6 34 4 50-3 18-16 28-16 44 0 12 10 16 22 22s28 24 28 56c0 40-24 70-46 98H0z", K) + `<rect x="4" y="6" width="6" height="258" rx="2" style="fill:var(--site-khaki-deep)"/>`),
    sym("outline", "0 0 153 270", p("M44 6c20 6 44 6 64 0 24 8 38 34 30 62-4 14-18 22-18 38 0 14 16 22 22 44 10 34 2 74-24 92-22 14-68 14-90 0C2 224-6 184 4 150c6-22 22-30 22-44 0-16-14-24-18-38C0 40 20 14 44 6zm8 24c-16 6-24 20-20 36 4 14 16 22 16 40 0 22-20 30-24 52-6 28 4 58 26 70 16 8 50 8 66 0 22-12 32-42 26-70-4-22-24-30-24-52 0-18 12-26 16-40 4-16-4-30-20-36-18 4-44 4-62 0z", G)),
    sym("back", "0 0 162 265", p("M48 2h66c-2 8 2 14 10 14 18 0 34 22 28 50-4 18-20 26-20 44 0 16 20 24 26 50 10 40-4 80-40 96-12 6-22 8-36 8l-2 2h-6l-2-2c-14 0-24-2-36-8C2 240-12 200-2 160c6-26 26-34 26-50 0-18-16-26-20-44-6-28 10-50 28-50 8 0 12-6 16-14z", K) +
      [[58, 64], [104, 64], [52, 112], [110, 112], [64, 150], [98, 150], [81, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${y === 230 ? 7 : 5}" style="${W}"/>`).join("") + `<circle cx="81" cy="14" r="6" style="${W}"/>`),
    sym("mold", "0 0 80 270", `<rect width="80" height="270" rx="3" style="${K}"/>` + line("M30 8c10 16 14 34 10 52-4 16-18 26-18 42 0 12 10 18 22 26s20 30 18 58c-2 32-16 56-34 76", "--site-paper", 3)),
    sym("hank", "0 0 48 225", p("M18 0h12l2 14-4 6c10 40 18 90 20 150 0 20-4 40-6 55H6c-2-15-6-35-6-55 2-60 10-110 20-150l-4-6z", W) + `<rect x="17" y="30" width="14" height="12" rx="2" style="${D}"/>`),
    sym("pliers", "0 0 85 70", p("M4 30 40 26l44-20-2 8-36 20 36 22 2 8-44-20-36-4z", G) + `<circle cx="42" cy="32" r="5" style="${D}"/>` + p("M30 26 24 4h6l8 22z", D)),
    sym("chisel", "0 0 20 120", `<rect x="2" y="0" width="16" height="58" rx="5" style="fill:var(--c,var(--site-khaki))"/>` + p("M7 58h6v40l-3 22-3-22z", G)),
    sym("glasses", "0 0 135 55", line("M6 30a22 18 0 1 0 44 0a22 18 0 1 0-44 0zm50-2c4-4 10-4 14 0m0 2a22 18 0 1 0 44 0a22 18 0 1 0-44 0zm44-4c8-10 18-18 26-20", "--site-iron", 5)),
    sym("tag", "0 0 45 95", line("M22 4c-8 6-8 22 0 30 8-8 8-24 0-30z", "--site-steel", 3) + p("M22 36 42 60 22 90 2 60z", G) + `<circle cx="22" cy="60" r="5" style="${W}"/>`),
    sym("jar", "0 0 40 70", `<rect x="4" y="0" width="32" height="12" rx="3" style="fill:var(--c,var(--site-iron))"/><rect x="0" y="12" width="40" height="58" rx="5" style="${G}"/><rect x="6" y="30" width="28" height="16" style="${W}"/>`),
    sym("calipers", "0 0 55 115", `<rect x="16" y="0" width="12" height="115" rx="2" style="${G}"/>` + p("M0 14h44v12H24v8H8z", G) + p("M0 50h44v12H24v8H8z", G) + `<rect x="19" y="80" width="6" height="30" style="${W}"/>`),
    sym("knife", "0 0 22 95", `<rect x="3" y="0" width="16" height="50" rx="4" style="fill:var(--c,var(--site-iron))"/>` + p("M6 50h10v30L11 95 6 80z", W)),
    sym("clamp", "0 0 50 60", p("M0 60V22C0 8 10 0 25 0s25 8 25 22v38H38V22c0-8-6-12-13-12s-13 4-13 12v38z", D)),
    sym("ruler", "0 0 25 140", `<rect width="25" height="140" rx="2" style="${G}"/>` + Array.from({ length: 13 }, (_, i) => `<rect x="${i % 2 ? 15 : 10}" y="${8 + i * 10}" width="${i % 2 ? 10 : 15}" height="2" style="${W}"/>`).join("")),
    sym("clock", "0 0 56 56", `<circle cx="28" cy="28" r="27" style="${W}"/>` + line("M28 28V12M28 28l10 8", "--site-iron", 3) + `<circle cx="28" cy="28" r="3" style="${D}"/>`),
    sym("scissors", "0 0 66 125", p("M14 2c-10 0-14 10-12 22 2 14 10 24 20 30l8 8 4 8 4-8 8-8c10-6 18-16 20-30 2-12-2-22-12-22S40 10 38 22l-5 20-5-20C26 10 24 2 14 2zm2 10c4 0 6 6 7 12l2 14c-6-4-12-10-13-18 0-4 0-8 4-8zm34 0c4 0 4 4 4 8-1 8-7 14-13 18l2-14c1-6 3-12 7-12z", R) + p("M30 66h6l-2 58h-2z", G)),
    sym("bendiron", "0 0 90 120", p("M30 0h40c12 0 20 8 20 20v40c0 12-8 20-20 20H58v-12h10c6 0 8-4 8-8V22c0-6-2-10-8-10H34c-6 0-8 4-8 10v28H14V20C14 8 20 0 30 0z", G) + p("M0 70 30 56l6 10-28 18z", W) + `<circle cx="22" cy="100" r="14" style="${N};stroke:var(--site-steel);stroke-width:4"/>`),
    sym("bridge", "0 0 80 56", p("M4 56 0 8C14 4 24 0 40 0s26 4 40 8l-4 48H58c0-8-6-14-18-14S22 48 22 56zm22-36c-4 0-6 4-4 8 2 2 6 2 8-1 2 3 6 3 8 1 2-4 0-8-4-8-2 0-4 2-4 4 0-2-2-4-4-4zm24 0c-4 0-6 4-4 8 2 2 6 2 8-1 2 3 6 3 8 1 2-4 0-8-4-8-2 0-4 2-4 4 0-2-2-4-4-4z", K)),
    sym("peg", "0 0 24 52", `<circle cx="12" cy="12" r="11" style="${D}"/>` + p("M8 20h8l-2 32h-4z", D)),
    sym("tailpiece", "0 0 75 45", p("M2 20C2 8 10 2 22 2h36c10 0 16 8 16 20s-6 20-16 20H22C10 42 2 32 2 20z", K) + [14, 30, 46, 60].map((x) => `<circle cx="${x}" cy="22" r="3.5" style="${D}"/>`).join("")),
    sym("fork", "0 0 26 90", p("M2 0h6v40c0 6 3 8 5 8s5-2 5-8V0h6v42c0 8-4 12-8 14v34H10V56C6 54 2 50 2 42z", W)),
    sym("scraper", "0 0 120 300", p("M44 0h40l14 60-22 10-22-10z", W) + p("M58 66h18l-8 30-6 140c0 14-8 22-16 22s-14-10-12-22l18-140z", D) + `<circle cx="52" cy="252" r="7" style="${K}"/>`),
    sym("gouge", "0 0 110 260", p("M40 0h30l18 70-30 14-24-14z", W) + p("M44 84h22v70H44z", G) + p("M30 150h50l-8 100c-2 8-12 10-20 10s-18-2-20-10z", K)),
    sym("pegs", "0 0 170 130", `<g transform="rotate(-40 40 40)"><circle cx="28" cy="28" r="24" style="${D}"/><path d="M20 46h16l-4 80h-8z" style="${D}"/></g><g transform="rotate(-80 110 90)"><circle cx="100" cy="80" r="24" style="${D}"/><path d="M92 98h16l-4 80h-8z" style="${D}"/></g>`),
    sym("cup", "0 0 210 215", `<circle cx="105" cy="108" r="104" style="${W}"/><circle cx="105" cy="104" r="84" style="${T}"/><circle cx="92" cy="88" r="40" style="fill:var(--site-tea-light);opacity:.35"/>`),
    sym("pen", "0 0 80 300", p("M30 0h20l4 170H26z", D) + p("M26 170h28l-2 40H28z", K) + p("M28 210h24l-8 70-4 20-4-20z", D) + p("M38 250h4v40h-4z", W)),
    sym("envelope", "0 0 200 140", `<rect x="0" y="0" width="200" height="140" rx="4" style="${W}"/>` + line("M4 6l96 70 96-70", "--site-line", 1.4)),
    sym("tailpiece-big", "0 0 120 180", p("M30 0h60c10 40 30 70 30 110 0 40-28 70-60 70S0 150 0 110C0 70 20 40 30 0z", D) + [[44, 46], [76, 46], [40, 80], [80, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" style="${W}"/>`).join("")),
    sym("violin", "0 0 300 110", p("M10 40c0-20 20-34 46-34 18 0 30 8 44 8s24-8 44-8c26 0 44 16 44 38 0 10-4 16-4 24s4 14 4 24c0 22-18 38-44 38-20 0-30-8-44-8s-26 8-44 8c-26 0-46-14-46-34 0-12 6-18 6-28S10 52 10 40z", V) + p("M188 50h80l20-6c8 0 12 4 12 10s-4 10-12 10l-20-6h-80z", D) + line("M70 30c10 10 10 40 0 50M130 30c-10 10-10 40 0 50", "--site-iron", 2.5)),
    sym("car", "0 0 120 60", p("M6 44V28c0-6 4-10 10-12l14-12h46l20 14c10 2 18 6 18 14v12z", W) + `<rect x="34" y="8" width="20" height="12" rx="2" style="${G}"/><rect x="58" y="8" width="20" height="12" rx="2" style="${G}"/><circle cx="30" cy="46" r="10" style="${D}"/><circle cx="92" cy="46" r="10" style="${D}"/>`),
    sym("sign", "0 0 70 112", `<rect x="6" y="0" width="58" height="84" rx="4" style="${W}"/><rect x="14" y="12" width="42" height="6" style="${K}"/><rect x="14" y="26" width="30" height="4" style="${G}"/><rect x="14" y="36" width="36" height="4" style="${G}"/>` + p("M14 84h6l-6 28H8zm36 0h6l6 28h-6z", D)),
  ];
  const SVG = `<svg class="aa-sprite" aria-hidden="true" width="0" height="0" style="position:absolute"><defs>
    <filter id="aa-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 1.3" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter>
    ${SYMBOLS.join("")}</defs></svg>`;
  document.body.insertAdjacentHTML("afterbegin", SVG);
})();
