// Common to all pages: draws the header, mega menu, phone drawer, contact strip and footer in one place, and hooks up smooth scroll, loader, title rise, float-up and parallax.
// Original values: Lenis 1.2s expo · mega menu close delay 200ms · parallax = (screen center − element center) × data-speed (half on phones) ·
// The loader lifts up after load + 500ms (max 3s) over 1s cubic-bezier(.65,0,.35,1) · title letters .03s stagger, lines .12s + .08s per line.
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const TK = (window.TK = { reduced, lenis: null });

  const tel = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M9.5 4.5 13 10l-2.6 2.4a14 14 0 0 0 9.2 9.2L22 19l5.5 3.5-1.6 4.3c-.4 1-1.4 1.6-2.5 1.4C13.6 26.7 5.3 18.4 3.8 8.6c-.2-1.1.4-2.1 1.4-2.5z"/></svg>';
  const mail = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="7.5" width="24" height="17" rx="2"/><path d="m4.5 8.5 11.5 9 11.5-9"/></svg>';
  // Placeholder redrawn at the same size: the original red English wordmark + a two-line company name spot
  const logo = '<svg viewBox="0 0 130 47" role="img" aria-label="Logo"><text x="0" y="25" fill="currentColor" style="font-family:var(--kf-font-round)" font-size="29" letter-spacing="-.5">wordmark</text><text x="1" y="44" fill="currentColor" style="font-family:var(--kf-font-display)" font-weight="700" font-size="13.5" letter-spacing="2.4">Your company name here</text></svg>';
  TK.arrow = (size = "") => `<span class="tk-arrow ${size}" aria-hidden="true"></span>`;

  // One bean: four layers — body · shade · highlight · navel. Tone changes via --site-bean*, and big clumps use a version with the shade and navel removed.
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <linearGradient id="tk-grade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--kf-surface)"/><stop offset="1" style="stop-color:var(--site-bg-deep)"/></linearGradient>
      </defs>
      <symbol id="tk-bean" viewBox="0 0 100 90">
        <path style="fill:var(--site-bean-shade)" d="M52 4C80 3 98 22 97 46c-1 26-21 42-47 41C24 86 4 70 3 46 2 30 10 18 22 11 30 6 40 4 52 4Z"/>
        <path style="fill:var(--site-bean)" d="M50 4C76 3 93 19 92 42c-1 22-19 37-43 37C27 79 8 66 6 44 5 29 12 18 23 11c8-5 17-7 27-7Z"/>
        <path style="fill:var(--site-bean-light)" opacity=".7" d="M30 14c9-5 22-6 30-3-12 1-25 6-33 16-4 5-7 11-8 16-2-12 2-23 11-29Z"/>
        <path style="fill:var(--site-bean-shade)" d="M74 22c5 1 8 5 7 9-1 3-5 4-8 1-3-2-4-6-2-9 1-1 2-1 3-1Z"/>
      </symbol>
      <symbol id="tk-blob" viewBox="0 0 100 90">
        <path d="M52 4C80 3 98 22 97 46c-1 26-21 42-47 41C24 86 4 70 3 46 2 30 10 18 22 11 30 6 40 4 52 4Z"/>
      </symbol>
    </svg>`
  );
  TK.bean = (cls, extra = "") => `<svg class="tk-bean ${cls}" viewBox="0 0 100 90" aria-hidden="true" ${extra}><use href="#tk-bean"/></svg>`;

  const ph = (label, cls = "") => `<figure class="tk-ph is-flat ${cls}"><div class="wf-img" data-label="${label}"></div></figure>`;
  TK.ph = ph;

  const MENU = [
    { label: "Product intro", href: "product.html", key: ["product", "detail"], col3: false, items: [
      ["Product intro TOP", "product.html", "Soy milk pouring into a white cup · soybean background · landscape"],
      ["How it’s made", "detail.html", "Macro of soy milk falling in a thread · cream tone · landscape"],
      ["Menu 2-3", "product.html#water", "Snow-capped mountains · clear sky · landscape"],
      ["Menu 2-4", "product.html#quality", "Lab inspected with gloved hands · landscape"],
    ] },
    { label: "Menu 3", href: "index.html#sustainability", key: [], col3: false, items: [
      ["Menu 3 TOP", "index.html#sustainability", "Factory equipment piping · bright daytime · landscape"],
      ["Menu 3-2", "index.html#sustainability", "Scooping a pile of soy pulp by hand · landscape"],
      ["Menu 3-3", "index.html#sustainability", "Sprouts in a field · backlight · landscape"],
    ] },
    { label: "Company guide", href: "about.html", key: ["about"], col3: false, items: [
      ["Company guide TOP", "about.html", "Factory building exterior · company sign · landscape"],
      ["Menu 4-2", "about.html#menu", "Factory front · cloudy sky · horizontal"],
      ["Menu 4-3", "about.html#menu", "Group logo board · yellow background · landscape"],
      ["Menu 4-4", "about.html#menu", "Snowy mountains beyond the city · landscape"],
    ] },
    { label: "Hiring Info", href: "recruit.html", key: ["recruit"], col3: true, items: [
      ["Careers info TOP", "recruit.html", "Two staff in workwear laughing in a field · landscape"],
      ["Menu 5-2", "recruit.html#message", "Employee in a suit flipping through a file folder · landscape"],
      ["Menu 5-3", "recruit.html#interview", "Employee in work uniform, upper body · lime green circle background · landscape"],
      ["Menu 5-4", "recruit.html#worklife", "Large number graphic · red · landscape"],
      ["Menu 5-5", "recruit.html#worklife", "Senior and junior explaining at the workshop · landscape"],
      ["Menu 5-6", "recruit.html#cta-recruit", "Meeting room interview · Window light · Landscape"],
    ] },
  ];
  const cur = (keys) => (keys.includes(page) ? " is-current" : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("tk-head");
    head.innerHTML = `
      <div class="tk-head__inner">
        <a class="tk-logo" href="index.html">${logo}</a>
        <nav class="tk-nav" aria-label="Main menu">
          <ul class="tk-nav__list">
            <li class="tk-nav__item"><a class="tk-nav__link" href="index.html">TOP</a></li>
            ${MENU.map((m) => `
            <li class="tk-nav__item" data-mega>
              <a class="tk-nav__link${cur(m.key)}" href="${m.href}" aria-expanded="false">${m.label}</a>
              <div class="tk-mega${m.col3 ? " tk-mega--col3" : ""}" data-slot="mega-menu">
                <ul class="tk-mega__list">
                  ${m.items.map(([t, h, l]) => `<li class="tk-mega__item"><a class="tk-mega__link" href="${h}">
                    <figure class="tk-ph is-flat tk-mega__img"><div class="wf-img" data-label="${l}"></div></figure>
                    <div class="tk-mega__text"><p>${t}</p>${TK.arrow()}</div></a></li>`).join("")}
                </ul>
              </div>
            </li>`).join("")}
            <li class="tk-nav__item"><a class="tk-nav__link${cur(["news"])}" href="news.html">News</a></li>
          </ul>
          <a class="tk-nav__btn" href="#cta"><span>Contact Us</span></a>
        </nav>
      </div>
      <button class="tk-burger" type="button" aria-label="Open Menu" aria-expanded="false"><span class="tk-burger__bars"><i></i><i></i><i></i></span></button>`;

    head.insertAdjacentHTML(
      "afterend",
      `<div class="tk-drawer" data-slot="mobile-menu" data-lenis-prevent>
        <nav><ul>
          <li class="tk-drawer__item"><a class="tk-drawer__link" href="index.html">TOP</a></li>
          ${MENU.map((m) => `<li class="tk-drawer__item">
            <button class="tk-drawer__acc" type="button" aria-expanded="false">${m.label}<span class="tk-drawer__plus"></span></button>
            <div class="tk-drawer__sub"><ul>${m.items.map(([t, h]) => `<li><a class="tk-drawer__sublink" href="${h}">${t}</a></li>`).join("")}</ul></div>
          </li>`).join("")}
          <li class="tk-drawer__item"><a class="tk-drawer__link" href="news.html">News</a></li>
        </ul></nav>
        <p class="tk-drawer__small"><a href="#">Privacy policy</a></p>
        <div class="tk-drawer__btns">${callBtns("8:00~17:00")}</div>
      </div>
      <div class="tk-veil tk-veil--mega"></div>
      <div class="tk-veil tk-veil--drawer"></div>`
    );
  }

  function callBtns(hours) {
    return `
      <a class="tk-call tk-call--tel" href="tel:000-000-0000">
        <span class="tk-call__icon">${tel}</span>
        <span class="tk-call__body"><span class="tk-en">000-000-0000</span><small>Phone orders: ${hours}<br class="tk-sp">(Excl. weekends and holidays)</small></span>
      </a>
      <a class="tk-call tk-call--mail" href="#">
        <span class="tk-call__icon">${mail}</span>
        <span class="tk-call__body"><b>By email<br class="tk-sp"> Contact Us</b>${TK.arrow("tk-arrow--26")}</span>
      </a>`;
  }

  const cta = document.querySelector('[data-slot="cta"]');
  if (cta) {
    cta.classList.add("tk-cta");
    cta.id = "cta";
    cta.innerHTML = `
      <div class="tk-box"><div class="tk-cta__inner">
        <div class="tk-cta__text">
          <span class="tk-cta__beans" aria-hidden="true">
            ${TK.bean("", 'style="position:absolute;left:0;top:0;width:68%;rotate:-28deg"')}
            ${TK.bean("", 'style="position:absolute;right:0;bottom:4%;width:46%;rotate:36deg"')}
          </span>
          <div class="tk-title"><p><span class="tk-en">CONTACT</span></p><h2>Contact Us</h2></div>
          <p>Your one line of contact info here.</p>
        </div>
        <div class="tk-cta__btns">${callBtns("8:30~17:30")}</div>
      </div></div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("tk-foot", "tk-wave-top");
    const group = (m) => `<div class="tk-foot__group"><p class="tk-foot__title"><a href="${m.href}">${m.label}</a></p>
      <ul class="tk-foot__list">${m.items.slice(1).map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}</ul></div>`;
    const single = (t, h) => `<div class="tk-foot__group"><p class="tk-foot__title"><a href="${h}">${t}</a></p></div>`;
    foot.innerHTML = `
      <div class="tk-box"><div class="tk-foot__inner">
        <nav class="tk-foot__nav" aria-label="Sitemap">
          <div class="tk-foot__block">${single("TOP", "index.html")}${group(MENU[0])}</div>
          <div class="tk-foot__block">${group(MENU[1])}${group(MENU[2])}</div>
          <div class="tk-foot__block">${group(MENU[3])}</div>
          <div class="tk-foot__block">${single("News", "news.html")}${single("Contact Us", "#cta")}${single("Privacy policy", "#")}</div>
        </nav>
        <dl class="tk-foot__info">
          <dt><a class="tk-logo" href="index.html">${logo}</a></dt>
          <dd class="tk-foot__add">Postal code 000-0000<br>Your address line here 00-0<br>TEL : 000-000-0000<br>FAX : 000-000-0000</dd>
        </dl>
      </div></div>
      <div class="tk-foot__copy"><p class="tk-en">Copyright © 0000 Company Co., LTD. All Rights Reserved.</p></div>`;
  }


  // News line: the home page (four) and the News list (twelve) use the same line
  const NEWS = [
    ["0000.00.00", "News", "Your news headline goes here in one line. If long, it is cut with an ellipsis.", "Bus stop sign · country road · daytime"],
    ["0000.00.00", "News", "Your one-line event news headline here", "Stadium event poster · blue background"],
    ["0000.00.00", "News", "Your short news title here", "White board with only a logo · centered"],
    ["0000.00.00", "News", "Add a one-line headline for the broadcast feature news here", "Products on packing line · from above"],
    ["0000.00.00", "Other", "Your thank-you letter news headline here, one line.", "Award certificate in wooden frame · front view"],
    ["0000.00.00", "News", "Your ad placement news title here", "White board with only a logo · centered"],
    ["0000.00.00", "News", "Add a one-line title for the activity disclosure news here", "Green notice with a table · front view"],
    ["0000.00.00", "News", "Headline for the group site launch news here", "White board with only a logo · centered"],
    ["0000.00.00", "News", "Your regional certification news title here", "Sky looking up at the top of a tower · blue"],
    ["0000.00.00", "Other", "Water Day news title here", "Poster of a mountain and lake painting · Front view"],
  ];
  document.querySelectorAll("[data-news]").forEach((ul) => {
    const n = +ul.dataset.news;
    ul.innerHTML = Array.from({ length: n }, (_, i) => NEWS[i % NEWS.length])
      .map(([d, c, t, l]) => `<li class="tk-news__item">
        <figure class="tk-ph is-flat tk-news__thumb"><div class="wf-img" data-label="${l}"></div></figure>
        <div class="tk-news__data">
          <div><a class="tk-cate" href="#"><span>${c}</span></a></div>
          <time class="tk-en">${d}</time>
          <div><a class="tk-news__ttl" href="#"><span>${t}</span></a></div>
        </div></li>`)
      .join("");
  });

  // ---------- Smooth scroll ----------
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    TK.lenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const onScroll = (fn) => (TK.lenis ? TK.lenis.on("scroll", fn) : addEventListener("scroll", fn, { passive: true }));
  TK.onScroll = onScroll;
  const stop = () => TK.lenis && TK.lenis.stop();
  const start = () => TK.lenis && TK.lenis.start();

  // ---------- Loader: once per session on the first page ----------
  const loader = document.createElement("div");
  if (page === "home") {
    loader.className = "tk-loader";
    loader.innerHTML = TK.bean("tk-loader__bean");
    document.body.prepend(loader);
    if (reduced || sessionStorage.getItem("tk_loaded")) {
      loader.classList.add("is-skip");
    } else {
      stop();
      let done = false;
      const hide = () => {
        if (done) return;
        done = true;
        loader.classList.add("is-loaded");
        sessionStorage.setItem("tk_loaded", "1");
        start();
        document.dispatchEvent(new Event("tk:loaderHidden"));
      };
      addEventListener("load", () => setTimeout(hide, 500));
      setTimeout(hide, 3000);
    }
  }
  TK.loaderActive = () => page === "home" && !loader.classList.contains("is-skip") && !loader.classList.contains("is-loaded");

  const pageEl = document.querySelector(".tk-page");
  if (pageEl) requestAnimationFrame(() => pageEl.classList.add("is-loaded"));

  // ---------- Mega menu: opens on hover (close delayed 200ms), press to pin + gray scrim ----------
  const megaVeil = document.querySelector(".tk-veil--mega");
  const megaItems = [...document.querySelectorAll("[data-mega]")];
  let pinned = false;
  let closeTimer = null;
  const closeAll = () => {
    megaItems.forEach((it) => {
      it.querySelector(".tk-mega").classList.remove("is-open");
      it.querySelector(".tk-nav__link").setAttribute("aria-expanded", "false");
    });
    megaVeil && megaVeil.classList.remove("is-open");
    if (pinned) start();
    pinned = false;
  };
  megaItems.forEach((it) => {
    const link = it.querySelector(".tk-nav__link");
    const mega = it.querySelector(".tk-mega");
    it.addEventListener("mouseenter", () => {
      if (pinned) return;
      clearTimeout(closeTimer);
      megaItems.forEach((o) => {
        o.querySelector(".tk-mega").classList.remove("is-open");
        o.querySelector(".tk-nav__link").setAttribute("aria-expanded", "false");
      });
      mega.classList.add("is-open");
      link.setAttribute("aria-expanded", "true");
    });
    it.addEventListener("mouseleave", () => {
      if (pinned) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (pinned) return;
        mega.classList.remove("is-open");
        link.setAttribute("aria-expanded", "false");
      }, 200);
    });
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const wasPinned = pinned && mega.classList.contains("is-open");
      closeAll();
      if (wasPinned) return;
      mega.classList.add("is-open");
      megaVeil.classList.add("is-open");
      link.setAttribute("aria-expanded", "true");
      stop();
      pinned = true;
    });
    mega.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeAll));
  });
  megaVeil && megaVeil.addEventListener("click", closeAll);
  addEventListener("keydown", (e) => e.key === "Escape" && closeAll());

  // ---------- Phone drawer ----------
  const burger = document.querySelector(".tk-burger");
  const drawer = document.querySelector(".tk-drawer");
  const drawerVeil = document.querySelector(".tk-veil--drawer");
  const setDrawer = (open) => {
    burger.classList.toggle("is-active", open);
    burger.setAttribute("aria-expanded", String(open));
    drawer.classList.toggle("is-active", open);
    drawerVeil.classList.toggle("is-open", open);
    document.body.classList.toggle("is-drawer-open", open);
    open ? stop() : start();
  };
  if (burger) {
    burger.addEventListener("click", () => setDrawer(!burger.classList.contains("is-active")));
    drawerVeil.addEventListener("click", () => setDrawer(false));
    drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));
    addEventListener("resize", () => innerWidth > 980 && drawer.classList.contains("is-active") && setDrawer(false));
    drawer.querySelectorAll(".tk-drawer__acc").forEach((btn) =>
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") !== "true";
        btn.setAttribute("aria-expanded", String(open));
        btn.nextElementSibling.classList.toggle("is-open", open);
      })
    );
  }

  // In-page moves stop offset by header height + 20px
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.closest("[data-mega]") && a.classList.contains("tk-nav__link")) return;
    const href = a.getAttribute("href");
    if (href === "#") return e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const off = -((head ? head.offsetHeight : 0) + 20);
    TK.lenis ? TK.lenis.scrollTo(target, { offset: off }) : scrollTo({ top: target.getBoundingClientRect().top + scrollY + off });
  });

  // ---------- Titles: English labels wrapped per character, large titles per line ----------
  const splitChars = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let n = 0;
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      [...node.nodeValue].forEach((ch) => {
        if (ch.trim() === "") return frag.append(ch);
        const o = document.createElement("span");
        o.className = "char";
        const i = document.createElement("span");
        i.className = "char-inner";
        i.textContent = ch;
        i.style.transitionDelay = `${n++ * 0.03}s`;
        o.append(i);
        frag.append(o);
      });
      node.replaceWith(frag);
    });
  };
  const wrapLines = (h) => {
    const lines = [[]];
    [...h.childNodes].forEach((node) => {
      if (node.nodeName === "BR") {
        if (getComputedStyle(node).display !== "none") lines.push([]);
        return;
      }
      lines[lines.length - 1].push(node);
    });
    h.innerHTML = "";
    lines.forEach((nodes, i) => {
      const r = document.createElement("span");
      r.className = "reveal";
      const inner = document.createElement("span");
      inner.className = "reveal-inner";
      inner.style.transitionDelay = `${0.12 + i * 0.08}s`;
      nodes.forEach((n) => inner.append(n));
      r.append(inner);
      h.append(r);
    });
  };
  const titleIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-visible"), titleIO.unobserve(e.target))),
    { rootMargin: "0px 0px -3% 0px" }
  );
  const headings = [];
  document.querySelectorAll(".tk-title").forEach((t) => {
    const p = t.querySelector(":scope > p");
    const h = t.querySelector(":scope > h1, :scope > h2");
    if (reduced) return t.classList.add("is-visible");
    if (p) splitChars(p);
    if (h) {
      h.dataset.html = h.innerHTML;
      wrapLines(h);
      headings.push(h);
    }
    titleIO.observe(t);
  });
  matchMedia("(max-width: 768px)").addEventListener("change", () =>
    headings.forEach((h) => {
      h.innerHTML = h.dataset.html;
      wrapLines(h);
    })
  );

  const fadeIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("is-visible"), fadeIO.unobserve(e.target))),
    { rootMargin: "0px 0px -10% 0px" }
  );
  document.querySelectorAll(".js-fade-up").forEach((el) => (reduced ? el.classList.add("is-visible") : fadeIO.observe(el)));

  // ---------- Parallax: distance from screen center × speed ----------
  TK.parallax = () => {
    const els = [...document.querySelectorAll(".js-parallax")];
    if (!els.length) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const update = () => {
        const mobile = innerWidth <= 768;
        const vh = innerHeight;
        // Measured at the already moved position like the original — so the actual shift converges to distance × speed/(1 + speed) (if you remove it and measure fresh, it moves 20% more than the original).
        // Write everything at once after measuring, to batch layout calculation into one pass
        const ys = els.map((el) => {
          const sp = parseFloat(el.dataset.speed) || 0.2;
          const speed = mobile ? (el.dataset.speedSp !== undefined ? parseFloat(el.dataset.speedSp) : sp * 0.5) : sp;
          const r = el.getBoundingClientRect();
          return (vh / 2 - (r.top + r.height / 2)) * speed;
        });
        els.forEach((el, i) => (el.style.transform = `translateY(${ys[i]}px)`));
      };
      onScroll(update);
      addEventListener("resize", update);
      update();
      return () => {
        TK.lenis ? TK.lenis.off("scroll", update) : removeEventListener("scroll", update);
        removeEventListener("resize", update);
        els.forEach((el) => (el.style.transform = ""));
      };
    });
  };
})();
