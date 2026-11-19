// Motion shared across pages — lenis · intro open · section reveal · mega menu · phone drawer · FAQ · card row · ring logo · stacking cards · end CTA · clock.
// Values are exactly those read from the original inline script (menu DUR · card line 1000ms · ring 180/-135/90° · CTA .8s).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  // ---------- Smooth scroll ----------
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.15, wheelMultiplier: 0.9, duration: 1.2, smoothWheel: true });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ---------- First open + sections rise ----------
  const fresh = root.classList.contains("is-fresh-load");
  if (fresh) {
    setTimeout(() => {
      gsap.to(document.body, { opacity: 1, duration: 0.5, ease: "power2.out", onComplete: () => root.classList.remove("is-fresh-load") });
    }, 2000);
  }
  function pageFade() {
    const secs = $$("[data-page-fade], [data-page-fade-group]");
    if (!secs.length) return;
    if (reduce) return gsap.set($$("[data-page-fade], [data-page-fade-item]"), { opacity: 1, y: 0 });
    const tl = gsap.timeline();
    secs.forEach((sec, i) => {
      const group = sec.hasAttribute("data-page-fade-group");
      const targets = group ? $$("[data-page-fade-item]", sec) : sec;
      if (group && !targets.length) return;
      tl.to(targets, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: group ? 0.08 : 0 }, i * 0.08);
    });
  }
  setTimeout(pageFade, fresh ? 2500 : 400);

  // ---------- Mega menu (desktop directional hover) + phone drawer ----------
  function megaNav() {
    const wrap = $("[data-menu-wrap]");
    if (!wrap) return;
    const DUR = { bgMorph: 0.4, contentIn: 0.3, contentOut: 0.2, stagger: 0.25, backdropIn: 0.3, backdropOut: 0.2, openScale: 0.35, closeScale: 0.25, mobileNavIn: 0.5, mobileNavOut: 0.18, mobileItemsIn: 0.3, mobileItemsStagger: 0.04 };
    const HOVER_ENTER = 120, HOVER_LEAVE = 150;
    const navList = $("[data-nav-list]", wrap);
    const box = $("[data-dropdown-container]", wrap);
    const dropWrap = $("[data-dropdown-wrapper]", wrap);
    const backdrop = $("[data-menu-backdrop]", wrap);
    const toggles = $$("[data-dropdown-toggle]", wrap);
    const panels = $$("[data-nav-content]", wrap);
    const home = panels.map((p) => ({ el: p, parent: p.parentNode, next: p.nextSibling }));
    const burger = $("[data-burger-toggle]", wrap);
    const pill = $(".zn-nav__pill", wrap);
    const lineTop = $("[data-burger-line='top']", wrap), lineBot = $("[data-burger-line='bot']", wrap);
    let pillWidth = null;
    const st = { open: false, panel: null, hover: null, leave: null, tl: null, mobile: innerWidth <= 991 };
    const ms = { open: false, acc: null, tl: null, accTl: {} };
    const panelOf = (n) => $(`[data-nav-content="${n}"]`, wrap);
    const toggleOf = (n) => $(`[data-dropdown-toggle="${n}"]`, wrap);
    const fades = (el) => $$("[data-menu-fade]", el);
    const items = () => $$(":scope > ul > [data-nav-list-item]", navList);
    const idx = (n) => toggles.indexOf(toggleOf(n));
    const stg = (n) => (n <= 1 ? 0 : { amount: DUR.stagger });
    const resetToggles = () => toggles.forEach((t) => t.setAttribute("aria-expanded", "false"));
    const killDrop = () => {
      if (st.tl) { st.tl.kill(); st.tl = null; }
      gsap.killTweensOf([box, backdrop]);
      panels.forEach((p) => { gsap.killTweensOf(p); gsap.killTweensOf(fades(p)); });
    };
    // Cleanup called on each open is kept to the original’s level — heavy undo (clearing phone drawer traces) would delay the first frame by 40ms
    function resetDesktop() {
      panels.forEach((p) => {
        gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none", x: 0, y: 0 });
        gsap.set(fades(p), { autoAlpha: 0, x: 0, y: 0 });
      });
      gsap.set(box, { height: 0 });
      gsap.set(backdrop, { autoAlpha: 0 });
      wrap.setAttribute("data-menu-open", "false");
      resetToggles();
    }
    function toDesktop() {
      home.forEach(({ el, parent, next }) => { if (el.parentNode !== parent) parent.insertBefore(el, next && next.parentNode === parent ? next : null); });
      navList.removeAttribute("data-lenis-prevent");
      gsap.set(panels, { clearProps: "height,overflow" });
      gsap.set(navList, { clearProps: "opacity,visibility" });
      gsap.set(items(), { clearProps: "opacity,visibility,transform" });
      if (pill) gsap.set(pill, { clearProps: "width" });
      resetDesktop();
    }
    function setupMobile() {
      panels.forEach((p) => {
        const li = toggleOf(p.getAttribute("data-nav-content"))?.closest("[data-nav-list-item]");
        if (li && p.parentNode !== li) li.appendChild(p);
      });
      navList.setAttribute("data-lenis-prevent", "");
      if (pill) pillWidth = getComputedStyle(pill).width;
      gsap.set(navList, { autoAlpha: 0 });
      gsap.set(items(), { autoAlpha: 1, y: 0 });
      panels.forEach((p) => {
        gsap.set(p, { height: 0, overflow: "hidden", autoAlpha: 1, visibility: "visible", pointerEvents: "none" });
        gsap.set(fades(p), { autoAlpha: 1, x: 0, y: 0 });
      });
      gsap.set(backdrop, { autoAlpha: 0 });
      ms.open = false; ms.acc = null;
      resetToggles();
    }
    const measure = (n) => {
      const el = panelOf(n);
      if (!el) return 0;
      const s = el.style, prev = [s.visibility, s.opacity];
      s.visibility = "visible"; s.opacity = "0";
      const h = el.getBoundingClientRect().height;
      [s.visibility, s.opacity] = prev;
      return h;
    };
    function openDrop(n) {
      if (st.open && st.panel === n) return;
      if (st.open) return switchDrop(st.panel, n);
      const h = measure(n);
      if (!h) return;
      killDrop(); resetDesktop();
      const el = panelOf(n), f = fades(el);
      st.open = true; st.panel = n;
      wrap.setAttribute("data-menu-open", "true");
      toggleOf(n)?.setAttribute("aria-expanded", "true");
      const tl = (st.tl = gsap.timeline());
      tl.to(backdrop, { autoAlpha: 1, duration: DUR.backdropIn, ease: "power2.out" }, 0);
      tl.to(box, { height: h, duration: DUR.openScale, ease: "power3.out" }, 0);
      tl.set(el, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, 0.05);
      if (f.length) tl.fromTo(f, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: DUR.contentIn, stagger: stg(f.length), ease: "power3.out" }, 0.1);
    }
    function closeDrop() {
      if (!st.open) return;
      const el = panelOf(st.panel), f = el ? fades(el) : [];
      killDrop();
      const tl = (st.tl = gsap.timeline({ onComplete() { st.open = false; st.panel = null; st.tl = null; resetDesktop(); } }));
      if (f.length) tl.to(f, { autoAlpha: 0, y: -4, duration: DUR.contentOut * 0.7, ease: "power2.in" }, 0);
      tl.to(box, { height: 0, duration: DUR.closeScale, ease: "power2.in" }, 0.05);
      tl.to(backdrop, { autoAlpha: 0, duration: DUR.backdropOut, ease: "power2.out" }, 0);
      if (el) tl.set(el, { visibility: "hidden", opacity: 0, pointerEvents: "none" });
    }
    function switchDrop(from, to) {
      const dir = idx(to) > idx(from) ? 1 : -1;
      const a = panelOf(from), b = panelOf(to);
      if (!a || !b) return;
      const fa = fades(a), fb = fades(b), h = measure(to);
      if (!h) return;
      killDrop();
      panels.forEach((p) => { gsap.set(p, { visibility: "hidden", opacity: 0, pointerEvents: "none" }); gsap.set(fades(p), { autoAlpha: 0, x: 0, y: 0 }); });
      gsap.set(a, { visibility: "visible", opacity: 1, pointerEvents: "auto" });
      if (fa.length) gsap.set(fa, { autoAlpha: 1 });
      gsap.set(backdrop, { autoAlpha: 1 });
      st.panel = to;
      resetToggles();
      toggleOf(to)?.setAttribute("aria-expanded", "true");
      const tl = (st.tl = gsap.timeline());
      if (fa.length) tl.to(fa, { autoAlpha: 0, x: dir * -30, duration: DUR.contentOut, ease: "power2.in" }, 0);
      tl.set(a, { visibility: "hidden", opacity: 0, pointerEvents: "none" }, DUR.contentOut);
      if (fa.length) tl.set(fa, { x: 0 }, DUR.contentOut);
      tl.to(box, { height: h, duration: DUR.bgMorph, ease: "power3.out" }, 0.05);
      tl.set(b, { visibility: "visible", opacity: 1, pointerEvents: "auto" }, DUR.contentOut * 0.5);
      if (fb.length) tl.fromTo(fb, { autoAlpha: 0, x: dir * 30 }, { autoAlpha: 1, x: 0, duration: DUR.contentIn, stagger: stg(fb.length), ease: "power3.out" }, DUR.contentOut * 0.6);
    }
    function burgerTl(toX) {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      const tc = lineTop.offsetTop + lineTop.offsetHeight / 2, bc = lineBot.offsetTop + lineBot.offsetHeight / 2, mc = (tc + bc) / 2;
      if (toX) {
        tl.to(lineTop, { y: mc - tc, duration: 0.15 }, 0).to(lineBot, { y: mc - bc, duration: 0.15 }, 0);
        tl.to(lineTop, { rotation: 45, duration: 0.2 }, 0.15).to(lineBot, { rotation: -45, duration: 0.2 }, 0.15);
      } else {
        tl.to(lineTop, { rotation: 0, duration: 0.2 }, 0).to(lineBot, { rotation: 0, duration: 0.2 }, 0);
        tl.to(lineTop, { y: 0, duration: 0.15 }, 0.15).to(lineBot, { y: 0, duration: 0.15 }, 0.15);
      }
      return tl;
    }
    function openMobile() {
      if (ms.tl) ms.tl.kill();
      ms.open = true;
      wrap.setAttribute("data-menu-open", "true");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      lenis?.stop();
      navList.setAttribute("data-mobile-nav", "active");
      const it = items(), tl = (ms.tl = gsap.timeline());
      tl.add(burgerTl(true), 0);
      tl.to(backdrop, { autoAlpha: 1, duration: DUR.mobileNavIn, ease: "power2.out" }, 0);
      tl.to(navList, { autoAlpha: 1, duration: DUR.mobileNavIn, ease: "power2.out" }, 0);
      if (pill) tl.to(pill, { width: "100%", duration: DUR.mobileNavIn, ease: "power2.out" }, 0);
      if (it.length) tl.fromTo(it, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: DUR.mobileItemsIn, stagger: DUR.mobileItemsStagger, ease: "power3.out" }, DUR.mobileNavIn * 0.75);
    }
    function closeMobile() {
      if (ms.tl) ms.tl.kill();
      if (ms.acc) {
        const el = panelOf(ms.acc);
        if (el) gsap.set(el, { height: 0, pointerEvents: "none" });
        toggleOf(ms.acc)?.setAttribute("aria-expanded", "false");
        ms.acc = null;
      }
      wrap.setAttribute("data-menu-open", "false");
      ms.open = false;
      burger.setAttribute("aria-expanded", "false");
      navList.setAttribute("data-mobile-nav", "");
      const it = items();
      const tl = (ms.tl = gsap.timeline({ onComplete() { document.body.style.overflow = ""; lenis?.start(); ms.tl = null; } }));
      tl.add(burgerTl(false), 0);
      if (it.length) tl.to(it, { autoAlpha: 0, y: 8, duration: 0.15, stagger: 0.02, ease: "power2.in" }, 0);
      const s = it.length ? 0.15 : 0;
      tl.to(backdrop, { autoAlpha: 0, duration: DUR.mobileNavOut, ease: "power2.out" }, s);
      tl.to(navList, { autoAlpha: 0, duration: DUR.mobileNavOut, ease: "power2.inOut" }, s);
      if (pill && pillWidth) tl.to(pill, { width: pillWidth, duration: DUR.mobileNavOut, ease: "power2.inOut" }, s);
    }
    function toggleAcc(n) {
      const el = panelOf(n);
      if (!el) return;
      const prev = ms.acc, opening = prev !== n;
      if (prev && prev !== n) {
        const pe = panelOf(prev), pf = fades(pe);
        toggleOf(prev)?.setAttribute("aria-expanded", "false");
        gsap.set(pe, { pointerEvents: "none" });
        const ptl = gsap.timeline();
        if (pf.length) ptl.to(pf, { autoAlpha: 0, y: -4, duration: DUR.contentOut * 0.7, ease: "power2.in" }, 0);
        ptl.to(pe, { height: 0, duration: 0.3, ease: "power2.inOut" }, pf.length ? 0.05 : 0);
      }
      gsap.killTweensOf(el);
      const f = fades(el), tl = gsap.timeline();
      ms.acc = opening ? n : null;
      toggleOf(n)?.setAttribute("aria-expanded", String(opening));
      gsap.set(el, { pointerEvents: opening ? "auto" : "none" });
      if (opening) {
        tl.to(el, { height: "auto", duration: 0.35, ease: "power2.out" }, 0);
        if (f.length) tl.fromTo(f, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: DUR.contentIn, stagger: stg(f.length), ease: "power3.out" }, 0.1);
      } else {
        if (f.length) tl.to(f, { autoAlpha: 0, y: -4, duration: DUR.contentOut * 0.7, ease: "power2.in" }, 0);
        tl.to(el, { height: 0, duration: 0.3, ease: "power2.inOut" }, f.length ? 0.05 : 0);
      }
    }
    toggles.forEach((t) => {
      t.addEventListener("mouseenter", () => {
        if (st.mobile) return;
        clearTimeout(st.leave); clearTimeout(st.hover);
        st.hover = setTimeout(() => openDrop(t.dataset.dropdownToggle), st.open ? 0 : HOVER_ENTER);
      });
      t.addEventListener("mouseleave", () => { if (st.mobile) return; clearTimeout(st.hover); st.leave = setTimeout(closeDrop, HOVER_LEAVE); });
      // Desktop opens and closes by hover only (the original ignores presses) — only keyboard Enter·Space opens it like a press
      t.addEventListener("click", (e) => {
        e.preventDefault();
        if (st.mobile) toggleAcc(t.dataset.dropdownToggle);
      });
      t.addEventListener("keydown", (e) => {
        if (st.mobile || (e.key !== "Enter" && e.key !== " ")) return;
        e.preventDefault();
        if (st.open && st.panel === t.dataset.dropdownToggle) closeDrop(); else openDrop(t.dataset.dropdownToggle);
      });
    });
    dropWrap.addEventListener("mouseenter", () => { if (!st.mobile) clearTimeout(st.leave); });
    dropWrap.addEventListener("mouseleave", () => { if (!st.mobile) st.leave = setTimeout(closeDrop, HOVER_LEAVE); });
    backdrop.addEventListener("click", () => (st.mobile ? ms.open && closeMobile() : closeDrop()));
    burger?.addEventListener("click", () => (ms.open ? closeMobile() : openMobile()));
    addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (st.mobile) { if (ms.acc) toggleAcc(ms.acc); else if (ms.open) closeMobile(); return; }
      closeDrop();
    });
    document.addEventListener("click", (e) => { if (!st.mobile && st.open && !e.target.closest("[data-menu-wrap]")) closeDrop(); });
    // Hovering a ”parent item” in the product panel opens a 260px submenu box beside it (.2s). It waits .35s before closing to allow for diagonal hand movement
    const fly = $("[data-flyout-col]", wrap);
    let flyT = null;
    $$("[data-flyout]", wrap).forEach((a) => a.addEventListener("mouseenter", () => { clearTimeout(flyT); a.closest("[data-nav-content]").setAttribute("data-flyout-active", ""); }));
    $$("[data-nav-content='products'] .zn-mlink:not([data-flyout])", wrap).forEach((a) => a.addEventListener("mouseenter", () => { clearTimeout(flyT); flyT = setTimeout(() => fly?.closest("[data-nav-content]").removeAttribute("data-flyout-active"), 350); }));
    fly?.addEventListener("mouseenter", () => clearTimeout(flyT));
    if (st.mobile) setupMobile(); else toDesktop();
    let rT;
    addEventListener("resize", () => {
      clearTimeout(rT);
      rT = setTimeout(() => {
        const m = innerWidth <= 991;
        if (m === st.mobile) return;
        st.mobile = m;
        killDrop(); st.open = false; st.panel = null;
        if (ms.open) { document.body.style.overflow = ""; lenis?.start(); ms.open = false; burgerTl(false).progress(1); }
        if (m) setupMobile(); else toDesktop();
      }, 100);
    });
  }
  megaNav();

  // ---------- FAQ ----------
  $$("[data-accordion-css-init]").forEach((acc) => {
    const closeSib = acc.getAttribute("data-accordion-close-siblings") === "true";
    acc.addEventListener("click", (e) => {
      const t = e.target.closest("[data-accordion-toggle]");
      if (!t) return;
      const item = t.closest("[data-accordion-status]");
      const on = item.getAttribute("data-accordion-status") === "active";
      item.setAttribute("data-accordion-status", on ? "not-active" : "active");
      t.setAttribute("aria-expanded", String(!on));
      if (closeSib && !on) $$("[data-accordion-status='active']", acc).forEach((s) => s !== item && s.setAttribute("data-accordion-status", "not-active"));
    });
  });

  // ---------- Card row (swiper) — clone cells at both ends make it endless, and near the end it quietly jumps to the same cell ----------
  const BP = [0, 768, 992, 1200, 1440];
  $$("[data-swiper-config]").forEach((w) => {
    const el = $(".swiper", w), wrapper = el && $(".swiper-wrapper", el);
    if (!wrapper || !window.Swiper) return;
    const orig = $$(".swiper-slide", wrapper);
    if (!orig.length) return;
    const vals = (w.dataset.swiperConfig || "1.2,3,3.2").split(",").map(Number);
    const entries = vals.map((v, i) => ({ width: BP[i], spv: v })).filter((e) => !isNaN(e.spv) && e.width !== undefined);
    const base = entries[0];
    const bps = {};
    entries.slice(1).forEach((e) => (bps[e.width] = { slidesPerView: e.spv, slidesPerGroup: 1, spaceBetween: e.width >= 992 ? 12 : 8 }));
    let active = base.spv;
    entries.forEach((e) => { if (innerWidth >= e.width) active = e.spv; });
    const n = orig.length, raw = Math.ceil(active) * 3 + 6, buf = n <= 6 ? Math.min(raw, n * 2) : raw;
    const clone = (s) => { const c = s.cloneNode(true); c.setAttribute("aria-hidden", "true"); $$("a, button, [tabindex]", c).forEach((a) => a.setAttribute("tabindex", "-1")); return c; };
    const before = document.createDocumentFragment();
    for (let b = 0; b < buf; b++) before.appendChild(clone(orig[(((n - buf + b) % n) + n) % n]));
    wrapper.insertBefore(before, wrapper.firstChild);
    for (let a = 0; a < buf; a++) wrapper.appendChild(clone(orig[a % n]));
    let moving = false;
    const sw = new Swiper(el, {
      loop: false, speed: 1000, grabCursor: true, centeredSlides: true, initialSlide: buf,
      navigation: { prevEl: $("[data-swiper-prev]", w), nextEl: $("[data-swiper-next]", w) },
      slidesPerView: base.spv, slidesPerGroup: 1, spaceBetween: 8, breakpoints: bps,
      on: {
        transitionEnd() {
          if (moving) return;
          const total = this.slides.length, spv = typeof this.params.slidesPerView === "number" ? this.params.slidesPerView : 1.2;
          const th = Math.ceil(spv) + 1;
          let i = this.activeIndex, g = 0;
          while (g++ < 20) { if (i <= th) i += n; else if (total - 1 - i <= th) i -= n; else break; }
          if (i !== this.activeIndex) { moving = true; setTimeout(() => { this.slideTo(i, 0, false); moving = false; }, 0); }
        },
      },
    });
    // The insights row advances one slot per 1/3 of scroll through the section (excluding touch devices)
    if (w.dataset.swipeScroll === "yes" && !reduce && !("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
      let last = 0, seen = false;
      ScrollTrigger.create({
        trigger: w, start: "top bottom", end: "bottom top",
        onUpdate(self) {
          const step = Math.floor(self.progress * 3);
          if (!seen) { seen = true; last = step; return; }
          if (sw.animating) return;
          if (step > last) { sw.slideNext(); last++; } else if (step < last) { sw.slidePrev(); last--; }
        },
      });
    }
  });

  // ---------- Ring logo — 44 tiles are plugged into three concentric circles and rotated 180°·-135°·90° while passing through the section ----------
  $$("[data-orbit]").forEach((sec) => {
    const src = $$(".zn-orbit-src > *", sec);
    if (!src.length) return;
    const rings = [["is-s", 8, 1, 180], ["is-m", 16, -1, 135], ["is-l", 20, 1, 90]];
    rings.forEach(([cls, count, dir, amt]) => {
      const ring = $(`.zn-orbit__ring.${cls}`, sec);
      if (!ring) return;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("div");
        dot.className = "zn-orbit__dot";
        dot.style.setProperty("--angle", `${(i * 360) / count}deg`);
        dot.appendChild(src[(i * 7 + count) % src.length].cloneNode(true));
        ring.appendChild(dot);
      }
      if (reduce) return;
      const p = { r: 0 };
      gsap.to(p, { r: amt * dir, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true }, onUpdate: () => ring.style.setProperty("--ring-rotation", `${p.r}deg`) });
    });
  });

  // ---------- Stacked cards + table of contents ----------
  $$("[data-overlap]").forEach((sec) => {
    const cards = $$(".zn-ocard", sec), links = $$(".zn-anchor", sec);
    if (!cards.length) return;
    const update = () => {
      let cur = cards[0];
      cards.forEach((c) => { if (c.getBoundingClientRect().top <= 60) cur = c; });
      links.forEach((l) => l.classList.toggle("is-current", l.getAttribute("href") === `#${cur.id}`));
    };
    addEventListener("scroll", update, { passive: true });
    lenis?.on("scroll", update);
    update();
    const easeQ = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    links.forEach((l) => l.addEventListener("click", (e) => {
      e.preventDefault();
      const card = $(l.getAttribute("href"));
      if (!card) return;
      const pos = cards.map((c) => c.style.position);
      cards.forEach((c) => (c.style.position = "static"));
      const target = card.getBoundingClientRect().top + scrollY;
      cards.forEach((c, i) => (c.style.position = pos[i]));
      lenis?.stop();
      const from = scrollY, d = target - from, t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / 800, 1);
        scrollTo(0, from + d * easeQ(p));
        update();
        if (p < 1) requestAnimationFrame(step);
        else if (lenis) { lenis.start(); lenis.scrollTo(scrollY, { immediate: true }); }
      };
      requestAnimationFrame(step);
    }));
    if (reduce) return;
    cards.forEach((c, i) => {
      const img = $(".zn-ocard__img .wf-img", c);
      if (!img || i === cards.length - 1) return;
      gsap.fromTo(img, { scale: 1.1 }, { scale: 1, ease: "power1.out", scrollTrigger: { trigger: c, start: "top top", end: "+=420", scrub: 0.3, invalidateOnRefresh: true } });
    });
  });

  // ---------- End CTA — as the adjoining section approaches, a faded photo rises in .8s and the title turns white, and the button splits into light or dark type following the photo darkness ----------
  $$("[data-fcta]").forEach((w) => {
    const img = $(".zn-fcta__img", w), title = $(".zn-fcta__title", w);
    const light = $(".zn-fcta__btns .is-light", w), dark = $(".zn-fcta__btns .is-dark", w);
    if (!img) return;
    // Title color moves by the ratio of mixing ink → white — even when the skin changes, it starts from that skin’s ink
    const tint = { p: 0 };
    const paint = () => (title.style.color = `color-mix(in oklab, var(--site-on-media) ${tint.p}%, var(--kf-ink))`);
    const mirror = () => {
      const o = parseFloat(getComputedStyle(img).opacity);
      const dip = Math.abs(o - 0.5) * 2, on = dip > 0.9;
      if (dark) { dark.style.opacity = o >= 0.5 ? dip : 0; dark.style.pointerEvents = o >= 0.5 && on ? "auto" : "none"; }
      if (light) { light.style.opacity = o < 0.5 ? dip : 0; light.style.pointerEvents = o < 0.5 && on ? "auto" : "none"; }
    };
    if (reduce) { gsap.set(img, { opacity: 1 }); tint.p = 100; paint(); mirror(); return; }
    const tl = gsap.timeline({ paused: true, onUpdate: mirror });
    tl.fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0);
    tl.fromTo(tint, { p: 0 }, { p: 100, duration: 0.8, onUpdate: paint }, 0);
    ScrollTrigger.create({ trigger: w, start: "-50% -50%", end: "-20% -20%", onEnter: () => tl.play(), onEnterBack: () => tl.reverse() });
    mirror();
  });

  // ---------- Video — plays only when 10% or more is visible, phone width uses the portrait video ----------
  const phone = matchMedia("(max-width: 767px)");
  $$("video[data-autoplay]").forEach((v) => {
    const s = $("source", v);
    const pick = () => {
      const want = phone.matches && v.dataset.mobileSrc ? v.dataset.mobileSrc : v.dataset.desktopSrc || s?.getAttribute("src");
      if (s && want && s.getAttribute("src") !== want) { s.setAttribute("src", want); v.load(); }
    };
    if (s && !v.dataset.desktopSrc) v.dataset.desktopSrc = s.getAttribute("src");
    pick();
    phone.addEventListener("change", pick);
    v.muted = true;
    if (reduce) return;
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())), { threshold: 0.1 }).observe(v);
  });

  // ---------- Clock ----------
  const zones = $$("[data-clock]");
  const clock = () => zones.forEach((z) => {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: z.dataset.clock, hour: "numeric", minute: "numeric", hour12: true }).formatToParts(new Date());
    const g = (t) => p.find((x) => x.type === t)?.value || "";
    z.textContent = `${String(g("hour")).padStart(2, "0")}:${g("minute")} ${g("dayPeriod").toUpperCase()}`;
  });
  if (zones.length) { clock(); setInterval(clock, 30000); }

  // ---------- Footer wordmark — fills the full width ----------
  const wm = $(".zn-wordmark");
  const fit = () => {
    if (!wm) return;
    wm.style.fontSize = "100px";
    const cs = getComputedStyle(wm.parentElement);
    const w = wm.getBoundingClientRect().width, avail = wm.parentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (w) wm.style.fontSize = `${(100 * avail) / w}px`;
  };
  fit();
  document.fonts?.ready.then(() => { fit(); ScrollTrigger.refresh(); });
  addEventListener("resize", fit);
})();
