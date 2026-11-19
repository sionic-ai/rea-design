// Interaction shared by five sheets — menu bar pill, menu drawer, button ripple and loading state, accordion, staggered rise, cookie bar, benefits window
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const site = (window.site = window.site || {});

  // ---- Menu bar: becomes a pill after scrolling past 50px on PC ----
  const nav = document.querySelector(".p-nav");
  if (nav) {
    let scrolled = false;
    const onScroll = () => {
      const want = innerWidth >= 992 && scrollY > 50;
      if (want === scrolled) return;
      scrolled = want;
      nav.classList.toggle("is-scrolled", want);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  // ---- Menu drawer ----
  const menu = document.querySelector(".p-menu");
  const veil = document.querySelector(".p-menu-veil");
  const burger = document.querySelector(".p-nav__burger");
  const lock = (on) => {
    document.body.style.overflow = on ? "hidden" : "";
    if (site.lenis) on ? site.lenis.stop() : site.lenis.start();
  };
  const closeMenu = () => {
    if (!menu || !menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    veil.classList.remove("is-visible");
    burger.setAttribute("aria-expanded", "false");
    lock(false);
  };
  if (menu && burger) {
    burger.addEventListener("click", (e) => {
      e.preventDefault();
      menu.classList.add("is-open");
      veil.classList.add("is-visible");
      burger.setAttribute("aria-expanded", "true");
      lock(true);
    });
    menu.querySelector(".p-menu__close").addEventListener("click", closeMenu);
    veil.addEventListener("click", closeMenu);
    addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  // Placeholder links (#) go to other pages in the original — keep them in place so they don’t jump to the top and change the menu pill·hover together
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  // ---- Button: ripple .6s on press. Buttons going to another page spin a ring during the transition (released .8s later for anchors) ----
  const ripple = (btn) => {
    const r = document.createElement("span");
    r.className = "p-btn__ripple";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 600);
  };
  document.querySelectorAll(".p-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-loading")) return;
      ripple(btn);
      const href = btn.getAttribute("href");
      if (!href || href === "#") return;
      btn.classList.add("is-loading");
      if (href.startsWith("#")) setTimeout(() => btn.classList.remove("is-loading"), 800);
    });
    btn.addEventListener("touchstart", () => ripple(btn), { passive: true });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) document.querySelectorAll(".p-btn.is-loading").forEach((b) => b.classList.remove("is-loading")); });

  // ---- Accordion: only one opens per group ----
  site.accordion = (box) => {
    box.querySelectorAll(".p-acc__item").forEach((item) => {
      const q = item.querySelector(".p-acc__q");
      const a = item.querySelector(".p-acc__a");
      q.addEventListener("click", () => {
        const open = !item.classList.contains("is-open");
        box.querySelectorAll(".p-acc__item.is-open").forEach((o) => {
          if (o === item) return;
          o.classList.remove("is-open");
          o.querySelector(".p-acc__q").setAttribute("aria-expanded", "false");
          const oa = o.querySelector(".p-acc__a");
          oa.style.height = oa.scrollHeight + "px";
          requestAnimationFrame(() => (oa.style.height = "0px"));
        });
        item.classList.toggle("is-open", open);
        q.setAttribute("aria-expanded", String(open));
        a.style.height = (open ? 0 : a.scrollHeight) + "px";
        requestAnimationFrame(() => (a.style.height = open ? a.scrollHeight + "px" : "0px"));
        if (open) a.addEventListener("transitionend", function done() { a.removeEventListener("transitionend", done); if (item.classList.contains("is-open")) a.style.height = "auto"; });
      });
    });
  };
  document.querySelectorAll("[data-acc]").forEach(site.accordion);

  // ---- Staggered rise: once when 15% is visible and lifted 10% above the screen bottom ----
  const groups = document.querySelectorAll("[data-stagger]");
  if (groups.length) {
    groups.forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--i", i)));
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-visible");
      io.unobserve(en.target);
    }), { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });
    groups.forEach((g) => io.observe(g));
  }

  // ---- Cookie band ----
  const cookie = document.querySelector(".p-cookie");
  if (cookie) {
    if (sessionStorage.getItem("p-cookie") === "1") cookie.remove();
    else cookie.querySelector(".p-cookie__ok").addEventListener("click", () => {
      cookie.classList.add("is-gone");
      sessionStorage.setItem("p-cookie", "1");
    });
  }

  // ---- Benefit window: counts only while the screen is visible, fires once when 15 seconds are up (once per session) ----
  const offer = document.querySelector(".p-offer");
  if (offer) {
    const close = () => { offer.classList.remove("is-visible"); lock(false); };
    offer.querySelector(".p-offer__close").addEventListener("click", close);
    offer.querySelectorAll(".p-offer__opt").forEach((b) => b.addEventListener("click", close));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && offer.classList.contains("is-visible")) close(); });
    if (sessionStorage.getItem("p-offer") !== "1") {
      let seen = 0;
      let last = performance.now();
      const tick = setInterval(() => {
        const now = performance.now();
        if (document.visibilityState !== "hidden") seen += now - last;
        last = now;
        if (seen < 15000) return;
        clearInterval(tick);
        sessionStorage.setItem("p-offer", "1");
        offer.classList.add("is-visible");
        lock(true);
      }, 250);
    }
  }

  // ---- Signup box: clicking a small image slides the large image row in .55s ----
  document.querySelectorAll(".p-buy__gallery").forEach((g) => {
    const track = g.querySelector(".p-buy__track");
    const thumbs = [...g.querySelectorAll(".p-buy__thumb")];
    thumbs.forEach((t, k) => t.addEventListener("click", () => {
      thumbs.forEach((o, i) => o.classList.toggle("is-active", i === k));
      track.style.transform = `translateX(${-k * 100}%)`;
    }));
  });

  site.reduce = reduce;
  root.classList.add("is-ready");
})();
