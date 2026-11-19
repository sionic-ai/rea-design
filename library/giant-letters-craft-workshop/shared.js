/* Same libraries as the original — page transition Barba.js v1 (Pjax · swaps only .mo-main inside #mo-container), smooth scroll locomotive-scroll 4 (PC only),
   Slider Swiper 6. Motion values are carried over from the original app.js (GSAP 2 TweenMax) into GSAP 3 names.
   - First page first open: the logo is drawn on a white curtain (4.2s loop), once the document has fully loaded the logo slides up 100px after 2.3s with 1s back.inOut(1.7), and 3s later the curtain lifts with .8s power3.out
   - First open of a subpage: no veil, the body turns on with .8s power3.out
   - Transition: old body · footer fade out in .3s sine.out → new body · footer fade in in .8s power3.out (back to top)
   - Entrance: a block entering the band that excludes 20% at the top and bottom of the screen rises from 30px below over .8s back.out(1.7), big English titles go letter by letter from 35px left at .9x over .6s back.out(1.7) in .06s steps
   - Menu: the panel drops from above with rounded corners (20%) in .7s power4.inOut and items come from 60px above after .4s in .6s back.out(4) at .12s stagger */
(() => {
  const html = document.documentElement;
  const body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isPc = () => innerWidth > 1024;
  if (window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
  const header = document.querySelector(".mo-h");
  const footer = document.querySelector(".mo-f");
  const nav = document.getElementById("mo-nav");
  const navBg = nav.querySelector(".mo-nav__bg");
  const menuBtn = document.getElementById("mo-menu");
  const loading = document.getElementById("mo-loading");
  let loco = null;
  let sliders = [];
  let observers = [];

  /* Photo slot — the original switches on in .4s with data-loaded once the picture arrives. The placeholder counts as received as soon as it’s attached */
  const showImages = (root) => root.querySelectorAll(".mo-img__body").forEach((el) => requestAnimationFrame(() => el.classList.add("is-loaded")));

  /* Smooth scroll — desktop only like the original (tablet and phone use default scroll) */
  const startLoco = () => {
    if (loco) { loco.destroy(); loco = null; }
    if (reduce || !window.LocomotiveScroll) return;
    loco = new LocomotiveScroll({ el: document.querySelector("[data-scroll-container]"), smooth: true, tablet: { smooth: false }, smartphone: { smooth: false } });
    html.classList.toggle("is-loco", isPc());
  };
  const scrollTop = () => {
    if (loco && isPc()) loco.scrollTo("top", { duration: 0.1, disableLerp: true });
    else scrollTo(0, 0);
  };

  /* Entrance */
  const animate = (root) => {
    observers.forEach((o) => o.disconnect());
    observers = [];
    const blocks = root.querySelectorAll("[data-block]");
    const titles = root.querySelectorAll("[data-title]");
    if (reduce) { gsap.set([...blocks, ...titles], { autoAlpha: 1 }); titles.forEach((t) => gsap.set(t.querySelectorAll("span"), { autoAlpha: 1 })); return; }
    gsap.set(blocks, { autoAlpha: 0 });
    const ob = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting || en.target.classList.contains("in-view")) return;
      en.target.classList.add("in-view");
      gsap.fromTo(en.target, { y: 30 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "back.out(1.7)" });
    }), { rootMargin: "-20% 0px", threshold: 0 });
    blocks.forEach((b) => ob.observe(b));
    titles.forEach((t) => {
      if (!t.querySelector("span")) t.innerHTML = [...t.textContent].map((c) => `<span>${c === " " ? "&nbsp;" : c}</span>`).join("");
      gsap.set(t, { autoAlpha: 1 });
      gsap.set(t.querySelectorAll("span"), { autoAlpha: 0 });
    });
    const ot = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting || en.target.classList.contains("in-view")) return;
      en.target.classList.add("in-view");
      gsap.fromTo(en.target.querySelectorAll("span"), { x: -35, scale: 0.9 }, { x: 0, autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.06 });
    }), { rootMargin: "20px 0px", threshold: 0 });
    titles.forEach((t) => ot.observe(t));
    observers.push(ob, ot);
  };
  /* Subpage header — original TimelineMax (delay .2): in About, the vertical title letters turn white in sequence at .1s, elsewhere the letters pop in from the left. Then the copy follows in from 30px to the left */
  const underIntro = (root) => {
    const title = root.querySelector(".mo-undertitle");
    const txts = root.querySelectorAll(".mo-undertxt");
    if (!title && !txts.length) return;
    if (reduce) { gsap.set(txts, { autoAlpha: 1 }); return; }
    const tl = gsap.timeline({ delay: 0.2 });
    const spans = title ? title.querySelectorAll("span") : [];
    if (root.querySelector(".mo-about")) {
      tl.to(spans, { color: getComputedStyle(html).getPropertyValue("--kf-surface").trim(), duration: 0.8, ease: "power3.out", stagger: 0.1 });
      if (txts.length) tl.fromTo(txts, { x: -30 }, { x: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 }, "-=.8");
    } else {
      if (spans.length) tl.fromTo(spans, { x: -35, scale: 0.9, autoAlpha: 0 }, { x: 0, autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", stagger: 0.06 });
      if (txts.length) tl.fromTo(txts, { x: -30 }, { x: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 }, spans.length ? "-=.5" : 0);
    }
  };

  /* Slider */
  const startSliders = (root) => {
    sliders.forEach((s) => s.destroy && s.destroy(true, true));
    sliders = [];
    if (!window.Swiper) return;
    const auto = (ms) => (reduce ? false : { delay: ms, disableOnInteraction: false });
    if (root.querySelector("#mo-mvslider")) sliders.push(new Swiper("#mo-mvslider", { slidesPerView: "auto", speed: 600, loop: true, centeredSlides: true, pagination: { el: "#mo-mvslider-pg", clickable: true }, navigation: { nextEl: "#mo-mvslider-next", prevEl: "#mo-mvslider-prev" }, autoplay: auto(5000) }));
    if (root.querySelector("#mo-photoslider")) sliders.push(new Swiper("#mo-photoslider", { effect: "fade", simulateTouch: false, speed: 800, loop: true, pagination: { el: "#mo-photoslider-pg", clickable: true }, autoplay: auto(6000) }));
    if (root.querySelector("#mo-itemslider")) sliders.push(new Swiper("#mo-itemslider", {
      slidesPerView: "auto", speed: 600, freeMode: true, navigation: { nextEl: "#mo-itemslider-next", prevEl: "#mo-itemslider-prev" },
      pagination: { el: "#mo-itemslider-pg", type: "fraction", renderFraction: (c, t) => `<p class="${c}"></p><div class="line"></div><p class="${t}"></p>` },
    }));
    /* About section feature cards are a slider on phones only, as in the original (.4s) */
    if (root.querySelector("#mo-featureslider") && !isPc() && innerWidth <= 768) sliders.push(new Swiper("#mo-featureslider", { speed: 400, spaceBetween: `${(48.5 / 1264) * 100}%`, slidesPerView: 1 }));
  };

  /* About video — plays once it enters the screen (10px inside top and bottom) */
  const startVideo = (root) => {
    const v = root.querySelector("#mo-video");
    if (!v) return;
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting && !v.classList.contains("is-inview")) { v.play().catch(() => {}); v.classList.add("is-inview"); } }, { rootMargin: "-10px 0px", threshold: 0 });
    io.observe(v);
    observers.push(io);
  };

  /* Menu */
  let navScroll = 0;
  const menuOpen = () => html.classList.contains("is-menuopen");
  /* Original order — write down the current scroll position and go to the top, put is-menuopen on html · wrapper (logo · buttons white, body · Footer pinned in place),
     If the header is off screen, turn it back on in .7s, then bring up the panel and items. On close, the panel lifts away after .5s, then releases after 700ms and returns to place */
  const scrollEl = document.getElementById("mo-scroll");
  const container = document.getElementById("mo-container");
  const curY = () => (loco && isPc() && loco.scroll && loco.scroll.instance ? loco.scroll.instance.scroll.y : scrollY);
  const headerHidden = () => (loco && isPc() ? !header.hasAttribute("data-scroll-section-inview") : navScroll > 0);
  const openMenu = () => {
    navScroll = curY();
    gsap.to(window, { scrollTo: { y: 0, autoKill: false }, duration: 0.01 });
    html.classList.add("is-menuopen", "is-menubtnopen");
    scrollEl.classList.add("is-menuopen");
    /* Original turns on locomotive’s scrollbar at this point (has-scroll-scrolling) — turned off on close */
    if (loco && isPc()) html.classList.add("has-scroll-scrolling");
    menuBtn.setAttribute("aria-expanded", "true");
    nav.setAttribute("aria-hidden", "false");
    if (headerHidden() && !reduce) gsap.fromTo(header, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: "power4.inOut" });
    container.style.top = `${-navScroll}px`;
    footer.style.top = `${container.offsetHeight - navScroll}px`;
    if (reduce) { gsap.set(nav, { autoAlpha: 1 }); gsap.set(navBg, { y: "0%" }); gsap.set(nav.querySelectorAll("[data-nav]"), { autoAlpha: 1, y: 0 }); header.classList.add("is-menuopen"); return; }
    gsap.set(nav, { autoAlpha: 1 });
    gsap.fromTo(navBg, { y: "-100%", borderRadius: "20%" }, { y: "0%", borderRadius: "0%", duration: 0.7, ease: "power4.inOut" });
    if (isPc()) {
      gsap.to(nav.querySelectorAll('[data-nav="other"]'), { autoAlpha: 1, duration: 0.6, ease: "sine.out", delay: 0.7 });
      gsap.fromTo(nav.querySelectorAll('[data-nav="item"]'), { autoAlpha: 0, y: -60 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(4)", delay: 0.4, stagger: 0.12 });
    } else {
      gsap.fromTo(nav.querySelectorAll('[data-nav="sp"]'), { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "back.out(4)", delay: 0.4, stagger: 0.1 });
    }
    setTimeout(() => header.classList.add("is-menuopen"), 700);
  };
  const release = () => {
    html.classList.remove("is-menuopen", "has-scroll-scrolling");
    scrollEl.classList.remove("is-menuopen");
    header.classList.remove("is-menuopen", "is-fixed");
    container.style.top = "";
    footer.style.top = "";
    if (loco && isPc()) { loco.update(); loco.scrollTo(navScroll, { duration: 0.01, disableLerp: true }); }
    else scrollTo(0, navScroll);
  };
  const closeMenu = () => {
    menuBtn.setAttribute("aria-expanded", "false");
    nav.setAttribute("aria-hidden", "true");
    if (reduce) { gsap.set(nav, { autoAlpha: 0 }); release(); html.classList.remove("is-menubtnopen"); return; }
    gsap.to(navBg, { y: "-100%", duration: 0.7, ease: "power4.out", delay: 0.5, onComplete: () => gsap.set(nav, { autoAlpha: 0 }) });
    header.classList.add("is-fixed");
    if (headerHidden()) gsap.to(header, { autoAlpha: 0, duration: 0.7, ease: "power4.out", delay: 0.5 });
    if (isPc()) {
      gsap.to(nav.querySelectorAll('[data-nav="other"]'), { autoAlpha: 0, duration: 0.6, ease: "sine.out" });
      gsap.to(nav.querySelectorAll('[data-nav="item"]'), { autoAlpha: 0, y: -40, duration: 0.8, ease: "back.inOut(6)" });
    } else {
      gsap.to(nav.querySelectorAll('[data-nav="sp"]'), { autoAlpha: 0, y: -20, duration: 0.8, ease: "back.inOut(6)" });
    }
    setTimeout(() => { release(); gsap.set(header, { autoAlpha: 1 }); }, 700);
    setTimeout(() => html.classList.remove("is-menubtnopen"), 1100);
  };
  menuBtn.addEventListener("click", () => (menuOpen() ? closeMenu() : openMenu()));

  /* Move within the same section — original .6s power4.inOut */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const t = url.hash === "#" ? null : document.querySelector(url.hash);
    e.preventDefault();
    if (menuOpen()) closeMenu();
    if (loco && isPc()) loco.scrollTo(t || "top", { duration: 600, easing: [0.77, 0, 0.175, 1] });
    else gsap.to(window, { scrollTo: t ? t.getBoundingClientRect().top + scrollY : 0, duration: reduce ? 0 : 0.6, ease: "power4.inOut" });
  });

  /* Set up one page (first open, after turning) */
  const setupPage = (root) => {
    showImages(root);
    startSliders(root);
    animate(root);
    startVideo(root);
    underIntro(root);
  };

  /* First open */
  const main = () => document.querySelector(".mo-main");
  const first = () => {
    const isTop = !!main().querySelector(".mo-top");
    startLoco();
    setupPage(main());
    body.dataset.loaded = "true";
    if (isTop && !reduce) {
      const logo = loading.querySelector(".mo-loading__body");
      loading.classList.add("is-draw");
      gsap.to(logo, { autoAlpha: 0, y: -100, duration: 1, ease: "back.inOut(1.7)", delay: 2.3 });
      gsap.to(loading, { autoAlpha: 0, duration: 0.8, ease: "power3.out", delay: 3, onComplete: () => loading.classList.remove("is-load", "is-draw") });
    }
    /* The original hides #l-wrapper (header · body · footer · menu button) and turns it on right under the curtain on the first page, and in .8s power3.out on subpages */
    const wrap = [document.getElementById("mo-scroll"), menuBtn];
    html.classList.add("mo-ready");
    if (isTop || reduce) gsap.set(wrap, { autoAlpha: 1 });
    else gsap.fromTo(wrap, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power3.out" });
  };
  /* The original loads a 1MB bundle and builds the scroll stage (before images finish downloading), then starts the sequence — this copy starts after the font has loaded. Meanwhile the first page is covered by a white curtain */
  if (main().querySelector(".mo-top") && !reduce) loading.classList.add("is-load");
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 3000))]).then(first);

  /* Barba v1 — old body · footer fade out in .3s (if the menu is open, wait .6s while it closes) → new body fades in in .8s */
  if (window.Barba) {
    Barba.Pjax.Dom.wrapperId = "mo-container";
    Barba.Pjax.Dom.containerClass = "mo-main";
    Barba.Pjax.ignoreClassLink = "js-nopjax";
    Barba.Pjax.originalPreventCheck = Barba.Pjax.preventCheck;
    Barba.Pjax.preventCheck = (evt, el) => {
      if (!el || !el.getAttribute("href")) return false;
      const url = new URL(el.href, location.href);
      if (url.hash && url.pathname === location.pathname) return false;
      if (location.protocol === "file:") return false;
      return Barba.Pjax.originalPreventCheck(evt, el);
    };
    const Fade = Barba.BaseTransition.extend({
      start() { this.newContainerLoading.then(this.change.bind(this)); },
      change() {
        let wait = 0;
        if (menuOpen()) { closeMenu(); wait = 0.6; }
        const oldC = this.oldContainer, newC = this.newContainer;
        gsap.set(newC, { autoAlpha: 0 });
        gsap.to(footer, { autoAlpha: 0, duration: reduce ? 0 : 0.3, ease: "sine.out", delay: wait });
        gsap.to(oldC, { autoAlpha: 0, duration: reduce ? 0 : 0.3, ease: "sine.out", delay: wait, onComplete: () => this.done() });
      },
    });
    Barba.Pjax.getTransition = () => Fade;
    Barba.Dispatcher.on("transitionCompleted", () => {
      const m = main();
      startLoco();
      scrollTop();
      setupPage(m);
      gsap.fromTo([m, footer], { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.8, ease: "power3.out" });
      document.documentElement.dataset.page = m.dataset.namespace || "";
    });
    Barba.Prefetch.init();
    Barba.Pjax.start();
  }
  addEventListener("resize", () => { if (loco) loco.update(); });
  addEventListener("load", () => { if (loco) loco.update(); });
})();
