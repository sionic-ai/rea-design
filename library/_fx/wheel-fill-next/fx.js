(() => {
  // Once the ”Next” band at the page end is fully on screen, scrolling further fills the bar by step% per wheel notch and touch% per upward touch move.
  // When full, fire fx:next, and if not blocked and to (or an inner a[href]) exists, go there. When the strip leaves the screen, restart from the beginning
  kfFx.register("wheel-fill-next", (el, { options, scroller }) => {
    const step = +(options.step ?? 2), touch = +(options.touch ?? 7);
    const to = options.to || el.querySelector("a[href]")?.getAttribute("href") || "";
    let atEnd = false, p = 0, ty = 0, fired = false;
    const view = () => (scroller ? scroller.getBoundingClientRect().bottom : innerHeight);
    const tick = () => {
      atEnd = el.getBoundingClientRect().bottom <= view() + 1;
      if (!atEnd) p = 0;
      const v = Math.min(p / 100, 1);
      el.style.setProperty("--fx-progress", String(v));
      if (v < 1) { fired = false; return; }
      if (fired) return;
      fired = true;
      const go = el.dispatchEvent(new CustomEvent("fx:next", { bubbles: true, cancelable: true, detail: { to } }));
      if (go && to) location.href = to;
    };
    const target = scroller || window;
    const onWheel = (e) => { if (e.deltaY > 0 && atEnd) p += step; };
    const onStart = (e) => { ty = e.touches[0].clientY; };
    const onMove = (e) => { if (!atEnd) return; const y = e.touches[0].clientY; if (ty - y > 0) p += touch; ty = y; };
    target.addEventListener("wheel", onWheel, { passive: true });
    target.addEventListener("touchstart", onStart, { passive: true });
    target.addEventListener("touchmove", onMove, { passive: true });
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      target.removeEventListener("wheel", onWheel);
      target.removeEventListener("touchstart", onStart);
      target.removeEventListener("touchmove", onMove);
      el.style.removeProperty("--fx-progress");
    };
  });
})();
