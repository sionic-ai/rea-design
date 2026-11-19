// Common to all pages: draws illustration symbols, header, menu drawer, loader, chat button and footer, and wires up page transition, white-header switch, dark-background switch, reveal, parallax, card rows, cursor and share.
// Original values: move after .25s page turn · reveal rootMargin -100px · group stagger 120ms · background switch rootMargin bottom -50% · parallax y 0→-5% scrub.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const SM = (window.SM = { reduced, page });

  // ── Illustration: instead of the original image files, newly drawn white silhouettes of animals, people and a stump. The body (.sf) is drawn twice so only the outer outline remains ──
  const sprite = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
<defs>
  <g id="g-elephant">
    <ellipse class="sf" cx="130" cy="112" rx="88" ry="62"/>
    <rect class="sf" x="58" y="128" width="36" height="78" rx="14"/><rect class="sf" x="98" y="142" width="30" height="64" rx="12"/>
    <rect class="sf" x="160" y="142" width="30" height="64" rx="12"/><rect class="sf" x="192" y="126" width="36" height="80" rx="14"/>
    <circle class="sf" cx="226" cy="82" r="50"/>
    <path class="sf" d="M250 62c22-12 34-32 30-52-2-9 10-12 14-4 10 24-4 52-30 70z"/>
  </g>
  <g id="g-bear">
    <circle class="sf" cx="40" cy="18" r="10"/><circle class="sf" cx="80" cy="16" r="10"/>
    <circle class="sf" cx="60" cy="40" r="28"/><ellipse class="sf" cx="84" cy="48" rx="16" ry="11"/>
    <ellipse class="sf" cx="58" cy="104" rx="38" ry="48"/>
    <rect class="sf" x="28" y="128" width="26" height="50" rx="11"/><rect class="sf" x="62" y="128" width="26" height="50" rx="11"/>
    <path class="sf" d="M86 82c20 2 30 18 26 32-3 10-15 8-17-1-2-9-8-13-13-15z"/>
  </g>
  <g id="g-deer">
    <ellipse class="sf" cx="72" cy="118" rx="54" ry="30"/>
    <path class="sf" d="M100 110 116 54l22 6-12 52z"/>
    <ellipse class="sf" cx="134" cy="50" rx="23" ry="14" transform="rotate(14 134 50)"/>
    <path class="sf" d="M116 40 104 30l10-2 8 8z"/>
    <rect class="sf" x="28" y="128" width="11" height="66" rx="5"/><rect class="sf" x="46" y="132" width="11" height="62" rx="5"/>
    <rect class="sf" x="92" y="132" width="11" height="62" rx="5"/><rect class="sf" x="108" y="128" width="11" height="66" rx="5"/>
    <path class="sfl" d="M128 36c-4-14 0-24 8-30M133 22l-10-8M138 36c6-12 16-18 26-18M152 20l4-12"/>
  </g>
  <g id="g-bird">
    <ellipse class="sf" cx="28" cy="30" rx="20" ry="13"/><circle class="sf" cx="44" cy="18" r="10"/>
    <path class="sf" d="M10 28 0 18l14 4z"/>
  </g>
  <g id="g-person">
    <circle class="sf" cx="60" cy="34" r="20"/><ellipse class="sf" cx="60" cy="20" rx="30" ry="7"/><path class="sf" d="M44 20c0-16 32-16 32 0z"/>
    <path class="sf" d="M34 62c8-8 44-8 52 0l10 76H24z"/>
    <rect class="sf" x="36" y="132" width="20" height="70" rx="8"/><rect class="sf" x="64" y="132" width="20" height="70" rx="8"/>
    <path class="sf" d="M84 66c16 8 24 26 24 40-2 6-10 6-12 0-2-12-8-20-16-24z"/>
  </g>
  <g id="g-stump">
    <path class="sf" d="M22 40c0-14 76-14 76 0v40c8 6 18 8 26 10H0c8-2 18-4 22-10z"/>
    <ellipse class="sf" cx="60" cy="40" rx="38" ry="12"/>
    <path class="sf" d="M84 30c6-14 14-20 24-22 2 4-2 10-8 14-6 4-10 8-12 12z"/>
  </g>
  <path id="p-heart" d="M0 8C0-4 18-6 20 6 22-6 40-4 40 8 40 22 20 32 20 36 20 32 0 22 0 8z"/>
  <g id="g-flower"><circle class="sd" cx="0" cy="-9" r="5"/><circle class="sd" cx="8.5" cy="-3" r="5"/><circle class="sd" cx="5.3" cy="7.3" r="5"/><circle class="sd" cx="-5.3" cy="7.3" r="5"/><circle class="sd" cx="-8.5" cy="-3" r="5"/></g>
</defs>
<symbol id="i-elephant" viewBox="-10 0 320 215">
  <use class="ol" href="#g-elephant"/><use href="#g-elephant"/>
  <path class="sl" d="M208 58c-20 2-28 34-14 56 10 14 26 6 26-8M240 104c12 8 24 6 30-2M44 100c-12 6-16 18-12 28M64 196h22M200 196h22M104 196h18M166 196h18M110 92c20-10 52-12 70 0"/>
  <circle class="sd" cx="242" cy="72" r="4"/>
</symbol>
<symbol id="i-bear" viewBox="0 0 120 182">
  <use class="ol" href="#g-bear"/><use href="#g-bear"/>
  <path class="sl" d="M36 14a6 6 0 0 1 8 0M76 13a6 6 0 0 1 8 0M80 58c4 3 9 3 12 0M40 100c8 14 28 14 36 0M32 176h18M66 176h18M98 112l4 4"/>
  <circle class="sd" cx="70" cy="34" r="3.5"/><circle class="sd" cx="96" cy="45" r="4"/>
</symbol>
<symbol id="i-deer" viewBox="0 0 170 200">
  <use class="ol" href="#g-deer"/><use href="#g-deer"/>
  <path class="sl" d="M24 108c-8-2-12 4-10 10M60 112h0M76 104h0M30 194h8M48 194h8M94 194h8M110 194h8"/>
  <circle class="sd" cx="140" cy="46" r="3"/><circle class="sd" cx="155" cy="56" r="3.5"/>
  <circle class="sd" cx="58" cy="108" r="3" opacity=".5"/><circle class="sd" cx="76" cy="100" r="3" opacity=".5"/><circle class="sd" cx="70" cy="118" r="3" opacity=".5"/>
</symbol>
<symbol id="i-bird" viewBox="-2 0 66 52">
  <use class="ol" href="#g-bird"/><use href="#g-bird"/>
  <path class="sl" d="M20 30c6 6 14 6 18 0M26 42v8M32 42v8"/><path class="sd" d="M53 16l9 3-9 3z"/><circle class="sd" cx="46" cy="16" r="2.4"/>
</symbol>
<symbol id="i-person" viewBox="0 0 130 205">
  <use class="ol" href="#g-person"/><use href="#g-person"/>
  <path class="sl" d="M52 40c4 4 12 4 16 0M60 70v60M40 200h16M66 200h16"/><circle class="sd" cx="52" cy="32" r="2.6"/><circle class="sd" cx="68" cy="32" r="2.6"/>
</symbol>
<symbol id="i-stump" viewBox="-4 -4 132 100">
  <use class="ol" href="#g-stump"/><use href="#g-stump"/>
  <ellipse class="sl" cx="60" cy="40" rx="26" ry="7"/><ellipse class="sl" cx="60" cy="40" rx="12" ry="3"/>
  <path class="sl" d="M40 56v18M60 58v20M80 56v18"/>
</symbol>
<symbol id="i-parade" viewBox="0 0 640 330">
  <use href="#i-bird" x="0" y="262" width="74" height="58"/>
  <g transform="translate(420 0) scale(-1 1)"><use href="#i-elephant" x="0" y="14" width="400" height="270"/></g>
  <use href="#i-bear" x="236" y="0" width="92" height="140"/>
  <use href="#i-bear" x="150" y="132" width="132" height="200"/>
  <use href="#i-deer" x="300" y="70" width="200" height="236"/>
  <use href="#i-bear" x="262" y="168" width="104" height="160"/>
  <use href="#i-person" x="470" y="96" width="140" height="222"/>
  <use href="#i-bird" x="572" y="40" width="64" height="52"/>
</symbol>
<symbol id="i-play" viewBox="0 0 320 272">
  <use href="#i-deer" x="104" y="0" width="216" height="254"/>
  <use href="#i-person" x="0" y="58" width="136" height="214"/>
  <use href="#i-bird" x="4" y="14" width="58" height="46"/>
</symbol>
<symbol id="i-live" viewBox="0 0 300 290">
  <use href="#i-person" x="0" y="20" width="170" height="268"/>
  <path class="sfl" d="M164 18v270M142 18h44M142 18V0M153 18V0M164 18V0M175 18V0M186 18V0" style="stroke-width:7"/>
  <use href="#i-bear" x="182" y="116" width="116" height="174"/>
</symbol>
<symbol id="i-bears" viewBox="0 0 320 210">
  <use href="#g-flower" x="40" y="40"/><use href="#g-flower" x="280" y="44"/><use href="#g-flower" x="22" y="150"/><use href="#g-flower" x="300" y="160"/><use href="#g-flower" x="160" y="18"/>
  <g transform="translate(152 0) scale(-1 1)"><use href="#i-bear" x="10" y="30" width="118" height="180"/></g>
  <use href="#i-bear" x="168" y="30" width="118" height="180"/>
  <use href="#p-heart" class="sf" x="140" y="64"/>
</symbol>
<symbol id="i-corn" viewBox="0 0 100 100">
  <rect class="sd" width="100" height="100" rx="12"/>
  <path class="sfl" style="stroke-width:3" d="M34 82c-10-18-10-44 2-62 12 18 12 44-2 62zM66 82c10-18 10-44-2-62-12 18-12 44 2 62zM36 30v44M64 30v44M28 46h14M58 46h14M28 60h14M58 60h14M34 82l-12 8M66 82l12 8"/>
</symbol>
<symbol id="i-map" viewBox="0 0 420 300">
  <path class="sl" d="M38 128c18-30 36-58 62-70 24-8 44 8 66 2 20-6 26-30 46-34 26-4 46 20 72 26 22 4 40-10 60-2 20 10 26 40 36 60 8 18-12 32-16 50-4 22 20 38 18 60-2 22-30 34-52 42-26 8-44-12-68-6-22 6-30 30-54 30-24 0-40-24-60-36-18-10-42-12-54-30-12-18 6-40-4-58-8-14-34-16-48-30z"/>
  <path class="sl" d="M276 186c10-14 36-16 50-4 12 10 8 30-8 36-16 6-40 0-46-14-2-6 0-12 4-18z"/>
  <path class="sl" d="M120 156l26-36 26 36M156 156l24-28 24 28M232 112l18-22 18 22" />
  <path class="sl" d="M60 214c40-6 70 10 110 0s70-30 120-20" style="stroke-dasharray:4 7"/>
  <circle class="sd" cx="206" cy="186" r="4"/>
</symbol>
<symbol id="i-cursor" viewBox="0 0 80 80">
  <circle cx="40" cy="40" r="38" style="fill:var(--kf-ink)"/>
  <path d="M22 44h34L46 34" fill="none" style="stroke:var(--kf-surface)" stroke-width="2"/>
</symbol>
<symbol id="i-leaf" viewBox="0 0 22 16"><path d="M1 15C3 5 10 1 21 1c-2 9-8 14-17 13M1 15l9-8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="i-sns1" viewBox="0 0 28 28"><rect x="2" y="2" width="24" height="24" rx="7" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="14" cy="14" r="5.5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="21" cy="7" r="1.6" fill="currentColor"/></symbol>
<symbol id="i-sns2" viewBox="0 0 28 28"><rect x="1" y="1" width="26" height="26" rx="7" fill="currentColor"/><path d="M7 13c0-4 3-6 7-6s7 2 7 6-3 6-7 6l-4 3v-3.5C8 17.5 7 15.5 7 13z" style="fill:var(--kf-surface)"/></symbol>
<symbol id="i-sns3" viewBox="0 0 30 22"><rect x="1" y="1" width="28" height="20" rx="6" fill="currentColor"/><path d="M12 6.5v9l7.5-4.5z" style="fill:var(--kf-surface)"/></symbol>
<symbol id="i-share1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M13.5 19v-6h2l.4-2.4h-2.4V9.3c0-.7.3-1.2 1.3-1.2H16V6c-.4 0-1.2-.1-2-.1-2 0-3.2 1.2-3.2 3.3v1.4H8.8V13h2v6z" style="fill:var(--kf-bg)"/></symbol>
<symbol id="i-share2" viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="5" fill="currentColor"/><path d="M7 7l10 10M17 7 7 17" style="stroke:var(--kf-bg)" stroke-width="2"/></symbol>
<symbol id="i-share3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M10 14l4-4M9 11.5l-1.5 1.5a2.5 2.5 0 0 0 3.5 3.5l1.5-1.5M15 12.5l1.5-1.5a2.5 2.5 0 0 0-3.5-3.5L11.5 9" fill="none" style="stroke:var(--kf-bg)" stroke-width="1.6" stroke-linecap="round"/></symbol>
</svg>`;
  document.body.insertAdjacentHTML("afterbegin", sprite);
  const ill = (id, cls = "", style = "") => `<svg class="ill ${cls}" style="${style}" viewBox="${document.getElementById(id).getAttribute("viewBox")}" aria-hidden="true"><use href="#${id}"/></svg>`;
  SM.ill = ill;

  const cur = (p) => (p === page ? " is-current" : "");
  const word = '<span class="sm-word">The village’s <b>Name</b><i>。</i></span>';
  SM.word = word;

  // ── Loader (first visit, first page only) ──
  document.body.insertAdjacentHTML("afterbegin", `<div class="sm-loader" data-slot="loader">${ill("i-stump", "sm-loader__spin", "--ill-fill:transparent;--ill-ow:0")}</div>`);

  // ── Header ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("sm-head");
    head.innerHTML = `
      <div class="sm-head__logo">
        <a class="sm-head__main" href="index.html" aria-label="First Page">${word}</a>
        <div class="sm-head__text"><p class="sm-head__sub">Area Name</p><p class="sm-head__media">Village guide media</p></div>
      </div>
      <nav class="sm-head__nav" aria-label="Main menu">
        <ul class="sm-head__links">
          <li><a class="sm-head__link${cur("enjoy")}" href="enjoy.html"><span>Playing</span></a></li>
          <li><a class="sm-head__link" href="#"><span>Learning</span></a></li>
          <li><a class="sm-head__link" href="#"><span>Typo</span></a></li>
          <li><a class="sm-head__link${cur("recruit")}" href="recruit.html"><span>Living</span></a></li>
          <li><a class="sm-head__link${cur("news")}${cur("article")}" href="news.html"><span>Reading</span></a></li>
        </ul>
        <button class="sm-head__btn" type="button" aria-label="Open Menu"><span class="sm-head__btn-text"><span class="is-open">Browse</span><span class="is-close">Close</span></span><span class="sm-head__icon"></span></button>
      </nav>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="sm-menu sm-paper-light" data-slot="menu-drawer">
        <div class="sm-menu__in">
          <ul class="sm-menu__upper">
            <li><a class="sm-menu__card${cur("enjoy")}" href="enjoy.html">${ill("i-play", "sm-menu__img", "--ill-fill:var(--site-ill-play);--ill-line:var(--kf-surface);--ill-ow:0")}<span class="sm-menu__text">Playing</span></a></li>
            <li><a class="sm-menu__card" href="#">${ill("i-bears", "sm-menu__img", "--ill-fill:var(--site-ill-learn);--ill-line:var(--kf-surface);--ill-ow:0")}<span class="sm-menu__text">Learning</span></a></li>
            <li><a class="sm-menu__card" href="#">${ill("i-elephant", "sm-menu__img", "--ill-fill:var(--site-ill-come);--ill-line:var(--kf-surface);--ill-ow:0")}<span class="sm-menu__text">Typo</span></a></li>
            <li><a class="sm-menu__card${cur("recruit")}" href="recruit.html">${ill("i-live", "sm-menu__img", "--ill-fill:var(--site-ill-live);--ill-line:var(--kf-surface);--ill-ow:0")}<span class="sm-menu__text">Living</span></a></li>
          </ul>
          <div class="sm-menu__middle">
            <a class="sm-menu__wide is-contact" href="#">
              <div class="wf-img" data-label="Field below the mountains · cloudy daytime · full-bleed landscape"></div>
              ${ill("i-stump", "sm-menu__img")}
              <span><span class="sm-menu__big">Your consultation desk here</span><span class="sm-menu__small" style="display:block">Your line inviting them to ask anything,<br>Add a second line of guidance.</span></span>
            </a>
            <a class="sm-menu__wide is-journal${cur("news")}${cur("article")}" href="news.html">
              ${ill("i-bears", "sm-menu__img")}
              <span><span class="sm-menu__small" style="display:block">Life of the village · people · streets</span><span class="sm-menu__big">Reads</span></span>
            </a>
          </div>
          <div class="sm-menu__lower">
            <a class="sm-menu__banner" href="#">
              <div class="wf-img" data-label="Club logo · square"></div>
              <span class="sm-menu__banner-texts"><span class="sm-menu__banner-title">Your one line on adding us as a messenger friend</span><span class="sm-menu__banner-name">Club name here →</span></span>
            </a>
            <div class="sm-menu__links">
              <div><a class="sm-menu__link${page === "home" ? " is-current" : ""}" href="index.html"><span>Home</span></a><a class="sm-menu__link" href="#"><span>News and Events</span></a><a class="sm-menu__link" href="#"><span>Town notice board</span></a></div>
              <div><a class="sm-menu__link" href="#"><span>Find vacant homes·land</span></a><a class="sm-menu__link${cur("recruit")}" href="recruit.html"><span>Job search</span></a></div>
              <div><a class="sm-menu__link" href="#"><span>Find support programs</span></a><a class="sm-menu__link" href="#"><span>Relocation Experience</span></a></div>
            </div>
            <div class="sm-menu__small"><a class="sm-menu__link" href="#"><span>Privacy policy</span></a><a class="sm-menu__link" href="#"><span>Parenting support site</span></a><a class="sm-menu__link" href="#"><span>Government Portal</span></a></div>
          </div>
        </div>
      </div>`
    );
  }

  // ── Consultation chat button ──
  document.body.insertAdjacentHTML("beforeend", `<button class="sm-chat${page === "home" ? "" : " is-visible"}" type="button" aria-label="Consultation chat" data-slot="chat-button"><i><b></b></i></button><div class="sm-toast" role="status"></div>`);

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("sm-foot");
    const links = [
      ["index.html", "Home", "home"], ["enjoy.html", "Playing in the town", "enjoy"], ["#", "Learning the town"], ["#", "Coming to town"], ["#", "Living in the town"],
      ["news.html", "Reads", "news"], ["#", "News and Events"], ["#", "Town notice board"], ["#", "Find vacant homes·land"], ["recruit.html", "Job search", "recruit"],
      ["#", "Find support programs"], ["#", "Relocation Experience"], ["#", "Town fan club"], ["#", "Anything-goes help desk"],
    ];
    foot.innerHTML = `
      <div class="sm-foot__banner">
        <a class="sm-foot__card sm-max" href="#">
          <div class="sm-foot__bg"><div class="wf-img" data-label="Fields below a mountain · overcast day · wide landscape"></div></div>
          ${ill("i-stump", "sm-foot__log")}
          <div class="sm-foot__texts"><p class="sm-foot__title">Your consultation desk here</p><p class="sm-foot__sub">Your line inviting them to ask anything,<br>Add a second line of guidance.</p></div>
        </a>
      </div>
      <div class="sm-foot__content sm-paper-light">
        <div class="sm-foot__upper">
          <div class="sm-foot__header">
            <div class="sm-foot__logo"><a href="index.html">${word}</a><p class="sm-foot__logo-sub">Area Name</p></div>
            <button class="sm-foot__top" type="button">Page top</button>
          </div>
          <div class="sm-foot__middle">
            <div class="sm-foot__links">
              <ul class="sm-foot__list">${links.map(([h, t, p]) => `<li><a class="${p && p === page ? "is-current" : ""}" href="${h}"><span>${t}</span></a></li>`).join("")}</ul>
              <div class="sm-foot__sns"><a href="#" aria-label="Photo account">${ill("i-sns1")}</a><a href="#" aria-label="Messenger">${ill("i-sns2")}</a><a href="#" aria-label="Video channel">${ill("i-sns3")}</a></div>
            </div>
            <a class="sm-foot__book" href="#">
              <span class="sm-foot__book-in">
                <span class="wf-img" data-label="Guidebook cover · Vertical"></span>
                <span class="sm-foot__book-texts"><span class="sm-foot__book-title" style="display:block">A GUIDE TO PLACEHOLDER</span><span class="sm-foot__book-text" style="display:block">Your guidebook intro here, one line<br>Add an intro on the second line</span><span class="sm-btn no-hover"><span>View guidebook</span></span></span>
              </span>
            </a>
          </div>
        </div>
        <div class="sm-foot__lower"><div><a href="#">Privacy policy</a><a href="#">Parenting support site</a><a href="#">Government Portal</a></div><p>©Your organization name here</p></div>
      </div>`;
    foot.querySelector(".sm-foot__top").addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
  }

  // ── Page turn: same-site links fade out over .25s, then navigate ──
  const loaded = () => {
    document.body.classList.add("is-loaded");
    // Original: opening a page other than the first once skips the first-page loader
    if (page !== "home") sessionStorage.setItem("sm-front-loaded", "1");
    if (sessionStorage.getItem("sm-no-fade") === "1") { document.body.classList.add("is-no-transition"); sessionStorage.removeItem("sm-no-fade"); }
  };
  if (document.readyState === "complete") loaded(); else addEventListener("DOMContentLoaded", loaded);
  addEventListener("pageshow", (e) => { if (e.persisted) { document.body.classList.remove("is-leaving"); document.body.classList.add("is-loaded"); } });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.target === "_blank" || /^(mailto|tel|javascript):/.test(href)) return;
    if (a.hasAttribute("data-no-transition")) { sessionStorage.setItem("sm-no-fade", "1"); return; }
    const u = new URL(href, location.href);
    if (u.protocol !== location.protocol || u.host !== location.host) return;
    if (u.pathname === location.pathname) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    document.body.classList.add("is-leaving");
    setTimeout(() => (location.href = u.href), reduced ? 0 : 250);
  });

  // ── Menu drawer: when open, pin the body in place ──
  const btn = document.querySelector(".sm-head__btn");
  const menu = document.querySelector(".sm-menu");
  let lockY = 0;
  btn?.addEventListener("click", () => {
    const open = !head.classList.contains("is-open");
    head.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (open) { lockY = scrollY; document.body.classList.add("is-lock"); document.body.style.top = `-${lockY}px`; }
    else { document.body.classList.remove("is-lock"); document.body.style.top = ""; scrollTo(0, lockY); }
  });

  // ── Over a photo the header turns white (original js-nav-white: when it overlaps the top 50px) ──
  const whites = document.querySelectorAll(".js-nav-white");
  if (whites.length && head) {
    const io = new IntersectionObserver((ents) => {
      const states = new Map();
      ents.forEach((en) => states.set(en.target, en));
      SM._white = SM._white || new Map();
      states.forEach((v, k) => SM._white.set(k, v));
      const on = [...SM._white.values()].some((en) => en.isIntersecting && en.target.getBoundingClientRect().top <= 50 && en.target.getBoundingClientRect().bottom > 0);
      head.classList.toggle("is-white", on);
    }, { threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.99, 1] });
    whites.forEach((el) => io.observe(el));
    const check = () => head.classList.toggle("is-white", [...whites].some((el) => { const r = el.getBoundingClientRect(); return r.top <= 50 && r.bottom > 50; }));
    addEventListener("scroll", check, { passive: true });
    check();
  }

  // ── Dark texture zone (original js-back-dark: switches over 1.5s when it covers the top half of the screen) ──
  const darks = document.querySelectorAll(".js-back-dark");
  const darkTargets = document.querySelectorAll(".sm-main, .sm-head");
  if (darks.length) {
    const seen = new Map();
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => seen.set(en.target, en.isIntersecting));
      const on = [...seen.values()].some(Boolean);
      darkTargets.forEach((t) => t.classList.toggle("is-back-dark", on));
    }, { rootMargin: "0px 0px -50% 0px" });
    darks.forEach((el) => io.observe(el));
  }

  // ── Reveal when visible (original js-anim): rootMargin -100px, with data-stagger 120ms per child ──
  SM.anim = (root = document) => {
    const els = root.querySelectorAll(".js-anim");
    if (reduced) return;
    els.forEach((el) => {
      const st = el.dataset.stagger;
      if (st) el.querySelectorAll(`:scope ${st}`).forEach((c) => c.classList.add("before-anim"));
      else el.classList.add("before-anim");
    });
    const io = new IntersectionObserver((ents, obs) => {
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const st = el.dataset.stagger;
        if (st) el.querySelectorAll(`:scope ${st}`).forEach((c, i) => setTimeout(() => c.classList.remove("before-anim"), 120 * i));
        else el.classList.remove("before-anim");
        obs.unobserve(el);
      });
    }, { rootMargin: "-100px" });
    els.forEach((el) => io.observe(el));
  };
  SM.anim();

  // ── Parallax · header photo ──
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const trig = el.closest("[data-parallax-trigger]") || el.parentElement;
      gsap.fromTo(el, { y: "0%" }, { y: el.dataset.parallax || "-5%", ease: "none", force3D: true, scrollTrigger: { trigger: trig, start: trig.dataset.parallaxStart || "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    document.querySelectorAll(".sm-ph__bg").forEach((bg) => {
      const trig = bg.closest(".sm-ph-m, .sm-ph-l");
      gsap.fromTo(bg.querySelector(".wf-img"), { yPercent: 0 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: trig, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  });

  // ── Mask where the image grows ──
  const zooms = document.querySelectorAll(".sm-zoom");
  if (zooms.length) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => en.target.querySelector(".sm-zoom__mask")?.classList.toggle("is-active", en.isIntersecting)), { threshold: 0.2 });
    zooms.forEach((z) => io.observe(z));
  }

  // ── Share: copy-link notice ──
  const toast = document.querySelector(".sm-toast");
  SM.toast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("is-visible"), 2000);
  };
  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(location.href); SM.toast("Address copied"); } catch { SM.toast("Could not copy"); }
  }));

  // ── Swapping the list (original initArchiveAjax): the original fetches the filter / page URL, replaces the same area, and scrolls smoothly up to the list head (128px at 801 and up, 88px offset below that).
  //    The copy has no other side to fetch from, so it is filtered in place, and the remaining rows are raised again with the original css animation (.6s, .04s apart — the original rule goes up to the 12th, so beyond that it is 0) ──
  SM.relist = (items, scrollTarget) => {
    let k = 0;
    items.forEach((it) => {
      if (it.classList.contains("is-hidden")) return;
      it.style.animation = "none";
      it.offsetWidth;
      it.style.animation = "";
      it.style.animationDelay = `${++k <= 12 ? 0.04 * k : 0}s`;
    });
    if (scrollTarget) requestAnimationFrame(() => scrollTo({ top: Math.max(0, scrollTarget.getBoundingClientRect().top + scrollY - (innerWidth >= 801 ? 128 : 88)), behavior: reduced ? "auto" : "smooth" }));
  };
  document.querySelectorAll(".sm-pager").forEach((pager) => pager.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    e.preventDefault();
    const pages = [...pager.children].filter((p) => !p.classList.contains("is-next") && /\d/.test(p.textContent));
    const cur = pages.findIndex((p) => p.classList.contains("is-current"));
    const next = a.classList.contains("is-next") ? pages[Math.min(cur + 1, pages.length - 1)] : a;
    pages.forEach((p) => p.classList.toggle("is-current", p === next));
    const list = pager.parentElement.querySelector("[data-relist]");
    if (list) SM.relist([...list.children], list);
  }));

  // ── Fixed filter under the phone: only while the target range covers the screen ──
  document.querySelectorAll(".sm-spfix[data-target]").forEach((fx) => {
    const t = document.querySelector(fx.dataset.target);
    if (!t) return;
    ScrollTrigger.create({ trigger: t, start: "top bottom", end: "bottom top", onUpdate: () => { const r = t.getBoundingClientRect(); fx.classList.toggle("is-visible", (r.top >= 0 && r.bottom <= innerHeight) || (r.height > innerHeight && r.top <= 0 && r.bottom >= innerHeight)); }, onLeave: () => fx.classList.remove("is-visible"), onLeaveBack: () => fx.classList.remove("is-visible") });
  });

  // Circular arrow cursor (original swiper-custom-cursor): flips on the left half, hidden over links, goes back and forth on press, auto-advance pauses while it is over the slider
  SM.cursorNav = (root, sw, { ignore = "a, .sm-btn" } = {}) => {
    const hover = matchMedia("(hover: hover)");
    const c = document.createElement("div");
    c.className = "sm-cursor";
    c.innerHTML = ill("i-cursor");
    document.body.append(c);
    const left = (x) => { const r = root.getBoundingClientRect(); return x < r.left + r.width / 2; };
    root.addEventListener("mousemove", (e) => {
      if (!hover.matches) return;
      if (e.target.closest(ignore)) { c.classList.remove("is-visible"); return; }
      const w = c.getBoundingClientRect().width || 80;
      c.style.left = e.clientX - w / 2 + "px";
      c.style.top = e.clientY - w / 2 + "px";
      c.classList.add("is-visible");
      c.classList.toggle("is-prev", left(e.clientX));
    });
    root.addEventListener("mouseenter", () => sw.autoplay?.running && sw.autoplay.stop());
    root.addEventListener("mouseleave", () => { c.classList.remove("is-visible"); if (!reduced) sw.autoplay?.start(); });
    root.addEventListener("click", (e) => { if (e.target.closest(ignore)) return; left(e.clientX) ? sw.slidePrev() : sw.slideNext(); });
  };

  // ── Related posts row (original swiper 8.4.7 recommend-journal-swiper settings as is) ──
  document.querySelectorAll("[data-rec]").forEach((track) => {
    const sw = new Swiper(track, {
      slidesPerView: 1.5, spaceBetween: 12, centeredSlides: true, speed: 1600, loop: true,
      autoplay: reduced ? false : { delay: 2800, disableOnInteraction: false },
      breakpoints: { 800: { slidesPerView: 2.5, spaceBetween: 32 } },
    });
    SM.cursorNav(track, sw);
  });
})();
