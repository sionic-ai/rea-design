// Common to all pages: draws in the header, footer and color curtain, and hooks up ScrollSmoother, Barba transitions, header hide and show, text rolling and footer half speed.
// Original values: ScrollSmoother smooth 1.5 · speed 1 · effects · normalizeScroll (off on touch devices) · Footer data-speed clamp(0.5) ·
// Header turns off in .3s when scrolled down past half height (finger 40px) and turns on immediately on scroll up · transition is curtain .25s → swap → page attached two frames later → intro after 100ms.
// Page scripts use MR.page(name, (box) => detach) — it is registered this way, even if passed on right away it attaches again, and on leaving it calls detach.
(() => {
  document.documentElement.classList.add("mr-js");
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Original isTouch: if document.ontouchstart exists it is a finger device — turns off ScrollSmoother and rolling hover, and drives the header from the scroll line.
  const touch = "ontouchstart" in document;
  if (touch) document.body.classList.add("touch");
  const parts = [];
  const MR = (window.MR = { reduced, touch, smoother: null, page: (ns, fn) => parts.push({ ns, fn }) });
  const colorOf = { index: "white", works: "white", about: "beige", contact: "blue" };

  const roll = (txt) => `<span class="mr-roll__t"><span>${txt}</span></span>`;
  const mark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M12 6v12M7 18h12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
  const nav = [["index", "index.html", "Top"], ["works", "works.html", "Works", "<sup>(00)</sup>"], ["about", "about.html", "About"], ["contact", "contact.html", "Contact"]];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("mr-head");
    head.innerHTML = `
      <div class="mr-head__in">
        <a class="mr-logo" href="index.html" aria-label="Home"><span class="mr-logo__mark">${mark}<i class="mr-logo__ring" aria-hidden="true"></i></span><span class="mr-logo__word">WORDMARK</span></a>
        <button class="mr-nav__open" type="button" aria-label="Open Menu"><i><b></b><b></b><b></b></i></button>
        <nav class="mr-nav" aria-label="Main menu">
          <button class="mr-nav__close" type="button">Close</button>
          ${nav.map(([k, href, t, sup = ""]) => `<a href="${href}" class="mr-roll" data-ns="${k}" data-roll>${roll(t + sup)}</a>`).join("")}
        </nav>
      </div>`;
    head.querySelector(".mr-nav__open").addEventListener("click", () => head.classList.add("is-menu"));
    head.querySelector(".mr-nav__close").addEventListener("click", () => head.classList.remove("is-menu"));
  }
  const closeMenu = () => head && head.classList.remove("is-menu");
  const markNav = (ns) => head && head.querySelectorAll(".mr-nav a").forEach((a) => a.classList.toggle("is-current", a.dataset.ns === ns));

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("mr-foot");
    // Original: on desktop, ScrollSmoother effects move the footer at half speed (clamp)
    foot.dataset.speed = "clamp(0.5)";
    foot.dataset.lag = "0";
    foot.innerHTML = `
      <div class="mr-foot__in">
        <div class="mr-foot__bg wf-img" data-label="Office interior · one warm desk lamp · dim evening light · wide landscape (one of five picked at random)"></div>
        <a class="mr-foot__git" href="contact.html" data-label="Three English words that invite contact">Drop a Line<span class="mr-play is-mail is-white"></span></a>
        <div class="mr-foot__info">
          <p class="mr-foot__name">Your company name here</p>
          <div class="mr-foot__addr">
            <div><p>〒000-0000<br>Street address 0-00-0 here<br>Your building name, Room 000 here</p><a class="mr-foot__map mr-roll" href="#" target="_blank" data-roll>${roll("Map")}</a></div>
            <p>Tel: 00-0000-0000</p>
          </div>
        </div>
        <a class="mr-foot__top" href="#top" aria-label="Back to top"></a>
        <small data-label="Your company English name here">© Company Name</small>
      </div>`;
  }

  const mask = document.createElement("div");
  mask.className = "mr-mask";
  document.body.append(mask);

  // ── Text roll: on hover, attach a second copy of the same text below (100% + 2px), two frames later roll it one step over .75s, then remove the copy when done (original hoverRoll). ──
  //    leaving and coming back starts from the beginning. The current page link isn’t rolled (off on touch devices) ──
  const setRoll = (el) => {
    if (el.dataset.rollOn) return;
    el.dataset.rollOn = "1";
    if (!el.querySelector(".mr-roll__t")) { el.innerHTML = roll(el.innerHTML); el.classList.add("mr-roll"); }
    if (touch || reduced) return;
    const box = el.querySelector(".mr-roll__t");
    const first = box.firstElementChild;
    const twin = first.cloneNode(true);
    twin.setAttribute("aria-hidden", "true");
    let busy = false;
    el.addEventListener("mouseenter", () => {
      if (busy || el.classList.contains("is-current")) return;
      busy = true;
      el.classList.remove("is-rolling");
      box.append(twin);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-rolling")));
    });
    el.addEventListener("mouseleave", () => (busy = false));
    el.addEventListener("click", () => { el.classList.remove("is-rolling"); busy = false; });
    first.addEventListener("animationend", () => { twin.remove(); el.classList.remove("is-rolling"); });
  };
  const rolls = (root) => root.querySelectorAll("[data-roll]").forEach(setRoll);
  if (head) rolls(head);
  if (foot) rolls(foot);

  // ── Smooth scroll ──
  let dir = 0;
  const makeSmoother = () => {
    if (touch || reduced) return;
    MR.smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.5, speed: 1, effects: true, normalizeScroll: true,
      onUpdate: (s) => { const v = s.getVelocity(); dir = v < 0 ? -1 : v > 0 ? 1 : 0; },
    });
  };
  const scrollY0 = () => (MR.smoother ? MR.smoother.scrollTop() : scrollY);
  MR.scrollTo = (y, smooth = true) => {
    if (MR.smoother) return MR.smoother.scrollTo(y, smooth);
    gsap.to(window, { duration: smooth ? 1 : 0, ease: "expo.out", scrollTo: { y, autoKill: false } });
  };

  // ── Header: scrolling down past half height it turns off (pinned), scrolling up turns it on right away (show). Doesn’t turn on when scrolling up in the footer zone ──
  let pinned = false, shown = false, footZone = false, lastY = scrollY;
  const headH = () => (head ? head.firstElementChild.offsetHeight : 0);
  const paintHead = () => { head.classList.toggle("is-pinned", pinned); head.classList.toggle("is-show", shown); };
  const stepHead = (d, y) => {
    if (!head || !d) return;
    const past = touch ? y > 40 : y >= headH() / 2;
    if (d > 0) { if (pinned && shown) shown = false; if (past && !pinned) pinned = true; }
    else { if (pinned && !shown && !footZone) shown = true; if (!past && pinned) pinned = shown = false; }
    paintHead();
  };
  const resetHead = () => { pinned = shown = footZone = false; if (head) paintHead(); };
  if (touch) addEventListener("scroll", () => { const y = scrollY; stepHead(Math.sign(y - lastY), y); lastY = y; }, { passive: true });

  // ── What persists across the transition: header line · footer at half speed (touch devices) ──
  makeSmoother();
  if (!touch && head) ScrollTrigger.create({ start: 0, end: "max", onUpdate: () => stepHead(dir, scrollY0()) });
  if (touch && foot && !reduced) {
    const fin = foot.querySelector(".mr-foot__in");
    const lvh = () => { const d = document.createElement("div"); d.style.cssText = "position:fixed;height:100lvh"; document.body.append(d); const h = d.offsetHeight; d.remove(); return h; };
    gsap.fromTo(fin, { y: () => lvh() / -2 }, { y: () => `+=${lvh() / 2}`, ease: "none", scrollTrigger: { trigger: foot, start: "top bottom+=90", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
  }

  // ── Page attach · detach ──
  let ctx = null, cleanups = [];
  const box = () => document.querySelector('[data-barba="container"]');
  const mount = (el) => {
    const ns = el.dataset.barbaNamespace;
    document.body.dataset.page = ns;
    markNav(ns);
    rolls(el);
    ctx = gsap.context(() => {
      cleanups = parts.filter((p) => p.ns === ns).map((p) => p.fn(el)).filter((f) => typeof f === "function");
      if (head) {
        // Original: when the end of the body reaches the header height above, it is the footer range (About goes further down by the screen height minus the header)
        const end = ns === "about" ? () => `bottom+=${innerHeight - headH()} top` : () => `bottom-=${headH()} top`;
        ScrollTrigger.create({ trigger: el, start: "top top", end, onLeave: () => (footZone = true), onEnterBack: () => (footZone = false) });
      }
    }, el);
    ScrollTrigger.refresh();
  };
  const unmount = () => {
    cleanups.splice(0).forEach((f) => f());
    if (ctx) { ctx.revert(); ctx = null; }
  };
  const ready = () => setTimeout(() => { document.body.classList.add("is-ready"); document.body.classList.remove("is-transitioning"); }, reduced ? 0 : 100);

  // Same-page # moves like 「Back to top」 slide instead of navigating (original a[href^='#'] → smoother.scrollTo)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    const h = a.getAttribute("href");
    MR.scrollTo(h === "#" || h === "#top" ? 0 : h, true);
  }, true);

  // Makes Barba bring the next page’s page css — the original has a single css set so this is not needed. The previous page’s css is removed after the curtain fully covers the screen (enter).
  let dropSheets = () => {};
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    dropSheets = () => have.forEach((l) => want.includes(l.href) || l.remove());
    return Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((h) => new Promise((res) => {
      const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
      l.onload = l.onerror = res;
      document.head.append(l);
    })));
  };
  const own = (href) => /^[\w-]+\.html(#.*)?$/.test(href || "");
  const here = () => location.pathname.split("/").pop() || "index.html";
  const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));

  const start = () => {
    mount(box());
    ready();
    addEventListener("load", () => ScrollTrigger.refresh());
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        debug: false,
        timeout: 9999999,
        prevent: ({ el }) => {
          const href = el && el.getAttribute("href");
          if (!own(href)) return true;
          if (href.split("#")[0] === here()) return true;
          return false;
        },
        transitions: [{
          before: () => closeMenu(),
          // Original beforeEnter: paint the next page’s color on the curtain and wait .25s — the curtain covers meanwhile
          beforeEnter: async ({ next }) => {
            document.body.classList.add("is-transitioning");
            document.body.dataset.color = next.container.dataset.color || "white";
            await Promise.all([wait(250), sheets(next.html)]);
          },
          // Original enter: with the cover down, remove the previous page and set the body state to the new one — titles and blocks hide again
          enter: async ({ next }) => {
            unmount();
            dropSheets();
            document.body.classList.remove("is-ready");
            document.body.dataset.page = next.namespace;
            const t = new DOMParser().parseFromString(next.html, "text/html").title;
            if (t) document.title = t;
            if (MR.smoother) MR.smoother.scrollTo(0, false);
            resetHead();
            await wait(10);
          },
          after: ({ next }) => {
            scrollTo(0, 0);
            requestAnimationFrame(() => requestAnimationFrame(() => { mount(next.container); ready(); }));
          },
        }],
      });
      return;
    }
    // On file:// barba can’t fetch the next page — cover with the same curtain for .25s, then navigate normally
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!own(href) || href.split("#")[0] === here()) return;
      e.preventDefault();
      closeMenu();
      document.body.dataset.color = colorOf[href.split(".")[0]] || "white";
      document.body.classList.add("is-transitioning");
      setTimeout(() => (location.href = href), reduced ? 0 : 250);
    });
    addEventListener("pageshow", (e) => e.persisted && document.body.classList.remove("is-transitioning"));
  };
  addEventListener("DOMContentLoaded", () => (document.fonts?.ready || Promise.resolve()).then(() => { document.documentElement.classList.add("mr-fonts"); requestAnimationFrame(start); }));
})();
