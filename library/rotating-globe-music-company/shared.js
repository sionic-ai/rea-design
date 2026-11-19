// Frame shared by all pages — header bar, menu drawer, first loader, floating notice pill and footer are mounted in one place, and Lenis (lerp .12) is linked to ScrollTrigger.
// The original is Next.js so page turns go to the top immediately without a curtain — ours also jumps straight through the link
(() => {
  const page = document.body.dataset.page || "home";
  const ICON = {
    arrow: '<svg viewBox="0 0 12 10" aria-hidden="true"><path d="M7 0 12 5 7 10 6.1 9.1 9.6 5.6H0V4.4h9.6L6.1.9Z"/></svg>',
    down: '<svg viewBox="0 0 10 12" aria-hidden="true"><path d="M4.4 0h1.2v9.6l3.5-3.5.9.9L5 12 0 7l.9-.9 3.5 3.5Z"/></svg>',
    out: '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1h9v9H9.8V3L1.9 10.9 1.1 10.1 9 2.2H2Z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    big: '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M27 0 48 20 27 40l-2.6-2.6L40.9 21.8H0v-3.6h40.9L24.4 2.6Z"/></svg>',
  };
  // Logo slot: our geometric mark (circle in a square, bar, dot) in place of the original logo. A place for a brand logo
  const MARK = '<svg class="ks-mark" viewBox="0 0 120 80" role="img" aria-label="Logo slot"><path d="M0 8h22v64H0z"/><path d="M26 40 50 8h26L50 40l26 32H50z"/><circle cx="92" cy="24" r="16"/><path d="M80 44h40v28H80z"/></svg>';
  const NAV = [["index.html", "TOP", "home"], ["about.html", "ABOUT", "about"], ["service.html", "SERVICE", "service"], ["works.html", "WORKS", "works"], ["news.html", "NEWS", "news"], ["#", "SHOP", "shop", true], ["#", "CONTACT", "contact"]];
  const SNS = ["Instagram", "X", "YouTube 01", "YouTube 02", "TikTok"];
  const snsList = () => SNS.map((s) => `<li><a href="#"><span>${s}</span><span>${ICON.out}</span></a></li>`).join("");

  // Language switch spot — goes to another address like the original /en/ (no English version is built, so the same page with ?lang=en)
  const EN = `${location.pathname.split("/").pop() || "index.html"}?lang=en`;
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.className = "ks-head";
    head.innerHTML = `<div class="ks-head__in ks-grid">
      <a class="ks-head__logo" href="index.html" data-label="Brand English name — wordmark">Brand Co.</a>
      <div class="ks-head__lang"><a href="#" aria-current="true">KR</a><i></i><a href="${EN}">EN</a></div></div>`;
    head.insertAdjacentHTML("afterend", `
      <button class="ks-toggle" type="button" aria-expanded="false" aria-controls="ks-menu"><span class="ks-toggle__label"><span>Menu</span><span>Close</span></span><span class="ks-toggle__box"><i class="ks-toggle__bar"></i><i class="ks-toggle__bar"></i></span></button>
      <div class="ks-menu" id="ks-menu" data-slot="menu">
        <div class="ks-menu__veil"></div><div class="ks-menu__bg"></div>
        <div class="ks-menu__out"><div class="ks-menu__in ks-grid">
          <div class="ks-menu__sub"><div class="ks-menu__mark">${MARK}</div><ul class="ks-menu__links">${snsList()}</ul></div>
          <nav class="ks-menu__main"><ul class="ks-menu__nav">${NAV.map(([h, t, k, ext], i) => `<li style="--i:${i}"><a href="${h}"${k === page ? ' aria-current="page"' : ""}><span>${t}${ext ? " ↗" : ""}</span></a></li>`).join("")}</ul>
            <div><div class="ks-menu__spmore"><ul class="ks-menu__links">${snsList()}</ul></div>
            <div class="ks-menu__subnav"><a href="#">Privacy Policy</a></div>
            <div class="ks-menu__lang"><a href="#" aria-current="true">KR</a><i></i><a href="#">EN</a></div></div>
          </nav></div></div>
      </div>`);
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.className = "ks-foot";
    foot.innerHTML = `<div class="ks-wrap">
      <div class="ks-foot__contact"><a class="ks-foot__cta" href="#"><span class="ks-foot__cta-label" data-label="Large English link to Contact">Get in Touch</span><span class="ks-foot__cta-ico">${ICON.big}</span></a>
        <p class="ks-foot__text">A short sentence inviting inquiries.</p></div>
      <div class="ks-foot__top"><div class="ks-grid">
        <div class="ks-foot__logo">${MARK}<div class="ks-foot__logo-typo">Brand Co.</div></div>
        <nav class="ks-foot__nav"><ul>${NAV.slice(1).map(([h, t, , ext]) => `<li><a href="${h}"><span>${t}</span>${ext ? `<span>${ICON.out}</span>` : ""}</a></li>`).join("")}</ul></nav>
        <nav class="ks-foot__nav"><ul>${SNS.map((s) => `<li><a href="#"><span>${s}</span><span>${ICON.out}</span></a></li>`).join("")}</ul></nav>
      </div></div>
      <div class="ks-foot__bottom"><a href="#">Privacy Policy</a><span class="ks-foot__cc">Website by 00 · 0000 Brand Co.</span></div>
    </div>`;
  }

  const banner = document.querySelector('[data-slot="banner"]');
  if (banner) {
    banner.className = "ks-banner";
    banner.setAttribute("href", "news.html");
    banner.innerHTML = `<span class="ks-banner__main">${ICON.bolt}<strong>Your one-line alert goes here!</strong></span><span class="ks-banner__link">Learn more ↗</span>`;
  }

  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = ICON[el.dataset.icon] || ""; });
  document.querySelectorAll("[data-mark]").forEach((el) => { el.innerHTML = MARK; });

  // First loader — the logo turns on in .5s power4.out, then .4s later the veil lifts in 1s power4.out. ks:loaded fires when lifting starts
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The loader is planted at the very front of body on every page so it covers from the first paint — created here if missing
  let loader = document.querySelector(".ks-loader");
  if (!loader) { loader = document.createElement("div"); loader.className = "ks-loader"; loader.innerHTML = '<div class="ks-loader__logo" data-mark></div>'; document.body.prepend(loader); }
  loader.firstElementChild.innerHTML = MARK;
  const loaded = () => { document.documentElement.classList.add("is-loaded"); document.dispatchEvent(new CustomEvent("ks:loaded")); };
  // The original is a single-page app, so the loader runs only on first entry — pages reached from within the site go straight in without a loader
  let seen = false;
  try { seen = sessionStorage.getItem("ks-seen") === "1"; sessionStorage.setItem("ks-seen", "1"); } catch { seen = false; }
  // A page entered by switching language counts as a fresh load — the original /en/ has a different root layout, so the whole page is fetched again and the loader runs
  if (new URLSearchParams(location.search).has("lang")) seen = false;
  // Pages arriving from within the site also skip the stage curtain, camera pull-back and first-letter delay (the original single-page app keeps the stage continuous across navigation).
  if (seen) {
    document.documentElement.classList.add("is-seen");
    document.querySelectorAll("[data-fx-line-rise]").forEach((el) => el.setAttribute("data-fx-line-rise", el.getAttribute("data-fx-line-rise").replace("delay: .9", "delay: 0")));
    document.querySelectorAll("[data-fx-panel-orbit-globe-gl]").forEach((el) => el.setAttribute("data-fx-panel-orbit-globe-gl", "intro-dur: 0"));
  }
  if (reduce || !window.gsap || seen) { loader.remove(); requestAnimationFrame(loaded); }
  else gsap.timeline()
    .to(loader.firstElementChild, { autoAlpha: 1, duration: 0.5, ease: "power4.out" })
    .to(loader, { autoAlpha: 0, delay: 0.4, duration: 1, ease: "power4.out", onStart: loaded, onComplete: () => loader.remove() });

  // Smooth scroll — original react-lenis { lerp: .12, duration: 1.2, easing: 1-(1-t)^4 }(If lerp is set, it turns with lerp)
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.12, duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    window.ksLenis = lenis;
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Menu drawer — only adds and removes is-menu-open on html. Motion lives in shared.css
  const toggle = document.querySelector(".ks-toggle");
  const setMenu = (open) => {
    document.documentElement.classList.toggle("is-menu-open", open);
    toggle?.setAttribute("aria-expanded", String(open));
    open ? lenis?.stop() : lenis?.start();
  };
  toggle?.addEventListener("click", () => setMenu(!document.documentElement.classList.contains("is-menu-open")));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  document.querySelectorAll(".ks-menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Scroll Down — to #first in .6s (original react-scroll duration 600, offset -50)
  document.querySelectorAll("[data-down]").forEach((el) => el.addEventListener("click", (e) => {
    e.preventDefault();
    const to = document.getElementById("first");
    if (!to) return;
    lenis ? lenis.scrollTo(to, { offset: -50, duration: 0.6 }) : to.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }));
})();
