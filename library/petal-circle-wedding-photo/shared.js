// Shared by all pages: draws the header bar, menu drawer, footer and transition strip, and hooks up Lenis (original 1.0.34) and swup (original 4.5.1 + prefetch).
// swup only swaps #swup(.transition-main), so each page’s motion is registered with LW.page(name, attach) and re-attached every time it changes.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LW = (window.LW = { reduce, lenis: null, pages: {}, off: [] });
  const sp = () => innerWidth < 768;
  LW.sp = sp;

  const arrow = '<svg viewBox="0 0 19 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 5h18M13.5 .5 18 5l-4.5 4.5"/></svg>';
  const insta = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.4"/><circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none"/></svg>';
  LW.arrow = arrow;
  const PAGES = [
    ["lookbook", "works.html", "Look", "book", "Shoot Examples"],
    ["karuizawa", "location.html", "Loca", "tion", "Location shoot"],
    ["attire", "#", "Fusion ", "Attire", "Formal and traditional wear shoot"],
    ["costume", "#", "Cost", "ume", "Outfit Rental"],
    ["artist", "about.html", "Ar", "tists", "Hair and makeup · Photographer"],
    ["faq", "#", "F", "AQ", "Frequently asked questions"],
    ["contact", "#", "Con", "tact", "Contact · Booking"],
  ];

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("lw-head");
    const li = (p) => `<li><a href="${p[1]}" data-nav="${p[0]}">${p[4]}</a></li>`;
    head.innerHTML = `
      <a class="lw-head__mark" href="index.html" data-label="Brand English name">Brand Name</a>
      <nav class="lw-head__nav" aria-label="Main menu"><ul>${PAGES.slice(0, 4).map(li).join("")}</ul><ul>${PAGES.slice(4).map(li).join("")}<li><a href="#">Blog</a></li></ul></nav>
      <p class="lw-head__copy" data-label="Two-line English text describing the service (second line italic)">Hair &amp; Make-up for<span>Bridal Photos.</span></p>`;
  }

  // Menu button and drawer — on the drawer’s right, an autoplay looping video slot like the original
  const nav = document.createElement("div");
  nav.className = "lw-nav";
  nav.setAttribute("aria-hidden", "true");
  nav.innerHTML = `
    <div class="lw-nav__bg"></div>
    <div class="lw-nav__movie wf-img wf-video" data-label="Video of a bride and groom in the forest · auto-play loop · no sound · tall portrait panel"></div>
    <a class="lw-nav__mark" href="index.html">Brand Name</a>
    <ul class="lw-nav__list">${PAGES.map((p, i) => `<li style="transition-delay: ${(0.18 + i * 0.08).toFixed(2)}s"><a href="${p[1]}"><span class="lw-en" data-label="Menu English name">${p[2]}<i>${p[3]}</i></span><small>${p[4]}</small></a></li>`).join("")}</ul>
    <a class="lw-nav__latest" href="#"><p>Latest</p><figure><span class="lw-ph wf-img" data-label="Recent post photo · late summer forest · landscape 3:2"></span></figure><time>2026.00.00</time><b>Your recent post title here</b></a>
    <a class="lw-nav__sns" href="#" aria-label="Social Media">${insta}</a>`;
  const toggle = document.createElement("button");
  toggle.className = "lw-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Menu");
  toggle.innerHTML = "<i></i><i></i><i></i>";
  document.body.append(nav, toggle);
  const open = (on) => {
    root.classList.toggle("lw-open", on);
    nav.setAttribute("aria-hidden", on ? "false" : "true");
    if (LW.lenis) on ? LW.lenis.stop() : LW.lenis.start();
  };
  toggle.addEventListener("click", () => open(!root.classList.contains("lw-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) open(false); });

  const wipe = document.createElement("div");
  wipe.className = "lw-wipe";
  wipe.setAttribute("aria-hidden", "true");
  document.body.append(wipe);

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("lw-foot");
    const li = (p) => `<li><a href="${p[1]}">${p[4]}</a></li>`;
    foot.innerHTML = `
      <div class="lw-foot__inner">
        <strong class="lw-foot__mark lw-en" data-label="Brand English name (two words)"><span>Brand</span><span>Name</span></strong>
        <hr class="lw-slash lw-foot__slash">
        <nav class="lw-foot__nav" aria-label="Footer Menu"><ul><li><a href="index.html">Home</a></li>${PAGES.slice(0, 4).map(li).join("")}</ul><ul>${PAGES.slice(4).map(li).join("")}<li><a href="#">Blog</a></li></ul></nav>
        <a class="lw-foot__sns" href="#" aria-label="Social Media">${insta}</a>
        <p class="lw-foot__copy">© Brand Name. Design: Studio Name</p>
      </div>
      <button class="lw-foot__top" type="button" aria-label="Back to top">${arrow}</button>`;
    foot.querySelector(".lw-foot__top").addEventListener("click", () => (LW.lenis ? LW.lenis.scrollTo(0) : scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })));
  }

  const mark = () => {
    const page = document.querySelector("#swup [data-page]")?.dataset.page || "";
    document.querySelectorAll("[data-nav]").forEach((a) => (a.dataset.nav === page ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  };

  // Smooth scroll — original Lenis 1.0.34 (default lerp .1)
  if (!reduce && window.Lenis) {
    const lenis = new Lenis();
    LW.lenis = lenis;
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);
  }

  // Attach and detach page motion — detach on every transition and reattach to the new content
  LW.page = (name, fn) => { LW.pages[name] = fn; };
  const mount = () => {
    LW.off.forEach((f) => f());
    LW.off = [];
    const page = document.querySelector("#swup [data-page]")?.dataset.page;
    document.querySelectorAll("#swup .lw-arrow > span:empty").forEach((s) => (s.innerHTML = arrow));
    // White band above the footer (left wordmark · two-line copy from the center) — at the end of content, before the full-width photo below if there is one
    const body = document.querySelector("#swup [data-page]");
    if (body && !body.querySelector(".lw-foot-title")) {
      const strip = document.createElement("div");
      strip.className = "lw-foot-title";
      strip.dataset.slot = "footer-title";
      strip.innerHTML = '<strong class="lw-label" data-label="Brand English name">Brand Name</strong><strong class="lw-head__copy-lg lw-en">Hair &amp; Make-up for<span>Bridal Photos.</span></strong>';
      const img = body.querySelector(".lw-bottom-img");
      img ? img.before(strip) : body.append(strip);
    }
    const mm = gsap.matchMedia();
    const fn = LW.pages[page];
    if (fn) mm.add("(prefers-reduced-motion: no-preference)", () => fn(document.querySelector("#swup")));
    LW.off.push(() => mm.revert());
    mark();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  document.addEventListener("DOMContentLoaded", mount);

  // swup — transition: when the band covers (out) the content is swapped, and once drawn (in) the band lifts and is hidden .35s later
  if (window.Swup && location.protocol !== "file:") {
    const plugins = window.SwupPreloadPlugin ? [new SwupPreloadPlugin({ preloadVisibleLinks: {}, preloadHoveredLinks: true })] : [];
    const swup = new Swup({ linkToSelf: "navigate", plugins });
    LW.swup = swup;
    swup.hooks.on("animation:out:start", () => wipe.classList.add("is-changing", "is-animating"));
    swup.hooks.on("animation:in:start", () => { wipe.classList.remove("is-animating"); wipe.classList.add("is-rendering"); });
    swup.hooks.on("visit:end", () => setTimeout(() => wipe.classList.remove("is-changing", "is-rendering"), 350));
    swup.hooks.on("content:replace", () => { LW.off.forEach((f) => f()); LW.off = []; }, { before: true });
    swup.hooks.on("page:view", () => { LW.lenis?.scrollTo(0, { immediate: true }); window.kfFx?.scan(); mount(); });
  }
})();
