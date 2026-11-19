// Common to all pages: header (sound, pill nav, triangle logo, language), submenu, phone menu, first-visit logo hole loader, page transition triangle mask,
// Screen shade · floating button · glass footer · fade in when visible · Lenis 1.3.1 (original default lerp .1).
// Original values: loader power4.inOut — nav 2s (0), left text 2s (1, 1 per line), right text 2s (2), hole enlarge 1s (4), nav up 1s (4).
// Transition: power2.inOut 1s × timeScale .75(=1.333s), 80px triangle from the header logo spot (y 46) to the screen edge.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("dcExpo", "M0,0 C0.19,1 0.22,1 1,1");
  CustomEase.create("dcQuart", "M0,0 C0.77,0 0.175,1 1,1");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const body = document.body;
  const page = body.dataset.page || "home";
  const DC = (window.DC = { reduced, page, lenis: null });
  // The original (Nuxt) leaves the server-rendered page standing as is for 1.1~1.3s before scripts attach — during that time transitions and GSAP are held so the hero stays still (released in start below)
  if (!reduced) { document.documentElement.classList.add("dc-hold"); gsap.globalTimeline.pause(); }

  const arrowR = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 7h12M8 2l5 5-5 5"/></svg>';
  const chev = '<svg class="chev" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m2 3.5 3 3 3-3"/></svg>';
  const globe = '<svg class="globe" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="10" cy="10" r="8"/><ellipse cx="10" cy="10" rx="3.6" ry="8"/><path d="M2.4 7.2h15.2M2.4 12.8h15.2"/></svg>';
  const chat = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 2.5h10v7H6l-3 2.5v-2.5H2z"/></svg>';
  DC.icons = { arrowR, chev, globe, chat };
  DC.btnIcon = (svg = arrowR) => `<span class="dc-btn__icon"><i>${svg}</i><i>${svg}</i></span>`;
  // Our triangle symbol in the same spot and size instead of the original logo
  const logoSvg = (outline = false) => `<svg viewBox="0 0 78 78" aria-hidden="true"><path class="tri" d="M39 2 C35 14 33 26 2 76 H76 C45 26 43 14 39 2Z"${outline ? ' style="fill:transparent;stroke:currentColor;stroke-width:1"' : ""}/><path class="tri-in" d="M39 10 L8 72 H70Z"/><text x="39" y="56" text-anchor="middle">LOGO</text><text class="sub" x="39" y="63" text-anchor="middle">0000</text></svg>`;
  DC.logoSvg = logoSvg;
  document.querySelectorAll(".dc-btn__icon i:empty, .dc-round i:empty").forEach((i) => (i.innerHTML = arrowR));

  // Moving between pages: among our own pages
  const groups = {
    a: { name: "Menu 1", items: [["about.html", "History", "Old factory black-and-white photo · portrait"], ["about.html#ch2", "Company About", "Family group photo · warehouse · Portrait"], ["index.html#azores", "Island Coffee", "Sea cliff view · portrait"], ["news.html", "News", "Event stage photo · Portrait"]] },
    b: { name: "Menu 2", items: [["index.html#journey", "The Coffee Journey", "Hand picking coffee cherries · Portrait"], ["index.html#culture", "Science Center", "Greenhouse interior · Vertical"], ["index.html#culture", "Barista School", "Espresso extraction · Portrait"], ["index.html#quiz", "Taste Quiz", "Bundle of coffee bean bags · vertical"]] },
  };
  const cur = (p) => (p === page ? " is-current" : "");

  // ── Header ──
  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.classList.add("dc-head");
    head.innerHTML = `
      <button class="dc-audio" type="button" aria-label="Sound On" aria-pressed="false"><svg viewBox="0 0 22 12"><path d="M1 6 H21"/></svg></button>
      <button class="dc-burger" type="button" aria-expanded="false"><span>Menu</span><span>Close</span></button>
      <nav class="dc-nav" aria-label="Main menu">
        <svg class="dc-nav__shape" aria-hidden="true"><path/></svg>
        <div class="dc-nav__blur"></div>
        <span class="dc-nav__hl" aria-hidden="true"></span>
        <div class="dc-nav__side is-l">
          <button class="dc-nav__link${page === "about" ? " is-current" : ""}" type="button" data-group="a" aria-expanded="false"><span>Menu 1</span>${chev}</button>
          <button class="dc-nav__link" type="button" data-group="b" aria-expanded="false"><span>Menu 2</span>${chev}</button>
          <a class="dc-nav__link${cur("product")}${cur("detail")}" href="product.html"><span>Menu 3</span></a>
        </div>
        <div class="dc-nav__side is-r">
          <a class="dc-nav__link${cur("service")}" href="service.html"><span>Menu 4</span></a>
          <a class="dc-nav__link" href="index.html#sustain"><span>Menu 5</span></a>
          <a class="dc-nav__link${cur("news")}" href="news.html"><span>Menu 6</span></a>
        </div>
      </nav>
      <a class="dc-logo" href="index.html" aria-label="Home">${logoSvg()}</a>
      <div class="dc-lang">
        <button class="dc-lang__btn" type="button" aria-expanded="false" aria-label="Choose language">${globe}<span>KO</span>${chev}</button>
        <div class="dc-lang__drop" role="menu">
          <a href="#" class="is-on" style="--i:0" role="menuitem">Korean<i></i></a>
          <a href="#" style="--i:1" role="menuitem">Language 2<i></i></a>
        </div>
      </div>`;
    const sub = document.createElement("div");
    sub.className = "dc-sub";
    sub.setAttribute("data-slot", "sub-menu");
    sub.innerHTML = `<div class="dc-sub__top">${Object.entries(groups).map(([k, g]) => `
        <div class="dc-sub__group" data-group="${k}">
          <div class="dc-sub__head"><p class="dc-m5">${g.name}</p><a class="dc-btn is-sm is-cream" href="${g.items[0][0]}"><span class="dc-btn__label">View all</span>${DC.btnIcon()}</a></div>
          <div class="dc-sub__list">${g.items.map(([href, t, lab]) => `<a class="dc-sub__item" href="${href}"><div class="wf-img" data-label="${lab}"></div><span class="dc-t2">${t}</span></a>`).join("")}</div>
        </div>`).join("")}</div>
      <div class="dc-sub__bottom"><span>Sound: Off</span><span>© 0000 Your brand here</span></div>`;
    head.append(sub);
    const dim = document.createElement("div");
    dim.className = "dc-dim";
    head.before(dim);
    const mm = document.createElement("nav");
    mm.className = "dc-mmenu";
    mm.setAttribute("data-slot", "mobile-menu");
    mm.innerHTML = `<a href="about.html">Menu 1</a><a href="index.html#journey">Menu 2</a><a href="product.html">Menu 3</a><a href="service.html">Menu 4</a><a href="index.html#sustain">Menu 5</a><a href="news.html">Menu 6</a>`;
    head.append(mm);

    // Nav pill: two pieces with a diagonal gap for the center logo (top ±32px, bottom ±48px)
    const nav = head.querySelector(".dc-nav");
    const shapePath = nav.querySelector(".dc-nav__shape path");
    const blur = nav.querySelector(".dc-nav__blur");
    const drawShape = () => {
      const w = nav.offsetWidth, h = nav.offsetHeight, r = h / 2, c = w / 2;
      const d = `M${r} 0H${c - 32}L${c - 48} ${h}H${r}A${r} ${r} 0 0 1 ${r} 0Z M${c + 32} 0H${w - r}A${r} ${r} 0 0 1 ${w - r} ${h}H${c + 48}Z`;
      nav.querySelector("svg").setAttribute("viewBox", `0 0 ${w} ${h}`);
      shapePath.setAttribute("d", d);
      blur.style.clipPath = `path("${d}")`;
    };
    drawShape();
    addEventListener("resize", drawShape);

    // Pill that slides following the pointer (original menu-background-hover) — in the order measured from the original:
    // At first it sits at 1 on the current page item, then on hover it jumps straight there: 1 for a group (sub-plate), .3 for a plain item
    // (.5s quart.inOut leaves slowly, so it shows ~.1s later on screen). If the panel is open and you simply move to another item, it moves over at 1 as is, and
    // The panel starts folding at .25s and at .79s switches abruptly to .3 together with the panel text and dark curtain (original sub-menu shrink 292ms · svg cut to 0 at 792ms).
    // When the pointer leaves the nav, it returns to the current item and turns off (0)
    const hl = nav.querySelector(".dc-nav__hl");
    const place = (l, op, instant) => {
      const n = nav.getBoundingClientRect(), r = l ? l.getBoundingClientRect() : null;
      hl.style.transition = instant ? "none" : "";
      hl.style.transform = `translateX(${r ? r.left - n.left : nav.offsetWidth * .596}px)`;
      hl.style.width = `${r ? r.width : 184}px`;
      if (op !== null) hl.style.opacity = op;
    };
    const current = nav.querySelector(".dc-nav__link.is-current");
    const rest = () => place(current, "0");
    place(current, current ? "1" : "0", true);
    DC.navRest = rest;

    // Submenu: opens after hovering over a group for .25s (original 290ms), and stays even when the hand leaves — closes by hovering another plain item for .25s, clicking the dark curtain, or Esc.
    // On touch devices pressing a group cancels the pending open and move (the original press doesn’t touch the panel or pill)
    let openKey = "";
    const setSub = (k) => {
      openKey = k;
      sub.classList.toggle("is-open", !!k);
      dim.classList.toggle("is-on", !!k);
      // When closing, leave the panel text as is so it fades out with the panel in .54s
      if (k) sub.querySelectorAll(".dc-sub__group").forEach((g) => g.classList.toggle("is-on", g.dataset.group === k));
      head.querySelectorAll(".dc-nav__link[data-group]").forEach((l) => {
        l.classList.toggle("is-open", l.dataset.group === k);
        l.setAttribute("aria-expanded", String(l.dataset.group === k));
      });
    };
    const fine = matchMedia("(hover: hover)").matches;
    let timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, ms));
    const cancel = () => { timers.forEach(clearTimeout); timers = []; };
    // Hovering the current page item leaves the pill off (0) where it is — in the original product, service and news, hovering the current item changes nothing.
    // The hero page (no current item) keeps 1 even during the .79s the panel closes (original index hover-out goes 1→0)
    const opFor = (l) => (l === current ? "0" : ".3");
    nav.querySelectorAll(".dc-nav__link").forEach((l) => {
      const group = l.dataset.group;
      l.addEventListener("mouseenter", () => {
        cancel();
        if (group) {
          place(l, "1");
          if (fine) later(250, () => setSub(group));
        } else if (openKey) {
          place(l, null);
          later(250, () => setSub(""));
          later(790, () => place(l, current ? opFor(l) : null, true));
        } else place(l, opFor(l));
      });
      l.addEventListener("mouseleave", () => cancel());
      if (group) l.addEventListener("click", () => (fine ? cancel() : setSub(openKey === group ? "" : group)));
    });
    nav.addEventListener("mouseleave", () => { if (!openKey) rest(); });
    // Fit once more so the current item width measured before the web font attached doesn’t linger
    document.fonts.ready.then(() => !openKey && place(current, null, true));
    const close = () => { if (openKey) { setSub(""); rest(); } };
    dim.addEventListener("click", close);
    addEventListener("keydown", (e) => e.key === "Escape" && close());

    const lang = head.querySelector(".dc-lang");
    const langBtn = lang.querySelector(".dc-lang__btn");
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = lang.classList.toggle("is-open");
      langBtn.setAttribute("aria-expanded", String(on));
    });
    if (matchMedia("(hover: hover)").matches) {
      lang.addEventListener("mouseenter", () => { lang.classList.add("is-open"); langBtn.setAttribute("aria-expanded", "true"); });
      lang.addEventListener("mouseleave", () => { lang.classList.remove("is-open"); langBtn.setAttribute("aria-expanded", "false"); });
    }
    lang.querySelectorAll(".dc-lang__drop a").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
    document.addEventListener("click", (e) => !lang.contains(e.target) && lang.classList.remove("is-open"));

    const burger = head.querySelector(".dc-burger");
    burger.addEventListener("click", () => {
      const on = !mm.classList.contains("is-open");
      mm.classList.toggle("is-open", on);
      burger.classList.toggle("is-open", on);
      burger.setAttribute("aria-expanded", String(on));
      DC.lenis && (on ? DC.lenis.stop() : DC.lenis.start());
    });

    // Sound button: when on, the wave sloshes every 1.2s, when off it lies down into a straight line in .5s (stands in for the original Rive icon)
    const audio = head.querySelector(".dc-audio");
    const wave = audio.querySelector("path");
    const amp = { a: 0, t: 0 };
    const drawWave = () => {
      let d = "M1 6";
      for (let x = 1; x <= 21; x += 1) d += ` L${x} ${(6 + Math.sin((x / 20) * Math.PI * 2 + amp.t) * amp.a * Math.sin((x / 22) * Math.PI)).toFixed(2)}`;
      wave.setAttribute("d", d);
    };
    gsap.to(amp, { t: Math.PI * 2, duration: 1.2, ease: "none", repeat: -1, onUpdate: drawWave });
    gsap.set(amp, { a: 2.2 });
    drawWave();
    audio.addEventListener("click", () => {
      const on = audio.getAttribute("aria-pressed") !== "true";
      audio.setAttribute("aria-pressed", String(on));
      gsap.to(amp, { a: on ? 4.5 : 2.2, duration: .5, ease: "dcExpo" });
    });
  }

  // Round segment panel (business types·detail sense profile): per ring [inner radius, outer radius, segment count, start angle], 1.5° between segments
  DC.pie = (svg, rings) => {
    const p = (r, a) => `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
    const gap = (1.5 * Math.PI) / 180, segs = [];
    rings.forEach(([r0, r1, n, off]) => {
      for (let i = 0; i < n; i++) {
        const a0 = off + (i / n) * Math.PI * 2 + gap / 2, a1 = off + ((i + 1) / n) * Math.PI * 2 - gap / 2, big = a1 - a0 > Math.PI ? 1 : 0;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M${p(r1, a0)} A${r1} ${r1} 0 ${big} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 ${big} 0 ${p(r0, a0)}Z`);
        svg.append(path);
        segs.push({ path, mid: [Math.cos((a0 + a1) / 2) * (r0 + r1) / 2, Math.sin((a0 + a1) / 2) * (r0 + r1) / 2] });
      }
    });
    return segs;
  };

  // ── Smooth scroll (original Lenis 1.3.1 defaults) ──
  if (!reduced && window.Lenis) {
    const lenis = new Lenis();
    DC.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const t = document.querySelector(a.getAttribute("href"));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { duration: 1 }); }
    }));
  }

  // ── Screen shade: only while a dark photo section ([data-vgrad]) covers the screen ──
  const vg = document.createElement("div");
  vg.className = "dc-vgrad";
  vg.setAttribute("aria-hidden", "true");
  body.append(vg);
  const vgOn = new Set();
  document.querySelectorAll("[data-vgrad]").forEach((el) => ScrollTrigger.create({
    trigger: el, start: "top 10%", end: "bottom 90%",
    onToggle: (s) => { s.isActive ? vgOn.add(el) : vgOn.delete(el); vg.classList.toggle("is-on", vgOn.size > 0); },
  }));

  // ── Floating button ──
  const fixed = body.dataset.fixed;
  if (fixed) {
    const f = document.createElement("div");
    f.className = "dc-fixed";
    f.setAttribute("data-slot", "fixed-cta");
    f.innerHTML = fixed === "contact"
      ? `<a class="dc-contact" href="#contact"><i>${chat}</i>Inquiry</a>`
      : `<a class="dc-badge" href="index.html#quiz" aria-label="Taste Quiz"><svg class="orn" viewBox="0 0 64 64">${Array.from({ length: 16 }, (_, i) => `<path transform="rotate(${i * 22.5} 32 32)" d="M32 2 C36 8 36 12 32 16 C28 12 28 8 32 2Z"/>`).join("")}<circle cx="32" cy="32" r="19"/></svg><span class="dc-round"><i>${arrowR}</i><i>${arrowR}</i></span></a>`;
    body.append(f);
  }

  // ── Glass Footer ──
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("dc-foot");
    const col = (title, links) => `<div class="dc-foot__col"><h3>${title}</h3>${links}</div>`;
    const plus = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="m2 3.5 3 3 3-3"/></svg>';
    foot.innerHTML = `
      <div class="dc-foot__inner">
        <span class="dc-foot__bg"></span>
        <div class="dc-foot__top">
          <svg class="dc-foot__mark" viewBox="0 0 34 34" aria-hidden="true"><path d="M17 2 L2 31 H32Z M17 9 L8 27 H26Z"/></svg>
          <div class="dc-foot__cols">
            ${col("Menu 1", '<a href="about.html">History</a><a href="about.html#ch2">Company About</a><a href="index.html#azores">Island Coffee</a>')}
            ${col("Menu 2", '<a href="index.html#journey">The Coffee Journey</a><a class="is-sub" href="#">Origin</a><a class="is-sub" href="#">Stir-frying</a><a class="is-sub" href="#">Mixing</a><a class="is-sub" href="#">Sneak peek</a><a href="index.html#culture">Barista School</a><a href="index.html#culture">Science Center</a>')}
            ${col("&nbsp;", '<a class="is-cap" href="product.html">Menu 3</a><a class="is-cap" href="service.html">Menu 4</a><a class="is-cap" href="index.html#sustain">Menu 5</a><a class="is-cap" href="news.html">Menu 6</a><a class="is-cap" href="#">Menu 7</a><a class="is-cap" href="index.html#quiz">Menu 8</a>')}
          </div>
          <div class="dc-foot__acc">
            ${["Menu 1", "Menu 2", "Menu 3"].map((t) => `<details><summary>${t}${plus}</summary><div class="links"><a href="#">Sub Menu 1</a><a href="#">Sub Menu 2</a><a href="#">Sub Menu 3</a></div></details>`).join("")}
          </div>
          <div class="dc-foot__contact" data-label="Your three English contact category names here">
            <div><h4>Email</h4><p>hello@example.com</p></div>
            <div><h4>Phone Line 1</h4><p>000 00 00 00*</p></div>
            <div><h4>Phone Line 2</h4><p>000 00 00 00*</p><small>*Your pricing note here, one line</small></div>
          </div>
        </div>
        <div class="dc-foot__bottom">
          <div class="dc-foot__social"><a href="#" aria-label="Social 1"></a><a href="#" aria-label="Social 2"></a><a href="#" aria-label="Social 3"></a><a href="#" aria-label="Social 4"></a></div>
          <a class="dc-foot__book" href="#" data-label="Your external contact channel English name, two lines here">Outside Link<br>Two Lines</a>
          <div class="dc-foot__extra"><a href="#">Online shop</a><a href="#">Hiring</a><a href="#">Press Release</a></div>
        </div>
      </div>
      <div class="dc-under" data-label="Your trademark, terms, and maker credit in English"><span>© 0000 Brand Name</span><div><a href="#">Legal 1</a><a href="#">Legal 2</a><a href="#">Privacy</a><a href="#">Cookies</a></div><span>Made by Studio</span></div>`;
    // Phone accordion: height opens and closes at .75s expo.out
    foot.querySelectorAll(".dc-foot__acc details").forEach((d) => {
      const box = d.querySelector(".links");
      d.querySelector("summary").addEventListener("click", (e) => {
        e.preventDefault();
        if (d.open) {
          box.style.height = box.scrollHeight + "px";
          requestAnimationFrame(() => (box.style.height = "0px"));
          setTimeout(() => (d.open = false), 750);
        } else {
          d.open = true;
          box.style.height = box.scrollHeight + "px";
        }
      });
    });
  }

  // The section before the footer stays pinned to the screen and the glass footer rises over it — wrapper panel height = Screen + footer height
  const pre = document.querySelector(".dc-prefoot");
  if (pre && foot) {
    const wrap = document.createElement("div");
    wrap.className = "dc-prefoot-wrap";
    pre.before(wrap);
    wrap.append(pre);
    const setH = () => document.documentElement.style.setProperty("--dc-foot-h", `${foot.offsetHeight}px`);
    setH();
    new ResizeObserver(setH).observe(foot);
  }

  // Bloom in once when visible: top heading from y −10, bottom text from y 10, blur 2px and .99 scale → 2s and 2.5s power1.out (.25s later than the original)
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-rise]").forEach((el) => {
      const down = el.dataset.rise === "down";
      gsap.fromTo(el, { opacity: 0, y: down ? 10 : -10, scale: .99, filter: "blur(2px)" }, {
        opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: down ? 2.5 : 2, delay: .25, ease: "power1.out", clearProps: "filter",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });
  });

  // ── First-visit loader · page transition ──
  const triPoints = (cx, cy, s) => `${cx},${cy - s * .5} ${cx - s * .5},${cy + s * .5} ${cx + s * .5},${cy + s * .5}`;
  DC.ready = new Promise((resolve) => (DC._resolve = resolve));
  const firstSection = document.querySelector("main > section, main > header, main > div");
  const wide = matchMedia("(min-width: 1024px)").matches;
  const seen = sessionStorage.getItem("dc-intro") === "1";
  const arrived = sessionStorage.getItem("dc-nav") === "1";
  sessionStorage.removeItem("dc-nav");

  // The loader curtain is laid out hidden from the start — it preloads the Korean font pieces for the About text at first draw so letter shapes don’t change after it’s covered
  const ov = !reduced && !arrived && wide && head ? document.createElement("div") : null;
  if (ov) {
    ov.className = "dc-intro";
    ov.setAttribute("data-slot", "intro-loader");
    ov.innerHTML = `<svg width="100%" height="100%" style="position:absolute;inset:0"><defs><mask id="dc-intro-mask"><rect width="100%" height="100%" fill="white"/><polygon fill="black"/></mask></defs><rect class="dc-intro__bg-r" width="100%" height="100%" mask="url(#dc-intro-mask)" style="fill:var(--site-dark-2)"/></svg>
      <p class="dc-intro__copy is-l"><span>Your first line here</span><span>Your second line here</span></p>
      <p class="dc-intro__copy is-r"><span>Your one-line intro here</span></p>`;
    body.append(ov);
  }

  // First visit gets the long loader (stays 5s), a return visit gets the short one (original skip path: nav .7s · hole and nav up from .7s to .9s · menu items at 1.1s, ±40px over .8s)
  const runIntro = (short) => {
    sessionStorage.setItem("dc-intro", "1");
    const W = innerWidth, H = innerHeight;
    ov.classList.add("is-on");
    const poly = ov.querySelector("polygon");
    const navEls = [head.querySelector(".dc-nav"), head.querySelector(".dc-logo")];
    const F = H / 2 - 47;
    const hole = { s: 48 };
    const draw = () => poly.setAttribute("points", triPoints(W / 2, H / 2 + 8, hole.s));
    draw();
    const logo = head.querySelector(".dc-logo .tri");
    gsap.set(logo, { fillOpacity: 0 });
    navEls.forEach((n) => (n.style.zIndex = 61));
    head.style.zIndex = 61;
    // The first-visit overlay is fully assembled the moment it covers the screen and stays for 5s — the original motion-probe loader shows the same screen until the measured end (load+3s) after changing once.
    // Neither the curtain nor the center nav·logo blocks the hand — in the original too, presses on the scene of the page beneath still work while the curtain covers it.
    // Don’t count it as hover when the nav slides up and sweeps under a resting hand
    const t = short ? { enter: 0, move: .7, items: 1.1, d: .9 } : { enter: 0, move: 5, items: 5.5, d: 1 };
    body.classList.add("dc-loading");
    const tl = gsap.timeline({ defaults: { ease: "power4.inOut", duration: t.d }, onComplete: () => { ov.remove(); head.style.zIndex = ""; body.classList.remove("dc-loading"); DC._resolve(); } });
    if (short) {
      tl.fromTo(navEls, { y: F, scale: .95, opacity: 0, filter: "blur(2px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: .7, ease: "power4.out", clearProps: "filter" }, t.enter);
      gsap.set(ov.querySelectorAll(".dc-intro__copy"), { display: "none" });
    } else {
      gsap.set(navEls, { y: F });
      tl.to(ov.querySelectorAll(".is-l span"), { opacity: 0, x: -5, duration: .5 }, t.move)
        .to(ov.querySelector(".is-r span"), { opacity: 0, x: 5, duration: .5 }, t.move);
    }
    tl.to(hole, { s: Math.hypot(W, H) * 3.2, onUpdate: draw }, t.move)
      .to(navEls, { y: 0 }, t.move)
      .to(logo, { fillOpacity: 1, duration: .75 }, t.move)
      .fromTo(head.querySelector(".dc-nav__side.is-l"), { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: .8, ease: "power4.out", clearProps: "transform" }, t.items)
      .fromTo(head.querySelector(".dc-nav__side.is-r"), { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: .8, ease: "power4.out", clearProps: "transform" }, t.items);
    DC.introTl = tl;
  };

  const runReveal = () => {
    if (!firstSection) return DC._resolve();
    const W = innerWidth, H = innerHeight;
    const st = { p: 0 };
    const big = Math.hypot(W, H) * 3.2;
    const draw = () => {
      const cy = 46 + (H / 2 - 46) * st.p, s = 80 + (big - 80) * st.p;
      const half = s / 2;
      firstSection.style.clipPath = `polygon(${W / 2}px ${cy - half}px, ${W / 2 - half}px ${cy + half}px, ${W / 2 + half}px ${cy + half}px)`;
    };
    draw();
    gsap.to(st, { p: 1, duration: 1, ease: "power2.inOut", onUpdate: draw, onComplete: () => { firstSection.style.clipPath = ""; DC._resolve(); } }).timeScale(.75);
  };

  // Original (Nuxt) shows the server-rendered page as is, then the instant the script attaches, the loader curtain covers everything at once — attach time depends on page bundle size
  // differs (motion-probe loader original index 1233 · about 1133 · product 1117 · service 983 · news 1233 · detail 1317ms)
  const start = () => {
    document.documentElement.classList.remove("dc-hold");
    gsap.globalTimeline.resume();
    if (arrived) runReveal();
    else if (ov) runIntro(seen);
    else DC._resolve();
  };
  if (reduced) DC._resolve();
  // The clock counts from after the first paint — if the font CSS (@import) arrives late, painting is delayed, and counting from script time would cover the first paint with the curtain right away
  else requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(start, { home: 1230, about: 1130, product: 1120, service: 980, news: 1230, detail: 1320 }[page] || 1200)));

  // Link to our page: fades the current sheet in .5s and leaves, then the next page opens with a triangle mask
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    const here = location.pathname.split("/").pop() || "index.html";
    if (href.split("#")[0] === here) return;
    e.preventDefault();
    sessionStorage.setItem("dc-nav", "1");
    if (reduced) return (location.href = href);
    gsap.to("main, [data-slot=footer]", { opacity: 0, duration: .5, ease: "power2.inOut", onComplete: () => (location.href = href) });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
