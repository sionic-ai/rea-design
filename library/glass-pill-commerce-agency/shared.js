// Shared by the whole site — glass header · menu pill (search row folds on scroll down) · phone menu · notification panel (opens by itself at the very bottom) · city clock · fade-up observer · Lenis · Hero parallax.
// Values read from the original: Lenis 1.0.42 lerp .2, rise 1.2s cubic-bezier(.22,1,.36,1)·40px·30% of the screen (minus 10% at the bottom), hero text 1s ‹cubic›, background 1.1x → 30% with scroll.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page;
  const D = (window.D = window.D || {});
  D.reduce = reduce;
  if (window.gsap) {
    gsap.registerPlugin(...[window.ScrollTrigger, window.CustomEase].filter(Boolean));
    if (window.CustomEase) { CustomEase.create("cubic", "M0,0 C0.22,1 0.36,1 1,1"); CustomEase.create("expo", "M0,0 C0.16,1 0.3,1 1,1"); }
  }

  const ARROW = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5"/></svg>`;
  D.arrow = ARROW;
  const LOGO = `<svg viewBox="0 0 120 16" aria-hidden="true"><rect x="0" y="2" width="12" height="12" rx="6"/><rect x="18" y="2" width="98" height="12" rx="2" opacity=".85"/></svg>`;
  const ICON = {
    globe: `<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="7.5"/><path d="M1.5 9h15M9 1.5c2.2 2.4 2.2 12.6 0 15M9 1.5c-2.2 2.4-2.2 12.6 0 15"/></svg>`,
    bell: `<svg viewBox="0 0 14 14"><path d="M3 10V6.5a4 4 0 0 1 8 0V10l1 1H2Zm3 2.2h2"/></svg>`,
    close: `<svg viewBox="0 0 14 14"><path d="m3 3 8 8M11 3l-8 8"/></svg>`,
    mail: `<svg viewBox="0 0 14 14"><rect x="1.5" y="3" width="11" height="8" rx="1"/><path d="m1.5 3.5 5.5 4 5.5-4"/></svg>`,
    search: `<svg viewBox="0 0 12 12"><circle cx="5" cy="5" r="3.6"/><path d="m7.7 7.7 3 3"/></svg>`,
    ig: `<svg viewBox="0 0 14 14"><rect x="1.5" y="1.5" width="11" height="11" rx="3"/><circle cx="7" cy="7" r="2.6"/></svg>`,
    x: `<svg viewBox="0 0 14 14"><path d="m2 2 10 10M12 2 2 12"/></svg>`,
    in: `<svg viewBox="0 0 14 14"><rect x="1.5" y="1.5" width="11" height="11" rx="1"/><path d="M4.5 6v4M4.5 4v.1M7 10V6m0 1.5c0-1 3-2 3 0V10"/></svg>`,
  };
  const NAV = [["Work", "works.html", "works"], ["Service", "service.html", "service"], ["News", "news.html", "news"], ["Partner", "index.html#partners", "partners"], ["Inquiry", "#footer", "contact"]];

  function renderChrome() {
    const head = document.querySelector("[data-slot=header]");
    head.className = "d-head";
    head.innerHTML = `
      <div class="d-head__in">
        <button class="d-ubtn d-glass d-burger" type="button" aria-label="Menu"><span></span><span></span></button>
        <div class="d-brand d-glass t-cap"><a class="d-brand__logo" href="index.html" aria-label="Back to start">${LOGO}</a><span class="d-brand__loc">${ICON.globe}KR</span></div>
        <div class="d-nav d-glass t-cap" data-visible="true" data-default-visible="true">
          <nav class="d-nav__links">${NAV.map(([t, h, k]) => `<a class="d-nav__link" href="${h}" data-key="${k}"${k === page || (page === "detail" && k === "works") ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
          <button class="d-search" type="button">${ICON.search}<span>Find <em>Work, news and so on…</em></span><kbd>/</kbd></button>
        </div>
        <div class="d-utils"><button class="d-ubtn d-glass" type="button" aria-label="Notice" data-note-toggle data-active="false"><span class="d-ubtn__i is-bell">${ICON.bell}</span><span class="d-ubtn__i is-close">${ICON.close}</span></button><a class="d-ubtn d-glass" href="#footer" aria-label="Inquiry">${ICON.mail}</a></div>
      </div>`;
    head.insertAdjacentHTML("afterend", `
      <nav class="d-mnav" data-slot="mobile-menu">${NAV.map(([t, h]) => `<a href="${h}">${t}</a>`).join("")}</nav>
      <div class="d-searchmenu t-body" data-slot="search-menu" role="dialog" aria-label="Find"><span>${ICON.search}</span><input type="search" placeholder="Find work, news, services" aria-label="Find"><kbd class="t-cap">esc</kbd></div>
      <aside class="d-note d-glass t-cap" data-slot="notification-menu" aria-label="Notice">
        <p class="d-note__title">News headline</p>
        <a class="d-note__card" href="news.html"><div class="wf-img d-ph" style="--r:1" data-label="Living room window dining table · Daylight · Square"></div><span>Work name 1</span></a>
        <a class="d-note__card" href="news.html"><div class="wf-img d-ph" style="--r:1" data-label="Face of a person in a helmet · studio lighting · square"></div><span>Work name 2</span></a>
        <div class="d-clocks">${[["City 1", "America/Los_Angeles"], ["City 2", "America/New_York"], ["City 3", "Europe/Studio"]].map(([c, z]) => `<div class="d-clock" data-timezone="${z}"><div class="d-clock__face"><i class="d-clock__hand d-clock__h"></i><i class="d-clock__hand d-clock__m"></i><i class="d-clock__hand d-clock__s"></i></div><span>${c}</span><span class="t-dim" data-time>00:00</span></div>`).join("")}</div>
        <a class="d-note__card" href="works.html"><div class="wf-img d-ph" style="--r:1" data-label="White T-shirt on a hanger · black background · square"></div><span>Shop</span></a>
        <a class="d-note__card" href="#footer"><div class="wf-img d-ph" style="--r:1" data-label="Smiling laptop illustration · blue line art · square"></div><span>Let’s work together <span class="t-dim">Your one-liner here</span></span></a>
      </aside>`);
    const foot = document.querySelector("[data-slot=footer]");
    if (foot) {
      foot.className = "d-foot";
      foot.id = "footer";
      foot.innerHTML = `
        <div class="d-foot__in">
          <div class="d-foot__cta"><h2 class="t-h2">Your company in a single sentence here<br>Add a two-line sentence.</h2><a class="d-foot__go t-cap" href="#footer">Work with us${ARROW}</a></div>
          <div class="d-foot__info t-cap">
            <div class="d-foot__col"><p class="t-dim">Company</p><a href="#footer">Inquiry</a><a href="#footer">Hiring</a><a href="#footer">Research institute</a><a href="#footer">Previous notice</a><a href="#footer">Shop</a><a href="#footer">Your one-line motto here</a></div>
            <form class="d-foot__form" onsubmit="return false"><p>Your newsletter notice here, one line.</p><input type="email" placeholder="Email address*" aria-label="Email address"><p class="d-foot__fine">Your four-line consent notice here. You can stop receiving at any time, and for details see <a href="#footer">Privacy policy</a>Is located at</p><button class="d-foot__submit t-h5" type="submit">Send</button></form>
          </div>
        </div>
        <div class="d-sub t-cap"><span class="d-sub__links"><span>${ICON.globe}</span>Country</span><span class="d-sub__links"><a href="#footer" aria-label="Channel 1">${ICON.ig}</a><a href="#footer" aria-label="Channel 2">${ICON.x}</a><a href="#footer" aria-label="Channel 3">${ICON.in}</a><a href="mailto:hello@example.com">${ICON.mail} hello@example.com</a><a href="#footer">Privacy policy</a><a href="#footer">Do not sell my information</a></span></div>`;
    }
  }

  // ── Lenis 1.0.42 lerp .2 — runs on its own requestAnimationFrame loop like the original
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.2 });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  }
  D.lenis = lenis;
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: -200 }); else t.scrollIntoView();
  });

  // ── Menu pill — scrolling down collapses the search row leaving only the glass plate, scrolling up expands it again (.8s)
  function initNav() {
    const nav = document.querySelector(".d-nav");
    let last = document.documentElement.scrollTop;
    addEventListener("scroll", () => {
      const y = document.documentElement.scrollTop;
      if (y < last) { if (nav.dataset.defaultVisible === "true" || y >= 300) nav.dataset.visible = "true"; }
      else nav.dataset.visible = "false";
      last = y;
    }, { passive: true });
    const head = document.querySelector(".d-head"), mnav = document.querySelector(".d-mnav");
    head.querySelector(".d-burger").addEventListener("click", () => {
      const open = head.classList.toggle("is-open");
      requestAnimationFrame(() => mnav.classList.toggle("is-in", open));
    });
  }

  // ── Search panel — clicking the search line or pressing the / key raises a centered 640px panel up 70px as it turns on (.3s)
  function initSearch() {
    const menu = document.querySelector(".d-searchmenu"), input = menu.querySelector("input");
    const set = (open) => { menu.classList.toggle("is-open", open); if (open) setTimeout(() => input.focus({ preventScroll: true }), 50); };
    document.querySelector(".d-search").addEventListener("click", () => set(!menu.classList.contains("is-open")));
    addEventListener("keydown", (e) => {
      if (e.key === "Escape") set(false);
      else if (e.key === "/" && !e.target.closest("input, textarea")) { e.preventDefault(); set(true); }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".d-searchmenu, .d-search")) set(false); });
  }

  // ── Notification panel — opened and closed with the bell, opens on reaching the page bottom and closes when scrolling up. Clock ticks every second
  function initNote() {
    const note = document.querySelector(".d-note"), btn = document.querySelector("[data-note-toggle]");
    const set = (open) => { note.classList.toggle("is-open", open); btn.dataset.active = open ? "true" : "false"; };
    btn.addEventListener("click", () => set(!note.classList.contains("is-open")));
    let auto = false, last = scrollY;
    if (matchMedia("(pointer: fine)").matches) addEventListener("scroll", () => {
      const atEnd = Math.ceil(scrollY + innerHeight) >= document.body.scrollHeight;
      if (atEnd && !note.classList.contains("is-open")) { auto = true; set(true); }
      else if (scrollY < last && auto) { auto = false; set(false); }
      last = scrollY;
    }, { passive: true });
    addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
    const tick = () => document.querySelectorAll("[data-timezone]").forEach((c) => {
      const d = new Date(new Date().toLocaleString("en-US", { timeZone: c.dataset.timezone }));
      const h = String(d.getHours()).padStart(2, "0"), m = String(d.getMinutes()).padStart(2, "0");
      const out = c.querySelector("[data-time]") || (c.matches("[data-time]") ? c : null);
      if (out) out.textContent = `${h}:${m}`;
      c.style.setProperty("--hours", d.getHours());
      c.style.setProperty("--minutes", d.getMinutes());
      c.style.setProperty("--seconds", d.getSeconds());
      c.dataset.isDaytime = String(d.getHours() > 6 && d.getHours() < 20);
    });
    tick();
    setInterval(tick, 1000);
  }

  // ── Rise — when the original IntersectionObserver (threshold .3, minus 10% at the bottom) fires, after a delay (ms) data-animate-viewport=false
  function initReveal() {
    const io = new IntersectionObserver((list) => list.forEach((en) => {
      if (!en.isIntersecting) return;
      const t = en.target;
      setTimeout(() => { t.dataset.animateViewport = "false"; }, +(t.dataset.animationDelay || 0));
      io.unobserve(t);
    }), { rootMargin: "0% 0% -10% 0%", threshold: 0.3 });
    document.querySelectorAll('[data-animate-viewport="true"]').forEach((el) => (reduce ? (el.dataset.animateViewport = "false") : io.observe(el)));
  }

  // ── Hero — text from 40px below and transparent in 1s ”cubic”, while the background held at 1.1x moves down 30% with scroll
  function initHero() {
    document.querySelectorAll("[data-hero]").forEach((hero) => {
      const text = hero.querySelector("[data-hero-text]"), media = hero.querySelector("[data-hero-media]");
      if (!window.gsap || reduce) return;
      if (text) gsap.fromTo(text, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: "cubic" });
      if (media) parallax(media);
    });
  }
  const parallax = (el, y = "30%", s = 1.1) => {
    if (!window.ScrollTrigger || reduce) return;
    gsap.set(el, { scale: s });
    gsap.to(el, { y, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
  };
  D.parallax = parallax;

  renderChrome();
  initNav();
  initNote();
  initSearch();
  initReveal();
  initHero();
  if (window.ScrollTrigger) addEventListener("load", () => ScrollTrigger.refresh());
})();
