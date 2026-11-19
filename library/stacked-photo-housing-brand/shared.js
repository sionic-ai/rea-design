// One shared set for Brand — fits the header bar, phone menu, contact section and footer on every page, and hooks up Lenis, interaction response and footer reveal
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  gsap.registerPlugin(ScrollTrigger);

  const logo = () => `<span class="ai-logo" data-label="Brand English name"><svg viewBox="0 0 30 40" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 39V16L15 5l12 11v23"/><path d="M11 39V26h8v13"/><path d="M15 1v4"/></svg><span class="ai-logo__word">Name</span></span>`;
  const slash = '<svg viewBox="0 0 17 24" fill="none" stroke="currentColor" stroke-width="2" preserveAspectRatio="none" aria-hidden="true"><path d="M1 23 16 1"/></svg>';
  // English line link — underline and slash at the end (slash-redraw-hover)
  const line = (t, href = "#", cls = "") => `<a class="ai-line ${cls}" href="${href}" data-fx="slash-redraw-hover"><span class="ai-line__text" data-fx-part="label"><span>${t}</span></span><span class="ai-line__line"><span class="ai-line__rail" data-fx-part="line"></span><span class="ai-line__slash" data-fx-part="slash">${slash}</span></span></a>`;
  const arrowMark = '<svg viewBox="0 0 22 5" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 4.5h21L16.5.5"/></svg>';
  const arrow = (t, i = "", href = "#") => `<a class="ai-arrow" href="${href}" data-fx="slash-redraw-hover" data-fx-slash-redraw-hover="look: arrow"><span class="ai-arrow__inner">${i ? `<span class="ai-arrow__index">${i}</span>` : ""}<span class="ai-arrow__text" data-fx-part="label">${t}</span></span><span class="ai-arrow__mark">${arrowMark}</span><span class="ai-arrow__rail" data-fx-part="line"></span></a>`;
  window.ai = { logo, line, arrow, arrowMark };
  // Placeholders in the page html — [data-line] is an English line link, [data-arrow] is an arrow line link, [data-logo] is the logo.
  window.ai.fill = (root = document) => {
    root.querySelectorAll("[data-line]").forEach((el) => { el.outerHTML = line(el.dataset.line, el.dataset.href || "#", el.className); });
    root.querySelectorAll("[data-arrow]").forEach((el) => { el.outerHTML = arrow(el.dataset.arrow, el.dataset.index || "", el.dataset.href || "#"); });
    root.querySelectorAll("[data-logo]").forEach((el) => { el.innerHTML = logo(); });
  };

  const nav = [["Works", "works.html"], ["About us", "about.html"], ["Service", "service.html"], ["Blog", "news.html"], ["Contact", "#contact"]];
  const insta = '<svg viewBox="0 0 17 17" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="16" height="16" rx="4.5"/><circle cx="8.5" cy="8.5" r="3.6"/><circle cx="13" cy="4" r=".6" fill="currentColor"/></svg>';
  const header = `
    <div class="ai-header__inner">
      <a href="index.html" aria-label="First Page">${logo()}</a>
      <button class="ai-header__menu" type="button" aria-label="Menu" data-menu-open><span class="ai-header__menuInner"><span class="ai-header__menuLine"></span><span class="ai-header__menuLine"></span><span class="ai-header__menuLine"></span></span></button>
      <nav class="ai-header__nav" aria-label="Main menu">
        <ul class="ai-header__list">${nav.map(([t, h]) => `<li><a class="ai-header__link" href="${h}"><span class="ai-header__text is-ghost" aria-hidden="true">${t}</span><span class="ai-header__text">${t}</span></a></li>`).join("")}</ul>
        <a class="ai-header__icon" href="#" aria-label="Instagram"><span class="ai-header__iconItem is-ghost">${insta}</span><span class="ai-header__iconItem">${insta}</span></a>
      </nav>
    </div>`;
  const menu = `<div class="ai-menu__inner">${nav.map(([t, h]) => `<a class="ai-menu__link ai-y" href="${h}">${t}</a>`).join("")}</div>`;
  const contact = `
    <div class="ai-contact__inner">
      <div class="ai-contact__content">
        <div class="ai-contact__contentInner">
          <div class="ai-contact__square" data-contact="1">
            <div class="ai-contact__squareItem" data-item="1"></div>
            <div class="ai-contact__squareItem" data-item="2"><div class="wf-img" data-label="Living room sofa · Square"></div></div>
            <div class="ai-contact__squareItem" data-item="3"><div class="wf-img" data-label="Entrance exterior · square"></div></div>
            <div class="ai-contact__squareItem" data-item="4"><div class="wf-img" data-label="Kitchen table · Square"></div></div>
            <div class="ai-contact__squareItem" data-item="5"><div class="wf-img" data-label="Family consultation scene · square"></div></div>
          </div>
          <h2 class="ai-contact__headline"><span>Contact</span></h2>
        </div>
      </div>
      <div class="ai-contact__bottom">
        <p class="ai-contact__text">If you are worried about buying a home or want to know more about the building,<br>Add two lines inviting people to feel free to ask.</p>
        <div class="ai-contact__link">${line("Contact form")}</div>
      </div>
    </div>`;
  const fnav = [["About us", ["Building our home", "Profile", "Company overview"]], ["Works", ["Housing sale", "Custom Home", "Play", "Others"]], ["Service", ["Home-building flow", "Construction and Aftercare Support"]], ["Blog", ["Blog", "News"]]];
  const footer = `
    <div class="ai-footer__inner">
      <div class="ai-footer__bg"><div class="ai-footer__bgItem" data-footer-bg></div></div>
      <div class="ai-footer__content">
        <a class="ai-footer__logo ai-y" href="index.html">${logo()}</a>
        <div class="ai-footer__nav">
          <ul class="ai-footer__list">${fnav.map(([t, kids]) => `<li class="ai-footer__item"><a class="ai-footer__label ai-move" href="#" data-move><span class="ai-move__item ai-y" data-move-item><span class="ai-footer__labelText">${t}</span><span class="ai-move__arrow">${arrowMark}</span></span></a><ul class="ai-footer__child">${kids.map((k) => `<li><a class="ai-footer__childLink ai-move" href="#" data-move><span class="ai-y" data-move-item style="display:block">${k}</span></a></li>`).join("")}</ul></li>`).join("")}</ul>
          <div class="ai-footer__contact"><div class="ai-y">${line("Contact form")}</div></div>
        </div>
        <p class="ai-footer__copy"><span class="ai-footer__copyItem" data-copy>© Company Name All rights reserved.</span></p>
      </div>
    </div>`;
  const put = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; return el; };
  const headerEl = put('[data-slot="header"]', header);
  const menuEl = put('[data-slot="menu"]', menu);
  put('[data-slot="contact"]', contact);
  const footerEl = put('[data-slot="footer"]', footer);
  window.ai.fill();

  // Lenis — original values as is (lerp .05 · duration 1.2, duration takes priority)
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.05, duration: 1.2 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    const off = () => (innerWidth >= 768 ? 68 : 64);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#") return;
      const to = document.querySelector(id);
      if (!to) return;
      e.preventDefault();
      lenis.scrollTo(to, { offset: -off(), duration: 1.2 });
    }));
  }
  window.ai.lenis = lenis;

  // Menu text that shifts 5px right — .25s on entering, .35s on leaving, sine.out
  if (canHover && !reduce) document.querySelectorAll("[data-move]").forEach((a) => {
    const item = a.querySelector("[data-move-item]");
    if (!item) return;
    a.addEventListener("mouseenter", () => { gsap.killTweensOf(item, "x"); gsap.to(item, { x: 5, duration: 0.25, ease: "sine.out", overwrite: "auto" }); });
    a.addEventListener("mouseleave", () => { gsap.killTweensOf(item, "x"); gsap.to(item, { x: 0, duration: 0.35, ease: "sine.out", overwrite: "auto" }); });
  });

  // Phone menu — the panel fades in over .4s and rows rise from 20px below over 1s
  const openBtn = headerEl.querySelector("[data-menu-open]");
  const inner = menuEl.querySelector(".ai-menu__inner");
  let open = false;
  openBtn.addEventListener("click", () => {
    open = !open;
    document.documentElement.classList.toggle("is-menu-open", open);
    document.documentElement.classList.toggle("is-scroll-lock", open);
    menuEl.classList.toggle("is-open", open);
    if (open) { lenis?.stop(); gsap.set(inner, { opacity: 0 }); gsap.set(inner.children, { y: 20, opacity: 0 }); gsap.to(inner, { opacity: 1, duration: 0.4, ease: "sine.out" }); gsap.to(inner.children, { y: 0, opacity: 1, duration: 1, ease: "sine.out" }); }
    else { lenis?.start(); gsap.to(inner, { opacity: 0, duration: 0.4, ease: "sine.out" }); }
  });

  // Contact section box — swaps its photo every 3 seconds from 20% above the screen bottom, and is pushed 100% down by scroll
  const sq = document.querySelector(".ai-contact__square");
  if (sq) {
    let n = 2, t = 0;
    new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting || t || reduce) return;
      t = setInterval(() => { sq.setAttribute("data-contact", String(n)); n = n >= 5 ? 2 : n + 1; }, 3000);
    }), { rootMargin: "0px 0px 20% 0px" }).observe(document.querySelector('[data-slot="contact"]'));
    gsap.matchMedia().add({ wide: "(min-width: 768px)", narrow: "(max-width: 767px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
      if (!conditions.motion) return;
      gsap.to(sq, { y: conditions.wide ? "100%" : "70%", ease: "none", scrollTrigger: { trigger: sq, start: "top center", end: "bottom top", scrub: true } });
    });
  }

  // Footer — when it passes 70% of the screen bottom the header line slides up, and 20% before that the background breathes and the lines rise in turn
  const showFooter = () => {
    footerEl.querySelector("[data-footer-bg]").classList.add("is-active");
    if (reduce) { gsap.set(footerEl.querySelectorAll(".ai-y, [data-copy]"), { opacity: 1, y: 0 }); return; }
    gsap.timeline().fromTo(footerEl.querySelectorAll(".ai-y"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, x: 0, duration: 0.8, ease: "sine.out", stagger: 0.15 })
      .to(footerEl.querySelectorAll("[data-copy]"), { opacity: 1, y: 0, duration: 0.5, ease: "sine.out" });
  };
  // The original hooks the header-hide and footer-appear observers in the middle of the page-enter timeline (HeaderFooter init) — hooked at the same time
  window.ai.headerReady = () => {
    const fo = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { showFooter(); fo.disconnect(); } }), { rootMargin: "0px 0px -20% 0px" });
    fo.observe(footerEl);
    new IntersectionObserver((es) => es.forEach((e) => {
      gsap.to(headerEl, e.isIntersecting ? { yPercent: -100, opacity: 0, duration: 0.8, ease: "sine.out" } : { yPercent: 0, opacity: 1, duration: 0.8, ease: "sine.out" });
    }), { rootMargin: "0px 0px -70% 0px" }).observe(footerEl);
  };

  // Shared observer that adds is-active once when crossing a screen line — the original keeps a separate one per line position (rootMargin)
  window.ai.watch = (sel, bottom) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-active"); }), { rootMargin: `0px 0px ${bottom} 0px` });
    document.querySelectorAll(sel).forEach((el) => (reduce ? el.classList.add("is-active") : io.observe(el)));
  };
})();
