// Frame and motion shared by all pages: fits the header, menu drawer, vertical marks and footer as one set, plus Lenis and text splitting,
// Markers turn on when visible and off when out (like the original onScreen, it moves again on re-entry), page transition (fades out, moves after 1 second),
// Handles the Home page loader timeline. Page scenes added via eu.scene(fn) are built in document order after all fonts have loaded.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const page = document.body.dataset.page;
  const isHome = page === "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isHome) root.classList.add("is-sub");

  const ARROW = '<svg viewBox="0 0 12 10" fill="none"><path d="M0 5h11M7 1l4 4-4 4" stroke-width="1"/></svg>';
  const btn = (text, href, cls = "") => `<div class="eu-btn ${cls}"><a href="${href}"${href.endsWith(".html") ? " data-go" : ""}><span class="eu-btn__text">${text}</span><span class="eu-btn__icon"><span class="eu-btn__arrows">${ARROW.replace("<svg", '<svg class="is-front"')}${ARROW.replace("<svg", '<svg class="is-back"')}</span></span></a></div>`;
  const ICON = {
    insta: '<svg viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="3.5"/><circle cx="8" cy="8" r="3"/><circle cx="12" cy="4" r="0.4"/></svg>',
    line: '<svg viewBox="0 0 16 16"><path d="M8 2C4.1 2 1.5 4.4 1.5 7.2c0 2.5 2 4.5 4.9 5l-.4 2.3 3-2.2c3.5-.3 5.5-2.5 5.5-5.1C14.5 4.4 11.9 2 8 2z"/></svg>',
    pdf: '<svg viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3"/></svg>',
  };
  const sns = (icon, text, cls = "") => `<div class="eu-sns ${cls}" data-on><a href="#"><div class="eu-sns__box"><div class="eu-sns__inner">${ICON[icon]}<span>${text}</span></div></div><div class="eu-sns__line"><i class="l"></i><i class="t"></i><i class="r"></i><i class="b"></i></div></a></div>`;
  window.euParts = { btn, sns, ARROW };

  const NAV = [["Menu 1", "index.html#concept"], ["Menu 2", "index.html#hitdesign"], ["Menu 3", "price.html"], ["Menu 4", "index.html#salonlist"], ["Menu 5", "recruit.html"]];
  const SUBNAV = [["About", "about.html"], ["Privacy", "#"], ["Terms of Use", "#"], ["Contact", "#"]];
  const href = (h) => (isHome && h.startsWith("index.html#") ? h.slice(10) : h);
  const go = (h) => (h.startsWith("#") ? "data-anchor" : h.endsWith(".html") || h.includes(".html#") ? "data-go" : "");
  const link = ([t, h], split) => `<a href="${href(h)}" ${go(href(h))}>${split ? `<span class="eu-split">${t}</span>` : t}</a>`;

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.outerHTML = `
<header class="eu-head" data-slot="header">
  <a class="eu-head__mark eu-mark" href="index.html" ${isHome ? "data-anchor-top" : "data-go"}>Wordmark</a>
  <nav class="eu-head__nav" aria-label="Main menu" data-label="Your section English name five here"><ul>${NAV.map((n) => `<li>${link(n, true)}</li>`).join("")}</ul></nav>
</header>
<div class="eu-reserve" data-label="Your English booking button text here">${link(["Booking", "index.html#salonlist"])}</div>
<button class="eu-toggle" type="button" aria-label="Open Menu" aria-expanded="false"><span class="eu-toggle__bar is-1"></span><span class="eu-toggle__bar is-2"></span></button>
<nav class="eu-gnav" data-slot="menu-drawer" aria-label="Full menu">
  <div class="eu-gnav__body">
    <div class="eu-gnav__left">
      <div class="eu-gnav__mark"><span class="eu-mark">Wordmark</span></div>
      <div class="eu-gnav__menu">${NAV.map((n) => `<div class="eu-gnav__item">${link(n, true)}</div>`).join("")}</div>
      <div class="eu-gnav__bottom" data-label="Your four English links here: company, policy, contact">${SUBNAV.map((n) => link(n)).join("")}</div>
    </div>
    <div class="eu-gnav__right">
      <div class="eu-gnav__photo"><div class="wf-img" data-label="Hair salon interior · white wall and mirror · portrait crop · 40% darker"></div></div>
      <div class="eu-gnav__buttons">${sns("insta", "SNS link 1")}${sns("line", "SNS link 2")}</div>
    </div>
  </div>
</nav>
<div class="eu-side is-scroll"><a href="#" data-anchor-next><span>Scroll Down</span></a></div>
<div class="eu-side is-top"><a href="#" data-anchor-top><span>Page Top</span></a></div>`;
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.outerHTML = `
<footer class="eu-foot" data-slot="footer">
  <div class="eu-foot__inner">
    <div class="eu-foot__mark" data-on><span class="eu-mark">Wordmark</span></div>
    <div class="eu-foot__row">
      <div class="eu-foot__menu" data-on>${NAV.map((n) => `<div class="eu-foot__item">${link(n, true)}</div>`).join("")}</div>
      <div class="eu-foot__buttons">${sns("insta", "SNS link 1")}${sns("line", "SNS link 2")}</div>
    </div>
  </div>
  <div class="eu-foot__bottom">
    <div class="eu-foot__inner">
      <div class="eu-foot__links" data-label="Your four English links here: company, policy, contact">${SUBNAV.map((n) => link(n)).join("")}</div>
    </div>
    <p class="eu-foot__copy">©Wordmark</p>
  </div>
</footer>`;
  }

  // Careers category strip (Careers and Careers detail pages) — all three cells link to details of the same type
  const links = document.querySelector('[data-slot="recruit-links"]');
  if (links) {
    const LINKS = [["Position 01", "Job group name 1", "Model upper body · white wall · arms-raised pose · portrait"], ["Position 02", "Job group name 2", "Male model face · white shirt · portrait"], ["Position 03", "Job group name 3", "Blonde model in profile · white outfit · portrait"]];
    links.innerHTML = `<div class="eu-links__list">${LINKS.map(([en, jp, label]) => `
      <div class="eu-links__item" data-on>
        <div class="eu-links__bg"><div class="wf-img" data-label="${label} · 30% darker"></div></div>
        <div class="eu-links__content">
          <div class="eu-label"><p class="eu-split" data-label="Your job group English name here">${en}</p><p class="is-sub">${jp}</p></div>
          <div data-button="See more|recruit-detail.html|is-light"></div>
        </div>
      </div>`).join("")}</div>`;
    links.classList.add("eu-links");
    links.querySelectorAll(".eu-links__item").forEach((item) => {
      const bg = item.querySelector(".eu-links__bg");
      item.addEventListener("mouseover", (e) => bg.classList.toggle("is-active", !!e.target.closest(".eu-btn a")));
      item.addEventListener("mouseleave", () => bg.classList.remove("is-active"));
    });
  }

  document.querySelectorAll("[data-button]").forEach((el) => {
    const [text, h, cls = ""] = el.dataset.button.split("|");
    el.innerHTML = btn(text, h, cls);
  });

  // Wrap each character cell and push it in from the right (original js-split)
  document.querySelectorAll(".eu-split").forEach((el) => {
    el.innerHTML = [...el.textContent].map((ch) => (ch === " " ? '<span class="s"></span>' : `<span class="c"><i>${ch}</i></span>`)).join("");
  });

  // Add is-on when visible, remove it when out of view — the original onScreen removes the class in doOut, so it animates again on re-entry
  const ON = "[data-on], .eu-label, .eu-heading, .eu-text, .eu-table__tr";
  const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-on", e.isIntersecting)));
  const watch = () => document.querySelectorAll(ON).forEach((el) => (reduce ? el.classList.add("is-on") : io.observe(el)));

  // Smooth scroll
  let lenis = null;
  // Exactly as in the original: Lenis 1.0.19 defaults (lerp .1) with its own requestAnimationFrame loop
  if (!reduce) {
    lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const scrollTo = (target) => {
    const y = typeof target === "number" ? target : target.getBoundingClientRect().top + scrollY;
    if (lenis) lenis.scrollTo(y, { duration: 0.8, easing: easeInOutCubic, force: true });
    else window.scrollTo(0, y);
  };

  // Past 300px down, hide the center menu and turn the vertical indicator into Page Top
  const headShow = () => root.classList.toggle("is-head-show", scrollY >= 300);
  addEventListener("scroll", headShow, { passive: true });
  headShow();

  // Menu drawer
  const toggle = document.querySelector(".eu-toggle");
  const setMenu = (on) => {
    root.classList.toggle("is-gnav-open", on);
    toggle.setAttribute("aria-expanded", String(on));
    toggle.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    if (lenis) on ? lenis.stop() : lenis.start();
  };
  toggle?.addEventListener("click", () => setMenu(!root.classList.contains("is-gnav-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && root.classList.contains("is-gnav-open")) setMenu(false); });

  // Page transition: the body blurs and rises 10rem as it vanishes, then navigates after 1 second
  const leave = (url) => {
    if (reduce) { location.href = url; return; }
    root.classList.add("is-slide-in");
    lenis?.stop();
    setTimeout(() => { location.href = url; }, 1000);
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    if (a.hasAttribute("data-anchor")) {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute("href"));
      if (root.classList.contains("is-gnav-open")) setMenu(false);
      if (t) scrollTo(t);
    } else if (a.hasAttribute("data-anchor-top")) {
      e.preventDefault();
      scrollTo(0);
    } else if (a.hasAttribute("data-anchor-next")) {
      e.preventDefault();
      const secs = document.querySelectorAll("main > section");
      if (secs.length) scrollTo(secs[1] || secs[0]);
    } else if (a.hasAttribute("data-go")) {
      e.preventDefault();
      leave(a.getAttribute("href"));
    } else if (a.getAttribute("href") === "#") {
      e.preventDefault();
    }
  });
  // Returning via back, the transition state remains, so read it fresh (same as the original)
  addEventListener("pageshow", (e) => { if (e.persisted) location.reload(); });

  // Hero timeline: the first page has the loader (wordmark 0~2.7s, panel split 3.3s~4.5s, body 3.2s), subpages appear right on load
  const start = () => {
    if (reduce) { root.classList.add("is-preload", "is-page-loaded", "is-preload-none"); return; }
    if (isHome && location.hash) {
      root.classList.add("is-preload-none", "is-page-loaded");
      const t = document.querySelector(location.hash);
      if (t) requestAnimationFrame(() => scrollTo(t));
      return;
    }
    if (isHome) {
      root.classList.add("is-preload");
      setTimeout(() => root.classList.add("is-page-loaded"), 3200);
    } else {
      // Sub pages get is-page-loaded right on load like the original — the body group appears over 1.5s
      root.classList.add("is-page-loaded");
    }
  };

  // Range where the home header turns ink — as in the original, a separate class per range so overlapping ones don’t erase each other
  let darkN = 0;
  const dark = (trigger, startAt, end) => {
    const cls = `is-dark-${darkN++}`;
    ScrollTrigger.create({ trigger, start: startAt, end, toggleClass: { targets: root, className: cls } });
  };

  const scenes = [];
  window.eu = { scene: (fn) => scenes.push(fn), dark, scrollTo, get lenis() { return lenis; }, reduce };

  // Shrinking hero photo (two recruiting pages): a full-bleed photo stays pinned while shrinking to 66%×66%, inside 1.2→1x, and the group lags by 10rem when leaving
  window.eu.scene(({ motion }) => {
    const shrink = document.querySelector(".eu-shrink");
    if (!shrink) return;
    const frame = shrink.querySelector(".eu-shrink__frame");
    const item = frame.querySelector(".wf-img");
    if (!motion) { gsap.set(frame, { width: "66%", height: "66%" }); gsap.set(item, { scale: 1 }); return; }
    const st = { trigger: shrink.querySelector(".eu-shrink__space"), start: "top bottom", end: "bottom bottom", invalidateOnRefresh: true, scrub: 1 };
    gsap.to(frame, { width: "66%", height: "66%", ease: "none", scrollTrigger: st });
    gsap.to(item, { scale: 1, ease: "none", scrollTrigger: { ...st } });
    gsap.to(shrink, { y: "10rem", ease: "none", scrollTrigger: { trigger: shrink, start: "bottom-=200 center", end: "bottom top", scrub: 1 } });
  });

  const mm = gsap.matchMedia();
  const build = () => {
    watch();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      scenes.forEach((fn) => fn(ctx.conditions));
    });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };
  const parsed = document.readyState === "loading"
    ? new Promise((r) => addEventListener("DOMContentLoaded", r, { once: true }))
    : Promise.resolve();
  const loaded = document.readyState === "complete" ? Promise.resolve() : new Promise((r) => addEventListener("load", r, { once: true }));
  Promise.all([document.fonts.ready, parsed]).then(build);
  loaded.then(start);
})();
