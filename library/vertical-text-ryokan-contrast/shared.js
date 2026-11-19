// Shared by all pages: plugs in the brush-stroke logo, menu modal and footer as one set, and draws menu open/close, the building guide map and the coast map.
// must finish before fx-core scans at DOMContentLoaded so that the logo layers of the opening curtain (data-fx-part="layer") is caught by this part — so it spins right at the end of body
(() => {
  // Four brush strokes + seal — not the original logo but our own art in the same spot and size
  const STROKES = [
    "M30 8c6 2 9 9 7 18-2 10-8 20-6 30 1 5-4 6-6 2-4-10 2-22 3-32 1-7-2-13 2-18z",
    "M46 14c8-4 16 0 15 9-1 8-8 14-14 19-3 2-5-1-3-3 5-5 10-10 10-16 0-5-5-7-9-6-3 1-4-2 1-3zM70 22c4-1 8 2 7 6-1 3-5 4-7 2-2-2-2-6 0-8z",
    "M14 70c14-6 34-8 54-6 10 1 22 4 30 9 2 2 0 4-3 3-14-6-34-7-52-5-10 1-20 3-28 5-4 1-5-4-1-6z",
    "M40 76c4 6 4 18 2 30-1 5-6 5-6 0 0-10 2-20 1-28 0-3 2-4 3-2zM58 82c5 4 6 12 4 20-1 3-5 3-5 0 1-6 0-12-1-18 0-2 1-3 2-2zM74 80c6 3 8 10 6 16-1 3-4 2-4 0 0-5-1-10-3-14-1-2 0-3 1-2z",
  ];
  const SEAL = '<rect class="is-seal" x="4" y="98" width="11" height="11" rx="1"/><path class="is-seal-mark" d="M7 101h5M9.5 101v6M7 106h5"/>';
  const svg = (inner) => `<svg viewBox="0 0 108 117" fill="currentColor" aria-hidden="true">${inner}</svg>`;
  document.querySelectorAll("[data-logo]").forEach((el) => {
    if (el.dataset.logo === "layers") {
      // Opening: one layer per stroke — the seal on the last layer
      el.outerHTML = STROKES.map((d, i) => `<span class="sg-logo" data-fx-part="layer">${svg(`<path d="${d}"/>${i === STROKES.length - 1 ? SEAL : ""}`)}</span>`).join("");
    } else el.innerHTML = svg(STROKES.map((d) => `<path d="${d}"/>`).join("") + SEAL);
  });

  const NAV = [
    ["index.html", "Saw"], ["about.html", "Get to know this place"], ["service.html", "Guest room"], ["about.html#food", "Meal"],
    ["index.html#private", "Full venue rental"], ["index.html#access", "Directions"], ["news.html", "News"], ["#", "Frequently asked questions"],
  ];
  const SUB = [["#", "Inquiry"], ["#", "Hiring Info"], ["#", "Privacy policy"]];
  const PIN = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a5 5 0 0 0-5 5c0 4 5 9 5 9s5-5 5-9a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>';
  const IG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><rect x="1.5" y="1.5" width="13" height="13" rx="3.5"/><circle cx="8" cy="8" r="3"/><circle cx="12" cy="4" r=".6" fill="currentColor"/></svg>';
  const CAL = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor"><rect x="2.5" y="4" width="15" height="13.5"/><path d="M2.5 8h15M6.5 2v4M13.5 2v4M7 12.5l2 2 4-4"/></svg>';
  const TEL = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M5 2.5l3 3.5-2 2c1 2.5 3 4.5 5.5 5.5l2-2 3.5 3-2 3C8 17 3 12 2.5 4.5z"/></svg>';
  const logo = () => svg(STROKES.map((d) => `<path d="${d}"/>`).join("") + SEAL);

  const foot = document.querySelector("[data-foot]");
  if (foot) foot.innerHTML = `
    <div class="sg-foot__top">
      <div class="sg-foot__brand"><a class="sg-logo" href="index.html" aria-label="Your lodging name here">${logo()}</a>
        <div class="sg-foot__addr"><a href="#">${PIN}<span>A seaside town 000-000</span></a><a href="#">${IG}<span>Instagram</span></a></div></div>
      <nav class="sg-foot__nav">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
    </div>
    <div class="sg-foot__bottom">${SUB.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}<small>© 2026 BRAND</small></div>`;

  const menu = document.querySelector("[data-menu]");
  if (menu) {
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");
    menu.setAttribute("aria-label", "Menu");
    menu.innerHTML = `
      <div class="sg-menu__side">
        <h2>Reservation</h2>
        <p>Phone inquiries · reservations at<br>This way</p>
        <a class="sg-btn is-dark" href="#">${CAL}<i></i><span>Booking · Check vacancies</span></a>
        <a class="sg-btn is-tel is-line" href="#">${TEL}<i></i><span>00-0000-0000</span></a>
        <small>Check-in 15:30 / Check-out 11:00</small>
      </div>
      <div class="sg-menu__main">
        <div class="sg-menu__lists">
          <nav class="sg-menu__nav">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
          <div class="sg-menu__sub">${SUB.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div>
        </div>
        <div class="sg-menu__foot"><small>© 2026 BRAND</small><div class="sg-foot__addr">${`<a href="#">${PIN}<span>A seaside town 000-000</span></a><a href="#">${IG}<span>Instagram</span></a>`}</div><span class="sg-logo">${logo()}</span></div>
      </div>
      <button class="sg-menu__close" type="button" data-menu-close><svg viewBox="0 0 72 16" fill="none" stroke="currentColor"><path d="M18 1l36 14M18 15L54 1"/></svg><span>Close</span></button>`;
    let last = null;
    const open = (from) => {
      last = from;
      // The original modal opens slightly after the press (motion-probe: the button row starts reversing at 125ms — the copy matches at a 20ms delay) — open with the same tempo.
      // <dialog> It is showModal, so scrolling of the page behind is not blocked
      // Make the page behind inert — like showModal, the hover on the menu button where the hand was resting is released and the line turns back into place (Chrome releases hover late, so it also reverts via a body marker)
      setTimeout(() => {
        for (const n of document.body.children) if (n !== menu && n.tagName !== "SCRIPT") n.inert = true;
        document.body.classList.add("is-menu-open");
        menu.classList.add("is-open");
        menu.querySelector("[data-menu-close]").focus({ preventScroll: true });
      }, 20);
    };
    const close = () => {
      for (const n of document.body.children) n.inert = false;
      document.body.classList.remove("is-menu-open");
      menu.classList.remove("is-open");
      last?.focus({ preventScroll: true });
    };
    document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", () => open(b)));
    menu.querySelector("[data-menu-close]").addEventListener("click", close);
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) close(); });
  }

  // Floor plan: two buildings stacked as tilted plates per floor (our own SVG in the same spot and size instead of the original image)
  const floor = document.querySelector("[data-floor-map]");
  if (floor) {
    const W = 867, H = 566;
    const slab = (x, y, w, d, cls, label) => {
      const p = [[x, y], [x + w, y], [x + w + d * 0.9, y + d * 0.5], [x + d * 0.9, y + d * 0.5]].map((q) => q.join(",")).join(" ");
      return `<polygon class="${cls}" points="${p}"/>${label ? `<text x="${x + (w + d * 0.9) / 2}" y="${y + d * 0.28}">${label}</text>` : ""}`;
    };
    let g = "";
    // Main building: ground-floor lobby with one room, floors 2 and 3 with two rooms each
    [[0, 420, ["Lamplight", "Lobby"]], [1, 300, ["Waterside", "Flower"]], [2, 180, ["Peak", "Moon"]]].forEach(([i, y, names]) => {
      g += slab(130, y, 230, 120, "is-floor", "");
      g += slab(140, y + 6, 100, 50, "is-room", names[0]) + slab(250, y + 6, 100, 50, "is-room", names[1]);
    });
    // VIP hall: one room per floor, the top is the VIP suite
    [[0, 420, "Dining spot"], [1, 300, "Sea"], [2, 180, "Fresh blue"], [3, 60, "Mountain"]].forEach(([i, y, name]) => {
      g += slab(470, y, 210, 120, "is-floor is-annex", "") + slab(480, y + 8, 180, 60, "is-room is-annex", name);
    });
    g += '<path class="is-guide" d="M135 120v300M475 30v390M800 60h40M800 180h40M800 300h40M800 420h40"/>';
    g += '<g class="is-tag"><rect x="120" y="96" width="56" height="20"/><text x="148" y="110">Main building</text><rect x="460" y="6" width="68" height="20"/><text x="494" y="20">VIP hall</text></g>';
    g += ["4th floor", "3rd floor", "2nd floor", "1st floor"].map((t, i) => `<text class="is-lv" x="848" y="${64 + i * 120}">【${t}】</text>`).join("");
    g += '<text class="is-lv" x="110" y="548">Entrance</text><path class="is-guide" d="M100 530l20 10"/>';
    floor.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Floor-by-floor room layout of both buildings">${g}</svg>`;
  }

  // Coast map — jagged coastline and lodging location dots (our own lines instead of the original map image)
  document.querySelectorAll("[data-coast-map]").forEach((map) => {
    let d = "M40 700", x = 40, y = 700;
    for (let i = 0; i < 46; i++) {
      x += 9 + ((i * 37) % 13);
      y -= 10 + ((i * 53) % 17) - (i % 5 === 0 ? 34 : 0);
      d += ` L${x} ${Math.max(40, y)}`;
    }
    map.innerHTML = `<svg viewBox="0 0 668 764" role="img" aria-label="Coastline map">
      <path class="is-coast" d="${d} L640 30"/>
      <path class="is-coast is-thin" d="M120 740 C200 650 260 620 330 600 S470 520 520 470"/>
      <circle class="is-dot" cx="380" cy="440" r="4"/><text class="is-lbl" x="390" y="430">Big city</text>
      <circle class="is-dot" cx="250" cy="520" r="4"/><text class="is-lbl" x="200" y="510">Other city</text>
      <path class="is-spot" d="M330 560l26-8 10 14-18 16-20-6z"/>
      <path class="is-guide" d="M360 566h150"/>
      <g transform="translate(520 500) scale(.95)">${logo().replace("<svg", '<svg class="is-mark" width="108" height="117"')}</g>
    </svg>`;
  });
})();
