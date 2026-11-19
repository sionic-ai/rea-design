// Shared by all pages: header, menu, footer, blurred photo stage and transition loader are drawn once at the start, and motion is attached and detached each time the body (barba container) changes.
// Original values: Lenis 1.1.18 duration .6 · expo(-12) curve · reveal top 90% 1.5s power4.out · lines 1.2s stagger .2 sine.out ·
// Fade over .8s from stage top 50% to bottom 50% · header shrinks after half a screen ·
// Page transition barba 2.10.3 (sync false · prefetch) — on leave, kill all ScrollTriggers after 50ms, new body · footer fade 0→1 in 1.2s power3.out (jump to top after 100ms), loader .8s after 1s
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create("sbOut", "M0,0 C0.25,1 0.5,1 1,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const html = document.documentElement;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => html.classList.add("is-dom"));
  else html.classList.add("is-dom");
  const PAGES = window.SBP || {};
  const SB = (window.SB = { reduced, lenis: null });

  let uid = 0;
  const logo = () => {
    const id = `sb-arc-${uid++}`;
    return `<svg viewBox="0 0 90 52" aria-hidden="true"><path id="${id}" d="M5 33 Q45 3 85 33" fill="none"/><text class="sb-logo__word" text-anchor="middle"><textPath href="#${id}" startOffset="50%">LOGO</textPath></text><rect x="27" y="37" width="36" height="12" rx="6" fill="none" stroke="currentColor" stroke-width="1.6"/><text class="sb-logo__sub" x="45" y="46" text-anchor="middle">Co.</text></svg>`;
  };
  const icon = {
    mail: '<svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="4.5" width="18" height="13" rx="1"/><path d="m2.5 5.5 8.5 7 8.5-7"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3.5 9h17M3.5 15h17"/></svg>',
    up: '<svg viewBox="0 0 210 210" fill="none" stroke="currentColor" stroke-width="7"><path d="M40 170 170 40M70 40h100v100"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".8" fill="currentColor"/></svg>',
    page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 3h-2a4 4 0 0 0-4 4v3H5.5v3.5H8V21h3.5v-7.5H15l.5-3.5h-4V7.5c0-.6.4-1 1-1H15z"/></svg>',
    arr: '<svg class="sb-arr" viewBox="0 0 27 27" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="13.5" cy="13.5" r="12.5"/><path d="M10 17l7-7M11.5 10H17v5.5"/></svg>',
  };

  const NAV = [
    ["about", "about.html", "About"],
    ["service", "service.html", "Service"],
    ["values", "index.html#values", "Values"],
    ["people", "index.html#people", "People"],
    ["recruit", "recruit.html", "Recruit"],
    ["news", "news.html", "News"],
  ];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "sb-head";
    head.innerHTML = `
      <div class="sb-head__in">
        <a class="sb-logo" href="index.html" aria-label="Home">${logo()}</a>
        <div class="sb-lang">${icon.globe}<a href="#">EN</a>|<a class="is-on" href="#">KO</a></div>
        <nav class="sb-nav" aria-label="Main menu">
          <div class="sb-nav__list">${NAV.map(([k, h, t]) => `<a class="sb-nav__item" data-nav="${k}" href="${h}">${t}</a>`).join("")}</div>
          <a class="sb-mail" href="#contact" aria-label="Inquiry">${icon.mail}</a>
        </nav>
        <button class="sb-burger" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button>
      </div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="sb-menu" data-slot="menu-drawer" aria-hidden="true">
        <div class="sb-menu__in">
          <nav class="sb-menu__nav">${NAV.map(([, h, t]) => `<a href="${h}">${t}</a>`).join("")}</nav>
          <div class="sb-foot__sns">
            <a class="sb-sns" href="#">${icon.camera}<b>SNS 1</b><em>@account</em>${icon.arr}</a>
            <a class="sb-sns" href="#">${icon.page}<b>SNS 2</b><em>@account</em>${icon.arr}</a>
          </div>
        </div>
      </div>`,
    );
  }
  const setCurrent = (ns) => document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("is-current", a.dataset.nav === ns));

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "sb-foot";
    foot.id = "contact";
    foot.innerHTML = `
      <p class="sb-foot__cta"><a class="sb-foot__ctaLink" href="#"><span class="sb-foot__ctaLabel">Get in touch</span><span class="sb-foot__ctaArrow">${icon.up}</span></a></p>
      <div class="sb-foot__mid">
        <div class="sb-wrap sb-foot__midIn">
          <div class="sb-foot__info">
            <a class="sb-foot__logo" href="index.html"><span class="sb-logo">${logo()}</span><span>Your one-line slogan here.</span></a>
            <address class="sb-foot__addr">HQ name<br>Address here, one line 00-00 · 000-0000<br>TEL. 000-000-0000 / FAX. 000-000-0000<br>Office Name<br>Address here, one line 00-00 · 000-0000<br>Affiliate Name<br>Address here, one line 00-00 · 000-0000<br>TEL. 000-000-0000 / FAX. 000-000-0000</address>
          </div>
          <nav class="sb-foot__nav" aria-label="Footer Menu">${NAV.map(([, h, t]) => `<a class="sb-foot__navItem" href="${h}">${t}</a>`).join("")}</nav>
          <div class="sb-foot__sns">
            <a class="sb-sns" href="#">${icon.camera}<b>SNS 1</b><em>@account</em>${icon.arr}</a>
            <a class="sb-sns" href="#">${icon.page}<b>SNS 2</b><em>@account</em>${icon.arr}</a>
          </div>
        </div>
      </div>
      <div class="sb-foot__bottom"><div class="sb-wrap sb-foot__bottomIn"><small>© 0000 NAME Inc.</small><a class="sb-foot__privacy" href="#">Privacy policy</a></div></div>`;
  }
  const main = document.querySelector(".sb-main");

  // Faded denim stage and transition loader — section is data-bg="pic" Attach it and it spreads flat
  document.body.insertAdjacentHTML(
    "afterbegin",
    '<div class="sb-stage" aria-hidden="true" data-label="Blurred denim fabric close-up · dark navy · fixed background"></div><div class="sb-trans" aria-hidden="true"><i></i></div>',
  );
  const stage = document.querySelector(".sb-stage");
  const trans = document.querySelector(".sb-trans");

  // The original reloads the page when crossing the 560px boundary
  const narrowAtLoad = innerWidth <= 560;
  addEventListener("resize", () => (innerWidth <= 560) !== narrowAtLoad && location.reload());

  // ── Smooth scroll — like the original, Lenis runs on its own requestAnimationFrame ──
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 0.6, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -12 * t)), touchMultiplier: 2 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    SB.lenis = lenis;
  }
  const jump = (y) => (SB.lenis ? SB.lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y));
  const scrollToEl = (el) => {
    const y = el.getBoundingClientRect().top + scrollY - (head ? head.offsetHeight : 0) - 32;
    if (SB.lenis) SB.lenis.scrollTo(y, { duration: 0.8, easing: (t) => 1 - Math.pow(1 - t, 5) });
    else scrollTo(0, y);
  };
  const samePageHash = (a) => a.pathname === location.pathname && a.hash;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !(a.getAttribute("href").startsWith("#") || samePageHash(a)) || a.hash.length < 2) return;
    const el = document.querySelector(a.hash);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el);
  });

  // ── Header: shrinks behind a half screen ──
  if (head) {
    const onScroll = () => head.toggleAttribute("data-scroll", scrollY > innerHeight * 0.5);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  // ── Menu Drawer ──
  const menu = document.querySelector(".sb-menu");
  const burger = document.querySelector(".sb-burger");
  let menuTl = null;
  function openMenu() {
    menuTl?.kill();
    document.body.classList.add("is-menu-open");
    menu.setAttribute("aria-hidden", "false");
    SB.lenis?.stop();
    menuTl = gsap.timeline().set(menu, { display: "block", opacity: 0 }).to(menu, { opacity: 1, duration: 0.6 });
  }
  function closeMenu() {
    if (!menu || !document.body.classList.contains("is-menu-open")) return Promise.resolve();
    menuTl?.kill();
    document.body.classList.remove("is-menu-open");
    menu.setAttribute("aria-hidden", "true");
    SB.lenis?.start();
    menuTl = gsap.timeline().to(menu, { opacity: 0, duration: 0.6 }).set(menu, { display: "none" });
    return menuTl.then();
  }
  burger?.addEventListener("click", () => (document.body.classList.contains("is-menu-open") ? closeMenu() : openMenu()));
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  // ── What attaches to a single body — removed whole when leaving ──
  let view = null;
  function mount(container) {
    const ns = container.dataset.barbaNamespace;
    document.body.dataset.page = ns;
    setCurrent(ns);
    container.querySelectorAll(".sb-lines:empty").forEach((el) => (el.innerHTML = "<i></i><i></i><i></i><i></i>"));
    document.body.dataset.bg = "false";

    let off = null;
    const ctx = gsap.context(() => {
      if (head) {
        container.querySelectorAll("[data-header-color]").forEach((sec) => {
          ScrollTrigger.create({
            trigger: sec, start: "top 50%", end: "bottom 50%",
            onToggle: (st) => (st.isActive ? head.setAttribute("data-color", sec.dataset.headerColor) : head.removeAttribute("data-color")),
          });
        });
        if (foot) ScrollTrigger.create({ trigger: foot, start: "top 10%", end: "bottom top", onToggle: (st) => head.toggleAttribute("data-hide", st.isActive) });
      }

      container.querySelectorAll('[data-bg="pic"]').forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec, start: "top 50%", end: "bottom 50%",
          onToggle: (st) => {
            gsap.to(stage, { opacity: st.isActive ? 1 : 0, duration: reduced ? 0 : 0.8 });
            document.body.dataset.bg = String(st.isActive);
          },
        });
      });

      // Like the original, when an accordion opens or closes call only ScrollTrigger.update (refresh would lag by one frame)
      container.querySelectorAll("details").forEach((d) => d.addEventListener("toggle", () => ScrollTrigger.update()));
      container.querySelectorAll("[data-toggle]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("aria-controls");
          const panel = document.getElementById(id);
          const open = btn.getAttribute("aria-expanded") !== "true";
          container.querySelectorAll(`[aria-controls="${id}"]`).forEach((b) => {
            b.setAttribute("aria-expanded", String(open));
            b.classList.toggle("is-open", open);
          });
          if (panel) panel.hidden = !open;
          ScrollTrigger.refresh();
        });
      });

      if (reduced) return;
      const $$ = (sel) => gsap.utils.toArray(container.querySelectorAll(sel));
      const once = (el, fn, start = "top 90%") => ScrollTrigger.create({ trigger: el, start, once: true, onEnter: fn });
      const shut = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
      const full = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

      $$('[data-inview="up"]').forEach((el) => {
        gsap.set(el, { opacity: 0, y: 50 });
        once(el, () => gsap.to(el, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out" }));
      });
      $$('[data-inview="each"]').forEach((el) => {
        const kids = el.querySelectorAll("[data-each]");
        gsap.set(kids, { opacity: 0, y: 50 });
        once(el, () => gsap.to(kids, { opacity: 1, y: 0, duration: 1.5, stagger: 0.1, ease: "power4.out" }));
      });
      $$('[data-inview="pic"]').forEach((el) => {
        gsap.set(el, { opacity: 0, clipPath: shut });
        once(el, () => gsap.to(el, { opacity: 1, clipPath: full, duration: 1.5, ease: "power4.out", clearProps: "clipPath" }));
      });
      $$('[data-inview="pics"]').forEach((el) => {
        const kids = el.querySelectorAll("[data-each]");
        gsap.set(kids, { opacity: 0, clipPath: shut });
        once(el, () => gsap.to(kids, { opacity: 1, clipPath: full, duration: 1.5, stagger: 0.1, ease: "power4.out", clearProps: "clipPath" }));
      });
      $$('[data-inview="line"]').forEach((el) => {
        const lines = el.querySelectorAll(".sb-line > span");
        gsap.set(lines, { opacity: 0, yPercent: 100 });
        once(el, () => gsap.to(lines, { opacity: 1, yPercent: 0, duration: 1.2, stagger: 0.2, ease: "sine.out" }));
      });
      $$('[data-inview="heading"]').forEach((el) => {
        const split = new SplitText(el, { type: "chars" });
        gsap.set(split.chars, { opacity: 0, x: 20 });
        once(el, () => gsap.to(split.chars, { opacity: 1, x: 0, duration: 0.8, stagger: 0.02, ease: "sine.out" }));
      });
      $$('[data-inview="heading2"]').forEach((el) => {
        const lines = el.querySelectorAll("[data-heading-line]");
        const split = new SplitText(lines, { type: "chars" });
        gsap.set(split.chars, { opacity: 0 });
        gsap.set(lines, { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" });
        once(el, () =>
          gsap.timeline()
            .to(lines, { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", duration: 0.5, stagger: 0.05, ease: "sine.out" })
            .to(split.chars, { opacity: 1, duration: 0.8, stagger: 0.02 }, "-=0.4"),
        );
      });

      // Square window — a photo that opens from the central 25% square to the full screen (top 75% ~ top 20% scrub)
      $$("[data-why-pic]").forEach((el) => {
        gsap.fromTo(el,
          { clipPath: "polygon(25% 25%, 75% 25%, 75% 75%, 25% 75%)", opacity: 0 },
          { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", opacity: 1, ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top 75%", end: "top 20%", scrub: true } });
      });

      // Photo parallax — frame ±move%, inner ±move×.25%, inner zoom 1+|move|×.01 (inner only if data-only-inner)
      $$("[data-move]").forEach((el) => {
        const m = Number(el.dataset.move);
        const inner = el.querySelector(".sb-pic__in") || el;
        const st = { trigger: el, start: "top bottom", end: "bottom top", scrub: true };
        gsap.set(inner, { scale: 1 + Math.abs(m) * 0.01 });
        if (el.dataset.onlyInner !== "true") gsap.fromTo(el, { yPercent: -m }, { yPercent: m, ease: "none", scrollTrigger: st });
        if (inner !== el) gsap.fromTo(inner, { yPercent: m * -0.25 }, { yPercent: m * 0.25, ease: "none", scrollTrigger: st });
      });
    });
    // Page-specific motion is also put in the same context and removed together on leaving
    ctx.add(() => { off = PAGES[ns]?.(container, SB) || null; });
    view = { ctx, off };
  }
  function unmount() {
    if (!view) return;
    view.off?.();
    view.ctx.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    view = null;
    gsap.set(stage, { opacity: 0 });
    document.body.dataset.bg = "false";
    head?.removeAttribute("data-color");
    head?.removeAttribute("data-hide");
  }

  // ── Transition loader — after leaving, it is called again every 1s to appear (original setInterval) ──
  let loaderTimer = 0;
  const loader = (on) => {
    clearInterval(loaderTimer);
    if (on) loaderTimer = setInterval(() => gsap.to(trans, { autoAlpha: 1, y: 0, ease: "power3.out", duration: 0.8 }), 1000);
    else gsap.to(trans, { autoAlpha: 0, y: -16, ease: "power3.out", duration: 0.8 });
  };

  // ── Page transition — barba only runs on http (file:// does a normal navigation) ──
  const startBarba = () => {
    if (!window.barba || !/^https?:$/.test(location.protocol)) return;
    const backStack = [];
    const fwdStack = [];
    let popstate = false;
    addEventListener("popstate", () => (popstate = true));
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.init({
      debug: false,
      preventRunning: true,
      timeout: 10000,
      prevent: ({ el }) => {
        const h = el.getAttribute("href") || "";
        return el.classList.contains("nobarba") || !/^[\w-]+\.html(#[\w-]*)?$/.test(h) || samePageHash(el);
      },
      transitions: [{
        sync: false,
        beforeLeave({ trigger }) {
          html.classList.add("is_transition");
          if (history.scrollRestoration) history.scrollRestoration = "manual";
          (trigger === "back" ? fwdStack : backStack).push(scrollY);
        },
        async leave() {
          await closeMenu();
          loader(true);
          await new Promise((r) => setTimeout(() => { ScrollTrigger.refresh(); r(); }, 50));
          unmount();
        },
        enter({ next, trigger }) {
          loader(false);
          const back = popstate;
          popstate = false;
          const pos = back ? (trigger === "back" ? backStack.pop() : trigger === "forward" ? fwdStack.pop() : 0) ?? 0 : null;
          const target = next.url.hash && document.getElementById(next.url.hash);
          gsap.timeline({
            onStart() {
              setTimeout(() => {
                if (pos !== null) jump(pos);
                else if (target) jump(target.getBoundingClientRect().top + scrollY - 150);
                else jump(0);
              }, 100);
            },
            onComplete() { setTimeout(() => ScrollTrigger.refresh(), 100); },
          }).fromTo([main, foot].filter(Boolean), { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 1.2, ease: "power3.out" });
        },
        after({ next }) {
          mount(next.container);
          html.classList.remove("is_transition");
        },
      }],
    });
  };

  const boot = () => {
    mount(document.querySelector('[data-barba="container"]'));
    startBarba();
    addEventListener("load", () => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
