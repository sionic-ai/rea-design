// Common to all pages: draws the header (news strip, dropdown, pill button), phone menu drawer, sky-photo footer (NEXT card) and floating booking button, and
// Hooks up page transitions (original Nuxt page transition — opacity .3s on leave, .6s cubic-bezier(.4,.4,0,1) on enter).
// The original is a one-page STUDIO app, so header and footer are the same symbol on every page — here they are bundled as one set.
(() => {
  const page = document.body.dataset.page || "home";
  // A page reached by an in-site link doesn’t re-float the header as in the original (single-page app) but appears in .6s together with the whole page
  const entering = document.documentElement.classList.contains("is-entering");
  const headFx = (extra = "") => entering ? "" : `data-fx="studio-appear" data-fx-studio-appear="look: up; at: 100" style="--fx-delay:1.3s${extra}"`;
  const MK = (window.MK = {});

  // Redraw the original logo mark (three blue horizontal bands converging into an eye shape) in the same position and proportion
  MK.mark = (cls = "") => `<svg class="mk-mark ${cls}" viewBox="0 0 56 30" aria-hidden="true"><path d="M2 2 54 0v8L2 8z"/><path d="M2 12h34v6H2z"/><path d="M2 22l52-2v9L2 28z"/></svg>`;
  document.querySelectorAll("[data-mark]").forEach((el) => (el.innerHTML = MK.mark()));
  const logo = `<span class="mk-logo">${MK.mark()}<span class="mk-logo__txt"><b>Your Eye Clinic Here</b><small lang="en">CLINIC NAME EYE CLINIC</small></span></span>`;

  // Clinic hours table — the hero card and footer use the same table. ◎ is until 1 pm, ● is open, ― is closed
  MK.hours = () => {
    const days = ["Month", "Fire", "Number", "Neck", "Gold", "Earth", "Sundays · Holidays"];
    const am = ["half", "on", "on", "on", "on", "half", "off"];
    const pm = ["off", "op", "on", "on", "on", "off", "off"];
    const cell = (v) => v === "on" ? '<i class="mk-dot"></i>' : v === "half" ? '<i class="mk-ring"></i><small>13:00</small>' : v === "op" ? "<em>Surgery</em>" : '<i class="mk-dash"></i>';
    return `<table class="mk-hours"><thead><tr><th>Consultation Hours</th>${days.map((d) => `<th>${d}</th>`).join("")}</tr></thead><tbody>
      <tr><th>9:00 - 12:00</th>${am.map((v) => `<td>${cell(v)}</td>`).join("")}</tr>
      <tr><th>13:30 - 17:00</th>${pm.map((v) => `<td>${cell(v)}</td>`).join("")}</tr></tbody></table>`;
  };

  const ext = `<i class="mk-ext" aria-hidden="true"></i>`;
  const plus = `<span class="mk-plus" aria-hidden="true">＋</span>`;
  const insta = `<i class="mk-ig" aria-hidden="true"></i>`;
  MK.arrow = `<span class="mk-arw" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 12h11M13 8l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></span>`;
  document.querySelectorAll("[data-arrow]").forEach((el) => el.insertAdjacentHTML("beforeend", MK.arrow));

  const medical = [["Care guide TOP", "index.html#service"], ["First-time visitors", "index.html#guide"], ["General Care", "index.html#service"], ["Pediatric Eye Care", "index.html#service"], ["Same-day surgery", "index.html#service"], ["Glaucoma", "index.html#service"]];
  const about = [["Greeting", "about.html"], ["News", "news.html"], ["Column", "index.html#column"], ["Hiring Info", "recruit.html"]];
  const news = [["2026.10.19", "Your news title goes here in one line — if it runs long, it ends with an ellipsis"], ["2026.10.27", "Your second news title here"]];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = page === "home" ? "mk-head" : "mk-head is-sub";
    const drop = (name, list, cls) => `<div class="mk-drop ${cls}"><button type="button" class="mk-drop__btn">${name}${plus}</button>
      <div class="mk-drop__panel">${list.map(([n, h]) => `<a class="mk-drop__link" href="${h}"><i class="mk-drop__bar"></i><span>${n}</span></a>`).join("")}</div></div>`;
    head.innerHTML = `
      <a class="mk-head__logo" href="index.html" aria-label="Home" ${headFx()}>${logo}</a>
      <div class="mk-head__nav" ${headFx("; --fx-ease:ease-out")}>
${page === "home" ? `        <div class="mk-head__news">
          <a class="mk-head__newslabel" href="news.html">News</a>
          <div class="mk-ticker" data-fx="step-loop-carousel" data-fx-step-loop-carousel="dur: 1.3; every: 5; pause: hover">
            <div data-fx-part="viewport"><div data-fx-part="track">
              ${news.map(([d, t]) => `<a class="mk-ticker__item" data-fx-part="slide" href="article.html"><span class="mk-ticker__date" lang="en">${d}</span><span class="mk-ticker__title">${t}</span></a>`).join("")}
            </div></div>
          </div>
        </div>` : ""}
        <nav class="mk-head__menu" aria-label="Main menu">
          ${drop("Treatment Guide", medical, "is-medical")}
          ${drop("About the Hospital", about, "is-about")}
          <a class="mk-head__link" href="index.html#hours">Consultation Hours</a>
          <a class="mk-head__link" href="index.html#access">Directions</a>
          <a class="mk-head__insta" href="#" aria-label="Social Media">${insta}</a>
          <a class="mk-pill is-line" href="#">Contact lens order${ext}</a>
          <a class="mk-pill is-fill" href="#">WEB Booking${ext}</a>
        </nav>
      </div>
      <button type="button" class="mk-head__menubtn" aria-expanded="false" aria-label="Menu"><span class="mk-burger"><i></i><i></i></span><span lang="en">MENU</span></button>`;

    const drawer = document.createElement("div");
    drawer.className = "mk-drawer";
    drawer.dataset.slot = "menu-drawer";
    // Original phone menu (STUDIO modal page): Care Guide header + 2×2 photo cards, six outlined buttons in two columns, small links and a social link below
    const cards = [["General Care", "Doctor and patient in consultation · examination equipment · landscape 3:2"], ["Pediatric Eye Care", "Consultation with child and guardian · wood wall · landscape 3:2"], ["Same-day surgery", "Operating room equipment · bright lighting · landscape 3:2"], ["Glaucoma", "Two inspection devices · White interior · Landscape 3:2"]];
    const btns = [["First-time visitors", "index.html#guide"], ["Consultation hours · Directions", "index.html#hours"], ["About the Hospital", "about.html"], ["News", "news.html"], ["Column about eyes", "index.html#column"]];
    drawer.innerHTML = `<div class="mk-drawer__in">
        <div class="mk-drawer__head"><p>Treatment Guide</p><a href="index.html#service">Back to start of care guide →</a></div>
        <div class="mk-drawer__cards">${cards.map(([n, l]) => `<a class="mk-drawer__card" href="index.html#service"><span class="wf-img" data-label="${l}"></span><span>${n}</span></a>`).join("")}</div>
        <div class="mk-drawer__btns">${btns.map(([n, h]) => `<a class="mk-drawer__btn" href="${h}">${n}</a>`).join("")}<a class="mk-drawer__btn" href="#">Contact lens order${ext}</a></div>
        <p class="mk-drawer__sub"><a href="#">Inquiry</a> / <a href="recruit.html">Hiring Info</a> / <a href="#">Privacy policy</a> / <a href="#">Legal Disclosures</a></p>
        <a class="mk-drawer__insta" href="#">${insta}<span lang="en">Instagram</span></a>
      </div>`;
    head.after(drawer);
    const btn = head.querySelector(".mk-head__menubtn");
    btn.addEventListener("click", () => {
      const open = !document.documentElement.classList.contains("is-menu");
      document.documentElement.classList.toggle("is-menu", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  // Sky photo footer — address, timetable and reserve button (left), next page card and link group (right). NEXT is each page’s next in order
  const next = { home: ["About the Hospital", "about.html"], about: ["Treatment Guide", "index.html#service"], news: ["Column", "index.html#column"], article: ["News List", "news.html"], recruit: ["About the Hospital", "about.html"] }[page] || ["About the Hospital", "about.html"];
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "mk-foot";
    foot.innerHTML = `
      <div class="mk-foot__bg wf-img" data-label="Corner of a white hospital building and its sign under a clear sky · daytime · low-angle view from below · full-width background"></div>
      <div class="mk-foot__in">
        <div class="mk-foot__info">
          <a class="mk-foot__logo" href="index.html" aria-label="Home">${logo}</a>
          <p class="mk-foot__addr">ZIP 000-0000 Your address here, one line, 000 <a href="#" class="mk-foot__map">(Map)</a><br>TEL. <a class="mk-foot__tel" href="#">0000-00-0000</a>　FAX. 0000-00-0000</p>
          <div class="mk-foot__hours" data-hours></div>
          <p class="mk-foot__note">※ Mon and Sat until 13:00.<br>※ Reception hours may change due to temporary surgery. See News for details.<br>※ Payment by cash, card or electronic payment is accepted. For details, <a href="#">Payment method</a>Please take a look.</p>
          <div class="mk-foot__btns"><a class="mk-pill is-line is-blue" href="#">WEB Booking${ext}</a><a class="mk-pill is-line is-blue" href="#"><i class="mk-ext is-tel" aria-hidden="true"></i>Phone Reservation</a></div>
        </div>
        <div class="mk-foot__side">
          <!-- As in the original the card itself is a panel and only the title is a link (an overlay makes the whole card clickable) — the arrow nudges from outside the link -->
          <div class="mk-next" data-slot="next-card">
            <span class="mk-next__img wf-img" data-label="Next page cover photo · bright interior · landscape 3:1"></span>
            <span class="mk-next__veil"></span>
            <span class="mk-next__label" lang="en"><span class="mk-next__arrow" data-fx="poke-loop"><svg viewBox="0 0 24 8" aria-hidden="true"><path d="M0 4h22M18 .5 22 4l-4 3.5" fill="none" stroke="currentColor"/></svg></span>NEXT</span>
            <a class="mk-next__title" href="${next[1]}">${next[0]}</a>
          </div>
          <div class="mk-foot__cols">
            <div><p>Treatment Guide</p>${medical.slice(1).map(([n, h]) => `<a href="${h}">-  ${n}</a>`).join("")}</div>
            <div><p>Hospital Guide</p><a href="index.html#hours">-  Reception hours</a><a href="index.html#access">-  Directions</a><a href="about.html">-  Hospital overview</a></div>
            <div><a href="about.html">About the Hospital</a><a href="news.html">News</a><a href="index.html#column">Column</a><a href="#">Inquiry</a></div>
          </div>
          <p class="mk-foot__sub"><a href="recruit.html">Hiring Info</a> / <a href="#">Privacy policy</a> / <a href="#">Legal Disclosures</a></p>
          <a class="mk-foot__insta" href="#">${insta}<span lang="en">Instagram</span></a>
        </div>
      </div>
      <p class="mk-foot__copy"><small>©Your eye clinic</small><small lang="en">Designed by Studio Name</small></p>`;
  }

  document.querySelectorAll("[data-hours]").forEach((el) => (el.innerHTML = MK.hours()));

  // Two floating booking buttons (bottom bar on phones, bottom right on sub pages even on wide screens)
  const bar = document.createElement("div");
  bar.className = "mk-float";
  bar.dataset.slot = "float-cta";
  bar.innerHTML = `<a class="mk-float__btn is-hours" href="index.html#hours">Consultation hours · Directions</a><a class="mk-float__btn is-web" href="#">WEB Booking${ext}</a>`;
  document.body.append(bar);

  // Page transition — same-site links blur the screen for .3s and then navigate, and the arriving page floats up in .6s (original Nuxt page-leave·enter)
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.documentElement.classList.contains("is-entering")) {
    document.documentElement.classList.add("is-arrived");
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("is-entering")));
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || url.href.split("#")[0] === location.href.split("#")[0]) return;
    e.preventDefault();
    document.documentElement.classList.remove("is-menu");
    try { sessionStorage.setItem("mk-nav", "1"); } catch (_) {}
    if (reduce) { location.href = url.href; return; }
    // The original (single-page app) stays as is for about .1s after the press while finding the route, then blurs
    setTimeout(() => { document.documentElement.classList.remove("is-arrived"); document.documentElement.classList.add("is-leaving"); }, 55);
    setTimeout(() => (location.href = url.href), 300);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) document.documentElement.classList.remove("is-leaving", "is-entering"); });
})();
