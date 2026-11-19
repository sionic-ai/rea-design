// Shared behavior for the whole site. As in the original, the header part (chrome) is attached once, and page parts are attached and removed each time #page-frame changes.
// Page transition uses swup 4.9.2 plus parallel, preload and progress bar plugins like the original — it keeps the old and new pages at the same time and swaps them through a shaped hole.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RB = (window.RB = window.RB || {});
  RB.pageModules = RB.pageModules || [];
  RB.reduce = reduce;

  // Paint once with a canvas and read it as rgb — GSAP can’t interpolate relative colors like oklch(from …)
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  RB.rgb = (cssVar) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    const el = document.createElement("i");
    el.style.color = v;
    document.body.append(el);
    const c = getComputedStyle(el).color;
    el.remove();
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = c;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };

  // ── Smooth scroll: Lenis 1.3.20 defaults (lerp .1) + allow inner scrolling ──
  let lenis = null;
  RB.lenis = () => lenis;
  const bootLenis = () => {
    if (reduce || !window.Lenis) return;
    lenis = window.lenis = new Lenis({ allowNestedScroll: true });
    lenis.on("scroll", () => ScrollTrigger.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  };

  // ── Accordion: pressing the head expands max-height over .4s, and the inner text rises from 16px below, starting .12s later with a .06s stagger ──
  class Accordion {
    constructor(header, onOpen) {
      this.header = header;
      this.content = header.nextElementSibling;
      this.onOpen = onOpen;
      if (!this.content) return;
      this.items = $$("[data-accordion-stagger] > *", this.content);
      this.onClick = () => this.toggle();
      this.onKey = (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), this.toggle());
      this.onEnd = (e) => e.target === this.content && e.propertyName === "max-height" && ScrollTrigger.refresh();
      this.content.style.maxHeight = this.isOpen ? `${this.content.scrollHeight}px` : "0px";
      header.addEventListener("click", this.onClick);
      header.addEventListener("keydown", this.onKey);
      this.content.addEventListener("transitionend", this.onEnd);
    }
    get isOpen() { return this.header.classList.contains("active"); }
    open() {
      this.header.classList.add("active");
      this.header.parentElement.classList.add("is-open");
      this.content.style.maxHeight = `${this.content.scrollHeight}px`;
      this.anim?.kill();
      if (this.items.length && !reduce)
        this.anim = gsap.fromTo(this.items, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.12, stagger: 0.06, ease: "power2.out", clearProps: "opacity,transform" });
    }
    close() {
      this.anim?.kill();
      if (this.items.length) gsap.set(this.items, { clearProps: "opacity,transform" });
      this.header.classList.remove("active");
      this.header.parentElement.classList.remove("is-open");
      this.content.style.maxHeight = "0px";
    }
    toggle() { if (this.isOpen) return this.close(); this.onOpen?.(this); this.open(); }
    destroy() {
      this.anim?.kill();
      this.header.removeEventListener("click", this.onClick);
      this.header.removeEventListener("keydown", this.onKey);
      this.content?.removeEventListener("transitionend", this.onEnd);
    }
  }
  const accordions = (root) => {
    const groups = new Map();
    return $$(".accordion-header", root).map((h) => {
      const g = h.closest("[data-accordion-group]");
      const a = new Accordion(h, g ? (me) => groups.get(g).forEach((o) => o !== me && o.isOpen && o.close()) : null);
      if (g) groups.set(g, [...(groups.get(g) || []), a]);
      return a;
    });
  };
  RB.accordions = accordions;

  // ── Menu drawer: two lines turn into an X with .3s back.inOut, the panel grows to height auto with .5s expo.inOut, rows rise 24px from below in .03s sequence ──
  class Menu {
    constructor(root) {
      this.root = root;
      this.panel = root.querySelector("[data-menu]");
      this.scroller = root.querySelector("[data-menu-scroll]");
      this.toggles = $$("[data-toggle-menu]", root);
      this.items = $$("[data-menu-item]", this.panel);
      this.bars = $$("[data-menu-bar]", root);
      this.isOpen = false;
      this.accordions = accordions(this.panel);
      const half = this.bars.length > 1 ? (this.bars[1].offsetTop - this.bars[0].offsetTop) / 2 : 0;
      this.tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(this.bars, { y: (i) => (i === 0 ? half : -half), rotate: (i) => (i === 0 ? 45 : -45), scaleX: 0.8, duration: 0.3, ease: "back.inOut" }, 0)
        .from(this.items, { y: 24, opacity: 0, duration: 0.5, stagger: 0.03 }, 0.3);
      this.toggle = this.toggle.bind(this);
      this.onKey = (e) => e.key === "Escape" && this.close();
      this.onDoc = (e) => !e.target.closest("[data-menu], [data-toggle-menu], [data-header-nav]") && this.close();
      this.close = this.close.bind(this);
      this.measure = this.measure.bind(this);
      this.toggles.forEach((t) => t.addEventListener("click", this.toggle));
      document.addEventListener("keydown", this.onKey);
      document.addEventListener("click", this.onDoc);
      document.addEventListener("book:open", this.close);
      addEventListener("resize", this.measure);
      this.measure();
    }
    measure() {
      const nav = this.root.querySelector("[data-header-nav]");
      const navH = nav && getComputedStyle(nav).display !== "none" ? nav.offsetHeight : 0;
      const r = this.scroller.getBoundingClientRect();
      const below = this.panel.parentElement.getBoundingClientRect().bottom - r.bottom;
      this.scroller.style.setProperty("--menu-max", `${Math.max(200, innerHeight - r.top - below - navH - 16)}px`);
    }
    animatePanel() {
      this.panelTween?.kill();
      this.panelTween = gsap.to(this.panel, { height: this.isOpen ? "auto" : 0, duration: reduce ? 0 : 0.5, ease: "expo.inOut", onComplete: () => this.isOpen && gsap.set(this.panel, { height: "auto" }) });
    }
    toggle() {
      this.isOpen = !this.isOpen;
      document.body.classList.toggle("menu-open", this.isOpen);
      if (this.isOpen) this.measure();
      this.animatePanel();
      if (!this.isOpen) this.accordions.forEach((a) => a.close());
      if (this.isOpen) { lenis?.stop(); this.tl.play(); } else { lenis?.start(); this.tl.reverse(); }
    }
    close({ immediate } = {}) {
      if (!this.isOpen) return;
      if (!immediate) return this.toggle();
      this.isOpen = false;
      document.body.classList.remove("menu-open");
      this.panelTween?.kill();
      gsap.set(this.panel, { height: 0 });
      this.accordions.forEach((a) => a.close());
      this.tl.progress(0).pause();
      lenis?.start();
    }
  }

  // Booking drawer: intercepts #book links, backdrop .5s power2.out · panel .5s expo.out from the right
  class Book {
    constructor(root) {
      this.root = root;
      this.sheet = root.querySelector("[data-book-sheet]");
      this.scrim = root.querySelector("[data-book-scrim]");
      this.closer = root.querySelector("[data-book-close]");
      this.tabs = $$("[data-book-tab]", root);
      this.panes = $$("[data-book-pane]", root);
      this.isOpen = false;
      this.tl = gsap.timeline({ paused: true, onReverseComplete: () => root.classList.add("hidden") })
        .to(this.scrim, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
        .to(this.sheet, { x: 0, duration: 0.5, ease: "expo.out" }, 0);
      this.close = this.close.bind(this);
      this.onTrigger = (e) => { if (e.target.closest?.('a[href$="#book"]')) { e.preventDefault(); e.stopPropagation(); this.open(); } };
      this.onKey = (e) => e.key === "Escape" && this.close();
      document.addEventListener("click", this.onTrigger, true);
      document.addEventListener("keydown", this.onKey);
      this.closer.addEventListener("click", this.close);
      this.scrim.addEventListener("click", this.close);
      this.tabs.forEach((t) => t.addEventListener("click", () => {
        this.tabs.forEach((o) => o.setAttribute("aria-selected", o === t));
        this.panes.forEach((p) => p.classList.toggle("hidden", p.dataset.bookPane !== t.dataset.bookTab));
      }));
    }
    open() {
      if (this.isOpen) return;
      this.isOpen = true;
      this.opener = document.activeElement;
      this.root.classList.remove("hidden");
      this.tl.play();
      document.dispatchEvent(new CustomEvent("book:open"));
      lenis?.stop();
      this.closer.focus();
    }
    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.tl.reverse();
      lenis?.start();
      this.opener?.focus?.();
    }
  }

  // ── Press and hold to pop: pressing an empty spot for 1s (cancels if moved over 28px or scrolled over 60px) makes props burst and fall on the spot with matter-js physics ──
  const HOLD_MS = 1000;
  const SKIP = ["input", "textarea", "select", "[contenteditable]", '[draggable="true"]', "a", "button", "[data-event-slider]", "[data-events-dropdown]", "[data-spaces-image]", "[data-lenis-prevent]"].join(", ");
  class Burst {
    constructor(root) {
      this.stage = root.querySelector("[data-icon-burst-stage]");
      this.progress = root.querySelector("[data-icon-burst-progress]");
      this.icons = $$("[data-icon-burst-icon]", root);
      if (!this.icons.length || !window.Matter) return;
      this.hold = null;
      this.engine = null;
      this.bodies = [];
      this.tick = (t, dt) => this.update(dt);
      document.addEventListener("pointerdown", (e) => this.down(e), { passive: true });
      document.addEventListener("pointermove", (e) => this.move(e), { passive: true });
      ["pointerup", "pointercancel"].forEach((n) => document.addEventListener(n, () => this.cancel(), { passive: true }));
      addEventListener("scroll", () => this.hold && Math.abs(scrollY - this.hold.scroll) > 60 && this.cancel(), { passive: true });
      addEventListener("blur", () => this.cancel());
    }
    down(e) {
      this.cancel();
      if (e.pointerType === "touch" || e.button !== 0 || e.target.closest?.(SKIP)) return;
      this.hold = { id: e.pointerId, x: e.clientX, y: e.clientY, scroll: scrollY, timer: setTimeout(() => this.burst(e.clientX, e.clientY), HOLD_MS) };
      this.progressTween?.kill();
      this.progress.classList.add("is-on");
      gsap.set(this.progress, { opacity: 1, clipPath: "inset(0% 100% 0% 0%)" });
      this.progressTween = gsap.to(this.progress, { clipPath: "inset(0% 0% 0% 0%)", duration: HOLD_MS / 1000, ease: "none" });
    }
    move(e) {
      if (this.hold && e.pointerId === this.hold.id && Math.hypot(e.clientX - this.hold.x, e.clientY - this.hold.y) > 28) this.cancel();
    }
    discharge() {
      this.progressTween?.kill();
      this.progressTween = gsap.to(this.progress, { opacity: 0, duration: 0.25, onComplete: () => { gsap.set(this.progress, { clipPath: "inset(0% 100% 0% 0%)" }); this.progress.classList.remove("is-on"); } });
    }
    cancel() {
      if (!this.hold) return;
      clearTimeout(this.hold.timer);
      this.hold = null;
      this.discharge();
    }
    burst(x, y) {
      this.hold = null;
      this.discharge();
      if (!getSelection()?.isCollapsed) return;
      const { Engine, Bodies, Body, Composite } = Matter;
      this.stage.classList.remove("invisible");
      if (!this.engine) {
        this.engine = Engine.create({ gravity: { y: 1 } });
        this.bodies = this.icons.map((el) => {
          const w = Math.max(1, el.offsetWidth), h = Math.max(1, el.offsetHeight);
          const b = Bodies.rectangle(0, 0, w, h, { frictionAir: 0.02, chamfer: { radius: Math.min(w, h) * 0.2 } });
          Object.assign(b, { element: el, ox: w / 2, oy: h / 2 });
          return b;
        });
        Composite.add(this.engine.world, this.bodies);
      }
      const R = gsap.utils.random;
      this.bodies.forEach((b) => {
        const a = R(0, Math.PI * 2) - 0.1, s = R(2, 4);
        Body.setPosition(b, { x, y });
        Body.setAngle(b, R(-Math.PI, Math.PI));
        Body.setVelocity(b, { x: Math.cos(a) * s, y: Math.sin(a) * s });
        Body.setAngularVelocity(b, R(-0.5, 0.5));
      });
      this.sync();
      if (!this.running) { this.running = true; gsap.ticker.add(this.tick); }
    }
    update(dt) {
      Matter.Engine.update(this.engine, Math.min(dt, 1000 / 30));
      this.sync();
      if (this.bodies.every((b) => b.position.y > innerHeight + 300)) {
        this.running = false;
        gsap.ticker.remove(this.tick);
        this.stage.classList.add("invisible");
      }
    }
    sync() {
      this.bodies.forEach((b) => { b.element.style.transform = `translate3d(${b.position.x - b.ox}px, ${b.position.y - b.oy}px, 0) rotate(${b.angle}rad)`; });
    }
  }

  // ── Three-slot buttons under the header bar: stuck to the bottom of the Hero ([data-nav-rest]), then they follow up and settle under the header bar ──
  let navOwner = null;
  class NavFollow {
    constructor(nav, rest) {
      this.nav = nav;
      this.rest = rest;
      this.y = Number(gsap.getProperty(nav, "y")) || 0;
      this.cold = !navOwner;
      this.setY = gsap.quickSetter(nav, "y", "px");
      this.place = this.place.bind(this);
      navOwner = this;
    }
    get hidden() { return getComputedStyle(this.nav).display === "none"; }
    target() {
      if (!this.rest) return 0;
      const navBottom = this.nav.getBoundingClientRect().bottom - this.y;
      return Math.max(0, this.rest.getBoundingClientRect().bottom - 16 - navBottom);
    }
    place() { if (!this.hidden) { this.y = this.target(); this.setY(this.y); } }
    follow() { this.place(); gsap.ticker.add(this.place); }
    play() {
      if (this.played) return;
      this.played = true;
      if (this.hidden || reduce) { gsap.set(this.nav, { autoAlpha: 1 }); return this.follow(); }
      if (this.cold) { this.follow(); this.tween = gsap.fromTo(this.nav, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: "power2.in" }); return; }
      if (Math.abs(this.target() - this.y) < 1) return this.follow();
      this.tween = gsap.timeline().to(this.nav, { autoAlpha: 0, duration: 0.25, ease: "power2.out" }).add(() => this.follow()).to(this.nav, { autoAlpha: 1, duration: 0.25, ease: "power2.in" });
    }
    freeze() { this.tween?.progress(1).kill(); if (navOwner === this) this.place(); gsap.ticker.remove(this.place); }
    destroy() { this.freeze(); if (navOwner === this) navOwner = null; }
  }

  // ── Page parts ──
  const dir = (d, n) => ({ up: { y: n }, down: { y: -n }, left: { x: n }, right: { x: -n } })[d] || {};
  const fades = (root) => {
    if (reduce) return [];
    const tw = [
      ...$$("[data-fade]", root).map((el) => gsap.from(el, { scrollTrigger: { trigger: el, start: "top bottom-=10%" }, autoAlpha: 0, delay: 0.2, duration: 0.6, ...dir(el.dataset.fade, 16) })),
      ...$$("[data-stagger]", root).map((el) => gsap.from(el.children, { scrollTrigger: { trigger: el, start: "top bottom-=10%" }, autoAlpha: 0, delay: 0.2, stagger: 0.15, ...dir(el.dataset.stagger, 20) })),
    ];
    return [{ destroy: () => tw.forEach((t) => { t.scrollTrigger?.kill(); t.revert(); }) }];
  };

  // Prop doodle dance — every .3s it snaps abruptly to one of −3, 0, 3° (steps(1), start random between 0 and .5s)
  const dances = (root) => $$("[data-dance]", root).map((el) => {
    const icon = el.querySelector("svg");
    if (!icon || reduce) return { destroy() {} };
    const R = gsap.utils.random;
    const t = gsap.to(icon, { rotation: () => R(-3, 3, 3), duration: 0.3, delay: R(0, 0.5), ease: "steps(1)", transformOrigin: "50% 50%", repeat: -1, repeatRefresh: true });
    return { destroy: () => t.kill() };
  });

  // Subpage header title — letters go line by line, from 120% below → 0 inside, .5s power3.out, .025s stagger
  const bannerHeadings = (root) => $$("[data-banner-heading]", root).map((h) => {
    const m = { split: null, tl: null, armed: false, done: reduce };
    if (reduce) return m;
    gsap.set(h, { opacity: 0 });
    m.split = SplitText.create(h, { type: "lines, words, chars", mask: "lines", autoSplit: true, linesClass: "rb-line", onSplit: (s) => { if (m.done) return; gsap.set(s.chars, { yPercent: 120 }); gsap.set(h, { opacity: 1 }); if (m.armed) run(s); } });
    const run = (s) => { m.tl?.kill(); m.tl = gsap.timeline({ onComplete: () => (m.done = true) }).to(s.chars, { yPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.025 }); };
    m.play = () => { if (m.done || m.armed) return; m.armed = true; run(m.split); };
    m.destroy = () => { m.tl?.kill(); m.split?.revert(); };
    return m;
  });

  // Header photo parallax — a 120% height photo moves from −16.67% to 0 (tied to scroll)
  const parallax = (root) => $$("[data-banner-parallax]", root).map((img) => {
    if (reduce) return { destroy() {} };
    const frame = img.parentElement;
    const shift = (0.2 / 1.2) * 100;
    const t = gsap.fromTo(img, { yPercent: -shift }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: frame, start: () => (frame.getBoundingClientRect().top + scrollY < innerHeight ? "top top" : "top bottom"), end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    return { destroy: () => { t.scrollTrigger?.kill(); t.kill(); } };
  });

  // Blinds — below the header 16 lines (phone 8) cover from 0 → 1 with the bottom as pivot. Starting from the last line .01 apart, scrub .3
  const shutters = (root) => $$("[data-shutter-scroll-transition]", root).map((wrap) => {
    const section = wrap.closest("section") || wrap.parentElement;
    const mm = gsap.matchMedia();
    let panel = null, tl = null;
    mm.add({ desktop: "(min-width: 768px)", phone: "(max-width: 767px)", reduce: "(prefers-reduced-motion: reduce)" }, (c) => {
      if (c.conditions.reduce) return;
      panel = document.createElement("div");
      panel.className = "rb-shutter__panel";
      const n = c.conditions.phone ? 8 : 16;
      panel.append(...Array.from({ length: n }, () => Object.assign(document.createElement("div"), { className: "rb-shutter__row" })));
      wrap.append(panel);
      const rows = [...panel.children];
      gsap.set(rows, { scaleY: 0, transformOrigin: "bottom center" });
      tl = gsap.timeline({ scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom top", scrub: 0.3, invalidateOnRefresh: true } })
        .to(rows, { scaleY: 1, duration: 0.1, stagger: { each: 0.01, from: "end" }, ease: "none" });
      return () => { tl?.scrollTrigger?.kill(); tl?.kill(); panel?.remove(); };
    });
    return { destroy: () => mm.revert() };
  });

  // Footer wordmark — when it reaches the bottom 30% of the screen, letter pieces light up in random order (within .8s), and switch off in reverse as it passes
  const footerLogo = (root) => $$("[data-footer-logo-scroll]", root).map((svg) => {
    const parts = $$("text, path", svg);
    if (!parts.length || reduce) return { destroy() {} };
    gsap.set(parts, { autoAlpha: 0 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: "top bottom-=30%", end: "bottom top", toggleActions: "play reverse play reverse" } })
      .to(parts, { autoAlpha: 1, duration: 0.01, stagger: { amount: 0.8, from: "random" } });
    return { destroy: () => { tl.scrollTrigger?.kill(); tl.kill(); } };
  });

  // Rubber band bar — scrolling further into the 35vh footer margin makes the bar stick to the screen bottom and stretch (center weight 1, ends .2),
  // When the wheel stops for 100ms, Lenis rewinds with .8s expo-out. On touch screens it pulls from the bottom, and on release it springs back with .9s elastic.out(1, .55)
  const coarse = matchMedia("(hover: none) and (pointer: coarse)").matches;
  class Rubber {
    constructor(root) {
      this.bars = $$("[data-footer-rubberband-bar]", root);
      this.strip = root.querySelector("[data-footer-rubberband-bars]");
      this.space = root.querySelector("[data-footer-rubberband-space]");
      if (this.bars.length < 2 || reduce) { if (this.space) this.space.style.display = "none"; return; }
      const c = (this.bars.length - 1) / 2;
      this.weights = this.bars.map((_, i) => 0.2 + 0.8 * (1 - Math.abs(i - c) / c));
      this.setters = this.bars.map((b) => gsap.quickSetter(b, "scaleY"));
      this.state = { progress: 0 };
      this.onInput = () => { this.returning = false; clearTimeout(this.timer); this.timer = setTimeout(this.onRelease, 100); };
      this.onRelease = () => {
        clearTimeout(this.timer);
        if (this.returning || !this.enough || !this.trigger || this.trigger.progress <= 0.001 || !lenis) return;
        this.returning = true;
        lenis.scrollTo(this.trigger.start, { duration: 0.8, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), onComplete: () => (this.returning = false) });
      };
      this.available();
      this.measure();
      if (coarse) { if (this.enough) this.bindTouch(); return; }
      this.trigger = ScrollTrigger.create({
        trigger: this.space, start: "top bottom", end: "bottom bottom", invalidateOnRefresh: true,
        onRefresh: () => { this.available(); this.measure(); },
        onUpdate: (s) => this.enough && this.stretch(s.progress),
        onEnter: () => this.enough && this.pin(true), onEnterBack: () => this.enough && this.pin(true), onLeaveBack: () => this.pin(false),
      });
      addEventListener("wheel", this.onInput, { passive: true });
      addEventListener("keyup", this.onRelease);
    }
    available() {
      this.enough = document.documentElement.scrollHeight - this.space.offsetHeight > innerHeight * 1.35;
      this.space.style.display = this.enough ? "" : "none";
      if (!this.enough) { this.pin(false); gsap.set(this.bars, { scaleY: 1 }); }
    }
    measure() {
      this.barH = this.bars[0].offsetHeight || 12;
      this.maxPull = Math.max((coarse ? innerHeight * 0.28 : this.space.offsetHeight) - this.barH, 0);
    }
    pin(on) { on ? this.strip.setAttribute("data-pinned", "") : this.strip.removeAttribute("data-pinned"); }
    stretch(p) { const d = p * this.maxPull; this.setters.forEach((set, i) => set(1 + (d * this.weights[i]) / this.barH)); }
    bindTouch() {
      this.space.style.display = "none";
      this.ts = (e) => { this.pulling = false; this.oy = e.touches[0].clientY; };
      this.tm = (e) => {
        const dy = this.oy - e.touches[0].clientY;
        if (!this.pulling) {
          if (dy <= 0 || scrollY + innerHeight < document.documentElement.scrollHeight - 2) { this.oy = e.touches[0].clientY; return; }
          this.release?.kill(); this.measure(); this.pin(true); this.pulling = true; this.oy = e.touches[0].clientY; return;
        }
        this.state.progress = this.maxPull ? 1 - Math.exp((-Math.max(this.oy - e.touches[0].clientY, 0) * 0.75) / this.maxPull) : 0;
        this.stretch(this.state.progress);
      };
      this.te = () => { if (!this.pulling) return; this.pulling = false; this.release = gsap.to(this.state, { progress: 0, duration: 0.9, ease: "elastic.out(1, 0.55)", onUpdate: () => this.stretch(this.state.progress), onComplete: () => this.pin(false) }); };
      addEventListener("touchstart", this.ts, { passive: true });
      addEventListener("touchmove", this.tm, { passive: true });
      addEventListener("touchend", this.te, { passive: true });
    }
    freeze() {
      clearTimeout(this.timer);
      this.release?.kill();
      removeEventListener("wheel", this.onInput);
      removeEventListener("keyup", this.onRelease);
      if (this.ts) { removeEventListener("touchstart", this.ts); removeEventListener("touchmove", this.tm); removeEventListener("touchend", this.te); }
    }
    destroy() { if (!this.strip) return; this.freeze(); this.trigger?.kill(); this.pin(false); gsap.set(this.bars, { scaleY: 1 }); }
  }

  // Newsletter signup — the original sends to an external subscription service. The copy checks fields and then swaps in a thank-you message
  const newsletters = (root) => $$("[data-braze-newsletter]", root).map((box) => {
    const form = box.querySelector("form"), msg = box.querySelector("[data-braze-newsletter-message]"), thanks = box.querySelector("[data-braze-newsletter-thanks]");
    const submit = (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { msg.textContent = "Please check your email address."; msg.hidden = false; form.querySelector("[type=email]").focus(); return; }
      msg.hidden = true; form.hidden = true; thanks.hidden = false; lenis?.resize(); ScrollTrigger.refresh();
    };
    form.addEventListener("submit", submit);
    return { destroy: () => form.removeEventListener("submit", submit) };
  });

  const navFollow = (root) => {
    const nav = document.querySelector("[data-header-nav]");
    return nav ? [new NavFollow(nav, root.querySelector("[data-nav-rest]"))] : [];
  };

  const shared = [fades, dances, bannerHeadings, parallax, shutters, footerLogo, (r) => $$("[data-footer-rubberband]", r).map((el) => new Rubber(el)), newsletters, accordions, navFollow];

  // ── Page transition backdrop: one color per transition shape (triangle blue, diamond red, arch pink, stairs purple) ──
  const SHAPES = [
    { paint: "rb-paint--blue", d: "M200 50 L400 350 L0 350 Z", cover: 3.4 },
    { paint: "rb-paint--red", d: "M200 0 L400 200 L200 400 L0 200 Z", cover: 2.1 },
    { paint: "rb-paint--pink", d: "M0 350 L0 250 A200 200 0 0 1 400 250 L400 350 Z", cover: 3 },
    { paint: "rb-paint--purple", d: "M50 65 L150 65 L150 155 L250 155 L250 245 L350 245 L350 335 L50 335 Z", cover: 4.6 },
  ];
  let shapeAt = Math.floor(Math.random() * SHAPES.length);
  const nextShape = () => SHAPES[(shapeAt = (shapeAt + 1) % SHAPES.length)];

  // Moves the 400 cell shape to the screen center (cx, cy) at s times · spin degrees as a path — the clip and the border use the same formula
  const shapePath = (d, s, spin, cx, cy) => {
    const r = (spin * Math.PI) / 180, co = Math.cos(r), si = Math.sin(r);
    const pt = (x, y) => { const u = (x - 200) * s, v = (y - 200) * s; return `${(cx + u * co - v * si).toFixed(2)} ${(cy + u * si + v * co).toFixed(2)}`; };
    return d.replace(/([ML])(\s*-?[\d.]+)\s+(-?[\d.]+)/g, (_, c, x, y) => `${c}${pt(+x, +y)}`)
      .replace(/A(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(\d)\s+(\d)\s+(-?[\d.]+)\s+(-?[\d.]+)/g, (_, rx, ry, rot, la, sw, x, y) => `A${(rx * s).toFixed(2)} ${(ry * s).toFixed(2)} ${+rot + spin} ${la} ${sw} ${pt(+x, +y)}`);
  };
  // Shape size uses geometric interpolation — less abrupt at the end as it shrinks (original geometric: true)
  const geometric = (a, b, ease) => { const e = gsap.parseEase(ease); return (p) => (a * Math.pow(b / a, e(p)) - a) / (b - a); };
  const at = (o, vars, span) => [{ duration: o.duration, ease: o.geometric && span ? geometric(span[0], span[1], o.ease) : o.ease, ...vars }, o.at];
  const T = {
    scale: { shrink: { at: 0, duration: 0.9, ease: "power2.inOut" }, settle: { at: 0.95, duration: 0.45, ease: "power2.inOut" } },
    size: { close: { at: 0, duration: 0.9, ease: "power1.out", geometric: true }, open: { at: 0.95, duration: 0.4, ease: "power1.in", geometric: true } },
    spin: { out: { at: 0, duration: 0.8, ease: "power2.in", to: 90 }, in: { at: 0.4, duration: 1, ease: "power2.out", from: -90 } },
    move: { at: 0.4, duration: 0.8, ease: "power2.inOut" },
  };
  const SMALL = 0.6, START_SCALE = 0.9, COVER = 1.04;

  class Transitions {
    constructor(app) {
      this.app = app;
      this.outlines = [];
      this.swup = new Swup({
        containers: ["#page-frame"], animationSelector: false, animateHistoryBrowsing: true,
        linkSelector: 'a[href]:not([data-no-swup]):not([target="_blank"]):not([download]):not([href^="mailto:"]):not([href^="tel:"]):not([href$="#book"])',
        plugins: [new SwupParallelPlugin({ containers: ["#page-frame"] }), new SwupPreloadPlugin({ preloadVisibleLinks: { enabled: true, delay: 0, threshold: 0 } }), new SwupProgressPlugin({ delay: 300 })],
      });
      const h = this.swup.hooks;
      h.on("content:replace", () => this.leave(), { before: true });
      h.on("content:insert", (v, { containers }) => this.prepare(containers), { before: true });
      h.on("content:replace", () => this.enter());
      h.on("animation:in:await", () => this.animate(), { replace: true });
      h.on("scroll:top", () => (lenis?.scrollTo(0, { immediate: true, force: true }), true), { replace: true });
      h.on("visit:end", () => this.settle());
      h.on("visit:abort", () => this.settle());
    }
    leave() {
      this.tl?.kill();
      this.leaving = this.space || nextShape();
      this.space = nextShape();
      this.app.retire(document.querySelector("#page-frame"));
    }
    place(el, { left, width }, z) { Object.assign(el.style, { position: "fixed", top: "0px", left: `${left}px`, width: `${width}px`, zIndex: z }); }
    prepare(containers) {
      this.clean();
      this.containers = containers;
      const prev = containers[0]?.previous;
      if (!prev) return;
      const r = prev.getBoundingClientRect();
      this.frozen = prev;
      gsap.set(prev, { willChange: "transform, clip-path", height: innerHeight, overflow: "hidden" });
      this.place(prev, r, "1");
      prev.scrollTop = -r.top;
    }
    enter() {
      const next = this.containers?.[0]?.next || document.querySelector("#page-frame");
      this.app.mount(next);
      this.app.backdrop(this.space);
      gsap.set(next, { willChange: "transform, clip-path", height: innerHeight, overflow: "clip", autoAlpha: 0 });
    }
    outline(z) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"), path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("fill", "none");
      path.style.stroke = "var(--site-black)";
      path.setAttribute("stroke-width", "2");
      path.setAttribute("stroke-linejoin", "round");
      svg.append(path);
      Object.assign(svg.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: z });
      document.body.append(svg);
      return { svg, path };
    }
    trace(shape, el, st, line) {
      const w = innerWidth, hgt = innerHeight, big = Math.max(w, hgt), s = (big * st.scale) / 400;
      el.style.clipPath = `path("${shapePath(shape.d, s, st.spin, w / 2, hgt / 2)}")`;
      if (!line) return;
      const k = gsap.getProperty(el, "scaleX") || 1, y = gsap.getProperty(el, "y") || 0;
      line.path.setAttribute("d", shapePath(shape.d, s * k, st.spin, w / 2, y + hgt / 2));
      const cx = (w - w * k) / 2, cy = (hgt - hgt * k) / 2 + y;
      line.svg.style.clipPath = `inset(${cy}px ${w - cx - w * k}px ${hgt - cy - hgt * k}px ${cx}px)`;
    }
    animate() {
      const { next, previous: prev } = this.containers?.[0] || {};
      if (!next) return;
      const w = innerWidth, hgt = innerHeight, big = Math.max(w, hgt), small = Math.min(w, hgt);
      const cover = (sh) => (sh.cover * COVER * big) / small;
      const st = { prev: { size: cover(this.leaving), spin: 0 }, next: { size: SMALL, spin: T.spin.in.from } };
      const toScale = ({ size, spin }) => ({ scale: (size * small) / big, spin });
      this.place(next, next.getBoundingClientRect(), "0");
      this.outlines = [this.outline("0"), prev ? this.outline("2") : null];
      gsap.set(next, { autoAlpha: 1, scale: START_SCALE, y: hgt, transformOrigin: `${w / 2}px ${hgt / 2}px` });
      if (prev) gsap.set(prev, { transformOrigin: `${w / 2}px ${hgt / 2}px` });
      const draw = () => { this.trace(this.space, next, toScale(st.next), this.outlines[0]); if (prev) this.trace(this.leaving, prev, toScale(st.prev), this.outlines[1]); };
      draw();
      this.tl = gsap.timeline({ onUpdate: draw });
      if (prev)
        this.tl.to(prev, ...at(T.scale.shrink, { scale: START_SCALE }))
          .to(st.prev, ...at(T.size.close, { size: SMALL }, [cover(this.leaving), SMALL]))
          .to(st.prev, ...at(T.spin.out, { spin: T.spin.out.to }))
          .to(prev, ...at(T.move, { y: -hgt }));
      this.tl.to(next, ...at(T.move, { y: 0 }))
        .to(next, ...at(T.scale.settle, { scale: 1 }))
        .to(st.next, ...at(T.size.open, { size: cover(this.space) }, [SMALL, cover(this.space)]))
        .to(st.next, ...at(T.spin.in, { spin: 0 }))
        .call(() => this.app.reveal(), undefined, T.move.at + 0.6);
      return this.tl;
    }
    settle() {
      this.tl?.kill();
      this.tl = null;
      const next = this.containers?.[0]?.next;
      const clear = "opacity,visibility,transform,transformOrigin,clipPath,willChange,height,overflow,position,top,left,width,zIndex";
      if (next) { ["position", "top", "left", "width", "z-index"].forEach((p) => next.style.removeProperty(p)); gsap.set(next, { clearProps: clear }); }
      if (this.frozen) { gsap.set(this.frozen, { clearProps: clear }); this.frozen = null; }
      this.outlines.forEach((o) => o?.svg.remove());
      this.outlines = [];
      this.clean();
      this.containers = null;
      this.app.settle();
    }
    clean() { $$("#page-frame.is-previous-container").forEach((el) => el.remove()); }
  }

  // ── App: header-line parts once, page parts on every page turn ──
  const app = {
    page: [], retired: [], settled: true,
    collect(list, made) {
      [made].flat().filter((m) => m && typeof m.destroy === "function").forEach((m) => list.push(m));
      if (list === this.page && this.settled) [made].flat().forEach((m) => m?.play?.());
    },
    mount(root) {
      if (!root) return;
      const list = (this.page = []);
      [...shared, ...RB.pageModules].forEach((fn) => {
        const out = fn(root);
        if (out && typeof out.then === "function") out.then((r) => this.collect(list, r));
        else this.collect(list, out);
      });
    },
    retire(root) {
      this.settled = false;
      menu?.close({ immediate: true });
      book?.close();
      ScrollTrigger.getAll().filter((t) => root?.contains(t.trigger || t.pin)).forEach((t) => t.disable(false));
      this.page.forEach((m) => m.freeze?.());
      this.retired.push(this.page);
      this.page = [];
    },
    reveal() { this.settled = true; this.page.forEach((m) => m.play?.()); },
    backdrop(shape) {
      const b = document.querySelector("[data-transition-backdrop]");
      if (!b) return;
      SHAPES.forEach((s) => b.classList.remove(s.paint));
      b.classList.add(shape.paint);
      b.setAttribute("data-active", "");
    },
    settle() {
      this.settled = true;
      this.retired.flat().forEach((m) => m.destroy());
      this.retired = [];
      document.querySelector("[data-transition-backdrop]")?.removeAttribute("data-active");
      lenis?.resize();
      ScrollTrigger.refresh();
      this.page.forEach((m) => m.play?.());
    },
  };
  RB.app = app;

  let menu = null, book = null;
  const boot = () => {
    bootLenis();
    const nav = document.querySelector("[data-navigation]");
    if (nav) menu = new Menu(nav);
    const bk = document.querySelector("[data-book]");
    if (bk) book = new Book(bk);
    const burst = document.querySelector("[data-icon-burst]");
    if (burst && !reduce) new Burst(burst);
    const head = document.querySelector("header");
    if (head) ScrollTrigger.create({ start: "100px top", onEnter: () => head.classList.add("header-scrolling"), onLeaveBack: () => head.classList.remove("header-scrolling") });
    app.mount(document.querySelector("#page-frame"));
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    if (!reduce && /^https?:$/.test(location.protocol) && window.Swup && window.SwupParallelPlugin) RB.transitions = new Transitions(app);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
