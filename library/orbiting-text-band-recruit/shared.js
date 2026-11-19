/* Plugged in here so the four pages share the same surrounding frame · header · menu · footer, and it hooks up motion that spans several pages (text bands · entry drawer · menu curtain · flowing lines · show-on-visible) */
const nsBoot = () => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SPRITE = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <clipPath id="ns-pillow" clipPathUnits="objectBoundingBox"><path d="M.12 .04C.3 .1 .7 .1 .88 .04C.98 .02 1 .1 .97 .2C.93 .4 .93 .6 .97 .8C1 .9 .98 .98 .88 .96C.7 .9 .3 .9 .12 .96C.02 .98 0 .9 .03 .8C.07 .6 .07 .4 .03 .2C0 .1 .02 .02 .12 .04Z"/></clipPath>
  </defs>
  <symbol id="ns-pillow-shape" viewBox="0 0 100 78"><path d="M12 3C30 8 70 8 88 3C98 1 100 8 97 16C93 31 93 47 97 62C100 70 98 77 88 75C70 70 30 70 12 75C2 77 0 70 3 62C7 47 7 31 3 16C0 8 2 1 12 3Z"/></symbol>
  <symbol id="ns-bag" viewBox="0 0 100 130"><path d="M10 8l5-6 5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6 5 6 5-6 5 6V122l-5 6-5-6-5 6-5-6-5 6-5-6-5 6-5-6-5 6-5-6-5 6-5-6-5 6-5-6-5 6-5-6Z" style="fill:var(--pack)"/><rect x="18" y="30" width="64" height="26" rx="13" style="fill:var(--kf-surface)"/><circle cx="50" cy="88" r="20" style="fill:var(--pack2, var(--kf-surface));opacity:.9"/></symbol>
  <symbol id="ns-box" viewBox="0 0 100 130"><rect x="12" y="4" width="76" height="122" rx="4" style="fill:var(--pack)"/><rect x="12" y="4" width="76" height="22" style="fill:var(--pack2, var(--kf-surface))"/><circle cx="50" cy="78" r="24" style="fill:var(--kf-surface);opacity:.85"/><rect x="24" y="36" width="52" height="10" rx="5" style="fill:var(--kf-surface)"/></symbol>
  <symbol id="ns-bar" viewBox="0 0 130 100"><rect x="4" y="22" width="122" height="56" rx="10" style="fill:var(--pack)"/><rect x="18" y="36" width="44" height="28" rx="6" style="fill:var(--kf-surface)"/><circle cx="96" cy="50" r="16" style="fill:var(--pack2, var(--kf-surface))"/></symbol>
    <symbol id="ns-balloon" viewBox="0 0 200 140"><path d="M100 6C150 6 194 28 194 62S150 118 100 118c-9 0-18-1-26-3L44 134l8-26C24 98 6 82 6 62 6 28 50 6 100 6Z" style="fill:var(--ball, var(--kf-surface));stroke:var(--kf-ink);stroke-width:3"/><path d="M58 52h84M58 72h56" style="stroke:var(--kf-ink);stroke-width:6;stroke-linecap:round;opacity:.5"/></symbol>
  <symbol id="ns-mascot" viewBox="0 0 60 90"><ellipse cx="30" cy="62" rx="20" ry="24" style="fill:var(--mas, var(--site-pack-1))"/><circle cx="30" cy="26" r="22" style="fill:var(--mas, var(--site-pack-1))"/><circle cx="22" cy="24" r="4" style="fill:var(--kf-ink)"/><circle cx="38" cy="24" r="4" style="fill:var(--kf-ink)"/><path d="M22 36q8 7 16 0" style="fill:none;stroke:var(--kf-ink);stroke-width:3;stroke-linecap:round"/></symbol>
</svg>`;

  const MENU = [
    ["Know the Company", [["about.html", "About the company 1"]]],
    ["Know the Work", [["service.html", "Job Type Introduction"], ["service.html", "Sub Menu 2"]]],
    ["Know people · culture", [["index.html#people", "Sub Menu 1"], ["index.html#people", "Sub Menu 2"], ["index.html#people", "Sub Menu 3"]]],
    ["Work environment", [["index.html#environment", "Sub Menu 1"], ["index.html#environment", "Sub Menu 2"]]],
    ["Hiring Info", [["recruit.html", "Entry-level hiring info"], ["recruit.html#info", "Experienced hiring details"]]],
  ];
  const menu = (cls) => `<nav class="ns-menu ${cls}" aria-label="Site Menu">${MENU.map(([cat, links]) => `<div class="ns-menu__col"><div class="ns-menu__cat">${cat}</div><ul>${links.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>`).join("")}</nav>`;
  const logo = `<a class="ns-logo" href="index.html"><span class="ns-logo__mark"><i>LOGO</i><b>Company name</b></span><span>RECRUITING SITE</span></a>`;

  const head = `
<div class="ns-frame" data-slot="frame-text" aria-hidden="true"><canvas data-text="COMPANY NAME RECRUITING Site"></canvas><div class="ns-frame__mask"></div></div>
<header class="ns-head" data-slot="header">
  <div class="ns-head__logo">${logo}</div>
  <div class="ns-entry" data-slot="entry-drawer">
    <button class="ns-entry__sp" type="button">Entry</button>
    <div class="ns-entry__btns">
      <div class="ns-entry__col">
        <div class="ns-entry__parent" role="button" tabindex="0"><span>New Grad Hiring<span class="show-pc"><br>Recruitment guidelines · Entry</span></span></div>
        <div class="ns-entry__child"><a href="recruit.html#info">Application guidelines</a><a href="recruit.html#info">Entry</a></div>
      </div>
      <div class="ns-entry__col">
        <a class="ns-entry__parent" href="recruit.html#info"><span>Experienced hiring<span class="show-pc"><br>Application guidelines</span></span></a>
        <div class="ns-entry__child show-sp"><a href="recruit.html#info">Application guidelines</a></div>
      </div>
    </div>
  </div>
  <button class="ns-burger" type="button" aria-label="Menu" aria-expanded="false"><span></span></button>
  <div class="ns-overlay"><div class="wf-img" data-label="Table with snacks and cereal · overhead view · warm daylight · fills the screen"></div></div>
  <div class="ns-gnav" data-slot="menu">${menu("")}</div>
</header>`;

  const foot = `
<footer class="ns-foot" data-slot="footer">
  <div class="ns-foot__wrap">
    <div class="ns-foot__util">${logo}<ul class="ns-foot__links"><li><a href="index.html">Company Website</a></li><li><a href="index.html">Handling personal information</a></li></ul></div>
    ${menu("ns-foot__menu")}
    <div class="ns-foot__copy">Copyright © COMPANY NAME CO.,LTD. All Rights Reserved.</div>
  </div>
</footer>`;

  const recruit = `
  <aside class="ns-section ns-band" data-slot="recruit-links">
    <div class="ns-pattern"></div>
    <div class="ns-inner">
      <h2 class="ns-title"><span class="ns-title__en">RECRUIT</span><span class="ns-title__jp">Hiring Info</span></h2>
      <div class="ns-cards -h">
        <div class="ns-card">
          <a href="recruit.html">
            <div class="ns-card__label">New Graduate</div>
            <div class="ns-card__img"><div class="wf-img" data-label="Photo of two new hires standing in front of a logo wall · indoors · landscape 3:2"></div></div>
            <p class="ns-card__title"><span>New Grad Hiring</span> <span>Recruitment guidelines · Entry</span></p>
            <span class="ns-pill" aria-hidden="true"></span>
          </a>
          <ul class="ns-links"><li><a class="ns-roll" href="recruit.html"><span>A message from the company</span></a></li><li><a class="ns-roll" href="recruit.html#info"><span>Hiring Process</span></a></li><li><a class="ns-roll" href="recruit.html#info"><span>Frequently asked questions</span></a></li></ul>
        </div>
        <div class="ns-card">
          <a href="recruit.html#info">
            <div class="ns-card__label">Mid-Career</div>
            <div class="ns-card__img"><div class="wf-img" data-label="Mascot doll on an office shelf · warm lighting · landscape 3:2"></div></div>
            <p class="ns-card__title"><span>Experienced hiring</span> <span>Recruitment guidelines · Entry</span></p>
            <span class="ns-pill" aria-hidden="true"></span>
          </a>
        </div>
      </div>
    </div>
  </aside>`;

  document.body.insertAdjacentHTML("afterbegin", SPRITE + head);
  document.querySelector("[data-ns-recruit]")?.replaceWith(document.createRange().createContextualFragment(recruit));
  document.body.insertAdjacentHTML("beforeend", foot);
  document.querySelectorAll(".ns-head .ns-menu, .ns-foot .ns-menu").forEach((m) => m.querySelectorAll("a").forEach((a) => {
    if (a.getAttribute("href") === `${document.body.dataset.page}.html`) a.setAttribute("aria-current", "page");
  }));

  // ── Surrounding text band: flows along the top, right, bottom (upside down) and left sides at 50px per second (40px on phones, no top and bottom sides) ──
  const canvas = document.querySelector(".ns-frame canvas");
  const ctx = canvas.getContext("2d");
  const text = `${canvas.dataset.text}    `;
  const margin = 18, fontSize = 10;
  let offset = 0, last = 0, textW = 1, dpr = 1, mult = 1;
  const resize = () => {
    mult = innerWidth <= 767 ? 0.8 : 1;
    const r = canvas.parentElement.getBoundingClientRect();
    dpr = devicePixelRatio || 1;
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `700 ${fontSize}px ${getComputedStyle(document.documentElement).getPropertyValue("--kf-font-display")}`;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-accent").trim();
    textW = ctx.measureText(text).width || 1;
  };
  const line = (x, y, angle, length, reverse = false) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    let pos = reverse ? offset - textW : -offset;
    while (pos < length) { ctx.fillText(text, pos, 0); pos += textW; }
    ctx.restore();
  };
  const draw = (time) => {
    if (!last) last = time;
    const dt = Math.max(0, (time - last) / 1000);
    last = time;
    const w = canvas.width / dpr, h = canvas.height / dpr, iw = w - margin * 2, ih = h - margin * 2;
    if (!reduce) offset = (offset + 50 * mult * dt) % textW;
    ctx.clearRect(0, 0, w, h);
    const sp = innerWidth <= 767;
    if (!sp) line(margin, margin, 0, iw);
    line(w - margin, margin, Math.PI / 2, ih);
    if (!sp) line(margin, h - margin + fontSize, 0, iw, true);
    line(margin, h - margin, -Math.PI / 2, ih);
    if (!reduce) requestAnimationFrame(draw);
  };
  (window.visualViewport || window).addEventListener("resize", resize);
  addEventListener("resize", resize);
  resize();
  document.fonts?.ready.then(resize);
  requestAnimationFrame(draw);

  // ── Body lock (so the page behind does not move while the menu is open) ──
  let lockY = 0, locks = 0;
  const lock = () => { if (++locks > 1) return; lockY = scrollY; document.body.style.top = `-${lockY}px`; document.body.classList.add("is-locked"); };
  const unlock = () => { if (!locks || --locks) return; document.body.classList.remove("is-locked"); document.body.style.top = ""; scrollTo(0, lockY); };

  // Menu: a photo curtain sweeps in from the right in a .75s trapezoid and the cells settle down with a three-step wobble
  const header = document.querySelector(".ns-head");
  const burger = header.querySelector(".ns-burger");
  const setMenu = (on) => {
    header.classList.toggle("is-open", on);
    header.classList.toggle("is-close", !on);
    burger.setAttribute("aria-expanded", String(on));
    on ? lock() : unlock();
  };
  burger.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && header.classList.contains("is-open")) setMenu(false); });
  header.querySelectorAll(".ns-gnav a").forEach((a) => a.addEventListener("click", () => header.classList.contains("is-open") && setMenu(false)));

  // ── Entry drawer: on desktop only slots with children expand on click, on phones a single ”Entry” button opens the panel ──
  const entry = header.querySelector(".ns-entry");
  entry.querySelector(".ns-entry__sp").addEventListener("click", (e) => { e.stopPropagation(); entry.classList.toggle("is-open"); });
  entry.querySelector(".ns-entry__btns").addEventListener("click", (e) => {
    if (innerWidth < 768) return;
    const parent = e.target.closest(".ns-entry__parent");
    const col = parent?.closest(".ns-entry__col");
    const child = col?.querySelector(".ns-entry__child");
    if (!child || child.classList.contains("show-sp")) return;
    e.preventDefault(); e.stopPropagation();
    col.classList.toggle("is-open");
  });
  entry.querySelectorAll(".ns-entry__parent[role=button]").forEach((p) => p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); p.click(); } }));
  document.addEventListener("click", (e) => {
    if (entry.contains(e.target)) return;
    entry.classList.remove("is-open");
    entry.querySelectorAll(".ns-entry__col").forEach((c) => c.classList.remove("is-open"));
  });

  // ── Turns on once when visible (top 90%) ──
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(".ns-iv").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top 90%", toggleClass: { targets: el, className: "is-inview" }, once: true }));

  // ── Same-page links: up to 100px above with a 500ms swing (exactly the original jQuery animate) ──
  window.jQuery?.('a[href^="#"]').on("click", function () {
    const h = jQuery(this).attr("href");
    const t = jQuery(h === "#" || h === "" ? "html" : h);
    if (!t.length) return true;
    jQuery("html, body").animate({ scrollTop: t.offset().top - 100 }, reduce ? 0 : 500, "swing");
    return false;
  });

  // ── Endlessly flowing row (Swiper autoplay 0 + long speed + linear) ──
  const loopBase = { loop: true, allowTouchMove: false, autoplay: { delay: 0, disableOnInteraction: false, pauseOnMouseEnter: false } };
  if (!reduce) {
    document.querySelectorAll(".ns-flow.-copy").forEach((el) => new Swiper(el, { ...loopBase, speed: 15000, spaceBetween: 56, slidesPerView: 1, breakpoints: { 768: { speed: 18000, spaceBetween: 96, slidesPerView: 1.5 } } }));
    document.querySelectorAll(".ns-flow.-img").forEach((el) => new Swiper(el, { ...loopBase, speed: 12000, slidesPerView: "auto", autoplay: { ...loopBase.autoplay, reverseDirection: true } }));
    document.querySelectorAll(".ns-flow.-photos").forEach((el) => new Swiper(el, { ...loopBase, speed: 10000, spaceBetween: 8, slidesPerView: 1, breakpoints: { 768: { slidesPerView: 2 } } }));
    document.querySelectorAll(".ns-flow.-vert").forEach((el) => new Swiper(el, { ...loopBase, speed: 10000, spaceBetween: 8, slidesPerView: "auto", autoplay: { ...loopBase.autoplay, reverseDirection: el.classList.contains("-rev") }, breakpoints: { 768: { direction: "vertical", autoHeight: true, slidesPerView: "auto" } } }));
  }

  // ── Flip person cards on phone only (rest 2s, flip over 2s, pause on hover) ──
  const mq = matchMedia("(max-width: 767px)");
  const sliders = new Map();
  const handle = () => {
    document.querySelectorAll("[data-sp-slider]").forEach((el) => {
      const sw = sliders.get(el);
      if (mq.matches && !sw) {
        sliders.set(el, new Swiper(el, {
          loop: true, speed: 2000, autoplay: reduce ? false : { delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true },
          slidesPerView: 1.2, spaceBetween: 6,
          navigation: { nextEl: el.querySelector(".-next"), prevEl: el.querySelector(".-prev") },
          pagination: { el: el.querySelector(".swiper-pagination"), type: "fraction" },
        }));
      } else if (!mq.matches && sw) { sw.destroy(true, true); sliders.delete(el); }
    });
  };
  mq.addEventListener("change", handle);
  handle();
};

nsBoot();
