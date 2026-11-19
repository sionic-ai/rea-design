// Shared: draws the loader logo, award mark, phone header and About drawer, and hooks up smooth scroll (Lenis 1.3.26) and About drawer open/close.
// Drawer opens 1s expo.out (content at −20% after .1s) · grid pushed 40% (50% under 850) · title letters shuffled in order −50%·−30°·5px blur → 1s power3.out with .01s stagger.
// Closing: content .5s power3.in · panel .75s power3.inOut after .1s · phone height 1s power3.inOut
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const JL = (window.JL = { reduced, lenis: null, aboutOpen: false });

  // Slot line bend — original BorderX·BorderY (hoverBend). When the cursor crosses the line, the line is pulled toward the cursor on the crossed side, and when it goes beyond 40px from the line or crosses back
  // Lands and stands upright, bouncing with .75s elastic.out(1,0.45). Bend (offset of one control point) = Distance/40 × max, max = Line length/280 × 100 (32~100),
  // The bend point is the cursor position (16~84% of the line). On touch (pointer: coarse) and reduced motion, only the line is drawn and it doesn’t bend
  const PULL = 40, DEAD = 2, BASE = PULL + 0.5;
  const SVGNS = "http://www.w3.org/2000/svg";
  const bends = new Set();
  const lineRO = new ResizeObserver((es) => es.forEach((e) => bends.forEach((s) => s.anchor === e.target && placeLine(s))));
  const drawLine = (s) => {
    const n = s.len, q = gsap.utils.clamp(n * 0.16, n * 0.84, (s.at / 100) * n), o = BASE + s.amt;
    s.path.setAttribute("d", s.axis === "x" ? `M 0 ${BASE} C ${q} ${BASE} ${q} ${o} ${n} ${BASE}` : `M ${BASE} 0 C ${BASE} ${q} ${o} ${q} ${BASE} ${n}`);
  };
  const placeLine = (s) => {
    const a = s.anchor, x = s.axis === "x", st = s.svg.style;
    s.len = x ? a.offsetWidth : a.offsetHeight;
    Object.assign(st, x
      ? { left: `${a.offsetLeft}px`, top: `${a.offsetTop - PULL}px`, width: `${s.len}px`, height: `${PULL * 2}px` }
      : { left: `${a.offsetLeft - PULL}px`, top: `${a.offsetTop}px`, width: `${PULL * 2}px`, height: `${s.len}px` });
    s.svg.setAttribute("viewBox", x ? `0 0 ${s.len} ${PULL * 2}` : `0 0 ${PULL * 2} ${s.len}`);
    drawLine(s);
  };
  // axis "x" is the horizontal line on the anchor’s top edge, "y" Is the vertical line on the left edge — keep the layer inside the anchor’s offsetParent
  JL.line = (layer, axis, anchor) => {
    const svg = document.createElementNS(SVGNS, "svg"), path = document.createElementNS(SVGNS, "path");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", `jl-line is-${axis}`);
    svg.appendChild(path);
    layer.appendChild(svg);
    const s = { svg, path, axis, anchor, len: 0, amt: 0, at: 50, side: 0, drag: 0, back: null };
    bends.add(s);
    lineRO.observe(anchor);
    placeLine(s);
    return svg;
  };
  const letGo = (s) => {
    s.drag = 0;
    s.back?.kill();
    s.back = gsap.to(s, { amt: 0, at: 50, duration: 0.75, ease: "elastic.out(1, 0.45)", onUpdate: () => drawLine(s), onComplete: () => (s.back = null) });
  };
  const bendStep = (s, e) => {
    const r = s.anchor.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const x = s.axis === "x", along = x ? e.clientX : e.clientY, lo = x ? r.left : r.top, hi = x ? r.right : r.bottom;
    if (along < lo - 2 || along > hi + 2) { s.side = 0; if (s.drag) letGo(s); return; }
    const d = x ? e.clientY - r.top : e.clientX - r.left, side = d > DEAD ? 1 : d < -DEAD ? -1 : 0;
    if (s.drag) {
      if ((side && side !== s.drag) || Math.abs(d) > PULL) { if (side) s.side = side; letGo(s); return; }
    } else {
      const crossed = s.side && side && side !== s.side;
      if (side) s.side = side;
      if (!crossed || Math.abs(d) > PULL) return;
      s.back?.kill();
      s.back = null;
      s.drag = side;
    }
    const max = Math.min(100, Math.max(32, 100 * (s.len / 280))), amt = (Math.abs(d) / PULL) * max;
    s.at = ((along - lo) / (hi - lo)) * 100;
    s.amt = s.drag * Math.min(amt, max);
    drawLine(s);
    if (amt >= max - 0.5) letGo(s);
  };
  JL.dropLines = (layer) => bends.forEach((s) => { if (s.svg.parentNode === layer) { s.back?.kill(); bends.delete(s); s.svg.remove(); } });
  if (!reduced && !matchMedia("(pointer: coarse)").matches) addEventListener("mousemove", (e) => bends.forEach((s) => bendStep(s, e)), { passive: true });
  const logo = (letter) => `<div class="jl-logo"><i class="jl-logo__line"></i><i class="jl-logo__line"></i><i class="jl-logo__line"></i><i class="jl-logo__line"></i><span class="jl-logo__letter">${letter}</span></div>`;
  const icon = {
    doc: '<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 4h10l5 5v17H8z"/><path d="M18 4v5h5M11 14h9M11 18h9M11 22h6"/></svg>',
    send: '<svg viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 14 27 4l-6 22-6-8z"/><path d="m15 18 12-14"/></svg>',
    mail: '<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="6" y="11" width="32" height="22"/><path d="m6 11 16 13 16-13"/></svg>',
    paper: '<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 6h14l7 7v25H12z"/><path d="M26 6v7h7M16 20h13M16 25h13M16 30h9"/></svg>',
    net: '<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="7" y="7" width="30" height="30"/><path d="M14 19v12M14 14v1M20 31V19M20 24c0-4 10-5 10 1v6"/></svg>',
    cam: '<svg viewBox="0 0 44 44" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="7" y="7" width="30" height="30" rx="8"/><circle cx="22" cy="22" r="7"/><circle cx="31" cy="13" r="1"/></svg>',
  };

  document.body.insertAdjacentHTML("afterbegin", `
    <a class="jl-badge" href="#" data-slot="award-badge" aria-label="Award Mark"><b>Upper.</b><span>Award Mark</span></a>
    <header class="jl-mhead" data-slot="mobile-header">
      <div class="jl-mhead__logo" data-about-open>${logo("Go")}</div>
      <div class="jl-mhead__menu">
        <button class="jl-mhead__item" type="button" data-about-toggle aria-label="About"><span class="jl-fill"></span>${icon.doc}</button>
        <a class="jl-mhead__item" href="#" aria-label="Mail"><span class="jl-fill"></span>${icon.send}</a>
      </div>
    </header>
    <aside class="jl-about" data-slot="about-drawer" aria-label="About">
      <div class="jl-about__shade"></div>
      <div class="jl-about__inner">
        <div class="jl-about__content">
          <h1>Describe yourself in one line here<br>Large title introducing<br>Fit in about thirty-three characters over three lines.</h1>
          <div class="jl-about__bio">
            <p>Your first self-introduction paragraph goes here, in about 4 lines. Write what kind of work you have done over the years, what you learned, and the spirit in which you build.</p>
            <p>Add about four lines here on the way of working. Say that attractive, animated sites are built together with easy-to-edit editors, and that you enjoy solving problems.</p>
            <p>Your main tools here, in about three lines.</p>
          </div>
        </div>
        <nav class="jl-links" data-slot="contact-links" aria-label="Contact">
          <a href="#" aria-label="Mail"><span class="jl-fill"></span><span class="jl-links__icon">${icon.mail}</span></a>
          <a href="#" aria-label="Resume"><span class="jl-fill"></span><span class="jl-links__icon">${icon.paper}</span></a>
          <a href="#" aria-label="Career SNS"><span class="jl-fill"></span><span class="jl-links__icon">${icon.net}</span></a>
          <a href="#" aria-label="Photo SNS"><span class="jl-fill"></span><span class="jl-links__icon">${icon.cam}</span></a>
        </nav>
      </div>
      <div class="jl-about__close"><button type="button" class="jl-x" data-about-close aria-label="Close"></button></div>
    </aside>`);
  document.body.insertAdjacentHTML("beforeend", `<div class="jl-loader" data-slot="loader">${logo("Go")}</div>`);

  // Hover where a yellow panel fills up from below (.4s power3.out)
  document.querySelectorAll(".jl-fill").forEach((f) => {
    const cell = f.parentElement;
    cell.addEventListener("pointerenter", () => gsap.to(f, { scaleY: 1, duration: 0.4, ease: "power3.out" }));
    cell.addEventListener("pointerleave", () => gsap.to(f, { scaleY: 0, duration: 0.4, ease: "power3.out" }));
  });

  // Contact cell lines — in the original ContactLinks too, each cell’s top line · vertical dividers bend toward the cursor
  const linkNav = document.querySelector(".jl-links");
  const linkLayer = document.createElement("div");
  linkLayer.className = "jl-lines";
  linkNav.appendChild(linkLayer);
  linkNav.querySelectorAll("a").forEach((a, k) => { JL.line(linkLayer, "x", a); if (k) JL.line(linkLayer, "y", a); });

  // Loader — four cross lines are drawn in 1s power3.out (.2s apart), the letters stand in 1.5s from blur 10px at .5x, and 1s later shrink to .5x and vanish (.25s back.in(4))
  const loader = document.querySelector(".jl-loader .jl-logo");
  if (reduced) gsap.set(".jl-loader", { display: "none" });
  else {
    gsap.set(loader.querySelectorAll(".jl-logo__line"), { opacity: 0, scaleX: 0 });
    gsap.set(loader.querySelector(".jl-logo__letter"), { opacity: 0 });
    gsap.delayedCall(0.2, () => {
      gsap.to(loader.querySelectorAll(".jl-logo__line"), { opacity: 1, scaleX: 1, duration: 1, stagger: 0.2, ease: "power3.out" });
      gsap.fromTo(loader.querySelector(".jl-logo__letter"), { scale: 0.5, opacity: 0, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.5, ease: "power3.out" });
      gsap.to(loader, { delay: 1, scale: 0.5, opacity: 0, duration: 0.25, ease: "back.in(4)" });
    });
  }

  // Smooth scroll — Lenis defaults, run on the gsap ticker
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const lenis = new Lenis({ autoRaf: false });
    JL.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(raf); lenis.destroy(); };
  });

  // About drawer
  const about = document.querySelector(".jl-about");
  const content = about.querySelector(".jl-about__content");
  const bio = about.querySelector(".jl-about__bio");
  const head = about.querySelector("h1");
  // Split text into individual letters inside word chunks — keep spacing as is so Korean line breaks don’t cut mid-word
  head.innerHTML = head.innerHTML.split(/<br\s*\/?>/).map((line) => line.split(" ").map((w) => `<span class="word">${[...w].map((c) => `<span class="char">${c}</span>`).join("")}</span>`).join(" ")).join("<br>");
  const chars = [...head.querySelectorAll(".char")];
  gsap.set(chars, { opacity: 0 });
  const links = [...about.querySelectorAll(".jl-links__icon")];
  gsap.set(links, { yPercent: 100, opacity: 0 });
  const pushed = () => [document.querySelector("#thumbs-wrap"), document.querySelector("#project-wrap")].filter(Boolean);
  const wide = () => innerWidth >= 650;
  JL.openAbout = () => {
    if (JL.aboutOpen) return;
    JL.aboutOpen = true;
    if (wide()) {
      gsap.fromTo(about, { xPercent: -100, display: "block" }, { xPercent: 0, duration: reduced ? 0 : 1, ease: "expo.out" });
      gsap.fromTo(content, { opacity: 0, xPercent: -20 }, { delay: 0.1, opacity: 1, xPercent: 0, duration: 1, ease: "expo.out" });
      gsap.to(pushed(), { xPercent: innerWidth < 850 ? 50 : 40, duration: 1, ease: "expo.out" });
    } else {
      gsap.to(about, { height: content.offsetHeight + about.querySelector(".jl-links").offsetHeight, duration: 1, ease: "power3.inOut", onComplete: () => gsap.set(about, { height: "auto" }) });
    }
    gsap.fromTo(gsap.utils.shuffle(chars.slice()), { opacity: 0, xPercent: -50, rotation: -30, filter: "blur(5px)" }, { opacity: 1, xPercent: 0, rotation: 0, filter: "blur(0px)", duration: 1, stagger: 0.01, ease: "power3.out" });
    gsap.fromTo(bio, { opacity: 0, y: 20 }, { delay: 0.1, opacity: 1, y: 0, duration: 1, ease: "power3.out" });
    gsap.fromTo(links, { yPercent: 100, opacity: 0 }, { delay: 0.1, yPercent: 0, opacity: 1, duration: 0.75, stagger: 0.35, ease: "power3.out" });
  };
  JL.closeAbout = () => {
    if (!JL.aboutOpen) return;
    JL.aboutOpen = false;
    if (wide()) {
      gsap.to(content, { xPercent: -20, duration: 0.5, ease: "power3.in" });
      gsap.to(about, { delay: 0.1, xPercent: -100, duration: 0.75, ease: "power3.inOut", onComplete: () => gsap.set(about, { display: "none" }) });
      gsap.to(pushed(), { delay: 0.1, xPercent: 0, duration: 0.75, ease: "power3.inOut" });
    } else {
      gsap.fromTo(about, { height: about.offsetHeight }, { height: 0, duration: 1, ease: "power3.inOut" });
    }
  };
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-about-close]")) JL.closeAbout();
    else if (e.target.closest("[data-about-toggle]")) (JL.aboutOpen ? JL.closeAbout : JL.openAbout)();
    else if (e.target.closest("[data-about-open]")) JL.openAbout();
  });
  addEventListener("keydown", (e) => e.key === "Escape" && JL.closeAbout());
})();
