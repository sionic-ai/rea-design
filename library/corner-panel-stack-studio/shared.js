// Shared by all pages: draws the header, circle-mask menu, closing panel, footer, cookie card and transition cover, and hooks up Lenis, header color switching, line splitting, photo circle reveal and transitions.
// Original values: Lenis lerp .1 · lines at 150% 1.2s expo.out, .08s per line · photo circle 1.6s expo.inOut + photo 1.15→1 1.8s expo.out (up to 4x speed when scrolling fast)
// · transition cover circle .7s expo.inOut (shown after .35s, then .5s expo.out) → reveal .8s expo.inOut (after .15s) · the first entrance on a page arrived at by transition is .55s later.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const AG = (window.AG = { lenis: null, mm: null, arrive: 0 });
  const KEY = "ag-veil";

  const mark = (cls = "") => `<span class="mark ${cls}" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`;
  const logo = `<a href="index.html" class="logo" aria-label="Home">${mark()}<span class="wordmark" aria-hidden="true" data-label="Your Studio English name here, two lines"><b>Studio</b><span>Name</span></span></a>`;
  const cur = (p) => (p === page ? ' aria-current="page"' : "");
  const faces = `<div class="face-row"><span class="faces" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><p><b>A line that builds trust here</b><span>Rating 0.00 · 00 reviews · <a class="u-line" href="#">Review site</a></span></p></div>`;
  AG.faces = faces;

  const nav = document.querySelector('[data-slot="header"]');
  if (nav) {
    nav.className = "nav";
    nav.setAttribute("data-nav", "");
    nav.dataset.navTheme = "paper";
    const items = [["works", "works.html", "Works"], ["services", "index.html#services", "Services"], ["service", "service.html", "Solutions"], ["news", "news.html", "Blog"], ["about", "about.html", "About"], ["contact", "#contact", "Contact"]];
    nav.innerHTML = `
      <div class="wrap nav__bar">${logo}<button class="burger" popovertarget="menu" aria-label="Open Menu"><i></i><i></i></button></div>
      <div id="menu" popover class="menu" data-theme="blue" data-lenis-prevent data-slot="menu">
        <div class="wrap menu__in">
          <div class="menu__bar">${logo}<div class="menu__right"><a href="#" class="menu__lang">Other language</a><button class="burger is-x" popovertarget="menu" popovertargetaction="hide" aria-label="Close"><i></i><i></i></button></div></div>
          <nav class="menu__nav" aria-label="Main menu">${items.map(([k, h, t], i) => `<a class="display" href="${h}"${cur(k)}><span style="--i:${i}">${t}</span></a>`).join("")}</nav>
          <div class="menu__foot"><a href="#" class="title">hello@your.email</a><a class="btn" href="#contact">Start Project</a></div>
        </div>
      </div>`;
  }

  const main = document.querySelector("main");
  if (main && !document.querySelector('[data-slot="cta-call"]'))
    main.insertAdjacentHTML("afterend", `
    <section data-theme="paper" class="cta-wrap" id="contact" data-slot="cta-call" aria-label="Free consultation">
      <div class="wrap">
        <div data-theme="blue" class="cta tile">
          <p class="label">Your short consultation notice here</p>
          <h2 class="display display-lg" data-split data-label="Your consultation title asking what is being made goes here · the last word in italic serif.">Tell us about <em>your project</em></h2>
          <div class="cta__row">
            <div><p class="lead">Your two-line notice goes here: tell us your goal and we will reply within a day with the scope and next steps.</p>${faces}</div>
            <div class="cta__act">
              <div class="btn-pair"><a href="#" class="btn">Schedule a consultation</a><a href="#" class="btn btn-line">Start Project</a></div>
              <p>Prefer Not to Call? <a href="#" class="u-line">Get a free checkup.</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>`);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "foot";
    foot.dataset.theme = "ink";
    const col = (t, a) => `<nav class="foot__nav" aria-label="${t}"><p class="label">${t}</p><ul>${a.map((x) => `<li><a href="${x[1]}">${x[0]}</a></li>`).join("")}</ul></nav>`;
    foot.innerHTML = `
      <div class="wrap foot__top">
        <div class="foot__ask">
          <h2 class="display display-md" data-label="Your one line here inviting people to ask AI about us · the name in italic serif">Ask your AI about <em>Studio</em> <em>Name</em></h2>
          <p>Your two-line tip here to ask the assistant you use a quick question. <a class="u-line" href="#">Summary File</a>Department <a class="u-line" href="#">Review</a>Words about reading.</p>
          <div class="seg-row" data-agent-switch>
            <span class="label foot__dim" id="agent-switch-label">Who reads it?</span>
            <div class="seg" role="group" aria-labelledby="agent-switch-label"><button type="button" aria-pressed="true" data-view="people">Person</button><button type="button" aria-pressed="false" data-view="agents">Agent</button></div>
          </div>
        </div>
        <div class="foot__chips">
          <ul class="chips">${["Assistant 1", "Assistant 2", "Assistant 3", "Assistant 4", "Assistant 5", "Assistant 6"].map((t) => `<li><a href="#" class="chip label">${t}</a></li>`).join("")}</ul>
          <div class="card prompt"><p data-prompt>Your sample question to paste to the assistant here, about three lines. A place to give the company name and address, what you want to know, and by what criteria to compare.</p><button type="button" class="label" data-copy data-copied="Copied">Copy Question</button></div>
        </div>
      </div>
      <div class="wrap foot__mid">
        <div class="foot__contact">
          <a href="#" class="title foot__mail">hello@your.email</a>
          <a href="#" class="foot__dim" style="display:block">Messenger +00 00 000 0000</a>
          <div class="foot__addr"><p><span class="label">City 1</span>Your street address 000 here<br>Your city, country here</p><p><span class="label">City 2</span>Your street address 0000 here<br>Your City 00000, Country here</p></div>
          <svg class="foot__badge" viewBox="0 0 96 96" aria-label="Award badge slot"><path d="M48 6 86 24v34L48 90 10 58V24Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M28 40h40M28 50h40M34 60h28" stroke="currentColor" stroke-width="2"/></svg>
        </div>
        ${col("Solution", [["Solution 1", "service.html"], ["Solution 2", "service.html"], ["Solution 3", "service.html"], ["Solution 4", "service.html"]])}
        ${col("Studio", [["About", "about.html"], ["Work", "works.html"], ["Work sequence", "index.html#workflow"], ["Ways to join", "index.html#pricing"], ["Blog", "news.html"]])}
        ${col("Terms", [["Personal information", "#"], ["Terms of service", "#"], ["Cookie", "#"], ["Accessibility", "#"], ["Summary File", "#"]])}
      </div>
      <div class="wrap foot__giant" aria-hidden="true"><p class="display" data-label="Your Studio English name here, two lines">Studio<br>Name</p>${mark("giant-mark")}</div>
      <div class="wrap foot__base">
        <p><span>© 2026 Company name ·&nbsp;</span><span><button type="button" data-cookie-settings>Cookie Settings</button> ·&nbsp;</span><span><a href="#">Partner Certification</a> ·&nbsp;</span><span><a href="#">00 reviews</a></span></p>
        <ul><li><a href="#">Channel 1</a></li><li><a href="#">Channel 2</a></li><li><a href="#">Channel 3</a></li><li><a href="#">Channel 4</a></li></ul>
      </div>
      <dialog class="agent-view" aria-labelledby="agent-view-title" data-agent-view data-lenis-prevent data-slot="agent-view">
        <div class="wrap agent-view__head">
          <div><p id="agent-view-title" class="display display-md" data-label="Your agent edition name here">The page agents read</p><p>Your two-line notice that every page has a markdown version goes here.</p></div>
          <div class="agent-view__acts label"><button type="button" data-agent-copy data-copied="Copied">Copy</button><a href="#">Open Markdown ↗</a><button type="button" class="btn" data-agent-close>Back to page</button></div>
        </div>
        <pre class="agent-md wrap"><code data-agent-md></code></pre>
      </dialog>`;
  }

  document.body.insertAdjacentHTML("beforeend", `
    <div class="consent" data-theme="paper" role="region" aria-label="Cookie Choices" data-consent data-slot="consent" hidden>
      <p>Your two-line notice that analytics cookies are used goes here. <a href="#" class="u-line">Cookie Policy</a></p>
      <div class="consent__choices" data-consent-choices hidden><label><input type="checkbox"><span><b>Analysis</b> <span class="consent__dim">Your one line here on what is observed with which tools.</span></span></label></div>
      <div class="consent__acts"><button type="button" class="btn" data-consent-all>Allow all</button><button type="button" class="btn" data-consent-save hidden>Save Selection</button><button type="button" class="btn btn-line" data-consent-none>Decline all</button><button type="button" class="consent__more" data-consent-more>Settings</button></div>
    </div>
    <div class="veil" data-veil aria-hidden="true">${mark()}</div>`);

  // Cookie card — once chosen, it does not show again even on other pages (the original keeps the same card across transitions)
  const consent = document.querySelector("[data-consent]");
  if (!sessionStorage.getItem("ag-consent")) consent.hidden = false;
  $$("[data-consent-all],[data-consent-none],[data-consent-save]", consent).forEach((b) => b.addEventListener("click", () => { consent.hidden = true; sessionStorage.setItem("ag-consent", "1"); }));
  // Settings — the choice cells expand and ”Save selection” stands in the place of ”Allow all” and ”Settings”
  consent.querySelector("[data-consent-more]").addEventListener("click", (e) => {
    consent.querySelector("[data-consent-choices]").hidden = false;
    consent.querySelector("[data-consent-save]").hidden = false;
    consent.querySelector("[data-consent-all]").hidden = true;
    e.currentTarget.hidden = true;
  });
  document.querySelector("[data-cookie-settings]")?.addEventListener("click", () => (consent.hidden = false));

  // Copy question — shows ”Copied” for 2 seconds
  $$("[data-copy],[data-agent-copy]").forEach((b) => {
    const t = b.textContent;
    b.addEventListener("click", () => { navigator.clipboard?.writeText(document.querySelector("[data-prompt]")?.textContent || "").catch(() => {}); b.textContent = b.dataset.copied; setTimeout(() => (b.textContent = t), 2000); });
  });

  // Human / Agent — pressing Agent opens the panel as a circle from that button’s position (.9s), and Human, Close or Esc closes it as a circle (.6s).
  const sw = document.querySelector("[data-agent-switch]"), view = document.querySelector("[data-agent-view]");
  if (sw && view) {
    const [people, agents] = $$("[data-view]", sw);
    const md = view.querySelector("[data-agent-md]");
    const set = (on) => { people.setAttribute("aria-pressed", String(!on)); agents.setAttribute("aria-pressed", String(on)); };
    agents.addEventListener("click", () => {
      if (view.open) return;
      const r = agents.getBoundingClientRect();
      view.style.setProperty("--x", `${r.left + r.width / 2}px`);
      view.style.setProperty("--y", `${r.top + r.height / 2}px`);
      set(true);
      if (!md.dataset.loaded) {
        md.innerHTML = ["<span class=\"md-dim\">--- title: Your page title here ---</span>", "<span class=\"md-h\"># Your large heading here</span>", "Your page body continues here in Markdown. Two or three lines.", "<span class=\"md-h\">## Your subheading here</span>", "<span class=\"md-mark\">-</span> Your one-line list item here", "<span class=\"md-mark\">-</span> Your one-line list item here", "<span class=\"md-mark\">-</span> Your one-line list item here"].join("\n\n");
        md.dataset.loaded = "1";
      }
      view.showModal();
      view.scrollTop = 0;
    });
    const close = () => {
      if (!view.open || view.classList.contains("is-closing")) return;
      set(false);
      if (reduced()) return view.close();
      view.classList.add("is-closing");
      view.addEventListener("animationend", () => { view.classList.remove("is-closing"); view.close(); }, { once: true });
    };
    people.addEventListener("click", close);
    view.querySelector("[data-agent-close]").addEventListener("click", close);
    view.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
  }

  // Transition — clicking a same-site link covers the page with a circle from the top right, four corner marks spin and settle, then it navigates
  const veil = document.querySelector("[data-veil]"), vmark = veil.querySelector(".mark");
  const rtl = root.dir === "rtl";
  const [vFrom, vTo] = rtl ? ["0% 0%", "100% 100%"] : ["100% 0%", "0% 100%"];
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.origin !== location.origin) return;
    const here = a.pathname === location.pathname;
    if (here && a.hash) return;
    e.preventDefault();
    const menu = document.getElementById("menu");
    if (reduced()) return (location.href = a.href);
    sessionStorage.setItem(KEY, "1");
    gsap.timeline({ onComplete: () => { menu?.matches(":popover-open") && menu.hidePopover(); location.href = a.href; } })
      .fromTo(veil, { clipPath: `circle(0% at ${vFrom})` }, { clipPath: `circle(150% at ${vFrom})`, duration: 0.7, ease: "expo.inOut" })
      .fromTo(vmark, { opacity: 0, scale: 0.7, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: "expo.out" }, 0.35);
  });
  addEventListener("pageshow", (e) => e.persisted && gsap.set(veil, { clipPath: `circle(0% at ${vFrom})` }));
  // Page arrived by a turn — starts covered, the marker disappears and it peels away to the lower left
  if (sessionStorage.getItem(KEY)) {
    sessionStorage.removeItem(KEY);
    if (!reduced()) {
      AG.arrive = 0.55;
      gsap.set(veil, { clipPath: `circle(150% at ${vTo})` });
      gsap.set(vmark, { opacity: 1 });
      gsap.timeline()
        .to(vmark, { opacity: 0, scale: 0.85, duration: 0.25, ease: "power2.in" }, 0.1)
        .fromTo(veil, { clipPath: `circle(150% at ${vTo})` }, { clipPath: `circle(0% at ${vTo})`, duration: 0.8, ease: "expo.inOut" }, 0.15);
    }
  }
  root.classList.remove("veil-on");

  // Lenis — lerp .1, same-page anchors scroll smoothly too
  function smooth() {
    if (AG.lenis) return AG.lenis.resize();
    AG.lenis = new Lenis({ lerp: 0.1, anchors: true });
    AG.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => AG.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Header — takes the panel color of the section straddling half the header height, hides when scrolled down past 200px and returns on scroll up
  function navTheme() {
    if (!nav) return;
    const half = () => nav.offsetHeight / 2;
    for (const s of $$("section[data-theme], footer[data-theme]"))
      ScrollTrigger.create({ trigger: s, start: () => `top ${half()}`, end: () => `bottom ${half()}`, onToggle: (st) => st.isActive && (nav.dataset.navTheme = s.dataset.theme) });
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (st) => nav.classList.toggle("is-hidden", st.direction === 1 && st.scroll() > 200) });
  }

  // Line splitting — group items on the same line (top edge within half a glyph height) at .08s each. data-widen stands up shrinking from 1.12× wider
  function split() {
    for (const el of $$("[data-split]")) {
      const now = el.dataset.split === "now";
      SplitText.create(el, {
        type: "lines", mask: "lines", linesClass: "split-line", aria: /^H[1-6]$/.test(el.tagName) ? "auto" : "none", autoSplit: true,
        onSplit: (self) => {
          const tops = self.lines.map((l) => l.getBoundingClientRect().top);
          const tol = parseFloat(getComputedStyle(el).fontSize) * 0.5;
          const rows = tops.map((t) => [...new Set(tops)].sort((a, b) => a - b).reduce((n, v, i, arr) => (i && v <= t && v - arr[i - 1] > tol ? n + 1 : n), 0));
          return gsap.from(self.lines, {
            yPercent: 150, ...(el.hasAttribute("data-widen") && { scaleX: 1.12, transformOrigin: rtl ? "100% 50%" : "0% 50%" }),
            duration: 1.2, ease: "expo.out", stagger: (i) => rows[i] * 0.08,
            delay: Number(el.dataset.delay ?? (now ? 0.15 : 0)) + (now ? AG.arrive : 0),
            scrollTrigger: now ? undefined : { trigger: el, start: "top 88%", once: true },
          });
        },
      });
      gsap.set(el, { visibility: "visible" });
    }
  }

  // Photo circle reveal — a circle grows from the top-right corner to 150% (1.6s expo.inOut), inner photo goes 1.15→1 (1.8s expo.out).
  // Below 125%, if already scrolling down fast (speed 900 or more) it opens first, and spins faster by speed/600 times (1~4)
  function reveal() {
    const at = rtl ? "0% 0%" : "100% 0%";
    for (const el of $$("[data-reveal]")) {
      const tl = gsap.timeline({ paused: true }).fromTo(el, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: 1.6, ease: "expo.inOut" }, 0);
      const img = el.querySelector(".ph");
      if (img) tl.from(img, { scale: 1.15, duration: 1.8, ease: "expo.out" }, 0);
      const go = (st) => tl.progress() === 0 && !tl.isActive() && tl.timeScale(gsap.utils.clamp(1, 4, Math.abs(st.getVelocity()) / 600)).play();
      ScrollTrigger.create({ trigger: el, start: "top 125%", once: true, onEnter: (st) => Math.abs(st.getVelocity()) >= 900 && go(st) });
      ScrollTrigger.create({ trigger: el, start: "top bottom", once: true, onEnter: go });
    }
  }

  AG.boot = [];
  const start = () => {
    const mm = (AG.mm = gsap.matchMedia());
    mm.add("(prefers-reduced-motion: no-preference)", () => { smooth(); split(); reveal(); navTheme(); });
    mm.add("(prefers-reduced-motion: reduce)", () => { root.classList.remove("js-split", "js-reveal"); navTheme(); });
    AG.boot.forEach((f) => f(mm));
  };
  // If the font is late, line breaks go off, so wait for the font but no longer than .9s
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(start);
})();
