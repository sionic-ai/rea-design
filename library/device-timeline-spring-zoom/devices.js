// Original work images are device renders (laptop, phone, tablet, round thermostat, all-in-one screen). Device shapes are redrawn in SVG, leaving only the screen as a photo slot.
// Box ratio matches the original artwork ratio (width×height) so timeline · zoom sizes come out the same as the original. Screen slots are % of the box
window.mmDevices = (() => {
  const box = (w, h, body, screen) => ({ w, h, svg: `<svg class="mm-dv" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${body}</svg>`, screen: { x: screen[0] / w * 100, y: screen[1] / h * 100, w: screen[2] / w * 100, h: screen[3] / h * 100 } });
  return {
    laptop: () => box(2626, 1500,
      `<rect class="mm-dv-bezel" x="247" y="0" width="2132" height="1418" rx="64"/>
       <rect class="mm-dv-metal" x="0" y="1404" width="2626" height="58" rx="10"/>
       <path class="mm-dv-shade" d="M60 1462h2506c-30 24-80 38-150 38H210c-70 0-120-14-150-38z"/>
       <rect class="mm-dv-shade" x="1083" y="1404" width="460" height="22" rx="11"/>`,
      [290, 52, 2046, 1300]),
    phone: (w = 736) => box(w, 1500,
      `<rect class="mm-dv-metal" x="0" y="0" width="${w}" height="1500" rx="${w * 0.15}"/>
       <rect class="mm-dv-face" x="${w * 0.02}" y="12" width="${w * 0.96}" height="1476" rx="${w * 0.14}"/>
       <rect class="mm-dv-shade" x="${w / 2 - 60}" y="96" width="120" height="14" rx="7"/>
       <circle class="mm-dv-ring" cx="${w / 2}" cy="1400" r="${w * 0.075}"/>`,
      [w * 0.07, 190, w * 0.86, 1120]),
    classic: () => box(794, 1500,
      `<rect class="mm-dv-metal" x="0" y="0" width="794" height="1500" rx="130"/>
       <rect class="mm-dv-bezel" x="16" y="16" width="762" height="1468" rx="118"/>
       <rect class="mm-dv-shade" x="337" y="160" width="120" height="16" rx="8"/>
       <circle class="mm-dv-ring" cx="397" cy="1350" r="70"/>`,
      [78, 262, 638, 958]),
    tablet: () => box(962, 750,
      `<rect class="mm-dv-metal" x="0" y="0" width="962" height="750" rx="64"/>
       <rect class="mm-dv-bezel" x="10" y="10" width="942" height="730" rx="56"/>
       <circle class="mm-dv-ring" cx="906" cy="375" r="22"/>`,
      [96, 58, 770, 634]),
    round: () => box(1500, 1500,
      `<circle class="mm-dv-metal" cx="750" cy="750" r="745"/>
       <circle class="mm-dv-shade" cx="750" cy="750" r="640"/>
       <circle class="mm-dv-bezel" cx="750" cy="750" r="600"/>`,
      [326, 326, 848, 848]),
    desktop: (w = 1828) => box(w, 1500,
      `<rect class="mm-dv-metal" x="0" y="0" width="${w}" height="1190" rx="36"/>
       <rect class="mm-dv-bezel" x="34" y="34" width="${w - 68}" height="1012" rx="6"/>
       <path class="mm-dv-metal" d="M${w / 2 - 150} 1190h300l40 260h-380z"/>
       <rect class="mm-dv-shade" x="${w / 2 - 300}" y="1450" width="600" height="50" rx="16"/>`,
      [w * 0.03, 56, w * 0.94, 968]),
  };
})();
