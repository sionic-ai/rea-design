// Menu, footer, back-to-top button, line drawing and entrance motion are shared by all pages.
// Markup is stamped here so editing a menu item in one place updates the top nav, bottom pill, mobile drawer and footer together.
(() => {
  const page = document.body.dataset.page || "";

  const NAV = [
    { id: "service", text: "Services", href: "service.html" },
    { id: "about", text: "About Us", href: "about.html", sub: ["Menu 1", "Menu 2", "Menu 3", "Menu 4"] },
    { id: "story", text: "Our Story", href: "about.html" },
    { id: "ir", text: "IR", href: "index.html#ir", sub: ["Menu 1", "Menu 2", "Menu 3", "Menu 4", "Menu 5", "Menu 6"] },
    { id: "news", text: "News", href: "news.html" },
    { id: "recruit", text: "Recruit", href: "recruit.html" },
  ];
  const FOOT_SUB = {
    service: ["Business 1", "Business 2", "Business 3", "Business 4", "Business 5"],
    about: ["Menu 1", "Menu 2", "Menu 3", "Menu 4"],
    ir: ["Menu 1", "Menu 2", "Menu 3", "Menu 4", "Menu 5", "Menu 6", "Menu 7", "Menu 8"],
  };

  const mark = (cls = "") => `
    <svg class="dg-mark ${cls}" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="28" r="25.5" fill="none" stroke="currentColor" stroke-width="3"/>
      <path d="M15 33 L25 20 L31 29 L41 17" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="41" cy="17" r="3.5" fill="currentColor"/>
    </svg>`;
  const logo = (cls = "") => `<span class="dg-logo ${cls}">${mark()}<span class="dg-logo__word">BRAND<br>NAME</span></span>`;
  const mail = `<svg viewBox="0 0 20 14" width="20" height="14" aria-hidden="true"><rect x="1" y="1" width="18" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M1 1 9.1 7.1c.7.5 1.7.5 2.4 0L19 1" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
  const acc = '<button class="dg-footer__acc" type="button" aria-label="Expand submenu"></button>';
  const cur = (n) => (n.id === page ? ' aria-current="page"' : "");

  const navItems = (block) =>
    NAV.map((n) =>
      n.sub
        ? `<li class="${block}__item has-sub"><a class="${block}__link -menu" href="${n.href}"${cur(n)}>${n.text}<i class="dg-plus"></i></a>
             <div class="${block}__sub"><ul>${n.sub.map((s) => `<li><a href="${n.href}">${s}</a></li>`).join("")}</ul></div></li>`
        : `<li class="${block}__item"><a class="${block}__link" href="${n.href}"${cur(n)}>${n.text}</a></li>`
    ).join("");

  const corpHeader = `
    <header class="dg-header" data-slot="header">
      <a class="dg-header__logo" href="index.html" aria-label="First Page">${logo()}</a>
      <nav class="dg-header__nav"><ul>${navItems("dg-header")}</ul></nav>
      <div class="dg-header__links">
        <a class="dg-lang" href="#">EN</a>
        <a class="dg-mail" href="#" aria-label="Inquiry">${mail}</a>
      </div>
      <button class="dg-toggle" type="button" aria-label="Open Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </header>
    <div class="dg-pill" data-inview="false" data-slot="floating-nav">
      <a class="dg-pill__logo" href="index.html" aria-label="First Page">${logo()}</a>
      <nav class="dg-pill__nav"><ul>${navItems("dg-pill")}</ul></nav>
      <div class="dg-pill__links">
        <a class="dg-lang" href="#">EN</a>
        <a class="dg-mail" href="#" aria-label="Inquiry">${mail}</a>
      </div>
    </div>
    <button class="dg-pagetop" type="button" aria-label="Back to top" data-inview="false">
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <path class="dg-pagetop__ring" d="M40.73,38c-3.48,4.27-8.79,7-14.73,7-10.49,0-19-8.51-19-19S15.51,7,26,7s19,8.51,19,19" fill="none" stroke="var(--kf-accent)" stroke-width="2"/>
        <path d="M26 33V19M20 25l6-6 6 6" fill="none" stroke="var(--kf-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="42" cy="36" r="3" fill="var(--kf-accent)"/>
      </svg>
    </button>
    <div class="dg-drawer" aria-hidden="true">
      <div class="dg-drawer__logo">${logo("is-white")}</div>
      <ul class="dg-drawer__list">${NAV.map((n) => `<li><a href="${n.href}">${n.text}${n.sub ? '<i class="dg-chev-circle"></i>' : ""}</a></li>`).join("")}</ul>
      <a class="dg-drawer__contact" href="#">Contact Us<i>${mail}</i></a>
      <p class="dg-drawer__lang"><a href="#" aria-current="true">KO</a> / <a href="#">EN</a></p>
    </div>`;

  const corpFooter = `
    <footer class="dg-footer" data-slot="footer">
      <svg class="dg-footer__path" viewBox="0 0 1690 486" fill="none" aria-hidden="true">
        <defs><linearGradient id="dgFootPath" x1="10" y1="223" x2="1680" y2="223" gradientUnits="userSpaceOnUse"><stop style="stop-color: var(--kf-dim)"/><stop offset="1" stop-opacity=".4" style="stop-color: var(--kf-dim)"/></linearGradient></defs>
        <path data-draw data-start="top 80%" opacity=".1" d="M10 457.5 1212 31.4c20.3-7.2 36 18.3 20.5 33.2L1017.3 272c-15.4 14.9.2 40.3 20.4 33.3L1679.5 83.5" stroke="url(#dgFootPath)" stroke-width="60"/>
      </svg>
      <div class="dg-footer__contact" data-slot="footer-contact">
        <div>
          <p class="dg-label">[ Your label here ]</p>
          <h2 class="dg-footer__heading">Contact Us</h2>
          <p class="dg-footer__text">Two lines of contact info here. Consultations, questions, quotes, etc.<br>Feel free to ask us.</p>
        </div>
        <a class="dg-footer__cta" href="#"><span>To the contact form</span><i class="dg-arrow-circle is-lg"></i></a>
      </div>
      <div class="dg-footer__box">
        <a class="dg-footer__logo" href="index.html" aria-label="First Page">${logo("is-white is-lg")}</a>
        <nav class="dg-footer__nav">
          <div class="dg-footer__col"><a class="dg-footer__head" href="service.html">Services</a>${acc}<ul>${FOOT_SUB.service.map((s) => `<li><a href="service.html">${s}</a></li>`).join("")}</ul></div>
          <div class="dg-footer__col"><a class="dg-footer__head" href="about.html">About Us</a>${acc}<ul>${FOOT_SUB.about.map((s) => `<li><a href="about.html">${s}</a></li>`).join("")}</ul></div>
          <div class="dg-footer__col"><a class="dg-footer__head" href="about.html">Our Story</a></div>
          <div class="dg-footer__col"><a class="dg-footer__head" href="index.html#ir">IR</a>${acc}<ul>${FOOT_SUB.ir.map((s) => `<li><a href="index.html#ir">${s}</a></li>`).join("")}</ul></div>
          <div class="dg-footer__col is-stack"><a class="dg-footer__head" href="news.html">News</a><a class="dg-footer__head" href="recruit.html">Recruit</a><a class="dg-footer__head" href="#">Contact Us</a></div>
        </nav>
        <div class="dg-footer__bottom">
          <p class="dg-footer__copy">COMPANY NAME Corporation All Rights Reserved.</p>
          <ul class="dg-footer__terms"><li><a href="#">Disclaimer</a></li><li><a href="#">Privacy policy</a></li></ul>
        </div>
      </div>
    </footer>`;

  const recruitHeader = `
    <header class="rc-header" data-slot="header">
      <a class="rc-header__logo" href="recruit.html">${logo()}<span class="rc-header__site">Recruiting site</span></a>
      <button class="rc-toggle" type="button" aria-label="Open Menu" aria-expanded="false"></button>
    </header>
    <div class="dg-drawer is-recruit" aria-hidden="true">
      <div class="dg-drawer__logo">${logo("is-white")}</div>
      <ul class="dg-drawer__list">${["First", "Key message", "Business", "Culture", "Systems · Environment", "Member"].map((t) => `<li><a href="recruit.html">${t}</a></li>`).join("")}</ul>
      <div class="dg-drawer__links"><a class="dg-entry" href="recruit.html">Job info · Apply</a></div>
      <div class="dg-drawer__links"><a href="index.html">Corporate site ↗</a><a href="#">Privacy Policy ↗</a></div>
    </div>`;
  const recruitFooter = `
    <footer class="rc-footer" data-slot="footer">
      <a class="rc-footer__logo" href="recruit.html">${logo("is-white is-lg")}<span class="rc-header__site">Recruiting site</span></a>
      <p class="rc-footer__copy">© Company Name Corporation. All Rights Reserved.</p>
    </footer>`;

  const recruit = document.body.dataset.chrome === "recruit";
  document.body.insertAdjacentHTML("afterbegin", recruit ? recruitHeader : corpHeader);
  document.body.insertAdjacentHTML("beforeend", recruit ? recruitFooter : corpFooter);

  // Phone footer stays collapsed, and a round button opens the submenu
  document.querySelectorAll(".dg-footer__acc").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("is-open")));

  // Mobile drawer: open and close with the same button
  const toggle = document.querySelector(".dg-toggle, .rc-toggle");
  const drawer = document.querySelector(".dg-drawer");
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", open);
    drawer.setAttribute("aria-hidden", !open);
    document.documentElement.classList.toggle("is-drawer-open", open);
  });

  // Same rule as the original: when the top nav leaves the screen the pill appears, and when the footer enters the pill hides
  const header = document.querySelector(".dg-header, .rc-header");
  const footer = document.querySelector(".dg-footer, .rc-footer");
  const pill = document.querySelector(".dg-pill");
  const pagetop = document.querySelector(".dg-pagetop");
  let headerIn = true, footerIn = false;
  const sync = () => {
    pill?.setAttribute("data-inview", !headerIn && !footerIn);
    pagetop?.setAttribute("data-inview", !headerIn);
  };
  new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.target === header) headerIn = e.isIntersecting;
      if (e.target === footer) footerIn = e.isIntersecting;
    }
    sync();
  }).observe(header);
  if (footer) new IntersectionObserver(([e]) => { footerIn = e.isIntersecting; sync(); }).observe(footer);
  pagetop?.addEventListener("click", () => scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));

  const lottieStill = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // ---------- Illustration Lottie: runs on lottie-web (svg renderer) like the original — three access cards loop, the business diagram draws once and replays after 1s rest (data-lottie-replay) ----------
  // The art is newly built from our own shapes, while the panel size · fps · length (3.6s · 2.6s · 2.4s / 10fps 17 frames) · keyframe positions · curves are values measured from the original Lottie as is.
  // Colors are read from skin variables, so changing the skin changes the picture too
  const arts = document.querySelectorAll("[data-lottie]");
  if (arts.length && window.lottie) {
    const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    const probe = document.createElement("i");
    probe.hidden = true;
    document.body.append(probe);
    const rgb = (v) => {
      probe.style.color = `var(${v})`;
      cv.clearRect(0, 0, 1, 1);
      cv.fillStyle = getComputedStyle(probe).color;
      cv.fillRect(0, 0, 1, 1);
      const [r, g, b] = cv.getImageData(0, 0, 1, 1).data;
      return [r / 255, g / 255, b / 255, 1];
    };
    const OUT = { o: { x: 0.33, y: 1 }, i: { x: 0.68, y: 1 } }, LIN = { o: { x: 0.167, y: 0.167 }, i: { x: 0.833, y: 0.833 } };
    const still = (k) => ({ a: 0, k });
    const keys = (list, ease = OUT) => ({ a: 1, k: list.map(([t, s], n) => (n < list.length - 1 ? { t, s, ...ease } : { t, s })) });
    const tr = () => ({ ty: "tr", p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100) });
    const fill = (c) => ({ ty: "fl", c: still(rgb(c)), o: still(100), r: 1 });
    const rect = (w, h, r, c, x = 0, y = 0) => ({ ty: "gr", it: [{ ty: "rc", d: 1, s: still([w, h]), p: still([x, y]), r: still(r) }, fill(c), tr()] });
    const ell = (w, h, c, x = 0, y = 0) => ({ ty: "gr", it: [{ ty: "el", d: 1, s: still([w, h]), p: still([x, y]) }, fill(c), tr()] });
    const poly = (pts, c, closed = true) => ({ ty: "gr", it: [{ ty: "sh", ks: still({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: closed }) }, fill(c), tr()] });
    const line = (pts, c, w) => ({ ty: "gr", it: [{ ty: "sh", ks: still({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: false }) }, { ty: "st", c: still(rgb(c)), o: still(100), w: still(w), lc: 2, lj: 2 }, tr()] });
    let ind = 0;
    const layer = (op, shapes, { p = still([0, 0]), r = still(0), a = still([0, 0]), s = still([100, 100]) } = {}) => ({ ddd: 0, ind: ++ind, ty: 4, sr: 1, ao: 0, ip: 0, op: op + 1, st: 0, bm: 0, ks: { o: still(100), r, p, a, s }, shapes });
    const comp = (w, h, op, layers) => ({ v: "5.7.0", fr: 60, ip: 0, op, w, h, ddd: 0, assets: [], layers: layers.reverse() });
    const BUILD = {
      // Options: three stacked tags fan out at .8~1.6s to −60°·−30°·0° and the lightning button moves 40px aside. Folds at 2.8s and returns in place at 3.6s
      options: () => {
        const at = (to) => keys([[0, [109, 91]], [48, [109, 91]], [96, to], [168, to], [216, [109, 91]]]);
        const turn = (deg) => keys([[0, [0]], [48, [0]], [96, [deg]], [168, [deg]], [216, [0]]]);
        const tag = (c) => [ell(14, 14, "--kf-surface", 0, -66), rect(56, 84, 10, c, 0, -42)];
        return comp(258, 176, 216, [
          layer(216, [rect(220, 10, 5, "--kf-line", 129, 160)]),
          layer(216, tag("--site-orange"), { p: at([79.43, 85.43]), r: turn(-60) }),
          layer(216, tag("--site-biz-3"), { p: at([114.57, 79.43]), r: turn(-30) }),
          layer(216, tag("--site-biz-2"), { p: at([149, 91]), r: turn(0) }),
          layer(216, [poly([[2, -14], [-8, 3], [0, 3], [-3, 14], [8, -3], [0, -3]], "--site-biz-3"), ell(44, 44, "--kf-surface")], { p: keys([[0, [166.5, 130]], [48, [166.5, 130]], [96, [206.5, 130]], [168, [206.5, 130]], [216, [166.5, 130]]]) }),
        ]);
      },
      // Energy: the pinwheel turns once in 1.6s (evenly) and rests 1s. The neighboring battery cells drop 32px at .1~1.3s and rise again at 1.4~2.6s
      energy: () => {
        const down = (x, y) => keys([[0, [x, y]], [6, [x, y]], [78, [x, y + 32.1]], [84, [x, y + 32.1]], [156, [x, y]]]);
        return comp(183.44, 161, 156, [
          layer(156, [poly([[40, 161], [52, 48], [64, 48], [72, 161]], "--site-biz-3")]),
          layer(156, [line([[0, 0], [34, -18]], "--site-blue-81a", 6), line([[0, 0], [-10, 36]], "--site-blue-81a", 6), line([[0, 0], [-28, -20]], "--site-blue-81a", 6), ell(12, 12, "--site-biz-3")], { p: still([58, 46]), r: keys([[0, [0]], [48, [-179]], [96, [-359]], [97, [-360]], [156, [-360]]], LIN) }),
          layer(156, [rect(30, 10, 3, "--kf-surface", 0, -36), rect(52, 96, 8, "--site-biz-2", 0, 0)], { p: still([132, 104]) }),
          layer(156, [rect(30, 22, 4, "--site-orange-83")], { p: down(132, 68.45) }),
        ]);
      },
      // Growth: the arrow panel rises to the upper right in .8s, stays for .8s and returns in 2.4s. The three hill rings behind swell to full size at 2/3 in the same tempo.
      growth: () => {
        const grow = keys([[0, [66.7, 66.7]], [48, [100, 100]], [96, [100, 100]], [144, [66.7, 66.7]]], LIN);
        return comp(302, 182, 144, [
          layer(144, [ell(89, 39, "--site-yellow-92"), ell(149, 79, "--site-yellow-89"), ell(188, 99, "--site-yellow-85")], { p: keys([[0, [198.46, 124]], [48, [208, 107.5]], [96, [208, 107.5]], [144, [198.46, 124]]], LIN), s: grow }),
          layer(144, [line([[-80, 40], [-30, -10], [0, 20], [60, -50]], "--kf-accent", 16), poly([[48, -62], [78, -62], [78, -32]], "--kf-accent")], { p: keys([[0, [113, 103.5]], [48, [144, 78.5]], [96, [144, 78.5]], [144, [113, 103.5]]], LIN) }),
        ]);
      },
      // Business diagram: three boards (customer, company, power plant) stand in turn and arrows are drawn between them — like the original, once per 17 frames at 10fps (1.7s), on phones 19 frames at 350×350
      flow: () => {
        const sp = matchMedia("(max-width: 767px)").matches, W = sp ? 350 : 600, H = sp ? 350 : 400, op = sp ? 19 : 17, k = W / 600;
        const pop = (t0) => keys([[0, [0, 0]], [t0, [0, 0]], [t0 + 4, [100, 100]], [op, [100, 100]]]);
        const node = (x, c, t0) => layer(op, [poly([[-60 * k, 0], [60 * k, 0], [68 * k, 70 * k], [-68 * k, 70 * k]], c), rect(56 * k, 40 * k, 6 * k, "--site-biz-3", 0, -22 * k)], { p: still([x, H * 0.62]), s: pop(t0) });
        const draw = (pts, t0, c) => ({ ty: "gr", it: [{ ty: "sh", ks: still({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: false }) }, { ty: "st", c: still(rgb(c)), o: still(100), w: still(8 * k), lc: 2, lj: 2 }, { ty: "tm", s: still(0), e: keys([[0, [0]], [t0, [0]], [t0 + 5, [100]], [op, [100]]], LIN), o: still(0), m: 1 }, tr()] });
        return { v: "5.7.0", fr: 10, ip: 0, op, w: W, h: H, ddd: 0, assets: [], layers: [
          layer(op, [draw([[W * 0.3, H * 0.66], [W * 0.4, H * 0.66]], 6, "--site-orange"), draw([[W * 0.6, H * 0.66], [W * 0.7, H * 0.66]], 10, "--site-biz-2")]),
          node(W * 0.17, "--site-yellow-92a", 0), node(W * 0.5, "--kf-accent", 3), node(W * 0.83, "--site-yellow-92a", 7),
        ].reverse() };
      },
    };
    arts.forEach((el) => {
      const make = BUILD[el.dataset.lottie];
      if (!make) return;
      ind = 0;
      const replay = el.dataset.lottieReplay;
      const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: replay == null, autoplay: !lottieStill, animationData: make() });
      if (lottieStill) anim.goToAndStop(replay == null ? 0 : anim.totalFrames - 1, true);
      else if (replay != null) anim.addEventListener("complete", () => setTimeout(() => anim.goToAndPlay(0, true), +replay));
    });
  }

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  const setDash = (p, offset) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: offset ?? len });
    return len;
  };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const { reduce } = ctx.conditions;

    const ring = document.querySelector(".dg-pagetop__ring");
    if (ring) {
      setDash(ring, 98);
      if (!reduce) gsap.to(ring, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true } });
      else gsap.set(ring, { strokeDashoffset: 0 });
    }

    // Original strip: draws the line, hidden by its length, once at a screen point (not scrub). Defaults are the values of the About strip.
    // The subpage header band (data-load) loads as soon as it’s fetched regardless of scroll — hidden first, then turned on with data-show opacity when drawing starts
    document.querySelectorAll("[data-draw]").forEach((p) => {
      const show = p.dataset.show;
      if (reduce) { if (show) gsap.set(p, { opacity: Number(show) }); return setDash(p, 0); }
      setDash(p);
      if (show) gsap.set(p, { opacity: 0 });
      gsap.to(p, {
        strokeDashoffset: 0,
        duration: Number(p.dataset.dur || 1.2),
        ease: p.dataset.ease || "slow(0.7,0.7,false)",
        delay: Number(p.dataset.delay || 0),
        onStart: show ? () => gsap.set(p, { opacity: Number(show) }) : undefined,
        scrollTrigger: "load" in p.dataset ? undefined : { trigger: p.closest("[data-draw-trigger]") || p, start: p.dataset.start || "top 50%", once: true },
      });
    });

    if (reduce) return;
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      gsap.from(el, {
        y: 40,
        autoAlpha: 0,
        duration: 1.2,
        ease: "expo.out",
        delay: Number(el.dataset.reveal || 0),
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });
    });
  });
})();
