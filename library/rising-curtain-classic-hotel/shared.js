// Shared across pages — builds the header · menu drawer · footer · booking button · background paper once here, and hooks up arrow hover · parallax · flowing wordmark · section index.
// The original has no page transition: it opens the document fresh (body is visible immediately), and only the first page runs the long opening sheet (index.js).
(() => {
  const page = document.body.dataset.page || "home";
  const isTop = page === "home";
  const lg = () => innerWidth >= 1024;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = !matchMedia("(hover: hover)").matches;
  const ARW = '<svg viewBox="0 0 17 11" aria-hidden="true"><path d="M11.4 0 17 5.5 11.4 11l-1.1-1.1 3.6-3.6H0V4.7h13.9L10.3 1.1Z"/></svg>';
  const NOW = { home: ["", ""], product: ["Shop", "Shopping"], about: ["About the Hotel", "About Us"], news: ["News", "What's New"], article: ["News", "What's New"] };

  const html = (s) => { const t = document.createElement("template"); t.innerHTML = s.trim(); return t.content; };

  const item = (t, h, k = "", ext = false) => `<li class="mp-fade${ext ? " is-ext" : ""}"><a href="${h}"${k && (page === k || (k === "news" && page === "article")) ? ' class="is-current"' : ""}>${t}</a></li>`;
  const header = `
<header class="mp-header" data-slot="header">
  <div class="mp-logo"><a href="index.html" data-label="Hotel logotype — original is a handwriting-style kana logo · Width 103px">Hotel Name</a></div>
  <nav class="mp-nav" aria-label="Main menu">
    <ol>${item("Menu 1", "#")}${item("Menu 2", "#")}${item("Shop", "product.html", "product")}${item("Menu 4", "#")}</ol>
    <ol>${item("Menu 5", "#")}${item("About the Hotel", "about.html", "about")}${item("News", "news.html", "news")}${item("Frequently asked questions", "#", "", true)}</ol>
  </nav>
  <div class="mp-now" aria-hidden="true"><span class="ja">${NOW[page][0]}</span><span class="en">${NOW[page][1]}</span></div>
  <div class="mp-hright">
    <button class="mp-lang" type="button" aria-label="Language"><svg viewBox="0 0 21 21" fill="none" stroke-width="1.1"><circle cx="10.5" cy="10.5" r="9.5"/><ellipse cx="10.5" cy="10.5" rx="4.2" ry="9.5"/><path d="M1 10.5h19M2.6 5.6h15.8M2.6 15.4h15.8"/></svg></button>
    <div class="mp-lang-pop"><a href="#" class="is-on">Korean</a><a href="#">English</a></div>
    <div class="mp-hitems">
      <a class="access mp-fade" href="#">Directions</a>
      <a class="shop mp-fade" href="#">Online shop</a>
      <button class="mp-menu-btn mp-fade" type="button" aria-expanded="false"><span>Menu</span></button>
    </div>
  </div>
</header>`;

  const menuItem = (en, ja, href, subs) => subs
    ? `<li data-acc><div class="acc"><a class="t mp-fade" href="${href}"><span>${en}</span><span>${ja}</span></a><button class="plus" type="button" aria-label="Open sub-list"></button></div><div class="sub"><div class="inner">${subs.map((s) => `<a class="mp-fade" href="#">${s}</a>`).join("")}</div></div></li>`
    : `<li><a class="t mp-fade" href="${href}"><span>${en}</span><span>${ja}</span></a></li>`;
  const menu = `
<div class="mp-menu" data-slot="menu-drawer" aria-hidden="true">
  <div class="mp-menu-stage" data-fx="dome-clip-reveal" data-fx-dome-clip-reveal="look: down; dur: ${lg() ? 0.75 : 1}; lag: ${lg() ? 0.1 : 0.05}; close-dur: ${lg() ? 0.5 : 0.75}">
    <div class="mp-menu-bg" aria-hidden="true"><div class="obj"><div data-lottie="menu-a.json"></div><div data-lottie="menu-b.json"></div></div></div>
    <div class="mp-menu-body">
      <div class="mp-menu-main"><ol>
        ${menuItem("Home", "Home", "index.html")}
        ${menuItem("Rooms & Suites", "Guest room", "#", ["Room wing 1", "Room wing 2", "Room wing 3"])}
        ${menuItem("Restaurants", "Meal", "#", ["Restaurant 1", "Restaurant 2", "Bar", "Japanese restaurant"])}
        ${menuItem("Shopping", "Shop", "product.html")}
        ${menuItem("Weddings", "Wedding", "#")}
        ${menuItem("Banquets &amp; Conferences", "Banquets · Meetings", "#")}
        ${menuItem("About Us", "About the Hotel", "about.html")}
        ${menuItem("What’s New", "News", "news.html")}
        ${menuItem("FAQ", "Frequently asked questions", "#")}
      </ol></div>
      <div class="mp-menu-sub">
        <div class="top"><a href="#" class="mp-fade">Reservation</a><a href="#" class="mp-fade">Directions</a><a href="#" class="mp-fade is-ext">Online shop</a><a href="#" class="mp-fade">Inquiry</a></div>
        <div class="sns"><span>SNS</span><div class="g"><a href="#" class="mp-fade">LINE</a><a href="#" class="mp-fade">Instagram</a><a href="#" class="mp-fade">Facebook</a></div></div>
        <div class="addr">Postal code 000-0000<br>Your hotel address goes here in one line<a class="tel" href="#">Tel : 00-000-0000</a></div>
      </div>
    </div>
  </div>
</div>`;

  const reserve = `
<div class="mp-reserve" data-slot="reserve-buttons">
  <button type="button" data-open-reserve><span class="bg" aria-hidden="true"></span><span class="icon" aria-hidden="true"><svg viewBox="0 0 20 20" stroke-width="1.2"><rect x="2.5" y="4" width="15" height="13" rx="1.5"/><path d="M2.5 8h15M6.5 2v4M13.5 2v4"/></svg></span><span class="ja">Reservation<small>Reservations</small></span></button>
  <a href="#"><span class="bg" aria-hidden="true"></span><span class="ja">[Limited Time]<br>Seasonal product</span></a>
</div>
<div class="mp-modal" data-slot="reserve-modal" role="dialog" aria-modal="true" aria-label="Reservation">
  <div class="shade"></div>
  <div class="box">
    <h3>Room Booking <small>Room Reservations</small></h3>
    <div class="row"><h4>Stay date</h4><span>Year 0000</span><span>00 Month</span><span>00 Day</span><span>1 night</span><span>1 room</span><span>Date TBD</span></div>
    <div class="row"><h4>Headcount</h4><span>1 person</span><span>Headcount TBD</span></div>
    <div class="go"><button class="mp-arw" type="button"><span class="text">Search</span><span class="mp-ico"><i>${ARW}</i></span></button><button class="mp-arw" type="button"><span class="text">Confirm · Cancel Booking</span><span class="mp-ico"><i>${ARW}</i></span></button></div>
    <h3 style="margin-top:40px">Restaurant reservations <small>Restaurant Reservations</small></h3>
    <div class="go"><a class="mp-arw" href="#"><span class="text">View restaurant list</span><span class="mp-ico"><i>${ARW}</i></span></a></div>
    <button class="close" type="button">Close</button>
  </div>
</div>`;

  const footer = `
<footer class="mp-footer" data-slot="footer">
  <div class="mp-loop" data-mp-loop aria-hidden="true"><div class="tg"><div class="g" data-label="A band repeating the hotel’s English name">Hotel Name Hotel Name Hotel Name</div></div></div>
  <div class="mp-ftop">
    <a href="index.html" class="logo" data-label="Emblem + logotype"><svg viewBox="0 0 64 32" aria-hidden="true"><path d="M4 28h56M10 28V17c0-6 10-12 22-12s22 6 22 12v11M18 28v-8M26 28v-9M32 28V9M38 28v-9M46 28v-8M22 5l10-4 10 4"/></svg>Hotel Name</a>
    <div class="contents mp-fnav"><div class="head">Contents</div><div class="list">
      <div class="g"><a href="#" class="mp-fade">Menu 1</a><a href="#" class="mp-fade">Menu 2</a><a href="product.html" class="mp-fade">Shop</a><a href="#" class="mp-fade">Menu 4</a></div>
      <div class="g"><a href="#" class="mp-fade">Menu 5</a><a href="about.html" class="mp-fade">About the Hotel</a><a href="news.html" class="mp-fade">News</a><a href="#" class="mp-fade is-ext">Frequently asked questions</a></div>
    </div></div>
    <div class="blk">
      <div class="info mp-fnav"><div class="head">Information</div><div class="list"><div class="g is-info">
        <a href="#" class="mp-fade">Stay Terms</a><a href="#" class="mp-fade">Privacy policy</a><a href="#" class="mp-fade">Your slightly longer one-line notice goes here.</a><a href="#" class="mp-fade">Your policy text line goes here</a><a href="#" class="mp-fade">External transfer guide</a><a href="#" class="mp-fade">Site Policy</a><a href="#" class="mp-fade">Press room</a><a href="#" class="mp-fade">Company overview · Careers</a>
      </div></div></div>
      <div class="sns mp-fnav"><div class="head">SNS</div><div class="list"><div class="g is-sns"><a href="#" class="mp-fade">LINE</a><a href="#" class="mp-fade">Instagram</a><a href="#" class="mp-fade">Facebook</a></div></div></div>
    </div>
    <div class="main"><a href="#" class="is-r mp-fade" data-open-reserve>Reservation</a><a href="#" class="mp-fade">Directions</a><a href="#" class="is-ext mp-fade">Online shop</a><a href="#" class="mp-fade">Inquiry</a></div>
    <div class="addr"><div><div>Postal code 000-0000<br>Your hotel address goes here in one line</div><a href="#" class="mp-fade">Google Map</a></div><span class="tel">Tel : 00-000-0000</span></div>
    <div class="banners"><a href="#" class="mp-fade"><div class="wf-img" data-label="Member association banner · horizontal strip"></div></a><a href="#" class="mp-fade"><div class="wf-img" data-label="Commemorative campaign banner · wide strip"></div></a></div>
  </div>
  <div class="mp-fbtm"><div class="lang"><a href="#" class="mp-fade">Ko</a><i></i><a href="#" class="mp-fade is-off">En</a></div><div class="copy">Copyright © Hotel Name All Rights Reserved.</div></div>
</footer>`;

  // Build — background paper at the very front, header, drawer and booking button before and after the body
  document.body.prepend(html('<div class="mp-paper" aria-hidden="true"><div class="a"></div><div class="b"></div></div>'));
  document.querySelector("[data-slot=header]")?.replaceWith(html(header));
  document.body.append(html(menu), html(reserve));
  document.querySelector("[data-slot=footer]")?.replaceWith(html(footer));
  if (!isTop) document.body.classList.add("is-sub");
  document.querySelectorAll("[data-arw]").forEach((n) => { n.innerHTML = ARW; });

  const hd = document.querySelector(".mp-header");
  const site = (window.mpSite = { isTop, lg, reduce, ARW, headerAuto: !isTop });

  // ── Header: scrolling past 10px gives a small header (removes menu and buttons, shows the current page name) ──
  const setSmall = (on) => hd.classList.toggle("is-small", on);
  site.setSmall = setSmall;
  site.showHeader = (delay = 0) => gsap.fromTo(hd, { opacity: 0 }, { opacity: 1, duration: 0.5, delay, ease: "power2.out" });
  if (!isTop) gsap.set(hd, { opacity: 1 });
  gsap.ticker.add(() => { if (site.headerAuto) setSmall(scrollY > 10); });

  // Language picker — appears in .25s and closes when pressing outside
  const lang = hd.querySelector(".mp-lang"), pop = hd.querySelector(".mp-lang-pop");
  lang.addEventListener("click", (e) => {
    e.stopPropagation();
    if (pop.classList.contains("is-open")) { pop.classList.remove("is-open"); gsap.set(pop, { opacity: 0 }); return; }
    pop.classList.add("is-open");
    gsap.fromTo(pop, { opacity: 0 }, { opacity: 1, duration: 0.25, delay: 0.05, ease: "power2.out" });
  });
  document.addEventListener("click", (e) => { if (!pop.contains(e.target)) { pop.classList.remove("is-open"); gsap.set(pop, { opacity: 0 }); } });

  // ── Menu drawer: drops down from the top with a rounded sag, inner text rises from 100px below at 1.2× length. Each time it opens, the background line drawing alternates ──
  const mn = document.querySelector(".mp-menu"), stage = mn.querySelector(".mp-menu-stage"), btn = hd.querySelector(".mp-menu-btn");
  const bgObj = mn.querySelector(".mp-menu-bg .obj");
  const lotties = [...mn.querySelectorAll("[data-lottie]")].map((el) => {
    if (!window.lottie) return null;
    const data = window.mpLottie?.[el.dataset.lottie];
    return lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, ...(data ? { animationData: data } : { path: el.dataset.lottie }) });
  });
  let opens = 0, busy = false;
  const jump = (on) => { hd.classList.add("is-jump"); hd.classList.toggle("is-menu", on); void hd.offsetWidth; requestAnimationFrame(() => hd.classList.remove("is-jump")); };
  const openMenu = () => {
    if (busy || mn.classList.contains("is-open")) return;
    busy = true;
    const d = lg() ? 0.75 : 1;
    mn.classList.add("is-open");
    mn.setAttribute("aria-hidden", "false");
    jump(true);
    btn.querySelector("span").textContent = "Close";
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-locked");
    mn.querySelectorAll("[data-lottie]").forEach((el, i) => { el.style.display = i === opens % 2 ? "" : "none"; });
    const anim = lotties[opens % 2];
    if (anim) gsap.delayedCall(0.5, () => anim.goToAndPlay(0, true));
    if (lg()) gsap.fromTo([".mp-menu-main", ".mp-menu-sub"], { y: 100 }, { y: 0, duration: d * 1.2, delay: 0.05, ease: "power2.out" });
    else gsap.fromTo(".mp-menu-body", { y: 50 }, { y: 0, duration: d * 1.2, delay: 0.05, ease: "power2.out" });
    gsap.fromTo(bgObj, { scale: 1.2, opacity: 0 }, { scale: 1, opacity: 1, duration: d * 1.2, delay: 0.55, ease: "power2.out" });
    stage.dispatchEvent(new CustomEvent("fx:play"));
    stage.addEventListener("fx:done", () => { busy = false; }, { once: true });
    if (reduce) busy = false;
    opens++;
  };
  const closeMenu = () => {
    if (busy || !mn.classList.contains("is-open")) return;
    busy = true;
    gsap.delayedCall(lg() ? 0.5 : 0.7, () => { jump(false); btn.querySelector("span").textContent = "Menu"; btn.setAttribute("aria-expanded", "false"); });
    const done = () => { mn.classList.remove("is-open"); mn.setAttribute("aria-hidden", "true"); document.body.classList.remove("is-locked"); busy = false; };
    if (reduce) { done(); jump(false); return; }
    stage.addEventListener("fx:closed", done, { once: true });
    stage.dispatchEvent(new CustomEvent("fx:close"));
  };
  btn.addEventListener("click", () => (mn.classList.contains("is-open") ? closeMenu() : openMenu()));
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  mn.querySelectorAll("[data-acc]").forEach((li) => {
    const sub = li.querySelector(".sub"), inner = sub.querySelector(".inner");
    li.querySelector(".plus").addEventListener("click", () => {
      const open = !li.classList.contains("is-open");
      li.classList.toggle("is-open", open);
      sub.style.height = open ? `${inner.offsetHeight}px` : "0px";
    });
  });

  // ── Booking window: fades in over .25s and out over .25s ──
  const modal = document.querySelector(".mp-modal");
  const openModal = (e) => { e?.preventDefault(); modal.classList.add("is-open"); gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.25, delay: 0.05, ease: "power2.out" }); };
  const closeModal = () => gsap.to(modal, { opacity: 0, duration: 0.25, ease: "power2.out", onComplete: () => modal.classList.remove("is-open") });
  document.querySelectorAll("[data-open-reserve]").forEach((b) => b.addEventListener("click", openModal));
  modal.querySelector(".shade").addEventListener("click", closeModal);
  modal.querySelector(".close").addEventListener("click", closeModal);

  // ── Arrow hover: the arrow slides out by its own cell width (.25s power2.in) and enters from the opposite side (.25s power2.out). The new-window arrow takes a −30° path ──
  const arrowHover = (host) => {
    const ico = host.querySelector(".mp-ico"), arw = ico?.querySelector("i");
    if (!arw) return;
    const ext = host.hasAttribute("data-ext");
    host.addEventListener("mouseenter", () => {
      const t = (host.querySelector(".mp-pdf") || ico).offsetWidth, n = ext ? (t / Math.cos(Math.PI / 6)) * Math.sin(Math.PI / 6) : 0;
      gsap.killTweensOf(arw);
      gsap.fromTo(arw, { x: 0, y: 0 }, { x: t, y: -n, duration: 0.25, ease: "power2.in", onComplete: () => gsap.fromTo(arw, { x: -t, y: n }, { x: 0, y: 0, duration: 0.25, ease: "power2.out" }) });
    });
  };
  site.arrowHover = arrowHover;
  if (!touch && !reduce) document.querySelectorAll(".mp-arw, [data-arw-host]").forEach(arrowHover);

  // ── Parallax: while passing from the bottom of the screen to the top, the photo shifts ±10% of the screen (5% for small cells) and scales up by the shifted amount so no gap shows. On large screens the cell moves too by .75 ──
  const plx = [...document.querySelectorAll("[data-mp-parallax]")].map((el) => ({ el, img: el.querySelector("[data-plx-img]") || el.firstElementChild, small: el.dataset.mpParallax === "small", off: 0 }));
  if (plx.length && !reduce) gsap.ticker.add(() => {
    const vh = innerHeight;
    for (const p of plx) {
      const r = p.el.getBoundingClientRect();
      const top = r.top - (gsap.getProperty(p.el, "y") || 0), h = r.height || 1;
      if (top > vh + 200 || top + h < -200) continue;
      const e = vh * 0.1 * (p.small ? 0.5 : 1);
      const target = gsap.utils.mapRange(-h, vh, -e, e, top);
      p.off += (target - p.off) * 0.1;
      gsap.set(p.img, { y: p.off, scale: (h + e * 2) / h });
      if (lg()) gsap.set(p.el, { y: p.off * 0.75 });
    }
  });

  // ── Flowing wordmark: moves 1px left per frame (at 60fps), wraps once it passes the width of one set ──
  document.querySelectorAll("[data-mp-loop]").forEach((loop) => {
    const tg = loop.querySelector(".tg"), org = tg.querySelector(".g");
    for (let i = 0; i < 5; i++) tg.append(org.cloneNode(true));
    let x = 0, w = org.offsetWidth, on = false, c = 0;
    new IntersectionObserver(([en]) => { on = en.isIntersecting; }).observe(loop);
    if (reduce) return;
    gsap.ticker.add((t, dt) => {
      if (!on) return;
      if (c++ % 60 === 0) w = org.offsetWidth;
      x -= Math.max(1, dt) / (1000 / 60);
      if (x < -w) x += w;
      gsap.set(tg, { x: x - w });
    });
  });

  // ── On reaching the footer, the booking button · section index slide away ──
  const ft = document.querySelector(".mp-footer");
  if (ft) new IntersectionObserver(([en]) => document.body.classList.toggle("is-footer", en.isIntersecting)).observe(ft);
  if (isTop) gsap.set(".mp-reserve > *", { opacity: 0 });

  // ── Section index: click to go 100px above that section’s top over 1s power2.inOut, passed sections darken ──
  const fix = document.querySelector(".mp-fixnav");
  if (fix) {
    const items = [...fix.querySelectorAll("button")].map((b) => ({ b, t: document.querySelector(b.dataset.s), on: false }));
    let lock = false, lockAt = null;
    items.forEach((it) => {
      if (!it.t) return;
      new IntersectionObserver(([en]) => { it.on = en.isIntersecting; }).observe(it.t);
      it.b.addEventListener("click", () => {
        lock = true;
        items.forEach((o) => o.b.classList.toggle("is-current", o === it));
        const to = it.t.getBoundingClientRect().top + scrollY - 100, st = { y: scrollY };
        gsap.to(st, { y: to, duration: reduce ? 0 : 1, ease: "power2.inOut", onUpdate: () => scrollTo(0, st.y), onComplete: () => { lockAt = scrollY; } });
      });
    });
    gsap.ticker.add(() => {
      if (lock && lockAt !== null && Math.abs(scrollY - lockAt) > 20) { lock = false; lockAt = null; }
      if (lock) return;
      let n = -1;
      items.forEach((it, i) => { if (it.on) n = i; });
      items.forEach((it, i) => it.b.classList.toggle("is-current", i === n));
    });
  }

  // Sub-page header photo: after the first 1.5s, a center band of 37.9% (phone 78.7%) opens with 2.5s expo.out, then widens to the screen edges over 450px of scroll (phone 300px). The photo rises 100px meanwhile
  document.querySelectorAll("[data-mp-fv]").forEach((fv) => {
    const bg = fv.querySelector(".bg"), photo = fv.querySelector(".photo");
    const noScroll = fv.hasAttribute("data-full");
    const st = { show: 0, rate: 0, para: 0 };
    if (reduce || noScroll) { if (noScroll) gsap.set(bg, { clipPath: "none" }); return; }
    gsap.to(st, { show: 1, duration: 2.5, delay: 1.5, ease: "expo.out" });
    gsap.ticker.add(() => {
      const y = scrollY, u0 = (lg() ? 0.379166667 : 0.786666667) * 0.5;
      const target = gsap.utils.clamp(0, 1, y / (lg() ? 450 : 300));
      st.rate += (target - st.rate) * 0.1;
      const u = u0 * st.show;
      const l = gsap.utils.interpolate(0.5 - u, 0, st.rate), r = gsap.utils.interpolate(0.5 + u, 1, st.rate);
      bg.style.clipPath = `polygon(${l * 100}% 0, ${r * 100}% 0, ${r * 100}% 100%, ${l * 100}% 100%)`;
      const pt = gsap.utils.clamp(0, 1, y / ((lg() ? 700 : 400) + innerHeight));
      st.para += (pt - st.para) * 0.1;
      gsap.set(photo, { y: -100 * st.para });
    });
  });

  // ── Recommended page round button: the background grows from a circle (height) to its own width in 1.2s expo.inOut, the text appears .5s later over .5s ──
  const roundShow = (el, t = 0.1) => {
    const bg = el.querySelector(".bg"), tx = el.querySelector(".inner");
    if (reduce) return;
    gsap.set(bg, { width: el.offsetHeight, opacity: 0 });
    gsap.set(tx, { opacity: 0 });
    gsap.to(bg, { width: el.offsetWidth, opacity: 1, duration: 1.2, delay: t + 0.1, ease: "expo.inOut", onComplete: () => gsap.set(bg, { width: "100%" }) });
    gsap.to(tx, { opacity: 1, duration: 0.5, delay: t + 0.6, ease: "power2.out" });
  };
  document.querySelectorAll("[data-mp-round]").forEach((wrap) => {
    const btns = wrap.matches(".mp-round") ? [wrap] : [...wrap.querySelectorAll(".mp-round")];
    if (!reduce) btns.forEach((b) => { gsap.set(b.querySelector(".bg"), { opacity: 0 }); gsap.set(b.querySelector(".inner"), { opacity: 0 }); });
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); btns.forEach((b) => roundShow(b, 0.1)); } });
    io.observe(wrap);
  });

  // ── Dark section (About page history etc.): when the section head is 45% above the screen, the background turns ink black ──
  document.querySelectorAll("[data-mp-dark]").forEach((sec) => {
    new IntersectionObserver(([en]) => {
      document.body.classList.toggle("is-dark", en.isIntersecting);
      document.body.classList.toggle("is-dark-page", en.isIntersecting);
    }, { rootMargin: "-45% 0px 0px 0px" }).observe(sec);
  });

  // ── Overflowing single-line text (notice strip): if longer than the box, it flows 1px at a time across two Frames and re-enters from the right when done ──
  document.querySelectorAll("[data-mp-ticker]").forEach((box) => {
    const tx = box.firstElementChild;
    let x = 0, c = 0;
    if (reduce) return;
    gsap.ticker.add(() => {
      if (c++ % 2) return;
      const w = box.offsetWidth, tw = tx.offsetWidth;
      if (w >= tw) { gsap.set(tx, { x: 0 }); return; }
      x -= 1;
      if (x < -tw) x = w + 10;
      gsap.set(tx, { x });
    });
  });

  // ── Once a section title starts to fill, the accompanying text in the same panel appears after .5s in .25s sequence at .625s (the original js-show-text js-sub) ──
  const subsOf = (h) => [...h.parentElement.querySelectorAll(":scope > [data-fade-sub], :scope > [data-fade-subs] > *, :scope > * > [data-fade-sub]")];
  document.querySelectorAll(".mp-h1[data-fx~=dome-clip-reveal], .mp-h2[data-fx~=dome-clip-reveal]").forEach((h) => {
    const subs = subsOf(h);
    if (!subs.length || reduce) return;
    gsap.set(subs, { opacity: 0 });
    h.addEventListener("fx:start", (e) => subs.forEach((n, i) => gsap.to(n, { opacity: 1, duration: 0.625, delay: (e.detail?.delay ?? 0.25) + 0.5 + i * 0.25, ease: "power2.out" })), { once: true });
  });

  // ── Photo cell group: when one row of the group enters the screen, a round mask opens on each cell at .1 + .2×i, and the text under the cell follows .25s later, rising from 20px below over 1.5s power2.inOut ──
  document.querySelectorAll("[data-reveal-blocks]").forEach((wrap) => {
    const items = [...wrap.children].filter((c) => c.querySelector("[data-fx~=dome-clip-reveal]") || c.matches("[data-fx~=dome-clip-reveal]"));
    const texts = items.map((c) => c.querySelector(":scope > .text"));
    if (!reduce) texts.forEach((t) => t && gsap.set(t, { opacity: 0 }));
    const io = new IntersectionObserver((ens) => {
      if (!ens.some((e) => e.isIntersecting)) return;
      io.disconnect();
      items.forEach((c, i) => {
        const clip = c.matches("[data-fx~=dome-clip-reveal]") ? c : c.querySelector("[data-fx~=dome-clip-reveal]");
        gsap.delayedCall(0.1 + i * 0.2, () => clip.dispatchEvent(new CustomEvent("fx:play")));
        if (texts[i] && !reduce) gsap.fromTo(texts[i], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.5, delay: 0.1 + i * 0.2 + 0.25, ease: "power2.inOut" });
      });
    });
    io.observe(wrap);
  });

  // ── Photo cell (original js-show-block): once even one line enters the screen, the curtain opens after .25s (the delay is the cell’s play-delay) ──
  document.querySelectorAll("[data-reveal-one]").forEach((el) => {
    const io = new IntersectionObserver((ens) => {
      if (!ens.some((e) => e.isIntersecting)) return;
      io.disconnect();
      el.dispatchEvent(new CustomEvent("fx:play"));
    });
    io.observe(el);
  });

  // ── Diamond grid pattern (top right of section head) — thin red lines ──
  const LATTICE = '<svg viewBox="0 0 130 130" aria-hidden="true"><path d="M65 4 126 65 65 126 4 65Z M65 34 96 65 65 96 34 65Z M34.5 34.5 95.5 95.5 M95.5 34.5 34.5 95.5 M19.5 49.5 49.5 19.5 M80.5 19.5 110.5 49.5 M110.5 80.5 80.5 110.5 M49.5 110.5 19.5 80.5 M65 4V34 M126 65H96 M65 126V96 M4 65H34"/></svg>';
  document.querySelectorAll("[data-lattice]").forEach((n) => { n.innerHTML = LATTICE; });

  document.body.classList.add("is-loaded");
})();
