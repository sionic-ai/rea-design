// On phones you can’t hover, so the open panel can’t be seen — the original shows the open state for 1 second on tap at 767px and below, then moves on
(() => {
  kfFx.register("gate-widen-panels", (el, { options, reduce }) => {
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (!panels.length) return;
    const wait = reduce ? 0 : +(options.tap ?? 1000);
    const narrow = matchMedia(`(max-width: ${+(options.narrow || 767)}px)`);
    let timer;
    const onClick = (e) => {
      const a = e.target.closest('[data-fx-part="panel"]');
      if (!a || !el.contains(a) || !narrow.matches || !wait || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
      const href = a.getAttribute("href");
      if (!href) return;
      e.preventDefault();
      panels.forEach((p) => p.classList.toggle("is-on", p === a));
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (a.target === "_blank") window.open(a.href, "_blank");
        else location.href = a.href;
      }, wait);
    };
    el.addEventListener("click", onClick);
    return () => { el.removeEventListener("click", onClick); clearTimeout(timer); panels.forEach((p) => p.classList.remove("is-on")); };
  });
})();
