(() => {
  kfFx.register("smoke-rise-loop", (el, { options, reduce }) => {
    const wisp = el.querySelector(':scope > [data-fx-part="wisp"]');
    if (!wisp) return;
    const dur = +(options.dur ?? 18), join = +(options.join ?? 8.5), rise = +(options.rise ?? 940);
    el.style.setProperty("--fx-dur", `${dur}s`);
    el.style.setProperty("--fx-rise", `${rise}px`);
    let twin = null;
    const t = !reduce && join > 0 ? setTimeout(() => {
      twin = wisp.cloneNode(true);
      twin.classList.add("fx-sr-2");
      twin.setAttribute("aria-hidden", "true");
      el.append(twin);
    }, join * 1000) : 0;
    return () => {
      clearTimeout(t);
      twin?.remove();
      el.style.removeProperty("--fx-dur");
      el.style.removeProperty("--fx-rise");
    };
  });
})();
