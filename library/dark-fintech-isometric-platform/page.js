// Token: draws the ring graph shares split in proportion (a still image — the original doesn’t move either). The press on the last panel row is handled by the part (balloon-line-press).
(() => {
  const segs = [...document.querySelectorAll(".db-donut__seg")];
  const C = 2 * Math.PI * 70;
  let at = 0;
  segs.forEach((s) => {
    const len = (C * +s.dataset.share) / 100;
    s.setAttribute("stroke-dasharray", `${Math.max(0, len - 2)} ${C}`);
    s.setAttribute("stroke-dashoffset", -at);
    at += len;
  });
  window.DB.ready();
})();
