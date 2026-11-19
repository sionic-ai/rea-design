// So that all pages share the same header bar (two-line button at top right), right-side drawer menu and ink-black footer, they are plugged in here.
// The original ties Lenis 1.3.1 defaults (lerp .1) to ScrollTrigger, and page transitions are ordinary navigation.
(() => {
  const isSp = matchMedia("(max-width: 767px)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const MARK = '<svg viewBox="0 0 28 22" fill="none" stroke="currentColor" stroke-width="1"><path d="M1 1c2 4-1 8 1 12s0 6 0 8h4c0-4 2-8 0-12S7 3 6 1zM8.5 1c2 4-1 8 1 12s0 6 0 8h4c0-4 2-8 0-12s1-6 0-8zM16 1c2 4-1 8 1 12s0 6 0 8h4c0-4 2-8 0-12s1-6 0-8zM23 1c1 4-1 8 0 12s0 6 0 8h4V1z"/></svg>';
  const pill = '<span class="n-pill"><span class="n-pill__in"><svg viewBox="0 0 8 8" fill="currentColor"><path d="M0 3.5h6L3.8 1.3l.7-.7L7.9 4 4.5 7.4l-.7-.7L6 4.5H0z"/></svg><svg class="-after" viewBox="0 0 8 8" fill="currentColor"><path d="M0 3.5h6L3.8 1.3l.7-.7L7.9 4 4.5 7.4l-.7-.7L6 4.5H0z"/></svg></span></span>';
  const MENU = [["Top", "index.html"], ["Concept", "index.html#concept"], ["Our Villas", "index.html#villas"], ["News", "news.html"]];
  const PROJ = [["Riverside", "Villa Name One", "riverside.html"], ["Seaside", "Villa Name Two", "seaside.html"]];

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.classList.add("n-header");
    header.innerHTML = `
      ${page === "home" ? "" : `<a class="n-header__logo n-hover-op" href="index.html" data-label="Project logo (mark + wordmark SVG slot)">${MARK}<span>PROJECT NAME</span></a>`}
      <button class="n-burger" type="button" aria-label="Open Menu" aria-expanded="false" data-menu-btn><span class="n-burger__lines"><span></span><span></span></span></button>
      <div class="n-menu__shade" data-menu-shade></div>
      <div class="n-menu n-paper" data-menu-wrap>
        <div class="n-menu__body" data-menu-contents>
          <nav aria-label="Menu"><ul class="n-menu__list en-headline-l">${MENU.map(([t, h]) => `<li data-menu-list><a class="n-hover-op" href="${h}">${t}</a></li>`).join("")}</ul></nav>
          <nav aria-label="Villa">
            <h3 class="n-menu__label en-label-s" data-menu-list>Project</h3>
            <ul class="n-menu__proj en-headline-m">${PROJ.map(([t, s, h]) => `<li data-menu-list><a class="n-hover-op" href="${h}">${t}<small>${s}</small></a></li>`).join("")}</ul>
          </nav>
          <div class="n-menu__mail en-label-s"><p><span>MAIL</span> : <span>info@example.com</span></p><p>Company Name</p></div>
        </div>
      </div>`;
  }

  const footer = document.querySelector("[data-slot=footer]");
  if (footer) {
    footer.classList.add("n-footer");
    footer.innerHTML = `
      <div class="n-footer__grid">
        <a class="n-footer__logo n-hover-op" href="index.html" data-label="Project logo (mark + wordmark SVG slot)">${MARK}<span>PROJECT NAME</span></a>
        <nav class="n-footer__menu" aria-label="Footer Menu"><h3 class="en-label-s">Menu</h3><ul class="en-headline-m">${MENU.map(([t, h]) => `<li><a class="n-hover-op" href="${h}">${t}</a></li>`).join("")}</ul></nav>
        <nav class="n-footer__proj" aria-label="Villa"><h3 class="en-label-s">Project</h3><ul class="en-headline-m">${PROJ.map(([t, s, h]) => `<li><a class="n-hover-op n-footer__projLink" href="${h}"><span>${t.toUpperCase()}</span><small class="en-label-xxs">${s}</small></a></li>`).join("")}</ul></nav>
        <div class="n-footer__by en-label-s"><p>Project by</p><p class="en-label-m">Company Name</p></div>
        <div class="n-footer__mail en-label-s"><p>Mail</p><p class="en-label-m">info@example.com</p></div>
        <p class="n-footer__copy en-label-xxs">Copyright © Company Name. All Rights Reserved.</p>
      </div>`;
  }

  // ───── Smooth scroll ─────
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis();
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"], a[href^="index.html#"]');
    if (!a || (page !== "home" && a.getAttribute("href").startsWith("index"))) return;
    const t = document.querySelector(a.hash);
    if (!t) return;
    e.preventDefault();
    closeMenu();
    lenis ? lenis.scrollTo(t) : t.scrollIntoView({ behavior: "smooth" });
  });

  // ───── Menu drawer — the panel slides in from 100px on the right over 1.2s power2.out, the inner text follows .3s later over .8s, and each line rises from 30px at .1s intervals over 1.3s power3.out ─────
  const btn = document.querySelector("[data-menu-btn]");
  const wrap = document.querySelector("[data-menu-wrap]");
  const contents = document.querySelector("[data-menu-contents]");
  const lists = document.querySelectorAll("[data-menu-list]");
  const shade = document.querySelector("[data-menu-shade]");
  let open = false;
  if (wrap) {
    gsap.set(wrap, { autoAlpha: 0, x: 100 });
    gsap.set(contents, { autoAlpha: 0 });
    gsap.set(lists, { autoAlpha: 0, x: 30 });
  }
  function openMenu() {
    open = true;
    btn.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
    wrap.classList.add("is-open"); shade.classList.add("is-open");
    lenis?.stop();
    // In the original, Alpine turns on the curtain (.15s) first and the panel tween runs after it — panel·text are two frames late
    requestAnimationFrame(() => requestAnimationFrame(() => {
    gsap.fromTo(wrap, { autoAlpha: 0, x: isSp ? 0 : 100, y: isSp ? -30 : 0 }, { autoAlpha: 1, x: 0, y: 0, duration: isSp ? 1.1 : 1.2, ease: "power2.out", overwrite: true });
    gsap.fromTo(contents, { autoAlpha: 0 }, { autoAlpha: 1, delay: 0.3, duration: 0.8, overwrite: true });
    gsap.fromTo(lists, { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, delay: 0.1, duration: 1.3, stagger: 0.1, ease: "power3.out", overwrite: true });
    }));
  }
  function closeMenu() {
    if (!open) return;
    open = false;
    btn.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false");
    wrap.classList.remove("is-open"); shade.classList.remove("is-open");
    lenis?.start();
    gsap.to(wrap, { autoAlpha: 0, duration: 0.5, overwrite: true });
    gsap.to(contents, { autoAlpha: 0, duration: 0.5, overwrite: true });
    gsap.to(lists, { autoAlpha: 0, duration: 0.5, overwrite: true });
  }
  btn?.addEventListener("click", () => (open ? closeMenu() : openMenu()));
  shade?.addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  // ───── Change the header button color to that of the section touching the 60px line from the top of the screen ─────
  const marks = document.querySelectorAll("[data-change-color]");
  if (marks.length) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const c = e.target.getAttribute("data-change-color");
      document.documentElement.style.setProperty("--site-header", c === "white" ? "var(--kf-contrast-ink)" : "var(--kf-ink)");
    }), { rootMargin: `0px 0px -${innerHeight - 60}px 0px`, threshold: 0 });
    marks.forEach((m) => io.observe(m));
  }

  // ───── Floats up in 2s when visible — once it enters 150px above the screen bottom ─────
  const fades = document.querySelectorAll(".n-fade");
  if (reduce) fades.forEach((f) => f.classList.add("is-active"));
  else {
    const io = new IntersectionObserver((es, o) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-active"); o.unobserve(e.target); } }), { rootMargin: "0px 0px -150px 0px" });
    fades.forEach((f) => io.observe(f));
  }

  const holdHover = (el) => {
    if (el.dataset.holdOn) return;
    el.dataset.holdOn = "1";
    const t = +(el.dataset.hold || 0.5) * 1000;
    let done = false, timer = 0, leftEarly = false;
    el.addEventListener("mouseenter", () => {
      if (done) return;
      el.classList.add("is-hover"); leftEarly = false;
      clearTimeout(timer);
      timer = setTimeout(() => { done = true; if (leftEarly) { el.classList.remove("is-hover"); done = false; } }, t);
    });
    el.addEventListener("mouseleave", () => {
      if (done) { el.classList.remove("is-hover"); done = false; clearTimeout(timer); } else leftEarly = true;
    });
  };
  const holdAll = () => document.querySelectorAll(".n-lineLink, .h-news__all").forEach(holdHover);
  addEventListener("DOMContentLoaded", holdAll);
  holdAll();

  window.NH = { lenis, isSp, reduce, pill };
})();
