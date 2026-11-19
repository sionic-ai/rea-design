// Shared by ceremony sections — view gallery photos large with PhotoSwipe 4.1.2 (original option history: 1, the rest defaults).
// Instead of original photos, draws placeholder images of the same size (data-size) in skin colors and passes them along.
(() => {
  const figs = [...document.getElementsByClassName("js-photoswipe")];
  const pswpEl = document.querySelector(".pswp");
  if (!figs.length || !pswpEl || !window.PhotoSwipe) return;
  const css = getComputedStyle(document.documentElement);
  const fill = css.getPropertyValue("--wf-fill").trim();
  const ink = css.getPropertyValue("--wf-fill-ink").trim();
  const line = css.getPropertyValue("--wf-line").trim();
  const esc = (s) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]);
  const placeholder = (w, h, label) =>
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
      `<rect width="100%" height="100%" fill="${fill}"/><path d="M0 0L${w} ${h}M${w} 0L0 ${h}" stroke="${line}"/>` +
      `<text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="18" fill="${ink}">${esc(label)}</text></svg>`);
  const items = figs.map((fig) => {
    const a = fig.children[0];
    const [w, h] = a.getAttribute("data-size").split("x").map(Number);
    const label = a.querySelector("[data-label]")?.dataset.label || "";
    const src = placeholder(w, h, label);
    return { src, msrc: src, w, h, el: fig, title: label };
  });
  const open = (index) => {
    const g = new PhotoSwipe(pswpEl, PhotoSwipeUI_Default, items, {
      index,
      history: 1,
      getThumbBoundsFn: (i) => {
        const r = items[i].el.getBoundingClientRect();
        return { x: r.left, y: r.top + scrollY, w: r.width };
      },
    });
    g.init();
  };
  figs.forEach((fig, i) => fig.children[0].addEventListener("click", (e) => { e.preventDefault(); open(i); }));
})();
