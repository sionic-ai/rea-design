// Frame shared by all pages — fills header pill, phone menu panel, contact drawer, loader, background, grid, cookie and footer into place, and
// Hooks up section reveal (blur clears), heading letter sequence, work card reveal, and the cursor disc over cards. The page script catches the moment after the loader clears via MD.onReveal.
(() => {
  const EASE = "0.43,0.98,0.87,1";
  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const LINKS = [
    { key: "about", href: "about.html", label: "About us", num: "01" },
    { key: "works", href: "list.html", label: "Case Studies", num: "02" },
    { key: "service", href: "service.html", label: "Services", num: "03" },
    { key: "lab", href: "index.html#lab", label: "Labs", num: "04" },
  ];
  const cur = (k) => (k === page ? ' aria-current="page"' : "");
  const btn = (text, cls = "md-btn", attrs = "") =>
    `<a href="#contact" class="${cls}" data-gt-open data-fx="blur-char-retype-hover" ${attrs}><span class="md-btn__text" data-fx-part="text">${text}</span></a>`;
  const logo = '<a href="index.html" class="md-logo" data-label="Brand English name — bold first word + light second word"><b>studioname</b><span>.studio</span></a>';

  const ICON = {
    a: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.2 6.8L19 10l-6.8 2.2L10 19l-2.2-6.8L1 10l6.8-2.2z"/></svg>',
    b: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.5 2.6 2.5 12.4 0 15M10 2.5c-2.5 2.6-2.5 12.4 0 15"/></svg>',
    c: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M10 2.5l6.5 3.75v7.5L10 17.5l-6.5-3.75v-7.5z"/><path d="M10 6.5l3 1.75v3.5L10 13.5l-3-1.75v-3.5z"/></svg>',
    d: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="10" cy="10" r="7.5"/><path d="M6 14L14 6"/></svg>',
    e: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.2 2h1.6l.5 5.7 4.4-3.6 1.1 1.1-3.6 4.4 5.7.5v1.6l-5.7.5 3.6 4.4-1.1 1.1-4.4-3.6-.5 5.7H9.2l-.5-5.7-4.4 3.6-1.1-1.1 3.6-4.4L1 10.8V9.2l5.7-.5L3.1 4.3l1.1-1.1 4.4 3.6z"/></svg>',
  };

  const chrome = {
    bg: () => `<div class="md-bg" aria-hidden="true"><div class="md-bg__band"></div>
      <svg class="md-bg__grid" viewBox="0 0 1270 1321" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.2" stroke-opacity=".1">
        <circle cx="635" cy="635" r="552"/><circle cx="635" cy="635" r="335"/><circle cx="635" cy="635" r="237"/>
        <path d="M83 83L1187 1187M83 1187L1191 78"/><path d="M0 81H1270M0 399H1270M35 635H1235M0 871H1270M0 1187H1270"/>
        <path d="M399 0V1321M635 0V1053M871 0V1321"/></svg></div>`,
    loader: () => `<div class="md-loader" id="mdLoader" aria-hidden="true"><div class="md-loader__white"></div><div class="md-loader__band"></div>
      <div class="md-loader__logo">${"studioname".split("").map((c) => `<b class="pl-char">${c}</b>`).join("")}${".studio".split("").map((c) => `<span class="pl-char">${c}</span>`).join("")}</div></div>`,
    nav: () => `<nav class="md-nav" data-slot="nav"><div class="md-nav__in">${logo}
      <div class="md-pill">${LINKS.map((l) => `<a href="${l.href}" class="md-pill__item"${cur(l.key)}><span class="md-pill__label">${l.label}</span><span class="md-pill__num">${l.num}</span></a>`).join("")}${btn("Book a call", "md-btn md-btn--pill")}</div>
      <button class="md-burger" type="button" aria-label="Open Menu" aria-expanded="false"><span class="md-burger__in"><span class="md-burger__icon"><span class="md-burger__line"></span><span class="md-burger__line"></span></span></span></button>
      </div></nav>`,
    mnav: () => `<div class="md-mnav" id="mdMnav" aria-hidden="true" inert data-slot="mobile-menu"><div class="md-mnav__panel"><div class="md-mnav__body"><div>
      <div class="md-mnav__links">${LINKS.map((l) => `<a href="${l.href}" class="md-mnav__item"${cur(l.key)}><span class="md-mnav__label">${l.label}</span><span class="md-mnav__num">${l.num}</span></a>`).join("")}</div>
      <div style="display:flex;justify-content:center">${btn("Book a call", "md-btn md-mnav__cta")}</div></div>
      <div class="md-mnav__foot"><a href="#contact" data-gt-open>Contact Us</a><a href="#contact">hello@studioname.studio</a><div class="md-mnav__social"><a href="#">Brand</a><i class="md-dot"></i><a href="#">LinkedIn</a><i class="md-dot"></i><a href="#">Instagram</a></div></div>
      </div></div></div>`,
    drawer: () => `<div class="md-gt" id="mdGt" role="dialog" aria-modal="true" aria-hidden="true" inert aria-labelledby="mdGtH" data-slot="contact-drawer"><div class="md-gt__card">
      <div class="md-gt__bar">${logo}<span class="md-gt__close-shell"><button type="button" class="md-gt__close" data-gt-close aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></span></div>
      <div class="md-gt__head"><h2 class="md-gt__h" id="mdGtH" data-label="Contact drawer large English title">Got a question for us?</h2><p class="md-gt__sub">Your one line here inviting a talk about what to make together.</p>
        <div class="md-gt__tabs" role="tablist"><span class="md-gt__pill" aria-hidden="true"></span><button type="button" class="md-gt__tab is-active" role="tab" aria-selected="true" data-gt-tab="call">Book a call</button><button type="button" class="md-gt__tab" role="tab" aria-selected="false" data-gt-tab="message">Send message</button></div></div>
      <div class="md-gt__body">
        <div class="md-gt__panel is-active" data-gt-panel="call"><p class="md-gt__lede">Your two lines about the 25-minute intro call here. What to bring, and what you get when it ends.</p><div class="md-gt__cal wf-img" data-label="Booking calendar insert · date cells and time list · landscape 3:2"></div></div>
        <div class="md-gt__panel" data-gt-panel="message"><form class="md-gt__form" onsubmit="return false"><label class="md-gt__field"><input placeholder="Name" aria-label="Name"></label><label class="md-gt__field"><input placeholder="Email" aria-label="Email"></label><label class="md-gt__field is-area"><textarea rows="5" placeholder="Please briefly describe your project here" aria-label="Content"></textarea></label>${btn("Submit", "md-btn md-gt__submit")}</form><p class="md-gt__fine">Your privacy notice line and email address line here</p></div>
      </div>
      <div class="md-gt__legal"><a href="#contact">hello@studioname.studio</a><div class="md-mnav__social"><a href="#">Brand</a><i class="md-dot"></i><a href="#">LinkedIn</a><i class="md-dot"></i><a href="#">Instagram</a></div></div>
      </div></div>`,
    footer: () => `<footer class="md-foot" data-slot="footer">
      <div class="md-foot__row md-foot__row--ai"><div class="md-foot__col"><p>Your AI summary note here, one line</p><div class="md-foot__icons">${["a", "b", "c", "d", "e"].map((k, i) => `<a href="#" aria-label="AI Summary ${i + 1}" data-label="AI service logo icon">${ICON[k]}</a>`).join("")}</div></div><a href="#contact" class="md-foot__mail">hello@studioname.studio</a></div>
      <div class="md-foot__row md-foot__row--brand"><div class="md-foot__brand"><span data-label="Company English name">Studio Name</span><span>Your one-line company introduction goes here</span></div><div class="md-foot__social"><a href="#">Brand</a><i class="md-dot"></i><a href="#">LinkedIn</a><i class="md-dot"></i><a href="#">Instagram</a></div></div>
      <div class="md-foot__row md-foot__row--legal"><div class="md-foot__legal"><a href="#contact" data-gt-open>Contact Us</a><a href="#">Privacy policy</a><button type="button" data-cookie-settings>Cookie Settings</button></div><p class="md-foot__copy">© 2026 studioname.studio <b>Your short closing remark here</b></p></div>
      <div class="md-foot__mark" data-fx="dot-repel" data-fx-dot-repel="radius: 80; push: 6; ret: .065; damp: .71; falloff: cubic; drag: .15; shape: square; size: 2; gap: 3; scatter: 0; span: .78; top: 40" data-label="Brand English wordmark — stamped in dots">studioname</div>
      </footer>`,
    ticks: () => '<div class="md-ticks" data-fx="tick-swell-meter" aria-hidden="true"></div>',
    cursor: () => '<div class="md-cursor" id="mdCursor" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M8 7h9v9"/></svg><span class="md-cursor__label">Coming soon</span></div>',
    cookie: () => '<div class="md-cookie" id="mdCookie" role="dialog" aria-label="Cookie Notice" hidden><div class="md-cookie__in"><p>Your cookie notice here in one line</p><button type="button" class="is-ghost" data-consent="deny">Refusal</button><button type="button" data-consent="accept">Consent</button></div></div>',
  };

  // Placeholder fill — the page is [data-chrome="Name"] leave only an empty slot
  document.querySelectorAll("[data-chrome]").forEach((slot) => { slot.outerHTML = chrome[slot.dataset.chrome](); });
  document.body.insertAdjacentHTML("afterbegin", chrome.bg() + (reduce ? "" : chrome.loader()));
  document.body.insertAdjacentHTML("beforeend", chrome.mnav() + chrome.drawer() + chrome.ticks() + chrome.cursor() + chrome.cookie());
  if (!reduce) document.body.classList.add("is-loading");
  document.documentElement.classList.add("md-booted");

  // Text splitting — wraps words in inline-block chunks so multi-line Korean headings don’t break in the middle of a word
  const split = (node) => {
    if (node.dataset.split) return [...node.querySelectorAll(".char")];
    node.dataset.split = "1";
    const walk = (n) => {
      for (const c of [...n.childNodes]) {
        if (c.nodeType === 1) { if (c.tagName !== "BR") walk(c); continue; }
        if (c.nodeType !== 3 || !c.textContent.trim()) continue;
        const frag = document.createDocumentFragment();
        for (const part of c.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(part); continue; }
          const w = document.createElement("span");
          w.className = "word";
          for (const ch of part) w.append(Object.assign(document.createElement("span"), { className: "char", textContent: ch }));
          frag.append(w);
        }
        c.replaceWith(frag);
      }
    };
    walk(node);
    return [...node.querySelectorAll(".char")];
  };

  const revealers = [];
  const MD = (window.MD = {
    EASE, touch, reduce, split,
    ease: (s = EASE) => (window.CustomEase ? CustomEase.create(`md${s.replace(/\W/g, "")}`, s) : "power2.out"),
    revealed: false,
    onReveal(fn) { this.revealed ? fn() : revealers.push(fn); },
  });
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  gsap.registerPlugin(ScrollTrigger);
  const E = MD.ease();
  const blur = (px) => (touch ? {} : { filter: `blur(${px}px)` });
  const clear = touch ? {} : { filter: "blur(0px)" };

  const fire = () => {
    if (MD.revealed) return;
    MD.revealed = true;
    revealers.splice(0).forEach((f) => f());
  };

  const nav = document.querySelector(".md-nav");
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(nav, { opacity: 0, y: -20, ...blur(6) });
    MD.onReveal(() => gsap.to(nav, { opacity: 1, y: 0, ...clear, duration: 0.8, ease: E, delay: 0.05, overwrite: true, onComplete: () => (nav.style.filter = "none") }));

    // Loader — letters clear their blur in .45s (.03 stagger, .2 late) → rests .6 and the curtain lifts in 1.2s (bouncing curve) while the letters blur out in .3s and exit
    const loader = document.getElementById("mdLoader");
    if (loader) {
      const chars = loader.querySelectorAll(".pl-char");
      gsap.set(loader.querySelector(".md-loader__logo"), { opacity: 1 });
      // On the first page, the hero entrance fires .3s after the curtain starts lifting. On other pages, like the original shared loader, it fires when the letters have fully resolved (under the curtain)
      gsap.to(chars, {
        opacity: 1, y: 0, ...clear, duration: 0.45, ease: E, stagger: 0.03, delay: 0.2,
        onComplete: () => (page !== "home" && fire(), gsap.to(loader, {
          yPercent: -100, duration: 1.2, ease: MD.ease("0,-0.18,0,1"), delay: 0.6,
          onStart: () => {
            gsap.to(chars, { opacity: 0, y: -12, ...blur(6), duration: 0.3, stagger: 0.02, ease: "power2.in" });
            gsap.to(loader, { opacity: 0, duration: 0.3, ease: "power1.in" });
            setTimeout(fire, 300);
          },
          onComplete: () => { loader.remove(); document.body.classList.remove("is-loading"); dispatchEvent(new Event("md:loader-gone")); },
        })),
      });
      setTimeout(fire, 3000);
    } else { fire(); setTimeout(() => dispatchEvent(new Event("md:loader-gone")), 0); }

    // Section entrance — on reaching 88% of the screen, from 30px below and 6px blur over .8s, with the title inside .3s later, letter by letter at .02 interval over .45s
    document.querySelectorAll(".md-fade").forEach((sec) => {
      const head = sec.querySelector(".md-split");
      const chars = head ? split(head) : [];
      if (chars.length) gsap.set(chars, { opacity: 0, y: 8 });
      gsap.fromTo(sec, { opacity: 0, y: 30, ...blur(6) }, {
        opacity: 1, y: 0, ...clear, duration: 0.8, ease: E,
        scrollTrigger: { trigger: sec, start: "top 88%", once: true },
        onStart: () => chars.length && gsap.to(chars, { opacity: 1, y: 0, duration: 0.45, ease: E, stagger: 0.02, delay: 0.3 }),
      });
    });

    // Work card — staggered .15 later within a row: photo 40px below · blur 8px .8s, client name +.25 .5s, title letters +.35 .45s (.02), table +.35 .5s
    document.querySelectorAll(".md-card:not([data-hero-card])").forEach((card) => {
      const img = card.querySelector(".md-card__img"), label = card.querySelector(".md-card__label");
      const title = card.querySelector(".md-card__title"), tag = card.querySelector(".md-tag");
      const row = [...card.parentElement.querySelectorAll(":scope > .md-card, :scope > * > .md-card")];
      const lag = Math.max(0, row.indexOf(card)) * 0.15;
      const tc = title ? split(title) : [];
      if (img) gsap.set(img, { opacity: 0, y: 40, ...blur(8) });
      [label, tag].forEach((n) => n && gsap.set(n, { opacity: 0, y: 8, ...blur(6) }));
      if (tc.length) gsap.set(tc, { opacity: 0, y: 8, ...blur(8) });
      ScrollTrigger.create({
        trigger: card, start: "top 88%", once: true,
        onEnter: () => {
          if (img) gsap.to(img, { opacity: 1, y: 0, ...clear, duration: 0.8, ease: E, delay: lag });
          if (label) gsap.to(label, { opacity: 1, y: 0, ...clear, duration: 0.5, ease: E, delay: lag + 0.25 });
          if (tc.length) gsap.to(tc, { opacity: 1, y: 0, ...clear, duration: 0.45, ease: E, stagger: 0.02, delay: lag + 0.35 });
          if (tag) gsap.to(tag, { opacity: 1, y: 0, ...clear, duration: 0.5, ease: E, delay: lag + 0.35 });
        },
      });
    });

    // Reviews — each child starts 20px lower with blur 8px, over .7s, .12 stagger
    document.querySelectorAll(".md-quote").forEach((q) => {
      const parts = [...q.children];
      gsap.set(parts, { opacity: 0, y: 20, ...blur(8) });
      ScrollTrigger.create({ trigger: q, start: "top 88%", once: true, onEnter: () => gsap.to(parts, { opacity: 1, y: 0, ...clear, duration: 0.7, ease: E, stagger: 0.12 }) });
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => { fire(); setTimeout(() => dispatchEvent(new Event("md:loader-gone")), 0); });

  // Header — dark section (data-nav-theme="dark") once it passes under the header band (80px), switch to an ink-colored band
  const darks = [...document.querySelectorAll('[data-nav-theme="dark"]')];
  const navTheme = () => nav.classList.toggle("md-nav--dark", darks.some((s) => { const r = s.getBoundingClientRect(); return r.top < 80 && r.bottom > 0; }));
  let navQueued = false;
  addEventListener("scroll", () => { if (!navQueued) { navQueued = true; requestAnimationFrame(() => { navQueued = false; navTheme(); }); } }, { passive: true });
  navTheme();

  // Scroll lock — while the phone menu or contact drawer is open
  let saved = 0, locks = 0;
  const lock = () => { if (locks++) return; saved = scrollY; Object.assign(document.body.style, { position: "fixed", top: `-${saved}px`, left: "0", right: "0", overflow: "hidden" }); };
  const unlock = () => { if (--locks > 0) return; locks = 0; Object.assign(document.body.style, { position: "", top: "", left: "", right: "", overflow: "" }); scrollTo(0, saved); };

  // Phone menu — the panel goes 0→1 from the top right in .6s (cubic-bezier(.87,.45,.33,.88)), links come .35 later from 18px below and 6px blur at .06 intervals
  const burger = document.querySelector(".md-burger"), mnav = document.getElementById("mdMnav");
  const panel = mnav.querySelector(".md-mnav__panel"), mlinks = mnav.querySelectorAll(".md-mnav__item");
  const mcta = mnav.querySelector(".md-mnav__cta"), mfoot = mnav.querySelector(".md-mnav__foot");
  const MODAL = MD.ease("0.87,0.45,0.33,0.88");
  const openNav = () => {
    burger.classList.add("is-open"); burger.setAttribute("aria-expanded", "true");
    mnav.setAttribute("aria-hidden", "false"); mnav.inert = false; mnav.style.pointerEvents = "auto"; lock();
    gsap.fromTo(mnav, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: MODAL });
    gsap.fromTo(panel, { scale: 0 }, { scale: 1, duration: 0.6, ease: MODAL });
    gsap.fromTo(mlinks, { opacity: 0, y: 18, ...blur(6) }, { opacity: 1, y: 0, ...clear, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.35 });
    gsap.fromTo(mcta, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", delay: 0.7 });
    gsap.fromTo(mfoot, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.8 });
  };
  const closeNav = () => {
    burger.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false");
    mnav.setAttribute("aria-hidden", "true"); mnav.inert = true; mnav.style.pointerEvents = "none"; unlock();
    gsap.to(mlinks, { opacity: 0, duration: 0.2, ...blur(4) });
    gsap.to([mcta, mfoot], { opacity: 0, duration: 0.2 });
    gsap.to(mnav, { opacity: 0, duration: 0.5, ease: MODAL });
    gsap.to(panel, { scale: 0, duration: 0.5, ease: MODAL });
  };
  burger.addEventListener("click", () => (burger.classList.contains("is-open") ? closeNav() : openNav()));
  mlinks.forEach((a) => a.addEventListener("click", () => burger.classList.contains("is-open") && closeNav()));

  // Door drawer — a glass card covering the screen appears in .3s and settles from .96 scale and 10px below in .35s, and the tab pill slides in 250ms
  const gt = document.getElementById("mdGt");
  const tabs = [...gt.querySelectorAll(".md-gt__tab")], pill = gt.querySelector(".md-gt__pill");
  const setTab = (name) => {
    tabs.forEach((t, i) => { const on = t.dataset.gtTab === name; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", on); if (on) pill.style.transform = `translateX(${2 + i * 144}px)`; });
    gt.querySelectorAll("[data-gt-panel]").forEach((p) => p.classList.toggle("is-active", p.dataset.gtPanel === name));
  };
  const openGt = (tab) => {
    if (burger.classList.contains("is-open")) closeNav();
    setTab(tab); gt.classList.add("is-open"); gt.setAttribute("aria-hidden", "false"); gt.inert = false; lock();
  };
  const closeGt = () => { if (!gt.classList.contains("is-open")) return; gt.classList.remove("is-open"); gt.setAttribute("aria-hidden", "true"); gt.inert = true; unlock(); };
  document.addEventListener("click", (e) => {
    const open = e.target.closest("[data-gt-open]");
    if (open && !gt.contains(open)) { e.preventDefault(); openGt(/message|contact/.test(open.textContent) ? "message" : "call"); return; }
    if (e.target.closest("[data-gt-close]") || e.target === gt) closeGt();
    const tab = e.target.closest("[data-gt-tab]");
    if (tab) setTab(tab.dataset.gtTab);
  });
  addEventListener("keydown", (e) => { if (e.key !== "Escape") return; closeGt(); if (burger.classList.contains("is-open")) closeNav(); });

  // Cookie pill — floats up from below (.4s) .6s after the loader curtain fully clears. Once per session, and service pages don’t pop it up on their own, like the original
  const cookie = document.getElementById("mdCookie");
  const showCookie = () => { cookie.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => cookie.classList.add("is-visible"))); };
  const hideCookie = () => { cookie.classList.remove("is-visible"); setTimeout(() => { if (!cookie.classList.contains("is-visible")) cookie.hidden = true; }, 400); };
  cookie.addEventListener("click", (e) => { if (e.target.closest("[data-consent]")) { hideCookie(); try { sessionStorage.setItem("md-consent", "1"); } catch (_) {} } });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-cookie-settings]")) { e.preventDefault(); showCookie(); } });
  let asked = false;
  try { asked = sessionStorage.getItem("md-consent") === "1"; } catch (_) {}
  if (!asked && page !== "service") addEventListener("md:loader-gone", () => setTimeout(showCookie, 600), { once: true });

  // Cursor disc over work photos — follows the mouse .12 per frame late, grows in .35s when entering a photo and shrinks then disappears on leaving
  const cursor = document.getElementById("mdCursor");
  if (matchMedia("(hover: hover)").matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; if (!cursor.classList.contains("is-visible") && e.target.closest?.(".md-card__img, [data-cursor]")) show(e); }, { passive: true });
    // Cases not yet open (data-soon) get a Coming soon tag pill instead of an arrow
    const show = (e) => { cursor.style.left = `${cx}px`; cursor.style.top = `${cy}px`; cursor.classList.toggle("is-soon", !!e?.target?.closest?.("[data-soon]")); cursor.classList.add("is-visible"); };
    const hide = () => cursor.classList.remove("is-visible");
    gsap.ticker.add(() => { cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12; cursor.style.left = `${cx}px`; cursor.style.top = `${cy}px`; });
    document.querySelectorAll(".md-card__img, [data-cursor]").forEach((el) => { el.addEventListener("mouseenter", show); el.addEventListener("mouseleave", hide); });
  }

  // Background — blur shows only near the header, is withdrawn in 1.2s when scrolling down, then moves down at the footer and shows again (home is set per section by index.js)
  const bg = document.querySelector(".md-bg");
  const foot = document.querySelector(".md-foot");
  if (document.querySelector("main[data-bg-fade]") && bg && foot) {
    let footIn = false;
    const upd = () => {
      let show = scrollY < 80 || footIn;
      if (footIn !== bg.classList.contains("md-bg--bottom")) {
        if (reduce || parseFloat(getComputedStyle(bg).opacity) < 0.02) bg.classList.toggle("md-bg--bottom", footIn);
        else show = false;
      }
      bg.classList.toggle("md-bg--hidden", !show);
    };
    bg.addEventListener("transitionend", (e) => e.propertyName === "opacity" && upd());
    new IntersectionObserver((en) => { footIn = en[0].isIntersecting; upd(); }).observe(foot);
    addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true });
    upd();
    requestAnimationFrame(() => bg.classList.add("md-bg--fade"));
  }
})();
