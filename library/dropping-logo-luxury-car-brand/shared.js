// A device shared by all pages. Header line, menu drawer, cart drawer, cookie window and footer are drawn here as a single set.
// Motion defaults as in the original: curve cubic-bezier(.625,.05,0,1) · text .8s (.018 stagger) · photo .9s · starts at 72% of screen.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("spyker", "M0,0 C0.625,0.05 0,1 1,1");
  gsap.defaults({ ease: "spyker" });
  const BASE = { dur: 0.8, media: 0.9, start: "top 72%", char: 0.018, line: 0.05, item: 0.08 };
  // The original lowers text by its own height (100%). Fallback Korean fonts that sit low overflow the .85 line box by .3em above and below, so widen the mask by .3em and lower the text by that much more
  const DROP = 180;

  // ── Shared pieces (header bar · menu · cart · cookie · footer) ──
  const LOGO = '<svg viewBox="0 0 800 600" aria-hidden="true"><ellipse cx="400" cy="300" rx="150" ry="190" fill="none" stroke="currentColor" stroke-width="14"/><path d="M70 310 C130 300 220 270 280 270 L520 270 C580 270 670 300 730 310" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><path d="M400 150 L400 450" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><ellipse cx="400" cy="300" rx="60" ry="75" fill="currentColor"/></svg>';
  const SOCIAL = ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 6h2V5h-2a3 3 0 0 0-3 3v2H8v3h2v6h3v-6h2l1-3h-3V8Z", "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z", "M3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7Zm7 2v6l5-3-5-3Z", "M14 3h3a4 4 0 0 0 4 4v3a7 7 0 0 1-4-1v6a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3Z", "M4 9h4v11H4V9Zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm5 6h4v2a4 4 0 0 1 7 3v6h-4v-5a2 2 0 0 0-4 0v5h-3V9Z"]
    .map((d, i) => `<a href="#" aria-label="Social ${i + 1}"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="${d}"/></svg></a>`).join("");
  const LINKS = [["index.html", "Menu 1"], ["index.html#product", "Menu 2 — Slightly long name"], ["index.html#heritage", "Menu 3"], ["product.html", "Menu 4"], ["news.html", "Menu 5"], ["article.html", "Menu 6"]];
  const chrome = `
  <div class="s-veil" data-slot="loader" aria-hidden="true"></div>
  <a class="s-logo" href="index.html" aria-label="Back to start" data-turn>${LOGO}<span class="s-logo__lottie" aria-hidden="true"></span></a>
  <header class="s-head" data-slot="nav"><div class="s-head__row">
    <button class="s-icon s-head__menu" type="button" aria-label="Open Menu" aria-expanded="false"><span class="s-icon__lottie" data-lottie="icon-navigation"></span><span class="s-icon__lottie is-light" data-lottie="icon-navigation"></span></button>
    <span class="s-head__slot" aria-hidden="true"></span>
    <div class="s-head__right"><button class="s-icon s-head__cart" type="button" aria-label="Cart, 0 items"><span class="s-icon__lottie" data-lottie="icon-boutique"></span><span class="s-icon__lottie is-light" data-lottie="icon-boutique"></span><span class="s-cart__label" aria-hidden="true">0</span></button></div>
  </div></header>
  <div class="s-nav" data-slot="menu-drawer"><div class="s-nav__backdrop"></div><div class="s-nav__panel" data-lenis-prevent><div class="s-nav__inner">
    <div class="s-nav__list"><ul class="s-nav__links">${LINKS.map(([h, t]) => `<li><a class="s-uline" href="${h}" data-turn>${t}</a></li>`).join("")}</ul><div class="s-nav__social">${SOCIAL}</div></div>
    <div class="s-nav__image s-media"><div class="wf-img" data-label="Menu photo · close-up of leather car seat interior · warm light · landscape 3:2" style="position:absolute;inset:0;height:100%"></div></div>
  </div></div></div>
  <div class="s-cart" data-slot="cart-drawer" aria-hidden="true"><div class="s-cart__backdrop"></div><aside class="s-cart__panel" aria-label="Cart">
    <div class="s-cart__top"><p class="s-eyebrow" data-label="Your cart drawer name in English here">Shopping bag</p><button class="s-cart__close" type="button" aria-label="Close"><span data-lottie="icon-close" style="display:block;width:100%;height:100%"></span></button></div>
    <div class="s-cart__empty"><div class="s-media"><div class="wf-img" data-label="Empty shopping cart photo · Books and props still life · Gray background · Landscape 4:3" style="position:absolute;inset:0;height:100%"></div></div><p class="s-eyebrow" data-label="Your empty cart small English title here">Small eyebrow</p><p class="s-cart__title" data-label="Your English title for an empty cart here">Your bag is empty</p><a class="s-btn" href="product.html" data-turn data-label="Your English button text to return to the shop here"><span class="s-btn__label">See the products</span></a></div>
  </aside></div>
  <div class="s-cookie" data-slot="cookie-banner" hidden><h2>Your cookie notice title in two lines here.</h2><p>Your cookie notice goes here. In about three lines, say that essential cookies are always on while analytics cookies are optional. <a class="s-cookie__link" href="#">Cookie Policy</a></p><div class="s-cookie__row" data-label="Your English cookie decline and accept button text goes here"><button class="s-btn s-cookie__btn" type="button" data-cookie="no"><span class="s-btn__label">Decline</span></button><button class="s-btn s-cookie__btn" type="button" data-cookie="yes"><span class="s-btn__label">Accept</span></button></div><button class="s-cookie__more" type="button">Settings</button></div>
  <div class="s-turn" data-slot="page-transition" aria-hidden="true"><span class="s-turn__logo" data-lottie="logo-reveal"></span></div>`;
  const footer = `
  <footer class="s-foot" data-slot="footer">
    <div class="s-foot__top"><div class="s-foot__logo"><a href="index.html" aria-label="Back to start" data-turn>${LOGO}</a></div>
      <div class="s-foot__main"><div class="s-foot__cols">
        <ul class="s-foot__nav">${LINKS.map(([h, t]) => `<li><a class="s-uline" href="${h}" data-turn>${t}</a></li>`).join("")}</ul>
        <div class="s-foot__small"><div><button class="s-uline s-foot__btn" type="button" data-cookie-open>Policy 1</button><a class="s-uline" href="#">Policy 2</a><a class="s-uline" href="#">Policy 3</a></div><div><a class="s-uline" href="#">Get News</a><a class="s-uline" href="#">Group board</a></div></div>
      </div><div class="s-foot__social">${SOCIAL}</div></div></div>
    <div class="s-foot__rule"></div>
    <div class="s-foot__bottom"><a class="s-uline" href="#">Get in touch</a><a class="s-uline" href="#">hello@example.com</a><span>Press contact:<br><a class="s-uline" href="#">press@example.com</a></span><span>Your HQ name here<br>Your one-line address, 0000 City here<br>T +00 000 000 0000</span><span>© 0000 Your Company Name Here. All rights reserved.<br>Maker credit</span></div>
  </footer>`;
  document.body.insertAdjacentHTML("afterbegin", chrome);
  document.querySelector(".s-page")?.insertAdjacentHTML("beforeend", footer);

  // ── Lottie: play a marker range by name ──
  const anims = new Map();
  const lazyLottie = document.body.dataset.loader === "short";
  const make = (el) => {
    const data = window.SPY_LOTTIE?.[el.dataset.lottie];
    if (!data || !window.lottie || anims.has(el)) return;
    const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(data)) });
    a.goToAndStop(0, true);
    anims.set(el, a);
  };
  document.querySelectorAll("[data-lottie]").forEach((el) => { if (!(lazyLottie && el.closest(".s-cart"))) make(el); });
  const lazyClose = () => document.querySelectorAll(".s-cart [data-lottie]").forEach(make);
  const seg = (el, from, to, lag = 0) => {
    [].concat(el).forEach((one) => {
      const a = anims.get(one);
      if (!a) return;
      if (reduce) { a.goToAndStop(to, true); return; }
      if (lag && !one.offsetWidth) gsap.delayedCall(lag, () => a.playSegments([from, to], true));
      else a.playSegments([from, to], true);
    });
  };
  const frameTo = (el, from, to, dur, done) => {
    const a = anims.get(el), s = { f: from };
    if (!a || reduce) { a?.goToAndStop(to, true); done?.(); return null; }
    return gsap.to(s, { f: to, duration: dur, ease: "none", onUpdate: () => a.goToAndStop(s.f, true), onComplete: done });
  };

  // ── Smooth scroll: Lenis 1.3.25 · lerp .125 · anchors · GSAP ticker ──
  const lenis = (window.lenis = new Lenis({ lerp: 0.125, anchors: true, autoToggle: true, syncTouch: false, autoRaf: false }));
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ── Header row: always visible at the top (50px), hides (.3s) after scrolling down more than 50px and returns (.4s) after scrolling up more than 50px ──
  const head = document.querySelector(".s-head"), logo = document.querySelector(".s-logo"), slot = head.querySelector(".s-head__slot");
  const hero = document.querySelector("[data-head-clear]");
  let shown = true, up = 0, down = 0, last = 0, locked = false;
  const clearNow = () => !!hero && scrollY < hero.offsetTop + hero.offsetHeight - head.offsetHeight && !locked;
  const paint = () => { const c = clearNow(), over = !!hero && scrollY < hero.offsetTop + hero.offsetHeight - head.offsetHeight; head.classList.toggle("is-clear", over); head.classList.toggle("is-lighticons", c); logo.classList.toggle("is-light", c); };
  const showHead = (on) => {
    if (on === shown) return;
    shown = on;
    gsap.to([head, logo], { y: on ? 0 : -head.offsetHeight, opacity: on ? 1 : 0, duration: reduce ? 0 : on ? 0.4 : 0.3, overwrite: "auto" });
  };
  lenis.on("scroll", ({ scroll }) => {
    const d = scroll - last;
    last = scroll;
    paint();
    if (locked) return;
    if (scroll <= 50) { up = down = 0; showHead(true); return; }
    if (d > 0) { down += d; up = 0; if (down > 50) showHead(false); } else if (d < 0) { up -= d; down = 0; if (up > 50) showHead(true); }
  });
  paint();
  const placeLogo = () => { const r = slot.getBoundingClientRect(), h = (r.width * 600) / 800; gsap.set(logo, { top: r.top + (r.height - h) / 2, left: r.left, width: r.width, height: h }); };

  // ── Text rise, photo reveal, buttons ──
  // Bind words so English placeholder text doesn’t break mid-word (smartWrap) — splitting only by letters lets lines break between any letters.
  const splitChars = (el) => new SplitText(el, { type: "chars", charsClass: "s-char", mask: "chars", smartWrap: true }).chars;
  function reveal(scope = document) {
    if (reduce) return;
    scope.querySelectorAll("[data-reveal]").forEach((el) => {
      const kind = el.dataset.reveal, delay = +(el.dataset.delay || 0), start = el.dataset.start || BASE.start, auto = el.hasAttribute("data-now");
      // data-now is the hero text: counting starts when the loader lifts, not on scroll
      const fire = (tl) => (auto ? (root.classList.contains("is-ready") ? tl.play() : ready.push(() => tl.play())) : ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => tl.play() }));
      if (kind === "title" || kind === "up") {
        const lines = el.children.length ? [...el.children] : [el];
        const tl = gsap.timeline({ paused: true, delay: kind === "up" ? delay || 0.15 : delay });
        lines.forEach((line, i) => tl.from(splitChars(line), { yPercent: DROP, duration: kind === "up" ? 0.6 : +(el.dataset.dur || BASE.dur), stagger: kind === "up" ? 0.005 : BASE.char }, i * BASE.line));
        fire(tl);
      } else if (kind === "body") {
        const lines = new SplitText(el, { type: "lines", linesClass: "s-line" }).lines;
        const tl = gsap.timeline({ paused: true, delay }).from(lines, { opacity: 0, duration: BASE.dur, stagger: BASE.line });
        fire(tl);
      } else if (kind === "media") {
        const inner = el.querySelector(".s-media__inner") || el.firstElementChild;
        const tl = gsap.timeline({ paused: true, delay })
          .fromTo(el, { clipPath: "inset(20% 20% 20% 20%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: BASE.media }, 0)
          .fromTo(inner, { scale: 1.1 }, { scale: 1, duration: BASE.media }, 0);
        fire(tl);
      } else if (kind === "items") {
        const tl = gsap.timeline({ paused: true, delay }).fromTo([...el.children], { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: BASE.dur, stagger: BASE.item });
        fire(tl);
      } else if (kind === "btn") {
        const label = el.querySelector(".s-btn__label > span");
        const tl = gsap.timeline({ paused: true, delay }).fromTo(el, { clipPath: "inset(0 50% 0 50%)" }, { clipPath: "inset(0 0% 0 0%)", duration: 0.7 }, 0);
        if (label) tl.from(label.querySelectorAll(".s-char"), { yPercent: 100, duration: 0.4, stagger: BASE.char - 0.008 }, 0.15);
        fire(tl);
      }
    });
  }
  // Button text in two sets: on hover the front set exits upward and the back set rises from below (.32s · .006 stagger)
  function buttons(scope = document) {
    scope.querySelectorAll(".s-btn__label").forEach((label) => {
      if (label.dataset.ready) return;
      label.dataset.ready = "1";
      const text = label.textContent.trim();
      label.innerHTML = `<span>${text}</span><span aria-hidden="true">${text}</span>`;
      const [a, b] = [...label.children].map((s) => splitChars(s));
      const btn = label.closest(".s-btn");
      if (!btn || reduce || !fine) return;
      // Original as a single timeline: front set 0 → −110% (.32s · .006 stagger), then after .12s the back set 110% → 0. On release it rewinds.
      gsap.set(b, { yPercent: 110 });
      const tl = gsap.timeline({ paused: true })
        .fromTo(a, { yPercent: 0 }, { yPercent: -110, duration: 0.32, stagger: BASE.char - 0.012 }, 0)
        .fromTo(b, { yPercent: 110 }, { yPercent: 0, duration: 0.32, stagger: BASE.char - 0.012 }, 0.12);
      // If an arrow exists, swap on the same timeline — the current one → 38px right and fades out, .12s later the new one ← 38px from the left (.35s)
      const icons = btn.querySelectorAll(".s-btn__icon > span");
      if (icons.length === 2) {
        gsap.set(icons[1], { autoAlpha: 0, x: -38 });
        tl.fromTo(icons[0], { autoAlpha: 1, x: 0 }, { autoAlpha: 0, x: 38, duration: 0.35 }, 0).fromTo(icons[1], { autoAlpha: 0, x: -38 }, { autoAlpha: 1, x: 0, duration: 0.35 }, 0.12);
      }
      btn.addEventListener("pointerenter", () => tl.play(0));
      btn.addEventListener("pointerleave", () => tl.reverse());
    });
  }
  // Inner parallax within photo cell: data-parallax="Start y, End y"(px) — from when the cell’s top edge touches the bottom of the screen until its bottom edge passes the top
  function parallax(scope = document) {
    if (reduce) return;
    scope.querySelectorAll("[data-parallax]").forEach((el) => {
      const [a, b] = el.dataset.parallax.split(",").map(Number);
      gsap.fromTo(el, { y: a }, { y: b, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top 100%", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  }

  // ── Menu drawer: the panel descends from the top in .8s, after .3s the links rise 12px with a .07 stagger. Closing lifts it in .5s ──
  const nav = document.querySelector(".s-nav"), navBtn = head.querySelector(".s-head__menu"), navIcon = [...navBtn.querySelectorAll("[data-lottie]")];
  const navPanel = nav.querySelector(".s-nav__panel"), navBack = nav.querySelector(".s-nav__backdrop");
  let navOpen = false, navTl = null;
  const setNav = (on) => {
    if (on === navOpen) return;
    navOpen = on;
    navBtn.setAttribute("aria-expanded", String(on));
    navBtn.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    seg(navIcon, on ? 60 : 110, on ? 100 : 165);
    navTl?.kill();
    const links = nav.querySelectorAll(".s-nav__links li"), social = nav.querySelectorAll(".s-nav__social a"), img = nav.querySelector(".s-nav__image");
    if (on) {
      locked = true; paint(); lenis.stop();
      nav.classList.add("is-open");
      navTl = gsap.timeline()
        .fromTo(navBack, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.55 })
        .fromTo(navPanel, { yPercent: -100 }, { yPercent: 0, duration: reduce ? 0 : 0.8 }, "<")
        .fromTo(links, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.07 }, "<+0.3")
        .fromTo(img, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 }, "<")
        .fromTo(social, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05 }, "<");
    } else {
      navTl = gsap.timeline({ onComplete: () => { nav.classList.remove("is-open"); locked = false; paint(); lenis.start(); } })
        .to(navPanel, { yPercent: -100, duration: reduce ? 0 : 0.5 })
        .to(navBack, { opacity: 0, duration: reduce ? 0 : 0.4 }, "<");
    }
  };
  navBtn.addEventListener("click", () => {
    const want = !navOpen;
    if (want) gsap.set(nav.querySelector(".s-nav__image"), { scale: 1, opacity: 0 });
    queueMicrotask(() => setNav(want));
  });
  navBack.addEventListener("click", () => setNav(false));

  // ── Cart drawer: a face cut off at the right edge opens in .7s and the backdrop fades in over .6s ──
  const cart = document.querySelector(".s-cart"), cartBtn = head.querySelector(".s-head__cart"), cartIcon = [...cartBtn.querySelectorAll("[data-lottie]")];
  const cartPanel = cart.querySelector(".s-cart__panel"), cartBack = cart.querySelector(".s-cart__backdrop"), closeBtn = cart.querySelector(".s-cart__close"), closeIcon = closeBtn.querySelector("[data-lottie]");
  let cartOpen = false, closeReady = false, cartTitle = null;
  const setCart = (on) => {
    if (on === cartOpen) return;
    cartOpen = on;
    cart.setAttribute("aria-hidden", String(!on));
    const d = reduce ? 0 : 0.7;
    if (on) {
      lenis.stop();
      cart.classList.add("is-open");
      gsap.fromTo(cartBack, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.6, ease: "power2.out" });
      // Small text in the drawer header rises one character at a time from .62s after the panel opens
      if (!reduce && cartTitle) gsap.fromTo(cartTitle, { yPercent: 100 }, { yPercent: 0, duration: 0.4, stagger: BASE.char, delay: 0.62 });
      // Drawer button letters rise one by one over .133s starting .57s after the press (fit by measuring the original’s 16-letter button — the last letter’s timing matches even if the letter count differs)
      const shopChars = cart.querySelectorAll(".s-cart__empty .s-btn__label > span:first-child .s-char");
      if (!reduce && shopChars.length) gsap.fromTo(shopChars, { yPercent: 110 }, { yPercent: 0, duration: 0.35, stagger: { amount: 0.133 }, delay: 0.49 });
      gsap.fromTo(cartPanel, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: d });
      seg(closeIcon, 0, 111);
      gsap.fromTo(cart.querySelector(".s-cart__empty .wf-img"), { scale: 1.1 }, { scale: 1, duration: reduce ? 0 : 0.9, delay: 0.085 });
      gsap.delayedCall(1.85, () => (closeReady = true));
    } else {
      gsap.to(cartPanel, { clipPath: "inset(0 0 0 100%)", duration: d });
      gsap.to(cartBack, { opacity: 0, duration: d, onComplete: () => { cart.classList.remove("is-open"); lenis.start(); } });
    }
  };
  cartBtn.addEventListener("click", () => {
    gsap.set(cartPanel, { clipPath: "inset(0 0 0 100%)" });
    gsap.set(cart.querySelector(".s-cart__title"), { opacity: 1 });
    cartTitle ||= splitChars(cart.querySelector(".s-cart__top .s-eyebrow"));
    closeReady = false;
    lazyClose();
    queueMicrotask(() => setCart(true));
  });
  closeBtn.addEventListener("click", () => setCart(false));
  cartBack.addEventListener("click", () => setCart(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { setCart(false); setNav(false); } });
  if (fine) {
    // Empty cart: the number is hidden, and on hover the panel grows 1.12x and the number turns on at .335s. On release it rewinds —
    // The original: .43s after release the number goes out, .1s later the panel starts shrinking, so rewind length is set to .77s (measured to match)
    const label = cartBtn.querySelector(".s-cart__label");
    gsap.set(label, { autoAlpha: 0 });
    const hoverTl = gsap.timeline({ paused: true })
      .to(cartIcon, { scale: 1.12, duration: 0.32 }, 0)
      .set(label, { autoAlpha: 1 }, 0.335)
      .to({}, { duration: 0.435 }, 0.335);
    cartBtn.addEventListener("pointerenter", () => { seg(cartIcon, 110, 140, 0.016); hoverTl.play(); });
    cartBtn.addEventListener("pointerleave", () => { seg(cartIcon, 170, 200, 0.067); hoverTl.reverse(); });
    // The close Lottie interaction reaction starts only after drawing (111 frames) ends — so a drawer opening under the cursor doesn’t cut the drawing short
    closeBtn.addEventListener("pointerenter", () => closeReady && seg(closeIcon, 121, 151));
    closeBtn.addEventListener("pointerleave", () => closeReady && seg(closeIcon, 177, 213));
  }

  // ── Cookie Window ──
  const cookie = document.querySelector(".s-cookie");
  const cookieShow = () => { if (localStorage.getItem("spy-cookie")) return; cookie.hidden = false; gsap.fromTo(cookie, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: reduce ? 0 : 0.6 }); };
  // Footer ”Policy 1” (original cookie policy button) reopens the cookie window
  document.querySelectorAll("[data-cookie-open]").forEach((b) => b.addEventListener("click", () => { localStorage.removeItem("spy-cookie"); cookie.style.pointerEvents = ""; gsap.set(cookie, { opacity: 1 }); cookieShow(); }));
  cookie.querySelectorAll("[data-cookie]").forEach((b) => b.addEventListener("click", () => { localStorage.setItem("spy-cookie", b.dataset.cookie); gsap.to(cookie, { y: 20, opacity: 0, duration: reduce ? 0 : 0.5, onComplete: () => (cookie.style.pointerEvents = "none") }); }));

  // ── Loader: the logo Lottie in the middle of a white curtain draws in 1s, rests .2s, then shrinks to the header logo spot over .9s while the curtain lifts up ──
  // When arriving from our own pages, a transition curtain replaces the loader (logo Lottie reversed .62s → curtain .32s)
  const veil = document.querySelector(".s-veil"), logoLottie = logo.querySelector(".s-logo__lottie"), logoSvg = logo.querySelector("svg");
  const turn = document.querySelector(".s-turn"), turnLogo = turn.querySelector("[data-lottie]");
  const ready = [];
  const done = () => { root.classList.add("is-ready"); ready.splice(0).forEach((fn) => fn()); cookieShow(); };
  function boot() {
    const mode = sessionStorage.getItem("spy-turn"), viaTurn = !!mode;
    sessionStorage.removeItem("spy-turn");
    if (reduce || viaTurn) {
      veil.hidden = true;
      placeLogo();
      if (mode === "none") done();
      else if (viaTurn && !reduce && mode === "quick") {
        turn.classList.add("is-on");
        gsap.fromTo(turn, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.5, onComplete: () => { turn.classList.remove("is-on"); gsap.set(turn, { autoAlpha: 1 }); } });
        gsap.delayedCall(0.1, done);
      } else if (viaTurn && !reduce) {
        turn.classList.add("is-on");
        anims.get(turnLogo)?.goToAndStop(81, true);
        frameTo(turnLogo, 81, 0, 0.62, () => gsap.to(turn, { autoAlpha: 0, duration: 0.32, onComplete: () => { turn.classList.remove("is-on"); gsap.set(turn, { autoAlpha: 1 }); } }));
        gsap.delayedCall(0.3, done);
      } else done();
      return;
    }
    if (document.body.dataset.loader === "short") {
      placeLogo();
      gsap.to(veil, { yPercent: -100, duration: 0.6, onComplete: () => (veil.hidden = true) });
      gsap.delayedCall(0.2, done);
      return;
    }
    lenis.stop();
    const w = 280, h = w / (800 / 600);
    gsap.set(logo, { top: (innerHeight - h) / 2, left: (innerWidth - w) / 2, width: w, height: h, color: "inherit" });
    logoSvg.style.opacity = "0";
    const go = () => gsap.delayedCall(0.2, () => {
      logoSvg.style.opacity = "1";
      gsap.set(logoLottie, { autoAlpha: 0 });
      const r = slot.getBoundingClientRect(), sh = (r.width * 600) / 800;
      gsap.to(logo, { top: r.top + (r.height - sh) / 2, left: r.left, width: r.width, height: sh, duration: 0.9 });
      gsap.to(veil, { yPercent: -100, duration: 0.9, onComplete: () => { veil.hidden = true; lenis.start(); } });
      gsap.delayedCall(0.35, done);
    });
    if (!anims.get(logoLottie)) {
      const a = lottie.loadAnimation({ container: logoLottie, renderer: "svg", loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(window.SPY_LOTTIE["logo-reveal"])) });
      anims.set(logoLottie, a);
    }
    frameTo(logoLottie, 0, 81, 1, go);
  }
  // Transition: clicking one of our page links covers the screen with a white curtain in .32s, the logo Lottie starts drawing at .22s and takes .62s, then it navigates
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-turn]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    if (reduce) { location.href = url.href; return; }
    // Original transition branches: shop → product only a quick curtain (quick .2s · arrive .5s), product → shop with no curtain (none), the rest use the logo Lottie curtain
    const quick = a.dataset.turn === "quick";
    if (a.dataset.turn === "none") { sessionStorage.setItem("spy-turn", "none"); location.href = url.href; return; }
    sessionStorage.setItem("spy-turn", quick ? "quick" : "1");
    turn.classList.add("is-on");
    if (quick) { gsap.set(turnLogo, { autoAlpha: 0 }); gsap.fromTo(turn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, onComplete: () => (location.href = url.href) }); return; }
    gsap.set(turnLogo, { autoAlpha: 1 });
    anims.get(turnLogo)?.goToAndStop(0, true);
    gsap.timeline().fromTo(turn, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.32 }).add(() => frameTo(turnLogo, 0, 81, 0.62, () => (location.href = url.href)), 0.22);
  });

  addEventListener("resize", () => { if (root.classList.contains("is-ready")) placeLogo(); });
  window.S = { reduce, fine, BASE, lenis, reveal, buttons, parallax, splitChars, onReady: (fn) => (root.classList.contains("is-ready") ? fn() : ready.push(fn)), seg, anims };
  seg(navIcon, 10, 40);
  seg(cartIcon, 18, 60);
  boot();
  (document.fonts?.ready || Promise.resolve()).then(() => { buttons(); reveal(); parallax(); });
})();
