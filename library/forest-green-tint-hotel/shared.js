// Common to all pages: draws the header, fixed buttons, menu drawer, booking strip and footer in one place,
// Hooks up Lenis smooth scroll · reveal effects (rise · mask · blur lift · line split) · forest green tint · pinned photo window · expand button.
// Original values: 20% chance to appear visible · line gap .1s · letter delay random .2~1s · background tint .8s · drawer .5s · expand .3s
(() => {
  const page = document.body.dataset.page || "home";
  const K = (window.K = { lenis: null });

  const I = {
    chev: '<svg class="k-ico k-chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m1.5 3.2 3.5 3.6 3.5-3.6"/></svg>',
    globe: '<svg class="k-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1"><circle cx="8" cy="8" r="6.2"/><ellipse cx="8" cy="8" rx="2.6" ry="6.2"/><path d="M1.8 8h12.4M2.8 4.8h10.4M2.8 11.2h10.4"/></svg>',
    ig: '<svg class="k-ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="16" height="16" rx="4.6"/><circle cx="10" cy="10" r="3.8"/><circle cx="14.9" cy="5.1" r=".7" fill="currentColor" stroke="none"/></svg>',
    pin: '<svg class="k-ico" viewBox="0 0 22 22" fill="currentColor"><path d="M11 2a6.5 6.5 0 0 0-6.5 6.5C4.5 13.4 11 20 11 20s6.5-6.6 6.5-11.5A6.5 6.5 0 0 0 11 2Zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>',
    tel: '<svg class="k-ico" viewBox="0 0 22 22" fill="currentColor"><path d="M6.3 3.2 8.6 6c.4.5.4 1.2 0 1.7L7.4 9.1a11 11 0 0 0 5.5 5.5l1.4-1.2c.5-.4 1.2-.4 1.7 0l2.8 2.3c.5.4.6 1.2.1 1.7l-1.3 1.5c-.6.6-1.5.9-2.4.6C9.4 18 4 12.6 2.5 6.8c-.3-.9 0-1.8.6-2.4l1.5-1.3c.5-.4 1.3-.4 1.7.1Z"/></svg>',
    search: '<svg class="k-ico" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="6" cy="6" r="4.2"/><path d="m9.2 9.2 3.6 3.6"/></svg>',
    cal: '<svg class="k-ico" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1"><rect x="1.5" y="2.5" width="11" height="10"/><path d="M1.5 5.5h11M4.5 1v3M9.5 1v3M4 8h1.5M6.3 8h1.5M8.6 8h1.5M4 10.2h1.5M6.3 10.2h1.5"/></svg>',
    close: '<svg class="k-ico" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m1.5 1.5 13 13M14.5 1.5l-13 13"/></svg>',
    up: '<svg class="k-ico" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 1.2h10M2.2 8 6 4.2 9.8 8"/></svg>',
  };
  // A placeholder icon newly drawn instead of the original icon: a vertical pillar inside a ring and an arc open toward the forest
  const mark = '<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="16.5" cy="16.5" r="14"/><path d="M11.5 7.5v18"/><path d="M25 7.6c-6.2 1.6-9.4 5-9.4 8.9s3.2 7.3 9.4 8.9"/></g>';
  const logo = (cls = "") =>
    `<a class="k-logo ${cls}" href="index.html" aria-label="Home"><svg viewBox="0 0 215 33" role="img" aria-hidden="true">${mark}<text x="42" y="23" font-size="10.5" fill="currentColor" style="font-family: var(--kf-font-sans)" letter-spacing="1">Hotel</text><text x="70" y="24.5" font-size="17" font-weight="700" fill="currentColor" style="font-family: var(--kf-font-sans)" letter-spacing="1.5">Forest Name</text></svg></a>`;
  K.icons = I;

  const cur = (p) => (p === page ? ' class="is-current"' : "");
  const lang = `
    <div class="k-lang" data-drop>
      <button class="k-lang__btn" type="button" aria-expanded="false">${I.globe}<span>Language</span>${I.chev}</button>
      <ul class="k-lang__list" data-drop-list><li><a href="#">Language 1</a></li><li><a href="#">Language 2</a></li><li><a href="#">Language 3</a></li><li><a href="#">Language 4</a></li><li><a href="#">Language 5</a></li></ul>
    </div>`;
  const rsv = `
    <div class="k-rsv" data-drop>
      <button class="k-rsv__btn" type="button" aria-expanded="false"><span>Book now</span>${I.chev}</button>
      <ul class="k-rsv__list" data-drop-list><li><a href="#">Stay Booking</a></li><li><a href="#">Meal Reservation</a></li></ul>
    </div>`;
  const menuBtn = (label = "Menu") =>
    `<button class="k-menubtn" type="button" data-menu-open aria-controls="k-menu" aria-expanded="false"><span class="k-menubtn__en">${label}</span><span class="k-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="k-hidden">Open Menu</span></button>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("k-head");
    head.innerHTML = `
      ${logo()}
      <div class="k-head__right">
        <nav class="k-gnav" aria-label="Main menu"><ul>
          <li><a href="index.html"${cur("home")}>HOME</a></li>
          <li><a href="about.html"${cur("about")}>Forest Name Intro</a></li>
          <li><a href="service.html"${cur("service")}>Guest room</a></li>
          <li><a href="index.html#restaurant">Restaurant</a></li>
          <li><a href="index.html#facilities">Facility Amenities</a></li>
          <li><a href="index.html#access">Directions</a></li>
        </ul></nav>
        ${lang}${rsv}${menuBtn()}
      </div>`;
    // After passing the hero, a button group stuck at top right (bottom strip on phone), the difference logo, and a tab over the page
    head.insertAdjacentHTML(
      "afterend",
      `<div class="k-fixlogo" aria-hidden="true">${logo()}</div>
      <div class="k-fixed" data-slot="fixed-buttons"><div class="k-fixed__inner">
        ${rsv}
        <a class="k-mapbtn" href="index.html#access" aria-label="Directions">${I.pin}</a>
        <a class="k-callbtn" href="#" aria-label="Call Now">${I.tel}</a>
        ${menuBtn()}
      </div></div>
      <div class="k-pagetop" data-slot="pagetop"><a href="#top">${I.up}<span class="k-vertical">Back to top</span></a></div>`
    );
  }

  // Menu drawer: for expandable (+) items the submenu slides open over .3s
  const sub = (n) => `<ul class="k-mnav__sub"><li><a href="#">Sub Menu ${n}-1</a></li><li><a href="#">Sub Menu ${n}-2</a></li></ul>`;
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="k-menu" id="k-menu" data-slot="menu-drawer" data-lenis-prevent aria-hidden="true">
      <button class="k-menu__bg" type="button" data-menu-close aria-label="Close Menu"></button>
      <div class="k-menu__panel">
        <div class="k-menu__top">
          <p class="k-menu__sns">Follow us <a href="#" aria-label="SNS">${I.ig}</a></p>
          ${lang}${rsv}
          <div class="k-close-wrap"><button class="k-close" type="button" data-menu-close><span>close</span>${I.close}</button></div>
        </div>
        <nav class="k-mnav" aria-label="Full menu">
          <ul>
            <li><a href="index.html">HOME</a></li>
            <li><button class="k-acc" type="button" data-acc>Menu 3<span class="k-plus"></span></button>${sub(3)}</li>
            <li><button class="k-acc" type="button" data-acc>Menu 4<span class="k-plus"></span></button>${sub(4)}</li>
            <li><a href="index.html#other">Menu 7</a></li>
            <li><button class="k-acc" type="button" data-acc>Menu 8<span class="k-plus"></span></button>${sub(8)}</li>
            <li><a href="index.html#facilities">Menu 5</a></li>
          </ul>
          <ul>
            <li><a href="index.html#other">Menu 9</a></li>
            <li><a href="about.html">Menu 2</a></li>
            <li><a href="#">Menu 10</a></li>
            <li><a href="#">Menu 11</a></li>
            <li><a href="index.html#access">Menu 6</a></li>
            <li><a href="news.html">Menu 12</a></li>
          </ul>
        </nav>
        <nav class="k-onav" aria-label="Regulation"><a href="#">Rules Link 1</a><a href="#">Rule 2</a><a href="#">Rule 3</a><a href="#">Your policy link goes here 4</a><a href="#">Guide 5 ↗</a></nav>
        <div class="k-partners"><span class="wf-logo">Partner Member Logo</span><span class="wf-logo">Partnership 1</span><span class="wf-logo">Partnership 2</span><span class="wf-logo">Partnership 3</span></div>
      </div>
    </div>`
  );

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("k-bgfoot");
    foot.innerHTML = `
      <section class="k-search" data-slot="reserve-band" aria-label="Reservation">
        <div class="k-search__bg k-img k-img--dark"><div class="wf-img" data-label="Forest path photo · narrow trail through dark greenery · full width"></div></div>
        <h2 class="k-ttl k-ttl--block k-ttl--center"><span class="k-ttl__en">Reservation</span><span class="k-ttl__jp">Your one-line booking perk here</span></h2>
        <div class="k-form-slot" data-form-home><div class="k-search__inner" data-slot="reserve-form">
          <form class="k-form" onsubmit="return false">
            <div class="k-form__row">
              <div class="k-field k-field--date"><label>Check-in</label><span class="k-field__big" data-today>0000/00/00</span>${I.cal}</div>
              <div class="k-field"><label>Beat count</label><span class="k-field__big">1</span><span class="k-field__unit">Gourd</span>${I.chev}</div>
              <div class="k-field"><label>Guests per Room</label><span class="k-field__big">2</span><span class="k-field__unit">Name</span>${I.chev}</div>
              <div class="k-field"><label>Number of rooms</label><span class="k-field__big">1</span><span class="k-field__unit">Thread</span>${I.chev}</div>
              <div class="k-form__btns"><button class="k-form__go" type="button">Search${I.search}</button><a class="k-form__plans" href="#">Plan list</a></div>
            </div>
          </form>
          <div class="k-search__other">
            <p>Phone reservations·inquiries &nbsp;TEL.<span class="k-search__tel">0000-00-0000</span></p>
            <a class="k-search__link" href="#">Check, change or cancel reservations here</a>
          </div>
        </div></div>
      </section>
      <footer class="k-foot" data-slot="footer-info">
        <div class="k-foot__info">
          ${logo()}
          <p class="k-foot__name">Region name Hotel name</p>
          <p class="k-foot__add">〒000-0000 Address goes here in one line 0000-0<br>TEL：0000-00-0000 / FAX：0000-00-0000</p>
          <p class="k-foot__sns">Follow us <a href="#" aria-label="SNS">${I.ig}</a></p>
        </div>
        <nav class="k-fnav" aria-label="Site Menu">
          <ul><li><a href="index.html">HOME</a></li><li><a href="index.html#restaurant">Menu 4</a></li><li><a href="index.html#facilities">Menu 5</a></li><li><a href="#">Menu 10</a></li></ul>
          <ul><li><a href="about.html">Menu 2</a></li><li><a href="index.html#other">Menu 7</a></li><li><a href="index.html#other">Menu 9</a></li><li><a href="#">Menu 11</a></li></ul>
          <ul><li><a href="service.html">Menu 3</a></li><li><a href="index.html#other">Menu 8</a></li><li><a href="index.html#access">Menu 6</a></li><li><a href="news.html">Menu 12</a></li></ul>
        </nav>
        <nav class="k-foot__onav" aria-label="Regulation"><a href="#">Rules Link 1</a><a href="#">Rule 2</a><a href="#">Rule 3</a><a href="#">Your policy link goes here 4</a><a href="#">Guide 5 ↗</a></nav>
        <div class="k-foot__lang"><a href="#">Lang 1</a><a href="#">Language 2</a><a href="#">Language 3</a><a href="#">Language 4</a></div>
        <div class="k-partners"><span class="wf-logo">Partner Member Logo</span><span class="wf-logo">Partnership 1</span><span class="wf-logo">Partnership 2</span><span class="wf-logo">Partnership 3</span></div>
        <p class="k-copy">© 0000 Hotel Name All right reserved.</p>
      </footer>`;
  }

  const today = new Date();
  const ymd = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  document.querySelectorAll("[data-today]").forEach((el) => (el.textContent = ymd));

  // Split letters: random-delay letters, each line .1s later (only at width 768 or more — the original also decides once on first load)
  document.querySelectorAll(".k-rand").forEach((el) => {
    const t = el.textContent.trim();
    el.textContent = "";
    const f = document.createDocumentFragment();
    [...t].forEach((ch) => {
      const i = document.createElement("i");
      i.textContent = ch;
      i.style.transitionDelay = (0.2 + 0.8 * Math.random()).toFixed(2) + "s";
      f.appendChild(i);
    });
    el.appendChild(f);
  });
  if (matchMedia("(min-width: 768px)").matches) {
    document.querySelectorAll(".k-lines").forEach((el) => {
      const lines = el.innerHTML.split(/<br\s*\/?>/i).map((s) => s.trim());
      el.innerHTML = lines.map((s, i) => `<span class="l" style="transition-delay:${(0.1 * i).toFixed(1)}s">${s}</span>`).join("<br>");
    });
  }

  const mm = gsap.matchMedia();
  mm.add({ reduce: "(prefers-reduced-motion: reduce)", ok: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    const items = document.querySelectorAll(".k-rv");
    if (ctx.conditions.reduce) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    // Original builds Lenis 1.0.18 with no options (lerp .1, smooth wheel only) — the UMD build’s global name is lowercase lenis
    const LenisCtor = window.Lenis || window.lenis;
    K.lenis = new LenisCtor();
    const raf = (t) => { K.lenis.raf(t); K.rafId = requestAnimationFrame(raf); };
    K.rafId = requestAnimationFrame(raf);
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }),
      { threshold: 0.2 }
    );
    items.forEach((el) => io.observe(el));
    return () => { io.disconnect(); cancelAnimationFrame(K.rafId); K.lenis.destroy(); K.lenis = null; };
  });

  // Forest green tint: on the first page when 40% of the range is visible (phone 20%), on subpages when it enters the top half of the screen (the original differs between the two as well).
  const greens = [...document.querySelectorAll("[data-green]")];
  if (greens.length) {
    if (document.body.dataset.darken === "half") {
      const on = new Set();
      const tab = innerWidth >= 768 && innerWidth <= 1199;
      const io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => (e.isIntersecting ? on.add(e.target) : on.delete(e.target)));
          document.body.classList.toggle("is-darken", on.size > 0);
        },
        tab ? { threshold: 0.2 } : { rootMargin: "0px 0px -50% 0px", threshold: 0 }
      );
      greens.forEach((g) => io.observe(g));
    } else {
      const t = innerWidth <= 767 ? 0.2 : 0.4;
      const ratios = greens.map(() => 0);
      const io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => (ratios[greens.indexOf(e.target)] = e.intersectionRatio));
          document.body.classList.toggle("is-darken", ratios.some((r) => r >= t));
        },
        { threshold: [0, t] }
      );
      greens.forEach((g) => io.observe(g));
    }
  }

  // Scrolling below the hero (.k-fv · .k-pfv) turns on the fixed button · logo · back-to-top tab
  const fv = document.querySelector("[data-fv]");
  const pas = () => {
    const past = fv ? scrollY > fv.offsetTop + fv.offsetHeight : scrollY > 400;
    document.body.classList.toggle("is-past-fv", past);
  };
  addEventListener("scroll", pas, { passive: true });
  pas();

  // Fixed photo window is shown only while it overlaps the screen
  const pars = document.querySelectorAll(".k-parallax");
  const parCheck = () => pars.forEach((p) => {
    const r = p.getBoundingClientRect();
    p.classList.toggle("is-active", r.bottom > 0 && r.top < innerHeight);
  });
  if (pars.length) { addEventListener("scroll", parCheck, { passive: true }); addEventListener("resize", parCheck); parCheck(); }

  // Expand: language · booking lists, drawer submenus — a height tween instead of jQuery slideToggle(300). jQuery’s default curve swing (.5 − cos(πt)/2) is the same formula as sine.inOut
  const slide = (el, open) => {
    gsap.killTweensOf(el);
    if (open) {
      el.style.display = "block";
      gsap.fromTo(el, { height: 0, overflow: "hidden" }, { height: "auto", duration: 0.3, ease: "sine.inOut", clearProps: "height,overflow" });
    } else {
      gsap.to(el, { height: 0, overflow: "hidden", duration: 0.3, ease: "sine.inOut", onComplete: () => { el.style.display = "none"; gsap.set(el, { clearProps: "height,overflow" }); } });
    }
  };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-drop] > button");
    if (btn) {
      const box = btn.parentElement;
      const open = !box.classList.contains("is-open");
      box.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
      slide(box.querySelector("[data-drop-list]"), open);
      return;
    }
    const acc = e.target.closest("[data-acc]");
    if (acc) {
      const open = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", open);
      slide(acc.nextElementSibling, open);
    }
  });

  // Menu drawer: opening stops scroll, closing resumes
  const menu = document.getElementById("k-menu");
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", !open);
    document.body.classList.toggle("is-menu-open", open);
    document.querySelectorAll("[data-menu-open]").forEach((b) => b.setAttribute("aria-expanded", open));
    // Original calls lenis.destroy() on open and start() on close — once opened, smooth scroll never comes back (original quirk kept as is)
    if (K.lenis) open ? K.lenis.destroy() : K.lenis.start();
  };
  document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", () => setMenu(true)));
  menu.querySelectorAll("[data-menu-close]").forEach((b) => b.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  document.querySelectorAll('a[href="#top"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      K.lenis ? K.lenis.scrollTo(0, { duration: 1 }) : scrollTo({ top: 0 });
    })
  );
})();
