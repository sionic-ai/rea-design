// Shared by all four pages — the header (flowing band, mega menu, small drawer, phone menu) and footer are written once and inserted,
// Hooks up button text roll, two-line menu links, text reveal, photo parallax and smooth scroll. Page transitions use the view transition in shared.css.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("reveal-expo", "0.16,1,0.3,1");
  CustomEase.create("menu-sharp", "0.86,0,0.07,1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover)").matches;
  const site = (window.dhSite = { reduce, hover });
  const here = document.body.dataset.page || "home";

  // First curtain — once per session (in the original, once when the app first launches). After 260ms a dark cover lifts over .75s while the shaped window grows with a .7s bounce, and the photo in the window swaps every 110ms.
  // The number counts up to 100 over 1.7s (the last 40 only once the document has fully loaded). When full, the window turns off and 110ms later the Type window grows to fill the screen over 1.8s and clears, and the header line drops in over 1.15s after .4s
  const root = document.documentElement;
  let seen = false;
  try { seen = sessionStorage.getItem("dh-rideau") === "1"; sessionStorage.setItem("dh-rideau", "1"); } catch (e) { seen = false; }
  if (!reduce && !seen) {
    const MIN = 1700, t0 = performance.now();
    const rid = document.createElement("div");
    rid.className = "dh-rideau";
    rid.setAttribute("data-slot", "loader-curtain");
    rid.setAttribute("aria-hidden", "true");
    const LABELS = ["Stadium group photo", "Snow-capped mountain", "Old city square", "Player Close-up", "Riverside Night View", "Flag on ice"];
    rid.innerHTML = `<div class="dh-rideau__voile"></div><div class="dh-rideau__fenetre">${LABELS.map((l, i) => `<div class="dh-rideau__photo dh-ph" data-label="${l}"${i ? "" : " data-vue"}></div>`).join("")}</div><div class="dh-rideau__amorce"></div><p class="dh-rideau__count"><span>00</span><span>%</span></p>`;
    document.body.append(rid);
    root.setAttribute("data-rideau", "pose");
    root.setAttribute("data-loader", "");
    const [voile, fenetre, amorce, count] = rid.children, num = count.firstChild, photos = [...fenetre.children];
    setTimeout(() => [voile, fenetre, amorce].forEach((el) => el.setAttribute("data-revele", "")), Math.max(0, 260 - (performance.now() - t0)));
    let pct = 0, k = 0, done = false;
    const tick = () => { const v = Math.min(60 + 40 * (document.readyState === "complete"), Math.round(100 * Math.min(1, (performance.now() - t0) / MIN))); pct = Math.max(pct, v); num.textContent = String(Math.min(100, pct)).padStart(2, "0"); };
    const ti = setInterval(tick, 80), ts = setInterval(() => { photos[k].removeAttribute("data-vue"); k = (k + 1) % photos.length; photos[k].setAttribute("data-vue", ""); }, 110);
    const finish = () => {
      if (done) return;
      done = true;
      clearInterval(ti); clearInterval(ts); clearInterval(tc);
      num.textContent = "100";
      fenetre.setAttribute("data-off", "");
      setTimeout(() => {
        [voile, fenetre, count].forEach((el) => el.setAttribute("data-sort", ""));
        root.setAttribute("data-rideau", "parti");
        setTimeout(() => root.removeAttribute("data-rideau"), 1700);
        setTimeout(() => { rid.remove(); root.removeAttribute("data-loader"); }, 1900);
      }, 110);
    };
    const tc = setInterval(() => { if (document.readyState === "complete" && performance.now() - t0 >= MIN) finish(); }, 60);
    setTimeout(finish, Math.max(6000, MIN + 4000));
  }

  const link = (href, text, cls = "") => `<a class="dh-nav-link ${cls}" href="${href}"><span class="dh-nav-link__stack" aria-hidden="true"><span class="dh-nav-link__label">${text}</span><span class="dh-nav-link__label">${text}</span></span><span class="dh-sr">${text}</span></a>`;
  const btn = (href, text, cls = "") => `<a class="dh-btn ${cls}" href="${href}" data-btn>${text}</a>`;
  const chev = `<svg class="dh-drop__chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 3.75l4 4 4-4" /></svg>`;
  const trips = [["Route Name 01", "City · City · City · City"], ["Route Name 02", "City · City · City · City"], ["Route Name 03", "City · City · City · City"], ["Route Name 04", "City · City · City · City"], ["Route Name 05", "City · City · City · City"]];
  const cities = ["City One", "City Two", "City Three", "City Four", "City Five", "City Six", "City Seven", "City Eight", "City Nine"];

  const head = document.querySelector('[data-shared="head"]');
  if (head) {
    head.className = "dh-head";
    head.setAttribute("data-slot", "header-mega");
    if (head.dataset.tone) head.setAttribute(`data-${head.dataset.tone}`, "");
    head.innerHTML = `
      <div class="dh-promo t-xsmall" aria-hidden="true"><div class="dh-promo__track">${`<div class="dh-promo__half">${'<span>Your notice line goes here</span>'.repeat(6)}</div>`.repeat(2)}</div></div>
      <div class="dh-bar">
        <a class="dh-logo" href="index.html" aria-label="Back to start" data-label="Brand logo (red mark + two-line wordmark)">
          <svg viewBox="0 0 26 26" aria-hidden="true"><path class="dh-logo__mark" d="M2 4h9l-3 18H0z" /><path d="M11 4h6c6 0 9 4 8.2 9.2C24.4 18.6 20.6 22 15 22H8l1.2-7H14l-.6 3.4h1.8c2.8 0 4.6-1.8 5-4.4.4-2.6-1-4.4-3.8-4.4h-6z" /></svg>
          <span>Brand<br>Name</span>
        </a>
        <nav class="dh-nav" aria-label="Main menu" data-label="Menu English name">
          <a class="dh-nav-link dh-nav__toggle" href="list.html" data-mega="trips" aria-expanded="false"><span class="dh-nav-link__stack" aria-hidden="true"><span class="dh-nav-link__label">Our programs</span><span class="dh-nav-link__label">Our programs</span></span><span class="dh-sr">Our programs</span></a>
          <a class="dh-nav-link dh-nav__toggle" href="cities.html" data-mega="cities" aria-expanded="false"><span class="dh-nav-link__stack" aria-hidden="true"><span class="dh-nav-link__label">Destinations</span><span class="dh-nav-link__label">Destinations</span></span><span class="dh-sr">Destinations</span></a>
          ${link("about.html", "For groups")}
        </nav>
        <div class="dh-mega">
          <div class="dh-mega__wrap" data-mega-wrap>
            <div class="dh-mega__box" data-mega-box>
              <div class="dh-mega__bg"></div>
              <section class="dh-mega__panel" data-panel="trips" aria-label="Journey">
                <header class="dh-mega__head t-small" data-fade><p><span>Our programs</span><span class="dh-mega__count">00 trips</span></p>${link("list.html", "All programs")}</header>
                <div class="dh-mega__grid">
                  <ul class="dh-mega__trips">${trips.map(([t, r]) => `<li data-fade><a class="dh-mega__trip t-small" href="list.html"><span class="dh-mega__thumb"><span class="dh-ph"></span></span><span class="dh-mega__info"><span>${t}</span><small>${r}</small></span></a></li>`).join("")}</ul>
                  <a class="dh-mega__feat" data-fade href="list.html"><span class="dh-mega__featmedia"><span class="dh-ph" data-label="Main journey photo · old city square · daytime · portrait"></span></span><span class="dh-mega__scrim"></span><span class="dh-mega__badge t-over">Featured</span><span class="dh-mega__featbody"><span class="t-xl">Route Name 00</span><span class="t-small">City · City · City · City</span></span></a>
                </div>
              </section>
              <section class="dh-mega__panel" data-panel="cities" aria-label="City">
                <header class="dh-mega__head t-small" data-fade><p><span>Destinations</span><span class="dh-mega__count">00 cities</span></p>${link("cities.html", "All cities")}</header>
                <div class="dh-mega__grid">
                  <div class="dh-mega__col">${cities.map((c, i) => `<a class="t-h2 dh-mega__city" data-fade data-i="${i}" href="cities.html">${c}</a>`).join("")}</div>
                  <div class="dh-mega__media" data-fade>${cities.map((c, i) => `<span class="dh-mega__shot dh-ph" data-i="${i}" data-label="${c} Landscape photo · horizontal"></span>`).join("")}</div>
                </div>
              </section>
            </div>
          </div>
        </div>
        <div class="dh-bar__end">
          <div class="dh-drop" data-drop>
            <button class="dh-nav-link dh-drop__btn" type="button" aria-expanded="false"><span class="dh-nav-link__stack" aria-hidden="true"><span class="dh-nav-link__label">About</span><span class="dh-nav-link__label">About</span></span><span class="dh-sr">About</span>${chev}</button>
            <div class="dh-drop__wrap"><div class="dh-drop__panel"><ul class="dh-drop__list"><li data-fade><a class="dh-drop__opt" href="about.html">About us</a></li><li data-fade><a class="dh-drop__opt" href="about.html">Why us</a></li><li data-fade><a class="dh-drop__opt is-accent" href="#contact">Contact us</a></li></ul></div></div>
          </div>
          <div class="dh-drop dh-drop--lang" data-drop>
            <button class="dh-lang" type="button" aria-expanded="false" aria-label="Change language"><span>EN</span>${chev}</button>
            <div class="dh-drop__wrap"><div class="dh-drop__panel"><ul class="dh-drop__list"><li data-fade><a class="dh-drop__opt dh-drop__opt--lang" href="#">Korean<span>KO</span></a></li><li data-fade><a class="dh-drop__opt dh-drop__opt--lang" aria-current="true" href="#">English<span>EN</span></a></li></ul></div></div>
          </div>
          ${btn("#contact", "Get a quote")}
          <button class="dh-burger" type="button" aria-label="Open Menu"><span></span><span></span></button>
        </div>
      </div>`;
    const mob = document.createElement("div");
    mob.className = "dh-mobile";
    mob.setAttribute("aria-hidden", "true");
    mob.innerHTML = `<div class="dh-mobile__bar"><span class="t-small">Menu</span><button class="dh-mobile__close" type="button" aria-label="Close Menu">✕</button></div>
      <nav class="dh-mobile__links t-h2">${[["index.html", "Home"], ["list.html", "Our programs"], ["cities.html", "Destinations"], ["about.html", "For groups"], ["about.html", "About"], ["#contact", "Contact"]].map(([h, t], i) => `<a href="${h}" style="--i:${i}">${t}</a>`).join("")}</nav>`;
    document.body.append(mob);
    const back = document.createElement("div");
    back.className = "dh-mega-backdrop";
    document.body.append(back);
    site.mobile = mob;
    site.backdrop = back;
  }

  const foot = document.querySelector('[data-shared="foot"]');
  if (foot) {
    foot.className = "dh-foot";
    foot.id = "contact";
    foot.setAttribute("data-slot", "footer-stats");
    foot.innerHTML = `
      <div class="dh-foot__top">
        <nav class="dh-foot__big" aria-label="Footer Menu" data-label="Menu English name">${link("list.html", "Our programs")}${link("cities.html", "Destinations")}${link("about.html", "For groups")}${link("#contact", "Contact us")}</nav>
        <nav class="dh-foot__col"><p class="dh-foot__head t-over">More</p><ul>${["Why us?", "About", "Legal notice", "Privacy policy"].map((t) => `<li>${link("about.html", t)}</li>`).join("")}</ul></nav>
        <nav class="dh-foot__col"><p class="dh-foot__head t-over">Socials</p><ul>${["Social 01", "Social 02", "Social 03", "Social 04"].map((t) => `<li>${link("#", t)}</li>`).join("")}</ul></nav>
        <div class="dh-foot__cta"><p class="t-small">Your short invitation line here</p>${btn("#contact", "Get a quote", "dh-btn--light dh-btn--sm")}</div>
      </div>
      <ul class="dh-foot__stats">${[["000", "Number Description"], ["00", "Number Description"], ["00", "Number Description"], ["0", "Number Description"]].map(([n, l]) => `<li class="dh-foot__stat"><span class="t-display">${n}</span><span class="t-text">${l}</span></li>`).join("")}</ul>
      <div class="dh-foot__credits t-xsmall"><p>COPYRIGHT ©0000, Brand Name</p><p>Your short pledge line here</p><p>Design by Studio</p></div>`;
  }

  // Button text in two copies — each letter delayed by 18ms via --i
  document.querySelectorAll("[data-btn], .dh-btn").forEach((b) => {
    if (b.querySelector(".dh-btn__inner")) return;
    const text = b.textContent.trim();
    b.setAttribute("aria-label", text);
    b.innerHTML = `<span class="dh-btn__veil"></span><span class="dh-btn__inner" aria-hidden="true">${[...text].map((ch, i) => `<span class="dh-btn__char"><span class="dh-btn__glyph" style="--i:${i}">${ch === " " ? "&nbsp;" : ch}</span><span class="dh-btn__glyph dh-btn__clone" style="--i:${i}">${ch === " " ? "&nbsp;" : ch}</span></span>`).join("")}</span>`;
    b.addEventListener("pointerdown", () => b.setAttribute("data-pressed", ""));
    ["pointerup", "pointerleave", "pointercancel"].forEach((t) => b.addEventListener(t, () => b.removeAttribute("data-pressed")));
  });

  // Smooth scroll — same Lenis 1.3.26 as the original, .85s quartic ease-out
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ duration: .85, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  site.lenis = lenis;
  // Scrolling pauses while the opening curtain is still covering the screen
  if (lenis) {
    const lock = () => (root.hasAttribute("data-loader") ? lenis.stop() : lenis.start());
    new MutationObserver(lock).observe(root, { attributes: true, attributeFilter: ["data-loader"] });
    lock();
  }

  // Header row state — after scrolling down more than 10px it lifts by the band height and becomes a white panel, and below 400px scrolling down more than 6px hides it and scrolling up brings it back
  if (head) {
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY, d = y - last;
      head.toggleAttribute("data-scrolled", y > 10);
      if (Math.abs(d) > 6) { head.toggleAttribute("data-hidden", d > 0 && y > 400 && !head.hasAttribute("data-mega-open")); last = y; }
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Mega menu — as in the original: hover opens it after 120ms (90ms if already open). The box height unfolds in .8s menu-sharp and the veil spreads in .6s,
    // Lines rise from 110% below over .8s at .05 intervals. Moving to another cell slides the lines out sideways (30px) and back in. When the pointer leaves, it closes after 150ms at .6× speed
    const MENU = .8, MED = .6, SHORT = .3, LINES = .05, STAG = .02;
    const box = head.querySelector("[data-mega-box]"), wrap = head.querySelector("[data-mega-wrap]");
    const panels = [...head.querySelectorAll(".dh-mega__panel")], toggles = [...head.querySelectorAll("[data-mega]")], order = toggles.map((t) => t.dataset.mega);
    const panelOf = (k) => panels.find((p) => p.dataset.panel === k);
    const fades = (k) => [...panelOf(k).querySelectorAll("[data-fade]")];
    const back = site.backdrop;
    gsap.set(panels, { autoAlpha: 0 });
    gsap.set(back, { autoAlpha: 0 });
    let cur = null, openT = 0, shutT = 0;
    const mark = () => { toggles.forEach((t) => t.setAttribute("aria-expanded", t.dataset.mega === cur)); head.toggleAttribute("data-mega-open", !!cur); };
    const open = (k) => {
      const p = panelOf(k), f = fades(k);
      panels.filter((x) => x !== p).forEach((x) => gsap.set(x, { autoAlpha: 0 }));
      gsap.killTweensOf([box, back, p, ...f]);
      gsap.timeline()
        .to(back, { autoAlpha: 1, duration: MED, ease: "power2.inOut" }, 0)
        .fromTo(box, { height: 0 }, { height: p.offsetHeight, duration: MENU, ease: "menu-sharp" }, 0)
        .set(p, { autoAlpha: 1 }, .05)
        .fromTo(f, { autoAlpha: 0, yPercent: 110 }, { autoAlpha: 1, yPercent: 0, duration: MENU, ease: "reveal-expo", stagger: LINES }, .1);
      cur = k; mark();
    };
    const close = () => {
      if (!cur) return;
      const f = fades(cur);
      gsap.killTweensOf([box, back, ...f]);
      gsap.timeline()
        .to(f, { autoAlpha: 0, yPercent: -10, duration: SHORT * .6, ease: "power2.in", stagger: { each: STAG, from: "end" } }, 0)
        .to(box, { height: 0, duration: MENU * .6, ease: "menu-sharp" }, .05)
        .to(back, { autoAlpha: 0, duration: MED * .6, ease: "power2.inOut" }, 0)
        .set(panels, { autoAlpha: 0 });
      cur = null; mark();
    };
    const swap = (from, to) => {
      const dir = order.indexOf(to) > order.indexOf(from) ? 1 : -1, pf = panelOf(from), pt = panelOf(to), fa = fades(from), fb = fades(to);
      gsap.killTweensOf([box, pf, pt, ...fa, ...fb]);
      gsap.timeline()
        .to(fa, { autoAlpha: 0, yPercent: -10, x: -30 * dir, duration: SHORT * .6, ease: "power2.in", stagger: { each: STAG, from: "end" } }, 0)
        .set(pf, { autoAlpha: 0 }).set(fa, { x: 0, yPercent: 0 })
        .to(box, { height: pt.offsetHeight, duration: MENU, ease: "menu-sharp" }, .05)
        .set(pt, { autoAlpha: 1 }, .1)
        .fromTo(fb, { autoAlpha: 0, yPercent: 110, x: 30 * dir }, { autoAlpha: 1, yPercent: 0, x: 0, duration: MENU, ease: "reveal-expo", stagger: LINES }, .15);
      cur = to; mark();
    };
    const go = (k) => (cur ? cur !== k && swap(cur, k) : open(k));
    const clearT = () => { clearTimeout(openT); clearTimeout(shutT); };
    const leave = () => { clearT(); shutT = setTimeout(close, 150); };
    site.closeMega = close;
    if (hover) {
      toggles.forEach((t) => {
        t.addEventListener("mouseenter", () => { clearT(); openT = setTimeout(() => go(t.dataset.mega), cur ? 90 : 120); });
        t.addEventListener("mouseleave", leave);
      });
      wrap.addEventListener("mouseenter", () => clearTimeout(shutT));
      wrap.addEventListener("mouseleave", leave);
      head.querySelectorAll(".dh-nav > a:not([data-mega]), .dh-bar__end > .dh-drop").forEach((el) => el.addEventListener("mouseenter", leave));
    }
    toggles.forEach((t) => t.addEventListener("keydown", (e) => { if (e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); go(t.dataset.mega); } }));
    back.addEventListener("click", close);
    head.querySelectorAll(".dh-mega__city").forEach((c) => c.addEventListener("mouseenter", () => {
      const i = c.dataset.i;
      c.closest(".dh-mega__panel").querySelectorAll("[data-i]").forEach((el) => el.toggleAttribute("data-active", el.dataset.i === i));
    }));
    head.querySelectorAll('.dh-mega__city[data-i="0"], .dh-mega__shot[data-i="0"]').forEach((el) => el.setAttribute("data-active", ""));

    // Small drawer (About · language) — the original shared drawer: on hover it opens after 120ms, its height expands in .8s menu-sharp, and items rise from 110% below at .05 intervals,
    // A faint veil covers the whole screen in .6s. On leave, every 150ms it checks whether the pointer is within the drawer (±8px), and if not, closes in reverse over .48s. Click toggles open/close
    let px = -1, py = -1;
    document.addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
    const inside = (el) => [el, ...el.querySelectorAll(".dh-drop__wrap, .dh-drop__panel")].some((n) => { const r = n.getBoundingClientRect(), h = Math.max(r.height, n.scrollHeight || 0); return r.width > 0 && h > 0 && px >= r.left - 8 && px <= r.right + 8 && py >= r.top - 8 && py <= r.top + h + 8; });
    head.querySelectorAll("[data-drop]").forEach((dd) => {
      const b = dd.querySelector("button"), dw = dd.querySelector(".dh-drop__wrap"), panel = dd.querySelector(".dh-drop__panel"), items = [...dd.querySelectorAll("[data-fade]")];
      const veil = document.createElement("div");
      veil.className = "dh-drop-veil";
      veil.setAttribute("aria-hidden", "true");
      document.body.append(veil);
      gsap.set(dw, { height: 0, overflow: "hidden" });
      gsap.set(veil, { autoAlpha: 0 });
      let on = false, tl = null, t1 = 0, t2 = 0;
      const set = (v) => {
        if (v === on) return;
        on = v;
        b.setAttribute("aria-expanded", v);
        dd.toggleAttribute("data-open", v);
        tl?.kill();
        tl = gsap.timeline().to(veil, { autoAlpha: v ? 1 : 0, duration: v ? MED : MED * .6, ease: "power2.inOut" }, 0);
        if (v) tl.fromTo(dw, { height: 0 }, { height: panel.offsetHeight, duration: MENU, ease: "menu-sharp" }, 0).fromTo(items, { autoAlpha: 0, yPercent: 110 }, { autoAlpha: 1, yPercent: 0, duration: MENU, ease: "reveal-expo", stagger: LINES }, .1);
        else tl.to(items, { autoAlpha: 0, yPercent: 110, duration: MENU * .6, ease: "reveal-expo", stagger: { each: LINES, from: "end" } }, 0).to(dw, { height: 0, duration: MENU * .6, ease: "menu-sharp" }, .05);
      };
      const clear = () => { clearTimeout(t1); clearTimeout(t2); };
      if (hover) {
        dd.addEventListener("pointerenter", () => { clear(); if (!on) t1 = setTimeout(() => { close(); set(true); }, 120); });
        dd.addEventListener("pointerleave", () => {
          clear();
          const check = () => { if (inside(dd)) { t2 = setTimeout(check, 150); return; } set(false); };
          t2 = setTimeout(check, 150);
        });
      }
      b.addEventListener("click", () => { clear(); set(!on); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && on) { set(false); b.focus(); } });
    });

    const mob = site.mobile;
    head.querySelector(".dh-burger").addEventListener("click", () => { mob.classList.add("is-open"); mob.setAttribute("aria-hidden", "false"); lenis?.stop(); });
    mob.querySelector(".dh-mobile__close").addEventListener("click", () => { mob.classList.remove("is-open"); mob.setAttribute("aria-hidden", "true"); lenis?.start(); });
  }

  // Reveal — each [data-reveal] type uses the original values, fires once when it reaches 85% of the screen
  if (!reduce) {
    const START = "top 85%";
    document.querySelectorAll('[data-reveal="eyebrow"]').forEach((el) => {
      const t = el.querySelector(".dh-eyebrow__text > span");
      if (t) gsap.from(t, { yPercent: 130, duration: .45, ease: "reveal-expo", scrollTrigger: { trigger: el, start: START, once: true } });
    });
    document.querySelectorAll('[data-reveal="lines"]').forEach((el) => {
      SplitText.create(el, { type: "lines", mask: "lines", autoSplit: true, onSplit: (s) => gsap.from(s.lines, { yPercent: 150, duration: 1, ease: "reveal-expo", stagger: .05, scrollTrigger: { trigger: el, start: START, once: true } }) });
    });
    document.querySelectorAll('[data-reveal="words"]').forEach((el) => {
      SplitText.create(el, { type: "words", mask: "words", autoSplit: true, onSplit: (s) => gsap.from(s.words, { yPercent: 120, skewY: 10, duration: .8, ease: "reveal-expo", stagger: { each: .025 }, scrollTrigger: { trigger: el, start: START, once: true } }) });
    });
    document.querySelectorAll('[data-reveal="fade"]').forEach((el) => {
      gsap.from(el.children, { opacity: 0, y: 24, duration: .6, ease: "reveal-expo", stagger: .08, scrollTrigger: { trigger: el, start: START, once: true } });
    });
    // Photo — the mask enters from below and the inner part from above, each by 101%, going from 1.15× to its natural size (1.4s signature curve)
    document.querySelectorAll('[data-reveal="image"]').forEach((el) => {
      const inner = el.firstElementChild;
      gsap.timeline({ scrollTrigger: { trigger: el, start: START, once: true }, defaults: { duration: 1.4, ease: CustomEase.create("dh-sign", "0.63,0.065,0.25,0.95") } })
        .fromTo(el, { yPercent: 101 }, { yPercent: 0 }, 0)
        .fromTo(inner, { yPercent: -101, scale: 1.15 }, { yPercent: 0, scale: 1 }, 0);
    });
    // Parallax — moves up and down by panel height × strength/200 (straight, tied to scroll)
    document.querySelectorAll("[data-parallax]").forEach((frame) => {
      const inner = frame.firstElementChild, k = +(frame.dataset.parallax || 16);
      gsap.fromTo(inner, { y: () => -frame.offsetHeight * k / 200 }, { y: () => frame.offsetHeight * k / 200, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  }
  // Re-measure when fonts load — the pinned scene’s start point depends on the text line height
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  site.here = here;
})();
