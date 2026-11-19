(() => {
  // Starts only after the pointer stays for 120ms — it does not react to a pointer just passing by (original hoverTimer)
  kfFx.register("blob-fill-pill", (el, { options, reduce, hover }) => {
    if (!hover) return;
    const circle = (options.look || "") === "circle";
    const wait = +(options.delay ?? 120);
    const dot = el.querySelector('[data-fx-part="dot"]');
    let blob = el.querySelector('[data-fx-part="blob"]');
    const own = !blob;
    if (own) {
      blob = document.createElement("span");
      blob.setAttribute("aria-hidden", "true");
      el.prepend(blob);
    }
    blob.classList.add("fx-blob");
    const measure = () => {
      const r = el.getBoundingClientRect(), d = dot?.getBoundingClientRect();
      el.style.setProperty("--fx-blob-w", `${circle ? r.width : d?.width || r.height}px`);
      el.style.setProperty("--fx-blob-h", `${r.height}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    let timer = 0, press = 0;
    const enter = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { timer = 0; el.classList.remove("is-blob-leaving"); el.classList.add("is-blob-hover"); }, wait);
    };
    const leave = () => {
      if (timer) { clearTimeout(timer); timer = 0; return; }
      el.classList.remove("is-blob-hover");
      if (!reduce) el.classList.add("is-blob-leaving");
    };
    const ended = (e) => { if (e.animationName === "fx-blob-contract" || e.animationName === "fx-blob-uncircle") el.classList.remove("is-blob-leaving"); };
    // Round shapes press down round for 300ms the moment they’re pressed
    const down = () => {
      if (!circle) return;
      clearTimeout(press);
      el.classList.add("is-blob-press");
      press = setTimeout(() => el.classList.remove("is-blob-press"), 300);
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    blob.addEventListener("animationend", ended);
    return () => {
      clearTimeout(timer); clearTimeout(press); ro.disconnect();
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
      blob.removeEventListener("animationend", ended);
      el.classList.remove("is-blob-hover", "is-blob-leaving", "is-blob-press");
      el.style.removeProperty("--fx-blob-w");
      el.style.removeProperty("--fx-blob-h");
      if (own) blob.remove(); else blob.classList.remove("fx-blob");
    };
  });
})();
