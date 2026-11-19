// Common to all pages: draws the header, full-screen menu, Footer, closing card and chat button, and hooks up Lenis (1.3.18 · lerp .1 · wheel .9), rise-in, number counting, FAQ and the transition curtain.
// Original values: float up 2rem .8s cubic-bezier(.215,.61,.355,1) · push up 100% .8s cubic-bezier(.16,1,.3,1) · intensity 2.5s · curtain covers .56s and lifts .42s
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const root = document.documentElement;
  root.classList.add("js");
  const AG = (window.AG = { reduced, page, lenis: null });
  // Open contract — the hero entrance runs after the first-page loader or transition cover clears
  let readyFn;
  AG.ready = new Promise((r) => (readyFn = r));
  AG.open = () => readyFn();
  const EASE_UP = "0.215,0.61,0.355,1", EASE_OUT = "0.16,1,0.3,1", EASE_IO = "0.76,0,0.24,1";
  AG.ease = (c) => kfFxEase(c);
  function kfFxEase(c) { const n = `ag-${c}`; return CustomEase.get(n) || CustomEase.create(n, c); }

  const arrow = '<svg class="ag-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  // Logo: a newly drawn chevron symbol instead of the original mark + lowercase placeholder text
  const logo = (cls = "") => `<a class="ag-logo ${cls}" href="index.html" aria-label="Home"><svg viewBox="0 0 62 24" aria-hidden="true"><path d="M2 12 11 4v5l-4 3 4 3v5z" fill="var(--kf-accent)"/><text x="17" y="18" font-size="17" font-weight="500" fill="currentColor" font-family="var(--kf-font-sans)">logo</text></svg></a>`;
  const mark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 13 4v5l-4 3 4 3v5z" fill="currentColor"/><path d="M13 12l7-5v10z" fill="var(--kf-accent)"/></svg>';
  AG.icons = { arrow, mark };
  AG.swap = (a, b) => `<span class="ag-swap"><span>${a}</span><span aria-hidden="true">${b}</span></span>`;
  document.querySelectorAll("[data-swap]").forEach((el) => { el.innerHTML = AG.swap(el.innerHTML, el.dataset.swap); });

  // ───── Header
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "ag-head";
    head.innerHTML = `<div class="ag-head__in">${logo()}<div class="ag-head__end"><a class="ag-btn ag-btn--sm" href="recruit.html">${AG.swap("Book a Meeting", "No pressure")}</a><button class="ag-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i><i></i></button></div></div>`;
  }
  // On-screen menu — the backdrop turns on at .4s and a white panel slides in from the right (.65s), the hamburger becomes ✕
  const links = [["news.html", "Blog"], ["about.html", "Startup founder"], ["about.html#network", "Partner company"], ["service.html", "Service"], ["article.html", "Case study"]];
  document.body.insertAdjacentHTML("beforeend", `
    <div class="ag-menu" data-slot="menu" aria-hidden="true">
      <div class="ag-menu__box">
        <header class="ag-menu__head">${logo()}<button class="ag-menu__close" type="button">Close <b aria-hidden="true">×</b></button></header>
        <div class="ag-menu__body"><nav class="ag-menu__primary" aria-label="Main menu">${links.map(([h, t]) => `<a class="ag-menu__link" href="${h}">${t}</a>`).join("")}</nav></div>
        <div class="ag-menu__cols">
          <div class="ag-menu__col"><span>Featured Work</span><a href="article.html">Work 1</a><a href="article.html">Work 2</a><a href="article.html">Work 3</a><a href="about.html">Endorsement</a></div>
          <div class="ag-menu__col"><span>Browse</span><a href="article.html">Inspection Tools</a><a href="news.html">AI technology</a><a href="news.html">Pattern</a><a href="index.html#faq">Frequently asked questions</a></div>
          <div class="ag-menu__col"><span>Company</span><a href="about.html">Company About</a><a href="recruit.html">Hiring</a><a href="service.html">Working together</a><a href="recruit.html#contact">Inquiry</a></div>
        </div>
        <div class="ag-menu__ribbon"><div class="ag-menu__latest"><span class="wf-img" data-label="Text"></span><div><small>Latest news</small>Your new post title here</div></div><a class="ag-chip" href="#"><i></i>Get the Inspection Tool</a><button class="ag-chip" type="button"><i></i>Chat with the helper</button><a class="ag-menu__cta" href="recruit.html">Book a meeting ${arrow}</a></div>
      </div>
    </div>
    <div class="ag-curtain" aria-hidden="true" data-slot="page-curtain"></div>
    <button class="ag-fab" type="button" aria-label="Chat with the helper" data-slot="chat-fab">${mark}</button>
    <aside class="ag-cookie" data-slot="cookie" hidden><p>Your one-line cookie notice here. We only look at visit statistics and never sell or pass on personal information.</p><div><button class="ag-btn ag-btn--sm ag-btn--line" type="button">Allow essential only</button><button class="ag-btn ag-btn--sm ag-btn--ink" type="button">Allow all</button></div></aside>`);
  // Helper panel — opens on button press, header button for dark panel·close. No real conversation (placeholder replies)
  const svg = (d) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${d}"/></svg>`;
  document.body.insertAdjacentHTML("beforeend", `
    <section class="ag-aw" data-slot="assistant" role="dialog" aria-label="Helper" aria-hidden="true">
      <header class="ag-aw__head"><div class="ag-aw__who"><span class="ag-aw__avatar">${mark}</span>Helper name</div>
        <div class="ag-aw__ctrl"><button class="ag-aw__btn" type="button" data-aw="dark" aria-label="Dark panel" data-tooltip="Dark panel">${svg("M12.5 9.5A5 5 0 0 1 6.5 3.5a5 5 0 1 0 6 6z")}</button><button class="ag-aw__btn" type="button" data-aw="full" aria-label="Large" data-tooltip="View Large">${svg("M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3")}</button><i></i><button class="ag-aw__btn" type="button" data-aw="close" aria-label="Close" data-tooltip="Close">${svg("M4 4l8 8M12 4l-8 8")}</button></div></header>
      <div class="ag-aw__msgs">
        <p class="ag-aw__text">Your assistant greeting goes here in two lines. Ask about services, schedules and quotes.</p>
        <div class="ag-aw__sugs">${["Your suggested question here", "Your second suggested question here", "Your third suggested question here"].map((t) => `<button class="ag-aw__sug" type="button">${t}${svg("M3 8h10M9 4l4 4-4 4")}</button>`).join("")}</div>
        <div class="ag-aw__prompts"><button class="ag-aw__prompt" type="button" data-aw="mail">Yes, send email</button><button class="ag-aw__prompt ag-aw__prompt--muted" type="button" data-aw="never">Don’t show again</button></div>
        <div class="ag-aw__actions"><button class="ag-aw__action" type="button" data-aw="close">Cancel</button></div>
      </div>
      <div class="ag-aw__foot"><label class="ag-aw__input"><textarea rows="1" placeholder="Ask us anything" aria-label="Question"></textarea><button class="ag-aw__send" type="button" aria-label="Send">${svg("M8 13V3M4 7l4-4 4 4")}</button></label></div>
    </section>`);
  const fab = document.querySelector(".ag-fab"), aw = document.querySelector(".ag-aw");
  // As in the original, focus goes to the input on open — preventScroll so the screen doesn’t shift while the sheet rises
  const openAw = (on) => { aw.classList.toggle("is-open", on); aw.setAttribute("aria-hidden", String(!on)); fab.classList.toggle("is-hidden", on); if (on) aw.querySelector("textarea").focus({ preventScroll: true }); };
  fab.addEventListener("click", () => openAw(true));
  aw.addEventListener("click", (e) => {
    const b = e.target.closest("[data-aw]");
    if (!b) return;
    const k = b.dataset.aw;
    if (k === "dark") aw.classList.toggle("is-dark");
    else if (k === "full") aw.classList.toggle("is-full");
    else if (k !== "mail") openAw(false);
  });
  // Original: if there is no scroll, wheel or touch for 10s, the helper opens by itself and shows a suggestion. Cancel lasts for this tab, ”Don’t show again” lasts two days
  const dismissed = () => sessionStorage.getItem("ag-aw") === "0" || Date.now() < (+localStorage.getItem("ag-aw-until") || 0);
  let idle = 0;
  const arm = () => { clearTimeout(idle); if (!dismissed()) idle = setTimeout(() => { if (!dismissed() && !aw.classList.contains("is-open")) openAw(true); }, 10000); };
  ["scroll", "wheel", "touchmove"].forEach((t) => addEventListener(t, arm, { passive: true }));
  AG.ready.then(arm);
  aw.addEventListener("click", (e) => {
    const k = e.target.closest("[data-aw]")?.dataset.aw;
    if (k === "close") sessionStorage.setItem("ag-aw", "0");
    if (k === "never") localStorage.setItem("ag-aw-until", String(Date.now() + 2 * 864e5));
  });
  const cookie = document.querySelector(".ag-cookie");
  if (!sessionStorage.getItem("ag-cookie")) cookie.hidden = false;
  cookie.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { sessionStorage.setItem("ag-cookie", "1"); cookie.hidden = true; }));
  const menu = document.querySelector(".ag-menu"), box = menu.querySelector(".ag-menu__box");
  let menuTl = null;
  const openMenu = (on) => {
    menu.classList.toggle("is-open", on);
    menu.setAttribute("aria-hidden", String(!on));
    head?.querySelector(".ag-burger")?.setAttribute("aria-expanded", String(on));
    on ? AG.lenis?.stop() : AG.lenis?.start();
    menuTl?.kill();
    if (reduced) return gsap.set(menu, { autoAlpha: on ? 1 : 0 });
    // Original: curtain 0→1 (.4s) · white panel slides in from the right 100% over .65s cubic-bezier(.16,1,.3,1) · hamburger two lines to ±45° (.35s)
    if (on) {
      menuTl = gsap.timeline();
      // The original is a class-applied transition so it starts on the very frame of the press — pulled forward by the first-tick lateness of the timetable
      menuTl.fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out", delay: 0.03 });
      menuTl.fromTo(box, { xPercent: 100 }, { xPercent: 0, duration: 0.65, ease: kfFxEase(EASE_OUT) }, 0.05);
    } else {
      menuTl = gsap.timeline();
      menuTl.to(box, { xPercent: 100, duration: 0.5, ease: kfFxEase(EASE_IO) });
      menuTl.to(menu, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, 0.2);
    }
  };
  head?.querySelector(".ag-burger")?.addEventListener("click", () => openMenu(true));
  menu.querySelector(".ag-menu__close").addEventListener("click", () => openMenu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) openMenu(false); });

  // ───── Closing Card
  document.querySelectorAll('[data-slot="cta"]').forEach((el) => {
    const [a, b] = (el.dataset.title || "Your short question here|Your quick answer here").split("|");
    el.className = "ag-cta";
    el.innerHTML = `<div class="ag-cta__card" data-anim="fade-up"><div><h2 class="ag-cta__title"><span>${a}</span><span class="ag-grad">${b}</span></h2>${el.dataset.sub ? `<p class="ag-cta__sub">${el.dataset.sub}</p>` : ""}<div class="ag-cta__btns"><a class="ag-btn ag-btn--sm" href="article.html">${AG.swap("View work", "View case")}</a><a class="ag-btn ag-btn--sm ag-btn--fill" href="recruit.html#contact">${AG.swap("Tell us your story", "Talk to an Engineer")}</a></div></div></div>`;
  });

  // ───── Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    const col = (t, items) => `<div class="ag-foot__col"><p>${t}</p><ul>${items.map(([h, x]) => `<li><a href="${h}">${x}</a></li>`).join("")}</ul></div>`;
    foot.className = "ag-foot";
    foot.innerHTML = `<div class="ag-wrap"><div class="ag-foot__grid">
      <div class="ag-foot__left">${logo()}<p class="ag-foot__tag">Your one-line company intro here</p><p class="ag-foot__contact">City name · <a href="#">hello@example.com</a></p><div class="ag-foot__ask"><span>Ask AI</span><div><a href="#" aria-label="Helper 1">A</a><a href="#" aria-label="Helper 2">B</a><a href="#" aria-label="Helper 3">C</a><a href="#" aria-label="Helper 4">D</a></div></div></div>
      <div class="ag-foot__cols">
        ${col("Browse", [["news.html", "Blog"], ["about.html", "Startup founder"], ["about.html", "Partner company"], ["service.html", "Service"], ["article.html", "Case study"]])}
        ${col("Explore", [["article.html", "Inspection"], ["news.html", "AI technology"], ["news.html", "Pattern"], ["index.html#faq", "Question"]])}
        ${col("Company", [["about.html", "Company About"], ["recruit.html", "Hiring"], ["service.html", "Working together"], ["recruit.html#contact", "Inquiry"]])}
        ${col("Service", [["service.html", "Service 1"], ["service.html", "Service 2"], ["service.html", "Service 3"], ["service.html", "Service 4"], ["service.html", "Service 5"]])}
        ${col("Social", [["#", "Link 1"], ["#", "Link 2"], ["#", "Link 3"], ["#", "Link 4"]])}
      </div></div>
      <div class="ag-foot__bottom"><a href="#">Personal information</a><a href="#">Terms of service</a><small>© 0000 Company Name</small></div></div>`;
  }

  // ───── Lenis (original 1.3.18 · lerp .1 · wheel .9)
  if (!reduced && window.Lenis) {
    const lenis = (AG.lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, smoothWheel: true }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }


  // ───── Transition curtain
  const curtain = document.querySelector(".ag-curtain");
  // The transition mark only accepts documents opened within 5 seconds of the press — so a document refreshed later isn’t covered by the curtain
  const came = Date.now() - (+sessionStorage.getItem("ag-nav") || 0) < 5000;
  sessionStorage.removeItem("ag-nav");
  AG.came = came;
  if (came && !reduced) {
    gsap.set(curtain, { scaleY: 1, transformOrigin: "50% 100%" });
    // The original walks the route after receiving the new route code — the copy waits for the document and font load
    const loaded = new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r, { once: true })));
    Promise.all([loaded, document.fonts?.ready]).then(() => gsap.to(curtain, { scaleY: 0, duration: 0.42, ease: kfFxEase(EASE_IO), delay: 0.05, onStart: AG.open }));
  } else if (!root.classList.contains("ls-active")) requestAnimationFrame(AG.open);
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = e.target.closest?.("a[href]");
    if (!a || (a.target && a.target !== "_self")) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const to = new URL(href, location.href);
    if (to.pathname === location.pathname) return;
    e.preventDefault();
    if (reduced) return void (location.href = to.href);
    sessionStorage.setItem("ag-nav", String(Date.now()));
    gsap.fromTo(curtain, { scaleY: 0, transformOrigin: "50% 0%" }, { scaleY: 1, duration: 0.56, ease: kfFxEase(EASE_IO), onComplete: () => (location.href = to.href) });
  }, true);
  addEventListener("pageshow", (e) => { if (e.persisted) gsap.set(curtain, { scaleY: 0 }); });

  // ───── Entrance — data-anim: fade-up(2rem) · slide-up(100%, inside the wrapping cell) · divider(line from the left) · count(number counting)
  const inView = (el) => { const b = el.getBoundingClientRect(); return b.top < innerHeight * 0.95 && b.bottom > 0; };
  const when = (el, fn) => {
    if (inView(el)) AG.ready.then(fn);
    else ScrollTrigger.create({ trigger: el, start: "top 95%", once: true, onEnter: fn });
  };
  const order = (el) => +(el.dataset.order ?? 0) * +(el.closest("[data-stagger]")?.dataset.stagger ?? 0) / 1000;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll('[data-anim="fade-up"]').forEach((el) => when(el, () => gsap.fromTo(el, { opacity: 0, y: "2rem" }, { opacity: 1, y: 0, duration: 0.8, ease: kfFxEase(EASE_UP), delay: order(el) })));
    document.querySelectorAll('[data-anim="slide-up"]').forEach((el) => {
      gsap.set(el, { yPercent: 100, opacity: 0 });
      when(el, () => gsap.to(el, { yPercent: 0, opacity: 1, duration: 0.8, ease: kfFxEase(EASE_OUT), delay: order(el) }));
    });
    document.querySelectorAll('[data-anim="divider"]').forEach((el) => {
      gsap.set(el, { opacity: 1, scaleX: 0 });
      when(el, () => gsap.to(el, { scaleX: 1, duration: 1.2, ease: kfFxEase(EASE_OUT), delay: order(el) }));
    });
    document.querySelectorAll('[data-anim="count"]').forEach((el) => {
      const end = parseFloat(el.dataset.end), dec = String(el.dataset.end).includes(".");
      gsap.set(el, { opacity: 1 });
      el.textContent = "0";
      when(el, () => {
        const t0 = performance.now(), dur = 2500;
        const step = (now) => {
          const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3), v = end * e;
          el.textContent = dec ? v.toFixed(1) : Math.round(v).toLocaleString();
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    });
  });

  // ───── Loader — original values: progress = Video start time/length (if the video does not play within 2.5s, a 10s clock), in the last 3s video .35→.11 and background brightens, exit .4s / 1.2s (.2 delay)
  const LOG = [["read", "brief.md", "12 notes"], ["map", "src/parts", "38 parts"], ["fetch", "packages", "214 pkgs"], ["make", "services/api", "6 services"], ["draw", "db/schema", "24 tables"], ["write", "tests/unit", "312 cases"], ["write", "tests/flow", "48 flows"], ["run", "all tests", "360 passed"], ["check", "src/**", "0 issues"], ["pack", "assets", "1.2 MB"], ["tune", "queries", "-38% p95"], ["set up", "infra/region", "3 regions"], ["lock", "endpoints", "TLS on"], ["ship", "release", "live"]];
  // On a first visit the loader shows whichever page you enter — original sessionStorage loadingScreenSeen
  if (root.classList.contains("ls-active") && !document.querySelector(".ag-loader")) document.body.insertAdjacentHTML("afterbegin", `
    <div class="ag-loader" aria-hidden="true" data-slot="loader">
      <video class="ag-loader__video" src="media/intro.mp4" muted playsinline preload="auto"></video>
      <div class="ag-loader__top"><button class="ag-loader__skip" type="button">Skip intro <kbd>Esc</kbd></button></div>
      <div class="ag-loader__bottom"><div class="ag-loader__status"><ol class="ag-loader__log"></ol><span class="ag-loader__word">scaling<span class="ag-loader__dots"><span></span><span></span><span></span></span></span></div><div class="ag-loader__pct"><span>0</span><small>%</small></div><div class="ag-loader__segs"></div></div>
    </div>`);
  const loader = document.querySelector(".ag-loader");
  if (root.classList.contains("ls-active") && loader) {
    const video = loader.querySelector("video"), log = loader.querySelector(".ag-loader__log"), pct = loader.querySelector(".ag-loader__pct span");
    const segs = loader.querySelector(".ag-loader__segs");
    segs.innerHTML = LOG.map(() => "<i></i>").join("");
    AG.lenis?.stop();
    const t0 = performance.now();
    let useClock = !video, shown = -1, last = 0, done = false, raf = 0;
    const draw = (p) => {
      pct.textContent = p;
      const idx = Math.min(LOG.length - 1, Math.floor((p / 100) * LOG.length));
      if (idx !== shown || p === 100) {
        shown = idx;
        log.innerHTML = LOG.slice(0, idx + 1).map(([v, t, r], i) => {
          const run = i === idx && p < 100;
          return `<li${run ? ' class="is-running"' : ""}><span>${run ? "→" : "✓"}</span><b>${v}</b><span>${t}</span><em>${run ? "running" : r}</em></li>`;
        }).join("");
      }
      segs.querySelectorAll("i").forEach((s, i) => s.classList.toggle("is-filled", i < Math.floor((p / 100) * LOG.length)));
    };
    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      draw(100);
      sessionStorage.setItem("ag-seen", "1");
      const end = () => { root.classList.remove("ls-active"); loader.remove(); AG.lenis?.start(); AG.open(); };
      if (reduced) return end();
      gsap.timeline({ onComplete: end })
        .to(loader.querySelectorAll(".ag-loader__top, .ag-loader__bottom"), { opacity: 0, duration: 0.4, ease: "power2.out" })
        .to(loader, { opacity: 0, duration: 1.2, ease: "power2.inOut" }, 0.2);
      setTimeout(AG.open, 600);
    };
    const step = () => {
      const t = performance.now() - t0;
      if (!useClock && video.currentTime === 0 && t > 2500) useClock = true;
      let k;
      if (useClock) k = t / 10000;
      else if (video.duration > 0) {
        k = video.currentTime / video.duration;
        const a = Math.min(1, Math.max(0, 1 - (video.duration - video.currentTime) / 3)), s = a * a * (3 - 2 * a);
        video.style.opacity = 0.35 + (0.11 - 0.35) * s;
        loader.style.backgroundColor = `color-mix(in srgb, var(--kf-contrast-bg) ${(100 - 12 * s).toFixed(1)}%, var(--kf-contrast-ink))`;
      } else k = 0;
      const p = Math.max(last, Math.min(100, Math.floor(k * 100)));
      if (p !== last || shown < 0) { last = p; draw(p); }
      if (k >= 1) return finish();
      raf = requestAnimationFrame(step);
    };
    if (video) {
      video.addEventListener("ended", finish);
      video.addEventListener("error", () => (useClock = true));
      video.currentTime = 0;
      video.play().catch(() => (useClock = true));
    }
    raf = requestAnimationFrame(step);
    loader.querySelector(".ag-loader__skip").addEventListener("click", finish);
    addEventListener("keydown", (e) => e.key === "Escape" && finish());
  } else loader?.remove();

  // ───── Header reveal — logo·button group rises from 2rem below at .3s intervals (original data-animate-default-stagger 300)
  if (head && !reduced) {
    const parts = head.querySelectorAll(".ag-logo, .ag-head__end");
    gsap.set(parts, { opacity: 0 });
    AG.ready.then(() => gsap.fromTo(parts, { opacity: 0, y: "2rem" }, { opacity: 1, y: 0, duration: 0.8, ease: kfFxEase(EASE_UP), stagger: 0.3 }));
  }

  // ───── FAQ — only one opens at a time (.55s)
  document.querySelectorAll(".ag-faq").forEach((list) => list.addEventListener("click", (e) => {
    const q = e.target.closest(".ag-faq__q");
    if (!q) return;
    const item = q.parentElement, open = !item.classList.contains("is-open");
    list.querySelectorAll(".ag-faq__item.is-open").forEach((x) => { x.classList.remove("is-open"); x.querySelector(".ag-faq__q").setAttribute("aria-expanded", "false"); });
    item.classList.toggle("is-open", open);
    q.setAttribute("aria-expanded", String(open));
    setTimeout(() => ScrollTrigger.refresh(), 600);
  }));

  addEventListener("load", () => ScrollTrigger.refresh());
})();
