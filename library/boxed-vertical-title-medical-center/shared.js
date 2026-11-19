/* Site frame motion — nucleotide-letter background (pixi), menu and body order on entry, phone drawer, section title reveal, speech bubble tail, anchor scroll.
   Page script is window.guIntro = (tl) => {…} Fills in the body part of the incoming order. */
(() => {
  const root = document.documentElement;
  const css = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  // Resolve skin variables (including relational colors) into real colors that canvas and GSAP can read
  const resolveColor = (name) => {
    const probe = document.createElement("i");
    probe.style.cssText = `position:absolute;visibility:hidden;color:var(${name})`;
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  /* Base-letter background — a -10° tilted plate with clusters laid on an 11×22 grid, each cluster’s letters turn on at 50ms intervals, cycling through the four letters A · C · G · T and stopping at 50 ticks.
     The crowd flows upward, speeds up by scroll amount/100, then slows back to 1 by multiplying 0.95 every tick. After 5.5s the panel fades out over 2 seconds */
  function bgLetters(el, holdMs) {
    if (!el || !window.PIXI) return;
    const B = {
      stageAngle: -10, groupSpeed: 1, groupSpeedRate: 0.95, groupSpeedMin: 1,
      groupCharasMin: 10, groupCharasMax: 30, charW: 11, charH: 22, charTTL: 50, charDelay: 50, charAniSpeed: 0.2,
      groups: [], nextJ: 0, framesB: [], framesW: [], beforeY: scrollY, beforeW: 0, resizeTimer: 0, timers: new Set(),
    };
    const mqPc = matchMedia("(min-width: 960px)");
    const setCount = () => { B.groupCharasMin = mqPc.matches ? 20 : 10; B.groupCharasMax = mqPc.matches ? 50 : 30; };
    setCount();
    mqPc.addEventListener("change", setCount);
    const later = (fn, ms) => { const t = setTimeout(() => { B.timers.delete(t); fn(); }, ms); B.timers.add(t); };

    let ww = el.offsetWidth, wh = el.offsetHeight;
    B.beforeW = ww;
    PIXI.utils.skipHello();
    const app = new PIXI.Application({ width: ww, height: wh, backgroundAlpha: 0 });
    el.append(app.view);
    app.stage.rotation = (Math.PI / 180) * B.stageAngle;
    let cntW = Math.ceil(ww / B.charW), cntH = Math.ceil(wh / B.charH);

    // Glyph plate of 8 cells (64px) — first 4 light sky blue, last 4 in the surface color. Drawn at runtime with the skin font instead of the original sprite
    const sheet = document.createElement("canvas");
    sheet.width = 512; sheet.height = 64;
    const draw = () => {
      const ctx = sheet.getContext("2d");
      const fam = css("--kf-font-letters") || css("--kf-font-display");
      ctx.clearRect(0, 0, 512, 64);
      ctx.font = `300 74px ${fam}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      const cols = [resolveColor("--site-letter"), resolveColor("--kf-surface")];
      "ACGTACGT".split("").forEach((ch, k) => { ctx.fillStyle = cols[k < 4 ? 0 : 1]; ctx.fillText(ch, 64 * k + 32, 61); });
    };

    class Group {
      constructor(i, j) {
        this.box = new PIXI.Container();
        this.box.x = B.charW * i;
        this.box.y = B.charH * j;
        this.clock = 0;
        app.stage.addChild(this.box);
        const num = B.groupCharasMin + Math.floor(Math.random() * (B.groupCharasMax - B.groupCharasMin));
        for (let l = 0; l < num; l++) {
          const s = new PIXI.AnimatedSprite(Math.random() > 0.5 ? B.framesB : B.framesW);
          s.animationSpeed = B.charAniSpeed;
          s.x = B.charW * l;
          s.width = B.charH * 0.9;
          s.height = B.charH * 0.9;
          s.visible = false;
          s.ttl = B.charTTL;
          this.box.addChild(s);
        }
      }
      start() {
        this.box.children.forEach((s, k) => {
          s.visible = false; s.ttl = B.charTTL; s.stop();
          later(() => { if (!s.destroyed) { s.visible = true; s.gotoAndPlay(Math.floor(Math.random() * s.totalFrames)); } }, B.charDelay * k);
        });
      }
      update() {
        this.box.y -= B.groupSpeed;
        if (this.box.y < -B.charH * 2) {
          this.box.x = B.charW * Math.floor(-cntW / 4 + Math.random() * cntW * 5 / 4);
          this.box.y = B.charH * cntH;
          this.start();
        }
        if (B.groupSpeed > B.groupSpeedMin && this.clock % 10 === 0 && Math.random() < 0.1) {
          const n = this.box.children.length;
          this.box.children.forEach((s) => later(() => { if (!s.destroyed) { s.ttl = B.charTTL; s.gotoAndPlay(Math.floor(Math.random() * s.totalFrames)); } }, Math.floor(B.charDelay * n * Math.random())));
        }
        this.box.children.forEach((s) => { if (s.ttl <= 0) s.stop(); if (s.visible) s.ttl--; });
        this.clock++;
      }
    }

    const createGroups = () => {
      while (B.nextJ < cntH) {
        B.groups.push(new Group(Math.floor(-cntW / 4 + Math.random() * cntW * 5 / 4), B.nextJ));
        B.nextJ += 2;
      }
      B.groups.forEach((g, k) => later(() => g.start(), B.charDelay * k));
    };
    const clear = () => {
      B.timers.forEach(clearTimeout); B.timers.clear();
      for (let k = app.stage.children.length - 1; k >= 0; k--) app.stage.children[k].destroy({ children: true, texture: false, baseTexture: false });
      B.groups.length = 0; B.nextJ = 0;
    };

    const fam = css("--kf-font-letters") || css("--kf-font-display");
    const ready = document.fonts ? document.fonts.load(`300 74px ${fam}`, "ACGT").catch(() => {}) : Promise.resolve();
    ready.then(() => {
      draw();
      const base = PIXI.BaseTexture.from(sheet);
      for (let k = 0; k < 8; k++) (k < 4 ? B.framesB : B.framesW).push(new PIXI.Texture(base, new PIXI.Rectangle(64 * k, 0, 64, 64)));
      createGroups();
      setTimeout(() => {
        gsap.to(el, { opacity: 0, display: "none", duration: 2, onComplete: () => { app.ticker.stop(); } });
      }, holdMs);
      app.ticker.add(() => {
        for (const g of B.groups) g.update();
        B.groupSpeed *= B.groupSpeedRate;
        if (B.groupSpeed <= B.groupSpeedMin) B.groupSpeed = B.groupSpeedMin;
      });
    });

    addEventListener("scroll", () => {
      const y = scrollY;
      B.groupSpeed += Math.abs(y - B.beforeY) / 100;
      B.beforeY = y;
    }, { passive: true });
    addEventListener("resize", () => {
      ww = el.offsetWidth; wh = el.offsetHeight;
      if (ww === B.beforeW) return;
      cntW = Math.ceil(ww / B.charW); cntH = Math.ceil(wh / B.charH);
      clearTimeout(B.resizeTimer);
      B.resizeTimer = setTimeout(() => { app.renderer.resize(ww, wh); clear(); createGroups(); }, 500);
      B.beforeW = ww;
    });
  }

  /* Phone drawer — the original only toggles the visibility of the right panel (GSAP places the panel at x 0 when entering) */
  function menu() {
    const burger = document.querySelector("[data-burger]");
    if (!burger) return;
    const set = (on) => { document.body.classList.toggle("is-menu", on); burger.setAttribute("aria-expanded", on ? "true" : "false"); };
    burger.addEventListener("click", () => set(!document.body.classList.contains("is-menu")));
    document.querySelectorAll("[data-menu-close]").forEach((a) => a.addEventListener("click", () => set(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("is-menu")) { set(false); burger.focus(); } });
    addEventListener("resize", () => set(false));
  }

  /* Section title, emphasis text, footer row — original values as they are */
  function reveals() {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const soft = resolveColor("--kf-ink-soft");
      gsap.utils.toArray("[data-point]").forEach((p) => {
        gsap.from(p, { color: soft, duration: 1, ease: "power2.out", scrollTrigger: { trigger: p, start: "top 88%" } });
      });
      gsap.utils.toArray("[data-btitle]").forEach((t) => {
        gsap.from(t.querySelectorAll(".gu-btitle__w > span"), { opacity: 0, stagger: 0.1, duration: 0.1, ease: "power2.out", scrollTrigger: { trigger: t, start: "top 90%" } });
      });
      gsap.utils.toArray("[data-sq]").forEach((t) => {
        gsap.from(t.querySelectorAll(".gu-sq__c > span"), { y: 40, stagger: 0.1, duration: 0.5, ease: "power4.out", scrollTrigger: { trigger: t, start: "top 95%" } });
      });
      gsap.utils.toArray("[data-ltitle]").forEach((t) => {
        gsap.timeline({ scrollTrigger: { trigger: t, start: "top 88%" } })
          .from(t.querySelector(".gu-ltitle__v"), { height: 0, duration: 1, ease: "power4.out" })
          .from(t.querySelector(".gu-ltitle__h"), { width: 0, duration: 1.3, ease: "power4.out" }, "<");
      });
      // When the footer’s top edge reaches the bottom of the menu, the speech bubble tail pulls inward (13px only at 1280 and below)
      const list = document.querySelector(".gu-nav__list");
      const horn = document.querySelector("[data-horn]");
      const foot = document.getElementById("footer");
      if (list && horn && foot) {
        gsap.to(horn, {
          x: matchMedia("(max-width: 1280px)").matches ? -13 : 0, duration: 0.25, ease: "power4.out",
          scrollTrigger: { trigger: foot, start: `top ${list.offsetTop + list.offsetHeight}px`, toggleActions: "play reverse play reverse" },
        });
      }
    });
  }

  /* On enter — the menu column slides in from -20px, the phone header fades in, the body panel switches on after 0.6s and the page section follows */
  function intro() {
    const side = document.querySelector(".gu-side");
    const sp = document.querySelector(".gu-head-sp");
    const main = document.querySelector(".gu-main");
    if (reduce) {
      gsap.set([side, sp, main], { opacity: 1, x: 0 });
      return;
    }
    const tl = gsap.timeline();
    tl.to(side, { opacity: 1, delay: 0.2, duration: 0.2, x: 0, ease: "power4.out" });
    tl.to(sp, { opacity: 1, delay: 0.2, duration: 0.3, ease: "power4.out" }, "<");
    tl.to(main, { opacity: 1, duration: 0.05, ease: "power4.out" }, "+=.6");
    if (typeof window.guIntro === "function") window.guIntro(tl);
  }

  function boot() {
    // The original replays from the top even after a refresh
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);
    if (!reduce) bgLetters(document.getElementById("bg"), document.body.dataset.page === "home" ? 5500 : 4000);
    else document.getElementById("bg")?.remove();
    menu();
    intro();
    reveals();
    if (window.SmoothScroll) new SmoothScroll('a[href*="#"]', { speed: 200 });
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", boot);
  else boot();
})();
