// Shared by all pages: header · menu · footer insertion, capsule shape calculation, Lenis, button hover, capsule menu, spread tagline,
// Paragraph whose letters brighten, photo blooming into a capsule, parallax where the footer pushes the body out, page transition curtain.
// Page scenes added via uSite.scene(fn) are set up in order after the shared preparation finishes.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => innerWidth >= 1024;

  // ── Capsule: not using the original logo O, it is redrawn as a superellipse (exponent 2.4). Default aspect ratio is 463:320 ──
  const N = 2.4;
  const STEPS = 72;
  const ring = Array.from({ length: STEPS }, (_, i) => {
    const t = (i / STEPS) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    return [Math.sign(c) * Math.abs(c) ** (2 / N), Math.sign(s) * Math.abs(s) ** (2 / N)];
  });
  const capsule = {
    ASPECT: 463 / 320,
    // clip-path polygon string from center, width and height (px)
    // When longer than the base ratio, keep both end shapes as they are and stretch only the middle straight (the original’s long pill capsule)
    poly(cx, cy, w, h) {
      const b = h / 2;
      let a = w / 2, ext = 0;
      const capA = b * capsule.ASPECT;
      if (a > capA * 1.02) { ext = a - capA; a = capA; }
      return "polygon(" + ring.map(([x, y]) => `${(cx + x * a + Math.sign(x) * ext).toFixed(1)}px ${(cy + y * b).toFixed(1)}px`).join(",") + ")";
    },
    // How many times must the base capsule (w0×h0) be scaled to cover the W×H screen to its corners (original maxCover)
    cover(W, H, w0, h0) {
      return ((W / w0) ** N + (H / h0) ** N) ** (1 / N);
    },
    // The same shape as an SVG path — the menu opens by swapping the SVG clipPath, like the original (the CSS clip-path value stays as is)
    path(cx, cy, w, h) {
      if (!(w > 0 && h > 0)) return "";
      return "M" + capsule.poly(cx, cy, w, h).slice(8, -1).replace(/px/g, "").split(",").map((p) => p.trim()).join("L") + "Z";
    },
    obbPath(vertical) {
      return "M" + ring.map(([x, y]) => {
        const px = vertical ? 0.5 + y * 0.5 : 0.5 + x * 0.5;
        const py = vertical ? 0.5 + x * 0.5 : 0.5 + y * 0.5;
        return `${px.toFixed(4)} ${py.toFixed(4)}`;
      }).join("L") + "Z";
    },
  };

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.setAttribute("width", "0");
  defs.setAttribute("height", "0");
  defs.setAttribute("aria-hidden", "true");
  defs.style.position = "absolute";
  defs.innerHTML = `<defs>
    <clipPath id="u-capsule-obb" clipPathUnits="objectBoundingBox"><path d="${capsule.obbPath(false)}"/></clipPath>
    <clipPath id="u-capsule-obb-v" clipPathUnits="objectBoundingBox"><path d="${capsule.obbPath(true)}"/></clipPath>
    <clipPath id="u-menu-clip" clipPathUnits="userSpaceOnUse"><path d=""/></clipPath>
  </defs>`;
  body.prepend(defs);

  // ── Markup to insert ──
  const mark = (extra = "") => `<span class="u-mark ${extra}" aria-hidden="true">L<span class="u-mark__o"></span>GO TYPE</span>`;
  const btn = (label, href, cls = "") => {
    const tag = href ? "a" : "button";
    const attr = href ? `href="${href}"` : `type="button"`;
    return `<${tag} class="u-btn ${cls}" ${attr}><span class="u-btn__l"></span><span class="u-btn__label">${label}</span><span class="u-btn__r"></span></${tag}>`;
  };
  const NAV = [
    ["index.html#capability", "Your strength here", "Capability"],
    ["service.html", "Business introduction", "Service"],
    ["about.html", "Company info", "Company"],
    ["about.html#outline", "Office · Getting here", "Office / Access"],
    ["recruit.html", "Hiring Info", "Recruit"],
    ["news.html", "News", "News"],
  ];
  const arrow = `<svg class="u-arrow" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1.5 6.5 6.5 1.5M2.5 1.5h4v4"/></svg>`;

  const headerSlot = document.querySelector('[data-slot="header"]');
  if (headerSlot) {
    headerSlot.className = "u-header";
    headerSlot.innerHTML = `
      <div class="u-header__in u-wrap">
        <div class="u-header__brand u-hide-on-scroll">
          <a href="index.html" aria-label="Back to start">${mark()}</a>
          <div class="u-lang"><span aria-current="page">Ja</span><a class="u-fade" href="#">En</a></div>
        </div>
        <nav class="u-header__nav u-hide-on-scroll" aria-label="Main menu">
          <ul class="t" style="--fs:13;--lh:1.2">${NAV.map(([h, ja]) => `<li><a class="u-dot" style="--x:12;--dot:6" href="${h}"><span>${ja}</span></a></li>`).join("")}</ul>
        </nav>
        <div class="u-header__btns">
          ${btn("Contact", "#contact")}
          ${btn("Menu", null, "u-btn--line u-menu-open")}
        </div>
      </div>`;
  }

  const menu = document.createElement("div");
  menu.className = "u-menu";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-modal", "true");
  menu.setAttribute("aria-label", "Menu");
  menu.dataset.slot = "menu";
  // The outer panel covers the screen as soon as it opens and takes input (like the original, the pressed button’s hover releases at once), and only the inner panel is cut into a capsule
  menu.innerHTML = `<div class="u-menu__clip">
    ${btn("Close", null, "u-btn--line u-menu__close")}
    <div class="u-menu__in u-wrap">
      <ul class="u-menu__nav">
        ${NAV.map(([h, ja, en], i) => `
          <li class="u-menu__item" style="--i:${i}">
            <div><a class="u-menu__big u-fade" href="${h}">${en}</a><small>${ja}</small></div>
            ${en === "Recruit" ? `<div class="u-menu__sub"><a class="u-fade" href="detail.html">Staff interview</a><a class="u-fade" href="recruit.html#faq">Frequently asked questions</a><a class="u-fade" href="#">Open positions (↗)</a></div>` : ""}
          </li>`).join("")}
        <li class="u-menu__fade t" style="--i:6;--fs:11;margin-top:calc(var(--u)*16)"><a class="u-fade" href="#">Privacy policy</a></li>
      </ul>
      <div class="u-menu__sns u-menu__fade" style="--i:1"><a class="u-fade" href="#">Facebook <span>(↗)</span></a><a class="u-fade" href="#">Instagram <span>(↗)</span></a></div>
      <div class="u-menu__foot">
        <div class="u-lang u-menu__fade" style="--i:2"><span aria-current="page">Ja</span><a class="u-fade" href="#">En</a></div>
        <div class="u-menu__fade" style="--i:3">${btn("Contact", "#contact", "u-menu__contact")}</div>
      </div>
      <div class="u-menu__logo">${mark()}</div>
    </div></div>`;
  body.append(menu);

  const footSlot = document.querySelector('[data-slot="footer"]');
  if (footSlot) {
    footSlot.className = "u-foot";
    footSlot.innerHTML = `
      <div class="u-foot__in u-wrap">
        <div class="u-foot__mark">
          <a href="index.html" aria-label="Back to start" style="display:inline-block">${mark()}</a>
          <p class="u-tagline" data-tagline>Your ten-character one-liner here</p>
        </div>
        <div class="u-foot__line"></div>
        <div class="u-foot__grid">
          <div class="u-foot__nav">
            <nav aria-label="Footer Menu">
              ${NAV.map(([h, ja]) => `<a class="u-dot" href="${h}"><span>${ja}</span></a>`).join("")}
              <a class="u-dot u-foot__privacy" href="#"><span>Privacy policy</span></a>
            </nav>
            <div class="u-foot__sns"><a class="u-fade" href="#">Facebook <span>(↗)</span></a><a class="u-fade" href="#">Instagram <span>(↗)</span></a></div>
            <div class="u-lang"><span aria-current="page">Ja</span><a class="u-fade" href="#">En</a></div>
          </div>
          <address class="u-foot__addr">
            <div><b>Headquarters</b>Your company name here<br><a class="u-fade" href="#">Your postal code and head office address here in one line ${arrow}</a></div>
            <div><b>Branch</b><a class="u-fade" href="#">Your one-line branch address ${arrow}</a></div>
            <div><b>Overseas base</b><a class="u-fade" href="#">Your overseas office address here<br>Set in two lines ${arrow}</a></div>
            <div><b>Overseas office</b><a class="u-fade" href="#">Your office address line here ${arrow}</a></div>
          </address>
          <div class="u-foot__badges">
            <ul>${["Certification mark 1", "Association logo 2", "Association logo 3", "Association logo 4", "Certification mark 5"].map((l) => `<li><a class="u-fade" href="#" style="display:block;height:100%"><div class="wf-img" data-label="${l}"></div></a></li>`).join("")}</ul>
            <p class="u-foot__copy">© LOGO TYPE CO., LTD.</p>
          </div>
          <div class="u-foot__cta">${btn("Contact", "#contact")}</div>
        </div>
      </div>`;
  }

  if (body.dataset.entry !== undefined) {
    const entry = document.createElement("div");
    entry.innerHTML = `<a class="u-btn u-entry" href="#"><span class="u-btn__l">${arrow}</span><span class="u-btn__label">Entry</span><span class="u-btn__r"></span></a>`;
    body.append(entry.firstElementChild);
  }

  // Grid background is a part (grid-ripple-bg). The news list has double-size cells, and fits to the incoming page’s cell size in 2 seconds
  const grid = document.createElement("div");
  grid.className = "u-gridbg";
  grid.setAttribute("aria-hidden", "true");
  grid.dataset.fx = "grid-ripple-bg";
  grid.setAttribute("data-fx-grid-ripple-bg", ["remember: union", "letters: LOGOTYPEANEWGRIDLINE", `zoom: ${body.dataset.gridZoom || 1}`, body.dataset.gridFront && `front: ${body.dataset.gridFront}`].filter(Boolean).join("; "));
  body.prepend(grid);
  const gridFx = (detail) => document.dispatchEvent(new CustomEvent("fx:grid-ripple-bg", { detail }));

  const veil = document.createElement("div");
  veil.className = "u-veil";
  body.append(veil);

  // ── Lenis ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = window.lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Header: past the top, the logo · text menu hide ──
  const onScroll = () => body.classList.toggle("is-past-top", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Lottie where a dot stretches into a pill (same 1808×400 · 30 frames as the original circle-*.json). The art is our own — a 463:320 dot stretches horizontally ──
  const PILL = (() => {
    const key = (t, v) => ({ t, s: v, i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] } });
    const anim = (from, to) => ({ a: 1, k: [key(0, from), { t: 30, s: to }] });
    return {
      v: "5.9.0", fr: 29.97, ip: 0, op: 30, w: 1808, h: 400, nm: "pill", ddd: 0, assets: [],
      layers: [{
        ddd: 0, ind: 1, ty: 4, nm: "pill", sr: 1, ao: 0, ip: 0, op: 30, st: 0, bm: 0,
        ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [0, 0, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
        shapes: [{ ty: "gr", it: [
          { ty: "rc", d: 1, s: anim([578, 400], [1808, 400]), p: anim([289, 200], [904, 200]), r: { a: 0, k: 200 } },
          { ty: "fl", c: { a: 0, k: [0, 0, 0, 1] }, o: { a: 0, k: 100 }, r: 1 },
          { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } },
        ] }],
      }],
    };
  })();
  const pill = (box) => {
    if (!window.lottie || !box) return null;
    const a = lottie.loadAnimation({ container: box, renderer: "svg", loop: false, autoplay: false, animationData: PILL, rendererSettings: { preserveAspectRatio: "xMinYMid meet" } });
    a.goToAndStop(0, true);
    return a;
  };
  // Original f0 (forward) and Qa (rewind): push the frame number with GSAP
  const playPill = (a, on, { duration, ease, delay = 0 }) => {
    if (!a) return;
    const p = a._p || (a._p = { f: 0 });
    gsap.to(p, { f: on ? a.totalFrames : 0, duration: reduce ? 0 : duration, ease, delay, overwrite: true, onUpdate: () => a.goToAndStop(p.f, true) });
  };

  // ── Pill button hover: on enter the capsule comes up from below, on leave it exits upward, and the right dot stretches into a pill over .55s ──
  document.querySelectorAll(".u-btn__r").forEach((r) => { r.textContent = ""; r._pill = pill(r); });
  // The covering capsule is a 463:320 capsule 8px larger than the button on all sides, at 1.05x, the text is pushed to the left dot position (original --hover-overlay-* and --hover-label-x).
  const sizeBtn = (b) => {
    const { width: w, height: h } = b.getBoundingClientRect();
    if (!w || !h) return;
    let ow = w + 16, oh = ow / capsule.ASPECT;
    if (oh < h + 16) { oh = h + 16; ow = oh * capsule.ASPECT; }
    b.style.setProperty("--ov-w", `${ow * 1.05}px`);
    b.style.setProperty("--ov-h", `${oh * 1.05}px`);
    const l = b.querySelector(".u-btn__l"), t = b.querySelector(".u-btn__label");
    if (l && t && !b.classList.contains("is-hover")) b.style.setProperty("--label-dx", `${l.getBoundingClientRect().left - t.getBoundingClientRect().left}px`);
  };
  // Like the original, measured from the start and whenever size changes — measuring at hover time would make the cover size appear to change then
  const btnRo = new ResizeObserver((es) => es.forEach((en) => sizeBtn(en.target)));
  document.querySelectorAll(".u-btn, .u-cap").forEach((b) => btnRo.observe(b));
  document.fonts?.ready.then(() => document.querySelectorAll(".u-btn, .u-cap").forEach(sizeBtn));
  document.addEventListener("pointerover", (e) => {
    const b = e.target.closest(".u-btn, .u-cap");
    if (!b || b.contains(e.relatedTarget)) return;
    clearTimeout(b._leaveT);
    // Return the cover left in the vacated spot (top) to its place below first, then raise it again
    if (b.classList.contains("is-leave")) { b.classList.remove("is-leave"); void b.offsetWidth; }
    b.classList.add("is-hover");
    playPill(b.querySelector(".u-btn__r")?._pill, true, { duration: 0.55, ease: "power3.inOut" });
  });
  document.addEventListener("pointerout", (e) => {
    const b = e.target.closest(".u-btn, .u-cap");
    if (!b || b.contains(e.relatedTarget)) return;
    b.classList.remove("is-hover");
    b.classList.add("is-leave");
    // Returns the lifted cover to its place (below) — pill button after .5s, button without a left dot as soon as the lift (.25s) ends (original measured values)
    b._leaveT = setTimeout(() => b.classList.remove("is-leave"), b.classList.contains("u-cap") ? 250 : 500);
    playPill(b.querySelector(".u-btn__r")?._pill, false, { duration: 0.45, ease: "power2.inOut" });
  });

  // ── Menu: the center capsule grows until it covers the screen ──
  const menuState = { p: 0 };
  const menuClip = defs.querySelector("#u-menu-clip path");
  const drawMenu = () => {
    const W = innerWidth, H = innerHeight;
    const w0 = 463, h0 = 320;
    const s = capsule.cover(W, H, w0, h0) * 1.02 * menuState.p;
    menuClip.setAttribute("d", capsule.path(W / 2, H / 2, w0 * s, h0 * s));
  };
  let menuTween = null;
  const openMenu = () => {
    menuTween?.kill();
    menu.classList.add("is-open");
    menu.classList.remove("is-closing");
    requestAnimationFrame(() => menu.classList.add("is-in"));
    lenis?.stop();
    menuTween = gsap.to(menuState, { p: 1, duration: reduce ? 0 : 0.8, ease: "power3.inOut", onUpdate: drawMenu });
    menu.querySelector(".u-menu__close").focus({ preventScroll: true });
  };
  const closeMenu = () => {
    if (!menu.classList.contains("is-open")) return;
    menuTween?.kill();
    menu.classList.add("is-closing");
    menuTween = gsap.to(menuState, {
      p: 0, duration: reduce ? 0 : 0.6, ease: "power2.inOut", onUpdate: drawMenu,
      onComplete: () => { menu.classList.remove("is-open", "is-closing", "is-in"); lenis?.start(); },
    });
  };
  document.querySelectorAll(".u-menu-open").forEach((b) => b.addEventListener("click", openMenu));
  menu.querySelector(".u-menu__close").addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  addEventListener("resize", () => menuState.p && drawMenu());

  // ── Spread tagline: every 3s pick 1~4 letters and split the leftover width among them by random ratios ──
  const taglines = [];
  const initTagline = (el) => {
    const chars = [...el.textContent.trim()];
    el.innerHTML = chars.map((c) => `<span>${c}</span>`).join("");
    const spans = [...el.children];
    const spread = () => {
      spans.forEach((s) => (s.style.width = "auto"));
      const widths = spans.map((s) => s.getBoundingClientRect().width);
      const free = Math.max(0, el.clientWidth - widths.reduce((a, b) => a + b, 0));
      const pool = spans.slice(0, -1).map((_, i) => i);
      const count = 1 + Math.floor(Math.random() * 4);
      const picked = [];
      while (picked.length < count && pool.length) picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      const r = picked.map(() => Math.random());
      const sum = r.reduce((a, b) => a + b, 0);
      picked.forEach((idx, k) => (widths[idx] += free * (r[k] / sum)));
      spans.forEach((s, i) => (s.style.width = `${widths[i]}px`));
    };
    taglines.push({ el, spread });
    spread();
  };
  document.querySelectorAll("[data-tagline]").forEach(initTagline);
  if (!reduce) {
    setInterval(() => taglines.forEach((t) => !t.el.hasAttribute("data-tagline-sync") && t.spread()), 3000);
    document.addEventListener("u:fv-tick", () => taglines.forEach((t) => t.el.hasAttribute("data-tagline-sync") && t.spread()));
  }
  addEventListener("resize", () => taglines.forEach((t) => t.spread()));

  // ── Text-brightening paragraph: in progress 0.1~0.6 as the element center passes the screen, letters go 0.2 → 1 in turn ──
  const splitChars = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((c) => {
            if (/\s/.test(c)) { frag.append(c); return; }
            const s = document.createElement("span");
            s.className = "u-reveal-char";
            s.textContent = c;
            frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    return [...el.querySelectorAll(".u-reveal-char")];
  };

  // ── Photo blooming into a capsule (original svgClipReveal: 0 → 1, .7s power4.out) ──
  const clipReveal = (el) => {
    const st = { s: 0 };
    const draw = () => {
      const r = el.getBoundingClientRect();
      el.style.clipPath = capsule.poly(r.width / 2, r.height / 2, r.width * st.s, r.height * st.s);
    };
    draw();
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(st, { s: 1, duration: 0.7, ease: "power4.out", onUpdate: draw }),
    });
    addEventListener("resize", draw);
  };

  // ── As the footer approaches, the body follows late so the footer covers it from above (PC, easeInSine, half the footer height) ──
  const footerPush = () => {
    const main = document.querySelector("main");
    const foot = document.querySelector(".u-foot");
    if (!main || !foot || reduce) return;
    ScrollTrigger.create({
      trigger: foot, start: "top bottom", end: "top top",
      onUpdate: (self) => {
        if (!isPc()) { main.style.transform = ""; return; }
        const y = (1 - Math.cos((self.progress * Math.PI) / 2)) * foot.offsetHeight * 0.5;
        main.style.transform = y < 0.5 ? "" : `translate3d(0, ${y}px, 0)`;
      },
      onLeaveBack: () => (main.style.transform = ""),
    });
  };

  // ── News tabs (first page·news list): on exit 100px down in .4s, on entry from 60% below at .94x with 1.1s power4.out ──
  const newsTabs = () => {
    const tabs = [...document.querySelectorAll("[data-news-tabs] button")];
    const newsList = document.querySelector("[data-news-list]");
    if (!tabs.length || !newsList) return;
    // The dot of the chosen tab stretches into a pill (.5s power3.out) and the tab left behind rewinds (.8s power4.inOut)
    tabs.forEach((t) => { const i = t.querySelector("i"); i._pill = pill(i); if (t.hasAttribute("aria-current")) playPill(i._pill, true, { duration: 0.5, ease: "power3.out" }); });
    let busy = false;
    tabs.forEach((b) => b.addEventListener("click", async () => {
      if (busy || b.hasAttribute("aria-current")) return;
      busy = true;
      const was = tabs.find((t) => t.hasAttribute("aria-current"));
      playPill(was?.querySelector("i")._pill, false, { duration: 0.8, ease: "power4.inOut" });
      playPill(b.querySelector("i")._pill, true, { duration: 0.5, ease: "power3.out" });
      // Like the original, the chosen tab is marked with aria-current and made untouchable
      tabs.forEach((t) => (t === b ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current")));
      const cat = b.dataset.cat;
      if (!reduce) {
        gsap.to(newsList, { y: 100, duration: 0.4, ease: "power2.inOut" });
        await gsap.to(newsList, { opacity: 0, duration: 0.2, ease: "none" });
      }
      gsap.set(newsList, { y: 0, opacity: 1 });
      const shown = [...newsList.children].filter((li) => !(li.hidden = !(cat === "all" || li.dataset.cat === cat)));
      if (!reduce) {
        gsap.fromTo(shown, { yPercent: 60, scale: 0.94 }, { yPercent: 0, scale: 1, duration: 1.1, ease: "power4.out", stagger: 0.05 });
        gsap.fromTo(shown, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.inOut", stagger: 0.05 });
      }
      lenis?.resize();
      ScrollTrigger.refresh();
      busy = false;
    }));
  };

  // ── Page turn curtain ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || a.target) return;
    const href = a.getAttribute("href");
    if (!/\.html(#.*)?$/.test(href)) return;
    const [file, hash] = href.split("#");
    if (file === location.pathname.split("/").pop()) {
      if (!hash) return;
      e.preventDefault();
      closeMenu();
      const t = document.getElementById(hash);
      if (t) (lenis ? lenis.scrollTo(t, { offset: -80 }) : t.scrollIntoView());
      return;
    }
    e.preventDefault();
    body.classList.add("is-leaving");
    setTimeout(() => (location.href = href), reduce ? 0 : 350);
  });
  addEventListener("pageshow", (e) => e.persisted && body.classList.remove("is-leaving"));

  const scenes = [];
  window.uSite = {
    capsule, lenis, isPc, reduce, splitChars, clipReveal, gridFx,
    scene: (fn) => scenes.push(fn),
    // On the home page, the header drops down after the loader ends
    holdHeader: false,
    ready() {
      body.classList.add("is-header-ready");
    },
  };

  const start = () => {
    body.classList.add("is-ready");
    document.querySelectorAll("[data-reveal-text]").forEach((el) => {
      const chars = splitChars(el);
      if (reduce) { chars.forEach((c) => (c.style.opacity = 1)); return; }
      ScrollTrigger.create({
        trigger: el, start: "center bottom", end: "center top",
        onUpdate: (self) => {
          const r = gsap.utils.clamp(0, 1, (self.progress - 0.1) / 0.5);
          const lit = Math.round(r * chars.length);
          chars.forEach((c, i) => (c.style.opacity = i < lit ? 1 : ""));
        },
      });
    });
    document.querySelectorAll("[data-clip-reveal]").forEach((el) => (reduce ? null : clipReveal(el)));
    newsTabs();
    scenes.forEach((fn) => fn(window.uSite));
    footerPush();
    if (!window.uSite.holdHeader) setTimeout(() => window.uSite.ready(), 100);
    ScrollTrigger.refresh();
    if (location.hash) {
      const t = document.getElementById(location.hash.slice(1));
      if (t) setTimeout(() => (lenis ? lenis.scrollTo(t, { offset: -80, immediate: true }) : t.scrollIntoView()), 50);
    }
  };
  // Set up after the page script has put in all scenes and the fonts have loaded (the wordmark width depends on the font)
  const boot = () => (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(start));
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
  else boot();
})();
