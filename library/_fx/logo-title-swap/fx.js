// Center logo slot in the header — after a moment the logo slides up and the page title rises in, and after that scrolling down shows the title and scrolling up shows the logo
(() => {
  kfFx.register("logo-title-swap", (el, { options, reduce }) => {
    if (!el.querySelector('[data-fx-part="logo"]') || !el.querySelector('[data-fx-part="title"]')) return;
    const delay = +(options.delay ?? 2), dur = options.dur;
    if (dur != null) el.style.setProperty("--fx-dur", `${+dur}s`);
    if (reduce) { el.classList.add("is-title"); return () => el.classList.remove("is-title"); }
    let last = scrollY, held = false;
    const onScroll = () => {
      const y = scrollY;
      if (!held && y !== last) el.classList.toggle("is-title", last < y && y > 0);
      last = y;
    };
    // Don’t watch scroll direction for the first moment — the original follows direction only after switching to the name after 2 seconds
    held = true;
    const t = setTimeout(() => { held = false; el.classList.add("is-title"); last = scrollY; }, delay * 1000);
    addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); removeEventListener("scroll", onScroll); el.classList.remove("is-title"); el.style.removeProperty("--fx-dur"); };
  });
})();
