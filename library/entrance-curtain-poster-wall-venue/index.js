// Home page — opening scene (counting number → Enter → TV-shaped video → ripple clears), poster wall, intro strip, overlapping rising plates, facility plates, flowing text lines, time cards, closing video
(() => {
  const start = () => {
    const site = window.jtSite;
    const { st, D, riseText, REDUCE, DESK } = site;
    const vh = (p) => (innerHeight * p) / 100;
    const B = "bottom bottom+=40px";

    // TV screen shape — e=If 0, a centered bulging screen (66% wide · 82% tall), e=1 is a full square. On portrait screens it is widened 1.3x horizontally
    const tv = (e) => {
      const t = 1 - e, wide = innerHeight > innerWidth ? 1.3 : 1;
      const L = 0.5 - (0.5 - 0.17 * t) * wide, R = 1 - L, T = 0.09 * t, Bt = 1 - T;
      const bx = 0.012 * t, by = 0.022 * t, r = 0.03 * t;
      const f = (v) => v.toFixed(4);
      return `M${f(L + r)} ${f(T + by)}Q0.5 ${f(T - by)} ${f(R - r)} ${f(T + by)}Q${f(R)} ${f(T + by)} ${f(R)} ${f(T + by + r)}Q${f(R + bx)} 0.5 ${f(R)} ${f(Bt - by - r)}Q${f(R)} ${f(Bt - by)} ${f(R - r)} ${f(Bt - by)}Q0.5 ${f(Bt + by)} ${f(L + r)} ${f(Bt - by)}Q${f(L)} ${f(Bt - by)} ${f(L)} ${f(Bt - by - r)}Q${f(L - bx)} 0.5 ${f(L)} ${f(T + by + r)}Q${f(L)} ${f(T + by)} ${f(L + r)} ${f(T + by)}Z`;
    };
    const openPath = document.querySelector("#jt-tv-open path");
    const closePath = document.querySelector("#jt-tv-close path");
    openPath?.setAttribute("d", tv(0));
    closePath?.setAttribute("d", tv(1));

    // ───────── Hero ─────────
    const firstTitle = document.querySelector(".jt-first__title");
    const firstRise = [...document.querySelectorAll(".jt-first__title [data-jt-rise-manual]")].map((el) => riseText(el, { play: "manual" }));
    const opened = () => {
      site.showHeader();
      firstTitle?.classList.add("is-on");
      firstRise.forEach((tl) => tl.restart());
      st.lenis?.start();
      firstScene();
    };

    function firstScene() {
      const sec = document.querySelector(".jt-first");
      const view = document.querySelector(".jt-first__view");
      const posters = document.querySelector(".jt-posters");
      if (!sec || REDUCE.matches) return;
      const trig = { trigger: sec, start: "top top", end: "bottom bottom", scrub: D.strong };
      gsap.to(view, { "--f": 1, ease: "none", scrollTrigger: trig });
      gsap.to(posters, { "--frame": 1, ease: "none", scrollTrigger: { ...trig } });
    }
    // Mouse position — converted to screen ratio (−1~1), approaching 5% on each move, and the center of the shadow ring shifts by that much (×40rem)
    (() => {
      const posters = document.querySelector(".jt-posters");
      if (!posters || !site.HOVER.matches) return;
      let px = 0, py = 0;
      addEventListener("pointermove", (e) => {
        // The original has no body until the number reaches 100, so the mouse spot doesn’t follow either
        if (!document.body.classList.contains("is-loaded") || posters.getBoundingClientRect().bottom < 0) return;
        px = gsap.utils.interpolate(px, (e.clientX / innerWidth) * 2 - 1, 0.05);
        py = gsap.utils.interpolate(py, (e.clientY / innerHeight) * 2 - 1, 0.05);
        posters.style.setProperty("--px", px);
        posters.style.setProperty("--py", py);
      });
    })();

    // ───────── Intro curtain ─────────
    function opening() {
      const op = document.querySelector(".jt-op");
      if (!op) { document.body.classList.add("is-loaded"); opened(); return; }
      if (REDUCE.matches) { op.hidden = true; document.body.classList.add("is-loaded"); opened(); return; }
      if (site.seen) {
        op.hidden = true;
        document.body.classList.add("is-loaded");
        opened();
        // When arriving from another page, the new screen rises in 1.2s power3.inOut like a subpage
        const main = document.querySelector(".jt-main");
        gsap.set(main, { opacity: 0 });
        requestAnimationFrame(() => requestAnimationFrame(() => gsap.to(main, { opacity: 1, duration: D.strong, ease: "power3.inOut" })));
        return;
      }
      st.lenis?.stop();
      const titles = [...op.querySelectorAll(".jt-op__title [data-jt-rise-manual]")];
      titles.map((el) => riseText(el, { play: "manual" })).forEach((tl) => tl.restart());
      const pct = op.querySelector(".jt-op__pct");
      const btn = op.querySelector(".jt-op__btn");
      const videos = [...op.querySelectorAll("video")];
      const set = (k) => (v) => op.style.setProperty(k, v);
      const vars = { "--load-fade": 0, "--enter-fade": 0, "--video-in": 0, "--gray": 0, "--clip": 0, "--mask": 0 };
      const apply = () => Object.entries(vars).forEach(([k, v]) => set(k)(v));
      // Number — 0→80 over 3s, then once the video is fully loaded, →100 over another 3s (no curve, cut to integers)
      const count = (to) => new Promise((done) => gsap.to(pct, { innerText: to, duration: 3, ease: "none", snap: { innerText: 1 }, onComplete: () => done() }));
      const ready = new Promise((ok) => {
        const v = videos[0];
        if (!v) { ok(); return; }
        if (v.readyState >= 4) ok();
        else { v.addEventListener("canplaythrough", ok, { once: true }); v.load(); }
      });
      Promise.all([count(80), ready]).then(() => count(100)).then(() => {
        document.body.classList.add("is-loaded");
        gsap.to(pct, { autoAlpha: 0, duration: D.strongAccelerate, ease: "power3.out" });
        const tl = gsap.timeline();
        tl.to(titles, { y: "-24vh", duration: 1.2, ease: "power2.inOut", stagger: 0.05 });
        tl.to(vars, { "--load-fade": 1, duration: 1.8, ease: "power2.inOut", onUpdate: apply });
      });
      // Enter — curtain lifts 1s → video floats up 1.2s (plays) → grayscale releases .8s → TV shape expands to full screen 1.6s → rests 2s, then the wave lifts from bottom to top in .8s
      // In the original, the button receives interaction beneath the overlay (which takes none) even while counting
      btn?.addEventListener("click", () => {
        // The moment it is pressed the button releases the hover — the original also reverts the text fade right at press (the browser doesn’t send hover-leave to a locked button right away, so we send it directly)
        btn.style.pointerEvents = "none";
        btn.dispatchEvent(new PointerEvent("pointerout", { bubbles: true }));
        const tl = gsap.timeline({ onUpdate: apply });
        tl.to(vars, { "--enter-fade": 1, duration: 1, ease: "power1.inOut" });
        tl.to(vars, { "--video-in": 1, duration: 1.2, ease: "power2.out", onStart: () => videos.forEach((v) => v.play().catch(() => {})) });
        tl.to(vars, { "--gray": 1, duration: 0.8, ease: "power3.out" });
        tl.to(vars, { "--clip": 1, duration: 1.6, ease: "power3.inOut", onUpdate: () => openPath?.setAttribute("d", tv(vars["--clip"])) });
        tl.to(vars, { "--mask": 1, duration: 0.8, ease: "none" }, "+=2");
        tl.to(op, { autoAlpha: 0, duration: 0.8, ease: "none", onComplete: () => { op.hidden = true; opened(); } }, "<");
      });
    }

    // ───────── Second section header band — once scrolled up leaving 80vh below, it is pushed 40% and scaled .98, with a black veil at .8 ─────────
    const head = document.querySelector(".jt-second__head");
    if (head && !REDUCE.matches) {
      const trig = { trigger: head, start: () => `bottom-=${vh(80)}px top`, end: "bottom top", scrub: D.strong };
      gsap.to(head, { y: "40%", scale: 0.98, transformOrigin: "bottom", ease: "none", scrollTrigger: trig });
      gsap.to(head.querySelector(".jt-second__mask"), { opacity: 0.8, ease: "none", scrollTrigger: { ...trig } });
    }

    // ───────── Overlapping rising panel — when the panel’s bottom edge passes 40% from the top of the screen, its inside moves down 8rem with a black shade of .8 ─────────
    if (!REDUCE.matches) document.querySelectorAll(".jt-overlap").forEach((card) => {
      const trig = { trigger: card, start: () => `bottom-=${vh(40)}px top`, end: "bottom top", scrub: D.strong };
      gsap.to(card.querySelector(".jt-overlap__body"), { y: "8rem", ease: "none", scrollTrigger: trig });
      gsap.to(card.querySelector(".jt-overlap__shade"), { opacity: 0.8, ease: "none", scrollTrigger: { ...trig } });
    });

    // ───────── Time cards — stick at the top, scale back to .9 when the next card arrives, and once more than 80% past the top of the screen they drop 1.6rem and fade out ─────────
    if (!REDUCE.matches) document.querySelectorAll(".jt-feat").forEach((card) => {
      gsap.to(card, { scale: 0.9, ease: "none", scrollTrigger: { trigger: card, start: "top bottom-=50%", end: "bottom top", scrub: D.strong } });
      gsap.to(card, { y: "1.6rem", opacity: 0, ease: "none", scrollTrigger: { trigger: card, start: "top top-=80%", end: "bottom top", scrub: D.strong } });
    });

    // ───────── Flowing text line — only while visible, each frame moves left by board width/text width × .4 (2.4% of the board width per second) ─────────
    document.querySelectorAll("[data-jt-loop]").forEach((box) => {
      const speed = +box.dataset.jtLoop || -0.4;
      const clip = box.querySelector(".jt-loop__clip");
      const [a, b] = box.querySelectorAll(".jt-loop__row > div");
      if (!clip || !a || !b || REDUCE.matches) return;
      let on = false, p = 0;
      new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(box);
      gsap.ticker.add(() => {
        if (!on) return;
        p += (gsap.ticker.deltaRatio() / 1000) * Math.abs(speed) * (clip.clientWidth / a.clientWidth);
        if (p >= 1) p = 0;
        if (speed < 0) { a.style.transform = `translateX(${-100 * p}%)`; b.style.transform = `translateX(${-100 * p}%)`; }
        else { a.style.transform = `translateX(${100 * p}%)`; b.style.transform = `translateX(${100 * p - 200}%)`; }
      });
    });

    // ───────── Facility panel — on open panel .5s · photo background 1.2→1 (1.2s power1.out) · cards come .5s later from 3.2rem below at .08s stagger (1.2s power3.out) ─────────
    document.querySelectorAll("[data-jt-modal]").forEach((btn) => {
      const dlg = document.querySelector(btn.dataset.jtModal);
      if (!dlg) return;
      const wrap = dlg.querySelector(".jt-modal__wrap"), bg = dlg.querySelector(".jt-modal__bg"), cards = dlg.querySelectorAll(".jt-mcard");
      const close = () => gsap.to(wrap, { opacity: 0, duration: D.standard, ease: "power3.out", onComplete: () => { dlg.close(); st.modalOpen = false; st.lenis?.start(); } });
      btn.addEventListener("click", () => {
        dlg.showModal();
        st.modalOpen = true;
        st.lenis?.stop();
        gsap.fromTo(wrap, { opacity: 0 }, { opacity: 1, duration: D.emphasized, ease: "power3.out" });
        gsap.fromTo(bg, { scale: 1.2 }, { scale: 1, duration: D.strong, ease: "power1.out" });
        gsap.fromTo(cards, { opacity: 0, y: "3.2rem" }, { opacity: 1, y: 0, duration: D.strong, ease: "power3.out", delay: D.emphasized, stagger: { each: 0.08 } });
      });
      dlg.addEventListener("click", (e) => { if (e.target.closest(".jt-close") || (!e.target.closest(".jt-mcard") && e.target.closest(".jt-modal__scroll"))) close(); });
      dlg.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    });

    // ───────── Wrap-up ─────────
    (() => {
      const wrap = document.querySelector(".jt-closing");
      if (!wrap) return;
      const bg = wrap.querySelector(".jt-closing__bg");
      const rises = [...wrap.querySelectorAll("[data-jt-rise-manual]")].map((el) => riseText(el, { play: "manual" }));
      const cta = wrap.querySelector(".jt-closing__cta");
      if (REDUCE.matches) { rises.forEach((tl) => tl.progress(1)); closePath?.setAttribute("d", tv(0)); return; }
      gsap.fromTo(bg, { opacity: 0, scale: 2, y: -80 }, { opacity: 1, scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: wrap, start: "top bottom", end: B, scrub: D.strong } });
      gsap.to(wrap.querySelectorAll(".jt-closing__video"), { filter: "grayscale(80%)", ease: "none", scrollTrigger: { trigger: wrap, start: "top top", end: B, scrub: D.strong } });
      gsap.fromTo(wrap.querySelector(".jt-closing__dim"), { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: wrap, start: "top top", end: B, scrub: D.strong } });
      ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: B, scrub: D.strong, onUpdate: (s) => closePath?.setAttribute("d", tv(1 - s.progress)) });
      ScrollTrigger.create({ trigger: wrap, start: "top top", end: B, scrub: D.strong,
        onLeave: () => { rises.forEach((tl) => tl.play()); gsap.fromTo(cta, { opacity: 0, y: "4rem", scale: 0.88 }, { opacity: 1, y: 0, scale: 1, duration: D.strongDecelerate, ease: "power3.out" }); },
        onEnterBack: () => { rises.forEach((tl) => tl.reverse()); gsap.to(cta, { opacity: 0, y: "4rem", duration: D.strongDecelerate, ease: "power3.out" }); } });
    })();

    opening();
    ScrollTrigger.refresh();
  };
  if (window.jtSite?.ready) start();
  else document.addEventListener("jt:ready", start, { once: true });
})();
