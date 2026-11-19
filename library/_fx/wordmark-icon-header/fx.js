// The transparent header bar over the Hero photo becomes a panel when it passes offset px before the Hero’s bottom edge, the wordmark folds horizontally and vanishes, and a small icon pops up.
// The baseline is set at the hero end rather than at N px down, so that even when the hero height (100vh·720px) differs per page, it switches right at the spot after passing the whole photo
(() => {
  kfFx.register("wordmark-icon-header", (el, { options, scroller }) => {
    const box = scroller || window;
    const top = () => (scroller ? scroller.scrollTop : window.scrollY);
    if (String(options.state || "") === "solid") {
      el.setAttribute("data-solid", "");
      return () => el.removeAttribute("data-solid");
    }
    const bp = +(options.bp ?? 1024);
    const off = () => (innerWidth <= bp ? +(options["offset-sm"] ?? 100) : +(options.offset ?? 200));
    let line = 0;
    const measure = () => {
      const t = options.target ? document.querySelector(options.target) : null;
      line = t ? Math.max(0, t.offsetTop + t.offsetHeight - off()) : 0;
      check();
    };
    const check = () => el.toggleAttribute("data-solid", top() > line);
    const t = options.target ? document.querySelector(options.target) : null;
    const ro = t && "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    ro?.observe(t);
    measure();
    box.addEventListener("scroll", check, { passive: true });
    addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      box.removeEventListener("scroll", check);
      removeEventListener("resize", measure);
      el.removeAttribute("data-solid");
    };
  });
})();
