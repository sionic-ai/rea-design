// The original turns on the cell logo only after the app is fully attached (after load) — before that the cell is off. The part is attached at load to turn on at the same time
(() => {
  const mark = document.querySelector(".bx-home__main .bx-mark[data-mark-fx]");
  if (!mark) return;
  const go = () => mark.setAttribute("data-fx", "cell-scatter-fade");
  if (document.readyState === "complete") go();
  else addEventListener("load", go, { once: true });
})();
