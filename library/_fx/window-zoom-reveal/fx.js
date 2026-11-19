// The section’s top edge rises like a window frame to reveal a photo pinned to the screen, and while scrolling down one more screen height the photo settles from 1.3x to its own size.
// When the next section’s content rises over the photo and covers it, the photo is pushed up 30% (progress squared, so it speeds up toward the end)
(() => {
  kfFx.register("window-zoom-reveal", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector('[data-fx-part="stage"]'), photo = el.querySelector('[data-fx-part="photo"]');
    if (!stage || !photo) return;
    const from = +(options.from ?? 1.3), drift = +(options.drift ?? 5), lift = +(options.lift ?? 30), hold = +(options.hold ?? 150);
    let spacer = el.querySelector('[data-fx-part="spacer"]'), made = false;
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.setAttribute("aria-hidden", "true");
      stage.after(spacer);
      made = true;
    }
    el.classList.add("fx-wzr");
    spacer.classList.add("fx-wzr-spacer");
    el.style.setProperty("--fx-hold", hold + "vh");
    const set = (tb, bt) => {
      photo.style.transform = `translate3d(0, ${drift - tb * drift - bt * bt * lift}%, 0) scale(${from - tb * (from - 1)})`;
    };
    if (reduce) { set(1, 0); return () => { photo.style.transform = ""; el.classList.remove("fx-wzr"); el.style.removeProperty("--fx-hold"); spacer.classList.remove("fx-wzr-spacer"); made && spacer.remove(); }; }
    let tb = 0, bt = 0;
    const st1 = ScrollTrigger.create({ trigger: spacer, scroller, start: "top bottom", end: "bottom top", onUpdate: (s) => { tb = s.progress; set(tb, bt); } });
    const st2 = ScrollTrigger.create({ trigger: spacer, scroller, start: "bottom bottom", end: "bottom top", onUpdate: (s) => { bt = s.progress; set(tb, bt); } });
    set(st1.progress, st2.progress);
    return () => {
      st1.kill(); st2.kill();
      photo.style.transform = "";
      el.classList.remove("fx-wzr");
      el.style.removeProperty("--fx-hold");
      spacer.classList.remove("fx-wzr-spacer");
      if (made) spacer.remove();
    };
  });
})();
