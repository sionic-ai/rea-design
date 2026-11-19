(() => {
  // Original: top = Position ÷ (document height − screen height) × 93%
  kfFx.register("rail-dot", (el, { options, scroller }) => {
    let dot = el.querySelector(':scope > [data-fx-part="dot"]');
    const made = !dot;
    if (made) { dot = document.createElement("span"); dot.setAttribute("data-fx-part", "dot"); el.append(dot); }
    const max = +(options.max ?? 93);
    const box = scroller || null;
    const draw = () => {
      const y = box ? box.scrollTop : scrollY;
      const span = box ? box.scrollHeight - box.clientHeight : document.body.clientHeight - innerHeight;
      dot.style.top = `${span > 0 ? Math.min(y / span, 1) * max : 0}%`;
    };
    const target = box || window;
    target.addEventListener("scroll", draw, { passive: true });
    addEventListener("resize", draw);
    draw();
    return () => { target.removeEventListener("scroll", draw); removeEventListener("resize", draw); if (made) dot.remove(); else dot.style.removeProperty("top"); };
  });
})();
