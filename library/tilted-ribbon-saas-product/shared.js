// Draws the shared header · phone menu · footer · helper button into every page here once, and attaches interactions shared across pages (dropdown · logo cell cycle · carousel · FAQ · theme).
// The motion part (_fx) must draw before its first sweep for the footer dot pattern to stick, so this file runs right at the end of the body
(() => {
  const I = {
    down: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    // The nav chevron is painted with fill like the original — the color change is caught via fill
    chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 13.17l4.95-4.95 1.41 1.41L12 16 5.64 9.64l1.41-1.41z" fill="currentColor"/></svg>',
    right: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6.25 4.5L9.75 8l-3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    burger: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 6.5h13M3.5 13.5h13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    close: '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    book: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 3.5h4.2c1 0 1.8.8 1.8 1.8V13c0-.8-.7-1.5-1.5-1.5H2v-8zM14 3.5H9.8c-1 0-1.8.8-1.8 1.8V13c0-.8.7-1.5 1.5-1.5H14v-8z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    // Theme icons are painted only with fill like the original — hover color change is caught by fill
    sun: '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><circle cx="10" cy="10" r="3.2"/><circle cx="10" cy="3.4" r="1"/><circle cx="10" cy="16.6" r="1"/><circle cx="3.4" cy="10" r="1"/><circle cx="16.6" cy="10" r="1"/><circle cx="5.3" cy="5.3" r="1"/><circle cx="14.7" cy="14.7" r="1"/><circle cx="5.3" cy="14.7" r="1"/><circle cx="14.7" cy="5.3" r="1"/></svg>',
    moon: '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 2.8a7.2 7.2 0 110 14.4 7.2 7.2 0 010-14.4zm0 1.4a5.8 5.8 0 000 11.6z"/></svg>',
    screen: '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="10" rx="1.2"/><rect x="9.3" y="13.5" width="1.4" height="3"/><rect x="6.5" y="15.8" width="7" height="1.4" rx=".7"/></svg>',
    social: (k) => `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">${k === 0 ? '<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="10" r="2.5" fill="currentColor"/>' : k === 1 ? '<path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' : '<rect x="3.5" y="3.5" width="13" height="13" rx="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M7 9v4M10 13V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'}</svg>`,
    glyph: (k) => `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">${["<rect x='2.5' y='2.5' width='11' height='11' rx='2' stroke='currentColor' stroke-width='1.3'/>", "<circle cx='8' cy='8' r='5.5' stroke='currentColor' stroke-width='1.3'/>", "<path d='M8 2l5.5 10H2.5z' stroke='currentColor' stroke-width='1.3' stroke-linejoin='round'/>", "<path d='M3 8h10M8 3v10' stroke='currentColor' stroke-width='1.3' stroke-linecap='round'/>"][k % 4]}</svg>`,
  };
  window.mIcons = I;

  // Brand mark: placeholder mark of two interlocking leaves (the original logo spot)
  const mark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15.5C5 9.7 9.4 5 15 5h4v3.5C19 14.3 14.6 19 9 19H5z" style="fill:var(--kf-accent-text)"/><path d="M9.5 15.5c0-3.3 2.5-6 5.7-6" fill="none" style="stroke:var(--kf-bg)" stroke-width="2" stroke-linecap="round"/></svg>';
  const logo = (cls = "") => `<a class="m-logo ${cls}" href="index.html" aria-label="To the first page" data-label="Brand logo · mark + English wordmark">${mark}<span>brandly</span></a>`;

  const drops = {
    products: { cols: [["Products", [["Docs", "Your one-line description here"], ["Base", "Your one-line description here", "Beta"]]], ["Automations", [["Automations", "Your short two-line description here"], ["Agent", "Your short two-line description here"], ["Assistant", "Your one-line description here"]]], ["Integrations", [["Connections", "Your one-line description here"], ["MCP server", "Your one-line description here"]]]], feature: "Customer feature" },
    solutions: { cols: [["By stage", [["Startups", "Your one-line description here"], ["Enterprise", "Your one-line description here"]]], ["By need", [["Build vs Buy", "Your one-line description here"], ["Switch", "Your one-line description here"]]], ["Programs", [["OSS program", "Your one-line description here"], ["Desktop", "Your one-line description here"]]]], feature: "Customer feature" },
    resources: { cols: [["Learn", [["Blog", "Your one-line description here", "", "news.html"], ["Guides", "Your one-line description here"]]], ["Company", [["Careers", "Your one-line description here", "", "recruit.html"], ["Customers", "Your one-line description here"]]], ["Docs", [["Getting started", "Your one-line description here"], ["Changelog", "Your one-line description here", "", "article.html"]]]], feature: "Latest post" },
  };
  const dropPane = (key, d) => `<div class="m-drop__pane" data-pane="${key}">${d.cols.map(([label, items], ci) => `<div class="m-drop__col"><p class="m-drop__label">${label}</p>${items.map(([t, s, tag, href], k) => `<a class="m-drop__link" href="${href || "#"}">${I.glyph(ci + k)}<b>${t}${tag ? `<span class="m-drop__tag">${tag}</span>` : ""}</b><small>${s}</small></a>`).join("")}</div>`).join("")}<div class="m-drop__feature"><p class="m-drop__label">${d.feature}</p><div class="wf-img" data-label="Case study cover · brand-color background with a white logo box in the center · 3:2"></div><p><b>Client Name</b> Your case study line here, cut down to two lines.</p><a href="#">Read story ${I.right.replace('aria-hidden="true"', 'aria-hidden="true" width="14" height="14"')}</a></div></div>`;

  const head = document.createElement("header");
  head.className = "m-head";
  head.dataset.slot = "header";
  head.innerHTML = `<div class="m-grid"><div class="m-head__bar" style="grid-column:1/-1">
    ${logo()}
    <nav class="m-nav" aria-label="Main menu">
      ${Object.keys(drops).map((k) => `<button type="button" class="m-nav__item" aria-expanded="false" data-drop="${k}"><span class="m-nav__pill" aria-hidden="true"></span><span>${k[0].toUpperCase() + k.slice(1)}</span>${I.chev}</button>`).join("")}
      <a class="m-nav__item" href="pricing.html"><span class="m-nav__pill" aria-hidden="true"></span><span>Pricing</span></a>
    </nav>
    <div class="m-head__end"><a class="m-btn m-btn--line m-btn--sm" href="#">Sign in</a><a class="m-btn m-btn--sm" href="#">Contact sales</a></div>
    <button type="button" class="m-burger" aria-label="Open Menu" aria-expanded="false">${I.burger}</button>
    <div class="m-drop" data-slot="nav-dropdown"><div class="m-drop__card">${Object.entries(drops).map(([k, d]) => dropPane(k, d)).join("")}</div></div>
  </div></div>`;

  const menu = document.createElement("div");
  menu.className = "m-menu";
  menu.dataset.slot = "mobile-menu";
  menu.innerHTML = `${Object.entries(drops).map(([k, d]) => `<div class="m-menu__group"><button type="button" class="m-menu__toggle" aria-expanded="false">${k[0].toUpperCase() + k.slice(1)}${I.down}</button><div class="m-menu__list"><div>${d.cols.flatMap(([, items]) => items).map(([t, , , href]) => `<a href="${href || "#"}">${t}</a>`).join("")}</div></div></div>`).join("")}
    <a class="m-menu__plain" href="pricing.html">Pricing</a>
    <div class="m-menu__cta"><a class="m-btn m-btn--line" href="#">Sign in</a><a class="m-btn" href="#">Contact sales</a></div>`;

  const footCols = [
    ["Explore", ["Startups", "Enterprise", "Build vs Buy", "Switch", "OSS program", "Desktop", "Learn"]],
    ["Resources", ["Customers", ["Blog", "news.html"], ["Pricing", "pricing.html"], "Guides", "Feature requests", "Library", "Agent score", "Index"]],
    ["Documentation", ["Getting started", "API reference", "Components", ["Changelog", "article.html"]]],
    ["Company", [["Careers", "recruit.html"], "Events", "Wall of love", "Roadmap"]],
    ["Legal", ["Privacy policy", "Responsible disclosure", "Terms of service", "Security", "DSR/DSAR"]],
  ];
  const status = (cls) => `<a class="m-status ${cls}" href="#"><i></i>All systems normal</a>`;
  const foot = document.createElement("footer");
  foot.className = "m-foot";
  foot.dataset.slot = "footer";
  foot.innerHTML = `<div class="m-grid m-foot__grid" data-fx="margin-dot-field">
    <div class="m-foot__brand">${logo()}${status("m-status--wide")}</div>
    <div class="m-foot__cols">${footCols.map(([h, links]) => `<div class="m-foot__col"><h3>${h}</h3><ul>${links.map((l) => { const [t, href] = Array.isArray(l) ? l : [l, "#"]; return `<li><a href="${href}">${t}</a></li>`; }).join("")}</ul></div>`).join("")}</div>
    <div style="grid-column:1/-1">${status("m-status--narrow")}</div>
    <div class="m-foot__rule"></div>
    <div class="m-foot__base">
      <div class="m-themes" role="group" aria-label="Change Theme"><button type="button" data-theme-set="light" aria-label="Light">${I.sun}</button><button type="button" data-theme-set="dark" aria-label="Dark">${I.moon}</button><button type="button" data-theme-set="system" aria-label="System">${I.screen}</button></div>
      <div class="m-social">${[0, 1, 2].map((k) => `<a href="#" aria-label="Social link ${k + 1}">${I.social(k)}</a>`).join("")}</div>
    </div>
  </div>`;

  const ask = document.createElement("button");
  ask.type = "button";
  ask.className = "m-ask";
  ask.dataset.slot = "assistant";
  ask.innerHTML = `${I.book}Ask assistant`;

  document.body.prepend(head);
  head.after(menu);
  (document.querySelector("main") || document.body).after(foot);
  document.body.append(ask);

  // ── Dropdown: opens immediately on hover, closes .15s after the pointer leaves the panel too. If moved to an adjacent menu while open, content slides in from that direction ──
  const drop = head.querySelector(".m-drop"), triggers = [...head.querySelectorAll("[data-drop]")];
  const order = triggers.map((b) => b.dataset.drop);
  const card = drop.querySelector(".m-drop__card");
  card.remove();
  let openKey = null, tOpen = 0, tClose = 0;
  let tShut = 0;
  const show = (key) => {
    clearTimeout(tClose);
    const prev = openKey;
    if (key && key === prev) return;
    openKey = key;
    drop.classList.toggle("is-open", !!key);
    triggers.forEach((b) => b.setAttribute("aria-expanded", String(b.dataset.drop === key)));
    // As in the original, when closed the panel is removed from the document and inserted anew on open — the first frame inserted is size 0, then it attaches at its real size on the next frame (viewport measuring)
    clearTimeout(tShut);
    // On close it folds (-10° · .96 · transparent) in .15s per the original CSS, then drops out
    if (!key) { tShut = setTimeout(() => card.remove(), 150); return; }
    if (!card.isConnected) {
      card.style.width = card.style.height = "0px";
      drop.append(card);
      requestAnimationFrame(() => { card.style.width = card.style.height = ""; });
    }
    drop.classList.add("is-live");
    const dir = prev && prev !== key ? (order.indexOf(key) > order.indexOf(prev) ? "from-end" : "from-start") : "fresh";
    drop.querySelectorAll(".m-drop__pane").forEach((p) => {
      p.classList.remove("from-end", "from-start", "fresh");
      p.classList.toggle("is-on", p.dataset.pane === key);
      if (p.dataset.pane === key) { void p.offsetWidth; p.classList.add(dir); }
    });
  };
  const later = () => { clearTimeout(tOpen); clearTimeout(tClose); tClose = setTimeout(() => show(null), 150); };
  triggers.forEach((b) => {
    b.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; clearTimeout(tOpen); clearTimeout(tClose); if (openKey) show(b.dataset.drop); else tOpen = setTimeout(() => show(b.dataset.drop), 115); });
    b.addEventListener("pointerleave", later);
    b.addEventListener("click", () => { clearTimeout(tOpen); show(openKey === b.dataset.drop ? null : b.dataset.drop); });
  });
  drop.addEventListener("pointerenter", () => clearTimeout(tClose));
  drop.addEventListener("pointerleave", later);
  addEventListener("keydown", (e) => { if (e.key === "Escape") { show(null); setMenu(false); } });
  document.addEventListener("click", (e) => { if (openKey && !e.target.closest(".m-nav, .m-drop")) show(null); });

  // ── Phone menu ──
  const burger = head.querySelector(".m-burger");
  const setMenu = (on) => {
    menu.classList.toggle("is-open", on);
    burger.setAttribute("aria-expanded", String(on));
    burger.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    burger.innerHTML = on ? I.close : I.burger;
    document.documentElement.style.overflow = on ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  menu.querySelectorAll(".m-menu__toggle").forEach((t) => t.addEventListener("click", () => t.setAttribute("aria-expanded", String(t.getAttribute("aria-expanded") !== "true"))));
  matchMedia("(min-width: 64rem)").addEventListener("change", (e) => e.matches && setMenu(false));

  // ── Theme: light, dark, follow device — the skin’s [data-theme=Turns on the dark] block ──
  const sysDark = matchMedia("(prefers-color-scheme: dark)");
  const applyTheme = (mode) => {
    const dark = mode === "dark" || (mode === "system" && sysDark.matches);
    if (dark) document.documentElement.dataset.theme = "dark"; else delete document.documentElement.dataset.theme;
    foot.querySelectorAll("[data-theme-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeSet === mode)));
  };
  let mode = localStorage.getItem("m-theme") || "system";
  applyTheme(mode);
  foot.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => { mode = b.dataset.themeSet; localStorage.setItem("m-theme", mode); applyTheme(mode); }));
  sysDark.addEventListener("change", () => mode === "system" && applyTheme(mode));

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Logo cells: every 5.6s they fade out moving down 6px in diagonal order (55ms), switch to the next eight, and rise back in the same order. Paused on interaction ──
  const NAMES = ["Client 01", "Client 02", "Client 03", "Client 04", "Client 05", "Client 06", "Client 07", "Client 08", "Client 09", "Client 10", "Client 11", "Client 12", "Client 13", "Client 14", "Client 15", "Client 16", "Client 17", "Client 18", "Client 19", "Client 20", "Client 21", "Client 22", "Client 23", "Client 24"];
  const SHAPES = [
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="12" y="3" width="7" height="7" rx="1" opacity=".6"/><rect x="3" y="12" width="7" height="7" rx="1" opacity=".6"/><rect x="12" y="12" width="7" height="7" rx="1"/>',
    '<circle cx="11" cy="11" r="8"/>', '<path d="M11 2l9 16H2z"/>', '<path d="M11 2l8 4.5v9L11 20l-8-4.5v-9z"/>',
    '<path d="M3 11a8 8 0 0116 0z"/><path d="M3 13h16v3H3z" opacity=".6"/>', '<path d="M4 4h14v4H8v3h8v4H8v3H4z"/>',
    '<circle cx="7" cy="11" r="4.5"/><circle cx="15" cy="11" r="4.5" opacity=".6"/>', '<path d="M2 18L11 3l9 15h-5l-4-7-4 7z"/>',
  ];
  window.mLogo = (i) => `<svg viewBox="0 0 22 22" fill="currentColor" aria-hidden="true">${SHAPES[i % SHAPES.length]}</svg>${NAMES[i % NAMES.length]}`;
  document.querySelectorAll("[data-logo-cycle]").forEach((grid) => {
    const cells = [...grid.querySelectorAll(".m-cell")], C = cells.length, cols = 4;
    cells.forEach((c, i) => { c.querySelector(".m-cell__mark").innerHTML = mLogo(i); c.querySelector(".m-cell__mark").style.transitionDelay = `${55 * (Math.floor(i / cols) + (i % cols))}ms`; });
    if (reduce) return;
    const k = 55 * (Math.floor((C - 1) / cols) + ((C - 1) % cols));
    let offset = 0, held = false, timer = 0;
    grid.addEventListener("pointerenter", () => (held = true));
    grid.addEventListener("pointerleave", () => (held = false));
    grid.addEventListener("focusin", () => (held = true));
    grid.addEventListener("focusout", () => (held = false));
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      timer = setInterval(() => {
        if (held) return;
        cells.forEach((c) => c.classList.add("is-out"));
        setTimeout(() => { offset = (offset + C) % NAMES.length; cells.forEach((c, i) => { c.querySelector(".m-cell__mark").innerHTML = mLogo(offset + i); c.classList.remove("is-out"); }); }, 500 + k);
      }, 5375 + k);
    }, { rootMargin: "0px 0px -80px 0px", threshold: 0.1 });
    io.observe(grid);
  });

  // ── Carousel: on mouse devices the same blossom as the original (drag · inertia · snap), on touch devices just horizontal scroll ──
  document.querySelectorAll("[data-carousel]").forEach((wrap) => {
    const track = wrap.querySelector("[blossom-carousel]");
    const sec = wrap.closest("section");
    const prev = sec?.querySelector("[data-prev]"), next = sec?.querySelector("[data-next]");
    let api = null;
    if (window.BlossomCarousel && matchMedia("(hover: hover) and (pointer: fine)").matches) { api = BlossomCarousel.Blossom(track, { repeat: false }); api.init(); }
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 300) + 16;
    prev?.addEventListener("click", () => (api ? api.prev() : track.scrollBy({ left: -step(), behavior: "smooth" })));
    next?.addEventListener("click", () => (api ? api.next() : track.scrollBy({ left: step(), behavior: "smooth" })));
    const sync = () => { if (prev) prev.disabled = track.scrollLeft <= 2; if (next) next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2; };
    track.addEventListener("scroll", sync, { passive: true });
    new ResizeObserver(sync).observe(track);
    sync();
  });

  // ── FAQ: open only one ──
  document.querySelectorAll("[data-faq]").forEach((faq) => {
    const qs = [...faq.querySelectorAll(".m-faq__q")];
    qs.forEach((q) => q.addEventListener("click", () => { const on = q.getAttribute("aria-expanded") !== "true"; qs.forEach((o) => o.setAttribute("aria-expanded", "false")); q.setAttribute("aria-expanded", String(on)); }));
  });
})();
