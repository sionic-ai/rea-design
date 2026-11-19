// Common to all pages: draws in the header, drawer, notice strip, footer and loader curtain, fills the shared sections (product rows, reviews, FAQ, flowing photo strip), then hooks up the motion.
// Original values: Lenis 1.1s easeOutQuart · loader .35s/.25s Power4.out · dot nav 1s power1.inOut (shrinks to .6x then grows) · footer dot .6s
// Product copy 1.2s power2.out at 0.2 intervals · photo curtain 1.5s power1.out · review fade 2s/5s · accordion 400ms · photo strip .5px/frame.
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const NU = (window.NU = { reduced, lenis: null, page });

  // Skin variables turned into rgba text that GSAP · canvas can read — color-mix · oklch(from …) types compute to color(srgb) · oklab · oklch, which GSAP can’t parse
  const probe = document.createElement("i");
  const lin = (x) => 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055);
  const fromOklab = (L, a, b) => {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(lin);
  };
  NU.color = (name, alpha = 1) => {
    probe.style.color = `var(${name})`;
    document.documentElement.append(probe);
    const css = getComputedStyle(probe).color;
    probe.remove();
    const n = (css.match(/-?[\d.]+(?:e-?\d+)?/g) || []).map(Number);
    const slash = /\//.test(css);
    let rgb, a = 1;
    if (/^color\(srgb/.test(css)) { rgb = n.slice(0, 3).map((v) => v * 255); if (slash) a = n[3]; }
    else if (/^oklab/.test(css)) { rgb = fromOklab(n[0], n[1], n[2]); if (slash) a = n[3]; }
    else if (/^oklch/.test(css)) { const h = (n[2] * Math.PI) / 180; rgb = fromOklab(n[0], n[1] * Math.cos(h), n[1] * Math.sin(h)); if (slash) a = n[3]; }
    else { rgb = n.slice(0, 3); if (n.length > 3) a = n[3]; }
    const [r, g, b] = rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))));
    return `rgba(${r},${g},${b},${+(a * alpha).toFixed(3)})`;
  };

  const arrow = '<svg viewBox="0 0 11 6" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 3h10M7.6.6 10.3 3 7.6 5.4"/></svg>';
  const tri = '<svg class="nu-line-link__arrow" viewBox="0 0 9 8" fill="currentColor"><path d="M0 0 9 4 0 8Z"/></svg>';
  const chev = '<svg viewBox="0 0 6 5" fill="currentColor"><path d="M3 0 6 5H0Z"/></svg>';
  const insta = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1"><rect x=".5" y=".5" width="11" height="11" rx="3"/><circle cx="6" cy="6" r="2.6"/><circle cx="9.2" cy="2.8" r=".5" fill="currentColor"/></svg>';
  const word = (cls = "") => `<span class="nu-wordmark ${cls}" aria-label="Brand Logo">${[..."BRAND"].map((c) => `<span>${c}</span>`).join("")}</span>`;
  NU.icons = { arrow, tri, chev, word };

  // ── Header · drawer · notice bar ──
  const navItems = [
    ["Home", "index.html", "home"],
    ["About", "about.html", "about"],
    ["Products", "product.html", "product"],
    ["Buying Guide", "#", ""],
    ["FAQ", "index.html#faq", ""],
    ["Contact", "#", ""],
    ["Account", "#", ""],
  ];
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("nu-head");
    head.innerHTML = `
      <div class="nu-head__logo"><a class="nu-logo" href="index.html">${word()}</a></div>
      <div class="nu-head__nav">
        <nav class="nu-nav" aria-label="Main menu" data-label="Menu name (one or two English words)">
          <ul>
            ${navItems.map(([t, h, p]) => `<li><a class="nu-en-j" href="${h}"><span data-nav-link class="${p === page ? "is-current" : ""}">${t}</span></a></li>`).join("")}
            <li><a class="nu-en-j" href="#"><span data-nav-link>Cart</span><span class="nu-en-i nu-count">(0)</span></a></li>
          </ul>
          <span class="nu-nav__marker" aria-hidden="true"></span>
        </nav>
      </div>
      <div class="nu-head__sp">
        <a class="nu-en-f" href="#">Cart<span class="nu-en-i nu-count">(0)</span></a>
        <button class="nu-burger" type="button" aria-label="Menu" aria-expanded="false"><span><svg width="24" height="1" viewBox="0 0 24 1"><rect width="24" height="1" fill="currentColor"/></svg></span><span><svg width="24" height="1" viewBox="0 0 24 1"><rect width="24" height="1" fill="currentColor"/></svg></span></button>
      </div>`;
    // Like the original, the drawer also sits inside the header — if the header is transparent on the Hero, the drawer is hidden too
    head.insertAdjacentHTML("beforeend", `
      <div class="nu-drawer" data-slot="menu-drawer" data-lenis-prevent>
        <nav aria-label="Phone menu"><ul>
          ${navItems.filter(([, , p]) => p !== "news").map(([t, h, p], i) => `<li style="display: none; transition-delay:${150 + i * 50}ms"><a class="nu-en-j" href="${h}"><span class="nu-drawer__t${p === page ? " is-current" : ""}">${t}</span></a></li>`).join("")}
        </ul></nav>
        <p class="nu-en-h" style="display: none; transition-delay:500ms" data-label="Three English lines introducing the brand">BRAND is a short line that introduces the brand.<br>A second line carries the thought on<br>and a third line closes it.</p>
      </div>`);
    if (page !== "home") {
      head.insertAdjacentHTML("beforebegin", `<div class="nu-announce nu-ja-f" data-slot="announce">Your one line of shipping info here (<a href="#">Exceptions info</a>)</div>`);
    }
  }

  // ── Loader Curtain ──
  document.body.insertAdjacentHTML("afterbegin", '<div class="nu-loader" aria-hidden="true"></div>');
  const loader = document.querySelector(".nu-loader");
  NU.hideLoader = (duration = 0.35) => {
    gsap.to(loader, {
      opacity: 0, duration: reduced ? 0 : duration, ease: "power4.out",
      onComplete: () => { loader.classList.add("is-done"); document.dispatchEvent(new CustomEvent("nu:loaded")); },
    });
  };
  const isInternal = (a) => {
    if (a.target === "_blank" || a.hostname !== location.hostname) return false;
    const href = a.getAttribute("href");
    return !(!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"));
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || !isInternal(a)) return;
    e.preventDefault();
    loader.classList.remove("is-done");
    gsap.to(loader, { opacity: 1, duration: reduced ? 0 : 0.25, ease: "power4.out", onComplete: () => { location.href = a.href; } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  // ── Shared section fill ──
  const products = [
    { label: "Product-only shot · single white pump bottle · solid apricot-beige floor and wall · soft front light · portrait 2:3", size: "00ml" },
    { label: "Product-only shot · short, thick white cream jar · solid apricot-beige background · soft front light · portrait 2:3", size: "00g" },
    { label: "Product solo shot · slender white bottle · apricot beige solid background · faint shadow on the floor · portrait 2:3", size: "00ml" },
  ];
  const productRows = () => products.map((p, i) => `
    <li style="--order:${i + 1}">
      <div class="nu-grid nu-prod" data-prod>
        <div class="nu-prod__img" data-prod-img>
          <div class="wf-img" data-label="${p.label}"></div>
          <div class="nu-prod__mask" data-prod-mask></div>
        </div>
        <div class="nu-prod__body">
          <div>
            <p class="nu-ja-f nu-prod__lead">Your key ingredient here, in one line</p>
            <h2 class="nu-ja-c nu-prod__name">Product name ${i + 1}</h2>
            <div class="nu-prod__price"><span class="nu-ja-f">${p.size}</span><span class="nu-ja-f">₩00,000</span><span class="nu-ja-i">Tax Included</span></div>
          </div>
          <p class="nu-body-e nu-prod__desc">Put a product description in four lines here. Write in a calm tone which ingredients it contains and how, and how the skin feels when used. The original has about two and a half sentences here. End the last line short.</p>
          <a class="nu-ja-e nu-line-link is-white" href="product.html"><span>View product page</span>${tri}<span class="nu-wave"></span></a>
        </div>
        <div class="nu-prod__catch"><p class="nu-ja-c nu-vert" data-catch>Your vertical tagline here
Continue on the second line
It wraps up on the third line.</p></div>
      </div>
    </li>`).join("");
  NU.productRows = productRows;

  const voices = [
    ["Product name 1", "The review goes here in four lines. How things changed within days of use, and how the scent and the feel of applying were, in the customer’s own voice. End with a short last line."],
    ["Product name 2", "Your short review goes here in one line."],
    ["Product name 1", "Your three-line review here. Say it spreads well even in small amounts, and its pocket-friendly size makes it easy to pack for trips."],
    ["Product name 3", "Your two-line review goes here. Describe a feel that is not sticky and keeps its moisture for long."],
    ["Product name 2", "Three lines of review go here. Say that after two or three days the skin felt firmer, and after about a week tightness after washing the face eased."],
    ["Product name 1", "Your review here, in two lines. Say they noticed a natural glow the morning after applying it."],
    ["Product name 3", "Your review here, in three lines. Say their breakouts lessened about two weeks after they started using it."],
  ];
  const voicePhotos = [
    "On a bathroom sink · product bottle and a small vase · morning sun through the window · portrait",
    "Woman from behind in front of a mirror · towel-wrapped shoulders · dim indoor light · portrait",
    "Three products on a shelf · leaf shadows · warm afternoon light · portrait",
    "Close-up of cream scooped onto a palm · soft diffused light · vertical",
    "Product and glass on window table · backlit · portrait",
  ];
  const faqs = [
    ["Your first question goes here?", "<p>Answer here. In the original, a nine-line return policy goes in this spot.</p><p>Continue with the second paragraph. List conditions and deadlines in order.</p><p>The third paragraph holds contact information.</p>"],
    ["Is your second question going here?", "<p>Your one-line answer goes here.</p>"],
    ["Your third question goes here?", "<p>Your answer here, three lines.<br>Continues with the second line.<br>Wrapping up with a third line.</p>"],
  ];

  const tpl = {
    "line-up": () => `
      <h2 class="nu-lineup__title nu-en-a" data-title-chars data-label="Product lineup section English name (one word)">Catalog</h2>
      <div class="nu-grid nu-lineup__catch" data-lineup-catch>
        <div class="nu-lineup__circles" aria-hidden="true">
          <div class="nu-lineup__ring">
            <svg viewBox="0 0 420 420" fill="none"><circle data-ring cx="210" cy="210" r="209.5" stroke="currentColor" stroke-width="1"/></svg>
            <div class="is-second" data-ring2><svg viewBox="0 0 420 420" fill="none"><circle cx="210" cy="210" r="209.5" stroke="currentColor" stroke-width="1"/></svg></div>
          </div>
        </div>
        <div class="nu-lineup__text">
          <h3 class="nu-en-b" data-main-catch data-label="Product series English name">Series Name</h3>
          <p class="nu-body-a" data-sub-catch>Your bundle intro here<br class="nu-sp-only">Add one line.</p>
        </div>
      </div>
      <ul class="nu-products nu-lineup__list">${productRows()}</ul>`,
    "user-voice": () => `
      <div class="nu-grid nu-voice__grid">
        <div class="nu-voice__main">
          <h2 class="nu-en-b nu-voice__title" data-label="English name of the customer testimonials section (two words)">Kind<br class="nu-sp-only"> Words</h2>
          <div class="nu-voice__slider splide" data-voice aria-label="Review">
            <div class="nu-voice__track splide__track"><ul class="splide__list">
              ${voices.map(([t, c]) => `<li class="nu-voice__slide splide__slide"><div><h3 class="nu-ja-c">${t}</h3><p class="nu-body-c">${c}</p></div><p class="nu-ja-f nu-voice__name">Region · 00s</p></li>`).join("")}
            </ul></div>
          </div>
        </div>
        <div class="nu-voice__photos"><div class="nu-voice__stack" data-voice-stack>
          ${voicePhotos.map((l) => `<div class="wf-img" data-label="${l}"></div>`).join("")}
        </div></div>
      </div>`,
    faq: () => `
      <div class="nu-faq__wrap">
        <div class="nu-faq__head">
          <h2 class="nu-en-b" data-label="FAQ section English name">FAQ</h2>
          <a class="nu-en-f nu-more" href="#" data-label="View full list button English text"><span>see all</span>${arrow}</a>
        </div>
        <dl class="nu-faq__list">
          ${faqs.map(([q, a]) => `<div class="nu-faq__item" data-acc><dt><button class="nu-ja-e nu-faq__q" type="button" aria-expanded="false"><span><span class="nu-faq__mark">Q</span><span>${q}</span></span><span class="nu-faq__chev">${chev}</span></button></dt><dd class="nu-faq__a" data-acc-panel><div class="nu-body-c">${a}</div></dd></div>`).join("")}
        </dl>
      </div>`,
    flow: () => `
      <h2 class="nu-flow__title"><p class="nu-vert">Your vertical text,<br>Add two lines.</p></h2>
      <p class="nu-en-h nu-flow__en" data-label="Two short English lines beside the photo strip">A short line set beside<br>the strip of photos.</p>
      <div class="nu-flow__slider splide" data-flow aria-label="Photo strip">
        <div class="splide__track"><ul class="splide__list">
          <li class="nu-flow__slide splide__slide"><div class="wf-img nu-ph-dark" data-label="Half-length portrait · woman holding a product bottle under her chin · indoor window side light · person on the right 2/3, vertical text in the left margin · 1440:800 landscape"></div></li>
          <li class="nu-flow__slide splide__slide"><div class="wf-img nu-ph-dark" data-label="Hand close-up · hand spreading cream on an arm · soft natural light filtered through curtains · landscape 1440:800"></div></li>
        </ul></div>
      </div>`,
  };
  const slotFor = { "line-up": "line-up", "user-voice": "user-voice", faq: "faq", flow: "image-flow" };
  const classFor = { "line-up": "nu-lineup", "user-voice": "nu-voice", faq: "nu-faq", flow: "nu-flow" };
  document.querySelectorAll("[data-include]").forEach((el) => {
    const key = el.dataset.include;
    if (!tpl[key]) return;
    const notes = [...el.querySelectorAll(":scope > .wf-note")];
    el.innerHTML = tpl[key]();
    el.prepend(...notes);
    el.classList.add(classFor[key]);
    if (!el.dataset.slot) el.dataset.slot = slotFor[key];
  });
  document.querySelectorAll("[data-product-rows]").forEach((el) => { el.innerHTML = productRows(); });

  // ── Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const footNav = [["Home", "index.html", "home"], ["About", "about.html", "about"], ["Products", "product.html", "product"], ["Buying Guide", "#", ""], ["Journal", "news.html", "news"], ["FAQ", "index.html#faq", ""], ["Contact", "#", ""]];
    const footPhotos = ["Woman in a white dress in front of a curtain · vertical crop outside the face · hazy backlight", "Product bottle on the sink · morning sunlight · portrait", "Woman’s profile resting chin on hand · soft window light · portrait", "Close-up of a product bottle in hand · beige background · portrait", "Back of shoulders wrapped in a towel · indoor light · portrait", "Glass vase and product · leaf shadows · portrait"];
    foot.classList.add("nu-foot");
    foot.innerHTML = `
      <div class="nu-grid nu-foot__top">
        <div class="nu-foot__logo">${word()}</div>
        <div class="nu-foot__navcol">
          <nav class="nu-foot__nav" aria-label="Footer Menu" data-foot-nav data-label="Menu name (one or two English words)">
            <ul>${footNav.map(([t, h, p]) => `<li><a class="nu-en-d" href="${h}"><span data-nav-link class="${p === page ? "is-current" : ""}">${t}</span></a></li>`).join("")}</ul>
            <span class="nu-foot__marker" aria-hidden="true"></span>
          </nav>
          <a class="nu-en-d nu-foot__insta" href="#"><span>Instagram</span><span class="nu-foot__insta-ico">${insta}</span></a>
        </div>
        <div class="nu-foot__photo splide" data-foot-photos aria-label="Footer Photo"><div class="splide__track"><ul class="splide__list">${footPhotos.map((l) => `<li class="splide__slide"><div class="wf-img" data-label="${l}"></div></li>`).join("")}</ul></div></div>
      </div>
      <div class="nu-grid nu-foot__bottom">
        <div class="nu-foot__brand"><svg class="nu-foot__brand-mark" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width=".8"><circle cx="13" cy="13" r="12.4"/><path d="M10 7.5v11M10 7.5h3.2a3 3 0 0 1 0 6H10M13 13.5l3.6 5"/></svg><span class="nu-foot__brand-name" data-label="Operating company English name">Company Name</span></div>
        <div class="nu-foot__links"><ul><li><a class="nu-ja-h" href="#">Legal notice</a></li><li><a class="nu-ja-h" href="#">Privacy policy</a></li><li><a class="nu-ja-h" href="#">Operating company</a></li></ul></div>
        <p class="nu-en-h nu-foot__copy">(c) 0000 BRAND</p>
      </div>`;
  }

  // ── Smooth scroll ──
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.1, easing: (x) => 1 - Math.pow(1 - x, 4) });
    NU.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToHash = (hash, immediate) => {
    const t = hash && hash.length > 1 && document.querySelector(hash);
    if (!t) return false;
    const y = scrollY + t.getBoundingClientRect().top - (head ? head.offsetHeight : 0);
    if (NU.lenis && !immediate) NU.lenis.scrollTo(y, { duration: 1 });
    else scrollTo(0, y);
    return true;
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    const [path, hash] = href.split("#");
    const here = !path || location.pathname.endsWith("/" + path);
    if (here && hash && scrollToHash("#" + hash)) e.preventDefault();
  });
  document.addEventListener("nu:loaded", () => { if (location.hash) scrollToHash(location.hash, true); });

  // ── Header text: white over photo · beige sections, hidden when touching the footer ──
  if (head) {
    const logoBox = head.querySelector(".nu-head__logo");
    const lights = [...document.querySelectorAll('[data-header="light"]')];
    const footer = document.querySelector('[data-slot="footer"]');
    const check = () => {
      const h = logoBox.offsetHeight || 90;
      const light = lights.some((s) => { const r = s.getBoundingClientRect(); return r.top < h && r.bottom > 0; });
      head.classList.toggle("is-light", light);
      head.classList.toggle("is-hidden", !!footer && footer.getBoundingClientRect().top <= h);
    };
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
    check();
    NU.checkHeader = check;

    // Dot nav: moves to the center of the hovered item over 1s, shrinking to .6x and growing back meanwhile
    const nav = head.querySelector(".nu-nav");
    const marker = head.querySelector(".nu-nav__marker");
    const active = nav.querySelector("[data-nav-link].is-current");
    const xOf = (el) => {
      if (!el) return -9999;
      const r = el.getBoundingClientRect(), n = nav.getBoundingClientRect();
      return r.left - n.left + r.width / 2 - marker.offsetWidth / 2;
    };
    let cur = xOf(active);
    gsap.set(marker, { x: cur, scale: 1 });
    const moveTo = (x) => {
      if (x === cur) return;
      cur = x;
      const tl = gsap.timeline();
      tl.to(marker, { scale: 0.6, duration: 0.5, ease: "power1.out" }, 0)
        .to(marker, { scale: 1, duration: 0.5, ease: "power1.out" })
        .to(marker, { x, duration: 1, ease: "power1.inOut" }, 0);
    };
    nav.addEventListener("mouseover", (e) => { const t = e.target.closest("[data-nav-link]"); if (t) moveTo(xOf(t)); });
    nav.addEventListener("mouseleave", () => moveTo(xOf(active)));
    addEventListener("resize", () => { cur = xOf(active); gsap.set(marker, { x: cur }); });
    document.fonts && document.fonts.ready.then(() => { cur = xOf(active); gsap.set(marker, { x: cur }); });

    // Phone drawer
    const burger = head.querySelector(".nu-burger");
    const drawer = document.querySelector(".nu-drawer");
    // The original drawer has no News row (seven rows). Follows Alpine x-show · x-transition order as is — open: start hidden with the start state applied → next Frame turn on the panel · rows → the Frame after that apply the end state.
    // Close: rows and paragraphs hide at once with no transition, only the panel slides out over .3s, then it is turned off
    const items = drawer.querySelectorAll("li, p");
    let leave;
    const setOpen = (open) => {
      if (drawer.classList.contains("is-open") === open) return;
      head.classList.toggle("is-open", open);
      drawer.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      clearTimeout(leave);
      if (open) {
        drawer.classList.remove("is-leaving");
        [drawer, ...items].forEach((el) => el.classList.add("is-from"));
        const frames = (n, fn) => (n ? requestAnimationFrame(() => frames(n - 1, fn)) : fn());
        frames(1, () => {
          drawer.classList.add("is-shown", "is-entering");
          items.forEach((el) => (el.style.display = ""));
          frames(2, () => {
            drawer.classList.remove("is-from");
            items.forEach((el) => el.tagName === "P" && el.classList.remove("is-from"));
            // The line’s x-show runs later than the plate — the measured original stagger (616ms) is about three frames behind the plate baseline
            frames(3, () => items.forEach((el) => el.classList.remove("is-from")));
          });
        });
      } else {
        items.forEach((el) => { el.style.display = "none"; el.classList.remove("is-from"); });
        drawer.classList.remove("is-entering", "is-from");
        drawer.classList.add("is-leaving");
        leave = setTimeout(() => drawer.classList.remove("is-shown", "is-leaving"), reduced ? 0 : 300);
      }
    };
    burger.addEventListener("click", () => setOpen(!drawer.classList.contains("is-open")));
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  }

  // Footer dot: attached to the left of the item, moves up and down over .6s
  const fnav = document.querySelector("[data-foot-nav]");
  if (fnav) {
    const m = fnav.querySelector(".nu-foot__marker");
    const act = fnav.querySelector("[data-nav-link].is-current");
    const pos = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect(), n = fnav.getBoundingClientRect();
      return { x: r.left - n.left, y: r.top - n.top + r.height / 2 - m.offsetHeight / 2 };
    };
    let shown = false;
    const go = (p, first) => {
      if (!p) { gsap.to(m, { opacity: 0, scale: 0 }); shown = false; return; }
      if (first || !shown) gsap[first ? "set" : "to"](m, { x: p.x, y: p.y, opacity: 1, scale: 1 });
      else gsap.to(m, { x: p.x, y: p.y, duration: 0.6, ease: "power1.inOut" });
      shown = true;
    };
    const place = () => { const p = pos(act); if (p) go(p, true); };
    place();
    document.fonts && document.fonts.ready.then(place);
    fnav.addEventListener("mouseover", (e) => { const t = e.target.closest("[data-nav-link]"); if (t) go(pos(t)); });
    fnav.addEventListener("mouseleave", () => go(pos(act)));
  }

  // ── Splide (4.1.4 same as the original · auto flow · runs only on screen) — options are exactly the original footerSlider·voiceSlider·homeImageSlider ──
  const ext = (window.splide && window.splide.Extensions) || {};
  const splide = (el, o) => window.Splide && new Splide(el, o).mount(ext);
  // Footer photos: shuffled order, 2.2s fade every 5.5s
  const fp = document.querySelector("[data-foot-photos]");
  if (fp) {
    const list = fp.querySelector(".splide__list");
    [...list.children].sort(() => Math.random() - 0.5).forEach((li) => list.append(li));
    splide(fp, { type: "fade", rewind: true, perPage: 1, arrows: false, pagination: false, drag: false, speed: 2200, easing: "ease-in-out", autoplay: !reduced, interval: 5500, pauseOnHover: false, pauseOnFocus: false, intersection: { inView: { autoplay: !reduced }, outView: { autoplay: false } } });
  }

  // ── Accordion (FAQ · expanding answers in About): open 400ms cubic-bezier(.59,.06,.43,.91), close 400ms cubic-bezier(.02,.67,.26,.9) ──
  document.querySelectorAll("[data-acc]").forEach((item) => {
    const btn = item.querySelector("button");
    const panel = item.querySelector("[data-acc-panel]");
    const label = item.querySelector("[data-acc-label]");
    const openText = label && label.dataset.openText, closedText = label && label.textContent;
    btn.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      panel.style.height = "auto";
      const full = panel.offsetHeight;
      // Original accordion (open, close) — FAQ 400·400, About answers 800·400
      const dur = reduced ? 0 : open ? +(item.dataset.accOpen || 400) : 400;
      if (open) {
        panel.animate({ height: ["0px", full + "px"] }, { duration: dur, easing: "cubic-bezier(.59,.06,.43,.91)" });
        panel.style.height = "auto";
      } else {
        panel.animate({ height: [full + "px", "0px"] }, { duration: dur, easing: "cubic-bezier(.02,.67,.26,.9)" });
        panel.style.height = "0px";
      }
      if (label && openText) label.textContent = open ? openText : closedText;
      setTimeout(() => ScrollTrigger.refresh(), dur + 50);
    });
  });

  // ── Horizontal row: drag to flip + the bar below follows ──
  document.querySelectorAll("[data-hscroll]").forEach((wrap) => {
    const box = wrap.querySelector(".nu-hscroll");
    const barW = wrap.querySelector(".nu-hbar");
    const bar = barW && barW.querySelector("span");
    const sync = () => {
      if (!bar) return;
      const max = box.scrollWidth - box.clientWidth;
      const p = max > 0 ? box.scrollLeft / max : 0;
      bar.style.transform = `translateX(${(barW.clientWidth - bar.clientWidth) * p}px)`;
    };
    box.addEventListener("scroll", sync, { passive: true });
    addEventListener("resize", sync);
    box.addEventListener("mousedown", (e) => {
      const sx = e.clientX, sl = box.scrollLeft;
      const mv = (ev) => { box.scrollLeft = sl - (ev.clientX - sx); };
      const up = () => { removeEventListener("mousemove", mv); removeEventListener("mouseup", up); };
      addEventListener("mousemove", mv);
      addEventListener("mouseup", up);
      e.preventDefault();
    });
    sync();
  });

  // ── Review slides: 2s fade, every 5s while visible, drag to flip ──
  document.querySelectorAll("[data-voice]").forEach((root) => {
    splide(root, { type: "fade", rewind: true, perPage: 1, arrows: false, pagination: true, speed: 2000, easing: "ease-in-out", drag: true, dragMinThreshold: { mouse: 8, touch: 40 }, flickPower: 280, flickMaxPages: 1, rewindByDrag: false, autoplay: !reduced, interval: 5000, pauseOnHover: false, pauseOnFocus: false, intersection: { inView: { autoplay: !reduced }, outView: { autoplay: false } }, classes: { pagination: "splide__pagination nu-dots" }, i18n: { pageX: "Review %s", slideX: "Review %s", carousel: "Review", select: "Select review" } });
  });

  // ── Video: original moviePlayControlFadeIn — when half visible, rises from brightness 1.4 · blur 10px over .8s power1.out and plays after .4s, then pauses when out of view.
  //    moviePlayControl (intro video thumbnail) — plays if even slightly visible, pauses when out of view ──
  document.querySelectorAll("video[data-fadein], video[data-inview]").forEach((v) => {
    if (reduced) { v.removeAttribute("autoplay"); v.pause(); return; }
    const fade = v.hasAttribute("data-fadein");
    if (fade) gsap.set(v, { opacity: 0, filter: "brightness(1.4) blur(10px)" });
    new IntersectionObserver((ens) => ens.forEach((en) => {
      if (!en.isIntersecting) { v.pause(); return; }
      if (!fade) { v.play().catch(() => {}); return; }
      gsap.to(v, { opacity: 1, filter: "brightness(1) blur(0px)", duration: 0.8, ease: "power1.out" });
      gsap.delayedCall(0.4, () => v.play().catch(() => {}));
    }), fade ? { threshold: 0.5 } : {}).observe(v);
  });

  // ── List rising from below ──
  const io = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -60px 0px" });
  document.querySelectorAll(".nu-slidein").forEach((el) => io.observe(el));

  // ── Flowing photo strip: loops endlessly, .5px/frame only while visible ──
  document.querySelectorAll("[data-flow]").forEach((root) => {
    splide(root, { mediaQuery: "min", type: "loop", pagination: false, arrows: false, autoplay: "pause", drag: false, autoScroll: reduced ? false : { speed: 0.5, pauseOnHover: false }, intersection: { inView: { autoScroll: !reduced }, outView: { autoScroll: false } } });
  });

  // ── Scroll motion ──
  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", sp: "(max-width: 768px)" }, (ctx) => {
    const { motion, sp } = ctx.conditions;
    if (!motion) return;

    // English section title: per letter, blur 2px and -3° at .08s intervals
    document.querySelectorAll("[data-title-chars]").forEach((el) => {
      const chars = splitChars(el);
      gsap.set(chars, { display: "inline-block", opacity: 0, filter: "blur(2px)", xPercent: -3, yPercent: -15, rotate: -3 });
      gsap.to(chars, { opacity: 1, filter: "blur(0px)", xPercent: 0, yPercent: 0, rotate: 0, duration: 0.4, ease: "power1.inOut", stagger: 0.08,
        scrollTrigger: { trigger: el, start: sp ? "-30% 100%" : "top 80%" } });
    });

    // Line up circle: the outline is drawn (.8s power4.inOut) and the second circle sheds its blur while sliding 120px
    document.querySelectorAll("[data-lineup-catch]").forEach((el) => {
      const ring = el.querySelector("[data-ring]"), ring2 = el.querySelector("[data-ring2]");
      const main = el.querySelector("[data-main-catch]"), sub = el.querySelector("[data-sub-catch]");
      const c = 2 * Math.PI * parseFloat(ring.getAttribute("r"));
      gsap.set(ring, { strokeDasharray: c, strokeDashoffset: c, rotation: -90, transformOrigin: "center center" });
      gsap.set(ring2, { opacity: 0, filter: "blur(5px)" });
      gsap.set([main, sub], { opacity: 0, filter: "blur(5px)", xPercent: -3, yPercent: -15 });
      gsap.timeline({ scrollTrigger: { trigger: el, start: sp ? "-30% 100%" : "0% 100%" } })
        .to(ring, { strokeDashoffset: 0, duration: 0.8, ease: "power4.inOut" })
        .to(ring2, { opacity: 0.8, filter: "blur(0px)", x: 120, duration: 1.6, ease: "power3.out" }, "-=.3")
        .to(main, { opacity: 1, filter: "blur(0px)", xPercent: 0, yPercent: 0, duration: 1.7, ease: "power2.out" }, "-=1.5")
        .to(sub, { opacity: 1, filter: "blur(0px)", xPercent: 0, yPercent: 0, duration: 1.5, ease: "power2.out" }, "-=1.5");
    });

    // Product rows: vertical text per line from 30% to the side, 4px blur, beige letters. Photo revealed as a beige curtain wipes down as a mask
    document.querySelectorAll("[data-prod]").forEach((row) => {
      const text = row.querySelector("[data-catch]");
      const box = row.querySelector("[data-prod-img]"), mask = row.querySelector("[data-prod-mask]");
      if (!text.dataset.split) {
        const lines = text.textContent.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        text.innerHTML = lines.map((l) => `<span>${l}</span>`).join("");
        text.dataset.split = "1";
      }
      const spans = text.querySelectorAll("span");
      gsap.set(spans, { opacity: 0, color: NU.color("--kf-raised"), filter: "blur(4px)", xPercent: 30 });
      gsap.to(spans, { opacity: 1, color: NU.color("--kf-ink"), filter: "blur(0px)", xPercent: 0, stagger: 0.2, duration: 1.2, ease: "power2.out",
        scrollTrigger: { trigger: text, start: "top 85%", once: true } });
      const grad = "linear-gradient(to bottom, black 0%, black 40%, transparent 80%, transparent 100%)"; /* Not skin: mask only looks at alpha */
      gsap.set(mask, { backgroundColor: NU.color("--site-veil"), opacity: 1, visibility: "visible", maskImage: grad, webkitMaskImage: grad, maskSize: "100% 240%", webkitMaskSize: "100% 240%", maskPosition: "0% 0%", webkitMaskPosition: "0% 0%" });
      gsap.set(box, { opacity: 0 });
      gsap.timeline({ scrollTrigger: { trigger: box, start: "top 70%", once: true }, onComplete: () => gsap.set(mask, { visibility: "hidden" }) })
        .to(box, { opacity: 1, duration: 1, ease: "power1.out" }, 0)
        .to(mask, { maskPosition: "0% 100%", webkitMaskPosition: "0% 100%", duration: 1.5, ease: "power1.out" }, 0)
        .to(mask, { opacity: 0, duration: 0.8, ease: "none" }, "-=0.2");
    });

    // Photos beside reviews: while passing the section they turn on one by one from the second, 1.05→1
    document.querySelectorAll("[data-voice-stack]").forEach((stack) => {
      const rest = [...stack.children].slice(1);
      const sec = stack.closest("section") || stack;
      gsap.set(rest, { opacity: 0, scale: 1.05 });
      gsap.timeline({ scrollTrigger: { trigger: sec, start: "0% 100%", end: "100% 0%", scrub: 1 } })
        .fromTo(rest, { opacity: 0 }, { opacity: 1, duration: 0.65, ease: "power1.out", stagger: 0.99 }, 0)
        .fromTo(rest, { scale: 1.05 }, { scale: 1, duration: 1, ease: "power1.out", stagger: 0.99 }, 0);
    });

    // Big photo strip: the photo slides from -50% to +50%, passing slowly
    document.querySelectorAll('[data-parallax="large"]').forEach((sec) => {
      const img = sec.querySelector("[data-parallax-img]");
      const about = sec.dataset.parallaxKind === "about";
      gsap.fromTo(img, { yPercent: -50 }, { yPercent: sp && !about ? 0 : 50, ease: "none",
        scrollTrigger: { trigger: sec, start: sp && about ? "top 72%" : "top bottom", end: sp ? (about ? "+=125% top" : "+=100% bottom") : "+=200% top", scrub: 0 } });
    });

    // Subpage header: after the loader clears, text → circle outline (1.5s power4.inOut) → small text
    document.querySelectorAll("[data-pagehead]").forEach((el) => {
      const ring = el.querySelector("circle");
      const main = el.querySelector("[data-main-catch]"), sub = el.querySelector("[data-sub-catch]");
      const chars = splitChars(main);
      const c = 2 * Math.PI * parseFloat(ring.getAttribute("r"));
      gsap.set(ring, { strokeDasharray: c, strokeDashoffset: c, rotation: -90, transformOrigin: "center center", stroke: NU.color("--site-black"), filter: "blur(5px)" });
      gsap.set(chars, { opacity: 0, filter: "blur(2px)", xPercent: -3, yPercent: -15, rotate: -3 });
      if (sub) gsap.set(sub, { opacity: 0, filter: "blur(5px)" });
      const play = () => {
        const tl = gsap.timeline();
        tl.to(chars, { opacity: 1, filter: "blur(0px)", xPercent: 0, yPercent: 0, rotate: 0, duration: 0.4, ease: "power1.inOut", stagger: 0.08 })
          .to(ring, { strokeDashoffset: 0, stroke: NU.color("--kf-ink"), filter: "blur(0px)", duration: 1.5, ease: "power4.inOut" }, "-=1.2");
        if (sub) tl.to(sub, { opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power2.out" }, "-=1.0");
      };
      document.addEventListener("nu:loaded", play, { once: true });
    });
  });

  function splitChars(el) {
    if (el.dataset.split) return [...el.querySelectorAll(".nu-ch")];
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((ch) => {
            if (ch === " " || ch === "\n") { frag.append(document.createTextNode(ch)); return; }
            const s = document.createElement("span");
            s.className = "nu-ch";
            s.style.display = "inline-block";
            s.textContent = ch;
            frag.append(s);
            out.push(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    el.dataset.split = "1";
    return out;
  }
  NU.splitChars = splitChars;

  if (page !== "home") {
    const go = () => NU.hideLoader(0.35);
    if (document.readyState === "complete") go(); else addEventListener("load", go);
  }
})();
