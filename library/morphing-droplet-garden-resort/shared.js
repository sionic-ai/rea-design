// Common to all pages: renders the header (static·fixed), mega menu, drawer, booking window, side booking tab, booking section and footer,
// Hooks up smooth scroll, white-film page transition, entrance, droplet cropping and droplet cursor.
// Original values: white curtain .8s ease · move after .7s · entrance 25px 1.2s ease-out · fixed header scaleY .3s · mega underline .2s · cursor 1.2s cubic-bezier(.25,1,.5,1) ×1.3
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const BP = 750;
  const TD = (window.TD = { reduced, page, BP, lenis: null });

  const arrow = '<svg class="td-arrow" viewBox="0 0 20 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 5h18.5M14.5 1l4 4-4 4"/></svg>';
  const plus = '<svg class="td-plus" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 5h10M5 0v10"/></svg>';
  TD.icons = { arrow, plus };

  /* ---------- Blob: make closed curves with the same number of nodes as seeds so they morph into each other ---------- */
  const rng = (s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  TD.blob = (seed, o = {}) => {
    const { n = 6, stretch = 0.66, rot = -38, jitter = 0.16, box = [0, 0, 1, 1] } = o;
    const r = rng(seed * 7919 + 17);
    const th = (rot * Math.PI) / 180;
    let pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.5;
      const k = 1 + (r() - 0.5) * 2 * jitter;
      const x = Math.cos(a) * k, y = Math.sin(a) * k * stretch;
      pts.push([x * Math.cos(th) - y * Math.sin(th), x * Math.sin(th) + y * Math.cos(th)]);
    }
    // Measures up to how far the curve bulges beyond the points so the box is filled snugly
    const seg = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      seg.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
    }
    let mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9;
    seg.forEach(([a, b, c, d]) => {
      for (let t = 0; t <= 1; t += 0.05) {
        const u = 1 - t;
        const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0];
        const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1];
        mnx = Math.min(mnx, x); mxx = Math.max(mxx, x); mny = Math.min(mny, y); mxy = Math.max(mxy, y);
      }
    });
    const [bx, by, bw, bh] = box;
    const f = (p) => `${(bx + ((p[0] - mnx) / (mxx - mnx)) * bw).toFixed(4)} ${(by + ((p[1] - mny) / (mxy - mny)) * bh).toFixed(4)}`;
    return `M${f(seg[0][0])}` + seg.map(([, b, c, d]) => `C${f(b)} ${f(c)} ${f(d)}`).join("") + "Z";
  };

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("class", "td-defs");
  defs.setAttribute("aria-hidden", "true");
  defs.innerHTML = "<defs></defs>";
  document.body.prepend(defs);
  TD.clip = (id, d) => {
    let cp = defs.querySelector("#" + id);
    if (!cp) {
      defs.firstChild.insertAdjacentHTML("beforeend", `<clipPath id="${id}" clipPathUnits="objectBoundingBox"><path d="${d}"/></clipPath>`);
      cp = defs.querySelector("#" + id);
    }
    return cp.firstChild;
  };
  // data-blob="Seeds, slope, flatness" If so, that spot is cut out with droplets
  document.querySelectorAll("[data-blob]").forEach((el) => {
    const [seed, rot, stretch] = el.dataset.blob.split(",").map(Number);
    const id = "td-blob-" + seed + "-" + (rot || 0) + "-" + String(stretch || 0).replace(".", "");
    TD.clip(id, TD.blob(seed, { rot: rot ?? -38, stretch: stretch || 0.66 }));
    el.style.clipPath = `url(#${id})`;
    el.classList.add("is-blob");
  });

  /* ---------- Header ---------- */
  const nav = [
    { key: "concept", label: "Concept", href: "about.html", mega: [["about.html", "About the Concept", "View of the building from the garden side · sunny day · landscape 3:2"], ["about.html#story", "Story", "Two people strolling in tree shade · backlit · landscape 3:2"], ["recruit.html", "Hiring", "Staff member in an apron smiling · indoor natural light · landscape 3:2"]] },
    { key: "garden", label: "Garden", href: "about.html#garden" },
    { key: "hotel", label: "Lodging", href: "index.html#hotel", mega: [["index.html#hotel", "Main building", "Guest room with a forest view outside the window · morning light · landscape 3:2"], ["index.html#hotel", "Annex", "Wooden deck and chair · green shade · landscape 3:2"], ["index.html#hotel", "Log cabin", "Log cabin exterior in a forest · midday · landscape 3:2"], ["index.html#hotel", "Room Guide", "Bedside detail · warm lighting · landscape 3:2"]] },
    { key: "bbq", label: "BBQ", href: "service.html", mega: [["service.html", "Usage guide", "Barbecue area under a roof with guests · clear daytime · landscape 3:2"], ["product.html", "Menu", "Meat and vegetables on a griddle · flames · top view 3:2"], ["service.html#faq", "Group guests", "Group gathered at a long table · evening sunset · landscape 3:2"]] },
    { key: "grill", label: "Grill", href: "index.html#grill" },
    { key: "experience", label: "Experience", href: "index.html#experience" },
  ];
  const cur = (k) => ((page === k || (k === "concept" && (page === "about" || page === "recruit")) || (k === "bbq" && (page === "product" || page === "service"))) ? " is-current" : "");
  const logo = (cls = "") => `<a class="td-logo ${cls}" href="index.html" aria-label="Home"><span class="td-logo__a">Wordmark</span><span class="td-logo__b">Place</span></a>`;
  const megaPanel = (it) =>
    it.mega
      ? `<div class="td-mega"><div class="td-mega__in">${it.mega.map(([h, t, l]) => `<a class="td-mega__card" href="${h}"><div class="td-scale"><div class="wf-img td-mega__img" data-label="${l}"></div></div><p>${t} ${arrow}</p></a>`).join("")}</div></div>`
      : "";
  const headInner = () => `
    <div class="td-head__in">
      ${logo()}
      <nav class="td-nav" aria-label="Main menu">
        ${nav.map((it) => `<div class="td-nav__item td-nav__item--${it.key}${it.mega ? " has-mega" : ""}"><a class="td-nav__link${cur(it.key)}" href="${it.href}"><span class="td-nav__mark">${it.label}</span></a>${megaPanel(it)}</div>`).join("")}
      </nav>
      <div class="td-head__right">
        <div class="td-lang"><button class="td-lang__btn" type="button">ko</button><div class="td-lang__menu"><a href="#">ko</a><a href="#">en</a><a href="#">zh</a></div></div>
        <button class="td-burger" type="button" aria-label="Open Menu"><svg class="td-burger__shape" viewBox="0 0 32 32"><path d="${TD.blob(3, { rot: -20, stretch: 0.92, jitter: 0.06, box: [0, 0, 32, 32] })}"/></svg><i></i><i></i><i></i></button>
        <button class="td-head__reserve" type="button" data-reserve-open>Reservation</button>
      </div>
    </div>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("td-head", "td-head--static");
    if (head.dataset.tone === "white") head.classList.add("is-white");
    head.innerHTML = headInner();
    head.insertAdjacentHTML(
      "afterend",
      `<div class="td-head td-head--fix" data-slot="header-fixed" aria-hidden="true">${headInner()}</div>
      <aside class="td-drawer" data-slot="drawer" aria-label="Full menu">
        <div class="td-drawer__left"><div class="wf-img" data-label="Path between garden lawn and trees · morning fog · portrait 2:3"></div></div>
        ${logo("td-logo--drawer")}
        <div class="td-drawer__right">
          <div class="td-drawer__head"><span class="td-drawer__lang">ko</span><button class="td-drawer__close" type="button">Close</button></div>
          <nav class="td-drawer__nav">
            ${nav.map((it) => it.mega
              ? `<div class="td-drawer__group"><button class="td-drawer__switch" type="button">${it.label}${plus}</button><div class="td-drawer__child">${it.mega.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div></div>`
              : `<a class="td-drawer__link" href="${it.href}">${it.label}</a>`).join("")}
            <a class="td-drawer__link" href="news.html">News</a>
          </nav>
          <div class="td-drawer__sub"><a href="#">Facility Guide</a><a href="service.html#faq">Frequently asked questions</a><a href="#">Guide booklet</a><a href="#">Getting here</a><a href="recruit.html">Hiring</a><a href="#">Inquiry</a></div>
          <button class="td-drawer__reserve" type="button" data-reserve-open>Reservation <span>Reservation</span></button>
        </div>
      </aside>
      <div class="td-pop" data-slot="reservation-pop" role="dialog" aria-modal="true" aria-label="Reservation">
        <button class="td-pop__close" type="button">Close</button>
        <div class="td-pop__scroll" data-lenis-prevent><section class="td-resv" data-reservation></section></div>
      </div>
      <div class="td-side" data-slot="side-reserve"><button class="td-side__tab" type="button" data-reserve-open><span>Reservation</span><span class="en">reservation</span></button></div>
      <button class="td-float" type="button" data-reserve-open data-slot="float-reserve">Reservation <span>Reservation</span></button>`
    );
  }

  /* ---------- Booking section: hovering a button switches the left photo to that facility’s ---------- */
  const resvHTML = `
    <div class="td-resv__left">
      <div class="wf-img td-resv__img is-show" data-k="0" data-label="Lawn garden, large tree and low-roofed building · clear daytime · near-portrait 4:5"></div>
      <div class="wf-img td-resv__img" data-k="1" data-label="Guest room window with a forest view · morning light · 4:5"></div>
      <div class="wf-img td-resv__img" data-k="2" data-label="Meat and vegetables on a grill · Flames · 4:5"></div>
      <div class="wf-img td-resv__img" data-k="3" data-label="Garden-side restaurant table setting · window natural light · 4:5"></div>
    </div>
    <div class="td-resv__right">
      <div class="td-resv__box">
        <h2 class="td-resv__title">Reservation</h2>
        <p class="td-resv__lead">Your one-line reservation notice here.<br>Your short second line here.</p>
        <ul class="td-resv__list">
          <li><a class="td-resv__btn" href="#" data-k="1">Lodging booking ${arrow}</a><p class="td-resv__tel">Tel.00-0000-0000 Hours 00:00-00:00</p></li>
          <li><a class="td-resv__btn" href="service.html" data-k="2">BBQ ${arrow}</a><p class="td-resv__tel">Tel.00-0000-0000 Hours 00:00-00:00</p></li>
          <li><a class="td-resv__btn" href="#" data-k="3">To draw ${arrow}</a><p class="td-resv__tel">Tel.00-0000-0000 Hours 00:00-00:00</p></li>
        </ul>
        <a class="td-member" href="#">
          <div class="wf-img td-member__img" data-label="Two people having tea on a terrace · tree shade · landscape 3:2"></div>
          <div class="td-member__txt"><span class="td-member__tag">Your tag here</span><strong>Your member guide title here</strong><small>Your one-line benefit goes here</small></div>
        </a>
      </div>
    </div>`;
  document.querySelectorAll("[data-reservation]").forEach((sec) => {
    sec.classList.add("td-resv");
    sec.innerHTML = resvHTML;
    sec.querySelectorAll(".td-resv__btn").forEach((b) => {
      const show = (k) => sec.querySelectorAll(".td-resv__img").forEach((im) => im.classList.toggle("is-show", im.dataset.k === k));
      b.addEventListener("mouseenter", () => show(b.dataset.k));
      b.addEventListener("mouseleave", () => show("0"));
    });
  });

  /* ---------- Footer ---------- */
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("td-foot");
    const contact = (n) => `<div class="td-foot__contact"><strong>Your facility name $ here{n}</strong><p>000-0000 Your address line here</p><p>Tel. 00-0000-0000 / Reception hours 00:00-00:00</p></div>`;
    foot.innerHTML = `
      <div class="td-foot__in">
        <div class="td-foot__brand">
          <div class="td-foot__logo"><svg class="td-foot__blob" viewBox="0 0 100 100"><path d="${TD.blob(11, { rot: -60, stretch: 0.8, jitter: 0.1, box: [0, 0, 100, 100] })}"/></svg>${logo("td-logo--foot")}</div>
          ${contact(1)}${contact(2).replace(/<p>000[^<]*<\/p>/, "")}${contact(3).replace(/<p>000[^<]*<\/p>/, "")}
        </div>
        <div class="td-foot__nav">
          <div><a class="h" href="about.html">Concept</a><a class="s" href="about.html">About the Concept</a><a class="s" href="about.html#story">Story</a></div>
          <div><a class="h" href="about.html#garden">Garden</a></div>
          <div><a class="h" href="index.html#hotel">Lodging</a><a class="s" href="#">Annex</a><a class="s" href="#">Log cabin</a><a class="s" href="#">Main Building · Western Room</a><a class="s" href="#">Main Building · Japanese Room</a></div>
          <div><a class="h" href="service.html">BBQ</a><a class="s" href="service.html">Usage guide</a><a class="s" href="product.html">Menu</a><a class="s" href="#">Group guests</a></div>
          <div><a class="h" href="index.html#grill">Grill</a></div>
        </div>
        <div class="td-foot__more">
          <a class="h" href="index.html#experience">Experience</a>
          <a class="h" href="news.html">News</a>
          <div class="td-foot__grid">
            <a href="#">Facility Guide</a><a href="#">Inquiry</a><a href="#">Camp</a><a href="service.html#faq">Frequently asked questions</a>
            <a href="#">Getting here</a><a href="#">Corporate Workshops</a><a href="#" class="i">Parking Lot</a><a href="#">Guide booklet</a><a href="#" class="i">Nearby Sightseeing</a><a href="recruit.html">Hiring</a><a href="#" class="i pin">Open map</a>
          </div>
          <div class="td-foot__grid td-foot__social"><a href="#">SNS 1</a><a href="#">Messenger 1</a><a href="#">Review site</a><a href="#">Messenger 2</a><a href="#">SNS 2</a><a href="#">Video</a><a href="#">SNS 3</a></div>
          <div class="td-foot__widget"><span class="td-foot__wlogo"></span><a href="#">Your review site notice line here</a><button type="button">Write a review</button></div>
        </div>
        <button class="td-pagetop" type="button">PAGE TOP</button>
      </div>
      <div class="td-foot__bottom"><small>©Wordmark Place</small><div><a href="#">Company info</a><a href="#">Terms of Transaction</a><a href="#">Privacy policy</a></div></div>`;
  }

  /* ---------- Smooth scroll ---------- */
  // Same Lenis 1.0.19 defaults as the original (bundle build new Lenis()) — the npm umd build’s global name is lenis (lowercase). It runs on its own rAF loop like the original.
  const LenisCtor = window.Lenis || window.lenis;
  if (!reduced && LenisCtor) {
    TD.lenis = new LenisCtor();
    TD.lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => { TD.lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  TD.lock = (on) => {
    document.documentElement.classList.toggle("td-locked", on);
    if (TD.lenis) on ? TD.lenis.stop() : TD.lenis.start();
  };

  /* ---------- Drawer · booking window · language · mega ---------- */
  const drawer = document.querySelector(".td-drawer");
  const pop = document.querySelector(".td-pop");
  const setDrawer = (on) => {
    drawer.classList.toggle("is-show", on);
    document.querySelectorAll(".td-burger").forEach((b) => b.classList.toggle("is-active", on));
    TD.lock(on || pop.classList.contains("is-show"));
  };
  document.querySelectorAll(".td-burger").forEach((b) => b.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-show"))));
  drawer.querySelector(".td-drawer__close").addEventListener("click", () => setDrawer(false));
  drawer.querySelector(".td-drawer__left").addEventListener("click", () => setDrawer(false));
  drawer.querySelectorAll(".td-drawer__switch").forEach((sw) =>
    sw.addEventListener("click", () => {
      if (innerWidth > BP) return;
      const open = !sw.classList.contains("is-active");
      drawer.querySelectorAll(".td-drawer__switch").forEach((o) => {
        o.classList.remove("is-active");
        const c = o.nextElementSibling;
        gsap.to(c, { height: 0, duration: 0.4, ease: "power1.inOut" });
      });
      if (open) {
        sw.classList.add("is-active");
        gsap.fromTo(sw.nextElementSibling, { height: 0 }, { height: "auto", duration: 0.4, ease: "power1.inOut" });
      }
    })
  );
  document.querySelectorAll("[data-reserve-open]").forEach((b) =>
    b.addEventListener("click", () => {
      pop.classList.add("is-show");
      TD.lock(true);
    })
  );
  pop.querySelector(".td-pop__close").addEventListener("click", () => {
    pop.classList.remove("is-show");
    TD.lock(drawer.classList.contains("is-show"));
  });
  document.querySelectorAll(".td-lang__btn").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      b.parentElement.classList.toggle("is-active");
    })
  );
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".td-lang")) document.querySelectorAll(".td-lang").forEach((l) => l.classList.remove("is-active"));
  });
  document.querySelectorAll(".td-head").forEach((h) => {
    h.querySelectorAll(".td-nav__item").forEach((it) => {
      it.addEventListener("mouseenter", () => {
        it.classList.add("is-megaOpen");
        if (it.classList.contains("has-mega")) h.classList.add("is-megaOpen");
      });
      it.addEventListener("mouseleave", () => {
        it.classList.remove("is-megaOpen");
        h.classList.remove("is-megaOpen");
      });
    });
  });

  /* ---------- Fixed header: only when scrolling up from below the hero / floating booking button ---------- */
  const fix = document.querySelector(".td-head--fix");
  const float = document.querySelector(".td-float");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const point = Math.max(innerHeight, 650);
    const mobile = innerWidth <= BP;
    fix.classList.toggle("is-fixed", y > point && (mobile || y <= lastY));
    if (!fix.classList.contains("is-fixed")) fix.classList.remove("is-megaOpen");
    float.classList.toggle("is-show", y > point);
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.querySelectorAll(".td-pagetop").forEach((b) =>
    b.addEventListener("click", () => (TD.lenis ? TD.lenis.scrollTo(0, { duration: 0.8 }) : scrollTo({ top: 0, behavior: "smooth" })))
  );

  /* ---------- Page transition: white veil .8s, navigates after .7s ---------- */
  requestAnimationFrame(() => document.body.classList.add("is-pageIn"));
  addEventListener("pageshow", (e) => e.persisted && document.body.classList.add("is-pageIn"));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) {
      if (href === "#") e.preventDefault();
      return;
    }
    const [file, hash] = href.split("#");
    if (!file || location.pathname.endsWith("/" + file)) {
      if (hash) {
        e.preventDefault();
        const t = document.getElementById(hash);
        if (t) TD.lenis ? TD.lenis.scrollTo(t, { offset: -100 }) : t.scrollIntoView();
        setDrawer(false);
      }
      return;
    }
    e.preventDefault();
    setDrawer(false);
    document.body.classList.remove("is-pageIn");
    setTimeout(() => (location.href = href), reduced ? 0 : 700);
  });

  /* ---------- Reveal: original c-anime-fade--move — when the top edge touches the bottom of the screen a class is added and a CSS keyframe plays (25px below · transparent → 1.2s ease-out) ---------- */
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      if (el.dataset.reveal) el.style.setProperty("--reveal-delay", `${Number(el.dataset.reveal) / 1000}s`);
      ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: () => el.classList.add("is-anime") });
    });
  });

  /* ---------- Droplet-outline cursor: follows 1.2s late, 1.3x over photos + View ---------- */
  TD.stalker = (opts = {}) => {
    if (innerWidth < BP || reduced || matchMedia("(hover: none)").matches) return null;
    const box = document.createElement("div");
    box.className = "td-stalker";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = `<div class="td-stalker__shape"><svg viewBox="-2 -2 104 124"><path d="${TD.blob(21, { rot: 70, stretch: 0.8, jitter: 0.12, box: [0, 0, 100, 120] })}"/></svg></div><p class="td-stalker__text">View</p>`;
    document.body.append(box);
    const shape = box.firstElementChild, text = box.lastElementChild;
    shape.style.translate = text.style.translate = `${innerWidth / 2}px ${innerHeight / 2}px`;
    addEventListener("mousemove", (e) => {
      requestAnimationFrame(() => {
        shape.style.translate = `${e.clientX}px ${e.clientY}px`;
        text.style.translate = `${e.clientX}px ${e.clientY}px`;
      });
    });
    const show = (on) => shape.classList.toggle("is-visible", on);
    document.querySelectorAll("[data-hover-view]").forEach((el) => {
      el.addEventListener("mouseenter", () => { shape.style.scale = "1.3"; text.classList.add("is-visible"); });
      el.addEventListener("mouseleave", () => { shape.style.scale = "1"; text.classList.remove("is-visible"); });
    });
    document.querySelectorAll("[data-hover-more]").forEach((el) => {
      el.addEventListener("mouseenter", () => (shape.style.scale = "1.3"));
      el.addEventListener("mouseleave", () => (shape.style.scale = "1"));
    });
    document.addEventListener("mouseleave", () => show(false));
    return { show, el: box };
  };
})();
