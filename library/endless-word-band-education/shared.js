// All pages use the same header, full menu, Social pill, footer and loader drawn here, and page transitions use Barba 2.9.7 (leaving and entering both .4s transparent, power1.inOut),
// Smooth scroll uses Lenis 1.1.16 (lerp .25 · wheel 1×) — both the same setup as the original.
// Every page change re-runs init(panel): letter split (js-tex) · stagger delay (js-tdg) · is-v when visible (js-pos, margin −10px) · underline hover · magnet.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pc = matchMedia("(hover: hover) and (min-width: 1000px)").matches;
  const MAIN = CustomEase.create("um-main", "M0,0 C0.2,0.1 0,1 1,1");
  const nsOf = (c) => c?.dataset.barbaNamespace || "page";

  const ARR_SVG = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5.6 1 9.6 5l-4 4-.85-.85 2.55-2.55H.4V4.4h6.9L4.75 1.85z" fill="currentColor"/></svg>';
  // Arrow — on hover it slides out to the right and vanishes, then re-enters from the left and settles (original -arr)
  const ARR = `<span class="um-arr"><span class="-a">${ARR_SVG}</span></span>`;
  window.umArr = ARR;
  const btn = (txt, href, cls = "") => `<a class="um-btn ${cls}" href="${href}"><span class="um-btn__hit"><span class="um-btn__bg"></span></span><span class="um-btn__tx"><span>${txt}</span>${ARR}</span></a>`;
  window.umBtn = btn;
  const ul = (txt, href) => `<a class="um-ul" href="${href}" data-um-ul><span>${txt}</span><span class="um-ul__bar"><span class="-line"></span></span></a>`;
  const mark = '<span class="um-mark" data-fx-part="mark"><i class="-t" data-fx-part="top"></i><i class="-b -b1" data-fx-part="bottom"></i><i class="-b -b2" data-fx-part="bottom"></i></span>';
  window.umMark = '<span class="um-mark"><i class="-t"></i><i class="-b -b1"></i><i class="-b -b2"></i></span>';
  const NAV = [["About", "about.html"], ["Information", "information.html"], ["Journal", "journal.html"], ["Keywords", "index.html#keywords"]];

  document.documentElement.classList.add("um-js");
  // Like the original, always open at the top (scrollTo(0, 0) when the loader clears)
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const container = $('[data-barba="container"]');
  const home = nsOf(container) === "home";
  const head = `
<div class="um-ld" id="um-ld" aria-hidden="true">${window.umMark}</div>
<header class="um-head" data-slot="header">
  <div class="um-head__in">
    <a class="um-logo" href="index.html" aria-label="First Page" data-fx="logo-fold-header" data-fx-logo-fold-header="${innerWidth >= 1000 ? "lift: 17.5; height: 55" : "shift: 51.6; scale: .988"}; state-dur: .8; state-ease: power1.inOut${home ? "" : "; folded: true"}" data-label="Logo — three-semicircle table + one-line slogan + English wordmark">
      <span class="um-logo__body" data-fx-part="body">${mark}<span class="um-logo__txt"><span class="um-logo__tag" data-fx-part="tag">Spot for a one-line slogan</span><span class="um-logo__word" data-fx-part="word">Brand Lab.</span></span></span>
    </a>
    <div class="um-head__mid">
      <div><button class="um-search" type="button" data-um-ul><svg viewBox="0 0 12 12" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="none" stroke="currentColor"/><path d="M8 8l3.5 3.5" stroke="currentColor"/></svg><span class="um-ul um-search__tx"><span>Search</span><span>Close</span><span class="um-ul__bar"><span class="-line"></span></span></span></button></div>
      <nav class="um-nav" aria-label="Main menu">${NAV.map(([t, h]) => ul(t, h)).join("")}</nav>
    </div>
    <button class="um-menu" type="button" aria-expanded="false" aria-controls="um-drawer"><span class="um-menu__lines"><i></i><i></i></span><span class="um-menu__tx"><span>Menu</span><span>Close</span></span></button>
  </div>
</header>
<div class="um-drawer" id="um-drawer" data-slot="menu-drawer" data-lenis-prevent>
  <section class="um-drawer__col">
    <nav class="um-bignav" aria-label="Full menu">
      <ul>${["About", "Keywords", "Information", "Company", "Contact"].map((t) => `<li><a href="${t === "About" ? "about.html" : t === "Information" ? "information.html" : "index.html"}">${t}</a></li>`).join("")}</ul>
      <ul><li><a href="journal.html">Journal</a><ul class="um-sub"><li><a href="journal.html">Feature</a></li><li><a href="journal.html">Interview</a></li><li><a href="journal.html">Research and Report</a></li><li><a href="journal.html">Study</a></li></ul></li></ul>
    </nav>
  </section>
  <section class="um-drawer__col um-drawer__col--dark">
    <div class="um-sec-head"><p class="um-sec-head__title">Keywords</p>${btn("View More", "index.html#keywords", "um-btn--w")}</div>
    <div class="um-rail" data-um-rail data-fx="drag-marquee" data-fx-drag-marquee="speed: 1; drag: lerp; boost: .25; ramp: .15; inview: true"></div>
  </section>
</div>
<div class="um-searchpanel" id="um-search" data-slot="search-panel" data-lenis-prevent>
  <section class="um-drawer__col um-searchpanel__col">
    <p class="um-searchpanel__label"><span class="um-sp-item">Search</span></p>
    <form class="um-searchpanel__form" action="journal.html" role="search"><input class="um-searchpanel__input" type="search" name="s" placeholder="Search by keyword" aria-label="Search term"><button class="um-searchpanel__go" type="submit" aria-label="Find">${ARR}</button></form>
    <p class="um-searchpanel__sub">Popular keywords</p>
    <ul class="um-searchpanel__chips">${["--site-pink", "--site-red", "--site-blue", "--site-lemon", "--site-mint", "--site-orange"].map((c, i) => `<li><a href="journal.html" style="--chip: var(${c})"><i></i>#Keyword ${i + 1}</a></li>`).join("")}</ul>
  </section>
  <section class="um-drawer__col um-drawer__col--dark">
    <div class="um-sec-head"><p class="um-sec-head__title"><span class="um-sp-item">Keywords</span></p>${btn("View More", "index.html#keywords", "um-btn--w")}</div>
    <div class="um-rail" data-um-rail data-fx="drag-marquee" data-fx-drag-marquee="speed: 1; drag: lerp; boost: .25; ramp: .15; inview: true"></div>
  </section>
</div>
<div class="um-social" data-slot="social-bar">
  <span class="um-social__label">Social :</span>
  ${[1, 2, 3, 4].map((n) => `<a class="um-social__ico" href="#" aria-label="SNS ${n}"><span class="um-social__ico-bg"></span><svg class="um-social__ico-tx" viewBox="0 0 12 12" aria-hidden="true"><path d="${["M2 2h8v8H2z", "M6 1 11 6 6 11 1 6z", "M3 2l7 4-7 4z", "M6 1a5 5 0 1 0 .01 0z"][n - 1]}" fill="currentColor"/></svg></a>`).join("")}
  <span class="um-social__sep"></span>
  <a class="um-social__btn" href="about.html"><span class="um-btn__hit"><span class="um-btn__bg"></span></span><span class="um-social__dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="um-social__tx">Teacher supplementary material</span></a>
</div>`;
  const foot = `
<footer class="um-foot" data-slot="footer">
  <div class="um-foot__top">
    <nav class="um-bignav" aria-label="Footer Menu">
      <ul>${["About", "Keywords", "Information", "Company", "Contact"].map((t) => `<li><a href="${t === "About" ? "about.html" : t === "Information" ? "information.html" : "index.html"}">${t}</a></li>`).join("")}</ul>
      <ul><li><a href="journal.html">Journal</a><ul class="um-sub"><li><a href="journal.html">Feature</a></li><li><a href="journal.html">Interview</a></li><li><a href="journal.html">Research and Report</a></li><li><a href="journal.html">Study</a></li></ul></li></ul>
    </nav>
    <div class="um-foot__right">
      <a class="um-promo" href="about.html"><span class="um-promo__img wf-img um-ph" data-label="Hand holding a textbook cover at an angle · light gray background"></span><span class="um-promo__box"><span class="um-promo__tag">For Teachers</span><span class="um-promo__ttl">Teacher supplementary material<br>Download</span><span class="um-btn um-promo__btn"><span class="um-btn__hit"><span class="um-btn__bg"></span></span><span class="um-btn__tx"><span>View More</span>${ARR}</span></span></span></a>
      <div class="um-social-list"><p>Social</p><a href="#"><i></i>@account</a><a href="#"><i></i>@account</a><a href="#"><i></i>@account</a><a href="#"><i></i>@account</a></div>
    </div>
  </div>
  <div class="um-foot__bottom">
    <div class="um-foot__links"><a href="#">Privacy Policy</a><a href="#">Website Disclaimer</a></div>
    <p class="um-foot__copy">Your copyright permission number here, in one line<br>© Copyright 0000 Company Name. All Rights Reserved.</p>
  </div>
</footer>`;
  container.insertAdjacentHTML("beforebegin", head);
  container.insertAdjacentHTML("afterend", foot);
  // Apply the same underline hover to big links and SNS links in the footer and menu board
  $$(".um-bignav > ul > li > a, .um-social-list a, .um-foot__links a").forEach((a) => {
    a.setAttribute("data-um-ul", "");
    a.classList.add("um-ul");
    a.insertAdjacentHTML("beforeend", '<span class="um-ul__bar"><span class="-line"></span></span>');
  });

  // Keyword pill strip (shared by the menu panel and the first page)
  const KW = [["#Keyword One", "photo"], ["#Keyword Two", "ring"], ["#Keyword Three", "photo"], ["#Keyword Four", "ring"], ["#Keyword Five", "photo"], ["#Keyword Six", "ring"], ["#Keyword Seven", "ring"], ["#Keyword Eight", "photo"], ["#Keyword Nine", "ring"], ["#Keyword Ten", "ring"]];
  const KWC = ["--site-mint", "--site-pink", "--site-sky", "--site-gold", "--site-lilac", "--site-orange", "--site-green", "--site-peach", "--site-blue", "--site-yolk"];
  window.umKeywords = () => KW.map(([t, k], i) => `<a class="um-kw" href="index.html#keywords" style="--mainBgColor: var(${KWC[i]}); --ringColor: var(${KWC[(i + 3) % 10]}); --dotColor: var(${KWC[(i + 6) % 10]})">
      <span class="um-kw__no">Keywords ${String(i + 1).padStart(2, "0")}</span>
      <span class="um-kw__vis">${k === "photo" ? '<span class="um-kw__photo wf-img um-ph" data-label="Person circle photo"></span>' : '<span class="um-kw__ring"></span><span class="um-kw__dot"></span>'}</span>
      <span class="um-kw__txt"><span class="um-kw__name">${t}</span><span class="um-kw__count">0 Article</span></span>
    </a>`).join("");
  $$(".um-rail").forEach((r) => (r.innerHTML = `<div class="um-rail__track" data-fx-part="track">${window.umKeywords()}</div>`));

  // Smooth scroll
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.25, wheelMultiplier: 1 });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);
  }

  // Menu panel — the logo folds when it opens
  const menuBtn = $(".um-menu"), logo = $(".um-logo");
  // When the panel is closed, the keyword band inside sits down below the screen (top 100vh) and doesn’t flow (inview) — on opening it rises right into place and flows,
  // When closing, it goes down only after the panel has fully vanished (.5s · .6s) (original js-srch is-open removed at the end of closing)
  const rails = (panel, on, ms) => {
    clearTimeout(panel._umOff);
    if (on) panel.classList.add("is-open");
    else panel._umOff = setTimeout(() => panel.classList.remove("is-open"), ms);
  };
  const setNav = (open) => {
    if (document.documentElement.classList.contains("is-navopen") === open) return;
    document.documentElement.classList.toggle("is-navopen", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    logo.dispatchEvent(new CustomEvent(open ? "fx:fold" : nsOf($('[data-barba="container"]')) === "home" ? "fx:unfold" : "fx:fold"));
    open ? lenis?.stop() : lenis?.start();
    rails($("#um-drawer"), open, 600);
  };
  menuBtn.addEventListener("click", () => { setSearch(false); setNav(!document.documentElement.classList.contains("is-navopen")); });
  // Search panel — opening turns Search into Close (.5s) and the logo folds
  const searchBtn = $(".um-search");
  function setSearch(open) {
    const root = document.documentElement;
    if (root.classList.contains("is-searchopen") === open) return;
    root.classList.toggle("is-searchopen", open);
    searchBtn.setAttribute("aria-expanded", String(open));
    logo.dispatchEvent(new CustomEvent(open ? "fx:fold" : nsOf($('[data-barba="container"]')) === "home" ? "fx:unfold" : "fx:fold"));
    open ? lenis?.stop() : lenis?.start();
    rails($("#um-search"), open, 500);
  }
  window.umSetSearch = setSearch;
  searchBtn.addEventListener("click", () => { setNav(false); setSearch(!document.documentElement.classList.contains("is-searchopen")); });

  // Underline hover — on hover the line enters from outside left (−101%) in .8s, and on release exits to the right (101%) then is reset to outside left.
  // Releasing while entering makes it exit after the entrance finishes (original MOVING) — this wait is why the original exit is long
  const bindUl = (root) => $$("[data-um-ul]", root).forEach((a) => {
    if (a.dataset.umBound) return;
    a.dataset.umBound = "1";
    const line = $(".-line", a);
    gsap.set(line, { x: 0, xPercent: -101 });
    if (!pc) return;
    let enter = false, moving = false;
    const done = () => { moving = false; if (enter && gsap.getProperty(line, "xPercent") !== 0) inn(); else if (!enter && gsap.getProperty(line, "xPercent") === 0) out(); };
    const inn = () => { moving = true; gsap.fromTo(line, { xPercent: -101 }, { xPercent: 0, duration: 0.8, ease: MAIN, overwrite: true, onComplete: done }); };
    const out = () => { moving = true; gsap.to(line, { xPercent: 101, duration: 0.8, ease: MAIN, overwrite: true, onComplete: () => { gsap.set(line, { xPercent: -101 }); done(); } }); };
    a.addEventListener("mouseenter", () => { enter = true; if (!moving) inn(); });
    a.addEventListener("mouseleave", () => { enter = false; if (!moving) out(); });
  });
  bindUl(document);

  // Arrow — on hover, moves to the right for .5s (data-dir="prev" side left) while fading, and when done it enters from the opposite −100% over .5s and settles.
  // Re-hovering mid-spin doesn’t restart it from the beginning (original -arr ENTER). Releasing doesn’t reverse it
  const bindArr = (root) => $$(".um-arr", root).forEach((arr) => {
    const host = arr.closest("a, button");
    if (!pc || reduce || !host || host.dataset.umArr) return;
    host.dataset.umArr = "1";
    const dir = host.dataset.dir === "prev" ? -1 : 1;
    let busy = false;
    host.addEventListener("mouseenter", () => {
      if (busy) return;
      busy = true;
      const items = $$(".um-arr > span", host);
      items.forEach((n, i) => gsap.to(n, { xPercent: dir * 100, opacity: 0, duration: 0.5, delay: 0.1 * i, ease: MAIN, onComplete: () => {
        gsap.fromTo(n, { xPercent: dir * -100 }, { xPercent: 0, opacity: 1, duration: 0.5, ease: MAIN, onComplete: () => { if (i === items.length - 1) busy = false; } });
      } }));
    });
  });
  bindArr(document);


  // Letter splitting — <br> Lines by it, words by spaces, and _o (mask) for each letter > _i (rising letter)
  const splitTex = (root) => $$(".js-tex", root).forEach((el) => {
    const lines = el.innerHTML.split(/<br\s*\/?>/i);
    el.classList.remove("js-tex");
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = "";
    let n = 0;
    lines.forEach((ln) => {
      const line = document.createElement("span");
      line.className = "-line"; line.style.display = "block";
      const tmp = document.createElement("span"); tmp.innerHTML = ln;
      tmp.textContent.split(" ").forEach((w, wi, all) => {
        const word = document.createElement("span");
        word.className = "-word"; word.style.display = "inline-block"; word.setAttribute("aria-hidden", "true");
        [...(wi < all.length - 1 ? `${w} ` : w)].forEach((ch) => {
          const o = document.createElement("span"), i = document.createElement("span");
          o.className = "_o"; i.className = "_i"; i.textContent = ch; i.style.setProperty("--i", n++);
          o.append(i); word.append(o);
        });
        line.append(word);
      });
      el.append(line);
    });
  });
  const setDelays = (root) => $$(".js-tdg", root).forEach((g) => {
    const de = +(g.dataset.de || 0.08), off = +(g.dataset.deOffset || 0);
    $$(".js-tdi", g).forEach((it, i) => it.style.setProperty("--delay", `${de * i + off}s`));
  });
  let io = null;
  const watch = (root) => {
    io?.disconnect();
    io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-v"); io.unobserve(e.target); } }), { rootMargin: "-10px", threshold: 0 });
    $$(".js-pos", root).forEach((el) => (reduce ? el.classList.add("is-v") : io.observe(el)));
  };

  // Magnet — while the cursor is over a cell, it follows each frame by .1 of the portion (−1~1) away from the center of the reference point (.-pvt, or the cell if none),
  // Piece i (of n) is pushed (i+1)/n × its share × TY px and tilted (X·Y sign) × |X·Y| × 10°. TY = min(.2 of the cell half-height·half-width, .05 of screen width). On release it returns to 0 the same way
  const mags = new Set();
  const mouse = { x: -1e4, y: -1e4 };
  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const lerp = (a, b, t) => a + (b - a) * t;
  // The reference point · cell size are measured the moment the pointer comes in, and after that only the amount the scroll (Lenis’s drawn position) moved is subtracted — the same calculation as the original POS · scroll.pos
  const sc = () => (lenis ? lenis.animatedScroll : scrollY);
  gsap.ticker.add(() => mags.forEach((m) => {
    if (!m.box.isConnected) { mags.delete(m); m.io.disconnect(); return; }
    if (!m.view) return;
    const p = m.pos, tx = m.enter ? (mouse.x - p.x) / p.w : 0, ty = m.enter ? (mouse.y - p.y - (p.scroll - sc())) / p.h : 0;
    m.X = lerp(m.X, tx, 0.1); m.Y = lerp(m.Y, ty, 0.1);
    const sign = (m.X >= 0 ? 1 : -1) * (m.Y <= 0 ? 1 : -1), rot = sign * Math.abs(m.X * m.Y) * 10;
    // Use the value uncut — like the original, it endlessly approaches 0 and changes a little every frame (if clipped, it would change only one last time and take a different form)
    m.items.forEach((it, i) => { const u = (i + 1) / m.n; it.style.transform = `translate3d(${u * m.X * m.TY}px, ${u * m.Y * m.TY}px, 0) rotate(${rot}deg)`; });
  }));
  const magnets = (root) => $$("[data-um-mag]", root).forEach((box) => {
    if (!pc || reduce || box.dataset.umBound) return;
    box.dataset.umBound = "1";
    const m = { box, items: $$(".-mag", box), pvt: $(".-pvt", box), X: 0, Y: 0, TY: 0, enter: false, view: false, pos: null };
    m.n = m.items.length;
    if (!m.items.length) return;
    // When off-screen, the share is left as is (original IS_VIEW)
    m.io = new IntersectionObserver((es) => es.forEach((e) => (m.view = e.isIntersecting)), { rootMargin: "-10px", threshold: 0 });
    m.io.observe(box);
    box.addEventListener("mouseenter", () => {
      const b = box.getBoundingClientRect(), r = (m.pvt || box).getBoundingClientRect();
      m.pos = { scroll: sc(), x: r.left + r.width / 2, y: r.top + r.height / 2, w: b.width * 0.5, h: b.height * 0.5 };
      m.TY = Math.min(m.pos.h * 0.2, m.pos.w * 0.2, innerWidth * 0.05);
      m.enter = true;
    });
    box.addEventListener("mouseleave", () => { m.enter = false; });
    mags.add(m);
  });

  const init = (c) => {
    // Stamp out the cards first, then attach the underline and magnet
    window.umPage?.[nsOf(c)]?.(c);
    splitTex(c); setDelays(c); bindUl(c); bindArr(c); magnets(c);
    if (document.documentElement.classList.contains("is-siteloaded")) watch(c);
  };
  init(container);

  // Loader — once the document is fully received it lifts away with .6s power2.inOut, and if visible after that, motion is turned on
  const ld = $("#um-ld");
  const loaded = () => {
    scrollTo(0, 0);
    gsap.to(ld, { duration: reduce ? 0 : 0.6, autoAlpha: 0, ease: "power2.inOut", onComplete: () => { ld.remove(); document.documentElement.classList.add("is-siteloaded"); watch($('[data-barba="container"]')); } });
  };
  if (document.readyState === "complete") loaded(); else addEventListener("load", loaded, { once: true });

  if (!window.barba || location.protocol === "file:") return;
  const T = { opacity: reduce ? 0 : 0.4, ease: "power1.inOut" };
  barba.init({
    timeout: 10000,
    prevent: ({ el }) => el.classList?.contains("-nopx") || (el.getAttribute("href") || "").startsWith("#"),
    transitions: [{
      name: "default-transition",
      sync: false,
      leave({ current }) {
        setNav(false);
        setSearch(false);
        current.container.classList.add("is-pe");
        return gsap.to(current.container, { duration: T.opacity, opacity: 0, ease: T.ease });
      },
      enter({ next, trigger }) {
        gsap.set(next.container, { opacity: 0 });
        if (trigger !== "back") { (lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0)); }
        logo.dispatchEvent(new CustomEvent(nsOf(next.container) === "home" ? "fx:unfold" : "fx:fold"));
        init(next.container);
        ScrollTrigger.refresh();
        return gsap.to(next.container, { duration: T.opacity, opacity: 1, ease: T.ease });
      },
    }],
  });
})();
