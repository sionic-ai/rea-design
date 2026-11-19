// Cross-page parts — header, mega menu, drawers (menu, cart), cursor circle, footer, Lenis, page transition, wordmark fitting.
// The same markup for every page is kept here as one set and slotted into the slots (data-za-*)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PC = "(min-width: 769px)";

  const ARROW = '<svg viewBox="0 0 20 5" fill="none" stroke="currentColor"><path d="M0 4.5h19L15 .5"/></svg>';
  const TRI = '<svg viewBox="0 0 6 6"><path d="M0 1h6L3 5.5z"/></svg>';
  const CHEV = '<svg viewBox="0 0 6 7" fill="currentColor"><path d="M0 0l6 3.5L0 7z"/></svg>';
  // Original logo is a brand initial monogram — redrawn as a mountain-shaped symbol of the same size
  const LOGO = '<svg class="za-logo" viewBox="0 0 36 23" fill="currentColor" role="img" aria-label="Brand logo mark"><path d="M0 23 9.5 4l5 10L21.5 0 36 23h-6.2L21.5 9.6l-4 8.3-3-5.9L6.2 23z"/></svg>';
  const CARTI = '<svg viewBox="0 0 13 13" fill="none" stroke="currentColor"><path d="M.5 1.5h2l1.6 7.5h7l1.4-5.5H3.2"/><circle cx="5" cy="11.3" r=".9"/><circle cx="10" cy="11.3" r=".9"/></svg>';
  const cur = (p) => (page === p ? " is-current" : "");

  const SUB = `<div class="za-subnav t-nav-sub">
      <a class="za-fade za-nav-en" href="#">EN</a>
      <a class="za-fade za-nav-login" href="#" data-header-menu="login">LOG IN</a>
      <div class="za-cartlink za-fade" data-za-cart data-header-menu="cart"><span>CART</span><span>(<span>0</span>)</span></div>
    </div>`;
  const HEAD = `<div class="za-head__in">
    <div class="za-head__logo"><a href="index.html" data-header-menu="top" style="display:block;width:fit-content">${LOGO}</a></div>
    <nav class="za-head__nav t-nav">
      <a class="za-fade za-nav-products" href="#" data-header-menu="products">PRODUCTS</a>
      <a class="za-fade za-nav-stores" href="#" data-header-menu="stores">STORES</a>
      <a class="za-fade za-nav-journal" href="article.html" data-header-menu="journal">JOURNAL</a>
      <a class="za-fade za-nav-support" href="guide.html" data-header-menu="support">SUPPORT</a>
    </nav>
    <div class="za-head__right">${SUB}
      <button class="za-burger" type="button" aria-label="Open Menu" data-za-menu data-header-menu="hamburger"><i></i><i></i></button>
    </div>
  </div>`;

  const card = (i) => `<li class="splide__slide"><div class="za-card">
      <a class="group" href="#">
        <div class="za-card__img">
          <div class="za-card__tags t-loc-tag"><span class="za-tag">NEW</span>${i % 3 === 2 ? "" : '<span class="za-tag">Online · Direct stores only</span>'}</div>
          <div class="wf-img" data-label="Product cutout · pale gray backdrop · front view 3:2"></div>
        </div>
        <div class="za-card__meta">
          <h3 class="t-ttl-d" data-label="Product English name">ITEM-0${i + 1}</h3>
          <div class="t-loc-small"><div>Product name in Hangul</div><div class="za-card__sub">00,000 won ( tax included )</div></div>
        </div>
      </a>
      <div class="za-swatch t-loc-small"><i></i><span>1 color</span></div>
      <div class="za-cart">${CARTI}<span class="t-link">ADD TO CART</span></div>
    </div></li>`;
  const cards = (n) => Array.from({ length: n }, (_, i) => card(i)).join("");
  const STALK = `<div class="za-stalker" data-fx-part="disc" aria-hidden="true"><div data-fx-part="face"><svg viewBox="0 0 75 75" fill="currentColor"><path d="M51 37 46.5 39.6V34.4z"/><path d="M25 37 29.5 34.4V39.6z"/></svg></div></div>`;

  // ── Header ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) { head.classList.add("za-head"); head.innerHTML = HEAD; }

  // ── Mega menu (wide screens) — stack one more header on top so the header stays visible over the white panel ──
  const mega = document.createElement("div");
  mega.className = "za-mega";
  mega.setAttribute("data-slot", "mega-menu");
  mega.innerHTML = `<div class="za-mega__in">
      <header class="za-head">${HEAD}</header>
      <div class="za-mega__side">
        <h2 class="t-page">PRODUCTS</h2>
        <div class="za-mega__cats t-text">
          <a class="za-fade" href="#">CATEGORY 01</a><a class="za-fade" href="#">CATEGORY 02</a><a class="za-fade" href="#">CATEGORY THREE</a><a class="za-fade" href="#">CATEGORY 04</a><a class="za-fade" href="#">CATEGORY 05</a>
        </div>
        <a class="za-menu__all group t-text" href="#"><span>ALL PRODUCTS</span>${ARROW}</a>
      </div>
      <div style="flex:1;min-width:0">
        <h2 class="t-ttl-b">NEW ARRIVAL</h2>
        <div class="za-mega__row" data-fx="ease-follow-disc" data-fx-ease-follow-disc="dur: 1; ease: power3.out; look: pop; shift-x: 60; shift-y: -60">
          <div class="splide" data-za-splide="mega" aria-label="New product"><div class="splide__track"><ul class="splide__list">${cards(6)}</ul></div></div>
          ${STALK}
        </div>
      </div>
    </div>
    <div class="za-mega__hide" data-za-mega-hide></div>`;

  // ── Drawer (menu · cart) ──
  const modal = document.createElement("div");
  modal.className = "za-modal";
  modal.innerHTML = `<div class="za-modal__inner"><div class="za-modal__body" data-za-body>
      <div class="za-panel" data-panel="menu" data-slot="menu-drawer"><div class="za-menu">
        <div class="za-panel__top">${SUB}<button class="za-pill is-x t-btn" type="button" aria-label="Close" data-za-close><i></i></button></div>
        <div class="za-menu__view t-menu"><div class="za-menu__track" data-za-track>
          <div class="za-menu__col"><div class="za-menu__list">
            <a class="za-fade${cur("home")}" href="index.html">HOME</a>
            <div class="za-menu__more za-fade" data-za-more><span>PRODUCTS</span>${CHEV}</div>
            <a class="za-fade" href="#">STORES</a>
            <a class="za-fade${cur("article")}" href="article.html">JOURNAL</a>
            <a class="za-fade${cur("guide")}" href="guide.html">SUPPORT</a>
            <a class="za-fade" href="#">FAQ</a>
            <a class="za-fade" href="#">MANUAL</a>
          </div></div>
          <div class="za-menu__col">
            <div class="za-menu__more za-menu__back za-fade" data-za-back>${CHEV}<span>BACK</span></div>
            <div class="za-menu__list" style="margin-top:3rem">
              <a class="za-fade" href="#">CATEGORY 01</a><a class="za-fade" href="#">CATEGORY 02</a><a class="za-fade" href="#">CATEGORY THREE</a><a class="za-fade" href="#">CATEGORY 04</a><a class="za-fade" href="#">CATEGORY 05</a>
            </div>
            <a class="za-menu__all group t-text" href="#"><span>ALL PRODUCTS</span>${ARROW}</a>
          </div>
        </div></div>
        <div class="za-menu__foot">
          <div class="za-menu__links t-menu-small">
            <a class="za-fade" href="#">CORPORATE</a><a class="za-fade${cur("recruit")}" href="recruit.html">RECRUIT</a><a class="za-fade" href="#">PRIVACY POLICY</a><a class="za-fade" href="guide.html">SHOPPING GUIDE</a><a class="za-fade" href="#">LAW</a><a class="za-fade" href="#">TERMS OF USE</a>
          </div>
          <div class="za-menu__sns t-btn"><a class="za-pill is-sns" href="#">Ig</a><a class="za-pill is-sns" href="#">X</a><a class="za-pill is-sns" href="#">Fb</a></div>
        </div>
      </div></div>
      <div class="za-panel" data-panel="cart" data-slot="cart-drawer"><div class="za-cartpanel">
        <div class="za-cartpanel__top"><div class="za-subnav t-nav-sub"><a class="za-fade" href="#">EN</a><a class="za-fade" href="#">LOG IN</a></div><button class="za-pill is-x t-btn" type="button" aria-label="Close" data-za-close><i></i></button></div>
        <div class="za-cartpanel__empty">${CARTI.replace("<svg", '<svg style="width:3rem;height:3rem"')}<p class="t-ttl-b">YOUR CART IS<br>EMPTY</p><a class="za-pill t-btn" href="#">ALL PRODUCTS</a></div>
      </div></div>
    </div></div>
    <div class="za-modal__bg" data-za-bg></div>`;

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("za-foot");
    foot.innerHTML = `<small class="za-foot__mark"><span class="za-mark" data-za-mark="©WORDMARK" data-label="© + Brand wordmark in Latin letters (9 cells in the original)"></span></small>
      <div class="za-foot__row">
        <div class="za-foot__top"><span data-za-top style="display:block;width:fit-content;cursor:pointer" aria-label="Back to top">${LOGO}</span></div>
        <div class="za-foot__nav t-foot">
          <div><a class="za-fade${cur("home")}" href="index.html">HOME</a><a class="za-fade" href="#">PRODUCTS</a><a class="za-fade" href="#">STORES</a><a class="za-fade${cur("article")}" href="article.html">JOURNAL</a></div>
          <div><a class="za-fade${cur("guide")}" href="guide.html">SUPPORT</a><a class="za-fade" href="#">FAQ</a><a class="za-fade" href="#">MANUAL</a></div>
        </div>
        <div class="za-foot__sub">${SUB.replace(' data-header-menu="login"', "").replace(' data-header-menu="cart"', "")}</div>
      </div>
      <div class="za-foot__bottom">
        <div class="za-foot__links t-menu-small"><a class="za-fade" href="#">CORPORATE</a><a class="za-fade${cur("recruit")}" href="recruit.html">RECRUIT</a><a class="za-fade" href="#">PRIVACY POLICY</a><a class="za-fade${cur("guide")}" href="guide.html">SHOPPING GUIDE</a><a class="za-fade" href="#">LAW</a><a class="za-fade" href="#">TERMS OF USE</a></div>
        <div class="za-foot__sns t-btn"><a class="za-pill is-sns" href="#">Ig</a><a class="za-pill is-sns" href="#">X</a><a class="za-pill is-sns" href="#">Fb</a></div>
        <div class="za-foot__support"><a class="za-pill t-btn" href="guide.html">SUPPORT</a></div>
      </div>`;
  }
  body.append(mega, modal);
  document.querySelectorAll("[data-za-cards]").forEach((ul) => { ul.innerHTML = cards(+ul.dataset.zaCards || 6); });
  document.querySelectorAll("[data-za-stalk]").forEach((z) => z.insertAdjacentHTML("beforeend", STALK));

  // ── Header fill — measure |background − text color| from the skin value so the difference-blended header becomes exactly the text color over the background ──
  const rgbOf = (v) => { const p = document.createElement("i"); p.style.color = `var(${v})`; body.append(p); const m = getComputedStyle(p).color.match(/[\d.]+/g).map(Number); p.remove(); return m; };
  const paintDiff = () => { const b = rgbOf("--kf-bg"), k = rgbOf("--kf-ink"); document.documentElement.style.setProperty("--site-diff", `rgb(${b.slice(0, 3).map((c, i) => Math.abs(c - k[i])).join(" ")})`); };
  paintDiff();

  // ── Smooth scroll — original Lenis 1.0.34 · lerp .07 · driven by the GSAP ticker ──
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.07, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.zaScroll = { stop: () => lenis?.stop(), start: () => lenis?.start(), lenis };

  // ── Drawer — menu and cart open from the right edge with clip-path in .5s (open power2.inOut · close power1.inOut) ──
  const mbody = modal.querySelector("[data-za-body]");
  const track = modal.querySelector("[data-za-track]");
  const SHUT = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)", OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  const resetMenu = () => track.removeAttribute("style");
  const show = (mode, { noTransition = false } = {}) => {
    window.zaScroll.stop();
    body.dataset.modal = mode;
    // Exactly like the original modal.show — each branch picks its own starting clip, and branches with no set start, like the mega menu, open with no value (straight onto an empty box)
    if (!noTransition) gsap.fromTo(mbody, { "clip-path": () => (mode === "menu" || mode === "cart" ? SHUT : undefined), opacity: () => 1 }, { "clip-path": OPEN, opacity: () => 1, duration: reduce ? 0 : 0.5, ease: "power2.inOut" });
  };
  const hide = (mode, { noTransition = false, then } = {}) => {
    window.zaScroll.start();
    if (noTransition || mode === "megaMenu") { delete body.dataset.modal; then?.(); return; }
    gsap.to(mbody, { clipPath: SHUT, duration: reduce ? 0 : 0.5, ease: "power1.inOut", onComplete: () => { delete body.dataset.modal; then?.(); } });
  };
  window.zaModal = { show, hide };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-za-menu]")) show("menu");
    else if (e.target.closest("[data-za-cart]")) { resetMenu(); show("cart"); }
    else if (e.target.closest("[data-za-close]")) hide(body.dataset.modal, { then: resetMenu });
    else if (e.target.closest("[data-za-bg]")) hide(body.dataset.modal || "", { then: resetMenu });
    else if (e.target.closest("[data-za-more]")) gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: 0.5, ease: "power2.inOut" });
    else if (e.target.closest("[data-za-back]")) gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: 0.5, ease: "power2.inOut" });
    else if (e.target.closest("[data-za-top]")) (lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && body.dataset.modal) hide(body.dataset.modal, { then: resetMenu }); });

  // ── Mega menu — opens when the pointer reaches PRODUCTS, closes right away when it moves to other header menus or the empty space below ──
  gsap.matchMedia().add(PC, () => {
    const list = mega.querySelector(".splide__list");
    const enter = (e) => {
      const mode = e.currentTarget.dataset.headerMenu;
      if (mode === "products") { if (list) list.style.transform = "translateX(0)"; show("megaMenu"); }
      else if (body.dataset.modal === "megaMenu") hide("megaMenu", { noTransition: true });
    };
    const items = [...document.querySelectorAll("[data-header-menu]")];
    items.forEach((m) => m.addEventListener("mouseenter", enter));
    const hz = mega.querySelector("[data-za-mega-hide]");
    const off = () => hide("megaMenu", { noTransition: true });
    hz.addEventListener("mouseenter", off);
    return () => { items.forEach((m) => m.removeEventListener("mouseenter", enter)); hz.removeEventListener("mouseenter", off); };
  });

  // ── Product row — the original Splide free drag (cell 37.5rem · gap 3rem, phone 28rem · .5rem) ──
  document.querySelectorAll("[data-za-splide]").forEach((el) => {
    const isMega = el.dataset.zaSplide === "mega";
    new Splide(el, { arrows: false, pagination: false, fixedWidth: isMega ? "37.6rem" : "37.5rem", gap: "3rem", flickMaxPages: 1, drag: "free", breakpoints: { 768: { fixedWidth: "28rem", gap: "0.5rem" } } }).mount();
  });

  // ── Wordmark — each letter gets a cell and the letter’s ink box is fit exactly to the cell height. Spare line width is spread evenly, and a shortage is tightened evenly ──
  const cvs = document.createElement("canvas").getContext("2d");
  const fitMark = (el) => {
    const text = el.dataset.zaMark;
    if (!el.childElementCount) el.innerHTML = [...text].map((c) => `<span class="za-mark__ch"><svg aria-hidden="true"><text>${c}</text></svg></span>`).join("");
    el.setAttribute("aria-label", text);
    const chs = [...el.children];
    const cs = getComputedStyle(chs[0].querySelector("text"));
    cvs.font = `${cs.fontWeight} 100px ${cs.fontFamily}`;
    const H = chs[0].getBoundingClientRect().height, W = el.clientWidth;
    if (!H || !W) return;
    const boxes = [...text].map((c) => { const m = cvs.measureText(c); return { l: m.actualBoundingBoxLeft, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, a: m.actualBoundingBoxAscent, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent }; });
    const widths = boxes.map((b) => (b.w / b.h) * H);
    const sum = widths.reduce((s, v) => s + v, 0), minGap = H * 0.03;
    const squeeze = Math.min(1, (W - minGap * (chs.length - 1)) / sum);
    const gap = (W - sum * squeeze) / Math.max(1, chs.length - 1);
    chs.forEach((ch, i) => {
      const b = boxes[i], svg = ch.firstElementChild;
      svg.setAttribute("viewBox", `${-b.l} ${-b.a} ${b.w} ${b.h}`);
      svg.setAttribute("preserveAspectRatio", "none");
      svg.firstElementChild.setAttribute("font-size", "100");
      ch.style.width = `${widths[i] * squeeze}px`;
      ch.style.marginRight = i < chs.length - 1 ? `${gap}px` : "0";
    });
  };
  const marks = [...document.querySelectorAll("[data-za-mark]")];
  const fitAll = () => marks.forEach(fitMark);
  fitAll();
  document.fonts?.ready.then(() => { fitAll(); ScrollTrigger.refresh(); });
  const ro = new ResizeObserver(fitAll);
  marks.forEach((m) => ro.observe(m));

  // Footer © wordmark — when it reaches 80% of the screen, letters rise from below one by one at .06s steps (.5s power3.out)
  const footMark = foot?.querySelector(".za-mark");
  if (footMark) {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(footMark.children, { yPercent: 100 }, { yPercent: 0, scrollTrigger: { trigger: footMark, start: "top 80%" }, stagger: { each: 0.06 }, ease: "power3.out" });
    });
  }

  // ── Page transition — on press, the link is locked and is-leaving is added (body fades out in .35s), then it navigates after 15ms. On return (bfcache) it is released ──
  // Turns on at DOMContentLoaded like the original — if the first image was drawn before then it appears over .7s, otherwise it stands immediately
  document.addEventListener("DOMContentLoaded", () => body.classList.add("is-visible"));
  const links = () => [...document.querySelectorAll('a:not([target]):not([href^="mailto:"]):not([href*="#"])')];
  addEventListener("pageshow", () => { body.classList.remove("is-leaving"); links().forEach((a) => a.style.removeProperty("pointer-events")); });
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a:not([target]):not([href^="mailto:"]):not([href*="#"])');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    a.style.pointerEvents = "none";
    const href = a.getAttribute("href") || "index.html";
    body.classList.add("is-leaving");
    setTimeout(() => { location.href = href; }, 15);
  });
  addEventListener("load", () => ScrollTrigger.refresh());
})();
