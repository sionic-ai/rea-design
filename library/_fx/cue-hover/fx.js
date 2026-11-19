(() => {
  kfFx.register("cue-hover", (el, { options, reduce, hover, scroller }) => {
    const ac = new AbortController(), signal = ac.signal;
    const fxCtx = gsap.context(() => {
      const track = el.querySelector("[data-fx-part=track]");
      if (!track) return;
      const beat = 60 / (+options.bpm || 142), out = kfFx.ease("0.16,1,0.3,1", "expo.out");
      const line = document.createElement("i"), label = document.createElement("span");
      line.className = "fx-cue"; label.className = "fx-cue-label";
      track.append(line, label);
      signal.addEventListener("abort", () => { line.remove(); label.remove(); });
      const hide = () => gsap.to(track, { "--cue-o": 0, duration: reduce ? 0 : beat * 0.5, overwrite: "auto" });
      el.querySelectorAll("[data-fx-part=cue]").forEach((a) => {
        const show = () => {
          label.textContent = a.dataset.cueLabel || a.textContent.trim();
          gsap.to(track, { "--cue": +a.dataset.cue, "--cue-o": 1, duration: reduce ? 0 : beat, ease: out, overwrite: "auto" });
        };
        a.addEventListener("pointerenter", show, { signal }); a.addEventListener("focus", show, { signal });
        a.addEventListener("pointerleave", hide, { signal }); a.addEventListener("blur", hide, { signal });
      });
    }, el);
    return () => { ac.abort(); fxCtx.revert(); };
  });
})();
