/* Shared motion for all pages: menu card (expand · fold on scroll · phone menu) · top and bottom lines · text shuffle · clock · page transition · Esc effect · hover sound · lazy video loading. 
   Original values are noted per function. */
(() => {
  const html = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqSide = matchMedia("(min-width: 768px)");
  const mqFine = matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
  const rem = () => parseFloat(getComputedStyle(html).fontSize) || 16;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ───────── Frame slot-in: menu card · top row · bottom row ───────── */
  const NAV = [
    ["Work", "works.html", "works"],
    ["Showreel", "visuals.html", "visuals"],
    ["Journal", "news.html", "news"],
    ["Information", "#", ""],
    ["Archive", "#", ""],
    ["Contact", "#", ""],
  ];
  const cur = page; // On detail, like the original, no menu item is the current marker
  const ph = (label, cls = "") => `<div class="wf-img al-ph ${cls}" data-label="${label}"></div>`;
  const navLinks = NAV.map(([t, href, key]) =>
    `<a class="al-link${key === cur ? " is-current" : ""}" href="${href}"${href === "#" ? " data-no-pt" : ""}${key === cur ? ' aria-current="page"' : ""}><i class="al-arrow" aria-hidden="true"></i><span class="al-link__t al-caps">${t}</span></a>`).join("");
  const building = [["Project Name One", "Industry"], ["Project Two", "Data Field"], ["Project Three", "Health Field"], ["Project Four", "E-Commerce"], ["Client Name", "Portfolio"], ["Client Name Two", "Personal Site"], ["Name", "Business Field"]]
    .map(([a, b]) => `<div class="al-building__row"><span>${a}</span><span>${b}</span></div>`).join("");
  const latest = ["00.00.0000", "00.00.0000", "00.00.0000", "00.00.0000", "00.00.0000"]
    .map((d, i) => `<div class="al-latest__row"><span><span>${d}</span><span>Article Title ${i + 1}</span></span><a class="al-latest__read" href="news.html" data-no-sound>read</a></div>`).join("");
  const features = ["Product screen mockup · tablet on a black chair · dark studio · landscape 4:3", "Phone screen in hand · light purple background · angled composition · landscape 4:3", "Laptop screen mockup · blue background · front view · landscape 4:3", "Brand poster set · white wall · front view · landscape 4:3"]
    .map((l, i) => `<a class="al-feature" href="detail.html" data-no-sound><div class="al-feature__img">${ph(l)}</div><div class="al-feature__meta"><span>Month 0000</span><span>Project Name ${i + 1}</span></div></a>`).join("");

  const menuSlot = $('[data-slot="menu-card"]');
  if (menuSlot) {
    menuSlot.className = "al-menu";
    menuSlot.setAttribute("aria-label", "Main menu");
    menuSlot.innerHTML = `
      <div class="al-menu__box">
        <div class="al-menu__top">
          <div class="al-menu__id">
            <a class="al-menu__home al-caps" href="index.html" data-label="English name">Studio Name Here</a>
            <div class="al-menu__role al-caps" data-label="Title in English, one line">Art Director &amp; Designer</div>
          </div>
          <div class="al-menu__nav">
            <div class="al-menu__links" data-label="Menu English name">
              <a class="al-link al-link--burger" href="#" data-no-pt role="button" aria-expanded="false"><span class="al-link__t al-caps">Menu</span></a>
              ${navLinks}
            </div>
            <button class="al-expand" type="button" aria-expanded="false"><span class="al-expand__t al-caps">expand</span></button>
          </div>
        </div>
        <div class="al-menu__bottom">
          <div class="al-count"><span class="al-count__n">0</span><span class="al-caps">Ongoing Projects</span></div>
          <div class="al-comm"><span class="al-caps">commissions</span><span class="al-comm__mail al-caps" data-label="Contact email address">hello@studio-name.com</span></div>
        </div>
      </div>
      <div class="al-menu__more" aria-hidden="true">
        <div class="al-building">
          <div class="al-cap"><span>Currently Building</span><span class="al-cap__r"><span>industry</span><span>0000</span></span></div>
          <div class="al-building__list">${building}</div>
        </div>
        <a class="al-new" href="news.html" data-no-sound>
          <div class="al-cap"><span>new</span></div>
          <div class="al-new__img">${ph("Person full body · black clothes · leaning on a chair in front of a white wall · front light · portrait 4:5")}</div>
          <div class="al-new__name"><span><span>0000</span><span>interview</span></span><span>Feature Title Here</span></div>
        </a>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="al-side" data-slot="menu-side-panel" aria-hidden="true">
        <div class="al-side__in">
          <div class="al-side__text">
            <div class="al-side__para"><p>Your first intro paragraph goes here, three or four lines on how it began and what has been made so far.</p><p>Your second paragraph goes here. Three or four lines on what you do now and how you work.</p></div>
            <div class="al-latest"><div class="al-cap"><span>Latest Articles</span></div>${latest}</div>
          </div>
          <div class="al-side__works"><div class="al-side__cap">Latest Projects</div><div class="al-side__list">${features}</div></div>
        </div>
      </div>
      <div class="al-mob" data-slot="mobile-menu" aria-hidden="true"><div class="al-mob__in"><div class="al-mob__title">sitemap</div><div class="al-mob__links">
        <a href="index.html"${page === "home" ? ' class="is-current"' : ""}>home</a>${NAV.map(([t, href, key]) => `<a href="${href}"${key === cur ? ' class="is-current"' : ""}${href === "#" ? " data-no-pt" : ""}>${t}</a>`).join("")}
      </div></div></div>`);
  }
  const topSlot = $('[data-slot="top-bar"]');
  if (topSlot) {
    topSlot.className = "al-top";
    topSlot.innerHTML = `<div class="al-top__in"><div class="al-top__tag al-caps" data-scramble="random" data-label="Short English phrase — changes every time it opens">a short tagline here.</div><div class="al-top__place"><span class="al-caps" data-label="City Name (English)">city, town &amp; second city</span><span class="al-top__time al-caps"><span data-clock>00:00:00</span><span>KST</span></span></div></div>`;
  }
  const botSlot = $('[data-slot="footer"]');
  if (botSlot) {
    botSlot.className = "al-bottom";
    botSlot.innerHTML = `<div class="al-bottom__in"><div class="al-bottom__fx"><span class="al-fxhint al-caps" data-fx-hint>Press Esc for effects (?)</span></div><div class="al-social">${["Instagram", "Brand", "X (Twitter)", "LinkedIn"].map((t) => `<a class="al-caps" href="#" data-no-pt>${t}</a>`).join("")}</div></div>`;
  }
  document.body.insertAdjacentHTML("beforeend", '<div class="al-pt" aria-hidden="true"><div class="al-pt__veil"></div><div class="al-pt__cover"></div></div>');

  /* ───────── Smooth scroll: original Lenis 1.3.23 options as they are ───────── */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ autoRaf: true, autoToggle: true, anchors: true, allowNestedScroll: true, naiveDimensions: true, stopInertiaOnNavigate: true });
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  }

  /* ───────── Text shuffle ───────── */
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  // For each letter set a start (order × stagger) and an end (start + min~max), and show random letters in between
  function scramble(el, to, { stagger = 42, min = 520, max = 920, chars = CHARS, from, fixed = 0 } = {}) {
    cancelAnimationFrame(el._scr || 0);
    const old = from ?? el.textContent;
    if (reduce || old === to) { el.textContent = to; return; }
    const n = Math.max(old.length, to.length);
    const q = Array.from({ length: n }, (_, i) => {
      const start = i * stagger + Math.random() * stagger * 0.8;
      return { a: old[i] || "", b: to[i] || "", start, end: fixed ? Math.min(fixed, i * stagger + min + (((i * 37) % 100) / 100) * (max - min)) : start + min + Math.random() * (max - min), c: "" };
    });
    if (fixed) q[q.length - 1].end = fixed;
    const t0 = performance.now();
    el.classList.add("is-scrambling");
    const tick = (now) => {
      const t = now - t0;
      let out = "", done = 0;
      for (const k of q) {
        if (t >= k.end) { done++; out += k.b; }
        else if (t >= k.start) { if (!k.c || Math.random() < 0.28) k.c = chars[(Math.random() * chars.length) | 0]; out += k.b === " " ? " " : k.c; }
        else out += k.a;
      }
      el.textContent = out;
      if (done === n) { el.classList.remove("is-scrambling"); el.textContent = to; return; }
      el._scr = requestAnimationFrame(tick);
    };
    el._scr = requestAnimationFrame(tick);
  }
  const PHRASES = ["a short tagline here.", "where the line takes form.", "one more line here."];
  $$('[data-scramble="random"]').forEach((el) => {
    if (innerWidth < 992) return;
    let last = "";
    try { last = sessionStorage.getItem("al-phrase") || ""; } catch (e) {}
    const pool = PHRASES.filter((p) => p !== last);
    const next = pool[(Math.random() * pool.length) | 0];
    try { sessionStorage.setItem("al-phrase", next); } catch (e) {}
    new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { io.disconnect(); scramble(el, next); } }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 }).observe(el);
  });
  $$('[data-scramble="hover"]').forEach((el) => {
    const host = el.closest("a") || el, text = el.textContent;
    host.addEventListener("pointerenter", () => scramble(el, text, { min: 580, max: 760, fixed: 1256, from: text.replace(/\S/g, () => CHARS[(Math.random() * CHARS.length) | 0]) }));
  });

  /* ───────── Clock: ticks every 1s, the colon goes off for half a second ───────── */
  const clocks = $$("[data-clock]");
  if (clocks.length && mqFine.matches) {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/City", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const draw = () => {
      const [h, m, s] = fmt.format(new Date()).split(":");
      clocks.forEach((el) => { el.innerHTML = `${h}<i class="al-colon">:</i>${m}<i class="al-colon">:</i>${s}`; });
      if (!reduce) setTimeout(() => $$(".al-colon").forEach((c) => c.classList.add("is-off")), 500);
      setTimeout(draw, 1000 - (Date.now() % 1000));
    };
    draw();
  }

  /* ───────── Video: downloads when near, plays when visible ───────── */
  function playVideo(v) {
    if (!v) return;
    if (!v.src && v.dataset.src) v.src = v.dataset.src;
    v.muted = true; v.playsInline = true; v.loop = true;
    const p = v.play();
    if (p) p.catch(() => {});
  }
  const lazyIo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) playVideo(e.target); else if (!e.target.paused) e.target.pause(); }), { rootMargin: "320px 0px", threshold: 0.01 });
  $$("video[data-lazy]").forEach((v) => lazyIo.observe(v));

  /* ───────── Frost lift: once visible, after a random 80~680ms delay ───────── */
  const frostItems = $$("[data-frost-item]");
  if (frostItems.length) {
    if (reduce || innerWidth < 992) frostItems.forEach((el) => el.classList.add("is-revealed"));
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        setTimeout(() => e.target.classList.add("is-revealed"), 80 + Math.floor(Math.random() * 600));
      }), { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });
      frostItems.forEach((el) => io.observe(el));
    }
  }

  /* ───────── Menu expand: the card grows to screen height and the side plate opens by clip-path (.92s power3.out / .82s power3.inOut) ───────── */
  const nav = $(".al-menu"), side = $(".al-side"), more = $(".al-menu__more"), btn = $(".al-expand"), label = $(".al-expand__t");
  let open = false, moving = false, tl = null, geo = null, backdrop = null, sideHome = null;
  const rv = { nav: 0, sideR: 0, sideB: 0, side: 0, content: 0 };
  const radius = () => getComputedStyle(nav).borderRadius || "0px";
  const inset = (t, r, b, l) => `inset(${t}px ${r}px ${b}px ${l}px round ${geo.radius})`;
  function applyReveal() {
    if (!geo) return;
    nav.style.clipPath = inset(0, 0, Math.max(0, rv.nav), 0);
    more.style.opacity = rv.content;
    if (geo.side) { side.style.clipPath = inset(0, Math.max(0, rv.sideR), Math.max(0, rv.sideB), 0); side.style.opacity = rv.side; }
  }
  function layoutOpen() {
    const r = nav.getBoundingClientRect(), gapB = 0.75 * rem();
    const restH = geo ? geo.restH : r.height;
    const navH = Math.max(0, innerHeight - r.top - gapB);
    geo = { top: r.top, left: r.left, width: r.width, restH, navH, radius: radius(), side: mqSide.matches };
    if (geo.side) {
      gsap.set(nav, { position: "fixed", top: r.top, left: r.left, width: r.width, height: navH, right: "auto", bottom: "auto" });
      const left = r.left + r.width + 0.5 * rem();
      geo.sideW = Math.max(0, innerWidth - left - 0.75 * rem());
      geo.sideH = navH;
      gsap.set(side, { top: r.top, left, width: geo.sideW, height: navH });
    } else gsap.set(nav, { height: navH });
  }
  function setOpen(to) {
    if (!nav || !window.gsap || open === to && !moving) return;
    const opening = to, resuming = moving;
    if (tl) tl.kill();
    if (!resuming) {
      if (opening) {
        geo = null;
        if (!backdrop) { backdrop = document.createElement("div"); backdrop.className = "al-backdrop"; document.body.append(backdrop); backdrop.addEventListener("click", () => setOpen(false)); }
        nav.classList.add("is-moving");
        layoutOpen();
        if (geo.side) { side.classList.add("is-mounted"); side.setAttribute("aria-hidden", "false"); }
        backdrop.classList.add("is-on");
        html.classList.add("al-lock");
        Object.assign(rv, { nav: geo.navH - geo.restH, sideR: geo.sideW || 0, sideB: (geo.sideH || 0) - geo.restH, side: 0, content: 0 });
      }
    }
    open = to; moving = true;
    nav.classList.add("is-moving");
    nav.classList.toggle("is-open", opening);
    more.setAttribute("aria-hidden", String(!opening));
    btn.setAttribute("aria-expanded", String(opening));
    scramble(label, opening ? "Minimize" : "expand", { stagger: 20, min: 80, max: 130, chars: CHARS.slice(0, 62), from: opening ? "expand" : "Minimize" });
    applyReveal();
    const target = opening ? { nav: 0, sideR: 0, sideB: 0, side: 1, content: 1 } : { nav: geo.navH - geo.restH, sideR: geo.sideW || 0, sideB: (geo.sideH || 0) - geo.restH, side: 0, content: 0 };
    const span = Math.max(1, geo.navH - geo.restH), remain = Math.min(1, Math.abs(rv.nav - target.nav) / span);
    let dur = (opening ? 0.92 : 0.82) * (resuming ? Math.max(0.35, remain) : 1);
    if (reduce) dur = 0.01;
    const ease = opening ? "power3.out" : "power3.inOut";
    tl = gsap.timeline({ defaults: { ease }, onUpdate: applyReveal, onComplete: () => finish(opening) });
    tl.to(rv, { nav: target.nav, duration: dur }, 0);
    if (geo.side) tl.to(rv, { sideR: target.sideR, sideB: target.sideB, side: target.side, duration: dur }, opening && !resuming ? 0.06 : 0);
    tl.to(rv, { content: target.content, duration: opening ? dur * 0.72 : dur * 0.55, ease: opening ? ease : "power2.in" }, opening && !resuming ? dur * 0.16 : 0);
    tl.to(backdrop, { opacity: opening ? 1 : 0, duration: dur }, 0);
  }
  function finish(opened) {
    moving = false; tl = null;
    nav.classList.remove("is-moving");
    nav.style.clipPath = ""; side.style.clipPath = "";
    if (opened) return;
    gsap.set(nav, { clearProps: "position,top,left,width,height,right,bottom" });
    more.style.opacity = "";
    side.classList.remove("is-mounted"); side.setAttribute("aria-hidden", "true");
    gsap.set(side, { clearProps: "top,left,width,height,opacity" });
    backdrop.classList.remove("is-on");
    html.classList.remove("al-lock");
    geo = null;
  }
  if (btn) {
    btn.addEventListener("click", () => setOpen(!open));
    addEventListener("resize", () => { if (open && !moving) { const rest = geo.restH; gsap.set(nav, { clearProps: "height" }); geo = { restH: rest }; layoutOpen(); } });
  }

  /* ───────── Scroll collapse (outside home·work list): scrolling down past 32px collapses the links·lower cell, leaving only MENU ───────── */
  const links = $(".al-menu__links"), burger = $(".al-link--burger"), bottom = $(".al-menu__bottom"), mob = $(".al-mob");
  let collapsed = false, ctl = null, mobOpen = false;
  const collapsible = nav && page !== "home" && page !== "works";
  function buildCollapse() {
    const items = $$(".al-link:not(.al-link--burger)", links), texts = items.map((a) => $(".al-link__t", a)), arrows = items.map((a) => $(".al-arrow", a));
    const kids = [...bottom.children];
    const t = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut", overwrite: "auto" } });
    if (mqSide.matches) {
      const fullH = links.offsetHeight, oneH = texts[0].offsetHeight;
      const span = 0.34 + 0.032 * (items.length - 1);
      gsap.set(links, { height: fullH, overflow: "hidden" });
      t.to(texts, { y: -16, autoAlpha: 0, scaleY: 0.84, duration: 0.34, stagger: { each: 0.032, from: "start" }, ease: "power2.out" }, 0);
      t.to(arrows, { autoAlpha: 0, duration: 0.17, stagger: { each: 0.032, from: "start" }, ease: "expo.in" }, 0);
      t.to(links, { height: oneH, duration: Math.max(span - 0.102, 0.12) + 0.2, ease: "power2.inOut" }, 0.102);
      t.set(items, { display: "none" }, span);
      const at = span * 0.55;
      t.to(kids, { opacity: 0, y: -8, duration: 0.32, stagger: 0.045, ease: "expo.in" }, at * 0.35);
      t.to(bottom, { height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0, borderTopWidth: 0, duration: 0.5, ease: "power2.out" }, at);
      t.to(bottom, { opacity: 0, duration: 0.28, ease: "expo.in" }, at + 0.175);
      const end = t.duration() + 0.02;
      t.set(burger, { display: "flex", position: "absolute", top: 0, left: 0 }, end);
      t.fromTo(burger, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.16, ease: "expo.out" }, end);
      t.fromTo($(".al-link__t", burger), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.16, ease: "expo.out" }, end);
    } else {
      gsap.set(bottom, { height: bottom.offsetHeight });
      t.to(bottom, { height: 0, marginTop: 0, paddingTop: 0, borderTopWidth: 0, opacity: 0, duration: 0.65 }, 0);
    }
    return t;
  }
  function setCollapsed(to) {
    if (!collapsible || !window.gsap || collapsed === to || open || moving) return;
    collapsed = to;
    if (!ctl) ctl = buildCollapse();
    nav.classList.toggle("is-collapsed", to);
    if (reduce) { ctl.progress(to ? 1 : 0); return; }
    if (to) ctl.timeScale(1).play(); else ctl.timeScale(1.5).reverse();
  }
  if (collapsible) {
    let lastY = scrollY, acc = 0;
    addEventListener("scroll", () => {
      const y = scrollY, d = y - lastY;
      lastY = y;
      if (y <= 32) { acc = 0; setCollapsed(false); return; }
      acc = d > 0 ? Math.max(0, acc) + d : 0;
      if (acc > 16) setCollapsed(true);
    }, { passive: true });
    addEventListener("resize", () => { if (ctl && !collapsed) { ctl.revert(); ctl = null; } });
  }
  /* Phone menu: pressing MENU opens a panel beneath the card (.65s power2.inOut) */
  function setMob(to) {
    if (!mob || mobOpen === to) return;
    mobOpen = to;
    mob.classList.toggle("is-open", to);
    mob.setAttribute("aria-hidden", String(!to));
    burger.setAttribute("aria-expanded", String(to));
    gsap.set(mob, { top: nav.getBoundingClientRect().bottom + 0.45 * rem() });
    gsap.to(mob, { height: to ? $(".al-mob__in", mob).offsetHeight : 0, opacity: to ? 1 : 0, duration: reduce ? 0 : 0.65, ease: "power2.inOut", overwrite: true });
  }
  if (burger) burger.addEventListener("click", (e) => {
    e.preventDefault();
    if (!mqSide.matches) setMob(!mobOpen);
    else if (collapsed) setCollapsed(false);
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (open) { e.stopImmediatePropagation(); setOpen(false); }
    else if (mobOpen) setMob(false);
  }, true);

  /* ───────── Page transition: out .52s (body 14px blur · up 14px → blurred film .65 → cover) / in .95s expo.out (from 22px below) ───────── */
  const PT_KEY = "al-pt-enter", BLUR = 14;
  const ptOk = () => window.gsap && innerWidth >= 992 && !reduce && !matchMedia("(hover: none) and (pointer: coarse)").matches;
  const grid = $(".al-pt"), veil = $(".al-pt__veil"), cover = $(".al-pt__cover");
  const pack = () => ({ content: $$("[data-pt]"), bg: $$("[data-pt-bg]") });
  const flat = page === "works";
  function ptEnter() {
    let pending = false;
    try { pending = !!sessionStorage.getItem(PT_KEY); sessionStorage.removeItem(PT_KEY); } catch (e) {}
    html.classList.remove("al-pt-exit");
    if (!pending || !ptOk()) { html.classList.remove("al-pt-pending"); return; }
    const { content, bg } = pack();
    scrollTo(0, 0);
    grid.classList.add("is-on");
    gsap.set(cover, { opacity: 1 });
    gsap.set(veil, { opacity: 0.42, backdropFilter: `blur(${BLUR}px)` });
    gsap.set(content, { opacity: 0, y: flat ? 0 : 22, filter: `blur(${BLUR}px)` });
    gsap.set(bg, { opacity: 0 });
    html.classList.remove("al-pt-pending");
    requestAnimationFrame(() => {
      const t = gsap.timeline({ onComplete: () => { grid.classList.remove("is-on"); gsap.set(content, { clearProps: "opacity,transform,filter" }); gsap.set(bg, { clearProps: "opacity" }); if (window.ScrollTrigger) ScrollTrigger.refresh(); } });
      t.to(cover, { opacity: 0, duration: 0.45, ease: "power1.out" }, 0);
      t.to(bg, { opacity: 1, duration: 0.95 * 0.75, ease: "power2.out" }, 0.02);
      t.to(content, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.95, ease: "expo.out", stagger: flat ? 0 : { each: 0.04, from: "start" } }, 0.04);
      t.to(veil, { opacity: 0, backdropFilter: "blur(0px)", duration: 0.95 * 0.85, ease: "power1.out" }, 0.06);
    });
  }
  function ptExit(url) {
    const { content, bg } = pack(), EXIT = 0.52;
    html.classList.add("al-pt-exit");
    try { sessionStorage.setItem(PT_KEY, "1"); } catch (e) {}
    grid.classList.add("is-on");
    gsap.set([cover, veil], { opacity: 0 });
    const t = gsap.timeline({ onComplete: () => { gsap.set(cover, { opacity: 1 }); location.href = url; } });
    t.to(content, { opacity: 0, y: flat ? 0 : -14, filter: `blur(${BLUR}px)`, duration: EXIT, ease: "power2.in", stagger: flat ? 0 : { each: 0.03, from: "end" } }, 0);
    t.to(bg, { opacity: 0, duration: EXIT * 0.85, ease: "power2.in" }, EXIT * 0.1);
    t.to(veil, { opacity: 0.65, backdropFilter: `blur(${BLUR}px)`, duration: EXIT * 0.7, ease: "power2.inOut" }, EXIT * 0.18);
    t.to(cover, { opacity: 1, duration: 0.22, ease: "power2.in" }, EXIT * 0.72);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("data-no-pt")) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) return;
    if (a.closest(".al-menu__links")) { try { sessionStorage.setItem("al-arrive", JSON.stringify({ t: Date.now() })); } catch (err) {} }
    if (!ptOk()) return;
    e.preventDefault();
    if (open) setOpen(false);
    ptExit(a.href);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) { html.classList.remove("al-pt-exit", "al-pt-pending"); grid.classList.remove("is-on"); gsap.set(pack().content, { clearProps: "opacity,transform,filter" }); gsap.set(pack().bg, { clearProps: "opacity" }); } });
  ptEnter();

  /* ───────── Hover sound: the original is a short sound file — here a synthesized tick in the same spot (1.2kHz sine 40ms) ───────── */
  let ac = null;
  addEventListener("pointerdown", () => { if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ac = new AC(); } }, { once: true });
  document.addEventListener("pointerover", (e) => {
    if (!ac || !mqFine.matches) return;
    const a = e.target.closest && e.target.closest("a[href]:not([data-no-sound])");
    if (!a || a.contains(e.relatedTarget)) return;
    const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.frequency.value = 1200; g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 0.05);
  });

  /* ───────── Esc effect: each press turns it on → turns it off and moves to the next effect (repeat presses within 260ms are discarded). Six types ───────── */
  const fxHost = document.createElement("div");
  fxHost.className = "al-fx";
  let fxOn = false, fxIdx = 0, fxStop = null, fxLast = 0;
  const canvas = (scale, css) => {
    const c = document.createElement("canvas");
    Object.assign(c.style, css);
    fxHost.append(c);
    const fit = () => { c.width = Math.max(1, (innerWidth * scale) | 0); c.height = Math.max(1, (innerHeight * scale) | 0); };
    fit();
    return { c, ctx: c.getContext("2d"), fit };
  };
  const loop = (draw, extra) => {
    let on = true, id = 0;
    const f = (now) => { if (!on) return; if (!document.hidden) draw(now); id = requestAnimationFrame(f); };
    id = requestAnimationFrame(f);
    return () => { on = false; cancelAnimationFrame(id); if (extra) extra(); };
  };
  const FX = [
    // 1 Film grain: random gray on a 0.28x panel, overlay .9
    () => {
      const k = canvas(0.28, { mixBlendMode: "overlay", opacity: 0.9, imageRendering: "pixelated" });
      let img = k.ctx.createImageData(k.c.width, k.c.height);
      return loop(() => {
        const b = img.data;
        for (let i = 0; i < b.length; i += 4) { b[i] = b[i + 1] = b[i + 2] = (Math.random() * 255) | 0; b[i + 3] = 32 + ((Math.random() * 48) | 0); }
        k.ctx.putImageData(img, 0, 0);
      });
    },
    // 2 pixel grid: 7px cells breathe diagonally and every seventh cell runs hot, soft-light
    () => {
      const k = canvas(0.5, { mixBlendMode: "soft-light", opacity: 0.95, imageRendering: "pixelated" });
      const cell = innerWidth > 767 ? 7 : 5;
      return loop((now) => {
        const t = now * 0.001, { ctx, c } = k, cols = Math.ceil(c.width / cell) + 1, rows = Math.ceil(c.height / cell) + 1;
        ctx.clearRect(0, 0, c.width, c.height);
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
          const pulse = 0.5 + Math.sin(t * 2.4 + x * 0.35 + y * 0.28) * 0.5, hot = (x + y + Math.floor(t * 1.8)) % 7 === 0;
          ctx.fillStyle = hot ? `rgba(255,140,48,${0.14 + pulse * 0.12})` : `rgba(198,88,28,${0.04 + pulse * 0.05})`; // Not skin: effect palette (rusty orange)
          ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
        }
        ctx.strokeStyle = "rgba(255,168,72,0.22)"; // Not skin: effect palette (grid lines)
        ctx.beginPath();
        for (let x = 0; x <= c.width; x += cell) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, c.height); }
        for (let y = 0; y <= c.height; y += cell) { ctx.moveTo(0, y + 0.5); ctx.lineTo(c.width, y + 0.5); }
        ctx.stroke();
      });
    },
    // 3 Edit grid lines: at each left edge of the on-screen text blocks, a vertical guide line is drawn from the top, overlay .92
    () => {
      const k = canvas(1, { mixBlendMode: "overlay", opacity: 0.92 });
      const xs = [...new Set($$(".al-caps, [data-pt] span, [data-pt] div").map((el) => Math.round(el.getBoundingClientRect().left)).filter((x) => x > 0 && x < innerWidth))].slice(0, 24);
      const ink = getComputedStyle(html).getPropertyValue("--kf-ink").trim();
      const t0 = performance.now();
      return loop((now) => {
        const { ctx, c } = k, p = Math.min(1, (now - t0) / 900), e = 1 - Math.pow(1 - p, 3);
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.strokeStyle = ink; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
        ctx.beginPath();
        xs.forEach((x) => { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, c.height * e); });
        for (let y = 0; y < c.height; y += rem() * 4) { ctx.moveTo(0, y + 0.5); ctx.lineTo(c.width * e, y + 0.5); }
        ctx.stroke();
      });
    },
    // 4 cursor gradient: a 38vmax light follows the cursor (lerp .12), screen .92
    () => {
      const d = document.createElement("div");
      Object.assign(d.style, { position: "absolute", inset: 0, mixBlendMode: "screen", opacity: 0.92 });
      fxHost.append(d);
      let x = 50, y = 50, tx = 50, ty = 50;
      const mv = (e) => { tx = (e.clientX / innerWidth) * 100; ty = (e.clientY / innerHeight) * 100; };
      addEventListener("pointermove", mv, { passive: true });
      return loop(() => {
        x += (tx - x) * 0.12; y += (ty - y) * 0.12;
        d.style.background = `radial-gradient(circle 38vmax at ${x}% ${y}%, rgba(255,120,180,.28) 0%, rgba(120,180,255,.16) 32%, rgba(255,220,120,.08) 52%, transparent 72%), radial-gradient(circle 55vmax at calc(${x}% + 12vmax) calc(${y}% - 8vmax), rgba(90,255,200,.12) 0%, transparent 58%)`; // Not skin: effect palette (rainbow light)
      }, () => removeEventListener("pointermove", mv));
    },
    // 5 Infrared: backdrop-filter turning the whole screen from monochrome → magenta thermal view, with 4px scanlines
    () => {
      const g = document.createElement("div"), s = document.createElement("div");
      Object.assign(g.style, { position: "absolute", inset: 0, backdropFilter: "grayscale(1) contrast(1.65) sepia(1) hue-rotate(300deg) saturate(3.4) brightness(0.92)" });
      g.style.webkitBackdropFilter = g.style.backdropFilter;
      Object.assign(s.style, { position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,60,20,.02) 3px, rgba(255,60,20,.02) 4px)" }); // Not skin: effect palette (scan lines)
      fxHost.append(g, s);
      return () => {};
    },
    // 6 lens bubbles: round lenses with bright edges slowly float up, magnifying the screen behind
    () => {
      const lenses = Array.from({ length: 9 }, () => {
        const el = document.createElement("div"), r = 60 + Math.random() * 120;
        Object.assign(el.style, { position: "absolute", width: r * 2 + "px", height: r * 2 + "px", borderRadius: "50%", border: "1px solid var(--site-ring-on)", backdropFilter: "blur(2px) brightness(1.15) saturate(1.4)" });
        el.style.webkitBackdropFilter = el.style.backdropFilter;
        fxHost.append(el);
        return { el, r, x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - 0.5) * 0.3, vy: -0.15 - Math.random() * 0.35 };
      });
      return loop(() => lenses.forEach((b) => {
        b.x += b.vx; b.y += b.vy;
        if (b.y < -b.r * 2) { b.y = innerHeight + b.r; b.x = Math.random() * innerWidth; }
        b.el.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0)`;
      }));
    },
  ];
  function fxToggle() {
    if (!mqFine.matches || reduce) return;
    if (fxOn) {
      if (fxStop) fxStop();
      fxHost.replaceChildren(); fxHost.remove();
      fxOn = false; fxIdx = (fxIdx + 1) % FX.length;
    } else {
      document.body.append(fxHost);
      fxStop = FX[fxIdx]();
      fxOn = true;
    }
    html.classList.toggle("al-fx-on", fxOn);
  }
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const now = Date.now();
    if (now - fxLast < 260) return;
    fxLast = now;
    fxToggle();
  });
  $$("[data-fx-hint]").forEach((el) => el.addEventListener("click", fxToggle));

  window.AL = { scramble, playVideo, reduce, lenis, rem, CHARS, isMenuBusy: () => open || moving };
})();
