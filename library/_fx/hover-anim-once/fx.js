// AniJS 「if: mouseover, do: <Effect> animated” — plays the animate.css effect once on every hover, then removes it so it can play again next time
(() => {
  kfFx.register("hover-anim-once", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const name = options.name || "bounce";
    const s = el.style;
    if (options.dur != null) s.animationDuration = `${+options.dur}s`;
    const on = () => el.classList.add("animated", name);
    const off = (e) => { if (e.target === el) el.classList.remove("animated", name); };
    el.addEventListener("mouseover", on);
    el.addEventListener("animationend", off);
    return () => { el.removeEventListener("mouseover", on); el.removeEventListener("animationend", off); el.classList.remove("animated", name); s.animationDuration = ""; };
  });
})();
