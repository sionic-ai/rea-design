/* Spanning pages — Lenis (lerp .15), white-curtain loader, header that hides on scroll down, menu drawer, text splitting, bent arrow · outside arrow hover,
   News drawer, parallax photo, footer cover, page transition (barba 2.10.3 — a background curtain fills up and the next page name rises and drops away).
   Scene for each page is set with AD.view(name, { init, destroy }) hooked by index.js and works.js. When opened as a file (file://) barba can’t fetch, so it runs the same transition and then hands over the document. */
(() => {
  const html = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => matchMedia("(min-width: 1025px) and (any-hover: hover)").matches;
  const views = {};
  const AD = (window.AD = { views, view: (ns, v) => (views[ns] = v), reduce, isPc, triggers: [] });
  const nsOf = (c) => c?.dataset.transitionNamespace || "home";
  let namespace = nsOf($('[data-transition="container"]'));
  const SPA = location.protocol !== "file:" && !!window.barba;
  const NAV_KEY = "ad-nav";

  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // ───── Smooth scroll — the original scrolls the .l-container panel on desktop, but here the window scrolls for easy reuse (same lerp) ─────
  const lenis = (AD.lenis = new Lenis({ lerp: reduce ? 1 : 0.15 }));
  let scrollY0 = 0;
  lenis.on("scroll", ({ scroll, direction }) => {
    scrollY0 = scroll;
    window.ScrollTrigger && ScrollTrigger.update();
    headerToggle(direction, scroll);
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  // ───── Header — hides upward when reading down (.4s sine.out −120%) and returns on scroll up. On the first page desktop, starts below the hero (1.1 screens + 100px) ─────
  const header = () => $(".l-header", $('[data-transition="container"]'));
  function headerToggle(dir, y) {
    const h = header();
    if (!h || html.classList.contains("is-menuOpen")) return;
    const edge = namespace === "home" && isPc() ? 1.1 * innerHeight + 100 : 20;
    if (dir > 0 && y > edge) {
      html.classList.remove("show-logo");
      html.classList.add("is-down");
      gsap.to(h, { duration: 0.4, ease: "sine.out", y: "-120%", overwrite: "auto" });
    } else if (dir < 0 && y > edge) {
      html.classList.remove("show-logo", "is-down");
      gsap.to(h, { duration: 0.4, ease: "sine.out", y: "0%", opacity: 1, overwrite: "auto" });
    } else html.classList.add("show-logo");
  }
  html.classList.add("show-logo");

  // ───── Text splitting — link text sparkles one character at a time (.05s each), menu big text rises one character at a time when the drawer opens ─────
  const splitChars = (el, wrap) => {
    if (el.dataset.split) return;
    el.dataset.split = "1";
    const words = el.textContent.trim().split(/(\s+)/);
    let i = 0;
    el.textContent = "";
    for (const w of words) {
      // The original counts spaces as one cell (.2em) when numbering the sequence — the big menu text is a single line so it keeps the space cells as they are, while link text that may wrap onto several lines keeps its whitespace
      if (/^\s+$/.test(w)) {
        if (wrap === "ch") { const sp = document.createElement("span"); sp.className = "ch"; sp.textContent = " "; el.append(sp); i++; }
        else { el.append(document.createTextNode(" ")); i++; }
        continue;
      }
      const box = document.createElement("span");
      box.style.cssText = "display:inline-block;white-space:nowrap";
      for (const ch of w) {
        const s = document.createElement("span");
        s.className = wrap;
        // Original: entrance delay is .05s per letter (inline), hover sparkle uses nth-child at .02s steps (first letter .02s)
        if (wrap === "c-ef__in") { s.style.transitionDelay = `${(i * 0.05).toFixed(2)}s`; s.style.animationDelay = `${((i + 1) * 0.02).toFixed(2)}s`; }
        s.textContent = ch;
        box.append(s);
        i++;
      }
      el.append(box);
    }
  };

  // ───── Mark when visible — data-shown (once), data-visible (right now) ─────
  let io = null;
  const inView = (root) => {
    io?.disconnect();
    io = new IntersectionObserver((list) => list.forEach((e) => {
      if (e.isIntersecting) { e.target.dataset.shown = "1"; e.target.dataset.visible = "1"; } else e.target.dataset.visible = "0";
    }), { threshold: 0 });
    $$(".js-iv", root).forEach((n) => io.observe(n));
  };
  const addEnterClass = (root = document) => $$(".js-enter", root).forEach((n) => n.classList.add("is-enter"));
  AD.addEnterClass = addEnterClass;

  // ───── Arrow hover — original values: horizontal bent arrow 1em→3em (.4s circ.inOut, exit .3s circ.out), vertical arrow viewBox 140×80→140×140, outer arrows leave and re-enter .12s apart ─────
  const hoverOff = [];
  const arrowH = (item) => {
    const svg = $(".i-h", item);
    if (!svg) return;
    const line = $(".i-line", svg), adv = $(".i-adv", svg);
    let tl1, tl2;
    const on = (e) => {
      if (e.target !== e.currentTarget) return;
      tl1 = gsap.timeline({ paused: true, defaults: { duration: 0.4, ease: "circ.inOut" } });
      tl1.set(line, { strokeDasharray: 462, strokeDashoffset: 154 })
        .to(line, { strokeDasharray: 462, strokeDashoffset: 0 })
        .to(svg, { width: "3em", attr: { viewBox: "0 0 360 80" } }, "<")
        .to(line, { attr: { points: "345 45 6 45 6 1" } }, "<")
        .to(adv, { x: 230 }, "<");
      tl2 && (tl2.pause(), tl2.seek(1));
      tl1.play();
    };
    const off = (e) => {
      if (e.target !== e.currentTarget) return;
      tl2 = gsap.timeline({ paused: true, defaults: { duration: 0.3, ease: "circ.out" } });
      tl2.to(svg, { width: "1em", attr: { viewBox: "0 0 120 80" } })
        .to(line, { strokeDasharray: 154, attr: { points: "115 45 6 45 6 1" } }, "<")
        .to(adv, { x: 0 }, "<");
      tl1 && (tl1.pause(), tl1.seek(1));
      tl2.play();
    };
    item.addEventListener("mouseenter", on, true);
    item.addEventListener("mouseleave", off, true);
    hoverOff.push(() => { item.removeEventListener("mouseenter", on, true); item.removeEventListener("mouseleave", off, true); });
  };
  const arrowV = (item) => {
    const svg = $(".i-v", item);
    if (!svg) return;
    const line = $(".i-line", svg), adv = $(".i-adv", svg);
    let tl1, tl2;
    const on = (e) => {
      if (e.target !== e.currentTarget) return;
      const dir = item.dataset.arrow === "revers" ? -1 : 1;
      tl1 = gsap.timeline({ paused: true, defaults: { duration: 0.4, ease: "circ.inOut" } });
      tl1.set(line, { strokeDasharray: 270, strokeDashoffset: 0 })
        .to(line, { strokeDasharray: 270, strokeDashoffset: 40 })
        .to(svg, { attr: { viewBox: "0 0 140 140" }, y: 10 * dir }, "<")
        .to(line, { attr: { points: "32 173 32 10 139 10" } }, "<")
        .to(adv, { y: 100 }, "<");
      tl2 && (tl2.pause(), tl2.seek(1));
      tl1.play();
    };
    const off = (e) => {
      if (e.target !== e.currentTarget) return;
      tl2 = gsap.timeline({ paused: true, defaults: { duration: 0.3, ease: "circ.out" } });
      tl2.to(svg, { attr: { viewBox: "0 0 140 80" }, y: 0 })
        .to(line, { strokeDasharray: 170, strokeDashoffset: 0, attr: { points: "32 73 32 10 139 10" } }, "<")
        .to(adv, { y: 0 }, "<");
      tl1 && (tl1.pause(), tl1.seek(1));
      tl2.play();
    };
    item.addEventListener("mouseenter", on, true);
    item.addEventListener("mouseleave", off, true);
    hoverOff.push(() => { item.removeEventListener("mouseenter", on, true); item.removeEventListener("mouseleave", off, true); });
  };
  const arrowEx = (item) => {
    const use = $$(".ex-use", item);
    if (!use.length) return;
    const on = (e) => {
      if (e.target !== e.currentTarget) return;
      gsap.timeline({ defaults: { duration: 0.12, ease: "circ.out" } })
        .to(use, { xPercent: 110, yPercent: -110 })
        .set(use, { xPercent: -110, yPercent: 110 })
        .to(use, { xPercent: 0, yPercent: 0 });
    };
    item.addEventListener("mouseenter", on, true);
    hoverOff.push(() => item.removeEventListener("mouseenter", on, true));
  };
  // The original keeps is-hovered for .6s on buttons and links that were hovered, so the letter roll finishes even if released quickly.
  const hovered = (e) => {
    const t = e.currentTarget;
    t.classList.add("is-hovered");
    setTimeout(() => t.classList.remove("is-hovered"), 600);
  };
  const addButtons = (root) => {
    if (!matchMedia("(any-hover: hover)").matches) return;
    $$(".c-link, .c-btn", root).forEach((n) => { n.addEventListener("mouseenter", hovered); hoverOff.push(() => n.removeEventListener("mouseenter", hovered)); });
    $$(".js-arrow-h", root).forEach(arrowH);
    $$(".js-arrow-v", root).forEach(arrowV);
    $$(".js-arrow-ex", root).forEach(arrowEx);
  };

  // ───── Menu drawer ─────
  const menu = (AD.menu = {
    isOpen: false,
    init(root) {
      this.root = root;
      this.bg = $(".l-menu__bg", root);
      this.body = $(".l-menu__body", root);
      this.parts = $$(".l-menu__side, .l-menu__top, .l-menu__middle, .l-menu__bottom", root);
      $$(".js-drawer", root).forEach((b) => b.addEventListener("click", () => (this.isOpen ? this.close() : this.open())));
      $$(".js-text--menu", root).forEach((n) => splitChars(n, "ch"));
      $$(".l-menu a[href]", root).forEach((a) => a.addEventListener("click", () => this.isOpen && this.close()));
    },
    open() {
      this.isOpen = true;
      html.classList.add("is-menuOpen", "is-force-blk");
      $$(".js-drawer", this.root).forEach((b) => b.setAttribute("aria-expanded", "true"));
      lenis.stop();
      gsap.set($$(".js-text--menu .ch", this.root), { display: "inline-block", opacity: 0, y: 10 });
      gsap.set(this.bg, { scaleY: 0, transformOrigin: "0% 100%" });
      gsap.set(this.body, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(this.parts, { opacity: 0, y: 20 });
      gsap.to(this.bg, { duration: 0.4, scaleY: 1 });
      gsap.to(this.parts, { duration: 0.8, delay: 0.2, opacity: 1, y: 0 });
      $$(".l-menu .c-link", this.root).forEach((l, t) => {
        const chs = $$(".ch", l);
        if (chs.length) gsap.to(chs, { duration: 0.4, stagger: 0.05, opacity: 1, y: 0, rotation: 0, delay: 0.1 * t });
      });
    },
    close() {
      this.isOpen = false;
      html.classList.remove("is-menuOpen", "is-force-blk");
      html.classList.add("is-menuClosing");
      $$(".js-drawer", this.root).forEach((b) => b.setAttribute("aria-expanded", "false"));
      gsap.set(this.bg, { transformOrigin: "0% 0%" });
      gsap.to(this.bg, { duration: 0.4, scaleY: 0, transformOrigin: "0% 0%" });
      gsap.to(this.body, { duration: 0.4, clipPath: "inset(0% 0% 100% 0%)" });
      setTimeout(() => { html.classList.remove("is-menuClosing"); lenis.start(); }, 800);
    },
    reset() {
      this.isOpen = false;
      html.classList.remove("is-menuOpen");
      gsap.set(this.bg, { scaleY: 0, transformOrigin: "0% 100%" });
      gsap.set(this.body, { clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(this.parts, { opacity: 0, y: 20 });
    },
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { menu.isOpen && menu.close(); modal.flag && modal.close(); } });

  // ───── News drawer — pressing a card slides it in from the right in 1.2s carrying that card’s title · date ─────
  const modal = (AD.modal = {
    flag: false,
    once() {
      const m = $(".c-modal");
      if (!m) return;
      const close = (e) => { e.preventDefault(); e.stopPropagation(); this.close(); };
      $(".c-modal__overlay", m).addEventListener("click", close, true);
      $(".c-modal__close", m).addEventListener("click", close, true);
      $(".c-modal__all", m).addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.close();
        if (namespace !== "news") go(e.currentTarget.href);
      }, true);
      $$(".c-share__copy").forEach((b) => b.addEventListener("click", (e) => {
        e.preventDefault();
        b.classList.add("is-copied");
        setTimeout(() => b.classList.remove("is-copied"), 1500);
      }));
    },
    bind(root) {
      $$(".js-news", root).forEach((a) => a.addEventListener("click", (e) => this.open(e, a), true));
    },
    open(e, a) {
      e.preventDefault();
      if (this.flag) return;
      this.flag = true;
      const m = $(".c-modal");
      const title = a.querySelector("h4, .p-news-archive__title")?.textContent.trim();
      const date = a.querySelector(".u-pale, .p-news-archive__date")?.textContent.trim();
      if (title) $(".js-modal-title", m).textContent = title;
      if (date) $(".js-modal-date", m).textContent = date;
      $(".c-modal__scroll", m).scrollTop = 0;
      m.setAttribute("aria-hidden", "false");
      html.classList.add("is-openModal");
      lenis.stop();
    },
    close() {
      if (!this.flag) return;
      html.classList.remove("is-openModal");
      $(".c-modal")?.setAttribute("aria-hidden", "true");
      gsap.delayedCall(0.2, () => { lenis.start(); this.flag = false; });
    },
  });

  // ───── Scroll button — if the menu is open, close it and go after .4s, otherwise after .2s, over .8s ─────
  const scrollButtons = (root) => {
    $$("[data-scroll-to]", root).forEach((b) => b.addEventListener("click", (e) => {
      e.preventDefault();
      let to = b.dataset.scrollTo;
      to = to.startsWith("#") ? $(to) : parseInt(to, 10);
      if (menu.isOpen) { menu.close(); setTimeout(() => { lenis.start(); lenis.scrollTo(to, { duration: 0.8 }); }, 400); }
      else setTimeout(() => lenis.scrollTo(to, { duration: 0.8 }), 200);
    }));
  };

  // ───── Scroll motion (desktop) — parallax photos, footer cover ─────
  const pushT = (t) => (AD.triggers.push(t), t);
  const killTriggers = () => { AD.triggers.forEach((t) => t.kill(true)); AD.triggers = []; };
  const plxImg = (root) => {
    $$(".c-plxImg", root).forEach((box) => {
      const img = $(".js-plx", box);
      if (!img) return;
      const set = (p) => gsap.set(img, { y: p * (img.clientHeight - box.clientHeight) * 2 + 1.5 * (box.clientHeight - img.clientHeight) });
      set(0);
      pushT(ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", onUpdate: (s) => set(s.progress), onRefresh: (s) => set(s.progress) }));
    });
  };
  const footer = (root) => {
    const f = $(".l-footer", root), grid = $(".l-footer__grid", root), pre = $(".u-footer-pre", root), ov = $(".l-footer--overlay", root);
    if (!f) return;
    pushT(ScrollTrigger.create({
      trigger: f, start: "top bottom", end: "bottom top",
      onEnter: () => root.classList.add("is-footer"), onLeaveBack: () => root.classList.remove("is-footer"),
      onUpdate: (s) => pre && gsap.set(pre, { y: s.progress * (s.end - s.start) * 0.9 }),
    }));
    pushT(ScrollTrigger.create({ trigger: grid, start: "top bottom", end: "bottom top", onUpdate: (s) => gsap.set(ov, { opacity: 1.5 * s.progress }) }));
  };
  const addTriggers = (root) => {
    killTriggers();
    if (reduce) return;
    if (isPc()) { plxImg(root); footer(root); }
    views[nsOf(root)]?.triggers?.(root);
    ScrollTrigger.refresh();
  };

  // ───── Hook up and release one page ─────
  const init = (root) => {
    $$(".js-split-text", root).forEach((n) => isPc() && splitChars(n, "c-ef__in"));
    menu.init(root);
    modal.bind(root);
    scrollButtons(root);
    addButtons(root);
    inView(root);
    $$("video.js-player", root).forEach((v) => { v.muted = true; v.play().catch(() => html.classList.add("is-power-saving")); });
    $$("a[href]", root).forEach((a) => { if (a.href === location.href.split("#")[0]) a.setAttribute("aria-current", "page"); });
    views[nsOf(root)]?.init?.(root);
  };
  const destroy = (root) => {
    hoverOff.splice(0).forEach((f) => f());
    killTriggers();
    views[nsOf(root)]?.destroy?.(root);
  };

  // ───── White curtain loader (first document) ─────
  const splash = {
    show() {
      gsap.to(".l-splash .clip-l", { x: 0, duration: 0.6, ease: "power1.inOut" });
      gsap.to(".l-splash .spl-line", { strokeDashoffset: 0, delay: 0.1, duration: 0.6, ease: "power2.inOut" });
      gsap.to(".l-splash .clip-r", { x: 0, delay: 0.3, duration: 0.6, ease: "power1.inOut" });
    },
    hide() {
      gsap.to(".l-splash svg", { duration: 0.6, opacity: 0, delay: 1 });
      gsap.to(".l-splash", { duration: 0.6, delay: 1, pointerEvents: "none", opacity: 0, onComplete: () => { html.classList.add("is-splash-done"); lenis.start(); addEnterClass(); } });
    },
  };

  // ───── Page-turn curtain ─────
  const T = { bg: () => $(".l-transition__bg"), names: () => $$(".l-transition__in"), name: (ns) => $(`.l-transition__in[data-name="${ns}"]`) };
  const leaveAnimation = (cur, done) => {
    gsap.set(T.bg(), { scaleY: 0, opacity: 1 });
    gsap.to(T.bg(), { duration: 0.8, ease: "circ.inOut", scaleY: 1 });
    gsap.to($(".l-main", cur), { duration: 0.8, ease: "circ.inOut", y: -100 });
    gsap.to($(".l-overlay", cur), { duration: 0.8, opacity: 0.5, onComplete: done });
  };
  const enterAnimation = (next, done) => {
    const parts = $$(".l-header, .l-main", next);
    const lift = namespace !== "home" || !isPc();
    if (lift) gsap.set(parts, { y: 20 });
    lenis.start();
    lenis.scrollTo(0, { immediate: true });
    lenis.resize();
    gsap.set(T.names(), { y: "120%" });
    gsap.to(T.name(namespace), {
      duration: 0.6, ease: "circ.out", y: 0,
      onComplete: () => gsap.delayedCall(0.2, () => {
        done();
        let d = 0;
        if (lift) gsap.to(parts, { duration: 0.8, ease: "sine.out", y: 0 }); else d = 0.4;
        gsap.to(T.name(namespace), { duration: 0.6, ease: "circ.in", y: "-120%" });
        gsap.to(T.bg(), { duration: 0.4, delay: d, ease: "circ.in", opacity: 0 });
        gsap.delayedCall(0.6, () => addEnterClass(next));
      }),
    });
  };

  // When opened as a file — after the curtain covers, switch documents, and the new document raises the name on the covered curtain, then lifts it
  const go = (href) => {
    if (SPA) return barba.go(href);
    if (reduce) return (location.href = href);
    lenis.stop();
    html.classList.add("is-transition");
    leaveAnimation($('[data-transition="container"]'), () => { sessionStorage.setItem(NAV_KEY, "1"); location.href = href; });
  };
  const sameSite = (a) => a.origin === location.origin && !a.target && !a.hasAttribute("download") && /\.html?$|\/$/.test(a.pathname) && a.pathname !== location.pathname;
  if (!SPA) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || !sameSite(a)) return;
      e.preventDefault();
      go(a.href);
    });
  }

  // ───── Start ─────
  const container = $('[data-transition="container"]');
  const arrived = !SPA && sessionStorage.getItem(NAV_KEY) === "1";
  sessionStorage.removeItem(NAV_KEY);
  modal.once();
  init(container);
  if (arrived || reduce) {
    html.classList.add("is-splash-done");
    if (arrived) {
      gsap.set(T.bg(), { scaleY: 1, opacity: 1 });
      enterAnimation(container, () => {});
    } else { lenis.start(); addEnterClass(); }
  } else {
    splash.show();
    // The original waits for the first photo (menu banner), rests 1 second, then lifts — with a photo, wait for that photo, for now we wait for fonts
    const first = document.querySelector(".ad-img img");
    const img = first && !first.complete ? new Promise((r) => first.addEventListener("load", r, { once: true })) : Promise.resolve();
    const ready = Promise.all([document.fonts?.ready || Promise.resolve(), img]);
    Promise.race([ready, new Promise((r) => setTimeout(r, 3000))]).then(() => splash.hide());
  }
  addEventListener("load", () => addTriggers(container), { once: true });
  if (document.readyState === "complete") addTriggers(container);
  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => addTriggers($('[data-transition="container"]')), 200); });

  if (SPA) {
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.init({
      schema: { prefix: "data-transition" },
      preventRunning: true,
      timeout: 50000,
      transitions: [{
        name: "default-transition",
        leave(data) { const done = this.async(); leaveAnimation(data.current.container, done); },
        enter(data) {
          const done = this.async();
          gsap.set(data.current.container, { display: "none" });
          enterAnimation(data.next.container, done);
        },
      }],
    });
    barba.hooks.beforeLeave(() => lenis.stop());
    barba.hooks.leave(() => { html.classList.add("is-transition"); html.classList.remove("is-force-blk"); });
    barba.hooks.beforeEnter((data) => {
      destroy(data.current.container);
      namespace = data.next.namespace;
      document.title = (data.next.html.match(/<title>([^<]*)<\/title>/) || [])[1] || document.title;
    });
    barba.hooks.enter((data) => { init(data.next.container); menu.reset(); modal.close(); });
    barba.hooks.after((data) => {
      html.classList.remove("is-transition");
      setTimeout(() => addTriggers(data.next.container), 100);
    });
  }
})();
