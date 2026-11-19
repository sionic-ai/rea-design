(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Original: run Lenis lerp .1 on the GSAP ticker and update ScrollTrigger on every scroll
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, prevent: (n) => n.closest?.("[data-lenis-prevent]") });
    lenis.on("scroll", () => window.ScrollTrigger && ScrollTrigger.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.twLenis = lenis;

  // Pass skin colors to the 3D scene — even variables made with color-mix are read from actually painted pixels
  const probe = document.createElement("canvas");
  probe.width = probe.height = 1;
  const pctx = probe.getContext("2d", { willReadFrequently: true });
  const swatch = document.createElement("i");
  swatch.style.cssText = "position:absolute;width:0;height:0;visibility:hidden";
  document.body.appendChild(swatch);
  window.twColor = (name) => {
    swatch.style.color = `var(${name})`;
    pctx.clearRect(0, 0, 1, 1);
    pctx.fillStyle = getComputedStyle(swatch).color;
    pctx.fillRect(0, 0, 1, 1);
    const d = pctx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  };

  // Header line: on scroll, a band in the next section’s background color is laid beneath it
  const header = document.querySelector(".tw-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const tintBy = document.querySelectorAll("[data-header-bg]");
  if (header && tintBy.length && window.ScrollTrigger) {
    tintBy.forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: "top 88px", end: "bottom 88px",
        onToggle: (s) => s.isActive && header.style.setProperty("--tw-header-bg", `var(${sec.dataset.headerBg})`),
      });
    });
  }

  // Resources expand — like the original, hovering opens it (.167s after .05s) and leaving closes it after .2s. Pressing toggles it right away (.04s)
  document.querySelectorAll("[data-drop]").forEach((btn) => {
    const panel = document.getElementById(btn.dataset.drop);
    if (!panel) return;
    const item = btn.parentElement;
    let leave = 0;
    const set = (open, quick) => { clearTimeout(leave); btn.setAttribute("aria-expanded", String(open)); panel.classList.toggle("is-shut", !open && !!quick); panel.classList.toggle("is-open", open); if (open) panel.classList.add("is-placed"); };
    if (matchMedia("(hover: hover)").matches) {
      item.addEventListener("pointerenter", () => set(true));
      item.addEventListener("pointerleave", () => { btn.classList.remove("is-pressed"); clearTimeout(leave); leave = setTimeout(() => set(false), 170); });
    }
    btn.addEventListener("click", (e) => { e.stopPropagation(); btn.classList.add("is-pressed"); set(btn.getAttribute("aria-expanded") !== "true", true); });
    document.addEventListener("click", (e) => { if (!panel.contains(e.target)) set(false); });
    document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  });

  // Phone menu drawer
  const burger = document.querySelector(".tw-burger");
  const sheet = document.querySelector(".tw-sheet");
  if (burger && sheet) {
    burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") !== "true";
      burger.setAttribute("aria-expanded", String(open));
      sheet.classList.toggle("is-open", open);
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }

  // Footer live line — short light segments keep flowing over a thin line, and light segments also circle over the dotted wordmark
  if (!reduce && window.gsap) {
    document.querySelectorAll(".tw-footer__rule .live").forEach((p) => {
      gsap.fromTo(p, { strokeDashoffset: 80 }, { strokeDashoffset: -2000, duration: 6, ease: "none", repeat: -1 });
    });
    document.querySelectorAll(".tw-wordmark .flow").forEach((p, i) => {
      gsap.fromTo(p, { strokeDashoffset: 0 }, { strokeDashoffset: -366, duration: 5 + i, ease: "none", repeat: -1 });
    });
  }

  // Video device: 3-second looping placeholder video (the original is an autoplay looping mp4)
  const vid = document.querySelector(".tw-phone__video");
  if (vid) {
    const ctx = vid.getContext("2d");
    const ink = window.twColor("--kf-contrast-ink"), acc = window.twColor("--kf-accent");
    const rgba = (c, a) => `rgba(${c.map((v) => Math.round(v * 255)).join(",")},${a})`; /* Not skin: line that turns a value read from skin variables into a canvas fill */
    let seen = false;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; }).observe(vid);
    const draw = (now) => {
      if (seen) {
        const w = (vid.width = vid.clientWidth * 1.5 || 600), h = (vid.height = vid.clientHeight * 1.5 || 450);
        const k = (now / 3000) % 1;
        const g = ctx.createRadialGradient(w * (0.3 + 0.4 * k), h * 0.45, 10, w * 0.5, h * 0.5, w * 0.7);
        g.addColorStop(0, rgba(acc, 0.55)); g.addColorStop(1, rgba(acc, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = rgba(ink, 0.18);
        for (let i = 0; i < 4; i++) ctx.fillRect(w * 0.1, h * (0.6 + i * 0.08), w * (0.3 + 0.5 * ((k + i * 0.2) % 1)), h * 0.03);
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  // FAQ Tabs · Accordion
  document.querySelectorAll(".tw-faq__tab").forEach((tab, i, all) => tab.addEventListener("click", () => {
    all.forEach((t) => { t.classList.toggle("is-active", t === tab); t.setAttribute("aria-selected", String(t === tab)); });
  }));
  document.querySelectorAll(".tw-faq__q").forEach((q) => q.addEventListener("click", () => q.setAttribute("aria-expanded", String(q.getAttribute("aria-expanded") !== "true"))));

  requestAnimationFrame(() => root.classList.add("is-ready"));
})();
