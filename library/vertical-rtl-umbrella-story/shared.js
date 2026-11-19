// Skeleton of the horizontal page — draws the always-floating items (logo · contents · buy circle · progress bar) and ports the original Core · Menu · Observer · ScrollAnime behavior with the same values.
// Wide devices (hover: hover) scroll the window horizontally, handled by Lenis (lerp .1, wheel −1× — wheel down goes left). On phones .kj-main scrolls.
(() => {
  const body = document.body;
  const hover = matchMedia("(hover: hover)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navs = [
    ["brand", "Brand story", "Brand story"],
    ["pattern", "The pattern we held to", "Pattern"],
    ["product", "Shape and inner color", "Product"],
    ["lineup", "Generous lineup", "Lineup"],
    ["feature", "Welcome feature", "Features"],
    ["store", "Online shop", "Online store"],
  ];

  const logoSVG = `<svg viewBox="0 0 112 76" aria-hidden="true"><path class="s" d="M14 30 4 20M98 30l10-10M30 16 26 4M82 16l4-12"/><circle class="s" cx="56" cy="26" r="17"/><path class="s" d="M44 28q12-14 24 0M56 14v24"/><text class="f" x="56" y="70" text-anchor="middle">Business name</text></svg>`;

  const mount = () => {
    const logo = Object.assign(document.createElement("a"), { className: "kj-logo", href: "#top", innerHTML: logoSVG });
    logo.setAttribute("data-slot", "logo");
    logo.setAttribute("aria-label", "Back to start");
    const btn = Object.assign(document.createElement("button"), { className: "kj-menubtn", type: "button", innerHTML: '<span class="hb"><i></i><i></i><i></i></span><span class="tx"><span class="a">Contents</span><span class="b">Close</span></span>' });
    btn.setAttribute("data-slot", "menu-button");
    const menu = Object.assign(document.createElement("nav"), { className: "kj-menu ignore-lenis", innerHTML: `<div class="front">${navs.map(([id, ja, en]) => `<a href="#${id}" class="jsMenuClose"><span class="ja">${ja}</span><span class="en">${en}</span></a>`).join("")}</div><div class="back jsMenuClose"></div>` });
    menu.setAttribute("data-slot", "menu");
    const buy = Object.assign(document.createElement("a"), { className: "kj-buy", href: "#store", innerHTML: '<svg viewBox="0 0 30 24"><path d="M1 2h4l3 13h17l3-10H7"/><circle cx="11" cy="20" r="1.6"/><circle cx="23" cy="20" r="1.6"/></svg><span>Buy Here</span><i class="ar"></i>' });
    buy.setAttribute("data-slot", "buy-button");
    const prog = Object.assign(document.createElement("div"), { className: "kj-progress", innerHTML: `<div class="bar"><i id="jsProgressBar"></i></div><div class="list">${navs.map(([, , en]) => `<p class="item jsSectionNav">${en}</p>`).join("")}</div>` });
    prog.setAttribute("data-slot", "progress");
    body.append(logo, btn, menu, buy, prog);
    body.setAttribute("data-menu", "0");
    body.setAttribute("data-sections", "0");
  };
  mount();

  // ---------- Scroll ----------
  const main = document.getElementById("jsMain");
  let lenis = null;
  if (hover && window.Lenis && !reduce) {
    lenis = new Lenis({ smoothWheel: true, smoothTouch: true, wheelMultiplier: -1, touchMultiplier: -1, lerp: 0.1, orientation: "horizontal", gestureOrientation: "both", prevent: (n) => !!n.closest?.(".ignore-lenis") });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  }
  // Starts at the right end (Hero)
  const toStart = () => {
    if (hover) { window.scrollTo(document.documentElement.scrollWidth, 0); lenis?.scrollTo(document.documentElement.scrollWidth, { immediate: true }); }
    else main.scrollLeft = main.scrollWidth;
  };
  toStart();
  addEventListener("load", toStart);
  window.kjScroller = hover ? null : main;
  window.kjLenis = lenis;

  const scrollToEl = (el) => {
    if (!el) return;
    // Original AnkerLink — browser smooth scroll to the section’s left end + 100px (scrollTo smooth, not Lenis)
    const target = el.getBoundingClientRect().left + (hover ? scrollX : main.scrollLeft) + 100;
    if (hover) window.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
    else main.scrollTo({ left: target, behavior: reduce ? "auto" : "smooth" });
  };

  // ---------- Table of contents (original Menu — ignores input for 600ms after a press) ----------
  let canClick = true, open = false;
  const setMenu = (v) => { open = v; body.setAttribute("data-menu", v ? "1" : "0"); };
  document.querySelector(".kj-menubtn").addEventListener("click", () => {
    if (!canClick) return;
    canClick = false;
    setMenu(!open);
    setTimeout(() => (canClick = true), 600);
  });
  document.querySelectorAll(".jsMenuClose").forEach((a) => a.addEventListener("click", (e) => {
    if (!open) return;
    setMenu(false);
    const id = a.getAttribute("href");
    if (id) { e.preventDefault(); scrollToEl(document.querySelector(id)); }
  }));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && open) setMenu(false); });
  document.querySelectorAll('a[href^="#"]:not(.jsMenuClose)').forEach((a) => a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    scrollToEl(t);
  }));

  // ---------- Turns on when entering (original Observer — threshold 0, .isCue after data-delay ms) ----------
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    const d = +(en.target.dataset.delay || 0);
    setTimeout(() => en.target.classList.add("isCue"), d);
    io.unobserve(en.target);
  }), { root: hover ? null : main, threshold: 0 });
  document.querySelectorAll(".jsObserver").forEach((el) => (reduce ? el.classList.add("isCue") : io.observe(el)));

  // ---------- Progress bar·section name·background color (original ScrollAnime) ----------
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const sc = hover ? undefined : main;
    const world = document.getElementById("world");
    const css = getComputedStyle(document.documentElement);
    const c0 = css.getPropertyValue("--site-start").trim() || css.getPropertyValue("--kf-raised").trim();
    const c1 = css.getPropertyValue("--kf-bg").trim();
    const bar = document.getElementById("jsProgressBar");
    ScrollTrigger.create({
      trigger: "#jsSections", scroller: sc, horizontal: true, start: "top top", end: "bottom bottom", invalidateOnRefresh: true,
      onEnter: () => body.setAttribute("data-sections", "1"),
      onLeaveBack: () => body.setAttribute("data-sections", "0"),
      onUpdate: (t) => {
        const r = 1 - t.progress;
        gsap.set(bar, { scaleX: r });
        if (world) gsap.set(world, { background: gsap.utils.interpolate(c0, c1, r) });
      },
    });
    const items = [...document.querySelectorAll(".jsSectionNav")];
    document.querySelectorAll(".jsSection").forEach((sec, i) => {
      const it = items[i];
      if (!it) return;
      ScrollTrigger.create({
        trigger: sec, scroller: sc, horizontal: true, start: "top center", end: "bottom center", invalidateOnRefresh: true,
        onEnter: () => { it.classList.add("isCurrent"); it.classList.remove("isLeave"); },
        onLeaveBack: () => { it.classList.remove("isCurrent"); it.classList.add("isLeave"); },
        onLeave: () => { it.classList.remove("isCurrent"); it.classList.add("isLeave"); },
        onEnterBack: () => { it.classList.add("isCurrent"); it.classList.remove("isLeave"); },
      });
    });
  }
})();
