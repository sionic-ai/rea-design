// Site-wide motion: lenis smooth scroll · swup (parallel) page transitions and the top-left title swap · a work photo growing into the detail’s first photo ·
// Header row hide/show · menu drawer · loader · Hero slideshow and list link · per-section reveal · contact panel and footer stagger
(() => {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hoverable = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
  const wide = () => matchMedia("(min-width: 960px)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  CustomEase.create("hbPage", "0.67,0.14,0,0.99");
  CustomEase.create("hbChar", "0.56,0.15,0,0.99");

  // Original lenis 1.2.3: only the easing is changed (1-(1-t)^3), the rest is the default lerp .1, driven by the gsap ticker
  const lenis = new Lenis({ easing: (t) => --t * t * t + 1 });
  window.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ───── Header row: scrolling down slides the menu up out, scrolling up brings it down with a white band ─────
  const header = document.querySelector(".hb-header");
  const bar = header?.querySelector(".hb-header__bar");
  const navs = header ? [header.querySelector(".hb-header__nav"), header.querySelector(".hb-header__contact")].filter(Boolean) : [];
  let lastY = 0;
  const onScrollHeader = (y) => {
    if (!bar) return;
    const up = y < lastY || y < 10;
    if (Math.abs(y - lastY) > 2 || y < 10) {
      bar.classList.toggle("is-scroll-up", up);
      navs.forEach((n) => (n.inert = !up));
    }
    lastY = y;
  };
  lenis.on("scroll", ({ scroll }) => onScrollHeader(scroll));
  const setHeaderTop = (on) => header?.classList.toggle("is-top", on);
  const setHeaderWhite = (on) => header?.classList.toggle("is-white", on);
  const markCurrent = (page) => header?.querySelectorAll(".hb-header__nav a").forEach((a) => a.toggleAttribute("aria-current", a.dataset.pageName === page));
  // Top-left logo: original x-show="pageName !== 'top' || isLogoShow || isOpen" — isLogoShow fires when the first page’s work section has fully left the screen
  // Put the state indicator on the logo itself — just as the original x-show changes the logo’s style
  const logoEl = header?.querySelector(".hb-header__logo");
  const logo = { page: true, past: false, open: false, on: !logoEl?.classList.contains("is-off"), timer: 0 };
  const syncLogo = () => {
    if (!logoEl) return;
    const on = logo.page || logo.past || logo.open;
    if (on === logo.on) return;
    logo.on = on;
    clearTimeout(logo.timer);
    if (on) {
      // Same order as x-transition: enter mark (shape unchanged) → space appears on the next frame → fades in over .55s on the frame after
      logoEl.classList.add("is-enter");
      requestAnimationFrame(() => {
        logoEl.classList.remove("is-off", "is-out");
        logoEl.classList.add("is-pre");
        requestAnimationFrame(() => {
          logoEl.classList.remove("is-pre");
          logo.timer = setTimeout(() => logoEl.classList.remove("is-enter"), 600);
        });
      });
    } else {
      logoEl.classList.remove("is-enter");
      logoEl.classList.add("is-out");
      logo.timer = setTimeout(() => { logoEl.classList.add("is-off"); logoEl.classList.remove("is-out"); }, 300);
    }
  };
  const setLogoNow = (on) => { logo.on = on; logoEl?.classList.toggle("is-off", !on); logoEl?.classList.remove("is-pre", "is-out"); };

  // ───── Menu drawer ─────
  const body = document.body;
  const toggleBtn = header?.querySelector(".hb-toggle");
  const dialog = document.querySelector(".hb-dialog");
  const dialogBg = document.querySelector(".hb-dialog-bg");
  let menuOpen = false;
  const apply = (open) => {
    if (open !== menuOpen) return;
    header.classList.toggle("is-open", open);
    body.classList.toggle("is-menu-open", open);
    dialog.classList.toggle("is-active", open);
    dialogBg?.classList.toggle("is-show", open);
  };
  const setMenu = (open) => {
    if (!dialog || open === menuOpen) return;
    menuOpen = open;
    toggleBtn?.setAttribute("aria-expanded", String(open));
    toggleBtn?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    open ? lenis.stop() : lenis.start();
    // The logo runs in x-show order (show → next frame position → then the frame appears) starting now — the appearance sits in the same frame as the drawer panel
    logo.open = open;
    syncLogo();
    // The original turns on isOpen in the next tick ($nextTick) after showModal(), so opening starts about two frames late — closing is immediate
    if (open) requestAnimationFrame(() => requestAnimationFrame(() => apply(true)));
    else apply(false);
  };
  toggleBtn?.addEventListener("click", () => setMenu(!menuOpen));
  dialogBg?.addEventListener("click", () => setMenu(false));
  dialog?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // ───── Underline link: once on entry, and not re-triggered during the .7s while the line clears and is drawn again ─────
  document.addEventListener("mouseover", (e) => {
    if (!hoverable()) return;
    const a = e.target.closest?.(".hb-uline, .hb-dialog__nav a, .hb-filter__trigger, .hb-arrow-link");
    if (!a || a.contains(e.relatedTarget) || a.dataset.hbBusy) return;
    a.dataset.hbBusy = "1";
    a.classList.add("is-hovering");
    const lock = a.classList.contains("hb-arrow-link");
    setTimeout(() => {
      delete a.dataset.hbBusy;
      if (!lock || !a.matches(":hover")) a.classList.remove("is-hovering");
    }, 700);
  });
  document.addEventListener("mouseout", (e) => {
    const a = e.target.closest?.(".hb-arrow-link");
    if (a && !a.contains(e.relatedTarget) && !a.dataset.hbBusy) a.classList.remove("is-hovering");
  });

  // ───── Per section: entrance · auto slide · parallax ─────
  const io = (els, cls, margin, once = true) => {
    const ob = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add(cls); if (once) ob.unobserve(en.target); }
      else if (!once) en.target.classList.remove(cls);
    }), { rootMargin: margin });
    els.forEach((el) => ob.observe(el));
    return ob;
  };
  const autoSlides = (items, ms, onTick) => {
    let i = 0;
    const id = setInterval(() => {
      const prev = i;
      i = (i + 1) % items.length;
      items.forEach((it, k) => { it.classList.toggle("is-active", k === i); it.classList.toggle("is-leave", k === prev); it.classList.remove("is-first"); });
      onTick?.(i);
    }, ms);
    return () => clearInterval(id);
  };

  const common = (root, offs) => {
    root.querySelectorAll(".hb-fadein-list").forEach((l) => [...l.children].forEach((c, k) => c.style.setProperty("--index", k)));
    offs.push(io([...root.querySelectorAll(".hb-split, .hb-fadein-list, .hb-fadein")], "is-inview", "-10% 0px -10% 0px"));
    const contact = root.querySelector(".hb-contact");
    if (contact) {
      offs.push(io([contact.querySelector(".hb-contact__link")], "is-inview", "-5% 0px -5% 0px"));
      offs.push({ disconnect: autoSlides([...contact.querySelectorAll(".hb-contact__img-item")], 4500) });
      const bg = contact.querySelector(".hb-contact__bg-in");
      if (!reduce) gsap.fromTo(bg, { scale: wide() ? 1.12 : 1.08, y: wide() ? -400 : -250 }, { scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: contact, start: "top bottom", end: wide() ? "bottom center" : "bottom top", scrub: 0, invalidateOnRefresh: true } });
    }
  };

  // ───── First page: slideshow ↔ title ↔ list order ─────
  const home = (root, offs) => {
    const top = root.querySelector(".hb-top");
    if (!top) return;
    const show = top.querySelector(".hb-kv__wrapper");
    const title = top.querySelector(".hb-kv__title-text");
    const items = [...top.querySelectorAll(".hb-top__item:not(.hb-top__slot)")];
    const info = top.querySelector(".hb-kv__info");
    let active = 0, scrolled = false;
    const names = items.map((li) => li.querySelector(".hb-row__name")?.textContent.trim() || "");
    const reorder = () => {
      const d = items.length;
      items.forEach((li, k) => { li.classList.toggle("is-current", k === active); li.style.order = String((k - active + d) % d); });
      const row = items[active]?.querySelector(".hb-row");
      if (!row) return;
      info.replaceChildren(row.cloneNode(true));
      info.firstElementChild.classList.add("hb-kv__row");
      top.querySelector(".hb-top__slot .hb-row")?.replaceWith(row.cloneNode(true));
    };
    const more = top.querySelector(".hb-kv__more-link");
    show?.addEventListener("fx:slide", (e) => {
      active = e.detail.index;
      // Like the original, ”See Work Detail” can’t be clicked during the 1.1s transition (:inert=isSlideChanging) — the underline retracts too
      if (more) { more.inert = true; setTimeout(() => { more.inert = false; }, 1100); }
      title?.dispatchEvent(new CustomEvent("fx:retitle", { detail: { text: names[active] } }));
    });
    reorder();
    const setScrolled = (on) => {
      if (on === scrolled) return;
      scrolled = on;
      top.classList.toggle("is-scrolled", on);
      if (on) { show?.dispatchEvent(new CustomEvent("fx:pause")); reorder(); }
      else if (body.classList.contains("is-loaded") || html.classList.contains("from-swup")) show?.dispatchEvent(new CustomEvent("fx:play"));
    };
    const onScroll = ({ scroll }) => setScrolled(wide() ? scroll > 250 : scroll > 20);
    const off = lenis.on("scroll", onScroll);
    offs.push({ disconnect: () => off?.() });
    // While the panel is attached, the header row has white text and no band
    setHeaderTop(true); setHeaderWhite(true);
    // Logo shows only when the whole work section is off screen (original setTopIo)
    const topIo = new IntersectionObserver(([en]) => { logo.past = !en.isIntersecting; syncLogo(); });
    topIo.observe(top);
    offs.push(topIo);
    ScrollTrigger.create({
      trigger: top, start: "top top", endTrigger: top.querySelector('[data-fx-part="slot"]'), end: "center center",
      onLeave: () => { setHeaderWhite(false); setHeaderTop(false); },
      onEnterBack: () => { setHeaderWhite(true); setHeaderTop(true); },
    });
    const aboutSlide = root.querySelector(".hb-about__slide");
    if (aboutSlide) {
      offs.push(io([aboutSlide], "is-inview", "0px", false));
      offs.push({ disconnect: autoSlides([...aboutSlide.querySelectorAll(".hb-about__item")], 6000) });
    }
    return show;
  };

  const works = (root, offs) => {
    const f = root.querySelector(".hb-filter");
    if (!f) return;
    const btn = f.querySelector(".hb-filter__trigger");
    const set = (open) => { f.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); };
    btn.addEventListener("click", () => set(!f.classList.contains("is-open")));
    const out = (e) => { if (!f.contains(e.target)) set(false); };
    document.addEventListener("click", out);
    f.querySelector(".hb-filter__reset")?.addEventListener("click", () => f.querySelectorAll("input").forEach((i) => (i.checked = false)));
    offs.push({ disconnect: () => document.removeEventListener("click", out) });
  };

  const detail = (root) => {
    root.querySelectorAll(".hb-dhead__toggle").forEach((b) => b.addEventListener("click", () => {
      const head = b.closest(".hb-dhead");
      const open = !head.classList.contains("is-open");
      head.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", String(open));
      setTimeout(() => ScrollTrigger.refresh(), 700);
    }));
  };

  let ctx = null, offs = [];
  const boot = (root) => {
    const page = root.dataset.page;
    offs = [];
    let show = null;
    markCurrent(page);
    if (page !== "home") { setHeaderTop(false); setHeaderWhite(false); }
    logo.page = page !== "home";
    logo.past = false;
    if (page === "home" && !html.classList.contains("from-swup")) setLogoNow(false);
    else syncLogo();
    ctx = gsap.context(() => {
      common(root, offs);
      if (page === "home") show = home(root, offs);
      if (page === "works") works(root, offs);
      if (page === "detail") detail(root);
    }, root);
    return show;
  };
  const teardown = () => {
    offs.forEach((o) => o.disconnect?.());
    offs = [];
    ctx?.revert();
    ctx = null;
  };

  // Footer rises up from behind the Contact panel, starting at −15% (phone −5%)
  const footer = document.querySelector(".hb-footer");
  if (footer) {
    io([footer], "is-inview", "0px 0px -5% 0px", false);
    if (!reduce) gsap.fromTo(footer.querySelector(".hb-footer__inner"), { yPercent: () => (wide() ? -15 : -5) }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true } });
  }

  // ───── First open: loader on the first page ─────
  const first = document.getElementById("swup");
  const show0 = boot(first);
  requestAnimationFrame(() => html.classList.add("is-ready"));
  if (first.dataset.page === "home" && !reduce) {
    first.querySelector(".hb-op__progress")?.style.setProperty("--random", String(Math.floor((Math.random() * 0.6 + 0.4) * 100) / 100));
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.stop();
    // In the original, is-loaded is set after the first slide image loads (min .9s). Counting the actual image download time too, we set the document start to 3.3s (measured: the original loader screen changes over 5.1s).
    addEventListener("load", async () => {
      const spent = performance.now();
      if (spent < 3300) await wait(3300 - spent);
      body.classList.add("is-loaded");
      await wait(1850);
      lenis.start();
      await wait(50);
      show0?.dispatchEvent(new CustomEvent("fx:play"));
    }, { once: true });
  } else {
    body.classList.add("is-loaded");
    show0?.dispatchEvent(new CustomEvent("fx:play"));
  }

  // ───── Page transition (swup 4.8 + parallel): the current page moves down 40px while blurring and the new page rises from −40px ─────
  if (!/^https?:$/.test(location.protocol) || !window.Swup) return;
  const ptitle = document.querySelector(".hb-ptitle__t");
  const loading = document.querySelector(".hb-ptitle__loading");
  const sharedLayer = document.querySelector(".hb-shared-img");
  let shared = null;
  const plugins = [new SwupParallelPlugin({ containers: ["#swup"] })];
  if (window.SwupPreloadPlugin) plugins.push(new SwupPreloadPlugin());
  if (window.SwupHeadPlugin) plugins.push(new SwupHeadPlugin({ awaitAssets: true }));
  const swup = new Swup({ containers: ["#swup"], animationSelector: "#swup", plugins });

  swup.hooks.on("visit:start", (visit) => {
    body.classList.add("is-swup-start");
    html.classList.add("from-swup");
    const prev = document.getElementById("swup");
    prev.style.setProperty("--hb-lock-top", `${-lenis.animatedScroll}px`);
    if (prev.dataset.page === "home") prev.classList.add("no-translate");
    shared = null;
    const el = visit.trigger?.el;
    if (el?.hasAttribute("data-hb-shared") && /detail\.html/.test(visit.to.url)) {
      const box = el.matches(".hb-kv__more-link") ? prev.querySelector(".hb-kv__slide.is-active .hb-kv__zoom") : el.querySelector(".hb-photo, .hb-kv__zoom") || el.closest(".hb-kv__slide")?.querySelector(".hb-kv__zoom");
      if (box) {
        const r = box.getBoundingClientRect();
        const img = box.querySelector(".wf-img")?.cloneNode(true);
        if (img) {
          sharedLayer.replaceChildren(img);
          gsap.set(sharedLayer, { x: r.left, y: r.top, width: r.width, height: r.height, opacity: 1 });
          box.style.opacity = "0";
          shared = true;
        }
      }
    }
    teardown();
    lenis.stop();
  });

  swup.hooks.on("content:replace", () => {
    const next = document.getElementById("swup");
    lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    // Top-left title: matching letters slide and only the rest swap. If only new letters are missing, rest 1s and finish
    const nextTitle = next.querySelector("[data-in-title]")?.textContent.trim() || "";
    const curTitle = ptitle?.getAttribute("aria-label") || "";
    if (ptitle) {
      html.classList.add("is-title-change");
      const shareAny = [...nextTitle].some((c) => c.trim() && curTitle.includes(c));
      ptitle.dispatchEvent(new CustomEvent("fx:retitle", { detail: { text: nextTitle } }));
      const cw = ptitle.getBoundingClientRect().width;
      requestAnimationFrame(() => {
        const nw = ptitle.querySelector(".fx-retitle__next")?.getBoundingClientRect().width ?? 0;
        gsap.set(loading, { opacity: 0 });
        gsap.to(loading, { opacity: 1, delay: 0.2, duration: 0.1 });
        gsap.fromTo(loading, { x: 0 }, { x: nw - cw, duration: 0.8, ease: "hbChar" });
      });
      setTimeout(() => { html.classList.remove("is-title-change"); gsap.set(loading, { x: 0 }); }, shareAny ? 1100 : 1000);
    }
    if (shared) {
      const mv = next.querySelector("#main-visual");
      if (mv) {
        mv.style.opacity = "0";
        const r = mv.getBoundingClientRect();
        gsap.to(sharedLayer, { x: r.left, y: r.top, width: r.width, height: r.height, duration: 0.8, delay: 0.1, ease: "hbPage", onComplete: () => {
          mv.style.opacity = "";
          gsap.to(sharedLayer, { opacity: 0, duration: 0.2, onComplete: () => sharedLayer.replaceChildren() });
        } });
      } else gsap.set(sharedLayer, { opacity: 0 });
    }
    const show = boot(next);
    // fx-core attaches the new plane in the next microtask, so wake it one frame later
    if (next.dataset.page === "home") requestAnimationFrame(() => show?.dispatchEvent(new CustomEvent("fx:play")));
    if (footer) footer.hidden = next.dataset.page === "detail";
    ScrollTrigger.refresh();
  });

  swup.hooks.on("visit:end", () => {
    body.classList.remove("is-swup-start");
    lenis.start();
    ScrollTrigger.refresh();
  });
  if (footer) footer.hidden = first.dataset.page === "detail";
})();
