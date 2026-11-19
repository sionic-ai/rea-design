// On a full-screen stage, the frame panel and the oval photo window inside it grow and blur with scroll around the same point (center of the frame).
// Window diameter = base + scroll × rate (px at design width → proportional to panel width), frame scale = Diameter/base, base scale = (base + scroll × bg)/base, blur = Expanded diameter × blur px.
// until: once the screen is passed, is-fx-past is added to the panel and the consumer hides the panel (the original vanishes at .75s). Scroll is read only once every 10ms (original lodash throttle)
(() => {
  kfFx.register("frame-window-zoom", (el, { options, reduce, scroller }) => {
    const win = el.querySelector('[data-fx-part="window"]');
    const frame = el.querySelector('[data-fx-part="frame"]');
    if (!win && !frame) return;
    const bg = el.querySelector('[data-fx-part="bg"]');
    const design = +options.design || 1600;
    const base = +options.base || 332;
    const ratio = +(options.ratio ?? 402 / 332);
    const rate = +(options.rate ?? 0.2);
    const bgRate = +(options.bg ?? 0.02);
    const blur = +(options.blur ?? 0.005);
    const until = +(options.until ?? 2);
    const cx = +(options.x ?? 50.69), cy = +(options.y ?? 40);
    const view = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : scrollY);
    const set = (k, v) => el.style.setProperty(k, v);
    let last = 0, tail = 0;
    const place = () => {
      const r = el.getBoundingClientRect();
      const x = (r.width * cx) / 100, y = (r.height * cy) / 100;
      set("--fx-x", `${x}px`);
      set("--fx-y", `${y}px`);
      set("--fx-origin", `${x}px ${y}px`);
    };
    const apply = () => {
      last = performance.now();
      const s = reduce ? 0 : top();
      const past = s > innerHeight * until;
      el.classList.toggle("is-fx-past", past);
      if (past) return;
      const k = el.getBoundingClientRect().width / design;
      const p = base + s * rate, u = base + s * bgRate;
      set("--fx-rx", `${(k * p) / 2}px`);
      set("--fx-ry", `${(k * p * ratio) / 2}px`);
      set("--fx-scale", p / base);
      set("--fx-bg-scale", u / base);
      set("--fx-blur", `${(p - base) * blur}px`);
    };
    const onScroll = () => {
      const now = performance.now();
      clearTimeout(tail);
      if (now - last >= 10) apply(); else tail = setTimeout(apply, 10 - (now - last));
    };
    const ro = new ResizeObserver(() => { place(); apply(); });
    ro.observe(el);
    view.addEventListener("scroll", onScroll, { passive: true });
    place();
    apply();
    return () => {
      clearTimeout(tail);
      ro.disconnect();
      view.removeEventListener("scroll", onScroll);
      el.classList.remove("is-fx-past");
      ["--fx-x", "--fx-y", "--fx-origin", "--fx-rx", "--fx-ry", "--fx-scale", "--fx-bg-scale", "--fx-blur"].forEach((k) => el.style.removeProperty(k));
    };
  });
})();
