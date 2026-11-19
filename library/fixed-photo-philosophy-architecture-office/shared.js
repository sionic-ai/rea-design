// Shared by all pages — the top-left logo, hamburger, expanding menu, bottom-left fixed menu, white transition curtain and footer are drawn once, and Barba swaps only the main content (container).
// Original libraries as they are: page transitions barba 2.10.3 · smooth scroll Lenis 1.3.8 (lerp .1, autoRaf).
// Original values: transition — a white curtain covers in 1s (the curve name isn’t in GSAP so default power1.out) and the body fades out 1s → on the next page the curtain lifts in 1s.
//            work detail → next work: no curtain, header · logo · page line · body turn on in 1s. The expanded menu fades in .6s (cleaned up .5s after closing).
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const HS = (window.HS = { lenis: null });

  // Instead of the original logo: a block of letters with two Korean lines + three English lines justified to the same width
  const logo = () => `<svg viewBox="0 0 120 182" role="img" aria-label="Logo slot — office name in Korean on two lines and in English on three lines">
      <text class="ko" x="0" y="20" font-size="21" textLength="119" lengthAdjust="spacing">Office name</text>
      <text class="ko" x="0" y="61" font-size="21" textLength="119" lengthAdjust="spacing">Architectural design</text>
      <text class="en" x="0" y="103" font-size="20" textLength="119" lengthAdjust="spacing">Firstname</text>
      <text class="en" x="0" y="141" font-size="20" textLength="119" lengthAdjust="spacing">Lastname</text>
      <text class="en" x="0" y="179" font-size="20" textLength="121" lengthAdjust="spacing">Architect</text>
    </svg>`;
  const sns = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><rect x="1.5" y="1.5" width="17" height="17" rx="5"/><circle cx="10" cy="10" r="4"/><circle cx="15" cy="5" r="0.6" fill="currentColor"/></svg>';
  const arrowSvg = '<svg viewBox="0 0 23 20" aria-hidden="true"><path d="M0 10h22M15.5 3.5 22 10l-6.5 6.5"/></svg>';
  const arrow = (look = "slide; pace: keyframes") => `<span class="hs-arrow" data-fx="arrow-pass-hover" data-fx-arrow-pass-hover="look: ${look}">${arrowSvg}${arrowSvg}</span>`;
  HS.logo = logo;
  HS.arrow = arrow;

  const menu = [
    ["Top", "index.html"],
    ["Works", "works.html"],
    ["Info", "article.html"],
    ["About", "about.html"],
    ["Contact", "about.html"],
  ];
  const links = menu.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("");

  const page = document.querySelector(".hs-page");
  page.insertAdjacentHTML(
    "afterbegin",
    `<button class="hs-burger" type="button" aria-label="Open Menu" data-slot="burger"><i></i><i></i><i></i></button>
    <p class="hs-ci"><a href="index.html" aria-label="Home"><span class="hs-logo">${logo()}</span></a></p>
    <header class="hs-menu" data-slot="menu-drawer" data-lenis-prevent>
      <div class="hs-menu__inner"><nav class="hs-menu__body" aria-label="Expand Menu">
        <ul class="hs-menu__nav">${links}</ul>
        <a class="hs-sns" href="#" data-label="SNS account name">${sns}<span>studioname</span></a>
        <p class="hs-copy">© Studio Name Architect</p>
      </nav></div>
    </header>
    <div class="hs-cover" aria-hidden="true"></div>
    <nav class="hs-side" aria-label="Main menu" data-slot="side-nav"><ul class="hs-side__nav">${links}</ul></nav>`
  );
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("hs-foot");
    foot.innerHTML = `<div class="hs-foot__in">
      <a class="hs-foot__ci hs-logo" href="index.html" aria-label="Home">${logo()}</a>
      <p class="hs-foot__contact"><a class="hs-btn-b" href="about.html" data-fx="underline-out-hover" data-fx-underline-out-hover="look: scale" style="--fx-dur: .5s; --fx-ease: ease">Contact${arrow()}</a></p>
      <a class="hs-sns" href="#" data-label="SNS account name">${sns}<span>studionamearchitect</span></a>
      <p class="hs-copy">© Studio Name Architect</p>
    </div>`;
  }

  const burger = page.querySelector(".hs-burger");
  const ci = page.querySelector(".hs-ci");
  const side = page.querySelector(".hs-side");
  const drawer = page.querySelector(".hs-menu");
  const cover = page.querySelector(".hs-cover");
  const box = () => document.querySelector('[data-barba="container"]');
  page.querySelectorAll("[data-logo]").forEach((el) => (el.innerHTML = logo()));

  // Smooth scroll (original LenisManager: new Lenis({ autoRaf: true, lerp: 0.1 }) — not tied to ScrollTrigger)
  if (!reduced && window.Lenis) HS.lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
  const toTop = () => (HS.lenis ? HS.lenis.scrollTo(0, { immediate: true, force: true }) : scrollTo(0, 0));

  // Expanding menu — original HeaderMenu: on open is-beforeEnter → next frame is-enter (.6s) → .4s later is-active, on close is-fadeOut (.6s) → cleaned up .5s later
  let menuTimer = 0;
  function openMenu() {
    clearTimeout(menuTimer);
    drawer.classList.add("is-beforeEnter");
    burger.classList.add("is-active");
    burger.setAttribute("aria-label", "Close Menu");
    requestAnimationFrame(() => {
      drawer.classList.remove("is-beforeEnter");
      drawer.classList.add("is-enter", "is-active");
      menuTimer = setTimeout(() => drawer.classList.remove("is-enter"), 400);
    });
  }
  function closeMenu() {
    clearTimeout(menuTimer);
    drawer.classList.remove("is-active", "is-enter");
    drawer.classList.add("is-fadeOut");
    burger.classList.remove("is-active");
    burger.setAttribute("aria-label", "Open Menu");
    menuTimer = setTimeout(() => drawer.classList.remove("is-fadeOut", "is-active"), 500);
  }
  burger.addEventListener("click", () => (drawer.classList.contains("is-active") ? closeMenu() : openMenu()));
  drawer.querySelectorAll(".hs-menu__nav a").forEach((a) => a.addEventListener("click", closeMenu));

  // White text over photos — original updateUIByNamespace
  function ui(ns) {
    burger.classList.toggle("is-white", ns === "top" || ns === "works_single");
    ci.classList.toggle("is-white", ns === "top" || ns === "works_single");
    ci.classList.toggle("is-top", ns === "top");
    side.classList.toggle("is-white", ns === "top");
    if (foot) foot.classList.toggle("is-hidden", ns === "works_single");
  }

  // Fixed menu and hamburger turn dark ink over a white panel — original ColorTrigger: when the target’s bottom edge (document coordinates) passes the trigger’s top edge, is-change-color
  let colorItems = [];
  function colorWhen(target, trigger) {
    if (!target || !trigger) return;
    colorItems.push({ target, trigger, top: 0 });
  }
  function recalc() {
    colorItems.forEach((c) => (c.top = scrollY + c.trigger.getBoundingClientRect().top));
  }
  // When the fixed menu touches the footer it sits on top of the footer (remove the original is-fixed → bottom edge to the footer’s top edge)
  let footTop = 0;
  function measure() {
    footTop = foot && !foot.classList.contains("is-hidden") ? foot.getBoundingClientRect().top + scrollY : Infinity;
    recalc();
    onScroll();
  }
  function onScroll() {
    const y = scrollY;
    const fixed = y + innerHeight <= footTop;
    side.classList.toggle("is-fixed", fixed);
    side.style.top = fixed ? "" : footTop - page.getBoundingClientRect().top - scrollY + "px";
    if (y > 0 || colorItems.length) colorItems.forEach((c) => c.target.classList.toggle("is-change-color", y + c.target.getBoundingClientRect().bottom >= c.top));
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", measure);
  new ResizeObserver(measure).observe(document.body);

  // Language picker — original PrgLang: saves the chosen language and toggles the ko·en chunks of every [data-lang-box] on and off
  const LANG = "hs-lang-mode";
  const lang = () => {
    try { return localStorage.getItem(LANG) || "ko"; } catch { return "ko"; }
  };
  function showLang(mode) {
    document.querySelectorAll("[data-lang-box]").forEach((b) => b.classList.toggle("is-en", mode === "en"));
    document.querySelectorAll(".hs-lang li").forEach((li) => li.classList.toggle("is-current", li.dataset.set === mode));
  }
  document.addEventListener("click", (e) => {
    const li = e.target.closest(".hs-lang li[data-set]");
    if (!li) return;
    try { localStorage.setItem(LANG, li.dataset.set); } catch {}
    showLang(li.dataset.set);
    measure();
  });

  // Each time content is brought in — the color-change trigger per namespace and handing off to the next work
  function build(el) {
    const ns = el.dataset.barbaNamespace;
    document.body.dataset.page = ns;
    colorItems = [];
    if (ns === "top") {
      const area = el.querySelector(".hs-area2");
      colorWhen(side, area);
      colorWhen(burger, area);
    }
    if (ns === "works_single") colorWhen(burger, el.querySelector(".prg-change-line"));
    burger.classList.remove("is-change-color");
    side.classList.remove("is-change-color");
    showLang(lang());
    const next = el.querySelector('[data-fx~="bottom-dwell-next"]');
    if (next) {
      // Original goToNextWorks: after it fills, scrolling stops (lenis.stop), and once the card has grown, it moves on to the next page
      next.addEventListener("fx:grow", () => HS.lenis && HS.lenis.stop());
      // Next work is the same sample page, so the URL tail (?n=2) alternately so the character faces the other way
      next.addEventListener("fx:next", (e) => {
        if (!window.barba || !/^https?:$/.test(location.protocol)) return;
        e.preventDefault();
        barba.go(new URL(/[?&]n=2/.test(location.search) ? "detail.html" : "detail.html?n=2", location.href).href);
      });
    }
    requestAnimationFrame(measure);
  }

  // Fetches the next page’s page css — the original has a single css file, so this step doesn’t exist there
  const sheets = (html) => {
    const want = [...new DOMParser().parseFromString(html, "text/html").querySelectorAll('link[rel="stylesheet"]')].map((l) => new URL(l.getAttribute("href"), location.href).href);
    const have = [...document.querySelectorAll('link[rel="stylesheet"]')];
    have.forEach((l) => want.includes(l.href) || l.remove());
    return Promise.all(
      want
        .filter((h) => !have.some((l) => l.href === h))
        .map((h) => new Promise((res) => {
          const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: h });
          l.onload = l.onerror = res;
          document.head.append(l);
        }))
    );
  };
  const own = (href) => /^[\w-]+\.html([?#].*)?$/.test(href || "");
  const fadeIn = (sel) => gsap.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 1 });

  function start() {
    const first = box();
    ui(first.dataset.barbaNamespace);
    build(first);
    if (window.barba && /^https?:$/.test(location.protocol)) {
      barba.init({
        prevent: ({ el }) => !el || el.tagName !== "A" || !own(el.getAttribute("href")) || el.hasAttribute("data-barba-prevent"),
        transitions: [
          {
            name: "fade",
            leave({ current }) {
              if (reduced) return;
              gsap.to(current.container, { opacity: 0, display: "none", duration: 1 });
              return gsap.to(cover, { opacity: 1, duration: 1, ease: "power1.out" });
            },
            async beforeEnter({ next }) {
              await sheets(next.html);
            },
            enter() {
              return reduced ? gsap.set(cover, { opacity: 0 }) : gsap.to(cover, { opacity: 0, duration: 1 });
            },
          },
          {
            name: "fade-works-single",
            from: { namespace: ["works_single"] },
            to: { namespace: ["works_single"] },
            leave({ current }) {
              gsap.to(current.container, { opacity: 1, duration: 0.5 });
            },
            enter({ next }) {
              HS.lenis && HS.lenis.start();
              toTop();
              fadeIn([ci, ...next.container.querySelectorAll(".hs-single-mv__heading, .hs-crumbs, .hs-single-content")]);
            },
          },
        ],
      });
      barba.hooks.beforeEnter(({ next }) => {
        toTop();
        build(next.container);
        requestAnimationFrame(() => ui(next.namespace));
      });
      barba.hooks.after(() => HS.lenis && HS.lenis.start());
      return;
    }
    // On file:// the transition library can’t fetch the next page — cover with the curtain using the same values, navigate normally, then lift the curtain on the next page
    const KEY = "hs-veil";
    try {
      if (sessionStorage.getItem(KEY)) {
        sessionStorage.removeItem(KEY);
        if (!reduced) gsap.fromTo(cover, { opacity: 1 }, { opacity: 0, duration: 1 });
      }
    } catch {}
    const go = (href) => {
      try { sessionStorage.setItem(KEY, "1"); } catch {}
      if (reduced) return void (location.href = href);
      gsap.to(box(), { opacity: 0, display: "none", duration: 1 });
      gsap.to(cover, { opacity: 1, duration: 1, ease: "power1.out", onComplete: () => (location.href = href) });
    };
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!own(href)) return;
      e.preventDefault();
      go(href);
    });
    addEventListener("pageshow", (e) => e.persisted && gsap.set(cover, { opacity: 0 }));
  }
  document.readyState === "loading" ? addEventListener("DOMContentLoaded", start) : start();
})();
