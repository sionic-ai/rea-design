// Prints the frames shared by all pages (background triangle ring·header·menu panel·yellow recruiting panel·”Learn more” panel·footer), and
// Hooks up the menu and footer collapsibles, the header gradient transition (is-fixed), hand-drawn circles and outlines, and the button text-roll markup.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) root.classList.add("tg-still");

  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const icon = () => `<i class="tg-icon">${ARROW}${ARROW}</i>`;
  const interact = () => `<span class="tg-interact">${icon()}</span>`;
  const button = (label, href, cls = "") => `<a class="tg-button ${cls}" href="${href}"><span class="tg-button__label"><span class="tg-button__inner">${label}</span></span>${icon()}</a>`;
  window.tgIcon = icon; window.tgInteract = interact; window.tgButton = button;

  // Hand-drawn circle — stands in for the original line_*.svg. One stroke goes around one and a half times and the end slightly overlaps
  const circle = (w, h) => `<svg class="tg-circle" viewBox="0 0 200 100" preserveAspectRatio="none" style="width:${w};height:${h}" aria-hidden="true"><path d="M60 12C110 2 186 10 192 42c6 34-70 54-122 52C24 92 4 74 9 50 15 22 70 8 128 9c26 1 48 6 56 13"/></svg>`;
  window.tgCircle = circle;

  // Background triangle ring — on a panel the same as the original circle.svg (778×746), ten rounded triangles at 36° intervals, base (190) touching the outer circle (radius 373) and
  // Redraw so the vertex (height 76) points to the center. Whole group opacity .8
  const ring = () => {
    const tri = (deg) => {
      const a = (deg * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
      const at = (r, t) => [389 + ux * r + vx * t, 373 + uy * r + vy * t];
      const P = [at(373, -95), at(373, 95), at(297, 0)];
      // Round each corner by 12 — at every vertex, link the points on its two adjacent edges using the vertex as the control point
      const cut = (p, q, d) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]); return [p[0] + ((q[0] - p[0]) * d) / L, p[1] + ((q[1] - p[1]) * d) / L]; };
      const f = (v) => v.map((n) => n.toFixed(1)).join(" ");
      let d = "";
      P.forEach((p, i) => {
        const prev = P[(i + 2) % 3], next = P[(i + 1) % 3];
        const s1 = cut(p, prev, 12), s2 = cut(p, next, 12);
        d += `${i ? "L" : "M"}${f(s1)} Q${f(p)} ${f(s2)} `;
      });
      return `<path d="${d}Z"/>`;
    };
    let out = "";
    for (let i = 0; i < 10; i++) out += tri(90 + i * 36);
    return `<svg class="tg-bg__ring" viewBox="0 0 778 746" aria-hidden="true"><g opacity="0.8" style="fill: var(--kf-surface)">${out}</g></svg>`;
  };

  // Background speckle — scatters anew, in the same distribution, the original pattern.png (200px gray specks 0~77, 43% are 0), layered over the gradient with screen
  const grain = () => {
    const c = document.createElement("canvas");
    c.width = c.height = 200;
    const ctx = c.getContext("2d"), img = ctx.createImageData(200, 200);
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rnd() < 0.43 ? 0 : Math.round(rnd() * 77);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    root.style.setProperty("--tg-grain", `url(${c.toDataURL()})`);
  };
  grain();

  const NAV = [
    ["Learn about work", [["Job group 1", "work.html"], ["Job group 2", "work.html"], ["Job group 3", "work.html"], ["Job group 4", "work.html"]]],
    ["Get to know the company", [["Key message", "message.html"], ["Culture and Ideals", "message.html"], ["Company info", "message.html"], ["The company on one page", "index.html#summary"]]],
    ["Getting to know people", [["Meet the people, first section", "people.html"], ["Company in Numbers", "people.html#data"], ["Staff Interview", "interview.html"]]],
    ["Learn the environment", [["Office", "index.html#environment"], ["Employee benefits", "index.html#environment"]]],
    ["Hiring Info", [["Interested People", "index.html#recruit"], ["Application guidelines", "index.html#recruit"], ["Career path", "index.html#recruit"], ["Frequently asked questions", "index.html#faq"]]],
  ];
  const toggle = '<span class="tg-nav__toggle"><i></i></span>';
  const BLOCKS = {
    header: `
<header class="tg-header" data-slot="header">
  <div class="tg-header__inner">
    <a class="tg-logo" href="index.html"><span class="tg-logo__img">LOGO</span><span class="tg-logo__text">RECRUIT SITE</span></a>
    <button class="tg-menu" type="button" aria-expanded="false" aria-controls="tg-nav"><span class="tg-menu__rect">MENU</span></button>
    <nav class="tg-nav" id="tg-nav" aria-label="Main menu" data-slot="nav-dropdown">
      <ul class="tg-nav__inner">${NAV.map(([t, kids]) => `
        <li class="tg-nav__item" data-acc><div class="tg-nav__parent" data-acc-trigger>${t}${toggle}</div>
          <ul class="tg-nav__child">${kids.map(([k, h]) => `<li><a href="${h}"><span>${k}</span>${icon()}</a></li>`).join("")}</ul></li>`).join("")}
      </ul>
      <div class="tg-nav__btns"><a class="tg-nav__btn" href="index.html#recruit">Application guidelines</a><a class="tg-nav__btn" href="index.html#recruit">Apply</a></div>
    </nav>
  </div>
</header>`,
    recruit: `
<section class="tg-recruit" id="recruit" data-slot="recruit-cta">
  <div class="tg-recruit__inner">
    <div>
      <h2 class="tg-recruit__title tg-stitle tg-stitle--invert"><span class="tg-stitle__main">Recruit</span><span class="tg-stitle__sub">Hiring Info</span></h2>
      <p class="tg-recruit__text">Your opening line saying no experience is needed here.<br>The reason is <b>”One standard to highlight here”</b><br><b>”Two criteria to emphasize here”</b>Because we cherish it.<br>Close with a line here saying you look forward to applications!</p>
    </div>
    <div class="tg-recruit__links">
      <a class="tg-recruit__link" href="#"><span class="tg-recruit__label"><span class="tg-recruit__inner-label"><span class="tg-recruit__eng">Entry</span>Apply</span></span>${icon()}</a>
      <a class="tg-recruit__link tg-button--line" href="#"><span class="tg-button__label"><span class="tg-button__inner">Application guidelines</span></span>${icon()}</a>
    </div>
    <div class="tg-recruit__list">
      <a class="tg-recruit__item" href="#"><span>Interested People</span>${interact()}</a>
      <a class="tg-recruit__item" href="#"><span>Career path</span>${interact()}</a>
      <a class="tg-recruit__item" href="index.html#faq"><span>Frequently asked questions</span>${interact()}</a>
    </div>
  </div>
</section>`,
    learn: `
<section class="tg-learn" data-slot="learn-more">
  <div class="tg-learn__inner">
    <h2 class="tg-learn__title">Your “Learn more about the company” line here</h2>
    <a class="tg-learn__item" href="#">
      <div class="tg-learn__img"><div class="wf-img tg-ph" data-label="Radio broadcast cover · Primary-color illustration · 1:1"></div></div>
      <div class="tg-learn__col"><p class="tg-learn__intro">Your About line here!</p><h3 class="tg-learn__ttl">Your broadcast title, first line, here<br>Second line”</h3><span class="tg-learn__badge">PODCAST</span></div>
    </a>
  </div>
</section>`,
    footer: `
<footer class="tg-footer" data-slot="footer">
  <p class="tg-footer__catch">Your first line here<br>Second line copy<br>Company Name${circle("", "")}</p>
  <a class="tg-footer__logo tg-logo" href="index.html"><span class="tg-logo__img">LOGO</span></a>
  <div class="tg-footer__menu">${NAV.map(([t, kids]) => `
    <div class="tg-footer__group" data-facc><h3 data-facc-trigger>${t}${toggle}</h3><ul>${kids.map(([k, h]) => `<li><a href="${h}">${k}</a></li>`).join("")}</ul></div>`).join("")}
    <a class="tg-footer__x" href="#"><svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h5l4.5 6.2L18 3h3l-7.1 8.1L21.5 21h-5l-5-6.8L5.6 21h-3l7.6-8.7z" fill="currentColor"/></svg>Official Account</a>
  </div>
  <div class="tg-footer__bottom"><ul><li><a href="#">Company Website</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">External transfer guide</a></li></ul><small>© COMPANY NAME Inc.</small></div>
</footer>`,
  };
  document.querySelectorAll("[data-tg]").forEach((el) => {
    const k = el.dataset.tg;
    if (k === "bg") el.outerHTML = `<div class="tg-bg" data-slot="background-ring"><div class="tg-bg__inner">${ring()}</div></div>`;
    else if (BLOCKS[k]) el.outerHTML = BLOCKS[k];
  });
  document.querySelectorAll("[data-icon]").forEach((el) => (el.outerHTML = icon()));
  document.querySelectorAll("[data-interact]").forEach((el) => (el.outerHTML = interact()));
  document.querySelectorAll("[data-circle]").forEach((el) => {
    const [w, h, l, t] = el.dataset.circle.split(",");
    el.insertAdjacentHTML("afterbegin", circle(`calc(var(--u) * ${w})`, `calc(var(--u) * ${h})`));
    const c = el.firstElementChild;
    if (l) c.style.left = `calc(var(--u) * ${l})`;
    if (t) c.style.top = `calc(var(--u) * ${t})`;
  });
  const fc = document.querySelector(".tg-footer__catch .tg-circle");
  if (fc) fc.removeAttribute("style");

  // ---------- Menu panel (under 1280) — the button turns into an X and the panel appears in .4s ----------
  const menu = document.querySelector(".tg-menu");
  const header = document.querySelector(".tg-header");
  menu?.addEventListener("click", () => {
    const on = menu.classList.toggle("is-active");
    menu.setAttribute("aria-expanded", on);
    header.classList.toggle("is-menu", on);
  });
  document.querySelectorAll(".tg-nav a").forEach((a) => a.addEventListener("click", () => { menu.classList.remove("is-active"); header.classList.remove("is-menu"); }));

  // Menu and footer accordions — measure the height and open over .4s (the original uses --collapse-height/--open-height)
  const accordion = (items, trigSel, listSel, mq) => {
    const set = () => items.forEach((it) => {
      const trig = it.querySelector(trigSel), list = it.querySelector(listSel);
      if (!matchMedia(mq).matches) { it.style.height = ""; list.style.height = ""; return; }
      if (listSel === "ul" && it.matches("[data-facc]")) list.style.height = it.classList.contains("is-open") ? `${list.scrollHeight}px` : "0px";
      else it.style.height = `${it.classList.contains("is-open") ? trig.offsetHeight + list.scrollHeight : trig.offsetHeight}px`;
    });
    // Original toggles is-open on click even on wide screens (the fold button is hidden but still works) — height folding only on narrow screens
    items.forEach((it) => it.querySelector(trigSel).addEventListener("click", () => { if (!matchMedia(mq).matches && !it.matches("[data-acc]")) return; it.classList.toggle("is-open"); set(); }));
    addEventListener("resize", set);
    set();
  };
  accordion([...document.querySelectorAll("[data-acc]")], "[data-acc-trigger]", ".tg-nav__child", "(max-width: 1279.98px)");
  accordion([...document.querySelectorAll("[data-facc]")], "[data-facc-trigger]", "ul", "(max-width: 767.98px)");

  // ---------- Subpage: once past the heading title, a gradient background is laid on the header and the logo hides ----------
  const ptitle = document.querySelector(".tg-ptitle");
  if (ptitle) {
    const fix = () => document.body.classList.toggle("is-fixed", scrollY >= ptitle.getBoundingClientRect().height);
    addEventListener("scroll", fix, { passive: true });
    fix();
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
