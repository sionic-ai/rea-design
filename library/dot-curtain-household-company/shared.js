// Shared by all pages: draws in the header nav, product dropdown, full menu and footer, and wires up the dot curtain (first-visit loader·page transition), rounded frame, text roll, parallax photo, dot grid canvas and footer dot fill-up.
// Original values: curtain cell 37px (phone 19.18) · dot 1.48rem×5.1 scale · first visit 1.75s closes to center → after 2.5s lifts from the bottom over 1.25s · page turn .75s (.23,1,.32,1)
// Dot grid: base radius 14.822/3/2 → up to 16 within 450px of the four screen corners and the center · radius interpolation .1 · flows at 1/3 of scroll speed
// Footer dots: radius 7.41 · cell 37.06×18.53 · turn on only once the screen bottom is 90px past · on .08 off .16 · each dot delayed 0~.5s
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const isSP = () => innerWidth <= 767;
  const rpx = (v) => v * innerWidth / (isSP() ? 375 : 1440);
  // Canvas fill reads the Skin variables — re-read on every resize so swapping the Skin carries through
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const TN = (window.TN = { reduced, rpx, isSP, cssVar });

  const arrow = (cls = "") => `<i class="tn-arrow ${cls}"><span></span></i>`;
  const roll = (t) => `<span class="tn-roll__t"><span>${t}</span></span>`;
  const mark = (t = "Sample") => `<span class="tn-mark">${t}</span>`;
  const sns = ["ig", "fb", "nt", "ln", "yt"].map((k) => `<a href="#" aria-label="SNS ${k}">${{
    ig: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="12" height="12" rx="3.5"/><circle cx="8" cy="8" r="2.8"/><circle cx="11.6" cy="4.4" r=".5" fill="currentColor"/></svg>',
    fb: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="currentColor"/><path d="M8.9 15V9.6h1.8l.3-2H8.9V6.4c0-.6.2-1 1-1h1.1V3.6c-.2 0-.9-.1-1.6-.1-1.6 0-2.6 1-2.6 2.7v1.4H5v2h1.8V15" fill="var(--kf-bg)"/></svg>',
    nt: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 13V4h6a2 2 0 0 1 2 2v7"/></svg>',
    ln: '<svg viewBox="0 0 16 16"><path d="M8 2C4.1 2 1 4.5 1 7.6c0 2.8 2.5 5.1 5.8 5.5.2 0 .6.2.6.4l-.1 1.2c0 .3.3.5.6.3 2.4-1.4 6.1-3.9 6.1-7.4C15 4.5 11.9 2 8 2Z" fill="currentColor"/><path d="M4.5 6.2v3h1.6M7.3 6.2v3M8.8 9.2v-3l2 3v-3M13 6.2h-1.4v3H13M11.6 7.7H13" stroke="var(--kf-bg)" stroke-width=".8" fill="none"/></svg>',
    yt: '<svg viewBox="0 0 16 16"><rect x="1" y="3.5" width="14" height="9" rx="2.5" fill="currentColor"/><path d="m6.6 5.8 3.6 2.2-3.6 2.2Z" fill="var(--kf-bg)"/></svg>',
  }[k]}</a>`).join("");
  TN.icons = { arrow, roll, mark };

  // Header nav + product dropdown + full menu
  const NAV = [
    ["home", "index.html", "Home"],
    ["news", "news.html", "News"],
    ["about", "about.html", "Company About"],
    ["product", null, "Product Info"],
    ["support", "index.html#support", "Customer support"],
    ["company", "index.html#company", "Company Info"],
    ["recruit", "recruit.html", "Hiring Info"],
    ["contact", "recruit.html#contact", "Inquiry"],
  ];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "tn-nav";
    head.innerHTML = `
      <div class="tn-nav__bg"></div>
      <a class="tn-nav__logo" href="index.html" aria-label="Home">${mark()}</a>
      <nav class="tn-nav__list" aria-label="Main menu">
        ${NAV.map(([k, href, t]) => k === "product"
          ? `<div class="tn-nav__item tn-nav__item--product${page === "product" ? " is-current" : ""}"><button class="tn-nav__tab tn-roll" type="button" data-hov>${roll(t)}<i>↓</i></button></div>`
          : `<div class="tn-nav__item${page === k ? " is-current" : ""}"><a class="tn-roll" href="${href}" data-hov>${roll(t)}</a></div>`).join("")}
      </nav>
      <span class="tn-nav__next" aria-hidden="true">▸</span>
      <button class="tn-menubtn" type="button" aria-label="Open Full Menu"><i></i><i></i><i></i></button>`;

    const dropCol = (title, thumb, subs) => `
      <div class="tn-drop__col">
        <a class="tn-drop__thumb tn-frame tn-frame--md" href="product.html"><div class="wf-img" data-label="${thumb}"></div></a>
        <div>
          <a class="tn-drop__title tn-roll" href="product.html" data-hov>${roll(title)}${arrow()}</a>
          <div class="tn-drop__sub">${subs.map(([h, n]) => `<div><h4>${h}</h4><ul class="tn-dotlist">${Array.from({ length: n }, (_, i) => `<li><a href="product.html">Your product name $ here{i + 1}</a></li>`).join("")}</ul></div>`).join("")}</div>
        </div>
      </div>`;
    head.insertAdjacentHTML("afterend", `
      <div class="tn-drop" data-slot="product-dropdown">
        <div class="tn-drop__veil"></div>
        <div class="tn-drop__panel tn-frame">
          <button class="tn-drop__close" type="button">Close</button>
          ${dropCol("For home use", "White fermenter and glass jar · kitchen counter · bright natural light · square", [["Your category 1 here", 5], ["Your category 2 here", 9]])}
          ${dropCol("For business", "Commercial beverage machine · seen through leaves · bright interior · square", [["Your category 3 here", 8], ["Your category 4 here", 2]])}
        </div>
      </div>
      <div class="tn-menu" data-slot="global-menu" aria-hidden="true">
        <a class="tn-menu__logo" href="index.html">${mark()}</a>
        <button class="tn-menu__close" type="button" aria-label="Close"></button>
        <div class="tn-menu__body">
          <div class="tn-menu__info">
            <h3>Your company name here</h3>
            <address>Postal code 000-0000<br>Your one-line address here<br>Phone 0000-00-0000<br>Fax 0000-00-0000</address>
            <div class="tn-sns">${sns}</div>
            <div class="tn-small"><a href="#">Privacy policy</a><a href="#">Terms of service</a><a href="#">Information security</a><a href="#">Your terms line here</a></div>
          </div>
          <div class="tn-menu__col">
            <p class="tn-menu__h">Corporate</p>
            <a class="tn-menu__thumb tn-frame tn-frame--sm tn-roll" href="index.html" data-hov><div class="wf-img" data-label="Smiling person in the kitchen · apron · warm daylight · landscape 16:9"></div>${arrow("is-wh")}</a>
            <p class="tn-menu__lead">Your one-line motto here</p>
            <ul class="tn-menu__links">
              <li><a href="news.html">News</a></li><li><a href="about.html">Company About</a></li>
              <li><a href="product.html">Household products</a></li><li><a href="product.html">Business products</a></li>
              <li><a href="index.html#support">Customer support</a></li><li><a href="#">Register purchased product</a></li>
              <li><a href="index.html#company">Company Info</a></li><li><a href="recruit.html">Hiring Info</a></li>
            </ul>
            <div class="tn-menu__asides"><a href="#">${arrow()}Inquiry</a><a href="#">${arrow()}To press contacts</a></div>
          </div>
          <div class="tn-menu__col">
            <p class="tn-menu__h">Press</p>
            <a class="tn-menu__thumb tn-frame tn-frame--sm tn-roll" href="#" data-hov><div class="wf-img" data-label="Fermented grain and ladle in a glass container · white counter · soft light"></div>${arrow("is-wh")}</a>
            <p class="tn-menu__lead">Your media introduction here<br>Add two lines</p>
            <ul class="tn-menu__links" style="grid-template-columns:1fr"><li><a href="#">For first-time visitors</a></li></ul>
            <div class="tn-menu__tags"><a href="#"># Tag 1</a><a href="#"># Tag 2</a><a href="#"># Tag 3</a><a href="#"># Tag 4</a><a href="#"># Tag 5</a><a href="#"># Tag 6</a><a href="#"># Tag 7</a></div>
            <ul class="tn-menu__links" style="grid-template-columns:1fr;margin-top:1.2rem"><li><a href="#">User Manual</a></li><li><a href="#">Product guide · Recipes</a></li><li><a href="#">Test report</a></li></ul>
          </div>
          <div class="tn-menu__col">
            <p class="tn-menu__h">Online Shop</p>
            <a class="tn-menu__thumb tn-frame tn-frame--sm tn-roll" href="#" data-hov><div class="wf-img" data-label="White proofer by a window · oranges and yogurt · backlit green leaves"></div>${arrow("is-wh is-ext")}</a>
            <p class="tn-menu__lead">Your shop intro here<br>Add two lines</p>
            <ul class="tn-menu__links is-ext">${Array.from({ length: 8 }, (_, i) => `<li><a href="#">Product ${i + 1}</a></li>`).join("")}</ul>
            <div class="tn-menu__asides"><a href="#">${arrow("is-ext")}Usage guide</a></div>
          </div>
        </div>
        <div class="tn-menu__banners" data-slot="menu-banners">
          <button class="tn-menu__pager" type="button" data-dir="-1" aria-label="Previous">◀</button>
          <div class="tn-menu__viewport"><div class="tn-menu__track">${[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((n) => `<a href="#" class="wf-img" data-label="Banner ${n} · Horizontal band"></a>`).join("")}</div></div>
          <button class="tn-menu__pager" type="button" data-dir="1" aria-label="Next">▶</button>
        </div>
      </div>`);
  }

  // Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const crumb = document.body.dataset.crumb || "";
    const sec = (h, items, extra = "") => `<div class="${extra}"><h4><a href="#">${h}</a></h4><ul>${items.map((t) => `<li><a href="#">${t}</a></li>`).join("")}</ul></div>`;
    foot.className = "tn-foot";
    foot.innerHTML = `
      <div class="tn-foot__bar">
        <a href="index.html">${mark()}</a>
        <nav class="tn-crumb"><a href="index.html">Home</a>${crumb ? `<span>${crumb}</span>` : ""}</nav>
        <a class="tn-foot__top tn-roll" href="#top" data-hov data-top>${roll("Back to top")}<b>↑</b></a>
      </div>
      <div class="tn-foot__related" data-slot="footer-related">
        <a href="#" data-hov><span class="tn-foot__rlogo">${mark()}<em>PRESS</em>${arrow()}</span><p>Your media intro in one line here</p></a>
        <a href="#" data-hov><span class="tn-foot__rlogo">${mark()}<em>ONLINE SHOP</em>${arrow("is-ext")}</span><p>Your shop intro here, one line</p></a>
      </div>
      <div class="tn-foot__dots" data-slot="footer-dots">
        <div class="tn-foot__body">
          <canvas></canvas>
          <div class="tn-foot__main">
            <div class="tn-foot__menu">
              <div><h4><a href="index.html">Home</a></h4></div>
              ${sec("News", ["# Category 1", "# Category 2", "# Category 3"])}
              ${sec("Company About", ["Your menu 1 here", "Your menu 2 here", "Your menu 3 here"])}
              <div><h4>Product Info</h4><ul><li class="is-dim">For home use</li><li><a href="product.html">Your category 1 here</a></li><li><a href="product.html">Your category 2 here</a></li></ul></div>
              <div><h4 style="visibility:hidden">·</h4><ul><li class="is-dim">For business</li><li><a href="product.html">Your category 3 here</a></li><li><a href="product.html">Your category 4 here</a></li></ul></div>
              ${sec("Customer support", ["Frequently asked questions", "User Manual", "Guides · Recipes", "Test report", "Register purchased product"], "is-skip")}
              ${sec("Company Info", ["Message from the CEO", "Mission & values", "Company overview", "Company history", "Work environment"])}
              ${sec("Hiring Info", ["Hiring message", "Ideal talent", "Work environment", "Staff Stories", "Application guidelines"])}
              <div><h4 style="visibility:hidden">·</h4><ul style="margin-top:2.6rem"><li><a href="#">Privacy policy</a></li><li><a href="#">Terms of service</a></li><li><a href="#">Information security</a></li><li><a href="#">Your terms line here</a></li></ul></div>
            </div>
            <div class="tn-foot__aside">
              <div><a href="#" data-hov>${arrow()}Inquiry</a><a href="#" data-hov>${arrow()}To press contacts</a></div>
              <div><a href="#" data-hov>${arrow("is-ext")}Your link 1 here</a><a href="#" data-hov>${arrow("is-ext")}Your link 2 here</a></div>
              <div class="is-wide"><a href="#" data-hov>${arrow()}Media Name</a><a href="#" data-hov>${arrow("is-ext")}Shop name</a></div>
              <div class="tn-foot__co"><h4>Your company name here</h4><address>Postal code 000-0000<br>Your one-line address here<br>Phone 0000-00-0000<br>Fax 0000-00-0000</address></div>
            </div>
          </div>
          <p class="tn-foot__tagline">Your slogan here</p>
        </div>
        <div class="tn-foot__misc">
          <small>© Company name here. All Rights Reserved</small>
          <div class="tn-sns">${sns}</div>
          <div class="tn-foot__biglogo">${mark()}</div>
        </div>
      </div>`;
  }

  // Rounded frame: four superellipse corner pieces
  document.querySelectorAll(".tn-frame").forEach((el) => {
    el.insertAdjacentHTML("beforeend", '<i class="tn-corner is-tl"></i><i class="tn-corner is-tr"></i><i class="tn-corner is-br"></i><i class="tn-corner is-bl"></i>');
  });

  // Letter roll: place a copy of the same text below, and on hover is-hover applies for .5s (original setMouseHover)
  document.querySelectorAll(".tn-roll__t").forEach((t) => {
    const s = t.firstElementChild;
    if (s && !s.nextElementSibling) t.append(s.cloneNode(true));
  });
  if (!reduced && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-hov]").forEach((el) => {
      let timer = null;
      el.addEventListener("mouseenter", () => {
        if (el.classList.contains("is-hover")) return;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.classList.add("is-hover");
          clearTimeout(timer);
          timer = setTimeout(() => el.classList.remove("is-hover"), 500);
        }));
      });
    });
  }

  // Smooth scroll — original Lenis({ lerp: 1, duration: 1.5 }): wheel unchanged, only anchor movement 1.5s
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 1, duration: 1.5, smoothTouch: true, autoRaf: true });
    lenis.on("scroll", ScrollTrigger.update);
    TN.lenis = lenis;
  }
  const goTo = (target) => (lenis ? lenis.scrollTo(target, { offset: 1, duration: 1.5 }) : typeof target === "number" ? window.scrollTo(0, target) : target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }));
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const h = a.getAttribute("href");
    if (h === "#" && !a.hasAttribute("data-top")) return;
    const el = h.length > 1 ? document.querySelector(h) : null;
    goTo(a.hasAttribute("data-top") || !el ? 0 : el);
  });

  // Nav: original globalnav — hides upward as much as you scroll down (PC 116 · phone 122, px at 1440 · 375), and comes back as much as you scroll up.
  // Once the footer’s top edge passes above the screen, it is pushed up further by that amount (up to the hidden width) so it doesn’t overlap the footer.
  // The sticky filter (left of News) moves down up to 4rem more from 6rem by how much of the nav is visible, so they don’t overlap
  const nav = document.querySelector(".tn-nav");
  if (nav) {
    const foot = document.querySelector(".tn-foot");
    const panes = document.querySelectorAll("[data-sticky-pane]");
    let last = null, off = 0;
    const onScroll = () => {
      const y = Math.max(0, lenis ? lenis.scroll : scrollY), max = rpx(isSP() ? 122 : 116), give = rpx(40);
      if (last === null) last = y;
      const catchUp = foot ? Math.max(-max, Math.min(0, foot.getBoundingClientRect().top)) : 0;
      off = Math.min(max, Math.max(0, off + (y - last)) - catchUp);
      last = y;
      nav.style.transform = `translate3d(0, ${-off}px, 0)`;
      panes.forEach((p) => p.style.setProperty("top", `${rpx(60) + give - Math.min(off, give)}px`));
    };
    if (lenis) lenis.on("scroll", onScroll); else addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Product dropdown: on PC it opens when hovering the tab and closes when hovering another menu or the dim overlay. On phones tap the tab to open
  const drop = document.querySelector(".tn-drop");
  if (drop) {
    const item = document.querySelector(".tn-nav__item--product");
    const open = () => { drop.classList.add("is-open"); if (isSP()) lenis?.stop(); };
    const close = () => { drop.classList.remove("is-open"); lenis?.start(); };
    item.addEventListener("mouseenter", () => !isSP() && open());
    document.querySelectorAll(".tn-nav__item:not(.tn-nav__item--product), .tn-nav__logo, .tn-menubtn, .tn-drop__veil").forEach((el) => el.addEventListener("mouseenter", () => !isSP() && close()));
    item.querySelector("button").addEventListener("click", () => (isSP() ? (drop.classList.contains("is-open") ? close() : open()) : open()));
    drop.querySelector(".tn-drop__close").addEventListener("click", close);
    drop.querySelector(".tn-drop__veil").addEventListener("click", close);
  }

  // Full menu + banner strip (moves 16rem every 2.5s, loops back to the start at the end)
  const menu = document.querySelector(".tn-menu");
  if (menu) {
    const track = menu.querySelector(".tn-menu__track");
    let i = 0, auto = null;
    const go = (d) => {
      i += d;
      if (i < 0) { track.style.transition = "none"; i = 5; track.style.transform = `translateX(${-16 * i}rem)`; track.offsetWidth; track.style.transition = ""; i = 4; }
      track.style.transform = `translateX(${-16 * i}rem)`;
      clearTimeout(auto);
      if (menu.classList.contains("is-open")) auto = setTimeout(() => go(1), 2500);
    };
    track.addEventListener("transitionend", () => {
      if (i >= 5) { track.style.transition = "none"; i = 0; track.style.transform = "translateX(0)"; track.offsetWidth; track.style.transition = ""; }
    });
    menu.querySelectorAll(".tn-menu__pager").forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.dir))));
    document.querySelector(".tn-menubtn").addEventListener("click", () => {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("is-menu-open");
      lenis?.stop();
      clearTimeout(auto);
      auto = setTimeout(() => go(1), 2500);
    });
    menu.querySelector(".tn-menu__close").addEventListener("click", () => {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("is-menu-open");
      lenis?.start();
      clearTimeout(auto);
    });
  }

  // Parallax photo: a photo 1.2x larger than the frame is pinned to the frame’s bottom, and while the frame passes the screen it moves down by (1.2-1)/1.2
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".tn-prlx").forEach((el) => {
      const t = el.querySelector(".tn-prlx__t");
      const mag = Number(el.dataset.mag || 1.2);
      t.style.height = mag * 100 + "%";
      gsap.fromTo(t, { yPercent: 0 }, { yPercent: ((mag - 1) / mag) * 100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  });

  // Superellipse corner rectangle (for canvas) — same curve as .tn-corner
  const CURVE = [[60.5, 0.2], [48, 0.8], [39, 1.7], [31.9, 3.1], [26, 4.9], [21, 7.1], [16.6, 9.8], [12.9, 12.9], [9.8, 16.6], [7.1, 21], [4.9, 26], [3.1, 31.9], [1.7, 39], [0.8, 48], [0.2, 60.5], [0, 100]];
  const squircle = (ctx, x, y, w, h, r) => {
    const k = r / 100;
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    CURVE.slice().reverse().forEach(([a, b]) => ctx.lineTo(x + w - b * k, y + a * k));
    ctx.lineTo(x + w, y + h - r);
    CURVE.slice().reverse().forEach(([a, b]) => ctx.lineTo(x + w - a * k, y + h - b * k));
    ctx.lineTo(x + r, y + h);
    CURVE.slice().reverse().forEach(([a, b]) => ctx.lineTo(x + b * k, y + h - a * k));
    ctx.lineTo(x, y + r);
    CURVE.slice().reverse().forEach(([a, b]) => ctx.lineTo(x + a * k, y + b * k));
    ctx.closePath();
  };

  // Dot grid background: dots nearer to five fixed screen points (four corners and center) get bigger — as you scroll, the section passes across the screen and the pattern swells and shrinks.
  const fixPoints = () => {
    const W = innerWidth, H = innerHeight;
    if (!isSP()) return [[0, 0], [W, H], [W / 2, H / 2], [W, 0], [0, H]];
    const a = H / 10, b = H - H / 10;
    return [[0, a], [W, b], [W / 2, a + (b - a) / 2], [W, a], [0, b]];
  };
  const dotBgs = [...document.querySelectorAll(".tn-dots")].map((el) => {
    const cv = document.createElement("canvas");
    el.prepend(cv);
    const ctx = cv.getContext("2d");
    let dots = [], o, h, d, rowH, running = false, raf = 0, dpr = 1, dotInk = "";
    const size = () => {
      const sp = isSP(), t = sp ? 7.674 : 14.822, r = sp ? 1.919 : 3.706, div = sp ? 1.25 : 3;
      dpr = Math.min(2, devicePixelRatio || 1);
      o = rpx(t / div / 2);
      const colW = 2 * rpx(t / 2) + rpx(t + r + r);
      rowH = 2 * rpx(t / 2) + rpx(r);
      h = rpx(sp ? 8 : 16);
      d = rpx(sp ? 100 : 300);
      const W = el.offsetWidth, H = el.offsetHeight;
      dotInk = TN.cssVar("--kf-bg");
      cv.width = W * dpr; cv.height = H * dpr;
      const x0 = -((W / 2) % colW) + rpx(0.5), y0 = -((H / 2) % rowH);
      dots = [];
      for (let j = 0; j < Math.ceil(H / rowH) + 8; j++) {
        const cy = y0 + (j - 4) * rowH, shift = j % 2 ? colW / 2 : 0;
        for (let i = 0; i < Math.ceil(W / colW) + 8; i++) dots.push({ cx: x0 + (i - 4) * colW + shift, cy, r: o });
      }
    };
    const draw = () => {
      const W = cv.width / dpr, H = cv.height / dpr, box = cv.getBoundingClientRect();
      const drift = (-box.top / 3) % (2 * rowH);
      const pts = fixPoints();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = getComputedStyle(el).backgroundColor;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = dotInk;
      ctx.beginPath();
      for (const p of dots) {
        let e = 0;
        for (const [fx, fy] of pts) e += Math.max(0, 1 - Math.hypot(p.cx - (fx - box.left), p.cy - (fy - box.top)) / (1.5 * d));
        const target = Math.min(h, o + (h - o) * e);
        p.r += reduced ? target - p.r : 0.1 * (target - p.r);
        ctx.moveTo(p.cx + p.r, p.cy + drift);
        ctx.arc(p.cx, p.cy + drift, p.r, 0, Math.PI * 2);
      }
      ctx.fill();
      if (running) raf = requestAnimationFrame(draw);
    };
    ScrollTrigger.create({
      trigger: el, start: "top bottom", end: "bottom top",
      onToggle: (st) => { running = st.isActive && !reduced; cancelAnimationFrame(raf); if (st.isActive) draw(); },
    });
    size(); draw();
    return { size, draw };
  });

  // Footer dots: when the screen bottom goes 90px lower than the dot, they turn on one by one (delayed 0~.5s), and turn off on scroll up. The white panel, tagline and logo areas are cleared with a superellipse.
  const fd = document.querySelector(".tn-foot__dots");
  if (fd) {
    const cv = fd.querySelector("canvas");
    const body = fd.querySelector(".tn-foot__body");
    const ctx = cv.getContext("2d");
    let dots = [], R, holes = [], scrolled = 0, running = false, raf = 0, dpr = 1, paper = "", dotInk = "";
    const size = () => {
      const sp = isSP(), t = sp ? 7.674 : 14.822, p = sp ? 1.919 : 3.706;
      dpr = Math.min(2, devicePixelRatio || 1);
      R = rpx(t / 2);
      const colW = 2 * R + rpx(t + p + p), rowH = 2 * R + rpx(p), half = colW / 2;
      const W = fd.offsetWidth, H = fd.offsetHeight;
      paper = TN.cssVar("--kf-bg");
      dotInk = TN.cssVar("--kf-accent");
      cv.width = W * dpr; cv.height = body.offsetHeight * dpr;
      cv.style.height = body.offsetHeight + "px";
      const x0 = -((W / 2) % colW) + rpx(sp ? 10.5 : -5.2), y0 = -((body.offsetHeight / 2) % rowH) + rpx(sp ? 3 : 21.4);
      const rows = Math.ceil(body.offsetHeight / rowH) + 1;
      const extra = sp ? [] : [[36, rows], [37, rows], [38, rows], [37, rows + 1], [38, rows + 1]];
      dots = [];
      const add = (i, j) => dots.push({ cx: x0 + (i - 2) * colW + (j % 2 === 0 ? half : 0), cy: y0 + j * rowH, a: 0, delay: Math.random() * 0.5, on: null, off: null });
      for (let j = 0; j < rows; j++) for (let i = 0; i < Math.ceil(W / colW) + 4; i++) add(i, j);
      extra.forEach(([i, j]) => add(i, j));
      const base = cv.getBoundingClientRect();
      holes = [".tn-foot__main", ".tn-foot__tagline"].map((s) => {
        const r = fd.querySelector(s).getBoundingClientRect();
        const pad = s === ".tn-foot__main" ? 0 : rpx(24);
        return { x: r.left - base.left - pad, y: r.top - base.top - pad, w: r.width + pad * 2, h: r.height + pad * 2, r: rpx(s === ".tn-foot__main" ? 60 : 40) };
      });
      const logo = fd.querySelector(".tn-foot__biglogo .tn-mark").getBoundingClientRect();
      holes.push({ x: logo.left - base.left - rpx(30), y: logo.top - base.top - rpx(30), w: base.width, h: base.height, r: rpx(40) });
      cv.style.height = cv.height / dpr + "px";
    };
    const draw = (now = 0) => {
      const W = cv.width / dpr, H = cv.height / dpr, s = now / 1000, line = scrolled - rpx(isSP() ? 80 : 90);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = dotInk;
      for (const p of dots) {
        const lit = reduced || p.cy < line;
        if (lit) { if (p.on === null) p.on = s; p.off = null; } else { if (p.off === null) p.off = s; p.on = null; }
        if (lit && (reduced || s - p.on >= p.delay)) p.a += reduced ? 1 - p.a : 0.08 * (1 - p.a);
        else if (!lit && s - p.off >= p.delay) p.a += 0.16 * (0 - p.a);
        if (p.a < 0.01) continue;
        ctx.beginPath();
        ctx.arc(p.cx, p.cy, R, 0, Math.PI * 2);
        ctx.globalAlpha = p.a;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = paper;
      ctx.beginPath();
      holes.forEach((b) => squircle(ctx, b.x, b.y, b.w, b.h, Math.min(b.r, b.w / 2, b.h / 2)));
      ctx.fill();
      if (running) raf = requestAnimationFrame(draw);
    };
    const st = ScrollTrigger.create({
      trigger: body, start: "top bottom", end: "bottom top",
      onUpdate: (self) => { scrolled = (self.end - self.start) * self.progress; },
      onToggle: (self) => {
        running = self.isActive;
        cancelAnimationFrame(raf);
        if (self.isActive) raf = requestAnimationFrame(draw);
        else dots.forEach((p) => { p.a = 0; p.on = p.off = null; });
      },
    });
    TN.footSize = () => { size(); scrolled = (st.end - st.start) * st.progress; draw(); };
    size(); draw();
  }

  let rt = 0;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => { dotBgs.forEach((b) => { b.size(); b.draw(); }); TN.footSize?.(); buildGrid(gridMode); }, 200);
  });
  document.fonts?.ready.then(() => { ScrollTrigger.refresh(); TN.footSize?.(); });

  // ── Dot mask ────────────────────────────────────────────
  // First visit (once per session): on a beige background three white dots blink, then beige dots shrink to the center, leaving one black dot and the logo,
  // After 2.5s a white dot covers the screen, then lifts from the bottom row. After that, between pages, the white dot grows from the bottom row over .75s, .1s later a white curtain covers in .2s, and the page switches in 750ms (original transit).
  const mask = document.createElement("div");
  mask.className = "tn-mask";
  mask.setAttribute("aria-hidden", "true");
  mask.innerHTML = `<div class="tn-mask__grid"></div><div class="tn-mask__logo">${mark()}</div><div class="tn-mask__loading"><i></i><i></i><i></i></div>`;
  const grid = mask.querySelector(".tn-mask__grid");
  let gridMode = "rows";
  function buildGrid(mode) {
    gridMode = mode;
    const sp = isSP(), cellRem = sp ? 1.918 : 3.7;
    const n = cellRem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const cols = Math.ceil((sp ? 375 : 1440) / (2 * (sp ? 19.18 : 37))) + 1;
    const rows = Math.ceil(innerHeight / n) + 2;
    const ey = Math.round((rows - 1) / 2) + [-2, 0, -1, -1][rows % 4], ex = Math.round((cols - 1) / 2), far = Math.hypot(ex, ey);
    let html = "";
    for (let r = 0; r < rows + 1; r++) {
      html += '<div class="tn-mask__line">';
      for (let c = 0; c < cols; c++) {
        let d;
        if (mode === "radial") {
          d = 0.5 - (0.5 * Math.hypot(ex - c, ey - r)) / far;
          if (innerWidth / innerHeight < 1) d -= 0.0125 * Math.abs(ex - c);
        } else d = mode === "leave" ? 0.3 - (0.3 * r) / rows : 0.5 - (0.5 * r) / rows;
        html += `<div class="tn-mask__dot${mode === "radial" && r === ey && c === ex ? " is-origin" : ""}" style="--d:${d.toFixed(3)}s"></div>`;
      }
      html += "</div>";
    }
    grid.innerHTML = html;
    const tail = [n / 2, -n, -n / 2, 0][rows % 4];
    grid.style.top = (innerHeight - rows * n) / 2 + tail + "px";
  }
  document.body.append(mask);

  const openPage = () => {
    document.documentElement.classList.add("is-opened");
    setTimeout(() => mask.classList.add("is-done"), 1250);
  };
  const reveal = () => {
    if (reduced) { mask.classList.add("is-done"); document.documentElement.classList.add("is-opened"); return; }
    const first = !sessionStorage.getItem("tn-splash");
    sessionStorage.setItem("tn-splash", "1");
    if (!first) {
      buildGrid("rows");
      mask.classList.add("is-active");
      requestAnimationFrame(() => requestAnimationFrame(() => { mask.classList.add("is-open"); openPage(); }));
      return;
    }
    mask.classList.add("is-splash");
    buildGrid("radial");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      mask.classList.add("is-active");
      setTimeout(() => {
        mask.classList.add("is-splashopen");
        setTimeout(() => {
          buildGrid("rows");
          mask.classList.add("is-wipe");
          requestAnimationFrame(() => requestAnimationFrame(() => { mask.classList.add("is-open"); openPage(); }));
        }, 2500);
      }, 500);
    }));
  };
  if (!reduced) {
    if (!sessionStorage.getItem("tn-splash")) mask.classList.add("is-splash");
    buildGrid(sessionStorage.getItem("tn-splash") ? "rows" : "radial");
  }
  // Original siteready: the curtain opens only after fonts are all attached (3s at most) and non-lazy images are all received plus 250ms
  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
  const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 3000))]);
  Promise.all([loaded, fonts, new Promise((r) => setTimeout(r, 250))]).then(reveal);

  // Links between our own pages are covered with dots, then navigate
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || reduced || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const [file] = href.split("#");
    const here = location.pathname.split("/").pop() || "index.html";
    if (file === here && href.includes("#")) return;
    e.preventDefault();
    menu?.classList.remove("is-open");
    drop?.classList.remove("is-open");
    buildGrid("leave");
    mask.className = "tn-mask is-leave is-pre";
    mask.offsetWidth;
    mask.classList.remove("is-pre");
    setTimeout(() => { location.href = href; }, 750);
  });
  addEventListener("pageshow", (e) => {
    if (e.persisted) { mask.className = "tn-mask is-done"; document.documentElement.classList.add("is-opened"); }
  });
})();
