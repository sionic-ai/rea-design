// Lottie Scroll playback for Brand — first frame when the element top touches the bottom edge of the screen, last frame when the bottom leaves the top edge of the screen.
// Straight proportion in between (frame = round(progress × total frames), so the keyframe curve inside the Lottie becomes the scroll curve as is. It listens to scroll only while visible.
// mode: fixed is for inside a fixed panel when the element does not move — goes 0→end→0 every span px of document scroll (original Gr(1000))
(() => {
  kfFx.register("lottie-scroll-seek", (el, { options, reduce, scroller }) => {
    const src = options.src;
    const stage = el.querySelector('[data-fx-part="stage"]') || el;
    if (!src || !window.lottie) return;
    // If it’s an #id, stays inside the document <script type="application/json"> Loaded from there — a page opened with file:// can’t load JSON files
    let data = null;
    if (src.startsWith("#")) {
      try { data = JSON.parse(document.querySelector(src)?.textContent || "null"); } catch { data = null; }
      if (!data) return;
    }
    const anim = lottie.loadAnimation({
      container: stage, renderer: "svg", loop: false, autoplay: false, ...(data ? { animationData: data } : { path: src }),
      rendererSettings: { preserveAspectRatio: options.fit || "xMidYMid meet" },
    });
    const span = +options.span || 1000;
    const box = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    let total = 0, raf = 0, near = false;
    const progress = () => {
      if (options.mode === "fixed") {
        const y = top(), r = y % span;
        return Math.floor(y / span) % 2 ? 1 - r / span : r / span;
      }
      const vh = view(), r = el.getBoundingClientRect(), t = scroller ? r.top - scroller.getBoundingClientRect().top : r.top;
      return Math.min(1, Math.max(0, (vh - t) / (r.height + vh)));
    };
    // range: a, b — uses only the a~b part of progress for frames 0→end (like a photo stage, drawn only in the unpinned span)
    const [ra, rb] = (options.range || "0, 1").split(",").map(Number);
    const remap = (p) => (rb > ra ? Math.min(1, Math.max(0, (p - ra) / (rb - ra))) : p);
    const seek = () => { raf = 0; if (total) anim.goToAndStop(Math.min(total - 1, Math.round(remap(progress()) * total)), true); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(seek); };
    const ready = () => {
      total = anim.totalFrames;
      if (reduce) { anim.goToAndStop(Math.min(total - 1, +(options.rest ?? total - 1)), true); return; }
      seek();
    };
    anim.addEventListener("DOMLoaded", ready);
    const io = new IntersectionObserver((es) => {
      const now = es[es.length - 1].isIntersecting;
      if (now === near || reduce) return;
      near = now;
      if (near) { box.addEventListener("scroll", onScroll, { passive: true }); onScroll(); }
      else box.removeEventListener("scroll", onScroll);
    }, { root: scroller || null });
    io.observe(el);
    return () => { io.disconnect(); box.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); anim.destroy(); };
  });
})();
