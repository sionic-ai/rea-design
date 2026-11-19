// Things spanning several screens — Lenis (lerp .1, rolled at 30fps like the original), first-visit and return-visit intro display, header row·menu drawer, anchor movement,
// Collapsible rows (details 300ms), ticket button hides at the footer, back to top, SNS panel
(() => {
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = matchMedia("(max-width: 768px)");
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, prevent: (node) => !!node.closest?.("[data-lenis-prevent], .simplebar-content-wrapper") });
  window.lenis = lenis;
  lenis.on("scroll", ScrollTrigger.update);
  lenis.stop();
  // The original ties screen updates to 30fps to run Lenis — even with the same damping each step is twice as large, so the scroll feel differs
  const FPS = 30, interval = 1000 / FPS;
  let last = 0;
  const loop = (t) => {
    requestAnimationFrame(loop);
    const d = t - last;
    if (d > interval) { last = t - (d % interval); lenis.raf(t); }
  };
  requestAnimationFrame(loop);

  // Only the first visit of a session plays the long intro where the mountains rise, on return everything is already in place and only the logo pops
  const first = sessionStorage.getItem("sy-visited") !== "1";
  sessionStorage.setItem("sy-visited", "1");
  body.dataset.loading = first ? "" : "0";
  body.dataset.menu = "0";

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const syEnter = async () => {
    body.dataset.loading = first ? "1" : "0";
    if (!reduce) await wait(300);
  };
  window.syIntro = window.syIntro || (() => Promise.resolve());

  // Menu drawer — stops scrolling while opening or closing, ignores repeated presses within 600ms
  const menuBtn = document.querySelector(".sy-menu-btn");
  const menu = document.getElementById("sy-menu");
  let menuOpen = false, canClick = true;
  const setMenu = (open) => {
    menuOpen = open;
    body.dataset.menu = open ? "1" : "0";
    menuBtn?.setAttribute("aria-expanded", String(open));
    menuBtn?.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (open) { menu?.scrollTo(0, 0); lenis.stop(); } else lenis.start();
  };
  const guard = (fn) => () => {
    if (!canClick) return;
    canClick = false;
    fn();
    setTimeout(() => (canClick = true), 600);
  };
  menuBtn?.addEventListener("click", guard(() => setMenu(!menuOpen)));
  document.querySelectorAll("[data-menu-close]").forEach((a) => a.addEventListener("click", () => { if (menuOpen) setMenu(false); }));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) setMenu(false); });

  // Same-page anchor — scrolls less by the header height (wide screen 90+24, phone 70+24). If pressed inside the menu, it closes first and then scrolls 100ms later
  const offset = () => (narrow.matches ? 70 + 24 : 90 + 24);
  document.querySelectorAll('a[href^="#"]:not([data-video])').forEach((a) => {
    const id = a.getAttribute("href");
    a.addEventListener("click", (e) => {
      const target = id === "#top" ? 0 : document.querySelector(id);
      if (target == null) return;
      e.preventDefault();
      const go = () => lenis.scrollTo(target, { offset: target === 0 ? 0 : -offset(), duration: 1 });
      a.hasAttribute("data-menu-close") ? setTimeout(go, 100) : go();
    });
  });
  document.querySelector(".sy-pagetop")?.addEventListener("click", () => lenis.scrollTo(0, { duration: 1 }));

  // Collapsible row — data-open 1 starts it open. Height·opacity at 300ms cubic-bezier(.87,0,.13,1) (original Web Animations as is)
  const AC = { duration: reduce ? 0 : 300, easing: "cubic-bezier(0.87, 0, 0.13, 1)" };
  let refreshT = 0;
  const refreshSoon = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 300); };
  document.querySelectorAll("details").forEach((d) => {
    const sum = d.querySelector(":scope > summary");
    const content = sum?.nextElementSibling;
    if (!sum || !content) return;
    const want = d.getAttribute("data-open");
    if (want === "1") { d.open = true; d.dataset.status = "open"; } else { d.open = false; d.dataset.status = "close"; }
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.dataset.status !== "open" && d.dataset.status !== "close") return;
      const opening = !d.open;
      d.dataset.status = "run";
      if (opening) {
        d.open = true;
        d.dataset.status = "open";
        content.animate([{ height: 0, opacity: 0 }, { height: `${content.offsetHeight}px`, opacity: 1 }], AC);
      } else {
        const a = content.animate([{ height: `${content.offsetHeight}px`, opacity: 1 }, { height: 0, opacity: 0 }], AC);
        a.onfinish = () => { d.open = false; d.dataset.status = "close"; };
      }
      refreshSoon();
    });
  });

  // On reaching the footer, retract the fixed ticket button
  const footer = document.getElementById("sy-footer");
  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      end: "bottom bottom",
      onEnter: () => (body.dataset.enterFooter = "1"),
      onLeaveBack: () => (body.dataset.enterFooter = "0"),
    });
  }

  // Six round SNS buttons — the image is just a text slot saying what goes there
  const SNS = ["SNS 1", "SNS 2", "SNS 3", "SNS 4", "SNS 5", "SNS 6"];
  document.querySelectorAll(".sy-sns").forEach((ul) => {
    SNS.forEach((name, i) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = "#top";
      a.setAttribute("aria-label", name);
      a.dataset.label = "SNS icon slot";
      a.textContent = String(i + 1).padStart(2, "0");
      li.append(a);
      ul.append(li);
    });
  });

  // Intro → header line·ticket button come in → release scroll (original init order). The original starts after document.fonts.ready, but
  // The original’s web fonts are loaded late by script so ready resolves right away — here fonts are applied first via css, so it would be delayed until all Korean font fragments arrive, hence we wait only up to 150ms.
  const start = async () => {
    await syEnter();
    await window.syIntro(first);
    body.dataset.loaded = "1";
    lenis.start();
    ScrollTrigger.refresh();
  };
  Promise.race([document.fonts?.ready || Promise.resolve(), wait(150)]).then(start);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
})();
