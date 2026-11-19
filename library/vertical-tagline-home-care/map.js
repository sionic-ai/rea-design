// Nearby-area map: the original is a still image of a city boundary map with the radii of three bases overlaid as lime circles.
// Redrawn fresh at the same position, size and feel — green land, white dotted district border, bay (sea) at the top, three translucent circles, yellow base pill.
(() => {
  const land =
    "M44 386 58 338 96 304 126 266 146 226 166 186 188 162 208 176 230 228 252 262 276 252 300 244 318 216 330 184 348 162 382 142 410 118 436 82 458 44 488 48 518 88 540 128 562 150 590 198 600 258 580 300 592 350 570 402 582 452 562 522 512 502 470 470 422 442 380 462 332 484 290 432 240 412 198 402 138 392 90 402z";
  const sea = "M250 264 270 246 300 240 318 214 332 182 350 162 382 146 404 140 412 186 384 220 352 252 318 268 282 272z";
  const islands = ["M190 122c8-6 18-2 16 8s-14 10-18 4z", "M262 138c8-4 16 4 14 16s-6 22-14 18-8-28 0-34z", "M266 200c6-2 10 6 8 14s-10 8-12 2z"];
  const borders = [
    "M300 244 318 300 290 352 300 410",
    "M318 300 372 296 420 260 470 262",
    "M372 296 380 360 430 400 450 450",
    "M420 260 440 200 500 180 540 130",
    "M470 262 520 300 580 300",
    "M380 360 470 350 520 380 592 350",
    "M200 290 236 330 230 400",
    "M440 200 470 120",
  ];
  const names = [
    [470, 92, "Place name"], [452, 138, "Place name"], [500, 172, "Place name"], [418, 200, "District Name"], [438, 232, "Place name"], [508, 226, "Place name"],
    [508, 268, "Place name"], [514, 300, "Place name"], [508, 360, "Place name"], [356, 272, "District Name"], [406, 280, "District Name"], [450, 274, "Place name"],
    [246, 298, "District Name"], [336, 326, "District Name"], [384, 330, "District Name"], [424, 370, "Place name"], [196, 356, "Place name"], [302, 412, "District Name"],
    [440, 410, "Place name"], [376, 440, "Place name"], [498, 440, "Place name"],
  ];
  const bases = [
    { x: 398, y: 214, label: "Hub 1", w: 52 },
    { x: 302, y: 334, label: "Hub 2", w: 40 },
    { x: 370, y: 350, label: "Hub 3", w: 40 },
  ];
  const svg = `
    <svg viewBox="0 0 600 540" role="img" aria-label="Map of the areas we visit — radii of three bases overlapped as circles">
      <path d="${land}" fill="var(--site-map-land)"/>
      ${islands.map((d) => `<path d="${d}" fill="var(--site-map-land)"/>`).join("")}
      <path d="${sea}" fill="var(--site-map-sea)"/>
      <g fill="none" stroke="var(--kf-surface)" stroke-opacity=".55" stroke-width="1" stroke-dasharray="1.5 3">${borders.map((d) => `<path d="${d}"/>`).join("")}</g>
      <g style="font-family: var(--kf-font-sans)" font-size="10" fill="var(--kf-surface)" text-anchor="middle">${names.map(([x, y, t]) => `<text x="${x}" y="${y}">${t}</text>`).join("")}</g>
      <g class="ec-map__rings">${bases
        .map((b) => `<circle cx="${b.x}" cy="${b.y}" r="86" fill="var(--site-map-ring-fill)" fill-opacity=".32" stroke="var(--site-map-ring)" stroke-width="1.4"/>`)
        .join("")}</g>
      ${bases
        .map(
          (b) => `<g transform="translate(${b.x} ${b.y})">
            <circle cy="-15" r="2.2" fill="var(--site-map-ring)"/><path d="M0 -13v6" stroke="var(--site-map-ring)" stroke-width="1.4"/>
            <rect x="${-b.w / 2}" y="-7" width="${b.w}" height="20" rx="10" fill="var(--site-highlight)"/>
            <text y="7.5" text-anchor="middle" style="font-family: var(--kf-font-display)" font-size="11.5" fill="var(--kf-accent)">${b.label}</text>
          </g>`
        )
        .join("")}
    </svg>`;
  window.EC.page("*", { build: (box) => box.querySelectorAll("[data-map]").forEach((el) => (el.innerHTML = svg)) });
})();
