// First page — 7 hero photos cycling·parallax, light stage unfolding and four cards stacking (line painting), news tabs
(() => {
  const { rpx, isPc, lvh, reduce } = window.rbSite;

  // Per line, dark text is painted from the left over a faint shadow text. Progress 0~1 is split by line height ratio, starting from the first line.
  const lineFill = (lines) => {
    const rows = [...lines].map((l) => {
      if (!l.querySelector(".rb-tl__real")) {
        const t = l.textContent;
        l.innerHTML = "";
        const real = document.createElement("span"); real.className = "rb-tl__real"; real.textContent = t;
        const ghost = document.createElement("span"); ghost.className = "rb-tl__ghost"; ghost.setAttribute("aria-hidden", "true"); ghost.textContent = t;
        l.append(real, ghost);
      }
      return { el: l, real: l.querySelector(".rb-tl__real") };
    });
    return (p) => {
      const hs = rows.map((r) => r.el.offsetHeight || 1);
      const total = hs.reduce((a, b) => a + b, 0);
      let at = total * p, acc = 0;
      rows.forEach((r, i) => {
        const s = Math.min(1, Math.max(0, (at - acc) / hs[i]));
        r.real.style.clipPath = `inset(0% ${100 - s * 100}% 0% 0%)`;
        acc += hs[i];
      });
    };
  };

  // ── Hero ──
  const fv = document.querySelector(".rb-fv");
  if (fv) {
    const box = fv.querySelector(".rb-fv__slides");
    const c1 = fv.querySelector(".rb-fv__c1"), c2 = fv.querySelector(".rb-fv__c2");
    const circle = fv.querySelector(".rb-fv__circle");
    const imgs = fv.querySelectorAll(".rb-fv__img");
    const grow = () => { c2.style.height = 100 + 20 * (rpx(225) / fv.offsetHeight) + "%"; };
    addEventListener("resize", grow); grow();
    let n = 1, t = 0, now = performance.now(), prev = now, running = false, inView = true, raf = 0;
    const tick = () => {
      now = performance.now(); t += now - prev; prev = now;
      if (t > 7000) change();
      circle.style.setProperty("--progress", Math.min(1, Math.max(0, t / 7000)));
      if (running && inView) raf = requestAnimationFrame(tick);
    };
    const change = () => {
      t = 0; running = false; cancelAnimationFrame(raf);
      n = n >= imgs.length ? 1 : n + 1;
      const old = imgs[(n - 2 + imgs.length) % imgs.length];
      imgs.forEach((im) => im.classList.remove("is-first", "is-active", "is-past"));
      imgs[n - 1].classList.add("is-active");
      old.classList.add("is-past", "is-active");
      box.dataset.position = n;
      box.classList.add("is-change");
      setTimeout(() => {
        now = prev = performance.now(); running = true;
        circle.style.setProperty("--progress", 0);
        box.classList.remove("is-change");
        old.classList.remove("is-past", "is-active");
        tick();
      }, 1000);
    };
    ScrollTrigger.create({
      trigger: box, start: "top bottom", end: "bottom top",
      onEnter: () => { inView = true; box.classList.remove("is-out"); now = prev = performance.now(); if (running) raf = requestAnimationFrame(tick); },
      onEnterBack: () => { inView = true; box.classList.remove("is-out"); now = prev = performance.now(); if (running) raf = requestAnimationFrame(tick); },
      onLeave: () => { inView = false; box.classList.add("is-out"); },
      onLeaveBack: () => { inView = false; box.classList.add("is-out"); },
    });
    setTimeout(() => {
      fv.classList.add("is-appear");
      box.dataset.position = n;
      imgs[0].classList.add("is-active");
      if (reduce) return;
      now = prev = performance.now(); running = true; tick();
    }, 500);
    if (!reduce) gsap.fromTo(c1, { yPercent: 0 }, { yPercent: 20, ease: "none", scrollTrigger: { trigger: fv, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
  }

  // ── Solution Cards ──
  const sec = document.querySelector(".rb-cards");
  if (sec) {
    const start = sec.querySelector(".rb-cards__start");
    const bg = sec.querySelector(".rb-cards__bg");
    const video = bg.querySelector("video");
    const startMain = sec.querySelector(".rb-cards__start-main");
    const startTitle = start.querySelector(".rb-cards__title");
    const visible = (root) => [...root.querySelectorAll(".rb-cards__text")].find((p) => getComputedStyle(p).display !== "none");
    const startFill = lineFill(visible(start).querySelectorAll(".rb-tl"));
    const main = sec.querySelector(".rb-cards__main");
    const container = main.querySelector(".rb-cards__container");
    const cards = [...main.querySelectorAll(".rb-cards__card")];
    const cardPhotos = cards.map((c) => c.querySelector(".rb-cards__card-bg .rb-ph"));
    const cardFills = cards.map((c) => lineFill(visible(c).querySelectorAll(".rb-tl")));
    const header = document.querySelector(".rb-header");
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => {
      start.style.setProperty("--sp", 0); main.style.setProperty("--mp", 0);
      startFill(1); cardFills.forEach((f) => f(1));
    });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const H = lvh();
      gsap.fromTo(video, { yPercent: -20 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: start, start: "top bottom", end: () => "top+=" + lvh() + " bottom", scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo(video, { yPercent: 0 }, { yPercent: 20, immediateRender: false, ease: "none", scrollTrigger: { trigger: sec, start: "bottom bottom", end: () => "bottom+=" + lvh() + " bottom", scrub: true, invalidateOnRefresh: true } });
      ScrollTrigger.create({ trigger: bg, start: "top top", endTrigger: sec, end: "bottom bottom", pin: true, pinSpacing: false });
      ScrollTrigger.create({ trigger: startMain, start: () => "top-=" + (isPc() ? rpx(84) : rpx(30)) + " top", endTrigger: sec, end: "bottom bottom", pin: true, pinSpacing: false });
      ScrollTrigger.create({
        trigger: start, start: () => "top-=" + H / 2 + " top", end: "top top",
        onUpdate: (st) => { start.style.setProperty("--sp", 1 - st.progress); startFill(st.progress); startTitle.style.opacity = 1 - st.progress; },
      });
      ScrollTrigger.create({ trigger: container, start: "top top", endTrigger: main, end: "bottom bottom", pin: true, pinSpacing: false });
      ScrollTrigger.create({
        trigger: main, start: "top top", end: "bottom bottom",
        onUpdate: (st) => {
          const p = st.progress, e = 8 * p;
          main.style.setProperty("--mp", 1 - p);
          const wide = innerWidth / lvh() > 1;
          cardFills.forEach((fill, r) => {
            if (wide) fill(2 * r + 1 > e ? 0 : 2 * r + 2 > e ? e - (2 * r + 1) : 1);
            else fill(2 * r > e ? 0 : 2 * r + 2 > e ? (e - (2 * r + 0.7)) / 1.3 : 1);
          });
          const q = 4 * p;
          cardPhotos.forEach((ph, i) => {
            const k = Math.min(2, Math.max(0, q - i));
            ph.style.transform = k <= 1 ? `translateY(${-20 * (1 - k)}%)` : `translateY(${40 * (1 - k)}%)`;
          });
        },
      });
      ScrollTrigger.create({
        trigger: sec, start: "top top", end: "bottom top",
        onToggle: (st) => header && header.classList.toggle("is-hide", st.isActive),
      });
    });
  }

  // ── News Tabs ──
  const news = document.querySelector(".rb-news__main");
  if (news) news.querySelectorAll(".rb-news__tab").forEach((b) => b.addEventListener("click", () => { news.dataset.current = b.dataset.target; }));
})();
