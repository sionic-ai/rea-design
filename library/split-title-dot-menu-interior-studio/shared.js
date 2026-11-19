// Shared by the whole site — header · dot menu · phone menu · loader · line rise · hero scroll · photo parallax · footer overlap · Taxi page transition.
// Values read from the original bundle: loader 2s expo.inOut, line raise 1.15s expo.out (.06 gap), transition curtain .5s power3 → .5s power1, Lenis lerp .15.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;
  const body = document.body;
  const SD = (window.SD = window.SD || { pages: {} });
  SD.reduce = reduce;
  SD.fine = fine;

  const MARK = `<svg viewBox="0 0 52 52" aria-hidden="true"><path fill-rule="evenodd" d="M12 1a11 11 0 1 1 0 22a11 11 0 1 1 0-22Zm0 3.6a7.4 7.4 0 1 0 0 14.8a7.4 7.4 0 1 0 0-14.8ZM38 1a11 11 0 1 1 0 22a11 11 0 1 1 0-22Zm0 3.6a7.4 7.4 0 1 0 0 14.8a7.4 7.4 0 1 0 0-14.8ZM12 29a11 11 0 1 1 0 22a11 11 0 1 1 0-22Zm0 3.6a7.4 7.4 0 1 0 0 14.8a7.4 7.4 0 1 0 0-14.8ZM38 29a11 11 0 1 1 0 22a11 11 0 1 1 0-22Zm0 3.6a7.4 7.4 0 1 0 0 14.8a7.4 7.4 0 1 0 0-14.8Z"/><path d="M21.2 6h3.6v17h-3.6ZM47.2 6h3.6v17h-3.6ZM21.2 29h3.6v17h-3.6ZM47.2 24h3.6v27h-3.6Z"/></svg>`;
  const ARROW = `<svg viewBox="0 0 44 34" aria-hidden="true"><path d="M27.8 34 25 31.5l11.7-12.6H0v-3.7h36.7L25 2.6 27.8 0l15.7 17Z"/></svg>`;
  SD.arrow = (label, href, attrs = "") =>
    `<a class="sd-arrow sd-uline" href="${href}" ${attrs}><span class="sd-arrow__in"><span class="sd-arrow__a1">${ARROW}</span><span class="sd-arrow__t">${label}</span><span class="sd-arrow__a2">${ARROW}</span></span></a>`;

  // Menu — links among the pages already built. Method, Writing, and Contact are unbuilt pages, so they go to nearby pages or the footer
  // Fourth slot is the phone menu name — only the phone menu uses a Latin title typeface, so use an English placeholder (Korean would fall back to the paired serif and lose stroke contrast)
  const NAV = [
    [["Work", "works.html", "works", "Works"], ["Style", "about.html", "approach", "Process"], ["About", "about.html", "about", "About"]],
    [["News", "news.html", "news", "News"], ["Text", "news.html", "blog", "Journal"]],
    [["Inquiry", "#footer", "contact", "Contact"]],
  ];
  // Footer list — the original has only dot placeholders and no .dot-menu parent, so the dots never turn on. Keep only the hovered link and just dim the rest to .5
  const plain = (items) => `<ul class="sd-foot__list">${items.map(([t, h, k]) => `<li data-key="${k}"><a href="${h}"${h.startsWith("#") ? " data-taxi-ignore data-scroll-to" : ""}>${t}</a></li>`).join("")}</ul>`;
  const dots = (items, cls = "") =>
    `<ul class="sd-dots ${cls}">${items.map(([t, h, k]) => `<li data-key="${k}"><a href="${h}"${h.startsWith("#") ? " data-taxi-ignore data-scroll-to" : ""}>${t}</a></li>`).join("")}<span class="sd-dots__item"><span class="sd-dots__inner"></span></span></ul>`;

  function renderChrome() {
    const head = document.querySelector("[data-slot=header]");
    head.className = "sd-head";
    head.innerHTML = `
      <div class="sd-grid sd-max sd-head__row">
        <div class="sd-c sd-hide-s" style="--c:6"><a href="index.html">Studio name</a></div>
        <div class="sd-c" style="--c:6"><a class="sd-logo" href="index.html" aria-label="Back to start">${MARK}</a></div>
        <div class="sd-c sd-right sd-only-s" style="--c:6"><button class="sd-menu-btn" type="button" aria-label="Open Menu"><span class="sd-menu-btn__t">Menu</span><span class="sd-menu-btn__t">Close</span></button></div>
        <div class="sd-c sd-hide-s sd-head__nav" style="--sc:12">
          <div class="sd-grid">
            <div class="sd-c" style="--sc:12">${dots(NAV[0])}</div>
            <div class="sd-c" style="--sc:6">${dots(NAV[1])}</div>
            <div class="sd-c" style="--sc:6;display:flex;flex-direction:column;align-items:flex-end">${dots(NAV[2])}</div>
          </div>
        </div>
      </div>`;
    const mm = document.createElement("div");
    mm.className = "sd-mmenu";
    mm.dataset.slot = "mobile-menu";
    mm.innerHTML = `
      <p class="sd-mmenu__label">Browse</p><hr>
      <div class="sd-grid sd-max sd-mmenu__grid">
        <div class="sd-c sd-mmenu__nav" data-label="Your English menu name here: one or two words for the section name">${NAV.map((g) => `<ul>${g.map(([, h, , en]) => `<li><a href="${h}"${h.startsWith("#") ? " data-taxi-ignore data-scroll-to" : ""}>${en}</a></li>`).join("")}</ul>`).join("")}</div>
        <div class="sd-c sd-mmenu__contact"><a class="sd-uline" href="mailto:hello@example.com" data-taxi-ignore>hello@example.com</a><a class="sd-uline" href="tel:0000000000" data-taxi-ignore>000.000.0000</a></div>
      </div>`;
    head.after(mm);
  }

  function footerHTML() {
    return `
      <footer class="sd-foot" id="footer" data-slot="footer" data-foot>
        <div class="sd-grid sd-max sd-foot__top">
          <div class="sd-c sd-hide-s" style="--sc:6"><a href="index.html">Studio name</a></div>
          <div class="sd-c" style="--c:6;--sc:10"><a class="sd-logo" href="index.html" aria-label="Back to start">${MARK}</a></div>
          <div class="sd-c sd-right sd-s-left" style="--c:6;--sc:4"><p class="sd-foot__ask">Shall we work together?</p><a class="sd-uline sd-only-s" href="#footer" data-taxi-ignore>Contact →</a></div>
          <div class="sd-c sd-hide-s sd-s-right" style="--sc:4">${SD.arrow("Inquiry", "#footer", "data-taxi-ignore")}</div>
        </div>
        <hr>
        <div class="sd-grid sd-max sd-foot__cols">
          <div class="sd-c" style="--c:12;--sc:6">
            <p class="sd-foot__label">Contact info</p>
            <div class="sd-foot__contact"><ul><li>Studio name</li><li>Your address first line here,</li><li>Your address second line here</li><li>City name, postal code 00000</li></ul>
            <ul><li><a class="sd-uline" href="mailto:hello@example.com" data-taxi-ignore>hello@example.com</a></li><li><a class="sd-uline" href="tel:0000000000" data-taxi-ignore>000.000.0000</a></li></ul></div>
          </div>
          <div class="sd-c" style="--c:6;--sc:4"><p class="sd-foot__label">Site</p>${plain([["First", "index.html", "home"], ["Style", "about.html", "approach"], ["Text", "news.html", "blog"], ["News", "news.html", "news"], ["About", "about.html", "about"], ["Inquiry", "#footer", "contact"]])}</div>
          <div class="sd-c" style="--c:6;--sc:4"><p class="sd-foot__label">Channel</p>${plain([["Channel 1", "#footer", "s1"], ["Channel 2", "#footer", "s2"]])}</div>
          <div class="sd-c" style="--c:12;--sc:8;--scs:17">
            <p class="sd-foot__label">Get News</p>
            <p>One-line newsletter notice here.</p>
            <form class="sd-foot__form" onsubmit="return false"><input type="email" placeholder="Email address" aria-label="Email address"><button type="submit" aria-label="Send">→</button></form>
            <p class="sd-foot__fine">When you receive the newsletter <a class="sd-uline2" href="#privacy" data-taxi-ignore>Privacy policy</a>By agreeing, you will receive promotional emails.</p>
          </div>
        </div>
        <div class="sd-grid sd-max sd-foot__bottom">
          <div class="sd-c sd-o3 sd-s-o1" style="--c:12;--sc:6"><p>© Studio Name 0000</p></div>
          <div class="sd-c sd-o2 sd-s-o2" style="--c:4;--sc:4"><a class="sd-uline" href="#privacy" data-taxi-ignore>Privacy policy</a></div>
          <div class="sd-c sd-o1 sd-s-o3 sd-foot__top-btn" style="--c:12;--sc:8;--scs:17"><button class="sd-uline" type="button" data-scroll-top>Back to top</button></div>
        </div>
      </footer>`;
  }

  // ── Smooth scroll — Lenis 1.3.1, lerp .15 · wheel 1.25x. Anchor moves use a 1s expo.inOut curve
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.15, wheelMultiplier: 1.25 });
    lenis.on("scroll", () => { ScrollTrigger.update(); onScroll(lenis.scroll); });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
  } else {
    addEventListener("scroll", () => onScroll(scrollY), { passive: true });
  }
  const expoInOut = (t) => (t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2);
  SD.scrollTo = (target, now) => {
    if (lenis) lenis.scrollTo(target, { duration: now ? 0 : 1, immediate: !!now, easing: expoInOut });
    else if (typeof target === "number") scrollTo(0, target);
    else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView();
  };
  SD.lock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); };

  // ── Header — hides after scrolling past 50px, prepares the white panel past 150px, and shows again when scrolled up over 10px. The work list uses the 150px threshold only ──
  let head, lastY = 0, headLock = false, headWorks = false;
  function onScroll(y) {
    if (!head || headLock) return;
    const dir = y > lastY ? "down" : "up";
    if (headWorks) {
      if (y > 150 && dir === "down" && !head.classList.contains("is-scrolled")) head.classList.add("is-scrolled");
      else if (y <= 150 && dir === "up" && head.classList.contains("is-scrolled")) head.classList.remove("is-scrolled");
    } else if (Math.abs(lastY - y) >= 10) {
      lastY = y;
      if (dir === "down" && y > 50) {
        head.classList.add("is-scrolled");
        if (y > 150 && !body.classList.contains("is-light")) body.classList.add("is-gradient");
      } else {
        head.classList.remove("is-scrolled");
        if (y < 150 && dir === "up" && !body.classList.contains("is-light")) body.classList.remove("is-gradient");
      }
    }
    lastY = y;
  }

  function initHead() {
    head = document.querySelector(".sd-head");
    const items = [...head.querySelectorAll(".sd-head__nav a")];
    items.forEach((a) => {
      a.addEventListener("mouseenter", () => items.forEach((o) => { gsap.killTweensOf(o); gsap.to(o, { opacity: o === a ? 1 : 0.5, duration: 0.3, ease: "power1" }); }));
      a.addEventListener("mouseleave", () => items.forEach((o) => { gsap.killTweensOf(o); gsap.to(o, { opacity: 1, duration: 0.3, ease: "power1" }); }));
    });
    // On press, the current item’s dot shrinks first
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a || a.closest(".sd-dots")) return;
      head.querySelector("li.is-active")?.classList.add("is-scaling");
    });
    head.querySelectorAll(".sd-dots").forEach((ul) => {
      const lis = [...ul.querySelectorAll("li")];
      lis.forEach((li) => {
        li.addEventListener("mouseenter", () => { lis.forEach((o) => o.classList.remove("is-current")); li.classList.add("is-current"); });
        li.addEventListener("click", () => {
          head.querySelectorAll("li").forEach((o) => o.classList.remove("is-active", "is-current", "is-scaling"));
          li.classList.add("is-active", "is-current");
        });
      });
      ul.addEventListener("mouseleave", () => { lis.forEach((o) => o.classList.remove("is-current")); ul.querySelector("li.is-active")?.classList.add("is-current"); });
    });
  }
  function markCurrent(page) {
    document.querySelectorAll(".sd-dots li").forEach((li) => {
      const on = li.dataset.key === page;
      li.classList.toggle("is-active", on);
      li.classList.toggle("is-current", on);
      li.classList.remove("is-scaling");
    });
  }

  // ── Phone menu — open/close .85s (power3 opening, power4 closing), .5s power3 when closed from elsewhere
  let menuOpen = false;
  function initMenu() {
    const btn = document.querySelector(".sd-menu-btn"), panel = document.querySelector(".sd-mmenu");
    const set = (open, dur, ease) => {
      menuOpen = open;
      gsap.killTweensOf(panel);
      gsap.to(panel, { clipPath: open ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)", duration: reduce ? 0 : dur, ease, onComplete: () => { if (!menuOpen) body.classList.remove("is-transitioning"); } });
      btn.classList.toggle("is-open", open);
      body.classList.toggle("menu-open", open);
      if (open) body.classList.add("is-transitioning");
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    };
    btn.addEventListener("click", () => set(!menuOpen, 0.85, menuOpen ? "power4" : "power3"));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) set(false, 0.5, "power3"); });
    SD.closeMenu = () => { if (menuOpen) set(false, 0.5, "power3"); };
  }

  // ── Line rise — splits text into lines and places each at 110% below a mask, then when it reaches 90% of the screen runs 1.15s expo.out, .06s per line.
  //    Text inside [data-rise-group] gathers its lines and rises one after another in one go
  function prepRise(view) {
    const groups = new Map(), solo = [];
    view.querySelectorAll("[data-rise]").forEach((el) => {
      const g = el.closest("[data-rise-group]");
      if (g) { if (!groups.has(g)) groups.set(g, []); groups.get(g).push(el); } else solo.push(el);
    });
    const opts = (el) => ({ stagger: +(el.dataset.stagger ?? 0.06), duration: +(el.dataset.duration ?? 1.15), ease: el.dataset.ease || "expo.out" });
    const units = [];
    const make = (els, trigger) => {
      const u = { trigger, done: false, started: false, tl: null, splits: [] };
      // If fonts arrive late or the width changes, SplitText splits again — if it was mid-rise, it continues rising from that spot
      const build = () => {
        const at = u.tl ? u.tl.progress() : 0;
        // Reset the line to its rest position (0) with revert so a new from() doesn’t read 110% as the end value
        if (u.tl) u.tl.revert();
        const lines = u.splits.flatMap((s) => s.lines);
        if (u.done || reduce) { u.tl = null; gsap.set(lines, { yPercent: 0, y: 0 }); return; }
        u.tl = gsap.from(lines, { yPercent: 110, ...opts(els[0]), paused: true, onComplete: () => { u.done = true; } });
        if (u.started) u.tl.progress(at).play();
      };
      els.forEach((el) => u.splits.push(SplitText.create(el, { type: "lines", linesClass: "sd-line", mask: "lines", autoSplit: true, onSplit: () => { if (u.splits.length === els.length) build(); } })));
      build();
      u.play = () => { if (u.started || u.done) return; u.started = true; u.tl?.play(); };
      units.push(u);
    };
    groups.forEach((els, g) => make(els, g));
    solo.forEach((el) => make([el], el));
    return units;
  }
  function playRise(units) {
    const vh = innerHeight;
    units.forEach((u) => {
      const r = u.trigger.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) u.play();
      else ScrollTrigger.create({ trigger: u.trigger, start: "clamp(top 90%)", once: true, onEnter: u.play });
    });
  }

  // ── Motion hung per section — cleared whole when paging away
  function mountView(view, firstLoad) {
    const ctx = gsap.context(() => {});
    view.sdCtx = ctx;
    ctx.add(() => {
      view.sdRise = prepRise(view);

      // Hero — on scroll the panel moves down 25% and the photo moves down another 25% while scaling 1.1x. Over the hero, header text is white.
      const hero = view.querySelector("[data-hero]");
      if (hero) {
        body.classList.add("is-light");
        body.classList.remove("is-gradient");
        if (!reduce) {
          gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true,
            onLeave: () => { body.classList.remove("is-light"); body.classList.add("is-gradient"); },
            onEnterBack: () => { body.classList.add("is-light"); body.classList.remove("is-gradient"); } } })
            .fromTo(hero, { yPercent: 0 }, { yPercent: 25, ease: "none" })
            .fromTo(hero.querySelector("[data-hero-media]"), { scale: 1, yPercent: 0 }, { yPercent: 25, scale: 1.1, ease: "none" }, 0);
        }
      } else body.classList.remove("is-light");

      if (!reduce) {
        // Photo parallax — from the cell entering at the bottom of the screen to leaving at the top, -10% → +10%
        view.querySelectorAll("[data-parallax]").forEach((el) => {
          ScrollTrigger.create({ trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true,
            onUpdate: (s) => gsap.set(el, { yPercent: s.progress < 0.5 ? gsap.utils.mapRange(0, 0.5, -10, 0, s.progress) : gsap.utils.mapRange(0.5, 1, 0, 10, s.progress) }) });
        });
        // Full-bleed photo: opens from 10% inside out to the edge, scaling 1.1x → 1, the inner photo goes -20% → 20%
        view.querySelectorAll("[data-full-media]").forEach((el) => {
          gsap.timeline({ scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } })
            .fromTo(el, { clipPath: "inset(10% 10% 10% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" })
            .fromTo(el.querySelector("[data-full-zoom]"), { scale: 1.1 }, { scale: 1, ease: "none" }, 0);
          gsap.fromTo(el.querySelector("[data-full-img]"), { yPercent: -20 }, { yPercent: 20, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
        // Footer — on wide screens it sits pushed up by 1/4 of its height, then settles into place while the end of the body passes below the screen by height/1.3
        const foot = view.querySelector("[data-foot]"), sections = view.querySelector(".sd-sections");
        if (foot && sections) {
          const mm = gsap.matchMedia();
          mm.add("(min-width: 650px)", () => {
            gsap.fromTo(foot, { y: () => -foot.offsetHeight / 4 }, { y: 0, ease: "none", scrollTrigger: { trigger: sections, start: "bottom bottom", end: () => `bottom bottom-=${foot.offsetHeight / 1.3}`, scrub: true, invalidateOnRefresh: true } });
          });
        }
      }
      // Footer links — keep only the hovered one, dim the rest to .5
      const fl = [...view.querySelectorAll(".sd-foot__list a")];
      fl.forEach((a) => {
        a.addEventListener("mouseenter", () => fl.forEach((o) => gsap.to(o, { opacity: o === a ? 1 : 0.5, duration: 0.3, ease: "power1" })));
        a.addEventListener("mouseleave", () => fl.forEach((o) => gsap.to(o, { opacity: 1, duration: 0.3, ease: "power1" })));
      });
      const fn = SD.pages[view.dataset.page];
      if (fn) view.sdPage = fn(view, { firstLoad }) || null;
    });
  }
  function unmountView(view) {
    view.sdPage?.();
    view.sdCtx?.revert();
  }
  // If the page script arrives late (a script added by Taxi after the transition), attach it to the current section as soon as it comes in
  SD.register = (name, fn) => {
    SD.pages[name] = fn;
    const v = SD.view;
    if (v && v.dataset.page === name && !v.sdPage && v.sdCtx) v.sdCtx.add(() => { v.sdPage = fn(v, { firstLoad: false }) || null; });
  };

  // ── Hero entrance — on first open it comes behind the loader, when arriving via transition as the cover lifts
  const parts = (v) => ({
    media: v.querySelector("[data-hero-media]"),
    fades: v.querySelectorAll("[data-fade-in]"),
    fadesP: v.querySelectorAll("[data-fade-project]"),
    lines: v.querySelectorAll("[data-preload-line]"),
  });
  function runLoader(view) {
    const veil = document.querySelector("[data-veil]"), loader = document.querySelector(".sd-loader"), mark = loader.querySelector("svg");
    const p = parts(view);
    // Like the original, pulls down the line inside the header — <header> Has a transition for hiding attached, so the GSAP value trails behind on every frame
    const header = document.querySelector(".sd-head__row");
    if (reduce) { gsap.set([veil, loader], { autoAlpha: 0 }); view.sdRise.forEach((u) => u.play()); return; }
    gsap.set(p.lines, { scaleX: 0 });
    gsap.set(header, { yPercent: -100 });
    const lift = gsap.timeline({ paused: true, onComplete: () => { gsap.set(header, { clearProps: "all" }); loader.style.display = "none"; } })
      .to(loader, { clipPath: "inset(0% 0% 100% 0%)", duration: 2, ease: "expo.inOut" });
    if (p.media) lift.fromTo(p.media, { yPercent: 35, scale: 1.1 }, { yPercent: 0, scale: 1, duration: 2, ease: "expo.inOut" }, 0);
    if (p.fades.length) lift.from(p.fades, { y: 80, autoAlpha: 0, ease: "power3", duration: 2, stagger: 0.1 }, 0);
    if (p.fadesP.length) lift.from(p.fadesP, { y: 80, autoAlpha: 0, ease: "power3", duration: 1, delay: 1, stagger: 0.04, onComplete: () => gsap.set(p.fadesP, { clearProps: "all" }) }, 0);
    if (p.lines.length) lift.to(p.lines, { scaleX: 1, duration: 2, stagger: 0.2, delay: 0.5, ease: "expo.inOut" }, 0);
    lift.to(header, { yPercent: 0, duration: 2.75, ease: "expo.inOut" }, 0);
    gsap.set(mark, { opacity: 1 });
    gsap.timeline()
      .fromTo(mark, { rotationX: -90, rotationY: 0, yPercent: 100 }, { rotationX: 0, yPercent: 0, duration: 1, ease: "power3", transformPerspective: 800 })
      .to(mark, { rotationX: 90, yPercent: -80, duration: 1, ease: "power3", transformPerspective: 800 })
      .add(() => { lift.play(); setTimeout(() => playRise(view.sdRise), 1000); }, 0.5);
    // Like the original, the white transition cover lifts over 1s power1 after the fonts have all loaded (the logo flip and brown cover start earlier, on load)
    document.fonts.ready.then(() => gsap.to(veil, { autoAlpha: 0, duration: 1, ease: "power1" }));
  }
  function enterView(view) {
    const veil = document.querySelector("[data-veil]");
    const p = parts(view);
    body.classList.remove("is-transitioning");
    if (reduce) { gsap.set(veil, { autoAlpha: 0 }); view.sdRise.forEach((u) => u.play()); return; }
    const tl = gsap.timeline();
    tl.add(() => playRise(view.sdRise));
    if (p.media) tl.to(veil, { autoAlpha: 0, ease: "power1", duration: 0.5 });
    else tl.set(veil, { autoAlpha: 0 });
    if (p.media) tl.from(p.media, { scale: 1.1, ease: "power3", duration: 1, delay: 0.025, onComplete: () => gsap.set(p.media, { clearProps: "transform" }) }, 0);
    if (p.lines.length) tl.fromTo(p.lines, { scaleX: 0 }, { scaleX: 1, duration: 1.25, stagger: 0.1, ease: "power3" }, 0);
    if (p.fades.length) tl.from(p.fades, { y: 80, autoAlpha: 0, ease: "power3", duration: 1.25, stagger: 0.1, onComplete: () => gsap.set(p.fades, { clearProps: "all" }) }, 0);
    if (p.fadesP.length) tl.from(p.fadesP, { y: 80, autoAlpha: 0, ease: "power3", duration: 1, stagger: 0.04, onComplete: () => gsap.set(p.fadesP, { clearProps: "all" }) }, 0);
  }

  function setView(view) {
    SD.view = view;
    const page = view.dataset.page;
    headWorks = page === "works";
    markCurrent(page);
    if (!view.querySelector("[data-foot]")) view.querySelector(".sd-app").insertAdjacentHTML("beforeend", footerHTML());
    mountView(view);
    view.querySelectorAll("[data-scroll-top]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); SD.scrollTo(0); }));
  }

  // Anchors — Contact scrolls smoothly to the footer, other section ids to their own section
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href^='#'], [data-scroll-to]");
    if (!a) return;
    const id = (a.getAttribute("href") || "").slice(1) || a.dataset.scrollTo;
    const t = id && document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    SD.closeMenu?.();
    SD.scrollTo(t);
  });

  // ── Page transition — Taxi 1.9.1: a white curtain covers in .5s power3, and once the new page is attached, if there is a header photo, it lifts in .5s power1.
  //    on file:// the next page can’t be fetched, so do the same scrim → navigate → lift away
  const waitStyles = () => Promise.race([
    Promise.all([...document.querySelectorAll('link[rel="stylesheet"]')].filter((l) => !l.sheet).map((l) => new Promise((r) => { l.addEventListener("load", r, { once: true }); l.addEventListener("error", r, { once: true }); }))),
    new Promise((r) => setTimeout(r, 1500)),
  ]);
  // The page script (works.js) is fetched separately after Taxi attaches it — wait until it is loaded so the brick layout doesn’t jump after coming in
  const PAGE_JS = { works: true };
  const waitPage = (page) => !PAGE_JS[page] || SD.pages[page] ? Promise.resolve() : new Promise((r) => {
    const t0 = performance.now();
    const tick = () => (SD.pages[page] || performance.now() - t0 > 1500 ? r() : requestAnimationFrame(tick));
    tick();
  });
  const cover = (done) => {
    const veil = document.querySelector("[data-veil]");
    SD.closeMenu?.();
    // Like the original, the header text turns black on leaving (color .5s) — so the menu stays visible over the white curtain
    body.classList.remove("is-gradient", "is-light");
    gsap.timeline({ onComplete: () => { body.classList.add("is-transitioning"); done(); } })
      .set(veil, { autoAlpha: 1 })
      .fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.5, ease: "power3" });
  };
  function bindTaxi() {
    const T = window.taxi;
    if (!T || !/^https?:$/.test(location.protocol)) return false;
    class Fade extends T.Transition {
      onLeave({ trigger, done }) {
        headLock = false;
        head.classList.remove("is-scrolled");
        headWorks = !!trigger?.getAttribute?.("href")?.includes("works");
        cover(done);
      }
      onEnter({ to, done }) {
        document.querySelectorAll("[data-taxi-view]").forEach((v) => { if (v !== to) { unmountView(v); v.remove(); } });
        SD.scrollTo(0, true);
        scrollTo(0, 0);
        lastY = 0;
        done();
        Promise.all([document.fonts.ready, waitStyles(), waitPage(to.dataset.page)]).then(() => requestAnimationFrame(() => { setView(to); enterView(to); ScrollTrigger.refresh(); }));
      }
    }
    new T.Core({
      links: 'a[href$=".html"]:not([target]):not([href*="/"]):not([data-taxi-ignore])',
      removeOldContent: false,
      allowInterruption: false,
      transitions: { default: Fade },
      reloadJsFilter: (el) => el.dataset.taxiReload !== undefined,
    });
    return true;
  }
  function bindFileNav() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || a.hasAttribute("data-taxi-ignore") || e.metaKey || e.ctrlKey || e.button) return;
      const href = a.getAttribute("href");
      if (!/^[\w-]+\.html(\?[^#]*)?(#.*)?$/.test(href)) return;
      e.preventDefault();
      cover(() => { sessionStorage.setItem("sd-nav", "1"); location.href = href; });
    });
  }

  renderChrome();
  initHead();
  initMenu();
  const first = document.querySelector("[data-taxi-view]");
  setView(first);
  root.classList.remove("is-loading");
  let taxiOn = false;
  try { taxiOn = bindTaxi(); } catch (err) { console.warn("Can’t hail a Taxi, so it falls back to regular travel", err); }
  if (!taxiOn) bindFileNav();
  const arrived = sessionStorage.getItem("sd-nav");
  sessionStorage.removeItem("sd-nav");
  const go = () => {
    if (arrived) { document.querySelector(".sd-loader").style.display = "none"; enterView(first); }
    else runLoader(first);
  };
  // As in the original, start the loader as soon as the window load finishes — fonts are waited for only when lifting the white curtain
  if (document.readyState === "complete") go(); else addEventListener("load", go, { once: true });
  const refresh = (() => { let t; return () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); }; })();
  new ResizeObserver(refresh).observe(document.body);
})();
