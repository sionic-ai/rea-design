// Common to all pages: draws in the header (layered blur, submenu, drawer) and the bottom, and hooks up Lenis, first-visit intro, page transition and scroll reveal.
// Original values: Lenis 1.0.10 lerp .2·wheel 1 (Safari .8) · intro items 1s Power3.out stagger .08 (after 1s) → circle 2.5s Power4.inOut → curtain 1s · transition .6s expo.inOut (delay .3, 1 inside drawer)/on entry .6s Power4.out (delay .1)
//           Reveal happens once at 20% before the screen bottom — fade 1.2s cubic-bezier(.165,.84,.44,1) · mask 1.8s cubic-bezier(0,.4,.48,1)(css)
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const SU = (window.SU = { reduced });

  // Thin placeholder wordmark written fresh in place of the original logo
  const word = `<svg viewBox="0 0 160 34" aria-hidden="true"><text x="80" y="26" text-anchor="middle" style="font-family: var(--kf-font-sans)" font-weight="200" font-size="30" letter-spacing="7">logo</text></svg>`;
  // A newly drawn single bloom instead of the original violet illustration
  SU.flower = `<svg viewBox="0 0 34 72" aria-hidden="true"><path d="M17 70C16 56 18 44 17 30" fill="none" style="stroke: var(--site-stem)" stroke-width="1.2"/><path d="M17 52c-8-2-12-8-12-14 7 1 11 6 12 14zM17.4 46c6-4 11-4 13-1-4 4-8 4-13 1z" style="fill: var(--site-leaf)"/><g style="fill: var(--site-violet)"><ellipse cx="11" cy="17" rx="5" ry="7" transform="rotate(-30 11 17)"/><ellipse cx="23" cy="17" rx="5" ry="7" transform="rotate(30 23 17)"/><ellipse cx="17" cy="9" rx="4.5" ry="6.5"/><ellipse cx="12" cy="26" rx="4.5" ry="6" transform="rotate(30 12 26)"/><ellipse cx="22" cy="26" rx="4.5" ry="6" transform="rotate(-30 22 26)"/></g><circle cx="17" cy="20" r="2.2" style="fill: var(--site-pistil)"/></svg>`;
  const ig = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>`;

  const NAV = [
    ["concept", "about.html", "About"],
    ["styling", "service.html", "Outfit · Hair", "drop-style"],
    ["lineup", "#", "Lineup", "drop-lineup"],
    ["photo plan", "#", "Photo plan"],
    ["salon", "#", "Salon"],
    ["faq", "#", "Frequently asked questions"],
    ["news", "news.html", "News"],
  ];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "su-header";
    head.innerHTML = `
      <div class="su-header__blur" aria-hidden="true"><div></div><div></div><div></div><div></div><div></div><div></div></div>
      <div class="su-header__in">
        <a class="su-logo" href="index.html" aria-label="Home">${word}</a>
        <nav class="su-gnav" aria-label="Main menu"><ul>
          ${NAV.map(([en, h, , d]) => `<li${d ? ` data-drop="${d}"` : ""}><a href="${h}">${en}${d ? '<span class="plus"></span>' : ""}</a></li>`).join("")}
          <li><a href="#" aria-label="SNS">${ig}</a></li>
        </ul></nav>
        <a class="su-cta" href="#">Booking · Consultation</a>
        <button class="su-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i><i></i></button>
      </div>
      <div class="su-drop" id="drop-style" data-slot="dropdown"><ul><li><a href="service.html#costume">Sub Menu 1</a></li><li><a href="service.html#dress">Sub Menu 2</a></li><li><a href="service.html#hair">Sub Menu 3</a></li></ul></div>
      <div class="su-drop" id="drop-lineup" data-slot="dropdown"><ul><li><a href="#">Sub Menu 1</a></li><li><a href="#">Sub Menu 2</a></li><li><a href="#">Sub Menu 3</a></li><li><a href="#">Sub Menu 4</a></li><li><a href="#">Sub Menu 5</a></li></ul></div>`;
    document.body.insertAdjacentHTML("afterbegin", `
      <div class="su-drawer" data-slot="menu-drawer" data-lenis-prevent><ul>
        ${NAV.map(([en, h, ko]) => `<li><a href="${h}">${en}<small>${ko}</small></a></li>`).join("")}
      </ul></div>`);
  }

  // First-visit intro — the original has it on every page (arriving from another site, a handwritten greeting comes first on any page)
  if (!document.querySelector(".su-intro")) document.body.insertAdjacentHTML("afterbegin", `
    <div class="su-intro" data-slot="intro-loader" aria-hidden="true">
    <div class="su-intro__overlay"></div>
    <div class="su-intro__in">
    <div class="su-intro__catch">
    <svg data-intro-item viewBox="0 0 161 30"><path d="M4 22c6-14 10-16 12-14s-2 12-6 14 2-14 10-14 8 6 4 10-8 4-6 0M30 20c4-6 8-6 8-2s-6 6-4 2 6-4 10-2M46 20c2-6 6-8 8-4s0 6 4 2M60 22l2-2"/></svg>
    <span class="line" data-intro-item></span>
    </div>
    <div class="su-intro__ind" data-intro-item><svg viewBox="0 0 68 68"><circle class="bg" cx="34" cy="34" r="32"/><circle class="fg" cx="34" cy="34" r="32"/></svg></div>
    </div>
    </div>`);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "su-footer";
    const link = (ja, en) => `<li><a class="su-footer__link" href="#"><span class="ja">${ja}</span><span class="en">${en}</span><span class="dot"></span></a></li>`;
    foot.innerHTML = `
      <ul class="su-footer__top su-container">${link("Frequently asked questions", "faq")}${link("Reservation", "reserve")}${link("Inquiry", "contact")}</ul>
      <div class="su-medal"><span class="su-medal__oval">${SU.flower}</span></div>
      <nav class="su-footer__nav" aria-label="Bottom Menu">
        <ul><li><a href="about.html">concept</a></li></ul>
        <ul><li><a href="service.html">styling</a><ul><li><a href="service.html#costume">Sub 1</a></li><li><a href="service.html#dress">Sub 2</a></li><li><a href="service.html#hair">Sub 3</a></li></ul></li></ul>
        <ul><li><a href="#">lineup</a><ul><li><a href="#">Sub 1</a></li><li><a href="#">Sub 2</a></li><li><a href="#">Sub 3</a></li><li><a href="#">Sub 4</a></li><li><a href="#">Sub 5</a></li></ul></li></ul>
        <ul><li><a href="#">photo plan</a></li><li><a href="#">salon</a></li><li><a href="#">faq</a></li><li><a href="news.html">news</a></li></ul>
        <ul><li><a href="#">reserve</a></li><li><a href="#">contact</a></li></ul>
        <ul><li><a href="#" aria-label="SNS">${ig.replace("<svg", '<svg width="16" height="16"')}</a></li></ul>
      </nav>
      <a class="su-footer__word" href="index.html" aria-label="Home">${word}</a>
      <p class="su-footer__btm"><a href="#">privacy policy</a><br>© 0000 brand name All Rights Reserved.</p>`;
  }
  document.querySelectorAll("[data-flower]").forEach((el) => (el.innerHTML = SU.flower));

  const header = document.querySelector(".su-header");
  const hero = document.querySelector("[data-hero]");
  if (hero && header) {
    new IntersectionObserver(([e]) => header.classList.toggle("is-hero", e.isIntersecting), { threshold: 0.15 }).observe(hero);
  }
  document.querySelectorAll("[data-is-dark]").forEach((sec) =>
    ScrollTrigger.create({
      trigger: sec, start: () => `-${header.clientHeight}px top`, end: () => `bottom ${header.clientHeight}px`,
      onToggle: (st) => header.classList.toggle("is-dark", st.isActive),
    })
  );

  // Submenu: opens on trigger hover, closes 120ms after leaving
  let closeTimer;
  const drops = [...document.querySelectorAll(".su-drop")];
  const closeAll = () => { drops.forEach((d) => d.classList.remove("is-open")); document.querySelectorAll("[data-drop]").forEach((l) => l.classList.remove("is-open")); };
  const gnavLinks = [...document.querySelectorAll(".su-gnav a")];
  gnavLinks.forEach((a) => {
    a.addEventListener("mouseenter", () => gnavLinks.forEach((l) => l !== a && l.classList.add("is-inactive")));
    a.addEventListener("mouseleave", () => gnavLinks.forEach((l) => l.classList.remove("is-inactive")));
  });
  document.querySelectorAll(".su-gnav li").forEach((li) =>
    li.addEventListener("mouseenter", () => {
      clearTimeout(closeTimer);
      closeAll();
      if (!li.dataset.drop) return;
      li.classList.add("is-open");
      document.getElementById(li.dataset.drop).classList.add("is-open");
    })
  );
  const later = () => { clearTimeout(closeTimer); closeTimer = setTimeout(closeAll, 120); };
  document.querySelector(".su-gnav")?.addEventListener("mouseleave", later);
  drops.forEach((d) => { d.addEventListener("mouseenter", () => clearTimeout(closeTimer)); d.addEventListener("mouseleave", later); });
  addEventListener("scroll", () => drops.some((d) => d.classList.contains("is-open")) && closeAll(), { passive: true });

  const burger = document.querySelector(".su-burger");
  const drawer = document.querySelector(".su-drawer");
  burger?.addEventListener("click", () => {
    const open = !drawer.classList.contains("is-open");
    drawer.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    SU.lenis?.[open ? "stop" : "start"]();
  });

  const pageEl = document.getElementById("page");
  const intro = document.querySelector(".su-intro");
  const firstVisit = intro && !document.referrer.startsWith(location.origin === "null" ? "file:" : location.origin);
  const loaded = () => { document.body.classList.add("loaded"); document.dispatchEvent(new CustomEvent("su:loaded")); };

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    if (ctx.conditions.still) {
      gsap.set(pageEl, { opacity: 1 });
      document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
      intro?.remove();
      loaded();
      return;
    }

    // The original makes only one browser follow almost instantly with lerp .8, and runs Lenis on its own rAF
    const safari = /safari/i.test(navigator.userAgent) && !/chrome|chromium|crios/i.test(navigator.userAgent);
    const LenisCtor = window.Lenis || window.lenis;
    SU.lenis = new LenisCtor({ lerp: safari ? 0.8 : 0.2, wheelMultiplier: 1 });
    SU.lenis.on("scroll", ScrollTrigger.update);
    let rafId;
    const raf = (t) => { SU.lenis.raf(t); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);

    // The original starts the intro or entrance after window load (including photos and fonts) — blank background until then
    const start = () => {
    if (firstVisit) {
      intro.classList.add("is-on");
      gsap.set(pageEl, { opacity: 1 });
      const tl = gsap.timeline();
      tl.to("[data-intro-item]", { y: 0, opacity: 1, ease: "power3.out", duration: 1, stagger: 0.08 }, ">1")
        .to(".su-intro__ind .fg", { strokeDashoffset: 0, ease: "power4.inOut", duration: 2.5 }, "-=.5")
        .to(".su-intro__ind", { opacity: 0, ease: "power3.out", duration: 1, onComplete: () => setTimeout(loaded, 500) }, "+=.6")
        .to(".su-intro__catch", { opacity: 0, ease: "power3.out", duration: 1 }, "-=.01")
        .to(".su-intro__overlay", { opacity: 0, duration: 1, delay: 0.5, ease: "power4.out", onComplete: () => intro.remove() }, "-=.9");
    } else {
      intro?.remove();
      gsap.to(pageEl, { opacity: 1, duration: 0.6, delay: 0.1, ease: "power4.out", onComplete: () => setTimeout(loaded, 100) });
    }
    };
    if (document.readyState === "complete") start();
    else addEventListener("load", start, { once: true });

    // When leaving for another page, fade the whole body out, then navigate
    document.querySelectorAll("a[href]").forEach((a) => {
      const h = a.getAttribute("href");
      if (!h || h.startsWith("#") || a.target === "_blank" || !/\.html(#.*)?$/.test(h)) return;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const inDrawer = !!a.closest(".su-drawer");
        gsap.to(pageEl, { opacity: 0, ease: "expo.inOut", duration: 0.6, delay: inDrawer ? 1 : 0.3, onComplete: () => (location.href = a.href) });
      });
    });

    // Reveal: once it enters 20% above the screen bottom, is-visible is added once — the motion is a css transition (data-delay delays in ms)
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-visible");
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -20% 0px", threshold: 0 });
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (el.dataset.delay) el.style.transitionDelay = `${parseInt(el.dataset.delay, 10)}ms`;
      io.observe(el);
    });

    return () => { cancelAnimationFrame(rafId); SU.lenis.destroy(); io.disconnect(); };
  });
  addEventListener("pageshow", (e) => e.persisted && gsap.set(pageEl, { opacity: 1 }));
})();
