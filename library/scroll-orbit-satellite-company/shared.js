// Drawn here once so every page uses the same header, menu, product menu and footer.
// The original’s shared reveal motions (word masks, letter light-up, number counting, slide-in from the side, photo parallax) are also attached here via data-es-* marks.
(() => {
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 18 18 6M8 6h10v10"/></svg>';
  const LOGO = '<svg viewBox="0 0 51 49" fill="currentColor" aria-hidden="true"><path d="M4 30 20 22l3 6-16 8z"/><path d="M14 40 38 28l3 6-24 12z"/><path d="M28 18 47 4l3 5-19 14z"/></svg>';
  const page = document.body.dataset.page;

  const header = `
  <header class="es-header" data-slot="header">
    <div class="es-container es-header__grid">
      <a class="es-logo" href="index.html" data-label="Logo symbol">${LOGO}</a>
      <nav class="es-header__nav">
        <a class="es-roll" href="index.html" data-text="Main Service"><span>Main Service</span></a>
        <div class="es-roll es-prod-btn" role="button" tabindex="0" data-text="Products"><span>Products</span></div>
        <a class="es-roll" href="recruit.html" data-text="Careers"><span>Careers</span></a>
      </nav>
      <div class="es-header__right">
        <a class="es-btn1" href="#" data-text="Contact"><span>Contact</span></a>
        <button class="es-burger" type="button" aria-label="Menu"><span></span><span></span></button>
      </div>
    </div>
  </header>`;

  const menu = `
  <div class="es-menu" data-slot="site-menu">
    <div class="es-menu__scroller"><div class="es-menu__list">
      <a class="es-menu__row" href="index.html"><span>Main Service</span></a>
      <a class="es-menu__row" href="product.html"><span>Products</span></a>
      <a class="es-menu__row" href="recruit.html"><span>Careers</span></a>
      <a class="es-menu__row" href="news.html"><span>News</span></a>
      <a class="es-menu__row" href="about.html"><span>About</span></a>
    </div></div>
  </div>`;

  const featured = (name, mass, power, label) => `
        <div class="es-prod__item es-prod__stagger">
          <a class="es-prod__title" href="product.html">${name}</a>
          <div class="es-prod__preview">
            <div class="wf-img es-ph" data-label="${label}"></div>
            <div class="es-prod__specs">${mass}<br>${power}</div>
          </div>
        </div>`;
  const group = (title, n) => `
        <div class="es-prod__group">
          <a class="es-prod__label es-prod__stagger" href="product.html">${title}</a>
          ${Array.from({ length: n }, (_, i) => `<div class="es-prod__stagger"><a class="es-prod__link" href="product.html">Item Name ${String(i + 1).padStart(2, "0")}</a></div>`).join("")}
        </div>`;
  const prod = `
  <div class="es-prod" data-slot="products-menu">
    <div class="es-prod__inner">
      <div class="es-prod__featured">
        <a class="es-prod__label es-prod__stagger" href="product.html">Featured</a>
        ${featured("Product S", "000 kg", "0.0 kW peak", "Satellite body cut-out · front view · black background · 10:9")}
        ${featured("Product L", "000 kg", "0.0 kW peak", "Large satellite body cutout · angled · black background · 16:9")}
        ${featured("Product Max", "0 - 0 tons", "00 kW peak", "Largest satellite cutout · solar panels unfolded · black background · 3:2")}
      </div>
      <div class="es-prod__groups">
        ${group("Group One", 3)}
        ${group("Group Two", 7)}
      </div>
    </div>
  </div>`;

  // Footer links tilt and roll to swap just like the header links — the company column links to this one shared page
  // Footer links share the type of the header links (es-roll), as in the original, and only one two-line item with a different type (partnership notice slot) is set apart
  const link = (t, href = "#", extra = "") => `<a class="es-roll${extra}" href="${href}" data-text="${t}"><span>${t}</span></a>`;
  const PAGES = [["Main Service", "index.html"], ["About", "about.html"], ["Projects", "works.html"], ["Products", "product.html"], ["News", "news.html"], ["A Longer Program Name Note", "#", " es-footer__wide"], ["Careers", "recruit.html"]];
  const col = (title, n, pages) => `
        <div class="es-footer__col" data-es-expander>
          <div class="es-footer__label">${title}<i class="es-footer__plus"></i></div>
          <div class="es-footer__expander"><div class="es-footer__links">${(pages || Array.from({ length: n }, (_, i) => [`Link Name ${String(i + 1).padStart(2, "0")}`])).map(([t, h, x]) => link(t, h, x)).join("")}</div></div>
        </div>`;
  const cert = (k) => `<svg class="es-footer__cert" viewBox="0 0 66 66" fill="none" stroke="currentColor" aria-label="Certification mark ${k}"><circle cx="33" cy="33" r="31" stroke-width="2"/><circle cx="33" cy="33" r="22" stroke-width="1"/><path d="M20 33h26M33 20v26" stroke-width="1"/></svg>`;
  // The background pattern isn’t a photo in the original either but a dark slanted shape (924×1024) overlapping at top right — drawn as our slanted band in the same place and size
  const shapes = `<svg viewBox="0 0 924 1024" preserveAspectRatio="none" aria-hidden="true"><path d="M318 136 924 52v148L398 282z"/><path d="M196 418 924 326v146L278 562z"/><path d="M64 700 772 612l78 142-704 86z"/><path d="M0 958 532 896l40 128H0z"/></svg>`;
  const footer = `
  <div class="es-footer-frame">
  <footer class="es-footer" data-slot="footer">
    <div class="es-footer__bg">${shapes}</div>
    <div class="es-container">
      <div class="es-footer__line"></div>
      <div class="es-footer__grid">
        <div class="es-footer__first">
          <div class="es-footer__label">Headquarter</div>
          <div class="es-footer__addr">Your head office address here<br>Placed in three lines<br>00000 City Name</div>
        </div>
        <div class="es-footer__cols">${col("Company", 7, PAGES)}${col("Products", 9)}${col("Services", 3)}</div>
      </div>
      <div class="es-footer__grid es-footer__news">
        <div class="es-footer__first">
          <div class="es-footer__label">Your news signup notice here<br>Place it in two lines</div>
          <div class="es-footer__input"><span>Email</span><button class="es-footer__send" type="button" aria-label="Send"><svg viewBox="0 0 58 58"><path d="M15 41.6 39.4 17.2H22v-2.4h21.5v21.5h-2.4V18.9L16.7 43.3z"/></svg></button></div>
          <div class="es-footer__certs">${cert(1)}${cert(2)}</div>
        </div>
        <div class="es-footer__cols">${col("Contacts", 3)}<div class="es-footer__col is-empty"></div>${col("Connect", 5)}</div>
      </div>
      <div class="es-footer__line"></div>
      <div class="es-footer__bottom">
        <div class="es-copy">© 0000 Your copyright line here</div>
        <a class="es-roll es-copy is-mid" href="#" data-text="Legal & Privacy"><span>Legal &amp; Privacy</span></a>
        <a class="es-roll es-copy" href="#" data-text="Terms of Use"><span>Terms of Use</span></a>
      </div>
    </div>
  </footer>
  </div>`;

  const mouse = `<div class="es-mouse" aria-hidden="true"><div class="es-mouse__follower"><div class="es-mouse__wrap"><div class="es-mouse__dot">Drag</div></div></div></div>`;

  document.querySelector("[data-es-header]")?.insertAdjacentHTML("afterend", mouse + header + menu + prod);
  document.querySelector("[data-es-header]")?.remove();
  const ft = document.querySelector("[data-es-footer]");
  if (ft) { ft.insertAdjacentHTML("afterend", footer); ft.remove(); }

  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = () => innerWidth > 768;

  // Reads the colors the original painted via JS (off text → white text) from the skin variables — color-mix and oklch computed values come out as color(srgb …) and oklab(…)
  // GSAP · three can’t read it, so paint it onto a 1×1 canvas and decode it as rgb
  const probe = document.createElement("i");
  probe.style.display = "none";
  document.body.append(probe);
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  px.canvas.width = px.canvas.height = 1;
  const color = (v) => {
    probe.style.color = `var(${v})`;
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = getComputedStyle(probe).color;
    px.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = px.getImageData(0, 0, 1, 1).data;
    return a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  };
  window.ES = { color, desktop, reduce, mm };

  // Smooth scroll — original lenis 1.3.17 defaults (lerp .1)
  let lenis = null;
  if (!reduce && window.Lenis && !document.body.hasAttribute("data-es-own-scroll")) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.ES.lenis = lenis;

  // Header: drops down once fonts are all loaded (original body.loaded), hides when scrolling down
  const root = document.documentElement;
  document.fonts.ready.then(() => requestAnimationFrame(() => root.classList.add("is-ready")));
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (Math.abs(y - lastY) > 4) root.classList.toggle("es-down", y > lastY && y > 120);
    lastY = y;
  }, { passive: true });

  // Page turn: the original removes loaded on click and changes the address 300ms later
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || a.hasAttribute("data-es-stay")) return;
    e.preventDefault();
    root.classList.add("es-leaving");
    setTimeout(() => location.assign(a.href), reduce ? 0 : 300);
  });
  addEventListener("pageshow", (e) => e.persisted && root.classList.remove("es-leaving"));

  // Hamburger menu: panel 1s power2.inOut, lines start .5s earlier from 150% below with 1.4s expo.out · .05s stagger
  const menuEl = document.querySelector(".es-menu");
  const rows = menuEl.querySelectorAll(".es-menu__row > span");
  const menuTl = gsap.timeline({ paused: true });
  menuTl.fromTo(menuEl, { opacity: 0, pointerEvents: "none" }, { opacity: 1, pointerEvents: "all", duration: 1, ease: "power2.inOut" });
  menuTl.add("b");
  menuTl.from(rows, { y: "150%", duration: 1.4, stagger: 0.05, ease: "expo.out" }, "b-=0.5");

  // Product menu: board .75s, rows unfold horizontally from 1.1x with .075s stagger (phone from 25% to the side)
  const prodEl = document.querySelector(".es-prod");
  const st = prodEl.querySelectorAll(".es-prod__stagger");
  // The large product row only fades opacity without widening, like the original computed value — the other rows spread from 1.1x
  const wide = [...st].filter((e) => !e.classList.contains("es-prod__item"));
  if (desktop()) { gsap.set(st, { opacity: 0, force3D: true }); gsap.set(wide, { scaleX: 1.1 }); } else gsap.set(st, { opacity: 0, x: "25%", force3D: true });
  const prodTl = gsap.timeline({ paused: true });
  prodTl.to(prodEl, { opacity: 1, pointerEvents: "all", duration: 0.75, ease: "power2.inOut" }, 0);
  if (desktop()) { prodTl.to(st, { opacity: 1, duration: 0.75, stagger: 0.075, ease: "expo.inOut" }, 0); prodTl.to(wide, { scaleX: 1, duration: 0.75, stagger: 0.075, ease: "expo.inOut" }, 0); }
  else prodTl.to(st, { opacity: 1, x: "0%", duration: 0.75, stagger: 0.075, ease: "power2.inOut" }, 0);

  let menuOpen = false, prodOpen = false;
  // Original products_menu_open · menu_open — block scroll and free the body’s right side by --sb-size (fixed .06rem)
  const lock = (on) => {
    if (on) { lenis?.stop(); document.body.style.overflow = "hidden"; document.body.style.marginRight = "calc(var(--u) * 0.06)"; }
    else { lenis?.start(); document.body.style.overflow = ""; document.body.style.marginRight = ""; }
  };
  const closeMenu = () => { menuOpen = false; root.classList.remove("es-menu-open"); menuTl.timeScale(2).reverse(); lock(prodOpen); };
  const closeProd = () => { prodOpen = false; root.classList.remove("es-prod-open"); prodTl.timeScale(2).reverse(); lock(menuOpen); };
  document.querySelector(".es-burger").addEventListener("click", () => {
    if (prodOpen) return closeProd();
    if (menuOpen) return closeMenu();
    menuOpen = true; root.classList.add("es-menu-open"); menuTl.timeScale(1).play(); lock(true);
  });
  // As in the original, it’s a non-link cell (div), so it accepts Enter and Space to open by keyboard too
  const prodBtn = document.querySelector(".es-prod-btn");
  prodBtn.addEventListener("click", () => {
    if (prodOpen) return closeProd();
    prodOpen = true; root.classList.add("es-prod-open"); prodTl.timeScale(1).play(0); lock(true);
  });
  prodBtn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); prodBtn.click(); } });

  // Cursor follow — quickTo .4s power2, drag spot (data-es-mouse="drag") only, the text panel grows larger
  const dot = document.querySelector(".es-mouse__dot");
  const fol = document.querySelector(".es-mouse__follower");
  if (desktop() && !reduce) {
    const qx = gsap.quickTo(fol, "x", { duration: 0.4, ease: "power2" });
    const qy = gsap.quickTo(fol, "y", { duration: 0.4, ease: "power2" });
    addEventListener("mousemove", (e) => { qx(e.clientX); qy(e.clientY); });
    addEventListener("mousedown", () => dot.classList.add("is-clicked"));
    addEventListener("mouseup", () => dot.classList.remove("is-clicked"));
    document.querySelectorAll("[data-es-mouse]").forEach((el) => {
      el.addEventListener("mouseenter", () => { dot.textContent = el.dataset.esMouse; dot.classList.add("is-active"); });
      el.addEventListener("mouseleave", () => dot.classList.remove("is-active"));
    });
  }

  // Hover the tail section button and the title floats up slightly (original highlightTitle)
  document.querySelectorAll(".es-cta").forEach((cta) => {
    const t = cta.querySelector(".es-cta__title"), b = cta.querySelector(".es-btn4");
    if (!t || !b) return;
    b.addEventListener("mouseenter", () => t.classList.add("is-active"));
    b.addEventListener("mouseleave", () => t.classList.remove("is-active"));
  });

  // Footer collapse (phone): from height 0 at .6s power2.inOut
  document.querySelectorAll("[data-es-expander]").forEach((box) => {
    const lab = box.querySelector(".es-footer__label"), ex = box.querySelector(".es-footer__expander");
    let tw = null, open = false;
    const setup = () => {
      tw?.kill(); gsap.set(ex, { clearProps: "height" }); box.classList.remove("is-open"); open = false;
      if (!desktop()) tw = gsap.from(ex, { height: 0, ease: "power2.inOut", duration: 0.6, paused: true });
    };
    lab.addEventListener("click", () => { if (!tw) return; open = !open; box.classList.toggle("is-open", open); open ? tw.play() : tw.reverse(); });
    setup();
  });

  // The footer sits at -16% above inside the wrapper frame (overflow hidden), and follows down from when the frame top reaches the screen bottom until the frame center reaches it, then sticks (desktop).
  // Once everything is attached, the background slope unfolds from the top — original footer values as they are. Phone·reduced motion start already unfolded
  const fFrame = document.querySelector(".es-footer-frame");
  if (fFrame) {
    const fBg = fFrame.querySelector(".es-footer__bg");
    if (desktop() && !reduce) gsap.fromTo(fFrame.querySelector(".es-footer"), { y: "-16%" }, { y: "0%", ease: "none", duration: 1, onComplete: () => fBg.classList.add("is-animated"), scrollTrigger: { trigger: fFrame, start: "top bottom", end: "50% bottom", scrub: true } });
    else fBg.classList.add("is-animated");
  }

  // ───── Shared reveal (original anim-* attribute) ─────
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.fonts.ready.then(() => {
      document.querySelectorAll("[data-es-mask]").forEach((el) => {
        const s = new SplitText(el, { type: "lines, words", linesClass: "es-split-line" });
        gsap.set(s.lines, { overflow: "hidden" });
        const auto = el.hasAttribute("data-es-auto");
        gsap.fromTo(s.words, { y: "150%" }, {
          y: "0%", ease: "expo.out", stagger: +(el.dataset.stagger ?? 0.05), duration: +(el.dataset.duration ?? 1.4), delay: +(el.dataset.delay ?? 0),
          scrollTrigger: auto ? undefined : { trigger: el, start: el.dataset.start || "top 85%", end: "bottom top" },
        });
      });
      const unlit = color("--es-unlit"), lit = color("--kf-ink");
      document.querySelectorAll("[data-es-letters]").forEach((el) => {
        const s = new SplitText(el, { type: "lines, chars" });
        gsap.fromTo(s.chars, { color: unlit }, { color: lit, ease: "power1.out", stagger: 0.015, duration: 1.2, scrollTrigger: { trigger: el, start: "top bottom", end: el.dataset.end || "bottom 10%", scrub: true } });
      });
      document.querySelectorAll("[data-es-count]").forEach((el) => {
        const i = el.querySelector("i"), end = +el.dataset.esCount, o = { v: 0 };
        gsap.fromTo(o, { v: 0 }, { v: end, ease: "power1.inOut", duration: 2, scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top" }, onUpdate: () => (i.textContent = Math.floor(o.v)) });
      });
      document.querySelectorAll("[data-es-stagger-left]").forEach((el) => {
        if (!desktop() && el.hasAttribute("data-no-mobile")) return;
        gsap.fromTo(el.querySelectorAll(".es-piece"), { opacity: 0, x: el.dataset.direction === "inverse" ? "-25%" : "25%" }, {
          opacity: 1, x: "0%", ease: "power2.inOut", stagger: +(el.dataset.stagger ?? 0.1), duration: +(el.dataset.duration ?? 1.3),
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom 50%", scrub: el.dataset.scrub !== "false" },
        });
      });
      document.querySelectorAll("[data-es-fade-up]").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: el.dataset.small ? "50%" : "100%" }, { opacity: 1, y: "0%", ease: "expo.out", duration: 1, delay: +(el.dataset.delay ?? 0), scrollTrigger: { trigger: el, start: el.dataset.start || "top 85%", end: "bottom top" } });
      });
      document.querySelectorAll("[data-es-intro-media]").forEach((el) => {
        const tl = gsap.timeline({ delay: +(el.dataset.delay ?? 0), scrollTrigger: { trigger: el, start: el.dataset.start || "-50% 85%", end: "bottom top" } });
        tl.fromTo(el, { y: desktop() ? "50%" : "0%", opacity: 0 }, { opacity: 1, y: "0%", ease: "expo.inOut", duration: +(el.dataset.duration ?? 2) }, 0);
        tl.fromTo(el.children[0], { scale: desktop() ? 3 : 1 }, { scale: 1, ease: "expo.inOut", duration: +(el.dataset.duration ?? 2) }, 0);
      });
      // Photo parallax (original cardParallax) — the photo inside the slot moves down 50% while passing
      document.querySelectorAll("[data-es-parallax] .es-media").forEach((frame) => {
        const m = frame.firstElementChild;
        if (m) gsap.to(m, { y: "50%", ease: "none", scrollTrigger: { trigger: frame, scrub: true, start: "top bottom", end: "bottom top" } });
      });
      // Fixed photo number section — figures exactly as in the original frequentFeatureModules
      document.querySelectorAll(".es-ffm").forEach((sec) => {
        const track = sec.querySelector(".es-ffm__track"), sticky = sec.querySelector(".es-ffm__sticky"), tr = sec.querySelector(".es-ffm__translator");
        const frame = sec.querySelector(".es-ffm__media"), outer = sec.querySelector(".es-ffm__outer"), img = sec.querySelector(".es-ffm__img"), svg = sec.querySelector(".es-ffm__svg");
        const box = sec.querySelector(".es-ffm__nums"), nums = [...sec.querySelectorAll(".es-ffm__num")], caps = sec.querySelectorAll(".es-ffm__cap");
        const ends = nums.map((n) => +n.querySelector("span").textContent.trim());
        const half = () => sticky.offsetHeight * 0.5;
        ScrollTrigger.create({ trigger: track, pin: sticky, pinSpacing: false, start: () => `top+=${half()} 50%`, end: () => `bottom-=${half()} 50%` });
        gsap.timeline({ scrollTrigger: { trigger: track, start: () => `top+=${half()} 50%`, end: () => `bottom-=${half()} 50%`, scrub: true } })
          .from(tr, { y: "15%", ease: "power1.out", duration: 0.1 })
          .to(tr, { y: "0%", ease: "power1.inOut", duration: 0.8 })
          .to(tr, { y: "-15%", ease: "power1.in", duration: 0.1 });
        const v = gsap.timeline({ scrollTrigger: { trigger: track, start: "top 90%", end: "bottom top", scrub: true } });
        v.add("b1");
        v.fromTo(frame, { clipPath: desktop() ? "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)" : "polygon(20% 0%, 80% 0%, 80% 80%, 20% 80%)" }, {
          clipPath: "polygon(0% 20%, 100% 20%, 100% 80%, 0% 80%)", ease: "none", duration: 1.5,
          onStart: () => { gsap.killTweensOf(outer); gsap.fromTo(outer, { y: "0%", scale: 2 }, { y: "-5%", scale: 1.2, ease: "power4.out", duration: 1 }); },
        }, "b1");
        v.add("b2");
        v.to(frame, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "none", duration: 2 }, "b2");
        v.fromTo(box, { opacity: 0 }, {
          opacity: 1, ease: "none", duration: 0.2,
          onStart: () => {
            nums.forEach((n, i) => { const o = { v: 0 }, s = n.querySelector("span"); gsap.fromTo(o, { v: 0 }, { v: ends[i], ease: "power2.inOut", duration: 2, onUpdate: () => (s.textContent = Math.floor(o.v)) }); });
            gsap.killTweensOf([...caps, ...nums]);
            gsap.fromTo([...caps, ...nums], { y: "125%" }, { y: "0%", ease: "power2.inOut", duration: 0.5, stagger: 0.05 });
          },
        }, "b2");
        v.fromTo(img, { y: "-5%", scale: 1.2 }, { y: "-25%", scale: 1, ease: "none", duration: 6 }, "b2");
        v.fromTo(svg, { rotate: 90 }, { rotate: -40, ease: "power1.inOut", duration: 6 }, "b2");
      });
      ScrollTrigger.refresh();
    });
  });
})();
