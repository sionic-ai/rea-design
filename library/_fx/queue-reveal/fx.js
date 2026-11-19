(() => {
  // Even if many arrive at once, they line up in a single row — each panel holds one time for when the next may start
  kfFx.register("queue-reveal", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      if (reduce) return;
      const reveal = kfFx.ease("0.23,1,0.32,1", "expo.out");
      const GAP = { text: 0.18, panel: 0.22, card: 0.12, feature: 0.12 }, queue = { free: 0 }, count = { card: 0, feature: 0 };
      const slot = (gap) => { const now = performance.now() / 1000, at = Math.max(now, queue.free); queue.free = at + gap; return at - now; };
      const io = new IntersectionObserver((list) => list.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const k = en.target.dataset.kind || "text";
        gsap.to(en.target, { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: k === "panel" ? 0.64 : k === "feature" ? 0.62 : 0.5, ease: reveal, delay: slot(GAP[k] || 0.18) });
      }), { root: scroller || null, rootMargin: "0px 0px -4% 0px" });
      signal.addEventListener("abort", () => io.disconnect());
      [...el.children].forEach((c) => {
        const k = c.dataset.kind || "text", n = count[k] !== undefined ? count[k]++ : 0;
        const from = k === "panel" ? { y: 20, scale: 0.975 } : k === "card" ? { x: n % 2 === 0 ? 16 : -16, y: 16, rotation: n % 2 === 0 ? 0.5 : -0.5, scale: 0.99 }
          : k === "feature" ? { x: n % 2 === 0 ? 64 : -64, y: 22, rotation: n % 2 === 0 ? 1.2 : -1.2, scale: 0.985 } : { y: 18 };
        gsap.set(c, { autoAlpha: 0, ...from });
        io.observe(c);
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
