// About — journey steps, solution cards, partner list, number cards and support cards are inserted in the same shape, and the left table of contents lights up following the current section
(() => {
  const { ARROW } = window.mdIcons;
  const $ = (s) => document.querySelector(s);

  $("[data-steps]").innerHTML = [["step one", "Listening"], ["step two", "Survey"], ["step three", "Goal"], ["step four", "Strategy"], ["step five", "Design"], ["step six", "Production"]]
    .map(([en, ko]) => `<li class="jr__step"><p class="md-en">${en}</p><p>${ko}</p></li>`).join("");

  $("[data-solutions]").innerHTML = [["Strategic", "Research"], ["Value", "Design"], ["Communication", "Architecture"], ["Creative", "Production"]]
    .map(([a, b], i) => `<article class="sol__card">
      <div class="sol__body"><p class="sol__num"><span class="md-en">solution</span>0${i + 1}</p>
        <p class="sol__lead md-en" data-label="Solution name, two English lines">${a}<br>${b}</p>
        <h3 class="sol__head">Your solution name here 0${i + 1}</h3>
        <p class="sol__txt">Add two or three lines on what this solution does. Say what it reveals and what decision criteria it creates.</p></div>
      <div class="sol__fig"><div class="wf-img sol__img" data-label="Meeting / work scene ${i + 1} · Bright natural-light office · landscape 16:9"></div></div>
      <span class="md-circ sol__ico">${ARROW}</span>
      <a class="sol__link" href="#" aria-label="Solutions 0${i + 1} In detail"></a></article>`).join("");

  $("[data-partners]").innerHTML = Array.from({ length: 45 }, (_, i) => `<li>Client company name ${String(i + 1).padStart(2, "0")}</li>`).join("");

  // Line icons — in place of the original red line art (calendar, clock, person, building, age, percent)
  const ICON = {
    cal: '<rect x="8" y="12" width="40" height="34" rx="3"/><path d="M8 22h40M18 8v8M38 8v8M16 30h6M26 30h6M36 30h6M16 38h6M26 38h6"/>',
    clock: '<circle cx="28" cy="20" r="9"/><path d="M28 15v5l4 3M12 48c2-9 9-13 16-13s14 4 16 13z"/>',
    people: '<circle cx="18" cy="18" r="7"/><circle cx="38" cy="18" r="7"/><path d="M6 46c1-9 6-14 12-14s11 5 12 14M26 46c1-9 6-14 12-14s11 5 12 14"/>',
    building: '<path d="M10 48V14l18-6v40M28 20h18v28M16 20h4M16 28h4M16 36h4M34 28h4M34 36h4M6 48h44"/>',
    age: '<circle cx="20" cy="18" r="6"/><circle cx="36" cy="18" r="6"/><path d="M8 46c1-8 5-12 12-12s11 4 12 12M24 46c1-8 5-12 12-12s11 4 12 12"/><circle cx="28" cy="10" r="3"/>',
    woman: '<circle cx="28" cy="18" r="9"/><path d="M12 48c2-10 8-14 16-14s14 4 16 14zM20 14c2-6 14-6 16 0"/>',
    baby: '<circle cx="20" cy="16" r="6"/><circle cx="38" cy="26" r="5"/><path d="M8 48c1-9 6-14 12-14s9 4 10 8M30 48c1-7 4-10 8-10s7 3 8 10"/>',
    pc: '<rect x="8" y="12" width="40" height="26" rx="2"/><path d="M4 44h48M22 38v6M34 38v6"/>',
    cup: '<path d="M12 22h28v14a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12zM40 26h4a5 5 0 0 1 0 10h-4M20 8c-2 3 2 5 0 8M28 8c-2 3 2 5 0 8"/>',
    book: '<path d="M8 12h16a4 4 0 0 1 4 4v32a4 4 0 0 0-4-4H8zM48 12H32a4 4 0 0 0-4 4v32a4 4 0 0 1 4-4h16z"/>',
    heart: '<path d="M28 46S8 34 8 21a10 10 0 0 1 20-3 10 10 0 0 1 20 3c0 13-20 25-20 25z"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

  const rows = [
    [["Holidays per year", "cal", "000", "Day"], ["Average monthly overtime", "clock", "00", "Time"], ["Gender Ratio", "people", "0:0", ""]],
    [["Average annual leave days used", "cal", "00", "Day"], ["Years since founding", "building", "00", "Years or more"], ["Average Age", "age", "00", "Tax"]],
    [["Long label showing the share of women in management", "woman", "00", "%"], ["Parental leave usage rate", "baby", "000", "%"]],
  ];
  $("[data-data]").innerHTML = rows.map((r) => `<div class="dt__row">${r.map(([lbl, ic, n, suf]) =>
    `<div class="dt__card"><h4>${lbl}</h4><div class="dt__body"><span class="dt__ico">${svg(ic)}</span><p class="dt__num"><span>${n}</span>${suf ? `<small>${suf}</small>` : ""}</p></div></div>`).join("")}</div>`).join("");

  const groups = [
    ["Supporting daily life", [["Flexible Work System", "pc"], ["Annual leave granted from hire date", "cal"], ["Health Checkup", "heart"], ["Parental leave", "baby"], ["Work devices provided", "pc"], ["Free drinks in-house", "cup"], ["External Welfare Services", "heart"], ["Home purchase support", "building"], ["Personal Pension Support", "book"]]],
    ["Supporting growth", [["New employee training", "book"], ["Sales training", "people"], ["In-house mentor program", "age"], ["Apply for external seminars", "pc"], ["Qualification Support", "book"]]],
  ];
  $("[data-support]").innerHTML = groups.map(([head, items]) => `<div class="sp__grp">
      <h4 class="sp__head">${head}</h4>
      <div class="sp__cards">${items.map(([t, ic]) => `<div class="sp__card"><span class="sp__ico">${svg(ic)}</span><h5>${t}</h5><p>Your program description here in two or three lines. Briefly say when and how to use it.</p></div>`).join("")}</div>
    </div>`).join("");

  // Table of contents — lights up the section that overlaps most with a strip excluding the top and bottom 30% of the screen (original floating nav)
  const items = [...document.querySelectorAll(".fn__nav a")];
  const ratio = {};
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => { ratio[e.target.id] = e.intersectionRatio; });
    let best = null, max = 0;
    for (const k in ratio) if (ratio[k] > max) { max = ratio[k]; best = k; }
    items.forEach((a) => a.parentElement.classList.toggle("is-active", a.getAttribute("href") === `#${best}`));
  }, { rootMargin: "-30% 0px -30% 0px", threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
  document.querySelectorAll(".fn__sec").forEach((s) => io.observe(s));
})();
