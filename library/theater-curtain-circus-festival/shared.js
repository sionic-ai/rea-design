// One place draws the header, menu, footer, loader and transition curtain shared by all four pages. The original uses barba 2.10.3 with [data-barba="container"] swap only this and
// Header and menu are left as is — page scripts register via PP.page(name, attach), and the box attaches them when entering and detaches when leaving.
// Curves keep their original names (main·energy·smooth·punch·bounce·softBounce·pull), and smooth scrolling is Lenis 1.3.21 (lerp .1 · wheel .7).
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  const EASES = {
    main: "M0,0 C0.625,0.05 0,1 1,1",
    energy: "M0,0 C0.16,1 0.3,1 1,1",
    smooth: "M0,0 C0.5,0 0.5,1 1,1",
    punch: "M0,0 C0.34,1.56 0.64,1 1,1",
    relaxed: "M0,0 C0.42,0 0.58,1 1,1",
    bounce: "M0,0 C0.35,1.35 0.5,1 1,1",
    softBounce: "M0,0 C0.25,1.25 0.5,1 1,1",
    pull: "M0,0 C0.06,0 0.1,-0.035 0.16,-0.035 0.26,-0.035 0.3,1.03 0.55,1.03 0.7,1.03 0.8,1 1,1",
  };
  for (const [k, v] of Object.entries(EASES)) CustomEase.create(k, v);
  const rmq = matchMedia("(prefers-reduced-motion: reduce)");
  const PP = (window.PP = { reduced: rmq.matches, lenis: null, pages: {}, offs: [] });
  PP.page = (ns, init) => (PP.pages[ns] = init);
  const html = document.documentElement;
  html.classList.add("pp-js");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const rem = (n) => n * (parseFloat(getComputedStyle(html).fontSize) || 16);

  // ── Graphics: icons · gold coin · logo letters
  const ICON = {
    burger: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="3.5" width="12" height="1.8" rx=".9"/><rect x="2" y="7.1" width="12" height="1.8" rx=".9"/><rect x="2" y="10.7" width="12" height="1.8" rx=".9"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3.3 2 8 6.7 12.7 2 14 3.3 9.3 8 14 12.7 12.7 14 8 9.3 3.3 14 2 12.7 6.7 8 2 3.3z"/></svg>',
    ticket: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M1.5 4h13v2.5a1.5 1.5 0 0 0 0 3V12h-13V9.5a1.5 1.5 0 0 0 0-3z"/><path d="M6 4v8" stroke-dasharray="1.5 1.5"/></svg>',
    insta: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="3.5"/><circle cx="8" cy="8" r="2.8"/><circle cx="11.7" cy="4.3" r=".6" fill="currentColor"/></svg>',
    face: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M9 15V9h2l.4-2.4H9V5.2c0-.7.3-1.2 1.3-1.2h1.2V1.9A14 14 0 0 0 9.8 1.8C8 1.8 6.7 2.9 6.7 4.9v1.7H4.8V9h1.9v6z"/></svg>',
  };
  PP.coin = (n = "00") =>
    `<svg class="pp-coin" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="pp-coin-g" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="var(--site-gold-hi)"/><stop offset=".55" stop-color="var(--kf-accent)"/><stop offset="1" stop-color="var(--site-gold-lo)"/></radialGradient></defs>` +
    `<circle cx="50" cy="50" r="48" fill="url(#pp-coin-g)"/><circle cx="50" cy="50" r="40" fill="none" stroke="var(--site-gold-lo)" stroke-width="2" stroke-dasharray="2 3"/>` +
    `<text x="50" y="62" text-anchor="middle" font-size="34" font-weight="800" fill="var(--site-gold-lo)" style="font-family:var(--kf-font-display)">${n}</text></svg>`;
  const WORD = "TITLE00";
  PP.logo = (cls = "") =>
    `<span class="pp-logo ${cls}" aria-label="Logo">${[...WORD].map((c) => `<span class="pp-logo__letter" data-fx-part="item" data-load-letter><span data-fx-part="target">${c}</span></span>`).join("")}</span>`;
  const btn = (text, href = "#", cls = "") =>
    `<a class="pp-btn ${cls}" href="${href}" data-fx="magnet-pull" data-fx-magnet-pull="mode: edge; pull: .5; label: .25; dot: .125; dur: .6; ease: back.out(2.5); back: 1.2; spring: elastic.out(1, 0.5)"><span class="pp-btn__dot" data-fx-part="dot"></span><span class="pp-btn__text" data-fx-part="label">${text}</span><span class="pp-btn__dot" data-fx-part="dot"></span></a>`;
  PP.btn = btn;

  // ── Header · menu: ten menu rows (each link has one photo and a one-line intro)
  const MENU = [
    ["index.html", "Home", "Start here — see this year’s event news in one place"],
    ["lineup.html", "Line-up", "All performers in one place — browse by date or stage"],
    ["index.html#tickets", "Tickets", "One-day, three-day, special seat — choose the ticket you want"],
    ["faq.html", "FAQ", "Tickets · transport · camping — find what you need fast"],
    ["index.html#city", "Menu 5", "Take a look around a camping village that changes between day and night"],
    ["index.html#fifty", "Menu 6", "We look back on fifty years of stages and moments"],
    ["index.html#tickets", "Menu 7", "Private lounge and prime seats — see the special seating"],
    ["recruit.html", "Join us", "Send us ideas to build the event together"],
  ];
  const PHOTO = [
    "Event venue entrance at night · neon lighting · full-width horizontal",
    "Performer on stage · red lighting · portrait half-body",
    "Audience member holding a ticket · daytime sunlight · close",
    "Information booth and visitors · evening sunset · wide",
    "Row of campsite tents · sunset backlight · wide",
    "Old stage archive photo · faded color · landscape",
    "Box seat balcony · warm lighting · landscape",
    "Production team meeting · workshop fluorescent light · close-up",
  ];
  const head = document.querySelector("[data-slot=nav]");
  if (head) {
    head.outerHTML = `
<header class="pp-nav" data-slot="nav">
  <div class="pp-nav__bar">
    <button class="pp-nav__menu" type="button" aria-expanded="false" aria-controls="pp-menu" data-menu-toggle data-fx="magnet-pull" data-fx-magnet-pull="mode: edge; pull: .5; label: .25; dot: .125; dur: .6; ease: back.out(2.5); back: 1.2; spring: elastic.out(1, 0.5)">
      <span class="pp-nav__icon">${ICON.burger.replace("<svg", '<svg data-menu-icon="closed"')}${ICON.close.replace("<svg", '<svg data-menu-icon="open"')}</span>
      <span class="pp-nav__texts" data-fx-part="label"><span data-menu-text="closed">Menu</span><span data-menu-text="open">Close</span></span>
    </button>
    <a class="pp-nav__logo" href="index.html" aria-label="To the first page" data-fx="momentum-hover" data-fx-momentum-hover="xy: 6.6; max: 237.6; rotation: 96; spinmax: 300; duration: .5; least: .6">${PP.logo()}</a>
    <a class="pp-nav__tickets" href="index.html#tickets" data-fx="magnet-pull" data-fx-magnet-pull="mode: edge; pull: .5; label: .25; dur: .6; ease: back.out(2.5); back: 1.2; spring: elastic.out(1, 0.5)">
      <span data-fx-part="label">Ticket</span><span class="pp-nav__icon is-dark">${ICON.ticket}</span>
    </a>
  </div>
  <nav class="pp-menu" id="pp-menu" data-slot="menu-panel" aria-label="Main menu">
    <div class="pp-menu__links" data-menu-panel data-lenis-prevent data-label="Your menu English section name here, eight">
      ${MENU.map(([h, t], i) => `<a class="pp-menu__link pp-h" href="${h}" data-menu-link="${i}">${t}</a>`).join("")}
    </div>
    <div class="pp-menu__media" data-menu-panel>
      ${PHOTO.map((p, i) => `<div class="pp-menu__image wf-img" data-menu-image="${i}" data-label="${p}"></div>`).join("")}
      <div class="pp-menu__vignette"></div>
      ${MENU.map(([, , d], i) => `<p class="pp-menu__intro" data-menu-intro="${i}">${d}</p>`).join("")}
    </div>
  </nav>
</header>`;
  }

  // The first-visit loader (eye + light bulb) is drawn on whichever page you enter — only when the head script has added pp-loading
  if (html.classList.contains("pp-loading") && !document.querySelector("[data-loader]")) {
    document.body.insertAdjacentHTML("afterbegin", `<div class="pp-load" data-loader aria-hidden="true">
    <div class="pp-load__bg" data-loader-bg></div>
    <div class="pp-load__eye" data-loader-eye>
      <svg viewBox="-120 -80 240 160">
        <defs>
          <radialGradient id="pp-iris" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="var(--site-pink)"/><stop offset=".6" stop-color="var(--site-purple)"/><stop offset="1" stop-color="var(--site-night)"/></radialGradient>
          <clipPath id="pp-eye-clip"><path d="M-100 0Q0-90 100 0Q0 90-100 0Z"/></clipPath>
        </defs>
        <path d="M-108 0Q0-98 108 0Q0 98-108 0Z" fill="var(--site-gold-lo)"/>
        <path d="M-100 0Q0-90 100 0Q0 90-100 0Z" fill="var(--kf-contrast-bg)"/>
        <g clip-path="url(#pp-eye-clip)">
          <circle r="40" fill="url(#pp-iris)"/>
          <circle r="16" fill="var(--site-night)" data-loader-pupil/>
          <circle cx="-12" cy="-14" r="6" fill="var(--kf-ink)" opacity=".8"/>
          <rect x="-110" y="-90" width="220" height="90" fill="var(--site-violet)" data-loader-lid style="transform-origin:0 -90px"/>
          <rect x="-110" y="0" width="220" height="90" fill="var(--site-violet)" data-loader-lid style="transform-origin:0 90px"/>
        </g>
        <g fill="var(--site-gold-hi)">
          <circle cx="-112" cy="0" r="5" data-loader-light/><circle cx="-96" cy="-30" r="5" data-loader-light/><circle cx="-72" cy="-50" r="5" data-loader-light/>
          <circle cx="-44" cy="-63" r="5" data-loader-light/><circle cx="-14" cy="-70" r="5" data-loader-light/><circle cx="14" cy="-70" r="5" data-loader-light/>
          <circle cx="44" cy="-63" r="5" data-loader-light/><circle cx="72" cy="-50" r="5" data-loader-light/><circle cx="96" cy="-30" r="5" data-loader-light/>
          <circle cx="112" cy="0" r="5" data-loader-light/><circle cx="96" cy="30" r="5" data-loader-light/><circle cx="72" cy="50" r="5" data-loader-light/>
          <circle cx="44" cy="63" r="5" data-loader-light/><circle cx="14" cy="70" r="5" data-loader-light/><circle cx="-14" cy="70" r="5" data-loader-light/>
          <circle cx="-44" cy="63" r="5" data-loader-light/><circle cx="-72" cy="50" r="5" data-loader-light/><circle cx="-96" cy="30" r="5" data-loader-light/>
        </g>
      </svg>
    </div>
  </div>`);
  }

  // Just one on a document with flipping locked
  document.body.insertAdjacentHTML("beforeend", `<div class="pp-curtain" data-curtain aria-hidden="true"><div class="pp-curtain__coin" data-curtain-coin>${PP.coin("50")}</div></div>`);

  // The footer sits inside the page box so it changes along with page turns — drawn every time the box attaches
  const FOOT = [["lineup.html", "Line-up"], ["index.html#updates", "News"], ["index.html#city", "Menu 5"], ["index.html#tickets", "Menu 7"], ["index.html#tickets", "Tickets"], ["faq.html", "FAQ"], ["recruit.html", "Join us"], ["index.html#fifty", "Menu 6"]];
  PP.footer = (root) => {
    const foot = root.querySelector("footer[data-slot=footer]:empty");
    if (!foot) return;
    foot.outerHTML = `
<footer class="pp-foot" data-slot="footer">
  <div class="pp-wrap pp-foot__sponsors" data-reveal="fade">
    ${Array.from({ length: 8 }, (_, i) => `<a class="pp-foot__sponsor" href="#"><span class="wf-logo">Sponsor ${i + 1}</span></a>`).join("")}
  </div>
  <div class="pp-wrap pp-foot__grid">
    <div class="pp-foot__news">
      <p>Be the first to hear the news — get our newsletter.</p>
      <form class="pp-foot__form" onsubmit="return false"><input type="email" placeholder="Email address" aria-label="Email address">${btn("Application", "#", "is-dark")}</form>
      <p class="pp-foot__small">If you apply <a href="#" data-fx="magnet-pull" data-fx-magnet-pull="mode: edge; pull: .5; label: .25; dot: .125; dur: .6; ease: back.out(2.5); back: 1.2; spring: elastic.out(1, 0.5)"><u data-fx-part="label">Privacy policy</u></a>You are deemed to have agreed to this.</p>
    </div>
    <nav class="pp-foot__links" aria-label="Bottom Menu" data-label="Your eight English footer menu items here">
      ${FOOT.map(([h, t]) => `<a class="pp-foot__link" href="${h}"><span class="pp-foot__dot" aria-hidden="true"></span><span>${t}</span></a>`).join("")}
    </nav>
  </div>
  <div class="pp-foot__mark" data-slot="footer-wordmark" data-fx="momentum-hover" data-fx-momentum-hover="xy: 20; max: 720; rotation: 16; spinmax: 50; duration: .6; least: .6">${PP.logo("is-big")}</div>
  <div class="pp-foot__bottom">
    <span>© 0000 Event name · Made by</span>
    <span class="pp-foot__social"><a href="#" aria-label="Photo sharing" data-fx="magnet-pull" data-fx-magnet-pull="mode: edge; pull: .5; label: .25; dot: .125; dur: .6; ease: back.out(2.5); back: 1.2; spring: elastic.out(1, 0.5)"><span data-fx-part="label">${ICON.insta}</span></a><a href="#" aria-label="Social" data-fx="magnet-pull" data-fx-magnet-pull="mode: edge; pull: .5; label: .25; dot: .125; dur: .6; ease: back.out(2.5); back: 1.2; spring: elastic.out(1, 0.5)"><span data-fx-part="label">${ICON.face}</span></a></span>
    <span class="pp-foot__legal"><a href="#">Terms of service</a><a href="#">Personal information</a></span>
  </div>
</footer>`;
  };

  // ── Smooth scroll: original Lenis 1.3.21 values as is
  if (window.Lenis && !PP.reduced) {
    const lenis = (PP.lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.7, syncTouch: true }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTop = (y = 0) => { PP.lenis ? PP.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y); };

  // ── Logo letters: scale 0 → 1 back.out(2.5) .45s, .04s stagger, after .1s (opacity .15s smooth)
  PP.letters = () => {
    const ls = document.querySelectorAll(".pp-nav [data-load-letter]");
    if (PP.reduced || !ls.length) return;
    gsap.timeline({ onComplete: () => gsap.set(ls, { clearProps: "opacity,transform" }) })
      .fromTo(ls, { scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(2.5)", stagger: 0.04 }, 0.1)
      .fromTo(ls, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "smooth", stagger: 0.04 }, 0.1);
  };

  // ── Menu: both side panels slide in over .6s with main, the button text exits upward in .2s then the new text comes in over .4s with energy, and the icon rotates 90° while scaling to .5x
  const menu = document.querySelector(".pp-menu");
  const toggle = document.querySelector("[data-menu-toggle]");
  let menuOpen = false, menuTl = null;
  const panels = menu ? [...menu.querySelectorAll("[data-menu-panel]")] : [];
  const links = menu ? [...menu.querySelectorAll("[data-menu-link]")] : [];
  const pick = (i) => {
    links.forEach((l) => l.classList.toggle("is-active", l.dataset.menuLink === i));
    menu.querySelectorAll("[data-menu-image],[data-menu-intro]").forEach((n) => n.classList.toggle("is-active", (n.dataset.menuImage ?? n.dataset.menuIntro) === i));
  };
  // As in the original, with WAAPI: the text and icons currently visible disappear in .2s smooth (text 100% upward, icon rotating ±90° and scaling to .5),
  // At .2s it flips is-open to swap display. The incoming side is held in its start shape from the press (fill: both) and then settles at .4s (text energy · icon softBounce)
  const BEZ = { smooth: "cubic-bezier(0.5, 0, 0.5, 1)", energy: "cubic-bezier(0.16, 1, 0.3, 1)", soft: "cubic-bezier(0.25, 1.22, 0.5, 1)" };
  let swapAnims = [], swapCall = null, swapEnd = null;
  const shownParts = () => [...toggle.querySelectorAll("[data-menu-icon], [data-menu-text]")].filter((n) => getComputedStyle(n).display !== "none");
  const swapToggle = (open) => {
    const was = toggle.classList.contains("is-open");
    swapAnims.forEach((a) => a.cancel()); swapAnims = []; swapCall?.kill(); swapEnd?.kill();
    const outs = shownParts();
    toggle.classList.toggle("is-open", open);
    const ins = shownParts();
    toggle.classList.toggle("is-open", was);
    const O = open ? 90 : -90, N = PP.reduced ? 0 : 200, B = PP.reduced ? 0 : 400;
    const isText = (n) => n.matches("[data-menu-text]");
    // Measured from the original: the heavy first frame of opening the menu panel delays WAAPI start by ~.17s — the outgoing side only starts fading right before the switch,
    // The incoming side stays in the start shape for about .12s after the change, then settles (the original is .35–.48s after the press per page). The outgoing icon doesn’t spin, it just fades
    const HOLD = PP.reduced ? 0 : 120;
    outs.forEach((n) => swapAnims.push(n.animate([{ opacity: getComputedStyle(n).opacity, transform: "none" }, { opacity: 0, transform: PP.reduced || !isText(n) ? "none" : "translateY(-100%)" }], { duration: N, delay: HOLD, easing: BEZ.smooth, fill: "forwards" })));
    ins.forEach((n) => swapAnims.push(n.animate([{ opacity: 0, transform: PP.reduced ? "none" : isText(n) ? "translateY(100%)" : `rotate(${-O}deg) scale(0.5)` }, { opacity: 1, transform: "none" }], { duration: B, delay: N + HOLD, easing: PP.reduced ? BEZ.smooth : isText(n) ? BEZ.energy : BEZ.soft, fill: outs.includes(n) ? "forwards" : "both" })));
    swapCall = gsap.delayedCall(N / 1000, () => toggle.classList.toggle("is-open", open));
    swapEnd = gsap.delayedCall((N + B + HOLD) / 1000 + 0.05, () => { swapAnims.forEach((a) => a.cancel()); swapAnims = []; });
    gsap.fromTo(toggle, { boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--site-ring) ${open ? 0 : 100}%, transparent)` },
      { boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--site-ring) ${open ? 100 : 0}%, transparent)`, duration: 0.6, ease: "smooth" });
  };
  PP.menu = (open) => {
    if (!menu || open === menuOpen) return Promise.resolve();
    menuOpen = open;
    toggle.setAttribute("aria-expanded", String(open));
    swapToggle(open);
    menuTl?.kill();
    if (open) {
      const cur = links.find((l) => l.classList.contains("is-current")) || links[0];
      pick(cur.dataset.menuLink);
      links.forEach((l) => l.classList.remove("is-active"));
      menu.classList.add("is-open");
      PP.lenis?.stop();
      menuTl = PP.reduced
        ? gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "smooth" })
        : gsap.timeline().fromTo(panels[0], { xPercent: -100 }, { xPercent: 0, duration: 0.6, ease: "main" }, 0).fromTo(panels[1], { xPercent: 100 }, { xPercent: 0, duration: 0.6, ease: "main" }, 0);
      return menuTl.then();
    }
    PP.lenis?.start();
    const done = () => { menu.classList.remove("is-open"); gsap.set([menu, ...panels], { clearProps: "opacity,transform" }); };
    menuTl = PP.reduced
      ? gsap.to(menu, { opacity: 0, duration: 0.3, ease: "smooth", onComplete: done })
      : gsap.timeline({ onComplete: done }).to(panels[0], { xPercent: -100, duration: 0.6, ease: "main" }, 0).to(panels[1], { xPercent: 100, duration: 0.6, ease: "main" }, 0);
    return menuTl.then();
  };
  if (menu) {
    toggle.addEventListener("click", () => PP.menu(!menuOpen));
    links.forEach((l) => l.addEventListener("pointerenter", (e) => e.pointerType !== "touch" && pick(l.dataset.menuLink)));
    panels[0]?.addEventListener("pointerleave", () => links.forEach((l) => l.classList.remove("is-active")));
    addEventListener("keydown", (e) => e.key === "Escape" && menuOpen && PP.menu(false));
  }
  const markCurrent = () => {
    const file = location.pathname.split("/").pop() || "index.html";
    links.forEach((l) => l.classList.toggle("is-current", l.getAttribute("href") === file));
  };

  // ── Line rise: when it reaches 85% of the screen, each line goes from 100% below → 0 (1s main · .08s stagger · opacity .2s), and rewinds when it drops back below the screen
  //    pop (button) scales 0 → 1 with softBounce .6s, card rises from 2.5rem below in 1s main, fade is .6s smooth
  PP.reveal = (root) => {
    const offs = [];
    const groups = new Map();
    root.querySelectorAll("[data-reveal]").forEach((el) => {
      const g = el.closest("[data-reveal-group]") || el;
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(el);
    });
    for (const [g, els] of groups) {
      const tl = gsap.timeline({ paused: true });
      els.forEach((el, i) => {
        const mode = el.dataset.reveal || "lines";
        const at = i * 0.15;
        el.classList.add("is-in");
        if (PP.reduced) return;
        if (mode === "lines") {
          const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "pp-line" });
          offs.push(() => split.revert());
          el.classList.add("is-split");
          tl.fromTo(split.lines, { yPercent: 100 }, { yPercent: 0, duration: 1, ease: "main", stagger: 0.08 }, at)
            .fromTo(split.lines, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "smooth", stagger: 0.08 }, at);
        } else if (mode === "pop") {
          tl.fromTo(el, { scale: 0 }, { scale: 1, duration: 0.6, ease: "softBounce" }, at).fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "smooth" }, at);
        } else if (mode === "cards") {
          tl.fromTo(el.children, { y: rem(2.5), opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "main", stagger: 0.08 }, at);
        } else if (mode === "card") {
          tl.fromTo(el, { y: rem(2.5), opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "main" }, at);
        } else {
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "smooth" }, at);
        }
      });
      if (PP.reduced) continue;
      const st = ScrollTrigger.create({
        trigger: g, start: "top 85%",
        onEnter: () => tl.play(),
        onLeaveBack: (s) => { if (s.scroll() < s.start - innerHeight * 0.15) tl.pause(0); },
      });
      ScrollTrigger.create({ trigger: g, start: "top bottom", onLeaveBack: () => tl.pause(0) });
      offs.push(() => { st.kill(); tl.kill(); });
    }
    return () => offs.forEach((f) => f());
  };

  // ── Pleated hem of the transition curtain: each fold bulges as a semicircle (depth = width .3) — with progress the bulge ripples by .4 for 1.75 cycles and each fold lags by .12
  const FOLD = { uneven: 0.02, depth: 0.3, bounce: 0.4, swings: 1.75, lag: 0.12, sway: 0.035, step: 3 };
  const TAU = Math.PI * 2;
  PP.foldPath = (w, h, folds) => {
    const r = (FOLD.depth * w) / folds / h, o = r * (1 + FOLD.bounce);
    const s = Math.max(8, Math.ceil(w / folds / FOLD.step));
    const cos = Array.from({ length: s + 1 }, (_, u) => -Math.cos((Math.PI * u) / s));
    const warp = (c) => c + FOLD.uneven * Math.sin(TAU * 1.5 * c);
    const unwarp = (k) => { let p = k; for (let n = 0; n < 3; n++) p -= (warp(p) - k) / (1 + FOLD.uneven * TAU * 1.5 * Math.cos(TAU * 1.5 * p)); return p; };
    // rise < 1: the bottom stays and it lifts up (sagging folds) · otherwise a rounded head rises from below with cover. below — whether the curtain is below the corner
    return (rise, cover, below) => {
      const up = rise < 1, m = up ? rise : cover;
      const pt = (x, k, p) => {
        const n = r * (1 + FOLD.bounce * Math.sin(TAU * (FOLD.swings * m - FOLD.lag * k))) * Math.sqrt(Math.max(0, 1 - p * p));
        const b = (1 + o) * m + FOLD.sway * Math.sin(Math.PI * m) * Math.sin(TAU * (0.6 * x - 0.5 * m)) + (up ? -n : n - o);
        return `${(x * (w + 2) - 1).toFixed(1)}px ${(h * (1 - b)).toFixed(1)}px,`;
      };
      let d = pt(0, 0, -1);
      for (let k = 0; k < folds; k++) for (let j = 1; j <= s; j++) {
        const x = k + (1 + cos[j]) / 2;
        if (x >= folds) break;
        d += pt(unwarp(x / folds), k, cos[j]);
      }
      d += pt(1, folds - 1, 1);
      const y = up !== below ? h + 1 : -1;
      return `polygon(${d}${w + 1}px ${y}px,-1px ${y}px)`;
    };
  };

  const curtain = document.querySelector("[data-curtain]");
  const coin = curtain.querySelector("[data-curtain-coin]");
  gsap.set(coin, { xPercent: -50, yPercent: -50, scale: 0 });
  const folds = () => (matchMedia("(min-width: 992px)").matches ? 8 : 4);
  // On page turn, if the screen center is a photo or video use a light pink curtain, otherwise purple (as in the original)
  const lightUnder = () => !!document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest(".wf-img, video, canvas");
  PP.cover = () => new Promise((res) => {
    curtain.classList.toggle("is-light", lightUnder());
    curtain.style.display = "block";
    gsap.set(coin, { scale: 0 });
    if (PP.reduced) { curtain.style.clipPath = "none"; return res(); }
    const f = PP.foldPath(innerWidth, innerHeight, folds());
    const p = { v: 0 };
    let popped = null;
    const pop = () => (popped ||= gsap.to(coin, { scale: 1, duration: 0.45, ease: "back.out(2.6)" }).then(() => new Promise((r) => gsap.delayedCall(0.3, r))));
    gsap.to(p, {
      v: 1, duration: 0.6, ease: "main",
      onUpdate: () => {
        curtain.style.clipPath = p.v < 1 ? f(1, p.v, true) : "none";
        if (p.v > 0.5) pop();
      },
      onComplete: () => pop().then(res),
    });
  });
  PP.uncover = () => new Promise((res) => {
    const end = () => { curtain.style.display = "none"; curtain.style.clipPath = ""; res(); };
    if (PP.reduced) return end();
    const f = PP.foldPath(innerWidth, innerHeight, folds());
    const p = { v: 0 };
    gsap.to(p, { v: 1, duration: 0.8, ease: "main", onUpdate: () => (curtain.style.clipPath = p.v < 1 ? f(p.v, 0, true) : "polygon(0 0, 0 0, 0 0)"), onComplete: end });
  });

  // ── Loader (first visit only): while the eye art plays 78 frames at 45fps, the bulbs around it light up one after another with a punch,
  //    From the pupil position a hole opens to the screen edge in .8s main — the hole radius grows exponentially and the outer 30% is a bleeding band
  PP.loader = (root, onOpen) => {
    const load = document.querySelector("[data-loader]");
    if (!load || !html.classList.contains("pp-loading")) return onOpen(0);
    try { sessionStorage.setItem("pp-load-seen", "1"); } catch {}
    const eye = load.querySelector("[data-loader-eye]"), bg = load.querySelector("[data-loader-bg]");
    const lights = [...load.querySelectorAll("[data-loader-light]")];
    const pupil = load.querySelector("[data-loader-pupil]");
    const lids = load.querySelectorAll("[data-loader-lid]");
    const hero = root.querySelector("[data-loader-hero]");
    PP.lenis?.stop();
    const finish = () => {
      html.classList.remove("pp-loading");
      PP.lenis?.start();
      gsap.set([load, eye, bg, hero].filter(Boolean), { clearProps: "transform,opacity" });
    };
    const frames = 78, seq = frames / 45;
    const tl = gsap.timeline();
    // The eyelid opens in 78 steps (image sequence playback slot)
    tl.fromTo(lids, { scaleY: 1 }, { scaleY: 0, duration: seq, ease: `steps(${frames})` }, 0);
    const each = seq / (lights.length || 1);
    lights.forEach((l, i) => tl.fromTo(l, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: each, ease: "punch", transformOrigin: "50% 50%" }, i * each));
    tl.call(() => {
      const box = load.getBoundingClientRect(), pr = pupil.getBoundingClientRect();
      const cx = pr.left + pr.width / 2, cy = pr.top + pr.height / 2, u = (pr.width / 2) * 0.94;
      const far = Math.max(...[box.left, box.right].flatMap((x) => [box.top, box.bottom].map((y) => Math.hypot(x - cx, y - cy))));
      const near = Math.min(cx - box.left, box.right - cx, cy - box.top, box.bottom - cy);
      const F = (far / (u * 0.7)) ** (1 / 0.9), Y = Math.max(2, (near * 0.95) / u);
      load.style.setProperty("--x", `${cx}px`); load.style.setProperty("--y", `${cy}px`);
      [eye, bg, hero].filter(Boolean).forEach((n) => { const b = n.getBoundingClientRect(); gsap.set(n, { transformOrigin: `${cx - b.left}px ${cy - b.top}px` }); });
      const p = { at: 0 };
      let opened = false;
      const draw = () => {
        const g = F ** p.at, hole = u * g * Math.sqrt(Math.min(1, p.at / 0.12));
        load.style.setProperty("--hole", `${hole}px`);
        load.style.setProperty("--clear", `${hole * 0.7}px`);
        gsap.set(eye, { scale: g });
        gsap.set(bg, { scale: 1 + 0.25 * p.at });
        if (hero) gsap.set(hero, { scale: 0.5 ** Math.max(0, 1 - Math.log(g) / Math.log(Y)) });
        if (hole * 0.7 >= far) { open.kill(); finish(); }
      };
      const open = gsap.timeline({ onComplete: finish })
        .to(lights, { opacity: 0, duration: 0.3, ease: "smooth" }, 0)
        .to(p, { at: 1, duration: 0.8, ease: "main", onUpdate: draw }, 0)
        .call(() => { opened = true; onOpen(0); }, null, 0.38 * 0.8);
      draw();
      gsap.delayedCall(1.2, () => opened || onOpen(0));
    }, null, seq + 0.05);
  };

  // ── Hero entrance: [data-enter] at .15s stagger (text lines 1s main per line, buttons pop) ──
  PP.enter = (root, delay = 0.15) => {
    const els = [...root.querySelectorAll("[data-enter]")];
    if (PP.reduced || !els.length) return;
    const tl = gsap.timeline({ delay });
    els.forEach((el, i) => {
      if (el.dataset.enter === "lines") {
        const sp = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "pp-line" });
        tl.fromTo(sp.lines, { yPercent: 100 }, { yPercent: 0, duration: 1, ease: "main", stagger: 0.08, onComplete: () => sp.revert() }, i * 0.15);
      } else if (el.dataset.enter === "pop") {
        tl.fromTo(el, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "softBounce" }, i * 0.15);
      } else {
        tl.fromTo(el, { y: rem(1), opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "main" }, i * 0.15);
      }
    });
  };

  // ── When char-squash-hover splits a gradient title, each letter gets which height of the whole title gradient it should paint (shared.css)
  const gradChars = (root) => {
    const mo = new MutationObserver((ms) => {
      for (const h of new Set(ms.map((m) => m.target.closest?.(".pp-grad-pink, .pp-grad-dark")))) {
        const chars = h?.querySelectorAll("[data-sq-char]");
        if (!chars?.length) continue;
        const top = h.getBoundingClientRect().top;
        h.style.setProperty("--sq-h", `${h.offsetHeight}px`);
        chars.forEach((c) => c.style.setProperty("--sq-top", `${(c.getBoundingClientRect().top - top).toFixed(1)}px`));
      }
    });
    root.querySelectorAll(".pp-grad-pink, .pp-grad-dark").forEach((h) => mo.observe(h, { childList: true, subtree: true }));
    return () => mo.disconnect();
  };

  // ── Page box attach · detach
  const mount = (container) => {
    PP.footer(container);
    markCurrent();
    const ns = container.dataset.barbaNamespace;
    const init = PP.pages[ns];
    PP.offs = [init ? init(container) : null, gradChars(container)].filter(Boolean);
    // Split lines only after the fonts have fully loaded — splitting earlier changes the lines when the font swaps, and the rise animation grabs stale lines
    const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))]) : Promise.resolve();
    fonts.then(() => {
      if (!container.isConnected) return;
      PP.offs.push(PP.reveal(container));
      ScrollTrigger.refresh();
    });
  };
  const unmount = () => { PP.offs.forEach((f) => f()); PP.offs = []; ScrollTrigger.getAll().forEach((t) => t.kill()); };

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    mount(first);
    PP.letters();
    PP.loader(first, (d) => PP.enter(first, d + 0.15));
    if (!window.barba) return;
    barba.init({
      timeout: 10000,
      preventRunning: true,
      prevent: ({ href }) => {
        const u = new URL(href, location.href);
        return u.pathname === location.pathname && !!u.hash;
      },
      transitions: [{
        name: "fold",
        async leave() {
          await Promise.all([PP.menu(false), PP.cover()]);
          unmount();
        },
        enter({ next }) {
          scrollTop(0);
          mount(next.container);
          const hash = location.hash && next.container.querySelector(location.hash);
          if (hash) scrollTop(hash.getBoundingClientRect().top + scrollY - rem(5));
          PP.enter(next.container, 0.3);
          return PP.uncover();
        },
      }],
    });
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start);
  else start();
})();
