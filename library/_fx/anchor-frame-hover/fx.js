(() => {
  kfFx.register("anchor-frame-hover", (el, { options, hover }) => {
    if (!hover) return;
    const items = () => [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items().length) return;
    const frame = document.createElement("span");
    frame.setAttribute("data-fx-part", "frame");
    frame.setAttribute("aria-hidden", "true");
    frame.innerHTML = "<i></i><i></i><i></i><i></i>";
    if (options.dur != null) frame.style.setProperty("--fx-dur", `${+options.dur}s`);
    if (options.ease) frame.style.setProperty("--fx-ease", `cubic-bezier(${options.ease})`);
    if (options.pad != null) frame.style.margin = `${-options.pad}px`;
    el.prepend(frame);
    const pad = +(options.pad ?? 0);
    const place = (it) => {
      const r = el.getBoundingClientRect(), i = it.getBoundingClientRect();
      frame.style.setProperty("--fx-ax", `${i.left - r.left}px`);
      frame.style.setProperty("--fx-ay", `${i.top - r.top}px`);
      frame.style.width = `${i.width + pad * 2}px`;
      frame.style.height = `${i.height + pad * 2}px`;
    };
    const over = (e) => { const it = e.target.closest('[data-fx-part="item"]'); if (it && el.contains(it)) place(it); };
    const enter = () => frame.classList.add("is-on");
    const leave = () => frame.classList.remove("is-on");
    el.addEventListener("pointerover", over);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointerover", over); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointerleave", leave); frame.remove(); };
  });
})();
