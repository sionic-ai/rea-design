// About — paragraphs rise one after another, and hovering a chosen work row makes that work’s photo window follow the cursor (original about.js · portfolio-ending.js)
(() => {
  document.body.classList.add("at-ready");
  const enter = () => requestAnimationFrame(() => requestAnimationFrame(() => { document.body.classList.add("at-in"); abSite.watch(); }));
  abSite.revealed.then(enter);
  const list = document.querySelector(".at-list"), view = document.querySelector(".at-preview");
  if (!list || !view || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, raf = 0;
  const draw = () => {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    view.style.left = `${x}px`;
    view.style.top = `${y}px`;
    raf = Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 ? requestAnimationFrame(draw) : 0;
  };
  list.addEventListener("pointermove", (e) => {
    const hw = view.offsetWidth / 2, hh = view.offsetHeight / 2;
    tx = Math.max(hw + 12, Math.min(innerWidth - hw - 12, e.clientX));
    ty = Math.max(hh + 12, Math.min(innerHeight - hh - 12, e.clientY));
    if (!raf) raf = requestAnimationFrame(draw);
  }, { passive: true });
  [...list.querySelectorAll("a")].forEach((a, i) => {
    const show = () => { view.style.setProperty("--i", i); view.classList.add("is-on"); };
    a.addEventListener("pointerenter", show);
    a.addEventListener("focus", show);
  });
  list.addEventListener("pointerleave", () => view.classList.remove("is-on"));
  list.addEventListener("focusout", (e) => { if (!list.contains(e.relatedTarget)) view.classList.remove("is-on"); });
})();
