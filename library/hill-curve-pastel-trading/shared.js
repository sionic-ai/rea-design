// Shared by all pages: art sprite, header·phone menu panel, contact box·footer, sub-page header curve,
// Reveal (original IntersectionObserver values as is), header pin and hide, a round follower button, parallax, accordion, pastel fixed background.
(() => {
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSP = () => innerWidth < 768;

  /* ── Art: original illustrations (globe · airplane · doctor · researcher · truck · icons) redrawn as sprites in the same spot and tone ── */
  const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">
<defs>
  <linearGradient id="ftg-a" x1="0" y1="0" x2="0" y2="1"><stop style="stop-color: color-mix(in oklab, var(--kf-accent) 18.1%, var(--kf-bg))" offset="0"/><stop style="stop-color: color-mix(in oklab, var(--kf-accent) 64.9%, var(--kf-bg))" offset="1"/></linearGradient>
  <linearGradient id="ftg-b" x1="0" y1="0" x2="1" y2="1"><stop style="stop-color: color-mix(in oklab, var(--kf-accent) 5.4%, var(--kf-bg))" offset="0"/><stop style="stop-color: color-mix(in oklab, var(--kf-accent) 32.8%, var(--kf-bg))" offset="1"/></linearGradient>
  <linearGradient id="ftg-c" x1="0" y1="0" x2="1" y2="1"><stop style="stop-color: color-mix(in oklab, var(--kf-accent) 64.7%, var(--kf-bg))" offset="0"/><stop style="stop-color: oklch(from var(--kf-accent) calc(l * 0.953) calc(c * 0.79) calc(h + 4.78))" offset="1"/></linearGradient>
  <linearGradient id="ftg-g" x1="0" y1="0" x2="1" y2="0"><stop style="stop-color: var(--site-mid)" offset="0"/><stop style="stop-color: var(--site-green)" offset="1"/></linearGradient>
  <linearGradient id="ftg-w" x1="0" y1="0" x2="0" y2="1"><stop style="stop-color: var(--kf-bg)" offset="0"/><stop style="stop-color: color-mix(in oklab, var(--kf-accent) 14.7%, var(--kf-bg))" offset="1"/></linearGradient>

  <symbol id="ill-globe" viewBox="0 0 300 300">
    <circle cx="150" cy="150" r="140" fill="url(#ftg-b)"/>
    <path d="M70 60c30-18 70-20 92-6 14 9 4 26-14 30-20 4-26 22-12 36 16 16 6 40-18 42-30 3-58-14-70-40-10-22 0-50 22-62z" fill="url(#ftg-a)" opacity=".75"/>
    <path d="M190 120c18-6 40 4 50 22 10 18 4 44-12 60-12 12-30 8-34-8-4-14-16-20-14-36 2-20-6-32 10-38z" fill="url(#ftg-a)" opacity=".8"/>
    <path d="M176 70l8 6-4 10 6 8-8 10-4-8-8 2 4-10-6-6z" fill="url(#ftg-c)" opacity=".7"/>
    <path d="M110 220c16-6 34 0 40 14 4 12-10 22-26 20-16-2-30-26-14-34z" fill="url(#ftg-a)" opacity=".6"/>
  </symbol>
  <symbol id="ill-plane" viewBox="0 0 160 60">
    <path d="M8 34c20-6 70-12 118-14 12 0 22 2 26 6-4 6-18 10-34 12-40 4-80 6-104 4-8-1-10-6-6-8z" fill="url(#ftg-w)"/>
    <path d="M70 30l-18 26h12l30-24z" fill="url(#ftg-a)"/>
    <path d="M118 22l18-20h10l-12 22z" fill="url(#ftg-g)"/>
    <path d="M60 28l-6-14h8l14 12z" fill="url(#ftg-a)" opacity=".7"/>
    <g style="fill: color-mix(in oklab, var(--kf-accent) 81.2%, var(--kf-bg))"><circle cx="40" cy="31" r="1.8"/><circle cx="48" cy="30.4" r="1.8"/><circle cx="56" cy="29.8" r="1.8"/><circle cx="64" cy="29.2" r="1.8"/><circle cx="140" cy="27" r="2.4"/></g>
  </symbol>
  <symbol id="ill-doctor" viewBox="0 0 300 240">
    <path d="M40 240c4-50 30-80 76-86h40c46 6 72 36 76 86z" fill="url(#ftg-a)"/>
    <circle cx="136" cy="96" r="40" fill="url(#ftg-b)"/>
    <path d="M98 82c6-26 30-38 52-34 18 4 30 18 30 34-26-8-56-8-82 0z" fill="url(#ftg-c)" opacity=".8"/>
    <circle style="fill: var(--kf-bg); stroke: color-mix(in oklab, var(--kf-accent) 60.1%, var(--kf-bg))" cx="136" cy="62" r="11" stroke-width="4"/>
    <rect x="104" y="150" width="62" height="78" rx="6" fill="url(#ftg-w)" transform="rotate(-8 135 189)"/>
    <path style="stroke: color-mix(in oklab, var(--kf-accent) 44.5%, var(--kf-bg))" d="M118 172h34M118 186h34M118 200h22" stroke-width="4" transform="rotate(-8 135 189)"/>
    <rect x="212" y="78" width="46" height="70" rx="10" fill="url(#ftg-b)" transform="rotate(22 235 113)"/>
    <rect x="216" y="62" width="34" height="16" rx="4" fill="url(#ftg-c)" transform="rotate(22 235 70)"/>
    <g style="stroke: color-mix(in oklab, var(--kf-accent) 44.5%, var(--kf-bg))" fill="url(#ftg-w)" stroke-width="2"><rect x="186" y="18" width="22" height="10" rx="5" transform="rotate(-30 197 23)"/><rect x="224" y="8" width="22" height="10" rx="5" transform="rotate(20 235 13)"/><rect x="250" y="30" width="22" height="10" rx="5" transform="rotate(-10 261 35)"/></g>
  </symbol>
  <symbol id="ill-scientist" viewBox="0 0 300 240">
    <rect style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" x="18" y="96" width="78" height="78" rx="12" fill="url(#ftg-b)" stroke-width="2"/>
    <g fill="url(#ftg-w)"><circle cx="40" cy="120" r="10"/><circle cx="74" cy="112" r="10"/><circle cx="62" cy="150" r="10"/></g>
    <path style="stroke: var(--kf-on-accent)" d="M40 120L74 112M40 120L62 150" stroke-width="5"/>
    <path d="M110 240c2-56 22-90 60-96h28c38 6 58 40 60 96z" fill="url(#ftg-w)"/>
    <path d="M168 146l16 40 16-40" fill="url(#ftg-a)"/>
    <circle cx="184" cy="98" r="34" fill="url(#ftg-b)"/>
    <path d="M150 92c2-28 24-42 46-38 20 4 30 20 26 40-14-14-40-18-72-2z" fill="url(#ftg-c)" opacity=".85"/>
    <circle cx="214" cy="56" r="14" fill="url(#ftg-c)" opacity=".85"/>
    <path d="M118 176c-6-34-4-66 6-92" stroke="url(#ftg-a)" stroke-width="20" stroke-linecap="round" fill="none"/>
    <rect style="stroke: color-mix(in oklab, var(--kf-accent) 44.5%, var(--kf-bg))" x="114" y="38" width="12" height="44" rx="6" fill="url(#ftg-w)" stroke-width="2"/>
    <rect x="114" y="62" width="12" height="20" rx="6" fill="url(#ftg-g)"/>
    <path style="stroke: color-mix(in oklab, var(--kf-accent) 26.4%, var(--kf-bg))" d="M232 44l18-12M244 64l22-4M236 30l8-18" stroke-width="3" stroke-linecap="round"/>
  </symbol>
  <symbol id="ill-truck" viewBox="0 0 300 240">
    <path d="M10 190l120-70 160 40-110 76z" fill="url(#ftg-b)"/>
    <path style="stroke: var(--kf-on-accent)" d="M40 172l170 42M80 150l150 40M120 128l120 30M70 190l90-60M150 214l80-62" stroke-width="5" opacity=".9"/>
    <path d="M128 70l110-34 40 22v74l-110 34-40-22z" fill="url(#ftg-a)"/>
    <path d="M128 70l110-34 40 22-110 34z" fill="url(#ftg-w)" opacity=".85"/>
    <path d="M168 92v74l-40-22V70z" fill="url(#ftg-b)"/>
    <path d="M86 110l42-20v54l-40 18-12-14v-26z" fill="url(#ftg-w)"/>
    <path style="fill: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" d="M92 116l26-12v18l-28 12z"/>
    <g fill="url(#ftg-c)"><circle cx="110" cy="164" r="12"/><circle cx="208" cy="148" r="12"/><circle cx="250" cy="134" r="12"/></g>
    <path d="M60 210c-18-24-28-40-28-56a28 28 0 1 1 56 0c0 16-10 32-28 56z" fill="url(#ftg-c)"/>
    <circle style="fill: var(--kf-bg)" cx="60" cy="154" r="10"/>
  </symbol>

  <symbol id="ic-clipboard" viewBox="0 0 172 129"><rect style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" x="54" y="14" width="64" height="86" rx="6" fill="url(#ftg-w)" stroke-width="2"/><rect x="70" y="8" width="32" height="12" rx="4" fill="url(#ftg-a)"/><path style="stroke: color-mix(in oklab, var(--kf-accent) 31.3%, var(--kf-bg))" d="M66 40h40M66 52h40M66 64h26" stroke-width="4"/><path d="M98 70l22 8v18c0 12-10 20-22 26-12-6-22-14-22-26V78z" fill="url(#ftg-g)"/><path style="stroke: var(--kf-on-accent)" d="M89 94l7 7 12-14" stroke-width="4" fill="none"/></symbol>
  <symbol id="ic-pills" viewBox="0 0 172 129"><rect style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" x="52" y="40" width="96" height="58" rx="10" fill="url(#ftg-b)" stroke-width="2" transform="rotate(-24 100 69)"/><g fill="url(#ftg-a)" transform="rotate(-24 100 69)"><circle cx="70" cy="58" r="6"/><circle cx="88" cy="58" r="6"/><circle cx="106" cy="58" r="6"/><circle cx="124" cy="58" r="6"/><circle cx="70" cy="80" r="6"/><circle cx="88" cy="80" r="6"/><circle cx="106" cy="80" r="6"/><circle cx="124" cy="80" r="6"/></g><rect style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" x="34" y="14" width="40" height="18" rx="9" fill="url(#ftg-w)" stroke-width="2" transform="rotate(24 54 23)"/><path d="M54 14v18" stroke="url(#ftg-g)" stroke-width="0" /><rect x="34" y="14" width="20" height="18" rx="9" fill="url(#ftg-g)" transform="rotate(24 54 23)"/></symbol>
  <symbol id="ic-box" viewBox="0 0 172 129"><path d="M50 58l46-18 46 18v40l-46 20-46-20z" fill="url(#ftg-a)"/><path d="M50 58l46-18 46 18-46 18z" fill="url(#ftg-w)"/><path style="stroke: var(--kf-on-accent)" d="M96 76v42" stroke-width="2"/><path style="stroke: color-mix(in oklab, var(--kf-accent) 23.8%, var(--kf-bg))" d="M74 49l46 18" stroke-width="8"/><use href="#ill-plane" x="96" y="0" width="76" height="30"/></symbol>
  <symbol id="ic-bubble" viewBox="0 0 172 129"><path d="M60 36h60a10 10 0 0 1 10 10v36a10 10 0 0 1-10 10H88l-18 16v-16H60a10 10 0 0 1-10-10V46a10 10 0 0 1 10-10z" fill="url(#ftg-g)"/><path style="stroke: var(--kf-on-accent)" d="M90 48v20" stroke-width="7" stroke-linecap="round"/><circle style="fill: var(--kf-bg)" cx="90" cy="80" r="4"/><path style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" d="M118 6h30a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6h-12l-8 8v-8h-10a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6z" fill="url(#ftg-w)" stroke-width="2"/><text style="fill: color-mix(in oklab, var(--kf-ink) 61.8%, var(--kf-bg)); font-family: var(--kf-font-display)" x="133" y="30" font-size="20" font-weight="700" text-anchor="middle">?</text></symbol>

  <symbol id="ct-hair" viewBox="0 0 100 100"><path d="M24 92c0-30 6-56 30-60 22-3 34 16 30 40-2 10 2 18 6 20H24z" fill="url(#ftg-a)"/><circle cx="50" cy="38" r="16" fill="url(#ftg-b)"/><path d="M80 14l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="url(#ftg-c)"/></symbol>
  <symbol id="ct-skin" viewBox="0 0 100 100"><rect style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" x="52" y="30" width="22" height="58" rx="6" fill="url(#ftg-b)" stroke-width="2"/><rect x="57" y="12" width="12" height="20" rx="4" fill="url(#ftg-a)"/><ellipse cx="34" cy="78" rx="24" ry="12" fill="url(#ftg-a)"/><ellipse cx="34" cy="72" rx="24" ry="8" fill="url(#ftg-w)"/></symbol>
  <symbol id="ct-sex" viewBox="0 0 100 100"><g fill="none" stroke="url(#ftg-a)" stroke-width="9"><circle cx="38" cy="58" r="18"/><path d="M38 76v18M28 86h20"/><circle cx="62" cy="42" r="16" stroke="url(#ftg-c)"/><path d="M74 30l14-14M76 16h12v12" stroke="url(#ftg-c)"/></g></symbol>
  <symbol id="ct-diet" viewBox="0 0 100 100"><rect x="18" y="20" width="64" height="64" rx="10" fill="url(#ftg-a)" transform="rotate(-10 50 52)"/><rect x="28" y="30" width="44" height="22" rx="4" fill="url(#ftg-w)" transform="rotate(-10 50 41)"/><path style="stroke: oklch(from var(--kf-accent) calc(l * 0.953) calc(c * 0.79) calc(h + 4.78))" d="M50 44l8-8" stroke-width="3" transform="rotate(-10 50 41)"/></symbol>
  <symbol id="ct-sleep" viewBox="0 0 100 100"><path d="M60 86a36 36 0 1 1 0-70 30 30 0 1 0 0 70z" fill="url(#ftg-a)" transform="translate(-12 0)"/><text style="fill: color-mix(in oklab, var(--kf-accent) 51.3%, var(--kf-bg)); font-family: var(--kf-font-display)" x="58" y="34" font-size="22" font-weight="700">z</text><text style="fill: color-mix(in oklab, var(--kf-accent) 32.8%, var(--kf-bg)); font-family: var(--kf-font-display)" x="74" y="22" font-size="16" font-weight="700">z</text></symbol>
  <symbol id="ct-hormone" viewBox="0 0 100 100"><path d="M22 90c-2-28 6-50 22-58 10-6 22-2 26 8 18-4 26 10 20 22-4 10-18 12-28 6-6 10-10 18-10 22z" fill="url(#ftg-a)"/><circle cx="40" cy="22" r="12" fill="url(#ftg-b)"/></symbol>
  <symbol id="ct-pill" viewBox="0 0 100 100"><rect style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" x="14" y="30" width="72" height="42" rx="6" fill="url(#ftg-w)" stroke-width="2" transform="rotate(-14 50 51)"/><g fill="url(#ftg-a)" transform="rotate(-14 50 51)"><circle cx="28" cy="42" r="5"/><circle cx="42" cy="42" r="5"/><circle cx="56" cy="42" r="5"/><circle cx="70" cy="42" r="5"/><circle cx="28" cy="60" r="5"/><circle cx="42" cy="60" r="5"/><circle cx="56" cy="60" r="5"/><circle cx="70" cy="60" r="5"/></g></symbol>
  <symbol id="ct-virus" viewBox="0 0 100 100"><g stroke="url(#ftg-a)" stroke-width="5" stroke-linecap="round"><path d="M44 10v12M44 70v12M10 46h12M66 46h12M20 22l8 8M60 62l8 8M20 70l8-8M60 30l8-8"/></g><circle cx="44" cy="46" r="22" fill="url(#ftg-a)"/><circle style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" cx="78" cy="78" r="12" fill="url(#ftg-b)" stroke-width="2"/></symbol>
  <symbol id="ct-syringe" viewBox="0 0 100 100"><g transform="rotate(40 50 50)"><rect style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" x="40" y="18" width="20" height="50" rx="4" fill="url(#ftg-w)" stroke-width="2"/><rect x="40" y="44" width="20" height="24" rx="3" fill="url(#ftg-a)"/><path style="stroke: color-mix(in oklab, var(--kf-accent) 51.3%, var(--kf-bg))" d="M50 68v22M38 16h24M50 16V4" stroke-width="4"/></g></symbol>
  <symbol id="ct-pet" viewBox="0 0 100 100"><path d="M30 92c-4-26 4-44 20-48 16-4 28 8 28 28 0 10-4 18-8 20z" fill="url(#ftg-a)"/><circle cx="58" cy="34" r="15" fill="url(#ftg-a)"/><path d="M46 26l2-16 10 10zM70 26l-2-16-10 10z" fill="url(#ftg-a)"/><path d="M30 90c-12 0-18-10-12-18" stroke="url(#ftg-a)" stroke-width="6" fill="none" stroke-linecap="round"/><g fill="url(#ftg-c)"><circle cx="14" cy="40" r="4"/><circle cx="22" cy="32" r="3"/></g></symbol>
  <symbol id="ct-tree" viewBox="0 0 100 100"><path d="M50 8l20 26H58l18 22H62l20 24H18l20-24H24l18-22H30z" fill="url(#ftg-a)"/><rect x="45" y="80" width="10" height="14" fill="url(#ftg-c)"/><g style="fill: color-mix(in oklab, var(--kf-accent) 32.8%, var(--kf-bg))"><circle cx="18" cy="28" r="3"/><circle cx="82" cy="18" r="3"/><circle cx="86" cy="40" r="2"/></g></symbol>
  <symbol id="ct-ribbon" viewBox="0 0 100 100"><path d="M50 14c-12 0-18 10-16 22 2 14 10 24 16 32-10 12-20 24-24 28l10 4c6-8 10-16 14-22 4 6 8 14 14 22l10-4c-4-4-14-16-24-28 6-8 14-18 16-32 2-12-4-22-16-22z" fill="url(#ftg-a)"/></symbol>

  <symbol id="ic-person" viewBox="0 0 80 80"><circle cx="40" cy="24" r="14" fill="url(#ftg-a)"/><path d="M12 76c2-20 12-32 28-32s26 12 28 32z" fill="url(#ftg-a)"/></symbol>
  <symbol id="ic-shop" viewBox="0 0 80 80"><rect style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" x="10" y="10" width="60" height="44" rx="6" fill="url(#ftg-w)" stroke-width="2"/><rect x="18" y="18" width="44" height="28" fill="url(#ftg-b)"/><path style="stroke: var(--kf-on-accent)" d="M24 26h32M24 34h32" stroke-width="3"/><rect x="30" y="56" width="20" height="10" fill="url(#ftg-a)"/><rect x="18" y="66" width="44" height="6" rx="3" fill="url(#ftg-a)"/></symbol>
  <symbol id="ic-building" viewBox="0 0 80 80"><rect x="12" y="14" width="56" height="62" fill="url(#ftg-a)"/><g style="fill: var(--kf-bg)" opacity=".8"><rect x="18" y="20" width="44" height="4"/><rect x="18" y="30" width="44" height="4"/><rect x="18" y="40" width="44" height="4"/><rect x="18" y="50" width="44" height="4"/><rect x="18" y="60" width="44" height="4"/></g></symbol>
  <symbol id="ic-book" viewBox="0 0 110 100"><path style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" d="M10 26c16-8 30-8 44 2v62c-14-10-28-10-44-2z" fill="url(#ftg-w)" stroke-width="2"/><path style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" d="M100 26c-16-8-30-8-46 2v62c16-10 30-10 46-2z" fill="url(#ftg-b)" stroke-width="2"/><path style="stroke: color-mix(in oklab, var(--kf-accent) 38.4%, var(--kf-bg))" d="M20 40h24M20 52h24M64 40h26M64 52h26M64 64h18" stroke-width="3"/></symbol>
</defs>
</svg>`;
  body.insertAdjacentHTML("afterbegin", SPRITE);

  const LOGO = `<svg viewBox="0 0 143 40" aria-label="Logo slot"><path class="lg-arc" d="M9 13 Q 24 1 44 8"/><text x="0" y="36" style="font-family: var(--kf-font-display)" font-size="29" letter-spacing="-.5"><tspan class="lg-a">Logo</tspan><tspan class="lg-b">Mark</tspan></text></svg>`;

  /* ── Header ── */
  const SUB = [["service.html", "Your service name 1 here"], ["service.html", "Your service name 2 here"], ["service.html", "Your service name 3 here"]];
  const MENU = [
    { href: "index.html", label: "Home", first: true },
    { label: "Service", sub: SUB },
    { href: "product.html", label: "Products Carried" },
    { href: "news.html", label: "News" },
    { href: "about.html", label: "Company About" },
    { href: "#", label: "Dealers only", blank: true },
  ];
  const menuHTML = MENU.map((m) => {
    if (m.sub) return `<li><span class="ft-menu__item">${m.label}</span><ul class="ft-sub">${m.sub.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul></li>`;
    return `<li${m.first ? ' class="is-first"' : ""}><a class="ft-menu__item" href="${m.href}"${m.blank ? " data-blank" : ""}>${m.label}</a></li>`;
  }).join("");
  const drawerHTML = MENU.map((m) => {
    if (m.sub) return `<li class="has-sub"><span class="ft-drawer__item">${m.label}</span><ul class="ft-drawer__sub">${m.sub.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join("")}</ul></li>`;
    return `<li><a class="ft-drawer__item" href="${m.href}"${m.blank ? ' data-blank' : ""}>${m.label}${m.blank ? '<span class="ft-blank" style="position:relative;width:14px;height:14px;display:inline-block"></span>' : ""}</a></li>`;
  }).join("");
  const LANG = `<ul class="ft-lang"><li><span class="is-on">KO</span></li><li><a href="#">EN</a></li></ul>`;

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.classList.add("ft-header");
    if (body.dataset.head === "light") header.classList.add("ft-header--light");
    header.innerHTML = `
      <div class="ft-header__logo"><a class="ft-logo" href="index.html">${LOGO}</a></div>
      <div class="ft-header__inner">
        <nav class="ft-nav"><ul class="ft-menu">${menuHTML}</ul>${LANG}</nav>
        <div class="ft-header__contact"><a class="ft-dotlink ft-grad-text" href="#contact">Contact Us</a></div>
      </div>
      <div class="ft-bar" data-slot="sp-bar">
        <button class="ft-bar__trigger" type="button" aria-label="Menu"><span class="ft-bar__icon"></span><span class="ft-bar__text ft-grad-text"><span>MENU<br>CLOSE</span></span></button>
        <a class="ft-bar__contact" href="#contact"><span class="ft-grad-text">Contact Us</span><i class="ft-arrow"></i></a>
      </div>
      <div class="ft-drawer" data-slot="sp-menu"><div class="ft-drawer__nav"><ul class="ft-drawer__list">${drawerHTML}</ul>${LANG}</div></div>`;

    const trigger = header.querySelector(".ft-bar__trigger");
    const drawer = header.querySelector(".ft-drawer");
    const setOpen = (open) => {
      trigger.classList.toggle("is-open", open);
      drawer.classList.toggle("is-open", open);
      document.documentElement.style.overflow = open ? "hidden" : "";
    };
    trigger.addEventListener("click", () => setOpen(!trigger.classList.contains("is-open")));
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });

    // Fixed past 100px, hidden when the top edge of a hide zone (data-hide-header) has passed above the screen and its bottom edge is still on screen — same as the original
    const hiders = [...document.querySelectorAll("[data-hide-header]")];
    const onScroll = () => {
      header.classList.toggle("is-fixed", scrollY > 100);
      const hidden = hiders.some((el) => { const r = el.getBoundingClientRect(); return r.top <= 0 && r.bottom > 0; });
      header.classList.toggle("is-hidden", hidden);
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── Subpage header curve ── */
  document.querySelectorAll(".ft-ph__bg").forEach((bg) => {
    const pastel = bg.closest(".ft-ph--pastel");
    const h = pastel ? 1730 : 1532;
    const curve = "C120 230 330 153 518 153 C720 150 1050 290 1440 551";
    const d = pastel ? `M0 0H1440V551C1050 290 720 150 518 153C330 153 120 230 0 365Z` : `M0 365${curve}V${h}H0Z`;
    if (pastel) bg.insertAdjacentHTML("beforeend", pastelLayer(true));
    bg.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 1440 ${h}" preserveAspectRatio="none" aria-hidden="true"><path style="fill: var(--kf-bg)" d="${d}"/></svg>`);
  });

  function pastelLayer(on, video) {
    return `<div class="ft-pastel${on ? " is-on" : ""}" aria-hidden="true">${video ? '<video class="ft-pastel__video" src="media/about-bg.mp4" autoplay muted loop playsinline preload="auto"></video>' : ""}
      <div class="ft-pastel__slider swiper"><div class="swiper-wrapper"><i class="swiper-slide is-a"></i><i class="swiper-slide is-b"></i><i class="swiper-slide is-c"></i></div></div></div>`;
  }
  // Original .about-slider: Swiper fade · speed 3000 · loop · autoplay 3000 (the timer starts after a transition ends and keeps running even after interaction)
  // Video (original .about-video, first page only): autoplay·loop·muted, height = Window height · width = Height × 1.77 (original aboutVideo — on phones, played once at first)
  const cyclePastel = (root) => {
    const el = root.querySelector(".ft-pastel__slider");
    if (el && window.Swiper) new Swiper(el, { effect: "fade", speed: 3000, loop: true, a11y: false, autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false } });
    const v = root.querySelector(".ft-pastel__video");
    if (!v) return;
    const fit = () => { v.style.height = `${innerHeight.toFixed()}px`; v.style.width = `${(innerHeight * 1.77).toFixed()}px`; };
    fit();
    addEventListener("resize", () => { if (!isSP()) fit(); });
    if (reduce) { v.removeAttribute("autoplay"); v.pause(); }
  };
  // Text that reads Swiper buttons and slides aloud
  const a11y = { prevSlideMessage: "Previous", nextSlideMessage: "Next", firstSlideMessage: "First", lastSlideMessage: "Footer", slideLabelMessage: "{{index}} / {{slidesLength}}" };
  window.FT = { pastelLayer, cyclePastel, isSP, reduce, a11y };
  document.querySelectorAll(".ft-pastel").forEach(cyclePastel);

  /* ── Contact box + footer ── */
  const foot = document.querySelector("[data-slot=footer]");
  if (foot) {
    const wide = foot.dataset.wide !== undefined;
    foot.classList.add("ft-foot");
    foot.innerHTML = `
      <div class="ft-contact${wide ? " ft-contact--wide" : ""}" id="contact" data-slot="contact" data-io-once>
        <a class="ft-contact__hit ft-pc" href="#contact" aria-label="Contact Us"><div class="ft-stalker"><b><span>CONTACT</span></b></div></a>
        <div class="ft-contact__bg"><div class="wf-img" data-label="Hand of a doctor in a white coat · capsule blister pack on the palm · stethoscope · bright interior in blue tones · wide landscape"></div></div>
        <div class="ft-contact__cont ft-row--in">
          <h2 class="ft-contact__ttl ft-fade" data-delay=".3">CONTACT US</h2>
          <div class="ft-contact__text ft-fade" data-delay=".3"><p>One opening line here inviting inquiries.<br class="ft-pc-br">Your one more line here on what can be consulted.<br>Please contact us via the form first for the items below as well.</p></div>
          <div class="ft-contact__noted ft-fade" data-delay=".3"><span>Your contact item 1 here</span><span>Your slightly longer inquiry item 2 here</span><span>Your contact item 3 here</span><span>Your contact item 4 here</span><span>Your slightly long inquiry item 5 here / Agent service</span></div>
          <div class="ft-sp ft-fade" data-delay=".3"><a class="ft-btn ft-btn--white" href="#contact"><div class="ft-btn__in"><span>CONTACT</span></div></a></div>
        </div>
      </div>
      <footer class="ft-footer">
        <div class="ft-footer__inner">
          <div class="ft-footer__left">
            <a class="ft-logo ft-logo--white" href="index.html">${LOGO}</a>
            <ul class="ft-footer__menu"><li><a href="#">Frequently asked questions</a></li><li><a href="#">Terms of Transaction</a></li><li><a href="#">Security Rules</a></li></ul>
            <ul class="ft-footer__social"><li><a href="#">Blog</a></li><li><a href="#">X</a></li></ul>
          </div>
          <p class="ft-footer__copy">Copyright (c) Company Name. All Rights Reserved.</p>
        </div>
      </footer>`;

    // The round button follows the mouse: it approaches by 0.2 on every rAF, and a transition .8s delays it once more on top (same as the original)
    const hit = foot.querySelector(".ft-contact__hit");
    const st = foot.querySelector(".ft-stalker");
    const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (touch) st.style.display = "none";
    else {
      let mx = 0, my = 0, x = 0, y = 0;
      addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
      hit.addEventListener("mouseenter", () => hit.classList.add("is-show"));
      hit.addEventListener("mouseleave", () => hit.classList.remove("is-show"));
      const tick = () => {
        const r = hit.getBoundingClientRect();
        x += 0.2 * (mx - r.left - x);
        y += 0.2 * (my - r.top - y);
        st.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(tick);
      };
      tick();
    }
  }

  /* ── Reveal: normal ones appear once when entering the band minus 20% at top and bottom, after data-delay seconds ── */
  const show = (el) => {
    const d = Number(el.dataset.delay || 0) * 1000;
    d ? setTimeout(() => el.classList.add("is-in"), d) : el.classList.add("is-in");
  };
  const targets = document.querySelectorAll(".ft-clip, .ft-fade, [data-io]");
  if (reduce) targets.forEach((el) => el.classList.add("is-in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: "-20% 0% -20% 0%" });
    targets.forEach((el) => io.observe(el));
  }
  // Like the contact box, data-io-once fires as soon as it’s even slightly visible
  const io0 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io0.unobserve(e.target); } }));
  document.querySelectorAll("[data-io-once]").forEach((el) => (reduce ? el.classList.add("is-in") : io0.observe(el)));

  /* ── Parallax (original js-pallax_elm): from when the center passes the start point until the bottom edge reaches the top of the screen, moves by y with scrub 1 ── */
  const initPara = () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-para]").forEach((el) => {
        const y = isSP() && el.dataset.ysp ? Number(el.dataset.ysp) : Number(el.dataset.para);
        const top = el.getBoundingClientRect().top + scrollY;
        const start = top < innerHeight ? `center ${top}px` : "center bottom+=100";
        gsap.to(el, { y, ease: "none", scrollTrigger: { trigger: el, start, end: "bottom top", scrub: 1 } });
      });
    });
  };
  window.FT.initPara = initPara;

  /* ── Accordion: .4s power1.out when opening, .4s power1.in when closing ── */
  document.querySelectorAll("[data-acc]").forEach((acc) => {
    const btn = acc.querySelector("[data-acc-trigger]");
    const box = acc.querySelector("[data-acc-target]");
    const inner = box.firstElementChild;
    btn.addEventListener("click", () => {
      const open = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", open);
      gsap.killTweensOf(box);
      gsap.to(box, { height: open ? inner.offsetHeight : 0, duration: reduce ? 0 : .4, ease: open ? "power1.out" : "power1.in" });
    });
  });
})();
