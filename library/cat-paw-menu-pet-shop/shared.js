/* Shared by all pages — header (notice bar · logo · menu · mega menu · paw drawer) · footer (marquee band · newsletter · sitemap) · loader · cookie notice · floating button · Lottie cat.
   The original is a jQuery 3.6 + slick 1.8.1 + lottie-web 5.9.6 theme, so the same versions are used — so that the swing curve and duration of fadeIn/fadeOut come out unchanged. */
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce && $) $.fx.off = true;
  const page = document.body.dataset.page || "home";

  const NAV = [
    { label: "Product list", href: "product.html", key: "product", mega: true },
    { label: "Brand features", href: "service.html", key: "service" },
    { label: "Cat People This Way", href: "#" },
    { label: "Development stories", href: "#" },
    { label: "Guardian reviews", href: "#" },
    { label: "Stockist list", href: "#" },
    { label: "Hiring Info", href: "recruit.html", key: "recruit" },
    { label: "Cat longevity research", href: "#" },
  ];
  const ICON = {
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 6h12v10H2zM14 9h4l3 3v4h-7z"/><circle cx="6" cy="17.5" r="1.8" fill="var(--kf-raised)"/><circle cx="17" cy="17.5" r="1.8" fill="var(--kf-raised)"/></svg>',
    chev: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3.5 1.5 7 5l-3.5 3.5"/></svg>',
    caret: '<svg viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 1l4 4 4-4"/></svg>',
    account: '<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="15" cy="15" r="13.4"/><path d="M9.5 9.5 11 5.8l2.6 3a8 8 0 0 1 2.8 0l2.6-3 1.5 3.7c1.3 1.4 2 3.1 2 5 0 3.9-3.3 7.5-7.5 7.5S7.5 18.4 7.5 14.5c0-1.9.7-3.6 2-5z"/></svg>',
    cart: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 6h4l3.5 15h15L29 10H9"/><circle cx="12.5" cy="26" r="1.8"/><circle cx="24" cy="26" r="1.8"/><path d="M13 14h13M14 18h11"/></svg>',
    mail: '<svg viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.2"><rect x=".6" y=".6" width="18.8" height="12.8"/><path d="m1 1 9 7 9-7"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 2l12 12M14 2 2 14"/></svg>',
    dot: '<svg viewBox="0 0 21 21"><circle cx="10.5" cy="10.5" r="9" fill="currentColor"/></svg>',
    wave: '<svg viewBox="0 0 120 8" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M0 4q5-4 10 0t10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0 10 0"/></svg>',
  };
  const SNS = ["Instagram", "LINE", "YouTube", "TikTok", "X", "Facebook", "note"];
  const snsIcon = (i) =>
    ['<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="14" height="14" rx="4"/><circle cx="9" cy="9" r="3.2"/></svg>',
     '<svg viewBox="0 0 18 18"><ellipse cx="9" cy="8.5" rx="7.5" ry="6" fill="currentColor"/><path d="M6 14l1.5 2.5L10 14z" fill="currentColor"/></svg>',
     '<svg viewBox="0 0 18 18"><rect x="1" y="3.5" width="16" height="11" rx="3" fill="currentColor"/><path d="M7.5 6.5v5l4-2.5z" fill="var(--kf-bg)"/></svg>',
     '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v10a3 3 0 1 1-3-3M10 2c.5 2 2 3.5 4.5 3.5"/></svg>',
     '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l12 12M15 3 3 15"/></svg>',
     '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="7.5" fill="currentColor"/><path d="M10 15V9.5h2l.3-2H10V6.3c0-.6.2-1 1-1h1.3V3.6c-.5 0-1.2-.1-1.8-.1-1.8 0-2.6 1-2.6 2.7v1.3H6v2h1.9V15z" fill="var(--kf-bg)"/></svg>',
     '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 15V4h7a3 3 0 0 1 3 3v8"/></svg>'][i];

  const wordmark = (cls) => `<span class="u-wordmark ${cls || ""}" data-label="Brand English wordmark · bold rounded lowercase">brand</span>`;

  /* ── Header ───────────────────────────────────────── */
  function header() {
    const items = NAV.map((n) => {
      const cur = n.key === page ? " is-current" : "";
      if (n.mega)
        return `<li class="u-nav__item has-mega" data-mega><a class="u-nav__mega u-nav__link${cur}" href="${n.href}">${n.label}<i class="u-caret">${ICON.caret}</i></a></li>`;
      return `<li class="u-nav__item"><a class="u-nav__link${cur}" href="${n.href}">${n.label}</a></li>`;
    }).join("");
    const pills = (arr) => arr.map((t) => `<a class="u-mega__pill" href="product.html">${t}</a>`).join("");
    return `
<div class="u-utility" data-slot="announcement-bar">
  <a class="u-utility__in" href="product.html"><i class="u-utility__ico">${ICON.truck}</i><p>Your one-line free shipping condition here [Notice]</p><i class="u-utility__arrow">${ICON.chev}</i></a>
</div>
<div class="u-header" data-slot="header">
  <header class="u-header__in">
    <button class="u-burger" type="button" aria-label="Open Menu" data-drawer-open><span></span><span></span></button>
    <a class="u-header__logo" href="index.html">${wordmark()}</a>
    <nav class="u-nav"><ul class="u-nav__list">${items}</ul></nav>
    <div class="u-header__icons">
      <a class="u-icon is-account" href="#" aria-label="Account">${ICON.account}</a>
      <a class="u-icon is-cart" href="#" aria-label="Cart" data-cart-open>${ICON.cart}</a>
    </div>
  </header>
  <div class="u-mega" data-slot="mega-menu" style="display:none">
    <div class="u-mega__in">
      <div class="u-mega__group">
        <p class="u-mega__label">Historical records</p>
        <div class="u-mega__content">
          <div class="u-mega__cat"><p class="u-mega__head"><i class="u-mega__dot is-a">${ICON.dot}</i>Choose by type</p><div class="u-mega__pills">${pills(["Raw feed | Staple food", "Dry Food ｜ Main Meal", "Functional purée | Treats", "Freeze-dried | Snacks", "Wet Food | Regular"])}</div></div>
          <div class="u-mega__cat"><p class="u-mega__head"><i class="u-mega__dot is-b">${ICON.dot}</i>Choose by Concern</p><div class="u-mega__pills">${pills(["Oral health", "Kidney & urinary health", "Hairball care", "Immunity support", "Section Health", "No added grains", "Weight Management"])}</div></div>
          <div class="u-mega__cat"><p class="u-mega__head"><i class="u-mega__dot is-c">${ICON.dot}</i>Choose by main ingredient</p><div class="u-mega__pills">${pills(["Chicken", "Fish", "Lamb", "Beef"])}</div></div>
        </div>
      </div>
      <div class="u-mega__group is-inline">
        <p class="u-mega__label">Supplies</p>
        <div class="u-mega__pills is-inline">${pills(["Rice bowl", "Scratcher box", "Kicking doll", "Sticker"])}</div>
      </div>
      <div class="u-mega__group is-inline">
        <p class="u-mega__label">Product list</p>
        <div class="u-mega__pills is-inline"><a class="u-mega__pill" href="product.html">View all products</a></div>
      </div>
      <div class="u-mega__close"><button type="button" data-mega-close>Close</button></div>
    </div>
  </div>
</div>`;
  }

  /* ── Front paw drawer ─────────────────────────────────────
     The original has a ”Blue Cat Paw” illustration at a 1848×6648 ratio reaching in diagonally from the bottom right — a newly drawn paw SVG at the same ratio */
  const PAW = `<svg class="u-paw" viewBox="0 0 1848 6648" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <g class="u-paw__claw"><path d="M560 160 615 0l55 175z"/><path d="M1180 175 1235 0l55 160z"/><path d="M150 560l60-150 50 140z"/><path d="M1590 550l50-140 60 150z"/></g>
    <path class="u-paw__arm" d="M330 1380c-60-30-180-110-270-250C-20 1000-10 830 90 700c120-150 330-170 450-100-55-180-10-300 90-410C760 50 980 70 1100 260l25 40 25-40c120-190 340-210 470-70 100 110 145 230 90 410 120-70 330-50 450 100 100 130 110 300 30 430-90 140-210 220-270 250-55 40-70 100-70 200 20 600 25 3600 30 5378H330c5-1778 10-4778 30-5378 0-100-15-160-70-200z"/>
  </svg>`;
  function drawer() {
    const pills = (arr) => `<div class="u-dw__pills">${arr.map((t) => `<a class="u-dw__pill" href="product.html">${t}</a>`).join("")}</div>`;
    const sub = (h, arr) => `<div class="u-dw__sub"><p class="u-dw__subhead">${h}<i class="u-dw__wave">${ICON.wave}</i></p>${pills(arr)}</div>`;
    return `
<div class="u-dw" data-slot="menu-drawer" aria-hidden="true">
  <div class="u-dw__bg">${PAW}</div>
  <button class="u-burger is-on" type="button" aria-label="Close Menu" data-drawer-close><span></span><span></span><p>Close</p></button>
  <div class="u-dw__body">
    <div class="u-dw__sec"><p class="u-dw__head">Product list</p><i class="u-dw__sep"></i>${pills(["View all products"])}</div>
    <div class="u-dw__sec"><i class="u-dw__sep"></i><p class="u-dw__head">Historical records</p><i class="u-dw__sep"></i>
      ${sub("Choose by type", ["Raw feed | Staple food", "Dry Food ｜ Main Meal", "Functional purée | Treats", "Freeze-dried | Snacks", "Wet Food | Regular"])}
      ${sub("Choose by Concern", ["Oral health", "Kidney & urinary health", "Hairball care", "Immunity support", "Section Health", "No added grains", "Weight Management"])}
      ${sub("Choose by main ingredient", ["Chicken", "Fish", "Lamb", "Beef"])}
    </div>
    <div class="u-dw__sec"><i class="u-dw__sep"></i><p class="u-dw__head">Supplies</p><i class="u-dw__sep"></i>${pills(["Rice bowl", "Scratcher box", "Kicking doll", "Sticker"])}<i class="u-dw__sep"></i></div>
    <div class="u-dw__sec"><ul class="u-dw__links"><li><a href="#">Development story</a></li><li><a href="#">Parent reviews</a></li><li><a href="#">Cats-only shop</a></li><li><a href="#">Retailer list</a></li></ul><i class="u-dw__sep"></i></div>
    <div class="u-dw__sec"><p class="u-dw__head">Longevity Lab</p><ul class="u-dw__links"><li><a href="#">About research</a></li><li><a href="#">Heart put into research</a></li><li><a href="#">Cat researcher roster</a></li><li><a href="#">Research news</a></li><li><a href="#">Frequently asked questions</a></li><li><a href="#">Join as a researcher</a></li></ul><i class="u-dw__sep"></i></div>
    <div class="u-dw__sec"><ul class="u-dw__sublinks"><li><a href="recruit.html">Hiring Info</a></li><li><a href="#">Frequently asked questions</a></li><li><a href="#">Contact Us</a></li><li><a href="#">Member Club</a></li></ul><i class="u-dw__sep"></i></div>
    <ul class="u-dw__sns">${SNS.map((s, i) => `<li><a href="#" aria-label="${s}">${snsIcon(i)}</a></li>`).join("")}</ul>
  </div>
</div>`;
  }

  /* ── Footer ───────────────────────────────────────── */
  function footer() {
    const col1 = [["First Page", "index.html"], ["Product list", "product.html"], ["Brand features", "service.html"], ["Cats-only shop", "#"], ["Development story", "#"], ["Parent reviews", "#"], ["Retailer list", "#"], ["Member Club", "#"]];
    const col2 = [["Hiring Info", "recruit.html"], ["News", "news.html"], ["Frequently asked questions", "#"], ["Contact Us", "#"], ["Terms of service", "#"], ["E-commerce Disclosure", "#"], ["Privacy policy", "#"], ["Basic policy on customer harassment", "#"]];
    const li = (a) => a.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("");
    const strip = `<span class="u-strip__word" data-label="Band marquee English sentence · large text with a cat sitting between the letters">unique for you.</span>`;
    return `
<footer class="u-footer" data-slot="footer">
  <div class="u-strip" data-slot="boundary-marquee">
    <div class="u-strip__track">
      <div class="u-strip__set">${strip}<i class="u-strip__cat" data-cat="peek" data-cat-tone="mint"></i>${strip}<i class="u-strip__cat" data-cat="peek" data-cat-tone="purple"></i></div>
    </div>
  </div>
  <div class="u-news-letter u-rise" data-slot="newsletter">
    <h2><span class="u-en" data-label="Newsletter English title">Newsletter</span>Newsletter</h2>
    <p>Your email subscription benefit goes here in one line.<br>Your two lines on what news you send go here. You occasionally send new products and cat stories.<br>Your final notice line here.</p>
    <form class="u-mail" onsubmit="return false"><input type="email" placeholder="Email Address" aria-label="Email address"><button type="button" aria-label="Send">${ICON.chev}</button></form>
    <div class="u-news-letter__cat" aria-hidden="true">
      <svg viewBox="0 0 200 150"><rect x="38" y="40" width="124" height="80" rx="6" class="u-fill-ink"/><rect x="46" y="48" width="108" height="64" class="u-fill-blue"/><path d="M20 128h160l-14 14H34z" class="u-fill-ink"/><path d="M70 120c-6-30 4-60 30-68l6-16 12 14 14-12 2 18c22 10 26 40 18 64z" class="u-fill-accent"/><circle cx="112" cy="84" r="4" class="u-fill-ink"/><circle cx="134" cy="84" r="4" class="u-fill-ink"/><path d="M40 130c10-6 40-8 60-2" class="u-stroke-yellow"/></svg>
    </div>
  </div>
  <div class="u-fbox">
    <div class="u-fbox__navi"><p class="u-fbox__title">Content</p><div class="u-fbox__cols"><ul class="u-fnavi">${li(col1)}</ul><ul class="u-fnavi">${li(col2)}</ul></div></div>
    <div class="u-fbox__sns"><p class="u-fbox__title">Official Account</p><ul class="u-sns">${SNS.map((s, i) => `<li><a href="#"><span>${snsIcon(i)}</span>${s}</a></li>`).join("")}</ul></div>
  </div>
  <p class="u-copy">© Brand Name Inc.</p>
</footer>
<a class="u-cta" href="product.html" data-slot="floating-cta" style="display:none"><i class="u-cta__cat" data-cat="cta"></i><span>Your new product alert here!</span></a>
<div class="u-cookie" data-slot="cookie">
  <button class="u-cookie__close" type="button" aria-label="Close">${ICON.close}</button>
  <div class="u-cookie__cat" aria-hidden="true"><svg viewBox="0 0 120 80"><path d="M8 70c6-22 22-30 40-30h34c4-14 6-26 2-36l10 8 8-8 2 22c8 10 10 24 6 44h-8c0-10-2-16-6-20-6 6-16 10-30 10-10 0-18-2-24-6-6 6-10 12-12 22h-8l2-18c-6 4-10 10-12 14z" class="u-fill-purple"/><circle cx="96" cy="22" r="2.4" class="u-fill-ink"/><circle cx="106" cy="22" r="2.4" class="u-fill-ink"/><path d="M14 74h8M30 74h6" class="u-stroke-ink"/></svg></div>
  <div class="u-cookie__text"><p>This site uses cookies<br>We use it.</p><button class="u-cookie__ok" type="button">OK</button></div>
</div>`;
  }

  function loader() {
    return `<div class="u-loader" id="u-loader" data-slot="loader"><div class="u-loader__logo"><i data-cat="puddle" data-cat-tone="accent" data-cat-size="loader"></i></div></div>`;
  }

  // Cart drawer (theme cart-drawer) — a 400px right-hand panel slides in with .2s ease over a 50% ink backdrop
  function cart() {
    return `<div class="u-cart" data-slot="cart-drawer" aria-hidden="true"><div class="u-cart__overlay" data-cart-close></div><div class="u-cart__inner"><button class="u-cart__close" type="button" aria-label="Close" data-cart-close>${ICON.close}</button><div class="u-cart__empty"><div class="u-cart__cat" aria-hidden="true"><svg viewBox="0 0 200 120"><path d="M20 112c10-30 40-46 80-46h40c6-20 8-36 4-50l14 12 12-12 2 30c10 14 12 34 8 66z" class="u-fill-purple"/><circle cx="150" cy="40" r="3" class="u-fill-ink"/><circle cx="166" cy="40" r="3" class="u-fill-ink"/></svg></div><p>Your cart is empty</p><a class="u-btn" href="product.html">Continue shopping</a></div></div></div>`;
  }

  /* ── Paste ─────────────────────────────────────── */
  const top = document.querySelector("[data-site-header]");
  if (top) top.outerHTML = header();
  const bot = document.querySelector("[data-site-footer]");
  if (bot) bot.outerHTML = footer();
  if (!document.querySelector("[data-no-loader]")) document.body.insertAdjacentHTML("afterbegin", loader());
  document.body.insertAdjacentHTML("beforeend", drawer() + cart());

  /* ── Lottie cat — draws our own cat at the same panel size and length as the original four (3s, 10s, 10s, 5s loops, 29.97fps) ── */
  const toRGB = (() => {
    const c = document.createElement("canvas").getContext("2d");
    return (css) => {
      c.clearRect(0, 0, 1, 1);
      c.fillStyle = "transparent";
      c.fillStyle = css;
      c.fillRect(0, 0, 1, 1);
      const d = c.getImageData(0, 0, 1, 1).data;
      return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
    };
  })();
  const tone = (name) => {
    const cs = getComputedStyle(document.documentElement);
    const v = (n) => cs.getPropertyValue(n).trim();
    const map = { accent: "--kf-accent", ink: "--kf-ink", bg: "--kf-bg", white: "--kf-raised", mint: "--site-mint", purple: "--site-purple", blue: "--site-blue", yellow: "--site-yellow", green: "--site-green" };
    return toRGB(v(map[name] || "--kf-accent"));
  };
  const K = (k) => ({ a: 0, k });
  const anim = (keys) => ({ a: 1, k: keys.map(([t, s], i) => (i < keys.length - 1 ? { t, s, i: { x: [0.45], y: [1] }, o: { x: [0.55], y: [0] } } : { t, s })) });
  const tr = (extra = {}) => Object.assign({ ty: "tr", p: K([0, 0]), a: K([0, 0]), s: K([100, 100]), r: K(0), o: K(100), sk: K(0), sa: K(0) }, extra);
  // Turn a few points into a smooth closed path — Catmull-Rom as Bezier handles
  const smooth = (pts, closed = true, t = 0.22) => {
    const n = pts.length, i = [], o = [];
    for (let k = 0; k < n; k++) {
      const p0 = pts[(k - 1 + n) % n], p2 = pts[(k + 1) % n];
      const dx = (p2[0] - p0[0]) * t, dy = (p2[1] - p0[1]) * t;
      i.push([-dx, -dy]);
      o.push([dx, dy]);
    }
    return { i, o, v: pts, c: closed };
  };
  const poly = (pts) => ({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts, c: true });
  const shapeLayer = (ind, nm, items, op, ks = {}) => ({
    ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, ip: 0, op, st: 0, bm: 0,
    ks: Object.assign({ o: K(100), r: K(0), p: K([0, 0, 0]), a: K([0, 0, 0]), s: K([100, 100, 100]) }, ks),
    shapes: [{ ty: "gr", nm, it: items.concat(tr()) }],
  });
  const fill = (c) => ({ ty: "fl", c: K(c), o: K(100), r: 1 });
  const path = (d) => ({ ty: "sh", ks: K(d) });
  const ell = (x, y, w, h) => ({ ty: "el", p: K([x, y]), s: K([w, h]) });
  // A pair of eyes — ink circles with no whites, closing for 4 frames and reopening every blinks frame
  const eyes = (ind, cx, cy, gap, r, op, blinks, ink) => {
    const keys = [[0, [100, 100, 100]]];
    blinks.forEach((b) => keys.push([b, [100, 100, 100]], [b + 2, [100, 10, 100]], [b + 5, [100, 100, 100]]));
    keys.push([op, [100, 100, 100]]);
    return shapeLayer(ind, "eyes", [ell(-gap / 2, 0, r * 2, r * 2), ell(gap / 2, 0, r * 2, r * 2), fill(ink)], op, { p: K([cx, cy, 0]), s: anim(keys) });
  };
  const CATS = {
    // Melted cat — 250×100, 90-frame (3s) loop: flattens and stretches as if breathing, and blinks once
    puddle: (c, ink) => {
      const op = 90, body = smooth([[6, 92], [20, 80], [44, 74], [62, 56], [68, 38], [76, 30], [84, 12], [94, 26], [112, 24], [122, 8], [128, 28], [138, 40], [160, 48], [184, 50], [204, 62], [228, 72], [246, 84], [236, 96], [196, 94], [150, 98], [100, 99], [50, 96], [14, 99]]);
      return { w: 250, h: 100, op, layers: [eyes(1, 106, 46, 22, 3.4, op, [40], ink), shapeLayer(2, "body", [path(body), fill(c)], op, { a: K([125, 100, 0]), p: K([125, 100, 0]), s: anim([[0, [100, 100, 100]], [45, [101.5, 95, 100]], [90, [100, 100, 100]]]) })] };
    },
    // Cat peeking over the cell — 190×100, 300 frames (10s): blinks twice, ear twitches once
    peek: (c, ink) => {
      const op = 300, head = smooth([[20, 100], [24, 60], [40, 36], [46, 8], [66, 26], [95, 22], [124, 26], [144, 8], [150, 36], [166, 60], [170, 100]]);
      return { w: 190, h: 100, op, layers: [eyes(1, 95, 62, 40, 4.4, op, [96, 228], ink), shapeLayer(2, "head", [path(head), fill(c)], op, { a: K([95, 100, 0]), p: K([95, 100, 0]), r: anim([[0, 0], [150, 0], [160, -3], [172, 2], [184, 0], [300, 0]]) })] };
    },
    // Sitting cat — 300×320, 300 frames (10s): the tail sways slowly and it blinks twice
    sit: (c, ink) => {
      const op = 300, body = smooth([[70, 320], [64, 250], [80, 190], [98, 150], [92, 110], [100, 60], [96, 18], [128, 44], [170, 44], [202, 18], [198, 60], [206, 110], [200, 150], [222, 200], [238, 260], [232, 320]]);
      const tail = smooth([[226, 300], [262, 286], [282, 250], [276, 212], [262, 214], [266, 248], [252, 274], [222, 286]]);
      return { w: 300, h: 320, op, layers: [eyes(1, 150, 92, 46, 5, op, [80, 210], ink), shapeLayer(2, "body", [path(body), fill(c)], op), shapeLayer(3, "tail", [path(tail), fill(c)], op, { a: K([230, 296, 0]), p: K([230, 296, 0]), r: anim([[0, 0], [75, 8], [150, 0], [225, 8], [300, 0]]) })] };
    },
    // A cat lying on a floating button: 420×150, 150 frames (5s): tail flick, front paw taps
    cta: (c, ink) => {
      const op = 150, pill = smooth([[40, 70], [210, 66], [380, 70], [404, 104], [380, 140], [210, 144], [40, 140], [16, 104]], true, 0.18);
      const head = smooth([[300, 72], [304, 42], [312, 22], [326, 36], [350, 34], [366, 20], [372, 44], [374, 72]]);
      const tail = smooth([[60, 74], [40, 50], [44, 24], [56, 26], [54, 50], [72, 70]]);
      const paw = ell(0, 0, 26, 16);
      return { w: 420, h: 150, op, layers: [
        eyes(1, 337, 52, 22, 3.2, op, [60, 118], ink),
        shapeLayer(2, "paw", [paw, fill(c)], op, { p: anim([[0, [356, 70, 0]], [20, [356, 62, 0]], [30, [356, 70, 0]], [40, [356, 62, 0]], [50, [356, 70, 0]], [150, [356, 70, 0]]]) }),
        shapeLayer(3, "head", [path(head), fill(c)], op),
        shapeLayer(4, "tail", [path(tail), fill(c)], op, { a: K([66, 72, 0]), p: K([66, 72, 0]), r: anim([[0, 0], [37, -14], [75, 0], [112, -14], [150, 0]]) }),
        shapeLayer(5, "pill", [path(pill), fill(c)], op),
      ] };
    },
  };
  const cats = [];
  function makeCat(el) {
    if (!window.lottie || el.dataset.catReady) return;
    el.dataset.catReady = "1";
    const kind = el.dataset.cat;
    const toneName = el.dataset.catTone || (kind === "peek" ? "mint" : kind === "sit" ? "blue" : "accent");
    const d = CATS[kind](tone(toneName), tone("ink"));
    const data = { v: "5.9.6", fr: 29.9700012207031, ip: 0, op: d.op, w: d.w, h: d.h, nm: kind, ddd: 0, assets: [], layers: d.layers };
    // Kept as in the original — loop: true, autoplay: false. It plays once when it reaches the bottom of the screen, then keeps running
    const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: true, autoplay: false, animationData: data });
    cats.push({ el, a, playing: false });
  }
  function catsOnScroll() {
    const y = scrollY;
    cats.forEach((c) => {
      if (c.playing) return;
      const top = c.el.getBoundingClientRect().top + y;
      if (y > top - innerHeight - (+c.el.dataset.catOffset || 0) || c.el.closest(".u-loader,.u-cta")) {
        c.playing = true;
        c.el.classList.add("playing");
        if (reduce) c.a.goToAndStop(0, true);
        else c.a.play();
      }
    });
  }
  document.querySelectorAll("[data-cat]").forEach(makeCat);
  addEventListener("scroll", catsOnScroll, { passive: true });
  catsOnScroll();
  window.uCats = { make: makeCat, refresh: catsOnScroll };

  /* ── Loader: waits 1.5s after load, then clears over 1s (jQuery fadeOut, swing) ── */
  addEventListener("load", () => {
    const l = document.getElementById("u-loader");
    if (!l) return;
    setTimeout(() => $(l).fadeOut(1000), reduce ? 0 : 1500);
  });

  /* ── Mega menu: on hover the panel fades in via jQuery fadeIn(.4s swing), and fades out on leave ── */
  const mega = $(".u-mega");
  let megaOut;
  $("[data-mega], .u-mega").on("mouseenter", () => {
    if (!matchMedia("(min-width: 1009px)").matches) return;
    clearTimeout(megaOut);
    $("[data-mega]").addClass("is-open");
    mega.stop(true).fadeIn(400);
  }).on("mouseleave", () => {
    megaOut = setTimeout(() => {
      $("[data-mega]").removeClass("is-open");
      mega.stop(true).fadeOut(400);
    }, 60);
  });
  // Original “product list” is a details element — pressing opens and closes it
  $("[data-mega] > a").on("click", (e) => {
    if (!matchMedia("(min-width: 1009px)").matches) return;
    e.preventDefault();
    const open = !$("[data-mega]").hasClass("is-open");
    $("[data-mega]").toggleClass("is-open", open);
    open ? mega.stop(true).fadeIn(400) : mega.stop(true).fadeOut(400);
  });
  $("[data-mega-close]").on("click", () => { $("[data-mega]").removeClass("is-open"); mega.stop(true).fadeOut(400); });

  /* ── Front-paw drawer: original .menuBox — pins the body (remembers scroll position) and toggles .show. Motion lives in the reach-drawer part css ── */
  let pos = 0, open = false;
  const dw = document.querySelector(".u-dw");
  const toggle = (want) => {
    if (want === open) return;
    open = want;
    if (open) {
      pos = scrollY;
      document.body.classList.add("is-fixed");
      document.body.style.top = -pos + "px";
    } else {
      document.body.classList.remove("is-fixed");
      document.body.style.top = "0px";
      scrollTo(0, pos);
    }
    dw.classList.toggle("show", open);
    dw.setAttribute("aria-hidden", open ? "false" : "true");
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-drawer-open]")) { e.preventDefault(); toggle(true); }
    else if (e.target.closest("[data-drawer-close]")) { e.preventDefault(); toggle(false); }
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { toggle(false); cartSet(false); } });

  const cartEl = document.querySelector(".u-cart");
  const cartSet = (on) => { if (!cartEl) return; cartEl.classList.toggle("active", on); cartEl.setAttribute("aria-hidden", on ? "false" : "true"); document.body.classList.toggle("u-overflow-hidden", on); };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-cart-open]")) { e.preventDefault(); cartSet(true); }
    else if (e.target.closest("[data-cart-close]")) { e.preventDefault(); cartSet(false); }
  });

  /* ── Cookie notice: visible at first like the original, hidden by OK·close (OK is remembered for 1 year) ── */
  const ck = document.querySelector(".u-cookie");
  if (ck) {
    const seen = localStorage.getItem("u-cookie-ok");
    if (!seen || Date.now() > +seen) ck.classList.add("is-show");
    ck.querySelector(".u-cookie__ok").addEventListener("click", () => { ck.classList.add("is-hide"); localStorage.setItem("u-cookie-ok", String(Date.now() + 365 * 864e5)); });
    ck.querySelector(".u-cookie__close").addEventListener("click", () => ck.classList.add("is-hide"));
  }

  /* ── Floating button: fadeIn after passing the top edge of the Hero, fadeOut (.4s) when scrolling back up ── */
  const cta = $(".u-cta");
  const startEl = document.querySelector("[data-cta-start]");
  if (startEl && cta.length) {
    const start = () => startEl.getBoundingClientRect().top + scrollY;
    let shown = false;
    const on = () => {
      const want = start() < scrollY;
      if (want !== shown) { shown = want; want ? cta.stop(true).fadeIn() : cta.stop(true).fadeOut(); }
    };
    addEventListener("scroll", on, { passive: true });
  }

  /* ── Rise on view: theme scroll-trigger — once an element is within 50px of the bottom, it rises from 2rem over .6s cubic-bezier(0,0,.3,1) ── */
  const rise = document.querySelectorAll(".u-rise");
  if (reduce) rise.forEach((el) => el.classList.add("is-in"));
  else {
    const io = new IntersectionObserver((ents) => ents.forEach((en, i) => {
      if (!en.isIntersecting) return;
      if (en.target.hasAttribute("data-cascade")) en.target.style.setProperty("--order", i);
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    }), { rootMargin: "0px 0px -50px 0px" });
    rise.forEach((el) => io.observe(el));
  }

  /* ── Same-page anchors: subtract the header height and animate with jQuery over 1s ── */
  $(document).on("click", 'a[href^="#"]:not([href="#"])', function (e) {
    const t = $(this.hash);
    if (!t.length) return;
    e.preventDefault();
    const head = $(".u-header, .r-header").first();
    const inDrawer = $(this).closest(".u-dw").length;
    const go = () => $("html,body").animate({ scrollTop: t.offset().top - (head.outerHeight() || 0) }, 1000);
    if (inDrawer) { toggle(false); setTimeout(go, 100); } else go();
  });
})();
