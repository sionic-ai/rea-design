/* Shared by several pages — draws in the header row · menu · footer · top button, bakes the isometric town illustration, 
   /  Applies Lenis(1.3.25 lerp .18)·Taxi(1.9.1 transition 250ms)·first-bar loader·headline drop-in·text splitting·button text roll */
(() => {
  const page = document.body.dataset.page || "home";
  const isTop = page === "home";
  const mobile = matchMedia("(max-width: 767px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Village illustration: lays out isometric houses, trees, people and roads from a seed value (stands in for the original illustration — redrawn new with the same position, size and feel) ──
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const U = 22, C = 0.866;
  const P = (i, j, k = 0) => [((i - j) * C * U).toFixed(1), ((i + j) * 0.5 * U - k * U).toFixed(1)];
  const poly = (pts, cls) => `<polygon class="${cls}" points="${pts.map((p) => p.join(",")).join(" ")}"/>`;
  const box = (i, j, w, d, h, roof) => {
    const t = [P(i, j, h), P(i + w, j, h), P(i + w, j + d, h), P(i, j + d, h)];
    const l = [P(i, j + d, 0), P(i + w, j + d, 0), P(i + w, j + d, h), P(i, j + d, h)];
    const r = [P(i + w, j, 0), P(i + w, j + d, 0), P(i + w, j + d, h), P(i + w, j, h)];
    let win = "";
    for (let n = 0; n < Math.floor(w); n++) for (let m = 0; m < Math.floor(h) - 0.5; m++) {
      const a = P(i + n + 0.3, j + d, m + 0.35), b = P(i + n + 0.7, j + d, m + 0.35), c = P(i + n + 0.7, j + d, m + 0.85), e = P(i + n + 0.3, j + d, m + 0.85);
      win += poly([a, b, c, e], "sb-win");
    }
    return poly(l, "sb-wall") + poly(r, "sb-shade") + poly(t, "sb-roof sb-roof--" + roof) + win;
  };
  const tree = (i, j, s = 1) => { const [x, y] = P(i, j); return `<g class="sb-tree"><path d="M${x} ${y}v${-14 * s}"/><circle cx="${x}" cy="${y - 24 * s}" r="${12 * s}"/></g>`; };
  const person = (i, j, c) => { const [x, y] = P(i, j); return `<g class="sb-person sb-person--${c}"><rect x="${x - 4}" y="${y - 22}" width="8" height="15" rx="4"/><circle cx="${x}" cy="${y - 27}" r="4"/></g>`; };
  const ground = (w, d) => poly([P(0, 0), P(w, 0), P(w, d), P(0, d)], "sb-ground");
  const road = (pts) => `<polyline class="sb-road" points="${pts.map(([i, j]) => P(i, j).join(",")).join(" ")}"/>`;
  window.sbCity = (seed, { w = 16, d = 16, n = 12, people = 6, trees = 10, steps = 3 } = {}) => {
    const r = rnd(seed), items = [];
    for (let a = 0; a < n; a++) {
      const bw = 1 + Math.floor(r() * 3), bd = 1 + Math.floor(r() * 3), bh = 1 + Math.floor(r() * 3) + (r() > 0.85 ? 2 : 0);
      const i = Math.floor(r() * (w - bw)), j = Math.floor(r() * (d - bd));
      items.push({ z: i + j + bw + bd, cls: "js-step-0" + (1 + (a % steps)), svg: box(i, j, bw, bd, bh, 1 + Math.floor(r() * 4)) });
    }
    for (let a = 0; a < trees; a++) { const i = r() * w, j = r() * d; items.push({ z: i + j, cls: "js-tree", svg: tree(i, j, 0.7 + r() * 0.6) }); }
    for (let a = 0; a < people; a++) { const i = r() * w, j = r() * d; items.push({ z: i + j + 0.5, cls: "js-persons", svg: person(i, j, 1 + Math.floor(r() * 3)) }); }
    items.sort((p, q) => p.z - q.z);
    const [x0] = P(0, d), [x1] = P(w, 0), [, y1] = P(w, d), [, y0] = P(0, 0, 6);
    const vb = `${x0 - 30} ${y0 - 30} ${x1 - x0 + 60} ${y1 - y0 + 60}`;
    // Draw order (front/back) is a single line by depth — layers (js-step-01~03), people and trees are picked individually by class and move separately
    return `<svg class="sb-city" viewBox="${vb}" aria-hidden="true"><g class="js-bg">${ground(w, d)}${road([[0, d / 2], [w / 2, d / 2], [w / 2, 0]])}${road([[w / 2, d / 2], [w / 2, d]])}</g>` +
      items.map((it) => `<g class="${it.cls}">${it.svg}</g>`).join("") + "</svg>";
  };
  // ── Header line and menu — once, off-screen (a spot that stays through page turns) ──
  const NAV = [["Features and Strengths", "service.html", "service"], ["Business introduction", "#", ""], ["Products we cover", "product.html", "product"], ["Response cases", "works.html", "works"], ["Company info", "about.html", "about"], ["Hiring Info", "#", ""], ["News", "news.html", "news"]];
  const MARK = '<svg class="sb-mark" viewBox="0 0 24 24" aria-hidden="true"><path class="sb-mark__a" d="M12 2 4 8v5l8 9 8-9V8z"/><path class="sb-mark__b" d="M12 7 8 10v3l4 4 4-4v-3z"/></svg>';
  const LOGO = '<span class="sb-logo">' + MARK + '<span class="sb-logo__txt"><small>Inc.</small> Company name</span></span>';
  const hd = document.querySelector('[data-slot="header"]');
  if (hd) {
    hd.className = "sb-hd is-hide";
    hd.innerHTML = '<p class="sb-hd__ci"><a href="index.html">' + LOGO + '</a></p><nav class="sb-gnav" aria-label="Main menu"><ul>' +
      NAV.map(([l, h, k]) => `<li${h === "#" && l === "Business introduction" ? ' class="has-pull"' : ""}><a class="sb-gnav__a" href="${h}" data-key="${k}">${l}</a></li>`).join("") +
      '</ul><a class="sb-cta" href="#"><span class="sb-cta__txt">Inquiry</span><span class="sb-cta__logo">' + MARK + "</span></a></nav>" +
      '<button class="sb-menu" type="button" aria-label="Open Menu" aria-expanded="false"><span></span><span></span><span></span></button>';
    // Hovering over Business opens two cells downward (original l-pulldown — waits 50ms on leaving, then closes)
    const pull = document.createElement("div");
    pull.className = "sb-pull";
    pull.innerHTML = ["Design · Build", "Equipment Inspection"].map((t) => `<a href="#" class="sb-pull__item"><span class="inner">${t}<span class="arw"></span></span></a>`).join("");
    hd.querySelector(".sb-gnav").append(pull);
    const host = hd.querySelector(".has-pull");
    let pt = 0;
    const open = (v) => { clearTimeout(pt); if (v) pull.classList.add("is-active"); else pt = setTimeout(() => pull.classList.remove("is-active"), 50); };
    [host, pull].forEach((el) => { el.addEventListener("mouseenter", () => open(true)); el.addEventListener("mouseleave", () => open(false)); });
    // Nav hover (original l-gnav__blob): the row panel turns white in .1s, a peach blob bounces under the chosen cell over .5s while scaling .5→1. On leave, after 50ms the blob fades and shrinks.
    const ul = hd.querySelector(".sb-gnav ul"), blob = document.createElement("i");
    blob.className = "sb-gnav__blob";
    ul.append(blob);
    let bt = 0;
    ul.querySelectorAll("li").forEach((li) => {
      li.addEventListener("mouseenter", () => {
        clearTimeout(bt);
        const a = li.firstElementChild;
        Object.assign(blob.style, { left: a.offsetLeft + li.offsetLeft - 3 + "px", top: li.offsetTop + a.offsetTop + "px", width: a.offsetWidth + 6 + "px", height: a.offsetHeight + "px" });
        ul.classList.add("is-active");
      });
      li.addEventListener("mouseleave", () => { bt = setTimeout(() => ul.classList.remove("is-active"), 50); });
    });
    hd.querySelector(".sb-menu").addEventListener("click", (e) => {
      const open = document.documentElement.classList.toggle("is-menu-open");
      e.currentTarget.setAttribute("aria-expanded", String(open));
    });
  }
  const markNav = (key) => hd?.querySelectorAll(".sb-gnav a[data-key]").forEach((a) => (a.dataset.key && a.dataset.key === key ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  markNav(page);

  // Transition cover (original .overlay: white background covers in .2s linear and lifts in .4s ease-out)
  const cover = document.createElement("div");
  cover.className = "sb-cover";
  cover.innerHTML = '<div class="sb-cover__bg"></div>';
  document.body.append(cover);

  const defs = document.createElement("div");
  defs.innerHTML = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="sb-arw-min" viewBox="0 0 18 16"><path d="M1 7h12.6L9.3 2.7l1.4-1.4L17.4 8l-6.7 6.7-1.4-1.4L13.6 9H1z"/></symbol></svg>';
  document.body.prepend(defs.firstElementChild);
  // Back to top: once the body head is 100px past, a smiling circle appears at the bottom right
  const top = document.createElement("button");
  top.className = "sb-pagetop";
  top.type = "button";
  top.setAttribute("aria-label", "Back to top");
  top.innerHTML = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19"/><path d="M12 22c4 5 12 5 16 0"/><circle class="e" cx="14" cy="16" r="2"/><circle class="e" cx="26" cy="16" r="2"/></svg>';
  document.body.append(top);

  const FOOT = '<div class="sb-ft__in"><div class="sb-ft__info"><a class="sb-ft__logo" href="index.html">' + MARK + '<span>Company name</span></a>' +
    '<address>Postal code 000-0000<br>Your address goes here in one line<br>Phone 000-000-0000<br>Fax 000-000-0000<br>[Opening hours] Weekdays 0:00–00:00</address></div>' +
    '<ul class="sb-ft__nav">' + [["First Page", "index.html"], ...NAV.map(([l, h]) => [l, h])].map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join("") + "</ul>" +
    '<div class="sb-ft__big"><a href="#" class="sb-ft__link"><span class="sb-ft__en">Recruit</span> <small>Hiring Info</small></a><a href="#" class="sb-ft__link"><span class="sb-ft__en">Contact</span> <small>Inquiry</small></a></div>' +
    '<div class="sb-ft__city" data-city="7,18,18,16,9,14"></div></div>' +
    '<p class="sb-ft__slogan" aria-label="Slogan">YOUR<br>TAGLINE</p><p class="sb-ft__copy"><small>© Company Name Co., Ltd.</small><a href="#">Privacy policy</a></p>';

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  window.sbEase = CustomEase.create("sbCustom", "M0,0 L0.011,0.034 L0.023,0.092 L0.034,0.152 L0.045,0.209 L0.057,0.262 L0.068,0.311 L0.08,0.358 L0.091,0.401 L0.102,0.441 L0.114,0.479 L0.125,0.514 L0.136,0.546 L0.148,0.577 L0.159,0.605 L0.17,0.632 L0.182,0.657 L0.193,0.68 L0.205,0.701 L0.216,0.721 L0.227,0.74 L0.239,0.757 L0.25,0.774 L0.261,0.789 L0.273,0.803 L0.284,0.816 L0.295,0.829 L0.307,0.84 L0.318,0.851 L0.33,0.861 L0.341,0.87 L0.352,0.879 L0.364,0.887 L0.375,0.895 L0.386,0.902 L0.398,0.908 L0.409,0.915 L0.42,0.92 L0.432,0.926 L0.443,0.931 L0.455,0.935 L0.466,0.94 L0.477,0.944 L0.489,0.948 L0.5,0.951 L0.511,0.954 L0.523,0.957 L0.534,0.96 L0.545,0.963 L0.557,0.965 L0.568,0.968 L0.58,0.97 L0.591,0.972 L0.602,0.974 L0.614,0.976 L0.625,0.977 L0.636,0.979 L0.648,0.98 L0.659,0.982 L0.67,0.983 L0.682,0.984 L0.693,0.985 L0.705,0.986 L0.716,0.987 L0.727,0.988 L0.739,0.989 L0.75,0.989 L0.761,0.99 L0.773,0.991 L0.784,0.991 L0.795,0.992 L0.807,0.993 L0.818,0.993 L0.83,0.993 L0.841,0.994 L0.852,0.994 L0.864,0.995 L0.875,0.995 L0.886,0.995 L0.898,0.996 L0.909,0.996 L0.92,0.996 L0.932,0.997 L0.943,0.997 L0.955,0.997 L0.966,0.997 L0.977,0.997 L0.989,0.998 L1,1");
  window.sbBack = "back.out(1.4)";
  window.sbArw = '<span class="sb-carw" aria-hidden="true"><svg class="sb-carw__arw" viewBox="0 0 14.6 14.9"><use href="#sb-arw-min" class="f"/><use href="#sb-arw-min" class="b"/></svg></span>';

  // Lenis 1.3.25 — lerp .18 (phone .22), syncTouch, anchors land above the header line height + 20 with a 1.2s cubic inOut
  let lenis = null;
  if (!reduce && window.Lenis) {
    const e3 = (e) => (e < 0.5 ? 4 * e * e * e : 1 - (-2 * e + 2) ** 3 / 2);
    lenis = new Lenis({ lerp: mobile ? 0.22 : 0.18, syncTouch: true, touchInertiaExponent: 1.8, anchors: { offset: -((hd?.offsetHeight || 88) + 20), lock: true, duration: 1.2, easing: e3 } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.sbLenis = lenis;
  top.addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 1.2 }) : scrollTo({ top: 0, behavior: "smooth" })));
  ScrollTrigger.create({ start: 100, onEnter: () => top.classList.add("is-show"), onLeaveBack: () => top.classList.remove("is-show") });

  // Header row: on the first page it drops in from 40px above with power4.out for 1s after 2.75s, and on subpages for .6s after .25s
  if (hd) {
    const t = { delay: isTop ? 2.75 : 0.25, duration: isTop ? 1 : 0.6, ease: "power4.out" };
    if (reduce) hd.classList.remove("is-hide");
    else {
      gsap.fromTo(hd, { y: -40, opacity: 0 }, { ...t, y: 0, opacity: 1, onComplete: () => hd.classList.remove("is-hide") });
      gsap.to(hd, { autoAlpha: 1, duration: 0.35, delay: t.delay, ease: "power1.in" });
    }
  }

  // ── What attaches to one screen (data-taxi-view) — the same path on first open and when arriving via Taxi ──
  const SB = (window.SB = window.SB || { pages: {} });
  let current = null;
  SB.page = (key, fn) => { SB.pages[key] = fn; if (current && current.dataset.page === key && !current.sbPageOff) runPage(current); };
  const runPage = (view) => {
    const fn = SB.pages[view.dataset.page];
    if (!fn) return;
    const ctx = gsap.context(() => fn(view), view);
    view.sbPageOff = () => ctx.revert();
  };
  function mount(view) {
    current = view;
    const key = view.dataset.page || "home";
    markNav(key);
    const ft = view.querySelector('[data-slot="footer"]');
    if (ft) {
      ft.className = "sb-ft";
      ft.innerHTML = FOOT;
      const sl = ft.querySelector(".sb-ft__slogan");
      sl.innerHTML = sl.innerHTML.split(/<br\s*\/?>/i).map((ln) => '<span class="sb-line" aria-hidden="true">' + [...ln].map((c) => `<span class="l">${c}</span>`).join("") + "</span>").join("");
    }
    view.querySelectorAll("[data-city]").forEach((el) => {
      const [seed, w, d, n, people, trees] = el.dataset.city.split(",").map(Number);
      el.innerHTML = sbCity(seed, { w, d, n, people, trees });
    });
    // Titles (.sb-split) get .l per letter — spaces between words stay as literal characters
    view.querySelectorAll(".sb-split").forEach((el) => {
      el.setAttribute("aria-label", el.textContent.trim());
      el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map((ln) => '<span class="sb-line" aria-hidden="true">' + [...ln.replace(/<[^>]+>/g, "")].map((ch) => (ch === " " ? " " : `<span class="l">${ch}</span>`)).join("") + "</span>").join("");
    });
    const ctx = gsap.context(() => {
      // Button text roll (original c-motion-txt): on hover the front characters slide up 15px and fade while the back characters come in from 15px below at .85s quart.out, .022s per character
      view.querySelectorAll("[data-mt]").forEach((el) => {
        const t = el.dataset.mt;
        const row = (cls) => `<span class="sb-mt__${cls}" aria-hidden="true">${[...t].map((ch) => `<span class="l">${ch === " " ? " " : ch}</span>`).join("")}</span>`;
        el.innerHTML = row("front") + row("back") + `<span class="sb-sr">${t}</span>`;
        const a = el.closest("a, button");
        if (!a || reduce) return;
        // As in the original, opacity is pushed from 1.8 ↔ -1 — it stays visible until it drops below 1, then disappears quickly early in the curve
        const f = el.querySelectorAll(".sb-mt__front .l"), b = el.querySelectorAll(".sb-mt__back .l");
        const o = { duration: 0.85, ease: "quart.out", stagger: { each: 0.022 }, overwrite: true };
        const on = { y: 0, opacity: 1.8 }, up = { y: -15, opacity: -1 }, down = { y: 15, opacity: -1 };
        gsap.set(f, on); gsap.set(b, down);
        a.addEventListener("mouseenter", () => { gsap.fromTo(f, on, { ...up, ...o }); gsap.fromTo(b, down, { ...on, ...o, delay: 0.05 }); });
        a.addEventListener("mouseleave", () => { gsap.fromTo(f, up, { ...on, ...o, delay: 0.05 }); gsap.fromTo(b, on, { ...down, ...o }); });
      });
      // Category slot (original worksPage): pressing it leaves only that category’s cards and raises them again from 30px below in .8s power2.out (after .15s, .05s stagger). The All slot collapses out of view while All is active
      const tabs = view.querySelector("[data-filter-tabs]"), list = view.querySelector("[data-filter-list]");
      if (tabs && list) {
        let cur = "Entire";
        const mark = () => tabs.querySelectorAll("[data-category]").forEach((t) => t.classList.toggle("is-active", t.dataset.category === cur));
        tabs.addEventListener("click", (e) => {
          const t = e.target.closest("[data-category]");
          if (!t || t.dataset.category === cur) return;
          cur = t.dataset.category; mark();
          const show = [...list.children].filter((li) => { const on = cur === "Entire" || li.dataset.category === cur; li.classList.toggle("is-hide", !on); return on; });
          if (!reduce) gsap.fromTo(show, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, delay: 0.15, ease: "power2.out", stagger: 0.05, overwrite: true });
          ScrollTrigger.refresh();
        });
        mark();
      }
      if (reduce) return;
      // Footer: when the end of the body reaches 60% of the screen, the footer panel rises from 20px below over .5s, and the giant slogan letters from a frame clipped 80px below over 1.1s (.55s spread overall), dark green → ink color
      const fin = view.querySelector(".sb-ft__in"), fl = view.querySelectorAll(".sb-ft__slogan .l");
      if (fin) {
        const ink = getComputedStyle(view).color, deep = getComputedStyle(view).getPropertyValue("--site-ft-green").trim();
        const ftl = gsap.timeline({ paused: true });
        ftl.fromTo(fin, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power1.out" })
          .fromTo(fl, { autoAlpha: 1, y: 80, clipPath: "inset(0% -10% 100% 0%)" }, { y: 0, clipPath: "inset(0% -10% 0% -10%)", duration: 1.1, ease: sbEase, stagger: { amount: 0.55 } }, "<-=.2")
          .fromTo(fl, { color: deep }, { color: ink, duration: 0.4, delay: 0.35, ease: "power1.in", stagger: { amount: 0.2 } }, "<");
        ScrollTrigger.create({ trigger: view.querySelector('[data-slot="footer"]')?.previousElementSibling || view, start: "bottom 60%", onEnter: () => ftl.play(), onLeaveBack: () => ftl.reverse() });
      }
      // Sub-page head: Japanese title letters rise 10px over 1s, the big English moves up 35px over 1.6s back with letters opening from below one by one, breadcrumbs 1.2s after .75s
      const head = view.querySelector(".sb-phead");
      if (head) {
        gsap.timeline({ delay: 0.15 })
          .fromTo(head.querySelectorAll(".sb-phead__jp .l"), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: "cubic.out", stagger: { amount: 0.1 } })
          .fromTo(head.querySelector(".sb-phead__en"), { y: 35 }, { y: 0, duration: 1.6, ease: sbBack }, "<")
          .fromTo(head.querySelectorAll(".sb-phead__en .l"), { y: 25, clipPath: "inset(0% -18% 100% 0%)" }, { y: 0, clipPath: "inset(0% -18% 0% 0%)", duration: 1, ease: sbEase, stagger: { amount: 0.5 } }, "<")
          .fromTo(head.querySelector(".sb-bread"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power1.out" }, "<+=.75");
        const sky = head.querySelector(".sb-phead__sky");
        if (sky) gsap.timeline({ delay: 0.5 }).fromTo(sky.querySelectorAll(".sb-cloud"), { scale: 0.8, autoAlpha: 0 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power1.out", stagger: { amount: 0.2 } })
          .fromTo(sky.querySelector(".sb-heli"), { x: 80, y: -80, autoAlpha: 0 }, { autoAlpha: 1, x: 0, y: 0, duration: 1.5, ease: "power2.out" });
        // Intro text (original showDescription): after .5s the title letters rise 15px from a clipped frame below in .8s cubic.out (stagger .02s beyond 6 letters), after .2s it dims then lights up, and the description floats up 10px after .2s
        const ihd = view.querySelectorAll(".sb-intro__hd .l"), itx = view.querySelector(".sb-intro__txt");
        if (ihd.length) {
          const each = ihd.length > 6 ? 0.02 : 0.1;
          const dt = gsap.timeline({ delay: 0.5 });
          dt.fromTo(ihd, { clipPath: "inset(0% 0% 100% 0%)", y: 15 }, { visibility: "visible", y: 0, clipPath: "inset(0% 0% -20% 0%)", duration: 0.8, ease: "cubic.out", stagger: { each } })
            .fromTo(ihd, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power1.out", stagger: { amount: 0.3 } }, "<+=.2");
          if (itx) dt.fromTo(itx, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power2.out" }, "<+=.2");
        }
        const ill = view.querySelector(".sb-intro__ill");
        if (ill) {
          gsap.fromTo(ill.querySelectorAll(".js-step-01, .js-step-02, .js-step-03"), { y: 100, clipPath: "polygon(0% -10%,100% -10%, 150% -50%, 50% 0%, -50% -50%)" }, { visibility: "visible", y: 0, clipPath: "polygon(0% -10%,100% -10%, 150% 65%, 50% 115%, -50% 65%)", duration: 1.25, ease: sbBack, stagger: 0.1, onComplete() { gsap.set(this.targets(), { clipPath: "unset" }); } });
          gsap.fromTo(ill.querySelectorAll(".js-persons"), { y: 60, autoAlpha: 0 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "back.out(2)", stagger: 0.15, delay: 0.4 });
          if (!mobile) gsap.to(ill, { y: 150, scrollTrigger: { trigger: head, start: "top 0px", end: "top -1500px", scrub: 0 } });
        }
        const bg = view.querySelector(".sb-body__bg");
        if (bg) gsap.to(bg, { y: 220, scrollTrigger: { trigger: head, start: "top 0px", end: "top -1500px", scrub: 0 } });
      }
      // Subpage panels (.sb-box): the first one rises 20px over 1s after .35s, the rest rise 60px over 1.2s once they reach 88% of the screen
      if (key !== "home") view.querySelectorAll(".sb-box").forEach((b, i) => {
        if (i === 0) return gsap.fromTo(b, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, delay: 0.35, ease: sbEase });
        const tl = gsap.timeline({ paused: true });
        tl.fromTo(b, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, ease: sbEase });
        ScrollTrigger.create({ trigger: b, start: "top 88%", onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() });
      });
    }, view);
    view.sbOff = () => { ctx.revert(); view.sbPageOff?.(); };
    runPage(view);
    ScrollTrigger.refresh();
  }
  const first = document.querySelector("[data-taxi-view]");
  if (first) mount(first);

  // Taxi 1.9.1 transition (original transitionTime 250): on leaving, a white cover .2s linear, then the new screen is attached and the cover lifts at .4s ease-out. file:// can’t be fetched, so it covers and navigates normally
  const showCover = () => new Promise((r) => { cover.classList.remove("is-hide"); cover.classList.add("is-show"); setTimeout(r, 200); });
  const hideCover = () => { cover.classList.remove("is-show"); cover.classList.add("is-hide"); };
  if (window.taxi && /^https?:$/.test(location.protocol)) {
    const waitStyles = () => Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].filter((l) => !l.sheet).map((l) => new Promise((r) => { l.addEventListener("load", r, { once: true }); l.addEventListener("error", r, { once: true }); setTimeout(r, 1500); })));
    class Route extends taxi.Transition {
      async onLeave({ from, done }) { document.documentElement.classList.remove("is-menu-open"); lenis?.stop(); await showCover(); lenis?.start(); lenis?.scrollTo(0, { immediate: true, lock: true }); await new Promise((r) => setTimeout(r, 250)); from.sbOff?.(); done(); }
      // In the original, drawing the new screen (renderer enter → intro after 150~200ms) and lifting the cover (.4s) start together — attach right before the lift so the intro does not finish under the cover
      async onEnter({ to, done }) { await waitStyles(); scrollTo(0, 0); lenis?.scrollTo(0, { immediate: true }); mount(to); hideCover(); done(); }
    }
    const core = new taxi.Core({ links: 'a[href$=".html"]:not([target]):not([href*="/"]):not([data-taxi-ignore])', transitions: { default: Route },
      reloadJsFilter: (el) => el.dataset.taxiReload !== undefined, reloadCssFilter: (el) => el.dataset.taxiReload !== undefined });
  } else {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href$=".html"]:not([target])');
      if (!a || a.getAttribute("href").includes("/") || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      showCover().then(() => (location.href = a.href));
    });
  }
})();
