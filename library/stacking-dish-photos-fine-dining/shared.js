// Common to all pages: draws the header, phone drawer, language pill, business hours, visit info and news, booking window and footer in one place, and
// Sets up smooth scroll (Lenis 1.0.19), header difference switch, removal of the vertical menu in the booking section, drawer expand, and photo group scrub.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const page = body.dataset.page || "home";
  const Z = (window.Z = { reduced, lenis: null });

  // Colors made from the Skin (color-mix, oklch(from …)) mix in oklab during transitions, so the Curve differs from the original, which mixes hex colors in sRGB
  // (the midpoint of black → #a0a0a0 over .35s is 59, not sRGB 80). Only what is used in transitions is resolved once to sRGB values and rewritten into :root
  const legacy = (names) => {
    const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const probe = document.body.appendChild(document.createElement("i"));
    for (const n of names) {
      probe.style.color = `var(${n})`;
      g.clearRect(0, 0, 1, 1);
      g.fillStyle = getComputedStyle(probe).color;
      g.fillRect(0, 0, 1, 1);
      const [r, gr, b] = g.getImageData(0, 0, 1, 1).data;
      document.documentElement.style.setProperty(n, `rgb(${r}, ${gr}, ${b})`);
    }
    probe.remove();
  };
  legacy(["--site-light", "--site-gray", "--site-recruit-hover", "--site-recruit-on-black"]);

  const arrowR = '<svg viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 11.5h20.5M14 4l7.5 7.5L14 19"/></svg>';
  const arrowUR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 19 19 5M8 5h11v11"/></svg>';
  const insta = '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3"><rect x="4" y="4" width="32" height="32" rx="9"/><circle cx="20" cy="20" r="7.5"/><circle cx="29.5" cy="10.5" r="1.6" fill="currentColor" stroke="none"/></svg>';
  const pageTop = '<svg viewBox="0 0 40 36" fill="none" stroke="currentColor" stroke-width="1"><path d="M20 35V3M11 12l9-9 9 9M4 35.5h32"/></svg>';
  Z.icons = { arrowR, arrowUR };

  const NAV = [
    ["home", "TOP", "index.html"],
    ["menu", "MENU 1", "menu.html"],
    ["", "MENU 2", "index.html#chef"],
    ["", "MENU 3", "index.html#space"],
    ["", "MENU 4", "index.html#window"],
    ["", "ACCESS", "#information"],
    ["article", "NEWS", "#news"],
    ["recruit", "RECRUIT", "recruit.html", true],
  ];
  const cur = (k) => (k && k === page ? " is-current" : "");
  const ext = (e) => (e ? " z-ext" : "");

  const POSTS = [
    ["Your news title in one line goes here", "0000/00/00"],
    ["A slightly longer news title here to check whether it wraps to two lines", "0000/00/00"],
    ["Put your News title here", "0000/00/00"],
  ];
  const postCard = ([t, d]) => `<li><a class="z-post" href="article.html"><h3 class="z-post__title">${t}</h3><time class="z-post__date">${d}</time><span class="z-post__icon">${arrowR}</span></a></li>`;
  // Sister shop external link card: a small logo instead of a date, the arrow is ↗
  const outCard = `<li><a class="z-post z-post--out" href="#"><h3 class="z-post__title">Sister store news goes here</h3><span class="z-post__mark"><span class="wf-logo">LOGO</span></span><span class="z-post__icon">${arrowR}</span></a></li>`;
  Z.postCard = postCard;
  Z.outCard = outCard;

  const logo = (cls = "") => `<span class="z-logo ${cls}" aria-label="Logo">L O G O T Y P E</span>`;
  Z.logo = logo;

  // Map embed slot: the original is a monochrome map — redraws a black-and-white map with roads crossing at a slant
  const mapSvg = () => {
    let roads = "";
    for (let i = -6; i < 16; i++) {
      const x = i * 90;
      roads += `<path class="is-road" d="M${x} 0 L${x + 520} 700" stroke-width="${i % 4 === 0 ? 9 : 4}"/>`;
      roads += `<path class="is-road" d="M${x + 700} 0 L${x - 120} 700" stroke-width="${i % 5 === 0 ? 9 : 3}"/>`;
    }
    const blocks = Array.from({ length: 26 }, (_, i) => `<rect x="${(i * 137) % 1000}" y="${(i * 83) % 400}" width="${22 + (i % 4) * 8}" height="${14 + (i % 3) * 6}" class="is-block"/>`).join("");
    return `<svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect class="is-bg" width="1000" height="400"/>${blocks}${roads}
      <path class="is-river" d="M0 330 C 250 300 420 380 1000 250" stroke-width="16" fill="none"/>
      <g transform="translate(500 190)"><path class="is-pin" d="M0 0c-9-13-15-21-15-30a15 15 0 0 1 30 0c0 9-6 17-15 30z"/><circle class="is-pinHole" cy="-30" r="5.5"/><text class="is-pin" x="20" y="-24" font-size="15">Shop Name</text></g>
    </svg>`;
  };

  // Underline button two arrows: the black one slides out to the right and the gray one comes in from the left
  document.querySelectorAll("[data-arrow]").forEach((el) => (el.innerHTML = arrowR + arrowR));

  const fill = (sel, html, cls) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    if (cls) el.className = cls;
    el.innerHTML = html;
    return el;
  };

  // ── Header + vertical nav + phone drawer + language pill
  const head = fill(
    '[data-slot="header"]',
    `<div class="z-head__inner">
      <div class="z-head__lang z-langText"><a class="is-current" href="#">KO</a><a href="#">EN</a></div>
      <nav class="z-gnav" aria-label="Main menu"><ul class="z-gnav__list">
        ${NAV.map(([k, t, h, e]) => `<li class="z-gnav__item"><a class="z-gnav__link${cur(k)}${ext(e)}" href="${h}">${t}</a></li>`).join("")}
      </ul></nav>
      <div class="z-head__reserve"><a class="z-reserveLink" href="#reserve">RESERVE</a></div>
      <button class="z-burger" type="button" aria-label="Open Menu" aria-expanded="false" aria-controls="drawer"><i></i><i></i></button>
    </div>`,
    "z-head"
  );
  if (head) {
    head.insertAdjacentHTML(
      "afterend",
      `<div class="z-drawer" id="drawer" data-slot="menu-drawer" data-lenis-prevent><div class="z-drawer__inner">
        <a class="z-drawer__logo" href="index.html">${logo()}</a>
        <ul class="z-drawer__list">${NAV.map(([k, t, h, e]) => `<li><a class="z-drawer__link${cur(k)}${ext(e)}" href="${h}">${t}</a></li>`).join("")}</ul>
        <div class="z-drawer__sns"><a class="z-snsIcon" href="#" aria-label="Social Media">${insta}</a><p class="z-snsText">Your line here<br>Follow us on SNS</p></div>
      </div></div>
      <div class="z-lang" data-slot="lang-pill"><a class="is-current" href="#"><span class="z-lang__text">KO</span></a><a href="#"><span class="z-lang__text">EN</span></a></div>`
    );
  }

  // ── Business hours
  fill(
    '[data-slot="information"]',
    `<div class="z-info__body z-contents">
      <div class="z-head-c">${logo()}</div>
      <address class="z-info__address"><p class="z-info__addr">Your shop address line here · Building name, floor 0</p><p class="z-info__tel">00-0000-0000</p></address>
      <div class="z-info__map"><div class="z-map">${mapSvg()}<span class="z-map__chip">Open map ↗</span></div>
        <p class="z-info__access">Directions in one line here — Station name, Exit 0, 0 min on foot<br>Here, the second route — Station name, 0 min on foot</p></div>
    </div>
    <div class="z-info__body z-contents">
      <div class="z-head-c"><h2 class="z-label">HOURS</h2></div>
      <ul class="z-hours">
        <li class="z-hours__lunch"><h3 class="z-hours__name">LUNCH</h3><p class="z-hours__time">00:00〜00:00</p><p class="z-hours__lo">L.O.00:00</p></li>
        <li class="z-hours__dinner"><h3 class="z-hours__name">DINNER</h3><p class="z-hours__time">00:00〜00:00</p><p class="z-hours__lo">L.O.00:00</p></li>
        <li class="z-hours__holiday">Your day off here</li>
        <li class="z-hours__seat">Seats: 00<br><small>(Your seating layout in one line)</small></li>
      </ul>
    </div>`,
    "z-info"
  )?.setAttribute("id", "information");

  // ── Visit info + news
  const notice = fill(
    '[data-slot="visit-news"]',
    `<section class="z-notice__body">
      <div class="z-head-c"><h2 class="z-label">NOTICE</h2></div>
      <ul class="z-caution">
        <li>Your one line of visit info here.</li>
        <li>Your dress code note here in one line.</li>
        <li>Your slightly longer visit notice goes here in one line.</li>
        <li>One last line of guidance here.</li>
      </ul>
    </section>
    <section class="z-notice__body" id="news">
      <div class="z-head-c"><h2 class="z-label">NEWS</h2></div>
      <ul class="z-posts">${POSTS.map(postCard).join("")}${outCard}</ul>
    </section>`,
    "z-notice"
  );

  // ── Booking window (cells pass over a fixed photo)
  fill(
    '[data-slot="reserve"]',
    `<div class="z-window__img"><div class="wf-img" data-label="Napkin and wooden name plate on a table · bright beige natural light · fixed full-bleed background"></div></div>
    <div class="z-reserve__body">
      <h2 class="z-reserve__title">RESERVE</h2>
      <a class="z-reserve__btn" href="#" aria-label="Book now">${arrowUR}</a>
      <p class="z-reserve__lead">Your line here</p>
    </div>`,
    "z-reserve"
  )?.setAttribute("id", "reserve");

  // ── Footer
  fill(
    '[data-slot="footer"]',
    `<div class="z-footer__body">
      <a class="z-footer__logo" href="index.html">${logo()}</a>
      <div class="z-footer__sns"><a class="z-snsIcon" href="#" aria-label="Social Media">${insta}</a><p class="z-snsText">Your line here<br>Follow us on SNS</p></div>
      <nav class="z-ftnav" aria-label="Bottom Menu">
        <ul class="z-ftnav__list">${NAV.map(([k, t, h, e]) => `<li class="z-ftnav__item"><a class="z-ftnav__link${cur(k)}${ext(e)}" href="${k === page ? "#top" : h}"${k === page ? " data-top" : ""}>${t}<span class="z-arrow">${arrowR}</span></a></li>`).join("")}</ul>
        <a class="z-ftnav__top" href="#top" data-top aria-label="Back to top">${pageTop}</a>
      </nav>
      <p class="z-footer__copy">All rights reserved, 0000, NAME</p>
    </div>`,
    "z-footer"
  );

  // ── Smooth scroll: same Lenis 1.0.19 as the original · same options · same rAF loop. In this build, if duration is set, the wheel uses it too instead of lerp
  // Using duration (scrollTo’s lerp = !duration && lerp) one wheel tick glides over 2s expo — that’s the feel of the original.
  // ScrollTrigger follows via the scroll event fired when Lenis actually scrolls the window (the original doesn’t connect it separately either).
  if (!reduced && window.Lenis) {
    const lenis = (Z.lenis = new Lenis({ lerp: 0.35, duration: 2.0 }));
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // The Recruit frame rolls same-page anchors with SmoothScroll V2 without Lenis — every 10ms by 1/20 of the remaining distance + 1px, stopping at the end if it overshoots
  const stepScroll = (end) => {
    end = Math.min(end, document.documentElement.scrollHeight - innerHeight);
    let y = scrollY;
    const down = end > y;
    const step = () => {
      if (down ? y <= end : y >= end) {
        y = down ? y + (end - y) / 20 + 1 : y - (y - end) / 20 - 1;
        scrollTo(0, y);
        setTimeout(step, 10);
      } else scrollTo(0, end);
    };
    setTimeout(step, 10);
  };
  const scrollToY = (y) => {
    if (Z.lenis) return Z.lenis.scrollTo(y, { duration: 0.4, easing: (p) => 0.5 - Math.cos(p * Math.PI) / 2 });
    if (reduced) return scrollTo(0, y);
    if (page === "recruit") return stepScroll(y);
    scrollTo({ top: y, behavior: "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#']");
    if (!a) return;
    const id = a.getAttribute("href");
    if (id === "#") return e.preventDefault();
    const t = a.hasAttribute("data-top") || id === "#top" ? 0 : document.querySelector(id);
    if (t === null) return;
    e.preventDefault();
    closeDrawer();
    scrollToY(t === 0 ? 0 : t.getBoundingClientRect().top + window.scrollY);
  });

  // Turn on past the point and off when back — onToggle turns off at the very end of the document so it is not used
  Z.onPast = (trigger, start, set) => ScrollTrigger.create({ trigger, start, onEnter: () => set(true), onLeaveBack: () => set(false), onRefresh: (st) => set(st.progress > 0 || window.scrollY > st.start) });

  // ── Header text: on the first page, difference applies only once inside the body, on other pages from the start
  const hd = document.querySelector(".z-head");
  const trigger = document.querySelector("[data-header-trigger]");
  if (hd && trigger && page === "home") {
    Z.onPast(trigger, "top top", (v) => hd.classList.toggle("is-header", v));
  } else if (hd) hd.classList.add("is-header");

  // ── When the booking cell enters from the bottom of the screen, slide the vertical menu·language pill out to the left (.5s)
  const reserve = document.querySelector(".z-reserve");
  if (reserve) Z.onPast(reserve, "top bottom", (v) => body.classList.toggle("is-hide", v));

  // ── Phone drawer: unfolds top to bottom .4s swing(= sine.inOut), two lines → X is CSS
  const drawer = document.querySelector(".z-drawer");
  const burger = document.querySelector(".z-burger");
  let open = false;
  function setDrawer(v) {
    if (!drawer || v === open) return;
    open = v;
    body.classList.toggle("is-drawerOpen", v);
    burger.setAttribute("aria-expanded", String(v));
    burger.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
    gsap.killTweensOf(drawer);
    if (v) {
      drawer.style.display = "block";
      Z.lenis?.stop();
      gsap.fromTo(drawer, { height: 0 }, { height: window.innerHeight, duration: reduced ? 0 : 0.4, ease: "sine.inOut", onComplete: () => (drawer.style.height = "100dvh") });
    } else {
      Z.lenis?.start();
      gsap.to(drawer, { height: 0, duration: reduced ? 0 : 0.4, ease: "sine.inOut", onComplete: () => (drawer.style.display = "none") });
    }
  }
  function closeDrawer() { setDrawer(false); }
  burger?.addEventListener("click", () => setDrawer(!open));
  addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());
  matchMedia("(min-width: 1026px)").addEventListener("change", (m) => m.matches && closeDrawer());

  // ── Stacked photo set: the previous sheet recedes to scale .97 and brightness .75 (scrub 1.75), and the right-side bar goes 0→100%.
  // In the original the end (100% 90%) comes before the start (70% 0%), so it flips over all at once at the 70% point and follows with scrub 1.75 — keep the same values.
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".z-kv").forEach((kv) => {
      kv.querySelectorAll(".z-kv__img.is-sticky").forEach((fig) => {
        gsap.fromTo(fig.querySelector(".wf-img"), { scale: 1, "--brightness": 1 }, {
          scale: 0.97,
          "--brightness": 0.75,
          scrollTrigger: { trigger: fig, start: "70% 0%", end: "100% 90%", scrub: 1.75 },
        });
      });
      const bar = kv.querySelector(".z-kv__bar");
      if (bar) gsap.fromTo(bar, { height: "0%" }, { height: "100%", scrollTrigger: { trigger: kv, start: "0% 0%", end: kv.dataset.barEnd || "115% 100%", scrub: true } });
    });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
