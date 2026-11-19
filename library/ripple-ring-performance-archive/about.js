// About: fills the three credit columns with a placeholder list — in the original, each column has a title (gold bar) followed by role (bold) · name rows at a 26px tempo
(() => {
  const role = (r, names) => `<dt>${r}</dt>${names.map((n) => `<dd>${n}</dd>`).join("")}`;
  const block = (title, rows, extra = "") => `<h3>${title}</h3><dl>${extra}${rows.map(([r, n]) => role(r, n)).join("")}</dl>`;
  const host = ["Your organizer name here", "Your sponsor organization name here", "Your partner foundation name here"];
  const cols = [
    [
      block("PERFORMANCE 01 City performance", [["Host", host], ["Space Styling", ["Your production company name here"]], ["Video production", ["Your name here"]], ["Promo design", ["Your name here", "Your name here"]], ["Filming", ["Your name here", "Your name here"]], ["Operations", ["Your operating company name here"]]]),
      block("PERFORMANCE 02 City performance", [["Host", ["Your organizer name here", "Your sponsor organization name here", "Your partner foundation name here"]], ["Video production", ["Your name here"]]], '<dt class="is-note">* Partner project</dt><dd class="is-note">A related performance name in one line here</dd>'),
      block("PERFORMANCE 03 City performance", [["Host", host], ["Space Styling", ["Your production company name here"]], ["Video production", ["Your name here"]], ["Promo design", ["Your name here"]]]),
    ],
    [
      block("EXHIBITION 01 City exhibition", [["Host", host], ["Special Partnership", ["Your museum name here"]], ["Promo design", ["Your name here", "Your name here"]], ["Exhibition setup", ["Your company name here"]], ["Lighting", ["Your company name here"]], ["Operations", ["Your operating company name here"]]]),
      block("EXHIBITION 02 City exhibition", [["Host", host], ["Special Partnership", ["Your museum name here"]], ["Promo design", ["Your name here"]], ["Exhibition setup", ["Your company name here"]], ["Operations", ["Your operating company name here"]]]),
    ],
    [
      block("BOOKLET Booklet name", [["Production", ["Your name here", "Your name here"]], ["Editing", ["Your name here", "Your name here", "Your name here"]], ["Text", ["Your name here", "Your name here"]], ["Photo", ["Your name here"]], ["Book Design", ["Your name here", "Your name here"]], ["Print", ["Your printer name here"]]]),
      block("WEBSITE", [["Production", ["Your production company name here"]], ["Design", ["Your name here", "Your name here"]], ["Development", ["Your name here"]]]),
    ],
  ];
  const grid = document.querySelector("[data-credit]");
  if (grid) grid.innerHTML = cols.map((c) => `<div class="ok-credit__col">${c.join("")}</div>`).join("");
})();
