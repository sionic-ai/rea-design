(() => {
  kfFx.register("unfold-hover", (el, { options, reduce, hover }) => {
    if (!hover || !el.firstElementChild) return;
    const closed = +(options.closed ?? 48), tOpen = +(options.open ?? 0.25), tClose = +(options.close ?? 0.2), tText = +(options.text ?? 0.8);
    const label = el.querySelector('[data-fx-part="label"]');
    const ac = new AbortController(), signal = ac.signal;
    const open = () => {
      gsap.killTweensOf(el);
      gsap.to(el, { width: el.firstElementChild.offsetWidth, duration: reduce ? 0 : tOpen, ease: "expo.inOut" });
      if (label) { gsap.killTweensOf(label); gsap.fromTo(label, { x: 5 }, { x: 0, marginLeft: 0, duration: reduce ? 0 : tText, ease: "expo.out" }); }
    };
    const close = () => {
      gsap.killTweensOf(el);
      gsap.to(el, { width: closed, duration: reduce ? 0 : tClose, ease: "power2.out" });
      if (label) { gsap.killTweensOf(label); gsap.to(label, { x: 5, marginLeft: 10, duration: reduce ? 0 : tText, ease: "expo.out" }); }
    };
    el.addEventListener("pointerenter", open, { signal });
    el.addEventListener("pointerleave", close, { signal });
    el.addEventListener("focusin", open, { signal });
    el.addEventListener("focusout", close, { signal });
    return () => { ac.abort(); gsap.killTweensOf(el); gsap.set(el, { clearProps: "width" }); if (label) { gsap.killTweensOf(label); gsap.set(label, { clearProps: "transform,marginLeft" }); } };
  });
})();
