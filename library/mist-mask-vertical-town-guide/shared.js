// Shared by all pages: draws the logo, menu button, drawer, loader (fog curtain) and footer in one place, and attaches clouds, hand-drawn lines, card reveal, parallax and text splitting.
(() => {
  const NAV = [
    ["index.html", "Home"], ["about.html", "About the village"], ["news.html", "News · Blog"], ["list.html", "Try it out"],
    ["list.html", "Sneak peek"], ["about.html#access", "Directions"], ["#", "Inquiry"], ["#", "Personal information"],
  ];
  const page = document.body.dataset.page || "home";
  const root = document.documentElement;
  const ease = "cubic-bezier(0.3, 0.015, 0.12, 1)";

  // Seal logo — instead of copying the original logo, a new round seal of the same size and position was drawn
  const stamp = () => `<svg class="ky-stamp" viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="62" r="50"/><circle cx="60" cy="62" r="44" stroke-dasharray="2 4"/>
    <path d="M30 34h60M36 34l6-10h36l6 10M44 24v-6h32v6"/>
    <text x="60" y="64" text-anchor="middle">Logo</text>
    <path d="M36 74h48M40 82c4-4 4 4 8 0s4 4 8 0 4 4 8 0 4 4 8 0 4 4 8 0"/>
    <path d="M48 92c-4 6 4 8 0 14M60 92c-4 6 4 8 0 14M72 92c-4 6 4 8 0 14"/>
  </svg>`;
  const logo = (light) => `<a class="ky-logo${light ? " is-light" : ""}" href="index.html" aria-label="Home"><small>Your organization name here</small>${stamp()}</a>`;

  // Cloud (haze): a few rounded bands stacked like stairs. The original layers beige and white cloud images
  const CLOUDS = [
    [[18, 0, 52, 9], [0, 7, 78, 10], [30, 15, 70, 9]],
    [[0, 0, 60, 8], [22, 6, 78, 10], [8, 14, 56, 8]],
    [[35, 0, 45, 8], [10, 6, 90, 10], [0, 14, 62, 9], [40, 21, 40, 7]],
    [[0, 0, 100, 10], [20, 8, 60, 9]],
    [[40, 0, 60, 9], [0, 7, 70, 11], [25, 16, 50, 8]],
  ];
  let uid = 0;
  const cloud = (n) => {
    const rows = CLOUDS[(n - 1) % CLOUDS.length];
    const h = Math.max(...rows.map((r) => r[1] + r[3]));
    const id = `kyc${uid++}`;
    return `<svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" aria-hidden="true"><defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".25"/><stop offset=".7" stop-color="currentColor" stop-opacity=".85"/><stop offset="1" stop-color="currentColor" stop-opacity=".6"/></linearGradient>
      <filter id="${id}f" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1.1"/></filter></defs>
      <g fill="url(#${id})" filter="url(#${id}f)">${rows.map(([x, y, w, rh]) => `<rect x="${x}" y="${y}" width="${w}" height="${rh}" rx="${rh / 2}"/>`).join("")}</g></svg>`;
  };
  // Hand-drawn lines linking the clouds — bends are built from a seed random number (the same number always gives the same line)
  const draw = (n, w = 1000, h = 600) => {
    let s = n * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    let d = `M0 ${h * (0.15 + rnd() * 0.2)}`;
    for (let i = 1; i <= 6; i++) {
      const x = (w / 6) * i, y = h * (0.1 + rnd() * 0.8);
      d += ` C${x - w / 9} ${h * rnd()} ${x - w / 18} ${h * rnd()} ${x} ${y}`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="${d}"/></svg>`;
  };

  const ICON = {
    x: '<svg viewBox="0 0 24 24"><path d="M3 3h5l13 18h-5zM20 3h-2l-6 7 1 1.6zM4 21h2l6.3-7.3-1-1.5z"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-1.6 19.9V15H8v-3h2.4V9.8c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12h2.6l-.4 3h-2.2v6.9A10 10 0 0 0 12 2z"/></svg>',
    ig: '<svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.3 5.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>',
  };

  const news = () => [1, 2, 3].map((i) =>
    `<a href="article.html"><time>2026.00.0${i}</time><span class="ky-line">Your News title here, one line ${i}</span></a>`).join("");

  // ── Drawing in ──
  const header = document.querySelector('[data-slot="header"]');
  if (header) { header.classList.add("ky-header"); header.innerHTML = logo(header.dataset.light === "1"); }

  document.body.insertAdjacentHTML("afterbegin", `
    <button class="ky-menubtn" type="button" data-slot="menu-button" aria-label="Open Menu">
      <span class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>
      <span class="text ky-latin"><span class="open">Menu</span><span class="close">Close</span></span>
    </button>
    <div class="ky-drawer-overlay"></div>
    <aside class="ky-drawer ky-noise" data-slot="drawer" data-lenis-prevent>
      <div class="ky-cloud is-pale" data-cloud="2" style="width:120%;left:-30%;top:28%"></div>
      <div class="ky-cloud is-pale" data-cloud="4" style="width:90%;right:-40%;top:62%"></div>
      <div class="ky-drawer__logo">${logo(false)}</div>
      <nav class="ky-drawer__nav" aria-label="Menu">${NAV.map(([h, t]) => `<a href="${h}"><span class="ky-vline">${t}</span></a>`).join("")}</nav>
      <dl class="ky-drawer__news"><dt>News</dt><dd>${news()}</dd></dl>
      <p class="ky-drawer__copy"><span>Here,</span><span>Vertical copy</span><span>Leave it.</span></p>
    </aside>`);

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.classList.add("ky-footer");
    footer.innerHTML = `
    <div class="ky-footer__copy" data-slot="footer-copy">
      <div class="ky-footer__bg" data-plx-bg><div class="wf-img ky-photo" data-label="Terraced rice fields and a red-roofed village · cloudy morning after rain · low mist · wide landscape"></div></div>
      <p><span data-split>Here,</span><span data-split>Vertical copy</span><span data-split>Leave it.</span></p>
      ${[1, 2, 3, 4].map((n) => `<div class="ky-footer__mat is-mat-0${n}" data-plx-wrap><div class="is-white" data-cloud="${[1, 4, 2, 5][n - 1]}" data-plx></div></div>`).join("")}
    </div>
    <div class="ky-footer__body ky-noise">
      <div class="ky-cloud" data-cloud="3" style="width:125.6vw;top:1.4vw;left:-12.9vw;opacity:.7"></div>
      <div class="ky-draw" data-draw="footer" style="width:49.4vw;left:25.3vw;top:0;height:100%"><div data-draw-svg="7"></div></div>
      <div class="ky-footer__inner ky-grid">
        <div class="ky-footer__cta">
          <dl>
            <dt>Phone Inquiry</dt><dd><a class="ky-uline" href="#"><span class="ky-footer__tel ky-line">000-000-0000</span><span class="ky-footer__cap">Your receiving hours 00:00~00:00 here</span></a></dd>
            <dt>Form inquiry</dt><dd class="ky-footer__contact"><a href="#">To the contact form</a></dd>
          </dl>
          <p class="ky-footer__company">Your group name here<br>Your address line here · 000-0000</p>
          <p class="ky-footer__copyright ky-latin">© 2026 Placeholder. All Rights Reserved.</p>
        </div>
        <nav class="ky-footer__sitemap" aria-label="Sitemap">
          <ul>${NAV.slice(0, 6).map(([h, t]) => `<li><a href="${h}"><span class="ky-vline">${t}</span></a></li>`).join("")}</ul>
          <ul class="is-sub">${NAV.slice(6).map(([h, t]) => `<li><a href="${h}"><span class="ky-vline">${t}</span></a></li>`).join("")}</ul>
        </nav>
        <div class="ky-footer__logo">${logo(false)}</div>
        <div class="ky-footer__sns"><a href="#" aria-label="X">${ICON.x}</a><a href="#" aria-label="Brand">${ICON.fb}</a><a href="#" aria-label="Social Media">${ICON.ig}</a></div>
        <div class="ky-footer__bnr" data-slot="banner-strip"><div class="swiper"><ul class="swiper-wrapper">${["Tourism banner · large title over riverside village photo", "Local brand banner · brush-lettered logo and mountain illustration", "Valley cruise banner · ferry boat on misty river", "Festival banner · night lanterns and yellow text"].map((l) => `<li class="swiper-slide"><a href="#"><div class="wf-img ky-photo" data-label="${l} · Width 1200:206"></div></a></li>`).join("")}</ul></div></div>
      </div>
    </div>`;
  }

  // Banner strip: original Swiper settings as is (loop · 3s autoplay · 0.5s transition · width auto · centered below 1024). Autoplays only while 10% is in view
  const bnr = document.querySelector(".ky-footer__bnr .swiper");
  if (bnr && window.Swiper) {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sw = new Swiper(bnr, {
      loop: true, speed: 500, slidesPerView: "auto", centeredSlides: true, breakpoints: { 1024: { centeredSlides: false } },
      autoplay: still ? false : { delay: 3000, disableOnInteraction: false },
    });
    if (!still) new IntersectionObserver(([e]) => (e.isIntersecting ? sw.autoplay.start() : sw.autoplay.stop()), { threshold: 0.1 }).observe(bnr);
  }

  // Transport: each category (train · car) has a vertical arrow row, with a hand-drawn route map beside it — the original map art wasn’t copied, redrawn as a diagram with the same composition
  const access = document.querySelector('[data-slot="access-routes"]');
  if (access) {
    const way = (rows, end) => `<div class="ky-route__way">${rows.map(([from, by, time]) => `<p>${from}</p><p><span class="arw">↓</span>${by} · · · ${time}</p>`).join("")}<span class="tag">${end}</span></div>`;
    const N = [["Station 1", 470, 40], ["Station 2", 520, 120], ["Station 3", 440, 150], ["Station 4", 360, 200], ["Station 5", 300, 250], ["Station 6", 420, 270], ["Station 7", 520, 300], ["Station 8", 380, 360], ["Station 9", 470, 420], ["Station 10", 260, 330], ["Station 11", 200, 420], ["Station 12", 540, 470]];
    const node = ([t, x, y]) => `<g class="node"><rect x="${x - 18}" y="${y - 9}" width="36" height="18" rx="2"/><text x="${x}" y="${y + 3.5}" text-anchor="middle">${t}</text></g>`;
    const pts = (ids) => ids.map((i) => `${N[i][1]},${N[i][2]}`).join(" ");
    access.innerHTML = `
      <div class="ky-access__routes">
        <div class="ky-route" data-map="train"><h3>Arriving by train</h3>
          ${way([["Departure 1", "High-speed train", "0 hr 00 min"], ["Transfer point", "Regional line", "0 hr 00 min"]], "Town station")}
          ${way([["Departure 2", "High-speed train", "0 hr 00 min"], ["Transfer point", "Express", "0 hr 00 min"], ["Transfer point", "Regional line", "0 hr 00 min"]], "Town station")}
        </div>
        <div class="ky-route" data-map="car"><h3>Coming by car</h3>
          ${way([["Junction 1", "Highway", "000km"], ["Junction 2", "National Route 000", "00km"]], "Village")}
          ${way([["Junction 3", "Highway", "00km"], ["Junction 4", "National Route 000", "00km"]], "Village")}
          ${way([["Branch Point 5", "Highway", "000km"], ["Exit", "National Route 000 (closed in winter)", "00km"]], "Village")}
        </div>
      </div>
      <div class="ky-access__map"><div class="ky-map" data-current-map="train">
        <svg viewBox="0 0 600 520" role="img" aria-label="Schematic map of the way to the village">
          <path class="town" d="M108 300c14-14 34-10 44-2 12 10 30 4 34 18 4 16-12 22-10 36-12 8-30 4-40 12-14-4-12-20-26-26-10-14-12-26-2-38z"/>
          <g data-map-layer="car"><polyline class="road" points="${pts([10, 4, 3, 2, 0])}"/><polyline class="road" points="${pts([10, 5, 6, 1])}"/><polyline class="road" points="${pts([10, 7, 8, 11])}"/><polyline class="road" points="150,330 ${pts([10])}"/></g>
          <g data-map-layer="train"><polyline class="rail" points="150,330 ${pts([9, 4, 3, 2, 0])}"/><polyline class="rail" points="${pts([4, 5, 6, 1])}"/><polyline class="rail" points="${pts([9, 10, 8, 11])}"/></g>
          ${N.map(node).join("")}
          <g class="town-label"><rect x="60" y="300" width="44" height="22" rx="2"/><text x="82" y="315" text-anchor="middle">Village</text></g>
        </svg></div></div>`;
  }

  document.querySelectorAll("[data-cloud]").forEach((el) => {
    el.classList.add("ky-cloud");
    el.insertAdjacentHTML("afterbegin", cloud(+el.dataset.cloud));
  });
  document.querySelectorAll("[data-draw-svg]").forEach((el) => { el.outerHTML = draw(+el.dataset.drawSvg); });

  // Card titles get an underline on hover, like the original m-post.uline
  document.querySelectorAll(".ky-post__title").forEach((t) => { t.innerHTML = `<span class="ky-line">${t.innerHTML}</span>`; });
  // Vertical breadcrumb links also get a vertical underline like the original m-breadcrumb uline
  document.querySelectorAll(".ky-crumb a").forEach((a) => { a.innerHTML = `<span class="ky-vline">${a.innerHTML}</span>`; });

  // Letter splitting — one span per character, like the original js-split-text
  document.querySelectorAll("[data-split]").forEach((el) => {
    el.innerHTML = [...el.textContent].map((c) => `<span>${c}</span>`).join("");
  });

  // ── Smooth scroll: original Lenis duration .8, easeOutCubic ──
  const lenis = window.Lenis ? new Lenis({ duration: 0.8, easing: (t) => 1 - Math.pow(1 - t, 3), smoothWheel: true }) : null;
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.kyLenis = lenis;

  // ── Drawer ──
  const btn = document.querySelector(".ky-menubtn");
  const drawerNav = document.querySelector(".ky-drawer__nav");
  const toggle = () => {
    const open = root.dataset.state !== "navOpen";
    root.dataset.state = open ? "navOpen" : "";
    btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  btn.addEventListener("click", toggle);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && root.dataset.state === "navOpen") toggle(); });
  document.querySelector(".ky-drawer-overlay").addEventListener("click", () => root.dataset.state === "navOpen" && toggle());
  drawerNav.addEventListener("click", (e) => { if (e.target.closest('a[href^="#"]')) toggle(); });

  // ── Loader Lottie: same canvas as the original Lottie (1377×780 · 50fps · 300 frames = 6s) and a per-layer timetable, with only the artwork built from our own stamps and our own clouds ──
  // Color is read from the skin — change the skin and the loader changes too
  const tone = (v) => {
    const probe = document.createElement("i");
    probe.style.color = v;
    document.body.append(probe);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = getComputedStyle(probe).color;
    probe.remove();
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return { c: [d[0] / 255, d[1] / 255, d[2] / 255, 1], a: d[3] / 2.55 };
  };
  const K = (k) => ({ a: 0, k });
  const tr = (o = {}) => ({ ty: "tr", p: K(o.p || [0, 0]), a: K(o.a || [0, 0]), s: K(o.s || [100, 100]), r: K(0), o: K(100), sk: K(0), sa: K(0) });
  const line = (pts, closed = false) => ({ ty: "sh", ks: K({ c: closed, v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) }) });
  const lottieData = () => {
    const ink = tone("var(--kf-ink)"), white = tone("var(--site-cloud-white)");
    // The stamp (same 120-cell drawing as the header logo) at 170px in the screen center — the original logo position (688, 390) and size (about 200×170)
    const wave = Array.from({ length: 13 }, (_, i) => [36 + i * 4, 82 + (i % 2 ? (i % 4 === 1 ? -3 : 3) : 0)]);
    const squig = (x) => [[x, 92], [x - 3, 96], [x + 2, 100], [x - 2, 104], [x, 106]];
    const stampShapes = [
      { ty: "gr", it: [{ ty: "el", s: K([100, 100]), p: K([60, 62]), d: 1 }, { ty: "st", c: K(ink.c), o: K(100), w: K(4), lc: 2, lj: 2, ml: 4 }, tr()] },
      { ty: "gr", it: [{ ty: "el", s: K([88, 88]), p: K([60, 62]), d: 1 }, { ty: "st", c: K(ink.c), o: K(100), w: K(1.6), lc: 2, lj: 2, ml: 4, d: [{ n: "d", nm: "dash", v: K(2) }, { n: "g", nm: "gap", v: K(4) }, { n: "o", nm: "offset", v: K(0) }] }, tr()] },
      { ty: "gr", it: [line([[30, 34], [90, 34]]), line([[36, 34], [42, 24], [78, 24], [84, 34]]), line([[44, 24], [44, 18], [76, 18], [76, 24]]), line([[36, 74], [84, 74]]), line(wave), line(squig(48)), line(squig(60)), line(squig(72)), { ty: "st", c: K(ink.c), o: K(100), w: K(3.4), lc: 2, lj: 2, ml: 4 }, tr()] },
      { ty: "gr", it: [{ ty: "rc", s: K([12, 14]), p: K([51, 56]), r: K(1) }, { ty: "rc", s: K([12, 14]), p: K([69, 56]), r: K(1) }, { ty: "fl", c: K(ink.c), o: K(100), r: 1 }, tr()] },
    ];
    const ks = (o) => ({ o: o.o || K(100), r: K(0), p: o.p, a: K(o.a || [0, 0, 0]), s: K(o.s || [100, 100, 100]) });
    const ease = (t, s, o, i) => ({ t, s, o: { x: [o[0]], y: [o[1]] }, i: { x: [i[0]], y: [i[1]] } });
    const lin = [0.167, 0.167], linI = [0.833, 0.833];
    const fade = (first) => ({ a: 1, k: [ease(81, [first], lin, linI), ease(148, [100], lin, linI), ease(203, [100], lin, linI), { t: 290, s: [0] }] });
    // Three clouds: same size and same path as the original cloud art (50→167→300f), appearing at 81~148f and vanishing at 203~290f
    const cloudLayer = (ind, w, h, xs, y, rows, first) => ({
      ddd: 0, ind, ty: 4, nm: `Cloud ${ind}`, sr: 1, ao: 0, ip: 0, op: 300, st: 0, bm: 0,
      ks: ks({ o: fade(first), a: [w / 2, h / 2, 0], p: { s: true, x: { a: 1, k: [ease(50, [xs[0]], [0.005, 0.195], [0, 1]), ease(167, [xs[1]], [1, 0], [0.833, 1]), { t: 300, s: [xs[2]] }] }, y: K(y) } }),
      ef: [{ ty: 29, nm: "Gaussian Blur", np: 5, mn: "ADBE Gaussian Blur 2", ix: 1, en: 1, ef: [{ ty: 0, nm: "Blurriness", mn: "ADBE Gaussian Blur 2-0001", ix: 1, v: K(h / 14) }, { ty: 7, nm: "Blur Dimensions", mn: "ADBE Gaussian Blur 2-0002", ix: 2, v: K(1) }, { ty: 7, nm: "Repeat Edge Pixels", mn: "ADBE Gaussian Blur 2-0003", ix: 3, v: K(0) }] }],
      shapes: [{ ty: "gr", it: [...rows.map(([x, yy, rw, rh]) => ({ ty: "rc", s: K([(rw / 100) * w, rh * (h / 30)]), p: K([((x + rw / 2) / 100) * w, (yy + rh / 2) * (h / 30)]), r: K((rh * (h / 30)) / 2) })), { ty: "fl", c: K(white.c), o: K(white.a), r: 1 }, tr()] }],
    });
    return {
      v: "5.12.2", fr: 50, ip: 0, op: 300, w: 1377, h: 780, nm: "Stamp loader", ddd: 0, assets: [],
      layers: [
        // The stamp shape is the alpha matte of the ink layer below — the ink surface descends from the top over 20→150f so the stamp prints from the top, then fades at 250→286f
        { ddd: 0, ind: 1, ty: 4, nm: "Stamp mat", td: 1, sr: 1, ao: 0, ip: 0, op: 300, st: 0, bm: 0, ks: ks({ p: K([688.5, 390, 0]), a: [60, 62, 0], s: [170, 170, 100] }), shapes: stampShapes },
        { ddd: 0, ind: 2, ty: 4, nm: "Ink Surface", tt: 1, sr: 1, ao: 0, ip: 0, op: 300, st: 0, bm: 0,
          ks: ks({ o: { a: 1, k: [ease(250, [100], lin, linI), { t: 286, s: [0] }] }, p: { a: 1, k: [{ t: 0, s: [688.5, 7.258, 0], o: { x: 0.167, y: 0.167 }, i: { x: 0.833, y: 0.833 } }, { t: 20, s: [688.5, 7.258, 0], o: { x: 0.167, y: 0.167 }, i: { x: 0.833, y: 0.833 } }, { t: 150, s: [688.5, 422.85, 0] }] } }),
          shapes: [{ ty: "gr", it: [{ ty: "rc", s: K([437, 587]), p: K([0, 0]), r: K(0) }, { ty: "gf", o: K(100), r: 1, t: 1, s: K([0, -293]), e: K([0, 293]), g: { p: 2, k: K([0, ...ink.c.slice(0, 3), 1, ...ink.c.slice(0, 3), 0, 1, 0.82, 1, 1, 0]) } }, tr()] }] },
        cloudLayer(3, 1370, 382, [1591.927, 1213.927, 888.342], 587.483, CLOUDS[2], 0),
        cloudLayer(4, 932, 363, [974.706, 599.706, 343.22], 258.217, CLOUDS[0], 0),
        cloudLayer(5, 603, 228, [110.455, 435.455, 847.708], 515.671, CLOUDS[4], 1),
      ],
    };
  };

  // ── Loader · page transition: on a first-visit tab, lift the curtain after the Lottie (6s) ends, on an already-seen tab, lift it immediately (sessionStorage instead of the original window.name) ──
  const splash = document.querySelector(".ky-splash");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveal = () => { splash.classList.add("isTransitionOut"); root.dataset.state = ""; lenis && lenis.start(); document.dispatchEvent(new Event("ky:ready")); };
  if (reduce) { splash.classList.add("isTransitionOut"); queueMicrotask(() => document.dispatchEvent(new Event("ky:ready"))); }
  else {
    lenis && lenis.stop();
    const visited = sessionStorage.getItem("ky-visited") === "1";
    sessionStorage.setItem("ky-visited", "1");
    const anim = window.lottie ? lottie.loadAnimation({ container: splash.querySelector(".ky-splash__lottie"), renderer: "svg", animationData: JSON.parse(JSON.stringify(lottieData())), loop: false, autoplay: false }) : null;
    addEventListener("load", () => {
      // Draw the covered first frame once, then lift — if the lift class is added before the first frame, the 1s transition gets skipped
      if (visited || !anim) return requestAnimationFrame(() => requestAnimationFrame(reveal));
      anim.addEventListener("complete", reveal, { once: true });
      anim.play();
    });
  }
  // When leaving for another page the curtain flips (scale -1) to cover again and moves on after 1s — original isTransitionIn
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || reduce || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href)) return;
    const [file, hash] = href.split("#");
    if (file === location.pathname.split("/").pop() && hash) return;
    e.preventDefault();
    splash.classList.remove("isTransitionOut");
    splash.classList.add("isTransitionIn");
    setTimeout(() => { location.href = href; }, 1000);
  });

  addEventListener("pageshow", (e) => { if (e.persisted) { splash.classList.remove("isTransitionIn"); splash.classList.add("isTransitionOut"); } });

  // ── Scroll motion ──
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.reduce) {
      document.querySelectorAll(".ky-post").forEach((p) => p.classList.add("isActive"));
      return;
    }
    // Card row: when the row touches the 85% line, each card gets isActive at 0.1s intervals (original toggleClassTrain)
    document.querySelectorAll("[data-train]").forEach((list) => {
      const items = list.querySelectorAll(".ky-post");
      let timers = [];
      ScrollTrigger.create({
        trigger: list, start: "top 85%", end: "top 85%",
        onEnter: () => items.forEach((it, i) => timers.push(setTimeout(() => it.classList.add("isActive"), 100 * i))),
        onLeaveBack: () => { timers.forEach(clearTimeout); timers = []; items.forEach((it) => it.classList.remove("isActive")); },
      });
    });
    // Parallax: while the wrapping cell passes the screen it rises by data-plx (default its own height) (original parallaxItem). If the cell lists pc and sp, it applies only at that width
    const narrow = innerWidth < 1023;
    document.querySelectorAll("[data-plx]").forEach((el) => {
      const wrap = el.closest("[data-plx-wrap]") || el.parentElement;
      const only = wrap.dataset.plxWrap;
      if ((only === "pc" && narrow) || (only === "sp" && !narrow)) return;
      gsap.to(el, { y: (narrow && el.dataset.plxSp) || el.dataset.plx || "-100%", ease: "none", scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: 0, invalidateOnRefresh: true } });
    });
    // Background photo parallax: while a 1.15x photo passes from the bottom, it moves down by (photo height × 1.15 − frame height) (original parallaxBg)
    document.querySelectorAll("[data-plx-bg]").forEach((wrap) => {
      const img = wrap.querySelector(".wf-img");
      gsap.to(img, { y: () => img.clientHeight * 1.15 - wrap.getBoundingClientRect().height, ease: "none", scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: 0, invalidateOnRefresh: true } });
    });
    // Hand-drawn line: drawn with scroll from the screen center to the 70% line (for the footer, 30% bottom → bottom bottom)
    document.querySelectorAll("[data-draw]").forEach((wrap) => {
      const path = wrap.querySelector("path");
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      const foot = wrap.dataset.draw === "footer";
      gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: foot ? wrap.parentElement : wrap, start: foot ? "30% bottom" : "top center", end: foot ? "bottom bottom" : "bottom 70%", scrub: 1 } });
    });
    // Subpage header·body panel clouds: while the panel passes over the screen -10% (original [data-trigger="l-title"] [data-parallax-item])
    document.querySelectorAll(".ky-title .ky-cloud, [data-title-plx] .ky-cloud").forEach((c) => {
      gsap.to(c, { yPercent: -10, ease: "none", scrollTrigger: { trigger: c.closest(".ky-title, [data-title-plx]"), start: "top top", end: "bottom top", scrub: 0, invalidateOnRefresh: true } });
    });
    // Transit map: when a branch passes the screen center, switch to that branch’s map
    document.querySelectorAll("[data-map]").forEach((route) => {
      const map = route.closest(".ky-access").querySelector("[data-current-map]");
      ScrollTrigger.create({ trigger: route, start: "top center", end: "bottom center", onEnter: () => (map.dataset.currentMap = route.dataset.map), onEnterBack: () => (map.dataset.currentMap = route.dataset.map) });
    });
  });

  window.ky = { mm, lenis, ease, cloud, draw, page };
})();
