// What the whole careers site shares — inserts the header, pill menu and footer, and draws the sunbeam logo, folder tabs and stair skyline shapes
// Passed as CSS variables, with menu open, hiding the menu near the footer, anchor scroll, modal and accordion attached.
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page;

  // Sunbeam logo: 12 short strokes of varying length on a ring (a newly drawn pattern in place of the original logo)
  const burst = (color = "currentColor") => {
    const lens = [9, 5, 8, 4, 9, 6, 8, 4, 9, 5, 7, 4];
    const lines = lens.map((len, i) => {
      const a = (i / lens.length) * Math.PI * 2 - Math.PI / 2;
      const r0 = i % 2 ? 9 : 6;
      const x1 = 16 + Math.cos(a) * r0, y1 = 16 + Math.sin(a) * r0;
      const x2 = 16 + Math.cos(a) * (r0 + len), y2 = 16 + Math.sin(a) * (r0 + len);
      return `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`;
    });
    return `<svg viewBox="0 0 32 32" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">${lines.join("")}</svg>`;
  };
  // 12 line-art icons (business and benefits slots) — redrawn at the same yellow stroke weight instead of the original illustrations
  const ART = [
    '<circle cx="34" cy="30" r="9"/><path d="M20 78V52q0-10 14-10t14 10v26M60 20h46v34H60zM68 46v-8M78 46V32M88 46V28M98 46v-14M48 56l14-8"/>',
    '<path d="M60 74 34 50q-10-12 2-22t24 6q12-16 24-6t2 22Z"/><path d="M22 84q14-10 30-4M98 84q-14-10-30-4"/>',
    '<path d="M20 84h80M28 84V40l32-20 32 20v44M48 84V60h24v24M40 46h8M72 46h8"/>',
    '<circle cx="40" cy="30" r="9"/><circle cx="80" cy="30" r="9"/><path d="M24 80V56q0-10 16-10t16 10v24M64 80V56q0-10 16-10t16 10v24M56 62h8"/>',
    '<path d="M34 86V18M34 20h48l-8 12 8 12H34M60 86h40M80 86V60"/>',
    '<path d="M44 86h32V46q0-10-6-14V20H50v12q-6 4-6 14ZM50 58h20v14H50z"/>',
    '<circle cx="60" cy="50" r="30"/><circle cx="60" cy="38" r="7"/><path d="M48 66q0-12 12-12t12 12M30 50h-8M98 50h-8"/>',
    '<ellipse cx="60" cy="40" rx="28" ry="10"/><path d="M32 40v16q0 10 28 10t28-10V40M32 56v12q0 10 28 10t28-10V56"/>',
    '<path d="M22 84V42l38-18 38 18v42ZM40 84V56h40v28M40 66h40M40 76h40"/>',
    '<path d="M40 22h40l-6 30q-2 10-14 10t-14-10ZM60 62v20M46 84h28"/>',
    '<path d="M22 26h76v40H56l-16 14V66H22ZM36 40h48M36 52h30"/>',
    '<path d="M22 84h80M30 84V64M50 84V52M70 84V40M90 84V26M28 54l22-14 20 8 26-22M86 26h10v10"/>'
  ];
  const art = (i, cls = "") =>
    `<svg class="${cls}" viewBox="0 0 120 100" fill="none" stroke="var(--site-lemon-deep)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ART[i % ART.length]}</svg>`;

  window.CREA = { burst, art };

  const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

  // Folder tab: the left is a rounded right angle, the right end slopes down and spreads roundly at the bottom (153×30 ratio)
  root.style.setProperty(
    "--c-tab-shape",
    svgUrl('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 153 30" preserveAspectRatio="none"><path d="M0 30V2.6C0 1.2 1.2 0 2.6 0H116c1.6 0 3.6.8 4.6 1.8l27.8 26.4c1.1 1 3 1.8 4.6 1.8Z"/></svg>')
  );

  // Staircase skyline: round-headed bars, low on the left and rising toward the right. Bar heights use a fixed seed so they are identical every time
  const skyline = (w, h, cols, seed) => {
    let s = seed;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const cw = w / cols;
    let rects = "";
    for (let i = 0; i < cols; i++) {
      const slope = 0.18 + (i / (cols - 1)) * 0.62;
      const bh = Math.max(0.12, Math.min(1, slope + (rnd() - 0.5) * 0.34)) * h;
      rects += `<rect x="${(i * cw).toFixed(1)}" y="${(h - bh).toFixed(1)}" width="${(cw + 0.6).toFixed(1)}" height="${(bh + 12).toFixed(1)}" rx="${(cw * 0.1).toFixed(1)}"/>`;
    }
    return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${rects}<rect x="0" y="${h - 2}" width="${w}" height="2"/></svg>`);
  };
  root.style.setProperty("--c-skyline", skyline(1440, 318, 26, 7));
  root.style.setProperty("--c-skyline-sp", skyline(390, 120, 9, 11));

  const NAV = [
    { href: "index.html", label: "Company About", key: "home" },
    { href: "about.html", label: "System and environment", key: "about" },
    { href: "recruit.html", label: "Experienced hiring", key: "recruit" },
    { href: "recruit.html#entry", label: "Entry-level & intern hiring", key: "intern" }
  ];

  const header = document.querySelector('header[data-slot="header"]');
  if (header) {
    header.className = "c-header";
    header.innerHTML = `
      <div class="c-header__in">
        <a class="c-header__logo c-logo" href="index.html">${burst("var(--site-lemon-logo)")}<b>BRAND LIFE PARTNERS</b></a>
        <p class="c-header__site">Recruit Site</p>
        <p class="c-header__text">Put a one-line headline intro sentence here.</p>
      </div>
      <nav class="c-nav" data-slot="pill-nav" aria-label="Main menu">
        <ul class="c-nav__list">
          <li class="c-nav__mark">${burst("var(--kf-contrast-ink)")}<span>BRAND</span></li>
          ${NAV.map((n) => `<li class="${n.key === page ? "is-active" : ""}"><a class="c-nav__link" href="${n.href}">${n.label}</a></li>`).join("")}
        </ul>
        <div class="c-menu" role="button" aria-label="Open Menu" tabindex="0"><span class="c-menu__in"><span></span></span></div>
      </nav>`;
  }

  const FOOT = [
    { t: "Company About", href: "index.html", items: ["Menu 1", "Menu 2", "Menu 3", "Menu 4"] },
    { t: "System and environment", href: "about.html", items: ["Menu 1", "Menu 2", "Menu 3", "Menu 4", "Menu 5", "Menu 6"] },
    { t: "Experienced hiring", href: "recruit.html", items: ["Menu 1", "Menu 2", "Menu 3"] },
    { t: "Entry-level & intern hiring", href: "recruit.html#entry", items: ["Menu 1", "Menu 2", "Menu 3"] }
  ];
  const footer = document.querySelector('footer[data-slot="footer"]');
  if (footer) {
    footer.className = "c-footer";
    footer.innerHTML = `
      <div class="c-cards is-right is-black">
        <div class="c-card">
          <div class="c-card__tag"><a href="#top">Page Top</a></div>
          <div class="c-footer__in">
            <div class="c-footer__top">
              <div class="c-footer__brand">${burst("var(--kf-contrast-ink)")}<b>BRAND LIFE PARTNERS</b><p>Recruit Site</p></div>
              <dl class="c-footer__links">
                ${FOOT.map((g, i) => `
                  <div class="c-footer__group">
                    <input type="checkbox" id="foot-${i}">
                    <dt><label for="foot-${i}">${g.t}</label></dt>
                    <dd><ul>${g.items.map((it) => `<li><a href="${g.href}">${it}</a></li>`).join("")}</ul></dd>
                  </div>`).join("")}
              </dl>
            </div>
            <div class="c-footer__bottom">
              <small>Copyright© Brand Life Partners , 0000 All Rights Reserved.</small>
              <ul><li><a href="#">Corporate Site</a></li><li><a href="#">Privacy Policy</a></li></ul>
            </div>
          </div>
        </div>
      </div>`;
  }

  // Phone: tapping the hamburger makes the menu pills slide out from the right in turn (delay in CSS)
  const nav = document.querySelector(".c-nav");
  const menu = document.querySelector(".c-menu");
  menu?.addEventListener("click", () => {
    menu.classList.toggle("is-open");
    nav.classList.toggle("is-open");
  });

  // When the menu’s bottom edge touches the Footer’s top edge, it vanishes in 0.4s
  const foot = document.querySelector(".c-footer");
  if (nav && foot) {
    const check = () => {
      const hide = nav.getBoundingClientRect().bottom > foot.getBoundingClientRect().top;
      nav.style.opacity = hide ? "0" : "";
      nav.style.pointerEvents = hide ? "none" : "";
    };
    addEventListener("scroll", check, { passive: true });
    check();
  }

  // Anchor: original jQuery animate 1000ms swing
  const swing = (t) => 0.5 - Math.cos(t * Math.PI) / 2;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const target = id === "#top" || id === "#" ? document.body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const from = scrollY;
    const to = id === "#top" ? 0 : target.getBoundingClientRect().top + scrollY;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return scrollTo(0, to);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 1000);
      scrollTo(0, from + (to - from) * swing(p));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  // Modal: [data-modal-open="Key"] Pressing it raises only the cards with the same key, and clicking outside or X closes it in 0.5s
  const modal = document.querySelector(".c-modal");
  if (modal) {
    const close = () => {
      modal.classList.remove("is-open");
      root.classList.remove("is-modal-open");
      setTimeout(() => { if (!modal.classList.contains("is-open")) modal.style.display = "none"; }, 500);
    };
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-modal-open]");
      if (!btn) return;
      e.preventDefault();
      const key = btn.dataset.modalOpen;
      modal.style.display = "flex";
      let yellow = false;
      modal.querySelectorAll(".c-card").forEach((c) => {
        const on = c.dataset.card === key;
        c.classList.toggle("is-active", on);
        if (on) yellow = c.hasAttribute("data-yellow");
      });
      modal.classList.toggle("is-yellow", yellow);
      modal.scrollTop = 0;
      setTimeout(() => modal.classList.add("is-open"), 10);
      root.classList.add("is-modal-open");
      modal.dispatchEvent(new CustomEvent("c:modal-open", { detail: { key } }));
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("c-modal__inner") || e.target.closest(".c-modal__close")) close();
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) close(); });
  }

  // Tables and charts that overflow horizontally on phones get ScrollHint 1.2.9 as in the original (white hand icon · “Scroll”). Boxes inside modals are re-attached .15s after opening (the original’s MutationObserver job)
  if (window.ScrollHint && matchMedia("(max-width: 768px)").matches) {
    const hintOpts = { scrollHintIconAppendClass: "scroll-hint-icon-white", i18n: { scrollable: "Scroll" } };
    new ScrollHint(".c-scroll", hintOpts);
    modal?.addEventListener("c:modal-open", () => {
      const box = modal.querySelector(".c-card.is-active .c-scroll");
      if (!box) return;
      setTimeout(() => {
        box.querySelector(".scroll-hint-icon-wrap")?.remove();
        new ScrollHint(box, hintOpts);
        box.querySelector(".scroll-hint-icon-wrap")?.classList.add("is-active");
      }, 150);
    });
  }

  // Accordion: pressing the header expands the body over 0.7s (original jQuery slideToggle(700) — default curve swing = sine in-out)
  document.querySelectorAll("[data-acc]").forEach((head) => {
    const body = head.nextElementSibling;
    head.addEventListener("click", () => {
      const open = !head.classList.contains("is-open");
      head.classList.toggle("is-open", open);
      body.style.overflow = "hidden";
      const h = body.scrollHeight;
      body.animate(
        open ? [{ height: "0px" }, { height: h + "px" }] : [{ height: h + "px" }, { height: "0px" }],
        { duration: 700, easing: "cubic-bezier(0.37, 0, 0.63, 1)" }
      ).onfinish = () => { body.style.height = open ? "auto" : "0px"; };
    });
  });
})();
