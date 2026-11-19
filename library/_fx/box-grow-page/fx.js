// Clicking a link box floats an identical box in place (inner text off in .2s), holding the top left, and grows it to the next page’s panel size (default 60vw × 94vh)
// grows in .6s power4.inOut then goes to that address — if the next page places a same-colored plate in the same spot, the box seems to have become the page itself
(() => {
  kfFx.register("box-grow-page", (el, { options, reduce }) => {
    const link = el.matches("a[href]") ? el : el.querySelector("a[href]");
    if (!link) return;
    const w = options.w || "60vw", h = options.h || "94vh";
    const dur = +(options.dur ?? 0.6), fade = +(options.fade ?? 0.2), wait = +(options.wait ?? 0);
    const ease = kfFx.ease(options.ease || "power4.inOut", "power4.inOut");
    let ghost = null;
    const go = (href) => { location.href = href; };
    const onClick = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || link.target) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin) return;
      e.preventDefault();
      if (reduce || ghost) return go(url.href);
      const box = el.querySelector('[data-fx-part="box"]') || el;
      const r = box.getBoundingClientRect();
      ghost = box.cloneNode(true);
      ghost.removeAttribute("data-fx");
      ghost.setAttribute("aria-hidden", "true");
      Object.assign(ghost.style, { position: "fixed", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: "0", zIndex: "60", pointerEvents: "none" });
      document.body.append(ghost);
      if (ghost.children.length) gsap.to(ghost.children, { autoAlpha: 0, duration: fade });
      gsap.to(ghost, { width: w, height: h, duration: dur, ease, onComplete: () => setTimeout(() => go(url.href), wait * 1000) });
    };
    // When this page revives from cache via back, remove the grown boxes
    const onShow = (e) => { if (e.persisted && ghost) { ghost.remove(); ghost = null; } };
    link.addEventListener("click", onClick);
    addEventListener("pageshow", onShow);
    return () => {
      link.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      if (ghost) { gsap.killTweensOf(ghost); ghost.remove(); ghost = null; }
    };
  });
})();
