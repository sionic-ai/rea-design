// Draws the header · mega menu · drawer · contact strip · banner · footer identically on every page, and applies the common motion (line rise · blur clear · logo invert).
// The home page starts its entrance motion after the loader lifts (gp:loaded) — same place as the original loading:exit.
(() => {
  const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2.5 8h11M9.5 4l4 4-4 4"/></svg>';
  const btn = (label, href, cls = "") => `<a class="gp-btn ${cls}" href="${href}" data-fx="pulse-dot-btn"><span data-fx-part="dot"></span><span data-fx-part="label">${label}</span><span data-fx-part="arrow">${ARROW}</span></a>`;
  const LOGO = `<svg viewBox="0 0 137 63" aria-hidden="true">
    <g class="gp-logo__mark" fill="none" stroke="currentColor" stroke-width="1">
      <path d="M22 9 39 26 22 43 5 26Z"/><path d="M22 13 35 26 22 39 9 26Z" opacity=".8"/><path d="M22 17 31 26 22 35 13 26Z" opacity=".65"/>
      <path d="M22 21 27 26 22 31 17 26Z" opacity=".5"/><path d="M5 26h34M22 9v34" opacity=".35"/>
    </g>
    <text x="44" y="38" fill="currentColor" font-size="40" class="gp-logo__word">SN</text>
    <text x="45" y="56" fill="currentColor" font-size="15" class="gp-logo__small">studio name</text>
  </svg>`;
  const MENU = [
    { label: "Our way of thinking", href: "about.html" },
    { label: "Services offered", href: "service.html", mega: { cls: "", cards: [["Corporate clients", "Staff member in work clothes consulting with a tablet · Indoors · Landscape"], ["Individual Customer", "Client consulting at home · natural light · landscape"]], list: ["Our Construction Design", "Service list", "Why people choose us", "Project record and customer voices", "Model Work"] } },
    { label: "Company info", href: "about.html#intro", mega: { cls: "is-company", cards: [["Corporate Philosophy", "Meeting room by the window · B&W · portrait"], ["Message from the CEO", "CEO upper body · suit · black and white"]], list: ["Company overview", "History", "Company in Numbers", "About the Branch", "Staff Introduction"] } },
    { label: "Hiring Info", href: "recruit.html", mega: { cls: "is-recruit", cards: [["Hiring message", "Site staff from behind · bright day · portrait"]], list: ["Hiring overview", "Work style", "Desired Talent", "Staff Interview", "Application guidelines"] } },
    { label: "Column post", href: "news.html" },
    { label: "Notices", href: "news.html#news" },
  ];
  const mega = (m, item) => `<div class="gp-mega ${m.cls}">
      <div class="gp-mega__left">
        <a class="gp-mega__head" href="${item.href}"><p class="gp-mega__title">${item.label}<i class="gp-mega__icon">${ARROW}</i></p></a>
        <div class="gp-mega__cards">${m.cards.map(([t, l]) => `<a class="gp-mega__card" href="${item.href}"><div class="wf-img" data-label="${l}"></div><span>${t}</span></a>`).join("")}</div>
      </div>
      <div class="gp-mega__right"><ul class="gp-mega__list">${m.list.map((t) => `<li><a href="${item.href}">${t}</a></li>`).join("")}</ul></div>
    </div>`;

  document.querySelectorAll("[data-logo]").forEach((el) => (el.innerHTML = LOGO));

  // The loader runs only once per tab — from the second time on, the curtain lifts right away and the entrance motion starts
  const loader = document.querySelector('[data-slot="loader"]');
  const loaded = () => { document.documentElement.removeAttribute("data-loading"); dispatchEvent(new CustomEvent("gp:loaded")); };
  if (loader) {
    let seen = false;
    try { seen = sessionStorage.getItem("gp-loader-seen") === "1"; } catch (e) { seen = false; }
    if (seen) { loader.remove(); queueMicrotask(loaded); }
    else {
      requestAnimationFrame(() => requestAnimationFrame(() => loader.classList.add("is-ready")));
      loader.addEventListener("fx:done", () => { try { sessionStorage.setItem("gp-loader-seen", "1"); } catch (e) { /* If it can’t be saved, it shows every time */ } loader.remove(); loaded(); }, { once: true });
    }
  } else document.documentElement.removeAttribute("data-loading");

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.className = "gp-header";
    header.innerHTML = `<div class="gp-header__in">
      <a class="gp-logo" href="index.html" data-label="Brand English name (two initials + small company name)">${LOGO}</a>
      <div class="gp-header__right">
        <nav class="gp-nav" aria-label="Main menu"><ul>${MENU.map((m) => `<li><a href="${m.href}">${m.label}</a>${m.mega ? mega(m.mega, m) : ""}</li>`).join("")}</ul></nav>
        <div class="gp-header__actions">${btn("Free quote", "#contact", "is-sm")}<button class="gp-burger" type="button" aria-label="Open Menu"><span></span><span></span><span></span></button></div>
      </div>
    </div>
    <div class="gp-header__backdrop" aria-hidden="true"></div>`;
    const drawer = document.createElement("div");
    drawer.className = "gp-drawer";
    drawer.setAttribute("data-slot", "drawer");
    drawer.innerHTML = `${MENU.slice(0, 4).map((m) => m.mega
      ? `<div class="gp-drawer__item"><button type="button">${m.label}<i></i></button><div class="gp-drawer__sub"><ul>${m.mega.list.map((t) => `<li><a href="${m.href}">${t}</a></li>`).join("")}</ul></div></div>`
      : `<div class="gp-drawer__item"><a href="${m.href}">${m.label}<i></i></a></div>`).join("")}
      <div class="gp-drawer__links"><a href="news.html">Column</a><a href="news.html#news">News</a><a href="#">Frequently asked questions</a></div>
      <div class="gp-drawer__btns">${btn("Contact Us", "#contact", "is-ghost")}${btn("Free quote", "#contact")}</div>`;
    header.after(drawer);
    const burger = header.querySelector(".gp-burger");
    burger.addEventListener("click", () => {
      const open = !drawer.classList.contains("is-open");
      drawer.classList.toggle("is-open", open);
      burger.classList.toggle("is-active", open);
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      document.documentElement.style.overflow = open ? "hidden" : "";
    });
    drawer.querySelectorAll(".gp-drawer__item > button").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("is-open")));
  }

  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.className = "gp-contact";
    contact.id = "contact";
    contact.innerHTML = `<div class="gp-contact__bg"></div>
      <div class="gp-contact__in">
        <h2 class="gp-contact__title" data-fadein="C" data-label="Section name in English">Contact</h2>
        <p class="gp-contact__lead" data-fadein="C" data-fadein-delay="0.1"><b>Free</b>On-site quotes and consultations here</p>
        <div class="gp-contact__cards">
          <div class="gp-contact__card is-tel" data-fadein="C" data-fadein-delay="0.2">
            <span class="gp-contact__badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1Z"/></svg>Customers only<br>Consultation desk</span>
            <span class="gp-contact__tag">Phone Inquiry</span>
            <p class="gp-contact__tel"><i>Free</i>0000-00-0000</p>
            <p class="gp-contact__note">Open 24 hours, year-round</p>
          </div>
          <div class="gp-contact__card is-web" data-fadein="C" data-fadein-delay="0.3">
            <div class="wf-img" data-label="Staff hands and documents during a consultation · dark · landscape"></div>
            <span class="gp-contact__tag">Web inquiry</span>
            <p class="gp-contact__web">Free on-site quote requests·consultations now open</p>
            ${btn("To the contact form", "#", "is-sm")}
          </div>
        </div>
      </div>`;
  }

  const banner = document.querySelector('[data-slot="banner"]');
  if (banner) {
    banner.className = "gp-banner-wrap";
    banner.innerHTML = `<div class="gp-banner gp-inner">${[["Your banner title here<br>Place it in two lines", "Kitchen hygiene inspection scene · bright lighting · landscape"], ["Your banner title two here<br>Place it in two lines", "Consultation desk staff · interior · landscape"], ["Your banner title three here<br>Place it in two lines", "Handshake · close-up · landscape"]]
      .map(([t, l]) => `<a href="news.html"><div class="wf-img" data-label="${l}"></div><span>${t}</span></a>`).join("")}</div>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.className = "gp-footer";
    const col = (t, items) => `<div class="gp-footer__col"><h3>${t}</h3><ul><div>${items.map((i) => `<li><a href="#">${i}</a></li>`).join("")}</div></ul></div>`;
    footer.innerHTML = `<div class="gp-grid is-light"></div>
      <div class="gp-footer__in">
        <div class="gp-footer__brand"><a class="gp-logo" href="index.html" data-label="Brand English name">${LOGO}</a><p>Add your one-line pledge here<br>Place it in two lines</p></div>
        <nav class="gp-footer__nav" aria-label="Sitemap">${col("Our Thoughts", ["Our Thoughts", "Ideas & philosophy"])}${col("Service", ["Service", "Installation Design", "Service list", "Why people choose us", "Installation Record", "Corporate clients", "Individual Customer"])}${col("Company info", ["Corporate Philosophy", "Message from the CEO", "Company overview", "History", "View in numbers", "Branch office", "Staff Introduction"])}${col("Hiring Info", ["Hiring message", "Hiring overview", "Work style", "Desired Talent", "Staff Interview", "Application guidelines"])}</nav>
        <div class="gp-footer__offices">${[["Headquarters", "Your one-line HQ address here"], ["Sales office 1", "Your branch office address line here"], ["Sales office 2", "Your branch office address line here"], ["Sales office 3", "Your branch office address line here"]].map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join("")}</div>
        <div class="gp-footer__side"><div class="gp-footer__links"><a href="news.html">Column</a><a href="news.html#news">News</a><a href="#">Frequently asked questions</a></div><div class="gp-footer__btns">${btn("Contact Us", "#contact", "is-ghost is-sm")}${btn("Free quote", "#contact", "is-sm")}</div></div>
        <p class="gp-footer__copy"><span>© Studio Name Co., Ltd.</span><a href="#">Privacy policy</a></p>
      </div>
      <a class="gp-pagetop" href="#top">Back to top</a>`;
    footer.querySelectorAll(".gp-footer__col h3").forEach((h) => h.addEventListener("click", () => matchMedia("(max-width: 1023px)").matches && h.parentElement.classList.toggle("is-open")));
    footer.querySelector(".gp-pagetop").addEventListener("click", (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: "smooth" }); });
  }

  gsap.registerPlugin(ScrollTrigger);

  // Original data-fadein: fires once when it crosses the line 20% from the screen bottom, if on screen from the start, two frames later, on reaching the very bottom, all remaining ones fire
  const RISE = "y: 120; dur: 1.4; stagger: .1; ease: 0.15,0.85,0.3,1; start: top 80%";
  const startReveals = () => {
    document.querySelectorAll("[data-rise]").forEach((el) => {
      el.setAttribute("data-fx-line-rise", el.getAttribute("data-rise") || RISE);
      el.setAttribute("data-fx", `${el.getAttribute("data-fx") || ""} line-rise`.trim());
    });
    const targets = document.querySelectorAll("[data-fadein]");
    targets.forEach((el) => el.dataset.fadeinDelay && el.style.setProperty("--fadein-delay", `${el.dataset.fadeinDelay}s`));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { targets.forEach((el) => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -20% 0px" });
    const now = [];
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) now.push(el);
      else io.observe(el);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => now.forEach((el) => el.classList.add("is-visible"))));
    const bottom = () => { if (innerHeight + scrollY >= document.documentElement.scrollHeight - 1) document.querySelectorAll("[data-fadein]:not(.is-visible)").forEach((el) => el.classList.add("is-visible")); };
    addEventListener("scroll", bottom, { passive: true });
  };
  if (document.documentElement.hasAttribute("data-loading")) addEventListener("gp:loaded", startReveals, { once: true });
  else startReveals();

  // Over dark sections and the footer the logo is white, over the contact strip only the mark is white
  const logo = document.querySelector(".gp-header .gp-logo");
  if (logo) {
    let n = 0;
    const on = () => { n++; logo.classList.add("is-inverted"); };
    const off = () => { n = Math.max(0, n - 1); if (!n) logo.classList.remove("is-inverted"); };
    document.querySelectorAll("[data-invert], .gp-footer").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom top", onEnter: on, onLeave: off, onEnterBack: on, onLeaveBack: off }));
    if (contact) ScrollTrigger.create({ trigger: contact, start: "top top", end: "bottom top", toggleClass: { targets: logo, className: "is-contact" } });
  }
})();
