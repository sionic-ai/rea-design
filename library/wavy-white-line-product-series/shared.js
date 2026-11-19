// Shared across several pages: first-page header (hide, phone menu), anchor scroll, mask reveal, parent-shell (sc-) header menu, search, language, phone menu, back to top.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;

  // Original anchor scroll curve = expo.out(sine.in(t)) — starts off slowly, then snaps in fast
  const sineIn = gsap.parseEase("sine.in"), expoOut = gsap.parseEase("expo.out");
  const anchorEase = (t) => expoOut(sineIn(t));
  window.sdState = { anchoring: false, snapping: false };
  const goTo = (target) => {
    sdState.anchoring = true;
    gsap.to(window, {
      duration: reduce ? 0 : 1,
      ease: anchorEase,
      scrollTo: { y: target ?? 0, autoKill: false },
      onComplete: () => { sdState.anchoring = false; },
    });
  };
  document.querySelectorAll("[data-anchor]").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      e.preventDefault();
      const el = href === "#top" ? null : document.querySelector(href);
      goTo(el);
    });
  });

  // Mask appear — when a group ([data-appear]) is within 10% of the screen top and bottom, the .sd-mask inside each runs in .8s after its own delay (data-delay)
  const groups = [...document.querySelectorAll("[data-appear]")];
  if (!reduce && groups.length) {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.querySelectorAll(".sd-mask").forEach((m) => {
          gsap.timeline({ delay: +(m.dataset.delay || 0) })
            .fromTo(m, { "--sd-p1": 0 }, { "--sd-p1": 1, duration: 0.8, ease: "power2.out" })
            .fromTo(m, { "--sd-p2": 0 }, { "--sd-p2": 1, duration: 0.8, ease: "power2.out" }, "<+=0.1");
        });
      });
    }, { rootMargin: "-10% 0px" });
    groups.forEach((g) => {
      const ms = g.matches(".sd-mask") ? [g] : [...g.querySelectorAll(".sd-mask")];
      ms.forEach((m) => gsap.set(m, { "--sd-p1": 0, "--sd-p2": 0 }));
      io.observe(g);
    });
  }

  // ── First page header: hides while scrolling down past 50px (visible at the very bottom), appears when scrolling up ──
  const head = document.querySelector(".sd-head");
  if (head) {
    let last = 0, hidden = false;
    gsap.ticker.add(() => {
      const y = scrollY;
      if (y === last) return;
      const down = y > last;
      const atEnd = Math.abs(y - (document.body.clientHeight - innerHeight)) < 1;
      const want = down && y > 50 && !atEnd;
      if (want !== hidden) head.dataset.hidden = String(want);
      hidden = want; last = y;
    });

    const btn = head.querySelector(".sd-burger");
    const menu = head.querySelector(".sd-menu");
    const body = menu?.querySelector(".sd-menu__body");
    const list = menu?.querySelector(".sd-menu__list");
    const extra = menu ? [menu.querySelector(".sd-menu__logo"), menu.querySelector(".sd-menu__corp")].filter(Boolean) : [];
    const open = () => {
      btn.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
      gsap.timeline({ defaults: { overwrite: true } })
        .set(menu, { autoAlpha: 1, y: 0 })
        .fromTo(body, { height: 0, width: 0 }, { height: "auto", width: "14.875rem", ease: "power4.out", duration: reduce ? 0 : 0.6 })
        .fromTo(list.children, { opacity: 0, x: 20 }, { opacity: 1, x: 0, ease: "power4.out", duration: reduce ? 0 : 1, stagger: { each: 0.1 } }, "<+=0.1")
        .fromTo(extra, { opacity: 0 }, { opacity: 1, ease: "none", duration: reduce ? 0 : 0.6 }, "<+=0.3");
    };
    const close = () => {
      btn.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      gsap.timeline({ defaults: { overwrite: true } }).to(menu, { autoAlpha: 0, y: -10, ease: "power4.out", duration: reduce ? 0 : 0.6 });
    };
    if (btn && menu) {
      btn.addEventListener("click", () => (btn.getAttribute("aria-expanded") === "true" ? close() : open()));
      menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
      const outside = (e) => { if (!e.target.closest(".sd-menu__body")) close(); };
      menu.addEventListener("click", outside);
      menu.addEventListener("touchstart", outside, { passive: true });
    }
  }

  // ── Parent company shell ──
  const sc = document.querySelector(".sc-head");
  if (sc) {
    const mega = [...sc.querySelectorAll(".sc-lnav__item")];
    const shade = sc.querySelector(".sc-head__overlay");
    let openId = null;
    const show = (id) => {
      openId = id;
      mega.forEach((m) => m.classList.toggle("is-open", m.dataset.id === id));
      sc.querySelectorAll("[data-lnav]").forEach((a) => a.classList.toggle("is-current", a.dataset.lnav === id));
      shade?.classList.toggle("is-open", !!id);
    };
    // The original opens the bottom menu on press, and closes it on pressing the same menu again or pressing close or outside
    sc.querySelectorAll("[data-lnav]").forEach((a) => {
      a.addEventListener("click", (e) => { e.preventDefault(); show(openId === a.dataset.lnav ? null : a.dataset.lnav); });
    });
    mega.forEach((m) => m.querySelector("[data-close]")?.addEventListener("click", () => show(null)));
    shade?.addEventListener("click", () => show(null));

    // After scrolling down by the top row height (41px), only the bottom row remains and sticks — wide screens only
    const wide = matchMedia("(min-width: 981px)");
    const fix = () => document.body.classList.toggle("is-scfixed", wide.matches && scrollY >= 38);
    addEventListener("scroll", fix, { passive: true });
    wide.addEventListener("change", fix);
    fix();

    // Q&A — jQuery slideDown · slideUp defaults (400ms swing)
    document.querySelectorAll(".sc-qa__q").forEach((q) => q.addEventListener("click", () => {
      const item = q.parentElement, a = item.querySelector(".sc-qa__a");
      const on = !item.classList.contains("is-open");
      item.classList.toggle("is-open", on);
      gsap.to(a, { height: on ? "auto" : 0, duration: reduce ? 0 : 0.4, ease: "sine.inOut", overwrite: true });
    }));

    const toggle = (btnSel, panelSel) => {
      const panel = sc.querySelector(panelSel);
      sc.querySelectorAll(btnSel).forEach((b) => b.addEventListener("click", () => {
        const on = !panel.classList.contains("is-open");
        sc.querySelectorAll(".sc-search, .sc-lang").forEach((p) => p.classList.remove("is-open"));
        panel.classList.toggle("is-open", on);
        b.setAttribute("aria-expanded", String(on));
      }));
    };
    toggle(".sc-searchbtn", ".sc-search");
    toggle(".sc-langbtn", ".sc-lang");

    const drawer = sc.querySelector(".sc-drawer");
    sc.querySelector(".sc-menubtn")?.addEventListener("click", () => { drawer.classList.add("is-open"); shade?.classList.add("is-open"); });
    drawer?.querySelector("[data-close]")?.addEventListener("click", () => { drawer.classList.remove("is-open"); shade?.classList.remove("is-open"); });
    drawer?.querySelectorAll(".sc-acc__ttl").forEach((t) => t.addEventListener("click", () => {
      const item = t.parentElement;
      const kid = item.querySelector(".sc-acc__child");
      const on = !item.classList.contains("is-open");
      item.classList.toggle("is-open", on);
      gsap.to(kid, { height: on ? "auto" : 0, duration: reduce ? 0 : 0.3, ease: "power1.out" });
    }));

    // Back to top — appears after scrolling down more than one screen
    const top = document.querySelector(".sc-pagetop");
    if (top) {
      const upd = () => top.classList.toggle("is-show", scrollY > innerHeight * 0.5);
      addEventListener("scroll", upd, { passive: true });
      upd();
      top.addEventListener("click", () => gsap.to(window, { duration: reduce ? 0 : 0.6, ease: "power2.out", scrollTo: { y: 0, autoKill: false } }));
    }
  }
})();
