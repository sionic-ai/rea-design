// Over the veil covering the Hero, a big title fitted to 95% of the wrap width stands, and after delay, while the wrap widens from 50% → 100%
// Text size grows along with the cell, and the curtain folds upward (height 100% → 0) to reveal the screen below. fx:grow at start, fx:done at end
(() => {
  kfFx.register("fit-grow-loader", (el, { options, reduce }) => {
    const wrap = el.querySelector('[data-fx-part="wrap"]');
    const title = wrap && wrap.querySelector('[data-fx-part="title"]');
    if (!wrap || !title || !title.textContent.trim()) return;
    const veil = el.querySelector('[data-fx-part="veil"]');
    const fill = +(options.fill ?? 0.95) || 0.95;
    const from = options.from || "50%", to = options.to || "100%";
    const delay = +(options.delay ?? 1.5), dur = +(options.dur ?? 1.2);
    const ease = kfFx.ease(options.ease || "0.65,0.05,0,1", "expo.inOut");
    let live = true, raf = 0;
    const tell = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    title.style.whiteSpace = "nowrap";
    // Refit every frame while the cell grows — adjust the size by ratio a few times so the text width becomes fill times the cell
    const fit = () => {
      if (!live) return;
      const st = getComputedStyle(wrap);
      const room = (wrap.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight)) * fill;
      if (room <= 0) return;
      let size = parseFloat(getComputedStyle(title).fontSize) || 16;
      for (let i = 0; i < 5; i++) {
        const w = title.getBoundingClientRect().width;
        if (!w) break;
        const r = room / w;
        if (Math.abs(r - 1) < 0.002) break;
        size *= r;
        title.style.fontSize = `${size}px`;
      }
    };
    const soon = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fit(); }); };
    const ro = new ResizeObserver(soon);
    ro.observe(wrap);
    document.fonts?.ready.then(fit);
    let tl = null;
    if (reduce || !dur) {
      gsap.set(wrap, { width: to });
      if (veil) gsap.set(veil, { height: "0%" });
      fit();
      tell("fx:done");
    } else {
      gsap.set(wrap, { width: from });
      if (veil) gsap.set(veil, { height: "100%" });
      fit();
      tl = gsap.timeline({ delay, onStart: () => tell("fx:grow"), onComplete: () => tell("fx:done") });
      tl.to(wrap, { width: to, duration: dur, ease }, 0);
      if (veil) tl.to(veil, { height: "0%", duration: dur, ease }, 0);
    }
    return () => {
      live = false;
      tl?.kill();
      ro.disconnect();
      cancelAnimationFrame(raf);
      title.style.fontSize = title.style.whiteSpace = "";
      gsap.set(wrap, { clearProps: "width" });
      if (veil) gsap.set(veil, { clearProps: "height" });
    };
  });
})();
