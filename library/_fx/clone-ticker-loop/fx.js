(() => {
  kfFx.register("clone-ticker-loop", (el, { reduce }) => {
    const lists = [...el.children].filter((c) => c.matches('[data-fx-part="track"]'));
    if (!lists.length) return;
    // As in the original, the same row is appended until the strip exceeds 1.5 times the screen width — each row flows its own width (-100%) so there is no seam
    const clones = [];
    const fill = () => {
      clones.splice(0).forEach((c) => c.remove());
      let w = lists.reduce((s, l) => s + l.scrollWidth, 0);
      if (!w) return;
      const add = (src) => { const c = src.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.dataset.fxClone = ""; el.append(c); clones.push(c); w += c.scrollWidth; };
      if (lists.length === 1 || w < innerWidth) add(lists[0]);
      let guard = 0;
      while (w < innerWidth * 1.5 && guard++ < 40) lists.forEach(add);
    };
    fill();
    el.classList.add("is-fx-run");
    if (reduce) el.classList.add("is-fx-still");
    let t = 0;
    const onResize = () => { clearTimeout(t); t = setTimeout(fill, 200); };
    addEventListener("resize", onResize);
    return () => {
      removeEventListener("resize", onResize);
      clearTimeout(t);
      clones.forEach((c) => c.remove());
      el.classList.remove("is-fx-run", "is-fx-still");
    };
  });
})();
