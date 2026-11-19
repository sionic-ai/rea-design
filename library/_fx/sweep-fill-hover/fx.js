(() => {
  kfFx.register("sweep-fill-hover", (el, { options, reduce, hover }) => {
    if (!hover || reduce) return;
    const from = +(options.from ?? 0.75), tin = +(options.in ?? 0.32), tout = +(options.out ?? 0.32);
    let rect = el.querySelector(':scope > [data-fx-part="rect"]'), made = false;
    if (!rect) {
      rect = document.createElement("span");
      rect.setAttribute("data-fx-part", "rect");
      el.prepend(rect);
      made = true;
    }
    const ac = new AbortController(), signal = ac.signal;
    el.addEventListener("pointerenter", () => { gsap.killTweensOf(rect); gsap.fromTo(rect, { scaleX: from }, { scaleX: 1, duration: tin, ease: "power2.out" }); }, { signal });
    el.addEventListener("pointerleave", () => { gsap.killTweensOf(rect); gsap.to(rect, { scaleX: 0, duration: tout, ease: "circ.inOut" }); }, { signal });
    return () => { ac.abort(); gsap.killTweensOf(rect); if (made) rect.remove(); else gsap.set(rect, { clearProps: "transform" }); };
  });
})();
