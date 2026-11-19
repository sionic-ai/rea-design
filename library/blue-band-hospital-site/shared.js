// Cross-page parts — draws in the header · drawer · quick menu · contact section · footer, MENU button hide/show, accordion · tabs,
// Applies smooth anchor movement (smooth-scroll) and sticky sidebar (sticky-sidebar) with the original values.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Symbols, like the original <use> called up by reference — the stroke color follows currentColor inside the symbol
  const SYM = {
    arrow: '<path d="M9 5l7 7-7 7"/>',
    long: '<path d="M0 6.5h16L10.5 1"/>',
    down: '<path d="M5 9l7 7 7-7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    doc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    tel: '<path d="M5 3h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A18 18 0 013 5a2 2 0 012-2z"/>',
    pin: '<path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    stop: '<path d="M9 6v12M15 6v12"/>',
  };
  document.body.insertAdjacentHTML("afterbegin", `<svg class="yg-sprite" aria-hidden="true">${Object.entries(SYM).map(([k, d]) => `<symbol id="yg-i-${k}" viewBox="${k === "long" ? "0 0 17 7" : "0 0 24 24"}" fill="none" stroke="currentColor">${d}</symbol>`).join("")}</svg><a class="yg-skip" href="#main">Skip to content</a>`);
  const I = Object.fromEntries(Object.keys(SYM).map((k) => [k, `<svg class="yg-ico${k === "long" ? " -long" : ""}" aria-hidden="true"><use href="#yg-i-${k}"/></svg>`]));
  window.ygIcon = I;
  const mark = '<svg viewBox="0 0 68 60" aria-hidden="true"><path d="M34 4c6 8 7 18 0 28-7-10-6-20 0-28z"/><path d="M4 30c10-4 20-2 27 6-10 4-20 2-27-6z"/><path d="M64 30c-10-4-20-2-27 6 10 4 20 2 27-6z"/><path d="M33 38c-3 7-2 13 2 18 3-6 2-12-2-18z"/></svg>';
  const logo = (tag = "a") => `<${tag} class="yg-h__logo" href="index.html">${mark}<span class="yg-h__name"><b>City general medical center name</b><small>Hospital Name Here</small></span></${tag}>`;

  const SUB = [["recruit.html", "Trainees & residents", I.user], ["recruit.html", "Hiring Info", I.doc], ["news.html", "News", I.info], ["#guide", "Inquiry", I.mail], ["#", "Access support", I.eye]];
  const MAIN = [["about.html", "About the Hospital"], ["index.html#main-list", "Outpatient Guide"], ["index.html#main-list", "Admission · Visiting"], ["index.html#main-list", "Health care center"], ["index.html#department", "Department"], ["index.html#department", "Division"], ["page.html", "Community medical coordination office"]];

  const header = () => `
    <div class="yg-h__in">
      ${logo()}
      <nav class="yg-h__nav" aria-label="Main menu">
        <ul class="yg-h__sub">${SUB.map(([h, t, i]) => `<li><a href="${h}">${i}${t}</a></li>`).join("")}</ul>
        <ul class="yg-h__main">${MAIN.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      </nav>
    </div>`;
  const menubtn = () => `<button id="global-header" class="yg-menubtn" type="button" aria-controls="navigation" aria-expanded="false" aria-label="Open Menu"><span class="yg-menubtn__line"><span></span></span><span class="yg-menubtn__text" data-menu-text>MENU</span></button>`;
  const col = (title, items) => `<div><h3>${title}</h3><ul>${items.map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></div>`;
  const menu = () => `
    <ul class="yg-menu__support">${SUB.map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
    <div class="yg-menu__in">
      ${logo()}
      <ul class="yg-menu__main">${[["index.html", "First Page"], ...MAIN].map(([h, t]) => `<li><a href="${h}">${t}${I.arrow}</a></li>`).join("")}</ul>
      <div class="yg-menu__lists">
        ${col("About the Hospital", ["Director’s greeting", "Hospital features", "Hospital Overview", "Directions"])}
        ${col("Outpatient Guide", ["First-time visitors", "Outpatient schedule", "Closure Info", "Frequently asked questions"])}
        ${col("Admission · Visiting", ["Hospitalization Guide", "Hospital visit guide", "Hospital Stay Costs", "Amenities"])}
        ${col("Medical professionals", ["Partner info", "Training guide", "Hiring Info", "Research information disclosure"])}
      </div>
      <div class="yg-banners"><a class="yg-banner wf-img" href="#" data-label="Treatment banner 1 · logo + photo · landscape 3.2:1"></a><a class="yg-banner wf-img" href="#" data-label="Treatment banner 2 · logo + photo · landscape 3.2:1"></a></div>
    </div>`;

  const quick = () => `
    <button class="yg-quick__head" type="button" aria-expanded="false" aria-controls="quick-menu-state">Quick Menu${I.down}</button>
    <div class="yg-quick__body" id="quick-menu-state" hidden>
      <div class="yg-quick__inner">
        <p class="yg-quick__search">${I.search}<span>Enter a keyword</span><b>Search</b></p>
        <div class="yg-quick__btns"><a href="#">${I.cal}Outpatient schedule</a><a href="#">${I.clock}Closure Info</a><a href="#guide">${I.tel}Call us</a><a href="#">${I.pin}Directions</a></div>
        <ul class="yg-quick__links"><li><a href="index.html#main-list">Outpatient Guide</a></li><li><a href="index.html#main-list">Hospitalization Guide</a></li><li><a href="index.html#department">Departments · Divisions</a></li><li><a href="about.html">About the Hospital</a></li><li><a href="#">Frequently asked questions</a></li><li><a href="#guide">Inquiry</a></li></ul>
      </div>
    </div>`;

  const guide = () => `
    <div class="yg-wrap yg-guide__grid">
      <div class="yg-guide__col -wide">
        <h2>Contact by Phone</h2>
        <p class="yg-guide__tel">${I.tel}0000-000000</p>
        <p class="yg-guide__note">Your one line here: the info line connects to an automated response.</p>
        <div class="yg-guide__navi"><p><b>1</b>Guide number one</p><p><b>4</b>Guide number four</p><p><b>2</b>Guide number two</p><p><b>5</b>Guide number five</p><p><b>3</b>Guide number three</p><p><b>6</b>Guide number six</p></div>
        <p class="yg-guide__note -red">※ One line here cautioning about inquiries outside business hours</p>
      </div>
      <div class="yg-guide__col">
        <h2>Outpatient Guide</h2>
        <span class="yg-badge">Reception Hours</span>
        <dl class="yg-hours"><dt>Weekday</dt><dd><small>Morning</small>8:30 – 11:30</dd><dt></dt><dd><small>Afternoon</small>13:30 – 15:30</dd></dl>
        <p class="yg-guide__note">Two lines for closed days and reservation info.</p>
        <a class="yg-btn" href="#">View outpatient schedule${I.long}</a>
      </div>
      <div class="yg-guide__col">
        <h2>Visitor and hospital visit info</h2>
        <span class="yg-badge">Visiting hours</span>
        <dl class="yg-hours"><dt>Daily</dt><dd>13:00 – 17:00</dd></dl>
        <p class="yg-guide__note">Two lines here on visiting conditions and the headcount limit.</p>
        <a class="yg-btn" href="#">View details${I.long}</a>
      </div>
    </div>`;

  const footer = () => `
    <div class="yg-wrap">
      <div class="yg-f__grid">
        <div class="yg-f__info">
          ${logo()}
          <p class="yg-f__addr">〒000-0000<br>Your one-line hospital address here</p>
          <p class="yg-f__btns"><a href="#">Directions</a><a href="#">Map app</a></p>
          <p class="yg-f__tel"><span><small>Representative</small>0000-000000</span><span><small>Night</small>000-000-0000</span></p>
        </div>
        <ul class="yg-f__nav">${[["index.html", "First Page"], ...MAIN, ["recruit.html", "Hiring Info"], ["news.html", "News"]].map(([h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul>
      </div>
      <div class="yg-banners"><a class="yg-banner wf-img" href="#" data-label="Treatment banner 1 · logo + photo · landscape 3.2:1"></a><a class="yg-banner wf-img" href="#" data-label="Treatment banner 2 · logo + photo · landscape 3.2:1"></a></div>
      <div class="yg-f__bottom"><ul><li><a href="#">Sitemap</a></li><li><a href="#">Privacy policy</a></li><li><a href="#">Site usage guide</a></li><li><a href="#">Accessibility</a></li></ul><p>© 0000 Hospital Name</p></div>
    </div>`;

  const fill = (sel, html) => document.querySelectorAll(sel).forEach((el) => !el.dataset.filled && ((el.innerHTML = html()), (el.dataset.filled = "1")));
  fill('[data-slot="header"]', header);
  fill('[data-slot="menu-button"]', menubtn);
  fill('[data-slot="menu-drawer"]', menu);
  fill('[data-slot="quick-menu"]', quick);
  fill('[data-slot="guide"]', guide);
  fill('[data-slot="footer"]', footer);
  document.querySelectorAll("[data-menubtn-wrap]").forEach((w) => w.replaceWith(...w.childNodes));

  // ── Drawer: opened and closed via aria (panel css 600ms) ──
  const btn = document.getElementById("global-header"), drawer = document.getElementById("navigation");
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    drawer.setAttribute("aria-hidden", String(open));
    btn.setAttribute("aria-label", open ? "Open Menu" : "Close Menu");
    btn.querySelector("[data-menu-text]").textContent = open ? "MENU" : "CLOSE";
  });
  addEventListener("keydown", (e) => e.key === "Escape" && btn.getAttribute("aria-expanded") === "true" && btn.click());

  // ── MENU button: hides when scrolled down past the header height, reappears .3s after scrolling up ──
  (() => {
    const head = document.querySelector(".yg-h"), s = { startPosi: 0, upFlg: false, setTimeoutFlg: false, setTimeoutId: 0 };
    const swap = (rm, add) => { btn.classList.remove(rm); btn.classList.add(add); };
    const on = () => {
      const h = head ? head.offsetHeight : 140, y = scrollY || document.documentElement.scrollTop;
      if (s.startPosi < y) {
        s.upFlg = false; clearTimeout(s.setTimeoutId); s.setTimeoutFlg = false;
        if (h < y) btn.classList.add("-fix");
        if (document.documentElement.scrollHeight <= innerHeight + y) swap("-hide", "-show");
        else if (btn.classList.contains("-show")) swap("-show", "-hide");
      } else {
        s.upFlg = true;
        if (y <= 0) btn.classList.remove("-fix", "-show", "-hide");
        else if (!s.setTimeoutFlg) {
          s.setTimeoutFlg = true;
          s.setTimeoutId = setTimeout(() => { if (s.upFlg && btn.classList.contains("-fix")) swap("-hide", "-show"); s.setTimeoutFlg = false; }, 300);
        }
      }
      s.startPosi = y;
    };
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
  })();

  // ── Quick menu: opens and closes height auto with .8s power3.out ──
  const qm = document.querySelector(".yg-quick");
  if (qm) {
    const head = qm.querySelector(".yg-quick__head"), body = qm.querySelector(".yg-quick__body");
    const open = () => { head.setAttribute("aria-expanded", "true"); qm.classList.add("-opened"); body.removeAttribute("hidden"); gsap.fromTo(body, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: reduce ? 0 : 0.8, ease: "power3.out", overwrite: true }); };
    const close = () => { head.setAttribute("aria-expanded", "false"); qm.classList.remove("-opened"); gsap.to(body, { height: 0, opacity: 0, duration: reduce ? 0 : 0.8, ease: "power3.out", overwrite: true, onComplete: () => body.setAttribute("hidden", "") }); };
    head.addEventListener("click", () => (qm.classList.contains("-opened") ? close() : open()));
    window.ygQuick = { open, close, el: qm };
  }

  // ── Accordion (.8s power3.out) ──
  document.querySelectorAll("[data-accordion] > button").forEach((b) => {
    const c = document.getElementById(b.getAttribute("aria-controls"));
    if (!c) return;
    b.setAttribute("aria-expanded", "false");
    b.addEventListener("click", () => {
      const o = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(o));
      b.classList.toggle("-opened", o);
      if (o) { c.removeAttribute("hidden"); gsap.fromTo(c, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.8, ease: "power3.out", overwrite: true }); }
      else gsap.to(c, { height: 0, opacity: 0, duration: 0.8, ease: "power3.out", overwrite: true, onComplete: () => c.setAttribute("hidden", "") });
    });
  });

  // ── Tabs: only that panel on press or focus, move with left and right arrows ──
  document.querySelectorAll('[role="tablist"]').forEach((list) => {
    const tabs = [...list.querySelectorAll('[role="tab"]')];
    let i = 0;
    const pick = (t) => {
      tabs.forEach((x) => { x.setAttribute("tabindex", "-1"); x.setAttribute("aria-selected", "false"); document.getElementById(x.getAttribute("aria-controls"))?.classList.add("-hidden"); });
      t.setAttribute("tabindex", "0"); t.setAttribute("aria-selected", "true");
      document.getElementById(t.getAttribute("aria-controls"))?.classList.remove("-hidden");
    };
    tabs.forEach((t) => { t.addEventListener("click", () => pick(t)); t.addEventListener("focus", () => pick(t)); });
    list.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      i = (i + (e.key === "ArrowLeft" ? tabs.length - 1 : 1)) % tabs.length;
      tabs[i].focus();
    });
  });

  // ── Anchor move: original smooth-scroll (speed 100, by length) · sidebar: sticky-sidebar (top 120) ──
  if (window.SmoothScroll && !reduce) new SmoothScroll('a[href^="#"]:not([href="#"])', { updateURL: false, speed: 100, speedAsDuration: true, offset: () => (matchMedia("(min-width: 768px)").matches ? 71 : 58) });
  if (window.StickySidebar && document.getElementById("yg-sidebar") && matchMedia("(min-width: 768px)").matches)
    new StickySidebar("#yg-sidebar", { topSpacing: 120, bottomSpacing: 0, containerSelector: "#yg-content", innerWrapperSelector: "#yg-sidebar-inner" });

  // Flowing white curve — drawn (power4.inOut), then immediately erased the opposite way while flowing sideways, rests 8 seconds and repeats.
  // Original, when erasing "power4.Out"(uppercase) so GSAP can’t find the curve and runs the default power1.out — matching the actual motion as power1.out

  window.ygLine = (svg, { len, draw, erase, travel, from, to, trigger }) => {
    if (!svg || reduce) return;
    const path = svg.querySelectorAll("path");
    const st = trigger ? { trigger: svg, start: "top 80%", end: "bottom 20%", toggleActions: "play none none none" } : undefined;
    gsap.timeline({ scrollTrigger: st, repeat: -1, repeatDelay: 8 })
      .fromTo(path, { strokeDasharray: len + "px", strokeDashoffset: len + "px", autoAlpha: 1 }, { duration: draw, strokeDashoffset: 0, ease: "power4.inOut" })
      .to(path, { duration: 0, strokeDashoffset: 2 * len + "px" })
      .to(path, { duration: erase, strokeDashoffset: len + "px", ease: "power1.out" });
    gsap.set(svg, { opacity: 1 });
    gsap.timeline({ scrollTrigger: st && { trigger: svg, toggleActions: "play none none none" }, repeat: -1, repeatDelay: 8 }).fromTo(svg, { x: from }, { duration: travel, x: to });
  };
})();
