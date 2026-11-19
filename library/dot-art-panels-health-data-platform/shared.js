// Brand site rebuild — header (big menu panel · phone menu) · footer · buttons · Lenis · text reveal · strips · Swiper · accordion are shared by all pages
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const ICON = {
    logo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 4 8.5v7L12 22l8-6.5v-7L12 2Zm0 4.2 4.6 3.7L12 13.6 7.4 9.9 12 6.2Zm-5.4 7.2 4.4 3.5v2.2l-4.4-3.6v-2.1Zm6.4 5.7v-2.2l4.4-3.5v2.1L13 19.1Z"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m7 10 5 5 5-5"/></svg>',
    arrow: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 7.3h9.3L7.8 3.8l1-1L14.1 8l-5.3 5.3-1-1 3.5-3.6H2Z"/></svg>',
    left: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M14 7.3H4.7l3.5-3.5-1-1L1.9 8l5.3 5.3 1-1-3.5-3.6H14Z"/></svg>',
    up: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 13V3M4 7l4-4 4 4"/></svg>',
    out: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5 11 11 5M6 5h5v5"/></svg>',
  };
  window.zhIcon = ICON;

  // ───── Button: <a data-btn>Text</a> Spreads it out into three dots, background and text layers ─────
  function btn(el) {
    if (el.dataset.built) return;
    el.dataset.built = "1";
    const label = el.textContent.trim();
    el.classList.add("zh-btn");
    el.innerHTML = [3, 2, 1].map((n, k) => `<span class="zh-btn__wrap" style="--p:${2 - k}"><span class="zh-btn__dot is-${n}" style="--i:${2 - k}"></span></span>`).join("")
      + `<span class="zh-btn__bg"></span><span class="zh-btn__inner"><span class="zh-btn__text">${label}</span></span>`;
  }
  function tbtn(el) {
    if (el.dataset.built) return;
    el.dataset.built = "1";
    const label = el.textContent.trim();
    el.classList.add("zh-tbtn");
    el.innerHTML = `<span class="zh-tbtn__label">${label}<span class="zh-tbtn__line"></span><span class="zh-tbtn__fill"></span></span><span class="zh-tbtn__arrow">${ICON.arrow}</span>`;
  }
  window.zhButtons = (root = document) => { $$("[data-btn]", root).forEach(btn); $$("[data-tbtn]", root).forEach(tbtn); };

  // ───── Header ─────
  const MENU = [
    { key: "platform", name: "Platform", cols: [["Platform", ["Menu item 1", "Menu item 2", "Menu item 3"]], ["Resource Bundle", ["Menu item 4", "Menu item 5"]]] },
    { key: "serve", name: "Customer", cols: [["Customer type", ["Menu item 1", "Menu item 2", "Menu item 3", "Menu item 4"]], ["Partner company", ["Menu item 5", "Menu item 6"]]] },
    { key: "solutions", name: "Solution", cols: [["Usage", ["Menu item 1", "Menu item 2", "Menu item 3"]], ["See more", ["Menu item 4", "Menu item 5", "Menu item 6"]]] },
    { key: "company", name: "Company", cols: [["Company", [["Company About", "about.html"], ["Hiring", "recruit.html"], "Press Release"]], ["News", ["Event", "Partner"]]] },
    { key: "resources", name: "Materials", cols: [["Reads", [["Blog", "news.html"], ["Customer case", "article.html"], "Event"]], ["Developer", ["Document", "API"]]] },
  ];
  const link = (x) => (Array.isArray(x) ? x : [x, "#"]);
  function panelHTML(m) {
    const cols = m.cols.map(([t, items]) => `<div class="zh-panel__col" data-menu-fade><div class="zh-panel__title">${t}</div>${items.map((it) => {
      const [n, h] = link(it);
      return `<a class="zh-panel__link" href="${h}"><span class="zh-panel__name">${n}<span class="zh-line"></span></span><span class="zh-panel__desc">Your menu description in one line here</span></a>`;
    }).join("")}</div>`).join("");
    return `<div class="zh-panel" data-nav-content="${m.key}">${cols}<div class="zh-panel__col" data-menu-fade><div class="zh-panel__card"><div class="zh-ph" data-label="Featured post cover photo · medical staff looking at a screen · landscape 16:9"></div><span class="t-sm">Your recommended article title in one line here.</span><span data-tbtn>Read more</span></div></div></div>`;
  }
  function header() {
    const slot = $('[data-slot="header"]');
    if (!slot) return;
    slot.innerHTML = `<div class="zh-nav">
  <nav class="zh-bar" data-menu-wrap>
    <div class="zh-bar__row">
      <a class="zh-logo" href="index.html" data-menu-logo aria-label="First Page"><span class="zh-logo__icon">${ICON.logo}</span><span class="zh-logo__word" data-label="Your brand English wordmark here">Logo</span></a>
      <ul class="zh-menu">${MENU.map((m) => `<li><button class="zh-menu__link is-drop" type="button" data-dropdown-toggle="${m.key}" aria-expanded="false">${m.name}<span class="zh-menu__chev">${ICON.chev}</span></button></li>`).join("")}<li><a class="zh-menu__link" href="#">Inquiry</a></li></ul>
      <div class="zh-bar__end"><a href="#" data-btn>Request a Demo</a><button class="zh-burger" type="button" data-burger-toggle aria-expanded="false">Menu<span class="zh-burger__lines"><i data-burger-line="top"></i><i data-burger-line="mid"></i><i data-burger-line="bot"></i></span></button></div>
    </div>
    <div class="zh-drop" data-dropdown-wrapper><div class="zh-drop__box" data-dropdown-container>${MENU.map(panelHTML).join("")}</div></div>
  </nav>
  <div class="zh-mnav" data-mobile-nav>
    <ul class="zh-mnav__list" data-nav-list>${MENU.map((m) => `<li class="zh-mnav__item" data-nav-list-item><button type="button" data-mobile-toggle="${m.key}">${m.name}${ICON.chev}</button></li>`).join("")}<li class="zh-mnav__item" data-nav-list-item><a href="#">Inquiry</a></li></ul>
    <div class="zh-mnav__foot"><a href="#" data-btn>Request a Demo</a></div>
  </div>
</div>
<div class="zh-backdrop" data-menu-backdrop></div>`;
  }

  // Original mega menu: opens and closes by panel height, and moving to an adjacent item pushes the content 30px in that direction
  function megaNav() {
    const bar = $("[data-menu-wrap]");
    if (!bar) return;
    // Original values. The backdrop is not visible on the original desktop, so it only opens and closes
    const DUR = { bgMorph: 0.4, contentIn: 0.3, contentOut: 0.2, stagger: 0.25, openScale: 0.35, closeScale: 0.25 };
    const box = $("[data-dropdown-container]"), backdrop = $("[data-menu-backdrop]");
    const toggles = $$("[data-dropdown-toggle]"), panels = $$("[data-nav-content]");
    const st = { open: false, active: null, enter: 0, leave: 0, tl: null };
    const panel = (k) => $(`[data-nav-content="${k}"]`, box);
    const fades = (el) => $$("[data-menu-fade]", el);
    const idx = (k) => toggles.findIndex((t) => t.dataset.dropdownToggle === k);
    const stag = (n) => (n <= 1 ? 0 : { amount: DUR.stagger });
    const measure = (el) => { gsap.set(el, { visibility: "visible", position: "relative" }); const h = el.getBoundingClientRect().height; gsap.set(el, { clearProps: "position" }); return h; };
    const kill = () => { st.tl?.kill(); gsap.killTweensOf([box, ...panels]); panels.forEach((p) => gsap.killTweensOf(fades(p))); };
    const resetAll = () => panels.forEach((p) => { gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none", x: 0 }); gsap.set(fades(p), { autoAlpha: 0, x: 0, y: 0 }); });
    const ariaOff = () => toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
    resetAll();
    function open(k) {
      if (st.open && st.active === k) return;
      if (st.open && st.active) return swap(st.active, k);
      const el = panel(k);
      kill();
      resetAll();
      const h = measure(el);
      gsap.set(el, { visibility: "hidden" });
      st.open = true; st.active = k;
      bar.dataset.open = "true";
      ariaOff();
      toggles[idx(k)].setAttribute("aria-expanded", "true");
      backdrop.classList.add("is-on");
      gsap.set(box, { height: 0 });
      const tl = (st.tl = gsap.timeline());
      tl.to(box, { height: h, duration: DUR.openScale, ease: "power3.out" }, 0);
      tl.set(el, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, 0.05);
      const f = fades(el);
      if (f.length) tl.fromTo(f, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: DUR.contentIn, stagger: stag(f.length), ease: "power3.out" }, 0.1);
    }
    function close() {
      if (!st.open) return;
      const el = panel(st.active), f = el ? fades(el) : [];
      kill();
      backdrop.classList.remove("is-on");
      // The chevron returns after the panel is fully folded (as in the original: aria-expanded is released only when folding ends)
      const tl = (st.tl = gsap.timeline({ onComplete() { st.open = false; st.active = null; bar.dataset.open = "false"; ariaOff(); resetAll(); } }));
      if (f.length) tl.to(f, { autoAlpha: 0, y: -4, duration: DUR.contentOut * 0.7, ease: "power2.in" }, 0);
      tl.to(box, { height: 0, duration: DUR.closeScale, ease: "power2.in" }, 0.05);
      if (el) tl.set(el, { visibility: "hidden", opacity: 0, pointerEvents: "none" });
    }
    function swap(from, to) {
      const dir = idx(to) > idx(from) ? 1 : -1;
      const a = panel(from), b = panel(to), fa = fades(a), fb = fades(b);
      kill();
      resetAll();
      const h = measure(b);
      gsap.set(b, { visibility: "hidden" });
      gsap.set(a, { visibility: "visible", opacity: 1, pointerEvents: "auto" });
      gsap.set(fa, { autoAlpha: 1 });
      st.active = to;
      ariaOff();
      toggles[idx(to)].setAttribute("aria-expanded", "true");
      const tl = (st.tl = gsap.timeline());
      if (fa.length) tl.to(fa, { autoAlpha: 0, x: dir * -30, duration: DUR.contentOut, ease: "power2.in" }, 0);
      tl.set(a, { visibility: "hidden", opacity: 0, pointerEvents: "none" }, DUR.contentOut);
      if (fa.length) tl.set(fa, { x: 0 }, DUR.contentOut);
      tl.to(box, { height: h, duration: DUR.bgMorph, ease: "power3.out" }, 0.05);
      tl.set(b, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, DUR.contentOut * 0.5);
      if (fb.length) tl.fromTo(fb, { autoAlpha: 0, x: dir * 30 }, { autoAlpha: 1, x: 0, duration: DUR.contentIn, stagger: stag(fb.length), ease: "power3.out" }, DUR.contentOut * 0.6);
    }
    const clear = () => { clearTimeout(st.enter); clearTimeout(st.leave); };
    toggles.forEach((t) => {
      const k = t.dataset.dropdownToggle;
      t.addEventListener("mouseenter", () => { if (!fine) return; clear(); st.enter = setTimeout(() => open(k), st.open ? 0 : 120); });
      // A panel already opened by hover stays as is on press (original) — only touch screens toggle by pressing
      t.addEventListener("click", () => (st.open && st.active === k ? !fine && close() : open(k)));
    });
    bar.addEventListener("mouseleave", () => { clear(); st.leave = setTimeout(close, 150); });
    bar.addEventListener("mouseenter", () => clearTimeout(st.leave));
    $$(".zh-menu > li > a, .zh-logo, .zh-bar__end", bar).forEach((x) => x.addEventListener("mouseenter", () => { clear(); st.leave = setTimeout(close, 150); }));
    backdrop.addEventListener("click", close);
    addEventListener("keydown", (e) => e.key === "Escape" && close());
  }

  // Phone menu: three lines become an X, the list turns on in .3s with items rising from 12px below at .04s stagger. Pressing an item slides the panel sideways
  function mobileNav() {
    const burger = $("[data-burger-toggle]"), list = $("[data-mobile-nav]");
    if (!burger || !list) return;
    const [top, mid, bot] = ["top", "mid", "bot"].map((k) => $(`[data-burger-line="${k}"]`));
    const items = $$("[data-nav-list-item]", list);
    const logo = $("[data-menu-logo]");
    let opened = false, tl;
    const sub = document.createElement("div");
    sub.className = "zh-mnav__sub";
    sub.innerHTML = `<button type="button" class="zh-mnav__back" data-mobile-back>${ICON.left} Back</button><ul class="zh-mnav__list"></ul>`;
    Object.assign(sub.style, { position: "absolute", inset: "0", padding: "2em 1.5em", background: "inherit", opacity: 0, visibility: "hidden" });
    list.appendChild(sub);
    const back = $("[data-mobile-back]", sub);
    Object.assign(back.style, { display: "flex", gap: ".4rem", alignItems: "center", background: "none", border: 0, font: "inherit", color: "inherit", padding: "0 0 1rem" });
    back.querySelector("svg").style.width = "1rem";
    const burgerTl = (on) => {
      const t = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      if (on) {
        t.to(top, { y: "0.3125em", duration: 0.15 }, 0).to(bot, { y: "-0.3125em", duration: 0.15 }, 0).to(mid, { autoAlpha: 0, duration: 0.1 }, 0.1)
          .to(top, { rotation: 45, duration: 0.2 }, 0.15).to(bot, { rotation: -45, duration: 0.2 }, 0.15);
      } else {
        t.to(top, { rotation: 0, duration: 0.2 }, 0).to(bot, { rotation: 0, duration: 0.2 }, 0)
          .to(top, { y: 0, duration: 0.15 }, 0.15).to(bot, { y: 0, duration: 0.15 }, 0.15).to(mid, { autoAlpha: 1, duration: 0.1 }, 0.15);
      }
      return t;
    };
    function openSub(k) {
      const m = MENU.find((x) => x.key === k);
      $("ul", sub).innerHTML = m.cols.flatMap(([, its]) => its).map((it) => { const [n, h] = link(it); return `<li class="zh-mnav__item" data-menu-fade><a href="${h}">${n}</a></li>`; }).join("");
      const f = $$("[data-menu-fade]", sub);
      const t = gsap.timeline();
      t.to(items, { xPercent: -10, autoAlpha: 0, duration: 0.35, stagger: 0.03, ease: "power2.in" }, 0);
      t.to(logo, { autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0);
      t.set(sub, { autoAlpha: 1, xPercent: 0 }, 0.2);
      t.fromTo(f, { xPercent: 8, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.3, stagger: { amount: 0.25 }, ease: "power3.out" }, 0.25);
    }
    function closeSub() {
      const t = gsap.timeline();
      t.to(sub, { xPercent: 20, autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0);
      t.to(logo, { autoAlpha: 1, duration: 0.25, ease: "power2.out" }, 0.15);
      t.fromTo(items, { xPercent: -10, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.3, stagger: 0.03, ease: "power3.out" }, 0.2);
    }
    burger.addEventListener("click", () => {
      tl?.kill();
      opened = !opened;
      burger.setAttribute("aria-expanded", String(opened));
      document.body.style.overflow = opened ? "hidden" : "";
      tl = gsap.timeline();
      tl.add(burgerTl(opened), 0);
      if (opened) {
        gsap.set([items, sub], { clearProps: "transform" });
        gsap.set(sub, { autoAlpha: 0 });
        tl.to(list, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0);
        tl.fromTo(items, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.04, ease: "power3.out" }, 0.15);
      } else {
        tl.to(list, { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" }, 0.05);
        tl.to(logo, { autoAlpha: 1, duration: 0.2 }, 0.05);
      }
    });
    $$("[data-mobile-toggle]", list).forEach((b) => b.addEventListener("click", () => openSub(b.dataset.mobileToggle)));
    back.addEventListener("click", closeSub);
  }

  // Turns into a white panel after scrolling past 1%
  function baseOnScroll() {
    const bar = $(".zh-bar");
    if (!bar) return;
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.classList.toggle("is-base", max > 0 && (scrollY / max) * 100 >= 1);
    };
    addEventListener("scroll", on, { passive: true });
    on();
  }

  // ───── Footer ─────
  function footer() {
    const slot = $('[data-slot="footer"]');
    if (!slot) return;
    const groups = [["Platform", [["Platform", "#"]]], ["Company", [["Company About", "about.html"], ["Hiring", "recruit.html"]]], ["Customer", [["Menu item 1", "#"], ["Menu item 2", "#"], ["Menu item 3", "#"], ["Menu item 4", "#"]]],
      ["Materials", [["Blog", "news.html"], ["Customer case", "article.html"], ["Event", "#"]]], ["Developer", [["Document", "#", 1], ["API", "#", 1], ["Developer community", "#", 1]]], ["Contact", [["000-000-0000", "#"], ["hello@example.com", "#"], ["Your address first line here<br>Your address second line here", "#", 0, "is-address"]]]];
    slot.innerHTML = `<footer class="zh-foot" data-foot>
  <div class="zh-foot__bg" data-foot-bg></div>
  <div class="zh-foot__top">
    <div class="zh-foot__brand"><a class="zh-logo" href="index.html" aria-label="To the first page"><span class="zh-logo__icon">${ICON.logo}</span><span class="zh-logo__word" data-label="Your brand English wordmark here">Logo</span></a></div>
    <div class="zh-foot__links">${groups.map(([t, ls]) => `<div class="zh-foot__group"><div class="zh-foot__title">${t}</div><ul class="zh-foot__list">${ls.map(([n, h, ext, cls]) => `<li><a class="zh-foot__link ${cls || ""}" href="${h}"><span>${n}<span class="zh-line"></span></span>${ext ? ICON.out : ""}</a></li>`).join("")}</ul></div>`).join("")}</div>
  </div>
  <div class="zh-foot__mq zh-mq" data-mq><div class="zh-mq__slot"><span class="zh-mq__foot" data-label="Your one-line English slogan flowing in the footer here">A big footer line that moves ·</span></div></div>
  <div class="zh-foot__bottom"><span data-label="Your company English name here">© 0000 Company Name. All rights reserved.</span><div class="zh-foot__legal"><a class="zh-foot__link" href="#">Privacy policy</a><a class="zh-foot__link" href="#">Terms of service</a></div></div>
</footer>
<button class="zh-top" type="button" data-back-top aria-label="Back to top">${ICON.up}</button>`;
    const foot = $("[data-foot]"), bg = $("[data-foot-bg]");
    if (!fine) return;
    foot.addEventListener("mousemove", (e) => {
      const r = bg.getBoundingClientRect();
      const m = `radial-gradient(circle 300px at ${e.clientX - r.left}px ${e.clientY - r.top}px, #000 0%, transparent 50%)`; /* Not skin: mask alpha */
      bg.style.opacity = "1";
      bg.style.webkitMaskImage = m;
      bg.style.maskImage = m;
    });
    foot.addEventListener("mouseleave", () => { bg.style.opacity = "0"; });
  }

  // ───── News strip (home · about · below posts) ─────
  const POSTS = [
    ["Company", "News report", "is-dark", "Logo and certification text graphic · deep teal background · 16:10 landscape"],
    ["Company", "News report", "", "Certification badge graphic · Large text on white · Landscape 16:10"],
    ["Company", "Product", "", "Hand holding a stethoscope and tablet · bright exam room · landscape 16:10"],
    ["News report", "Person", "is-dark", "Medical staff looking at a tablet · dark teal half · landscape 16:10"],
    ["Product", "Case study", "", "Team gathered in a meeting room · Natural window light · Landscape 16:10"],
  ];
  function card([a, b, dark, label], i) {
    return `<div class="zh-card"><a class="zh-card__link" href="article.html" aria-label="Read post"></a><div class="zh-card__thumb"><div class="zh-ph ${dark}" data-label="${label}"></div></div><div class="zh-card__tags"><span class="zh-tag">${a}</span><span class="zh-tag">${b}</span></div><h3 class="zh-card__title t-base">Your post title goes here, two lines long ${String(i + 1).padStart(2, "0")}</h3><p class="zh-card__ex">Your two-line post summary here. Briefly say what it covers.</p><div class="zh-card__meta"><span data-tbtn>In detail</span><span class="zh-card__by">Author name <i></i> 0000-0-00</span></div></div>`;
  }
  window.zhCard = card;
  window.zhPosts = POSTS;
  function news() {
    $$("[data-zh-news]").forEach((el) => {
      el.innerHTML = `<div class="zh-wrap"><div class="zh-news__head"><h2 class="t-h5" data-words data-label="Your English News band title here, two lines">Latest news title<br>in two lines</h2><div class="zh-news__side"><p class="t-sm">Your two-line note here: a place gathering articles, cases and news.</p><div class="zh-arrows"><span class="zh-count"><b data-cur>01</b>/<span data-all>05</span></span><button class="zh-arrow" data-prev aria-label="Previous">${ICON.left}</button><button class="zh-arrow" data-next aria-label="Next">${ICON.arrow}</button></div></div></div>
<div class="swiper"><div class="swiper-wrapper">${POSTS.concat(POSTS.slice(0, 3)).map((p, i) => `<div class="swiper-slide">${card(p, i)}</div>`).join("")}</div></div></div>`;
      el.dataset.swiper = "slide";
    });
  }

  // Original swiper bundle: speed 500, slidesPerView auto, current number / total
  window.zhSwiper = (root) => {
    const sw = $(".swiper", root);
    if (!sw || sw.swiper) return;
    const effect = root.dataset.swiper || "slide";
    const cur = $("[data-cur]", root), all = $("[data-all]", root);
    const n = $$(".swiper-slide", sw).length;
    if (all) all.textContent = String(n).padStart(2, "0");
    const s = new Swiper(sw, {
      effect, speed: 500, slidesPerView: effect === "fade" ? 1 : "auto", spaceBetween: effect === "fade" ? 0 : 24, followFinger: true, loop: root.dataset.loop === "true", autoHeight: false,
      ...(effect === "fade" ? { fadeEffect: { crossFade: true } } : {}),
      navigation: { nextEl: $("[data-next]", root), prevEl: $("[data-prev]", root), disabledClass: "cc-disabled" },
      a11y: true, keyboard: { enabled: true, onlyInViewport: true },
      on: { slideChange(w) { if (cur) cur.textContent = String(w.realIndex + 1).padStart(2, "0"); } },
    });
    return s;
  };

  // Accordion — only one opens at a time
  function accordions() {
    $$("[data-acc-group]").forEach((g) => {
      const items = $$(".zh-acc", g);
      items.forEach((it) => $(".zh-acc__head", it).addEventListener("click", () => {
        const will = !it.classList.contains("is-open");
        items.forEach((x) => { x.classList.remove("is-open"); $(".zh-acc__head", x).setAttribute("aria-expanded", "false"); });
        if (will) { it.classList.add("is-open"); $(".zh-acc__head", it).setAttribute("aria-expanded", "true"); }
        g.dispatchEvent(new CustomEvent("zh:acc", { detail: { index: will ? items.indexOf(it) : -1 } }));
      }));
    });
  }

  // Strip: attach the set three more times and run -100% to -200% in 60s (linear), starting when it enters the screen, endlessly
  function marquees() {
    $$("[data-mq]").forEach((w) => {
      const slot = $(".zh-mq__slot", w);
      if (!slot || w.dataset.mqOn) return;
      w.dataset.mqOn = "1";
      for (let i = 0; i < 3; i++) w.appendChild(slot.cloneNode(true));
      if (reduce) return;
      const all = $$(".zh-mq__slot", w);
      const dur = +(w.dataset.mqDur || 60);
      gsap.timeline({ repeat: -1, scrollTrigger: { trigger: w, start: "top bottom", toggleActions: "play none none none" } })
        .fromTo(all, { x: "-100%" }, { x: "-200%", ease: "none", duration: dur });
    });
  }

  // Original [text-animate=words] · [fade-in] · [fade-in-self] · [parallax-image] · [text-animate=scrub]
  const splits = [];
  function reveals() {
    $$("[data-words]").forEach((el) => {
      const s = SplitText.create(el, { type: "lines,words", linesClass: "zh-ln", wordsClass: "zh-word" });
      splits.push(s);
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom" } })
        .from(s.words, { yPercent: 115, duration: 1, ease: "power3.out", stagger: 0.01, delay: 0.5 });
    });
    $$("[data-scrub-words]").forEach((el) => {
      const s = SplitText.create(el, { type: "lines,words", linesClass: "zh-ln", wordsClass: "zh-word" });
      splits.push(s);
      gsap.timeline({ scrollTrigger: { trigger: el, start: "top center", end: "bottom center", scrub: true } })
        .from(s.words, { opacity: 0.3, duration: 0.4, ease: "power1.out", stagger: 0.1 });
    });
    $$("[data-fade]").forEach((el) => gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom" } })
      .from(el.children, { opacity: 0, y: "1.5rem", duration: 0.8, ease: "power3.out", stagger: 0.01, delay: 0.5 }));
    $$("[data-fade-self]").forEach((el) => gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom" } })
      .from(el, { opacity: 0, y: "1.5rem", duration: 0.8, ease: "power3.out", delay: 0.5 }));
    // Original Webflow Slide Up: from 2rem below and transparent, .6s delayed — position .6s inOutQuart, opacity .5s ease. Once when visible
    $$("[data-up], .zh-eyebrow").forEach((el) => ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: () => el.classList.add("is-up") }));
    $$("[data-parallax]").forEach((el) => gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } })
      .from(el, { yPercent: -10, ease: "none" }));
  }

  // ───── Lenis (original 1.0.23 · lerp .15) · back to top ─────
  let lenis;
  function smooth() {
    if (reduce || typeof Lenis === "undefined") return;
    lenis = new Lenis({ lerp: 0.15, wheelMultiplier: 1, gestureOrientation: "vertical", normalizeWheel: false, smoothTouch: false });
    window.lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  function backTop() {
    const b = $("[data-back-top]");
    if (!b) return;
    b.addEventListener("click", (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 2.5, easing: (t) => 1 - Math.pow(1 - t, 3) });
      else scrollTo({ top: 0 });
    });
    const on = () => { const v = scrollY > 300; b.style.opacity = v ? "1" : "0"; b.style.pointerEvents = v ? "auto" : "none"; };
    addEventListener("scroll", on, { passive: true });
  }

  header();
  footer();
  news();
  window.zhButtons();
  megaNav();
  mobileNav();
  baseOnScroll();
  accordions();
  smooth();
  backTop();
  $$("[data-swiper]").forEach(window.zhSwiper);

  const mm = gsap.matchMedia();
  document.fonts.ready.then(() => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      reveals();
      marquees();
      // Original: once all fonts arrive, the page wrapper turns on in .3s
      gsap.to(".zh-page", { opacity: 1, duration: 0.3, ease: "power1.inOut" });
      return () => { splits.splice(0).forEach((s) => s.revert()); };
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".zh-page", { opacity: 1 });
      marquees();
    });
    window.dispatchEvent(new Event("zh:ready"));
    new ResizeObserver(() => ScrollTrigger.refresh()).observe(document.body);
  });
})();
