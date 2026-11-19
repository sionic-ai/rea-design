// Shared by all pages: the header, character menu drawer, cursor, loading, page transition (swup 4.8.3) and smooth scroll (lenis 1.3.21) are set up only once, and
// Inside the transition container (#swup) — illustrations · zigzag · footer · reveals · numbers · side index · video · page scenes — are attached per page with gsap.context and detached on transition.
// Original figures: cursor follow lerp .5 · hover hand 1.5x→1 .6s elastic.out(0.5,0.4) · number inview 30% · entrance 1.2s cubic-bezier(.19,1,.22,1).
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("fnOut", "M0,0 C0.19,1 0.22,1 1,1");
  CustomEase.create("fnSoft", "M0,0 C0.3,0.26 0.38,1 1,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = !matchMedia("(pointer: coarse)").matches;
  // Original cursor reaction is attached only when ig.isPC — here, when there is a mouse and reduced motion is off
  const FN = (window.FN = { reduced, cursorOK: fine && !reduced, page: null, lenis: null, scenes: [], pages: {} });
  FN.scene = (fn) => FN.scenes.push(fn);
  // Page js is loaded on every page and registers only under its own name — after the transition, run the one for the new page name
  FN.onPage = (name, fn) => (FN.pages[name] = fn);

  const O = 'stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
  const SKIN = "var(--site-skin)";
  const arrow = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 5h6M5.5 2.5 8 5 5.5 7.5"/></svg>';
  const play = '<svg viewBox="0 0 10 12"><path d="M0 0 10 6 0 12z" fill="currentColor"/></svg>';
  FN.icons = { arrow, play };

  // Illustration redrawn with the same position · size · feel (black outline + flat color) without using the original art
  const art = {
    wordmark: `<svg viewBox="0 0 113 26" aria-hidden="true"><text class="fn-logo__w" x="2" y="20" font-style="italic" font-weight="500" font-size="21" letter-spacing="1.2" fill="currentColor" style="font-family:var(--kf-font-display)">logotype</text></svg>`,
    head: (on) => `<svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="11" style="fill:${SKIN}" ${O} stroke-width="1.4"/><path d="M8 22c-2-9 5-16 12-16s15 6 12 16c-2-4-5-6-8-6-1 3-4 4-7 4-3 0-6-1-9 2z" ${O} stroke-width="1.4" style="fill:var(--site-leaf)"/><path d="M12 11c3-4 7-5 9-3M26 9c2 0 5 2 6 5" fill="none" ${O} stroke-width="1.2"/>${on ? '<circle cx="16" cy="25" r="1.4"/><path d="M22 24.5c1-1.2 3-1.2 4 0" fill="none" stroke-width="1.3" style="stroke:var(--kf-ink)"/><path d="M17 30c2 2 5 2 7 0" stroke-width="1.2" style="fill:var(--site-red);stroke:var(--kf-ink)"/><path d="M33 30c3-2 5-6 4-9" fill="none" stroke-width="1.4" style="stroke:var(--kf-ink)"/><circle cx="37" cy="20" r="2.4" fill="' + SKIN + '" stroke-width="1.2" style="stroke:var(--kf-ink)"/>' : '<circle cx="16" cy="25" r="1.4"/><circle cx="24" cy="25" r="1.4"/><path d="M18 30c1.3 1 2.7 1 4 0" fill="none" stroke-width="1.3" style="stroke:var(--kf-ink)"/>'}</svg>`,
    woman: `<svg viewBox="0 0 180 380"><path d="M70 300l-4 58h14l4-58zM104 300l2 58h14l-2-58z" ${O} style="fill:var(--site-brown)"/><path d="M60 352h24v14H56zM102 352h24l4 14h-28z" ${O} style="fill:var(--site-rust)"/><path d="M58 180c-4 50-10 90-18 128h108c-6-40-12-80-16-128z" ${O} style="fill:var(--site-orange-soft)"/><path d="M54 120c-10 40-14 100-22 168l30 6 8-110h44l10 112 30-8c-8-68-12-128-24-168-18-10-58-10-76 0z" ${O} style="fill:var(--site-paper)"/><path d="M76 116l16 40 16-40" ${O} style="fill:var(--site-yellow-warm)"/><circle cx="92" cy="78" r="30" style="fill:${SKIN}" ${O}/><path d="M56 82c-6-34 14-56 38-56s42 20 36 54c-8-14-20-22-34-24-4 10-14 16-28 16-4 0-8 4-12 10z" ${O} style="fill:var(--site-red)"/><path d="M60 92c-6 18-2 32 6 40M124 90c6 18 4 32-4 40" fill="none" stroke-width="8" stroke-linecap="round" style="stroke:var(--site-red)"/><circle cx="84" cy="84" r="2.6"/><circle cx="102" cy="84" r="2.6"/><path d="M88 98c3 2 7 2 10 0" fill="none" ${O}/><path d="M112 168l50-14 8 40-48 12z" ${O} style="fill:var(--site-steel)"/><path d="M60 140c-8 30 4 56 52 46" fill="none" ${O} stroke-width="14" style="stroke:var(--site-paper)"/><path d="M60 140c-8 30 4 56 52 46" fill="none" ${O}/><circle cx="114" cy="186" r="7" style="fill:${SKIN}" ${O}/></svg>`,
    fly: `<svg viewBox="0 0 320 180"><path d="M120 92c-50-20-90-6-116 10 30 2 56 14 70 30 10-18 26-30 46-40z" ${O} style="fill:var(--site-red)"/><path d="M118 80l110-8c14 0 20 8 20 18s-8 18-20 18l-110 4z" ${O} style="fill:var(--site-leaf)"/><path d="M228 74l40-14c8-2 12 4 10 10l-6 6-36 14zM120 112l-40 22c-6 4-4 12 2 12l46-18z" ${O} style="fill:var(--site-leaf)"/><path d="M118 82l-42-18c-6-2-10 4-6 8l40 26zM230 104l34 22c6 4 2 12-4 10l-34-16z" style="fill:${SKIN}" ${O}/><circle cx="276" cy="68" r="7" style="fill:${SKIN}" ${O}/><circle cx="66" cy="68" r="7" style="fill:${SKIN}" ${O}/><circle cx="96" cy="86" r="30" style="fill:${SKIN}" ${O}/><path d="M64 86c-8-30 10-50 34-50 18 0 32 12 32 28-12-10-24-8-30 2-10-6-24 2-36 20z" ${O} style="fill:var(--site-leaf-pale2)"/><path d="M74 46c6-10 20-14 30-8M110 44c8 0 16 6 18 14" fill="none" ${O}/><circle cx="90" cy="90" r="5" ${O} stroke-width="1.5" style="fill:var(--site-paper)"/><circle cx="91" cy="90" r="2.4"/><circle cx="106" cy="88" r="5" ${O} stroke-width="1.5" style="fill:var(--site-paper)"/><circle cx="107" cy="88" r="2.4"/></svg>`,
    blob: `<svg viewBox="0 0 160 130"><path d="M20 26c0-10 8-18 18-18h86c10 0 18 8 18 18v34l14 10-14 8v26c0 10-8 18-18 18H38c-10 0-18-8-18-18z" ${O} stroke-width="0" style="fill:var(--kf-accent)"/><g class="fn-eyes"><circle cx="72" cy="62" r="17" stroke-width="3" style="fill:var(--site-paper);stroke:var(--kf-ink)"/><circle cx="112" cy="62" r="17" stroke-width="3" style="fill:var(--site-paper);stroke:var(--kf-ink)"/><circle class="fn-pupil" cx="76" cy="64" r="9"/><circle class="fn-pupil" cx="116" cy="64" r="9"/></g></svg>`,
    truck: `<svg viewBox="0 0 300 140"><rect x="8" y="20" width="190" height="86" rx="4" ${O} style="fill:var(--site-paper)"/><path d="M24 50h150" stroke-width="16" style="stroke:var(--site-gray-9)"/><text x="40" y="78" font-weight="800" font-size="24" letter-spacing="3" style="fill:var(--site-leaf-deep);font-family:var(--kf-font-display)">LOGO</text><path d="M198 40h48l34 30v36H198z" ${O} style="fill:var(--kf-accent)"/><path d="M214 50h28l22 20h-50z" ${O} style="fill:var(--site-ice)"/><rect x="8" y="98" width="272" height="14" ${O} style="fill:var(--site-gray-85)"/><circle cx="56" cy="114" r="16" ${O} style="fill:var(--site-gray-80)"/><circle cx="56" cy="114" r="6" style="fill:var(--site-gray-13)"/><circle cx="236" cy="114" r="16" ${O} style="fill:var(--site-gray-80)"/><circle cx="236" cy="114" r="6" style="fill:var(--site-gray-13)"/><g ${O} stroke-width="1.6" style="fill:var(--site-leaf-soft)"><circle cx="40" cy="20" r="12"/><circle cx="64" cy="16" r="12"/><circle cx="88" cy="20" r="12"/><circle cx="112" cy="16" r="12"/><circle cx="136" cy="20" r="12"/><circle cx="160" cy="16" r="12"/></g></svg>`,
    farmers: `<svg viewBox="0 0 260 200"><rect x="150" y="150" width="50" height="36" ${O} style="fill:var(--site-yellow-warm)"/><rect x="204" y="150" width="50" height="36" ${O} style="fill:var(--site-yellow-warm)"/><g ${O} stroke-width="1.6" style="fill:var(--site-leaf-soft)"><circle cx="164" cy="146" r="10"/><circle cx="184" cy="144" r="10"/><circle cx="218" cy="146" r="10"/><circle cx="238" cy="144" r="10"/></g><path d="M86 196l4-60h44l4 60z" ${O} style="fill:var(--site-leaf-deep)"/><path d="M70 150c-4-50 10-80 40-84 34-2 48 30 40 84z" ${O} style="fill:var(--kf-accent)"/><circle cx="110" cy="50" r="22" style="fill:${SKIN}" ${O}/><path d="M80 40c10-20 50-22 62 0z" ${O} style="fill:var(--site-yellow-warm)"/><path d="M74 42h72" ${O}/><path d="M70 110c-20 10-30 20-32 30" fill="none" ${O} stroke-width="10" style="stroke:var(--kf-accent)"/><circle cx="38" cy="142" r="7" style="fill:${SKIN}" ${O}/><path d="M14 196l2-40h40l2 40z" ${O} style="fill:var(--site-pink)"/><circle cx="36" cy="128" r="16" style="fill:${SKIN}" ${O}/><path d="M20 124c0-14 30-16 32 0-6-4-24-6-32 0z" ${O} style="fill:var(--site-amber-soft)"/></svg>`,
    researchers: `<svg viewBox="0 0 260 200"><rect x="40" y="150" width="200" height="12" ${O} style="fill:var(--site-paper)"/><path d="M60 162v30M220 162v30" ${O}/><g ${O} stroke-width="1.6" style="fill:var(--site-leaf-soft)"><circle cx="130" cy="140" r="12"/><circle cx="150" cy="136" r="10"/></g><path d="M174 150l4-20h18l4 20z" ${O} style="fill:var(--site-orange)"/><path d="M40 150c-6-40-2-70 24-76 26 4 32 36 26 76z" ${O} style="fill:var(--site-paper)"/><circle cx="64" cy="52" r="20" style="fill:${SKIN}" ${O}/><path d="M44 50c-4-22 10-34 24-32 14 2 22 16 16 32-6-8-14-10-22-10-6 4-12 6-18 10z" ${O} style="fill:var(--site-red)"/><path d="M150 150c-6-40-2-66 26-72 26 4 30 34 24 72z" ${O} style="fill:var(--site-paper)"/><circle cx="176" cy="58" r="19" style="fill:${SKIN}" ${O}/><path d="M158 52c2-18 30-22 38-4-8-2-16 0-22 6-6-2-12-2-16-2z" ${O} style="fill:var(--site-yellow-warm)"/><path d="M90 104c14 6 28 10 40 4M150 100c-10 8-16 16-18 24" fill="none" ${O}/></svg>`,
    crowd: `<svg viewBox="0 0 360 220"><path d="M200 30l100-20 6 56-100 18z" ${O} style="fill:var(--site-yellow)"/><path d="M204 80l-10 120" ${O} stroke-width="3"/><g ${O} stroke-width="1.8" style="fill:var(--site-paper)">${[30, 80, 130, 250, 300].map((x, i) => `<circle cx="${x}" cy="${110 + (i % 2) * 8}" r="16"/><path d="M${x - 22} 220c0-50 6-80 22-82 16 2 22 32 22 82z"/>`).join("")}</g><g style="fill:var(--site-gray-20)"><circle cx="30" cy="104" r="4"/><circle cx="130" cy="104" r="4"/></g><circle cx="190" cy="100" r="22" style="fill:${SKIN}" ${O}/><path d="M166 96c-6-30 20-44 40-34 14 8 16 24 8 34-10-8-22-10-30-2-6-2-12-2-18 2z" ${O} style="fill:var(--site-leaf-pale2)"/><path d="M164 220c0-60 8-90 28-94 22 2 30 36 30 94z" ${O} style="fill:var(--kf-accent)"/></svg>`,
    workers: `<svg viewBox="0 0 240 160">${[40, 120, 200].map((x, i) => `<circle cx="${x}" cy="${30 + (i === 1 ? 4 : 0)}" r="16" ${O} style="fill:var(--site-paper)"/><path d="M${x - 16} 22c4-14 28-14 32 0z" ${O} style="fill:var(--site-orange)"/><path d="M${x - 24} 158l4-72c2-24 12-34 20-34s18 10 20 34l4 72z" ${O} style="fill:var(--site-paper)"/><path d="M${x - 14} 70h28l4 60h-36z" ${O} style="fill:var(--site-orange)"/>`).join("")}</svg>`,
    factories: `<svg viewBox="0 0 120 30" style="fill:var(--site-orange)">${[0, 40, 80].map((x) => `<path d="M${x + 2} 28V14l8-6v6l8-6v6l8-6v20zM${x + 28} 28V4h6v24z"/>`).join("")}</svg>`,
    map: `<svg viewBox="0 0 200 80" style="fill:var(--site-orange)"><path d="M6 66c10-6 16-14 28-12 8 2 14-6 22-8 10-2 16-10 26-10 8 0 12-8 20-8 10 0 14-8 24-10 8-2 10-10 18-12-2 8-8 14-16 18-6 4-8 10-16 12-10 2-14 10-24 12-10 2-14 8-24 10-10 2-16 8-26 10-12 2-20 8-32 4z"/><path d="M166 4c6-2 14 0 18 4-4 4-12 6-18 4z"/><path d="M20 72c6 0 10 4 8 6-6 0-10-2-8-6z"/></svg>`,
    package: `<svg viewBox="0 0 260 220"><path d="M140 30h96l-8 160h-80z" ${O} style="fill:var(--site-paper)"/><path d="M152 30v-14h72v14" fill="none" ${O}/><text x="156" y="110" font-weight="800" font-size="13" style="fill:var(--site-leaf-deep);font-family:var(--kf-font-display)">LABEL</text><rect x="150" y="122" width="76" height="40" ${O} stroke-width="1.4" style="fill:var(--site-mint)"/><path d="M20 110h110l-10 90H30z" ${O} style="fill:var(--site-ice-pale)"/><path d="M14 100h122v14H14z" ${O} style="fill:var(--site-paper)"/><g ${O} stroke-width="1.5" style="fill:var(--site-leaf-soft)"><circle cx="50" cy="150" r="14"/><circle cx="80" cy="160" r="14"/><circle cx="104" cy="146" r="12"/></g><circle cx="66" cy="136" r="8" ${O} stroke-width="1.5" style="fill:var(--site-yellow)"/></svg>`,
    hole: `<svg viewBox="0 0 220 60"><ellipse cx="110" cy="30" rx="108" ry="28" style="fill:var(--kf-ink)"/></svg>`,
    cloud: `<svg viewBox="0 0 900 420" fill="none" stroke-width="2" style="stroke:var(--kf-ink)"><path d="M0 240c40-60 120-80 170-40 10-90 120-140 200-80 50-80 190-80 230 10 70-40 170 0 170 90 70 0 120 40 130 100"/><path d="M0 420V240M900 420V320"/></svg>`,
    "ic-research": `<svg viewBox="0 0 40 40" fill="none" ${O} stroke-width="1.6"><circle cx="18" cy="17" r="9" style="fill:var(--site-paper)"/><path d="M25 24l8 8"/><path d="M14 17h8M18 13v8"/></svg>`,
    "ic-plan": `<svg viewBox="0 0 40 40" fill="none" ${O} stroke-width="1.6"><rect x="10" y="8" width="20" height="26" rx="2" style="fill:var(--site-paper)"/><path d="M14 16h12M14 21h12M14 26h7"/><path d="M16 8V5h8v3"/></svg>`,
    "ic-dev": `<svg viewBox="0 0 40 40" fill="none" ${O} stroke-width="1.6"><path d="M20 6a10 10 0 0 0-6 18v5h12v-5a10 10 0 0 0-6-18z" style="fill:var(--site-paper)"/><path d="M16 33h8M17 18l3 3 3-3"/></svg>`,
    "ic-check": `<svg viewBox="0 0 40 40" fill="none" ${O} stroke-width="1.6"><circle cx="20" cy="20" r="12" style="fill:var(--site-paper)"/><path d="M14 20l4 4 8-9"/></svg>`,
    benefit: (k) => {
      const g = {
        home: '<path d="M8 22 24 9l16 13v18H8z"/><path d="M20 40V28h8v12"/>',
        heart: '<path d="M24 38S8 28 8 18a7 7 0 0 1 16-3 7 7 0 0 1 16 3c0 10-16 20-16 20z"/>',
        pin: '<path d="M24 42s-12-12-12-22a12 12 0 0 1 24 0c0 10-12 22-12 22z"/><circle cx="24" cy="20" r="4"/>',
        cal: '<rect x="8" y="12" width="32" height="28" rx="3"/><path d="M8 20h32M16 8v8M32 8v8"/>',
        people: '<circle cx="17" cy="16" r="5"/><circle cx="31" cy="16" r="5"/><path d="M8 38c0-8 4-14 9-14s9 6 9 14M22 38c0-8 4-14 9-14s9 6 9 14"/>',
        party: '<path d="M10 40 18 14l16 16z"/><path d="M28 8v6M36 14h6M33 9l4-4"/>',
        book: '<path d="M8 12h14a4 4 0 0 1 4 4v24a4 4 0 0 0-4-4H8zM40 12H30a4 4 0 0 0-4 4"/>',
        chart: '<path d="M8 40h32M12 32v-6M20 32V20M28 32V14M36 32V8"/>',
      }[k];
      return `<svg viewBox="0 0 48 48" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--kf-accent)"><circle cx="24" cy="24" r="23" stroke-width="1.2" stroke-dasharray="3 4"/>${g}</svg>`;
    },
    stat: (k) => {
      const g = {
        up: '<path d="M6 30 16 18l8 8 14-16M28 10h10v10"/>',
        shop: '<path d="M8 34V18h8v16M20 34V10h8v24M32 34V22h6v12"/>',
        group: '<rect x="8" y="12" width="26" height="22"/><path d="M14 18h4M22 18h4M14 26h4M22 26h4"/>',
        people: '<circle cx="15" cy="14" r="5"/><circle cx="27" cy="14" r="5"/><path d="M6 34c0-7 4-12 9-12s9 5 9 12M18 34c0-7 4-12 9-12s9 5 9 12"/>',
      }[k];
      return `<svg viewBox="0 0 44 40" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="stroke:var(--site-orange)">${g}</svg>`;
    },
  };
  FN.art = art;
  const fillArt = (root) => root.querySelectorAll("[data-art]").forEach((el) => {
    const [k, arg] = el.dataset.art.split(":");
    const a = art[k];
    if (!a) return;
    el.classList.add("fn-art");
    el.innerHTML = typeof a === "function" ? a(arg) : a;
  });

  // Original zigzag: per letter, half pick a vertical direction (up·down) and half a horizontal one (left·right), and two layers write together,
  // Delay is random per layer between 0~2 × .1s (on reverse, 2 minus that value) — so regardless of character count they stagger within .2s
  const zig = (text, cls = "") => {
    const chars = [...text];
    const dirs = chars.map(() => (Math.random() < 0.5 ? ["0", Math.random() < 0.5 ? "-1" : "1"] : [Math.random() < 0.5 ? "-1" : "1", "0"]));
    const layer = (n) => `<span class="l l${n}">${chars.map((ch, i) => {
      const [dx, dy] = dirs[i];
      const k = (Math.random() * 2).toFixed(3);
      return `<span class="w"><span class="c" style="--i:${k};--ri:${(2 - k).toFixed(3)};--dx:${dx};--dy:${dy}">${ch === " " ? "&nbsp;" : ch}</span></span>`;
    }).join("")}</span>`;
    return `<span class="fn-zig ${cls}">${layer(1)}${layer(2)}</span>`;
  };
  FN.zig = zig;
  const fillZig = (root) => root.querySelectorAll("[data-zig]").forEach((el) => { el.innerHTML = zig(el.textContent.trim()); });
  const readyZig = (root) => requestAnimationFrame(() => root.querySelectorAll(".fn-zig").forEach((z) => z.classList.add("is-ready")));

  const links = [
    { href: "index.html", label: "Home", page: "home" },
    { href: "about.html", label: "About us", page: "about" },
    { href: "recruit.html", label: "Careers", page: "recruit" },
    { href: "news.html", label: "News", page: "news" },
    { href: "#", label: "Contact", page: "contact" },
  ];
  const cur = (p) => ` data-page-link="${p}"`;

  // ── Once only: header, menu drawer, cursor, modal overlay, smooth scroll
  const headEl = document.querySelector('[data-slot="header"]');
  if (headEl) {
    headEl.classList.add("fn-head");
    headEl.innerHTML = `
      <div class="fn-head__in">
        <a class="fn-logo" href="index.html" aria-label="Home">${art.wordmark}</a>
        <div class="fn-nav">
          <nav class="fn-nav__links" aria-label="Main menu" data-label="Section name in English">
            <a class="fn-nav__link"${cur("about")} href="about.html">${zig("About us")}</a>
            <a class="fn-nav__link"${cur("recruit")} href="recruit.html">${zig("Careers")}</a>
          </nav>
          <div class="fn-menu" data-slot="menu-drawer">
            <div class="fn-menu__panel" id="fn-menu-panel">
              <nav aria-label="Full menu" data-label="Section name in English · company name in English at the bottom">
                <ul>${links.map((l) => `<li><a class="fn-nav__link"${l.page === "home" ? " data-home" : ""}${cur(l.page)} href="${l.href}">${zig(l.label)}</a></li>`).join("")}</ul>
                <div class="fn-menu__bottom"><a class="fn-menu__privacy" href="#">${zig("Privacy Policy")}</a><p>© Studio Name</p></div>
              </nav>
            </div>
            <button class="fn-menu__btn" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="fn-menu-panel">
              <span class="fn-menu__ring"><span class="fn-menu__chr fn-menu__chr--off">${art.head(false)}</span><span class="fn-menu__chr fn-menu__chr--on">${art.head(true)}</span></span>
            </button>
          </div>
        </div>
      </div>`;
    readyZig(headEl);
  }
  document.body.insertAdjacentHTML("beforeend", `
    <div class="fn-cursor" aria-hidden="true"><div class="fn-cursor__in">
      <svg class="fn-cursor__icon fn-cursor__icon--default" viewBox="0 0 42 42"><path d="M6 4l26 14-12 3-5 12z" stroke-width="2" stroke-linejoin="round" style="fill:var(--site-paper);stroke:var(--kf-ink)"/></svg>
      <svg class="fn-cursor__icon fn-cursor__icon--hover" viewBox="0 0 41 50"><path d="M15 26V8a3.5 3.5 0 0 1 7 0v12l2-1a3.5 3.5 0 0 1 5 2l1 1a3.5 3.5 0 0 1 5 3c3 1 4 4 3 7l-2 9c-1 4-5 7-10 7h-6c-4 0-7-2-9-5l-7-10c-1-3 2-6 5-4z" stroke-width="2" stroke-linejoin="round" style="fill:var(--site-paper);stroke:var(--kf-ink)"/></svg>
    </div></div>`);

  // ── Modal: the video button ([data-movie]) and the interview card ([data-modal]) use the same curtain
  const modal = document.createElement("div");
  modal.className = "fn-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = '<div class="fn-modal__box"></div><button class="fn-modal__x" type="button" aria-label="Close"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m1 1 10 10M11 1 1 11"/></svg></button>';
  document.body.append(modal);
  const box = modal.querySelector(".fn-modal__box");
  FN.modal = {
    open(html) { box.innerHTML = html; modal.classList.add("is-open"); FN.lenis?.stop(); },
    close() { if (!modal.classList.contains("is-open")) return; modal.classList.remove("is-open"); FN.lenis?.start(); },
  };
  modal.addEventListener("click", (e) => { if (!e.target.closest(".fn-modal__box") || e.target.closest(".fn-modal__close")) FN.modal.close(); });
  addEventListener("keydown", (e) => e.key === "Escape" && FN.modal.close());

  // ── Menu drawer
  const menu = document.querySelector(".fn-menu");
  // Button character — original script3: on open the off character goes down 100% (1s back.inOut), the on character goes (-100%, 100%) → (-10%, 24%) (.7s power4.inOut after .25s). Closing is the reverse
  const chrOff = menu?.querySelector(".fn-menu__chr--off svg");
  const chrOn = menu?.querySelector(".fn-menu__chr--on svg");
  if (chrOn) gsap.set(chrOn, { xPercent: -100, yPercent: 100 });
  const setMenu = (open) => {
    if (!menu) return;
    const btn = menu.querySelector(".fn-menu__btn");
    if (open !== menu.classList.contains("is-open") && chrOff && chrOn) {
      if (open) {
        gsap.to(chrOff, { yPercent: 100, duration: 1, ease: "back.inOut", overwrite: true });
        gsap.to(chrOn, { xPercent: -10, yPercent: 24, duration: 0.7, delay: 0.25, ease: "power4.inOut", overwrite: true });
      } else {
        gsap.to(chrOff, { yPercent: 0, duration: 0.7, delay: 0.25, ease: "back.inOut", overwrite: true });
        gsap.to(chrOn, { xPercent: -100, yPercent: 100, duration: 0.7, ease: "power4.inOut", overwrite: true });
      }
    }
    menu.classList.toggle("is-open", open);
    // Links in a closed drawer are outside the circle mask and not visible — also excluded from focus and hover targets
    menu.querySelector(".fn-menu__panel").inert = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
  };
  if (menu) {
    menu.querySelector(".fn-menu__panel").inert = true;
    menu.querySelector(".fn-menu__btn").addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
    addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
    document.addEventListener("click", (e) => { if (!menu.contains(e.target)) setMenu(false); });
  }

  // ── Cursor
  const cursor = document.querySelector(".fn-cursor");
  if (cursor && fine) {
    document.body.classList.add("has-cursor");
    const inner = cursor.querySelector(".fn-cursor__in");
    const def = cursor.querySelector(".fn-cursor__icon--default");
    const hov = cursor.querySelector(".fn-cursor__icon--hover");
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, over = false;
    addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!cursor.classList.contains("is-ready")) { x = tx; y = ty; cursor.classList.add("is-ready"); }
      const hit = !!e.target.closest("a, button, [data-hover]");
      if (hit === over) return;
      over = hit;
      if (hit) {
        gsap.to(def, { opacity: 0, duration: 0, overwrite: true });
        gsap.fromTo(hov, { opacity: 1, scale: 1.5, xPercent: 10, yPercent: 10 }, { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, duration: 0.6, ease: "elastic.out(0.5, 0.4)", overwrite: true });
      } else {
        gsap.to(hov, { opacity: 0, duration: 0, overwrite: true });
        gsap.fromTo(def, { opacity: 1, scale: 1, xPercent: 10, yPercent: 10 }, { opacity: 1, scale: 1, xPercent: 0, yPercent: 0, duration: 0.5, ease: "elastic.out(0.5, 0.4)", overwrite: true });
      }
    });
    document.documentElement.addEventListener("pointerleave", () => cursor.classList.remove("is-ready"));
    gsap.ticker.add(() => {
      x += (tx - x) * 0.5; y += (ty - y) * 0.5;
      inner.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }

  // ── Modal close button: original closeBtn — on hover it floats up to z 100px, moves 1× in x · y toward the cursor position inside the button (ratio from center to half width) and tilts 30° on the X · Y axes
  // Follows by .05 every rAF (inner icon at .3x). On leave it returns to place with 2s elastic(1, 0.2)
  const closeBtn = modal.querySelector(".fn-modal__x");
  if (closeBtn && FN.cursorOK) {
    const icon = closeBtn.querySelector("svg");
    const pos = { x: 0, y: 0, z: 0, rx: 0, ry: 0 }, aim = { x: 0, y: 0, z: 0, rx: 0, ry: 0 };
    let on = false, back = null;
    const paint = () => {
      const t = (k) => `perspective(1000px) translate3d(${pos.x * k}px, ${pos.y * k}px, ${pos.z * k}px) rotateX(${-pos.rx * k}deg) rotateY(${-pos.ry * k}deg)`;
      closeBtn.style.transform = t(1);
      icon.style.transform = t(0.3);
    };
    const loop = () => {
      if (!on) return;
      for (const k in pos) pos[k] += (aim[k] - pos[k]) * 0.05;
      paint();
      requestAnimationFrame(loop);
    };
    closeBtn.addEventListener("pointerenter", () => {
      back?.kill();
      aim.z = 100;
      if (!on) { on = true; requestAnimationFrame(loop); }
    });
    closeBtn.addEventListener("pointermove", (e) => {
      const r = closeBtn.getBoundingClientRect(), w = r.width / 2, h = r.height / 2;
      aim.x = e.clientX - r.left - w; aim.y = e.clientY - r.top - h;
      aim.ry = -(aim.x / w) * 30; aim.rx = (aim.y / h) * 30;
    });
    closeBtn.addEventListener("pointerleave", () => {
      on = false;
      for (const k in aim) aim[k] = 0;
      back = gsap.to(pos, { x: 0, y: 0, z: 0, rx: 0, ry: 0, duration: 2, ease: "elastic.out(1, 0.2)", onUpdate: paint });
    });
  }

  // Original mouseParallax: the target is the cursor position measured from screen center (−1~1) × 8px × depth, approached by .06 of the remaining distance every rAF.
  // Listens only while the picture is within 200px around the screen, and returns to 0 when it leaves. The original has different depths per layer (.inner) but our picture is a single sheet
  // Receives the depth that moves most among the original layers. The picture box uses transform for the scene scrub, so it’s applied as translate on the svg inside
  FN.parallax = (el, depth) => {
    const svg = el?.firstElementChild;
    if (!svg || !FN.cursorOK) return;
    const aim = { x: 0, y: 0 }, at = { x: 0, y: 0 };
    let raf = 0, seen = false;
    const loop = () => {
      at.x += (aim.x - at.x) * 0.06; at.y += (aim.y - at.y) * 0.06;
      svg.style.translate = `${at.x * depth}px ${at.y * depth}px`;
      raf = Math.abs(aim.x - at.x) < 0.01 && Math.abs(aim.y - at.y) < 0.01 ? 0 : requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
    const move = (e) => {
      aim.x = ((e.clientX - innerWidth / 2) / (innerWidth / 2)) * 8;
      aim.y = ((e.clientY - innerHeight / 2) / (innerHeight / 2)) * 8;
      kick();
    };
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting === seen) return;
      seen = en.isIntersecting;
      if (seen) return addEventListener("pointermove", move);
      removeEventListener("pointermove", move);
      aim.x = aim.y = 0;
      kick();
    }, { rootMargin: "200px 0px" });
    io.observe(el);
    FN.cleanup(() => { io.disconnect(); removeEventListener("pointermove", move); cancelAnimationFrame(raf); svg.style.translate = ""; });
  };

  // ── Smooth scroll: lenis 1.3.21, same as the original
  if (!reduced && window.Lenis) {
    const lenis = (FN.lenis = new Lenis({ lerp: 0.1 }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target, dur) => (FN.lenis ? FN.lenis.scrollTo(target, { duration: dur, easing: gsap.parseEase("power2.inOut") }) : window.scrollTo({ top: typeof target === "number" ? target : 0 }));
  document.querySelector(".fn-progress__top")?.addEventListener("click", () => scrollTo(0, 4));

  // ── Video: original videoPlayer — the scene calls play(0) and pause(0), and a locked video stops scrolling once playback starts until it ends, loops once, or is skipped.
  // Skip goes to the end of that section’s pin (original mainContent<n>) and descends in 2s with power2.inOut. The progress circle fills the r48 circumference 301.59 according to the playback position.
  const dockHtml = '<button type="button" class="fn-dock" aria-label="Skip video" inert><svg viewBox="0 0 110 110" aria-hidden="true"><circle class="fn-dock__track" cx="55" cy="55" r="48"/><circle class="fn-dock__bar" cx="55" cy="55" r="48"/></svg><span class="fn-dock__skip"><span>Skip</span></span></button>';
  const setupVideo = (v, cleanups) => {
    const name = v.dataset.video;
    let locked = false, consumed = false, last = 0, raf = 0;
    const dock = v.hasAttribute("data-lock") ? (v.insertAdjacentHTML("afterend", dockHtml), v.nextElementSibling) : null;
    const tick = () => {
      if (v.paused || v.ended) return void (raf = 0);
      if (v.duration && dock) dock.style.setProperty("--progress", String(v.currentTime / v.duration));
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const unlock = () => {
      if (!locked) return;
      locked = false; consumed = true;
      dock.inert = true; dock.classList.add("is-done");
      FN.lenis?.start();
    };
    const lock = () => {
      if (!dock || !FN.lenis || consumed || locked) return;
      locked = true; last = v.currentTime;
      dock.inert = false;
      FN.lenis.stop();
    };
    const onTime = () => {
      if (locked && v.duration && v.currentTime + v.duration * 0.5 < last) unlock();
      last = v.currentTime;
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("play", lock);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", unlock);
    v.addEventListener("error", unlock);
    // The original Skip goes to the scroll-target (100px above the content) of the content after the section — write that content on the video with data-skip
    dock?.addEventListener("click", () => {
      if (!locked) return;
      unlock();
      const to = v.dataset.skip && document.querySelector(v.dataset.skip);
      const st = ScrollTrigger.getAll().find((s) => s.pin && s.trigger === v.closest("section"));
      scrollTo(to ? to.getBoundingClientRect().top + scrollY - 100 : st ? st.end + 2 : (FN.lenis?.scroll || scrollY) + innerHeight, 2);
    });
    cleanups.push(() => { cancelAnimationFrame(raf); v.pause(); if (locked) FN.lenis?.start(); });
    if (name) FN.videos[name] = {
      el: v,
      play(t) { if (t !== undefined) v.currentTime = t; v.play().catch(() => {}); },
      pause(t) { v.pause(); if (t === -1) v.currentTime = v.duration || 0; else if (t !== undefined) v.currentTime = t; },
    };
  };

  // ── Per page: fills the transition container and attaches motion. On leaving, everything is detached with ctx.revert()
  let ctx = null;
  let cleanups = [];
  FN.cleanup = (fn) => cleanups.push(fn);
  const boot = () => {
    const main = document.getElementById("swup") || document.body;
    const page = (FN.page = main.dataset.page || "home");
    FN.scenes = [];
    FN.videos = {};
    headEl?.querySelectorAll("[data-page-link]").forEach((a) => (a.dataset.pageLink === page ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
    headEl?.classList.remove("is-light");

    const foot = main.querySelector('[data-slot="footer"]');
    if (foot) {
      foot.classList.add("fn-foot");
      foot.innerHTML = `
        <div class="fn-foot__in">
          <nav class="fn-foot__nav" aria-label="Bottom Menu" data-label="Section name in English">${links.slice(1).map((l) => `<a class="fn-nav__link" href="${l.href}">${zig(l.label)}</a>`).join("")}</nav>
          <div class="fn-foot__side" data-label="Company English name"><a class="fn-foot__privacy" href="#">${zig("Privacy Policy")}</a><p>© Studio Name</p></div>
        </div>
        <button class="fn-foot__top" type="button" aria-label="Back to top"><svg viewBox="0 0 12 12" width="12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 11V1M1.5 5.5 6 1l4.5 4.5"/></svg></button>`;
      foot.querySelector(".fn-foot__top").addEventListener("click", () => scrollTo(0, 4));
    }
    fillArt(main);
    fillZig(main);
    readyZig(main);
    main.querySelectorAll("[data-movie]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      FN.modal.open(`<div class="fn-modal__movie"><div class="wf-img wf-video" data-label="${b.dataset.movie}"></div></div>`);
    }));
    main.querySelectorAll(".fn-circle-btn i").forEach((i) => (i.innerHTML = play));

    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray("[data-rise]", main).forEach((el) => {
          gsap.from(el, { y: 40, autoAlpha: 0, duration: 1.2, delay: (+el.dataset.rise || 0) / 1000, ease: "fnOut", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        });
        gsap.utils.toArray(".uprise__content", main).forEach((u) => {
          gsap.timeline({ scrollTrigger: { trigger: u, scrub: 1.5, start: "bottom bottom", end: "top 0%" } }).fromTo(u, { rotateX: 90 }, { rotateX: 40, ease: "none" });
        });
        gsap.utils.toArray(".kv__video", main).forEach((v) => gsap.to(v, { yPercent: 10, ease: "none", scrollTrigger: { trigger: v.parentElement, start: "top top", end: "bottom top", scrub: true } }));
      });
      // The big hero headline rises from below, letter by letter
      main.querySelectorAll("[data-split]").forEach((el) => {
        el.innerHTML = [...el.textContent.trim()].map((c, i) => `<span class="ch" style="--n:${i}">${c}</span>`).join("");
        if (!reduced && !el.closest(".kv")) FN.scene(() => gsap.from(el.querySelectorAll(".ch"), { yPercent: 100, autoAlpha: 0, duration: 1, stagger: 0.05, ease: "expo.out", delay: 0.2 }));
      });
      // Original video-kv: when in view (inview) the video opens from circle 0%→76% (phone 81%) and the title letters rise from .8s at .07s intervals
      // Turn on after the initial shape (circle 0%, text below) has been drawn once — turning it on in the same frame makes it appear in the end shape with no transition.
      main.querySelectorAll(".kv").forEach((kv) => FN.scene(() => {
        kv.querySelector(".kv__video")?.getBoundingClientRect();
        requestAnimationFrame(() => requestAnimationFrame(() => kv.classList.add("is-in")));
      }));
      const counters = main.querySelectorAll("[data-count]");
      if (counters.length) {
        const io = new IntersectionObserver((ents) => ents.forEach((en) => {
          if (!en.isIntersecting || en.boundingClientRect.top <= 0) return;
          const el = en.target;
          const to = +el.dataset.count;
          if (reduced) return void (el.textContent = to);
          const o = { v: 0 };
          gsap.to(o, { v: to, duration: 1.5, ease: "power2.out", overwrite: true, onUpdate: () => (el.textContent = Math.round(o.v)) });
        }), { threshold: 0.3 });
        counters.forEach((c) => io.observe(c));
        cleanups.push(() => io.disconnect());
      }

      const anchor = main.querySelector("[data-anchor-menu]");
      if (anchor) {
        const secs = [...main.querySelectorAll("[data-anchor]")];
        anchor.classList.add("fn-anchor");
        anchor.innerHTML = secs.map((s) => `<a href="#${s.id}">${s.dataset.anchor}</a>`).join("");
        const as = [...anchor.querySelectorAll("a")];
        as.forEach((a) => a.addEventListener("click", (e) => {
          e.preventDefault();
          FN.lenis ? FN.lenis.scrollTo(a.getAttribute("href"), { offset: -40 }) : main.querySelector(a.getAttribute("href")).scrollIntoView();
        }));
        secs.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top 50%", end: "bottom 50%", onToggle: (st) => st.isActive && as.forEach((a, j) => a.classList.toggle("is-current", i === j)) }));
        const hero = main.querySelector("[data-hero-dark]");
        if (hero) ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom 85%", onToggle: (st) => anchor.classList.toggle("is-light", st.isActive) });
      }

      // White text only while the header is over the video
      if (headEl) main.querySelectorAll("[data-head-light]").forEach((s) => ScrollTrigger.create({
        trigger: s, start: "top 40px", end: "bottom 40px",
        onToggle: (st) => headEl.classList.toggle("is-light", st.isActive),
      }));

      const prog = main.querySelector(".fn-progress");
      if (prog) {
        const bar = prog.querySelector(".fn-progress__bar");
        ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => { bar.style.transform = `scaleY(${st.progress})`; prog.classList.toggle("is-end", st.progress > 0.97); } });
      }

      main.querySelectorAll("video.fn-vid").forEach((v) => setupVideo(v, cleanups));
      FN.pages[page]?.();
    });
  };
  const start = () => {
    headEl?.classList.add("is-on");
    ctx?.add(() => FN.scenes.forEach((fn) => fn()));
    ScrollTrigger.refresh();
  };
  const teardown = () => {
    cleanups.forEach((f) => f());
    cleanups = [];
    ctx?.revert();
    ctx = null;
    ScrollTrigger.getAll().forEach((st) => st.kill());
    setMenu(false);
    FN.modal.close();
  };

  // ── Page transition: like the original, swup 4.8.3 (head plugins persistAssets·awaitAssets + preload). Only the content (#swup.transition-fade) fades at .25s and settles at .5s.
  // When opened as a file (file:), swup can’t fetch pages, so it moves on with a normal navigation after the same .25s blur.
  const bootSwup = () => {
    if (!/^https?:$/.test(location.protocol) || !window.Swup) return false;
    const plugins = [];
    if (window.SwupPreloadPlugin) plugins.push(new SwupPreloadPlugin());
    if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ persistAssets: true, awaitAssets: true }));
    const swup = new Swup({ containers: ["#swup"], plugins });
    swup.hooks.on("visit:start", (v) => { if (v.from.url !== v.to.url) { v.scroll.reset = true; v.scroll.target = false; } setMenu(false); });
    swup.hooks.before("content:replace", teardown);
    swup.hooks.on("content:replace", () => {
      FN.lenis?.scrollTo(0, { immediate: true, force: true });
      boot();
      enter();
    });
    FN.swup = swup;
    return true;
  };
  if (!bootSwup()) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href$='.html']");
      if (!a || e.metaKey || e.ctrlKey || a.target) return;
      e.preventDefault();
      document.documentElement.classList.add("is-animating", "is-changing");
      setTimeout(() => (location.href = a.href), reduced ? 0 : 250);
    });
    addEventListener("pageshow", () => document.documentElement.classList.remove("is-animating", "is-changing"));
  }

  // ── Loading: original loading — it sits inside the first page’s content, so it runs every time you enter the first page (including transitions). Not on subpages.
  // On a white board three logos rise from below every 1.1s with .65s cubic-bezier(.42,.16,.25,1) and swap, and the bar fills by the amount loaded (.2s).
  // After everything has loaded and the three logos have made a full round, a lime circle covers in 1.5s power4.inOut, and .4s later a center hole opens in 1.2s power4.inOut. The scene starts .6s after opening
  const runLoader = (loader, done) => {
    FN.lenis?.stop();
    const logos = [...loader.querySelectorAll(".fn-loader__logo")];
    const fill = loader.querySelector(".fn-loader__fill");
    const cover = loader.querySelector(".fn-loader__cover");
    const r = () => Math.hypot(innerWidth, innerHeight);
    gsap.set(cover, { width: r() * 2, height: r() * 2, xPercent: -50, yPercent: -50, scale: 0 });
    let t = 0, prev = -1, cycled = false, loaded = false, finished = false, timer = 0;
    const show = () => {
      if (prev > -1) { logos[prev].classList.remove("is-on"); logos[prev].classList.add("is-up"); }
      logos[t].classList.remove("is-up");
      setTimeout(() => logos[t]?.classList.add("is-on"), 10);
    };
    const finish = () => {
      if (finished || !loaded || !cycled) return;
      finished = true;
      clearInterval(timer);
      gsap.to(cover, { scale: 1, duration: 1.5, ease: "power4.inOut" });
      gsap.fromTo(loader, { "--hole": "0px" }, { "--hole": `${r()}px`, duration: 1.2, delay: 0.4, ease: "power4.inOut", onComplete: () => loader.classList.add("is-done") });
      setTimeout(() => { FN.lenis?.start(); done(); }, 600);
    };
    show();
    timer = setInterval(() => {
      t++;
      if (t >= logos.length) { cycled = true; t = 0; if (loaded) return finish(); }
      show();
      prev = t;
    }, 1100);
    prev = 0;
    const vids = [...document.querySelectorAll(".hero video, .intro video")];
    const total = vids.length + 1;
    let got = 0;
    const tick = () => { got++; fill.style.transform = `translateX(${-100 + (got / total) * 100}%)`; if (got >= total) { loaded = true; finish(); } };
    document.fonts.ready.then(tick);
    vids.forEach((v) => (v.readyState >= 4 ? tick() : v.addEventListener("canplaythrough", tick, { once: true })));
    setTimeout(() => { if (!loaded) { loaded = true; finish(); } }, 10000);
    FN.cleanup(() => clearInterval(timer));
  };
  const enter = () => {
    const loader = document.querySelector("#swup .fn-loader");
    if (!loader || reduced) { loader?.classList.add("is-done"); document.fonts.ready.then(start); return; }
    runLoader(loader, start);
  };
  const firstLoad = () => { boot(); enter(); };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", firstLoad, { once: true }) : setTimeout(firstLoad);
})();
