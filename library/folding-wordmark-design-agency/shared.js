/* Shared by all pages — wordmark stand-up, header hide, one-line news swap, menu drawer, cursor strip, fade-in reveal, lazy loading, collapse, footer wordmark. 
   Original values: drawer 1s power3.inOut, items x100 .6s (starts at .3) · blur10 .6s (starts at .2) · cursor follows at 1/10, bar turns on in .1s ·
   Appear blur 5px/.3 → .8s ease (at the 90% line of the screen) · footer letters y180vh → 0 back.inOut 1s stagger .05, asterisk 720° over 3s then .6 → 1 */
(() => {
  const root = document.documentElement;
  const mm = gsap.matchMedia();
  gsap.registerPlugin(ScrollTrigger);
  const isHome = document.body.dataset.page === "home";

  // ── Wordmark: stand each piece of text up to measure its width and fit the viewBox — so each piece can rise separately ──
  const NS = "http://www.w3.org/2000/svg";
  async function buildMark(svg) {
    const word = svg.dataset.word || "Brand*";
    const fs = 300;
    svg.textContent = "";
    const g = document.createElementNS(NS, "g");
    svg.append(g);
    // The frame is fitted to the glyph ink (cap-height line to baseline) — getBBox gives the font em box, which is empty below and throws the bottom off by 20px.
    // This weight is only loaded after the svg text exists, so load it directly before measuring
    const probe = document.createElementNS(NS, "text");
    g.append(probe);
    // Capture the value as a string before detaching — getComputedStyle is a live object so it reads empty after detaching
    const { fontWeight: weight, fontFamily: family } = getComputedStyle(probe);
    probe.remove();
    if (document.fonts) await document.fonts.load(`${weight} ${fs}px ${family}`, word).catch(() => {});
    const ctx = document.createElement("canvas").getContext("2d");
    const ink = (s, size) => { ctx.font = `${weight} ${size}px ${family}`; return ctx.measureText(s); };
    const base = ink(word.replace(/[*®]/g, ""), fs);
    const cap = base.actualBoundingBoxAscent, desc = Math.max(0, base.actualBoundingBoxDescent);
    let x = 0, right = 0;
    for (const ch of word) {
      const size = ch === "*" ? fs * 0.75 : ch === "®" ? fs * 0.16 : fs;
      const m = ink(ch, size);
      const t = document.createElementNS(NS, "text");
      t.textContent = ch;
      t.setAttribute("font-size", size);
      // Asterisk and registered marks align their ink top to the capital top line
      t.setAttribute("y", ch === "*" || ch === "®" ? (-(cap - m.actualBoundingBoxAscent)).toFixed(1) : 0);
      t.setAttribute("x", x.toFixed(1));
      if (ch === "*") t.classList.add("is-star");
      if (ch === "®") t.classList.add("is-reg");
      g.append(t);
      right = x + m.actualBoundingBoxRight;
      x += m.width + (ch === "*" ? fs * 0.03 : -fs * 0.035);
    }
    const left = -base.actualBoundingBoxLeft, w = right - left;
    // With data-ratio (height/width), an empty strip is added on top to make the same height ratio as the original wordmark — so the cell height stays the same even if the placeholder text width differs
    const h = Math.max(cap + desc, w * (+svg.dataset.ratio || 0));
    svg.setAttribute("viewBox", `${left.toFixed(1)} ${(desc - h).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMax meet");
  }
  const marks = [...document.querySelectorAll("svg.fr-wm")];
  const ready = (document.fonts ? document.fonts.ready : Promise.resolve())
    .then(() => Promise.all(marks.map(buildMark)))
    .then(() => ScrollTrigger.refresh());
  window.frReady = ready;

  // ── Header: after the first screen (Hero), rolling the wheel down hides it and rolling up shows it (the original watches wheel direction, not scroll direction) ──
  const head = document.querySelector(".fr-head");
  let down = false;
  function checkScroll() {
    down = window.scrollY > window.innerHeight;
    head.classList.toggle("is-down", down);
    if (!down) head.classList.remove("is-shade");
  }
  window.addEventListener("scroll", checkScroll, { passive: true });
  window.addEventListener("wheel", (e) => { if (down) head.classList.toggle("is-shade", e.deltaY >= 0); }, { passive: true });
  checkScroll();

  // ── One-line news: Swiper fade, loop, auto-advance (data-timing ms) ──
  const tag = document.querySelector(".fr-tagline");
  if (tag && window.Swiper) {
    new Swiper(tag, { spaceBetween: 30, effect: "fade", loop: true, autoplay: { delay: +tag.dataset.timing || 5000, disableOnInteraction: false } });
  }

  // ── Menu Drawer ──
  const draw = document.querySelector(".fr-draw");
  const backdrop = document.querySelector(".fr-backdrop");
  const landing = document.querySelector(".fr-landing");
  let open, dock;
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (c) => {
    const d = c.conditions.reduce ? 0 : 1;
    open = gsap.timeline({ paused: true })
      .to(draw, { duration: 1 * d, right: 0, ease: "power3.inOut" })
      .from(".fr-draw .draw-stag", { opacity: 0, x: 100, ease: "power3.inOut", duration: 0.6 * d }, 0.3 * d)
      .from(".fr-draw .draw-stag", { filter: "blur(10px)", ease: "power3.inOut", duration: 0.6 * d }, 0.2 * d)
      .reversed(true);
    dock = gsap.timeline({ paused: true });
    if (landing) dock.to(landing, { width: "56vw", left: 32, xPercent: 0, ease: "power3.inOut", duration: 0.9 * d });
  });
  function toggleDraw() {
    const on = draw.classList.toggle("is-open");
    backdrop.classList.toggle("is-on", on);
    if (on) {
      open.play();
      if (window.scrollY <= 0 && landing) { document.body.classList.add("no-scroll"); dock.play(); }
    } else {
      open.reverse();
      document.body.classList.remove("no-scroll");
      if (window.scrollY <= 0 && landing) dock.reverse();
    }
  }
  document.querySelectorAll("[data-menu]").forEach((b) => b.addEventListener("click", toggleDraw));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && draw.classList.contains("is-open")) toggleDraw(); });

  // ── Contact form panel ──
  const form = document.querySelector(".fr-form");
  document.querySelectorAll("[data-form]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); form.classList.toggle("is-on"); }));

  // ── Collapse: on open, height .5s then darkening .8s (.5 late), on close, fade .8s · height .3s (.5 late) ──
  document.querySelectorAll("[data-toggle]").forEach((sum) => {
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      const box = sum.closest(".fr-toggle, .draw-stag");
      const body = box.querySelector(".fr-toggle__body, .fr-drop");
      const on = box.classList.toggle("is-open");
      sum.setAttribute("aria-expanded", on);
      gsap.killTweensOf(body);
      if (on) { gsap.to(body, { height: "auto", duration: 0.5 }); gsap.to(body, { opacity: 1, duration: 0.8, delay: 0.5 }); }
      else { gsap.to(body, { opacity: 0, duration: 0.8 }); gsap.to(body, { height: 0, duration: 0.3, delay: 0.5 }); }
    });
  });

  // ── Cursor band: follows the pointer spot at 1/10 per step, and over a data-cursor panel streams that panel’s text (data-tag) in uppercase ──
  const cur = document.querySelector(".fr-cursor");
  if (cur && matchMedia("(hover: hover) and (min-width: 1000px)").matches) {
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }, at = { ...pos };
    document.addEventListener("mousemove", (e) => { pos.x = e.clientX; pos.y = e.clientY; });
    gsap.ticker.add(() => {
      at.x += (pos.x - at.x) / 10;
      at.y += (pos.y - at.y) / 10;
      cur.style.transform = `translate(${at.x}px, ${at.y}px)`;
    });
    const runs = cur.querySelectorAll(".fr-cursor__run span");
    document.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseover", () => {
        if (el.dataset.cursor !== "pointer") return;
        runs.forEach((s) => (s.textContent = el.dataset.tag || ""));
        gsap.to(cur, { opacity: 1, duration: 0.1, width: "auto", height: "auto", padding: "10px 10px 8px 10px" });
      });
      el.addEventListener("mouseout", () => gsap.to(cur, { opacity: 0, duration: 0.1, width: 0, height: 0, padding: 0 }));
    });
  }

  // ── Reveal: once when it crosses the 90% line of the screen ──
  document.querySelectorAll(".fr-enter").forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => el.classList.add("is-in") });
  });

  // ── Lazy loading: photo slots become loaded 300px before the screen, video gets its src and plays once it is on screen ──
  const near = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-loaded"); near.unobserve(e.target); } }), { rootMargin: "300px" });
  document.querySelectorAll(".fr-lazy").forEach((el) => near.observe(el));
  const vids = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const v = e.target;
    v.src = v.dataset.src;
    v.load();
    v.onloadeddata = () => { v.classList.add("is-loaded"); v.play().catch(() => {}); };
    vids.unobserve(v);
  }));
  document.querySelectorAll("video[data-src]").forEach((v) => vids.observe(v));

  // ── Footer wordmark: when the footer’s top edge reaches screen center, letters rise one by one and the asterisk spins twice while breathing ──
  ready.then(() => {
    const big = document.querySelector(".fr-bigmark .fr-wm");
    if (!big) return;
    const glyphs = big.querySelectorAll("text");
    const star = big.querySelector(".is-star");
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(glyphs, { y: () => innerHeight * 1.8 });
      gsap.to(glyphs, {
        y: 0, ease: "back.inOut", duration: 1, stagger: 0.05,
        scrollTrigger: {
          trigger: ".fr-foot", start: "top 50%",
          onEnter: () => {
            if (!star) return;
            gsap.timeline()
              .to(star, { rotate: 720, duration: 3, transformOrigin: "center center", ease: "back.inOut", delay: 0.2 })
              .to(star, { scale: 0.6, duration: 2, delay: 0.3, transformOrigin: "center center", ease: "power2.inOut" }, "<")
              .to(star, { scale: 1, duration: 1, transformOrigin: "center center", ease: "back.inOut" }, ">");
          },
        },
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(glyphs, { y: 0 }));
  });
})();
