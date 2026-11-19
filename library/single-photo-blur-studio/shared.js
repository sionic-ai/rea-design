// Common to the whole site — attaches the background photo, scattered menu, bottom logo, screen curtain, phone menu and first loader to every page,
// Reads the data-b marks and attaches the text line-rise after the loader lifts (right away on arrived pages).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 922px)");
  const body = document.body;
  const light = body.classList.contains("is-light");
  const rest = light ? 0 : +(body.dataset.blur ?? 0);
  // Original custom curve — create the same name with CustomEase
  const EASE = {
    pageTransition: "M0,0 C0.474,0 0.524,0.485 0.728,0.857 0.775,0.943 1,1 1,1",
    pageTransition_in: "M0,0 C0.552,0 0.483,0.54 0.731,0.885 0.804,0.987 1,1 1,1",
    opacity: "0.45,0,0.55,1",
    draw_1: "M0,0 C0.139,0.038 0.264,0.186 0.372,0.376 0.441,0.497 0.62,0.451 0.723,0.726 0.793,0.914 0.886,1 1,1",
  };
  Object.entries(EASE).forEach(([n, c]) => CustomEase.create(`b-${n}`, c));
  const LOGO = `<svg viewBox="0 0 100 18" aria-hidden="true" data-label="Company wordmark (uppercase English)"><text x="0" y="15.5" textLength="100" lengthAdjust="spacingAndGlyphs" fill="currentColor" style="font: 700 19px var(--kf-font-display)">STUDIO</text></svg>`;
  const NAV = [["about.html", "About"], ["service.html", "Services"], ["works.html", "Works"], ["works.html#talents", "Talents"]];
  const here = location.pathname.split("/").pop() || "index.html";

  if (!light) body.insertAdjacentHTML("afterbegin", `<div class="b-bg" data-slot="background"><div class="wf-img is-stage" data-label="Lower body of a walking person · red bag in hand · dark stage · full width"></div><div class="b-bg__shade"></div></div>`);
  body.insertAdjacentHTML("beforeend", `
    <nav class="b-nav" aria-label="Main menu" data-slot="nav" data-fx="nav-blur-focus" data-fx-nav-blur-focus="${light ? "" : `target: .b-bg; rest: ${rest}`}">${NAV.map(([h, t]) => `<a href="${h}" data-fx-part="item" data-nav="${t.toLowerCase()}"${h === here ? ' aria-current="page"' : ""}>${t}</a>`).join("")}</nav>
    <div class="b-mnav" data-slot="mobile-menu"><button type="button" class="b-mnav__btn" aria-expanded="false"><span class="b-mnav__open">Menu</span><span class="b-mnav__close">Close</span></button><div class="b-mnav__links">${NAV.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}</div></div>
    <div class="b-blurlayer" aria-hidden="true"></div>
    <div class="b-veil" aria-hidden="true"></div>
    <a class="b-logo" href="index.html" aria-label="To the first page" data-slot="logo" data-fx="nav-blur-focus" data-fx-nav-blur-focus="target: .b-veil; prop: backdrop; target-blur: 15; target-in: 1.5; target-out: .9; target-ease: power3.out">${LOGO}</a>
    <div class="b-cover" aria-hidden="true" data-slot="page-cover"></div>`);

  // Panels that overflow vertically (phone screen · about text) scroll with the original Lenis 1.3.21 settings (lerp .085 · wheel .8 · touch uses default scroll)
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ smoothWheel: true, syncTouch: false, lerp: 0.085, wheelMultiplier: 0.8, autoRaf: false });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
  }
  const bg = document.querySelector(".b-bg");
  const nav = document.querySelector(".b-nav");
  const logo = document.querySelector(".b-logo");
  if (bg) gsap.set(bg, { filter: `blur(${mobile.matches && rest ? 4 : rest}px)` });

  // ── Text line entrance: from 100% below the mask, 1.7s expo.out, .07 stagger (original animateAlt) ──
  const arm = (delay = 0.2) => {
    document.querySelectorAll("[data-b]").forEach((el) => {
      const k = el.dataset.b;
      if (k === "lines") { el.dataset.fx = "line-rise"; el.dataset.fxLineRise = `y: 100; dur: 1.7; stagger: .07; ease: expo.out; start: top bottom; fade: true; delay: ${+(el.dataset.bDelay || 0) + delay}`; }
      else if (k === "fade") gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "b-opacity", delay: +(el.dataset.bDelay || 0) + delay });
      el.removeAttribute("data-b");
    });
  };

  // ── First loader — petal lines 1.2+.2i s (draw_1) · logo lights up .4s at 1s and scales to 1x in 1.3s power4.out · at 1.6s the panel goes up .7s (pageTransition) ──
  const arrived = sessionStorage.getItem("b-nav") === "1";
  sessionStorage.removeItem("b-nav");
  const reveal = (instant) => {
    gsap.to(nav, { y: 0, duration: instant ? 0 : 1.85, ease: "expo.out", force3D: true, overwrite: "auto" });
  };
  if (reduce || arrived) {
    document.querySelector(".b-loader")?.remove();
    gsap.set(nav, { y: 0 });
    arm(arrived ? 0.2 : 0);
  } else {
    // The loader is in the HTML so the crimson panel covers from the very first paint (as in the original) — the three petals use our own lines in place of the original flower drawing
    const box = document.querySelector(".b-loader");
    gsap.set(logo, { y: "100vh" });
    gsap.set(nav, { y: "30vh" });
    const tl = gsap.timeline({ onComplete: () => box.remove() });
    box.querySelectorAll("path").forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(p, { strokeDashoffset: 0, duration: 1.2 + i * 0.2, ease: "b-draw_1" }, 0);
    });
    const small = mobile.matches;
    tl.to(box.querySelector(".b-loader__in"), { opacity: 1, duration: 0.1, ease: "none" }, 0)
      .to(box.querySelector(".b-loader__logo"), { opacity: 1, duration: 0.4, ease: "none" }, 1)
      .to(box.querySelector(".b-loader__logo"), { scale: 1, duration: 1.3, ease: "power4.out" }, 1)
      .to(box, { y: "-100%", duration: small ? 0.9 : 0.7, ease: "b-pageTransition" }, 1.6)
      .to(box.querySelector(".b-loader__in"), { y: small ? "100vh" : "80vh", duration: small ? 0.9 : 0.7, ease: "b-pageTransition" }, 1.6)
      .to(box.querySelector(".b-loader__logo"), { y: small ? -40 : -100, duration: small ? 0.9 : 0.7, ease: "b-pageTransition" }, 1.6)
      .fromTo(logo, { y: "10vh" }, { y: 0, duration: 1.6, ease: "power4.out" }, 1.8)
      .add(() => { reveal(false); arm(0.2); }, 1.6);
  }

  // ── Transition — same-site link: the changing text (.b-out) vanishes in .2s, and for a white panel a white curtain covers from the top in .85s, then navigates ──
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
    if (u.pathname === location.pathname && !u.hash) { e.preventDefault(); if (here !== "index.html") location.href = "index.html"; return; }
    e.preventDefault();
    sessionStorage.setItem("b-nav", "1");
    const go = () => (location.href = a.href);
    if (reduce) return go();
    const toLight = /detail\.html$/.test(u.pathname);
    const tl = gsap.timeline({ onComplete: go });
    const outs = document.querySelectorAll(".b-out");
    if (outs.length) tl.to(outs, { opacity: 0, duration: 0.2, ease: "b-opacity" }, 0);
    if (toLight) tl.fromTo(".b-cover", { yPercent: -100 }, { yPercent: 0, duration: 0.85, ease: "b-pageTransition_in" }, 0);
    else if (bg && !u.pathname.endsWith("index.html") && u.pathname !== "/") tl.to(bg, { filter: "blur(13px)", duration: 0.5, ease: "power1.out" }, 0);
    else if (bg) tl.to(bg, { filter: "blur(0px)", duration: 0.4, ease: "power1.out" }, 0);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  // ── Phone menu: links turn on at .5s, background 4px · 6px behind the curtain ──
  const mnav = document.querySelector(".b-mnav");
  if (mnav) {
    const btn = mnav.querySelector("button"), links = mnav.querySelectorAll(".b-mnav__links a"), layer = document.querySelector(".b-blurlayer");
    let open = false;
    btn.addEventListener("click", () => {
      open = !open;
      mnav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      const d = reduce ? 0 : 0.5;
      gsap.to(links, { opacity: open ? 1 : 0, duration: d, ease: open ? "power2.out" : "b-opacity" });
      gsap.to(btn.querySelector(".b-mnav__open"), { opacity: open ? 0 : 1, duration: 0 });
      gsap.to(btn.querySelector(".b-mnav__close"), { opacity: open ? 1 : 0, duration: 0 });
      if (bg) gsap.to(bg, { filter: `blur(${open ? 4 : rest ? 4 : 0}px)`, duration: d, ease: "b-opacity" });
      gsap.to(layer, { backdropFilter: `blur(${open ? 6 : 0}px)`, webkitBackdropFilter: `blur(${open ? 6 : 0}px)`, duration: d, ease: "power2.out" });
      gsap.to(".b-out", { opacity: open ? 0 : 1, duration: d / 2, ease: "b-opacity" });
    });
  }
})();
