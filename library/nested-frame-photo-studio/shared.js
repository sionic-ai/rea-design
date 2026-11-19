// Header, drawer, footer, transition curtain, scrollbar and image lightbox are drawn in one place so all four pages share the same frame.
// Page scripts pull the same line-raise and typing values as the original via FW.line(), FW.type() and FW.cta().
// The original is a barba 2.10.3 SPA, so the header and footer are left as they are and <main> Only the box gets swapped — register the page script beforehand with FW.page(name, attach)
// Attached each time a box enters and removed when it leaves (grouped with gsap.context so tweens and ScrollTrigger get cleaned up together).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const FW = (window.FW = { reduced, lenis: null, pages: {} });
  FW.page = (ns, init) => (FW.pages[ns] = init);

  const SERVICES = [
    ["service.html", "Service One"],
    ["film.html", "Service Two"],
    ["staging.html", "Service Three"],
    ["#", "Service Four"],
  ];

  // Fills the original wordmark (3597:321) spot with placeholder lettering of the same ratio and thin stroke
  const WORDMARK =
    '<svg viewBox="0 0 3597 321" aria-hidden="true"><text x="0" y="321" textLength="3597" lengthAdjust="spacing" ' +
    'style="font-family: var(--kf-font-sans)" font-weight="200" font-size="458" fill="currentColor">STUDIONAME</text></svg>';

  const item = (href, label, extra = "") =>
    `<a class="fw-nav__item" href="${href}"${extra}><span class="fw-nav__plus">+</span>${label}</a>`;

  const head = document.querySelector("[data-slot=header]");
  if (head) {
    head.classList.add("fw-head");
    head.innerHTML = `
      <div class="fw-head__layer is-base">
        <div class="fw-logo"><a href="index.html" aria-label="Home"><span class="fw-wordmark">${WORDMARK}</span></a></div>
        <div class="fw-head__line"></div>
        <nav class="fw-nav" aria-label="Main menu" data-label="Your menu English name here">
          <div class="fw-nav__group is-left">
            <div class="fw-drop">
              <button class="fw-nav__item" type="button" aria-expanded="false"><span class="fw-nav__plus">+</span>Services</button>
              <div class="fw-drop__list" aria-hidden="true" data-label="Your service name in English here">${SERVICES.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div>
            </div>
            ${item("#", "Menu 2")}${item("#", "Menu 3")}${item("#", "About")}
          </div>
          <div class="fw-nav__group is-right">${item("#", "Menu 5")}${item("#", "Contact")}</div>
          <button class="fw-menu-btn" type="button" aria-expanded="false" aria-label="Open Menu"><span class="fw-menu-btn__icon">+</span><span>Menu</span></button>
        </nav>
      </div>`;
  }

  const menu = document.createElement("div");
  menu.className = "fw-menu";
  menu.setAttribute("aria-hidden", "true");
  menu.innerHTML = `
    <button class="fw-menu__close" type="button" aria-label="Close Menu"><span>×</span></button>
    <div class="fw-menu__inner">
      <nav class="fw-menu__nav" data-label="Your menu English name here">
        <a class="fw-menu__link" href="index.html">Home</a>
        <div class="fw-menu__group">
          <span class="fw-menu__link is-cat">Services</span>
          <div class="fw-menu__sub">${SERVICES.map(([h, t]) => `<a class="fw-menu__link is-sub" href="${h}">${t}</a>`).join("")}</div>
        </div>
        <a class="fw-menu__link" href="#">Menu 2</a><a class="fw-menu__link" href="#">Menu 3</a>
        <a class="fw-menu__link" href="#">About</a><a class="fw-menu__link" href="#">Menu 5</a><a class="fw-menu__link" href="#">Contact</a>
      </nav>
      <div class="fw-menu__social"><a href="#">SNS 1</a><a href="#">SNS 2</a></div>
    </div>`;
  body.append(menu);

  const foot = document.querySelector("[data-slot=footer]");
  if (foot) {
    foot.classList.add("fw-foot");
    const link = (t, h = "#") => `<li><a class="fw-foot__link" href="${h}">${t}</a></li>`;
    foot.innerHTML = `
      <div class="fw-foot__in">
        <div class="fw-foot__logo"><a href="index.html" aria-label="Home"><span class="fw-wordmark">${WORDMARK}</span></a></div>
        <div class="fw-foot__grid">
          <div class="fw-foot__col is-nav" data-label="Your menu English name here">
            <h2 class="fw-foot__label"><span class="fw-foot__plus">+</span>Services</h2>
            <ul class="fw-foot__list">${SERVICES.map(([h, t]) => link(t, h)).join("")}${link("Menu 2")}${link("Menu 3")}</ul>
            <ul class="fw-foot__list is-gap">${link("About")}${link("Menu 5")}${link("Contact")}</ul>
          </div>
          <div class="fw-foot__col is-contact">
            <h2 class="fw-foot__label">Contact</h2>
            <ul class="fw-foot__list is-mono">${link("hello@example.com")}${link("+00 (0)0 00 00 00 00")}</ul>
            <h2 class="fw-foot__label is-gap">SNS</h2>
            <ul class="fw-foot__list"><li><a class="fw-foot__link" href="#"><span class="fw-foot__plus">+</span>SNS 1</a></li></ul>
          </div>
          <div class="fw-foot__col is-company">
            <h2 class="fw-foot__label" data-label="Your company English name here">Studio Name</h2>
            <ul class="fw-foot__list is-mono"><li>City Name</li><li>Business number 00000000</li></ul>
          </div>
        </div>
      </div>
      <div class="fw-foot__legal"><div><span>© 2026 STUDIO NAME</span></div><div><a href="#">Terms of service</a><a href="#">Privacy policy</a></div></div>`;
  }

  const trans = document.createElement("div");
  trans.className = "fw-trans";
  trans.innerHTML = `<div class="fw-trans__plane is-a"><span class="fw-trans__seam"></span></div><div class="fw-trans__plane is-b"></div>
    <div class="fw-trans__copy"><span class="fw-trans__kicker">Next scene</span><div class="fw-trans__mask"><p class="fw-trans__title">STUDIO NAME</p></div></div>`;
  body.append(trans);

  const bar = document.createElement("div");
  bar.className = "fw-bar";
  bar.innerHTML = '<div class="fw-bar__track"></div><div class="fw-bar__thumb"></div>';
  body.append(bar);

  const box = document.createElement("div");
  box.className = "fw-box";
  box.setAttribute("aria-hidden", "true");
  box.innerHTML = `<div class="fw-box__back"></div><div class="fw-box__stage">
      <div class="fw-box__meta"><span class="fw-box__i">01</span><span class="fw-box__rule"></span><span class="fw-box__n">01</span></div>
      <figure class="fw-box__fig"><div class="wf-img fw-box__media"></div><video class="fw-box__video" controls playsinline preload="metadata"></video></figure>
      <button class="fw-box__close" type="button" aria-label="Close">×</button>
      <button class="fw-box__nav is-prev" type="button" aria-label="Previous">←</button>
      <button class="fw-box__nav is-next" type="button" aria-label="Next">→</button></div>`;
  body.append(box);

  const skip = document.createElement("a");
  skip.className = "fw-skip";
  skip.href = "#main-content";
  skip.textContent = "Skip to Content";
  body.prepend(skip);
  const announcer = document.createElement("div");
  announcer.className = "fw-sr";
  announcer.setAttribute("aria-live", "polite");
  body.append(announcer);

  // ── Smooth scroll: original Lenis 1.3.26 values as is
  if (!reduced && window.Lenis) {
    const lenis = (FW.lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, touchMultiplier: 1.5, smoothWheel: true, syncTouch: false }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Text helper
  FW.line = (targets, vars = {}) =>
    gsap.to(targets, { y: "0%", rotate: 0, opacity: 1, duration: 1.05, stagger: 0.08, ease: "power3.out", ...vars });

  // Typewriter effect lighting uppercase labels one letter at a time — the original is 0.015~0.02s per letter
  FW.type = (el) => {
    if (!el) return [];
    if (!el.dataset.typed) {
      const lines = el.innerHTML.split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]+>/g, "").trim());
      el.innerHTML = lines
        .map((ln) => `<span class="tl">${[...ln].map((c) => `<span class="ch">${c}</span>`).join("")}</span>`)
        .join("");
      el.dataset.typed = "1";
    }
    return [...el.querySelectorAll(".ch")];
  };

  FW.plus = (wrap, tl, at = 0) => {
    const [v, h] = wrap ? wrap.querySelectorAll("line") : [];
    if (v) tl.to(v, { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, at);
    if (h) tl.to(h, { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, at + 0.08);
  };

  FW.cta = (sec) => {
    if (!sec) return;
    const label = sec.querySelector(".fw-cta__label");
    const lines = sec.querySelectorAll(".fw-cta__line");
    const main = sec.querySelector(".fw-cta__main");
    const sub = sec.querySelector(".fw-cta__sub");
    if (reduced) return;
    gsap.set(label, { opacity: 0 });
    gsap.set(sub, { opacity: 0, y: 15 });
    gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 70%" } })
      .to(label, { opacity: 0.6, duration: 1, ease: "power2.out" }, 0)
      .to(lines, { y: "0%", rotation: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" }, 0.2)
      .to(main, { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "power4.inOut" }, 0.6)
      .to(sub, { opacity: 0.6, y: 0, duration: 0.8, ease: "power2.out" }, 1.2);
  };

  // ── Header: a white cover layer overlaps the photo (clipped to the photo area), and on Home the logo · line · menu come in following the loader stages.
  // The header stays during transitions so the overlay layer is always kept, and on pages without a photo surface ([data-nav-surface]) it is fully clipped and hidden
  const base = head?.querySelector(".is-base");
  let over = null;
  if (head) {
    over = base.cloneNode(true);
    over.className = "fw-head__layer is-over";
    over.setAttribute("aria-hidden", "true");
    over.inert = true;
    head.append(over);
    const a = base.querySelectorAll(".fw-nav__item"), b = over.querySelectorAll(".fw-nav__item");
    a.forEach((el, i) => {
      el.addEventListener("mouseenter", () => b[i]?.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => b[i]?.classList.remove("is-hover"));
    });
  }
  // Takes the photo area (px, from the page top) and crops the white cover layer so only that much shows
  FW.surface = (top, right, bottom, left) => {
    if (!over) return;
    const h = head.offsetHeight, w = head.offsetWidth;
    over.style.clipPath = `inset(${Math.max(0, top)}px ${Math.max(0, w - right)}px ${Math.max(0, h - bottom)}px ${Math.max(0, left)}px)`;
  };
  const surfaceOff = () => over && (over.style.clipPath = "inset(0 0 100% 0)");

  const logos = head ? head.querySelectorAll(".fw-logo") : [];
  const lines = head ? head.querySelectorAll(".fw-head__line") : [];
  const navItems = head ? [...head.querySelectorAll(".fw-nav__item")] : [];
  const menuBtns = head ? head.querySelectorAll(".fw-menu-btn") : [];
  const showHeadNow = () => {
    gsap.set(logos, { opacity: 1, y: 0, scale: 1 });
    gsap.set(lines, { width: "94%" });
    gsap.set([...navItems, ...menuBtns], { opacity: 1, y: 0 });
  };
  FW.phase2 = () => {
    if (reduced) return gsap.set(logos, { opacity: 1 }), gsap.set(lines, { width: "94%" });
    gsap.timeline()
      .fromTo(logos, { opacity: 0, y: 60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 2, ease: "expo.out" }, 0.2)
      .fromTo(lines, { width: "0%" }, { width: "94%", duration: 1.5, ease: "expo.inOut" }, 0.8);
  };
  FW.phase3 = () => {
    if (reduced) return gsap.set([...navItems, ...menuBtns], { opacity: 1, y: 0 });
    const tl = gsap.timeline();
    const baseItems = base.querySelectorAll(".fw-nav__item");
    const overItems = over ? over.querySelectorAll(".fw-nav__item") : [];
    baseItems.forEach((el, i) => tl.fromTo([el, overItems[i]].filter(Boolean), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" }, i * 0.06));
    tl.fromTo(menuBtns, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" }, 0);
  };
  if (body.dataset.preloader !== "true" || sessionStorage.getItem("fw-trans")) showHeadNow();

  // The nav rises with the page and attaches to body when it hits the top — kept out of the header so the difference blend doesn’t mix with the photo
  const nav = base?.querySelector(".fw-nav");
  if (nav) {
    let pinAt = null, pinned = false;
    const setPin = (on) => {
      pinned = on;
      if (on) { body.append(nav); nav.classList.add("is-pinned"); head.classList.add("is-pinned"); }
      else { nav.classList.remove("is-pinned"); base.append(nav); head.classList.remove("is-pinned"); }
    };
    FW.navReset = () => { if (pinned) setPin(false); measure(); };
    const measure = () => {
      const was = pinned;
      if (was) setPin(false);
      pinAt = nav.getBoundingClientRect().top + scrollY;
      if (was) setPin(true);
      check();
    };
    const check = () => {
      if (pinAt === null) return;
      if (scrollY >= pinAt && !pinned) setPin(true);
      else if (scrollY < pinAt && pinned) setPin(false);
    };
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", () => setTimeout(measure, 100));
    setTimeout(measure, 100);
    document.fonts?.ready.then(measure);
  }

  // Services dropdown: opens on enter, closes 0.18s after leaving. Like the original, only the base-layer list opens and the overlay layer just mimics the hover display —
  // So on exit the cover layer + goes right away, the base layer + turns back 0.18s later
  head?.querySelectorAll(".is-base .fw-drop").forEach((drop) => {
    const btn = drop.querySelector("button");
    const lists = () => [drop.querySelector(".fw-drop__list")];
    let open = false, timer = null;
    const show = () => {
      clearTimeout(timer);
      if (open) return;
      open = true;
      drop.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      gsap.killTweensOf(lists());
      gsap.fromTo(lists(), { opacity: 0, y: -6, visibility: "visible", pointerEvents: "auto" }, { opacity: 1, y: 0, duration: reduced ? 0 : 0.3, ease: "power2.out" });
    };
    const hide = (now) => {
      clearTimeout(timer);
      if (!open) return;
      const go = () => {
        open = false;
        drop.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        gsap.killTweensOf(lists());
        gsap.to(lists(), { opacity: 0, y: -6, duration: reduced ? 0 : 0.25, ease: "power2.in", onComplete: () => gsap.set(lists(), { visibility: "hidden", pointerEvents: "none" }) });
      };
      now ? go() : (timer = setTimeout(go, 180));
    };
    drop.addEventListener("mouseenter", show);
    drop.addEventListener("mouseleave", () => hide(false));
    btn.addEventListener("click", (e) => { e.preventDefault(); open ? hide(true) : show(); });
    document.addEventListener("click", (e) => { if (!drop.contains(e.target)) hide(true); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") hide(true); });
  });

  // ── Phone menu drawer: slides in from the right over 0.7s and rows rise at 0.04s intervals
  {
    const links = [...menu.querySelectorAll(".fw-menu__link"), menu.querySelector(".fw-menu__close")];
    let isOpen = false, closed = null;
    const tl = gsap.timeline({ paused: true, onReverseComplete: () => { gsap.set(menu, { visibility: "hidden" }); menu.setAttribute("aria-hidden", "true"); closed?.(); closed = null; } })
      .to(menu, { xPercent: -100, duration: reduced ? 0 : 0.7, ease: "power3.inOut", onStart: () => { gsap.set(menu, { visibility: "visible" }); menu.setAttribute("aria-hidden", "false"); } })
      .to(links, { opacity: 1, y: 0, duration: reduced ? 0 : 0.5, stagger: reduced ? 0 : 0.04, ease: "power2.out" }, "-=0.2");
    const set = (on) => {
      isOpen = on;
      document.querySelectorAll(".fw-menu-btn").forEach((b) => { b.classList.toggle("is-open", on); b.setAttribute("aria-expanded", String(on)); });
      on ? (FW.lenis?.stop(), tl.play()) : (FW.lenis?.start(), tl.reverse());
    };
    // When navigating through a link inside the drawer, the original has no cover curtain and the drawer stands in for it — the drawer closes after the new page is attached (waits up to 1.8s).
    FW.menu = {
      open: () => isOpen,
      close: () => isOpen ? Promise.race([new Promise((r) => { closed = r; set(false); }), new Promise((r) => setTimeout(r, 1800))]) : Promise.resolve(),
    };
    document.addEventListener("click", (e) => {
      if (e.target.closest(".fw-menu-btn")) { e.preventDefault(); set(!isOpen); }
      else if (e.target.closest(".fw-menu__close")) set(false);
    });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) set(false); });
    addEventListener("resize", () => { if (isOpen && innerWidth > 1024) { tl.pause(0); set(false); } });
  }

  // ── Footer
  if (foot) {
    const mark = foot.querySelector(".fw-wordmark"), cols = foot.querySelectorAll(".fw-foot__col");
    if (reduced) gsap.set([mark, ...cols], { opacity: 1, y: 0 });
    else
      gsap.timeline({ scrollTrigger: { trigger: foot, start: "top 75%" } })
        .fromTo(mark, { opacity: 0, clipPath: "inset(100% 0 0 0)", y: 20 }, { opacity: 1, clipPath: "inset(0% 0 0 0)", y: 0, duration: 1.5, ease: "power3.out" })
        .fromTo(cols, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power2.out" }, "-=1.0");
  }

  // ── Overlaid scroll bar: like the original, it enters from 20px right in 1.2s as the page is revealed and the handle grows in 1.4s
  {
    const thumb = bar.querySelector(".fw-bar__thumb"), track = bar.querySelector(".fw-bar__track");
    let th = 44, shown = false;
    const max = () => document.documentElement.scrollHeight - innerHeight;
    const draw = () => {
      if (!shown) return;
      bar.style.display = max() <= 0 ? "none" : "block";
      th = Math.max(44, innerHeight * (innerHeight / document.documentElement.scrollHeight));
      thumb.style.height = th + "px";
      thumb.style.transform = `translateY(${Math.min(Math.max(scrollY / Math.max(1, max()), 0), 1) * (innerHeight - th)}px)`;
    };
    FW.barIn = () => {
      if (shown) return;
      shown = true;
      draw();
      if (reduced) return;
      gsap.timeline({ onComplete: () => gsap.set([bar, thumb], { clearProps: "opacity,transform" }) })
        .fromTo(bar, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" }, 0.2)
        .fromTo(thumb, { scaleY: 0, transformOrigin: "top center" }, { scaleY: 1, duration: 1.4, ease: "expo.out" }, 0.3);
    };
    bar.style.display = "none";
    // Like the original, redraw only when scroll or window size changes (if only page height changes, wait for the next scroll) — reading scrollHeight every tick forces layout again on the frame where a hover transition starts, and frames drop
    addEventListener("scroll", draw, { passive: true });
    addEventListener("resize", draw);
    FW.lenis?.on("scroll", draw);
    track.addEventListener("click", (e) => {
      if (e.target === thumb) return;
      const y = (e.clientY / innerHeight) * max();
      FW.lenis ? FW.lenis.scrollTo(y) : scrollTo(0, y);
    });
    thumb.addEventListener("pointerdown", (e) => {
      const y0 = e.clientY, s0 = scrollY;
      bar.classList.add("is-drag");
      thumb.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const y = s0 + ((ev.clientY - y0) / (innerHeight - th)) * max();
        FW.lenis ? FW.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
      };
      const up = () => { bar.classList.remove("is-drag"); thumb.removeEventListener("pointermove", move); thumb.removeEventListener("pointerup", up); };
      thumb.addEventListener("pointermove", move);
      thumb.addEventListener("pointerup", up);
      e.stopPropagation();
    });
  }
  // On the home page with a loader, after the photos fully unfold (revealBottom), otherwise immediately — the original keeps Lenis stopped until then
  FW.ready = () => { FW.lenis?.start(); FW.barIn(); };

  // ── Photo lightbox (original media-lightbox values): a charcoal curtain fills from the bottom in 0.85s, the photo rises from 34px · 0.94, and the buttons turn on at 0.035s intervals.
  // Within the same group ([data-zoom-group], or the whole page if none), step with ←→ · drag (48px), and hidden items not visible on screen are in the group too.
  // Video items (data-zoom-video) play a video with controls in the same cell, page videos pause while it is open, and on close only the visible ones resume.
  {
    const back = box.querySelector(".fw-box__back"), media = box.querySelector(".fw-box__media"), video = box.querySelector(".fw-box__video");
    const meta = box.querySelector(".fw-box__meta"), close = box.querySelector(".fw-box__close"), prev = box.querySelector(".is-prev"), next = box.querySelector(".is-next");
    let list = [], idx = 0, open = false, cur = media, paused = [], token = 0;
    const label = (el) => el.dataset.label || el.querySelector("[data-label]")?.dataset.label || "Photo";
    const pad = (n) => String(n).padStart(2, "0");
    // Original photos enter with contain so their ratio is kept — the placeholder also fits the ratio of the pressed spot (or data-zoom-aspect)
    const ratio = (el) => {
      const a = el.dataset.zoomAspect;
      if (a) { const [w, h] = a.split("/").map(Number); return w / h; }
      return el.offsetWidth && el.offsetHeight ? el.offsetWidth / el.offsetHeight : 1.5;
    };
    const fit = () => {
      const el = list[idx], fig = media.parentElement;
      if (!el) return;
      const r = ratio(el), w = Math.min(fig.clientWidth, fig.clientHeight * r);
      [media, video].forEach((m) => { m.style.width = w + "px"; m.style.height = w / r + "px"; });
    };
    const stopVideo = () => { video.pause(); video.removeAttribute("src"); video.load(); };
    const paint = () => {
      const el = list[idx];
      stopVideo();
      [media, video].forEach((m) => { m.style.display = "none"; gsap.set(m, { autoAlpha: 0, y: 34, scale: 0.94 }); });
      cur = el.dataset.zoomVideo ? video : media;
      cur.style.display = "block";
      fit();
      media.dataset.label = label(el);
      if (cur === video) { video.src = el.dataset.zoomVideo; video.setAttribute("aria-label", label(el)); video.play()?.catch(() => {}); }
      box.querySelector(".fw-box__i").textContent = pad(idx + 1);
      box.querySelector(".fw-box__n").textContent = pad(list.length);
      return cur;
    };
    addEventListener("resize", () => open && fit());
    const step = (d) => {
      idx = (idx + d + list.length) % list.length;
      const n = ++token;
      if (reduced) return gsap.set(paint(), { autoAlpha: 1, y: 0, scale: 1 });
      gsap.killTweensOf([media, video]);
      gsap.to(cur, { autoAlpha: 0, duration: 0.18, ease: "power2.in", onComplete: () => {
        if (n !== token) return;
        gsap.fromTo(paint(), { autoAlpha: 0, y: 0, scale: 1 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.34, ease: "power2.out" });
      } });
    };
    const show = (el) => {
      if (open) return;
      const group = el.closest("[data-zoom-group]") || el.closest("main") || document;
      list = [...group.querySelectorAll("[data-zoom]")].filter((z) => z.closest("[data-zoom-group]") === el.closest("[data-zoom-group]"));
      idx = Math.max(0, list.indexOf(el));
      open = true;
      paused = [...document.querySelectorAll("video")].filter((v) => v !== video && !v.paused);
      paused.forEach((v) => v.pause());
      box.style.display = "block";
      paint();
      const single = list.length <= 1;
      [prev, next, meta].forEach((b) => (b.style.display = single ? "none" : ""));
      box.setAttribute("aria-hidden", "false");
      FW.lenis?.stop();
      const parts = [close, prev, next, meta];
      if (reduced) return gsap.set(back, { clipPath: "inset(0% 0% 0% 0%)" }), gsap.set([cur, ...parts], { autoAlpha: 1, y: 0, scale: 1 }), close.focus({ preventScroll: true });
      gsap.set(parts, { autoAlpha: 0 });
      gsap.timeline({ onComplete: () => close.focus({ preventScroll: true }) })
        .fromTo(back, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.85, ease: "power4.inOut" })
        .fromTo(cur, { autoAlpha: 0, y: 34, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, ease: "power4.out" }, "-=0.38")
        .to(parts, { autoAlpha: 1, duration: 0.4, stagger: 0.035 }, "-=0.42");
    };
    const hide = () => {
      if (!open) return;
      open = false;
      const end = () => {
        stopVideo();
        box.style.display = "none";
        box.setAttribute("aria-hidden", "true");
        FW.lenis?.start();
        if (!reduced) paused.forEach((v) => { const r = v.getBoundingClientRect(); if (v.isConnected && r.bottom > 0 && r.top < innerHeight) v.play()?.catch(() => {}); });
        paused = [];
      };
      if (reduced) return end();
      gsap.timeline({ onComplete: end })
        .to([cur, close, prev, next, meta], { autoAlpha: 0, y: 16, duration: 0.28, ease: "power2.in" })
        .to(back, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.72, ease: "power4.inOut" }, "-=0.08");
    };
    document.addEventListener("click", (e) => {
      const z = e.target.closest("[data-zoom]");
      if (z && !e.defaultPrevented) { e.preventDefault(); show(z); }
    });
    document.addEventListener("keydown", (e) => {
      const z = e.target.closest?.("[data-zoom]");
      if (z && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); z.click(); }
    });
    back.addEventListener("click", (e) => e.target === back && hide());
    close.addEventListener("click", hide);
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    let px = null;
    box.addEventListener("pointerdown", (e) => (px = e.clientX));
    box.addEventListener("pointerup", (e) => {
      if (px === null) return;
      const d = e.clientX - px;
      px = null;
      if (Math.abs(d) >= 48 && list.length > 1) step(d < 0 ? 1 : -1);
    });
    addEventListener("keydown", (e) => {
      if (!open) return;
      const inVideo = e.target === video;
      if (e.key === "Escape") hide();
      if (!inVideo && e.key === "ArrowRight") step(1);
      if (!inVideo && e.key === "ArrowLeft") step(-1);
    });
  }

  // ── Page video: starts loading 200px before the screen, plays when visible, pauses when out of view (original IntersectionObserver as is)
  const videos = (root, k) => {
    const list = [...root.querySelectorAll("video[data-fw-video]")];
    if (!list.length) return;
    if (reduced) return list.forEach((v) => v.pause());
    const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) { if (v.preload === "none") v.preload = "metadata"; v.play()?.catch(() => {}); }
      else v.pause();
    }), { rootMargin: "200px" });
    list.forEach((v) => io.observe(v));
    k.add(() => { io.disconnect(); list.forEach((v) => v.pause()); });
  };

  // ── Box Attach · Detach
  const kit = (root) => {
    const offs = [];
    let mm = null;
    return {
      get mm() { if (!mm) { mm = gsap.matchMedia(root); offs.push(() => mm.revert()); } return mm; },
      on(t, ev, fn, o) { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); },
      add(fn) { if (typeof fn === "function") offs.push(fn); },
      kill() { offs.splice(0).reverse().forEach((f) => f()); },
    };
  };
  let mounted = null;
  // internal: what enters when the curtain lifts coming from another page — the page prepares while held still, and the returned start is called 0.12s after the curtain begins to lift
  const mount = (root, internal) => {
    const k = kit(root), init = FW.pages[root.dataset.barbaNamespace];
    let api = {};
    const ctx = gsap.context(() => {
      api = (init && init(root, { k, internal })) || {};
      videos(root, k);
    }, root);
    mounted = { ctx, k };
    // Original: for each photo slot <button class="lightbox-trigger"> so it opens by keyboard too — give placeholder divs the same property
    root.querySelectorAll("[data-zoom]:not(button)").forEach((z) => {
      z.setAttribute("role", "button");
      z.tabIndex = 0;
      z.setAttribute("aria-label", "View Large");
    });
    if (!root.querySelector("[data-nav-surface]")) surfaceOff();
    return api;
  };
  const unmount = () => {
    if (!mounted) return;
    mounted.k.kill();
    mounted.ctx.revert();
    mounted = null;
  };

  // ── Page transition (original barba 2.10.3 · same values): two sheets cover from above (0.4/0.44s) → the old container is removed and the new one attached → the sheets lift away downward (0.48/0.5s)
  // The new page comes in 0.12s after the cover starts lifting. When going to a link inside the drawer, the drawer closes and reveals the page with no cover
  const [pa, pb] = trans.querySelectorAll(".fw-trans__plane");
  const seam = trans.querySelector(".fw-trans__seam"), kicker = trans.querySelector(".fw-trans__kicker"), ttl = trans.querySelector(".fw-trans__title");
  const resetTrans = () => { trans.style.display = "none"; trans.style.pointerEvents = "none"; gsap.set([trans, pa, pb, seam, kicker, ttl], { clearProps: "all" }); };
  const cover = (text) => new Promise((done) => {
    resetTrans();
    ttl.textContent = text || "STUDIO NAME";
    trans.style.display = "block";
    trans.style.pointerEvents = "auto";
    if (reduced) {
      gsap.set([pa, pb], { yPercent: 0 });
      return gsap.fromTo(trans, { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "none", onComplete: done });
    }
    gsap.set([pa, pb], { yPercent: -102 });
    gsap.set(seam, { scaleY: 0, transformOrigin: "top center" });
    gsap.set(kicker, { opacity: 0, y: 6 });
    gsap.set(ttl, { opacity: 0, yPercent: 112 });
    gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: done })
      .to(pa, { yPercent: 0, duration: 0.4, ease: "power3.inOut" }, 0)
      .to(pb, { yPercent: 0, duration: 0.44, ease: "power3.inOut" }, 0.045)
      .to(seam, { scaleY: 1, duration: 0.3, ease: "power3.out" }, 0.19)
      .to(kicker, { opacity: 1, y: 0, duration: 0.19, ease: "power2.out" }, 0.27)
      .to(ttl, { opacity: 1, yPercent: 0, duration: 0.26, ease: "power3.out" }, 0.27);
  });
  const reveal = () => new Promise((done) => {
    const end = () => (resetTrans(), done());
    if (reduced) return gsap.to(trans, { opacity: 0, duration: 0.16, ease: "none", onComplete: end });
    gsap.timeline({ defaults: { overwrite: "auto" }, onComplete: end })
      .to(ttl, { opacity: 0, yPercent: -102, duration: 0.17, ease: "power3.in" }, 0)
      .to(kicker, { opacity: 0, y: -5, duration: 0.13, ease: "power2.in" }, 0.01)
      .to(seam, { scaleY: 0, transformOrigin: "bottom center", duration: 0.19, ease: "power2.in" }, 0.025)
      .to(pa, { yPercent: 102, duration: 0.48, ease: "power3.inOut" }, 0.06)
      .to(pb, { yPercent: 102, duration: 0.5, ease: "power3.inOut" }, 0.1);
  });
  const PAGES = { home: "STUDIO NAME", service: "Service One", film: "Service Two", staging: "Service Three" };
  const titleFor = (ns, trigger) => (trigger instanceof Element && trigger.closest("[data-transition-title]")?.dataset.transitionTitle) || PAGES[ns] || "STUDIO NAME";
  const nsOf = (href) => ({ "index.html": "home", "service.html": "service", "film.html": "film", "staging.html": "staging" })[href.split(/[?#]/)[0].split("/").pop()];
  const toTop = () => { scrollTo(0, 0); FW.lenis?.scrollTo(0, { immediate: true, force: true }); FW.lenis?.resize(); };
  const settle = () => new Promise((r) => requestAnimationFrame(() => (toTop(), requestAnimationFrame(() => (toTop(), r())))));
  // The transition library only swaps the box <head> Skin and page scripts are not loaded separately — like the original, the next page css is attached (up to 0.8s), the old one is removed, and the page script is loaded once at first
  const abs = (h) => new URL(h, location.href).href;
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (doc.title) document.title = doc.title;
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => abs(l.getAttribute("href")));
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    have.forEach((l) => want.includes(l.href) || l.remove());
    await Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((href) => new Promise((r) => {
      const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r });
      document.head.append(l);
      setTimeout(r, 800);
    })));
    const loaded = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = abs(s.getAttribute("src"));
      if (loaded.includes(src)) continue;
      await new Promise((r) => document.body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
  };
  const announce = (ns) => { announcer.textContent = ""; requestAnimationFrame(() => (announcer.textContent = `${PAGES[ns] || ns} moves to`)); };
  // Entering: attach the new box → re-measure positions → restore the header → two frames at the top → lift the curtain (page starts after 0.12s) or close the drawer
  const arrive = async (next, viaMenu) => {
    toTop();
    const api = mount(next, true);
    ScrollTrigger.refresh();
    FW.navReset?.();
    showHeadNow();
    FW.lenis?.start();
    await settle();
    if (viaMenu) { api.start?.(); await FW.menu.close(); }
    else { const r = reveal(); setTimeout(() => api.start?.(), 120); await r; }
    next.focus({ preventScroll: true });
    announce(next.dataset.barbaNamespace);
  };

  // On file:// the transition library cannot fetch the next page — cover with the same curtain, then navigate normally, and the new page picks up via sessionStorage and walks in
  const KEY = "fw-trans";
  const plainNav = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.closest(".wf-ui")) return;
      const href = a.getAttribute("href"), ns = nsOf(href);
      if (!ns) return;
      e.preventDefault();
      const name = titleFor(ns, a);
      cover(name).then(() => { sessionStorage.setItem(KEY, name); location.href = href; });
    });
    addEventListener("pageshow", (e) => e.persisted && resetTrans());
  };

  const start = () => {
    const first = document.querySelector('[data-barba="container"]');
    const arriving = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (arriving) {
      // Open while covered, then uncover after 0.14s (the pause in the original __brandTransition)
      ttl.textContent = arriving;
      trans.style.display = "block";
      gsap.set(seam, { scaleY: 1 });
      const api = mount(first, true);
      FW.ready();
      setTimeout(() => { reveal(); setTimeout(() => api.start?.(), 120); }, 140);
    } else {
      mount(first, false);
      if (body.dataset.preloader === "true" && first.dataset.barbaNamespace === "home") FW.lenis?.stop();
      else FW.ready();
    }
    ScrollTrigger.refresh();
    if (!window.barba || !/^https?:$/.test(location.protocol)) return plainNav();
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    let busy = false, viaMenu = false;
    barba.init({
      prevent: ({ el, event, href }) => {
        if (busy) { if (event?.type === "click") event.preventDefault(); return true; }
        if (!el || el.closest(".wf-ui") || el.target === "_blank" || el.hasAttribute("download")) return true;
        const raw = el.getAttribute("href") || "";
        if (!raw || raw.startsWith("#") || /^(mailto|tel):/.test(raw)) return true;
        try {
          const u = new URL(href, location.href);
          if (u.origin !== location.origin) return true;
          // Barba also calls prevent on prefetch (mouseover) — like the original, scroll to top only on press
          if (u.pathname === location.pathname && u.search === location.search) {
            if (event?.type === "click") {
              event.preventDefault();
              FW.lenis ? FW.lenis.scrollTo(0) : scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
            }
            return true;
          }
        } catch { return true; }
        return false;
      },
      transitions: [{
        name: "page-transition",
        async leave({ next, trigger }) {
          busy = true;
          viaMenu = innerWidth <= 1024 && trigger instanceof Element && !!trigger.closest(".fw-menu") && FW.menu.open();
          if (!viaMenu) await cover(titleFor(next.namespace || nsOf(next.url?.path || ""), trigger));
          FW.lenis?.stop();
          unmount();
        },
        async enter({ current, next, trigger }) {
          try {
            current.container?.remove();
            await bring(next.html);
            if (trigger === "popstate") viaMenu = false;
            await arrive(next.container, viaMenu);
          } finally { busy = false; viaMenu = false; }
        },
      }],
    });
  };
  const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  const boot = () => fontsReady.then(() => requestAnimationFrame(start));
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
  addEventListener("load", () => ScrollTrigger.refresh());
})();
