(() => {
  kfFx.register("sheet-drop", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const btn = el.querySelector("[data-fx-part=toggle]"), sheet = el.querySelector("[data-fx-part=sheet]");
      if (!btn || !sheet) return;
      const beat = 60 / (+options.bpm || 142), out = kfFx.ease("0.16,1,0.3,1", "expo.out"), snap = kfFx.ease("0.55,0,0.1,1", "power3.inOut");
      let open = false;
      sheet.inert = true;
      btn.setAttribute("aria-expanded", "false");
      const set = (on) => {
        open = on; btn.setAttribute("aria-expanded", String(on)); sheet.inert = !on;
        if (on) {
          gsap.fromTo(sheet, { autoAlpha: 0, yPercent: -3 }, { autoAlpha: 1, yPercent: 0, duration: reduce ? 0 : beat, ease: out, overwrite: true });
          if (!reduce) gsap.fromTo(sheet.querySelectorAll("li"), { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: beat, stagger: beat / 8, ease: out, overwrite: true });
        } else gsap.to(sheet, { autoAlpha: 0, yPercent: -3, duration: reduce ? 0 : beat * 0.5, ease: snap, overwrite: true });
      };
      btn.addEventListener("click", () => set(!open), { signal });
      sheet.addEventListener("click", (e) => e.target.closest("a") && set(false), { signal });
      addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { set(false); btn.focus(); } }, { signal });
      document.addEventListener("pointerdown", (e) => open && !el.contains(e.target) && set(false), { signal });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
