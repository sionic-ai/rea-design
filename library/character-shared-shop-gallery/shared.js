// Header band, mega menu, drawer, breadcrumbs, contact strip, footer, loader and character drawing shared by every page.
// Pages leave only empty spots (data-slot) and this fills them — so fixing one menu changes all five pages together.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const body = document.body;
  const page = body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Characters: round body (dome · hill · round) + eyes (dot · flower · smile · bar). flip is a character hanging upside down beneath the wave.
  //   Colors use --site- in shared.css<Name>(navy·green·pink…) — change the skin and the character changes with it
  const BODY = {
    dome: "M6 200C14 170 28 150 42 126C54 76 76 38 108 38C146 38 162 82 168 124C174 160 186 182 198 200Z",
    hill: "M0 200C6 120 50 70 100 70C150 70 194 120 200 200Z",
    round: "M100 18C150 18 186 54 186 104C186 156 150 196 98 196C48 196 14 158 14 106C14 56 50 18 100 18Z",
  };
  const EYES = {
    dot: (x, y) => `<g class="eyes-open" style="fill:var(--site-eye)"><ellipse cx="${x}" cy="${y}" rx="5.5" ry="6.5"/><ellipse cx="${x + 24}" cy="${y - 2}" rx="5.5" ry="6.5"/></g><g class="eyes-shut" style="stroke:var(--site-eye)" stroke-width="3" stroke-linecap="round"><path d="M${x - 5} ${y}h10M${x + 19} ${y - 2}h10"/></g>`,
    flower: (x, y) => [0, 26].map((dx) => `<g transform="translate(${x + dx} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="3.6" ry="6" cy="-5" style="fill:var(--site-eye)" transform="rotate(${a})"/>`).join("")}<circle r="3.4" style="fill:var(--site-yellow)"/></g>`).join(""),
    smile: (x, y) => `<g fill="none" style="stroke:var(--site-eye)" stroke-width="4" stroke-linecap="round"><path d="M${x - 7} ${y + 3}q7-9 14 0M${x + 21} ${y + 3}q7-9 14 0"/></g>`,
    bar: (x, y) => `<g style="fill:var(--site-eye)"><rect x="${x - 8}" y="${y - 4}" width="16" height="9" rx="2"/><rect x="${x + 18}" y="${y - 4}" width="16" height="9" rx="2"/></g><g style="fill:var(--site-pupil)"><rect x="${x - 6}" y="${y - 2}" width="5" height="5"/><rect x="${x + 20}" y="${y - 2}" width="5" height="5"/></g>`,
    pupil: (x, y) => `<g class="eyes-open"><circle cx="${x}" cy="${y}" r="7" style="fill:var(--site-eye)"/><circle cx="${x + 1.5}" cy="${y + 1}" r="3" style="fill:var(--site-pupil)"/><circle cx="${x + 24}" cy="${y - 2}" r="7" style="fill:var(--site-eye)"/><circle cx="${x + 25.5}" cy="${y - 1}" r="3" style="fill:var(--site-pupil)"/></g><g class="eyes-shut" style="stroke:var(--site-pupil)" stroke-width="3" stroke-linecap="round"><path d="M${x - 6} ${y}h12M${x + 18} ${y - 2}h12"/></g>`,
  };
  const EYE_AT = { dome: [96, 86], hill: [86, 108], round: [84, 84] };
  const char = (color, { shape = "dome", eyes = "dot", flip = false, cls = "" } = {}) => {
    const [x, y] = EYE_AT[shape];
    return `<svg class="h-char ${cls}" viewBox="0 0 200 200" aria-hidden="true"><g${flip ? ' transform="rotate(180 100 100)"' : ""}><path d="${BODY[shape]}" style="fill:var(--site-${color})"/>${EYES[eyes](x, y)}</g></svg>`;
  };
  // Orange blob inside the view more button
  const morePart = '<svg viewBox="0 0 90 90" aria-hidden="true"><path d="M44 6C70 4 88 22 86 46C84 70 66 86 42 84C18 82 4 64 6 42C8 20 22 7 44 6Z" style="fill:var(--site-orange)"/><circle cx="34" cy="34" r="3.2" style="fill:var(--site-navy)"/><circle cx="50" cy="32" r="3.2" style="fill:var(--site-navy)"/></svg>';
  const more = (href = "#", label = "view more") => `<a class="h-more" data-label="Your English button text here" href="${href}"><span class="h-more__text">${label}</span><span class="h-more__parts">${morePart}</span></a>`;
  window.brand = { char, more, reduce };
  document.querySelectorAll("[data-more]").forEach((el) => { el.outerHTML = more(el.dataset.more || "#", el.dataset.label); });
  document.querySelectorAll("[data-char]").forEach((el) => {
    const [color, shape, eyes, flip] = el.dataset.char.split(" ");
    el.innerHTML = char(color, { shape, eyes, flip: flip === "flip" });
  });

  const logoMark = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 6C16 1 30 3 35 11C40 19 37 33 27 37C17 41 5 36 3 26C1 17 2 10 8 6Z" fill="currentColor"/></svg>';
  const logo = (cls) => `<a class="h-logo ${cls}" href="index.html" aria-label="Back to start">${logoMark}NAME</a>`;
  document.querySelectorAll("[data-logo]").forEach((el) => { el.innerHTML = `<span class="h-logo">${logoMark}NAME</span>`; });
  const arrow = '<i><svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 3.5l4 4 4-4"/></svg></i>';
  const cartIcon = '<svg viewBox="0 0 45 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2 3h6l5 20h22l5-15H11"/><circle cx="16" cy="29" r="2.4"/><circle cx="32" cy="29" r="2.4"/></svg>';
  const sns = '<div class="h-sns"><a href="#" aria-label="SNS 1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor"/></svg></a><a href="#" aria-label="SNS 2"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4l16 16M20 4L4 20"/></svg></a><a href="#" aria-label="SNS 3"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 20V5h9a5 5 0 0 1 5 5v10h-4.5V10.5a1.5 1.5 0 0 0-1.5-1.5H9.5v11z"/></svg></a></div>';

  // ── Header bar + two mega menus + drawer ──
  const headSlot = document.querySelector('[data-slot="header"]');
  if (headSlot) {
    headSlot.outerHTML = `
<header class="h-head" data-slot="header">
  <div class="h-head__in">
    ${logo("h-head__logo")}
    <nav class="h-head__nav">
      <ul class="h-head__list">
        <li><span class="h-head__link" data-mega="items">menu 1${arrow}</span></li>
        <li><span class="h-head__link" data-mega="events">menu 2${arrow}</span></li>
        <li><a class="h-head__link" href="product.html">menu 3</a></li>
        <li><a class="h-head__link" href="about.html">menu 4</a></li>
        <li><a class="h-head__link" href="about.html">menu 5</a></li>
        <li><a class="h-head__link" href="about.html">menu 6</a></li>
        <li><a class="h-head__link" href="#contact">menu 7</a></li>
      </ul>
      <a class="h-head__cart" href="#" aria-label="Cart">${cartIcon}</a>
      <button class="h-burger" type="button" aria-label="Open Menu" data-drawer-open><span></span><span></span><span></span></button>
    </nav>
  </div>
</header>
<div class="h-mega" data-mega-panel="items" data-slot="mega-items">
  <div class="h-overlay" data-mega-close></div>
  <div class="h-mega__card">
    <h3 class="h-mega__title"><span class="en">menu 1</span> <small>/ Your category title here</small></h3>
    <div class="h-mega__grid" data-label="Your product category name (English) here">${["all items", "category 1", "category 2", "category 3", "category 4", "category 5", "category 6", "category 7", "category 8", "category 9", "category 10"].map((t) => `<a href="product.html">- ${t}</a>`).join("")}</div>
  </div>
</div>
<div class="h-mega" data-mega-panel="events" data-slot="mega-events">
  <div class="h-overlay" data-mega-close></div>
  <div class="h-mega__card">
    <h3 class="h-mega__title"><span class="en">menu 2</span> <small>/ Your event title here</small></h3>
    <div class="h-mega__events">${[1, 2].map((n) => `<a class="h-mega__event" href="#"><span class="wf-img" data-label="Event poster ${n} · Light solid-color graphic · 3:2 landscape"></span><span><time class="en">2026.00.00</time><p>Your event title in about two lines. Your period in one line.</p></span></a>`).join("")}</div>
  </div>
</div>
<div class="h-drawer" data-slot="drawer">
  <div class="h-overlay" data-drawer-close></div>
  <div class="h-drawer__panel">
    <button class="h-close" type="button" aria-label="Close Menu" data-drawer-close><span></span><span></span></button>
    <div class="h-drawer__logo">${logo("")}</div>
    <div class="h-drawer__group">
      <h3 class="h-drawer__head">Your group title 1 here</h3>
      <details><summary><b>menu 1</b>/ Find products<i><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 4l5 5 5-5"/></svg></i></summary>
        <div class="h-drawer__sub" data-label="Your product category name (English) here">${["all items", "category 1", "category 2", "category 3", "category 4", "category 5"].map((t) => `<a href="product.html">${t}</a>`).join("")}</div></details>
      <details><summary><b>menu 2</b>/ Find events<i><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 4l5 5 5-5"/></svg></i></summary>
        <div class="h-drawer__sub"><p style="font-size:13px">One line for when no events are currently open</p></div></details>
      <a class="h-drawer__row" href="product.html"><b>menu 3</b>/ Find members</a>
      <a class="h-drawer__row" href="about.html"><b>menu 4</b>/ About</a>
    </div>
    <div class="h-drawer__group">
      <h3 class="h-drawer__head">Your group title 2 here</h3>
      <ul class="h-drawer__texts"><li><a href="#">Shelf usage guide</a></li><li><a href="#">Event guide</a></li></ul>
    </div>
    <ul class="h-drawer__subnav"><li><a href="#">Shop Info</a></li><li><a href="#">Usage guide</a></li><li><a href="news.html">News</a></li></ul>
    <div class="h-drawer__btn"><a class="h-bbtn en" href="#contact">contact</a></div>
    ${sns}
  </div>
</div>`;
  }
  const head = document.querySelector(".h-head");

  // Mega menu: clicking the same word again or the backdrop closes it
  let openMega = null;
  const setMega = (name) => {
    document.querySelectorAll("[data-mega-panel]").forEach((p) => p.classList.toggle("is-open", p.dataset.megaPanel === name));
    openMega = name;
  };
  document.querySelectorAll("[data-mega]").forEach((t) => t.addEventListener("click", () => setMega(openMega === t.dataset.mega ? null : t.dataset.mega)));
  document.querySelectorAll("[data-mega-close]").forEach((o) => o.addEventListener("click", () => setMega(null)));

  const drawer = document.querySelector(".h-drawer");
  const setDrawer = (open) => {
    drawer.classList.toggle("is-open", open);
    body.classList.toggle("is-locked", open);
    if (open) setMega(null);
  };
  document.querySelectorAll("[data-drawer-open]").forEach((b) => b.addEventListener("click", () => setDrawer(true)));
  document.querySelectorAll("[data-drawer-close]").forEach((b) => b.addEventListener("click", () => setDrawer(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setDrawer(false); setMega(null); } });

  // ── Breadcrumbs ──
  const crumb = document.querySelector('[data-slot="breadcrumb"]');
  if (crumb) {
    const steps = crumb.dataset.crumb.split("|");
    crumb.className = "h-crumb";
    crumb.innerHTML = `<ol><li><a class="en" href="index.html">top</a></li>${steps.map((s, i) => {
      const [label, href] = s.split(">");
      return `<li>${href && i < steps.length - 1 ? `<a href="${href}">${label}</a>` : `<span>${label}</span>`}</li>`;
    }).join("")}</ol>`;
  }

  // ── Consultation Band ──
  const sticky = document.querySelector('[data-slot="sticky-banner"]');
  if (sticky) {
    sticky.className = "h-sticky is-hidden";
    sticky.innerHTML = `<div class="h-sticky__body">
      <p class="h-sticky__text">Your exhibition guide, one line, here</p>
      <div class="h-sticky__btns"><a class="h-sticky__btn" href="#">Shelf Usage<br class="h-sp"> Get a consultation</a><a class="h-sticky__btn" href="#">Event use<br class="h-sp"> Get a consultation</a></div>
      <div class="h-sticky__char">${char("navy", { eyes: "dot" })}</div>
    </div>`;
  }

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "h-foot";
    foot.innerHTML = `<div class="h-foot__in">
      <div class="h-foot__data"><div class="h-foot__logo">${logo("")}</div>${sns}</div>
      <div class="h-foot__nav">
        <div class="h-foot__main">
          <dl><dt>Your group title 1 here</dt><dd><a href="product.html">menu 1</a></dd><dd><a href="#">menu 2</a></dd><dd><a href="product.html">menu 3</a></dd><dd><a href="about.html">menu 4</a></dd></dl>
          <dl><dt>Your group title 2 here</dt><dd><a href="#" style="font-family:var(--kf-font-sans)">Shelf usage guide</a></dd><dd><a href="#" style="font-family:var(--kf-font-sans)">Event guide</a></dd></dl>
        </div>
        <ul class="h-foot__text"><li><a href="#">Shop Info</a></li><li><a href="#">Usage guide</a></li><li><a href="news.html">News</a></li><li><a href="#">Inquiry</a></li><li><a href="#">Operating company</a></li></ul>
        <ul class="h-foot__text"><li><a href="#">Purchase terms of use</a></li><li><a href="#">Returns and exchanges info</a></li><li><a href="#">Legal disclosure</a></li><li><a href="#">Privacy policy</a></li></ul>
        <div class="h-foot__pay" aria-label="Payment method logo slot"><span>PAY</span>${[34, 34, 30, 26, 26, 26, 22, 30].map((w) => `<span style="width:${w}px"></span>`).join("")}</div>
      </div>
    </div>
    <p class="h-foot__note">Your one-line small notice, like a support program announcement, goes here.</p>
    <p class="h-foot__copy en">2026 © COMPANY NAME. All Rights Reserved.</p>`;
  }

  // ── First-visit loader (in the first page document, once per session) — from the second visit on, the title rises 1.1s right after it lifts ──
  const firstVisit = page === "home" && !reduce && sessionStorage.getItem("brand-visited") !== "1";
  if (page === "home") sessionStorage.setItem("brand-visited", "1");
  const loader = document.querySelector(".h-loader");
  if (loader && !firstVisit) loader.remove();
  if (loader && firstVisit) {
    body.classList.add("is-locked");
    setTimeout(() => { body.classList.remove("is-locked"); }, 4600);
    setTimeout(() => loader.remove(), 5200);
  }
  // Time the Hero sequence waits (after the loader ends)
  brand.introDelay = page === "home" ? (firstVisit ? 4.9 : 1.1) : 0.3;
  brand.firstVisit = firstVisit;

  // Home header band appears only after scrolling more than 50px (hero shows only the block panel). Other pages show it from the start
  const syncHead = () => head?.classList.toggle("is-visible", page !== "home" || scrollY > 50);
  addEventListener("scroll", syncHead, { passive: true });
  const showChrome = () => {
    syncHead();
    sticky?.classList.remove("is-hidden");
  };
  if (reduce) showChrome();
  else setTimeout(showChrome, page === "home" ? (firstVisit ? 4600 : 600) : 100);

  // Consultation strip hides when the bottom (character hill·footer) is visible
  const end = document.querySelector('[data-slot="characters"]') || foot;
  if (sticky && end) {
    ScrollTrigger.create({
      trigger: end, start: "top bottom",
      onEnter: () => sticky.classList.add("is-hidden"),
      onLeaveBack: () => sticky.classList.remove("is-hidden"),
    });
  }
})();
