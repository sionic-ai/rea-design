// Shared by all pages: draws the header row (expanding menu · key shortcuts) · phone menu · closing band · footer, and runs the Hero entrance order.
// Original is a single-page app, so header and footer stay and only the body changes — in the copy this file draws the same header and footer on every page.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  (document.fonts?.ready || Promise.resolve()).then(() => document.documentElement.classList.add("if-fonts-ready"));
  // The original is a single-page app so the first page intro (homepage-intro) plays only on first open — skipped when arriving from within the site
  const internal = sessionStorage.getItem("if-nav") === "1";
  sessionStorage.removeItem("if-nav");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (a && !/^(https?:|mailto:|#)/.test(a.getAttribute("href") || "#")) sessionStorage.setItem("if-nav", "1");
  });
  if (internal && page === "home") {
    document.querySelectorAll("[data-intro]").forEach((el) => el.removeAttribute("data-intro"));
    document.querySelectorAll('[data-fx~="blur-word-reveal"], [data-fx~="timeline-feed-in"]').forEach((el) => el.removeAttribute("data-fx"));
  }

  const MARK = `<svg viewBox="0 0 20 18" fill="currentColor" aria-hidden="true"><rect x="0" y="7" width="4" height="4"/><rect x="4" y="3" width="4" height="4"/><rect x="4" y="11" width="4" height="4"/><rect x="8" y="7" width="4" height="4"/><rect x="8" y="0" width="3" height="3" opacity=".5"/><rect x="8" y="15" width="3" height="3" opacity=".5"/><rect x="12" y="3" width="4" height="4"/><rect x="12" y="11" width="4" height="4"/><rect x="16" y="7" width="4" height="4"/></svg>`;
  const CHEV = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 4l4 4-4 4"/></svg>`;
  const BACK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 4L6 8l4 4"/></svg>`;
  const MENUS = {
    product: { label: "Product", items: [["For Role One", "One line here on what this job role gains", "service.html"], ["For Role Two", "Your one-line description of the second job role here", "service.html"], ["For Role Three", "Your one-line description of the third role here", "service.html"], ["For Role Four", "One-line description of the fourth role here", "service.html"]] },
    resources: { label: "Resources", items: [["Docs", "Your document guide in one line here", "news.html"], ["Changelog", "Your one-line notice of changes here", "news.html"], ["Blog", "Your article list guide in one line here", "news.html"], ["Download App", "Your one line on where to receive it here", "news.html"]] },
    company: { label: "Company", items: [["About", "Your company intro line here", "about.html"], ["Careers", "Your hiring notice line here", "about.html"], ["Request a demo", "Your demo request line here", "contact.html"]] },
  };
  const current = { home: "", service: "product", news: "resources", article: "resources", about: "company", contact: "contact" }[page];

  // ── Header line ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "if-head";
    head.innerHTML = `
      <div class="if-wrap if-head__grid">
        <a class="if-logo" href="index.html" aria-label="Home" data-label="Brand mark + English wordmark">${MARK}<b>Brandname</b></a>
        <nav class="if-head__nav" aria-label="Main menu">
          ${Object.entries(MENUS).map(([k, m]) => `<button class="if-nav-item" type="button" data-drop="${k}" aria-expanded="false"${current === k ? ' aria-current="page"' : ""}>${m.label}</button>`).join("")}
          <a class="if-nav-item" href="contact.html"${current === "contact" ? ' aria-current="page"' : ""}>Contact</a>
          <div class="if-drop" role="menu"><div class="if-drop__box"><div class="if-drop__inner">
            ${Object.entries(MENUS).map(([k, m]) => `<div class="if-drop__panel" data-panel="${k}">${m.items.map(([t, d, h]) => `<a class="if-drop__item" href="${h}"><b>${t}</b><span>${d}</span></a>`).join("")}</div>`).join("")}
          </div></div></div>
        </nav>
        <div class="if-head__end">
          <a class="if-btn" href="contact.html"><span>Login</span><kbd class="if-kbd">l</kbd></a>
          <a class="if-btn is-raised" href="contact.html"><span>Get started</span><kbd class="if-kbd">g</kbd></a>
        </div>
        <button class="if-burger" type="button" aria-label="Open Menu"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 5.5h11M2.5 10.5h11"/></svg></button>
      </div>`;

    const nav = head.querySelector(".if-head__nav");
    const drop = head.querySelector(".if-drop");
    const triggers = [...head.querySelectorAll("[data-drop]")];
    let openKey = null, openT = 0, closeT = 0, goneT = 0;
    drop.remove();
    const show = (key) => {
      const t = triggers.find((b) => b.dataset.drop === key);
      triggers.forEach((b) => b.setAttribute("aria-expanded", String(b === t)));
      drop.querySelectorAll(".if-drop__panel").forEach((p) => p.classList.toggle("is-on", p.dataset.panel === key));
      drop.style.left = `${t.offsetLeft - 4}px`;
      clearTimeout(goneT);
      if (!openKey) {
        // Like the original Base UI, attach the plate anew — walk the closed state without transition and place it in document flow, then one frame later opacity 0→1 · box .95×→1
        const box = drop.querySelector(".if-drop__box"), inner = drop.querySelector(".if-drop__inner");
        [drop, box, inner].forEach((n) => (n.style.transition = "none"));
        drop.classList.remove("is-leaving", "is-shut", "is-open");
        if (!drop.isConnected) nav.append(drop);
        void drop.offsetWidth;
        [drop, box, inner].forEach((n) => (n.style.transition = ""));
        requestAnimationFrame(() => openKey && drop.classList.add("is-open"));
      } else drop.classList.add("is-open");
      openKey = key;
    };
    // When the pointer leaves, the content vanishes in .1s and the panel folds to .95 scale in .2s (original hover-out). Pressing again fades the whole panel in .2s (original click)
    const hide = (how) => {
      if (!openKey) return;
      triggers.forEach((b) => b.setAttribute("aria-expanded", "false"));
      drop.classList.remove("is-open");
      drop.classList.add(how === "leave" ? "is-leaving" : "is-shut");
      // After fully folded (.2s) the panel is removed from the document — the original detaches closed panels
      goneT = setTimeout(() => { if (!openKey) drop.remove(); }, 220);
      openKey = null;
    };
    triggers.forEach((b) => {
      b.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "touch") return;
        clearTimeout(closeT);
        clearTimeout(openT);
        openT = setTimeout(() => show(b.dataset.drop), openKey ? 0 : 30);
      });
      b.addEventListener("click", () => (openKey === b.dataset.drop ? hide("click") : show(b.dataset.drop)));
    });
    nav.addEventListener("pointerleave", () => { clearTimeout(openT); closeT = setTimeout(() => hide("leave"), 60); });
    nav.addEventListener("pointerenter", () => clearTimeout(closeT));
    head.querySelector('a[href="contact.html"]').parentElement.addEventListener("pointerenter", () => hide("leave"));
    addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide("click");
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest("input, textarea, [contenteditable]")) return;
      // Key hints on the original header buttons — L goes to login, G goes to get started (N turns off annotations so they don’t clash)
      if (e.key.toLowerCase() === "g" || e.key.toLowerCase() === "l") location.href = "contact.html";
    });

    // ── Phone menu ──
    const sheet = document.createElement("div");
    sheet.className = "if-sheet";
    sheet.setAttribute("data-slot", "mobile-menu");
    const rootList = () => `
      <a href="index.html"${page === "home" ? ' aria-current="page"' : ""}>Home</a>
      ${Object.entries(MENUS).map(([k, m]) => `<button type="button" data-sub="${k}">${m.label}${CHEV}</button>`).join("")}
      <a href="contact.html"${page === "contact" ? ' aria-current="page"' : ""}>Contact</a>`;
    const subList = (k) => `<button type="button" class="is-back" data-back>${BACK}${MENUS[k].label}</button>${MENUS[k].items.map(([t, , h]) => `<a class="is-sub" href="${h}">${t}</a>`).join("")}`;
    sheet.innerHTML = `
      <div class="if-sheet__top"><a class="if-logo" href="index.html">${MARK}<b>Brandname</b></a><button class="if-burger" type="button" aria-label="Close Menu" style="display:inline-flex"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg></button></div>
      <div class="if-sheet__body"><div class="if-sheet__list">${rootList()}</div></div>
      <div class="if-sheet__foot"><a class="if-sheet__cta" href="contact.html">Get started</a><div class="if-sheet__row"><span class="if-sheet__soc"><i></i><i></i><i></i></span><a class="if-link-arrow" href="contact.html" style="text-decoration:none">Login<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 6h8M7 3l3 3-3 3"/></svg></a></div></div>`;
    document.body.append(sheet);
    const body = sheet.querySelector(".if-sheet__body");
    // When moving to a sub list, the new list comes in from 12px aside and 4px blur while the old list exits the opposite way with .2s easeOut (original Nr transform)
    const swap = (html, dir) => {
      const old = body.querySelector(".if-sheet__list");
      const next = document.createElement("div");
      next.className = "if-sheet__list";
      next.innerHTML = html;
      body.append(next);
      if (reduce) { old.remove(); return; }
      gsap.fromTo(next, { opacity: 0, filter: "blur(4px)", x: dir * 12 }, { opacity: 1, filter: "blur(0px)", x: 0, duration: 0.2, ease: "power1.out", clearProps: "filter" });
      gsap.to(old, { opacity: 0, filter: "blur(4px)", x: dir * -12, duration: 0.2, ease: "power1.out", onComplete: () => old.remove() });
    };
    body.addEventListener("click", (e) => {
      const sub = e.target.closest("[data-sub]");
      if (sub) swap(subList(sub.dataset.sub), 1);
      if (e.target.closest("[data-back]")) swap(rootList(), -1);
    });
    const setSheet = (on) => { sheet.classList.toggle("is-open", on); document.documentElement.style.overflow = on ? "hidden" : ""; };
    head.querySelector(".if-burger").addEventListener("click", () => setSheet(true));
    sheet.querySelector(".if-burger").addEventListener("click", () => setSheet(false));
  }

  // ── Closing band + footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const cols = [
      ["Product", ["Role One", "Role Two", "Role Three", "Support"]],
      ["Resources", ["Documentation", "Security", "Changelog", "Blog", "Download", "Guides"]],
      ["Company", ["Request a demo", "About", "Careers", "Social One", "Social Two", "Community"]],
      ["Legal", ["Compliance", "Terms of Service", "Support Policy", "Privacy Policy", "Cookie Policy", "Service Levels", "Data Processing"]],
    ];
    const hrefOf = (t) => ({ "Role One": "service.html", "Role Two": "service.html", Blog: "news.html", Changelog: "news.html", About: "about.html", Careers: "about.html", "Request a demo": "contact.html" }[t] || "#");
    const icons = ["M8 1.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13Zm0 3a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7Z", "M8 1l1.6 4.9L14.5 8l-4.9 1.6L8 14.5 6.4 9.6 1.5 8l4.9-2.1Z", "M3 3h10v10H3Zm2 2v6h6V5Z", "M8 1.5l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5L1.5 8 6 6Z", "M8 2a6 6 0 1 1-5.6 3.8l1.6.6A4.3 4.3 0 1 0 8 3.7Z"];
    foot.className = "if-foot";
    foot.innerHTML = `
      <div class="if-wrap">
        ${foot.dataset.cta === "off" ? "" : `<div class="if-cta" data-slot="closing-cta">
          <div class="if-glow is-wide"></div>
          <h2 class="t-h1 if-cta__title" data-label="Closing large heading (two English lines)">Closing line set<br>across two lines</h2>
          <a class="if-btn is-solid" href="contact.html">Get started</a>
        </div>`}
        <div class="if-ask"><p class="t-body c-3">Your where-to-ask notice here</p><div class="if-ask__icons">${icons.map((d) => `<a class="if-btn is-icon" href="#" aria-label="External helper"><svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="${d}"/></svg></a>`).join("")}</div></div>
        <div class="if-foot__cols">
          <div class="if-foot__grid">${cols.map(([h, ls]) => `<div class="if-foot__col"><h4>${h}</h4>${ls.map((t) => `<a href="${hrefOf(t)}">${t}</a>`).join("")}</div>`).join("")}</div>
          <a class="if-foot__mark" href="index.html" aria-label="Home">${MARK}</a>
        </div>
        <div class="if-foot__legal">
          <p class="t-cap c-3">Copyright © 2026 Brandname, Inc. All rights reserved.</p>
          <p class="t-cap c-3">One line of trademark notice — a spot for the trademark name and the country of registration.</p>
        </div>
        <svg class="if-foot__word" viewBox="0 0 1200 180" preserveAspectRatio="xMidYMax meet" aria-hidden="true" data-label="Large wordmark — checkerboard symbol + English company name, fading downward">
          <defs>
            <linearGradient id="if-word-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".07"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient>
            <pattern id="if-word-px" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="url(#if-word-fade)"/><rect x="12" y="12" width="12" height="12" fill="url(#if-word-fade)"/></pattern>
          </defs>
          <g fill="url(#if-word-fade)">
            <rect x="0" y="60" width="48" height="48"/><rect x="48" y="12" width="48" height="48"/><rect x="48" y="108" width="48" height="48"/><rect x="96" y="60" width="48" height="48"/><rect x="144" y="12" width="48" height="48"/><rect x="144" y="108" width="48" height="48"/><rect x="192" y="60" width="48" height="48"/>
          </g>
          <text x="270" y="172" font-size="200" textLength="920" lengthAdjust="spacingAndGlyphs" fill="url(#if-word-fade)" style="font-family: var(--kf-font-serif, var(--kf-font-display)); letter-spacing: -0.02em">Brandname</text>
        </svg>
      </div>`;
  }

  // ── Hero entrance — original hero-transition: .8s cubic-bezier(.25,.1,.25,1), from 10px blur, transparent, 20% below ──
  // [data-intro="Delay type, duration, curve"] — type is rise (default)·blur·fade, and if the curve is left empty the original curve is used. Titles split into words are handled by the blur-word-reveal part
  const intro = [...document.querySelectorAll("[data-intro]")];
  if (intro.length && window.gsap) {
    if (window.CustomEase) gsap.registerPlugin(CustomEase);
    const ease = window.CustomEase ? CustomEase.create("if-hero", "0.25,0.1,0.25,1") : "power1.inOut";
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      intro.forEach((el) => {
        const [delay, kind = "rise", dur = "0.8", own] = el.dataset.intro.split(/\s+/);
        const from = kind === "fade" ? { opacity: 0 } : kind === "blur" ? { opacity: 0, filter: "blur(10px)" } : { opacity: 0, filter: "blur(10px)", yPercent: 20 };
        const to = kind === "fade" ? { opacity: 1 } : kind === "blur" ? { opacity: 1, filter: "blur(0px)" } : { opacity: 1, filter: "blur(0px)", yPercent: 0 };
        gsap.fromTo(el, from, { ...to, duration: +dur, delay: +delay, ease: own || ease, clearProps: "filter,transform" });
      });
    });
  }

  if (window.ScrollTrigger) addEventListener("load", () => ScrollTrigger.refresh());
})();
