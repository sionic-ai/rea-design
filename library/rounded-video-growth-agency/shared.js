// Shared by all pages: draws the header, expanding panel, phone menu, closing CTA and footer, and wires up smooth scrolling (Lenis 1.3.11 duration 1.2) and the Webflow entrance (1s outQuart).
// Original values: expanding panel height .4s power3.out · closing after .1s then .3s power3.inOut · phone menu .4s ease · entrances slideInBottom 100px / growIn .75 / slideInLeft −100px.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  // The hidden flag is set first by a line in the head — setting it here would show the hero once then hide it
  document.documentElement.classList.add("rv-js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const RV = (window.RV = { reduce, lenis: null });

  const chev = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg>';
  const arrow = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M3.5 9.2h10.1l-4.1-4.1 1.1-1.1 6 6-6 6-1.1-1.1 4.1-4.1H3.5z"/></svg>';
  RV.icons = { chev, arrow };
  const logo = '<span>Logo</span><i></i>';
  const cur = (p) => (p === page ? " is-current" : "");

  const dropLinks = {
    industries: { label: "Menu Group 1", items: [["Field 1", "Field illustration · hand holding a care app screen · white background 3D icon"], ["Field 2", "Field illustration · bundle of supplement bottles · white-background 3D icon"], ["Field 3", "Field illustration · laptop and chart · white-background 3D icon"], ["Field 4", "Field illustration · lab glass flask · 3D icon on white background"]] },
    resources: { label: "Menu Group 2", items: [["Post list", "Reference image · open magazine · white background 3D icon", "news.html"], ["Material 1", "Resource logo graphic · faintly spanning the right side", null, true], ["Material 2", "Resource logo graphic · faintly spanning the right side", null, true]] },
    partners: { label: "Menu Group 3", items: [["Partner 1", "Partner certification badge · white background 3D icon"]] },
  };
  const dropHTML = (key) => {
    const d = dropLinks[key];
    return `<div class="rv-drop" data-drop="${key}" data-slot="nav-dropdown"><div class="rv-drop__in"><div class="rv-drop__label">${d.label}</div><div class="rv-drop__links">${d.items
      .map(([name, pic, href, soon]) => soon
        ? `<a class="rv-drop__link is-soon" href="#"><span class="rv-soon">Coming soon</span><span class="rv-drop__name">${name}</span><span class="rv-drop__pic rv-ph is-light" data-label="${pic}"></span></a>`
        : `<a class="rv-drop__link" href="${href || "#"}" data-fx-part="target" data-label="See more"><span class="rv-drop__pic rv-ph is-light" data-label="${pic}"></span><span class="rv-drop__name">${name}</span></a>`)
      .join("")}</div></div></div>`;
  };
  const sheetGroup = (key) => `<details><summary>${dropLinks[key].label} ${chev}</summary><div>${dropLinks[key].items.filter((i) => !i[3]).map(([n, , h]) => `<a href="${h || "#"}">${n}</a>`).join("")}</div></details>`;

  document.querySelectorAll('[data-icon="arrow"]').forEach((s) => (s.innerHTML = arrow));

  const nav = document.querySelector('[data-slot="nav"]');
  if (nav) {
    nav.classList.add("rv-nav");
    nav.innerHTML = `
      ${dropHTML("industries")}${dropHTML("resources")}${dropHTML("partners")}
      <a class="rv-logo" href="index.html" aria-label="First Page">${logo}</a>
      <nav class="rv-menu" aria-label="Main menu">
        <span class="rv-link is-drop is-ind" data-drop-for="industries" tabindex="0">Menu 1 ${chev}</span>
        <a class="rv-link${cur("works")}" href="works.html">Menu 2</a>
        <span class="rv-link is-drop is-res" data-drop-for="resources" tabindex="0">Menu 3 ${chev}</span>
        <a class="rv-link${cur("about")}" href="about.html">Menu 4</a>
        <span class="rv-link is-drop is-par" data-drop-for="partners" tabindex="0">Menu 5 ${chev}</span>
      </nav>
      <button class="rv-burger" type="button" aria-label="Open Menu" aria-expanded="false"><i></i><i></i></button>
      <a class="rv-cta" href="about.html">Button ${arrow}</a>
      <div class="rv-sheet" data-slot="mobile-menu"><div class="rv-sheet__in">
        ${sheetGroup("industries")}
        <a href="works.html">Menu 2</a>
        ${sheetGroup("resources")}
        <a href="about.html">Menu 4</a>
        ${sheetGroup("partners")}
        <a class="rv-btn" href="about.html">Button ${arrow}</a>
      </div></div>`;
  }

  // Expanding board — 992 and up only. Closing is delayed .1s so the hand crossing from item to board isn’t lost
  const mm = gsap.matchMedia();
  mm.add("(min-width: 992px)", () => {
    const offs = [...document.querySelectorAll("[data-drop-for]")].map((trigger) => {
      const drop = document.querySelector(`[data-drop="${trigger.dataset.dropFor}"]`);
      if (!drop) return () => {};
      let wait = 0, tw = null;
      gsap.set(drop, { display: "none", height: 0, overflow: "hidden" });
      const open = () => {
        clearTimeout(wait);
        const h0 = drop.clientHeight;
        gsap.set(drop, { display: "flex", height: "auto" });
        const h = drop.offsetHeight;
        gsap.set(drop, { height: h0 });
        tw?.kill();
        tw = gsap.to(drop, { height: h, duration: reduce ? 0 : 0.4, ease: "power3.out" });
      };
      const close = () => {
        clearTimeout(wait);
        wait = setTimeout(() => {
          tw?.kill();
          tw = gsap.to(drop, { height: 0, duration: reduce ? 0 : 0.3, ease: "power3.inOut", onComplete: () => gsap.set(drop, { display: "none" }) });
        }, 100);
      };
      const keep = () => clearTimeout(wait);
      trigger.addEventListener("mouseenter", open);
      trigger.addEventListener("mouseleave", close);
      trigger.addEventListener("focus", open);
      trigger.addEventListener("blur", close);
      drop.addEventListener("mouseenter", keep);
      drop.addEventListener("mouseleave", close);
      return () => {
        trigger.removeEventListener("mouseenter", open);
        trigger.removeEventListener("mouseleave", close);
        trigger.removeEventListener("focus", open);
        trigger.removeEventListener("blur", close);
        drop.removeEventListener("mouseenter", keep);
        drop.removeEventListener("mouseleave", close);
        tw?.kill();
        gsap.set(drop, { clearProps: "display,height,overflow" });
      };
    });
    return () => offs.forEach((f) => f());
  });

  // Phone menu — the panel drops down with the Webflow nav default (.4s ease)
  const burger = nav?.querySelector(".rv-burger"), sheet = nav?.querySelector(".rv-sheet");
  if (burger && sheet) {
    burger.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open);
      // A closed panel is display: none — like the original nav, links are not on screen when closed. It is shown with is-moving only while folding.
      sheet.classList.add("is-moving");
      gsap.to(sheet, { height: open ? "auto" : 0, duration: reduce ? 0 : 0.4, ease: "power1.inOut", overwrite: true, onComplete: () => sheet.classList.remove("is-moving") });
    });
  }

  // Ending CTA + footer — over a hazy blue wave (blur-wave-glow)
  const end = document.querySelector('[data-slot="cta-footer"]');
  if (end) {
    end.classList.add("rv-end");
    const col = (title, links) => `<div class="rv-foot__col"><p>${title}</p><div class="rv-foot__list">${links.map(([t, h]) => `<a class="rv-foot__link" href="${h || "#"}">${t}</a>`).join("")}</div></div>`;
    end.innerHTML = `
      <div data-fx="blur-wave-glow"></div>
      <div class="rv-end__cta"><div class="rv-wrap" data-reveal="grow" data-delay="400">
        <h2 class="rv-h2" data-label="Your English closing section title, two lines">A closing headline set<br>across two lines here</h2>
        <p class="rv-muted">Your one-line notice goes here.</p>
        <a class="rv-btn" href="about.html">Button ${arrow}</a>
      </div></div>
      <footer class="rv-foot">
        <div class="rv-foot__top">
          <div class="rv-foot__brand">
            <a class="rv-logo" href="index.html" aria-label="First Page">${logo}</a>
            <div class="rv-social">
              <a class="rv-social__link" href="#" aria-label="Social 1"><svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2"/></svg></a>
              <a class="rv-social__link" href="#" aria-label="Social 2"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="13" height="13" rx="4"/><circle cx="8" cy="8" r="3"/></svg></a>
              <a class="rv-social__link" href="#" aria-label="Social 3"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 2l12 12M14 2 2 14"/></svg></a>
            </div>
          </div>
          <div class="rv-foot__cols">
            ${col("Bundle 1:", [["Field 1"], ["Field 2"], ["Field 3"]])}
            ${col("Bundle 2:", [["Menu 2", "works.html"], ["Post list", "news.html"], ["Menu 4", "about.html"], ["Hiring"]])}
            ${col("Bundle 3:", [["Privacy processing"], ["Terms of service"]])}
          </div>
        </div>
        <small>© 0000 Logo. Your copyright line here.</small>
      </footer>`;
  }

  // Smooth scroll — original Lenis 1.3.11 · duration 1.2 · touch 1.5x
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.5, infinite: false });
    RV.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.addEventListener("refresh", () => lenis.resize());
  }

  // Entrance — plays once when it enters the screen (after offset % has come in), delay from data-delay (ms)
  RV.reveal = (root = document) => {
    root.querySelectorAll("[data-reveal]").forEach((el) => {
      if (el.dataset.revealed) return;
      el.dataset.revealed = "1";
      if (reduce) { gsap.set(el, { opacity: 1, clearProps: "transform" }); return; }
      const kind = el.dataset.reveal, delay = (+el.dataset.delay || 0) / 1000, off = +el.dataset.offset || 0;
      const to = { opacity: 1, duration: 1, delay, ease: RV.ease || "power4.out" };
      if (kind === "grow") to.scale = 1; else if (kind === "left") to.x = 0; else to.y = 0;
      ScrollTrigger.create({ trigger: el, start: `top ${100 - off}%`, once: true, onEnter: () => gsap.to(el, to) });
    });
  };
  if (window.CustomEase) { gsap.registerPlugin(CustomEase); RV.ease = CustomEase.create("rvOutQuart", "M0,0 C0.165,0.84 0.44,1 1,1"); }

  // Entrance is applied after the page script has built all sections — the start position fits only once the pinned sections’ spacing is finished
  // The original also sets up sections after load — pins attached by the parts must stand first for the start positions of the appearances below to be right, so re-sort in position order
  RV.ready = () => {
    const go = () => {
      RV.reveal();
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      setTimeout(() => ScrollTrigger.refresh(), 500);
    };
    if (document.readyState === "complete") setTimeout(go, 0);
    else addEventListener("load", go, { once: true });
  };
})();
