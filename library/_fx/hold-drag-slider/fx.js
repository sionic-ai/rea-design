// A slider you drag to flip through card rows — on press cards are squeezed to .95 spreading out from the pressed card, and while dragging the row moves at 1.3x the hand movement
// Follows .6s late (at both ends only up to 1/10 of the window width), and if dragged over 80px on release it advances one slot. On mouse the round cursor follows .6s late and
// On press the HOLD text turns into two arrows. Links inside the card open only when released at the pressed spot, without dragging
(() => {
  kfFx.register("hold-drag-slider", (el, { options, reduce, hover }) => {
    const slip = el.querySelector('[data-fx-part="slip"]'), track = el.querySelector('[data-fx-part="track"]');
    const slides = track ? [...track.querySelectorAll('[data-fx-part="slide"]')] : [];
    if (!slip || !track || !slides.length) return;
    const cursor = el.querySelector('[data-fx-part="cursor"]');
    const limit = +(options.threshold ?? 80), follow = +(options.follow ?? 1.3), dur = +(options.dur ?? 0.6), press = +(options.press ?? 0.95);
    const fixedBound = options.bound != null ? +options.bound : null;
    const bound = () => (fixedBound ?? Math.trunc(innerWidth / 10));
    const ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    const t = reduce ? 0 : dur;
    let index = 0, pressX = 0, releaseX = 0, slipX = 0, frame = 0, tick = false, down = false;

    const lastIndex = () => Math.max(0, slides.length - Math.round(el.clientWidth / (slides[0].clientWidth || 1)));
    const lastPosition = () => { const w = track.clientWidth || 1; return Math.trunc(((w - track.scrollWidth) / w) * 1e4) / 100; };
    const moveSlip = () => gsap.to(slip, { x: slipX, duration: t, ease, overwrite: "auto" });
    const change = (moved, dir) => {
      if (moved) index = Math.max(0, Math.min(lastIndex(), index + dir));
      let x = 0;
      if (index >= lastIndex() && index > 0) x = lastPosition();
      else if (index > 0) { let px = 0; for (let i = 0; i < index; i++) px -= slides[i].clientWidth; x = Math.trunc((px / (track.clientWidth || 1)) * 1e4) / 100; }
      gsap.to(track, { xPercent: x, duration: t, ease, overwrite: "auto" });
      moveSlip();
    };

    const qx = cursor && hover ? gsap.quickTo(cursor, "x", { duration: 0.6, ease: "power3" }) : null;
    const qy = cursor && hover ? gsap.quickTo(cursor, "y", { duration: 0.6, ease: "power3" }) : null;
    if (qx) { gsap.set(cursor, { xPercent: -50, yPercent: -50 }); cursor.dataset.state = "show"; }

    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.pointerType === "mouse") e.preventDefault();
      down = true;
      pressX = releaseX = e.clientX;
      // Capture on the pressed element so click goes to that link on release (capturing on the whole element stops links from opening)
      e.target.setPointerCapture?.(e.pointerId);
      if (cursor) cursor.dataset.press = "down";
      const from = Math.max(0, slides.findIndex((s) => s.contains(e.target)));
      if (!reduce) gsap.to(slides, { scale: press, duration: 0.3, ease: "power1.inOut", stagger: { amount: 0.25, from }, overwrite: "auto" });
    };
    const onUp = (e) => {
      if (!down) return;
      down = false;
      releaseX = e.clientX;
      slipX = 0;
      const moved = Math.abs(pressX - releaseX) > limit;
      change(moved, moved ? (releaseX > pressX ? -1 : 1) : 0);
      if (cursor) delete cursor.dataset.press;
      if (!reduce) gsap.to(slides, { scale: 1, duration: 0.3, ease: "power1.inOut", overwrite: "auto" });
    };
    const onMove = (e) => {
      qx?.(e.clientX); qy?.(e.clientY);
      if (!down || tick) return;
      tick = true;
      const dx = e.movementX;
      requestAnimationFrame(() => {
        tick = false;
        // As in the original, rest once every two frames so the drag lags one tempo behind the hand
        if (++frame % 2 === 0) return;
        slipX += follow * dx;
        if (index === 0) slipX = Math.min(bound(), slipX);
        if (index === lastIndex()) slipX = Math.max(-bound(), slipX);
        moveSlip();
      });
    };
    const onEnter = () => cursor && qx && gsap.to(cursor, { opacity: 1 });
    const onLeave = () => cursor && qx && gsap.to(cursor, { opacity: 0 });
    // A link released after dragging does not open
    const onClick = (e) => { if (Math.abs(pressX - releaseX) > 3) { e.preventDefault(); e.stopPropagation(); } };
    const onResize = () => change(false, 0);

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointermove", onMove);
    track.addEventListener("pointerenter", onEnter);
    track.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onClick, true);
    addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointermove", onMove);
      track.removeEventListener("pointerenter", onEnter);
      track.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("click", onClick, true);
      removeEventListener("resize", onResize);
      gsap.killTweensOf([slip, track, ...slides]);
      gsap.set([slip, track, ...slides], { clearProps: "transform" });
      if (cursor) { gsap.killTweensOf(cursor); gsap.set(cursor, { clearProps: "all" }); delete cursor.dataset.state; delete cursor.dataset.press; }
    };
  });
})();
