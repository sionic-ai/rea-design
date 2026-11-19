/* Shared by all pages: draws the header band, drawer, entry strip and footer, and attaches smooth scroll, link hover, reveals, side index, photo paging, video and page transitions.
   Page transitions work like the original: swup swaps only #swup — per-page handlers are attached by mount() and detached before the swap, while the drawer and scroll are set up once. */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ARROW = '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 4h7M4.5 1.5 7 4 4.5 6.5"/></svg>';
  const OUT = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 7l4-4M3.5 3H7v3.5"/></svg>';
  const LOGO = '<a class="lh-logo" href="index.html" aria-label="Your logo here"><svg viewBox="0 0 64 16" aria-hidden="true"><text x="0" y="14" font-size="16.5" letter-spacing="2.2" fill="currentColor">LOGO</text></svg><span>Recruit Site</span></a>';
  const LH = (window.LH = { ARROW, OUT, reduce, pages: {} });
  LH.page = (name, init) => { LH.pages[name] = init; };
  const navReady = () => requestAnimationFrame(() => requestAnimationFrame(() => root.setAttribute("data-nav-ready", "")));
  document.fonts ? document.fonts.ready.then(navReady, navReady) : navReady();

  const swap = (text, cls = "") => `<span class="lh-swap__label ${cls}"><span class="lh-swap__cur">${text}</span><span class="lh-swap__next" aria-hidden="true">${text}</span></span>`;
  const icon = () => `<span class="lh-swap__icon">${ARROW}${ARROW}</span>`;
  LH.more = (text, href) => `<a class="lh-more lh-swap e13" href="${href}"><span class="lh-swap__label"><span class="lh-swap__cur">${text}</span><span class="lh-swap__next" aria-hidden="true">${text}</span><span class="lh-swap__line"></span></span>${icon()}</a>`;
  LH.label = (text) => `<div data-lab><span class="lh-label__line"></span><p class="e16 lh-label__win"><span class="lh-label__txt">${text}</span></p></div>`;

  const WORK = [["about.html", "Project story"], ["recruit.html", "Business details"]];
  const MENU = [["index.html#interview", "Interview"], ["index.html#culture", "Culture and ways of working"], ["index.html#philosophy", "Corporate Philosophy"], ["news.html", "Topic"], ["index.html#positions", "Job type"]];

  /* ---------- Once only: phone drawer (outside #swup so it stays after page transitions) ---------- */
  document.body.insertAdjacentHTML("beforeend", `
    <div class="lh-drawer" data-slot="mobile-menu" aria-hidden="true">
      <div class="lh-drawer__bg" data-drawer-close></div>
      <div class="lh-drawer__panel" role="dialog" aria-label="Site Menu">
        <button class="lh-drawer__close" type="button" aria-label="Close Menu" data-drawer-close><i></i><i></i></button>
        <nav>
          <div><p class="d1">Our job</p><ul class="lh-drawer__sub d2">${WORK.map(([h, t]) => `<li><a class="lh-swap" href="${h}">${swap(t)}</a></li>`).join("")}</ul></div>
          <ul class="lh-drawer__list d1">${MENU.map(([h, t]) => `<li><a class="lh-swap" href="${h}">${swap(t)}</a></li>`).join("")}</ul>
          <a class="lh-entry lh-swap d1" href="index.html#entry">${swap("Entry")}${icon()}</a>
        </nav>
        <div class="lh-drawer__logo">${LOGO}</div>
      </div>
    </div>
`);

  /* Smooth scroll — original settings as is: lerp off, one wheel tick eased by .4s easeOutQuad */
  let lenis = null;
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: Infinity, duration: 0.4, easing: (t) => 1 - Math.pow(1 - t, 2) });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", () => ScrollTrigger.update());
      gsap.ticker.add((t) => lenis.raf(t * 1000));
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  LH.lenis = lenis;
  // Scrolling to # anchors also uses original values — wide screen .45s · phone .55s, easeOutQuad
  LH.scrollTo = (target, immediate) => lenis ? lenis.scrollTo(target, { offset: -(innerWidth < 768 ? 46 + 48 : 59 + 28), duration: innerWidth < 768 ? 0.55 : 0.45, easing: (t) => 1 - Math.pow(1 - t, 2), immediate, force: true }) : target.scrollIntoView();

  /* Link text swap: spins once when hover or focus enters. Like the original, once the next text has fully risen (or the new arrow has fully entered if there is no text) remove the mark,
     The arrow that starts .15s late is cut off at .8s. A link spun by hand needs the pointer to actually leave that link before it spins the next round —
     The same goes for the title link spun in on entering a project item, so until you leave past the title, moving between items doesn’t spin it again (as in the original) */
  const spin = (a) => a && !reduce && a.classList.add("is-animating");
  const spent = new WeakSet();
  LH.enter = (a) => { if (!a || spent.has(a)) return; spent.add(a); spin(a); };
  document.addEventListener("pointerover", (e) => { const a = e.target.closest(".lh-swap"); if (a && !a.contains(e.relatedTarget)) LH.enter(a); });
  document.addEventListener("pointerout", (e) => { const a = e.target.closest(".lh-swap"); if (a && !a.contains(e.relatedTarget)) spent.delete(a); });
  document.addEventListener("focusin", (e) => spin(e.target.closest(".lh-swap")));
  document.addEventListener("animationend", (e) => {
    const a = e.target.closest(".lh-swap.is-animating");
    if (a && e.animationName === (a.querySelector(".lh-swap__next") ? "lh-swap-next" : "lh-swap-icon-next")) a.classList.remove("is-animating");
  });

  /* Phone drawer */
  const drawer = document.querySelector(".lh-drawer");
  const drawerSet = (on) => {
    drawer.classList.toggle("is-open", on);
    drawer.setAttribute("aria-hidden", !on);
    document.querySelectorAll("[data-drawer-open]").forEach((b) => b.setAttribute("aria-expanded", on));
    on ? lenis && lenis.stop() : lenis && lenis.start();
  };
  document.addEventListener("click", (e) => e.target.closest("[data-drawer-open]") && drawerSet(true));
  drawer.querySelectorAll("[data-drawer-close]").forEach((b) => b.addEventListener("click", () => drawerSet(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && drawerSet(false));

  /* ---------- Per page: draws the header band, entries and footer inside #swup and attaches motion. The returned function detaches it ---------- */
  const splitChars = (el, start = 0) => {
    if (el.dataset.split) return;
    el.dataset.split = 1;
    const t = el.textContent.trim();
    el.setAttribute("aria-label", t);
    el.innerHTML = Array.from(t, (c, i) => `<span aria-hidden="true" style="--i:${i + start}">${c === " " ? "&nbsp;" : c}</span>`).join("");
  };

  function mount(box) {
    const page = box.dataset.page;
    const offs = [];
    const on = (t, ev, fn, opt) => { t.addEventListener(ev, fn, opt); offs.push(() => t.removeEventListener(ev, fn, opt)); };

    const header = box.querySelector("header[data-slot=header]");
    if (header) {
      header.className = "lh-header";
      header.innerHTML = `${LOGO}
        <div class="lh-header__right">
          <nav class="lh-nav g12" aria-label="Site Navigation" data-header-reveal>
            <ul>
              <li class="lh-work" data-work>
                <button class="lh-work__btn" type="button" aria-expanded="false"><span>Our job</span><span class="lh-plus" aria-hidden="true"></span></button>
                <ul class="lh-work__menu">${WORK.map(([h, t]) => `<li><a class="lh-swap" href="${h}">${swap(t)}</a></li>`).join("")}</ul>
              </li>
              ${MENU.map(([h, t]) => `<li><a class="lh-swap" href="${h}">${swap(t)}</a></li>`).join("")}
            </ul>
          </nav>
          <a class="lh-entry lh-swap g12" href="index.html#entry" data-header-reveal>${swap("Entry")}${icon()}</a>
          <span class="lh-header__div" aria-hidden="true" data-header-reveal></span>
          <button class="lh-burger" type="button" aria-label="Open Menu" aria-expanded="false" data-drawer-open data-header-reveal><i></i><i></i></button>
        </div>`;
    }

    const entry = box.querySelector("[data-slot=entry]");
    if (entry) {
      const home = page === "home";
      entry.id = "entry";
      entry.className = `lh-entryband${home ? "" : " is-sub"}`;
      entry.innerHTML = `
        <div class="lh-entryband__img"><div class="wf-img" data-label="Window-side person upper body · blurred green forest behind · natural light · person in the right third"></div></div>
        <div class="lh-entryband__in on-dark">
          <div class="lh-grid">
            <div style="grid-column: span 2">${LH.label("Entry")}</div>
            <div class="lh-entryband__main" data-entry-content>
              <h2 class="q1">Your recruitment · entry info here</h2>
              <p class="q5 lh-entryband__lede">Add the people joining you here<br>A short sentence that calls out<br>Set in three lines.</p>
              <div style="margin-top: 56px">${LH.more("View All", "index.html#positions")}</div>
            </div>
            ${home ? '<p class="lh-entryband__copy lh-bigq" data-slot="closing-question" aria-label="Your variation on the first question here">Here, a line asking myself.</p>' : ""}
          </div>
        </div>`;
    }

    const footer = box.querySelector("footer[data-slot=footer]");
    if (footer) {
      const links = [["index.html", "Home"], ...WORK, ["index.html#interview", "Interview"], ["index.html#philosophy", "Corporate Philosophy"], ["index.html#culture", "Culture and ways of working"], ["news.html", "Topic"], ["index.html#positions", "Job Type · Entry"], ["#", "Company Site", 1], ["#", "Social Media", 1]];
      footer.innerHTML = `
        <div class="lh-footer__top"><div class="lh-grid">
          <div class="lh-footer__img"><div class="wf-img" data-label="Smiling staff vertical shot · hand holding a mug · indoor natural light · vertical 4:5"></div></div>
          <nav class="lh-footer__nav g13" aria-label="Footer Nav"><ul>${links.map(([h, t, ext]) => `<li><a class="lh-swap" href="${h}">${swap(t)}${ext ? OUT : ""}</a></li>`).join("")}</ul></nav>
        </div></div>
        <div class="lh-footer__bar">${LOGO}<small>(c) BRAND</small></div>`;
    }

    /* Our Work submenu: opens downward once more than 1/3 of the hero has passed, otherwise (when the header band is at the bottom of the screen) opens upward */
    box.querySelectorAll("[data-work]").forEach((li) => {
      const btn = li.querySelector("button");
      const menu = li.querySelector(".lh-work__menu");
      const place = () => {
        const mv = box.querySelector("#mv");
        const r = mv && mv.getBoundingClientRect();
        menu.classList.toggle("is-below", !mv || r.top <= -(r.height / 3));
      };
      const set = (v) => { if (v) place(); li.classList.toggle("is-open", v); btn.setAttribute("aria-expanded", v); };
      on(li, "pointerenter", (e) => e.pointerType !== "touch" && set(true));
      on(li, "pointerleave", (e) => e.pointerType !== "touch" && set(false));
      on(btn, "click", (e) => { if (e.pointerType === "mouse" && li.classList.contains("is-open")) return; set(!li.classList.contains("is-open")); });
      on(document, "click", (e) => !li.contains(e.target) && set(false));
    });

    /* Reveal */
    root.classList.add("is-ready");
    box.querySelectorAll("[data-reveal-section] [data-title], [data-pmv] [data-title]").forEach((el) => splitChars(el));
    box.querySelectorAll("[data-reveal-section]").forEach((s, i) => s.classList.toggle("is-first", i === 0));
    const show = (el) => el.classList.add("is-in");
    if (reduce) box.querySelectorAll("[data-reveal-section],[data-reveal-img],[data-pmv]").forEach(show);
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
      box.querySelectorAll("[data-reveal-section]").forEach((el) => io.observe(el));
      /* Photos are measured separately like the original — excluding the bottom 10%, once 5% is visible they reveal two frames later, and those caught while the loader runs are revealed together when the loader clears */
      let held = [], mo = null;
      const late = (el) => requestAnimationFrame(() => requestAnimationFrame(() => show(el)));
      const imgIo = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        imgIo.unobserve(e.target);
        if (!root.classList.contains("is-site-loading")) return late(e.target);
        held.push(e.target);
        mo = mo || new MutationObserver(() => { if (root.classList.contains("is-site-loading")) return; mo.disconnect(); mo = null; held.forEach(late); held = []; });
        mo.observe(root, { attributes: true, attributeFilter: ["class"] });
      }), { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
      box.querySelectorAll("[data-reveal-img]").forEach((el) => imgIo.observe(el));
      offs.push(() => { io.disconnect(); imgIo.disconnect(); mo && mo.disconnect(); });
      if (box.querySelector("[data-pmv]")) requestAnimationFrame(() => requestAnimationFrame(() => box.querySelectorAll("[data-pmv]").forEach(show)));
    }

    /* Side TOC · phone TOC strip: the item passing the screen center is bolded */
    const indexLinks = [...box.querySelectorAll("[data-index] a[href^='#']")];
    if (indexLinks.length) {
      const ids = [...new Set(indexLinks.map((a) => a.getAttribute("href").slice(1)))];
      const bar = box.querySelector(".lh-cnav__bar");
      const markCurrent = () => {
        const mid = innerHeight * 0.5;
        let cur = null;
        ids.forEach((id) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < mid) cur = id; });
        indexLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + cur));
        if (bar) {
          const a = box.querySelector(`.lh-cnav a[href="#${cur}"]`);
          bar.style.width = a ? a.offsetWidth + "px" : "0px";
          bar.style.transform = a ? `translateX(${a.offsetLeft}px)` : "none";
          if (a) { const sc = a.closest(".lh-cnav__scroll"); sc.scrollTo({ left: a.offsetLeft - parseFloat(getComputedStyle(document.body).getPropertyValue("--side") || 24), behavior: "smooth" }); }
        }
      };
      if (lenis) offs.push(lenis.on("scroll", markCurrent)); else on(window, "scroll", markCurrent, { passive: true });
      markCurrent();
      indexLinks.forEach((a) => on(a, "click", (e) => { e.preventDefault(); LH.scrollTo(document.getElementById(a.getAttribute("href").slice(1))); }));
    }

    /* Project item: whenever interaction enters the photo or the next button, the title link text spins once (the original sends pointerenter to the title link) */
    box.querySelectorAll(".story__item").forEach((it) => {
      const head = it.querySelector(".story__head");
      if (!head) return;
      on(it, "pointerenter", (e) => e.pointerType === "mouse" && LH.enter(head));
      on(it, "focusin", (e) => e.target.matches(":focus-visible") && spin(head));
    });

    /* Photo slide — like the original Embla (align start · containScroll off · no loop). The interview band slides only at 768 and above */
    box.querySelectorAll("[data-slider]").forEach((sl) => {
      const view = sl.querySelector(".lh-slider__view");
      const ctrls = box.querySelectorAll(`[data-ctrl="${sl.dataset.slider}"]`);
      const pc = sl.dataset.sliderMin ? matchMedia(`(min-width: ${sl.dataset.sliderMin}px)`) : null;
      let api = null;
      const sync = () => ctrls.forEach((c) => {
        c.querySelector("[data-prev]").disabled = !api || !api.canScrollPrev();
        c.querySelector("[data-next]").disabled = !api || !api.canScrollNext();
        c.querySelector("[data-cur]").textContent = String((api ? api.selectedScrollSnap() : 0) + 1).padStart(2, "0");
      });
      const set = () => {
        const want = !!window.EmblaCarousel && view.querySelectorAll(".lh-slider__slide").length > 1 && (!pc || pc.matches);
        if (want && !api) { api = EmblaCarousel(view, { align: "start", containScroll: false, dragFree: false, loop: false }); api.on("select", sync).on("reInit", sync); }
        else if (!want && api) { api.destroy(); api = null; }
        sync();
      };
      ctrls.forEach((c) => {
        on(c.querySelector("[data-prev]"), "click", () => api && api.scrollPrev());
        on(c.querySelector("[data-next]"), "click", () => api && api.scrollNext());
      });
      if (pc) on(pc, "change", set);
      set();
      offs.push(() => api && api.destroy());
    });

    /* Video: scrolling down, it plays from 75% of the screen ahead and pauses when out of view. When playback starts it is revealed over .5s */
    box.querySelectorAll("video[data-video]").forEach((v) => {
      if (reduce) return;
      const ready = () => v.classList.add("is-ready");
      if (!v.paused && v.readyState >= 2) ready(); else on(v, "playing", ready, { once: true });
      const io = new IntersectionObserver(([e]) => { if (e && e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { rootMargin: "0px 0px 75% 0px", threshold: 0 });
      io.observe(v.closest("[data-video-root]") || v);
      offs.push(() => { io.disconnect(); v.pause(); });
    });

    /* Entry band photo parallax */
    const band = box.querySelector(".lh-entryband");
    if (band && window.gsap && !reduce) {
      gsap.fromTo(band.querySelector(".lh-entryband__img"), { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: "none", scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: true } });
    }

    const pageOff = LH.pages[page] && LH.pages[page](box);
    if (pageOff) offs.push(pageOff);
    return () => offs.splice(0).reverse().forEach((f) => f());
  }

  /* ---------- Page transition: original swup + JS plugin values — body fades out .35s (power1.out) → swap → fades back .5s. When moving to or from the home page the header band goes too ---------- */
  const OUT_DUR = 0.35, IN_DUR = 0.5;
  const isHomeUrl = (u) => /(^|\/)(index\.html)?$/.test(new URL(u, location.href).pathname);
  const parts = () => {
    const c = document.querySelector("#swup");
    const head = c && c.querySelector("header");
    const main = c && c.querySelector("main");
    if (!c) return { head: null, content: [] };
    const content = head && main && main.contains(head) ? [...main.children].filter((el) => el !== head) : main ? [main] : [];
    content.push(...[...c.children].filter((el) => el !== main && el !== head));
    return { head, content };
  };
  const fade = (dir, withHead) => {
    const { head, content } = parts();
    const h = withHead ? head : null;
    const all = [h, ...content].filter(Boolean);
    if (!all.length || !window.gsap) return Promise.resolve();
    gsap.killTweensOf(all);
    if (reduce) { gsap.set(all, { clearProps: "opacity" }); return Promise.resolve(); }
    return new Promise((done) => {
      const tl = gsap.timeline({ defaults: { overwrite: true }, onComplete: done, onInterrupt: done });
      if (dir === "out") tl.to(all, { opacity: 0, duration: OUT_DUR, ease: "power1.out" }, 0);
      else tl.fromTo(all, { opacity: 0 }, { opacity: 1, duration: IN_DUR, ease: "power1.out", clearProps: "opacity" }, 0);
    });
  };

  let unmount = () => {};
  const remount = () => { unmount(); if (window.ScrollTrigger) ScrollTrigger.getAll().forEach((t) => t.kill()); const c = document.querySelector("#swup"); unmount = c ? mount(c) : () => {}; };

  const swupOk = /^https?:$/.test(location.protocol) && window.Swup && window.SwupJsPlugin && window.SwupHeadPlugin;
  const boot = () => {
    unmount = mount(document.querySelector("#swup"));
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => LH.scrollTo(t), 400); }
    if (swupOk) bootSwup(); else bootFallback();
  };

  function bootSwup() {
    const toHash = async (hash) => {
      const t = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!t) return;
      LH.scrollTo(t, true);
      await new Promise((r) => setTimeout(r, 120));
    };
    const swup = new Swup({
      containers: ["#swup"],
      ignoreVisit: (url, { el } = {}) => {
        if (!el) return false;
        const to = new URL(url, location.href);
        if (to.hash && to.pathname === location.pathname && to.search === location.search) return true;
        return !!el.closest("[data-no-swup]");
      },
      plugins: [
        new SwupJsPlugin({ animations: [{ from: "(.*)", to: "(.*)",
          out: async (done, { visit }) => { await fade("out", visit.meta.isHomeTransition === true); },
          in: async (done, { visit }) => {
            lenis && lenis.resize();
            window.ScrollTrigger && ScrollTrigger.refresh();
            if (visit.to.hash) await toHash(visit.to.hash);
            await fade("in", visit.meta.isHomeTransition === true);
          } }] }),
        // CSS differs per page (index.css·sub.css) so it waits until the new css is attached — the original has one css set so it doesn’t wait
        new SwupHeadPlugin({ persistAssets: false, awaitAssets: true }),
      ],
    });
    swup.hooks.replace("content:scroll", (visit, args, def) => {
      const t = visit.to.hash && document.getElementById(decodeURIComponent(visit.to.hash.slice(1)));
      if (!visit.animation.animate || !t) return def(visit, args);
      scrollTo(0, 0);
      lenis && lenis.scrollTo(0, { immediate: true, force: true });
      return true;
    });
    swup.hooks.on("visit:start", (visit) => {
      visit.animation.wait = true;
      visit.meta.isHomeTransition = !!document.querySelector("#mv") || isHomeUrl(visit.to.url);
      drawerSet(false);
    });
    swup.hooks.on("animation:out:end", () => { unmount(); unmount = () => {}; });
    swup.hooks.before("content:replace", () => { unmount(); unmount = () => {}; });
    swup.hooks.on("page:view", (visit) => {
      lenis && lenis.resize();
      if (!visit.to.hash && !visit.history.popstate) lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0);
      remount();
    });
    swup.hooks.on("animation:in:end", () => window.ScrollTrigger && ScrollTrigger.refresh());
    LH.swup = swup;
  }

  /* With file:// swup cannot fetch the page — it blurs with the same values, opens the real page, and the new page returns over .5s */
  function bootFallback() {
    const page = document.querySelector("#swup").dataset.page;
    if (window.gsap && !reduce) {
      const fromHome = sessionStorage.getItem("lh-from-home") === "1";
      sessionStorage.removeItem("lh-from-home");
      if (page !== "home") fade("in", fromHome);
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank" || a.closest("[data-no-swup]")) return;
      const href = a.getAttribute("href");
      if (!/\.html(#.*)?$/.test(href)) return;
      const [file, hash] = href.split("#");
      const here = location.pathname.split("/").pop() || "index.html";
      e.preventDefault();
      drawerSet(false);
      if (file === here) { const t = hash && document.getElementById(hash); t ? LH.scrollTo(t) : lenis ? lenis.scrollTo(0) : scrollTo(0, 0); return; }
      const toHome = file === "index.html";
      if (page === "home" || toHome) sessionStorage.setItem("lh-from-home", "1");
      if (reduce || !window.gsap) { location.href = href; return; }
      fade("out", page === "home" || toHome).then(() => { location.href = href; });
    });
    addEventListener("pageshow", (e) => { if (e.persisted) { const { head, content } = parts(); [head, ...content].forEach((el) => el && (el.style.opacity = "")); } });
  }

  /* In-page #anchor links are not handled by swup — use smooth scroll instead */
  document.addEventListener("click", (e) => {
    if (!swupOk) return;
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented) return;
    const to = new URL(a.href, location.href);
    if (!to.hash || to.pathname !== location.pathname || to.search !== location.search) return;
    const t = document.getElementById(decodeURIComponent(to.hash.slice(1)));
    e.preventDefault();
    drawerSet(false);
    t ? LH.scrollTo(t) : lenis ? lenis.scrollTo(0) : scrollTo(0, 0);
  });

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
