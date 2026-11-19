// Cross-page motion: Lenis, header text color flipping by section color, split headings, numbered brackets, parallax, drawn lines,
// Menu drawer, erasing and redrawing the hamburger and close lines, cookie bar, footer group dropping in, back to top, subpage header, page transition.
// Like the original, Barba swaps only the body (.tr-container) while the header, menu and cookie bar stay — everything attached to the body is gathered into one mount, reattached and removed on each navigation.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".tr-header");
  const isSP = () => window.matchMedia("(max-width: 767px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Page scripts (index.js · about.js) put a function per namespace in views. The returned function is the teardown on transition
  const TR = (window.TR = { isSP, reduced, lenis: null, opened: sessionStorage.getItem("tr-opened") === "1", views: {} });
  const outside = (sel) => [...document.querySelectorAll(sel)].filter((el) => !el.closest(".tr-container"));

  /* ---------- Text splitting: headings get a clipping frame (.tr-ch) per letter with a core (.tr-ch__in) inside, pill buttons get a span per letter ---------- */
  const split = (el, wrap) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text.trim());
    el.textContent = "";
    for (const c of text) {
      const inner = document.createElement("span");
      inner.className = "tr-ch__in";
      inner.textContent = c;
      inner.setAttribute("aria-hidden", "true");
      if (!wrap) { el.append(inner); continue; }
      const outer = document.createElement("span");
      outer.className = "tr-ch";
      outer.append(inner);
      el.append(outer);
    }
  };
  const roll = (el) => {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    // Original increments transition-delay by 15ms per letter — on hover the letters roll up one after another from the left
    el.innerHTML = [...text].map((c, i) => `<span aria-hidden="true" style="transition-delay: ${i * 15}ms">${c}</span>`).join("");
  };
  outside("[data-split]").forEach((el) => split(el, true));
  document.querySelectorAll(".tr-menu__lists a").forEach((el) => split(el, false));
  outside("[data-roll]").forEach(roll);

  /* ---------- Lenis: original values (duration 1s · expo curve · wheel 0.8). Paused during the first page opening ---------- */
  if (!reduced && window.Lenis) {
    history.scrollRestoration = "manual";
    const lenis = (TR.lenis = new Lenis({
      duration: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 0.8,
      anchors: { offset: 0 },
    }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Menu drawer: black veil 0.6s, big menu text rises from 140% below at 0.0043s intervals, the rest fade in at 0.08s intervals ---------- */
  const menu = document.querySelector(".tr-menu");
  const burger = document.querySelector(".tr-burger");
  const close = document.querySelector(".tr-menu__close");
  const openMenu = () => {
    TR.lenis?.stop();
    gsap.to(menu, { opacity: 1, duration: reduced ? 0 : 0.6, ease: "power2.inOut", overwrite: "auto", onComplete: () => gsap.set(menu, { pointerEvents: "auto" }) });
    if (reduced) return gsap.set(".tr-menu__lists .tr-ch__in, [data-menu='fade']", { y: 0, opacity: 1 });
    gsap.fromTo(".tr-menu__lists .tr-ch__in", { yPercent: 140, y: 0 }, { yPercent: 0, ease: "power2.out", duration: 1, delay: 0.2, stagger: 0.0043 });
    gsap.fromTo("[data-menu='fade']", { opacity: 0 }, { opacity: 1, ease: "power2.out", duration: 1, delay: 0.2, stagger: 0.08 });
  };
  const closeMenu = () => {
    TR.lenis?.start();
    gsap.to(menu, { opacity: 0, duration: reduced ? 0 : 0.4, overwrite: "auto", onComplete: () => gsap.set(menu, { pointerEvents: "none" }) });
  };
  burger?.addEventListener("click", openMenu);
  close?.addEventListener("click", closeMenu);
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* The hamburger lines wipe out to the right then redraw from the left, the close lines wipe out upward then redraw from the top */
  const closeLines = (b) => {
    const p = b.querySelectorAll("path");
    TR.closeLines.to(p, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.3, stagger: 0.06 })
      .set(p, { clipPath: "inset(0% 0% 100% 0%)" })
      .to(p, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.2, stagger: 0.06 });
  };
  if (!reduced && !isSP()) {
    const bt = gsap.timeline();
    burger?.addEventListener("mouseenter", () => {
      bt.to(".tr-burger path", { clipPath: "inset(0% 0% 0% 100%)", duration: 0.2, stagger: 0.03 })
        .set(".tr-burger path", { clipPath: "inset(0% 100% 0% 0%)" })
        .to(".tr-burger path", { clipPath: "inset(0% 0% 0% 0%)", duration: 0.2, stagger: 0.03 });
    });
    TR.closeLines = gsap.timeline();
    close?.addEventListener("mouseenter", () => closeLines(close));
  }

  /* ---------- Cookie bar: on the first page it appears after the opening ends. Like the original, consent is stored in a cookie for 365 days so it does not show next time ---------- */
  const cookie = document.querySelector(".tr-cookie");
  const AGREED = "cookie_consent_site";
  if (cookie && !document.cookie.split(";").some((c) => c.trim().startsWith(`${AGREED}=`))) {
    cookie.classList.add("is-show");
    TR.showCookie = () => gsap.to(cookie, { opacity: 1, duration: 0.4 });
    if (body.dataset.page !== "index") TR.showCookie();
    cookie.querySelector("button").addEventListener("click", () => {
      document.cookie = `${AGREED}=1; max-age=${365 * 24 * 60 * 60}; path=/; SameSite=Lax`;
      gsap.to(cookie, { opacity: 0, duration: 0.3, onComplete: () => cookie.classList.remove("is-show") });
    });
  }

  /* New body enters with 0.5s power2.out. The header is 0.6s on first open, and when arriving from the Brand page it goes 0→1 in 0.5s power2.out like the original enter */
  // A document opened for the first time turns on only the header line in 0.6s like the original once — the body fade only when arriving via Barba
  TR.enter = (box, { withHeader = true, first = false } = {}) => {
    if (!first) gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.5, ease: "power2.out" });
    if (!withHeader) return;
    if (first) gsap.to(header, { opacity: 1, pointerEvents: "auto", duration: reduced ? 0 : 0.6 });
    else gsap.fromTo(header, { opacity: 0 }, { opacity: 1, pointerEvents: "auto", duration: reduced ? 0 : 0.5, ease: "power2.out" });
  };

  // Header text color is read from the skin’s base and ink colors — it switches between the two following the section color
  const tone = (v) => getComputedStyle(root).getPropertyValue(v).trim();

  /* ---------- What hangs on a single body: the gsap.context scope is the body, so text selectors are also found only inside that body ---------- */
  const mount = (box, ns, first) => gsap.context(() => {
    body.dataset.page = ns;
    box.querySelectorAll("[data-split]").forEach((el) => split(el, true));
    box.querySelectorAll("[data-roll]").forEach(roll);

    /* Underline on current page menu */
    header.querySelectorAll("a[data-name]").forEach((a) => {
      const on = a.dataset.name === ns;
      a.classList.toggle("is-current", on);
      on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });

    /* Section color: when a white section’s header touches the top of the screen the header text turns ink black, on a black section it turns white. 
       Switch the fixed bottom-right table of contents when a section enters the bottom of the screen */
    const dark = tone("--kf-ink"), light = tone("--kf-bg");
    const setVar = (name, value) => gsap.to(root, { [name]: value, overwrite: "auto" });
    gsap.set(root, { "--tr-header-color": light, "--tr-fixed-color": dark });
    box.querySelectorAll("[data-color]").forEach((sec) => {
      const ink = sec.dataset.color === "white" ? dark : light;
      const other = ink === dark ? light : dark;
      ScrollTrigger.create({
        trigger: sec, start: "top top",
        onEnter: () => setVar("--tr-header-color", ink),
        onEnterBack: () => setVar("--tr-header-color", ink),
      });
      ScrollTrigger.create({
        trigger: sec, start: "top bottom",
        onEnter: () => setVar("--tr-fixed-color", ink),
        onLeaveBack: () => setVar("--tr-fixed-color", other),
      });
    });

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* Big title: letters go from (60%,150%) into place in circ.out 0.4s · 0.05s apart, once it reaches 94% of the screen */
      box.querySelectorAll('[data-anim="title"]').forEach((t) => {
        const chars = t.querySelectorAll("[data-split] .tr-ch__in");
        if (!chars.length) return;
        gsap.set(chars, { yPercent: 150, xPercent: 60 });
        gsap.to(chars, { yPercent: 0, xPercent: 0, ease: "circ.out", duration: 0.4, stagger: 0.05, scrollTrigger: { trigger: t, start: "top 94%" } });
      });

      /* Number brackets: the number cell width opens from 0 (power4.out 2.2s) and the number rises 0.25s later */
      box.querySelectorAll(".tr-num__number").forEach((n) => {
        if (n.closest(".tr-pagenav")) return;
        const inner = n.querySelector(".tr-num__inner");
        const w = n.scrollWidth;
        gsap.set(n, { width: 0 });
        gsap.set(inner, { yPercent: 150 });
        const tl = gsap.timeline({ paused: true })
          .to(n, { width: w, ease: "power4.out", duration: 2.2 })
          .to(inner, { yPercent: 0, ease: "power2.out", duration: 1.2 }, 0.25);
        ScrollTrigger.create({ trigger: n, start: "top 85%", onEnter: () => tl.play() });
      });

      /* Parallax: the photo moves yPercent 16 inside the frame, and with data-amount the whole frame rises faster (large screens only) */
      box.querySelectorAll(".tr-parallax").forEach((w) => {
        const st = { trigger: w, start: "top bottom", end: "bottom top-=50%", scrub: true };
        gsap.to(w.querySelector(".tr-parallax__inner"), { yPercent: 16, ease: "none", scrollTrigger: st });
        if (w.dataset.amount && !isSP()) gsap.to(w.parentNode, { yPercent: Number(w.dataset.amount), ease: "none", scrollTrigger: { ...st } });
      });

      /* Gray line draws in from the left */
      box.querySelectorAll(".tr-aline").forEach((l) => {
        gsap.fromTo(l, { width: "0%" }, { width: "100%", duration: 1, ease: "power1.inOut", scrollTrigger: { trigger: l, start: "top bottom" } });
      });

      /* Footer group (contact) appears descending from above */
      const fg = box.querySelector(".tr-footer__group");
      if (fg) gsap.fromTo(fg, { yPercent: isSP() ? -10 : -20, opacity: 0 }, {
        yPercent: 0, opacity: 1, ease: "none",
        scrollTrigger: { trigger: box.querySelector(".tr-footer"), start: "top bottom", end: "95% bottom", scrub: true, invalidateOnRefresh: true },
      });

      /* Sub-page header: icon and breadcrumb rise from 10px below, line grows from 0 to 100% */
      const hero = box.querySelector(".tr-hero");
      if (hero) {
        gsap.timeline({ delay: 0.25 })
          .to(".tr-hero__insta", { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" })
          .to(".tr-hero__line", { width: "100%", duration: 1, ease: "power2.inOut" }, "<")
          .to(".tr-hero__crumb", { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }, "<0.3");
        if (hero.dataset.scroll === "true") {
          const st = { trigger: box, start: "4px top", end: "+=1000px", scrub: true };
          gsap.to(".tr-hero__inner", { opacity: 0.1, ease: "none", scrollTrigger: st });
          gsap.to(hero, { y: "100rem", ease: "none", scrollTrigger: { ...st } });
        }
      }
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".tr-hero__insta, .tr-hero__crumb", { y: 0, opacity: 1 });
      gsap.set(".tr-hero__line", { width: "100%" });
    });

    if (!reduced && !isSP()) box.querySelectorAll(".tr-videobody__close").forEach((b) => b.addEventListener("mouseenter", () => closeLines(b)));

    /* ---------- Back to Top ---------- */
    box.querySelector(".tr-footer__top")?.addEventListener("click", () => {
      TR.lenis ? TR.lenis.scrollTo(0, { duration: 0.9 }) : scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });

    const off = TR.views[ns]?.(box, { first });
    if (ns !== "index") TR.enter(box, { first });
    return off;
  }, box);

  /* ---------- Page transition (original Barba values): body and header exit over 0.4s power2.inOut, wait 0.4s, then clear the previous body’s effects,
     Bring the new body in from the top at 0.5s power2.out ---------- */
  const leave = (box) => gsap.to([box, header], { opacity: 0, duration: reduced ? 0 : 0.4, ease: "power2.inOut" });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const start = () => {
    const box = document.querySelector(".tr-container");
    const ns = box.dataset.barbaNamespace || body.dataset.page;
    let ctx = null;
    // The page-transition library fetches the next page and can’t run on file:// — in that case it exits with the same values and then navigates normally
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        transitions: [{
          sync: false,
          once: ({ next }) => { ctx = mount(next.container, next.namespace, true); },
          async leave({ current }) {
            leave(current.container);
            await wait(reduced ? 0 : 400);
            ctx?.revert();
          },
          beforeEnter({ next }) {
            gsap.set(next.container, { opacity: 0 });
            TR.lenis?.scrollTo(0, { immediate: true, force: true });
            scrollTo(0, 0);
          },
          enter({ next }) { ctx = mount(next.container, next.namespace, false); },
        }],
      });
      // Re-measure after the previous body has left (the original also re-measures 25ms after insertion)
      barba.hooks.after(() => ScrollTrigger.refresh());
      return;
    }
    mount(box, ns, true);
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
      const [file, hash] = href.split("#");
      if (file === location.pathname.split("/").pop() && hash) return;
      e.preventDefault();
      if (reduced) return void (location.href = href);
      leave(box);
      setTimeout(() => (location.href = href), 400);
    });
    addEventListener("pageshow", (e) => e.persisted && gsap.set([box, header], { opacity: 1 }));
  };
  // Open after the page script attaches to views — Barba’s once runs in the microtask right after init
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();

  /* Crossing between phone and large screen reloads and recalculates values, as in the original */
  const spQuery = window.matchMedia("(max-width: 767px)");
  if (!("ontouchstart" in root)) spQuery.addEventListener("change", () => location.reload());
})();
