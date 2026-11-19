// Common to all pages: draws header · phone drawer · back to top · Instagram · footer in one place, and hooks up smooth scroll, entrance and current-section underline.
// Original values: Lenis lerp 0.08·duration 1.5 · scroll to top·anchor move 1.5s expo(1.001 - 2^-10t) · reveal line at 80% of the viewport · back-to-top shows after 300px (on the first page also after 5s).
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const isHome = page === "home";
  const FD = (window.FD = { reduced, lenis: null, onScroll: [] });
  const expo = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

  // Original lettering is a picture of fixed width, so it is stretched with textLength into a box of the same width and height
  const label = (word, w, h = 24) =>
    `<svg class="fd-word" viewBox="0 0 ${w} ${h}" style="height:100%;width:auto" aria-label="${word}"><text x="0" y="${h - 0.5}" font-size="${h * 1.38}" textLength="${w}" lengthAdjust="spacingAndGlyphs" style="font-family:var(--kf-font-display);font-weight:600">${word}</text></svg>`;
  const mark = (cls = "") =>
    `<svg class="fd-word ${cls}" viewBox="0 0 250 52" aria-label="Your logo here"><text x="1" y="48" font-size="64" textLength="248" lengthAdjust="spacingAndGlyphs">BRAND</text></svg>`;
  FD.label = label;
  FD.mark = mark;

  const home = isHome ? "" : "index.html";
  const NAV = [
    ["ABOUT", 66, `${home}#about`, "about"],
    ["PRODUCTS", 103, `${home}#products`, "products"],
    ["NEWS", 56.1, "news.html", "news"],
    ["STORES", 75, `${home}#stores`, "stores"],
    ["CONTACT", 86, "contact.html", "contact"],
  ];
  const navItems = () => NAV.map(([w, px, href, id]) => `<li><a class="fd-uline" data-nav="${id}" href="${href}">${label(w, px)}</a></li>`).join("");
  const upIcon = '<svg viewBox="0 0 56 56" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="28" cy="28" r="27.25"/><path d="M39.5 22.7 27.8 11 16.5 22.3M27.75 11.5v35"/></svg>';

  const igIcon = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="26" height="26" rx="7.5"/><circle cx="16" cy="16" r="6"/><circle cx="23.6" cy="8.4" r="1.4" fill="currentColor" stroke="none"/></svg>';
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("fd-head");
    head.innerHTML = `
      <a class="fd-logo" href="index.html" aria-label="Back to start">${mark()}</a>
      <nav aria-label="Main menu">
        <ul class="fd-gnav">${navItems()}</ul>
        <button class="fd-burger" type="button" aria-label="Open Menu"><i></i><i></i></button>
        <div class="fd-spnav-bg"></div>
        <div class="fd-spnav" data-slot="mobile-menu">
          <ul>${navItems()}
            <li class="fd-spnav__ig"><a href="#" aria-label="instagram">${igIcon}</a></li>
          </ul>
        </div>
      </nav>`;
    document.body.insertAdjacentHTML(
      "beforeend",
      `<button class="fd-pagetop" type="button" aria-label="Back to top">${upIcon}</button>` +
        (isHome ? '<a class="fd-insta" href="#" aria-label="instagram">instagram</a>' : "")
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("fd-foot");
    foot.innerHTML = `
      <div class="fd-foot__links">
        <ul class="fd-fnav">${navItems()}</ul>
        <a class="fd-foot__ig" href="#" aria-label="instagram">${igIcon}</a>
      </div>
      <div class="fd-foot__co">
        <div class="fd-foot__logo">${mark()}</div>
        <small>© Your Company Name Here</small>
      </div>`;
  }

  // ---------- Smooth scroll ----------
  if (!reduced && window.Lenis) {
    const lenis = (FD.lenis = new Lenis({ lerp: 0.08, duration: 1.5 }));
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    new ResizeObserver(() => lenis.resize()).observe(document.body);
  }
  FD.scrollTo = (target) => (FD.lenis ? FD.lenis.scrollTo(target, { duration: 1.5, easing: expo }) : typeof target === "number" ? window.scrollTo(0, target) : target.scrollIntoView());

  // ---------- Phone drawer ----------
  const burger = document.querySelector(".fd-burger");
  const spnav = document.querySelector(".fd-spnav");
  const spBg = document.querySelector(".fd-spnav-bg");
  const scrollHint = () => document.querySelector(".fd-scroll");
  let spOpen = false;
  const setSp = (open) => {
    if (open && innerWidth > 1024) return;
    spOpen = open;
    burger.classList.toggle("close", open);
    spnav.classList.toggle("show", open);
    spBg.classList.toggle("show", open);
    document.body.style.overflow = open ? "hidden" : "";
    if (FD.lenis) open ? FD.lenis.stop() : FD.lenis.start();
    updateHint();
  };
  if (burger) {
    burger.addEventListener("click", (e) => { e.stopPropagation(); setSp(!spOpen); });
    spBg.addEventListener("click", () => setSp(false));
    spnav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setSp(false)));
    addEventListener("resize", () => { if (innerWidth > 1024 && spOpen) setSp(false); });
  }

  // ---------- Back to top · logo ----------
  const pagetop = document.querySelector(".fd-pagetop");
  pagetop?.addEventListener("click", () => FD.scrollTo(0));
  document.querySelector(".fd-logo")?.addEventListener("click", (e) => {
    if (!isHome) return;
    e.preventDefault();
    FD.scrollTo(0);
  });
  // Same-page anchors go through Lenis in 1.5s
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href === "#") return e.preventDefault();
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      FD.scrollTo(el);
    })
  );

  function updateHint() {
    const s = scrollHint();
    if (s) s.classList.toggle("hide", spOpen || scrollY > 200);
  }

  // ---------- Reveal (80% screen line) — the first page hides again when returning to the top ----------
  const rv = [...document.querySelectorAll("[data-rv]")];
  rv.forEach((el) => el.dataset.delay && el.style.setProperty("--d", el.dataset.delay + "s"));
  // Original measures for the first time on load while setting up the scene — not attached before that
  let loaded = document.readyState === "complete";
  addEventListener("load", () => (loaded = true), { once: true });
  const updateReveal = () => {
    if (reduced) return rv.forEach((el) => el.classList.add("in"));
    if (!loaded) return;
    if (isHome && scrollY < 100) return rv.forEach((el) => el.classList.remove("in"));
    const line = innerHeight * 0.8;
    rv.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top <= line && r.bottom >= 0) el.classList.add("in");
    });
  };

  // ---------- Current section underline (first page) ----------
  const SECTIONS = ["about", "products", "stores"];
  let active = "";
  const updateNav = () => {
    if (!isHome) return;
    const about = document.getElementById("about");
    let next = "";
    if (about && about.getBoundingClientRect().top <= innerHeight / 2) {
      const mid = innerHeight / 2;
      SECTIONS.forEach((id, i) => {
        const el = document.getElementById(id);
        const nx = document.getElementById(SECTIONS[i + 1]);
        if (el && el.getBoundingClientRect().top <= mid && (!nx || nx.getBoundingClientRect().top > mid)) next = id;
      });
      if (scrollY + innerHeight >= document.documentElement.scrollHeight - innerHeight * 0.2) next = "contact";
    }
    if (next === active) return;
    active = next;
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === active && SECTIONS.includes(active)));
  };

  const onScroll = () => {
    pagetop?.classList.toggle("show", scrollY > 300 || pagetop.classList.contains("stay"));
    updateHint();
    updateReveal();
    updateNav();
    FD.onScroll.forEach((fn) => fn());
  };
  if (isHome) setTimeout(() => pagetop?.classList.add("stay", "show"), 5000);
  FD.update = onScroll;
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  addEventListener("load", onScroll);
  requestAnimationFrame(onScroll);
})();
