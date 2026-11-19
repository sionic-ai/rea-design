/* Motion for the whole site — header line (magnet · text swap · typewriter), menu panel, sound effects, swup (instant transition), page modules */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = () => matchMedia("(any-hover: hover)").matches;
  if (window.gsap && window.TextPlugin) gsap.registerPlugin(TextPlugin);
  const bus = new EventTarget();
  const emit = (n) => bus.dispatchEvent(new Event(n));
  window.TT = { bus, modules: {} };
  // The page module also uses the magnet defined below
  TT.magnet = (...a) => magnet(...a);

  /* ───── Sound effects — instead of the original files, short sine ticks made with WebAudio (random among 8 hover and 5 click pitches) ───── */
  const Sound = (() => {
    let ctx = null, last = 0;
    const HOVER = [880, 932, 988, 1047, 1109, 1175, 1245, 1319], CLICK = [523, 587, 659, 698, 784];
    const unlock = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } ctx?.resume?.(); };
    addEventListener("pointerdown", unlock, { passive: true });
    addEventListener("keydown", unlock);
    const blip = (freq, dur, vol) => {
      if (!ctx || ctx.state !== "running") return;
      const now = ctx.currentTime;
      if (now - last < 0.03) return;
      last = now;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g).connect(ctx.destination); o.start(now); o.stop(now + dur + 0.02);
    };
    bus.addEventListener("ui:sound:hover", () => blip(HOVER[(Math.random() * HOVER.length) | 0], 0.06, 0.04));
    bus.addEventListener("ui:sound:click", () => { blip(CLICK[(Math.random() * CLICK.length) | 0], 0.09, 0.07); navigator.vibrate?.(10); });
    return { unlock };
  })();

  /* ───── Magnet that pulls up to 14px toward the cursor (distance × .4) — quickTo .2s power3.out ───── */
  const magnet = (zone, target, max = 14) => {
    if (!zone || !target || reduce() || !canHover() || !window.gsap) return () => {};
    const qx = gsap.quickTo(target, "x", { duration: 0.2, ease: "power3.out" }), qy = gsap.quickTo(target, "y", { duration: 0.2, ease: "power3.out" });
    const move = (e) => { const r = zone.getBoundingClientRect(); const c = (v) => Math.max(-max, Math.min(max, v * 0.4)); qx(c(e.clientX - (r.left + r.width / 2))); qy(c(e.clientY - (r.top + r.height / 2))); };
    const leave = () => { qx(0); qy(0); };
    zone.addEventListener("mousemove", move); zone.addEventListener("mouseleave", leave);
    return () => { zone.removeEventListener("mousemove", move); zone.removeEventListener("mouseleave", leave); gsap.set(target, { x: 0, y: 0 }); };
  };

  // On the original, the team and list cells are tilted and don’t follow the cursor over images poking outside the cell box — they snap back in place (the home work cell doesn’t do this). The part only returns on mouseleave, so it signals the leave right there
  document.addEventListener("mousemove", (e) => {
    const el = e.target.closest?.('.c-team-thumb[data-fx~="stepped-tilt-follow"], .c-column-item[data-fx~="stepped-tilt-follow"]');
    if (!el) return;
    const b = el.getBoundingClientRect();
    if (Math.abs(e.clientX - (b.left + b.width / 2)) < b.width / 2 && Math.abs(e.clientY - (b.top + b.height / 2)) < b.height / 2) return;
    e.stopPropagation();
    el.dispatchEvent(new MouseEvent("mouseleave"));
  }, true);

  /* ───── Header line ───── */
  const Header = (() => {
    let head, nav, cur, t1, t2, toggle, typer = null, name = "", open = false, lastY = 0;
    const text = (el, v, d = 0.1, delay = 0) => (window.gsap && !reduce() ? gsap.to(el, { duration: d, delay, text: v, ease: "linear" }) : (el.textContent = v));
    const type = (s, animate = true) => {
      clearInterval(typer); typer = null;
      if (!animate || reduce()) { cur.textContent = s; return; }
      cur.textContent = "";
      if (!s) return;
      let i = 0;
      typer = setInterval(() => { i += 1; cur.textContent = s.slice(0, i); if (i >= s.length) { clearInterval(typer); typer = null; } }, 45);
    };
    const logo = (on) => { text(t1, on ? "TWO" : "T", 0.1); text(t2, on ? "TONE" : "T", 0.1, 0.1); };
    const label = (on) => {
      if (!window.gsap || reduce()) { toggle.textContent = on ? "CLOSE" : "MENU"; return; }
      gsap.timeline().to(toggle, { duration: 0.1, text: " ", ease: "linear" }).to(toggle, { duration: 0.15, text: on ? "CLOSE" : "MENU", ease: "linear" });
    };
    const show = () => { open = true; head.classList.add("is-nav-open"); nav.classList.add("is-show"); type("", false); logo(true); label(true); };
    const hide = () => { open = false; head.classList.remove("is-nav-open"); nav.classList.remove("is-show"); type(name, false); logo(false); label(false); };
    const markCurrent = () => {
      const id = $("main")?.dataset.contentId || "";
      $$(".site-header nav a, .p-nav nav a").forEach((a) => a.classList.toggle("is-current", a.dataset.nav === id || (id === "projects-detail" && a.dataset.nav === "projects")));
    };
    return {
      init() {
        head = $(".site-header"); nav = $(".p-nav"); cur = $(".current", head); [t1, t2] = $$(".logo span", head); toggle = $(".header-toggle span", head);
        $(".header-toggle", head).addEventListener("click", () => { emit("ui:sound:click"); open ? hide() : show(); });
        $(".p-nav__bg", nav).addEventListener("click", hide);
        $$(".site-header nav a, .p-nav nav a, .site-header .logo a").forEach((a) => {
          a.addEventListener("mouseenter", () => emit("ui:sound:hover"));
          a.addEventListener("click", () => { emit("ui:sound:click"); if (open) hide(); });
          if (a.closest(".site-header nav, .p-nav nav")) magnet(a, a.firstElementChild || a);
        });
        magnet($(".logo a", head), $(".logo p", head));
        magnet($(".header-toggle", head), toggle);
        addEventListener("scroll", () => {
          const y = scrollY;
          if (!open && !reduce()) head.classList.toggle("is-hidden", y > lastY && y > 120);
          lastY = y;
        }, { passive: true });
        addEventListener("keydown", (e) => e.key === "Escape" && open && hide());
        name = $("main")?.dataset.navName || "";
        markCurrent();
        // Like the original, play it each time a page is opened fresh (this init does not run again on swup transitions)
        if (reduce() || !window.gsap) { this.done(); type(name, true); return; }
        this.intro();
      },
      // First-visit intro. 0s T→TWO (.18) · .6s T→TONE (.2) · 1.9s menu text and MENU typed in over .35s, logo becomes T T (.24) · ends at 2.2s
      async intro() {
        head.classList.add("is-intro");
        const labels = $$("nav a span", head);
        const keep = (el) => { el.style.width = `${el.offsetWidth}px`; el.dataset.full = el.textContent; el.textContent = ""; };
        labels.forEach(keep); keep(toggle); cur.textContent = "";
        gsap.to(t1, { duration: 0.18, text: "TWO", ease: "linear" });
        gsap.to(t2, { duration: 0.2, delay: 0.6, text: "TONE", ease: "linear" });
        const at = 1.9;
        labels.concat(toggle).forEach((el) => gsap.to(el, { duration: 0.35, delay: at, text: el.dataset.full, ease: "linear" }));
        gsap.to(t1, { duration: 0.24, delay: at, text: "T", ease: "linear" });
        gsap.to(t2, { duration: 0.24, delay: at, text: "T", ease: "linear", onStart: () => head.classList.remove("is-intro") });
        setTimeout(() => type(name, true), at * 1000);
        await new Promise((r) => setTimeout(r, (at + 0.3) * 1000));
        labels.concat(toggle).forEach((el) => (el.style.width = ""));
        this.done();
      },
      done() {
        document.documentElement.dataset.siteIntroHeaderComplete = "1";
        window.dispatchEvent(new CustomEvent("site:intro:header:complete"));
      },
      view(first) {
        name = $("main")?.dataset.navName || "";
        markCurrent();
        head.classList.remove("is-hidden");
        if (open) hide();
        type(name, !first || true);
      },
    };
  })();

  /* ───── Team panel that rises in from 10% while names are written out letter by letter ───── */
  {
    let io = null;
    TT.modules.TeamThumbs = {
      init() {
        const els = $$(".c-team-thumb");
        if (!els.length) return;
        const typeIn = (el) => {
          $$(".type", el).forEach((s, k) => {
            const full = s.dataset.full || s.textContent;
            s.dataset.full = full;
            if (reduce() || !window.gsap) { s.textContent = full; return; }
            gsap.fromTo(s, { text: { value: "", delimiter: "" } }, { text: { value: full, delimiter: "" }, duration: Math.max(0.45, full.length * 0.03), delay: k * 0.1, ease: "none" });
          });
        };
        io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); typeIn(e.target); io.unobserve(e.target); } }), { root: $(".p-index-main") ? null : null, rootMargin: "0px 0px -10% 0px" });
        els.forEach((el) => io.observe(el));
      },
      destroy() { io?.disconnect(); io = null; },
    };
  }

  const run = (fn) => Object.values(TT.modules).forEach((m) => m?.[fn]?.());

  function startSwup() {
    // Opening as a file blocks fetch so preload throws an error — attach paging only on http
    if (typeof Swup === "undefined" || location.protocol === "file:") return;
    const swup = new Swup({
      animationSelector: '[class*="transition-"]',
      containers: ["main"],
      cache: true,
      ignoreVisit: (url, { el } = {}) => !!el?.closest("[data-no-swup]"),
      plugins: [
        new SwupA11yPlugin(),
        new SwupPreloadPlugin({ preloadHoveredLinks: true, preloadVisibleLinks: false }),
        new SwupBodyClassPlugin(),
        new SwupHeadPlugin({ awaitAssets: true, persistAssets: false }),
      ],
    });
    swup.hooks.before("content:replace", () => run("destroy"));
    swup.hooks.on("page:view", () => { run("init"); Header.view(false); });
  }

  const boot = () => { Header.init(); run("init"); startSwup(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else setTimeout(boot, 0);
})();
