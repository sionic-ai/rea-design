// Shared by multiple pages — header, phone menu panel, product stage, page links, footer insertion, Lenis (duration 1.2), header white or green by scene color,
// Cube button hover (.6s power4.inOut), ON/OFF scene list, page transition (body·footer·canvas fade out in .5s → move → fade back in).
// Reading skin colors — colors painted with canvas·three are also built from theme.css variables. Computed colors (rgb·color(srgb)·oklch·oklab) are unpacked into sRGB numbers.
(() => {
  const probe = document.createElement("i");
  probe.hidden = true;
  document.documentElement.append(probe);
  const enc = (x) => 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055);
  const fromOklab = (L, a, b) => {
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(enc);
  };
  window.oaColor = (expr, alpha) => {
    probe.style.color = "";
    probe.style.color = expr;
    const s = getComputedStyle(probe).color;
    const n = (s.replace(/^[a-z]+\(\s*(?:srgb\s+)?/i, "").match(/-?[\d.]+(?:e-?\d+)?%?|none/g) || []).map((v) => (v === "none" ? 0 : v.endsWith("%") ? parseFloat(v) / 100 : +v));
    let rgb = [0, 0, 0], a = 1;
    if (/^rgba?\(/.test(s)) { rgb = n.slice(0, 3); a = n[3] ?? 1; }
    else if (/^color\(srgb/.test(s)) { rgb = n.slice(0, 3).map((v) => v * 255); a = n[3] ?? 1; }
    else if (/^oklch\(/.test(s)) { const h = ((n[2] || 0) * Math.PI) / 180; rgb = fromOklab(n[0], n[1] * Math.cos(h), n[1] * Math.sin(h)); a = n[3] ?? 1; }
    else if (/^oklab\(/.test(s)) { rgb = fromOklab(n[0], n[1], n[2]); a = n[3] ?? 1; }
    rgb = rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))));
    if (alpha != null) a = alpha;
    return { r: rgb[0], g: rgb[1], b: rgb[2], a, hex: (rgb[0] << 16) | (rgb[1] << 8) | rgb[2], vec: rgb.map((v) => v / 255), css: `rgba(${rgb.join(",")},${a})` };
  };
})();

// Shared by several pages — header, phone menu board, footer (once), Lenis 1.3.17 (duration 1.2), header white/green by scene color,
// Cube button hover (.6s power4.inOut), page transitions use barba 2.10.3 (sync · prefetch) like the original — on press it pauses .3s, then body, footer and canvas vanish over .5s
// A new page appears. Things attached and detached per page (product stage · page links · scene list · number boxes · Q&A · each page script) run through BRAND.pages.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const NAV = [
    ["about.html", "About", "about"],
    ["science.html", "Science &amp; Technology", "science"],
    ["product.html", "Product", "product"],
    ["index.html#interview", "Interview", "interview"]
  ];
  // Like the original cubeBox, split into a magnet frame (.o-cube), depth (.o-cube__depth) and rotating plate (.o-cube__in) — at rest the magnet frame and rotating plate are flat matrices
  const cube = (label) => `<div class="o-cube"><div class="o-cube__depth"><div class="o-cube__in"><span class="o-cube__face is-front">${label}</span><span class="o-cube__face is-top" aria-hidden="true">${label}</span></div></div></div>`;

  const header = document.querySelector('header[data-slot="header"]');
  if (header) {
    header.className = "o-header";
    header.innerHTML = `
      <div class="o-header__in">
        <a class="o-logo" href="index.html">/brand</a>
        <nav class="o-nav" aria-label="Main menu"><ul>${NAV.map(([h, t, k]) => `<li><a class="o-nav__link" data-nav="${k}" href="${h}">${t}</a></li>`).join("")}</ul></nav>
        <a class="o-store" href="#" aria-label="Online store">${cube("Online store")}</a>
        <button class="o-menu-btn" type="button" aria-expanded="false">Menu</button>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", `
      <div class="o-drawer" data-slot="menu-drawer">
        <p class="o-drawer__label">Menu</p>
        <ul>${NAV.map(([h, t, k]) => `<li><a data-nav="${k}" href="${h}">${t}</a></li>`).join("")}</ul>
        <a class="o-drawer__store" href="#">Online store</a>
        <button class="o-drawer__close" type="button" aria-label="Close Menu"></button>
      </div>`);
  }
  const footer = document.querySelector('footer[data-slot="footer"]');
  if (footer) {
    footer.className = "o-footer";
    footer.dataset.headerColor = "white";
    footer.innerHTML = `
      <div class="o-footer__top">
        <p class="o-footer__company">COMPANY</p>
        <nav class="o-footer__nav">${[["index.html", "Home"], ...NAV.map(([h, t]) => [h, t])].map(([h, t]) => `<a class="o-footer__link" href="${h}">${t}</a>`).join("")}</nav>
        <a class="o-footer__store" href="#" aria-label="Online store">${cube("Online store")}</a>
      </div>
      <p class="o-footer__mark" aria-hidden="true">/brand</p>
      <div class="o-footer__bottom">
        <small>© COMPANY Co.,Ltd. All Rights Reserved.</small>
        <div class="o-footer__sub"><a class="o-footer__sublink" href="#">Company homepage</a><a class="o-footer__sublink" href="#">Usage guide</a><a class="o-footer__sublink" href="#">Privacy processing</a><a class="o-footer__sublink" href="#">Inquiry</a></div>
      </div>`;
  }

  /* Lenis: original PC value duration 1.2 · same clock as ScrollTrigger */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.2, autoRaf: false });
    lenis.on("scroll", () => window.ScrollTrigger && ScrollTrigger.update());
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const pages = {};
  window.BRAND = { lenis, cube, pages };

  /* Cube button (original linkCube · cubeBox · Vc): on hover it rolls 180° on the x axis to show the back (.6s cubic-bezier(.26,.37,.08,1), on release it returns to 0° with the same curve),
     The panel tilts up to 20° following the cursor, is pulled .05 toward it and lifts 15px (follows .04 per frame). On release it returns to place with 3s elastic.out */
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  const CUBE_IN = window.CustomEase ? CustomEase.create("cube-hover-in", ".26,.37,.08,1") : "power3.out";
  const CUBE_OUT = window.CustomEase ? CustomEase.create("cube-hover-out", ".45,.09,.08,1") : "power3.out";
  // Magnet (original Vc) — tilts up to 20° toward the cursor, is pulled in by .05 and lifts 15px (.04 per frame). On release it returns to place with 3s elastic.out
  const magnet = (host, draw) => {
    const pos = { x: 0, y: 0, z: 0, rx: 0, ry: 0 }, aim = { x: 0, y: 0, z: 0, rx: 0, ry: 0 };
    let run = false, ret = null, locked = false;
    const loop = () => {
      if (!run) return;
      for (const k of ["rx", "ry"]) pos[k] += (aim[k] - pos[k]) * 0.04;
      pos.x += (aim.x * 0.05 - pos.x) * 0.04;
      pos.y += (aim.y * 0.05 - pos.y) * 0.04;
      pos.z += (aim.z * 1.5 - pos.z) * 0.04;
      draw(pos);
      requestAnimationFrame(loop);
    };
    const move = (e) => {
      const r = host.getBoundingClientRect(), hw = r.width / 2, hh = r.height / 2;
      aim.x = e.clientX - r.left - hw;
      aim.y = e.clientY - r.top - hh;
      aim.ry = -(aim.x / hw) * 20;
      aim.rx = (aim.y / hh) * 20;
    };
    const enter = (e) => {
      if (reduce || locked) return;
      ret?.kill();
      aim.z = 10;
      move(e);
      host.addEventListener("mousemove", move);
      if (!run) { run = true; requestAnimationFrame(loop); }
    };
    const leave = () => {
      if (reduce || locked) return;
      host.removeEventListener("mousemove", move);
      run = false;
      Object.assign(aim, { x: 0, y: 0, z: 0, rx: 0, ry: 0 });
      ret = gsap.to(pos, { x: 0, y: 0, z: 0, rx: 0, ry: 0, duration: 3, ease: "elastic.out", onUpdate: () => draw(pos) });
    };
    host.addEventListener("mouseenter", enter);
    host.addEventListener("mouseleave", leave);
    return {
      pos,
      lock(v) { locked = v; if (v) { run = false; host.removeEventListener("mousemove", move); } },
      off() { run = false; ret?.kill(); host.removeEventListener("mouseenter", enter); host.removeEventListener("mouseleave", leave); host.removeEventListener("mousemove", move); }
    };
  };
  window.BRAND.magnet = magnet;
  window.BRAND.CUBE_IN = CUBE_IN;

  /* Screen cursor (original Xi) — the drawing does not use the cursor directly but _rx and _ry, which follow it by .02 per frame (60fps) (screen center 0, edges ±1). 
     So it trails the cursor by a little over a second and then settles. fine is the original’s 「not a touch device」 — the scene tilt applies only then */
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, rx: 0, ry: 0, _rx: 0, _ry: 0, fine: matchMedia("(hover: hover) and (pointer: fine)").matches };
  if (!reduce) {
    addEventListener("mousemove", (e) => {
      pointer.x = e.clientX; pointer.y = e.clientY;
      pointer.rx = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      pointer.ry = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    }, { passive: true });
    gsap.ticker.add((t, dt) => {
      const k = 1 - Math.pow(0.98, Math.min(dt, 100) * 0.06);
      pointer._rx += (pointer.rx - pointer._rx) * k;
      pointer._ry += (pointer.ry - pointer._ry) * k;
    });
  }
  window.BRAND.pointer = pointer;

  const cubes = (root) => root.querySelectorAll(".o-cube").forEach((c) => {
    if (c.dataset.ready) return;
    c.dataset.ready = "1";
    // For cubes where the whole card takes interaction (page links), data-cube-host widens the receiving side
    const host = c.closest("[data-cube-host]") || c.parentElement, box = c.parentElement;
    const front = c.querySelector(".is-front"), back = c.querySelector(".is-top");
    const turn = { rx: 0 };
    const inner = c.querySelector(".o-cube__in") || c, depth = c.querySelector(".o-cube__depth");
    let half = -1, pos = { x: 0, y: 0, z: 0, rx: 0, ry: 0 }, last = "", lastIn = "";
    // Write only when the value changes — rewriting the same value makes the style look changed even while idle
    const draw = () => {
      const t = `translate3d(${pos.x * 0.2}px, ${pos.y * 0.2}px, ${pos.z * 0.2}px) rotateX(${-pos.rx * 0.2}deg) rotateY(${-pos.ry * 0.2}deg)${depth ? "" : ` translateZ(${-half}px)`}`;
      const r = `rotateX(${turn.rx - pos.rx}deg) rotateY(${pos.ry}deg)`;
      if (t !== last) c.style.transform = last = t;
      if (r !== lastIn && inner !== c) inner.style.transform = lastIn = r;
    };
    const place = () => {
      const h = box.offsetHeight / 2;
      if (h === half) return;
      half = h;
      if (depth) depth.style.transform = `translateZ(${-half}px)`;
      front.style.transform = `translateZ(${half}px)`;
      back.style.transform = `rotateX(180deg) translateZ(${half}px)`;
      draw();
    };
    // The original has three branches — sub-page header index (pageHero: −180° .5s cube-hover-in, .6s cube-hover-out on release, no magnet),
    // Product stage buttons (buttonCube: 180° .6s back and forth, no magnet), other store·purchase buttons (linkCube: same roll + magnet)
    const kvMode = !!host.closest(".o-kv__index"), plain = kvMode || !!host.closest(".o-promo__btns");
    if (!plain) pos = magnet(host, draw).pos;
    c.cubeTurn = (rx, opt) => gsap.to(turn, { rx, overwrite: true, onUpdate: draw, ...opt, duration: reduce ? 0 : opt.duration });
    place();
    new ResizeObserver(place).observe(host);
    // The table of contents back face turns on at first touch (the original link-face opacity-0 is removed then)
    host.addEventListener("mouseenter", () => { if (kvMode) back.classList.add("is-seen"); c.cubeTurn(kvMode ? -180 : 180, { duration: kvMode ? 0.5 : 0.6, ease: CUBE_IN }); });
    host.addEventListener("mouseleave", () => c.cubeTurn(0, { duration: 0.6, ease: kvMode ? CUBE_OUT : CUBE_IN }));
    if (kvMode) { turn.rx = 180; draw(); }
  });
  cubes(document);

  /* Phone Menu */
  const menuBtn = document.querySelector(".o-menu-btn");
  const drawer = document.querySelector(".o-drawer");
  const hdr = document.querySelector(".o-header");
  const setMenu = (open) => {
    menuBtn?.setAttribute("aria-expanded", open);
    drawer?.classList.toggle("is-open", open);
  };
  menuBtn?.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  drawer?.querySelector(".o-drawer__close").addEventListener("click", () => setMenu(false));

  /* Header line color: follows the data-header-color of the section touching the top edge of the screen (re-collected when the page changes) */
  let colored = [];
  const pick = () => {
    if (!hdr || drawer?.classList.contains("is-open")) return;
    let c = null;
    for (const el of colored) {
      const r = el.getBoundingClientRect();
      if (r.top <= 40 && r.bottom > 40) c = el.dataset.headerColor;
    }
    if (c) hdr.dataset.color = c;
  };
  addEventListener("scroll", pick, { passive: true });
  window.BRAND.pickHeader = pick;

  /* ── Shared parts attached and detached per page ── */
  const sharedPage = (root) => {
    const offs = [];
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
    const promo = root.querySelector('[data-slot="promo"]');
    if (promo && !promo.classList.contains("o-promo")) {
      promo.classList.add("o-promo");
      promo.innerHTML = `
        <div class="wf-img" data-label="Product bag on mint-colored box pillars · soft overhead light · full width"></div>
        <div class="o-promo__in">
          <p class="o-promo__mark">/brand</p>
          <div class="wf-img o-promo__pack" data-label="Green product bag front · on a stand"></div>
          <p class="o-promo__copy">Your big sentence, first line, goes here.<br>Your second line goes here.</p>
          <p>Your one-line product intro goes here.<br>Your second line goes here.</p>
          <p class="o-promo__price">Your capacity and price line here</p>
        </div>
        <div class="o-promo__btns"><a class="o-promo__btn" href="product.html">${cube("View Details")}</a><a class="o-promo__btn" href="#">${cube("Online store")}</a></div>`;
    }
    const links = root.querySelector('[data-slot="page-links"]');
    if (links && !links.classList.contains("o-links")) {
      links.classList.add("o-links");
      links.innerHTML = [
        ["about.html", "About", "Green ring graphic"],
        ["science.html", "Science &amp;<br>Technology", "Scattered particle graphic"],
        ["product.html", "Product", "Product Bag Front View"],
        ["index.html#interview", "Interview", "Four-person grid"]
      ].map(([h, t, l]) => `<a class="o-links__card" href="${h}" data-cube-host><div class="wf-img" data-label="${l} · Portrait 3:4"></div><b class="o-links__cube">${cube(t)}</b><span>Your one-line intro here<br>Keep it short</span></a>`).join("");
    }
    root.querySelectorAll(".o-kv__index a").forEach((a) => {
      if (a.querySelector(".o-cube")) return;
      a.classList.add("o-kv__link");
      const html = a.innerHTML;
      a.innerHTML = `<div class="o-cube"><div class="o-cube__depth"><div class="o-cube__in"><span class="o-cube__face is-front">${html}</span><span class="o-cube__face is-top" aria-hidden="true">${html}</span></div></div></div>`;
    });
    cubes(root);

    /* Sub-page hero reveal (original pageHero) — after .5s the contents cubes turn back from 180° at .15s intervals over .8s cube-hover-out, 
       .3s later the large title letters rise from below at .04s intervals (1.1s, inner .7s cubic-bezier(.43,.05,.17,1), opacity .7s delayed by .3s) and the circle arrow turns on at .5s */
    const kv = root.querySelector(".o-kv");
    if (kv) {
      const h1 = kv.querySelector("h1");
      if (h1 && !h1.querySelector(".t-wrap")) {
        let n = 0;
        h1.querySelectorAll("span").forEach((sp) => {
          sp.innerHTML = [...sp.textContent].map((ch) => (ch === " " ? " " : `<i class="t-wrap" style="--index:${n++}"><i>${ch}</i></i>`)).join("");
        });
      }
      const kvCubes = [...kv.querySelectorAll(".o-kv__index .o-cube")];
      const arrow = kv.querySelector(".o-circle-btn");
      const timers = [
        setTimeout(() => kvCubes.forEach((c, i) => { c.classList.add("is-shown"); c.cubeTurn?.(0, { duration: 0.8, delay: reduce ? 0 : i * 0.15, ease: CUBE_OUT }); }), reduce ? 0 : 560),
        setTimeout(() => { kv.classList.add("is-on"); arrow?.classList.add("is-on"); }, reduce ? 0 : 860)
      ];
      offs.push(() => timers.forEach(clearTimeout));
    }

    /* ON/OFF scene list: as the list passes the screen center, one word at a time turns green */
    root.querySelectorAll(".o-scene").forEach((scene) => {
      const items = [...scene.querySelectorAll("li")];
      const photo = scene.querySelector(".o-scene__photo");
      const labels = items.map((li) => li.dataset.photo);
      let current = -1;
      const update = () => {
        const r = scene.querySelector(".o-scene__list").getBoundingClientRect();
        const p = Math.min(0.999, Math.max(0, (innerHeight * 0.5 - r.top) / r.height));
        const i = Math.floor(p * items.length);
        if (i === current) return;
        current = i;
        items.forEach((li, k) => li.classList.toggle("is-on", k === i));
        if (photo && labels[i]) photo.dataset.label = labels[i];
      };
      on(window, "scroll", update, { passive: true });
      update();
    });

    /* Arrow below the circle: to the next section after the header */
    root.querySelectorAll(".o-circle-btn").forEach((b) => {
      if (!b.querySelector("svg")) b.insertAdjacentHTML("afterbegin", '<svg viewBox="0 0 32 32" aria-hidden="true"><circle class="o-circle-btn__base" cx="16" cy="16" r="15"/><circle class="o-circle-btn__line" cx="16" cy="16" r="15"/></svg>');
      const line = b.querySelector(".o-circle-btn__line");
      on(b, "mouseenter", () => gsap.to(line, { strokeDashoffset: 0, duration: reduce ? 0 : 1, ease: "power4.inOut", overwrite: true }));
      on(b, "mouseleave", () => gsap.to(line, { strokeDashoffset: 94.25, duration: reduce ? 0 : 1, ease: "power4.inOut", overwrite: true }));
    });
    root.querySelectorAll(".o-circle-btn").forEach((b) => on(b, "click", (e) => {
      e.preventDefault();
      const next = b.closest("section")?.nextElementSibling;
      if (!next) return;
      lenis ? lenis.scrollTo(next, { duration: 1.2 }) : next.scrollIntoView();
    }));

    /* Rotating number box — each cell (face) bends progress with easeInOutQuad and turns 90° at a time (original stickyContent) */
    root.querySelectorAll(".o-panel").forEach((panel) => {
      const box = panel.querySelector(".o-panel__box");
      const faces = [...panel.querySelectorAll(".o-panel__face")];
      const texts = [...panel.querySelectorAll(".o-panel__text")];
      const n = faces.length;
      const place = () => {
        const w = box.offsetWidth;
        faces.forEach((f, i) => (f.style.transform = `rotateY(${i * 90}deg) translateZ(${w / 2}px)`));
        box.style.setProperty("--half", w / 2 + "px");
      };
      place();
      on(window, "resize", place);
      const update = () => {
        const r = panel.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
        const raw = p * (n - 1);
        const k = Math.floor(raw), t = raw - k;
        // Original stickyContent — adds 90° per step with easeInOutQuad
        const turn = reduce ? Math.round(raw) : k + (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        box.style.transform = `translateZ(calc(var(--half) * -1)) rotateY(${-turn * 90}deg)`;
        const shown = Math.round(turn);
        texts.forEach((el, i) => el.classList.toggle("is-on", i === shown));
      };
      on(window, "scroll", update, { passive: true });
      update();
    });

    root.querySelectorAll(".o-qa dt").forEach((dt) => {
      const dd = dt.nextElementSibling;
      on(dt, "click", () => {
        const open = !dt.classList.contains("is-open");
        dt.classList.toggle("is-open", open);
        // Original accordion — measures the height and opens and closes with a css transition (.5s cubic-bezier(.43,.05,.17,1))
        dd.style.height = open ? `${dd.scrollHeight}px` : "0px";
      });
    });
    return () => offs.forEach((f) => f());
  };

  /* Attach one page — set body · header · menu by name (namespace) and call that page’s script */
  let offPage = null;
  const mount = (container) => {
    const ns = container.dataset.barbaNamespace;
    document.body.dataset.page = ns;
    document.body.classList.toggle("is-home", ns === "home");
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("is-current", a.dataset.nav === ns));
    if (hdr) hdr.dataset.color = container.dataset.header || "green";
    colored = [...container.querySelectorAll("[data-header-color]"), ...(footer ? [footer] : [])];
    const offShared = sharedPage(container);
    const offOwn = pages[ns]?.(container);
    offPage = () => { offShared(); offOwn?.(); };
    pick();
  };
  const unmount = () => { offPage?.(); offPage = null; };

  const boot = () => {
    const first = document.querySelector('[data-barba="container"]');
    if (!first) return;
    // On file:// barba cannot fetch the next page. It covers with the same values (.3s pause → .5s fade), then navigates normally, and the new page appears at the same length
    if (!window.barba || !/^https?:$/.test(location.protocol)) {
      document.body.classList.add("on-transition");
      mount(first);
      setTimeout(() => document.body.classList.remove("on-transition"), reduce ? 0 : 60);
      document.addEventListener("click", async (e) => {
        const a = e.target.closest("a[href]");
        if (!a || e.metaKey || e.ctrlKey || a.target === "_blank" || a.hasAttribute("data-barba-prevent")) return;
        const href = a.getAttribute("href");
        if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
        if (href.split("#")[0] === location.pathname.split("/").pop() && href.includes("#")) return;
        e.preventDefault();
        await wait(300);
        lenis?.stop();
        document.body.classList.add("on-transition");
        await wait(500);
        location.href = href;
      });
      addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("on-transition"); });
      return;
    }
    if (window.barbaPrefetch) barba.use(barbaPrefetch);
    barba.init({
      sync: true,
      cacheIgnore: false,
      // Same-page # links and new windows are not caught by barba
      prevent: ({ el }) => el.hasAttribute("data-barba-prevent") || /^#/.test(el.getAttribute("href") || ""),
      transitions: [{
        name: "transition",
        once: async ({ next }) => {
          document.body.classList.add("on-transition");
          mount(next.container);
          await wait(60);
          document.body.classList.remove("on-transition");
        },
        // Original: on press, waits .3s, then stops Lenis and
        leave: async () => { await wait(300); lenis?.stop(); },
        enter: () => {},
        // Hide body, footer and canvas in .5s, then go to the top and attach the new page
        afterLeave: async ({ next }) => {
          document.body.classList.add("on-transition");
          setMenu(false);
          await wait(500);
          unmount();
          scrollTo(0, 0);
          lenis?.scrollTo(0, { immediate: true });
          const title = new DOMParser().parseFromString(next.html, "text/html").title;
          if (title) document.title = title;
        },
        afterEnter: async ({ next }) => {
          mount(next.container);
          document.body.classList.remove("on-transition");
          lenis?.start();
          lenis?.resize();
        },
        after: async ({ next }) => {
          dispatchEvent(new Event("resize"));
          const hash = next.url.hash;
          const t = hash && next.container.querySelector(`#${CSS.escape(hash)}`);
          if (t) { await wait(500); lenis ? lenis.scrollTo(t, { duration: 1.2 }) : t.scrollIntoView(); }
        }
      }]
    });
  };
  // Attached after the page scripts (index.js · about.js · science.js) have placed themselves in BRAND.pages
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else setTimeout(boot, 0);
})();
