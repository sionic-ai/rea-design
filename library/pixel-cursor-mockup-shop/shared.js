// Shared by all pages — Lenis, dark-section detection (theme-light), header bar (turns translucent after half a screen of scroll) and menu panel, cart drawer, login, download and News windows,
// Row heads: title · blurred fade-in · scroll text, pixel icon glitch, jitter tag, bottom-right panel group (cookie · product offer · lifetime pass), news pills,
// Page-transition cell cover, footer clock, cursor pixel trail, first-visit loader
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const JIT = "0.5,0,0,1";
  const bez = (...c) => (p) => { let t = p; for (let i = 0; i < 6; i++) { const x = 3 * (1 - t) ** 2 * t * c[0] + 3 * (1 - t) * t * t * c[2] + t ** 3 - p; const dx = 3 * (1 - t) ** 2 * c[0] + 6 * (1 - t) * t * (c[2] - c[0]) + 3 * t * t * (1 - c[2]); if (Math.abs(dx) < 1e-6) break; t -= x / dx; } return 3 * (1 - t) ** 2 * t * c[1] + 3 * (1 - t) * t * t * c[3] + t ** 3; };
  const jit = bez(0.5, 0, 0, 1);
  window.VS = { reduce, fine, jit, $$ };

  // Ready gate — opens when the loader finishes if there is one, and only then do the entrance motions run
  let open;
  const ready = new Promise((r) => (open = r));
  VS.ready = ready;
  // The bottom-right panel group opens separately — it enters under the loader first, so it is already in place when the backdrop lifts (as in the original)
  let goStack;
  const stackReady = new Promise((r) => (goStack = r));

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = window.lenis = new Lenis();
    lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Dark section detection — like the original, the theme- of the section (data-navbar-theme) holding the element’s center line (the screen center if it’s a window covering the screen)<Price> Attaches it.
  // Shared by the header bar, lifetime pass panel, login window and news window. The header bar turns into white text and light frost only after scrolling down (is-scrolled)
  const themed = $$("[data-navbar-theme]"), themeEls = [];
  const paintTheme = () => {
    const boxes = themed.map((s) => s.getBoundingClientRect());
    for (const t of themeEls) {
      const r = t.el.getBoundingClientRect(), y = t.mid ? innerHeight / 2 : r.top + r.height / 2;
      const k = boxes.findIndex((b) => y >= b.top && y <= b.bottom), cls = k < 0 ? null : `theme-${themed[k].dataset.navbarTheme}`;
      if (cls === t.active) continue;
      if (t.active) t.el.classList.remove(t.active);
      if (cls) t.el.classList.add(cls);
      t.active = cls;
    }
  };
  const watchTheme = (el, mid = false) => { if (el && themed.length) { themeEls.push({ el, mid, active: null }); paintTheme(); } };
  addEventListener("scroll", paintTheme, { passive: true });
  addEventListener("resize", paintTheme);
  ScrollTrigger.addEventListener("refresh", paintTheme);

  // Header bar — scrolling half a screen drops the white panel and each group turns into frosted glass. The menu comes down at .25s power2.out and the bar at .68s (.5,0,0,1)
  const nav = document.querySelector("[data-nav]");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > innerHeight * 0.5);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    watchTheme(nav);
    // The row is folded above the board (−(row position − board top) − row height) and drops down in .68s, and the button widens to 192px. Closing is 1.5× faster
    const btn = nav.querySelector("[data-nav-toggle]"), menu = nav.querySelector("[data-menu]"), items = $$(".vs-menu__item", menu), list = menu.querySelector(".vs-menu__items");
    const menuLabel = btn.querySelector(".vs-menu-btn__menu"), closeLabel = btn.querySelector(".vs-menu-btn__close"), allAssets = nav.querySelector(".vs-nav__link");
    let isOpen = false, tl = null, startY = [], btnW = 0;
    const closed = () => {
      gsap.set(menu, { autoAlpha: 0, y: -8 });
      const top = menu.getBoundingClientRect().top;
      startY = items.map((it) => { gsap.set(it, { y: 0 }); const r = it.getBoundingClientRect(); return -(r.top - top) - r.height; });
      items.forEach((it, i) => gsap.set(it, { y: startY[i] }));
      gsap.set(closeLabel, { yPercent: 100 });
      btnW = btn.offsetWidth;
    };
    closed();
    // Below width 1023 the button doesn’t widen, instead it turns on a backdrop and locks scroll so the menu covers the screen (original)
    const desk = matchMedia("(min-width: 1024px)");
    let covers = false;
    const setOpen = (on) => {
      isOpen = on;
      btn.setAttribute("aria-expanded", String(on));
      nav.classList.toggle("is-open", on);
      if (on && !desk.matches) { covers = true; showBackdrop(true); lenis?.stop(); }
      if (!on && covers) { covers = false; lenis?.start(); showBackdrop(false); }
      tl?.kill();
      const k = on ? 1 : 1.5;
      tl = gsap.timeline({ onComplete: () => !on && gsap.set([btn, menuLabel], { clearProps: "width,transform" }) })
        .to(menu, { autoAlpha: on ? 1 : 0, y: on ? 0 : -8, duration: 0.25 / k, ease: on ? "power2.out" : "power2.in" }, 0)
        .to(menuLabel, { yPercent: on ? -100 : 0, duration: 0.4 / k, ease: jit }, 0)
        .to(items, { y: (i) => (on ? 0 : startY[i]), duration: 0.68 / k, ease: jit }, 0)
        .to(closeLabel, { yPercent: on ? 0 : 100, duration: 0.44 / k, ease: jit }, 0)
        .to(allAssets, { autoAlpha: on ? 0 : 1, duration: 0.22 / k, ease: "sine.out" }, 0.016);
      if (desk.matches) tl.to(btn, { width: on ? btnW + 103 : btnW, duration: 0.4 / k, ease: jit }, 0);
    };
    btn.addEventListener("click", () => setOpen(!isOpen));
    document.addEventListener("click", (e) => isOpen && !nav.contains(e.target) && setOpen(false));
    document.addEventListener("keydown", (e) => e.key === "Escape" && isOpen && setOpen(false));
    items.forEach((it) => {
      it.addEventListener("mouseenter", () => list.classList.add("is-item-focused"));
      it.addEventListener("mouseleave", () => list.classList.remove("is-item-focused"));
    });
  }

  // Text roll — text that has fully rolled (transform not at rest) gets is-revealed, so on release it stands right away instead of rolling back
  document.addEventListener("transitionrun", (e) => { if (e.propertyName === "transform" && e.target.classList?.contains("vs-roll__t")) e.target.closest(".vs-roll")?.classList.remove("is-revealed"); }, true);
  document.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform" || !e.target.classList?.contains("vs-roll__t")) return;
    const t = getComputedStyle(e.target).transform;
    e.target.closest(".vs-roll")?.classList.toggle("is-revealed", !(t === "none" || /matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*0\)/.test(t)));
  }, true);

  // Shared curtain — as in the original, captures the current screen at half size (section background color · photo-slot panel) and over .2s draws it as a mosaic of 8 → 16 → 24 → 36 → 50px cells, getting progressively coarser.
  // The first step has opacity .5, then 1 after. On close it thins backward in .2s and vanishes. If several open the curtain, it closes when the last one closes
  const backdrop = document.querySelector("[data-backdrop]");
  const CELLS = [8, 16, 24, 36, 50], SHRINK = 2;
  let bdOwners = 0, bdShot = null, bdStep = null;
  const bdProg = { v: 0 };
  const snap = () => {
    const W = innerWidth, H = innerHeight, c = document.createElement("canvas");
    c.width = Math.ceil(W / SHRINK); c.height = Math.ceil(H / SHRINK);
    const x = c.getContext("2d");
    x.scale(1 / SHRINK, 1 / SHRINK);
    x.fillStyle = getComputedStyle(document.body).backgroundColor;
    x.fillRect(0, 0, W, H);
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest("[data-backdrop], .vs-modal, .vs-cart-drawer, .vs-contact, .vs-veil, .vs-trail")) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W || !r.width || !r.height) continue;
      const bg = cs.backgroundColor;
      if (bg && !/rgba\(.*,\s*0\)$/.test(bg) && bg !== "transparent") { x.fillStyle = bg; x.fillRect(r.left, r.top, r.width, r.height); }
    }
    return c;
  };
  const bdDraw = () => {
    const t = bdProg.v, e = t <= 0 ? -1 : Math.min(CELLS.length - 1, Math.floor(t * CELLS.length));
    if (e === bdStep) return;
    bdStep = e;
    backdrop.style.opacity = e < 0 ? 0 : e === 0 ? 0.5 : 1;
    if (e < 0 || !bdShot) return;
    const cv = backdrop.querySelector("canvas"), o = CELLS[e], W = innerWidth, H = innerHeight, a = Math.ceil(W / o), l = Math.ceil(H / o);
    if (cv.width !== a) cv.width = a;
    if (cv.height !== l) cv.height = l;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(bdShot, 0, 0, a, l);
    Object.assign(cv.style, { left: `${-(a * o - W) / 2}px`, top: `${-(l * o - H) / 2}px`, width: `${a * o}px`, height: `${l * o}px` });
  };
  const showBackdrop = (on) => {
    if (!backdrop) return;
    const was = bdOwners > 0;
    bdOwners = Math.max(0, bdOwners + (on ? 1 : -1));
    const vis = bdOwners > 0;
    if (vis === was) return;
    gsap.killTweensOf(bdProg);
    if (vis) {
      backdrop.classList.add("is-visible");
      bdShot = snap(); bdStep = null; bdProg.v = 0; bdDraw();
      gsap.to(bdProg, { v: 1, duration: reduce ? 0 : 0.2, ease: "none", onUpdate: bdDraw });
    } else {
      gsap.to(bdProg, { v: 0, duration: reduce ? 0 : 0.2, ease: "none", onUpdate: bdDraw, onComplete: () => { backdrop.classList.remove("is-visible"); bdShot = null; bdStep = null; } });
    }
  };

  // Cart drawer: the plate comes in from outside the right edge in .68s (.5,0,0,1). Closing is 1.5 times faster
  const cart = document.querySelector("[data-side-cart]");
  if (cart) {
    const ov = cart.querySelector("[data-side-cart-overlay]"), panel = cart.querySelector("[data-side-cart-panel]");
    // On phone (under 767) use only the drawer shadow curtain, with no cell curtain, like the original
    const phone = matchMedia("(max-width: 767px)");
    let ctl = null, cOpen = false, withBd = false;
    const cartOpen = (on) => {
      if (cOpen === on) return;
      cOpen = on;
      ctl?.kill();
      if (on && !phone.matches) { withBd = true; showBackdrop(true); }
      if (!on && withBd) { withBd = false; showBackdrop(false); }
      if (on) { lenis?.stop(); ctl = gsap.timeline().set(cart, { autoAlpha: 1 }).to(ov, { opacity: 1, duration: 0.3, ease: "power2.out" }, 0).to(panel, { xPercent: 0, duration: 0.68, ease: jit }, 0); }
      else { lenis?.start(); ctl = gsap.timeline({ onComplete: () => gsap.set(cart, { autoAlpha: 0 }) }).to(ov, { opacity: 0, duration: 0.3 / 1.5, ease: "power2.in" }, 0).to(panel, { xPercent: 100, duration: 0.68 / 1.5, ease: jit }, 0); }
    };
    gsap.set(cart, { autoAlpha: 0 }); gsap.set(panel, { xPercent: 100 });
    $$("[data-cart-toggle]").forEach((b) => b.addEventListener("click", () => cartOpen(!cOpen)));
    cart.querySelector("[data-side-cart-close]").addEventListener("click", () => cartOpen(false));
    ov.addEventListener("click", () => cartOpen(false));
    document.addEventListener("keydown", (e) => e.key === "Escape" && cartOpen(false));
  }

  // Window — like the original, opening turns on the overlay and locks scrolling, then is-open turns everything on at once (no opacity transition), and only the inner plate rises from 10dvh below over .5s expo (CSS).
  // Closing via window backdrop, close button or Esc turns it off right away
  const modal = (el, { onOpen, onClose } = {}) => {
    const c = {
      isOpen: false,
      open() { if (c.isOpen) return; showBackdrop(true); lenis?.stop(); c.isOpen = true; el.classList.add("is-open"); onOpen?.(); },
      close() { if (!c.isOpen) return; c.isOpen = false; lenis?.start(); showBackdrop(false); el.classList.remove("is-open"); onClose?.(); },
    };
    el.querySelector("[data-modal-close]")?.addEventListener("click", () => c.close());
    el.querySelector("[data-modal-backdrop]")?.addEventListener("click", () => c.close());
    document.addEventListener("keydown", (e) => e.key === "Escape" && c.isOpen && c.close());
    $$("form", el).forEach((f) => f.addEventListener("submit", (e) => e.preventDefault()));
    document.body.append(el);
    return c;
  };

  // Login window — opened by the account button. Swaps the login · sign-up · password-recovery boards with text buttons
  const auth = document.querySelector("[data-auth]");
  if (auth) {
    const views = $$("[data-auth-view]", auth), ctl = modal(auth);
    watchTheme(auth);
    $$("[data-auth-trigger]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); ctl.open(); }));
    $$("[data-auth-switch]", auth).forEach((b) => b.addEventListener("click", () => views.forEach((v) => v.classList.toggle("is-active", v.dataset.authView === b.dataset.authSwitch))));
  }

  // Download window — as in the original, a button that is the immediately preceding sibling opens it. The button next to the key shows Copied for 1.5s, delete drops out after the row folds (.3s), and,
  // Adding a domain inserts one input row at a time and turns off when it reaches the max (data-max-domains)
  $$("[data-download-modal]").forEach((el) => {
    const trigger = el.previousElementSibling, ctl = modal(el);
    trigger?.addEventListener("click", (e) => { e.preventDefault(); ctl.open(); });
    const list = el.querySelector("[data-dl-list]"), addBtn = el.querySelector('[aria-label="Add domain"]'), tpl = el.querySelector("template");
    const max = parseInt(list?.dataset.maxDomains, 10) || Infinity;
    const rows = () => (list ? list.querySelectorAll(".vs-dl__row:not(.vs-dl__row--add)").length : 0);
    const pending = () => (list ? list.querySelectorAll(".vs-dl__row--input").length : 0) > 0;
    const sync = () => { if (!addBtn) return; const off = rows() >= max || pending(); addBtn.disabled = off; addBtn.classList.toggle("is-disabled", off); };
    el.addEventListener("click", (e) => {
      const copy = e.target.closest('[aria-label="Copy key"]'), rm = e.target.closest('[aria-label="Remove"]');
      if (copy) {
        const text = copy.closest(".vs-dl__key")?.querySelector(".vs-dl__key-text")?.textContent;
        if (text) (navigator.clipboard?.writeText(text) || Promise.resolve()).catch(() => {}).then(() => { copy.classList.add("is-copied"); clearTimeout(copy._t); copy._t = setTimeout(() => copy.classList.remove("is-copied"), 1500); });
      } else if (rm) {
        const row = rm.closest(".vs-dl__row");
        if (row) { row.classList.add("is-removing"); row.addEventListener("transitionend", () => { row.remove(); sync(); }, { once: true }); }
      }
    });
    addBtn?.addEventListener("click", () => {
      if (rows() >= max || pending() || !tpl) return;
      addBtn.closest(".vs-dl__row--add")?.before(tpl.content.firstElementChild.cloneNode(true));
      sync();
    });
    sync();
  });

  // News pill — sits at the very bottom of the zone like the original, and stops its ripple when off screen. Pressing the button opens the news window and the pill vanishes in .2s meanwhile
  $$("[data-news-push]").forEach((wrap) => {
    const push = wrap.querySelector("[data-news]"), m = wrap.querySelector("[data-modal]");
    if (!m) return;
    watchTheme(m);
    const ctl = modal(m, { onOpen: () => push?.classList.add("is-hidden"), onClose: () => { push?.classList.remove("is-hidden"); m.querySelector("form")?.reset(); } });
    wrap.querySelector("[data-modal-trigger]")?.addEventListener("click", (e) => { e.preventDefault(); ctl.open(); });
    if (push) { push.classList.add("is-offscreen"); new IntersectionObserver(([n]) => push.classList.toggle("is-offscreen", !n.isIntersecting)).observe(push); }
  });

  // Contact window — links ending in #contact open it (stays as is if already open). On open: backdrop·scroll lock, after .3s clicking outside the window closes it, also Esc·traffic-light button.
  // Transitions are turned on only two frames after painting — so the initial resting position doesn’t look like it slides. Dark-area detection uses the screen’s center line instead of the window position
  const contact = document.querySelector("[data-contact]");
  if (contact) {
    const root = document.documentElement;
    // Below width 999 the window covers the whole screen, so the cell curtain is not turned on (original)
    const full = matchMedia("(max-width: 999px)");
    let cOpen = false, armed = null, withBd = false;
    const outside = (e) => { if (!contact.contains(e.target)) { e.preventDefault(); toggle(); } };
    const toggle = () => {
      cOpen = !cOpen;
      root.classList.toggle("has-contact-open", cOpen);
      if (cOpen) { withBd = !full.matches; if (withBd) showBackdrop(true); lenis?.stop(); armed = gsap.delayedCall(0.3, () => addEventListener("click", outside)); }
      else { armed?.kill(); removeEventListener("click", outside); lenis?.start(); if (withBd) showBackdrop(false); withBd = false; }
    };
    document.addEventListener("click", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || !/#contact$/.test(a.getAttribute("href"))) return;
      e.preventDefault();
      if (!cOpen) toggle();
    });
    $$("[data-contact-close]", contact).forEach((b) => b.addEventListener("click", () => cOpen && toggle()));
    document.addEventListener("keydown", (e) => e.key === "Escape" && cOpen && toggle());
    contact.querySelector("form")?.addEventListener("submit", (e) => e.preventDefault());
    watchTheme(contact, true);
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("has-contact-ready")));
  }

  // Category list (home · shop) — hovering a row turns its photo on at the pointer position in .3s (inner panel 0 → 1, .6s expo.out · number badge enters from above .05s later),
  // Follows the pointer: each frame closes 1 − cos(π/2 × .08)^Δms of the remaining distance (original lerp, about .12 per frame)
  $$("[data-cats]").forEach((sec) => {
    if (!fine || reduce) return;
    const hovers = $$("[data-cat-hover]", sec);
    $$("[data-cat]", sec).forEach((row) => {
      const box = row.querySelector("[data-cat-hover]"), img = box.querySelector(".wf-img"), count = box.querySelector(".vs-cat__count");
      gsap.set(img, { scale: 0 });
      if (count) gsap.set(count, { scale: 0, yPercent: -100 });
      let x = 0, y = 0, tx = 0, ty = 0;
      const follow = (t, dt) => { const k = 1 - Math.pow(Math.cos((Math.PI / 2) * 0.08), dt); x += (tx - x) * k; y += (ty - y) * k; gsap.set(box, { x, y }); };
      const local = (e) => { const r = row.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      row.addEventListener("mouseenter", (e) => {
        [x, y] = local(e); [tx, ty] = [x, y];
        gsap.set(box, { x, y });
        gsap.killTweensOf(hovers);
        gsap.set(hovers.filter((h) => h !== box), { autoAlpha: 0 });
        gsap.to(box, { autoAlpha: 1, duration: 0.3, ease: "power2.out" });
        gsap.fromTo(img, { scale: 0 }, { scale: 1, duration: 0.6, ease: "expo.out" });
        if (count) gsap.fromTo(count, { scale: 0, yPercent: -100 }, { delay: 0.05, scale: 1, yPercent: 0, duration: 0.6, ease: "expo.out" });
        gsap.ticker.add(follow);
      });
      row.addEventListener("mousemove", (e) => { [tx, ty] = local(e); });
      row.addEventListener("mouseleave", () => {
        gsap.to(box, { autoAlpha: 0, duration: 0.3, ease: "power2.out" });
        gsap.to(img, { scale: 0, duration: 0.3, ease: "power2.in" });
        if (count) gsap.to(count, { scale: 0, yPercent: -100, duration: 0.3, ease: "power2.in" });
        gsap.ticker.remove(follow);
      });
    });
  });

  // Line-by-line title — each line rises from 100% below, 1.2s expo.out, .2s stagger (after the ready gate opens)
  $$("[data-mask-lines]").forEach((h) => {
    const lines = $$(".vs-mask > span", h);
    if (reduce) return;
    gsap.set(lines, { yPercent: 100 });
    ready.then(() => gsap.to(lines, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.2 }));
  });
  $$("[data-fade-in]").forEach((el) => {
    if (reduce) return;
    gsap.set(el, { opacity: 0 });
    ready.then(() => gsap.to(el, { opacity: 1, duration: 1.2, ease: "expo.out", delay: 0.4 }));
  });
  // Scroll text — letters go from .1 to 1, stagger .1 (tied to scroll, top edge 80% → bottom edge 60%).
  // data-letters-after starts where the preceding scroll letters have all darkened and runs for its own share (bottom edge 60% − top edge 80%) (original data-letter-reveal-after)
  document.fonts.ready.then(() => {
    let prev = null;
    $$("[data-letters]").forEach((el) => {
      if (reduce) return;
      const s = SplitText.create(el, { type: "words,chars", charsClass: "vs-char", wordsClass: "vs-word" });
      const start = el.dataset.start || "top 80%", end = el.dataset.end || "bottom 60%";
      let st = { trigger: el, start, end, scrub: true };
      if (el.hasAttribute("data-letters-after") && prev) {
        const a = prev, own = ScrollTrigger.create({ trigger: el, start, end });
        st = { trigger: el, start: () => a.end, end: () => a.end + (own.end - own.start), scrub: true };
      }
      gsap.set(s.chars, { opacity: 0.1 });
      prev = gsap.to(s.chars, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: st }).scrollTrigger;
    });
  });

  // Pixel icon — a 12×12 grid (path) switched on and off cell by cell with a timeline. Values were read from the original:
  // Turning on happens one cell every .03s in random order (each cell lights .05s later), then after all are lit comes a rest (icon title 2s · icon row 1s · standalone icon 0~2s) and a shake once every 3~6s.
  // Of the flicker, 10% has the remaining cells all switch off in .01s sequence, then back on in the same sequence after .4s. In the rest, 8 to 50 of the remaining cells switch off for .01s, repeated 1 to 2 times (the pause while staying off is .2 to 1s for 80%, .2s for the others).
  // Cells within 10px (+ half a cell width) of the mouse path are off for 1~4s — the original is random so it isn’t the same picture, but it has the same period, range and group size.
  const PX = { on: 0.05, order: 0.03, rest: [3, 6], fullChance: 0.1, fullOrder: 0.01, fullHold: 0.4, blink: 0.01, few: [8, 50], again: [1, 2], slowChance: 0.8, hold: [0.2, 1], reach: 10, hide: [1, 4], solo: [0, 2] };
  const pick = ([a, b]) => a + Math.random() * (b - a);
  const pickInt = ([a, b]) => a + Math.floor(Math.random() * (b - a + 1));
  const segDist = (px, py, ax, ay, bx, by) => {
    const vx = bx - ax, vy = by - ay, l2 = vx * vx + vy * vy;
    const t = l2 ? gsap.utils.clamp(0, 1, ((px - ax) * vx + (py - ay) * vy) / l2) : 0;
    return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
  };
  const pixelIcon = (host) => {
    const cells = $$("path", host), wiped = new Set();
    const alive = () => cells.filter((c) => !wiped.has(c));
    let prev = null;
    const wipe = (c) => {
      wiped.add(c);
      gsap.killTweensOf(c);
      gsap.set(c, { opacity: 0, pointerEvents: "none" });
      gsap.delayedCall(pick(PX.hide), () => { wiped.delete(c); gsap.set(c, { opacity: 1, pointerEvents: "" }); });
    };
    const sweep = (e) => {
      if (e.pointerType !== "mouse") return;
      const a = prev || { x: e.clientX, y: e.clientY }, b = (prev = { x: e.clientX, y: e.clientY });
      for (const c of alive()) {
        const r = c.getBoundingClientRect();
        if (segDist(r.left + r.width / 2, r.top + r.height / 2, a.x, a.y, b.x, b.y) <= PX.reach + Math.max(r.width, r.height) / 2) wipe(c);
      }
    };
    const shake = () => {
      const tl = gsap.timeline();
      if (Math.random() < PX.fullChance) {
        const row = gsap.utils.shuffle(alive()), backAt = PX.blink + row.length * PX.fullOrder + PX.fullHold;
        row.forEach((c, i) => {
          tl.set(c, { opacity: 0 }, PX.blink + i * PX.fullOrder);
          tl.call(() => !wiped.has(c) && gsap.set(c, { opacity: 1 }), null, backAt + PX.blink + i * PX.fullOrder);
        });
      } else {
        gsap.utils.shuffle(alive()).slice(0, pickInt(PX.few)).forEach((c) => {
          const stay = Math.random() < PX.slowChance ? pick(PX.hold) : PX.hold[0], n = pickInt(PX.again);
          for (let k = 0; k <= n; k++) tl.set(c, { opacity: k % 2 ? 1 : 0 }, PX.blink + k * (PX.blink + stay));
          tl.call(() => !wiped.has(c) && gsap.set(c, { opacity: 1 }), null, PX.blink + n * (PX.blink + stay));
        });
      }
    };
    const loop = () => { shake(); gsap.delayedCall(pick(PX.rest), loop); };
    return {
      hide: () => gsap.set(cells, { opacity: 0 }),
      // When switching on ends, after a rest the wobble runs. Calling again attaches one more wobble loop (the original icon title does the same each time it re-enters)
      show(delay, rest) {
        const tl = gsap.timeline({ delay, onComplete: () => this.run(rest) });
        gsap.utils.shuffle([...cells]).forEach((c, i) => tl.set(c, { opacity: 1 }, i * PX.order + PX.on));
      },
      run(rest) {
        if (!this.bound) { this.bound = true; host.addEventListener("pointermove", sweep); host.addEventListener("pointerleave", () => (prev = null)); }
        gsap.delayedCall(rest, loop);
      },
    };
  };
  // Icon title — each time its top edge touches 85% of the screen (after the ready door opens) the cell turns on, and the title text goes only the first time, rising from 110% below inside, .15s late, in .8s (.16,1,.3,1)
  $$("[data-icon-title]").forEach((el) => {
    const iconEl = el.querySelector(".vs-icon-title__icon"), text = el.querySelector(".vs-icon-title__title > div");
    if (reduce) return;
    const icon = iconEl && pixelIcon(iconEl);
    icon?.hide();
    if (text) {
      const mask = document.createElement("div");
      mask.className = "vs-text-mask";
      text.replaceWith(mask);
      mask.append(text);
      gsap.set(text, { yPercent: 110 });
    }
    let risen = false;
    const enter = () => {
      icon?.show(0, 2);
      if (text && !risen) { risen = true; gsap.to(text, { yPercent: 0, duration: 0.8, delay: 0.15, ease: bez(0.16, 1, 0.3, 1) }); }
    };
    ScrollTrigger.create({ trigger: el, start: el.dataset.start || "top 85%", onEnter: () => ready.then(enter) });
  });
  // Icon row — once only: each icon’s cell turns on .15s later than the last, then rests 1s and sways
  $$("[data-icons-list]").forEach((el) => {
    const icons = $$("[data-svg]", el).map(pixelIcon);
    if (!icons.length || reduce) return;
    icons.forEach((i) => i.hide());
    ScrollTrigger.create({ trigger: el, start: el.dataset.start || "top 85%", once: true, onEnter: () => ready.then(() => icons.forEach((i, k) => i.show(k * 0.15, 1))) });
  });
  if (!reduce) Promise.all([document.fonts.ready, ready]).then(() => $$("[data-svg]:not([data-svg-defer])").forEach((el) => pixelIcon(el).run(pick(PX.solo))));
  // Shaking tag — original keyframes (shared.css vs-tag-vibrate, tilts twice briefly every 5.5s). Story strip tags are attached by index.js with VS.vibrate after their appearance ends
  const vibrate = (el) => el.classList.add("is-vibrating");
  VS.vibrate = vibrate;
  $$("[data-vibrate]").forEach(vibrate);

  // Bottom-right panel stack — the cookie panel enters from beyond the right at .6s power3.out, followed in turn by the product offer and the lifetime pass
  const cookie = document.querySelector("[data-cookie]");
  const push = document.querySelector("[data-push]");
  // The product offer is a panel attached to the hero header — when the header’s bottom edge rises above the screen bottom it leaves the group and stays at the header’s lower right, rising along with it
  // (the panel above drops by that much), and when it comes back down it returns to the bundle
  const hero = document.querySelector(".vs-hero");
  if (push && hero) {
    const stack = push.parentElement, next = push.nextElementSibling;
    const out = () => {
      const o = hero.getBoundingClientRect().bottom <= innerHeight;
      if (o === push.classList.contains("is-out")) return;
      push.classList.toggle("is-out", o);
      if (o) hero.append(push); else { push.style.right = ""; stack.insertBefore(push, next); }
    };
    addEventListener("scroll", out, { passive: true });
    out();
  }
  // Like the original, the plate stack stays 12px above the footer top when the footer rises — pushed up by the overlapped amount
  const foot = document.querySelector(".vs-foot"), stackEl = document.querySelector(".vs-stack");
  if (foot && stackEl) {
    const lifts = new Map();
    // As in the original, per panel — each rises only as much as its bottom edge passes 12px above the footer’s top edge
    const clamp = () => [...stackEl.children].forEach((k) => { const l = lifts.get(k) || 0, n = Math.max(0, k.getBoundingClientRect().bottom + l - (foot.getBoundingClientRect().top - 12)); lifts.set(k, n); gsap.set(k, { y: -n }); });
    clamp();
    ScrollTrigger.create({ trigger: foot, start: "top bottom", end: "bottom top", onUpdate: clamp, onRefresh: clamp });
  }
  const life = document.querySelector("[data-life]");
  watchTheme(life);
  const slideIn = (el, delay) => el && !reduce && gsap.fromTo(el, { x: el.offsetWidth + 12 }, { x: 0, duration: 0.6, ease: "power3.out", delay });
  const dismiss = (el) => el && gsap.to(el, { x: el.offsetWidth + 12, duration: 0.2, ease: "power3.inOut", onComplete: () => (el.style.display = "none") });
  stackReady.then(() => {
    if (cookie) { if (reduce) gsap.set(cookie, { x: 0 }); else slideIn(cookie, 0.6); }
    slideIn(push, 0.9);
    slideIn(life, 1.2);
    // Lifetime pass bar — the first cell fills in 1.2s power3.out (current stage)
    const fills = $$("[data-life-fill]", life || document);
    if (fills[0]) gsap.fromTo(fills[0], { scaleX: 0 }, { scaleX: 0.12, duration: reduce ? 0 : 1.2, ease: "power3.out", delay: 1.6 });
  });
  $$("[data-cookie-ok]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); dismiss(cookie); }));
  document.querySelector("[data-life-close]")?.addEventListener("click", () => dismiss(life));

  // Page transition — after clicking an inner link, .1s later 10px cells cover the screen in random order over .4s and then it moves on.
  // The next page opens covered, and the cells clear in random order over .5s
  if (!reduce) {
    const veil = document.createElement("canvas");
    veil.className = "vs-veil";
    veil.setAttribute("aria-hidden", "true");
    document.body.append(veil);
    const CELL = 10, cols = Math.ceil(innerWidth / CELL) + 1, rows = Math.ceil(innerHeight / CELL) + 1;
    veil.width = cols; veil.height = rows;
    const vc = veil.getContext("2d");
    vc.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--kf-contrast-bg").trim();
    const run = (cover, ms, done) => {
      const order = gsap.utils.shuffle([...Array(cols * rows).keys()]);
      if (!cover) vc.fillRect(0, 0, cols, rows);
      veil.style.visibility = "visible";
      const t0 = performance.now();
      let k = 0;
      const step = (now) => {
        const n = Math.min(order.length, Math.round(((now - t0) / ms) * order.length));
        for (; k < n; k++) (cover ? vc.fillRect : vc.clearRect).call(vc, order[k] % cols, Math.floor(order[k] / cols), 1, 1);
        if (k < order.length) requestAnimationFrame(step); else done?.();
      };
      requestAnimationFrame(step);
    };
    let came = false;
    try { came = sessionStorage.getItem("vs-veil") === "1"; sessionStorage.removeItem("vs-veil"); } catch {}
    if (came) { vc.fillRect(0, 0, cols, rows); veil.style.visibility = "visible"; run(false, 500, () => (veil.style.visibility = "hidden")); }
    document.addEventListener("click", (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname || a.getAttribute("href").startsWith("#")) return;
      e.preventDefault();
      try { sessionStorage.setItem("vs-veil", "1"); } catch {}
      setTimeout(() => run(true, 400, () => location.assign(u.href)), 100);
    });
  }

  // Footer clock — the hands turn with the real time
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const h = clock.querySelector(".hour-hand"), m = clock.querySelector(".min-hand"), s = clock.querySelector(".second-hand");
    const tick = () => {
      const d = new Date(), sec = d.getSeconds() + d.getMilliseconds() / 1000, min = d.getMinutes() + sec / 60, hr = (d.getHours() % 12) + min / 60;
      h.setAttribute("transform", `rotate(${hr * 30} 50 50)`);
      m.setAttribute("transform", `rotate(${min * 6} 50 50)`);
      s.setAttribute("transform", `rotate(${Math.floor(sec) * 6} 50 50)`);
    };
    tick();
    gsap.ticker.add(tick);
  }

  // Cursor pixel tail: paints the path passed in 8px cells (max 40 cells), and each cell shrinks 8 → 2px and fades over .45s. Pressing bursts 14 points within a 40px radius
  if (fine && !reduce) {
    const CELL = 8, LIFE = 450, KEEP = 40, MAX = 400, SIZES = [4, 8, 8, 12, 16, 24];
    const cv = document.createElement("canvas");
    cv.className = "vs-trail";
    cv.setAttribute("aria-hidden", "true");
    document.body.append(cv);
    const ctx = cv.getContext("2d");
    let dpr = 1, dots = [], last = null, raf = null;
    const color = () => getComputedStyle(document.documentElement).getPropertyValue("--site-trail").trim();
    let fill = color();
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 2); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    resize();
    addEventListener("resize", resize);
    const wake = () => { if (raf === null) raf = requestAnimationFrame(tick); };
    function tick(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.fillStyle = fill;
      dots = dots.filter((d) => now - d.t < LIFE);
      for (const d of dots) {
        const a = now - d.t;
        if (a < 0) continue;
        const k = 1 - a / LIFE, size = Math.max(2, Math.round(d.cell * k)), off = Math.floor((d.cell - size) / 2);
        let x = d.x, y = d.y;
        if (d.burst) { x = Math.floor((d.ox + Math.cos(d.a) * d.r) / d.cell); y = Math.floor((d.oy + Math.sin(d.a) * d.r) / d.cell); }
        ctx.globalAlpha = Math.min(1, k);
        ctx.fillRect(x * d.cell + off, y * d.cell + off, size, size);
      }
      ctx.globalAlpha = 1;
      if (dots.length) raf = requestAnimationFrame(tick); else { raf = null; last = null; }
    }
    addEventListener("pointermove", (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      const cx = Math.floor(e.clientX / CELL), cy = Math.floor(e.clientY / CELL), now = performance.now(), o = last || { cx, cy };
      const n = Math.max(Math.abs(cx - o.cx), Math.abs(cy - o.cy), 1);
      for (let i = 1; i <= n; i++) {
        const x = Math.round(o.cx + ((cx - o.cx) * i) / n), y = Math.round(o.cy + ((cy - o.cy) * i) / n), p = dots[dots.length - 1];
        if (p && !p.burst && p.x === x && p.y === y) p.t = now; else dots.push({ x, y, t: now, cell: CELL });
      }
      const trail = dots.filter((d) => !d.burst);
      if (trail.length > KEEP) { const drop = new Set(trail.slice(0, trail.length - KEEP)); dots = dots.filter((d) => !drop.has(d)); }
      if (dots.length > MAX) dots.splice(0, dots.length - MAX);
      last = { cx, cy };
      wake();
    }, { passive: true });
    addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || (e.pointerType && e.pointerType !== "mouse")) return;
      const now = performance.now();
      for (let i = 0; i < 14; i++) dots.push({ burst: true, ox: e.clientX, oy: e.clientY, a: Math.random() * Math.PI * 2, r: (0.1 + Math.random() * 0.9) * 5 * CELL, cell: SIZES[Math.floor(Math.random() * SIZES.length)], t: now - Math.random() * LIFE * 0.6 });
      fill = color();
      wake();
    });
  }

  // First-visit loader — only the background stands, then the wordmark turns on and sways gently, drops once big and bounces, then settles into the header logo spot (5.3s). If seen within a week, it clears right away
  const loader = document.querySelector("[data-loader]");
  const KEY = "xy_intro_seen_at", WEEK = 7 * 24 * 3600 * 1000;
  const seen = () => { try { return Date.now() - Number(localStorage.getItem(KEY)) < WEEK; } catch { return true; } };
  if (!loader) { open(); goStack(); }
  else if (reduce || (seen() && !/debug-intro/.test(location.search))) { gsap.set(loader, { autoAlpha: 0 }); loader.remove(); open(); goStack(); }
  else {
    const logo = loader.querySelector(".vs-loader__logo"), letters = $$("[data-letter]", loader), navLogo = document.querySelector(".vs-nav__logo");
    gsap.set(loader, { autoAlpha: 1 });
    if (navLogo) gsap.set(navLogo, { autoAlpha: 0 });
    lenis?.stop();
    // Watching the original loader as a film from the first frame — only the background stands for 1.25s, then the wordmark turns on, and the letters bob gently until 3.55s while the video inside the symbol plays.
    // At 3.55s the letters drop big in turn (.015) and bounce, pause until 4.7s, attach to the header logo spot (.25s), and the background lifts at 4.95 ~ 5.3s
    const tl = gsap.timeline({ onComplete: () => {
      try { localStorage.setItem(KEY, String(Date.now())); } catch {}
      if (navLogo) gsap.set(navLogo, { autoAlpha: 1 });
      gsap.set(loader, { autoAlpha: 0 });
      loader.remove();
      lenis?.start();
    } });
    const H = innerHeight;
    gsap.set(logo, { autoAlpha: 0 });
    tl.set(logo, { autoAlpha: 1 }, 1.25);
    letters.forEach((el, i) => {
      const t = 3.55 + i * 0.015;
      tl.to(el, { y: H * (0.006 + (i % 3) * 0.002) * (i % 2 ? -1 : 1), duration: 1.15, ease: "sine.inOut", yoyo: true, repeat: 1 }, 1.25)
        .to(el, { y: H * 0.16, duration: 0.1, ease: "power2.in" }, t)
        .to(el, { y: 0, duration: 0.18, ease: "power3.out" }, t + 0.1);
    });
    // In the original, video plays inside the logo symbol and switches to the symbol just before attaching — we run a flowing pattern in the same spot until 4.7s
    const grad = loader.querySelector("[data-sigle-grad]"), film = loader.querySelector("[data-sigle-film]");
    if (grad) {
      const g = { p: 0 };
      tl.to(g, { p: 1, duration: 3.45, ease: "none", onUpdate: () => { const x = Math.sin(g.p * Math.PI * 7) * 40; grad.setAttribute("x1", String(x)); grad.setAttribute("x2", String(54 + x)); } }, 1.25)
        .to(film, { opacity: 0, duration: 0.15 }, 4.7);
    }
    if (navLogo) {
      const dock = () => { const a = logo.getBoundingClientRect(), b = navLogo.getBoundingClientRect(); return { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top - a.top, s: b.width / a.width }; };
      let d = null;
      tl.add(() => (d = dock()), 4.7)
        .to(logo, { x: () => d.x, y: () => d.y, scale: () => d.s, transformOrigin: "50% 0%", duration: 0.25, ease: "expo.inOut" }, 4.7)
        .to(loader, { backgroundColor: "transparent", duration: 0.35, ease: "power1.inOut" }, 4.95);
    } else tl.to(loader, { autoAlpha: 0, duration: 0.35 }, 4.95);
    // Once it sticks, the touch goes to the page underneath — the copy loads earlier than the original, so the first touch lands near the end of the loader
    tl.set(loader, { pointerEvents: "none" }, 4.7);
    // The page entrance motion runs first under the loader during the pause, so it is nearly still when the backdrop lifts
    setTimeout(goStack, 2400);
    setTimeout(open, 3800);
  }
})();
