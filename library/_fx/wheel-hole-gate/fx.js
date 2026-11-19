(() => {
  // The hero veil is locked, and by the distance scrolled via wheel·touch·keys (screen height × dist) the central circular hole (--fx-hole) grows to reveal the body below.
  // After input stops (wheel .3s · hand released), if progress passed release it opens the rest over .25 + .45×remaining s power1.in, otherwise (touch only) it closes in .4s.
  // When fully open, release the lock and fire fx:open on the element. Firing fx:lock on the element returns to the top and locks again (the original’s Top link)
  kfFx.register("wheel-hole-gate", (el, { options, reduce, hover }) => {
    const narrow = matchMedia("(max-width: 1024px)");
    const distOf = () => innerHeight * (narrow.matches ? +(options["dist-sp"] ?? 0.53) : +(options.dist ?? 1.2));
    const release = +(options.release ?? 0.35);
    const st = { locked: true, completing: false, target: 0, shown: 0 };
    const radius = () => Math.hypot(innerWidth, innerHeight) / 2 + 2;
    const paint = () => el.style.setProperty("--fx-hole", `${Math.max(0.1, st.shown * radius()).toFixed(2)}px`);
    const moveTo = (p, d = 0.35) => {
      st.target = gsap.utils.clamp(0, 1, p);
      gsap.to(st, { shown: st.target, duration: d, ease: "power2.out", overwrite: true, onUpdate: paint });
    };
    let idle = 0, touchY = null, touchFrom = 0;
    const unlock = () => {
      if (!st.locked) return;
      st.locked = false; st.completing = false; st.target = st.shown = 1;
      clearTimeout(idle); paint(); detach();
      el.classList.add("is-fx-open");
      el.dispatchEvent(new CustomEvent("fx:open", { bubbles: true }));
    };
    const complete = (instant) => {
      if (!st.locked || st.completing) return;
      st.completing = true; st.target = 1;
      if (instant || reduce) { gsap.killTweensOf(st); st.shown = 1; paint(); unlock(); return; }
      gsap.to(st, { shown: 1, duration: 0.25 + (1 - st.shown) * 0.45, ease: "power1.in", overwrite: true, onUpdate: paint, onComplete: unlock });
    };
    const settle = (back) => {
      if (!st.locked || st.completing) return;
      if (st.target >= release) complete(false);
      else if (back && st.target > 0) moveTo(0, 0.4);
    };
    const delta = (e) => (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY);
    const onWheel = (e) => {
      if (!st.locked) return;
      e.preventDefault();
      if (st.completing) return;
      moveTo(st.target + delta(e) / distOf());
      if (st.target >= 1) return complete(false);
      clearTimeout(idle);
      idle = setTimeout(() => settle(false), 300);
    };
    const onTouchStart = (e) => { if (st.locked && !st.completing) { touchY = e.touches[0].clientY; touchFrom = st.target; } };
    // Blocking touch is this part’s job — only while locked, it moves the hole instead of the page
    const onTouchMove = (e) => {
      if (!st.locked || touchY == null) return;
      e.preventDefault();
      moveTo(touchFrom + (touchY - e.touches[0].clientY) / distOf(), 0.15);
      if (st.target >= 1) complete(false);
    };
    const onTouchEnd = () => { if (touchY == null) return; touchY = null; settle(true); };
    const onKey = (e) => {
      if (!st.locked || e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      if (["ArrowDown", "PageDown", " ", "Spacebar", "End"].includes(e.key)) { e.preventDefault(); complete(false); }
    };
    const onScroll = () => { if (st.locked && scrollY > 0) scrollTo(0, 0); };
    const attach = () => {
      addEventListener("wheel", onWheel, { passive: false });
      addEventListener("touchstart", onTouchStart, { passive: true });
      addEventListener("touchmove", onTouchMove, { passive: false });
      addEventListener("touchend", onTouchEnd, { passive: true });
      addEventListener("touchcancel", onTouchEnd, { passive: true });
      addEventListener("keydown", onKey);
      addEventListener("scroll", onScroll, { passive: true });
    };
    const detach = () => {
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("touchend", onTouchEnd);
      removeEventListener("touchcancel", onTouchEnd);
      removeEventListener("keydown", onKey);
      removeEventListener("scroll", onScroll);
    };
    const lock = () => {
      gsap.killTweensOf(st);
      Object.assign(st, { locked: true, completing: false, target: 0, shown: 0 });
      el.classList.remove("is-fx-open");
      scrollTo({ top: 0, behavior: "auto" });
      paint(); detach(); attach();
    };
    const onLock = () => lock();
    const onResize = () => paint();
    el.addEventListener("fx:lock", onLock);
    addEventListener("resize", onResize);
    paint();
    // If the URL has a section name (#) or the page is already scrolled down (refresh, back), open right away without locking
    if (reduce || scrollY > 0 || (location.hash && location.hash !== "#top")) unlock();
    else attach();
    return () => {
      detach(); clearTimeout(idle); gsap.killTweensOf(st);
      el.removeEventListener("fx:lock", onLock);
      removeEventListener("resize", onResize);
      el.classList.remove("is-fx-open");
      el.style.removeProperty("--fx-hole");
    };
  });
})();
