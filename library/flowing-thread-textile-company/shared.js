// Shared by all pages: draws the header, full menu and footer in one place, and attaches smooth scroll, header blend/hide, mega dropdown, language pill ·
// Hooks up title line lift, line drawing, stagger, and thread-color canvas.
// Original values: Lenis lerp .11 · mega close 380ms · line rise IO bottom -25% · line draw IO 0px · 120 color threads in 12° bundles, width 1.0~2.2x
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = matchMedia("(max-width: 900px)");
  const page = document.body.dataset.page || "home";
  const ST = (window.ST = { reduced, sp, lenis: null });

  const arrR = '<svg viewBox="0 0 15 6" fill="none" stroke="currentColor"><path d="M0 3h14M11.5.5 14 3l-2.5 2.5"/></svg>';
  const arrX = '<svg viewBox="0 0 9 9" fill="none" stroke="currentColor"><path d="M1 8 8 1M2.5 1H8v5.5"/></svg>';
  const plus = '<svg viewBox="0 0 7 7" fill="currentColor"><rect x="0" y="3" width="7" height="1"/><rect class="st-head__plus-v" x="3" y="0" width="1" height="7"/></svg>';
  const acc = '<svg viewBox="0 0 7 7" fill="none" stroke="currentColor"><path d="M0 3.5h7"/><path class="st-acc__v" d="M3.5 0v7"/></svg>';
  const chev = '<svg viewBox="0 0 22 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m1 1 4 4-4 4M8.5 1l4 4-4 4M16 1l4 4-4 4"/></svg>';
  const arrF = '<svg viewBox="0 0 13 6" fill="currentColor"><path d="M0 2.5h10V0l3 3-3 3V3.5H0z"/></svg>';
  const arrow = (kind = "r") => `<span class="st-arr st-arr--${kind}">${kind === "r" ? arrR + arrR : arrX + arrX}</span>`;
  // As in the original, buttons and arrows on business rows come in two sets — a PC line arrow and a phone filled arrow — and the hidden one also receives the hover rules
  const arrowPair = () => `<span class="st-arr st-arr--f is-sp">${arrF + arrF}</span><span class="st-arr st-arr--r is-pc">${arrR + arrR}</span>`;
  ST.icons = { arrR, arrX, chev, arrow };
  // Body’s <i data-arr> Replaces the slot with two sets of arrows (they slide out and in on hover)
  document.querySelectorAll("[data-chev]").forEach((el) => (el.outerHTML = chev.replace("<svg", `<svg class="${el.className}"`)));
  // data-arr="pair" is only where the original keeps PC and phone versions (dark button·business row) — the rest is one version
  document.querySelectorAll("[data-arr]").forEach((el) => (el.outerHTML = el.dataset.arr === "pair" ? arrowPair() : arrow(el.dataset.arr || "r")));
  const cur = (p) => (p === page ? ' aria-current="page"' : "");

  // Menu data: header dropdown, full menu and footer use the same list
  const NAV = [
    { key: "about", label: "Company About", href: "index.html#about", groups: [
      { head: "Our identity", items: ["Identity", "Purpose", "Mission · Vision · Values"] },
      { head: "Company", items: ["Message from the CEO", "Company overview", "History", "Gallery", "Organization", "Global Hub"] },
    ] },
    { key: "business", label: "Business", href: "service.html", cards: [
      ["Raw materials business", "Raw Materials", "Raw material · wool clump in hand · close-up"],
      ["Fabric business", "Textiles", "Fabric · colored thread on a loom · side lighting"],
      ["Apparel · General goods business", "Apparel & Goods", "Clothing · clothes on a hanger rack · white wall"],
      ["Retail Business", "Retail", "Store · empty shelves and stairs · natural light"],
    ] },
    { key: "sustain", label: "Sustainability", href: "works.html", groups: [
      { items: ["Sustainability policy", ["Environment", ["Menu a", "Menu b", "Menu c", "Menu d", "Menu e", "Green project", "Menu g", "Menu h"]], "Society", "Initiative Participation", "Certification · Rating"] },
    ] },
    { key: "news", label: "News", href: "news.html", groups: [{ items: ["Notice", "Press release", "Sustainability", "Media"] }] },
  ];
  const hrefOf = (sec, name) => {
    if (sec.key === "business") return name.startsWith("Clothing") ? "product.html" : "service.html";
    if (sec.key === "sustain") return "works.html";
    if (sec.key === "news") return "news.html";
    return "index.html#about";
  };
  const listHTML = (sec, items, cls, subCls) =>
    items.map((it) => Array.isArray(it)
      ? `<li><a class="st-ul" href="${hrefOf(sec, it[0])}">${it[0]}</a><ul class="${subCls}">${it[1].map((s) => `<li><a class="st-ul" href="${hrefOf(sec, s)}">${s}</a></li>`).join("")}</ul></li>`
      : `<li><a class="st-ul" href="${hrefOf(sec, it)}">${it}</a></li>`).join("");
  const groupsHTML = (sec, gCls, lCls, subCls) =>
    (sec.groups || []).map((g) => `<div class="${gCls}">${g.head ? `<p class="st-gh">${g.head}</p>` : ""}<ul class="${lCls}">${listHTML(sec, g.items, "", subCls)}</ul></div>`).join("");
  const businessList = (sec) => sec.cards.map((c) => c[0]);

  // ── Header ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("st-head");
    const drop = (sec) => {
      if (sec.cards) {
        return `<div class="st-drop st-drop--cards"><div class="st-drop__row">
          <ul class="st-drop__cards">${sec.cards.map((c) => `<li><a class="st-drop__card" href="${hrefOf(sec, c[0])}"><span class="st-drop__card-img"><span class="wf-img" data-label="${c[2]}"></span></span><b>${c[0]}</b><small>${c[1]}</small></a></li>`).join("")}</ul>
          <a class="st-drop__top st-drop__top--cards st-hov" href="${sec.href}">${sec.label} ${arrow()}</a></div></div>`;
      }
      const cols = sec.groups.length > 1
        ? sec.groups.map((g) => `<div class="st-drop__col"><p class="st-gh">${g.head}</p><ul class="st-drop__list">${listHTML(sec, g.items, "", "st-drop__sub")}</ul></div>`).join("")
        : `<div class="st-drop__col"><ul class="st-drop__list">${listHTML(sec, sec.groups[0].items, "", "st-drop__sub")}</ul></div>`;
      return `<div class="st-drop"><div class="st-drop__row">
        <a class="st-drop__visual st-hov" href="${sec.href}"><span class="st-drop__visual-img"><span class="wf-img" data-label="${sec.label} Main photo · bright natural light · landscape 16:9"></span></span><span class="st-drop__top">${sec.label} ${arrow()}</span></a>
        <div class="st-drop__cols">${cols}</div></div></div>`;
    };
    head.innerHTML = `
      <div class="st-head__bar">
        <div class="st-head__inner">
          <a class="st-logo" href="index.html" aria-label="Home"><span class="st-logo__text">BRAND</span></a>
          <div class="st-head__nav">
            <div class="st-head__group">
              <ul class="st-head__menu st-head__menu--toggle">
                ${NAV.map((s) => `<li class="st-head__item st-head__item--toggle" data-key="${s.key}"><a class="st-head__link" href="${s.href}"${cur(s.key)}><span class="st-head__link-in"><span class="st-head__text">${s.label}</span><span class="st-head__plus">${plus}</span></span></a>${drop(s)}</li>`).join("")}
              </ul>
              <span class="st-head__divider"></span>
              <ul class="st-head__menu">
                <li class="st-head__item st-head__item--link"><a class="st-head__link" href="#"><span class="st-head__link-in"><span class="st-head__text">Fabric shop</span>${arrow("ext")}</span></a></li>
                <li class="st-head__item st-head__item--link"><a class="st-head__link" href="#"><span class="st-head__link-in"><span class="st-head__text">Hiring</span>${arrow("ext")}</span></a></li>
              </ul>
            </div>
            <div class="st-head__utils">
              <div class="st-lang"><div class="st-lang__pill"><ul class="st-lang__list"><li><a class="is-current" href="#">KO</a></li><li><a href="#">EN</a></li><li><a href="#">JP</a></li></ul></div></div>
              <button class="st-burger" type="button" aria-label="Open Menu" aria-expanded="false"><span></span><span></span></button>
            </div>
          </div>
        </div>
        <div class="st-head__overlay"></div>
      </div>`;
  }

  // ── Full menu (hamburger) ──
  const footLinks = ["Sitemap", "Privacy policy", "Terms of service", "Cookie Settings"];
  if (head) {
    const sec = (s) => `<div class="st-menu__sec" data-sec>
        <a class="st-menu__sec-link st-hov" href="${s.href}">${s.label} ${arrow()}</a>
        <button class="st-menu__toggle" type="button" aria-expanded="false">${s.label}<span class="st-acc">${acc}</span></button>
        <div class="st-menu__body"><div class="st-menu__inner">
          <a class="st-menu__toplink" href="${s.href}">${s.label} Hero</a>
          ${s.cards ? `<div class="st-menu__group"><ul class="st-menu__list">${listHTML(s, businessList(s), "", "st-menu__sub")}</ul></div>` : groupsHTML(s, "st-menu__group", "st-menu__list", "st-menu__sub")}
        </div></div></div>`;
    head.insertAdjacentHTML("afterend", `
      <div class="st-menu" data-slot="menu-drawer" aria-hidden="true" data-lenis-prevent>
        <div class="st-menu__visual">
          <canvas class="st-menu__canvas" aria-hidden="true"></canvas>
          <div class="st-menu__copy">
            <p class="st-menu__lead"><span>Your legacy here</span><span>A one-line pledge.</span></p>
            <p class="st-menu__tag"><span>0000</span>${chev}<span>Your one-line motto here</span></p>
          </div>
        </div>
        <div class="st-menu__main">
          <div class="st-menu__cols">
            <div class="st-menu__col">${sec(NAV[0])}</div>
            <div class="st-menu__col">${sec(NAV[1])}${sec(NAV[3])}</div>
            <div class="st-menu__col">${sec(NAV[2])}</div>
          </div>
          <div class="st-menu__foot">
            <div class="st-menu__cta">
              <a class="st-pillbtn st-hov" href="#">Fabric shop ${arrow("ext")}</a>
              <a class="st-pillbtn st-hov" href="#">Careers ${arrow("ext")}</a>
              <a class="st-pillbtn st-pillbtn--plain st-hov" href="#"><span class="st-roll" data-str="Contact Us"><span class="st-roll__in">Contact Us</span></span></a>
            </div>
            <ul class="st-menu__links">${footLinks.map((l) => `<li><a class="st-flink" href="#">${l}</a></li>`).join("")}</ul>
          </div>
        </div>
      </div>`);
  }

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("st-foot", "js-head-white", "js-head-hide");
    const col = (s) => `<div class="st-foot__col">
        <a class="st-foot__head" href="${s.href}">${s.label}</a>
        <button class="st-foot__toggle" type="button" aria-expanded="false">${s.label}<span class="st-acc">${acc}</span></button>
        <div class="st-foot__body"><div class="st-foot__inner2">
          <a class="st-foot__toplink" href="${s.href}">${s.label} Hero</a>
          ${s.cards ? `<div class="st-foot__group"><ul class="st-foot__list">${listHTML(s, businessList(s), "", "st-foot__sub")}</ul></div>` : groupsHTML(s, "st-foot__group", "st-foot__list", "st-foot__sub")}
        </div></div></div>`;
    foot.innerHTML = `<div class="st-foot__inner">
        <div class="st-foot__main">
          <nav class="st-foot__nav" aria-label="Bottom Menu"><div class="st-foot__cols">${NAV.map(col).join("")}</div></nav>
          <div class="st-foot__cta"><a class="st-pillbtn st-pillbtn--plain st-hov" href="#"><span class="st-roll" data-str="Contact Us"><span class="st-roll__in">Contact Us</span></span></a></div>
        </div>
        <div class="st-foot__bottom">
          <a class="st-foot__logo" href="index.html" aria-label="Home"><b>BRAND</b><span>0000 ${chev} Your one-line motto here</span></a>
          <ul class="st-foot__links">${footLinks.map((l) => `<li><a class="st-flink" href="#">${l}</a></li>`).join("")}</ul>
          <p class="st-foot__copy">© BRAND Ltd. All rights reserved.</p>
        </div>
      </div>`;
  }

  // Collapsible (phone menu, phone footer): + rotates and grid 0fr→1fr .35s
  document.querySelectorAll(".st-menu__toggle, .st-foot__toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const box = btn.parentElement;
      const open = !box.classList.contains("is-open");
      box.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  // ── Smooth scroll: turned off on phones and touch (same as the original) ──
  if (!reduced && !sp.matches && !matchMedia("(hover: none) and (pointer: coarse)").matches && window.Lenis) {
    // Same settings as original c_smooth-scroll — inner scroll panels (menu, dropdown) are not hijacked by Lenis
    const nested = (n) => n && n.nodeType === 1 && n !== document.body && n !== document.documentElement && n.scrollHeight > n.clientHeight && /auto|scroll/.test(getComputedStyle(n).overflowY);
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1, prevent: nested, autoResize: false, __experimental__naiveDimensions: true });
    ST.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Header state ──
  const root = document.documentElement;
  if (head) {
    const setH = () => root.style.setProperty("--hh", head.offsetHeight + "px");
    setH();
    addEventListener("resize", setH);

    // When overlapping white-text zones (footer etc.), release the blend and use white text, hide the header just before the footer (ahead by the header height).
    const overlaps = (el, r, lead) => {
      const b = el.getBoundingClientRect();
      return b.height > 0 && b.top < r.bottom + lead && b.bottom > r.top;
    };
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = head.getBoundingClientRect();
      let white = false, hide = false;
      document.querySelectorAll(".js-head-white").forEach((el) => { if (el.offsetParent && overlaps(el, r, 0)) white = true; });
      document.querySelectorAll(".js-head-hide").forEach((el) => {
        if (!overlaps(el, r, r.height)) return;
        if (el.getBoundingClientRect().top + scrollY <= r.bottom + r.height) return;
        hide = true;
      });
      root.classList.toggle("st-head-hidden", hide);
      head.classList.toggle("is-white", white);
    };
    const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", req);
    update();

    // Mega dropdown: on click the header opens with white background and ink-colored text, and on a second click, outside click or Esc it goes through a 380ms closing state before closing
    // (the archived CSS opened on hover, but the current original opens on press — confirmed with motion-probe on 2026-10-31)
    const items = head.querySelectorAll(".st-head__item");
    let closeTimer;
    const setOpen = (item, on) => {
      item.classList.toggle("is-open", on);
      item.querySelector(".st-head__link")?.setAttribute("aria-expanded", String(on));
    };
    const closeAll = () => {
      const open = head.querySelector(".st-head__item.is-open");
      if (!open) return;
      setOpen(open, false);
      head.classList.remove("is-mega", "is-overlay");
      head.classList.add("is-closing");
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => head.classList.remove("is-closing"), 380);
    };
    head.querySelectorAll(".st-head__item--toggle > .st-head__link").forEach((a) => {
      a.setAttribute("aria-expanded", "false");
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const item = a.parentElement;
        if (item.classList.contains("is-open")) { closeAll(); return; }
        clearTimeout(closeTimer);
        items.forEach((i) => i !== item && setOpen(i, false));
        head.classList.remove("is-closing");
        head.classList.add("is-mega", "is-overlay");
        setOpen(item, true);
      });
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".st-head__item--toggle")) closeAll(); });
    addEventListener("keydown", (e) => e.key === "Escape" && closeAll());

    // Language pill background (outside the head blend)
    const lang = head.querySelector(".st-lang");
    const back = document.createElement("div");
    back.className = "st-lang-backdrop";
    document.body.append(back);
    const place = () => {
      const r = lang.getBoundingClientRect();
      back.style.setProperty("--lt", r.top + "px");
      back.style.setProperty("--ll", r.left + "px");
      back.style.setProperty("--lw", r.width + "px");
      back.style.setProperty("--lh", r.height + "px");
    };
    place();
    addEventListener("scroll", place, { passive: true });
    addEventListener("resize", place);
    lang.addEventListener("pointerenter", () => back.classList.add("is-open"));
    lang.addEventListener("pointerleave", () => back.classList.remove("is-open"));
    lang.addEventListener("click", (e) => e.preventDefault());

    // Open and close the full menu (Esc too)
    const burger = head.querySelector(".st-burger");
    const menu = document.querySelector(".st-menu");
    const menuCanvas = menu.querySelector("canvas");
    let menuThreads;
    const setMenu = (open) => {
      if (open) root.style.setProperty("--sb", innerWidth - root.clientWidth + "px");
      root.classList.toggle("st-menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      menu.setAttribute("aria-hidden", String(!open));
      if (ST.lenis) open ? ST.lenis.stop() : ST.lenis.start();
      if (open && !sp.matches) {
        menuThreads = menuThreads || ST.threads(menuCanvas, { band: 0 });
        menuThreads.draw();
      }
    };
    burger.addEventListener("click", () => setMenu(!root.classList.contains("st-menu-open")));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("st-menu-open")) setMenu(false); });
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  }

  // ── Title line rise: when it enters above the bottom 25% of the screen ──
  const reveal = (els, margin = "0px 0px -25% 0px") => {
    els.forEach((el) => {
      if (el.dataset.ready) return;
      el.dataset.ready = "1";
      if (reduced) return;
      el.classList.add("is-anim");
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-inview"); io.disconnect(); } }), { rootMargin: el.dataset.revealMargin || margin, threshold: Number(el.dataset.revealThreshold || 0) });
      io.observe(el);
    });
  };
  ST.reveal = reveal;
  reveal(document.querySelectorAll(".st-reveal"));

  // ── Horizontal line drawing: the moment the line itself reaches the screen ──
  document.querySelectorAll("[data-draw]").forEach((box) => {
    if (reduced) return;
    box.classList.add("is-anim");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-inview"); io.unobserve(e.target); } }), { rootMargin: "0px" });
    box.querySelectorAll(".st-draw").forEach((l) => io.observe(l));
  });

  // ── Parallax: shifted the opposite way by the data-parallax value (distance from screen center × value) ──
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const speed = () => Number(sp.matches && el.dataset.parallaxSp != null ? el.dataset.parallaxSp : el.dataset.parallax);
      gsap.fromTo(el, { y: () => innerHeight * speed() }, {
        y: () => -innerHeight * speed(), ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
    });
  });

  // ── Color thread bundle: 120 strands wave with two layered cosines and the bundle width breathes between 1.0 and 2.2x (original values) ──
  ST.threads = (canvas, opt = {}) => {
    const ctx = canvas.getContext("2d");
    const COLORS = [["--site-thread-1", [10, 8, 8]], ["--site-thread-2", [6, 4]], ["--site-thread-3", [6, 6, 4, 4, 2]], ["--site-thread-4", [12, 10, 8, 6]]];
    const N = 120, STEP = 12, LW = 2.6, SLOPE = -Math.tan((12 * Math.PI) / 180);
    let seed, w, h, dpr, lines = [], time = 0, raf = 0, running = false;
    const rnd = () => { const x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
    const build = () => {
      seed = 88;
      const chunks = [];
      // Thread color is a formula rotated from the accent color (oklch from), so pass the computed color to the canvas after painting it.
      const colorOf = (v) => { const s = document.createElement("span"); s.style.color = `var(${v})`; canvas.parentElement.append(s); const c = getComputedStyle(s).color; s.remove(); return c; };
      COLORS.forEach(([v, ratios]) => { const color = colorOf(v); ratios.forEach((r) => chunks.push({ color, ratio: r, y: 0 })); });
      const offs = [];
      let y = 0;
      chunks.forEach(() => { offs.push(y); y += 1 + (rnd() < 0.35 ? rnd() * 7 + 0.5 : 0); });
      const mid = (y - 1) / 2;
      offs.forEach((_, i) => (offs[i] -= mid));
      offs.sort(() => rnd() - 0.64);
      chunks.forEach((c, i) => (c.y = offs[i]));
      const total = chunks.reduce((s, c) => s + c.ratio, 0);
      const pick = () => { let v = rnd() * total; for (const c of chunks) { if (v < c.ratio) return c; v -= c.ratio; } return chunks[0]; };
      seed = 42;
      lines = Array.from({ length: N }, () => {
        const c = pick();
        return { yo: c.y + (rnd() - 0.5) * 1.2, color: c.color, amp: rnd() ** 3 * 35 + 10, freq: rnd() * 0.0074 + 0.001, speed: rnd() * 0.001 + 0.006, phase: rnd() * Math.PI * 5 };
      }).sort((a, b) => a.yo - b.yo);
    };
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      if (!w) size();
      ctx.clearRect(0, 0, w, h);
      const rem = parseFloat(getComputedStyle(root).fontSize) || 10;
      const band = typeof opt.band === "function" ? opt.band(rem) : (opt.band || 0) * rem;
      const startY = h * (opt.y ?? 0.5) + band;
      const spread = Math.max(0.1, 1 + 1.2 * ((Math.sin(time * 0.005) + 1) / 2));
      const list = lines.map((l) => {
        const pts = [];
        let zs = 0;
        for (let x = 0; x <= w + STEP; x += STEP) {
          const a1 = x * l.freq + time * l.speed + l.phase;
          const a2 = x * l.freq * 1.5 - time * l.speed * 0.5;
          const wy = Math.cos(a1) * l.amp + Math.cos(a2) * l.amp * 0.3;
          const wz = -(Math.sin(a1) * l.amp + Math.sin(a2) * l.amp * 0.3);
          pts.push(x, startY + l.yo * spread + x * SLOPE + wy * spread);
          zs += wz;
        }
        return { pts, z: zs, color: l.color };
      }).sort((a, b) => a.z - b.z);
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.lineWidth = LW;
      list.forEach(({ pts, color }) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
        ctx.stroke();
      });
    };
    const loop = () => { if (!running) return; draw(); time -= 1; raf = requestAnimationFrame(loop); };
    build();
    size();
    addEventListener("resize", () => { size(); draw(); });
    return {
      draw,
      start() { if (running || reduced) { draw(); return; } running = true; loop(); },
      stop() { running = false; cancelAnimationFrame(raf); },
    };
  };

  addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
