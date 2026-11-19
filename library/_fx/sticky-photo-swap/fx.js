(() => {
  kfFx.register("sticky-photo-swap", (el, { options }) => {
    const layer = el.querySelector("[data-fx-part=layer]");
    const secs = [...el.querySelectorAll("[data-fx-part=section]")];
    const photos = layer ? [...layer.querySelectorAll("[data-fx-part=photo]")] : [];
    if (!layer || !secs.length || !photos.length) return;
    const lock = +(options.lock ?? 100), wait = +(options.throttle ?? 16);
    let at = -1, busy = false, timer = 0, unlock = 0;
    const show = (k) => {
      if (k === at || busy) return;
      busy = true;
      photos.forEach((p) => p.classList.remove("is-active"));
      const p = photos.find((x) => +x.dataset.index === k) || photos[k];
      if (p) { p.classList.add("is-active"); at = k; }
      unlock = setTimeout(() => (busy = false), lock);
    };
    // As in the original — if the section is still below, the first photo, once fully passed, the last photo, in between, the cell whose center is closest to the screen center
    const place = () => {
      const r = el.getBoundingClientRect(), h = innerHeight;
      if (r.top > 0) { layer.classList.remove("is-fixed", "is-bottom"); layer.classList.add("is-visible"); return show(0); }
      if (r.bottom < h) { layer.classList.remove("is-fixed"); layer.classList.add("is-bottom", "is-visible"); return show(secs.length - 1); }
      layer.classList.remove("is-bottom");
      layer.classList.add("is-fixed", "is-visible");
      const mid = h / 2;
      let k = 0, best = Infinity;
      secs.forEach((s, i) => { const b = s.getBoundingClientRect(), d = Math.abs(mid - (b.top + b.height / 2)); if (d < best) { best = d; k = i; } });
      show(k);
    };
    const onScroll = () => { if (!timer) timer = setTimeout(() => { timer = 0; place(); }, wait); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", place, { passive: true });
    place();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", place);
      clearTimeout(timer); clearTimeout(unlock);
      layer.classList.remove("is-fixed", "is-bottom", "is-visible");
      photos.forEach((p) => p.classList.remove("is-active"));
    };
  });
})();
