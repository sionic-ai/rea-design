// Shared by every page — header, drawer menu, footer fill, Lenis (lerp .165), barba page transition (logo-shaped hole), first loader, mouse-follower cursor,
// Two-line roll link, circle-spread button, direction tile, logo wall. Page scripts are registered with RW.page(name, attach), and barba detaches and reattaches them on each transition.
// Original values: drawer clip 0→100% .8s power4.inOut (close .6s power3.inOut) · items .9s power4.out gap .05 (.4 late) · hamburger lines xPercent 101 .45s power3.in gap .06 →
//            X line scaleX .5s power3.out stagger .1(.35) · loader white panel .7s, the original opens the hole once the first video is ready (measured 4.1s — the copy is fixed at 3.38s) hole .75s expoInOut · transition hole 1.2s osmo · old body y −10vh·1.2x.
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches && !("ontouchstart" in window);
  gsap.registerPlugin(...[window.ScrollTrigger, window.CustomEase, window.SplitText].filter(Boolean));
  if (window.CustomEase) {
    CustomEase.create("osmo", "0.625, 0.05, 0, 1");
    CustomEase.create("expoInOut", "M0,0 C0.87,0 0.13,1 1,1");
    CustomEase.create("cubic", "0.66, 0, 0.34, 1");
    CustomEase.create("icons", "0.16, 1.36, 0.66, 1.02");
    CustomEase.create("iconsBack", "M0,0 C0.2464,0.9322 0.4,1 1,1");
    CustomEase.create("switch", "0.4, 0, 0.2, 1");
  }
  // In the original, every tween without a given curve or duration is osmo .6s (gsap.defaults)
  gsap.defaults({ ease: window.CustomEase ? "osmo" : "power3.inOut", duration: 0.6 });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Logo — a tag shape with a pointed right end (five points of the original 409.9×204.81). The hole loader and the transition use the same shape
  const TAG = { w: 409.9, h: 204.81, pts: [[393.01, 204.81], [0, 204.81], [0, 0], [388.49, 0], [409.9, 102.41]] };
  const LOGO = `<svg viewBox="0 0 410 205" aria-hidden="true"><path fill="currentColor" d="M0 0H388.49L409.9 102.41L393.01 204.81H0Z"/><text class="mark-ink" x="24" y="92" font-size="78" font-weight="700" font-family="inherit">Name</text><text class="mark-ink" x="24" y="176" font-size="78" font-weight="700" font-family="inherit">Castle</text></svg>`;
  const MENU = [["index.html", "Hero"], ["about.html", "About"], ["list.html", "Work"], ["showreel.html", "Showreel"]];
  const roll = (a, b = a, c) => `<span class="rw-roll__text"><span class="rw-roll__el">${a}</span><span class="rw-roll__el">${b}</span>${c ? `<span class="rw-roll__el">${c}</span>` : ""}</span>`;
  const page = () => document.body.dataset.page;

  function build() {
    const h = $('[data-slot="header"]');
    if (h && !h.dataset.built) {
      h.dataset.built = "1";
      h.classList.add("rw-header");
      h.innerHTML = `<nav class="rw-nav"><a class="rw-logo" href="index.html" aria-label="Hero">${LOGO}</a>
        <button class="rw-menu-toggle" type="button" aria-label="Menu" aria-expanded="false"><span class="rw-menu-toggle__label"><span>Menu</span><span>Close</span></span>
        <span class="rw-burger"><span class="rw-burger__lines"><span class="rw-burger__line"></span><span class="rw-burger__line"></span></span><span class="rw-burger__cross"><span class="rw-burger__x"><span></span></span><span class="rw-burger__x"><span></span></span></span></span></button></nav>`;
    }
    const m = $('[data-slot="menu"]');
    if (m && !m.dataset.built) {
      m.dataset.built = "1";
      m.innerHTML = `<div class="rw-backdrop"></div><nav class="rw-sidebar" aria-label="Site Menu" inert><div class="rw-sidebar__in"><div>
        <span class="rw-sidebar__icon">${LOGO}</span>
        <div class="rw-sidebar__links">${MENU.map(([u, t]) => `<div class="rw-reveal"><a class="rw-roll rw-reveal__item${u === (location.pathname.split("/").pop() || "index.html") ? " is-current" : ""}" href="${u}">${roll(t)}</a></div>`).join("")}</div></div>
        <div class="rw-sidebar__contact"><div class="rw-reveal"><span class="rw-reveal__item muted">Contact</span></div>
        <div class="rw-reveal"><button class="rw-roll rw-reveal__item" type="button" data-copy>${roll("hello@example.com", "Press to copy", "Copied!")}</button></div>
        <div class="rw-reveal"><a class="rw-roll rw-reveal__item" href="#">${roll("+00 0 00 00 00 00")}</a></div>
        <div class="rw-reveal"><a class="rw-roll rw-reveal__item" href="#">${roll("Send a message")}</a></div></div></div></nav>`;
    }
    const f = $('[data-slot="footer"]');
    if (f && !f.dataset.built) {
      f.dataset.built = "1";
      f.classList.add("rw-footer");
      const cur = page();
      const link = (u, t, key, img) => `<a class="rw-dir${cur === key ? " is-current" : ""}" href="${u}" data-dir><span class="rw-dir__tile"></span>${t}${img ? `<span class="rw-dir__img rw-ph wf-img" data-label="Person"></span>` : ""}</a>`;
      f.innerHTML = `<div class="rw-container"><div class="rw-row">
        <div class="rw-footer__links"><p class="rw-eyebrow">See more</p>${link("index.html", "Hero", "home")}${link("about.html", "About", "about", true)}${link("list.html", "Work", "works")}${link("showreel.html", "Showreel", "showreel")}</div>
        <div class="rw-footer__side"><div class="rw-footer__contact"><p class="rw-eyebrow">Contact</p><button class="rw-roll" type="button" data-copy>${roll("hello@example.com", "Press to copy", "Copied!")}</button><a class="rw-roll" href="#">${roll("+00 0 00 00 00 00")}</a></div>
          <div class="rw-footer__socials"><p class="rw-eyebrow">Social</p><a class="rw-roll" href="#">${roll("Social One")}</a><a class="rw-roll" href="#">${roll("Social two")}</a><a class="rw-roll" href="#">${roll("Messenger")}</a></div></div>
        <div class="rw-footer__clients"><p class="rw-eyebrow">Places we’ve been</p><div class="rw-logos" data-logo-wall>${Array.from({ length: 6 }, () => `<div class="rw-logos__item"><div class="rw-logos__slot"></div></div>`).join("")}</div></div>
        <div class="rw-footer__bottom"><span>©0000 Name</span><a href="#">Where it’s made</a></div></div></div>`;
    }
  }

  // ── Drawer Menu ──
  let menuOpen = false, menuTl = null, burgerTl = null;
  const lines = () => $$(".rw-burger__line"), cross = () => $$(".rw-burger__x span");
  function burger(open) {
    burgerTl?.kill();
    burgerTl = gsap.timeline();
    if (open) burgerTl.to(lines(), { xPercent: 101, duration: 0.45, ease: "power3.in", stagger: 0.06 }, 0).set(cross(), { transformOrigin: "left center" }, 0).to(cross(), { scaleX: 1, duration: 0.5, ease: "power3.out", stagger: 0.1 }, 0.35);
    else burgerTl.set(cross(), { transformOrigin: "right center" }, 0).to(cross(), { scaleX: 0, duration: 0.4, ease: "power3.in", stagger: 0.08 }, 0).fromTo(lines(), { xPercent: -101 }, { xPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 }, 0.3);
    if (reduce) burgerTl.progress(1);
  }
  function setMenu(open) {
    if (open === menuOpen) return;
    menuOpen = open;
    const sb = $(".rw-sidebar"), bd = $(".rw-backdrop");
    menuTl?.kill();
    menuTl = gsap.timeline();
    if (open) {
      sb.removeAttribute("inert");
      menuTl.to(sb, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power4.inOut" }, 0)
        .to(bd, { opacity: 1, pointerEvents: "all", duration: 0.6 }, 0)
        .fromTo(".rw-sidebar__icon", { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.4)
        .fromTo(".rw-sidebar .rw-reveal__item", { y: (i, el) => el.parentElement.offsetHeight }, { y: 0, duration: 0.9, ease: "power4.out", stagger: 0.05 }, 0.4);
      window.rwLenis?.stop();
    } else {
      sb.setAttribute("inert", "");
      menuTl.to(sb, { clipPath: "inset(0% 0% 0% 100%)", duration: 0.6, ease: "power3.inOut" }, 0).to(bd, { opacity: 0, pointerEvents: "none", duration: 0.5 }, 0);
      window.rwLenis?.start();
    }
    if (reduce) menuTl.progress(1);
    burger(open);
    $(".rw-menu-toggle")?.setAttribute("aria-expanded", String(open));
  }
  document.addEventListener("click", (e) => { if (e.target.closest?.(".rw-menu-toggle, .rw-backdrop")) setMenu(!menuOpen); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) setMenu(false); });

  // ── Attach (to the new body on every page change) ──
  function copyEmail(root) {
    $$("[data-copy]", root).forEach((b) => b.addEventListener("click", () => {
      navigator.clipboard?.writeText("hello@example.com").catch(() => {});
      b.classList.add("is-copied");
    }));
    $$("[data-copy]", root).forEach((b) => b.addEventListener("mouseleave", () => b.classList.remove("is-copied")));
  }
  // A button where a circle spreads — put the circle where the hand entered and grow it by the distance from the center (115% + 2×distance)
  function btns(root) {
    if (!fine) return;
    $$(".rw-btn", root).forEach((b) => {
      const c = $(".rw-btn__circle", b);
      if (!c || b.dataset.btnInit) return;
      b.dataset.btnInit = "1";
      const at = (e) => { const r = b.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100; c.style.left = `${x.toFixed(1)}%`; c.style.top = `${y.toFixed(1)}%`; c.style.width = `${(115 + 2 * Math.abs(x - 50)).toFixed(1)}%`; };
      b.addEventListener("mouseenter", (e) => { at(e); document.body.classList.add("btn-hovered"); });
      b.addEventListener("mouseleave", (e) => { at(e); document.body.classList.remove("btn-hovered"); });
    });
  }
  // Directional tile — a gray tile covers from the edge the hand entered over .5s and slides out toward the side it left
  function directional(root) {
    const T = { top: "translateY(calc(-100% - 2px))", bottom: "translateY(calc(100% + 2px))", left: "translateX(calc(-100% - 2px))", right: "translateX(calc(100% + 2px))" };
    const side = (e, el) => { const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; const d = { top: y, right: r.width - x, bottom: r.height - y, left: x }; return Object.entries(d).reduce((a, b) => (a[1] < b[1] ? a : b))[0]; };
    $$("[data-dir]", root).forEach((a) => {
      const t = $(".rw-dir__tile", a);
      if (a.classList.contains("is-current")) return;
      a.addEventListener("mouseenter", (e) => { t.style.transition = "none"; t.style.transform = T[side(e, a)]; t.offsetHeight; t.style.transition = ""; t.style.transform = "translate(0%, 0%)"; });
      a.addEventListener("mouseleave", (e) => { t.style.transform = T[side(e, a)]; });
    });
  }
  // Logo wall — rests 1.5s, then the logos change one cell at a time in shuffled order: the old one goes −50% over .9s expo.inOut, the new one comes from +50% .1 later
  let wallOff = null;
  function logoWall() {
    wallOff?.();
    const wall = $("[data-logo-wall]");
    if (!wall) return;
    const slots = $$(".rw-logos__slot", wall).filter((s) => getComputedStyle(s.parentElement).display !== "none");
    const make = (i) => { const d = document.createElement("div"); d.className = "rw-logos__mark"; d.innerHTML = `<span class="wf-logo">Customer ${i + 1}</span>`; return d; };
    let pool = Array.from({ length: 12 }, (_, i) => make(i));
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    $$(".rw-logos__slot", wall).forEach((s) => (s.innerHTML = ""));
    pool = shuffle(pool);
    slots.forEach((s) => s.appendChild(pool.shift()));
    const order = shuffle(slots.map((_, i) => i));
    let k = 0;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
    tl.call(() => {
      const s = slots[order[k++ % slots.length]], old = s.firstElementChild, nu = pool.shift();
      if (!nu) return;
      gsap.set(nu, { yPercent: 50, autoAlpha: 0 });
      s.appendChild(nu);
      if (old) gsap.to(old, { yPercent: -50, autoAlpha: 0, duration: 0.9, ease: "expo.inOut", onComplete: () => { old.remove(); pool.push(old); } });
      gsap.to(nu, { yPercent: 0, autoAlpha: 1, duration: 0.9, delay: 0.1, ease: "expo.inOut" });
    });
    if (reduce) tl.pause();
    const st = window.ScrollTrigger ? ScrollTrigger.create({ trigger: wall, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive && !reduce ? tl.play() : tl.pause()) }) : null;
    wallOff = () => { tl.kill(); st?.kill(); };
  }

  // ── Cursor (mouse-follower 1.2.1 defaults: speed .55 expo.out · text and icon state tilt 2) — as in the original, the library reads data-cursor-icon and
  //    icons are pulled from the sprite in the site folder (icons.svg — play, pause, down, swap)
  let cursor = null;
  function cursorInit() {
    if (!fine || reduce || !window.MouseFollower) return;
    MouseFollower.registerGSAP(gsap);
    cursor = new MouseFollower({ speed: 0.55, ease: "expo.out", iconSvgSrc: "icons.svg" });
    RW.cursor = cursor;
    // Hides when leaving the window — also catches cases where the library’s body mouseleave does not arrive (exiting through the window edge) by listening at document level
    document.documentElement.addEventListener("mouseleave", () => cursor.hide());
    document.documentElement.addEventListener("mouseenter", () => cursor.show());
  }

  // ── Logo-shaped hole (original clip-path polygon) ──
  function coverScale(w, h) { // Scale at which the tag covers the whole screen
    const n = w / 2, r = h / 2, i = TAG.w / 2, o = TAG.h / 2;
    let s = Math.max(w / TAG.w, h / TAG.h);
    const [a, l] = TAG.pts[4], c = a - i, u = l - o;
    for (const [x, y] of [TAG.pts[3], TAG.pts[0]]) { const yy = y - o, k = (c - (x - i)) / Math.abs(yy - u); s = Math.max(s, (n + r * k) / c); }
    return s;
  }
  const tagPoly = (s, w, h) => TAG.pts.map(([x, y]) => `${(w / 2 + (x - TAG.w / 2) * s).toFixed(2)}px ${(h / 2 + (y - TAG.h / 2) * s).toFixed(2)}px`).join(", ");
  const tagClip = (t) => `polygon(${tagPoly(coverScale(innerWidth, innerHeight) * t, innerWidth, innerHeight)})`;
  // Hole in the film — a one-line polygon that goes around the outer rectangle and in and out around the tag
  function holeClip(s, w, h) {
    const pts = [2, 1, 0, 4, 3].map((k) => [w / 2 + (TAG.pts[k][0] - TAG.w / 2) * s, h / 2 + (TAG.pts[k][1] - TAG.h / 2) * s]);
    const seam = [0, pts[0][1]];
    return `polygon(${[[0, 0], [w, 0], [w, h], [0, h], seam, ...pts, pts[0], seam].map(([x, y]) => `${x.toFixed(2)}px ${y.toFixed(2)}px`).join(", ")})`;
  }
  function loader() {
    const L = $(".rw-loader"), F = $(".rw-loader-fill");
    if (!L) return Promise.resolve();
    if (sessionStorage.getItem("rw-seen") || reduce) { L.remove(); F?.remove(); return Promise.resolve(); }
    sessionStorage.setItem("rw-seen", "1");
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;height:0;width:var(--logo-w)";
    L.append(probe);
    const s0 = probe.getBoundingClientRect().width / TAG.w;
    probe.remove();
    const st = { t: 0 };
    const paint = () => { const w = innerWidth, h = innerHeight, s1 = coverScale(w, h) * 1.02; L.style.clipPath = holeClip(s0 + (s1 - s0) * st.t, w, h); };
    paint();
    addEventListener("resize", paint);
    return new Promise((res) => {
      gsap.timeline({ delay: 3.38, onComplete: () => { L.remove(); F?.remove(); removeEventListener("resize", paint); res(); } })
        .to(F, { opacity: 0, duration: 0.55 }, 0)
        .to(st, { t: 1, duration: 0.75, ease: "expoInOut", onUpdate: paint }, 0);
    });
  }

  // ── Page register · attach ──
  const pages = {};
  let off = [];
  const RW = (window.RW = { pages, reduce, fine, $, $$, roll, tagClip, cursor: null });
  RW.page = (name, fn) => { pages[name] = fn; if (RW.ready && page() === name) mountPage(document); };
  function mountPage(root) {
    off.forEach((f) => f && f());
    off = [];
    build();
    const c = $('[data-barba="container"]', root) || root;
    copyEmail(c);
    btns(c);
    directional(c);
    logoWall();
    const fn = pages[c.dataset.barbaNamespace || page()];
    if (fn) off.push(fn(c));
    window.ScrollTrigger && ScrollTrigger.refresh();
  }

  // ── Lenis ──
  function smooth() {
    if (reduce || !window.Lenis) return;
    const lenis = new Lenis({ lerp: 0.165 });
    window.rwLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── barba(2.10.3): pins the new content in the same spot and opens a logo-shaped hole at 1.2s osmo. The old content goes −10vh and 1.2x, dark curtain 1.2s ──
  const loaded = new Set([...document.scripts].map((s) => s.getAttribute("src")).filter(Boolean));
  async function bring(htmlText) {
    const doc = new DOMParser().parseFromString(htmlText, "text/html");
    const waits = [];
    $$('link[rel="stylesheet"]', doc).forEach((l) => {
      const href = l.getAttribute("href");
      if ($$('link[rel="stylesheet"]').some((x) => x.getAttribute("href") === href)) return;
      const n = document.createElement("link"); n.rel = "stylesheet"; n.href = href;
      waits.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.head.append(n);
    });
    for (const s of $$("script[src]", doc)) {
      const src = s.getAttribute("src");
      if (loaded.has(src)) continue;
      loaded.add(src);
      await new Promise((r) => { const n = document.createElement("script"); n.src = src; n.onload = n.onerror = r; document.body.append(n); });
    }
    document.body.dataset.page = doc.body.dataset.page || "";
    await Promise.all(waits);
  }
  function transitions() {
    if (!window.barba || !/^https?:$/.test(location.protocol)) return fallbackNav();
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.init({
      debug: false, timeout: 7000, preventRunning: true,
      prevent: ({ el }) => { const h = el?.getAttribute("href") || ""; return !h || h.startsWith("#") || /^(mailto|tel|https?):/.test(h) || !!el.closest(".wf-ui"); },
      transitions: [{
        name: "default", sync: true,
        async beforeEnter({ next }) { await bring(next.html); },
        leave({ current, next }) {
          setMenu(false);
          window.rwLenis?.stop();
          off.forEach((f) => f && f()); off = [];
          window.ScrollTrigger && ScrollTrigger.getAll().forEach((t) => t.disable(false));
          const y = scrollY, dark = $(".rw-transition__dark");
          gsap.set($("main", current.container), { position: "fixed", top: -y, left: 0, width: "100%", overflow: "hidden", zIndex: 1 });
          scrollTo(0, 0);
          gsap.set(next.container, { position: "fixed", top: 0, left: 0, right: 0, width: "100%", height: "100vh", overflow: "clip", zIndex: 11, clipPath: tagClip(0), visibility: "hidden", opacity: 0 });
          const st = { t: 0 }, first = 2 / (coverScale(innerWidth, innerHeight) * TAG.h);
          let shown = false;
          return gsap.timeline()
            .fromTo(dark, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "osmo" })
            .to(st, { t: 1, duration: 1.2, ease: "osmo", onUpdate: () => { next.container.style.clipPath = tagClip(st.t); if (!shown && st.t >= first) { shown = true; gsap.set(next.container, { visibility: "visible", opacity: 1 }); } } }, "<")
            .to($("main", current.container), { y: "-10vh", scale: 1.2, duration: 1.2, ease: "osmo" }, "<")
            .set(dark, { autoAlpha: 0 });
        },
        enter() {},
        after({ next }) {
          gsap.set(next.container, { clearProps: "position,top,left,right,width,height,overflow,zIndex,clipPath,visibility,opacity" });
          window.ScrollTrigger && ScrollTrigger.getAll().forEach((t) => t.kill());
          window.rwLenis?.start();
          mountPage(next.container);
          $$('.rw-dir').forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === location.pathname.split("/").pop()));
        },
      }],
    });
  }
  // On file:// barba can’t fetch pages — use the same cover but open the document fresh and open the hole on the new page side
  function fallbackNav() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank" || a.closest(".wf-ui")) return;
      const h = a.getAttribute("href");
      if (!h || h.startsWith("#") || /^(mailto|tel|https?):/.test(h)) return;
      e.preventDefault();
      sessionStorage.setItem("rw-nav", "1");
      setMenu(false);
      gsap.timeline({ onComplete: () => (location.href = h) })
        .fromTo(".rw-transition__dark", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "osmo" })
        .to("main", { y: "-10vh", scale: 1.2, duration: 0.6, ease: "osmo" }, "<");
    });
    if (sessionStorage.getItem("rw-nav")) {
      sessionStorage.removeItem("rw-nav");
      const c = $('[data-barba="container"]'), st = { t: 0 };
      if (c && !reduce) gsap.to(st, { t: 1, duration: 1.2, ease: "osmo", onStart: () => (c.style.clipPath = tagClip(0)), onUpdate: () => (c.style.clipPath = tagClip(st.t)), onComplete: () => (c.style.clipPath = "") });
    }
  }

  build();
  document.addEventListener("DOMContentLoaded", async () => {
    if (!$(".rw-transition")) { const t = document.createElement("div"); t.className = "rw-transition"; t.innerHTML = '<div class="rw-transition__dark"></div>'; document.body.append(t); }
    smooth();
    cursorInit();
    transitions();
    RW.loaderDone = loader();
    RW.ready = true;
    mountPage(document);
  });
})();
