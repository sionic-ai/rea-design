// Shared by all pages: draws the header menu (stick, hide, float up, mega menu, phone drawer), footer and transition curtain,
// Hooks up reveal on view, accordion, case slider (embla), photo width growing and photo margin removal.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  if (window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin);

  const I = {
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>',
  };
  // Redrawn original logo table (a grid where five vertical bars shorten like stairs) — wordmark letters are placeholders
  const MARK = '<svg viewBox="0 0 30 18" fill="currentColor" aria-hidden="true"><rect x="0" y="0" width="4" height="18"/><rect x="6.5" y="3" width="4" height="15"/><rect x="13" y="0" width="4" height="18"/><rect x="19.5" y="5" width="4" height="13"/><rect x="26" y="0" width="4" height="18"/></svg>';
  window.iwIcons = I;

  const MENUS = [
    { label: "Products", cols: [
      { t: "Robotics", items: [["detail.html", "Product Name 01", "Your one-line description here"], ["detail.html", "Product Name 02", "Your one-line description here"], ["detail.html", "Product Name 03", "Your one-line description here"]] },
      { t: "Fleet orchestration", items: [["service.html", "Platform Name", "Your one-line description here"]] },
      { t: "Automation infrastructure", items: [["service.html", "Tool Name 01", "Your one-line description here"], ["service.html", "Tool Name 02", "Your one-line description here"]] },
    ] },
    { label: "Solutions", cols: [
      { t: "Industries", items: [["index.html", "Industry Name 01", ""], ["index.html", "Industry Name 02", ""], ["index.html", "Industry Name 03", ""]] },
      { t: "Use cases", items: [["detail.html", "Use Case 01", ""], ["detail.html", "Use Case 02", ""], ["detail.html", "Use Case 03", ""]] },
      { t: "Scale", items: [["service.html", "Scale Step 01", ""], ["service.html", "Scale Step 02", ""]] },
    ] },
    { label: "Company", cols: [{ t: "Company", items: [["about.html", "About", ""], ["about.html", "History", ""], ["about.html", "Careers", ""], ["about.html", "Contact", ""]] }] },
    { label: "Resources", cols: [{ t: "Resources", items: [["index.html", "Blog", ""], ["index.html", "Whitepapers", ""], ["index.html", "Newsroom", ""]] }] },
    { label: "Partnerships", cols: [{ t: "Partnerships", items: [["about.html", "Partner Program", ""], ["about.html", "Become a Partner", ""]] }] },
  ];

  const megaHTML = (m) => `<div class="iw-mega__in">
      <div class="wf-img" data-label="Close-up of yellow-tinted robot parts · dark factory · portrait 1:1"></div>
      ${m.cols.map((c) => `<div class="iw-mega__col"><p class="t-caption">${c.t}</p>${c.items.map(([h, a, b]) => `<a href="${h}"><b class="t-b3">${a}</b>${b ? `<span class="t-caption">${b}</span>` : ""}</a>`).join("")}</div>`).join("")}
    </div>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "iw-head-bar";
    head.innerHTML = `<nav class="iw-nav" aria-label="Main menu">
      <div class="iw-nav__bar">
        <a class="iw-logo" href="index.html" data-label="Brand logo (mark + English wordmark)">${MARK}<span>brandname</span></a>
        <div class="iw-menu">
          <ul>${MENUS.map((m, i) => `<li><button class="iw-menu__trig" type="button" aria-expanded="false" data-mega="${i}">${m.label}${I.down}</button></li>`).join("")}</ul>
          <a class="iw-btn is-white" href="about.html">Contact Sales</a>
          <span class="iw-lang">${I.globe}EN</span>
        </div>
        <button class="iw-burger" type="button" aria-label="Open Menu">${I.menu}</button>
      </div>
      <div class="iw-mega" aria-hidden="true"></div>
    </nav>`;
    document.body.insertAdjacentHTML("afterbegin", `<div class="iw-dim-back"></div>
      <div class="iw-drawer" data-slot="mobile-menu" aria-hidden="true">
        <div class="iw-drawer__main">
          <ul>${MENUS.map((m, i) => `<li><button type="button" data-sub="${i}">${m.label}${I.arrow}</button></li>`).join("")}</ul>
          <a class="iw-btn is-black" href="about.html">Contact Sales</a>
        </div>
        <div class="iw-drawer__sub"></div>
      </div>`);

    const bar = head;
    const mega = head.querySelector(".iw-mega");
    const dim = document.querySelector(".iw-dim-back");
    const trigs = [...head.querySelectorAll(".iw-menu__trig")];
    const light = document.body.dataset.head === "light";
    if (light) bar.classList.add("is-light");

    // Original useHeader: sticks above 12, floats below 90, hides when scrolling down by more than 50
    let lastY = scrollY, docked = scrollY <= 90, shown = true;
    const paint = () => {
      bar.classList.toggle("is-float", !docked && shown);
      bar.classList.toggle("is-hidden", !shown);
      document.documentElement.style.setProperty("--header-shown", shown && !docked ? "1" : "0");
    };
    addEventListener("scroll", () => {
      const y = scrollY;
      const down = y > lastY && y > 50;
      if (y > 90) docked = false; else if (y < 12) docked = true;
      if (!bar.classList.contains("is-open")) shown = !down;
      lastY = y;
      paint();
    }, { passive: true });
    paint();

    let openIdx = -1, closeTimer = 0;
    const openMega = (i) => {
      clearTimeout(closeTimer);
      if (openIdx === i) return;
      openIdx = i;
      trigs.forEach((t, k) => t.setAttribute("aria-expanded", String(k === i)));
      mega.innerHTML = megaHTML(MENUS[i]);
      mega.style.setProperty("--mega-h", `${mega.firstElementChild.scrollHeight}px`);
      mega.classList.remove("is-closing");
      mega.classList.add("is-open");
      mega.setAttribute("aria-hidden", "false");
      bar.classList.add("is-open");
      dim.classList.add("is-on");
    };
    const closeMega = () => {
      if (openIdx < 0) return;
      openIdx = -1;
      trigs.forEach((t) => t.setAttribute("aria-expanded", "false"));
      mega.classList.remove("is-open");
      mega.classList.add("is-closing");
      mega.setAttribute("aria-hidden", "true");
      dim.classList.remove("is-on");
      closeTimer = setTimeout(() => { bar.classList.remove("is-open"); mega.classList.remove("is-closing"); }, 200);
    };
    // Original Radix NavigationMenu — first hover waits 200ms before opening, and if already open it switches instantly
    let openTimer = 0;
    trigs.forEach((t, i) => {
      t.addEventListener("pointerenter", () => { clearTimeout(openTimer); if (openIdx >= 0) openMega(i); else openTimer = setTimeout(() => openMega(i), 200); });
      t.addEventListener("pointerleave", () => clearTimeout(openTimer));
      t.addEventListener("click", () => (openIdx === i ? closeMega() : openMega(i)));
    });
    head.querySelector(".iw-nav").addEventListener("pointerleave", () => { closeTimer = setTimeout(closeMega, 150); });
    head.querySelector(".iw-nav").addEventListener("pointerenter", () => clearTimeout(closeTimer));
    addEventListener("keydown", (e) => e.key === "Escape" && closeMega());

    const drawer = document.querySelector(".iw-drawer");
    const sub = drawer.querySelector(".iw-drawer__sub");
    const burger = head.querySelector(".iw-burger");
    burger.addEventListener("click", () => {
      const open = !drawer.classList.contains("is-open");
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      bar.classList.toggle("is-open-m", open);
      burger.innerHTML = open ? I.close : I.menu;
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      document.documentElement.style.overflow = open ? "hidden" : "";
      if (!open) sub.classList.remove("is-open");
    });
    drawer.querySelectorAll("[data-sub]").forEach((b) => b.addEventListener("click", () => {
      const m = MENUS[+b.dataset.sub];
      sub.innerHTML = `<button class="iw-drawer__back t-label" type="button">${I.back}Back</button>${m.cols.map((c) => `<div><p class="t-b3 is-dim">${c.t}</p>${c.items.map(([h, a, d]) => `<a href="${h}"><b class="t-b1">${a}</b>${d ? `<span class="t-caption">${d}</span>` : ""}</a>`).join("")}</div>`).join("")}`;
      sub.querySelector(".iw-drawer__back").addEventListener("click", () => sub.classList.remove("is-open"));
      requestAnimationFrame(() => sub.classList.add("is-open"));
    }));
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const col = (groups) => `<div class="iw-foot__col">${groups.map(([t, links]) => `<div><p class="t-label">${t}</p>${links.map(([h, a]) => `<a href="${h}">${a}</a>`).join("")}</div>`).join("")}</div>`;
    foot.className = "iw-foot";
    foot.innerHTML = `<div class="iw-foot__top">
        <div class="iw-foot__row">
          <div class="iw-foot__about">
            <p class="t-b2">Here, one sentence on what the company does. Fit it between two and three lines.</p>
            <div class="iw-foot__social">
              <a href="#" aria-label="Professional network"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3zm4 7v8h2.5v-8zm1.25-4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 10v8h2.5v-4.2c0-1.2.6-1.8 1.5-1.8s1.3.6 1.3 1.8V18H19v-4.8c0-2.4-1.3-3.4-3-3.4-1.2 0-2 .6-2.5 1.3V10z"/></svg></a>
              <a href="#" aria-label="Social Media"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18H3zm9 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm5-4.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg></a>
              <a href="#" aria-label="Video"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 7c0-1.7 1.3-3 3-3h14c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H5c-1.7 0-3-1.3-3-3zm8 1.5v7l6-3.5z"/></svg></a>
              <a href="#" aria-label="Code Host"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg></a>
            </div>
            <div class="iw-foot__certs"><div class="wf-img" data-label="Certification Badge"></div><div class="wf-img" data-label="Certification Badge"></div></div>
          </div>
          <div class="iw-foot__cols">
            ${col([["Robotics", [["detail.html", "Product Name 01"], ["detail.html", "Product Name 02"], ["detail.html", "Product Name 03"]]], ["Fleet orchestration", [["service.html", "Platform Name"]]], ["Automation infrastructure", [["service.html", "Tool Name 01"], ["service.html", "Tool Name 02"]]]])}
            ${col([["Solutions", [["index.html", "Industry Name 01"], ["index.html", "Industry Name 02"], ["index.html", "Industry Name 03"], ["index.html", "Use Case 01"], ["index.html", "Use Case 02"], ["index.html", "Use Case 03"], ["index.html", "Scale Step 01"], ["index.html", "Scale Step 02"], ["index.html", "Scale Step 03"]]]])}
            ${col([["Company", [["about.html", "About"], ["about.html", "History"], ["about.html", "Vision"], ["about.html", "Innovation"], ["about.html", "Careers"], ["about.html", "Partnerships"], ["about.html", "Contact"], ["about.html", "Newsletter"], ["about.html", "Policy Page"]]], ["Resources", [["index.html", "Blog"], ["index.html", "Whitepapers"], ["index.html", "Newsroom"], ["index.html", "Customer stories"]]]])}
          </div>
        </div>
      </div>
      <div class="iw-foot__grid" data-fx="grid-tint-fling" data-slot="footer-grid"></div>
      <div class="iw-foot__bottom"><p>© 2026 Brand Name. All rights reserved.</p><nav class="iw-hide-m"><a href="#">Privacy</a><a href="#">Imprint</a><a href="#">Quality Policy</a></nav></div>`;
  }

  // Transition curtain: the slice-mark-page part intercepts links and covers the screen, then lifts on the arriving page
  document.body.insertAdjacentHTML("beforeend", `<div class="iw-veil" data-fx="slice-mark-page" aria-hidden="true"><svg data-fx-part="mark" viewBox="0 0 30 18" fill="currentColor">${MARK.replace(/^<svg[^>]*>|<\/svg>$/g, "")}</svg></div>`);

  document.querySelectorAll(".iw-check:empty").forEach((c) => (c.innerHTML = I.check));

  // Fades in when visible — original FadeInObserver (.5s)
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll("[data-fade-in]").forEach((el) => io.observe(el));

  // Accordion — only one open
  document.querySelectorAll("[data-acc]").forEach((acc) => {
    const items = [...acc.querySelectorAll(".iw-acc__item")];
    const set = (it, open) => {
      const body = it.querySelector(".iw-acc__body");
      it.classList.toggle("is-open", open);
      it.querySelector(".iw-acc__btn").setAttribute("aria-expanded", String(open));
      body.style.height = open ? `${body.scrollHeight}px` : "0px";
    };
    items.forEach((it) => {
      set(it, it.classList.contains("is-open"));
      it.querySelector(".iw-acc__btn").addEventListener("click", () => {
        const open = !it.classList.contains("is-open");
        if (acc.dataset.acc !== "multi") items.forEach((o) => o !== it && set(o, false));
        set(it, open);
        acc.dispatchEvent(new CustomEvent("iw:acc", { detail: items.indexOf(it) }));
      });
    });
  });

  // Case slider — embla (same library as the original), cells at 80% · .5x except the current cell
  document.querySelectorAll("[data-story]").forEach((root) => {
    const view = root.querySelector(".iw-story");
    const cards = [...root.querySelectorAll(".iw-story__card")];
    const count = root.querySelector(".iw-story__count b");
    const dots = [...root.querySelectorAll(".iw-story__dots i")];
    const [prev, next] = root.querySelectorAll(".iw-story__arrow");
    if (!view || !window.EmblaCarousel) return;
    const emb = EmblaCarousel(view, { align: "start", containScroll: "trimSnaps", duration: 25 });
    let was = 0;
    const paint = () => {
      const i = emb.selectedScrollSnap();
      cards.forEach((c, k) => {
        c.classList.toggle("is-coming", k === i && was !== i);
        c.classList.toggle("is-going", k === was && was !== i);
        c.style.setProperty("--card-scale", k === i ? "1" : "0.5");
      });
      dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
      if (count) count.textContent = String(i + 1);
      if (prev) prev.disabled = !emb.canScrollPrev();
      if (next) next.disabled = !emb.canScrollNext();
      was = i;
    };
    emb.on("select", paint).on("init", paint).on("reInit", paint);
    emb.on("pointerDown", () => root.classList.add("is-dragging")).on("pointerUp", () => root.classList.remove("is-dragging"));
    prev?.addEventListener("click", () => emb.scrollPrev());
    next?.addEventListener("click", () => emb.scrollNext());
    paint();
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // The photo grows from the left (or right) edge from width 0 → 100% — original GrowingMedia (power2.out, scrub 1.4)
    document.querySelectorAll("[data-grow]").forEach((el) => {
      const wide = matchMedia("(min-width: 768px)").matches;
      gsap.fromTo(el, { width: 0 }, { width: "100%", ease: "power2.out", scrollTrigger: { trigger: el, start: wide ? "top bottom-=200" : "top bottom", end: "top top+=300", scrub: 1.4 } });
    });
    // Photo margin 24px (phone 8px) — when this section’s top touches the top of the screen it retracts in .5s — original useInsetAnimation (Power1.easeOut)
    document.querySelectorAll("[data-inset]").forEach((el) => {
      if (matchMedia("(max-width: 767px)").matches) return;
      const pad = matchMedia("(max-width: 1023px)").matches ? "8px" : "24px";
      gsap.fromTo(el, { paddingLeft: pad, paddingRight: pad }, { paddingLeft: 0, paddingRight: 0, ease: "power1.out", duration: 0.5, scrollTrigger: { trigger: el, start: "top top", toggleActions: "play none none reverse" } });
    });
  });

  window.iwShared = { mm };
})();
