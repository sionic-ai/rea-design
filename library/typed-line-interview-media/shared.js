// Motion shared by four pages: Lenis (lerp .8), a logo-strip header row that folds as you scroll down, a menu drawer, first loader, show-on-view, footer parallax, shape strip push,
// barba 2.10.3 transition (cell grid curtain — cell-fade-cover part). Page scripts are registered with LD.page(name, attach), attached when the box is up and detached when it leaves.
// Original order: once the document is ready the loader starts after .01s (is-loaded), the page starts 1.3s later (is-page-start — typing · shapes · root art). After a transition, right after the curtain lifts.
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = () => innerWidth > 1024;
  const touch = matchMedia("(hover: none)").matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(v, b));
  const sizes = () => ({ margin: wide() ? 16 : 14, gap: wide() ? 16 : 14, cols: wide() ? 16 : 8 });
  const pages = {};
  const LD = (window.LD = { page: (name, fn) => (pages[name] = fn), lenis: null });

  // ── Smooth scroll — original lerp .8 · duration 1 · touchMultiplier 1
  const scroll = { y: scrollY, dir: 0 };
  const onScroll = (y, dir) => {
    const delta = y - scroll.y;
    scroll.y = y;
    header.update(dir, delta);
    footerPlx();
    figMarquee();
  };
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = (LD.lenis = new Lenis({ lerp: 0.8, duration: 1, touchMultiplier: 1 }));
    lenis.on("scroll", ({ scroll: y, direction }) => { onScroll(y, direction); ScrollTrigger.update(); });
    const raf = (t) => { lenis.raf(t * 1000); header.check(); };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); LD.lenis = null; };
  });
  if (reduce) addEventListener("scroll", () => onScroll(scrollY, Math.sign(scrollY - scroll.y)), { passive: true });

  // ── Header row: shrinks the logo band height by half the scrolled amount, then to 0 in .2s once past 80%. Even when scrolling up it stays collapsed unless near the top (twice the band height)
  const headerEl = document.querySelector(".ld-header");
  const menuEl = document.querySelector(".ld-menu");
  const header = {
    pos: 0, height: 0, hidden: false, hh: 11,
    resize() { this.hh = wide() ? 11 : 8; this.height = innerHeight * this.hh * 0.01; this.reset(); },
    setDir(d) { html.classList.toggle("is-scroll-up", d === "up"); html.classList.toggle("is-scroll-down", d === "down"); },
    update(dir, delta) {
      const near = 2 * this.height;
      if (dir <= 0 && scroll.y < near) { this.setDir("up"); this.reset(); }
      else if (dir <= 0 && scroll.y > 0) { this.setDir("down"); this.hide(this.height); }
      else if (dir > 0 && scroll.y > 0) { this.setDir("down"); this.hide(delta * 0.5); }
    },
    check() { if (this.hidden && scroll.y === 0) { this.setDir("up"); this.reset(); } },
    hide(t) {
      this.hidden = true;
      const e = -this.height, { gap, margin } = sizes();
      this.pos = clamp(this.pos - t, e - gap, 0);
      if (this.pos < 0.8 * e) {
        this.pos = e - margin;
        gsap.to(headerEl, { duration: 0.2, "--h": "0vh", gap: 0 });
        gsap.to(menuEl, { duration: 0.2, y: this.pos });
      } else {
        const k = this.pos / e || 0;
        gsap.set(headerEl, { "--h": `${this.hh - this.hh * k}vh`, gap: gap - gap * k });
        gsap.set(menuEl, { y: this.pos });
      }
    },
    reset(dur = 0.2) {
      this.hidden = false;
      this.pos = 0;
      gsap.to(headerEl, { duration: dur, ease: "none", "--h": `${this.hh}vh`, gap: sizes().gap });
      gsap.to(menuEl, { duration: 0.2, y: 0 });
    },
  };

  // ── Menu drawer — opens and closes with the button, closes when the mouse leaves the drawer
  const drawer = document.querySelector(".ld-drawer");
  const menu = {
    open: false,
    set(v) {
      this.open = v;
      html.classList.toggle("is-menu-open", v);
      menuEl.classList.toggle("is-open", v);
      drawer.setAttribute("aria-expanded", String(v));
      drawer.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
    },
  };
  drawer.addEventListener("click", () => menu.set(!menu.open));
  menuEl.addEventListener("mouseleave", () => menu.open && menu.set(false));

  // ── Show when visible (data-shown once, data-visible on enter and leave)
  let io = null;
  const watch = (root) => {
    io?.disconnect();
    io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.dataset.shown = 1; en.target.dataset.visible = 1; } else en.target.dataset.visible = 0;
    }), { threshold: 0 });
    document.querySelectorAll("[data-iv]").forEach((n) => io.observe(n));
  };

  // ── Footer — on approach the side margins (--m) open from 0→16, and the two lines inside drop from above by the panel height and settle in place (wide screens·mouse devices)
  const footerPlx = () => {
    if (!wide() || touch) return;
    const f = document.querySelector(".ld-container .ld-footer");
    if (!f) return;
    const parts = f.querySelectorAll(".ld-footer__sns, .ld-footer__bottom");
    const { top: n, height: r } = f.getBoundingClientRect();
    const o = (r + (n - innerHeight)) / r;
    const s = (0.5 * r + (n + 0.5 * r - innerHeight)) / (0.5 * r);
    const m = sizes().margin;
    gsap.set(f, { "--m": m - m * clamp(s, 0, 1) });
    gsap.set(parts, { y: -r * clamp(o, 0, 1) });
  };
  // ── Shape strip — pushed toward −25vw starting from 1.5x the screen height below
  const figMarquee = () => {
    const el = document.querySelector(".ld-container .ld-figmq");
    if (!el) return;
    const e = innerHeight, n = el.getBoundingClientRect().top;
    if (n < e && n > -0.5 * e) gsap.set(el, { "--p": (1.5 * e - n) / (1.5 * e) });
  };

  // ── Current page link indicator ──
  const markCurrent = () => {
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("a[href]").forEach((a) => {
      const to = a.getAttribute("href");
      a.classList.toggle("is-current", to === here && !a.closest(".ld-btn, .ld-banner"));
    });
  };

  // ── Page attach · detach
  let mounted = null;
  const mount = (root) => {
    const name = root.dataset.barbaNamespace;
    const ctx = gsap.context(() => {}, root);
    let api = {};
    ctx.add(() => { api = pages[name]?.(root, { wide, reduce }) || {}; });
    mounted = { root, ctx, api };
    watch(root);
    markCurrent();
    scroll.y = scrollY;
    footerPlx();
    figMarquee();
  };
  const unmount = () => {
    if (!mounted) return;
    mounted.api.destroy?.();
    mounted.ctx.revert();
    mounted = null;
  };
  // Page start — the typing line fires fx:play, the shape panel fires fx:play after .2s on wide screens and 1s on narrow ones, then the page script’s start
  const pageStart = () => {
    html.classList.add("is-page-start");
    const root = mounted?.root;
    if (!root) return;
    root.querySelectorAll('[data-fx~="type-belt-lines"]').forEach((n) => n.dispatchEvent(new CustomEvent("fx:play")));
    const drop = root.querySelector('[data-fx~="shape-pick-drop"]');
    if (drop) gsap.delayedCall(wide() ? 0.2 : 1, () => drop.dispatchEvent(new CustomEvent("fx:play")));
    mounted.api.start?.();
  };

  // ── Page picker (select) — choosing goes to that page
  document.addEventListener("change", (e) => {
    const s = e.target.closest?.(".ld-page-select");
    if (!s) return;
    if (window.barba && /^https?:$/.test(location.protocol)) barba.go(s.value);
    else location.href = s.value;
  });

  // First loader — .01s after the document stands, is-loaded is set (loader css ends at 2.7s), and the page starts 1.3s later.
  // The page script (LD.page) loads after shared.js, so attach it after the document is fully built
  const boot = () => {
    const splash = document.querySelector(".ld-splash");
    header.resize();
    addEventListener("resize", () => { header.resize(); footerPlx(); });
    mount(document.querySelector('[data-barba="container"]'));
    if (reduce) { splash?.classList.add("is-skip"); html.classList.add("is-loaded"); pageStart(); }
    else {
      gsap.delayedCall(0.01, () => html.classList.add("is-loaded"));
      gsap.delayedCall(1.3, pageStart);
    }
    if (window.barba && /^https?:$/.test(location.protocol)) transitions();
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : setTimeout(boot);

  // ── barba transition — after .3s the curtain covers cell by cell (.1s · spread .3s), once covered it jumps to the top and hides the old container. The new container appears at .3s and the curtain lifts in the same way
  function transitions() {
  const cover = document.querySelector(".ld-transition");
  const veil = (type) => new Promise((done) => cover.dispatchEvent(new CustomEvent(type, { detail: { done } })));
  let backY = 0;
  history.scrollRestoration = "manual";
  barba.init({
    preventRunning: true,
    timeout: 10000,
    prevent: ({ el }) => !!el?.closest(".wf-ui") || el?.target === "_blank" || (el?.getAttribute("href") || "").startsWith("#"),
    transitions: [{
      name: "cells",
      async leave({ current, trigger }) {
        html.classList.add("is-transition");
        LD.lenis?.stop();
        if (trigger === "back") backY = barba.history.current?.scroll?.y || 0;
        await veil("fx:cover");
        if (trigger !== "back") { LD.lenis?.start(); LD.lenis?.scrollTo(0, { immediate: true }); scrollTo(0, 0); }
        gsap.set(current.container, { display: "none" });
        html.classList.remove("is-scroll-up", "is-scroll-down");
        header.reset(0);
      },
      // The original ends enter immediately so page start (typing, shapes) runs while the curtain lifts — it does not wait for the lift
      enter({ next, trigger }) {
        gsap.fromTo(next.container, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.inOut" });
        if (trigger === "back") { LD.lenis?.start(); LD.lenis?.scrollTo(backY, { immediate: true }); }
        veil("fx:uncover").then(() => setTimeout(() => html.classList.remove("is-transition"), 200));
      },
    }],
  });
  barba.hooks.beforeLeave(() => menu.set(false));
  barba.hooks.beforeEnter(({ next }) => {
    html.classList.remove("is-page-start");
    unmount();
    const doc = new DOMParser().parseFromString(next.html, "text/html");
    if (doc.title) document.title = doc.title;
  });
  barba.hooks.enter(({ next }) => mount(next.container));
  barba.hooks.after(() => { LD.lenis?.resize(); ScrollTrigger.refresh(); pageStart(); });
  }
})();
