// Decide the state by scroll direction inside the band around a mark — passing downward gives that mark’s value, passing upward gives the previous mark’s.
// Outside the strip the state is left as is, so wherever you are between markers, the color of the last marker passed remains (original Brand background change)
(() => {
  kfFx.register("mark-pass-tone", (el, { options, scroller }) => {
    const marks = () => [...el.querySelectorAll("[data-fx-part=mark]")];
    if (!marks().length) return;
    const attr = options.attr || "data-tone";
    const narrow = matchMedia("(max-width: 767px)");
    const band = () => (narrow.matches && options["band-narrow"] != null ? +options["band-narrow"] : +(options.band ?? 100));
    const view = scroller || window;
    const pos = () => (scroller ? scroller.scrollTop : scrollY);
    const topOf = (m) => m.getBoundingClientRect().top + (scroller ? scroller.scrollTop - scroller.getBoundingClientRect().top : scrollY);
    const keyOf = (m, i) => m.dataset.key ?? String(i + 1);
    let last = pos(), now = el.getAttribute(attr), raf = 0;
    const veils = () => [...el.querySelectorAll("[data-fx-part=veil]")];
    const paint = () => veils().forEach((v) => v.classList.toggle("is-on", now != null && (v.dataset.key || "").split(/\s+/).includes(now)));
    const set = (k) => {
      if (k === now) return;
      now = k;
      k == null ? el.removeAttribute(attr) : el.setAttribute(attr, k);
      paint();
      el.dispatchEvent(new CustomEvent("fx:tone", { detail: { tone: k } }));
    };
    const check = () => {
      raf = 0;
      const s = pos(), b = band();
      if (s === last) return;
      const down = s > last;
      marks().forEach((m, i, all) => {
        if (Math.abs(s - topOf(m)) > b) return;
        set(down ? keyOf(m, i) : i ? keyOf(all[i - 1], i - 1) : null);
      });
      last = s;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    view.addEventListener("scroll", onScroll, { passive: true });
    paint();
    return () => {
      view.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      el.removeAttribute(attr);
      veils().forEach((v) => v.classList.remove("is-on"));
    };
  });
})();
