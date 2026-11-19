// Common to all pages: draws the header, phone menu, loader, transition panel and footer, and hooks up smooth scroll, entrances, header white-text switch and door transition.
// Original values: head 1.2s cubic-bezier(.25,1,.5,1) · loader symbol 1.5s rotation · cubes .08s stagger · ellipses 2s/1.8s · transition .72s ease-in-out (980 and below .45s).
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  const V = (window.V = { reduced, lenis: null, page });

  const readyCbs = [];
  let isReady = false;
  V.ready = (cb) => (isReady ? cb() : readyCbs.push(cb));
  const fireReady = () => {
    isReady = true;
    readyCbs.splice(0).forEach((cb) => cb());
  };

  // Resolves skin variables (even those made with color-mix · oklch) to real rgb — the canvas paints any CSS color string, so one point is drawn and read back
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const swatch = Object.assign(document.createElement("i"), { hidden: true });
  V.color = (name) => {
    swatch.style.color = `var(${name})`;
    if (!swatch.isConnected) document.documentElement.append(swatch);
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = getComputedStyle(swatch).color;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return { r, g, b, css: (a = 1) => `rgba(${r}, ${g}, ${b}, ${a})` };
  };

  // Placeholder symbol redrawn with the same structure as the original logo (eight ring cells + a center arrow)
  const cubes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const x = 48 + Math.cos(a) * 38 - 6;
    const y = 48 + Math.sin(a) * 38 - 6;
    const tx = Math.round(Math.cos(a) * 20);
    const ty = Math.round(Math.sin(a) * 20);
    return `<rect class="cube" style="--i:${i};--tx:${tx}px;--ty:${ty}px" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="12" height="12" rx="2" transform="rotate(${(i * 45) % 90} ${(x + 6).toFixed(1)} ${(y + 6).toFixed(1)})"/>`;
  }).join("");
  const mark = `<svg class="v-mark" viewBox="0 0 96 96" aria-hidden="true">${cubes}<path class="chev" d="M38 28 58 48 38 68"/></svg>`;
  const arrow = '<svg viewBox="0 0 23 32" fill="none" stroke="currentColor" stroke-width="3"><path d="M1 16h19M12 8l8 8-8 8"/></svg>';
  const chevDown = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 4.5 5 5 5-5"/></svg>';
  const cross = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m1 1 12 12M13 1 1 13"/></svg>';
  V.icons = { mark, arrow, chevDown };

  const logo = '<div class="v-head__logo"><a href="index.html" aria-label="Home" data-label="Your brand’s English name here">BRAND</a></div>';
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("v-head");
    head.classList.toggle("is-sub", page !== "home");
    head.innerHTML = `
      <nav class="v-head__left" aria-label="Main menu" data-label="Your menu English name here">
        <a href="list.html">Menu Item 1</a>
        <a href="about.html">Menu Item 2</a>
      </nav>
      ${logo}
      <div class="v-head__right">
        <div class="v-head__ctas">
          <a class="v-pill v-pill--glass" href="recruit.html"><span>Careers</span></a>
          <a class="v-pill v-pill--dark" href="#contact"><span>Contact</span></a>
        </div>
        <button class="v-burger" type="button" aria-label="Open Menu" aria-expanded="false"><span class="v-burger__icon"><i></i><i></i><i></i></span></button>
      </div>`;
    head.insertAdjacentHTML(
      "afterend",
      `<div class="v-mnav__veil"></div>
      <nav class="v-mnav" aria-label="Phone menu" data-slot="mobile-menu">
        <div class="v-mnav__bg"></div>
        <div class="v-mnav__panel">
          <div class="v-mnav__top">${logo}<button class="v-mnav__close" type="button" aria-label="Close Menu">${cross}</button></div>
          <ul class="v-mnav__list" data-label="Your menu English name here">
            <li class="v-mnav__item" style="transition-delay:.1s"><a href="list.html">Menu Item 1</a></li>
            <li class="v-mnav__item" style="transition-delay:.16s"><a href="about.html">Menu Item 2</a></li>
          </ul>
          <div class="v-mnav__ctas">
            <div class="v-mnav__cta" style="transition-delay:.22s"><a class="v-pill v-pill--glass" href="recruit.html"><span>Careers</span></a></div>
            <div class="v-mnav__cta" style="transition-delay:.28s"><a class="v-pill v-pill--dark" href="#contact"><span>Contact</span></a></div>
          </div>
        </div>
      </nav>
      <div class="v-turn" aria-hidden="true"></div>`
    );
  }

  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("v-foot");
    const btn = (href, label) =>
      `<a class="v-foot__btn" href="${href}"><span class="v-foot__bg"></span><span class="v-foot__label">${label}</span><span class="v-foot__arrows">${arrow}${arrow}</span></a>`;
    foot.innerHTML = `
      <nav class="v-foot__nav" data-label="Your menu English name here">${btn("list.html", "Menu Item 1")}${btn("about.html", "Menu Item 2")}${btn("recruit.html", "Menu Item 3")}</nav>
      <div class="v-foot__bottom">
        <div class="v-foot__logo" aria-label="BRAND" data-label="Your brand’s English name here">${[..."BRAND"].map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>
        <div class="v-foot__meta" data-label="Your company name in English, terms link, and maker’s name in English here">
          <p class="v-foot__copy">© 0000 Company Name</p>
          <a class="v-foot__link" href="#">Privacy Policy</a>
          <a class="v-foot__link" href="#">Terms</a>
          <a class="v-foot__credit" href="#">Studio Name</a>
        </div>
      </div>`;
    // Logo text fills the full screen width — run once more after fonts load so it fits even if the typeface arrives late
    const fit = () => {
      const el = foot.querySelector(".v-foot__logo");
      el.style.fontSize = "100px";
      const w = el.clientWidth;
      const inner = [...el.children].reduce((s, c) => s + c.getBoundingClientRect().width, 0);
      el.style.fontSize = `${Math.floor(((100 * w) / inner) * 0.985)}px`;
    };
    fit();
    document.fonts?.load('800 100px "Unbounded"').then(fit);
    addEventListener("load", fit);
    addEventListener("resize", fit);
    const bottom = foot.querySelector(".v-foot__bottom");
    new IntersectionObserver(([e]) => bottom.classList.toggle("is-visible", e.isIntersecting), { threshold: 0.2 }).observe(bottom);
  }

  // ── Smooth scroll ──
  if (!reduced && window.Lenis) {
    const lenis = (V.lenis = new Lenis({ smoothWheel: true, syncTouch: true }));
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  V.scrollTo = (y, duration = 1.2) => (V.lenis ? V.lenis.scrollTo(y, { duration }) : scrollTo({ top: y, behavior: "smooth" }));

  // ── Header: white text when a black CTA or footer passes under the header ──
  const headEl = document.querySelector(".v-head");
  const darkZones = [...document.querySelectorAll(".v-cta, .v-foot")];
  const tint = () => {
    if (!headEl) return;
    const h = headEl.offsetHeight;
    headEl.classList.toggle("is-white", darkZones.some((z) => { const r = z.getBoundingClientRect(); return r.top < h && r.bottom > 0; }));
  };
  addEventListener("scroll", tint, { passive: true });
  tint();

  // ── Phone menu ──
  const mnav = document.querySelector(".v-mnav");
  const veil = document.querySelector(".v-mnav__veil");
  const burger = document.querySelector(".v-burger");
  if (mnav && burger) {
    const open = () => {
      mnav.classList.remove("is-closing");
      mnav.classList.add("is-open");
      veil.classList.add("show");
      headEl.classList.add("menu-open");
      burger.setAttribute("aria-expanded", "true");
      V.lenis?.stop();
    };
    const close = () => {
      mnav.classList.add("is-closing");
      veil.classList.remove("show");
      burger.setAttribute("aria-expanded", "false");
      setTimeout(() => {
        mnav.classList.remove("is-open", "is-closing");
        headEl.classList.remove("menu-open");
      }, 400);
      V.lenis?.start();
    };
    burger.addEventListener("click", open);
    mnav.querySelector(".v-mnav__close").addEventListener("click", close);
    veil.addEventListener("click", close);
  }

  // ── Reveal: subpage headers immediately when ready, other blocks when they enter the screen ──
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("show"), io.unobserve(e.target))),
    { threshold: 0.12 }
  );
  V.ready(() => {
    headEl?.classList.add("show");
    // The original raises the sub-page head, photo, list title, list panel and About section all at once on entering (only the delays differ) — only data-reveal is raised by scroll
    document.querySelectorAll(".v-subhero, .v-subimg, .v-rise, [data-enter]").forEach((el) => el.classList.add("show"));
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
  });
  document.querySelectorAll(".v-subhero__icon").forEach((b) => (b.innerHTML = chevDown + chevDown));
  document.querySelectorAll(".v-subhero__icon").forEach((b) =>
    b.addEventListener("click", () => {
      let next = b.closest("section").nextElementSibling;
      if (next?.classList.contains("v-subimg__overflow")) next = next.nextElementSibling;
      V.scrollTo(next.getBoundingClientRect().top + scrollY);
    })
  );

  // ── Stacking rows: each row sticks to the screen, if a row is taller than the screen, pull the cards inside up by that much, and
  //    While the next line rises from below, darkens the previous line with a black veil of .2 (821px and above) ──
  V.stickyStack = (root, { item, row, card, overlay }) => {
    const items = [...root.querySelectorAll(item)];
    gsap.matchMedia().add("(min-width: 821px)", () => {
      let triggers = [];
      const build = () => {
        triggers.forEach((t) => t.kill());
        triggers = [];
        items.forEach((it, i) => {
          const r = it.querySelector(row), c = it.querySelector(card), o = it.querySelector(overlay);
          const last = i === items.length - 1;
          const extra = Math.max(0, r.offsetHeight - innerHeight);
          it.style.height = last ? "" : `${Math.max(innerHeight, r.offsetHeight)}px`;
          if (extra > 0 && c && !last && !reduced)
            triggers.push(gsap.to(c, { y: -extra, ease: "none", scrollTrigger: { trigger: it, start: "top top", end: `+=${extra}`, scrub: true } }).scrollTrigger);
          if (o && !last && !reduced)
            triggers.push(gsap.to(o, { backgroundColor: V.color("--kf-ink").css(0.2), ease: "none", scrollTrigger: { trigger: items[i + 1], start: "top bottom", end: "top top", scrub: true } }).scrollTrigger);
        });
        ScrollTrigger.refresh();
      };
      build();
      let tm;
      const onResize = () => (clearTimeout(tm), (tm = setTimeout(build, 200)));
      addEventListener("resize", onResize);
      return () => {
        removeEventListener("resize", onResize);
        triggers.forEach((t) => t.kill());
        items.forEach((it) => (it.style.height = ""));
      };
    });
  };

  // ── Door flip: a panel comes down hinged on the upper right and covers, then goes to the next page ──
  const turn = document.querySelector(".v-turn");
  const KEY = "v-turned";
  // Original is a single-page app so navigation has no load time — when the hand reaches a link, the next page is prefetched
  const fetched = new Set();
  const prefetch = (e) => {
    const a = e.target.closest?.("a[href]");
    const href = a?.getAttribute("href");
    if (!href || !/^[a-z-]+\.html$/.test(href) || fetched.has(href)) return;
    fetched.add(href);
    document.head.append(Object.assign(document.createElement("link"), { rel: "prefetch", href }));
  };
  document.addEventListener("pointerover", prefetch, { passive: true });
  document.addEventListener("focusin", prefetch);
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !turn || e.metaKey || e.ctrlKey || a.target) return;
    const href = a.getAttribute("href");
    if (!/^[a-z-]+\.html$/.test(href)) return;
    e.preventDefault();
    if (reduced) return void (location.href = href);
    turn.classList.toggle("to-home", href === "index.html");
    turn.classList.add("show");
    V.lenis?.stop();
    sessionStorage.setItem(KEY, "1");
    // In the original, a new page rises over the panel when the panel is half turned (.36s, .225s at 980 and below) — it switches at that moment, and the arrived page enters at once without a panel
    setTimeout(() => (location.href = href), innerWidth <= 980 ? 225 : 360);
  });

  // ── Loader: only on first open of the first page. Pages reached by navigation reveal at once without the plate ──
  const turned = sessionStorage.getItem(KEY) === "1";
  sessionStorage.removeItem(KEY);
  const firstVisit = !sessionStorage.getItem("v-seen");
  sessionStorage.setItem("v-seen", "1");
  const minLoad = 2600;

  // The original shows the loader only when the first page first appears — entering a subpage directly or arriving via a transition appears without a loader
  if (reduced || page !== "home" || turned || !firstVisit) {
    requestAnimationFrame(fireReady);
    return;
  }
  const loader = document.createElement("div");
  loader.className = "v-loader";
  loader.innerHTML = `
    <svg class="v-loader__ellipse v-loader__ellipse--outer" viewBox="0 0 1500 800" aria-hidden="true">
      <defs><mask id="v-lm-o"><ellipse class="draw" cx="750" cy="400" rx="749" ry="399"/></mask></defs>
      <ellipse class="dots" cx="750" cy="400" rx="749" ry="399" mask="url(#v-lm-o)"/>
    </svg>
    <svg class="v-loader__ellipse v-loader__ellipse--inner" viewBox="0 0 800 800" aria-hidden="true">
      <defs><mask id="v-lm-i"><ellipse class="draw" cx="400" cy="400" rx="399" ry="399"/></mask></defs>
      <ellipse class="dots" cx="400" cy="400" rx="399" ry="399" mask="url(#v-lm-i)"/>
    </svg>
    ${mark}`;
  document.body.append(loader);
  const t0 = performance.now();
  const finish = () => {
    loader.classList.add("hide");
    fireReady();
    setTimeout(() => loader.remove(), 2400);
  };
  // Home reveals after the 3D stage has drawn the first scene
  const stageReady = page === "home" ? new Promise((r) => (V.stageReady = r)) : Promise.resolve();
  Promise.all([stageReady, document.fonts?.ready]).then(() => setTimeout(finish, Math.max(0, minLoad - (performance.now() - t0))));
})();
