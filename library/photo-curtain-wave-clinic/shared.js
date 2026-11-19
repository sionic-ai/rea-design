// Shared across the whole site — plugs the header, phone MENU panel, booking section, sitemap footer and floating banner into every page with the same markup,
// Attaches reveal (.fade-in GSAP .7s · .fade-in-step 1s stagger), collapsible rows (.2s ease-out), side nav sticking, banner close and photo parallax (simpleParallax 1.1)
(() => {
  const arw = '<span class="sk-arw" aria-hidden="true"><i></i></span>';
  const page = document.body.dataset.page || "home";
  const emblem = '<svg viewBox="0 0 22 22" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="11" cy="11" r="3"/><circle cx="11" cy="4.2" r="3.2"/><circle cx="17.5" cy="8.9" r="3.2"/><circle cx="15" cy="16.6" r="3.2"/><circle cx="7" cy="16.6" r="3.2"/><circle cx="4.5" cy="8.9" r="3.2"/></g></svg>';
  const logo = (tag = "a") => `<${tag} class="sk-logo" ${tag === "a" ? 'href="index.html"' : ""} data-label="Hospital logo — flower-shaped emblem + institution name in serif on two lines">${emblem}<span class="sk-logo__txt"><span class="sk-logo__sub">Social Welfare Corporation</span><span class="sk-logo__name">Your hospital name here<small>Preventive Medical Center</small></span></span></${tag}>`;
  const sub = (n, start = 1) => Array.from({ length: n }, (_, i) => `<li><a class="sk-mega__link" href="service.html">${arw}<span class="sk-ul"><span>Sub Menu ${String(start + i).padStart(2, "0")}</span></span></a></li>`).join("");
  const navLink = (href, label, key, row2) => `<a class="sk-nav__link${row2 ? " sk-nav__sub" : ""} sk-ul is-in${key === page ? " is-active" : ""}" href="${href}"><span>${label}</span></a>`;

  const header = `
  <div class="sk-head__in">
    ${logo()}
    <nav class="sk-nav" aria-label="Main menu">
      <ul class="sk-nav__row">
        <li>${navLink("service.html", "Menu 1 Full checkup", "service")}
          <div class="sk-mega"><div class="sk-mega__in"><ul class="sk-mega__col">${sub(7)}</ul><ul class="sk-mega__col">${sub(5, 8)}</ul></div></div>
        </li>
        <li>${navLink("service.html", "Menu 2 Aftercare", "")}</li>
        <li>${navLink("about.html", "Menu 3 Center About", "about")}</li>
        <li>${navLink("service.html", "Menu 4 Treatment flow", "")}</li>
        <li><a class="sk-resv" href="index.html#reservation"><span>Booking info</span></a></li>
      </ul>
      <ul class="sk-nav__row is-sub">
        <li>${navLink("about.html", "Directions", "", 1)}</li>
        <li>${navLink("news.html", "Column", "news", 1)}</li>
        <li>${navLink("index.html#reservation", "Inquiry", "", 1)}</li>
        <li><a class="sk-nav__link sk-nav__sub sk-ul is-in sk-lang" href="index.html" lang="en"><span>Language</span><svg viewBox="0 0 8 8" aria-hidden="true"><path d="M1 2.5l3 3 3-3" fill="none" stroke="currentColor"/></svg></a></li>
      </ul>
    </nav>
  </div>`;

  const groups = [
    ["About the Center", "about.html", 5],
    ["Full checkup / Detailed checkup", "service.html", 12],
    ["Additional Exam", "service.html", 15],
    ["Health checkup", "service.html", 0],
    ["Group checkup", "service.html", 0],
    ["Treatment Flow", "service.html", 0],
    ["Aftercare", "service.html", 3],
  ];
  const tail = ["Directions", "News", "Frequently asked questions", "Sitemap", "Privacy policy", "Inquiry"];
  const mapLink = (href, label) => `<a href="${href}" class="sk-ilink">${arw}<span class="sk-ulb"><span>${label}</span></span></a>`;
  const dl = '<li><a class="sk-map__dl" href="news.html"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1v8M3.5 5.5 7 9l3.5-3.5M1.5 12.5h11" fill="none" stroke="currentColor" stroke-width="1.3"/></svg><span class="sk-ulb"><span>Clinic calendar (PDF)</span></span></a></li><li><a class="sk-map__dl" href="about.html"><svg viewBox="0 0 14 14" aria-hidden="true"><path d="M6 2H2v10h10V8M8.5 2H12v3.5M12 2 6.5 7.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg><span class="sk-ulb"><span>Jump to main branch</span></span></a></li>';
  const mapCol = (items, extra = "") => `<ul class="sk-map__col">${items.map(([label, href, n]) => `<li>${mapLink(href, label)}${n ? `<ul>${Array.from({ length: n }, (_, i) => `<li>${mapLink(href, `Sub Link ${String(i + 1).padStart(2, "0")}`)}</li>`).join("")}</ul>` : ""}</li>`).join("")}${extra}</ul>`;
  const acc = (label, href, n) => n
    ? `<li><details class="sk-acc"><summary><span class="sk-acc__row"><a href="${href}">${arw} ${label}</a><span class="sk-acc__icon" data-acc-toggle><i></i><i></i></span></span></summary><div class="sk-acc__body"><ul>${Array.from({ length: n }, (_, i) => `<li><a href="${href}">Sub Link ${String(i + 1).padStart(2, "0")}</a></li>`).join("")}</ul></div></details></li>`
    : `<li><span class="sk-acc__row"><a href="${href}">${arw} ${label}</a></span></li>`;
  const accList = () => groups.map(([l, h, n]) => acc(l, h, Math.min(n, 6))).join("") + `<li class="sk-acc__tail">${tail.map((t) => `<a href="index.html">${t}</a>`).join("")}</li>`;

  const spMenu = `
  <button class="sk-sp__btn" type="button" aria-expanded="false" aria-controls="sk-sp-panel"><span class="sk-sp__icon" aria-hidden="true"><i></i><i></i><i></i></span><b lang="en"></b></button>
  <nav class="sk-sp__panel" id="sk-sp-panel" aria-label="Phone menu">
    <div class="sk-sp__top">${logo()}<a class="sk-nav__link sk-lang" href="index.html" lang="en"><span>Language</span></a></div>
    <ul class="sk-sp__list">${accList()}</ul>
  </nav>`;

  const footer = `
  <section class="sk-resv-sec" id="reservation" data-slot="reservation">
    <div class="sk-h2 sk-h2--center"><p class="sk-h2__en" lang="en">Appointments</p><h2 class="sk-h2__jp">Booking · Contact</h2></div>
    <p class="t">Your one-line reservation note goes here. Please reserve by phone.</p>
    <a href="tel:000-000-0000" lang="en">000-000-0000</a>
    <p class="h">Hours : weekdays 0:00 ~ 00:00 ※ closed on weekends and holidays</p>
    <a class="sk-resv-btn" href="about.html"><b>Contact Us</b><span>Your contact notice in one line here</span><span class="sk-pill-arw is-light">${arw}</span></a>
  </section>
  <aside class="sk-map" data-slot="sitemap">
    ${logo()}
    <address>〒000-0000 Your address goes here in one line / TEL : 000-000-0000 (main)</address>
    <div class="sk-map__cols">
      ${mapCol(groups.slice(0, 1))}${mapCol(groups.slice(1, 2))}${mapCol(groups.slice(2, 3))}${mapCol(groups.slice(3, 7))}${mapCol(tail.map((t) => [t, "index.html", 0]), dl)}
    </div>
    <ul class="sk-map__acc"><li class="sk-h2 sk-h2--center"><p class="sk-h2__en" lang="en">Sitemap</p><p class="sk-h2__jp">Sitemap</p></li>${accList()}</ul>
  </aside>
  <p class="sk-copy" lang="en">© Placeholder Clinic Name. All right reserved.</p>`;

  const banner = `
  <a class="sk-bnr__link" href="service.html"><div class="wf-img" data-label="New inspection equipment notice banner · white equipment photo + short copy · landscape 5:3"></div></a>
  <button class="sk-bnr__close" type="button" aria-label="Close banner"><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.6"/></svg></button>`;

  const fill = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; return el; };
  fill('[data-slot="header"]', header);
  const sp = fill('[data-slot="sp-menu"]', spMenu);
  fill('[data-slot="footer"]', footer);
  const bnr = fill('[data-slot="banner"]', banner);

  // Phone MENU — the panel rises from below (100vh) in .6s, and sitemap lines float up in .05s order starting at .75s (CSS)
  if (sp) {
    const btn = sp.querySelector(".sk-sp__btn");
    btn.addEventListener("click", () => {
      const open = sp.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("sk-lock", open);
    });
    sp.querySelectorAll(".sk-sp__panel a").forEach((a) => a.addEventListener("click", () => { sp.classList.remove("is-open"); document.documentElement.classList.remove("sk-lock"); }));
  }

  // Banner close (original close.js) — fades out moving 5px down in .3s
  bnr?.querySelector(".sk-bnr__close")?.addEventListener("click", () => { bnr.classList.add("is-close"); bnr.setAttribute("aria-hidden", "true"); });

  // Accordion row (original setUpAccordion) — pressing ＋ opens and closes height and opacity with .2s ease-out
  document.querySelectorAll(".sk-acc").forEach((d) => {
    const body = d.querySelector(".sk-acc__body");
    const toggle = d.querySelector("[data-acc-toggle]");
    let running = false;
    d.querySelector("summary").addEventListener("click", (e) => {
      if (!e.target.closest("[data-acc-toggle]")) { if (e.target.closest("a")) return; }
      e.preventDefault();
      if (running) return;
      running = true;
      const timing = { duration: 200, easing: "ease-out" };
      if (d.open) {
        d.classList.toggle("is-opened");
        const a = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: 0, opacity: 0 }], timing);
        a.onfinish = () => { d.removeAttribute("open"); running = false; };
      } else {
        d.setAttribute("open", "true");
        d.classList.toggle("is-opened");
        const a = body.animate([{ height: 0, opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], timing);
        a.onfinish = () => { running = false; };
      }
    });
    toggle?.setAttribute("role", "button");
  });

  // Side nav — releases when scrolling down and sticks when scrolling up (original js-sticky · .3s appear)
  const side = document.querySelector(".sk-side__nav");
  if (side) {
    let last = scrollY;
    addEventListener("scroll", () => { side.classList.toggle("is-sticky", scrollY <= last); last = scrollY; }, { passive: true });
  }

  // Photo parallax — simpleParallax 5.6.2 as in the original, 1.1x
  if (window.simpleParallax) {
    const imgs = document.querySelectorAll("[data-parallax]");
    if (imgs.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) new simpleParallax(imgs, { scale: 1.1 });
  }

  // Appear — original gsapStyle: .fade-in goes from opacity 0 · y 20 over .7s (ScrollTrigger.batch, start "100px bottom", once), .fade-in-step gets is-show when it reaches the bottom of the screen
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(".sk-fade", { opacity: 0, y: 20 });
      ScrollTrigger.batch(".sk-fade", { onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.7 }), start: "100px bottom", once: true });
      document.querySelectorAll(".sk-step").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: () => el.classList.add("is-show") }));
    });
    mm.add("(prefers-reduced-motion: reduce)", () => { document.querySelectorAll(".sk-step").forEach((el) => el.classList.add("is-show")); });
  }
})();
