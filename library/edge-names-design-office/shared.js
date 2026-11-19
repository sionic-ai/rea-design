// Shared by all pages: plugs in the header (edge wordmark · big menu · phone menu), footer and work detail window in one place, and
// Runs smooth scroll, text settle, line reveal and the hero-pass indicator. body[data-page] tells which page it is.
(() => {
  const root = document.documentElement;
  const body = document.body;
  const page = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  const NAV = [
    ["about", "about.html"], ["service", "service.html"], ["brand", "index.html#brand"], ["work", "works.html"],
  ];
  const NAV2 = [["journal", "news.html"], ["faq", "#footer"]];
  const current = { about: "about", service: "service", works: "work", detail: "work", news: "journal" }[page];
  const links = (list) => list.map(([t, h]) => `<li><a href="${h}"${t === current ? ' aria-current="page"' : ""}>${t}</a></li>`).join("");

  // The two logo spots are SVG text that stretches to the box width — swap in the real English and local-language logos
  const header = document.createElement("header");
  header.className = "site-header" + (page === "home" ? " is-home" : "");
  header.dataset.slot = "edge-wordmarks";
  header.innerHTML = `
    <a class="wordmark wordmark--en" href="index.html" aria-label="Home"><svg viewBox="0 0 144 54" aria-hidden="true"><text x="0" y="44" font-size="58" textLength="144" lengthAdjust="spacingAndGlyphs">logo</text></svg></a>
    <a class="wordmark wordmark--local" href="index.html" aria-label="Home (local-language logo)"><svg viewBox="0 0 148 47" aria-hidden="true"><text x="0" y="41" font-size="50" textLength="148" lengthAdjust="spacingAndGlyphs">Logo slot</text></svg></a>
    <p class="copyright">© 0000 logo inc.</p>
    <nav class="dnav" aria-label="Main menu" data-slot="corner-menu">
      <ul class="dnav__primary">${links(NAV)}</ul>
      <ul class="dnav__secondary">${links(NAV2)}</ul>
      <a class="dnav__contact" href="#footer">contact</a>
    </nav>
    <div class="mnav" data-slot="mobile-menu">
      <button class="mnav__button" type="button" aria-label="Open Menu" aria-expanded="false">
        <span class="mnav__surface"><span class="mnav__dots"><i></i><i></i><i></i></span><span class="mnav__close"></span></span>
      </button>
      <nav class="mnav__panel" aria-label="Phone menu">
        <ul class="mnav__primary">${links(NAV)}</ul>
        <ul class="mnav__secondary">${links(NAV2)}</ul>
        <a class="mnav__contact" href="#footer">contact</a>
      </nav>
    </div>`;
  body.prepend(header);

  const reveal = document.createElement("div");
  reveal.className = "footer-reveal";
  reveal.innerHTML = `
    <footer class="site-footer" id="footer" data-slot="footer">
      <span class="amp site-footer__mark" aria-hidden="true"></span>
      <div class="site-footer__content">
        <h2 data-text-reveal="ink">Here, a consultation,<br class="sp-break"> One line of recommendation.</h2>
        <p class="site-footer__desc">Your line on how the company helps here<br class="sp-break"> Write it in one line.<br>Add a line about being partners who think and build together.<br>Your final invitation line here.</p>
        <a class="inverse-link inverse-link--large" href="#footer"><span>contact</span></a>
      </div>
      <ul class="site-footer__socials" aria-label="Social media">
        <li><a href="#">instagram</a></li>
        <li><a href="#">facebook</a></li>
      </ul>
    </footer>`;
  body.append(reveal);

  // ── Smooth scroll (original lenis lerp 0.14) ──
  let lenis = null;
  if (window.Lenis && !reduce.matches) {
    lenis = new Lenis({ lerp: 0.14, anchors: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  }
  window.andLenis = lenis;

  // ── Phone menu ──
  const mbtn = header.querySelector(".mnav__button");
  const setMenu = (open) => {
    root.classList.toggle("has-menu-open", open);
    mbtn.setAttribute("aria-expanded", String(open));
    mbtn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  mbtn.addEventListener("click", () => setMenu(!root.classList.contains("has-menu-open")));
  header.querySelectorAll(".mnav__panel a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // ── Footer: reserves the space and sticks the panel to the screen bottom so the last content peels away to reveal it ──
  const footer = reveal.firstElementChild;
  const sizeFooter = () => {
    if (reduce.matches) return reveal.classList.remove("is-ready");
    reveal.style.setProperty("--footer-h", footer.offsetHeight + "px");
    reveal.classList.add("is-ready");
  };
  sizeFooter();
  addEventListener("resize", sizeFooter);

  // ── Letter resolve: ink drops gather and burst at each letter, and the letter takes form ──
  const INK = ["var(--site-ink-1)", "var(--site-ink-2)", "var(--site-ink-3)"];
  const rand = (a, b) => a + Math.random() * (b - a);
  // Letter gap is 36ms, but shrink the gap so the last letter doesn’t pass 780ms — fully settled takes 720ms + (letter count − 1) × gap
  const splitReveal = (el) => {
    const colored = el.dataset.textReveal === "ink";
    const count = [...el.textContent].filter((ch) => ch.trim()).length;
    const step = Math.min(36, 780 / Math.max(1, count - 1));
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 1) return walk(n);
        if (n.nodeType !== 3 || !n.textContent.trim()) return;
        // Letters are inline-block, so wrap them per word to keep lines from breaking mid-word
        const frag = document.createDocumentFragment();
        let word = null;
        [...n.textContent].forEach((ch) => {
          if (!ch.trim()) { word = null; return frag.append(ch); }
          if (!word) { word = document.createElement("span"); word.className = "tr-word"; frag.append(word); }
          const d = Math.round(i++ * step);
          const c = colored ? INK[i % 3] : "currentColor";
          const bursts = [0, 1, 2].map(() => {
            const a = rand(0, Math.PI * 2), r = rand(0.4, 0.9);
            return `<i style="--s:.12em;--c:${c};--bx:${(Math.cos(a) * r).toFixed(2)}em;--by:${(Math.sin(a) * r).toFixed(2)}em"></i>`;
          }).join("");
          const span = document.createElement("span");
          span.className = "tr-char";
          span.style.setProperty("--d", d + "ms");
          span.innerHTML = `<span class="tr-glyph">${ch}</span><span class="tr-ink" aria-hidden="true"><i style="--s:.34em;--c:${c};--gx:${rand(-0.6, 0.6).toFixed(2)}em;--gy:${rand(-0.6, 0.6).toFixed(2)}em"></i>${bursts}</span>`;
          word.append(span);
        });
        n.replaceWith(frag);
      });
    };
    el.setAttribute("aria-label", el.textContent.trim());
    walk(el);
    el.classList.add("tr-split");
    return 720 + Math.max(0, count - 1) * step;
  };
  // The dot pair and intro text in the page header appear for 480ms at 45% of the time the big title takes to form (ease-in-out-sine)
  const heroFades = new Map();
  const prepareHeroFade = (h1, total) => {
    const head = h1.closest(".page-hero");
    if (!head) return;
    const items = [...head.querySelectorAll(".dot-pair, .page-hero__copy > p, [data-page-hero-fade]")];
    items.forEach((it) => (it.style.opacity = "0"));
    heroFades.set(h1, () => items.forEach((it) => {
      it.style.removeProperty("opacity");
      it.animate([{ opacity: 0 }, { opacity: 1 }], { delay: total * 0.45, duration: 480, easing: "cubic-bezier(0.445, 0.05, 0.55, 0.95)", fill: "backwards" });
    }));
  };
  // If fonts are still loading, settle after they finish — so it doesn’t settle again with changed glyph widths
  const startReveal = (el) => {
    el.classList.add("is-revealing");
    heroFades.get(el)?.();
  };
  const revealIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    revealIO.unobserve(e.target);
    if (document.fonts?.status === "loading") document.fonts.ready.then(() => startReveal(e.target));
    else startReveal(e.target);
  }), { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });
  document.querySelectorAll("[data-text-reveal]").forEach((el) => {
    if (reduce.matches) return;
    const total = splitReveal(el);
    if (el.matches(".page-hero h1")) prepareHeroFade(el, total);
    revealIO.observe(el);
  });

  // ── On each scroll: pass the hero · hide phone wordmark · reveal lines ──
  const mv = document.querySelector(".home-mv");
  const hero = document.querySelector(".page-hero");
  const lines = [...document.querySelectorAll(".line-reveal")];
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const vh = innerHeight;
    if (mv) root.classList.toggle("has-passed-first-view", mv.getBoundingClientRect().bottom <= 0);
    // Original: subpages remove the edge name after scrolling just 10px (the removal look exists only in phone css)
    if (hero) root.classList.toggle("has-dismissed-page-wordmarks", scrollY >= 10);
    // Goes 0 → 1 (smoothstep) while the row’s top edge rises from 82% to 66% of the screen
    if (!reduce.matches) lines.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      const p = Math.max(0, Math.min(1, (vh * 0.82 - top) / (vh * 0.16)));
      el.style.setProperty("--line-reveal", (p * p * (3 - 2 * p)).toFixed(4));
    });
  };
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  // Line positions change when the font loads late, so measure once more after everything has loaded
  addEventListener("load", schedule);
  document.fonts?.ready.then(() => { schedule(); sizeFooter(); });
  onScroll();

  // ── Work detail window: clicking a work card opens a black window over the same page ──
  const dialog = document.createElement("dialog");
  dialog.className = "work-dialog";
  dialog.tabIndex = -1;
  dialog.dataset.slot = "work-dialog";
  dialog.setAttribute("aria-label", "Work Details");
  dialog.innerHTML = `
    <div class="work-dialog__close"><a href="works.html" aria-label="Close"><svg viewBox="0 0 66 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 2 33 24 2 46M64 2 33 24 64 46"/></svg></a></div>
    <article class="work-detail">
      <div class="work-detail__main">
        <header class="work-detail__header">
          <hgroup class="work-detail__heading">
            <p class="work-detail__client">Your client name here</p>
            <h2 class="work-detail__title" data-dialog-title>Your work name here</h2>
          </hgroup>
          <span class="dot"></span>
          <a class="work-detail__category" href="works.html">Category 1</a>
        </header>
        <div class="work-detail__desc">
          <p>Your artwork description here in several lines. The background of the commission and what had to be solved.<br>Your second line. State which scene was turned into an illustration.</p>
          <p>Put the third paragraph here in two lines.<br>Your closing line here.</p>
        </div>
        <div class="work-detail__gallery">
          <div class="wf-img" style="aspect-ratio:3/2" data-label="Main shot · front-facing photo showing the whole product · white floor soft light · landscape 3:2"></div>
        </div>
        <div class="work-detail__gallery" style="--cols-g:2">
          <div class="wf-img" style="aspect-ratio:1" data-label="Detail shot · Print texture macro · Square"></div>
          <div class="wf-img" style="aspect-ratio:1" data-label="In use · result held in hand · square"></div>
        </div>
        <section class="work-detail__members">
          <h3 class="disp">member</h3>
          <ul>
            <li><p>Direction</p><p>Your name here</p></li>
            <li><p>Design</p><p>Your name here</p></li>
          </ul>
        </section>
        <a class="work-detail__related" href="index.html#brand" data-slot="related-brand">
          <div class="wf-img" data-label="Related brand Hero photo · spread at 10% opacity · landscape"></div>
          <div class="work-detail__related-content">
            <p class="work-detail__related-title disp">brand name</p>
            <span class="dot-pair"><i></i><i></i></span>
            <p class="work-detail__related-company">Your company name here</p>
          </div>
        </a>
      </div>
    </article>`;
  body.append(dialog);
  const openDialog = (title) => {
    if (title) dialog.querySelector("[data-dialog-title]").textContent = title;
    dialog.classList.remove("is-closing");
    // As in the original, a non-modal window. The big bottom-right menu can still be pressed above the window (z 201)
    dialog.show();
    dialog.focus();
    dialog.scrollTop = 0;
    root.classList.add("has-dialog");
    lenis?.stop();
  };
  const closeDialog = () => {
    if (!dialog.open) return;
    dialog.classList.add("is-closing");
    setTimeout(() => { dialog.close(); dialog.classList.remove("is-closing"); }, reduce.matches ? 0 : 180);
  };
  dialog.addEventListener("close", () => { root.classList.remove("has-dialog"); lenis?.start(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && dialog.open && page !== "detail") closeDialog(); });
  dialog.querySelector(".work-dialog__close a").addEventListener("click", (e) => {
    if (page === "detail") return;
    e.preventDefault();
    closeDialog();
  });
  // The original router doesn’t reload when you click a link pointing to the current page (such as the edge name)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const u = new URL(a.href, location.href);
    if (u.origin === location.origin && u.pathname === location.pathname && !u.hash && !a.hasAttribute("data-work")) e.preventDefault();
  });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-work]");
    if (!a) return;
    e.preventDefault();
    openDialog(a.textContent.trim());
  });
  // In the original the window arrives already open in HTML, so the .38s unfold is fully visible from the first image — open it after the first image so the first part of the unfold doesn’t pass before drawing
  if (page === "detail") {
    const later = () => requestAnimationFrame(() => requestAnimationFrame(() => openDialog()));
    document.readyState === "complete" ? later() : addEventListener("load", later, { once: true });
  }
})();
