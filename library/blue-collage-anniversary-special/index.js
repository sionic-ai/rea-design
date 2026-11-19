// Motion for the brand anniversary first page.
// Card values (original WORD_LOAD_MORE_ANIMATION·WORD_MODAL_OPEN_FLIP_ANIMATION): fold 35° · image 25px up ±15° · 0.1s interval · 1s power4.out / flips to open the window .5s power2.inOut · tilt toward the mouse ±10°
// Marquee 20s per loop (CSS) · symbol assembly power3.out (scrub) · footer photo swaps every 2.5s
(() => {
  const reduced = HS.reduced;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // KV: the first cell grows to fill the screen and returns to its original color, white paper tilted -12° rises from below and covers it
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".ft-kv", start: "top top", end: "bottom bottom", scrub: true } });
    tl.to(".ft-kv__cell:first-child", { scale: 2, ease: "none", duration: 0.5 }, 0)
      .to(".ft-kv__color", { opacity: 1, ease: "none", duration: 0.35 }, 0.1)
      .to(".ft-kv__word", { yPercent: 60, opacity: 0, ease: "none", duration: 0.4 }, 0.1)
      .fromTo(".ft-kv__page", { y: () => innerHeight * 1.6, rotation: -12 }, { y: () => innerHeight * 0.66, rotation: -12, ease: "none", duration: 0.6 }, 0.4);

    // 50-person card: unfolds like folded paper
    gsap.set(".ft-card__paper", { rotationX: 35, opacity: 0 });
    // Original WordLoadMore: each photo stands up in 1s power4.out (.23,1,.32,1) from 25px above and a random ±15° left or right (rotation axis at the lower corner of the tilted side)
    gsap.utils.toArray(".ft-card__photo").forEach((p) => { const r = Math.random() < 0.5 ? -15 : 15; gsap.set(p, { y: -25, rotation: r, transformOrigin: r < 0 ? "left bottom" : "right bottom" }); });
    ScrollTrigger.batch(".ft-card", {
      start: "top 85%",
      once: true,
      onEnter: (all) => {
        // Skip hidden cards (before See more) — they line up the same way when expanded
        const els = all.filter((e) => !e.dataset.shown && e.getClientRects().length);
        if (!els.length) return;
        const papers = els.map((e) => $(".ft-card__paper", e));
        gsap.to(papers, { rotationX: 0, opacity: 1, duration: 1, ease: "power4.out", stagger: 0.1 });
        gsap.to(els.map((e) => $(".ft-card__photo", e)), { y: 0, rotation: 0, duration: 1, ease: "power4.out", stagger: 0.1 });
      },
    });

    // Symbol: pieces gather from their scattered spots, and after the sun rises above the horizon 40 → 50
    const st = gsap.timeline({ scrollTrigger: { trigger: ".ft-symbol", start: "top top", end: "bottom bottom", scrub: true }, defaults: { ease: "power3.out" } });
    st.from(".ft-sym-arc--1", { x: -120, y: -80, rotation: -60, opacity: 0, transformOrigin: "50% 50%", duration: 0.3 }, 0)
      .from(".ft-sym-arc--2", { x: 140, y: -60, rotation: 70, opacity: 0, transformOrigin: "50% 50%", duration: 0.3 }, 0.05)
      .from(".ft-sym-40", { y: 40, opacity: 0, duration: 0.25 }, 0.1)
      .from(".ft-sym-sun", { y: 140, duration: 0.35 }, 0.35)
      .to(".ft-sym-40", { opacity: 0, duration: 0.15 }, 0.62)
      .from(".ft-sym-50", { opacity: 0, y: 20, duration: 0.2 }, 0.62)
      .to(".ft-symbol__word i", { opacity: 1, duration: 0.15 }, 0.7)
      .from(".ft-symbol__text", { opacity: 0, y: 30, duration: 0.2 }, 0.8);
  });

  // KV: grid alternates 2×2 ↔ 4×2 every 2.4s (stops at 2×2 once scrolling starts), the cell under the mouse keeps its original color, a photo pile follows the mouse
  const kv = $(".ft-kv"), grid = $(".ft-kv__grid"), trail = $(".ft-kv__trail");
  // Hero open (original KV2ND_LOADING_INTRO): after 1s the 4×2 board lights up at 130ms intervals in the order [0,1,2,3,7,6,5,4], and on the seventh the logo comes in from bottom left (−105%, 105%) over .8s cubic-bezier(.77,0,.175,1),
  // The commemorative text enters from 105% below over .6s cubic-bezier(.19,1,.22,1). Once per window — when it ends, the 2×2 ↔ 4×2 swap starts
  // Panel swapping uses the original MOTION_CONFIG numbers — stays 1s at 4×2 (baseHold), pushes to 2×2 in .45s (pushDuration), stays 4.8s at 2×2 (expanded .65 + sameImage 1 + colorHold .15 + colorBoth 3), then returns to 4×2 in .45s (colorToGrid)
  let swap = 0;
  const startSwap = () => {
    if (reduced) return;
    const step = () => {
      if (scrollY < 10) grid.classList.toggle("is-8");
      swap = setTimeout(step, grid.classList.contains("is-8") ? 1000 + 450 : 4800 + 450);
    };
    swap = setTimeout(step, 1000);
  };
  const cells = $$(".ft-kv__cell", grid), word = $(".ft-kv__word"), anniv = $(".ft-kv__anniv span");
  if (!reduced && !sessionStorage.getItem("hs-kv-intro")) {
    sessionStorage.setItem("hs-kv-intro", "1");
    grid.classList.add("is-8");
    cells.forEach((c) => c.classList.add("is-wait"));
    gsap.set(word, { xPercent: -105, yPercent: 105 });
    if (anniv) gsap.fromTo(anniv, { yPercent: 105 }, { yPercent: 0, duration: 0.6, ease: "expo.out" });
    [0, 1, 2, 3, 7, 6, 5, 4].forEach((k, step) => setTimeout(() => {
      cells[k]?.classList.remove("is-wait");
      if (step === 6) gsap.to(word, { xPercent: 0, yPercent: 0, duration: 0.8, ease: "power3.inOut" });
      if (step === 7) startSwap();
    }, 1000 + 130 * step));
  } else startSwap();
  addEventListener("scroll", () => { if (scrollY > 10) grid.classList.remove("is-8"); }, { passive: true });
  if (!reduced && matchMedia("(hover: hover)").matches) {
    const items = $$("i", trail).map((el, k) => ({ el, x: innerWidth / 2, y: innerHeight / 2, k }));
    let mx = innerWidth / 2, my = innerHeight / 2, idle = 0;
    kv.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY; idle = 0;
      trail.classList.add("is-on");
      // In the WebGL version, pass it through the kv data-hot instead of a class — so cell classes don’t wobble when swapping panels
      const hot = $$(".ft-kv__cell").findIndex((c) => { const b = c.getBoundingClientRect(); return b.width && e.clientX >= b.left && e.clientX < b.right && e.clientY >= b.top && e.clientY < b.bottom; });
      if (kv.classList.contains("is-gl")) kv.dataset.hot = hot;
      else $$(".ft-kv__cell").forEach((c, k) => c.classList.toggle("is-hot", k === hot));
    });
    kv.addEventListener("mouseleave", () => { trail.classList.remove("is-on"); kv.dataset.hot = -1; $$(".ft-kv__cell").forEach((c) => c.classList.remove("is-hot")); });
    gsap.ticker.add(() => {
      if (++idle > 60) trail.classList.remove("is-on");
      items.forEach((it) => {
        const f = 0.3 - it.k * 0.04;
        it.x += (mx - it.x) * f; it.y += (my - it.y) * f;
        it.el.style.transform = `translate(${it.x + it.k * 6}px, ${it.y + it.k * 6}px)`;
        it.el.style.zIndex = 10 - it.k;
      });
    });
  }

  // 'See more'(original WordLoadMore): the remaining cards unfold from a 35° folded paper and photos settle from 25px above at ±15°, 1s power4.out · .1s stagger
  $(".ft-more").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    $(".ft-gallery").classList.add("is-more");
    const extra = $$(".ft-card.is-extra");
    extra.forEach((c) => (c.dataset.shown = "1"));
    if (!reduced) {
      const opt = { duration: 1, ease: "power4.out", stagger: 0.1 };
      gsap.fromTo(extra, { opacity: 0 }, { opacity: 1, ...opt });
      // The original unfold moves only the cell opacity and the photo — the paper stays unfolded
      gsap.set(extra.map((c) => $(".ft-card__paper", c)), { opacity: 1, clearProps: "transform" });
      // Photos use WAAPI like the original — from 25px above · ±15° (axis at the bottom corner on the tilted side) at 1s cubic-bezier(.23,1,.32,1), each cell .1s later
      extra.forEach((c, i) => {
        const p = $(".ft-card__photo", c), r = Math.random() < 0.5 ? -15 : 15, o = r < 0 ? "left bottom" : "right bottom";
        gsap.set(p, { clearProps: "transform" });
        p.animate([{ transformOrigin: o, transform: `translateY(-25px) rotate(${r}deg)` }, { transformOrigin: o, transform: "translateY(0) rotate(0deg)" }], { duration: 1000, delay: i * 100, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "both" });
      });
    }
    // Once fully unfolded the button steps back (original complete) — after the unfolding ends
    setTimeout(() => (btn.hidden = true), reduced ? 0 : 1000 + 100 * extra.length);
    ScrollTrigger.refresh();
  });

  // brand-anniversary cover (original BookAnniversaryHoverEffect): bounces away from the side the pointer hovers, and once visible, the three images bounce on their own every 3 seconds (if not visible or mid-bounce, checks again after .5s)
  const emblem = $(".ft-emblem");
  if (emblem) {
    const items = $$(".ft-emblem__item", emblem);
    let revealed = false, idleT = 0;
    const schedule = (ms = 3000) => { clearTimeout(idleT); idleT = setTimeout(playIdle, ms); };
    function playIdle() {
      if (!emblem.classList.contains("is-in")) return schedule(500);
      if (!revealed) { revealed = true; return schedule(); }
      const r = emblem.getBoundingClientRect();
      if (document.hidden || r.bottom <= 0 || r.top >= innerHeight || items.some((i) => i.classList.contains("is-spring"))) return schedule(500);
      items.forEach((i) => i.classList.remove("is-idle"));
      void emblem.offsetWidth;
      items.forEach((i) => i.classList.add("is-idle"));
    }
    const spring = (it, fromLeft) => {
      clearTimeout(idleT);
      items.forEach((i) => i.classList.remove("is-idle"));
      if (emblem.classList.contains("is-in")) revealed = true;
      it.classList.remove("is-spring", "from-left", "from-right");
      it.classList.add(fromLeft ? "from-left" : "from-right");
      void it.offsetWidth;
      it.classList.add("is-spring");
    };
    items.forEach((it) => {
      it.addEventListener("animationend", (e) => {
        if (e.target !== it.firstElementChild) return;
        if (e.animationName === "ftEmblemIdle") { it.classList.remove("is-idle"); if (it.classList.contains("is-cars")) schedule(); }
        else if (e.animationName === "ftEmblemSpring") { it.classList.remove("is-spring"); schedule(); }
      });
      if (matchMedia("(hover: hover) and (pointer: fine)").matches) it.addEventListener("pointerenter", (e) => { const r = it.getBoundingClientRect(); spring(it, e.clientX < r.left + r.width / 2); });
    });
    new IntersectionObserver(([e]) => e.isIntersecting && emblem.classList.add("is-in"), { rootMargin: "0px 0px -10% 0px" }).observe(emblem);
    if (!reduced) schedule(500);
  }

  // The party stamp tilts following the mouse (original PartyLogoMouseEffect: screen center as reference −1 to 1 → X max 16° (23° downward) · Y 42° · Z 10°, follows 9% per frame, only within one screen height)
  const stamp = $(".ft-stamp");
  if (stamp && !reduced && matchMedia("(hover: hover) and (pointer: fine)").matches && innerWidth > 767) {
    const tg = { x: 0, y: 0, z: 0 }, cur = { x: 0, y: 0, z: 0 };
    let near = false, raf = 0, last = 0;
    const draw = () => { stamp.style.setProperty("--rx", `${cur.x.toFixed(2)}deg`); stamp.style.setProperty("--ry", `${cur.y.toFixed(2)}deg`); stamp.style.setProperty("--rz", `${cur.z.toFixed(2)}deg`); };
    const step = (now) => {
      raf = 0;
      const dt = last ? Math.min(Math.max((now - last) / (1000 / 60), 0), 2) : 1;
      last = now;
      const k = 1 - (1 - 0.09) ** dt, d = { x: tg.x - cur.x, y: tg.y - cur.y, z: tg.z - cur.z };
      cur.x += d.x * k; cur.y += d.y * k; cur.z += d.z * k;
      draw();
      if (Math.abs(d.x) > 0.01 || Math.abs(d.y) > 0.01 || Math.abs(d.z) > 0.01) raf = requestAnimationFrame(step); else last = 0;
    };
    const wake = () => { if (near && !raf) raf = requestAnimationFrame(step); };
    // Like the original, listens to the mouse only when near the screen — right after entering it stands ready until the next mouse move
    addEventListener("mousemove", (e) => {
      if (!near) return;
      const x = Math.min(Math.max((e.clientX / innerWidth - 0.5) * 2, -1), 1), y = Math.min(Math.max((e.clientY / innerHeight - 0.5) * 2, -1), 1);
      tg.x = -y * (y > 0 ? 23 : 16); tg.y = x * 42; tg.z = x * 10;
      wake();
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => { tg.x = tg.y = tg.z = 0; wake(); });
    new IntersectionObserver(([e]) => { near = e.isIntersecting; if (!near) { tg.x = tg.y = tg.z = 0; cur.x = cur.y = cur.z = 0; draw(); } }, { rootMargin: `${innerHeight}px 0px` }).observe(stamp);
  }

  // Card tilts toward the mouse (while hovering)
  if (!reduced && matchMedia("(hover: hover)").matches) {
    $$(".ft-card").forEach((c) => {
      const paper = $(".ft-card__paper", c);
      c.addEventListener("mousemove", (e) => {
        const b = paper.getBoundingClientRect();
        const dx = (e.clientX - (b.left + b.width / 2)) / (b.width / 2);
        const dy = (e.clientY - (b.top + b.height / 2)) / (b.height / 2);
        gsap.to(paper, { rotationY: dx * 10, rotationX: -dy * 10, duration: 0.6, ease: "power2.out", overwrite: "auto" });
      });
      c.addEventListener("mouseleave", () => gsap.to(paper, { rotationY: 0, rotationX: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" }));
    });
  }

  // Pressing a card folds it all the way, flips it and opens the text window
  const modal = $(".ft-modal");
  const cards = $$(".ft-card");
  let at = 0;
  const fill = (i) => {
    at = (i + cards.length) % cards.length;
    $(".ft-modal__name", modal).textContent = $(".ft-card__name", cards[at]).textContent;
    $(".ft-modal__role", modal).textContent = $(".ft-card__tag", cards[at]).textContent;
  };
  const openWord = (i) => {
    fill(i);
    const paper = $(".ft-card__paper", cards[at]);
    const show = () => { modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false"); HS.lenis?.stop(); };
    if (reduced) return show();
    gsap.timeline()
      .to(paper, { rotationX: -180, duration: 0.65, ease: "power2.inOut" })
      .add(show, 0.35)
      .set(paper, { rotationX: 0 }, 1.1);
  };
  const closeWord = () => { modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true"); HS.lenis?.start(); };
  cards.forEach((c, i) => c.addEventListener("click", () => openWord(i)));
  $(".ft-modal__veil", modal).addEventListener("click", closeWord);
  $$("[data-close]", modal).forEach((b) => b.addEventListener("click", closeWord));
  $$("[data-step]", modal).forEach((b) => b.addEventListener("click", () => fill(at + Number(b.dataset.step))));

  // Switch view: photo collection ↔ name list (expanded)
  $$(".ft-switch button").forEach((b) => b.addEventListener("click", () => {
    $$(".ft-switch button").forEach((x) => x.classList.toggle("is-on", x === b));
    $$("[data-view-panel]").forEach((p) => (p.hidden = p.dataset.viewPanel !== b.dataset.view));
    ScrollTrigger.refresh();
  }));
  $$(".ft-acc__btn").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.toggle("is-open")));

  // Office map: hovering a dot flips the preview photo, clicking opens a seat window (prev/next)
  const om = $(".ft-omodal");
  const spots = $$(".ft-spot");
  const preview = $(".ft-map__preview");
  let oat = 0;
  const ofill = (i) => {
    oat = (i + spots.length) % spots.length;
    $(".ft-omodal__title", om).textContent = spots[oat].getAttribute("aria-label");
  };
  spots.forEach((s, i) => {
    s.addEventListener("mouseenter", () => { preview.style.opacity = 0.4; preview.dataset.label = `${s.getAttribute("aria-label")} Photo · Bright daylight`; requestAnimationFrame(() => (preview.style.opacity = 1)); });
    s.addEventListener("click", () => { ofill(i); om.classList.add("is-open"); om.setAttribute("aria-hidden", "false"); HS.lenis?.stop(); });
  });
  const oclose = () => { om.classList.remove("is-open"); om.setAttribute("aria-hidden", "true"); HS.lenis?.start(); };
  $(".ft-modal__veil", om).addEventListener("click", oclose);
  $("[data-oclose]", om).addEventListener("click", oclose);
  $$("[data-ostep]", om).forEach((b) => b.addEventListener("click", () => ofill(oat + Number(b.dataset.ostep))));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeWord(); oclose(); } });

  // Photo inside footer circle
  const photos = $$(".ft-foot__photo");
  let p = 0;
  if (!reduced) setInterval(() => { photos[p].classList.remove("is-on"); p = (p + 1) % photos.length; photos[p].classList.add("is-on"); }, 2500);
})();
