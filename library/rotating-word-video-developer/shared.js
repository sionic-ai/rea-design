// Original is Webflow + barba 2.10.3 (sync) — while the old container fades out over .5s, the new container overlaps on top (fixed) and comes in.
// Page script registers with RH.page(name, { init }Raise it with ), and each time it is handed over, withdraw it and re-attach.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  document.documentElement.classList.add("rh-js");
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  CustomEase.create("premium", "0.22, 1, 0.36, 1");
  CustomEase.create("smooth", "M0,0 C0.38,0.005 0.215,1 1,1");
  gsap.defaults({ ease: "osmo", duration: 0.6 });
  const rq = matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = rq.matches;
  rq.addEventListener?.("change", (e) => (reduced = e.matches));
  const RH = (window.RH = { pages: {}, cleanups: new Set(), get reduced() { return reduced; } });
  RH.page = (name, def) => (RH.pages[name] = def);
  RH.onClean = (fn) => RH.cleanups.add(fn);
  const cleanAll = () => { RH.cleanups.forEach((f) => { try { f(); } catch (e) { console.warn(e); } }); RH.cleanups.clear(); };

  const ARROW = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3.5 8.5l5-5M4.5 3.5h4v4"/></svg>';
  RH.arrow = ARROW;
  const LINKS = [["Home", "index.html", "home"], ["About", "about.html", "about"], ["Works", "works.html", "works"], ["News", "news.html", "news"], ["Careers", "recruit.html", "recruit"], ["Contact", "#", "connect"]];

  const FOOTER = `
<section class="rh-footer rh-section is-dark" data-slot="footer">
  <h2 class="sr-only">Footer</h2>
  <div class="rh-container"><div class="rh-footer__layout">
    <div class="rh-footer__content">
      <a href="index.html" class="rh-footer__logo" aria-label="Home" data-label="Your brand’s English name here"><i></i>Company</a>
      <form class="rh-footer__form" onsubmit="return false">
        <label class="t-label" for="rh-mail">Get News</label>
        <div class="rh-footer__field"><input id="rh-mail" type="email" placeholder="Please Enter Your Email"><button type="submit" aria-label="Send"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 8h11M9 4l4 4-4 4"/></svg></button></div>
        <p class="rh-footer__note t-small">Your two lines here on what the newsletter contains and how often it arrives.</p>
      </form>
    </div>
    <div class="rh-footer__links">
      <div class="rh-footer__group" data-label="Your menu English name, sixth, here"><h3 class="t-label">Menu</h3>${LINKS.map(([t, h]) => `<a data-underline-link href="${h}" class="t-h4">${t}</a>`).join("")}</div>
      <div class="rh-footer__group"><h3 class="t-label">Location</h3><a href="#" class="t-main" style="margin-bottom:var(--sp-8)">Street address 000,<br>Floor 0, Room 000<br>City, postal code</a>
        <h3 class="t-label">Contact info</h3><a data-underline-link href="#" class="rh-link t-main">t. 000.000.0000 ${ARROW}</a><a data-underline-link href="mailto:info@example.com" class="rh-link t-main">info@example.com ${ARROW}</a></div>
      <div class="rh-footer__group"><h3 class="t-label">Portal</h3><a data-underline-link href="#" class="rh-link t-main">Residents ${ARROW}</a><a data-underline-link href="#" class="rh-link t-main">Investor ${ARROW}</a><a data-underline-link href="#" class="rh-link t-main" style="margin-bottom:var(--sp-8)">Staff ${ARROW}</a>
        <h3 class="t-label">Follow</h3><a data-underline-link href="#" class="rh-link t-main">Social ${ARROW}</a><a data-underline-link href="#" class="rh-link t-main">Network ${ARROW}</a><a data-underline-link href="#" class="rh-link t-main">Brand ${ARROW}</a></div>
    </div>
    <div class="rh-footer__visual rh-ph wf-img on-dark" data-label="Brick apartment building exterior · clear daytime · landscape 4:3"></div>
    <div class="rh-footer__legal t-small"><span>© <span data-current-year>2026</span> Company</span><span>Site · <a data-underline-link href="#">Where it’s made</a></span></div>
  </div></div>
</section>`;

  const body = document.body;

  // ── Lenis (original 1.3.17, lerp .165 · wheelMultiplier 1.25) ──
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ lerp: 0.165, wheelMultiplier: 1.25 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  RH.lenis = lenis;

  // ── Two-stage menu (markup stays as is on each page): state is the single [data-nav-status], motion is CSS (width .5s → panel .75s) ──
  const navFor = (root) => {
    const nav = root.querySelector("[data-twostep-nav]");
    if (!nav) return;
    const links = nav.querySelectorAll("[data-mega-link]"), panels = nav.querySelectorAll("[data-mega-panel]");
    const toggleBtn = nav.querySelector('[data-nav-toggle="toggle"]');
    const pick = (k) => { links.forEach((l) => l.classList.toggle("is-active", l.dataset.megaLink === k)); panels.forEach((p) => p.classList.toggle("is-active", p.dataset.megaPanel === k)); };
    const isOpen = () => nav.getAttribute("data-nav-status") === "active";
    // Links inside a closed panel can’t be pressed or focused (inert) — released only on open
    const panel = nav.querySelector(".rh-nav__bottom");
    panel?.setAttribute("inert", "");
    const open = () => { panel?.removeAttribute("inert"); nav.setAttribute("data-nav-status", "active"); toggleBtn.setAttribute("aria-expanded", "true"); lenis?.stop(); pick(links[0]?.dataset.megaLink); };
    const close = () => { panel?.setAttribute("inert", ""); nav.setAttribute("data-nav-status", "not-active"); toggleBtn.setAttribute("aria-expanded", "false"); lenis?.start(); };
    RH.navClose = close;
    nav.querySelectorAll('[data-nav-toggle="toggle"]').forEach((b) => b.addEventListener("click", () => (isOpen() ? close() : open())));
    nav.querySelectorAll('[data-nav-toggle="close"]').forEach((b) => b.addEventListener("click", close));
    const esc = (e) => { if (e.key === "Escape" && isOpen()) close(); };
    document.addEventListener("keydown", esc);
    RH.onClean(() => document.removeEventListener("keydown", esc));
    links.forEach((l) => l.addEventListener("mouseenter", () => pick(l.dataset.megaLink)));
    const here = root.dataset.barbaNamespace;
    links.forEach((l) => { const on = l.dataset.megaLink === here; l.toggleAttribute("aria-current", on); l.classList.toggle("is-current", on); });
  };

  // ── Shared in-page motion ──
  // Appear: when it reaches 80% of the screen, .8s "smooth" Becomes opaque at (data-fade-trigger="load" Right side)
  const fades = (root) => root.querySelectorAll("[data-fade]").forEach((el) => {
    const v = { opacity: 1, duration: parseFloat(el.dataset.fadeDuration) || 0.8, delay: parseFloat(el.dataset.fadeDelay) || 0, ease: "smooth" };
    (el.dataset.fadeTrigger || "scroll") === "load" ? gsap.to(el, v) : gsap.to(el, { ...v, scrollTrigger: { trigger: el, start: "clamp(top 80%)", once: true } });
  });
  // Heading lines: rise 110% from below inside the mask over 1.1s (.11 stagger, premium)
  const SPLIT = { lines: { duration: 1.1, stagger: 0.11 }, words: { duration: 0.9, stagger: 0.09 }, chars: { duration: 0.7, stagger: 0.018 } };
  const splits = (root) => root.querySelectorAll('[data-split="heading"]').forEach((el) => {
    const kind = el.dataset.splitReveal || "lines";
    gsap.set(el, { visibility: "visible" });
    if (el.dataset.splitTrigger !== "scroll") return;
    const types = kind === "lines" ? ["lines"] : kind === "words" ? ["lines", "words"] : ["lines", "words", "chars"];
    SplitText.create(el, { type: types.join(", "), mask: "lines", autoSplit: true, linesClass: "line", wordsClass: "word", charsClass: "letter",
      onSplit: (s) => gsap.from(s[kind], { yPercent: 110, ...SPLIT[kind], ease: "premium", scrollTrigger: { trigger: el, start: "clamp(top 90%)", once: true } }) });
  });
  // Parallax: [data-parallax=trigger] moves the target inside it from start% → end% (scrub)
  const parallax = (root) => {
    const mm = gsap.matchMedia();
    mm.add({ isMobile: "(max-width:479px)", isMobileLandscape: "(max-width:767px)", isTablet: "(max-width:991px)", isDesktop: "(min-width:992px)" }, (c) => {
      const { isMobile, isMobileLandscape, isTablet } = c.conditions;
      root.querySelectorAll('[data-parallax="trigger"]').forEach((t) => {
        const off = t.getAttribute("data-parallax-disable");
        if ((off === "mobile" && isMobile) || (off === "mobileLandscape" && isMobileLandscape) || (off === "tablet" && isTablet)) return;
        const target = t.querySelector('[data-parallax="target"]') || t;
        const prop = t.getAttribute("data-parallax-direction") === "horizontal" ? "xPercent" : "yPercent";
        const sc = t.getAttribute("data-parallax-scrub"), scrub = sc ? parseFloat(sc) : true;
        const from = t.hasAttribute("data-parallax-start") ? parseFloat(t.getAttribute("data-parallax-start")) : 20;
        const to = t.hasAttribute("data-parallax-end") ? parseFloat(t.getAttribute("data-parallax-end")) : -20;
        gsap.fromTo(target, { [prop]: from }, { [prop]: to, ease: "none", scrollTrigger: { trigger: t, start: `clamp(${t.getAttribute("data-parallax-scroll-start") || "top bottom"})`, end: `clamp(${t.getAttribute("data-parallax-scroll-end") || "bottom top"})`, scrub } });
      });
    });
    RH.onClean(() => mm.revert());
  };
  // Staggered line reveal: in the order they enter the screen, from 4em below at .075s intervals (1.2s, opacity power1.out · position expo.out)
  const queued = (root) => {
    const q = []; let busy = false;
    const show = (el) => { gsap.to(el, { autoAlpha: 1, duration: 1.2, ease: "power1.out", clearProps: "opacity,visibility" }); gsap.to(el, { y: "0em", duration: 1.2, ease: "expo.out", clearProps: "transform" }); };
    const next = () => { const el = q.shift(); if (el) { show(el); gsap.delayedCall(0.075, next); } else busy = false; };
    root.querySelectorAll("[data-queued-reveal-group]").forEach((g) => {
      const items = g.hasAttribute("data-queued-reveal-children") ? [...g.children] : [...g.querySelectorAll("[data-queued-reveal-item]")];
      items.forEach((el) => {
        if (el.getBoundingClientRect().bottom <= 0) return;
        if (reduced) return;
        gsap.set(el, { autoAlpha: 0, y: "4em" });
        ScrollTrigger.create({ trigger: el, start: "top 100%", once: true, onEnter: () => { q.push(el); if (q.length > 12) show(q.shift()); if (!busy) { busy = true; gsap.delayedCall(0.1, next); } } });
      });
    });
  };
  const counts = (root) => root.querySelectorAll("[data-count-wrap]").forEach((w) => { const t = w.querySelector("[data-count-total]"); if (t) t.textContent = w.querySelectorAll("[data-count-item]").length; });
  const years = (root) => root.querySelectorAll("[data-current-year]").forEach((e) => (e.textContent = new Date().getFullYear()));
  // Filtering: rows that go away blur out over .6s with transition-out and are removed at 300ms
  RH.filter = (root) => root.querySelectorAll("[data-filter-group]").forEach((g) => {
    const btns = [...g.querySelectorAll("[data-filter-target]")], items = [...g.querySelectorAll("[data-filter-name]")];
    if (!btns.length) return;
    const set = (el, on) => { el.setAttribute("data-filter-status", on ? "active" : "not-active"); el.setAttribute("aria-hidden", on ? "false" : "true"); };
    const apply = (name) => {
      items.forEach((el) => {
        clearTimeout(el._ft);
        const keep = name === "all" || el.getAttribute("data-filter-name").split(/\s+/).includes(name);
        if (el.getAttribute("data-filter-status") === "active") el.setAttribute("data-filter-status", "transition-out");
        el._ft = setTimeout(() => set(el, keep), 300);
      });
      btns.forEach((b) => { const on = b.dataset.filterTarget === name; b.setAttribute("data-filter-status", on ? "active" : "not-active"); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    };
    btns.forEach((b) => b.addEventListener("click", () => { if (b.getAttribute("data-filter-status") !== "active") apply(b.dataset.filterTarget); }));
    RH.onClean(() => items.forEach((el) => clearTimeout(el._ft)));
  });

  let current = null;
  const mount = (root) => {
    const def = RH.pages[root.dataset.barbaNamespace] || {};
    const foot = root.querySelector('[data-slot="footer"]');
    if (foot && !foot.firstElementChild) foot.outerHTML = FOOTER;
    navFor(root);
    body.dataset.pageTheme = root.dataset.pageTheme || "light";
    const ctx = gsap.context(() => {
      counts(root); years(root); splits(root); fades(root); parallax(root); queued(root); RH.filter(root);
      const off = def.init?.(root);
      if (typeof off === "function") RH.onClean(off);
    }, root);
    current = { ctx, root };
    return def;
  };
  const unmount = () => { if (!current) return; cleanAll(); current.ctx.revert(); current = null; };

  // ── Entrance (original runPageOnce*/runPageEnter*) ── the type comes from the name tag kind: home · about (hero photo 1.1→1 + title 14%) · plain (title 25%)
  const enterTl = (root, first) => {
    const kind = (RH.pages[root.dataset.barbaNamespace] || {}).kind || "plain";
    const tl = gsap.timeline({ defaults: { ease: "premium" } });
    if (reduced) { tl.set(root, { autoAlpha: 1 }); root.querySelectorAll("[data-about-description]").forEach((e) => (e.style.visibility = "visible")); return tl; }
    if (kind === "plain") {
      if (first) return tl.set(root, { autoAlpha: 1 });
      return tl.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, ease: "power1.inOut", duration: 0.75 }, 0)
        .fromTo(root.querySelector("h1"), { yPercent: 25, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, ease: "expo.out", duration: 1 }, "< 0.3");
    }
    tl.add("startEnter", 0).fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, ease: "power1.inOut", duration: 1.2 }, "startEnter");
    if (kind === "home") {
      if (first) tl.fromTo(root.querySelector("[data-twostep-nav]"), { yPercent: 5, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.5 }, "startEnter+=0.1");
      tl.fromTo(root.querySelector("[data-rotating-title]"), { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.8 }, first ? "startEnter+=0.4" : "startEnter+=0.1");
      return tl;
    }
    tl.fromTo(root.querySelectorAll("[data-header-visual], [data-about-visual]"), { scale: 1.1, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.8 }, "startEnter+=0.1")
      .fromTo(root.querySelector("h1"), { yPercent: 14, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.5 }, "startEnter+=0.4");
    const desc = root.querySelectorAll("[data-about-description]");
    if (desc.length) {
      gsap.set(desc, { visibility: "visible" });
      const s = SplitText.create(desc, { type: "lines", mask: "lines", linesClass: "line" });
      tl.from(s.lines, { yPercent: 110, autoAlpha: 0, duration: 1.3, stagger: 0.11, ease: "premium", onComplete: () => s.revert() }, "<0.3");
    }
    return tl;
  };
  const resetPage = (root) => { scrollTo(0, 0); gsap.set(root, { clearProps: "position,top,left,right" }); lenis?.resize(); lenis?.start(); };

  const KEY = "rh-trans";
  const local = (href) => { try { const u = new URL(href, location.href); return u.origin === location.origin && /\.html$/.test(u.pathname) ? u : null; } catch { return null; } };
  const plainNav = () => {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.closest(".wf-ui")) return;
      const u = local(a.getAttribute("href"));
      if (!u || u.pathname === location.pathname) return;
      e.preventDefault();
      RH.navClose?.();
      const root = document.querySelector('[data-barba="container"]');
      gsap.to(root, { autoAlpha: 0, ease: "power1.in", duration: reduced ? 0 : 0.5, onComplete: () => { sessionStorage.setItem(KEY, "1"); location.href = a.getAttribute("href"); } });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) gsap.set('[data-barba="container"]', { autoAlpha: 1 }); });
  };
  const bring = async (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const loaded = [...document.querySelectorAll("script[src]")].map((s) => s.src);
    for (const s of doc.querySelectorAll("script[src]")) {
      const src = new URL(s.getAttribute("src"), location.href).href;
      if (loaded.includes(src)) continue;
      await new Promise((r) => body.append(Object.assign(document.createElement("script"), { src, onload: r, onerror: r })));
    }
    const want = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    await Promise.all(want.filter((h) => !have.some((l) => l.href === h)).map((href) => new Promise((r) => { document.head.append(Object.assign(document.createElement("link"), { rel: "stylesheet", href, onload: r, onerror: r })); setTimeout(r, 800); })));
    return () => have.forEach((l) => want.includes(l.href) || l.remove());
  };

  const start = () => {
    history.scrollRestoration = "manual";
    const first = document.querySelector('[data-barba="container"]');
    const arriving = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if ((RH.pages[first.dataset.barbaNamespace] || {}).kind !== "plain" || arriving) gsap.set(first, { autoAlpha: 0 });
    mount(first);
    ScrollTrigger.refresh();
    const tl = arriving ? enterTl(first, false) : enterTl(first, true);
    tl.call(() => resetPage(first));
    if (!window.barba || !/^https?:$/.test(location.protocol)) return plainNav();
    let tidy = null;
    barba.hooks.beforeEnter(({ next }) => { gsap.set(next.container, { position: "fixed", top: 0, left: 0, right: 0 }); lenis?.stop(); });
    barba.hooks.afterLeave(() => ScrollTrigger.getAll().forEach((t) => t.kill()));
    barba.init({
      debug: false, timeout: 7000, preventRunning: true,
      prevent: ({ el }) => !!(el && (el.closest(".wf-ui") || el.target === "_blank" || !local(el.getAttribute("href") || "") || (el.getAttribute("href") || "").startsWith("#"))),
      transitions: [{
        name: "default", sync: true,
        async leave({ current: c }) { RH.navClose?.(); return gsap.timeline({ onComplete: () => c.container.remove() }).to(c.container, { autoAlpha: 0, ease: "power1.in", duration: reduced ? 0 : 0.5 }, 0); },
        async beforeEnter({ next }) { tidy = await bring(next.html); unmount(); mount(next.container); },
        async enter({ next }) { const tl = enterTl(next.container, false); await new Promise((r) => tl.add(() => r(), reduced ? 0 : 0.7)); resetPage(next.container); tidy?.(); ScrollTrigger.refresh(); },
      }],
    });
  };
  const boot = () => requestAnimationFrame(start);
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
})();
