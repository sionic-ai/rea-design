/* Watercolor animal illustration spots from the original, redrawn as new SVG at the same place, size and pose. All fills are --site-ill-* classes in shared.css so they change together when the skin is swapped.
   [data-art="walrus"] [data-art-state="after"] if placed like this, it is filled in. after is the second image where the symptoms show (original pic2). */
(() => {
  const W = 400, H = 488;
  // Watercolor texture — SVG filters produce the original art’s bleeding brush edges, paint pooled at the edges as it dries, and paper grain stains. Each artwork has a different viewBox width so
  // For each width breakpoint (120·200·400·640) there is a filter whose frequency and wobble are tuned so it looks the same on screen. Fills stay --site-ill-* so they follow the skin
  const WC_W = [120, 200, 400, 640];
  const wcFilter = (w) => {
    const k = w / 400;
    return `<filter id="mk-wc-${w}" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="${(0.03 / k).toFixed(4)}" numOctaves="2" seed="4" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="${(7 * k).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feGaussianBlur in="shape" stdDeviation="${(3 * k).toFixed(2)}" result="soft"/>
      <feComposite in="shape" in2="soft" operator="arithmetic" k2="1.2" k3="-0.3" result="pool"/>
      <feTurbulence type="fractalNoise" baseFrequency="${(0.55 / k).toFixed(3)}" numOctaves="2" seed="9" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.6 1.25" result="grainA"/>
      <feComposite in="pool" in2="grainA" operator="in"/>
    </filter>`;
  };
  const defs = () => {
    if (document.getElementById("mk-wc-defs")) return;
    document.body.insertAdjacentHTML("beforeend", `<svg id="mk-wc-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${WC_W.map(wcFilter).join("")}</svg>`);
  };
  const wcId = (w) => "mk-wc-" + WC_W.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a));
  const svg = (body, vb = `0 0 ${W} ${H}`, par = "xMidYMax meet") =>
    `<svg class="ar" viewBox="${vb}" preserveAspectRatio="${par}" aria-hidden="true"><g filter="url(#${wcId(+vb.split(" ")[2])})">${body}</g></svg>`;
  const whisk = (x, y, s = 1) =>
    [-1, 0, 1, 2].map((i) => `<path class="ar-line" d="M${x} ${y + i * 6 * s} q${-26 * s} ${4 + i * 3} ${-48 * s} ${10 + i * 8}"/><path class="ar-line" d="M${x + 22 * s} ${y + i * 6 * s} q${26 * s} ${4 + i * 3} ${48 * s} ${10 + i * 8}"/>`).join("");

  const A = {};
  A.walrus = (after) => svg(`
    <path class="ar-red" d="M70 488 C40 420 52 300 96 236 C120 200 160 180 210 182 C292 186 352 250 372 330 C388 396 380 456 360 488 Z"/>
    <path class="ar-red-d" d="M300 488 C330 430 340 360 318 300 C350 340 366 410 352 488 Z" opacity=".55"/>
    <path class="ar-red" d="M8 470 C40 440 80 430 120 440 L132 488 L0 488 Z"/>
    <path class="ar-red-d" d="M14 480 l20 -18 M34 484 l22 -20 M58 486 l18 -18" />
    <ellipse class="ar-red" cx="${after ? 170 : 186}" cy="${after ? 176 : 150}" rx="88" ry="74" transform="rotate(${after ? -16 : -4} ${after ? 170 : 186} ${after ? 176 : 150})"/>
    <ellipse class="ar-red-d" cx="${after ? 150 : 172}" cy="${after ? 214 : 186}" rx="58" ry="34"/>
    <path class="ar-tusk" d="M${after ? 128 : 150} ${after ? 226 : 200} q-8 70 4 112 q10 -40 10 -108 Z"/>
    <path class="ar-tusk" d="M${after ? 172 : 196} ${after ? 228 : 202} q2 72 18 108 q4 -44 -4 -108 Z"/>
    <ellipse class="ar-ink" cx="${after ? 136 : 158}" cy="${after ? 150 : 128}" rx="6" ry="${after ? 2 : 6}"/>
    <ellipse class="ar-ink" cx="${after ? 192 : 214}" cy="${after ? 142 : 124}" rx="6" ry="${after ? 2 : 6}"/>
    <g>${whisk(after ? 138 : 160, after ? 206 : 180, 0.9)}</g>
    ${after ? `<g class="ar-patch-w"><ellipse cx="128" cy="112" rx="22" ry="14"/><ellipse cx="236" cy="150" rx="16" ry="22"/><ellipse cx="208" cy="96" rx="10" ry="8"/><circle cx="250" cy="196" r="7"/></g>
      <path class="ar-line" d="M270 110 q14 -10 8 -26 M286 124 q16 -6 14 -22 M262 96 q4 -14 -6 -22"/>` : ""}
  `);
  A.gorilla = (after) => svg(`
    <path class="ar-dark" d="M40 488 C30 400 60 300 110 250 C140 220 170 210 200 210 C240 210 280 226 310 260 C356 312 372 400 364 488 Z"/>
    <path class="ar-gray" d="M130 488 C120 420 140 330 200 316 C262 330 282 420 270 488 Z"/>
    ${after ? `<path class="ar-dark" d="M300 300 C340 250 360 170 330 110 C310 80 270 76 250 100 L240 130 C270 120 290 140 290 170 C288 220 270 260 250 290 Z"/>
      <ellipse class="ar-dark" cx="244" cy="108" rx="30" ry="22"/>` : `<path class="ar-dark" d="M80 488 C70 430 90 360 120 330 L140 488 Z"/><path class="ar-dark" d="M320 488 C330 430 310 360 280 330 L262 488 Z"/>`}
    <ellipse class="ar-dark" cx="200" cy="200" rx="70" ry="76"/>
    <path class="ar-gray" d="M152 190 C150 160 176 150 200 152 C226 150 250 160 248 190 C250 236 230 262 200 264 C170 262 150 236 152 190 Z"/>
    <path class="ar-ink" d="M160 172 q20 -10 34 0 M206 172 q20 -10 34 0" />
    <circle class="ar-ink" cx="178" cy="184" r="${after ? 3 : 5}"/><circle class="ar-ink" cx="222" cy="184" r="${after ? 3 : 5}"/>
    <ellipse class="ar-ink" cx="200" cy="216" rx="22" ry="12"/>
    ${after ? `<path class="ar-light" d="M176 236 l8 10 l8 -10 l8 10 l8 -10 l8 10 l8 -10 v14 h-48 Z"/>
      <g class="ar-patch"><ellipse cx="270" cy="250" rx="18" ry="12"/><ellipse cx="160" cy="430" rx="22" ry="16"/><ellipse cx="300" cy="438" rx="14" ry="18"/><circle cx="238" cy="292" r="8"/></g>` : `<path class="ar-ink" d="M184 244 q16 6 32 0" />`}
  `);
  A.zebra = (after) => {
    const stripes = Array.from({ length: 9 }, (_, i) => `<path class="ar-ink" d="M${70 + i * 30} 488 C${60 + i * 30} 440 ${84 + i * 30} 380 ${74 + i * 30} 330 L${90 + i * 30} 330 C${100 + i * 30} 380 ${78 + i * 30} 440 ${92 + i * 30} 488 Z"/>`).join("");
    const neck = Array.from({ length: 6 }, (_, i) => `<path class="ar-ink" d="M${214 + i * 12} ${300 - i * 34} l70 -6 l-4 14 l-68 8 Z"/>`).join("");
    return svg(`
      <path class="ar-light" d="M40 488 C36 420 50 350 100 320 C150 296 210 300 240 320 L280 488 Z"/>
      ${stripes}
      <path class="ar-light" d="M210 330 C200 260 230 170 290 110 L330 120 C320 190 300 260 290 340 Z"/>
      ${neck}
      <path class="ar-light" d="M280 60 C300 40 340 50 352 80 L380 180 C384 200 366 210 350 204 L300 150 Z"/>
      <path class="ar-ink" d="M352 178 C362 170 384 176 382 196 C378 212 356 212 350 200 Z"/>
      <path class="ar-light" d="M286 52 l-6 -38 l22 30 Z"/><path class="ar-light" d="M312 46 l6 -36 l10 40 Z"/>
      <path class="ar-ink" d="M296 30 l-4 22 M300 72 l40 -8 M306 96 l42 -6 M314 120 l38 -4"/>
      <ellipse class="ar-ink" cx="${after ? 326 : 318}" cy="${after ? 112 : 110}" rx="5" ry="${after ? 3 : 5}"/>
      <ellipse class="ar-light ar-hole" cx="${after ? 150 : 140}" cy="${after ? 404 : 410}" rx="${after ? 52 : 40}" ry="${after ? 74 : 58}"/>
      ${after ? `<path class="ar-water-drop" d="M340 130 q6 12 0 18 q-6 -6 0 -18 Z"/>` : ""}
    `);
  };
  A.sheep = (after) => {
    const puffs = [[120, 330, 70], [200, 300, 80], [280, 330, 70], [90, 410, 70], [200, 400, 100], [310, 410, 70], [150, 470, 70], [260, 470, 70]]
      .map(([x, y, r]) => `<circle class="ar-cream" cx="${x}" cy="${y}" r="${r}"/>`).join("");
    return svg(`
      ${puffs}
      <path class="ar-line ar-wool" d="M80 340 q20 -14 40 0 q20 -14 40 0 M220 300 q20 -14 40 0 M120 430 q20 -14 40 0 q20 -14 40 0 q20 -14 40 0 M240 380 q20 -14 40 0"/>
      <ellipse class="ar-cream" cx="${after ? 326 : 318}" cy="214" rx="56" ry="66"/>
      <ellipse class="ar-skin" cx="${after ? 336 : 328}" cy="240" rx="34" ry="44"/>
      <ellipse class="ar-skin" cx="${after ? 274 : 266}" cy="196" rx="24" ry="10" transform="rotate(-20 270 196)"/>
      <circle class="ar-ink" cx="${after ? 322 : 314}" cy="226" r="4"/><circle class="ar-ink" cx="${after ? 352 : 344}" cy="226" r="4"/>
      <path class="ar-ink" d="M${after ? 330 : 322} 262 q8 6 16 0"/>
      ${after ? `<ellipse class="ar-skin ar-bald" cx="200" cy="330" rx="46" ry="34"/><ellipse class="ar-skin ar-bald" cx="120" cy="420" rx="22" ry="18"/>` : ""}
    `);
  };
  A.raccoon = (after) => svg(`
    <path class="ar-gray" d="M60 488 C56 410 90 330 150 300 C190 284 230 286 262 304 C320 336 340 420 330 488 Z"/>
    <path class="ar-light" d="M140 488 C136 430 160 380 200 372 C240 380 262 430 258 488 Z" opacity=".7"/>
    <path class="ar-gray" d="M310 470 C350 440 380 380 372 300 L392 306 C400 390 372 456 330 488 Z"/>
    <path class="ar-ink" d="M372 318 l20 4 M370 350 l22 2 M364 384 l22 2 M354 418 l20 4"/>
    <ellipse class="ar-gray" cx="200" cy="230" rx="80" ry="66"/>
    <path class="ar-gray" d="M136 186 l-10 -48 l40 30 Z M264 186 l10 -48 l-40 30 Z"/>
    <path class="ar-ink" d="M130 226 C150 200 180 206 196 226 C180 246 150 250 130 226 Z M270 226 C250 200 220 206 204 226 C220 246 250 250 270 226 Z"/>
    <path class="ar-light" d="M176 250 C186 236 214 236 224 250 C222 276 178 276 176 250 Z"/>
    <circle class="ar-light" cx="164" cy="224" r="5"/><circle class="ar-light" cx="236" cy="224" r="5"/>
    <ellipse class="ar-ink" cx="200" cy="252" rx="9" ry="6"/>
    <circle class="ar-orange" cx="${after ? 150 : 200}" cy="${after ? 420 : 416}" r="34"/>
    <ellipse class="ar-gray" cx="${after ? 120 : 170}" cy="420" rx="26" ry="18"/><ellipse class="ar-gray" cx="${after ? 180 : 230}" cy="420" rx="26" ry="18"/>
    ${after ? `<g class="ar-blister"><circle cx="112" cy="414" r="5"/><circle cx="126" cy="424" r="4"/><circle cx="184" cy="412" r="5"/><circle cx="196" cy="424" r="4"/><circle cx="172" cy="428" r="3"/></g>` : ""}
  `);
  A.momonga = () => svg(`
    <path class="ar-gray" d="M10 70 C40 40 90 30 120 34 C150 30 200 40 230 70 C200 80 180 96 170 120 C150 110 90 110 70 120 C60 96 40 80 10 70 Z"/>
    <ellipse class="ar-gray" cx="120" cy="40" rx="34" ry="28"/>
    <path class="ar-light" d="M96 46 C104 36 136 36 144 46 C140 60 100 60 96 46 Z" opacity=".8"/>
    <circle class="ar-ink" cx="106" cy="38" r="6"/><circle class="ar-ink" cx="134" cy="38" r="6"/>
    <path class="ar-gray" d="M110 118 q10 40 0 60 q14 -18 20 -60 Z"/>
  `, "0 0 240 180");
  A["momonga-face"] = (after) => svg(`
    <ellipse class="ar-gray" cx="60" cy="74" rx="52" ry="46"/>
    <path class="ar-gray" d="M18 46 l-6 -30 l26 18 Z M102 46 l6 -30 l-26 18 Z"/>
    <path class="ar-light" d="M28 70 C34 54 86 54 92 70 C88 98 32 98 28 70 Z" opacity=".85"/>
    ${after ? `<path class="ar-line" d="M32 66 q8 -9 16 0 M72 66 q8 -9 16 0" style="stroke-width:4;opacity:1"/>` : `<circle class="ar-ink" cx="40" cy="64" r="9"/><circle class="ar-ink" cx="80" cy="64" r="9"/>
    <circle class="ar-light" cx="43" cy="61" r="2.5"/><circle class="ar-light" cx="83" cy="61" r="2.5"/>`}
    <ellipse class="ar-ink" cx="60" cy="80" rx="4" ry="3"/>
  `, "0 0 120 120");
  A.island = () => {
    const trees = [[150, 300], [190, 330], [240, 310], [120, 360], [300, 350], [350, 330], [420, 300], [470, 330], [520, 360], [200, 380], [260, 400], [440, 380], [560, 330], [100, 410], [380, 420]]
      .map(([x, y], i) => `<path class="${i % 3 ? "ar-tree" : "ar-tree-d"}" d="M${x} ${y - 46} C${x + 20} ${y - 30} ${x + 22} ${y - 4} ${x} ${y} C${x - 22} ${y - 4} ${x - 20} ${y - 30} ${x} ${y - 46} Z"/><path class="ar-bark" d="M${x - 2} ${y} h4 v12 h-4 Z"/>`).join("");
    return svg(`
      <path class="ar-sand" d="M40 430 C30 360 90 300 180 290 C300 270 470 280 560 320 C620 350 640 420 600 470 C540 540 400 560 280 550 C150 540 50 500 40 430 Z"/>
      <path class="ar-rock-d" d="M150 300 L300 40 L340 110 L380 70 L470 300 Z"/>
      <path class="ar-rock" d="M300 40 L250 200 L210 300 L150 300 Z M380 70 L420 200 L470 300 L400 300 Z"/>
      <path class="ar-snow" d="M300 40 L282 98 L300 90 L318 106 L332 96 Z M380 70 L368 108 L384 102 L396 116 Z"/>
      <path class="ar-tree-l" d="M60 400 C60 330 140 290 240 280 C360 270 500 280 560 320 C600 350 600 400 560 420 C440 450 200 460 60 400 Z"/>
      <path class="ar-water" d="M380 330 C420 316 500 320 520 340 C530 356 490 366 440 362 C400 360 370 346 380 330 Z"/>
      <path class="ar-water" d="M80 420 C140 400 200 420 240 410 C280 400 300 420 340 418 L340 428 C300 432 270 412 236 424 C190 436 130 414 84 432 Z"/>
      ${trees}
    `, "0 0 640 560");
  };
  A.tree = () => svg(`
    <path class="ar-bark" d="M0 0 H210 C200 140 222 300 206 470 C194 640 226 800 214 1000 H0 Z"/>
    <path class="ar-bark-l" d="M24 0 C36 160 14 320 34 520 C44 700 24 860 38 1000 H66 C56 840 76 680 62 500 C46 320 66 160 54 0 Z" opacity=".45"/>
    <path class="ar-bark-l" d="M120 0 C130 200 112 380 128 560 C140 760 120 880 132 1000 H146 C136 860 156 740 142 560 C128 380 146 200 134 0 Z" opacity=".3"/>
    <path class="ar-bark" d="M196 150 C226 110 244 70 262 20 L272 30 C256 84 236 130 206 186 Z"/>
  `, "0 0 280 1000", "xMinYMin slice");
  // Full-screen tree bark for the phone condition header (original pic-tree_sp — stretched to 101% width and 100% height)
  A.bark = () => {
    const ridges = Array.from({ length: 11 }, (_, i) => {
      const x = 8 + i * 37, w = 10 + ((i * 7) % 9);
      return `<path class="ar-bark-l" opacity="${0.18 + ((i * 5) % 4) * 0.08}" d="M${x} 0 C${x + 14} 140 ${x - 10} 300 ${x + 6} 460 C${x + 18} 620 ${x - 6} 760 ${x + 4} 860 H${x + w + 4} C${x + w - 6} 760 ${x + w + 18} 620 ${x + w + 6} 460 C${x + w - 10} 300 ${x + w + 14} 140 ${x + w} 0 Z"/>`;
    }).join("");
    return svg(`<rect class="ar-bark" width="400" height="860"/>${ridges}`, "0 0 400 860", "none");
  };
  A.branch = () => svg(`
    <path class="ar-bark" d="M0 70 C50 60 100 50 150 30 C164 24 176 20 186 22 L184 32 C170 34 150 44 120 58 C90 72 50 86 0 92 Z"/>
    <path class="ar-bark" d="M96 56 C110 40 120 24 124 8 L132 10 C128 30 118 48 104 62 Z"/>
    <path class="ar-tree" d="M124 8 c10 -8 24 -6 30 2 c-10 8 -22 8 -30 -2 Z M150 26 c10 -6 22 -2 26 6 c-10 6 -20 4 -26 -6 Z"/>
  `, "0 0 186 100");
  A.woodpecker = () => svg(`
    <ellipse class="ar-ink" cx="60" cy="70" rx="22" ry="44" transform="rotate(20 60 70)"/>
    <ellipse class="ar-light" cx="64" cy="66" rx="12" ry="28" transform="rotate(20 64 66)"/>
    <circle class="ar-ink" cx="44" cy="28" r="16"/><path class="ar-patch" d="M40 14 a12 10 0 0 1 16 4 l-10 6 Z"/>
    <path class="ar-tusk" d="M30 30 l-26 6 l26 2 Z"/>
    <path class="ar-patch" d="M70 104 q10 16 2 30 q-10 -12 -2 -30 Z"/>
  `, "0 0 100 140");
  A.hippo = () => svg(`
    <path class="ar-gray" d="M10 200 C0 150 20 110 60 96 L130 20 C150 0 190 10 196 40 L180 110 C200 140 196 190 170 200 Z"/>
    <path class="ar-patch" d="M70 104 L140 40 C160 30 176 44 170 64 L130 120 Z" opacity=".75"/>
    <path class="ar-light" d="M120 46 l10 20 l8 -24 Z M150 52 l6 18 l8 -20 Z"/>
    <circle class="ar-ink" cx="60" cy="130" r="5"/>
  `, "0 0 200 200");
  A.giraffe = () => {
    const spots = [[60, 60], [80, 110], [50, 150], [90, 190], [120, 160], [140, 220], [100, 250], [160, 270]]
      .map(([x, y]) => `<path class="ar-red-d" d="M${x - 10} ${y - 8} q14 -6 22 4 q2 14 -10 16 q-14 -2 -12 -20 Z"/>`).join("");
    return svg(`
      <path class="ar-cream" d="M40 20 C70 10 90 30 84 60 C100 120 130 180 190 230 L190 300 L60 300 C80 250 50 160 30 80 C20 50 24 30 40 20 Z"/>
      ${spots}
      <circle class="ar-ink" cx="56" cy="36" r="4"/>
    `, "0 0 200 300");
  };
  A.grass = () => svg(`
    ${Array.from({ length: 14 }, (_, i) => `<path class="${i % 2 ? "ar-tree" : "ar-tree-d"}" d="M${10 + i * 14} 120 q${i % 2 ? 6 : -6} -60 ${i % 3 ? 14 : -4} -${70 + (i * 13) % 40} q-4 50 2 110 Z"/>`).join("")}
  `, "0 0 220 120");

  const fill = (root = document) => {
    defs();
    root.querySelectorAll("[data-art]:not([data-art-done])").forEach((el) => {
      const make = A[el.dataset.art];
      if (!make) return;
      el.innerHTML = make(el.dataset.artState === "after");
      el.setAttribute("data-art-done", "");
    });
  };
  window.MKArt = { fill, draw: (name, after) => (A[name] ? A[name](after) : "") };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => fill());
  else fill();
})();
