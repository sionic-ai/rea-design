/* Shared by several pages — header·menu drawer·footer·background video, Lenis, coordinate circle·arrow hover, sound on, heading background parallax */
(() => {
  const ARROW = '<svg viewBox="0 0 10 8"><use href="#jp-arrow"/></svg>';
  const arrowBox = '<span class="u-arrow"><span class="arrow">' + ARROW + "</span></span>";
  const ICON = {
    request: '<svg viewBox="0 0 12 14"><use href="#jp-request"/></svg>',
    contact: '<svg viewBox="0 0 12 10"><use href="#jp-contact"/></svg>',
    member: '<svg viewBox="0 0 10 14"><use href="#jp-member"/></svg>',
  };
  const LOGO = '<svg class="logo-mark" viewBox="0 0 116 43" role="img" aria-label="Logo slot"><text class="lm-a" x="0" y="24" font-size="27" font-weight="600" letter-spacing="-1">LOGO</text><text class="lm-b" x="1" y="39" font-size="10.5" font-weight="600">Your group name here</text></svg>';

  // Like the original, arrows and icons share a single symbol <use> Load and paint with this — it follows only the text color, the svg’s own fill stays as is
  document.body.insertAdjacentHTML("afterbegin", '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="jp-arrow" viewBox="0 0 10 8"><path fill="currentColor" d="M6.1.6 9.6 4 6.1 7.4l-.7-.7 2.2-2.2H0v-1h7.6L5.4 1.3z"/></symbol><symbol id="jp-request" viewBox="0 0 12 14"><path fill="currentColor" d="M2 0h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm1 3h6v1H3zm0 2.5h6v1H3zM3 9h4v1H3z"/></symbol><symbol id="jp-contact" viewBox="0 0 12 10"><path fill="currentColor" d="M1 0h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1zm0 1.6V9h10V1.6L6 5.6zM1.9 1 6 4.3 10.1 1z"/></symbol><symbol id="jp-member" viewBox="0 0 10 14"><path fill="currentColor" d="M5 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 1a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM0 14c0-3.2 2.2-5.2 5-5.2s5 2 5 5.2H9c0-2.6-1.7-4.2-4-4.2s-4 1.6-4 4.2z"/></symbol></svg>');
  const page = document.body.dataset.page || "home";
  const NAV = [
    ["First Page", "index.html", "home"],
    ["Environment and Resource Cycle", "#", ""],
    ["Recycling", "#", ""],
    ["Promo Activities", "service.html", "service"],
    ["Learning", "#", ""],
    ["Case (coming soon)", "works.html", "works", "is-extend"],
  ];
  const GROUPS = [
    ["About the group", "about.html", ["Group overview", "Group history", "Member list", "Related Links", "Link guide", "Marine issues"]],
    ["About Materials", "#", ["Types of material", "Until it becomes material", "Material properties"]],
    ["Usage", "#", ["Container", "Cushioning", "Insulation materials", "Civil works", "Others"]],
    ["Environment and Resource Cycle", "#", []],
    ["Recycling", "#", ["Recycling status", "How to recycle", "Recycled products", "Collection point", "Recycling flow", "Frequently asked"]],
    ["Promo Activities", "service.html", ["Anniversary event", "Ambassador", "Polar bear campaign", "Stacking box", "Sports Event"]],
    ["Learning", "#", ["Environmental education program", "Learning video"]],
    ["Case (coming soon)", "works.html", []],
  ];
  const REST = [["Help info", "#"], ["Frequently asked questions", "#"], ["News", "news.html"], ["Glossary", "#"]];
  const cur = { service: "Promo Activities", detail: "Promo Activities", about: "About the group", news: "News", works: "Case (coming soon)" }[page];

  const cta = (cls = "") =>
    '<nav class="m-cta ' + cls + '">' +
    '<a href="#" class="is-request" data-hover="coordinate">' + ICON.request + '<span>Material Request</span></a>' +
    '<a href="#" class="is-contact" data-hover="coordinate">' + ICON.contact + '<span>Inquiry</span></a>' +
    '<a href="#" class="is-member" data-hover="coordinate">' + ICON.member + '<span>Member<span class="pc-only"> Page</span></span></a></nav>';

  const sitemap = () => {
    const groups = GROUPS.map(([label, href, subs]) => {
      const sub = subs.length
        ? '<ul class="m-sitemap__sub">' + subs.map((s, si) => '<li><a href="' + (label === "Promo Activities" && si === 0 ? "detail.html" : href) + '" data-hover="arrow-x"' + (page === "detail" && label === "Promo Activities" && si === 0 ? ' aria-current="true"' : "") + "><span>" + s + "</span>" + arrowBox + "</a></li>").join("") + "</ul>"
        : "";
      return '<li><a class="m-sitemap__link" href="' + href + '" data-hover="arrow-x"' + (cur === label ? ' aria-current="page"' : "") + "><span>" + label + "</span>" + arrowBox + "</a>" + sub + "</li>";
    }).join("");
    return '<nav class="m-sitemap"><ul><li class="is-top"><a class="m-sitemap__link" href="index.html" data-hover="arrow-x"><span>First Page</span>' + arrowBox + "</a>" +
      cta("m-sitemap__cta") + "</li>" + groups + "</ul>" +
      '<div class="m-sitemap__rest"><div></div>' + REST.map(([l, h]) => '<ul><li><a class="m-sitemap__link" href="' + h + '" data-hover="arrow-x"><span>' + l + "</span>" + arrowBox + "</a></li></ul>").join("") + "</div>" + cta("m-sitemap__cta is-sp") + "</nav>";
  };

  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.className = "l-header";
    header.innerHTML =
      '<div class="l-header__inner"><h1 class="l-header__logo"><a href="index.html">' + LOGO + "</a></h1>" +
      '<nav class="m-global"><ul>' + NAV.map(([l, h, key, cls]) => '<li><a href="' + h + '" class="' + (cls || "") + '" data-hover="coordinate"' + (key === page ? ' aria-current="page"' : "") + ">" + l + "</a></li>").join("") + "</ul></nav>" +
      '<div class="l-header__buttons"><button class="m-drawer-button" type="button" aria-label="Open Menu" data-hover="coordinate"><i></i><i></i></button>' + cta() + "</div></div>";
  }

  const drawer = document.createElement("div");
  drawer.className = "m-drawer";
  drawer.setAttribute("data-slot", "menu-drawer");
  drawer.innerHTML = '<div class="m-drawer__block">' + sitemap() + "</div>";
  document.body.append(drawer);

  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.className = "l-footer g33";
    footer.setAttribute("data-video-trigger", "");
    footer.innerHTML =
      '<div class="l-footer__block">' + sitemap() +
      '<div class="l-footer__tools"><button class="m-totop" type="button" data-hover="arrow-y"><span class="line">Back to top</span> <span class="arrow">' + ARROW + ARROW + "</span></button>" +
      '<div class="m-sns"><a href="#" aria-label="SNS 1"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h3.6l3.7 5 4.2-5H17l-5.5 6.4L17.5 17h-3.6l-4-5.4L5.3 17H3l5.8-6.8z"/></svg></a><a href="#" aria-label="SNS 2"><svg viewBox="0 0 20 20" fill="currentColor"><rect x="1" y="4" width="18" height="12" rx="3.5"/><path d="m8 7.5 5 2.5-5 2.5z" fill="var(--kf-surface)"/></svg></a></div>' +
      '<div class="m-sub"><a href="#"><span class="line">Privacy policy</span></a><a href="#"><span class="line">Usage policy</span></a></div></div>' +
      '<div class="l-footer__company"><p class="l-footer__logo">' + LOGO + '</p><p class="l-footer__addr">Your group’s official name and English name here<br>Postal code and address here, one line<br>Your contact here: Tel 00-0000-0000 · Fax 00-0000-0000</p><p class="l-footer__copyright">© 0000 Your copyright notice here</p></div></div>' +
      '<div class="l-footer__copy"><p class="copy-en" data-label="Your three-line English resolve">Write a<br>short slogan<br>in English.</p><p class="copy-ja">Your one-line pledge goes here.</p></div>';
  }

  const movie = document.createElement("div");
  movie.className = "l-movie wf-img";
  movie.setAttribute("data-label", "3D video of white foam blocks slowly sliding · soft overcast diffuse light · fills the screen 16:9 · gentle sound on · loop");
  movie.innerHTML = '<video id="video" muted loop playsinline preload="metadata" data-sound="hero"><source src="media/hero-loop.mp4" type="video/mp4"></video>';
  document.body.prepend(movie);

  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Lenis 1.0.42 with the original values as is (duration .4s, 1-(1-t)^4) — runs in step with ScrollTrigger
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 0.4, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, smoothTouch: false, wheelMultiplier: 1, touchMultiplier: 1 });
    lenis.on("scroll", () => window.ScrollTrigger && ScrollTrigger.update());
    // As in the original, Lenis runs on its own RAF — it sleeps while the GSAP tick rests, so hover tweens wake one or two frames late, just the same
    const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
  window.jpLenis = lenis;

  const setHeaderH = () => {
    const h = document.querySelector(".l-header");
    if (h && innerWidth >= 1024) root.style.setProperty("--spt", h.offsetHeight + "px");
  };
  setHeaderH();
  addEventListener("resize", setHeaderH);

  // Scrolling down hides the logo and menu text, scrolling up brings them back
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    root.classList.toggle("nav-hidden", y > lastY && y > 0);
    lastY = y;
  }, { passive: true });

  const btn = document.querySelector(".m-drawer-button");
  const setOpen = (open) => {
    if (open) root.dataset.state = "navOpen"; else delete root.dataset.state;
    btn && btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  btn && btn.addEventListener("click", () => setOpen(root.dataset.state !== "navOpen"));
  drawer.addEventListener("click", (e) => { if (e.target === drawer || e.target.closest("a")) setOpen(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  // Original hover: the coordinate circle grows from where it entered (--x,--y), and the arrow shifts one step with .25s slow(0.1,0.5,true)
  const canHover = !("ontouchstart" in document) && matchMedia("(hover: hover)").matches;
  // The original wrote slow(0.1, 0.5, true) but EasePack isn’t loaded, so it runs on the GSAP default curve power1.out — match what is seen
  const SLOW = "power1.out";
  const arrowMove = (el, enter) => {
    const svgs = el.querySelectorAll(".arrow > svg");
    if (svgs.length < 2) return;
    // The original also pushes arrow-y along x inside a box rotated -90°
    const a = { x: enter ? "100%" : "0%" };
    const b = { x: enter ? "0%" : "-100%" };
    gsap.to(svgs[0], { ...a, duration: 0.25, ease: SLOW, overwrite: "auto" });
    gsap.to(svgs[1], { ...b, duration: 0.25, ease: SLOW, overwrite: "auto" });
  };
  const coord = (el, e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", e.clientX - (r.left + r.width / 2) + "px");
    el.style.setProperty("--y", e.clientY - (r.top + r.height / 2) + "px");
    el.style.setProperty("--ap", (r.width / r.height).toFixed(1));
    el.style.setProperty("--scale", "1");
  };
  const wireHover = (scope) => {
    scope.querySelectorAll("[data-hover]").forEach((el) => {
      if (el.dataset.hoverReady) return;
      el.dataset.hoverReady = "1";
      const kind = el.dataset.hover;
      const arrow = el.querySelector(".arrow");
      if (arrow && arrow.querySelectorAll("svg").length === 1) arrow.append(arrow.querySelector("svg").cloneNode(true));
      if (!canHover) return;
      el.addEventListener("mouseenter", (e) => {
        if (kind === "coordinate" || kind === "button") coord(el, e);
        if (kind !== "coordinate") arrowMove(el, true);
      });
      el.addEventListener("mouseleave", (e) => {
        if (kind === "coordinate" || kind === "button") coord(el, e);
        if (kind !== "coordinate") arrowMove(el, false);
      });
    });
  };
  wireHover(document);
  window.jpWireHover = wireHover;

  document.querySelectorAll(".m-totop").forEach((b) => b.addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 1 }) : scrollTo({ top: 0, behavior: "smooth" }))));

  // Video plays only while the hero and footer are visible, and the sound button only toggles mute
  const video = movie.querySelector("video");
  const triggers = [...document.querySelectorAll("[data-video-trigger]")];
  const seen = new Set();
  if (video && triggers.length) {
    new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      if (seen.size && !reduce) video.play().then(() => video.classList.add("isPlaying")).catch(() => video.classList.remove("isPlaying"));
      else { video.pause(); video.classList.remove("isPlaying"); }
    }, { threshold: 0 }).observe(triggers[0]);
    triggers.slice(1).forEach((t) => new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target)));
      if (seen.size && !reduce) video.play().catch(() => {}); else video.pause();
    }, { threshold: 0 }).observe(t));
  }
  document.querySelectorAll(".sound-button").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault();
    const v = document.querySelector('video[data-sound="' + b.dataset.sound + '"]');
    if (!v) return;
    v.muted = !v.muted;
    b.classList.toggle("isMuted", v.muted);
  }));

  // Sub-page title background: moves down during scroll by 1.15 times the image height minus the cell height
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      document.querySelectorAll("[data-parallax-bg]").forEach((t) => {
        const item = t.querySelector("[data-parallax-bg-item]");
        if (!item) return;
        gsap.to(item, {
          y: () => item.clientHeight * 1.15 - t.getBoundingClientRect().height + "px",
          ease: "none",
          scrollTrigger: { trigger: t, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
      });
    });
  }
})();
