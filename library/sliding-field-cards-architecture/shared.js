// Shared by all pages: Lenis · swup transition · loader · header menu · blurred circle cursor · title appear · footer reveal and photo push.
// Page script is LP.page("<ns>", (main) => detach) only registers it, it is called here when a document opens and when entering via swup.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const LP = (window.LP = window.LP || {});
  LP.inits = LP.inits || {};
  LP.page = (ns, fn) => { LP.inits[ns] = fn; if (LP.ready && LP.ns === ns && LP.pageOff === undefined) LP.pageOff = fn(LP.main) || null; };
  const reduce = (LP.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches);
  const fine = matchMedia("(min-width: 992px) and (pointer: fine)").matches;

  const lenis = (LP.lenis = new Lenis({ autoRaf: false }));
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ───────── Header menu — as in the original the button turns to a white background in .3s, and in the line SVG the second line goes −45°, the group 45°, the first line’s d shortens and the third line darkens (.5s).
  // The panel stands immediately and inner items rise from 1.1s later, blur 5px · 10px below, .5s each, all in sequence within .5s total (measured). Closing reverses 1.5x faster
  const head = document.querySelector(".lp-head");
  const mbtn = head && head.querySelector(".lp-menu-btn");
  let mtl;
  if (head) {
    const drop = head.querySelector(".lp-drop");
    const items = drop.querySelectorAll(".lp-drop__focus li, .lp-drop__sub li, .lp-drop__social, .lp-office h2, .lp-office");
    mtl = gsap.timeline({ paused: true, onReverseComplete: () => head.classList.remove("is-open") })
      .to(head.querySelector(".lp-ml2"), { y: 4, rotate: -45, duration: 0.5 }, 0)
      .to(head.querySelector(".lp-mlg"), { y: -4, rotate: 45, duration: 0.5 }, 0)
      .to(head.querySelector(".lp-ml1"), { attr: { d: "M4 11 H11" }, duration: 0.5 }, 0)
      .to(head.querySelector(".lp-ml3"), { attr: { d: "M18 15 H25" }, opacity: 1, duration: 0.5 }, 0)
      .fromTo(items, { opacity: 0, y: 10, filter: "blur(5px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, stagger: { amount: 0.5 }, immediateRender: false }, 1.1)
      .to(drop.querySelector(".lp-drop__line"), { opacity: 0.3, duration: 0.3 }, 1.1);
  }
  const setMenu = (on) => {
    mbtn.setAttribute("aria-expanded", on);
    if (on) { head.classList.add("is-open"); reduce ? mtl.progress(1) : mtl.timeScale(1).play(); lenis.stop(); }
    else { reduce ? (mtl.progress(0), head.classList.remove("is-open")) : mtl.timeScale(1.5).reverse(); lenis.start(); }
  };
  mbtn && mbtn.addEventListener("click", () => setMenu(!head.classList.contains("is-open") || mtl.reversed()));
  addEventListener("keydown", (e) => e.key === "Escape" && head && head.classList.contains("is-open") && setMenu(false));

  // ───────── Photo preview panel — turns on in .2s when entering the list, follows the mouse height over .5s power4, and when the row changes the new photo covers from below in .6s expo.inOut (original globalLatestOverview)
  LP.follow = (list, box, sec, labels) => {
    if (!list || !box || !matchMedia("(min-width: 768px) and (pointer: fine)").matches || reduce) return () => {};
    const yTo = gsap.quickTo(box, "y", { duration: 0.5, ease: "power4" });
    const enter = () => gsap.fromTo(box, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    const leave = () => gsap.to(box, { opacity: 0, duration: 0.3, onComplete: () => box.replaceChildren() });
    const move = (e) => yTo(e.clientY - sec.getBoundingClientRect().top - box.offsetHeight / 2);
    const rows = [...list.querySelectorAll("li, .lp-job")];
    const hov = rows.map((li, i) => { const f = () => {
      const w = document.createElement("div"), im = document.createElement("div");
      im.className = "lp-img wf-img"; im.dataset.label = labels[i % labels.length];
      w.append(im); box.append(w);
      gsap.fromTo(w, { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: "expo.inOut" });
      gsap.fromTo(im, { yPercent: -100 }, { yPercent: 0, duration: 0.6, ease: "expo.inOut" });
      box.children.length > 20 && box.children[0].remove();
    }; li.addEventListener("mouseenter", f); return [li, f]; });
    list.addEventListener("mouseenter", enter); list.addEventListener("mouseleave", leave); list.addEventListener("mousemove", move);
    return () => { list.removeEventListener("mouseenter", enter); list.removeEventListener("mouseleave", leave); list.removeEventListener("mousemove", move); hov.forEach(([li, f]) => li.removeEventListener("mouseenter", f)); };
  };

  // ───────── Blurred circle cursor — grows and shows its text only over [data-showblob]. Each frame it follows by .15 of the remaining distance
  const blob = document.querySelector(".lp-blob");
  if (blob && fine && !reduce) {
    const p = { x: 0, y: 0 }, q = { x: 0, y: 0 };
    let seen = false, last = 0;
    addEventListener("pointermove", (e) => {
      q.x = e.clientX; q.y = e.clientY;
      if (!seen) { p.x = q.x; p.y = q.y; seen = true; }
      const host = e.target.closest && e.target.closest("[data-showblob]");
      const hide = e.target.closest && e.target.closest("[data-hideblob], a.lp-circ, button, .lp-head");
      if (host && !hide) { if (!blob.classList.contains("is-show")) { p.x = q.x; p.y = q.y; } blob.textContent = host.dataset.showblob; blob.classList.add("is-show"); } else blob.classList.remove("is-show");
    }, { passive: true });
    gsap.ticker.add((t) => {
      const now = t * 1000, dt = last ? Math.max(1, now - last) : 16.7;
      last = now;
      if (!blob.classList.contains("is-show")) return;
      const k = 1 - Math.pow(1 - 0.15, dt / 16.7);
      p.x += (q.x - p.x) * k; p.y += (q.y - p.y) * k;
      blob.style.transform = `translate(${p.x}px, ${p.y}px)`;
    });
    LP.hideBlob = () => blob.classList.remove("is-show");
  }

  // ───────── Reveal: [data-lp-in] title — blur 10px · rises from 50px below in 1s power2.out (screen 75%) · [data-lp-fade] 1s, .5s later
  LP.reveal = (scope) => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      scope.querySelectorAll("[data-lp-in]").forEach((el) => {
        gsap.set(el, { y: 50, opacity: 0, filter: "blur(10px)" });
        gsap.to(el, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 75%" } });
      });
      scope.querySelectorAll("[data-lp-fade]").forEach((el) => {
        gsap.set(el, { opacity: 0 });
        gsap.to(el, { opacity: 1, duration: 1, delay: 0.5, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 75%" } });
      });
    });
    return () => mm.revert();
  };

  // ───────── Footer — photo moves −20% on scroll, hovering 「Our Fields +」 turns the + by 90° and pressing unfolds the field names one by one
  const footOn = (foot) => {
    const off = [];
    const pic = foot.querySelector(".lp-foot__img");
    if (!reduce) {
      const t = gsap.to(pic, { yPercent: -20, ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom top", scrub: true } });
      off.push(() => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); });
    }
    const more = foot.querySelector(".lp-foot__more"), items = foot.querySelectorAll(".lp-foot__items a"), ic = more.querySelector("svg");
    gsap.set(items, { width: 0, opacity: 0, marginLeft: "-20px" });
    const tl = gsap.timeline({ paused: true }).to(items, { marginLeft: "0px", duration: 0.3 }).to(items, { width: "auto", opacity: 1, stagger: 0.1, duration: 0.3 }, "-=0.3");
    const click = () => {
      const open = more.dataset.footerMenu === "open";
      more.dataset.footerMenu = open ? "close" : "open";
      gsap.to(ic, { rotate: open ? 0 : 135, duration: 0.2, ease: "power1.inOut" });
      open ? tl.timeScale(1.5).reverse() : tl.timeScale(1).play();
    };
    more.addEventListener("click", click);
    const top = foot.querySelector(".lp-foot__top-btn");
    const up = () => lenis.scrollTo(0);
    top.addEventListener("click", up);
    return () => { off.forEach((f) => f()); more.removeEventListener("click", click); top.removeEventListener("click", up); tl.kill(); };
  };

  // ───────── Loader — original values: initial letters blur 10px · from 10px below in .6s power4.out (.2 stagger) → two groups move to the center in 1.3s power3.inOut while the remaining letters unfold
  //   → the bundle splits (1s) and the video panel goes to 1x (1s) → grows to screen size (1.5s, text fades at .8x) → panel removed and the Hero text rises from 20px below in 1s power4.out
  const pre = document.querySelector(".lp-pre");
  const runPre = (full) => new Promise((res) => {
    if (!pre || reduce) { pre && pre.classList.add("is-done"); res(); return; }
    pre.classList.remove("is-done");
    gsap.set(pre, { clearProps: "opacity,visibility" });
    full && sessionStorage.setItem("lp-pre", "1");
    document.body.classList.add("is-locked");
    lenis.stop();
    const s1 = pre.querySelector(".lp-pre__sec.is-1"), s2 = pre.querySelector(".lp-pre__sec.is-2"), img = pre.querySelector(".lp-pre__img");
    const fl = [...pre.querySelectorAll(".lp-pre__fl")], rl = [...pre.querySelectorAll(".lp-pre__rl")];
    const tl = gsap.timeline({ onComplete: () => { pre.classList.add("is-done"); document.body.classList.remove("is-locked"); lenis.start(); res(); } });
    tl.set([s1, s2], { x: (i) => (i ? -1 : 1) * 60 })
      .set(".lp-pre__word", { opacity: 1 })
      .set(rl, { opacity: 0, x: -20 })
      .from(fl[0], { y: 10, filter: "blur(10px)", opacity: 0, duration: 0.6, ease: "power4.out" })
      .from(fl.slice(1), { y: 10, filter: "blur(10px)", opacity: 0, stagger: 0.2, duration: 0.6, ease: "power4.out" }, "-=0.2")
      .to([s1, s2], { x: 0, duration: 1.3, ease: "power3.inOut" }, "-=0.3")
      .to(rl, { x: 0, opacity: 1, duration: 1.3, ease: "power3.inOut" }, "-=1.5");
    // On first entering a subpage, a short version — words gather and fade at .4s, then the panel lifts at .5s
    if (!full) { tl.to([s1, s2], { autoAlpha: 0, duration: 0.4 }).to(pre, { autoAlpha: 0, duration: 0.5 }); return; }
    tl.to(s1, { x: -innerWidth * 0.18, duration: 1, ease: "power3.inOut" })
      .to(s2, { x: innerWidth * 0.18, duration: 1, ease: "power3.inOut" }, "<")
      .to(img, { scale: 1, duration: 1, ease: "power3.inOut" }, "-=1")
      .fromTo(img.querySelectorAll(".lp-pre__clip"), { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: (i) => (i ? 0.9 : 0.7), stagger: 0.3, ease: "expo.inOut" }, "-=0.4")
      .to(img, { width: "calc(100vw + 80px)", height: "100vh", duration: 1.5, ease: "power3.inOut" }, "-=0.3")
      .to([s1, s2], { scale: 0.8, opacity: 0, duration: 1, ease: "power3.inOut" }, "<")
      .to(pre, { autoAlpha: 0, duration: 0.1 })
      .to({}, { duration: 0.5 });
  });
  const home = document.body.dataset.page === "home";
  LP.loaderDone = runPre(home);
  LP.runPre = runPre;

  // ───────── Page on · off ─────────
  const boot = () => {
    const main = document.querySelector("#swup");
    LP.main = main;
    LP.ns = main.dataset.ns;
    document.body.dataset.page = LP.ns;
    LP.offReveal = LP.reveal(main);
    const foot = document.querySelector(".lp-foot");
    LP.offFoot = foot ? footOn(foot) : null;
    const fn = LP.inits[LP.ns];
    LP.pageOff = fn ? fn(main) || null : undefined;
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };
  const teardown = () => {
    LP.offReveal && LP.offReveal();
    LP.offFoot && LP.offFoot();
    LP.pageOff && LP.pageOff();
    LP.pageOff = undefined;
    ScrollTrigger.getAll().forEach((s) => s.kill());
    LP.hideBlob && LP.hideBlob();
  };
  LP.ready = true;
  boot();

  // If the css·js of a page entered via swup isn’t loaded yet, load it — sub-pages like list·about use pages.css/js separately
  const loadAssets = (doc) => {
    if (!doc) return Promise.resolve();
    const jobs = [];
    doc.querySelectorAll('link[rel="stylesheet"]').forEach((l) => {
      const href = new URL(l.getAttribute("href"), location.href).href;
      if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((x) => x.href === href)) return;
      const n = document.createElement("link");
      n.rel = "stylesheet"; n.href = href;
      jobs.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.head.append(n);
    });
    doc.querySelectorAll("script[src]").forEach((s) => {
      const src = new URL(s.getAttribute("src"), location.href).href;
      if ([...document.scripts].some((x) => x.src === src)) return;
      const n = document.createElement("script");
      n.src = src;
      jobs.push(new Promise((r) => { n.onload = n.onerror = r; }));
      document.body.append(n);
    });
    return Promise.all(jobs);
  };

  // Transition — straight from the original swup js-plugin: the body fades out in .25s, and the new body appears .4s later in .25s
  if (window.Swup && window.SwupJsPlugin && !reduce && location.protocol !== "file:") {
    const swup = (LP.swup = new Swup({
      containers: ["#swup", "#swupFooter"],
      animationSelector: false,
      linkSelector: 'a[href$=".html"]:not([data-no-swup]), a[href*=".html#"]:not([data-no-swup])',
      plugins: [new SwupJsPlugin({ animations: [{ from: "(.*)", to: "(.*)",
        out: async () => { await gsap.to("#swup", { opacity: 0, duration: 0.25 }); },
        in: async () => { await gsap.fromTo("#swup", { opacity: 0 }, { opacity: 1, duration: 0.25, delay: 0.4 }); } }] })],
    }));
    swup.hooks.on("visit:start", () => { head && head.classList.contains("is-open") && setMenu(false); teardown(); });
    swup.hooks.before("content:replace", async (visit) => { await loadAssets(visit.to.document); });
    swup.hooks.on("content:replace", () => {
      lenis.scrollTo(0, { immediate: true });
      if (document.querySelector("#swup").dataset.ns === "home" && !sessionStorage.getItem("lp-pre")) LP.loaderDone = runPre(true);
      boot();
    });
  }
})();
