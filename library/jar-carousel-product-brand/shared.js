// Common to all pages: draws the header, fullscreen menu, footer and cursor pill, and hooks up the fruit loader, burgundy curtain transition, text entrance and Lenis.
// Original values: loader progress 1.7s (easeOutCubic) · closes after 2s · curtain 1.8s · transition cover .9s / reveal .975s · text line .55s·.08 / text .95s·.02 (textveil .165,1,.32,1) · start top 91%.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("textveil", "M0,0 C0.165,1 0.32,1 1,1");
  CustomEase.create("premium", "M0,0 C0.645,0.045 0.355,1 1,1");
  CustomEase.create("soft", "M0,0 C0.22,1 0.36,1 1,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
  const page = document.body.dataset.page || "home";
  // Product detail: hits from the menu/footer below the product warehouse
  const navPage = page === "detail" ? "list" : page;
  const AG = (window.AG = { reduced, fine, page, lenis: null });
  // So listeners waiting for the first scene (loader lifting, curtain lifting) don’t miss it when they attach late, anything that already happened is called immediately
  let introFired = false;
  const introQ = [];
  AG.onIntro = (cb) => (introFired ? cb() : introQ.push(cb));
  const fireIntro = () => { introFired = true; introQ.splice(0).forEach((cb) => cb()); };
  document.documentElement.classList.add("ag-js");

  // ── Fruit art: the original fruit silhouettes (orange·apricot·eggplant·strawberry·pomegranate·pear·fig·blackberry·lemon·almond) redrawn as angular flat-color polygons.
  // The body polygon becomes the physics body as is.
  const ring = (n, rx, ry, cx = 50, cy = 54, wob = 0, rot = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = rot + (i / n) * Math.PI * 2;
      const r = 1 + (i % 2 ? -wob : wob);
      return [cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r];
    });
  const leaf = (x, y, s, rot, c) => `<path d="M${x} ${y} q${8 * s} ${-10 * s} ${20 * s} ${-6 * s} q${-6 * s} ${10 * s} ${-20 * s} ${6 * s}z" fill="${c}" transform="rotate(${rot} ${x} ${y})"/>`;
  const FRUITS = [
    { name: "Orange", c: "#dd5313", body: ring(11, 44, 42), top: leaf(56, 12, 1, -10, "#e6661c"), s: 0.95 }, // Not Skin: each fruit has its own color — color tells the fruits apart
    { name: "Apricot", c: "#e0741a", body: ring(9, 38, 36, 50, 56), top: leaf(54, 20, 0.9, -25, "#d9611a"), s: 0.66 }, // Not Skin: each fruit has its own color — color tells the fruits apart
    { name: "Branch", c: "#55255f", body: [[42, 20], [60, 18], [70, 40], [86, 70], [84, 88], [66, 98], [40, 96], [22, 84], [20, 62], [34, 40]], top: `<path d="M44 6h10l2 14h12l-6 6H36l-6-6h12z" fill="#55255f"/>`, ratio: 0.62, s: 0.95 }, // Not Skin: each fruit has its own color — color tells the fruits apart
    { name: "Strawberry", c: "#df1a2b", body: [[14, 30], [50, 22], [86, 30], [90, 50], [74, 78], [52, 98], [30, 80], [12, 52]], top: `<path d="M30 26 38 10 46 22 52 6 58 22 68 10 72 26z" fill="#c4131f"/>`, s: 0.62 }, // Not Skin: each fruit has its own color — color tells the fruits apart
    { name: "Pomegranate", c: "#a61c1b", body: ring(9, 44, 40, 50, 58, 0, 0.3), top: `<path d="M38 22 34 8 44 14 50 4 56 14 66 8 62 22z" fill="#a61c1b"/>`, s: 0.88 }, // Not Skin: each fruit has its own color — color tells the fruits apart
    { name: "Ship", c: "#276b47", body: [[44, 14], [56, 14], [62, 36], [80, 58], [84, 82], [68, 98], [32, 98], [16, 82], [20, 58], [38, 36]], top: `<path d="M50 14 48 2 52 1 54 14z" fill="#276b47"/>`, ratio: 0.7, s: 0.9 }, // Not Skin: each fruit has its own color — color tells the fruits apart
    { name: "Fig", c: "#83193b", body: [[46, 14], [54, 14], [62, 34], [82, 52], [86, 76], [70, 96], [30, 96], [14, 76], [18, 52], [38, 34]], top: `<path d="M48 14 50 4 53 14z" fill="#83193b"/>`, s: 0.72 }, // Not Skin: each fruit has its own color — color tells the fruits apart
    { name: "Blackberry", c: "#2c2a55", body: ring(22, 36, 42, 50, 54, 0.08), ratio: 0.8, s: 0.7 }, // Not Skin: each fruit has its own color — color tells the fruits apart
    { name: "Lemon", c: "#f6c600", body: [[6, 52], [16, 34], [36, 22], [64, 22], [84, 34], [96, 52], [84, 70], [64, 82], [36, 82], [16, 70]], ratio: 1.25, s: 1.05 }, // Not Skin: each fruit has its own color — color tells the fruits apart
    { name: "Almond", c: "#7a2f0d", body: [[8, 62], [30, 34], [62, 22], [94, 26], [80, 54], [48, 74], [18, 76]], ratio: 1.3, s: 0.75 }, // Not Skin: each fruit has its own color — color tells the fruits apart
  ];
  const fruitSVG = (f) => {
    const vb = `0 0 100 ${Math.round(100 / (f.ratio || 1))}`;
    const sy = 1 / (f.ratio || 1);
    const pts = f.body.map(([x, y]) => `${x},${(y * sy).toFixed(1)}`).join(" ");
    return `<svg viewBox="${vb}" aria-hidden="true"><g transform="scale(1 ${sy.toFixed(3)})">${f.top || ""}</g><polygon points="${pts}" fill="${f.c}"/></svg>`;
  };
  AG.FRUITS = FRUITS;
  AG.fruitSVG = fruitSVG;

  // Fruit is dropped with matter-js. Original body values: restitution .03 · friction .82 · frictionAir .03 · floor and left/right walls.
  AG.dropFruits = (stage, { gravity = 1, spawnGap = 90 } = {}) => {
    const els = [...stage.querySelectorAll("[data-fruit]")];
    if (!els.length || !window.Matter) return null;
    const { Engine, Runner, Composite, Bodies, Vertices, Events } = Matter;
    const W = stage.clientWidth, H = stage.clientHeight, T = 400;
    if (reduced) {
      els.forEach((el, i) => {
        const a = (i / els.length) * Math.PI * 2, r = Math.min(W, H) * 0.42;
        el.style.transform = `translate(${W / 2 + Math.cos(a) * r}px, ${H / 2 + Math.sin(a) * r}px) translate(-50%, -50%)`;
      });
      return { destroy() {} };
    }
    const engine = Engine.create({ enableSleeping: true });
    engine.gravity.y = gravity;
    const wall = { isStatic: true, restitution: 0.2, friction: 0.6 };
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, H + T / 2, W * 3, T, wall),
      Bodies.rectangle(-T / 2, H / 2, T, H * 3, wall),
      Bodies.rectangle(W + T / 2, H / 2, T, H * 3, wall),
    ]);
    const items = els.map((el, i) => {
      const f = FRUITS[+el.dataset.fruit];
      const w = el.offsetWidth, h = el.offsetHeight, sy = h / 100 / (1 / (f.ratio || 1));
      const verts = f.body.map(([x, y]) => ({ x: (x / 100) * w, y: y * (1 / (f.ratio || 1)) * sy }));
      const c = Vertices.centre(verts);
      const x = Math.max(T / 4, w * 0.15 + Math.random() * Math.max(1, W - w * 1.3));
      const y = -(h + 140) - i * spawnGap - Math.random() * 110;
      const body = Bodies.fromVertices(x, y, [verts], { restitution: 0.03, friction: 0.82, frictionAir: 0.03, sleepThreshold: 18, angle: (Math.random() - 0.5) * 0.24 }, true);
      el.style.transformOrigin = `${c.x}px ${c.y}px`;
      return { el, body, c };
    });
    Composite.add(engine.world, items.map((it) => it.body));
    const draw = () => items.forEach(({ el, body, c }) => {
      el.style.transform = `translate(${body.position.x - c.x}px, ${body.position.y - c.y}px) rotate(${body.angle}rad)`;
    });
    Events.on(engine, "afterUpdate", draw);
    draw();
    const runner = Runner.run(Runner.create(), engine);
    return { destroy() { Runner.stop(runner); Engine.clear(engine); } };
  };

  // ── Header · menu · cursor · curtain ──
  const icon = `<svg viewBox="0 0 60 50" aria-hidden="true"><path d="M8 26h44c0 12-9 20-22 20S8 38 8 26z" fill="currentColor"/><circle cx="20" cy="21" r="8" fill="currentColor"/><circle cx="31" cy="15" r="9" fill="currentColor"/><circle cx="42" cy="21" r="8" fill="currentColor"/><path d="M31 6c3-5 9-6 12-4-2 4-7 6-12 4z" fill="currentColor"/></svg>`;
  const logo = `<span class="ag-logo"><span class="ag-logo__icon">${icon}</span><span class="ag-logo__word" data-label="Your brand’s English name here">STUDIO</span><span class="ag-logo__farm" data-label="Your brand name’s second word here (italic)">Name</span></span>`;
  const roll = (t) => `<span class="ag-roll" aria-label="${t}">${[...t].map((ch, i) => `<span class="ag-roll__c" style="--i:${i}" aria-hidden="true"><span class="ag-roll__t">${ch === " " ? "&nbsp;" : ch}</span><span class="ag-roll__b">${ch === " " ? "&nbsp;" : ch}</span></span>`).join("")}</span>`;
  AG.roll = roll;
  const NAV = [
    { t: "Home", href: "index.html", p: "home" },
    { t: "Products", href: "list.html", p: "list" },
    { t: "Process", href: "#", p: "" },
    { t: "Farm Visit", href: "#", p: "" },
  ];
  const arrow = `<svg viewBox="0 0 11 11" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 9 9 2M3.5 2H9v5.5"/></svg>`;

  document.body.insertAdjacentHTML("afterbegin", `
    <header class="ag-head" data-slot="header">
      <div class="ag-head__bar">
        <div class="ag-head__side"><nav class="ag-lang" aria-label="Language"><a class="ag-lang__item" href="#">KO</a><a class="ag-lang__item is-active" href="#" aria-current="true">EN</a></nav></div>
        <div class="ag-head__center"><a class="ag-brand" href="index.html" aria-label="Home"><span class="ag-brand__track">${logo}</span></a></div>
        <div class="ag-head__side ag-head__side--end">
          <button class="ag-toggle" type="button" aria-expanded="false" aria-controls="ag-nav" data-roll>
            <span class="ag-toggle__pill"><span class="ag-toggle__label ag-toggle__label--menu">${roll("Full menu")}</span><span class="ag-toggle__label ag-toggle__label--close">Close</span></span>
            <span class="ag-toggle__disc"><span class="ag-toggle__diamond"></span><svg class="ag-toggle__x" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m1 1 10 10M11 1 1 11"/></svg></span>
          </button>
        </div>
      </div>
    </header>
    <div class="ag-nav" id="ag-nav" data-slot="menu-drawer" aria-hidden="true">
      <div class="ag-nav__panel"><div class="ag-nav__inner">
        <div class="ag-nav__primary"><ul class="ag-nav__list" data-label="Four English menu names here">
          ${NAV.map((n, i) => `<li class="ag-nav__item${n.p === navPage ? " is-active" : ""}" style="--marker-delay:${(0.45 + i * 0.08).toFixed(2)}s"><div class="ag-nav__row"><a class="ag-nav__link" style="--i:${i}" href="${n.href}" data-roll><span class="ag-nav__text">${n.t}</span><span class="ag-nav__marker-mask"><span class="ag-nav__marker"></span></span></a></div></li>`).join("")}
        </ul></div>
        <ul class="ag-nav__secondary">
          <li><a href="#" data-roll>${roll("About")}</a></li><li><a href="#" data-roll>${roll("Contact info")}</a></li>
          <li><a href="#" data-roll>${roll("Shop")}<span class="ag-nav__arrow-mask"><span class="ag-nav__arrow">${arrow}</span></span></a></li>
        </ul>
        <div class="ag-nav__legal"><a href="#">Privacy · Cookies</a></div>
      </div></div>
    </div>
    <div class="ag-cursor" aria-hidden="true"><span class="ag-cursor__pill"><span class="ag-diamond"></span><span class="ag-cursor__text">Go to products</span></span></div>
    <div class="ag-cover" aria-hidden="true"><div class="ag-cover__panel"></div><div class="ag-cover__line"></div></div>
    <div class="ag-legal"><a href="#">Privacy · Cookies</a></div>`);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("ag-foot");
    foot.innerHTML = `
      <div class="ag-foot__inner ag-container">
        <div class="ag-grid"><div class="ag-foot__logo" aria-label="Studio Name" data-label="Brand English wordmark here · second word in italics"><span class="ag-foot__word">STUDIO</span><span class="ag-foot__farm">Name</span></div></div>
        <div class="ag-grid ag-foot__grid">
          <div class="ag-foot__brand"><span class="ag-foot__mark">${icon}</span>
            <div class="ag-foot__copy"><strong>©0000 · Brand Name</strong><span>Your company name here</span><span class="ag-foot__vat">Business registration no. 000-00-00000</span></div></div>
          <nav class="ag-foot__nav" aria-label="Footer Menu">
            <ul class="ag-foot__links">${NAV.map((n) => `<li><a class="ag-foot__link${n.p === navPage ? " is-active" : ""}" href="${n.href}">${n.t}</a></li>`).join("")}<li><a class="ag-foot__link" href="#">About</a></li></ul>
            <ul class="ag-foot__links"><li><a class="ag-foot__link" href="#">Contact info</a></li><li><a class="ag-foot__link" href="#">Shop</a></li></ul>
          </nav>
          <div class="ag-foot__sedi">
            <div class="ag-foot__block"><p class="ag-foot__label">Headquarters</p><p class="ag-foot__text">Your street address in one line here<br>00000 · City name</p></div>
            <div class="ag-foot__block"><p class="ag-foot__label">Workshop</p><p class="ag-foot__text">Your studio address here<br>In two lines · 00000 City name</p></div>
          </div>
          <div class="ag-foot__contact">
            <div class="ag-foot__block"><p class="ag-foot__label">Follow</p><a class="ag-foot__link" href="#">@accountname</a></div>
            <div class="ag-foot__mail"><p class="ag-foot__message">Your invitation to get in touch goes here in two or three lines. If you have any questions, feel free to leave us a line.</p><a class="ag-foot__email" href="#">hello@example.com</a></div>
          </div>
        </div>
        <div class="ag-foot__legal"><a href="#">Privacy · Cookies</a></div>
      </div>`;
  }

  const head = document.querySelector(".ag-head");
  const brand = head.querySelector(".ag-brand");
  const nav = document.querySelector(".ag-nav");
  const toggle = head.querySelector(".ag-toggle");
  const cover = document.querySelector(".ag-cover");

  // ── Cursor pill (original SiteCursorLabel): only while visible, it follows 12% of the distance each frame (instantly with reduced motion),
  //    On enabling, if it is more than 80px from the cursor, it moves to that spot to start. On disabling, the pill folds after 90ms and following stops ──
  const cursor = document.querySelector(".ag-cursor");
  let tx = 0, ty = 0, ox = 0, oy = 0, placed = false, follow = 0, offT = 0, on = false;
  const put = () => { cursor.style.transform = `translate3d(${ox}px, ${oy}px, 0)`; };
  const step = () => { const k = reduced ? 1 : 0.12; ox += (tx - ox) * k; oy += (ty - oy) * k; put(); follow = requestAnimationFrame(step); };
  if (fine()) addEventListener("pointermove", (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!placed) { placed = true; ox = tx; oy = ty; put(); }
  }, { passive: true });
  AG.cursor = {
    show(text) {
      if (!fine()) return;
      if (text) cursor.querySelector(".ag-cursor__text").textContent = text;
      if (offT) { clearTimeout(offT); offT = 0; }
      if (!on && Math.hypot(tx - ox, ty - oy) > 80) { ox = tx; oy = ty; put(); }
      on = true;
      cursor.classList.add("is-visible");
      follow ||= requestAnimationFrame(step);
    },
    hide() {
      if (offT) return;
      offT = setTimeout(() => { offT = 0; on = false; cursor.classList.remove("is-visible"); cancelAnimationFrame(follow); follow = 0; }, 90);
    },
  };
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest("[data-cursor]");
    if (t && !t.contains(e.relatedTarget)) AG.cursor.show(t.dataset.cursor);
  });
  document.addEventListener("pointerout", (e) => {
    const t = e.target.closest("[data-cursor]");
    if (t && !t.contains(e.relatedTarget)) AG.cursor.hide();
  });

  // ── Text entrance ──
  const CFG = { lines: { duration: 0.55, stagger: 0.08, y: 112 }, chars: { duration: 0.95, stagger: 0.02, y: 108 } };
  const splitReveal = (el) => {
    const mode = el.dataset.reveal === "chars" ? "chars" : "lines";
    const split = SplitText.create(el, { type: mode === "chars" ? "words,chars" : "lines", mask: mode, linesClass: "ag-line", charsClass: "ag-char" });
    el.classList.add("is-split");
    const targets = mode === "chars" ? split.chars : split.lines;
    const c = CFG[mode];
    const y = +el.dataset.revealDistance || c.y;
    return gsap.fromTo(targets, { yPercent: y }, { yPercent: 0, duration: c.duration, stagger: c.stagger, ease: "textveil", paused: true });
  };
  AG.splitReveal = splitReveal;
  const initReveals = () => {
    document.querySelectorAll("[data-reveal]:not([data-reveal-manual])").forEach((el) => {
      if (el.closest(".ag-nav")) return;
      if (reduced) { el.classList.add("is-split"); return; }
      const tl = splitReveal(el);
      if (el.dataset.revealTrigger === "load") AG.onIntro(() => tl.play());
      else ScrollTrigger.create({ trigger: el, start: el.dataset.revealStart || "top 91%", once: true, onEnter: () => tl.play() });
    });
  };

  // ── Menu ──
  let navTls = [];
  const navText = [...nav.querySelectorAll(".ag-nav__text")];
  const openNav = (open) => {
    head.classList.toggle("is-nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    nav.setAttribute("aria-hidden", String(!open));
    if (open) {
      nav.classList.remove("is-closing");
      nav.classList.add("is-open");
      AG.lenis?.stop();
      if (!reduced) {
        if (!navTls.length) navTls = navText.map((el) => {
          el.dataset.reveal = "chars";
          const tl = splitReveal(el);
          const chars = [...el.querySelectorAll(".ag-char")];
          chars.forEach((c) => (c.dataset.ch = c.textContent));
          const link = el.closest("a");
          link.addEventListener("mouseenter", () => { if (fine() && !tl.isActive()) gsap.to(chars, { yPercent: -100, duration: 0.35, stagger: 0.018, ease: "power1.inOut", overwrite: true }); });
          link.addEventListener("mouseleave", () => { if (!tl.isActive()) gsap.to(chars, { yPercent: 0, duration: 0.35, stagger: 0.018, ease: "power1.inOut", overwrite: true }); });
          return tl;
        });
        navTls.forEach((tl, i) => tl.timeScale(1).delay(0.3 + i * 0.06).restart(true));
      }
    } else {
      nav.classList.add("is-closing");
      navTls.forEach((tl) => tl.timeScale(1.6).reverse());
      setTimeout(() => { nav.classList.remove("is-open", "is-closing"); AG.lenis?.start(); }, 975);
    }
  };
  toggle.addEventListener("click", () => openNav(!head.classList.contains("is-nav-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && head.classList.contains("is-nav-open")) openNav(false); });

  // ── Page Turn ──
  AG.go = (href, via = "cover") => {
    sessionStorage.setItem("ag-via", via);
    if (reduced || via !== "cover") { location.href = href; return; }
    cover.classList.add("is-covering");
    setTimeout(() => (location.href = href), 900);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    if (head.classList.contains("is-nav-open")) openNav(false);
    AG.go(href);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) cover.classList.remove("is-covering", "is-covered", "is-lifting"); });

  // ── Header state (original SiteHeader values as is): past 33px of scroll the logo folds, and below the threshold (200px, 100px on phone, never over half the document)
  //    Hides (scrolling down) and reappears (scrolling up) once 4px have stacked in the same direction. On phones below 450px a white veil lies behind the header and the logo area shrinks to 45px.
  //    When a dark section ([data-header-light]) hits the 60px line at the top, it turns cream ──
  const lights = [...document.querySelectorAll("[data-header-light]")];
  const solidBg = document.createElement("div");
  solidBg.className = "ag-head-solid is-initial";
  solidBg.setAttribute("aria-hidden", "true");
  document.body.append(solidBg);
  requestAnimationFrame(() => requestAnimationFrame(() => solidBg.classList.remove("is-initial")));
  const fitSolid = () => { solidBg.style.height = `${head.offsetHeight}px`; };
  fitSolid();
  new ResizeObserver(fitSolid).observe(head);
  let lastY = 0, acc = 0, shown = true;
  const onScroll = (y) => {
    const mob = innerWidth <= 480;
    head.classList.toggle("is-compact", y > 33);
    const solid = mob && y > 450;
    head.classList.toggle("is-solid", solid);
    solidBg.classList.toggle("is-visible", solid);
    if (!head.classList.contains("is-nav-open")) {
      const limit = AG.lenis?.limit ?? document.documentElement.scrollHeight - innerHeight;
      if (y <= Math.min(mob ? 100 : 200, limit / 2)) { shown = true; acc = 0; }
      else {
        const d = y - lastY;
        if (d) acc = Math.sign(d) === Math.sign(acc) ? acc + d : d;
        if (acc <= -4) { shown = true; acc = 0; } else if (acc >= 4) { shown = false; acc = 0; }
      }
      head.classList.toggle("is-hidden", !shown);
      solidBg.classList.toggle("is-hidden", !shown);
    }
    lastY = y;
    const line = 60;
    head.classList.toggle("is-light", lights.some((el) => { const r = el.getBoundingClientRect(); return r.top <= line && r.bottom >= line; }));
  };

  const via = sessionStorage.getItem("ag-via");
  sessionStorage.removeItem("ag-via");
  const revealBrand = (delay) => setTimeout(() => brand.classList.add("is-revealed"), delay);

  const start = () => {
    if (!reduced && window.Lenis && page !== "home") {
      AG.lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      AG.lenis.on("scroll", ScrollTrigger.update);
      AG.lenis.on("scroll", (l) => onScroll(l.scroll));
      gsap.ticker.add((t) => AG.lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else addEventListener("scroll", () => onScroll(scrollY), { passive: true });
    initReveals();
  };

  // Loader — only on first arrival via the address bar. When coming between our pages, the curtain lifts (if the bottle was pressed) or fades in slowly.
  const runLoader = () => {
    const mobile = matchMedia("(max-width: 480px)").matches;
    const count = 22;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="ag-loader" aria-hidden="true" data-slot="loader">
        <div class="ag-loader__content"><div class="ag-loader__mark">0%</div>
          <div class="ag-loader__stage">${Array.from({ length: count }, (_, i) => {
            const k = i % FRUITS.length, f = FRUITS[k];
            return `<div class="ag-fruit" data-fruit="${k}" style="width:calc(var(--fruit-base) * ${((f.s || 1) * 1.15 * (0.9 + ((i * 7) % 5) * 0.05)).toFixed(3)});aspect-ratio:${f.ratio || 1}">${fruitSVG(f)}</div>`;
          }).join("")}</div></div>
        <div class="ag-loader__sweep"><div class="ag-loader__panel"></div><div class="ag-loader__line"></div></div>
      </div>`);
    const loader = document.querySelector(".ag-loader");
    const mark = loader.querySelector(".ag-loader__mark");
    const stage = loader.querySelector(".ag-loader__stage");
    const sim = AG.dropFruits(stage, { gravity: 3.35 });
    stage.classList.add("is-ready");
    setTimeout(() => {
      let t0 = 0;
      const tick = (t) => {
        t0 ||= t;
        const x = Math.min(1, (t - t0) / 1700);
        mark.textContent = Math.round((1 - (1 - x) ** 3) * 100) + "%";
        if (x < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, 300);
    setTimeout(() => {
      loader.classList.add("is-closing");
      revealBrand(Math.round(1800 * 0.46));
      setTimeout(() => fireIntro(), Math.round(1800 * 0.62));
      setTimeout(() => { sim?.destroy(); loader.remove(); }, 1800);
    }, mobile ? 2500 : 2000);
  };

  start();
  if (reduced) { revealBrand(0); fireIntro(); }
  else if (via === "cover") {
    cover.classList.add("is-covered");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cover.classList.remove("is-covered");
      cover.classList.add("is-lifting");
      revealBrand(100);
      fireIntro();
      setTimeout(() => cover.classList.remove("is-lifting"), 975);
    }));
  } else if (via === "jar") {
    document.body.classList.add("is-jar-in");
    revealBrand(100);
    fireIntro();
  } else runLoader();
})();
