// Common to all pages: draws the notice bar, header bar, phone menu and footer, and sets Lenis (autoRaf off, driven by the GSAP ticker) and the Brand curve (0.65,0,0.35,1) as defaults.
// Original numbers: divider box scrub 1.1 (top bottom → top 30%) · grid cells 24px down .4s .1 stagger (top bottom-=20%) · button word roll .2s .02 stagger.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("Product", "M0,0 C0.65,0 0.35,1 1,1");
  gsap.defaults({ ease: "Product" });
  ScrollTrigger.config({ ignoreMobileResize: true });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const DB = (window.DB = { reduce, lenis: null });

  const arrow = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 7h12M8 2l5 5-5 5"/></svg>';
  const plus = '<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M5.25 0h1.5v12h-1.5z"/><path d="M0 5.25h12v1.5H0z"/></svg>';
  // Our own mark in the same spot and size instead of the logo, two overlapping plates
  const mark = '<svg viewBox="0 0 28 20" fill="currentColor" aria-hidden="true"><path d="M0 0h18a10 10 0 0 1 0 20H0z" opacity=".55"/><path d="M0 6h16a4 4 0 0 1 0 8H0z"/></svg>';
  DB.icons = { arrow, plus, mark };
  const roll = 'data-fx="char-roll" data-fx-char-roll="by: word; stagger: .02; dur: .2; ease: 0.65,0,0.35,1"';
  DB.roll = roll;
  const cur = (p) => (p === page ? " is-current" : "");

  const top = document.querySelector('[data-slot="nav"]');
  if (top) {
    top.classList.add("db-top");
    top.innerHTML = `
      <div class="db-pencil" data-slot="announce-bar"><div class="db-pencil__track"><a class="db-pencil__link" href="#">Your alert one-liner here →</a></div><svg class="db-pencil__x" role="button" tabindex="0" aria-label="Close notice" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m2 2 8 8M10 2 2 10"/></svg></div>
      <nav class="db-nav db-pad" aria-label="Main menu">
        <div class="db-nav__bar">
          <a class="db-logo" href="index.html" aria-label="First Page">${mark}<span>Logo</span></a>
          <div class="db-nav__links">
            <a class="db-nav__link${cur("service")}" href="service.html"><span ${roll}>Menu 1</span></a>
            <a class="db-nav__link${cur("product")}" href="product.html"><span ${roll}>Menu 2</span></a>
            <a class="db-nav__link${cur("page")}" href="page.html"><span ${roll}>Menu 3</span></a>
            <a class="db-btn is-blue db-nav__cta" href="#" ${roll}>Document</a>
            <button class="db-burger" type="button" aria-label="Open Menu" aria-expanded="false"><svg viewBox="0 0 18 18" fill="currentColor"><rect x="1" y="1" width="6" height="6"/><rect x="11" y="1" width="6" height="6"/><rect x="1" y="11" width="6" height="6"/><rect x="11" y="11" width="6" height="6"/></svg></button>
          </div>
        </div>
        <div class="db-menu" data-slot="mobile-menu"><div class="db-menu__in">
          <div class="db-menu__links">
            <a href="service.html"><i></i>Menu 1</a><hr>
            <a href="product.html"><i></i>Menu 2</a><hr>
            <a href="page.html"><i></i>Menu 3</a>
          </div>
          <div class="db-menu__btns"><a class="db-btn is-blue" href="#" aria-label="Social 1">◇</a><a class="db-btn is-blue" href="#" aria-label="Social 2">✕</a><a class="db-btn is-blue" href="#">View document</a></div>
        </div></div>
      </nav>`;
    const x = top.querySelector(".db-pencil__x");
    x.addEventListener("click", () => top.classList.add("is-closed"));
    x.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); top.classList.add("is-closed"); } });
    // Phone — joins the notification text and flows endlessly one slot every 10s (original initNav mobile marquee)
    gsap.matchMedia().add("(max-width: 767px)", () => {
      const track = top.querySelector(".db-pencil__track"), one = track.firstElementChild;
      const w = one.offsetWidth + parseFloat(getComputedStyle(track).gap || 0);
      const copies = Math.ceil(track.parentElement.offsetWidth / w) + 2;
      for (let i = 0; i < copies; i++) track.appendChild(one.cloneNode(true));
      const tw = reduce ? null : gsap.to(track, { x: -w, duration: 10, ease: "none", repeat: -1, modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % w) } });
      return () => { tw?.kill(); gsap.set(track, { clearProps: "transform" }); [...track.children].slice(1).forEach((c) => c.remove()); };
    });
    const burger = top.querySelector(".db-burger");
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open);
      DB.lenis?.[open ? "stop" : "start"]();
    });
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("db-foot");
    const col = (h, items) => `<div class="db-foot__col"><h3>${h}</h3><ul>${items.map(([t, u]) => `<li><a class="db-foot__a" href="${u || "#"}"><span class="db-foot__item">${t}</span></a></li>`).join("")}</ul></div>`;
    foot.innerHTML = `
      <div class="db-pad"><div class="db-wrap db-foot__grid">
        <div class="db-foot__mark">${mark.replace('fill="currentColor"', 'fill="currentColor" style="color:var(--kf-on-accent)"')}</div>
        <div class="db-foot__links">
          ${col("Bundle 1", [["Menu 1 Start", "service.html"], ["Document"], ["Storage"]])}
          ${col("Bundle 2", [["Menu 2 Start", "product.html"], ["Menu 3", "page.html"]])}
          ${col("Bundle 3", [["Audit Report"], ["Privacy processing"], ["Terms of service"], ["Bug bounty"], ["Resource Bundle"], ["Points program"]])}
          ${col("Bundle 4", [["Community 1"], ["Community 2"]])}
        </div>
      </div></div>
      <div class="db-foot__word" aria-hidden="true">Wordmark</div>`;
  }

  document.querySelectorAll("[data-plus]").forEach((box) => box.insertAdjacentHTML("beforeend", ["tl", "tr", "bl", "br"].map((c) => `<span class="db-plus ${c}">${plus}</span>`).join("")));
  document.querySelectorAll("[data-arrow]").forEach((s) => (s.innerHTML = arrow));

  // Smooth scroll — original Lenis (autoRaf turned off, driven by the GSAP ticker)
  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ autoRaf: false, anchors: true, stopInertiaOnNavigate: true });
    DB.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Two divider squares — while the section’s top edge passes from screen bottom → 30%, they move from both ends toward the center (scrub 1.1).
  const dividers = () => document.querySelectorAll(".db-divider__row").forEach((row) => {
    const cubes = row.querySelectorAll(".db-cube");
    if (cubes.length < 2 || reduce) return;
    const off = () => (row.offsetWidth - cubes[0].offsetWidth) / 2;
    const st = { trigger: row, start: "top bottom", end: "top 30%", scrub: 1.1, invalidateOnRefresh: true };
    gsap.fromTo(cubes[0], { x: () => off() }, { x: 0, ease: "none", scrollTrigger: st });
    gsap.fromTo(cubes[1], { x: () => -off() }, { x: 0, ease: "none", scrollTrigger: { ...st } });
  });

  // Grid cell entrance — cells from 24px below in .4s · .1 stagger (once when 20% enters from the screen bottom)
  const grids = () => document.querySelectorAll("[data-grid-reveal]").forEach((box) => {
    const items = box.querySelectorAll("[data-grid-item]").length ? box.querySelectorAll("[data-grid-item]") : box.children;
    if (reduce) return;
    gsap.set(items, { opacity: 0, y: 24 });
    gsap.to(items, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "Product", scrollTrigger: { trigger: box, start: "top bottom-=20%", once: true } });
  });

  // Lottie — autoplay · loop like the original (lottie-web). The art is our own isometric JSON, and marker colors are repainted with skin variables
  const paint = { /* Not skin: marker colors embedded in the Lottie JSON — repainted to skin variables using this table */ "rgb(30,110,243)": "var(--kf-accent)", "rgb(255,255,255)": "var(--kf-ink)", "rgb(0,0,0)": "var(--kf-bg)", "rgb(106,118,129)": "var(--kf-dim)" };
  const recolor = (root) => root.querySelectorAll("[fill],[stroke]").forEach((n) => {
    for (const k of ["fill", "stroke"]) { const v = (n.getAttribute(k) || "").replace(/\s/g, ""); if (paint[v]) n.style[k] = paint[v]; }
  });
  DB.lotties = [];
  document.querySelectorAll("[data-lottie]").forEach((box) => {
    if (!window.lottie) return;
    // Opening via file:// blocks path (XHR). media/lotties.js holds the same JSON, so use it if present
    const key = box.dataset.lottie.replace(/^.*\//, "").replace(/\.json$/, "");
    const data = window.DB_LOTTIE?.[key];
    const anim = lottie.loadAnimation({ container: box, renderer: "svg", loop: true, autoplay: !reduce, ...(data ? { animationData: data } : { path: box.dataset.lottie }), rendererSettings: { preserveAspectRatio: "xMidYMid meet" } });
    anim.addEventListener("DOMLoaded", () => recolor(box));
    anim.addEventListener("data_failed", () => box.classList.add("is-missing"));
    DB.lotties.push(anim);
  });

  // Accordion items inside tabs — the first item is open, and only the pressed item opens (pressing again closes it). Original initGlobalTabDropdown
  document.querySelectorAll("[data-tab-dd]").forEach((w) => {
    const items = [...w.querySelectorAll("[data-tab-dd-item]")];
    items[0]?.classList.add("is-active");
    items.forEach((it) => it.querySelector("[data-tab-dd-toggle]")?.addEventListener("click", () => {
      const was = it.classList.contains("is-active");
      items.forEach((x) => x.classList.remove("is-active"));
      if (!was) it.classList.add("is-active");
      ScrollTrigger.refresh();
    }));
  });

  // Number panel — in each slot a number strip (eleven cells starting from its own number) spins down once and lands (.9s power3.out · .04 stagger, once when it reaches 85% of the screen). Original initInfoCount
  const counts = () => document.querySelectorAll(".db-stat b").forEach((b) => {
    if (b.dataset.rolled) return;
    b.dataset.rolled = "1";
    const text = b.textContent, lh = parseFloat(getComputedStyle(b).lineHeight) || b.offsetHeight;
    b.setAttribute("aria-label", text);
    b.textContent = "";
    b.style.display = "inline-flex";
    const strips = [];
    for (const ch of text) {
      if (!/\d/.test(ch)) { const sp = document.createElement("span"); sp.textContent = ch; sp.style.whiteSpace = "pre"; sp.setAttribute("aria-hidden", "true"); b.appendChild(sp); continue; }
      const v = +ch, wrap = document.createElement("span"), inner = document.createElement("span");
      wrap.setAttribute("aria-hidden", "true");
      wrap.style.cssText = `display:inline-block;height:${lh}px;overflow:hidden;vertical-align:top`;
      inner.style.cssText = `display:flex;flex-direction:column;line-height:${lh}px`;
      for (let i = 0; i < 11; i++) { const d = document.createElement("span"); d.textContent = i === 0 ? v : (v + i) % 10; inner.appendChild(d); }
      wrap.appendChild(inner); b.appendChild(wrap); strips.push(inner);
    }
    if (reduce || !strips.length) return;
    gsap.set(strips, { y: -10 * lh });
    ScrollTrigger.create({ trigger: b.closest(".db-stat") || b, start: "top 85%", once: true, onEnter: () => gsap.to(strips, { y: 0, duration: 0.9, ease: "power3.out", stagger: 0.04, overwrite: true }) });
  });

  // After the page script has set up all sections — the offset of pinned sections must be in place so the start position below is correct
  DB.ready = () => {
    const go = () => {
      dividers();
      grids();
      counts();
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    if (document.fonts) document.fonts.ready.then(() => setTimeout(go, 0));
    else addEventListener("load", go, { once: true });
  };
})();
