// Shared by all pages — Lenis smooth scroll (original Framer SmoothScroll: Lenis 1.1.9, duration 1), phone menu, entrance, thin line drawing, light passing over the chrome wordmark
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) root.classList.add("is-reduced");

  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1 });
    window.dvLenis = lenis;
    if (window.ScrollTrigger) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  // Links within the same Contact page scroll with Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const t = id.length > 1 && document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    drawer?.classList.remove("is-open");
    lenis ? lenis.scrollTo(t, { offset: -70 }) : t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }));

  // Phone menu — a white panel peels down from the top
  const drawer = document.querySelector(".dv-drawer");
  const btn = document.querySelector(".dv-menu-btn");
  btn?.addEventListener("click", () => {
    const on = drawer.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(on));
    btn.textContent = on ? "Close" : "Menu";
    on ? lenis?.stop() : lenis?.start();
  });

  const els = [...document.querySelectorAll("[data-reveal]")];
  const lines = [...document.querySelectorAll("[data-draw]")];
  if (reduce || !window.gsap) { els.forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; }); return; }

  // Original Framer layout transition curve — the box becomes its new size at once and the transform unwinds from the old position
  const layoutEase = window.CustomEase ? CustomEase.create("dvLayout", "0.3,0.85,0.9,1") : "power2.out";
  const backEase = window.CustomEase ? CustomEase.create("dvLayoutBack", "0,0.5,0.1,1") : "power3.out";
  // Large work list card — curves matched to that page’s original record (title scale, subtitle position, return position, return scale).
  const ce = (n, v) => (window.CustomEase ? CustomEase.create(n, v) : "power3.out");
  const big = { inScale: ce("dvBigInScale", "0.3,0.7,0.3,1"), inMove: ce("dvBigInMove", "0.2,0.85,0.1,1"), outMove: ce("dvBigOutMove", "0.2,0.5,0.2,1"), outScale: ce("dvBigOutScale", "0.1,0.85,0.1,1") };
  // The original draws the first frame with the old-position transform left as is — it holds one frame and then releases
  const hold = 0.02;
  // The title box at rest is ”text width + 224.5px” (same shrink as the original 304 → 79.5px)
  const restWidth = (b) => { b.style.width = "max-content"; const w = b.getBoundingClientRect().width; b.style.width = ""; b.style.setProperty("--dv-rest-w", `${Math.round((w + 224.5) * 100) / 100}px`); };

  // Work card — on hover another video layer plays, the title box shrinks from 304px to text width (.7s), and the subtitle unfolds from the bottom right (.667s).
  // On leaving, the box returns to 304px and the title unfolds from where it had stretched sideways (.533s)
  document.querySelectorAll(".dv-work").forEach((card) => {
    const alt = card.querySelector(".dv-work__alt video");
    const meta = card.querySelector(".dv-work__meta"), title = meta?.querySelector("b"), sub = meta?.querySelector("span");
    if (title) restWidth(title);
    // Full-width cards in the work list (work-grid) are a different part in the original so lengths differ (values measured by that page’s motion-probe)
    const isBig = card.classList.contains("wk__card");
    card.addEventListener("pointerenter", () => {
      alt?.play().catch(() => {});
      clearTimeout(card._out);
      card.classList.add("is-hov");
      if (!title || !sub) return;
      gsap.fromTo(title, { scaleX: 2.18 }, { scaleX: 1, duration: isBig ? 0.786 : 0.794, delay: hold, ease: isBig ? big.inScale : layoutEase, transformOrigin: "0 50%", overwrite: true });
      gsap.fromTo(sub, { x: -34.35, y: 44.81 }, { x: 0, y: 0, duration: isBig ? 0.773 : 0.763, delay: hold, ease: isBig ? big.inMove : layoutEase, overwrite: true });
    });
    // On leaving, as in the original, 45ms later the box returns to 304px and at that moment the title releases from its sideways-stretched position (.533s)
    card.addEventListener("pointerleave", () => {
      alt?.pause();
      clearTimeout(card._out);
      const back = () => {
        card.classList.remove("is-hov");
        if (!title) return;
        // The big card in the work list reverts without waiting, and position (.88s) and scale (.65s) release separately
        if (isBig) {
          gsap.fromTo(title, { x: 83.17, y: -25.86 }, { x: 0, y: 0, duration: 0.86, ease: big.outMove, overwrite: "auto" });
          gsap.fromTo(title, { scaleX: 3.74, scaleY: 1.29 }, { scaleX: 1, scaleY: 1, duration: 0.77, ease: big.outScale, transformOrigin: "0 50%", overwrite: "auto" });
        } else gsap.fromTo(title, { x: 83.17, y: -25.86, scaleX: 3.74, scaleY: 1.29 }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.7, delay: hold, ease: backEase, transformOrigin: "0 50%", overwrite: true });
      };
      if (isBig) back(); else card._out = setTimeout(back, 45);
    });
  });

  // Footer mail — on hover the text box widens 14px and fades to .4, and from its old spot narrows slightly to the left and releases (.417s). Reverses on leave
  // Mail link — original Framer layout transition: widen the cell by 14px at once and release the x and scale inverse correction with a .65s spring
  const spring650 = getComputedStyle(root).getPropertyValue("--site-spring-650").trim() || "ease-out";
  document.querySelectorAll("[data-squish]").forEach((a) => {
    const t = a.querySelector("span");
    const play = (x, s) => t.animate([{ transform: `translateX(${x}px) scaleX(${s})` }, { transform: "none" }], { duration: 650, easing: spring650 });
    a.addEventListener("pointerenter", () => { t.style.width = `${t.getBoundingClientRect().width + 14}px`; play(-6.7, 0.95); });
    a.addEventListener("pointerleave", () => { t.style.width = ""; play(6.77, 1.05); });
  });

  // Entrance — 30px below and transparent → in place (default .8s power3.out)
  const io = new IntersectionObserver((ents) => ents.filter((e) => e.isIntersecting).forEach((e, i) => {
    io.unobserve(e.target);
    // When an element’s original values differ, takes them via data-reveal-dur, -delay, -ease (e.g. article header photo)
    const d = e.target.dataset;
    gsap.to(e.target, { opacity: 1, y: 0, duration: +(d.revealDur || 0.8), ease: d.revealEase || "power3.out", delay: +(d.revealDelay || 0) + i * 0.08 });
  }), { rootMargin: "0px 0px -10% 0px" });
  els.forEach((el) => io.observe(el));

  // Thin line — drawn from left to right when it enters the screen
  gsap.set(lines, { scaleX: 0 });
  const lo = new IntersectionObserver((ents) => ents.filter((e) => e.isIntersecting).forEach((e) => {
    lo.unobserve(e.target);
    gsap.to(e.target, { scaleX: 1, duration: 1.2, ease: "power2.inOut", delay: +(e.target.dataset.lineDelay || 0) });
  }), { rootMargin: "0px 0px -5% 0px" });
  lines.forEach((l) => lo.observe(l));

  // Chrome wordmark — a line of light slowly passes across
  const shine = document.querySelector(".dv-mark__shine");
  if (shine) gsap.fromTo(shine, { attr: { x: -400 } }, { attr: { x: 1600 }, duration: 6, ease: "none", repeat: -1, repeatDelay: 1 });
})();
