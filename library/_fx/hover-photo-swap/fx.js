(() => {
  kfFx.register("hover-photo-swap", (el, { options }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    // Frame (data-fx-part="frame") If there are several, photo order is counted separately per frame and changed together — brand two frames, big photo·small photo
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    const sets = frames.length ? frames.map((f) => [...f.querySelectorAll('[data-fx-part="photo"]')]) : [[...el.querySelectorAll('[data-fx-part="photo"]')]];
    const photos = sets[0];
    if (!photos.length) return;
    // offset 1 (default) treats the first photo as the cover so row i pairs with photo i+1, with 0 row i pairs with photo i. With stay the last photo stays after you let go
    const shift = +(options.offset ?? 1), stay = options.stay === "on";
    // With dim, only the hovered line stays and the other lines fade to that opacity (same length and curve)
    const dim = options.dim;
    if (dim) el.style.setProperty("--fx-dim", dim);
    // With zoom, the resting photo is scaled up by that factor and returns to 1x on entering (the exiting photo’s delay is --fx-out-delay)
    if (options.zoom) { el.style.setProperty("--fx-zoom", options.zoom); el.classList.add("is-fx-zoom"); }
    const show = (n) => {
      sets.forEach((set) => set.forEach((p, k) => p.classList.toggle("is-fx-active", k === n)));
      if (dim) items.forEach((it, k) => it.classList.toggle("is-fx-on", k + shift === n));
      if (dim) el.classList.toggle("is-fx-dimming", n !== 0 || (shift === 0 && items.some((it) => it.matches(":hover"))));
    };
    show(0);
    const ac = new AbortController(), signal = ac.signal;
    items.forEach((item, i) => {
      const on = () => show(photos[i + shift] ? i + shift : 0), off = () => { if (!stay) show(0); };
      item.addEventListener("mouseover", on, { signal });
      item.addEventListener("mouseout", off, { signal });
      item.addEventListener("focusin", on, { signal });
      item.addEventListener("focusout", off, { signal });
    });
    return () => {
      ac.abort();
      sets.flat().forEach((p) => p.classList.remove("is-fx-active"));
      items.forEach((it) => it.classList.remove("is-fx-on"));
      el.classList.remove("is-fx-dimming");
      el.style.removeProperty("--fx-dim");
      el.style.removeProperty("--fx-zoom");
      el.classList.remove("is-fx-zoom");
    };
  });
})();
