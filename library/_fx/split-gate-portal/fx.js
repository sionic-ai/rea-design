// Split door covering the screen — on open the wordmark rises and the door leaves unfold from a small panel, the hovered door widens and photos bloom in turn in the small center window.
// Pressing the door fades the branching doors while the page behind unfolds from a single point at the center (original values as-is)
(() => {
  kfFx.register("split-gate-portal", (el, { options, reduce, hover }) => {
    const doors = [...el.querySelectorAll('[data-fx-part="door"]')];
    if (!doors.length) return;
    const parts = (n, root = el) => [...root.querySelectorAll(`[data-fx-part="${n}"]`)];
    const dur = +(options.dur ?? 2.4), cycle = +(options.cycle ?? 1.8), fade = +(options.fade ?? 0.8), tilt = +(options.tilt ?? 15);
    const stack = +options.stack || 767;
    const mobile = innerWidth <= stack;
    const target = options.target ? document.querySelector(options.target) : null;
    const brand = el.querySelector('[data-fx-part="brand"]');
    const glyphs = parts("glyph"), inners = parts("inner"), bgs = parts("bg"), labels = parts("label");
    const bgMedia = bgs.map((b) => b.firstElementChild).filter(Boolean);
    const shut = "inset(90% 91% 92% 93%)";
    const k = reduce ? 0 : 1;

    if (target) gsap.set(target, { height: "100svh", overflow: "hidden" });

    const intro = gsap.timeline({ defaults: { duration: (dur / 2) * k, ease: "power4.out" } });
    if (glyphs.length) intro.from(glyphs, { yPercent: 100, stagger: 0.03 * k }, 0);
    if (brand) intro.from(brand, { y: () => innerHeight * 0.4, ease: "expo.inOut", duration: dur * k }, `<+=${0.4 * k}`);
    if (inners.length) intro.from(inners, { scale: 0.4, yPercent: (i) => (i === 0 ? 50 : -40) * (mobile ? -1 : 1), duration: dur * k, ease: "expo.inOut" }, `<+=${0.2 * k}`);
    if (bgs.length) intro.from(bgs, { clipPath: shut, duration: dur * k, ease: "power4.inOut" }, `<-=${0.15 * k}`);
    if (bgMedia.length) intro.from(bgMedia, { scale: 1.3, duration: dur * k }, "<");
    if (labels.length) intro.from(labels, { yPercent: 250, stagger: 0.3 * k }, `<+=${1 * k}`);

    let peek = null, shots = [];
    const enter = (e) => {
      const door = e.currentTarget;
      peek = door.querySelector('[data-fx-part="peek"]');
      if (!peek) return;
      shots = [...peek.children];
      let z = 0;
      shots.forEach((s) => (s.style.zIndex = z++));
      door.fxTl?.kill();
      gsap.killTweensOf(peek);
      gsap.killTweensOf(shots);
      const t = (door.fxTl = gsap.timeline({ defaults: { duration: cycle, ease: "expo.out" } }));
      t.to(peek, { clipPath: "inset(0% 0% 0% 0%)" });
      t.to(peek, { rotate: 0, opacity: 1 }, "<");
      if (shots.length)
        t.fromTo(shots, { scale: 0 }, { scale: 1.0003, stagger: { each: cycle / shots.length, repeat: -1, onRepeat() { this.targets()[0].style.zIndex = z++; } } }, "<");
    };
    const leave = (e) => {
      const door = e.currentTarget;
      if (!peek) return;
      gsap.to(peek, { clipPath: shut, opacity: 0, rotate: gsap.utils.random(-tilt, tilt), duration: (cycle * 2) / 3, ease: "expo.out", onComplete: () => door.fxTl?.kill() });
    };

    let busy = false, closed = false, reveal = null;
    const open = (e) => {
      const door = e.currentTarget, href = door.getAttribute("href");
      if (href && href !== "#") return;
      e.preventDefault();
      if (busy) return;
      busy = true;
      // Original places the unfold 0.8s ahead of the blur (negative timeline position), so at the moment of press the unfold starts already 1/3 along.
      // Depending on the GSAP build, negative positions get pushed forward, so the spread sits at 0 and starts after 0.8s (lead) — for the caller, the moment of press is detail.at
      const lead = 0.8 * k;
      reveal = gsap.timeline({
        paused: true,
        defaults: { duration: dur * k, ease: "expo.inOut" },
        onComplete: () => { closed = true; el.dispatchEvent(new CustomEvent("fx:closed", { bubbles: true })); el.remove(); },
      });
      reveal.to(el, { opacity: 0, duration: fade * k, ease: "expo.out" }, lead);
      const opened = () => {
        if (target) gsap.set(target, { clearProps: "height,overflow" });
        el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
      };
      if (target) reveal.from(target, { clipPath: "inset(50% 50% 50% 50%)", onComplete: opened }, 0);
      else reveal.call(opened, [], lead + fade * k);
      // The caller adds the Hero entrance to the same timeline and then plays it — in the original, the fork door blur, page unfolding and Hero entrance are one timeline
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true, detail: { tl: reveal, at: lead, door, index: doors.indexOf(door), reduce } }));
      reveal.play(lead);
    };

    doors.forEach((d) => {
      d.addEventListener("click", open);
      if (hover && !mobile && !reduce) { d.addEventListener("mouseenter", enter); d.addEventListener("mouseleave", leave); }
    });
    return () => {
      doors.forEach((d) => {
        d.removeEventListener("click", open);
        d.removeEventListener("mouseenter", enter);
        d.removeEventListener("mouseleave", leave);
        d.fxTl?.kill();
      });
      intro.revert();
      if (peek) gsap.killTweensOf(peek);
      if (shots.length) gsap.killTweensOf(shots);
      // When it finishes opening and exits on its own, leave the expanded page as is
      if (closed) return;
      reveal?.revert();
      if (target) gsap.set(target, { clearProps: "height,overflow,clipPath" });
    };
  });
})();
