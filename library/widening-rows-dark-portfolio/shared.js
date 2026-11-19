// Shared across the site — inserting header, phone menu and footer, smooth scroll (lenis lerp .085), header hiding, text-line rise, fade-up, video slot playback, small parallax.
// Cursor, marquee, numbers, preview and hero expansion are handled by the motion part (_fx)
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  root.classList.add("js");
  const page = document.body.dataset.page || "home";
  const ARROW = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 9 9 3M4 3h5v5"/></svg>';
  const NAV = [["home", "index.html", "Home"], ["works", "works.html", "Work"], ["about", "about.html", "About"], ["journal", "index.html#work", "Journal"], ["program", "index.html#program", "Program"], ["reel", "index.html", "Reel"], ["contact", "#contact", "Contact"]];
  const cur = (k) => (k === page || (page === "detail" && k === "works") ? ' aria-current="page"' : "");

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "sb-header";
    head.insertAdjacentHTML("beforebegin", '<a class="sb-skip" href="#main">Skip to content</a>');
    head.innerHTML = `<a class="sb-logo" href="index.html" data-label="Initial symbol + name wordmark"><span class="sb-logo__mark">S<i>/</i>N</span><span class="sb-logo__name sb-label">Studio Name</span></a>
      <nav class="sb-nav" aria-label="Main menu">${NAV.map(([k, h, t], i) => `<a href="${h}"${cur(k)}><small class="sb-mono">${String(i + 1).padStart(2, "0")}</small><span class="sb-roll" data-text="${t}"><span>${t}</span></span></a>`).join("")}</nav>
      <button class="sb-burger" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>`;
    const menu = document.createElement("div");
    menu.className = "sb-menu";
    menu.hidden = true;
    menu.setAttribute("data-slot", "mobile-menu");
    menu.innerHTML = `<nav class="sb-wrap" aria-label="Phone menu">${NAV.map(([k, h, t], i) => `<a class="sb-display" href="${h}"${cur(k)}><span class="sb-mono sb-accent">${String(i + 1).padStart(2, "0")}</span><span>${t}</span></a>`).join("")}</nav>
      <div class="sb-menu__foot sb-wrap sb-mono"><a href="#">Profile one ${ARROW}</a><a href="#">Profile two ${ARROW}</a><a href="#">Profile three ${ARROW}</a></div>`;
    head.after(menu);
  }
  document.querySelector("main")?.setAttribute("id", "main");
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "sb-footer sb-wrap sb-mono";
    foot.innerHTML = '<span>Built with care by Studio Name © 2026</span><span class="sb-footer__legal"><a class="sb-ulink" href="#">Privacy &amp; Cookies</a><a class="sb-ulink" href="#">Terms</a></span>';
  }
  document.body.insertAdjacentHTML("beforeend", '<div class="sb-grain" aria-hidden="true"></div>');

  // ---------- Smooth scroll ----------
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, anchors: { offset: -40 } });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
  }

  // ---------- Header — hides after scrolling past 160px, thins past 40px, and is transparent over the hero ----------
  const header = document.querySelector(".sb-header");
  if (header) {
    const hero = document.querySelector("[data-hero], [data-fx~='pin-media-expand']");
    let last = 0;
    const set = (y) => {
      header.classList.toggle("is-hidden", y > 160 && y > last && !document.body.classList.contains("menu-open"));
      header.classList.toggle("is-scrolled", y > 40);
      header.classList.toggle("is-transparent", !!hero && y < hero.offsetHeight - header.offsetHeight);
      last = y;
    };
    set(scrollY);
    lenis ? lenis.on("scroll", ({ scroll }) => set(scroll)) : addEventListener("scroll", () => set(scrollY), { passive: true });
    const btn = header.querySelector(".sb-burger"), menu = document.querySelector(".sb-menu");
    btn?.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.classList.toggle("menu-open", open);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => menu.classList.add("is-open"));
        lenis?.stop();
        gsap.fromTo(menu.querySelectorAll("nav a"), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.06, delay: 0.25 });
      } else {
        menu.classList.remove("is-open");
        lenis?.start();
        setTimeout(() => { menu.hidden = true; }, 800);
      }
    });
    menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { if (btn.getAttribute("aria-expanded") === "true") btn.click(); }));
  }

  // ---------- Fade-up and text lines ----------
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
  if (!reduce) {
    document.querySelectorAll("[data-split]").forEach((el) => {
      if (el.closest("[data-hero]")) return;
      const lines = el.querySelectorAll(".sb-mask > span");
      gsap.set(lines, { yPercent: 110 });
      ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => gsap.to(lines, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.08 }) });
    });
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      const t = +(el.dataset.parallax || 10);
      gsap.fromTo(el, { yPercent: -t }, { yPercent: t, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
    });
    document.querySelectorAll("[data-award-row]").forEach((el, i) => {
      gsap.from(el, { opacity: 0, y: 24, duration: 1, ease: "expo.out", delay: (i % 10) * 0.05, scrollTrigger: { trigger: el, start: "top 92%", once: true } });
    });
  }
  // Video slot — plays 200px before entering the screen, pauses when out of view
  const vio = new IntersectionObserver((es) => es.forEach((e) => { const v = e.target; if (e.isIntersecting) { if (v.preload === "none") v.preload = "auto"; v.play?.().catch(() => {}); } else v.pause?.(); }), { rootMargin: "200px 0px" });
  if (!reduce) document.querySelectorAll("video[data-autoplay]").forEach((v) => vio.observe(v));
  // Large type sized to fit the cell width
  const fits = [...document.querySelectorAll("[data-fit]")];
  const fit = () => fits.forEach((el) => {
    const p = el.parentElement, cs = getComputedStyle(p), w = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    el.style.fontSize = "100px";
    el.style.fontSize = `${(100 * w * 0.99) / el.scrollWidth}px`;
  });
  if (fits.length) { fit(); document.fonts?.ready.then(fit); addEventListener("resize", fit); }
  document.querySelectorAll("[data-to-top]").forEach((b) => b.addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: "smooth" }))));
  addEventListener("load", () => ScrollTrigger.refresh());
})();
