// Motion shared across the whole site — the original main.js header pin (wy) · footer (by) · section name wipe (Ws) · per-section background color (fl) · ball inside the first panel (yi) and STUDIO reveal · Transition, all with the same values.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" });
  let t;
  new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 100); }).observe(document.body);
  const S = window.anSpheres;
  S?.deactivate();

  const mm = gsap.matchMedia();
  mm.add("(min-width: 841px)", () => {
    const header = document.querySelector(".an-header");
    if (header) ScrollTrigger.create({ trigger: header, pin: true, start: "top top", end: "max", pinSpacing: false });
  });

  const footer = document.querySelector(".an-footer");
  if (footer && !reduce) gsap.fromTo(footer, { "--progress": 0 }, { "--progress": 1, ease: "none", scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: true } });

  // Big section name: once its section head reaches 50% of the screen, it sweeps a color across once in .5s (data-sweep changes the start line)
  document.querySelectorAll(".an-title").forEach((el) => {
    if (reduce) { el.classList.add("is-swept"); return; }
    gsap.set(el, { backgroundSize: "200% 100%", backgroundPosition: "0% 0%" });
    gsap.to(el, { backgroundPosition: "100% 0%", duration: 0.5, ease: "none", scrollTrigger: { trigger: el, once: true, start: el.dataset.sweep || "top 50%" } });
  });

  // STUDIO reveal fires once the cell is about half visible (for cells taller than the screen, once it fills 40% of the screen) — a cell barely touching the bottom edge of the screen is not triggered yet
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting && (e.intersectionRatio >= 0.5 || e.intersectionRect.height >= innerHeight * 0.4)) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] });
  document.querySelectorAll(".an-appear").forEach((el) => io.observe(el));

  // Background color per section: when the section background is empty and the section head passes 50% of the screen, the body background becomes that section’s color (.5s).
  const bgSections = [...document.querySelectorAll("[data-bg]")];
  if (bgSections.length) {
    const colorOf = (el) => { const c = getComputedStyle(el).backgroundColor; return c === "transparent" || /,\s*0\)$/.test(c) ? getComputedStyle(document.body).backgroundColor : c; };
    const colors = bgSections.map(colorOf);
    bgSections.forEach((el, i) => {
      if (i) el.style.background = "transparent";
      const set = () => { document.body.style.background = colors[i]; document.body.style.setProperty("--active-bg-color", colors[i]); };
      ScrollTrigger.create({ trigger: el, start: "top 50%", end: "bottom 50%", onEnter: set, onEnterBack: set });
    });
    bgSections[0].style.background = "var(--active-bg-color, var(--kf-bg))";
    bgSections[0].style.transition = "background-color .5s";
  }

  // Sub-page first panel: while the panel is visible, cut the ball into the panel’s shape and flow it with the panel, and once it leaves the panel turn it back to screen-fixed
  const atf = document.querySelector("[data-spheres-clip]");
  if (atf && S) {
    const keep = atf.dataset.spheresClip === "keep";
    const measure = () => {
      const next = atf.nextElementSibling;
      const h = atf.getBoundingClientRect().height + (next ? parseFloat(getComputedStyle(next).marginTop) : 0);
      document.querySelector(".an-webgl")?.style.setProperty("--clip", `rect(0 100% ${h}px 0)`);
    };
    new ResizeObserver(measure).observe(atf);
    measure();
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { S.clip("var(--clip)"); S.hide(); S.show(); }
      else { S.clip(null); S.hide({ duration: 0 }); if (keep) S.show(); }
    }, { rootMargin: keep ? "-100px 0px 0px" : "0px" }).observe(atf);
  }

  // Phone menu
  const burger = document.querySelector(".an-burger");
  burger?.addEventListener("click", () => document.documentElement.classList.toggle("is-menu"));

  // Transition — when going to another page on the same site the body fades out over .3s, and only a page arrived at this way fades up over .6s (like the original Nuxt, a first load shows immediately)
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-entered")));
  addEventListener("pageshow", (e) => { if (e.persisted) { document.documentElement.classList.add("is-entered"); document.querySelectorAll(".an-page").forEach((p) => p.classList.remove("is-leaving")); } });
  document.querySelectorAll("a[href$='.html']").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || a.target === "_blank" || reduce) return;
      e.preventDefault();
      document.documentElement.classList.remove("is-menu");
      document.querySelectorAll(".an-page").forEach((p) => p.classList.add("is-leaving"));
      try { sessionStorage.setItem("an-nav", "1"); } catch (err) {}
      setTimeout(() => { location.href = a.href; }, 300);
    });
  });
})();
