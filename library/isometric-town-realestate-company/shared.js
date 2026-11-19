// Draws the header, phone menu, contact band and footer shared by all pages, and re-attaches section motion each time a swup transition swaps only the body (.w-local).
// Original values: Lenis lerp .15 · first curtain 1.5s power2.inOut + body 1.5s quint.out(-1s) · transition curtain 2s power2.inOut + body (-.75s) · on exit .3s power1.out
// Menu pill .4s circ.out (press .2s power2.out) · text-line band one frame 6px (scroll direction·speed ×.08 max +5, lerp .08) · review band one frame 1px (drag 2.5x) · company board .6s power2.out
(() => {
  const html = document.documentElement;
  // Pre-set data-shown on the observed reveal targets="0" Attached so that svg-sweep-pop (on: state) can find the ancestor to wait for when it attaches
  const markIv = (root) => root.querySelectorAll(".js-iv:not([data-shown])").forEach((n) => n.setAttribute("data-shown", "0"));
  markIv(document);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  gsap.registerPlugin(ScrollTrigger, Draggable);

  const arrow = '<svg viewBox="0 0 16 16"><path d="M9.3 3.3 13.9 8l-4.6 4.7-1-1L11.2 8.7H2V7.3h9.2L8.3 4.3z"/></svg>';
  const ext = '<svg viewBox="0 0 16 16"><path d="M5 3h8v8h-1.4V5.4L4 13l-1-1 7.6-7.6H5z"/></svg>';
  const btn = (t, href) => `<a class="w-btn" href="${href}"><span class="w-btn__ov"></span><span class="w-btn__t">${t}</span><span class="w-btn__i">${arrow}${arrow}</span></a>`;
  window.wBtn = btn;
  const nav = [["Home", "index.html", "home"], ["About", "about.html", "about"], ["Service", "service.html", "service"], ["Company", "index.html#company", ""], ["Careers", "recruit.html", "recruit"], ["News", "news.html", "news"]];
  const word = (t = "BRAND") => `<span class="w-wordmark" data-label="Company English wordmark">${t}</span>`;
  const sbanner = (name, label) => `<a class="w-sbanner" href="#">${word(name)}<span class="w-sbanner__row"><span class="f-xs">${label}</span><span class="w-sbanner__icon"><span class="w-ibtn__ov"></span><span class="w-ibtn__i">${ext}${ext}</span></span></span></a>`;

  // ── Isometric village — redraws the original svg illustration with shapes of the same grain (two roofs, two walls, windows, higher in the middle like a ridge) ──
  const town = (w, h, seed, people) => {
    let r = seed;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    let s = "";
    const n = Math.round(w / 110);
    // Place houses along the ridge and stack two or three more rows beneath to make a clustered village like the original
    const homes = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), ridge = h * (0.74 - 0.52 * Math.pow(Math.sin(Math.PI * t * 0.85), 1.5) - 0.08 * rnd());
      for (let row = 0, top = ridge; top < h * 0.95 && row < 2; row++) {
        const bw = 80 + rnd() * 70, bh = 50 + rnd() * 60;
        homes.push({ x: i * (w / n) + rnd() * 30 - 40 + row * 18, top, bw, bh });
        top += bh * 0.85;
      }
    }
    homes.sort((a, b) => a.top - b.top);
    for (const hm of homes) {
      const { x, bw, bh } = hm, d = bw * 0.45;
      const y = hm.top + bh, p = (pts) => pts.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
      s += `<polygon class="wall-a" points="${p([[x, y], [x + bw, y - bw * 0.3], [x + bw, y - bw * 0.3 - bh], [x, y - bh]])}"/>`;
      s += `<polygon class="wall-b" points="${p([[x + bw, y - bw * 0.3], [x + bw + d, y - bw * 0.3 + d * 0.5], [x + bw + d, y - bw * 0.3 + d * 0.5 - bh], [x + bw, y - bw * 0.3 - bh]])}"/>`;
      s += `<polygon class="roof-a" points="${p([[x, y - bh], [x + bw, y - bw * 0.3 - bh], [x + bw * 0.5 + d * 0.5, y - bh - bw * 0.15 - d * 0.75], [x - d * 0.2, y - bh - d * 0.5]])}"/>`;
      s += `<polygon class="roof-b" points="${p([[x + bw, y - bw * 0.3 - bh], [x + bw + d, y - bw * 0.3 + d * 0.5 - bh], [x + bw * 0.5 + d * 0.5, y - bh - bw * 0.15 - d * 0.75]])}"/>`;
      const cols = 1 + Math.floor(rnd() * 2);
      for (let c = 0; c < cols; c++) {
        const wx = x + 10 + c * ((bw - 20) / cols), wy = y - bh * 0.55 - c * ((bw - 20) / cols) * 0.3;
        s += `<polygon class="${rnd() > 0.3 ? "win" : "win-b"}" points="${p([[wx, wy], [wx + 12, wy - 3.6], [wx + 12, wy - 15.6], [wx, wy - 12]])}"/>`;
      }
    }
    if (people) {
      const px = w * 0.22, py = h * 0.36;
      for (const [dx, cls] of [[0, "ppl"], [16, "ppl-b"]]) s += `<path class="${cls}" d="M${px + dx} ${py}a5 5 0 1 1 0.1 0zM${px + dx - 4} ${py + 7}h8l3 16h-3l-2-9-2 18h-3l-1-12-2 12h-3z"/>`;
    }
    return `<svg class="w-town" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${s}</svg>`;
  };

  // ── Header, phone menu, contact strip, footer ──
  const header = document.querySelector('[data-slot="header"]');
  if (header) {
    header.innerHTML = `<a class="w-header__logo" href="index.html">${word()}</a>
      <div class="w-header__menu"><div class="w-menu__sitemap"><div class="w-menu__rail" data-menu-rail><div class="w-menu__track" data-menu-track></div>
        ${nav.map(([t, h, p]) => `<a class="w-menu__item" href="${h}" data-nav="${p}">${t}</a>`).join("")}</div></div>
        <a class="w-menu__cta" href="#contact"><span class="w-menu__ov"></span><span>Contact</span></a></div>
      <button class="w-toggle" type="button" data-toggle aria-label="Menu">MENU</button>
      <nav class="w-nav" data-slot="mobile-menu"><div class="w-nav__ov" data-toggle></div><div class="w-nav__inner">
        <ul class="w-nav__main f-xl">${nav.map(([t, h]) => `<li><a href="${h}">${t}</a></li>`).join("")}<li><a href="#contact">Contact</a></li></ul>
        <ul class="w-nav__sub f-small"><li><a href="#">Privacy policy</a></li><li><a href="#">Legal notice</a></li></ul>
        <div class="w-footer__banners">${sbanner("BRAND", "Your first service here")}${sbanner("SECOND", "Your second service here")}</div></div></nav>`;
    const track = header.querySelector("[data-menu-track]");
    gsap.set(track, { opacity: 0, scale: 0.9 });
  }
  const footer = document.querySelector('[data-slot="footer"]');
  if (footer) {
    footer.innerHTML = `<div class="w-contact" id="contact" data-slot="contact-band"><div class="w-contact__panel js-iv">
        <div class="w-gradient" data-fx="cursor-glow-blob"><div class="w-gradient__mix"></div><div data-fx-part="blob"></div><canvas class="w-gradient__noise" data-noise></canvas></div>
        <p class="f-xl js-i-fade">Add a two-line sentence here saying inquiries for service consultation, press and partnerships are accepted.</p>
        <p class="f-small js-i-fade">One line saying a representative will reply after reviewing the content.</p>
        <div class="js-i-fade">${btn("Contact Us", "#")}</div></div>
        <div class="w-contact__visual" data-fx="svg-sweep-pop" data-label="Isometric town illustration · blue houses · slanting to the right" data-town="1400,520,7"></div></div>
      <div class="w-footer__inner"><div class="w-footer__primary">
        <div><p class="w-footer__copy f-xl">© 2022 BRAND Inc.</p><p class="w-footer__addr f-xs">〒000-0000 Your head office address here in one line<br><a href="#">Privacy policy</a><br><a href="#">Legal notice</a></p></div>
        <div class="w-footer__nav"><ul class="w-footer__menu f-xs"><li><a href="index.html">Home</a></li><li><a href="about.html">Company Story</a></li><li><a href="service.html">Business details</a></li><li><a href="index.html#company">Company info</a></li><li><a href="recruit.html">Hiring Info</a></li><li><a href="news.html">News</a></li><li><a href="#contact">Inquiry</a></li></ul>
          <div class="w-footer__banners">${sbanner("BRAND", "Your first service here")}${sbanner("SECOND", "Your second service here")}</div></div></div>
        <div class="w-footer__brand">${word()}</div></div>`;
  }
  const drawTowns = (root) => root.querySelectorAll("[data-town]").forEach((n) => {
    if (n.querySelector("svg")) return;
    const [w, h, seed, ppl] = n.dataset.town.split(",").map(Number);
    n.innerHTML = town(w, h, seed, ppl);
  });
  drawTowns(document);

  // ── Grain (noise) — paint random dots once per panel ──
  const drawNoise = (root) => root.querySelectorAll("[data-noise]").forEach((c) => {
    const w = (c.width = 256), h = (c.height = 256), ctx = c.getContext("2d"), img = ctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
  });

  // ── Smooth scroll ──
  let lenis = null, scrollV = 0, scrollD = 0;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.15 });
    lenis.on("scroll", (e) => { scrollV = e.velocity; scrollD = e.direction; ScrollTrigger.update(); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // ── Header: hides after scrolling down 120px, reappears on scroll up · menu pill ──
  let lastY = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (html.classList.contains("is-navigation-visible") || y <= 120 || y < lastY) html.classList.remove("is-header-hidden");
    else if (y > lastY) html.classList.add("is-header-hidden");
    lastY = y;
  }, { passive: true });
  document.querySelectorAll("[data-toggle]").forEach((t) => t.addEventListener("click", () => html.classList.toggle("is-navigation-visible")));
  const rail = document.querySelector("[data-menu-rail]"), mTrack = document.querySelector("[data-menu-track]");
  let curX = null, active = false, trackX = null;
  const moveTrack = (x) => {
    if (x === trackX) return;
    trackX = x;
    gsap.killTweensOf(mTrack);
    if (x === null) return void gsap.to(mTrack, { duration: 0.2, ease: "circ.out", opacity: 0, scale: 0.6 });
    gsap.timeline().to(mTrack, { duration: 0.2, ease: "power2.out", opacity: 1, scaleX: 1, scaleY: 0.9 })
      .to(mTrack, { duration: 0.4, ease: "circ.out", x }, 0).to(mTrack, { duration: 0.2, ease: "power2.out", scaleY: 1 }, 0.2);
  };
  const setCurrent = () => {
    if (!rail) return;
    const page = document.querySelector(".w-local")?.dataset.page;
    rail.querySelectorAll(".w-menu__item").forEach((a) => a.toggleAttribute("aria-current", a.dataset.nav === page));
    const cur = rail.querySelector(".w-menu__item[aria-current]");
    if (!cur) { curX = null; gsap.to(mTrack, { duration: 0.4, ease: "circ.out", opacity: 0, scale: 0.6 }); return; }
    curX = trackX = cur.offsetLeft;
    gsap.set(mTrack, { x: curX });
    gsap.to(mTrack, { duration: 0.4, ease: "circ.out", opacity: 1, scale: 1 });
  };
  rail?.querySelectorAll(".w-menu__item").forEach((a) => {
    // Over the current page cell the pill is already in place, so even the original catches no movement
    a.addEventListener("mouseenter", () => { moveTrack(a.offsetLeft); setTimeout(() => { active = true; }, 10); });
    a.addEventListener("mouseleave", () => { active = false; setTimeout(() => { if (!active) moveTrack(curX); }, 100); });
  });

  // ── Re-attached for each section ──
  let kills = [];
  const keep = (x) => { kills.push(x); return x; };
  // Places where the same type repeats (buttons, review cards, news rows) are filled with placeholders
  const fill = (root) => {
    root.querySelectorAll("[data-btn]").forEach((n) => { const [t, h] = n.dataset.btn.split("|"); n.outerHTML = btn(t, h); });
    root.querySelectorAll("[data-voices]").forEach((ul) => {
      const grid = ul.hasAttribute("data-voices-grid");
      ul.innerHTML = Array.from({ length: +ul.dataset.voices }, (_, i) => `<li class="w-voice"${grid ? "" : " data-carousel-item"}><div class="w-voice__link"><div><p class="w-voice__num">User's voice ${String(i + 1).padStart(2, "0")}</p><p class="w-voice__title">${["Your two-line user comment here. What they liked.", "Your short review here.", "Your review goes here, up to three lines: it was easy thanks to being quickly accommodated when the schedule was tight."][i % 3]}</p></div><div class="w-voice__icon"><span class="w-voice__name">Service name</span><span class="w-ibtn"><span class="w-ibtn__ov"></span><span class="w-ibtn__i">${arrow}${arrow}</span></span></div></div></li>`).join("");
    });
    root.querySelectorAll("[data-news]").forEach((ul) => {
      ul.innerHTML = Array.from({ length: +ul.dataset.news }, (_, i) => `<li class="w-news js-iv js-i-fade"><a href="news.html"><span>${["Your news title here, one line", "Your somewhat long news title goes here on one line", "Your news title about a partner winning an award here"][i % 3]}</span><span class="w-news__info"><span>2026.0${(i % 6) + 1}.30</span><span class="w-news__cat">Press Release</span></span></a></li>`).join("");
    });
  };
  function initPage(root) {
    fill(root);
    drawTowns(root);
    drawNoise(document);
    setCurrent();
    // Reveal: data-shown once the section comes 10% above the bottom of the screen="1"
    const io = keep(new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-shown", "1"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" }));
    // Like the original, observation is turned on when the curtain lifts and the body begins to rise (onStart) — if turned on earlier, the hero entrance would finish behind the curtain
    window.wObserve = () => document.querySelectorAll('.js-iv:not([data-shown="1"]), .js-clip-l:not([data-shown="1"]), .js-clip-m:not([data-shown="1"])').forEach((n) => io.observe(n));
    if (reduce) document.querySelectorAll(".js-iv, .js-clip-l, .js-clip-m").forEach((n) => n.setAttribute("data-shown", "1"));

    const mm = keep(gsap.matchMedia());
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Photo parallax: from section top at screen center → bottom at screen top, the inner photo moves down by 10% of its own height
      root.querySelectorAll(".js-plximg").forEach((n) => {
        const inner = n.querySelector(".w-plx"); if (!inner) return;
        ScrollTrigger.create({ trigger: n, start: "top center", end: "bottom top", onUpdate: (s) => gsap.set(inner, { y: 0.1 * n.offsetHeight * s.progress }) });
      });
    });
    mm.add("(min-width: 769px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      // Company and Careers text panel — splits up and down and swaps every cell (110vh)
      root.querySelectorAll("[data-corp]").forEach((corp) => {
        [...corp.querySelectorAll("[data-corp-area]")].forEach((area, k) => {
          const panel = corp.querySelectorAll("[data-corp-panel]")[k];
          const show = (from = 0, now = false) => { gsap.killTweensOf(panel); gsap.set(panel, { visibility: "visible" }); if (now || from === 0) gsap.set(panel, { "--y": 0 }); else gsap.fromTo(panel, { "--y": from }, { duration: 0.6, ease: "power2.out", "--y": 0, overwrite: "auto" }); };
          const hide = (to, now = false) => { gsap.killTweensOf(panel); if (now) gsap.set(panel, { visibility: "hidden", "--y": to }); else gsap.to(panel, { duration: 0.6, ease: "power2.out", "--y": to, overwrite: "auto", onComplete: () => gsap.set(panel, { visibility: "hidden" }) }); };
          ScrollTrigger.create({ trigger: area, start: "top center", end: "bottom center", onEnter: () => show(1), onLeave: () => hide(-1), onEnterBack: () => show(-1), onLeaveBack: () => hide(1), onRefresh: (s) => { if (s.isActive) show(0, true); else hide(s.progress <= 0 ? 1 : -1, true); } });
        });
        corp.querySelectorAll(".h-gallery__item").forEach((it) => {
          gsap.fromTo(it, { scale: 0.8 }, { scale: 1, ease: "none", scrollTrigger: { trigger: it, start: "top 120%", end: "top 50%", scrub: true } });
          gsap.fromTo(it, { scale: 1 }, { scale: 0.9, ease: "none", immediateRender: false, scrollTrigger: { trigger: it, start: "bottom 20%", end: "bottom -20%", scrub: true } });
        });
      });
    });

    // Giant text-line strip — flows in the scroll direction, speeds up with scroll speed, and shifts -25vw while passing through the section
    root.querySelectorAll("[data-rail]").forEach((el) => {
      const inner = el.firstElementChild; if (!inner || reduce) return;
      [...inner.children].forEach((c) => c.dataset.railClone = "0");
      const loop = inner.scrollWidth;
      while (inner.scrollWidth < el.clientWidth + loop) [...inner.querySelectorAll('[data-rail-clone="0"]')].forEach((c) => { const k = c.cloneNode(true); k.dataset.railClone = "1"; k.setAttribute("aria-hidden", "true"); inner.append(k); });
      let x = 0, off = 0, dir = -1, speed = -6, lastT = null;
      const st = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onUpdate: (s) => { off = -0.25 * innerWidth * s.progress; } });
      const tick = (t) => {
        const now = t * 1000, dt = lastT === null ? 1 : Math.min(3, Math.max(0.2, (now - lastT) / 16.6667)); lastT = now;
        if (scrollD) dir = -scrollD;
        const v = Math.abs(scrollV), target = 6 * dir + (v < 0.1 ? 0 : dir * Math.min(0.08 * v, 5));
        speed += (target - speed) * 0.08;
        x += speed * dt;
        gsap.set(inner, { x: gsap.utils.wrap(-loop, 0, x + off) });
      };
      gsap.ticker.add(tick);
      keep({ kill: () => { gsap.ticker.remove(tick); st.kill(); } });
    });

    // Reviews strip — flows 1px per frame, follows at 2.5x when dragged, and keeps flowing in the direction released
    root.querySelectorAll("[data-carousel]").forEach((car) => {
      const items = [...car.querySelectorAll("[data-carousel-item]")]; if (!items.length) return;
      let iw = items[0].offsetWidth, ww = items.length * iw, cur = -100, x = 0, dir = -1, sp = -1, startX = 0, moved = false, lastT = null;
      const move = () => items.forEach((it, i) => { const p = i * iw + x; it.style.transform = `translate(${(((p % ww) + ww) % ww) - iw}px, 0px)`; });
      const proxy = document.createElement("div");
      const drag = Draggable.create(proxy, { type: "x", trigger: car, onPress() { startX = cur; moved = false; gsap.set(proxy, { x: 0 }); }, onDrag() { moved = Math.abs(this.x) > 3; cur = startX + this.x * 2.5; }, onRelease() { if (Math.abs(this.x) > 3) dir = this.x > 0 ? 1 : -1; gsap.set(proxy, { x: 0 }); setTimeout(() => { moved = false; }, 0); } })[0];
      car.querySelectorAll("a").forEach((a) => { a.addEventListener("dragstart", (e) => e.preventDefault()); a.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }); });
      const tick = (t) => {
        const now = t * 1000, dt = lastT === null ? 1 : Math.min(3, Math.max(0.2, (now - lastT) / 16.6667)); lastT = now;
        if (!drag.isPressed && !reduce) { sp += (dir - sp) * 0.08; cur += sp * dt; }
        x += (cur - x) * 0.1;
        move();
      };
      const onR = () => { iw = items[0].offsetWidth; ww = items.length * iw; };
      addEventListener("resize", onR);
      gsap.ticker.add(tick);
      keep({ kill: () => { gsap.ticker.remove(tick); drag.kill(); removeEventListener("resize", onR); } });
    });
    ScrollTrigger.refresh();
  }
  function destroyPage() {
    kills.forEach((k) => (k.disconnect ? k.disconnect() : k.revert ? k.revert() : k.kill?.()));
    kills = [];
  }

  // ── First curtain: waits for the image (100ms~5s), then the curtain lifts up and the body rises ──
  html.classList.add("is-first-loading");
  addEventListener("load", () => {
    initPage(document.querySelector(".w-local") || document);
    setTimeout(() => {
      html.classList.remove("is-first-loading");
      if (reduce) { gsap.set(".w-splash", { autoAlpha: 0 }); window.wObserve?.(); return; }
      gsap.timeline()
        .fromTo(".w-splash", { y: 0 }, { y: "-200vh", duration: 1.5, ease: "power2.inOut" })
        .fromTo(".w-main", { y: "10vh", opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "quint.out", onStart: () => window.wObserve?.() }, "-=1");
    }, 100);
  }, { once: true });

  // ── Page transition (swup) — on leave the body fades over .3s, on enter a gradient curtain passes over 300vh and the new body rises ──
  if (window.Swup && location.protocol !== "file:") {
    const swup = new Swup({ containers: [".w-local"], animateHistoryBrowsing: false, plugins: window.SwupPreloadPlugin ? [new SwupPreloadPlugin()] : [] });
    swup.hooks.on("visit:start", () => { destroyPage(); html.classList.remove("is-navigation-visible"); });
    swup.hooks.replace("animation:out:await", async () => { await gsap.timeline().to(".w-main", { opacity: 0, duration: reduce ? 0 : 0.3, ease: "power1.out" }); });
    swup.hooks.on("content:replace", () => { markIv(document); lenis?.scrollTo(0, { immediate: true }); scrollTo(0, 0); });
    swup.hooks.replace("animation:in:await", async () => {
      initPage(document.querySelector(".w-local"));
      if (reduce) { gsap.set(".w-main", { opacity: 1 }); window.wObserve?.(); return; }
      await gsap.timeline()
        .fromTo(".w-transition", { y: 0 }, { y: "-300vh", duration: 2, ease: "power2.inOut" })
        .fromTo(".w-main", { y: "10vh", opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "quint.out", onStart: () => { window.wObserve?.(); ScrollTrigger.refresh(); } }, "-=.75");
    });
    swup.hooks.on("visit:end", () => { const m = document.querySelector(".w-main"); if (m) m.style.transform = ""; });
  }
})();
