// Shared by every section — Lenis (lerp .11), Barba transitions (loader, dropping into the card stack, swiping between details sideways), underlay menu, footer.
// Each section’s motion is in KK.page("<Name>", fn) registered this way, and Barba calls it when that section container enters and clears it when it leaves.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
  CustomEase.create("osmo", "0.625, 0.05, 0, 1");
  gsap.defaults({ ease: "osmo", duration: 0.6 });
  history.scrollRestoration = "manual";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 767px)");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const pages = {};
  const KK = (window.KK = { lenis, reduce, page: (name, fn) => { pages[name] = fn; }, go: (href, el) => (KK.barba ? barba.go(href, el) : location.assign(href)) });

  // Line reveal — SplitText lines sit 115% down inside a mask, then rise (original 1.05s osmo)
  KK.lines = (els, { stagger = 0.075 } = {}) => {
    els = els.filter(Boolean);
    if (!els.length) return null;
    if (reduce) { gsap.set(els, { autoAlpha: 1 }); return { addTo() {}, play() {}, revert() {} }; }
    const splits = els.map((el) => new SplitText(el, { type: "lines", mask: "lines", linesClass: "kk-split-line" }));
    const lines = splits.flatMap((s) => s.lines);
    gsap.set(els, { autoAlpha: 1 });
    gsap.set(lines, { autoAlpha: 0, yPercent: 115 });
    const to = { autoAlpha: 1, yPercent: 0, duration: 1.05, ease: "osmo", stagger };
    return {
      addTo: (tl, at) => tl.to(lines, to, at),
      play: () => gsap.to(lines, to),
      revert: () => { gsap.killTweensOf(lines); splits.forEach((s) => s.revert()); },
    };
  };

  // ───── Head blur ─────
  const blur = $(".kk-blur");
  const blurTo = (v, d, e) => blur && (reduce ? gsap.set(blur, { "--blur-reveal": v }) : gsap.to(blur, { "--blur-reveal": v, duration: d, ease: e, overwrite: "auto" }));

  // ───── Underlay menu ─────
  const menu = (() => {
    const toggle = $("[data-menu-toggle]"), panel = $(".kk-menu"), main = $("[data-main]"), overlay = $(".kk-overlay");
    if (!toggle || !panel || !main || !overlay) return { close: () => Promise.resolve() };
    const bars = $$(".kk-toggle__bar"), big = $$("[data-reveal-l]"), small = $$("[data-reveal-s]"), line = $(".kk-menu__line");
    const dark = $(".kk-overlay__dark"), corners = $$(".kk-overlay__corner"), rows = $$(".kk-overlay__row");
    let open = false, leaving = false;
    addEventListener("kk:leave", () => { leaving = true; });
    addEventListener("kk:ready", () => { leaving = false; });
    const shift = () => -panel.offsetWidth;
    gsap.set(overlay, { visibility: "hidden", pointerEvents: "none" });
    gsap.set(dark, { autoAlpha: 0 });
    gsap.set(line, { scaleX: 0 });
    gsap.set(rows[0], { yPercent: -100 });
    gsap.set(rows[1], { yPercent: 100 });
    gsap.set(corners, { scale: 0 });
    gsap.set(big, { autoAlpha: 0, xPercent: 25 });
    gsap.set(small, { autoAlpha: 0, yPercent: 100 });
    const closed = () => { if (!open) { document.body.dataset.menuStatus = ""; dispatchEvent(new Event("kk:menu-closed")); } };
    const tl = gsap.timeline({ paused: true, defaults: { ease: "osmo" }, onReverseComplete: () => { gsap.set(main, { clearProps: "transform" }); if (!leaving) blurTo(1, 0.45, "power2.out"); closed(); } });
    tl.set(overlay, { visibility: "visible", pointerEvents: "auto" }, 0)
      .to([main, overlay], { x: shift, duration: 0.7 }, 0)
      .to(dark, { autoAlpha: 1, duration: 0.5 }, 0)
      .to(corners, { scale: 1, duration: 0.5 }, 0)
      .to(rows, { yPercent: 0, duration: 0.5 }, 0)
      .to(bars[0], { y: "0.25em", rotation: 45, duration: 0.35, ease: "back.out(1.4)" }, 0.05)
      .to(bars[1], { y: "-0.25em", rotation: -45, duration: 0.35, ease: "back.out(1.4)" }, 0.05)
      .fromTo(big, { autoAlpha: 0, xPercent: 25 }, { autoAlpha: 1, xPercent: 0, duration: 0.7, stagger: 0.05 }, 0)
      .fromTo(small, { autoAlpha: 0, yPercent: 100 }, { autoAlpha: 1, yPercent: 0, duration: 0.5, stagger: 0.03, ease: "power3.out" }, 0.3)
      .to(line, { scaleX: 1, duration: 0.5 }, "<");
    const openEnd = tl.duration();
    tl.addPause().addLabel("closeStart")
      .to([...big, ...small], { autoAlpha: 0, duration: 0.3 }, "closeStart")
      .to([main, overlay], { x: 0, duration: 0.6 }, "closeStart")
      .to(dark, { autoAlpha: 0, duration: 0.35, ease: "power2.inOut" }, "<")
      .to(corners, { scale: 0, duration: 0.5 }, "<")
      .to(rows[0], { yPercent: -100, duration: 0.5 }, "<")
      .to(rows[1], { yPercent: 100, duration: 0.5 }, "<")
      .to(bars, { y: 0, rotation: 0, duration: 0.25, ease: "power3.in" }, "<")
      .set(overlay, { visibility: "hidden", pointerEvents: "none" })
      .set(main, { clearProps: "transform" })
      .call(closed)
      .call(() => { if (!leaving) blurTo(1, 0.45, "power2.out"); });
    const flip = () => {
      if (!open && document.body.dataset.pageTransition === "active") return;
      open = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      document.body.dataset.menuStatus = open ? "open" : "closing";
      if (open) { blurTo(0, 0.2, "power2.out"); tl.invalidate(); tl.time() >= openEnd ? tl.restart() : tl.play(); }
      else tl.time() < openEnd ? tl.reverse() : tl.play();
    };
    toggle.addEventListener("click", flip);
    overlay.addEventListener("click", () => open && flip());
    panel.addEventListener("click", (e) => { const a = e.target.closest("a[href]"); if (a && open) flip(); if (a?.classList.contains("is-current")) e.preventDefault(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { flip(); toggle.focus(); } });
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => (open ? gsap.set([main, overlay], { x: shift() }) : tl.invalidate()), 150); });
    // If the menu is open before turning the page, wait until it closes
    const close = () => new Promise((done) => {
      const ok = () => document.body.dataset.menuStatus !== "open" && document.body.dataset.menuStatus !== "closing" && Math.abs(+gsap.getProperty(main, "x") || 0) < 1;
      if (ok()) return done();
      if (open) flip();
      const t0 = performance.now();
      const wait = () => (ok() || performance.now() - t0 > 1200 ? done() : requestAnimationFrame(wait));
      requestAnimationFrame(wait);
    });
    return { close };
  })();

  // On hover, two copies of the same text roll up one line together (.7s osmo) — small menu links·footer links
  KK.rolls = (root) => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
    const offs = $$("[data-roll]", root).map((a) => {
      const [cur, next] = a.children;
      if (!cur || !next) return null;
      if (reduce) {
        const on = () => gsap.set([cur, next], { yPercent: -100 }), off = () => gsap.set([cur, next], { yPercent: 0 });
        a.addEventListener("mouseenter", on); a.addEventListener("mouseleave", off);
        return () => { a.removeEventListener("mouseenter", on); a.removeEventListener("mouseleave", off); };
      }
      const tl = gsap.timeline({ paused: true }).to([cur, next], { yPercent: -100, duration: 0.7, ease: "osmo" }, 0);
      const on = () => tl.play(), off = () => tl.reverse();
      a.addEventListener("mouseenter", on); a.addEventListener("mouseleave", off);
      return () => { a.removeEventListener("mouseenter", on); a.removeEventListener("mouseleave", off); tl.kill(); gsap.set([cur, next], { clearProps: "transform" }); };
    });
    return () => offs.forEach((f) => f?.());
  };
  KK.rolls($(".kk-menu"));

  // ───── Cookie settings panel — only for first-time visitors, pressing a button closes it and remembers ─────
  const cookie = $("[data-cookie]");
  if (cookie) {
    let seen = false;
    try { seen = localStorage.getItem("kk-cookie") === "1"; } catch {}
    cookie.hidden = seen;
    cookie.addEventListener("click", (e) => { if (e.target.closest("[data-cookie-close]")) { cookie.hidden = true; try { localStorage.setItem("kk-cookie", "1"); } catch {} } });
    document.addEventListener("click", (e) => { if (e.target.closest("[data-cookie-open]")) cookie.hidden = false; });
  }

  // ───── Footer ─────
  let footerCount = 0;
  const footerTheme = (on) => { footerCount = Math.max(0, footerCount + (on ? 1 : -1)); document.body.dataset.footerTheme = footerCount ? "active" : "inactive"; };
  function footer(root) {
    const block = $("[data-footer]", root);
    if (!block) return () => {};
    const inner = $(".kk-foot", block), dark = $(".kk-foot__dark", block), bottom = $(".kk-foot__bottom", block), mark = $(".kk-foot__mark", block);
    const offs = [KK.rolls(block)];
    const ctx = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: block, start: "clamp(top bottom)", end: "clamp(top top)", scrub: true, invalidateOnRefresh: true } })
        .from(inner, { yPercent: -25, ease: "linear" })
        .from(dark, { opacity: 0.5, ease: "linear" }, "<");
      ScrollTrigger.create({ trigger: block, start: "top top+=96", end: "bottom top+=96", onEnter: () => footerTheme(true), onEnterBack: () => footerTheme(true), onLeave: () => footerTheme(false), onLeaveBack: () => footerTheme(false) });
      const rev = KK.lines($$("[data-foot-line]", block), { stagger: 0.045 });
      if (rev && !reduce) {
        const tl = gsap.timeline({ paused: true });
        rev.addTo(tl, 0);
        ScrollTrigger.create({ trigger: block, start: "top 78%", once: true, onEnter: () => tl.play() });
        offs.push(() => rev.revert());
      }
    }, block);
    // Fit the wordmark to the bottom cell’s width and height — halve the font size step by step to find it (original binary search)
    const fit = () => {
      if (!bottom || !mark) return;
      const W = bottom.clientWidth, H = bottom.clientHeight, spans = $$("span", mark);
      if (!W || !H || !spans.length) return;
      let lo = 16, hi = 2000, best = lo;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        mark.style.setProperty("--kk-mark", `${mid}px`);
        const gap = parseFloat(getComputedStyle(mark).columnGap) || 0;
        const wide = spans.reduce((s, sp) => s + sp.getBoundingClientRect().width, 0) + gap * (spans.length - 1);
        if (wide <= W + 0.5 && mark.getBoundingClientRect().height <= H + 0.5) { best = mid; lo = mid + 1; } else hi = mid - 1;
      }
      mark.style.setProperty("--kk-mark", `${best}px`);
    };
    const ro = new ResizeObserver(() => requestAnimationFrame(fit));
    if (bottom) ro.observe(bottom);
    document.fonts?.ready.then(fit);
    // Current time — the colon blinks with a 1s step-end
    const clock = $$("[data-foot-time]", block);
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => { const [h, m] = fmt.format(new Date()).split(":"); clock.forEach((c) => { c.innerHTML = `${h}<span class="kk-foot__colon">:</span>${m} KST`; }); };
    tick();
    const iv = clock.length ? setInterval(tick, 1000) : 0;
    return () => { offs.forEach((f) => f?.()); ctx.revert(); ro.disconnect(); clearInterval(iv); footerCount = 0; document.body.dataset.footerTheme = "inactive"; };
  }

  // ───── Mounting and clearing sections ─────
  const live = new WeakMap();
  function initPage(c) {
    if (!c || live.has(c)) return;
    const name = c.dataset.pageInit, offs = [footer(c)];
    try { const off = pages[name]?.(c); if (typeof off === "function") offs.push(off); } catch (e) { console.error(e); }
    live.set(c, () => offs.forEach((f) => { try { f(); } catch (e) { console.error(e); } }));
  }
  function dropPage(c) { live.get(c)?.(); live.delete(c); }
  function theme(c) {
    document.body.dataset.head = c?.dataset.head || "";
    $$("[data-nav]").forEach((a) => a.classList.toggle("is-current", a.dataset.nav === c?.dataset.barbaNamespace));
  }
  const toTop = () => { lenis?.scrollTo(0, { immediate: true, force: true }); scrollTo(0, 0); };
  const ready = (c) => {
    gsap.set(c, { clearProps: "transform,willChange" });
    lenis?.resize(); lenis?.start();
    dispatchEvent(new Event("kk:ready"));
    requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
  };
  const heroLines = (c) => KK.lines($$("[data-hero-line]", c));

  // Load the next page’s css first (the original also attaches the next page’s link to head and waits)
  const sheets = (html) => {
    const t = document.createElement("template");
    t.innerHTML = html;
    const have = new Set($$('link[rel="stylesheet"]').map((l) => l.href));
    return Promise.all([...t.content.querySelectorAll('link[rel="stylesheet"][href]')].map((l) => {
      const href = new URL(l.getAttribute("href"), location.href).href;
      if (have.has(href)) return null;
      const n = document.createElement("link");
      n.rel = "stylesheet"; n.href = href;
      document.head.append(n);
      return new Promise((r) => { n.onload = n.onerror = r; });
    }));
  };

  // ───── Loader ─────
  function loader(c) {
    const wrap = $(".kk-loader"), panel = $(".kk-loader__panel"), bottom = $(".kk-loader__bottom"), box = $(".kk-loader__box");
    const left = $('[data-track="left"]'), right = $('[data-track="right"]');
    const lines = heroLines(c);
    const done = () => { document.body.removeAttribute("data-initial-loader"); if (wrap) wrap.style.display = "none"; };
    const tl = gsap.timeline();
    gsap.set(c, { autoAlpha: 1 });
    if (reduce || !wrap || !left || !right) { done(); tl.call(() => { initPage(c); ready(c); }); return tl; }
    lenis?.stop(); toTop();
    const step = (t) => { const a = t.children[0], b = t.children[1]; const h = a.getBoundingClientRect().height; return { step: b ? b.offsetTop - a.offsetTop : h, h, last: t.children.length - 1 }; };
    const L = step(left), R = step(right), endL = -(L.step * L.last), endR = -(R.step * R.last);
    gsap.set(left, { y: L.step }); gsap.set(right, { y: R.step }); gsap.set(box, { autoAlpha: 1 });
    gsap.set(".kk-bar", { autoAlpha: 0 });
    const m = mobile.matches;
    tl.to(left, { y: endL + L.h * 0.25, duration: 2.3, ease: "osmo", force3D: true }, 0)
      .to(left, { y: endL, duration: 0.7, ease: "osmo", force3D: true }, 2.3)
      .to(right, { y: endR + R.h * 0.25, duration: 2.3, ease: "osmo", force3D: true }, 0.1)
      .to(right, { y: endR, duration: 0.7, ease: "osmo", force3D: true }, 2.4)
      .add("preReveal", 2.95).call(() => initPage(c), null, "preReveal")
      .add("reveal", 3.2);
    lines?.addTo(tl, "reveal+=0.05");
    tl.to(".kk-bar", { autoAlpha: 1, duration: 0.55, ease: "power2.out" }, "reveal+=0.08")
      .to(box, { autoAlpha: 0, duration: m ? 0.28 : 0.4, ease: "power1.out" }, m ? "reveal-=0.08" : "reveal")
      .to(panel, { y: () => -(Math.ceil(Math.max(panel.getBoundingClientRect().height, innerHeight)) + 2), duration: 1, ease: "osmo" }, "reveal")
      .to(bottom, { scaleY: 0, duration: 1, ease: "osmo" }, "reveal")
      .add("pageReady")
      .call(() => { done(); gsap.set(".kk-bar", { clearProps: "opacity,visibility" }); ready(c); }, null, "pageReady");
    return tl;
  }

  // Move the current section onto a pinned board — to shrink it into a round card and drop it during the transition
  // If the section background is empty (the first page is transparent so the fixed hero shows through), use the body background color
  const pageBg = (c) => { const b = getComputedStyle(c).backgroundColor; return /rgba\(.*,\s*0\)|transparent/.test(b) ? getComputedStyle(document.body).backgroundColor : b; };
  function lift(current, next) {
    const y = scrollY, h = Math.max(innerHeight, visualViewport?.height || 0);
    const holder = document.createElement("div");
    document.body.append(holder);
    holder.append(current);
    ScrollTrigger.getAll().forEach((s) => s.disable(false));
    gsap.set(holder, { position: "fixed", top: 0, left: 0, right: 0, height: h, overflow: "clip", backgroundColor: pageBg(current), zIndex: 3, clipPath: "rect(0% 100% 100% 0% round 0em)" });
    gsap.set(current, { position: "absolute", top: -y, left: 0, width: "100%" });
    gsap.set(next, { position: "fixed", top: 0, left: 0, right: 0, height: "100vh", overflow: "clip", zIndex: 1, autoAlpha: 1, yPercent: 0, scale: 1, clipPath: "rect(0% 100% 100% 0% round 0em)" });
    return holder;
  }
  const settle = (holder, current, next, extra = {}) => {
    dropPage(current);
    holder?.remove();
    toTop();
    gsap.set(next, { clearProps: "all" });
    gsap.set(".kk-bar", { clearProps: "pointerEvents" });
    reduce ? gsap.set(".kk-bar", { opacity: 1 }) : gsap.to(".kk-bar", { opacity: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    blurTo(1, 0.5, "power2.out");
    document.body.dataset.pageTransition = "";
    initPage(next);
    ready(next);
    extra.after?.();
  };

  function cardStack(current, next) {
    document.body.dataset.pageTransition = "active";
    const holder = lift(current, next), middle = $(".kk-trans__middle"), lines = heroLines(next);
    const tl = gsap.timeline({ onComplete: () => requestAnimationFrame(() => { gsap.set(middle, { autoAlpha: 0, yPercent: 0, scale: 1, clearProps: "clipPath" }); settle(holder, current, next); }) });
    if (reduce) { tl.set(holder, { autoAlpha: 0 }); return tl; }
    tl.to(".kk-bar", { opacity: 0, duration: 0.3, ease: "power2.inOut", overwrite: "auto" }, 0).set(".kk-bar", { pointerEvents: "none" }, 0.3);
    blurTo(0, 0.3, "power2.in");
    tl.set(middle, { autoAlpha: 1, yPercent: 0, scale: 1, clipPath: "rect(0% 100% 100% 0% round 0em)" }, 0)
      .to([holder, middle, next], { clipPath: "rect(0% 100% 100% 0% round 1em)", duration: 0.8 }, 0)
      .to(holder, { scale: 0.95, yPercent: 20, duration: 1.2, ease: "expo.inOut" }, 0)
      .to(middle, { scale: 0.875, yPercent: 10, duration: 1.2, ease: "expo.inOut" }, 0)
      .to(next, { scale: 0.8, yPercent: 0, duration: 1.2, ease: "expo.inOut" }, 0)
      .to(holder, { yPercent: 130, duration: 1.2, ease: "osmo" }, 0.9)
      .to(middle, { yPercent: 120, duration: 1.2, ease: "osmo" }, 1.05)
      .to(next, { scale: 1, yPercent: 0, duration: 1.2, ease: "expo.inOut" }, 1.2);
    tl.call(() => initPage(next), null, 1.65);
    lines?.addTo(tl, 1.65);
    tl.to([holder, middle, next], { clipPath: "rect(0% 100% 100% 0% round 0em)", duration: 0.8, ease: "osmo" }, "> -0.8");
    return tl;
  }

  // Detail → detail: the current page steps back (z −100vw) and slides sideways, the next one enters from the opposite side at 175% and comes forward — perspective 100vw
  function sideBySide(current, next, trigger) {
    document.body.dataset.pageTransition = "active";
    const dir = trigger?.closest?.('[data-direction="previous"]') ? -1 : 1;
    const parent = current.parentElement, y = scrollY, h = innerHeight;
    const wrap = document.createElement("div");
    parent.insertBefore(wrap, current); wrap.append(current);
    ScrollTrigger.getAll().forEach((s) => s.disable(false));
    gsap.set(parent, { perspective: "100vw", transformStyle: "preserve-3d", overflow: "clip", minHeight: Math.max(current.offsetHeight, y + h), perspectiveOrigin: `50% ${y + h / 2}px` });
    gsap.set(wrap, { position: "fixed", top: 0, left: 0, right: 0, height: h, overflow: "clip", zIndex: 2, backgroundColor: pageBg(current), transformStyle: "preserve-3d", clipPath: "rect(0% 100% 100% 0% round 0em)" });
    gsap.set(current, { position: "absolute", top: -y, left: 0, width: "100%" });
    gsap.set(next, { position: "fixed", top: 0, left: 0, right: 0, height: h, overflow: "clip", zIndex: 1, xPercent: 175 * dir, z: "-100vw", autoAlpha: 1, clipPath: "rect(0% 100% 100% 0% round 1.5em)" });
    $$(".kk-visit", current).concat($$(".kk-visit", next)).forEach((v) => gsap.set(v, { autoAlpha: 0 }));
    blurTo(1, 0, "none");
    const tl = gsap.timeline({ onComplete: () => {
      gsap.set(parent, { clearProps: "perspective,transformStyle,perspectiveOrigin,overflow,minHeight" });
      settle(wrap, current, next, { after: () => { const v = $(".kk-visit", next); if (v) gsap.fromTo(v, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, ease: "power2.out", clearProps: "opacity,visibility" }); } });
    } });
    if (reduce) { tl.set(wrap, { autoAlpha: 0 }); return tl; }
    tl.to(wrap, { z: "-100vw", duration: 0.9, clipPath: "rect(0% 100% 100% 0% round 1.5em)" }, 0)
      .to(wrap, { xPercent: -175 * dir, duration: 1, overwrite: "auto" }, 0.25)
      .to(next, { xPercent: 0, duration: 1, overwrite: "auto" }, "<")
      .to(next, { z: 0, duration: 0.9, overwrite: "auto", clipPath: "rect(0% 100% 100% 0% round 0em)" }, ">-=0.4");
    return tl;
  }

  // ───── Barba ─────
  // Shown only after the section scripts (index.js etc.) are loaded after this file and have finished registering via KK.page
  const boot = () => {
  document.body.dataset.footerTheme = "inactive";
  const first = $('[data-barba="container"]');
  theme(first);
  // On file:// the next page can’t be loaded, so use normal navigation without the transition
  if (!window.barba || location.protocol === "file:") { loader(first); return; }
  KK.barba = true;
  barba.hooks.beforeLeave(async () => { dispatchEvent(new Event("kk:leave")); lenis?.stop(); await menu.close(); });
  // When arriving at a detail page, skips the title/meta reveal (original skipWorkDetailIntro) — the transition cover already shows the section as it enters
  barba.hooks.beforeEnter(async (d) => { if (d.next.container.dataset.pageInit === "detail") d.next.container.dataset.skipIntro = ""; gsap.set(d.next.container, { autoAlpha: 0 }); await sheets(d.next.html); theme(d.next.container); });
  barba.init({
    timeout: 7000,
    preventRunning: true,
    prevent: ({ el }) => el?.closest?.("[data-no-barba]"),
    transitions: [
      { name: "detail-side", sync: true, from: { namespace: ["detail"] }, to: { namespace: ["detail"] }, leave: (d) => sideBySide(d.current.container, d.next.container, d.trigger), enter() {} },
      { name: "default", sync: true, once: (d) => loader(d.next.container), leave: (d) => cardStack(d.current.container, d.next.container), enter() {} },
    ],
  });
  };
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", boot) : boot();
})();
