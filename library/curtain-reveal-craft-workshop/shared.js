// Shared kit for the whole site — header bar, menu panel, loader, transition curtain, cursor and Footer are used by every page together.
// Original swaps only the contents of #swup with swup, transitioning with a curtain that spreads across the full screen from the header bar position and returns.
(() => {
  const AM = (window.AM = window.AM || { pages: {} });
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrollToPlugin);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => innerWidth <= 899;
  const LINKS = [
    { href: "index.html", page: "home", label: "Home Page" },
    { href: "process.html", page: "process", label: "Our Process" },
    { href: "about.html", page: "about", label: "About" },
    { href: "about.html#team", page: "team", label: "Team" },
    { href: "works.html", page: "works", label: "Works" },
    { href: "index.html#contact", page: "contact", label: "Contact" },
  ];
  const TITLES = { home: "Home Page", process: "Our Process", about: "About", works: "Works" };
  const MARK = "Studio Name";
  const markHTML = () => [...MARK].map((c) => `<span>${c}</span>`).join("");
  const arrow = '<svg viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 12 12 1M4 1h8v8"/></svg>';
  const ret = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 1v9h12M10 6l4 4-4 4"/></svg>';
  AM.btn = (label, href) => `<a class="am-btn" href="${href || "#"}"><span class="am-btn__in"><span class="am-btn__label"><span>${label}</span></span><span class="am-btn__icon" aria-hidden="true">${arrow}</span></span></a>`;
  AM.ret = ret;
  // Turn skin variables (including color-mix·oklch) into real RGB — used to measure brightness and pick the text color
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  AM.rgb = (expr, host = document.body) => {
    const p = document.createElement("i");
    p.style.cssText = `position:absolute;visibility:hidden;color:${expr}`;
    host.append(p);
    const c = getComputedStyle(p).color;
    p.remove();
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = c;
    px.fillRect(0, 0, 1, 1);
    return [...px.getImageData(0, 0, 1, 1).data].slice(0, 3);
  };

  const page = () => document.querySelector("main")?.dataset.page || "home";

  /* ── Shared panel building ─────────────────────────── */
  const build = () => {
    const cur = page();
    const items = LINKS.map((l) => `<div class="am-menu__item"${l.page === cur ? ' aria-current="page"' : ""}><a href="${l.href}" data-fx="char-roll" data-fx-char-roll="stagger: 0.015; dur: 0.8; ease: 0.215,0.61,0.355,1; gap: 0.1em; look: serif"${l.page === cur ? ' aria-current="page"' : ""}>${l.label}</a></div>`).join("");
    const head = document.querySelector('[data-slot="header"]');
    head.className = "am-head is-on";
    head.innerHTML = `
      <div class="am-head__bg"></div>
      <div class="am-head__left"><a class="am-logo" href="index.html" aria-label="First Page" data-label="Your brand name in English with subtitle"><span>Studio Name</span><span>Design Atelier</span></a></div>
      <div class="am-head__center">
        <div class="am-bar">
          <button class="am-bar__wrap" type="button" data-menu-toggle aria-expanded="false" aria-label="Open Menu">
            <span class="am-bar__progress"><span></span></span>
            <span class="am-bar__left">Menu</span>
            <span class="am-bar__center"><span class="am-bar__title" data-current-title>${TITLES[cur] || ""}</span></span>
            <span class="am-bar__right"><span class="am-burger"><i class="t"><b></b></i><i class="b"><b></b></i></span></span>
          </button>
          <nav class="am-menu" data-slot="menu-panel" aria-label="Site Menu">
            <canvas data-fx="fade-line-trail" data-fx-fade-line-trail="look: dark"></canvas>
            <div class="am-menu__inner">${items}</div>
            <div class="am-menu__bottom">
              <div><a href="#">Social Account 1</a><a href="#">Social Account 2</a></div>
              <div><span class="is-current">Korean</span><a href="#">Other language</a></div>
            </div>
          </nav>
        </div>
      </div>`;
    const before = (html) => document.body.insertAdjacentHTML("afterbegin", html);
    before(`<div class="am-menu-dim" data-menu-close><span></span></div>`);
    before(`<div class="am-curtain" aria-hidden="true"><div class="am-curtain__wrap"><div class="am-mark" data-label="Your brand English wordmark here">${markHTML()}</div></div></div>`);
    before(`<div class="am-grain" aria-hidden="true"><svg><filter id="am-noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0"/></filter><rect width="100%" height="100%" filter="url(#am-noise)"/></svg></div>`);
    const ctas = ["About", "People", "Work process", "Collaboration brand", "Inquiry"].map((t, i) => `<div data-cta="${i}">${AM.btn(t)}</div>`).join("");
    document.body.insertAdjacentHTML("beforeend", `<div class="am-cursor" aria-hidden="true"><div class="am-cursor__cta">${ctas}</div></div>`);
    if (!sessionStorage.getItem("am-curtain")) before(`<div class="am-loader" data-slot="loader" aria-hidden="true"><div class="am-loader__wrap"><div class="am-mark" data-label="Your brand English wordmark here">${markHTML()}</div></div></div>`);

    const foot = document.querySelector('[data-slot="footer"]');
    foot.className = "am-foot";
    const col = (t, list) => `<div class="am-sitemap__col"><p>${t}</p><div class="am-sitemap__list">${list}</div></div>`;
    const svgSoc = '<svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10Zm0 1.8a3.2 3.2 0 1 1 0 6.4a3.2 3.2 0 1 1 0-6.4ZM7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 1.8A3.2 3.2 0 0 0 3.8 7v10A3.2 3.2 0 0 0 7 20.2h10a3.2 3.2 0 0 0 3.2-3.2V7A3.2 3.2 0 0 0 17 3.8Z"/></svg>';
    foot.innerHTML = `
      <canvas data-fx="fade-line-trail" data-fx-fade-line-trail="look: deep"></canvas>
      <div class="am-foot__wrap">
        <div class="am-foot__top"><button class="am-totop" type="button" data-totop><span data-fx="char-roll" data-fx-char-roll="stagger: 0.015; dur: 0.8; ease: 0.215,0.61,0.355,1; gap: 0.1em; look: serif">Back to top</span></button></div>
        <div class="am-foot__center">
          <div class="am-sitemap">
            ${col("Contact info", `<a href="#">hello@example.com</a><span>Your one-line address here</span><span>Your postal code and city here</span><span>Phone 00 0000 0000</span><span>Fax 00 0000 0000</span><span>Business number 0000000000</span>`)}
            ${col("Sitemap", LINKS.map((l) => `<a href="${l.href}"${l.page === cur ? ' aria-current="page"' : ""}>${l.label}</a>`).join(""))}
            ${col("Terms", `<a href="#">Privacy policy</a>`)}
            ${col("Social", `<div class="am-socials"><a href="#" aria-label="Social Account 1">${svgSoc}</a><a href="#" aria-label="Social Account 2">${svgSoc}</a><a href="#" aria-label="Social Account 3">${svgSoc}</a></div>`)}
            ${col("Language", `<span aria-current="true">Korean</span><a href="#">Other language</a>`)}
          </div>
        </div>
        <div class="am-foot__bottom">
          <div class="am-foot__img"><div class="am-ph wf-img" data-label="Workshop bookshelf · dimly lit shoe-last shelves · landscape strip 3:1"></div></div>
          <div class="am-foot__mark"><div class="am-mark" data-label="Your brand English wordmark here">${markHTML()}</div></div>
        </div>
      </div>`;
  };

  /* ── Smooth scroll ───────────────────────── */
  let lenis = null;
  const bootLenis = () => {
    if (reduced || !window.Lenis) return;
    lenis = new Lenis({ duration: 1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 2 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    AM.lenis = lenis;
  };

  /* ── Text splitting and rise-in (original Homepage · PageAbout revealTexts as is) ── */
  AM.split = (root, defType = "lines, words") => {
    const made = [];
    root.querySelectorAll("[data-split]").forEach((el) => {
      if (el._am) return;
      el._am = new SplitText(el, { type: el.dataset.split || defType, linesClass: "split-line", wordsClass: "split-word", charsClass: "split-char" });
      made.push(el._am);
    });
    return made;
  };
  AM.reveal = (root) => {
    root.querySelectorAll(".trigger-line").forEach((tr) => {
      const start = tr.dataset.triggerStart || "65";
      ScrollTrigger.create({
        trigger: tr, start: `top ${start}%`, end: "bottom bottom", once: true,
        onEnter: () => {
          tr.querySelectorAll(".split-line").forEach((line) => {
            const chars = line.querySelectorAll(".split-char");
            const words = line.querySelectorAll(".split-word");
            if (chars.length) gsap.to(chars, { y: "0%", duration: tr.dataset.charDur ? +tr.dataset.charDur : 1.2, ease: "power2.out", stagger: 0.025 });
            else if (words.length) gsap.to(words, { y: "0%", duration: 1.2, ease: "power2.out", stagger: 0.025 });
          });
          const borders = tr.querySelectorAll(".am-border span");
          if (borders.length) gsap.to(borders, { width: "100%", duration: 1.2, ease: "power2.inOut" });
        },
      });
    });
    root.querySelectorAll(".am-custom-reveal").forEach((c) => {
      const rows = c.querySelectorAll(".am-js-row > *");
      if (rows.length) gsap.to(rows, { y: "0%", duration: 1.2, ease: "power2.out", stagger: 0.05, scrollTrigger: { trigger: c, start: `top ${c.dataset.triggerStart || 65}%`, end: "bottom bottom" } });
    });
    root.querySelectorAll(".am-reveal-cta").forEach((cta) => {
      gsap.to(cta, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: cta, start: "top 65%", end: "bottom bottom" } });
    });
    root.querySelectorAll("[data-grow-height]").forEach((box) => {
      const h = box.querySelector("[data-grow]");
      if (h) gsap.to(h, { height: "100%", ease: "power2.out", duration: 1.2, scrollTrigger: { trigger: box, start: `top ${box.dataset.triggerStart || 50}%`, end: "bottom bottom" } });
    });
  };

  /* ── Header — hides on scroll down and returns on scroll up (90px), on phones gets a black strip past 180px ── */
  let head, title, titleSplit, lastY = 0;
  const bootHead = () => {
    head = document.querySelector(".am-head");
    title = head.querySelector("[data-current-title]");
    titleSplit = new SplitText(title, { type: "lines, chars", linesClass: "split-line", charsClass: "split-char" });
    const bg = head.querySelector(".am-head__bg");
    let dir = 1;
    const show = () => {
      if (dir > 0 && scrollY > 90) head.classList.remove("is-on");
      else if (!head.classList.contains("is-locked")) head.classList.add("is-on");
      gsap.to(bg, { y: scrollY > 180 ? "0%" : "-101%", duration: 0.4 });
    };
    addEventListener("scroll", () => { const y = scrollY; dir = y > lastY ? 1 : -1; lastY = Math.max(0, y); show(); }, { passive: true });
    show();
  };

  /* ── Menu panel — 1s power2.inOut clip, the two hamburger lines gather to half height then rotate ±45° ── */
  let menuOpen = false, menuBusy = false;
  const D = 1;
  const burger = (open) => {
    const t = head.querySelector(".am-burger .t b"), b = head.querySelector(".am-burger .b b");
    const h = head.querySelector(".am-burger").getBoundingClientRect().height;
    if (open) {
      gsap.to(t, { duration: D / 2, y: h / 2, onComplete: () => gsap.to(t, { duration: D / 2, rotate: -45 }) });
      gsap.to(b, { duration: D / 2, y: -h / 2, onComplete: () => gsap.to(b, { duration: D / 2, rotate: 45 }) });
    } else {
      gsap.to([t, b], { duration: D / 2, rotate: 0, onComplete: () => gsap.to([t, b], { duration: D / 2, y: 0 }) });
    }
  };
  const dim = () => {
    gsap.set(".am-menu-dim", { y: 0 });
    gsap.to(".am-menu-dim span", { duration: D / 2, autoAlpha: menuOpen ? 1 : 0, onComplete: () => gsap.set(".am-menu-dim", { y: menuOpen ? 0 : "-100%" }) });
  };
  AM.openMenu = () => {
    menuOpen = true;
    lenis?.stop();
    document.body.classList.add("is-menu-open");
    head.querySelector("[data-menu-toggle]").setAttribute("aria-expanded", "true");
    dim(); burger(true);
    gsap.to(".am-menu", { duration: D, ease: "power2.inOut", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", onComplete: () => (menuBusy = false) });
  };
  AM.closeMenu = () => new Promise((res) => {
    menuOpen = false;
    burger(false); dim();
    lenis?.start();
    document.body.classList.remove("is-menu-open");
    head.querySelector("[data-menu-toggle]").setAttribute("aria-expanded", "false");
    gsap.to(".am-menu", { duration: D, ease: "power2.inOut", clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)", onComplete: () => { menuBusy = false; res(); } });
  });
  const bootMenu = () => {
    head.querySelector("[data-menu-toggle]").addEventListener("click", () => {
      if (menuBusy) return;
      menuBusy = true;
      menuOpen ? AM.closeMenu() : AM.openMenu();
    });
    document.querySelector("[data-menu-close]").addEventListener("click", () => { if (menuBusy || !menuOpen) return; menuBusy = true; AM.closeMenu(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen && !menuBusy) { menuBusy = true; AM.closeMenu(); } });
  };

  /* ── Loader: after 2s the wordmark letters rise in .7s (.05 stagger), and once all stand the curtain folds up in 1s ── */
  const bootLoader = () => {
    const ld = document.querySelector(".am-loader");
    if (!ld) return;
    if (reduced) { ld.remove(); return; }
    const chars = ld.querySelectorAll(".am-mark > span");
    // The original logo has 15 pieces, so the curtain is 15 × .05 + .7 = Folds back after 1.45s — keeps that tempo even if the character count differs
    const wait = 15 * 0.05 + 0.7;
    setTimeout(() => {
      gsap.to(chars, { y: 0, duration: 0.7, stagger: 0.05, ease: "power2.out" });
      gsap.to(ld, { duration: 1, clipPath: "inset(0% 0% 100% 0%)", delay: wait, ease: "power2.inOut", onComplete: () => ld.remove() });
      gsap.to(ld.querySelector(".am-loader__wrap"), { duration: 1, y: -500, delay: wait, ease: "power2.inOut" });
    }, 2000);
  };

  /* Page-transition curtain — grows from the header bar box to full screen (1.2s), rests 1s on the new section and drops the text, then after 1s shrinks back to the bar (.8s) */
  let clip = null;
  const curtain = () => document.querySelector(".am-curtain");
  const sizeCurtain = () => {
    const r = head.querySelector(".am-bar").getBoundingClientRect();
    clip = mobile() ? { t: "0px", r: "0px", b: innerHeight + "px", l: "0px" } : { t: r.top + "px", r: r.left + 0.1 + "px", b: innerHeight - r.y - r.height + "px", l: r.left + "px" };
    gsap.set(curtain(), { clipPath: `inset(${clip.t} ${clip.r} ${clip.b} ${clip.l})` });
  };
  const showCurtain = () => new Promise((res) => {
    sizeCurtain();
    const c = curtain();
    gsap.set(c, { y: "0%" });
    gsap.to(c.querySelectorAll(".am-mark > span"), { y: 0, duration: 0.7, stagger: 0.05, ease: "power2.out" });
    gsap.to(c, { duration: 1.2, clipPath: "inset(0px 0px 0px 0px)", onComplete: res });
  });
  const hideCurtain = () => new Promise((res) => {
    const c = curtain();
    gsap.to(c.querySelectorAll(".am-mark > span"), { y: "100%", duration: 0.7, stagger: 0.05, ease: "power2.out" });
    setTimeout(() => {
      gsap.to(c, { duration: 0.8, clipPath: `inset(${clip.t} ${clip.r} ${clip.b} ${clip.l})`, onComplete: () => { gsap.set(c, { y: "-100%" }); res(); } });
    }, 1000);
  });
  const titleOut = () => gsap.to(titleSplit.chars, { y: "-120%", duration: 0.8, ease: "power2.inOut", stagger: { each: 0.025 } });
  const titleSwap = (t) => {
    titleSplit.revert();
    title.textContent = t;
    titleSplit = new SplitText(title, { type: "lines, chars", linesClass: "split-line", charsClass: "split-char" });
    gsap.set(titleSplit.chars, { y: "-120%" });
  };
  const titleIn = () => gsap.to(titleSplit.chars, { y: "0%", duration: 0.8, ease: "power2.out", stagger: { each: 0.025 } });
  const setCurrent = (cur) => {
    document.querySelectorAll(".am-menu__item").forEach((it, i) => {
      const on = LINKS[i].page === cur;
      it.toggleAttribute("aria-current", on);
      const a = it.querySelector("a");
      on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
    document.querySelectorAll(".am-sitemap__list a[href]").forEach((a, i) => {
      if (!LINKS[i]) return;
      LINKS[i].page === cur ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });
  };
  const leave = async () => {
    titleOut();
    if (menuOpen) { menuBusy = true; await AM.closeMenu(); }
    await showCurtain();
  };
  const arrive = (cur) => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    scrollTo(0, 0);
    titleSwap(TITLES[cur] || "");
    setCurrent(cur);
    setTimeout(() => { hideCurtain(); titleIn(); }, 1000);
  };

  /* ── Cursor — always follows the cursor by .12, and over data-cursor cells the destination button turns on ── */
  const bootCursor = () => {
    const cur = document.querySelector(".am-cursor");
    if (!cur || !matchMedia("(hover: hover)").matches) return;
    const mouse = { x: -100, y: -100 }, pos = { x: 0, y: 0 };
    addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    const loop = () => {
      pos.x += Math.round(mouse.x - pos.x) * 0.12;
      pos.y += Math.round(mouse.y - pos.y) * 0.12;
      cur.style.transform = `translate3d(${pos.x}px ,${pos.y}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    AM.bindCursor = (root) => {
      root.querySelectorAll("[data-cursor]").forEach((el) => {
        const cta = cur.querySelector(`[data-cta="${el.dataset.cursor}"]`);
        if (!cta) return;
        el.addEventListener("mouseenter", () => cta.classList.add("is-on"));
        el.addEventListener("mouseleave", () => cta.classList.remove("is-on"));
      });
    };
    AM.resetCursor = () => cur.querySelectorAll(".is-on").forEach((c) => c.classList.remove("is-on"));
  };

  /* ── Back to top — 1.2s easeInOutQuad ── */
  const bootFoot = () => {
    document.querySelector("[data-totop]").addEventListener("click", (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0, { duration: 1.2, easing: (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2) });
      else scrollTo({ top: 0, behavior: "smooth" });
    });
    const mark = document.querySelectorAll(".am-foot__mark .am-mark > span");
    gsap.to(mark, { y: 0, duration: 0.8, stagger: 0.05, ease: "power2.out", scrollTrigger: { trigger: ".am-foot__mark", start: "top bottom" } });
  };

  /* ── Mounting and unmounting pages — the original attaches the section script 500ms after insertion ── */
  let scope = null;
  const mount = () => {
    const main = document.querySelector("main");
    scope = { off: [] };
    scope.ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      scope.mm = mm;
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        AM.split(main);
        AM.reveal(main);
        AM.bindCursor?.(main);
        const fn = AM.pages[main.dataset.page];
        const off = fn && fn(main, { mobile: mobile() });
        if (typeof off === "function") scope.off.push(off);
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        main.querySelectorAll("[data-grow]").forEach((g) => (g.style.height = "100%"));
      });
    });
    ScrollTrigger.refresh();
  };
  const unmount = () => {
    if (!scope) return;
    scope.off.forEach((f) => f());
    scope.mm?.revert();
    scope.ctx.revert();
    scope = null;
    AM.resetCursor?.();
  };

  /* ── Transition — over http it uses swup(4.8.2), opened as a file it covers with a curtain, swaps the document, and lifts the curtain on the new one ── */
  const bootNav = () => {
    const internal = (a) => a && a.getAttribute("href") && !a.target && !/^(https?:|mailto:|tel:|#)/.test(a.getAttribute("href")) && /\.html(#.*)?$/.test(a.getAttribute("href"));
    if (/^https?:$/.test(location.protocol) && window.Swup && window.SwupJsPlugin && !reduced) {
      const swup = new Swup({
        containers: ["main"],
        animateHistoryBrowsing: true,
        linkSelector: "a[href$='.html'], a[href*='.html#']",
        plugins: [
          new SwupJsPlugin({ animations: [{ from: "(.*)", to: "(.*)", out: (done) => { leave().then(done); }, in: (done) => { done(); } }] }),
          new SwupPreloadPlugin(),
          new SwupBodyClassPlugin(),
        ],
      });
      swup.hooks.on("content:replace", () => {
        unmount();
        const cur = page();
        arrive(cur);
        setTimeout(mount, 500);
      });
      swup.hooks.replace("content:scroll", () => {});
      AM.swup = swup;
      return;
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!internal(a) || e.metaKey || e.ctrlKey || e.shiftKey || reduced) return;
      const to = new URL(a.href, location.href);
      if (to.pathname === location.pathname && !to.hash) { e.preventDefault(); return; }
      e.preventDefault();
      leave().then(() => { sessionStorage.setItem("am-curtain", "1"); location.href = a.href; });
    });
  };
  const arriveFromFile = () => {
    if (!sessionStorage.getItem("am-curtain")) return false;
    sessionStorage.removeItem("am-curtain");
    sizeCurtain();
    const c = curtain();
    gsap.set(c, { y: "0%", clipPath: "inset(0px 0px 0px 0px)" });
    gsap.set(c.querySelectorAll(".am-mark > span"), { y: 0 });
    gsap.set(titleSplit.chars, { y: "-120%" });
    setTimeout(() => { hideCurtain(); titleIn(); }, 1000);
    return true;
  };

  const boot = () => {
    build();
    bootLenis();
    bootHead();
    bootMenu();
    bootCursor();
    bootFoot();
    bootNav();
    if (!arriveFromFile()) bootLoader();
    addEventListener("resize", () => sizeCurtain());
    setTimeout(mount, 500);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
