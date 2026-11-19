// Shared across pages: header, hamburger, Footer, floating Contact button, video window, Lenis, scroll reveal engine.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NAV = [
    ["home", "index.html", "Home"],
    ["product", "product.html", "Product"],
    ["story", "index.html#story", "Brand Story"],
    ["review", "review.html", "Review"],
    ["faq", "faq.html", "FAQ"],
  ];
  const CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.6 7.4l.7-.7 5.3 5.3-5.3 5.3-.7-.7 4.6-4.6z"/></svg>';
  const HR = '<svg viewBox="0 0 1440 115" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0C330 150 1110 150 1440 0V115H0Z"/></svg>';
  window.yrHr = HR;
  window.yrChevron = CHEVRON;

  // Hover over PRODUCT and a screen-wide drawer opens with five product cells (original l-header__sub)
  const SUB = `<div class="yr-sub" data-slot="product-drawer"><div class="yr-sub__wrap"><ul class="yr-sub__ul">${[
    ["Cushion sofa cutout · Front view", "Product name"], ["Slipcovered sofa · Front view", "Product cover<br><small>(Material A)</small>"], ["Slipcovered sofa · angled", "Product cover<br><small>(Material B)</small>"], ["Arch cushion cutout", "New Product Name"], ["Padded envelope cutout", "Filling material name"],
  ].map(([l, t]) => `<li><a href="product.html"><div class="wf-img" data-label="${l} · Square"></div><p>${t}</p></a></li>`).join("")}</ul></div></div>`;
  const header = document.querySelector('header[data-slot="header"]');
  if (header) {
    header.classList.add("yr-header");
    header.dataset.headerState = page === "home" ? "alt" : "normal";
    header.innerHTML = `
      <div class="yr-header__wrap"><div class="yr-header__inner">
        <div class="yr-header__hbg"><button class="yr-hbg" type="button" data-hbg><span class="menu">MENU</span><span class="close">CLOSE</span></button></div>
        <div class="yr-header__head"><a class="yr-header__logo" href="index.html" data-label="Brand English Wordmark">WORDMARK</a></div>
        <div class="yr-header__body"><nav><ul class="yr-nav">${NAV.map(([k, h, t]) => `<li class="yr-nav__li${k === page ? " is-active" : ""}${k === "product" ? " has-child" : ""}"><a class="yr-nav__link" href="${h}">${t}</a>${k === "product" ? SUB : ""}</li>`).join("")}</ul></nav></div>
        <div class="yr-header__foot"><a class="yr-header__cart" href="#">Cart <span class="yr-num">(0)</span></a></div>
      </div></div>`;
    const modal = document.createElement("div");
    modal.className = "yr-hbg-modal";
    modal.dataset.slot = "mobile-menu";
    modal.innerHTML = `<div class="yr-hbg-modal__wrap"><nav><ul>${NAV.map(([k, h, t]) => `<li class="yr-hbg-modal__li"><a class="yr-hbg-modal__link" href="${h}">${t}</a>${k === "product" ? SUB.replace(/yr-sub/g, "yr-hbg-sub").replace(" data-slot=\"product-drawer\"", "") : ""}</li>`).join("")}</ul></nav>
      <div class="yr-hbg-modal__foot">Your one-line terms and privacy links here</div></div>`;
    header.after(modal);
    const overlay = document.createElement("div");
    overlay.className = "yr-header-overlay";
    header.after(overlay);
    header.querySelectorAll(".yr-nav__li.has-child").forEach((li) => {
      li.addEventListener("mouseenter", () => header.classList.add("is-child_hv"));
      li.addEventListener("mouseleave", () => header.classList.remove("is-child_hv"));
    });
    header.querySelector("[data-hbg]").addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.toggle("is-nav_open");
    });
    modal.addEventListener("click", (e) => { if (e.target.closest("a")) document.body.classList.remove("is-nav_open"); });
  }

  // Photo blob shape: superellipse |x|^2.5 + |y|^2.5 = Clip path with 1 drawn across 0~1 cells
  const se = [];
  for (let k = 0; k <= 96; k++) {
    const t = (k / 96) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    se.push(`${(0.5 + 0.5 * Math.sign(c) * Math.abs(c) ** 0.8).toFixed(4)} ${(0.5 + 0.5 * Math.sign(s) * Math.abs(s) ** 0.8).toFixed(4)}`);
  }
  document.body.insertAdjacentHTML("afterbegin", `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><clipPath id="yr-squircle" clipPathUnits="objectBoundingBox"><path d="M${se.join("L")}Z"/></clipPath></svg>`);
  document.querySelectorAll("[data-hr]").forEach((el) => { el.innerHTML = HR; });

  // Review list (6 on the first page · many on the reviews page) — star rating, title, body folded to 4 lines, name, date, PR label
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8Z"/></svg>';
  const TITLES = ["Review title goes here!", "Your short review title here", "Your slightly long review title here", "One-line review title", "Your review title here", "Your happy review title here!"];
  document.querySelectorAll("[data-review-list]").forEach((list) => {
    const n = +list.dataset.count || 6;
    const card = list.hasAttribute("data-review-card");
    list.innerHTML = Array.from({ length: n }, (_, i) => {
      const stars = 5 - (i % 4 === 3 ? 2 : i % 5 === 4 ? 1 : 0);
      return `<article class="yr-review${card ? " is-card" : ""}"><div class="yr-review__wrap">
        <div class="yr-review__img"><div class="wf-img" data-label="Buyer photo · cushion at home · square"></div></div>
        <div class="yr-review__body">
          <div class="yr-review__stars" aria-label="Per ${stars}Dog">${Array.from({ length: 5 }, (_, k) => `<span class="${k < stars ? "is-on" : ""}">${STAR}</span>`).join("")}</div>
          <h3 class="yr-review__title">${TITLES[i % TITLES.length]}</h3>
          <p class="yr-review__text is-collapsed">Your review body goes here. Write two or three sentences on how it felt to receive it. Describe how it feels to sit in and how it looks in the room, and add one line on how the family uses it. If long, it folds at four lines and opens with ”Read more”. Here the text runs a little further. Add one sentence each on what was good and what was lacking while using it, plus a note on changing the cover or how it felt after washing. Finish with one line on who you would recommend it to.</p>
          ${card ? '<button class="yr-review__more" type="button"><span>See more</span></button>' : ""}
          <div class="yr-review__foot"><span class="yr-review__author">Name 0${i + 1}</span><span class="yr-review__date yr-num">2025.12.0${(i % 9) + 1}</span><span class="yr-review__pr">PR</span></div>
        </div>
      </div></article>`;
    }).join("");
    // Original: on press the button drops out at once and the body opens from the folded height to full height with max-height .4s (does not fold again)
    list.querySelectorAll(".yr-review__more").forEach((b) => b.addEventListener("click", () => {
      const t = b.previousElementSibling;
      t.style.maxHeight = `${t.clientHeight}px`;
      t.classList.remove("is-collapsed");
      t.classList.add("is-expanded");
      b.hidden = true;
      requestAnimationFrame(() => { t.style.maxHeight = `${t.scrollHeight}px`; });
      t.addEventListener("transitionend", () => { t.style.maxHeight = "none"; window.yrMeasure?.(); }, { once: true });
    }));
  });

  const footer = document.querySelector('footer[data-slot="footer"]');
  if (footer) {
    footer.classList.add("yr-footer", "js-invertArea");
    footer.innerHTML = `
      <div class="yr-hr">${HR}</div>
      <div class="yr-footer__wrap">
        <div class="yr-footer__head">
          <span class="yr-footer__eyebrow">Brand Story</span>
          <span class="yr-footer__copy">Your brand line here,<br>Break into two lines.</span>
          <p class="yr-footer__en">A short brand line set in small capitals across two lines,<br>with one more line of quiet English copy below it.</p>
          <ul class="yr-footer__product js-sa__list">
            ${["Ivory", "Cool Gray", "Terracotta", "Moss green", "Sand beige"].map((c) => `<li><div class="wf-img" data-label="Cushion sofa cutout · ${c} · Front view 1:1"></div></li>`).join("")}
          </ul>
        </div>
        <div class="yr-footer__inner">
          <div class="yr-footer__left">
            <nav class="yr-footer__nav"><ul>${NAV.map(([, h, t]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></nav>
            <div class="yr-footer__sns"><p>SNS</p>
              <a href="#" aria-label="SNS 1"><svg viewBox="0 0 24 24"><path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 1.6A2.4 2.4 0 0 0 4.6 7v10A2.4 2.4 0 0 0 7 19.4h10a2.4 2.4 0 0 0 2.4-2.4V7A2.4 2.4 0 0 0 17 4.6Zm5 3.4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 1.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8ZM17 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg></a>
              <a href="#" aria-label="SNS 2"><svg viewBox="0 0 24 24"><path d="M4 4h4.6l4 5.6L17.4 4H20l-6.2 7.2L20.6 20H16l-4.4-6.1L6.4 20H3.8l6.6-7.6Z"/></svg></a>
              <a href="#" aria-label="SNS 3"><svg viewBox="0 0 24 24"><path d="M4 7.5C4 6 5 5 6.5 5h11C19 5 20 6 20 7.5v9c0 1.5-1 2.5-2.5 2.5h-11C5 19 4 18 4 16.5Zm6 1.5v6l5-3Z"/></svg></a>
              <a href="#" aria-label="SNS 4"><svg viewBox="0 0 24 24"><path d="M13 3h2.6c.3 2 1.6 3.4 3.6 3.6v2.6c-1.4 0-2.6-.4-3.6-1.1V15a5 5 0 1 1-5-5v2.6a2.4 2.4 0 1 0 2.4 2.4Z"/></svg></a>
            </div>
          </div>
          <div class="yr-footer__center">
            <p><span>Brandnew Item Line</span></p>
            <a class="yr-footer__logo" href="index.html" data-label="Brand abbreviation logo (4 letters)"><span>W</span><span>D</span><span>M</span><span>K</span></a>
          </div>
          <div class="yr-footer__right">
            <nav class="yr-footer__subnav"><ul>${["Privacy policy", "Terms of service", "Seller Info", "Security Rules", "Operating company"].map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></nav>
            <div class="yr-footer__copyright">© Brand Name</div>
          </div>
        </div>
      </div>`;
  }

  const floating = document.createElement("div");
  floating.className = "yr-floating";
  floating.dataset.slot = "floating-chat";
  if (page === "home") floating.setAttribute("data-floating-top", "");
  floating.innerHTML = `<div class="yr-floating__wrap">
      <button class="yr-chat" type="button" aria-label="Consultation"><svg viewBox="0 0 24 24"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3v-3h0.5A2.5 2.5 0 0 1 5 13.5Z"/><path d="M9 10h.01M12 10h.01M15 10h.01" stroke-linecap="round" stroke-width="2"/></svg><span>Consultation</span></button>
      ${page === "home" ? `<a class="yr-banner" href="product.html" data-slot="new-banner"><span class="yr-banner__badge">NEW</span><div class="wf-img" data-label="New Product Photo"></div><span>Your one-line new product alert here,<br>Second-line product name</span></a>` : ""}
    </div>`;
  document.body.append(floating);

  const videoModal = document.querySelector("[data-modal-content]");
  // Original js-modal: turn the backdrop on over 300ms linear, then the content over .4s cubic-bezier(.645,.045,.355,1) — on close, the whole thing including the backdrop goes off over 300ms linear
  const fade = (el, to, ms, done) => {
    const from = +getComputedStyle(el).opacity, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      el.style.opacity = from + (to - from) * p;
      if (p < 1) requestAnimationFrame(step); else done?.();
    };
    requestAnimationFrame(step);
  };
  if (videoModal) {
    const inner = videoModal.querySelector(".yr-modal__inner");
    document.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      videoModal.style.display = "grid";
      videoModal.style.opacity = 0;
      document.body.classList.add("is-modal-open");
      fade(videoModal, 1, reduce ? 0 : 300, () => inner?.classList.add("is-active"));
    }));
    videoModal.addEventListener("click", (e) => {
      if (e.target !== videoModal && !e.target.closest("[data-modal-close]")) return;
      fade(videoModal, 0, reduce ? 0 : 300, () => {
        videoModal.style.display = "none";
        inner?.classList.remove("is-active");
        document.body.classList.remove("is-modal-open");
      });
    });
  }

  // Split big English heading letters — word chunks stay intact, line number as --line
  document.querySelectorAll(".js-textAnimation [data-split]").forEach((el) => {
    let line = 0;
    const out = [];
    el.childNodes.forEach((n) => {
      if (n.nodeName === "BR") { out.push("<br>"); line += 1; return; }
      (n.textContent || "").split(/(\s+)/).forEach((w) => {
        if (!w) return;
        if (/^\s+$/.test(w)) { out.push(" "); return; }
        out.push(`<span class="yr-chars" style="--line:${line}">${[...w].map((c) => `<span class="char">${c}</span>`).join("")}</span>`);
      });
    });
    el.innerHTML = out.join("");
  });
  const textIo = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("isActive")), { threshold: 0.2 });
  document.querySelectorAll(".js-textAnimation").forEach((el) => textIo.observe(el));

  // Scroll engine of original index.js: per element --progressFull (0 when entering the screen → 1 when leaving),
  // When the top edge crosses the 80% line of the screen it becomes is-sa · at the 50% line it becomes is-saHalf (once only if is-once), and the most visible section is the current section
  let items = [], sections = [], invertAreas = [];
  const invertTargets = [...document.querySelectorAll(".yr-header__logo, .yr-nav__link, .yr-header__cart, .yr-hbg")];
  const measure = () => {
    const y = scrollY;
    items = [...document.querySelectorAll('[class*="js-sa"], [data-progress], main > section, .yr-footer')].map((el) => ({ el, top: 0, h: 0 }));
    sections = items.filter((i) => i.el.matches("main > section, .yr-footer"));
    invertAreas = [...document.querySelectorAll(".js-invertArea:not([hidden])")];
    items.forEach((i) => { const r = i.el.getBoundingClientRect(); i.top = r.top + y; i.h = r.height; });
  };
  let current = null;
  const tick = () => {
    const y = scrollY, vh = innerHeight;
    for (const i of items) {
      const bottom = i.top + i.h;
      const full = Math.min(1, Math.max(0, (y + vh - i.top) / (vh + i.h)));
      i.el.style.setProperty("--progressFull", full.toFixed(4));
      const active = i.top <= y + vh * 0.8 && bottom > y;
      const half = i.top <= y + vh * 0.5;
      if (i.el.classList.contains("is-once")) {
        if (active) i.el.classList.add("is-sa");
        if (half) i.el.classList.add("is-saHalf");
      } else {
        i.el.classList.toggle("is-sa", active || reduce);
        i.el.classList.toggle("is-saHalf", half || reduce);
      }
    }
    let best = null, bestShare = 0;
    for (const s of sections) {
      const share = Math.max(0, Math.min(s.top + s.h, y + vh) - Math.max(s.top, y)) / vh;
      if (share > bestShare + 0.02) { bestShare = share; best = s; }
    }
    if (best && best.el !== current && header) {
      const wasFooter = current?.classList.contains("yr-footer");
      current = best.el;
      if (current.classList.contains("yr-footer")) {
        header.classList.remove("is-header-animate");
        header.classList.add("is-hidden");
      } else if (wasFooter) {
        header.classList.remove("is-hidden");
        header.style.animation = "none";
        void header.offsetWidth;
        header.style.animation = "";
        header.classList.add("is-header-animate");
      }
    }
    for (const t of invertTargets) {
      const r = t.getBoundingClientRect();
      const cy = y + r.top + r.height / 2;
      t.classList.toggle("is-invert", invertAreas.some((a) => { const b = a.getBoundingClientRect(); return cy >= y + b.top && cy <= y + b.bottom; }));
    }
    const nearFooter = footer && y + vh >= footer.getBoundingClientRect().top + y;
    floating.classList.toggle("is-active", floating.hasAttribute("data-floating-top") ? !nearFooter : !nearFooter && y > 0);
    floating.classList.toggle("is-scrolled", y > 0);
  };
  window.yrMeasure = () => { measure(); tick(); };

  // While the hero is visible the header is in center mode (observed in the original TopMv)
  const hero = document.querySelector("[data-header-alt]");
  if (hero && header) {
    const alt = () => {
      if (header.dataset.headerState === "alt" && document.body.classList.contains("is-header-alt")) return;
      header.dataset.headerState = "alt";
      header.classList.remove("is-header-animate");
      document.body.classList.add("is-header-alt");
    };
    const normal = () => {
      if (header.dataset.headerState !== "normal") {
        header.classList.remove("is-header-animate");
        void header.offsetWidth;
        header.classList.add("is-header-animate");
      }
      header.dataset.headerState = "normal";
      document.body.classList.remove("is-header-alt");
    };
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && e.intersectionRatio > 0 ? alt() : normal())), { threshold: [0, 0.2, 0.6] }).observe(hero);
    const r = hero.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) alt(); else normal();
  }

  let lenis = null;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    lenis = new Lenis({ duration: 1.3, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, prevent: (n) => n.closest(".yr-modal") !== null || n.hasAttribute("data-lenis-prevent") });
    window.lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); window.lenis = null; };
  });
  addEventListener("scroll", tick, { passive: true });
  addEventListener("resize", () => window.yrMeasure());
  new ResizeObserver(() => window.yrMeasure()).observe(document.body);
  window.yrMeasure();
  document.body.classList.add("is-ready");
  // Like the original, main turns on at load — before that only the background, header and consult button show
  const loaded = () => { document.body.classList.add("is-load"); window.yrMeasure(); };
  if (document.readyState === "complete") loaded(); else addEventListener("load", loaded, { once: true });

  // Same-page moves (#story) glide with Lenis
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a || !lenis) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const t = document.querySelector(url.hash);
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t);
  });
})();
