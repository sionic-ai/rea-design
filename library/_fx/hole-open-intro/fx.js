(() => {
  kfFx.register("hole-open-intro", (el, { options, reduce }) => {
    const at = +(options.at ?? 2.9), dur = +(options.dur ?? 1), size = options.size || "150vmax";
    const ease = kfFx.ease(options.ease || "power1.out", "power1.out");
    const from = options.from || "0px", dip = options.dip || "", dipAt = +(options["dip-at"] ?? 0.14);
    const lock = options.lock !== "false";
    const key = options.once ? `fx-hole-open:${options.once}` : "";
    const fire = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    const prev = document.documentElement.style.overflow;
    let tl = null;
    const finish = () => { el.style.display = "none"; if (lock) document.documentElement.style.overflow = prev; fire("fx:done"); };

    // If the same person returns within a session, the overlay just lifts in .5s (original sessionStorage)
    if (reduce || (key && sessionStorage.getItem(key))) {
      fire("fx:open");
      tl = gsap.to(el, { opacity: 0, duration: reduce ? 0 : 0.5, ease: "power2.inOut", onComplete: finish });
      return () => { tl.kill(); el.style.removeProperty("display"); gsap.set(el, { clearProps: "opacity" }); };
    }
    if (key) sessionStorage.setItem(key, "1");
    if (lock) document.documentElement.style.overflow = "hidden";
    // Curtain = Background-color panel − center circle. The circle diameter grows from from (shrinking briefly via dip) to size, revealing the scene below in a round shape
    // dip applies the same curve separately per segment like CSS keyframes (contraction dip-at share · opening the rest)
    const mix = (a, b, t) => `calc(${a} * ${(1 - t).toFixed(4)} + ${b} * ${t.toFixed(4)})`;
    const set = (v) => el.style.setProperty("--fx-hole", v);
    set(from);
    const leg = (a, b, d, pos) => { const p = { t: 0 }; tl.to(p, { t: 1, duration: d, ease, onUpdate: () => set(mix(a, b, p.t)) }, pos); };
    tl = gsap.timeline()
      .call(() => fire("fx:play"), null, +(options.play ?? 0.8))
      .call(() => fire("fx:open"), null, at);
    if (dip) { leg(from, dip, dur * dipAt, at); leg(dip, size, dur * (1 - dipAt), at + dur * dipAt); }
    else leg(from, size, dur, at);
    tl.call(finish);
    return () => { tl.kill(); if (lock) document.documentElement.style.overflow = prev; el.style.removeProperty("display"); el.style.removeProperty("--fx-hole"); };
  });
})();
