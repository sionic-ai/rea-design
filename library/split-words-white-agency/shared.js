// All pages — lenis 1.1.18 (1.5s expo, tied to the GSAP tick), header bar and footer as one set, phone menu, FAQ, scroll reveal (off on phones and small tablets, like the original)
(() => {
  const page = document.body.dataset.page;
  const arrow = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5"/></svg>';
  const mark = '<svg viewBox="0 0 10 16" aria-hidden="true"><rect x="0" y="0" width="3" height="16" fill="var(--kf-ink)"/><rect x="5" y="0" width="5" height="7" fill="var(--kf-accent)"/><rect x="5" y="9" width="5" height="7" fill="var(--kf-ink)"/></svg>';
  const links = [["works", "works.html", "Work"], ["service", "service.html", "Services"], ["about", "about.html", "About"], ["news", "news.html", "Blog"]];
  const cur = (k) => (k === page || (k === "news" && page === "article") ? ' aria-current="page"' : "");
  const nav = document.querySelector('.rh-nav[data-slot="nav"]');
  if (nav) {
    nav.innerHTML = `<div class="rh-nav__bar">
    <a class="rh-brand" href="index.html" aria-label="First Page" data-label="Studio logo + two-line English name">${mark}<span>Studio<br>Name</span></a>
    <button class="rh-nav__burger" type="button" aria-expanded="false">Menu <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M2 5h12M2 8h12M2 11h12"/></svg></button>
    <nav class="rh-nav__menu" aria-label="Main menu">${links.map(([k, h, t]) => `<a class="rh-nav__link" href="${h}"${cur(k)}>${t}</a>`).join("")}<a class="rh-nav__link is-contact" href="#contact">Contact ${arrow}</a></nav>
  </div>`;
    const burger = nav.querySelector(".rh-nav__burger"), menu = nav.querySelector(".rh-nav__menu");
    burger.addEventListener("click", () => {
      nav.style.setProperty("--site-menu-h", menu.scrollHeight + "px");
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }
  const foot = document.querySelector('.rh-footer[data-slot="footer"]');
  if (foot) {
    foot.innerHTML = `<div class="rh-footer__grid">
    <div class="rh-footer__block"><span class="rh-footer__label">Our partners</span><span>Describe the place where we work together in one line.</span><a class="rh-brand" href="index.html">${mark}<span>Studio<br>Name</span></a><span class="rh-footer__badge"><span></span>Certified Partner</span></div>
    <div class="rh-footer__block"><span class="rh-footer__label">Address</span><span>Your office address here<br>Note it in two lines</span><a href="#">hello@studio.name</a><a href="#">+00 0000 000000</a></div>
    <div class="rh-footer__block"><span class="rh-footer__label">Our products</span><a href="#">PRODUCT.APP</a><a href="#">PRODUCTTWO.COM</a><a href="#">PRODUCT3.APP</a></div>
    <div class="rh-footer__block is-right"><span class="rh-footer__label">Sitemap</span><a href="index.html">Home</a>${links.map(([, h, t]) => `<a href="${h}">${t}</a>`).join("")}<a href="#contact">Contact</a><span class="rh-footer__label">Socials</span><a href="#">Instagram</a><a href="#">LinkedIn</a></div>
  </div><p class="rh-footer__copy">© Studio Name 2026</p>`;
  }

  // FAQ — on click the answer opens at .5s cubic-bezier(.165,.84,.44,1) and the vertical stroke of the + folds away, click again to close (each independent)
  document.querySelectorAll(".rh-faq__item").forEach((item) => {
    const q = item.querySelector(".rh-faq__q"), a = item.querySelector(".rh-faq__a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const open = q.getAttribute("aria-expanded") !== "true";
      q.setAttribute("aria-expanded", String(open));
      item.style.setProperty("--site-plus", open ? 0 : 1);
      if (!window.gsap) { a.style.height = open ? "auto" : "0"; return; }
      gsap.to(a, { height: open ? "auto" : 0, duration: 0.5, ease: window.kfFx ? kfFx.ease("0.165,0.84,0.44,1", "power3.out") : "power3.out" });
    });
  });

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.siteLenis = lenis;
  }

  // Scroll reveal — Webflow IX3 values (circ.out = 0.075,0.82,0.165,1, ”none” means no curve). Below 768 (original small·tiny) is left as is
  const circ = "circ.out";
  const once = (el, start, fn) => ScrollTrigger.create({ trigger: el, start, once: true, onEnter: fn });
  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const set = (sel, from, to, start = "top bottom") => document.querySelectorAll(sel).forEach((el) => {
      gsap.set(el, from);
      once(el, start, () => gsap.to(el, to));
    });
    set("[data-rv='fade']", { opacity: 0 }, { opacity: 1, duration: 1, ease: "none" });
    set("[data-rv='fade-circ']", { opacity: 0 }, { opacity: 1, duration: 1, ease: circ }, "top bottom");
    set("[data-rv='left']", { x: "-5rem" }, { x: 0, duration: 1, ease: circ });
    set("[data-rv='right']", { x: "5rem" }, { x: 0, duration: 1, ease: circ });
    set("[data-rv='up']", { y: "8rem" }, { y: 0, duration: 1, ease: circ });
    set("[data-rv='year']", { opacity: 0, yPercent: 200 }, { opacity: 1, yPercent: 0, duration: 1, ease: "none" });
    document.querySelectorAll("[data-rv='img']").forEach((w) => {
      const img = w.firstElementChild;
      gsap.set(w, { opacity: 0 });
      if (img) gsap.set(img, { opacity: 0, scale: 1.1 });
      once(w, "top 95%", () => {
        gsap.to(w, { opacity: 1, duration: 0.5, ease: "none" });
        if (img) gsap.to(img, { opacity: 1, scale: 1, duration: 0.8, ease: "none", delay: 0.2 });
      });
    });
    document.querySelectorAll("[data-rv='detail']").forEach((d) => {
      const a = d.querySelector("[data-rv-arrow]");
      gsap.set(d, { opacity: 0 });
      if (a) gsap.set(a, { opacity: 0, xPercent: -100, yPercent: 100 });
      once(d, "top 100%", () => { gsap.to(d, { opacity: 1, duration: 1, ease: "none" }); if (a) gsap.to(a, { opacity: 1, xPercent: 0, yPercent: 0, duration: 1, ease: circ }); });
    });
    document.querySelectorAll("[data-rv='pop']").forEach((grid) => {
      const cells = grid.querySelectorAll("[data-rv-cell]"), names = grid.querySelectorAll("[data-rv-name]");
      gsap.set(cells, { opacity: 0, scale: 0 });
      gsap.set(names, { opacity: 0 });
      once(grid, "top bottom", () => {
        gsap.to(cells, { opacity: 1, scale: 1, duration: 0.5, ease: circ, stagger: { amount: 1, from: "random" } });
        gsap.to(names, { opacity: 1, duration: 0.49, ease: "none", stagger: { amount: 1 } });
      });
    });
    document.querySelectorAll("[data-rv='award']").forEach((w) => {
      const logo = w.querySelector("[data-rv-logo]"), txt = w.querySelectorAll("[data-rv-txt]");
      if (logo) gsap.set(logo, { scale: 0 });
      gsap.set(txt, { opacity: 0 });
      once(w, "top bottom", () => {
        if (logo) gsap.to(logo, { scale: 1, duration: 0.8, ease: circ });
        txt.forEach((t, i) => gsap.to(t, { opacity: 1, duration: 1, ease: "none", delay: i ? 0.34 : 0.14 }));
      });
    });
    // Long text lights up line by line in sequence within .5 (SplitText lines)
    if (window.SplitText) document.querySelectorAll("[data-rv='lines']").forEach((p) => {
      const split = new SplitText(p, { type: "lines" });
      gsap.set(split.lines, { opacity: 0 });
      once(p, "top bottom", () => gsap.to(split.lines, { opacity: 1, duration: 1, ease: "none", stagger: { amount: 0.5 } }));
    });
    return () => gsap.set("[data-rv], [data-rv] *", { clearProps: "opacity,transform" });
  });
})();
