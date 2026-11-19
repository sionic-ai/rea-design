// Common: draw the header bar, white menu panel, and wood-shadow footer, and attach the header color (white text on dark panels), menu panel open/close (.2s), campsite expansion (.2s), and photo fade-in (.5s linear).
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CM = (window.CM = { reduce });

  // Newly drawn placeholder instead of the original dragonfly logo — a vertical body and two pairs of wings
  const mark = (cls = "") => `<svg class="${cls}" viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-label="Brand mark slot"><path d="M28 9v40"/><circle cx="28" cy="7" r="3" fill="currentColor" stroke="none"/><path d="M28 16C20 10 8 11 5 15c6 3 16 3 23 1Zm0 0c8-6 20-5 23-1-6 3-16 3-23 1ZM28 23c-7-3-17-1-19 3 6 1 14 0 19-3Zm0 0c7-3 17-1 19 3-6 1-14 0-19-3Z"/></svg>`;
  CM.mark = mark;
  const arrow = '<svg class="cm-arrow" viewBox="0 0 16 17"><path d="M2 8.5h12M9.5 4l4.5 4.5L9.5 13"/></svg>';
  const ext = '<svg viewBox="0 0 14 15"><path d="M6 2.5H2.5v10h10V9M8.5 1.5h4v4M12.5 1.5 6.5 7.5"/></svg>';
  const roll = (t) => `<span class="cm-roll"><span class="cm-roll__text">${t}</span><span class="cm-roll__clone" aria-hidden="true">${t}</span></span>`;
  // Tree shadow — blurry leaf clusters drawn with our own shapes (the original is a leaf-shadow photo)
  // Cluster leaf clumps along the branch curve (more and smaller leaves toward the branch tips)
  const leaves = (n, seed, branches) => {
    let s = seed, out = "";
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n; i++) {
      const [x0, y0, x1, y1, cx, cy] = branches[i % branches.length];
      const t = r(), u = 1 - t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1 + (r() - 0.5) * 120, y = u * u * y0 + 2 * u * t * cy + t * t * y1 + (r() - 0.5) * 90;
      out += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(10 + r() * 22).toFixed(0)}" ry="${(5 + r() * 9).toFixed(0)}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
    }
    return out;
  };

  const tree = () => `<div class="cm-tree__right" aria-hidden="true"><svg class="cm-tree__shade" viewBox="0 0 800 500" preserveAspectRatio="none" fill="currentColor"><path d="M800 40 C640 90 520 160 380 260 M800 180 C690 210 600 260 520 330" stroke="currentColor" stroke-width="10" fill="none"/>${leaves(110, 7, [[800, 40, 380, 260, 600, 90], [800, 180, 520, 330, 680, 220], [700, 0, 560, 120, 620, 40]])}</svg></div>
    <div class="cm-tree__left" aria-hidden="true"><svg class="cm-tree__shade" viewBox="0 0 715 483" preserveAspectRatio="none" fill="currentColor">${leaves(60, 3, [[0, 60, 420, 200, 200, 40], [0, 220, 300, 330, 140, 300]])}</svg></div>`;

  const headRow = (close = false) => `
    <h1 class="cm-logo-wrap"><a class="cm-logo" href="index.html" aria-label="Brand logo slot"><svg class="cm-logo__mark" viewBox="0 0 56 70" aria-hidden="true"><g transform="translate(10 0) scale(.65)" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">${mark().replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g><g fill="currentColor" style="font-family: var(--kf-font-display)" font-weight="700" text-anchor="middle" font-size="10.5"><text x="28" y="52">Brand Title</text><text x="28" y="66">Campsite</text></g></svg></a></h1>
    <div class="cm-head__right">
      <a class="cm-reserve" href="#">${roll("Book now")}</a>
      <button class="cm-menu-btn${close ? " is-close" : ""}" type="button" aria-label="${close ? "Close Menu" : "Open Menu"}" aria-controls="cm-panel" data-menu-toggle>
        <span class="cm-burger"><i></i><i></i><i></i></span><span class="cm-menu-btn__text">${roll(close ? "Close" : "Menu")}</span>
      </button>
    </div>`;

  const campMenu = (id, sub, name) => `<li>
      <button class="cm-menu-toggle" type="button" aria-expanded="false" aria-controls="${id}">${sub ? `<small>${sub}</small>` : ""}<span>${name}</span></button>
      <div class="cm-menu-sub" id="${id}"><div class="cm-menu-sub__inner">
        <ul class="cm-menu-list">${["Campground Hero", "About the Campsite", "Enjoying a 2-day, 1-night trip", "Stay Guide", "Winter hours"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul>
        <ul class="cm-menu-list">${["Experience Activities", "Events · Outdoor classes", "Facility Guide", "Rental supplies", "Directions"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul>
        <div class="cm-menu-reserve"><a class="cm-btn is-beige" href="#">${roll("Reserve a campsite")}${ext.replace("<svg", '<svg class="cm-arrow"')}</a><p class="cm-menu-note">Booking continues on an external booking site.</p></div>
      </div></div>
    </li>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("cm-head");
    head.innerHTML = headRow();
    head.insertAdjacentHTML("afterend", `<div class="cm-panel" id="cm-panel" data-slot="menu-panel" role="dialog" aria-modal="true" aria-label="Menu" data-active="false">
      <div class="cm-tree" style="position:absolute;inset:0">${tree()}</div>
      <div class="cm-head">${headRow(true)}</div>
      <div class="cm-panel__inner"><div class="cm-panel__contents">
        <nav class="cm-panel__nav" aria-label="Main menu">
          <ul class="cm-main-menu">
            <li><a class="cm-menu-top" href="index.html"><span>TOP</span>${arrow}</a></li>
            ${campMenu("cm-sub-a", "First name", "Campground name A")}
            ${campMenu("cm-sub-b", "", "Campground name B")}
          </ul>
        </nav>
        <div class="cm-other">
          <div class="cm-other__thumb"><span class="wf-img" data-label="Summer camp banner · children and tents · landscape 9:5"></span></div>
          <ul class="cm-other__menu is-bold">${["What to bring list (PDF)", "Usage inquiry", "Frequently asked questions", "Corporate and group services"].map((t) => `<li><a class="cm-tlink" href="#">${t}</a></li>`).join("")}</ul>
          <ul class="cm-other__menu">${["Notes", "Booking info", "Terms of service", "SNS 1", "Blog", "Privacy policy"].map((t) => `<li><a class="cm-tlink" href="#">${t}</a></li>`).join("")}</ul>
        </div>
        <div class="cm-panel__bottom"><p>Your promo line here</p><p>Copyright © COMPANY NAME Co., Ltd.</p></div>
      </div></div>
    </div>`);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.outerHTML = `<div class="cm-tree is-foot" data-slot="footer" data-tone="light">${tree()}
      <footer class="cm-foot">
        <div class="cm-foot__content">
          <div class="cm-foot__logo"><a href="index.html" aria-label="Brand logo slot"><svg viewBox="0 0 240 186" fill="none"><g transform="translate(75 0) scale(1.6)" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">${mark().replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g><g fill="currentColor" style="font-family: var(--kf-font-display)" font-weight="700" text-anchor="middle"><text x="120" y="132" font-size="30" letter-spacing="2">Brand Title</text><text x="120" y="174" font-size="30" letter-spacing="2">Campsite</text></g><path d="M44 142h152" stroke="currentColor" stroke-width="3"/></svg></a></div>
          <ul class="cm-foot__main">${["TOP", "Campground name A", "Campground name B"].map((t) => `<li><a class="cm-tlink" href="index.html">${t}</a></li>`).join("")}</ul>
          <ul class="cm-foot__other">${["What to bring list (PDF)", "Usage inquiry", "Frequently asked questions", "Corporate and group services", "Notes", "Booking info", "Terms of service", "SNS 1", "Blog", "Privacy policy", "External transfer policy"].map((t, i) => `<li><a class="cm-tlink" href="#">${t}${[0, 1, 2, 7, 8, 9, 10].includes(i) ? ext : ""}</a></li>`).join("")}</ul>
        </div>
        <div class="cm-foot__bottom"><p class="cm-foot__copy">Copyright © COMPANY NAME Co., Ltd.</p><button class="cm-foot__top" type="button" data-to-top>Page TOP</button></div>
      </footer>
    </div>`;
  }

  // ───────── Header color — data-tone of the panel under the vertical center of the logo/menu button (dark means white text) ─────────
  const bar = document.querySelector("body > .cm-head");
  let points = [];
  const measure = () => {
    points = [...document.querySelectorAll("[data-tone]")].map((s) => ({ top: s.getBoundingClientRect().top + scrollY, tone: s.dataset.tone })).sort((a, b) => a.top - b.top);
    tone();
  };
  const tone = () => {
    if (!bar) return;
    const r = bar.querySelector(".cm-menu-btn").getBoundingClientRect();
    const mid = scrollY + r.top + r.height / 2;
    let t;
    for (const p of points) { if (p.top <= mid) t = p.tone; else break; }
    if (t && bar.dataset.toneNow !== t) bar.dataset.toneNow = t;
  };
  addEventListener("scroll", tone, { passive: true });
  addEventListener("resize", measure);
  addEventListener("load", measure);
  new ResizeObserver(measure).observe(document.body);
  measure();

  // ───────── Menu panel — turned on and off with data-active in .2s ease-out, and background scroll is locked while open ─────────
  const panel = document.querySelector(".cm-panel");
  const setPanel = (on) => {
    if (!panel) return;
    panel.dataset.active = String(on);
    root.style.overflow = on ? "hidden" : "";
    document.querySelectorAll("[data-menu-toggle]").forEach((b) => b.setAttribute("aria-expanded", String(on)));
    if (on) panel.querySelector(".cm-panel .cm-menu-btn")?.focus({ preventScroll: true });
  };
  document.querySelectorAll("[data-menu-toggle]").forEach((b) => b.addEventListener("click", () => setPanel(panel?.dataset.active !== "true")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && panel?.dataset.active === "true") setPanel(false); });
  panel?.querySelectorAll('a[href^="#"], a[href="index.html"]').forEach((a) => a.addEventListener("click", () => setPanel(false)));

  // ───────── Camp site expand — height .2s ease-out, the plus mark turns into a minus ─────────
  document.querySelectorAll(".cm-menu-toggle").forEach((b) => {
    const sub = document.getElementById(b.getAttribute("aria-controls"));
    b.addEventListener("click", () => {
      const open = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(open));
      sub.style.height = open ? `${sub.scrollHeight}px` : "0px";
    });
  });

  document.querySelectorAll("[data-to-top]").forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })));

  // ───────── Photo fade-in — .5s linear after loading (original gatsby-image) ─────────
  const fadeIn = () => document.querySelectorAll("[data-fade]").forEach((el) => el.classList.add("is-in"));
  if (document.readyState === "complete") requestAnimationFrame(fadeIn); else addEventListener("load", () => requestAnimationFrame(fadeIn));
})();
