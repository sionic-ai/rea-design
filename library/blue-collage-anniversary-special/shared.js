// Common to all pages: draws in and hooks up the header (logo, vertical menu, weather clock), phone menu, cursor dot, floating pill button, reveal, footer (next page) and page transition.
// Original values: Lenis lerp .1 · curves .23,1,.32,1 / .25,.46,.45,.94 · menu dot move .65s · entrance 30px 1s
// Subpage transitions on this site use swup 4.6.1 + the preload plugin, same as the original — only #swup (body + footer) is swapped, so per-page behaviour is attached and detached with HS.page(name, init).
// Weather and handshake play our Lottie (media/lottie-data.js) with the same lottie-web 5.12.2 as the original, using the same playback method.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const swupRoot = () => document.getElementById("swup");
  const pageOf = () => swupRoot()?.dataset.page || document.body.dataset.page || "home";
  const page = pageOf();
  const HS = (window.HS = { reduced });
  const pages = {};
  let scope = null;
  HS.page = (name, init) => (pages[name] = init);
  HS.observe = (io) => { scope?.cleanups.push(() => io.disconnect()); return io; };

  const NAV = [
    ["home", "index.html", "Top"],
    ["", "#", "What We Do"],
    ["works", "works.html", "Works"],
    ["", "#", "Identity"],
    ["about", "about.html", "Company"],
    ["news", "news.html", "News"],
    ["", "#", "Contact"],
    ["home", "index.html", "Sample SunAd brand"],
  ];
  const cur = page === "detail" ? "works" : page;
  const sun = '<span class="hs-weather__icon" data-lottie="cloud" aria-hidden="true"></span>';
  const logo = '<a class="hs-logo" href="index.html" data-no-swup aria-label="Home">Sample Sun<i>Ad</i></a>';

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "hs-head";
    head.innerHTML = `${logo}
      <nav class="hs-menu" data-cursor-hide aria-label="Main menu">
        <ul>${NAV.map(([k, h, t], i) => `<li><a href="${h}"${k && k === cur && i < 7 ? ' aria-current="page"' : ""}${h === "index.html" ? " data-no-swup" : ""}>${t}</a></li>`).join("")}</ul>
        <i class="hs-menu__dot"></i>
      </nav>
      <button class="hs-weather" type="button" aria-label="View weather larger"><span>Your place name, city here</span>${sun}<time data-clock>00:00:00</time></button>`;
    head.insertAdjacentHTML("afterend", `
      <button class="hs-toggle" type="button" aria-label="Open Menu"><span>Menu</span><i></i></button>
      <div class="hs-nav" data-slot="mobile-nav">
        <ul>${NAV.map(([, h, t]) => `<li><a href="${h}"${h === "index.html" ? " data-no-swup" : ""}>${t}</a></li>`).join("")}</ul>
        <address>Postal code 000-0000<br>Your one-line address here<br>Your place name, city here · <time data-clock>00:00:00</time></address>
      </div>
      <div class="hs-wfull" data-slot="weather-full" aria-hidden="true">
        <div class="hs-wfull__icon" data-lottie="cloud"></div>
        <div class="hs-wfull__line">${"<span>Your place name, city here  <time data-clock>00:00:00</time>  Overcast    </span>".repeat(6)}</div>
      </div>
      ${document.body.classList.contains("is-brand") ? "" : `<div class="hs-cursor" aria-hidden="true">
        <div class="hs-cursor__shape"><div class="hs-cursor__inner"></div></div>
        <div class="hs-cursor__arrow"><div class="right-up"><div></div><div></div></div></div>
        <div class="hs-cursor__icon"><div class="blank"><svg viewBox="0 0 40 40"><path d="M17 15h8v8M25 15l-10 10"/></svg></div></div>
        <div class="hs-cursor__txt"><div class="detail"><p>Detail</p></div></div>
        <div class="hs-cursor__contact"><div class="motion" data-lottie="shakehand"></div></div>
        <div class="hs-cursor__loading"><div class="progress"><span>0</span><span>0</span><span>0</span></div></div>
      </div>`}
      <div class="hs-trans" data-slot="page-transition" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><path class="transition-path1"/><path class="transition-path2"/><path class="transition-path3"/></svg></div>`);

    // Menu dot: sits next to the current page, then moves to the hovered row
    const menu = head.querySelector(".hs-menu");
    const dot = menu.querySelector(".hs-menu__dot");
    const items = [...menu.querySelectorAll("li")];
    let home = Math.max(0, items.findIndex((li) => li.querySelector("[aria-current]")));
    const place = (i) => { dot.style.transform = `translateY(${items[i].offsetTop + 6}px)`; };
    place(home);
    // When swup changes the page, move the current-page marker and dot position to the new page
    HS.markNav = (pg) => {
      const key = pg === "detail" ? "works" : pg;
      const links = [...menu.querySelectorAll("a")];
      links.forEach((a, i) => (NAV[i][0] && NAV[i][0] === key && i < 7 ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
      home = Math.max(0, items.findIndex((li) => li.querySelector("[aria-current]")));
      place(home);
    };
    items.forEach((li, i) => li.addEventListener("mouseenter", () => place(i)));
    menu.addEventListener("mouseleave", () => place(home));

    const tog = document.querySelector(".hs-toggle"), nav = document.querySelector(".hs-nav");
    tog.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      tog.classList.toggle("is-open", open);
      tog.querySelector("span").textContent = open ? "Close" : "Menu";
      open ? HS.lenis?.stop() : HS.lenis?.start();
    });
  }

  // Lottie (original Weather · ContactAnimation): after a full run it loops from frame 50. The header weather runs on its own and restarts every 15 seconds, while the weather panel and handshake run only while the pointer is on them
  const lotties = {};
  if (window.lottie && window.HS_LOTTIE) document.querySelectorAll("[data-lottie]").forEach((el) => {
    const key = el.closest(".hs-weather") ? "header" : el.closest(".hs-wfull") ? "full" : "shake";
    const a = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: key === "header" && !reduced, animationData: structuredClone(HS_LOTTIE[el.dataset.lottie]) });
    a.addEventListener("complete", () => a.goToAndPlay(50, true));
    if (key === "header" && !reduced) setInterval(() => a.goToAndPlay(0, true), 15000);
    lotties[key] = a;
  });

  // Weather panel: only while the mouse is over the header weather (original WeatherFullView mouseenter·mouseleave)
  const wf = document.querySelector(".hs-wfull");
  const weatherBtn = document.querySelector(".hs-weather");
  weatherBtn?.addEventListener("mouseenter", () => { wf.classList.add("is-open"); lotties.full?.play(); });
  weatherBtn?.addEventListener("mouseleave", () => { wf.classList.remove("is-open"); lotties.full?.stop(); });

  // Weather clock: h:m:s every second
  const tick = () => {
    const d = new Date(), p = (n) => String(n).padStart(2, "0");
    document.querySelectorAll("[data-clock]").forEach((t) => (t.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`));
  };
  tick();
  setInterval(tick, 1000);

  // Cursor (the original main site Cursor, not on the brand-anniversary page): the body re-chases x·y every frame with .8s expo.out, and a second position chasing the same way, and between it and the mouse
  // As the distance e grows the shape stretches (horizontal 1 + e/1000 × 2 · vertical min .5, weak 1.6·vertical .8, strong 4·vertical .1) and rotates in that direction (.1s power1.out).
  // Inner circle size changes per link type — hidden 0 (.1s) · page number 34/12 (.2s, sticks to center) · work thumbnail 80/12 (.2s) · contact 160/12 (.3s, handshake Lottie) · next page 0 (.2s)
  const cursor = document.querySelector(".hs-cursor");
  const C = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2, fit: false, elastic: "", loading: false };
  // Skin variable (oklch, color-mix) to an rgb that GSAP can animate — paint one dot and read it
  const cssColor = (v) => {
    const s = document.createElement("i"); s.style.color = `var(${v})`; s.hidden = true; document.body.append(s);
    const g = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    g.fillStyle = getComputedStyle(s).color; s.remove(); g.fillRect(0, 0, 1, 1);
    const [r, gr, b] = g.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${gr}, ${b})`;
  };
  if (cursor && matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) {
    const shape = cursor.querySelector(".hs-cursor__shape"), inner = cursor.querySelector(".hs-cursor__inner");
    const digits = [...cursor.querySelectorAll(".hs-cursor__loading span")];
    const BLACK = cssColor("--kf-ink"), WHITE = cssColor("--site-white"), GRAY = cssColor("--site-cursor-gray");
    gsap.set(cursor, { x: C.x, y: C.y });
    const qx = gsap.quickTo(cursor, "x", { duration: 0.8, ease: "expo.out" }), qy = gsap.quickTo(cursor, "y", { duration: 0.8, ease: "expo.out" });
    const qrx = gsap.quickTo(C, "rx", { duration: 0.8, ease: "expo.out" }), qry = gsap.quickTo(C, "ry", { duration: 0.8, ease: "expo.out" });
    const qRot = gsap.quickSetter(shape, "rotate", "deg");
    const qsx = gsap.quickTo(shape, "scaleX", { duration: 0.1, ease: "power1.out" }), qsy = gsap.quickTo(shape, "scaleY", { duration: 0.1, ease: "power1.out" });
    // The original also adds z .001 to shapes and draws with a 3D matrix (GPU layer) — stretch and skew go through the same matrix
    const qsz = gsap.quickTo(shape, "z", { duration: 0.1, ease: "power1.out" });
    const jump = (x, y) => { C.x = x; C.y = y; qx(x); qy(y); qrx(x); qry(y); };
    addEventListener("mousemove", (e) => {
      cursor.classList.add("is-ready");
      if (C.fit) return;
      C.x = e.clientX; C.y = e.clientY - (C.loading ? 15 : 0);
    });
    gsap.ticker.add(() => {
      qx(C.x); qy(C.y); qrx(C.x); qry(C.y);
      const n = C.rx - C.x, c = C.ry - C.y, e = Math.hypot(n, c);
      let a, s;
      if (C.elastic === "weak") { a = 1 + (e / 1000) * 1.6; s = Math.max(0.8, 1 - (a - 1)); }
      else if (C.elastic === "strong") { a = 1 + (e / 1000) * 4; s = Math.max(0.1, 1 - (a - 1)); }
      else if (C.elastic === "none") { a = 1; s = 1; }
      else { a = 1 + (e / 1000) * 2; s = Math.max(0.5, 1 - (a - 1)); }
      qRot((Math.atan2(c, n) * 180) / Math.PI); qsx(a); qsy(s); qsz(0.001);
    });
    const size = (scale, dur, ease, extra = {}) => { gsap.killTweensOf(inner); gsap.to(inner, { scale, duration: dur, ease, ...extra }); };
    const center = (el) => { const r = el.getBoundingClientRect(); jump(r.left + r.width / 2, r.top + r.height / 2); };
    // Attach to elements newly drawn per page — detaching is handled by the page scope
    HS.bindCursor = (root) => {
      const on = (sel, type, fn) => root.querySelectorAll(sel).forEach((el) => { el.addEventListener(type, fn); scope?.cleanups.push(() => el.removeEventListener(type, fn)); });
      on("[data-cursor-hide]", "mouseenter", () => size(0, 0.1, "power2.out"));
      on("[data-cursor-hide]", "mouseleave", () => size(1, 0.1, "power2.out"));
      on("[data-cursor-pagination]", "mouseenter", (e) => { C.fit = true; C.elastic = "strong"; center(e.currentTarget); gsap.set(inner, { backgroundColor: WHITE }); size(34 / 12, 0.2, "power2.out"); cursor.classList.add("is-blend"); });
      on("[data-cursor-pagination]", "mouseleave", () => { C.fit = false; C.elastic = ""; gsap.set(inner, { backgroundColor: BLACK }); size(1, 0.2, "power2.out"); cursor.classList.remove("is-blend"); });
      on("[data-cursor-detail]", "mouseenter", () => { C.elastic = "weak"; size(80 / 12, 0.2, "power2.out", { backgroundColor: WHITE }); cursor.classList.add("is-detail"); });
      on("[data-cursor-detail]", "mouseleave", () => { C.elastic = ""; size(1, 0.3, "power2.out", { backgroundColor: BLACK }); cursor.classList.remove("is-detail"); });
      on("[data-cursor-contact]", "mouseenter", (e) => { C.fit = true; C.elastic = "weak"; cursor.classList.add("is-contact"); center(e.currentTarget.querySelector("[data-cursor-fit-target]") || e.currentTarget); size(160 / 12, 0.3, "power2.out", { backgroundColor: GRAY }); lotties.shake?.play(); });
      on("[data-cursor-contact]", "mousemove", (e) => center(e.currentTarget.querySelector("[data-cursor-fit-target]") || e.currentTarget));
      on("[data-cursor-contact]", "mouseleave", () => { C.fit = false; C.elastic = ""; cursor.classList.remove("is-contact"); size(1, 0.2, "power1.out", { backgroundColor: BLACK }); lotties.shake?.stop(); });
      // Outbound links: hide the circle and show the new-window icon at .2s (original cursor-show-blank-icon)
      on("[data-cursor-blank]", "mouseenter", () => { gsap.set(shape, { opacity: 0 }); cursor.classList.add("is-blank"); });
      on("[data-cursor-blank]", "mouseleave", () => { gsap.set(shape, { opacity: 1 }); cursor.classList.remove("is-blank"); });
      on("[data-cursor-next]", "mouseenter", () => size(0, 0.2, "power2.out"));
      on("[data-cursor-next]", "mouseleave", () => size(1, 0.5, "power2.out"));
    };
    HS.bindCursor(document.querySelector(".hs-head") || document.createElement("i"));
    // During page transitions the cursor becomes a loading-number circle (original showLoading·hideLoading)
    const count = { v: 0 };
    const qCount = gsap.quickTo(count, "v", { duration: 0.7, ease: "sine.inOut", onUpdate: () => ("00" + (count.v >> 0)).slice(-3).split("").forEach((d, k) => (digits[k].textContent = d)) });
    HS.cursorLoading = (show) => {
      if (show) {
        qCount(100); C.loading = true; C.elastic = "none"; jump(C.x, C.y - 15);
        gsap.killTweensOf(inner);
        gsap.to(inner, { scale: 56 / 12, duration: 0.5, ease: "back.out(2)" });
        gsap.to(inner, { backgroundColor: BLACK, duration: 0.3, ease: "power2.out" });
        cursor.classList.add("is-loading");
      } else {
        C.loading = false; C.elastic = ""; jump(C.x, C.y);
        size(1, 0.5, "back.inOut(1.3)");
        cursor.classList.add("is-loading-hide");
        setTimeout(() => cursor.classList.remove("is-loading", "is-loading-hide"), 350);
        setTimeout(() => qCount(0), 700);
      }
    };
  }

  const mountPage = (root) => {
  scope = { cleanups: [] };
  scope.ctx = gsap.context(() => {
  const page = pageOf();
  // Pill button → filter panel floating up from below
  root.querySelectorAll("[data-pill]").forEach((b) => {
    if (!b.querySelector(".hs-pill__bg")) b.insertAdjacentHTML("afterbegin", '<span class="hs-pill__bg" aria-hidden="true"><i></i><i></i><i></i></span>');
    const sheet = document.getElementById(b.dataset.pill);
    b.addEventListener("click", () => sheet.classList.toggle("is-open"));
    if (!sheet) return;
    sheet.insertAdjacentHTML("beforeend", '<div class="hs-sheet__foot"><button type="button" data-reset>Reset</button><span>' + b.textContent + '</span><button type="button" data-x aria-label="Close">×</button></div>');
    sheet.querySelectorAll("li button").forEach((x) => x.addEventListener("click", () => x.classList.toggle("is-on")));
    sheet.querySelector("[data-reset]").addEventListener("click", () => sheet.querySelectorAll(".is-on").forEach((x) => x.classList.remove("is-on")));
    sheet.querySelector("[data-x]").addEventListener("click", () => sheet.classList.remove("is-open"));
  });

  // Footer + next page
  const NEXT = { works: ["about.html", "Company"], about: ["news.html", "News"], news: ["works.html", "Works"], detail: ["works.html", "Works"] };
  const foot = root.querySelector('[data-slot="footer"]');
  if (foot) {
    const [nh, nt] = NEXT[page] || ["works.html", "Works"];
    foot.className = "hs-foot";
    foot.innerHTML = `
      <div class="hs-foot__in">
        <div class="hs-foot__photo wf-img" data-label="B&W profile portrait · hair · soft light · portrait 4:5"></div>
        <div>
          <p class="hs-foot__msg">The first line here inviting contact.<br>Your second line inviting people to reach out casually.</p>
          <a class="hs-foot__contact" href="#" data-cursor-contact>Contact Us<i data-cursor-fit-target></i></a>
          <div class="hs-foot__cols">
            <div><h5>Location</h5><address>Postal code 000-0000<br>Your address first line here<br>Your building name 0F here<br>(P) 00-0000-0000</address></div>
            <div><h5>Social</h5><ul><li><a href="#" data-cursor-blank>SNS 1</a></li><li><a href="#" data-cursor-blank>SNS 2</a></li></ul></div>
          </div>
          <div class="hs-foot__small"><div><a href="#">Information Security Policy</a><a href="#">Privacy policy</a></div><p>© Your company name here</p></div>
        </div>
      </div>
      <div class="hs-next" data-slot="next-page" data-cursor-next><a href="${nh}"><span>Next</span><span>${nt}</span></a></div>`;
  }

  // Reveal: once, when it reaches 10% from the bottom of the screen
  const io = HS.observe(new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -10% 0px" }));
  root.querySelectorAll("[data-in]").forEach((el) => io.observe(el));
  HS.bindCursor?.(root);
  pages[page]?.(root);
  });
  };
  const unmountPage = () => { if (!scope) return; scope.cleanups.forEach((f) => f()); scope.ctx.revert(); scope = null; };

  // Smooth scroll (Lenis lerp .1)
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, autoRaf: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    HS.lenis = lenis;
  }

  // Page turn (original TransitionView): on exit three curved veils fill up from below one after another (.15s apart) in .85s power3.inOut,
  // On entry, after .1s (0 on phone) the top curtain lifts upward over .65s. The curtain color is picked in rotation from seven. swup goes out and comes in for the opacity 1s of .transition-main
  const trans = document.querySelector(".hs-trans");
  const paths = trans ? [...trans.querySelectorAll("path")] : [];
  const sp = () => innerWidth <= 767;
  const UNDER = () => (sp() ? "M 0 100 V 120 Q 50 82 100 120 V 100 z" : "M 0 100 V 150 Q 50 50 100 150 V 100 z");
  const FULL = "M 0 100 V 0 Q 50 -1 100 0 V 100 z";
  const OVER = () => (sp() ? "M 0 0 V 120 Q 50 82 100 120 V 0 z" : "M 0 0 V 150 Q 50 50 100 150 V 0 z");
  const GONE = "M 0 0 V 0 Q 50 0 100 0 V 0 z";
  let colors = [];
  const nextColor = () => { if (!colors.length) colors = [1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5); return colors.shift(); };
  // The original runs the timeline time, which moves d linearly, through power3.inOut, so it has the same type
  const morph = (p, from, to, dur, delay) => { gsap.set(p, { attr: { d: from } }); return gsap.to(p, { attr: { d: to }, duration: dur, delay, ease: "power3.inOut" }); };
  const cover = () => {
    trans.dataset.colorType = nextColor();
    trans.classList.add("is-changing", "is-animating");
    trans.classList.remove("is-rendering");
    paths.forEach((p, i) => morph(p, UNDER(), FULL, 0.85, 0.15 * i));
  };
  const uncover = () => {
    trans.classList.remove("is-animating");
    trans.classList.add("is-rendering");
    morph(paths[2], OVER(), GONE, 0.65, 0);
  };
  const resetCover = () => { paths.forEach((p) => gsap.set(p, { attr: { d: UNDER() } })); trans.classList.remove("is-changing", "is-rendering", "is-animating"); };
  paths.forEach((p) => gsap.set(p, { attr: { d: UNDER() } }));

  let swup = null;
  const bootSwup = () => {
    if (!/^https?:$/.test(location.protocol) || !window.Swup || !swupRoot()) return;
    const plugins = window.SwupPreloadPlugin ? [new SwupPreloadPlugin({ preloadVisibleLinks: {}, preloadHoveredLinks: true })] : [];
    swup = new Swup({ containers: ["#swup"], linkToSelf: "navigate", animateHistoryBrowsing: true, plugins });
    swup.hooks.on("visit:start", () => setTimeout(() => HS.cursorLoading?.(true), 100));
    swup.hooks.on("animation:out:start", () => { if (!reduced) cover(); HS.lenis?.stop(); });
    swup.hooks.before("content:replace", () => unmountPage());
    swup.hooks.on("content:replace", () => { HS.lenis?.scrollTo(0, { immediate: true, force: true }); mountPage(swupRoot()); HS.markNav?.(pageOf()); });
    swup.hooks.on("animation:in:start", () => { if (!reduced) setTimeout(uncover, sp() ? 0 : 100); setTimeout(() => HS.cursorLoading?.(false), 300); });
    swup.hooks.on("visit:end", () => { HS.lenis?.start(); ScrollTrigger.refresh(); setTimeout(resetCover, 600); });
  };

  // Opened as a file, swup can’t run — switch after the curtain fills up (1s) and lift only the top curtain on the new page
  document.addEventListener("click", (e) => {
    if (swup) return;
    const a = e.target.closest("a[href]");
    if (!a || reduced || e.metaKey || e.ctrlKey || a.target === "_blank" || a.hasAttribute("data-no-swup") || !swupRoot()) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html$/.test(href)) return;
    e.preventDefault();
    cover();
    setTimeout(() => { sessionStorage.setItem("hs-enter", "1"); location.href = href; }, 1000);
  });
  if (sessionStorage.getItem("hs-enter") === "1" && trans && !reduced) {
    sessionStorage.removeItem("hs-enter");
    trans.classList.add("is-changing");
    paths.forEach((p) => gsap.set(p, { attr: { d: FULL } }));
    setTimeout(uncover, 100);
    setTimeout(resetCover, 1300);
  }
  addEventListener("pageshow", (e) => { if (e.persisted) resetCover(); });

  mountPage(swupRoot() || document.body);
  bootSwup();
})();
