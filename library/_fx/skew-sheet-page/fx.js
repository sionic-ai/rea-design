(() => {
  // Transition curtain — covering: it enters slanted from beyond the right edge of the screen (width + height×tan30°) and straightens as it covers. Lifting: a curtain widened on both sides by the slant exits to the left after .2s, straightening out.
  kfFx.register("skew-sheet-page", (el, { options, reduce }) => {
    const dur = reduce ? 0 : +(options.dur ?? 1), wait = +(options.wait ?? 0.2), skew = +(options.skew ?? 30);
    const ease = options.ease || "circ.inOut";
    const mode = String(options.mode || "link");
    const KEY = "fx-skew-sheet-page";
    const tan = Math.tan((skew * Math.PI) / 180);
    gsap.set(el, { position: "fixed", left: 0, top: 0, height: "100vh", zIndex: el.style.zIndex || 100, pointerEvents: "none", visibility: "hidden" });

    const cover = (back, done) => {
      const W = innerWidth, H = innerHeight;
      const s = back ? skew : -skew;
      gsap.killTweensOf(el);
      gsap.fromTo(el, { visibility: "visible", width: W, x: back ? -(W + tan * H) : W + tan * H, skewX: s },
        { x: 0, skewX: 0, duration: dur, ease, onComplete: () => done?.() });
    };
    const reveal = (back, done) => {
      const W = innerWidth, H = innerHeight;
      const s = back ? skew : -skew;
      gsap.killTweensOf(el);
      gsap.fromTo(el, { visibility: "visible", x: -tan * H, width: W + tan * H * 2, skewX: s },
        { x: back ? W : -W, width: W, skewX: 0, delay: wait, duration: dur, ease, onComplete: () => { gsap.set(el, { visibility: "hidden" }); done?.(); } });
    };
    const onCover = (e) => cover(!!e.detail?.back, e.detail?.done);
    const onReveal = (e) => reveal(!!e.detail?.back, e.detail?.done);
    el.addEventListener("fx:cover", onCover);
    el.addEventListener("fx:reveal", onReveal);

    // mode: link — intercepts same-site links, covers, and goes over. The page that arrives opens covered and the cover lifts
    let onClick = null;
    if (mode === "link") {
      if (sessionStorage.getItem(KEY)) { sessionStorage.removeItem(KEY); gsap.set(el, { visibility: "visible", width: innerWidth, x: 0 }); reveal(false); }
      onClick = (e) => {
        const a = e.target.closest(options.links || "a[href]");
        if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
        e.preventDefault();
        cover(false, () => { sessionStorage.setItem(KEY, "1"); location.href = url.href; });
      };
      document.addEventListener("click", onClick);
    }
    return () => {
      el.removeEventListener("fx:cover", onCover);
      el.removeEventListener("fx:reveal", onReveal);
      if (onClick) document.removeEventListener("click", onClick);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "all" });
    };
  });
})();
