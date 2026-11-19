// Header, footer and Interaction reactions shared by all pages. The header and footer markup lives here once and pages leave only empty slots.
(() => {
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The original jQuery fadeIn and slideDown use the default curve swing, but the jquery.easing it also ships replaces swing with easeOutQuad
  // (measured again: 300ms outQuad starting from the first tick ≒24ms after the press). Take that first tick as 0 and measure progress by wall clock
  const swingTo = (el, prop, from, to, ms, done) => {
    cancelAnimationFrame(el._thSwing || 0);
    const unit = prop === "opacity" ? "" : "px";
    let t0 = 0;
    el.style[prop] = from + unit;
    if (reduce || !ms) { el.style[prop] = to + unit; done?.(); return; }
    const step = (now) => {
      if (!t0) t0 = now;
      const k = Math.min(1, Math.max(0, now - t0) / ms);
      el.style[prop] = from + (to - from) * (1 - (1 - k) * (1 - k)) + unit;
      if (k < 1) el._thSwing = requestAnimationFrame(step); else done?.();
    };
    el._thSwing = requestAnimationFrame(step);
  };

  const ICON = {
    about: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5" stroke-linecap="round"/></svg>',
    performance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19h16M6 15l4-4 3 3 5-6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    fee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9 7l3 4 3-4M12 11v6M9 13h6" stroke-linecap="round"/></svg>',
    beginner: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 3h4v17l-4-3zM13 3h4v14l-4 3z"/></svg>',
    nisa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 15V9l8 6V9" stroke-linejoin="round"/></svg>',
    ideco: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 6 0 0 1 16 0v3l-3 1v3h-3v-2h-4v2H7v-3l-3-2z" stroke-linejoin="round"/></svg>',
    campaign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="9" width="16" height="11"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1" stroke-linejoin="round"/></svg>',
    support: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11H9l-5 4z" stroke-linejoin="round"/><path d="M10 9.5a2 2 0 1 1 2.5 1.9V12" stroke-linecap="round"/></svg>',
  };
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M10 7.5l4.5 4.5-4.5 4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const BLANK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6H6v12h12v-3M13 5h6v6M19 5l-8 8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const NAV = [
    ["about", "about.html", "About the service"],
    ["performance", "https://example.com/performance/", "Fund performance"],
    ["fee", "https://example.com/fee/", "Fee"],
    ["beginner", "flow.html", "How to start"],
    ["nisa", "https://example.com/nisa/", "Tax-Saving Account 1"],
    ["ideco", "https://example.com/ideco/", "Tax-Saving Account 2"],
    ["campaign", "list.html", "Campaign"],
    ["support", "https://example.com/support/", "Customer support"],
  ];
  const current = { about: "about", list: "campaign", flow: "beginner" }[page];
  // Link type follows the original header: mostly the with-parameters type, only tax-saving account 1 differs, customer support has no type
  const LINK_CLASS = { nisa: "u-inherit", support: "" };
  for (const [k] of NAV) if (!(k in LINK_CLASS)) LINK_CLASS[k] = "u-params";

  const btn = (cls, text, href = "#") =>
    `<a class="th-btn ${cls}" data-fx="fill-swap-hover" data-fx-fill-swap-hover="look: grow" href="${href}">${text}<i class="th-btn__arrow">${ARROW}</i></a>`;
  const cta = (fixed) => `
    <div class="th-cta${fixed ? " is-fixed" : ""}"${fixed ? ' data-follow-target data-slot="sticky-cta"' : ""}>
      <ul class="th-cta__list">
        <li class="th-cta__item"><p class="th-cta__head"><span>Your short guide line here</span></p><div class="th-cta__btn">${btn("is-line is-small", "Get a free diagnosis", "https://app.example.com/diagnosis")}</div></li>
        <li class="th-cta__item"><p class="th-cta__head is-mark"><span>Your highlight phrase here!</span></p><div class="th-cta__btn">${btn("is-blue is-small", "Apply now", "https://app.example.com/register")}</div></li>
      </ul>
    </div>`;
  window.thCta = cta;
  window.thBtn = btn;

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.className = "th-header";
    header.innerHTML = `
      <div class="th-header__upper">
        <p class="th-logo" data-label="Brand wordmark + two-line slogan">${page === "home"
          ? '<span><span class="th-logo__mark">BRAND</span><span class="th-logo__copy">Your slogan line here,<br>Second-line slogan.</span></span>'
          : '<a class="u-params" href="index.html"><span class="th-logo__mark">BRAND</span><span class="th-logo__copy">Your slogan line here,<br>Second-line slogan.</span></a>'}</p>
        <nav class="th-snav" aria-label="Shortcut">
          <p class="th-arrow-link"><a class="u-params" href="flow.html"><i class="th-dot">${ARROW}</i>Application Flow</a></p>
          <ul class="th-snav__list">
            <li><a class="th-sq is-white" data-fx="fill-swap-hover" data-fx-fill-swap-hover="look: grow" href="https://app.example.com/diagnosis">Free diagnosis</a></li>
            <li><a class="th-sq is-blue" data-fx="fill-swap-hover" data-fx-fill-swap-hover="look: grow" href="https://app.example.com/register">Application</a></li>
            <li><a class="th-sq is-ink" data-fx="fill-swap-hover" data-fx-fill-swap-hover="look: grow" href="https://app.example.com/login">Log in</a></li>
          </ul>
        </nav>
        <button class="th-toggle" type="button" aria-expanded="false" aria-controls="th-gnav"><span>MENU</span></button>
      </div>
      <div class="th-header__lower" data-slot="mobile-menu">
        <nav class="th-gnav" id="th-gnav" aria-label="Menu">
          <ul class="th-gnav__list">
            ${NAV.map(([k, href, t]) => `<li class="is-${k}"><a${LINK_CLASS[k] ? ` class="${LINK_CLASS[k]}"` : ""} href="${href}"${k === current ? ' aria-current="page"' : ""}>${ICON[k]}${t}</a></li>`).join("")}
          </ul>
          <div class="th-gnav__login">${btn("is-blue", "Log in", "https://app.example.com/login")}</div>
          <p class="th-gnav__register th-arrow-link"><a class="u-params" href="flow.html"><i class="th-dot">${ARROW}</i>Application Flow</a></p>
          ${cta(false).replace("th-cta", "th-cta is-menu")}
        </nav>
      </div>`;
  }

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.className = "th-footer";
    const links = (arr) => arr.map(([t, href = "#", ext]) => `<li><a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ""}>${t}${ext ? '<i class="th-ext">' + BLANK + "</i>" : ""}</a></li>`).join("");
    footer.innerHTML = `
      <aside class="th-app" data-slot="app-download">
        <div class="th-app__photo" data-par><div class="th-par wf-img" data-label="Hand holding an app screen · bright interior · landscape photo, flows upward"></div></div>
        <div class="th-app__text">
          <h2 class="th-app__title"><span class="th-app__icon" data-label="App icon">BRAND</span><span><b>BRAND</b> Official app<br>Download it for free!</span></h2>
          <p class="th-app__desc">Your one line on what can be seen in the app,<br>Add a second line of description.</p>
          <ul class="th-app__stores">
            <li><a class="th-store" href="#" data-label="App store badge"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3l11 9-11 9z"/></svg>Google Play</a></li>
            <li><a class="th-store" href="#" data-label="App store badge"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="13" r="7"/></svg>App Store</a></li>
          </ul>
        </div>
      </aside>
      <div class="th-foot__mid" data-slot="footer-sitemap">
        <nav class="th-sitemap">
          <div class="th-sitemap__main">
            <ul>${links(NAV.map(([, href, t]) => [t, href]))}</ul>
            <ul>${links([["Brand story"], ["Partner Services"], ["Application Flow", "flow.html"], ["Column", "#", 1], ["Company About", "#", 1], ["White paper", "#", 1], ["Our service in numbers"], ["Podcast", "#", 1]])}</ul>
          </div>
          <div class="th-sitemap__sub">
            <ul>${links([["Usage guide"], ["Customer-centric operations statement"], ["Fees and risk notice"], ["Regulator reporting desk", "#", 1], ["Information Security Policy", "#", 1]])}</ul>
            <ul class="is-sns">${links([["Facebook", "#", 1], ["Instagram", "#", 1], ["X", "#", 1]])}</ul>
          </div>
        </nav>
      </div>
      <dl class="th-misc">
        <div><dt>Mutual</dt><dd>Your company name and registration number, one line</dd></div>
        <div><dt>Member Associations</dt><dd>Your association name here</dd></div>
      </dl>
      <div class="th-foot__low">
        <p class="th-foot__logo" data-label="Brand wordmark (white)">BRAND</p>
        <p class="th-foot__copy">© Company Name Co., Ltd.</p>
        <div class="th-walk" data-fx="walk-crowd-strip" data-slot="walk-strip"></div>
        <div class="th-pagetop"><a href="#top" data-anchor><i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M6 15l6-6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg></i><span>PAGE TOP</span></a></div>
      </div>`;
    if (page === "home") footer.insertAdjacentHTML("afterend", cta(true));
  }

  // Button arrow circle: two plates, resting and hovered (shared.css swaps only front and back)
  window.thArrows = () => document.querySelectorAll(".th-btn__arrow").forEach((a) => { if (!a.querySelector(":scope > i")) a.innerHTML = `<i>${a.innerHTML}</i><i>${a.innerHTML}</i>`; });
  window.thArrows();

  // ── Phone menu: on press the drawer turns on in .3s while the body stays fixed in place, on close it turns off in the same length and returns to the scroll position (below 1120px)
  const hd = document.querySelector(".th-header");
  const toggle = hd?.querySelector(".th-toggle");
  const lower = hd?.querySelector(".th-header__lower");
  const narrow = matchMedia("(max-width: 1119px)");
  let keep = 0, busy = false;
  toggle?.addEventListener("click", () => {
    if (!narrow.matches || busy) return;
    busy = true;
    if (hd.classList.contains("is-open")) {
      toggle.classList.remove("is-open");
      toggle.classList.add("is-close");
      toggle.setAttribute("aria-expanded", "false");
      swingTo(lower, "opacity", 1, 0, 300, () => {
        hd.classList.remove("is-open");
        toggle.classList.remove("is-close");
        lower.style.removeProperty("opacity");
        lower.style.removeProperty("display");
        busy = false;
      });
      document.body.removeAttribute("style");
      scrollTo(0, keep);
    } else {
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      keep = scrollY;
      lower.style.display = "block";
      swingTo(lower, "opacity", 0, 1, 300, () => { hd.classList.add("is-open"); busy = false; });
      Object.assign(document.body.style, { position: "fixed", top: -keep + "px", width: "100%" });
    }
  });
  narrow.addEventListener("change", (e) => {
    if (e.matches) return;
    hd?.classList.remove("is-open");
    toggle?.classList.remove("is-open", "is-close");
    document.body.removeAttribute("style");
    lower?.style.removeProperty("opacity");
    lower?.style.removeProperty("display");
  });

  // ── Header hide: at 768px and up, scrolling down past the header height lifts it by its own height in .3s ease to hide it, and scrolling up brings it right back (also stays hidden at the very bottom)
  const wide = matchMedia("(min-width: 768px)");
  const setHide = () => {
    if (!hd) return;
    if (wide.matches && !reduce) {
      hd.setAttribute("data-fx", "hide-on-scroll");
      hd.setAttribute("data-fx-hide-on-scroll", "look: slide; delay: 0; end: hide");
      hd.style.setProperty("--fx-dur", "0.3s");
    } else {
      hd.removeAttribute("data-fx");
    }
  };
  setHide();
  wide.addEventListener("change", setHide);

  // ── Phone fixed apply bar: turns on when the hero leaves the screen. Subpages without a hero are always on
  const follow = document.querySelector("[data-follow-target]");
  const trigger = document.querySelector("[data-follow-trigger]");
  if (follow) {
    if (trigger) new IntersectionObserver(([e]) => follow.classList.toggle("is-sticky", !e.isIntersecting)).observe(trigger);
    else follow.classList.add("is-sticky");
  }

  // ── Table of contents: turns on in .6s when it enters the middle half of the screen, and marks the link of the chapter spanning the middle 20% of the screen
  const toc = document.querySelector(".th-toc");
  if (toc) {
    // The original marks it from a module script before first paint, so it is already visible on open (measured: zero change on open) — if it sits in the center of the first screen, mark it right away
    const r = toc.getBoundingClientRect();
    if (r.bottom > innerHeight * 0.25 && r.top < innerHeight * 0.75) toc.classList.add("is-fade");
    new IntersectionObserver(([e]) => toc.classList.toggle("is-fade", e.isIntersecting), { rootMargin: "-25% 0px" }).observe(toc);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      toc.querySelector("a.is-current")?.classList.remove("is-current");
      toc.querySelector(`a[href="#${e.target.id}"]`)?.classList.add("is-current");
    }), { rootMargin: "-40% 0px" });
    document.querySelectorAll("[data-toc-section]").forEach((s) => io.observe(s));
  }

  // ── Same-page anchors: glides with 1s easeInOutQuad and stops below the header (174px on wide screens · 50px on phones)
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href") === "#" || a.hasAttribute("data-modal-open") || a.closest("[data-tabs]")) return;
    const id = a.getAttribute("href");
    const to = id === "#top" ? 0 : document.querySelector(id);
    if (to == null) return;
    e.preventDefault();
    const off = matchMedia("(max-width: 767px)").matches ? 50 : 174;
    const y = to === 0 ? 0 : Math.ceil(to.getBoundingClientRect().top + scrollY) - off;
    gsap.to(window, { scrollTo: y, duration: reduce ? 0 : 1, ease: "power1.inOut" });
  });

  // ── Photo strip parallax: while the cell is visible, the inner photo flows up by the cell height difference (top edge on entering → bottom edge on leaving)
  // The header image turns on as soon as it opens, 1.05x → 1x in .6s (the shape the original parallax script applies when first attached).
  // Turning it on while the web font is swapping mid-render mixes that jitter into the turn-on, so enable it after the font has fully loaded
  (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() => document.querySelectorAll("[data-par-in]").forEach((n) => n.classList.add("is-in"))));
  document.querySelectorAll("[data-par]").forEach((box) => {
    const child = box.querySelector(".th-par, .fl-crowd__img") || box.firstElementChild;
    if (!child || reduce) return;
    let on = false, raf = 0;
    const render = () => {
      const r = box.getBoundingClientRect();
      const ratio = (child.offsetHeight - box.clientHeight) / (innerHeight + box.clientHeight);
      const v = (innerHeight - r.top) * ratio;
      child.style.transform = `translate3d(0, ${(-v).toFixed(1)}px, 0)`;
      if (on) raf = requestAnimationFrame(render);
    };
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      cancelAnimationFrame(raf);
      child.style.willChange = on ? "transform" : "";
      if (on) raf = requestAnimationFrame(render);
    }).observe(box);
  });

  // ── Numbered accordion (details): the panel height opens and closes with .3s ease-out
  document.querySelectorAll("details[data-acc]").forEach((d) => {
    const sum = d.querySelector("summary"), panel = d.querySelector("[data-acc-panel]");
    if (!sum || !panel) return;
    panel.style.height = d.open ? "auto" : "0";
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        panel.style.height = panel.scrollHeight + "px";
        requestAnimationFrame(() => requestAnimationFrame(() => {
          panel.style.height = "0";
          d.classList.remove("is-open");
          const done = () => { d.open = false; panel.removeEventListener("transitionend", done); };
          if (reduce) done(); else panel.addEventListener("transitionend", done);
        }));
      } else {
        d.open = true;
        d.classList.add("is-open");
        requestAnimationFrame(() => requestAnimationFrame(() => {
          panel.style.height = panel.scrollHeight + "px";
          const done = () => { panel.style.height = "auto"; panel.removeEventListener("transitionend", done); };
          if (reduce) done(); else panel.addEventListener("transitionend", done);
        }));
      }
    });
  });

  // ── Accordion questions (FAQ): the answer opens downward with .4s swing and closes over the same length
  document.querySelectorAll("[data-collapse]").forEach((q) => {
    const a = document.getElementById(q.getAttribute("href").slice(1));
    if (!a) return;
    Object.assign(a.style, { overflow: "hidden", display: "none" });
    q.addEventListener("click", (e) => {
      e.preventDefault();
      const open = q.classList.contains("is-open");
      if (open) {
        q.classList.remove("is-open");
        swingTo(a, "height", a.offsetHeight, 0, 400, () => { a.style.display = "none"; a.style.removeProperty("height"); });
      } else {
        q.classList.add("is-open");
        a.style.display = "block";
        a.style.height = "auto";
        const h = a.scrollHeight;
        swingTo(a, "height", 0, h, 400, () => a.style.removeProperty("height"));
      }
    });
  });

  // ── Tabs: the pressed panel turns on with a .4s swing
  document.querySelectorAll("[data-tabs]").forEach((wrap) => {
    const tabs = [...wrap.querySelectorAll("[data-tab]")], panes = [...wrap.querySelectorAll("[data-pane]")];
    tabs.forEach((t, i) => t.addEventListener("click", (e) => {
      e.preventDefault();
      tabs.forEach((x, j) => x.classList.toggle("is-active", i === j));
      panes.forEach((p) => { p.classList.remove("is-active"); p.style.display = "none"; });
      panes[i].classList.add("is-active");
      panes[i].style.display = "block";
      swingTo(panes[i], "opacity", 0, 1, 400);
    }));
  });

  // ── Modal (terms·video): micromodal — overlay .3s fade + panel rises from 10% below, scroll locked while open
  if (window.MicroModal && document.querySelector(".th-modal")) {
    MicroModal.init({ openTrigger: "data-modal-open", closeTrigger: "data-modal-close", disableScroll: true, awaitOpenAnimation: !reduce, awaitCloseAnimation: !reduce });
  }
})();
