// Motion shared by all pages: ScrollSmoother (1.5), white curtain lifting, menu open and close, sub header row sliding up, footer photo dropping down, anchor jumps.
// Original rpx — write values as px at 1440 width (375 on phone) and scale them to the current width.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin);
  const body = document.body;
  const sp = () => innerWidth < 767;
  window.rpx = (v) => (v * document.body.clientWidth) / (sp() ? 375 : 1440);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = "ontouchstart" in document;

  let smoother = null;
  const onScroll = [];
  if (!touch && !reduce) {
    smoother = ScrollSmoother.create({ smooth: 1.5, speed: 1, effects: true, normalizeScroll: true, onUpdate: (s) => onScroll.forEach((f) => f(s.scrollTop())) });
    ScrollTrigger.normalizeScroll({ allowNestedScroll: true });
  } else {
    addEventListener("scroll", () => onScroll.forEach((f) => f(scrollY)), { passive: true });
  }
  window.siteScroll = { smoother, on: (f) => { onScroll.push(f); f(smoother ? smoother.scrollTop() : scrollY); } };

  // Lift the curtain once fonts are loaded (just go after 3s) — while the curtain lifts, the hero rises into place over 2s
  let ready = false;
  const open = () => { if (ready) return; ready = true; body.classList.add("is-ready"); ScrollTrigger.refresh(); };
  (document.fonts?.ready || Promise.resolve()).then(open);
  setTimeout(open, 3000);

  const menu = document.querySelector(".s-menu");
  const toggle = menu?.querySelector(".s-menu__toggle");
  toggle?.addEventListener("click", () => {
    const on = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", on);
    toggle.setAttribute("aria-expanded", String(on));
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menu?.classList.contains("is-open")) toggle.click(); });
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".s-menu__item, .s-head__btn").forEach((a) => { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });

  // Sub header row — pushed up with the scroll until 200px, then stays hidden
  const head = document.querySelector(".s-head");
  if (head && !touch) {
    head.style.position = "fixed";
    let hidden = false;
    window.siteScroll.on((y) => {
      const lim = rpx(200);
      head.style.transform = `translateY(${-Math.min(lim, Math.max(0, y))}px)`;
      if (lim < y !== hidden) { hidden = lim < y; head.classList.toggle("is-hidden", hidden); }
    });
  }

  const foot = document.querySelector(".s-foot__bg .wf-img, .s-foot__bg img, .s-foot__bg video");
  if (foot && !reduce) {
    gsap.fromTo(foot, { yPercent: -25 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".s-foot__bg", start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const to = id.length > 1 ? document.querySelector(id) : 0;
    if (to === null) return;
    e.preventDefault();
    if (smoother) smoother.scrollTo(to, true, "top 0px");
    else gsap.to(window, { duration: reduce ? 0 : 1, ease: "expo.out", scrollTo: { y: to, autoKill: false } });
  }));
})();
