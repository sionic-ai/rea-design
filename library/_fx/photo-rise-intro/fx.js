(() => {
  // Original (a terrace site Hero key visual): a dark ink logo rises on an empty white panel, then a line of text above it opens from the left,
  // In 4.5s the photo fills up from below to cover the panel, and the logo·text switch to the color over the photo (white). Once attached it runs once immediately — timing tied into a single calc in fx.css
  kfFx.register("photo-rise-intro", (el, { options, reduce }) => {
    const t = reduce ? 0 : +(options.scale ?? 1);
    el.style.setProperty("--fx-t", String(t));
    void el.offsetWidth;
    el.classList.add("is-fx-in");
    return () => { el.classList.remove("is-fx-in"); el.style.removeProperty("--fx-t"); };
  });
})();
