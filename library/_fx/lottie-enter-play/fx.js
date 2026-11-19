(() => {
  // Original: section top edge is 0 on every scroll < When top ≤ window height − 200, call play() — a finished board stays on its last scene and runs only once
  const json = (src) => { try { return JSON.parse(document.querySelector(src)?.textContent || "null"); } catch { return null; } };
  kfFx.register("lottie-enter-play", (el, { options, reduce, scroller }) => {
    const src = options.src;
    if (!src || !window.lottie) return;
    const data = src.startsWith("#") ? json(src) : null;
    if (src.startsWith("#") && !data) return;
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    const anim = lottie.loadAnimation({ container: stage, renderer: "svg", loop: options.loop === "true", autoplay: false, ...(data ? { animationData: data } : { path: src }) });
    const ref = (options.watch && el.closest(options.watch)) || el;
    const off = +(options.offset ?? 200);
    const box = scroller || window;
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    if (reduce) {
      anim.addEventListener("DOMLoaded", () => anim.goToAndStop(anim.totalFrames - 1, true));
      return () => anim.destroy();
    }
    const check = () => {
      const r = ref.getBoundingClientRect(), t = scroller ? r.top - scroller.getBoundingClientRect().top : r.top;
      if (t > 0 && t <= view() - off) anim.play();
    };
    // on: load — like the hero logo, plays once when the whole document is received (window load) without waiting for scroll
    if (options.on === "load") {
      const go = () => anim.play();
      if (document.readyState === "complete") { if (anim.isLoaded) go(); else anim.addEventListener("DOMLoaded", go); }
      else addEventListener("load", go, { once: true });
      return () => { removeEventListener("load", go); anim.destroy(); };
    }
    box.addEventListener("scroll", check, { passive: true });
    return () => { box.removeEventListener("scroll", check); anim.destroy(); };
  });
})();
