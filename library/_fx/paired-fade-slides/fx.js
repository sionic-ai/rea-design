(() => {
  // Slides stacked in the same spot swap by overlapping in turn — the incoming slide waits transparent shift% to the right, then fades on and slides into place over dur,
  // Hide the outgoing panel once everything is on. Pair panel (pair, data-key = Board number) changes at the same instant — art bundled with the board, like a marker on a map.
  kfFx.register("paired-fade-slides", (el, { options, reduce, hover }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length || !window.gsap) return;
    const pairs = [...el.querySelectorAll('[data-fx-part="pair"]')];
    const dotsBox = el.querySelector('[data-fx-part="dots"]');
    const dur = +(options.dur ?? 520) / 1000;
    const shift = +(options.shift ?? 4);
    const interval = +(options.interval ?? 5200);
    const fadeEase = kfFx.ease(options.ease || "0.455,0.03,0.515,0.955", "power1.inOut");
    const shiftEase = kfFx.ease(options["shift-ease"] || "0.25,0.46,0.45,0.94", "power1.out");
    let now = 0, busy = false, timer = 0;
    const dots = [];
    if (dotsBox && slides.length > 1) {
      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `${i + 1}th Edition`);
        b.addEventListener("click", () => go(i));
        dotsBox.append(b);
        dots.push(b);
      });
    }
    const mark = (i) => {
      slides.forEach((s, j) => s.toggleAttribute("data-on", j === i));
      pairs.forEach((p) => { p.toggleAttribute("data-on", +p.dataset.key === i); p.toggleAttribute("data-off", +p.dataset.key !== i); });
      dots.forEach((d, j) => (j === i ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current")));
    };
    gsap.set(slides, { autoAlpha: 0, zIndex: 0 });
    gsap.set(slides[0], { autoAlpha: 1 });
    mark(0);
    const schedule = () => {
      clearTimeout(timer);
      if (!reduce && slides.length > 1 && interval > 0) timer = setTimeout(() => go(now + 1), interval);
    };
    function go(to) {
      to = (to + slides.length) % slides.length;
      if (busy || to === now) return;
      busy = true;
      const from = now, inn = slides[to], out = slides[from];
      mark(to);
      el.dispatchEvent(new CustomEvent("fx:change", { detail: { index: to } }));
      gsap.set(inn, { zIndex: 5, autoAlpha: 0, xPercent: reduce ? 0 : shift });
      gsap.to(inn, { autoAlpha: 1, duration: reduce ? 0 : dur, ease: fadeEase });
      gsap.to(inn, { xPercent: 0, duration: reduce ? 0 : dur, ease: shiftEase, onComplete: () => {
        gsap.set(out, { autoAlpha: 0 });
        gsap.set(inn, { zIndex: 0 });
        now = to; busy = false;
      } });
      schedule();
    }
    let sx = null;
    const down = (e) => { if (e.pointerType !== "mouse") sx = e.clientX; };
    const up = (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) go(now + (dx < 0 ? 1 : -1));
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    // Prev/next buttons, clicking the panel goes to next (click: next), and advancing from outside with fx:go(detail.index) — for syncing with the preview row below
    const prevB = el.querySelector('[data-fx-part="prev"]');
    const nextB = el.querySelector('[data-fx-part="next"]');
    const stage = el.querySelector('[data-fx-part="stage"]');
    const onPrev = (e) => { e.preventDefault(); go(now - 1); };
    const onNext = (e) => { e.preventDefault(); go(now + 1); };
    const onStage = () => go(now + 1);
    const onGo = (e) => go(+(e.detail && e.detail.index) || 0);
    prevB && prevB.addEventListener("click", onPrev);
    nextB && nextB.addEventListener("click", onNext);
    if (stage && options.click === "next") stage.addEventListener("click", onStage);
    el.addEventListener("fx:go", onGo);
    const vis = () => (document.hidden ? clearTimeout(timer) : schedule());
    document.addEventListener("visibilitychange", vis);
    schedule();
    return () => {
      clearTimeout(timer);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointerup", up);
      prevB && prevB.removeEventListener("click", onPrev);
      nextB && nextB.removeEventListener("click", onNext);
      stage && stage.removeEventListener("click", onStage);
      el.removeEventListener("fx:go", onGo);
      document.removeEventListener("visibilitychange", vis);
      gsap.killTweensOf(slides);
      gsap.set(slides, { clearProps: "opacity,visibility,zIndex,transform" });
      dots.forEach((d) => d.remove());
      slides.forEach((s) => s.removeAttribute("data-on"));
      pairs.forEach((p) => { p.removeAttribute("data-on"); p.removeAttribute("data-off"); });
    };
  });
})();
