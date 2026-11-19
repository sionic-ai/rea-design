// Spanning several pages — transition curtain · header row · menu board · section head · button arrow · parallax photo · card carousel · photo slide · footer follow
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = "ontouchstart" in document;
  const isPc = () => document.body.clientWidth >= 767;
  // Original rpx — px based on 1440 (375 on phone) converted to the current width
  const rpx = (n) => (n * document.body.clientWidth) / (isPc() ? 1440 : 375);
  const lvh = () => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;height:100lvh";
    document.body.append(probe);
    const h = probe.offsetHeight;
    probe.remove();
    return h;
  };
  window.rbSite = { rpx, isPc, lvh, reduce, isTouch, scrollHandlers: [] };

  // Smooth scroll — ScrollSmoother (smooth 1.5, effects) only on PC with a mouse
  let smoother = null;
  if (isPc() && !isTouch && !reduce && document.getElementById("smooth-wrapper")) {
    smoother = ScrollSmoother.create({
      smooth: 1.5, speed: 1, effects: true, normalizeScroll: true,
      onUpdate: (s) => rbSite.scrollHandlers.forEach((f) => f(s.scrollTop())),
    });
    ScrollTrigger.normalizeScroll({ allowNestedScroll: true });
  }
  rbSite.smoother = smoother;
  const scrollTop = () => (smoother ? smoother.scrollTop() : root.scrollTop || document.body.scrollTop);

  // ── The soft-edge-page part handles the transition curtain. The page title rises when the curtain starts lifting (right after attach + 50ms) ──
  smoother && smoother.refresh();
  setTimeout(() => dispatchEvent(new Event("rb:intro")), 50);

  // During the transition, scrolling stops and the pressed link is marked (the menu dot and card lift remain)
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !e.defaultPrevented || a.target === "_blank") return;
    smoother && smoother.paused(true);
    a.classList.add("rb-clicked");
  });
  addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    smoother && smoother.paused(false);
    document.querySelector(".rb-header")?.classList.remove("is-open");
    document.querySelectorAll(".rb-clicked").forEach((n) => n.classList.remove("rb-clicked"));
  });

  // ── Header bar: sticks after 84px (stick), hides on scroll down and appears on scroll up (draw). On pc the panel is pushed up as much as it passes ──
  const header = document.querySelector(".rb-header");
  if (header) {
    const bar = header.querySelector(".rb-header__bar");
    const toggle = header.querySelector(".rb-header__toggle");
    let stick = false, fix = false, hidden = false, last = scrollTop(), shift = 0;
    const onScroll = (o) => {
      if (header.classList.contains("is-open")) return;
      o = Math.max(0, o == null ? scrollTop() : o);
      const lim = rpx(isPc() ? 84 : 55);
      if (isPc()) shift = Math.min(lim, Math.max(0, shift + (o - last)));
      if (stick ? o <= 1 : o > lim) {
        stick = !stick;
        header.classList.toggle("is-stick", stick);
        if (stick) { header.classList.add("is-noduration"); hidden = true; header.classList.remove("is-draw"); requestAnimationFrame(() => requestAnimationFrame(() => header.classList.remove("is-noduration"))); }
        else { header.classList.remove("is-noduration", "is-draw"); hidden = false; }
      }
      if (fix ? o <= lim / 2 : o > lim / 2) { fix = !fix; header.classList.toggle("is-fix", fix); }
      if (stick) {
        if (o - last >= 1 && !hidden) { header.classList.remove("is-draw"); hidden = true; }
        else if (o - last <= -1 && hidden) { header.classList.add("is-draw"); hidden = false; }
      }
      if (isPc()) { bar.style.transform = `translateY(${-shift}px)`; toggle.style.transform = `translateY(${-shift}px)`; }
      last = o;
    };
    if (smoother) rbSite.scrollHandlers.push(onScroll);
    else addEventListener("scroll", () => onScroll(), { passive: true });
    toggle.addEventListener("click", () => header.classList.toggle("is-open"));
    header.querySelectorAll(".rb-menu__list").forEach((ul) => ul.querySelectorAll("li").forEach((li, i) => li.style.setProperty("--i", i)));
    header.querySelectorAll(".rb-menu__sns a").forEach((a, i) => a.style.setProperty("--i", i));
  }

  // ── Each section-heading icon video starts at a different point ──
  document.querySelectorAll(".rb-head__icon video").forEach((v) => {
    const seek = () => { if (v.duration) v.currentTime = Math.random() * v.duration; v.removeEventListener("canplay", seek); };
    v.addEventListener("canplay", seek);
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelectorAll(".rb-head").forEach((h) => h.classList.add("is-appear"));
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Section name: rises from below when it reaches 80% of the screen, exits upward when passed, and rises again when scrolled back
    document.querySelectorAll(".rb-head").forEach((h) => {
      if (h.classList.contains("rb-head--page")) { addEventListener("rb:intro", () => h.classList.add("is-appear"), { once: true }); return; }
      ScrollTrigger.create({
        trigger: h, start: "top 80%", end: "bottom top",
        onEnter: () => { h.classList.remove("is-reverse"); h.classList.add("is-appear"); },
        onLeave: () => { h.classList.add("is-reverse"); h.classList.remove("is-appear"); },
      });
      ScrollTrigger.create({
        trigger: h, start: "top bottom", end: "bottom 10%",
        onEnterBack: () => h.classList.add("is-appear"),
        onLeaveBack: () => { h.classList.remove("is-reverse", "is-appear"); },
      });
    });

    // Photo parallax: yPercent 0 → 20 while the cell passes through the screen
    document.querySelectorAll(".rb-prlx").forEach((el) => {
      const trigger = isPc() && el.closest(".rb-sticky") ? el.closest(".rb-sticky") : el;
      gsap.fromTo(el.querySelectorAll(".rb-prlx__view"), { yPercent: 0 }, { yPercent: 20, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });

    // Pinned photo cell (pc): photo sticks at screen center until the section ends
    if (isPc()) document.querySelectorAll(".rb-sticky").forEach((box) => {
      const img = box.querySelector(".rb-sticky__img");
      if (img) ScrollTrigger.create({ trigger: img, start: "center center", endTrigger: box, end: () => "center+=" + (box.offsetHeight - img.offsetHeight) / 2 + " center", pin: true });
    });

    // Footer: on pc the content follows up from -50% into place
    const fc = document.querySelector(".rb-footer__container");
    if (fc && isPc()) {
      gsap.fromTo(fc.querySelector(".rb-footer__contents"), { yPercent: -50 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: fc, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
    }
  });

  // ── Project card carousel: arrows move one slot (39rem) at a time, the last slot only 21rem more ──
  document.querySelectorAll(".rb-carousel").forEach((c) => {
    const prev = c.querySelector(".rb-navbtn.is-prev"), next = c.querySelector(".rb-navbtn.is-next");
    const cards = c.querySelectorAll(".rb-card");
    const per = isPc() ? 3 : 1;
    let pos = 0;
    prev.classList.add("is-disabled");
    if (cards.length <= per) { next.classList.add("is-disabled"); return; }
    const set = () => {
      prev.classList.toggle("is-disabled", pos <= 0);
      next.classList.toggle("is-disabled", pos >= cards.length - per);
      c.classList.toggle("is-last", pos >= cards.length - per);
      c.style.setProperty("--pos", pos);
    };
    prev.addEventListener("click", () => { pos = Math.max(0, pos - 1); set(); });
    next.addEventListener("click", () => { pos = Math.min(cards.length - per, pos + 1); set(); });
  });

  // ── Photo slider: changes every 7s with a 1s overlap, and the ring around the current dot fills over 7 seconds. Pauses when offscreen ──
  document.querySelectorAll(".rb-slides").forEach((box) => {
    const slides = box.querySelectorAll(".rb-slides__slide");
    const pages = box.querySelectorAll(".rb-slides__page");
    if (!slides.length) return;
    let n = 1, t = 0, now = performance.now(), prevT = now, running = false, inView = false, raf = 0;
    const mark = () => pages.forEach((p, i) => p.classList.toggle("is-current", i === n - 1));
    const tick = () => {
      now = performance.now(); t += now - prevT; prevT = now;
      if (t > 7000) change();
      box.style.setProperty("--progress", Math.min(1, Math.max(0, t / 7000)));
      if (running && inView) raf = requestAnimationFrame(tick);
    };
    const change = (to) => {
      t = 0; running = false; cancelAnimationFrame(raf);
      let cur, old;
      if (Number.isInteger(to)) { n = Math.max(1, Math.min(slides.length, to)); cur = slides[n - 1]; old = [...slides].find((s) => s.classList.contains("is-active") && !s.classList.contains("is-past")); }
      else { n = n >= slides.length ? 1 : n + 1; cur = slides[n - 1]; old = slides[(n - 2 + slides.length) % slides.length]; }
      slides.forEach((s) => s.classList.remove("is-active", "is-past"));
      cur.classList.add("is-active");
      if (old && old !== cur) old.classList.add("is-past", "is-active");
      mark();
      box.classList.add("is-change");
      setTimeout(() => box.classList.remove("is-change"), 750);
      requestAnimationFrame(() => requestAnimationFrame(() => { now = prevT = performance.now(); running = true; box.style.setProperty("--progress", 0); tick(); }));
    };
    const enter = () => { if (inView) return; inView = true; now = prevT = performance.now(); box.classList.remove("is-out"); if (running) raf = requestAnimationFrame(tick); };
    const leave = () => { inView = false; box.classList.add("is-out"); };
    ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", onEnter: enter, onEnterBack: enter, onLeave: leave, onLeaveBack: leave });
    pages.forEach((p, i) => p.addEventListener("click", () => change(i + 1)));
    setTimeout(() => {
      running = !reduce; now = prevT = performance.now();
      if (!inView) box.classList.add("is-out");
      slides[0].classList.add("is-active");
      mark();
      if (running) tick();
    }, 500);
  });

  // ── Photo slider (careers office · detail): 90rem plates slide 93rem each in 1s with three clones at both ends ──
  document.querySelectorAll(".rb-gal").forEach((g) => {
    const track = g.querySelector(".rb-gal__track");
    const slides = [...track.querySelectorAll(".rb-gal__slide")];
    const pages = g.querySelectorAll(".rb-gal__page"), lines = g.querySelectorAll(".rb-gal__line");
    const step = () => (isPc() ? 93 : 34.5);
    const L = ["-66rem", "-159rem", "-252rem"], R = ["-93rem", "-186rem", "-279rem"];
    for (let k = 0; k < 3; k++) {
      const a = slides[Math.max(0, slides.length - 1 - k)].cloneNode(true); a.classList.add("is-clone"); a.style.left = isPc() ? L[k] : `calc(${-(k + 1) * 34.5}rem + 1.5rem)`; a.setAttribute("aria-hidden", "true"); track.prepend(a);
      const b = slides[Math.min(slides.length - 1, k)].cloneNode(true); b.classList.add("is-clone"); b.style.right = isPc() ? R[k] : `${-(k + 1) * 34.5}rem`; b.setAttribute("aria-hidden", "true"); track.append(b);
    }
    let at = 0, shown = 0;
    const mark = () => {
      g.dataset.position = at;
      pages.forEach((p, i) => p.classList.toggle("is-current", i === at));
      lines.forEach((p, i) => p.classList.toggle("is-current", i === at));
    };
    const go = (to) => {
      if (to === true) { shown = at + 1; at = (at + 1) % slides.length; }
      else if (to === false) { shown = at - 1; at = (at - 1 + slides.length) % slides.length; }
      else { at = Math.max(0, Math.min(slides.length - 1, to)); shown = at; }
      mark();
      track.style.transform = `translateX(${-step() * shown}rem)`;
    };
    track.addEventListener("transitionend", () => {
      if (shown === at) return;
      shown = at;
      track.classList.add("is-noduration");
      track.style.transform = `translateX(${-step() * at}rem)`;
      requestAnimationFrame(() => requestAnimationFrame(() => track.classList.remove("is-noduration")));
    });
    g.querySelector(".rb-gal__prev").addEventListener("click", () => go(false));
    g.querySelector(".rb-gal__next").addEventListener("click", () => go(true));
    pages.forEach((p, i) => p.addEventListener("click", () => go(i)));
    // Drag: follows only half the dragged distance and past 30px moves one slide
    const view = g.querySelector(".rb-gal__view");
    let x0 = 0, x1 = 0, down = false;
    view.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = true; x0 = x1 = e.clientX; track.classList.add("is-dragging"); });
    view.addEventListener("pointermove", (e) => { if (!down) return; x1 = e.clientX; track.style.transform = `translateX(calc(${-step() * at}rem + ${(x1 - x0) / 2}px))`; });
    const up = () => { if (!down) return; down = false; track.classList.remove("is-dragging"); if (Math.abs(x0 - x1) > 30) go(x0 > x1); else go(at); };
    view.addEventListener("pointerup", up);
    view.addEventListener("pointerleave", up);
    mark();
  });
  // Remeasure positions even if photos or fonts arrive late
  addEventListener("load", () => ScrollTrigger.refresh());
})();
