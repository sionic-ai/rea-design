// Side panels (photos, contents), phone header, menu panel and News strip shared by all sections, in-paper Lenis scroll, first entrance timeline, and paper turn.
// Original is a Nuxt single-page app, so the side panels stay and only the center paper is swapped — during the .8s the leaving paper is handed off
// The new paper rises together beneath it. Here too, it fetches the next page document and pulls out only that paper (.tz-main) to swap it the same way
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const logoSVG = (cls = "") => `<svg class="tz-logo ${cls}" viewBox="0 0 570 129" aria-hidden="true">
    <text class="tz-logo-en" x="285" y="26" font-size="25" text-anchor="middle" textLength="250" lengthAdjust="spacingAndGlyphs">EVENT NAME</text>
    <text class="tz-logo-ja" x="285" y="112" font-size="74" text-anchor="middle" textLength="540" lengthAdjust="spacingAndGlyphs">Your event name here</text></svg>`;
  const SUB = "Introduce the event in one line<br>Keep the second line short";
  const TOC = [["About the event", "about.html", "about"], ["Read the short story collection", "#", ""], ["Participating shops", "list.html", "list"], ["Illness Stories", "#", ""], ["Association · Activities", "#", ""], ["News", "news.html", "news"]];
  const toc = () => `<ul class="toc_list"><li class="toc_heading">Contents</li>${TOC.map(([t, h, p], i) =>
    `<li class="toc_item"><a href="${h}" class="toc_link" data-toc="${p}"><span class="toc_mark" aria-hidden="true">▼</span><span class="toc_label">${t}</span><span class="toc_leader"></span><span class="toc_number">${i + 1}</span></a></li>`).join("")}</ul>`;
  const badge = `<div class="distribution_badge" aria-hidden="true"><span class="distribution_badge_until">Until 00/00</span><span class="distribution_badge_number">Collection 5</span><span class="distribution_badge_now">Now rolling out!</span></div>`;
  const NEWS = "Your latest news line scrolls slowly here!";
  const track = `<span class="tz-marquee-track">${`<span>${NEWS}</span>`.repeat(4)}</span>`;

  const intro = body.dataset.page === "home" ? " is_intro" : "";
  body.insertAdjacentHTML("afterbegin", `
  <a href="article.html" class="news_bar" data-slot="news-bar"><span class="news_bar_label">NEWS</span><span class="tz-marquee">${track}</span></a>
  <div class="tz-header" data-slot="mobile-menu">
    <header class="page_header"><a href="index.html" class="page_header_logo">${logoSVG()}</a><button type="button" class="page_header_menu is-open" aria-label="Close Menu" data-menu-toggle><i></i><i></i><i></i></button><span class="page_header_line"></span></header>
    <div class="menu">
      <div class="logo_box">${logoSVG()}<p class="logo_sub">${SUB}</p></div>
      <nav class="toc">${toc()}</nav>
      <a class="share sp-only" href="#">Share on social to show your support</a>
      <span class="wf-logo logo_corp sp-only">ORGANIZER</span>
    </div>
  </div>
  <div class="pc_visual${intro}" data-slot="side-photo">
    <span class="wf-img pc_visual_photo"></span>
    <div class="pc_visual_title">${logoSVG("pc_visual_logo")}<p>${SUB}</p></div>
  </div>
  <aside class="pc_sidebar${intro}" data-slot="toc-panel">
    ${badge}
    <a href="index.html" class="pc_sidebar_logo">${logoSVG()}<p>${SUB}</p></a>
    <span class="pc_sidebar_line"></span>
    <nav class="toc pc_sidebar_menu">${toc()}</nav>
    <a href="article.html" class="pc_sidebar_news"><span class="pc_sidebar_news_label">Latest News</span><span class="tz-marquee">${track}</span></a>
  </aside>`);

  const menu = document.querySelector(".tz-header");
  const toggleMenu = () => {
    const open = menu.classList.toggle("is-open");
    document.querySelectorAll(".tz-main [data-menu-toggle]").forEach((t) => t.setAttribute("aria-expanded", String(open)));
  };
  menu.querySelector("[data-menu-toggle]").addEventListener("click", toggleMenu);

  // Each time the section changes, the side panels are matched to it — left photo label, current section ▼ in the contents
  const markPage = (pg, photo) => {
    body.dataset.page = pg;
    const cur = pg === "article" ? "news" : pg;
    document.querySelectorAll(".toc_link").forEach((a) => a.classList.toggle("is_current", !!a.dataset.toc && a.dataset.toc === cur));
    document.querySelector(".pc_visual_photo").dataset.label = photo || "Portrait · person reading a book while drinking a bottled beverage · natural window light · portrait";
  };

  // Big title — split per character, the reveal timeline turns them on .05s apart (spaces only take up room)
  const splitChars = (el) => {
    const text = el.textContent;
    el.textContent = "";
    el.setAttribute("aria-label", text);
    [...text].forEach((c) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.textContent = c === " " ? " " : c;
      s.style.opacity = reduce ? "1" : "0";
      el.append(s);
    });
    return [...el.children];
  };

  // First entrance — exactly the original timeline (seconds): four frame edges at 1·1.3·1.6·1.9 for .6s, logo 2.4 · subtitle 2.6 · image 2.8 · badge 2.8 · menu 3 with blur 10px→0 over 2s,
  // Menu text 3.2 + line×.5 + letter×.05 over .3s, side plates 2.8 over 1.2s, contents from 3.3 at .12s intervals. Subsections animate only the big title letters at .5 + letter×.05
  function runIntro(root, done) {
    const tl = gsap.timeline();
    const edges = [[".waku_top", "inset(0 100% 0 0)", 1], [".waku_right", "inset(0 0 100% 0)", 1.3], [".waku_bottom", "inset(0 0 0 100%)", 1.6], [".waku_left", "inset(100% 0 0 0)", 1.9]];
    edges.forEach(([sel, from]) => { const el = root.querySelector(sel); if (el) { el.style.clipPath = from; el.style.opacity = "1"; } });
    const big = root.querySelector(".title_big");
    if (big) splitChars(big).forEach((c, i) => tl.to(c, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.5 + i * 0.05));
    edges.forEach(([sel, , at]) => { const el = root.querySelector(sel); if (el) tl.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power2.out" }, at); });
    [[".logo_box", 2.4], [".logo_sub", 2.6], [".main_illust", 2.8], [".kv_badge", 2.8], [".menu_box", 3]].forEach(([sel, at]) => {
      const els = root.querySelectorAll(sel);
      if (els.length) tl.fromTo(els, { filter: "blur(10px)", opacity: 0 }, { filter: "blur(0px)", opacity: 1, duration: 2 }, at);
    });
    root.querySelectorAll(".menu_box a").forEach((a, row) => splitChars(a).forEach((c, i) => tl.to(c, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 3.2 + row * 0.5 + i * 0.05)));
    const sides = document.querySelectorAll(".pc_visual.is_intro, .pc_sidebar.is_intro");
    if (root.querySelector(".main_illust") && sides.length && matchMedia("(min-width: 1024px)").matches) {
      tl.fromTo(sides, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power1.out", onComplete: done }, 2.8);
      tl.fromTo(".pc_sidebar .toc_heading, .pc_sidebar .toc_item", { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" }, 3.3);
    } else done();
  }
  // First section arrived via transition, or reduced-motion setting — straight to the fully drawn state
  function settle(root) {
    root.querySelectorAll(".waku_top, .waku_right, .waku_bottom, .waku_left").forEach((el) => { el.style.opacity = "1"; el.style.clipPath = "inset(0% 0% 0% 0%)"; });
    root.querySelectorAll(".title_big, .logo_box, .logo_sub, .main_illust, .kv_badge, .menu_box").forEach((el) => { el.style.opacity = "1"; });
  }
  const showSides = () => document.querySelectorAll(".is_intro").forEach((el) => { el.classList.remove("is_intro"); el.style.opacity = ""; });

  // Bring one paper to life — fill the phone header, logo and badge, reveal, text that sharpens from blur, Lenis, section interaction (tz:page)
  let live = null;
  function initMain(main, first) {
    const head = main.querySelector("[data-slot=page-header]:empty");
    if (head) head.outerHTML = `<header class="page_header" data-slot="page-header">${badge}<a href="index.html" class="page_header_logo">${logoSVG()}</a><button type="button" class="page_header_menu" aria-label="Open Menu" aria-expanded="false" data-menu-toggle><i></i><i></i><i></i></button><span class="page_header_line"></span></header>`;
    main.querySelectorAll("[data-logo]").forEach((el) => (el.innerHTML = logoSVG("logo")));
    main.querySelectorAll("[data-badge]").forEach((el) => (el.innerHTML = badge));
    main.querySelectorAll("[data-menu-toggle]").forEach((b) => b.addEventListener("click", toggleMenu));
    const state = { ctx: null, lenis: null, tick: null };
    if (reduce) { settle(main); showSides(); main.querySelectorAll(".move").forEach((m) => (m.style.opacity = "1")); }
    else {
      state.ctx = gsap.context(() => {
        first || main.querySelector(".kv") === null ? runIntro(main, showSides) : (settle(main), showSides());
        main.querySelectorAll(".move").forEach((m) => {
          gsap.fromTo(m, { opacity: 0, y: 0, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, scrollTrigger: { trigger: m, scroller: main, toggleActions: "play none none none", start: "top 85%" } });
        });
      }, main);
    }
    // Smooth only inside the paper: Lenis 1.3.27, 1.1s exponential curve, same tempo as ScrollTrigger.
    if (!reduce && window.Lenis) {
      state.lenis = new Lenis({ wrapper: main, content: main.firstElementChild, duration: 1.1, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), smoothWheel: true, naiveDimensions: true });
      state.lenis.on("scroll", ScrollTrigger.update);
      state.tick = (t) => state.lenis.raf(t * 1000);
      gsap.ticker.add(state.tick);
      gsap.ticker.lagSmoothing(0);
      window.tzLenis = state.lenis;
    }
    document.dispatchEvent(new CustomEvent("tz:page", { detail: { main } }));
    return state;
  }
  const killMain = (state) => {
    if (!state) return;
    state.ctx && state.ctx.revert();
    if (state.lenis) { gsap.ticker.remove(state.tick); state.lenis.destroy(); }
  };

  // Paper turn — cuts the leaving paper from the left (progress p) while pushing it 6% to the right, and the back strip (s) turns along the cut line up to 2p (squashed to .4x if it overflows).
  // Cubic both-end curve 800ms. The shadow (o) goes from .25 to 0 over the revealed area, and the folded-line shadow covers at .12 then clears in the last 30%
  const ease = (e) => (e < 0.5 ? 4 * e ** 3 : 1 - (-2 * e + 2) ** 3 / 2);
  function turnPage(old, done) {
    const { left, top, width, height } = old.getBoundingClientRect();
    const mk = (cls) => { const d = document.createElement("div"); d.className = cls; Object.assign(d.style, { top: `${top}px`, height: `${height}px` }); body.append(d); return d; };
    const o = mk("tz-flip-shade"), s = mk("tz-flip-back");
    o.style.left = `${left}px`;
    old.style.zIndex = "2";
    old.style.pointerEvents = "none";
    const t0 = performance.now();
    const step = (now) => {
      const a = Math.min((now - t0) / 800, 1), f = ease(a), p = width * f, m = 2 * p, h = m > width ? width + (m - width) * 0.4 : m, g = width * 0.06 * f;
      old.style.translate = `${g}px 0`;
      old.style.clipPath = `inset(0 0 0 ${p}px)`;
      s.style.left = `${left + g + p}px`;
      s.style.width = `${h - p}px`;
      const fold = f < 0.7 ? 1 : (1 - f) / 0.3;
      s.style.opacity = String(fold);
      o.style.width = `${g + p}px`;
      o.style.setProperty("--fold", fold);
      o.style.setProperty("--edge", `${Math.min(p * 0.5, 90)}px`);
      o.style.setProperty("--shade", 1 - f);
      if (a < 1) requestAnimationFrame(step);
      else { o.remove(); s.remove(); done(); }
    };
    requestAnimationFrame(step);
  }

  let shownPath = location.pathname;
  // Fetch the next page document, take only the paper and lay it under the current paper, running the transition (.8s) and the new paper’s rise (.8s (.33,1,.68,1)) together
  let busy = false;
  async function go(href, push) {
    if (busy) return;
    busy = true;
    let doc;
    try { doc = new DOMParser().parseFromString(await (await fetch(href)).text(), "text/html"); }
    catch (e) { location.href = href; return; }
    const next = doc.querySelector(".tz-main");
    if (!next) { location.href = href; return; }
    const old = document.querySelector(".tz-main");
    const fresh = document.importNode(next, true);
    fresh.style.zIndex = "1";
    old.after(fresh);
    menu.classList.remove("is-open");
    document.title = doc.title;
    markPage(doc.body.dataset.page || "home", doc.body.dataset.photo);
    if (push) history.pushState({ tz: 1 }, "", href);
    shownPath = location.pathname;
    const prev = live;
    // Original triggers the entrance at page:finish, after the new paper is attached and mounting finishes — one beat (150ms) later than the transition start
    setTimeout(() => { live = initMain(fresh, false); }, reduce ? 0 : 150);
    const finish = () => { killMain(prev); old.remove(); fresh.style.zIndex = ""; busy = false; ScrollTrigger.refresh(); };
    if (reduce) return finish();
    // Original onEnter runs after the new page is mounted, so it starts rising one tempo (100ms) later than the transition
    fresh.animate([{ opacity: 0, scale: "1" }, { opacity: 1, scale: "1" }], { duration: 800, delay: 100, fill: "backwards", easing: "cubic-bezier(0.33, 1, 0.68, 1)" });
    turnPage(old, finish);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html$/.test(href)) return;
    e.preventDefault();
    if (location.pathname.endsWith("/" + href)) return;
    go(href, true);
  });
  // A popstate where only the hash changed (#anchor link) stays on the same page, so no transition
  addEventListener("popstate", () => {
    if (location.pathname === shownPath) return;
    go(location.pathname.split("/").pop() || "index.html", false);
  });

  const start = () => {
    gsap.registerPlugin(ScrollTrigger);
    markPage(body.dataset.page || "home", body.dataset.photo);
    live = initMain(document.querySelector(".tz-main"), true);
  };
  // The original shows the server-rendered first screen first and runs the entrance after hydration (page:finish) — subpages run it after DOMContentLoaded
  // Each section has the hydration time measured in the original (body data-start-delay, ms) and hooks in two frames later. Waiting for load gets dragged by font downloads (network) and wobbles.
  // The first section’s first reveal starts after 1s, so hook it up right away
  const begin = () => {
    if (body.dataset.page === "home") return start();
    setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(start)), +(body.dataset.startDelay || 0));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin, { once: true });
  else begin();
})();
