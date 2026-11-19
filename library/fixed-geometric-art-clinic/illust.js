/* Geometric illustration pinned to the left — the original is a raster picture (five layers + per-section layers), so we redraw it with our own shapes in the same position, size and grain.
   base: arch pillar · cloud plate · circle · diagonal bar · small bird (Hero · About · Notice), care: figure standing under an arch (obstetrics).
   [data-illust="base"][data-layer="1".."5"] are the layers that turn on in order during the opening, data-layer="all" is the fully drawn plate, data-motif is the per-section layer of extra drawing.
   Colors are painted by class only, and the values are set by --site-ill-* in shared.css (made from the skin variables). */
(() => {
  const L = {
    base: [
      // 1 — Base panel: pale blue-gray cloud panel and arches
      `<path class="i-pale" d="M318 0h650v470c-40 30-10 70-60 92-40 18-30 70-80 70H760c-30 0-40-34-70-40-50-10-60 30-110 18-46-12-30-60-74-74-30-10-46 14-60 0z"/>
       <path class="i-pale2" d="M0 0h90v700H0z M100 150h120v560H100z"/>
       <path class="i-pale" d="M230 440V170a60 60 0 0 1 120 0v270z"/>
       <path class="i-pale2" d="M330 650h230v80H330z M560 300h90v120h-90z"/>
       <circle class="i-pale" cx="270" cy="740" r="68"/><circle class="i-pale" cx="270" cy="880" r="74"/>`,
      // 2 — Blue surface: half circle · bar
      `<path class="i-blue i-mul" d="M0 440V260a75 75 0 0 1 75 75v105z M0 880a110 110 0 0 1 110 110H0z"/>
       <path class="i-blue2 i-mul" d="M420 330h140v320H420z"/>
       <path class="i-blue i-mul" d="M620 360c40-56 100-66 150-54-30 50-80 80-150 54z"/>
       <path class="i-blue2 i-mul" d="M900 640h75v260h-75z"/>`,
      // 3 — Navy: long arched pillars · small squares · floor panel
      `<path class="i-navy" d="M165 800V160a32 32 0 0 1 64 0v640z"/>
       <path class="i-navy" d="M425 330h45v110h-45z M370 735h200v100H370z M850 735h55v65h-55z M125 690h40v115h-40z"/>
       <path class="i-navy" d="M545 435a48 48 0 0 1 96-2c-26-12-60-8-96 2z"/>
       <path class="i-navy" d="M728 297c4-30 22-50 50-50 20 0 32 14 32 30v20z"/>`,
      // 4 — Sage: triangle, big circle, square
      `<path class="i-sage i-mul" d="M405 650 565 440v210z"/>
       <circle class="i-sage i-mul" cx="685" cy="752" r="145"/>
       <path class="i-sage i-mul" d="M900 800h75v95h-75z M345 440h80v210h-80z"/>`,
      // 5 — orange and white panel: sun, diagonal bars, pieces, new eye
      `<circle class="i-orange" cx="676" cy="116" r="42"/>
       <path class="i-orange i-mul" d="M760 518h92L690 900h-92z"/>
       <path class="i-orange i-mul" d="M780 800h40v60c-22 0-40-26-40-60z"/>
       <path class="i-white" d="M740 330h120l-20 50 30 80H760l-24-80z"/>
       <circle class="i-white" cx="792" cy="280" r="7"/>`,
    ],
    care: [
      `<path class="i-pale" d="M80 0h520v1000H80z" opacity=".55"/>
       <circle class="i-pale" cx="520" cy="520" r="250"/>
       <path class="i-pale2" d="M60 380h120v280H60z M180 560h120v220H180z"/>`,
      `<path class="i-blue2 i-mul" d="M120 640h90v160h-90z"/>
       <circle class="i-sage i-mul" cx="70" cy="90" r="48"/><circle class="i-sage i-mul" cx="200" cy="900" r="22"/>`,
      `<path class="i-pink" d="M150 520V230a170 170 0 0 1 340 0v80h-90v-80a80 80 0 0 0-160 0v290z"/>`,
      `<path class="i-blue i-mul" d="M380 330c30-20 70-14 84 20l26 120c40 30 52 120 40 220l-20 230h-150l20-260c-40-40-50-120-30-190z"/>
       <path class="i-navy" d="M420 250a46 46 0 1 1 92 0c0 30-20 46-46 46s-46-16-46-46z M500 330c40 30 50 90 40 150l-40-10z M400 900h70v30h-70z M500 900h60v30h-60z"/>`,
      `<ellipse class="i-pink i-mul" cx="520" cy="440" rx="62" ry="48" transform="rotate(-18 520 440)"/>
       <path class="i-navy" d="M250 520h40v60h-40z"/>`,
    ],
  };
  const motifs = {
    obstetrics: `<circle class="i-orange i-mul" cx="610" cy="520" r="40"/><circle class="i-white" cx="610" cy="520" r="14"/>`,
    gynecology: `<path class="i-sage i-mul" d="M560 160c40-40 100-30 120 10-40 40-100 40-120-10z M600 230c40-30 90-16 104 20-40 30-92 26-104-20z"/>`,
    support: `<circle class="i-blue i-mul" cx="520" cy="210" r="34"/><circle class="i-sage i-mul" cx="566" cy="210" r="34"/>`,
  };
  const grain = (id) => `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .35"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter>`;
  let uid = 0;
  const svg = (inner) => {
    const id = `tl-grain-${++uid}`;
    return `<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs>${grain(id)}</defs><g class="i-art">${inner}</g><g class="i-grain" filter="url(#${id})">${inner}</g></svg>`;
  };
  window.tlIllust = (scope = document) => scope.querySelectorAll("[data-illust]:not([data-drawn])").forEach((el) => {
    el.dataset.drawn = "1";
    const set = L[el.dataset.illust] || L.base, layer = el.dataset.layer || "all";
    let inner = layer === "all" ? set.join("") : set[+layer - 1] || "";
    if (el.dataset.motif) inner += motifs[el.dataset.motif] || "";
    el.insertAdjacentHTML("afterbegin", svg(inner));
  });
  window.tlIllust();
})();
