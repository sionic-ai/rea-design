// First page — original home: big words rise from below (first 1.2s, the rest .7s .06 apart power3.out), results line words (.55s .025, after 1.05+.12i),
// Showreel panel pin-shrink (pin-shrink-frame), the two lines of the Feel text rise with scroll (.5 power2.out .22 stagger → fades at .4) and photos flow at different speeds,
// Horizontal case strip (520vh pinned·scrub .6, swaps to the center card’s word), per-line company sentence and services list progress, selected work (Flip resize·one-slide push), slides (clip from below every 115vh, scrub .9)
(() => {
  const TW = window.TW, { q, qa } = TW;
  TW.start(() => {
    // Hero
    const words = qa(".tw-hero-line .tw-word");
    words.forEach((w) => { w.innerHTML = `<span style="display:inline-block">${w.textContent}</span>`; });
    const inner = words.map((w) => w.firstElementChild);
    const stats = qa(".tw-stat");
    stats.forEach((s) => { s.innerHTML = s.textContent.split(" ").map((t) => `<span class="tw-word"><span style="display:inline-block">${t}</span></span>`).join(" "); });
    // First-visit loader — logo letters come in and the curtain lifts, then the hero words rise (original home-loader-complete)
    const loader = q(".tw-loader");
    let introDelay = 0.2;
    // Arriving from another section, as in the original, skip the loader and raise the hero words directly
    if (loader && !TW.reduce && !TW.internal) {
      TW.lenis?.stop();
      const ch = qa(".tw-loader-ch", loader), logo = q(".tw-loader-logo", loader), target = q(".tw-logo");
      // Original home loader: letters .6s power3.out (.06 stagger) → .8s power3.inOut centered → at 2.4s the curtain lifts in .4s while the logo moves to the header logo spot in 1s power3.inOut
      const fly = () => {
        const a = logo.getBoundingClientRect(), b = target.getBoundingClientRect();
        return { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), scale: b.width / a.width };
      };
      gsap.timeline({ onComplete: () => { document.documentElement.classList.add("tw-loaded"); TW.lenis?.start(); } })
        .fromTo(ch, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 }, 0.6)
        .fromTo(logo, { x: 30 }, { x: 0, duration: 0.8, ease: "power3.inOut" }, 1.2)
        .to(loader, { backgroundColor: "transparent", duration: 0.4, ease: "power2.inOut" }, 2.4)
        .to(logo, { x: () => fly().x, y: () => fly().y, scale: () => fly().scale, duration: 1, ease: "power3.inOut" }, 2.4)
        .to(loader, { autoAlpha: 0, duration: 0.2 }, 3.3);
      introDelay = 2.6;
    } else loader?.remove();
    if (!TW.reduce) {
      gsap.set(inner, { yPercent: 105 });
      const tl = gsap.timeline({ delay: introDelay });
      tl.to(inner.slice(0, 2), { yPercent: 0, duration: 1.2, ease: "power3.out" }, 0)
        .to(inner.slice(2, 3), { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.3)
        .to(inner.slice(3, 6), { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.4)
        .to(inner.slice(6), { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0.45);
      stats.forEach((s, i) => {
        const ws = qa(".tw-word > span", s);
        gsap.set(ws, { yPercent: 100 });
        tl.to(ws, { yPercent: 0, duration: 0.55, stagger: 0.025, ease: "power3.out" }, 1.05 + 0.12 * i);
      });
    }

    // Feel section — two lines rise and fade out in turn as the section enters, photos move up at their own speeds
    const feel = q(".tw-feel");
    const feelLines = qa(".tw-feel-title .tw-mask > span", feel);
    if (!TW.reduce) {
      gsap.set(feelLines, { yPercent: 100 });
      gsap.timeline({ scrollTrigger: { trigger: feel, start: "top bottom", end: "top top", scrub: true } })
        .to(feelLines, { yPercent: 0, duration: 0.5, stagger: 0.22, ease: "power2.out" }, 0)
        .to(feelLines, { autoAlpha: 0.4, ease: "none", duration: 1 }, ">");
      qa(".tw-float-img", feel).forEach((im, i) => {
        gsap.fromTo(im, { y: 120 + i * 40 }, { y: -(160 + ((i * 53) % 220)), ease: "none", scrollTrigger: { trigger: feel, start: "top bottom", end: "bottom top", scrub: 0.5 } });
      });
    }

    // Horizontal work strip — in a pinned panel the card row flows left, and the word of the card that reaches center is swapped into the headline word
    const spec = q(".tw-spectrum"), track = q(".tw-spec-track", spec), cards = qa(".tw-spec-card", spec), word = q(".tw-spec-word", spec);
    let cur = -1;
    const swap = (k) => {
      if (k === cur) return;
      cur = k;
      const next = cards[k].dataset.word;
      if (TW.reduce) { word.textContent = next; return; }
      gsap.timeline().to(word, { yPercent: -105, duration: 0.065 * 4, ease: "power2.in" }).add(() => { word.textContent = next; }).fromTo(word, { yPercent: 105 }, { yPercent: 0, duration: 0.075 * 4, ease: "power2.out" });
    };
    if (!TW.reduce) {
      gsap.to(track, {
        x: () => -(track.scrollWidth - innerWidth * 0.5 - cards[cards.length - 1].offsetWidth / 2),
        ease: "none",
        scrollTrigger: {
          trigger: spec, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: (st) => swap(Math.min(cards.length - 1, Math.round(st.progress * (cards.length - 1)))),
        },
      });
    }

    // Selected work — in two-card rows the hovered card grows to 1020:724 and returns to its original shape when the cursor leaves the row (Flip .58s power4.out, column and photo together).
    // So row height doesn’t surge when the big side changes, set the row min-height to the big card photo height + text height as in the original
    if (window.Flip) gsap.registerPlugin(Flip);
    qa(".tw-sw-row").forEach((row) => {
      const sides = qa(".tw-sw-side", row), medias = qa(".tw-sw-media", row);
      const fit = () => {
        if (TW.mobile) { row.style.minHeight = ""; return; }
        const big = (row.clientWidth - 16) * 1020 / 1744, cap = Math.max(...qa(".tw-sw-cap", row).map((c) => c.offsetHeight + 12));
        row.style.minHeight = `${big / 1.6 + cap}px`;
      };
      fit();
      new ResizeObserver(fit).observe(row);
      const set = (side) => {
        const next = side || row.dataset.start;
        if (row.dataset.big === next) return;
        const state = !TW.reduce && window.Flip ? Flip.getState([...sides, ...medias]) : null;
        row.dataset.big = next;
        if (state) Flip.from(state, { duration: 0.58, ease: "power4.out", nested: true, prune: true, overwrite: true });
      };
      sides.forEach((s) => q(".tw-sw-hit", s).addEventListener("mouseenter", () => set(s.dataset.side)));
      row.addEventListener("mouseleave", () => set(null));
    });
    // One-card row — on hover the card shifts left by 16% of the row width (.58s power4.out)
    qa(".tw-sw-solo").forEach((row) => {
      const card = q(".tw-sw-slide", row), d = TW.reduce ? 0 : 0.58;
      row.addEventListener("mouseenter", () => gsap.to(card, { x: -0.16 * row.clientWidth, duration: d, ease: "power4.out", overwrite: "auto" }));
      row.addEventListener("mouseleave", () => gsap.to(card, { x: 0, duration: d, ease: "power4.out", overwrite: "auto" }));
    });

    // What we do — one line at a time darkens as the list passes the screen
    const svcs = qa(".tw-svc");
    ScrollTrigger.create({
      trigger: q(".tw-svc-wrap"), start: "top 70%", end: "bottom 30%",
      onUpdate: (st) => { const k = Math.min(svcs.length - 1, Math.floor(st.progress * svcs.length)); svcs.forEach((s, i) => s.classList.toggle("is-active", i === k)); },
    });

    // News strip: original HomeCategoryShowcase, photo height = Panel height − head − band top margin − bottom margin − 40 (min 240), card width = Design width × height / 592.
    // When the strip reaches 50% of the screen, photos fade in from .96x and transparent in sequence (.1 gap) over .85s power3.out. Dragging scrolls sideways (sensitivity 1.6 · damping .1) and the inner photo shifts ±8% by its distance from the strip center
    const nb = q(".tw-newsband");
    if (nb) {
      const head = q(".tw-nb-head", nb), strip = q(".tw-nb-strip", nb), track = q(".tw-nb-track", nb), cards = qa(".tw-nb-card", nb), pars = qa(".tw-media", track);
      let target = 0, cur = 0, max = 0, raf = 0, last = 0, down = false, moved = false, axis = "", sx = 0, sy = 0, s0 = 0;
      const clamp = (v) => Math.max(0, Math.min(max, v));
      const bounds = () => { max = Math.max(0, track.scrollWidth - strip.clientWidth); target = clamp(target); cur = clamp(cur); };
      const paint = () => {
        track.style.transform = `translate3d(${-cur}px,0,0)`;
        const r0 = strip.getBoundingClientRect(), mid = r0.left + r0.width / 2, half = r0.width / 2;
        pars.forEach((p) => { const r = p.parentElement.getBoundingClientRect(); p.style.transform = `translateX(${Math.max(-8, Math.min(8, -((r.left + r.width / 2 - mid) / half) * 8))}%)`; });
      };
      const size = () => {
        if (!TW.mobile) {
          const cs = getComputedStyle(strip);
          const h = Math.max(240, Math.round(nb.clientHeight - head.getBoundingClientRect().height - parseFloat(cs.marginTop) - parseFloat(cs.paddingBottom) - 40));
          nb.style.setProperty("--nb-h", `${h}px`);
          cards.forEach((c) => { c.style.width = `${(c.dataset.w * h) / 592}px`; });
        }
        bounds();
        paint();
      };
      const tick = (t) => {
        const dt = last ? (t - last) / 1000 : 1 / 60;
        last = t;
        cur += (target - cur) * (1 - Math.pow(0.9, 60 * dt));
        if (Math.abs(target - cur) < 0.1) cur = target;
        paint();
        if (cur !== target || down) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
      };
      strip.addEventListener("pointerdown", (e) => { if (max <= 0 || (e.pointerType === "mouse" && e.button !== 0)) return; down = true; moved = false; axis = ""; sx = e.clientX; sy = e.clientY; s0 = target; });
      strip.addEventListener("pointermove", (e) => {
        if (!down) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!axis) {
          if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
          moved = true;
          axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
          if (axis === "x") { strip.setPointerCapture?.(e.pointerId); strip.style.cursor = "grabbing"; }
        }
        if (axis !== "x") return;
        e.preventDefault();
        const v = clamp(s0 - dx * 1.6);
        if (v !== target) { target = v; if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }
      }, { passive: false });
      const up = (e) => { if (!down) return; down = false; if (axis === "x") { strip.releasePointerCapture?.(e.pointerId); strip.style.cursor = ""; } };
      addEventListener("pointerup", up);
      strip.addEventListener("pointercancel", up);
      strip.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      strip.addEventListener("dragstart", (e) => e.preventDefault());
      size();
      new ResizeObserver(size).observe(nb);
      if (!TW.reduce) gsap.fromTo(qa(".tw-nb-media", nb), { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.85, ease: "power3.out", stagger: { each: 0.1, from: "start" }, scrollTrigger: { trigger: strip, start: TW.mobile ? "top 86%" : "top 50%", toggleActions: "play none none reverse" } });
    }

    // Slides — from the second on, each is covered from below with clip (115vh per slide, scrub .9)
    qa(".tw-slides").forEach((wrap) => {
      const ss = qa(".tw-slide", wrap);
      if (TW.reduce || ss.length < 2) return;
      gsap.set(wrap, { height: `${100 + 115 * (ss.length - 1)}vh` });
      ss.forEach((s, i) => { gsap.set(s, { position: "absolute", top: 0, left: 0, width: "100%", zIndex: i }); if (i) gsap.set(s, { clipPath: "inset(100% 0 0 0)" }); });
      const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top top", end: "bottom bottom", scrub: 0.9, pin: false } });
      const stage = document.createElement("div");
      stage.style.cssText = "position:sticky;top:0;height:100vh;overflow:hidden";
      wrap.prepend(stage);
      ss.forEach((s) => stage.append(s));
      ss.forEach((s, i) => { if (i) tl.to(s, { clipPath: "inset(0% 0 0 0)", ease: "power3.in", duration: 1 }, i - 1).fromTo(q(".tw-slide-copy", s), { yPercent: 30, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "expo.out" }, i - 0.4); });
    });
  });
})();
