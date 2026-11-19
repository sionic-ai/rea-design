// The initial look (photo board in place, side board out) is already set by css without is-in — once attached, add only is-in after delay seconds and the css transition meshes
(() => {
  kfFx.register("panel-meet-intro", (el, { options, reduce }) => {
    const delay = +(options.delay ?? 0.6) * 1000;
    if (reduce) { el.classList.add("is-in"); return () => el.classList.remove("is-in"); }
    const t = setTimeout(() => el.classList.add("is-in"), delay);
    return () => { clearTimeout(t); el.classList.remove("is-in"); };
  });
})();
