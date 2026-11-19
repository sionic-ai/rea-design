(() => {
  kfFx.register("frame-tint-hover", (el, { options, reduce, hover }) => {
    if (reduce || !hover) return;
    const portrait = (options.look || "") === "portrait";
    const ease = kfFx.ease("0.25,0.46,0.45,0.94", "power1.out");
    const tIn = +(options.in ?? 0.3), tOut = +(options.out ?? 0.4), lag = +(options.lag ?? 0.2), rise = +(options.rise ?? 200);
    const ratio = +(options.width ?? (portrait ? 0.09 : 0.06));
    let frame = el.querySelector('[data-fx-part="frame"]'), made = false;
    if (!frame) {
      frame = document.createElement("span");
      frame.setAttribute("data-fx-part", "frame");
      frame.setAttribute("aria-hidden", "true");
      el.append(frame);
      made = true;
    }
    const label = el.querySelector('[data-fx-part="label"]');
    // Fit thickness to card width — re-measure even if the width changes when fonts or photos arrive late
    const ro = new ResizeObserver(() => el.style.setProperty("--fx-inset", `${(el.offsetWidth * ratio).toFixed(1)}px`));
    ro.observe(el);
    if (label && !portrait) gsap.set(label, { yPercent: rise });
    const parts = label ? [frame, label] : [frame];
    const on = () => {
      gsap.killTweensOf(parts);
      gsap.to(frame, { opacity: 1, duration: tIn, ease });
      if (!label) return;
      gsap.to(label, { opacity: 1, duration: 0.5, delay: lag, ease });
      if (!portrait) gsap.to(label, { yPercent: 0, duration: tIn, delay: lag, ease });
    };
    const off = () => {
      gsap.killTweensOf(parts);
      gsap.to(frame, { opacity: 0, duration: tOut, delay: 0.1, ease });
      if (!label) return;
      gsap.to(label, { opacity: 0, duration: 0.5, ease });
      if (!portrait) gsap.to(label, { yPercent: rise, duration: tIn, ease });
    };
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    el.addEventListener("focusin", on);
    el.addEventListener("focusout", off);
    return () => {
      el.removeEventListener("mouseenter", on);
      el.removeEventListener("mouseleave", off);
      el.removeEventListener("focusin", on);
      el.removeEventListener("focusout", off);
      ro.disconnect();
      el.style.removeProperty("--fx-inset");
      gsap.killTweensOf(label ? [frame, label] : frame);
      if (label) gsap.set(label, { clearProps: "opacity,transform" });
      if (made) frame.remove(); else gsap.set(frame, { clearProps: "opacity" });
    };
  });
})();
