(() => {
  // Custom scrollbar drawn in a 20px strip at the right edge — bar length is screen height ÷ document height, position is the share read. While moving more than 1px, is-scrolling is added
  // A 5px bar turns on at half width in .2s, and when idle (.25s) it stops, drops, and vanishes .35s later over .35s. Hovering the band brings the bar to full width, pressing the band jumps to that spot, and dragging the bar moves along with it.
  kfFx.register("edge-scrollbar", (el, { options, scroller }) => {
    const thumb = el.querySelector('[data-fx-part="thumb"]');
    // Only devices with no pointer input are excluded — hover detection also checks pointer: fine, but the strip is used with a mouse even on a coarse pointer (same criterion as css hover: none)
    if (!thumb || !matchMedia("(hover: hover)").matches) return;
    const idle = +(options.idle ?? 0.25) * 1000;
    const box = scroller || document.scrollingElement;
    const target = scroller || window;
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    // api — global name of the smooth scroll object (like Lenis, scrollTo(y, { immediate }) is present). When given, pressing the strip glides with that damping and dragging moves it immediately (the strip press of the original smooth)
    const smooth = () => (options.api ? window[options.api] : null);
    const to = (y, now) => {
      const s = smooth();
      if (s && typeof s.scrollTo === "function") s.scrollTo(y, { immediate: !!now, force: true });
      else if (scroller) scroller.scrollTop = y;
      else scrollTo(0, y);
    };
    let prev = pos(), timer = 0, drag = null, raf = 0;
    const paint = () => {
      raf = 0;
      const vh = el.clientHeight, all = box.scrollHeight, view = scroller ? scroller.clientHeight : innerHeight;
      const room = Math.max(1, all - view);
      const h = Math.max(20, (view / all) * vh);
      thumb.style.height = `${h}px`;
      thumb.style.transform = `translateY(${(pos() / room) * (vh - h)}px)`;
      el.hidden = all <= view + 1;
      const now = pos();
      if (Math.abs(now - prev) > 1) {
        el.classList.add("is-scrolling");
        clearTimeout(timer);
        timer = setTimeout(() => el.classList.remove("is-scrolling"), idle);
      }
      prev = now;
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const ratioAt = (clientY) => {
      const r = el.getBoundingClientRect(), h = thumb.offsetHeight;
      return Math.min(1, Math.max(0, (clientY - r.top - h / 2) / Math.max(1, r.height - h)));
    };
    const room = () => box.scrollHeight - (scroller ? scroller.clientHeight : innerHeight);
    const down = (e) => {
      if (e.button) return;
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      el.classList.add("is-down");
      if (e.target === thumb || thumb.contains(e.target)) drag = { y: e.clientY, from: pos() };
      else to(ratioAt(e.clientY) * room());
    };
    const move = (e) => {
      if (!drag) return;
      const r = el.getBoundingClientRect(), h = thumb.offsetHeight;
      to(drag.from + ((e.clientY - drag.y) / Math.max(1, r.height - h)) * room(), true);
    };
    const up = (e) => { drag = null; el.classList.remove("is-down"); el.releasePointerCapture?.(e.pointerId); };
    target.addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    const ro = new ResizeObserver(ask);
    ro.observe(document.body);
    paint();
    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer); ro.disconnect();
      target.removeEventListener("scroll", ask);
      removeEventListener("resize", ask);
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.classList.remove("is-scrolling", "is-down");
      el.hidden = false;
      thumb.style.height = ""; thumb.style.transform = "";
    };
  });
})();
