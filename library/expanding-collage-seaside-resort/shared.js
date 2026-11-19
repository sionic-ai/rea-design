// Common to all pages: draws the header (hidden at the top, descends in .8s once scrolled), hamburger with three-column drawer, vertical Book a Stay button, booking card and dark sand photo footer,
// Sets up the opening fade (#page .6s later for 1s)·text entrance (.js-anim_elm → is-act when within 25% inside screen top and bottom)·circle arrow·reservation card 3D tilt.
(() => {
  const page = document.body.dataset.page || "home";
  const OG = (window.OG = {});
  const root = document.documentElement;

  // Where the original calligraphy logo (two brush characters + -oga-) sits — redraws brush strokes of the same size and grain
  OG.logo = (cls = "") => `<svg class="og-logo ${cls}" viewBox="0 0 140 72" aria-hidden="true"><path d="M8 40c6-2 10 2 12 8 1-10 3-20 2-30 4 6 4 18 2 26 6-6 10-10 18-8-4 4-10 10-14 18M30 18c3 4 2 12 0 20M44 30c4 1 6 4 6 8" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M78 8c-2 16-8 30-20 40M80 22c6 10 18 22 36 26 6 2 12 4 18 2" fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round"/><text x="70" y="68" text-anchor="middle" font-size="11" fill="currentColor" font-family="var(--kf-font-sans)" letter-spacing="1">-name-</text></svg>`;
  // Circle arrow (original .c-arrow — two arrows cross over and swap in .6s cubic-bezier(.77,0,.175,1))
  const icon = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9.5 4.5 13 8l-3.5 3.5" fill="none" stroke="currentColor"/></svg>`;
  OG.arrow = (cls = "") => `<span class="og-arrow ${cls}"><span class="og-arrow__icon">${icon}</span><span class="og-arrow__icon">${icon}</span></span>`;
  document.querySelectorAll("[data-arrow]").forEach((el) => el.insertAdjacentHTML("beforeend", OG.arrow(el.dataset.arrow)));
  document.querySelectorAll("[data-logo]").forEach((el) => (el.innerHTML = OG.logo()));

  const contents = [["Nature", "index.html#nature"], ["Cooking", "index.html#cuisine"], ["Restaurant", "restaurant.html"], ["Guest room", "index.html#stay"], ["Hot spring", "index.html#about"], ["Facility Guide", "index.html#about"], ["Directions", "index.html#about"], ["Press Release", "news.html"], ["Hometown Tax", "#"], ["Frequently asked questions", "#"], ["Hiring Info", "#"], ["Inquiry", "#"]];
  const access = `<p class="og-en-label" lang="en">Access</p><p>Postal code 000-0000　Your address goes here on one line 00-00</p><a class="og-map" href="#"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15s5-5 5-9A5 5 0 0 0 3 6c0 4 5 9 5 9z" fill="none" stroke="currentColor"/><circle cx="8" cy="6" r="1.6" fill="none" stroke="currentColor"/></svg><span lang="en">Google Maps</span></a>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "og-head";
    head.id = "js-header";
    head.innerHTML = `<div class="og-head__in"><a class="og-head__logo" href="index.html" aria-label="Home">${OG.logo()}</a></div>`;

    // Vertical ”Book a stay” button — hidden outside the right edge at the top, then enters at .7s (.2s late) when scrolling down
    const reserve = document.createElement("div");
    reserve.className = "og-reserve";
    reserve.dataset.slot = "reserve-tab";
    reserve.innerHTML = `<a class="og-btn3 is-vertical" href="#reserve"><span>Stay Booking</span></a>`;
    head.after(reserve);

    // Hamburger (pinned separately) + three-column drawer: News, Index, Info. On open the drawer turns on in .3s, each column comes into focus from blur and 150% brightness in .6s (.3s later), and the lines between columns grow
    const burger = document.createElement("button");
    burger.type = "button";
    burger.className = "og-burger js-hamburger";
    burger.setAttribute("aria-label", "Menu");
    burger.setAttribute("aria-expanded", "false");
    burger.innerHTML = "<span></span>";
    const drawer = document.createElement("div");
    drawer.className = "og-drawer";
    drawer.dataset.slot = "menu-drawer";
    drawer.innerHTML = `<div class="og-drawer__in">
        <div class="og-drawer__col is-news"><div class="og-drawer__fade">
          <h3>News</h3>
          <ul class="og-drawer__news">
            <li><a href="article.html"><span class="wf-img" data-label="Seaside lodging at sunset · landscape 21:10"></span><time lang="en">2026.10.20</time><span>Your recent news title goes here</span></a></li>
            <li><a href="article.html"><span class="wf-img" data-label="Food close-up · landscape 21:10"></span><time lang="en">2026.10.11</time><span>Your second news title here</span></a></li>
            <li><a href="article.html"><span class="wf-img" data-label="Sea view · landscape 21:10"></span><time lang="en">2026.09.18</time><span>Your third News title here</span></a></li>
          </ul>
          <a class="og-link" href="news.html" data-arrow><span>Back to news list</span></a>
        </div></div>
        <div class="og-drawer__col is-contents"><div class="og-drawer__fade">
          <h3 lang="en">Contents</h3>
          <ul class="og-drawer__list">${contents.map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join("")}</ul>
        </div></div>
        <div class="og-drawer__col is-info"><div class="og-drawer__fade">
          <span class="og-drawer__logo">${OG.logo()}</span>
          <div class="og-drawer__access">${access}</div>
          <a class="og-btn3 is-black" href="#reserve"><span>Stay Booking</span></a>
          <a class="og-btn3" href="#"><span>Online store</span></a>
          <p class="og-en-label" lang="en">© 2025 Brand Name</p>
        </div></div>
      </div>`;
    document.body.prepend(drawer, burger);
    // There are two hamburgers, one in the header bar and one in the Hero white cell (first page) — pressing either one flips both together
    const burgers = () => [...document.querySelectorAll(".js-hamburger")];
    const set = (open) => {
      [...burgers(), head, drawer, document.getElementById("page")].forEach((el) => el?.classList.toggle("is-act", open));
      burgers().forEach((b) => b.setAttribute("aria-expanded", String(open)));
      document.body.style.overflow = open ? "hidden" : "";
    };
    document.addEventListener("click", (e) => { const b = e.target.closest(".js-hamburger"); if (b) set(!b.classList.contains("is-act")); });
    drawer.addEventListener("click", (e) => { if (e.target.closest('a[href^="#"], a[href*=".html#"]')) set(false); });
  }

  // Small about panel (one post · below the restaurant) — six small cards (2 columns) on a sage panel
  const mini = document.querySelector('[data-slot="about-mini"]');
  if (mini) {
    const items = [["room", "Guest room", "#", "Sea beyond the room window"], ["onsen", "Hot spring", "index.html#about", "Open-air bath facing the sea"], ["Restaurant", "Restaurant", "restaurant.html", "Wood-ceiling restaurant"], ["facility", "Facility Guide", "#", "Lobby lounge"], ["event", "Event news", "#", "Sunset over the sea"], ["access", "Directions", "#", "Coastal road"]];
    mini.className = "og-aboutmini";
    mini.innerHTML = `<div class="og-aboutmini__inner">
        <div class="og-aboutmini__side js-anim_elm -base"><h2 class="og-title1"><span class="en" lang="en">ABOUT</span><span class="jp">About this place</span></h2><p>A stay on a cliff overlooking land and sea with seventy million years of history, where you can enjoy prized ingredients and hot springs. Enjoy a matchless stay you can only experience here.</p></div>
        <ul class="og-aboutmini__grid js-anim_elm -blur_orderlist">${items.map(([en, ko, h, l], i) => `<li><a class="og-mini" href="${h}"><span class="og-mini__img"><span class="wf-img" data-label="${l} · Landscape 4:3"></span></span><span class="og-mini__no" lang="en">0${i + 1}<i>${en}</i></span><b>${ko}</b><span>${OG.arrow()}</span></a></li>`).join("")}</ul>
      </div>`;
  }

  // Booking card + dark sand photo footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "og-foot";
    foot.innerHTML = `
      <div class="og-foot__bg wf-img" data-label="Close-up of wind-drawn sand ripples · overcast day · background filling the full screen width"></div>
      <section class="og-foot__reserve" id="reserve" data-slot="reserve-card">
        <p class="og-foot__brand" lang="en" data-label="Brand English name">Brand Name</p>
        <a class="og-card" href="#" data-fx="log-tilt-card">
          <span class="og-card__in" data-fx-part="inner">
            <span class="og-card__pic"><span class="wf-img" data-label="Hillside lodge overlooking a sunset sea · dusk · landscape 3:2"></span><span class="og-card__overlay" data-fx-part="glow"></span></span>
            <span class="og-card__title"><b lang="en">RESERVE</b><span>Stay Booking</span></span>
            ${OG.arrow("is-right")}
          </span>
        </a>
        <p class="og-foot__place" lang="en" data-label="Region name (English)">City,Country</p>
      </section>
      <section class="og-foot__bottom" data-slot="footer">
        <div class="og-foot__logo">${OG.logo()}</div>
        <div class="og-foot__access">
          <div>${access}</div>
          <a class="og-foot__contact" href="#"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" fill="none" stroke="currentColor"/><path d="m2 4 6 5 6-5" fill="none" stroke="currentColor"/></svg>Inquiry</a>
        </div>
        <ul class="og-foot__sns"><li><a href="#" aria-label="Social Media"><svg viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="3.5" fill="none" stroke="currentColor"/><circle cx="8" cy="8" r="2.8" fill="none" stroke="currentColor"/></svg></a></li><li><a href="#" aria-label="Video"><svg viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="13" height="9" rx="2.5" fill="none" stroke="currentColor"/><path d="M7 6v4l3.2-2z" fill="currentColor"/></svg></a></li></ul>
        <div class="og-foot__links"><a href="#">Hometown Tax</a><a href="#">Company Site</a><a href="#">Privacy policy</a><a href="#">Sister Lodging Name</a></div>
        <p class="og-foot__copy og-en-label" lang="en">© 2025 Brand Name</p>
      </section>`;
  }

  // Screen position marker — top (within 100px) · middle · bottom (within 100px of document end). The header and the vertical booking button hide and show in this form
  const body = document.body;
  let pos = "";
  const where = () => {
    const y = scrollY, t = body.clientHeight - 100, h = innerHeight;
    const next = y <= 100 ? "top" : y + h < t ? "middle" : "bottom";
    if (next === pos) return;
    body.classList.remove("is-top", "is-middle", "is-bottom");
    body.classList.add(`is-${next}`);
    pos = next;
  };
  where();
  addEventListener("scroll", where, { passive: true });
  addEventListener("resize", where);
  addEventListener("load", where);

  // Text entrance — is-act (once) when it crosses the line 25% inside the top and bottom of the screen
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-act"); io.unobserve(e.target); } }), { rootMargin: "-25% 0px" });
  document.querySelectorAll(".js-anim_elm").forEach((el) => io.observe(el));

  // Opening fade — the body panel appears over 1s (original gsap.to(#page, 1, { opacity: 1, delay: .6 }) — curve is GSAP default power1.out).
  // In the original the script runs while the HTML is still downloading, so the .6s delay passes before the first paint, and in measurement (motion-probe) the fade has already started with the first paint — the copy starts on the first paint frame
  const pageEl = document.getElementById("page");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  body.classList.add("is-load");
  // Starts after the fonts have all loaded — if the font changes mid-fade the screen jumps once, which clashes with the original’s smooth 1s fade
  const fade = () => gsap.to(pageEl, { opacity: 1, duration: 1 });
  if (pageEl && window.gsap && !reduce) requestAnimationFrame(() => (document.fonts ? document.fonts.ready.then(fade) : fade()));
  else if (pageEl) pageEl.style.opacity = "1";

  // Inner # links glide down in 1s (original ScrollToPlugin · power1.inOut)
  if (window.gsap && window.ScrollToPlugin) {
    gsap.registerPlugin(ScrollToPlugin);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2 || !document.querySelector(id)) return;
      e.preventDefault();
      gsap.to(window, { duration: reduce ? 0 : 1, ease: "power1.inOut", scrollTo: { y: id, offsetY: 0 } });
    }));
  }
})();
