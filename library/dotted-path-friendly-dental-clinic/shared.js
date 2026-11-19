/* Neighborhood dental clinic — Frame shared by all pages
   The original uses jQuery 3.4.1 + anime.js 3.2.1 (a leaf flying along a dotted path) + CSS keyframes (falling leaves · rising hearts). The leaf path runs on the same anime.js version. */
(() => {
  const AS = (window.AS = window.AS || {});
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───── Image sprites — the original flat illustrations, watercolor leaves, trees and line icons, redrawn as SVG in the same spots and sizes ───── */
  const person = (x, y, s, top, bottom, hair, flip = false) => `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><ellipse class="as-p-skin" cx="0" cy="-58" rx="7" ry="8"/><path class="as-p-hair" d="M-7 -60c0-7 4-10 8-10s8 3 7 10c-3-3-9-4-15 0Z"/><path style="fill: ${top}" d="M-10 -48c2-3 18-3 20 0l3 30h-26Z"/><path style="fill: ${bottom}" d="M-10 -18h20l-2 18h-5l-3-14-3 14h-5Z"/></g>`;
  const sprite = () => `<svg class="as-sprite" aria-hidden="true" width="0" height="0" style="position:absolute">
  <defs><filter id="as-wc" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter></defs>
  <symbol id="as-mark" viewBox="0 0 80 80"><g class="as-line"><circle cx="17" cy="16" r="6"/><path d="M17 3v4M17 25v4M4 16h4M26 16h4M8 7l3 3M23 22l3 3M8 25l3-3M23 10l3-3"/><path d="M34 22c8-9 26-9 32 2 6 11 1 22-4 33-3 7-4 18-10 18-5 0-4-12-8-12s-3 12-8 12c-6 0-7-11-10-18-3-7-6-16-2-22"/><path d="M48 22c6-10 16-14 26-10-4 9-14 12-26 10Z"/></g></symbol>
  <symbol id="as-i-news" viewBox="0 0 40 40"><path class="as-line" d="M6 15h8l14-7v24l-14-7H6Z M31 14c3 3 3 9 0 12M35 11c5 5 5 13 0 18"/></symbol>
  <symbol id="as-i-tooth" viewBox="0 0 40 40"><path class="as-line" d="M12 7c4-2 7 1 8 1s4-3 8-1c6 3 5 11 3 17-1 4-2 11-5 11-3 0-2-8-6-8s-3 8-6 8c-3 0-4-7-5-11-2-6-3-14 3-17Z"/></symbol>
  <symbol id="as-i-doctor" viewBox="0 0 40 40"><path class="as-line" d="M12 12c0-6 16-6 16 0v5c0 5-4 8-8 8s-8-3-8-8Z M10 12h20 M14 18h12 M8 36c0-6 5-10 12-10s12 4 12 10Z"/></symbol>
  <symbol id="as-i-chair" viewBox="0 0 40 40"><path class="as-line" d="M14 6h12l-2 6h-8Z M10 14h20v4c0 6-4 10-10 10s-10-4-10-10Z M20 28v8M13 36h14M30 16l5-6"/></symbol>
  <symbol id="as-i-faq" viewBox="0 0 40 40"><circle class="as-line" cx="20" cy="20" r="14"/><path class="as-line" d="M15 16c0-4 3-6 5-6 3 0 5 2 5 5 0 4-5 4-5 8M20 28v1"/></symbol>
  <symbol id="as-i-pin" viewBox="0 0 40 40"><path class="as-line" d="M20 35s-11-11-11-19a11 11 0 0 1 22 0c0 8-11 19-11 19Z"/><circle class="as-line" cx="20" cy="16" r="4"/></symbol>
  <symbol id="as-i-insta" viewBox="0 0 40 40"><rect class="as-line-w" x="10" y="10" width="20" height="20" rx="6"/><circle class="as-line-w" cx="20" cy="20" r="4.5"/><circle class="as-dot-w" cx="26" cy="14" r="1.2"/></symbol>
  <symbol id="as-i-tel" viewBox="0 0 24 24"><path class="as-line-c" d="M6 3l4 1 1 5-2 2c1 3 3 5 6 6l2-2 5 1 1 4c-1 2-3 3-5 2C10 20 4 14 3 7c-1-2 0-4 3-4Z"/></symbol>
  ${["cavity", "pull", "gum", "check", "denture", "kid", "mother", "white"].map((k, i) => `<symbol id="as-s-${k}" viewBox="0 0 86 86"><path class="as-line-g" d="M30 22c6-3 10 1 13 1s7-4 13-1c9 5 7 17 4 26-2 6-3 16-8 16-4 0-3-12-9-12s-5 12-9 12c-5 0-6-10-8-16-3-9-5-21 4-26Z"/>${[
    `<path class="as-line-g" d="M38 30c3 2 7 2 10 0M43 10v5M33 13l3 4M53 13l-3 4"/>`,
    `<path class="as-line-g" d="M12 70l14-14M60 10l10 10M64 6l-4 14 14-4"/>`,
    `<path class="as-line-g" d="M20 56c10 8 36 8 46 0"/>`,
    `<rect class="as-line-g" x="56" y="50" width="22" height="26" rx="3"/><path class="as-line-g" d="M62 60h10M62 66h10"/>`,
    `<path class="as-line-g" d="M10 60h66M10 66h66"/>`,
    `<path class="as-line-g" d="M66 18l4 4M70 14l-8 8"/>`,
    `<circle class="as-line-g" cx="68" cy="22" r="8"/>`,
    `<path class="as-line-g" d="M66 12v10M61 17h10M14 60v8M10 64h8"/>`,
  ][i]}</symbol>`).join("")}
  <symbol id="as-leaf" viewBox="0 0 86 34"><g filter="url(#as-wc)"><path class="as-leaf-fill" d="M2 17C18 2 52 0 84 17 52 34 18 32 2 17Z"/><path class="as-leaf-vein" d="M6 17h74M30 17l-10-8M44 17l-10-9M58 17l-10-8M30 17l-10 8M44 17l-10 9M58 17l-10 8"/></g></symbol>
  <symbol id="as-leaf-2" viewBox="0 0 51 85"><g filter="url(#as-wc)"><path class="as-leaf-fill2" d="M25 2C44 20 48 50 26 82 4 50 6 20 25 2Z"/><path class="as-leaf-vein" d="M25 8v72M25 30l-8-6M25 44l9-7M25 58l-9-7"/></g></symbol>
  <symbol id="as-heart" viewBox="0 0 43 40"><path class="as-heart" d="M21.5 38C8 28 2 21 2 12A10 10 0 0 1 21.5 8 10 10 0 0 1 41 12c0 9-6 16-19.5 26Z"/></symbol>
  <symbol id="as-tree" viewBox="0 0 295 470"><g filter="url(#as-wc)"><ellipse class="as-tree-shadow" cx="150" cy="455" rx="90" ry="12"/><path class="as-trunk" d="M144 455c2-80 2-160 0-250h8c-2 90-2 170 0 250Z"/><circle class="as-canopy" cx="150" cy="150" r="118"/><circle class="as-canopy2" cx="110" cy="120" r="60"/><circle class="as-canopy2" cx="190" cy="185" r="55"/></g></symbol>
  <symbol id="as-tree-heart" viewBox="0 0 305 329"><g filter="url(#as-wc)"><ellipse class="as-tree-shadow" cx="150" cy="315" rx="110" ry="12"/><path class="as-trunk" d="M146 315c4-50 0-90-4-130h10c-4 40 0 80 2 130Z"/><path class="as-canopy" d="M150 200C70 150 40 110 40 75a55 55 0 0 1 110-20 55 55 0 0 1 110 20c0 35-30 75-110 125Z"/></g></symbol>
  <symbol id="as-branch" viewBox="0 0 496 365"><g class="as-branch-g"><path d="M40 340C140 240 260 140 460 30" class="as-branch-line"/>${[[110, 270, -30], [170, 215, 30], [230, 170, -35], [290, 130, 25], [350, 95, -40], [410, 62, 20], [140, 250, 120], [260, 150, 140], [380, 80, 150]].map(([x, y, r]) => `<ellipse class="as-branch-leaf" cx="${x}" cy="${y}" rx="38" ry="15" transform="rotate(${r} ${x} ${y})"/>`).join("")}</g></symbol>
  <symbol id="as-family" viewBox="0 0 210 173"><ellipse class="as-ground" cx="105" cy="164" rx="98" ry="9"/>${person(60, 160, 1.6, "var(--site-shirt)", "var(--site-pants)", "")}${person(120, 160, 1.7, "var(--site-dress)", "var(--site-dress)", "")}${person(160, 160, 1, "var(--site-kid)", "var(--site-pants)", "")}<path class="as-string" d="M126 70 150 30M150 30v0"/><use href="#as-heart" x="138" y="10" width="26" height="24"/></symbol>
  <symbol id="as-walkers" viewBox="0 0 256 162"><ellipse class="as-ground" cx="128" cy="152" rx="120" ry="9"/>${person(70, 150, 1.7, "var(--site-shirt)", "var(--site-pants)", "")}${person(125, 150, 1.75, "var(--site-dress)", "var(--site-pants)", "")}${person(170, 150, 0.95, "var(--site-kid)", "var(--site-dress)", "")}${person(205, 150, 0.9, "var(--site-kid2)", "var(--site-pants)", "")}</symbol>
  <symbol id="as-tooth-doc" viewBox="0 0 197 197"><ellipse class="as-ground" cx="120" cy="186" rx="60" ry="8"/><path class="as-tooth" d="M30 70c12-8 22 0 30 0s18-8 30 0c16 12 10 40 4 60-4 14-6 34-16 34-8 0-6-26-18-26s-10 26-18 26c-10 0-12-20-16-34-6-20-12-48 4-60Z"/>${person(140, 182, 1.6, "var(--kf-surface)", "var(--site-scrub)", "")}<path class="as-brush" d="M150 98 172 20M166 18h12"/></symbol>
  <symbol id="as-scene" viewBox="0 0 774 620"><rect class="as-scene-bg" width="774" height="620" rx="24"/>${person(260, 520, 3.2, "var(--kf-surface)", "var(--site-scrub)", "")}${person(470, 520, 3, "var(--site-shirt)", "var(--site-pants)", "", true)}<rect class="as-scene-chair" x="400" y="380" width="190" height="34" rx="16"/></symbol>
  <symbol id="as-hills" viewBox="0 0 2560 992" preserveAspectRatio="xMidYMax slice"><rect width="2560" height="992" fill="url(#as-sky)"/><g filter="url(#as-wc)"><path class="as-hill3" d="M0 640C400 560 760 600 1100 620S1900 540 2560 600V992H0Z"/><path class="as-hill2" d="M0 760C500 680 900 720 1300 740S2100 680 2560 720V992H0Z"/><path class="as-hill1" d="M0 860C600 800 1100 840 1500 850S2200 820 2560 840V992H0Z"/></g>${[[300, 520, 1], [520, 600, 0.7], [1650, 560, 0.9], [1900, 600, 0.75], [2250, 540, 1.1]].map(([x, y, s]) => `<use href="#as-tree" x="${x - 110 * s}" y="${y - 260 * s}" width="${220 * s}" height="${350 * s}"/>`).join("")}<use href="#as-walkers" x="1220" y="690" width="230" height="146"/></symbol>
  <linearGradient id="as-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="as-st-sky1"/><stop offset=".6" class="as-st-sky2"/></linearGradient>
</svg>`;

  /* ───── Header bar, phone menu, footer ───── */
  const NAV = [
    ["news.html", "Notice", "News", "news"], ["about.html#tour", "For first-time visitors", "For first-time users", "tooth"], ["about.html", "About the Director · Dental Clinic", "About us", "doctor"],
    ["index.html#info", "Treatment Guide", "Medical information", "chair"], ["index.html#flow", "Frequently asked questions", "FAQ", "faq"], ["index.html#access", "Directions", "Access", "pin"],
  ];
  const menuMain = (cls = "") => `<ul class="as-menu-main ${cls}">${NAV.map(([h, t, e, i]) => `<li><a href="${h}"><svg class="as-icon-nav" aria-hidden="true"><use href="#as-i-${i}"/></svg><span>${t}<span class="as-gray" data-label="English Menu Name">${e}</span></span></a></li>`).join("")}</ul>`;
  const logo = (cls = "") => `<span class="as-logo ${cls}"><svg class="as-logo-img" aria-hidden="true"><use href="#as-mark"/></svg><span><span class="as-logo-txt1">Dental clinic name</span><span class="as-logo-txt2" data-label="Dental clinic English name">CLINIC dental clinic</span><span class="as-logo-txt3">Your clinic address goes here in one line 0000-0</span></span></span>`;
  const tel = () => `<a class="as-tel-big" href="tel:0000000000"><svg aria-hidden="true"><use href="#as-i-tel"/></svg>0000-00-0000</a>`;
  const hours = () => `<p class="as-hours">Morning 9:00~13:00<br>PM 14:30~18:30 (Saturday 14:00~17:00)<br>※ Closed: Wednesday afternoons, Sundays and public holidays</p>`;
  AS.menuMain = menuMain; AS.logo = logo; AS.tel = tel; AS.hours = hours;
  const CHROME = {
    header: () => `<div class="as-header-inner"><h1 class="as-header-logo"><a href="index.html">${logo()}</a></h1><div class="as-menu"><nav class="as-nav-wrap">${menuMain()}<ul class="as-menu-contact"><li><a href="tel:0000000000"><span>When calling us with an inquiry,</span><span class="as-icon-tel">0000-00-0000</span></a></li></ul><ul class="as-menu-sns"><li><a href="#instagram" aria-label="Social Media"><svg class="as-sns-i"><use href="#as-i-insta"/></svg></a></li></ul></nav></div><div class="as-header-cover"></div><div class="as-toggle" role="button" aria-label="Menu"><span></span><span></span><span></span></div></div>`,
    footer: () => `<div class="as-footer-bottom"><div class="as-footer-logo"><p class="as-logo-footer"><a href="index.html"><span class="as-logo-txt4">Medical corporation</span>${logo()}</a></p><a class="as-footer-sns" href="#instagram" aria-label="Social Media"><svg class="as-sns-i"><use href="#as-i-insta"/></svg></a></div><div class="as-info-tel"><p class="as-info-tel__t">When calling us with an inquiry,</p><div class="as-dashed">${tel()}</div>${hours()}</div><ul class="as-footer-nav"><li><a href="index.html">TOP</a></li><li><a href="news.html">Notice</a></li><li><a href="about.html#tour">For first-time visitors</a></li><li><a href="about.html">About the Director · Dental Clinic</a></li><li><a href="index.html#info">Treatment Guide</a></li><li><a href="recruit.html">Staff and Careers</a></li><li><a href="index.html#flow">Frequently asked questions</a></li><li><a href="index.html#access">Directions</a></li><li><a href="#privacy">Privacy policy</a></li><li><a href="#standard">Facility standards filing details</a></li></ul></div><div class="as-footer-img" data-label="Watercolor hill landscape · three layers of green hills, round trees and a walking family under a pale sky · landscape 2560×992"><svg aria-hidden="true"><use href="#as-hills"/></svg></div><p class="as-copy">© 2026 CLINIC dental clinic</p>`,
  };

  const build = () => {
    document.body.insertAdjacentHTML("afterbegin", sprite());
    for (const el of qa("[data-as-chrome]")) el.innerHTML = CHROME[el.dataset.asChrome]();
    qa("[data-as-logo]").forEach((el) => { el.outerHTML = logo(el.dataset.asLogo || ""); });
    qa("[data-as-menu]").forEach((el) => { el.outerHTML = menuMain("is-fv"); });
    qa("[data-as-tel]").forEach((el) => { el.outerHTML = tel(); });
    qa("[data-as-hours]").forEach((el) => { el.outerHTML = hours(); });
  };

  /* ───── Header bar — after 600px the menu panel turns white, and on the first page it drops in from above only after 1100px (.3s ease) ───── */
  const header = () => {
    const h = q(".as-header");
    if (!h) return;
    // On wide screens the first page drops in from the top only after passing 1100px — part appear-past-scroll (look: drop-solid, -125% · .3s ease). Always visible on phones and tablets
    if (document.body.classList.contains("is-home") && matchMedia("(min-width: 1024.1px)").matches) {
      h.setAttribute("data-fx-appear-past-scroll", "at: 1100; look: drop-solid");
      h.setAttribute("data-fx", "appear-past-scroll");
    }
    const on = () => h.classList.toggle("is-change", scrollY > 600);
    addEventListener("scroll", on, { passive: true });
    on();
    const t = q(".as-toggle", h), m = q(".as-menu", h), c = q(".as-header-cover", h);
    const flip = () => { t.classList.toggle("is-active"); m.classList.toggle("is-open"); };
    t.addEventListener("click", flip);
    c.addEventListener("click", () => { t.classList.remove("is-active"); m.classList.remove("is-open"); });
  };

  /* ───── Same-page anchors — jQuery animate 400ms swing ───── */
  const swing = (p) => 0.5 - Math.cos(p * Math.PI) / 2;
  const toHash = (target) => {
    const y = target.getBoundingClientRect().top + scrollY;
    if (reduce) return scrollTo(0, y);
    gsap.to(window, { scrollTo: y, duration: 0.4, ease: swing });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const t = id.length > 1 ? q(id) : document.documentElement;
    if (!t) return;
    e.preventDefault();
    toHash(t);
  });

  /* ───── Leaf flying along a dotted path — part path-leaf-loop (anime.js 3.2.1 motion path, original values 7.5s easeInOutQuad · rest 2.5s / reverse 8.5s · rest 3.5s) ───── */
  const paths = () => {
    qa("[data-as-dotline]").forEach((el) => {
      el.insertAdjacentHTML("afterbegin", '<div class="as-dotline"><svg viewBox="0 0 814 234" aria-hidden="true"><path data-fx-part="path" d="M812 0C812 44 776 78 660 78C540 78 452 30 342 30C232 30 166 100 162 160C158 220 186 233 210 233C236 233 270 220 274 158C278 96 208 10 118 10C30 10 0 74 0 74"/></svg></div>');
      el.setAttribute("data-fx", "path-leaf-loop");
    });
  };

  const start = () => {
    build();
    paths();
    header();
    if (location.hash) { const t = q(location.hash); if (t) { scrollTo(0, 0); setTimeout(() => toHash(t)); } }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
