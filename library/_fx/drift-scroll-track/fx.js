(() => {
  // Original initHistory: pushes scrollLeft directly so it shares the same position as manual scrolling of the horizontal panel — one loop is the distance between the cloned first cell and the original first cell
  kfFx.register("drift-scroll-track", (el, { options, reduce, hover }) => {
    const own = [...el.querySelectorAll(':scope > [data-fx-part="item"]')];
    const originals = own.length ? own : [...el.children];
    if (!originals.length) return;
    const rate = +(options.rate ?? 22) / 1000, restMs = +(options.rest ?? 4) * 1000, step = +(options.step ?? 280);
    const copies = originals.map((item) => {
      const c = item.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.removeAttribute("id");
      c.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
      c.querySelectorAll("a,button,input,[tabindex]").forEach((n) => n.setAttribute("tabindex", "-1"));
      c.dataset.fxClone = "";
      el.append(c);
      return c;
    });
    let hovered = false, held = false, dragging = false, until = 0, period = 0, pos = 0, last = 0, startX = 0, startScroll = 0, visible = false, raf = 0;
    const measure = () => { period = copies[0].offsetLeft - originals[0].offsetLeft; pos = el.scrollLeft; };
    const move = (x) => { if (period > 0) { pos = ((x % period) + period) % period; el.scrollLeft = pos; } };
    const rest = () => (until = performance.now() + restMs);
    const enter = (e) => e.pointerType === "mouse" && (hovered = true);
    const leave = (e) => e.pointerType === "mouse" && (hovered = false);
    const down = (e) => {
      held = true; rest();
      if (!hover || e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true; startX = e.clientX; startScroll = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-fx-dragging");
    };
    const drag = (e) => dragging && move(startScroll + startX - e.clientX);
    const up = (e) => {
      held = false; dragging = false; rest();
      el.classList.remove("is-fx-dragging");
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const key = (e) => { if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return; e.preventDefault(); rest(); move(el.scrollLeft + (e.key === "ArrowRight" ? step : -step)); };
    const scrolled = () => { if (!dragging) pos = el.scrollLeft; };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", drag);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", key);
    el.addEventListener("scroll", scrolled, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    originals.forEach((o) => ro.observe(o));
    const io = new IntersectionObserver((en) => (visible = en[0].isIntersecting));
    io.observe(el);
    measure();
    const tick = (now) => {
      const dt = last ? Math.max(0, Math.min(now - last, 50)) : 0;
      last = now;
      if (!reduce && visible && !document.hidden && !hovered && !held && !dragging && now > until) move(pos + dt * rate);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", drag); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      el.removeEventListener("keydown", key); el.removeEventListener("scroll", scrolled);
      copies.forEach((c) => c.remove());
      el.classList.remove("is-fx-dragging");
    };
  });
})();
