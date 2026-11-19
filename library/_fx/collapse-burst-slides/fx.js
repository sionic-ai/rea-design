(() => {
  // When slides change, the current section’s pieces get sucked toward the panel center, shrink and vanish, the panel color changes, then the next section’s pieces burst out of the center and settle in place.
  // The original uses embla (fade, autoplay) only for the order and 5s auto advance and draws the motion with GSAP — if embla is present it is used as is, otherwise the same order is counted by hand
  kfFx.register("collapse-burst-slides", (el, { options, reduce }) => {
    const viewport = el.querySelector('[data-fx-part="viewport"]');
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!viewport || slides.length === 0) return;
    const disc = el.querySelector('[data-fx-part="disc"]');
    const prev = el.querySelector('[data-fx-part="prev"]');
    const next = el.querySelector('[data-fx-part="next"]');
    const controls = el.querySelector('[data-fx-part="controls"]');
    const dotsBox = el.querySelector('[data-fx-part="dots"]');
    const ac = new AbortController();
    const delayMs = 1000 * +(options.delay ?? 5);
    const outDur = +(options.out ?? 0.4), shrink = +(options.shrink ?? 0.5), inDur = +(options.in ?? 1.5), tint = +(options.tint ?? 0.45);
    const outEase = kfFx.ease(options["out-ease"] || "power2.in", "power2.in");
    const inEase = kfFx.ease(options["in-ease"] || "power4.out", "power4.out");
    const pieces = (s) => [...s.querySelectorAll('[data-fx-part="piece"]')];
    const colorOf = (s) => getComputedStyle(s).getPropertyValue("--fx-disc").trim();
    const center = () => { const r = (options.center === "disc" && disc ? disc : el).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
    const toCenter = (p) => { const c = center(), r = p.getBoundingClientRect(); return { x: c.x - (r.left + r.width / 2), y: c.y - (r.top + r.height / 2) }; };
    let current = 0, busy = false, tl = null, raf = 0, playing = false;

    slides.forEach((s, i) => gsap.set(s, i === 0 ? { opacity: 1, visibility: "visible", zIndex: 1 } : { opacity: 0, visibility: "hidden", zIndex: 0 }));
    // Colors are passed along with skin variables (including oklch relative colors), so they are painted with CSS transitions instead of GSAP — original .45s default curve (power1.out)
    const paintDisc = (i, dur) => {
      const c = colorOf(slides[i]);
      if (!disc || !c) return;
      disc.style.transition = dur ? `background-color ${dur}s cubic-bezier(.25,.46,.45,.94)` : "none";
      disc.style.backgroundColor = c;
    };
    paintDisc(0, 0);

    // Dots — the current section’s dot widens to 24px and a bar fills with the time left until auto advance
    const dots = dotsBox && slides.length > 1 ? slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "fx-cbs-dot"; b.setAttribute("aria-label", `${i + 1}To section number`);
      dotsBox.append(b);
      b.addEventListener("click", () => go(i), { signal: ac.signal });
      return b;
    }) : [];
    let dotAt = 0;
    // The progress bar is newly attached only to the current dot while autoplay runs (the original draws a fresh bar element on the chosen dot).
    const placeBar = () => {
      dots.forEach((d) => d.querySelector(".fx-cbs-dot__bar")?.remove());
      if (!playing || !dots[dotAt]) return;
      const bar = document.createElement("span"); bar.className = "fx-cbs-dot__bar"; dots[dotAt].append(bar);
    };
    const markDots = () => { dots.forEach((d, i) => { d.classList.toggle("is-on", i === dotAt); d.toggleAttribute("aria-current", i === dotAt); }); placeBar(); };
    markDots();

    // embla handles only order and auto-advance — length 0, no drag, loop, fade keeps the slides in place
    const auto = window.EmblaCarouselAutoplay ? EmblaCarouselAutoplay({ delay: delayMs, stopOnInteraction: false, playOnInit: false, stopOnMouseEnter: false, stopOnFocusIn: false }) : null;
    const embla = window.EmblaCarousel ? EmblaCarousel(viewport, { loop: true, duration: 0, watchDrag: false, container: viewport.querySelector('[data-fx-part="track"]') || null }, [window.EmblaCarouselFade ? EmblaCarouselFade() : null, auto].filter(Boolean)) : null;
    let timer = 0, due = 0;
    const left = () => (auto && auto.timeUntilNext ? auto.timeUntilNext() : (playing ? Math.max(0, due - performance.now()) : null));
    const tick = () => {
      const bar = dots[dotAt]?.querySelector(".fx-cbs-dot__bar");
      const t = left();
      if (bar) bar.style.width = t == null ? "0%" : `${100 * Math.max(0, Math.min(1, 1 - t / delayMs))}%`;
      raf = requestAnimationFrame(tick);
    };
    const play = () => {
      if (reduce || slides.length < 2) return;
      playing = true;
      placeBar();
      if (auto) auto.play(); else { clearTimeout(timer); due = performance.now() + delayMs; timer = setTimeout(() => go(current + 1), delayMs); }
    };
    const resetTimer = () => { if (!playing) return; if (auto) auto.reset(); else play(); };

    function swap(from, to) {
      tl?.kill();
      const a = slides[from], b = slides[to], outs = pieces(a), ins = pieces(b);
      busy = true;
      // A dot moves the moment it’s picked (original selection index). Only the base disc’s color and events get pulled in afterward
      dotAt = to; markDots();
      gsap.killTweensOf([...outs, ...ins]);
      gsap.set(b, { opacity: 1, visibility: "visible", zIndex: 1, x: 0, y: 0 });
      gsap.set(a, { opacity: 1, visibility: "visible", zIndex: 2, x: 0, y: 0 });
      const outTo = outs.map(toCenter);
      gsap.set(ins, { x: 0, y: 0, scale: 1 });
      const inFrom = ins.map(toCenter);
      const done = (all) => {
        gsap.set(a, { opacity: 0, visibility: "hidden", pointerEvents: "none", zIndex: 0, clearProps: "x,y" });
        gsap.set(outs, { clearProps: "x,y,scale,opacity" });
        gsap.set(b, { clearProps: "zIndex,pointerEvents" });
        if (all) gsap.set(ins, { opacity: 1, clearProps: "x,y,scale" });
        tl = null; busy = false;
      };
      tl = gsap.timeline({ onComplete: () => done(true), onInterrupt: () => done(false) });
      outs.forEach((p, i) => tl.to(p, { x: outTo[i].x, y: outTo[i].y, scale: shrink, opacity: 0, duration: outDur, ease: outEase }, 0));
      tl.call(() => { current = to; paintDisc(to, tint); el.dispatchEvent(new CustomEvent("fx:slide", { bubbles: true, detail: { index: to } })); }, null, outDur);
      ins.forEach((p, i) => tl.fromTo(p, { x: inFrom[i].x, y: inFrom[i].y, scale: shrink, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: +(p.dataset.dur || inDur), ease: inEase, immediateRender: true }, +(p.dataset.delay || 0.2)));
      // Accepts the next press once the last piece has 1.5s left
      tl.call(() => { busy = false; }, null, Math.max(0, tl.duration() - inDur));
    }
    function go(i) {
      if (busy || slides.length < 2) return;
      const to = ((i % slides.length) + slides.length) % slides.length;
      if (to === current) return;
      if (embla) embla.scrollTo(to, true); else { swap(current, to); }
      resetTimer();
    }
    if (embla) embla.on("select", () => { const to = embla.selectedScrollSnap(); if (to !== current) { if (reduce) { gsap.set(slides[current], { opacity: 0, visibility: "hidden" }); gsap.set(slides[to], { opacity: 1, visibility: "visible", x: 0 }); current = to; dotAt = to; markDots(); paintDisc(to, 0); } else swap(current, to); } });
    prev?.addEventListener("click", () => prev.classList.contains("fx-cbs-locked") || go(current - 1), { signal: ac.signal });
    next?.addEventListener("click", () => next.classList.contains("fx-cbs-locked") || go(current + 1), { signal: ac.signal });
    if (!auto) el.addEventListener("fx:slide", () => { if (playing) { due = performance.now() + delayMs; clearTimeout(timer); timer = setTimeout(() => go(current + 1), delayMs); } }, { signal: ac.signal });

    // First entrance — first-section pieces burst from the center at 0x (after data-in seconds), and the button group grows while rotating -20° and shows in the last 1 second
    let intro = null;
    // When opening right away without a loader (fx:play {quick: true} or when start is not event) pieces come .4s earlier (min .2s) · the panel grows from .8x · the head at .65s
    // While the first entrance plays, dots are disabled and arrow buttons ignore presses (original fvAnimationActive)
    const lock = (on) => { dots.forEach((d) => { d.disabled = on; }); [prev, next].forEach((b) => b && b.classList.toggle("fx-cbs-locked", on)); };
    const reveal = (e) => {
      const quick = options.start !== "event" || !!e?.detail?.quick;
      const shift = quick ? +(options["quick-shift"] ?? 0.4) : 0;
      const at = (v) => (shift ? Math.max(0.2, v - shift) : v);
      if (reduce) { el.dispatchEvent(new CustomEvent("fx:reveal", { bubbles: true })); play(); return; }
      lock(true);
      intro = gsap.timeline({ onComplete: () => { lock(false); el.dispatchEvent(new CustomEvent("fx:settled", { bubbles: true })); play(); } });
      const grow = quick ? +(options.grow ?? 0.8) : 0;
      if (disc && grow) intro.fromTo(disc, { scale: grow }, { scale: 1, duration: 1.5, ease: "power4.out", clearProps: "transform" }, 0);
      const first = pieces(slides[0]);
      const from = first.map(toCenter);
      first.forEach((p, i) => intro.fromTo(p, { x: from[i].x, y: from[i].y, scale: 0, opacity: 1 }, { x: 0, y: 0, scale: 1, duration: +(p.dataset.inDur || p.dataset.dur || 1.5), ease: "power4.out" }, at(+(p.dataset.in ?? 0.6))));
      if (controls) {
        const c = toCenter(controls), from = at(+(controls.dataset.in ?? 1)), d = +(controls.dataset.dur ?? 1.8), show = Math.min(1, 0.99 * d);
        intro.fromTo(controls, { x: c.x, y: c.y, rotation: -20, scale: 0, opacity: 0 }, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 0, duration: d, ease: "power4.out" }, from);
        intro.to(controls, { opacity: 1, duration: show, ease: "power2.out" }, from + d - show);
      }
      intro.call(() => el.dispatchEvent(new CustomEvent("fx:reveal", { bubbles: true })), null, quick ? +(options["quick-reveal"] ?? 0.65) : +(options.reveal ?? 1.2));
    };
    if (options.start === "event") {
      gsap.set(pieces(slides[0]), { scale: 0 });
      if (controls) gsap.set(controls, { opacity: 0 });
      el.addEventListener("fx:play", reveal, { once: true, signal: ac.signal });
    } else reveal();
    if (dots.length) raf = requestAnimationFrame(tick);

    return () => {
      ac.abort(); cancelAnimationFrame(raf); clearTimeout(timer);
      tl?.kill(); intro?.kill(); embla?.destroy();
      dots.forEach((d) => d.remove());
      gsap.set([...slides, ...slides.flatMap(pieces), disc, controls].filter(Boolean), { clearProps: "all" });
      if (disc) { disc.style.transition = ""; disc.style.backgroundColor = ""; }
    };
  });
})();
