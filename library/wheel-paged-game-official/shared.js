// Site frame — loader, one section per wheel turn (narrow screens) / normal scroll (wide screens), menu pillar, phone menu, language, notice window.
// Per-section choreography is hooked to KJ.onSection by index.js, and this file handles only the transition and menu color.
(() => {
  const BP = 768;
  const isSp = innerWidth <= BP;
  const RATIO = isSp ? 393 / 650 : 1366 / 620;
  const html = document.documentElement;
  gsap.registerPlugin(CustomEase, ScrollToPlugin, ScrollTrigger);

  const KJ = (window.KJ = {
    isSp,
    reduce: false,
    ease: {
      in: CustomEase.create("kjIn", "M0,0 C0.598,0.988 0.575,1 1,1"),
      out: CustomEase.create("kjOut", "M0,0 C0.237,0.947 0.289,1 1,1"),
      half: CustomEase.create("kjHalf", "M0,0 C0.5,0 0.5,1 1,1"),
    },
    onSection: null,
    scroll: null,
    remToPx: (r) => r * parseFloat(getComputedStyle(html).fontSize),
  });

  // Section title: a bar covers from the left (.25s), lights the letters, then clears to the right
  KJ.titleIn = (key, { cover = 0.25, reveal = 1 } = {}) => {
    const root = document.querySelector(`[data-title="${key}"]`);
    if (!root) return;
    const sq = root.querySelector(".kj-title__square");
    const main = root.querySelector(".kj-title__main");
    gsap.timeline()
      .set(sq, { transformOrigin: "left" })
      .to(sq, { scaleX: 1, duration: cover, ease: KJ.ease.in, delay: 0.2 })
      .set(main, { opacity: 1 })
      .set(sq, { transformOrigin: "right" })
      .to(sq, { scaleX: 0, duration: reveal, ease: KJ.ease.out });
  };

  // Text that settles from random characters into its own — the same shuffle-text 0.3.6 as inside the original bundle
  KJ.shuffle = (el, { duration = 600, empty = "-" } = {}) => {
    const s = new ShuffleText(el);
    s.duration = duration;
    s.emptyCharacter = empty;
    return s;
  };

  // Loader — ”Loading” blinking, the logo goes from blurred to sharp then grows and exits, and the Hero settles from 500%→100% brightness
  const loader = {
    isLoaded: false,
    init() {
      const text = document.getElementById("kj-loading-text");
      text?.classList.add("is-active");
      gsap.to(text, { opacity: 1, duration: 1, delay: 0.6, ease: "power1.out" });
    },
    start() {
      const tl = gsap.timeline({ delay: 0.6 });
      tl.to("#kj-loading .kj-loading__logo svg", { opacity: 1, duration: 1.4, ease: "power1.out" }, "show")
        .to("#kj-loading .kj-loading__logo svg", { filter: "blur(0px)", duration: 1.4, ease: "power1.out" }, "show")
        .to("#kj-loading-text", { opacity: 0, duration: 0.5, ease: "power2.inOut", delay: 2 }, "hide")
        .to("#kj-loading .kj-loading__logo svg", { scale: isSp ? 1.8 : 1.3, opacity: 0, duration: 0.4, ease: "power2.inOut" }, "hide+=0.2")
        .to("#kj-loading", { opacity: 0, duration: isSp ? 0.8 : 1, ease: "power2.inOut" }, "hide+=0.2")
        .set("#kj-loading", { display: "none" })
        .to("#kj-kv-bg", { opacity: 1, scale: 1, duration: isSp ? 0.6 : 0.7, ease: "power2.out" }, "hide+=0.3")
        .fromTo("#kj-kv-bg .kj-kv__img", { filter: "brightness(500%)" }, { filter: "brightness(100%)", duration: isSp ? 1.2 : 1.5, ease: "power2.out" }, "hide+=0.3")
        .to("#kj-kv-logo", { opacity: 1, scale: 1, duration: 0.4, ease: "power2.inOut" }, "hide+=0.8")
        .to("#kj-kv-tagline", { opacity: 1, scale: 1, duration: 0.4, ease: "power2.inOut", onStart: () => { loader.isLoaded = true; } }, "hide+=1");
      const banner = document.getElementById("kj-banner-a");
      if (banner) tl.to(banner, { opacity: 1, duration: 0.4, ease: "power2.inOut", onComplete: () => dispatchEvent(new CustomEvent("kj:kvready")) }, "hide+=1.3");
    },
  };
  KJ.loader = loader;

  const sectionsOf = () => [...document.querySelectorAll(isSp ? ".kj-section.--sp" : ".kj-section.--pc")];
  const menuBtns = () => [...document.querySelectorAll(isSp ? ".kj-menuSp .kj-menu-item" : ".kj-headerPc .kj-menu-item")];
  const snsPc = document.getElementById("kj-sns-pc");
  const headerSp = document.getElementById("kj-header-sp");
  const footerSp = document.getElementById("kj-app-links-sp");

  // Over light sections (Hero, Character, System, Campaign), turn the SNS row and phone header black
  const snsColor = (e) => {
    const light = e === 0 || e === 4 || e === 5 || e === 6;
    if (isSp) {
      const black = light && e !== 0;
      headerSp?.classList.toggle("is-black", black);
      footerSp?.classList.toggle("is-black", black);
    } else snsPc?.classList.toggle("is-black", light);
  };
  const sectionEvent = (e, t) => {
    if (!isSp) {
      if (e === 8) snsPc?.classList.add("is-hide");
      if (t === 8) snsPc?.classList.remove("is-hide");
    }
    KJ.onSection?.(e, t);
    snsColor(e);
  };
  const setMenuCurrent = (btns, e, t) => { btns[t]?.classList.remove("is-active"); btns[e]?.classList.add("is-active"); };

  // Narrow screens: the document is a 1000vh blank board and the sections are pinned to the screen. Reads only up/down from the Lenis speed and swaps one section at a time
  class OnePage {
    constructor() {
      this.sections = sectionsOf();
      this.btns = menuBtns();
      this.current = 0;
      this.inAnimating = true;
      this.sections.forEach((s, i) => i > 0 && gsap.set(s, { yPercent: 100, autoAlpha: 0 }));
      this.clickEvent();
      this.lenis = new Lenis({ duration: 0, syncTouch: true });
      const raf = (time) => { this.lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      this.resetToMiddle(false);
      this.lenis.on("scroll", ({ velocity }) => {
        if (this.inAnimating) return;
        const dir = velocity > 0 ? "down" : "up";
        if (Math.abs(velocity) >= 20 && loader.isLoaded) {
          this.inAnimating = true;
          if (dir === "down") {
            if (this.current < this.sections.length - 1) { this.resetToMiddle(true); this.go(this.current + 1, -1); } else this.inAnimating = false;
          } else if (this.current > 0) { this.resetToMiddle(true); this.go(this.current - 1, 1); } else this.inAnimating = false;
        }
        const y = scrollY, h = innerHeight, H = html.scrollHeight;
        if (y + h >= H - 10 || y <= 10) { this.inAnimating = true; this.resetToMiddle(false); }
      });
      addEventListener("keydown", (ev) => {
        if (this.inAnimating || !loader.isLoaded) return;
        if (ev.key === "ArrowUp" && this.current > 0) { this.inAnimating = true; this.resetToMiddle(true); this.go(this.current - 1, 1); }
        else if (ev.key === "ArrowDown" && this.current < this.sections.length - 1) { this.inAnimating = true; this.resetToMiddle(true); this.go(this.current + 1, -1); }
      });
      if (location.hash) {
        const i = this.sections.findIndex((s) => s.id === location.hash.slice(1));
        if (i > 0) this.go(i, -1);
      }
    }
    resetToMiddle(moving) {
      this.lenis.stop();
      gsap.to(window, {
        scrollTo: { y: (html.scrollHeight - innerHeight) / 2, x: 0 }, duration: 0.2, ease: "none",
        onComplete: () => { if (!moving) setTimeout(() => { this.lenis.start(); this.inAnimating = false; }, 500); },
      });
    }
    go(e, dir) {
      const from = this.sections[this.current], to = this.sections[e];
      if (!from || !to) return;
      if (!isSp) setMenuCurrent(this.btns, e, this.current);
      sectionEvent(e, this.current);
      if (to.id) history.replaceState(null, "", "#" + to.id);
      const last = isSp ? 9 : 8;
      gsap.timeline({ defaults: { duration: 0.4, ease: "power2.out" } })
        .to(from, { yPercent: 100 * dir, autoAlpha: 0, onComplete: () => { this.current = e; this.inAnimating = false; this.lenis.start(); } }, "move")
        .fromTo(to, { yPercent: -100 * dir }, { yPercent: 0 }, "move")
        .fromTo(to, { autoAlpha: 0 }, { autoAlpha: 1, duration: e === last ? 1 : 0.4, ease: e === last ? "power1.inOut" : "power2.out" }, e === last ? (isSp ? "move+=0.1" : "move+=0.2") : "move+=0.1");
    }
    clickEvent() {
      this.btns.forEach((b) => b.addEventListener("click", (ev) => {
        ev.preventDefault();
        const i = parseInt(b.dataset.index || "-1", 10);
        if (this.inAnimating || i === -1) return;
        this.inAnimating = true;
        const from = this.sections[this.current], to = this.sections[i];
        const dir = i > this.current ? -1 : 1;
        if (!from || !to) return;
        if (to.id) history.replaceState(null, "", "#" + to.id);
        if (!isSp) setMenuCurrent(this.btns, i, this.current);
        gsap.timeline({ defaults: { duration: 0.4, ease: "power2.out" } })
          .to(from, { autoAlpha: 0, duration: isSp ? 0.2 : 0.4 })
          .set(from, { yPercent: 100 * dir })
          .set(to, { yPercent: 0 })
          .to(to, { autoAlpha: 1, onStart: () => sectionEvent(i, this.current), onComplete: () => { this.inAnimating = false; this.current = i; this.enable(); } });
      }));
    }
    disable() { this.lenis.stop(); }
    enable() { this.lenis.start(); }
  }

  // Wide screens (aspect ratio 1366/620 or more): sections stack with normal scroll, and the effect turns on when the section reaches 70% of the screen
  class Normal {
    constructor() {
      this.sections = sectionsOf();
      this.btns = menuBtns();
      this.current = 0;
      this.isScrolling = false;
      this.sections.forEach((s) => s.classList.add("is-normal"));
      html.classList.add("is-normal");
      document.getElementById("kj-header-pc")?.classList.add("is-normal");
      const easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
      this.lenis = new Lenis({ duration: 0.4, easing, orientation: "vertical", wheelMultiplier: 0.4, lerp: 0.1 });
      this.lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => this.lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      this.sections.forEach((s, i) => ScrollTrigger.create({
        trigger: s, start: "top bottom-=30%",
        onEnter: () => { if (!this.isScrolling) this.set(i); },
        onLeaveBack: () => { if (!this.isScrolling) this.set(Math.max(0, i - 1)); },
      }));
      if (!isSp) ScrollTrigger.create({
        trigger: "#footer", start: "bottom-=20% bottom",
        onEnter: () => snsPc?.classList.add("is-hide"), onLeaveBack: () => snsPc?.classList.remove("is-hide"),
      });
      this.btns.forEach((b, i) => b.addEventListener("click", (ev) => {
        ev.preventDefault();
        this.lenis.start();
        this.isScrolling = true;
        this.set(i);
        this.lenis.scrollTo(b.getAttribute("href"), { duration: isSp ? 0.1 : 0.6, lerp: 0.1, easing, onComplete: () => { this.isScrolling = false; } });
      }));
    }
    set(i) { sectionEvent(i, this.current); setMenuCurrent(this.btns, i, this.current); this.current = i; }
    disable() { this.lenis.stop(); }
    enable() { this.lenis.start(); }
  }

  // Menu column: language list on hover, inside the column SimpleBar
  const langCur = document.getElementById("kj-lang-current-pc");
  const langList = document.getElementById("kj-lang-list-pc");
  langCur?.addEventListener("mouseenter", () => langList.classList.add("is-active"));
  langCur?.addEventListener("mouseleave", () => langList.classList.remove("is-active"));
  const headerInner = document.getElementById("kj-header-pc-inner");
  if (headerInner && !isSp) new SimpleBar(headerInner, { autoHide: true });

  // Phone language: tap to open, tap outside to close
  const spCur = document.getElementById("kj-lang-current-sp");
  const spList = document.getElementById("kj-lang-list-sp");
  const outside = (ev) => { if (!ev.target.closest("#kj-lang-sp")) closeSpLang(); };
  const closeSpLang = () => { spList.classList.remove("is-active"); document.removeEventListener("click", outside, true); };
  spCur?.addEventListener("click", () => {
    if (spList.classList.contains("is-active")) closeSpLang();
    else { spList.classList.add("is-active"); document.addEventListener("click", outside, true); }
  });

  // Phone menu: the panel turns on in .3s and links rise from 50% below at .06s intervals
  const spMenu = {
    init() {
      this.reset();
      document.getElementById("kj-menu-btn-sp")?.addEventListener("click", () => this.open());
      document.getElementById("kj-menu-close-sp")?.addEventListener("click", () => this.close(true));
      document.querySelectorAll(".kj-menuSp .kj-menu-item").forEach((a) => a.addEventListener("click", () => this.close(false)));
    },
    reset() { gsap.set(".kj-menu-item-sp", { opacity: 0, yPercent: 50 }); gsap.set("#kj-menu-lang-sp", { opacity: 0 }); },
    open() {
      KJ.scroll?.disable();
      gsap.timeline().set("#kj-menu-sp", { display: "block", opacity: 0 }).to("#kj-menu-sp", { opacity: 1, duration: 0.3, ease: "power2.inOut" });
      gsap.to(".kj-menu-item-sp", { opacity: 1, yPercent: 0, duration: 0.4, ease: "power1.out", stagger: 0.06 });
      gsap.to("#kj-menu-lang-sp", { opacity: 1, duration: 0.5, ease: "power1.inOut", delay: 0.5 });
    },
    close(resume) {
      if (resume) KJ.scroll?.enable();
      gsap.timeline().to("#kj-menu-sp", { opacity: 0, duration: 0.3, ease: "power2.inOut", onComplete: () => this.reset() }).set("#kj-menu-sp", { display: "none" });
    },
  };

  // Hero alert window — opens right away on phone, on PC ?f=When app
  const popup = {
    init() {
      const modal = document.getElementById("kj-popup-modal");
      if (!modal) return;
      if (new URLSearchParams(location.search).get("f") === "app" || isSp) this.open(modal);
      document.querySelectorAll(".kj-popup-close").forEach((b) => b.addEventListener("click", () => {
        gsap.timeline().set([".kj-popup-inner", "#kj-popup-bg"], { pointerEvents: "none" })
          .to([modal, "#kj-popup-bg"], { opacity: 0, duration: 0.2, ease: "power1.out" })
          .set([modal, "#kj-popup-bg"], { display: "none" });
      }));
    },
    open(modal) {
      gsap.timeline().set(modal, { display: "flex", scale: 0.94 }).to(modal, { scale: 1, opacity: 1, duration: 0.3, ease: "power1.out" }).set(".kj-popup-inner", { pointerEvents: "auto" });
      gsap.timeline().set("#kj-popup-bg", { display: "block" }).to("#kj-popup-bg", { opacity: 0.8, duration: 0.3, ease: "power1.out" });
    },
  };

  // When the width crosses 768 or the aspect ratio crosses the threshold, reopen like the original
  matchMedia(`(max-width: ${BP}px)`).addEventListener("change", () => location.reload());

  KJ.boot = () => {
    const mm = gsap.matchMedia();
    mm.add({ still: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      if (KJ.booted) return;
      KJ.booted = true;
      KJ.reduce = ctx.conditions.still;
      // With reduced motion, every tween jumps straight to its end state (looping effects are stopped separately by index.js)
      if (KJ.reduce) gsap.globalTimeline.timeScale(1e4);
      const onePage = innerWidth / innerHeight < RATIO;
      if (!onePage && innerWidth > BP) {
        addEventListener("resize", () => { if (innerWidth / innerHeight <= RATIO && innerWidth > BP) location.reload(); });
      } else if (innerWidth > BP) {
        addEventListener("resize", () => { if (innerWidth / innerHeight > RATIO) location.reload(); });
      }
      loader.init();
      KJ.scroll = onePage ? new OnePage() : new Normal();
      spMenu.init();
      popup.init();
      KJ.onBoot?.();
    });
  };
})();
