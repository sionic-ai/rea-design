// Exactly as in the original (Brand hero). e = (scroll − panel top edge) ÷ viewport height, s = Frame width ÷ screen width (width minus side margins).
// Outer panel --fx-wrap: 1 → s, sine.inOut over e 0~wrap-end (.6). Inner video --fx-scale: 1 → s, sine.out over e scale-from (.1)~scale-to (1.5), rounded up in .01 units.
// Both use quickTo (smooth 1s, expo.out). The board stays fixed and descends from its initial position to the target (380px) position by sine.inOut(e / drop-end(.7)), and,
// That movement follows over (1 − e) seconds with expo.out. When e ≥ 1 it docks to the position of screen height + target from the panel’s top edge (is-docked). e ≥ .725 gives is-text, ≥ .825 gives is-line
(() => {
  kfFx.register("frame-dock-video", (root, { options, reduce, scroller }) => {
    const clip = root.querySelector('[data-fx-part="clip"]');
    if (!clip) return;
    const follow = [...root.querySelectorAll('[data-fx-part="follow"]')];
    const narrowQ = matchMedia("(max-width: 767px)");
    const num = (k, d) => +(options[k] ?? d);
    const sineOut = gsap.parseEase("sine.out"), sineInOut = gsap.parseEase("sine.inOut");
    const ease = kfFx.ease(options.ease || "expo.out", "expo.out");
    const smooth = reduce ? 0 : num("smooth", 1);
    const scaleTo = gsap.quickTo(root, "--fx-scale", { duration: smooth, ease });
    const wrapTo = gsap.quickTo(root, "--fx-wrap", { duration: smooth, ease });
    const movers = [clip, ...follow];
    const inPanel = !!scroller;
    let m = {}, yTw, docked = null;

    const measure = () => {
      const narrow = narrowQ.matches;
      const vw = inPanel ? scroller.clientWidth : innerWidth, vh = inPanel ? scroller.clientHeight : innerHeight;
      const pad = narrow ? vw * num("pad-narrow", 0.1) : options.pad != null ? num("pad", 90) : Math.max(vw / 2 - 660, 90);
      const s = Math.max(0.05, (vw - 2 * pad) / vw);
      // clip-path does not change position, so the panel height is always the full height whenever measured
      const ch = clip.offsetHeight;
      const top0 = narrow ? vh * num("start-narrow", 0.1623036649) : (vh - ch) / 2;
      const target = narrow ? num("target-narrow", 180) : num("target", 380);
      const rootTop = inPanel ? root.offsetTop : root.getBoundingClientRect().top + scrollY;
      m = { vw, vh, s, top0, target, rootTop };
      if (!inPanel) {
        movers.forEach((el) => (el.style.top = top0 + "px"));
        root.style.minHeight = vh + target + ch * s + "px";
      }
    };

    const setDocked = (on) => {
      if (docked === on) return;
      docked = on;
      root.classList.toggle("is-docked", on);
      movers.forEach((el) => (el.style.top = on ? m.vh + m.target + "px" : m.top0 + "px"));
    };

    const update = () => {
      const y = inPanel ? scroller.scrollTop : scrollY;
      const e = (y - m.rootTop) / m.vh;
      const u = e > num("scale-from", 0.1) ? Math.min(1, (Math.min(e, num("scale-to", 1.5)) - num("scale-from", 0.1)) / (num("scale-to", 1.5) - num("scale-from", 0.1))) : 0;
      scaleTo(reduce ? m.s : Math.ceil(100 * (1 - (1 - m.s) * sineOut(u))) / 100);
      if (reduce || e >= 1) {
        wrapTo(m.s);
        root.classList.add("is-text", "is-line");
        if (!inPanel) setDocked(true);
        return;
      }
      if (!inPanel) setDocked(false);
      root.classList.toggle("is-text", e >= 0.725);
      root.classList.toggle("is-line", e >= 0.825);
      const wEnd = num("wrap-end", 0.6), dEnd = num("drop-end", 0.7);
      wrapTo(1 - (1 - m.s) * sineInOut(e < wEnd ? Math.max(e, 0) / wEnd : 1));
      if (inPanel) return;
      yTw?.kill();
      yTw = gsap.to(movers, { y: (m.target - m.top0) * sineInOut(e < dEnd ? Math.max(e, 0) / dEnd : 1), duration: Math.max(0, 1 - e), ease });
    };

    const src = inPanel ? scroller : window;
    const onResize = () => { measure(); update(); };
    const ro = new ResizeObserver(onResize);
    ro.observe(clip);
    measure();
    update();
    src.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      src.removeEventListener("scroll", update);
      removeEventListener("resize", onResize);
      yTw?.kill();
      gsap.killTweensOf(root);
      gsap.set(movers, { clearProps: "transform,top" });
      root.classList.remove("is-docked", "is-text", "is-line");
      root.style.removeProperty("min-height");
      root.style.removeProperty("--fx-wrap");
      root.style.removeProperty("--fx-scale");
    };
  });
})();
