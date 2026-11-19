// Shared for Brand team — puts the header bar, contact section and footer into every page in the same form, and handles the per-section band color, header panel, menu and page transition (the group gathers to the center, then moves after .55s).
(() => {
  const root = document.documentElement;
  const page = document.body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NAV = [
    ["works", "works.html", "Work"], ["about", "about.html", "About"], ["partners", "service.html#partners", "Partners"],
    ["service", "service.html", "Services"], ["news", "news.html", "Journal"], ["contact", "contact.html", "Contact"],
  ];
  const scr = (text) => `data-fx="text-scramble" data-fx-text-scramble="on: hover; hover: on; duration: ${Math.max(0.26, 0.042 * text.length).toFixed(3)}; flicker: .032; chars: ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_#"`;
  const mark = `<svg viewBox="0 0 62 40" fill="none" stroke-width="4.2" stroke="currentColor" aria-hidden="true"><path class="is-lead" d="M22 4 31 11 40 4"/><path d="M4 18 17 28 30 18M32 18 45 28 58 18"/></svg>`;
  const arrow = `<svg class="rk-arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 14 14 6M7 6h7v7"/></svg>`;

  // Skip to content — visible only when keyboard focus lands on it
  const main = document.querySelector("main");
  if (main) {
    main.id ||= "main";
    document.body.insertAdjacentHTML("afterbegin", `<a class="rk-skip" href="#${main.id}">Skip to content</a>`);
  }

  // Headline
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "rk-head";
    head.dataset.open = "false";
    const links = NAV.map(([k, href, t]) => `<a class="rk-chip" href="${href}"${k === page ? ' aria-current="page"' : ""}><span ${scr(t)}>${t}</span></a>`).join("");
    head.innerHTML = `
      <div class="rk-head__row">
        <a href="index.html" aria-label="Home" data-label="Brand cover + English name"><span class="rk-brand">${mark}<span>STUDIO</span></span></a>
        <nav class="rk-head__nav" aria-label="Main menu">${links}</nav>
        <div class="rk-head__right">
          <span class="rk-chip rk-lang"><a href="#" aria-current="true">EN</a><span>/</span><a href="#">KO</a></span>
          <a class="rk-btn is-sm" href="contact.html"><i class="rk-dot"></i><span ${scr("Let's talk")}>Let's talk</span></a>
        </div>
        <button class="rk-head__toggle" type="button" aria-expanded="false" aria-controls="rk-menu">
          <svg class="rk-head__icon" viewBox="0 0 20 20" aria-hidden="true"><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/><line x1="4" y1="10" x2="16" y2="10" style="opacity:0"/></svg>
          <span class="rk-head__toggle-label">Menu</span>
        </button>
      </div>
      <div class="rk-menu" id="rk-menu">
        <nav class="rk-menu__links" aria-label="Main menu">${NAV.map(([k, href, t], i) => `<a href="${href}" style="--i:${i}"${k === page ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
        <div class="rk-menu__foot">
          <span class="rk-chip rk-lang"><a href="#" aria-current="true">EN</a><span>/</span><a href="#">KO</a></span>
          <a class="rk-btn" href="contact.html"><i class="rk-dot"></i><span>Let's talk</span></a>
        </div>
      </div>`;
    const toggle = head.querySelector(".rk-head__toggle"), label = head.querySelector(".rk-head__toggle-label");
    const setOpen = (on) => {
      head.dataset.open = String(on);
      toggle.setAttribute("aria-expanded", String(on));
      label.textContent = on ? "Close" : "Menu";
      document.body.style.overflow = on ? "hidden" : "";
    };
    toggle.addEventListener("click", () => setOpen(head.dataset.open !== "true"));
    head.querySelectorAll(".rk-menu a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  // Contact section (above the footer on every page) — the group sits in the shape of the cover
  const contact = document.querySelector('[data-slot="contact"]');
  if (contact) {
    contact.id = "contact";
    contact.className = "rk-contact";
    contact.dataset.band = "dark";
    contact.setAttribute("data-fx", "arrow-flock");
    contact.setAttribute("data-fx-arrow-flock", "form: logo; anchor: #rk-spot; rot: .5");
    const seg = ["Studio", "Agency", "Business", "Designer"].map((t, i) => `<label><input type="radio" name="who" value="${t}"${i ? "" : " checked"}><span>${t}</span></label>`).join("");
    contact.innerHTML = `
      <span class="wf-note">Contact section · the group sits in a cover shape (four chevrons, the top one in the accent color) and rotates .5 rad following scroll · strip dark</span>
      <div class="rk-contact__head">
        <h2 class="rk-contact__title" data-label="Large English heading for Contact section">Let's talk</h2>
        <div class="rk-contact__spot" id="rk-spot" aria-hidden="true"></div>
      </div>
      <div class="rk-contact__grid">
        <div class="rk-call">
          <div>
            <div class="rk-call__intro">
              <span class="rk-call__label"><i></i>Start with a conversation</span>
              <h3>Your call booking title here</h3>
              <p>Your call explanation goes here in two lines. Say how far the design has come and what comes first.</p>
              <a class="rk-btn is-sm rk-call__btn" href="#contact"><span ${scr("Pick a time")}>Pick a time</span></a>
            </div>
            <div class="rk-who" style="margin-top:2rem">
              <div class="wf-img" data-label="Leader face · light gray background · front view above the shoulders"></div>
              <p><b>Person Name</b><span>Your title line here</span></p>
            </div>
          </div>
          <div class="rk-ways">
            <span class="rk-mono">Or by email</span>
            <a class="rk-ways__mail" href="mailto:hello@studio.name">hello@studio.name</a>
            <div class="rk-socials"><a href="#contact">Social 1</a><a href="#contact">Social 2</a><a href="#contact">Social 3</a><a href="#contact">Social 4</a></div>
          </div>
        </div>
        <form class="rk-form" onsubmit="return false">
          <fieldset><legend class="rk-mono">I am<span class="rk-req">*</span></legend><div class="rk-seg">${seg}</div></fieldset>
          <div class="rk-two">
            <label class="rk-field"><span class="rk-mono">Name<span class="rk-req">*</span></span><input name="name" placeholder="Your name here"></label>
            <label class="rk-field"><span class="rk-mono">Mail<span class="rk-req">*</span></span><input name="email" placeholder="Your email here"></label>
            <label class="rk-field"><span class="rk-mono">Company</span><input name="company" placeholder="Choice"></label>
            <label class="rk-field"><span class="rk-mono">Budget</span><select name="budget"><option>Not yet known</option><option>00 ~ 00</option><option>00 or more</option></select></label>
          </div>
          <label class="rk-field"><span class="rk-mono">What do you make?<span class="rk-req">*</span></span><textarea name="message" placeholder="Write here what you want to build, the date, and the system you use now."></textarea></label>
          <label class="rk-field"><span class="rk-mono">Design and planning links</span><input name="link" placeholder="Your link here"></label>
          <button class="rk-btn is-alt rk-form__send" type="submit"><i class="rk-dot"></i><span ${scr("Send details")}>Send details</span></button>
          <p class="rk-form__note">* Required · one line of reply guidance here</p>
        </form>
      </div>`;
  }

  // Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "rk-foot";
    foot.dataset.band = "dark";
    const chev = `<svg viewBox="0 0 6 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 1l4 4-4 4"/></svg>`;
    const rail = Array.from({ length: 140 }, (_, i) => `<i${i % 13 === 5 ? " data-lead" : ""}>${chev}</i>`).join("");
    foot.innerHTML = `
      <div class="rk-rail" aria-hidden="true"><div class="rk-rail__arrows">${rail}</div></div>
      <div class="rk-foot__main">
        <div class="rk-foot__brand">
          <a class="rk-brand" href="index.html" data-label="Brand cover + English name">${mark}<span>STUDIO</span></a>
          <p class="rk-foot__tag"><span>Your one-line promise here,</span> Your second continuing line here.</p>
          <a class="rk-foot__call" href="contact.html">Arrange a call ${arrow}</a>
        </div>
        <div class="rk-foot__links">
          <div class="rk-foot__col"><span class="rk-mono">Site</span><ul>${NAV.map(([, href, t]) => `<li><a href="${href}">${t}</a></li>`).join("")}</ul></div>
          <div class="rk-foot__col"><span class="rk-mono">Social</span><ul><li><a href="#contact">Social 1</a></li><li><a href="#contact">Social 2</a></li><li><a href="#contact">Social 3</a></li><li><a href="#contact">Social 4</a></li></ul></div>
        </div>
        <a class="rk-foot__mail" href="mailto:hello@studio.name">hello@studio.name</a>
      </div>
      <div class="rk-foot__bottom"><span>© 0000 Studio · studio.name</span><span class="rk-foot__legal"><a href="#contact">Privacy & cookie policy</a></span></div>`;
  }

  // Section band — when a section’s top or bottom passes the screen center, the band on html changes (blends over .55s)
  let bands = [];
  const measure = () => {
    const H = innerHeight;
    bands = [...document.querySelectorAll("[data-band]")].filter((e) => e !== root && !e.parentElement.closest("[data-band]:not(html)"))
      .map((e) => { const r = e.getBoundingClientRect(), top = r.top + scrollY, off = e.hasAttribute("data-band-exact") ? 0 : H / 2; return { a: top - off, b: top + e.offsetHeight - off, band: e.dataset.band }; })
      .sort((x, y) => x.a - y.a);
  };
  let current = "", moving = 0;
  const clearEl = () => document.querySelector("[data-header-clear]");
  function onScroll() {
    const y = scrollY;
    if (bands.length) {
      let i = bands.findIndex((b) => y < b.b);
      if (i < 0) i = bands.length - 1;
      const band = bands[i].band;
      if (band !== current) {
        current = band;
        root.dataset.band = band;
        root.classList.add("is-band-moving");
        clearTimeout(moving);
        moving = setTimeout(() => root.classList.remove("is-band-moving"), 600);
      }
    }
    const c = clearEl();
    let clear = false;
    if (c) { const r = c.getBoundingClientRect(); clear = r.top < 80 && r.bottom > innerHeight; }
    root.dataset.headerSolid = String(y > (innerWidth < 1200 ? 24 : 0.6 * innerHeight) && !clear);
  }
  measure();
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { measure(); onScroll(); });
  addEventListener("load", () => { measure(); onScroll(); });
  new ResizeObserver(() => { measure(); onScroll(); }).observe(document.body);

  // Page transition — gathers the swarm into a cloud at screen center, clears the body at .35s and moves at .55s. On the arriving page the body floats back up at .35s
  try {
    const t = Number(sessionStorage.getItem("rk-arrive") || 0);
    sessionStorage.removeItem("rk-arrive");
    if (!reduce && Date.now() - t < 4000) {
      root.classList.add("is-leaving");
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("is-leaving")));
    }
  } catch { /* Storage Blocked */ }
  let leaving = false;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|https?):/.test(href)) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    if (leaving) return;
    if (reduce) { location.href = url.href; return; }
    leaving = true;
    try { sessionStorage.setItem("rk-arrive", String(Date.now())); } catch { /* Storage Blocked */ }
    document.dispatchEvent(new CustomEvent("fx:flock-gather"));
    root.classList.add("is-leaving");
    setTimeout(() => (location.href = url.href), 550);
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    root.classList.remove("is-leaving");
    document.dispatchEvent(new CustomEvent("fx:flock-release"));
  });

  document.body.setAttribute("data-fx", [document.body.getAttribute("data-fx"), "chevron-cursor"].filter(Boolean).join(" "));

  // Smooth scroll — the same Lenis 1.3.27 as the original (default lerp .1) tied to the GSAP clock
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    window.rkLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    if (window.gsap) { gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute("href").length < 2) return;
      const to = document.querySelector(a.getAttribute("href"));
      if (!to) return;
      e.preventDefault();
      lenis.scrollTo(to, { offset: 0 });
    });
  }
})();
