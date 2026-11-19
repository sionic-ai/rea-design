/* Shared by all pages — menu row (hides on scroll down) · phone menu · Lenis · floating cursor · letter-roll splitting · text-line entrance · transition veil · sticker drag. 
   Page js loads after this file and adds its own parts to the entrance timeline via PG.enter(tl). */
(() => {
  const body = document.body;
  const page = body.dataset.page;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const PG = (window.PG = { reduce, css, enters: [] });

  const MENU = [
    ["list.html", "Roster", "list"],
    ["works.html", "Works", "works"],
    ["about.html", "About Us", "about"],
    ["index.html#news", "News", "news"],
  ];
  const STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z"/></svg>';
  const ARROW = '<svg class="pg-btn__icon" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 1v6h8M7.5 4.5 10 7l-2.5 2.5"/></svg>';
  PG.STAR = STAR;
  PG.ARROW = ARROW;
  const cur = (k) => (k === page ? ' aria-current="page"' : "");

  // ── Menu row · phone menu ──
  const navSlot = document.querySelector('[data-slot="header"]');
  if (navSlot) {
    navSlot.outerHTML = `
<nav class="pg-nav" data-slot="header" data-nav-status="not-active">
  <div class="pg-mnav" data-slot="mobile-menu">
    <div class="pg-mnav__panel"></div>
    <ul class="pg-mnav__list" data-label="Your menu English names here — Directors list · Work · About company · News · Contact">
      ${MENU.map(([h, t, k]) => `<li class="pg-mnav__item"><a class="pg-mnav__link" href="${h}"${cur(k)}><span>${t}</span></a></li>`).join("")}
      <li class="pg-mnav__item"><a class="pg-mnav__link" href="index.html#contact"><span>Contact</span></a></li>
    </ul>
    <div class="pg-mnav__social" data-label="Your English name for the video / photo / work channel here"><a class="pg-link is-quiet" href="#">Social 1</a><a class="pg-link is-quiet" href="#">Social 2</a><a class="pg-link is-quiet" href="#">Social 3</a></div>
  </div>
  <div class="pg-nav__in" data-load-nav>
    <div class="pg-nav__left">
      <a class="pg-nav__logo" href="index.html" aria-label="Back to start">${STAR}</a>
      <ul class="pg-nav__menu" data-label="Your menu English names here — Directors, Work, About, News">
        ${MENU.map(([h, t, k]) => `<li class="pg-nav__item"><a class="pg-nav__link" href="${h}"${cur(k)}><span>${t}</span></a></li>`).join("")}
      </ul>
    </div>
    <div class="pg-nav__right">
      <div class="pg-nav__marquee" aria-hidden="true" data-label="Your company slogan in English, one line here"><div class="pg-nav__marquee-list">${'<p class="pg-nav__marquee-label">SHORT MOTTO HERE   //</p>'.repeat(4)}</div></div>
      <a class="pg-btn is-blue is-big" href="index.html#contact"><span>Contact Us</span>${ARROW}</a>
      <button class="pg-nav__toggle" type="button" aria-label="Open Menu"><i></i><i></i><i></i></button>
    </div>
  </div>
</nav>`;
  }

  // ── Cursor · transition veil ──
  body.insertAdjacentHTML(
    "beforeend",
    `<div class="pg-cursor-wrap" data-cursor-status="false"><div class="pg-cursor" data-cursor-type=""><div class="pg-cursor__icon"><svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 3.5v13l11-6.5Z"/></svg></div><div class="pg-cursor__tag is-read">Read More</div><div class="pg-cursor__tag is-drag">Drag Me</div></div></div>
<div class="pg-trans${body.dataset.trans === "dark" ? " is-dark" : ""}" aria-hidden="true"><div class="pg-trans__panel"></div></div>`,
  );

  // ── Footer ──
  const foot = document.querySelector('footer[data-slot="footer"]');
  if (foot && !foot.children.length) {
    foot.className = "pg-footer";
    foot.innerHTML = `
<div class="pg-wrap pg-footer__in">
  <div class="pg-footer__top">
    <div class="pg-footer__menu">
      <ul>${MENU.map(([h, t]) => `<li><a class="pg-link is-quiet" href="${h}"><span>${t}</span></a></li>`).join("")}</ul>
      <ul data-label="Your channel English name here"><li><a class="pg-link is-quiet" href="#"><span>Social 1</span></a></li><li><a class="pg-link is-quiet" href="#"><span>Social 2</span></a></li><li><a class="pg-link is-quiet" href="#"><span>Social 3</span></a></li></ul>
    </div>
    <div class="pg-footer__title">
      <div class="pg-footer__title-text" data-label="Your English slogan and two short lines of resolve here"><p class="pg-footer__heading">Short motto here.</p><p class="pg-footer__sub">A short promise,<br>set on two lines</p></div>
      <a class="pg-btn is-outline" href="index.html#contact"><span>Get In Touch</span></a>
    </div>
    <form class="pg-footer__news" onsubmit="return false">
      <p class="pg-footer__heading" data-label="Your newsletter subscription English header here">Join Our Newsletter</p>
      <label><input type="email" placeholder="Email address" aria-label="Email address"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2 1v6h8M7.5 4.5 10 7l-2.5 2.5"/></svg><i></i></label>
    </form>
  </div>
  <div class="pg-footer__badge" data-slot="footer-badge" data-label="Your brand English logo here with a one-line English intro">
    <svg viewBox="0 0 1344 470" fill="none" role="img" aria-label="Large logo slot">
      <rect x="8" y="58" width="1328" height="404" rx="64" stroke="currentColor" stroke-width="14"/>
      <text x="1290" y="150" text-anchor="end" fill="currentColor" style="font: 700 60px var(--site-label)">SHORT TAGLINE HERE</text>
      <circle cx="78" cy="330" r="22" stroke="currentColor" stroke-width="5"/>
      <text x="78" y="340" text-anchor="middle" fill="currentColor" style="font: 700 26px var(--site-label)">R</text>
      <text x="130" y="415" textLength="1080" lengthAdjust="spacingAndGlyphs" fill="currentColor" style="font: 400 400px var(--kf-font-hand, var(--kf-font-display)); stroke: var(--kf-contrast-bg); stroke-width: 22px; paint-order: stroke">Studio Name</text>
    </svg>
  </div>
  <div class="pg-footer__bottom"><span>2026 Your company name here</span><span>Copyright notice slot</span></div>
</div>`;
  }

  // ── Lenis (lerp .1, wheel 1.2x) ──
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.2, gestureOrientation: "vertical", smoothTouch: false });
    PG.lenis = lenis;
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  const nav = document.querySelector(".pg-nav");
  const navIn = document.querySelector(".pg-nav__in");

  // ── Phone menu open and close ──
  const setNav = (on) => {
    nav?.setAttribute("data-nav-status", on ? "active" : "not-active");
    if (PG.lenis) on ? PG.lenis.stop() : PG.lenis.start();
  };
  document.querySelector(".pg-nav__toggle")?.addEventListener("click", () => setNav(nav.getAttribute("data-nav-status") !== "active"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });
  document.querySelectorAll(".pg-mnav__item").forEach((li, i) => { li.style.transitionDelay = `${i * 0.05}s`; });

  // ── Floating cursor: follows at .15, data-cursor on elements="read|drag|active" ──
  const cwrap = document.querySelector(".pg-cursor-wrap");
  const cursor = document.querySelector(".pg-cursor");
  if (cursor && matchMedia("(hover: hover)").matches) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    const tick = () => {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(tick);
    };
    tick();
    PG.bindCursor = (root = document) => root.querySelectorAll("[data-cursor]").forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "1";
      el.addEventListener("mouseover", () => { cwrap.setAttribute("data-cursor-status", "true"); cursor.setAttribute("data-cursor-type", el.dataset.cursor); });
      el.addEventListener("mouseout", () => { cwrap.setAttribute("data-cursor-status", "false"); cursor.setAttribute("data-cursor-type", ""); });
    });
    PG.bindCursor();
  } else PG.bindCursor = () => {};

  // ── Sticker drag: lifts when grabbed (.1s), back.out(3) .2s when released ──
  PG.stickers = (root = document) => {
    root.querySelectorAll('[data-sticker="wrap"]').forEach((wrap) => {
      const press = Number(wrap.dataset.stickerPress ?? 1.2);
      const tilt = Number(wrap.dataset.stickerTilt ?? 30);
      wrap.querySelectorAll('[data-sticker="item"]').forEach((item) => {
        if (!window.Draggable) return;
        Draggable.create(item, {
          bounds: wrap,
          dragResistance: 0.1,
          onPress() {
            const v = { scale: press, duration: 0.1 };
            if (tilt) v.rotation = gsap.utils.random(-tilt, tilt);
            gsap.to(this.target, v);
          },
          onRelease() {
            const v = { scale: 1, ease: "back.out(3)", duration: 0.2 };
            if (tilt) v.rotation = 0;
            gsap.to(this.target, v);
          },
        });
      });
    });
  };

  // ── Transition: clicking an internal link covers with a curtain in .4s, then navigates ──
  const trans = document.querySelector(".pg-trans");
  const panel = document.querySelector(".pg-trans__panel");
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(https?:|mailto:|tel:)/.test(href)) return;
    const [file, hash] = href.split("#");
    if (hash && (file === "" || location.pathname.endsWith("/" + file))) return;
    e.preventDefault();
    if (reduce) { location.href = href; return; }
    const tl = gsap.timeline({ onComplete: () => (location.href = href) });
    tl.set(trans, { display: "flex", opacity: 1, visibility: "visible" });
    // Original curve name "power2.Out" is not a name GSAP knows, so it runs on the default power1.out — matched to what is seen
    tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" });
  });
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  // ── Entrance: on subpages the curtain changes to the target color in .8s, then lifts and the menu and title rise ──
  PG.enter = (fn) => PG.enters.push(fn);
  const enterSub = () => {
    const tl = gsap.timeline();
    const to = body.dataset.transTo === "dark" ? css("--kf-contrast-bg") : css("--kf-bg");
    gsap.set(trans, { display: "flex", autoAlpha: 1 });
    body.classList.add("is-ready");
    tl.to(panel, { backgroundColor: to, duration: 0.8, ease: "power2.in" });
    tl.addLabel("collapseStart", "+=0.1");
    tl.to(panel, { opacity: 0, duration: 0.8, ease: "power2.out" }, "collapseStart");
    tl.set(trans, { autoAlpha: 0, display: "none" }, "collapseStart");
    tl.from("[data-load-nav]", { opacity: 0, y: "-4em", duration: 1, ease: "power2.out" }, "collapseStart+=0.1");
    PG.enters.forEach((fn) => fn(tl));
  };

  // ── Line reveal: inside the line mask, from 110% below in .6s power4.out ──
  const reveal = () => document.querySelectorAll("[data-text-reveal]").forEach((el) => {
    if (reduce || !window.SplitText) { el.style.visibility = "visible"; return; }
    const split = SplitText.create(el.children.length ? el.children : el, { type: "lines, words", mask: "lines", linesClass: "pg-line" });
    gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "top 80%", toggleActions: "none play none none" } })
      .from(split.lines, { opacity: 0, yPercent: 110, delay: 0.05, duration: 0.6, stagger: { amount: 0.1 }, ease: "power4.out" });
    gsap.set(el, { visibility: "visible" });
  });

  document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(...[window.ScrollTrigger, window.SplitText, window.Draggable, window.InertiaPlugin].filter(Boolean));
    if (navIn && !reduce) {
      const hide = gsap.timeline({ paused: true }).to(navIn, { yPercent: -100, opacity: 0, duration: 0.3, ease: "power2.in" });
      ScrollTrigger.create({ start: "top top", end: "max", onUpdate: (self) => (self.direction === 1 ? hide.play() : hide.reverse()) });
    }
    reveal();
    PG.stickers();
    if (page !== "home") {
      if (reduce) { body.classList.add("is-ready"); PG.enters.forEach((fn) => fn(null)); }
      else enterSub();
    }
  });
})();
