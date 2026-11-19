// The big circle following the cursor is clipped to a 4.2% radius and kept like a dot, then expands up to that value (%) over a data-cursor target — buttons get 2 (hidden smaller than the dot),
// Link 7, question row 12, drag-to-flip panel 32 (Drag label), photo 50. The ring follows late with 1s power4.out (original Brand cursor)
(() => {
  kfFx.register("orb-clip-cursor", (el, { options, reduce, hover }) => {
    const orb = el.querySelector('[data-fx-part="orb"]'), text = el.querySelector('[data-fx-part="text"]');
    if (!hover || reduce || !orb || !window.gsap) return;
    const base = +(options.base ?? 4.2), lag = +(options.follow ?? 1), dflt = +(options.size ?? 50);
    const inn = +(options.in ?? 0.765), out = +(options.out ?? 0.543), txt = +(options.text ?? 1.234);
    gsap.set(orb, { clipPath: `circle(${base}%)` });
    let cur = null, entering = null;
    const enter = (t) => {
      const size = t.dataset.cursor !== "" && !isNaN(+t.dataset.cursor) ? +t.dataset.cursor : dflt;
      if (text) text.textContent = t.dataset.cursorText || "";
      const tl = (entering = gsap.timeline({ defaults: { duration: inn, ease: "power4.out" } })).to(orb, { clipPath: `circle(${size}%)` }, 0);
      if (text) tl.set(text, { opacity: 0, scale: 1.4 }, 0).to(text, { duration: txt, opacity: 1, scale: 1 }, 0);
    };
    const leave = () => {
      const tl = gsap.timeline({ defaults: { duration: out, ease: "power4.out", overwrite: true } }).to(orb, { clipPath: `circle(${base}%)` }, 0);
      if (text) tl.to(text, { opacity: 0, scale: 0.4 }, 0);
    };
    const move = (e) => {
      if (e.pointerType && e.pointerType !== "mouse") return;
      gsap.to(el, { left: e.clientX, top: e.clientY, duration: lag, ease: "power4.out", overwrite: true });
      const t = e.target.closest ? e.target.closest("[data-cursor]") : null;
      if (t === cur) return;
      cur = t;
      t ? enter(t) : leave();
    };
    // Hover comes before press, so an entrance just started in the same tick is wound to the end before folding — otherwise the fold erases even the entrance’s first value and the letters don’t shrink
    const down = (e) => {
      // Even if pressed without the cursor moving (already over the target), sets the over-target state and then folds
      const t = e.target.closest ? e.target.closest("[data-cursor]") : null;
      if (t && t !== cur) { cur = t; enter(t); }
      if (!cur) return;
      if (entering && entering.time() < 0.05) entering.progress(1);
      cur = null;
      leave();
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down);
    return () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      gsap.killTweensOf([el, orb, text].filter(Boolean));
      gsap.set(el, { clearProps: "left,top" });
      gsap.set(orb, { clearProps: "clipPath" });
      text && gsap.set(text, { clearProps: "opacity,transform" });
    };
  });
})();
