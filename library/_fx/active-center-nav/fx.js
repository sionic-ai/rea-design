// Of the two menus attached at both ends, the current page’s (or just-pressed) item slides to the center of the screen and settles, while the rest stay faint.
// Moves it the moment it is pressed, so during the page transition (fade) the menu is already centered
(() => {
  kfFx.register("active-center-nav", (el, { options }) => {
    const items = [...el.querySelectorAll('[data-fx-part="item"]')];
    if (!items.length) return;
    const wide = matchMedia(`(min-width: ${+(options.wide ?? 768)}px)`);
    const isCurrent = (it) => it.matches('[aria-current="page"], .is-current') || !!it.querySelector('[aria-current="page"]');
    // On first attach and when the width changes, place it in position immediately — the current page item must not slide to the center every time it opens
    let still = 0;
    const settle = () => {
      el.classList.add("is-still");
      cancelAnimationFrame(still);
      still = requestAnimationFrame(() => (still = requestAnimationFrame(() => el.classList.remove("is-still"))));
    };
    const arm = () => { settle(); el.classList.toggle("is-armed", wide.matches); };
    items.forEach((it) => it.classList.toggle("is-active", isCurrent(it)));
    arm();
    const ac = new AbortController();
    items.forEach((it) => it.addEventListener("click", () => {
      items.forEach((x) => x.classList.toggle("is-active", x === it));
    }, { signal: ac.signal }));
    // Returning via the back button leaves the pressed position, so reset based on the current page
    addEventListener("pageshow", (e) => { if (!e.persisted) return; settle(); items.forEach((it) => it.classList.toggle("is-active", isCurrent(it))); }, { signal: ac.signal });
    wide.addEventListener("change", arm, { signal: ac.signal });
    return () => { ac.abort(); cancelAnimationFrame(still); el.classList.remove("is-armed", "is-still"); items.forEach((it) => it.classList.remove("is-active")); };
  });
})();
