// Shared by all pages — Lenis smooth scroll, header row, mini header row and menu veil, with Our Brands · support strip · footer plugged in one place and the text rise-in wired up.
(() => {
  const ARR = '<svg viewBox="0 0 11 8" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 4h10M7 1l3 3-3 3"/></svg>';
  const EXT = '<svg class="pd-ext" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true"><path d="M2 0h4v4L4.6 2.6 1 6 0 5l3.4-3.6z"/></svg>';
  window.pdIcons = { ARR, EXT };
  // Plug an arrow svg into the __ARR__ spot in the markup (even between text)
  const fillArrows = () => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), hits = [];
    while (w.nextNode()) if (w.currentNode.nodeValue.includes("__ARR__")) hits.push(w.currentNode);
    hits.forEach((t) => {
      const parts = t.nodeValue.split("__ARR__"), frag = document.createDocumentFragment();
      parts.forEach((p, i) => { if (p) frag.append(p); if (i < parts.length - 1) frag.append(document.createRange().createContextualFragment(ARR)); });
      t.replaceWith(frag);
    });
  };
  window.pdFillArrows = fillArrows;
  fillArrows();
  const here = document.body.dataset.page;
  const NAV = [["service.html", "Our Business", "service"], ["index.html#commitment", "Commitment", "commitment"], ["about.html", "About Us", "about"], ["about.html#mission", "Sustainability", "sus"], ["news.html", "News", "news"], ["#", "Journal", "journal"]];
  const nav = () => NAV.map(([h, t, k]) => `<a href="${h}"${k === here ? ' aria-current="page"' : ""}>${t}${k === "journal" ? EXT : ""}</a>`).join("");
  const right = '<div class="pd-nav2"><a class="pd-hbtn is-pc" href="#contact"><span>Contact</span></a><a class="pd-hbtn" href="#" target="_blank" rel="noopener"><span>Recruit</span>' + EXT + "</a></div>";
  const toggle = '<button class="pd-hbtn pd-toggle" type="button" aria-label="Open Menu" data-menu-open><span>Menu</span><i><b></b><b></b><b></b></i></button>';

  const header = document.querySelector("[data-slot=header]");
  if (header) {
    header.className = `pd-header${document.body.dataset.header === "dark" ? " is-dark" : ""}`;
    header.innerHTML = `<div class="pd-header__in">${toggle}<a class="pd-logo" href="index.html" data-label="Company English wordmark, one line">Company name here</a><nav class="pd-nav" aria-label="Main menu">${nav()}</nav>${right}</div>`;
    header.insertAdjacentHTML("afterend", `<div class="pd-min" aria-hidden="true">${toggle}<nav class="pd-nav">${nav()}</nav>${right}</div>
      <div class="pd-menu" role="dialog" aria-label="Menu"><div class="pd-menu__top"><a class="pd-logo" style="position:static;margin:0" href="index.html">Company name here</a><button class="pd-hbtn" type="button" data-menu-close><span>Close</span></button></div>
        <ul class="pd-menu__list">${NAV.map(([h, t]) => `<li><a href="${h}">${t}<small>Your native-language name here</small></a></li>`).join("")}</ul>
        <div class="pd-menu__foot pd-en">© Company name inc.</div></div>`);
  }

  const brand = (i) => `<a href="#" target="_blank" rel="noopener"><div class="wf-img" data-label="Brand ${i} Store · warm indoor lighting · square"></div><b>Brand ${String(i).padStart(2, "0")}</b></a>`;
  const footer = document.querySelector("[data-slot=footer]");
  if (footer) {
    footer.innerHTML = `<section class="pd-brands" data-view="gallery" data-slot="brand-grid">
        <div class="pd-brands__title"><strong class="pd-rise js-split">Our Brands</strong><div class="pd-view"><button type="button" data-view-btn="gallery" aria-pressed="true"><i></i>Gallery view</button><button type="button" data-view-btn="list" aria-pressed="false"><i></i>List view</button></div></div>
        <div class="pd-gallery">${Array.from({ length: 12 }, (_, i) => brand(i + 1)).join("")}</div>
        <ul class="pd-list">${Array.from({ length: 24 }, (_, i) => `<li>Brand name ${String(i + 1).padStart(2, "0")} · Region</li>`).join("")}</ul>
      </section>
      <section class="pd-cv" id="contact" data-slot="cta-band"><div class="pd-cv__in"><a href="#" target="_blank" rel="noopener">Recruit<i>${ARR}</i></a><a href="#contact">Contact<i>${ARR}</i></a></div></section>
      <div class="pd-footer" data-slot="footer-main"><div class="wf-img pd-footer__bg" data-label="Dark banquet hall interior · low lighting · full-width landscape"></div>
        <div class="pd-footer__in">
          <nav class="pd-fnav" aria-label="Footer Menu">${NAV.map(([h, t]) => `<div><a href="${h}">${t}</a><ul><li>Sub Menu 1</li><li>Sub Menu 2</li></ul></div>`).join("")}</nav>
          <div class="pd-flegal"><a href="#">Privacy policy</a><a href="#">Basic customer service policy</a><a href="#">Site usage guide</a></div>
          <div><ul class="pd-sns"><li><a href="#" aria-label="SNS 1"></a></li><li><a href="#" aria-label="SNS 2"></a></li><li><a href="#" aria-label="SNS 3"></a></li><li><a href="#" aria-label="SNS 4"></a></li></ul><small>© Company name inc.<br>All rights Reserved.</small></div>
          <button class="pd-top" type="button" data-top>Back to Top ${ARR}</button>
          <div class="pd-footer__catch"><h3>Your company’s one-line pledge goes here.</h3><p data-label="Company English wordmark">Company name here</p></div>
        </div></div>`;
  }

  // Character splitting — words as span chunks, each character gets an i (the rising body) — spaces are left as they are
  document.querySelectorAll(".js-split").forEach((el) => {
    let n = 0;
    const lines = el.innerHTML.split(/<br\s*\/?>/i).map((h) => { const t = document.createElement("div"); t.innerHTML = h; return t.textContent; });
    const out = lines.map((line) => line.split(/(\s+)/).map((w) => {
      if (!w) return "";
      if (/^\s+$/.test(w)) return w;
      return `<span>${[...w].map((c) => `<i style="--i:${n++}">${c}</i>`).join("")}</span>`;
    }).join(""));
    el.setAttribute("aria-label", lines.join(" ").replace(/\s+/g, " ").trim());
    el.innerHTML = out.join("<br>");
  });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Smooth scroll: original Lenis 1.3.17 lerp .1
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1 });
    window.pdLenis = lenis;
    if (window.ScrollTrigger) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }

  // Mini header bar — after passing the hero, scrolling up brings it down and scrolling down hides it
  const min = document.querySelector(".pd-min");
  let last = scrollY;
  const onScroll = () => {
    const y = scrollY;
    if (min) min.classList.toggle("is-show", y > innerHeight * 0.8 && y < last);
    last = y;
  };
  addEventListener("scroll", onScroll, { passive: true });

  // Menu act
  const menu = document.querySelector(".pd-menu");
  document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", () => { menu.classList.add("is-open"); lenis?.stop(); }));
  document.querySelector("[data-menu-close]")?.addEventListener("click", () => { menu.classList.remove("is-open"); lenis?.start(); });
  menu?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { menu.classList.remove("is-open"); lenis?.start(); }));

  document.querySelectorAll("[data-view-btn]").forEach((b) => b.addEventListener("click", () => {
    const box = b.closest(".pd-brands");
    box.dataset.view = b.dataset.viewBtn;
    box.querySelectorAll("[data-view-btn]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));
  document.querySelector("[data-top]")?.addEventListener("click", () => (lenis ? lenis.scrollTo(0, { duration: 1.2 }) : scrollTo({ top: 0, behavior: "smooth" })));

  // Reveal — once, when it enters the bottom 15% of the screen
  const start = () => {
    document.body.classList.add("is-ready");
    const els = document.querySelectorAll(".pd-rise:not([data-manual]), .pd-fade, .pd-phead__img");
    if (reduce) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -15% 0px" });
    els.forEach((e) => io.observe(e));
  };
  document.readyState === "complete" ? start() : addEventListener("load", start, { once: true });
})();
