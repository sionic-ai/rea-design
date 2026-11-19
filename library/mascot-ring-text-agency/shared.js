// Shared by every page — mounts the fixed header (logo, menu, contact tape), menu panel, back-to-top and collaboration-form footer in one place,
// At width 992 and up, applies ScrollSmoother (smooth 2·smoothTouch .1·wholePixels), link text-line swap (.15s), and case·logo sliders (swiper).
(() => {
  const PAGES = [
    ["index.html", "Home"], ["about.html", "About"], ["service.html", "Services"],
    ["works.html", "Works"], ["news.html", "News"],
  ];
  const here = document.body.dataset.page || "home";
  const fileOf = { home: "index.html", about: "about.html", service: "service.html", "service-detail": "service.html", works: "works.html", news: "news.html", article: "news.html" };
  const glitch = (t) => `<span class="q-glitch" data-fx-part="glitch" data-text="${t}"><span data-fx-part="top">${t}</span><span data-fx-part="bot">${t}</span></span>`;
  const roll = (href, t) => `<a class="q-roll-link" href="${href}">${glitch(t)}</a>`;
  const logo = `<svg viewBox="0 0 92 22" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 3.5v15h9"/><circle cx="26" cy="11" r="7.5"/><path d="M53 6.5a7.5 7.5 0 1 0 1.5 6.5H47"/><circle cx="68" cy="11" r="7.5"/><circle cx="84" cy="4.5" r="1.6" fill="currentColor" stroke="none"/></svg>`;

  const chrome = document.querySelector('[data-slot="header"]');
  if (chrome) chrome.innerHTML = `
    <a class="q-logo" href="index.html" aria-label="Go home">${logo}</a>
    <div class="q-tape-wrap is-menu" data-label="Menu button English text"><button class="q-tape is-menu" type="button" data-q-menu data-fx="magnet-glitch-btn" aria-expanded="false">${glitch("Menu")}</button></div>
    <div class="q-tape-wrap is-contact" data-label="Contact button English text"><button class="q-tape is-contact" type="button" data-q-contact data-fx="magnet-glitch-btn">${glitch("Contact us")}</button></div>
    <nav class="q-menu" data-slot="menu-drawer" aria-label="Full menu" aria-hidden="true">
      <span class="wf-note">Menu panel · purple full panel covers in .6s · large links on the left (hover lime + underline .3s) · three service thumbnails on the right · close × rotates 90° on hover</span>
      <button class="q-menu__close" type="button" data-q-menu aria-label="Close"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11"/></svg></button>
      <div class="q-menu__main">
        <div class="q-menu__nav">${PAGES.slice(1).map(([h, t]) => `<a class="q-menu__link" href="${h}"${fileOf[here] === h ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</div>
        <ul class="q-menu__side" data-q-late="0.22">${[["Service 01", "service.html", "Several 3D icons · black background"], ["Service 02", "service-detail.html", "Website screen · person on stage"], ["Service 03", "service.html", "Posters and ads collection · collage"]].map(([t, h, l]) => `<li><a class="q-menu__svc" href="${h}"><span class="q-menu__thumb"><span class="wf-img" data-label="${l} · 4:3"></span></span><span><b>${glitch(t)}</b><small>Your short service description, in two lines, here.</small></span></a></li>`).join("")}</ul>
      </div>
    </nav>
    <div class="q-modal" role="dialog" aria-modal="true" aria-label="Contact Us" aria-hidden="true" data-slot="contact-modal">
      <div class="q-modal__dim" data-q-modal-close></div>
      <div class="q-modal__box"><button class="q-modal__close" type="button" data-q-modal-close aria-label="Close"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11"/></svg></button><div data-q-modal-body></div></div>
    </div>
    <div class="q-vmodal" role="dialog" aria-modal="true" aria-label="Reel Video" aria-hidden="true" data-slot="video-modal"><button class="q-modal__close" type="button" data-q-video-close aria-label="Close"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11"/></svg></button><div class="q-vmodal__box"><span class="wf-img wf-video wf-r-16x9" data-q-late="0.3" data-label="Showreel video · with sound · landscape 16:9 · click to play"></span></div></div>
    <button class="q-totop" type="button" aria-label="Back to top"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 8l4-4 4 4"/></svg></button>`;

  // Following cursor — original CustomCursor: one per page, always follows the mouse with .3s power3.out and turns on in .3s only over Case (green) · Service (purple)
  const cursorHost = document.getElementById("smooth-content") || document.body;
  const cursor = document.createElement("div");
  cursor.className = "q-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.dataset.slot = "cursor";
  cursor.innerHTML = `<span class="q-badge"><span class="q-badge__in"><svg class="q-badge__ring" viewBox="0 0 108 108"><defs><path id="q-cur-ring" d="M54 54m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0"/></defs><text><textPath href="#q-cur-ring" textLength="270" data-q-cursor-label>View case · View case · View case ·</textPath></text></svg><svg class="q-badge__arrow" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 19 19 7M9 7h10v10"/></svg></span></span>`;
  cursorHost.prepend(cursor);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) foot.innerHTML = `
    <span class="wf-note">Collaboration form footer · chip hover lime fill · input underline drawn in .4s · 3D blob illustration strip below</span>
    <div class="q-wrap" id="q-collab">
      <div class="q-collab">
        <i class="q-collab__glow" aria-hidden="true"></i>
        <div>
          <h2 class="q-collab__title" data-label="Your English title inviting collaboration here">Start a project</h2>
          <button class="q-call" type="button"><span class="q-call__face"><span class="wf-img" data-label="Contact person face"></span></span>${glitch("Book a call")}</button>
        </div>
        <form class="q-form" onsubmit="return false">
          <span class="q-form__label">Service</span>
          <div class="q-chips" data-q-chips><button type="button" class="q-chip">Service 01</button><button type="button" class="q-chip">Service 02</button><button type="button" class="q-chip">Service 03 Long Name</button></div>
          <span class="q-form__label">Budget</span>
          <div class="q-chips" data-q-chips><button type="button" class="q-chip">00 — 00</button><button type="button" class="q-chip">00 — 00</button><button type="button" class="q-chip">00 or more</button></div>
          <div class="q-fields">
            <label class="q-field"><input type="text" placeholder="Name"><span></span></label>
            <label class="q-field"><input type="email" placeholder="Email"><span></span></label>
            <label class="q-field"><input type="text" placeholder="Job title"><span></span></label>
            <div class="q-field q-select"><button class="q-select__btn" type="button" aria-expanded="false"><div>How did you hear about us?</div><svg class="q-field__chev" viewBox="0 0 10 10" fill="none" stroke="currentColor"><path d="M1.5 3.5 5 7l3.5-3.5"/></svg></button><ul class="q-select__list" hidden><li><button type="button">Option 1</button></li><li><button type="button">Option 2</button></li><li><button type="button">Option 3</button></li></ul></div>
            <label class="q-field is-wide"><input type="text" placeholder="Please describe your project in one line"><span></span></label>
          </div>
          <div class="q-form__end"><p>Add a one-line privacy notice here. <a href="#">Privacy policy</a></p><button class="q-submit" type="submit">Send</button></div>
        </form>
      </div>
    </div>
    <div class="q-footer__art"><div class="wf-img" data-label="Several 3D fur and gloss blob objects · purple, lime and white blobs on a black background · horizontal band 3:1"></div></div>
    <div class="q-wrap q-foot">
      <ul class="q-media">${["SNS 1", "SNS 2", "SNS 3", "SNS 4", "SNS 5"].map((t) => `<li>${roll("#", t)}</li>`).join("")}</ul>
      <div class="q-foot__nav">
        <ul class="q-list-small"><li>${roll("service.html", "Service 01")}</li><li>${roll("service-detail.html", "Service 02")}</li><li>${roll("service.html", "Service 03 Long Name")}</li></ul>
        <ul class="q-list-small"><li>${roll("about.html", "About")}</li><li>${roll("service.html", "Services")}</li></ul>
        <ul class="q-list-small"><li>${roll("works.html", "Works")}</li><li>${roll("works.html", "Industries")}</li><li>${roll("news.html", "News")}</li></ul>
      </div>
      <span class="q-foot__year">0000</span>
    </div>`;

  // Only one chip stays pressed
  document.querySelectorAll("[data-q-chips]").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest(".q-chip"); if (!b) return;
    g.querySelectorAll(".q-chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b && x.getAttribute("aria-pressed") !== "true")));
  }));

  // Select field — click to open the options list and change to the chosen text
  document.querySelectorAll(".q-select").forEach((sel) => {
    const btn = sel.querySelector(".q-select__btn"), list = sel.querySelector(".q-select__list"), txt = btn.querySelector("div");
    btn.addEventListener("click", () => { list.hidden = !list.hidden; btn.setAttribute("aria-expanded", String(!list.hidden)); });
    list.addEventListener("click", (e) => { const o = e.target.closest("button"); if (!o) return; txt.textContent = o.textContent; list.hidden = true; btn.setAttribute("aria-expanded", "false"); });
  });

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();

  // Original SmoothScroll — desktop only
  if (window.ScrollSmoother && document.getElementById("smooth-wrapper")) {
    gsap.registerPlugin(ScrollSmoother);
    mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
      const s = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 2, smoothTouch: 0.1, effects: false, wholePixels: true });
      window.qSmoother = s;
      return () => { window.qSmoother = null; s.kill(); };
    });
  }
  const scrollTo = (y) => (window.qSmoother ? window.qSmoother.scrollTo(y, true) : window.scrollTo({ top: typeof y === "number" ? y : document.querySelector(y)?.getBoundingClientRect().top + scrollY, behavior: "smooth" }));

  // Header entrance — after the hero is up (on home, index.js fires q:ready)
  const showHead = () => gsap.to(".q-logo, .q-tape-wrap", { opacity: 1, duration: reduce ? 0 : 0.6, ease: "power2.out", stagger: 0.08 });
  if (here === "home") addEventListener("q:ready", showHead, { once: true }); else showHead();

  // Link text line swap — original GlitchLink (.15s power2.out, back line .05s later) · desktop only
  mm.add("(min-width: 992px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
    const offs = [];
    document.querySelectorAll(".q-roll-link, .q-call").forEach((a) => {
      const top = a.querySelector('[data-fx-part="top"]'), bot = a.querySelector('[data-fx-part="bot"]');
      if (!top || !bot) return;
      // Original GlitchLink (.15s) and call button (.2s) — both get a css transition all .2s laid over the text line
      const d = a.classList.contains("q-call") ? 0.2 : 0.15;
      gsap.set([top, bot], { y: 0 });
      gsap.set(bot, { yPercent: 100, opacity: 0 });
      const tl = gsap.timeline({ paused: true })
        .to(top, { yPercent: -100, opacity: 0, duration: d, ease: "power2.out" }, 0)
        .fromTo(bot, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: d, ease: "power2.out" }, 0.05);
      const on = () => tl.play(), off = () => tl.reverse();
      a.addEventListener("mouseenter", on); a.addEventListener("mouseleave", off);
      offs.push(() => { a.removeEventListener("mouseenter", on); a.removeEventListener("mouseleave", off); tl.revert(); gsap.set([top, bot], { clearProps: "transform,opacity" }); });
    });
    return () => offs.forEach((f) => f());
  });

  // Dialog (menu·contact·showreel) — original Radix Dialog: the backdrop turns on in .3s ease-out (off in .3s ease-in) and the inside goes from transparent·.95x → 1 (.3s), and on close to .9x
  const dialogs = new Map();
  // Pause 3D drawing the moment the button that opens the window over the panel is pressed (resume when the window closes) — drawing while covered delays the window
  const hold = (on) => document.documentElement.classList.toggle("fx-hold", on);
  document.addEventListener("pointerdown", (e) => { if (e.target.closest("[data-q-menu], [data-q-contact], [data-q-video]")) hold(true); }, true);
  // The text-line button attached late inside has its lower line come down to its place (100% · transparent) with a css transition .2s — same as the original Button applying yPercent 100 right after attaching
  const settle = (n) => n.querySelectorAll(".q-glitch > span + span").forEach((b) => {
    b.style.transition = "none"; b.style.transform = "none"; b.style.opacity = "1";
    requestAnimationFrame(() => requestAnimationFrame(() => { b.style.transition = ""; b.style.transform = ""; b.style.opacity = ""; }));
  });
  // Menu and contact windows hide three headers (the original measurement delay differs per window), the showreel window only covers above the header
  const dialog = (el, onToggle, onLate) => {
    let t = 0;
    const set = (open) => {
      clearTimeout(t);
      el.setAttribute("aria-hidden", String(!open));
      el.dataset.state = open ? "open" : "closed";
      if (!open) t = setTimeout(() => el.removeAttribute("data-state"), reduce ? 0 : 300);
      window.qSmoother?.paused(open);
      if (!open) setTimeout(() => { if (![...dialogs.keys()].some((d) => d.dataset.state === "open")) hold(false); }, reduce ? 0 : 300);
      else hold(true);
      // Inner content is attached late after the window opens — the original loads it when opening the form·Vimeo, and the size appears about .4s later
      el.querySelectorAll("[data-q-late]").forEach((n) => {
        clearTimeout(n._late);
        if (!open) return;
        n.hidden = true;
        n._late = setTimeout(() => { n.hidden = false; onLate?.(n); }, reduce ? 0 : +n.dataset.qLate * 1000);
      });
      onToggle?.(open);
    };
    dialogs.set(el, set);
    return set;
  };
  addEventListener("keydown", (e) => { if (e.key === "Escape") dialogs.forEach((set, el) => el.dataset.state === "open" && set(false)); });

  const menu = document.querySelector(".q-menu");
  if (menu) {
    const setMenu = dialog(menu, (open) => {
      document.querySelectorAll("[data-q-menu][aria-expanded]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
      document.documentElement.classList.toggle("is-menu", open);
    }, settle);
    document.querySelectorAll("[data-q-menu]").forEach((b) => b.addEventListener("click", () => setMenu(menu.dataset.state !== "open")));
  }

  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const cx = gsap.quickTo(cursor, "x", { duration: 0.3, ease: "power3.out" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.3, ease: "power3.out" });
    const label = cursor.querySelector("[data-q-cursor-label]"), badge = cursor.querySelector(".q-badge");
    const words = { green: "View case", purple: "Learn more" };
    let lx = 0, ly = 0;
    const offY = () => (window.qSmoother ? scrollY : 0);
    // The original follows the mouse only while a section using the cursor is on screen (IntersectionObserver)
    const zones = new Set([...document.querySelectorAll("[data-q-cursor]")].map((el) => el.closest("section") || el));
    const seen = new Set();
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && e.intersectionRatio > 0 ? seen.add(e.target) : seen.delete(e.target))), { threshold: [0, 0.01] });
    zones.forEach((z) => io.observe(z));
    // The original listens to mouse movement only on the cursor zone element (outside it the cursor stands still)
    const move = (e) => { lx = e.clientX; ly = e.clientY; if (seen.size) { cx(lx); cy(ly + offY()); } };
    zones.forEach((z) => z.addEventListener("mousemove", move, { passive: true }));
    addEventListener("scroll", () => seen.size && cy(ly + offY()), { passive: true });
    const show = (v) => { gsap.to(cursor, { opacity: v ? 1 : 0, duration: 0.3, ease: "power2.out" }); };
    document.querySelectorAll("[data-q-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const v = el.dataset.qCursor;
        badge.classList.toggle("is-purple", v === "purple");
        label.textContent = `${words[v] || words.green} · `.repeat(3);
        show(true);
      });
      el.addEventListener("mouseleave", () => show(false));
    });
  }

  // Showreel — clicking the mascot or the small video cell opens a black full-screen video window
  const vm = document.querySelector(".q-vmodal");
  if (vm) {
    const setV = dialog(vm);
    // The original showreel window opens slightly later than other windows (measured 161~171ms vs menu 153ms) — because the video window is attached then
    document.querySelectorAll("[data-q-video]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); setTimeout(() => setV(true), reduce ? 0 : 25); }));
    vm.querySelector("[data-q-video-close]").addEventListener("click", () => setV(false));
  }
  // Contact — the collaboration form opens as a dialog (black 60% + 12px blur). The link on the footer side scrolls
  document.querySelectorAll('a[href="#q-collab"]').forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); scrollTo("#q-collab"); }));
  const modal = document.querySelector(".q-modal");
  const form = document.querySelector(".q-collab");
  if (modal && form) {
    modal.querySelector("[data-q-modal-body]").appendChild(form.cloneNode(true));
    modal.querySelector("[data-q-modal-body]").dataset.qLate = "0.32";
    // When the form mounts, the lower line of the button text drops into place (100%) with a css transition of .2s — same as the original Button applying yPercent 100 right on mount
    const setM = dialog(modal, null, settle);
    document.querySelectorAll("[data-q-contact]").forEach((b) => b.addEventListener("click", () => setM(true)));
    modal.querySelectorAll("[data-q-modal-close]").forEach((b) => b.addEventListener("click", () => setM(false)));
  }
  // Form card border glow — original Footer: moves the mouse position over the card (px relative to the card) to --x/--y over .2s. The glow layer is drawn on desktop only.
  // The contact window clones the footer card as is, so the same reactions attach (the original contact window also has the same light-plate CSS)
  mm.add("(min-width: 992px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
    const offs = [...document.querySelectorAll(".q-collab")].map((card) => {
      const move = (e) => { const b = card.getBoundingClientRect(); gsap.to(card, { "--x": `${e.clientX - b.left}px`, "--y": `${e.clientY - b.top}px`, duration: 0.2 }); };
      card.addEventListener("mousemove", move);
      return () => { card.removeEventListener("mousemove", move); gsap.killTweensOf(card); card.style.removeProperty("--x"); card.style.removeProperty("--y"); };
    });
    return () => offs.forEach((f) => f());
  });
  const top = document.querySelector(".q-totop");
  if (top) {
    top.addEventListener("click", () => scrollTo(0));
    ScrollTrigger.create({ start: () => innerHeight, end: "max", onToggle: (s) => top.classList.toggle("is-on", s.isActive) });
  }

  // Work slider — original swiper (loop · 1.18 slides · .5s · gap 20, phone 1 slide · 16)
  if (window.Swiper) {
    document.querySelectorAll("[data-q-cases]").forEach((box) => {
      const el = box.querySelector(".swiper");
      const per = +(box.dataset.qPer || 1.18);
      const sw = new Swiper(el, {
        loop: true, speed: 500, slidesPerView: per, spaceBetween: 20,
        breakpoints: { 0: { slidesPerView: per, spaceBetween: 16 }, 992: { slidesPerView: per, spaceBetween: 20 } },
      });
      box.querySelector("[data-prev]")?.addEventListener("click", () => sw.slidePrev());
      box.querySelector("[data-next]")?.addEventListener("click", () => sw.slideNext());
    });
    // Logo strip — original: loop · width auto · 2s slide · if untouched for 15s it pushes the visible amount at once in 2s (checked every 1s)
    document.querySelectorAll("[data-q-logos]").forEach((el) => {
      // Advances after 15s untouched — mouse movement counts as touch (the original counts only drags and swipes)
      let touched = Date.now();
      addEventListener("pointermove", () => (touched = Date.now()), { passive: true });
      const sw = new Swiper(el, { loop: true, grabCursor: true, slidesPerView: "auto", spaceBetween: 0, speed: 2000,
        on: { slideChange: () => (touched = Date.now()), touchStart: () => (touched = Date.now()), touchMove: () => (touched = Date.now()) } });
      const visible = () => { let n = 0, w = 0; for (let i = sw.activeIndex; i < sw.slides.length; i++) { const s = sw.slides[i].offsetWidth; if (w + s <= sw.width) { n++; w += s; } else break; } return Math.max(1, n); };
      const real = el.querySelectorAll(".swiper-slide:not(.swiper-slide-duplicate)").length;
      // Pushes only while the band is on screen — stops once scrolled past the hero (only prevents running while unseen, looks the same)
      let shown = true;
      new IntersectionObserver(([e]) => (shown = e.isIntersecting && e.intersectionRatio > 0), { threshold: [0, 0.01] }).observe(el);
      if (!reduce) setInterval(() => { if (shown && scrollY < innerHeight && Date.now() - touched >= 15000) sw.slideToLoop((sw.realIndex + visible()) % real, 2000); }, 1000);
    });
  }

  // Graffiti title — a spray-painted word is drawn (original video plays once) and moves down 90% from the section top to center,
  // Lime title lines go from blur 10px · −40px over 1.1s power3.out staggered by .15 (at 80% of the screen, reversed when scrolled back up)
  document.querySelectorAll(".q-graffiti").forEach((sec) => {
    const art = sec.querySelector(".q-graffiti__art"), word = art?.querySelector("text"), lines = sec.querySelectorAll(".q-graffiti__title .q-ln");
    if (reduce) return;
    if (word) gsap.fromTo(word, { strokeDasharray: 5000, strokeDashoffset: 5000 }, { strokeDashoffset: 0, duration: 2.4, ease: "power1.inOut", scrollTrigger: { trigger: sec, start: "top 85%", toggleActions: "play none none none" } });
    mm.add("(min-width: 992px)", () => {
      const a = art && gsap.to(art, { yPercent: 90, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "center center", scrub: true } });
      gsap.set(lines, { opacity: 0, y: -40, filter: "blur(10px)" });
      const b = gsap.to(lines, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.1, ease: "power3.out", stagger: 0.15, scrollTrigger: { trigger: lines[0] || sec, start: "top 80%", toggleActions: "play none none reverse" } });
      return () => { a?.scrollTrigger?.kill(); b.scrollTrigger?.kill(); gsap.set(lines, { clearProps: "all" }); };
    });
  });

  // Big sentence that clears line by line — original animatedText: within progress .45 from the section entering from the bottom of the screen (bottom+100%) until it exits at the top
  // Passing through row i’s window (width 1/max(3, row count) × 1.2), the right inset clears from 100% → 0
  document.querySelectorAll("[data-q-lines]").forEach((box) => {
    const fills = [...box.querySelectorAll(".q-li__fill")], r = fills.length;
    if (!r) return;
    if (reduce) return gsap.set(fills, { clipPath: "inset(0 0% 0 0)" });
    const t = 1 / Math.max(3, r), w = t + 0.2 * t;
    ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom+=100% top", onUpdate: ({ progress }) => {
      const i = gsap.utils.clamp(0, 1, progress / 0.45);
      fills.forEach((f, k) => {
        const s = k / Math.max(1, r - 1), n = Math.max(0, s - w / 2), o = Math.min(1, s + w / 2);
        const u = Math.round((1 - (i <= n ? 0 : i >= o ? 1 : (i - n) / (o - n))) * 1e4) / 100;
        f.style.clipPath = `inset(0 ${u}% 0 0)`;
      });
    } });
  });

  // Accordion list (Careers) — tap to open and the height unfolds in .4s
  document.querySelectorAll(".q-acc").forEach((a) => {
    const head = a.querySelector(".q-acc__head"), body = a.querySelector(".q-acc__body");
    head?.addEventListener("click", () => {
      const open = !a.classList.contains("is-open");
      a.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
      gsap.to(body, { height: open ? "auto" : 0, duration: reduce ? 0 : 0.4, ease: "power2.inOut", onComplete: () => ScrollTrigger.refresh() });
    });
  });

  // ---------- Award disc ----------
  if (document.querySelector("[data-q-win]")) mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
    const t = gsap.to("[data-q-win]", { y: "-25%", ease: "none", scrollTrigger: { trigger: "[data-q-win]", start: "center-=25% bottom", end: "bottom top", scrub: true } });
    return () => t.scrollTrigger?.kill();
  });

  // ---------- Five strengths — pinned, each section rotates in and out on the Y axis ----------
  mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
    const sec = document.querySelector(".q-steps"); if (!sec) return;
    const slides = [...sec.querySelectorAll("[data-q-step]")];
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top top", end: "bottom+=300% bottom+=25%", pin: true, pinSpacing: true, scrub: 1 } });
    const wrap = sec.querySelector("[data-q-steps-wrap]");
    const span = slides.length * 0.5 + 0.5;
    tl.fromTo("[data-q-steps-bg] .wf-img", { yPercent: 0 }, { yPercent: -23, ease: "none", duration: span }, 0)
      .to(wrap, { yPercent: -30, y: () => innerHeight * 0.8 - wrap.clientHeight, ease: "none", duration: span * 0.82 }, span * 0.18);
    slides.forEach((s, i) => {
      tl.fromTo(s, { opacity: 0, rotationY: -90 }, { opacity: 1, rotationY: 0, duration: 0.5, ease: "power2.out" }, i * 0.5)
        .to(s, { opacity: i === slides.length - 1 ? 1 : 0, rotationY: i === slides.length - 1 ? 0 : 90, duration: 0.5, ease: "power2.out" }, i * 0.5 + 0.5);
    });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); gsap.set(slides, { clearProps: "all" }); };
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();

// Review person tab — switches to the tapped person and the text floats up again in .6s
(() => {
  document.querySelectorAll(".q-quote").forEach((q) => {
    const people = [...q.querySelectorAll(".q-person")], body = q.querySelector("[data-q-quote]");
    people.forEach((p) => p.addEventListener("click", () => {
      people.forEach((x) => x.classList.toggle("is-on", x === p));
      if (window.gsap && body) gsap.fromTo(body, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    }));
  });
})();
