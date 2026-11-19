// Common to all pages: draws in the art set (trees, animals, leaf wreath), header band, phone menu, fixed bottom button, footer and cover, and moves them with the original values.
// Original values: cover .5s power2.in (delayed .05s) · header hide .5s power2.out / reveal .5s power2.inOut · bottom button yPercent 200 .7s
// · dropdown opacity .2s · menu panel .75s power2.inOut · accordion 300ms (.1,.7,.75,.95)/(.08,.47,.4,1) · back to top .5s power2.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  const MM = (window.MM = {});
  const page = document.body.dataset.page || "home";
  // The cafe section (original Brand) paints the same header olive, and uses a separately built cream footer without bottom buttons
  const cafe = document.body.dataset.brand === "cafe";
  const touch = matchMedia("(hover: none)").matches;
  const sp = () => innerWidth <= 768;

  // ───── Illustrations — redraws the original hand-drawn illustration spots as flat SVG of the same size and feel
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg"><defs>
    <symbol id="mm-tree-cone" viewBox="0 0 60 100"><rect class="bk" x="27" y="80" width="6" height="18" rx="2"/><path class="lf" d="M30 3 47 38H37l16 26H40l17 22H3l17-22H7l16-26H13Z"/></symbol>
    <symbol id="mm-tree-round" viewBox="0 0 80 100"><rect class="bk" x="36" y="58" width="8" height="40" rx="3"/><circle class="lf3" cx="40" cy="38" r="34"/><circle class="lf" cx="30" cy="30" r="12" opacity=".55"/><circle class="lf" cx="52" cy="46" r="9" opacity=".45"/></symbol>
    <symbol id="mm-tree-tall" viewBox="0 0 40 100"><rect class="bk" x="18" y="70" width="4" height="28" rx="2"/><ellipse class="lf2" cx="20" cy="40" rx="16" ry="36"/><path d="M20 74V20m0 30 7-7m-7-3-7-7" fill="none" style="stroke:var(--kf-bg)" stroke-width="1.6" stroke-linecap="round" opacity=".6"/></symbol>
    <symbol id="mm-bush" viewBox="0 0 80 40"><path class="lf" d="M4 40C0 26 12 16 22 20 24 8 40 4 46 14 56 6 74 12 72 26 80 28 80 36 76 40Z"/></symbol>
    <symbol id="mm-cat" viewBox="0 0 70 90"><path class="fur" d="M56 84c10-2 13-12 8-20-2-3 1-5 3-3 7 9 2 25-11 26Z"/><path class="fur" d="M16 88C6 86 7 62 15 48c4-8 2-16 2-24L13 6l12 10c4-2 12-2 16 0L53 6l-4 18c2 10-2 18-6 24 10 10 15 28 9 40Z"/><circle class="ink" cx="25" cy="27" r="2"/><circle class="ink" cx="38" cy="27" r="2"/><path d="M29 33h4l-2 2z" class="ink"/></symbol>
    <symbol id="mm-dog" viewBox="0 0 80 90"><ellipse class="fur2" cx="40" cy="66" rx="22" ry="22"/><circle class="fur2" cx="40" cy="32" r="20"/><ellipse class="bk" cx="21" cy="32" rx="7" ry="14" transform="rotate(18 21 32)"/><ellipse class="bk" cx="59" cy="32" rx="7" ry="14" transform="rotate(-18 59 32)"/><ellipse class="wh" cx="40" cy="41" rx="9" ry="7"/><circle class="ink" cx="40" cy="37" r="3"/><circle class="ink" cx="32" cy="28" r="2"/><circle class="ink" cx="48" cy="28" r="2"/></symbol>
    <symbol id="mm-rabbit" viewBox="0 0 60 90"><ellipse class="fur" cx="22" cy="20" rx="6" ry="18" transform="rotate(-10 22 20)"/><ellipse class="fur" cx="38" cy="20" rx="6" ry="18" transform="rotate(10 38 20)"/><ellipse class="fur" cx="30" cy="70" rx="20" ry="19"/><circle class="fur" cx="30" cy="44" r="15"/><circle class="ink" cx="24" cy="42" r="2"/><circle class="ink" cx="36" cy="42" r="2"/><circle class="wh" cx="48" cy="78" r="6"/></symbol>
    <symbol id="mm-bird" viewBox="0 0 60 50"><path class="sky" d="M6 30C6 14 22 6 34 12l16-6-6 12c4 14-8 26-22 25C12 42 6 38 6 30Z"/><path class="lf3" d="M14 30c8-2 16 0 20 6-8 4-16 2-20-6Z"/><circle class="ink" cx="38" cy="18" r="2"/><path class="sun" d="m46 20 10 2-9 4Z"/></symbol>
    <symbol id="mm-hedgehog" viewBox="0 0 90 60"><path class="bk" d="M8 50C6 30 20 10 44 8c20-2 34 12 38 30l-6-2 4 8-8-2 2 8Z"/><path class="fur2" d="M60 52c10 0 22-4 26-12-6-6-18-6-26 0Z"/><circle class="ink" cx="76" cy="40" r="2"/><circle class="ink" cx="87" cy="42" r="2"/></symbol>
    <symbol id="mm-squirrel" viewBox="0 0 70 90"><path class="fur2" d="M44 86C70 80 74 44 60 22 52 10 34 12 40 24c8 14 14 34 4 48Z"/><ellipse class="bk" cx="28" cy="64" rx="16" ry="22"/><circle class="bk" cx="26" cy="34" r="12"/><path class="bk" d="m20 24 2-10 6 8Z"/><circle class="ink" cx="22" cy="33" r="2"/></symbol>
    <symbol id="mm-leaf" viewBox="0 0 20 40"><path class="lf2" d="M10 0c10 12 10 28 0 40C0 28 0 12 10 0Z"/></symbol>
    <symbol id="mm-flower" viewBox="0 0 30 30"><g class="sun"><circle cx="15" cy="7" r="6"/><circle cx="23" cy="15" r="6"/><circle cx="15" cy="23" r="6"/><circle cx="7" cy="15" r="6"/></g><circle class="wh" cx="15" cy="15" r="4"/></symbol>
    <symbol id="mm-paw" viewBox="0 0 30 30"><g class="lf2"><ellipse cx="15" cy="21" rx="8" ry="7"/><circle cx="6" cy="12" r="3.5"/><circle cx="12" cy="6" r="3.5"/><circle cx="18" cy="6" r="3.5"/><circle cx="24" cy="12" r="3.5"/></g></symbol>
    <symbol id="mm-house" viewBox="0 0 90 70"><path class="lf3" d="M6 30 45 4l39 26v38H6Z"/><rect class="wh" x="18" y="34" width="14" height="12" rx="2"/><rect class="wh" x="58" y="34" width="14" height="12" rx="2"/><rect class="bk" x="38" y="44" width="14" height="24" rx="2"/></symbol>
  </defs></svg>`;
  // <use> CSS selectors of the document can’t reach inside the shadow tree so styling drops out — read the symbols ahead of time and unfold them in place
  const ART = {};
  new DOMParser().parseFromString(sprite, "image/svg+xml").querySelectorAll("symbol").forEach((sym) => {
    ART[sym.id.slice(3)] = [sym.getAttribute("viewBox"), sym.innerHTML];
  });
  const use = (id, cls = "") => {
    const a = ART[id];
    return a ? `<svg class="mm-art ${cls}" viewBox="${a[0]}" aria-hidden="true">${a[1]}</svg>` : "";
  };
  // Leaf wreath — the wreath spot around the original logo, hero circle and link circle. Straight leaves, fern stems and three berries alternate around the circle
  const wreathInner = (n) => {
    let g = "";
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360 + 6, r = (a * Math.PI) / 180;
      const x = (50 + 40 * Math.cos(r)).toFixed(2), y = (50 + 40 * Math.sin(r)).toFixed(2);
      const k = i % 3, t = `translate(${x} ${y}) rotate(${(a + 90 + (k === 0 ? -12 : 8)).toFixed(1)})`;
      if (k === 0) g += `<path class="wl" transform="${t}" d="M-9 0C-5-5 4-5 9 0 4 5-5 5-9 0ZM-9 0H5"/>`;
      else if (k === 1) g += `<path class="wl" transform="${t}" d="M-8 0H8${[-5, -1.5, 2, 5.5].map((v) => `M${v} 0l2.6-3.4M${v} 0l2.6 3.4`).join("")}"/>`;
      else g += `<g class="wb" transform="${t}"><circle cx="-2" cy="0" r="2.1"/><circle cx="2.4" cy="-2.6" r="2.1"/><circle cx="2.4" cy="2.6" r="2.1"/></g>`;
    }
    return g;
  };
  const wreath = (n = 24, cls = "") => `<svg class="mm-wreath ${cls}" viewBox="0 0 100 100" aria-hidden="true">${wreathInner(n)}</svg>`;
  const ic = {
    phone: '<path d="M6 3h3l2 5-2 1.5a11 11 0 0 0 5.5 5.5L16 13l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2Z"/>',
    pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    doctor: '<circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4"/>',
    chat: '<path d="M12 4c-5 0-9 3-9 7 0 3 2 5.5 5 6.5V21l4-3c5 0 9-3 9-7s-4-7-9-7Z"/>',
    link: '<path d="M14 4h6v6m0-6-9 9m7 1v5H5V6h5"/>',
    reserve: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 12 3 3 5-6"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
  };
  const icon = (k, cls = "") => `<svg class="mm-ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic[k]}</svg>`;
  const circleArrow = `<svg class="mm-wreath" viewBox="-6 -6 112 112" aria-hidden="true">${wreathInner(15)}<path class="wb" d="M45 41 60 50 45 59Z"/></svg>`;
  MM.use = use;
  MM.wreath = wreath;
  MM.icon = icon;
  MM.circleArrow = circleArrow;
  document.querySelectorAll("[data-art]").forEach((el) => (el.innerHTML = use(el.dataset.art)));
  document.querySelectorAll("[data-wreath]").forEach((el) => (el.innerHTML = wreath(+el.dataset.wreath || 34)));
  document.querySelectorAll("[data-icon-svg]").forEach((el) => el.insertAdjacentHTML("afterbegin", icon(el.dataset.iconSvg)));
  document.querySelectorAll(".mm-more").forEach((el) => {
    if (!el.querySelector(".mm-more__c")) el.insertAdjacentHTML("beforeend", `<span class="mm-more__c">${circleArrow}</span>`);
  });

  // ───── Header bar · phone menu · fixed bottom button · footer — menu links connect only our own pages
  const hosp = [1, 2, 3, 4, 5, 6].map((n) => `Hospital ${n}`);
  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  const ddList = (items, grid = false) => `<ul class="mm-dd__list${grid ? " is-grid" : ""}">${items.map(([t, h]) => `<li><a href="${h || "#"}"><span class="mm-ul">${t}</span></a></li>`).join("")}</ul>`;
  const midItems = [
    ["Home", "index.html"],
    ["About us", "about.html", [["About us", "about.html"], ["Our Activities", "about.html#csr"], ["Animal stories room", "news.html"], ["Notice", "news.html"], ["Response policy", "about.html"]]],
    ["About the Hospital", "about.html", [...hosp.map((h) => [h, "about.html"]), ["Meet the medical staff", "recruit.html#team"], ["Comfortable environment", "about.html"], ["Clinic facilities", "recruit.html#facility"]], true],
    ["Treatment Guide", "#", [["General Care", "#"], ["Treatments", "#"], ["Cat clinic", "#"], ["Exotic Animal Care", "#"], ["Preventive care", "#"], ["Surgery Guide", "#"], ["Neutering Surgery", "#"], ["Health Checkup", "#"], ["Home visit care", "#"], ["Elder care", "#"]], true],
    ["Frequently asked questions", "index.html#faq"],
    ["Cafe project", "works.html", [["News · Events", "news.html"], ["Project", "works.html"], ["Open innovation", "works.html"], ["Café about", "works.html"], ["Shop Info", "page.html"]]],
    ["Online store", "#", "store"],
  ];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "mm-head" + (cafe ? " is-cafe" : "");
    head.innerHTML = `
      <div class="mm-head__bg"></div>
      <button class="mm-burger" type="button" aria-label="Open Menu"><span class="mm-burger__bars"><i></i><i></i><i></i></span></button>
      <div class="mm-head__content"><div class="mm-head__main">
        <a class="mm-logo" href="index.html">${wreath(15)}<span>Your hospital name here</span></a>
        <div class="mm-nav">
          <div class="mm-nav__top">
            <a class="mm-nav__recruit mm-ul-host" href="recruit.html"${cur("recruit")}><span class="mm-ul">Hiring Info</span></a>
            <ul class="mm-navtop">
              <li class="mm-dd"><button class="mm-navtop__link mm-ul-host mm-dd__trigger" type="button">${icon("phone")}<span class="mm-ul">Phone</span></button>
                <div class="mm-dd__panel"><div class="mm-dd__box"><ul class="mm-dd__list">${hosp.map((h) => `<li><a href="#"><span class="mm-ul">${h}</span><small class="num">000-0000-0000</small></a></li>`).join("")}</ul></div></div></li>
              <li class="mm-dd"><button class="mm-navtop__link mm-ul-host mm-dd__trigger" type="button">${icon("pin")}<span class="mm-ul">Directions</span></button>
                <div class="mm-dd__panel"><div class="mm-dd__box"><ul class="mm-dd__list">${["Cafe", ...hosp].map((h) => `<li><a href="#"><span class="mm-ul">${h}</span><small>Your street address 00-0 here</small></a></li>`).join("")}</ul></div></div></li>
              <li><a class="mm-navtop__link mm-ul-host" href="#">${icon("doctor")}<span class="mm-ul">Duty roster</span></a></li>
            </ul>
          </div>
          <ul class="mm-navmid">${midItems
            .map(([t, h, sub, grid]) => {
              if (!sub) return `<li><a class="mm-navmid__link mm-ul-host" href="${h}"><span class="mm-ul">${t}</span></a></li>`;
              const box =
                sub === "store"
                  ? `<div class="mm-dd__store"><a href="#"><div class="wf-img wf-r-3x2" data-label="Dog treat plate · from above · light wood background"></div><span class="mm-ul">Your product site name here</span></a><a href="#"><div class="wf-img wf-r-3x2" data-label="Forest path scenery · among green trees · midday"></div><span class="mm-ul">Your ordering site name here</span></a></div>`
                  : ddList(sub, grid);
              return `<li class="mm-dd"><div class="mm-navmid__link mm-ul-host mm-dd__trigger"><span class="mm-ul">${t}</span></div><div class="mm-dd__panel${sub === "store" ? " is-right" : ""}"><div class="mm-dd__box">${box}</div></div></li>`;
            })
            .join("")}</ul>
        </div>
      </div></div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="mm-menu" data-slot="mobile-menu"><div class="mm-menu__in">
        <ul class="mm-menu__list">${midItems
          .map(([t, h, sub]) =>
            !sub || sub === "store"
              ? `<li class="mm-menu__item"><a class="mm-menu__name" href="${h}">${t}</a></li>`
              : `<li class="mm-menu__item mm-acc"><button class="mm-menu__name mm-acc__head" type="button">${t}<span class="mm-acc__btn mm-menu__btn"></span></button><div class="mm-menu__info mm-acc__body"><ul>${sub.map(([s, l]) => `<li><a href="${l}">${s}</a></li>`).join("")}</ul></div></li>`
          )
          .join("")}<li class="mm-menu__item"><a class="mm-menu__name" href="recruit.html">Hiring Info</a></li></ul>
        <a class="mm-menu__line" href="#">${icon("chat")}Your official messenger account here</a>
      </div></div>`
    );
  }

  const timeItems = cafe ? "" : hosp
    .map((h, i) => `<li><h4>${h}</h4><p><b>Consultation Hours</b>${i % 2 ? "AM 0:00-00:00 / PM 00:00-00:00" : "0:00-00:00"}</p><p><b>Clinic closed day</b>${i % 3 ? "Year-end holidays" : "None (open year-round)"}</p></li>`)
    .join("");
  // As in the original, placed right after the header (after the menu sheet) — the document order must match the original so focus and tab order match too
  const fixAnchor = document.querySelector(".mm-menu") || document.querySelector(".mm-head");
  if (!cafe && document.body.dataset.fixnav !== "off" && fixAnchor) fixAnchor.insertAdjacentHTML(
    "afterend",
    `<div class="mm-fixnav" data-slot="fix-nav"><ul class="mm-fixnav__list">
      <li class="mm-fixnav__item mm-dd"><button class="mm-fixnav__btn mm-ul-host mm-dd__trigger" type="button" data-icon="time">${icon("clock")}<span class="mm-ul">Office hours</span></button>
        <div class="mm-dd__panel mm-fixnav__time"><div class="mm-dd__box"><ul class="mm-timelist">${timeItems}</ul></div></div></li>
      <li class="mm-fixnav__item mm-dd"><button class="mm-fixnav__btn mm-ul-host mm-dd__trigger" type="button" data-icon="calendar">${icon("calendar")}<span class="mm-ul">Internet reservation</span>${use("cat", "mm-fixnav__cat")}</button>
        <div class="mm-dd__panel mm-fixnav__cal"><div class="mm-dd__box"><ul class="mm-callist">${[...hosp, "Care center"].map((h) => `<li><a href="#" class="mm-ul-host"><span class="mm-ul">${h}</span></a></li>`).join("")}</ul></div></div></li>
    </ul></div>`
  );

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot && cafe) {
    foot.className = "mm-foot is-cafe";
    foot.innerHTML = `
      <div class="mm-cfoot__band"><div class="mm-cfoot__frm"><span class="mm-cfoot__logo">${use("leaf")}${use("bird")}<b>Here<br>Café name</b></span><p>One line here: a warm space where every living being feels at ease.</p></div></div>
      <ul class="mm-cfoot__nav">${[["News · Events", "news.html"], ["Project", "works.html"], ["Open innovation", "works.html"], ["Café about", "works.html"], ["Shop Info", "page.html"], ["Inquiry", "#"]].map(([t, h]) => `<li><a class="mm-ul-host" href="${h}"><span class="mm-ul">${t}</span></a></li>`).join("")}</ul>
      <div class="mm-cfoot__btm"><div class="mm-cfoot__frm"><span>Your cafe official name here</span><span>Copyright © Your name here All Rights Reserved.</span></div></div>`;
  } else if (foot) {
    foot.className = "mm-foot";
    const pages = [
      ["", [["Home", "index.html"], ["About us", "about.html"], ["Our Activities", "about.html"], ["Animal stories room", "news.html"], ["Notice", "news.html"], ["Response policy", "about.html"], ["Frequently asked questions", "index.html#faq"], ["Hiring Info", "recruit.html"]]],
      ["Your hospital group name here", hosp.map((h) => [h, "about.html"]).concat([["About the Hospital", "about.html"], ["Clinic facilities", "recruit.html"], ["Meet the medical staff", "recruit.html"]])],
      ["Treatment Guide", ["General Care", "Treatments", "Cat clinic", "Exotic Animal Care", "Preventive care", "Surgery Guide", "Neutering Surgery", "Health Checkup"].map((t) => [t, "#"])],
      ["Cafe project", [["News · Events", "news.html"], ["Project", "works.html"], ["Café about", "works.html"], ["Shop Info", "page.html"]]],
    ];
    foot.innerHTML = `
      <div class="mm-foot__green"><div class="mm-foot__in"><div class="mm-foot__wrap">
        <button class="mm-foot__top mm-ul-host" type="button"><span class="mm-ul">Back to top of this page</span><i></i></button>
        <div class="mm-foot__boxes">
          <div class="mm-foot__left">
            <div class="mm-foot__logo">${wreath(24)}</div>
            <a class="mm-foot__line mm-ul-host" href="#">${icon("chat")}<span class="mm-ul">Your official messenger account here</span></a>
            <p class="mm-foot__note">Your two-line notice goes here: closure notices and event news can be found here.</p>
          </div>
          <div class="mm-foot__right">
            <div class="mm-hosp">${hosp
              .map(
                (h) => `<div class="mm-hosp__item mm-acc"><button class="mm-hosp__name mm-acc__head" type="button">${h}<span class="mm-acc__btn"></span></button>
                <div class="mm-hosp__info mm-acc__body"><div class="mm-hosp__box"><p><b>Consultation Hours</b>0:00-00:00</p><p><b>Clinic closed day</b>Your closed days here</p></div>
                <div class="mm-hosp__links"><a href="#" class="mm-ul-host">${icon("pin")}<span class="mm-ul">Your street address 00-0 here</span></a><a href="#" class="mm-ul-host is-tel">${icon("phone")}<span class="mm-ul">000-0000-0000</span></a><a href="#" class="mm-ul-host">${icon("reserve")}<span class="mm-ul">Internet reservation</span></a><a href="#" class="mm-ul-host">${icon("link")}<span class="mm-ul">${h} Page</span></a></div></div></div>`
              )
              .join("")}</div>
          </div>
        </div>
        <div class="mm-store">
          <a class="mm-store__item" href="#"><div class="mm-store__img"><div class="wf-img wf-r-3x2" data-label="Pet food bag and bowl · outdoor lawn · soft daylight"></div></div><div class="mm-store__desc"><p>Your product intro here, one line</p><p class="mm-store__mark">${use("paw")}<span>Here</span></p></div></a>
          <a class="mm-store__item" href="#"><div class="mm-store__img"><div class="wf-img wf-r-3x2" data-label="Forest trail · tall trees · green light"></div></div><div class="mm-store__desc"><p>Your order site intro, one line here</p><p class="mm-store__mark">${use("leaf")}<span>Your name here</span></p></div></a>
        </div>
        <div class="mm-pages">${pages.map(([t, l]) => `<div>${t ? `<p>${t}</p>` : ""}<ul>${l.map(([s, h]) => `<li><a class="mm-ul-host" href="${h}"><span class="mm-ul">${s}</span></a></li>`).join("")}</ul></div>`).join("")}</div>
      </div></div></div>
      <div class="mm-foot__white"><div class="mm-foot__in"><div class="mm-foot__wwrap">
        <div class="mm-banner">
          <div><h4>Insurance guide</h4><div class="mm-banner__row"><a href="#"><div class="wf-img" style="width:calc(240 * var(--u))" data-label="Insurer banner · Horizontal strip"></div></a><a href="#"><div class="wf-img" style="width:calc(240 * var(--u))" data-label="Partner insurance banner · horizontal strip"></div></a></div></div>
          <div><h4>Press coverage</h4><div class="mm-banner__row"><a href="#"><div class="wf-img" style="width:calc(96 * var(--u))" data-label="Media logo"></div></a><a href="#"><div class="wf-img" style="width:calc(132 * var(--u))" data-label="Media logo"></div></a><a href="#"><div class="wf-img" style="width:calc(146 * var(--u))" data-label="Newspaper Logo"></div></a><a href="#"><div class="wf-img" style="width:calc(112 * var(--u))" data-label="Media logo"></div></a></div></div>
        </div>
        <p class="mm-copy">© 0000, Your hospital name here</p>
      </div></div></div>`;
  }

  // ───── Accordion — original slideUp/slideDown as is (height and opacity transition, inline values cleared when done)
  const slideDown = (body, btn, ms) => {
    btn.classList.add("is-open");
    body.style.display = "block";
    const h = body.offsetHeight;
    body.style.height = 0;
    body.offsetHeight;
    Object.assign(body.style, { transitionProperty: "height, opacity", transitionDuration: ms + "ms", transitionTimingFunction: "cubic-bezier(.1,.7,.75,.95)", overflow: "hidden", height: h + "px", opacity: 1 });
    setTimeout(() => ["height", "overflow", "transition-duration", "transition-property", "transition-timing-function"].forEach((p) => body.style.removeProperty(p)), ms);
  };
  const slideUp = (body, btn, ms) => {
    btn.classList.remove("is-open");
    body.style.height = body.offsetHeight + "px";
    body.offsetHeight;
    Object.assign(body.style, { transitionProperty: "height, opacity", transitionDuration: ms + "ms", transitionTimingFunction: "cubic-bezier(.08,.47,.4,1)", overflow: "hidden", height: 0, opacity: 0 });
    setTimeout(() => {
      body.style.display = "none";
      ["height", "overflow", "transition-duration", "transition-property", "transition-timing-function"].forEach((p) => body.style.removeProperty(p));
    }, ms);
  };
  MM.slideDown = slideDown;
  MM.slideUp = slideUp;
  MM.accordion = (root, { head = ".mm-acc__head", body = ".mm-acc__body", btn = ".mm-acc__btn", ms = 300, spOnly = false } = {}) => {
    const h = root.querySelector(head), b = root.querySelector(body), k = root.querySelector(btn) || h;
    if (!h || !b) return;
    h.addEventListener("click", () => {
      if (spOnly && !sp()) return;
      k.classList.contains("is-open") ? slideUp(b, k, ms) : slideDown(b, k, ms);
    });
  };
  document.querySelectorAll(".mm-menu .mm-acc").forEach((el) => MM.accordion(el));
  document.querySelectorAll(".mm-hosp .mm-acc").forEach((el) => MM.accordion(el, { spOnly: true }));
  const resetHosp = () =>
    document.querySelectorAll(".mm-hosp__info").forEach((b) => {
      b.previousElementSibling.querySelector(".mm-acc__btn").classList.remove("is-open");
      b.style.display = sp() ? "none" : "block";
      b.style.opacity = sp() ? 0 : 1;
    });

  // ───── Dropdown — with a mouse it opens on enter and closes on leave (closing others first), on touch it toggles by press
  const closeAll = () => document.querySelectorAll(".mm-dd__trigger.is-open").forEach((t) => (t.classList.remove("is-open"), t.nextElementSibling.classList.remove("is-open")));
  const ddOpen = (t, p) => (closeAll(), t.classList.add("is-open"), p.classList.add("is-open"));
  const ddClose = (t, p) => (t.classList.remove("is-open"), p.classList.remove("is-open"));
  document.querySelectorAll(".mm-dd").forEach((dd) => {
    const t = dd.querySelector(".mm-dd__trigger"), p = t && t.nextElementSibling;
    if (!p) return;
    const toggle = () => (t.classList.contains("is-open") ? ddClose(t, p) : ddOpen(t, p));
    if (touch) t.addEventListener("click", toggle);
    else if (dd.closest(".mm-fixnav")) {
      // Bottom button is the original dropdown-click — opens only on press (mouseup) and closes when the pointer leaves
      dd.addEventListener("mouseup", toggle);
      dd.addEventListener("mouseleave", () => t.classList.contains("is-open") && ddClose(t, p));
    } else {
      dd.addEventListener("mouseover", () => ddOpen(t, p));
      dd.addEventListener("mouseleave", () => ddClose(t, p));
    }
  });

  // ───── Header hide/reveal — from below the hero (#kv). As in the original, it only hides on scroll down after scrolling up once and is-fix is attached
  const H = document.querySelector(".mm-head");
  const hParts = H ? [H.querySelector(".mm-head__bg"), H.querySelector(".mm-head__content")] : [];
  const headerFix = () => {
    if (H.classList.contains("is-fix")) return;
    gsap.to(hParts, { yPercent: 0, duration: 0.5, ease: "power2.inOut", onStart: () => H.classList.add("is-fix") });
  };
  const headerUnfix = () => {
    if (!H.classList.contains("is-fix") || H.classList.contains("is-open")) return;
    gsap.to(hParts, { yPercent: -100, duration: 0.5, ease: "power2.out", onComplete: () => H.classList.remove("is-fix") });
  };

  // Phone menu — panel opacity .75s power2.inOut, on open the panel goes to the top in .3s
  const menu = document.querySelector(".mm-menu");
  const burger = H && H.querySelector(".mm-burger");
  const menuOpen = () => {
    H.classList.add("is-open");
    H.classList.remove("is-close");
    gsap.to(menu, { opacity: 1, duration: 0.75, ease: "power2.inOut", onStart: () => { gsap.to(menu, { duration: 0.3, scrollTo: { y: 0, autoKill: true }, ease: "power2.inOut" }); menu.style.display = "block"; closeAll(); } });
  };
  const menuClose = () => {
    H.classList.remove("is-open");
    H.classList.add("is-close");
    gsap.to(menu, { opacity: 0, duration: 0.75, ease: "power2.inOut", onStart: closeAll, onComplete: () => { menu.style.display = "none"; document.querySelectorAll(".mm-menu .mm-acc__btn.is-open").forEach((b) => slideUp(b.closest(".mm-acc").querySelector(".mm-acc__body"), b, 300)); } });
  };
  burger && burger.addEventListener("click", (e) => { e.preventDefault(); H.classList.contains("is-open") ? menuClose() : (menuOpen(), headerFix()); });

  // Back to top — .5s power2
  const top = document.querySelector(".mm-foot__top");
  top && top.addEventListener("click", () => gsap.to(window, { duration: 0.5, scrollTo: { y: 0 }, ease: "power2" }));
  // Same-page moves subtract the header height, .5s power2
  MM.scrollToHash = (hash) => {
    const t = document.querySelector(hash);
    if (!t) return;
    const y = scrollY + t.getBoundingClientRect().top - (document.querySelector(".mm-head__content")?.clientHeight || 0);
    gsap.to(window, { duration: 0.5, scrollTo: { y }, ease: "power2" });
  };
  document.querySelectorAll("[data-hash]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); MM.scrollToHash("#" + a.dataset.hash); }));

  // ───── Cover · scroll hooks — attached after load, like the original
  const fixItems = document.querySelectorAll(".mm-fixnav");
  addEventListener("load", () => {
    resetHosp();
    if (location.hash) MM.scrollToHash(location.hash);
    const cover = document.querySelector(".mm-cover");
    if (cover) gsap.to(cover, { opacity: 0, duration: 0.5, delay: 0.05, ease: "power2.in", onComplete: () => cover.remove() });
    const kv = document.querySelector("#kv");
    if (H && kv)
      ScrollTrigger.create({
        trigger: kv, start: "bottom top", endTrigger: "body", end: "bottom bottom",
        onUpdate: (s) => s.isActive && (s.direction === 1 ? headerUnfix() : headerFix()),
      });
    const footer = document.querySelector(".mm-foot");
    fixItems.forEach((el) => {
      let hidden = false;
      ScrollTrigger.create({
        trigger: footer, start: "top bottom", endTrigger: "body", end: "bottom top",
        onToggle: (s) => {
          if (s.isActive === hidden) return;
          hidden = s.isActive;
          gsap.to(el, hidden ? { yPercent: 200, duration: 0.7, ease: "power2.out" } : { yPercent: 0, duration: 0.7, ease: "power2.inOut" });
        },
      });
    });
    document.dispatchEvent(new CustomEvent("mm:ready"));
  });
  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(resetHosp, 100); });
})();
