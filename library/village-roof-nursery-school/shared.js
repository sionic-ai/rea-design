// Shared by all pages — header (flower emblem · logo top left, four overlapping round menu badges top right, village banner bottom left),
// Footer (yellow mountain illustration with jumping kids, contact, bottom link strip), inserting hand-drawn icons, ScrollOut(once) turns on when visible,
// Scrolling down hides the menu (phone bottom bar), after load the white curtain lifts over 1s
const OM = (() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Hand-drawn icons (in place of the original teaser/pic_*.png — blue line doodles) ----------
  const D = {
    bird: '<path d="M4 30c10-12 22-14 30-6 6-12 18-18 30-16-8 6-14 14-16 24-14 6-30 4-44-2z"/><path d="M34 24c2 6 2 10 0 14"/>',
    cup: '<path d="M10 20h36l-4 28H14z"/><path d="M46 26c8 0 10 10 0 12"/><path d="M20 12c0-4 4-4 4-8M30 12c0-4 4-4 4-8"/>',
    ball: '<circle cx="30" cy="30" r="22"/><path d="M8 30c14-6 30-6 44 0M30 8c-6 14-6 30 0 44"/>',
    leaf: '<path d="M10 50C10 24 26 10 52 8c0 26-16 42-42 42z"/><path d="M10 50 40 20"/>',
    star: '<path d="m30 6 7 15 16 2-12 11 3 16-14-8-14 8 3-16L7 23l16-2z"/>',
    house: '<path d="M8 28 30 10l22 18"/><path d="M14 24v26h32V24"/><path d="M26 50V36h8v14"/>',
    flower: '<circle cx="30" cy="30" r="6"/><path d="M30 24c-4-10 4-16 0-18M36 30c10-4 16 4 18 0M30 36c4 10-4 16 0 18M24 30c-10 4-16-4-18 0"/>',
    swirl: '<path d="M30 30c0-4 6-4 6 0 0 8-12 8-12 0 0-12 18-12 18 0 0 16-24 16-24 0"/>',
    rice: '<path d="M10 28h40c0 14-8 22-20 22S10 42 10 28z"/><path d="M16 28c2-8 8-12 14-12s12 4 14 12"/><path d="M24 22l2 2M32 20l1 3M38 24l-2 1"/>',
    kids: '<circle cx="20" cy="14" r="6"/><circle cx="40" cy="14" r="6"/><path d="M12 50V28h16v22M32 50V28h16v22M28 34h4"/>',
    camera: '<rect x="6" y="18" width="48" height="32" rx="6"/><circle cx="30" cy="34" r="9"/><path d="M20 18l4-8h12l4 8"/>',
    phone: '<path d="M14 10h10l4 12-6 4c3 7 7 11 12 13l4-6 12 4v10c0 3-3 5-6 5C26 50 10 34 8 16c0-3 3-6 6-6z"/>',
    insta: '<rect x="8" y="8" width="44" height="44" rx="13"/><circle cx="30" cy="30" r="10"/><circle cx="43" cy="17" r="2.5"/>',
    sun: '<circle cx="30" cy="30" r="10"/><path d="M30 6v8M30 46v8M6 30h8M46 30h8M13 13l6 6M41 41l6 6M13 47l6-6M41 19l6-6"/>',
  };
  const doodle = (k) => `<svg viewBox="0 0 60 60" aria-hidden="true">${D[k] || D.star}</svg>`;
  document.querySelectorAll("[data-doodle]").forEach((el) => { el.innerHTML = doodle(el.dataset.doodle); });

  // Flower sentence (where the original logo mark was) — three houses inside five petals
  const emblem = `<svg class="om-emblem" viewBox="0 0 80 80" aria-hidden="true"><path class="om-emblem__petal" d="M40 4c8 0 13 7 12 14 7-3 15 0 17 8s-3 13-9 16c6 3 9 11 5 17s-12 8-17 4c0 7-5 13-13 13S27 69 28 62c-5 4-13 2-17-4s-1-14 5-17c-6-3-11-9-9-16s10-11 17-8c-1-7 4-14 12-14z"/><path class="om-emblem__mark" d="M26 46l6-6 6 6M36 46l6-6 6 6M31 34l6-6 6 6M28 46v8M48 46v8M37 34v20"/></svg>`;

  // ---------- Head ----------
  const NAV = [
    ["col1", "news.html", "In the Staff Room", "kids"],
    ["col2", "lookbook.html", "Photo gallery", "camera"],
    ["col3", "index.html#contact", "Contact Us", "phone"],
    ["col4", "#", "INSTAGRAM", "insta"],
  ];
  const header = document.querySelector(".om-header");
  if (header) {
    const top = header.classList.contains("is-top");
    header.insertAdjacentHTML("afterbegin", `<div class="om-header__titbox">
        <a class="om-header__ico" href="index.html" aria-label="First Page">${emblem}</a>
        <a class="om-header__titlink" href="index.html"><${top ? "h1" : "p"} class="om-header__tit"><span class="om-header__mark">${emblem}</span><span class="om-header__name"><small data-label="Company name, one line">Social welfare corporation name</small><b data-label="Circle name (logo text)">Daycare name</b></span><em class="om-header__badge">Licensed daycare</em></${top ? "h1" : "p"}></a>
      </div>`);
    header.insertAdjacentHTML("beforeend", `<nav class="om-nav" aria-label="Site Menu"><ul class="om-nav__lists">${NAV.map(([c, h, t, d]) => `<li class="om-nav__list ${c}"><a href="${h}"><span class="om-nav__badge"><i class="om-nav__ico">${doodle(d)}</i><b>${t}</b></span></a></li>`).join("")}</ul></nav>
      <a class="om-header__btn" href="#" aria-label="Town Intro Site"><span data-label="Town banner (vertical text logo)">Village<br>Name</span><small>TOWN</small></a>`);
  }

  // ---------- Footer ----------
  const footer = document.querySelector(".om-footer");
  if (footer) {
    const tri = (x, y, s) => `<path class="om-tree" d="M${x} ${y}l${s} ${s * 1.4}h-${s * 2}z"/>`;
    footer.innerHTML = `<div class="om-footer__hills" aria-hidden="true"><svg viewBox="0 0 2638 260" preserveAspectRatio="xMidYMax meet">
        <path class="om-hill" d="M0 260V230c160-10 300-40 420-90 120-50 200-120 300-120s170 80 260 120c90 40 170 20 250-30 80-50 140-100 210-100s130 60 200 110c70 50 150 70 240 60 110-12 200-80 300-90 100-10 190 60 300 90 80 22 140 20 158 18V260z"/>
        ${tri(760, 70, 14)}${tri(820, 100, 12)}${tri(700, 110, 12)}${tri(1460, 60, 14)}${tri(1520, 92, 12)}${tri(1400, 96, 11)}${tri(1980, 150, 12)}
        <circle class="om-moon" cx="1683" cy="66" r="40"/>
        <path class="om-hut" d="M1686 222l44-38 44 38v38h-88z"/><path class="om-hut-door" d="M1718 260v-22h24v22"/>
      </svg>
      <i class="om-footer__pic om-pic01" data-doodle="kids" data-fx="doodle-tic" data-fx-doodle-tic="look: hop" style="--fx-dur: 8s; --fx-delay: .1s"></i><i class="om-footer__pic om-pic02" data-doodle="kids" data-fx="doodle-tic" data-fx-doodle-tic="look: hop" style="--fx-dur: 8s; --fx-delay: .3s"></i><i class="om-footer__pic om-pic03" data-doodle="bird" data-fx="doodle-tic" data-fx-doodle-tic="look: jump" style="--fx-dur: 8s; --fx-delay: 1s"></i></div>
      <div class="om-footer__inner">
        <a class="om-footer__logo" href="index.html" aria-label="First Page">${emblem}<span><small>Social welfare corporation name</small><b>Daycare name</b></span></a>
        <div class="om-footer__info"><p class="om-footer__txt">〒000-0000 Your address goes here on one line 0-0<br>Tel. 0000-00-0000　Mail. <a href="#">mail@example.jp</a></p>
          <p class="om-footer__copyright">©<span class="current-year">2026</span> Company Name All Rights Reserved.</p></div>
      </div>
      <nav class="om-footer__nav" aria-label="Footer Link"><ul>${["The Facility’s Journey", "About the Director", "Grievance Resolution System", "Articles of incorporation", "Founding statement", "Village daycare", "Daycare study abroad"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></nav>`;
    footer.querySelectorAll("[data-doodle]").forEach((el) => { el.innerHTML = doodle(el.dataset.doodle); });
  }

  // Brush-stroke texture (blue lines above and below the voice section) — rough only at the edges
  document.body.insertAdjacentHTML("beforeend", '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="om-rough"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter></svg>');

  // ---------- ScrollOut — as in the original, once: true sets data-scroll on [data-scroll] ----------="in" Add ----------
  if (window.ScrollOut && !reduce) ScrollOut({ once: true });
  else document.querySelectorAll("[data-scroll]").forEach((el) => el.setAttribute("data-scroll", "in"));

  // Scrolling down hides the menu, and scrolling up or being within the top 200px shows it again (on phone the bottom bar drops over 1s)
  const nav = document.querySelector(".om-nav");
  let pos = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (nav) nav.classList.toggle("hide", !(y < pos || y < 200));
    pos = y;
  }, { passive: true });

  // After load, lift the white curtain over 1s (original #loading fadeOut(1000))
  addEventListener("load", () => {
    const l = document.getElementById("om-loading");
    if (!l) return;
    if ($ && !reduce) $(l).fadeOut(1000); else l.style.display = "none";
  });

  // Same-page anchor — original 1000ms swing
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains("notlink")) return;
    const h = a.getAttribute("href");
    const t = h === "#" ? document.documentElement : document.querySelector(h);
    if (!t) return;
    e.preventDefault();
    const y = h === "#" ? 0 : t.getBoundingClientRect().top + scrollY;
    if ($ && !reduce) $("html, body").stop().animate({ scrollTop: y }, 1000, "swing"); else scrollTo(0, y);
  });

  return { reduce, doodle, emblem };
})();
